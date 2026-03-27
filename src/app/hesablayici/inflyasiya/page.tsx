"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// Azərbaycan Respublikası Dövlət Statistika Komitəsi — rəsmi illik inflyasiya (%)
// Mənbə: stat.gov.az
const INFLATION_DATA: { year: number; rate: number }[] = [
  { year: 2021, rate: 6.7 },
  { year: 2022, rate: 13.9 },
  { year: 2023, rate: 8.8 },
  { year: 2024, rate: 4.9 },
  { year: 2025, rate: 5.2 },
];

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pageTranslations = {
  az: {
    title: "İnflyasiya korrektoru",
    description: "Pulunuzun real alıcılıq qüvvəsini hesablayın — Dövlət Statistika Komitəsinin rəsmi illik inflyasiya göstəriciləri əsasında.",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "İnflyasiya korrektoru necə işləyir?",
    formulaContent: `Hesablama Azərbaycan Respublikası Dövlət Statistika Komitəsinin (stat.gov.az) rəsmi illik inflyasiya göstəriciləri əsasında aparılır.

Real dəyər = Nominal məbləğ / (1 + i₁) / (1 + i₂) / ... / (1 + iₙ)

Burada i₁, i₂, ... iₙ — hər ilin inflyasiya dərəcəsidir (onluq kəsr şəklində).

Məsələn, 2021-ci ildəki 1000 ₼ 2026-cı ildə:
1000 / 1.067 / 1.139 / 1.088 / 1.049 / 1.052 ≈ 681.46 ₼ alıcılıq qüvvəsinə bərabərdir.

Rəsmi illik inflyasiya (İQE):
• 2021: 6.7%
• 2022: 13.9%
• 2023: 8.8%
• 2024: 4.9%
• 2025: 5.2%`,
    annualInflationRate: "İllik inflyasiya dərəcəsi (Dövlət Statistika Komitəsi)",
    startYear: "Başlanğıc il",
    amountInYear: "-ci ildəki məbləğ (₼)",
    example: "Məs: 2000",
    amountOf: "-ci ildəki",
    realPurchasingPower: "-cı ildəki real alıcılıq qüvvəsi:",
    lostPurchasingPower: "İtirilən alıcılıq qüvvəsi:",
    cumulativeInflation: "Kumulativ inflyasiya:",
    realValueOfMoney: "Pulunuzun real dəyəri",
    nominalValue: "Nominal dəyər",
    realValue: "Real dəyər",
    annualInflationImpact: "İllik inflyasiya təsiri",
    yearCol: "İl",
    inflationCol: "İnflyasiya",
    yearStartCol: "İl başı",
    lossCol: "İtki",
    yearEndCol: "İl sonu",
    emptyState: "Nəticəni görmək üçün məbləği daxil edin.",
  },
  en: {
    title: "Inflation adjuster",
    description: "Calculate the real purchasing power of your money — based on official annual inflation data from the State Statistics Committee.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How does the inflation adjuster work?",
    formulaContent: `Calculation is based on official annual inflation data from the State Statistics Committee of Azerbaijan (stat.gov.az).

Real value = Nominal amount / (1 + i₁) / (1 + i₂) / ... / (1 + iₙ)

Where i₁, i₂, ... iₙ — inflation rate for each year (as a decimal).

Example: 1000 AZN in 2021 equals in 2026:
1000 / 1.067 / 1.139 / 1.088 / 1.049 / 1.052 ≈ 681.46 AZN purchasing power.

Official annual inflation (CPI):
• 2021: 6.7%
• 2022: 13.9%
• 2023: 8.8%
• 2024: 4.9%
• 2025: 5.2%`,
    annualInflationRate: "Annual inflation rate (State Statistics Committee)",
    startYear: "Start year",
    amountInYear: " amount (₼)",
    example: "e.g.: 2000",
    amountOf: " ",
    realPurchasingPower: " real purchasing power:",
    lostPurchasingPower: "Lost purchasing power:",
    cumulativeInflation: "Cumulative inflation:",
    realValueOfMoney: "Real value of your money",
    nominalValue: "Nominal value",
    realValue: "Real value",
    annualInflationImpact: "Annual inflation impact",
    yearCol: "Year",
    inflationCol: "Inflation",
    yearStartCol: "Year start",
    lossCol: "Loss",
    yearEndCol: "Year end",
    emptyState: "Enter an amount to see the result.",
  },
  ru: {
    title: "Корректор инфляции",
    description: "Рассчитайте реальную покупательную способность ваших денег — на основе официальных данных Госкомстата.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как работает корректор инфляции?",
    formulaContent: `Расчёт основан на официальных данных годовой инфляции Государственного комитета статистики Азербайджана (stat.gov.az).

Реальная стоимость = Номинальная сумма / (1 + i₁) / (1 + i₂) / ... / (1 + iₙ)

Где i₁, i₂, ... iₙ — уровень инфляции каждого года (в десятичной форме).

Пример: 1000 AZN в 2021 году в 2026 году равны:
1000 / 1.067 / 1.139 / 1.088 / 1.049 / 1.052 ≈ 681.46 AZN покупательной способности.

Официальная годовая инфляция (ИПЦ):
• 2021: 6,7%
• 2022: 13,9%
• 2023: 8,8%
• 2024: 4,9%
• 2025: 5,2%`,
    annualInflationRate: "Годовой уровень инфляции (Госкомстат)",
    startYear: "Начальный год",
    amountInYear: " сумма (₼)",
    example: "Напр.: 2000",
    amountOf: " ",
    realPurchasingPower: " реальная покупательная способность:",
    lostPurchasingPower: "Потерянная покупательная способность:",
    cumulativeInflation: "Кумулятивная инфляция:",
    realValueOfMoney: "Реальная стоимость ваших денег",
    nominalValue: "Номинальная стоимость",
    realValue: "Реальная стоимость",
    annualInflationImpact: "Влияние годовой инфляции",
    yearCol: "Год",
    inflationCol: "Инфляция",
    yearStartCol: "Начало года",
    lossCol: "Потеря",
    yearEndCol: "Конец года",
    emptyState: "Введите сумму, чтобы увидеть результат.",
  },
};

