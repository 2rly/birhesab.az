import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { FormulaSection, RelatedCalculators } from "@/components/Content";

const QUICK_TIPS = [5, 10, 15, 20];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function pf(s: string): number {
  return parseFloat(s.replace(/\s/g, "").replace(",", "."));
}

const AMBER = "#f59e0b";
const GREEN = "#22c55e";

const pt = {
  formulaTitle: "Bahşiş necə hesablanır?",
  formulaContent: `Bahşiş məbləği = Hesab məbləği x (Bahşiş % / 100)
Ümumi məbləğ = Hesab məbləği + Bahşiş məbləği
Hər nəfərə düşən = Ümumi məbləğ / Nəfər sayı

Azərbaycanda bahşiş ənənəsi:
- Restoranlar: 5-15% (məbləğ hesaba daxil deyilsə)
- Taksi: yuvarlaqlaşdırma və ya 5-10%
- Otel xidmətləri: 2-5 AZN`,
  billAmount: "Hesab məbləği (AZN)",
  tipPercent: "Bahşiş faizi",
  customTipLabel: "Və ya xüsusi faiz daxil edin:",
  customTipPlaceholder: "Xüsusi %",
  numPeople: "Nəfər sayı",
  tipAmount: "Bahşiş məbləği",
  totalAmount: "Ümumi məbləğ",
  perPerson: "Hər nəfərə",
  perPersonUnit: "AZN / nəfər",
  breakdownTitle: "Hesab bölgüləri",
  billAmountLabel: "Hesab məbləği",
  tipLabel: "Bahşiş",
  totalLabel: "Ümumi",
  tipPerPerson: "Hər nəfərə düşən bahşiş",
  totalPerPerson: "Hər nəfərə düşən ümumi",
  comparisonTitle: "Sürətli müqayisə",
  compTip: "Bahşiş:",
  compTotal: "Ümumi:",
  compPerson: "Nəfər:",
  emptyStateText: "Nəticəni görmək üçün hesab məbləğini daxil edin.",
  people: "nəfər",
};

