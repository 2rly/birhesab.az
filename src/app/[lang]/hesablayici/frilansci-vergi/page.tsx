"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

type BusinessType = "individual-entrepreneur" | "micro-business";
type ActivityType = "trade" | "services";

// Fərdi sahibkar — sadələşdirilmiş vergi
const SIMPLIFIED_TRADE_RATE = 0.02; // 2% ticarət
const SIMPLIFIED_SERVICES_RATE = 0.04; // 4% xidmətlər

// Mikro biznes — gəlir vergisindən azad (illik <100K AZN)
const MICRO_BUSINESS_THRESHOLD = 100000; // AZN illik
const MICRO_BUSINESS_OVER_RATE = 0.02; // 100K+ üçün sadələşdirilmiş

// DSMF — könüllü (fərdi sahibkar)
const DSMF_VOLUNTARY_RATE = 0.25; // bəyan edilən məbləğin 25%-i

const pageTranslations = {
  az: {
    title: "Frilansçı vergi hesablayıcısı",
    description: "Fərdi sahibkar və mikro biznes üçün vergi hesablaması — aylıq və illik.",
    breadcrumbCategory: "Maliyyə",
    breadcrumbTitle: "Frilansçı vergi hesablayıcısı",
    formulaTitle: "Frilansçı vergisi necə hesablanır?",
    formulaContent: `Fərdi sahibkar (sadələşdirilmiş vergi):
• Ticarət fəaliyyəti: dövriyyənin 2%-i
• Xidmət fəaliyyəti: dövriyyənin 4%-i
• ƏDV: illik dövriyyə 200 000+ AZN olduqda 18%

Mikro biznes:
• İllik gəlir 100 000 AZN-dək: gəlir vergisindən azaddır
• İllik gəlir 100 000+ AZN: sadələşdirilmiş vergi tətbiq olunur
• İşçi sayı: max 5 nəfər

DSMF (könüllü ödəniş):
• Fərdi sahibkarlar üçün könüllüdür
• Bəyan edilən məbləğin 25%-i
• Pensiya və sosial müdafiə hüququ verir

Nümunə (xidmət, aylıq 3000 AZN):
Vergi: 3000 × 4% = 120 AZN/ay
DSMF (500 AZN bazadan): 500 × 25% = 125 AZN/ay
Cəmi: 245 AZN/ay, Xalis: 2755 AZN/ay`,
    businessStatus: "Biznes statusu",
    individualEntrepreneur: "Fərdi sahibkar",
    ieSimplifiedTax: "Sadələşdirilmiş vergi: 2–4%",
    microBusiness: "Mikro biznes",
    microTaxDesc: "<100K AZN/il: vergi yoxdur",
    activityType: "Fəaliyyət növü",
    services: "Xidmət",
    servicesDesc: "IT, konsaltinq, dizayn və s. — 4%",
    trade: "Ticarət",
    tradeDesc: "Mal alqı-satqısı — 2%",
    monthlyIncome: "Aylıq gəlir (AZN)",
    dsmfVoluntary: "DSMF (könüllü ödəniş)",
    dsmfBaseLabel: "Bəyan edilən aylıq məbləğ (AZN) — DSMF bazası",
    dsmfNote: "DSMF = bəyan edilən məbləğin 25%-i. Pensiya hüququ üçün tövsiyə olunur.",
    monthlyIncomeCard: "Aylıq gəlir",
    monthlyPayments: "Aylıq ödənişlər",
    netIncome: "Xalis gəlir",
    perMonth: "AZN / ay",
    microBusinessStatus: "Mikro biznes statusu — vergidən azad",
    microBusinessStatusDesc: "İllik gəliriniz {annualIncome} AZN — 100 000 AZN həddindən aşağıdır. Gəlir vergisi ödəmirsiniz. Həddə qalan: {remaining} AZN",
    annualCalcTitle: "İllik hesablama",
    annualIncome: "İllik gəlir",
    annualTax: "İllik vergi",
    annualDsmf: "İllik DSMF",
    annualNetIncome: "İllik xalis gəlir",
    detailedCalcTitle: "Ətraflı hesablama (aylıq)",
    monthlyIncomeLabel: "Aylıq gəlir",
    taxAndPayments: "Vergi və ödənişlər",
    dsmfVoluntary25: "DSMF (könüllü, 25%)",
    dsmfBase: "Baza",
    totalMonthlyPayment: "Cəmi aylıq ödəniş",
    netMonthlyIncome: "Xalis aylıq gəlir",
    statusComparison: "Status müqayisəsi",
    forPerMonth: "AZN/ay üçün",
    ieServices: "Fərdi sahibkar (xidmət)",
    ieServicesDesc: "Sadələşdirilmiş vergi — 4%",
    ieTrade: "Fərdi sahibkar (ticarət)",
    ieTradeDesc: "Sadələşdirilmiş vergi — 2%",
    microBusinessLabel: "Mikro biznes",
    microUnder100k: "İllik <100K AZN — vergidən azad",
    microOver100k: "İllik 100K+ AZN — 2%",
    microBestOption: "Mikro biznes ən sərfəlidir — vergi yoxdur!",
    ieTradeBest: "Fərdi sahibkar (ticarət) ən sərfəlidir",
    microBest: "Mikro biznes ən sərfəlidir",
    ieServicesSelected: "Fərdi sahibkar (xidmət) statusu seçilib",
    incomeBreakdown: "Gəlirin bölgüsü",
    netLabel: "Xalis",
    taxLabelShort: "Vergi",
    dsmfLabel: "DSMF",
    perYear: "AZN/il",
    perMonthShort: "AZN/ay",
    note: "Qeyd:",
    noteText: "Fərdi sahibkar qeydiyyatı Vergilər Nazirliyinin e-taxes.gov.az portalından onlayn edilə bilər. Mikro biznes statusu üçün ASAN xidmətə müraciət edin. Vergi bəyannaməsi rüblük (hər rübdən sonrakı ayın 20-dək) verilməlidir. DSMF ödənişi pensiya yaşında təqaüd almaq üçün vacibdir — ən azı 25 il staj tələb olunur.",
    emptyStateText: "Nəticəni görmək üçün aylıq gəlirinizi daxil edin.",
    simplifiedTaxTrade: "Sadələşdirilmiş vergi (ticarət)",
    simplifiedTaxTradeDesc: "Dövriyyənin 2%-i",
    simplifiedTaxServices: "Sadələşdirilmiş vergi (xidmət)",
    simplifiedTaxServicesDesc: "Dövriyyənin 4%-i",
    microTaxFree: "Mikro biznes (gəlir vergisindən azad)",
    microTaxFreeDesc: "İllik gəlir 100 000 AZN-dən az olduqda vergi yoxdur",
    microTaxOver: "Mikro biznes (hədd aşılıb)",
    microTaxOverDesc: "İllik gəlir 100 000+ AZN — sadələşdirilmiş 2%",
  },
  en: {
    title: "Freelancer tax calculator",
    description: "Tax calculation for individual entrepreneurs and micro businesses — monthly and annual.",
    breadcrumbCategory: "Finance",
    breadcrumbTitle: "Freelancer tax calculator",
    formulaTitle: "How is freelancer tax calculated?",
    formulaContent: `Individual entrepreneur (simplified tax):
• Trade activity: 2% of turnover
• Service activity: 4% of turnover
• VAT: 18% when annual turnover exceeds 200,000 AZN

Micro business:
• Annual income up to 100,000 AZN: exempt from income tax
• Annual income over 100,000 AZN: simplified tax applies
• Max employees: 5

DSMF (voluntary payment):
• Voluntary for individual entrepreneurs
• 25% of declared amount
• Provides pension and social protection rights

Example (services, monthly 3,000 AZN):
Tax: 3,000 x 4% = 120 AZN/month
DSMF (from 500 AZN base): 500 x 25% = 125 AZN/month
Total: 245 AZN/month, Net: 2,755 AZN/month`,
    businessStatus: "Business status",
    individualEntrepreneur: "Individual entrepreneur",
    ieSimplifiedTax: "Simplified tax: 2-4%",
    microBusiness: "Micro business",
    microTaxDesc: "<100K AZN/year: no tax",
    activityType: "Activity type",
    services: "Services",
    servicesDesc: "IT, consulting, design, etc. — 4%",
    trade: "Trade",
    tradeDesc: "Goods trading — 2%",
    monthlyIncome: "Monthly income (AZN)",
    dsmfVoluntary: "DSMF (voluntary payment)",
    dsmfBaseLabel: "Declared monthly amount (AZN) — DSMF base",
    dsmfNote: "DSMF = 25% of declared amount. Recommended for pension rights.",
    monthlyIncomeCard: "Monthly income",
    monthlyPayments: "Monthly payments",
    netIncome: "Net income",
    perMonth: "AZN / month",
    microBusinessStatus: "Micro business status — tax-exempt",
    microBusinessStatusDesc: "Your annual income is {annualIncome} AZN — below the 100,000 AZN threshold. You do not pay income tax. Remaining to threshold: {remaining} AZN",
    annualCalcTitle: "Annual calculation",
    annualIncome: "Annual income",
    annualTax: "Annual tax",
    annualDsmf: "Annual DSMF",
    annualNetIncome: "Annual net income",
    detailedCalcTitle: "Detailed calculation (monthly)",
    monthlyIncomeLabel: "Monthly income",
    taxAndPayments: "Tax and payments",
    dsmfVoluntary25: "DSMF (voluntary, 25%)",
    dsmfBase: "Base",
    totalMonthlyPayment: "Total monthly payment",
    netMonthlyIncome: "Net monthly income",
    statusComparison: "Status comparison",
    forPerMonth: "AZN/month for",
    ieServices: "Individual entrepreneur (services)",
    ieServicesDesc: "Simplified tax — 4%",
    ieTrade: "Individual entrepreneur (trade)",
    ieTradeDesc: "Simplified tax — 2%",
    microBusinessLabel: "Micro business",
    microUnder100k: "Annual <100K AZN — tax-exempt",
    microOver100k: "Annual 100K+ AZN — 2%",
    microBestOption: "Micro business is the best option — no tax!",
    ieTradeBest: "Individual entrepreneur (trade) is the best option",
    microBest: "Micro business is the best option",
    ieServicesSelected: "Individual entrepreneur (services) status selected",
    incomeBreakdown: "Income breakdown",
    netLabel: "Net",
    taxLabelShort: "Tax",
    dsmfLabel: "DSMF",
    perYear: "AZN/year",
    perMonthShort: "AZN/month",
    note: "Note:",
    noteText: "Individual entrepreneur registration can be done online at the Tax Ministry's e-taxes.gov.az portal. For micro business status, apply at ASAN service. Tax returns must be filed quarterly (by the 20th of the month following each quarter). DSMF payment is important for receiving a pension — at least 25 years of service is required.",
    emptyStateText: "Enter your monthly income to see the result.",
    simplifiedTaxTrade: "Simplified tax (trade)",
    simplifiedTaxTradeDesc: "2% of turnover",
    simplifiedTaxServices: "Simplified tax (services)",
    simplifiedTaxServicesDesc: "4% of turnover",
    microTaxFree: "Micro business (income tax exempt)",
    microTaxFreeDesc: "No tax when annual income is below 100,000 AZN",
    microTaxOver: "Micro business (threshold exceeded)",
    microTaxOverDesc: "Annual income 100,000+ AZN — simplified 2%",
  },
  ru: {
    title: "Калькулятор налогов для фрилансера",
    description: "Расчёт налогов для индивидуальных предпринимателей и микробизнеса — ежемесячно и ежегодно.",
    breadcrumbCategory: "Финансы",
    breadcrumbTitle: "Калькулятор налогов для фрилансера",
    formulaTitle: "Как рассчитывается налог для фрилансера?",
    formulaContent: `Индивидуальный предприниматель (упрощённый налог):
• Торговая деятельность: 2% от оборота
• Услуги: 4% от оборота
• НДС: 18% при годовом обороте свыше 200 000 AZN

Микробизнес:
• Годовой доход до 100 000 AZN: освобождён от подоходного налога
• Годовой доход свыше 100 000 AZN: применяется упрощённый налог
• Макс. сотрудников: 5

ГФСЗ (добровольный платёж):
• Добровольно для индивидуальных предпринимателей
• 25% от заявленной суммы
• Даёт право на пенсию и социальную защиту

Пример (услуги, ежемесячно 3 000 AZN):
Налог: 3 000 × 4% = 120 AZN/мес.
ГФСЗ (от базы 500 AZN): 500 × 25% = 125 AZN/мес.
Итого: 245 AZN/мес., Чистыми: 2 755 AZN/мес.`,
    businessStatus: "Статус бизнеса",
    individualEntrepreneur: "Индивидуальный предприниматель",
    ieSimplifiedTax: "Упрощённый налог: 2–4%",
    microBusiness: "Микробизнес",
    microTaxDesc: "<100K AZN/год: налог отсутствует",
    activityType: "Вид деятельности",
    services: "Услуги",
    servicesDesc: "IT, консалтинг, дизайн и т.д. — 4%",
    trade: "Торговля",
    tradeDesc: "Купля-продажа товаров — 2%",
    monthlyIncome: "Ежемесячный доход (AZN)",
    dsmfVoluntary: "ГФСЗ (добровольный платёж)",
    dsmfBaseLabel: "Заявленная ежемесячная сумма (AZN) — база ГФСЗ",
    dsmfNote: "ГФСЗ = 25% от заявленной суммы. Рекомендуется для пенсионных прав.",
    monthlyIncomeCard: "Ежемесячный доход",
    monthlyPayments: "Ежемесячные платежи",
    netIncome: "Чистый доход",
    perMonth: "AZN / мес.",
    microBusinessStatus: "Статус микробизнеса — освобождён от налога",
    microBusinessStatusDesc: "Ваш годовой доход {annualIncome} AZN — ниже порога 100 000 AZN. Вы не платите подоходный налог. До порога осталось: {remaining} AZN",
    annualCalcTitle: "Годовой расчёт",
    annualIncome: "Годовой доход",
    annualTax: "Годовой налог",
    annualDsmf: "Годовой ГФСЗ",
    annualNetIncome: "Годовой чистый доход",
    detailedCalcTitle: "Подробный расчёт (ежемесячно)",
    monthlyIncomeLabel: "Ежемесячный доход",
    taxAndPayments: "Налоги и платежи",
    dsmfVoluntary25: "ГФСЗ (добровольно, 25%)",
    dsmfBase: "База",
    totalMonthlyPayment: "Итого ежемесячный платёж",
    netMonthlyIncome: "Чистый ежемесячный доход",
    statusComparison: "Сравнение статусов",
    forPerMonth: "AZN/мес. для",
    ieServices: "ИП (услуги)",
    ieServicesDesc: "Упрощённый налог — 4%",
    ieTrade: "ИП (торговля)",
    ieTradeDesc: "Упрощённый налог — 2%",
    microBusinessLabel: "Микробизнес",
    microUnder100k: "Годовой <100K AZN — освобождён от налога",
    microOver100k: "Годовой 100K+ AZN — 2%",
    microBestOption: "Микробизнес — лучший вариант — налог отсутствует!",
    ieTradeBest: "ИП (торговля) — лучший вариант",
    microBest: "Микробизнес — лучший вариант",
    ieServicesSelected: "Выбран статус ИП (услуги)",
    incomeBreakdown: "Распределение дохода",
    netLabel: "Чистый",
    taxLabelShort: "Налог",
    dsmfLabel: "ГФСЗ",
    perYear: "AZN/год",
    perMonthShort: "AZN/мес.",
    note: "Примечание:",
    noteText: "Регистрация ИП доступна онлайн на портале Налогового министерства e-taxes.gov.az. Для статуса микробизнеса обратитесь в службу ASAN. Налоговая декларация подаётся ежеквартально (до 20-го числа месяца, следующего за кварталом). Платёж ГФСЗ важен для получения пенсии — требуется минимум 25 лет стажа.",
    emptyStateText: "Введите ваш ежемесячный доход, чтобы увидеть результат.",
    simplifiedTaxTrade: "Упрощённый налог (торговля)",
    simplifiedTaxTradeDesc: "2% от оборота",
    simplifiedTaxServices: "Упрощённый налог (услуги)",
    simplifiedTaxServicesDesc: "4% от оборота",
    microTaxFree: "Микробизнес (освобождён от подоходного налога)",
    microTaxFreeDesc: "Нет налога при годовом доходе менее 100 000 AZN",
    microTaxOver: "Микробизнес (порог превышен)",
    microTaxOverDesc: "Годовой доход 100 000+ AZN — упрощённый 2%",
  },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function FreelancerTaxCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("individual-entrepreneur");
  const [activityType, setActivityType] = useState<ActivityType>("services");
  const [dsmfBase, setDsmfBase] = useState("");
  const [includeDsmf, setIncludeDsmf] = useState(true);

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome);
    if (!income || income <= 0) return null;

    const annualIncome = income * 12;
    let monthlyTax = 0;
    let taxRate = 0;
    let taxMethod = "";
    let taxDescription = "";

    if (businessType === "individual-entrepreneur") {
      if (activityType === "trade") {
        taxRate = SIMPLIFIED_TRADE_RATE;
        monthlyTax = income * taxRate;
        taxMethod = pt.simplifiedTaxTrade;
        taxDescription = pt.simplifiedTaxTradeDesc;
      } else {
        taxRate = SIMPLIFIED_SERVICES_RATE;
        monthlyTax = income * taxRate;
        taxMethod = pt.simplifiedTaxServices;
        taxDescription = pt.simplifiedTaxServicesDesc;
      }
    } else {
      // Mikro biznes
      if (annualIncome < MICRO_BUSINESS_THRESHOLD) {
        taxRate = 0;
        monthlyTax = 0;
        taxMethod = pt.microTaxFree;
        taxDescription = pt.microTaxFreeDesc;
      } else {
        taxRate = MICRO_BUSINESS_OVER_RATE;
        monthlyTax = income * taxRate;
        taxMethod = pt.microTaxOver;
        taxDescription = pt.microTaxOverDesc;
      }
    }

    // DSMF (könüllü)
    const dsmfDeclaredBase = parseFloat(dsmfBase) || 0;
    const monthlyDsmf = includeDsmf && dsmfDeclaredBase > 0 ? dsmfDeclaredBase * DSMF_VOLUNTARY_RATE : 0;

    const totalMonthlyPayment = monthlyTax + monthlyDsmf;
    const netMonthlyIncome = income - totalMonthlyPayment;

    const annualTax = monthlyTax * 12;
    const annualDsmf = monthlyDsmf * 12;
    const totalAnnualPayment = totalMonthlyPayment * 12;
    const annualNetIncome = netMonthlyIncome * 12;
    const effectiveTaxRate = income > 0 ? (totalMonthlyPayment / income) * 100 : 0;

    // Comparison between business types
    const ieTradeMonthly = income * SIMPLIFIED_TRADE_RATE;
    const ieServicesMonthly = income * SIMPLIFIED_SERVICES_RATE;
    const microMonthly = annualIncome < MICRO_BUSINESS_THRESHOLD ? 0 : income * MICRO_BUSINESS_OVER_RATE;

    return {
      income,
      annualIncome,
      monthlyTax,
      taxRate,
      taxMethod,
      taxDescription,
      monthlyDsmf,
      dsmfDeclaredBase,
      totalMonthlyPayment,
      netMonthlyIncome,
      annualTax,
      annualDsmf,
      totalAnnualPayment,
      annualNetIncome,
      effectiveTaxRate,
      ieTradeMonthly,
      ieServicesMonthly,
      microMonthly,
    };
  }, [monthlyIncome, businessType, activityType, dsmfBase, includeDsmf, pt]);

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
      relatedIds={["salary", "dividend-tax", "vat", "rental-income-tax"]}
    >
      {/* Business Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.businessStatus}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setBusinessType("individual-entrepreneur")}
            className={`p-4 rounded-xl border text-left transition-all ${
              businessType === "individual-entrepreneur"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">📋</span>
            <p className="text-sm font-medium text-foreground">{pt.individualEntrepreneur}</p>
            <p className="text-xs text-muted mt-1">{pt.ieSimplifiedTax}</p>
          </button>
          <button
            onClick={() => setBusinessType("micro-business")}
            className={`p-4 rounded-xl border text-left transition-all ${
              businessType === "micro-business"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏪</span>
            <p className="text-sm font-medium text-foreground">{pt.microBusiness}</p>
            <p className="text-xs text-muted mt-1">{pt.microTaxDesc}</p>
          </button>
        </div>
      </div>

      {/* Activity Type (for individual entrepreneur) */}
      {businessType === "individual-entrepreneur" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">{pt.activityType}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActivityType("services")}
              className={`p-4 rounded-xl border text-left transition-all ${
                activityType === "services"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">💻</span>
              <p className="text-sm font-medium text-foreground">{pt.services}</p>
              <p className="text-xs text-muted mt-1">{pt.servicesDesc}</p>
            </button>
            <button
              onClick={() => setActivityType("trade")}
              className={`p-4 rounded-xl border text-left transition-all ${
                activityType === "trade"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">🛒</span>
              <p className="text-sm font-medium text-foreground">{pt.trade}</p>
              <p className="text-xs text-muted mt-1">{pt.tradeDesc}</p>
            </button>
          </div>
        </div>
      )}

      {/* Income Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          💰 {pt.monthlyIncome}
        </label>
        <input
          type="number"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
          placeholder="3000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[1000, 2000, 3000, 5000, 8000].map((v) => (
            <button
              key={v}
              onClick={() => setMonthlyIncome(String(v))}
              className="px-2.5 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* DSMF Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">{pt.dsmfVoluntary}</label>
          <button
            onClick={() => setIncludeDsmf(!includeDsmf)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeDsmf ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeDsmf ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {includeDsmf && (
          <div>
            <label className="block text-xs text-muted mb-2">
              {pt.dsmfBaseLabel}
            </label>
            <input
              type="number"
              value={dsmfBase}
              onChange={(e) => setDsmfBase(e.target.value)}
              placeholder="500"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">{pt.dsmfNote}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.monthlyIncomeCard}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.income)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.monthlyPayments}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalMonthlyPayment)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN ({result.effectiveTaxRate.toFixed(1)}%)</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netIncome}</p>
              <p className="text-2xl font-bold">{fmt(result.netMonthlyIncome)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
          </div>

          {/* Micro business status indicator */}
          {businessType === "micro-business" && result.annualIncome < MICRO_BUSINESS_THRESHOLD && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✅</span>
                {pt.microBusinessStatus}
              </h4>
              <p className="text-sm text-green-700">
                {pt.microBusinessStatusDesc
                  .replace("{annualIncome}", fmt(result.annualIncome))
                  .replace("{remaining}", fmt(MICRO_BUSINESS_THRESHOLD - result.annualIncome))}
              </p>
              <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(result.annualIncome / MICRO_BUSINESS_THRESHOLD) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-green-600 mt-1">
                <span>0 AZN</span>
                <span>100 000 AZN</span>
              </div>
            </div>
          )}

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              {pt.annualCalcTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualIncome}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualIncome)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualTax}</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.annualTax)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualDsmf}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualDsmf)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualNetIncome}</p>
                <p className="text-lg font-bold text-primary">{fmt(result.annualNetIncome)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedCalcTitle}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.monthlyIncomeLabel}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.income)} AZN</span>
              </div>

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">{pt.taxAndPayments}</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-muted">{result.taxMethod}</span>
                  <p className="text-xs text-muted">{result.taxDescription}</p>
                </div>
                <span className="text-sm font-medium text-foreground">{fmt(result.monthlyTax)} AZN</span>
              </div>

              {result.monthlyDsmf > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <div>
                    <span className="text-sm text-muted">{pt.dsmfVoluntary25}</span>
                    <p className="text-xs text-muted">{pt.dsmfBase}: {fmt(result.dsmfDeclaredBase)} AZN</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">{fmt(result.monthlyDsmf)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">{pt.totalMonthlyPayment}</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.totalMonthlyPayment)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.netMonthlyIncome}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.netMonthlyIncome)} AZN</span>
              </div>
            </div>
          </div>

          {/* Method Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>⚖️</span>
                {pt.statusComparison} — {fmt(result.income)} {pt.forPerMonth}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className={`flex items-center justify-between px-5 py-4 ${businessType === "individual-entrepreneur" && activityType === "services" ? "bg-green-50" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.ieServices}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.ieServicesDesc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(result.ieServicesMonthly)} {pt.perMonthShort}</p>
                  <p className="text-xs text-muted">{fmt(result.ieServicesMonthly * 12)} {pt.perYear}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between px-5 py-4 ${businessType === "individual-entrepreneur" && activityType === "trade" ? "bg-green-50" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.ieTrade}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.ieTradeDesc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(result.ieTradeMonthly)} {pt.perMonthShort}</p>
                  <p className="text-xs text-muted">{fmt(result.ieTradeMonthly * 12)} {pt.perYear}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between px-5 py-4 ${businessType === "micro-business" ? "bg-green-50" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.microBusinessLabel}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {result.annualIncome < MICRO_BUSINESS_THRESHOLD
                      ? pt.microUnder100k
                      : pt.microOver100k
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(result.microMonthly)} {pt.perMonthShort}</p>
                  <p className="text-xs text-muted">{fmt(result.microMonthly * 12)} {pt.perYear}</p>
                </div>
              </div>
              <div className="px-5 py-3 bg-green-50">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <span>💡</span>
                  {result.microMonthly === 0 && result.annualIncome < MICRO_BUSINESS_THRESHOLD
                    ? pt.microBestOption
                    : result.ieTradeMonthly <= result.ieServicesMonthly && result.ieTradeMonthly <= result.microMonthly
                      ? pt.ieTradeBest
                      : result.microMonthly <= result.ieServicesMonthly
                        ? pt.microBest
                        : pt.ieServicesSelected
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.incomeBreakdown}</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${(Math.max(0, result.netMonthlyIncome) / result.income) * 100}%` }}
                title={pt.netIncome}
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.monthlyTax / result.income) * 100}%` }}
                title={pt.taxLabelShort}
              />
              {result.monthlyDsmf > 0 && (
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${(result.monthlyDsmf / result.income) * 100}%` }}
                  title={pt.dsmfLabel}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                {pt.netLabel}: {fmt(result.netMonthlyIncome)} ({((Math.max(0, result.netMonthlyIncome) / result.income) * 100).toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                {pt.taxLabelShort}: {fmt(result.monthlyTax)} ({((result.monthlyTax / result.income) * 100).toFixed(0)}%)
              </span>
              {result.monthlyDsmf > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                  {pt.dsmfLabel}: {fmt(result.monthlyDsmf)} ({((result.monthlyDsmf / result.income) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.note}</span> {pt.noteText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💼</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
