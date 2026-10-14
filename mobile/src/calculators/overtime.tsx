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
  const [salary, setSalary] = useState("1000");
  const [hours, setHours] = useState("10");
  const [workDays, setWorkDays] = useState("22");
  const [dailyHours, setDailyHours] = useState("8");
  const [type, setType] = useState<OvertimeType>("weekday");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const h = parseFloat(hours) || 0;
    const wd = parseFloat(workDays) || 22;
    const dh = parseFloat(dailyHours) || 8;
    if (s <= 0 || h <= 0) return null;

    const hourlyRate = s / (wd * dh);
    let multiplier = 2;
    if (type === "night") multiplier = 2.2;
    if (type === "weekend") multiplier = 2;

    const overtimePay = hourlyRate * multiplier * h;
    const totalSalary = s + overtimePay;

    return { hourlyRate, multiplier, overtimePay, totalSalary };
  }, [salary, hours, workDays, dailyHours, type]);

  return (
    <View>
      <SegmentControl
        label="Əlavə iş növü"
        options={[
          { value: "weekday" as OvertimeType, label: "İş günü ×2" },
          { value: "night" as OvertimeType, label: "Gecə ×2.2" },
          { value: "weekend" as OvertimeType, label: "İstirahət ×2" },
        ]}
        selected={type}
        onSelect={setType}
      />

      <InputField
        label="Aylıq əmək haqqı (gross)"
        value={salary}
        onChangeText={setSalary}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="Əlavə iş saatı"
        value={hours}
        onChangeText={setHours}
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
        <ResultSection title="Nəticə">
          <ResultRow
            label="Saatlıq tarif"
            value={fmt(result.hourlyRate)}
          />
          <ResultRow
            label="Əmsalı"
            value={`×${result.multiplier}`}
          />
          <ResultRow
            label="Əlavə iş haqqı"
            value={fmt(result.overtimePay)}
            highlight
            bold
          />
          <ResultRow
            label="Ümumi maaş"
            value={fmt(result.totalSalary)}
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}
