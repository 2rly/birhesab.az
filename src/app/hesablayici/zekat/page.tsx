"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Fitrə zəkatı — Qafqaz Müsəlmanları İdarəsi tərəfindən hər il elan olunur
// 2024-cü il üçün təxmini məbləğlər

const FITRE_RATES = [
  { id: "minimum", label: "Minimum (buğda)", amount: 5, description: "Buğda və ya un əsasında" },
  { id: "standard", label: "Standart (arpa)", amount: 7, description: "Arpa əsasında — ən çox istifadə olunan" },
  { id: "medium", label: "Orta (kişmiş)", amount: 12, description: "Kişmiş əsasında" },
  { id: "high", label: "Yüksək (xurma)", amount: 20, description: "Xurma əsasında" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function ZakatCalculator() {
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("2");
  const [selectedRate, setSelectedRate] = useState("standard");
  const [customAmount, setCustomAmount] = useState("");

  const result = useMemo(() => {
    const adultCount = parseInt(adults) || 0;
    const childCount = parseInt(children) || 0;
    const totalPersons = adultCount + childCount;

    if (totalPersons <= 0) return null;

    const rate = FITRE_RATES.find((r) => r.id === selectedRate);
    const perPerson = customAmount ? parseFloat(customAmount) || 0 : rate?.amount || 7;

    const totalFitre = totalPersons * perPerson;

    return {
      adultCount,
      childCount,
      totalPersons,
      perPerson,
      totalFitre,
    };
  }, [adults, children, selectedRate, customAmount]);

  return (
    <CalculatorLayout
      title="Fitrə zəkatı hesablayıcısı"
      description="Ailə üzvlərinin sayına görə fitrə zəkatı məbləğini hesablayın."
      breadcrumbs={[
        { label: "Din", href: "/?category=religion" },
        { label: "Fitrə zəkatı hesablayıcısı" },
      ]}
      formulaTitle="Fitrə zəkatı nədir?"
      formulaContent={`Fitrə zəkatı (sədəqətül-fitr) Ramazan ayının sonunda hər bir müsəlmanın
öz ailə üzvləri adından verdiyi vacib sədəqədir.

Kimin üçün verilir:
• Ailə başçısı özü və himayəsindəki hər kəs üçün verir
• Uşaqlar, yaşlılar, himayədəki şəxslər daxildir
• Bayram namazından əvvəl verilməlidir

Fitrə məbləği:
• Buğda əsasında (minimum): ~5 AZN/nəfər
• Arpa əsasında (standart): ~7 AZN/nəfər
• Kişmiş əsasında: ~12 AZN/nəfər
• Xurma əsasında: ~20 AZN/nəfər

Hesablama: Fitrə = Ailə üzvü sayı × Nəfər başına məbləğ

Qeyd: Dəqiq məbləğ hər il Qafqaz Müsəlmanları İdarəsi tərəfindən elan olunur.`}
      relatedIds={["ramadan", "age", "percentage", "currency"]}
    >
      {/* Family Members */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Ailə üzvləri</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl border border-border p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              👨‍👩 Böyüklər (18+ yaş)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdults(String(Math.max(0, (parseInt(adults) || 0) - 1)))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                min="0"
                max="20"
                className="w-16 text-center px-2 py-2 rounded-xl border border-border bg-white text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setAdults(String((parseInt(adults) || 0) + 1))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted">nəfər</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl border border-border p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              👶 Uşaqlar (18 yaşadək)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChildren(String(Math.max(0, (parseInt(children) || 0) - 1)))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                min="0"
                max="20"
                className="w-16 text-center px-2 py-2 rounded-xl border border-border bg-white text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setChildren(String((parseInt(children) || 0) + 1))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted">nəfər</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Fitrə miqdarı (nəfər başına)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FITRE_RATES.map((rate) => (
            <button
              key={rate.id}
              onClick={() => { setSelectedRate(rate.id); setCustomAmount(""); }}
              className={`p-4 rounded-xl border text-center transition-all ${
                selectedRate === rate.id && !customAmount
                  ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                  : "border-border bg-white hover:border-green-300"
              }`}
            >
              <p className="text-2xl font-bold text-foreground">{rate.amount}</p>
              <p className="text-[10px] text-muted">AZN</p>
              <p className="text-xs font-medium text-foreground mt-1">{rate.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{rate.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Və ya öz məbləğinizi daxil edin (AZN/nəfər)
        </label>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Xüsusi məbləğ"
          min="0"
          className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Result */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-green-100 mb-1">Ümumi fitrə zəkatı</p>
            <p className="text-5xl font-bold">{fmt(result.totalFitre)}</p>
            <p className="text-sm text-green-200 mt-1">AZN</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">Ailə üzvü sayı</p>
              <p className="text-2xl font-bold text-foreground">{result.totalPersons}</p>
              <p className="text-xs text-muted mt-1">
                {result.adultCount} böyük + {result.childCount} uşaq
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">Nəfər başına</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.perPerson)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
              <p className="text-xs text-green-600 mb-1">Ümumi</p>
              <p className="text-2xl font-bold text-green-700">{fmt(result.totalFitre)}</p>
              <p className="text-xs text-green-600 mt-1">AZN</p>
            </div>
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
              {result.adultCount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Böyüklər ({result.adultCount} × {fmt(result.perPerson)} AZN)</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.adultCount * result.perPerson)} AZN</span>
                </div>
              )}
              {result.childCount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Uşaqlar ({result.childCount} × {fmt(result.perPerson)} AZN)</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.childCount * result.perPerson)} AZN</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-4 bg-green-50">
                <span className="text-sm font-semibold text-green-700">Ümumi fitrə zəkatı</span>
                <span className="text-sm font-bold text-green-700">{fmt(result.totalFitre)} AZN</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Müxtəlif dərəcələr üzrə müqayisə ({result.totalPersons} nəfər)
              </h3>
            </div>
            <div className="divide-y divide-border">
              {FITRE_RATES.map((rate) => {
                const total = result.totalPersons * rate.amount;
                const isActive = selectedRate === rate.id && !customAmount;
                return (
                  <div key={rate.id} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-green-50" : ""}`}>
                    <div>
                      <p className={`text-sm ${isActive ? "font-semibold" : ""} text-foreground`}>{rate.label}</p>
                      <p className="text-xs text-muted">{rate.amount} AZN/nəfər</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{fmt(total)} AZN</p>
                      {isActive && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full">Seçilmiş</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span>🤲</span>
              Fitrə zəkatı haqqında
            </h4>
            <ul className="text-xs text-amber-700 space-y-1.5">
              <li>• Ramazan bayramı namazından əvvəl verilməlidir</li>
              <li>• Hər ailə üzvü üçün (uşaqlar daxil) ayrıca verilir</li>
              <li>• Ailə başçısı himayəsindəki hər kəs üçün verir</li>
              <li>• Yoxsullara, ehtiyacı olanlara verilir</li>
              <li>• Dəqiq məbləğ hər il QMİ tərəfindən elan olunur</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🤲</span>
          <p>Nəticəni görmək üçün ailə üzvü sayını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
