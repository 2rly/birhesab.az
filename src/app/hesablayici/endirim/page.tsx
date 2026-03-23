"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Mode = "calculate" | "find-percent" | "stacking";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function DiscountCalculator() {
  const [mode, setMode] = useState<Mode>("calculate");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [discount1, setDiscount1] = useState("");
  const [discount2, setDiscount2] = useState("");
  const [discount3, setDiscount3] = useState("");

  const result = useMemo(() => {
    if (mode === "calculate") {
      const price = parseFloat(originalPrice);
      const disc = parseFloat(discountPercent);
      if (!price || price <= 0 || !disc) return null;

      const discountAmount = price * (disc / 100);
      const finalPrice = price - discountAmount;
      return { type: "calculate" as const, originalPrice: price, discountPercent: disc, discountAmount, finalPrice };
    }

    if (mode === "find-percent") {
      const orig = parseFloat(originalPrice);
      const sale = parseFloat(salePrice);
      if (!orig || orig <= 0 || !sale || sale < 0 || sale > orig) return null;

      const discountAmount = orig - sale;
      const discountPct = (discountAmount / orig) * 100;
      return { type: "find-percent" as const, originalPrice: orig, salePrice: sale, discountAmount, discountPct };
    }

    if (mode === "stacking") {
      const price = parseFloat(originalPrice);
      const d1 = parseFloat(discount1) || 0;
      const d2 = parseFloat(discount2) || 0;
      const d3 = parseFloat(discount3) || 0;
      if (!price || price <= 0) return null;

      let current = price;
      const steps: { label: string; discount: number; afterDiscount: number; price: number }[] = [];

      if (d1 > 0) {
        const disc = current * (d1 / 100);
        current -= disc;
        steps.push({ label: `1-ci endirim (${d1}%)`, discount: disc, afterDiscount: d1, price: current });
      }
      if (d2 > 0) {
        const disc = current * (d2 / 100);
        current -= disc;
        steps.push({ label: `2-ci endirim (${d2}%)`, discount: disc, afterDiscount: d2, price: current });
      }
      if (d3 > 0) {
        const disc = current * (d3 / 100);
        current -= disc;
        steps.push({ label: `3-cu endirim (${d3}%)`, discount: disc, afterDiscount: d3, price: current });
      }

      const totalSaved = price - current;
      const effectiveDiscount = (totalSaved / price) * 100;

      return { type: "stacking" as const, originalPrice: price, finalPrice: current, totalSaved, effectiveDiscount, steps };
    }

    return null;
  }, [mode, originalPrice, discountPercent, salePrice, discount1, discount2, discount3]);

  return (
    <CalculatorLayout
      title="Endirim hesablayıcısı"
      description="Endirimli qiymeti hesablayin, endirim faizini tapin ve ya ardicil endirimleri hesablayin."
      breadcrumbs={[
        { label: "Gundelik", href: "/?category=daily" },
        { label: "Endirim hesablayıcısı" },
      ]}
      formulaTitle="Endirim nece hesablanir?"
      formulaContent={`Endirim hesablamasi:
Endirim meblegi = Qiymet x (Endirim % / 100)
Son qiymet = Qiymet - Endirim meblegi

Endirim faizi tapmaq:
Endirim % = ((Ilkin qiymet - Son qiymet) / Ilkin qiymet) x 100

Ardicil endirimler:
2 endirim ust-uste geldikde, hereketde ferqli esas qiymet istifade olunur.
Meseleln: 100 AZN, 20% + 10% = 100 x 0.8 x 0.9 = 72 AZN (28% uygun endirim, 30% deyil!)`}
      relatedIds={["percentage", "vat", "tip", "currency"]}
    >
      {/* Mode Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setMode("calculate")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "calculate" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Endirim hesabla
        </button>
        <button
          onClick={() => setMode("find-percent")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "find-percent" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Faiz tap
        </button>
        <button
          onClick={() => setMode("stacking")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "stacking" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Ardicil endirim
        </button>
      </div>

      {/* Inputs */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ilkin qiymet (AZN)</label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="200"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>

          {mode === "calculate" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Endirim faizi (%)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="25"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
              {/* Quick buttons */}
              <div className="flex gap-2 mt-2">
                {[10, 20, 25, 30, 50, 70].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct.toString())}
                    className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                      discountPercent === pct.toString()
                        ? "border-primary bg-primary-light text-primary font-medium"
                        : "border-border bg-white text-muted hover:border-primary/30"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "find-percent" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Endirimli qiymet (AZN)</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="150"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          )}
        </div>

        {mode === "stacking" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">1-ci endirim (%)</label>
              <input
                type="number"
                value={discount1}
                onChange={(e) => setDiscount1(e.target.value)}
                placeholder="20"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">2-ci endirim (%)</label>
              <input
                type="number"
                value={discount2}
                onChange={(e) => setDiscount2(e.target.value)}
                placeholder="10"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">3-cu endirim (%)</label>
              <input
                type="number"
                value={discount3}
                onChange={(e) => setDiscount3(e.target.value)}
                placeholder="5"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {result.type === "calculate" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">Ilkin qiymet</p>
                  <p className="text-2xl font-bold text-foreground line-through">{fmt(result.originalPrice)}</p>
                  <p className="text-xs text-muted mt-1">AZN</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                  <p className="text-sm text-amber-600 mb-1">Qenaet ({result.discountPercent}%)</p>
                  <p className="text-2xl font-bold text-amber-700">{fmt(result.discountAmount)}</p>
                  <p className="text-xs text-amber-600 mt-1">AZN</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">Son qiymet</p>
                  <p className="text-2xl font-bold">{fmt(result.finalPrice)}</p>
                  <p className="text-xs text-blue-200 mt-1">AZN</p>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Odeyirsiniz</span>
                  <span className="text-muted">Qenaet</span>
                </div>
                <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(result.finalPrice / result.originalPrice) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-medium text-foreground">{fmt(result.finalPrice)} AZN</span>
                  <span className="font-medium text-amber-700">{fmt(result.discountAmount)} AZN</span>
                </div>
              </div>
            </>
          )}

          {result.type === "find-percent" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">Ilkin qiymet</p>
                  <p className="text-2xl font-bold text-foreground">{fmt(result.originalPrice)}</p>
                  <p className="text-xs text-muted mt-1">AZN</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">Endirim faizi</p>
                  <p className="text-2xl font-bold">{result.discountPct.toFixed(1)}%</p>
                  <p className="text-xs text-blue-200 mt-1">endirim</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                  <p className="text-sm text-amber-600 mb-1">Qenaet meblegi</p>
                  <p className="text-2xl font-bold text-amber-700">{fmt(result.discountAmount)}</p>
                  <p className="text-xs text-amber-600 mt-1">AZN</p>
                </div>
              </div>
            </>
          )}

          {result.type === "stacking" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">Ilkin qiymet</p>
                  <p className="text-2xl font-bold text-foreground line-through">{fmt(result.originalPrice)}</p>
                  <p className="text-xs text-muted mt-1">AZN</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">Son qiymet</p>
                  <p className="text-2xl font-bold">{fmt(result.finalPrice)}</p>
                  <p className="text-xs text-blue-200 mt-1">AZN</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                  <p className="text-sm text-amber-600 mb-1">Umumi qenaet ({result.effectiveDiscount.toFixed(1)}%)</p>
                  <p className="text-2xl font-bold text-amber-700">{fmt(result.totalSaved)}</p>
                  <p className="text-xs text-amber-600 mt-1">AZN</p>
                </div>
              </div>

              {/* Steps breakdown */}
              {result.steps.length > 0 && (
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground">Ardicil endirim addlmlari</h3>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="flex justify-between px-5 py-3">
                      <span className="text-sm text-muted">Baslangic qiymet</span>
                      <span className="text-sm font-medium text-foreground">{fmt(result.originalPrice)} AZN</span>
                    </div>
                    {result.steps.map((step, i) => (
                      <div key={i} className="flex justify-between px-5 py-3">
                        <span className="text-sm text-muted">{step.label}: -{fmt(step.discount)} AZN</span>
                        <span className="text-sm font-medium text-foreground">{fmt(step.price)} AZN</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-5 py-3 bg-blue-50">
                      <span className="text-sm font-semibold text-primary">Son qiymet (effektiv endirim: {result.effectiveDiscount.toFixed(1)}%)</span>
                      <span className="text-sm font-bold text-primary">{fmt(result.finalPrice)} AZN</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏷️</span>
          <p>Neticeni gormek ucun qiymeti daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
