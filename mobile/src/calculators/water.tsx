import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Checkbox } from "@/components/Controls";
import { InfoBox, BulletList, FormulaSection, RelatedCalculators } from "@/components/Content";
import { ListCard, ListRow, TileGrid, StatTiles, BigResult, EmptyState } from "./_health-parts";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Climate = "cold" | "moderate" | "hot" | "very_hot";

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; icon: string; factor: number; description: string }[] = [
  { id: "sedentary", label: "Oturaq", icon: "🪑", factor: 1.0, description: "Masa arxasında iş, az hərəkət" },
  { id: "light", label: "Yüngül", icon: "🚶", factor: 1.1, description: "Həftədə 1–3 gün yüngül idman" },
  { id: "moderate", label: "Orta", icon: "🏃", factor: 1.25, description: "Həftədə 3–5 gün idman" },
  { id: "active", label: "Aktiv", icon: "🏋️", factor: 1.4, description: "Həftədə 6–7 gün ağır idman" },
  { id: "very_active", label: "Çox aktiv", icon: "⚡", factor: 1.6, description: "Gündə 2+ saat intensiv idman" },
];

const CLIMATES: { id: Climate; label: string; icon: string; factor: number; description: string }[] = [
  { id: "cold", label: "Soyuq", icon: "❄️", factor: 0.9, description: "< 10°C" },
  { id: "moderate", label: "Mülayim", icon: "🌤️", factor: 1.0, description: "10–25°C" },
  { id: "hot", label: "İsti", icon: "☀️", factor: 1.15, description: "25–35°C" },
  { id: "very_hot", label: "Çox isti", icon: "🔥", factor: 1.3, description: "35°C+" },
];

const GLASS_ML = 250;

const WATER_SCHEDULE = [
  { time: "07:00", label: "Oyananda (acqarına)", icon: "🌅", percent: 10 },
  { time: "08:00", label: "Səhər yeməyindən əvvəl", icon: "☕", percent: 8 },
  { time: "10:00", label: "Səhər ara", icon: "🕙", percent: 12 },
  { time: "12:00", label: "Nahardan əvvəl", icon: "🕛", percent: 10 },
  { time: "14:00", label: "Nahardan sonra", icon: "☀️", percent: 12 },
  { time: "16:00", label: "Günortadan sonra", icon: "🕓", percent: 15 },
  { time: "18:00", label: "Axşam", icon: "🌆", percent: 13 },
  { time: "20:00", label: "Şam yeməyindən sonra", icon: "🌙", percent: 12 },
  { time: "22:00", label: "Yatmadan əvvəl", icon: "😴", percent: 8 },
];

const FORMULA_TITLE = "Gündəlik su norması necə hesablanır?";
const FORMULA_CONTENT = `Baza norma: Çəki (kq) × 33 ml

Əmsallar:
• Aktivlik: oturaq ×1.0, yüngül ×1.1, orta ×1.25, aktiv ×1.4, çox aktiv ×1.6
• İqlim: soyuq ×0.9, mülayim ×1.0, isti ×1.15, çox isti ×1.3

Əlavələr:
• İdman: hər 30 dəqiqə üçün +350 ml
• Kofein: hər fincan çay/qəhvə üçün +150 ml
• Hamiləlik: +300 ml
• Əmizdirmə: +700 ml

Ümumi norma: Baza × Aktivlik × İqlim + Əlavələr

Tövsiyə: Gün ərzində kiçik porsiyalarla, 200–300 ml aralıqla için.
Susuzluq hiss etməyi gözləməyin — susuzluq artıq dehidratasiyanın əlamətidir.
Sidik rəngi açıq sarı olmalıdır — tünd rəng dehidratsiyanı göstərir.`;

const CYAN = "#0891b2";

function fmt(n: number): string {
  return n.toFixed(1);
}

