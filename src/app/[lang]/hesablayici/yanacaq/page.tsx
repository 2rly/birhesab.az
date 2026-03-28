"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type FuelType = "ai92" | "ai95" | "ai98" | "diesel" | "lpg";

const fuelTypesData: { value: FuelType; icon: string; price: number; labels: Record<Lang, string> }[] = [
  { value: "ai92", icon: "⛽", price: 1.15, labels: { az: "Aİ-92", en: "AI-92", ru: "АИ-92" } },
  { value: "ai95", icon: "⛽", price: 1.6, labels: { az: "Aİ-95", en: "AI-95", ru: "АИ-95" } },
  { value: "ai98", icon: "⛽", price: 2.3, labels: { az: "Aİ-98", en: "AI-98", ru: "АИ-98" } },
  { value: "diesel", icon: "🛢️", price: 1.1, labels: { az: "Dizel", en: "Diesel", ru: "Дизель" } },
  { value: "lpg", icon: "🔵", price: 0.45, labels: { az: "Qaz (LPG)", en: "Gas (LPG)", ru: "Газ (LPG)" } },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Yanacaq xərci hesablayıcısı",
    description: "Səfər üçün yanacaq xərcini, məsafə və yanacaq sərfiyyatına görə hesablayın.",
    breadcrumbCategory: "Avtomobil",
    formulaTitle: "Yanacaq xərci necə hesablanır?",
    formulaContent: `Yanacaq miqdarı = (Məsafə / 100) × Sərfiyyat (L/100km)
Ümumi xərc = Yanacaq miqdarı × Yanacağın qiyməti

Məsələn: 200 km, 8 L/100km, Aİ-92 (1.15 AZN/L)
Yanacaq = (200/100) × 8 = 16 litr
Xərc = 16 × 1.15 = 18.40 AZN

Azərbaycanda cari yanacaq qiymətləri:
• Aİ-92: 1.15 AZN/L
• Aİ-95: 1.60 AZN/L
• Aİ-98: 2.30 AZN/L
• Dizel: 1.10 AZN/L
• Qaz (LPG): 0.45 AZN/L`,
    fuelType: "Yanacaq növü",
    distance: "Məsafə (km)",
    consumption: "Sərfiyyat (L/100km)",
    fuelPrice: "Yanacaq qiyməti (AZN/L)",
    optional: "ixtiyari",
    roundTrip: "Gediş-gəliş",
    totalCost: "Ümumi xərc",
    fuelNeeded: "Lazım olan yanacaq",
    litre: "litr",
    costPerKm: "1 km-in dəyəri",
    roundTripLabel: "Gediş-gəliş",
    detailedCalc: "Ətraflı hesablama",
    distanceLabel: "Məsafə",
    consumptionLabel: "Sərfiyyat",
    fuelPriceLabel: "Yanacaq qiyməti",
    fuelNeededLabel: "Lazım olan yanacaq",
    costPerKmLabel: "1 km-in dəyəri",
    totalCostLabel: "Ümumi xərc",
    fuelComparison: "Yanacaq növləri ilə müqayisə",
    note: "Yanacaq qiymətləri SOCAR-ın rəsmi tariflərinə əsaslanır (2024). Faktiki sərfiyyat yol şəraitinə, sürətə, hava şəraitinə və avtomobilin texniki vəziyyətinə görə fərqlənə bilər.",
    noteLabel: "Diqqət:",
    emptyStateText: "Nəticəni görmək üçün məsafə və sərfiyyatı daxil edin.",
  },
  en: {
    title: "Fuel Cost Calculator",
    description: "Calculate the fuel cost for your trip based on distance and fuel consumption.",
    breadcrumbCategory: "Automotive",
    formulaTitle: "How is fuel cost calculated?",
    formulaContent: `Fuel amount = (Distance / 100) × Consumption (L/100km)
Total cost = Fuel amount × Fuel price

Example: 200 km, 8 L/100km, AI-92 (1.15 AZN/L)
Fuel = (200/100) × 8 = 16 litres
Cost = 16 × 1.15 = 18.40 AZN

Current fuel prices in Azerbaijan:
• AI-92: 1.15 AZN/L
• AI-95: 1.60 AZN/L
• AI-98: 2.30 AZN/L
• Diesel: 1.10 AZN/L
• Gas (LPG): 0.45 AZN/L`,
    fuelType: "Fuel type",
    distance: "Distance (km)",
    consumption: "Consumption (L/100km)",
    fuelPrice: "Fuel price (AZN/L)",
    optional: "optional",
    roundTrip: "Round trip",
    totalCost: "Total cost",
    fuelNeeded: "Fuel needed",
    litre: "litres",
    costPerKm: "Cost per km",
    roundTripLabel: "Round trip",
    detailedCalc: "Detailed calculation",
    distanceLabel: "Distance",
    consumptionLabel: "Consumption",
    fuelPriceLabel: "Fuel price",
    fuelNeededLabel: "Fuel needed",
    costPerKmLabel: "Cost per km",
    totalCostLabel: "Total cost",
    fuelComparison: "Comparison by fuel types",
    note: "Fuel prices are based on SOCAR's official tariffs (2024). Actual consumption may vary depending on road conditions, speed, weather, and vehicle condition.",
    noteLabel: "Note:",
    emptyStateText: "Enter distance and consumption to see the result.",
  },
  ru: {
    title: "Калькулятор расхода топлива",
    description: "Рассчитайте стоимость топлива для поездки по расстоянию и расходу топлива.",
    breadcrumbCategory: "Автомобиль",
    formulaTitle: "Как рассчитывается стоимость топлива?",
    formulaContent: `Количество топлива = (Расстояние / 100) × Расход (л/100км)
Общая стоимость = Количество топлива × Цена топлива

Пример: 200 км, 8 л/100км, АИ-92 (1.15 AZN/л)
Топливо = (200/100) × 8 = 16 литров
Стоимость = 16 × 1.15 = 18.40 AZN

Текущие цены на топливо в Азербайджане:
• АИ-92: 1.15 AZN/л
• АИ-95: 1.60 AZN/л
• АИ-98: 2.30 AZN/л
• Дизель: 1.10 AZN/л
• Газ (LPG): 0.45 AZN/л`,
    fuelType: "Тип топлива",
    distance: "Расстояние (км)",
    consumption: "Расход (л/100км)",
    fuelPrice: "Цена топлива (AZN/л)",
    optional: "необязательно",
    roundTrip: "Туда и обратно",
    totalCost: "Общая стоимость",
    fuelNeeded: "Необходимое топливо",
    litre: "литров",
    costPerKm: "Стоимость 1 км",
    roundTripLabel: "Туда и обратно",
    detailedCalc: "Подробный расчёт",
    distanceLabel: "Расстояние",
    consumptionLabel: "Расход",
    fuelPriceLabel: "Цена топлива",
    fuelNeededLabel: "Необходимое топливо",
    costPerKmLabel: "Стоимость 1 км",
    totalCostLabel: "Общая стоимость",
    fuelComparison: "Сравнение по видам топлива",
    note: "Цены на топливо основаны на официальных тарифах SOCAR (2024). Фактический расход может отличаться в зависимости от дорожных условий, скорости, погоды и состояния автомобиля.",
    noteLabel: "Внимание:",
    emptyStateText: "Введите расстояние и расход, чтобы увидеть результат.",
  },
};

