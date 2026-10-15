import { useState, useMemo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { Paragraph, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { Panel, TintRow, TintHero, EmptyState, FieldLabel, TINT } from "./_legal-parts";

const MONTH_NAMES = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

const formatMoney = (n: number) => fmtNum(n, 2);

const pt = {
  formulaTitle: "Hərbi xidmət ödənişi necə hesablanır?",
  formulaContent: `Əmək Məcəlləsi, Maddə 74 — Hərbi xidmətə çağırılan işçiyə ödəniş:

1. Orta günlük əmək haqqı:
   Son 12 ayın cəmi net maaşı / Son 12 ayın cəmi iş günü

2. Son 3 ayın ödənişi:
   Son 3 ayın cəmi iş günü × Orta günlük əmək haqqı

3. Əsgərə gedəcəyi ayda işlədiyi günlərin ödənişi:
   İşlədiyi gün sayı × Orta günlük əmək haqqı

4. Ümumi ödəniş:
   Son 3 ayın ödənişi + Gedəcəyi ayın ödənişi`,
  introText: "Hərbi xidmətə gedən işçiyə ödəniləcək məbləği hesablayın. Son 12 ayın net maaş və iş günlərini daxil edin.",
  departureMonth: "Əsgərə gedəcəyi ay",
  yearLabel: "İl",
  daysWorkedLabel: "ayında işlədiyi gün sayı",
  daysWorkedPlaceholder: "Məs: 15",
  last12MonthsData: "Son 12 ayın məlumatları",
  monthHeader: "Ay",
  netSalaryHeader: "Net maaş (₼)",
  workDaysHeader: "İş günü",
  last3MonthsTag: "(son 3 ay)",
  calculationDetails: "Hesablama detalları",
  totalNetSalary: "Son 12 ayın cəmi net maaşı:",
  totalWorkDays: "Son 12 ayın cəmi iş günü:",
  avgDailyWage: "Orta günlük əmək haqqı:",
  last3MonthsPayment: "Son 3 ayın ödənişi",
  last3MonthsWorkDays: "Son 3 ayın cəmi iş günü:",
  departureMonthPayment: "ayının ödənişi",
  daysWorkedInMonth: "İşlədiyi gün sayı:",
  totalPaymentLabel: "İşçiyə ödəniləcək ümumi məbləğ:",
  last3MonthsAmount: "son 3 ay",
  monthAmount: "ayı",
  daysUnit: "gün",
  emptyState: "Nəticəni görmək üçün son 12 ayın məlumatlarını daxil edin.",
};

const num = (s: string) => parseFloat(s.replace(",", "."));
const emptyData = () => Array.from({ length: 12 }, () => ({ netSalary: "", workDays: "" }));

export function MilitaryCalculator() {
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [departureMonth, setDepartureMonth] = useState(currentMonth);
  const [departureYear, setDepartureYear] = useState(currentYear);
  const [daysWorkedInMonth, setDaysWorkedInMonth] = useState("");
  const [monthlyData, setMonthlyData] = useState(emptyData);

  // Son 12 ayın ay adları (gedəcəyi aydan geriyə)
  const monthLabels = useMemo(() => {
    const labels: { month: string; year: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      let m = departureMonth - 1 - i;
      let y = departureYear;
      while (m < 0) {
        m += 12;
        y--;
      }
      labels.push({ month: MONTH_NAMES[m], year: y });
    }
    return labels;
  }, [departureMonth, departureYear]);

  const result = useMemo(() => {
    let totalNet = 0;
    let totalDays = 0;
    let filledMonths = 0;

    for (let i = 0; i < 12; i++) {
      const net = num(monthlyData[i].netSalary);
      const days = num(monthlyData[i].workDays);
      if (net > 0 && days > 0) {
        totalNet += net;
        totalDays += days;
        filledMonths++;
      }
    }

    if (totalDays === 0 || filledMonths === 0) return null;

    const avgDaily = totalNet / totalDays;

    // Son 3 ayın iş günləri cəmi
    let last3MonthsDays = 0;
    for (let i = 9; i < 12; i++) {
      const days = num(monthlyData[i].workDays);
      if (days > 0) last3MonthsDays += days;
    }

    const daysInDepartureMonth = num(daysWorkedInMonth) || 0;
    const last3MonthsPayment = last3MonthsDays * avgDaily;
    const departureMonthPayment = daysInDepartureMonth * avgDaily;
    const totalPayment = last3MonthsPayment + departureMonthPayment;

    return { totalNet, totalDays, avgDaily, last3MonthsDays, last3MonthsPayment, daysInDepartureMonth, departureMonthPayment, totalPayment };
  }, [monthlyData, daysWorkedInMonth]);

  const resetData = () => {
    setMonthlyData(emptyData());
    setDaysWorkedInMonth("");
  };

  const updateCell = (i: number, key: "netSalary" | "workDays", v: string) => {
    setMonthlyData((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: v };
      return updated;
    });
  };

  const inputStyle = [st.cellInput, { borderColor: colors.n280, backgroundColor: colors.n145, color: colors.n940 }];

  return (
    <View>
      <Paragraph>{pt.introText}</Paragraph>

      <View style={st.row2}>
        <View style={{ flex: 1.3 }}>
          <Select
            label={pt.departureMonth}
            value={String(departureMonth)}
            options={MONTH_NAMES.map((name, i) => ({ value: String(i), label: name }))}
            onSelect={(v) => {
              setDepartureMonth(parseInt(v, 10));
              resetData();
            }}
            searchable={false}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            label={pt.yearLabel}
            value={String(departureYear)}
            options={[currentYear - 1, currentYear, currentYear + 1].map((y) => ({ value: String(y), label: String(y) }))}
            onSelect={(v) => {
              setDepartureYear(parseInt(v, 10));
              resetData();
            }}
          />
        </View>
      </View>

      <InputField
        label={`${MONTH_NAMES[departureMonth]} ${departureYear} ${pt.daysWorkedLabel}`}
        value={daysWorkedInMonth}
        onChangeText={setDaysWorkedInMonth}
        placeholder={pt.daysWorkedPlaceholder}
        keyboardType="decimal-pad"
        suffix={pt.daysUnit}
      />

      {/* Son 12 ay cədvəli */}
      <FieldLabel>{pt.last12MonthsData}</FieldLabel>
      <View style={[st.table, { borderColor: colors.n280 }]}>
        <View style={[st.tr, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
          <Text style={[st.th, { color: colors.n940, flex: 1.2 }]}>{pt.monthHeader}</Text>
          <Text style={[st.th, { color: colors.n940, flex: 1.1 }]}>{pt.netSalaryHeader}</Text>
          <Text style={[st.th, { color: colors.n940, flex: 0.8 }]}>{pt.workDaysHeader}</Text>
        </View>
        {monthLabels.map((label, i) => (
          <View
            key={i}
            style={[st.tr, { borderBottomColor: colors.n280, borderBottomWidth: i === 11 ? 0 : StyleSheet.hairlineWidth }, i >= 9 && { backgroundColor: TINT.blue + "14" }]}
          >
            <View style={{ flex: 1.2 }}>
              <Text style={{ fontSize: 13, color: colors.n940 }}>
                {label.month} {label.year}
              </Text>
              {i >= 9 && <Text style={{ fontSize: 10, color: TINT.blue }}>{pt.last3MonthsTag}</Text>}
            </View>
            <View style={{ flex: 1.1 }}>
              <TextInput
                value={monthlyData[i].netSalary}
                onChangeText={(v) => updateCell(i, "netSalary", v)}
                placeholder="0.00"
                placeholderTextColor={colors.n400}
                keyboardType="decimal-pad"
                style={inputStyle}
              />
            </View>
            <View style={{ flex: 0.8 }}>
              <TextInput
                value={monthlyData[i].workDays}
                onChangeText={(v) => updateCell(i, "workDays", v)}
                placeholder="0"
                placeholderTextColor={colors.n400}
                keyboardType="decimal-pad"
                style={inputStyle}
              />
            </View>
          </View>
        ))}
      </View>

      {result ? (
        <View>
          <Panel title={pt.calculationDetails}>
            <TintRow label={pt.totalNetSalary} value={`${formatMoney(result.totalNet)} ₼`} />
            <TintRow label={pt.totalWorkDays} value={`${result.totalDays} ${pt.daysUnit}`} />
            <TintRow label={pt.avgDailyWage} value={`${formatMoney(result.avgDaily)} ₼`} valueTint="blue" bold last />
          </Panel>

          <Panel title={pt.last3MonthsPayment}>
            <TintRow label={pt.last3MonthsWorkDays} value={`${result.last3MonthsDays} ${pt.daysUnit}`} />
            <TintRow
              label={`${result.last3MonthsDays} ${pt.daysUnit} × ${formatMoney(result.avgDaily)} ₼:`}
              value={`${formatMoney(result.last3MonthsPayment)} ₼`}
              bold
              last
            />
          </Panel>

          <Panel title={`${MONTH_NAMES[departureMonth]} ${pt.departureMonthPayment}`}>
            <TintRow label={pt.daysWorkedInMonth} value={`${result.daysInDepartureMonth} ${pt.daysUnit}`} />
            <TintRow
              label={`${result.daysInDepartureMonth} ${pt.daysUnit} × ${formatMoney(result.avgDaily)} ₼:`}
              value={`${formatMoney(result.departureMonthPayment)} ₼`}
              bold
              last
            />
          </Panel>

          <TintHero
            tint="green"
            label={pt.totalPaymentLabel}
            value={`${formatMoney(result.totalPayment)} ₼`}
            sub={`(${formatMoney(result.last3MonthsPayment)} ₼ ${pt.last3MonthsAmount} + ${formatMoney(result.departureMonthPayment)} ₼ ${MONTH_NAMES[departureMonth]} ${pt.monthAmount})`}
          />
        </View>
      ) : (
        <EmptyState text={pt.emptyState} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["salary", "overtime", "dismissal"]} />
    </View>
  );
}

const st = StyleSheet.create({
  row2: { flexDirection: "row", gap: 10 },
  table: { borderWidth: 1, borderRadius: 12, overflow: "hidden", marginBottom: 8 },
  tr: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  th: { fontSize: 12, fontWeight: "700", paddingVertical: 4 },
  cellInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14 },
});
