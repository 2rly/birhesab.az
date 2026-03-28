"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type VehicleType = "petrol-diesel" | "hybrid" | "electric";

const vehicleTypesTranslations: Record<Lang, { value: VehicleType; label: string; icon: string }[]> = {
  az: [
    { value: "petrol-diesel", label: "Benzin / Dizel", icon: "⛽" },
    { value: "hybrid", label: "Hibrid", icon: "🔋" },
    { value: "electric", label: "Elektrik", icon: "⚡" },
  ],
  en: [
    { value: "petrol-diesel", label: "Petrol / Diesel", icon: "⛽" },
    { value: "hybrid", label: "Hybrid", icon: "🔋" },
    { value: "electric", label: "Electric", icon: "⚡" },
  ],
  ru: [
    { value: "petrol-diesel", label: "Бензин / Дизель", icon: "⛽" },
    { value: "hybrid", label: "Гибрид", icon: "🔋" },
    { value: "electric", label: "Электрический", icon: "⚡" },
  ],
};

const taxBrackets = [
  { min: 0, max: 1500, tax: 10, label: "1500 sm³-dək" },
  { min: 1501, max: 2000, tax: 20, label: "1501–2000 sm³" },
  { min: 2001, max: 2500, tax: 30, label: "2001–2500 sm³" },
  { min: 2501, max: 3000, tax: 50, label: "2501–3000 sm³" },
  { min: 3001, max: 3500, tax: 75, label: "3001–3500 sm³" },
  { min: 3501, max: 4000, tax: 100, label: "3501–4000 sm³" },
  { min: 4001, max: 4500, tax: 150, label: "4001–4500 sm³" },
  { min: 4501, max: 99999, tax: 200, label: "4500+ sm³" },
];

