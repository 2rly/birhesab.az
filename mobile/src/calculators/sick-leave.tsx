import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function SickLeaveCalculator() {
  const [salary, setSalary] = useState("1500");
  const [sickDays, setSickDays] = useState("5");

  const result = useMemo(() => {
    const monthlySalary = parseFloat(salary) || 0;
    const days = parseInt(sickDays) || 0;
    if (monthlySalary <= 0 || days <= 0) return null;

    const annualSalary = monthlySalary * 12;
    const avgWorkDaysPerYear = 249;
    const dailyRate = annualSalary / avgWorkDaysPerYear;
    const payment = dailyRate * days;

    return { annualSalary, dailyRate, days, payment };
  }, [salary, sickDays]);

  return (
    <View>
      <InputField
        label="Aylıq əmək haqqı (gross)"
        value={salary}
        onChangeText={setSalary}
        placeholder="1500"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="Xəstəlik günləri (iş günü)"
        value={sickDays}
        onChangeText={setSickDays}
        placeholder="5"
        keyboardType="numeric"
        suffix="gün"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Bülleten pulu" value={fmt(result.payment)} highlight bold />
          <ResultRow label="İllik qazanc" value={fmt(result.annualSalary)} />
          <ResultRow label="Bir iş gününə düşən" value={fmt(result.dailyRate)} />
          <ResultRow label="Xəstəlik iş günləri" value={`${result.days} gün`} />
        </ResultSection>
      )}
    </View>
  );
}
