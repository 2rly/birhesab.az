"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// ============================================================
// Xalq Həyat — Yığım sığortası kalkulyatoru
// Aktuar model (Excel "Yığım Kalkulyator" ilə bit-dəqiq uyğun).
// Yekun sığorta məbləği aylıq kommutasiya funksiyaları ilə hesablanır.
// ============================================================

type Sector = "nonOil" | "oil";
type Currency = "AZN" | "USD";

// ── Aktuar xərc əmsalları (Excel Hesablama_olum BD/BE bloku) ──
const ALFA = 0.005; // α — sığorta məbləğinə mütənasib müqavilə xərci
const BETTA = 0.003; // β — sığorta haqqından asılı xərc
const QAMMA = 0.0025; // γ — sığorta məbləğinə mütənasib cari xərc
const RO1 = 0.03; // ρ₁ — ölüm təminatı üzrə yükləmə
const RO2 = 0.015; // ρ₂ — yaşam təminatı üzrə yükləmə
const I_POLICY = 0.05; // sığorta olunanın investisiya faizi (5%) — valyutadan asılı deyil

// Ölüm cədvəli (Excel Sheet4 A3:D108) — dx (ölənlərin sayı), yaş 0..105, l₀ = 1 000 000
const L0 = 1_000_000;
const DX = [
  12887, 1906, 1068, 701, 536, 487, 464, 429, 411, 403,
  392, 375, 342, 343, 376, 429, 458, 500, 570, 600,
  645, 666, 721, 757, 841, 856, 934, 979, 1063, 1131,
  1234, 1271, 1535, 1578, 1613, 1759, 1859, 2010, 2276, 2300,
  2547, 2797, 3016, 3317, 3561, 3986, 4296, 4863, 5371, 5882,
  6653, 7364, 7851, 8765, 9798, 10833, 11283, 12201, 13131, 14520,
  15427, 15995, 17634, 18567, 20359, 21959, 23457, 25019, 26318, 28418,
  29665, 31568, 32267, 33200, 33449, 34489, 34058, 33118, 32793, 31694,
  30578, 27247, 25502, 24176, 22252, 19549, 17698, 16015, 14980, 13613,
  12118, 10535, 8912, 7308, 5778, 4154, 2917, 1999, 1333, 863,
  542, 328, 192, 108, 58, 54,
];

// Aylıq ("modifikasiya olunmuş") ölüm cədvəli: dm = dxAnnual/12, lm rekurrensiya, qm = dm/lm
function buildMonthlyTable() {
  const lm: number[] = [L0];
  const qm: number[] = [];
  for (let m = 0; m < DX.length * 12; m++) {
    const d = DX[Math.floor(m / 12)] / 12;
    qm.push(d / lm[m]);
    lm.push(lm[m] - d);
  }
  return { lm, qm };
}
const { lm: LM, qm: QM } = buildMonthlyTable();

// Excel DATEDIF(a,b,"m") — tam ayların sayı
function datedifM(a: Date, b: Date): number {
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months--;
  return Math.max(0, months);
}

// ── Maaş → net (Excel sheet2 M/N sütunları) ──
function netSalaryGivenPremium(G: number, p: number, sector: Sector): number {
  const B = G - p; // vergi tutulan baza
  const dsmf =
    sector === "oil"
      ? B * 0.03
      : Math.max(B - 200, 0) * 0.1 + Math.min(200, Math.max(B, 0)) * 0.03;
  const ui = G * 0.005; // işsizlik sığortası — tam gross üzərindən
  const med =
    sector === "oil"
      ? G <= 8000
        ? G * 0.02
        : 160 + (G - 8000) * 0.005
      : G <= 2500
        ? G * 0.02
        : 50 + (G - 2500) * 0.005;
  const tax =
    sector === "oil"
      ? B <= 2500
        ? Math.max(B - 200, 0) * 0.14
        : 350 + (B - 2500) * 0.25
      : B <= 200
        ? 0
        : B <= 2500
          ? (B - 200) * 0.03
          : B <= 8000
            ? 75 + (B - 2500) * 0.1
            : 625 + (B - 8000) * 0.14;
  return G - p - dsmf - ui - tax - med;
}

