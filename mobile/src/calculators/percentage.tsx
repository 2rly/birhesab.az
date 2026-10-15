import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultHero, FormulaSection, RelatedCalculators } from "@/components/Content";

type CalcMode = "percent-of" | "what-percent" | "change" | "increase" | "decrease";

/** Saytdakı fmt: toFixed(2) + minliklərin boşluqla ayrılması */
function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Saytdakı parseFloat — mobil klaviaturadan gələn vergülü də qəbul edir */
function pf(s: string): number {
  return parseFloat(s.replace(/\s/g, "").replace(",", "."));
}

const MODES: { value: CalcMode; label: string; description: string }[] = [
  { value: "percent-of", label: "X% of Y", description: "Ədədin faizini tap" },
  { value: "what-percent", label: "X → Y %", description: "Faiz nisbətini tap" },
  { value: "change", label: "Dəyişim %", description: "Artım / azalma faizi" },
  { value: "increase", label: "Artır", description: "Faizlə artır" },
  { value: "decrease", label: "Azalt", description: "Faizlə azalt" },
];

const pt = {
  formulaTitle: "Faiz formulları",
  formulaContent: `1. X% of Y = Y x (X / 100)
   Məsələn: 25% of 200 = 200 x 0.25 = 50

2. X, Y-in neçə faizidir = (X / Y) x 100
   Məsələn: 50, 200-ün neçə faizidir = (50/200) x 100 = 25%

3. Artım/azalma faizi = ((Yeni - Köhnə) / |Köhnə|) x 100
   Məsələn: 100 → 125 = ((125-100)/100) x 100 = +25%

4. Faizlə artırmaq: Ədəd x (1 + Faiz/100)
   Məsələn: 200, 15% artır = 200 x 1.15 = 230

5. Faizlə azaltmaq: Ədəd x (1 - Faiz/100)
   Məsələn: 200, 15% azalt = 200 x 0.85 = 170`,
  result: "Nəticə",
  percent: "Faiz",
  increase: "Artım",
  decrease: "Azalma",
  increased: "artırılmış",
  decreased: "azaldılmış",
  whatPercentOf: "-in neçə faizidir?",
  initialValue: "İlkin dəyər",
  increaseAmount: "Artım məbləği",
  decreaseAmount: "Azalma məbləği",
  calculation: "Hesablama",
  emptyStateText: "Nəticəni görmək üçün dəyərləri daxil edin.",
  percentLabel: "Faiz (%)",
  numberLabel: "Ədəd",
  numberX: "Ədəd (X)",
  baseNumberY: "Əsas ədəd (Y)",
  oldValue: "Köhnə dəyər",
  newValue: "Yeni dəyər",
  number: "Ədəd",
  increasePercent: "Artım faizi (%)",
  decreasePercent: "Azalma faizi (%)",
};

const GREEN = "#22c55e";
const RED = "#ef4444";

interface Result {
  mode: CalcMode;
  answer: number;
  label: string;
  resultLabel: string;
  explanation: string;
  isIncrease?: boolean;
  difference?: number;
  increase?: number;
  decrease?: number;
}

