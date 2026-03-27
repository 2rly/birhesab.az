"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type TransactionType = "sale" | "power-of-attorney" | "will" | "lease" | "company";

const transactionTypesTranslations: Record<Lang, { value: TransactionType; label: string; icon: string; description: string }[]> = {
  az: [
    { value: "sale", label: "Alqı-satqı", icon: "🏠", description: "Alqı-satqı müqaviləsi" },
    { value: "power-of-attorney", label: "Etibarnamə", icon: "📝", description: "Etibarnamə təsdiqi" },
    { value: "will", label: "Vəsiyyətnamə", icon: "📜", description: "Vəsiyyətnamə təsdiqi" },
    { value: "lease", label: "İcarə", icon: "🔑", description: "İcarə müqaviləsi" },
    { value: "company", label: "Şirkət təsis", icon: "🏢", description: "Şirkət təsis sənədləri" },
  ],
  en: [
    { value: "sale", label: "Sale", icon: "🏠", description: "Sale agreement" },
    { value: "power-of-attorney", label: "Power of Attorney", icon: "📝", description: "Power of attorney certification" },
    { value: "will", label: "Will", icon: "📜", description: "Will certification" },
    { value: "lease", label: "Lease", icon: "🔑", description: "Lease agreement" },
    { value: "company", label: "Company formation", icon: "🏢", description: "Company formation documents" },
  ],
  ru: [
    { value: "sale", label: "Купля-продажа", icon: "🏠", description: "Договор купли-продажи" },
    { value: "power-of-attorney", label: "Доверенность", icon: "📝", description: "Удостоверение доверенности" },
    { value: "will", label: "Завещание", icon: "📜", description: "Удостоверение завещания" },
    { value: "lease", label: "Аренда", icon: "🔑", description: "Договор аренды" },
    { value: "company", label: "Учреждение компании", icon: "🏢", description: "Учредительные документы" },
  ],
};

