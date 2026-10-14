import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const RATES = [
  { id: "minimum", label: "Minimum (buğda)", amount: 5 },
  { id: "standard", label: "Standart (arpa)", amount: 7 },
  { id: "medium", label: "Orta (kişmiş)", amount: 12 },
  { id: "high", label: "Yüksək (xurma)", amount: 20 },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function ZakatCalculator() {
  const { colors } = useTheme();
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("2");
  const [rateIdx, setRateIdx] = useState(1);

  const rate = RATES[rateIdx];

  const result = useMemo(() => {
    const a = parseInt(adults) || 0;
    const c = parseInt(children) || 0;
    const total = a + c;
    if (total <= 0) return null;

    const totalFitre = total * rate.amount;
    return { adults: a, children: c, total, perPerson: rate.amount, totalFitre };
  }, [adults, children, rate]);

  return (
    <View>
      <View style={styles.chips}>
        {RATES.map((r, i) => (
          <Pressable
            key={r.id}
            style={[
              styles.chip,
              { backgroundColor: colors.n240 },
              rateIdx === i && { backgroundColor: colors.accent },
            ]}
            onPress={() => setRateIdx(i)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.n580 },
                rateIdx === i && { color: colors.onAccent },
              ]}
            >
              {r.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <InputField label="Böyüklər (18+)" value={adults} onChangeText={setAdults} placeholder="2" keyboardType="numeric" suffix="nəfər" />
      <InputField label="Uşaqlar" value={children} onChangeText={setChildren} placeholder="2" keyboardType="numeric" suffix="nəfər" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi fitrə zəkatı" value={fmt(result.totalFitre)} highlight bold />
          <ResultRow label="Ailə üzvü sayı" value={`${result.total} nəfər`} />
          <ResultRow label="Nəfər başına" value={fmt(result.perPerson)} />
          <ResultRow label="Böyüklər" value={`${result.adults} × ${fmt(result.perPerson)}`} />
          <ResultRow label="Uşaqlar" value={`${result.children} × ${fmt(result.perPerson)}`} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: "600" },
});