function employerTopUp(G: number, p: number, sector: Sector): number {
  if (sector === "oil") return p * 0.22;
  if (G <= 8000) return p * 0.15;
  if (p < G - 8000) return p * 0.11;
  return (G - 8000) * 0.11 + (p - (G - 8000)) * 0.15;
}

interface CalcResult {
  termMonths: number;
  ageMonths: number;
  netSalary: number;
  netPremium: number;
  superGross: number;
  maxPct: number;
  maxAmount: number;
  finalSum: number; // Yekun sığorta məbləği (D25)
  totalNetPremiums: number;
  netGain: number;
  netGainPct: number;
}

function calculate(
  birth: Date,
  start: Date,
  end: Date,
  sector: Sector,
  G: number,
  P: number,
): CalcResult | null {
  const n = datedifM(start, end);
  const xM = datedifM(birth, start);
  if (n <= 0 || G <= 0 || P <= 0) return null;
  if (xM < 0 || xM + n >= LM.length) return null;

  // Maaş bloku
  const netSalary = netSalaryGivenPremium(G, 0, sector); // H13
  const netPremium = netSalary - netSalaryGivenPremium(G, P, sector); // H14
  const SG = P + employerTopUp(G, P, sector); // super gross (H15)

  const o11 =
    (0.4997 * G) / 1.055 <= G - 8000
      ? (0.4997 * G) / 1.055
      : (0.4997 * G + 0.02 * (G - 8000)) / 1.075;
  const maxPct = sector === "oil" ? 0.45 : G > 8000 ? o11 / G : 0.465;
  const maxAmount = G * maxPct;

  // Aktuar nüvə (sığorta olunan bazası, i = 5%)
  const j = I_POLICY / 12;
  const v = 1 / (1 + j);
  const coef = j / Math.log(1 + j); // i/δ — kəsilməz ölüm düzəlişi
  let A = 0;
  let sumS = 0;
  let Sn = 0;
  for (let t = 1; t <= n; t++) {
    const p = LM[xM + t - 1] / LM[xM]; // tp_x
    const S = p * Math.pow(v, t - 1);
    A += p * QM[xM + t - 1] * Math.pow(v, t) * coef;
    sumS += S;
    if (t === n) Sn = S;
  }
  const aM = sumS / 12;
  const nEx = Sn;
  const aAnn = aM + (11 / 24) * (1 - nEx);

  const D24 =
    ((1 - BETTA) * SG * sumS) /
    ((1 + RO1) * A + (1 + RO2) * nEx + ALFA + QAMMA * aAnn);
  const finalSum = D24;

  const totalNetPremiums = netPremium * n;
  const netGain = finalSum - totalNetPremiums;

  return {
    termMonths: n,
    ageMonths: xM,
    netSalary,
    netPremium,
    superGross: SG,
    maxPct,
    maxAmount,
    finalSum,
    totalNetPremiums,
    netGain,
    netGainPct: totalNetPremiums > 0 ? netGain / totalNetPremiums : 0,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pageTranslations = {
  az: {
    title: "Xalq Həyat yığım sığortası kalkulyatoru",
    description: "Doğum tarixi, müqavilə müddəti və maaşınıza əsasən net sığorta haqqını, yekun sığorta məbləğini və xalis gəliri hesablayın.",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "Xalq Həyat yığım sığortası necə hesablanır?",
    formulaContent: `Bu kalkulyator Xalq Həyatın "Yığım sığortası" aktuar modelini tətbiq edir:

1. Gross maaş və gross sığorta haqqından net sığorta haqqı hesablanır (DSMF, gəlir vergisi, tibbi sığorta, işsizlik sığortası nəzərə alınır).
2. İşəgötürənin yaşama yönəltdiyi məbləğ əlavə olunub "super gross" sığorta haqqı alınır.
3. Yekun sığorta məbləği aylıq aktuar kommutasiya funksiyaları (ölüm cədvəli, 5% investisiya faizi, xərc əmsalları) ilə hesablanır:

   S = (1−β) × SG × Σ[tp_x·v^(t−1)] / [(1+ρ₁)·Ā¹ + (1+ρ₂)·nEx + α + γ·ä]

   α=0,5%  β=0,3%  γ=0,25%  ρ₁=3%  ρ₂=1,5%  i=5%

4. Xalis gəlir = Yekun sığorta məbləği − ödənilən net sığorta haqlarının cəmi.

Qeyd: Yekun məbləğ valyutadan asılı deyil (i=5% sabitdir).`,
    insured: "Sığortalı məlumatları",
    birthDate: "Doğum tarixi",
    startDate: "Müqavilənin başlama tarixi",
    endDate: "Müqavilənin bitmə tarixi",
    term: "Müddət",
    months: "ay",
    sector: "Biznes sektoru",
    sectorNonOil: "Qeyri-neft və özəl sektor",
    sectorOil: "Neft-qaz sektoru",
    currency: "Valyuta",
    grossSalary: "Gross əmək haqqı",
    grossPremium: "Gross sığorta haqqı (aylıq)",
    calculate: "Hesabla",
    resultsTitle: "Nəticə",
    netSalary: "Net əmək haqqı",
    netPremium: "Net sığorta haqqı (aylıq)",
    superGross: "Super Gross sığorta haqqı",
    maxAmount: "Maks. sığorta haqqı (gross-un {p}%-i)",
    finalSum: "Yekun sığorta məbləği",
    totalNet: "Net sığorta haqlarının cəmi",
    netGain: "Xalis gəlir",
    netGainPct: "Xalis gəlir (faizlə)",
    perMonth: "AZN / ay",
    breakdown: "Ətraflı",
    ageAtStart: "Başlanğıcda yaş",
    years: "il",
    warnDates: "Müqavilə bitmə tarixi başlama tarixindən sonra olmalıdır.",
    warnInputs: "Bütün sahələri düzgün doldurun (tarixlər, maaş, sığorta haqqı).",
    emptyState: "Məlumatları daxil edib «Hesabla» düyməsini basın.",
    disclaimerTitle: "Qeyd:",
    disclaimer: "Bu hesablama Xalq Həyatın yığım modelinin aktuar düsturuna əsaslanır və təxmini xarakter daşıyır. Dəqiq təklif üçün sığorta şirkətinə müraciət edin.",
  },
  en: {
    title: "Xalq Həyat savings insurance calculator",
    description: "Based on birth date, contract term and salary, calculate the net premium, final insured amount and net gain.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How is Xalq Həyat savings insurance calculated?",
    formulaContent: `This calculator applies Xalq Həyat's "Savings insurance" actuarial model:

1. The net premium is derived from gross salary and gross premium (SSPF/DSMF, income tax, medical & unemployment insurance).
2. The employer top-up is added to get the "super gross" premium.
3. The final insured amount is computed with monthly actuarial commutation functions (mortality table, 5% interest, cost loadings):

   S = (1−β) × SG × Σ[tp_x·v^(t−1)] / [(1+ρ₁)·Ā¹ + (1+ρ₂)·nEx + α + γ·ä]

   α=0.5%  β=0.3%  γ=0.25%  ρ₁=3%  ρ₂=1.5%  i=5%

4. Net gain = Final insured amount − total net premiums paid.

Note: the final amount is currency-independent (i=5% is fixed).`,
    insured: "Insured details",
    birthDate: "Date of birth",
    startDate: "Contract start date",
    endDate: "Contract end date",
    term: "Term",
    months: "months",
    sector: "Business sector",
    sectorNonOil: "Non-oil and private sector",
    sectorOil: "Oil & gas sector",
    currency: "Currency",
    grossSalary: "Gross salary",
    grossPremium: "Gross premium (monthly)",
    calculate: "Calculate",
    resultsTitle: "Result",
    netSalary: "Net salary",
    netPremium: "Net premium (monthly)",
    superGross: "Super gross premium",
    maxAmount: "Max. premium ({p}% of gross)",
    finalSum: "Final insured amount",
    totalNet: "Total net premiums",
    netGain: "Net gain",
    netGainPct: "Net gain (%)",
    perMonth: "AZN / month",
    breakdown: "Details",
    ageAtStart: "Age at start",
    years: "years",
    warnDates: "The contract end date must be after the start date.",
    warnInputs: "Fill all fields correctly (dates, salary, premium).",
    emptyState: "Enter the details and press “Calculate”.",
    disclaimerTitle: "Note:",
    disclaimer: "This calculation is based on the actuarial formula of the Xalq Həyat savings model and is approximate. Contact the insurer for an exact quote.",
  },
  ru: {
    title: "Калькулятор накопительного страхования Xalq Həyat",
    description: "На основе даты рождения, срока договора и зарплаты рассчитайте нетто-взнос, итоговую страховую сумму и чистый доход.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как рассчитывается накопительное страхование Xalq Həyat?",
    formulaContent: `Калькулятор применяет актуарную модель «Накопительное страхование» Xalq Həyat:

1. Нетто-взнос выводится из брутто-зарплаты и брутто-взноса (ГФСЗ, подоходный налог, мед. и страхование от безработицы).
2. Доплата работодателя добавляется для получения «супер-брутто» взноса.
3. Итоговая страховая сумма рассчитывается ежемесячными актуарными коммутационными функциями (таблица смертности, ставка 5%, нагрузки):

   S = (1−β) × SG × Σ[tp_x·v^(t−1)] / [(1+ρ₁)·Ā¹ + (1+ρ₂)·nEx + α + γ·ä]

   α=0,5%  β=0,3%  γ=0,25%  ρ₁=3%  ρ₂=1,5%  i=5%

4. Чистый доход = Итоговая сумма − сумма уплаченных нетто-взносов.

Примечание: итоговая сумма не зависит от валюты (i=5% фиксирована).`,
    insured: "Данные застрахованного",
    birthDate: "Дата рождения",
    startDate: "Дата начала договора",
    endDate: "Дата окончания договора",
    term: "Срок",
    months: "мес.",
    sector: "Сектор бизнеса",
    sectorNonOil: "Ненефтяной и частный сектор",
    sectorOil: "Нефтегазовый сектор",
    currency: "Валюта",
    grossSalary: "Брутто зарплата",
    grossPremium: "Брутто взнос (в месяц)",
    calculate: "Рассчитать",
    resultsTitle: "Результат",
    netSalary: "Нетто зарплата",
    netPremium: "Нетто взнос (в месяц)",
    superGross: "Супер-брутто взнос",
    maxAmount: "Макс. взнос ({p}% от брутто)",
    finalSum: "Итоговая страховая сумма",
    totalNet: "Сумма нетто-взносов",
    netGain: "Чистый доход",
    netGainPct: "Чистый доход (%)",
    perMonth: "AZN / мес.",
    breakdown: "Подробно",
    ageAtStart: "Возраст на старте",
    years: "лет",
    warnDates: "Дата окончания договора должна быть позже даты начала.",
    warnInputs: "Заполните все поля корректно (даты, зарплата, взнос).",
    emptyState: "Введите данные и нажмите «Рассчитать».",
    disclaimerTitle: "Примечание:",
    disclaimer: "Расчёт основан на актуарной формуле накопительной модели Xalq Həyat и является приблизительным. Для точного предложения обратитесь к страховщику.",
  },
};

export default function XalqLifeSavingsCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2029-01-01");
  const [sector, setSector] = useState<Sector>("nonOil");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [grossSalary, setGrossSalary] = useState("1000");
  const [grossPremium, setGrossPremium] = useState("100");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!submitted) return null;
    const b = new Date(birthDate);
    const s = new Date(startDate);
    const e = new Date(endDate);
    const G = parseFloat(grossSalary);
    const P = parseFloat(grossPremium);
    if (isNaN(b.getTime()) || isNaN(s.getTime()) || isNaN(e.getTime()) || !G || !P) return "inputs";
    if (e <= s) return "dates";
    return calculate(b, s, e, sector, G, P);
  }, [submitted, birthDate, startDate, endDate, sector, grossSalary, grossPremium]);

  function handleCalc() {
    setError(null);
    setSubmitted(true);
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";
  const selectClass =
    "w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer";

  const res = typeof result === "object" ? result : null;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["life-insurance", "salary", "deposit", "loan"]}
    >
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-foreground">{pt.insured}</h3>

        {/* Tarixlər */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.birthDate}</label>
            <input type="date" value={birthDate} onChange={(e) => { setBirthDate(e.target.value); setSubmitted(false); }} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.startDate}</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setSubmitted(false); }} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.endDate}</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setSubmitted(false); }} className={inputClass} />
          </div>
        </div>

        {/* Sektor + valyuta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.sector}</label>
            <select value={sector} onChange={(e) => { setSector(e.target.value as Sector); setSubmitted(false); }} className={selectClass}>
              <option value="nonOil">{pt.sectorNonOil}</option>
              <option value="oil">{pt.sectorOil}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.currency}</label>
            <select value={currency} onChange={(e) => { setCurrency(e.target.value as Currency); setSubmitted(false); }} className={selectClass}>
              <option value="AZN">AZN</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Maaş + sığorta haqqı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.grossSalary} (AZN)</label>
            <input type="number" min="0" value={grossSalary} onChange={(e) => { setGrossSalary(e.target.value); setSubmitted(false); }} placeholder="1000" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.grossPremium} (AZN)</label>
            <input type="number" min="0" value={grossPremium} onChange={(e) => { setGrossPremium(e.target.value); setSubmitted(false); }} placeholder="100" className={inputClass} />
          </div>
        </div>

        <button onClick={handleCalc} className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
          {pt.calculate}
        </button>

        {result === "dates" && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4"><p className="text-sm text-red-600">{pt.warnDates}</p></div>
        )}
        {result === "inputs" && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4"><p className="text-sm text-red-600">{pt.warnInputs}</p></div>
        )}

        {res ? (
          <div className="space-y-4">
            {/* Əsas nəticə */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">{pt.finalSum}</p>
                <p className="text-3xl font-bold">{fmt(res.finalSum)}</p>
                <p className="text-xs text-blue-200 mt-1">AZN</p>
              </div>
              <div className={`rounded-2xl p-6 text-center border ${res.netGain >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <p className="text-sm text-muted mb-1">{pt.netGain}</p>
                <p className={`text-3xl font-bold ${res.netGain >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(res.netGain)}</p>
                <p className="text-xs text-muted mt-1">AZN · {(res.netGainPct * 100).toFixed(2)}%</p>
              </div>
            </div>

            {/* Detallar */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><span>📋</span>{pt.resultsTitle}</h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.term} · {pt.ageAtStart}</span>
                  <span className="text-sm font-medium text-foreground">{res.termMonths} {pt.months} · {Math.floor(res.ageMonths / 12)} {pt.years}</span>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.netSalary}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(res.netSalary)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.netPremium}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(res.netPremium)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.superGross}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(res.superGross)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.maxAmount.replace("{p}", (res.maxPct * 100).toFixed(1))}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(res.maxAmount)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3 bg-gray-50">
                  <span className="text-sm font-semibold text-foreground">{pt.totalNet}</span>
                  <span className="text-sm font-bold text-foreground">{fmt(res.totalNetPremiums)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-4 bg-primary-light">
                  <span className="text-sm font-semibold text-primary-dark">{pt.finalSum}</span>
                  <span className="text-sm font-bold text-primary-dark">{fmt(res.finalSum)} AZN</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <p className="text-xs text-blue-700 leading-relaxed"><span className="font-semibold">{pt.disclaimerTitle}</span> {pt.disclaimer}</p>
            </div>
          </div>
        ) : !result ? (
          <div className="text-center py-6 text-muted">
            <span className="text-4xl block mb-3">💰</span>
            <p>{pt.emptyState}</p>
          </div>
        ) : null}
      </div>
    </CalculatorLayout>
  );
}
