"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Mode = "difference" | "add-subtract";

const AZ_WEEKDAYS = ["Bazar", "Bazar ertesi", "Cersenbe axi", "Cersenbe", "Cursembe axi", "Cume", "Senbe"];
const AZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

function formatDateAz(date: Date): string {
  return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}, ${AZ_WEEKDAYS[date.getDay()]}`;
}

export default function DateDifferenceCalculator() {
  const [mode, setMode] = useState<Mode>("difference");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  const result = useMemo(() => {
    if (mode === "difference") {
      if (!date1 || !date2) return null;
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

      const start = d1 < d2 ? d1 : d2;
      const end = d1 < d2 ? d2 : d1;

      const diffMs = end.getTime() - start.getTime();
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();

      // Exact years, months, days
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      return {
        type: "difference" as const,
        startDate: formatDateAz(start),
        endDate: formatDateAz(end),
        years,
        months,
        days,
        totalDays,
        totalWeeks,
        remainingDays,
        totalHours,
        totalMinutes,
        totalMonths,
      };
    }

    if (mode === "add-subtract") {
      if (!baseDate || !daysToAdd) return null;
      const base = new Date(baseDate);
      const numDays = parseInt(daysToAdd);
      if (isNaN(base.getTime()) || isNaN(numDays) || numDays < 0) return null;

      const resultDate = new Date(base);
      if (operation === "add") {
        resultDate.setDate(resultDate.getDate() + numDays);
      } else {
        resultDate.setDate(resultDate.getDate() - numDays);
      }

      return {
        type: "add-subtract" as const,
        baseDate: formatDateAz(base),
        resultDate: formatDateAz(resultDate),
        numDays,
        operation,
        resultDateObj: resultDate,
      };
    }

    return null;
  }, [mode, date1, date2, baseDate, daysToAdd, operation]);

  return (
    <CalculatorLayout
      title="Tarix ferqi hesablayıcısı"
      description="Iki tarix arasinda ferqi hesablayin ve ya tarixe gun elave edin / cixin."
      breadcrumbs={[
        { label: "Gundelik", href: "/?category=daily" },
        { label: "Tarix ferqi hesablayıcısı" },
      ]}
      formulaTitle="Tarix ferqi nece hesablanir?"
      formulaContent={`Iki tarix arasinda ferq millisaniyeler hesablanir ve sonra gunlere, heftelere, aylara cevrilir.

Ferq = Son tarix - Baslangic tarix

Neticeler:
- Deqiq yas formati: X il, Y ay, Z gun
- Umumi gunler, hefteler, saatlar
- Ayliq ferq

Gun elave etmek / cixmaq:
Tarixe mueyyen sayli gun elave edile ve ya cixila biler.
Meseleln: 1 Yanvar 2024 + 90 gun = 31 Mart 2024`}
      relatedIds={["age", "timezone", "pregnancy", "date-difference"]}
    >
      {/* Mode Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setMode("difference")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "difference" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Tarix ferqi
        </button>
        <button
          onClick={() => setMode("add-subtract")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "add-subtract" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Gun elave et / cix
        </button>
      </div>

      {/* Inputs */}
      <div className="mb-8">
        {mode === "difference" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Baslangic tarixi</label>
              <input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Son tarix</label>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Baslangic tarixi</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Emeliyyat</label>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setOperation("add")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      operation === "add" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
                    }`}
                  >
                    + Elave et
                  </button>
                  <button
                    onClick={() => setOperation("subtract")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      operation === "subtract" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
                    }`}
                  >
                    - Cix
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Gun sayi</label>
                <input
                  type="number"
                  value={daysToAdd}
                  onChange={(e) => setDaysToAdd(e.target.value)}
                  placeholder="30"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {result.type === "difference" && (
            <>
              {/* Main Result */}
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-2">Tarixler arasindaki ferq</p>
                <p className="text-3xl font-bold">
                  {result.years > 0 && `${result.years} il, `}{result.months > 0 && `${result.months} ay, `}{result.days} gun
                </p>
                <p className="text-sm text-blue-200 mt-2">{result.startDate} — {result.endDate}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">Umumi gun</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalDays)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">Umumi hefte</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalWeeks)}</p>
                  {result.remainingDays > 0 && <p className="text-xs text-muted">+ {result.remainingDays} gun</p>}
                </div>
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">Umumi ay</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalMonths)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted mb-1">Umumi saat</p>
                  <p className="text-lg font-bold text-foreground">{fmt(result.totalHours)}</p>
                </div>
              </div>

              {/* Details Table */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">Etrafli melumat</h3>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Baslangic</span>
                    <span className="text-sm font-medium text-foreground">{result.startDate}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Son</span>
                    <span className="text-sm font-medium text-foreground">{result.endDate}</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Deqiq ferq</span>
                    <span className="text-sm font-medium text-foreground">{result.years} il, {result.months} ay, {result.days} gun</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Gunlerle</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.totalDays)} gun</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Saatlarla</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.totalHours)} saat</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Deqiqelerle</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.totalMinutes)} deq.</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {result.type === "add-subtract" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">Baslangic tarixi</p>
                  <p className="text-lg font-bold text-foreground">{result.baseDate}</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">
                    {result.operation === "add" ? `+${result.numDays} gun sonra` : `-${result.numDays} gun evvel`}
                  </p>
                  <p className="text-lg font-bold">{result.resultDate}</p>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📆</span>
          <p>Neticeni gormek ucun tarixleri daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
