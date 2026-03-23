"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [downPercent, setDownPercent] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const handleDownPaymentChange = (value: string) => {
    setDownPayment(value);
    const price = parseFloat(propertyPrice);
    const down = parseFloat(value);
    if (price > 0 && !isNaN(down)) {
      setDownPercent(((down / price) * 100).toFixed(1).replace(/\.0$/, ""));
    } else {
      setDownPercent("");
    }
  };

  const handleDownPercentChange = (value: string) => {
    setDownPercent(value);
    const price = parseFloat(propertyPrice);
    const pct = parseFloat(value);
    if (price > 0 && !isNaN(pct)) {
      setDownPayment(Math.round(price * pct / 100).toString());
    } else {
      setDownPayment("");
    }
  };

  const handlePropertyPriceChange = (value: string) => {
    setPropertyPrice(value);
    const price = parseFloat(value);
    // If percent is set, recalculate amount
    const pct = parseFloat(downPercent);
    if (price > 0 && !isNaN(pct)) {
      setDownPayment(Math.round(price * pct / 100).toString());
    }
  };
  const [showFullTable, setShowFullTable] = useState(false);

  const result = useMemo(() => {
    const price = parseFloat(propertyPrice);
    const down = parseFloat(downPayment) || 0;
    const r = parseFloat(rate);
    const y = parseInt(years);

    if (!price || price <= 0 || isNaN(r) || r < 0 || !y || y <= 0) return null;
    if (down >= price) return null;

    const loanAmount = price - down;
    const months = y * 12;
    const monthlyRate = r / 100 / 12;

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / months;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    // Amortization table
    const table: AmortizationRow[] = [];
    let balance = loanAmount;
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance = Math.max(0, balance - principal);
      table.push({ month: i, payment: monthlyPayment, principal, interest, balance });
    }

    // Yearly summary
    const yearlyData: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let yr = 0; yr < y; yr++) {
      const yearRows = table.slice(yr * 12, (yr + 1) * 12);
      const yrPrincipal = yearRows.reduce((s, r) => s + r.principal, 0);
      const yrInterest = yearRows.reduce((s, r) => s + r.interest, 0);
      const yrBalance = yearRows[yearRows.length - 1]?.balance || 0;
      yearlyData.push({ year: yr + 1, principal: yrPrincipal, interest: yrInterest, balance: yrBalance });
    }

    return {
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      totalWithDown: totalPayment + down,
      downPercent: price > 0 ? (down / price) * 100 : 0,
      months,
      table,
      yearlyData,
    };
  }, [propertyPrice, downPayment, rate, years]);

  const visibleRows = result
    ? showFullTable
      ? result.table
      : result.table.slice(0, 12)
    : [];

  return (
    <CalculatorLayout
      title="İpoteka hesablayıcısı"
      description="Əmlakın qiyməti, ilkin ödəniş, faiz və müddəti daxil edin — aylıq ipoteka ödənişini hesablayın."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "İpoteka hesablayıcısı" },
      ]}
      formulaTitle="İpoteka ödənişi necə hesablanır?"
      formulaContent={`Kredit məbləği = Əmlak qiyməti − İlkin ödəniş

Aylıq ödəniş = K × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

K — kredit məbləği
r — aylıq faiz dərəcəsi (illik faiz ÷ 12 ÷ 100)
n — müddət (ay)

Azərbaycanda ipoteka:
• İlkin ödəniş: adətən 20-30%
• Müddət: 1-30 il
• Faiz dərəcəsi: 4-8% (güzəştli), 10-16% (standart)`}
      relatedIds={["loan", "property-tax", "salary", "deposit"]}
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🏠 Əmlakın qiyməti (AZN)
          </label>
          <input
            type="number"
            value={propertyPrice}
            onChange={(e) => handlePropertyPriceChange(e.target.value)}
            placeholder="150000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 İlkin ödəniş
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(e.target.value)}
                placeholder="30000"
                min="0"
                className="w-full px-4 py-3 pr-14 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">AZN</span>
            </div>
            <div className="w-24 relative">
              <input
                type="number"
                value={downPercent}
                onChange={(e) => handleDownPercentChange(e.target.value)}
                placeholder="20"
                min="0"
                max="100"
                step="1"
                className="w-full px-4 py-3 pr-8 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📊 İllik faiz dərəcəsi (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="8"
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 Müddət (il)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="15"
            min="1"
            max="30"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Aylıq ödəniş</p>
              <p className="text-3xl font-bold">{formatMoney(result.monthlyPayment)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Kredit məbləği</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(result.loanAmount)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Artıq ödəniş (faiz)</p>
              <p className="text-2xl font-bold text-amber-700">{formatMoney(result.totalInterest)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Ümumi hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Əmlak qiyməti</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(parseFloat(propertyPrice))} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İlkin ödəniş ({result.downPercent.toFixed(1)}%)</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(parseFloat(downPayment) || 0)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Kredit məbləği</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.loanAmount)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Müddət</span>
                <span className="text-sm font-medium text-foreground">{years} il ({result.months} ay)</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ümumi faiz ödənişi</span>
                <span className="text-sm font-medium text-amber-700">{formatMoney(result.totalInterest)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Ümumi ödəniş (ilkin + kredit + faiz)</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.totalWithDown)} AZN</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Əsas borc</span>
              <span className="text-muted">Faiz</span>
            </div>
            <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(result.loanAmount / result.totalPayment) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">{formatMoney(result.loanAmount)} AZN</span>
              <span className="font-medium text-amber-700">{formatMoney(result.totalInterest)} AZN</span>
            </div>
          </div>

          {/* Yearly Summary */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              İllik icmal
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">İl</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Əsas borc</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Faiz</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Qalıq borc</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map((row) => (
                    <tr key={row.year} className="border-t border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.year}-ci il</td>
                      <td className="px-4 py-3 text-right text-primary">{formatMoney(row.principal)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{formatMoney(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Amortization Table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Aylıq annuitet cədvəli
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">Ay</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Ödəniş</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Əsas borc</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Faiz</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Qalıq borc</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-t border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(row.payment)}</td>
                      <td className="px-4 py-3 text-right text-primary">{formatMoney(row.principal)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{formatMoney(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.table.length > 12 && (
              <button
                onClick={() => setShowFullTable(!showFullTable)}
                className="mt-3 text-sm text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1 mx-auto"
              >
                {showFullTable ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Yığ
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Bütün {result.table.length} ayı göstər
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏡</span>
          <p>Nəticəni görmək üçün əmlak qiyməti, faiz və müddət daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
