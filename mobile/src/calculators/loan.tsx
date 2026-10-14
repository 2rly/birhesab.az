import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function LoanCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("15");
  const [months, setMonths] = useState("12");

  const result = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = parseInt(months) || 0;
    if (p <= 0 || r <= 0 || n <= 0) return null;

    const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - p;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      overpaymentPercent: (totalInterest / p) * 100,
    };
  }, [principal, rate, months]);

  return (
    <View>
      <InputField
        label="Kredit məbləği"
        value={principal}
        onChangeText={setPrincipal}
        placeholder="10000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="İllik faiz dərəcəsi"
        value={rate}
        onChangeText={setRate}
        placeholder="15"
        keyboardType="decimal-pad"
        suffix="%"
      />
      <InputField
        label="Müddət"
        value={months}
        onChangeText={setMonths}
        placeholder="12"
        keyboardType="numeric"
        suffix="ay"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Aylıq ödəniş"
            value={fmt(result.monthlyPayment)}
            highlight
            bold
          />
          <ResultRow
            label="Ümumi ödəniş"
            value={fmt(result.totalPayment)}
          />
          <ResultRow
            label="Artıq ödəniş (faiz)"
            value={fmt(result.totalInterest)}
          />
          <ResultRow
            label="Artıq ödəniş nisbəti"
            value={`${result.overpaymentPercent.toFixed(1)}%`}
          />
        </ResultSection>
      )}
    </View>
  );
}