export function TipCalculator() {
  const { colors } = useTheme();
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("10");
  const [customTip, setCustomTip] = useState("");
  const [numPeople, setNumPeople] = useState("1");

  const effectiveTip = customTip ? pf(customTip) : pf(tipPercent);

  const result = useMemo(() => {
    const bill = pf(billAmount);
    const tip = effectiveTip;
    const people = parseInt(numPeople) || 1;

    if (!bill || bill <= 0 || !tip || tip < 0) return null;

    const tipAmount = bill * (tip / 100);
    const total = bill + tipAmount;
    const perPerson = total / people;
    const tipPerPerson = tipAmount / people;

    const comparison = QUICK_TIPS.map((pct) => {
      const t = bill * (pct / 100);
      return { percent: pct, tipAmount: t, total: bill + t, perPerson: (bill + t) / people };
    });

    return { bill, tipPercent: tip, tipAmount, total, perPerson, tipPerPerson, people, comparison };
  }, [billAmount, effectiveTip, numPeople]);

  const BRow = ({
    label,
    value,
    color,
    strong,
  }: {
    label: string;
    value: string;
    color?: string;
    strong?: boolean;
  }) => (
    <View
      style={[
        styles.bRow,
        { borderTopColor: colors.n280 },
        strong && color ? { backgroundColor: color + "1a" } : null,
      ]}
    >
      <Text style={[styles.bLabel, { color: strong ? color ?? colors.n940 : colors.n580 }, strong && styles.bold]}>
        {label}
      </Text>
      <Text style={[styles.bValue, { color: color ?? colors.n940 }, strong && styles.bold]}>{value}</Text>
    </View>
  );

  return (
    <View>
      <InputField
        label={pt.billAmount}
        value={billAmount}
        onChangeText={setBillAmount}
        placeholder="100"
        keyboardType="decimal-pad"
      />

      {/* Bahşiş faizi — sürətli düymələr */}
      <Text style={[styles.label, { color: colors.n700 }]}>{pt.tipPercent}</Text>
      <View style={styles.quickRow}>
        {QUICK_TIPS.map((pct) => {
          const active = !customTip && tipPercent === pct.toString();
          return (
            <Pressable
              key={pct}
              onPress={() => {
                setTipPercent(pct.toString());
                setCustomTip("");
              }}
              style={[
                styles.quickBtn,
                {
                  backgroundColor: active ? colors.accent + "22" : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.quickText, { color: colors.n940 }]}>{pct}%</Text>
            </Pressable>
          );
        })}
      </View>
      <InputField
        label={pt.customTipLabel}
        value={customTip}
        onChangeText={setCustomTip}
        placeholder={pt.customTipPlaceholder}
        keyboardType="decimal-pad"
      />

      {/* Nəfər sayı */}
      <Text style={[styles.label, { color: colors.n700 }]}>{pt.numPeople}</Text>
      <View style={styles.counterRow}>
        <Pressable
          style={[styles.counterBtn, { backgroundColor: colors.n240, borderColor: colors.n280 }]}
          onPress={() => setNumPeople(Math.max(1, (parseInt(numPeople) || 1) - 1).toString())}
        >
          <Text style={[styles.counterBtnText, { color: colors.n940 }]}>-</Text>
        </Pressable>
        <TextInput
          value={numPeople}
          onChangeText={setNumPeople}
          keyboardType="number-pad"
          style={[styles.counterInput, { backgroundColor: colors.n240, borderColor: colors.n280, color: colors.n940 }]}
        />
        <Pressable
          style={[styles.counterBtn, { backgroundColor: colors.n240, borderColor: colors.n280 }]}
          onPress={() => setNumPeople(((parseInt(numPeople) || 1) + 1).toString())}
        >
          <Text style={[styles.counterBtnText, { color: colors.n940 }]}>+</Text>
        </Pressable>
      </View>

      {result ? (
        <View>
          {/* Əsas kartlar */}
          <View style={styles.cards}>
            <View style={[styles.card, { backgroundColor: AMBER + "1a", borderColor: AMBER + "66" }]}>
              <Text style={[styles.cardLabel, { color: AMBER }]}>
                {pt.tipAmount} ({result.tipPercent}%)
              </Text>
              <Text style={[styles.cardValue, { color: AMBER }]}>{fmt(result.tipAmount)}</Text>
              <Text style={[styles.cardUnit, { color: AMBER }]}>AZN</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text style={[styles.cardLabel, { color: colors.onAccent, opacity: 0.85 }]}>{pt.totalAmount}</Text>
              <Text style={[styles.cardValue, { color: colors.onAccent }]}>{fmt(result.total)}</Text>
              <Text style={[styles.cardUnit, { color: colors.onAccent, opacity: 0.85 }]}>AZN</Text>
            </View>
            {result.people > 1 && (
              <View style={[styles.card, { backgroundColor: GREEN + "1a", borderColor: GREEN + "66" }]}>
                <Text style={[styles.cardLabel, { color: GREEN }]}>
                  {pt.perPerson} ({result.people} {pt.people})
                </Text>
                <Text style={[styles.cardValue, { color: GREEN }]}>{fmt(result.perPerson)}</Text>
                <Text style={[styles.cardUnit, { color: GREEN }]}>{pt.perPersonUnit}</Text>
              </View>
            )}
          </View>

          {/* Bölgü */}
          <View style={[styles.box, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <View style={[styles.boxHeader, { backgroundColor: colors.n240 }]}>
              <Text style={[styles.boxTitle, { color: colors.n940 }]}>{pt.breakdownTitle}</Text>
            </View>
            <BRow label={pt.billAmountLabel} value={`${fmt(result.bill)} AZN`} />
            <BRow label={`${pt.tipLabel} (${result.tipPercent}%)`} value={`+${fmt(result.tipAmount)} AZN`} color={AMBER} />
            <BRow label={pt.totalLabel} value={`${fmt(result.total)} AZN`} color={colors.accent} strong />
            {result.people > 1 && (
              <>
                <BRow label={pt.tipPerPerson} value={`${fmt(result.tipPerPerson)} AZN`} />
                <BRow label={pt.totalPerPerson} value={`${fmt(result.perPerson)} AZN`} color={GREEN} strong />
              </>
            )}
          </View>

          {/* Sürətli müqayisə */}
          <View style={[styles.box, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <View style={[styles.boxHeader, { backgroundColor: colors.n240 }]}>
              <Text style={[styles.boxTitle, { color: colors.n940 }]}>{pt.comparisonTitle}</Text>
            </View>
            {result.comparison.map((c) => {
              const isActive = c.percent === result.tipPercent;
              return (
                <View
                  key={c.percent}
                  style={[
                    styles.cmpRow,
                    { borderTopColor: colors.n280 },
                    isActive && { backgroundColor: colors.accent + "22" },
                  ]}
                >
                  <Text style={[styles.cmpPct, { color: colors.n940 }]}>{c.percent}%</Text>
                  <View style={styles.cmpVals}>
                    <Text style={[styles.cmpText, { color: colors.n580 }]}>
                      {pt.compTip} <Text style={{ color: AMBER, fontWeight: "600" }}>{fmt(c.tipAmount)}</Text>
                    </Text>
                    <Text style={[styles.cmpText, { color: colors.n580 }]}>
                      {pt.compTotal} <Text style={{ color: colors.accent, fontWeight: "600" }}>{fmt(c.total)}</Text>
                    </Text>
                    {result.people > 1 && (
                      <Text style={[styles.cmpText, { color: colors.n580 }]}>
                        {pt.compPerson} <Text style={{ color: colors.n940, fontWeight: "600" }}>{fmt(c.perPerson)}</Text>
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyStateText}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["discount", "percentage", "currency"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  quickBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  quickText: { fontSize: 18, fontWeight: "700" },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  counterBtn: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  counterBtnText: { fontSize: 20, fontWeight: "700" },
  counterInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  cards: { gap: 10, marginTop: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center" },
  cardLabel: { fontSize: 13, marginBottom: 4, textAlign: "center" },
  cardValue: { fontSize: 24, fontWeight: "700" },
  cardUnit: { fontSize: 12, marginTop: 2 },
  box: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 16 },
  boxHeader: { paddingHorizontal: 16, paddingVertical: 11 },
  boxTitle: { fontSize: 15, fontWeight: "600" },
  bRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  bLabel: { fontSize: 13, flex: 1 },
  bValue: { fontSize: 14, fontWeight: "500", textAlign: "right" },
  bold: { fontWeight: "700" },
  cmpRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cmpPct: { fontSize: 14, fontWeight: "600", minWidth: 40 },
  cmpVals: { flex: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", columnGap: 14, rowGap: 2 },
  cmpText: { fontSize: 13 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
