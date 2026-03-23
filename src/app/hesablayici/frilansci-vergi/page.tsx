"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Azərbaycan frilansçı/fərdi sahibkar vergi qaydaları
// Vergi Məcəlləsi

type BusinessType = "individual-entrepreneur" | "micro-business";
type ActivityType = "trade" | "services";

// Fərdi sahibkar — sadələşdirilmiş vergi
const SIMPLIFIED_TRADE_RATE = 0.02; // 2% ticarət
const SIMPLIFIED_SERVICES_RATE = 0.04; // 4% xidmətlər

// Mikro biznes — gəlir vergisindən azad (illik <100K AZN)
const MICRO_BUSINESS_THRESHOLD = 100000; // AZN illik
const MICRO_BUSINESS_OVER_RATE = 0.02; // 100K+ üçün sadələşdirilmiş

// DSMF — könüllü (fərdi sahibkar)
const DSMF_VOLUNTARY_RATE = 0.25; // bəyan edilən məbləğin 25%-i

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function FreelancerTaxCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("individual-entrepreneur");
  const [activityType, setActivityType] = useState<ActivityType>("services");
  const [dsmfBase, setDsmfBase] = useState("");
  const [includeDsmf, setIncludeDsmf] = useState(true);

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome);
    if (!income || income <= 0) return null;

    const annualIncome = income * 12;
    let monthlyTax = 0;
    let taxRate = 0;
    let taxMethod = "";
    let taxDescription = "";

    if (businessType === "individual-entrepreneur") {
      if (activityType === "trade") {
        taxRate = SIMPLIFIED_TRADE_RATE;
        monthlyTax = income * taxRate;
        taxMethod = "Sadələşdirilmiş vergi (ticarət)";
        taxDescription = "Dövriyyənin 2%-i";
      } else {
        taxRate = SIMPLIFIED_SERVICES_RATE;
        monthlyTax = income * taxRate;
        taxMethod = "Sadələşdirilmiş vergi (xidmət)";
        taxDescription = "Dövriyyənin 4%-i";
      }
    } else {
      // Mikro biznes
      if (annualIncome < MICRO_BUSINESS_THRESHOLD) {
        taxRate = 0;
        monthlyTax = 0;
        taxMethod = "Mikro biznes (gəlir vergisindən azad)";
        taxDescription = "İllik gəlir 100 000 AZN-dən az olduqda vergi yoxdur";
      } else {
        taxRate = MICRO_BUSINESS_OVER_RATE;
        monthlyTax = income * taxRate;
        taxMethod = "Mikro biznes (hədd aşılıb)";
        taxDescription = "İllik gəlir 100 000+ AZN — sadələşdirilmiş 2%";
      }
    }

    // DSMF (könüllü)
    const dsmfDeclaredBase = parseFloat(dsmfBase) || 0;
    const monthlyDsmf = includeDsmf && dsmfDeclaredBase > 0 ? dsmfDeclaredBase * DSMF_VOLUNTARY_RATE : 0;

    const totalMonthlyPayment = monthlyTax + monthlyDsmf;
    const netMonthlyIncome = income - totalMonthlyPayment;

    const annualTax = monthlyTax * 12;
    const annualDsmf = monthlyDsmf * 12;
    const totalAnnualPayment = totalMonthlyPayment * 12;
    const annualNetIncome = netMonthlyIncome * 12;
    const effectiveTaxRate = income > 0 ? (totalMonthlyPayment / income) * 100 : 0;

    // Comparison between business types
    const ieTradeMonthly = income * SIMPLIFIED_TRADE_RATE;
    const ieServicesMonthly = income * SIMPLIFIED_SERVICES_RATE;
    const microMonthly = annualIncome < MICRO_BUSINESS_THRESHOLD ? 0 : income * MICRO_BUSINESS_OVER_RATE;

    return {
      income,
      annualIncome,
      monthlyTax,
      taxRate,
      taxMethod,
      taxDescription,
      monthlyDsmf,
      dsmfDeclaredBase,
      totalMonthlyPayment,
      netMonthlyIncome,
      annualTax,
      annualDsmf,
      totalAnnualPayment,
      annualNetIncome,
      effectiveTaxRate,
      ieTradeMonthly,
      ieServicesMonthly,
      microMonthly,
    };
  }, [monthlyIncome, businessType, activityType, dsmfBase, includeDsmf]);

  return (
    <CalculatorLayout
      title="Frilansçı vergi hesablayıcısı"
      description="Fərdi sahibkar və mikro biznes üçün vergi hesablaması — aylıq və illik."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Frilansçı vergi hesablayıcısı" },
      ]}
      formulaTitle="Frilansçı vergisi necə hesablanır?"
      formulaContent={`Fərdi sahibkar (sadələşdirilmiş vergi):
• Ticarət fəaliyyəti: dövriyyənin 2%-i
• Xidmət fəaliyyəti: dövriyyənin 4%-i
• ƏDV: illik dövriyyə 200 000+ AZN olduqda 18%

Mikro biznes:
• İllik gəlir 100 000 AZN-dək: gəlir vergisindən azaddır
• İllik gəlir 100 000+ AZN: sadələşdirilmiş vergi tətbiq olunur
• İşçi sayı: max 5 nəfər

DSMF (könüllü ödəniş):
• Fərdi sahibkarlar üçün könüllüdür
• Bəyan edilən məbləğin 25%-i
• Pensiya və sosial müdafiə hüququ verir

Nümunə (xidmət, aylıq 3000 AZN):
Vergi: 3000 × 4% = 120 AZN/ay
DSMF (500 AZN bazadan): 500 × 25% = 125 AZN/ay
Cəmi: 245 AZN/ay, Xalis: 2755 AZN/ay`}
      relatedIds={["salary", "dividend-tax", "vat", "rental-income-tax"]}
    >
      {/* Business Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Biznes statusu</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setBusinessType("individual-entrepreneur")}
            className={`p-4 rounded-xl border text-left transition-all ${
              businessType === "individual-entrepreneur"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">📋</span>
            <p className="text-sm font-medium text-foreground">Fərdi sahibkar</p>
            <p className="text-xs text-muted mt-1">Sadələşdirilmiş vergi: 2–4%</p>
          </button>
          <button
            onClick={() => setBusinessType("micro-business")}
            className={`p-4 rounded-xl border text-left transition-all ${
              businessType === "micro-business"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏪</span>
            <p className="text-sm font-medium text-foreground">Mikro biznes</p>
            <p className="text-xs text-muted mt-1">{"<"}100K AZN/il: vergi yoxdur</p>
          </button>
        </div>
      </div>

      {/* Activity Type (for individual entrepreneur) */}
      {businessType === "individual-entrepreneur" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">Fəaliyyət növü</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActivityType("services")}
              className={`p-4 rounded-xl border text-left transition-all ${
                activityType === "services"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">💻</span>
              <p className="text-sm font-medium text-foreground">Xidmət</p>
              <p className="text-xs text-muted mt-1">IT, konsaltinq, dizayn və s. — 4%</p>
            </button>
            <button
              onClick={() => setActivityType("trade")}
              className={`p-4 rounded-xl border text-left transition-all ${
                activityType === "trade"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">🛒</span>
              <p className="text-sm font-medium text-foreground">Ticarət</p>
              <p className="text-xs text-muted mt-1">Mal alqı-satqısı — 2%</p>
            </button>
          </div>
        </div>
      )}

      {/* Income Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          💰 Aylıq gəlir (AZN)
        </label>
        <input
          type="number"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
          placeholder="3000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[1000, 2000, 3000, 5000, 8000].map((v) => (
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

      {/* DSMF Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">DSMF (könüllü ödəniş)</label>
          <button
            onClick={() => setIncludeDsmf(!includeDsmf)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeDsmf ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeDsmf ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {includeDsmf && (
          <div>
            <label className="block text-xs text-muted mb-2">
              Bəyan edilən aylıq məbləğ (AZN) — DSMF bazası
            </label>
            <input
              type="number"
              value={dsmfBase}
              onChange={(e) => setDsmfBase(e.target.value)}
              placeholder="500"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">DSMF = bəyan edilən məbləğin 25%-i. Pensiya hüququ üçün tövsiyə olunur.</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Aylıq gəlir</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.income)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Aylıq ödənişlər</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalMonthlyPayment)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN ({result.effectiveTaxRate.toFixed(1)}%)</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Xalis gəlir</p>
              <p className="text-2xl font-bold">{fmt(result.netMonthlyIncome)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>
          </div>

          {/* Micro business status indicator */}
          {businessType === "micro-business" && result.annualIncome < MICRO_BUSINESS_THRESHOLD && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✅</span>
                Mikro biznes statusu — vergidən azad
              </h4>
              <p className="text-sm text-green-700">
                İllik gəliriniz {fmt(result.annualIncome)} AZN — 100 000 AZN həddindən aşağıdır.
                Gəlir vergisi ödəmirsiniz. Həddə qalan: {fmt(MICRO_BUSINESS_THRESHOLD - result.annualIncome)} AZN
              </p>
              <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(result.annualIncome / MICRO_BUSINESS_THRESHOLD) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-green-600 mt-1">
                <span>0 AZN</span>
                <span>100 000 AZN</span>
              </div>
            </div>
          )}

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              İllik hesablama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">İllik gəlir</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualIncome)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik vergi</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.annualTax)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik DSMF</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualDsmf)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik xalis gəlir</p>
                <p className="text-lg font-bold text-primary">{fmt(result.annualNetIncome)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
            </div>
          </div>

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
                <span className="text-sm text-muted">Aylıq gəlir</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.income)} AZN</span>
              </div>

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">Vergi və ödənişlər</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-muted">{result.taxMethod}</span>
                  <p className="text-xs text-muted">{result.taxDescription}</p>
                </div>
                <span className="text-sm font-medium text-foreground">{fmt(result.monthlyTax)} AZN</span>
              </div>

              {result.monthlyDsmf > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <div>
                    <span className="text-sm text-muted">DSMF (könüllü, 25%)</span>
                    <p className="text-xs text-muted">Baza: {fmt(result.dsmfDeclaredBase)} AZN</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">{fmt(result.monthlyDsmf)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">Cəmi aylıq ödəniş</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.totalMonthlyPayment)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Xalis aylıq gəlir</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.netMonthlyIncome)} AZN</span>
              </div>
            </div>
          </div>

          {/* Method Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>⚖️</span>
                Status müqayisəsi — {fmt(result.income)} AZN/ay üçün
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className={`flex items-center justify-between px-5 py-4 ${businessType === "individual-entrepreneur" && activityType === "services" ? "bg-green-50" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">Fərdi sahibkar (xidmət)</p>
                  <p className="text-xs text-muted mt-0.5">Sadələşdirilmiş vergi — 4%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(result.ieServicesMonthly)} AZN/ay</p>
                  <p className="text-xs text-muted">{fmt(result.ieServicesMonthly * 12)} AZN/il</p>
                </div>
              </div>
              <div className={`flex items-center justify-between px-5 py-4 ${businessType === "individual-entrepreneur" && activityType === "trade" ? "bg-green-50" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">Fərdi sahibkar (ticarət)</p>
                  <p className="text-xs text-muted mt-0.5">Sadələşdirilmiş vergi — 2%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(result.ieTradeMonthly)} AZN/ay</p>
                  <p className="text-xs text-muted">{fmt(result.ieTradeMonthly * 12)} AZN/il</p>
                </div>
              </div>
              <div className={`flex items-center justify-between px-5 py-4 ${businessType === "micro-business" ? "bg-green-50" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">Mikro biznes</p>
                  <p className="text-xs text-muted mt-0.5">
                    {result.annualIncome < MICRO_BUSINESS_THRESHOLD
                      ? "İllik <100K AZN — vergidən azad"
                      : "İllik 100K+ AZN — 2%"
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(result.microMonthly)} AZN/ay</p>
                  <p className="text-xs text-muted">{fmt(result.microMonthly * 12)} AZN/il</p>
                </div>
              </div>
              <div className="px-5 py-3 bg-green-50">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <span>💡</span>
                  {result.microMonthly === 0 && result.annualIncome < MICRO_BUSINESS_THRESHOLD
                    ? "Mikro biznes ən sərfəlidir — vergi yoxdur!"
                    : result.ieTradeMonthly <= result.ieServicesMonthly && result.ieTradeMonthly <= result.microMonthly
                      ? "Fərdi sahibkar (ticarət) ən sərfəlidir"
                      : result.microMonthly <= result.ieServicesMonthly
                        ? "Mikro biznes ən sərfəlidir"
                        : "Fərdi sahibkar (xidmət) statusu seçilib"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Gəlirin bölgüsü</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${(Math.max(0, result.netMonthlyIncome) / result.income) * 100}%` }}
                title="Xalis gəlir"
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.monthlyTax / result.income) * 100}%` }}
                title="Vergi"
              />
              {result.monthlyDsmf > 0 && (
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${(result.monthlyDsmf / result.income) * 100}%` }}
                  title="DSMF"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                Xalis: {fmt(result.netMonthlyIncome)} ({((Math.max(0, result.netMonthlyIncome) / result.income) * 100).toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                Vergi: {fmt(result.monthlyTax)} ({((result.monthlyTax / result.income) * 100).toFixed(0)}%)
              </span>
              {result.monthlyDsmf > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                  DSMF: {fmt(result.monthlyDsmf)} ({((result.monthlyDsmf / result.income) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Qeyd:</span> Fərdi sahibkar qeydiyyatı Vergilər Nazirliyinin e-taxes.gov.az
              portalından onlayn edilə bilər. Mikro biznes statusu üçün ASAN xidmətə müraciət edin. Vergi bəyannaməsi
              rüblük (hər rübdən sonrakı ayın 20-dək) verilməlidir. DSMF ödənişi pensiya yaşında təqaüd almaq üçün
              vacibdir — ən azı 25 il staj tələb olunur.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💼</span>
          <p>Nəticəni görmək üçün aylıq gəlirinizi daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
