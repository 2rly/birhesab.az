import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type HabitType = "smoking" | "alcohol" | "coffee";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function HarmfulHabitsCalculator() {
  const [habit, setHabit] = useState<HabitType>("smoking");
  const [dailyAmount, setDailyAmount] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");

  const result = useMemo(() => {
    const amount = parseFloat(dailyAmount) || 0;
    const price = parseFloat(pricePerUnit) || 0;
    if (amount <= 0 || price <= 0) return null;

    const daily = amount * price;
    const weekly = daily * 7;
    const monthly = daily * 30;
    const yearly = daily * 365;
    const fiveYears = yearly * 5;
    const tenYears = yearly * 10;

    return { daily, weekly, monthly, yearly, fiveYears, tenYears };
  }, [dailyAmount, pricePerUnit]);

  const unitLabel = habit === "smoking" ? "siqaret (qutu)" : habit === "alcohol" ? "içki" : "fincan";
  const priceLabel = habit === "smoking" ? "Qutu qiyməti" : habit === "alcohol" ? "Şüşə qiyməti" : "Fincan qiyməti";

  return (
    <View>
      <SegmentControl
        label="Vərdiş növü"
        options={[
          { value: "smoking", label: "Siqaret" },
          { value: "alcohol", label: "Alkohol" },
          { value: "coffee", label: "Qəhvə" },
        ]}
        selected={habit}
        onSelect={setHabit}
      />
      <InputField label={`Gündəlik (${unitLabel})`} value={dailyAmount} onChangeText={setDailyAmount} placeholder="1" keyboardType="decimal-pad" />
      <InputField label={priceLabel} value={pricePerUnit} onChangeText={setPricePerUnit} placeholder="5" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Xərc hesabı">
          <ResultRow label="Gündəlik" value={fmt(result.daily)} />
          <ResultRow label="Həftəlik" value={fmt(result.weekly)} />
          <ResultRow label="Aylıq" value={fmt(result.monthly)} highlight bold />
          <ResultRow label="İllik" value={fmt(result.yearly)} bold />
          <ResultRow label="5 ildə" value={fmt(result.fiveYears)} />
          <ResultRow label="10 ildə" value={fmt(result.tenYears)} />
        </ResultSection>
      )}
    </View>
  );
}
