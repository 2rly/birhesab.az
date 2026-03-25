"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// ============================================================
// Aliment hesablayıcısı
// Azərbaycan Respublikası Ailə Məcəlləsi
// Aliment: gəlir vergisi çıxıldıqdan sonrakı məbləğdən tutulur
// ============================================================

type Sector = "private" | "state";

// ── QEYRİ NEFT-QAZ / ÖZƏL SEKTOR ──
function calcPrivateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.03;
  if (gross <= 8000) return 75 + (gross - 2500) * 0.10;
  return 625 + (gross - 8000) * 0.14;
}
function calcPrivateDSMF(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  return 200 * 0.03 + (gross - 200) * 0.10;
}
function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 2500 * 0.02 + (gross - 2500) * 0.005;
}

// ── DÖVLƏT / NEFT-QAZ ──
function calcStateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.14;
  return 350 + (gross - 2500) * 0.25;
}
function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 8000 * 0.02 + (gross - 8000) * 0.005;
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CHILD_OPTIONS = [
  { id: 1, label: "1 uşaq", percent: 25 },
  { id: 2, label: "2 uşaq", percent: 33.3 },
  { id: 3, label: "3+ uşaq", percent: 50 },
  { id: 0, label: "Sabit məbləğ", percent: 0 },
];

export default function AlimentCalculator() {
  const [gross, setGross] = useState("");
  const [sector, setSector] = useState<Sector>("state");
  const [childOption, setChildOption] = useState(1);
  const [customPercent, setCustomPercent] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");

  const result = useMemo(() => {
    const g = parseFloat(gross);
    if (!g || g <= 0) return null;

    // Vergi hesabla
    let incomeTax: number;
    let dsmf: number;
    let medical: number;
    const unemployment = g * 0.005;

    if (sector === "private") {
      incomeTax = calcPrivateIncomeTax(g);
      dsmf = calcPrivateDSMF(g);
      medical = calcPrivateMedical(g);
    } else {
      incomeTax = calcStateIncomeTax(g);
      dsmf = g * 0.03;
      medical = calcStateMedical(g);
    }

    // Aliment bazası = gross - gəlir vergisi (qanuna əsasən)
    const alimentBase = g - incomeTax;

    // Aliment faizi / məbləği
    let alimentPercent: number;
    let alimentAmount: number;
    let isFixed = false;

    const selected = CHILD_OPTIONS.find(c => c.id === childOption);
    if (childOption === 0) {
      // Sabit məbləğ
      isFixed = true;
      alimentAmount = parseFloat(fixedAmount) || 0;
      alimentPercent = alimentBase > 0 ? (alimentAmount / alimentBase) * 100 : 0;
    } else {
      const cp = parseFloat(customPercent);
      alimentPercent = cp > 0 ? cp : (selected?.percent || 25);
      alimentAmount = alimentBase * (alimentPercent / 100);
    }

    // Tutulmalar
    const totalDeductions = incomeTax + alimentAmount + dsmf + unemployment + medical;
    const netSalary = g - totalDeductions;

    return {
      gross: g,
      incomeTax,
      alimentBase,
      alimentPercent,
      alimentAmount,
      dsmf,
      unemployment,
      medical,
      totalDeductions,
      netSalary: Math.max(0, netSalary),
      isFixed,
      childCount: selected?.label || "",
    };
  }, [gross, sector, childOption, customPercent, fixedAmount]);

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";

  return (
    <CalculatorLayout
      title="Aliment hesablayıcısı"
      description="Məhkəmə qərarına əsasən aliment tutulmasını və əlinizə çatacaq əmək haqqını hesablayın."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Aliment hesablayıcısı" },
      ]}
      formulaTitle="Aliment necə hesablanır?"
      formulaContent={`Alimentlər — qanunla müəyyən edilmiş qaydada ailənin bir üzvünün digər üzvlərinə verməli olduğu dolanacaq vasitəsidir.

Hesablama qaydası:
1. Gəlir vergisi hesablanır
2. Aliment bazası = Gross maaş − Gəlir vergisi
3. Aliment = Baza × faiz (uşaq sayına görə)
4. Digər tutulmalar: DSMF, işsizlik, tibbi sığorta
5. Əlinizə çatan = Gross − bütün tutulmalar

Aliment faizləri (Ailə Məcəlləsi, maddə 81):
• 1 uşaq: 25%
• 2 uşaq: 33,3% (1/3)
• 3 və daha çox uşaq: 50%
• Məhkəmə sabit məbləğ də təyin edə bilər

Nümunə (Dövlət sektoru, 800₼):
Gəlir vergisi = (800 − 200) × 14% = 84₼
Aliment bazası = 800 − 84 = 716₼
Aliment (25%) = 716 × 25% = 179₼
DSMF = 800 × 3% = 24₼
İşsizlik = 800 × 0,5% = 4₼
Tibbi sığorta = 800 × 2% = 16₼
Əlinizə çatan = 800 − 84 − 179 − 24 − 4 − 16 = 493₼`}
      relatedIds={["salary", "sick-leave", "vacation-pay", "severance-pay"]}
    >
      {/* Sektor */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">Sektor</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSector("private")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "private"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">Qeyri neft-qaz / Özəl</p>
            <p className="text-[11px] text-muted mt-0.5">200₼-dək vergi 0%</p>
          </button>
          <button
            onClick={() => setSector("state")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "state"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">Dövlət / Neft-qaz</p>
            <p className="text-[11px] text-muted mt-0.5">200₼ güzəşt, 14%/25%</p>
          </button>
        </div>
      </div>

      {/* Gross maaş */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">
          💵 Aylıq gross əmək haqqı (AZN)
        </label>
        <input
          type="number"
          value={gross}
          onChange={(e) => setGross(e.target.value)}
          placeholder="800"
          min="0"
          className={inputCls}
        />
        <div className="flex gap-2 mt-2">
          {[500, 800, 1200, 2000, 3000].map((v) => (
            <button key={v} onClick={() => setGross(String(v))}
              className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors">
              {v}₼
            </button>
          ))}
        </div>
      </div>

      {/* Uşaq sayı / aliment növü */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">Aliment növü</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CHILD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setChildOption(opt.id); setCustomPercent(""); }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                childOption === opt.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              {opt.percent > 0 && <p className="text-xs text-muted">{opt.percent}%</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Sabit məbləğ və ya xüsusi faiz */}
      {childOption === 0 ? (
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-2">Sabit aliment məbləği (AZN)</label>
          <input
            type="number"
            value={fixedAmount}
            onChange={(e) => setFixedAmount(e.target.value)}
            placeholder="200"
            min="0"
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">Məhkəmənin təyin etdiyi sabit məbləğ</p>
        </div>
      ) : (
        <div className="mb-8">
          <label className="block text-xs text-muted mb-1">Xüsusi faiz daxil edin (istəyə bağlı)</label>
          <input
            type="number"
            value={customPercent}
            onChange={(e) => setCustomPercent(e.target.value)}
            placeholder={`${CHILD_OPTIONS.find(c => c.id === childOption)?.percent || 25}`}
            min="0"
            max="70"
            step="0.1"
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">Boş buraxsanız, standart faiz ({CHILD_OPTIONS.find(c => c.id === childOption)?.percent}%) tətbiq olunacaq</p>
        </div>
      )}

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
              <p className="text-xs text-blue-200 mb-1">Əlinizə çatan</p>
              <p className="text-2xl font-bold">{fmt(result.netSalary)}</p>
              <p className="text-[10px] text-blue-200 mt-1">AZN / ay</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-center">
              <p className="text-xs text-amber-600 mb-1">Aliment</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.alimentAmount)}</p>
              <p className="text-[10px] text-amber-600 mt-1">{result.isFixed ? "sabit məbləğ" : `${result.alimentPercent.toFixed(1)}%`}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">Cəmi tutulma</p>
              <p className="text-2xl font-bold text-red-600">{fmt(result.totalDeductions)}</p>
              <p className="text-[10px] text-muted mt-1">AZN / ay</p>
            </div>
          </div>

          {/* Addım-addım hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span>
                  Hesablama qaydası
                </h3>
                <span className="text-xs text-muted bg-white px-2 py-0.5 rounded-full border border-border">addım-addım</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {/* 1. Gəlir vergisi */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-medium text-foreground">Gəlir vergisi hesablanır</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  {sector === "state" ? (
                    result.gross <= 200 ? (
                      <p className="text-xs text-green-600">200₼-dək gəlir vergisi tutulmur</p>
                    ) : result.gross <= 2500 ? (
                      <p className="text-xs text-foreground">
                        ({fmt(result.gross)} − 200) × 14% = {fmt(result.gross - 200)} × 14% = <span className="font-bold">{fmt(result.incomeTax)} AZN</span>
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">2500₼ × 14% = 350 AZN</p>
                        <p className="text-xs text-muted">({fmt(result.gross)} − 2500) × 25% = {fmt(result.gross - 2500)} × 25% = {fmt((result.gross - 2500) * 0.25)} AZN</p>
                        <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: <span className="font-bold">{fmt(result.incomeTax)} AZN</span></p>
                      </div>
                    )
                  ) : (
                    result.gross <= 200 ? (
                      <p className="text-xs text-green-600">200₼-dək gəlir vergisi tutulmur</p>
                    ) : result.gross <= 2500 ? (
                      <p className="text-xs text-foreground">
                        ({fmt(result.gross)} − 200) × 3% = {fmt(result.gross - 200)} × 3% = <span className="font-bold">{fmt(result.incomeTax)} AZN</span>
                      </p>
                    ) : result.gross <= 8000 ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">2500₼-dək hissə üçün sabit: 75 AZN</p>
                        <p className="text-xs text-muted">({fmt(result.gross)} − 2500) × 10% = {fmt(result.gross - 2500)} × 10% = {fmt((result.gross - 2500) * 0.10)} AZN</p>
                        <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: <span className="font-bold">{fmt(result.incomeTax)} AZN</span></p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">8000₼-dək hissə üçün sabit: 625 AZN</p>
                        <p className="text-xs text-muted">({fmt(result.gross)} − 8000) × 14% = {fmt(result.gross - 8000)} × 14% = {fmt((result.gross - 8000) * 0.14)} AZN</p>
                        <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: <span className="font-bold">{fmt(result.incomeTax)} AZN</span></p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 2. Aliment bazası */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-medium text-foreground">Aliment bazası müəyyən edilir</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.gross)} − {fmt(result.incomeTax)} = <span className="font-bold text-primary">{fmt(result.alimentBase)} AZN</span>
                  </p>
                  <p className="text-[11px] text-muted mt-1">Aliment gəlir vergisi çıxıldıqdan sonrakı məbləğdən tutulur</p>
                </div>
              </div>

              {/* 3. Aliment hesabı */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-sm font-medium text-foreground">Aliment məbləği hesablanır</span>
                </div>
                <div className="ml-8 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  {result.isFixed ? (
                    <p className="text-sm text-foreground">
                      Sabit məbləğ: <span className="font-bold text-amber-700">{fmt(result.alimentAmount)} AZN</span>
                    </p>
                  ) : (
                    <p className="text-sm text-foreground">
                      {fmt(result.alimentBase)} × {result.alimentPercent.toFixed(1)}% = <span className="font-bold text-amber-700">{fmt(result.alimentAmount)} AZN</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Digər tutulmalar */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">4</span>
                  <span className="text-sm font-medium text-foreground">Digər tutulmalar</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">DSMF{sector === "state" ? ` (${fmt(result.gross)} × 3%)` : ""}</span>
                    <span className="font-medium text-foreground">{fmt(result.dsmf)} AZN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">İşsizlik sığortası ({fmt(result.gross)} × 0,5%)</span>
                    <span className="font-medium text-foreground">{fmt(result.unemployment)} AZN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">İcbari tibbi sığorta{sector === "state" && result.gross <= 8000 ? ` (${fmt(result.gross)} × 2%)` : ""}</span>
                    <span className="font-medium text-foreground">{fmt(result.medical)} AZN</span>
                  </div>
                </div>
              </div>

              {/* 5. Yekun */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">5</span>
                  <span className="text-sm font-medium text-foreground">Əlinizə çatan məbləğ</span>
                </div>
                <div className="ml-8 bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-muted mb-2">
                    {fmt(result.gross)} − {fmt(result.incomeTax)} − {fmt(result.alimentAmount)} − {fmt(result.dsmf)} − {fmt(result.unemployment)} − {fmt(result.medical)}
                  </p>
                  <p className="text-sm text-foreground">
                    = {fmt(result.gross)} − {fmt(result.totalDeductions)} = <span className="font-bold text-lg text-green-700">{fmt(result.netSalary)} AZN</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vizual bölgü */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Maaşın bölgüsü</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-400" style={{ width: `${(result.netSalary / result.gross) * 100}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${(result.alimentAmount / result.gross) * 100}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${(result.incomeTax / result.gross) * 100}%` }} />
              <div className="h-full bg-blue-400" style={{ width: `${((result.dsmf + result.unemployment + result.medical) / result.gross) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Əlinizə çatan: {fmt(result.netSalary)} ({((result.netSalary / result.gross) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Aliment: {fmt(result.alimentAmount)} ({((result.alimentAmount / result.gross) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />Vergi: {fmt(result.incomeTax)} ({((result.incomeTax / result.gross) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />DSMF+sığorta: {fmt(result.dsmf + result.unemployment + result.medical)} ({(((result.dsmf + result.unemployment + result.medical) / result.gross) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⚖️</span>
          <p>Nəticəni görmək üçün əmək haqqını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
