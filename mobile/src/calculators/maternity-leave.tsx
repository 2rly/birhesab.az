import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type BirthType = "normal" | "complicated" | "multiple";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

const BIRTH_DAYS: Record<BirthType, { before: number; after: number }> = {
  normal: { before: 126, after: 0 },
  complicated: { before: 126, after: 14 },
  multiple: { before: 140, after: 16 },
};

export function MaternityLeaveCalculator() {
  const [birthType, setBirthType] = useState<BirthType>("normal");
  const [salary, setSalary] = useState("");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    if (s <= 0) return null;

    const days = BIRTH_DAYS[birthType];
    const totalDays = days.before + days.after;
    const dailySalary = s / 30;
    const benefit = dailySalary * totalDays;

    return { totalDays, dailySalary, benefit, beforeDays: days.before, afterDays: days.after };
  }, [birthType, salary]);

  return (
    <View>
      <SegmentControl
        label="Doğuş növü"
        options={[
          { value: "normal", label: "Normal" },
          { value: "complicated", label: "Ağırlaşmış" },
          { value: "multiple", label: "Çoxdöllü" },
        ]}
        selected={birthType}
        onSelect={setBirthType}
      />
      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Analıq məzuniyyəti">
          <ResultRow label="Doğuşdan əvvəl" value={`${result.beforeDays} gün`} />
          {result.afterDays > 0 && <ResultRow label="Əlavə günlər" value={`${result.afterDays} gün`} />}
          <ResultRow label="Ümumi müddət" value={`${result.totalDays} gün`} />
          <ResultRow label="Gündəlik ödəniş" value={fmt(result.dailySalary)} />
          <ResultRow label="Müavinət məbləği" value={fmt(result.benefit)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
