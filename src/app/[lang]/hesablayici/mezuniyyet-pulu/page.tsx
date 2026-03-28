"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const MONTH_NAMES: Record<Lang, string[]> = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

const pageTranslations = {
  az: {
    title: "Məzuniyyət pulu hesablayıcısı",
    description: "Əmək haqqına əsasən məzuniyyət pulunu hesablayın — Azərbaycan Əmək Məcəlləsinə uyğun.",
    breadcrumbCategory: "Əmək Hüququ",
    breadcrumbLabel: "Məzuniyyət pulu hesablayıcısı",
    formulaTitle: "Məzuniyyət pulu necə hesablanır?",
    formulaContent: `Hesablama alqoritmi:

1. Orta aylıq əmək haqqı = Son 12 ayın əmək haqqı cəmi ÷ 12
2. Bir günlük əmək haqqı = Orta aylıq əmək haqqı ÷ 30,4
3. Məzuniyyət haqqı = Bir günlük əmək haqqı × Məzuniyyət günləri

Əmək Məcəlləsi üzrə minimum məzuniyyət:
• Standart: 21 iş günü
• 5–10 il staj: +2 gün
• 10–15 il staj: +4 gün
• 15+ il staj: +6 gün
• Ağır əmək şəraiti: +6 gün`,
    sameSalary: "Eyni maaş (12 ay)",
    eachMonth: "Hər ay ayrıca",
    monthlySalary: "Aylıq əmək haqqı (AZN)",
    last12Months: "Son 12 ayın əmək haqqı (AZN)",
    fillAll: (amount: string) => `Hamısını ${amount}₼ ilə doldur`,
    vacationDays: "Məzuniyyət günləri",
    day: "gün",
    workExperience: "İş stajı (il)",
    extraDaysNote: (days: number) => `Staja görə əlavə +${days} gün məzuniyyət hüququ var`,
    avgMonthlySalary: "Orta aylıq əmək haqqı",
    perMonth: "AZN / ay",
    dailyRate: "Bir günlük əmək haqqı",
    perDay: "AZN / gün",
    vacationPay: "Məzuniyyət haqqı",
    calcSteps: "Hesablama addımları",
    step1: "1. Son 12 ayın əmək haqqı cəmi",
    step1Single: (monthly: string, total: string) => `${monthly} × 12 ay = ${total} AZN`,
    step1Monthly: (total: string) => `12 ayın cəmi = ${total} AZN`,
    step2: "2. Orta aylıq əmək haqqı",
    step3: "3. Bir günlük əmək haqqı",
    step4: "4. Məzuniyyət haqqı",
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
    formulaContent: `Calculation algorithm:

1. Average monthly salary = Sum of last 12 months' salary ÷ 12
2. Daily rate = Average monthly salary ÷ 30.4
3. Vacation pay = Daily rate × Vacation days

Minimum vacation under the Labor Code:
• Standard: 21 working days
• 5–10 years of experience: +2 days
• 10–15 years of experience: +4 days
• 15+ years of experience: +6 days
• Hard labor conditions: +6 days`,
    sameSalary: "Same salary (12 months)",
    eachMonth: "Each month separately",
    monthlySalary: "Monthly salary (AZN)",
    last12Months: "Last 12 months' salary (AZN)",
    fillAll: (amount: string) => `Fill all with ${amount}₼`,
    vacationDays: "Vacation days",
    day: "days",
    workExperience: "Work experience (years)",
    extraDaysNote: (days: number) => `Extra +${days} vacation days based on experience`,
    avgMonthlySalary: "Average monthly salary",
    perMonth: "AZN / month",
    dailyRate: "Daily rate",
    perDay: "AZN / day",
    vacationPay: "Vacation pay",
    calcSteps: "Calculation steps",
    step1: "1. Total salary for last 12 months",
    step1Single: (monthly: string, total: string) => `${monthly} × 12 months = ${total} AZN`,
    step1Monthly: (total: string) => `Sum of 12 months = ${total} AZN`,
    step2: "2. Average monthly salary",
    step3: "3. Daily rate",
    step4: "4. Vacation pay",
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
    formulaContent: `Алгоритм расчёта:

1. Средняя месячная зарплата = Сумма зарплат за последние 12 месяцев ÷ 12
2. Дневная ставка = Средняя месячная зарплата ÷ 30,4
3. Отпускные = Дневная ставка × Дни отпуска

Минимальный отпуск по Трудовому кодексу:
• Стандарт: 21 рабочий день
• 5–10 лет стажа: +2 дня
• 10–15 лет стажа: +4 дня
• 15+ лет стажа: +6 дней
• Тяжёлые условия труда: +6 дней`,
    sameSalary: "Одинаковая зарплата (12 мес.)",
    eachMonth: "Каждый месяц отдельно",
    monthlySalary: "Ежемесячная зарплата (AZN)",
    last12Months: "Зарплата за последние 12 месяцев (AZN)",
    fillAll: (amount: string) => `Заполнить все ${amount}₼`,
    vacationDays: "Дни отпуска",
    day: "дней",
    workExperience: "Стаж работы (лет)",
    extraDaysNote: (days: number) => `Дополнительно +${days} дней отпуска по стажу`,
    avgMonthlySalary: "Средняя месячная зарплата",
    perMonth: "AZN / мес.",
    dailyRate: "Дневная ставка",
    perDay: "AZN / день",
    vacationPay: "Отпускные",
    calcSteps: "Этапы расчёта",
    step1: "1. Общая зарплата за 12 месяцев",
    step1Single: (monthly: string, total: string) => `${monthly} × 12 мес. = ${total} AZN`,
    step1Monthly: (total: string) => `Сумма за 12 месяцев = ${total} AZN`,
    step2: "2. Средняя месячная зарплата",
    step3: "3. Дневная ставка",
    step4: "4. Отпускные",
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

type InputMode = "single" | "monthly";

export default function VacationPayCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const monthNames = MONTH_NAMES[lang];

  const [inputMode, setInputMode] = useState<InputMode>("single");
  const [singleSalary, setSingleSalary] = useState("");
  const [monthlySalaries, setMonthlySalaries] = useState<string[]>(Array(12).fill(""));
  const [vacationDays, setVacationDays] = useState("21");
  const [experience, setExperience] = useState("");

  const updateMonth = (index: number, value: string) => {
    const updated = [...monthlySalaries];
    updated[index] = value;
    setMonthlySalaries(updated);
  };

  const fillAllMonths = () => {
    if (singleSalary) {
      setMonthlySalaries(Array(12).fill(singleSalary));
      setInputMode("monthly");
    }
  };

  const result = useMemo(() => {
    const days = parseInt(vacationDays);
    if (!days || days <= 0) return null;

    let totalYearlySalary: number;

    if (inputMode === "single") {
      const monthly = parseFloat(singleSalary);
      if (!monthly || monthly <= 0) return null;
      totalYearlySalary = monthly * 12;
    } else {
      const values = monthlySalaries.map((s) => parseFloat(s) || 0);
      const filledMonths = values.filter((v) => v > 0);
      if (filledMonths.length === 0) return null;
      totalYearlySalary = values.reduce((sum, v) => sum + v, 0);
    }

    const avgMonthlySalary = totalYearlySalary / 12;
    const dailyRate = avgMonthlySalary / 30.4;
    const vacationPay = dailyRate * days;

    return { totalYearlySalary, avgMonthlySalary, dailyRate, vacationPay, days };
  }, [inputMode, singleSalary, monthlySalaries, vacationDays]);

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
      {/* Daxiletmə rejimi */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setInputMode("single")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            inputMode === "single"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.sameSalary}
        </button>
        <button
          onClick={() => setInputMode("monthly")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            inputMode === "monthly"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.eachMonth}
        </button>
      </div>

      <div className="mb-8 space-y-4">
        {inputMode === "single" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.monthlySalary}
            </label>
            <input
              type="number"
              value={singleSalary}
              onChange={(e) => setSingleSalary(e.target.value)}
              placeholder="2000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <div className="flex gap-2 mt-2">
              {[400, 1000, 1500, 2000, 3000, 5000].map((v) => (
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
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                {pt.last12Months}
              </label>
              {singleSalary && (
                <button
                  onClick={fillAllMonths}
                  className="text-xs text-primary hover:underline"
                >
                  {pt.fillAll(singleSalary)}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {monthNames.map((name, i) => (
                <div key={i}>
                  <label className="block text-xs text-muted mb-1">{name}</label>
                  <input
                    type="number"
                    value={monthlySalaries[i]}
                    onChange={(e) => updateMonth(i, e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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
              <p className="text-sm text-muted mb-1">{pt.avgMonthlySalary}</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.avgMonthlySalary)}</p>
              <p className="text-xs text-muted mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.dailyRate}</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.dailyRate)}</p>
              <p className="text-xs text-muted mt-1">{pt.perDay}</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.vacationPay}</p>
              <p className="text-2xl font-bold">{formatMoney(result.vacationPay)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN ({result.days} {pt.day})</p>
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
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.totalYearlySalary)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {inputMode === "single"
                      ? pt.step1Single(formatMoney(result.avgMonthlySalary), formatMoney(result.totalYearlySalary))
                      : pt.step1Monthly(formatMoney(result.totalYearlySalary))}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.step2}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.avgMonthlySalary)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.totalYearlySalary)} ÷ 12 = {formatMoney(result.avgMonthlySalary)} AZN
                  </p>
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.step3}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dailyRate)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.avgMonthlySalary)} ÷ 30,4 = {formatMoney(result.dailyRate)} AZN
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 bg-blue-50">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-primary">{pt.step4}</span>
                  <span className="text-sm font-bold text-primary">{formatMoney(result.vacationPay)} AZN</span>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.dailyRate)} × {result.days} {pt.day} = {formatMoney(result.vacationPay)} AZN
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
                <span className="font-medium text-foreground">21 {pt.workDays}</span>
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
