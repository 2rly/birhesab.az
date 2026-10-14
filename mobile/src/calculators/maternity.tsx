import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type BirthType = "normal" | "complicated" | "twins";

const LEAVE_DAYS: Record<BirthType, { total: number; before: number; after: number }> = {
  normal: { total: 126, before: 70, after: 56 },
  complicated: { total: 140, before: 70, after: 70 },
  twins: { total: 180, before: 70, after: 110 },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function MaternityCalculator() {
  const [salary, setSalary] = useState("1000");
  const [birthType, setBirthType] = useState<BirthType>("normal");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    if (s <= 0) return null;

    const avgDaily = (s * 12) / 365;
    const leave = LEAVE_DAYS[birthType];
    const totalPay = avgDaily * leave.total;
    const beforePay = avgDaily * leave.before;
    const afterPay = avgDaily * leave.after;

    return { avgDaily, totalPay, beforePay, afterPay, leave };
  }, [salary, birthType]);

  return (
    <View>
      <InputField
        label="Aylıq əmək haqqı (gross)"
        value={salary}
        onChangeText={setSalary}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      <SegmentControl
        label="Doğuş növü"
        options={[
          { value: "normal", label: "Normal" },
          { value: "complicated", label: "Ağır" },
          { value: "twins", label: "Əkiz" },
        ]}
        selected={birthType}
        onSelect={setBirthType}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Orta gündəlik əmək haqqı"
            value={fmt(result.avgDaily)}
          />
          <ResultRow
            label="Məzuniyyət müddəti"
            value={`${result.leave.total} gün`}
          />
          <ResultRow
            label="Doğuşdan əvvəl"
            value={`${result.leave.before} gün — ${fmt(result.beforePay)}`}
          />
          <ResultRow
            label="Doğuşdan sonra"
            value={`${result.leave.after} gün — ${fmt(result.afterPay)}`}
          />
          <ResultRow
            label="Ümumi ödəniş"
            value={fmt(result.totalPay)}
            highlight
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}
