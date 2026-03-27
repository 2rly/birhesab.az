"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const MINIMUM_WAGE = 345; // AZN

type BirthType = "normal" | "complicated" | "twins";

const birthTypesTranslations: Record<Lang, { value: BirthType; label: string; before: number; after: number; total: number; description: string }[]> = {
  az: [
    { value: "normal", label: "Normal doğuş", before: 70, after: 56, total: 126, description: "70 gün (doğuşdan əvvəl) + 56 gün (doğuşdan sonra)" },
    { value: "complicated", label: "Ağırlaşmış doğuş", before: 70, after: 70, total: 140, description: "70 gün (doğuşdan əvvəl) + 70 gün (doğuşdan sonra)" },
    { value: "twins", label: "Əkiz doğuş", before: 70, after: 110, total: 180, description: "70 gün (doğuşdan əvvəl) + 110 gün (doğuşdan sonra)" },
  ],
  en: [
    { value: "normal", label: "Normal delivery", before: 70, after: 56, total: 126, description: "70 days (before birth) + 56 days (after birth)" },
    { value: "complicated", label: "Complicated delivery", before: 70, after: 70, total: 140, description: "70 days (before birth) + 70 days (after birth)" },
    { value: "twins", label: "Twin delivery", before: 70, after: 110, total: 180, description: "70 days (before birth) + 110 days (after birth)" },
  ],
  ru: [
    { value: "normal", label: "Нормальные роды", before: 70, after: 56, total: 126, description: "70 дней (до родов) + 56 дней (после родов)" },
    { value: "complicated", label: "Осложнённые роды", before: 70, after: 70, total: 140, description: "70 дней (до родов) + 70 дней (после родов)" },
    { value: "twins", label: "Двойня", before: 70, after: 110, total: 180, description: "70 дней (до родов) + 110 дней (после родов)" },
  ],
};

