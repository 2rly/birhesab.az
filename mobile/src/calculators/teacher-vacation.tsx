import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function TeacherVacationCalculator() {
  const [salary, setSalary] = useState("");
  const [vacationDays, setVacationDays] = useState("56");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const d = parseInt(vacationDays) || 0;
    if (s <= 0 || d <= 0) return null;

    const dailySalary = s / 30;
    const vacationPay = dailySalary * d;

    return { dailySalary, vacationPay, days: d };
  }, [salary, vacationDays]);

  return (
    <View>
      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="800" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Məzuniyyət günləri" value={vacationDays} onChangeText={setVacationDays} placeholder="56" keyboardType="numeric" suffix="gün" />

      {result && (
        <ResultSection title="Müəllim məzuniyyəti">
          <ResultRow label="Gündəlik maaş" value={fmt(result.dailySalary)} />
          <ResultRow label={`Məzuniyyət pulu (${result.days} gün)`} value={fmt(result.vacationPay)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
