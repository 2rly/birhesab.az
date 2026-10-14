import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function PaternityLeaveCalculator() {
  const [salary, setSalary] = useState("");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    if (s <= 0) return null;

    const days = 14;
    const dailySalary = s / 30;
    const benefit = dailySalary * days;

    return { days, dailySalary, benefit };
  }, [salary]);

  return (
    <View>
      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Atalıq məzuniyyəti">
          <ResultRow label="Müddət" value="14 gün" />
          <ResultRow label="Gündəlik ödəniş" value={fmt(result.dailySalary)} />
          <ResultRow label="Müavinət məbləği" value={fmt(result.benefit)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
