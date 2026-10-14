import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const DAY_NAMES = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${DAY_NAMES[d.getDay()]}`;
}

export function DateDiffCalculator() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const result = useMemo(() => {
    if (!startDate || !endDate) return null;
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return null;

    const start = sd < ed ? sd : ed;
    const end = sd < ed ? ed : sd;

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    return {
      years, months, days, totalDays, totalWeeks, totalHours, totalMinutes,
      startFormatted: fmtDate(start),
      endFormatted: fmtDate(end),
    };
  }, [startDate, endDate]);

  return (
    <View>
      <InputField label="Başlanğıc tarixi" value={startDate} onChangeText={setStartDate} placeholder="2024-01-01" />
      <InputField label="Son tarix" value={endDate} onChangeText={setEndDate} placeholder="2024-12-31" />

      {result && (
        <>
          <ResultSection title="Fərq">
            <ResultRow label="Müddət" value={`${result.years} il ${result.months} ay ${result.days} gün`} highlight bold />
          </ResultSection>
          <ResultSection title="Ətraflı">
            <ResultRow label="Ümumi gün" value={`${result.totalDays.toLocaleString()} gün`} />
            <ResultRow label="Ümumi həftə" value={`${result.totalWeeks.toLocaleString()} həftə`} />
            <ResultRow label="Ümumi saat" value={`${result.totalHours.toLocaleString()} saat`} />
            <ResultRow label="Ümumi dəqiqə" value={`${result.totalMinutes.toLocaleString()} dəqiqə`} />
          </ResultSection>
          <ResultSection title="Tarixlər">
            <ResultRow label="Başlanğıc" value={result.startFormatted} />
            <ResultRow label="Son" value={result.endFormatted} />
          </ResultSection>
        </>
      )}
    </View>
  );
}
