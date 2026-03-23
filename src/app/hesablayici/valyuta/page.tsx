"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  rateToAZN: number; // 1 vahid = X AZN
}

// Mərkəzi Bankın təxmini məzənnələri (statik)
const currencies: CurrencyInfo[] = [
  { code: "AZN", name: "Azərbaycan manatı", flag: "🇦🇿", rateToAZN: 1 },
  { code: "USD", name: "ABŞ dolları", flag: "🇺🇸", rateToAZN: 1.7 },
  { code: "EUR", name: "Avro", flag: "🇪🇺", rateToAZN: 1.85 },
  { code: "GBP", name: "Britaniya funtu", flag: "🇬🇧", rateToAZN: 2.15 },
  { code: "CHF", name: "İsveçrə frankı", flag: "🇨🇭", rateToAZN: 1.92 },
  { code: "TRY", name: "Türk lirəsi", flag: "🇹🇷", rateToAZN: 0.052 },
  { code: "RUB", name: "Rusiya rublu", flag: "🇷🇺", rateToAZN: 0.019 },
  { code: "UAH", name: "Ukrayna qrivnası", flag: "🇺🇦", rateToAZN: 0.041 },
  { code: "GEL", name: "Gürcüstan larisi", flag: "🇬🇪", rateToAZN: 0.62 },
  { code: "KZT", name: "Qazaxıstan tengesi", flag: "🇰🇿", rateToAZN: 0.0034 },
  { code: "UZS", name: "Özbəkistan somu", flag: "🇺🇿", rateToAZN: 0.00013 },
  { code: "TMT", name: "Türkmənistan manatı", flag: "🇹🇲", rateToAZN: 0.486 },
  { code: "IRR", name: "İran rialı", flag: "🇮🇷", rateToAZN: 0.000040 },
  { code: "SAR", name: "Səudiyyə riyalı", flag: "🇸🇦", rateToAZN: 0.453 },
  { code: "AED", name: "BƏƏ dirhəmi", flag: "🇦🇪", rateToAZN: 0.463 },
  { code: "CNY", name: "Çin yuanı", flag: "🇨🇳", rateToAZN: 0.234 },
  { code: "JPY", name: "Yapon yeni", flag: "🇯🇵", rateToAZN: 0.0113 },
  { code: "KRW", name: "Koreya vonu", flag: "🇰🇷", rateToAZN: 0.00124 },
  { code: "INR", name: "Hindistan rupisi", flag: "🇮🇳", rateToAZN: 0.0202 },
  { code: "CAD", name: "Kanada dolları", flag: "🇨🇦", rateToAZN: 1.23 },
  { code: "AUD", name: "Avstraliya dolları", flag: "🇦🇺", rateToAZN: 1.1 },
  { code: "SEK", name: "İsveç kronu", flag: "🇸🇪", rateToAZN: 0.165 },
  { code: "NOK", name: "Norveç kronu", flag: "🇳🇴", rateToAZN: 0.161 },
  { code: "DKK", name: "Danimarka kronu", flag: "🇩🇰", rateToAZN: 0.248 },
  { code: "PLN", name: "Polşa zlotısı", flag: "🇵🇱", rateToAZN: 0.44 },
  { code: "CZK", name: "Çexiya kronu", flag: "🇨🇿", rateToAZN: 0.074 },
  { code: "HUF", name: "Macarıstan forinti", flag: "🇭🇺", rateToAZN: 0.0047 },
  { code: "RON", name: "Rumıniya leyi", flag: "🇷🇴", rateToAZN: 0.372 },
  { code: "BGN", name: "Bolqarıstan levi", flag: "🇧🇬", rateToAZN: 0.946 },
  { code: "BRL", name: "Braziliya realı", flag: "🇧🇷", rateToAZN: 0.296 },
  { code: "MXN", name: "Meksika pesosu", flag: "🇲🇽", rateToAZN: 0.099 },
  { code: "EGP", name: "Misir funtu", flag: "🇪🇬", rateToAZN: 0.035 },
  { code: "PKR", name: "Pakistan rupisi", flag: "🇵🇰", rateToAZN: 0.0061 },
  { code: "BTC", name: "Bitkoin", flag: "₿", rateToAZN: 145000 },
];

