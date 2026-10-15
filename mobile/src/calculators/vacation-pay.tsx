import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";
import { Select } from "@/components/Select";
import { ChipGroup } from "@/components/Controls";
import { SectionHeading, Paragraph, Card, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { AmountCard, CardRow, Muted, Step, Calc, MiniRow, MonthAmountsTable } from "./_leave-parts";

// ============================================================
// Məzuniyyət pulu hesablayıcısı (Əmək Məcəlləsinin 140-cı maddəsi)
// Son 12 aylıq gross qazanc → orta günlük (÷30.4) → məzuniyyət pulu
// Məzuniyyət ayında işlənmiş günlərin pulu və yekun ödəniş ay sonu
// ============================================================

const DAILY_DIVISOR = 30.4;

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

type Sector = "private" | "state";

function calcPrivateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.03;
  if (gross <= 8000) return 75 + (gross - 2500) * 0.1;
  return 625 + (gross - 8000) * 0.14;
}

function calcPrivateDSMFEmployee(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  if (gross <= 8000) return 6 + (gross - 200) * 0.1;
  return 786 + (gross - 8000) * 0.1;
}

function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 50 + (gross - 2500) * 0.005;
}

function calcStateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.14;
  return 350 + (gross - 2500) * 0.25;
}

function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 160 + (gross - 8000) * 0.005;
}

interface Deductions {
  incomeTax: number;
  dsmf: number;
  unemployment: number;
  medical: number;
  total: number;
  net: number;
}

function calcDeductions(gross: number, sector: Sector): Deductions {
  if (gross <= 0) return { incomeTax: 0, dsmf: 0, unemployment: 0, medical: 0, total: 0, net: 0 };
  const unemployment = gross * 0.005;
  let incomeTax: number, dsmf: number, medical: number;
  if (sector === "private") {
    incomeTax = calcPrivateIncomeTax(gross);
    dsmf = calcPrivateDSMFEmployee(gross);
    medical = calcPrivateMedical(gross);
  } else {
    incomeTax = calcStateIncomeTax(gross);
    dsmf = gross * 0.03;
    medical = calcStateMedical(gross);
  }
  const total = incomeTax + dsmf + unemployment + medical;
  return { incomeTax, dsmf, unemployment, medical, total, net: gross - total };
}

// Məzuniyyət ayından ƏVVƏLKİ aydan başlayaraq 12 ay geri sayır.
function getLast12Months(startYear: number, startMonth: number): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < 12; i++) {
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
    months.push({ year: y, month: m });
  }
  return months;
}

const fmt = (n: number) => fmtNum(n, 2);

const FORMULA_TITLE = "Məzuniyyət pulu necə hesablanır?";
const FORMULA_CONTENT = `Hesablama qaydası (Əmək Məcəlləsinin 140-cı maddəsi):

1. Məzuniyyətdən əvvəlki son 12 ayın gross əmək haqqı toplanır.
   Misal: işçi iyun ayında məzuniyyətə çıxırsa, may, aprel, mart, ..., əvvəlki ilin iyunu daxil olmaqla 12 ay götürülür.

2. Orta aylıq əmək haqqı = Cəmi ÷ 12

3. Bir günlük əmək haqqı = Orta aylıq ÷ 30,4

4. Məzuniyyət haqqı (gross) = Bir günlük × məzuniyyət təqvim günü

5. Məzuniyyət haqqından gəlir vergisi, DSMF (3%), işsizlik (0,5%) və icbari tibbi sığorta tutulur — net məbləğ işçinin kartına 3 gün əvvəl köçür.

Ay sonu hesablanması:

6. Cari ay (məzuniyyət ayı) bir günlük gross = Cari ay maaşı ÷ həmin ayın iş günü sayı

7. İşlənmiş günlərin pulu = Bir günlük × məzuniyyətə qədər işlənmiş gün sayı

8. Cəmi: işlənmiş günlərin pulu + 14 günlük məzuniyyət pulu

9. Gross fərq = Cari ay gross maaşı − cəmi

10. Bu gross fərqdən vergi, DSMF və s. tutulur — yaranan net məbləğ ay sonu işçinin kartına köçür.`;

