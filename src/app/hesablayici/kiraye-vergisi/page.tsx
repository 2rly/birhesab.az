"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// Azərbaycan kirayə vergisi qaydaları (2024)
// Vergi Məcəlləsi, Maddə 101, 124

type LandlordType = "individual" | "legal";
type PropertyUsage = "residential" | "commercial";

const INDIVIDUAL_TAX_RATE = 0.10;
const LEGAL_TAX_RATE = 0.20;
const VAT_THRESHOLD = 200000; // AZN
const VAT_RATE = 0.18;
const SIMPLIFIED_TIER1_LIMIT = 2000;
const SIMPLIFIED_TIER1_RATE = 0.04;
const SIMPLIFIED_TIER2_RATE = 0.08;

function getPropertyTax(annualValue: number): number {
  return annualValue * 0.01;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Kirayə vergisi hesablayıcısı",
    description: "Kirayə gəlirindən ödəniləcək vergini hesablayın — sadələşdirilmiş və standart üsul müqayisəsi.",
    breadcrumbCategory: "Daşınmaz Əmlak",
    formulaTitle: "Kirayə gəlirindən vergi necə hesablanır?",
    formulaContent: `Fiziki şəxs — Sadələşdirilmiş vergi (kirayə gəlirindən):
• Aylıq 2000 AZN-dək: 4%
• Aylıq 2000+ AZN: 8%
Xərclər çıxılmır, verginin ödənişi sadədir.

Fiziki şəxs — Standart gəlir vergisi:
• Xalis gəlirdən (gəlir − xərclər) 10%
• Xərclərə daxildir: təmir, kommunal, amortizasiya, sığorta

Hüquqi şəxs:
• Mənfəət vergisi: xalis gəlirdən 20%
• ƏDV: illik dövriyyə 200 000+ AZN olduqda 18%

Əmlak vergisi (bütün mülkiyyətçilər):
• İllik, inventar dəyərindən ~1%

Hansı üsul sərfəlidir?
• Xərcləriniz azdırsa → sadələşdirilmiş (4–8%)
• Xərcləriniz çoxdursa (təmir, kommunal) → standart (10%, amma xərclər çıxılır)`,
    landlordStatus: "Mülkiyyətçinin statusu",
    individual: "Fiziki şəxs",
    individualDesc: "Sadələşdirilmiş və ya gəlir vergisi",
    legalEntity: "Hüquqi şəxs",
    legalEntityDesc: "Mənfəət vergisi + ƏDV",
    propertyUsage: "Əmlakın istifadə təyinatı",
    residential: "Yaşayış",
    commercial: "Kommersiya",
    taxMethod: "Vergitutma üsulu",
    simplified: "Sadələşdirilmiş",
    simplifiedDesc: "4–8% (xərclər çıxılmır)",
    standard: "Standart",
    standardDesc: "10% (xərclər çıxılır)",
    monthlyRent: "Aylıq kirayə haqqı (AZN)",
    monthlyExpenses: "Aylıq xərclər (AZN)",
    optional: "ixtiyari",
    expensesHint: "Təmir, kommunal, amortizasiya, sığorta və s.",
    monthlyRentLabel: "Aylıq kirayə",
    monthlyTax: "Aylıq vergi",
    netIncome: "Xalis gəlir",
    perMonth: "AZN / ay",
    annualCalc: "İllik hesablama",
    annualRentalIncome: "İllik kirayə gəliri",
    annualExpenses: "İllik xərclər",
    annualTax: "İllik vergi",
    annualNetIncome: "İllik xalis gəlir",
    methodComparison: "Üsul müqayisəsi — hansı sərfəlidir?",
    simplifiedTax: "Sadələşdirilmiş vergi",
    expensesNotDeducted: "xərclər çıxılmır",
    standardIncomeTax: "Standart gəlir vergisi",
    expensesDeducted: "xərclər çıxılır",
    simplifiedSaves: "Sadələşdirilmiş üsul {amount} AZN/il qənaət edir",
    standardSaves: "Standart üsul {amount} AZN/il qənaət edir",
    detailedCalc: "Ətraflı hesablama (aylıq)",
    rentalFee: "Kirayə haqqı",
    expenses: "Xərclər",
    taxes: "Vergilər",
    vat18: "ƏDV (18%)",
    propertyTax: "Əmlak vergisi (~1%/il)",
    totalMonthlyTax: "Cəmi aylıq vergi",
    netMonthlyIncome: "Xalis aylıq gəlir",
    incomeDistribution: "Kirayə gəlirinin bölgüsü",
    netLabel: "Xalis:",
    expensesLabel: "Xərclər:",
    taxLabel: "Vergi:",
    noteTitle: "Diqqət:",
    noteText: "Kirayə müqaviləsi notarial qaydada təsdiq olunmalı və vergi orqanında qeydiyyatdan keçirilməlidir. Qeydiyyatsız kirayə gəliri vergidən yayınma sayılır və cərimə tətbiq oluna bilər. Vergi bəyannaməsi hər il 31 marta qədər verilməlidir.",
    emptyState: "Nəticəni görmək üçün aylıq kirayə haqqını daxil edin.",
  },
  en: {
    title: "Rental tax calculator",
    description: "Calculate the tax on rental income — comparison of simplified and standard methods.",
    breadcrumbCategory: "Real Estate",
    formulaTitle: "How is rental income taxed?",
    formulaContent: `Individual — Simplified tax (on rental income):
• Monthly up to 2000 AZN: 4%
• Monthly 2000+ AZN: 8%
Expenses are not deducted, tax payment is simple.

Individual — Standard income tax:
• 10% of net income (income − expenses)
• Expenses include: repairs, utilities, depreciation, insurance

Legal entity:
• Profit tax: 20% of net income
• VAT: 18% when annual turnover exceeds 200,000 AZN

Property tax (all owners):
• Annual, ~1% of inventory value

Which method is more profitable?
• Low expenses → simplified (4–8%)
• High expenses (repairs, utilities) → standard (10%, but expenses deducted)`,
    landlordStatus: "Owner status",
    individual: "Individual",
    individualDesc: "Simplified or income tax",
    legalEntity: "Legal entity",
    legalEntityDesc: "Profit tax + VAT",
    propertyUsage: "Property usage",
    residential: "Residential",
    commercial: "Commercial",
    taxMethod: "Tax method",
    simplified: "Simplified",
    simplifiedDesc: "4–8% (expenses not deducted)",
    standard: "Standard",
    standardDesc: "10% (expenses deducted)",
    monthlyRent: "Monthly rent (AZN)",
    monthlyExpenses: "Monthly expenses (AZN)",
    optional: "optional",
    expensesHint: "Repairs, utilities, depreciation, insurance, etc.",
    monthlyRentLabel: "Monthly rent",
    monthlyTax: "Monthly tax",
    netIncome: "Net income",
    perMonth: "AZN / month",
    annualCalc: "Annual calculation",
    annualRentalIncome: "Annual rental income",
    annualExpenses: "Annual expenses",
    annualTax: "Annual tax",
    annualNetIncome: "Annual net income",
    methodComparison: "Method comparison — which is better?",
    simplifiedTax: "Simplified tax",
    expensesNotDeducted: "expenses not deducted",
    standardIncomeTax: "Standard income tax",
    expensesDeducted: "expenses deducted",
    simplifiedSaves: "Simplified method saves {amount} AZN/year",
    standardSaves: "Standard method saves {amount} AZN/year",
    detailedCalc: "Detailed calculation (monthly)",
    rentalFee: "Rental fee",
    expenses: "Expenses",
    taxes: "Taxes",
    vat18: "VAT (18%)",
    propertyTax: "Property tax (~1%/year)",
    totalMonthlyTax: "Total monthly tax",
    netMonthlyIncome: "Net monthly income",
    incomeDistribution: "Rental income distribution",
    netLabel: "Net:",
    expensesLabel: "Expenses:",
    taxLabel: "Tax:",
    noteTitle: "Note:",
    noteText: "The rental agreement must be notarized and registered with the tax authority. Unregistered rental income is considered tax evasion and may result in penalties. Tax declaration must be filed by March 31 each year.",
    emptyState: "Enter monthly rent to see the result.",
  },
  ru: {
    title: "Калькулятор налога на аренду",
    description: "Рассчитайте налог на доход от аренды — сравнение упрощённого и стандартного методов.",
    breadcrumbCategory: "Недвижимость",
    formulaTitle: "Как облагается налогом доход от аренды?",
    formulaContent: `Физическое лицо — Упрощённый налог (на доход от аренды):
• Ежемесячно до 2000 AZN: 4%
• Ежемесячно 2000+ AZN: 8%
Расходы не вычитаются, уплата налога проста.

Физическое лицо — Стандартный подоходный налог:
• 10% от чистого дохода (доход − расходы)
• Расходы включают: ремонт, коммунальные, амортизацию, страховку

Юридическое лицо:
• Налог на прибыль: 20% от чистого дохода
• НДС: 18% при годовом обороте свыше 200 000 AZN

Налог на имущество (все собственники):
• Годовой, ~1% от инвентарной стоимости

Какой метод выгоднее?
• Низкие расходы → упрощённый (4–8%)
• Высокие расходы (ремонт, коммунальные) → стандартный (10%, но расходы вычитаются)`,
    landlordStatus: "Статус собственника",
    individual: "Физическое лицо",
    individualDesc: "Упрощённый или подоходный налог",
    legalEntity: "Юридическое лицо",
    legalEntityDesc: "Налог на прибыль + НДС",
    propertyUsage: "Назначение имущества",
    residential: "Жилое",
    commercial: "Коммерческое",
    taxMethod: "Метод налогообложения",
    simplified: "Упрощённый",
    simplifiedDesc: "4–8% (расходы не вычитаются)",
    standard: "Стандартный",
    standardDesc: "10% (расходы вычитаются)",
    monthlyRent: "Ежемесячная арендная плата (AZN)",
    monthlyExpenses: "Ежемесячные расходы (AZN)",
    optional: "необязательно",
    expensesHint: "Ремонт, коммунальные, амортизация, страховка и т.д.",
    monthlyRentLabel: "Ежемесячная аренда",
    monthlyTax: "Ежемесячный налог",
    netIncome: "Чистый доход",
    perMonth: "AZN / мес.",
    annualCalc: "Годовой расчёт",
    annualRentalIncome: "Годовой доход от аренды",
    annualExpenses: "Годовые расходы",
    annualTax: "Годовой налог",
    annualNetIncome: "Годовой чистый доход",
    methodComparison: "Сравнение методов — что выгоднее?",
    simplifiedTax: "Упрощённый налог",
    expensesNotDeducted: "расходы не вычитаются",
    standardIncomeTax: "Стандартный подоходный налог",
    expensesDeducted: "расходы вычитаются",
    simplifiedSaves: "Упрощённый метод экономит {amount} AZN/год",
    standardSaves: "Стандартный метод экономит {amount} AZN/год",
    detailedCalc: "Подробный расчёт (ежемесячно)",
    rentalFee: "Арендная плата",
    expenses: "Расходы",
    taxes: "Налоги",
    vat18: "НДС (18%)",
    propertyTax: "Налог на имущество (~1%/год)",
    totalMonthlyTax: "Итого ежемесячный налог",
    netMonthlyIncome: "Чистый ежемесячный доход",
    incomeDistribution: "Распределение дохода от аренды",
    netLabel: "Чистый:",
    expensesLabel: "Расходы:",
    taxLabel: "Налог:",
    noteTitle: "Внимание:",
    noteText: "Договор аренды должен быть нотариально заверен и зарегистрирован в налоговом органе. Незарегистрированный доход от аренды считается уклонением от уплаты налогов и может повлечь штрафы. Налоговая декларация подаётся до 31 марта каждого года.",
    emptyState: "Введите ежемесячную арендную плату, чтобы увидеть результат.",
  },
};

