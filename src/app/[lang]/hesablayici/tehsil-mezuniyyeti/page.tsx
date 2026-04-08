"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// ============================================================
// Təhsil məzuniyyəti haqqı hesablayıcısı
// Əmək Məcəlləsi maddə 123-124, 177
//
// Hesablama (maddə 177):
// 1. Məzuniyyətdən əvvəlki son 2 ayın əmək haqqı cəmlənir
// 2. Həmin 2 aydakı iş günlərinin sayına bölünür
// 3. Məzuniyyət günlərindəki iş günlərinin sayına vurulur
// ============================================================

const MONTHS_TR: Record<Lang, string[]> = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

interface LeaveType {
  id: string;
  label: Record<Lang, string>;
  description: Record<Lang, string>;
  calendarDays: number;
}

const leaveTypes: LeaveType[] = [
  {
    id: "higher-12",
    calendarDays: 30,
    label: { az: "30 gün", en: "30 days", ru: "30 дней" },
    description: { az: "Ali təhsil, 1-2-ci kurs", en: "Higher ed., 1st-2nd year", ru: "Высшее, 1-2 курс" },
  },
  {
    id: "higher-34",
    calendarDays: 40,
    label: { az: "40 gün", en: "40 days", ru: "40 дней" },
    description: { az: "Ali təhsil, qalan kurslar", en: "Higher ed., other years", ru: "Высшее, старшие курсы" },
  },
  {
    id: "secondary-12",
    calendarDays: 20,
    label: { az: "20 gün", en: "20 days", ru: "20 дней" },
    description: { az: "Orta ixtisas, 1-2-ci kurs", en: "Secondary spec., 1-2 yr", ru: "Среднее спец., 1-2 курс" },
  },
  {
    id: "secondary-34",
    calendarDays: 30,
    label: { az: "30 gün", en: "30 days", ru: "30 дней" },
    description: { az: "Orta ixtisas, digər kurslar", en: "Secondary spec., other yr", ru: "Среднее спец., другие" },
  },
  {
    id: "state-exam",
    calendarDays: 30,
    label: { az: "30 gün", en: "30 days", ru: "30 дней" },
    description: { az: "Dövlət imtahanları", en: "State exams", ru: "Гос. экзамены" },
  },
  {
    id: "diploma-higher",
    calendarDays: 120,
    label: { az: "4 ay", en: "4 months", ru: "4 мес." },
    description: { az: "Diplom işi — ali təhsil", en: "Thesis — higher ed.", ru: "Диплом — высшее" },
  },
  {
    id: "diploma-secondary",
    calendarDays: 60,
    label: { az: "2 ay", en: "2 months", ru: "2 мес." },
    description: { az: "Diplom işi — orta ixtisas", en: "Thesis — secondary spec.", ru: "Диплом — среднее спец." },
  },
  {
    id: "vocational",
    calendarDays: 30,
    label: { az: "30 gün", en: "30 days", ru: "30 дней" },
    description: { az: "Peşə təhsili", en: "Vocational education", ru: "Профессиональное" },
  },
  {
    id: "general",
    calendarDays: 20,
    label: { az: "20 gün", en: "20 days", ru: "20 дней" },
    description: { az: "Ümumtəhsil, buraxılış", en: "General ed., finals", ru: "Общее, выпускные" },
  },
];

function getWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) workDays++;
  }
  return workDays;
}

