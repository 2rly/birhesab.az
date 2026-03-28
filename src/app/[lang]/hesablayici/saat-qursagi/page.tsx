"use client";

import { useState, useEffect } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface CityTimezone {
  name: Record<Lang, string>;
  country: Record<Lang, string>;
  timezone: string;
  emoji: string;
}

const cities: CityTimezone[] = [
  { name: { az: "Bakı", en: "Baku", ru: "Баку" }, country: { az: "Azərbaycan", en: "Azerbaijan", ru: "Азербайджан" }, timezone: "Asia/Baku", emoji: "🇦🇿" },
  { name: { az: "London", en: "London", ru: "Лондон" }, country: { az: "Böyük Britaniya", en: "United Kingdom", ru: "Великобритания" }, timezone: "Europe/London", emoji: "🇬🇧" },
  { name: { az: "Nyu-York", en: "New York", ru: "Нью-Йорк" }, country: { az: "ABŞ", en: "USA", ru: "США" }, timezone: "America/New_York", emoji: "🇺🇸" },
  { name: { az: "İstanbul", en: "Istanbul", ru: "Стамбул" }, country: { az: "Türkiyə", en: "Turkey", ru: "Турция" }, timezone: "Europe/Istanbul", emoji: "🇹🇷" },
  { name: { az: "Dubay", en: "Dubai", ru: "Дубай" }, country: { az: "BƏƏ", en: "UAE", ru: "ОАЭ" }, timezone: "Asia/Dubai", emoji: "🇦🇪" },
  { name: { az: "Berlin", en: "Berlin", ru: "Берлин" }, country: { az: "Almaniya", en: "Germany", ru: "Германия" }, timezone: "Europe/Berlin", emoji: "🇩🇪" },
  { name: { az: "Moskva", en: "Moscow", ru: "Москва" }, country: { az: "Rusiya", en: "Russia", ru: "Россия" }, timezone: "Europe/Moscow", emoji: "🇷🇺" },
  { name: { az: "Tokio", en: "Tokyo", ru: "Токио" }, country: { az: "Yaponiya", en: "Japan", ru: "Япония" }, timezone: "Asia/Tokyo", emoji: "🇯🇵" },
  { name: { az: "Sidney", en: "Sydney", ru: "Сидней" }, country: { az: "Avstraliya", en: "Australia", ru: "Австралия" }, timezone: "Australia/Sydney", emoji: "🇦🇺" },
];

const pageTranslations = {
  az: {
    title: "Saat qurşağı çevirici",
    description: "Bakı və dünya şəhərlərinin canlı vaxtını izləyin.",
    breadcrumbCategory: "Gündəlik",
    breadcrumbLabel: "Saat qurşağı çevirici",
    formulaTitle: "Saat qurşaqları necə işləyir?",
    formulaContent: `Saat qurşaqları GMT (Greenwich Mean Time) əsasında müəyyən olunur.

Bakı vaxtı: GMT+4

Əsas şəhərlərin vaxt fərqləri (Bakıya nisbətən):
• Nyu-York: -8 saat (GMT-4, yay vaxtı)
• London: -3 saat (GMT+1, yay vaxtı)
• Berlin: -2 saat (GMT+2, yay vaxtı)
• Moskva / İstanbul: -1 saat (GMT+3)
• Dubay: 0 saat (GMT+4)
• Tokio: +5 saat (GMT+9)
• Sidney: +7 saat (GMT+11)

Qeyd: Azərbaycan 2016-cı ildən yay vaxt keçidini ləğv edib. Bəzi ölkələrdə yay/qış vaxt keçidləri tətbiq olunur.`,
    allCityTimes: "Bütün şəhərlərin vaxtı",
    note: "Qeyd:",
    noteText: "Vaxtlar avtomatik olaraq yay/qış vaxt keçidlərini (DST) nəzərə alır. Azərbaycan 2016-cı ildən yay vaxt keçidini ləğv edib.",
  },
  en: {
    title: "Time Zone Converter",
    description: "Track live time in Baku and world cities.",
    breadcrumbCategory: "Daily",
    breadcrumbLabel: "Time zone converter",
    formulaTitle: "How do time zones work?",
    formulaContent: `Time zones are determined based on GMT (Greenwich Mean Time).

Baku time: GMT+4

Time differences of major cities (relative to Baku):
• New York: -8 hours (GMT-4, summer time)
• London: -3 hours (GMT+1, summer time)
• Berlin: -2 hours (GMT+2, summer time)
• Moscow / Istanbul: -1 hour (GMT+3)
• Dubai: 0 hours (GMT+4)
• Tokyo: +5 hours (GMT+9)
• Sydney: +7 hours (GMT+11)

Note: Azerbaijan abolished daylight saving time in 2016. Some countries still observe DST.`,
    allCityTimes: "All city times",
    note: "Note:",
    noteText: "Times automatically account for daylight saving time (DST) transitions. Azerbaijan abolished DST in 2016.",
  },
  ru: {
    title: "Конвертер часовых поясов",
    description: "Отслеживайте время в Баку и городах мира в реальном времени.",
    breadcrumbCategory: "Повседневное",
    breadcrumbLabel: "Конвертер часовых поясов",
    formulaTitle: "Как работают часовые пояса?",
    formulaContent: `Часовые пояса определяются на основе GMT (среднее время по Гринвичу).

Время Баку: GMT+4

Разница во времени основных городов (относительно Баку):
• Нью-Йорк: -8 часов (GMT-4, летнее время)
• Лондон: -3 часа (GMT+1, летнее время)
• Берлин: -2 часа (GMT+2, летнее время)
• Москва / Стамбул: -1 час (GMT+3)
• Дубай: 0 часов (GMT+4)
• Токио: +5 часов (GMT+9)
• Сидней: +7 часов (GMT+11)

Примечание: Азербайджан отменил переход на летнее время в 2016 году. В некоторых странах до сих пор действует переход на летнее/зимнее время.`,
    allCityTimes: "Время всех городов",
    note: "Примечание:",
    noteText: "Время автоматически учитывает переход на летнее/зимнее время (DST). Азербайджан отменил DST в 2016 году.",
  },
};

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("az", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(date);
}

