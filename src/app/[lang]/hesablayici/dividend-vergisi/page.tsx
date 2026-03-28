"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

type RecipientType = "individual" | "legal";

const DIVIDEND_TAX_RATE = 0.05; // 5% for both

const pageTranslations = {
  az: {
    title: "Dividend vergisi hesablayıcısı",
    description: "Dividend gəlirindən tutulacaq vergini hesablayın — fiziki və hüquqi şəxslər üçün.",
    breadcrumbCategory: "Maliyyə",
    breadcrumbTitle: "Dividend vergisi hesablayıcısı",
    formulaTitle: "Dividend vergisi necə hesablanır?",
    formulaContent: `Azərbaycanda dividend gəliri vergisi (Vergi Məcəlləsi, Maddə 123):

Fiziki şəxslər:
• Dividend gəlirindən 5% vergi tutulur
• Vergi ödəmə mənbəyində (şirkət tərəfindən) tutulur
• Əlavə bəyannamə tələb olunmur

Hüquqi şəxslər:
• Dividend gəlirindən 5% vergi tutulur
• Şirkət tərəfindən ödəmə mənbəyində tutulur

Hesablama:
Vergi məbləği = Ümumi dividend × 5%
Xalis dividend = Ümumi dividend − Vergi məbləği

Nümunə:
10 000 AZN dividend → 500 AZN vergi → 9 500 AZN xalis
Qeyd: Dividend vergisi mənfəət vergisindən sonra hesablanır (ikili vergitutma yoxdur).`,
    recipientStatus: "Alıcının statusu",
    individual: "Fiziki şəxs",
    individualTaxRate: "Dividend vergisi: 5%",
    legalEntity: "Hüquqi şəxs",
    legalTaxRate: "Dividend vergisi: 5%",
    paymentFrequency: "Ödəniş tezliyi",
    monthly: "Aylıq",
    quarterly: "Rüblük",
    annual: "İllik",
    periodMonthly: "aylıq",
    periodQuarterly: "rüblük",
    periodAnnual: "illik",
    grossDividendAmount: "Ümumi dividend məbləği (AZN)",
    grossDividend: "Ümumi dividend",
    tax5: "Vergi (5%)",
    netDividend: "Xalis dividend",
    annualCalcTitle: "İllik hesablama",
    annualPayment: "ödəniş",
    annualGrossDividend: "İllik ümumi dividend",
    annualTax: "İllik vergi",
    annualNetIncome: "İllik xalis gəlir",
    detailedCalcTitle: "Ətraflı hesablama",
    grossDividendLabel: "Ümumi dividend məbləği",
    recipientStatusLabel: "Alıcı statusu",
    taxRate: "Vergi dərəcəsi",
    taxAmount: "Vergi məbləği",
    netDividendLabel: "Xalis dividend",
    dividendBreakdown: "Dividendin bölgüsü",
    netLabel: "Xalis",
    taxLabel: "Vergi",
    quickComparisonTitle: "Sürətli müqayisə — müxtəlif məbləğlər",
    note: "Qeyd:",
    noteText: "Dividend vergisi ödəmə mənbəyində tutulur — yəni şirkət dividendi ödəyərkən vergini avtomatik tutur və dövlət büdcəsinə köçürür. Dividend alan şəxsin əlavə bəyannamə verməsinə ehtiyac yoxdur. Dividend mənfəət vergisi ödənildikdən sonra qalan xalis mənfəətdən ödənilir.",
    emptyStateText: "Nəticəni görmək üçün dividend məbləğini daxil edin.",
  },
  en: {
    title: "Dividend tax calculator",
    description: "Calculate the tax on dividend income — for individuals and legal entities.",
    breadcrumbCategory: "Finance",
    breadcrumbTitle: "Dividend tax calculator",
    formulaTitle: "How is dividend tax calculated?",
    formulaContent: `Dividend income tax in Azerbaijan (Tax Code, Article 123):

Individuals:
• 5% tax is deducted from dividend income
• Tax is withheld at source (by the company)
• No additional declaration required

Legal entities:
• 5% tax is deducted from dividend income
• Withheld at source by the company

Calculation:
Tax amount = Gross dividend x 5%
Net dividend = Gross dividend - Tax amount

Example:
10,000 AZN dividend -> 500 AZN tax -> 9,500 AZN net
Note: Dividend tax is calculated after corporate income tax (no double taxation).`,
    recipientStatus: "Recipient status",
    individual: "Individual",
    individualTaxRate: "Dividend tax: 5%",
    legalEntity: "Legal entity",
    legalTaxRate: "Dividend tax: 5%",
    paymentFrequency: "Payment frequency",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annual: "Annual",
    periodMonthly: "monthly",
    periodQuarterly: "quarterly",
    periodAnnual: "annual",
    grossDividendAmount: "Gross dividend amount (AZN)",
    grossDividend: "Gross dividend",
    tax5: "Tax (5%)",
    netDividend: "Net dividend",
    annualCalcTitle: "Annual calculation",
    annualPayment: "payment",
    annualGrossDividend: "Annual gross dividend",
    annualTax: "Annual tax",
    annualNetIncome: "Annual net income",
    detailedCalcTitle: "Detailed calculation",
    grossDividendLabel: "Gross dividend amount",
    recipientStatusLabel: "Recipient status",
    taxRate: "Tax rate",
    taxAmount: "Tax amount",
    netDividendLabel: "Net dividend",
    dividendBreakdown: "Dividend breakdown",
    netLabel: "Net",
    taxLabel: "Tax",
    quickComparisonTitle: "Quick comparison — various amounts",
    note: "Note:",
    noteText: "Dividend tax is withheld at source — the company automatically deducts the tax when paying dividends and transfers it to the state budget. The dividend recipient does not need to file an additional declaration. Dividends are paid from net profit remaining after corporate income tax.",
    emptyStateText: "Enter a dividend amount to see the result.",
  },
  ru: {
    title: "Калькулятор налога на дивиденды",
    description: "Рассчитайте налог на дивидендный доход — для физических и юридических лиц.",
    breadcrumbCategory: "Финансы",
    breadcrumbTitle: "Калькулятор налога на дивиденды",
    formulaTitle: "Как рассчитывается налог на дивиденды?",
    formulaContent: `Налог на дивидендный доход в Азербайджане (Налоговый кодекс, Статья 123):

Физические лица:
• С дивидендного дохода удерживается 5% налога
• Налог удерживается у источника выплаты (компанией)
• Дополнительная декларация не требуется

Юридические лица:
• С дивидендного дохода удерживается 5% налога
• Удерживается у источника выплаты компанией

Расчёт:
Сумма налога = Валовые дивиденды × 5%
Чистые дивиденды = Валовые дивиденды − Сумма налога

Пример:
10 000 AZN дивиденды → 500 AZN налог → 9 500 AZN чистыми
Примечание: Налог на дивиденды рассчитывается после налога на прибыль (двойного налогообложения нет).`,
    recipientStatus: "Статус получателя",
    individual: "Физическое лицо",
    individualTaxRate: "Налог на дивиденды: 5%",
    legalEntity: "Юридическое лицо",
    legalTaxRate: "Налог на дивиденды: 5%",
    paymentFrequency: "Частота выплат",
    monthly: "Ежемесячно",
    quarterly: "Ежеквартально",
    annual: "Ежегодно",
    periodMonthly: "ежемесячная",
    periodQuarterly: "ежеквартальная",
    periodAnnual: "ежегодная",
    grossDividendAmount: "Сумма валовых дивидендов (AZN)",
    grossDividend: "Валовые дивиденды",
    tax5: "Налог (5%)",
    netDividend: "Чистые дивиденды",
    annualCalcTitle: "Годовой расчёт",
    annualPayment: "выплата",
    annualGrossDividend: "Годовые валовые дивиденды",
    annualTax: "Годовой налог",
    annualNetIncome: "Годовой чистый доход",
    detailedCalcTitle: "Подробный расчёт",
    grossDividendLabel: "Сумма валовых дивидендов",
    recipientStatusLabel: "Статус получателя",
    taxRate: "Налоговая ставка",
    taxAmount: "Сумма налога",
    netDividendLabel: "Чистые дивиденды",
    dividendBreakdown: "Распределение дивидендов",
    netLabel: "Чистые",
    taxLabel: "Налог",
    quickComparisonTitle: "Быстрое сравнение — различные суммы",
    note: "Примечание:",
    noteText: "Налог на дивиденды удерживается у источника выплаты — компания автоматически удерживает налог при выплате дивидендов и перечисляет его в государственный бюджет. Получателю дивидендов не нужно подавать дополнительную декларацию. Дивиденды выплачиваются из чистой прибыли, оставшейся после уплаты налога на прибыль.",
    emptyStateText: "Введите сумму дивидендов, чтобы увидеть результат.",
  },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function DividendTaxCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [grossDividend, setGrossDividend] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("individual");
  const [frequency, setFrequency] = useState<"monthly" | "quarterly" | "annual">("annual");

  const frequencyOptions = [
    { value: "monthly" as const, label: pt.monthly },
    { value: "quarterly" as const, label: pt.quarterly },
    { value: "annual" as const, label: pt.annual },
  ];

  const result = useMemo(() => {
    const gross = parseFloat(grossDividend);
    if (!gross || gross <= 0) return null;

    const taxRate = DIVIDEND_TAX_RATE;
    const taxAmount = gross * taxRate;
    const netDividend = gross - taxAmount;

    let annualGross: number;
    let periodsPerYear: number;
    let periodLabel: string;

    switch (frequency) {
      case "monthly":
        annualGross = gross * 12;
        periodsPerYear = 12;
        periodLabel = pt.periodMonthly;
        break;
      case "quarterly":
        annualGross = gross * 4;
        periodsPerYear = 4;
        periodLabel = pt.periodQuarterly;
        break;
      default:
        annualGross = gross;
        periodsPerYear = 1;
        periodLabel = pt.periodAnnual;
    }

    const annualTax = annualGross * taxRate;
    const annualNet = annualGross - annualTax;

    return {
      gross,
      taxRate,
      taxAmount,
      netDividend,
      annualGross,
      annualTax,
      annualNet,
      periodsPerYear,
      periodLabel,
      effectiveTaxRate: (taxAmount / gross) * 100,
    };
  }, [grossDividend, recipientType, frequency, pt.periodMonthly, pt.periodQuarterly, pt.periodAnnual]);

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
      relatedIds={["salary", "freelancer-tax", "vat", "deposit"]}
    >
      {/* Recipient Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.recipientStatus}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRecipientType("individual")}
            className={`p-4 rounded-xl border text-left transition-all ${
              recipientType === "individual"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">👤</span>
            <p className="text-sm font-medium text-foreground">{pt.individual}</p>
            <p className="text-xs text-muted mt-1">{pt.individualTaxRate}</p>
          </button>
          <button
            onClick={() => setRecipientType("legal")}
            className={`p-4 rounded-xl border text-left transition-all ${
              recipientType === "legal"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏢</span>
            <p className="text-sm font-medium text-foreground">{pt.legalEntity}</p>
            <p className="text-xs text-muted mt-1">{pt.legalTaxRate}</p>
          </button>
        </div>
      </div>

      {/* Frequency */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.paymentFrequency}</label>
        <div className="flex rounded-xl border border-border overflow-hidden">
          {frequencyOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFrequency(f.value)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                frequency === f.value
                  ? "bg-primary text-white"
                  : "bg-white text-muted hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          💰 {pt.grossDividendAmount}
        </label>
        <input
          type="number"
          value={grossDividend}
          onChange={(e) => setGrossDividend(e.target.value)}
          placeholder="10000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[1000, 5000, 10000, 25000, 50000].map((v) => (
            <button
              key={v}
              onClick={() => setGrossDividend(String(v))}
              className="px-2.5 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              {v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.grossDividend}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.gross)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.tax5}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.taxAmount)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netDividend}</p>
              <p className="text-2xl font-bold">{fmt(result.netDividend)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              {pt.annualCalcTitle} ({result.periodLabel} {pt.annualPayment})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualGrossDividend}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualGross)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualTax}</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.annualTax)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualNetIncome}</p>
                <p className="text-lg font-bold text-primary">{fmt(result.annualNet)}</p>
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
                <span className="text-sm text-muted">{pt.grossDividendLabel}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.gross)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.recipientStatusLabel}</span>
                <span className="text-sm font-medium text-foreground">
                  {recipientType === "individual" ? pt.individual : pt.legalEntity}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.taxRate}</span>
                <span className="text-sm font-medium text-foreground">5%</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">{pt.taxAmount}</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.taxAmount)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.netDividendLabel}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.netDividend)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.dividendBreakdown}</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${(result.netDividend / result.gross) * 100}%` }}
                title={pt.netDividend}
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.taxAmount / result.gross) * 100}%` }}
                title={pt.taxLabel}
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                {pt.netLabel}: {fmt(result.netDividend)} AZN ({((result.netDividend / result.gross) * 100).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                {pt.taxLabel}: {fmt(result.taxAmount)} AZN ({((result.taxAmount / result.gross) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Quick Reference Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.quickComparisonTitle}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[1000, 5000, 10000, 25000, 50000, 100000].map((amount) => {
                const tax = amount * DIVIDEND_TAX_RATE;
                const net = amount - tax;
                const isActive = Math.abs(amount - result.gross) < 0.01;
                return (
                  <div key={amount} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <span className="text-sm font-medium text-foreground">{fmt(amount)} AZN</span>
                    <div className="flex gap-6 text-sm">
                      <span className="text-muted">{pt.taxLabel}: <span className="font-medium text-amber-700">{fmt(tax)}</span></span>
                      <span className="text-muted">{pt.netLabel}: <span className="font-medium text-primary">{fmt(net)}</span></span>
                    </div>
                  </div>
                );
              })}
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
          <span className="text-4xl block mb-3">💹</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