export function WaterCalculator() {
  const { colors } = useTheme();
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<Climate>("moderate");
  const [exerciseMin, setExerciseMin] = useState("");
  const [caffeineCount, setCaffeineCount] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;

    const actLevel = ACTIVITY_LEVELS.find((l) => l.id === activity)!;
    const climateLevel = CLIMATES.find((c) => c.id === climate)!;

    const baseMl = w * 33;
    let totalMl = baseMl * actLevel.factor;
    totalMl *= climateLevel.factor;

    const exMin = parseInt(exerciseMin) || 0;
    const exerciseExtra = Math.round(exMin / 30) * 350;
    totalMl += exerciseExtra;

    const caffeine = parseInt(caffeineCount) || 0;
    const caffeineExtra = caffeine * 150;
    totalMl += caffeineExtra;

    let pregnancyExtra = 0;
    if (isPregnant) {
      pregnancyExtra = 300;
      totalMl += pregnancyExtra;
    }
    let breastfeedingExtra = 0;
    if (isBreastfeeding) {
      breastfeedingExtra = 700;
      totalMl += breastfeedingExtra;
    }

    const totalL = totalMl / 1000;
    const glasses = Math.ceil(totalMl / GLASS_ML);

    return {
      baseMl,
      totalMl,
      totalL,
      glasses,
      exerciseExtra,
      caffeineExtra,
      pregnancyExtra,
      breastfeedingExtra,
      minL: (w * 25) / 1000,
      maxL: (w * 45) / 1000,
      actLevel,
      climateLevel,
      weight: w,
    };
  }, [weight, activity, climate, exerciseMin, caffeineCount, isPregnant, isBreastfeeding]);

  const displayGlasses = result ? Math.min(12, result.glasses) : 0;

  return (
    <View>
      <InputField label="⚖️ Çəki (kq)" value={weight} onChangeText={setWeight} placeholder="75" keyboardType="decimal-pad" />
      <View style={styles.presets}>
        {[55, 65, 75, 85, 100].map((v) => (
          <Pressable key={v} onPress={() => setWeight(String(v))} style={[styles.preset, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.presetText, { color: colors.n760 }]}>{v} kq</Text>
          </Pressable>
        ))}
      </View>

      <TileGrid
        label="Fiziki aktivlik"
        columns={3}
        options={ACTIVITY_LEVELS.map((l) => ({ value: l.id, icon: l.icon, label: l.label }))}
        selected={activity}
        onSelect={setActivity}
      />

      <TileGrid
        label="İqlim / Hava temperaturu"
        columns={4}
        options={CLIMATES.map((c) => ({ value: c.id, icon: c.icon, label: c.label, sub: c.description }))}
        selected={climate}
        onSelect={setClimate}
        activeColor={() => "#06b6d4"}
      />

      <InputField
        label="🏃 Gündəlik idman (dəqiqə)"
        value={exerciseMin}
        onChangeText={setExerciseMin}
        placeholder="0"
        keyboardType="number-pad"
        hint="Hər 30 dəq üçün +350 ml"
      />
      <InputField
        label="☕ Çay/Qəhvə (fincan/gün)"
        value={caffeineCount}
        onChangeText={setCaffeineCount}
        placeholder="0"
        keyboardType="number-pad"
        hint="Hər fincan üçün +150 ml"
      />

      <Checkbox label="🤰 Hamiləyəm (+300 ml)" checked={isPregnant} onChange={setIsPregnant} />
      <Checkbox label="🍼 Əmizdirirəm (+700 ml)" checked={isBreastfeeding} onChange={setIsBreastfeeding} />

      <View style={{ height: 16 }} />

      {result ? (
        <View style={{ gap: 14 }}>
          <BigResult
            label="Gündəlik su normanız"
            value={fmt(result.totalL)}
            unit="litr / gün"
            color={CYAN}
            extra={`${Math.round(result.totalMl)} ml  •  ${result.glasses} stəkan`}
          />

          <View style={[styles.glassBox, { backgroundColor: CYAN + "14", borderColor: CYAN + "55" }]}>
            <Text style={[styles.glassTitle, { color: CYAN }]}>
              {result.glasses} stəkan (hər biri {GLASS_ML} ml)
            </Text>
            <View style={styles.glasses}>
              {Array.from({ length: displayGlasses }).map((_, i) => (
                <Text key={i} style={{ fontSize: 24 }}>
                  💧
                </Text>
              ))}
              {result.glasses > 12 && <Text style={[styles.more, { color: CYAN }]}>+{result.glasses - 12}</Text>}
            </View>
          </View>

          <StatTiles
            items={[
              { label: "Baza norma", value: `${fmt(result.baseMl / 1000)} L`, unit: `${result.weight} kq × 33 ml` },
              { label: "Minimum", value: `${fmt(result.minL)} L`, unit: "25 ml/kq" },
              { label: "Maksimum", value: `${fmt(result.maxL)} L`, unit: "45 ml/kq" },
            ]}
          />

          <ListCard title="📋 Hesablamanın tərkibi">
            <ListRow label={`Baza (${result.weight} kq × 33 ml)`} value={`${Math.round(result.baseMl)} ml`} />
            <ListRow
              label={`Aktivlik əmsalı (×${result.actLevel.factor})`}
              value={`${Math.round(result.baseMl * result.actLevel.factor)} ml`}
            />
            <ListRow
              label={`İqlim əmsalı (×${result.climateLevel.factor})`}
              value={
                result.climateLevel.factor !== 1
                  ? `${result.climateLevel.factor > 1 ? "+" : ""}${Math.round(
                      result.baseMl * result.actLevel.factor * (result.climateLevel.factor - 1)
                    )} ml`
                  : "0 ml"
              }
            />
            {result.exerciseExtra > 0 && <ListRow label="İdman əlavəsi" value={`+${result.exerciseExtra} ml`} valueColor={CYAN} />}
            {result.caffeineExtra > 0 && (
              <ListRow label="Kofein kompensasiyası" value={`+${result.caffeineExtra} ml`} valueColor={CYAN} />
            )}
            {result.pregnancyExtra > 0 && (
              <ListRow label="Hamiləlik əlavəsi" value={`+${result.pregnancyExtra} ml`} valueColor={CYAN} />
            )}
            {result.breastfeedingExtra > 0 && (
              <ListRow label="Əmizdirmə əlavəsi" value={`+${result.breastfeedingExtra} ml`} valueColor={CYAN} />
            )}
            <ListRow
              label="Ümumi gündəlik norma"
              value={`${Math.round(result.totalMl)} ml (${fmt(result.totalL)} L)`}
              active
              activeColor={CYAN}
              labelColor={CYAN}
              valueColor={CYAN}
            />
          </ListCard>

          <ListCard title="🕐 Gün ərzində su qəbulu cədvəli">
            {WATER_SCHEDULE.map((slot) => {
              const ml = Math.round((result.totalMl * slot.percent) / 100);
              const glasses = Math.round((ml / GLASS_ML) * 10) / 10;
              return (
                <ListRow
                  key={slot.time}
                  icon={`${slot.time}  ${slot.icon}`}
                  label={slot.label}
                  value={`${ml} ml`}
                  valueSub={`(${glasses} stəkan)`}
                />
              );
            })}
          </ListCard>

          <InfoBox variant="success" title="✅ Yaxşı hidratasiya əlamətləri">
            <BulletList
              items={["Sidik rəngi açıq sarı", "Dəri elastik və nəmli", "Enerji səviyyəsi yüksək", "Konsentrasiya yaxşı", "Baş ağrısı yoxdur"]}
            />
          </InfoBox>
          <InfoBox variant="danger" title="⚠️ Dehidratasiya əlamətləri">
            <BulletList
              items={["Sidik rəngi tünd sarı/narıncı", "Ağız quruluğu", "Baş ağrısı və yorğunluq", "Başgicəllənmə", "Quru dəri"]}
            />
          </InfoBox>
          <InfoBox variant="info" title="💡 Su içmə məsləhətləri">
            <BulletList
              items={[
                "Səhər oyananda 1 stəkan su için — metabolizmanı işə salır",
                "Yeməkdən 30 dəq əvvəl su için — həzmə kömək edir",
                "Susuzluq hiss etməyi gözləməyin — bu artıq gecdir",
                "Yanınızda su şüşəsi gəzdirin — xatırlatma rolunu oynayır",
                "Meyvə və tərəvəzlər də su təmin edir (xiyar ~95%, qarpız ~92%)",
                "Soyuq su deyil, otaq temperaturu su için — bədən daha asan qəbul edir",
              ]}
            />
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="💧" text="Nəticəni görmək üçün çəkinizi daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["bmi", "bmr", "ideal-weight", "pregnancy"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: -8, marginBottom: 16 },
  preset: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  presetText: { fontSize: 12, fontWeight: "600" },
  glassBox: { borderRadius: 12, borderWidth: 1, padding: 14 },
  glassTitle: { fontSize: 12, fontWeight: "600", textAlign: "center", marginBottom: 10 },
  glasses: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, alignItems: "center" },
  more: { fontSize: 13, marginLeft: 4 },
});
