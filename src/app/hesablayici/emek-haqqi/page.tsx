"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// ============================================================
// Azərbaycan əmək haqqı hesablama qaydaları (2026)
// Qeyri neft-qaz / Özəl sektor  vs  Dövlət / Neft-qaz sektoru
// ============================================================

const MINIMUM_WAGE = 400; // AZN (2026)

type Sector = "private" | "state";
type Direction = "gross-to-net" | "net-to-gross";

// ══════════════════════════════════════════════════════════════
// QEYRİ NEFT-QAZ VƏ ÖZƏL SEKTOR
// ══════════════════════════════════════════════════════════════

// Gəlir vergisi: güzəşt nəzərə alınmaqla
// V.M. 102.1-1: Vergi tutulan gəlir güzəşt məbləği qədər azaldılır
function calcPrivateIncomeTax(gross: number, exemption: number = 0): number {
  const taxFree = 200 + exemption;
  if (gross <= taxFree) return 0;
  const taxable = gross - taxFree;
  // 2500-dən taxFree çıxılır çünki pilləli hədlər güzəştdən sonra tətbiq olunur
  const bracket1Limit = 2500 - 200; // 2300 — 3% pilləsi
  const bracket2Limit = 8000 - 200; // 7800 — 10% pilləsi
  if (taxable <= bracket1Limit) return taxable * 0.03;
  if (taxable <= bracket2Limit) return bracket1Limit * 0.03 + (taxable - bracket1Limit) * 0.10;
  return bracket1Limit * 0.03 + (bracket2Limit - bracket1Limit) * 0.10 + (taxable - bracket2Limit) * 0.14;
}

// DSMF işçi: 200-ə qədər 3%, üstü 10%
function calcPrivateDSMFEmployee(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  return 200 * 0.03 + (gross - 200) * 0.10;
}

// İcbari tibbi sığorta: 2500-ə qədər 2%, üstü 0.5%
function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 2500 * 0.02 + (gross - 2500) * 0.005;
}

// DSMF işəgötürən: 200-ə qədər 22%, üstü 15%
function calcPrivateDSMFEmployer(gross: number): number {
  if (gross <= 200) return gross * 0.22;
  return 200 * 0.22 + (gross - 200) * 0.15;
}

// ══════════════════════════════════════════════════════════════
// DÖVLƏT VƏ NEFT-QAZ SEKTORU
// ══════════════════════════════════════════════════════════════

// Gəlir vergisi: güzəşt nəzərə alınmaqla
function calcStateIncomeTax(gross: number, exemption: number = 0): number {
  const taxFree = 200 + exemption;
  if (gross <= taxFree) return 0;
  const taxable = gross - taxFree;
  const bracket1Limit = 2500 - 200; // 2300 — 14% pilləsi
  if (taxable <= bracket1Limit) return taxable * 0.14;
  return bracket1Limit * 0.14 + (taxable - bracket1Limit) * 0.25;
}

// İcbari tibbi sığorta: 8000-ə qədər 2%, üstü 0.5%
function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 8000 * 0.02 + (gross - 8000) * 0.005;
}

// ══════════════════════════════════════════════════════════════
// HESABLAMA
// ══════════════════════════════════════════════════════════════

interface BreakdownStep { label: string; amount: number; rate: string; result: number }

