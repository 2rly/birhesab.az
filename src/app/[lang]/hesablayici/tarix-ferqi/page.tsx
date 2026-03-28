"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type Mode = "difference" | "add-subtract";

const AZ_WEEKDAYS_MAP: Record<Lang, string[]> = {
  az: ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
};

const AZ_MONTHS_MAP: Record<Lang, string[]> = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

const pageTranslations = {
  az: {
    title: "Tarix fərqi hesablayıcısı",
    description: "İki tarix arasında fərqi hesablayın və ya tarixə gün əlavə edin / çıxın.",
    breadcrumbCategory: "Gündəlik",
    breadcrumbLabel: "Tarix fərqi hesablayıcısı",
    formulaTitle: "Tarix fərqi necə hesablanır?",
    formulaContent: `İki tarix arasında fərq millisaniyələr hesablanır və sonra günlərə, həftələrə, aylara çevrilir.

Fərq = Son tarix - Başlanğıc tarix

Nəticələr:
- Dəqiq yaş formatı: X il, Y ay, Z gün
- Ümumi günlər, həftələr, saatlar
- Aylıq fərq

Gün əlavə etmək / çıxmaq:
Tarixə müəyyən sayılı gün əlavə edilə və ya çıxıla bilər.
Məsələn: 1 Yanvar 2024 + 90 gün = 31 Mart 2024`,
    modeDifference: "Tarix fərqi",
    modeAddSubtract: "Gün əlavə et / çıx",
    startDate: "Başlanğıc tarixi",
    endDate: "Son tarix",
    operation: "Əməliyyat",
    addDays: "+ Əlavə et",
    subtractDays: "- Çıx",
    dayCount: "Gün sayı",
    differenceBetween: "Tarixlər arasındakı fərq",
    year: "il",
    month: "ay",
    day: "gün",
    totalDays: "Ümumi gün",
    totalWeeks: "Ümumi həftə",
    totalMonths: "Ümumi ay",
    totalHours: "Ümumi saat",
    detailedInfo: "Ətraflı məlumat",
    start: "Başlanğıc",
    end: "Son",
    exactDifference: "Dəqiq fərq",
    inDays: "Günlərlə",
    inHours: "Saatlarla",
    inMinutes: "Dəqiqələrlə",
    minuteAbbr: "dəq.",
    daysAfter: "gün sonra",
    daysBefore: "gün əvvəl",
    emptyState: "Nəticəni görmək üçün tarixləri daxil edin.",
  },
  en: {
    title: "Date Difference Calculator",
    description: "Calculate the difference between two dates or add/subtract days from a date.",
    breadcrumbCategory: "Daily",
    breadcrumbLabel: "Date difference calculator",
    formulaTitle: "How is date difference calculated?",
    formulaContent: `The difference between two dates is calculated in milliseconds, then converted to days, weeks, and months.

Difference = End date - Start date

Results:
- Exact format: X years, Y months, Z days
- Total days, weeks, hours
- Monthly difference

Adding / subtracting days:
A specific number of days can be added to or subtracted from a date.
Example: January 1, 2024 + 90 days = March 31, 2024`,
    modeDifference: "Date difference",
    modeAddSubtract: "Add / subtract days",
    startDate: "Start date",
    endDate: "End date",
    operation: "Operation",
    addDays: "+ Add",
    subtractDays: "- Subtract",
    dayCount: "Number of days",
    differenceBetween: "Difference between dates",
    year: "year",
    month: "month",
    day: "day",
    totalDays: "Total days",
    totalWeeks: "Total weeks",
    totalMonths: "Total months",
    totalHours: "Total hours",
    detailedInfo: "Detailed information",
    start: "Start",
    end: "End",
    exactDifference: "Exact difference",
    inDays: "In days",
    inHours: "In hours",
    inMinutes: "In minutes",
    minuteAbbr: "min.",
    daysAfter: "days later",
    daysBefore: "days earlier",
    emptyState: "Enter dates to see the result.",
  },
  ru: {
    title: "Калькулятор разницы дат",
    description: "Рассчитайте разницу между двумя датами или добавьте/вычтите дни из даты.",
    breadcrumbCategory: "Повседневное",
    breadcrumbLabel: "Калькулятор разницы дат",
    formulaTitle: "Как рассчитывается разница дат?",
    formulaContent: `Разница между двумя датами вычисляется в миллисекундах, затем переводится в дни, недели и месяцы.

Разница = Конечная дата - Начальная дата

Результаты:
- Точный формат: X лет, Y месяцев, Z дней
- Общее количество дней, недель, часов
- Разница в месяцах

Добавление / вычитание дней:
К дате можно добавить или вычесть определённое количество дней.
Пример: 1 января 2024 + 90 дней = 31 марта 2024`,
    modeDifference: "Разница дат",
    modeAddSubtract: "Добавить / вычесть дни",
    startDate: "Начальная дата",
    endDate: "Конечная дата",
    operation: "Операция",
    addDays: "+ Добавить",
    subtractDays: "- Вычесть",
    dayCount: "Количество дней",
    differenceBetween: "Разница между датами",
    year: "г.",
    month: "мес.",
    day: "дн.",
    totalDays: "Всего дней",
    totalWeeks: "Всего недель",
    totalMonths: "Всего месяцев",
    totalHours: "Всего часов",
    detailedInfo: "Подробная информация",
    start: "Начало",
    end: "Конец",
    exactDifference: "Точная разница",
    inDays: "В днях",
    inHours: "В часах",
    inMinutes: "В минутах",
    minuteAbbr: "мин.",
    daysAfter: "дней позже",
    daysBefore: "дней раньше",
    emptyState: "Введите даты, чтобы увидеть результат.",
  },
};

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

