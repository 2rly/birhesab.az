import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Oturaq", factor: 1.2 },
  { id: "light", label: "Yüngül", factor: 1.375 },
  { id: "moderate", label: "Orta", factor: 1.55 },
  { id: "active", label: "Aktiv", factor: 1.725 },
  { id: "very_active", label: "Çox aktiv", factor: 1.9 },
];

export function CalorieCalculator() {
  const { colors } = useTheme();
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");

  const result = useMemo(() => {
    const a = parseInt(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!a || a <= 0 || !h || h <= 0 || !w || w <= 0) return null;

    const bmr =
      gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;

    const actLevel = ACTIVITY_LEVELS.find((l) => l.id === activity)!;
    const tdee = bmr * actLevel.factor;

    const adj = goal === "lose" ? -500 : goal === "gain" ? 500 : 0;
    const target = Math.max(1200, tdee + adj);

    const proteinG = (target * 0.3) / 4;
    const carbsG = (target * 0.4) / 4;
    const fatG = (target * 0.3) / 9;
    const waterL = (w * 33) / 1000;

    return { bmr, tdee, target, proteinG, carbsG, fatG, waterL };
  }, [gender, age, height, weight, activity, goal]);

  return (
    <View>
      <SegmentControl
        label="Cins"
        options={[
          { value: "male", label: "Kişi" },
          { value: "female", label: "Qadın" },
        ]}
        selected={gender}
        onSelect={setGender}
      />
      <InputField label="Yaş" value={age} onChangeText={setAge} placeholder="30" keyboardType="numeric" />
      <InputField label="Boy (sm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="decimal-pad" suffix="sm" />
      <InputField label="Çəki (kq)" value={weight} onChangeText={setWeight} placeholder="75" keyboardType="decimal-pad" suffix="kq" />

      <Text style={[styles.sectionLabel, { color: colors.n700 }]}>Aktivlik səviyyəsi</Text>
      <View style={styles.chipRow}>
        {ACTIVITY_LEVELS.map((l) => (
          <Pressable
            key={l.id}
            style={[styles.chip, { backgroundColor: colors.n240 }, activity === l.id && { backgroundColor: colors.accent }]}
            onPress={() => setActivity(l.id)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, activity === l.id && { color: colors.onAccent }]}>
              {l.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SegmentControl
        label="Hədəf"
        options={[
          { value: "lose", label: "Arıqlamaq" },
          { value: "maintain", label: "Saxlamaq" },
          { value: "gain", label: "Kilo almaq" },
        ]}
        selected={goal}
        onSelect={setGoal}
      />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow label="Gündəlik hədəf kalori" value={`${Math.round(result.target)} kkal`} highlight bold />
            <ResultRow label="BMR (istirahədə)" value={`${Math.round(result.bmr)} kkal`} />
            <ResultRow label="TDEE (ümumi xərc)" value={`${Math.round(result.tdee)} kkal`} />
            <ResultRow label="Su norması" value={`${result.waterL.toFixed(1)} litr / gün`} />
          </ResultSection>
          <ResultSection title="Makronutrient paylanması">
            <ResultRow label="Protein (30%)" value={`${Math.round(result.proteinG)} q`} />
            <ResultRow label="Karbohidrat (40%)" value={`${Math.round(result.carbsG)} q`} />
            <ResultRow label="Yağ (30%)" value={`${Math.round(result.fatG)} q`} />
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },
});
