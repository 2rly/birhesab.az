import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

export function DateDiffCalculator() {
  const { colors } = useTheme();
  const [d1, setD1] = useState("1");
  const [m1, setM1] = useState("1");
  const [y1, setY1] = useState("2024");
  const [d2, setD2] = useState(String(new Date().getDate()));
  const [m2, setM2] = useState(String(new Date().getMonth() + 1));
  const [y2, setY2] = useState(String(new Date().getFullYear()));

  const result = useMemo(() => {
    const date1 = new Date(
      parseInt(y1) || 2024,
      (parseInt(m1) || 1) - 1,
      parseInt(d1) || 1
    );
    const date2 = new Date(
      parseInt(y2) || 2024,
      (parseInt(m2) || 1) - 1,
      parseInt(d2) || 1
    );

    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return null;

    const start = date1 < date2 ? date1 : date2;
    const end = date1 < date2 ? date2 : date1;

    const totalMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

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

    return { years, months, days, totalDays, totalWeeks, totalHours };
  }, [d1, m1, y1, d2, m2, y2]);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Başlanğıc tarix</Text>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <InputField label="Gün" value={d1} onChangeText={setD1} placeholder="1" keyboardType="numeric" />
        </View>
        <View style={styles.dateField}>
          <InputField label="Ay" value={m1} onChangeText={setM1} placeholder="1" keyboardType="numeric" />
        </View>
        <View style={styles.dateFieldYear}>
          <InputField label="İl" value={y1} onChangeText={setY1} placeholder="2024" keyboardType="numeric" />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.n700, marginTop: 8 }]}>Son tarix</Text>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <InputField label="Gün" value={d2} onChangeText={setD2} placeholder="1" keyboardType="numeric" />
        </View>
        <View style={styles.dateField}>
          <InputField label="Ay" value={m2} onChangeText={setM2} placeholder="1" keyboardType="numeric" />
        </View>
        <View style={styles.dateFieldYear}>
          <InputField label="İl" value={y2} onChangeText={setY2} placeholder="2024" keyboardType="numeric" />
        </View>
      </View>

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Fərq"
            value={`${result.years} il ${result.months} ay ${result.days} gün`}
            highlight
            bold
          />
          <ResultRow label="Ümumi gün" value={`${result.totalDays.toLocaleString()} gün`} />
          <ResultRow label="Ümumi həftə" value={`${result.totalWeeks.toLocaleString()} həftə`} />
          <ResultRow label="Ümumi saat" value={`${result.totalHours.toLocaleString()} saat`} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  dateRow: { flexDirection: "row", gap: 8 },
  dateField: { flex: 1 },
  dateFieldYear: { flex: 1.5 },
});
