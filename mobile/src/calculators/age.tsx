import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const ZODIAC = [
  { sign: "Oğlaq", start: [1, 1], end: [1, 19] },
  { sign: "Dolça", start: [1, 20], end: [2, 18] },
  { sign: "Balıqlar", start: [2, 19], end: [3, 20] },
  { sign: "Qoç", start: [3, 21], end: [4, 19] },
  { sign: "Buğa", start: [4, 20], end: [5, 20] },
  { sign: "Əkizlər", start: [5, 21], end: [6, 20] },
  { sign: "Xərçəng", start: [6, 21], end: [7, 22] },
  { sign: "Şir", start: [7, 23], end: [8, 22] },
  { sign: "Qız", start: [8, 23], end: [9, 22] },
  { sign: "Tərəzi", start: [9, 23], end: [10, 22] },
  { sign: "Əqrəb", start: [10, 23], end: [11, 21] },
  { sign: "Oxatan", start: [11, 22], end: [12, 21] },
  { sign: "Oğlaq", start: [12, 22], end: [12, 31] },
];

function getZodiac(m: number, d: number): string {
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if ((m === sm && d >= sd) || (m === em && d <= ed)) return z.sign;
  }
  return "Oğlaq";
}

export function AgeCalculator() {
  const { colors } = useTheme();
  const [birthDate, setBirthDate] = useState("");

  const result = useMemo(() => {
    if (!birthDate) return null;
    const bd = new Date(birthDate);
    if (isNaN(bd.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bd > today) return null;

    let years = today.getFullYear() - bd.getFullYear();
    let months = today.getMonth() - bd.getMonth();
    let days = today.getDate() - bd.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((today.getTime() - bd.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    let nextBirthday = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    if (nextBirthday <= today) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);

    const zodiac = getZodiac(bd.getMonth() + 1, bd.getDate());

    return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, daysUntilBirthday, zodiac };
  }, [birthDate]);

  return (
    <View>
      <InputField label="Doğum tarixi" value={birthDate} onChangeText={setBirthDate} placeholder="1995-03-15" />

      {result && (
        <>
          <ResultSection title="Yaşınız">
            <ResultRow label="Yaş" value={`${result.years} il ${result.months} ay ${result.days} gün`} highlight bold />
            <ResultRow label="Bürc" value={result.zodiac} />
            <ResultRow label="Növbəti ad gününə" value={`${result.daysUntilBirthday} gün`} />
          </ResultSection>
          <ResultSection title="Ətraflı">
            <ResultRow label="Ümumi ay" value={`${result.totalMonths} ay`} />
            <ResultRow label="Ümumi həftə" value={`${result.totalWeeks} həftə`} />
            <ResultRow label="Ümumi gün" value={`${result.totalDays.toLocaleString()} gün`} />
            <ResultRow label="Ümumi saat" value={`${result.totalHours.toLocaleString()} saat`} />
          </ResultSection>
        </>
      )}
    </View>
  );
}
