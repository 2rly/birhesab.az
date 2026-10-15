import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultSection } from "@/components/ResultRow";
import { Select } from "@/components/Select";
import { SectionHeading, Paragraph, Card, InfoBox, ResultHero, StatGrid, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { OptionCards, Step, Calc } from "./_leave-parts";

// ============================================================
// Təhsil məzuniyyəti haqqı hesablayıcısı
// Əmək Məcəlləsi maddə 123-124, 177
//
// Hesablama (maddə 177):
// 1. Məzuniyyətdən əvvəlki son 2 ayın əmək haqqı cəmlənir
// 2. Həmin 2 aydakı iş günlərinin sayına bölünür
// 3. Məzuniyyət günlərindəki iş günlərinin sayına vurulur
// ============================================================

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

interface LeaveType {
  id: string;
  label: string;
  description: string;
  calendarDays: number;
}

const leaveTypes: LeaveType[] = [
  { id: "higher-12", calendarDays: 30, label: "30 gün", description: "Ali təhsil, 1-2-ci kurs" },
  { id: "higher-34", calendarDays: 40, label: "40 gün", description: "Ali təhsil, qalan kurslar" },
  { id: "secondary-12", calendarDays: 20, label: "20 gün", description: "Orta ixtisas, 1-2-ci kurs" },
  { id: "secondary-34", calendarDays: 30, label: "30 gün", description: "Orta ixtisas, digər kurslar" },
  { id: "state-exam", calendarDays: 30, label: "30 gün", description: "Dövlət imtahanları" },
  { id: "diploma-higher", calendarDays: 120, label: "4 ay", description: "Diplom işi — ali təhsil" },
  { id: "diploma-secondary", calendarDays: 60, label: "2 ay", description: "Diplom işi — orta ixtisas" },
  { id: "vocational", calendarDays: 30, label: "30 gün", description: "Peşə təhsili" },
  { id: "general", calendarDays: 20, label: "20 gün", description: "Ümumtəhsil, buraxılış" },
];

function getWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) workDays++;
  }
  return workDays;
}

function getWorkingDaysInRange(year: number, month: number, day: number, calendarDays: number): number {
  let workDays = 0;
  const start = new Date(year, month, day);
  for (let i = 0; i < calendarDays; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    if (d.getDay() !== 0 && d.getDay() !== 6) workDays++;
  }
  return workDays;
}

const fmt = (n: number) => fmtNum(n, 2);

const FORMULA_TITLE = "Təhsil məzuniyyəti haqqı necə hesablanır?";
const FORMULA_CONTENT = `Hesablama qaydası (Əmək Məcəlləsi maddə 177):

1. Məzuniyyətdən əvvəlki son 2 ayın əmək haqqı cəmlənir
2. Həmin 2 aydakı iş günlərinin sayına bölünür (bir günlük əmək haqqı)
3. Məzuniyyət müddətindəki iş günlərinin sayına vurulur

Formula: (Ay1 + Ay2) ÷ (İş günü1 + İş günü2) × Məzuniyyətdəki iş günləri

Misal: Noyabr 700₼, Dekabr 900₼, 30 günlük məzuniyyət:
(700 + 900) ÷ (22 + 24) × 23 = 34,78 × 23 = 799,94₼

Məzuniyyət müddətləri (maddə 124):
• Ali təhsil (qiyabi) 1-2-ci kurs: 30 gün
• Ali təhsil (qiyabi) qalan kurslar: 40 gün
• Orta ixtisas 1-2-ci kurs: 20 gün, digər kurslar: 30 gün
• Dövlət imtahanları: 30 gün
• Diplom işi: ali — 4 aya qədər, orta ixtisas — 2 aya qədər
• Peşə təhsili: 30 gün
• Ümumtəhsil buraxılış: 20 gün`;

