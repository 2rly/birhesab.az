import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type OvertimeType = "weekday" | "night" | "weekend";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function OvertimeCalculator() {
  const [salary, setSalary] = useState("2000");
  const [overtimeHours, setOvertimeHours] = useState("10");
  const [workDays, setWorkDays] = useState("22");
  const [dailyHours, setDailyHours] = useState("8");
  const [overtimeType, setOvertimeType] = useState<OvertimeType>("weekday");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const ot = parseFloat(overtimeHours) || 0;
    const days = parseInt(workDays) || 0;
    const hours = parseInt(dailyHours) || 0;
    if (s <= 0 || ot <= 0 || days <= 0 || hours <= 0) return null;

    const totalMonthlyHours = days * hours;
    const hourlyRate = s / totalMonthlyHours;

    let multiplier: number;
    switch (overtimeType) {
      case "weekday":
        multiplier = 2;
        break;
      case "night":
        multiplier = 1.2;
        break;
      case "weekend":
        multiplier = 2;
        break;
    }

    const overtimeRate = hourlyRate * multiplier;
    const overtimePayment = overtimeRate * ot;
    const totalSalary = s + overtimePayment;

    return {
      hourlyRate,
      multiplier,
      overtimeRate,
      overtimePayment,
      totalSalary,
      totalMonthlyHours,
    };
  }, [salary, overtimeHours, workDays, dailyHours, overtimeType]);

  return (
    <View>
      <SegmentControl
        label="Əlavə iş növü"
        options={[
          { value: "weekday", label: "İş günü (2x)" },
          { value: "night", label: "Gecə (1.2x)" },
          { value: "weekend", label: "İstirahət (2x)" },
        ]}
        selected={overtimeType}
        onSelect={setOvertimeType}
      />

      <InputField
        label="Aylıq gross əmək haqqı"
        value={salary}
        onChangeText={setSalary}
        placeholder="2000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="Əlavə iş saatı"
        value={overtimeHours}
        onChangeText={setOvertimeHours}
        placeholder="10"
        keyboardType="decimal-pad"
        suffix="saat"
      />
      <InputField
        label="Aylıq iş günü"
        value={workDays}
        onChangeText={setWorkDays}
        placeholder="22"
        keyboardType="numeric"
        suffix="gün"
      />
      <InputField
        label="Gündəlik iş saatı"
        value={dailyHours}
        onChangeText={setDailyHours}
        placeholder="8"
        keyboardType="numeric"
        suffix="saat"
      />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow
              label="Əlavə iş haqqı"
              value={fmt(result.overtimePayment)}
              highlight
              bold
            />
            <ResultRow
              label="Ümumi əmək haqqı"
              value={fmt(result.totalSalary)}
              bold
            />
          </ResultSection>

          <ResultSection title="Hesablama detalları">
            <ResultRow
              label="Aylıq iş saatı"
              value={`${result.totalMonthlyHours} saat`}
            />
            <ResultRow
              label="Saatlıq tarif"
              value={fmt(result.hourlyRate)}
            />
            <ResultRow
              label="Əmsalı"
              value={`×${result.multiplier}`}
            />
            <ResultRow
              label="Əlavə saatlıq tarif"
              value={fmt(result.overtimeRate)}
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}
