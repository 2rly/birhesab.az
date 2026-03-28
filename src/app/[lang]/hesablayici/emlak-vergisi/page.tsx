"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// Azərbaycan əmlak alqı-satqı vergi və xərcləri (2024)
// Vergi Məcəlləsi və Notariat haqqında Qanun əsasında

type PropertyType = "apartment" | "house" | "land" | "commercial";
type SellerType = "individual" | "legal";
type OwnershipDuration = "less5" | "more5";

const propertyTypesTranslations: Record<Lang, { value: PropertyType; label: string; icon: string; description: string }[]> = {
  az: [
    { value: "apartment", label: "Mənzil", icon: "🏢", description: "Yaşayış mənzili" },
    { value: "house", label: "Ev", icon: "🏠", description: "Fərdi yaşayış evi" },
    { value: "land", label: "Torpaq", icon: "🌍", description: "Torpaq sahəsi" },
    { value: "commercial", label: "Kommersiya", icon: "🏪", description: "Kommersiya obyekti" },
  ],
  en: [
    { value: "apartment", label: "Apartment", icon: "🏢", description: "Residential apartment" },
    { value: "house", label: "House", icon: "🏠", description: "Individual residential house" },
    { value: "land", label: "Land", icon: "🌍", description: "Land plot" },
    { value: "commercial", label: "Commercial", icon: "🏪", description: "Commercial property" },
  ],
  ru: [
    { value: "apartment", label: "Квартира", icon: "🏢", description: "Жилая квартира" },
    { value: "house", label: "Дом", icon: "🏠", description: "Индивидуальный жилой дом" },
    { value: "land", label: "Земля", icon: "🌍", description: "Земельный участок" },
    { value: "commercial", label: "Коммерция", icon: "🏪", description: "Коммерческий объект" },
  ],
};

// Gəlir vergisi dərəcəsi (əmlak satışından)
const INCOME_TAX_RATE_INDIVIDUAL = 0.14;
const INCOME_TAX_RATE_LEGAL = 0.20;

function getNotaryFee(price: number): number {
  if (price <= 10000) return price * 0.005 + 15;
  if (price <= 50000) return 50 + (price - 10000) * 0.003;
  if (price <= 100000) return 170 + (price - 50000) * 0.002;
  return 270 + (price - 100000) * 0.001;
}

const STATE_REGISTRATION_FEE = 20;
const TECHNICAL_PASSPORT_FEE = 50;
const REGISTRY_EXTRACT_FEE = 20;
const DOCUMENT_FEES = 30;
const VAT_RATE = 0.18;