const pageTranslations = {
  az: {
    title: "Notarius xərcləri hesablayıcısı",
    description: "Azərbaycanda notarius xidmətlərinin rüsum və xərclərini hesablayın.",
    breadcrumbCategory: "Daşınmaz Əmlak",
    breadcrumbLabel: "Notarius xərcləri",
    formulaTitle: "Notarius xərcləri necə hesablanır?",
    formulaContent: `Alqı-satqı müqaviləsi:
• 10 000 AZN-dək: 0.5% + 15 AZN
• 10 001–50 000 AZN: 50 + 0.3% (10K-dən artıq hissə)
• 50 001–100 000 AZN: 170 + 0.2% (50K-dən artıq hissə)
• 100 000+ AZN: 270 + 0.1% (100K-dən artıq hissə)

Etibarnamə:
• Sadə etibarnamə: 20 AZN
• Ümumi etibarnamə: 50 AZN

Vəsiyyətnamə: 30 AZN

İcarə müqaviləsi:
• 5 000 AZN-dək: 0.5% + 10 AZN
• 5 001–20 000 AZN: 35 + 0.3%
• 20 000+ AZN: 80 + 0.2%

Şirkət təsis sənədləri:
• 100 AZN + nizamnamə kapitalından 0.5% (10K-dək)
• 10K+ üzərindən: 150 + 0.3%`,
    transactionType: "Əməliyyat növü",
    propertyPrice: "Əmlakın qiyməti (AZN)",
    poaType: "Etibarnamə növü",
    simplePoa: "Sadə etibarnamə",
    generalPoa: "Ümumi etibarnamə",
    monthlyRent: "Aylıq icarə haqqı (AZN)",
    leaseDuration: "Müddət (ay)",
    charterCapital: "Nizamnamə kapitalı (AZN)",
    notaryFee: "Notarius rüsumu",
    propertyPriceResult: "Əmlak qiyməti",
    totalRent: "Ümumi icarə məbləği",
    charterCapitalResult: "Nizamnamə kapitalı",
    poaTypeResult: "Etibarnamə növü",
    fixedFee: "Sabit rüsum",
    documentType: "Sənəd növü",
    willLabel: "Vəsiyyətnamə",
    detailedCalc: "Ətraflı hesablama",
    transactionTypeLabel: "Əməliyyat növü",
    appliedTariff: "Tətbiq olunan tarif",
    monthlyRentResult: "Aylıq icarə",
    durationResult: "Müddət",
    months: "ay",
    tariffComparison: "Tarif pilləsi müqayisəsi",
    infoNote: "Bu hesablama Notariat haqqında Azərbaycan Respublikasının Qanununa əsaslanır. Faktiki xərclər notariat kontoruna və əlavə xidmətlərə (surətçıxarma, tərcümə və s.) görə fərqlənə bilər. Dəqiq məlumat üçün notariusa müraciət edin.",
    attention: "Diqqət:",
    emptyState: "Nəticəni görmək üçün lazımi məlumatları daxil edin.",
  },
  en: {
    title: "Notary Fee Calculator",
    description: "Calculate notary service fees and costs in Azerbaijan.",
    breadcrumbCategory: "Real Estate",
    breadcrumbLabel: "Notary fees",
    formulaTitle: "How are notary fees calculated?",
    formulaContent: `Sale agreement:
• Up to 10,000 AZN: 0.5% + 15 AZN
• 10,001–50,000 AZN: 50 + 0.3% (excess over 10K)
• 50,001–100,000 AZN: 170 + 0.2% (excess over 50K)
• 100,000+ AZN: 270 + 0.1% (excess over 100K)

Power of Attorney:
• Simple: 20 AZN
• General: 50 AZN

Will: 30 AZN

Lease agreement:
• Up to 5,000 AZN: 0.5% + 10 AZN
• 5,001–20,000 AZN: 35 + 0.3%
• 20,000+ AZN: 80 + 0.2%

Company formation documents:
• 100 AZN + 0.5% of charter capital (up to 10K)
• Over 10K: 150 + 0.3%`,
    transactionType: "Transaction type",
    propertyPrice: "Property price (AZN)",
    poaType: "Power of attorney type",
    simplePoa: "Simple power of attorney",
    generalPoa: "General power of attorney",
    monthlyRent: "Monthly rent (AZN)",
    leaseDuration: "Duration (months)",
    charterCapital: "Charter capital (AZN)",
    notaryFee: "Notary fee",
    propertyPriceResult: "Property price",
    totalRent: "Total rent amount",
    charterCapitalResult: "Charter capital",
    poaTypeResult: "Power of attorney type",
    fixedFee: "Fixed fee",
    documentType: "Document type",
    willLabel: "Will",
    detailedCalc: "Detailed calculation",
    transactionTypeLabel: "Transaction type",
    appliedTariff: "Applied tariff",
    monthlyRentResult: "Monthly rent",
    durationResult: "Duration",
    months: "months",
    tariffComparison: "Tariff tier comparison",
    infoNote: "This calculation is based on the Law on Notaries of the Republic of Azerbaijan. Actual costs may vary depending on the notary office and additional services (copies, translation, etc.). Contact a notary for exact information.",
    attention: "Note:",
    emptyState: "Enter the required information to see the result.",
  },
  ru: {
    title: "Калькулятор нотариальных расходов",
    description: "Рассчитайте нотариальные пошлины и расходы в Азербайджане.",
    breadcrumbCategory: "Недвижимость",
    breadcrumbLabel: "Нотариальные расходы",
    formulaTitle: "Как рассчитываются нотариальные расходы?",
    formulaContent: `Договор купли-продажи:
• До 10 000 AZN: 0.5% + 15 AZN
• 10 001–50 000 AZN: 50 + 0.3% (превышение над 10K)
• 50 001–100 000 AZN: 170 + 0.2% (превышение над 50K)
• 100 000+ AZN: 270 + 0.1% (превышение над 100K)

Доверенность:
• Простая: 20 AZN
• Генеральная: 50 AZN

Завещание: 30 AZN

Договор аренды:
• До 5 000 AZN: 0.5% + 10 AZN
• 5 001–20 000 AZN: 35 + 0.3%
• 20 000+ AZN: 80 + 0.2%

Учредительные документы:
• 100 AZN + 0.5% уставного капитала (до 10K)
• Свыше 10K: 150 + 0.3%`,
    transactionType: "Вид операции",
    propertyPrice: "Цена имущества (AZN)",
    poaType: "Вид доверенности",
    simplePoa: "Простая доверенность",
    generalPoa: "Генеральная доверенность",
    monthlyRent: "Ежемесячная арендная плата (AZN)",
    leaseDuration: "Срок (месяцев)",
    charterCapital: "Уставный капитал (AZN)",
    notaryFee: "Нотариальная пошлина",
    propertyPriceResult: "Цена имущества",
    totalRent: "Общая сумма аренды",
    charterCapitalResult: "Уставный капитал",
    poaTypeResult: "Вид доверенности",
    fixedFee: "Фиксированная пошлина",
    documentType: "Тип документа",
    willLabel: "Завещание",
    detailedCalc: "Подробный расчёт",
    transactionTypeLabel: "Вид операции",
    appliedTariff: "Применённый тариф",
    monthlyRentResult: "Ежемесячная аренда",
    durationResult: "Срок",
    months: "мес.",
    tariffComparison: "Сравнение тарифных ступеней",
    infoNote: "Этот расчёт основан на Законе о нотариате Азербайджанской Республики. Фактические расходы могут отличаться в зависимости от нотариальной конторы и дополнительных услуг (копирование, перевод и т.д.). Обратитесь к нотариусу за точной информацией.",
    attention: "Внимание:",
    emptyState: "Введите необходимые данные, чтобы увидеть результат.",
  },
};

