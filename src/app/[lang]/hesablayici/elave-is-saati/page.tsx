"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type OvertimeType = "weekday" | "night" | "weekend";

const overtimeLabelTranslations: Record<Lang, Record<OvertimeType, { label: string; icon: string; description: string }>> = {
  az: {
    weekday: { label: "İş günü (əlavə saat)", icon: "🕐", description: "İş vaxtından artıq işləmə — 2x əmək haqqı" },
    night: { label: "Gecə saatları (22:00–06:00)", icon: "🌙", description: "Gecə vaxtı işləmə — 1.2x əlavə" },
    weekend: { label: "İstirahət / bayram günü", icon: "📅", description: "İstirahət və bayram günləri — 2x əmək haqqı" },
  },
  en: {
    weekday: { label: "Weekday (extra hours)", icon: "🕐", description: "Overtime work — 2x pay" },
    night: { label: "Night hours (22:00–06:00)", icon: "🌙", description: "Night work — 1.2x extra" },
    weekend: { label: "Weekend / holiday", icon: "📅", description: "Weekends and holidays — 2x pay" },
  },
  ru: {
    weekday: { label: "Рабочий день (доп. часы)", icon: "🕐", description: "Сверхурочная работа — 2x оплата" },
    night: { label: "Ночные часы (22:00–06:00)", icon: "🌙", description: "Ночная работа — 1.2x доплата" },
    weekend: { label: "Выходной / праздник", icon: "📅", description: "Выходные и праздники — 2x оплата" },
  },
};

