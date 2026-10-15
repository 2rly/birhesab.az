import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { ChipGroup } from "@/components/Controls";
import { SegmentControl } from "@/components/SegmentControl";
import { ResultSection } from "@/components/ResultRow";
import {
  DataTable,
  FormulaSection,
  RelatedCalculators,
  ResultHero,
  SectionHeading,
  Paragraph,
  BulletList,
  Collapsible,
} from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { useTheme } from "@/constants/theme";
import { insuranceRates, INSURANCE_RATE_OPTIONS } from "@/data/insuranceRates";
import {
  OptionCards,
  ToneCard,
  ToneGrid,
  ToneRow,
  TonePanel,
  StackedBar,
  Legend,
  ShowMoreButton,
  SmallText,
  EmptyState,
  TONES,
} from "./_loan-parts";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const formatMoney = (n: number) => fmtNum(n, 2);

const pt = {
  formulaTitle: "İpoteka ödənişi necə hesablanır?",
  formulaContent: `Kredit məbləği = Əmlak qiyməti − İlkin ödəniş

Aylıq ödəniş = K × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

K — kredit məbləği
r — aylıq faiz dərəcəsi (illik faiz ÷ 12 ÷ 100)
n — müddət (ay)

Azərbaycanda ipoteka:
• İlkin ödəniş: adətən 20-30%
• Müddət: 1-30 il
• Faiz dərəcəsi: 4-8% (güzəştli), 10-16% (standart)`,
  propertyPrice: "Əmlakın qiyməti (AZN)",
  downPayment: "İlkin ödəniş",
  annualRate: "İllik faiz dərəcəsi (%)",
  termYears: "Müddət (il)",
  monthlyPayment: "Aylıq ödəniş",
  perMonth: "AZN / ay",
  loanAmount: "Kredit məbləği",
  overpayment: "Artıq ödəniş (faiz)",
  totalSummary: "Ümumi hesablama",
  propertyPriceLabel: "Əmlak qiyməti",
  downPaymentLabel: "İlkin ödəniş",
  loanAmountLabel: "Kredit məbləği",
  termLabel: "Müddət",
  yearSuffix: "il",
  monthSuffix: "ay",
  totalInterestPayment: "Ümumi faiz ödənişi",
  totalPaymentAll: "Ümumi ödəniş (ilkin + kredit + faiz)",
  principalDebt: "Əsas borc",
  interest: "Faiz",
  yearlySummary: "İllik icmal",
  yearCol: "İl",
  yearSuffixOrd: "-ci il",
  principalCol: "Əsas borc",
  interestCol: "Faiz",
  remainingCol: "Qalıq borc",
  monthlyAmortization: "Aylıq annuitet cədvəli",
  monthCol: "Ay",
  paymentCol: "Ödəniş",
  collapse: "Yığ",
  showAll: "Bütün {count} ayı göstər",
  mortgageType: "İpoteka növü",
  internalMortgage: "Daxili ipoteka",
  internalMortgageDesc: "Bankın öz faiz dərəcəsi ilə",
  stateMortgage: "Dövlət ipotekası",
  stateMortgageDesc: "Güzəştli dövlət proqramı (3.7%, 4%, 7%, 8%)",
  emptyStateText: "Nəticəni görmək üçün əmlak qiyməti, faiz və müddət daxil edin.",
  scenariosTitle: "Erkən ödəmə ssenarilər",
  scenarioA: "Ssenari A: Müddətin qısaldılması",
  scenarioADesc: "Hər ay əlavə ödəniş etsəniz, kredit neçə ay tez bitər?",
  extraMonthlyLabel: "Aylıq əlavə ödəniş (AZN)",
  newTerm: "Yeni müddət",
  timeSaved: "Qazanılan zaman",
  interestSaved: "Qənaət edilən faiz",
  scenarioB: "Ssenari B: Aylıq ödənişin azaldılması",
  scenarioBDesc: "Bugün toplu ödəniş etsəniz, yeni aylıq ödəniş nə qədər olar?",
  lumpSumLabel: "Toplu ödəniş məbləği (AZN)",
  newMonthlyPayment: "Yeni aylıq ödəniş",
  monthlySaving: "Aylıq qənaət",
  scenarioC: "Ssenari C: Dinamik azalma strategiyası",
  scenarioCDesc: "Hər ay əlavə ödəniş edib, hər 12 aydan bir yenidən hesablama tələb etsəniz:",
  recalcInterval: "Yenidən hesablama intervalı",
  every12Months: "Hər 12 ay",
  everyMonth: "Hər ay",
  newPaymentCol: "Yeni aylıq ödəniş",
  remainingTermCol: "Qalan müddət (ay)",
  remainingBalanceCol: "Qalan borc",
  totalInterestC: "Ümumi faiz ödənişi",
  totalSavedC: "Qənaət (standart ilə müqayisə)",
  year: "il",
  month: "ay",
  insuranceTitle: "Həyat sığortası (ipoteka)",
  insuranceDesc:
    "İpoteka zamanı həyat sığortası məcburidir. Aylıq tarif müştərinin yaşına və kredit müddətinə görə müəyyən edilir.",
  insuranceAge: "Müştərinin yaşı",
  insuranceMonthlyRate: "Aylıq sığorta faizi",
  insuranceMonthlyPayment: "Aylıq sığorta ödənişi",
  totalWithInsurance: "Aylıq ödəniş + sığorta",
  insuranceTotal: "Ümumi sığorta xərci (bütün müddət)",
  selectAge: "Yaş seçin...",
};