function getRoadTax(engineCc: number): number {
  const bracket = taxBrackets.find((b) => engineCc >= b.min && engineCc <= b.max);
  return bracket ? bracket.tax : 200;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Yol vergisi hesablayıcısı",
    description: "Azərbaycanda illik yol vergisini avtomobilin mühərrik həcminə görə hesablayın.",
    breadcrumbCategory: "Avtomobil",
    formulaTitle: "Yol vergisi necə hesablanır?",
    formulaContent: `Azərbaycanda illik yol vergisi mühərrik həcminə (sm³) görə müəyyən olunur:

• 1500 sm³-dək: 10 AZN
• 1501–2000 sm³: 20 AZN
• 2001–2500 sm³: 30 AZN
• 2501–3000 sm³: 50 AZN
• 3001–3500 sm³: 75 AZN
• 3501–4000 sm³: 100 AZN
• 4001–4500 sm³: 150 AZN
• 4500+ sm³: 200 AZN

Hibrid avtomobillər: mühərrik həcminin 70%-i əsas götürülür.
Elektrik avtomobilləri: yol vergisindən azaddır.

Yol vergisi hər il ödənilir və texniki baxışdan keçmək üçün tələb olunur.`,
    vehicleType: "Avtomobil növü",
    engineVolume: "Mühərrik həcmi (sm³)",
    hybridHint: "Hibrid: effektiv həcm = mühərrik həcmi x 70%",
    exemptTitle: "Yol vergisindən azad!",
    exemptDesc: "Elektrik avtomobilləri Azərbaycanda yol vergisindən azaddır.",
    annualTax: "İllik yol vergisi",
    engineVolumeLabel: "Mühərrik həcmi",
    effectiveVolume: "Effektiv həcm (70%)",
    monthlyEquivalent: "Aylıq ekvivalent",
    hybridDiscount: "Hibrid güzəşti",
    taxBracketTable: "Vergi pilləsi cədvəli",
    note: "Yol vergisi hər il ödənilir və texniki baxışdan keçmək üçün zəruridir. Vergini onlayn (e-gov.az) və ya bank vasitəsilə ödəmək mümkündür. Gecikdirmə halında cərimə tətbiq oluna bilər.",
    noteLabel: "Diqqət:",
    emptyStateText: "Nəticəni görmək üçün mühərrik həcmini daxil edin.",
  },
  en: {
    title: "Road Tax Calculator",
    description: "Calculate the annual road tax in Azerbaijan based on your vehicle's engine displacement.",
    breadcrumbCategory: "Automotive",
    formulaTitle: "How is road tax calculated?",
    formulaContent: `Annual road tax in Azerbaijan is determined by engine displacement (cc):

• Up to 1500 cc: 10 AZN
• 1501–2000 cc: 20 AZN
• 2001–2500 cc: 30 AZN
• 2501–3000 cc: 50 AZN
• 3001–3500 cc: 75 AZN
• 3501–4000 cc: 100 AZN
• 4001–4500 cc: 150 AZN
• 4500+ cc: 200 AZN

Hybrid vehicles: 70% of engine displacement is used as the base.
Electric vehicles: exempt from road tax.

Road tax is paid annually and is required for technical inspection.`,
    vehicleType: "Vehicle type",
    engineVolume: "Engine displacement (cc)",
    hybridHint: "Hybrid: effective displacement = engine displacement x 70%",
    exemptTitle: "Exempt from road tax!",
    exemptDesc: "Electric vehicles are exempt from road tax in Azerbaijan.",
    annualTax: "Annual road tax",
    engineVolumeLabel: "Engine displacement",
    effectiveVolume: "Effective displacement (70%)",
    monthlyEquivalent: "Monthly equivalent",
    hybridDiscount: "Hybrid discount",
    taxBracketTable: "Tax bracket table",
    note: "Road tax is paid annually and is required for technical inspection. You can pay online (e-gov.az) or via bank. Late payment may incur penalties.",
    noteLabel: "Note:",
    emptyStateText: "Enter the engine displacement to see the result.",
  },
  ru: {
    title: "Калькулятор дорожного налога",
    description: "Рассчитайте годовой дорожный налог в Азербайджане по объёму двигателя автомобиля.",
    breadcrumbCategory: "Автомобиль",
    formulaTitle: "Как рассчитывается дорожный налог?",
    formulaContent: `Годовой дорожный налог в Азербайджане определяется по объёму двигателя (см³):

• До 1500 см³: 10 AZN
• 1501–2000 см³: 20 AZN
• 2001–2500 см³: 30 AZN
• 2501–3000 см³: 50 AZN
• 3001–3500 см³: 75 AZN
• 3501–4000 см³: 100 AZN
• 4001–4500 см³: 150 AZN
• 4500+ см³: 200 AZN

Гибридные автомобили: за основу берётся 70% объёма двигателя.
Электромобили: освобождены от дорожного налога.

Дорожный налог уплачивается ежегодно и требуется для прохождения техосмотра.`,
    vehicleType: "Тип автомобиля",
    engineVolume: "Объём двигателя (см³)",
    hybridHint: "Гибрид: эффективный объём = объём двигателя × 70%",
    exemptTitle: "Освобождён от дорожного налога!",
    exemptDesc: "Электромобили в Азербайджане освобождены от дорожного налога.",
    annualTax: "Годовой дорожный налог",
    engineVolumeLabel: "Объём двигателя",
    effectiveVolume: "Эффективный объём (70%)",
    monthlyEquivalent: "Ежемесячный эквивалент",
    hybridDiscount: "Скидка для гибрида",
    taxBracketTable: "Таблица налоговых ставок",
    note: "Дорожный налог уплачивается ежегодно и необходим для прохождения техосмотра. Оплатить можно онлайн (e-gov.az) или через банк. За просрочку может начисляться штраф.",
    noteLabel: "Внимание:",
    emptyStateText: "Введите объём двигателя, чтобы увидеть результат.",
  },
};