const pageTranslations = {
  az: {
    title: "Əlavə iş saatı hesablayıcısı",
    description: "Aylıq əmək haqqı və əlavə iş saatlarını daxil edin — əlavə ödənişi hesablayın.",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "Əlavə iş saatı necə hesablanır?",
    formulaContent: `Əsas saatlıq tarif = Aylıq əmək haqqı ÷ (İş günü × Gündəlik saat)

Əmək Məcəlləsi, Maddə 165:
• İş günü əlavə saatlar: saatlıq tarif × 2
• Gecə saatları (22:00–06:00), Maddə 164: saatlıq tarif × 1.2 əlavə
• İstirahət / bayram günləri, Maddə 166: saatlıq tarif × 2

Məsələn: 2000 AZN maaş, 22 iş günü, 8 saat
Saatlıq tarif = 2000 ÷ 176 = 11.36 AZN
10 saat əlavə iş (iş günü) = 11.36 × 2 × 10 = 227.27 AZN`,
    monthlyGrossSalary: "Aylıq gross əmək haqqı (AZN)",
    overtimeHoursLabel: "Əlavə iş saatı (saat)",
    monthlyWorkDays: "Aylıq iş günü",
    dailyWorkHours: "Gündəlik iş saatı",
    overtimeType: "Əlavə iş növü",
    overtimePay: "Əlavə iş haqqı",
    totalSalary: "Ümumi əmək haqqı",
    basePlusOvertime: "AZN (əsas + əlavə)",
    calculationDetails: "Hesablama detalları",
    monthlyWorkHours: "Aylıq iş saatı",
    hours: "saat",
    hourlyRate: "Saatlıq tarif",
    multiplier: "Əmsalı",
    overtimeHourlyRate: "Əlavə saatlıq tarif",
    overtimeHoursDetail: "Əlavə iş saatı",
    overtimePayDetail: "Əlavə iş haqqı",
    emptyStateText: "Nəticəni görmək üçün əmək haqqı və əlavə iş saatını daxil edin.",
  },
  en: {
    title: "Overtime Calculator",
    description: "Enter monthly salary and overtime hours — calculate overtime pay.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How is overtime calculated?",
    formulaContent: `Base hourly rate = Monthly salary ÷ (Working days × Daily hours)

Labor Code, Article 165:
• Weekday overtime: hourly rate × 2
• Night hours (22:00–06:00), Article 164: hourly rate × 1.2 extra
• Weekends / holidays, Article 166: hourly rate × 2

Example: 2000 AZN salary, 22 working days, 8 hours
Hourly rate = 2000 ÷ 176 = 11.36 AZN
10 hours overtime (weekday) = 11.36 × 2 × 10 = 227.27 AZN`,
    monthlyGrossSalary: "Monthly gross salary (AZN)",
    overtimeHoursLabel: "Overtime hours",
    monthlyWorkDays: "Monthly working days",
    dailyWorkHours: "Daily working hours",
    overtimeType: "Overtime type",
    overtimePay: "Overtime pay",
    totalSalary: "Total salary",
    basePlusOvertime: "AZN (base + overtime)",
    calculationDetails: "Calculation details",
    monthlyWorkHours: "Monthly work hours",
    hours: "hours",
    hourlyRate: "Hourly rate",
    multiplier: "Multiplier",
    overtimeHourlyRate: "Overtime hourly rate",
    overtimeHoursDetail: "Overtime hours",
    overtimePayDetail: "Overtime pay",
    emptyStateText: "Enter salary and overtime hours to see the result.",
  },
  ru: {
    title: "Калькулятор сверхурочных",
    description: "Введите месячную зарплату и сверхурочные часы — рассчитайте доплату.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как рассчитываются сверхурочные?",
    formulaContent: `Базовая почасовая ставка = Месячная зарплата ÷ (Рабочие дни × Часов в день)

Трудовой кодекс, Статья 165:
• Сверхурочные в рабочий день: почасовая ставка × 2
• Ночные часы (22:00–06:00), Статья 164: почасовая ставка × 1.2 доплата
• Выходные / праздники, Статья 166: почасовая ставка × 2

Пример: зарплата 2000 AZN, 22 рабочих дня, 8 часов
Почасовая ставка = 2000 ÷ 176 = 11.36 AZN
10 часов сверхурочных (рабочий день) = 11.36 × 2 × 10 = 227.27 AZN`,
    monthlyGrossSalary: "Месячная зарплата брутто (AZN)",
    overtimeHoursLabel: "Сверхурочные часы",
    monthlyWorkDays: "Рабочих дней в месяце",
    dailyWorkHours: "Часов в рабочем дне",
    overtimeType: "Тип сверхурочных",
    overtimePay: "Оплата сверхурочных",
    totalSalary: "Общая зарплата",
    basePlusOvertime: "AZN (основная + сверхурочные)",
    calculationDetails: "Детали расчёта",
    monthlyWorkHours: "Рабочих часов в месяце",
    hours: "часов",
    hourlyRate: "Почасовая ставка",
    multiplier: "Коэффициент",
    overtimeHourlyRate: "Сверхурочная почасовая ставка",
    overtimeHoursDetail: "Сверхурочные часы",
    overtimePayDetail: "Оплата сверхурочных",
    emptyStateText: "Введите зарплату и сверхурочные часы для расчёта.",
  },
};

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OvertimeCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const overtimeLabels = overtimeLabelTranslations[lang];

  const [monthlySalary, setMonthlySalary] = useState("");
  const [workingDays, setWorkingDays] = useState("22");
  const [dailyHours, setDailyHours] = useState("8");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [overtimeType, setOvertimeType] = useState<OvertimeType>("weekday");

  const result = useMemo(() => {
    const salary = parseFloat(monthlySalary);
    const days = parseInt(workingDays);
    const hours = parseInt(dailyHours);
    const overtime = parseFloat(overtimeHours);

    if (!salary || salary <= 0 || !days || days <= 0 || !hours || hours <= 0 || !overtime || overtime <= 0)
      return null;

    const totalMonthlyHours = days * hours;
    const hourlyRate = salary / totalMonthlyHours;

    let multiplier: number;
    switch (overtimeType) {
      case "weekday":
        multiplier = 2;
        break;
      case "night":
        multiplier = 1.2;
        break;
      case "weekend":
        multiplier = 2;
        break;
    }

    const overtimeRate = hourlyRate * multiplier;
    const overtimePayment = overtimeRate * overtime;
    const totalSalary = salary + overtimePayment;

    return {
      hourlyRate,
      multiplier,
      overtimeRate,
      overtimePayment,
      totalSalary,
      totalMonthlyHours,
    };
  }, [monthlySalary, workingDays, dailyHours, overtimeHours, overtimeType]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "freelancer-tax", "loan"]}
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💵 {pt.monthlyGrossSalary}
          </label>
          <input
            type="number"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            placeholder="2000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            ⏰ {pt.overtimeHoursLabel}
          </label>
          <input
            type="number"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value)}
            placeholder="10"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📆 {pt.monthlyWorkDays}
          </label>
          <input
            type="number"
            value={workingDays}
            onChange={(e) => setWorkingDays(e.target.value)}
            placeholder="22"
            min="1"
            max="31"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🕐 {pt.dailyWorkHours}
          </label>
          <input
            type="number"
            value={dailyHours}
            onChange={(e) => setDailyHours(e.target.value)}
            placeholder="8"
            min="1"
            max="24"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Overtime Type */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">
          {pt.overtimeType}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(overtimeLabels) as OvertimeType[]).map((type) => (
            <button
              key={type}
              onClick={() => setOvertimeType(type)}
              className={`p-4 rounded-xl border text-left transition-all ${
                overtimeType === type
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{overtimeLabels[type].icon}</span>
              <p className="text-sm font-medium text-foreground">{overtimeLabels[type].label}</p>
              <p className="text-xs text-muted mt-1">{overtimeLabels[type].description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.overtimePay}</p>
              <p className="text-3xl font-bold">{formatMoney(result.overtimePayment)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">{pt.totalSalary}</p>
              <p className="text-3xl font-bold text-green-700">{formatMoney(result.totalSalary)}</p>
              <p className="text-xs text-green-600 mt-1">{pt.basePlusOvertime}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.calculationDetails}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.monthlyWorkHours}</span>
                <span className="text-sm font-medium text-foreground">{result.totalMonthlyHours} {pt.hours}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.hourlyRate}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.hourlyRate)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.multiplier}</span>
                <span className="text-sm font-medium text-primary">×{result.multiplier}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.overtimeHourlyRate}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.overtimeRate)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.overtimeHoursDetail}</span>
                <span className="text-sm font-medium text-foreground">{overtimeHours} {pt.hours}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.overtimePayDetail}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.overtimePayment)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⏰</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
