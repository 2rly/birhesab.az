"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const MONTH_NAMES_TRANSLATIONS: Record<Lang, string[]> = {
  az: [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
    "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  ru: [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ],
};

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pageTranslations = {
  az: {
    title: "Hərbi xidmət ödənişi hesablayıcısı",
    description: "Hərbi xidmətə gedən işçiyə ödəniləcək məbləği hesablayın — son 12 ayın net maaş və iş günlərinə əsasən.",
    breadcrumbCategory: "Əmək Hüququ",
    breadcrumbLabel: "Hərbi xidmət ödənişi",
    formulaTitle: "Hərbi xidmət ödənişi necə hesablanır?",
    formulaContent: `Əmək Məcəlləsi, Maddə 74 — Hərbi xidmətə çağırılan işçiyə ödəniş:

1. Orta günlük əmək haqqı:
   Son 12 ayın cəmi net maaşı / Son 12 ayın cəmi iş günü

2. Son 3 ayın ödənişi:
   Son 3 ayın cəmi iş günü × Orta günlük əmək haqqı

3. Əsgərə gedəcəyi ayda işlədiyi günlərin ödənişi:
   İşlədiyi gün sayı × Orta günlük əmək haqqı

4. Ümumi ödəniş:
   Son 3 ayın ödənişi + Gedəcəyi ayın ödənişi`,
    introText: "Hərbi xidmətə gedən işçiyə ödəniləcək məbləği hesablayın. Son 12 ayın net maaş və iş günlərini daxil edin.",
    departureMonth: "Əsgərə gedəcəyi ay",
    yearLabel: "İl",
    daysWorkedLabel: "ayında işlədiyi gün sayı",
    daysWorkedPlaceholder: "Məs: 15",
    last12MonthsData: "Son 12 ayın məlumatları",
    monthHeader: "Ay",
    netSalaryHeader: "Net maaş (₼)",
    workDaysHeader: "İş günü",
    last3MonthsTag: "(son 3 ay)",
    calculationDetails: "Hesablama detalları",
    totalNetSalary: "Son 12 ayın cəmi net maaşı:",
    totalWorkDays: "Son 12 ayın cəmi iş günü:",
    avgDailyWage: "Orta günlük əmək haqqı:",
    last3MonthsPayment: "Son 3 ayın ödənişi",
    last3MonthsWorkDays: "Son 3 ayın cəmi iş günü:",
    departureMonthPayment: "ayının ödənişi",
    daysWorkedInMonth: "İşlədiyi gün sayı:",
    totalPaymentLabel: "İşçiyə ödəniləcək ümumi məbləğ:",
    last3MonthsAmount: "son 3 ay",
    monthAmount: "ayı",
    daysUnit: "gün",
    emptyState: "Nəticəni görmək üçün son 12 ayın məlumatlarını daxil edin.",
  },
  en: {
    title: "Military Service Payment Calculator",
    description: "Calculate the amount payable to an employee called up for military service — based on net salary and work days of the last 12 months.",
    breadcrumbCategory: "Labor Law",
    breadcrumbLabel: "Military service payment",
    formulaTitle: "How is military service payment calculated?",
    formulaContent: `Labor Code, Article 74 — Payment to employee called for military service:

1. Average daily wage:
   Total net salary of last 12 months / Total work days of last 12 months

2. Last 3 months payment:
   Total work days of last 3 months × Average daily wage

3. Payment for days worked in departure month:
   Days worked × Average daily wage

4. Total payment:
   Last 3 months payment + Departure month payment`,
    introText: "Calculate the amount payable to an employee called up for military service. Enter net salary and work days for the last 12 months.",
    departureMonth: "Departure month",
    yearLabel: "Year",
    daysWorkedLabel: "days worked in",
    daysWorkedPlaceholder: "E.g.: 15",
    last12MonthsData: "Last 12 months data",
    monthHeader: "Month",
    netSalaryHeader: "Net salary (₼)",
    workDaysHeader: "Work days",
    last3MonthsTag: "(last 3 months)",
    calculationDetails: "Calculation details",
    totalNetSalary: "Total net salary of last 12 months:",
    totalWorkDays: "Total work days of last 12 months:",
    avgDailyWage: "Average daily wage:",
    last3MonthsPayment: "Last 3 months payment",
    last3MonthsWorkDays: "Total work days of last 3 months:",
    departureMonthPayment: "month payment",
    daysWorkedInMonth: "Days worked:",
    totalPaymentLabel: "Total amount payable to employee:",
    last3MonthsAmount: "last 3 months",
    monthAmount: "month",
    daysUnit: "days",
    emptyState: "Enter the last 12 months data to see the result.",
  },
  ru: {
    title: "Калькулятор выплат при призыве на военную службу",
    description: "Рассчитайте сумму, причитающуюся работнику, призванному на военную службу — на основании зарплаты и рабочих дней за последние 12 месяцев.",
    breadcrumbCategory: "Трудовое право",
    breadcrumbLabel: "Выплата при призыве",
    formulaTitle: "Как рассчитывается выплата при призыве?",
    formulaContent: `Трудовой кодекс, Статья 74 — Выплата работнику, призванному на военную службу:

1. Средний дневной заработок:
   Общая чистая зарплата за 12 мес. / Общее кол-во рабочих дней за 12 мес.

2. Выплата за последние 3 месяца:
   Общее кол-во рабочих дней за 3 мес. × Средний дневной заработок

3. Выплата за отработанные дни в месяце отправки:
   Кол-во отработанных дней × Средний дневной заработок

4. Общая выплата:
   Выплата за 3 мес. + Выплата за месяц отправки`,
    introText: "Рассчитайте сумму, причитающуюся работнику, призванному на военную службу. Введите чистую зарплату и рабочие дни за последние 12 месяцев.",
    departureMonth: "Месяц отправки",
    yearLabel: "Год",
    daysWorkedLabel: "отработанных дней в",
    daysWorkedPlaceholder: "Напр.: 15",
    last12MonthsData: "Данные за последние 12 месяцев",
    monthHeader: "Месяц",
    netSalaryHeader: "Чистая зарплата (₼)",
    workDaysHeader: "Рабочие дни",
    last3MonthsTag: "(посл. 3 мес.)",
    calculationDetails: "Детали расчёта",
    totalNetSalary: "Общая чистая зарплата за 12 мес.:",
    totalWorkDays: "Общее кол-во рабочих дней за 12 мес.:",
    avgDailyWage: "Средний дневной заработок:",
    last3MonthsPayment: "Выплата за последние 3 месяца",
    last3MonthsWorkDays: "Общее кол-во рабочих дней за 3 мес.:",
    departureMonthPayment: "выплата за месяц",
    daysWorkedInMonth: "Отработанных дней:",
    totalPaymentLabel: "Общая сумма к выплате работнику:",
    last3MonthsAmount: "посл. 3 мес.",
    monthAmount: "месяц",
    daysUnit: "дней",
    emptyState: "Введите данные за последние 12 месяцев, чтобы увидеть результат.",
  },
};

