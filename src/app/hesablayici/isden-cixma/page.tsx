"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const DSMF_RATE = 0.03;
const UNEMPLOYMENT_RATE = 0.005;
const MEDICAL_RATE = 0.02;
const INCOME_TAX_RATE = 0.14;

type Reason = "layoff" | "agreement" | "voluntary" | "contract-end";

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCompensationMonths(years: number): number {
  if (years < 1) return 1;
  if (years < 5) return 1.4;
  if (years < 10) return 1.7;
  return 2;
}

function getCompensationLabel(years: number): string {
  if (years < 1) return "1 il-dək: 1 aylıq";
  if (years < 5) return "1-5 il: 1.4 aylıq";
  if (years < 10) return "5-10 il: 1.7 aylıq";
  return "10+ il: 2 aylıq";
}

const reasons: { value: Reason; label: string; description: string }[] = [
  {
    value: "layoff",
    label: "İşəgötürən tərəfindən ləğv (ixtisar)",
    description: "Tam kompensasiya ödənilir",
  },
  {
    value: "agreement",
    label: "Tərəflərin razılığı ilə",
    description: "Tam kompensasiya ödənilir",
  },
  {
    value: "voluntary",
    label: "İşçinin öz istəyi ilə",
    description: "Kompensasiya ödənilmir",
  },
  {
    value: "contract-end",
    label: "Müddətli müqavilənin bitməsi",
    description: "Proporsional kompensasiya",
  },
];

