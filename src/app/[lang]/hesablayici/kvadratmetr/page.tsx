"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

type CalcMode = "total-to-sqm" | "sqm-to-total";

const districtAverages = [
  { name: "Nəsimi", min: 2000, max: 3000, color: "bg-red-400" },
  { name: "Yasamal", min: 1500, max: 2500, color: "bg-orange-400" },
  { name: "Xətai", min: 1200, max: 2000, color: "bg-amber-400" },
  { name: "Binəqədi", min: 800, max: 1500, color: "bg-blue-400" },
  { name: "Suraxanı", min: 600, max: 1000, color: "bg-green-400" },
];

const pageTranslations = {
  az: {
    title: "Kvadratmetr qiyməti hesablayıcısı",
    description: "Daşınmaz əmlakın 1 m² qiymətini hesablayın və Bakı rayonları ilə müqayisə edin.",
    breadcrumbCategory: "Daşınmaz Əmlak",
    breadcrumbLabel: "Kvadratmetr qiyməti",
    formulaTitle: "Kvadratmetr qiyməti necə hesablanır?",
    formulaContent: `1 m² qiyməti = Ümumi qiymət / Sahə (m²)

Məsələn: 80 000 AZN / 60 m² = 1 333 AZN/m²

Əks hesablama:
Ümumi qiymət = 1 m² qiyməti × Sahə (m²)

Bakı rayonlarında orta qiymətlər (2024):
• Nəsimi: 2000–3000 AZN/m²
• Yasamal: 1500–2500 AZN/m²
• Xətai: 1200–2000 AZN/m²
• Binəqədi: 800–1500 AZN/m²
• Suraxanı: 600–1000 AZN/m²`,
    calcMode: "Hesablama rejimi",
    totalToSqmTitle: "Ümumi qiymətdən → m²",
    totalToSqmDesc: "Qiymət və sahə daxil edin",
    sqmToTotalTitle: "m² qiymətindən → ümumi",
    sqmToTotalDesc: "m² qiyməti və sahə daxil edin",
    totalPriceLabel: "Ümumi qiymət (AZN)",
    pricePerSqmLabel: "1 m² qiyməti (AZN)",
    areaLabel: "Sahə (m²)",
    pricePerSqmResult: "1 m² qiyməti",
    totalPriceResult: "Ümumi qiymət",
    areaResult: "Sahə",
    districtComparison: "Bakı rayonları ilə müqayisə",
    yourPrice: "Sizin qiymət",
    resultLabel: "Nəticə:",
    resultMatch: (name: string, min: string, max: string, price: string) =>
      `Sizin qiymət (${price} AZN/m²) ${name} rayonunun orta qiymət aralığına (${min}–${max} AZN/m²) uyğun gəlir.`,
    resultAbove: (price: string) =>
      `Sizin qiymət (${price} AZN/m²) Bakının ən bahalı rayonlarının orta qiymətindən yüksəkdir. Bu, premium segment və ya mərkəzi yerləşmə ola bilər.`,
    resultBelow: (price: string) =>
      `Sizin qiymət (${price} AZN/m²) Bakının ucuz rayonlarının orta qiymətindən aşağıdır. Bu, ətraflarda və ya tikintisi davam edən layihələr ola bilər.`,
    detailedCalc: "Ətraflı hesablama",
    emptyState: (mode: string) =>
      `Nəticəni görmək üçün ${mode === "total-to-sqm" ? "qiymət və sahə" : "m² qiyməti və sahə"} daxil edin.`,
  },
  en: {
    title: "Price per Square Meter Calculator",
    description: "Calculate the price per 1 m² of real estate and compare with Baku districts.",
    breadcrumbCategory: "Real Estate",
    breadcrumbLabel: "Price per sqm",
    formulaTitle: "How is the price per square meter calculated?",
    formulaContent: `Price per 1 m² = Total price / Area (m²)

Example: 80,000 AZN / 60 m² = 1,333 AZN/m²

Reverse calculation:
Total price = Price per 1 m² × Area (m²)

Average prices in Baku districts (2024):
• Nasimi: 2000–3000 AZN/m²
• Yasamal: 1500–2500 AZN/m²
• Khatai: 1200–2000 AZN/m²
• Binagadi: 800–1500 AZN/m²
• Surakhani: 600–1000 AZN/m²`,
    calcMode: "Calculation mode",
    totalToSqmTitle: "Total price → per m²",
    totalToSqmDesc: "Enter price and area",
    sqmToTotalTitle: "Per m² price → total",
    sqmToTotalDesc: "Enter price per m² and area",
    totalPriceLabel: "Total price (AZN)",
    pricePerSqmLabel: "Price per 1 m² (AZN)",
    areaLabel: "Area (m²)",
    pricePerSqmResult: "Price per 1 m²",
    totalPriceResult: "Total price",
    areaResult: "Area",
    districtComparison: "Comparison with Baku districts",
    yourPrice: "Your price",
    resultLabel: "Result:",
    resultMatch: (name: string, min: string, max: string, price: string) =>
      `Your price (${price} AZN/m²) falls within the average range of ${name} district (${min}–${max} AZN/m²).`,
    resultAbove: (price: string) =>
      `Your price (${price} AZN/m²) is above the average of Baku's most expensive districts. This may be a premium segment or central location.`,
    resultBelow: (price: string) =>
      `Your price (${price} AZN/m²) is below the average of Baku's cheapest districts. This may be in the suburbs or ongoing construction projects.`,
    detailedCalc: "Detailed calculation",
    emptyState: (mode: string) =>
      `Enter ${mode === "total-to-sqm" ? "price and area" : "price per m² and area"} to see the result.`,
  },
  ru: {
    title: "Калькулятор цены за квадратный метр",
    description: "Рассчитайте цену за 1 м² недвижимости и сравните с районами Баку.",
    breadcrumbCategory: "Недвижимость",
    breadcrumbLabel: "Цена за кв.м",
    formulaTitle: "Как рассчитывается цена за квадратный метр?",
    formulaContent: `Цена за 1 м² = Общая цена / Площадь (м²)

Пример: 80 000 AZN / 60 м² = 1 333 AZN/м²

Обратный расчёт:
Общая цена = Цена за 1 м² × Площадь (м²)

Средние цены в районах Баку (2024):
• Насими: 2000–3000 AZN/м²
• Ясамал: 1500–2500 AZN/м²
• Хатаи: 1200–2000 AZN/м²
• Бинагади: 800–1500 AZN/м²
• Сураханы: 600–1000 AZN/м²`,
    calcMode: "Режим расчёта",
    totalToSqmTitle: "Общая цена → за м²",
    totalToSqmDesc: "Введите цену и площадь",
    sqmToTotalTitle: "Цена за м² → общая",
    sqmToTotalDesc: "Введите цену за м² и площадь",
    totalPriceLabel: "Общая цена (AZN)",
    pricePerSqmLabel: "Цена за 1 м² (AZN)",
    areaLabel: "Площадь (м²)",
    pricePerSqmResult: "Цена за 1 м²",
    totalPriceResult: "Общая цена",
    areaResult: "Площадь",
    districtComparison: "Сравнение с районами Баку",
    yourPrice: "Ваша цена",
    resultLabel: "Результат:",
    resultMatch: (name: string, min: string, max: string, price: string) =>
      `Ваша цена (${price} AZN/м²) попадает в средний диапазон района ${name} (${min}–${max} AZN/м²).`,
    resultAbove: (price: string) =>
      `Ваша цена (${price} AZN/м²) выше среднего уровня самых дорогих районов Баку. Это может быть премиум-сегмент или центральное расположение.`,
    resultBelow: (price: string) =>
      `Ваша цена (${price} AZN/м²) ниже среднего уровня самых дешёвых районов Баку. Это могут быть пригороды или строящиеся проекты.`,
    detailedCalc: "Подробный расчёт",
    emptyState: (mode: string) =>
      `Введите ${mode === "total-to-sqm" ? "цену и площадь" : "цену за м² и площадь"}, чтобы увидеть результат.`,
  },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function fmtInt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function PricePerSqmCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [mode, setMode] = useState<CalcMode>("total-to-sqm");
  const [totalPrice, setTotalPrice] = useState("");
  const [area, setArea] = useState("");
  const [pricePerSqm, setPricePerSqm] = useState("");

  const result = useMemo(() => {
    if (mode === "total-to-sqm") {
      const price = parseFloat(totalPrice);
      const sqm = parseFloat(area);
      if (!price || price <= 0 || !sqm || sqm <= 0) return null;

      const perSqm = price / sqm;
      return {
        totalPrice: price,
        area: sqm,
        pricePerSqm: perSqm,
      };
    } else {
      const perSqm = parseFloat(pricePerSqm);
      const sqm = parseFloat(area);
      if (!perSqm || perSqm <= 0 || !sqm || sqm <= 0) return null;

      const total = perSqm * sqm;
      return {
        totalPrice: total,
        area: sqm,
        pricePerSqm: perSqm,
      };
    }
  }, [mode, totalPrice, area, pricePerSqm]);

  const maxDistrictPrice = Math.max(...districtAverages.map((d) => d.max));
  const barMax = result ? Math.max(maxDistrictPrice, result.pricePerSqm) * 1.1 : maxDistrictPrice * 1.1;

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
      relatedIds={["property-tax", "mortgage", "rental-tax", "notary-fee"]}
    >
      {/* Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.calcMode}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("total-to-sqm")}
            className={`p-3 rounded-xl border text-center transition-all ${
              mode === "total-to-sqm"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏠</span>
            <p className="text-xs font-medium text-foreground">{pt.totalToSqmTitle}</p>
            <p className="text-xs text-muted">{pt.totalToSqmDesc}</p>
          </button>
          <button
            onClick={() => setMode("sqm-to-total")}
            className={`p-3 rounded-xl border text-center transition-all ${
              mode === "sqm-to-total"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">📐</span>
            <p className="text-xs font-medium text-foreground">{pt.sqmToTotalTitle}</p>
            <p className="text-xs text-muted">{pt.sqmToTotalDesc}</p>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {mode === "total-to-sqm" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 {pt.totalPriceLabel}
            </label>
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="80000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💲 {pt.pricePerSqmLabel}
            </label>
            <input
              type="number"
              value={pricePerSqm}
              onChange={(e) => setPricePerSqm(e.target.value)}
              placeholder="1500"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📐 {pt.areaLabel}
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="60"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.pricePerSqmResult}</p>
              <p className="text-2xl font-bold">{fmt(result.pricePerSqm)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / m²</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.totalPriceResult}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.totalPrice)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.areaResult}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.area)}</p>
              <p className="text-xs text-amber-600 mt-1">m²</p>
            </div>
          </div>

          {/* District Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.districtComparison}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Your price indicator */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-24 shrink-0">{pt.yourPrice}</span>
                <div className="flex-1 relative">
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
                      style={{ width: `${Math.min((result.pricePerSqm / barMax) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-primary w-28 text-right">{fmtInt(result.pricePerSqm)} AZN</span>
              </div>

              {/* District bars */}
              {districtAverages.map((district) => {
                const avg = (district.min + district.max) / 2;
                return (
                  <div key={district.name} className="flex items-center gap-3">
                    <span className="text-sm text-muted w-24 shrink-0">{district.name}</span>
                    <div className="flex-1 relative">
                      <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${district.color} rounded-full opacity-60`}
                          style={{ width: `${(avg / barMax) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted w-28 text-right">{fmtInt(district.min)}–{fmtInt(district.max)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* District Match */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-sm text-blue-700 leading-relaxed">
              {(() => {
                const p = result.pricePerSqm;
                const match = districtAverages.find((d) => p >= d.min && p <= d.max);
                if (match) {
                  return (
                    <>
                      <span className="font-semibold">{pt.resultLabel}</span> {pt.resultMatch(match.name, fmtInt(match.min), fmtInt(match.max), fmtInt(p))}
                    </>
                  );
                } else if (p > districtAverages[0].max) {
                  return (
                    <>
                      <span className="font-semibold">{pt.resultLabel}</span> {pt.resultAbove(fmtInt(p))}
                    </>
                  );
                } else {
                  return (
                    <>
                      <span className="font-semibold">{pt.resultLabel}</span> {pt.resultBelow(fmtInt(p))}
                    </>
                  );
                }
              })()}
            </p>
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
                <span className="text-sm text-muted">{pt.totalPriceResult}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.totalPrice)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.areaResult}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.area)} m²</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.pricePerSqmResult}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.pricePerSqm)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏢</span>
          <p>{pt.emptyState(mode)}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
