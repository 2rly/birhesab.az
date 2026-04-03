"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import { insuranceRates, INSURANCE_RATE_OPTIONS } from "@/data/insuranceRates";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pageTranslations = {
  az: {
    title: "İpoteka hesablayıcısı",
    description: "Əmlakın qiyməti, ilkin ödəniş, faiz və müddəti daxil edin — aylıq ipoteka ödənişini hesablayın.",
    breadcrumbCategory: "Maliyyə",
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
    // Scenario section
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
    periodCol: "Dövr",
    newPaymentCol: "Yeni aylıq ödəniş",
    remainingTermCol: "Qalan müddət (ay)",
    remainingBalanceCol: "Qalan borc",
    totalInterestC: "Ümumi faiz ödənişi",
    totalSavedC: "Qənaət (standart ilə müqayisə)",
    year: "il",
    month: "ay",
    // Insurance section
    insuranceTitle: "Həyat sığortası (ipoteka)",
    insuranceDesc: "İpoteka zamanı həyat sığortası məcburidir. Aylıq tarif müştərinin yaşına və kredit müddətinə görə müəyyən edilir.",
    insuranceAge: "Müştərinin yaşı",
    insuranceLoanRate: "Kredit faiz dərəcəsi",
    insuranceMonthlyRate: "Aylıq sığorta faizi",
    insuranceMonthlyPayment: "Aylıq sığorta ödənişi",
    totalWithInsurance: "Aylıq ödəniş + sığorta",
    insuranceTotal: "Ümumi sığorta xərci (bütün müddət)",
    selectAge: "Yaş seçin...",
  },
  en: {
    title: "Mortgage Calculator",
    description: "Enter property price, down payment, interest rate and term — calculate monthly mortgage payment.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How is mortgage payment calculated?",
    formulaContent: `Loan amount = Property price − Down payment

Monthly payment = L × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

L — loan amount
r — monthly interest rate (annual rate ÷ 12 ÷ 100)
n — term (months)

Mortgages in Azerbaijan:
• Down payment: typically 20-30%
• Term: 1-30 years
• Interest rate: 4-8% (subsidized), 10-16% (standard)`,
    propertyPrice: "Property price (AZN)",
    downPayment: "Down payment",
    annualRate: "Annual interest rate (%)",
    termYears: "Term (years)",
    monthlyPayment: "Monthly payment",
    perMonth: "AZN / month",
    loanAmount: "Loan amount",
    overpayment: "Overpayment (interest)",
    totalSummary: "Total summary",
    propertyPriceLabel: "Property price",
    downPaymentLabel: "Down payment",
    loanAmountLabel: "Loan amount",
    termLabel: "Term",
    yearSuffix: "years",
    monthSuffix: "months",
    totalInterestPayment: "Total interest payment",
    totalPaymentAll: "Total payment (down + loan + interest)",
    principalDebt: "Principal",
    interest: "Interest",
    yearlySummary: "Yearly summary",
    yearCol: "Year",
    yearSuffixOrd: "",
    principalCol: "Principal",
    interestCol: "Interest",
    remainingCol: "Remaining balance",
    monthlyAmortization: "Monthly amortization schedule",
    monthCol: "Month",
    paymentCol: "Payment",
    collapse: "Collapse",
    showAll: "Show all {count} months",
    mortgageType: "Mortgage type",
    internalMortgage: "Bank mortgage",
    internalMortgageDesc: "With the bank's own interest rate",
    stateMortgage: "State mortgage",
    stateMortgageDesc: "Subsidized government program (3.7%, 4%, 7%, 8%)",
    emptyStateText: "Enter property price, rate and term to see the result.",
    // Scenario section
    scenariosTitle: "Early repayment scenarios",
    scenarioA: "Scenario A: Term reduction",
    scenarioADesc: "If you pay extra each month, how much sooner will the loan end?",
    extraMonthlyLabel: "Extra monthly payment (AZN)",
    newTerm: "New term",
    timeSaved: "Time saved",
    interestSaved: "Interest saved",
    scenarioB: "Scenario B: Payment reduction",
    scenarioBDesc: "If you make a lump sum payment today, what will the new monthly payment be?",
    lumpSumLabel: "Lump sum payment (AZN)",
    newMonthlyPayment: "New monthly payment",
    monthlySaving: "Monthly saving",
    scenarioC: "Scenario C: Dynamic reduction strategy",
    scenarioCDesc: "If you pay extra monthly and request recalculation every 12 months:",
    recalcInterval: "Recalculation interval",
    every12Months: "Every 12 months",
    everyMonth: "Every month",
    periodCol: "Period",
    newPaymentCol: "New monthly payment",
    remainingTermCol: "Remaining term (months)",
    remainingBalanceCol: "Remaining balance",
    totalInterestC: "Total interest paid",
    totalSavedC: "Saved (vs standard)",
    year: "year",
    month: "month",
    // Insurance section
    insuranceTitle: "Life Insurance (mortgage)",
    insuranceDesc: "Life insurance is mandatory for mortgages. Monthly rate depends on the client's age and loan term.",
    insuranceAge: "Client's age",
    insuranceLoanRate: "Loan interest rate",
    insuranceMonthlyRate: "Monthly insurance rate",
    insuranceMonthlyPayment: "Monthly insurance payment",
    totalWithInsurance: "Monthly payment + insurance",
    insuranceTotal: "Total insurance cost (full term)",
    selectAge: "Select age...",
  },
  ru: {
    title: "Ипотечный калькулятор",
    description: "Введите стоимость недвижимости, первоначальный взнос, ставку и срок — рассчитайте ежемесячный платёж.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как рассчитывается ипотечный платёж?",
    formulaContent: `Сумма кредита = Стоимость недвижимости − Первоначальный взнос

Ежемесячный платёж = К × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

К — сумма кредита
r — ежемесячная процентная ставка (годовая ставка ÷ 12 ÷ 100)
n — срок (месяцев)

Ипотека в Азербайджане:
• Первоначальный взнос: обычно 20-30%
• Срок: 1-30 лет
• Процентная ставка: 4-8% (льготная), 10-16% (стандартная)`,
    propertyPrice: "Стоимость недвижимости (AZN)",
    downPayment: "Первоначальный взнос",
    annualRate: "Годовая процентная ставка (%)",
    termYears: "Срок (лет)",
    monthlyPayment: "Ежемесячный платёж",
    perMonth: "AZN / мес",
    loanAmount: "Сумма кредита",
    overpayment: "Переплата (проценты)",
    totalSummary: "Общий расчёт",
    propertyPriceLabel: "Стоимость недвижимости",
    downPaymentLabel: "Первоначальный взнос",
    loanAmountLabel: "Сумма кредита",
    termLabel: "Срок",
    yearSuffix: "лет",
    monthSuffix: "мес",
    totalInterestPayment: "Общая выплата процентов",
    totalPaymentAll: "Общая выплата (взнос + кредит + проценты)",
    principalDebt: "Основной долг",
    interest: "Проценты",
    yearlySummary: "Годовая сводка",
    yearCol: "Год",
    yearSuffixOrd: "-й год",
    principalCol: "Основной долг",
    interestCol: "Проценты",
    remainingCol: "Остаток долга",
    monthlyAmortization: "Ежемесячный график аннуитета",
    monthCol: "Месяц",
    paymentCol: "Платёж",
    collapse: "Свернуть",
    showAll: "Показать все {count} месяцев",
    mortgageType: "Тип ипотеки",
    internalMortgage: "Банковская ипотека",
    internalMortgageDesc: "По ставке банка",
    stateMortgage: "Государственная ипотека",
    stateMortgageDesc: "Льготная госпрограмма (3,7%, 4%, 7%, 8%)",
    emptyStateText: "Введите стоимость, ставку и срок для расчёта.",
    // Scenario section
    scenariosTitle: "Сценарии досрочного погашения",
    scenarioA: "Сценарий A: Сокращение срока",
    scenarioADesc: "Если платить больше каждый месяц, на сколько раньше закроется кредит?",
    extraMonthlyLabel: "Ежемесячная доплата (AZN)",
    newTerm: "Новый срок",
    timeSaved: "Сэкономленное время",
    interestSaved: "Экономия на процентах",
    scenarioB: "Сценарий B: Снижение платежа",
    scenarioBDesc: "Если внести единовременный платёж, какой будет новый ежемесячный платёж?",
    lumpSumLabel: "Единовременный платёж (AZN)",
    newMonthlyPayment: "Новый ежемесячный платёж",
    monthlySaving: "Ежемесячная экономия",
    scenarioC: "Сценарий C: Динамическое снижение",
    scenarioCDesc: "Если платить больше каждый месяц и пересчитывать каждые 12 месяцев:",
    recalcInterval: "Интервал пересчёта",
    every12Months: "Каждые 12 месяцев",
    everyMonth: "Каждый месяц",
    periodCol: "Период",
    newPaymentCol: "Новый ежемесячный платёж",
    remainingTermCol: "Оставшийся срок (мес)",
    remainingBalanceCol: "Остаток долга",
    totalInterestC: "Итого выплачено процентов",
    totalSavedC: "Экономия (по сравнению со стандартом)",
    year: "год",
    month: "мес",
    // Insurance section
    insuranceTitle: "Страхование жизни (ипотека)",
    insuranceDesc: "Страхование жизни обязательно при ипотеке. Ежемесячный тариф зависит от возраста клиента и срока кредита.",
    insuranceAge: "Возраст клиента",
    insuranceLoanRate: "Процентная ставка кредита",
    insuranceMonthlyRate: "Ежемесячная ставка страхования",
    insuranceMonthlyPayment: "Ежемесячный страховой платёж",
    totalWithInsurance: "Ежемесячный платёж + страховка",
    insuranceTotal: "Общие затраты на страхование (весь срок)",
    selectAge: "Выберите возраст...",
  },
};

