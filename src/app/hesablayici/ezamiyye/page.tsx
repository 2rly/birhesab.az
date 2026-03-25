"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const REGIONS = [
  { label: "Bakı şəhəri", norm: 125 },
  { label: "Naxçıvan şəhərləri", norm: 100 },
  { label: "Gəncə və Sumqayıt şəhərləri", norm: 95 },
  { label: "Digər şəhər, rayon mərkəzləri, qəsəbə və kəndlər", norm: 90 },
];

type Mode = "single" | "multicity";

interface Leg {
  id: number;
  regionIndex: number;
  days: string;
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcLeg(norm: number, numDays: number) {
  const dailyExpense = norm * 0.3 * numDays;
  const hotelExpense = numDays > 1 ? norm * 0.7 * (numDays - 1) : 0;
  return { dailyExpense, hotelExpense, total: dailyExpense + hotelExpense };
}

let nextId = 1;

export default function BusinessTripCalculator() {
  const [mode, setMode] = useState<Mode>("single");

  // Single mode state
  const [regionIndex, setRegionIndex] = useState(0);
  const [days, setDays] = useState("");

  // Multicity mode state
  const [legs, setLegs] = useState<Leg[]>([{ id: nextId++, regionIndex: 0, days: "" }]);

  const singleResult = useMemo(() => {
    const numDays = parseInt(days);
    if (!numDays || numDays <= 0) return null;
    const norm = REGIONS[regionIndex].norm;
    const { dailyExpense, hotelExpense, total } = calcLeg(norm, numDays);
    return { norm, numDays, dailyExpense, hotelExpense, total };
  }, [regionIndex, days]);

  const multiResult = useMemo(() => {
    const parsed = legs.map((leg) => {
      const numDays = parseInt(leg.days);
      if (!numDays || numDays <= 0) return null;
      const norm = REGIONS[leg.regionIndex].norm;
      const { dailyExpense, hotelExpense, total } = calcLeg(norm, numDays);
      return { norm, numDays, dailyExpense, hotelExpense, total, regionLabel: REGIONS[leg.regionIndex].label };
    });
    if (parsed.some((p) => p === null)) return null;
    const validLegs = parsed as NonNullable<(typeof parsed)[0]>[];
    const totalDaily = validLegs.reduce((s, l) => s + l.dailyExpense, 0);
    const totalHotel = validLegs.reduce((s, l) => s + l.hotelExpense, 0);
    const grandTotal = totalDaily + totalHotel;
    const totalDays = validLegs.reduce((s, l) => s + l.numDays, 0);
    return { legs: validLegs, totalDaily, totalHotel, grandTotal, totalDays };
  }, [legs]);

  const addLeg = () => {
    setLegs([...legs, { id: nextId++, regionIndex: 0, days: "" }]);
  };

  const removeLeg = (id: number) => {
    if (legs.length <= 1) return;
    setLegs(legs.filter((l) => l.id !== id));
  };

  const updateLeg = (id: number, field: "regionIndex" | "days", value: string | number) => {
    setLegs(legs.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const hasResult = mode === "single" ? !!singleResult : !!multiResult;

  return (
    <CalculatorLayout
      title="Ezamiyyə Xərci Kalkulyatoru"
      description="Ezamiyyət gündəlik norması, mehmanxana və ümumi xərcləri hesablayın."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Ezamiyyə hesablayıcısı" },
      ]}
      formulaTitle="Ezamiyyə xərcləri necə hesablanır?"
      formulaContent={`Gündəlik xərc (30%):
Norma × 30% × Gün sayı

Mehmanxana xərci (70%):
Norma × 70% × (Gün sayı − 1)

Yekun məbləğ = Gündəlik xərc + Mehmanxana xərci

Ərazilər üzrə normalar:
• Bakı şəhəri — 125 AZN
• Naxçıvan şəhərləri — 100 AZN
• Gəncə və Sumqayıt şəhərləri — 95 AZN
• Digər şəhər, rayon mərkəzləri, qəsəbə və kəndlər — 90 AZN

Qeyd: Marşrut üzrə ezamiyyədə hər ərazi ayrıca hesablanır. Sonuncu gün yalnız gündəlik xərc hesablanır (gecələmə xərci yoxdur).`}
      relatedIds={["salary", "vacation-pay", "severance-pay", "overtime"]}
    >
      {/* Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Ezamiyyə tək bir rayondur, yoxsa bir neçə?
        </label>
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "single"
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            Tək rayon
          </button>
          <button
            onClick={() => setMode("multicity")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "multicity"
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            Marşrut üzrə (Multicity)
          </button>
        </div>
      </div>

      {/* ── SINGLE MODE ── */}
      {mode === "single" && (
        <>
          {/* Region Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              1. Ezam olunacağınız ərazini seçin
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REGIONS.map((region, i) => (
                <button
                  key={i}
                  onClick={() => setRegionIndex(i)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all ${
                    regionIndex === i
                      ? "border-primary bg-primary-light ring-2 ring-primary/20"
                      : "border-border bg-white hover:border-primary/30"
                  }`}
                >
                  <span className={`block text-sm font-medium ${regionIndex === i ? "text-primary" : "text-foreground"}`}>
                    {region.label}
                  </span>
                  <span className={`block text-xs mt-0.5 ${regionIndex === i ? "text-primary" : "text-muted"}`}>
                    Norma: {region.norm} AZN
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Days Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              2. Ezamiyyət neçə təqvim günü davam edəcək?
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Məsələn: 4"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[2, 3, 5, 7, 10, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d.toString())}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                    days === d.toString()
                      ? "border-primary bg-primary-light text-primary font-medium"
                      : "border-border bg-white text-muted hover:border-primary/30"
                  }`}
                >
                  {d} gün
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── MULTICITY MODE ── */}
      {mode === "multicity" && (
        <>
          <div className="mb-4">
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-6">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <span>ℹ️</span>
                Sistem avtomatik olaraq sonuncu günü gecələmə xərci olmadan (yalnız gündəlik xərc) hesablayacaq.
              </p>
            </div>

            <div className="space-y-4">
              {legs.map((leg, idx) => (
                <div key={leg.id} className="bg-gray-50 rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">
                      Marşrut #{idx + 1}
                    </span>
                    {legs.length > 1 && (
                      <button
                        onClick={() => removeLeg(leg.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        ✕ Sil
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted mb-1">Ərazi</label>
                      <select
                        value={leg.regionIndex}
                        onChange={(e) => updateLeg(leg.id, "regionIndex", parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      >
                        {REGIONS.map((r, i) => (
                          <option key={i} value={i}>
                            {r.label} ({r.norm} AZN)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Gün sayı</label>
                      <input
                        type="number"
                        value={leg.days}
                        onChange={(e) => updateLeg(leg.id, "days", e.target.value)}
                        placeholder="Məs: 2"
                        min="1"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addLeg}
              className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm hover:bg-primary-light hover:border-primary/50 transition-all"
            >
              + Marşrut əlavə et
            </button>
          </div>
        </>
      )}

      {/* Taxi Note */}
      {hasResult && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <span>🚕</span>
            Taksi xərcləri gündəlik xərcə daxildir (Sənəd tələb olunmur)
          </p>
        </div>
      )}

      {/* ── SINGLE RESULTS ── */}
      {mode === "single" && singleResult && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">Yekun məbləğ</p>
            <p className="text-3xl font-bold">{formatMoney(singleResult.total)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">Gündəlik xərc (30%)</p>
              <p className="text-2xl font-bold text-green-700">{formatMoney(singleResult.dailyExpense)}</p>
              <p className="text-xs text-green-600 mt-1">
                {singleResult.norm} × 30% × {singleResult.numDays} gün
              </p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
              <p className="text-sm text-purple-600 mb-1">Mehmanxana xərci (70%)</p>
              <p className="text-2xl font-bold text-purple-700">{formatMoney(singleResult.hotelExpense)}</p>
              <p className="text-xs text-purple-600 mt-1">
                {singleResult.norm} × 70% × {singleResult.numDays > 1 ? singleResult.numDays - 1 : 0} gecə
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Hesablama cədvəli
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ərazi</span>
                <span className="text-sm font-medium text-foreground">{REGIONS[regionIndex].label}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Gündəlik norma</span>
                <span className="text-sm font-medium text-foreground">{singleResult.norm} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Gün sayı</span>
                <span className="text-sm font-medium text-foreground">{singleResult.numDays} gün</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">Gündəlik xərc ({singleResult.norm} × 30% × {singleResult.numDays})</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(singleResult.dailyExpense)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-purple-50">
                <span className="text-sm font-semibold text-purple-700">Mehmanxana ({singleResult.norm} × 70% × {singleResult.numDays > 1 ? singleResult.numDays - 1 : 0})</span>
                <span className="text-sm font-bold text-purple-700">{formatMoney(singleResult.hotelExpense)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Yekun məbləğ</span>
                <span className="text-sm font-bold text-primary">{formatMoney(singleResult.total)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MULTICITY RESULTS ── */}
      {mode === "multicity" && multiResult && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">Ümumi yekun məbləğ ({multiResult.totalDays} gün)</p>
            <p className="text-3xl font-bold">{formatMoney(multiResult.grandTotal)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">Ümumi gündəlik xərc (30%)</p>
              <p className="text-2xl font-bold text-green-700">{formatMoney(multiResult.totalDaily)}</p>
              <p className="text-xs text-green-600 mt-1">Bütün marşrutlar</p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
              <p className="text-sm text-purple-600 mb-1">Ümumi mehmanxana xərci (70%)</p>
              <p className="text-2xl font-bold text-purple-700">{formatMoney(multiResult.totalHotel)}</p>
              <p className="text-xs text-purple-600 mt-1">Bütün marşrutlar</p>
            </div>
          </div>

          {/* Per-leg breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Marşrut üzrə hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              {multiResult.legs.map((leg, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">
                      #{i + 1} {leg.regionLabel}
                    </span>
                    <span className="text-sm font-bold text-primary">{formatMoney(leg.total)} AZN</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                    <span>Gündəlik: {leg.norm} × 30% × {leg.numDays} = {formatMoney(leg.dailyExpense)} AZN</span>
                    <span>Mehmanxana: {leg.norm} × 70% × {leg.numDays > 1 ? leg.numDays - 1 : 0} = {formatMoney(leg.hotelExpense)} AZN</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Ümumi yekun</span>
                <span className="text-sm font-bold text-primary">{formatMoney(multiResult.grandTotal)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasResult && (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">✈️</span>
          <p>
            {mode === "single"
              ? "Nəticəni görmək üçün ərazini seçin və gün sayını daxil edin."
              : "Nəticəni görmək üçün hər marşrutun ərazisini və gün sayını daxil edin."}
          </p>
        </div>
      )}
    </CalculatorLayout>
  );
}
