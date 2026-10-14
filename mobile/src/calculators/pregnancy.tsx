import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(d: Date): string {
  return `${padTwo(d.getDate())}.${padTwo(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function PregnancyCalculator() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const result = useMemo(() => {
    const d = parseInt(day) || 0;
    const m = parseInt(month) || 0;
    const y = parseInt(year) || 0;
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return null;

    const lmp = new Date(y, m - 1, d);
    if (isNaN(lmp.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(lmp.getTime() + 280 * 86400000);
    const diffMs = today.getTime() - lmp.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 0) return null;

    const currentWeek = Math.floor(diffDays / 7);
    const currentDay = diffDays % 7;
    const daysRemaining = Math.max(
      0,
      Math.ceil((dueDate.getTime() - today.getTime()) / 86400000)
    );

    let trimester: string;
    if (currentWeek <= 12) trimester = "I trimester (1–12 həftə)";
    else if (currentWeek <= 27) trimester = "II trimester (13–27 həftə)";
    else trimester = "III trimester (28–40 həftə)";

    return {
      currentWeek,
      currentDay,
      trimester,
      dueDate: formatDate(dueDate),
      daysRemaining,
      weeksRemaining: Math.floor(daysRemaining / 7),
    };
  }, [day, month, year]);

  return (
    <View>
      <InputField
        label="Son aybaşı günü"
        value={day}
        onChangeText={setDay}
        placeholder="15"
        keyboardType="numeric"
        suffix="gün"
      />
      <InputField
        label="Ay"
        value={month}
        onChangeText={setMonth}
        placeholder="06"
        keyboardType="numeric"
        suffix="ay"
      />
      <InputField
        label="İl"
        value={year}
        onChangeText={setYear}
        placeholder="2026"
        keyboardType="numeric"
        suffix="il"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Hamiləlik həftəsi"
            value={`${result.currentWeek} həftə ${result.currentDay} gün`}
            highlight
            bold
          />
          <ResultRow label="Trimester" value={result.trimester} />
          <ResultRow label="Təxmini doğum tarixi" value={result.dueDate} bold />
          <ResultRow
            label="Qalan vaxt"
            value={`${result.weeksRemaining} həftə (${result.daysRemaining} gün)`}
          />
        </ResultSection>
      )}
    </View>
  );
}