export default function MortgageCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [mortgageType, setMortgageType] = useState<"internal" | "state">("state");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [downPercent, setDownPercent] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

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
      setDownPayment(Math.round(price * pct / 100).toString());
    } else {
      setDownPayment("");
    }
  };

  const handlePropertyPriceChange = (value: string) => {
    setPropertyPrice(value);
    const price = parseFloat(value);
    const pct = parseFloat(downPercent);
    if (price > 0 && !isNaN(pct)) {
      setDownPayment(Math.round(price * pct / 100).toString());
    }
  };
  const [extraMonthly, setExtraMonthly] = useState("");
  const [lumpSum, setLumpSum] = useState("");
  const [recalcInterval, setRecalcInterval] = useState<12 | 1>(12);
  const [showFullTable, setShowFullTable] = useState(false);
  const [clientAge, setClientAge] = useState("");

  // For state mortgage, rate is synced with insurance rate key
  const insuranceRateKey = mortgageType === "state" ? rate : "7";

  const handleStateRate = (r: string) => {
    setRate(r);
  };

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

  // Property insurance: 0.2% of property value, 36-month cycle
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

  // Life insurance: based on age, term, and loan interest rate
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

    const monthlyRatePercent = ageRates[y - 1]; // index 0 = 1 year
    if (!monthlyRatePercent) return null;

    const monthlyPayment = result.loanAmount * (monthlyRatePercent / 100);
    const totalCost = monthlyPayment * result.months;

    return { monthlyRatePercent, monthlyPayment, totalCost };
  }, [result, clientAge, years, insuranceRateKey]);

  // Scenario A: Term reduction with extra monthly payment
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

  // Scenario B: Payment reduction with lump sum
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

    return {
      newPayment,
      saving: result.monthlyPayment - newPayment,
    };
  }, [result, lumpSum, rate]);

  // Scenario C: Dynamic reduction — extra monthly + periodic recalculation
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

    // Record initial state
    periods.push({
      period: "0",
      payment: currentPayment,
      remainingTerm: remainingMonths,
      balance: balance,
    });

    while (balance > 0.01 && monthCount < result.months * 2) {
      monthCount++;
      remainingMonths--;
      const interest = balance * monthlyRate;
      totalInterest += interest;
      const actualPayment = Math.min(currentPayment + extra, balance + interest);
      const principal = actualPayment - interest;
      balance = Math.max(0, balance - principal);

      // Recalculate at interval
      if (balance > 0.01 && monthCount % recalcInterval === 0 && remainingMonths > 0) {
        if (monthlyRate === 0) {
          currentPayment = balance / remainingMonths;
        } else {
          currentPayment =
            (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
            (Math.pow(1 + monthlyRate, remainingMonths) - 1);
        }
        periods.push({
          period: recalcInterval === 12
            ? `${monthCount / 12}`
            : `${monthCount}`,
          payment: currentPayment,
          remainingTerm: remainingMonths,
          balance: balance,
        });
      }
    }

    const savedInterest = result.totalInterest - totalInterest;

    return { periods, totalInterest, savedInterest, totalMonths: monthCount };
  }, [result, extraMonthly, rate, recalcInterval]);

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
      relatedIds={["loan", "property-tax", "salary", "deposit"]}
    >
      {/* Mortgage Type Tabs */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.mortgageType}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setMortgageType("internal"); setRate(""); }}
            className={`p-3 rounded-xl border text-left transition-all ${
              mortgageType === "internal"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">🏦 {pt.internalMortgage}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.internalMortgageDesc}</p>
          </button>
          <button
            onClick={() => { setMortgageType("state"); setRate("7"); }}
            className={`p-3 rounded-xl border text-left transition-all ${
              mortgageType === "state"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">🏛️ {pt.stateMortgage}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.stateMortgageDesc}</p>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🏠 {pt.propertyPrice}
          </label>
          <input
            type="number"
            value={propertyPrice}
            onChange={(e) => handlePropertyPriceChange(e.target.value)}
            placeholder="150000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 {pt.downPayment}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(e.target.value)}
                placeholder="30000"
                min="0"
                className="w-full px-4 py-3 pr-14 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">AZN</span>
            </div>
            <div className="w-24 relative">
              <input
                type="number"
                value={downPercent}
                onChange={(e) => handleDownPercentChange(e.target.value)}
                placeholder="20"
                min="0"
                max="100"
                step="1"
                className="w-full px-4 py-3 pr-8 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
            </div>
          </div>
        </div>

        {/* Interest Rate: manual for internal, buttons for state */}
        {mortgageType === "internal" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📊 {pt.annualRate}
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="8"
              min="0"
              step="0.1"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📊 {pt.annualRate}
            </label>
            <div className="flex gap-2">
              {INSURANCE_RATE_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => handleStateRate(r)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                    rate === r
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white hover:border-primary/30 text-foreground"
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 {pt.termYears}
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="15"
            min="1"
            max="30"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        {/* Age: only for state mortgage */}
        {mortgageType === "state" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              👤 {pt.insuranceAge}
            </label>
            <select
              value={clientAge}
              onChange={(e) => setClientAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            >
              <option value="">{pt.selectAge}</option>
              {Array.from({ length: 47 }, (_, i) => i + 18).map((age) => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.monthlyPayment}</p>
              <p className="text-3xl font-bold">{formatMoney(result.monthlyPayment)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.loanAmount}</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.loanAmount)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.overpayment}</p>
              <p className="text-2xl font-bold text-amber-700">{formatMoney(result.totalInterest)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
          </div>

          {/* Insurance Section — Əmlak sığortası */}
          {propertyInsurance && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-emerald-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                  <span>🛡️</span>
                  Əmlak sığortası
                </h3>
                <p className="text-xs text-emerald-600 mt-1">Tarif: əmlak dəyərinin 0.2%-i, hər 3 ildən bir yenilənir.</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                    <p className="text-xs text-emerald-600 mb-1">Sığorta haqqı (3 il)</p>
                    <p className="text-xl font-bold text-emerald-700">{formatMoney(propertyInsurance.premium)} AZN</p>
                    <p className="text-[11px] text-emerald-500 mt-1">Tarif: 0.2%</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                    <p className="text-xs text-blue-600 mb-1">{pt.totalWithInsurance}</p>
                    <p className="text-xl font-bold text-blue-700">{formatMoney(result.monthlyPayment + propertyInsurance.avgMonthly)} AZN</p>
                    <p className="text-[11px] text-blue-500 mt-1">~{formatMoney(propertyInsurance.avgMonthly)} AZN/ay</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                    <p className="text-xs text-muted mb-1">{pt.insuranceTotal}</p>
                    <p className="text-xl font-bold text-foreground">{formatMoney(propertyInsurance.totalInsurance)} AZN</p>
                    <p className="text-[11px] text-muted mt-1">{propertyInsurance.totalCycles} × {formatMoney(propertyInsurance.premium)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">36 aylıq dövr cədvəli</h4>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-3 py-2 font-medium text-muted">{pt.monthCol}</th>
                          <th className="px-3 py-2 font-medium text-muted text-right">{pt.paymentCol}</th>
                          <th className="px-3 py-2 font-medium text-muted">{pt.interest}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {propertyInsurance.schedule.filter(s => s.payment > 0 || s.month === 1 || s.month === 2 || s.month === 13 || s.month === 25).map((s) => (
                          <tr key={s.month} className={`border-t border-border ${s.type === "deposit" ? "bg-emerald-50" : s.type === "installment" ? "bg-blue-50/50" : ""}`}>
                            <td className="px-3 py-2 font-medium">{s.month}</td>
                            <td className="px-3 py-2 text-right font-medium">
                              {s.payment > 0 ? (
                                <span className={s.type === "deposit" ? "text-emerald-700" : "text-blue-700"}>
                                  {formatMoney(s.payment)} AZN
                                </span>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-muted">
                              {s.type === "deposit" && "Depozit"}
                              {s.type === "installment" && "Aylıq taksit (13-24)"}
                              {s.type === "none" && "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-muted mt-2">* Bu dövr hər 36 aydan bir təkrarlanır.</p>
                </div>
              </div>
            </div>
          )}

          {/* Life Insurance — only in state mortgage mode */}
          {mortgageType === "state" && lifeInsurance && (
            <div className="bg-white rounded-xl border border-violet-200 overflow-hidden">
              <div className="bg-violet-50 px-5 py-3 border-b border-violet-200">
                <h3 className="font-semibold text-violet-800 flex items-center gap-2">
                  <span>💜</span>
                  {pt.insuranceTitle}
                </h3>
                <p className="text-xs text-violet-600 mt-1">{pt.insuranceDesc}</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-violet-50 rounded-xl border border-violet-200 p-4 text-center">
                    <p className="text-xs text-violet-600 mb-1">{pt.insuranceMonthlyRate}</p>
                    <p className="text-xl font-bold text-violet-700">{lifeInsurance.monthlyRatePercent.toFixed(4)}%</p>
                    <p className="text-[11px] text-violet-500 mt-1">{clientAge} yaş, {years} il, {rate}%</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl border border-violet-200 p-4 text-center">
                    <p className="text-xs text-violet-600 mb-1">{pt.insuranceMonthlyPayment}</p>
                    <p className="text-xl font-bold text-violet-700">{formatMoney(lifeInsurance.monthlyPayment)} AZN</p>
                    <p className="text-[11px] text-violet-500 mt-1">{formatMoney(lifeInsurance.totalCost)} ÷ {result.months} ay</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                    <p className="text-xs text-blue-600 mb-1">{pt.totalWithInsurance}</p>
                    <p className="text-xl font-bold text-blue-700">{formatMoney(result.monthlyPayment + lifeInsurance.monthlyPayment + (propertyInsurance?.avgMonthly || 0))} AZN</p>
                    <p className="text-[11px] text-blue-500 mt-1">kredit + həyat + əmlak sığortası</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                    <p className="text-xs text-muted mb-1">{pt.insuranceTotal}</p>
                    <p className="text-xl font-bold text-foreground">{formatMoney(lifeInsurance.totalCost)} AZN</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.totalSummary}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.propertyPriceLabel}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(parseFloat(propertyPrice))} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.downPaymentLabel} ({result.downPercent.toFixed(1)}%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(parseFloat(downPayment) || 0)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.loanAmountLabel}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.loanAmount)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.termLabel}</span>
                <span className="text-sm font-medium text-foreground">{years} {pt.yearSuffix} ({result.months} {pt.monthSuffix})</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.totalInterestPayment}</span>
                <span className="text-sm font-medium text-amber-700">{formatMoney(result.totalInterest)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.totalPaymentAll}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.totalWithDown)} AZN</span>
              </div>
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
                  width: `${(result.loanAmount / result.totalPayment) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">{formatMoney(result.loanAmount)} AZN</span>
              <span className="font-medium text-amber-700">{formatMoney(result.totalInterest)} AZN</span>
            </div>
          </div>

          {/* Yearly Summary */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              {pt.yearlySummary}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">{pt.yearCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.principalCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.interestCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.remainingCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map((row) => (
                    <tr key={row.year} className="border-t border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.year}{pt.yearSuffixOrd}</td>
                      <td className="px-4 py-3 text-right text-primary">{formatMoney(row.principal)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{formatMoney(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Amortization Table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.monthlyAmortization}
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

          {/* ===== SCENARIOS SECTION ===== */}
          <div className="mt-10 pt-8 border-t-2 border-border">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span>🎯</span>
              {pt.scenariosTitle}
            </h2>

            {/* Scenario Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  💸 {pt.extraMonthlyLabel}
                </label>
                <input
                  type="number"
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(e.target.value)}
                  placeholder="200"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  🏦 {pt.lumpSumLabel}
                </label>
                <input
                  type="number"
                  value={lumpSum}
                  onChange={(e) => setLumpSum(e.target.value)}
                  placeholder="10000"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                />
              </div>
            </div>

            {/* Scenario A Result */}
            {scenarioA && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">{pt.scenarioA}</h3>
                <p className="text-sm text-muted mb-3">{pt.scenarioADesc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
                    <p className="text-sm text-green-600 mb-1">{pt.newTerm}</p>
                    <p className="text-2xl font-bold text-green-700">
                      {Math.floor(scenarioA.newMonths / 12)} {pt.year} {scenarioA.newMonths % 12} {pt.month}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
                    <p className="text-sm text-green-600 mb-1">{pt.timeSaved}</p>
                    <p className="text-2xl font-bold text-green-700">
                      {scenarioA.savedYears > 0 && `${scenarioA.savedYears} ${pt.year} `}{scenarioA.savedRemainderMonths} {pt.month}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
                    <p className="text-sm text-green-600 mb-1">{pt.interestSaved}</p>
                    <p className="text-2xl font-bold text-green-700">{formatMoney(scenarioA.savedInterest)} AZN</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scenario B Result */}
            {scenarioB && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">{pt.scenarioB}</h3>
                <p className="text-sm text-muted mb-3">{pt.scenarioBDesc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 text-center">
                    <p className="text-sm text-blue-600 mb-1">{pt.newMonthlyPayment}</p>
                    <p className="text-2xl font-bold text-blue-700">{formatMoney(scenarioB.newPayment)} AZN</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 text-center">
                    <p className="text-sm text-blue-600 mb-1">{pt.monthlySaving}</p>
                    <p className="text-2xl font-bold text-blue-700">{formatMoney(scenarioB.saving)} AZN</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scenario C Result */}
            {scenarioA && scenarioC && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">{pt.scenarioC}</h3>
                <p className="text-sm text-muted mb-3">{pt.scenarioCDesc}</p>

                {/* Recalc interval toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setRecalcInterval(12)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      recalcInterval === 12
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-muted hover:bg-gray-200"
                    }`}
                  >
                    {pt.every12Months}
                  </button>
                  <button
                    onClick={() => setRecalcInterval(1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      recalcInterval === 1
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-muted hover:bg-gray-200"
                    }`}
                  >
                    {pt.everyMonth}
                  </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-purple-50 rounded-xl border border-purple-200 p-5 text-center">
                    <p className="text-sm text-purple-600 mb-1">{pt.totalInterestC}</p>
                    <p className="text-2xl font-bold text-purple-700">{formatMoney(scenarioC.totalInterest)} AZN</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl border border-purple-200 p-5 text-center">
                    <p className="text-sm text-purple-600 mb-1">{pt.totalSavedC}</p>
                    <p className="text-2xl font-bold text-purple-700">{formatMoney(scenarioC.savedInterest)} AZN</p>
                  </div>
                </div>

                {/* Recalculation schedule table */}
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 font-medium text-muted">
                          {recalcInterval === 12 ? pt.yearCol : pt.monthCol}
                        </th>
                        <th className="px-4 py-3 font-medium text-muted text-right">{pt.newPaymentCol}</th>
                        <th className="px-4 py-3 font-medium text-muted text-right">{pt.remainingTermCol}</th>
                        <th className="px-4 py-3 font-medium text-muted text-right">{pt.remainingBalanceCol}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarioC.periods.map((row, i) => (
                        <tr key={i} className="border-t border-border hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            {row.period === "0" ? "—" : recalcInterval === 12 ? `${row.period}${pt.yearSuffixOrd}` : row.period}
                          </td>
                          <td className="px-4 py-3 text-right text-primary">{formatMoney(row.payment)}</td>
                          <td className="px-4 py-3 text-right">{row.remainingTerm}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatMoney(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏡</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