export default function RentalTaxCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [monthlyRent, setMonthlyRent] = useState("");
  const [landlordType, setLandlordType] = useState<LandlordType>("individual");
  const [propertyUsage, setPropertyUsage] = useState<PropertyUsage>("residential");
  const [expenses, setExpenses] = useState("");
  const [useSimplified, setUseSimplified] = useState(true);

  const result = useMemo(() => {
    const rent = parseFloat(monthlyRent);
    if (!rent || rent <= 0) return null;

    const monthlyExpenses = parseFloat(expenses) || 0;
    const annualRent = rent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const annualNet = annualRent - annualExpenses;

    let incomeTax = 0;
    let taxMethod = "";
    let taxRate = 0;
    let vatAmount = 0;
    let simplifiedTax = 0;
    let standardTax = 0;

    if (landlordType === "individual") {
      if (rent <= SIMPLIFIED_TIER1_LIMIT) {
        simplifiedTax = rent * SIMPLIFIED_TIER1_RATE;
      } else {
        simplifiedTax = SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE + (rent - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
      }

      standardTax = Math.max(0, annualNet) * INDIVIDUAL_TAX_RATE / 12;

      if (useSimplified) {
        incomeTax = simplifiedTax;
        taxMethod = pt.simplifiedTax;
        taxRate = rent <= SIMPLIFIED_TIER1_LIMIT ? SIMPLIFIED_TIER1_RATE : SIMPLIFIED_TIER2_RATE;
      } else {
        incomeTax = standardTax;
        taxMethod = pt.standardIncomeTax + " (10%)";
        taxRate = INDIVIDUAL_TAX_RATE;
      }
    } else {
      incomeTax = Math.max(0, annualNet) * LEGAL_TAX_RATE / 12;
      taxMethod = lang === "az" ? "Mənfəət vergisi (20%)" : lang === "en" ? "Profit tax (20%)" : "Налог на прибыль (20%)";
      taxRate = LEGAL_TAX_RATE;

      if (annualRent >= VAT_THRESHOLD) {
        vatAmount = rent * VAT_RATE;
      }
    }

    const propertyTax = getPropertyTax(annualRent) / 12;
    const totalMonthlyTax = incomeTax + vatAmount + propertyTax;
    const netIncome = rent - monthlyExpenses - totalMonthlyTax;
    const effectiveTaxRate = rent > 0 ? (totalMonthlyTax / rent) * 100 : 0;

    return {
      monthlyRent: rent,
      annualRent,
      monthlyExpenses,
      annualExpenses,
      annualNet,
      incomeTax,
      taxMethod,
      taxRate,
      vatAmount,
      propertyTax,
      totalMonthlyTax,
      totalAnnualTax: totalMonthlyTax * 12,
      netIncome,
      annualNetIncome: netIncome * 12,
      effectiveTaxRate,
      simplifiedTax,
      standardTax,
    };
  }, [monthlyRent, landlordType, propertyUsage, expenses, useSimplified, pt, lang]);

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
      relatedIds={["rental-income-tax", "property-tax", "deposit", "mortgage"]}
    >
      {/* Landlord Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.landlordStatus}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLandlordType("individual")}
            className={`p-4 rounded-xl border text-left transition-all ${
              landlordType === "individual"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">👤</span>
            <p className="text-sm font-medium text-foreground">{pt.individual}</p>
            <p className="text-xs text-muted mt-1">{pt.individualDesc}</p>
          </button>
          <button
            onClick={() => setLandlordType("legal")}
            className={`p-4 rounded-xl border text-left transition-all ${
              landlordType === "legal"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏢</span>
            <p className="text-sm font-medium text-foreground">{pt.legalEntity}</p>
            <p className="text-xs text-muted mt-1">{pt.legalEntityDesc}</p>
          </button>
        </div>
      </div>

      {/* Property Usage */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.propertyUsage}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPropertyUsage("residential")}
            className={`p-3 rounded-xl border text-center transition-all ${
              propertyUsage === "residential"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-xl block mb-1">🏠</span>
            <p className="text-xs font-medium text-foreground">{pt.residential}</p>
          </button>
          <button
            onClick={() => setPropertyUsage("commercial")}
            className={`p-3 rounded-xl border text-center transition-all ${
              propertyUsage === "commercial"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-xl block mb-1">🏪</span>
            <p className="text-xs font-medium text-foreground">{pt.commercial}</p>
          </button>
        </div>
      </div>

      {/* Tax Method (individual only) */}
      {landlordType === "individual" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">{pt.taxMethod}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUseSimplified(true)}
              className={`p-4 rounded-xl border text-left transition-all ${
                useSimplified
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{pt.simplified}</p>
              <p className="text-xs text-muted mt-1">{pt.simplifiedDesc}</p>
            </button>
            <button
              onClick={() => setUseSimplified(false)}
              className={`p-4 rounded-xl border text-left transition-all ${
                !useSimplified
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{pt.standard}</p>
              <p className="text-xs text-muted mt-1">{pt.standardDesc}</p>
            </button>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 {pt.monthlyRent}
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            placeholder="800"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[500, 800, 1200, 2000, 3500].map((v) => (
              <button
                key={v}
                onClick={() => setMonthlyRent(String(v))}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🔧 {pt.monthlyExpenses} <span className="text-muted font-normal">— {pt.optional}</span>
          </label>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
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
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.monthlyRentLabel}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.monthlyRent)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.monthlyTax}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalMonthlyTax)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN ({result.effectiveTaxRate.toFixed(1)}%)</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netIncome}</p>
              <p className="text-2xl font-bold">{fmt(result.netIncome)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              {pt.annualCalc}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualRentalIncome}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualRent)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualExpenses}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualExpenses)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualTax}</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.totalAnnualTax)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualNetIncome}</p>
                <p className="text-lg font-bold text-primary">{fmt(result.annualNetIncome)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
            </div>
          </div>

          {/* Method Comparison (individual only) */}
          {landlordType === "individual" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>⚖️</span>
                  {pt.methodComparison}
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className={`flex items-center justify-between px-5 py-4 ${useSimplified ? "bg-green-50" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{pt.simplifiedTax}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {result.monthlyRent <= SIMPLIFIED_TIER1_LIMIT ? "4%" : "4% + 8%"} — {pt.expensesNotDeducted}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{fmt(result.simplifiedTax)} AZN/ay</p>
                    <p className="text-xs text-muted">{fmt(result.simplifiedTax * 12)} AZN/il</p>
                  </div>
                </div>
                <div className={`flex items-center justify-between px-5 py-4 ${!useSimplified ? "bg-green-50" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{pt.standardIncomeTax}</p>
                    <p className="text-xs text-muted mt-0.5">10% — {pt.expensesDeducted}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{fmt(result.standardTax)} AZN/ay</p>
                    <p className="text-xs text-muted">{fmt(result.standardTax * 12)} AZN/il</p>
                  </div>
                </div>
                <div className="px-5 py-3 bg-green-50">
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <span>💡</span>
                    {result.simplifiedTax <= result.standardTax
                      ? pt.simplifiedSaves.replace("{amount}", fmt(Math.abs(result.standardTax - result.simplifiedTax) * 12))
                      : pt.standardSaves.replace("{amount}", fmt(Math.abs(result.simplifiedTax - result.standardTax) * 12))
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedCalc}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.rentalFee}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.monthlyRent)} AZN</span>
              </div>
              {result.monthlyExpenses > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.expenses}</span>
                  <span className="text-sm font-medium text-red-600">−{fmt(result.monthlyExpenses)} AZN</span>
                </div>
              )}

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">{pt.taxes}</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-muted">{result.taxMethod}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{fmt(result.incomeTax)} AZN</span>
              </div>

              {result.vatAmount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.vat18}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.propertyTax}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.propertyTax)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">{pt.totalMonthlyTax}</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.totalMonthlyTax)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.netMonthlyIncome}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.netIncome)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.incomeDistribution}</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${(Math.max(0, result.netIncome) / result.monthlyRent) * 100}%` }}
                title={pt.netIncome}
              />
              {result.monthlyExpenses > 0 && (
                <div
                  className="h-full bg-gray-400"
                  style={{ width: `${(result.monthlyExpenses / result.monthlyRent) * 100}%` }}
                  title={pt.expenses}
                />
              )}
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.incomeTax / result.monthlyRent) * 100}%` }}
                title={pt.taxes}
              />
              {result.vatAmount > 0 && (
                <div
                  className="h-full bg-orange-400"
                  style={{ width: `${(result.vatAmount / result.monthlyRent) * 100}%` }}
                  title={pt.vat18}
                />
              )}
              <div
                className="h-full bg-red-300"
                style={{ width: `${(result.propertyTax / result.monthlyRent) * 100}%` }}
                title={pt.propertyTax}
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                {pt.netLabel} {fmt(result.netIncome)} ({((Math.max(0, result.netIncome) / result.monthlyRent) * 100).toFixed(0)}%)
              </span>
              {result.monthlyExpenses > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
                  {pt.expensesLabel} {fmt(result.monthlyExpenses)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                {pt.taxLabel} {fmt(result.incomeTax)}
              </span>
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
          <span className="text-4xl block mb-3">🏘️</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
