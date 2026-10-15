import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { ListCard, ListRow, TileGrid, StatTiles, SegmentBar, BigResult, EmptyState, Caption } from "./_health-parts";

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type ActivityId = "sedentary" | "light" | "moderate" | "active" | "very_active";

const ACTIVITY_LEVELS: { id: ActivityId; label: string; factor: number; icon: string; description: string }[] = [
  { id: "sedentary", label: "Oturaq", factor: 1.2, icon: "🪑", description: "Masa arxasında iş, az hərəkət" },
  { id: "light", label: "Yüngül", factor: 1.375, icon: "🚶", description: "Həftədə 1–3 gün yüngül idman" },
  { id: "moderate", label: "Orta", factor: 1.55, icon: "🏃", description: "Həftədə 3–5 gün orta intensiv idman" },
  { id: "active", label: "Aktiv", factor: 1.725, icon: "🏋️", description: "Həftədə 6–7 gün ağır idman" },
  { id: "very_active", label: "Çox aktiv", factor: 1.9, icon: "⚡", description: "Gündə 2 dəfə idman / fiziki iş" },
];

const GOAL_OPTIONS: { value: Goal; label: string; icon: string; description: string; adjustment: number }[] = [
  { value: "lose", label: "Arıqlamaq", icon: "📉", description: "Həftədə ~0.5 kq itirmək", adjustment: -500 },
  { value: "maintain", label: "Çəkini saxlamaq", icon: "⚖️", description: "Hazırkı çəkini qorumaq", adjustment: 0 },
  { value: "gain", label: "Kilo almaq", icon: "📈", description: "Həftədə ~0.5 kq artırmaq", adjustment: 500 },
];

const GOAL_COLORS: Record<Goal, string> = { lose: "#3b82f6", maintain: "#22c55e", gain: "#f59e0b" };

const MACRO_SPLITS = [
  { label: "Balanslaşdırılmış", protein: 30, carbs: 40, fat: 30, description: "Ümumi sağlamlıq üçün" },
  { label: "Yüksək protein", protein: 40, carbs: 30, fat: 30, description: "Əzələ artımı / arıqlamaq" },
  { label: "Aşağı karbohidrat", protein: 30, carbs: 20, fat: 50, description: "Keto / low-carb rejimi" },
  { label: "Yüksək karbohidrat", protein: 20, carbs: 55, fat: 25, description: "Dözümlülük idmanları" },
];

const MEALS = [
  { label: "Səhər yeməyi", percent: 25, icon: "🌅", time: "07:00–09:00" },
  { label: "Ara qəlyanaltı", percent: 10, icon: "🍎", time: "10:30–11:00" },
  { label: "Nahar", percent: 35, icon: "☀️", time: "12:30–14:00" },
  { label: "Ara qəlyanaltı", percent: 10, icon: "🥜", time: "16:00–16:30" },
  { label: "Şam yeməyi", percent: 20, icon: "🌙", time: "19:00–20:00" },
];

const FORMULA_TITLE = "Kalori ehtiyacı necə hesablanır?";
const FORMULA_CONTENT = `BMR (Bazal Metabolizm Dərəcəsi) — Mifflin-St Jeor düsturu:
Kişi: BMR = 10 × çəki(kq) + 6.25 × boy(sm) − 5 × yaş + 5
Qadın: BMR = 10 × çəki(kq) + 6.25 × boy(sm) − 5 × yaş − 161

TDEE (Ümumi Gündəlik Enerji Xərci):
TDEE = BMR × Aktivlik əmsalı

Aktivlik əmsalları:
• Oturaq: ×1.2
• Yüngül: ×1.375
• Orta: ×1.55
• Aktiv: ×1.725
• Çox aktiv: ×1.9

Hədəf kalori:
• Arıqlamaq: TDEE − 500 kkal (həftədə ~0.5 kq)
• Saxlamaq: TDEE
• Kilo almaq: TDEE + 500 kkal (həftədə ~0.5 kq)

Makronutrientlər:
• 1 q protein = 4 kkal
• 1 q karbohidrat = 4 kkal
• 1 q yağ = 9 kkal`;

