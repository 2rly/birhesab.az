"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// ============================================================
// Müəllimlərin əmək məzuniyyəti hesablayıcısı
// Son 12 aylıq qazanc əsasında hesablanır
// Orta aylıq = cəmi ÷ 12, Orta günlük = orta aylıq ÷ 30.4
// Məzuniyyət pulu = orta günlük × gün sayı (56 və ya 42)
// ============================================================

const MONTHS_TRANSLATIONS: Record<Lang, string[]> = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

const DAILY_DIVISOR = 30.4; // Orta aylıq gün sayı

const pageTranslations = {
  az: {
    title: "Müəllimlərin məzuniyyət haqqı hesablayıcısı",
    description: "Son 12 aylıq qazancınıza əsasən müəllim məzuniyyət pulunuzu hesablayın (56 və ya 42 gün).",
    breadcrumbCategory: "Əmək Hüququ",
    breadcrumbLabel: "Müəllim məzuniyyət haqqı",
    formulaTitle: "Müəllim məzuniyyət haqqı necə hesablanır?",
    formulaContent: `Hesablama qaydası:
1. Son 12 aylıq ümumi qazanc toplanır
2. Orta aylıq əmək haqqı = Cəmi ÷ 12
3. Orta günlük əmək haqqı = Orta aylıq ÷ 30,4
4. Məzuniyyət pulu = Orta günlük × gün sayı

Müəllimlərin məzuniyyət müddəti:
• 56 təqvim günü — əsas məzuniyyət
• 42 təqvim günü — bəzi hallarda

Nümunə (son 12 ay cəmi: 15 065₼):
Orta aylıq: 15 065 ÷ 12 = 1 255,42₼
Orta günlük: 1 255,42 ÷ 30,4 = 41,30₼
56 günlük məzuniyyət: 41,30 × 56 = 2 312,81₼
42 günlük məzuniyyət: 41,30 × 42 = 1 734,60₼`,
    vacationDuration: "Məzuniyyət müddəti",
    days56: "56 gün",
    mainVacation: "Əsas məzuniyyət",
    days42: "42 gün",
    shortenedVacation: "Qısaldılmış məzuniyyət",
    vacationStartMonth: "Məzuniyyət başlayan ay",
    vacationStartDate: "Məzuniyyət başlama tarixi",
    payableTitle: "Ödəniləcək məzuniyyət haqqı",
    methodBWins: "Yeni üsul (saxlanılan əmək haqqı) daha yüksəkdir — bu ödənilir",
    methodAWins: "Orta əmək haqqı üsulu daha yüksəkdir — bu ödənilir",
    methodALabel: "Üsul A — Orta əmək haqqı",
    methodADesc: "Son 12 ayın ortası ÷ 30,4 × gün",
    methodBLabel: "Üsul B — Saxlanılan əmək haqqı",
    methodBDesc: "Sonuncu maaş: tam ay + qalan günlərin iş günü hesabı",
    lastSalaryLabel: "Sonuncu maaş",
    dailyWageLabel: "Günlük",
    fullMonth: "tam ay",
    partialMonth: "natamam ay",
    workdays: "iş günü",
    workdaysNote: "İş günləri yalnız həftə sonları (şənbə/bazar) çıxılmaqla hesablanır; rəsmi bayramlar nəzərə alınmır.",
    autoCalcNote: "Məzuniyyətdən əvvəlki son 12 ay avtomatik hesablanacaq",
    entryModeLabel: "Maaş daxiletmə üsulu",
    sameSalary: "Bütün aylar eyni",
    sameSalaryDesc: "Bir dəfə yaz, 12 aya tətbiq olunsun",
    differentSalary: "Aylar fərqli",
    differentSalaryDesc: "Hər ayı bir-bir yaz",
    monthlySalaryLabel: "Aylıq gross (hesablanmış) maaş (AZN)",
    monthlySalaryHint: "Vergidən əvvəlki gross məbləğ. Bu məbləğ aşağıdakı 12 ayın hamısına tətbiq olunur",
    monthsExcludeNote: (vac: string) => `Məzuniyyət ayı (${vac}) daxil edilmir — ondan əvvəlki 12 ay götürülür:`,
    last12MonthsEarnings: "Son 12 aylıq gross qazanc (AZN)",
    year: "İl",
    month: "Ay",
    amount: "Məbləğ (AZN)",
    total: "Cəmi",
    vacationPay: "Məzuniyyət haqqı",
    days: "gün",
    calcProcedure: "Hesablama qaydası",
    stepByStep: "addım-addım",
    step1Title: "Son 12 aylıq ümumi qazanc",
    step1Total: "Cəmi:",
    step2Title: "Orta aylıq əmək haqqı",
    step2Months: "ay",
    step3Title: "Orta günlük əmək haqqı",
    step3Note: "30,4 — qanunla müəyyən edilmiş orta aylıq gün sayı",
    step4Title: "Məzuniyyət haqqı",
    summaryTitle: "Xülasə",
    summary12Month: "12 aylıq qazanc",
    summaryAvgMonthly: "Orta aylıq",
    summaryAvgDaily: "Orta günlük",
    summaryVacation: "Məzuniyyət",
    comparisonTitle: "Müqayisə",
    comparisonDiff: (amount: string) => `Fərq: ${amount} AZN (14 gün)`,
    emptyState: "Nəticəni görmək üçün aylıq qazancları daxil edin.",
  },
  en: {
    title: "Teacher Vacation Pay Calculator",
    description: "Calculate teacher vacation pay based on your last 12 months' earnings (56 or 42 days).",
    breadcrumbCategory: "Labor Law",
    breadcrumbLabel: "Teacher vacation pay",
    formulaTitle: "How is teacher vacation pay calculated?",
    formulaContent: `Calculation procedure:
1. Total earnings for the last 12 months are summed
2. Average monthly salary = Total ÷ 12
3. Average daily salary = Average monthly ÷ 30.4
4. Vacation pay = Average daily × number of days

Teacher vacation duration:
• 56 calendar days — main vacation
• 42 calendar days — in some cases

Example (last 12 months total: 15,065₼):
Average monthly: 15,065 ÷ 12 = 1,255.42₼
Average daily: 1,255.42 ÷ 30.4 = 41.30₼
56-day vacation: 41.30 × 56 = 2,312.81₼
42-day vacation: 41.30 × 42 = 1,734.60₼`,
    vacationDuration: "Vacation duration",
    days56: "56 days",
    mainVacation: "Main vacation",
    days42: "42 days",
    shortenedVacation: "Shortened vacation",
    vacationStartMonth: "Vacation start month",
    vacationStartDate: "Vacation start date",
    payableTitle: "Vacation pay due",
    methodBWins: "New method (retained salary) is higher — this is paid",
    methodAWins: "Average-salary method is higher — this is paid",
    methodALabel: "Method A — Average salary",
    methodADesc: "Last 12 months avg ÷ 30.4 × days",
    methodBLabel: "Method B — Retained salary",
    methodBDesc: "Last salary: full month + working-day proration of remaining days",
    lastSalaryLabel: "Last salary",
    dailyWageLabel: "Daily",
    fullMonth: "full month",
    partialMonth: "partial month",
    workdays: "working days",
    workdaysNote: "Working days exclude weekends (Sat/Sun) only; public holidays are not considered.",
    autoCalcNote: "The last 12 months before vacation will be calculated automatically",
    entryModeLabel: "Salary entry method",
    sameSalary: "All months equal",
    sameSalaryDesc: "Enter once, applied to 12 months",
    differentSalary: "Months differ",
    differentSalaryDesc: "Enter each month individually",
    monthlySalaryLabel: "Monthly gross salary (AZN)",
    monthlySalaryHint: "Gross amount (before tax). This amount applies to all 12 months below",
    monthsExcludeNote: (vac: string) => `The vacation month (${vac}) is excluded — the 12 months before it are used:`,
    last12MonthsEarnings: "Last 12 months' gross earnings (AZN)",
    year: "Year",
    month: "Month",
    amount: "Amount (AZN)",
    total: "Total",
    vacationPay: "Vacation pay",
    days: "days",
    calcProcedure: "Calculation procedure",
    stepByStep: "step by step",
    step1Title: "Total earnings for last 12 months",
    step1Total: "Total:",
    step2Title: "Average monthly salary",
    step2Months: "months",
    step3Title: "Average daily salary",
    step3Note: "30.4 — legally established average monthly day count",
    step4Title: "Vacation pay",
    summaryTitle: "Summary",
    summary12Month: "12-month earnings",
    summaryAvgMonthly: "Avg. monthly",
    summaryAvgDaily: "Avg. daily",
    summaryVacation: "Vacation",
    comparisonTitle: "Comparison",
    comparisonDiff: (amount: string) => `Difference: ${amount} AZN (14 days)`,
    emptyState: "Enter monthly earnings to see the result.",
  },
  ru: {
    title: "Калькулятор отпускных учителя",
    description: "Рассчитайте отпускные учителя на основе заработка за последние 12 месяцев (56 или 42 дня).",
    breadcrumbCategory: "Трудовое право",
    breadcrumbLabel: "Отпускные учителя",
    formulaTitle: "Как рассчитываются отпускные учителя?",
    formulaContent: `Порядок расчёта:
1. Суммируется общий заработок за последние 12 месяцев
2. Средняя месячная зарплата = Итого ÷ 12
3. Средняя дневная зарплата = Средняя месячная ÷ 30,4
4. Отпускные = Средняя дневная × количество дней

Продолжительность отпуска учителей:
• 56 календарных дней — основной отпуск
• 42 календарных дня — в некоторых случаях

Пример (итого за 12 месяцев: 15 065₼):
Средняя месячная: 15 065 ÷ 12 = 1 255,42₼
Средняя дневная: 1 255,42 ÷ 30,4 = 41,30₼
Отпуск 56 дней: 41,30 × 56 = 2 312,81₼
Отпуск 42 дня: 41,30 × 42 = 1 734,60₼`,
    vacationDuration: "Продолжительность отпуска",
    days56: "56 дней",
    mainVacation: "Основной отпуск",
    days42: "42 дня",
    shortenedVacation: "Сокращённый отпуск",
    vacationStartMonth: "Месяц начала отпуска",
    vacationStartDate: "Дата начала отпуска",
    payableTitle: "Отпускные к выплате",
    methodBWins: "Новый метод (сохранённая зарплата) выше — выплачивается он",
    methodAWins: "Метод средней зарплаты выше — выплачивается он",
    methodALabel: "Метод A — Средняя зарплата",
    methodADesc: "Среднее за 12 мес. ÷ 30,4 × дни",
    methodBLabel: "Метод B — Сохранённая зарплата",
    methodBDesc: "Последняя зарплата: полный месяц + рабочие дни остатка",
    lastSalaryLabel: "Последняя зарплата",
    dailyWageLabel: "Дневная",
    fullMonth: "полный месяц",
    partialMonth: "неполный месяц",
    workdays: "раб. дней",
    workdaysNote: "Рабочие дни считаются за вычетом только выходных (сб/вс); госпраздники не учитываются.",
    autoCalcNote: "Последние 12 месяцев перед отпуском будут рассчитаны автоматически",
    entryModeLabel: "Способ ввода зарплаты",
    sameSalary: "Все месяцы одинаковы",
    sameSalaryDesc: "Введите один раз для 12 месяцев",
    differentSalary: "Месяцы различаются",
    differentSalaryDesc: "Вводите каждый месяц отдельно",
    monthlySalaryLabel: "Месячная зарплата брутто (AZN)",
    monthlySalaryHint: "Сумма брутто (до налогов). Применяется ко всем 12 месяцам ниже",
    monthsExcludeNote: (vac: string) => `Месяц отпуска (${vac}) исключается — берутся 12 месяцев до него:`,
    last12MonthsEarnings: "Брутто заработок за последние 12 месяцев (AZN)",
    year: "Год",
    month: "Месяц",
    amount: "Сумма (AZN)",
    total: "Итого",
    vacationPay: "Отпускные",
    days: "дней",
    calcProcedure: "Порядок расчёта",
    stepByStep: "пошагово",
    step1Title: "Общий заработок за 12 месяцев",
    step1Total: "Итого:",
    step2Title: "Средняя месячная зарплата",
    step2Months: "мес.",
    step3Title: "Средняя дневная зарплата",
    step3Note: "30,4 — установленное законом среднее количество дней в месяце",
    step4Title: "Отпускные",
    summaryTitle: "Итоги",
    summary12Month: "Заработок за 12 мес.",
    summaryAvgMonthly: "Средняя мес.",
    summaryAvgDaily: "Средняя днев.",
    summaryVacation: "Отпуск",
    comparisonTitle: "Сравнение",
    comparisonDiff: (amount: string) => `Разница: ${amount} AZN (14 дней)`,
    emptyState: "Введите ежемесячные заработки, чтобы увидеть результат.",
  },
};

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// İki tarix arasında (daxil olmaqla) iş günlərinin sayı — yalnız həftə sonları (şənbə/bazar) çıxılır
function countWorkdays(start: Date, end: Date): number {
  let c = 0;
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (d <= end) {
    const w = d.getDay(); // 0 = bazar, 6 = şənbə
    if (w !== 0 && w !== 6) c++;
    d.setDate(d.getDate() + 1);
  }
  return c;
}


