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
  const [bill, setBill] = useState("50");
  const [tipPct, setTipPct] = useState("10");
  const [people, setPeople] = useState("1");

  const result = useMemo(() => {
    const b = parseFloat(bill) || 0;
    const t = parseFloat(tipPct) || 0;
    const p = parseInt(people) || 1;
    if (b <= 0) return null;

    const tipAmount = b * (t / 100);
    const total = b + tipAmount;
    const perPerson = total / p;

    return { tipAmount, total, perPerson };
  }, [bill, tipPct, people]);

  return (
    <View>
      <InputField
        label="Hesab məbləği"
        value={bill}
        onChangeText={setBill}
        placeholder="50"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      <Text style={[styles.label, { color: colors.n700 }]}>Bahşiş faizi</Text>
      <View style={styles.quickRow}>
        {QUICK_TIPS.map((pct) => (
          <Pressable
            key={pct}
            style={[
              styles.quickChip,
              { backgroundColor: colors.n240 },
              tipPct === String(pct) && { backgroundColor: colors.accent },
            ]}
            onPress={() => setTipPct(String(pct))}
          >
            <Text
              style={[
                styles.quickText,
                { color: colors.n580 },
                tipPct === String(pct) && { color: colors.onAccent },
              ]}
            >
              {pct}%
            </Text>
          </Pressable>
        ))}
      </View>

      <InputField
        label="Xüsusi faiz"
        value={tipPct}
        onChangeText={setTipPct}
        placeholder="10"
        keyboardType="decimal-pad"
        suffix="%"
      />
      <InputField
        label="Nəfər sayı"
        value={people}
        onChangeText={setPeople}
        placeholder="1"
        keyboardType="numeric"
        suffix="nəfər"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label={`Bahşiş (${tipPct}%)`}
            value={fmt(result.tipAmount)}
          />
          <ResultRow
            label="Ümumi məbləğ"
            value={fmt(result.total)}
            highlight
            bold
          />
          {parseInt(people) > 1 && (
            <ResultRow
              label="Hər nəfərə"
              value={fmt(result.perPerson)}
              bold
            />
          )}
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  quickText: { fontSize: 14, fontWeight: "600" },
});
