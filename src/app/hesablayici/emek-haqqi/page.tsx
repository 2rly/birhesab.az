"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// 2024 Azerbaijan salary rules
const MINIMUM_WAGE = 345; // AZN
const DSMF_EMPLOYEE_RATE = 0.03; // 3%
const DSMF_EMPLOYER_RATE = 0.22; // 22%
const UNEMPLOYMENT_EMPLOYEE_RATE = 0.005; // 0.5%
const UNEMPLOYMENT_EMPLOYER_RATE = 0.005; // 0.5%
const MEDICAL_INSURANCE_RATE = 0.02; // 2% (icbari tibbi sığorta)

// Income tax brackets
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 8000) {
    return taxableIncome * 0.14;
  }
  return 8000 * 0.14 + (taxableIncome - 8000) * 0.25;
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Direction = "gross-to-net" | "net-to-gross";

export default function SalaryCalculator() {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("gross-to-net");

  const result = useMemo(() => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return null;

    if (direction === "gross-to-net") {
      const gross = value;

      // Employee deductions
      const dsmfEmployee = gross * DSMF_EMPLOYEE_RATE;
      const unemploymentEmployee = gross * UNEMPLOYMENT_EMPLOYEE_RATE;
      const medicalInsurance = gross * MEDICAL_INSURANCE_RATE;

      // Taxable income (after DSMF and unemployment)
      const taxableIncome = gross - dsmfEmployee - unemploymentEmployee - medicalInsurance;
      const incomeTax = calculateIncomeTax(taxableIncome > 0 ? taxableIncome : 0);

      const totalDeductions = dsmfEmployee + unemploymentEmployee + medicalInsurance + incomeTax;
      const net = gross - totalDeductions;

      // Employer costs
      const dsmfEmployer = gross * DSMF_EMPLOYER_RATE;
      const unemploymentEmployer = gross * UNEMPLOYMENT_EMPLOYER_RATE;
      const totalEmployerCost = gross + dsmfEmployer + unemploymentEmployer;

      return {
        gross,
        net: Math.max(0, net),
        dsmfEmployee,
        unemploymentEmployee,
        medicalInsurance,
        incomeTax,
        totalDeductions,
        dsmfEmployer,
        unemploymentEmployer,
        totalEmployerCost,
        taxableIncome: taxableIncome > 0 ? taxableIncome : 0,
      };
    } else {
      // Net to gross — iterative approach
      let gross = value;
      for (let i = 0; i < 100; i++) {
        const dsmfEmployee = gross * DSMF_EMPLOYEE_RATE;
        const unemploymentEmployee = gross * UNEMPLOYMENT_EMPLOYEE_RATE;
        const medicalInsurance = gross * MEDICAL_INSURANCE_RATE;
        const taxableIncome = gross - dsmfEmployee - unemploymentEmployee - medicalInsurance;
        const incomeTax = calculateIncomeTax(taxableIncome > 0 ? taxableIncome : 0);
        const net = gross - dsmfEmployee - unemploymentEmployee - medicalInsurance - incomeTax;
        const diff = value - net;
        if (Math.abs(diff) < 0.01) break;
        gross += diff;
      }

      const dsmfEmployee = gross * DSMF_EMPLOYEE_RATE;
      const unemploymentEmployee = gross * UNEMPLOYMENT_EMPLOYEE_RATE;
      const medicalInsurance = gross * MEDICAL_INSURANCE_RATE;
      const taxableIncome = gross - dsmfEmployee - unemploymentEmployee - medicalInsurance;
      const incomeTax = calculateIncomeTax(taxableIncome > 0 ? taxableIncome : 0);
      const totalDeductions = dsmfEmployee + unemploymentEmployee + medicalInsurance + incomeTax;

      const dsmfEmployer = gross * DSMF_EMPLOYER_RATE;
      const unemploymentEmployer = gross * UNEMPLOYMENT_EMPLOYER_RATE;
      const totalEmployerCost = gross + dsmfEmployer + unemploymentEmployer;

      return {
        gross,
        net: value,
        dsmfEmployee,
        unemploymentEmployee,
        medicalInsurance,
        incomeTax,
        totalDeductions,
        dsmfEmployer,
        unemploymentEmployer,
        totalEmployerCost,
        taxableIncome: taxableIncome > 0 ? taxableIncome : 0,
      };
    }
  }, [amount, direction]);

  return (
    <CalculatorLayout
      title="Əmək haqqı hesablayıcısı"
      description="Gross və ya net əmək haqqını daxil edin — bütün vergi və tutulmaları ani hesablayın."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Əmək haqqı hesablayıcısı" },
      ]}
      formulaTitle="Əmək haqqından tutulmalar necə hesablanır?"
      formulaContent={`İşçidən tutulan:
• DSMF (Dövlət Sosial Müdafiə Fondu): 3%
• İşsizlik sığortası: 0.5%
• İcbari tibbi sığorta: 2%
• Gəlir vergisi: 14% (8000 AZN-dək), 25% (8000 AZN-dən yuxarı)

Vergiyə cəlb olunan məbləğ = Gross − DSMF − İşsizlik − Tibbi sığorta

İşəgötürən tərəfdən:
• DSMF: 22%
• İşsizlik sığortası: 0.5%

Minimum əmək haqqı: ${MINIMUM_WAGE} AZN (2024)`}
      relatedIds={["overtime", "freelancer-tax", "rental-income-tax", "loan"]}
    >
      {/* Direction Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setDirection("gross-to-net")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "gross-to-net"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Gross → Net
        </button>
        <button
          onClick={() => setDirection("net-to-gross")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "net-to-gross"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Net → Gross
        </button>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          💵 {direction === "gross-to-net" ? "Gross əmək haqqı" : "Net əmək haqqı (əlinizə çatan)"} (AZN)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={direction === "gross-to-net" ? "2000" : "1500"}
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Net əmək haqqı (əlinizə çatan)</p>
              <p className="text-3xl font-bold">{formatMoney(result.net)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Gross əmək haqqı</p>
              <p className="text-3xl font-bold text-foreground">{formatMoney(result.gross)}</p>
              <p className="text-xs text-muted mt-1">AZN / ay</p>
            </div>
          </div>

          {/* Employee Deductions */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>👤</span>
                İşçidən tutulan
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">DSMF (3%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.dsmfEmployee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İşsizlik sığortası (0.5%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.unemploymentEmployee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İcbari tibbi sığorta (2%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.medicalInsurance)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Vergiyə cəlb olunan məbləğ</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.taxableIncome)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Gəlir vergisi (14% / 25%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.incomeTax)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">Cəmi tutulma</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>

          {/* Employer Costs */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🏢</span>
                İşəgötürən tərəfdən
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">DSMF (22%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.dsmfEmployer)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İşsizlik sığortası (0.5%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.unemploymentEmployer)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">İşəgötürənin ümumi xərci</span>
                <span className="text-sm font-bold text-amber-700">{formatMoney(result.totalEmployerCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              İllik hesablama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">İllik net gəlir</p>
                <p className="text-lg font-bold text-primary">{formatMoney(result.net * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik gross</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(result.gross * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik tutulma</p>
                <p className="text-lg font-bold text-red-600">{formatMoney(result.totalDeductions * 12)} AZN</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💵</span>
          <p>Nəticəni görmək üçün əmək haqqını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
