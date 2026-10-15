import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { InputField } from "@/components/InputField";
import { Card, InfoBox, StatGrid, ResultHero, SectionHeading, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";

const pt = {
  formulaTitle: "Atalıq məzuniyyəti haqqı necə hesablanır?",
  formulaContent: `Hesablama alqoritmi:

1. Məzuniyyətə çıxmazdan əvvəlki son 2 tam iş ayı götürülür
2. Orta günlük əmək haqqı = 2 ayın əmək haqqı cəmi ÷ 2 ayda faktiki işlənmiş iş günlərinin sayı
3. Məzuniyyət haqqı = Orta günlük əmək haqqı × 14 təqvim günü ərzində düşən iş günlərinin sayı

Qeyd:
• Atalıq məzuniyyəti 14 təqvim günü müddətindədir
• Hesablamada yalnız faktiki işlənmiş iş günləri nəzərə alınır
• 14 təqvim günündə adətən 10 iş günü olur (şənbə-bazar çıxılmaqla)`,
  infoBanner: "Atalıq məzuniyyəti <b>14 təqvim günü</b> müddətindədir. Hesablama üçün məzuniyyətə çıxmazdan əvvəlki <b>son 2 tam iş ayının</b> məlumatları lazımdır.",
  month1Title: "1-ci ay (əvvəlki ay)",
  month2Title: "2-ci ay (ondan əvvəlki ay)",
  salaryLabel: "Əmək haqqı (AZN)",
  workDaysLabel: "Faktiki işlənmiş iş günləri",
  workDaysIn14Label: "14 təqvim günü ərzində düşən iş günləri",
  day: "gün",
  workDaysIn14Hint: "Adətən 14 təqvim günündə 10 iş günü olur (şənbə-bazar çıxılmaqla)",
  twoMonthTotal: "2 ayın əmək haqqı cəmi",
  avgDailySalary: "Orta günlük əmək haqqı",
  perDay: "AZN / gün",
  paternityPay: "Atalıq məzuniyyəti haqqı",
  calendarDays14: "AZN (14 təqvim günü)",
  calculationSteps: "Hesablama addımları",
  step1: "1. Son 2 ayın əmək haqqı cəmi",
  step2: "2. Cəmi faktiki iş günləri",
  step3: "3. Orta günlük əmək haqqı",
  step4: "4. Atalıq məzuniyyəti haqqı",
  workDays: "iş günü",
  aboutTitle: "Atalıq məzuniyyəti haqqında",
  aboutLine1: "Azərbaycan Əmək Məcəlləsinə əsasən atalıq məzuniyyəti <b>14 təqvim günü</b> müddətindədir.",
  aboutLine2: "Hesablama üçün məzuniyyətə çıxmazdan əvvəlki <b>son 2 tam iş ayının</b> əmək haqqı və faktiki işlənmiş iş günləri nəzərə alınır.",
  aboutLine3: "Orta günlük əmək haqqı, 14 təqvim günü ərzində düşən <b>iş günlərinin sayına</b> vurulur.",
  emptyStateText: "Nəticəni görmək üçün hər iki ayın məlumatlarını daxil edin.",
};

const formatMoney = (n: number) => fmtNum(n, 2);

/** "<b>...</b>" teqlərini qalın mətnə çevirir. */
function RichText({ html, style }: { html: string; style?: object }) {
  const { colors } = useTheme();
  const parts = html.split(/(<b>.*?<\/b>)/g).filter(Boolean);
  return (
    <Text style={[{ fontSize: 14, lineHeight: 21, color: colors.n760 }, style]}>
      {parts.map((p, i) =>
        p.startsWith("<b>") ? (
          <Text key={i} style={{ fontWeight: "700", color: colors.n940 }}>
            {p.replace(/<\/?b>/g, "")}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

function StepRow({ title, value, detail, accent }: { title: string; value: string; detail: string; accent?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.step, { borderBottomColor: colors.n240 }, accent && { backgroundColor: "#3b82f61a" }]}>
      <View style={styles.stepHead}>
        <Text style={[styles.stepTitle, { color: accent ? colors.accent : colors.n940 }]}>{title}</Text>
        <Text style={[styles.stepValue, { color: accent ? colors.accent : colors.n940 }]}>{value}</Text>
      </View>
      <View style={[styles.stepDetail, { backgroundColor: colors.n240 }]}>
        <Text style={{ fontSize: 12, color: colors.n580 }}>{detail}</Text>
      </View>
    </View>
  );
}

export function PaternityLeaveCalculator() {
  const { colors } = useTheme();
  const [month1Salary, setMonth1Salary] = useState("");
  const [month2Salary, setMonth2Salary] = useState("");
  const [month1Days, setMonth1Days] = useState("");
  const [month2Days, setMonth2Days] = useState("");
  const [workDaysIn14, setWorkDaysIn14] = useState("10");

  const result = useMemo(() => {
    const salary1 = parseFloat(month1Salary.replace(",", "."));
    const salary2 = parseFloat(month2Salary.replace(",", "."));
    const days1 = parseInt(month1Days);
    const days2 = parseInt(month2Days);
    const wdIn14 = parseInt(workDaysIn14);

    if (!salary1 || salary1 <= 0 || !salary2 || salary2 <= 0) return null;
    if (!days1 || days1 <= 0 || !days2 || days2 <= 0) return null;
    if (!wdIn14 || wdIn14 <= 0) return null;

    const totalSalary = salary1 + salary2;
    const totalWorkDays = days1 + days2;
    const dailyRate = totalSalary / totalWorkDays;
    const paternityPay = dailyRate * wdIn14;

    return { salary1, salary2, days1, days2, totalSalary, totalWorkDays, dailyRate, workDaysIn14: wdIn14, paternityPay };
  }, [month1Salary, month2Salary, month1Days, month2Days, workDaysIn14]);

  return (
    <View>
      <InfoBox variant="warning">
        <RichText html={pt.infoBanner} style={{ fontSize: 13, lineHeight: 19 }} />
      </InfoBox>

      <Card title={pt.month1Title}>
        <InputField label={pt.salaryLabel} value={month1Salary} onChangeText={setMonth1Salary} placeholder="1500" keyboardType="decimal-pad" />
        <InputField label={pt.workDaysLabel} value={month1Days} onChangeText={setMonth1Days} placeholder="22" keyboardType="number-pad" maxLength={2} />
      </Card>

      <Card title={pt.month2Title}>
        <InputField label={pt.salaryLabel} value={month2Salary} onChangeText={setMonth2Salary} placeholder="1500" keyboardType="decimal-pad" />
        <InputField label={pt.workDaysLabel} value={month2Days} onChangeText={setMonth2Days} placeholder="21" keyboardType="number-pad" maxLength={2} />
      </Card>

      <InputField
        label={pt.workDaysIn14Label}
        value={workDaysIn14}
        onChangeText={setWorkDaysIn14}
        placeholder="10"
        keyboardType="number-pad"
        maxLength={2}
      />
      <View style={styles.presets}>
        {[8, 9, 10, 11, 12].map((d) => {
          const active = workDaysIn14 === d.toString();
          return (
            <Pressable
              key={d}
              onPress={() => setWorkDaysIn14(d.toString())}
              style={[
                styles.preset,
                { borderColor: active ? colors.accent : colors.n280, backgroundColor: active ? colors.accent + "22" : colors.n200 },
              ]}
            >
              <Text style={{ fontSize: 12, color: active ? colors.accent : colors.n580, fontWeight: active ? "600" : "400" }}>
                {d} {pt.day}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontSize: 11, color: colors.n580, marginBottom: 8 }}>{pt.workDaysIn14Hint}</Text>

      {result ? (
        <View>
          <ResultHero label={pt.paternityPay} value={formatMoney(result.paternityPay)} sub={pt.calendarDays14} />
          <StatGrid
            items={[
              { label: pt.twoMonthTotal, value: `${formatMoney(result.totalSalary)} AZN` },
              { label: pt.avgDailySalary, value: `${formatMoney(result.dailyRate)} ${pt.perDay}` },
            ]}
          />

          <SectionHeading icon="📊">{pt.calculationSteps}</SectionHeading>
          <View style={[styles.stepsWrap, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <StepRow
              title={pt.step1}
              value={`${formatMoney(result.totalSalary)} AZN`}
              detail={`${formatMoney(result.salary1)} + ${formatMoney(result.salary2)} = ${formatMoney(result.totalSalary)} AZN`}
            />
            <StepRow
              title={pt.step2}
              value={`${result.totalWorkDays} ${pt.day}`}
              detail={`${result.days1} ${pt.day} + ${result.days2} ${pt.day} = ${result.totalWorkDays} ${pt.day}`}
            />
            <StepRow
              title={pt.step3}
              value={`${formatMoney(result.dailyRate)} AZN`}
              detail={`${formatMoney(result.totalSalary)} ÷ ${result.totalWorkDays} ${pt.day} = ${formatMoney(result.dailyRate)} AZN`}
            />
            <StepRow
              accent
              title={pt.step4}
              value={`${formatMoney(result.paternityPay)} AZN`}
              detail={`${formatMoney(result.dailyRate)} × ${result.workDaysIn14} ${pt.workDays} = ${formatMoney(result.paternityPay)} AZN`}
            />
          </View>

          <InfoBox variant="info" title={`📋 ${pt.aboutTitle}`}>
            <View style={{ gap: 6 }}>
              <RichText html={pt.aboutLine1} style={{ fontSize: 13, lineHeight: 19 }} />
              <RichText html={pt.aboutLine2} style={{ fontSize: 13, lineHeight: 19 }} />
              <RichText html={pt.aboutLine3} style={{ fontSize: 13, lineHeight: 19 }} />
            </View>
          </InfoBox>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>👨‍👶</Text>
          <Text style={{ color: colors.n580, textAlign: "center" }}>{pt.emptyStateText}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["vacation-pay", "maternity-leave", "salary", "severance-pay"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6, marginTop: -4 },
  preset: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  stepsWrap: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  step: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  stepHead: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 6 },
  stepTitle: { fontSize: 13, fontWeight: "600", flex: 1 },
  stepValue: { fontSize: 13, fontWeight: "700" },
  stepDetail: { borderRadius: 8, padding: 8 },
  empty: { alignItems: "center", paddingVertical: 28 },
});
