"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type MetalType = "gold" | "silver" | "platinum" | "palladium";
type Direction = "buy" | "sell";

interface PurityOption {
  value: number;
  label: string;
  karat?: string;
}

const goldPurities: PurityOption[] = [
  { value: 375, label: "375", karat: "9K" },
  { value: 500, label: "500", karat: "12K" },
  { value: 585, label: "585", karat: "14K" },
  { value: 750, label: "750", karat: "18K" },
  { value: 875, label: "875", karat: "21K" },
  { value: 999, label: "999", karat: "24K" },
];

const silverPurities: PurityOption[] = [
  { value: 800, label: "800", karat: "800" },
  { value: 925, label: "925", karat: "Sterling" },
  { value: 999, label: "999", karat: "999" },
];

const platinumPurities: PurityOption[] = [
  { value: 585, label: "585", karat: "585" },
  { value: 750, label: "750", karat: "750" },
  { value: 850, label: "850", karat: "850" },
  { value: 900, label: "900", karat: "900" },
  { value: 950, label: "950", karat: "950" },
  { value: 999, label: "999", karat: "999" },
];

const palladiumPurities: PurityOption[] = [
  { value: 500, label: "500", karat: "500" },
  { value: 850, label: "850", karat: "850" },
  { value: 950, label: "950", karat: "950" },
  { value: 999, label: "999", karat: "999" },
];

// Fallback static prices (AZN per gram, 999 pure)
const FALLBACK_PRICES = {
  gold: 265.15,
  silver: 4.14,
  platinum: 112.04,
  palladium: 82.63,
};

// CBAR gives AZN per 1 troy ounce. 1 troy oz = 31.1035 grams
const TROY_OZ_GRAMS = 31.1035;

// Spread: buy price = CBAR rate, sell = CBAR rate × 0.96 (4% spread)
const SELL_SPREAD = 0.96;

const quickWeights = [1, 5, 10, 50, 100];

interface CbarPrices {
  gold: number; // AZN per gram (999)
  silver: number;
  platinum: number;
  palladium: number;
  date: string;
  source: "cbar" | "fallback";
}

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

function formatWeight(n: number): string {
  return n.toFixed(3);
}

function parseCbarXml(xml: string): Omit<CbarPrices, "source"> | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const dateAttr = doc.querySelector("ValCurs")?.getAttribute("Date") || "";

    const getRate = (code: string): number => {
      const valutes = doc.querySelectorAll("Valute");
      for (let i = 0; i < valutes.length; i++) {
        const v = valutes[i];
        const codeEl = v.getAttribute("Code");
        if (codeEl === code) {
          const val = v.querySelector("Value")?.textContent;
          return val ? parseFloat(val) : 0;
        }
      }
      return 0;
    };

    const xau = getRate("XAU"); // AZN per troy oz
    const xag = getRate("XAG");
    const xpt = getRate("XPT");
    const xpd = getRate("XPD");

    if (xau <= 0) return null;

    return {
      gold: xau / TROY_OZ_GRAMS,
      silver: xag / TROY_OZ_GRAMS,
      platinum: xpt / TROY_OZ_GRAMS,
      palladium: xpd / TROY_OZ_GRAMS,
      date: dateAttr,
    };
  } catch {
    return null;
  }
}