export default function MilitaryServiceCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const MONTH_NAMES = MONTH_NAMES_TRANSLATIONS[lang];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [departureMonth, setDepartureMonth] = useState(currentMonth);
  const [departureYear, setDepartureYear] = useState(currentYear);
  const [daysWorkedInMonth, setDaysWorkedInMonth] = useState("");
  const [monthlyData, setMonthlyData] = useState(
    () => Array.from({ length: 12 }, () => ({ netSalary: "", workDays: "" }))
  );

  // Son 12 ayın ay adları (gedəcəyi aydan geriyə)
  const monthLabels = useMemo(() => {
    const labels: { month: string; year: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      let m = departureMonth - 1 - i;
      let y = departureYear;
      while (m < 0) { m += 12; y--; }
      labels.push({ month: MONTH_NAMES[m], year: y });
    }
    return labels;
  }, [departureMonth, departureYear, MONTH_NAMES]);

  const result = useMemo(() => {
    let totalNet = 0;
    let totalDays = 0;
    let filledMonths = 0;

    for (let i = 0; i < 12; i++) {
      const net = parseFloat(monthlyData[i].netSalary);
      const days = parseFloat(monthlyData[i].workDays);
      if (net > 0 && days > 0) {
        totalNet += net;
        totalDays += days;
        filledMonths++;
      }
    }

    if (totalDays === 0 || filledMonths === 0) return null;

    const avgDaily = totalNet / totalDays;

    // Son 3 ayın iş günləri cəmi
    let last3MonthsDays = 0;
    for (let i = 9; i < 12; i++) {
      const days = parseFloat(monthlyData[i].workDays);
      if (days > 0) last3MonthsDays += days;
    }

    const daysInDepartureMonth = parseFloat(daysWorkedInMonth) || 0;

    const last3MonthsPayment = last3MonthsDays * avgDaily;
    const departureMonthPayment = daysInDepartureMonth * avgDaily;
    const totalPayment = last3MonthsPayment + departureMonthPayment;

    return {
      totalNet,
      totalDays,
      avgDaily,
      last3MonthsDays,
      last3MonthsPayment,
      daysInDepartureMonth,
      departureMonthPayment,
      totalPayment,
    };
  }, [monthlyData, daysWorkedInMonth]);

  const resetData = () => {
    setMonthlyData(Array.from({ length: 12 }, () => ({ netSalary: "", workDays: "" })));
    setDaysWorkedInMonth("");
  };

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
      relatedIds={["salary", "overtime", "dismissal"]}
    >
      <p className="text-sm text-muted mb-6">
        {pt.introText}
      </p>

      {/* Əsgərə gedəcəyi ay seçimi */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.departureMonth}</label>
          <select
            value={departureMonth}
            onChange={(e) => {
              setDepartureMonth(parseInt(e.target.value));
              resetData();
            }}
            className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.yearLabel}</label>
          <select
            value={departureYear}
            onChange={(e) => {
              setDepartureYear(parseInt(e.target.value));
              resetData();
            }}
            className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Əsgərə gedəcəyi ayda işlədiyi gün */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          {MONTH_NAMES[departureMonth]} {departureYear} {pt.daysWorkedLabel}
        </label>
        <input
          type="number"
          value={daysWorkedInMonth}
          onChange={(e) => setDaysWorkedInMonth(e.target.value)}
          placeholder={pt.daysWorkedPlaceholder}
          className="w-full p-3 rounded-xl border border-border bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>

      {/* Son 12 ay cədvəli */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.last12MonthsData}</label>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-foreground border-b border-border">{pt.monthHeader}</th>
                <th className="text-left p-3 font-medium text-foreground border-b border-border">{pt.netSalaryHeader}</th>
                <th className="text-left p-3 font-medium text-foreground border-b border-border">{pt.workDaysHeader}</th>
              </tr>
            </thead>
            <tbody>
              {monthLabels.map((label, i) => (
                <tr key={i} className={i >= 9 ? "bg-primary-light/30" : ""}>
                  <td className="p-3 border-b border-border text-foreground whitespace-nowrap">
                    {label.month} {label.year}
                    {i >= 9 && <span className="text-[10px] text-primary ml-1">{pt.last3MonthsTag}</span>}
                  </td>
                  <td className="p-2 border-b border-border">
                    <input
                      type="number"
                      value={monthlyData[i].netSalary}
                      onChange={(e) => {
                        const updated = [...monthlyData];
                        updated[i] = { ...updated[i], netSalary: e.target.value };
                        setMonthlyData(updated);
                      }}
                      placeholder="0.00"
                      className="w-full p-2 rounded-lg border border-border bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </td>
                  <td className="p-2 border-b border-border">
                    <input
                      type="number"
                      value={monthlyData[i].workDays}
                      onChange={(e) => {
                        const updated = [...monthlyData];
                        updated[i] = { ...updated[i], workDays: e.target.value };
                        setMonthlyData(updated);
                      }}
                      placeholder="0"
                      className="w-full p-2 rounded-lg border border-border bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nəticə */}
      {result ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted mb-3">{pt.calculationDetails}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{pt.totalNetSalary}</span>
                <span className="font-medium text-foreground">{formatMoney(result.totalNet)} ₼</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{pt.totalWorkDays}</span>
                <span className="font-medium text-foreground">{result.totalDays} {pt.daysUnit}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted">{pt.avgDailyWage}</span>
                <span className="font-semibold text-primary">{formatMoney(result.avgDaily)} ₼</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted mb-3">{pt.last3MonthsPayment}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{pt.last3MonthsWorkDays}</span>
                <span className="font-medium text-foreground">{result.last3MonthsDays} {pt.daysUnit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{result.last3MonthsDays} {pt.daysUnit} × {formatMoney(result.avgDaily)} ₼:</span>
                <span className="font-semibold text-foreground">{formatMoney(result.last3MonthsPayment)} ₼</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted mb-3">{MONTH_NAMES[departureMonth]} {pt.departureMonthPayment}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{pt.daysWorkedInMonth}</span>
                <span className="font-medium text-foreground">{result.daysInDepartureMonth} {pt.daysUnit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{result.daysInDepartureMonth} {pt.daysUnit} × {formatMoney(result.avgDaily)} ₼:</span>
                <span className="font-semibold text-foreground">{formatMoney(result.departureMonthPayment)} ₼</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
            <p className="text-sm opacity-90 mb-1">{pt.totalPaymentLabel}</p>
            <p className="text-3xl font-bold">{formatMoney(result.totalPayment)} ₼</p>
            <p className="text-xs opacity-75 mt-2">
              ({formatMoney(result.last3MonthsPayment)} ₼ {pt.last3MonthsAmount} + {formatMoney(result.departureMonthPayment)} ₼ {MONTH_NAMES[departureMonth]} {pt.monthAmount})
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
