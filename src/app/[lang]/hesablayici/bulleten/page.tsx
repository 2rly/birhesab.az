"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// ============================================================
// Bülleten (xəstəlik vərəqi) pulu hesablayıcısı
// Azərbaycan Respublikası əmək qanunvericiliyi
// ============================================================

// Azərbaycanda rəsmi iş günləri olmayan günlər (2024-2025)
// Bayram və istirahət günləri: şənbə, bazar + rəsmi bayramlar
const PUBLIC_HOLIDAYS_2024 = [
  "2024-01-01", "2024-01-02", // Yeni il
  "2024-01-20", // 20 Yanvar
  "2024-03-08", // Qadınlar günü
  "2024-03-20", "2024-03-21", "2024-03-22", "2024-03-23", "2024-03-24", // Novruz
  "2024-04-10", "2024-04-11", // Ramazan bayramı (təxmini)
  "2024-05-09", // Faşizm üzərində qələbə
  "2024-05-28", // Respublika günü
  "2024-06-15", // Milli qurtuluş günü
  "2024-06-16", "2024-06-17", // Qurban bayramı (təxmini)
  "2024-06-26", // Silahlı qüvvələr günü
  "2024-11-09", // Bayraq günü
  "2024-11-12", // Konstitusiya günü
  "2024-11-17", // Milli dirçəliş günü
  "2024-12-31", // Dünya azərbaycanlıların həmrəylik günü
];

const PUBLIC_HOLIDAYS_2025 = [
  "2025-01-01", "2025-01-02", // Yeni il
  "2025-01-20", // 20 Yanvar
  "2025-03-08", // Qadınlar günü
  "2025-03-20", "2025-03-21", "2025-03-22", "2025-03-23", "2025-03-24", // Novruz
  "2025-03-30", "2025-03-31", // Ramazan bayramı (təxmini)
  "2025-05-09", // Faşizm üzərində qələbə
  "2025-05-28", // Respublika günü
  "2025-06-06", "2025-06-07", // Qurban bayramı (təxmini)
  "2025-06-15", // Milli qurtuluş günü
  "2025-06-26", // Silahlı qüvvələr günü
  "2025-11-09", // Bayraq günü
  "2025-11-12", // Konstitusiya günü
  "2025-11-17", // Milli dirçəliş günü
  "2025-12-31", // Dünya azərbaycanlıların həmrəylik günü
];

const ALL_HOLIDAYS = new Set([...PUBLIC_HOLIDAYS_2024, ...PUBLIC_HOLIDAYS_2025]);

function isWorkDay(date: Date): boolean {
  const day = date.getDay(); // 0=Sunday, 6=Saturday
  if (day === 0 || day === 6) return false;
  const dateStr = date.toISOString().slice(0, 10);
  if (ALL_HOLIDAYS.has(dateStr)) return false;
  return true;
}

function countWorkDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    if (isWorkDay(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pageTranslations = {
  az: {
    title: "Bülleten (xəstəlik vərəqi) hesablayıcısı",
    description: "Xəstəlik vərəqi müddəti və son 12 aylıq qazancınıza əsasən bülleten pulunuzu hesablayın.",
    breadcrumbCategory: "Əmək Hüququ",
    breadcrumbTitle: "Bülleten hesablayıcısı",
    formulaTitle: "Bülleten pulu necə hesablanır?",
    formulaContent: `Bülleten (xəstəlik vərəqi) pulu aşağıdakı qaydada hesablanır:

1. Xəstəlik vərəqinin tarixi müəyyən edilir
2. Bu tarixlərdəki iş günləri sayılır (şənbə, bazar və bayram günləri çıxılır)
3. Xəstəlik başlanğıcından əvvəlki son 12 aydakı iş günləri hesablanır
4. Son 12 aydakı ümumi qazanc həmin iş günlərinə bölünür
5. Bir günlük qazanc × xəstəlik iş günləri = bülleten pulu

Nümunə:
Xəstəlik tarixi: 24.02.2025 – 29.02.2025 (4 iş günü)
Son 12 ay: fevral 2024 – yanvar 2025 (241 iş günü)
Ümumi qazanc: 20 500 AZN
Bir iş gününə düşən: 20 500 ÷ 241 = 85,06 AZN
Bülleten pulu: 85,06 × 4 = 340,24 AZN`,
    sickStartDate: "Xəstəlik başlanğıc tarixi",
    sickEndDate: "Xəstəlik bitmə tarixi",
    totalEarningsLabel: "Son 12 aydakı ümumi qazanc (AZN)",
    totalEarningsHint: "Xəstəlik başlanğıcından əvvəlki 12 ay ərzindəki ümumi əmək haqqı",
    sickLeavePayment: "Bülleten pulu",
    calculationMethod: "Hesablama qaydası",
    stepByStep: "addım-addım",
    step1Title: "Xəstəlik müddəti",
    dateLabel: "Tarix:",
    calendarDays: "Təqvim günləri:",
    workDays: "İş günləri:",
    days: "gün",
    weekendsExcluded: "(şənbə, bazar və bayram günləri çıxılıb)",
    step2Title: "Son 12 aydakı iş günləri",
    periodLabel: "Dövr:",
    workDayCount: "İş günlərinin sayı:",
    step3Title: "Bir iş gününə düşən qazanc",
    perDay: "AZN/gün",
    step4Title: "Bülleten pulu",
    sickDaysTitle: "Xəstəlik günləri",
    workDayLegend: "İş günü",
    restDayLegend: "İstirahət / bayram",
    summary: "Xülasə",
    sickDayLabel: "Xəstəlik günü",
    dailyEarning: "Günlük qazanc",
    yearlyEarning: "12 aylıq qazanc",
    emptyStateText: "Nəticəni görmək üçün xəstəlik tarixlərini və qazancınızı daxil edin.",
  },
  en: {
    title: "Sick leave calculator",
    description: "Calculate your sick leave payment based on the sick leave period and your earnings over the last 12 months.",
    breadcrumbCategory: "Labor Law",
    breadcrumbTitle: "Sick leave calculator",
    formulaTitle: "How is sick leave payment calculated?",
    formulaContent: `Sick leave payment is calculated as follows:

1. The sick leave dates are determined
2. Working days within those dates are counted (weekends and holidays are excluded)
3. Working days in the 12 months before the sick leave start are calculated
4. Total earnings over the last 12 months are divided by those working days
5. Daily earnings × sick leave working days = sick leave payment

Example:
Sick leave dates: 24.02.2025 – 29.02.2025 (4 working days)
Last 12 months: February 2024 – January 2025 (241 working days)
Total earnings: 20,500 AZN
Daily earnings: 20,500 ÷ 241 = 85.06 AZN
Sick leave payment: 85.06 × 4 = 340.24 AZN`,
    sickStartDate: "Sick leave start date",
    sickEndDate: "Sick leave end date",
    totalEarningsLabel: "Total earnings over the last 12 months (AZN)",
    totalEarningsHint: "Total salary for the 12 months before the sick leave start",
    sickLeavePayment: "Sick leave payment",
    calculationMethod: "Calculation method",
    stepByStep: "step-by-step",
    step1Title: "Sick leave period",
    dateLabel: "Date:",
    calendarDays: "Calendar days:",
    workDays: "Working days:",
    days: "days",
    weekendsExcluded: "(weekends and holidays excluded)",
    step2Title: "Working days in the last 12 months",
    periodLabel: "Period:",
    workDayCount: "Number of working days:",
    step3Title: "Daily earnings",
    perDay: "AZN/day",
    step4Title: "Sick leave payment",
    sickDaysTitle: "Sick leave days",
    workDayLegend: "Working day",
    restDayLegend: "Weekend / holiday",
    summary: "Summary",
    sickDayLabel: "Sick days",
    dailyEarning: "Daily earnings",
    yearlyEarning: "12-month earnings",
    emptyStateText: "Enter the sick leave dates and your earnings to see the result.",
  },
  ru: {
    title: "Калькулятор больничного листа",
    description: "Рассчитайте больничное пособие на основе периода болезни и вашего заработка за последние 12 месяцев.",
    breadcrumbCategory: "Трудовое право",
    breadcrumbTitle: "Калькулятор больничного",
    formulaTitle: "Как рассчитывается больничное пособие?",
    formulaContent: `Больничное пособие рассчитывается следующим образом:

1. Определяются даты больничного листа
2. Подсчитываются рабочие дни в этом периоде (выходные и праздники исключаются)
3. Рассчитываются рабочие дни за 12 месяцев до начала больничного
4. Общий заработок за 12 месяцев делится на эти рабочие дни
5. Дневной заработок × рабочие дни больничного = больничное пособие

Пример:
Даты больничного: 24.02.2025 – 29.02.2025 (4 рабочих дня)
Последние 12 месяцев: февраль 2024 – январь 2025 (241 рабочий день)
Общий заработок: 20 500 AZN
Дневной заработок: 20 500 ÷ 241 = 85,06 AZN
Больничное пособие: 85,06 × 4 = 340,24 AZN`,
    sickStartDate: "Дата начала больничного",
    sickEndDate: "Дата окончания больничного",
    totalEarningsLabel: "Общий заработок за последние 12 месяцев (AZN)",
    totalEarningsHint: "Общая заработная плата за 12 месяцев до начала больничного",
    sickLeavePayment: "Больничное пособие",
    calculationMethod: "Порядок расчёта",
    stepByStep: "пошагово",
    step1Title: "Период болезни",
    dateLabel: "Дата:",
    calendarDays: "Календарные дни:",
    workDays: "Рабочие дни:",
    days: "дней",
    weekendsExcluded: "(выходные и праздники исключены)",
    step2Title: "Рабочие дни за последние 12 месяцев",
    periodLabel: "Период:",
    workDayCount: "Количество рабочих дней:",
    step3Title: "Дневной заработок",
    perDay: "AZN/день",
    step4Title: "Больничное пособие",
    sickDaysTitle: "Дни больничного",
    workDayLegend: "Рабочий день",
    restDayLegend: "Выходной / праздник",
    summary: "Итого",
    sickDayLabel: "Дни болезни",
    dailyEarning: "Дневной заработок",
    yearlyEarning: "Заработок за 12 мес.",
    emptyStateText: "Введите даты больничного и заработок, чтобы увидеть результат.",
  },
};

export default function BulletenCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [sickStartStr, setSickStartStr] = useState("");
  const [sickEndStr, setSickEndStr] = useState("");
  const [totalEarnings, setTotalEarnings] = useState("");

  const result = useMemo(() => {
    if (!sickStartStr || !sickEndStr || !totalEarnings) return null;

    const sickStart = new Date(sickStartStr);
    const sickEnd = new Date(sickEndStr);
    const earnings = parseFloat(totalEarnings);

    if (isNaN(sickStart.getTime()) || isNaN(sickEnd.getTime()) || !earnings || earnings <= 0) return null;
    if (sickEnd < sickStart) return null;

    // Xəstəlik vərəqi müddətindəki iş günləri
    const sickWorkDays = countWorkDays(sickStart, sickEnd);

    // Son 12 ay hesablanır (xəstəlik başlanğıcından 12 ay əvvəl)
    const periodEnd = new Date(sickStart);
    periodEnd.setDate(periodEnd.getDate() - 1); // xəstəlikdən bir gün əvvəl
    const periodStart = new Date(periodEnd);
    periodStart.setFullYear(periodStart.getFullYear() - 1);
    periodStart.setDate(periodStart.getDate() + 1); // 12 ay tam

    // Son 12 aydakı iş günləri
    const yearWorkDays = countWorkDays(periodStart, periodEnd);

    if (yearWorkDays <= 0) return null;

    // Bir iş gününə düşən qazanc
    const dailyEarning = earnings / yearWorkDays;

    // Bülleten pulu
    const bulletenAmount = dailyEarning * sickWorkDays;

    // Xəstəlik günlərinin siyahısı
    const sickDaysList: { date: Date; isWorkDay: boolean }[] = [];
    const current = new Date(sickStart);
    while (current <= sickEnd) {
      sickDaysList.push({ date: new Date(current), isWorkDay: isWorkDay(current) });
      current.setDate(current.getDate() + 1);
    }

    return {
      sickStart,
      sickEnd,
      sickWorkDays,
      periodStart,
      periodEnd,
      yearWorkDays,
      earnings,
      dailyEarning,
      bulletenAmount,
      totalCalendarDays: sickDaysList.length,
      sickDaysList,
    };
  }, [sickStartStr, sickEndStr, totalEarnings]);

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=labor" },
        { label: pt.breadcrumbTitle },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "overtime", "vacation-pay", "unemployment-benefit"]}
    >
      {/* Inputs */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📅 {pt.sickStartDate}
            </label>
            <input
              type="date"
              value={sickStartStr}
              onChange={(e) => setSickStartStr(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📅 {pt.sickEndDate}
            </label>
            <input
              type="date"
              value={sickEndStr}
              onChange={(e) => setSickEndStr(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 {pt.totalEarningsLabel}
          </label>
          <input
            type="number"
            value={totalEarnings}
            onChange={(e) => setTotalEarnings(e.target.value)}
            placeholder="20500"
            min="0"
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">{pt.totalEarningsHint}</p>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.sickLeavePayment}</p>
            <p className="text-4xl font-bold">{formatMoney(result.bulletenAmount)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          {/* Detailed calculation */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span>
                  {pt.calculationMethod}
                </h3>
                <span className="text-xs text-muted bg-white px-2 py-0.5 rounded-full border border-border">{pt.stepByStep}</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {/* Step 1 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-medium text-foreground">{pt.step1Title}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-muted">{pt.dateLabel} <span className="font-medium text-foreground">{formatDate(result.sickStart)} – {formatDate(result.sickEnd)}</span></p>
                  <p className="text-xs text-muted">{pt.calendarDays} <span className="font-medium text-foreground">{result.totalCalendarDays} {pt.days}</span></p>
                  <p className="text-xs text-muted">{pt.workDays} <span className="font-medium text-primary">{result.sickWorkDays} {pt.days}</span></p>
                  {result.totalCalendarDays !== result.sickWorkDays && (
                    <p className="text-[11px] text-muted">{pt.weekendsExcluded}</p>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-medium text-foreground">{pt.step2Title}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-muted">{pt.periodLabel} <span className="font-medium text-foreground">{formatDate(result.periodStart)} – {formatDate(result.periodEnd)}</span></p>
                  <p className="text-xs text-muted">{pt.workDayCount} <span className="font-medium text-primary">{result.yearWorkDays} {pt.days}</span></p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-sm font-medium text-foreground">{pt.step3Title}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {formatMoney(result.earnings)} AZN ÷ {result.yearWorkDays} {pt.days} = <span className="font-bold text-primary">{formatMoney(result.dailyEarning)} {pt.perDay}</span>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <span className="text-sm font-medium text-foreground">{pt.step4Title}</span>
                </div>
                <div className="ml-8 bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-foreground">
                    {formatMoney(result.dailyEarning)} AZN × {result.sickWorkDays} {pt.days} = <span className="font-bold text-lg text-green-700">{formatMoney(result.bulletenAmount)} AZN</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sick days table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📅</span>
                {pt.sickDaysTitle}
              </h3>
            </div>
            <div className="px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {result.sickDaysList.map((d, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      d.isWorkDay
                        ? "bg-primary-light text-primary border border-primary/20"
                        : "bg-gray-100 text-muted line-through"
                    }`}
                  >
                    {d.date.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", weekday: "short" })}
                    {d.isWorkDay ? " ✓" : ""}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-light border border-primary/20 inline-block" /> {pt.workDayLegend}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> {pt.restDayLegend}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📊</span>
              {pt.summary}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.sickDayLabel}</p>
                <p className="text-lg font-bold text-foreground">{result.sickWorkDays} {pt.days}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.dailyEarning}</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(result.dailyEarning)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.yearlyEarning}</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(result.earnings)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.sickLeavePayment}</p>
                <p className="text-lg font-bold text-primary">{formatMoney(result.bulletenAmount)}₼</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏥</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
