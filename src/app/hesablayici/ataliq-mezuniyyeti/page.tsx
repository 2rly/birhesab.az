"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PaternityLeaveCalculator() {
  const [month1Salary, setMonth1Salary] = useState("");
  const [month2Salary, setMonth2Salary] = useState("");
  const [month1Days, setMonth1Days] = useState("");
  const [month2Days, setMonth2Days] = useState("");
  const [workDaysIn14, setWorkDaysIn14] = useState("10");

  const result = useMemo(() => {
    const salary1 = parseFloat(month1Salary);
    const salary2 = parseFloat(month2Salary);
    const days1 = parseInt(month1Days);
    const days2 = parseInt(month2Days);
    const wdIn14 = parseInt(workDaysIn14);

    if (!salary1 || salary1 <= 0 || !salary2 || salary2 <= 0) return null;
    if (!days1 || days1 <= 0 || !days2 || days2 <= 0) return null;
    if (!wdIn14 || wdIn14 <= 0) return null;

    // 1. Son 2 tam iş ayının əmək haqqı cəmi
    const totalSalary = salary1 + salary2;

    // 2. Cəmi faktiki işlənmiş iş günləri
    const totalWorkDays = days1 + days2;

    // 3. Orta günlük əmək haqqı = cəm ÷ faktiki iş günləri
    const dailyRate = totalSalary / totalWorkDays;

    // 4. Atalıq məzuniyyəti haqqı = günlük orta × 14 gündəki iş günləri
    const paternityPay = dailyRate * wdIn14;

    return {
      salary1, salary2, days1, days2,
      totalSalary, totalWorkDays, dailyRate,
      workDaysIn14: wdIn14, paternityPay,
    };
  }, [month1Salary, month2Salary, month1Days, month2Days, workDaysIn14]);

  return (
    <CalculatorLayout
      title="Atalıq məzuniyyəti hesablayıcısı"
      description="Atalıq məzuniyyəti haqqını hesablayın — Azərbaycan Əmək Məcəlləsinə uyğun (14 təqvim günü)."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Atalıq məzuniyyəti hesablayıcısı" },
      ]}
      formulaTitle="Atalıq məzuniyyəti haqqı necə hesablanır?"
      formulaContent={`Hesablama alqoritmi:

1. Məzuniyyətə çıxmazdan əvvəlki son 2 tam iş ayı götürülür
2. Orta günlük əmək haqqı = 2 ayın əmək haqqı cəmi ÷ 2 ayda faktiki işlənmiş iş günlərinin sayı
3. Məzuniyyət haqqı = Orta günlük əmək haqqı × 14 təqvim günü ərzində düşən iş günlərinin sayı

Qeyd:
• Atalıq məzuniyyəti 14 təqvim günü müddətindədir
• Hesablamada yalnız faktiki işlənmiş iş günləri nəzərə alınır
• 14 təqvim günündə adətən 10 iş günü olur (şənbə-bazar çıxılmaqla)`}
      relatedIds={["vacation-pay", "maternity-leave", "salary", "severance-pay"]}
    >
      {/* Qısa izah */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
        <p className="text-sm text-amber-800">
          Atalıq məzuniyyəti <span className="font-semibold">14 təqvim günü</span> müddətindədir.
          Hesablama üçün məzuniyyətə çıxmazdan əvvəlki <span className="font-semibold">son 2 tam iş ayının</span> məlumatları lazımdır.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        {/* 1-ci ay */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">1-ci ay (əvvəlki ay)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Əmək haqqı (AZN)</label>
              <input
                type="number"
                value={month1Salary}
                onChange={(e) => setMonth1Salary(e.target.value)}
                placeholder="1500"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Faktiki işlənmiş iş günləri</label>
              <input
                type="number"
                value={month1Days}
                onChange={(e) => setMonth1Days(e.target.value)}
                placeholder="22"
                min="1"
                max="31"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        </div>

        {/* 2-ci ay */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">2-ci ay (ondan əvvəlki ay)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Əmək haqqı (AZN)</label>
              <input
                type="number"
                value={month2Salary}
                onChange={(e) => setMonth2Salary(e.target.value)}
                placeholder="1500"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Faktiki işlənmiş iş günləri</label>
              <input
                type="number"
                value={month2Days}
                onChange={(e) => setMonth2Days(e.target.value)}
                placeholder="21"
                min="1"
                max="31"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        </div>

        {/* 14 gün ərzində iş günləri */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            14 təqvim günü ərzində düşən iş günləri
          </label>
          <input
            type="number"
            value={workDaysIn14}
            onChange={(e) => setWorkDaysIn14(e.target.value)}
            placeholder="10"
            min="1"
            max="14"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[8, 9, 10, 11, 12].map((d) => (
              <button
                key={d}
                onClick={() => setWorkDaysIn14(d.toString())}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  workDaysIn14 === d.toString()
                    ? "border-primary bg-primary-light text-primary font-medium"
                    : "border-border bg-white text-muted hover:border-primary/30"
                }`}
              >
                {d} gün
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-1">
            Adətən 14 təqvim günündə 10 iş günü olur (şənbə-bazar çıxılmaqla)
          </p>
        </div>
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">2 ayın əmək haqqı cəmi</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.totalSalary)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Orta günlük əmək haqqı</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.dailyRate)}</p>
              <p className="text-xs text-muted mt-1">AZN / gün</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Atalıq məzuniyyəti haqqı</p>
              <p className="text-2xl font-bold">{formatMoney(result.paternityPay)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN (14 təqvim günü)</p>
            </div>
          </div>

          {/* Addım-addım hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Hesablama addımları
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">1. Son 2 ayın əmək haqqı cəmi</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.totalSalary)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.salary1)} + {formatMoney(result.salary2)} = {formatMoney(result.totalSalary)} AZN
                  </p>
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">2. Cəmi faktiki iş günləri</span>
                  <span className="text-sm font-bold text-foreground">{result.totalWorkDays} gün</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {result.days1} gün + {result.days2} gün = {result.totalWorkDays} gün
                  </p>
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">3. Orta günlük əmək haqqı</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dailyRate)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.totalSalary)} ÷ {result.totalWorkDays} gün = {formatMoney(result.dailyRate)} AZN
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 bg-blue-50">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-primary">4. Atalıq məzuniyyəti haqqı</span>
                  <span className="text-sm font-bold text-primary">{formatMoney(result.paternityPay)} AZN</span>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.dailyRate)} × {result.workDaysIn14} iş günü = {formatMoney(result.paternityPay)} AZN
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Qanunvericilik məlumatı */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Atalıq məzuniyyəti haqqında
            </h4>
            <div className="space-y-2 text-sm text-muted">
              <p>Azərbaycan Əmək Məcəlləsinə əsasən atalıq məzuniyyəti <span className="font-medium text-foreground">14 təqvim günü</span> müddətindədir.</p>
              <p>Hesablama üçün məzuniyyətə çıxmazdan əvvəlki <span className="font-medium text-foreground">son 2 tam iş ayının</span> əmək haqqı və faktiki işlənmiş iş günləri nəzərə alınır.</p>
              <p>Orta günlük əmək haqqı, 14 təqvim günü ərzində düşən <span className="font-medium text-foreground">iş günlərinin sayına</span> vurulur.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">👨‍👶</span>
          <p>Nəticəni görmək üçün hər iki ayın məlumatlarını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