// Notarius rüsumları
function getSaleFee(price: number): number {
  if (price <= 10000) return price * 0.005 + 15;
  if (price <= 50000) return 50 + (price - 10000) * 0.003;
  if (price <= 100000) return 170 + (price - 50000) * 0.002;
  return 270 + (price - 100000) * 0.001;
}

function getPowerOfAttorneyFee(type: "simple" | "general"): number {
  return type === "simple" ? 20 : 50;
}

function getWillFee(): number {
  return 30;
}

function getLeaseFee(monthlyRent: number, months: number): number {
  const totalRent = monthlyRent * months;
  if (totalRent <= 5000) return totalRent * 0.005 + 10;
  if (totalRent <= 20000) return 35 + (totalRent - 5000) * 0.003;
  return 80 + (totalRent - 20000) * 0.002;
}

function getCompanyFee(capitalAmount: number): number {
  const baseFee = 100;
  if (capitalAmount <= 10000) return baseFee + capitalAmount * 0.005;
  return baseFee + 50 + (capitalAmount - 10000) * 0.003;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function NotaryFeeCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const transactionTypes = transactionTypesTranslations[lang];

  const [transactionType, setTransactionType] = useState<TransactionType>("sale");
  const [salePrice, setSalePrice] = useState("");
  const [poaType, setPoaType] = useState<"simple" | "general">("simple");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [leaseMonths, setLeaseMonths] = useState("12");
  const [capitalAmount, setCapitalAmount] = useState("");

  const result = useMemo(() => {
    switch (transactionType) {
      case "sale": {
        const price = parseFloat(salePrice);
        if (!price || price <= 0) return null;
        const fee = getSaleFee(price);
        let bracket = "";
        if (price <= 10000) bracket = "0.5% + 15 AZN";
        else if (price <= 50000) bracket = "50 + 0.3% (10K+)";
        else if (price <= 100000) bracket = "170 + 0.2% (50K+)";
        else bracket = "270 + 0.1% (100K+)";
        return {
          type: "sale" as const,
          fee,
          baseAmount: price,
          bracket,
          percentage: (fee / price) * 100,
        };
      }
      case "power-of-attorney": {
        const fee = getPowerOfAttorneyFee(poaType);
        return {
          type: "poa" as const,
          fee,
          poaType,
          label: poaType === "simple" ? pt.simplePoa : pt.generalPoa,
        };
      }
      case "will": {
        const fee = getWillFee();
        return { type: "will" as const, fee };
      }
      case "lease": {
        const rent = parseFloat(monthlyRent);
        const months = parseInt(leaseMonths);
        if (!rent || rent <= 0 || !months || months <= 0) return null;
        const totalRent = rent * months;
        const fee = getLeaseFee(rent, months);
        return {
          type: "lease" as const,
          fee,
          monthlyRent: rent,
          months,
          totalRent,
          percentage: (fee / totalRent) * 100,
        };
      }
      case "company": {
        const capital = parseFloat(capitalAmount);
        if (!capital || capital <= 0) return null;
        const fee = getCompanyFee(capital);
        return {
          type: "company" as const,
          fee,
          capital,
          percentage: (fee / capital) * 100,
        };
      }
      default:
        return null;
    }
  }, [transactionType, salePrice, poaType, monthlyRent, leaseMonths, capitalAmount, pt]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=realestate" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["property-tax", "rental-tax", "court-fee", "price-per-sqm"]}
    >
      {/* Transaction Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.transactionType}</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {transactionTypes.map((tt) => (
            <button
              key={tt.value}
              onClick={() => setTransactionType(tt.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                transactionType === tt.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{tt.icon}</span>
              <p className="text-xs font-medium text-foreground">{tt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Inputs */}
      <div className="space-y-4 mb-8">
        {transactionType === "sale" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 {pt.propertyPrice}
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="80000"
              min="0"
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        )}

        {transactionType === "power-of-attorney" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">{pt.poaType}</label>
            <div className="grid grid-cols-2 gap-3 sm:w-1/2">
              <button
                onClick={() => setPoaType("simple")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  poaType === "simple"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-lg font-bold text-foreground">20 AZN</p>
                <p className="text-xs text-muted">{pt.simplePoa}</p>
              </button>
              <button
                onClick={() => setPoaType("general")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  poaType === "general"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-lg font-bold text-foreground">50 AZN</p>
                <p className="text-xs text-muted">{pt.generalPoa}</p>
              </button>
            </div>
          </div>
        )}

        {transactionType === "lease" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                💰 {pt.monthlyRent}
              </label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="500"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                📅 {pt.leaseDuration}
              </label>
              <input
                type="number"
                value={leaseMonths}
                onChange={(e) => setLeaseMonths(e.target.value)}
                placeholder="12"
                min="1"
                max="120"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        )}

        {transactionType === "company" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💼 {pt.charterCapital}
            </label>
            <input
              type="number"
              value={capitalAmount}
              onChange={(e) => setCapitalAmount(e.target.value)}
              placeholder="5000"
              min="0"
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.notaryFee}</p>
              <p className="text-3xl font-bold">{fmt(result.fee)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>

            {result.type === "sale" && (
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">{pt.propertyPriceResult}</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.baseAmount)}</p>
                <p className="text-xs text-muted mt-1">AZN ({result.percentage.toFixed(2)}%)</p>
              </div>
            )}

            {result.type === "lease" && (
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">{pt.totalRent}</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.totalRent)}</p>
                <p className="text-xs text-muted mt-1">{result.months} {pt.months} × {fmt(result.monthlyRent)} AZN</p>
              </div>
            )}

            {result.type === "company" && (
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">{pt.charterCapitalResult}</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.capital)}</p>
                <p className="text-xs text-muted mt-1">AZN ({result.percentage.toFixed(2)}%)</p>
              </div>
            )}

            {result.type === "poa" && (
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">{pt.poaTypeResult}</p>
                <p className="text-2xl font-bold text-foreground">{result.label}</p>
                <p className="text-xs text-muted mt-1">{pt.fixedFee}</p>
              </div>
            )}

            {result.type === "will" && (
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">{pt.documentType}</p>
                <p className="text-2xl font-bold text-foreground">{pt.willLabel}</p>
                <p className="text-xs text-muted mt-1">{pt.fixedFee}</p>
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedCalc}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.transactionTypeLabel}</span>
                <span className="text-sm font-medium text-foreground">
                  {transactionTypes.find((t) => t.value === transactionType)?.description}
                </span>
              </div>

              {result.type === "sale" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.propertyPriceResult}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.baseAmount)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.appliedTariff}</span>
                    <span className="text-sm font-medium text-foreground">{result.bracket}</span>
                  </div>
                </>
              )}

              {result.type === "lease" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.monthlyRentResult}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.monthlyRent)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.durationResult}</span>
                    <span className="text-sm font-medium text-foreground">{result.months} {pt.months}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.totalRent}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.totalRent)} AZN</span>
                  </div>
                </>
              )}

              {result.type === "company" && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.charterCapitalResult}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.capital)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.notaryFee}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.fee)} AZN</span>
              </div>
            </div>
          </div>

          {/* Sale Fee Comparison */}
          {result.type === "sale" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📊</span>
                  {pt.tariffComparison}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "10 000 AZN", amount: 10000 },
                  { label: "30 000 AZN", amount: 30000 },
                  { label: "50 000 AZN", amount: 50000 },
                  { label: "80 000 AZN", amount: 80000 },
                  { label: "100 000 AZN", amount: 100000 },
                  { label: "200 000 AZN", amount: 200000 },
                ].map((item) => {
                  const fee = getSaleFee(item.amount);
                  const pct = (fee / item.amount) * 100;
                  const isActive = result.baseAmount === item.amount;
                  return (
                    <div
                      key={item.amount}
                      className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}
                    >
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted">{pct.toFixed(2)}%</span>
                        <span className="font-medium text-amber-700">{fmt(fee)} AZN</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.attention}</span> {pt.infoNote}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📋</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
