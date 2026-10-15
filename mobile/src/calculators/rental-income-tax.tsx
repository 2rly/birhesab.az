import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

const TIER1_LIMIT = 2000;
const TIER1_RATE = 0.04;
const TIER2_RATE = 0.08;
const STANDARD_RATE = 0.14;

type Method = "simplified" | "standard" | "compare";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function calcSimplified(income: number) {
  if (income <= TIER1_LIMIT) return income * TIER1_RATE;
  return TIER1_LIMIT * TIER1_RATE + (income - TIER1_LIMIT) * TIER2_RATE;
}

function calcStandard(income: number, expenses: number) {
  const profit = Math.max(0, income - expenses);
  return profit * STANDARD_RATE;
}

export function RentalIncomeTaxCalculator() {
  const { colors } = useTheme();
  const [method, setMethod] = useState<Method>("compare");
  const [income, setIncome] = useState("1500");
  const [expenses, setExpenses] = useState("300");

  const result = useMemo(() => {
    const inc = parseFloat(income) || 0;
    const exp = parseFloat(expenses) || 0;
    if (inc <= 0) return null;

    const simpTax = calcSimplified(inc);
    const stdTax = calcStandard(inc, exp);

    return {
      simpTax,
      simpNet: inc - simpTax,
      simpRate: (simpTax / inc) * 100,
      stdTax,
      stdNet: inc - exp - stdTax,
      stdRate: inc > 0 ? (stdTax / inc) * 100 : 0,
      profit: Math.max(0, inc - exp),
      saving: simpTax - stdTax,
    };
  }, [income, expenses]);

  return (
    <View>
      <SegmentControl
        options={[
          { value: "compare", label: "Müqayisə" },
          { value: "simplified", label: "Sadələşdirilmiş" },
          { value: "standard", label: "Standart (14%)" },
        ]}
        selected={method}
        onSelect={setMethod}
      />

      <InputField
        label="Aylıq kirayə gəliri"
        value={income}
        onChangeText={setIncome}
        placeholder="1500"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      {(method === "standard" || method === "compare") && (
        <InputField
          label="Aylıq xərclər (təmir, kommunal və s.)"
          value={expenses}
          onChangeText={setExpenses}
          placeholder="300"
          keyboardType="decimal-pad"
          suffix="₼"
        />
      )}

      {result && (method === "simplified" || method === "compare") && (
        <ResultSection title="Sadələşdirilmiş üsul">
          <ResultRow label="Aylıq gəlir" value={fmt(parseFloat(income) || 0)} />
          <ResultRow label="Vergi" value={fmt(result.simpTax)} />
          <ResultRow label="Effektiv dərəcə" value={`${result.simpRate.toFixed(1)}%`} />
          <ResultRow label="Xalis gəlir" value={fmt(result.simpNet)} highlight bold />
        </ResultSection>
      )}

      {result && (method === "standard" || method === "compare") && (
        <ResultSection title="Standart üsul (14%)">
          <ResultRow label="Aylıq gəlir" value={fmt(parseFloat(income) || 0)} />
          <ResultRow label="Xərclər" value={fmt(parseFloat(expenses) || 0)} />
          <ResultRow label="Mənfəət" value={fmt(result.profit)} />
          <ResultRow label="Vergi (14%)" value={fmt(result.stdTax)} />
          <ResultRow label="Xalis gəlir" value={fmt(result.stdNet)} highlight bold />
        </ResultSection>
      )}

      {result && method === "compare" && (
        <ResultSection title="Müqayisə">
          <ResultRow
            label="Fərq (aylıq)"
            value={`${result.saving > 0 ? "Sadələşdirilmiş" : "Standart"} ${fmt(Math.abs(result.saving))} qənaət`}
            highlight
          />
          <ResultRow
            label="Fərq (illik)"
            value={fmt(Math.abs(result.saving) * 12)}
          />
        </ResultSection>
      )}
    </View>
  );
}
