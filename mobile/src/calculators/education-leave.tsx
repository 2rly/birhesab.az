import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type LeaveType = "session" | "diploma" | "entrance";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

const LEAVE_DAYS: Record<LeaveType, number> = {
  session: 30,
  diploma: 60,
  entrance: 15,
};

export function EducationLeaveCalculator() {
  const [type, setType] = useState<LeaveType>("session");
  const [salary, setSalary] = useState("");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    if (s <= 0) return null;

    const days = LEAVE_DAYS[type];
    const dailySalary = s / 30;
    const payment = dailySalary * days;

    return { days, dailySalary, payment };
  }, [type, salary]);

  return (
    <View>
      <SegmentControl
        label="Məzuniyyət növü"
        options={[
          { value: "session", label: "Sessiya" },
          { value: "diploma", label: "Diplom işi" },
          { value: "entrance", label: "Qəbul imtahanı" },
        ]}
        selected={type}
        onSelect={setType}
      />
      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Təhsil məzuniyyəti">
          <ResultRow label="Müddət" value={`${result.days} gün`} />
          <ResultRow label="Gündəlik maaş" value={fmt(result.dailySalary)} />
          <ResultRow label="Ödəniş" value={fmt(result.payment)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
