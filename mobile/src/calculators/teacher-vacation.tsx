import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function TeacherVacationCalculator() {
  const [salary, setSalary] = useState("800");
  const [days, setDays] = useState<"56" | "42">("56");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    if (s <= 0) return null;

    const d = parseInt(days);
    const avgDaily = s / 30.4;
    const payment = avgDaily * d;

    return { avgDaily, payment, days: d };
  }, [salary, days]);

  return (
    <View>
      <SegmentControl
        label="Məzuniyyət müddəti"
        options={[
          { value: "56", label: "56 gün" },
          { value: "42", label: "42 gün" },
        ]}
        selected={days}
        onSelect={setDays}
      />
      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="800" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Məzuniyyət müddəti" value={`${result.days} gün`} />
          <ResultRow label="Gündəlik dərəcə" value={fmt(result.avgDaily)} />
          <ResultRow label="Məzuniyyət pulu" value={fmt(result.payment)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