function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function CalorieCalculator() {
  const { colors } = useTheme();
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityId>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [selectedMacro, setSelectedMacro] = useState(0);

  const result = useMemo(() => {
    const a = parseInt(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(weight);
    if (!a || a <= 0 || !h || h <= 0 || !w || w <= 0) return null;

    const bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;

    const actLevel = ACTIVITY_LEVELS.find((l) => l.id === activity)!;
    const tdee = bmr * actLevel.factor;

    const goalInfo = GOAL_OPTIONS.find((g) => g.value === goal)!;
    const targetCalories = Math.max(1200, tdee + goalInfo.adjustment);

    const macro = MACRO_SPLITS[selectedMacro];
    const proteinCal = targetCalories * (macro.protein / 100);
    const carbsCal = targetCalories * (macro.carbs / 100);
    const fatCal = targetCalories * (macro.fat / 100);
    const proteinG = proteinCal / 4;
    const carbsG = carbsCal / 4;
    const fatG = fatCal / 9;

    const waterL = (w * 33) / 1000;

    // Harris-Benedict
    const bmrHB =
      gender === "male"
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;

    const weeklyChange = (goalInfo.adjustment * 7) / 7700;

    return { bmr, bmrHB, tdee, targetCalories, proteinG, carbsG, fatG, proteinCal, carbsCal, fatCal, waterL, weeklyChange, goalInfo };
  }, [gender, age, heightCm, weight, activity, goal, selectedMacro]);

  const macro = MACRO_SPLITS[selectedMacro];

  return (
    <View>
      <SegmentControl
        label="Cins"
        options={[
          { value: "male", label: "👨 Kişi" },
          { value: "female", label: "👩 Qadın" },
        ]}
        selected={gender}
        onSelect={setGender}
      />

      <InputField label="🎂 Yaş" value={age} onChangeText={setAge} placeholder="30" keyboardType="number-pad" />
      <InputField label="📏 Boy (sm)" value={heightCm} onChangeText={setHeightCm} placeholder="175" keyboardType="decimal-pad" />
      <InputField label="⚖️ Çəki (kq)" value={weight} onChangeText={setWeight} placeholder="75" keyboardType="decimal-pad" />

      <TileGrid
        label="Fiziki aktivlik səviyyəsi"
        columns={3}
        options={ACTIVITY_LEVELS.map((l) => ({ value: l.id, icon: l.icon, label: l.label, sub: `×${l.factor}` }))}
        selected={activity}
        onSelect={setActivity}
      />
      <View style={{ marginTop: -8, marginBottom: 16 }}>
        <Caption>{ACTIVITY_LEVELS.find((l) => l.id === activity)?.description}</Caption>
      </View>

      <TileGrid
        label="Hədəfiniz"
        columns={3}
        options={GOAL_OPTIONS.map((g) => ({ value: g.value, icon: g.icon, label: g.label, sub: g.description }))}
        selected={goal}
        onSelect={setGoal}
        activeColor={(v) => GOAL_COLORS[v]}
      />

      {result ? (
        <View style={{ gap: 14 }}>
          <BigResult
            label="Gündəlik hədəf kalori"
            value={fmt(result.targetCalories)}
            unit="kkal / gün"
            extra={
              goal !== "maintain"
                ? `${goal === "lose" ? "📉" : "📈"} Həftəlik dəyişiklik: ${result.weeklyChange > 0 ? "+" : ""}${result.weeklyChange.toFixed(2)} kg`
                : undefined
            }
          />

          <StatTiles
            items={[
              { label: "BMR (istirahətdə)", value: fmt(result.bmr), unit: "kkal / gün" },
              { label: "TDEE (ümumi xərc)", value: fmt(result.tdee), unit: "kkal / gün", color: "#d97706" },
              { label: "Su norması", value: result.waterL.toFixed(1), unit: "litr / gün", color: "#0891b2" },
            ]}
          />

          {/* Makronutrient paylanması */}
          <ListCard title="🥗 Makronutrient paylanması">
            <View style={[styles.pad, { borderBottomWidth: 1, borderBottomColor: colors.n280 }]}>
              <View style={styles.chips}>
                {MACRO_SPLITS.map((m, i) => {
                  const active = selectedMacro === i;
                  return (
                    <Pressable
                      key={m.label}
                      onPress={() => setSelectedMacro(i)}
                      style={[styles.chip, { backgroundColor: active ? colors.accent : colors.n240 }]}
                    >
                      <Text style={[styles.chipText, { color: active ? colors.onAccent : colors.n760 }]}>{m.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ marginTop: 8 }}>
                <Caption>{macro.description}</Caption>
              </View>
            </View>
            <View style={styles.pad}>
              <SegmentBar
                height={22}
                segments={[
                  { pct: macro.protein, color: "#f87171" },
                  { pct: macro.carbs, color: "#fbbf24" },
                  { pct: macro.fat, color: "#60a5fa" },
                ]}
              />
              <View style={styles.macroRow}>
                {[
                  { name: "Protein", color: "#f87171", g: result.proteinG, cal: result.proteinCal, pct: macro.protein },
                  { name: "Karbohidrat", color: "#fbbf24", g: result.carbsG, cal: result.carbsCal, pct: macro.carbs },
                  { name: "Yağ", color: "#60a5fa", g: result.fatG, cal: result.fatCal, pct: macro.fat },
                ].map((m) => (
                  <View key={m.name} style={styles.macroCol}>
                    <View style={styles.legend}>
                      <View style={[styles.dot, { backgroundColor: m.color }]} />
                      <Text style={[styles.tiny, { color: colors.n580 }]}>{m.name}</Text>
                    </View>
                    <Text style={[styles.macroValue, { color: colors.n940 }]}>{Math.round(m.g)}g</Text>
                    <Text style={[styles.tiny, { color: colors.n580, textAlign: "center" }]}>
                      {fmt(m.cal)} kkal ({m.pct}%)
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ListCard>

          {/* Aktivlik səviyyəsinə görə */}
          <ListCard title="📊 Aktivlik səviyyəsinə görə kalori ehtiyacı">
            {ACTIVITY_LEVELS.map((level) => {
              const tdee = result.bmr * level.factor;
              const target = Math.max(1200, tdee + result.goalInfo.adjustment);
              return (
                <ListRow
                  key={level.id}
                  icon={level.icon}
                  label={level.label}
                  sub={level.description}
                  value={`${fmt(target)} kkal`}
                  valueSub={`TDEE: ${fmt(tdee)}`}
                  active={level.id === activity}
                />
              );
            })}
          </ListCard>

          {/* Öğünlərə bölgü */}
          <ListCard title="🍽️ Öğünlərə bölgü (tövsiyə)">
            {MEALS.map((meal) => (
              <ListRow
                key={meal.label + meal.time}
                icon={meal.icon}
                label={meal.label}
                sub={meal.time}
                value={`${fmt((result.targetCalories * meal.percent) / 100)} kkal`}
                valueSub={`${meal.percent}%`}
              />
            ))}
          </ListCard>

          {/* Düstur müqayisəsi */}
          <View style={[styles.compareBox, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.tinyBold, { color: colors.n580, marginBottom: 10 }]}>Düstur müqayisəsi</Text>
            <View style={styles.compareRow}>
              <View style={[styles.compareCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <Text style={[styles.tiny, { color: colors.n580 }]}>Mifflin-St Jeor</Text>
                <Text style={[styles.compareValue, { color: colors.n940 }]}>{fmt(result.bmr)} kkal</Text>
                <Text style={[styles.tiny, { color: "#16a34a", textAlign: "center" }]}>Daha dəqiq (istifadə olunan)</Text>
              </View>
              <View style={[styles.compareCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <Text style={[styles.tiny, { color: colors.n580 }]}>Harris-Benedict</Text>
                <Text style={[styles.compareValue, { color: colors.n940 }]}>{fmt(result.bmrHB)} kkal</Text>
                <Text style={[styles.tiny, { color: colors.n580 }]}>Klassik düstur</Text>
              </View>
            </View>
          </View>

          <InfoBox variant="info" title="Diqqət:">
            Bu hesablama təxmini xarakter daşıyır. Faktiki kalori ehtiyacı metabolizm sürəti, genetika, stress səviyyəsi və digər amillərə görə fərqlənə bilər. Arıqlamaq və ya kilo alma proqramına başlamazdan əvvəl dietoloqa və ya həkimə müraciət edin. Gündəlik kalori 1200 kkal-dan aşağı düşməməlidir.
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🔥" text="Nəticəni görmək üçün yaş, boy və çəkinizi daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["bmi", "ideal-weight", "water-intake", "pregnancy"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 14, paddingVertical: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: "600" },
  macroRow: { flexDirection: "row", marginTop: 12 },
  macroCol: { flex: 1, alignItems: "center" },
  legend: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  macroValue: { fontSize: 17, fontWeight: "800" },
  tiny: { fontSize: 11 },
  tinyBold: { fontSize: 12, fontWeight: "600" },
  compareBox: { borderRadius: 12, padding: 14 },
  compareRow: { flexDirection: "row", gap: 8 },
  compareCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 10, alignItems: "center" },
  compareValue: { fontSize: 16, fontWeight: "800", marginVertical: 3 },
});