export default function GoldSilverCalculator() {
  const [metalType, setMetalType] = useState<MetalType>("gold");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState(999);
  const [direction, setDirection] = useState<Direction>("buy");
  const [prices, setPrices] = useState<CbarPrices>({
    ...FALLBACK_PRICES,
    date: "",
    source: "fallback",
  });
  const [loading, setLoading] = useState(true);

  // Fetch CBAR prices on mount
  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      const url = `https://www.cbar.az/currencies/${dd}.${mm}.${yyyy}.xml`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const xml = await res.text();
      const parsed = parseCbarXml(xml);

      if (parsed && parsed.gold > 0) {
        setPrices({ ...parsed, source: "cbar" });
      }
    } catch {
      // Keep fallback prices
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const purities = metalType === "gold" ? goldPurities : metalType === "silver" ? silverPurities : metalType === "platinum" ? platinumPurities : palladiumPurities;

  const handleMetalSwitch = (type: MetalType) => {
    setMetalType(type);
    setPurity(999);
  };

  // Get base price per gram (999 pure) from CBAR
  const baseBuyPerGram = prices[metalType];
  const baseSellPerGram = prices[metalType] * SELL_SPREAD;

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;

    const factor = purity / 1000;
    const pureWeight = w * factor;
    const buyPrice = w * baseBuyPerGram * factor;
    const sellPrice = w * baseSellPerGram * factor;
    const spread = buyPrice - sellPrice;
    const pricePerGramBuy = baseBuyPerGram * factor;
    const pricePerGramSell = baseSellPerGram * factor;

    const allPurities = metalType === "gold" ? goldPurities : metalType === "silver" ? silverPurities : metalType === "platinum" ? platinumPurities : palladiumPurities;
    const comparisonTable = allPurities.map((p) => {
      const f = p.value / 1000;
      return {
        ...p,
        pureWeight: w * f,
        buyTotal: w * baseBuyPerGram * f,
        sellTotal: w * baseSellPerGram * f,
        buyPerGram: baseBuyPerGram * f,
        sellPerGram: baseSellPerGram * f,
        isSelected: p.value === purity,
      };
    });

    return {
      pureWeight,
      buyPrice,
      sellPrice,
      spread,
      pricePerGramBuy,
      pricePerGramSell,
      comparisonTable,
      factor,
    };
  }, [weight, purity, metalType, baseBuyPerGram, baseSellPerGram]);

  return (
    <CalculatorLayout
      title="Qiymətli metallar hesablayıcısı"
      description="Qızıl, gümüş, platin və palladium — əyara görə alış-satış qiymətləri."
      breadcrumbs={[
        { label: "Qiymətli Metallar", href: "/?category=metals" },
        { label: "Qiymətli metallar hesablayıcısı" },
      ]}
      formulaTitle="Qiymətli metalların qiyməti necə hesablanır?"
      formulaContent={`Mənbə: Azərbaycan Respublikası Mərkəzi Bankı (CBAR)
CBAR bank metallarının qiymətini AZN/troy uns olaraq verir.
1 troy uns = 31.1035 qram

Qrama çevirmə: Qiymət/qram = CBAR qiyməti ÷ 31.1035

Əyara görə qiymət:
Qiymət = Çəki (qram) × Baza qiymət (999/qram) × (Əyar / 1000)

Saf metal çəkisi = Ümumi çəki × (Əyar / 1000)

Satış qiyməti alış qiymətindən ~4% aşağıdır (zərgərlik/bank spread).`}
      relatedIds={["zakat", "currency", "deposit", "vat"]}
    >
      {/* CBAR Price Status */}
      <div className={`rounded-xl border p-4 mb-6 ${prices.source === "cbar" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${prices.source === "cbar" ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-xs font-medium text-foreground">
              {loading ? "Qiymətlər yüklənir..." : prices.source === "cbar" ? "CBAR məzənnələri" : "Statik qiymətlər (CBAR əlçatmaz)"}
            </span>
            {prices.date && <span className="text-xs text-muted">({prices.date})</span>}
          </div>
          <button onClick={fetchPrices} className="text-xs text-primary hover:underline" disabled={loading}>
            {loading ? "..." : "Yenilə"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-center">
          <div>
            <p className="text-[10px] text-muted">Qızıl/qr</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.gold)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Gümüş/qr</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.silver)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Platin/qr</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.platinum)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Palladium/qr</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.palladium)}</p>
          </div>
        </div>
      </div>

      {/* Metal Type Toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {([
          { id: "gold" as MetalType, label: "Qızıl", icon: "🪙", color: "bg-amber-500" },
          { id: "silver" as MetalType, label: "Gümüş", icon: "🥈", color: "bg-gray-500" },
          { id: "platinum" as MetalType, label: "Platin", icon: "💠", color: "bg-slate-600" },
          { id: "palladium" as MetalType, label: "Palladium", icon: "⚪", color: "bg-zinc-500" },
        ]).map((m) => (
          <button
            key={m.id}
            onClick={() => handleMetalSwitch(m.id)}
            className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              metalType === m.id
                ? `${m.color} text-white border-transparent ring-2 ring-offset-1 ring-${m.color}`
                : "bg-white text-muted border-border hover:bg-gray-50"
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Weight Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Çəki (qram)
        </label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="10"
          min="0"
          step="0.1"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base mb-3"
        />
        <div className="flex flex-wrap gap-2">
          {quickWeights.map((qw) => (
            <button
              key={qw}
              onClick={() => setWeight(String(qw))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                weight === String(qw)
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border bg-white text-muted hover:border-primary/30"
              }`}
            >
              {qw}g
            </button>
          ))}
        </div>
      </div>

      {/* Purity/Karat Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Əyar seçimi
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {purities.map((p) => (
            <button
              key={p.value}
              onClick={() => setPurity(p.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                purity === p.value
                  ? metalType === "gold"
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                    : "border-gray-500 bg-gray-50 ring-2 ring-gray-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-bold text-foreground">{p.karat}</p>
              <p className="text-xs text-muted">{(p.value / 10).toFixed(1)}%</p>
            </button>
          ))}
        </div>
      </div>

      {/* Direction Toggle */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Əməliyyat növü
        </label>
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setDirection("buy")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              direction === "buy"
                ? "bg-green-600 text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            Alış
          </button>
          <button
            onClick={() => setDirection("sell")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              direction === "sell"
                ? "bg-red-500 text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            Satış
          </button>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-green-100 mb-1">Alış qiyməti</p>
              <p className="text-2xl font-bold">{formatMoney(result.buyPrice)}</p>
              <p className="text-xs text-green-200 mt-1">{formatMoney(result.pricePerGramBuy)}/qr</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-red-100 mb-1">Satış qiyməti</p>
              <p className="text-2xl font-bold">{formatMoney(result.sellPrice)}</p>
              <p className="text-xs text-red-200 mt-1">{formatMoney(result.pricePerGramSell)}/qr</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Fərq (spread)</p>
              <p className="text-2xl font-bold text-amber-700">{formatMoney(result.spread)}</p>
              <p className="text-xs text-amber-500 mt-1">alış - satış</p>
            </div>
          </div>

          {/* Pure Metal Weight */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
            <p className="text-sm text-blue-600 mb-1">Saf metal çəkisi</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatWeight(result.pureWeight)} qram
            </p>
            <p className="text-xs text-blue-500 mt-1">
              {weight} qr x {(result.factor * 100).toFixed(1)}% = {formatWeight(result.pureWeight)} qr saf {metalType === "gold" ? "qızıl" : "gümüş"}
            </p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Hesablama detalları
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Metal növü</span>
                <span className="text-sm font-medium text-foreground">{metalType === "gold" ? "Qızıl" : metalType === "silver" ? "Gümüş" : metalType === "platinum" ? "Platin" : "Palladium"}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ümumi çəki</span>
                <span className="text-sm font-medium text-foreground">{weight} qram</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Əyar</span>
                <span className="text-sm font-medium text-foreground">{purity} ({(purity / 10).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Saf metal çəkisi</span>
                <span className="text-sm font-medium text-foreground">{formatWeight(result.pureWeight)} qram</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Baza qiymət (999, 1qr)</span>
                <span className="text-sm font-medium text-foreground">
                  Alış: {formatMoney(baseBuyPerGram)} / Satış: {formatMoney(baseSellPerGram)}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">Alış qiyməti</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(result.buyPrice)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">Satış qiyməti</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.sellPrice)}</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Bütün əyarlar üzrə müqayisə ({weight} qram)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">Əyar</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Saflıq</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Saf çəki</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Alış</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Satış</th>
                  </tr>
                </thead>
                <tbody>
                  {result.comparisonTable.map((row) => (
                    <tr
                      key={row.value}
                      className={`border-t border-border ${
                        row.isSelected
                          ? metalType === "gold" ? "bg-amber-50" : "bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {row.karat}
                        {row.isSelected && (
                          <span className="ml-2 text-xs text-primary font-normal">seçilmiş</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted">{(row.value / 10).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right">{formatWeight(row.pureWeight)} qr</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{formatMoney(row.buyTotal)}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">{formatMoney(row.sellTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Note */}
          <div className="bg-gray-50 border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted">
              Qiymətlər məlumat xarakteri daşıyır, bank/zərgərlik qiymətləri fərqli ola bilər. Son yenilənmə: 2024
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">{metalType === "gold" ? "🪙" : "🥈"}</span>
          <p>Qiyməti hesablamaq üçün çəki daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