const SHORT_YOUNG_FAMILY = [
  "Şəhidin övladları",
  "Vətən Müharibəsi Qəhrəmanının övladları",
  "Milli Qəhrəmanın övladları",
  "Məcburi köçkün və ya ona bərabər tutulan şəxs",
  "3+ il dövlət qulluğunda çalışan şəxs (xüsusi növ daxil)",
  "3+ il dövlət ümumtəhsil müəssisəsində müəllim",
  "Fəlsəfə doktoru elmi dərəcəsi olan şəxs",
  "İdman sahəsində xüsusi xidmətləri olan şəxs (fəxri xadim, ölkə yarışı qalibi, beynəlxalq mükafatçı)",
  "5+ il jurnalist, Media Reyestrinə daxil edilmiş",
];
const SHORT_OTHER = [
  "Elmlər doktoru elmi dərəcəsi olan şəxs",
  "15+ il dövlət qulluğunda çalışan şəxs",
  "3+ il hərbi xidmətdə olan hərbi qulluqçular (müddətli həqiqi xidmət istisna)",
  "3+ il daxili işlər orqanlarında xüsusi rütbəli şəxs",
  "3+ il elmi vəzifədə işləyən elmi işçilər",
  "15+ il dövlət ümumtəhsil müəssisəsində müəllim",
  "15+ il jurnalist, Media Reyestrinə daxil edilmiş",
  "Şəhid ailəsinin üzvü (əri/arvadı)",
  "Vətən Müharibəsi Qəhrəmanı (özü, əri/arvadı)",
  "Milli Qəhrəman (özü, əri/arvadı)",
];
const FULL_YOUNG_FAMILY = [
  "Şəhidin övladları",
  "Azərbaycan Respublikasının Vətən Müharibəsi Qəhrəmanının övladları",
  "Azərbaycanın Milli Qəhrəmanının övladları",
  "Məcburi köçkün və ya ona bərabər tutulan şəxs",
  "Ən azı 3 il dövlət qulluğunda qulluq edən, o cümlədən dövlət qulluğunun xüsusi növündə xidmət keçən şəxs",
  "Ən azı 3 il dövlət ümumtəhsil müəssisəsində müəllim işləyən şəxs",
  "Fəlsəfə doktoru elmi dərəcəsi olan şəxs",
  "İdman sahəsində xüsusi xidmətləri olan şəxs (fəxri bədən tərbiyəsi və idman xadimi, ölkə miqyaslı yarışların qalibi (I yer), beynəlxalq miqyaslı yarışların mükafatçısı (I, II və ya III yer))",
  "Ən azı 5 il jurnalist işləyən və Media Reyestrinə daxil edilmiş şəxs",
];
const FULL_OTHER = [
  "Elmlər doktoru elmi dərəcəsi olan şəxs",
  "Ən azı 15 il dövlət qulluğunda qulluq edən şəxs, o cümlədən dövlət qulluğunun xüsusi növündə xidmət keçən şəxs",
  "Ən azı 3 il hərbi xidmətdə olan hərbi qulluqçular (müddətli həqiqi hərbi xidmətdə olanlar istisna), həmçinin ehtiyata və istefaya buraxılmış hərbi qulluqçular",
  "Ən azı 3 il daxili işlər orqanlarında xidmət keçən xüsusi rütbəsi olan şəxs",
  "Ən azı 3 il elmi vəzifədə işləyən elmi işçilər",
  "Ən azı 15 il dövlət ümumi təhsil müəssisəsində müəllim işləyən şəxs",
  "Ən azı 15 il jurnalist işləyən və Media Reyestrinə daxil edilmiş şəxs",
  "Şəhid ailəsinin üzvü (əri/arvadı)",
  "Azərbaycan Respublikasının Vətən Müharibəsi Qəhrəmanı (özü, əri/arvadı)",
  "Azərbaycanın Milli Qəhrəmanı (özü, əri/arvadı)",
];

