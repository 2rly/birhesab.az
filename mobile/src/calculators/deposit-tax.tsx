import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DepositTaxCalculator() {
  const [amount, setAmount] = useState("5000");
  const [rate, setRate] = useState("10");
  const [months, setMonths] = useState("12");
  const [currency, setCurrency] = useState<"azn" | "usd">("azn");

  const result = useMemo(() => {
    const p = parseFloat(amount) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseInt(months) || 0;
    if (p <= 0 || r <= 0 || n <= 0) return null;

    const monthlyInterest = (p * r) / 12;
    const totalInterest = monthlyInterest * n;

    let tax = 0;
    let exempt = 0;

    if (currency === "azn" && n >= 18) {
      exempt = totalInterest;
      tax = 0;
    } else if (currency === "azn") {
      const monthlyExempt = 200;
      const taxablePerMonth = Math.max(0, monthlyInterest - monthlyExempt);
      exempt = Math.min(monthlyInterest, monthlyExempt) * n;
      tax = taxablePerMonth * n * 0.1;
    } else {
      tax = totalInterest * 0.1;
    }

    return {
      monthlyInterest,
      totalInterest,
      exempt,
      tax,
      netInterest: totalInterest - tax,
    };
  }, [amount, rate, months, currency]);

  return (
    <View>
      <SegmentControl
        label="Valyuta"
        options={[
          { value: "azn", label: "AZN" },
          { value: "usd", label: "USD" },
        ]}
        selected={currency}
        onSelect={setCurrency}
      />
      <InputField label="Depozit məbləği" value={amount} onChangeText={setAmount} placeholder="5000" keyboardType="decimal-pad" suffix={currency === "azn" ? "₼" : "$"} />
      <InputField label="İllik faiz dərəcəsi" value={rate} onChangeText={setRate} placeholder="10" keyboardType="decimal-pad" suffix="%" />
      <InputField label="Müddət" value={months} onChangeText={setMonths} placeholder="12" keyboardType="numeric" suffix="ay" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Aylıq faiz gəliri" value={fmt(result.monthlyInterest)} />
          <ResultRow label="Ümumi faiz gəliri" value={fmt(result.totalInterest)} />
          <ResultRow label="Vergidən azad" value={fmt(result.exempt)} />
          <ResultRow label="Vergi (10%)" value={fmt(result.tax)} />
          <ResultRow label="Xalis gəlir" value={fmt(result.netInterest)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
