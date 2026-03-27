"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface CurrencyInfo {
  code: string;
  name: Record<Lang, string>;
  flag: string;
  rateToAZN: number;
}

const currencies: CurrencyInfo[] = [
  { code: "AZN", name: { az: "Azərbaycan manatı", en: "Azerbaijani manat", ru: "Азербайджанский манат" }, flag: "🇦🇿", rateToAZN: 1 },
  { code: "USD", name: { az: "ABŞ dolları", en: "US dollar", ru: "Доллар США" }, flag: "🇺🇸", rateToAZN: 1.7 },
  { code: "EUR", name: { az: "Avro", en: "Euro", ru: "Евро" }, flag: "🇪🇺", rateToAZN: 1.85 },
  { code: "GBP", name: { az: "Britaniya funtu", en: "British pound", ru: "Британский фунт" }, flag: "🇬🇧", rateToAZN: 2.15 },
  { code: "CHF", name: { az: "İsveçrə frankı", en: "Swiss franc", ru: "Швейцарский франк" }, flag: "🇨🇭", rateToAZN: 1.92 },
  { code: "TRY", name: { az: "Türk lirəsi", en: "Turkish lira", ru: "Турецкая лира" }, flag: "🇹🇷", rateToAZN: 0.052 },
  { code: "RUB", name: { az: "Rusiya rublu", en: "Russian ruble", ru: "Российский рубль" }, flag: "🇷🇺", rateToAZN: 0.019 },
  { code: "UAH", name: { az: "Ukrayna qrivnası", en: "Ukrainian hryvnia", ru: "Украинская гривна" }, flag: "🇺🇦", rateToAZN: 0.041 },
  { code: "GEL", name: { az: "Gürcüstan larisi", en: "Georgian lari", ru: "Грузинский лари" }, flag: "🇬🇪", rateToAZN: 0.62 },
  { code: "KZT", name: { az: "Qazaxıstan tengesi", en: "Kazakh tenge", ru: "Казахстанский тенге" }, flag: "🇰🇿", rateToAZN: 0.0034 },
  { code: "UZS", name: { az: "Özbəkistan somu", en: "Uzbek som", ru: "Узбекский сум" }, flag: "🇺🇿", rateToAZN: 0.00013 },
  { code: "TMT", name: { az: "Türkmənistan manatı", en: "Turkmen manat", ru: "Туркменский манат" }, flag: "🇹🇲", rateToAZN: 0.486 },
  { code: "IRR", name: { az: "İran rialı", en: "Iranian rial", ru: "Иранский риал" }, flag: "🇮🇷", rateToAZN: 0.000040 },
  { code: "SAR", name: { az: "Səudiyyə riyalı", en: "Saudi riyal", ru: "Саудовский риял" }, flag: "🇸🇦", rateToAZN: 0.453 },
  { code: "AED", name: { az: "BƏƏ dirhəmi", en: "UAE dirham", ru: "Дирхам ОАЭ" }, flag: "🇦🇪", rateToAZN: 0.463 },
  { code: "CNY", name: { az: "Çin yuanı", en: "Chinese yuan", ru: "Китайский юань" }, flag: "🇨🇳", rateToAZN: 0.234 },
  { code: "JPY", name: { az: "Yapon yeni", en: "Japanese yen", ru: "Японская иена" }, flag: "🇯🇵", rateToAZN: 0.0113 },
  { code: "KRW", name: { az: "Koreya vonu", en: "Korean won", ru: "Корейская вона" }, flag: "🇰🇷", rateToAZN: 0.00124 },
  { code: "INR", name: { az: "Hindistan rupisi", en: "Indian rupee", ru: "Индийская рупия" }, flag: "🇮🇳", rateToAZN: 0.0202 },
  { code: "CAD", name: { az: "Kanada dolları", en: "Canadian dollar", ru: "Канадский доллар" }, flag: "🇨🇦", rateToAZN: 1.23 },
  { code: "AUD", name: { az: "Avstraliya dolları", en: "Australian dollar", ru: "Австралийский доллар" }, flag: "🇦🇺", rateToAZN: 1.1 },
  { code: "SEK", name: { az: "İsveç kronu", en: "Swedish krona", ru: "Шведская крона" }, flag: "🇸🇪", rateToAZN: 0.165 },
  { code: "NOK", name: { az: "Norveç kronu", en: "Norwegian krone", ru: "Норвежская крона" }, flag: "🇳🇴", rateToAZN: 0.161 },
  { code: "DKK", name: { az: "Danimarka kronu", en: "Danish krone", ru: "Датская крона" }, flag: "🇩🇰", rateToAZN: 0.248 },
  { code: "PLN", name: { az: "Polşa zlotısı", en: "Polish zloty", ru: "Польский злотый" }, flag: "🇵🇱", rateToAZN: 0.44 },
  { code: "CZK", name: { az: "Çexiya kronu", en: "Czech koruna", ru: "Чешская крона" }, flag: "🇨🇿", rateToAZN: 0.074 },
  { code: "HUF", name: { az: "Macarıstan forinti", en: "Hungarian forint", ru: "Венгерский форинт" }, flag: "🇭🇺", rateToAZN: 0.0047 },
  { code: "RON", name: { az: "Rumıniya leyi", en: "Romanian leu", ru: "Румынский лей" }, flag: "🇷🇴", rateToAZN: 0.372 },
  { code: "BGN", name: { az: "Bolqarıstan levi", en: "Bulgarian lev", ru: "Болгарский лев" }, flag: "🇧🇬", rateToAZN: 0.946 },
  { code: "BRL", name: { az: "Braziliya realı", en: "Brazilian real", ru: "Бразильский реал" }, flag: "🇧🇷", rateToAZN: 0.296 },
  { code: "MXN", name: { az: "Meksika pesosu", en: "Mexican peso", ru: "Мексиканское песо" }, flag: "🇲🇽", rateToAZN: 0.099 },
  { code: "EGP", name: { az: "Misir funtu", en: "Egyptian pound", ru: "Египетский фунт" }, flag: "🇪🇬", rateToAZN: 0.035 },
  { code: "PKR", name: { az: "Pakistan rupisi", en: "Pakistani rupee", ru: "Пакистанская рупия" }, flag: "🇵🇰", rateToAZN: 0.0061 },
  { code: "BTC", name: { az: "Bitkoin", en: "Bitcoin", ru: "Биткоин" }, flag: "₿", rateToAZN: 145000 },
];

