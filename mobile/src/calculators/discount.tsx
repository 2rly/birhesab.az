import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";
import { ChipGroup } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";

type Mode = "calculate" | "find-percent" | "stacking";

const FORMULA_TITLE = "Endirim necə hesablanır?";
const FORMULA_CONTENT = `Endirim hesablaması:
Endirim məbləği = Qiymət x (Endirim % / 100)
Son qiymət = Qiymət - Endirim məbləği

Endirim faizi tapmaq:
Endirim % = ((İlkin qiymət - Son qiymət) / İlkin qiymət) x 100

Ardıcıl endirimlər:
2 endirim üst-üstə gəldikdə, hərəkətdə fərqli əsas qiymət istifadə olunur.
Məsələn: 100 AZN, 20% + 10% = 100 x 0.8 x 0.9 = 72 AZN (28% uyğun endirim, 30% deyil!)`;

const QUICK = [10, 20, 25, 30, 50, 70];
const AMBER = "#f59e0b";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function num(s: string): number {
  return parseFloat(s.replace(",", "."));
}

const stepLabel = (i: number, pct: number) => `${i === 0 ? "1-ci" : i === 1 ? "2-ci" : "3-cu"} endirim (${pct}%)`;

type CardKind = "neutral" | "amber" | "primary";

export function DiscountCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("calculate");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [discount1, setDiscount1] = useState("");
  const [discount2, setDiscount2] = useState("");
  const [discount3, setDiscount3] = useState("");

  const result = useMemo(() => {
    if (mode === "calculate") {
      const price = num(originalPrice);
      const disc = num(discountPercent);
      if (!price || price <= 0 || !disc) return null;
      const discountAmount = price * (disc / 100);
      const finalPrice = price - discountAmount;
      return { type: "calculate" as const, originalPrice: price, discountPercent: disc, discountAmount, finalPrice };
    }

    if (mode === "find-percent") {
      const orig = num(originalPrice);
      const sale = num(salePrice);
      if (!orig || orig <= 0 || !sale || sale < 0 || sale > orig) return null;
      const discountAmount = orig - sale;
      const discountPct = (discountAmount / orig) * 100;
      return { type: "find-percent" as const, originalPrice: orig, salePrice: sale, discountAmount, discountPct };
    }

    const price = num(originalPrice);
    const d1 = num(discount1) || 0;
    const d2 = num(discount2) || 0;
    const d3 = num(discount3) || 0;
    if (!price || price <= 0) return null;

    let current = price;
    const steps: { label: string; discount: number; price: number }[] = [];
    [d1, d2, d3].forEach((d, i) => {
      if (d > 0) {
        const disc = current * (d / 100);
        current -= disc;
        steps.push({ label: stepLabel(i, d), discount: disc, price: current });
      }
    });

    const totalSaved = price - current;
    const effectiveDiscount = (totalSaved / price) * 100;
    return { type: "stacking" as const, originalPrice: price, finalPrice: current, totalSaved, effectiveDiscount, steps };
  }, [mode, originalPrice, discountPercent, salePrice, discount1, discount2, discount3]);

  const card = (kind: CardKind, label: string, value: string, unit: string, strike = false) => {
    const bg = kind === "primary" ? colors.accent : kind === "amber" ? AMBER + "1a" : colors.n200;
    const border = kind === "primary" ? colors.accent : kind === "amber" ? AMBER + "66" : colors.n280;
    const fg = kind === "primary" ? colors.onAccent : kind === "amber" ? AMBER : colors.n940;
    const sub = kind === "primary" ? colors.onAccent : kind === "amber" ? AMBER : colors.n580;
    return (
      <View key={label} style={[styles.card, { backgroundColor: bg, borderColor: border }]}>
        <Text style={[styles.cardLabel, { color: sub }]}>{label}</Text>
        <Text style={[styles.cardValue, { color: fg }, strike && styles.strike]}>{value}</Text>
        <Text style={[styles.cardUnit, { color: sub }]}>{unit}</Text>
      </View>
    );
  };

  return (
    <View>
      <SegmentControl
        options={[
          { value: "calculate", label: "Endirim hesabla" },
          { value: "find-percent", label: "Faiz tap" },
          { value: "stacking", label: "Ardıcıl endirim" },
        ]}
        selected={mode}
        onSelect={setMode}
      />

      <InputField
        label="İlkin qiymət (AZN)"
        value={originalPrice}
        onChangeText={setOriginalPrice}
        placeholder="200"
        keyboardType="decimal-pad"
      />

      {mode === "calculate" && (
        <>
          <InputField
            label="Endirim faizi (%)"
            value={discountPercent}
            onChangeText={setDiscountPercent}
            placeholder="25"
            keyboardType="decimal-pad"
          />
          <ChipGroup
            options={QUICK.map((p) => ({ value: String(p), label: `${p}%` }))}
            selected={discountPercent}
            onSelect={setDiscountPercent}
          />
        </>
      )}

      {mode === "find-percent" && (
        <InputField
          label="Endirimli qiymət (AZN)"
          value={salePrice}
          onChangeText={setSalePrice}
          placeholder="150"
          keyboardType="decimal-pad"
        />
      )}

      {mode === "stacking" && (
        <>
          <InputField label="1-ci endirim (%)" value={discount1} onChangeText={setDiscount1} placeholder="20" keyboardType="decimal-pad" />
          <InputField label="2-ci endirim (%)" value={discount2} onChangeText={setDiscount2} placeholder="10" keyboardType="decimal-pad" />
          <InputField label="3-cü endirim (%)" value={discount3} onChangeText={setDiscount3} placeholder="5" keyboardType="decimal-pad" />
        </>
      )}

      {result ? (
        <View>
          {result.type === "calculate" && (
            <>
              <View style={styles.cards}>
                {card("neutral", "İlkin qiymət", fmt(result.originalPrice), "AZN", true)}
                {card("amber", `Qənaət (${result.discountPercent}%)`, fmt(result.discountAmount), "AZN")}
                {card("primary", "Son qiymət", fmt(result.finalPrice), "AZN")}
              </View>

              <View style={[styles.visual, { backgroundColor: colors.n200 }]}>
                <View style={styles.visualRow}>
                  <Text style={[styles.visualLabel, { color: colors.n580 }]}>Ödəyirsiniz</Text>
                  <Text style={[styles.visualLabel, { color: colors.n580 }]}>Qənaət</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: AMBER + "55" }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: colors.accent,
                        width: `${Math.max(0, Math.min(100, (result.finalPrice / result.originalPrice) * 100))}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.visualRow}>
                  <Text style={[styles.visualValue, { color: colors.n940 }]}>{fmt(result.finalPrice)} AZN</Text>
                  <Text style={[styles.visualValue, { color: AMBER }]}>{fmt(result.discountAmount)} AZN</Text>
                </View>
              </View>
            </>
          )}

          {result.type === "find-percent" && (
            <View style={styles.cards}>
              {card("neutral", "İlkin qiymət", fmt(result.originalPrice), "AZN")}
              {card("primary", "Endirim faizi", `${result.discountPct.toFixed(1)}%`, "endirim")}
              {card("amber", "Qənaət məbləği", fmt(result.discountAmount), "AZN")}
            </View>
          )}

          {result.type === "stacking" && (
            <>
              <View style={styles.cards}>
                {card("neutral", "İlkin qiymət", fmt(result.originalPrice), "AZN", true)}
                {card("primary", "Son qiymət", fmt(result.finalPrice), "AZN")}
                {card("amber", `Ümumi qənaət (${result.effectiveDiscount.toFixed(1)}%)`, fmt(result.totalSaved), "AZN")}
              </View>

              {result.steps.length > 0 && (
                <ResultSection title="Ardıcıl endirim addımları">
                  <ResultRow label="Başlanğıc qiymət" value={`${fmt(result.originalPrice)} AZN`} />
                  {result.steps.map((step, i) => (
                    <ResultRow key={i} label={`${step.label}: -${fmt(step.discount)} AZN`} value={`${fmt(step.price)} AZN`} />
                  ))}
                  <ResultRow
                    label={`Son qiymət (effektiv endirim: ${result.effectiveDiscount.toFixed(1)}%)`}
                    value={`${fmt(result.finalPrice)} AZN`}
                    highlight
                    bold
                  />
                </ResultSection>
              )}
            </>
          )}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>Nəticəni görmək üçün qiyməti daxil edin.</Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["percentage", "vat", "tip", "currency"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 10, marginTop: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center" },
  cardLabel: { fontSize: 13, opacity: 0.9, textAlign: "center" },
  cardValue: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  cardUnit: { fontSize: 12, marginTop: 2, opacity: 0.85 },
  strike: { textDecorationLine: "line-through" },
  visual: { borderRadius: 12, padding: 16, marginTop: 14 },
  visualRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  visualLabel: { fontSize: 13 },
  visualValue: { fontSize: 13, fontWeight: "600" },
  barTrack: { height: 14, borderRadius: 7, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 7 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
