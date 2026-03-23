"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Azərbaycan kirayə vergisi qaydaları (2024)
// Vergi Məcəlləsi, Maddə 101, 124

type LandlordType = "individual" | "legal";
type PropertyUsage = "residential" | "commercial";

// Fiziki şəxs — sadələşdirilmiş vergi dərəcəsi
// Kirayə gəlirindən vergi: 14% (ümumi qayda)
const INDIVIDUAL_TAX_RATE = 0.14;

// Hüquqi şəxs — mənfəət vergisi
const LEGAL_TAX_RATE = 0.20;

// ƏDV həddi (illik dövriyyə)
const VAT_THRESHOLD = 200000; // AZN
const VAT_RATE = 0.18;

// Sadələşdirilmiş vergi (fiziki şəxs, kirayə gəliri)
// Aylıq gəlir 2000 AZN-dək — 4%
// Aylıq gəlir 2000+ AZN — 8%
const SIMPLIFIED_TIER1_LIMIT = 2000;
const SIMPLIFIED_TIER1_RATE = 0.04;
const SIMPLIFIED_TIER2_RATE = 0.08;

// Əmlak vergisi (illik, mülkiyyətçidən)
function getPropertyTax(annualValue: number): number {
  // Yaşayış sahəsi üçün əmlak vergisi (inventar dəyərindən)
  // Təxmini: kirayə gəlirinin ~1%-i
  return annualValue * 0.01;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function RentalTaxCalculator() {
  const [monthlyRent, setMonthlyRent] = useState("");
  const [landlordType, setLandlordType] = useState<LandlordType>("individual");
  const [propertyUsage, setPropertyUsage] = useState<PropertyUsage>("residential");
  const [expenses, setExpenses] = useState("");
  const [useSimplified, setUseSimplified] = useState(true);

  const result = useMemo(() => {
    const rent = parseFloat(monthlyRent);
    if (!rent || rent <= 0) return null;

    const monthlyExpenses = parseFloat(expenses) || 0;
    const annualRent = rent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const annualNet = annualRent - annualExpenses;

    let incomeTax = 0;
    let taxMethod = "";
    let taxRate = 0;
    let vatAmount = 0;
    let simplifiedTax = 0;
    let standardTax = 0;

    if (landlordType === "individual") {
      // Sadələşdirilmiş vergi hesablaması
      if (rent <= SIMPLIFIED_TIER1_LIMIT) {
        simplifiedTax = rent * SIMPLIFIED_TIER1_RATE;
      } else {
        simplifiedTax = SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE + (rent - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
      }

      // Standart vergi (14% gəlir vergisi)
      standardTax = Math.max(0, annualNet) * INDIVIDUAL_TAX_RATE / 12;

      if (useSimplified) {
        incomeTax = simplifiedTax;
        taxMethod = "Sadələşdirilmiş vergi";
        taxRate = rent <= SIMPLIFIED_TIER1_LIMIT ? SIMPLIFIED_TIER1_RATE : SIMPLIFIED_TIER2_RATE;
      } else {
        incomeTax = standardTax;
        taxMethod = "Gəlir vergisi (14%)";
        taxRate = INDIVIDUAL_TAX_RATE;
      }
    } else {
      // Hüquqi şəxs
      incomeTax = Math.max(0, annualNet) * LEGAL_TAX_RATE / 12;
      taxMethod = "Mənfəət vergisi (20%)";
      taxRate = LEGAL_TAX_RATE;

      // ƏDV (illik dövriyyə 200 000+ AZN)
      if (annualRent >= VAT_THRESHOLD) {
        vatAmount = rent * VAT_RATE;
      }
    }

    const propertyTax = getPropertyTax(annualRent) / 12;
    const totalMonthlyTax = incomeTax + vatAmount + propertyTax;
    const netIncome = rent - monthlyExpenses - totalMonthlyTax;
    const effectiveTaxRate = rent > 0 ? (totalMonthlyTax / rent) * 100 : 0;

    return {
      monthlyRent: rent,
      annualRent,
      monthlyExpenses,
      annualExpenses,
      annualNet,
      incomeTax,
      taxMethod,
      taxRate,
      vatAmount,
      propertyTax,
      totalMonthlyTax,
      totalAnnualTax: totalMonthlyTax * 12,
      netIncome,
      annualNetIncome: netIncome * 12,
      effectiveTaxRate,
      simplifiedTax,
      standardTax,
    };
  }, [monthlyRent, landlordType, propertyUsage, expenses, useSimplified]);

  return (
    <CalculatorLayout
      title="Kirayə vergisi hesablayıcısı"
      description="Kirayə gəlirindən ödəniləcək vergini hesablayın — sadələşdirilmiş və standart üsul müqayisəsi."
      breadcrumbs={[
        { label: "Daşınmaz Əmlak", href: "/?category=realestate" },
        { label: "Kirayə vergisi hesablayıcısı" },
      ]}
      formulaTitle="Kirayə gəlirindən vergi necə hesablanır?"
      formulaContent={`Fiziki şəxs — Sadələşdirilmiş vergi (kirayə gəlirindən):
• Aylıq 2000 AZN-dək: 4%
• Aylıq 2000+ AZN: 8%
Xərclər çıxılmır, verginin ödənişi sadədir.

Fiziki şəxs — Standart gəlir vergisi:
• Xalis gəlirdən (gəlir − xərclər) 14%
• Xərclərə daxildir: təmir, kommunal, amortizasiya, sığorta

Hüquqi şəxs:
• Mənfəət vergisi: xalis gəlirdən 20%
• ƏDV: illik dövriyyə 200 000+ AZN olduqda 18%

Əmlak vergisi (bütün mülkiyyətçilər):
• İllik, inventar dəyərindən ~1%

Hansı üsul sərfəlidir?
• Xərcləriniz azdırsa → sadələşdirilmiş (4–8%)
• Xərcləriniz çoxdursa (təmir, kommunal) → standart (14%, amma xərclər çıxılır)`}
      relatedIds={["rental-income-tax", "property-tax", "deposit", "mortgage"]}
    >
      {/* Landlord Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Mülkiyyətçinin statusu</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLandlordType("individual")}
            className={`p-4 rounded-xl border text-left transition-all ${
              landlordType === "individual"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">👤</span>
            <p className="text-sm font-medium text-foreground">Fiziki şəxs</p>
            <p className="text-xs text-muted mt-1">Sadələşdirilmiş və ya gəlir vergisi</p>
          </button>
          <button
            onClick={() => setLandlordType("legal")}
            className={`p-4 rounded-xl border text-left transition-all ${
              landlordType === "legal"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏢</span>
            <p className="text-sm font-medium text-foreground">Hüquqi şəxs</p>
            <p className="text-xs text-muted mt-1">Mənfəət vergisi + ƏDV</p>
          </button>
        </div>
      </div>

      {/* Property Usage */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Əmlakın istifadə təyinatı</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPropertyUsage("residential")}
            className={`p-3 rounded-xl border text-center transition-all ${
              propertyUsage === "residential"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-xl block mb-1">🏠</span>
            <p className="text-xs font-medium text-foreground">Yaşayış</p>
          </button>
          <button
            onClick={() => setPropertyUsage("commercial")}
            className={`p-3 rounded-xl border text-center transition-all ${
              propertyUsage === "commercial"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-xl block mb-1">🏪</span>
            <p className="text-xs font-medium text-foreground">Kommersiya</p>
          </button>
        </div>
      </div>

      {/* Tax Method (individual only) */}
      {landlordType === "individual" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">Vergitutma üsulu</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUseSimplified(true)}
              className={`p-4 rounded-xl border text-left transition-all ${
                useSimplified
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">Sadələşdirilmiş</p>
              <p className="text-xs text-muted mt-1">4–8% (xərclər çıxılmır)</p>
            </button>
            <button
              onClick={() => setUseSimplified(false)}
              className={`p-4 rounded-xl border text-left transition-all ${
                !useSimplified
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">Standart</p>
              <p className="text-xs text-muted mt-1">14% (xərclər çıxılır)</p>
            </button>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 Aylıq kirayə haqqı (AZN)
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            placeholder="800"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[500, 800, 1200, 2000, 3500].map((v) => (
              <button
                key={v}
                onClick={() => setMonthlyRent(String(v))}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🔧 Aylıq xərclər (AZN) <span className="text-muted font-normal">— ixtiyari</span>
          </label>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
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
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Aylıq kirayə</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.monthlyRent)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Aylıq vergi</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalMonthlyTax)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN ({result.effectiveTaxRate.toFixed(1)}%)</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Xalis gəlir</p>
              <p className="text-2xl font-bold">{fmt(result.netIncome)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              İllik hesablama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">İllik kirayə gəliri</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualRent)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik xərclər</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualExpenses)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik vergi</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.totalAnnualTax)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik xalis gəlir</p>
                <p className="text-lg font-bold text-primary">{fmt(result.annualNetIncome)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
            </div>
          </div>

          {/* Method Comparison (individual only) */}
          {landlordType === "individual" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>⚖️</span>
                  Üsul müqayisəsi — hansı sərfəlidir?
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className={`flex items-center justify-between px-5 py-4 ${useSimplified ? "bg-green-50" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sadələşdirilmiş vergi</p>
                    <p className="text-xs text-muted mt-0.5">
                      {result.monthlyRent <= SIMPLIFIED_TIER1_LIMIT ? "4%" : "4% + 8%"} — xərclər çıxılmır
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{fmt(result.simplifiedTax)} AZN/ay</p>
                    <p className="text-xs text-muted">{fmt(result.simplifiedTax * 12)} AZN/il</p>
                  </div>
                </div>
                <div className={`flex items-center justify-between px-5 py-4 ${!useSimplified ? "bg-green-50" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">Standart gəlir vergisi</p>
                    <p className="text-xs text-muted mt-0.5">14% — xərclər çıxılır</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{fmt(result.standardTax)} AZN/ay</p>
                    <p className="text-xs text-muted">{fmt(result.standardTax * 12)} AZN/il</p>
                  </div>
                </div>
                <div className="px-5 py-3 bg-green-50">
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <span>💡</span>
                    {result.simplifiedTax <= result.standardTax
                      ? `Sadələşdirilmiş üsul ${fmt(Math.abs(result.standardTax - result.simplifiedTax) * 12)} AZN/il qənaət edir`
                      : `Standart üsul ${fmt(Math.abs(result.simplifiedTax - result.standardTax) * 12)} AZN/il qənaət edir`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Ətraflı hesablama (aylıq)
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Kirayə haqqı</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.monthlyRent)} AZN</span>
              </div>
              {result.monthlyExpenses > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Xərclər</span>
                  <span className="text-sm font-medium text-red-600">−{fmt(result.monthlyExpenses)} AZN</span>
                </div>
              )}

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">Vergilər</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-muted">{result.taxMethod}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{fmt(result.incomeTax)} AZN</span>
              </div>

              {result.vatAmount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">ƏDV (18%)</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Əmlak vergisi (~1%/il)</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.propertyTax)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">Cəmi aylıq vergi</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.totalMonthlyTax)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Xalis aylıq gəlir</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.netIncome)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Kirayə gəlirinin bölgüsü</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${(Math.max(0, result.netIncome) / result.monthlyRent) * 100}%` }}
                title="Xalis gəlir"
              />
              {result.monthlyExpenses > 0 && (
                <div
                  className="h-full bg-gray-400"
                  style={{ width: `${(result.monthlyExpenses / result.monthlyRent) * 100}%` }}
                  title="Xərclər"
                />
              )}
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.incomeTax / result.monthlyRent) * 100}%` }}
                title="Gəlir vergisi"
              />
              {result.vatAmount > 0 && (
                <div
                  className="h-full bg-orange-400"
                  style={{ width: `${(result.vatAmount / result.monthlyRent) * 100}%` }}
                  title="ƏDV"
                />
              )}
              <div
                className="h-full bg-red-300"
                style={{ width: `${(result.propertyTax / result.monthlyRent) * 100}%` }}
                title="Əmlak vergisi"
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                Xalis: {fmt(result.netIncome)} ({((Math.max(0, result.netIncome) / result.monthlyRent) * 100).toFixed(0)}%)
              </span>
              {result.monthlyExpenses > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
                  Xərclər: {fmt(result.monthlyExpenses)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                Vergi: {fmt(result.incomeTax)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Kirayə müqaviləsi notarial qaydada təsdiq olunmalı və
              vergi orqanında qeydiyyatdan keçirilməlidir. Qeydiyyatsız kirayə gəliri vergidən yayınma sayılır
              və cərimə tətbiq oluna bilər. Vergi bəyannaməsi hər il 31 marta qədər verilməlidir.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏘️</span>
          <p>Nəticəni görmək üçün aylıq kirayə haqqını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
