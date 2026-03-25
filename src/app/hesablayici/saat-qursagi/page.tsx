"use client";

import { useState, useEffect } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

interface CityTimezone {
  name: string;
  country: string;
  timezone: string;
  emoji: string;
}

const cities: CityTimezone[] = [
  { name: "Bakı", country: "Azərbaycan", timezone: "Asia/Baku", emoji: "🇦🇿" },
  { name: "London", country: "Böyük Britaniya", timezone: "Europe/London", emoji: "🇬🇧" },
  { name: "Nyu-York", country: "ABŞ", timezone: "America/New_York", emoji: "🇺🇸" },
  { name: "İstanbul", country: "Türkiyə", timezone: "Europe/Istanbul", emoji: "🇹🇷" },
  { name: "Dubay", country: "BƏƏ", timezone: "Asia/Dubai", emoji: "🇦🇪" },
  { name: "Berlin", country: "Almaniya", timezone: "Europe/Berlin", emoji: "🇩🇪" },
  { name: "Moskva", country: "Rusiya", timezone: "Europe/Moscow", emoji: "🇷🇺" },
  { name: "Tokio", country: "Yaponiya", timezone: "Asia/Tokyo", emoji: "🇯🇵" },
  { name: "Sidney", country: "Avstraliya", timezone: "Australia/Sydney", emoji: "🇦🇺" },
];

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("az", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(date);
}

function formatDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("az", {
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
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CalculatorLayout
      title="Saat qurşağı çevirici"
      description="Bakı və dünya şəhərlərinin canlı vaxtını izləyin."
      breadcrumbs={[
        { label: "Gündəlik", href: "/?category=daily" },
        { label: "Saat qurşağı çevirici" },
      ]}
      formulaTitle="Saat qurşaqları necə işləyir?"
      formulaContent={`Saat qurşaqları GMT (Greenwich Mean Time) əsasında müəyyən olunur.

Bakı vaxtı: GMT+4

Əsas şəhərlərin vaxt fərqləri (Bakıya nisbətən):
• Nyu-York: -8 saat (GMT-4, yay vaxtı)
• London: -3 saat (GMT+1, yay vaxtı)
• Berlin: -2 saat (GMT+2, yay vaxtı)
• Moskva / İstanbul: -1 saat (GMT+3)
• Dubay: 0 saat (GMT+4)
• Tokio: +5 saat (GMT+9)
• Sidney: +7 saat (GMT+11)

Qeyd: Azərbaycan 2016-cı ildən yay vaxt keçidini ləğv edib. Bəzi ölkələrdə yay/qış vaxt keçidləri tətbiq olunur.`}
      relatedIds={["date-difference", "age", "percentage"]}
    >
      {!now ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cities.map((city) => (
            <div
              key={city.name}
              className="rounded-2xl p-5 text-center bg-gray-50 border border-border animate-pulse"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xl">{city.emoji}</span>
                <p className="text-sm font-medium text-foreground">{city.name}</p>
              </div>
              <div className="h-9 bg-gray-200 rounded-lg mx-auto w-36 mb-2" />
              <div className="h-4 bg-gray-200 rounded mx-auto w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bakı — böyük saat */}
          <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-primary to-primary-dark text-white">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">🇦🇿</span>
              <p className="text-lg font-semibold text-blue-200">Bakı</p>
            </div>
            <p className="text-5xl sm:text-6xl font-bold tracking-tight tabular-nums">
              {formatTime(now, "Asia/Baku")}
            </p>
            <p className="text-sm text-blue-200 mt-2">
              {formatDate(now, "Asia/Baku")} &middot; {getGmtOffset(now, "Asia/Baku")}
            </p>
          </div>

          {/* Digər şəhərlər */}
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
                    key={city.name}
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
                        {city.name}
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
                      {formatDate(now, city.timezone)}
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

          {/* Cədvəl */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Bütün şəhərlərin vaxtı</h3>
            </div>
            <div className="divide-y divide-border">
              {cities.map((city) => (
                <div
                  key={city.name}
                  className={`flex items-center justify-between px-5 py-3 ${
                    city.timezone === "Asia/Baku" ? "bg-primary-light" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{city.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{city.name}</p>
                      <p className="text-xs text-muted">
                        {city.country} ({getGmtOffset(now, city.timezone)})
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

          {/* Qeyd */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Qeyd:</span> Vaxtlar avtomatik olaraq yay/qış
              vaxt keçidlərini (DST) nəzərə alır. Azərbaycan 2016-cı ildən yay vaxt keçidini
              ləğv edib.
            </p>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
