import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

type TaxType = "simplified" | "micro" | "income";

export function FreelancerTaxCalculator() {
  const [revenue, setRevenue] = useState("5000");
  const [taxType, setTaxType] = useState<TaxType>("simplified");

  const result = useMemo(() => {
    const val = parseFloat(revenue) || 0;
    if (val <= 0) return null;

    let taxRate = 0;
    let taxName = "";

    if (taxType === "simplified") {
      taxRate = 0.02;
      taxName = "Sadələşdirilmiş vergi (2%)";
    } else if (taxType === "micro") {
      taxRate = 0.01;
      taxName = "Mikro sahibkarlıq vergisi (1%)";
    } else {
      taxRate = 0.20;
      taxName = "Mənfəət vergisi (20%)";
    }

    const tax = val * taxRate;
    return { revenue: val, tax, taxName, net: val - tax, taxRate: taxRate * 100 };
  }, [revenue, taxType]);

  return (
    <View>
      <SegmentControl
        label="Vergi rejimi"
        options={[
          { value: "simplified", label: "Sadələşdirilmiş" },
          { value: "micro", label: "Mikro" },
          { value: "income", label: "Mənfəət" },
        ]}
        selected={taxType}
        onSelect={setTaxType}
      />
      <InputField label="Aylıq gəlir" value={revenue} onChangeText={setRevenue} placeholder="5000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Gəlir" value={fmt(result.revenue)} />
          <ResultRow label={result.taxName} value={fmt(result.tax)} />
          <ResultRow label="Xalis gəlir" value={fmt(result.net)} highlight bold />
          <ResultRow label="İllik vergi" value={fmt(result.tax * 12)} />
        </ResultSection>
      )}
    </View>
  );
}
