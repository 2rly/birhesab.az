import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { DataTable, FormulaSection, RelatedCalculators, ResultHero, SectionHeading, Paragraph } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { useTheme } from "@/constants/theme";
import {
  ToneCard,
  ToneGrid,
  StackedBar,
  Legend,
  TonePanel,
  ShowMoreButton,
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

function buildAmortizationTable(
  amount: number,
  monthlyRate: number,
  monthlyPayment: number,
  months: number
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = amount;

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: i, payment: monthlyPayment, principal, interest, balance });
  }

  return rows;
}

const formatMoney = (n: number) => fmtNum(n, 2);

const pt = {
  formulaTitle: "Annuitet ödənişi necə hesablanır?",
  formulaContent: `Aylıq ödəniş = M × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

M — kredit məbləği
r — aylıq faiz dərəcəsi (illik faiz / 12 / 100)
n — kredit müddəti (ay)

Annuitet sistemində hər ay eyni məbləğ ödənilir.
İlk aylarda faiz payı çox, əsas borc payı az olur.
Sonrakı aylarda əksinə — əsas borc payı artır, faiz azalır.`,
  loanAmount: "Kredit məbləği (AZN)",
  annualRate: "İllik faiz dərəcəsi (%)",
  term: "Müddət (ay)",
  monthlyPayment: "Aylıq ödəniş",
  perMonth: "AZN / ay",
  totalPayment: "Ümumi ödəniş",
  overpayment: "Artıq ödəniş (faiz)",
  principalDebt: "Əsas borc",
  interest: "Faiz",
  amortizationTable: "Annuitet cədvəli",
  monthCol: "Ay",
  paymentCol: "Ödəniş",
  principalCol: "Əsas borc",
  interestCol: "Faiz",
  remainingCol: "Qalıq borc",
  collapse: "Yığ",
  showAll: "Bütün {count} ayı göstər",
  emptyStateText: "Nəticəni görmək üçün məbləğ, faiz və müddət daxil edin.",
  scenariosTitle: "Erkən ödəmə ssenariləri",
  scenarioA: "Ssenari A: Müddətin qısaldılması",
  scenarioADesc: "Hər ay əlavə ödəniş etsəniz, kredit neçə ay tez bitər?",
  extraMonthlyLabel: "Aylıq əlavə ödəniş (AZN)",
  newTerm: "Yeni müddət",
  timeSaved: "Qazanılan zaman",
  interestSaved: "Qənaət edilən faiz",
  scenarioB: "Ssenari B: Birdəfəlik ödəmə",
  scenarioBDesc: "Bugün birdəfəlik ödəsəniz, yeni aylıq ödəniş nə qədər olar?",
  lumpSumLabel: "Birdəfəlik ödəniş (AZN)",
  newMonthlyPayment: "Yeni aylıq ödəniş",
  monthlySaving: "Aylıq qənaət",
  year: "il",
  month: "ay",
  original: "Standart",
  withExtra: "Əlavə ödənişlə",
  totalInterestPaid: "Ümumi faiz",
};

function ym(totalMonths: number) {
  const y = Math.floor(totalMonths / 12);
  return `${y > 0 ? `${y} ${pt.year} ` : ""}${totalMonths % 12} ${pt.month}`;
}

