"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const AZ_WEEKDAYS = ["Bazar", "Bazar ertesi", "Cersenbe axi", "Cersenbe", "Cursembe axi", "Cume", "Senbe"];
const AZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

interface ZodiacSign {
  name: string;
  symbol: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const zodiacSigns: ZodiacSign[] = [
  { name: "Oqtay (Qoc)", symbol: "♈", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: "Buga", symbol: "♉", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: "Ekizler", symbol: "♊", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: "Xerceng", symbol: "♋", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: "Sher", symbol: "♌", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: "Qiz", symbol: "♍", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: "Terezi", symbol: "♎", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: "Eqreb", symbol: "♏", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: "Oxatan", symbol: "♐", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: "Oqlaq", symbol: "♑", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: "Dolca", symbol: "♒", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: "Baliglar", symbol: "♓", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

function getZodiac(month: number, day: number): ZodiacSign {
  for (const sign of zodiacSigns) {
    if (sign.startMonth === sign.endMonth) {
      if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) return sign;
    } else if (sign.endMonth < sign.startMonth) {
      // Capricorn wraps around
      if ((month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay)) return sign;
    } else {
      if ((month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay)) return sign;
    }
  }
  return zodiacSigns[0];
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");

  const result = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();

    if (birth >= today || isNaN(birth.getTime())) return null;

    // Calculate exact age
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Total calculations
    const diffMs = today.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // Next birthday
    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= today) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const nextAge = years + (months > 0 || days > 0 ? 1 : 1);

    // Weekday of birth
    const birthWeekday = AZ_WEEKDAYS[birth.getDay()];

    // Zodiac
    const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      daysUntilBirthday,
      nextAge: years + 1,
      birthWeekday,
      zodiac,
      birthFormatted: `${birth.getDate()} ${AZ_MONTHS[birth.getMonth()]} ${birth.getFullYear()}`,
    };
  }, [birthDate]);

  return (
    <CalculatorLayout
      title="Yas hesablayıcısı"
      description="Dogum tarixinizi daxil edin — deqiq yasinizi, yasamis gunlerinizi ve novbeti ad gununuzu oyrenim."
      breadcrumbs={[
        { label: "Gundelik", href: "/?category=daily" },
        { label: "Yas hesablayıcısı" },
      ]}
      formulaTitle="Yas nece hesablanir?"
      formulaContent={`Deqiq yas = Bu gunun tarixi - Dogum tarixi

Hesablamaya il, ay ve gun daxildir. Kecen gunler, hefteler ve saatlar avtomatik hesablanir.

Burcler (zodiak) dogum tarixine gore mueyyen edilir.
Azerbaycanda en cox istifade olunan burc sistemi Qerb zodiak sistemidir.`}
      relatedIds={["date-difference", "pregnancy", "age", "timezone"]}
    >
      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Dogum tarixiniz
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-2">Sizin yasiniz</p>
            <p className="text-4xl font-bold">
              {result.years} il, {result.months} ay, {result.days} gun
            </p>
            <p className="text-sm text-blue-200 mt-2">{result.birthFormatted}, {result.birthWeekday}</p>
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
            </div>
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">Umumi saat</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.totalHours)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">Umumi deqiqe</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.totalMinutes)}</p>
            </div>
          </div>

          {/* Birthday & Zodiac */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Novbeti ad gunu</p>
              <p className="text-3xl font-bold text-amber-700">{result.daysUntilBirthday}</p>
              <p className="text-sm text-amber-600 mt-1">gun sonra ({result.nextAge} yasina gireceksiniz)</p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
              <p className="text-sm text-purple-600 mb-1">Burcunuz</p>
              <p className="text-4xl mb-1">{result.zodiac.symbol}</p>
              <p className="text-xl font-bold text-purple-700">{result.zodiac.name}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Etrafli melumat</h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Dogum tarixi</span>
                <span className="text-sm font-medium text-foreground">{result.birthFormatted}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Dogum gunu</span>
                <span className="text-sm font-medium text-foreground">{result.birthWeekday}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Yas (il)</span>
                <span className="text-sm font-medium text-foreground">{result.years} il</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Yas (ay)</span>
                <span className="text-sm font-medium text-foreground">{result.years * 12 + result.months} ay</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Burc</span>
                <span className="text-sm font-medium text-foreground">{result.zodiac.symbol} {result.zodiac.name}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🎂</span>
          <p>Neticeni gormek ucun dogum tarixinizi daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
