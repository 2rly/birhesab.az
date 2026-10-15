import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ChipGroup } from "@/components/Controls";
import { ResultSection } from "@/components/ResultRow";
import { DataTable, FormulaSection, RelatedCalculators, ResultHero, InfoBox } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { useTheme } from "@/constants/theme";
import {
  OptionCards,
  ToneCard,
  ToneGrid,
  ToneRow,
  StackedBar,
  Legend,
  ShowMoreButton,
  EmptyState,
  SmallText,
  TONES,
} from "./_loan-parts";

type CarCondition = "new" | "used";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function calculateAnnuity(amount: number, yearlyRate: number, months: number) {
  const monthlyRate = yearlyRate / 100 / 12;

  if (monthlyRate === 0) {
    const payment = amount / months;
    return { payment, totalPayment: amount, totalInterest: 0, monthlyRate: 0 };
  }

  const payment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = payment * months;
  const totalInterest = totalPayment - amount;

  return { payment, totalPayment, totalInterest, monthlyRate };
}

function buildAmortizationSummary(
  amount: number,
  monthlyRate: number,
  monthlyPayment: number,
  months: number
): { firstYear: AmortizationRow[]; lastPayment: AmortizationRow } {
  const rows: AmortizationRow[] = [];
  let balance = amount;

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);

    if (i <= 12 || i === months) {
      rows.push({ month: i, payment: monthlyPayment, principal, interest, balance });
    }
  }

  return {
    firstYear: rows.filter((r) => r.month <= 12),
    lastPayment: rows[rows.length - 1],
  };
}

const fmt = (n: number) => fmtNum(n, 2);

const pt = {
  formulaTitle: "Avtomobil krediti necə hesablanır?",
  formulaContent: `Aylıq ödəniş (annuitet) = M × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

M — kredit məbləği (qiymət − ilkin ödəniş)
r — aylıq faiz dərəcəsi (illik faiz / 12 / 100)
n — kredit müddəti (ay)

Azərbaycanda tipik faiz dərəcələri:
• Yeni avtomobil: 12–18% illik
• İşlənmiş avtomobil: 15–22% illik

İlkin ödəniş adətən 20–30% tələb olunur.
Daha yüksək ilkin ödəniş — daha az faiz xərci.`,
  carCondition: "Avtomobilin vəziyyəti",
  conditionNew: "Yeni",
  conditionNewRate: "12–18% illik",
  conditionUsed: "İşlənmiş",
  conditionUsedRate: "15–22% illik",
  carPrice: "Avtomobilin qiyməti (AZN)",
  interestRate: "İllik faiz dərəcəsi (%)",
  downPayment: "İlkin ödəniş:",
  loanTerm: "Kredit müddəti",
  monthUnit: "ay",
  monthlyPayment: "Aylıq ödəniş",
  perMonth: "AZN / ay",
  loanAmount: "Kredit məbləği",
  overpayment: "Artıq ödəniş (faiz)",
  costStructure: "Ümumi xərcin strukturu",
  downPaymentLegend: "İlkin ödəniş:",
  principalLegend: "Əsas borc:",
  interestLegend: "Faiz:",
  detailedCalc: "Ətraflı hesablama",
  carPriceRow: "Avtomobilin qiyməti",
  downPaymentRow: "İlkin ödəniş",
  loanAmountRow: "Kredit məbləği",
  interestRateRow: "Faiz dərəcəsi",
  termRow: "Müddət",
  monthlyPaymentRow: "Aylıq ödəniş",
  totalInterestRow: "Ümumi faiz ödənişi",
  totalPaymentRow: "Ümumi ödəniş (kredit)",
  totalCostRow: "Ümumi xərc (ilkin + kredit)",
  yearlyLabel: "illik",
  paymentSchedule: "Ödəniş cədvəli (ilk 12 ay)",
  monthHeader: "Ay",
  paymentHeader: "Ödəniş",
  principalHeader: "Əsas borc",
  interestHeader: "Faiz",
  balanceHeader: "Qalıq",
  moreMonths: "ay daha",
  collapse: "Yığ",
  showAll12: "12 ayı tam göstər",
  warningTitle: "Diqqət:",
  warningText:
    "Bu hesablama təxmini xarakter daşıyır. Faktiki faiz dərəcəsi bankın siyasətinə, kredit tarixçəsinə və müraciət zamanına görə fərqlənə bilər. Komisyon və sığorta xərcləri daxil edilməyib.",
  emptyState: "Nəticəni görmək üçün avtomobilin qiymətini daxil edin.",
};