function getLast12Months(startYear: number, startMonth: number): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < 12; i++) {
    m--;
    if (m < 0) { m = 11; y--; }
    months.unshift({ year: y, month: m });
  }
  return months;
}

export default function TeacherVacationCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const MONTHS_AZ = MONTHS_TRANSLATIONS[lang];

  const [vacationDays, setVacationDays] = useState<56 | 42>(56);

  // Məzuniyyətin başlandığı tarix (default: 1 iyul 2026)
  const [vacYear, setVacYear] = useState(2026);
  const [vacMonth, setVacMonth] = useState(6); // 0-indexed, 6 = İyul
  const [vacDay, setVacDay] = useState(1);

  // Son 12 ay
  const last12 = useMemo(() => getLast12Months(vacYear, vacMonth), [vacYear, vacMonth]);

  // Maaş daxiletmə üsulu: bütün aylar eyni (uniform) və ya fərqli (individual)
  const [entryMode, setEntryMode] = useState<"uniform" | "individual">("uniform");
  const [uniformAmount, setUniformAmount] = useState("");

  // Hər ay üçün məbləğ (fərqli rejim üçün)
  const [monthAmounts, setMonthAmounts] = useState<Record<string, string>>({});

  const setMonthAmount = (key: string, value: string) => {
    setMonthAmounts(prev => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    // Aylıq məbləğləri topla
    let totalEarnings = 0;
    const monthDetails: { label: string; amount: number }[] = [];

    for (const m of last12) {
      const val =
        entryMode === "uniform"
          ? parseFloat(uniformAmount || "0") || 0
          : parseFloat(monthAmounts[`${m.year}-${m.month}`] || "0") || 0;
      totalEarnings += val;
      monthDetails.push({
        label: `${MONTHS_AZ[m.month]} ${m.year}`,
        amount: val,
      });
    }

    if (totalEarnings <= 0) return null;

    // ── Üsul A: orta əmək haqqı (son 12 ay) ──
    const avgMonthly = round2(totalEarnings / 12);
    const avgDaily = round2(avgMonthly / DAILY_DIVISOR);
    const vacationPay = round2(avgDaily * vacationDays);

    // ── Üsul B: saxlanılan (sonuncu) əmək haqqı ──
    // Sonuncu maaş = məzuniyyətdən əvvəlki ay (cədvəldə ən son ay) və ya uniform məbləğ
    const lastSalary =
      entryMode === "uniform"
        ? parseFloat(uniformAmount || "0") || 0
        : parseFloat(monthAmounts[`${last12[11].year}-${last12[11].month}`] || "0") || 0;

    let methodB = 0;
    const methodBSteps: { label: string; full: boolean; workdays?: number; monthWorkdays?: number; amount: number }[] = [];
    // Üsul B yalnız aylar fərqli olduqda mənalıdır (bütün aylar eyni olanda baza eynidir)
    if (lastSalary > 0 && entryMode === "individual") {
      const start = new Date(vacYear, vacMonth, vacDay);
      const end = new Date(vacYear, vacMonth, vacDay);
      end.setDate(end.getDate() + vacationDays - 1);

      const cur = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cur <= end) {
        const y = cur.getFullYear();
        const mo = cur.getMonth();
        const dim = daysInMonth(y, mo);
        const firstOfMonth = new Date(y, mo, 1);
        const lastOfMonth = new Date(y, mo, dim);
        const mStart = firstOfMonth < start ? start : firstOfMonth;
        const mEnd = lastOfMonth > end ? end : lastOfMonth;
        const isFull = mStart.getDate() === 1 && mEnd.getDate() === dim;
        if (isFull) {
          // Tam ay → sonuncu maaş bütöv
          methodB += lastSalary;
          methodBSteps.push({ label: `${MONTHS_AZ[mo]} ${y}`, full: true, amount: round2(lastSalary) });
        } else {
          // Natamam ay → sonuncu maaş ÷ HƏMİN ayın iş günləri × məzuniyyət iş günləri
          const monthWd = countWorkdays(firstOfMonth, lastOfMonth);
          const wd = countWorkdays(mStart, mEnd);
          const amt = monthWd > 0 ? (lastSalary / monthWd) * wd : 0;
          methodB += amt;
          methodBSteps.push({ label: `${MONTHS_AZ[mo]} ${y}`, full: false, workdays: wd, monthWorkdays: monthWd, amount: round2(amt) });
        }
        cur.setMonth(cur.getMonth() + 1);
      }
      methodB = round2(methodB);
    }

    const payable = Math.max(vacationPay, methodB);

    return {
      totalEarnings,
      avgMonthly,
      avgDaily,
      vacationPay,
      vacationDays,
      monthDetails,
      lastSalary,
      methodB,
      methodBSteps,
      payable,
      methodBHigher: methodB > vacationPay,
    };
  }, [monthAmounts, last12, vacationDays, MONTHS_AZ, entryMode, uniformAmount, vacYear, vacMonth, vacDay]);

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right";

  // Məzuniyyət ayının etiketi (istifadəçiyə hansı ayın çıxarıldığını göstərmək üçün)
  const vacMonthLabel = `${MONTHS_AZ[vacMonth]} ${vacYear}`;

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
      relatedIds={["teacher-salary", "salary", "vacation-pay", "sick-leave"]}
    >
      {/* Məzuniyyət müddəti */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.vacationDuration}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setVacationDays(56)}
            className={`p-3 rounded-xl border text-center transition-all ${
              vacationDays === 56
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-lg font-bold text-foreground">{pt.days56}</p>
            <p className="text-xs text-muted">{pt.mainVacation}</p>
          </button>
          <button
            onClick={() => setVacationDays(42)}
            className={`p-3 rounded-xl border text-center transition-all ${
              vacationDays === 42
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-lg font-bold text-foreground">{pt.days42}</p>
            <p className="text-xs text-muted">{pt.shortenedVacation}</p>
          </button>
        </div>
      </div>

      {/* Məzuniyyət başlanğıc ayı */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.vacationStartDate}</label>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={vacDay}
            onChange={(e) => setVacDay(parseInt(e.target.value))}
            className="px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            {Array.from({ length: daysInMonth(vacYear, vacMonth) }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={vacMonth}
            onChange={(e) => setVacMonth(parseInt(e.target.value))}
            className="px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            {MONTHS_AZ.map((name, i) => (
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

      {/* Maaş daxiletmə üsulu */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.entryModeLabel}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setEntryMode("uniform")}
            className={`p-3 rounded-xl border text-center transition-all ${
              entryMode === "uniform"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{pt.sameSalary}</p>
            <p className="text-xs text-muted">{pt.sameSalaryDesc}</p>
          </button>
          <button
            onClick={() => setEntryMode("individual")}
            className={`p-3 rounded-xl border text-center transition-all ${
              entryMode === "individual"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{pt.differentSalary}</p>
            <p className="text-xs text-muted">{pt.differentSalaryDesc}</p>
          </button>
        </div>
      </div>

      {/* Hansı ayların götürüldüyü barədə qeyd */}
      <p className="text-xs text-muted mb-3">
        {pt.monthsExcludeNote(vacMonthLabel)}{" "}
        <span className="font-medium text-foreground">
          {MONTHS_AZ[last12[0].month]} {last12[0].year} – {MONTHS_AZ[last12[last12.length - 1].month]} {last12[last12.length - 1].year}
        </span>
      </p>

      {/* Uniform rejim — tək məbləğ */}
      {entryMode === "uniform" ? (
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">{pt.monthlySalaryLabel}</label>
          <input
            type="number"
            value={uniformAmount}
            onChange={(e) => setUniformAmount(e.target.value)}
            placeholder="1255"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <p className="text-xs text-muted mt-1">{pt.monthlySalaryHint}</p>
          <div className="mt-3 bg-gray-50 rounded-lg border border-border px-4 py-2.5 flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">{pt.total} (×12)</span>
            <span className="text-sm font-bold text-primary">
              {fmt((parseFloat(uniformAmount || "0") || 0) * 12)} ₼
            </span>
          </div>
        </div>
      ) : (
        /* Fərqli rejim — 12 ay cədvəli */
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">{pt.last12MonthsEarnings}</label>
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
                    <span className="text-sm text-foreground font-medium">{MONTHS_AZ[m.month]}</span>
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
            {/* Cəmi */}
            <div className="bg-gray-50 px-4 py-2.5 border-t border-border grid grid-cols-3 items-center">
              <span className="col-span-2 text-sm font-semibold text-foreground">{pt.total}</span>
              <span className="text-sm font-bold text-primary text-right">
                {fmt(last12.reduce((s, m) => s + (parseFloat(monthAmounts[`${m.year}-${m.month}`] || "0") || 0), 0))} ₼
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas nəticə — ödəniləcək (iki üsuldan yüksək olan) */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.payableTitle} ({result.vacationDays} {pt.days})</p>
            <p className="text-4xl font-bold">{fmt(result.payable)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
            {result.methodB > 0 && (
              <p className="text-xs text-blue-100 mt-2">
                {result.methodBHigher ? pt.methodBWins : pt.methodAWins}
              </p>
            )}
          </div>

          {/* İki üsulun müqayisəsi */}
          {result.methodB > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`rounded-xl border p-4 ${!result.methodBHigher ? "border-primary bg-primary-light ring-1 ring-primary" : "border-border bg-white"}`}>
                <p className="text-xs text-muted mb-1">{pt.methodALabel}</p>
                <p className="text-xl font-bold text-foreground">{fmt(result.vacationPay)} ₼</p>
                <p className="text-[11px] text-muted mt-1">{pt.methodADesc}</p>
              </div>
              <div className={`rounded-xl border p-4 ${result.methodBHigher ? "border-primary bg-primary-light ring-1 ring-primary" : "border-border bg-white"}`}>
                <p className="text-xs text-muted mb-1">{pt.methodBLabel}</p>
                <p className="text-xl font-bold text-foreground">{fmt(result.methodB)} ₼</p>
                <p className="text-[11px] text-muted mt-1">{pt.methodBDesc}</p>
              </div>
            </div>
          )}

          {/* Üsul B — addım-addım */}
          {result.methodB > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>🗓️</span>{pt.methodBLabel}
                </h3>
              </div>
              <div className="px-5 py-4 space-y-2">
                <p className="text-xs text-muted">
                  {pt.lastSalaryLabel}: <span className="font-medium text-foreground">{fmt(result.lastSalary)} ₼</span>
                </p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                  {result.methodBSteps.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs gap-3">
                      <span className="text-muted">
                        {s.label} — {s.full
                          ? pt.fullMonth
                          : `${pt.partialMonth}: ${fmt(result.lastSalary)} ÷ ${s.monthWorkdays} × ${s.workdays} ${pt.workdays}`}
                      </span>
                      <span className="font-medium text-foreground whitespace-nowrap">{fmt(s.amount)} ₼</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-1.5 flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{pt.total}</span>
                    <span className="text-primary">{fmt(result.methodB)} ₼</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted">{pt.workdaysNote}</p>
              </div>
            </div>
          )}

          {/* Addım-addım hesablama (Üsul A) */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span>
                  {pt.calcProcedure}
                </h3>
                <span className="text-xs text-muted bg-white px-2 py-0.5 rounded-full border border-border">{pt.stepByStep}</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {/* Addım 1 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-medium text-foreground">{pt.step1Title}</span>
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
                    <p className="text-xs font-medium text-foreground">{pt.step1Total} <span className="font-bold text-primary">{fmt(result.totalEarnings)} AZN</span></p>
                  </div>
                </div>
              </div>

              {/* Addım 2 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-medium text-foreground">{pt.step2Title}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.totalEarnings)} ÷ 12 {pt.step2Months} = <span className="font-bold text-primary">{fmt(result.avgMonthly)} AZN</span>
                  </p>
                </div>
              </div>

              {/* Addım 3 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-sm font-medium text-foreground">{pt.step3Title}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.avgMonthly)} ÷ 30,4 = <span className="font-bold text-primary">{fmt(result.avgDaily)} AZN</span>
                  </p>
                  <p className="text-[11px] text-muted mt-1">{pt.step3Note}</p>
                </div>
              </div>

              {/* Addım 4 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <span className="text-sm font-medium text-foreground">{pt.step4Title}</span>
                </div>
                <div className="ml-8 bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-foreground">
                    {fmt(result.avgDaily)} × {result.vacationDays} {pt.days} = <span className="font-bold text-lg text-green-700">{fmt(result.vacationPay)} AZN</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Xülasə */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📊</span>
              {pt.summaryTitle}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.summary12Month}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.totalEarnings)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.summaryAvgMonthly}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.avgMonthly)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.summaryAvgDaily}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.avgDaily)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.summaryVacation} ({result.vacationDays} {pt.days})</p>
                <p className="text-lg font-bold text-primary">{fmt(result.vacationPay)}₼</p>
              </div>
            </div>
          </div>

          {/* Müqayisə */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <p className="text-sm font-medium text-foreground mb-2">{pt.comparisonTitle}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${vacationDays === 56 ? "bg-white border-2 border-primary" : "bg-white border border-amber-200"}`}>
                <p className="text-xs text-muted">{pt.days56}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.avgDaily * 56)} ₼</p>
              </div>
              <div className={`p-3 rounded-lg ${vacationDays === 42 ? "bg-white border-2 border-primary" : "bg-white border border-amber-200"}`}>
                <p className="text-xs text-muted">{pt.days42}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.avgDaily * 42)} ₼</p>
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-2">{pt.comparisonDiff(fmt(result.avgDaily * 14))}</p>
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
