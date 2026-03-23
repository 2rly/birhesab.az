"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

interface CityTimezone {
  name: string;
  country: string;
  offset: number; // GMT offset in hours
  emoji: string;
}

const cities: CityTimezone[] = [
  { name: "Baki", country: "Azerbaycan", offset: 4, emoji: "🇦🇿" },
  { name: "Nyu-York", country: "ABSh", offset: -5, emoji: "🇺🇸" },
  { name: "London", country: "Boyuk Britaniya", offset: 0, emoji: "🇬🇧" },
  { name: "Berlin", country: "Almaniya", offset: 1, emoji: "🇩🇪" },
  { name: "Moskva", country: "Rusiya", offset: 3, emoji: "🇷🇺" },
  { name: "Istanbul", country: "Turkiye", offset: 3, emoji: "🇹🇷" },
  { name: "Dubay", country: "BAE", offset: 4, emoji: "🇦🇪" },
  { name: "Tokio", country: "Yaponiya", offset: 9, emoji: "🇯🇵" },
  { name: "Sidney", country: "Avstraliya", offset: 11, emoji: "🇦🇺" },
];

function fmt(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatTime(hours: number, minutes: number): string {
  // Normalize hours to 0-23
  let h = ((hours % 24) + 24) % 24;
  return `${fmt(h)}:${fmt(minutes)}`;
}

function getDayLabel(hoursDiff: number): string {
  if (hoursDiff >= 24) return "(+1 gun)";
  if (hoursDiff < 0) return "(-1 gun)";
  return "";
}

export default function TimezoneConverter() {
  const [inputTime, setInputTime] = useState("12:00");
  const [sourceCity, setSourceCity] = useState(0); // index of Baku

  const result = useMemo(() => {
    if (!inputTime) return null;
    const [hours, minutes] = inputTime.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const source = cities[sourceCity];
    const sourceOffsetHours = source.offset;

    // Convert to UTC first
    const utcHours = hours - sourceOffsetHours;

    // Calculate time for each city
    const conversions = cities.map((city) => {
      const cityHours = utcHours + city.offset;
      const normalizedHours = ((cityHours % 24) + 24) % 24;
      const dayDiff = Math.floor((cityHours - normalizedHours) / 24 + (cityHours < 0 ? -1 : 0));

      let dayLabel = "";
      if (cityHours >= 24) dayLabel = "(+1 gun)";
      else if (cityHours < 0) dayLabel = "(-1 gun)";

      const isNight = normalizedHours < 6 || normalizedHours >= 22;
      const isEvening = normalizedHours >= 18 && normalizedHours < 22;
      const isMorning = normalizedHours >= 6 && normalizedHours < 12;

      let timeOfDay = "☀️";
      if (isNight) timeOfDay = "🌙";
      else if (isEvening) timeOfDay = "🌆";
      else if (isMorning) timeOfDay = "🌅";

      const diffFromSource = city.offset - source.offset;

      return {
        ...city,
        time: formatTime(cityHours, minutes),
        dayLabel,
        isNight,
        timeOfDay,
        diffFromSource,
        isSource: city.name === source.name,
      };
    });

    return { conversions, sourceCity: source };
  }, [inputTime, sourceCity]);

  return (
    <CalculatorLayout
      title="Saat qursagi cevirici"
      description="Baki ve dunya seherleri arasinda vaxt ferqini hesablayin."
      breadcrumbs={[
        { label: "Gundelik", href: "/?category=daily" },
        { label: "Saat qursagi cevirici" },
      ]}
      formulaTitle="Saat qursaqlari nece isleyir?"
      formulaContent={`Saat qursaqlari GMT (Greenwich Mean Time) esasinda mueyyen olunur.

Baki vaxti: GMT+4

Esas seherlerin vaxt ferqleri (Bakiya nisbeten):
- Nyu-York: -9 saat (GMT-5)
- London: -4 saat (GMT+0)
- Berlin: -3 saat (GMT+1)
- Moskva / Istanbul: -1 saat (GMT+3)
- Dubay: 0 saat (GMT+4)
- Tokio: +5 saat (GMT+9)
- Sidney: +7 saat (GMT+11)

Qeyd: Yay / qis vaxt kecidleri bu hesablamaya daxil deyil.`}
      relatedIds={["date-difference", "age", "timezone", "percentage"]}
    >
      {/* Source City */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Menbey seher</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {cities.map((city, i) => (
            <button
              key={city.name}
              onClick={() => setSourceCity(i)}
              className={`p-2 rounded-xl border text-center transition-all text-xs ${
                sourceCity === i
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-lg block">{city.emoji}</span>
              <p className="font-medium text-foreground">{city.name}</p>
              <p className="text-muted">GMT{city.offset >= 0 ? "+" : ""}{city.offset}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Vaxt ({cities[sourceCity].name} vaxti ile)
        </label>
        <input
          type="time"
          value={inputTime}
          onChange={(e) => setInputTime(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Time Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {result.conversions.map((conv) => (
              <div
                key={conv.name}
                className={`rounded-2xl p-5 text-center ${
                  conv.isSource
                    ? "bg-gradient-to-br from-primary to-primary-dark text-white"
                    : conv.isNight
                    ? "bg-gray-800 text-white"
                    : "bg-gray-50 border border-border"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-lg">{conv.emoji}</span>
                  <p className={`text-sm ${conv.isSource ? "text-blue-200" : conv.isNight ? "text-gray-300" : "text-muted"}`}>
                    {conv.name}
                  </p>
                </div>
                <p className="text-3xl font-bold flex items-center justify-center gap-2">
                  <span>{conv.timeOfDay}</span>
                  {conv.time}
                </p>
                {conv.dayLabel && (
                  <p className={`text-xs mt-1 ${conv.isSource ? "text-blue-200" : conv.isNight ? "text-gray-400" : "text-muted"}`}>
                    {conv.dayLabel}
                  </p>
                )}
                <p className={`text-xs mt-1 ${conv.isSource ? "text-blue-200" : conv.isNight ? "text-gray-400" : "text-muted"}`}>
                  GMT{conv.offset >= 0 ? "+" : ""}{conv.offset}
                  {!conv.isSource && ` (${conv.diffFromSource >= 0 ? "+" : ""}${conv.diffFromSource}s.)`}
                </p>
              </div>
            ))}
          </div>

          {/* Table View */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Butun seherlerin vaxti</h3>
            </div>
            <div className="divide-y divide-border">
              {result.conversions.map((conv) => (
                <div
                  key={conv.name}
                  className={`flex items-center justify-between px-5 py-3 ${conv.isSource ? "bg-primary-light" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{conv.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{conv.name}</p>
                      <p className="text-xs text-muted">{conv.country} (GMT{conv.offset >= 0 ? "+" : ""}{conv.offset})</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span>{conv.timeOfDay}</span>
                    <span className="text-lg font-bold text-foreground">{conv.time}</span>
                    {conv.dayLabel && <span className="text-xs text-muted">{conv.dayLabel}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Qeyd:</span> Bu hesablama standart saat qursaqlarini istifade edir.
              Yay / qis vaxt kecidleri (DST) bezi olkelerde tetbiq olunur ve neticelere tesir ede biler.
              Azerbaycan 2016-ci ilden yay vaxt kecidini lehv edib.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🕐</span>
          <p>Neticeni gormek ucun vaxt daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
