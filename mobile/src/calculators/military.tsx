import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type ServiceType = "mandatory" | "short" | "reserve";

const SERVICE_MONTHS: Record<ServiceType, number> = {
  mandatory: 12,
  short: 6,
  reserve: 3,
};

export function MilitaryCalculator() {
  const [type, setType] = useState<ServiceType>("mandatory");
  const [startDate, setStartDate] = useState("");

  const result = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;

    const months = SERVICE_MONTHS[type];
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);

    const today = new Date();
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
    const passedDays = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
    const remainingDays = Math.max(0, totalDays - passedDays);
    const progress = Math.min(100, (passedDays / totalDays) * 100);

    const endStr = `${end.getDate()}.${(end.getMonth() + 1).toString().padStart(2, "0")}.${end.getFullYear()}`;

    return { months, totalDays, passedDays, remainingDays, progress, endDate: endStr };
  }, [type, startDate]);

  return (
    <View>
      <SegmentControl
        label="Xidmət növü"
        options={[
          { value: "mandatory", label: "Müddətli (12 ay)" },
          { value: "short", label: "Qısaldılmış (6 ay)" },
          { value: "reserve", label: "Ehtiyat (3 ay)" },
        ]}
        selected={type}
        onSelect={setType}
      />
      <InputField label="Xidmətə başlama tarixi" value={startDate} onChangeText={setStartDate} placeholder="2024-06-15" />

      {result && (
        <ResultSection title="Hərbi xidmət">
          <ResultRow label="Müddət" value={`${result.months} ay`} />
          <ResultRow label="Bitmə tarixi" value={result.endDate} highlight bold />
          <ResultRow label="Keçən günlər" value={`${result.passedDays} gün`} />
          <ResultRow label="Qalan günlər" value={`${result.remainingDays} gün`} />
          <ResultRow label="Tamamlanıb" value={`${result.progress.toFixed(0)}%`} />
        </ResultSection>
      )}
    </View>
  );
}
