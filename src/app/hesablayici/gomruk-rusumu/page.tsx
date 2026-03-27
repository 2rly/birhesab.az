"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// Azərbaycan gömrük rüsumu dərəcələri (2024)
// Gömrük Məcəlləsi və Nazirlər Kabinetinin qərarına əsasən

type GoodsCategory = "electronics" | "clothing" | "food" | "cosmetics" | "medicine" | "furniture" | "toys" | "auto_parts" | "other";

interface CategoryInfo {
  id: GoodsCategory;
  name: string;
  icon: string;
  dutyRate: number; // % gömrük rüsumu
  vatRate: number; // % ƏDV
  exciseRate: number; // % aksiz (əksər mallarda 0)
  description: string;
}

const goodsCategoriesTranslations: Record<Lang, CategoryInfo[]> = {
  az: [
    { id: "electronics", name: "Elektronika", icon: "📱", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Telefon, kompüter, planşet və s." },
    { id: "clothing", name: "Geyim və ayaqqabı", icon: "👕", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Geyim, ayaqqabı, aksessuarlar" },
    { id: "food", name: "Ərzaq məhsulları", icon: "🍎", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Qida məhsulları, içkilər" },
    { id: "cosmetics", name: "Kosmetika və parfümeriya", icon: "💄", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Kosmetik və parfümeriya məhsulları" },
    { id: "medicine", name: "Dərman preparatları", icon: "💊", dutyRate: 0, vatRate: 18, exciseRate: 0, description: "Dərman və tibbi ləvazimatlar (güzəştli)" },
    { id: "furniture", name: "Mebel", icon: "🪑", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Ev mebeli və aksesuarları" },
    { id: "toys", name: "Oyuncaqlar", icon: "🧸", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Uşaq oyuncaqları və oyunlar" },
    { id: "auto_parts", name: "Avtomobil hissələri", icon: "🔧", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Avtomobil ehtiyat hissələri" },
    { id: "other", name: "Digər mallar", icon: "📦", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Siyahıda olmayan digər mallar" },
  ],
  en: [
    { id: "electronics", name: "Electronics", icon: "📱", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Phones, computers, tablets, etc." },
    { id: "clothing", name: "Clothing & footwear", icon: "👕", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Clothing, footwear, accessories" },
    { id: "food", name: "Food products", icon: "🍎", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Food products, beverages" },
    { id: "cosmetics", name: "Cosmetics & perfumery", icon: "💄", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Cosmetic and perfumery products" },
    { id: "medicine", name: "Pharmaceuticals", icon: "💊", dutyRate: 0, vatRate: 18, exciseRate: 0, description: "Medicines and medical supplies (reduced)" },
    { id: "furniture", name: "Furniture", icon: "🪑", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Home furniture and accessories" },
    { id: "toys", name: "Toys", icon: "🧸", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Children's toys and games" },
    { id: "auto_parts", name: "Auto parts", icon: "🔧", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Automobile spare parts" },
    { id: "other", name: "Other goods", icon: "📦", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Other goods not listed" },
  ],
  ru: [
    { id: "electronics", name: "Электроника", icon: "📱", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Телефоны, компьютеры, планшеты и т.д." },
    { id: "clothing", name: "Одежда и обувь", icon: "👕", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Одежда, обувь, аксессуары" },
    { id: "food", name: "Продукты питания", icon: "🍎", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Продукты питания, напитки" },
    { id: "cosmetics", name: "Косметика и парфюмерия", icon: "💄", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Косметическая и парфюмерная продукция" },
    { id: "medicine", name: "Лекарственные препараты", icon: "💊", dutyRate: 0, vatRate: 18, exciseRate: 0, description: "Лекарства и медицинские принадлежности (льготные)" },
    { id: "furniture", name: "Мебель", icon: "🪑", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Домашняя мебель и аксессуары" },
    { id: "toys", name: "Игрушки", icon: "🧸", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Детские игрушки и игры" },
    { id: "auto_parts", name: "Автозапчасти", icon: "🔧", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Автомобильные запчасти" },
    { id: "other", name: "Другие товары", icon: "📦", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Прочие товары, не указанные в списке" },
  ],
};

// Poçt/kuryer ilə göndərilən bağlamalara güzəşt (2024)
const POSTAL_EXEMPTION_LIMIT = 300; // AZN — aylıq limit
const POSTAL_DUTY_RATE = 30; // % — limitdən artıq hissəyə

type DeliveryMethod = "postal" | "commercial";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Gömrük rüsumu hesablayıcısı",
    description: "Xaricdən gətirilən mallara gömrük rüsumu, ƏDV və digər ödənişləri hesablayın.",
    breadcrumbCategory: "Hüquq və Dövlət",
    breadcrumbLabel: "Gömrük rüsumu hesablayıcısı",
    formulaTitle: "Gömrük rüsumu necə hesablanır?",
    formulaContent: `Poçt/kuryer bağlamaları (fiziki şəxslər):
• Aylıq ${POSTAL_EXEMPTION_LIMIT} AZN-dək — RÜSUMSUZ
• ${POSTAL_EXEMPTION_LIMIT} AZN-dən artıq hissəyə — 30% gömrük rüsumu

Kommersiya idxalı:
Gömrük dəyəri = Malın dəyəri + Daşınma xərci
Gömrük rüsumu = Gömrük dəyəri × Rüsum dərəcəsi (%)
ƏDV bazası = Gömrük dəyəri + Gömrük rüsumu
ƏDV = ƏDV bazası × 18%
Ümumi ödəniş = Gömrük rüsumu + ƏDV + Aksiz (varsa)

Qeyd: Dərman preparatları gömrük rüsumundan azaddır.
Bəzi mallar əlavə aksiz vergisi tələb edə bilər (spirtli içki, tütün və s.).`,
    postalDelivery: "📮 Poçt / Kuryer bağlaması",
    commercialImport: "🏭 Kommersiya idxalı",
    goodsCategory: "Mal kateqoriyası",
    dutyLabel: "Rüsum:",
    vatLabel: "ƏDV:",
    goodsValue: "📦 Malın dəyəri (AZN)",
    shippingCost: "🚚 Daşınma xərci (AZN)",
    dutyFreeTitle: "Rüsumsuz!",
    dutyFreeDesc: `Malın dəyəri aylıq ${POSTAL_EXEMPTION_LIMIT} AZN limitindən azdır. Gömrük rüsumu tətbiq olunmur.`,
    remainingLimit: "Qalan limit:",
    customsValue: "Gömrük dəyəri",
    totalDutyAndTax: "Ümumi rüsum və vergi",
    totalCost: "Ümumi xərc",
    detailedCalc: "Ətraflı hesablama",
    goodsValueRow: "Malın dəyəri",
    shippingCostRow: "Daşınma xərci",
    customsValueRow: "Gömrük dəyəri",
    exemptionLimit: "Güzəşt limiti",
    taxableAmount: "Rüsuma cəlb olunan",
    customsDutyRow: "Gömrük rüsumu",
    vatRow: "ƏDV",
    exciseTax: "Aksiz vergisi",
    totalDutyRow: "Cəmi rüsum və vergi",
    totalCostRow: "Ümumi xərc (mal + rüsum)",
    goodsAndShipping: "Malın dəyəri + Daşınma",
    dutyAndTax: "Rüsum və Vergi",
    warningTitle: "Diqqət:",
    warningText: "Bu hesablama təxmini xarakter daşıyır. Faktiki gömrük rüsumu malın HS kodu, mənşə ölkəsi, ticarət sazişləri və digər amillərə görə fərqlənə bilər. Dəqiq məlumat üçün Dövlət Gömrük Komitəsinə müraciət edin.",
    emptyState: "Nəticəni görmək üçün malın dəyərini daxil edin.",
  },
  en: {
    title: "Customs Duty Calculator",
    description: "Calculate customs duties, VAT and other charges on imported goods.",
    breadcrumbCategory: "Legal & Government",
    breadcrumbLabel: "Customs duty calculator",
    formulaTitle: "How are customs duties calculated?",
    formulaContent: `Postal/courier parcels (individuals):
• Up to ${POSTAL_EXEMPTION_LIMIT} AZN per month — DUTY FREE
• Amount exceeding ${POSTAL_EXEMPTION_LIMIT} AZN — 30% customs duty

Commercial import:
Customs value = Goods value + Shipping cost
Customs duty = Customs value × Duty rate (%)
VAT base = Customs value + Customs duty
VAT = VAT base × 18%
Total payment = Customs duty + VAT + Excise (if applicable)

Note: Pharmaceuticals are exempt from customs duty.
Some goods may require additional excise tax (alcohol, tobacco, etc.).`,
    postalDelivery: "📮 Postal / Courier parcel",
    commercialImport: "🏭 Commercial import",
    goodsCategory: "Goods category",
    dutyLabel: "Duty:",
    vatLabel: "VAT:",
    goodsValue: "📦 Goods value (AZN)",
    shippingCost: "🚚 Shipping cost (AZN)",
    dutyFreeTitle: "Duty free!",
    dutyFreeDesc: `The goods value is below the monthly ${POSTAL_EXEMPTION_LIMIT} AZN limit. No customs duty applies.`,
    remainingLimit: "Remaining limit:",
    customsValue: "Customs value",
    totalDutyAndTax: "Total duty and tax",
    totalCost: "Total cost",
    detailedCalc: "Detailed calculation",
    goodsValueRow: "Goods value",
    shippingCostRow: "Shipping cost",
    customsValueRow: "Customs value",
    exemptionLimit: "Exemption limit",
    taxableAmount: "Taxable amount",
    customsDutyRow: "Customs duty",
    vatRow: "VAT",
    exciseTax: "Excise tax",
    totalDutyRow: "Total duty and tax",
    totalCostRow: "Total cost (goods + duty)",
    goodsAndShipping: "Goods value + Shipping",
    dutyAndTax: "Duty and Tax",
    warningTitle: "Note:",
    warningText: "This calculation is approximate. Actual customs duty may vary based on the HS code, country of origin, trade agreements and other factors. Contact the State Customs Committee for exact information.",
    emptyState: "Enter the goods value to see the result.",
  },
  ru: {
    title: "Калькулятор таможенной пошлины",
    description: "Рассчитайте таможенные пошлины, НДС и другие платежи на импортируемые товары.",
    breadcrumbCategory: "Право и государство",
    breadcrumbLabel: "Калькулятор таможенной пошлины",
    formulaTitle: "Как рассчитывается таможенная пошлина?",
    formulaContent: `Почтовые/курьерские посылки (физические лица):
• До ${POSTAL_EXEMPTION_LIMIT} AZN в месяц — БЕЗ ПОШЛИНЫ
• Сумма свыше ${POSTAL_EXEMPTION_LIMIT} AZN — 30% таможенная пошлина

Коммерческий импорт:
Таможенная стоимость = Стоимость товара + Стоимость доставки
Таможенная пошлина = Таможенная стоимость × Ставка пошлины (%)
База НДС = Таможенная стоимость + Таможенная пошлина
НДС = База НДС × 18%
Общий платёж = Таможенная пошлина + НДС + Акциз (при наличии)

Примечание: Лекарственные препараты освобождены от таможенной пошлины.
Некоторые товары могут требовать дополнительного акцизного налога (алкоголь, табак и т.д.).`,
    postalDelivery: "📮 Почтовая / Курьерская посылка",
    commercialImport: "🏭 Коммерческий импорт",
    goodsCategory: "Категория товара",
    dutyLabel: "Пошлина:",
    vatLabel: "НДС:",
    goodsValue: "📦 Стоимость товара (AZN)",
    shippingCost: "🚚 Стоимость доставки (AZN)",
    dutyFreeTitle: "Без пошлины!",
    dutyFreeDesc: `Стоимость товара ниже ежемесячного лимита ${POSTAL_EXEMPTION_LIMIT} AZN. Таможенная пошлина не применяется.`,
    remainingLimit: "Оставшийся лимит:",
    customsValue: "Таможенная стоимость",
    totalDutyAndTax: "Общая пошлина и налог",
    totalCost: "Общая стоимость",
    detailedCalc: "Подробный расчёт",
    goodsValueRow: "Стоимость товара",
    shippingCostRow: "Стоимость доставки",
    customsValueRow: "Таможенная стоимость",
    exemptionLimit: "Лимит льготы",
    taxableAmount: "Облагаемая сумма",
    customsDutyRow: "Таможенная пошлина",
    vatRow: "НДС",
    exciseTax: "Акцизный налог",
    totalDutyRow: "Итого пошлина и налог",
    totalCostRow: "Общая стоимость (товар + пошлина)",
    goodsAndShipping: "Стоимость товара + Доставка",
    dutyAndTax: "Пошлина и налог",
    warningTitle: "Внимание:",
    warningText: "Данный расчёт является приблизительным. Фактическая таможенная пошлина может отличаться в зависимости от кода HS, страны происхождения, торговых соглашений и других факторов. Для точной информации обратитесь в Государственный таможенный комитет.",
    emptyState: "Введите стоимость товара, чтобы увидеть результат.",
  },
};

export default function CustomsDutyCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const goodsCategories = goodsCategoriesTranslations[lang];

  const [goodsValue, setGoodsValue] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [category, setCategory] = useState<GoodsCategory>("electronics");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("postal");

  const selectedCategory = goodsCategories.find((c) => c.id === category)!;

  const result = useMemo(() => {
    const value = parseFloat(goodsValue);
    if (!value || value <= 0) return null;

    const shipping = parseFloat(shippingCost) || 0;
    const totalValue = value + shipping; // Gömrük dəyəri = mal dəyəri + daşınma

    if (deliveryMethod === "postal") {
      // Poçt/kuryer bağlaması
      if (totalValue <= POSTAL_EXEMPTION_LIMIT) {
        return {
          goodsValue: value,
          shippingCost: shipping,
          totalValue,
          customsDuty: 0,
          vatAmount: 0,
          exciseAmount: 0,
          totalDuty: 0,
          finalCost: totalValue,
          exemptionUsed: totalValue,
          exemptionRemaining: POSTAL_EXEMPTION_LIMIT - totalValue,
          isExempt: true,
        };
      }

      // Limitdən artıq hissəyə 30% rüsum
      const taxableAmount = totalValue - POSTAL_EXEMPTION_LIMIT;
      const customsDuty = taxableAmount * (POSTAL_DUTY_RATE / 100);
      const totalDuty = customsDuty;

      return {
        goodsValue: value,
        shippingCost: shipping,
        totalValue,
        customsDuty,
        vatAmount: 0,
        exciseAmount: 0,
        totalDuty,
        finalCost: totalValue + totalDuty,
        exemptionUsed: POSTAL_EXEMPTION_LIMIT,
        exemptionRemaining: 0,
        taxableAmount,
        isExempt: false,
      };
    } else {
      // Kommersiya idxalı
      const customsDuty = totalValue * (selectedCategory.dutyRate / 100);
      const vatBase = totalValue + customsDuty;
      const vatAmount = vatBase * (selectedCategory.vatRate / 100);
      const exciseAmount = totalValue * (selectedCategory.exciseRate / 100);
      const totalDuty = customsDuty + vatAmount + exciseAmount;

      return {
        goodsValue: value,
        shippingCost: shipping,
        totalValue,
        customsDuty,
        vatAmount,
        exciseAmount,
        totalDuty,
        finalCost: totalValue + totalDuty,
        isExempt: false,
      };
    }
  }, [goodsValue, shippingCost, category, deliveryMethod, selectedCategory]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=legal" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["car-customs", "vat", "currency", "customs-duty"]}
    >
      {/* Delivery Method Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setDeliveryMethod("postal")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            deliveryMethod === "postal"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.postalDelivery}
        </button>
        <button
          onClick={() => setDeliveryMethod("commercial")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            deliveryMethod === "commercial"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.commercialImport}
        </button>
      </div>

      {/* Category Selection (only for commercial) */}
      {deliveryMethod === "commercial" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">{pt.goodsCategory}</label>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
            {goodsCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  category === cat.id
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <p className="text-xs font-medium text-foreground">{cat.name}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            {selectedCategory.description} — {pt.dutyLabel} {selectedCategory.dutyRate}%, {pt.vatLabel} {selectedCategory.vatRate}%
          </p>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.goodsValue}
          </label>
          <input
            type="number"
            value={goodsValue}
            onChange={(e) => setGoodsValue(e.target.value)}
            placeholder="500"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.shippingCost}
          </label>
          <input
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Exemption Notice for Postal */}
          {deliveryMethod === "postal" && result.isExempt && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <h4 className="font-semibold text-green-800 mb-1">{pt.dutyFreeTitle}</h4>
              <p className="text-sm text-green-600">
                {pt.dutyFreeDesc}
              </p>
              <p className="text-xs text-green-500 mt-2">
                {pt.remainingLimit} {fmt(result.exemptionRemaining!)} AZN
              </p>
            </div>
          )}

          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.customsValue}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.totalValue)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.totalDutyAndTax}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalDuty)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.totalCost}</p>
              <p className="text-2xl font-bold">{fmt(result.finalCost)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedCalc}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.goodsValueRow}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.goodsValue)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.shippingCostRow}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.shippingCost)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-foreground">{pt.customsValueRow}</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.totalValue)} AZN</span>
              </div>

              {deliveryMethod === "postal" && !result.isExempt && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.exemptionLimit}</span>
                    <span className="text-sm font-medium text-green-600">−{fmt(POSTAL_EXEMPTION_LIMIT)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.taxableAmount}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.taxableAmount!)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.customsDutyRow} ({POSTAL_DUTY_RATE}%)</span>
                    <span className="text-sm font-medium text-amber-700">{fmt(result.customsDuty)} AZN</span>
                  </div>
                </>
              )}

              {deliveryMethod === "commercial" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.customsDutyRow} ({selectedCategory.dutyRate}%)</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.customsDuty)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.vatRow} ({selectedCategory.vatRate}%)</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                  </div>
                  {result.exciseAmount > 0 && (
                    <div className="flex justify-between px-5 py-3">
                      <span className="text-sm text-muted">{pt.exciseTax}</span>
                      <span className="text-sm font-medium text-foreground">{fmt(result.exciseAmount)} AZN</span>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">{pt.totalDutyRow}</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.totalDuty)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.totalCostRow}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.finalCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">{pt.goodsAndShipping}</span>
              <span className="text-muted">{pt.dutyAndTax}</span>
            </div>
            <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(result.totalValue / result.finalCost) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">
                {fmt(result.totalValue)} AZN ({((result.totalValue / result.finalCost) * 100).toFixed(1)}%)
              </span>
              <span className="font-medium text-amber-700">
                {fmt(result.totalDuty)} AZN ({((result.totalDuty / result.finalCost) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.warningTitle}</span> {pt.warningText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📦</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