export default function RoadTaxCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const vehicleTypes = vehicleTypesTranslations[lang];

  const [vehicleType, setVehicleType] = useState<VehicleType>("petrol-diesel");
  const [engineCc, setEngineCc] = useState("");

  const result = useMemo(() => {
    if (vehicleType === "electric") {
      return {
        tax: 0,
        vehicleType,
        isExempt: true,
        engineCc: 0,
      };
    }

    const cc = parseInt(engineCc);
    if (!cc || cc <= 0) return null;

    const effectiveCc = vehicleType === "hybrid" ? Math.round(cc * 0.7) : cc;
    const tax = getRoadTax(effectiveCc);
    const bracket = taxBrackets.find((b) => effectiveCc >= b.min && effectiveCc <= b.max);

    return {
      tax,
      vehicleType,
      isExempt: false,
      engineCc: cc,
      effectiveCc,
      bracket: bracket?.label || "",
    };
  }, [vehicleType, engineCc]);

  const maxTax = 200;

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
      relatedIds={["car-customs", "osago", "fuel-cost", "car-loan"]}
    >
      {/* Vehicle Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.vehicleType}</label>
        <div className="grid grid-cols-3 gap-3">
          {vehicleTypes.map((vt) => (
            <button
              key={vt.value}
              onClick={() => setVehicleType(vt.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                vehicleType === vt.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{vt.icon}</span>
              <p className="text-xs font-medium text-foreground">{vt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Engine CC Input */}
      {vehicleType !== "electric" && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            🔧 {pt.engineVolume}
          </label>
          <input
            type="number"
            value={engineCc}
            onChange={(e) => setEngineCc(e.target.value)}
            placeholder="1600"
            min="0"
            max="10000"
            className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          {vehicleType === "hybrid" && (
            <p className="text-xs text-muted mt-1">{pt.hybridHint}</p>
          )}
        </div>
      )}

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Electric Exemption */}
          {result.isExempt && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <h4 className="font-semibold text-green-800 mb-1">{pt.exemptTitle}</h4>
              <p className="text-sm text-green-600">
                {pt.exemptDesc}
              </p>
            </div>
          )}

          {!result.isExempt && (
            <>
              {/* Main Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">{pt.annualTax}</p>
                  <p className="text-3xl font-bold">{fmt(result.tax)}</p>
                  <p className="text-xs text-blue-200 mt-1">AZN / {lang === "ru" ? "год" : lang === "en" ? "year" : "il"}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">{pt.engineVolumeLabel}</p>
                  <p className="text-2xl font-bold text-foreground">{result.engineCc}</p>
                  <p className="text-xs text-muted mt-1">sm³</p>
                </div>

                {vehicleType === "hybrid" && result.effectiveCc && (
                  <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
                    <p className="text-sm text-blue-600 mb-1">{pt.effectiveVolume}</p>
                    <p className="text-2xl font-bold text-blue-700">{result.effectiveCc}</p>
                    <p className="text-xs text-blue-600 mt-1">sm³</p>
                  </div>
                )}

                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                  <p className="text-sm text-amber-600 mb-1">{pt.monthlyEquivalent}</p>
                  <p className="text-2xl font-bold text-amber-700">{fmt(result.tax / 12)}</p>
                  <p className="text-xs text-amber-600 mt-1">AZN / {lang === "ru" ? "мес." : lang === "en" ? "month" : "ay"}</p>
                </div>
              </div>

              {/* Hybrid Badge */}
              {vehicleType === "hybrid" && result.effectiveCc && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    🔋 {pt.hybridDiscount}: {result.engineCc} sm³ → {result.effectiveCc} sm³ (70%)
                  </span>
                </div>
              )}
            </>
          )}

          {/* Tax Brackets Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.taxBracketTable}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {taxBrackets.map((bracket) => {
                const isActive = !result.isExempt && result.effectiveCc
                  ? result.effectiveCc >= bracket.min && result.effectiveCc <= bracket.max
                  : !result.isExempt && result.engineCc >= bracket.min && result.engineCc <= bracket.max;

                return (
                  <div
                    key={bracket.label}
                    className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}
                  >
                    <span className={`text-sm ${isActive ? "font-semibold text-primary-dark" : "text-foreground"}`}>
                      {bracket.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isActive ? "bg-primary" : "bg-gray-300"}`}
                          style={{ width: `${(bracket.tax / maxTax) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium w-16 text-right ${isActive ? "text-primary-dark font-bold" : "text-foreground"}`}>
                        {bracket.tax} AZN
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
          <span className="text-4xl block mb-3">🚗</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
