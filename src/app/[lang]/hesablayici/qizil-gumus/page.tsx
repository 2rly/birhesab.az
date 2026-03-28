"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

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

const FALLBACK_PRICES = {
  gold: 265.15,
  silver: 4.14,
  platinum: 112.04,
  palladium: 82.63,
};

const TROY_OZ_GRAMS = 31.1035;
const SELL_SPREAD = 0.96;
const quickWeights = [1, 5, 10, 50, 100];

interface CbarPrices {
  gold: number;
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
    const xau = getRate("XAU");
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

const pageTranslations = {
  az: {
    title: "Qiymətli metallar hesablayıcısı",
    description: "Qızıl, gümüş, platin və palladium — əyara görə alış-satış qiymətləri.",
    breadcrumbCategory: "Qiymətli Metallar",
    breadcrumbLabel: "Qiymətli metallar hesablayıcısı",
    formulaTitle: "Qiymətli metalların qiyməti necə hesablanır?",
    formulaContent: `Mənbə: Azərbaycan Respublikası Mərkəzi Bankı (CBAR)
CBAR bank metallarının qiymətini AZN/troy uns olaraq verir.
1 troy uns = 31.1035 qram

Qrama çevirmə: Qiymət/qram = CBAR qiyməti ÷ 31.1035

Əyara görə qiymət:
Qiymət = Çəki (qram) × Baza qiymət (999/qram) × (Əyar / 1000)

Saf metal çəkisi = Ümumi çəki × (Əyar / 1000)

Satış qiyməti alış qiymətindən ~4% aşağıdır (zərgərlik/bank spread).`,
    loading: "Qiymətlər yüklənir...",
    cbarRates: "CBAR məzənnələri",
    staticPrices: "Statik qiymətlər (CBAR əlçatmaz)",
    refresh: "Yenilə",
    goldPerGram: "Qızıl/qr",
    silverPerGram: "Gümüş/qr",
    platinumPerGram: "Platin/qr",
    palladiumPerGram: "Palladium/qr",
    gold: "Qızıl",
    silver: "Gümüş",
    platinum: "Platin",
    palladium: "Palladium",
    weightGram: "Çəki (qram)",
    puritySelection: "Əyar seçimi",
    operationType: "Əməliyyat növü",
    buy: "Alış",
    sell: "Satış",
    buyPrice: "Alış qiyməti",
    sellPrice: "Satış qiyməti",
    spread: "Fərq (spread)",
    buySellDiff: "alış - satış",
    pureMetalWeight: "Saf metal çəkisi",
    pureGold: "saf qızıl",
    pureSilver: "saf gümüş",
    purePlatinum: "saf platin",
    purePalladium: "saf palladium",
    calculationDetails: "Hesablama detalları",
    metalType: "Metal növü",
    totalWeight: "Ümumi çəki",
    purity: "Əyar",
    pureWeight: "Saf metal çəkisi",
    basePrice: "Baza qiymət (999, 1qr)",
    buyLabel: "Alış",
    sellLabel: "Satış",
    allPuritiesComparison: "Bütün əyarlar üzrə müqayisə",
    gram: "qram",
    grShort: "qr",
    selected: "seçilmiş",
    purityCol: "Əyar",
    purityPct: "Saflıq",
    pureWeightCol: "Saf çəki",
    buyCol: "Alış",
    sellCol: "Satış",
    priceNote: "Qiymətlər məlumat xarakteri daşıyır, bank/zərgərlik qiymətləri fərqli ola bilər. Son yenilənmə: 2024",
    emptyState: "Qiyməti hesablamaq üçün çəki daxil edin.",
  },
  en: {
    title: "Precious Metals Calculator",
    description: "Gold, silver, platinum and palladium — buy/sell prices by purity.",
    breadcrumbCategory: "Precious Metals",
    breadcrumbLabel: "Precious metals calculator",
    formulaTitle: "How are precious metal prices calculated?",
    formulaContent: `Source: Central Bank of Azerbaijan (CBAR)
CBAR provides bank metal prices in AZN/troy ounce.
1 troy ounce = 31.1035 grams

Conversion to grams: Price/gram = CBAR price ÷ 31.1035

Price by purity:
Price = Weight (grams) × Base price (999/gram) × (Purity / 1000)

Pure metal weight = Total weight × (Purity / 1000)

Sell price is ~4% lower than buy price (jewelry/bank spread).`,
    loading: "Loading prices...",
    cbarRates: "CBAR rates",
    staticPrices: "Static prices (CBAR unavailable)",
    refresh: "Refresh",
    goldPerGram: "Gold/g",
    silverPerGram: "Silver/g",
    platinumPerGram: "Platinum/g",
    palladiumPerGram: "Palladium/g",
    gold: "Gold",
    silver: "Silver",
    platinum: "Platinum",
    palladium: "Palladium",
    weightGram: "Weight (grams)",
    puritySelection: "Purity selection",
    operationType: "Operation type",
    buy: "Buy",
    sell: "Sell",
    buyPrice: "Buy price",
    sellPrice: "Sell price",
    spread: "Spread",
    buySellDiff: "buy - sell",
    pureMetalWeight: "Pure metal weight",
    pureGold: "pure gold",
    pureSilver: "pure silver",
    purePlatinum: "pure platinum",
    purePalladium: "pure palladium",
    calculationDetails: "Calculation details",
    metalType: "Metal type",
    totalWeight: "Total weight",
    purity: "Purity",
    pureWeight: "Pure metal weight",
    basePrice: "Base price (999, 1g)",
    buyLabel: "Buy",
    sellLabel: "Sell",
    allPuritiesComparison: "Comparison across all purities",
    gram: "grams",
    grShort: "g",
    selected: "selected",
    purityCol: "Purity",
    purityPct: "Fineness",
    pureWeightCol: "Pure weight",
    buyCol: "Buy",
    sellCol: "Sell",
    priceNote: "Prices are for informational purposes; bank/jewelry prices may differ. Last updated: 2024",
    emptyState: "Enter weight to calculate the price.",
  },
  ru: {
    title: "Калькулятор драгоценных металлов",
    description: "Золото, серебро, платина и палладий — цены покупки/продажи по пробе.",
    breadcrumbCategory: "Драгоценные металлы",
    breadcrumbLabel: "Калькулятор драгоценных металлов",
    formulaTitle: "Как рассчитываются цены на драгоценные металлы?",
    formulaContent: `Источник: Центральный банк Азербайджана (CBAR)
CBAR предоставляет цены на банковские металлы в AZN/тройская унция.
1 тройская унция = 31.1035 грамма

Перевод в граммы: Цена/грамм = Цена CBAR ÷ 31.1035

Цена по пробе:
Цена = Вес (граммы) × Базовая цена (999/грамм) × (Проба / 1000)

Вес чистого металла = Общий вес × (Проба / 1000)

Цена продажи на ~4% ниже цены покупки (ювелирный/банковский спред).`,
    loading: "Загрузка цен...",
    cbarRates: "Курсы CBAR",
    staticPrices: "Статичные цены (CBAR недоступен)",
    refresh: "Обновить",
    goldPerGram: "Золото/г",
    silverPerGram: "Серебро/г",
    platinumPerGram: "Платина/г",
    palladiumPerGram: "Палладий/г",
    gold: "Золото",
    silver: "Серебро",
    platinum: "Платина",
    palladium: "Палладий",
    weightGram: "Вес (граммы)",
    puritySelection: "Выбор пробы",
    operationType: "Тип операции",
    buy: "Покупка",
    sell: "Продажа",
    buyPrice: "Цена покупки",
    sellPrice: "Цена продажи",
    spread: "Разница (спред)",
    buySellDiff: "покупка - продажа",
    pureMetalWeight: "Вес чистого металла",
    pureGold: "чистое золото",
    pureSilver: "чистое серебро",
    purePlatinum: "чистая платина",
    purePalladium: "чистый палладий",
    calculationDetails: "Детали расчёта",
    metalType: "Тип металла",
    totalWeight: "Общий вес",
    purity: "Проба",
    pureWeight: "Вес чистого металла",
    basePrice: "Базовая цена (999, 1г)",
    buyLabel: "Покупка",
    sellLabel: "Продажа",
    allPuritiesComparison: "Сравнение по всем пробам",
    gram: "грамм",
    grShort: "г",
    selected: "выбрано",
    purityCol: "Проба",
    purityPct: "Чистота",
    pureWeightCol: "Чист. вес",
    buyCol: "Покупка",
    sellCol: "Продажа",
    priceNote: "Цены носят информационный характер; банковские/ювелирные цены могут отличаться. Последнее обновление: 2024",
    emptyState: "Введите вес, чтобы рассчитать цену.",
  },
};

export default function GoldSilverCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

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

