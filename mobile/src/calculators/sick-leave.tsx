import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Experience = "low" | "mid" | "high";

const EXP_RATES: Record<Experience, { rate: number; label: string }> = {
  low: { rate: 0.60, label: "60%" },
  mid: { rate: 0.80, label: "80%" },
  high: { rate: 1.00, label: "100%" },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function SickLeaveCalculator() {
  const [salary, setSalary] = useState("1000");
  const [days, setDays] = useState("10");
  const [experience, setExperience] = useState<Experience>("mid");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const d = parseInt(days) || 0;
    if (s <= 0 || d <= 0) return null;

    const avgDaily = s / 30.4;
    const exp = EXP_RATES[experience];
    const payment = avgDaily * d * exp.rate;

    return { avgDaily, payment, rateLabel: exp.label };
  }, [salary, days, experience]);

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
      <InputField
        label="Xəstəlik günləri"
        value={days}
        onChangeText={setDays}
        placeholder="10"
        keyboardType="numeric"
        suffix="gün"
      />

      <SegmentControl
        label="İş stajı"
        options={[
          { value: "low", label: "≤5 il (60%)" },
          { value: "mid", label: "5–8 il (80%)" },
          { value: "high", label: "8+ il (100%)" },
        ]}
        selected={experience}
        onSelect={setExperience}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Orta gündəlik əmək haqqı"
            value={fmt(result.avgDaily)}
          />
          <ResultRow
            label="Staj əmsalı"
            value={result.rateLabel}
          />
          <ResultRow
            label="Bülleten ödənişi"
            value={fmt(result.payment)}
            highlight
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}
