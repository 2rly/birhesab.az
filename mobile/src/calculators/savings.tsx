import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function SavingsCalculator() {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    const m = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseInt(years) || 0) * 12;
    if (m <= 0 || n <= 0) return null;

    let total = 0;
    for (let i = 0; i < n; i++) {
      total = (total + m) * (1 + r);
    }
    const totalDeposited = m * n;
    const totalInterest = total - totalDeposited;

    return { total, totalDeposited, totalInterest };
  }, [monthly, rate, years]);

  return (
    <View>
      <InputField label="Aylıq yığım" value={monthly} onChangeText={setMonthly} placeholder="100" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="İllik faiz dərəcəsi" value={rate} onChangeText={setRate} placeholder="10" keyboardType="decimal-pad" suffix="%" />
      <InputField label="Müddət" value={years} onChangeText={setYears} placeholder="10" keyboardType="numeric" suffix="il" />

      {result && (
        <ResultSection title="Yığım nəticəsi">
          <ResultRow label="Yekun məbləğ" value={fmt(result.total)} highlight bold />
          <ResultRow label="Yatırılan" value={fmt(result.totalDeposited)} />
          <ResultRow label="Faiz gəliri" value={fmt(result.totalInterest)} />
        </ResultSection>
      )}
    </View>
  );
}