function getWorkingDaysInRange(year: number, month: number, day: number, calendarDays: number): number {
  let workDays = 0;
  const start = new Date(year, month, day);
  for (let i = 0; i < calendarDays; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    if (d.getDay() !== 0 && d.getDay() !== 6) workDays++;
  }
  return workDays;
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const T = {
  az: {
    title: "Təhsil məzuniyyəti hesablayıcısı",
    description: "Əmək Məcəlləsi maddə 123-124 və 177-yə əsasən təhsil məzuniyyəti haqqının hesablanması.",
    breadcrumbCategory: "Əmək Hüququ",
    breadcrumbLabel: "Təhsil məzuniyyəti",
    formulaTitle: "Təhsil məzuniyyəti haqqı necə hesablanır?",
    formulaContent: `Hesablama qaydası (Əmək Məcəlləsi maddə 177):

1. Məzuniyyətdən əvvəlki son 2 ayın əmək haqqı cəmlənir
2. Həmin 2 aydakı iş günlərinin sayına bölünür (bir günlük əmək haqqı)
3. Məzuniyyət müddətindəki iş günlərinin sayına vurulur

Formula: (Ay1 + Ay2) ÷ (İş günü1 + İş günü2) × Məzuniyyətdəki iş günləri

Misal: Noyabr 700₼, Dekabr 900₼, 30 günlük məzuniyyət:
(700 + 900) ÷ (22 + 24) × 23 = 34,78 × 23 = 799,94₼

Məzuniyyət müddətləri (maddə 124):
• Ali təhsil (qiyabi) 1-2-ci kurs: 30 gün
• Ali təhsil (qiyabi) qalan kurslar: 40 gün
• Orta ixtisas 1-2-ci kurs: 20 gün, digər kurslar: 30 gün
• Dövlət imtahanları: 30 gün
• Diplom işi: ali — 4 aya qədər, orta ixtisas — 2 aya qədər
• Peşə təhsili: 30 gün
• Ümumtəhsil buraxılış: 20 gün`,
    leaveType: "Məzuniyyət növü",
    startDate: "Məzuniyyətin başlanğıc tarixi",
    salary1Label: "1-ci ayın əmək haqqı (AZN)",
    salary2Label: "2-ci ayın əmək haqqı (AZN)",
    workDays1Label: "1-ci aydakı iş günlərinin sayı",
    workDays2Label: "2-ci aydakı iş günlərinin sayı",
    leaveWorkDaysLabel: "Məzuniyyətdəki iş günlərinin sayı",
    leavePay: "Təhsil məzuniyyəti haqqı",
    calendarDays: "təqvim günü",
    calcSteps: "Hesablama addımları",
    stepByStep: "addım-addım",
    step1: "Son 2 ayın əmək haqqı cəmi",
    step2: "Son 2 aydakı iş günləri cəmi",
    step3: "Bir günlük əmək haqqı",
    step4: "Məzuniyyətdəki iş günləri",
    step5: "Məzuniyyət haqqı",
    workDay: "iş günü",
    summary: "Xülasə",
    summSalary: "2 aylıq əmək haqqı",
    summWorkDays: "İş günləri (2 ay)",
    summDaily: "Günlük əmək haqqı",
    summLeaveWD: "İş günləri (məzun.)",
    summPay: "Məzuniyyət haqqı",
    note: "Qeyd: Məzuniyyət haqqı məzuniyyətin başlanmasına ən geci 3 gün qalmış ödənilir (maddə 140.5).",
    empty: "Nəticəni görmək üçün əmək haqqlarını daxil edin.",
  },
  en: {
    title: "Education Leave Calculator",
    description: "Calculate education leave pay per Labor Code articles 123-124 and 177.",
    breadcrumbCategory: "Labor Law",
    breadcrumbLabel: "Education leave",
    formulaTitle: "How is education leave pay calculated?",
    formulaContent: `Calculation procedure (Labor Code article 177):

1. Sum the salaries of the last 2 months before the leave
2. Divide by the total working days in those 2 months (daily rate)
3. Multiply by the number of working days in the leave period

Formula: (Month1 + Month2) ÷ (WorkDays1 + WorkDays2) × WorkDays in leave

Example: Nov 700₼, Dec 900₼, 30-day leave:
(700 + 900) ÷ (22 + 24) × 23 = 34.78 × 23 = 799.94₼

Leave durations (article 124):
• Higher education (distance) 1st-2nd year: 30 days
• Higher education (distance) other years: 40 days
• Secondary specialized 1st-2nd year: 20 days, other years: 30 days
• State exams: 30 days
• Thesis: higher — up to 4 months, secondary — up to 2 months
• Vocational: 30 days
• General education finals: 20 days`,
    leaveType: "Leave type",
    startDate: "Leave start date",
    salary1Label: "1st month salary (AZN)",
    salary2Label: "2nd month salary (AZN)",
    workDays1Label: "Working days in 1st month",
    workDays2Label: "Working days in 2nd month",
    leaveWorkDaysLabel: "Working days in leave period",
    leavePay: "Education leave pay",
    calendarDays: "calendar days",
    calcSteps: "Calculation steps",
    stepByStep: "step by step",
    step1: "Total salary for last 2 months",
    step2: "Total working days in last 2 months",
    step3: "Daily salary rate",
    step4: "Working days in leave period",
    step5: "Leave pay",
    workDay: "working days",
    summary: "Summary",
    summSalary: "2-month salary",
    summWorkDays: "Working days (2 mo.)",
    summDaily: "Daily rate",
    summLeaveWD: "Working days (leave)",
    summPay: "Leave pay",
    note: "Note: Leave pay must be paid no later than 3 days before the leave starts (article 140.5).",
    empty: "Enter salaries to see the result.",
  },
  ru: {
    title: "Калькулятор учебного отпуска",
    description: "Расчёт оплаты учебного отпуска — Трудовой кодекс, статьи 123-124 и 177.",
    breadcrumbCategory: "Трудовое право",
    breadcrumbLabel: "Учебный отпуск",
    formulaTitle: "Как рассчитывается оплата учебного отпуска?",
    formulaContent: `Порядок расчёта (Трудовой кодекс, статья 177):

1. Суммируются зарплаты за последние 2 месяца перед отпуском
2. Делится на общее количество рабочих дней за эти 2 месяца (дневная ставка)
3. Умножается на количество рабочих дней в период отпуска

Формула: (Мес1 + Мес2) ÷ (РабДни1 + РабДни2) × РабДни в отпуске

Пример: Ноябрь 700₼, Декабрь 900₼, отпуск 30 дней:
(700 + 900) ÷ (22 + 24) × 23 = 34,78 × 23 = 799,94₼

Продолжительность отпуска (статья 124):
• Высшее (заочное) 1-2 курс: 30 дней
• Высшее (заочное) старшие курсы: 40 дней
• Среднее спец. 1-2 курс: 20 дней, остальные: 30 дней
• Гос. экзамены: 30 дней
• Дипломная: высшее — до 4 мес., среднее спец. — до 2 мес.
• Профессиональное: 30 дней
• Общее образование выпускные: 20 дней`,
    leaveType: "Тип отпуска",
    startDate: "Дата начала отпуска",
    salary1Label: "Зарплата за 1-й месяц (AZN)",
    salary2Label: "Зарплата за 2-й месяц (AZN)",
    workDays1Label: "Рабочие дни в 1-м месяце",
    workDays2Label: "Рабочие дни во 2-м месяце",
    leaveWorkDaysLabel: "Рабочие дни в период отпуска",
    leavePay: "Оплата учебного отпуска",
    calendarDays: "календарных дней",
    calcSteps: "Порядок расчёта",
    stepByStep: "пошагово",
    step1: "Общая зарплата за 2 месяца",
    step2: "Рабочие дни за 2 месяца",
    step3: "Дневная ставка",
    step4: "Рабочие дни в период отпуска",
    step5: "Оплата отпуска",
    workDay: "рабочих дней",
    summary: "Итоги",
    summSalary: "Зарплата за 2 мес.",
    summWorkDays: "Раб. дни (2 мес.)",
    summDaily: "Дневная ставка",
    summLeaveWD: "Раб. дни (отпуск)",
    summPay: "Оплата отпуска",
    note: "Примечание: Отпускные выплачиваются не позднее чем за 3 дня до начала отпуска (статья 140.5).",
    empty: "Введите зарплаты, чтобы увидеть результат.",
  },
};

export default function EducationLeaveCalculator() {
  const { lang } = useLanguage();
  const t = T[lang];
  const MONTHS = MONTHS_TR[lang];

  const [selectedLeave, setSelectedLeave] = useState("higher-12");
  const leaveType = leaveTypes.find((l) => l.id === selectedLeave)!;

  const [startMonth, setStartMonth] = useState(0);
  const [startYear, setStartYear] = useState(2026);
  const [startDay, setStartDay] = useState(1);

  // Son 2 ay
  const prev2 = useMemo(() => {
    let m1 = startMonth - 1, y1 = startYear;
    if (m1 < 0) { m1 = 11; y1--; }
    let m2 = m1 - 1, y2 = y1;
    if (m2 < 0) { m2 = 11; y2--; }
    return [{ year: y2, month: m2 }, { year: y1, month: m1 }];
  }, [startMonth, startYear]);

  const [salary1, setSalary1] = useState("");
  const [salary2, setSalary2] = useState("");
  const [wd1, setWd1] = useState("");
  const [wd2, setWd2] = useState("");
  const [leaveWd, setLeaveWd] = useState("");

  const autoWd1 = useMemo(() => getWorkingDaysInMonth(prev2[0].year, prev2[0].month), [prev2]);
  const autoWd2 = useMemo(() => getWorkingDaysInMonth(prev2[1].year, prev2[1].month), [prev2]);
  const autoLeaveWd = useMemo(() => getWorkingDaysInRange(startYear, startMonth, startDay, leaveType.calendarDays), [startYear, startMonth, startDay, leaveType]);

  const workDays1 = wd1 ? parseInt(wd1) || 0 : autoWd1;
  const workDays2 = wd2 ? parseInt(wd2) || 0 : autoWd2;
  const leaveWorkDays = leaveWd ? parseInt(leaveWd) || 0 : autoLeaveWd;

  const result = useMemo(() => {
    const s1 = parseFloat(salary1) || 0;
    const s2 = parseFloat(salary2) || 0;
    const totalSalary = s1 + s2;
    const totalWd = workDays1 + workDays2;
    if (totalSalary <= 0 || totalWd <= 0 || leaveWorkDays <= 0) return null;
    const daily = totalSalary / totalWd;
    const pay = daily * leaveWorkDays;
    return { s1, s2, totalSalary, workDays1, workDays2, totalWd, daily, leaveWorkDays, pay };
  }, [salary1, salary2, workDays1, workDays2, leaveWorkDays]);

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";
  const selectCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  return (
    <CalculatorLayout
      title={t.title}
      description={t.description}
      breadcrumbs={[
        { label: t.breadcrumbCategory, href: "/?category=labor" },
        { label: t.breadcrumbLabel },
      ]}
      formulaTitle={t.formulaTitle}
      formulaContent={t.formulaContent}
      relatedIds={["vacation-pay", "teacher-vacation", "salary", "sick-leave"]}
    >
      {/* ── Inputs ── */}
      <div className="space-y-4 mb-8">
        {/* Məzuniyyət növü */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🎓 {t.leaveType}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {leaveTypes.map((lt) => (
              <button
                key={lt.id}
                onClick={() => setSelectedLeave(lt.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedLeave === lt.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-bold text-foreground">{lt.label[lang]}</p>
                <p className="text-[10px] text-muted leading-tight mt-0.5">{lt.description[lang]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Başlanğıc tarixi */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 {t.startDate}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <select value={startDay} onChange={(e) => setStartDay(+e.target.value)} className={selectCls}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select value={startMonth} onChange={(e) => setStartMonth(+e.target.value)} className={selectCls}>
              {MONTHS.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <select value={startYear} onChange={(e) => setStartYear(+e.target.value)} className={selectCls}>
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Əmək haqqları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 {t.salary1Label}
              <span className="text-xs text-muted font-normal ml-1">({MONTHS[prev2[0].month]} {prev2[0].year})</span>
            </label>
            <input type="number" value={salary1} onChange={(e) => setSalary1(e.target.value)} placeholder="700" min="0" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 {t.salary2Label}
              <span className="text-xs text-muted font-normal ml-1">({MONTHS[prev2[1].month]} {prev2[1].year})</span>
            </label>
            <input type="number" value={salary2} onChange={(e) => setSalary2(e.target.value)} placeholder="900" min="0" className={inputCls} />
          </div>
        </div>

        {/* İş günləri */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📊 {t.workDays1Label}
            </label>
            <input type="number" value={wd1} onChange={(e) => setWd1(e.target.value)} placeholder={String(autoWd1)} min="0" max="31" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📊 {t.workDays2Label}
            </label>
            <input type="number" value={wd2} onChange={(e) => setWd2(e.target.value)} placeholder={String(autoWd2)} min="0" max="31" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📊 {t.leaveWorkDaysLabel}
            </label>
            <input type="number" value={leaveWd} onChange={(e) => setLeaveWd(e.target.value)} placeholder={String(autoLeaveWd)} min="0" max="200" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas nəticə */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{t.leavePay} ({leaveType.calendarDays} {t.calendarDays})</p>
            <p className="text-4xl font-bold">{fmt(result.pay)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          {/* Addım-addım */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span> {t.calcSteps}
              </h3>
              <span className="text-xs text-muted bg-white px-2 py-0.5 rounded-full border border-border">{t.stepByStep}</span>
            </div>
            <div className="divide-y divide-border">
              {/* 1 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <span className="text-sm font-medium text-foreground">{t.step1}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.s1)} + {fmt(result.s2)} = <span className="font-bold text-primary">{fmt(result.totalSalary)} AZN</span>
                  </p>
                </div>
              </div>
              {/* 2 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <span className="text-sm font-medium text-foreground">{t.step2}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {result.workDays1} + {result.workDays2} = <span className="font-bold text-primary">{result.totalWd} {t.workDay}</span>
                  </p>
                </div>
              </div>
              {/* 3 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <span className="text-sm font-medium text-foreground">{t.step3}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {fmt(result.totalSalary)} ÷ {result.totalWd} = <span className="font-bold text-primary">{fmt(result.daily)} AZN</span>
                  </p>
                </div>
              </div>
              {/* 4 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                  <span className="text-sm font-medium text-foreground">{t.step4}</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {leaveType.calendarDays} {t.calendarDays} → <span className="font-bold text-primary">{result.leaveWorkDays} {t.workDay}</span>
                  </p>
                </div>
              </div>
              {/* 5 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">5</span>
                  <span className="text-sm font-medium text-foreground">{t.step5}</span>
                </div>
                <div className="ml-8 bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-foreground">
                    {fmt(result.daily)} × {result.leaveWorkDays} = <span className="font-bold text-lg text-green-700">{fmt(result.pay)} AZN</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Xülasə */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📊</span> {t.summary}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{t.summSalary}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.totalSalary)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{t.summWorkDays}</p>
                <p className="text-lg font-bold text-foreground">{result.totalWd}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{t.summDaily}</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.daily)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{t.summLeaveWD}</p>
                <p className="text-lg font-bold text-foreground">{result.leaveWorkDays}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-muted mb-1">{t.summPay}</p>
                <p className="text-lg font-bold text-primary">{fmt(result.pay)}₼</p>
              </div>
            </div>
          </div>

          {/* Qeyd */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <p className="text-sm text-amber-800">{t.note}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🎓</span>
          <p>{t.empty}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
