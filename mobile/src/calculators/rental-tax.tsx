import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function RentalTaxCalculator() {
  const [rent, setRent] = useState("800");

  const result = useMemo(() => {
    const r = parseFloat(rent) || 0;
    if (r <= 0) return null;

    const tax = r * 0.14;
    const net = r - tax;
    const annual = r * 12;
    const annualTax = tax * 12;

    return { rent: r, tax, net, annual, annualTax };
  }, [rent]);

  return (
    <View>
      <InputField label="Aylıq kirayə gəliri" value={rent} onChangeText={setRent} placeholder="800" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Aylıq kirayə" value={fmt(result.rent)} />
          <ResultRow label="Aylıq vergi (14%)" value={fmt(result.tax)} />
          <ResultRow label="Xalis aylıq gəlir" value={fmt(result.net)} highlight bold />
          <ResultRow label="İllik vergi" value={fmt(result.annualTax)} />
        </ResultSection>
      )}
    </View>
  );
}