export function PercentageCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<CalcMode>("percent-of");
  const [valueX, setValueX] = useState("");
  const [valueY, setValueY] = useState("");

  const result = useMemo((): Result | null => {
    const x = pf(valueX);
    const y = pf(valueY);

    if (mode === "percent-of") {
      if (isNaN(x) || isNaN(y)) return null;
      const answer = y * (x / 100);
      return {
        mode,
        answer,
        label: `${fmt(x)}% of ${fmt(y)}`,
        resultLabel: pt.result,
        explanation: `${fmt(y)} x ${fmt(x)} / 100 = ${fmt(answer)}`,
      };
    }

    if (mode === "what-percent") {
      if (isNaN(x) || isNaN(y) || y === 0) return null;
      const answer = (x / y) * 100;
      return {
        mode,
        answer,
        label: `${fmt(x)}, ${fmt(y)}${pt.whatPercentOf}`,
        resultLabel: pt.percent,
        explanation: `${fmt(x)} / ${fmt(y)} x 100 = ${answer.toFixed(2)}%`,
      };
    }

    if (mode === "change") {
      if (isNaN(x) || isNaN(y) || x === 0) return null;
      const change = ((y - x) / Math.abs(x)) * 100;
      const isIncrease = change >= 0;
      return {
        mode,
        answer: Math.abs(change),
        label: `${fmt(x)} → ${fmt(y)}`,
        resultLabel: isIncrease ? pt.increase : pt.decrease,
        explanation: `(${fmt(y)} - ${fmt(x)}) / |${fmt(x)}| x 100 = ${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
        isIncrease,
        difference: y - x,
      };
    }

    if (mode === "increase") {
      if (isNaN(x) || isNaN(y)) return null;
      const answer = x * (1 + y / 100);
      const increase = x * (y / 100);
      return {
        mode,
        answer,
        label: `${fmt(x)}, ${fmt(y)}% ${pt.increased}`,
        resultLabel: pt.result,
        explanation: `${fmt(x)} x (1 + ${fmt(y)} / 100) = ${fmt(answer)}`,
        increase,
      };
    }

    if (mode === "decrease") {
      if (isNaN(x) || isNaN(y)) return null;
      const answer = x * (1 - y / 100);
      const decrease = x * (y / 100);
      return {
        mode,
        answer,
        label: `${fmt(x)}, ${fmt(y)}% ${pt.decreased}`,
        resultLabel: pt.result,
        explanation: `${fmt(x)} x (1 - ${fmt(y)} / 100) = ${fmt(answer)}`,
        decrease,
      };
    }

    return null;
  }, [mode, valueX, valueY]);

  const labels = (() => {
    switch (mode) {
      case "percent-of":
        return { labelX: pt.percentLabel, labelY: pt.numberLabel, placeholderX: "25", placeholderY: "200" };
      case "what-percent":
        return { labelX: pt.numberX, labelY: pt.baseNumberY, placeholderX: "50", placeholderY: "200" };
      case "change":
        return { labelX: pt.oldValue, labelY: pt.newValue, placeholderX: "100", placeholderY: "125" };
      case "increase":
        return { labelX: pt.number, labelY: pt.increasePercent, placeholderX: "200", placeholderY: "15" };
      case "decrease":
        return { labelX: pt.number, labelY: pt.decreasePercent, placeholderX: "200", placeholderY: "15" };
    }
  })();

  const StatBox = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <View
      style={[
        styles.statBox,
        color
          ? { backgroundColor: color + "1a", borderColor: color + "66" }
          : { backgroundColor: colors.n200, borderColor: colors.n280 },
      ]}
    >
      <Text style={[styles.statLabel, { color: color ?? colors.n580 }]}>{label}</Text>
      <Text style={[styles.statValue, { color: color ?? colors.n940 }]}>{value}</Text>
    </View>
  );

  return (
    <View>
      {/* Rejim düymələri */}
      <View style={styles.modes}>
        {MODES.map((m) => {
          const active = mode === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => setMode(m.value)}
              style={[
                styles.modeBtn,
                {
                  backgroundColor: active ? colors.accent : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                },
              ]}
            >
              <Text style={[styles.modeLabel, { color: active ? colors.onAccent : colors.n840 }]}>{m.label}</Text>
              <Text style={[styles.modeDesc, { color: active ? colors.onAccent : colors.n580 }]}>{m.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <InputField
        label={labels.labelX}
        value={valueX}
        onChangeText={setValueX}
        placeholder={labels.placeholderX}
        keyboardType="numeric"
      />
      <InputField
        label={labels.labelY}
        value={valueY}
        onChangeText={setValueY}
        placeholder={labels.placeholderY}
        keyboardType="numeric"
      />

      {result ? (
        <View>
          <ResultHero
            label={result.resultLabel}
            value={
              result.mode === "what-percent" || result.mode === "change"
                ? `${result.answer.toFixed(2)}%`
                : fmt(result.answer)
            }
            sub={result.label}
          />

          {result.mode === "change" && result.isIncrease !== undefined && (
            <View style={styles.row}>
              <StatBox
                label={result.isIncrease ? pt.increase : pt.decrease}
                value={(result.isIncrease ? "+" : "") + fmt(result.difference ?? 0)}
                color={result.isIncrease ? GREEN : RED}
              />
            </View>
          )}

          {result.mode === "increase" && result.increase !== undefined && (
            <View style={styles.row}>
              <StatBox label={pt.initialValue} value={fmt(pf(valueX))} />
              <StatBox label={pt.increaseAmount} value={`+${fmt(result.increase)}`} color={GREEN} />
            </View>
          )}

          {result.mode === "decrease" && result.decrease !== undefined && (
            <View style={styles.row}>
              <StatBox label={pt.initialValue} value={fmt(pf(valueX))} />
              <StatBox label={pt.decreaseAmount} value={`-${fmt(result.decrease)}`} color={RED} />
            </View>
          )}

          <View style={[styles.explain, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <Text style={[styles.explainLabel, { color: colors.n580 }]}>{pt.calculation}</Text>
            <Text style={[styles.explainText, { color: colors.n940 }]}>{result.explanation}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>➗</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyStateText}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["discount", "vat", "deposit", "percentage"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  modes: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  modeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  modeLabel: { fontSize: 14, fontWeight: "600" },
  modeDesc: { fontSize: 11, opacity: 0.85, marginTop: 1 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  statBox: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center" },
  statLabel: { fontSize: 13, marginBottom: 4, textAlign: "center" },
  statValue: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  explain: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  explainLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  explainText: { fontSize: 14, fontFamily: "monospace" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
