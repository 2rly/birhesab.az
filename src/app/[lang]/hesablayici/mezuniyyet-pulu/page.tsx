"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// ============================================================
// Məzuniyyət pulu hesablayıcısı (Əmək Məcəlləsinin 140-cı maddəsi)
// Son 12 aylıq gross qazanc → orta günlük (÷30.4) → məzuniyyət pulu
// Məzuniyyət ayında işlənmiş günlərin pulu və yekun ödəniş ay sonu
// ============================================================

const DAILY_DIVISOR = 30.4; // Qanunla müəyyən olunmuş orta aylıq gün sayı

const MONTHS_TRANSLATIONS: Record<Lang, string[]> = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

// ══════════════════════════════════════════════════════════════
// Vergi və ayırmalar (emek-haqqi hesablayıcısı ilə eyni qaydalar)
// ══════════════════════════════════════════════════════════════

type Sector = "private" | "state";

function calcPrivateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.03;
  if (gross <= 8000) return 75 + (gross - 2500) * 0.10;
  return 625 + (gross - 8000) * 0.14;
}

function calcPrivateDSMFEmployee(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  if (gross <= 8000) return 6 + (gross - 200) * 0.10;
  return 786 + (gross - 8000) * 0.10;
}

function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 50 + (gross - 2500) * 0.005;
}

function calcStateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.14;
  return 350 + (gross - 2500) * 0.25;
}

function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 160 + (gross - 8000) * 0.005;
}

interface Deductions {
  incomeTax: number;
  dsmf: number;
  unemployment: number;
  medical: number;
  total: number;
  net: number;
}

function calcDeductions(gross: number, sector: Sector): Deductions {
  if (gross <= 0) {
    return { incomeTax: 0, dsmf: 0, unemployment: 0, medical: 0, total: 0, net: 0 };
  }
  const unemployment = gross * 0.005;
  let incomeTax: number, dsmf: number, medical: number;

  if (sector === "private") {
    incomeTax = calcPrivateIncomeTax(gross);
    dsmf = calcPrivateDSMFEmployee(gross);
    medical = calcPrivateMedical(gross);
  } else {
    incomeTax = calcStateIncomeTax(gross);
    dsmf = gross * 0.03;
    medical = calcStateMedical(gross);
  }
  const total = incomeTax + dsmf + unemployment + medical;
  return { incomeTax, dsmf, unemployment, medical, total, net: gross - total };
}

// Məzuniyyət ayından ƏVVƏLKİ aydan başlayaraq 12 ay geri sayır.
// Məsələn: vacation = İyun 2026 → May 2026 (ən yaxın) ... İyun 2025 (ən uzaq).
// Məzuniyyət ayı (cari ay) heç vaxt cədvələ daxil edilmir.
function getLast12Months(startYear: number, startMonth: number): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < 12; i++) {
    m--;
    if (m < 0) { m = 11; y--; }
    months.push({ year: y, month: m });
  }
  return months;
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ══════════════════════════════════════════════════════════════
// Tərcümələr
// ══════════════════════════════════════════════════════════════

