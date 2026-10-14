import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Method = "lmp" | "conception" | "ultrasound" | "ivf";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

const BABY_SIZES = [
  { week: 8, size: "Moruq", length: "1.6 sm", weight: "1 q" },
  { week: 12, size: "Gavalı", length: "5.4 sm", weight: "14 q" },
  { week: 16, size: "Avokado", length: "11.6 sm", weight: "100 q" },
  { week: 20, size: "Banan", length: "16.5 sm", weight: "300 q" },
  { week: 24, size: "Qarğıdalı", length: "30 sm", weight: "600 q" },
  { week: 28, size: "Badımcan", length: "37 sm", weight: "1 kq" },
  { week: 32, size: "Qabaq", length: "42 sm", weight: "1.7 kq" },
  { week: 36, size: "Ananas", length: "47 sm", weight: "2.6 kq" },
  { week: 40, size: "Qarpız", length: "51 sm", weight: "3.4 kq" },
];

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

export function PregnancyCalculator() {
  const { colors } = useTheme();
  const [method, setMethod] = useState<Method>("lmp");
  const [dateInput, setDateInput] = useState("");
  const [usWeeks, setUsWeeks] = useState("");
  const [usDays, setUsDays] = useState("");

  const result = useMemo(() => {
    if (!dateInput) return null;
    const inputDate = new Date(dateInput);
    if (isNaN(inputDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lmpDate: Date;
    switch (method) {
      case "lmp":
        lmpDate = inputDate;
        break;
      case "conception":
      case "ivf":
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
        break;
      case "ultrasound": {
        const totalDays = (parseInt(usWeeks) || 0) * 7 + (parseInt(usDays) || 0);
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - totalDays);
        break;
      }
    }

    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);

    const daysPassed = daysBetween(lmpDate, today);
    if (daysPassed < 0) return null;

    const currentWeek = Math.min(Math.floor(daysPassed / 7), 42);
    const currentDay = daysPassed % 7;
    const daysRemaining = Math.max(0, daysBetween(today, dueDate));
    const progress = Math.min(100, (daysPassed / 280) * 100);

    const trimester = currentWeek < 13 ? "I" : currentWeek < 28 ? "II" : "III";

    const conceptionDate = new Date(lmpDate);
    conceptionDate.setDate(conceptionDate.getDate() + 14);

    const babySize = [...BABY_SIZES].reverse().find((s) => currentWeek >= s.week) || BABY_SIZES[0];

    return { lmpDate, dueDate, conceptionDate, currentWeek, currentDay, daysRemaining, progress, trimester, babySize };
  }, [dateInput, method, usWeeks, usDays]);

  const dateLabel =
    method === "lmp" ? "Son adet tarixi" :
    method === "conception" ? "Konsepsiya tarixi" :
    method === "ultrasound" ? "USM tarixi" : "IVF transfer tarixi";

  return (
    <View>
      <SegmentControl
        label="Hesablama üsulu"
        options={[
          { value: "lmp", label: "SAT" },
          { value: "conception", label: "Konsepsiya" },
          { value: "ultrasound", label: "USM" },
          { value: "ivf", label: "IVF" },
        ]}
        selected={method}
        onSelect={setMethod}
      />
      <InputField label={dateLabel} value={dateInput} onChangeText={setDateInput} placeholder="2024-06-15" />
      {method === "ultrasound" && (
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <InputField label="Həftə" value={usWeeks} onChangeText={setUsWeeks} placeholder="12" keyboardType="numeric" />
          </View>
          <View style={styles.halfInput}>
            <InputField label="Gün" value={usDays} onChangeText={setUsDays} placeholder="0" keyboardType="numeric" />
          </View>
        </View>
      )}

      {result && (
        <>
          <ResultSection title="Hamiləlik həftəsi">
            <ResultRow label="Hazırkı həftə" value={`${result.currentWeek}+${result.currentDay} həftə`} highlight bold />
            <ResultRow label="Trimester" value={`${result.trimester} Trimester`} />
            <ResultRow label="Tamamlanıb" value={`${result.progress.toFixed(0)}%`} />
          </ResultSection>
          <ResultSection title="Tarixlər">
            <ResultRow label="Təxmini doğuş tarixi" value={fmtDate(result.dueDate)} bold />
            <ResultRow label="Konsepsiya tarixi" value={fmtDate(result.conceptionDate)} />
            <ResultRow label="Qalan gün" value={`${result.daysRemaining} gün`} />
          </ResultSection>
          <ResultSection title={`Körpənin ölçüsü (${result.currentWeek}. həftə)`}>
            <ResultRow label="Uzunluq" value={result.babySize.length} />
            <ResultRow label="Çəki" value={result.babySize.weight} />
            <ResultRow label="Müqayisə" value={result.babySize.size} />
          </ResultSection>
          <View style={[styles.note, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.noteText, { color: colors.n580 }]}>
              Bu hesablama təxminidir. Normal doğuş 37–42 həftə arasında baş verir.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  halfInput: { flex: 1 },
  note: { borderRadius: 10, padding: 12, marginTop: 16 },
  noteText: { fontSize: 12, lineHeight: 18 },
});
