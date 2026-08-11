"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

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

    rows.push({
      month: i,
      payment: monthlyPayment,
      principal,
      interest,
      balance,
    });
  }

  return rows;
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pageTranslations = {
  az: {
    title: "Kredit hesablayıcısı",
    description: "Kredit məbləği, faiz dərəcəsi və müddəti daxil edin — aylıq ödənişi və annuitet cədvəlini görün.",
    breadcrumbCategory: "Maliyyə",
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
    // Erkən ödəmə
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
    comparison: "Müqayisə",
    original: "Standart",
    withExtra: "Əlavə ödənişlə",
    totalInterestPaid: "Ümumi faiz",
  },
  en: {
    title: "Loan Calculator",
    description: "Enter loan amount, interest rate and term — see monthly payment and amortization schedule.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How is annuity payment calculated?",
    formulaContent: `Monthly payment = M × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

M — loan amount
r — monthly interest rate (annual rate / 12 / 100)
n — loan term (months)

In the annuity system, the same amount is paid every month.
In the first months, the interest portion is high, the principal is low.
In later months, the opposite — the principal portion increases, interest decreases.`,
    loanAmount: "Loan amount (AZN)",
    annualRate: "Annual interest rate (%)",
    term: "Term (months)",
    monthlyPayment: "Monthly payment",
    perMonth: "AZN / month",
    totalPayment: "Total payment",
    overpayment: "Overpayment (interest)",
    principalDebt: "Principal",
    interest: "Interest",
    amortizationTable: "Amortization schedule",
    monthCol: "Month",
    paymentCol: "Payment",
    principalCol: "Principal",
    interestCol: "Interest",
    remainingCol: "Remaining balance",
    collapse: "Collapse",
    showAll: "Show all {count} months",
    emptyStateText: "Enter amount, rate and term to see the result.",
    scenariosTitle: "Early repayment scenarios",
    scenarioA: "Scenario A: Term reduction",
    scenarioADesc: "If you pay extra each month, how much sooner will the loan end?",
    extraMonthlyLabel: "Extra monthly payment (AZN)",
    newTerm: "New term",
    timeSaved: "Time saved",
    interestSaved: "Interest saved",
    scenarioB: "Scenario B: Lump sum payment",
    scenarioBDesc: "If you make a lump sum payment today, what will the new monthly payment be?",
    lumpSumLabel: "Lump sum payment (AZN)",
    newMonthlyPayment: "New monthly payment",
    monthlySaving: "Monthly saving",
    year: "year",
    month: "mo",
    comparison: "Comparison",
    original: "Standard",
    withExtra: "With extra payment",
    totalInterestPaid: "Total interest",
  },
  ru: {
    title: "Кредитный калькулятор",
    description: "Введите сумму кредита, процентную ставку и срок — увидите ежемесячный платёж и график аннуитета.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как рассчитывается аннуитетный платёж?",
    formulaContent: `Ежемесячный платёж = M × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

M — сумма кредита
r — ежемесячная процентная ставка (годовая ставка / 12 / 100)
n — срок кредита (месяцев)

В аннуитетной системе каждый месяц выплачивается одинаковая сумма.
В первые месяцы доля процентов высока, доля основного долга мала.
В последующие месяцы наоборот — доля основного долга растёт, проценты уменьшаются.`,
    loanAmount: "Сумма кредита (AZN)",
    annualRate: "Годовая процентная ставка (%)",
    term: "Срок (месяцев)",
    monthlyPayment: "Ежемесячный платёж",
    perMonth: "AZN / мес",
    totalPayment: "Общая выплата",
    overpayment: "Переплата (проценты)",
    principalDebt: "Основной долг",
    interest: "Проценты",
    amortizationTable: "График аннуитета",
    monthCol: "Месяц",
    paymentCol: "Платёж",
    principalCol: "Основной долг",
    interestCol: "Проценты",
    remainingCol: "Остаток долга",
    collapse: "Свернуть",
    showAll: "Показать все {count} месяцев",
    emptyStateText: "Введите сумму, ставку и срок для расчёта.",
    scenariosTitle: "Сценарии досрочного погашения",
    scenarioA: "Сценарий A: Сокращение срока",
    scenarioADesc: "Если платить больше каждый месяц, на сколько быстрее закроется кредит?",
    extraMonthlyLabel: "Ежемесячная доплата (AZN)",
    newTerm: "Новый срок",
    timeSaved: "Сэкономлено времени",
    interestSaved: "Сэкономлено на процентах",
    scenarioB: "Сценарий Б: Разовый платёж",
    scenarioBDesc: "Если сделать разовый платёж, какой будет новый ежемесячный платёж?",
    lumpSumLabel: "Разовый платёж (AZN)",
    newMonthlyPayment: "Новый ежемесячный платёж",
    monthlySaving: "Ежемесячная экономия",
    year: "г",
    month: "мес",
    comparison: "Сравнение",
    original: "Стандарт",
    withExtra: "С доплатой",
    totalInterestPaid: "Всего процентов",
  },
};

