"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const DSMF_RATE = 0.03;
const UNEMPLOYMENT_RATE = 0.005;
const MEDICAL_RATE = 0.02;
const INCOME_TAX_RATE = 0.14;

type Reason = "layoff" | "agreement" | "voluntary" | "contract-end";

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const compensationLabels: Record<Lang, (years: number) => string> = {
  az: (years) => {
    if (years < 1) return "1 il-dək: 1 aylıq";
    if (years < 5) return "1-5 il: 1.4 aylıq";
    if (years < 10) return "5-10 il: 1.7 aylıq";
    return "10+ il: 2 aylıq";
  },
  en: (years) => {
    if (years < 1) return "Up to 1 year: 1 monthly";
    if (years < 5) return "1-5 years: 1.4 monthly";
    if (years < 10) return "5-10 years: 1.7 monthly";
    return "10+ years: 2 monthly";
  },
  ru: (years) => {
    if (years < 1) return "До 1 года: 1 месячный";
    if (years < 5) return "1-5 лет: 1,4 месячных";
    if (years < 10) return "5-10 лет: 1,7 месячных";
    return "10+ лет: 2 месячных";
  },
};

function getCompensationMonths(years: number): number {
  if (years < 1) return 1;
  if (years < 5) return 1.4;
  if (years < 10) return 1.7;
  return 2;
}

