"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type CalcMode = "total-to-sqm" | "sqm-to-total";

const districtAverages = [
  { name: "Nəsimi", min: 2000, max: 3000, color: "bg-red-400" },
  { name: "Yasamal", min: 1500, max: 2500, color: "bg-orange-400" },
  { name: "Xətai", min: 1200, max: 2000, color: "bg-amber-400" },
  { name: "Binəqədi", min: 800, max: 1500, color: "bg-blue-400" },
  { name: "Suraxanı", min: 600, max: 1000, color: "bg-green-400" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function fmtInt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function PricePerSqmCalculator() {
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
      title="Kvadratmetr qiyməti hesablayıcısı"
      description="Daşınmaz əmlakın 1 m² qiymətini hesablayın və Bakı rayonları ilə müqayisə edin."
      breadcrumbs={[
        { label: "Daşınmaz Əmlak", href: "/?category=realestate" },
        { label: "Kvadratmetr qiyməti" },
      ]}
      formulaTitle="Kvadratmetr qiyməti necə hesablanır?"
      formulaContent={`1 m² qiyməti = Ümumi qiymət / Sahə (m²)

Məsələn: 80 000 AZN / 60 m² = 1 333 AZN/m²

Əks hesablama:
Ümumi qiymət = 1 m² qiyməti × Sahə (m²)

Bakı rayonlarında orta qiymətlər (2024):
• Nəsimi: 2000–3000 AZN/m²
• Yasamal: 1500–2500 AZN/m²
• Xətai: 1200–2000 AZN/m²
• Binəqədi: 800–1500 AZN/m²
• Suraxanı: 600–1000 AZN/m²`}
      relatedIds={["property-tax", "mortgage", "rental-tax", "notary-fee"]}
    >
      {/* Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Hesablama rejimi</label>
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
            <p className="text-xs font-medium text-foreground">Ümumi qiymətdən → m²</p>
            <p className="text-xs text-muted">Qiymət və sahə daxil edin</p>
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
            <p className="text-xs font-medium text-foreground">m² qiymətindən → ümumi</p>
            <p className="text-xs text-muted">m² qiyməti və sahə daxil edin</p>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {mode === "total-to-sqm" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 Ümumi qiymət (AZN)
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
              💲 1 m² qiyməti (AZN)
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
            📐 Sahə (m²)
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
              <p className="text-sm text-blue-200 mb-1">1 m² qiyməti</p>
              <p className="text-2xl font-bold">{fmt(result.pricePerSqm)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / m²</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Ümumi qiymət</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.totalPrice)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Sahə</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.area)}</p>
              <p className="text-xs text-amber-600 mt-1">m²</p>
            </div>
          </div>

          {/* District Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Bakı rayonları ilə müqayisə
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Your price indicator */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-24 shrink-0">Sizin qiymət</span>
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
                      <span className="font-semibold">Nəticə:</span> Sizin qiymət ({fmtInt(p)} AZN/m²) {match.name} rayonunun orta qiymət aralığına ({fmtInt(match.min)}–{fmtInt(match.max)} AZN/m²) uyğun gəlir.
                    </>
                  );
                } else if (p > districtAverages[0].max) {
                  return (
                    <>
                      <span className="font-semibold">Nəticə:</span> Sizin qiymət ({fmtInt(p)} AZN/m²) Bakının ən bahalı rayonlarının orta qiymətindən yüksəkdir. Bu, premium segment və ya mərkəzi yerləşmə ola bilər.
                    </>
                  );
                } else {
                  return (
                    <>
                      <span className="font-semibold">Nəticə:</span> Sizin qiymət ({fmtInt(p)} AZN/m²) Bakının ucuz rayonlarının orta qiymətindən aşağıdır. Bu, ətraflarda və ya tikintisi davam edən layihələr ola bilər.
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
                Ətraflı hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ümumi qiymət</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.totalPrice)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Sahə</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.area)} m²</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">1 m² qiyməti</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.pricePerSqm)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏢</span>
          <p>Nəticəni görmək üçün {mode === "total-to-sqm" ? "qiymət və sahə" : "m² qiyməti və sahə"} daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
