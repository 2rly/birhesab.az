import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function VacationPayCalculator() {
  const [salary, setSalary] = useState("1000");
  const [days, setDays] = useState("21");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const d = parseInt(days) || 0;
    if (s <= 0 || d <= 0) return null;

    const avgDaily = s / 30.4;
    const vacationPay = avgDaily * d;

    return { avgDaily, vacationPay };
  }, [salary, days]);

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
        label="Məzuniyyət günləri"
        value={days}
        onChangeText={setDays}
        placeholder="21"
        keyboardType="numeric"
        suffix="gün"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Orta gündəlik əmək haqqı"
            value={fmt(result.avgDaily)}
          />
          <ResultRow
            label="Məzuniyyət pulu (gross)"
            value={fmt(result.vacationPay)}
            highlight
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}
