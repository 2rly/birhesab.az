import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function MilitaryCalculator() {
  const [salary, setSalary] = useState("1000");
  const [months, setMonths] = useState("12");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const m = parseInt(months) || 0;
    if (s <= 0 || m <= 0) return null;

    const avgDaily = s / 30.4;
    const payment = avgDaily * 15;

    return { avgDaily, payment, totalMonths: m };
  }, [salary, months]);

  return (
    <View>
      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Xidmət müddəti" value={months} onChangeText={setMonths} placeholder="12" keyboardType="numeric" suffix="ay" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Gündəlik dərəcə" value={fmt(result.avgDaily)} />
          <ResultRow label="Ödəniş (15 gün)" value={fmt(result.payment)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
