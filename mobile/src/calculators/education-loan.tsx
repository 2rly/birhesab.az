import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function EducationLoanCalculator() {
  const [tuition, setTuition] = useState("");
  const [years, setYears] = useState("4");
  const [rate, setRate] = useState("6");
  const [gracePeriod, setGracePeriod] = useState("4");

  const result = useMemo(() => {
    const t = parseFloat(tuition) || 0;
    const y = parseInt(years) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const g = parseInt(gracePeriod) || 0;
    if (t <= 0 || y <= 0 || r <= 0) return null;

    const totalLoan = t * y;
    const repayMonths = y * 12;
    const graceMonths = g * 12;

    const graceInterest = totalLoan * r * graceMonths;
    const loanWithInterest = totalLoan + graceInterest;

    const monthlyPayment = r > 0
      ? (loanWithInterest * r * Math.pow(1 + r, repayMonths)) / (Math.pow(1 + r, repayMonths) - 1)
      : loanWithInterest / repayMonths;
    const totalPayment = monthlyPayment * repayMonths;
    const totalInterest = totalPayment - totalLoan;

    return { totalLoan, monthlyPayment, totalPayment, totalInterest, repayMonths };
  }, [tuition, years, rate, gracePeriod]);

  return (
    <View>
      <InputField label="İllik təhsil haqqı" value={tuition} onChangeText={setTuition} placeholder="3000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Təhsil müddəti" value={years} onChangeText={setYears} placeholder="4" keyboardType="numeric" suffix="il" />
      <InputField label="İllik faiz dərəcəsi" value={rate} onChangeText={setRate} placeholder="6" keyboardType="decimal-pad" suffix="%" />
      <InputField label="Güzəşt müddəti (təhsil zamanı)" value={gracePeriod} onChangeText={setGracePeriod} placeholder="4" keyboardType="numeric" suffix="il" />

      {result && (
        <ResultSection title="Təhsil krediti">
          <ResultRow label="Ümumi kredit" value={fmt(result.totalLoan)} />
          <ResultRow label="Aylıq ödəniş" value={fmt(result.monthlyPayment)} highlight bold />
          <ResultRow label="Ümumi ödəniş" value={fmt(result.totalPayment)} />
          <ResultRow label="Ümumi faiz" value={fmt(result.totalInterest)} />
          <ResultRow label="Qaytarma müddəti" value={`${result.repayMonths} ay`} />
        </ResultSection>
      )}
    </View>
  );
}