const pageTranslations = {
  az: {
    title: "İşdən çıxma hesablayıcısı",
    description: "İşdən çıxma zamanı ödəniləcək kompensasiyanı və istifadə olunmamış məzuniyyət pulunu hesablayın.",
    breadcrumbCategory: "Əmək Hüququ",
    formulaTitle: "İşdən çıxma kompensasiyası necə hesablanır?",
    formulaContent: `Əmək Məcəlləsinin 77-ci maddəsinə görə:
• 1 ilədək staj: 1 aylıq orta əmək haqqı
• 1-5 il staj: 1.4 aylıq orta əmək haqqı
• 5-10 il staj: 1.7 aylıq orta əmək haqqı
• 10+ il staj: 2 aylıq orta əmək haqqı

İşdən çıxma səbəbinə görə:
• İxtisar / ləğv: tam kompensasiya
• Tərəflərin razılığı: tam kompensasiya
• İşçinin öz istəyi: kompensasiya yoxdur
• Müqavilə bitməsi: proporsional kompensasiya

İstifadə olunmamış məzuniyyət günləri də ödənilir.`,
    monthlySalary: "Aylıq əmək haqqı (AZN)",
    workExperience: "İş stajı (il)",
    salaryLabel: "əmək haqqı",
    dismissalReason: "İşdən çıxma səbəbi",
    unusedVacationDays: "İstifadə olunmamış məzuniyyət günləri",
    reasons: [
      { value: "layoff" as Reason, label: "İşəgötürən tərəfindən ləğv (ixtisar)", description: "Tam kompensasiya ödənilir" },
      { value: "agreement" as Reason, label: "Tərəflərin razılığı ilə", description: "Tam kompensasiya ödənilir" },
      { value: "voluntary" as Reason, label: "İşçinin öz istəyi ilə", description: "Kompensasiya ödənilmir" },
      { value: "contract-end" as Reason, label: "Müddətli müqavilənin bitməsi", description: "Proporsional kompensasiya" },
    ],
    voluntaryWarning: "İşçinin öz istəyi ilə işdən çıxdıqda kompensasiya ödənilmir. Yalnız istifadə olunmamış məzuniyyət günlərinin əvəzi ödənilir.",
    netPayment: "Net ödəniş",
    netPaymentSub: "AZN (əlinizə çatan)",
    grossPayment: "Gross ödəniş",
    calcDetails: "Hesablama detalları",
    compensation: "Kompensasiya",
    vacationComp: "Məzuniyyət kompensasiyası",
    daySymbol: "gün",
    totalGross: "Cəmi gross",
    dsmf: "DSMF (3%)",
    unemploymentInsurance: "İşsizlik sığortası (0.5%)",
    medicalInsurance: "İcbari tibbi sığorta (2%)",
    incomeTax: "Gəlir vergisi (14%)",
    totalDeductions: "Cəmi tutulma",
    netPaymentLabel: "Net ödəniş",
    article77Title: "Əmək Məcəlləsi, Maddə 77",
    upTo1Year: "1 ilədək staj",
    oneToFiveYears: "1-5 il staj",
    fiveToTenYears: "5-10 il staj",
    tenPlusYears: "10+ il staj",
    oneMonthlySalary: "1 aylıq əmək haqqı",
    onePointFourMonthlySalary: "1.4 aylıq əmək haqqı",
    onePointSevenMonthlySalary: "1.7 aylıq əmək haqqı",
    twoMonthlySalary: "2 aylıq əmək haqqı",
    emptyState: "Nəticəni görmək üçün əmək haqqını və stajı daxil edin.",
  },
  en: {
    title: "Dismissal calculator",
    description: "Calculate severance pay and unused vacation compensation upon dismissal.",
    breadcrumbCategory: "Labor Law",
    formulaTitle: "How is dismissal compensation calculated?",
    formulaContent: `According to Article 77 of the Labor Code:
• Up to 1 year experience: 1 monthly average salary
• 1-5 years experience: 1.4 monthly average salary
• 5-10 years experience: 1.7 monthly average salary
• 10+ years experience: 2 monthly average salary

By reason of dismissal:
• Layoff / liquidation: full compensation
• Mutual agreement: full compensation
• Employee's own will: no compensation
• Contract expiration: proportional compensation

Unused vacation days are also compensated.`,
    monthlySalary: "Monthly salary (AZN)",
    workExperience: "Work experience (years)",
    salaryLabel: "salary",
    dismissalReason: "Reason for dismissal",
    unusedVacationDays: "Unused vacation days",
    reasons: [
      { value: "layoff" as Reason, label: "Layoff by employer", description: "Full compensation paid" },
      { value: "agreement" as Reason, label: "Mutual agreement", description: "Full compensation paid" },
      { value: "voluntary" as Reason, label: "Employee's own will", description: "No compensation" },
      { value: "contract-end" as Reason, label: "Contract expiration", description: "Proportional compensation" },
    ],
    voluntaryWarning: "No compensation is paid when leaving voluntarily. Only unused vacation days are compensated.",
    netPayment: "Net payment",
    netPaymentSub: "AZN (take-home)",
    grossPayment: "Gross payment",
    calcDetails: "Calculation details",
    compensation: "Compensation",
    vacationComp: "Vacation compensation",
    daySymbol: "days",
    totalGross: "Total gross",
    dsmf: "SSPF (3%)",
    unemploymentInsurance: "Unemployment insurance (0.5%)",
    medicalInsurance: "Mandatory health insurance (2%)",
    incomeTax: "Income tax (14%)",
    totalDeductions: "Total deductions",
    netPaymentLabel: "Net payment",
    article77Title: "Labor Code, Article 77",
    upTo1Year: "Up to 1 year",
    oneToFiveYears: "1-5 years",
    fiveToTenYears: "5-10 years",
    tenPlusYears: "10+ years",
    oneMonthlySalary: "1 monthly salary",
    onePointFourMonthlySalary: "1.4 monthly salary",
    onePointSevenMonthlySalary: "1.7 monthly salary",
    twoMonthlySalary: "2 monthly salary",
    emptyState: "Enter salary and experience to see the result.",
  },
  ru: {
    title: "Калькулятор увольнения",
    description: "Рассчитайте компенсацию при увольнении и оплату неиспользованного отпуска.",
    breadcrumbCategory: "Трудовое право",
    formulaTitle: "Как рассчитывается компенсация при увольнении?",
    formulaContent: `Согласно статье 77 Трудового кодекса:
• Стаж до 1 года: 1 среднемесячная зарплата
• 1-5 лет стажа: 1,4 среднемесячных зарплаты
• 5-10 лет стажа: 1,7 среднемесячных зарплаты
• 10+ лет стажа: 2 среднемесячных зарплаты

По причине увольнения:
• Сокращение / ликвидация: полная компенсация
• По соглашению сторон: полная компенсация
• По собственному желанию: компенсация не выплачивается
• Истечение контракта: пропорциональная компенсация

Неиспользованные дни отпуска также компенсируются.`,
    monthlySalary: "Ежемесячная зарплата (AZN)",
    workExperience: "Стаж работы (лет)",
    salaryLabel: "зарплаты",
    dismissalReason: "Причина увольнения",
    unusedVacationDays: "Неиспользованные дни отпуска",
    reasons: [
      { value: "layoff" as Reason, label: "Сокращение работодателем", description: "Полная компенсация" },
      { value: "agreement" as Reason, label: "По соглашению сторон", description: "Полная компенсация" },
      { value: "voluntary" as Reason, label: "По собственному желанию", description: "Компенсация не выплачивается" },
      { value: "contract-end" as Reason, label: "Истечение срочного контракта", description: "Пропорциональная компенсация" },
    ],
    voluntaryWarning: "При увольнении по собственному желанию компенсация не выплачивается. Оплачиваются только неиспользованные дни отпуска.",
    netPayment: "Чистая выплата",
    netPaymentSub: "AZN (на руки)",
    grossPayment: "Брутто выплата",
    calcDetails: "Детали расчёта",
    compensation: "Компенсация",
    vacationComp: "Компенсация отпуска",
    daySymbol: "дней",
    totalGross: "Итого брутто",
    dsmf: "ГФСЗ (3%)",
    unemploymentInsurance: "Страхование от безработицы (0,5%)",
    medicalInsurance: "Обязательное медстрахование (2%)",
    incomeTax: "Подоходный налог (14%)",
    totalDeductions: "Итого удержания",
    netPaymentLabel: "Чистая выплата",
    article77Title: "Трудовой кодекс, Статья 77",
    upTo1Year: "Стаж до 1 года",
    oneToFiveYears: "1-5 лет стажа",
    fiveToTenYears: "5-10 лет стажа",
    tenPlusYears: "10+ лет стажа",
    oneMonthlySalary: "1 месячная зарплата",
    onePointFourMonthlySalary: "1,4 месячных зарплаты",
    onePointSevenMonthlySalary: "1,7 месячных зарплаты",
    twoMonthlySalary: "2 месячных зарплаты",
    emptyState: "Введите зарплату и стаж, чтобы увидеть результат.",
  },
};

