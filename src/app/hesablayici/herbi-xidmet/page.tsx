"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
  "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MilitaryServiceCalculator() {
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
  }, [departureMonth, departureYear]);

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
      title="Hərbi xidmət ödənişi hesablayıcısı"
      description="Hərbi xidmətə gedən işçiyə ödəniləcək məbləği hesablayın — son 12 ayın net maaş və iş günlərinə əsasən."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Hərbi xidmət ödənişi" },
      ]}
      formulaTitle="Hərbi xidmət ödənişi necə hesablanır?"
      formulaContent={`Əmək Məcəlləsi, Maddə 74 — Hərbi xidmətə çağırılan işçiyə ödəniş:

1. Orta günlük əmək haqqı:
   Son 12 ayın cəmi net maaşı / Son 12 ayın cəmi iş günü

2. Son 3 ayın ödənişi:
   Son 3 ayın cəmi iş günü × Orta günlük əmək haqqı

3. Əsgərə gedəcəyi ayda işlədiyi günlərin ödənişi:
   İşlədiyi gün sayı × Orta günlük əmək haqqı

4. Ümumi ödəniş:
   Son 3 ayın ödənişi + Gedəcəyi ayın ödənişi`}
      relatedIds={["salary", "overtime", "dismissal"]}
    >
      <p className="text-sm text-muted mb-6">
        Hərbi xidmətə gedən işçiyə ödəniləcək məbləği hesablayın. Son 12 ayın net maaş və iş günlərini daxil edin.
      </p>

      {/* Əsgərə gedəcəyi ay seçimi */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Əsgərə gedəcəyi ay</label>
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
          <label className="block text-sm font-medium text-foreground mb-2">İl</label>
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
          {MONTH_NAMES[departureMonth]} {departureYear} ayında işlədiyi gün sayı
        </label>
        <input
          type="number"
          value={daysWorkedInMonth}
          onChange={(e) => setDaysWorkedInMonth(e.target.value)}
          placeholder="Məs: 15"
          className="w-full p-3 rounded-xl border border-border bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>

      {/* Son 12 ay cədvəli */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Son 12 ayın məlumatları</label>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-foreground border-b border-border">Ay</th>
                <th className="text-left p-3 font-medium text-foreground border-b border-border">Net maaş (₼)</th>
                <th className="text-left p-3 font-medium text-foreground border-b border-border">İş günü</th>
              </tr>
            </thead>
            <tbody>
              {monthLabels.map((label, i) => (
                <tr key={i} className={i >= 9 ? "bg-primary-light/30" : ""}>
                  <td className="p-3 border-b border-border text-foreground whitespace-nowrap">
                    {label.month} {label.year}
                    {i >= 9 && <span className="text-[10px] text-primary ml-1">(son 3 ay)</span>}
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
            <h3 className="text-sm font-medium text-muted mb-3">Hesablama detalları</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Son 12 ayın cəmi net maaşı:</span>
                <span className="font-medium text-foreground">{formatMoney(result.totalNet)} ₼</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Son 12 ayın cəmi iş günü:</span>
                <span className="font-medium text-foreground">{result.totalDays} gün</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted">Orta günlük əmək haqqı:</span>
                <span className="font-semibold text-primary">{formatMoney(result.avgDaily)} ₼</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted mb-3">Son 3 ayın ödənişi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Son 3 ayın cəmi iş günü:</span>
                <span className="font-medium text-foreground">{result.last3MonthsDays} gün</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{result.last3MonthsDays} gün × {formatMoney(result.avgDaily)} ₼:</span>
                <span className="font-semibold text-foreground">{formatMoney(result.last3MonthsPayment)} ₼</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted mb-3">{MONTH_NAMES[departureMonth]} ayının ödənişi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">İşlədiyi gün sayı:</span>
                <span className="font-medium text-foreground">{result.daysInDepartureMonth} gün</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{result.daysInDepartureMonth} gün × {formatMoney(result.avgDaily)} ₼:</span>
                <span className="font-semibold text-foreground">{formatMoney(result.departureMonthPayment)} ₼</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
            <p className="text-sm opacity-90 mb-1">İşçiyə ödəniləcək ümumi məbləğ:</p>
            <p className="text-3xl font-bold">{formatMoney(result.totalPayment)} ₼</p>
            <p className="text-xs opacity-75 mt-2">
              ({formatMoney(result.last3MonthsPayment)} ₼ son 3 ay + {formatMoney(result.departureMonthPayment)} ₼ {MONTH_NAMES[departureMonth]} ayı)
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <p>Nəticəni görmək üçün son 12 ayın məlumatlarını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
