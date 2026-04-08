"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface CurrencyInfo {
  code: string;
  name: Record<Lang, string>;
  flag: string;
}

const currencyList: CurrencyInfo[] = [
  { code: "AZN", name: { az: "Azərbaycan manatı", en: "Azerbaijani manat", ru: "Азербайджанский манат" }, flag: "🇦🇿" },
  { code: "USD", name: { az: "ABŞ dolları", en: "US dollar", ru: "Доллар США" }, flag: "🇺🇸" },
  { code: "EUR", name: { az: "Avro", en: "Euro", ru: "Евро" }, flag: "🇪🇺" },
  { code: "GBP", name: { az: "Britaniya funtu", en: "British pound", ru: "Британский фунт" }, flag: "🇬🇧" },
  { code: "CHF", name: { az: "İsveçrə frankı", en: "Swiss franc", ru: "Швейцарский франк" }, flag: "🇨🇭" },
  { code: "TRY", name: { az: "Türk lirəsi", en: "Turkish lira", ru: "Турецкая лира" }, flag: "🇹🇷" },
  { code: "RUB", name: { az: "Rusiya rublu", en: "Russian ruble", ru: "Российский рубль" }, flag: "🇷🇺" },
  { code: "UAH", name: { az: "Ukrayna qrivnası", en: "Ukrainian hryvnia", ru: "Украинская гривна" }, flag: "🇺🇦" },
  { code: "GEL", name: { az: "Gürcüstan larisi", en: "Georgian lari", ru: "Грузинский лари" }, flag: "🇬🇪" },
  { code: "KZT", name: { az: "Qazaxıstan tengesi", en: "Kazakh tenge", ru: "Казахстанский тенге" }, flag: "🇰🇿" },
  { code: "UZS", name: { az: "Özbəkistan somu", en: "Uzbek som", ru: "Узбекский сум" }, flag: "🇺🇿" },
  { code: "TMT", name: { az: "Türkmənistan manatı", en: "Turkmen manat", ru: "Туркменский манат" }, flag: "🇹🇲" },
  { code: "SAR", name: { az: "Səudiyyə riyalı", en: "Saudi riyal", ru: "Саудовский риял" }, flag: "🇸🇦" },
  { code: "AED", name: { az: "BƏƏ dirhəmi", en: "UAE dirham", ru: "Дирхам ОАЭ" }, flag: "🇦🇪" },
  { code: "CNY", name: { az: "Çin yuanı", en: "Chinese yuan", ru: "Китайский юань" }, flag: "🇨🇳" },
  { code: "JPY", name: { az: "Yapon yeni", en: "Japanese yen", ru: "Японская иена" }, flag: "🇯🇵" },
  { code: "KRW", name: { az: "Koreya vonu", en: "Korean won", ru: "Корейская вона" }, flag: "🇰🇷" },
  { code: "INR", name: { az: "Hindistan rupisi", en: "Indian rupee", ru: "Индийская рупия" }, flag: "🇮🇳" },
  { code: "CAD", name: { az: "Kanada dolları", en: "Canadian dollar", ru: "Канадский доллар" }, flag: "🇨🇦" },
  { code: "AUD", name: { az: "Avstraliya dolları", en: "Australian dollar", ru: "Австралийский доллар" }, flag: "🇦🇺" },
  { code: "NZD", name: { az: "Yeni Zelandiya dolları", en: "New Zealand dollar", ru: "Новозеландский доллар" }, flag: "🇳🇿" },
  { code: "SEK", name: { az: "İsveç kronu", en: "Swedish krona", ru: "Шведская крона" }, flag: "🇸🇪" },
  { code: "NOK", name: { az: "Norveç kronu", en: "Norwegian krone", ru: "Норвежская крона" }, flag: "🇳🇴" },
  { code: "DKK", name: { az: "Danimarka kronu", en: "Danish krone", ru: "Датская крона" }, flag: "🇩🇰" },
  { code: "PLN", name: { az: "Polşa zlotısı", en: "Polish zloty", ru: "Польский злотый" }, flag: "🇵🇱" },
  { code: "CZK", name: { az: "Çexiya kronu", en: "Czech koruna", ru: "Чешская крона" }, flag: "🇨🇿" },
  { code: "HUF", name: { az: "Macarıstan forinti", en: "Hungarian forint", ru: "Венгерский форинт" }, flag: "🇭🇺" },
  { code: "RON", name: { az: "Rumıniya leyi", en: "Romanian leu", ru: "Румынский лей" }, flag: "🇷🇴" },
  { code: "BGN", name: { az: "Bolqarıstan levi", en: "Bulgarian lev", ru: "Болгарский лев" }, flag: "🇧🇬" },
  { code: "BYN", name: { az: "Belarus rublu", en: "Belarusian ruble", ru: "Белорусский рубль" }, flag: "🇧🇾" },
  { code: "MDL", name: { az: "Moldova leyi", en: "Moldovan leu", ru: "Молдавский лей" }, flag: "🇲🇩" },
  { code: "RSD", name: { az: "Serbiya dinarı", en: "Serbian dinar", ru: "Сербский динар" }, flag: "🇷🇸" },
  { code: "KGS", name: { az: "Qırğızıstan somu", en: "Kyrgyz som", ru: "Киргизский сом" }, flag: "🇰🇬" },
  { code: "PKR", name: { az: "Pakistan rupisi", en: "Pakistani rupee", ru: "Пакистанская рупия" }, flag: "🇵🇰" },
  { code: "SGD", name: { az: "Sinqapur dolları", en: "Singapore dollar", ru: "Сингапурский доллар" }, flag: "🇸🇬" },
  { code: "HKD", name: { az: "Honq Konq dolları", en: "Hong Kong dollar", ru: "Гонконгский доллар" }, flag: "🇭🇰" },
  { code: "KWD", name: { az: "Küveyt dinarı", en: "Kuwaiti dinar", ru: "Кувейтский динар" }, flag: "🇰🇼" },
  { code: "QAR", name: { az: "Qətər rialı", en: "Qatari riyal", ru: "Катарский риал" }, flag: "🇶🇦" },
  { code: "ILS", name: { az: "İsrail şekeli", en: "Israeli shekel", ru: "Израильский шекель" }, flag: "🇮🇱" },
  { code: "SDR", name: { az: "SDR (BVF)", en: "SDR (IMF)", ru: "СДР (МВФ)" }, flag: "💎" },
  { code: "XAU", name: { az: "Qızıl (1 t.u.)", en: "Gold (1 troy oz)", ru: "Золото (1 тр. унц.)" }, flag: "🥇" },
  { code: "XAG", name: { az: "Gümüş (1 t.u.)", en: "Silver (1 troy oz)", ru: "Серебро (1 тр. унц.)" }, flag: "🥈" },
  { code: "XPT", name: { az: "Platin (1 t.u.)", en: "Platinum (1 troy oz)", ru: "Платина (1 тр. унц.)" }, flag: "⬜" },
  { code: "XPD", name: { az: "Palladium (1 t.u.)", en: "Palladium (1 troy oz)", ru: "Палладий (1 тр. унц.)" }, flag: "🔲" },
];