export function EducationLeaveCalculator() {
  const { colors } = useTheme();
  const [selectedLeave, setSelectedLeave] = useState("higher-12");
  const leaveType = leaveTypes.find((l) => l.id === selectedLeave)!;

  const [startMonth, setStartMonth] = useState(0);
  const [startYear, setStartYear] = useState(2026);
  const [startDay, setStartDay] = useState(1);

  const prev2 = useMemo(() => {
    let m1 = startMonth - 1,
      y1 = startYear;
    if (m1 < 0) {
      m1 = 11;
      y1--;
    }
    let m2 = m1 - 1,
      y2 = y1;
    if (m2 < 0) {
      m2 = 11;
      y2--;
    }
    return [
      { year: y2, month: m2 },
      { year: y1, month: m1 },
    ];
  }, [startMonth, startYear]);

  const [salary1, setSalary1] = useState("");
  const [salary2, setSalary2] = useState("");
  const [wd1, setWd1] = useState("");
  const [wd2, setWd2] = useState("");
  const [leaveWd, setLeaveWd] = useState("");

  const autoWd1 = useMemo(() => getWorkingDaysInMonth(prev2[0].year, prev2[0].month), [prev2]);
  const autoWd2 = useMemo(() => getWorkingDaysInMonth(prev2[1].year, prev2[1].month), [prev2]);
  const autoLeaveWd = useMemo(
    () => getWorkingDaysInRange(startYear, startMonth, startDay, leaveType.calendarDays),
    [startYear, startMonth, startDay, leaveType],
  );

  const workDays1 = wd1 ? parseInt(wd1) || 0 : autoWd1;
  const workDays2 = wd2 ? parseInt(wd2) || 0 : autoWd2;
  const leaveWorkDays = leaveWd ? parseInt(leaveWd) || 0 : autoLeaveWd;

  const result = useMemo(() => {
    const s1 = parseFloat(salary1.replace(",", ".")) || 0;
    const s2 = parseFloat(salary2.replace(",", ".")) || 0;
    const totalSalary = s1 + s2;
    const totalWd = workDays1 + workDays2;
    if (totalSalary <= 0 || totalWd <= 0 || leaveWorkDays <= 0) return null;
    const daily = totalSalary / totalWd;
    const pay = daily * leaveWorkDays;
    return { s1, s2, totalSalary, workDays1, workDays2, totalWd, daily, leaveWorkDays, pay };
  }, [salary1, salary2, workDays1, workDays2, leaveWorkDays]);

  return (
    <View>
      <OptionCards
        label="🎓 Məzuniyyət növü"
        columns={3}
        options={leaveTypes.map((lt) => ({ value: lt.id, label: lt.label, desc: lt.description }))}
        selected={selectedLeave}
        onSelect={setSelectedLeave}
      />

      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.n700, marginBottom: 6 }}>
        📅 Məzuniyyətin başlanğıc tarixi
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 0.8 }}>
          <Select
            value={String(startDay)}
            options={Array.from({ length: 31 }, (_, i) => i + 1).map((d) => ({ value: String(d), label: String(d) }))}
            onSelect={(v) => setStartDay(+v)}
          />
        </View>
        <View style={{ flex: 1.3 }}>
          <Select
            value={String(startMonth)}
            options={MONTHS.map((name, i) => ({ value: String(i), label: name }))}
            onSelect={(v) => setStartMonth(+v)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            value={String(startYear)}
            options={[2024, 2025, 2026, 2027].map((y) => ({ value: String(y), label: String(y) }))}
            onSelect={(v) => setStartYear(+v)}
          />
        </View>
      </View>

      <InputField
        label={`💰 1-ci ayın əmək haqqı (AZN) (${MONTHS[prev2[0].month]} ${prev2[0].year})`}
        value={salary1}
        onChangeText={setSalary1}
        placeholder="700"
        keyboardType="decimal-pad"
      />
      <InputField
        label={`💰 2-ci ayın əmək haqqı (AZN) (${MONTHS[prev2[1].month]} ${prev2[1].year})`}
        value={salary2}
        onChangeText={setSalary2}
        placeholder="900"
        keyboardType="decimal-pad"
      />
      <InputField
        label="📊 1-ci aydakı iş günlərinin sayı"
        value={wd1}
        onChangeText={setWd1}
        placeholder={String(autoWd1)}
        keyboardType="number-pad"
      />
      <InputField
        label="📊 2-ci aydakı iş günlərinin sayı"
        value={wd2}
        onChangeText={setWd2}
        placeholder={String(autoWd2)}
        keyboardType="number-pad"
      />
      <InputField
        label="📊 Məzuniyyətdəki iş günlərinin sayı"
        value={leaveWd}
        onChangeText={setLeaveWd}
        placeholder={String(autoLeaveWd)}
        keyboardType="number-pad"
      />

      {result ? (
        <View>
          <ResultHero
            label={`Təhsil məzuniyyəti haqqı (${leaveType.calendarDays} təqvim günü)`}
            value={fmt(result.pay)}
            sub="AZN"
          />

          <ResultSection title="📋 Hesablama addımları · addım-addım">
            <Step n={1} title="Son 2 ayın əmək haqqı cəmi">
              <Calc strong={`${fmt(result.totalSalary)} AZN`}>
                {fmt(result.s1)} + {fmt(result.s2)} ={" "}
              </Calc>
            </Step>
            <Step n={2} title="Son 2 aydakı iş günləri cəmi">
              <Calc strong={`${result.totalWd} iş günü`}>
                {result.workDays1} + {result.workDays2} ={" "}
              </Calc>
            </Step>
            <Step n={3} title="Bir günlük əmək haqqı">
              <Calc strong={`${fmt(result.daily)} AZN`}>
                {fmt(result.totalSalary)} ÷ {result.totalWd} ={" "}
              </Calc>
            </Step>
            <Step n={4} title="Məzuniyyətdəki iş günləri">
              <Calc strong={`${result.leaveWorkDays} iş günü`}>{leaveType.calendarDays} təqvim günü → </Calc>
            </Step>
            <Step n={5} tone="green" title="Məzuniyyət haqqı">
              <Calc strong={`${fmt(result.pay)} AZN`} color="#22c55e">
                {fmt(result.daily)} × {result.leaveWorkDays} ={" "}
              </Calc>
            </Step>
          </ResultSection>

          <SectionHeading icon="📊">Xülasə</SectionHeading>
          <StatGrid
            items={[
              { label: "2 aylıq əmək haqqı", value: `${fmt(result.totalSalary)}₼` },
              { label: "İş günləri (2 ay)", value: String(result.totalWd) },
              { label: "Günlük əmək haqqı", value: `${fmt(result.daily)}₼` },
              { label: "İş günləri (məzun.)", value: String(result.leaveWorkDays) },
              { label: "Məzuniyyət haqqı", value: `${fmt(result.pay)}₼`, accent: true },
            ]}
          />

          <InfoBox variant="warning">
            Qeyd: Məzuniyyət haqqı məzuniyyətin başlanmasına ən geci 3 gün qalmış ödənilir (maddə 140.5).
          </InfoBox>
        </View>
      ) : (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>🎓</Text>
          <Paragraph>Nəticəni görmək üçün əmək haqqlarını daxil edin.</Paragraph>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["vacation-pay", "teacher-vacation", "salary", "sick-leave"]} />
    </View>
  );
}