const pageTranslations = {
  az: {
    title: "Məzuniyyət pulu hesablayıcısı",
    description: "Son 12 ayın gross əmək haqqına əsasən məzuniyyət pulunu və ay sonu kart ödənişini hesablayın.",
    breadcrumbCategory: "Əmək Hüququ",
    breadcrumbLabel: "Məzuniyyət pulu hesablayıcısı",
    formulaTitle: "Məzuniyyət pulu necə hesablanır?",
    formulaContent: `Hesablama qaydası (Əmək Məcəlləsinin 140-cı maddəsi):

1. Məzuniyyətdən əvvəlki son 12 ayın gross əmək haqqı toplanır.
   Misal: işçi iyun ayında məzuniyyətə çıxırsa, may, aprel, mart, ..., əvvəlki ilin iyunu daxil olmaqla 12 ay götürülür.

2. Orta aylıq əmək haqqı = Cəmi ÷ 12

3. Bir günlük əmək haqqı = Orta aylıq ÷ 30,4

4. Məzuniyyət haqqı (gross) = Bir günlük × məzuniyyət təqvim günü

5. Məzuniyyət haqqından gəlir vergisi, DSMF (3%), işsizlik (0,5%) və icbari tibbi sığorta tutulur — net məbləğ işçinin kartına 3 gün əvvəl köçür.

Ay sonu hesablanması:

6. Cari ay (məzuniyyət ayı) bir günlük gross = Cari ay maaşı ÷ həmin ayın iş günü sayı

7. İşlənmiş günlərin pulu = Bir günlük × məzuniyyətə qədər işlənmiş gün sayı

8. Cəmi: işlənmiş günlərin pulu + 14 günlük məzuniyyət pulu

9. Gross fərq = Cari ay gross maaşı − cəmi

10. Bu gross fərqdən vergi, DSMF və s. tutulur — yaranan net məbləğ ay sonu işçinin kartına köçür.`,
    sectorLabel: "Sektor",
    sectorPrivate: "Özəl / qeyri neft-qaz",
    sectorState: "Dövlət / neft-qaz",
    vacationStart: "Məzuniyyət başlayan ay",
    vacationDays: "Məzuniyyət təqvim günü",
    autoCalcNote: "Məzuniyyət ayı çıxarılır — əvvəlki aydan başlayaraq 12 ay geri sayılır.",
    last12Title: "Son 12 ayın gross əmək haqqı",
    last12Sub: "Hər ay üçün gross (vergiyə qədər) məbləği daxil edin.",
    year: "İl",
    month: "Ay",
    amount: "Gross (AZN)",
    total: "Cəmi",
    currentMonthTitle: "Məzuniyyət ayı (ay sonu hesablanması)",
    currentGross: "Cari ay gross əmək haqqı",
    currentGrossHint: "Məzuniyyətə çıxdığınız ayın müqavilə üzrə gross maaşı.",
    monthWorkDays: "Bu ayda iş günlərinin sayı",
    monthWorkDaysHint: "Misal: iyun ayında 22 iş günü.",
    workedDays: "Məzuniyyətə çıxdığınız ay cəmi neçə gün işə gələcəksiniz",
    workedDaysHint: "Məzuniyyət ayında işə gələcəyiniz iş günlərinin ümumi sayı.",
    resultTitle: "Məzuniyyət pulu (gross)",
    resultNet: "Məzuniyyət pulu (net) — kartınıza köçən",
    days: "gün",
    perDay: "AZN/gün",
    avgMonthly: "Orta aylıq gross",
    avgDaily: "Bir günlük (orta)",
    stepsTitle: "Hesablama addımları",
    step1: "1. Son 12 ayın gross cəmi",
    step2: "2. Orta aylıq",
    step3: "3. Bir günlük",
    step3Note: "30,4 — qanunla müəyyən edilmiş orta aylıq gün sayı",
    step4: "4. Məzuniyyət haqqı (gross)",
    vacTaxesTitle: "Məzuniyyət pulundan tutulanlar",
    incomeTax: "Gəlir vergisi",
    dsmf: "DSMF (işçi)",
    unemployment: "İşsizlik sığortası",
    medical: "İcbari tibbi sığorta",
    totalDeductions: "Cəmi tutulan",
    netResult: "Kartınıza köçən (net)",
    monthEndTitle: "Ay sonu hesablanması",
    monthEndSub: "Məzuniyyət ayında işlənmiş günlər və ay sonu kart ödənişi",
    dailyInMonth: "Bir günlük (cari ay)",
    workedPay: "İşlənmiş günlərin gross pulu",
    sumPay: "İşlənmiş günlər + məzuniyyət pulu",
    grossDiff: "Gross fərq",
    grossDiffNote: "Cari ay gross maaşından (işlənmiş + məzuniyyət) çıxılır.",
    netDiff: "Ay sonu kart ödənişi (net)",
    summaryTitle: "Xülasə",
    paidBeforeVacation: "Məzuniyyətdən əvvəl ödənilir",
    paidEndOfMonth: "Ay sonu kart ödənişi",
    totalReceived: "Bu ayda cəmi əldə edilən",
    emptyState: "Nəticəni görmək üçün son 12 ayın gross əmək haqqını və cari ay məlumatlarını daxil edin.",
    laborCodeTitle: "Əmək Məcəlləsi üzrə məzuniyyət minimumları",
    standard: "Standart",
    experience5_10: "5–10 il staj",
    experience10_15: "10–15 il staj",
    experience15plus: "15+ il staj",
    hardLabor: "Ağır əmək şəraiti",
  },
  en: {
    title: "Vacation Pay Calculator",
    description: "Calculate vacation pay and end-of-month card payment based on the last 12 months' gross salary.",
    breadcrumbCategory: "Labor Law",
    breadcrumbLabel: "Vacation pay calculator",
    formulaTitle: "How is vacation pay calculated?",
    formulaContent: `Calculation procedure (Article 140 of the Labor Code):

1. Sum the gross salary for the 12 months before the vacation month.
   Example: if the worker takes vacation in June, take May, April, March, ..., back to June of the previous year.

2. Average monthly = Total ÷ 12

3. Daily wage = Average monthly ÷ 30.4

4. Vacation pay (gross) = Daily wage × vacation calendar days

5. Income tax, DSMF (3%), unemployment (0.5%) and mandatory medical insurance are deducted from the vacation pay — the net amount is transferred to the worker's card 3 days before vacation.

End-of-month calculation:

6. Daily wage in current month = Current month gross ÷ working days in that month

7. Worked-days pay = Daily wage × days worked before vacation

8. Sum = Worked-days pay + 14-day vacation pay

9. Gross difference = Current month gross − Sum

10. Tax, DSMF etc. are deducted from this gross difference — the resulting net is transferred to the worker's card at the end of the month.`,
    sectorLabel: "Sector",
    sectorPrivate: "Private / non-oil",
    sectorState: "State / oil & gas",
    vacationStart: "Vacation start month",
    vacationDays: "Vacation calendar days",
    autoCalcNote: "The vacation month is excluded — the 12 months immediately before it are used.",
    last12Title: "Gross salary for the last 12 months",
    last12Sub: "Enter the gross (pre-tax) amount for each month.",
    year: "Year",
    month: "Month",
    amount: "Gross (AZN)",
    total: "Total",
    currentMonthTitle: "Vacation month (end-of-month calculation)",
    currentGross: "Current month gross salary",
    currentGrossHint: "Contracted gross salary for the month you take vacation.",
    monthWorkDays: "Number of working days this month",
    monthWorkDaysHint: "Example: 22 working days in June.",
    workedDays: "Total days you will come to work in the vacation month",
    workedDaysHint: "Total working days you will be present in the vacation month.",
    resultTitle: "Vacation pay (gross)",
    resultNet: "Vacation pay (net) — transferred to your card",
    days: "days",
    perDay: "AZN/day",
    avgMonthly: "Average monthly gross",
    avgDaily: "Daily (average)",
    stepsTitle: "Calculation steps",
    step1: "1. Total gross for the last 12 months",
    step2: "2. Average monthly",
    step3: "3. Daily wage",
    step3Note: "30.4 — statutory average days per month",
    step4: "4. Vacation pay (gross)",
    vacTaxesTitle: "Deductions from vacation pay",
    incomeTax: "Income tax",
    dsmf: "DSMF (employee)",
    unemployment: "Unemployment insurance",
    medical: "Mandatory medical insurance",
    totalDeductions: "Total deductions",
    netResult: "Transferred to your card (net)",
    monthEndTitle: "End-of-month calculation",
    monthEndSub: "Worked days in the vacation month and end-of-month card payment",
    dailyInMonth: "Daily (current month)",
    workedPay: "Gross pay for worked days",
    sumPay: "Worked-days pay + vacation pay",
    grossDiff: "Gross difference",
    grossDiffNote: "Subtracted from current-month gross (worked + vacation).",
    netDiff: "End-of-month card payment (net)",
    summaryTitle: "Summary",
    paidBeforeVacation: "Paid before vacation",
    paidEndOfMonth: "End-of-month card payment",
    totalReceived: "Total received this month",
    emptyState: "Enter the last 12 months' gross salary and current month details to see the result.",
    laborCodeTitle: "Minimum vacation under the Labor Code",
    standard: "Standard",
    experience5_10: "5–10 years of experience",
    experience10_15: "10–15 years of experience",
    experience15plus: "15+ years of experience",
    hardLabor: "Hard labor conditions",
  },
  ru: {
    title: "Калькулятор отпускных",
    description: "Рассчитайте отпускные и выплату на карту в конце месяца на основе зарплаты за последние 12 месяцев.",
    breadcrumbCategory: "Трудовое право",
    breadcrumbLabel: "Калькулятор отпускных",
    formulaTitle: "Как рассчитываются отпускные?",
    formulaContent: `Порядок расчёта (статья 140 Трудового кодекса):

1. Суммируется gross-зарплата за 12 месяцев перед месяцем отпуска.
   Пример: если работник идёт в отпуск в июне, берутся май, апрель, март, ..., вплоть до июня прошлого года.

2. Средняя месячная = Сумма ÷ 12

3. Дневная ставка = Средняя месячная ÷ 30,4

4. Отпускные (gross) = Дневная ставка × календарные дни отпуска

5. С отпускных удерживается подоходный налог, ДСМФ (3%), страхование от безработицы (0,5%) и обязательное медицинское страхование — нетто-сумма перечисляется на карту за 3 дня до отпуска.

Расчёт в конце месяца:

6. Дневная ставка в текущем месяце = Gross-зарплата ÷ рабочие дни этого месяца

7. Оплата за отработанные дни = Дневная ставка × отработанные дни до отпуска

8. Сумма = Оплата за отработанные дни + отпускные за 14 дней

9. Gross-разница = Gross-зарплата текущего месяца − Сумма

10. С этой gross-разницы удерживаются налоги, ДСМФ и т.д. — итоговая нетто-сумма перечисляется на карту в конце месяца.`,
    sectorLabel: "Сектор",
    sectorPrivate: "Частный / не-нефтяной",
    sectorState: "Государственный / нефтегазовый",
    vacationStart: "Месяц начала отпуска",
    vacationDays: "Дни отпуска (календарные)",
    autoCalcNote: "Месяц отпуска исключается — берутся 12 месяцев непосредственно перед ним.",
    last12Title: "Gross-зарплата за последние 12 месяцев",
    last12Sub: "Укажите gross-сумму (до налогов) за каждый месяц.",
    year: "Год",
    month: "Месяц",
    amount: "Gross (AZN)",
    total: "Итого",
    currentMonthTitle: "Месяц отпуска (расчёт в конце месяца)",
    currentGross: "Gross-зарплата текущего месяца",
    currentGrossHint: "Договорная gross-зарплата за месяц, когда вы идёте в отпуск.",
    monthWorkDays: "Рабочих дней в этом месяце",
    monthWorkDaysHint: "Например: 22 рабочих дня в июне.",
    workedDays: "Сколько всего дней вы выйдете на работу в месяце отпуска",
    workedDaysHint: "Общее количество рабочих дней, которые вы будете присутствовать в месяце отпуска.",
    resultTitle: "Отпускные (gross)",
    resultNet: "Отпускные (нетто) — на вашу карту",
    days: "дней",
    perDay: "AZN/день",
    avgMonthly: "Средняя месячная gross",
    avgDaily: "Дневная (средняя)",
    stepsTitle: "Этапы расчёта",
    step1: "1. Сумма gross за 12 месяцев",
    step2: "2. Средняя месячная",
    step3: "3. Дневная ставка",
    step3Note: "30,4 — установленное законом среднее количество дней в месяце",
    step4: "4. Отпускные (gross)",
    vacTaxesTitle: "Удержания с отпускных",
    incomeTax: "Подоходный налог",
    dsmf: "ДСМФ (работник)",
    unemployment: "Страхование от безработицы",
    medical: "Обязательное мед. страхование",
    totalDeductions: "Итого удержано",
    netResult: "На карту (нетто)",
    monthEndTitle: "Расчёт в конце месяца",
    monthEndSub: "Отработанные дни в месяце отпуска и выплата на карту в конце месяца",
    dailyInMonth: "Дневная (текущий месяц)",
    workedPay: "Gross за отработанные дни",
    sumPay: "Отработанные дни + отпускные",
    grossDiff: "Gross-разница",
    grossDiffNote: "Вычитается из gross текущего месяца (отработанные + отпуск).",
    netDiff: "Выплата на карту в конце месяца (нетто)",
    summaryTitle: "Итоги",
    paidBeforeVacation: "Выплачено перед отпуском",
    paidEndOfMonth: "Выплата на карту в конце месяца",
    totalReceived: "Всего получено в этом месяце",
    emptyState: "Введите gross-зарплату за 12 месяцев и данные текущего месяца, чтобы увидеть результат.",
    laborCodeTitle: "Минимальный отпуск по Трудовому кодексу",
    standard: "Стандарт",
    experience5_10: "5–10 лет стажа",
    experience10_15: "10–15 лет стажа",
    experience15plus: "15+ лет стажа",
    hardLabor: "Тяжёлые условия труда",
  },
};