export function VacationPayCalculator() {
  const { colors } = useTheme();
  const [sector, setSector] = useState<Sector>("private");
  const [vacYear, setVacYear] = useState(2026);
  const [vacMonth, setVacMonth] = useState(5); // 0-indexed: 5 = İyun
  const [vacationDays, setVacationDays] = useState("14");

  const last12 = useMemo(() => getLast12Months(vacYear, vacMonth), [vacYear, vacMonth]);

  const [monthAmounts, setMonthAmounts] = useState<Record<string, string>>({});
  const setMonthAmount = (key: string, value: string) => setMonthAmounts((prev) => ({ ...prev, [key]: value }));

  const [currentGross, setCurrentGross] = useState("");
  const [monthWorkDays, setMonthWorkDays] = useState("");
  const [workedDays, setWorkedDays] = useState("");

  const pf = (s: string | undefined) => parseFloat((s || "0").replace(",", ".")) || 0;

  const result = useMemo(() => {
    let totalEarnings = 0;
    const monthDetails: { label: string; amount: number }[] = [];
    for (const m of last12) {
      const key = `${m.year}-${m.month}`;
      const val = pf(monthAmounts[key]);
      totalEarnings += val;
      monthDetails.push({ label: `${MONTHS[m.month]} ${m.year}`, amount: val });
    }
    if (totalEarnings <= 0) return null;

    const vacDays = parseInt(vacationDays) || 0;
    if (vacDays <= 0) return null;

    const avgMonthly = totalEarnings / 12;
    const avgDaily = avgMonthly / DAILY_DIVISOR;
    const vacationGross = avgDaily * vacDays;
    const vacationDeductions = calcDeductions(vacationGross, sector);

    const cg = pf(currentGross);
    const mwd = parseInt(monthWorkDays) || 0;
    const wd = parseInt(workedDays) || 0;

    let monthEnd: {
      currentGross: number;
      monthWorkDays: number;
      workedDays: number;
      dailyInMonth: number;
      workedPayGross: number;
      sumPay: number;
      grossDiff: number;
      diffDeductions: Deductions;
    } | null = null;

    if (cg > 0 && mwd > 0 && wd >= 0) {
      const dailyInMonth = cg / mwd;
      const workedPayGross = dailyInMonth * wd;
      const sumPay = workedPayGross + vacationGross;
      const grossDiff = cg - sumPay;
      const diffDeductions = calcDeductions(Math.max(0, grossDiff), sector);
      monthEnd = { currentGross: cg, monthWorkDays: mwd, workedDays: wd, dailyInMonth, workedPayGross, sumPay, grossDiff, diffDeductions };
    }

    return { totalEarnings, avgMonthly, avgDaily, vacationDays: vacDays, vacationGross, vacationDeductions, monthDetails, monthEnd };
  }, [monthAmounts, last12, vacationDays, sector, currentGross, monthWorkDays, workedDays]);

  const last12Total = last12.reduce((s, m) => s + pf(monthAmounts[`${m.year}-${m.month}`]), 0);

  return (
    <View>
      <SegmentControl
        label="Sektor"
        options={[
          { value: "private", label: "Özəl / qeyri neft-qaz" },
          { value: "state", label: "Dövlət / neft-qaz" },
        ]}
        selected={sector}
        onSelect={(v) => setSector(v as Sector)}
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Select
            label="Məzuniyyət başlayan ay"
            value={String(vacMonth)}
            options={MONTHS.map((name, i) => ({ value: String(i), label: name }))}
            onSelect={(v) => setVacMonth(parseInt(v))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            label="İl"
            value={String(vacYear)}
            options={[2024, 2025, 2026, 2027].map((y) => ({ value: String(y), label: String(y) }))}
            onSelect={(v) => setVacYear(parseInt(v))}
          />
        </View>
      </View>
      <Muted>Məzuniyyət ayı çıxarılır — əvvəlki aydan başlayaraq 12 ay geri sayılır.</Muted>

      <InputField
        label="Məzuniyyət təqvim günü"
        value={vacationDays}
        onChangeText={setVacationDays}
        placeholder="14"
        keyboardType="number-pad"
      />
      <ChipGroup
        options={[14, 21, 28, 30].map((d) => ({ value: String(d), label: String(d) }))}
        selected={vacationDays}
        onSelect={setVacationDays}
      />

      {/* 12 aylıq gross cədvəli */}
      <Text style={[st.label, { color: colors.n940 }]}>Son 12 ayın gross əmək haqqı</Text>
      <Muted>Hər ay üçün gross (vergiyə qədər) məbləği daxil edin.</Muted>
      <MonthAmountsTable
        months={last12}
        monthNames={MONTHS}
        values={monthAmounts}
        onChange={setMonthAmount}
        amountHeader="Gross (AZN)"
        totalLabel="Cəmi"
        totalValue={`${fmt(last12Total)} ₼`}
      />

      {/* Cari ay (məzuniyyət ayı) məlumatları */}
      <View style={[st.amberBox, { borderColor: "#f59e0b66", backgroundColor: "#f59e0b12" }]}>
        <Text style={[st.boxTitle, { color: colors.n940 }]}>📅 Məzuniyyət ayı (ay sonu hesablanması)</Text>
        <Muted>Məzuniyyət ayında işlənmiş günlər və ay sonu kart ödənişi</Muted>
        <InputField
          label="Cari ay gross əmək haqqı"
          value={currentGross}
          onChangeText={setCurrentGross}
          placeholder="2500"
          keyboardType="decimal-pad"
          hint="Məzuniyyətə çıxdığınız ayın müqavilə üzrə gross maaşı."
        />
        <InputField
          label="Bu ayda iş günlərinin sayı"
          value={monthWorkDays}
          onChangeText={setMonthWorkDays}
          placeholder="22"
          keyboardType="number-pad"
          hint="Misal: iyun ayında 22 iş günü."
        />
        <InputField
          label="Məzuniyyətə çıxdığınız ay cəmi neçə gün işə gələcəksiniz"
          value={workedDays}
          onChangeText={setWorkedDays}
          placeholder="10"
          keyboardType="number-pad"
          hint="Məzuniyyət ayında işə gələcəyiniz iş günlərinin ümumi sayı."
        />
      </View>

      {result ? (
        <View>
          <CardRow>
            <AmountCard
              tone="blue"
              label={`Məzuniyyət pulu (gross) (${result.vacationDays} gün)`}
              value={fmt(result.vacationGross)}
              sub="AZN (gross)"
            />
            <AmountCard
              tone="green"
              label="Məzuniyyət pulu (net) — kartınıza köçən"
              value={fmt(result.vacationDeductions.net)}
              sub="AZN (net)"
            />
          </CardRow>

          {/* Addım-addım hesablama */}
          <ResultSection title="📋 Hesablama addımları">
            <Step n={1} title="1. Son 12 ayın gross cəmi">
              {result.monthDetails.map((m, i) => (
                <MiniRow key={i} label={`${m.label}:`} value={`${fmt(m.amount)}₼`} dim={m.amount <= 0} />
              ))}
              <View style={[st.sep, { borderTopColor: colors.n280 }]}>
                <Calc strong={`${fmt(result.totalEarnings)} AZN`}>Cəmi: </Calc>
              </View>
            </Step>
            <Step n={2} title="2. Orta aylıq">
              <Calc strong={`${fmt(result.avgMonthly)} AZN`}>{fmt(result.totalEarnings)} ÷ 12 = </Calc>
            </Step>
            <Step n={3} title="3. Bir günlük">
              <Calc strong={`${fmt(result.avgDaily)} AZN`}>{fmt(result.avgMonthly)} ÷ 30,4 = </Calc>
              <Text style={{ fontSize: 11, color: colors.n580, marginTop: 4 }}>
                30,4 — qanunla müəyyən edilmiş orta aylıq gün sayı
              </Text>
            </Step>
            <Step n={4} title="4. Məzuniyyət haqqı (gross)" emphasized>
              <Calc strong={`${fmt(result.vacationGross)} AZN`}>
                {fmt(result.avgDaily)} × {result.vacationDays} gün ={" "}
              </Calc>
            </Step>
          </ResultSection>

          {/* Məzuniyyət pulundan tutulanlar */}
          <ResultSection title="💰 Məzuniyyət pulundan tutulanlar">
            <ResultRow label="Gəlir vergisi" value={`−${fmt(result.vacationDeductions.incomeTax)} ₼`} />
            <ResultRow label="DSMF (işçi)" value={`−${fmt(result.vacationDeductions.dsmf)} ₼`} />
            <ResultRow label="İşsizlik sığortası" value={`−${fmt(result.vacationDeductions.unemployment)} ₼`} />
            <ResultRow label="İcbari tibbi sığorta" value={`−${fmt(result.vacationDeductions.medical)} ₼`} />
            <ResultRow label="Cəmi tutulan" value={`−${fmt(result.vacationDeductions.total)} ₼`} bold />
            <ResultRow label="Kartınıza köçən (net)" value={`${fmt(result.vacationDeductions.net)} ₼`} highlight />
          </ResultSection>

          {/* Ay sonu hesablanması */}
          {result.monthEnd && (
            <ResultSection title="📅 Ay sonu hesablanması">
              <Text style={{ fontSize: 12, color: colors.n580, paddingHorizontal: 14, paddingTop: 10 }}>
                Məzuniyyət ayında işlənmiş günlər və ay sonu kart ödənişi
              </Text>
              <Step n={6} tone="amber" title="Bir günlük (cari ay)">
                <Calc strong={`${fmt(result.monthEnd.dailyInMonth)} AZN/gün`}>
                  {fmt(result.monthEnd.currentGross)} ÷ {result.monthEnd.monthWorkDays} ={" "}
                </Calc>
              </Step>
              <Step n={7} tone="amber" title="İşlənmiş günlərin gross pulu">
                <Calc strong={`${fmt(result.monthEnd.workedPayGross)} AZN`}>
                  {fmt(result.monthEnd.dailyInMonth)} × {result.monthEnd.workedDays} ={" "}
                </Calc>
              </Step>
              <Step n={8} tone="amber" title="İşlənmiş günlər + məzuniyyət pulu">
                <Calc strong={`${fmt(result.monthEnd.sumPay)} AZN`}>
                  {fmt(result.monthEnd.workedPayGross)} + {fmt(result.vacationGross)} ={" "}
                </Calc>
              </Step>
              <Step n={9} tone="amber" title="Gross fərq" emphasized>
                <Calc strong={`${fmt(result.monthEnd.grossDiff)} AZN`} danger={result.monthEnd.grossDiff < 0}>
                  {fmt(result.monthEnd.currentGross)} − {fmt(result.monthEnd.sumPay)} ={" "}
                </Calc>
                <Text style={{ fontSize: 11, color: colors.n580, marginTop: 4 }}>
                  Cari ay gross maaşından (işlənmiş + məzuniyyət) çıxılır.
                </Text>
              </Step>
              <ResultRow label="Gəlir vergisi" value={`−${fmt(result.monthEnd.diffDeductions.incomeTax)}₼`} />
              <ResultRow label="DSMF (işçi)" value={`−${fmt(result.monthEnd.diffDeductions.dsmf)}₼`} />
              <ResultRow label="İşsizlik sığortası" value={`−${fmt(result.monthEnd.diffDeductions.unemployment)}₼`} />
              <ResultRow label="İcbari tibbi sığorta" value={`−${fmt(result.monthEnd.diffDeductions.medical)}₼`} />
              <ResultRow label="Ay sonu kart ödənişi (net)" value={`${fmt(result.monthEnd.diffDeductions.net)} ₼`} highlight />
            </ResultSection>
          )}

          {/* Xülasə */}
          {result.monthEnd && (
            <>
              <SectionHeading icon="📊">Xülasə</SectionHeading>
              <CardRow>
                <AmountCard label="Məzuniyyətdən əvvəl ödənilir" value={`${fmt(result.vacationDeductions.net)} ₼`} />
                <AmountCard label="Ay sonu kart ödənişi" value={`${fmt(result.monthEnd.diffDeductions.net)} ₼`} />
                <AmountCard
                  tone="blue"
                  label="Bu ayda cəmi əldə edilən"
                  value={`${fmt(result.vacationDeductions.net + result.monthEnd.diffDeductions.net)} ₼`}
                />
              </CardRow>
            </>
          )}

          {/* Əmək Məcəlləsi minimumları */}
          <ResultSection title="📋 Əmək Məcəlləsi üzrə məzuniyyət minimumları">
            <ResultRow label="Standart" value="21 gün" />
            <ResultRow label="5–10 il staj" value="+2 gün" />
            <ResultRow label="10–15 il staj" value="+4 gün" />
            <ResultRow label="15+ il staj" value="+6 gün" />
            <ResultRow label="Ağır əmək şəraiti" value="+6 gün" />
          </ResultSection>
        </View>
      ) : (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>🏖️</Text>
          <Paragraph>
            Nəticəni görmək üçün son 12 ayın gross əmək haqqını və cari ay məlumatlarını daxil edin.
          </Paragraph>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "teacher-vacation", "paternity-leave", "severance-pay"]} />
    </View>
  );
}

const st = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "700", marginTop: 8, marginBottom: 4 },
  table: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  tr: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, gap: 8 },
  thCell: { fontSize: 12, fontWeight: "600" },
  cell: { fontSize: 13 },
  cellInput: { flex: 1.4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, fontSize: 14, textAlign: "right" },
  amberBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  boxTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  step: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  stepHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  badge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  stepTitle: { fontSize: 13, fontWeight: "600", flex: 1 },
  stepBody: { borderRadius: 8, padding: 10, marginLeft: 30 },
  miniRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  sep: { borderTopWidth: 1, marginTop: 6, paddingTop: 6 },
});
