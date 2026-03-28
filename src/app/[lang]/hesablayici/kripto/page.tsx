"use client";

import { useState, useEffect, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const USD_TO_AZN = 1.70;

interface CoinInfo {
  id: string;
  symbol: string;
  icon: string;
  name: Record<Lang, string>;
}

const coins: CoinInfo[] = [
  { id: "bitcoin", symbol: "BTC", icon: "₿", name: { az: "Bitkoin", en: "Bitcoin", ru: "Биткоин" } },
  { id: "ethereum", symbol: "ETH", icon: "Ξ", name: { az: "Efirium", en: "Ethereum", ru: "Эфириум" } },
  { id: "solana", symbol: "SOL", icon: "◎", name: { az: "Solana", en: "Solana", ru: "Солана" } },
  { id: "tether", symbol: "USDT", icon: "₮", name: { az: "Tether", en: "Tether", ru: "Тезер" } },
  { id: "binancecoin", symbol: "BNB", icon: "⬡", name: { az: "BNB", en: "BNB", ru: "BNB" } },
];

const pageTranslations = {
  az: {
    title: "Kripto qiymət hesablayıcısı",
    description: "Kriptovalyutaların real vaxt qiymətlərini USD və AZN ilə hesablayın.",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "Kripto qiymət necə hesablanır?",
    formulaContent: `Dəyər = Miqdar × Cari qiymət (USD)
AZN dəyəri = USD dəyəri × 1.70 (USD/AZN məzənnəsi)

Qiymətlər CoinGecko API-dən real vaxtda alınır.
Məzənnə: 1 USD = 1.70 AZN (Mərkəzi Bank təxmini məzənnəsi)

Diqqət: Kripto bazarı 24/7 işləyir və qiymətlər hər an dəyişə bilər.
Bu hesablayıcı yalnız informativ məqsədlə istifadə olunmalıdır.`,
    amount: "Miqdar",
    selectCoin: "Kriptovalyuta seçin",
    usdValue: "USD dəyəri",
    aznValue: "AZN dəyəri",
    currentPrice: "Cari qiymət",
    lastUpdated: "Son yenilənmə",
    refresh: "Yenilə",
    loading: "Qiymətlər yüklənir...",
    error: "Qiymətlər yüklənmədi. Yenidən cəhd edin.",
    retry: "Yenidən cəhd et",
    allPrices: "Bütün qiymətlər",
    perUnit: "1 vahid",
    enterAmount: "Nəticəni görmək üçün miqdar daxil edin.",
    priceInUsd: "USD qiyməti",
    priceInTry: "TRY qiyməti",
    priceInAzn: "AZN qiyməti",
    warning: "Diqqət",
    warningText: "Qiymətlər CoinGecko-dan alınır və təxmini xarakter daşıyır. İnvestisiya qərarları üçün bu məlumatlara etibar etməyin.",
  },
  en: {
    title: "Crypto Price Calculator",
    description: "Calculate real-time cryptocurrency prices in USD and AZN.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How is crypto price calculated?",
    formulaContent: `Value = Amount × Current price (USD)
AZN value = USD value × 1.70 (USD/AZN exchange rate)

Prices are fetched in real-time from the CoinGecko API.
Exchange rate: 1 USD = 1.70 AZN (Central Bank approximate rate)

Note: The crypto market operates 24/7 and prices can change at any moment.
This calculator should be used for informational purposes only.`,
    amount: "Amount",
    selectCoin: "Select cryptocurrency",
    usdValue: "USD value",
    aznValue: "AZN value",
    currentPrice: "Current price",
    lastUpdated: "Last updated",
    refresh: "Refresh",
    loading: "Loading prices...",
    error: "Failed to load prices. Please try again.",
    retry: "Try again",
    allPrices: "All prices",
    perUnit: "1 unit",
    enterAmount: "Enter an amount to see the result.",
    priceInUsd: "USD price",
    priceInTry: "TRY price",
    priceInAzn: "AZN price",
    warning: "Warning",
    warningText: "Prices are sourced from CoinGecko and are approximate. Do not rely on this information for investment decisions.",
  },
  ru: {
    title: "Калькулятор криптовалют",
    description: "Рассчитайте цены криптовалют в реальном времени в USD и AZN.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как рассчитывается цена криптовалюты?",
    formulaContent: `Стоимость = Количество × Текущая цена (USD)
Стоимость в AZN = Стоимость в USD × 1.70 (курс USD/AZN)

Цены получаются в реальном времени через API CoinGecko.
Курс: 1 USD = 1.70 AZN (приблизительный курс Центрального банка)

Примечание: Крипто-рынок работает 24/7, и цены могут измениться в любой момент.
Этот калькулятор предназначен только для информационных целей.`,
    amount: "Количество",
    selectCoin: "Выберите криптовалюту",
    usdValue: "Стоимость в USD",
    aznValue: "Стоимость в AZN",
    currentPrice: "Текущая цена",
    lastUpdated: "Последнее обновление",
    refresh: "Обновить",
    loading: "Загрузка цен...",
    error: "Не удалось загрузить цены. Попробуйте снова.",
    retry: "Попробовать снова",
    allPrices: "Все цены",
    perUnit: "1 единица",
    enterAmount: "Введите количество, чтобы увидеть результат.",
    priceInUsd: "Цена в USD",
    priceInTry: "Цена в TRY",
    priceInAzn: "Цена в AZN",
    warning: "Внимание",
    warningText: "Цены получены из CoinGecko и являются приблизительными. Не принимайте инвестиционных решений на основе этих данных.",
  },
};

type Prices = Record<string, { usd: number; try: number }>;

function fmt(n: number): string {
  if (n < 0.01 && n > 0) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatTime(date: Date, lang: Lang): string {
  return date.toLocaleTimeString(lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function CryptoCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [amount, setAmount] = useState("1");
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether,binancecoin&vs_currencies=usd,try"
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPrices(data);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const coin = coins.find((c) => c.id === selectedCoin)!;
  const coinPrice = prices?.[selectedCoin];

  const a = parseFloat(amount);
  const hasResult = coinPrice && a && a > 0;
  const usdValue = hasResult ? a * coinPrice.usd : 0;
  const aznValue = hasResult ? usdValue * USD_TO_AZN : 0;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["currency", "gold-silver", "deposit"]}
    >
      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-muted">{pt.loading}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">⚠️</span>
          <p className="text-muted mb-4">{pt.error}</p>
          <button
            onClick={fetchPrices}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            {pt.retry}
          </button>
        </div>
      )}

      {/* Main UI */}
      {!loading && !error && prices && (
        <>
          {/* Coin Selector — glass dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.selectCoin}
            </label>
            <div className="relative">
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 backdrop-blur-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
              >
                {coins.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.symbol} — {c.name[lang]}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.amount} ({coin.symbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1"
              min="0"
              step="any"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>

          {/* Current Price + Refresh */}
          {coinPrice && (
            <div className="flex items-center justify-between mb-6 px-1">
              <p className="text-sm text-muted">
                {pt.currentPrice}: <span className="font-semibold text-foreground">1 {coin.symbol} = ${fmt(coinPrice.usd)}</span>
              </p>
              <button
                onClick={fetchPrices}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {pt.refresh}
              </button>
            </div>
          )}

          {/* Results */}
          {hasResult ? (
            <div className="space-y-6">
              {/* Result Cards — glass effect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">{pt.usdValue}</p>
                  <p className="text-3xl font-bold text-foreground">${fmt(usdValue)}</p>
                  <p className="text-xs text-muted mt-2">
                    {fmt(a)} {coin.symbol} × ${fmt(coinPrice!.usd)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">{pt.aznValue}</p>
                  <p className="text-3xl font-bold">{fmt(aznValue)} AZN</p>
                  <p className="text-xs text-blue-200 mt-2">
                    ${fmt(usdValue)} × 1.70
                  </p>
                </div>
              </div>

              {/* All Coin Prices Table */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span>📊</span>
                  {pt.allPrices} ({pt.perUnit})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {coins.map((c) => {
                    const p = prices[c.id];
                    if (!p) return null;
                    const isSelected = c.id === selectedCoin;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCoin(c.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? "border-primary bg-white/70 backdrop-blur-md ring-2 ring-primary"
                            : "border-border bg-white/70 backdrop-blur-md hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-8 text-center">{c.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{c.symbol}</p>
                            <p className="text-xs text-muted">{c.name[lang]}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">${fmt(p.usd)}</p>
                          <p className="text-xs text-muted">{fmt(p.usd * USD_TO_AZN)} AZN</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Last Updated + Disclaimer */}
              {lastUpdated && (
                <p className="text-xs text-muted text-center">
                  {pt.lastUpdated}: {formatTime(lastUpdated, lang)}
                </p>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <span>⚠️</span>
                  {pt.warning}
                </h4>
                <p className="text-sm text-amber-700">{pt.warningText}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <span className="text-4xl block mb-3">🪙</span>
              <p>{pt.enterAmount}</p>
            </div>
          )}
        </>
      )}
    </CalculatorLayout>
  );
}
