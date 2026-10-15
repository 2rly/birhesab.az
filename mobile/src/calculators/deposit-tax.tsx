import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { ToggleRow } from "@/components/Controls";
import { ResultSection } from "@/components/ResultRow";
import { FormulaSection, RelatedCalculators, InfoBox } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { useTheme } from "@/constants/theme";
import { ToneCard, ToneGrid, ToneRow, TonePanel, QuickChips, EmptyState, TONES } from "./_loan-parts";

type Currency = "AZN" | "USD";

const TAX_RATE = 0.1;
const MONTHLY_EXEMPTION = 200;

const formatMoney = (n: number) => fmtNum(n, 2);

const pt = {
  formulaTitle: "Depozit faiz gəlirindən vergi necə tutulur?",
  formulaContent: `Vergi Məcəlləsinin 123-cü maddəsinə əsasən, fiziki şəxslərin bank əmanətləri üzrə faiz gəlirləri kapital gəlirləri hesab olunur və banklar tərəfindən ödəmə mənbəyində 10% dərəcə ilə vergi tutulur.

V.M. 102.1.22-3 — Aylıq 200₼ güzəşt:
• Hər bir bankda, milli valyutada olan əmanətlər üzrə aylıq faiz gəlirinin 200₼-dək hissəsi vergidən azaddır
• Vergi (10%) yalnız 200₼-i keçən hissədən tutulur
• Müddət tələbi yoxdur, hər bankda ayrıca tətbiq olunur

V.M. 102.1.22-4 — 18 ay qaydası:
• AZN depozit ≥18 ay müddətə yerləşdirilib, 18 aydan tez çıxarılmırsa — bütün faiz gəlirləri 100% vergidən azaddır
• 2024-dən etibarən 3 il müddətinə qüvvədədir
• Vaxtından əvvəl çıxarılsa, V.M. 102.1.22-3 (200₼ güzəşt) tətbiq olunur

Xarici valyuta (USD/EUR):
• Heç bir güzəşt yoxdur — bütün faiz gəlirindən 10% vergi tutulur
• 18 ay qaydası yalnız milli valyutaya şamil edilir`,
  currencyAZN: "Manat (AZN)",
  currencyUSD: "Xarici valyuta (USD/EUR)",
  depositAmount: "Depozit məbləği",
  annualRate: "İllik faiz dərəcəsi (%)",
  termMonths: "Müddət (ay)",
  monthLabel: "ay",
  earlyWithdrawalLabel: "Depoziti 18 aydan əvvəl çıxaracağam",
  earlyWithdrawalDesc: "100% vergisiz güzəşt əvəzinə 200₼ aylıq güzəşt tətbiq olunacaq",
  foreignNoExemption: "Xarici valyuta — güzəşt yoxdur",
  foreignNoExemptionDesc: "Bütün faiz gəlirindən 10% ÖMV tutulur. 18 ay qaydası yalnız milli valyutaya şamil edilir.",
  rule18MonthTitle: "V.M. 102.1.22-4: 100% vergidən azad",
  rule18MonthDesc: "AZN depozit, müddəti {m} ay (≥18 ay), vaxtında çıxarılacaq — heç bir vergi tutulmayacaq.",
  rule200Title: "V.M. 102.1.22-3: Aylıq 200₼ güzəşt",
  rule200Desc: "Aylıq faiz gəlirinin 200₼-dək hissəsi vergidən azaddır. 200₼-dən artıq hissədən 10% vergi tutulur.",
  totalInterest: "Ümumi faiz gəliri",
  taxDeducted: "Tutulan vergi",
  taxLabel: "Vergi",
  taxFree: "100% azad",
  netIncome: "Xalis gəlir",
  effectiveTaxRate: "Effektiv vergi dərəcəsi",
  fromNominal: "nominal 10%-dən",
  monthlyCalcTitle: "Aylıq vergi hesablaması",
  monthlyInterest: "Aylıq faiz gəliri",
  exemptPart: "Vergidən azad hissə (güzəşt)",
  taxablePart: "Vergiyə cəlb olunan hissə",
  monthlyTax: "Aylıq vergi (10%)",
  monthlyNetReceive: "Aylıq əlinizə çatan",
  totalCalcTitle: "Ümumi hesablama ({m} ay)",
  totalInterestLabel: "Ümumi faiz gəliri",
  totalExemptPart: "Vergidən azad hissə",
  totalTaxablePart: "Vergiyə cəlb olunan",
  totalTaxLabel: "Ümumi vergi",
  totalNetInterest: "Xalis faiz gəliri",
  calcStepsTitle: "Hesablama addımları (V.M. 102.1.22-3)",
  step1: "1. Aylıq faiz gəliri:",
  step2: "2. Güzəşt çıxılır (aylıq 200₼):",
  step3: "3. Aylıq vergi (10%):",
  step4: "4. Aylıq əlinizə çatan:",
  step5: "5. Ümumi vergi ({m} ay):",
  legislationTitle: "Qanunvericilik əsası",
  law102_1_22_3_title: "V.M. 102.1.22-3",
  law102_1_22_3_desc:
    "Yerli bank və xarici bankın AR-dakı filialı tərəfindən fiziki şəxslərin hər bir bankda milli valyutada olan depozitlər üzrə hesablanan aylıq faiz gəlirlərinin 200₼-dək hissəsi gəlir vergisindən azaddır.",
  law102_1_22_4_title: "V.M. 102.1.22-4",
  law102_1_22_4_desc:
    "Milli valyutada olan depozit 18 ay və daha artıq müddətə yerləşdirildikdə və depozitin məbləği 18 aydan tez olmadan ödənildikdə, hesablanmış faiz gəlirlərinin tam hissəsi 3 il müddətinə vergidən azad edilir.",
  law123_title: "V.M. 123",
  law123_desc:
    "Fiziki şəxslərin əmanətləri üzrə faiz gəlirləri kapital gəlirləri olub, faiz gəlirlərinin milli və ya xarici valyutada olmasından asılı olmayaraq, banklar tərəfindən ödəmə mənbəyində 10% dərəcə ilə vergi tutulur.",
  emptyStateText: "Nəticəni görmək üçün məbləğ, faiz və müddət daxil edin.",
};

