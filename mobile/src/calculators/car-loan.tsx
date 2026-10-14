import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function CarLoanCalculator() {
  const [price, setPrice] = useState("30000");
  const [downPayment, setDownPayment] = useState("20");
  const [rate, setRate] = useState("12");
  const [months, setMonths] = useState("36");

  const result = useMemo(() => {
    const carPrice = parseFloat(price) || 0;
    const dp = (parseFloat(downPayment) || 0) / 100;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = parseInt(months) || 0;
    if (carPrice <= 0 || r <= 0 || n <= 0) return null;

    const downPaymentAmount = carPrice * dp;
    const loanAmount = carPrice - downPaymentAmount;
    const monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - loanAmount;

    return { downPaymentAmount, loanAmount, monthlyPayment, totalPayment, totalInterest };
  }, [price, downPayment, rate, months]);

  return (
    <View>
      <InputField label="Avtomobilin qiyməti" value={price} onChangeText={setPrice} placeholder="30000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="İlkin ödəniş" value={downPayment} onChangeText={setDownPayment} placeholder="20" keyboardType="decimal-pad" suffix="%" />
      <InputField label="İllik faiz dərəcəsi" value={rate} onChangeText={setRate} placeholder="12" keyboardType="decimal-pad" suffix="%" />
      <InputField label="Müddət" value={months} onChangeText={setMonths} placeholder="36" keyboardType="numeric" suffix="ay" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="İlkin ödəniş" value={fmt(result.downPaymentAmount)} />
          <ResultRow label="Kredit məbləği" value={fmt(result.loanAmount)} />
          <ResultRow label="Aylıq ödəniş" value={fmt(result.monthlyPayment)} highlight bold />
          <ResultRow label="Ümumi ödəniş" value={fmt(result.totalPayment)} />
          <ResultRow label="Ümumi faiz" value={fmt(result.totalInterest)} />
        </ResultSection>
      )}
    </View>
  );
}
