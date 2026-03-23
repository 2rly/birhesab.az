"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type VehicleType = "petrol-diesel" | "hybrid" | "electric";

const vehicleTypes: { value: VehicleType; label: string; icon: string }[] = [
  { value: "petrol-diesel", label: "Benzin / Dizel", icon: "⛽" },
  { value: "hybrid", label: "Hibrid", icon: "🔋" },
  { value: "electric", label: "Elektrik", icon: "⚡" },
];

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

export default function RoadTaxCalculator() {
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
      title="Yol vergisi hesablayıcısı"
      description="Azərbaycanda illik yol vergisini avtomobilin mühərrik həcminə görə hesablayın."
      breadcrumbs={[
        { label: "Avtomobil", href: "/?category=automotive" },
        { label: "Yol vergisi" },
      ]}
      formulaTitle="Yol vergisi necə hesablanır?"
      formulaContent={`Azərbaycanda illik yol vergisi mühərrik həcminə (sm³) görə müəyyən olunur:

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

Yol vergisi hər il ödənilir və texniki baxışdan keçmək üçün tələb olunur.`}
      relatedIds={["car-customs", "osago", "fuel-cost", "car-loan"]}
    >
      {/* Vehicle Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Avtomobil növü</label>
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
            🔧 Mühərrik həcmi (sm³)
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
            <p className="text-xs text-muted mt-1">Hibrid: effektiv həcm = mühərrik həcmi x 70%</p>
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
              <h4 className="font-semibold text-green-800 mb-1">Yol vergisindən azad!</h4>
              <p className="text-sm text-green-600">
                Elektrik avtomobilləri Azərbaycanda yol vergisindən azaddır.
              </p>
            </div>
          )}

          {!result.isExempt && (
            <>
              {/* Main Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">İllik yol vergisi</p>
                  <p className="text-3xl font-bold">{fmt(result.tax)}</p>
                  <p className="text-xs text-blue-200 mt-1">AZN / il</p>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">Mühərrik həcmi</p>
                  <p className="text-2xl font-bold text-foreground">{result.engineCc}</p>
                  <p className="text-xs text-muted mt-1">sm³</p>
                </div>

                {vehicleType === "hybrid" && result.effectiveCc && (
                  <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
                    <p className="text-sm text-blue-600 mb-1">Effektiv həcm (70%)</p>
                    <p className="text-2xl font-bold text-blue-700">{result.effectiveCc}</p>
                    <p className="text-xs text-blue-600 mt-1">sm³</p>
                  </div>
                )}

                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                  <p className="text-sm text-amber-600 mb-1">Aylıq ekvivalent</p>
                  <p className="text-2xl font-bold text-amber-700">{fmt(result.tax / 12)}</p>
                  <p className="text-xs text-amber-600 mt-1">AZN / ay</p>
                </div>
              </div>

              {/* Hybrid Badge */}
              {vehicleType === "hybrid" && result.effectiveCc && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    🔋 Hibrid güzəşti: {result.engineCc} sm³ → {result.effectiveCc} sm³ (70%)
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
                Vergi pilləsi cədvəli
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
              <span className="font-semibold">Diqqət:</span> Yol vergisi hər il ödənilir və texniki baxışdan
              keçmək üçün zəruridir. Vergini onlayn (e-gov.az) və ya bank vasitəsilə ödəmək mümkündür.
              Gecikdirmə halında cərimə tətbiq oluna bilər.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🚗</span>
          <p>Nəticəni görmək üçün mühərrik həcmini daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