function Step({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.n240 }}>
      <Text style={{ fontSize: 13, color: colors.n580 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: tone ?? colors.n940, marginTop: 3 }}>{value}</Text>
    </View>
  );
}

export function DepositTaxCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("12");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [earlyWithdrawal, setEarlyWithdrawal] = useState(false);

  const m = parseInt(months) || 0;
  const is18MonthRule = currency === "AZN" && m >= 18 && !earlyWithdrawal;

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);

    if (!a || a <= 0 || !r || r <= 0 || !m || m <= 0) return null;

    const monthlyInterest = a * (r / 100 / 12);
    const totalInterest = monthlyInterest * m;

    let monthlyExempt: number;
    let monthlyTaxable: number;
    let monthlyTax: number;

    if (currency === "USD") {
      monthlyExempt = 0;
      monthlyTaxable = monthlyInterest;
      monthlyTax = monthlyInterest * TAX_RATE;
    } else if (is18MonthRule) {
      monthlyExempt = monthlyInterest;
      monthlyTaxable = 0;
      monthlyTax = 0;
    } else {
      monthlyExempt = Math.min(monthlyInterest, MONTHLY_EXEMPTION);
      monthlyTaxable = Math.max(0, monthlyInterest - MONTHLY_EXEMPTION);
      monthlyTax = monthlyTaxable * TAX_RATE;
    }

    const totalExempt = monthlyExempt * m;
    const totalTaxable = monthlyTaxable * m;
    const totalTax = monthlyTax * m;
    const totalNetInterest = totalInterest - totalTax;
    const monthlyNet = monthlyInterest - monthlyTax;
    const effectiveTaxRate = totalInterest > 0 ? (totalTax / totalInterest) * 100 : 0;

    return {
      monthlyInterest,
      monthlyExempt,
      monthlyTaxable,
      monthlyTax,
      monthlyNet,
      totalInterest,
      totalExempt,
      totalTaxable,
      totalTax,
      totalNetInterest,
      effectiveTaxRate,
    };
  }, [amount, rate, currency, is18MonthRule, m]);

  const cur = (n: number) => `${formatMoney(n)} ${currency}`;


  return (
    <View>
      <SegmentControl
        options={[
          { value: "AZN", label: pt.currencyAZN },
          { value: "USD", label: pt.currencyUSD },
        ]}
        selected={currency}
        onSelect={setCurrency}
      />

      <InputField
        label={`${pt.depositAmount} (${currency})`}
        value={amount}
        onChangeText={setAmount}
        placeholder="30000"
        keyboardType="decimal-pad"
      />
      <QuickChips
        options={[10000, 30000, 50000, 100000, 180000].map((v) => ({
          value: String(v),
          label: `${(v / 1000).toFixed(0)}k`,
        }))}
        onSelect={setAmount}
      />
      <InputField label={pt.annualRate} value={rate} onChangeText={setRate} placeholder="10" keyboardType="decimal-pad" />
      <InputField
        label={pt.termMonths}
        value={months}
        onChangeText={setMonths}
        placeholder="12"
        keyboardType="number-pad"
      />
      <QuickChips
        options={[6, 12, 18, 24, 36].map((v) => ({ value: String(v), label: `${v} ${pt.monthLabel}` }))}
        selected={months}
        onSelect={setMonths}
      />

      {currency === "AZN" && m >= 18 && (
        <ToggleRow
          label={pt.earlyWithdrawalLabel}
          description={pt.earlyWithdrawalDesc}
          value={earlyWithdrawal}
          onValueChange={setEarlyWithdrawal}
        />
      )}

      {currency === "USD" ? (
        <InfoBox variant="danger" title={pt.foreignNoExemption}>
          {pt.foreignNoExemptionDesc}
        </InfoBox>
      ) : is18MonthRule ? (
        <InfoBox variant="success" title={pt.rule18MonthTitle}>
          {pt.rule18MonthDesc.replace("{m}", String(m))}
        </InfoBox>
      ) : (
        <InfoBox variant="warning" title={pt.rule200Title}>
          {pt.rule200Desc}
        </InfoBox>
      )}

      {result ? (
        <View>
          <ToneGrid>
            <ToneCard label={pt.totalInterest} value={cur(result.totalInterest)} tone="green" />
            {result.totalTax > 0 ? (
              <ToneCard label={pt.taxDeducted} value={`-${cur(result.totalTax)}`} tone="red" />
            ) : (
              <ToneCard label={pt.taxLabel} value={cur(0)} sub={pt.taxFree} tone="green" />
            )}
            <ToneCard label={pt.netIncome} value={cur(result.totalNetInterest)} tone="accent" />
            <ToneCard
              label={pt.effectiveTaxRate}
              value={`${result.effectiveTaxRate.toFixed(1)}%`}
              sub={pt.fromNominal}
            />
          </ToneGrid>

          <ResultSection title={`📊 ${pt.monthlyCalcTitle}`}>
            <ToneRow label={pt.monthlyInterest} value={cur(result.monthlyInterest)} />
            {currency === "AZN" && !is18MonthRule && (
              <ToneRow label={pt.exemptPart} value={`-${cur(result.monthlyExempt)}`} tone="green" />
            )}
            <ToneRow label={pt.taxablePart} value={cur(result.monthlyTaxable)} />
            <ToneRow
              label={pt.monthlyTax}
              value={`${result.monthlyTax > 0 ? `-${formatMoney(result.monthlyTax)}` : "0.00"} ${currency}`}
              tone="red"
              bold
              shaded
            />
            <ToneRow label={pt.monthlyNetReceive} value={cur(result.monthlyNet)} tone="accent" bold shaded />
          </ResultSection>

          <ResultSection title={`📅 ${pt.totalCalcTitle.replace("{m}", String(m))}`}>
            <ToneRow label={pt.totalInterestLabel} value={cur(result.totalInterest)} />
            {result.totalExempt > 0 && (
              <ToneRow label={pt.totalExemptPart} value={cur(result.totalExempt)} tone="green" />
            )}
            <ToneRow label={pt.totalTaxablePart} value={cur(result.totalTaxable)} />
            <ToneRow
              label={pt.totalTaxLabel}
              value={`${result.totalTax > 0 ? `-${formatMoney(result.totalTax)}` : "0.00"} ${currency}`}
              tone="red"
              bold
              shaded
            />
            <ToneRow label={pt.totalNetInterest} value={cur(result.totalNetInterest)} tone="accent" bold shaded />
          </ResultSection>

          {currency === "AZN" && !is18MonthRule && result.monthlyTax > 0 && (
            <ResultSection title={`🔢 ${pt.calcStepsTitle}`}>
              <Step
                label={pt.step1}
                value={`${formatMoney(parseFloat(amount))} × ${rate}% ÷ 12 = ${cur(result.monthlyInterest)}`}
              />
              <Step
                label={pt.step2}
                value={`${formatMoney(result.monthlyInterest)} − 200.00 = ${cur(result.monthlyTaxable)}`}
              />
              <Step
                label={pt.step3}
                value={`${formatMoney(result.monthlyTaxable)} × 10% = ${cur(result.monthlyTax)}`}
                tone={TONES.red}
              />
              <Step
                label={pt.step4}
                value={`${formatMoney(result.monthlyInterest)} − ${formatMoney(result.monthlyTax)} = ${cur(
                  result.monthlyNet
                )}`}
                tone={colors.accent}
              />
              <Step
                label={pt.step5.replace("{m}", String(m))}
                value={`${formatMoney(result.monthlyTax)} × ${m} ${pt.monthLabel} = ${cur(result.totalTax)}`}
                tone={TONES.red}
              />
            </ResultSection>
          )}

          <TonePanel tone="blue" title={`📋 ${pt.legislationTitle}`}>
            {[
              [pt.law102_1_22_3_title, pt.law102_1_22_3_desc],
              [pt.law102_1_22_4_title, pt.law102_1_22_4_desc],
              [pt.law123_title, pt.law123_desc],
            ].map(([t, d]) => (
              <View key={t} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.n940, marginBottom: 2 }}>{t}</Text>
                <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>{d}</Text>
              </View>
            ))}
          </TonePanel>
        </View>
      ) : (
        <EmptyState icon="🧾" text={pt.emptyStateText} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["deposit", "dividend-tax", "salary", "rental-income-tax"]} />
    </View>
  );
}
