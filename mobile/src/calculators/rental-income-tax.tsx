import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function RentalIncomeTaxCalculator() {
  const [income, setIncome] = useState("500");
  const [ownerType, setOwnerType] = useState<"individual" | "legal">("individual");

  const result = useMemo(() => {
    const val = parseFloat(income) || 0;
    if (val <= 0) return null;

    const annualIncome = val * 12;
    let tax: number;

    if (ownerType === "individual") {
      tax = val * 0.14;
    } else {
      tax = val * 0.20;
    }

    return {
      monthlyIncome: val,
      annualIncome,
      monthlyTax: tax,
      annualTax: tax * 12,
      netMonthly: val - tax,
      netAnnual: annualIncome - tax * 12,
    };
  }, [income, ownerType]);

  return (
    <View>
      <SegmentControl
        label="Mülkiyyətçi tipi"
        options={[
          { value: "individual", label: "Fiziki şəxs" },
          { value: "legal", label: "Hüquqi şəxs" },
        ]}
        selected={ownerType}
        onSelect={setOwnerType}
      />
      <InputField label="Aylıq kirayə gəliri" value={income} onChangeText={setIncome} placeholder="500" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Aylıq gəlir" value={fmt(result.monthlyIncome)} />
          <ResultRow label={`Aylıq vergi (${ownerType === "individual" ? "14" : "20"}%)`} value={fmt(result.monthlyTax)} />
          <ResultRow label="Aylıq xalis gəlir" value={fmt(result.netMonthly)} highlight bold />
          <ResultRow label="İllik vergi" value={fmt(result.annualTax)} />
          <ResultRow label="İllik xalis gəlir" value={fmt(result.netAnnual)} />
        </ResultSection>
      )}
    </View>
  );
}