// ══════════════════════════════════════════════════════════════
// Komponent
// ══════════════════════════════════════════════════════════════

export default function VacationPayCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const MONTHS = MONTHS_TRANSLATIONS[lang];

  const [sector, setSector] = useState<Sector>("private");
  const [vacYear, setVacYear] = useState(2026);
  const [vacMonth, setVacMonth] = useState(5); // 0-indexed: 5 = İyun
  const [vacationDays, setVacationDays] = useState("14");

  const last12 = useMemo(() => getLast12Months(vacYear, vacMonth), [vacYear, vacMonth]);

  const [monthAmounts, setMonthAmounts] = useState<Record<string, string>>({});
  const setMonthAmount = (key: string, value: string) =>
    setMonthAmounts((prev) => ({ ...prev, [key]: value }));

  const [currentGross, setCurrentGross] = useState("");
  const [monthWorkDays, setMonthWorkDays] = useState("");
  const [workedDays, setWorkedDays] = useState("");

  const result = useMemo(() => {
    let totalEarnings = 0;
    const monthDetails: { label: string; amount: number }[] = [];
    for (const m of last12) {
      const key = `${m.year}-${m.month}`;
      const val = parseFloat(monthAmounts[key] || "0") || 0;
      totalEarnings += val;
      monthDetails.push({ label: `${MONTHS[m.month]} ${m.year}`, amount: val });
    }
    if (totalEarnings <= 0) return null;

    const vacDays = parseInt(vacationDays) || 0;
    if (vacDays <= 0) return null;

    const avgMonthly = totalEarnings / 12;
    const avgDaily = avgMonthly / DAILY_DIVISOR;
    const vacationGross = avgDaily * vacDays;
    const vacationDeductions = calcDeductions(vacationGross, sector);

    // Ay sonu (cari ay) hesablanması
    const cg = parseFloat(currentGross) || 0;
    const mwd = parseInt(monthWorkDays) || 0;
    const wd = parseInt(workedDays) || 0;

    let monthEnd: {
      currentGross: number;
      monthWorkDays: number;
      workedDays: number;
      dailyInMonth: number;
      workedPayGross: number;
      sumPay: number;
      grossDiff: number;
      diffDeductions: Deductions;
    } | null = null;

    if (cg > 0 && mwd > 0 && wd >= 0) {
      const dailyInMonth = cg / mwd;
      const workedPayGross = dailyInMonth * wd;
      const sumPay = workedPayGross + vacationGross;
      const grossDiff = cg - sumPay;
      const diffDeductions = calcDeductions(Math.max(0, grossDiff), sector);
      monthEnd = {
        currentGross: cg,
        monthWorkDays: mwd,
        workedDays: wd,
        dailyInMonth,
        workedPayGross,
        sumPay,
        grossDiff,
        diffDeductions,
      };
    }

    return {
      totalEarnings,
      avgMonthly,
      avgDaily,
      vacationDays: vacDays,
      vacationGross,
      vacationDeductions,
      monthDetails,
      monthEnd,
    };
  }, [monthAmounts, last12, vacationDays, sector, currentGross, monthWorkDays, workedDays, MONTHS]);

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right";

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=labor" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "teacher-vacation", "paternity-leave", "severance-pay"]}
    >
      {/* Sektor */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.sectorLabel}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSector("private")}
            className={`p-3 rounded-xl border text-center transition-all ${
              sector === "private"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{pt.sectorPrivate}</p>
          </button>
          <button
            onClick={() => setSector("state")}
            className={`p-3 rounded-xl border text-center transition-all ${
              sector === "state"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{pt.sectorState}</p>
          </button>
        </div>
      </div>

      {/* Məzuniyyət başlanğıc ayı və günü */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">{pt.vacationStart}</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={vacMonth}
              onChange={(e) => setVacMonth(parseInt(e.target.value))}
              className="px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              {MONTHS.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={vacYear}
              onChange={(e) => setVacYear(parseInt(e.target.value))}
              className="px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted mt-1">{pt.autoCalcNote}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.vacationDays}</label>
          <input
            type="number"
            value={vacationDays}
            onChange={(e) => setVacationDays(e.target.value)}
            placeholder="14"
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <div className="flex gap-1 mt-2 flex-wrap">
            {[14, 21, 28, 30].map((d) => (
              <button
                key={d}
                onClick={() => setVacationDays(d.toString())}
                className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                  vacationDays === d.toString()
                    ? "border-primary bg-primary-light text-primary font-medium"
                    : "border-border bg-white text-muted hover:border-primary/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 12 aylıq gross cədvəli */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-1">{pt.last12Title}</label>
        <p className="text-xs text-muted mb-2">{pt.last12Sub}</p>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-border grid grid-cols-3 text-xs font-medium text-muted">
            <span>{pt.year}</span>
            <span>{pt.month}</span>
            <span className="text-right">{pt.amount}</span>
          </div>
          <div className="divide-y divide-border">
            {last12.map((m) => {
              const key = `${m.year}-${m.month}`;
              return (
                <div key={key} className="px-4 py-2 grid grid-cols-3 items-center gap-2">
                  <span className="text-sm text-muted">{m.year}</span>
                  <span className="text-sm text-foreground font-medium">{MONTHS[m.month]}</span>
                  <input
                    type="number"
                    value={monthAmounts[key] || ""}
                    onChange={(e) => setMonthAmount(key, e.target.value)}
                    placeholder="0"
                    min="0"
                    className={inputCls}
                  />
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 px-4 py-2.5 border-t border-border grid grid-cols-3 items-center">
            <span className="col-span-2 text-sm font-semibold text-foreground">{pt.total}</span>
            <span className="text-sm font-bold text-primary text-right">
              {fmt(last12.reduce((s, m) => s + (parseFloat(monthAmounts[`${m.year}-${m.month}`] || "0") || 0), 0))} ₼
            </span>
          </div>
        </div>
      </div>

      {/* Cari ay (məzuniyyət ayı) məlumatları */}
      <div className="mb-8 bg-amber-50/40 rounded-xl border border-amber-200 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <span>📅</span>{pt.currentMonthTitle}
        </h3>
        <p className="text-xs text-muted mb-3">{pt.monthEndSub}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{pt.currentGross}</label>
            <input
              type="number"
              value={currentGross}
              onChange={(e) => setCurrentGross(e.target.value)}
              placeholder="2500"
              min="0"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-[11px] text-muted mt-1">{pt.currentGrossHint}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{pt.monthWorkDays}</label>
            <input
              type="number"
              value={monthWorkDays}
              onChange={(e) => setMonthWorkDays(e.target.value)}
              placeholder="22"
              min="1"
              max="31"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-[11px] text-muted mt-1">{pt.monthWorkDaysHint}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{pt.workedDays}</label>
            <input
              type="number"
              value={workedDays}
              onChange={(e) => setWorkedDays(e.target.value)}
              placeholder="10"
              min="0"
              max="31"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-[11px] text-muted mt-1">{pt.workedDaysHint}</p>
          </div>
        </div>
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas məzuniyyət pulu kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.resultTitle} ({result.vacationDays} {pt.days})</p>
              <p className="text-3xl font-bold">{fmt(result.vacationGross)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN (gross)</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-green-100 mb-1">{pt.resultNet}</p>
              <p className="text-3xl font-bold">{fmt(result.vacationDeductions.net)}</p>
              <p className="text-xs text-green-100 mt-1">AZN (net)</p>
            </div>
          </div>

          {/* Addım-addım hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>{pt.stepsTitle}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {/* Addım 1 — 12 ay cəmi */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-medium text-foreground">{pt.step1}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                    {result.monthDetails.map((m, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted">{m.label}:</span>
                        <span className={`font-medium ${m.amount > 0 ? "text-foreground" : "text-muted"}`}>{fmt(m.amount)}₼</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-xs font-medium text-foreground">
                      {pt.total}: <span className="font-bold text-primary">{fmt(result.totalEarnings)} AZN</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Addım 2 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-medium text-foreground">{pt.step2}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.totalEarnings)} ÷ 12 = <span className="font-bold text-primary">{fmt(result.avgMonthly)} AZN</span>
                  </p>
                </div>
              </div>

              {/* Addım 3 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-sm font-medium text-foreground">{pt.step3}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.avgMonthly)} ÷ 30,4 = <span className="font-bold text-primary">{fmt(result.avgDaily)} AZN</span>
                  </p>
                  <p className="text-[11px] text-muted mt-1">{pt.step3Note}</p>
                </div>
              </div>

              {/* Addım 4 — gross məzuniyyət pulu */}
              <div className="px-5 py-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">4</span>
                  <span className="text-sm font-semibold text-primary">{pt.step4}</span>
                </div>
                <div className="ml-8 bg-white rounded-lg p-3">
                  <p className="text-sm text-foreground">
                    {fmt(result.avgDaily)} × {result.vacationDays} {pt.days} = <span className="font-bold text-primary">{fmt(result.vacationGross)} AZN</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Məzuniyyət pulundan tutulanlar */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>💰</span>{pt.vacTaxesTitle}
              </h3>
            </div>
            <div className="divide-y divide-border text-sm">
              <div className="px-5 py-2.5 flex justify-between">
                <span className="text-muted">{pt.incomeTax}</span>
                <span className="font-medium text-foreground">−{fmt(result.vacationDeductions.incomeTax)} ₼</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between">
                <span className="text-muted">{pt.dsmf}</span>
                <span className="font-medium text-foreground">−{fmt(result.vacationDeductions.dsmf)} ₼</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between">
                <span className="text-muted">{pt.unemployment}</span>
                <span className="font-medium text-foreground">−{fmt(result.vacationDeductions.unemployment)} ₼</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between">
                <span className="text-muted">{pt.medical}</span>
                <span className="font-medium text-foreground">−{fmt(result.vacationDeductions.medical)} ₼</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between bg-gray-50">
                <span className="font-semibold text-foreground">{pt.totalDeductions}</span>
                <span className="font-bold text-foreground">−{fmt(result.vacationDeductions.total)} ₼</span>
              </div>
              <div className="px-5 py-3 flex justify-between bg-green-50">
                <span className="font-semibold text-green-700">{pt.netResult}</span>
                <span className="font-bold text-green-700">{fmt(result.vacationDeductions.net)} ₼</span>
              </div>
            </div>
          </div>

          {/* Ay sonu hesablanması */}
          {result.monthEnd && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-amber-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📅</span>{pt.monthEndTitle}
                </h3>
                <p className="text-xs text-muted mt-1">{pt.monthEndSub}</p>
              </div>
              <div className="divide-y divide-border text-sm">
                {/* 6. Bir günlük cari ay */}
                <div className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">6</span>
                    <span className="text-sm font-medium text-foreground">{pt.dailyInMonth}</span>
                  </div>
                  <div className="ml-8 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-foreground">
                      {fmt(result.monthEnd.currentGross)} ÷ {result.monthEnd.monthWorkDays} = <span className="font-bold text-amber-700">{fmt(result.monthEnd.dailyInMonth)} {pt.perDay}</span>
                    </p>
                  </div>
                </div>
                {/* 7. İşlənmiş günlərin pulu */}
                <div className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">7</span>
                    <span className="text-sm font-medium text-foreground">{pt.workedPay}</span>
                  </div>
                  <div className="ml-8 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-foreground">
                      {fmt(result.monthEnd.dailyInMonth)} × {result.monthEnd.workedDays} = <span className="font-bold text-amber-700">{fmt(result.monthEnd.workedPayGross)} AZN</span>
                    </p>
                  </div>
                </div>
                {/* 8. Cəmi (işlənmiş + məzuniyyət) */}
                <div className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">8</span>
                    <span className="text-sm font-medium text-foreground">{pt.sumPay}</span>
                  </div>
                  <div className="ml-8 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-foreground">
                      {fmt(result.monthEnd.workedPayGross)} + {fmt(result.vacationGross)} = <span className="font-bold text-amber-700">{fmt(result.monthEnd.sumPay)} AZN</span>
                    </p>
                  </div>
                </div>
                {/* 9. Gross fərq */}
                <div className="px-5 py-3 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">9</span>
                    <span className="text-sm font-semibold text-foreground">{pt.grossDiff}</span>
                  </div>
                  <div className="ml-8 bg-white rounded-lg p-3">
                    <p className="text-sm text-foreground">
                      {fmt(result.monthEnd.currentGross)} − {fmt(result.monthEnd.sumPay)} = <span className={`font-bold ${result.monthEnd.grossDiff < 0 ? "text-red-600" : "text-amber-700"}`}>{fmt(result.monthEnd.grossDiff)} AZN</span>
                    </p>
                    <p className="text-[11px] text-muted mt-1">{pt.grossDiffNote}</p>
                  </div>
                </div>
                {/* 10. Vergi tutulması */}
                <div className="px-5 py-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between"><span className="text-muted">{pt.incomeTax}:</span><span className="font-medium">−{fmt(result.monthEnd.diffDeductions.incomeTax)}₼</span></div>
                    <div className="flex justify-between"><span className="text-muted">{pt.dsmf}:</span><span className="font-medium">−{fmt(result.monthEnd.diffDeductions.dsmf)}₼</span></div>
                    <div className="flex justify-between"><span className="text-muted">{pt.unemployment}:</span><span className="font-medium">−{fmt(result.monthEnd.diffDeductions.unemployment)}₼</span></div>
                    <div className="flex justify-between"><span className="text-muted">{pt.medical}:</span><span className="font-medium">−{fmt(result.monthEnd.diffDeductions.medical)}₼</span></div>
                  </div>
                </div>
                <div className="px-5 py-3 flex justify-between bg-green-50">
                  <span className="font-semibold text-green-700">{pt.netDiff}</span>
                  <span className="font-bold text-green-700">{fmt(result.monthEnd.diffDeductions.net)} ₼</span>
                </div>
              </div>
            </div>
          )}

          {/* Xülasə */}
          {result.monthEnd && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>📊</span>{pt.summaryTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-muted mb-1">{pt.paidBeforeVacation}</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.vacationDeductions.net)} ₼</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-muted mb-1">{pt.paidEndOfMonth}</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.monthEnd.diffDeductions.net)} ₼</p>
                </div>
                <div className="bg-primary text-white rounded-lg p-3">
                  <p className="text-xs text-blue-100 mb-1">{pt.totalReceived}</p>
                  <p className="text-lg font-bold">{fmt(result.vacationDeductions.net + result.monthEnd.diffDeductions.net)} ₼</p>
                </div>
              </div>
            </div>
          )}

          {/* Əmək Məcəlləsi minimumları */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>{pt.laborCodeTitle}
            </h4>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex justify-between"><span>{pt.standard}</span><span className="font-medium text-foreground">21 {pt.days}</span></div>
              <div className="flex justify-between"><span>{pt.experience5_10}</span><span className="font-medium text-foreground">+2 {pt.days}</span></div>
              <div className="flex justify-between"><span>{pt.experience10_15}</span><span className="font-medium text-foreground">+4 {pt.days}</span></div>
              <div className="flex justify-between"><span>{pt.experience15plus}</span><span className="font-medium text-foreground">+6 {pt.days}</span></div>
              <div className="flex justify-between"><span>{pt.hardLabor}</span><span className="font-medium text-foreground">+6 {pt.days}</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏖️</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
