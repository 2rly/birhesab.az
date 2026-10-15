import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";
import { DateField } from "@/components/Controls";
import { FormulaSection, RelatedCalculators, ResultHero, StatGrid } from "@/components/Content";
import { fmtNum } from "@/lib/format";

type Mode = "difference" | "add-subtract";

const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

const FORMULA_TITLE = "Tarix fərqi necə hesablanır?";
const FORMULA_CONTENT = `İki tarix arasında fərq millisaniyələr hesablanır və sonra günlərə, həftələrə, aylara çevrilir.

Fərq = Son tarix - Başlanğıc tarix

Nəticələr:
- Dəqiq yaş formatı: X il, Y ay, Z gün
- Ümumi günlər, həftələr, saatlar
- Aylıq fərq

Gün əlavə etmək / çıxmaq:
Tarixə müəyyən sayılı gün əlavə edilə və ya çıxıla bilər.
Məsələn: 1 Yanvar 2024 + 90 gün = 31 Mart 2024`;

function fmt(n: number): string {
  return fmtNum(n, 0);
}

function formatDateLang(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${WEEKDAYS[date.getDay()]}`;
}

export function DateDiffCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("difference");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  const result = useMemo(() => {
    if (mode === "difference") {
      if (!date1 || !date2) return null;
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

      const start = d1 < d2 ? d1 : d2;
      const end = d1 < d2 ? d2 : d1;

      const diffMs = end.getTime() - start.getTime();
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();

      let years = end.getFullYear() - start.getFullYear();
      let mos = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();
      if (days < 0) {
        mos--;
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (mos < 0) {
        years--;
        mos += 12;
      }

      return {
        type: "difference" as const,
        startDate: formatDateLang(start),
        endDate: formatDateLang(end),
        years,
        months: mos,
        days,
        totalDays,
        totalWeeks,
        remainingDays,
        totalHours,
        totalMinutes,
        totalMonths,
      };
    }

    if (!baseDate || !daysToAdd) return null;
    const base = new Date(baseDate);
    const numDays = parseInt(daysToAdd);
    if (isNaN(base.getTime()) || isNaN(numDays) || numDays < 0) return null;

    const resultDate = new Date(base);
    if (operation === "add") resultDate.setDate(resultDate.getDate() + numDays);
    else resultDate.setDate(resultDate.getDate() - numDays);

    return {
      type: "add-subtract" as const,
      baseDate: formatDateLang(base),
      resultDate: formatDateLang(resultDate),
      numDays,
      operation,
    };
  }, [mode, date1, date2, baseDate, daysToAdd, operation]);

  return (
    <View>
      <SegmentControl
        options={[
          { value: "difference", label: "Tarix fərqi" },
          { value: "add-subtract", label: "Gün əlavə et / çıx" },
        ]}
        selected={mode}
        onSelect={setMode}
      />

      {mode === "difference" ? (
        <>
          <DateField label="Başlanğıc tarixi" value={date1} onChange={setDate1} />
          <DateField label="Son tarix" value={date2} onChange={setDate2} />
        </>
      ) : (
        <>
          <DateField label="Başlanğıc tarixi" value={baseDate} onChange={setBaseDate} />
          <SegmentControl
            label="Əməliyyat"
            options={[
              { value: "add", label: "+ Əlavə et" },
              { value: "subtract", label: "- Çıx" },
            ]}
            selected={operation}
            onSelect={setOperation}
          />
          <InputField
            label="Gün sayı"
            value={daysToAdd}
            onChangeText={setDaysToAdd}
            placeholder="30"
            keyboardType="number-pad"
          />
        </>
      )}

      {result ? (
        <View>
          {result.type === "difference" && (
            <>
              <ResultHero
                label="Tarixlər arasındakı fərq"
                value={`${result.years > 0 ? `${result.years} il, ` : ""}${result.months > 0 ? `${result.months} ay, ` : ""}${result.days} gün`}
                sub={`${result.startDate} — ${result.endDate}`}
              />

              <StatGrid
                items={[
                  { label: "Ümumi gün", value: fmt(result.totalDays) },
                  {
                    label: "Ümumi həftə",
                    value: `${fmt(result.totalWeeks)}${result.remainingDays > 0 ? ` + ${result.remainingDays} gün` : ""}`,
                  },
                  { label: "Ümumi ay", value: fmt(result.totalMonths) },
                  { label: "Ümumi saat", value: fmt(result.totalHours) },
                ]}
              />

              <ResultSection title="Ətraflı məlumat">
                <ResultRow label="Başlanğıc" value={result.startDate} />
                <ResultRow label="Son" value={result.endDate} />
                <ResultRow label="Dəqiq fərq" value={`${result.years} il, ${result.months} ay, ${result.days} gün`} />
                <ResultRow label="Günlərlə" value={`${fmt(result.totalDays)} gün`} />
                <ResultRow label="Saatlarla" value={`${fmt(result.totalHours)} saat`} />
                <ResultRow label="Dəqiqələrlə" value={`${fmt(result.totalMinutes)} dəq.`} />
              </ResultSection>
            </>
          )}

          {result.type === "add-subtract" && (
            <View style={styles.cards}>
              <View style={[styles.card, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <Text style={[styles.cardLabel, { color: colors.n580 }]}>Başlanğıc tarixi</Text>
                <Text style={[styles.cardValue, { color: colors.n940 }]}>{result.baseDate}</Text>
              </View>
              <View style={[styles.card, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                <Text style={[styles.cardLabel, { color: colors.onAccent }]}>
                  {result.operation === "add" ? `+${result.numDays} gün sonra` : `-${result.numDays} gün əvvəl`}
                </Text>
                <Text style={[styles.cardValue, { color: colors.onAccent }]}>{result.resultDate}</Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📆</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>Nəticəni görmək üçün tarixləri daxil edin.</Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["age", "timezone", "pregnancy", "date-difference"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 10, marginTop: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center" },
  cardLabel: { fontSize: 13, opacity: 0.9, textAlign: "center" },
  cardValue: { fontSize: 17, fontWeight: "700", marginTop: 4, textAlign: "center" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