export default function SeverancePayCalculator() {
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState<Reason>("layoff");
  const [unusedVacationDays, setUnusedVacationDays] = useState("");

  const result = useMemo(() => {
    const monthlySalary = parseFloat(salary);
    const years = parseFloat(experience);
    if (!monthlySalary || monthlySalary <= 0 || isNaN(years) || years < 0) return null;

    const compensationMonths = getCompensationMonths(years);
    let grossCompensation = 0;
    let showCompensation = true;

    if (reason === "voluntary") {
      grossCompensation = 0;
      showCompensation = false;
    } else if (reason === "contract-end") {
      grossCompensation = monthlySalary * compensationMonths * 0.5;
    } else {
      grossCompensation = monthlySalary * compensationMonths;
    }

    // Unused vacation compensation
    const vacDays = parseFloat(unusedVacationDays) || 0;
    const dailyRate = (monthlySalary * 12) / 365;
    const vacationCompensation = dailyRate * vacDays;

    const totalGross = grossCompensation + vacationCompensation;

    // Tax deductions on total
    const dsmf = totalGross * DSMF_RATE;
    const unemployment = totalGross * UNEMPLOYMENT_RATE;
    const medical = totalGross * MEDICAL_RATE;
    const afterDeductions = totalGross - dsmf - unemployment - medical;
    const incomeTax = Math.max(0, afterDeductions) * INCOME_TAX_RATE;
    const totalDeductions = dsmf + unemployment + medical + incomeTax;
    const netAmount = totalGross - totalDeductions;

    return {
      compensationMonths,
      grossCompensation,
      vacationCompensation,
      dailyRate,
      totalGross,
      dsmf,
      unemployment,
      medical,
      incomeTax,
      totalDeductions,
      netAmount,
      showCompensation,
    };
  }, [salary, experience, reason, unusedVacationDays]);

  const years = parseFloat(experience) || 0;

  return (
    <CalculatorLayout
      title="İşdən çıxma hesablayıcısı"
      description="İşdən çıxma zamanı ödəniləcək kompensasiyanı və istifadə olunmamış məzuniyyət pulunu hesablayın."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "İşdən çıxma hesablayıcısı" },
      ]}
      formulaTitle="İşdən çıxma kompensasiyası necə hesablanır?"
      formulaContent={`Əmək Məcəlləsinin 77-ci maddəsinə görə:
• 1 ilədək staj: 1 aylıq orta əmək haqqı
• 1-5 il staj: 1.4 aylıq orta əmək haqqı
• 5-10 il staj: 1.7 aylıq orta əmək haqqı
• 10+ il staj: 2 aylıq orta əmək haqqı

İşdən çıxma səbəbinə görə:
• İxtisar / ləğv: tam kompensasiya
• Tərəflərin razılığı: tam kompensasiya
• İşçinin öz istəyi: kompensasiya yoxdur
• Müqavilə bitməsi: proporsional kompensasiya

İstifadə olunmamış məzuniyyət günləri də ödənilir.`}
      relatedIds={["salary", "vacation-pay", "unemployment-benefit", "business-trip"]}
    >
      {/* Inputs */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💵 Aylıq əmək haqqı (AZN)
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="2000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📅 İş stajı (il)
            </label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="5"
              min="0"
              step="0.5"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            {years > 0 && (
              <p className="text-xs text-muted mt-1">
                {getCompensationLabel(years)} əmək haqqı
              </p>
            )}
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📋 İşdən çıxma səbəbi
          </label>
          <div className="space-y-2">
            {reasons.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  reason === r.value
                    ? "border-primary bg-primary-light"
                    : "border-border bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reason === r.value ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    {reason === r.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted">{r.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Unused vacation days */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🏖️ İstifadə olunmamış məzuniyyət günləri
          </label>
          <input
            type="number"
            value={unusedVacationDays}
            onChange={(e) => setUnusedVacationDays(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Voluntary warning */}
          {reason === "voluntary" && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <p className="text-sm font-medium text-amber-700 flex items-center gap-2">
                <span>⚠️</span>
                İşçinin öz istəyi ilə işdən çıxdıqda kompensasiya ödənilmir. Yalnız istifadə olunmamış məzuniyyət günlərinin əvəzi ödənilir.
              </p>
            </div>
          )}

          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Net ödəniş</p>
              <p className="text-3xl font-bold">{formatMoney(result.netAmount)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN (əlinizə çatan)</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Gross ödəniş</p>
              <p className="text-3xl font-bold text-foreground">{formatMoney(result.totalGross)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Hesablama detalları
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.showCompensation && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">
                      Kompensasiya ({getCompensationLabel(years)})
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatMoney(result.grossCompensation)} AZN
                    </span>
                  </div>
                </>
              )}
              {result.vacationCompensation > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">
                    Məzuniyyət kompensasiyası ({unusedVacationDays} gün × {formatMoney(result.dailyRate)} AZN)
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatMoney(result.vacationCompensation)} AZN
                  </span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-foreground">Cəmi gross</span>
                <span className="text-sm font-bold text-foreground">{formatMoney(result.totalGross)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">DSMF (3%)</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.dsmf)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İşsizlik sığortası (0.5%)</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.unemployment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İcbari tibbi sığorta (2%)</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.medical)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Gəlir vergisi (14%)</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.incomeTax)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">Cəmi tutulma</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.totalDeductions)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Net ödəniş</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.netAmount)} AZN</span>
              </div>
            </div>
          </div>

          {/* Article 77 Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>⚖️</span>
              Əmək Məcəlləsi, Maddə 77
            </h4>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>1 ilədək staj</span>
                <span className={`font-medium ${years < 1 ? "text-primary" : "text-foreground"}`}>1 aylıq əmək haqqı</span>
              </div>
              <div className="flex justify-between">
                <span>1-5 il staj</span>
                <span className={`font-medium ${years >= 1 && years < 5 ? "text-primary" : "text-foreground"}`}>1.4 aylıq əmək haqqı</span>
              </div>
              <div className="flex justify-between">
                <span>5-10 il staj</span>
                <span className={`font-medium ${years >= 5 && years < 10 ? "text-primary" : "text-foreground"}`}>1.7 aylıq əmək haqqı</span>
              </div>
              <div className="flex justify-between">
                <span>10+ il staj</span>
                <span className={`font-medium ${years >= 10 ? "text-primary" : "text-foreground"}`}>2 aylıq əmək haqqı</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📋</span>
          <p>Nəticəni görmək üçün əmək haqqını və stajı daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
