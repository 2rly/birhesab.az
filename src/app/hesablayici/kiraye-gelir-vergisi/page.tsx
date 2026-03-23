"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Azərbaycan kirayə gəliri vergisi qaydaları
// Bu hesablayıcı kirayə gəlirindən tutulan vergini hesablayır
// kiraye-vergisi (mövcud) — mülkiyyətçi üçün ümumi kirayə vergisi
// kiraye-gelir-vergisi — xüsusi olaraq gəlir vergisi yanaşması

// Sadələşdirilmiş vergi yanaşması
const SIMPLIFIED_TIER1_LIMIT = 2000; // AZN/ay
const SIMPLIFIED_TIER1_RATE = 0.04; // 4%
const SIMPLIFIED_TIER2_RATE = 0.08; // 8%

// Standart yanaşma — gəlir vergisi
const STANDARD_TAX_RATE = 0.14; // 14%

type TaxMethod = "simplified" | "standard" | "compare";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function RentalIncomeTaxCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [taxMethod, setTaxMethod] = useState<TaxMethod>("compare");

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome);
    if (!income || income <= 0) return null;

    const expenses = parseFloat(monthlyExpenses) || 0;
    const annualIncome = income * 12;
    const annualExpenses = expenses * 12;

    // Sadələşdirilmiş vergi hesablaması
    let simplifiedMonthly: number;
    let simplifiedTier: string;
    if (income <= SIMPLIFIED_TIER1_LIMIT) {
      simplifiedMonthly = income * SIMPLIFIED_TIER1_RATE;
      simplifiedTier = "4% (2000 AZN-dək)";
    } else {
      simplifiedMonthly =
        SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE +
        (income - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
      simplifiedTier = "4% + 8% (2000+ AZN)";
    }
    const simplifiedAnnual = simplifiedMonthly * 12;
    const simplifiedNet = income - simplifiedMonthly;
    const simplifiedAnnualNet = simplifiedNet * 12;

    // Standart vergi hesablaması (14% mənfəətdən)
    const profit = Math.max(0, income - expenses);
    const standardMonthly = profit * STANDARD_TAX_RATE;
    const standardAnnual = standardMonthly * 12;
    const standardNet = income - expenses - standardMonthly;
    const standardAnnualNet = standardNet * 12;

    // Müqayisə
    const simplifiedBetter = simplifiedMonthly <= standardMonthly;
    const savings = Math.abs(simplifiedMonthly - standardMonthly);
    const annualSavings = savings * 12;

    // Effektiv vergi dərəcələri
    const simplifiedEffective = (simplifiedMonthly / income) * 100;
    const standardEffective = income > 0 ? (standardMonthly / income) * 100 : 0;

    // Breakeven xərc — hansı xərcdə standart üsul sərfəli olur
    // simplified = (income - expenses) * 0.14 => expenses = income - simplified / 0.14
    const breakevenExpenses = income - simplifiedMonthly / STANDARD_TAX_RATE;

    return {
      income,
      expenses,
      annualIncome,
      annualExpenses,
      simplifiedMonthly,
      simplifiedAnnual,
      simplifiedNet,
      simplifiedAnnualNet,
      simplifiedTier,
      simplifiedEffective,
      standardMonthly,
      standardAnnual,
      standardNet,
      standardAnnualNet,
      standardEffective,
      profit,
      simplifiedBetter,
      savings,
      annualSavings,
      breakevenExpenses: Math.max(0, breakevenExpenses),
    };
  }, [monthlyIncome, monthlyExpenses]);

  return (
    <CalculatorLayout
      title="Kirayə gəlir vergisi hesablayıcısı"
      description="Kirayə gəlirindən tutulan vergini hesablayın — sadələşdirilmiş və standart üsulun müqayisəsi."
      breadcrumbs={[
        { label: "Daşınmaz Əmlak", href: "/?category=realestate" },
        { label: "Kirayə gəlir vergisi hesablayıcısı" },
      ]}
      formulaTitle="Kirayə gəlir vergisi necə hesablanır?"
      formulaContent={`Sadələşdirilmiş vergi yanaşması:
• Aylıq gəlir 2000 AZN-dək: 4%
• Aylıq gəlir 2000+ AZN: ilk 2000-ə 4%, qalanına 8%
• Xərclər çıxılmır, vergi birbaşa gəlirdən hesablanır

Standart yanaşma (gəlir vergisi):
• Mənfəət = Gəlir − Xərclər (təmir, kommunal, amortizasiya, sığorta)
• Vergi = Mənfəət × 14%
• Xərclər sənədləşdirilməlidir

Nümunə (3000 AZN/ay, 500 AZN xərc):
Sadələşdirilmiş: 2000×4% + 1000×8% = 80+80 = 160 AZN/ay
Standart: (3000−500)×14% = 350 AZN/ay
Bu halda sadələşdirilmiş üsul 190 AZN/ay qənaət edir.

Nə vaxt standart üsul sərfəlidir?
Xərcləriniz yüksək olduqda (təmir, yenidənqurma və s.) standart üsul daha sərfəli ola bilər.`}
      relatedIds={["rental-tax", "property-tax", "deposit", "vat"]}
    >
      {/* Tax Method Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Hesablama rejimi</label>
        <div className="flex rounded-xl border border-border overflow-hidden">
          {([
            { value: "compare" as const, label: "Müqayisə" },
            { value: "simplified" as const, label: "Sadələşdirilmiş" },
            { value: "standard" as const, label: "Standart (14%)" },
          ]).map((m) => (
            <button
              key={m.value}
              onClick={() => setTaxMethod(m.value)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                taxMethod === m.value
                  ? "bg-primary text-white"
                  : "bg-white text-muted hover:bg-gray-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 Aylıq kirayə gəliri (AZN)
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="2000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[500, 1000, 2000, 3000, 5000].map((v) => (
              <button
                key={v}
                onClick={() => setMonthlyIncome(String(v))}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🔧 Aylıq xərclər (AZN) <span className="text-muted font-normal">— standart üsul üçün</span>
          </label>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <p className="text-xs text-muted mt-1">Təmir, kommunal, amortizasiya, sığorta və s.</p>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Comparison Mode — Main Cards */}
          {taxMethod === "compare" && (
            <>
              {/* Side by side comparison cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`rounded-2xl border p-6 ${result.simplifiedBetter ? "bg-green-50 border-green-200" : "bg-gray-50 border-border"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.simplifiedBetter && <span className="text-sm">✅</span>}
                    <h4 className="font-semibold text-foreground">Sadələşdirilmiş</h4>
                  </div>
                  <p className="text-xs text-muted mb-1">{result.simplifiedTier}</p>
                  <p className="text-2xl font-bold text-foreground mb-1">{fmt(result.simplifiedMonthly)} <span className="text-sm font-normal text-muted">AZN/ay</span></p>
                  <p className="text-sm text-muted">Xalis: <span className="font-semibold text-foreground">{fmt(result.simplifiedNet)} AZN/ay</span></p>
                  <p className="text-xs text-muted mt-1">Effektiv dərəcə: {result.simplifiedEffective.toFixed(1)}%</p>
                </div>

                <div className={`rounded-2xl border p-6 ${!result.simplifiedBetter ? "bg-green-50 border-green-200" : "bg-gray-50 border-border"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {!result.simplifiedBetter && <span className="text-sm">✅</span>}
                    <h4 className="font-semibold text-foreground">Standart (14%)</h4>
                  </div>
                  <p className="text-xs text-muted mb-1">Mənfəətdən: ({fmt(result.income)} − {fmt(result.expenses)}) × 14%</p>
                  <p className="text-2xl font-bold text-foreground mb-1">{fmt(result.standardMonthly)} <span className="text-sm font-normal text-muted">AZN/ay</span></p>
                  <p className="text-sm text-muted">Xalis: <span className="font-semibold text-foreground">{fmt(result.standardNet)} AZN/ay</span></p>
                  <p className="text-xs text-muted mt-1">Effektiv dərəcə: {result.standardEffective.toFixed(1)}%</p>
                </div>
              </div>

              {/* Savings Banner */}
              <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <span>💡</span>
                  {result.simplifiedBetter
                    ? `Sadələşdirilmiş üsul ayda ${fmt(result.savings)} AZN, ildə ${fmt(result.annualSavings)} AZN qənaət edir`
                    : `Standart üsul ayda ${fmt(result.savings)} AZN, ildə ${fmt(result.annualSavings)} AZN qənaət edir`
                  }
                </p>
                {result.breakevenExpenses > 0 && result.simplifiedBetter && (
                  <p className="text-xs text-green-600 mt-2">
                    Standart üsulun sərfəli olması üçün aylıq xərcləriniz {fmt(result.breakevenExpenses)} AZN-dən çox olmalıdır.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Simplified Only */}
          {taxMethod === "simplified" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">Aylıq gəlir</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.income)}</p>
                <p className="text-xs text-muted mt-1">AZN</p>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                <p className="text-sm text-amber-600 mb-1">Vergi ({result.simplifiedTier})</p>
                <p className="text-2xl font-bold text-amber-700">{fmt(result.simplifiedMonthly)}</p>
                <p className="text-xs text-amber-600 mt-1">AZN</p>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">Xalis gəlir</p>
                <p className="text-2xl font-bold">{fmt(result.simplifiedNet)}</p>
                <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
              </div>
            </div>
          )}

          {/* Standard Only */}
          {taxMethod === "standard" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">Aylıq mənfəət</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.profit)}</p>
                <p className="text-xs text-muted mt-1">AZN ({fmt(result.income)} − {fmt(result.expenses)})</p>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                <p className="text-sm text-amber-600 mb-1">Gəlir vergisi (14%)</p>
                <p className="text-2xl font-bold text-amber-700">{fmt(result.standardMonthly)}</p>
                <p className="text-xs text-amber-600 mt-1">AZN</p>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">Xalis gəlir</p>
                <p className="text-2xl font-bold">{fmt(result.standardNet)}</p>
                <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
              </div>
            </div>
          )}

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              İllik hesablama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Simplified annual */}
              <div className="bg-white rounded-xl p-4">
                <p className="text-xs font-semibold text-muted mb-3 uppercase tracking-wide">Sadələşdirilmiş</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted mb-1">İllik gəlir</p>
                    <p className="text-sm font-bold text-foreground">{fmt(result.annualIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">İllik vergi</p>
                    <p className="text-sm font-bold text-amber-700">{fmt(result.simplifiedAnnual)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">İllik xalis</p>
                    <p className="text-sm font-bold text-primary">{fmt(result.simplifiedAnnualNet)}</p>
                  </div>
                </div>
              </div>
              {/* Standard annual */}
              <div className="bg-white rounded-xl p-4">
                <p className="text-xs font-semibold text-muted mb-3 uppercase tracking-wide">Standart (14%)</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted mb-1">İllik gəlir</p>
                    <p className="text-sm font-bold text-foreground">{fmt(result.annualIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">İllik vergi</p>
                    <p className="text-sm font-bold text-amber-700">{fmt(result.standardAnnual)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">İllik xalis</p>
                    <p className="text-sm font-bold text-primary">{fmt(result.standardAnnualNet)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Ətraflı müqayisə (aylıq)
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-3 px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide"></span>
                <span className="text-xs font-semibold text-muted uppercase tracking-wide text-center">Sadələşdirilmiş</span>
                <span className="text-xs font-semibold text-muted uppercase tracking-wide text-center">Standart (14%)</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">Aylıq gəlir</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.income)}</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.income)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">Xərclər</span>
                <span className="text-sm text-muted text-center">çıxılmır</span>
                <span className="text-sm font-medium text-foreground text-center">−{fmt(result.expenses)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">Vergi bazası</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.income)}</span>
                <span className="text-sm font-medium text-foreground text-center">{fmt(result.profit)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3">
                <span className="text-sm text-muted">Vergi dərəcəsi</span>
                <span className="text-sm font-medium text-foreground text-center">{result.simplifiedTier}</span>
                <span className="text-sm font-medium text-foreground text-center">14%</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">Vergi məbləği</span>
                <span className="text-sm font-bold text-amber-700 text-center">{fmt(result.simplifiedMonthly)}</span>
                <span className="text-sm font-bold text-amber-700 text-center">{fmt(result.standardMonthly)}</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Xalis gəlir</span>
                <span className="text-sm font-bold text-primary-dark text-center">{fmt(result.simplifiedNet)}</span>
                <span className="text-sm font-bold text-primary-dark text-center">{fmt(result.standardNet)}</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Vergi yükü müqayisəsi</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Sadələşdirilmiş</span>
                  <span className="font-medium text-foreground">{fmt(result.simplifiedMonthly)} AZN ({result.simplifiedEffective.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${result.simplifiedEffective}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Standart (14%)</span>
                  <span className="font-medium text-foreground">{fmt(result.standardMonthly)} AZN ({result.standardEffective.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${result.standardEffective}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference — different amounts */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Sürətli müqayisə — müxtəlif kirayə məbləğləri
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-4 px-5 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-muted">Aylıq gəlir</span>
                <span className="text-xs font-semibold text-muted text-center">Sadələşdirilmiş</span>
                <span className="text-xs font-semibold text-muted text-center">Standart (14%)</span>
                <span className="text-xs font-semibold text-muted text-center">Sərfəli</span>
              </div>
              {[500, 1000, 2000, 3000, 5000, 8000].map((amount) => {
                const exp = parseFloat(monthlyExpenses) || 0;
                let simp: number;
                if (amount <= SIMPLIFIED_TIER1_LIMIT) {
                  simp = amount * SIMPLIFIED_TIER1_RATE;
                } else {
                  simp = SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE + (amount - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
                }
                const std = Math.max(0, amount - exp) * STANDARD_TAX_RATE;
                const isActive = Math.abs(amount - result.income) < 0.01;
                return (
                  <div key={amount} className={`grid grid-cols-4 px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <span className="text-sm font-medium text-foreground">{fmt(amount)} AZN</span>
                    <span className="text-sm text-amber-700 text-center">{fmt(simp)}</span>
                    <span className="text-sm text-orange-700 text-center">{fmt(std)}</span>
                    <span className="text-xs font-medium text-center text-green-700">
                      {simp <= std ? "Sadələşdirilmiş" : "Standart"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Qeyd:</span> Sadələşdirilmiş vergidə xərclər çıxılmır — vergi birbaşa
              gəlirdən hesablanır. Standart üsulda isə sənədləşdirilmiş xərclər (təmir, kommunal, amortizasiya, sığorta)
              gəlirdən çıxılır və vergi yalnız mənfəətdən tutulur. Kirayə müqaviləsi notarial qaydada təsdiq olunmalı
              və vergi orqanında qeydiyyatdan keçirilməlidir. Bəyannamə hər il 31 marta qədər verilməlidir.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏠</span>
          <p>Nəticəni görmək üçün aylıq kirayə gəlirini daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