function formatAmount(n: number): string {
  if (n < 0.01 && n > 0) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("AZN");

  const from = currencies.find((c) => c.code === fromCode)!;
  const to = currencies.find((c) => c.code === toCode)!;

  const result = useMemo(() => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return null;

    const inAZN = a * from.rateToAZN;
    const converted = inAZN / to.rateToAZN;
    const rate = from.rateToAZN / to.rateToAZN;
    const reverseRate = to.rateToAZN / from.rateToAZN;

    return { converted, rate, reverseRate, inAZN };
  }, [amount, from, to]);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  // Bütün valyutalara çevirmə cədvəli
  const allConversions = useMemo(() => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return [];

    const inAZN = a * from.rateToAZN;
    return currencies
      .filter((c) => c.code !== fromCode)
      .map((c) => ({
        ...c,
        converted: inAZN / c.rateToAZN,
        rate: from.rateToAZN / c.rateToAZN,
      }));
  }, [amount, from, fromCode]);

  return (
    <CalculatorLayout
      title="Valyuta çevirici"
      description="Valyutalar arası ani çevirmə — Mərkəzi Bankın təxmini məzənnələri ilə."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Valyuta çevirici" },
      ]}
      formulaTitle="Məzənnə haqqında"
      formulaContent={`Bu çevirici Azərbaycan Mərkəzi Bankının təxmini məzənnələrindən istifadə edir.

Göstərilən məzənnələr informativ xarakter daşıyır və real vaxt məzənnələrindən fərqlənə bilər.

Dəqiq məzənnə üçün bankınızla və ya Mərkəzi Bankın saytı ilə yoxlayın:
www.cbar.az`}
      relatedIds={["vat", "deposit", "salary", "customs-duty"]}
    >
      {/* Converter */}
      <div className="space-y-4 mb-8">
        {/* From */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Buradan</label>
          <div className="flex gap-3">
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="w-40 sm:w-48 px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1"
              min="0"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          <p className="text-xs text-muted mt-1">{from.flag} {from.name}</p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            className="p-3 rounded-full border border-border bg-white hover:bg-primary-light hover:border-primary transition-all group"
            aria-label="Dəyişdir"
          >
            <svg className="w-5 h-5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Bura</label>
          <div className="flex gap-3">
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="w-40 sm:w-48 px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <div className="flex-1 px-4 py-3 rounded-xl border border-border bg-gray-50 text-foreground text-base font-semibold">
              {result ? formatAmount(result.converted) : "—"}
            </div>
          </div>
          <p className="text-xs text-muted mt-1">{to.flag} {to.name}</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Rate Display */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-2">Məzənnə</p>
            <p className="text-2xl font-bold mb-1">
              1 {fromCode} = {formatAmount(result.rate)} {toCode}
            </p>
            <p className="text-sm text-blue-200">
              1 {toCode} = {formatAmount(result.reverseRate)} {fromCode}
            </p>
          </div>

          {/* All Conversions */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>💱</span>
              {amount} {fromCode} — bütün valyutalarda
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allConversions.map((c) => (
                <div
                  key={c.code}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    c.code === toCode
                      ? "border-primary bg-primary-light"
                      : "border-border bg-white hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.code}</p>
                      <p className="text-xs text-muted">{c.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatAmount(c.converted)}</p>
                    <p className="text-xs text-muted">1 {fromCode} = {formatAmount(c.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rates Table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📊</span>
              AZN məzənnə cədvəli
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">Valyuta</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">1 vahid = AZN</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">1 AZN =</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies
                    .filter((c) => c.code !== "AZN")
                    .map((c) => (
                      <tr key={c.code} className="border-t border-border hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {c.flag} {c.code} — {c.name}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-primary">
                          {formatAmount(c.rateToAZN)} AZN
                        </td>
                        <td className="px-4 py-3 text-right text-muted">
                          {formatAmount(1 / c.rateToAZN)} {c.code}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Diqqət
            </h4>
            <p className="text-sm text-amber-700">
              Göstərilən məzənnələr təxmini xarakter daşıyır. Dəqiq məzənnə üçün Azərbaycan
              Mərkəzi Bankının rəsmi saytını (cbar.az) və ya bankınızı yoxlayın.
              Bank alış/satış məzənnələri fərqlənə bilər.
            </p>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
