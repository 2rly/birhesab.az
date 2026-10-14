import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DividendTaxCalculator() {
  const [amount, setAmount] = useState("10000");

  const result = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) return null;
    const tax = val * 0.05;
    return { gross: val, tax, net: val - tax };
  }, [amount]);

  return (
    <View>
      <InputField label="Dividend məbləği (gross)" value={amount} onChangeText={setAmount} placeholder="10000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Dividend (gross)" value={fmt(result.gross)} />
          <ResultRow label="Vergi (5%)" value={fmt(result.tax)} />
          <ResultRow label="Əlinizə çatan" value={fmt(result.net)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
