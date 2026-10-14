import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function calcNotary(amount: number): number {
  if (amount <= 10000) return amount * 0.005 + 15;
  if (amount <= 50000) return 50 + (amount - 10000) * 0.003;
  if (amount <= 100000) return 170 + (amount - 50000) * 0.002;
  return 270 + (amount - 100000) * 0.001;
}

export function NotaryCalculator() {
  const [amount, setAmount] = useState("50000");

  const result = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) return null;

    const fee = calcNotary(val);
    return { amount: val, fee };
  }, [amount]);

  return (
    <View>
      <InputField label="Əqdün məbləği" value={amount} onChangeText={setAmount} placeholder="50000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Əqd məbləği" value={fmt(result.amount)} />
          <ResultRow label="Notarius rüsumu" value={fmt(result.fee)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