const DOWN_OPTIONS = Array.from({ length: 17 }, (_, i) => String(i * 5)).map((v) => ({ value: v, label: `${v}%` }));
const termOptions = [12, 24, 36, 48, 60, 72];

export function AutoLoanCalculator() {
  const { colors } = useTheme();
  const [carPrice, setCarPrice] = useState("");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [loanTerm, setLoanTerm] = useState("36");
  const [interestRate, setInterestRate] = useState("");
  const [carCondition, setCarCondition] = useState<CarCondition>("new");
  const [showFullTable, setShowFullTable] = useState(false);

  const suggestedRate = carCondition === "new" ? "15" : "18";

  const result = useMemo(() => {
    const price = parseFloat(carPrice);
    const downPct = parseFloat(downPaymentPercent);
    const months = parseInt(loanTerm);
    const rate = parseFloat(interestRate) || parseFloat(suggestedRate);

    if (!price || price <= 0 || isNaN(downPct) || downPct < 0 || downPct > 99) return null;
    if (!months || months <= 0) return null;
    if (!rate || rate < 0) return null;

    const downPayment = (price * downPct) / 100;
    const loanAmount = price - downPayment;

    if (loanAmount <= 0) return null;

    const { payment, totalPayment, totalInterest, monthlyRate } = calculateAnnuity(loanAmount, rate, months);
    const amortization = buildAmortizationSummary(loanAmount, monthlyRate, payment, months);

    return {
      carPrice: price,
      downPayment,
      downPaymentPercent: downPct,
      loanAmount,
      monthlyPayment: payment,
      totalPayment,
      totalInterest,
      totalCost: downPayment + totalPayment,
      interestRate: rate,
      months,
      amortization,
    };
  }, [carPrice, downPaymentPercent, loanTerm, interestRate, suggestedRate]);

  const price = parseFloat(carPrice);
  const downLabel =
    `💳 ${pt.downPayment} ${downPaymentPercent}%` +
    (carPrice && price > 0 ? ` — ${fmt((price * parseFloat(downPaymentPercent || "0")) / 100)} AZN` : "");

  const scheduleRows: AmortizationRow[] = result
    ? showFullTable
      ? result.amortization.firstYear
      : result.amortization.firstYear.slice(0, 6)
    : [];

  return (
    <View>
      <OptionCards
        label={pt.carCondition}
        selected={carCondition}
        onSelect={setCarCondition}
        center
        options={[
          { value: "new", icon: "🚗", title: pt.conditionNew, description: pt.conditionNewRate },
          { value: "used", icon: "🔧", title: pt.conditionUsed, description: pt.conditionUsedRate },
        ]}
      />

      <InputField
        label={`💰 ${pt.carPrice}`}
        value={carPrice}
        onChangeText={setCarPrice}
        placeholder="30000"
        keyboardType="decimal-pad"
      />
      <InputField
        label={`📊 ${pt.interestRate}`}
        value={interestRate}
        onChangeText={setInterestRate}
        placeholder={suggestedRate}
        keyboardType="decimal-pad"
      />

      <ChipGroup label={downLabel} options={DOWN_OPTIONS} selected={downPaymentPercent} onSelect={setDownPaymentPercent} />

      <ChipGroup
        label={`📅 ${pt.loanTerm}`}
        options={termOptions.map((t) => ({ value: String(t), label: `${t} ${pt.monthUnit}` }))}
        selected={loanTerm}
        onSelect={setLoanTerm}
      />

      {result ? (
        <View>
          <ResultHero label={pt.monthlyPayment} value={fmt(result.monthlyPayment)} sub={pt.perMonth} />
          <ToneGrid>
            <ToneCard label={pt.loanAmount} value={fmt(result.loanAmount)} sub="AZN" />
            <ToneCard label={pt.overpayment} value={fmt(result.totalInterest)} sub="AZN" tone="amber" />
          </ToneGrid>

          {/* Ümumi xərcin strukturu */}
          <View style={{ marginTop: 16 }}>
            <SmallText>{pt.costStructure}</SmallText>
            <View style={{ height: 6 }} />
            <StackedBar
              height={20}
              segments={[
                { value: result.downPayment, color: TONES.green },
                { value: result.loanAmount, color: colors.accent },
                { value: result.totalInterest, color: TONES.amber },
              ]}
            />
            <Legend
              items={[
                { color: TONES.green, text: `${pt.downPaymentLegend} ${fmt(result.downPayment)} AZN` },
                { color: colors.accent, text: `${pt.principalLegend} ${fmt(result.loanAmount)} AZN` },
                { color: TONES.amber, text: `${pt.interestLegend} ${fmt(result.totalInterest)} AZN` },
              ]}
            />
          </View>

          <ResultSection title={`📋 ${pt.detailedCalc}`}>
            <ToneRow label={pt.carPriceRow} value={`${fmt(result.carPrice)} AZN`} />
            <ToneRow
              label={`${pt.downPaymentRow} (${result.downPaymentPercent}%)`}
              value={`${fmt(result.downPayment)} AZN`}
              tone="green"
            />
            <ToneRow label={pt.loanAmountRow} value={`${fmt(result.loanAmount)} AZN`} />
            <ToneRow label={pt.interestRateRow} value={`${result.interestRate}% ${pt.yearlyLabel}`} />
            <ToneRow label={pt.termRow} value={`${result.months} ${pt.monthUnit}`} />
            <ToneRow label={pt.monthlyPaymentRow} value={`${fmt(result.monthlyPayment)} AZN`} tone="accent" />
            <ToneRow label={pt.totalInterestRow} value={`${fmt(result.totalInterest)} AZN`} tone="amber" />
            <ToneRow label={pt.totalPaymentRow} value={`${fmt(result.totalPayment)} AZN`} />
            <ToneRow label={pt.totalCostRow} value={`${fmt(result.totalCost)} AZN`} tone="accent" bold shaded />
          </ResultSection>

          {/* Ödəniş cədvəli */}
          {(() => {
            const rows: (string | number)[][] = scheduleRows.map((row) => [
              row.month,
              fmt(row.payment),
              fmt(row.principal),
              fmt(row.interest),
              fmt(row.balance),
            ]);
            if (result.months > 12) rows.push([`... ${result.months - 12} ${pt.moreMonths} ...`, "", "", "", ""]);
            const lp = result.amortization.lastPayment;
            rows.push([lp.month, fmt(lp.payment), fmt(lp.principal), fmt(lp.interest), fmt(lp.balance)]);
            return (
              <DataTable
                title={`📋 ${pt.paymentSchedule}`}
                headers={[pt.monthHeader, pt.paymentHeader, pt.principalHeader, pt.interestHeader, pt.balanceHeader]}
                columnWidths={[110, 100, 100, 90, 110]}
                rows={rows}
                highlightRows={[rows.length - 1]}
              />
            );
          })()}
          {result.amortization.firstYear.length > 6 && (
            <ShowMoreButton
              expanded={showFullTable}
              onPress={() => setShowFullTable(!showFullTable)}
              moreLabel={pt.showAll12}
              lessLabel={pt.collapse}
            />
          )}

          <InfoBox variant="info" title={pt.warningTitle}>
            {pt.warningText}
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🚗" text={pt.emptyState} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["loan", "car-customs", "road-tax", "osago"]} />
    </View>
  );
}
