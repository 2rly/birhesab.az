import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Sector = "private" | "state";

function calcPrivateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.03;
  if (gross <= 8000) return 75 + (gross - 2500) * 0.10;
  return 625 + (gross - 8000) * 0.14;
}
function calcStateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.14;
  return 350 + (gross - 2500) * 0.25;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

const CHILD_OPTIONS = [
  { id: 1, label: "1 uşaq", percent: 25 },
  { id: 2, label: "2 uşaq", percent: 33.3 },
  { id: 3, label: "3+ uşaq", percent: 50 },
];

export function AlimentCalculator() {
  const { colors } = useTheme();
  const [sector, setSector] = useState<Sector>("private");
  const [salary, setSalary] = useState("");
  const [childCount, setChildCount] = useState(1);

  const result = useMemo(() => {
    const gross = parseFloat(salary) || 0;
    if (gross <= 0) return null;

    const incomeTax = sector === "private" ? calcPrivateIncomeTax(gross) : calcStateIncomeTax(gross);
    const afterTax = gross - incomeTax;
    const child = CHILD_OPTIONS.find((c) => c.id === childCount)!;
    const aliment = afterTax * (child.percent / 100);
    const netSalary = afterTax - aliment;

    return { incomeTax, afterTax, aliment, netSalary, percent: child.percent };
  }, [sector, salary, childCount]);

  return (
    <View>
      <SegmentControl
        label="Sektor"
        options={[
          { value: "private", label: "Özəl" },
          { value: "state", label: "Dövlət" },
        ]}
        selected={sector}
        onSelect={setSector}
      />
      <InputField label="Aylıq əmək haqqı (gross)" value={salary} onChangeText={setSalary} placeholder="2000" keyboardType="decimal-pad" suffix="₼" />

      <Text style={[styles.label, { color: colors.n700 }]}>Uşaq sayı</Text>
      <View style={styles.chipRow}>
        {CHILD_OPTIONS.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, { backgroundColor: colors.n240 }, childCount === c.id && { backgroundColor: colors.accent }]}
            onPress={() => setChildCount(c.id)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, childCount === c.id && { color: colors.onAccent }]}>{c.label} ({c.percent}%)</Text>
          </Pressable>
        ))}
      </View>

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Gəlir vergisi" value={fmt(result.incomeTax)} />
          <ResultRow label="Vergidən sonra" value={fmt(result.afterTax)} />
          <ResultRow label={`Aliment (${result.percent}%)`} value={fmt(result.aliment)} highlight bold />
          <ResultRow label="Əlinizə çatan" value={fmt(result.netSalary)} bold />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },
});