export default function DateDifferenceCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const weekdays = AZ_WEEKDAYS_MAP[lang];
  const months = AZ_MONTHS_MAP[lang];

  function formatDateLang(date: Date): string {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${weekdays[date.getDay()]}`;
  }

  const [mode, setMode] = useState<Mode>("difference");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  const result = useMemo(() => {
    if (mode === "difference") {
      if (!date1 || !date2) return null;
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

      const start = d1 < d2 ? d1 : d2;
      const end = d1 < d2 ? d2 : d1;

      const diffMs = end.getTime() - start.getTime();
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();

      let years = end.getFullYear() - start.getFullYear();
      let mos = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();

      if (days < 0) {
        mos--;
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (mos < 0) {
        years--;
        mos += 12;
      }

      return {
        type: "difference" as const,
        startDate: formatDateLang(start),
        endDate: formatDateLang(end),
        years,
        months: mos,
        days,
        totalDays,
        totalWeeks,
        remainingDays,
        totalHours,
        totalMinutes,
        totalMonths,
      };
    }

    if (mode === "add-subtract") {
      if (!baseDate || !daysToAdd) return null;
      const base = new Date(baseDate);
      const numDays = parseInt(daysToAdd);
      if (isNaN(base.getTime()) || isNaN(numDays) || numDays < 0) return null;

      const resultDate = new Date(base);
      if (operation === "add") {
        resultDate.setDate(resultDate.getDate() + numDays);
      } else {
        resultDate.setDate(resultDate.getDate() - numDays);
      }

      return {
        type: "add-subtract" as const,
        baseDate: formatDateLang(base),
        resultDate: formatDateLang(resultDate),
        numDays,
        operation,
        resultDateObj: resultDate,
      };
    }

    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, date1, date2, baseDate, daysToAdd, operation, lang]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=daily" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["age", "timezone", "pregnancy", "date-difference"]}
    >
      {/* Mode Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setMode("difference")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "difference" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.modeDifference}
        </button>
        <button
          onClick={() => setMode("add-subtract")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "add-subtract" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.modeAddSubtract}
        </button>
      </div>

      {/* Inputs */}
      <div className="mb-8">
        {mode === "difference" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{pt.startDate}</label>
              <input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{pt.endDate}</label>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{pt.startDate}</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{pt.operation}</label>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setOperation("add")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      operation === "add" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
                    }`}
                  >
                    {pt.addDays}
                  </button>
                  <button
                    onClick={() => setOperation("subtract")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      operation === "subtract" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
                    }`}
                  >
                    {pt.subtractDays}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{pt.dayCount}</label>
                <input
                  type="number"
                  value={daysToAdd}
                  onChange={(e) => setDaysToAdd(e.target.value)}
                  placeholder="30"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {result.type === "difference" && (
            <>
              {/* Main Result */}
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-2">{pt.differenceBetween}</p>
                <p className="text-3xl font-bold">
                  {result.years > 0 && `${result.years} ${pt.year}, `}{result.months > 0 && `${result.months} ${pt.month}, `}{result.days} {pt.day}
                </p>
                <p className="text-sm text-blue-200 mt-2">{result.startDate} — {result.endDate}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">{pt.totalDays}</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalDays)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">{pt.totalWeeks}</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalWeeks)}</p>
                  {result.remainingDays > 0 && <p className="text-xs text-muted">+ {result.remainingDays} {pt.day}</p>}
                </div>
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">{pt.totalMonths}</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalMonths)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">{pt.totalHours}</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalHours)}</p>
                </div>
              </div>

              {/* Details Table */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">{pt.detailedInfo}</h3>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.start}</span>
                    <span className="text-sm font-medium text-foreground">{result.startDate}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.end}</span>
                    <span className="text-sm font-medium text-foreground">{result.endDate}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.exactDifference}</span>
                    <span className="text-sm font-medium text-foreground">{result.years} {pt.year}, {result.months} {pt.month}, {result.days} {pt.day}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.inDays}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.totalDays)} {pt.day}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.inHours}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.totalHours)} {lang === "az" ? "saat" : lang === "en" ? "hours" : "часов"}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.inMinutes}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.totalMinutes)} {pt.minuteAbbr}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {result.type === "add-subtract" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">{pt.startDate}</p>
                  <p className="text-lg font-bold text-foreground">{result.baseDate}</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">
                    {result.operation === "add" ? `+${result.numDays} ${pt.daysAfter}` : `-${result.numDays} ${pt.daysBefore}`}
                  </p>
                  <p className="text-lg font-bold">{result.resultDate}</p>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📆</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
