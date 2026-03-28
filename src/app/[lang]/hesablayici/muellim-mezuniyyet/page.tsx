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
    autoCalcNote: "Məzuniyyətdən əvvəlki son 12 ay avtomatik hesablanacaq",
    last12MonthsEarnings: "Son 12 aylıq qazanc (AZN)",
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
    autoCalcNote: "The last 12 months before vacation will be calculated automatically",
    last12MonthsEarnings: "Last 12 months' earnings (AZN)",
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
    autoCalcNote: "Последние 12 месяцев перед отпуском будут рассчитаны автоматически",
    last12MonthsEarnings: "Заработок за последние 12 месяцев (AZN)",
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

  // Məzuniyyətin başlandığı ay (default: iyul 2025)
  const [vacYear, setVacYear] = useState(2025);
  const [vacMonth, setVacMonth] = useState(6); // 0-indexed, 6 = İyul

  // Son 12 ay
  const last12 = useMemo(() => getLast12Months(vacYear, vacMonth), [vacYear, vacMonth]);

  // Hər ay üçün məbləğ
  const [monthAmounts, setMonthAmounts] = useState<Record<string, string>>({});

  const setMonthAmount = (key: string, value: string) => {
    setMonthAmounts(prev => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    // Aylıq məbləğləri topla
    let totalEarnings = 0;
    const monthDetails: { label: string; amount: number }[] = [];

    for (const m of last12) {
      const key = `${m.year}-${m.month}`;
      const val = parseFloat(monthAmounts[key] || "0") || 0;
      totalEarnings += val;
      monthDetails.push({
        label: `${MONTHS_AZ[m.month]} ${m.year}`,
        amount: val,
      });
    }

    if (totalEarnings <= 0) return null;

    const avgMonthly = totalEarnings / 12;
    const avgDaily = avgMonthly / DAILY_DIVISOR;
    const vacationPay = avgDaily * vacationDays;

    return {
      totalEarnings,
      avgMonthly,
      avgDaily,
      vacationPay,
      vacationDays,
      monthDetails,
    };
  }, [monthAmounts, last12, vacationDays, MONTHS_AZ]);

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right";

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
        <label className="block text-sm font-medium text-foreground mb-2">{pt.vacationStartMonth}</label>
        <div className="grid grid-cols-2 gap-3">
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

      {/* Son 12 ay cədvəli */}
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

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas nəticə */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.vacationPay} ({result.vacationDays} {pt.days})</p>
            <p className="text-4xl font-bold">{fmt(result.vacationPay)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          {/* Addım-addım hesablama */}
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
