"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

const SIMPLIFIED_TIER1_LIMIT = 2000; // AZN/ay
const SIMPLIFIED_TIER1_RATE = 0.04; // 4%
const SIMPLIFIED_TIER2_RATE = 0.08; // 8%
const STANDARD_TAX_RATE = 0.14; // 14%

type TaxMethod = "simplified" | "standard" | "compare";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Kirayə gəlir vergisi hesablayıcısı",
    description: "Kirayə gəlirindən tutulan vergini hesablayın — sadələşdirilmiş və standart üsulun müqayisəsi.",
    breadcrumbCategory: "Daşınmaz Əmlak",
    formulaTitle: "Kirayə gəlir vergisi necə hesablanır?",
    formulaContent: `Sadələşdirilmiş vergi yanaşması:
• Aylıq gəlir 2000 AZN-dək: 4%
• Aylıq gəlir 2000+ AZN: ilk 2000-ə 4%, qalanına 8%
• Xərclər çıxılmır, vergi birbaşa gəlirdən hesablanır

Standart yanaşma (gəlir vergisi):
• Mənfəət = Gəlir − Xərclər (təmir, kommunal, amortizasiya, sığorta)
• Vergi = Mənfəət × 14%
• Xərclər sənədləşdirilməlidir

Nümunə (3000 AZN/ay, 500 AZN xərc):
Sadələşdirilmiş: 2000×4% + 1000×8% = 80+80 = 160 AZN/ay
Standart: (3000−500)×14% = 350 AZN/ay
Bu halda sadələşdirilmiş üsul 190 AZN/ay qənaət edir.

Nə vaxt standart üsul sərfəlidir?
Xərcləriniz yüksək olduqda (təmir, yenidənqurma və s.) standart üsul daha sərfəli ola bilər.`,
    calcMode: "Hesablama rejimi",
    compare: "Müqayisə",
    simplified: "Sadələşdirilmiş",
    standard: "Standart (14%)",
    monthlyRentalIncome: "Aylıq kirayə gəliri (AZN)",
    monthlyExpenses: "Aylıq xərclər (AZN)",
    forStandardMethod: "standart üsul üçün",
    expensesHint: "Təmir, kommunal, amortizasiya, sığorta və s.",
    simplifiedLabel: "Sadələşdirilmiş",
    standardLabel: "Standart (14%)",
    profitFrom: "Mənfəətdən:",
    monthlyIncome: "Aylıq gəlir",
    tax: "Vergi",
    netIncome: "Xalis gəlir",
    perMonth: "AZN / ay",
    effectiveRate: "Effektiv dərəcə:",
    simplifiedSaves: "Sadələşdirilmiş üsul ayda {monthly} AZN, ildə {annual} AZN qənaət edir",
    standardSaves: "Standart üsul ayda {monthly} AZN, ildə {annual} AZN qənaət edir",
    breakeven: "Standart üsulun sərfəli olması üçün aylıq xərcləriniz {amount} AZN-dən çox olmalıdır.",
    monthlyProfit: "Aylıq mənfəət",
    annualCalc: "İllik hesablama",
    simplifiedUpper: "SADƏLƏŞDİRİLMİŞ",
    standardUpper: "STANDART (14%)",
    annualIncome: "İllik gəlir",
    annualTax: "İllik vergi",
    annualNet: "İllik xalis",
    detailedComparison: "Ətraflı müqayisə (aylıq)",
    expenses: "Xərclər",
    notDeducted: "çıxılmır",
    taxBase: "Vergi bazası",
    taxRate: "Vergi dərəcəsi",
    taxAmount: "Vergi məbləği",
    taxBurdenComparison: "Vergi yükü müqayisəsi",
    quickComparison: "Sürətli müqayisə — müxtəlif kirayə məbləğləri",
    monthlyIncomeCol: "Aylıq gəlir",
    beneficial: "Sərfəli",
    noteTitle: "Qeyd:",
    noteText: "Sadələşdirilmiş vergidə xərclər çıxılmır — vergi birbaşa gəlirdən hesablanır. Standart üsulda isə sənədləşdirilmiş xərclər (təmir, kommunal, amortizasiya, sığorta) gəlirdən çıxılır və vergi yalnız mənfəətdən tutulur. Kirayə müqaviləsi notarial qaydada təsdiq olunmalı və vergi orqanında qeydiyyatdan keçirilməlidir. Bəyannamə hər il 31 marta qədər verilməlidir.",
    emptyState: "Nəticəni görmək üçün aylıq kirayə gəlirini daxil edin.",
  },
  en: {
    title: "Rental income tax calculator",
    description: "Calculate tax on rental income — comparison of simplified and standard methods.",
    breadcrumbCategory: "Real Estate",
    formulaTitle: "How is rental income tax calculated?",
    formulaContent: `Simplified tax approach:
• Monthly income up to 2000 AZN: 4%
• Monthly income 2000+ AZN: 4% on first 2000, 8% on the rest
• Expenses are not deducted, tax is calculated directly from income

Standard approach (income tax):
• Profit = Income − Expenses (repairs, utilities, depreciation, insurance)
• Tax = Profit × 14%
• Expenses must be documented

Example (3000 AZN/month, 500 AZN expenses):
Simplified: 2000×4% + 1000×8% = 80+80 = 160 AZN/month
Standard: (3000−500)×14% = 350 AZN/month
In this case, the simplified method saves 190 AZN/month.

When is the standard method more beneficial?
When your expenses are high (repairs, renovation, etc.) the standard method may be more profitable.`,
    calcMode: "Calculation mode",
    compare: "Compare",
    simplified: "Simplified",
    standard: "Standard (14%)",
    monthlyRentalIncome: "Monthly rental income (AZN)",
    monthlyExpenses: "Monthly expenses (AZN)",
    forStandardMethod: "for standard method",
    expensesHint: "Repairs, utilities, depreciation, insurance, etc.",
    simplifiedLabel: "Simplified",
    standardLabel: "Standard (14%)",
    profitFrom: "From profit:",
    monthlyIncome: "Monthly income",
    tax: "Tax",
    netIncome: "Net income",
    perMonth: "AZN / month",
    effectiveRate: "Effective rate:",
    simplifiedSaves: "Simplified method saves {monthly} AZN/month, {annual} AZN/year",
    standardSaves: "Standard method saves {monthly} AZN/month, {annual} AZN/year",
    breakeven: "For the standard method to be profitable, your monthly expenses must exceed {amount} AZN.",
    monthlyProfit: "Monthly profit",
    annualCalc: "Annual calculation",
    simplifiedUpper: "SIMPLIFIED",
    standardUpper: "STANDARD (14%)",
    annualIncome: "Annual income",
    annualTax: "Annual tax",
    annualNet: "Annual net",
    detailedComparison: "Detailed comparison (monthly)",
    expenses: "Expenses",
    notDeducted: "not deducted",
    taxBase: "Tax base",
    taxRate: "Tax rate",
    taxAmount: "Tax amount",
    taxBurdenComparison: "Tax burden comparison",
    quickComparison: "Quick comparison — various rental amounts",
    monthlyIncomeCol: "Monthly income",
    beneficial: "Beneficial",
    noteTitle: "Note:",
    noteText: "In simplified taxation, expenses are not deducted — tax is calculated directly from income. In the standard method, documented expenses (repairs, utilities, depreciation, insurance) are deducted from income and tax is levied only on profit. The rental agreement must be notarized and registered with the tax authority. The declaration must be filed by March 31 each year.",
    emptyState: "Enter monthly rental income to see the result.",
  },
  ru: {
    title: "Калькулятор налога на доход от аренды",
    description: "Рассчитайте налог на доход от аренды — сравнение упрощённого и стандартного методов.",
    breadcrumbCategory: "Недвижимость",
    formulaTitle: "Как рассчитывается налог на доход от аренды?",
    formulaContent: `Упрощённый налоговый подход:
• Ежемесячный доход до 2000 AZN: 4%
• Ежемесячный доход 2000+ AZN: 4% на первые 2000, 8% на остаток
• Расходы не вычитаются, налог рассчитывается напрямую с дохода

Стандартный подход (подоходный налог):
• Прибыль = Доход − Расходы (ремонт, коммунальные, амортизация, страховка)
• Налог = Прибыль × 14%
• Расходы должны быть документированы

Пример (3000 AZN/мес., 500 AZN расходы):
Упрощённый: 2000×4% + 1000×8% = 80+80 = 160 AZN/мес.
Стандартный: (3000−500)×14% = 350 AZN/мес.
В этом случае упрощённый метод экономит 190 AZN/мес.

Когда стандартный метод выгоднее?
При высоких расходах (ремонт, реконструкция и т.д.) стандартный метод может быть выгоднее.`,
    calcMode: "Режим расчёта",
    compare: "Сравнение",
    simplified: "Упрощённый",
    standard: "Стандартный (14%)",
    monthlyRentalIncome: "Ежемесячный доход от аренды (AZN)",
    monthlyExpenses: "Ежемесячные расходы (AZN)",
    forStandardMethod: "для стандартного метода",
    expensesHint: "Ремонт, коммунальные, амортизация, страховка и т.д.",
    simplifiedLabel: "Упрощённый",
    standardLabel: "Стандартный (14%)",
    profitFrom: "От прибыли:",
    monthlyIncome: "Ежемесячный доход",
    tax: "Налог",
    netIncome: "Чистый доход",
    perMonth: "AZN / мес.",
    effectiveRate: "Эффективная ставка:",
    simplifiedSaves: "Упрощённый метод экономит {monthly} AZN/мес., {annual} AZN/год",
    standardSaves: "Стандартный метод экономит {monthly} AZN/мес., {annual} AZN/год",
    breakeven: "Для выгодности стандартного метода ваши ежемесячные расходы должны превышать {amount} AZN.",
    monthlyProfit: "Ежемесячная прибыль",
    annualCalc: "Годовой расчёт",
    simplifiedUpper: "УПРОЩЁННЫЙ",
    standardUpper: "СТАНДАРТНЫЙ (14%)",
    annualIncome: "Годовой доход",
    annualTax: "Годовой налог",
    annualNet: "Годовой чистый",
    detailedComparison: "Подробное сравнение (ежемесячно)",
    expenses: "Расходы",
    notDeducted: "не вычитаются",
    taxBase: "Налоговая база",
    taxRate: "Ставка налога",
    taxAmount: "Сумма налога",
    taxBurdenComparison: "Сравнение налоговой нагрузки",
    quickComparison: "Быстрое сравнение — различные суммы аренды",
    monthlyIncomeCol: "Ежемесячный доход",
    beneficial: "Выгодный",
    noteTitle: "Примечание:",
    noteText: "В упрощённом налогообложении расходы не вычитаются — налог рассчитывается напрямую с дохода. В стандартном методе документированные расходы (ремонт, коммунальные, амортизация, страховка) вычитаются из дохода, и налог взимается только с прибыли. Договор аренды должен быть нотариально заверен и зарегистрирован в налоговом органе. Декларация подаётся до 31 марта каждого года.",
    emptyState: "Введите ежемесячный доход от аренды, чтобы увидеть результат.",
  },
};

