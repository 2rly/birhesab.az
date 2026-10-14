import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const FOODS = [
  { name: "Çörək", cal: 265 },
  { name: "Düyü (bişmiş)", cal: 130 },
  { name: "Toyuq döşü", cal: 165 },
  { name: "Mal əti", cal: 250 },
  { name: "Yumurta (1 ədəd)", cal: 78 },
  { name: "Süd", cal: 42 },
  { name: "Pendir", cal: 350 },
  { name: "Kərə yağı", cal: 717 },
  { name: "Pomidor", cal: 18 },
  { name: "Xiyar", cal: 15 },
  { name: "Kartof", cal: 77 },
  { name: "Alma", cal: 52 },
  { name: "Banan", cal: 89 },
  { name: "Bal", cal: 304 },
  { name: "Şəkər", cal: 387 },
  { name: "Zeytun yağı", cal: 884 },
  { name: "Qoz", cal: 654 },
  { name: "Qaymaq", cal: 340 },
];

export function FoodCalorieCalculator() {
  const { colors } = useTheme();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [grams, setGrams] = useState("100");

  const food = FOODS[selectedIdx];

  const result = useMemo(() => {
    const g = parseFloat(grams) || 0;
    if (g <= 0) return null;
    const calories = (food.cal / 100) * g;
    return { calories, calPer100g: food.cal };
  }, [grams, food]);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Məhsul seçin</Text>
      <View style={styles.foodGrid}>
        {FOODS.map((f, i) => (
          <Pressable
            key={f.name}
            style={[
              styles.foodChip,
              { backgroundColor: colors.n240 },
              selectedIdx === i && { backgroundColor: colors.accent },
            ]}
            onPress={() => setSelectedIdx(i)}
          >
            <Text
              style={[
                styles.foodChipText,
                { color: colors.n580 },
                selectedIdx === i && { color: colors.onAccent },
              ]}
            >
              {f.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <InputField label="Miqdar" value={grams} onChangeText={setGrams} placeholder="100" keyboardType="decimal-pad" suffix="qram" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Kalori" value={`${result.calories.toFixed(0)} kkal`} highlight bold />
          <ResultRow label="Məhsul" value={food.name} />
          <ResultRow label="100 qramda" value={`${result.calPer100g} kkal`} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  foodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  foodChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  foodChipText: { fontSize: 12, fontWeight: "500" },
});
