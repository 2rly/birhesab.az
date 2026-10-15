import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultSection } from "@/components/ResultRow";
import { DateField } from "@/components/Controls";
import { SectionHeading, Paragraph, Card, ResultHero, StatGrid, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum, parseISODate, toISODate, fmtDateDots } from "@/lib/format";
import { Step, Calc, MiniRow } from "./_leave-parts";

// ============================================================
// Bülleten (xəstəlik vərəqi) pulu hesablayıcısı
// Azərbaycan Respublikası əmək qanunvericiliyi
// ============================================================

// Bayram və istirahət günləri: şənbə, bazar + rəsmi bayramlar
const PUBLIC_HOLIDAYS_2024 = [
  "2024-01-01", "2024-01-02", // Yeni il
  "2024-01-20", // 20 Yanvar
  "2024-03-08", // Qadınlar günü
  "2024-03-20", "2024-03-21", "2024-03-22", "2024-03-23", "2024-03-24", // Novruz
  "2024-04-10", "2024-04-11", // Ramazan bayramı (təxmini)
  "2024-05-09", // Faşizm üzərində qələbə
  "2024-05-28", // Respublika günü
  "2024-06-15", // Milli qurtuluş günü
  "2024-06-16", "2024-06-17", // Qurban bayramı (təxmini)
  "2024-06-26", // Silahlı qüvvələr günü
  "2024-11-09", // Bayraq günü
  "2024-11-12", // Konstitusiya günü
  "2024-11-17", // Milli dirçəliş günü
  "2024-12-31", // Dünya azərbaycanlıların həmrəylik günü
];

const PUBLIC_HOLIDAYS_2025 = [
  "2025-01-01", "2025-01-02", // Yeni il
  "2025-01-20", // 20 Yanvar
  "2025-03-08", // Qadınlar günü
  "2025-03-20", "2025-03-21", "2025-03-22", "2025-03-23", "2025-03-24", // Novruz
  "2025-03-30", "2025-03-31", // Ramazan bayramı (təxmini)
  "2025-05-09", // Faşizm üzərində qələbə
  "2025-05-28", // Respublika günü
  "2025-06-06", "2025-06-07", // Qurban bayramı (təxmini)
  "2025-06-15", // Milli qurtuluş günü
  "2025-06-26", // Silahlı qüvvələr günü
  "2025-11-09", // Bayraq günü
  "2025-11-12", // Konstitusiya günü
  "2025-11-17", // Milli dirçəliş günü
  "2025-12-31", // Dünya azərbaycanlıların həmrəylik günü
];

const ALL_HOLIDAYS = new Set([...PUBLIC_HOLIDAYS_2024, ...PUBLIC_HOLIDAYS_2025]);

// Azərbaycan dilində qısa həftə günləri (0 = bazar)
const WEEKDAYS_SHORT = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."];

function isWorkDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  if (ALL_HOLIDAYS.has(toISODate(date))) return false;
  return true;
}

function countWorkDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    if (isWorkDay(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

const formatMoney = (n: number) => fmtNum(n, 2);
const formatDate = (d: Date) => fmtDateDots(d);

const FORMULA_TITLE = "Bülleten pulu necə hesablanır?";
const FORMULA_CONTENT = `Bülleten (xəstəlik vərəqi) pulu aşağıdakı qaydada hesablanır:

1. Xəstəlik vərəqinin tarixi müəyyən edilir
2. Bu tarixlərdəki iş günləri sayılır (şənbə, bazar və bayram günləri çıxılır)
3. Xəstəlik başlanğıcından əvvəlki son 12 aydakı iş günləri hesablanır
4. Son 12 aydakı ümumi qazanc həmin iş günlərinə bölünür
5. Bir günlük qazanc × xəstəlik iş günləri = bülleten pulu

Nümunə:
Xəstəlik tarixi: 24.02.2025 – 29.02.2025 (4 iş günü)
Son 12 ay: fevral 2024 – yanvar 2025 (241 iş günü)
Ümumi qazanc: 20 500 AZN
Bir iş gününə düşən: 20 500 ÷ 241 = 85,06 AZN
Bülleten pulu: 85,06 × 4 = 340,24 AZN`;

export function SickLeaveCalculator() {
  const { colors } = useTheme();
  const [sickStartStr, setSickStartStr] = useState("");
  const [sickEndStr, setSickEndStr] = useState("");
  const [totalEarnings, setTotalEarnings] = useState("");

  const result = useMemo(() => {
    if (!sickStartStr || !sickEndStr || !totalEarnings) return null;

    const sickStart = parseISODate(sickStartStr);
    const sickEnd = parseISODate(sickEndStr);
    const earnings = parseFloat(totalEarnings.replace(",", "."));

    if (!sickStart || !sickEnd || !earnings || earnings <= 0) return null;
    if (sickEnd < sickStart) return null;

    const sickWorkDays = countWorkDays(sickStart, sickEnd);

    // Son 12 ay (xəstəlik başlanğıcından 12 ay əvvəl)
    const periodEnd = new Date(sickStart);
    periodEnd.setDate(periodEnd.getDate() - 1);
    const periodStart = new Date(periodEnd);
    periodStart.setFullYear(periodStart.getFullYear() - 1);
    periodStart.setDate(periodStart.getDate() + 1);

    const yearWorkDays = countWorkDays(periodStart, periodEnd);
    if (yearWorkDays <= 0) return null;

    const dailyEarning = earnings / yearWorkDays;
    const bulletenAmount = dailyEarning * sickWorkDays;

    const sickDaysList: { date: Date; isWorkDay: boolean }[] = [];
    const current = new Date(sickStart);
    while (current <= sickEnd) {
      sickDaysList.push({ date: new Date(current), isWorkDay: isWorkDay(current) });
      current.setDate(current.getDate() + 1);
    }

    return {
      sickStart,
      sickEnd,
      sickWorkDays,
      periodStart,
      periodEnd,
      yearWorkDays,
      earnings,
      dailyEarning,
      bulletenAmount,
      totalCalendarDays: sickDaysList.length,
      sickDaysList,
    };
  }, [sickStartStr, sickEndStr, totalEarnings]);

  return (
    <View>
      <DateField label="📅 Xəstəlik başlanğıc tarixi" value={sickStartStr} onChange={setSickStartStr} />
      <DateField label="📅 Xəstəlik bitmə tarixi" value={sickEndStr} onChange={setSickEndStr} />
      <InputField
        label="💰 Son 12 aydakı ümumi qazanc (AZN)"
        value={totalEarnings}
        onChangeText={setTotalEarnings}
        placeholder="20500"
        keyboardType="decimal-pad"
        hint="Xəstəlik başlanğıcından əvvəlki 12 ay ərzindəki ümumi əmək haqqı"
      />

      {result ? (
        <View>
          <ResultHero label="Bülleten pulu" value={formatMoney(result.bulletenAmount)} sub="AZN" />

          <ResultSection title="📋 Hesablama qaydası · addım-addım">
            <Step n={1} title="Xəstəlik müddəti">
              <MiniRow label="Tarix:" value={`${formatDate(result.sickStart)} – ${formatDate(result.sickEnd)}`} />
              <MiniRow label="Təqvim günləri:" value={`${result.totalCalendarDays} gün`} />
              <MiniRow label="İş günləri:" value={`${result.sickWorkDays} gün`} bold />
              {result.totalCalendarDays !== result.sickWorkDays && (
                <Text style={{ fontSize: 11, color: colors.n580, marginTop: 2 }}>
                  (şənbə, bazar və bayram günləri çıxılıb)
                </Text>
              )}
            </Step>
            <Step n={2} title="Son 12 aydakı iş günləri">
              <MiniRow label="Dövr:" value={`${formatDate(result.periodStart)} – ${formatDate(result.periodEnd)}`} />
              <MiniRow label="İş günlərinin sayı:" value={`${result.yearWorkDays} gün`} bold />
            </Step>
            <Step n={3} title="Bir iş gününə düşən qazanc">
              <Calc strong={`${formatMoney(result.dailyEarning)} AZN/gün`}>
                {formatMoney(result.earnings)} AZN ÷ {result.yearWorkDays} gün ={" "}
              </Calc>
            </Step>
            <Step n={4} tone="green" title="Bülleten pulu">
              <Calc strong={`${formatMoney(result.bulletenAmount)} AZN`} color="#22c55e">
                {formatMoney(result.dailyEarning)} AZN × {result.sickWorkDays} gün ={" "}
              </Calc>
            </Step>
          </ResultSection>

          <ResultSection title="📅 Xəstəlik günləri">
            <View style={{ padding: 12 }}>
              <View style={st.chips}>
                {result.sickDaysList.map((d, i) => {
                  const dd = String(d.date.getDate()).padStart(2, "0");
                  const mm = String(d.date.getMonth() + 1).padStart(2, "0");
                  return (
                    <Text
                      key={i}
                      style={[
                        st.chip,
                        d.isWorkDay
                          ? { backgroundColor: colors.accent + "22", color: colors.accent, borderColor: colors.accent + "55" }
                          : {
                              backgroundColor: colors.n240,
                              color: colors.n580,
                              borderColor: colors.n240,
                              textDecorationLine: "line-through",
                            },
                      ]}
                    >
                      {`${WEEKDAYS_SHORT[d.date.getDay()]}, ${dd}.${mm}${d.isWorkDay ? " ✓" : ""}`}
                    </Text>
                  );
                })}
              </View>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                <View style={st.legend}>
                  <View style={[st.swatch, { backgroundColor: colors.accent + "22", borderColor: colors.accent + "55" }]} />
                  <Text style={{ fontSize: 12, color: colors.n580 }}>İş günü</Text>
                </View>
                <View style={st.legend}>
                  <View style={[st.swatch, { backgroundColor: colors.n240, borderColor: colors.n240 }]} />
                  <Text style={{ fontSize: 12, color: colors.n580 }}>İstirahət / bayram</Text>
                </View>
              </View>
            </View>
          </ResultSection>

          <SectionHeading icon="📊">Xülasə</SectionHeading>
          <StatGrid
            items={[
              { label: "Xəstəlik günü", value: `${result.sickWorkDays} gün` },
              { label: "Günlük qazanc", value: `${formatMoney(result.dailyEarning)}₼` },
              { label: "12 aylıq qazanc", value: `${formatMoney(result.earnings)}₼` },
              { label: "Bülleten pulu", value: `${formatMoney(result.bulletenAmount)}₼`, accent: true },
            ]}
          />
        </View>
      ) : (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>🏥</Text>
          <Paragraph>Nəticəni görmək üçün xəstəlik tarixlərini və qazancınızı daxil edin.</Paragraph>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "overtime", "vacation-pay", "unemployment-benefit"]} />
    </View>
  );
}

const st = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { fontSize: 12, fontWeight: "600", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, overflow: "hidden" },
  legend: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 3, borderWidth: 1 },
});