  const baseBuyPerGram = prices[metalType];
  const baseSellPerGram = prices[metalType] * SELL_SPREAD;

  const metalNames: Record<MetalType, string> = {
    gold: pt.gold,
    silver: pt.silver,
    platinum: pt.platinum,
    palladium: pt.palladium,
  };

  const pureNames: Record<MetalType, string> = {
    gold: pt.pureGold,
    silver: pt.pureSilver,
    platinum: pt.purePlatinum,
    palladium: pt.purePalladium,
  };

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
      pureWeight, buyPrice, sellPrice, spread,
      pricePerGramBuy, pricePerGramSell, comparisonTable, factor,
    };
  }, [weight, purity, metalType, baseBuyPerGram, baseSellPerGram]);

  const metalButtons: { id: MetalType; icon: string; color: string }[] = [
    { id: "gold", icon: "🪙", color: "bg-amber-500" },
    { id: "silver", icon: "🥈", color: "bg-gray-500" },
    { id: "platinum", icon: "💠", color: "bg-slate-600" },
    { id: "palladium", icon: "⚪", color: "bg-zinc-500" },
  ];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=metals" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["zakat", "currency", "deposit", "vat"]}
    >
      {/* CBAR Price Status */}
      <div className={`rounded-xl border p-4 mb-6 ${prices.source === "cbar" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${prices.source === "cbar" ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-xs font-medium text-foreground">
              {loading ? pt.loading : prices.source === "cbar" ? pt.cbarRates : pt.staticPrices}
            </span>
            {prices.date && <span className="text-xs text-muted">({prices.date})</span>}
          </div>
          <button onClick={fetchPrices} className="text-xs text-primary hover:underline" disabled={loading}>
            {loading ? "..." : pt.refresh}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-center">
          <div>
            <p className="text-[10px] text-muted">{pt.goldPerGram}</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.gold)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">{pt.silverPerGram}</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.silver)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">{pt.platinumPerGram}</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.platinum)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">{pt.palladiumPerGram}</p>
            <p className="text-sm font-bold text-foreground">{formatMoney(prices.palladium)}</p>
          </div>
        </div>
      </div>

      {/* Metal Type Toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {metalButtons.map((m) => (
          <button
            key={m.id}
            onClick={() => handleMetalSwitch(m.id)}
            className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              metalType === m.id
                ? `${m.color} text-white border-transparent ring-2 ring-offset-1 ring-${m.color}`
                : "bg-white text-muted border-border hover:bg-gray-50"
            }`}
          >
            {m.icon} {metalNames[m.id]}
          </button>
        ))}
      </div>

      {/* Weight Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          {pt.weightGram}
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
              {qw}{pt.grShort}
            </button>
          ))}
        </div>
      </div>

      {/* Purity/Karat Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          {pt.puritySelection}
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
          {pt.operationType}
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
            {pt.buy}
          </button>
          <button
            onClick={() => setDirection("sell")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              direction === "sell"
                ? "bg-red-500 text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            {pt.sell}
          </button>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-green-100 mb-1">{pt.buyPrice}</p>
              <p className="text-2xl font-bold">{formatMoney(result.buyPrice)}</p>
              <p className="text-xs text-green-200 mt-1">{formatMoney(result.pricePerGramBuy)}/{pt.grShort}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-red-100 mb-1">{pt.sellPrice}</p>
              <p className="text-2xl font-bold">{formatMoney(result.sellPrice)}</p>
              <p className="text-xs text-red-200 mt-1">{formatMoney(result.pricePerGramSell)}/{pt.grShort}</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.spread}</p>
              <p className="text-2xl font-bold text-amber-700">{formatMoney(result.spread)}</p>
              <p className="text-xs text-amber-500 mt-1">{pt.buySellDiff}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
            <p className="text-sm text-blue-600 mb-1">{pt.pureMetalWeight}</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatWeight(result.pureWeight)} {pt.gram}
            </p>
            <p className="text-xs text-blue-500 mt-1">
              {weight} {pt.grShort} x {(result.factor * 100).toFixed(1)}% = {formatWeight(result.pureWeight)} {pt.grShort} {pureNames[metalType]}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.calculationDetails}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.metalType}</span>
                <span className="text-sm font-medium text-foreground">{metalNames[metalType]}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.totalWeight}</span>
                <span className="text-sm font-medium text-foreground">{weight} {pt.gram}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.purity}</span>
                <span className="text-sm font-medium text-foreground">{purity} ({(purity / 10).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.pureWeight}</span>
                <span className="text-sm font-medium text-foreground">{formatWeight(result.pureWeight)} {pt.gram}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.basePrice}</span>
                <span className="text-sm font-medium text-foreground">
                  {pt.buyLabel}: {formatMoney(baseBuyPerGram)} / {pt.sellLabel}: {formatMoney(baseSellPerGram)}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">{pt.buyPrice}</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(result.buyPrice)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.sellPrice}</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.sellPrice)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.allPuritiesComparison} ({weight} {pt.gram})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">{pt.purityCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.purityPct}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.pureWeightCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.buyCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.sellCol}</th>
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
                          <span className="ml-2 text-xs text-primary font-normal">{pt.selected}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted">{(row.value / 10).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right">{formatWeight(row.pureWeight)} {pt.grShort}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{formatMoney(row.buyTotal)}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">{formatMoney(row.sellTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted">
              {pt.priceNote}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">{metalType === "gold" ? "🪙" : "🥈"}</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
