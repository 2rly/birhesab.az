"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";


const pageTranslations = {
  az: {
    title: "Məzuniyyət pulu hesablayıcısı",
    description: "Əmək haqqına əsasən məzuniyyət pulunu hesablayın — Azərbaycan Əmək Məcəlləsinə uyğun.",
    breadcrumbCategory: "Əmək Hüququ",
    breadcrumbLabel: "Məzuniyyət pulu hesablayıcısı",
    formulaTitle: "Məzuniyyət pulu necə hesablanır?",
    formulaContent: `Hesablama qaydası:

1. Bir günlük əmək haqqı = Aylıq əmək haqqı ÷ Həmin aydakı iş günlərinin sayı
2. Məzuniyyət haqqı = Bir günlük əmək haqqı × Məzuniyyət dövründəki iş günlərinin sayı

Misal: Əmək haqqı 600₼, Yanvar ayı iş günləri 19 gün.
İşçi 5–25 yanvar arası 21 təqvim günü məzuniyyət götürür (içində 14 iş günü).
600 ÷ 19 = 31,57₼ (bir günlük)
31,57 × 14 = 442,10₼ (məzuniyyət haqqı)

Əmək Məcəlləsi üzrə minimum məzuniyyət:
• Standart: 21 təqvim günü
• 5–10 il staj: +2 gün
• 10–15 il staj: +4 gün
• 15+ il staj: +6 gün
• Ağır əmək şəraiti: +6 gün`,
    monthlySalary: "Aylıq əmək haqqı (AZN)",
    startDate: "Məzuniyyətin başlanğıc tarixi",
    vacationDays: "Məzuniyyət günləri (təqvim)",
    day: "gün",
    workDay: "iş günü",
    monthWorkDaysLabel: "Məzuniyyətə çıxacağınız aydakı iş günlərinin sayı",
    vacationWorkDaysLabel: "Məzuniyyət dövründəki iş günlərinin sayı",
    workExperience: "İş stajı (il)",
    extraDaysNote: (days: number) => `Staja görə əlavə +${days} gün məzuniyyət hüququ var`,
    dailyRate: "Bir günlük əmək haqqı",
    perDay: "AZN / gün",
    vacationPay: "Məzuniyyət haqqı",
    calcSteps: "Hesablama addımları",
    step1: "1. Bir günlük əmək haqqı",
    step2: "2. Məzuniyyət dövründəki iş günləri",
    step3: "3. Məzuniyyət haqqı",
    multiMonthNote: "Məzuniyyət bir neçə ayı əhatə edir — hər ay üçün ayrıca hesablanır.",
    segmentLabel: "ayı üzrə",
    laborCodeTitle: "Əmək Məcəlləsi üzrə məzuniyyət minimumları",
    standard: "Standart",
    workDays: "iş günü",
    experience5_10: "5–10 il staj",
    experience10_15: "10–15 il staj",
    experience15plus: "15+ il staj",
    hardLabor: "Ağır əmək şəraiti",
    emptyState: "Nəticəni görmək üçün əmək haqqını daxil edin.",
  },
  en: {
    title: "Vacation Pay Calculator",
    description: "Calculate vacation pay based on salary — according to the Labor Code of Azerbaijan.",
    breadcrumbCategory: "Labor Law",
    breadcrumbLabel: "Vacation pay calculator",
    formulaTitle: "How is vacation pay calculated?",
    formulaContent: `Calculation rule:

1. Daily rate = Monthly salary ÷ Working days in that month
2. Vacation pay = Daily rate × Working days within the vacation period

Example: Salary 600₼, January has 19 working days.
Employee takes 21 calendar days vacation from Jan 5 to Jan 25 (14 working days inside).
600 ÷ 19 = 31.57₼ (daily rate)
31.57 × 14 = 442.10₼ (vacation pay)

Minimum vacation under the Labor Code:
• Standard: 21 calendar days
• 5–10 years of experience: +2 days
• 10–15 years of experience: +4 days
• 15+ years of experience: +6 days
• Hard labor conditions: +6 days`,
    monthlySalary: "Monthly salary (AZN)",
    startDate: "Vacation start date",
    vacationDays: "Vacation days (calendar)",
    day: "days",
    workDay: "working days",
    monthWorkDaysLabel: "Working days in the month you take vacation",
    vacationWorkDaysLabel: "Working days within the vacation period",
    workExperience: "Work experience (years)",
    extraDaysNote: (days: number) => `Extra +${days} vacation days based on experience`,
    dailyRate: "Daily rate",
    perDay: "AZN / day",
    vacationPay: "Vacation pay",
    calcSteps: "Calculation steps",
    step1: "1. Daily rate",
    step2: "2. Working days within vacation",
    step3: "3. Vacation pay",
    multiMonthNote: "Vacation spans multiple months — each month is calculated separately.",
    segmentLabel: "for",
    laborCodeTitle: "Minimum vacation under the Labor Code",
    standard: "Standard",
    workDays: "working days",
    experience5_10: "5–10 years experience",
    experience10_15: "10–15 years experience",
    experience15plus: "15+ years experience",
    hardLabor: "Hard labor conditions",
    emptyState: "Enter salary to see the result.",
  },
  ru: {
    title: "Калькулятор отпускных",
    description: "Рассчитайте отпускные на основе зарплаты — согласно Трудовому кодексу Азербайджана.",
    breadcrumbCategory: "Трудовое право",
    breadcrumbLabel: "Калькулятор отпускных",
    formulaTitle: "Как рассчитываются отпускные?",
    formulaContent: `Порядок расчёта:

1. Дневная ставка = Месячная зарплата ÷ Рабочие дни в этом месяце
2. Отпускные = Дневная ставка × Рабочие дни в период отпуска

Пример: Зарплата 600₼, в январе 19 рабочих дней.
Работник берёт отпуск с 5 по 25 января (21 календарный день, в т.ч. 14 рабочих).
600 ÷ 19 = 31,57₼ (дневная ставка)
31,57 × 14 = 442,10₼ (отпускные)

Минимальный отпуск по Трудовому кодексу:
• Стандарт: 21 календарный день
• 5–10 лет стажа: +2 дня
• 10–15 лет стажа: +4 дня
• 15+ лет стажа: +6 дней
• Тяжёлые условия труда: +6 дней`,
    monthlySalary: "Ежемесячная зарплата (AZN)",
    startDate: "Дата начала отпуска",
    vacationDays: "Дни отпуска (календарные)",
    day: "дней",
    workDay: "рабочих дней",
    monthWorkDaysLabel: "Рабочие дни в месяце, когда вы идёте в отпуск",
    vacationWorkDaysLabel: "Рабочие дни в период отпуска",
    workExperience: "Стаж работы (лет)",
    extraDaysNote: (days: number) => `Дополнительно +${days} дней отпуска по стажу`,
    dailyRate: "Дневная ставка",
    perDay: "AZN / день",
    vacationPay: "Отпускные",
    calcSteps: "Этапы расчёта",
    step1: "1. Дневная ставка",
    step2: "2. Рабочие дни в период отпуска",
    step3: "3. Отпускные",
    multiMonthNote: "Отпуск охватывает несколько месяцев — расчёт по каждому месяцу отдельно.",
    segmentLabel: "за",
    laborCodeTitle: "Минимальный отпуск по Трудовому кодексу",
    standard: "Стандарт",
    workDays: "рабочих дней",
    experience5_10: "5–10 лет стажа",
    experience10_15: "10–15 лет стажа",
    experience15plus: "15+ лет стажа",
    hardLabor: "Тяжёлые условия труда",
    emptyState: "Введите зарплату, чтобы увидеть результат.",
  },
};

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function VacationPayCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [singleSalary, setSingleSalary] = useState("");
  const [monthWorkDays, setMonthWorkDays] = useState("");
  const [vacationWorkDays, setVacationWorkDays] = useState("");
  const [vacationDays, setVacationDays] = useState("21");
  const [experience, setExperience] = useState("");

  const result = useMemo(() => {
    const monthly = parseFloat(singleSalary);
    const monthWD = parseInt(monthWorkDays);
    const vacWD = parseInt(vacationWorkDays);
    if (!monthly || monthly <= 0 || !monthWD || monthWD <= 0 || !vacWD || vacWD <= 0) return null;

    const dailyRate = monthly / monthWD;
    const totalPay = dailyRate * vacWD;

    return { monthly, monthWD, vacWD, dailyRate, totalPay, calendarDays: parseInt(vacationDays) || 0 };
  }, [singleSalary, monthWorkDays, vacationWorkDays, vacationDays]);

  const expYears = parseFloat(experience) || 0;
  const extraDays = expYears >= 15 ? 6 : expYears >= 10 ? 4 : expYears >= 5 ? 2 : 0;

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
      relatedIds={["salary", "paternity-leave", "severance-pay", "overtime"]}
    >
      <div className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.monthlySalary}
          </label>
          <input
            type="number"
            value={singleSalary}
            onChange={(e) => setSingleSalary(e.target.value)}
            placeholder="600"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {[400, 600, 1000, 1500, 2000, 3000].map((v) => (
              <button
                key={v}
                onClick={() => setSingleSalary(String(v))}
                className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {v}₼
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📊 {pt.monthWorkDaysLabel}
            </label>
            <input
              type="number"
              value={monthWorkDays}
              onChange={(e) => setMonthWorkDays(e.target.value)}
              placeholder="19"
              min="1"
              max="31"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📊 {pt.vacationWorkDaysLabel}
            </label>
            <input
              type="number"
              value={vacationWorkDays}
              onChange={(e) => setVacationWorkDays(e.target.value)}
              placeholder="14"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.vacationDays}
            </label>
            <input
              type="number"
              value={vacationDays}
              onChange={(e) => setVacationDays(e.target.value)}
              placeholder="21"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <div className="flex gap-2 mt-2">
              {[21, 30, 42, 56].map((d) => (
                <button
                  key={d}
                  onClick={() => setVacationDays(d.toString())}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                    vacationDays === d.toString()
                      ? "border-primary bg-primary-light text-primary font-medium"
                      : "border-border bg-white text-muted hover:border-primary/30"
                  }`}
                >
                  {d} {pt.day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.workExperience}
            </label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="5"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            {extraDays > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {pt.extraDaysNote(extraDays)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.dailyRate}</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.dailyRate)}</p>
              <p className="text-xs text-muted mt-1">{pt.perDay}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.vacationWorkDaysLabel}</p>
              <p className="text-2xl font-bold text-foreground">{result.vacWD}</p>
              <p className="text-xs text-muted mt-1">{pt.workDay}</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.vacationPay}</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalPay)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>
          </div>

          {/* Addım-addım */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.calcSteps}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.step1}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dailyRate)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.monthly)} ÷ {result.monthWD} {pt.workDay} = {formatMoney(result.dailyRate)} AZN
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 bg-blue-50">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-primary">{pt.step3}</span>
                  <span className="text-sm font-bold text-primary">{formatMoney(result.totalPay)} AZN</span>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.dailyRate)} × {result.vacWD} {pt.workDay} = {formatMoney(result.totalPay)} AZN
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Əmək Məcəlləsi */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.laborCodeTitle}
            </h4>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>{pt.standard}</span>
                <span className="font-medium text-foreground">21 {pt.day}</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.experience5_10}</span>
                <span className="font-medium text-foreground">+2 {pt.day}</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.experience10_15}</span>
                <span className="font-medium text-foreground">+4 {pt.day}</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.experience15plus}</span>
                <span className="font-medium text-foreground">+6 {pt.day}</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.hardLabor}</span>
                <span className="font-medium text-foreground">+6 {pt.day}</span>
              </div>
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