export default function InflationCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const startYears = INFLATION_DATA.map((d) => d.year);
  const currentYear = INFLATION_DATA[INFLATION_DATA.length - 1].year + 1; // 2026

  const [amount, setAmount] = useState("");
  const [startYear, setStartYear] = useState(startYears[0]);

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return null;

    const relevantYears = INFLATION_DATA.filter((d) => d.year >= startYear);
    let cumulativeMultiplier = 1;
    const yearBreakdown: { year: number; rate: number; valueStart: number; valueEnd: number; lost: number }[] = [];

    let currentValue = val;
    for (const d of relevantYears) {
      const factor = 1 + d.rate / 100;
      cumulativeMultiplier *= factor;
      const valueEnd = currentValue / factor;
      const lost = currentValue - valueEnd;
      yearBreakdown.push({
        year: d.year,
        rate: d.rate,
        valueStart: currentValue,
        valueEnd,
        lost,
      });
      currentValue = valueEnd;
    }

    const adjustedValue = val / cumulativeMultiplier;
    const totalLost = val - adjustedValue;
    const totalInflationPercent = (cumulativeMultiplier - 1) * 100;

    return {
      originalAmount: val,
      adjustedValue,
      totalLost,
      totalInflationPercent,
      cumulativeMultiplier,
      yearBreakdown,
    };
  }, [amount, startYear]);

  const maxRate = Math.max(...INFLATION_DATA.map((d) => d.rate));

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
      relatedIds={["salary", "deposit", "currency"]}
    >
      {/* İnflyasiya tarixi barları */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-foreground mb-4">
          {pt.annualInflationRate}
        </h3>
        <div className="flex items-end gap-3 h-32">
          {INFLATION_DATA.map((d) => (
            <div key={d.year} className="flex-1 flex flex-col items-center">
              <span className="text-xs font-semibold text-foreground mb-1">
                {d.rate}%
              </span>
              <div
                className="w-full rounded-t-lg bg-primary transition-all"
                style={{ height: `${(d.rate / maxRate) * 100}%` }}
              />
              <span className="text-[11px] text-muted mt-1">{d.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Başlanğıc il seçimi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.startYear}</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
          >
            {startYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {startYear}{pt.amountInYear}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={pt.example}
            className="w-full p-3 rounded-xl border border-border bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <div className="flex gap-2 mt-2">
            {[500, 1000, 2000, 3000, 5000].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {v}₼
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nəticə */}
      {result ? (
        <div className="space-y-4 mt-6">
          {/* Əsas kart — itki */}
          <div className="bg-white rounded-2xl border-2 border-[#FF5722] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted mb-1">
                  {startYear}{pt.amountOf} {formatMoney(result.originalAmount)} ₼
                </p>
                <p className="text-sm text-muted">
                  {currentYear}{pt.realPurchasingPower}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {formatMoney(result.adjustedValue)} ₼
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted mb-1">{pt.lostPurchasingPower}</p>
                <p className="text-3xl font-bold" style={{ color: "#FF5722" }}>
                  −{formatMoney(result.totalLost)} ₼
                </p>
                <p className="text-xs text-muted mt-1">
                  {pt.cumulativeInflation} {result.totalInflationPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Vizual bar — orijinal vs real */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted mb-4">{pt.realValueOfMoney}</h3>
            <div className="space-y-3">
              {/* Orijinal */}
              <div>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{startYear} — {pt.nominalValue}</span>
                  <span>{formatMoney(result.originalAmount)} ₼</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-8">
                  <div className="bg-primary h-8 rounded-full flex items-center justify-end pr-3" style={{ width: "100%" }}>
                    <span className="text-xs font-semibold text-white">100%</span>
                  </div>
                </div>
              </div>
              {/* Real */}
              <div>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{currentYear} — {pt.realValue}</span>
                  <span>{formatMoney(result.adjustedValue)} ₼</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-8 relative">
                  <div
                    className="bg-emerald-500 h-8 rounded-l-full flex items-center justify-end pr-3"
                    style={{ width: `${(result.adjustedValue / result.originalAmount) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {((result.adjustedValue / result.originalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="absolute top-0 h-8 rounded-r-full flex items-center justify-center"
                    style={{
                      left: `${(result.adjustedValue / result.originalAmount) * 100}%`,
                      width: `${(result.totalLost / result.originalAmount) * 100}%`,
                      backgroundColor: "#FF5722",
                    }}
                  >
                    <span className="text-xs font-semibold text-white">
                      −{((result.totalLost / result.originalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* İllik bölgü */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted mb-3">{pt.annualInflationImpact}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-foreground">{pt.yearCol}</th>
                    <th className="text-right p-2 font-medium text-foreground">{pt.inflationCol}</th>
                    <th className="text-right p-2 font-medium text-foreground">{pt.yearStartCol}</th>
                    <th className="text-right p-2 font-medium" style={{ color: "#FF5722" }}>{pt.lossCol}</th>
                    <th className="text-right p-2 font-medium text-foreground">{pt.yearEndCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearBreakdown.map((row) => (
                    <tr key={row.year} className="border-b border-border/50">
                      <td className="p-2 text-foreground font-medium">{row.year}</td>
                      <td className="p-2 text-right text-muted">{row.rate}%</td>
                      <td className="p-2 text-right text-foreground">{formatMoney(row.valueStart)} ₼</td>
                      <td className="p-2 text-right font-medium" style={{ color: "#FF5722" }}>
                        −{formatMoney(row.lost)} ₼
                      </td>
                      <td className="p-2 text-right text-foreground">{formatMoney(row.valueEnd)} ₼</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