export default function LoanCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

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

  const visibleRows = result
    ? showFullTable
      ? result.table
      : result.table.slice(0, 12)
    : [];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["mortgage", "car-loan", "deposit", "salary"]}
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 {pt.loanAmount}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📊 {pt.annualRate}
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="12"
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 {pt.term}
          </label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            placeholder="24"
            min="1"
            max="360"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.monthlyPayment}</p>
              <p className="text-3xl font-bold">{formatMoney(result.payment)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.totalPayment}</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.totalPayment)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.overpayment}</p>
              <p className="text-2xl font-bold text-amber-700">{formatMoney(result.totalInterest)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">{pt.principalDebt}</span>
              <span className="text-muted">{pt.interest}</span>
            </div>
            <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(parseFloat(amount) / result.totalPayment) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">{formatMoney(parseFloat(amount))} AZN</span>
              <span className="font-medium text-amber-700">{formatMoney(result.totalInterest)} AZN</span>
            </div>
          </div>

          {/* Early repayment scenarios */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 space-y-5">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span>⚡</span>
              {pt.scenariosTitle}
            </h3>

            {/* Scenario A: Extra monthly */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">{pt.scenarioA}</p>
              <p className="text-xs text-muted mb-3">{pt.scenarioADesc}</p>
              <input
                type="number"
                value={extraMonthly}
                onChange={(e) => setExtraMonthly(e.target.value)}
                placeholder="100"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
              />
              {scenarioA && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
                    <p className="text-[10px] text-muted">{pt.newTerm}</p>
                    <p className="text-lg font-bold text-foreground">
                      {Math.floor(scenarioA.newMonths / 12) > 0 && (
                        <>{Math.floor(scenarioA.newMonths / 12)} {pt.year} </>
                      )}
                      {scenarioA.newMonths % 12} {pt.month}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
                    <p className="text-[10px] text-muted">{pt.timeSaved}</p>
                    <p className="text-lg font-bold text-green-700">
                      −{Math.floor(scenarioA.monthsSaved / 12) > 0 && (
                        <>{Math.floor(scenarioA.monthsSaved / 12)} {pt.year} </>
                      )}
                      {scenarioA.monthsSaved % 12} {pt.month}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
                    <p className="text-[10px] text-muted">{pt.interestSaved}</p>
                    <p className="text-lg font-bold text-green-700">−{formatMoney(scenarioA.interestSaved)} AZN</p>
                  </div>
                </div>
              )}
              {scenarioA && (
                <div className="mt-3 overflow-hidden rounded-lg border border-green-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white text-muted">
                        <th className="px-3 py-2 text-left"></th>
                        <th className="px-3 py-2 text-right">{pt.term}</th>
                        <th className="px-3 py-2 text-right">{pt.totalInterestPaid}</th>
                        <th className="px-3 py-2 text-right">{pt.totalPayment}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-green-100">
                        <td className="px-3 py-2 font-medium text-muted">{pt.original}</td>
                        <td className="px-3 py-2 text-right">{months} {pt.month}</td>
                        <td className="px-3 py-2 text-right text-amber-600">{formatMoney(result.totalInterest)}</td>
                        <td className="px-3 py-2 text-right">{formatMoney(result.totalPayment)}</td>
                      </tr>
                      <tr className="border-t border-green-100 bg-green-50">
                        <td className="px-3 py-2 font-medium text-green-700">{pt.withExtra}</td>
                        <td className="px-3 py-2 text-right text-green-700 font-bold">{scenarioA.newMonths} {pt.month}</td>
                        <td className="px-3 py-2 text-right text-green-700 font-bold">{formatMoney(scenarioA.totalInterestNew)}</td>
                        <td className="px-3 py-2 text-right text-green-700 font-bold">{formatMoney(parseFloat(amount) + scenarioA.totalInterestNew)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <hr className="border-green-200" />

            {/* Scenario B: Lump sum */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">{pt.scenarioB}</p>
              <p className="text-xs text-muted mb-3">{pt.scenarioBDesc}</p>
              <input
                type="number"
                value={lumpSum}
                onChange={(e) => setLumpSum(e.target.value)}
                placeholder="5000"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
              />
              {scenarioB && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
                    <p className="text-[10px] text-muted">{pt.newMonthlyPayment}</p>
                    <p className="text-lg font-bold text-foreground">{formatMoney(scenarioB.newPayment)} AZN</p>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
                    <p className="text-[10px] text-muted">{pt.monthlySaving}</p>
                    <p className="text-lg font-bold text-green-700">−{formatMoney(scenarioB.saving)} AZN</p>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-3 text-center">
                    <p className="text-[10px] text-muted">{pt.loanAmount}</p>
                    <p className="text-lg font-bold text-foreground">{formatMoney(scenarioB.newAmount)} AZN</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amortization Table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.amortizationTable}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">{pt.monthCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.paymentCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.principalCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.interestCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.remainingCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-t border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(row.payment)}</td>
                      <td className="px-4 py-3 text-right text-primary">{formatMoney(row.principal)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{formatMoney(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.table.length > 12 && (
              <button
                onClick={() => setShowFullTable(!showFullTable)}
                className="mt-3 text-sm text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1 mx-auto"
              >
                {showFullTable ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {pt.collapse}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {pt.showAll.replace("{count}", String(result.table.length))}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏦</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