const pageTranslations = {
  az: {
    title: "Əmlak alqı-satqı vergisi",
    description: "Azərbaycanda əmlak alışında vergi, notarius və dövlət rüsumlarını hesablayın.",
    breadcrumbCategory: "Daşınmaz Əmlak",
    breadcrumbLabel: "Əmlak alqı-satqı vergisi",
    formulaTitle: "Əmlak satışında hansı vergi və xərclər var?",
    formulaContent: `Gəlir vergisi (satıcıdan):
• Fiziki şəxs: mənfəətin 14%-i (satış qiyməti − alış qiyməti)
• Hüquqi şəxs: mənfəətin 20%-i
• Güzəşt: Yaşayış əmlakı 5+ il sahiblikdə — vergidən azad

ƏDV (18%):
• Yalnız kommersiya əmlakı + hüquqi şəxs satışında tətbiq olunur
• Yaşayış əmlakı satışı ƏDV-dən azaddır

Notarius xərcləri (alqı-satqı müqaviləsi):
• 10 000 AZN-dək: 0.5% + 15 AZN
• 10 001–50 000 AZN: 50 + 0.3%
• 50 001–100 000 AZN: 170 + 0.2%
• 100 000+ AZN: 270 + 0.1%

Dövlət rüsumları:
• Qeydiyyat rüsumu: 20 AZN
• Texniki pasport: 50 AZN
• Reyestr çıxarışı: 20 AZN
• Sənəd xərcləri: ~30 AZN`,
    propertyType: "Əmlak növü",
    sellerStatus: "Satıcının statusu",
    individual: "Fiziki şəxs",
    legalEntity: "Hüquqi şəxs",
    ownershipDuration: "Sahiblik müddəti",
    lessThan5Years: "< 5 il",
    taxApplicable: "Vergiyə cəlb olunur",
    moreThan5Years: "5+ il",
    taxExempt: "Vergidən azad",
    salePrice: "Satış qiyməti (AZN)",
    purchasePrice: "Alış qiyməti (AZN)",
    optional: "ixtiyari",
    forProfitTax: "Mənfəət vergisi hesablaması üçün",
    area: "Sahə (m²)",
    taxExemptNotice: "Gəlir vergisindən azad!",
    taxExemptDesc: "Yaşayış əmlakı 5 ildən çox sahiblikdə olduğu üçün satışdan gəlir vergisi tutulmur.",
    salePriceLabel: "Satış qiyməti",
    totalTaxAndFees: "Ümumi vergi və xərc",
    pricePerSqm: "1 m² qiyməti",
    sellerCosts: "Satıcının xərcləri",
    buyerCosts: "Alıcının xərcləri",
    incomeTax: "Gəlir vergisi",
    exempt: "Azad",
    notaryHalf: "Notarius (½)",
    totalLabel: "Cəmi",
    vat18: "ƏDV (18%)",
    stateFees: "Dövlət rüsumları",
    detailedCalc: "Ətraflı hesablama",
    purchasePriceLabel: "Alış qiyməti",
    profitLabel: "Mənfəət (satış − alış)",
    taxesSection: "Vergilər",
    feesSection: "Rüsum və xərclər",
    notaryFee: "Notarius xərci",
    registrationFee: "Qeydiyyat rüsumu",
    technicalPassport: "Texniki pasport",
    registryExtract: "Reyestr çıxarışı",
    documentFees: "Sənəd xərcləri",
    totalTaxAndFeesLabel: "Ümumi vergi və xərclər",
    costStructure: "Xərcin strukturu",
    incomeTaxLegend: "Gəlir vergisi:",
    vatLegend: "ƏDV:",
    notaryLegend: "Notarius:",
    stateFeesLegend: "Dövlət rüsumları:",
    warning: "Diqqət:",
    warningText: "Bu hesablama təxmini xarakter daşıyır. Notarius xərcləri razılaşma ilə satıcı və alıcı arasında bərabər bölünə və ya bir tərəfin üzərinə düşə bilər. Dəqiq məlumat üçün notariusa və vergi orqanına müraciət edin.",
    emptyState: "Nəticəni görmək üçün satış qiymətini daxil edin.",
    profitTaxNote14: (profit: string) => `Mənfəətdən 14% (${profit} AZN × 14%)`,
    profitTaxNote20: (profit: string) => `Mənfəətdən 20% (${profit} AZN × 20%)`,
    taxExemptNote: "5 ildən çox sahiblik — vergidən azad",
  },
  en: {
    title: "Property sale tax calculator",
    description: "Calculate taxes, notary and government fees when buying/selling property in Azerbaijan.",
    breadcrumbCategory: "Real Estate",
    breadcrumbLabel: "Property sale tax",
    formulaTitle: "What taxes and fees apply to property sales?",
    formulaContent: `Income tax (from seller):
• Individual: 14% of profit (sale price − purchase price)
• Legal entity: 20% of profit
• Exemption: Residential property owned 5+ years — tax exempt

VAT (18%):
• Applies only to commercial property + legal entity sales
• Residential property sales are VAT exempt

Notary fees (sale contract):
• Up to 10,000 AZN: 0.5% + 15 AZN
• 10,001–50,000 AZN: 50 + 0.3%
• 50,001–100,000 AZN: 170 + 0.2%
• 100,000+ AZN: 270 + 0.1%

Government fees:
• Registration fee: 20 AZN
• Technical passport: 50 AZN
• Registry extract: 20 AZN
• Document fees: ~30 AZN`,
    propertyType: "Property type",
    sellerStatus: "Seller status",
    individual: "Individual",
    legalEntity: "Legal entity",
    ownershipDuration: "Ownership duration",
    lessThan5Years: "< 5 years",
    taxApplicable: "Subject to tax",
    moreThan5Years: "5+ years",
    taxExempt: "Tax exempt",
    salePrice: "Sale price (AZN)",
    purchasePrice: "Purchase price (AZN)",
    optional: "optional",
    forProfitTax: "For profit tax calculation",
    area: "Area (m²)",
    taxExemptNotice: "Income tax exempt!",
    taxExemptDesc: "No income tax is charged because the residential property has been owned for more than 5 years.",
    salePriceLabel: "Sale price",
    totalTaxAndFees: "Total tax and fees",
    pricePerSqm: "Price per m²",
    sellerCosts: "Seller's costs",
    buyerCosts: "Buyer's costs",
    incomeTax: "Income tax",
    exempt: "Exempt",
    notaryHalf: "Notary (½)",
    totalLabel: "Total",
    vat18: "VAT (18%)",
    stateFees: "Government fees",
    detailedCalc: "Detailed calculation",
    purchasePriceLabel: "Purchase price",
    profitLabel: "Profit (sale − purchase)",
    taxesSection: "Taxes",
    feesSection: "Fees and charges",
    notaryFee: "Notary fee",
    registrationFee: "Registration fee",
    technicalPassport: "Technical passport",
    registryExtract: "Registry extract",
    documentFees: "Document fees",
    totalTaxAndFeesLabel: "Total taxes and fees",
    costStructure: "Cost structure",
    incomeTaxLegend: "Income tax:",
    vatLegend: "VAT:",
    notaryLegend: "Notary:",
    stateFeesLegend: "Government fees:",
    warning: "Note:",
    warningText: "This calculation is approximate. Notary fees may be split equally between buyer and seller by agreement, or borne by one party. Contact a notary and tax authority for exact information.",
    emptyState: "Enter the sale price to see the result.",
    profitTaxNote14: (profit: string) => `14% of profit (${profit} AZN × 14%)`,
    profitTaxNote20: (profit: string) => `20% of profit (${profit} AZN × 20%)`,
    taxExemptNote: "Owned 5+ years — tax exempt",
  },
  ru: {
    title: "Калькулятор налога при купле-продаже недвижимости",
    description: "Рассчитайте налоги, нотариальные и государственные сборы при покупке/продаже недвижимости в Азербайджане.",
    breadcrumbCategory: "Недвижимость",
    breadcrumbLabel: "Налог при купле-продаже",
    formulaTitle: "Какие налоги и расходы при продаже недвижимости?",
    formulaContent: `Подоходный налог (с продавца):
• Физическое лицо: 14% от прибыли (цена продажи − цена покупки)
• Юридическое лицо: 20% от прибыли
• Льгота: Жильё в собственности 5+ лет — освобождено от налога

НДС (18%):
• Применяется только при продаже коммерческой недвижимости юрлицом
• Продажа жилой недвижимости освобождена от НДС

Нотариальные расходы (договор купли-продажи):
• До 10 000 AZN: 0.5% + 15 AZN
• 10 001–50 000 AZN: 50 + 0.3%
• 50 001–100 000 AZN: 170 + 0.2%
• 100 000+ AZN: 270 + 0.1%

Государственные пошлины:
• Регистрационный сбор: 20 AZN
• Технический паспорт: 50 AZN
• Выписка из реестра: 20 AZN
• Расходы на документы: ~30 AZN`,
    propertyType: "Тип недвижимости",
    sellerStatus: "Статус продавца",
    individual: "Физическое лицо",
    legalEntity: "Юридическое лицо",
    ownershipDuration: "Срок владения",
    lessThan5Years: "< 5 лет",
    taxApplicable: "Облагается налогом",
    moreThan5Years: "5+ лет",
    taxExempt: "Освобождено от налога",
    salePrice: "Цена продажи (AZN)",
    purchasePrice: "Цена покупки (AZN)",
    optional: "необязательно",
    forProfitTax: "Для расчёта налога на прибыль",
    area: "Площадь (м²)",
    taxExemptNotice: "Освобождено от подоходного налога!",
    taxExemptDesc: "Подоходный налог не взимается, так как жилая недвижимость находится в собственности более 5 лет.",
    salePriceLabel: "Цена продажи",
    totalTaxAndFees: "Общие налоги и расходы",
    pricePerSqm: "Цена за м²",
    sellerCosts: "Расходы продавца",
    buyerCosts: "Расходы покупателя",
    incomeTax: "Подоходный налог",
    exempt: "Освобождён",
    notaryHalf: "Нотариус (½)",
    totalLabel: "Итого",
    vat18: "НДС (18%)",
    stateFees: "Государственные пошлины",
    detailedCalc: "Подробный расчёт",
    purchasePriceLabel: "Цена покупки",
    profitLabel: "Прибыль (продажа − покупка)",
    taxesSection: "Налоги",
    feesSection: "Пошлины и сборы",
    notaryFee: "Нотариальные расходы",
    registrationFee: "Регистрационный сбор",
    technicalPassport: "Технический паспорт",
    registryExtract: "Выписка из реестра",
    documentFees: "Расходы на документы",
    totalTaxAndFeesLabel: "Общие налоги и расходы",
    costStructure: "Структура расходов",
    incomeTaxLegend: "Подоходный налог:",
    vatLegend: "НДС:",
    notaryLegend: "Нотариус:",
    stateFeesLegend: "Госпошлины:",
    warning: "Внимание:",
    warningText: "Данный расчёт является приблизительным. Нотариальные расходы могут быть разделены поровну между продавцом и покупателем или возложены на одну сторону. Для точной информации обратитесь к нотариусу и в налоговый орган.",
    emptyState: "Введите цену продажи, чтобы увидеть результат.",
    profitTaxNote14: (profit: string) => `14% от прибыли (${profit} AZN × 14%)`,
    profitTaxNote20: (profit: string) => `20% от прибыли (${profit} AZN × 20%)`,
    taxExemptNote: "Владение 5+ лет — освобождено от налога",
  },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function PropertyTaxCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const propertyTypes = propertyTypesTranslations[lang];

  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [sellerType, setSellerType] = useState<SellerType>("individual");
  const [ownershipDuration, setOwnershipDuration] = useState<OwnershipDuration>("less5");
  const [area, setArea] = useState("");

  const result = useMemo(() => {
    const salePrice = parseFloat(price);
    if (!salePrice || salePrice <= 0) return null;

    const buyPrice = parseFloat(purchasePrice) || 0;
    const sqm = parseFloat(area) || 0;
    const pricePerSqm = sqm > 0 ? salePrice / sqm : 0;

    const profit = buyPrice > 0 ? Math.max(0, salePrice - buyPrice) : salePrice;

    let incomeTax = 0;
    let incomeTaxNote = "";

    if (sellerType === "individual") {
      if (ownershipDuration === "more5") {
        if (propertyType === "apartment" || propertyType === "house") {
          incomeTax = 0;
          incomeTaxNote = pt.taxExemptNote;
        } else {
          incomeTax = profit * INCOME_TAX_RATE_INDIVIDUAL;
          incomeTaxNote = pt.profitTaxNote14(fmt(profit));
        }
      } else {
        incomeTax = profit * INCOME_TAX_RATE_INDIVIDUAL;
        incomeTaxNote = pt.profitTaxNote14(fmt(profit));
      }
    } else {
      incomeTax = profit * INCOME_TAX_RATE_LEGAL;
      incomeTaxNote = pt.profitTaxNote20(fmt(profit));
    }

    let vatAmount = 0;
    if (propertyType === "commercial" && sellerType === "legal") {
      vatAmount = salePrice * VAT_RATE;
    }

    const notaryFee = getNotaryFee(salePrice);
    const registrationFee = STATE_REGISTRATION_FEE;
    const technicalPassport = TECHNICAL_PASSPORT_FEE;
    const registryExtract = REGISTRY_EXTRACT_FEE;
    const documentFees = DOCUMENT_FEES;
    const totalStateFees = registrationFee + technicalPassport + registryExtract + documentFees;

    const sellerCosts = incomeTax + notaryFee / 2;
    const buyerCosts = notaryFee / 2 + totalStateFees + vatAmount;
    const totalTaxAndFees = incomeTax + vatAmount + notaryFee + totalStateFees;

    return {
      salePrice,
      buyPrice,
      profit,
      incomeTax,
      incomeTaxNote,
      vatAmount,
      notaryFee,
      registrationFee,
      technicalPassport,
      registryExtract,
      documentFees,
      totalStateFees,
      sellerCosts,
      buyerCosts,
      totalTaxAndFees,
      pricePerSqm,
      sqm,
    };
  }, [price, purchasePrice, propertyType, sellerType, ownershipDuration, area, pt]);

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
      relatedIds={["rental-tax", "mortgage", "price-per-sqm", "notary-fee"]}
    >
      {/* Property Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.propertyType}</label>
        <div className="grid grid-cols-4 gap-3">
          {propertyTypes.map((p) => (
            <button
              key={p.value}
              onClick={() => setPropertyType(p.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                propertyType === p.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{p.icon}</span>
              <p className="text-xs font-medium text-foreground">{p.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Seller Type & Ownership */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">{pt.sellerStatus}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSellerType("individual")}
              className={`p-3 rounded-xl border text-center transition-all ${
                sellerType === "individual"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">👤</span>
              <p className="text-xs font-medium text-foreground">{pt.individual}</p>
            </button>
            <button
              onClick={() => setSellerType("legal")}
              className={`p-3 rounded-xl border text-center transition-all ${
                sellerType === "legal"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">🏢</span>
              <p className="text-xs font-medium text-foreground">{pt.legalEntity}</p>
            </button>
          </div>
        </div>

        {sellerType === "individual" && (propertyType === "apartment" || propertyType === "house") && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">{pt.ownershipDuration}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOwnershipDuration("less5")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  ownershipDuration === "less5"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-lg font-bold text-foreground">{pt.lessThan5Years}</p>
                <p className="text-xs text-muted">{pt.taxApplicable}</p>
              </button>
              <button
                onClick={() => setOwnershipDuration("more5")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  ownershipDuration === "more5"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-lg font-bold text-foreground">{pt.moreThan5Years}</p>
                <p className="text-xs text-green-600">{pt.taxExempt}</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price Inputs */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 {pt.salePrice}
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="80000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              🏷️ {pt.purchasePrice} <span className="text-muted font-normal">— {pt.optional}</span>
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="60000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">{pt.forProfitTax}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📐 {pt.area} <span className="text-muted font-normal">— {pt.optional}</span>
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="75"
            min="0"
            className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Tax Exemption Notice */}
          {result.incomeTax === 0 && ownershipDuration === "more5" && sellerType === "individual" && (propertyType === "apartment" || propertyType === "house") && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <h4 className="font-semibold text-green-800 mb-1">{pt.taxExemptNotice}</h4>
              <p className="text-sm text-green-600">
                {pt.taxExemptDesc}
              </p>
            </div>
          )}

          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.salePriceLabel}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.salePrice)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.totalTaxAndFees}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalTaxAndFees)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>

            {result.sqm > 0 && (
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">{pt.pricePerSqm}</p>
                <p className="text-2xl font-bold">{fmt(result.pricePerSqm)}</p>
                <p className="text-xs text-blue-200 mt-1">AZN / m²</p>
              </div>
            )}
          </div>

          {/* Seller vs Buyer Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-red-50 px-5 py-3 border-b border-red-100">
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  <span>📤</span>
                  {pt.sellerCosts}
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.incomeTax}</span>
                  <span className="text-sm font-medium text-foreground">
                    {result.incomeTax > 0 ? `${fmt(result.incomeTax)} AZN` : pt.exempt}
                  </span>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.notaryHalf}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.notaryFee / 2)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3 bg-red-50">
                  <span className="text-sm font-semibold text-red-700">{pt.totalLabel}</span>
                  <span className="text-sm font-bold text-red-700">{fmt(result.sellerCosts)} AZN</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <span>📥</span>
                  {pt.buyerCosts}
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.notaryHalf}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.notaryFee / 2)} AZN</span>
                </div>
                {result.vatAmount > 0 && (
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.vat18}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                  </div>
                )}
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.stateFees}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.totalStateFees)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3 bg-blue-50">
                  <span className="text-sm font-semibold text-blue-700">{pt.totalLabel}</span>
                  <span className="text-sm font-bold text-blue-700">{fmt(result.buyerCosts)} AZN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedCalc}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.salePriceLabel}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.salePrice)} AZN</span>
              </div>
              {result.buyPrice > 0 && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.purchasePriceLabel}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.buyPrice)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.profitLabel}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.profit)} AZN</span>
                  </div>
                </>
              )}

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">{pt.taxesSection}</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-muted">{pt.incomeTax}</span>
                  {result.incomeTaxNote && (
                    <p className="text-xs text-muted mt-0.5">{result.incomeTaxNote}</p>
                  )}
                </div>
                <span className={`text-sm font-medium ${result.incomeTax === 0 ? "text-green-600" : "text-foreground"}`}>
                  {result.incomeTax > 0 ? `${fmt(result.incomeTax)} AZN` : pt.exempt}
                </span>
              </div>

              {result.vatAmount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.vat18}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                </div>
              )}

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">{pt.feesSection}</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.notaryFee}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.notaryFee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.registrationFee}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.registrationFee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.technicalPassport}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.technicalPassport)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.registryExtract}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.registryExtract)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.documentFees}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.documentFees)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.totalTaxAndFeesLabel}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.totalTaxAndFees)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.costStructure}</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              {result.incomeTax > 0 && (
                <div className="h-full bg-red-400" style={{ width: `${(result.incomeTax / result.totalTaxAndFees) * 100}%` }} />
              )}
              {result.vatAmount > 0 && (
                <div className="h-full bg-orange-400" style={{ width: `${(result.vatAmount / result.totalTaxAndFees) * 100}%` }} />
              )}
              <div className="h-full bg-amber-400" style={{ width: `${(result.notaryFee / result.totalTaxAndFees) * 100}%` }} />
              <div className="h-full bg-blue-400" style={{ width: `${(result.totalStateFees / result.totalTaxAndFees) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              {result.incomeTax > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  {pt.incomeTaxLegend} {fmt(result.incomeTax)}
                </span>
              )}
              {result.vatAmount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
                  {pt.vatLegend} {fmt(result.vatAmount)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                {pt.notaryLegend} {fmt(result.notaryFee)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                {pt.stateFeesLegend} {fmt(result.totalStateFees)}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.warning}</span> {pt.warningText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏢</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
