"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const USD_AZN = 1.7;
const DOMESTIC_DAILY = 30; // AZN

const internationalRates: { country: string; usd: number }[] = [
  { country: "Türkiyə", usd: 60 },
  { country: "Rusiya", usd: 50 },
  { country: "Gürcüstan", usd: 50 },
  { country: "ABŞ", usd: 80 },
  { country: "Avropa (ümumi)", usd: 70 },
  { country: "Digər", usd: 50 },
];

type Direction = "domestic" | "international";

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BusinessTripCalculator() {
  const [direction, setDirection] = useState<Direction>("domestic");
  const [days, setDays] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [accommodationCost, setAccommodationCost] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(0);

  const result = useMemo(() => {
    const numDays = parseInt(days);
    if (!numDays || numDays <= 0) return null;

    const transport = parseFloat(transportCost) || 0;
    const accommodation = parseFloat(accommodationCost) || 0;

    let dailyAllowancePerDay: number;
    let dailyAllowanceCurrency: string;
    let dailyAllowanceAZN: number;

    if (direction === "domestic") {
      dailyAllowancePerDay = DOMESTIC_DAILY;
      dailyAllowanceCurrency = "AZN";
      dailyAllowanceAZN = DOMESTIC_DAILY * numDays;
    } else {
      const rate = internationalRates[selectedCountry];
      dailyAllowancePerDay = rate.usd;
      dailyAllowanceCurrency = "USD";
      dailyAllowanceAZN = rate.usd * USD_AZN * numDays;
    }

    const totalDailyAllowance = dailyAllowanceAZN;
    const grandTotal = totalDailyAllowance + transport + accommodation;

    return {
      dailyAllowancePerDay,
      dailyAllowanceCurrency,
      dailyAllowanceAZN,
      totalDailyAllowance,
      transport,
      accommodation,
      grandTotal,
      numDays,
    };
  }, [direction, days, transportCost, accommodationCost, selectedCountry]);

  return (
    <CalculatorLayout
      title="Ezamiyyə hesablayıcısı"
      description="Daxili və xarici ezamiyyə xərclərini — gündəlik, nəqliyyat və yaşayış xərclərini hesablayın."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Ezamiyyə hesablayıcısı" },
      ]}
      formulaTitle="Ezamiyyə xərcləri necə hesablanır?"
      formulaContent={`Ezamiyyə xərcləri 3 hissədən ibarətdir:
1. Gündəlik xərclər (sutkəlik):
   • Daxili: 30 AZN/gün
   • Xarici: ölkəyə görə dəyişir (USD ilə)

2. Nəqliyyat xərci: faktiki xərc
3. Yaşayış xərci: faktiki xərc

Qeyd: Gündəlik ezamiyyə pulu vergiyə cəlb olunmur.

Xarici ezamiyyə gündəlik normaları:
• Türkiyə: 60 USD
• Rusiya: 50 USD
• Gürcüstan: 50 USD
• ABŞ: 80 USD
• Avropa: 70 USD
• Digər ölkələr: 50 USD

USD/AZN məzənnəsi: ${USD_AZN}`}
      relatedIds={["salary", "vacation-pay", "severance-pay", "currency"]}
    >
      {/* Direction Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setDirection("domestic")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "domestic"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          🇦🇿 Daxili ezamiyyə
        </button>
        <button
          onClick={() => setDirection("international")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "international"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          🌍 Xarici ezamiyyə
        </button>
      </div>

      {/* Inputs */}
      <div className="mb-8 space-y-4">
        {/* Country selector for international */}
        {direction === "international" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              🌍 Ölkə
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            >
              {internationalRates.map((r, i) => (
                <option key={i} value={i}>
                  {r.country} — {r.usd} USD/gün ({formatMoney(r.usd * USD_AZN)} AZN)
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 Gün sayı
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="5"
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          {/* Quick buttons */}
          <div className="flex gap-2 mt-2">
            {[3, 5, 7, 10, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d.toString())}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  days === d.toString()
                    ? "border-primary bg-primary-light text-primary font-medium"
                    : "border-border bg-white text-muted hover:border-primary/30"
                }`}
              >
                {d} gün
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              🚗 Nəqliyyat xərci (AZN)
            </label>
            <input
              type="number"
              value={transportCost}
              onChange={(e) => setTransportCost(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              🏨 Yaşayış xərci (AZN)
            </label>
            <input
              type="number"
              value={accommodationCost}
              onChange={(e) => setAccommodationCost(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">Ümumi ezamiyyə xərci</p>
            <p className="text-3xl font-bold">{formatMoney(result.grandTotal)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">Gündəlik (sutkəlik)</p>
              <p className="text-2xl font-bold text-green-700">{formatMoney(result.totalDailyAllowance)}</p>
              <p className="text-xs text-green-600 mt-1">
                {result.numDays} gün × {result.dailyAllowancePerDay} {result.dailyAllowanceCurrency}
              </p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Nəqliyyat</p>
              <p className="text-2xl font-bold text-amber-700">{formatMoney(result.transport)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
              <p className="text-sm text-purple-600 mb-1">Yaşayış</p>
              <p className="text-2xl font-bold text-purple-700">{formatMoney(result.accommodation)}</p>
              <p className="text-xs text-purple-600 mt-1">AZN</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Xərc cədvəli
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">
                  Gündəlik norma ({direction === "domestic" ? `${DOMESTIC_DAILY} AZN/gün` : `${internationalRates[selectedCountry].usd} USD/gün`})
                </span>
                <span className="text-sm font-medium text-foreground">
                  {result.dailyAllowancePerDay} {result.dailyAllowanceCurrency}/gün
                </span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Gün sayı</span>
                <span className="text-sm font-medium text-foreground">{result.numDays} gün</span>
              </div>
              {direction === "international" && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">USD/AZN məzənnəsi</span>
                  <span className="text-sm font-medium text-foreground">{USD_AZN}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">Gündəlik cəmi</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(result.totalDailyAllowance)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Nəqliyyat xərci</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.transport)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Yaşayış xərci</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.accommodation)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Ümumi xərc</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.grandTotal)} AZN</span>
              </div>
            </div>
          </div>

          {/* Tax note */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-5">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <span>✅</span>
              <strong>Qeyd:</strong> Gündəlik ezamiyyə pulu (sutkəlik) vergiyə cəlb olunmur.
            </p>
          </div>

          {/* International rates table */}
          {direction === "international" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>🌍</span>
                  Xarici ezamiyyə gündəlik normaları
                </h3>
              </div>
              <div className="divide-y divide-border">
                {internationalRates.map((r, i) => (
                  <div
                    key={i}
                    className={`flex justify-between px-5 py-3 ${
                      i === selectedCountry ? "bg-primary-light" : ""
                    }`}
                  >
                    <span className="text-sm text-muted">{r.country}</span>
                    <span className="text-sm font-medium text-foreground">
                      {r.usd} USD ({formatMoney(r.usd * USD_AZN)} AZN)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">✈️</span>
          <p>Nəticəni görmək üçün gün sayını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
