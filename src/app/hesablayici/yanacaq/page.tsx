"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type FuelType = "ai92" | "ai95" | "ai98" | "diesel" | "lpg";

const fuelTypes: { value: FuelType; label: string; icon: string; price: number }[] = [
  { value: "ai92", label: "Aİ-92", icon: "⛽", price: 1.0 },
  { value: "ai95", label: "Aİ-95", icon: "⛽", price: 1.2 },
  { value: "ai98", label: "Aİ-98", icon: "⛽", price: 1.5 },
  { value: "diesel", label: "Dizel", icon: "🛢️", price: 0.9 },
  { value: "lpg", label: "Qaz (LPG)", icon: "🔵", price: 0.6 },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function FuelCostCalculator() {
  const [fuelType, setFuelType] = useState<FuelType>("ai92");
  const [distance, setDistance] = useState("");
  const [consumption, setConsumption] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const defaultPrice = fuelTypes.find((f) => f.value === fuelType)?.price || 1.0;
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
      title="Yanacaq xərci hesablayıcısı"
      description="Səfər üçün yanacaq xərcini, məsafə və yanacaq sərfiyyatına görə hesablayın."
      breadcrumbs={[
        { label: "Avtomobil", href: "/?category=automotive" },
        { label: "Yanacaq xərci" },
      ]}
      formulaTitle="Yanacaq xərci necə hesablanır?"
      formulaContent={`Yanacaq miqdarı = (Məsafə / 100) × Sərfiyyat (L/100km)
Ümumi xərc = Yanacaq miqdarı × Yanacağın qiyməti

Məsələn: 200 km, 8 L/100km, Aİ-92 (1.00 AZN/L)
Yanacaq = (200/100) × 8 = 16 litr
Xərc = 16 × 1.00 = 16.00 AZN

Azərbaycanda cari yanacaq qiymətləri (2024):
• Aİ-92: 1.00 AZN/L
• Aİ-95: 1.20 AZN/L
• Aİ-98: 1.50 AZN/L
• Dizel: 0.90 AZN/L
• Qaz (LPG): 0.60 AZN/L`}
      relatedIds={["road-tax", "osago", "car-customs", "car-loan"]}
    >
      {/* Fuel Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Yanacaq növü</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {fuelTypes.map((ft) => (
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
              <p className="text-xs font-medium text-foreground">{ft.label}</p>
              <p className="text-xs text-muted">{ft.price.toFixed(2)} AZN</p>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📍 Məsafə (km)
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
            ⛽ Sərfiyyat (L/100km)
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
            💲 Yanacaq qiyməti (AZN/L) <span className="text-muted font-normal">— ixtiyari</span>
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
          <span className="text-sm font-medium">Gediş-gəliş</span>
        </button>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Ümumi xərc</p>
              <p className="text-3xl font-bold">{fmt(result.totalCost)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Lazım olan yanacaq</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.fuelNeeded)}</p>
              <p className="text-xs text-muted mt-1">litr</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">1 km-in dəyəri</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.costPerKm)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN / km</p>
            </div>
          </div>

          {/* Round Trip Badge */}
          {result.isRoundTrip && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                🔄 Gediş-gəliş: {result.distance} km × 2 = {result.actualDistance} km
              </span>
            </div>
          )}

          {/* Breakdown Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Ətraflı hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Məsafə</span>
                <span className="text-sm font-medium text-foreground">
                  {result.actualDistance} km {result.isRoundTrip ? `(${result.distance} × 2)` : ""}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Sərfiyyat</span>
                <span className="text-sm font-medium text-foreground">{result.consumption} L/100km</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Yanacaq qiyməti</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.fuelPrice)} AZN/L</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Lazım olan yanacaq</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.fuelNeeded)} L</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">1 km-in dəyəri</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.costPerKm)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Ümumi xərc</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.totalCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Fuel Type Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Yanacaq növləri ilə müqayisə
              </h3>
            </div>
            <div className="divide-y divide-border">
              {fuelTypes.map((ft) => {
                const cost = (result.actualDistance / 100) * result.consumption * ft.price;
                const maxCost = (result.actualDistance / 100) * result.consumption * 1.5;
                const isActive = ft.value === fuelType;
                return (
                  <div
                    key={ft.value}
                    className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}
                  >
                    <span className={`text-sm ${isActive ? "font-semibold text-primary-dark" : "text-foreground"}`}>
                      {ft.icon} {ft.label} ({ft.price.toFixed(2)} AZN/L)
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
              <span className="font-semibold">Diqqət:</span> Yanacaq qiymətləri SOCAR-ın rəsmi tariflərinə
              əsaslanır (2024). Faktiki sərfiyyat yol şəraitinə, sürətə, hava şəraitinə və
              avtomobilin texniki vəziyyətinə görə fərqlənə bilər.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⛽</span>
          <p>Nəticəni görmək üçün məsafə və sərfiyyatı daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