function formatAmount(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001 && n > 0) return n.toFixed(8);
  if (n < 0.01 && n > 0) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  if (n >= 1000000) return n.toLocaleString("az-AZ", { maximumFractionDigits: 2 });
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const pageTranslations = {
  az: {
    title: "Valyuta çevirici",
    description: "Valyutalar arası ani çevirmə — Mərkəzi Bankın rəsmi məzənnələri ilə (CBAR).",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "Məzənnə haqqında",
    formulaContent: `Bu çevirici Azərbaycan Mərkəzi Bankının (CBAR) rəsmi gündəlik məzənnələrindən istifadə edir.

Məzənnələr hər gün avtomatik yenilənir.

Mənbə: www.cbar.az`,
    from: "Buradan",
    to: "Bura",
    swapLabel: "Dəyişdir",
    exchangeRate: "Məzənnə",
    allCurrencies: "bütün valyutalarda",
    rateTable: "CBAR rəsmi məzənnə cədvəli",
    currencyCol: "Valyuta",
    oneUnitAzn: "1 vahid = AZN",
    oneAznEquals: "1 AZN =",
    source: "Mənbə",
    cbarOfficial: "Azərbaycan Respublikası Mərkəzi Bankı (CBAR)",
    rateDate: "Məzənnə tarixi",
    loading: "Məzənnələr yüklənir...",
    loadError: "Məzənnələr yüklənmədi. Təxmini dəyərlər göstərilir.",
    liveRates: "Canlı məzənnələr",
  },
  en: {
    title: "Currency Converter",
    description: "Instant currency conversion — with official Central Bank (CBAR) exchange rates.",
    breadcrumbCategory: "Finance",
    formulaTitle: "About exchange rates",
    formulaContent: `This converter uses official daily exchange rates from the Central Bank of Azerbaijan (CBAR).

Rates are updated automatically every day.

Source: www.cbar.az`,
    from: "From",
    to: "To",
    swapLabel: "Swap",
    exchangeRate: "Exchange rate",
    allCurrencies: "in all currencies",
    rateTable: "CBAR official rate table",
    currencyCol: "Currency",
    oneUnitAzn: "1 unit = AZN",
    oneAznEquals: "1 AZN =",
    source: "Source",
    cbarOfficial: "Central Bank of Azerbaijan (CBAR)",
    rateDate: "Rate date",
    loading: "Loading rates...",
    loadError: "Failed to load rates. Showing approximate values.",
    liveRates: "Live rates",
  },
  ru: {
    title: "Конвертер валют",
    description: "Мгновенная конвертация валют — по официальным курсам Центрального банка (CBAR).",
    breadcrumbCategory: "Финансы",
    formulaTitle: "О курсах валют",
    formulaContent: `Этот конвертер использует официальные ежедневные курсы Центрального банка Азербайджана (CBAR).

Курсы обновляются автоматически каждый день.

Источник: www.cbar.az`,
    from: "Из",
    to: "В",
    swapLabel: "Поменять",
    exchangeRate: "Курс",
    allCurrencies: "во всех валютах",
    rateTable: "Официальная таблица курсов CBAR",
    currencyCol: "Валюта",
    oneUnitAzn: "1 единица = AZN",
    oneAznEquals: "1 AZN =",
    source: "Источник",
    cbarOfficial: "Центральный банк Азербайджана (CBAR)",
    rateDate: "Дата курса",
    loading: "Загрузка курсов...",
    loadError: "Не удалось загрузить курсы. Показаны приблизительные значения.",
    liveRates: "Актуальные курсы",
  },
};

