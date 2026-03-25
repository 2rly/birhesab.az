"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
  "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type InputMode = "single" | "monthly";

export default function VacationPayCalculator() {
  const [inputMode, setInputMode] = useState<InputMode>("single");
  const [singleSalary, setSingleSalary] = useState("");
  const [monthlySalaries, setMonthlySalaries] = useState<string[]>(Array(12).fill(""));
  const [vacationDays, setVacationDays] = useState("21");
  const [experience, setExperience] = useState("");

  const updateMonth = (index: number, value: string) => {
    const updated = [...monthlySalaries];
    updated[index] = value;
    setMonthlySalaries(updated);
  };

  const fillAllMonths = () => {
    if (singleSalary) {
      setMonthlySalaries(Array(12).fill(singleSalary));
      setInputMode("monthly");
    }
  };

  const result = useMemo(() => {
    const days = parseInt(vacationDays);
    if (!days || days <= 0) return null;

    let totalYearlySalary: number;

    if (inputMode === "single") {
      const monthly = parseFloat(singleSalary);
      if (!monthly || monthly <= 0) return null;
      totalYearlySalary = monthly * 12;
    } else {
      const values = monthlySalaries.map((s) => parseFloat(s) || 0);
      const filledMonths = values.filter((v) => v > 0);
      if (filledMonths.length === 0) return null;
      totalYearlySalary = values.reduce((sum, v) => sum + v, 0);
    }

    const avgMonthlySalary = totalYearlySalary / 12;
    const dailyRate = avgMonthlySalary / 30.4;
    const vacationPay = dailyRate * days;

    return { totalYearlySalary, avgMonthlySalary, dailyRate, vacationPay, days };
  }, [inputMode, singleSalary, monthlySalaries, vacationDays]);

  const expYears = parseFloat(experience) || 0;
  const extraDays = expYears >= 15 ? 6 : expYears >= 10 ? 4 : expYears >= 5 ? 2 : 0;

  return (
    <CalculatorLayout
      title="Məzuniyyət pulu hesablayıcısı"
      description="Əmək haqqına əsasən məzuniyyət pulunu hesablayın — Azərbaycan Əmək Məcəlləsinə uyğun."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Məzuniyyət pulu hesablayıcısı" },
      ]}
      formulaTitle="Məzuniyyət pulu necə hesablanır?"
      formulaContent={`Hesablama alqoritmi:

1. Orta aylıq əmək haqqı = Son 12 ayın əmək haqqı cəmi ÷ 12
2. Bir günlük əmək haqqı = Orta aylıq əmək haqqı ÷ 30,4
3. Məzuniyyət haqqı = Bir günlük əmək haqqı × Məzuniyyət günləri

Əmək Məcəlləsi üzrə minimum məzuniyyət:
• Standart: 21 iş günü
• 5–10 il staj: +2 gün
• 10–15 il staj: +4 gün
• 15+ il staj: +6 gün
• Ağır əmək şəraiti: +6 gün`}
      relatedIds={["salary", "paternity-leave", "severance-pay", "overtime"]}
    >
      {/* Daxiletmə rejimi */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setInputMode("single")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            inputMode === "single"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Eyni maaş (12 ay)
        </button>
        <button
          onClick={() => setInputMode("monthly")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            inputMode === "monthly"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Hər ay ayrıca
        </button>
      </div>

      <div className="mb-8 space-y-4">
        {inputMode === "single" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Aylıq əmək haqqı (AZN)
            </label>
            <input
              type="number"
              value={singleSalary}
              onChange={(e) => setSingleSalary(e.target.value)}
              placeholder="2000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <div className="flex gap-2 mt-2">
              {[400, 1000, 1500, 2000, 3000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setSingleSalary(String(v))}
                  className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  {v}₼
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Son 12 ayın əmək haqqı (AZN)
              </label>
              {singleSalary && (
                <button
                  onClick={fillAllMonths}
                  className="text-xs text-primary hover:underline"
                >
                  Hamısını {singleSalary}₼ ilə doldur
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MONTH_NAMES.map((name, i) => (
                <div key={i}>
                  <label className="block text-xs text-muted mb-1">{name}</label>
                  <input
                    type="number"
                    value={monthlySalaries[i]}
                    onChange={(e) => updateMonth(i, e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Məzuniyyət günləri
            </label>
            <input
              type="number"
              value={vacationDays}
              onChange={(e) => setVacationDays(e.target.value)}
              placeholder="21"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <div className="flex gap-2 mt-2">
              {[21, 30, 42, 56].map((d) => (
                <button
                  key={d}
                  onClick={() => setVacationDays(d.toString())}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                    vacationDays === d.toString()
                      ? "border-primary bg-primary-light text-primary font-medium"
                      : "border-border bg-white text-muted hover:border-primary/30"
                  }`}
                >
                  {d} gün
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              İş stajı (il)
            </label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="5"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            {extraDays > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Staja görə əlavə +{extraDays} gün məzuniyyət hüququ var
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Orta aylıq əmək haqqı</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.avgMonthlySalary)}</p>
              <p className="text-xs text-muted mt-1">AZN / ay</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Bir günlük əmək haqqı</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.dailyRate)}</p>
              <p className="text-xs text-muted mt-1">AZN / gün</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Məzuniyyət haqqı</p>
              <p className="text-2xl font-bold">{formatMoney(result.vacationPay)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN ({result.days} gün)</p>
            </div>
          </div>

          {/* Addım-addım */}
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
                  <span className="text-sm font-medium text-foreground">1. Son 12 ayın əmək haqqı cəmi</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.totalYearlySalary)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {inputMode === "single"
                      ? `${formatMoney(result.avgMonthlySalary)} × 12 ay = ${formatMoney(result.totalYearlySalary)} AZN`
                      : `12 ayın cəmi = ${formatMoney(result.totalYearlySalary)} AZN`}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">2. Orta aylıq əmək haqqı</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.avgMonthlySalary)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.totalYearlySalary)} ÷ 12 = {formatMoney(result.avgMonthlySalary)} AZN
                  </p>
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">3. Bir günlük əmək haqqı</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dailyRate)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.avgMonthlySalary)} ÷ 30,4 = {formatMoney(result.dailyRate)} AZN
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 bg-blue-50">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-primary">4. Məzuniyyət haqqı</span>
                  <span className="text-sm font-bold text-primary">{formatMoney(result.vacationPay)} AZN</span>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.dailyRate)} × {result.days} gün = {formatMoney(result.vacationPay)} AZN
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Əmək Məcəlləsi */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Əmək Məcəlləsi üzrə məzuniyyət minimumları
            </h4>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>Standart</span>
                <span className="font-medium text-foreground">21 iş günü</span>
              </div>
              <div className="flex justify-between">
                <span>5–10 il staj</span>
                <span className="font-medium text-foreground">+2 gün</span>
              </div>
              <div className="flex justify-between">
                <span>10–15 il staj</span>
                <span className="font-medium text-foreground">+4 gün</span>
              </div>
              <div className="flex justify-between">
                <span>15+ il staj</span>
                <span className="font-medium text-foreground">+6 gün</span>
              </div>
              <div className="flex justify-between">
                <span>Ağır əmək şəraiti</span>
                <span className="font-medium text-foreground">+6 gün</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏖️</span>
          <p>Nəticəni görmək üçün əmək haqqını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
