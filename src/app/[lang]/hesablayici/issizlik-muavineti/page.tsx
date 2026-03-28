"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

const MAX_BENEFIT = 250; // AZN/ay
const MIN_BENEFIT = 180; // AZN/ay
const TOTAL_WEEKS = 26;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "İşsizlik müavinəti hesablayıcısı",
    description: "Azərbaycanda işsizlik müavinətinin aylıq məbləğini və müddətini hesablayın.",
    breadcrumbCategory: "Hüquq və Dövlət",
    formulaTitle: "İşsizlik müavinəti necə hesablanır?",
    formulaContent: `Azərbaycan Əmək və Əhali Sosial Müdafiə Nazirliyi:

Müavinətin məbləği:
- İlk 3 ay: orta əmək haqqının 50%-i
- Növbəti 3 ay: orta əmək haqqının 45%-i
- Qalan aylar: orta əmək haqqının 40%-i

Hədlər:
- Maksimum: ${MAX_BENEFIT} AZN / ay
- Minimum: ${MIN_BENEFIT} AZN / ay

Müavinət müddəti: ${TOTAL_WEEKS} həftə (təqribən 6 ay)

Şərtlər:
- Minimum 1 il iş təcrübəsi olmalıdır
- DSMF-yə sığorta haqqı ödənilmiş olmalıdır
- Məşğulluq Xidmətində qeydiyyata alınmalıdır`,
    avgSalary: "Orta aylıq əmək haqqı (AZN)",
    workExperience: "İş təcrübəsi (il)",
    minExperienceWarning: "İşsizlik müavinəti almaq üçün minimum 1 il iş təcrübəsi tələb olunur.",
    first3Months: "İlk 3 ay (aylıq)",
    months4to6: "4-6-cı aylar (aylıq)",
    total6Months: "6 ayın ümumi müavinəti",
    perMonth: "AZN / ay",
    monthlyBreakdown: "Aylıq bölgü",
    monthSuffix: "-ci ay",
    calculated: "hesablanan:",
    total6MonthsLabel: "Cəmi (6 ay)",
    benefitDynamics: "Müavinət dinamikası",
    noteTitle: "Qeyd:",
    noteText: `İşsizlik müavinəti Məşğulluq Xidmətində qeydiyyata alınmış şəxslərə verilir. Müavinət müddəti ${TOTAL_WEEKS} həftədir. Maksimum məbləğ ${MAX_BENEFIT} AZN, minimum ${MIN_BENEFIT} AZN-dir. İş təklifi rəddi müavinəti dayandırır.`,
    emptyState: "Nəticəni görmək üçün əmək haqqını və iş təcrübəni daxil edin.",
    emptyStateSub: "Minimum 1 il iş təcrübəsi tələb olunur.",
  },
  en: {
    title: "Unemployment benefit calculator",
    description: "Calculate the monthly amount and duration of unemployment benefits in Azerbaijan.",
    breadcrumbCategory: "Legal & Government",
    formulaTitle: "How is unemployment benefit calculated?",
    formulaContent: `Azerbaijan Ministry of Labor and Social Protection:

Benefit amount:
- First 3 months: 50% of average salary
- Next 3 months: 45% of average salary
- Remaining months: 40% of average salary

Limits:
- Maximum: ${MAX_BENEFIT} AZN / month
- Minimum: ${MIN_BENEFIT} AZN / month

Benefit duration: ${TOTAL_WEEKS} weeks (approximately 6 months)

Conditions:
- Minimum 1 year of work experience required
- Social insurance contributions must be paid
- Must be registered with the Employment Service`,
    avgSalary: "Average monthly salary (AZN)",
    workExperience: "Work experience (years)",
    minExperienceWarning: "Minimum 1 year of work experience is required for unemployment benefits.",
    first3Months: "First 3 months (monthly)",
    months4to6: "Months 4-6 (monthly)",
    total6Months: "Total 6-month benefit",
    perMonth: "AZN / month",
    monthlyBreakdown: "Monthly breakdown",
    monthSuffix: " month",
    calculated: "calculated:",
    total6MonthsLabel: "Total (6 months)",
    benefitDynamics: "Benefit dynamics",
    noteTitle: "Note:",
    noteText: `Unemployment benefits are provided to persons registered with the Employment Service. Benefit duration is ${TOTAL_WEEKS} weeks. Maximum amount is ${MAX_BENEFIT} AZN, minimum is ${MIN_BENEFIT} AZN. Rejecting a job offer suspends the benefit.`,
    emptyState: "Enter salary and work experience to see the result.",
    emptyStateSub: "Minimum 1 year of work experience is required.",
  },
  ru: {
    title: "Калькулятор пособия по безработице",
    description: "Рассчитайте ежемесячную сумму и срок пособия по безработице в Азербайджане.",
    breadcrumbCategory: "Право и государство",
    formulaTitle: "Как рассчитывается пособие по безработице?",
    formulaContent: `Министерство труда и социальной защиты населения Азербайджана:

Размер пособия:
- Первые 3 месяца: 50% средней зарплаты
- Следующие 3 месяца: 45% средней зарплаты
- Оставшиеся месяцы: 40% средней зарплаты

Пределы:
- Максимум: ${MAX_BENEFIT} AZN / месяц
- Минимум: ${MIN_BENEFIT} AZN / месяц

Срок пособия: ${TOTAL_WEEKS} недель (приблизительно 6 месяцев)

Условия:
- Минимум 1 год опыта работы
- Страховые взносы в ГФСЗ должны быть уплачены
- Необходима регистрация в Службе занятости`,
    avgSalary: "Средняя ежемесячная зарплата (AZN)",
    workExperience: "Опыт работы (лет)",
    minExperienceWarning: "Для получения пособия по безработице требуется минимум 1 год опыта работы.",
    first3Months: "Первые 3 месяца (ежемесячно)",
    months4to6: "4-6 месяцы (ежемесячно)",
    total6Months: "Общее пособие за 6 месяцев",
    perMonth: "AZN / мес.",
    monthlyBreakdown: "Ежемесячная разбивка",
    monthSuffix: "-й месяц",
    calculated: "расчётная:",
    total6MonthsLabel: "Итого (6 мес.)",
    benefitDynamics: "Динамика пособия",
    noteTitle: "Примечание:",
    noteText: `Пособие по безработице предоставляется лицам, зарегистрированным в Службе занятости. Срок пособия — ${TOTAL_WEEKS} недель. Максимальная сумма ${MAX_BENEFIT} AZN, минимальная ${MIN_BENEFIT} AZN. Отказ от предложения работы приостанавливает пособие.`,
    emptyState: "Введите зарплату и опыт работы, чтобы увидеть результат.",
    emptyStateSub: "Требуется минимум 1 год опыта работы.",
  },
};

