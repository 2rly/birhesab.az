"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const AZ_WEEKDAYS_TR: Record<Lang, string[]> = {
  az: ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
};

const AZ_MONTHS_TR: Record<Lang, string[]> = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

interface ZodiacSign {
  name: Record<Lang, string>;
  symbol: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const zodiacSigns: ZodiacSign[] = [
  { name: { az: "Oqtay (Qoç)", en: "Aries", ru: "Овен" }, symbol: "♈", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: { az: "Buğa", en: "Taurus", ru: "Телец" }, symbol: "♉", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: { az: "Əkizlər", en: "Gemini", ru: "Близнецы" }, symbol: "♊", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: { az: "Xərçəng", en: "Cancer", ru: "Рак" }, symbol: "♋", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: { az: "Şir", en: "Leo", ru: "Лев" }, symbol: "♌", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: { az: "Qız", en: "Virgo", ru: "Дева" }, symbol: "♍", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: { az: "Tərəzi", en: "Libra", ru: "Весы" }, symbol: "♎", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: { az: "Əqrəb", en: "Scorpio", ru: "Скорпион" }, symbol: "♏", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: { az: "Oxatan", en: "Sagittarius", ru: "Стрелец" }, symbol: "♐", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: { az: "Oğlaq", en: "Capricorn", ru: "Козерог" }, symbol: "♑", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: { az: "Dolça", en: "Aquarius", ru: "Водолей" }, symbol: "♒", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: { az: "Balıqlar", en: "Pisces", ru: "Рыбы" }, symbol: "♓", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
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

const pageTranslations = {
  az: {
    title: "Yaş hesablayıcısı",
    description: "Doğum tarixinizi daxil edin — dəqiq yaşınızı, yaşamış günlərinizi və növbəti ad gününüzü öyrənin.",
    breadcrumbCategory: "Gündəlik",
    formulaTitle: "Yaş necə hesablanır?",
    formulaContent: `Dəqiq yaş = Bu günün tarixi − Doğum tarixi

Hesablamaya il, ay və gün daxildir. Keçən günlər, həftələr və saatlar avtomatik hesablanır.

Bürcləer (zodiak) doğum tarixinə görə müəyyən edilir.
Azərbaycanda ən çox istifadə olunan bürc sistemi Qərb zodiak sistemidir.`,
    birthDateLabel: "Doğum tarixiniz",
    yourAge: "Sizin yaşınız",
    year: "il",
    month: "ay",
    day: "gün",
    totalDays: "Ümumi gün",
    totalWeeks: "Ümumi həftə",
    totalHours: "Ümumi saat",
    totalMinutes: "Ümumi dəqiqə",
    nextBirthday: "Növbəti ad günü",
    daysLater: "gün sonra",
    willTurnAge: "yaşına girəcəksiniz",
    yourZodiac: "Bürcünüz",
    detailedInfo: "Ətraflı məlumat",
    birthDate: "Doğum tarixi",
    birthDay: "Doğum günü",
    ageYears: "Yaş (il)",
    ageMonths: "Yaş (ay)",
    zodiac: "Bürc",
    emptyStateText: "Nəticəni görmək üçün doğum tarixinizi daxil edin.",
  },
  en: {
    title: "Age Calculator",
    description: "Enter your date of birth — find out your exact age, days lived, and next birthday.",
    breadcrumbCategory: "Daily",
    formulaTitle: "How is age calculated?",
    formulaContent: `Exact age = Today's date − Date of birth

The calculation includes years, months, and days. Elapsed days, weeks, and hours are calculated automatically.

Zodiac signs are determined based on the date of birth.
The most commonly used zodiac system in Azerbaijan is the Western zodiac system.`,
    birthDateLabel: "Your date of birth",
    yourAge: "Your age",
    year: "years",
    month: "months",
    day: "days",
    totalDays: "Total days",
    totalWeeks: "Total weeks",
    totalHours: "Total hours",
    totalMinutes: "Total minutes",
    nextBirthday: "Next birthday",
    daysLater: "days away",
    willTurnAge: "you will turn",
    yourZodiac: "Your zodiac sign",
    detailedInfo: "Detailed information",
    birthDate: "Date of birth",
    birthDay: "Day of birth",
    ageYears: "Age (years)",
    ageMonths: "Age (months)",
    zodiac: "Zodiac sign",
    emptyStateText: "Enter your date of birth to see the result.",
  },
  ru: {
    title: "Калькулятор возраста",
    description: "Введите дату рождения — узнайте свой точный возраст, прожитые дни и следующий день рождения.",
    breadcrumbCategory: "Повседневные",
    formulaTitle: "Как рассчитывается возраст?",
    formulaContent: `Точный возраст = Сегодняшняя дата − Дата рождения

Расчёт включает годы, месяцы и дни. Прошедшие дни, недели и часы рассчитываются автоматически.

Знаки зодиака определяются по дате рождения.
В Азербайджане наиболее распространена западная зодиакальная система.`,
    birthDateLabel: "Дата вашего рождения",
    yourAge: "Ваш возраст",
    year: "лет",
    month: "мес.",
    day: "дн.",
    totalDays: "Всего дней",
    totalWeeks: "Всего недель",
    totalHours: "Всего часов",
    totalMinutes: "Всего минут",
    nextBirthday: "Следующий день рождения",
    daysLater: "дней осталось",
    willTurnAge: "вам исполнится",
    yourZodiac: "Ваш знак зодиака",
    detailedInfo: "Подробная информация",
    birthDate: "Дата рождения",
    birthDay: "День рождения",
    ageYears: "Возраст (лет)",
    ageMonths: "Возраст (мес.)",
    zodiac: "Знак зодиака",
    emptyStateText: "Введите дату рождения, чтобы увидеть результат.",
  },
};

export default function AgeCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const weekdays = AZ_WEEKDAYS_TR[lang];
  const months = AZ_MONTHS_TR[lang];

  const [birthDate, setBirthDate] = useState("");

  const result = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();

    if (birth >= today || isNaN(birth.getTime())) return null;

    // Calculate exact age
    let years = today.getFullYear() - birth.getFullYear();
    let monthsDiff = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      monthsDiff--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (monthsDiff < 0) {
      years--;
      monthsDiff += 12;
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

    // Weekday of birth
    const birthWeekdayIdx = birth.getDay();

    // Zodiac
    const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());

    return {
      years,
      months: monthsDiff,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      daysUntilBirthday,
      nextAge: years + 1,
      birthWeekdayIdx,
      zodiac,
      birthMonth: birth.getMonth(),
      birthDay: birth.getDate(),
      birthYear: birth.getFullYear(),
    };
  }, [birthDate]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=daily" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["date-difference", "pregnancy", "age", "timezone"]}
    >
      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          {pt.birthDateLabel}
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
            <p className="text-sm text-blue-200 mb-2">{pt.yourAge}</p>
            <p className="text-4xl font-bold">
              {result.years} {pt.year}, {result.months} {pt.month}, {result.days} {pt.day}
            </p>
            <p className="text-sm text-blue-200 mt-2">{result.birthDay} {months[result.birthMonth]} {result.birthYear}, {weekdays[result.birthWeekdayIdx]}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">{pt.totalDays}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.totalDays)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">{pt.totalWeeks}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.totalWeeks)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">{pt.totalHours}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.totalHours)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">{pt.totalMinutes}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.totalMinutes)}</p>
            </div>
          </div>

          {/* Birthday & Zodiac */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.nextBirthday}</p>
              <p className="text-3xl font-bold text-amber-700">{result.daysUntilBirthday}</p>
              <p className="text-sm text-amber-600 mt-1">{pt.daysLater} ({result.nextAge} {pt.willTurnAge})</p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
              <p className="text-sm text-purple-600 mb-1">{pt.yourZodiac}</p>
              <p className="text-4xl mb-1">{result.zodiac.symbol}</p>
              <p className="text-xl font-bold text-purple-700">{result.zodiac.name[lang]}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">{pt.detailedInfo}</h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.birthDate}</span>
                <span className="text-sm font-medium text-foreground">{result.birthDay} {months[result.birthMonth]} {result.birthYear}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.birthDay}</span>
                <span className="text-sm font-medium text-foreground">{weekdays[result.birthWeekdayIdx]}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.ageYears}</span>
                <span className="text-sm font-medium text-foreground">{result.years} {pt.year}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.ageMonths}</span>
                <span className="text-sm font-medium text-foreground">{result.years * 12 + result.months} {pt.month}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.zodiac}</span>
                <span className="text-sm font-medium text-foreground">{result.zodiac.symbol} {result.zodiac.name[lang]}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🎂</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
