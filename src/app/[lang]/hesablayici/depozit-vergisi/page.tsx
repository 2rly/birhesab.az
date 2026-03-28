"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

type Currency = "AZN" | "USD";

const TAX_RATE = 0.10;
const MONTHLY_EXEMPTION = 200;

const pageTranslations = {
  az: {
    title: "Depozit vergisi (ÖMV) hesablayıcısı",
    description: "Depozit faiz gəlirindən tutulan vergini hesablayın — V.M. 102.1.22 güzəştləri ilə.",
    breadcrumbCategory: "Maliyyə",
    breadcrumbTitle: "Depozit vergisi hesablayıcısı",
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
    law102_1_22_3_desc: "Yerli bank və xarici bankın AR-dakı filialı tərəfindən fiziki şəxslərin hər bir bankda milli valyutada olan depozitlər üzrə hesablanan aylıq faiz gəlirlərinin 200₼-dək hissəsi gəlir vergisindən azaddır.",
    law102_1_22_4_title: "V.M. 102.1.22-4",
    law102_1_22_4_desc: "Milli valyutada olan depozit 18 ay və daha artıq müddətə yerləşdirildikdə və depozitin məbləği 18 aydan tez olmadan ödənildikdə, hesablanmış faiz gəlirlərinin tam hissəsi 3 il müddətinə vergidən azad edilir.",
    law123_title: "V.M. 123",
    law123_desc: "Fiziki şəxslərin əmanətləri üzrə faiz gəlirləri kapital gəlirləri olub, faiz gəlirlərinin milli və ya xarici valyutada olmasından asılı olmayaraq, banklar tərəfindən ödəmə mənbəyində 10% dərəcə ilə vergi tutulur.",
    emptyStateText: "Nəticəni görmək üçün məbləğ, faiz və müddət daxil edin.",
  },
  en: {
    title: "Deposit tax (WHT) calculator",
    description: "Calculate tax on deposit interest income — with Tax Code 102.1.22 exemptions.",
    breadcrumbCategory: "Finance",
    breadcrumbTitle: "Deposit tax calculator",
    formulaTitle: "How is tax on deposit interest calculated?",
    formulaContent: `According to Article 123 of the Tax Code, interest income from bank deposits of individuals is considered capital income and is taxed at source by banks at a rate of 10%.

T.C. 102.1.22-3 — Monthly 200 AZN exemption:
• For deposits in national currency at each bank, up to 200 AZN of monthly interest income is tax-exempt
• Tax (10%) is applied only on the amount exceeding 200 AZN
• No term requirement, applies separately at each bank

T.C. 102.1.22-4 — 18-month rule:
• AZN deposit placed for ≥18 months and not withdrawn before 18 months — all interest income is 100% tax-exempt
• Effective for 3 years from 2024
• If withdrawn early, T.C. 102.1.22-3 (200 AZN exemption) applies

Foreign currency (USD/EUR):
• No exemptions — 10% tax on all interest income
• 18-month rule applies only to national currency`,
    currencyAZN: "Manat (AZN)",
    currencyUSD: "Foreign currency (USD/EUR)",
    depositAmount: "Deposit amount",
    annualRate: "Annual interest rate (%)",
    termMonths: "Term (months)",
    monthLabel: "mo",
    earlyWithdrawalLabel: "I will withdraw the deposit before 18 months",
    earlyWithdrawalDesc: "Instead of 100% tax-free exemption, monthly 200 AZN exemption will apply",
    foreignNoExemption: "Foreign currency — no exemptions",
    foreignNoExemptionDesc: "10% WHT is applied on all interest income. The 18-month rule applies only to national currency.",
    rule18MonthTitle: "T.C. 102.1.22-4: 100% tax-exempt",
    rule18MonthDesc: "AZN deposit, term {m} months (≥18 months), to be withdrawn on time — no tax will be deducted.",
    rule200Title: "T.C. 102.1.22-3: Monthly 200 AZN exemption",
    rule200Desc: "Up to 200 AZN of monthly interest income is tax-exempt. 10% tax is applied on the amount exceeding 200 AZN.",
    totalInterest: "Total interest income",
    taxDeducted: "Tax deducted",
    taxLabel: "Tax",
    taxFree: "100% exempt",
    netIncome: "Net income",
    effectiveTaxRate: "Effective tax rate",
    fromNominal: "from nominal 10%",
    monthlyCalcTitle: "Monthly tax calculation",
    monthlyInterest: "Monthly interest income",
    exemptPart: "Tax-exempt portion (exemption)",
    taxablePart: "Taxable portion",
    monthlyTax: "Monthly tax (10%)",
    monthlyNetReceive: "Monthly net received",
    totalCalcTitle: "Total calculation ({m} months)",
    totalInterestLabel: "Total interest income",
    totalExemptPart: "Tax-exempt portion",
    totalTaxablePart: "Taxable amount",
    totalTaxLabel: "Total tax",
    totalNetInterest: "Net interest income",
    calcStepsTitle: "Calculation steps (T.C. 102.1.22-3)",
    step1: "1. Monthly interest income:",
    step2: "2. Exemption deducted (monthly 200 AZN):",
    step3: "3. Monthly tax (10%):",
    step4: "4. Monthly net received:",
    step5: "5. Total tax ({m} months):",
    legislationTitle: "Legal basis",
    law102_1_22_3_title: "T.C. 102.1.22-3",
    law102_1_22_3_desc: "Up to 200 AZN of monthly interest income calculated on deposits in national currency of individuals at each bank by local banks and branches of foreign banks in Azerbaijan is exempt from income tax.",
    law102_1_22_4_title: "T.C. 102.1.22-4",
    law102_1_22_4_desc: "When a deposit in national currency is placed for 18 months or more and the deposit amount is paid no earlier than 18 months, the full amount of accrued interest income is exempt from tax for a period of 3 years.",
    law123_title: "T.C. 123",
    law123_desc: "Interest income from deposits of individuals is considered capital income and is taxed at source by banks at a rate of 10%, regardless of whether the interest income is in national or foreign currency.",
    emptyStateText: "Enter amount, interest rate and term to see the result.",
  },
  ru: {
    title: "Калькулятор налога на депозит (НУИ)",
    description: "Рассчитайте налог на процентный доход от депозита — с учетом льгот НК 102.1.22.",
    breadcrumbCategory: "Финансы",
    breadcrumbTitle: "Калькулятор налога на депозит",
    formulaTitle: "Как рассчитывается налог на процентный доход от депозита?",
    formulaContent: `Согласно статье 123 Налогового кодекса, процентные доходы физических лиц по банковским вкладам считаются доходами от капитала и облагаются налогом у источника выплаты банками по ставке 10%.

НК 102.1.22-3 — Ежемесячная льгота 200 AZN:
• По вкладам в национальной валюте в каждом банке до 200 AZN ежемесячного процентного дохода освобождается от налога
• Налог (10%) применяется только к сумме, превышающей 200 AZN
• Требование по сроку отсутствует, применяется отдельно в каждом банке

НК 102.1.22-4 — Правило 18 месяцев:
• Депозит в AZN размещён на срок ≥18 месяцев и не снят ранее 18 месяцев — весь процентный доход на 100% освобождён от налога
• Действует 3 года с 2024 года
• При досрочном снятии применяется НК 102.1.22-3 (льгота 200 AZN)

Иностранная валюта (USD/EUR):
• Никаких льгот — 10% налог на весь процентный доход
• Правило 18 месяцев распространяется только на национальную валюту`,
    currencyAZN: "Манат (AZN)",
    currencyUSD: "Иностранная валюта (USD/EUR)",
    depositAmount: "Сумма депозита",
    annualRate: "Годовая процентная ставка (%)",
    termMonths: "Срок (месяцы)",
    monthLabel: "мес",
    earlyWithdrawalLabel: "Я сниму депозит до 18 месяцев",
    earlyWithdrawalDesc: "Вместо 100% налоговой льготы будет применяться ежемесячная льгота 200 AZN",
    foreignNoExemption: "Иностранная валюта — льгот нет",
    foreignNoExemptionDesc: "С всего процентного дохода удерживается 10% НУИ. Правило 18 месяцев распространяется только на национальную валюту.",
    rule18MonthTitle: "НК 102.1.22-4: 100% освобождение от налога",
    rule18MonthDesc: "Депозит в AZN, срок {m} мес. (≥18 мес.), будет снят вовремя — налог не удерживается.",
    rule200Title: "НК 102.1.22-3: Ежемесячная льгота 200 AZN",
    rule200Desc: "До 200 AZN ежемесячного процентного дохода освобождается от налога. С суммы свыше 200 AZN удерживается 10% налог.",
    totalInterest: "Общий процентный доход",
    taxDeducted: "Удержанный налог",
    taxLabel: "Налог",
    taxFree: "100% освобождён",
    netIncome: "Чистый доход",
    effectiveTaxRate: "Эффективная налоговая ставка",
    fromNominal: "от номинальных 10%",
    monthlyCalcTitle: "Ежемесячный расчёт налога",
    monthlyInterest: "Ежемесячный процентный доход",
    exemptPart: "Освобождённая часть (льгота)",
    taxablePart: "Налогооблагаемая часть",
    monthlyTax: "Ежемесячный налог (10%)",
    monthlyNetReceive: "Ежемесячно на руки",
    totalCalcTitle: "Общий расчёт ({m} мес.)",
    totalInterestLabel: "Общий процентный доход",
    totalExemptPart: "Освобождённая часть",
    totalTaxablePart: "Налогооблагаемая сумма",
    totalTaxLabel: "Общий налог",
    totalNetInterest: "Чистый процентный доход",
    calcStepsTitle: "Шаги расчёта (НК 102.1.22-3)",
    step1: "1. Ежемесячный процентный доход:",
    step2: "2. Вычитается льгота (ежемесячно 200 AZN):",
    step3: "3. Ежемесячный налог (10%):",
    step4: "4. Ежемесячно на руки:",
    step5: "5. Общий налог ({m} мес.):",
    legislationTitle: "Законодательная основа",
    law102_1_22_3_title: "НК 102.1.22-3",
    law102_1_22_3_desc: "До 200 AZN ежемесячного процентного дохода, начисленного по депозитам физических лиц в национальной валюте в каждом банке местными банками и филиалами иностранных банков в АР, освобождается от подоходного налога.",
    law102_1_22_4_title: "НК 102.1.22-4",
    law102_1_22_4_desc: "Когда депозит в национальной валюте размещён на срок 18 месяцев и более, и сумма депозита выплачивается не ранее 18 месяцев, полная сумма начисленных процентных доходов освобождается от налога на срок 3 года.",
    law123_title: "НК 123",
    law123_desc: "Процентные доходы физических лиц по вкладам являются доходами от капитала и облагаются налогом у источника выплаты банками по ставке 10%, независимо от того, в национальной или иностранной валюте выражен процентный доход.",
    emptyStateText: "Введите сумму, процентную ставку и срок, чтобы увидеть результат.",
  },
};

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DepositTaxCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

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
  }, [amount, rate, months, currency, is18MonthRule, m]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.breadcrumbTitle },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["deposit", "dividend-tax", "salary", "rental-income-tax"]}
    >
      {/* Valyuta */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setCurrency("AZN")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            currency === "AZN" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.currencyAZN}
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            currency === "USD" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.currencyUSD}
        </button>
      </div>

      {/* Daxiletmə */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.depositAmount} ({currency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="30000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[10000, 30000, 50000, 100000, 180000].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="px-2 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {(v / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.annualRate}
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="10"
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.termMonths}
          </label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            placeholder="12"
            min="1"
            max="120"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[6, 12, 18, 24, 36].map((v) => (
              <button
                key={v}
                onClick={() => setMonths(String(v))}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  months === String(v)
                    ? "border-primary bg-primary-light text-primary font-medium"
                    : "border-border bg-white text-muted hover:border-primary/30"
                }`}
              >
                {v} {pt.monthLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 18 ay seçimi */}
      {currency === "AZN" && m >= 18 && (
        <div className="mb-6">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/30 transition-all">
            <input
              type="checkbox"
              checked={earlyWithdrawal}
              onChange={(e) => setEarlyWithdrawal(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{pt.earlyWithdrawalLabel}</p>
              <p className="text-[11px] text-muted">{pt.earlyWithdrawalDesc}</p>
            </div>
          </label>
        </div>
      )}

      {/* Vergi qaydası banner */}
      <div className={`mb-8 rounded-xl border p-4 ${
        currency === "USD"
          ? "bg-red-50 border-red-200"
          : is18MonthRule
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
      }`}>
        {currency === "USD" ? (
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">{pt.foreignNoExemption}</p>
            <p>{pt.foreignNoExemptionDesc}</p>
          </div>
        ) : is18MonthRule ? (
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">{pt.rule18MonthTitle}</p>
            <p>{pt.rule18MonthDesc.replace("{m}", String(m))}</p>
          </div>
        ) : (
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">{pt.rule200Title}</p>
            <p>{pt.rule200Desc}</p>
          </div>
        )}
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-green-100 mb-1">{pt.totalInterest}</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalInterest)} {currency}</p>
            </div>
            {result.totalTax > 0 ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-center">
                <p className="text-sm text-red-600 mb-1">{pt.taxDeducted}</p>
                <p className="text-2xl font-bold text-red-700">-{formatMoney(result.totalTax)} {currency}</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
                <p className="text-sm text-green-600 mb-1">{pt.taxLabel}</p>
                <p className="text-2xl font-bold text-green-700">0,00 {currency}</p>
                <p className="text-xs text-green-600">{pt.taxFree}</p>
              </div>
            )}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netIncome}</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalNetInterest)} {currency}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
              <p className="text-sm text-muted mb-1">{pt.effectiveTaxRate}</p>
              <p className="text-2xl font-bold text-foreground">{result.effectiveTaxRate.toFixed(1)}%</p>
              <p className="text-xs text-muted">{pt.fromNominal}</p>
            </div>
          </div>

          {/* Aylıq hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.monthlyCalcTitle}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.monthlyInterest}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.monthlyInterest)} {currency}</span>
              </div>
              {currency === "AZN" && !is18MonthRule && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.exemptPart}</span>
                  <span className="text-sm font-medium text-green-600">-{formatMoney(result.monthlyExempt)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.taxablePart}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.monthlyTaxable)} {currency}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.monthlyTax}</span>
                <span className="text-sm font-bold text-red-700">
                  {result.monthlyTax > 0 ? `-${formatMoney(result.monthlyTax)}` : "0,00"} {currency}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.monthlyNetReceive}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.monthlyNet)} {currency}</span>
              </div>
            </div>
          </div>

          {/* İllik / ümumi hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📅</span>
                {pt.totalCalcTitle.replace("{m}", String(m))}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.totalInterestLabel}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.totalInterest)} {currency}</span>
              </div>
              {result.totalExempt > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.totalExemptPart}</span>
                  <span className="text-sm font-medium text-green-600">{formatMoney(result.totalExempt)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.totalTaxablePart}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.totalTaxable)} {currency}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.totalTaxLabel}</span>
                <span className="text-sm font-bold text-red-700">
                  {result.totalTax > 0 ? `-${formatMoney(result.totalTax)}` : "0,00"} {currency}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.totalNetInterest}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.totalNetInterest)} {currency}</span>
              </div>
            </div>
          </div>

          {/* Hesablama addımları */}
          {currency === "AZN" && !is18MonthRule && result.monthlyTax > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>🔢</span>
                  {pt.calcStepsTitle}
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">{pt.step1}</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {formatMoney(parseFloat(amount))} × {rate}% ÷ 12 = {formatMoney(result.monthlyInterest)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">{pt.step2}</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {formatMoney(result.monthlyInterest)} − 200,00 = {formatMoney(result.monthlyTaxable)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">{pt.step3}</p>
                  <p className="text-sm font-medium text-red-600 mt-1">
                    {formatMoney(result.monthlyTaxable)} × 10% = {formatMoney(result.monthlyTax)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">{pt.step4}</p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatMoney(result.monthlyInterest)} − {formatMoney(result.monthlyTax)} = {formatMoney(result.monthlyNet)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3 bg-gray-50">
                  <p className="text-sm text-muted">{pt.step5.replace("{m}", String(m))}</p>
                  <p className="text-sm font-medium text-red-600 mt-1">
                    {formatMoney(result.monthlyTax)} × {m} {pt.monthLabel} = {formatMoney(result.totalTax)} {currency}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Qanunvericilik */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.legislationTitle}
            </h4>
            <div className="space-y-3 text-sm text-muted">
              <div>
                <p className="font-medium text-foreground">{pt.law102_1_22_3_title}</p>
                <p>{pt.law102_1_22_3_desc}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.law102_1_22_4_title}</p>
                <p>{pt.law102_1_22_4_desc}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.law123_title}</p>
                <p>{pt.law123_desc}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🧾</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