export default function UnemploymentBenefitCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [avgSalary, setAvgSalary] = useState("");
  const [workExperience, setWorkExperience] = useState("");

  const result = useMemo(() => {
    const salary = parseFloat(avgSalary);
    const experience = parseFloat(workExperience);
    if (!salary || salary <= 0) return null;
    if (!experience || experience < 1) return null;

    const month1_3 = Math.min(Math.max(salary * 0.5, MIN_BENEFIT), MAX_BENEFIT);
    const month4_6 = Math.min(Math.max(salary * 0.45, MIN_BENEFIT), MAX_BENEFIT);
    const monthRemaining = Math.min(Math.max(salary * 0.4, MIN_BENEFIT), MAX_BENEFIT);

    const rawMonth1_3 = salary * 0.5;
    const rawMonth4_6 = salary * 0.45;
    const rawMonthRemaining = salary * 0.4;

    const total6Months = month1_3 * 3 + month4_6 * 3;

    const months = [
      { month: 1, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 2, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 3, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 4, rate: "45%", raw: rawMonth4_6, adjusted: month4_6 },
      { month: 5, rate: "45%", raw: rawMonth4_6, adjusted: month4_6 },
      { month: 6, rate: "40%", raw: rawMonthRemaining, adjusted: monthRemaining },
    ];

    return {
      salary,
      month1_3,
      month4_6,
      monthRemaining,
      total6Months,
      months,
      rawMonth1_3,
      rawMonth4_6,
      rawMonthRemaining,
    };
  }, [avgSalary, workExperience]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=legal" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "maternity-leave", "disability-benefit", "overtime"]}
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.avgSalary}
          </label>
          <input
            type="number"
            value={avgSalary}
            onChange={(e) => setAvgSalary(e.target.value)}
            placeholder="800"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.workExperience}
          </label>
          <input
            type="number"
            value={workExperience}
            onChange={(e) => setWorkExperience(e.target.value)}
            placeholder="3"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          {workExperience && parseFloat(workExperience) < 1 && (
            <p className="text-xs text-red-500 mt-1">{pt.minExperienceWarning}</p>
          )}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.first3Months}</p>
              <p className="text-3xl font-bold">{fmt(result.month1_3)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.months4to6}</p>
              <p className="text-3xl font-bold text-amber-700">{fmt(result.month4_6)}</p>
              <p className="text-xs text-amber-600 mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.total6Months}</p>
              <p className="text-3xl font-bold text-foreground">{fmt(result.total6Months)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{pt.monthlyBreakdown}</span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.months.map((m) => (
                <div key={m.month} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{m.month}{pt.monthSuffix}</span>
                    <span className="text-xs bg-gray-100 text-muted px-2 py-0.5 rounded-full">{m.rate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">{fmt(m.adjusted)} AZN</span>
                    {m.raw !== m.adjusted && (
                      <p className="text-xs text-muted">{pt.calculated} {fmt(m.raw)} AZN</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.total6MonthsLabel}</span>
                <span className="text-sm font-bold text-primary">{fmt(result.total6Months)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Bar - declining benefit */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.benefitDynamics}</p>
            {result.months.map((m) => (
              <div key={m.month} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-muted w-12">{m.month}{pt.monthSuffix}</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(m.adjusted / MAX_BENEFIT) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-20 text-right">{fmt(m.adjusted)}</span>
              </div>
            ))}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.noteTitle}</span> {pt.noteText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📋</span>
          <p>{pt.emptyState}</p>
          <p className="text-xs mt-1">{pt.emptyStateSub}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