function formatAmount(n: number): string {
  if (n < 0.01 && n > 0) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const pageTranslations = {
  az: {
    title: "Valyuta çevirici",
    description: "Valyutalar arası ani çevirmə — Mərkəzi Bankın təxmini məzənnələri ilə.",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "Məzənnə haqqında",
    formulaContent: `Bu çevirici Azərbaycan Mərkəzi Bankının təxmini məzənnələrindən istifadə edir.

Göstərilən məzənnələr informativ xarakter daşıyır və real vaxt məzənnələrindən fərqlənə bilər.

Dəqiq məzənnə üçün bankınızla və ya Mərkəzi Bankın saytı ilə yoxlayın:
www.cbar.az`,
    from: "Buradan",
    to: "Bura",
    swapLabel: "Dəyişdir",
    exchangeRate: "Məzənnə",
    allCurrencies: "bütün valyutalarda",
    rateTable: "AZN məzənnə cədvəli",
    currencyCol: "Valyuta",
    oneUnitAzn: "1 vahid = AZN",
    oneAznEquals: "1 AZN =",
    warning: "Diqqət",
    warningText: "Göstərilən məzənnələr təxmini xarakter daşıyır. Dəqiq məzənnə üçün Azərbaycan Mərkəzi Bankının rəsmi saytını (cbar.az) və ya bankınızı yoxlayın. Bank alış/satış məzənnələri fərqlənə bilər.",
  },
  en: {
    title: "Currency Converter",
    description: "Instant currency conversion — with approximate Central Bank exchange rates.",
    breadcrumbCategory: "Finance",
    formulaTitle: "About exchange rates",
    formulaContent: `This converter uses approximate exchange rates from the Central Bank of Azerbaijan.

The displayed rates are for informational purposes and may differ from real-time rates.

For exact rates, check with your bank or the Central Bank website:
www.cbar.az`,
    from: "From",
    to: "To",
    swapLabel: "Swap",
    exchangeRate: "Exchange rate",
    allCurrencies: "in all currencies",
    rateTable: "AZN rate table",
    currencyCol: "Currency",
    oneUnitAzn: "1 unit = AZN",
    oneAznEquals: "1 AZN =",
    warning: "Warning",
    warningText: "The displayed rates are approximate. For exact rates, check the official website of the Central Bank of Azerbaijan (cbar.az) or your bank. Bank buy/sell rates may differ.",
  },
  ru: {
    title: "Конвертер валют",
    description: "Мгновенная конвертация валют — по приблизительным курсам Центрального банка.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "О курсах валют",
    formulaContent: `Этот конвертер использует приблизительные курсы Центрального банка Азербайджана.

Отображаемые курсы носят информационный характер и могут отличаться от курсов в реальном времени.

Для точных курсов обратитесь в ваш банк или на сайт Центрального банка:
www.cbar.az`,
    from: "Из",
    to: "В",
    swapLabel: "Поменять",
    exchangeRate: "Курс",
    allCurrencies: "во всех валютах",
    rateTable: "Таблица курсов AZN",
    currencyCol: "Валюта",
    oneUnitAzn: "1 единица = AZN",
    oneAznEquals: "1 AZN =",
    warning: "Внимание",
    warningText: "Отображаемые курсы являются приблизительными. Для точных курсов проверьте официальный сайт Центрального банка Азербайджана (cbar.az) или ваш банк. Курсы покупки/продажи в банках могут отличаться.",
  },
};

export default function CurrencyConverter() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

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
              {amount} {fromCode} — {pt.allCurrencies}
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
                      <p className="text-xs text-muted">{c.name[lang]}</p>
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
                  {currencies
                    .filter((c) => c.code !== "AZN")
                    .map((c) => (
                      <tr key={c.code} className="border-t border-border hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {c.flag} {c.code} — {c.name[lang]}
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
              {pt.warning}
            </h4>
            <p className="text-sm text-amber-700">
              {pt.warningText}
            </p>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
