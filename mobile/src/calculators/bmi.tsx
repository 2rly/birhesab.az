import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Çəki çatışmazlığı", color: "#3b82f6" };
  if (bmi < 25) return { label: "Normal çəki", color: "#22c55e" };
  if (bmi < 30) return { label: "Artıq çəki", color: "#f59e0b" };
  if (bmi < 35) return { label: "I dərəcə piylənmə", color: "#f97316" };
  if (bmi < 40) return { label: "II dərəcə piylənmə", color: "#ef4444" };
  return { label: "III dərəcə piylənmə", color: "#dc2626" };
}

export function BmiCalculator() {
  const { colors } = useTheme();
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");

  const result = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (w <= 0 || h <= 0) return null;

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    const category = getBmiCategory(bmi);
    const idealMin = 18.5 * heightM * heightM;
    const idealMax = 24.9 * heightM * heightM;

    return { bmi, category, idealMin, idealMax };
  }, [weight, height]);

  return (
    <View>
      <InputField
        label="Çəki"
        value={weight}
        onChangeText={setWeight}
        placeholder="70"
        keyboardType="decimal-pad"
        suffix="kq"
      />
      <InputField
        label="Boy"
        value={height}
        onChangeText={setHeight}
        placeholder="170"
        keyboardType="decimal-pad"
        suffix="sm"
      />

      {result && (
        <>
          <View style={[styles.bmiResult, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.bmiValue, { color: colors.n960 }]}>
              {result.bmi.toFixed(1)}
            </Text>
            <Text style={[styles.bmiCategory, { color: result.category.color }]}>
              {result.category.label}
            </Text>
          </View>

          <ResultSection title="Ətraflı">
            <ResultRow label="BMI indeksi" value={result.bmi.toFixed(2)} bold />
            <ResultRow label="Kateqoriya" value={result.category.label} />
            <ResultRow
              label="İdeal çəki aralığı"
              value={`${result.idealMin.toFixed(1)} – ${result.idealMax.toFixed(1)} kq`}
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bmiResult: {
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  bmiValue: { fontSize: 48, fontWeight: "800" },
  bmiCategory: { fontSize: 16, fontWeight: "600", marginTop: 4 },
});
