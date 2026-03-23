"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const MAX_BENEFIT = 250; // AZN/ay
const MIN_BENEFIT = 180; // AZN/ay
const TOTAL_WEEKS = 26;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function UnemploymentBenefitCalculator() {
  const [avgSalary, setAvgSalary] = useState("");
  const [workExperience, setWorkExperience] = useState("");

  const result = useMemo(() => {
    const salary = parseFloat(avgSalary);
    const experience = parseFloat(workExperience);
    if (!salary || salary <= 0) return null;
    if (!experience || experience < 1) return null;

    // 50% for first 3 months, 45% for next 3, 40% for remaining
    const month1_3 = Math.min(Math.max(salary * 0.5, MIN_BENEFIT), MAX_BENEFIT);
    const month4_6 = Math.min(Math.max(salary * 0.45, MIN_BENEFIT), MAX_BENEFIT);
    const monthRemaining = Math.min(Math.max(salary * 0.4, MIN_BENEFIT), MAX_BENEFIT);

    const rawMonth1_3 = salary * 0.5;
    const rawMonth4_6 = salary * 0.45;
    const rawMonthRemaining = salary * 0.4;

    const total6Months = month1_3 * 3 + month4_6 * 3;

    const months = [
      { month: 1, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 2, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 3, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 4, rate: "45%", raw: rawMonth4_6, adjusted: month4_6 },
      { month: 5, rate: "45%", raw: rawMonth4_6, adjusted: month4_6 },
      { month: 6, rate: "40%", raw: rawMonthRemaining, adjusted: monthRemaining },
    ];

    return {
      salary,
      month1_3,
      month4_6,
      monthRemaining,
      total6Months,
      months,
      rawMonth1_3,
      rawMonth4_6,
      rawMonthRemaining,
    };
  }, [avgSalary, workExperience]);

  return (
    <CalculatorLayout
      title="Issizlik muavineti hesablayıcısı"
      description="Azerbaycanda issizlik muavinetinin ayliq mebleghini ve muddetini hesablayin."
      breadcrumbs={[
        { label: "Huquq ve Dovlet", href: "/?category=legal" },
        { label: "Issizlik muavineti hesablayıcısı" },
      ]}
      formulaTitle="Issizlik muavineti nece hesablanir?"
      formulaContent={`Azerbaycan Emek ve Ehali Sosial Mudafie Nazirliyi:

Muavinetin meblegi:
- Ilk 3 ay: orta emek haqqinin 50%-i
- Novbeti 3 ay: orta emek haqqinin 45%-i
- Qalan aylar: orta emek haqqinin 40%-i

Hedler:
- Maksimum: ${MAX_BENEFIT} AZN / ay
- Minimum: ${MIN_BENEFIT} AZN / ay

Muavinet muddeti: ${TOTAL_WEEKS} hefte (teqriben 6 ay)

Sertler:
- Minimum 1 il is tecrubesi olmalidir
- DSMF-ye siyorta haqqi odenilmis olmalidir
- Mesgulluq Xidmetinde qeydiyyata alinmalidir`}
      relatedIds={["salary", "maternity-leave", "disability-benefit", "overtime"]}
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Orta ayliq emek haqqi (AZN)
          </label>
          <input
            type="number"
            value={avgSalary}
            onChange={(e) => setAvgSalary(e.target.value)}
            placeholder="800"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Is tecrubesi (il)
          </label>
          <input
            type="number"
            value={workExperience}
            onChange={(e) => setWorkExperience(e.target.value)}
            placeholder="3"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          {workExperience && parseFloat(workExperience) < 1 && (
            <p className="text-xs text-red-500 mt-1">Issizlik muavineti almaq ucun minimum 1 il is tecrubesi teleb olunur.</p>
          )}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Ilk 3 ay (ayliq)</p>
              <p className="text-3xl font-bold">{fmt(result.month1_3)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">4-6-ci aylar (ayliq)</p>
              <p className="text-3xl font-bold text-amber-700">{fmt(result.month4_6)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN / ay</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">6 ayin umumi muavineti</p>
              <p className="text-3xl font-bold text-foreground">{fmt(result.total6Months)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>Ayliq bolgu</span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.months.map((m) => (
                <div key={m.month} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{m.month}-ci ay</span>
                    <span className="text-xs bg-gray-100 text-muted px-2 py-0.5 rounded-full">{m.rate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">{fmt(m.adjusted)} AZN</span>
                    {m.raw !== m.adjusted && (
                      <p className="text-xs text-muted">hesablanan: {fmt(m.raw)} AZN</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Cemi (6 ay)</span>
                <span className="text-sm font-bold text-primary">{fmt(result.total6Months)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Bar - declining benefit */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Muavinet dinamikasi</p>
            {result.months.map((m) => (
              <div key={m.month} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-muted w-12">{m.month}-ci ay</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(m.adjusted / MAX_BENEFIT) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-20 text-right">{fmt(m.adjusted)}</span>
              </div>
            ))}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Qeyd:</span> Issizlik muavineti Mesgulluq Xidmetinde
              qeydiyyata alinmis sexslere verilir. Muavinet muddeti {TOTAL_WEEKS} heftedir. Maksimum meblegh
              {" "}{MAX_BENEFIT} AZN, minimum {MIN_BENEFIT} AZN-dir. Is teklifi reddi muavineti dayandirir.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📋</span>
          <p>Neticeni gormek ucun emek haqqini ve is tecrubeni daxil edin.</p>
          <p className="text-xs mt-1">Minimum 1 il is tecrubesi teleb olunur.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
