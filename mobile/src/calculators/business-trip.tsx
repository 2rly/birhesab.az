import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type TripType = "domestic" | "abroad";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function BusinessTripCalculator() {
  const [type, setType] = useState<TripType>("domestic");
  const [days, setDays] = useState("");
  const [salary, setSalary] = useState("");

  const result = useMemo(() => {
    const d = parseInt(days) || 0;
    const s = parseFloat(salary) || 0;
    if (d <= 0 || s <= 0) return null;

    const dailyRate = type === "domestic" ? 10 : 50;
    const dailyAllowance = dailyRate * d;
    const dailySalary = s / 30;
    const salaryForDays = dailySalary * d;
    const total = dailyAllowance + salaryForDays;

    return { dailyRate, dailyAllowance, dailySalary, salaryForDays, total };
  }, [type, days, salary]);

  return (
    <View>
      <SegmentControl
        label="Ezamiyyət növü"
        options={[
          { value: "domestic", label: "Daxili" },
          { value: "abroad", label: "Xarici" },
        ]}
        selected={type}
        onSelect={setType}
      />
      <InputField label="Gün sayı" value={days} onChangeText={setDays} placeholder="5" keyboardType="numeric" suffix="gün" />
      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1500" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Ezamiyyət hesabı">
          <ResultRow label="Gündəlik norma" value={fmt(result.dailyRate)} />
          <ResultRow label="Ezamiyyət pulu" value={fmt(result.dailyAllowance)} />
          <ResultRow label="Maaş (günlər üçün)" value={fmt(result.salaryForDays)} />
          <ResultRow label="Ümumi" value={fmt(result.total)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