const pageTranslations = {
  az: {
    title: "Analıq məzuniyyəti hesablayıcısı",
    description: "Azərbaycanda analıq məzuniyyəti ödənişini hesablayın — doğuş növünə görə günləri və məbləği öyrənin.",
    breadcrumbCategory: "Hüquq və Dövlət",
    formulaTitle: "Analıq məzuniyyəti necə hesablanır?",
    formulaContent: `Azərbaycan Əmək Məcəlləsi, Maddə 125-126:

Məzuniyyət günləri:
• Normal doğuş: 70 + 56 = 126 təqvim günü
• Ağırlaşmış doğuş: 70 + 70 = 140 təqvim günü
• Əkiz doğuş: 70 + 110 = 180 təqvim günü

Ödəniş formulu:
Orta günlük əmək haqqı = Son 12 ayın əmək haqqı / 365
Analıq ödənişi = Orta günlük əmək haqqı × Məzuniyyət günləri

Minimum: Minimum əmək haqqına (${MINIMUM_WAGE} AZN) əsasən hesablanır.
Ödəniş DSMF tərəfindən həyata keçirilir.`,
    birthType: "Doğuş növü",
    days: "gün",
    monthlySalary: "Aylıq əmək haqqı (gross, AZN)",
    totalPayment: "Ümumi analıq ödənişi",
    avgDailySalary: "Orta günlük əmək haqqı",
    perDay: "AZN / gün",
    minimumWageNote: `Daxil etdiyiniz əmək haqqı minimum əmək haqqından (${MINIMUM_WAGE} AZN) aşağı olduğu üçün minimum dərəcə tətbiq edildi.`,
    paymentBreakdown: "Ödəniş bölgüləri",
    annualSalary: "İllik əmək haqqı",
    avgDailyCalc: "Orta günlük əmək haqqı (illik / 365)",
    beforeBirth: "Doğuşdan əvvəl",
    afterBirth: "Doğuşdan sonra",
    totalPaymentLabel: "Cəmi ödəniş",
    comparisonTitle: "Doğuş növlərinə görə müqayisə",
    infoTitle: "Qeyd:",
    infoText: "Analıq məzuniyyəti ödənişi DSMF (Dövlət Sosial Müdafiə Fondu) tərəfindən həyata keçirilir. İşəgötürən məzuniyyət müddətində iş yerini saxlamalıdır. Məzuniyyətdən sonra qadın uşaq 3 yaşına çatana qədər ödənişsiz məzuniyyət götürə bilər.",
    emptyStateText: "Nəticəni görmək üçün aylıq əmək haqqını daxil edin.",
  },
  en: {
    title: "Maternity Leave Calculator",
    description: "Calculate maternity leave payments in Azerbaijan — learn the days and amounts based on delivery type.",
    breadcrumbCategory: "Legal & Government",
    formulaTitle: "How is maternity leave calculated?",
    formulaContent: `Azerbaijan Labor Code, Articles 125-126:

Leave days:
• Normal delivery: 70 + 56 = 126 calendar days
• Complicated delivery: 70 + 70 = 140 calendar days
• Twin delivery: 70 + 110 = 180 calendar days

Payment formula:
Average daily salary = Last 12 months salary / 365
Maternity payment = Average daily salary × Leave days

Minimum: Calculated based on minimum wage (${MINIMUM_WAGE} AZN).
Payment is made by SSPF.`,
    birthType: "Delivery type",
    days: "days",
    monthlySalary: "Monthly salary (gross, AZN)",
    totalPayment: "Total maternity payment",
    avgDailySalary: "Average daily salary",
    perDay: "AZN / day",
    minimumWageNote: `Your salary is below the minimum wage (${MINIMUM_WAGE} AZN), so the minimum rate was applied.`,
    paymentBreakdown: "Payment breakdown",
    annualSalary: "Annual salary",
    avgDailyCalc: "Average daily salary (annual / 365)",
    beforeBirth: "Before birth",
    afterBirth: "After birth",
    totalPaymentLabel: "Total payment",
    comparisonTitle: "Comparison by delivery type",
    infoTitle: "Note:",
    infoText: "Maternity leave payment is made by the SSPF (State Social Protection Fund). The employer must retain the position during the leave period. After the leave, the mother can take unpaid leave until the child turns 3.",
    emptyStateText: "Enter a monthly salary to see the result.",
  },
  ru: {
    title: "Калькулятор декретного отпуска",
    description: "Рассчитайте выплату по декретному отпуску в Азербайджане — узнайте дни и суммы в зависимости от типа родов.",
    breadcrumbCategory: "Право и государство",
    formulaTitle: "Как рассчитывается декретный отпуск?",
    formulaContent: `Трудовой кодекс Азербайджана, статьи 125-126:

Дни отпуска:
• Нормальные роды: 70 + 56 = 126 календарных дней
• Осложнённые роды: 70 + 70 = 140 календарных дней
• Двойня: 70 + 110 = 180 календарных дней

Формула расчёта:
Среднедневная зарплата = Зарплата за последние 12 месяцев / 365
Декретная выплата = Среднедневная зарплата × Дни отпуска

Минимум: Рассчитывается на основе минимальной зарплаты (${MINIMUM_WAGE} AZN).
Выплата осуществляется ГФСЗ.`,
    birthType: "Тип родов",
    days: "дней",
    monthlySalary: "Ежемесячная зарплата (брутто, AZN)",
    totalPayment: "Общая декретная выплата",
    avgDailySalary: "Среднедневная зарплата",
    perDay: "AZN / день",
    minimumWageNote: `Ваша зарплата ниже минимальной (${MINIMUM_WAGE} AZN), поэтому была применена минимальная ставка.`,
    paymentBreakdown: "Разбивка выплат",
    annualSalary: "Годовая зарплата",
    avgDailyCalc: "Среднедневная зарплата (годовая / 365)",
    beforeBirth: "До родов",
    afterBirth: "После родов",
    totalPaymentLabel: "Итого выплата",
    comparisonTitle: "Сравнение по типу родов",
    infoTitle: "Примечание:",
    infoText: "Декретная выплата осуществляется ГФСЗ (Государственный фонд социальной защиты). Работодатель обязан сохранить рабочее место на время отпуска. После отпуска женщина может взять неоплачиваемый отпуск до достижения ребёнком 3 лет.",
    emptyStateText: "Введите ежемесячную зарплату, чтобы увидеть результат.",
  },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function MaternityLeaveCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const birthTypes = birthTypesTranslations[lang];

  const [monthlySalary, setMonthlySalary] = useState("");
  const [birthType, setBirthType] = useState<BirthType>("normal");

  const result = useMemo(() => {
    const salary = parseFloat(monthlySalary);
    if (!salary || salary <= 0) return null;

    const selected = birthTypes.find((b) => b.value === birthType)!;
    const annualSalary = salary * 12;
    const avgDailySalary = annualSalary / 365;

    // Minimum daily salary based on minimum wage
    const minDailySalary = (MINIMUM_WAGE * 12) / 365;
    const effectiveDailySalary = Math.max(avgDailySalary, minDailySalary);

    const beforeBirthPayment = effectiveDailySalary * selected.before;
    const afterBirthPayment = effectiveDailySalary * selected.after;
    const totalPayment = effectiveDailySalary * selected.total;

    return {
      annualSalary,
      avgDailySalary,
      minDailySalary,
      effectiveDailySalary,
      beforeBirthPayment,
      afterBirthPayment,
      totalPayment,
      daysBefore: selected.before,
      daysAfter: selected.after,
      totalDays: selected.total,
      isMinimumApplied: avgDailySalary < minDailySalary,
    };
  }, [monthlySalary, birthType, birthTypes]);

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
      relatedIds={["salary", "unemployment-benefit", "disability-benefit", "maternity-leave"]}
    >
      {/* Birth Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.birthType}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {birthTypes.map((bt) => (
            <button
              key={bt.value}
              onClick={() => setBirthType(bt.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                birthType === bt.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{bt.label}</p>
              <p className="text-xs text-muted mt-1">{bt.total} {pt.days}</p>
              <p className="text-xs text-muted">{bt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          {pt.monthlySalary}
        </label>
        <input
          type="number"
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
          placeholder="1000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.totalPayment}</p>
              <p className="text-3xl font-bold">{fmt(result.totalPayment)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / {result.totalDays} {pt.days}</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.avgDailySalary}</p>
              <p className="text-3xl font-bold text-amber-700">{fmt(result.effectiveDailySalary)}</p>
              <p className="text-xs text-amber-600 mt-1">{pt.perDay}</p>
            </div>
          </div>

          {/* Minimum wage note */}
          {result.isMinimumApplied && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <span>{pt.minimumWageNote}</span>
              </p>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{pt.paymentBreakdown}</span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.annualSalary}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.annualSalary)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.avgDailyCalc}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.avgDailySalary)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.beforeBirth} ({result.daysBefore} {pt.days})</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.beforeBirthPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.afterBirth} ({result.daysAfter} {pt.days})</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.afterBirthPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.totalPaymentLabel} ({result.totalDays} {pt.days})</span>
                <span className="text-sm font-bold text-primary">{fmt(result.totalPayment)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">{pt.beforeBirth}</span>
              <span className="text-muted">{pt.afterBirth}</span>
            </div>
            <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${(result.daysBefore / result.totalDays) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">
                {result.daysBefore} {pt.days} ({fmt(result.beforeBirthPayment)} AZN)
              </span>
              <span className="font-medium text-amber-700">
                {result.daysAfter} {pt.days} ({fmt(result.afterBirthPayment)} AZN)
              </span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{pt.comparisonTitle}</span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              {birthTypes.map((bt) => {
                const daily = result.effectiveDailySalary;
                const total = daily * bt.total;
                const isActive = bt.value === birthType;
                return (
                  <div key={bt.value} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{bt.label}</p>
                      <p className="text-xs text-muted">{bt.total} {pt.days}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{fmt(total)} AZN</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.infoTitle}</span> {pt.infoText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">👶</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
