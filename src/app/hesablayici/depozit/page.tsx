"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Currency = "AZN" | "USD";
type PayoutType = "end" | "monthly";

interface MonthRow {
  month: number;
  interest: number;
  payout: number;
  balance: number;
}

function formatMoney(n: number, currency: Currency): string {
  const formatted = n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} ${currency}`;
}

export default function DepositCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [payoutType, setPayoutType] = useState<PayoutType>("end");
  const [showFullTable, setShowFullTable] = useState(false);

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    const m = parseInt(months);

    if (!a || a <= 0 || !r || r <= 0 || !m || m <= 0) return null;

    const monthlyRate = r / 100 / 12;
    const table: MonthRow[] = [];

    if (payoutType === "end") {
      // Mürəkkəb faiz — faiz depozitə əlavə olunur
      let balance = a;
      let totalInterest = 0;

      for (let i = 1; i <= m; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        balance += interest;
        table.push({
          month: i,
          interest,
          payout: 0,
          balance,
        });
      }

      return {
        totalInterest,
        finalAmount: balance,
        monthlyInterest: 0,
        table,
      };
    } else {
      // Sadə faiz — faiz hər ay ödənilir
      const monthlyInterest = a * monthlyRate;
      const totalInterest = monthlyInterest * m;

      for (let i = 1; i <= m; i++) {
        table.push({
          month: i,
          interest: monthlyInterest,
          payout: monthlyInterest,
          balance: a,
        });
      }

      return {
        totalInterest,
        finalAmount: a,
        monthlyInterest,
        table,
      };
    }
  }, [amount, rate, months, payoutType]);

  const visibleRows = result
    ? showFullTable
      ? result.table
      : result.table.slice(0, 12)
    : [];

  return (
    <CalculatorLayout
      title="Depozit hesablayıcısı"
      description="Məbləğ, faiz, müddət və ödəniş növünü seçin — depozit gəlirinizi hesablayın."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Depozit hesablayıcısı" },
      ]}
      formulaTitle="Depozit faizi necə hesablanır?"
      formulaContent={`Aylıq faiz ödənişi (sadə faiz):
Aylıq gəlir = Məbləğ × (İllik faiz ÷ 12 ÷ 100)
Ümumi gəlir = Aylıq gəlir × Müddət (ay)

Müddət sonunda (mürəkkəb faiz):
Hər ay faiz depozitə əlavə olunur və növbəti ay üçün bazaya daxil edilir.
Yekun məbləğ = Məbləğ × (1 + aylıq faiz)ⁿ

Azərbaycanda depozit sığortası:
• Fiziki şəxslər üçün 100,000 AZN-dək sığortalanır
• USD depozitlər üçün ekvivalent məbləğ tətbiq olunur`}
      relatedIds={["loan", "currency", "salary", "dividend-tax"]}
    >
      {/* Currency Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setCurrency("AZN")}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currency === "AZN"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          🇦🇿 Manat (AZN)
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currency === "USD"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          🇺🇸 Dollar (USD)
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 Depozit məbləği ({currency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📊 İllik faiz dərəcəsi (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder={currency === "AZN" ? "10" : "3"}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 Müddət (ay)
          </label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            placeholder="12"
            min="1"
            max="120"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Payout Type */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">
          Faiz ödəniş üsulu
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setPayoutType("monthly")}
            className={`p-4 rounded-xl border text-left transition-all ${
              payoutType === "monthly"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">📆</span>
            <p className="text-sm font-medium text-foreground">Aylıq ödəniş</p>
            <p className="text-xs text-muted mt-1">Faiz hər ay hesabınıza köçürülür (sadə faiz)</p>
          </button>
          <button
            onClick={() => setPayoutType("end")}
            className={`p-4 rounded-xl border text-left transition-all ${
              payoutType === "end"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏦</span>
            <p className="text-sm font-medium text-foreground">Müddətin sonunda</p>
            <p className="text-xs text-muted mt-1">Faiz depozitə əlavə olunur (mürəkkəb faiz)</p>
          </button>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-green-100 mb-1">Ümumi faiz gəliri</p>
              <p className="text-3xl font-bold">{formatMoney(result.totalInterest, currency)}</p>
            </div>

            {payoutType === "monthly" ? (
              <div className="bg-primary-light rounded-2xl border border-blue-200 p-6 text-center">
                <p className="text-sm text-primary mb-1">Aylıq faiz gəliri</p>
                <p className="text-2xl font-bold text-primary">{formatMoney(result.monthlyInterest, currency)}</p>
                <p className="text-xs text-muted mt-1">hər ay hesabınıza</p>
              </div>
            ) : (
              <div className="bg-primary-light rounded-2xl border border-blue-200 p-6 text-center">
                <p className="text-sm text-primary mb-1">Yekun məbləğ</p>
                <p className="text-2xl font-bold text-primary">{formatMoney(result.finalAmount, currency)}</p>
                <p className="text-xs text-muted mt-1">əsas + faiz</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Depozit məbləği</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(parseFloat(amount), currency)}</p>
            </div>
          </div>

          {/* Detail Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Hesablama detalları
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Depozit məbləği</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(parseFloat(amount), currency)}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İllik faiz dərəcəsi</span>
                <span className="text-sm font-medium text-foreground">{rate}%</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Müddət</span>
                <span className="text-sm font-medium text-foreground">{months} ay</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Faiz növü</span>
                <span className="text-sm font-medium text-foreground">
                  {payoutType === "monthly" ? "Sadə faiz (aylıq ödəniş)" : "Mürəkkəb faiz (kapitalizasiya)"}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">Ümumi faiz gəliri</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(result.totalInterest, currency)}</span>
              </div>
            </div>
          </div>

          {/* Monthly Table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Aylıq cədvəl
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">Ay</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Hesablanan faiz</th>
                    {payoutType === "monthly" && (
                      <th className="px-4 py-3 font-medium text-muted text-right">Ödəniş</th>
                    )}
                    <th className="px-4 py-3 font-medium text-muted text-right">
                      {payoutType === "end" ? "Balans" : "Depozit"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-t border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatMoney(row.interest, currency)}</td>
                      {payoutType === "monthly" && (
                        <td className="px-4 py-3 text-right text-primary">{formatMoney(row.payout, currency)}</td>
                      )}
                      <td className="px-4 py-3 text-right font-medium">{formatMoney(row.balance, currency)}</td>
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

          {/* Insurance Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span>🛡️</span>
              Depozit sığortası
            </h4>
            <p className="text-sm text-amber-700">
              Azərbaycan Depozit Sığorta Fondu fiziki şəxslərin bank depozitlərini{" "}
              {currency === "AZN" ? "100,000 AZN" : "ekvivalent məbləğdə"}-dək sığortalayır.
              Sığorta hadisəsi baş verdikdə əmanətçilərə kompensasiya ödənilir.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏧</span>
          <p>Nəticəni görmək üçün məbləğ, faiz və müddət daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
