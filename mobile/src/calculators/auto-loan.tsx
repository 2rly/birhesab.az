import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type CarCondition = "new" | "used";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function AutoLoanCalculator() {
  const [condition, setCondition] = useState<CarCondition>("new");
  const [price, setPrice] = useState("30000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [rate, setRate] = useState("15");
  const [termMonths, setTermMonths] = useState("36");

  const result = useMemo(() => {
    const p = parseFloat(price) || 0;
    const dp = (parseFloat(downPaymentPct) || 0) / 100;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = parseInt(termMonths) || 0;
    if (p <= 0 || r <= 0 || n <= 0) return null;

    const downPaymentAmount = p * dp;
    const loanAmount = p - downPaymentAmount;
    if (loanAmount <= 0) return null;

    const monthlyPayment =
      (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - loanAmount;
    const totalCost = downPaymentAmount + totalPayment;

    return {
      downPaymentAmount,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      totalCost,
    };
  }, [price, downPaymentPct, rate, termMonths]);

  return (
    <View>
      <SegmentControl
        label="Avtomobilin vəziyyəti"
        options={[
          { value: "new", label: "Yeni (12-18%)" },
          { value: "used", label: "İşlənmiş (15-22%)" },
        ]}
        selected={condition}
        onSelect={(v) => {
          setCondition(v);
          setRate(v === "new" ? "15" : "18");
        }}
      />

      <InputField
        label="Avtomobilin qiyməti"
        value={price}
        onChangeText={setPrice}
        placeholder="30000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="İlkin ödəniş"
        value={downPaymentPct}
        onChangeText={setDownPaymentPct}
        placeholder="20"
        keyboardType="decimal-pad"
        suffix="%"
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
        label="Kredit müddəti"
        value={termMonths}
        onChangeText={setTermMonths}
        placeholder="36"
        keyboardType="numeric"
        suffix="ay"
      />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow
              label="Aylıq ödəniş"
              value={fmt(result.monthlyPayment)}
              highlight
              bold
            />
            <ResultRow
              label="İlkin ödəniş"
              value={fmt(result.downPaymentAmount)}
            />
            <ResultRow
              label="Kredit məbləği"
              value={fmt(result.loanAmount)}
            />
          </ResultSection>

          <ResultSection title="Ətraflı hesablama">
            <ResultRow
              label="Ümumi faiz ödənişi"
              value={fmt(result.totalInterest)}
            />
            <ResultRow
              label="Ümumi ödəniş (kredit)"
              value={fmt(result.totalPayment)}
            />
            <ResultRow
              label="Ümumi xərc (ilkin + kredit)"
              value={fmt(result.totalCost)}
              bold
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}
