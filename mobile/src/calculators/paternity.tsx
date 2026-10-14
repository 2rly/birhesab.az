import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function PaternityCalculator() {
  const [salary, setSalary] = useState("1000");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    if (s <= 0) return null;

    const days = 14;
    const avgDaily = s / 30.4;
    const payment = avgDaily * days;

    return { avgDaily, payment, days };
  }, [salary]);

  return (
    <View>
      <InputField label="Aylıq əmək haqqı (gross)" value={salary} onChangeText={setSalary} placeholder="1000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Məzuniyyət müddəti" value={`${result.days} gün`} />
          <ResultRow label="Gündəlik dərəcə" value={fmt(result.avgDaily)} />
          <ResultRow label="Atalıq məzuniyyəti pulu" value={fmt(result.payment)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
