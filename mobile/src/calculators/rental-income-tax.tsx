import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Method = "simplified" | "standard" | "compare";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function pct(n: number): string {
  return n.toFixed(1) + "%";
}

function calcSimplified(income: number): number {
  if (income <= 0) return 0;
  if (income <= 2000) return income * 0.04;
  return 80 + (income - 2000) * 0.08;
}

function calcStandard(income: number, expenses: number): number {
  const taxable = Math.max(0, income - expenses);
  return taxable * 0.14;
}

export function RentalIncomeTaxCalculator() {
  const [method, setMethod] = useState<Method>("simplified");
  const [income, setIncome] = useState("1500");
  const [expenses, setExpenses] = useState("200");

  const result = useMemo(() => {
    const inc = parseFloat(income) || 0;
    const exp = parseFloat(expenses) || 0;
    if (inc <= 0) return null;

    const simplified = calcSimplified(inc);
    const standard = calcStandard(inc, exp);
    const breakeven = inc - simplified / 0.14;

    return {
      simplified,
      standard,
      simplifiedNet: inc - simplified,
      standardNet: inc - standard,
      simplifiedRate: (simplified / inc) * 100,
      standardRate: inc > 0 ? (standard / inc) * 100 : 0,
      breakeven: Math.max(0, breakeven),
      cheaper: simplified <= standard ? "simplified" : "standard",
    };
  }, [income, expenses]);

  return (
    <View>
      <SegmentControl
        label="Vergi metodu"
        options={[
          { value: "simplified", label: "Sadələşdirilmiş" },
          { value: "standard", label: "Standart" },
          { value: "compare", label: "Müqayisə" },
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
          label="Aylıq xərclər"
          value={expenses}
          onChangeText={setExpenses}
          placeholder="200"
          keyboardType="decimal-pad"
          suffix="₼"
        />
      )}

      {result && method === "simplified" && (
        <>
          <ResultSection title="Sadələşdirilmiş vergi (4% / 8%)">
            <ResultRow label="Aylıq vergi" value={fmt(result.simplified)} highlight bold />
            <ResultRow label="Xalis gəlir" value={fmt(result.simplifiedNet)} />
            <ResultRow label="Effektiv dərəcə" value={pct(result.simplifiedRate)} />
          </ResultSection>
          <ResultSection title="İllik proyeksiya">
            <ResultRow label="İllik vergi" value={fmt(result.simplified * 12)} />
            <ResultRow label="İllik xalis gəlir" value={fmt(result.simplifiedNet * 12)} bold />
          </ResultSection>
        </>
      )}

      {result && method === "standard" && (
        <>
          <ResultSection title="Standart vergi (14%)">
            <ResultRow label="Aylıq vergi" value={fmt(result.standard)} highlight bold />
            <ResultRow label="Xalis gəlir" value={fmt(result.standardNet)} />
            <ResultRow label="Effektiv dərəcə" value={pct(result.standardRate)} />
          </ResultSection>
          <ResultSection title="İllik proyeksiya">
            <ResultRow label="İllik vergi" value={fmt(result.standard * 12)} />
            <ResultRow label="İllik xalis gəlir" value={fmt(result.standardNet * 12)} bold />
          </ResultSection>
        </>
      )}

      {result && method === "compare" && (
        <>
          <ResultSection title="Sadələşdirilmiş (4% / 8%)">
            <ResultRow label="Aylıq vergi" value={fmt(result.simplified)} highlight={result.cheaper === "simplified"} bold />
            <ResultRow label="Xalis gəlir" value={fmt(result.simplifiedNet)} />
            <ResultRow label="Effektiv dərəcə" value={pct(result.simplifiedRate)} />
          </ResultSection>
          <ResultSection title="Standart (14%)">
            <ResultRow label="Aylıq vergi" value={fmt(result.standard)} highlight={result.cheaper === "standard"} bold />
            <ResultRow label="Xalis gəlir" value={fmt(result.standardNet)} />
            <ResultRow label="Effektiv dərəcə" value={pct(result.standardRate)} />
          </ResultSection>
          <ResultSection title="Müqayisə">
            <ResultRow
              label="Daha sərfəli"
              value={result.cheaper === "simplified" ? "Sadələşdirilmiş" : "Standart"}
              highlight
              bold
            />
            <ResultRow label="Fərq (aylıq)" value={fmt(Math.abs(result.simplified - result.standard))} />
            <ResultRow label="Zərərsizlik xərci" value={fmt(result.breakeven)} />
          </ResultSection>
        </>
      )}
    </View>
  );
}
