import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const ZODIAC = [
  { name: "Oğlaq", from: [1, 1], to: [1, 19] },
  { name: "Dolça", from: [1, 20], to: [2, 18] },
  { name: "Balıqlar", from: [2, 19], to: [3, 20] },
  { name: "Qoç", from: [3, 21], to: [4, 19] },
  { name: "Buğa", from: [4, 20], to: [5, 20] },
  { name: "Əkizlər", from: [5, 21], to: [6, 20] },
  { name: "Xərçəng", from: [6, 21], to: [7, 22] },
  { name: "Şir", from: [7, 23], to: [8, 22] },
  { name: "Qız", from: [8, 23], to: [9, 22] },
  { name: "Tərəzi", from: [9, 23], to: [10, 22] },
  { name: "Əqrəb", from: [10, 23], to: [11, 21] },
  { name: "Oxatan", from: [11, 22], to: [12, 21] },
  { name: "Oğlaq", from: [12, 22], to: [12, 31] },
];

function getZodiac(month: number, day: number): string {
  for (const z of ZODIAC) {
    const [fm, fd] = z.from;
    const [tm, td] = z.to;
    if (
      (month === fm && day >= fd) ||
      (month === tm && day <= td) ||
      (month > fm && month < tm)
    ) {
      return z.name;
    }
  }
  return "Oğlaq";
}

export function AgeCalculator() {
  const { colors } = useTheme();
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("1990");

  const result = useMemo(() => {
    const d = parseInt(day) || 0;
    const m = parseInt(month) || 0;
    const y = parseInt(year) || 0;
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2030) return null;

    const birthDate = new Date(y, m - 1, d);
    const today = new Date();

    if (birthDate > today) return null;

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const nextBirthday = new Date(today.getFullYear(), m - 1, d);
    if (nextBirthday <= today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const daysUntilBirthday = Math.ceil(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const zodiac = getZodiac(m, d);

    return { years, months, days, totalDays, daysUntilBirthday, zodiac };
  }, [day, month, year]);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Doğum tarixi</Text>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <InputField
            label="Gün"
            value={day}
            onChangeText={setDay}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.dateField}>
          <InputField
            label="Ay"
            value={month}
            onChangeText={setMonth}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.dateFieldYear}>
          <InputField
            label="İl"
            value={year}
            onChangeText={setYear}
            placeholder="1990"
            keyboardType="numeric"
          />
        </View>
      </View>

      {result && (
        <>
          <View style={[styles.ageBox, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.ageValue, { color: colors.accent }]}>
              {result.years}
            </Text>
            <Text style={[styles.ageUnit, { color: colors.n700 }]}>
              il {result.months} ay {result.days} gün
            </Text>
          </View>

          <ResultSection title="Ətraflı">
            <ResultRow label="Yaş" value={`${result.years} il`} bold />
            <ResultRow label="Ümumi gün" value={`${result.totalDays.toLocaleString()} gün`} />
            <ResultRow label="Ümumi saat" value={`${(result.totalDays * 24).toLocaleString()} saat`} />
            <ResultRow
              label="Növbəti ad günü"
              value={`${result.daysUntilBirthday} gün sonra`}
            />
            <ResultRow label="Bürc" value={result.zodiac} />
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  dateRow: { flexDirection: "row", gap: 8 },
  dateField: { flex: 1 },
  dateFieldYear: { flex: 1.5 },
  ageBox: {
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  ageValue: { fontSize: 52, fontWeight: "800" },
  ageUnit: { fontSize: 16, fontWeight: "500", marginTop: 4 },
});