function formatDate(date: Date, timezone: string, lang: Lang): string {
  const locale = lang === "az" ? "az" : lang === "ru" ? "ru" : "en";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(date);
}

function getGmtOffset(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  return offset.replace("GMT", "GMT");
}

function getTimeOfDayIcon(date: Date, timezone: string): string {
  const hour = parseInt(
    new Intl.DateTimeFormat("en", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    }).format(date),
    10
  );
  if (hour >= 22 || hour < 6) return "🌙";
  if (hour >= 18) return "🌆";
  if (hour >= 12) return "☀️";
  return "🌅";
}

export default function TimezoneConverter() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=daily" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["date-difference", "age", "percentage"]}
    >
      {!now ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cities.map((city) => (
            <div
              key={city.timezone}
              className="rounded-2xl p-5 text-center bg-gray-50 border border-border animate-pulse"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xl">{city.emoji}</span>
                <p className="text-sm font-medium text-foreground">{city.name[lang]}</p>
              </div>
              <div className="h-9 bg-gray-200 rounded-lg mx-auto w-36 mb-2" />
              <div className="h-4 bg-gray-200 rounded mx-auto w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bakı */}
          <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-primary to-primary-dark text-white">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">🇦🇿</span>
              <p className="text-lg font-semibold text-blue-200">{cities[0].name[lang]}</p>
            </div>
            <p className="text-5xl sm:text-6xl font-bold tracking-tight tabular-nums">
              {formatTime(now, "Asia/Baku")}
            </p>
            <p className="text-sm text-blue-200 mt-2">
              {formatDate(now, "Asia/Baku", lang)} &middot; {getGmtOffset(now, "Asia/Baku")}
            </p>
          </div>

          {/* Other cities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cities
              .filter((c) => c.timezone !== "Asia/Baku")
              .map((city) => {
                const hour = parseInt(
                  new Intl.DateTimeFormat("en", {
                    hour: "numeric",
                    hour12: false,
                    timeZone: city.timezone,
                  }).format(now),
                  10
                );
                const isNight = hour >= 22 || hour < 6;

                return (
                  <div
                    key={city.timezone}
                    className={`rounded-2xl p-5 text-center transition-all ${
                      isNight
                        ? "bg-gray-800 text-white"
                        : "bg-gray-50 border border-border"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg">{city.emoji}</span>
                      <p
                        className={`text-sm font-medium ${
                          isNight ? "text-gray-300" : "text-foreground"
                        }`}
                      >
                        {city.name[lang]}
                      </p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums flex items-center justify-center gap-2">
                      <span className="text-xl">{getTimeOfDayIcon(now, city.timezone)}</span>
                      {formatTime(now, city.timezone)}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isNight ? "text-gray-400" : "text-muted"
                      }`}
                    >
                      {formatDate(now, city.timezone, lang)}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNight ? "text-gray-500" : "text-muted"
                      }`}
                    >
                      {getGmtOffset(now, city.timezone)}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">{pt.allCityTimes}</h3>
            </div>
            <div className="divide-y divide-border">
              {cities.map((city) => (
                <div
                  key={city.timezone}
                  className={`flex items-center justify-between px-5 py-3 ${
                    city.timezone === "Asia/Baku" ? "bg-primary-light" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{city.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{city.name[lang]}</p>
                      <p className="text-xs text-muted">
                        {city.country[lang]} ({getGmtOffset(now, city.timezone)})
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span>{getTimeOfDayIcon(now, city.timezone)}</span>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {formatTime(now, city.timezone)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.note}</span> {pt.noteText}
            </p>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
