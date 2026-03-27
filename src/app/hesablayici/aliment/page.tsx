"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

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

const childOptionsTranslations: Record<Lang, { id: number; label: string; percent: number }[]> = {
  az: [
    { id: 1, label: "1 uşaq", percent: 25 },
    { id: 2, label: "2 uşaq", percent: 33.3 },
    { id: 3, label: "3+ uşaq", percent: 50 },
    { id: 0, label: "Sabit məbləğ", percent: 0 },
  ],
  en: [
    { id: 1, label: "1 child", percent: 25 },
    { id: 2, label: "2 children", percent: 33.3 },
    { id: 3, label: "3+ children", percent: 50 },
    { id: 0, label: "Fixed amount", percent: 0 },
  ],
  ru: [
    { id: 1, label: "1 ребёнок", percent: 25 },
    { id: 2, label: "2 детей", percent: 33.3 },
    { id: 3, label: "3+ детей", percent: 50 },
    { id: 0, label: "Фиксированная сумма", percent: 0 },
  ],
};

const pageTranslations = {
  az: {
    title: "Aliment hesablayıcısı",
    description: "Məhkəmə qərarına əsasən aliment tutulmasını və əlinizə çatacaq əmək haqqını hesablayın.",
    breadcrumbCategory: "Əmək Hüququ",
    formulaTitle: "Aliment necə hesablanır?",
    formulaContent: `Alimentlər — qanunla müəyyən edilmiş qaydada ailənin bir üzvünün digər üzvlərinə verməli olduğu dolanacaq vasitəsidir.

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
Əlinizə çatan = 800 − 84 − 179 − 24 − 4 − 16 = 493₼`,
    sector: "Sektor",
    privateLabel: "Qeyri neft-qaz / Özəl",
    privateDesc: "200₼-dək vergi 0%",
    stateLabel: "Dövlət / Neft-qaz",
    stateDesc: "200₼ güzəşt, 14%/25%",
    grossSalary: "Aylıq gross əmək haqqı (AZN)",
    alimentType: "Aliment növü",
    fixedAlimentAmount: "Sabit aliment məbləği (AZN)",
    fixedByCourtDesc: "Məhkəmənin təyin etdiyi sabit məbləğ",
    customPercentLabel: "Xüsusi faiz daxil edin (istəyə bağlı)",
    customPercentHint: "Boş buraxsanız, standart faiz ({percent}%) tətbiq olunacaq",
    netSalary: "Əlinizə çatan",
    aliment: "Aliment",
    fixedAmountLabel: "sabit məbləğ",
    totalDeductions: "Cəmi tutulma",
    perMonth: "AZN / ay",
    calculationOrder: "Hesablama qaydası",
    stepByStep: "addım-addım",
    step1: "Gəlir vergisi hesablanır",
    taxExempt: "200₼-dək gəlir vergisi tutulmur",
    fixedPortion: "-dək hissə üçün sabit:",
    total: "Cəmi:",
    step2: "Aliment bazası müəyyən edilir",
    alimentBaseNote: "Aliment gəlir vergisi çıxıldıqdan sonrakı məbləğdən tutulur",
    step3: "Aliment məbləği hesablanır",
    fixedLabel: "Sabit məbləğ:",
    step4: "Digər tutulmalar",
    dsmf: "DSMF",
    unemployment: "İşsizlik sığortası",
    medicalInsurance: "İcbari tibbi sığorta",
    step5: "Əlinizə çatan məbləğ",
    salaryBreakdown: "Maaşın bölgüsü",
    legendNet: "Əlinizə çatan:",
    legendAliment: "Aliment:",
    legendTax: "Vergi:",
    legendDsmfInsurance: "DSMF+sığorta:",
    emptyStateText: "Nəticəni görmək üçün əmək haqqını daxil edin.",
  },
  en: {
    title: "Alimony Calculator",
    description: "Calculate alimony deductions based on a court order and your net salary.",
    breadcrumbCategory: "Labor Law",
    formulaTitle: "How is alimony calculated?",
    formulaContent: `Alimony is a legally mandated payment from one family member to another for support.

Calculation procedure:
1. Income tax is calculated
2. Alimony base = Gross salary − Income tax
3. Alimony = Base × percentage (based on number of children)
4. Other deductions: SSPF, unemployment, medical insurance
5. Net salary = Gross − all deductions

Alimony percentages (Family Code, Article 81):
• 1 child: 25%
• 2 children: 33.3% (1/3)
• 3 or more children: 50%
• The court may also set a fixed amount

Example (Public sector, 800 AZN):
Income tax = (800 − 200) × 14% = 84 AZN
Alimony base = 800 − 84 = 716 AZN
Alimony (25%) = 716 × 25% = 179 AZN
SSPF = 800 × 3% = 24 AZN
Unemployment = 800 × 0.5% = 4 AZN
Medical insurance = 800 × 2% = 16 AZN
Net salary = 800 − 84 − 179 − 24 − 4 − 16 = 493 AZN`,
    sector: "Sector",
    privateLabel: "Non-oil-gas / Private",
    privateDesc: "0% tax up to 200 AZN",
    stateLabel: "Public / Oil-gas",
    stateDesc: "200 AZN exemption, 14%/25%",
    grossSalary: "Monthly gross salary (AZN)",
    alimentType: "Alimony type",
    fixedAlimentAmount: "Fixed alimony amount (AZN)",
    fixedByCourtDesc: "Fixed amount set by the court",
    customPercentLabel: "Enter custom percentage (optional)",
    customPercentHint: "If left empty, standard rate ({percent}%) will apply",
    netSalary: "Net salary",
    aliment: "Alimony",
    fixedAmountLabel: "fixed amount",
    totalDeductions: "Total deductions",
    perMonth: "AZN / month",
    calculationOrder: "Calculation procedure",
    stepByStep: "step-by-step",
    step1: "Income tax is calculated",
    taxExempt: "No income tax up to 200 AZN",
    fixedPortion: " fixed portion up to:",
    total: "Total:",
    step2: "Alimony base is determined",
    alimentBaseNote: "Alimony is deducted from the amount after income tax",
    step3: "Alimony amount is calculated",
    fixedLabel: "Fixed amount:",
    step4: "Other deductions",
    dsmf: "SSPF",
    unemployment: "Unemployment insurance",
    medicalInsurance: "Mandatory medical insurance",
    step5: "Net salary",
    salaryBreakdown: "Salary breakdown",
    legendNet: "Net salary:",
    legendAliment: "Alimony:",
    legendTax: "Tax:",
    legendDsmfInsurance: "SSPF+insurance:",
    emptyStateText: "Enter a salary to see the result.",
  },
  ru: {
    title: "Калькулятор алиментов",
    description: "Рассчитайте удержание алиментов по решению суда и вашу чистую зарплату.",
    breadcrumbCategory: "Трудовое право",
    formulaTitle: "Как рассчитываются алименты?",
    formulaContent: `Алименты — это установленные законом выплаты одного члена семьи другому на содержание.

Порядок расчёта:
1. Рассчитывается подоходный налог
2. База алиментов = Зарплата брутто − Подоходный налог
3. Алименты = База × процент (по количеству детей)
4. Прочие удержания: ГФСЗ, безработица, медстрахование
5. На руки = Брутто − все удержания

Проценты алиментов (Семейный кодекс, статья 81):
• 1 ребёнок: 25%
• 2 детей: 33,3% (1/3)
• 3 и более детей: 50%
• Суд может также назначить фиксированную сумму

Пример (Госсектор, 800 AZN):
Подоходный налог = (800 − 200) × 14% = 84 AZN
База алиментов = 800 − 84 = 716 AZN
Алименты (25%) = 716 × 25% = 179 AZN
ГФСЗ = 800 × 3% = 24 AZN
Безработица = 800 × 0,5% = 4 AZN
Медстрахование = 800 × 2% = 16 AZN
На руки = 800 − 84 − 179 − 24 − 4 − 16 = 493 AZN`,
    sector: "Сектор",
    privateLabel: "Ненефтегазовый / Частный",
    privateDesc: "Налог 0% до 200 AZN",
    stateLabel: "Государственный / Нефтегаз",
    stateDesc: "Льгота 200 AZN, 14%/25%",
    grossSalary: "Ежемесячная зарплата брутто (AZN)",
    alimentType: "Тип алиментов",
    fixedAlimentAmount: "Фиксированная сумма алиментов (AZN)",
    fixedByCourtDesc: "Фиксированная сумма, установленная судом",
    customPercentLabel: "Введите свой процент (необязательно)",
    customPercentHint: "Если оставить пустым, будет применён стандартный процент ({percent}%)",
    netSalary: "На руки",
    aliment: "Алименты",
    fixedAmountLabel: "фиксированная сумма",
    totalDeductions: "Всего удержаний",
    perMonth: "AZN / мес.",
    calculationOrder: "Порядок расчёта",
    stepByStep: "пошагово",
    step1: "Рассчитывается подоходный налог",
    taxExempt: "До 200 AZN подоходный налог не взимается",
    fixedPortion: " фиксированная часть до:",
    total: "Итого:",
    step2: "Определяется база алиментов",
    alimentBaseNote: "Алименты удерживаются из суммы после подоходного налога",
    step3: "Рассчитывается сумма алиментов",
    fixedLabel: "Фиксированная сумма:",
    step4: "Прочие удержания",
    dsmf: "ГФСЗ",
    unemployment: "Страхование от безработицы",
    medicalInsurance: "Обязательное медстрахование",
    step5: "Сумма на руки",
    salaryBreakdown: "Распределение зарплаты",
    legendNet: "На руки:",
    legendAliment: "Алименты:",
    legendTax: "Налог:",
    legendDsmfInsurance: "ГФСЗ+страхование:",
    emptyStateText: "Введите зарплату, чтобы увидеть результат.",
  },
};