export function LoanCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");
  const [showFullTable, setShowFullTable] = useState(false);
  const [extraMonthly, setExtraMonthly] = useState("");
  const [lumpSum, setLumpSum] = useState("");

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    const m = parseInt(months);

    if (!a || a <= 0 || isNaN(r) || r < 0 || !m || m <= 0) return null;

    const { payment, totalPayment, totalInterest, monthlyRate } = calculateAnnuity(a, r, m);
    const table = buildAmortizationTable(a, monthlyRate, payment, m);

    return { payment, totalPayment, totalInterest, table, monthlyRate };
  }, [amount, rate, months]);

  // Ssenari A: Əlavə aylıq ödəniş → müddət qısalır
  const scenarioA = useMemo(() => {
    if (!result) return null;
    const extra = parseFloat(extraMonthly);
    if (!extra || extra <= 0) return null;
    const a = parseFloat(amount);
    const mr = result.monthlyRate;
    const totalMonthly = result.payment + extra;
    let balance = a;
    let newMonths = 0;
    let totalInterestNew = 0;
    while (balance > 0.01 && newMonths < 3600) {
      const interest = balance * mr;
      totalInterestNew += interest;
      const principal = Math.min(totalMonthly - interest, balance);
      balance -= principal;
      newMonths++;
    }
    const originalMonths = parseInt(months);
    const monthsSaved = originalMonths - newMonths;
    const interestSaved = result.totalInterest - totalInterestNew;
    if (monthsSaved <= 0) return null;
    return { newMonths, monthsSaved, totalInterestNew, interestSaved };
  }, [result, extraMonthly, amount, months]);

  // Ssenari B: Birdəfəlik ödəniş → aylıq ödəniş azalır
  const scenarioB = useMemo(() => {
    if (!result) return null;
    const lump = parseFloat(lumpSum);
    const a = parseFloat(amount);
    if (!lump || lump <= 0 || lump >= a) return null;
    const r = parseFloat(rate);
    const m = parseInt(months);
    const newAmount = a - lump;
    const { payment: newPayment } = calculateAnnuity(newAmount, r, m);
    const saving = result.payment - newPayment;
    return { newPayment, saving, newAmount };
  }, [result, lumpSum, amount, rate, months]);

  const visibleRows = result ? (showFullTable ? result.table : result.table.slice(0, 12)) : [];

  return (
    <View>
      <InputField
        label={`💰 ${pt.loanAmount}`}
        value={amount}
        onChangeText={setAmount}
        placeholder="10000"
        keyboardType="decimal-pad"
      />
      <InputField
        label={`📊 ${pt.annualRate}`}
        value={rate}
        onChangeText={setRate}
        placeholder="12"
        keyboardType="decimal-pad"
      />
      <InputField
        label={`📅 ${pt.term}`}
        value={months}
        onChangeText={setMonths}
        placeholder="24"
        keyboardType="number-pad"
      />

      {result ? (
        <View>
          <ResultHero label={pt.monthlyPayment} value={formatMoney(result.payment)} sub={pt.perMonth} />
          <ToneGrid>
            <ToneCard label={pt.totalPayment} value={formatMoney(result.totalPayment)} sub="AZN" />
            <ToneCard label={pt.overpayment} value={formatMoney(result.totalInterest)} sub="AZN" tone="amber" />
          </ToneGrid>

          {/* Progress bar */}
          <View style={{ marginTop: 16 }}>
            <StackedBar
              background={TONES.amber + "55"}
              segments={[
                { value: parseFloat(amount), color: colors.accent },
                { value: result.totalInterest, color: TONES.amber + "55" },
              ]}
            />
            <Legend
              items={[
                { color: colors.accent, text: `${pt.principalDebt}: ${formatMoney(parseFloat(amount))} AZN` },
                { color: TONES.amber, text: `${pt.interest}: ${formatMoney(result.totalInterest)} AZN` },
              ]}
            />
          </View>

          {/* Early repayment scenarios */}
          <TonePanel tone="green" title={`⚡ ${pt.scenariosTitle}`}>
            <SectionHeading>{pt.scenarioA}</SectionHeading>
            <Paragraph>{pt.scenarioADesc}</Paragraph>
            <InputField
              label={pt.extraMonthlyLabel}
              value={extraMonthly}
              onChangeText={setExtraMonthly}
              placeholder="100"
              keyboardType="decimal-pad"
            />
            {scenarioA && (
              <>
                <ToneGrid>
                  <ToneCard label={pt.newTerm} value={ym(scenarioA.newMonths)} />
                  <ToneCard label={pt.timeSaved} value={`−${ym(scenarioA.monthsSaved)}`} tone="green" />
                  <ToneCard
                    label={pt.interestSaved}
                    value={`−${formatMoney(scenarioA.interestSaved)} AZN`}
                    tone="green"
                  />
                </ToneGrid>
                <DataTable
                  headers={["", pt.term, pt.totalInterestPaid, pt.totalPayment]}
                  columnWidths={[120, 90, 120, 120]}
                  rows={[
                    [pt.original, `${months} ${pt.month}`, formatMoney(result.totalInterest), formatMoney(result.totalPayment)],
                    [
                      pt.withExtra,
                      `${scenarioA.newMonths} ${pt.month}`,
                      formatMoney(scenarioA.totalInterestNew),
                      formatMoney(parseFloat(amount) + scenarioA.totalInterestNew),
                    ],
                  ]}
                  highlightRows={[1]}
                />
              </>
            )}

            <SectionHeading>{pt.scenarioB}</SectionHeading>
            <Paragraph>{pt.scenarioBDesc}</Paragraph>
            <InputField
              label={pt.lumpSumLabel}
              value={lumpSum}
              onChangeText={setLumpSum}
              placeholder="5000"
              keyboardType="decimal-pad"
            />
            {scenarioB && (
              <ToneGrid>
                <ToneCard label={pt.newMonthlyPayment} value={`${formatMoney(scenarioB.newPayment)} AZN`} />
                <ToneCard label={pt.monthlySaving} value={`−${formatMoney(scenarioB.saving)} AZN`} tone="green" />
                <ToneCard label={pt.loanAmount} value={`${formatMoney(scenarioB.newAmount)} AZN`} />
              </ToneGrid>
            )}
          </TonePanel>

          {/* Amortization Table */}
          <DataTable
            title={`📋 ${pt.amortizationTable}`}
            headers={[pt.monthCol, pt.paymentCol, pt.principalCol, pt.interestCol, pt.remainingCol]}
            columnWidths={[50, 100, 100, 100, 110]}
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
        </View>
      ) : (
        <EmptyState icon="🏦" text={pt.emptyStateText} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["mortgage", "car-loan", "deposit", "salary"]} />
    </View>
  );
}