export default function SeverancePayCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState<Reason>("layoff");
  const [unusedVacationDays, setUnusedVacationDays] = useState("");

  const result = useMemo(() => {
    const monthlySalary = parseFloat(salary);
    const years = parseFloat(experience);
    if (!monthlySalary || monthlySalary <= 0 || isNaN(years) || years < 0) return null;

    const compensationMonths = getCompensationMonths(years);
    let grossCompensation = 0;
    let showCompensation = true;

    if (reason === "voluntary") {
      grossCompensation = 0;
      showCompensation = false;
    } else if (reason === "contract-end") {
      grossCompensation = monthlySalary * compensationMonths * 0.5;
    } else {
      grossCompensation = monthlySalary * compensationMonths;
    }

    const vacDays = parseFloat(unusedVacationDays) || 0;
    const dailyRate = (monthlySalary * 12) / 365;
    const vacationCompensation = dailyRate * vacDays;

    const totalGross = grossCompensation + vacationCompensation;

    const dsmf = totalGross * DSMF_RATE;
    const unemployment = totalGross * UNEMPLOYMENT_RATE;
    const medical = totalGross * MEDICAL_RATE;
    const afterDeductions = totalGross - dsmf - unemployment - medical;
    const incomeTax = Math.max(0, afterDeductions) * INCOME_TAX_RATE;
    const totalDeductions = dsmf + unemployment + medical + incomeTax;
    const netAmount = totalGross - totalDeductions;

    return {
      compensationMonths,
      grossCompensation,
      vacationCompensation,
      dailyRate,
      totalGross,
      dsmf,
      unemployment,
      medical,
      incomeTax,
      totalDeductions,
      netAmount,
      showCompensation,
    };
  }, [salary, experience, reason, unusedVacationDays]);

  const years = parseFloat(experience) || 0;
  const getCompLabel = compensationLabels[lang];

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
      relatedIds={["salary", "vacation-pay", "unemployment-benefit", "business-trip"]}
    >
      {/* Inputs */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💵 {pt.monthlySalary}
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="2000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📅 {pt.workExperience}
            </label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="5"
              min="0"
              step="0.5"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            {years > 0 && (
              <p className="text-xs text-muted mt-1">
                {getCompLabel(years)} {pt.salaryLabel}
              </p>
            )}
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📋 {pt.dismissalReason}
          </label>
          <div className="space-y-2">
            {pt.reasons.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  reason === r.value
                    ? "border-primary bg-primary-light"
                    : "border-border bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reason === r.value ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    {reason === r.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted">{r.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Unused vacation days */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🏖️ {pt.unusedVacationDays}
          </label>
          <input
            type="number"
            value={unusedVacationDays}
            onChange={(e) => setUnusedVacationDays(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Voluntary warning */}
          {reason === "voluntary" && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <p className="text-sm font-medium text-amber-700 flex items-center gap-2">
                <span>⚠️</span>
                {pt.voluntaryWarning}
              </p>
            </div>
          )}

          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netPayment}</p>
              <p className="text-3xl font-bold">{formatMoney(result.netAmount)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.netPaymentSub}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.grossPayment}</p>
              <p className="text-3xl font-bold text-foreground">{formatMoney(result.totalGross)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.calcDetails}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.showCompensation && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">
                      {pt.compensation} ({getCompLabel(years)})
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatMoney(result.grossCompensation)} AZN
                    </span>
                  </div>
                </>
              )}
              {result.vacationCompensation > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">
                    {pt.vacationComp} ({unusedVacationDays} {pt.daySymbol} × {formatMoney(result.dailyRate)} AZN)
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatMoney(result.vacationCompensation)} AZN
                  </span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-foreground">{pt.totalGross}</span>
                <span className="text-sm font-bold text-foreground">{formatMoney(result.totalGross)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.dsmf}</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.dsmf)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.unemploymentInsurance}</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.unemployment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.medicalInsurance}</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.medical)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.incomeTax}</span>
                <span className="text-sm font-medium text-foreground">-{formatMoney(result.incomeTax)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.totalDeductions}</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.totalDeductions)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.netPaymentLabel}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.netAmount)} AZN</span>
              </div>
            </div>
          </div>

          {/* Article 77 Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>⚖️</span>
              {pt.article77Title}
            </h4>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>{pt.upTo1Year}</span>
                <span className={`font-medium ${years < 1 ? "text-primary" : "text-foreground"}`}>{pt.oneMonthlySalary}</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.oneToFiveYears}</span>
                <span className={`font-medium ${years >= 1 && years < 5 ? "text-primary" : "text-foreground"}`}>{pt.onePointFourMonthlySalary}</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.fiveToTenYears}</span>
                <span className={`font-medium ${years >= 5 && years < 10 ? "text-primary" : "text-foreground"}`}>{pt.onePointSevenMonthlySalary}</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.tenPlusYears}</span>
                <span className={`font-medium ${years >= 10 ? "text-primary" : "text-foreground"}`}>{pt.twoMonthlySalary}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📋</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
