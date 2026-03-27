"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

const pageTranslations = {
  az: {
    title: "Atalıq məzuniyyəti hesablayıcısı",
    description: "Atalıq məzuniyyəti haqqını hesablayın — Azərbaycan Əmək Məcəlləsinə uyğun (14 təqvim günü).",
    breadcrumbCategory: "Əmək Hüququ",
    formulaTitle: "Atalıq məzuniyyəti haqqı necə hesablanır?",
    formulaContent: `Hesablama alqoritmi:

1. Məzuniyyətə çıxmazdan əvvəlki son 2 tam iş ayı götürülür
2. Orta günlük əmək haqqı = 2 ayın əmək haqqı cəmi ÷ 2 ayda faktiki işlənmiş iş günlərinin sayı
3. Məzuniyyət haqqı = Orta günlük əmək haqqı × 14 təqvim günü ərzində düşən iş günlərinin sayı

Qeyd:
• Atalıq məzuniyyəti 14 təqvim günü müddətindədir
• Hesablamada yalnız faktiki işlənmiş iş günləri nəzərə alınır
• 14 təqvim günündə adətən 10 iş günü olur (şənbə-bazar çıxılmaqla)`,
    infoBanner: "Atalıq məzuniyyəti <b>14 təqvim günü</b> müddətindədir. Hesablama üçün məzuniyyətə çıxmazdan əvvəlki <b>son 2 tam iş ayının</b> məlumatları lazımdır.",
    month1Title: "1-ci ay (əvvəlki ay)",
    month2Title: "2-ci ay (ondan əvvəlki ay)",
    salaryLabel: "Əmək haqqı (AZN)",
    workDaysLabel: "Faktiki işlənmiş iş günləri",
    workDaysIn14Label: "14 təqvim günü ərzində düşən iş günləri",
    day: "gün",
    workDaysIn14Hint: "Adətən 14 təqvim günündə 10 iş günü olur (şənbə-bazar çıxılmaqla)",
    twoMonthTotal: "2 ayın əmək haqqı cəmi",
    avgDailySalary: "Orta günlük əmək haqqı",
    perDay: "AZN / gün",
    paternityPay: "Atalıq məzuniyyəti haqqı",
    calendarDays14: "AZN (14 təqvim günü)",
    calculationSteps: "Hesablama addımları",
    step1: "1. Son 2 ayın əmək haqqı cəmi",
    step2: "2. Cəmi faktiki iş günləri",
    step3: "3. Orta günlük əmək haqqı",
    step4: "4. Atalıq məzuniyyəti haqqı",
    workDays: "iş günü",
    aboutTitle: "Atalıq məzuniyyəti haqqında",
    aboutLine1: "Azərbaycan Əmək Məcəlləsinə əsasən atalıq məzuniyyəti <b>14 təqvim günü</b> müddətindədir.",
    aboutLine2: "Hesablama üçün məzuniyyətə çıxmazdan əvvəlki <b>son 2 tam iş ayının</b> əmək haqqı və faktiki işlənmiş iş günləri nəzərə alınır.",
    aboutLine3: "Orta günlük əmək haqqı, 14 təqvim günü ərzində düşən <b>iş günlərinin sayına</b> vurulur.",
    emptyStateText: "Nəticəni görmək üçün hər iki ayın məlumatlarını daxil edin.",
  },
  en: {
    title: "Paternity Leave Calculator",
    description: "Calculate paternity leave pay — according to Azerbaijan Labor Code (14 calendar days).",
    breadcrumbCategory: "Labor Law",
    formulaTitle: "How is paternity leave pay calculated?",
    formulaContent: `Calculation algorithm:

1. The last 2 full working months before the leave are taken
2. Average daily salary = Total salary for 2 months ÷ Number of actual working days in 2 months
3. Leave pay = Average daily salary × Number of working days within the 14 calendar days

Note:
• Paternity leave is 14 calendar days
• Only actual working days are considered in the calculation
• 14 calendar days usually contain 10 working days (excluding weekends)`,
    infoBanner: "Paternity leave is <b>14 calendar days</b>. For the calculation, data from the <b>last 2 full working months</b> before the leave is needed.",
    month1Title: "Month 1 (previous month)",
    month2Title: "Month 2 (the month before that)",
    salaryLabel: "Salary (AZN)",
    workDaysLabel: "Actual working days",
    workDaysIn14Label: "Working days within 14 calendar days",
    day: "days",
    workDaysIn14Hint: "14 calendar days usually contain 10 working days (excluding weekends)",
    twoMonthTotal: "Total salary for 2 months",
    avgDailySalary: "Average daily salary",
    perDay: "AZN / day",
    paternityPay: "Paternity leave pay",
    calendarDays14: "AZN (14 calendar days)",
    calculationSteps: "Calculation steps",
    step1: "1. Total salary for last 2 months",
    step2: "2. Total actual working days",
    step3: "3. Average daily salary",
    step4: "4. Paternity leave pay",
    workDays: "working days",
    aboutTitle: "About paternity leave",
    aboutLine1: "According to the Azerbaijan Labor Code, paternity leave is <b>14 calendar days</b>.",
    aboutLine2: "The salary and actual working days of the <b>last 2 full working months</b> before the leave are used for the calculation.",
    aboutLine3: "The average daily salary is multiplied by the <b>number of working days</b> within 14 calendar days.",
    emptyStateText: "Enter data for both months to see the result.",
  },
  ru: {
    title: "Калькулятор отцовского отпуска",
    description: "Рассчитайте оплату отцовского отпуска — по Трудовому кодексу Азербайджана (14 календарных дней).",
    breadcrumbCategory: "Трудовое право",
    formulaTitle: "Как рассчитывается оплата отцовского отпуска?",
    formulaContent: `Алгоритм расчёта:

1. Берутся последние 2 полных рабочих месяца перед отпуском
2. Среднедневная зарплата = Сумма зарплат за 2 месяца ÷ Количество фактически отработанных рабочих дней за 2 месяца
3. Оплата отпуска = Среднедневная зарплата × Количество рабочих дней в 14 календарных днях

Примечание:
• Отцовский отпуск составляет 14 календарных дней
• В расчёте учитываются только фактически отработанные рабочие дни
• В 14 календарных днях обычно 10 рабочих дней (без учёта выходных)`,
    infoBanner: "Отцовский отпуск составляет <b>14 календарных дней</b>. Для расчёта нужны данные за <b>последние 2 полных рабочих месяца</b> перед отпуском.",
    month1Title: "1-й месяц (предыдущий)",
    month2Title: "2-й месяц (позапрошлый)",
    salaryLabel: "Зарплата (AZN)",
    workDaysLabel: "Фактически отработанные рабочие дни",
    workDaysIn14Label: "Рабочие дни в 14 календарных днях",
    day: "дней",
    workDaysIn14Hint: "В 14 календарных днях обычно 10 рабочих дней (без учёта выходных)",
    twoMonthTotal: "Сумма зарплат за 2 месяца",
    avgDailySalary: "Среднедневная зарплата",
    perDay: "AZN / день",
    paternityPay: "Оплата отцовского отпуска",
    calendarDays14: "AZN (14 календарных дней)",
    calculationSteps: "Шаги расчёта",
    step1: "1. Сумма зарплат за последние 2 месяца",
    step2: "2. Всего фактических рабочих дней",
    step3: "3. Среднедневная зарплата",
    step4: "4. Оплата отцовского отпуска",
    workDays: "рабочих дней",
    aboutTitle: "Об отцовском отпуске",
    aboutLine1: "Согласно Трудовому кодексу Азербайджана, отцовский отпуск составляет <b>14 календарных дней</b>.",
    aboutLine2: "Для расчёта используются зарплата и фактически отработанные дни за <b>последние 2 полных рабочих месяца</b> перед отпуском.",
    aboutLine3: "Среднедневная зарплата умножается на <b>количество рабочих дней</b> в 14 календарных днях.",
    emptyStateText: "Введите данные за оба месяца, чтобы увидеть результат.",
  },
};

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PaternityLeaveCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [month1Salary, setMonth1Salary] = useState("");
  const [month2Salary, setMonth2Salary] = useState("");
  const [month1Days, setMonth1Days] = useState("");
  const [month2Days, setMonth2Days] = useState("");
  const [workDaysIn14, setWorkDaysIn14] = useState("10");

  const result = useMemo(() => {
    const salary1 = parseFloat(month1Salary);
    const salary2 = parseFloat(month2Salary);
    const days1 = parseInt(month1Days);
    const days2 = parseInt(month2Days);
    const wdIn14 = parseInt(workDaysIn14);

    if (!salary1 || salary1 <= 0 || !salary2 || salary2 <= 0) return null;
    if (!days1 || days1 <= 0 || !days2 || days2 <= 0) return null;
    if (!wdIn14 || wdIn14 <= 0) return null;

    // 1. Son 2 tam iş ayının əmək haqqı cəmi
    const totalSalary = salary1 + salary2;

    // 2. Cəmi faktiki işlənmiş iş günləri
    const totalWorkDays = days1 + days2;

    // 3. Orta günlük əmək haqqı = cəm ÷ faktiki iş günləri
    const dailyRate = totalSalary / totalWorkDays;

    // 4. Atalıq məzuniyyəti haqqı = günlük orta × 14 gündəki iş günləri
    const paternityPay = dailyRate * wdIn14;

    return {
      salary1, salary2, days1, days2,
      totalSalary, totalWorkDays, dailyRate,
      workDaysIn14: wdIn14, paternityPay,
    };
  }, [month1Salary, month2Salary, month1Days, month2Days, workDaysIn14]);

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
      relatedIds={["vacation-pay", "maternity-leave", "salary", "severance-pay"]}
    >
      {/* Qısa izah */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
        <p className="text-sm text-amber-800" dangerouslySetInnerHTML={{ __html: pt.infoBanner }} />
      </div>

      <div className="mb-8 space-y-4">
        {/* 1-ci ay */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">{pt.month1Title}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">{pt.salaryLabel}</label>
              <input
                type="number"
                value={month1Salary}
                onChange={(e) => setMonth1Salary(e.target.value)}
                placeholder="1500"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">{pt.workDaysLabel}</label>
              <input
                type="number"
                value={month1Days}
                onChange={(e) => setMonth1Days(e.target.value)}
                placeholder="22"
                min="1"
                max="31"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        </div>

        {/* 2-ci ay */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">{pt.month2Title}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">{pt.salaryLabel}</label>
              <input
                type="number"
                value={month2Salary}
                onChange={(e) => setMonth2Salary(e.target.value)}
                placeholder="1500"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">{pt.workDaysLabel}</label>
              <input
                type="number"
                value={month2Days}
                onChange={(e) => setMonth2Days(e.target.value)}
                placeholder="21"
                min="1"
                max="31"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        </div>

        {/* 14 gün ərzində iş günləri */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.workDaysIn14Label}
          </label>
          <input
            type="number"
            value={workDaysIn14}
            onChange={(e) => setWorkDaysIn14(e.target.value)}
            placeholder="10"
            min="1"
            max="14"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[8, 9, 10, 11, 12].map((d) => (
              <button
                key={d}
                onClick={() => setWorkDaysIn14(d.toString())}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  workDaysIn14 === d.toString()
                    ? "border-primary bg-primary-light text-primary font-medium"
                    : "border-border bg-white text-muted hover:border-primary/30"
                }`}
              >
                {d} {pt.day}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-1">
            {pt.workDaysIn14Hint}
          </p>
        </div>
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.twoMonthTotal}</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.totalSalary)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.avgDailySalary}</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.dailyRate)}</p>
              <p className="text-xs text-muted mt-1">{pt.perDay}</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.paternityPay}</p>
              <p className="text-2xl font-bold">{formatMoney(result.paternityPay)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.calendarDays14}</p>
            </div>
          </div>

          {/* Addım-addım hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.calculationSteps}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.step1}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.totalSalary)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.salary1)} + {formatMoney(result.salary2)} = {formatMoney(result.totalSalary)} AZN
                  </p>
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.step2}</span>
                  <span className="text-sm font-bold text-foreground">{result.totalWorkDays} {pt.day}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {result.days1} {pt.day} + {result.days2} {pt.day} = {result.totalWorkDays} {pt.day}
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
                    {formatMoney(result.totalSalary)} ÷ {result.totalWorkDays} {pt.day} = {formatMoney(result.dailyRate)} AZN
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 bg-blue-50">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-primary">{pt.step4}</span>
                  <span className="text-sm font-bold text-primary">{formatMoney(result.paternityPay)} AZN</span>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <p className="text-xs text-muted">
                    {formatMoney(result.dailyRate)} × {result.workDaysIn14} {pt.workDays} = {formatMoney(result.paternityPay)} AZN
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Qanunvericilik məlumatı */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.aboutTitle}
            </h4>
            <div className="space-y-2 text-sm text-muted">
              <p dangerouslySetInnerHTML={{ __html: pt.aboutLine1 }} />
              <p dangerouslySetInnerHTML={{ __html: pt.aboutLine2 }} />
              <p dangerouslySetInnerHTML={{ __html: pt.aboutLine3 }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">👨‍👶</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