const AGE_OPTIONS = Array.from({ length: 47 }, (_, i) => i + 18).map((age) => ({
  value: String(age),
  label: String(age),
}));

export function MortgageCalculator() {
  const { colors } = useTheme();
  const [mortgageType, setMortgageType] = useState<"internal" | "state">("state");
  const [stateSubtype, setStateSubtype] = useState<"standard" | "subsidized">("standard");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [downPercent, setDownPercent] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [extraMonthly, setExtraMonthly] = useState("");
  const [lumpSum, setLumpSum] = useState("");
  const [recalcInterval, setRecalcInterval] = useState<"12" | "1">("12");
  const [showFullTable, setShowFullTable] = useState(false);
  const [clientAge, setClientAge] = useState("");
  const recalc = recalcInterval === "12" ? 12 : 1;

  const handleDownPaymentChange = (value: string) => {
    setDownPayment(value);
    const price = parseFloat(propertyPrice);
    const down = parseFloat(value);
    if (price > 0 && !isNaN(down)) {
      setDownPercent(((down / price) * 100).toFixed(1).replace(/\.0$/, ""));
    } else {
      setDownPercent("");
    }
  };

  const handleDownPercentChange = (value: string) => {
    setDownPercent(value);
    const price = parseFloat(propertyPrice);
    const pct = parseFloat(value);
    if (price > 0 && !isNaN(pct)) {
      setDownPayment(Math.round((price * pct) / 100).toString());
    } else {
      setDownPayment("");
    }
  };

  const handlePropertyPriceChange = (value: string) => {
    setPropertyPrice(value);
    const price = parseFloat(value);
    const pct = parseFloat(downPercent);
    if (price > 0 && !isNaN(pct)) {
      setDownPayment(Math.round((price * pct) / 100).toString());
    }
  };

  // Dövlət ipotekasında faiz sığorta tarif açarı ilə sinxrondur
  const insuranceRateKey = mortgageType === "state" ? rate : "7";

  const result = useMemo(() => {
    const price = parseFloat(propertyPrice);
    const down = parseFloat(downPayment) || 0;
    const r = parseFloat(rate);
    const y = parseInt(years);

    if (!price || price <= 0 || isNaN(r) || r < 0 || !y || y <= 0) return null;
    if (down >= price) return null;

    const loanAmount = price - down;
    const months = y * 12;
    const monthlyRate = r / 100 / 12;

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / months;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    const table: AmortizationRow[] = [];
    let balance = loanAmount;
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance = Math.max(0, balance - principal);
      table.push({ month: i, payment: monthlyPayment, principal, interest, balance });
    }

    const yearlyData: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let yr = 0; yr < y; yr++) {
      const yearRows = table.slice(yr * 12, (yr + 1) * 12);
      const yrPrincipal = yearRows.reduce((s, r) => s + r.principal, 0);
      const yrInterest = yearRows.reduce((s, r) => s + r.interest, 0);
      const yrBalance = yearRows[yearRows.length - 1]?.balance || 0;
      yearlyData.push({ year: yr + 1, principal: yrPrincipal, interest: yrInterest, balance: yrBalance });
    }

    return {
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      totalWithDown: totalPayment + down,
      downPercent: price > 0 ? (down / price) * 100 : 0,
      months,
      table,
      yearlyData,
    };
  }, [propertyPrice, downPayment, rate, years]);

  // Əmlak sığortası: əmlak dəyərinin 0.2%-i, 36 aylıq dövr
  const propertyInsurance = useMemo(() => {
    const price = parseFloat(propertyPrice);
    if (!price || price <= 0 || !result) return null;

    const premium = price * 0.002;
    const monthlyInstallment = premium / 12;
    const totalCycles = Math.ceil(result.months / 36);
    const totalInsurance = premium * totalCycles;
    const avgMonthly = totalInsurance / result.months;

    const schedule: { month: number; payment: number; type: string }[] = [];
    for (let m = 1; m <= 36; m++) {
      if (m === 1) {
        schedule.push({ month: m, payment: premium, type: "deposit" });
      } else if (m >= 13 && m <= 24) {
        schedule.push({ month: m, payment: monthlyInstallment, type: "installment" });
      } else {
        schedule.push({ month: m, payment: 0, type: "none" });
      }
    }

    return { premium, monthlyInstallment, totalInsurance, totalCycles, avgMonthly, schedule };
  }, [propertyPrice, result]);

  // Həyat sığortası: yaş, müddət və faiz dərəcəsinə görə
  const lifeInsurance = useMemo(() => {
    if (!result) return null;
    const age = parseInt(clientAge);
    if (!age || age < 18 || age > 64) return null;
    const y = parseInt(years);
    if (!y || y < 1 || y > 30) return null;

    const rateTable = insuranceRates[insuranceRateKey];
    if (!rateTable) return null;
    const ageRates = rateTable[String(age)];
    if (!ageRates) return null;

    const monthlyRatePercent = ageRates[y - 1]; // indeks 0 = 1 il
    if (!monthlyRatePercent) return null;

    const monthlyPayment = result.loanAmount * (monthlyRatePercent / 100);
    const totalCost = monthlyPayment * result.months;

    return { monthlyRatePercent, monthlyPayment, totalCost };
  }, [result, clientAge, years, insuranceRateKey]);

  // Ssenari A: əlavə aylıq ödənişlə müddətin qısaldılması
  const scenarioA = useMemo(() => {
    if (!result) return null;
    const extra = parseFloat(extraMonthly);
    if (!extra || extra <= 0) return null;

    const monthlyRate = parseFloat(rate) / 100 / 12;
    const totalMonthlyPayment = result.monthlyPayment + extra;
    let balance = result.loanAmount;
    let months = 0;
    let totalInterest = 0;

    while (balance > 0.01 && months < result.months * 2) {
      months++;
      const interest = balance * monthlyRate;
      totalInterest += interest;
      const principal = Math.min(totalMonthlyPayment - interest, balance);
      balance = Math.max(0, balance - principal);
    }

    const savedMonths = result.months - months;
    const savedInterest = result.totalInterest - totalInterest;
    const savedYears = Math.floor(savedMonths / 12);
    const savedRemainderMonths = savedMonths % 12;

    return { newMonths: months, savedMonths, savedYears, savedRemainderMonths, savedInterest };
  }, [result, extraMonthly, rate]);

  // Ssenari B: toplu ödənişlə aylıq ödənişin azaldılması
  const scenarioB = useMemo(() => {
    if (!result) return null;
    const lump = parseFloat(lumpSum);
    if (!lump || lump <= 0 || lump >= result.loanAmount) return null;

    const newLoan = result.loanAmount - lump;
    const monthlyRate = parseFloat(rate) / 100 / 12;
    let newPayment: number;
    if (monthlyRate === 0) {
      newPayment = newLoan / result.months;
    } else {
      newPayment =
        (newLoan * monthlyRate * Math.pow(1 + monthlyRate, result.months)) /
        (Math.pow(1 + monthlyRate, result.months) - 1);
    }

    return { newPayment, saving: result.monthlyPayment - newPayment };
  }, [result, lumpSum, rate]);

  // Ssenari C: əlavə aylıq ödəniş + dövri yenidən hesablama
  const scenarioC = useMemo(() => {
    if (!result) return null;
    const extra = parseFloat(extraMonthly);
    if (!extra || extra <= 0) return null;

    const monthlyRate = parseFloat(rate) / 100 / 12;
    let balance = result.loanAmount;
    let remainingMonths = result.months;
    let currentPayment = result.monthlyPayment;
    let totalInterest = 0;
    let monthCount = 0;

    const periods: { period: string; payment: number; remainingTerm: number; balance: number }[] = [];
    periods.push({ period: "0", payment: currentPayment, remainingTerm: remainingMonths, balance });

    while (balance > 0.01 && monthCount < result.months * 2) {
      monthCount++;
      remainingMonths--;
      const interest = balance * monthlyRate;
      totalInterest += interest;
      const actualPayment = Math.min(currentPayment + extra, balance + interest);
      const principal = actualPayment - interest;
      balance = Math.max(0, balance - principal);

      if (balance > 0.01 && monthCount % recalc === 0 && remainingMonths > 0) {
        if (monthlyRate === 0) {
          currentPayment = balance / remainingMonths;
        } else {
          currentPayment =
            (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
            (Math.pow(1 + monthlyRate, remainingMonths) - 1);
        }
        periods.push({
          period: recalc === 12 ? `${monthCount / 12}` : `${monthCount}`,
          payment: currentPayment,
          remainingTerm: remainingMonths,
          balance,
        });
      }
    }

    const savedInterest = result.totalInterest - totalInterest;
    return { periods, totalInterest, savedInterest, totalMonths: monthCount };
  }, [result, extraMonthly, rate, recalc]);

  const visibleRows = result ? (showFullTable ? result.table : result.table.slice(0, 12)) : [];

  const stdConditions = (
    <ResultSection title="Adi ipoteka şərtləri">
      <ToneRow label="Maks. məbləğ" value="150 000 AZN" />
      <ToneRow label="Maks. müddət" value="25 il" />
      <ToneRow label="Min. ilkin ödəniş" value="15%" />
      <ToneRow label="Faiz dərəcəsi" value="Zəmanətli 7% / Zəmanətsiz 8%" />
    </ResultSection>
  );

  return (
    <View>
      {/* İpoteka növü */}
      <OptionCards
        label={pt.mortgageType}
        selected={mortgageType}
        onSelect={(v) => {
          setMortgageType(v);
          setRate(v === "internal" ? "" : "7");
        }}
        options={[
          { value: "internal", icon: "🏦", title: pt.internalMortgage, description: pt.internalMortgageDesc },
          { value: "state", icon: "🏛️", title: pt.stateMortgage, description: pt.stateMortgageDesc },
        ]}
      />

      {/* Dövlət ipotekası şərtləri */}
      {mortgageType === "state" && (
        <View style={{ marginBottom: 16 }}>
          <SegmentControl
            options={[
              { value: "standard", label: "Adi ipoteka" },
              { value: "subsidized", label: "4% — Güzəştli ipoteka" },
            ]}
            selected={stateSubtype}
            onSelect={(v) => {
              setStateSubtype(v);
              setRate(v === "standard" ? "7" : "4");
            }}
          />
          {stateSubtype === "standard" ? (
            stdConditions
          ) : (
            <>
              <ResultSection title="Güzəştli ipoteka şərtləri (4%)">
                <ToneRow label="Maks. məbləğ" value="100 000 AZN" />
                <ToneRow label="Maks. müddət" value="30 il" />
                <ToneRow label="Min. ilkin ödəniş" value="10%" />
                <ToneRow label="Faiz dərəcəsi" value="Zəmanətli 3.7% / Zəmanətsiz 4%" />
              </ResultSection>
              <Collapsible title="Kimlər istifadə edə bilər?">
                <SectionHeading>Gənc ailənin üzvü olan aşağıdakı şəxslər:</SectionHeading>
                <BulletList items={SHORT_YOUNG_FAMILY} />
                <SectionHeading>Digər hüququ olan şəxslər:</SectionHeading>
                <BulletList items={SHORT_OTHER} />
              </Collapsible>
            </>
          )}
        </View>
      )}

      {/* Daxiletmə */}
      <InputField
        label={`🏠 ${pt.propertyPrice}`}
        value={propertyPrice}
        onChangeText={handlePropertyPriceChange}
        placeholder="150000"
        keyboardType="decimal-pad"
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 2 }}>
          <InputField
            label={`💰 ${pt.downPayment}`}
            value={downPayment}
            onChangeText={handleDownPaymentChange}
            placeholder="30000"
            keyboardType="decimal-pad"
            suffix="AZN"
          />
        </View>
        <View style={{ flex: 1 }}>
          <InputField
            label="%"
            value={downPercent}
            onChangeText={handleDownPercentChange}
            placeholder="20"
            keyboardType="decimal-pad"
            suffix="%"
          />
        </View>
      </View>

      {mortgageType === "internal" ? (
        <InputField
          label={`📊 ${pt.annualRate}`}
          value={rate}
          onChangeText={setRate}
          placeholder="8"
          keyboardType="decimal-pad"
        />
      ) : (
        <ChipGroup
          label={`📊 ${pt.annualRate}`}
          options={INSURANCE_RATE_OPTIONS.map((r) => ({ value: r, label: `${r}%` }))}
          selected={rate}
          onSelect={setRate}
        />
      )}

      <InputField
        label={`📅 ${pt.termYears}`}
        value={years}
        onChangeText={setYears}
        placeholder="15"
        keyboardType="number-pad"
        hint="1 – 30"
      />

      {mortgageType === "state" && (
        <Select
          label={`👤 ${pt.insuranceAge}`}
          value={clientAge}
          options={AGE_OPTIONS}
          onSelect={setClientAge}
          placeholder={pt.selectAge}
          searchable={false}
        />
      )}

      {result ? (
        <View>
          <ResultHero label={pt.monthlyPayment} value={formatMoney(result.monthlyPayment)} sub={pt.perMonth} />
          <ToneGrid>
            <ToneCard label={pt.loanAmount} value={formatMoney(result.loanAmount)} sub="AZN" />
            <ToneCard label={pt.overpayment} value={formatMoney(result.totalInterest)} sub="AZN" tone="amber" />
          </ToneGrid>

          {/* Əmlak sığortası */}
          {propertyInsurance && (
            <TonePanel tone="emerald" title="🛡️ Əmlak sığortası">
              <SmallText>Tarif: əmlak dəyərinin 0.2%-i, hər 3 ildən bir yenilənir.</SmallText>
              <ToneGrid>
                <ToneCard
                  label="Sığorta haqqı (3 il)"
                  value={`${formatMoney(propertyInsurance.premium)} AZN`}
                  sub="Tarif: 0.2%"
                  tone="emerald"
                />
                <ToneCard
                  label={pt.totalWithInsurance}
                  value={`${formatMoney(result.monthlyPayment + propertyInsurance.avgMonthly)} AZN`}
                  sub={`~${formatMoney(propertyInsurance.avgMonthly)} AZN/ay`}
                  tone="blue"
                />
                <ToneCard
                  label={pt.insuranceTotal}
                  value={`${formatMoney(propertyInsurance.totalInsurance)} AZN`}
                  sub={`${propertyInsurance.totalCycles} × ${formatMoney(propertyInsurance.premium)}`}
                />
              </ToneGrid>
              <DataTable
                title="36 aylıq dövr cədvəli"
                headers={[pt.monthCol, pt.paymentCol, pt.interest]}
                columnWidths={[60, 130, 170]}
                rows={propertyInsurance.schedule
                  .filter((s) => s.payment > 0 || s.month === 1 || s.month === 2 || s.month === 13 || s.month === 25)
                  .map((s) => [
                    s.month,
                    s.payment > 0 ? `${formatMoney(s.payment)} AZN` : "0",
                    s.type === "deposit" ? "Depozit" : s.type === "installment" ? "Aylıq taksit (13-24)" : "—",
                  ])}
                highlightRows={[0]}
              />
              <SmallText>* Bu dövr hər 36 aydan bir təkrarlanır.</SmallText>
            </TonePanel>
          )}

          {/* Həyat sığortası — yalnız dövlət ipotekasında */}
          {mortgageType === "state" && lifeInsurance && (
            <TonePanel tone="violet" title={`💜 ${pt.insuranceTitle}`}>
              <SmallText>{pt.insuranceDesc}</SmallText>
              <ToneGrid>
                <ToneCard
                  label={pt.insuranceMonthlyRate}
                  value={`${lifeInsurance.monthlyRatePercent.toFixed(4)}%`}
                  sub={`${clientAge} yaş, ${years} il, ${rate}%`}
                  tone="violet"
                />
                <ToneCard
                  label={pt.insuranceMonthlyPayment}
                  value={`${formatMoney(lifeInsurance.monthlyPayment)} AZN`}
                  sub={`${formatMoney(lifeInsurance.totalCost)} ÷ ${result.months} ay`}
                  tone="violet"
                />
                <ToneCard
                  label={pt.totalWithInsurance}
                  value={`${formatMoney(
                    result.monthlyPayment + lifeInsurance.monthlyPayment + (propertyInsurance?.avgMonthly || 0)
                  )} AZN`}
                  sub="kredit + həyat + əmlak sığortası"
                  tone="blue"
                />
                <ToneCard label={pt.insuranceTotal} value={`${formatMoney(lifeInsurance.totalCost)} AZN`} />
              </ToneGrid>
            </TonePanel>
          )}

          {/* Ümumi hesablama */}
          <ResultSection title={`📊 ${pt.totalSummary}`}>
            <ToneRow label={pt.propertyPriceLabel} value={`${formatMoney(parseFloat(propertyPrice))} AZN`} />
            <ToneRow
              label={`${pt.downPaymentLabel} (${result.downPercent.toFixed(1)}%)`}
              value={`${formatMoney(parseFloat(downPayment) || 0)} AZN`}
            />
            <ToneRow label={pt.loanAmountLabel} value={`${formatMoney(result.loanAmount)} AZN`} />
            <ToneRow
              label={pt.termLabel}
              value={`${years} ${pt.yearSuffix} (${result.months} ${pt.monthSuffix})`}
            />
            <ToneRow label={pt.totalInterestPayment} value={`${formatMoney(result.totalInterest)} AZN`} tone="amber" />
            <ToneRow
              label={pt.totalPaymentAll}
              value={`${formatMoney(result.totalWithDown)} AZN`}
              tone="accent"
              bold
              shaded
            />
          </ResultSection>

          {/* Əsas borc / faiz zolağı */}
          <View style={{ marginTop: 8 }}>
            <StackedBar
              segments={[
                { value: result.loanAmount, color: colors.accent },
                { value: result.totalInterest, color: TONES.amber + "88" },
              ]}
            />
            <Legend
              items={[
                { color: colors.accent, text: `${pt.principalDebt}: ${formatMoney(result.loanAmount)} AZN` },
                { color: TONES.amber, text: `${pt.interest}: ${formatMoney(result.totalInterest)} AZN` },
              ]}
            />
          </View>

          {/* İllik icmal */}
          <DataTable
            title={`📅 ${pt.yearlySummary}`}
            headers={[pt.yearCol, pt.principalCol, pt.interestCol, pt.remainingCol]}
            columnWidths={[80, 110, 110, 120]}
            rows={result.yearlyData.map((row) => [
              `${row.year}${pt.yearSuffixOrd}`,
              formatMoney(row.principal),
              formatMoney(row.interest),
              formatMoney(row.balance),
            ])}
          />

          {/* Aylıq annuitet cədvəli */}
          <DataTable
            title={`📋 ${pt.monthlyAmortization}`}
            headers={[pt.monthCol, pt.paymentCol, pt.principalCol, pt.interestCol, pt.remainingCol]}
            columnWidths={[50, 100, 100, 100, 120]}
            rows={visibleRows.map((row) => [
              row.month,
              formatMoney(row.payment),
              formatMoney(row.principal),
              formatMoney(row.interest),
              formatMoney(row.balance),
            ])}
          />
          {result.table.length > 12 && (
            <ShowMoreButton
              expanded={showFullTable}
              onPress={() => setShowFullTable(!showFullTable)}
              moreLabel={pt.showAll.replace("{count}", String(result.table.length))}
              lessLabel={pt.collapse}
            />
          )}

          {/* Erkən ödəmə ssenariləri */}
          <SectionHeading icon="🎯">{pt.scenariosTitle}</SectionHeading>
          <InputField
            label={`💸 ${pt.extraMonthlyLabel}`}
            value={extraMonthly}
            onChangeText={setExtraMonthly}
            placeholder="200"
            keyboardType="decimal-pad"
          />
          <InputField
            label={`🏦 ${pt.lumpSumLabel}`}
            value={lumpSum}
            onChangeText={setLumpSum}
            placeholder="10000"
            keyboardType="decimal-pad"
          />

          {scenarioA && (
            <View style={{ marginBottom: 12 }}>
              <SectionHeading>{pt.scenarioA}</SectionHeading>
              <Paragraph>{pt.scenarioADesc}</Paragraph>
              <ToneGrid>
                <ToneCard
                  label={pt.newTerm}
                  value={`${Math.floor(scenarioA.newMonths / 12)} ${pt.year} ${scenarioA.newMonths % 12} ${pt.month}`}
                  tone="green"
                />
                <ToneCard
                  label={pt.timeSaved}
                  value={`${scenarioA.savedYears > 0 ? `${scenarioA.savedYears} ${pt.year} ` : ""}${
                    scenarioA.savedRemainderMonths
                  } ${pt.month}`}
                  tone="green"
                />
                <ToneCard label={pt.interestSaved} value={`${formatMoney(scenarioA.savedInterest)} AZN`} tone="green" />
              </ToneGrid>
            </View>
          )}

          {scenarioB && (
            <View style={{ marginBottom: 12 }}>
              <SectionHeading>{pt.scenarioB}</SectionHeading>
              <Paragraph>{pt.scenarioBDesc}</Paragraph>
              <ToneGrid>
                <ToneCard label={pt.newMonthlyPayment} value={`${formatMoney(scenarioB.newPayment)} AZN`} tone="blue" />
                <ToneCard label={pt.monthlySaving} value={`${formatMoney(scenarioB.saving)} AZN`} tone="blue" />
              </ToneGrid>
            </View>
          )}

          {scenarioA && scenarioC && (
            <View style={{ marginBottom: 12 }}>
              <SectionHeading>{pt.scenarioC}</SectionHeading>
              <Paragraph>{pt.scenarioCDesc}</Paragraph>
              <SegmentControl
                label={pt.recalcInterval}
                options={[
                  { value: "12", label: pt.every12Months },
                  { value: "1", label: pt.everyMonth },
                ]}
                selected={recalcInterval}
                onSelect={setRecalcInterval}
              />
              <ToneGrid>
                <ToneCard label={pt.totalInterestC} value={`${formatMoney(scenarioC.totalInterest)} AZN`} tone="purple" />
                <ToneCard label={pt.totalSavedC} value={`${formatMoney(scenarioC.savedInterest)} AZN`} tone="purple" />
              </ToneGrid>
              <DataTable
                headers={[
                  recalc === 12 ? pt.yearCol : pt.monthCol,
                  pt.newPaymentCol,
                  pt.remainingTermCol,
                  pt.remainingBalanceCol,
                ]}
                columnWidths={[80, 130, 130, 120]}
                rows={scenarioC.periods.map((row) => [
                  row.period === "0" ? "—" : recalc === 12 ? `${row.period}${pt.yearSuffixOrd}` : row.period,
                  formatMoney(row.payment),
                  row.remainingTerm,
                  formatMoney(row.balance),
                ])}
              />
            </View>
          )}
        </View>
      ) : (
        <EmptyState icon="🏡" text={pt.emptyStateText} />
      )}

      {/* Adi və güzəştli ipoteka şərtləri */}
      <SectionHeading>Adi və güzəştli ipoteka şərtləri</SectionHeading>
      <Paragraph>
        Azərbaycan Respublikası İpoteka və Kredit Zəmanət Fondu tərəfindən təqdim olunan ipoteka kreditləri və güzəştli
        ipoteka kreditləri arasında müəyyən fərqlər mövcuddur.
      </Paragraph>
      <DataTable
        headers={["Şərt", "Adi ipoteka", "Güzəştli ipoteka"]}
        columnWidths={[140, 110, 130]}
        rows={[
          ["Maks. məbləğ", "150 000 AZN", "100 000 AZN"],
          ["Maks. müddət", "25 il", "30 il"],
          ["Min. ilkin ödəniş", "15%", "10%"],
          ["Faiz (zəmanətli)", "7%", "3.7%"],
          ["Faiz (zəmanətsiz)", "8%", "4%"],
        ]}
      />
      <SmallText>
        Bu faizlər maksimal hədd olaraq müəyyən edilib. Bəzi banklar rəqabətli bazar şəraitində daha aşağı faiz
        dərəcələri də təklif edə bilərlər. Lakin belə hallarda mütləq İpoteka və Kredit Zəmanət Fondunun təsdiqi tələb
        olunur.
      </SmallText>

      <TonePanel tone="green" title="Güzəştli ipoteka kreditindən kimlər istifadə edə bilər?">
        <SectionHeading>Gənc ailənin üzvü olan aşağıdakı şəxslər:</SectionHeading>
        <BulletList items={FULL_YOUNG_FAMILY} />
        <SectionHeading>Digər hüququ olan şəxslər:</SectionHeading>
        <BulletList items={FULL_OTHER} />
      </TonePanel>

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["loan", "property-tax", "salary", "deposit"]} />
    </View>
  );
}