export default function RentalIncomeTaxCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [taxMethod, setTaxMethod] = useState<TaxMethod>("compare");

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome);
    if (!income || income <= 0) return null;

    const expenses = parseFloat(monthlyExpenses) || 0;
    const annualIncome = income * 12;
    const annualExpenses = expenses * 12;

    let simplifiedMonthly: number;
    let simplifiedTier: string;
    if (income <= SIMPLIFIED_TIER1_LIMIT) {
      simplifiedMonthly = income * SIMPLIFIED_TIER1_RATE;
      simplifiedTier = "4% (2000 AZN-dək)";
    } else {
      simplifiedMonthly =
        SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE +
        (income - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
      simplifiedTier = "4% + 8% (2000+ AZN)";
    }
    const simplifiedAnnual = simplifiedMonthly * 12;
    const simplifiedNet = income - simplifiedMonthly;
    const simplifiedAnnualNet = simplifiedNet * 12;

    const profit = Math.max(0, income - expenses);
    const standardMonthly = profit * STANDARD_TAX_RATE;
    const standardAnnual = standardMonthly * 12;
    const standardNet = income - expenses - standardMonthly;
    const standardAnnualNet = standardNet * 12;

    const simplifiedBetter = simplifiedMonthly <= standardMonthly;
    const savings = Math.abs(simplifiedMonthly - standardMonthly);
    const annualSavings = savings * 12;

    const simplifiedEffective = (simplifiedMonthly / income) * 100;
    const standardEffective = income > 0 ? (standardMonthly / income) * 100 : 0;

    const breakevenExpenses = income - simplifiedMonthly / STANDARD_TAX_RATE;

    return {
      income,
      expenses,
      annualIncome,
      annualExpenses,
      simplifiedMonthly,
      simplifiedAnnual,
      simplifiedNet,
      simplifiedAnnualNet,
      simplifiedTier,
      simplifiedEffective,
      standardMonthly,
      standardAnnual,
      standardNet,
      standardAnnualNet,
      standardEffective,
      profit,
      simplifiedBetter,
      savings,
      annualSavings,
      breakevenExpenses: Math.max(0, breakevenExpenses),
    };
  }, [monthlyIncome, monthlyExpenses]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=realestate" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["rental-tax", "property-tax", "deposit", "vat"]}
    >
      {/* Tax Method Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.calcMode}</label>
        <div className="flex rounded-xl border border-border overflow-hidden">
          {([
            { value: "compare" as const, label: pt.compare },
            { value: "simplified" as const, label: pt.simplified },
            { value: "standard" as const, label: pt.standard },
          ]).map((m) => (
            <button
              key={m.value}
              onClick={() => setTaxMethod(m.value)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                taxMethod === m.value
                  ? "bg-primary text-white"
                  : "bg-white text-muted hover:bg-gray-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 {pt.monthlyRentalIncome}
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="2000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[500, 1000, 2000, 3000, 5000].map((v) => (
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🔧 {pt.monthlyExpenses} <span className="text-muted font-normal">— {pt.forStandardMethod}</span>
          </label>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <p className="text-xs text-muted mt-1">{pt.expensesHint}</p>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Comparison Mode */}
          {taxMethod === "compare" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`rounded-2xl border p-6 ${result.simplifiedBetter ? "bg-green-50 border-green-200" : "bg-gray-50 border-border"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.simplifiedBetter && <span className="text-sm">✅</span>}
                    <h4 className="font-semibold text-foreground">{pt.simplifiedLabel}</h4>
                  </div>
                  <p className="text-xs text-muted mb-1">{result.simplifiedTier}</p>
                  <p className="text-2xl font-bold text-foreground mb-1">{fmt(result.simplifiedMonthly)} <span className="text-sm font-normal text-muted">AZN/ay</span></p>
                  <p className="text-sm text-muted">{pt.netIncome}: <span className="font-semibold text-foreground">{fmt(result.simplifiedNet)} AZN/ay</span></p>
                  <p className="text-xs text-muted mt-1">{pt.effectiveRate} {result.simplifiedEffective.toFixed(1)}%</p>
                </div>

                <div className={`rounded-2xl border p-6 ${!result.simplifiedBetter ? "bg-green-50 border-green-200" : "bg-gray-50 border-border"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {!result.simplifiedBetter && <span className="text-sm">✅</span>}
                    <h4 className="font-semibold text-foreground">{pt.standardLabel}</h4>
                  </div>
                  <p className="text-xs text-muted mb-1">{pt.profitFrom} ({fmt(result.income)} − {fmt(result.expenses)}) × 14%</p>
                  <p className="text-2xl font-bold text-foreground mb-1">{fmt(result.standardMonthly)} <span className="text-sm font-normal text-muted">AZN/ay</span></p>
                  <p className="text-sm text-muted">{pt.netIncome}: <span className="font-semibold text-foreground">{fmt(result.standardNet)} AZN/ay</span></p>
                  <p className="text-xs text-muted mt-1">{pt.effectiveRate} {result.standardEffective.toFixed(1)}%</p>
                </div>
              </div>

              {/* Savings Banner */}
              <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <span>💡</span>
                  {result.simplifiedBetter
                    ? pt.simplifiedSaves.replace("{monthly}", fmt(result.savings)).replace("{annual}", fmt(result.annualSavings))
                    : pt.standardSaves.replace("{monthly}", fmt(result.savings)).replace("{annual}", fmt(result.annualSavings))
                  }
                </p>
                {result.breakevenExpenses > 0 && result.simplifiedBetter && (
                  <p className="text-xs text-green-600 mt-2">
                    {pt.breakeven.replace("{amount}", fmt(result.breakevenExpenses))}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Simplified Only */}
          {taxMethod === "simplified" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">{pt.monthlyIncome}</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.income)}</p>
                <p className="text-xs text-muted mt-1">AZN</p>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                <p className="text-sm text-amber-600 mb-1">{pt.tax} ({result.simplifiedTier})</p>
                <p className="text-2xl font-bold text-amber-700">{fmt(result.simplifiedMonthly)}</p>
                <p className="text-xs text-amber-600 mt-1">AZN</p>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">{pt.netIncome}</p>
                <p className="text-2xl font-bold">{fmt(result.simplifiedNet)}</p>
                <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
              </div>
            </div>
          )}

          {/* Standard Only */}
          {taxMethod === "standard" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">{pt.monthlyProfit}</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.profit)}</p>
                <p className="text-xs text-muted mt-1">AZN ({fmt(result.income)} − {fmt(result.expenses)})</p>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                <p className="text-sm text-amber-600 mb-1">{pt.standard} (14%)</p>
                <p className="text-2xl font-bold text-amber-700">{fmt(result.standardMonthly)}</p>
                <p className="text-xs text-amber-600 mt-1">AZN</p>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">{pt.netIncome}</p>
                <p className="text-2xl font-bold">{fmt(result.standardNet)}</p>
                <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
              </div>
            </div>
          )}

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              {pt.annualCalc}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4">
                <p className="text-xs font-semibold text-muted mb-3 uppercase tracking-wide">{pt.simplifiedUpper}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted mb-1">{pt.annualIncome}</p>
                    <p className="text-sm font-bold text-foreground">{fmt(result.annualIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">{pt.annualTax}</p>
                    <p className="text-sm font-bold text-amber-700">{fmt(result.simplifiedAnnual)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">{pt.annualNet}</p>
                    <p className="text-sm font-bold text-primary">{fmt(result.simplifiedAnnualNet)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-xs font-semibold text-muted mb-3 uppercase tracking-wide">{pt.standardUpper}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted mb-1">{pt.annualIncome}</p>
                    <p className="text-sm font-bold text-foreground">{fmt(result.annualIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">{pt.annualTax}</p>
                    <p className="text-sm font-bold text-amber-700">{fmt(result.standardAnnual)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">{pt.annualNet}</p>
                    <p className="text-sm font-bold text-primary">{fmt(result.standardAnnualNet)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedComparison}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-3 px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide"></span>
                <span className="text-xs font-semibold text-muted uppercase tracking-wide text-center">{pt.simplifiedLabel}</span>
                <span className="text-xs font-semibold text-muted uppercase tracking-wide text-center">{pt.standardLabel}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">{pt.monthlyIncome}</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.income)}</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.income)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">{pt.expenses}</span>
                <span className="text-sm text-muted text-center">{pt.notDeducted}</span>
                <span className="text-sm font-medium text-foreground text-center">−{fmt(result.expenses)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">{pt.taxBase}</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.income)}</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.profit)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">{pt.taxRate}</span>
                <span className="text-sm font-medium text-foreground text-center">{result.simplifiedTier}</span>
                <span className="text-sm font-medium text-foreground text-center">14%</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">{pt.taxAmount}</span>
                <span className="text-sm font-bold text-amber-700 text-center">{fmt(result.simplifiedMonthly)}</span>
                <span className="text-sm font-bold text-amber-700 text-center">{fmt(result.standardMonthly)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.netIncome}</span>
                <span className="text-sm font-bold text-primary-dark text-center">{fmt(result.simplifiedNet)}</span>
                <span className="text-sm font-bold text-primary-dark text-center">{fmt(result.standardNet)}</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.taxBurdenComparison}</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{pt.simplifiedLabel}</span>
                  <span className="font-medium text-foreground">{fmt(result.simplifiedMonthly)} AZN ({result.simplifiedEffective.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${result.simplifiedEffective}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{pt.standardLabel}</span>
                  <span className="font-medium text-foreground">{fmt(result.standardMonthly)} AZN ({result.standardEffective.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${result.standardEffective}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.quickComparison}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-4 px-5 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-muted">{pt.monthlyIncomeCol}</span>
                <span className="text-xs font-semibold text-muted text-center">{pt.simplifiedLabel}</span>
                <span className="text-xs font-semibold text-muted text-center">{pt.standardLabel}</span>
                <span className="text-xs font-semibold text-muted text-center">{pt.beneficial}</span>
              </div>
              {[500, 1000, 2000, 3000, 5000, 8000].map((amount) => {
                const exp = parseFloat(monthlyExpenses) || 0;
                let simp: number;
                if (amount <= SIMPLIFIED_TIER1_LIMIT) {
                  simp = amount * SIMPLIFIED_TIER1_RATE;
                } else {
                  simp = SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE + (amount - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
                }
                const std = Math.max(0, amount - exp) * STANDARD_TAX_RATE;
                const isActive = Math.abs(amount - result.income) < 0.01;
                return (
                  <div key={amount} className={`grid grid-cols-4 px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <span className="text-sm font-medium text-foreground">{fmt(amount)} AZN</span>
                    <span className="text-sm text-amber-700 text-center">{fmt(simp)}</span>
                    <span className="text-sm text-orange-700 text-center">{fmt(std)}</span>
                    <span className="text-xs font-medium text-center text-green-700">
                      {simp <= std ? pt.simplifiedLabel : pt.standardLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.noteTitle}</span> {pt.noteText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏠</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