export default function AlimentCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const CHILD_OPTIONS = childOptionsTranslations[lang];

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
  }, [gross, sector, childOption, customPercent, fixedAmount, CHILD_OPTIONS]);

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=labor" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "sick-leave", "vacation-pay", "severance-pay"]}
    >
      {/* Sektor */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.sector}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSector("private")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "private"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.privateLabel}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.privateDesc}</p>
          </button>
          <button
            onClick={() => setSector("state")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "state"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.stateLabel}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.stateDesc}</p>
          </button>
        </div>
      </div>

      {/* Gross maaş */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">
          {pt.grossSalary}
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
        <label className="block text-sm font-medium text-foreground mb-2">{pt.alimentType}</label>
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
          <label className="block text-sm font-medium text-foreground mb-2">{pt.fixedAlimentAmount}</label>
          <input
            type="number"
            value={fixedAmount}
            onChange={(e) => setFixedAmount(e.target.value)}
            placeholder="200"
            min="0"
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">{pt.fixedByCourtDesc}</p>
        </div>
      ) : (
        <div className="mb-8">
          <label className="block text-xs text-muted mb-1">{pt.customPercentLabel}</label>
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
          <p className="text-xs text-muted mt-1">{pt.customPercentHint.replace("{percent}", String(CHILD_OPTIONS.find(c => c.id === childOption)?.percent))}</p>
        </div>
      )}

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
              <p className="text-xs text-blue-200 mb-1">{pt.netSalary}</p>
              <p className="text-2xl font-bold">{fmt(result.netSalary)}</p>
              <p className="text-[10px] text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-center">
              <p className="text-xs text-amber-600 mb-1">{pt.aliment}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.alimentAmount)}</p>
              <p className="text-[10px] text-amber-600 mt-1">{result.isFixed ? pt.fixedAmountLabel : `${result.alimentPercent.toFixed(1)}%`}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.totalDeductions}</p>
              <p className="text-2xl font-bold text-red-600">{fmt(result.totalDeductions)}</p>
              <p className="text-[10px] text-muted mt-1">{pt.perMonth}</p>
            </div>
          </div>

          {/* Addım-addım hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span>
                  {pt.calculationOrder}
                </h3>
                <span className="text-xs text-muted bg-white px-2 py-0.5 rounded-full border border-border">{pt.stepByStep}</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {/* 1. Gəlir vergisi */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-medium text-foreground">{pt.step1}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  {sector === "state" ? (
                    result.gross <= 200 ? (
                      <p className="text-xs text-green-600">{pt.taxExempt}</p>
                    ) : result.gross <= 2500 ? (
                      <p className="text-xs text-foreground">
                        ({fmt(result.gross)} − 200) × 14% = {fmt(result.gross - 200)} × 14% = <span className="font-bold">{fmt(result.incomeTax)} AZN</span>
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">2500₼ × 14% = 350 AZN</p>
                        <p className="text-xs text-muted">({fmt(result.gross)} − 2500) × 25% = {fmt(result.gross - 2500)} × 25% = {fmt((result.gross - 2500) * 0.25)} AZN</p>
                        <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.total} <span className="font-bold">{fmt(result.incomeTax)} AZN</span></p>
                      </div>
                    )
                  ) : (
                    result.gross <= 200 ? (
                      <p className="text-xs text-green-600">{pt.taxExempt}</p>
                    ) : result.gross <= 2500 ? (
                      <p className="text-xs text-foreground">
                        ({fmt(result.gross)} − 200) × 3% = {fmt(result.gross - 200)} × 3% = <span className="font-bold">{fmt(result.incomeTax)} AZN</span>
                      </p>
                    ) : result.gross <= 8000 ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">2500₼{pt.fixedPortion} 75 AZN</p>
                        <p className="text-xs text-muted">({fmt(result.gross)} − 2500) × 10% = {fmt(result.gross - 2500)} × 10% = {fmt((result.gross - 2500) * 0.10)} AZN</p>
                        <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.total} <span className="font-bold">{fmt(result.incomeTax)} AZN</span></p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">8000₼{pt.fixedPortion} 625 AZN</p>
                        <p className="text-xs text-muted">({fmt(result.gross)} − 8000) × 14% = {fmt(result.gross - 8000)} × 14% = {fmt((result.gross - 8000) * 0.14)} AZN</p>
                        <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.total} <span className="font-bold">{fmt(result.incomeTax)} AZN</span></p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 2. Aliment bazası */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-medium text-foreground">{pt.step2}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.gross)} − {fmt(result.incomeTax)} = <span className="font-bold text-primary">{fmt(result.alimentBase)} AZN</span>
                  </p>
                  <p className="text-[11px] text-muted mt-1">{pt.alimentBaseNote}</p>
                </div>
              </div>

              {/* 3. Aliment hesabı */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-sm font-medium text-foreground">{pt.step3}</span>
                </div>
                <div className="ml-8 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  {result.isFixed ? (
                    <p className="text-sm text-foreground">
                      {pt.fixedLabel} <span className="font-bold text-amber-700">{fmt(result.alimentAmount)} AZN</span>
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
                  <span className="text-sm font-medium text-foreground">{pt.step4}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">{pt.dsmf}{sector === "state" ? ` (${fmt(result.gross)} × 3%)` : ""}</span>
                    <span className="font-medium text-foreground">{fmt(result.dsmf)} AZN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">{pt.unemployment} ({fmt(result.gross)} × 0,5%)</span>
                    <span className="font-medium text-foreground">{fmt(result.unemployment)} AZN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">{pt.medicalInsurance}{sector === "state" && result.gross <= 8000 ? ` (${fmt(result.gross)} × 2%)` : ""}</span>
                    <span className="font-medium text-foreground">{fmt(result.medical)} AZN</span>
                  </div>
                </div>
              </div>

              {/* 5. Yekun */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">5</span>
                  <span className="text-sm font-medium text-foreground">{pt.step5}</span>
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
            <p className="text-xs text-muted mb-3 font-medium">{pt.salaryBreakdown}</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-400" style={{ width: `${(result.netSalary / result.gross) * 100}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${(result.alimentAmount / result.gross) * 100}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${(result.incomeTax / result.gross) * 100}%` }} />
              <div className="h-full bg-blue-400" style={{ width: `${((result.dsmf + result.unemployment + result.medical) / result.gross) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />{pt.legendNet} {fmt(result.netSalary)} ({((result.netSalary / result.gross) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />{pt.legendAliment} {fmt(result.alimentAmount)} ({((result.alimentAmount / result.gross) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />{pt.legendTax} {fmt(result.incomeTax)} ({((result.incomeTax / result.gross) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />{pt.legendDsmfInsurance} {fmt(result.dsmf + result.unemployment + result.medical)} ({(((result.dsmf + result.unemployment + result.medical) / result.gross) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⚖️</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
