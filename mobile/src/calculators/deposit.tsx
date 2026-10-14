import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type InterestType = "simple" | "compound";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DepositCalculator() {
  const [type, setType] = useState<InterestType>("simple");
  const [principal, setPrincipal] = useState("5000");
  const [rate, setRate] = useState("10");
  const [months, setMonths] = useState("12");

  const result = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseInt(months) || 0;
    if (p <= 0 || r <= 0 || n <= 0) return null;

    if (type === "simple") {
      const interest = p * r * (n / 12);
      const monthlyInterest = (p * r) / 12;
      return {
        totalAmount: p + interest,
        totalInterest: interest,
        monthlyInterest,
      };
    } else {
      const monthlyRate = r / 12;
      const totalAmount = p * Math.pow(1 + monthlyRate, n);
      const totalInterest = totalAmount - p;
      const monthlyInterest = totalInterest / n;
      return {
        totalAmount,
        totalInterest,
        monthlyInterest,
      };
    }
  }, [type, principal, rate, months]);

  return (
    <View>
      <SegmentControl
        label="Faiz növü"
        options={[
          { value: "simple", label: "Sadə faiz" },
          { value: "compound", label: "Mürəkkəb faiz" },
        ]}
        selected={type}
        onSelect={setType}
      />

      <InputField
        label="Depozit məbləği"
        value={principal}
        onChangeText={setPrincipal}
        placeholder="5000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="İllik faiz dərəcəsi"
        value={rate}
        onChangeText={setRate}
        placeholder="10"
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
            label="Yekun məbləğ"
            value={fmt(result.totalAmount)}
            highlight
            bold
          />
          <ResultRow
            label="Ümumi faiz gəliri"
            value={fmt(result.totalInterest)}
          />
          <ResultRow
            label="Aylıq orta gəlir"
            value={fmt(result.monthlyInterest)}
          />
        </ResultSection>
      )}
    </View>
  );
}