function calculateSalary(gross: number, sector: Sector, exemption: number = 0) {
  const unemploymentEmployee = gross * 0.005;
  const unemploymentEmployer = gross * 0.005;

  let incomeTax: number;
  let dsmfEmployee: number;
  let medicalInsurance: number;
  let dsmfEmployer: number;
  const taxSteps: BreakdownStep[] = [];
  const dsmfSteps: BreakdownStep[] = [];
  const medicalSteps: BreakdownStep[] = [];
  const dsmfEmployerSteps: BreakdownStep[] = [];
  const taxFree = 200 + exemption;

  if (sector === "private") {
    incomeTax = calcPrivateIncomeTax(gross, exemption);
    dsmfEmployee = calcPrivateDSMFEmployee(gross);
    medicalInsurance = calcPrivateMedical(gross);
    dsmfEmployer = calcPrivateDSMFEmployer(gross);

    // Tax breakdown
    if (exemption > 0 && gross > taxFree) {
      taxSteps.push({ label: `Güzəşt: vergi tutulan gəlir ${exemption}₼ azaldılır (azad hissə: ${taxFree}₼)`, amount: exemption, rate: "", result: 0 });
    }
    const taxable = Math.max(0, gross - taxFree);
    const b1 = 2500 - 200; // 2300
    const b2 = 8000 - 200; // 7800
    if (taxable > 0 && taxable <= b1) {
      taxSteps.push({ label: `(${gross.toFixed(0)} − ${taxFree}) × 3%  →  ${taxable.toFixed(0)}₼ × 3%`, amount: taxable, rate: "3%", result: taxable * 0.03 });
    }
    if (taxable > b1 && taxable <= b2) {
      taxSteps.push({ label: `${b1}₼ × 3%`, amount: b1, rate: "3%", result: b1 * 0.03 });
      const t2 = taxable - b1;
      taxSteps.push({ label: `${t2.toFixed(0)}₼ × 10%`, amount: t2, rate: "10%", result: t2 * 0.10 });
    }
    if (taxable > b2) {
      taxSteps.push({ label: `${b1}₼ × 3%`, amount: b1, rate: "3%", result: b1 * 0.03 });
      taxSteps.push({ label: `${(b2 - b1)}₼ × 10%`, amount: b2 - b1, rate: "10%", result: (b2 - b1) * 0.10 });
      const t3 = taxable - b2;
      taxSteps.push({ label: `${t3.toFixed(0)}₼ × 14%`, amount: t3, rate: "14%", result: t3 * 0.14 });
    }

    // DSMF breakdown
    const d1 = Math.min(gross, 200);
    if (d1 > 0) dsmfSteps.push({ label: `${d1.toFixed(0)}₼ × 3%`, amount: d1, rate: "3%", result: d1 * 0.03 });
    if (gross > 200) {
      const d2 = gross - 200;
      dsmfSteps.push({ label: `${d2.toFixed(0)}₼ × 10%`, amount: d2, rate: "10%", result: d2 * 0.10 });
    }

    // Medical breakdown
    const m1 = Math.min(gross, 2500);
    if (m1 > 0) medicalSteps.push({ label: `${m1.toFixed(0)}₼ × 2%`, amount: m1, rate: "2%", result: m1 * 0.02 });
    if (gross > 2500) {
      const m2 = gross - 2500;
      medicalSteps.push({ label: `${m2.toFixed(0)}₼ × 0,5%`, amount: m2, rate: "0,5%", result: m2 * 0.005 });
    }

    // Employer DSMF breakdown
    const e1 = Math.min(gross, 200);
    if (e1 > 0) dsmfEmployerSteps.push({ label: `${e1.toFixed(0)}₼ × 22%`, amount: e1, rate: "22%", result: e1 * 0.22 });
    if (gross > 200) {
      const e2 = gross - 200;
      dsmfEmployerSteps.push({ label: `${e2.toFixed(0)}₼ × 15%`, amount: e2, rate: "15%", result: e2 * 0.15 });
    }
  } else {
    incomeTax = calcStateIncomeTax(gross, exemption);
    dsmfEmployee = gross * 0.03;
    medicalInsurance = calcStateMedical(gross);
    dsmfEmployer = gross * 0.22;

    // Tax breakdown
    if (exemption > 0 && gross > taxFree) {
      taxSteps.push({ label: `Güzəşt: vergi tutulan gəlir ${exemption}₼ azaldılır (azad hissə: ${taxFree}₼)`, amount: exemption, rate: "", result: 0 });
    }
    const stateTaxable = Math.max(0, gross - taxFree);
    const sb1 = 2500 - 200; // 2300
    if (stateTaxable > 0 && stateTaxable <= sb1) {
      taxSteps.push({ label: `(${gross.toFixed(0)} − ${taxFree}) × 14%  →  ${stateTaxable.toFixed(0)}₼ × 14%`, amount: stateTaxable, rate: "14%", result: stateTaxable * 0.14 });
    }
    if (stateTaxable > sb1) {
      taxSteps.push({ label: `${sb1}₼ × 14%`, amount: sb1, rate: "14%", result: sb1 * 0.14 });
      const st2 = stateTaxable - sb1;
      taxSteps.push({ label: `${st2.toFixed(0)}₼ × 25%`, amount: st2, rate: "25%", result: st2 * 0.25 });
    }

    // DSMF
    dsmfSteps.push({ label: `${gross.toFixed(0)}₼ × 3%`, amount: gross, rate: "3%", result: gross * 0.03 });

    // Medical breakdown
    if (gross <= 8000) {
      medicalSteps.push({ label: `${gross.toFixed(0)}₼ × 2%`, amount: gross, rate: "2%", result: gross * 0.02 });
    } else {
      medicalSteps.push({ label: `8000₼ × 2%`, amount: 8000, rate: "2%", result: 8000 * 0.02 });
      const m2 = gross - 8000;
      medicalSteps.push({ label: `${m2.toFixed(0)}₼ × 0,5%`, amount: m2, rate: "0,5%", result: m2 * 0.005 });
    }

    // Employer DSMF
    dsmfEmployerSteps.push({ label: `${gross.toFixed(0)}₼ × 22%`, amount: gross, rate: "22%", result: gross * 0.22 });
  }

  const totalDeductions = incomeTax + dsmfEmployee + unemploymentEmployee + medicalInsurance;
  const net = gross - totalDeductions;
  const totalEmployerCost = gross + dsmfEmployer + unemploymentEmployer;

  return {
    gross, net: Math.max(0, net), exemption,
    incomeTax, dsmfEmployee, unemploymentEmployee, medicalInsurance,
    totalDeductions, dsmfEmployer, unemploymentEmployer, totalEmployerCost,
    taxSteps, dsmfSteps, medicalSteps, dsmfEmployerSteps,
  };
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SalaryCalculator() {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("gross-to-net");
  const [sector, setSector] = useState<Sector>("private");
  const [isUnionMember, setIsUnionMember] = useState(false);
  const [isYapMember, setIsYapMember] = useState(false);
  const [hasExemption, setHasExemption] = useState(false);
  const [exemptionAmount, setExemptionAmount] = useState(0);

  const activeExemption = hasExemption ? exemptionAmount : 0;

  const result = useMemo(() => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return null;

    if (direction === "gross-to-net") {
      const calc = calculateSalary(value, sector, activeExemption);
      const unionFee = isUnionMember ? value * 0.02 : 0;
      const yapFee = isYapMember ? value * 0.01 : 0;
      const extraDeductions = unionFee + yapFee;
      return {
        ...calc,
        unionFee,
        yapFee,
        extraDeductions,
        totalDeductions: calc.totalDeductions + extraDeductions,
        net: Math.max(0, calc.net - extraDeductions),
      };
    } else {
      // Net → Gross: iterativ yanaşma
      let gross = value;
      for (let i = 0; i < 200; i++) {
        const calc = calculateSalary(gross, sector, activeExemption);
        const unionFee = isUnionMember ? gross * 0.02 : 0;
        const yapFee = isYapMember ? gross * 0.01 : 0;
        const netCalc = calc.net - unionFee - yapFee;
        const diff = value - netCalc;
        if (Math.abs(diff) < 0.01) break;
        gross += diff;
      }
      const final = calculateSalary(gross, sector, activeExemption);
      const unionFee = isUnionMember ? gross * 0.02 : 0;
      const yapFee = isYapMember ? gross * 0.01 : 0;
      const extraDeductions = unionFee + yapFee;
      return {
        ...final,
        unionFee,
        yapFee,
        extraDeductions,
        totalDeductions: final.totalDeductions + extraDeductions,
        net: value,
      };
    }
  }, [amount, direction, sector, isUnionMember, isYapMember, activeExemption]);

  // Sektor üzrə label-lər
  const taxLabel = sector === "private"
    ? "Gəlir vergisi"
    : "Gəlir vergisi";
  const taxSub = sector === "private"
    ? "200₼-dək 0%, 200–2500₼ arası 3%, 2500–8000₼ arası 10%, 8000₼-dan çox 14%"
    : "200₼-dək 0%, 200–2500₼ arası 14%, 2500₼-dan çox 25%";
  const dsmfLabel = sector === "private" ? "DSMF" : "DSMF";
  const dsmfSub = sector === "private"
    ? "200₼-dək 3%, 200₼-dan çox 10%"
    : "Gross məbləğin 3%-i";
  const medicalLabel = "İcbari tibbi sığorta";
  const medicalSub = sector === "private"
    ? "2500₼-dək 2%, 2500₼-dan çox 0,5%"
    : "8000₼-dək 2%, 8000₼-dan çox 0,5%";
  const dsmfEmployerLabel = "DSMF";
  const dsmfEmployerSub = sector === "private"
    ? "200₼-dək 22%, 200₼-dan çox 15%"
    : "Gross məbləğin 22%-i";

  return (
    <CalculatorLayout
      title="Əmək haqqı hesablayıcısı"
      description="Gross və ya net əmək haqqını daxil edin — sektora uyğun bütün vergi və tutulmaları ani hesablayın."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Əmək haqqı hesablayıcısı" },
      ]}
      formulaTitle="Əmək haqqından tutulmalar necə hesablanır? (2026)"
      formulaContent={`Qeyri neft-qaz / Özəl sektor (işçidən):
• Gəlir vergisi:
  0–200₼: 0%
  200–2500₼: (maaş − 200) × 3%
  2500–8000₼: 75 + (maaş − 2500) × 10%
  8000₼+: 625 + (maaş − 8000) × 14%
• DSMF: 200₼-dək 3%, üstü 10%
• İşsizlik sığortası: 0,5%
• İcbari tibbi sığorta: 2500₼-dək 2%, üstü 0,5%
• İşəgötürən DSMF: 200₼-dək 22%, üstü 15%

Dövlət / Neft-qaz sektoru (işçidən):
• Gəlir vergisi:
  0–200₼: 0%
  200–2500₼: (maaş − 200) × 14%
  2500₼+: 350 + (maaş − 2500) × 25%
• DSMF: 3%
• İşsizlik sığortası: 0,5%
• İcbari tibbi sığorta: 8000₼-dək 2%, üstü 0,5%
• İşəgötürən DSMF: 22%

V.M. 102.1-1 Güzəştlər (vergi tutulan gəlir azaldılır):
• 800₼: Şəhid ailə üzvləri, I qrup əlillər, müharibə əlilləri
• 400₼: II qrup əlillər, Çernobıl qəzası əlilləri
• 200₼: Döyüş veteranları, 3 uşaqlı ailələr
• 100₼: Hərbi qulluqçuların ailə üzvləri
• 50₼: Digər güzəşt kateqoriyaları

Əlavə tutulmalar (könüllü):
• Həmkarlar İttifaqı üzvlüyü: 2%
• Yeni Azərbaycan Partiyası üzvlüyü: 1%

Minimum əmək haqqı: ${MINIMUM_WAGE} AZN (2026)`}
      relatedIds={["overtime", "freelancer-tax", "rental-income-tax", "loan"]}
    >
      {/* Sektor seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Sektor</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setSector("private")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "private"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">Qeyri neft-qaz / Özəl sektor</p>
            <p className="text-[11px] text-muted mt-0.5">200₼-dək vergi 0%, 2500₼-dək 3%</p>
          </button>
          <button
            onClick={() => setSector("state")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "state"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">Dövlət / Neft-qaz sektoru</p>
            <p className="text-[11px] text-muted mt-0.5">200₼ güzəşt, 14% / 25% vergi</p>
          </button>
        </div>
      </div>

      {/* Güzəştlər */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={hasExemption}
            onChange={(e) => {
              setHasExemption(e.target.checked);
              if (!e.target.checked) setExemptionAmount(0);
              else if (exemptionAmount === 0) setExemptionAmount(800);
            }}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-foreground">Güzəştlər</span>
        </label>
        {hasExemption && (
          <div className="space-y-2 ml-1">
            {[
              { value: 800, desc: "Şəhid ailə üzvləri, I qrup əlillər, müharibə əlilləri" },
              { value: 400, desc: "II qrup əlillər, Çernobıl qəzası nəticəsində əlil olanlar" },
              { value: 200, desc: "Döyüş əməliyyatları veteranları, 3 uşaqlı ailələr" },
              { value: 100, desc: "Hərbi qulluqçuların ailə üzvləri" },
              { value: 50, desc: "Digər güzəşt kateqoriyaları" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  exemptionAmount === opt.value
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <input
                  type="radio"
                  name="exemption"
                  checked={exemptionAmount === opt.value}
                  onChange={() => setExemptionAmount(opt.value)}
                  className="w-4 h-4 mt-0.5 border-border text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    V.M. 102.1-1 Vergi tutulan gəlir {opt.value} AZN azaldılır
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

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
        <div className="flex gap-2 mt-2">
          {[400, 1000, 2000, 3000, 5000, 8100].map((v) => (
            <button key={v} onClick={() => setAmount(String(v))}
              className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors">
              {v}₼
            </button>
          ))}
        </div>
      </div>

      {/* Üzvlük seçimləri */}
      <div className="mb-8 space-y-3">
        <label className="block text-sm font-medium text-foreground mb-1">Əlavə tutulmalar</label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/30 transition-all">
          <input
            type="checkbox"
            checked={isUnionMember}
            onChange={(e) => setIsUnionMember(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Həmkarlar İttifaqı üzvüyəm</p>
            <p className="text-[11px] text-muted">Gross əmək haqqının 2%-i tutulur</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/30 transition-all">
          <input
            type="checkbox"
            checked={isYapMember}
            onChange={(e) => setIsYapMember(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Yeni Azərbaycan Partiyası üzvüyəm</p>
            <p className="text-[11px] text-muted">Gross əmək haqqının 1%-i tutulur</p>
          </div>
        </label>
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

          {/* Sektor badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              sector === "private"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {sector === "private" ? "Qeyri neft-qaz / Özəl sektor" : "Dövlət / Neft-qaz sektoru"}
            </span>
          </div>

          {/* Detallı hesablama (qəbz) */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>👤</span>
                İşçidən tutulan
              </h3>
            </div>
            <div className="divide-y divide-border">
              {/* Gəlir vergisi */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{taxLabel}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.incomeTax)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{taxSub}</p>
                {result.taxSteps.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                    {result.incomeTax === 0 && <p className="text-xs text-green-600">200₼-dək vergi tutulmur</p>}
                    {result.taxSteps.map((s, i) => (
                      <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                    ))}
                    {result.taxSteps.length > 1 && (
                      <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: {formatMoney(result.incomeTax)} AZN</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="text-xs text-green-600">200₼-dək gəlir vergisi tutulmur</p>
                  </div>
                )}
              </div>

              {/* DSMF */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{dsmfLabel}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dsmfEmployee)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{dsmfSub}</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {result.dsmfSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                  {result.dsmfSteps.length > 1 && (
                    <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: {formatMoney(result.dsmfEmployee)} AZN</p>
                  )}
                </div>
              </div>

              {/* İşsizlik */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">İşsizlik sığortası</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.unemploymentEmployee)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(result.unemploymentEmployee)} AZN</span></p>
                </div>
              </div>

              {/* İcbari tibbi sığorta */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{medicalLabel}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.medicalInsurance)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{medicalSub}</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {result.medicalSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                  {result.medicalSteps.length > 1 && (
                    <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: {formatMoney(result.medicalInsurance)} AZN</p>
                  )}
                </div>
              </div>

              {/* Həmkarlar İttifaqı */}
              {result.unionFee > 0 && (
                <div className="px-5 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">Həmkarlar İttifaqı haqqı</span>
                    <span className="text-sm font-bold text-foreground">{formatMoney(result.unionFee)} AZN</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 2% = <span className="font-medium text-foreground">{formatMoney(result.unionFee)} AZN</span></p>
                  </div>
                </div>
              )}

              {/* YAP */}
              {result.yapFee > 0 && (
                <div className="px-5 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">Yeni Azərbaycan Partiyası haqqı</span>
                    <span className="text-sm font-bold text-foreground">{formatMoney(result.yapFee)} AZN</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 1% = <span className="font-medium text-foreground">{formatMoney(result.yapFee)} AZN</span></p>
                  </div>
                </div>
              )}

              {/* Cəmi */}
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
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{dsmfEmployerLabel}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dsmfEmployer)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{dsmfEmployerSub}</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {result.dsmfEmployerSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                  {result.dsmfEmployerSteps.length > 1 && (
                    <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: {formatMoney(result.dsmfEmployer)} AZN</p>
                  )}
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">İşsizlik sığortası</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.unemploymentEmployer)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(result.unemploymentEmployer)} AZN</span></p>
                </div>
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