export default function FuelCostCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [fuelType, setFuelType] = useState<FuelType>("ai92");
  const [distance, setDistance] = useState("");
  const [consumption, setConsumption] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const defaultPrice = fuelTypesData.find((f) => f.value === fuelType)?.price || 1.0;
  const effectivePrice = parseFloat(customPrice) || defaultPrice;

  const result = useMemo(() => {
    const dist = parseFloat(distance);
    const cons = parseFloat(consumption);
    if (!dist || dist <= 0 || !cons || cons <= 0) return null;

    const actualDistance = isRoundTrip ? dist * 2 : dist;
    const fuelNeeded = (actualDistance / 100) * cons;
    const totalCost = fuelNeeded * effectivePrice;
    const costPerKm = totalCost / actualDistance;

    return {
      distance: dist,
      actualDistance,
      consumption: cons,
      fuelNeeded,
      totalCost,
      costPerKm,
      fuelPrice: effectivePrice,
      isRoundTrip,
    };
  }, [distance, consumption, effectivePrice, isRoundTrip]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=automotive" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["road-tax", "osago", "car-customs", "car-loan"]}
    >
      {/* Fuel Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.fuelType}</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {fuelTypesData.map((ft) => (
            <button
              key={ft.value}
              onClick={() => {
                setFuelType(ft.value);
                setCustomPrice("");
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                fuelType === ft.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{ft.icon}</span>
              <p className="text-xs font-medium text-foreground">{ft.labels[lang]}</p>
              <p className="text-xs text-muted">{ft.price.toFixed(2)} AZN</p>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📍 {pt.distance}
          </label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="200"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            ⛽ {pt.consumption}
          </label>
          <input
            type="number"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            placeholder="8"
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💲 {pt.fuelPrice} <span className="text-muted font-normal">— {pt.optional}</span>
          </label>
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder={defaultPrice.toFixed(2)}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Round Trip Toggle */}
      <div className="mb-8">
        <button
          onClick={() => setIsRoundTrip(!isRoundTrip)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isRoundTrip
              ? "border-primary bg-primary-light text-primary-dark"
              : "border-border bg-white text-muted hover:border-primary/30"
          }`}
        >
          <div className={`w-10 h-5 rounded-full transition-colors relative ${isRoundTrip ? "bg-primary" : "bg-gray-300"}`}>
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                isRoundTrip ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm font-medium">{pt.roundTrip}</span>
        </button>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.totalCost}</p>
              <p className="text-3xl font-bold">{fmt(result.totalCost)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.fuelNeeded}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.fuelNeeded)}</p>
              <p className="text-xs text-muted mt-1">{pt.litre}</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.costPerKm}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.costPerKm)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN / km</p>
            </div>
          </div>

          {/* Round Trip Badge */}
          {result.isRoundTrip && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                🔄 {pt.roundTripLabel}: {result.distance} km × 2 = {result.actualDistance} km
              </span>
            </div>
          )}

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
                <span className="text-sm text-muted">{pt.distanceLabel}</span>
                <span className="text-sm font-medium text-foreground">
                  {result.actualDistance} km {result.isRoundTrip ? `(${result.distance} × 2)` : ""}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.consumptionLabel}</span>
                <span className="text-sm font-medium text-foreground">{result.consumption} L/100km</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.fuelPriceLabel}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.fuelPrice)} AZN/L</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.fuelNeededLabel}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.fuelNeeded)} L</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.costPerKmLabel}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.costPerKm)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.totalCostLabel}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.totalCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Fuel Type Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.fuelComparison}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {fuelTypesData.map((ft) => {
                const cost = (result.actualDistance / 100) * result.consumption * ft.price;
                const maxCost = (result.actualDistance / 100) * result.consumption * 2.3;
                const isActive = ft.value === fuelType;
                return (
                  <div
                    key={ft.value}
                    className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}
                  >
                    <span className={`text-sm ${isActive ? "font-semibold text-primary-dark" : "text-foreground"}`}>
                      {ft.icon} {ft.labels[lang]} ({ft.price.toFixed(2)} AZN/L)
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isActive ? "bg-primary" : "bg-gray-300"}`}
                          style={{ width: `${(cost / maxCost) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium w-20 text-right ${isActive ? "text-primary-dark font-bold" : "text-foreground"}`}>
                        {fmt(cost)} AZN
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.noteLabel}</span> {pt.note}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⛽</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