// Fallback rates (approximate) used if API fails
const fallbackRates: Record<string, number> = {
  AZN:1, USD:1.7, EUR:1.9608, GBP:2.2485, CHF:2.1283, TRY:0.0381, RUB:0.021123,
  UAH:0.0388, GEL:0.6327, KZT:0.003595, UZS:0.00014, TMT:0.4857, SAR:0.4529,
  AED:0.4628, CNY:0.247, JPY:0.01065, KRW:0.001127, INR:0.0183, CAD:1.2208,
  AUD:1.1741, NZD:0.9704, SEK:0.1801, NOK:0.1746, DKK:0.2624, PLN:0.4583,
  CZK:0.08, HUF:0.005102, RON:0.3847, BGN:0.946, BYN:0.5759, MDL:0.0966,
  RSD:0.0167, KGS:0.0194, PKR:0.006076, SGD:1.3221, HKD:0.2169, KWD:5.4949,
  QAR:0.4662, ILS:0.5423, SDR:2.3096, XAU:7950.492, XAG:124.129, XPT:3381.9885, XPD:2557.531,
};

export default function CurrencyConverter() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [amount, setAmount] = useState("1");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("AZN");
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [rateDate, setRateDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const url = `https://www.cbar.az/currencies/${dd}.${mm}.${yyyy}.xml`;

    fetch(url)
      .then((r) => r.text())
      .then((xml) => {
        const parsed: Record<string, number> = { AZN: 1 };
        const regex = /<Valute Code="([^"]+)">\s*<Nominal>([^<]+)<\/Nominal>\s*<Name>[^<]*<\/Name>\s*<Value>([^<]+)<\/Value>/g;
        let m;
        while ((m = regex.exec(xml)) !== null) {
          const code = m[1];
          const nominal = parseFloat(m[2]);
          const value = parseFloat(m[3]);
          if (nominal > 0 && value > 0) parsed[code] = value / nominal;
        }
        const dateMatch = xml.match(/Date="([^"]+)"/);
        setRates((prev) => ({ ...prev, ...parsed }));
        setRateDate(dateMatch ? dateMatch[1] : `${dd}.${mm}.${yyyy}`);
        setIsLive(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const availableCurrencies = useMemo(
    () => currencyList.filter((c) => c.code in rates),
    [rates]
  );

  const from = availableCurrencies.find((c) => c.code === fromCode) || availableCurrencies[0];
  const to = availableCurrencies.find((c) => c.code === toCode) || availableCurrencies[1];

  const result = useMemo(() => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return null;
    const fromRate = rates[from.code] || 1;
    const toRate = rates[to.code] || 1;
    const inAZN = a * fromRate;
    const converted = inAZN / toRate;
    const rate = fromRate / toRate;
    const reverseRate = toRate / fromRate;
    return { converted, rate, reverseRate, inAZN };
  }, [amount, from, to, rates]);

  const swap = useCallback(() => {
    setFromCode(toCode);
    setToCode(fromCode);
  }, [fromCode, toCode]);

  const allConversions = useMemo(() => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return [];
    const fromRate = rates[from.code] || 1;
    const inAZN = a * fromRate;
    return availableCurrencies
      .filter((c) => c.code !== from.code)
      .map((c) => {
        const cRate = rates[c.code] || 1;
        return { ...c, converted: inAZN / cRate, rate: fromRate / cRate };
      });
  }, [amount, from, rates, availableCurrencies]);

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
      relatedIds={["vat", "deposit", "salary", "customs-duty"]}
    >
      {/* Live badge */}
      {isLive && rateDate && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {pt.liveRates} — CBAR {rateDate}
          </span>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-muted text-sm mb-4">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
          {pt.loading}
        </div>
      )}

      {/* Converter */}
      <div className="space-y-4 mb-8">
        {/* From */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.from}</label>
          <div className="flex gap-3">
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="w-40 sm:w-48 px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
            >
              {availableCurrencies.map((c) => (
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
          <p className="text-xs text-muted mt-1">{from.flag} {from.name[lang]}</p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            className="p-3 rounded-full border border-border bg-white hover:bg-primary-light hover:border-primary transition-all group"
            aria-label={pt.swapLabel}
          >
            <svg className="w-5 h-5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.to}</label>
          <div className="flex gap-3">
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="w-40 sm:w-48 px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <div className="flex-1 px-4 py-3 rounded-xl border border-border bg-gray-50 text-foreground text-base font-semibold">
              {result ? formatAmount(result.converted) : "—"}
            </div>
          </div>
          <p className="text-xs text-muted mt-1">{to.flag} {to.name[lang]}</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Rate Display */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-2">{pt.exchangeRate}</p>
            <p className="text-2xl font-bold mb-1">
              1 {from.code} = {formatAmount(result.rate)} {to.code}
            </p>
            <p className="text-sm text-blue-200">
              1 {to.code} = {formatAmount(result.reverseRate)} {from.code}
            </p>
          </div>

          {/* All Conversions */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>💱</span>
              {amount} {from.code} — {pt.allCurrencies}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allConversions.map((c) => (
                <div
                  key={c.code}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    c.code === toCode
                      ? "border-primary bg-primary-light"
                      : "border-border bg-white hover:border-primary/30"
                  }`}
                  onClick={() => setToCode(c.code)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.code}</p>
                      <p className="text-xs text-muted">{c.name[lang]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatAmount(c.converted)}</p>
                    <p className="text-xs text-muted">1 {from.code} = {formatAmount(c.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rates Table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📊</span>
              {pt.rateTable}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">{pt.currencyCol}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.oneUnitAzn}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.oneAznEquals}</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCurrencies
                    .filter((c) => c.code !== "AZN")
                    .map((c) => {
                      const r = rates[c.code] || 0;
                      return (
                        <tr key={c.code} className="border-t border-border hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            {c.flag} {c.code} — {c.name[lang]}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-primary">
                            {formatAmount(r)} AZN
                          </td>
                          <td className="px-4 py-3 text-right text-muted">
                            {r > 0 ? formatAmount(1 / r) : "—"} {c.code}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Source info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">🏦</span>
              <div>
                <p className="text-sm font-semibold text-blue-800">{pt.source}: {pt.cbarOfficial}</p>
                {rateDate && <p className="text-xs text-blue-600 mt-1">{pt.rateDate}: {rateDate}</p>}
                <p className="text-xs text-blue-600 mt-0.5">www.cbar.az</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
