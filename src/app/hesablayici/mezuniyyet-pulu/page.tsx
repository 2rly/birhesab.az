"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const DSMF_RATE = 0.03;
const UNEMPLOYMENT_RATE = 0.005;
const MEDICAL_RATE = 0.02;
const INCOME_TAX_EXEMPTION = 200;
const INCOME_TAX_RATE = 0.14;

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function VacationPayCalculator() {
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [vacationDays, setVacationDays] = useState("21");

  const result = useMemo(() => {
    const monthlySalary = parseFloat(salary);
    const days = parseInt(vacationDays);
    if (!monthlySalary || monthlySalary <= 0 || !days || days <= 0) return null;

    const dailyRate = (monthlySalary * 12) / 365;
    const grossVacationPay = dailyRate * days;

    const dsmf = grossVacationPay * DSMF_RATE;
    const unemployment = grossVacationPay * UNEMPLOYMENT_RATE;
    const medical = grossVacationPay * MEDICAL_RATE;

    const afterDeductions = grossVacationPay - dsmf - unemployment - medical;
    const taxableAmount = Math.max(0, afterDeductions - INCOME_TAX_EXEMPTION);
    const incomeTax = taxableAmount * INCOME_TAX_RATE;

    const totalDeductions = dsmf + unemployment + medical + incomeTax;
    const netVacationPay = grossVacationPay - totalDeductions;

    return {
      dailyRate,
      grossVacationPay,
      dsmf,
      unemployment,
      medical,
      incomeTax,
      totalDeductions,
      netVacationPay,
      taxableAmount,
    };
  }, [salary, vacationDays]);

  const expYears = parseFloat(experience) || 0;
  const extraDays = expYears >= 15 ? 6 : expYears >= 10 ? 4 : expYears >= 5 ? 2 : 0;

  return (
    <CalculatorLayout
      title="Məzuniyyət pulu hesablayıcısı"
      description="Aylıq əmək haqqına əsasən məzuniyyət pulunu və vergi tutulmalarını hesablayın."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Məzuniyyət pulu hesablayıcısı" },
      ]}
      formulaTitle="Məzuniyyət pulu necə hesablanır?"
      formulaContent={`Gündəlik əmək haqqı = (Aylıq əmək haqqı × 12) / 365
Məzuniyyət pulu = Gündəlik əmək haqqı × Məzuniyyət günləri

Tutulmalar:
• DSMF: 3%
• İşsizlik sığortası: 0.5%
• İcbari tibbi sığorta: 2%
• Gəlir vergisi: 14% (200 AZN azad hissədən sonra)

Əmək Məcəlləsi üzrə minimum məzuniyyət:
• Standart: 21 iş günü
• Ağır əmək şəraiti: +6 gün
• 5-10 il staj: +2 gün
• 10-15 il staj: +4 gün
• 15+ il staj: +6 gün`}
      relatedIds={["salary", "severance-pay", "business-trip", "overtime"]}
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
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            {extraDays > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Staja görə əlavə +{extraDays} gün məzuniyyət hüququ var
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🏖️ Məzuniyyət günləri
          </label>
          <input
            type="number"
            value={vacationDays}
            onChange={(e) => setVacationDays(e.target.value)}
            placeholder="21"
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          {/* Quick buttons */}
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
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Gündəlik rate</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.dailyRate)}</p>
              <p className="text-xs text-muted mt-1">AZN / gün</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Gross məzuniyyət pulu</p>
              <p className="text-2xl font-bold text-amber-700">{formatMoney(result.grossVacationPay)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Net məzuniyyət pulu</p>
              <p className="text-2xl font-bold">{formatMoney(result.netVacationPay)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN (əlinizə çatan)</p>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Tutulmalar
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Gross məzuniyyət pulu</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.grossVacationPay)} AZN</span>
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
                <span className="text-sm font-semibold text-primary">Net məzuniyyət pulu</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.netVacationPay)} AZN</span>
              </div>
            </div>
          </div>

          {/* Labor Code Info */}
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
                <span>Ağır əmək şəraiti</span>
                <span className="font-medium text-foreground">+6 gün</span>
              </div>
              <div className="flex justify-between">
                <span>5-10 il staj</span>
                <span className="font-medium text-foreground">+2 gün</span>
              </div>
              <div className="flex justify-between">
                <span>10-15 il staj</span>
                <span className="font-medium text-foreground">+4 gün</span>
              </div>
              <div className="flex justify-between">
                <span>15+ il staj</span>
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
