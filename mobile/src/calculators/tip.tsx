import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const QUICK_TIPS = [5, 10, 15, 20];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function TipCalculator() {
  const { colors } = useTheme();
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState(10);
  const [people, setPeople] = useState(1);

  const result = useMemo(() => {
    const b = parseFloat(bill);
    if (!b || b <= 0) return null;

    const tipAmount = b * (tipPct / 100);
    const total = b + tipAmount;
    const perPerson = total / people;
    const tipPerPerson = tipAmount / people;

    const comparison = QUICK_TIPS.map((pct) => {
      const t = b * (pct / 100);
      return { pct, tip: t, total: b + t, perPerson: (b + t) / people };
    });

    return { tipAmount, total, perPerson, tipPerPerson, comparison };
  }, [bill, tipPct, people]);

  return (
    <View>
      <InputField label="Hesab məbləği" value={bill} onChangeText={setBill} placeholder="100" keyboardType="decimal-pad" suffix="₼" />

      <Text style={[styles.label, { color: colors.n700 }]}>Bahşiş faizi</Text>
      <View style={styles.chipRow}>
        {QUICK_TIPS.map((pct) => (
          <Pressable
            key={pct}
            style={[styles.chip, { backgroundColor: colors.n240 }, tipPct === pct && { backgroundColor: colors.accent }]}
            onPress={() => setTipPct(pct)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, tipPct === pct && { color: colors.onAccent }]}>
              {pct}%
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.n700 }]}>Nəfər sayı</Text>
      <View style={styles.counterRow}>
        <Pressable style={[styles.counterBtn, { backgroundColor: colors.n240 }]} onPress={() => setPeople(Math.max(1, people - 1))}>
          <Text style={[styles.counterBtnText, { color: colors.n840 }]}>−</Text>
        </Pressable>
        <Text style={[styles.counterValue, { color: colors.n940 }]}>{people}</Text>
        <Pressable style={[styles.counterBtn, { backgroundColor: colors.n240 }]} onPress={() => setPeople(people + 1)}>
          <Text style={[styles.counterBtnText, { color: colors.n840 }]}>+</Text>
        </Pressable>
      </View>

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow label={`Bahşiş (${tipPct}%)`} value={fmt(result.tipAmount)} />
            <ResultRow label="Ümumi məbləğ" value={fmt(result.total)} highlight bold />
            {people > 1 && (
              <>
                <ResultRow label="Hər nəfərə bahşiş" value={fmt(result.tipPerPerson)} />
                <ResultRow label="Hər nəfərə ümumi" value={fmt(result.perPerson)} bold />
              </>
            )}
          </ResultSection>
          <ResultSection title="Sürətli müqayisə">
            {result.comparison.map((c) => (
              <ResultRow
                key={c.pct}
                label={`${c.pct}%`}
                value={`${fmt(c.tip)} → ${fmt(c.total)}`}
                highlight={c.pct === tipPct}
              />
            ))}
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  chipText: { fontSize: 15, fontWeight: "700" },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  counterBtn: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  counterBtnText: { fontSize: 20, fontWeight: "700" },
  counterValue: { fontSize: 20, fontWeight: "700", minWidth: 30, textAlign: "center" },
});
