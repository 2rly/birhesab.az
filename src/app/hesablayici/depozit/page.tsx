"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Currency = "AZN" | "USD";
type PayoutType = "end" | "monthly";

interface MonthRow {
  month: number;
  interest: number;
  taxExempt: number;
  taxableAmount: number;
  tax: number;
  netInterest: number;
  payout: number;
  balance: number;
}

const TAX_RATE = 0.10; // 10% ÖMV
const MONTHLY_EXEMPTION = 200; // AZN aylıq güzəşt

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
  const [earlyWithdrawal, setEarlyWithdrawal] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);

  const m = parseInt(months) || 0;

  // 18 ay qaydası: AZN, müddət ≥18 ay, vaxtından əvvəl çıxarılmır
  const is18MonthRule = currency === "AZN" && m >= 18 && !earlyWithdrawal;

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);

    if (!a || a <= 0 || !r || r <= 0 || !m || m <= 0) return null;

    const monthlyRate = r / 100 / 12;
    const table: MonthRow[] = [];
    let totalInterest = 0;
    let totalTax = 0;
    let totalNetInterest = 0;
    let totalExempt = 0;

    if (payoutType === "end") {
      // Mürəkkəb faiz
      let balance = a;

      for (let i = 1; i <= m; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;

        let taxExempt: number;
        let taxableAmount: number;
        let tax: number;

        if (currency === "USD") {
          // Xarici valyuta: heç bir güzəşt yoxdur
          taxExempt = 0;
          taxableAmount = interest;
          tax = interest * TAX_RATE;
        } else if (is18MonthRule) {
          // AZN, ≥18 ay, vaxtında çıxarılır: 100% vergidən azad
          taxExempt = interest;
          taxableAmount = 0;
          tax = 0;
        } else {
          // AZN, 200₼ aylıq güzəşt
          taxExempt = Math.min(interest, MONTHLY_EXEMPTION);
          taxableAmount = Math.max(0, interest - MONTHLY_EXEMPTION);
          tax = taxableAmount * TAX_RATE;
        }

        const netInterest = interest - tax;
        totalTax += tax;
        totalNetInterest += netInterest;
        totalExempt += taxExempt;

        balance += interest;
        table.push({
          month: i,
          interest,
          taxExempt,
          taxableAmount,
          tax,
          netInterest,
          payout: 0,
          balance,
        });
      }

      return {
        totalInterest,
        totalTax,
        totalNetInterest,
        totalExempt,
        finalAmount: a + totalInterest,
        finalAmountAfterTax: a + totalNetInterest,
        monthlyInterest: 0,
        table,
      };
    } else {
      // Sadə faiz — hər ay ödənilir
      const monthlyInterest = a * monthlyRate;

      for (let i = 1; i <= m; i++) {
        totalInterest += monthlyInterest;

        let taxExempt: number;
        let taxableAmount: number;
        let tax: number;

        if (currency === "USD") {
          taxExempt = 0;
          taxableAmount = monthlyInterest;
          tax = monthlyInterest * TAX_RATE;
        } else if (is18MonthRule) {
          taxExempt = monthlyInterest;
          taxableAmount = 0;
          tax = 0;
        } else {
          taxExempt = Math.min(monthlyInterest, MONTHLY_EXEMPTION);
          taxableAmount = Math.max(0, monthlyInterest - MONTHLY_EXEMPTION);
          tax = taxableAmount * TAX_RATE;
        }

        const netInterest = monthlyInterest - tax;
        totalTax += tax;
        totalNetInterest += netInterest;
        totalExempt += taxExempt;

        table.push({
          month: i,
          interest: monthlyInterest,
          taxExempt,
          taxableAmount,
          tax,
          netInterest,
          payout: netInterest,
          balance: a,
        });
      }

      return {
        totalInterest,
        totalTax,
        totalNetInterest,
        totalExempt,
        finalAmount: a,
        finalAmountAfterTax: a,
        monthlyInterest,
        table,
      };
    }
  }, [amount, rate, months, payoutType, currency, is18MonthRule, m]);

  const visibleRows = result
    ? showFullTable
      ? result.table
      : result.table.slice(0, 12)
    : [];

  return (
    <CalculatorLayout
      title="Depozit hesablayıcısı"
      description="Depozit gəlirinizi və vergi tutulmalarını hesablayın — V.M. 102.1.22 güzəştləri ilə."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Depozit hesablayıcısı" },
      ]}
      formulaTitle="Depozit vergisi necə hesablanır? (V.M. 102.1.22)"
      formulaContent={`Aylıq faiz ödənişi (sadə faiz):
Aylıq gəlir = Məbləğ × (İllik faiz ÷ 12 ÷ 100)

Müddət sonunda (mürəkkəb faiz):
Yekun məbləğ = Məbləğ × (1 + aylıq faiz)ⁿ

V.M. 102.1.22-3 (200₼ Güzəşti):
• AZN depozitlər üzrə aylıq faiz gəlirinin 200₼-dək hissəsi vergidən azaddır
• Vergi (10%) yalnız 200₼-i keçən hissədən tutulur
• Hər bir bankda ayrıca tətbiq olunur

V.M. 102.1.22-4 (18 Ay Qaydası):
• AZN depozit, müddəti ≥18 ay, vaxtından əvvəl çıxarılmırsa
• Bütün faiz gəlirləri 100% vergidən azaddır (3 il müddətinə)
• Vaxtından əvvəl çıxarılsa, 200₼ güzəşt qaydası tətbiq olunur

Xarici valyuta (USD/EUR):
• Heç bir güzəşt yoxdur
• Bütün faiz gəlirindən 10% ÖMV tutulur

Depozit sığortası:
• Fiziki şəxslər üçün 100.000 AZN-dək sığortalanır`}
      relatedIds={["loan", "currency", "salary", "dividend-tax"]}
    >
      {/* Valyuta seçimi */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setCurrency("AZN")}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currency === "AZN"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Manat (AZN)
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currency === "USD"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Dollar (USD)
        </button>
      </div>

      {/* Daxiletmə sahələri */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Depozit məbləği ({currency})
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
            İllik faiz dərəcəsi (%)
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
            Müddət (ay)
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
          <div className="flex gap-2 mt-2">
            {[6, 12, 18, 24, 36].map((v) => (
              <button
                key={v}
                onClick={() => setMonths(String(v))}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  months === String(v)
                    ? "border-primary bg-primary-light text-primary font-medium"
                    : "border-border bg-white text-muted hover:border-primary/30"
                }`}
              >
                {v} ay
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Faiz ödəniş üsulu */}
      <div className="mb-6">
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
            <p className="text-sm font-medium text-foreground">Müddətin sonunda</p>
            <p className="text-xs text-muted mt-1">Faiz depozitə əlavə olunur (mürəkkəb faiz)</p>
          </button>
        </div>
      </div>

      {/* 18 ay qaydası — vaxtından əvvəl çıxarma seçimi */}
      {currency === "AZN" && m >= 18 && (
        <div className="mb-6">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/30 transition-all">
            <input
              type="checkbox"
              checked={earlyWithdrawal}
              onChange={(e) => setEarlyWithdrawal(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Depoziti 18 aydan əvvəl çıxaracağam</p>
              <p className="text-[11px] text-muted">İşarələsəniz, 100% vergisiz güzəşt əvəzinə 200₼ aylıq güzəşt tətbiq olunacaq</p>
            </div>
          </label>
        </div>
      )}

      {/* Vergi qaydası haqqında qısa izah */}
      <div className={`mb-8 rounded-xl border p-4 ${
        currency === "USD"
          ? "bg-red-50 border-red-200"
          : is18MonthRule
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
      }`}>
        {currency === "USD" ? (
          <p className="text-sm text-red-800">
            Xarici valyuta depozitlərində heç bir güzəşt yoxdur — bütün faiz gəlirindən <span className="font-semibold">10% ÖMV</span> tutulur.
          </p>
        ) : is18MonthRule ? (
          <p className="text-sm text-green-800">
            <span className="font-semibold">V.M. 102.1.22-4:</span> AZN depozit, müddəti {m} ay ({"\u2265"}18 ay), vaxtında çıxarılacaq — bütün faiz gəlirləri <span className="font-semibold">100% vergidən azaddır</span>.
          </p>
        ) : (
          <p className="text-sm text-amber-800">
            <span className="font-semibold">V.M. 102.1.22-3:</span> Aylıq faiz gəlirinin <span className="font-semibold">200₼-dək</span> hissəsi vergidən azaddır. 200₼-dən artıq hissədən <span className="font-semibold">10% ÖMV</span> tutulur.
          </p>
        )}
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-green-100 mb-1">Ümumi faiz gəliri</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalInterest, currency)}</p>
            </div>

            {result.totalTax > 0 ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-center">
                <p className="text-sm text-red-600 mb-1">Vergi (10% ÖMV)</p>
                <p className="text-2xl font-bold text-red-700">-{formatMoney(result.totalTax, currency)}</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
                <p className="text-sm text-green-600 mb-1">Vergi</p>
                <p className="text-2xl font-bold text-green-700">0,00 {currency}</p>
                <p className="text-xs text-green-600 mt-0.5">100% vergidən azad</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Xalis faiz gəliri</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalNetInterest, currency)}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
              <p className="text-sm text-muted mb-1">
                {payoutType === "end" ? "Yekun məbləğ" : "Depozit məbləği"}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(payoutType === "end" ? result.finalAmountAfterTax : parseFloat(amount), currency)}
              </p>
            </div>
          </div>

          {/* Hesablama detalları */}
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
                <span className="text-sm text-muted">Vergi qaydası</span>
                <span className="text-sm font-medium text-foreground">
                  {currency === "USD"
                    ? "Güzəşt yoxdur — 10% ÖMV"
                    : is18MonthRule
                      ? "V.M. 102.1.22-4 — 100% vergidən azad"
                      : "V.M. 102.1.22-3 — aylıq 200₼ güzəşt"}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">Ümumi faiz gəliri</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(result.totalInterest, currency)}</span>
              </div>
              {result.totalExempt > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Vergidən azad hissə</span>
                  <span className="text-sm font-medium text-green-600">{formatMoney(result.totalExempt, currency)}</span>
                </div>
              )}
              {result.totalTax > 0 && (
                <div className="flex justify-between px-5 py-3 bg-red-50">
                  <span className="text-sm font-semibold text-red-700">Vergi tutulması (10%)</span>
                  <span className="text-sm font-bold text-red-700">-{formatMoney(result.totalTax, currency)}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Xalis faiz gəliri (əlinizə çatan)</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.totalNetInterest, currency)}</span>
              </div>
            </div>
          </div>

          {/* Aylıq cədvəl */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Aylıq cədvəl
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-3 font-medium text-muted">Ay</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">Faiz</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">Güzəşt</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">Vergi</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">Xalis</th>
                    {payoutType === "end" && (
                      <th className="px-3 py-3 font-medium text-muted text-right">Balans</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-t border-border hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium">{row.month}</td>
                      <td className="px-3 py-3 text-right text-green-600">{formatMoney(row.interest, currency)}</td>
                      <td className="px-3 py-3 text-right text-muted">
                        {row.taxExempt > 0 ? formatMoney(row.taxExempt, currency) : "—"}
                      </td>
                      <td className="px-3 py-3 text-right text-red-600">
                        {row.tax > 0 ? `-${formatMoney(row.tax, currency)}` : "0,00"}
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-primary">{formatMoney(row.netInterest, currency)}</td>
                      {payoutType === "end" && (
                        <td className="px-3 py-3 text-right font-medium">{formatMoney(row.balance, currency)}</td>
                      )}
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

          {/* Vergi qaydaları izahı */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Depozit vergisi qaydaları (Vergi Məcəlləsi)
            </h4>
            <div className="space-y-4 text-sm text-muted">
              <div>
                <p className="font-medium text-foreground">V.M. 102.1.22-3 — Aylıq 200₼ güzəşt</p>
                <p>Yerli bank və xarici bankın AR-dakı filialı tərəfindən fiziki şəxslərin <span className="font-medium text-foreground">hər bir bankda</span> milli valyutada olan depozitlər üzrə hesablanan aylıq faiz gəlirlərinin <span className="font-medium text-foreground">200₼-dək</span> hissəsi gəlir vergisindən azaddır. Müddət tələbi yoxdur.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">V.M. 102.1.22-4 — 18 ay qaydası</p>
                <p>Milli valyutada olan depozit <span className="font-medium text-foreground">18 ay və daha artıq</span> müddətə yerləşdirildikdə və məbləğ <span className="font-medium text-foreground">18 aydan tez olmadan</span> ödənildikdə, hesablanmış faiz gəlirlərinin tam hissəsi <span className="font-medium text-foreground">3 il müddətinə</span> vergidən azaddır (2024-cü ildən). Vaxtından əvvəl çıxarılsa, 200₼ güzəşt qaydası tətbiq olunur.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Xarici valyuta (USD/EUR)</p>
                <p>Heç bir güzəşt yoxdur — bütün faiz gəlirindən <span className="font-medium text-foreground">10% vergi</span> tutulur. 18 ay qaydası yalnız milli valyutaya şamil edilir.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Hər bir bank ayrıca</p>
                <p>Güzəşt hər bir bankda ayrı-ayrılıqda tətbiq olunur. 5 bankda əmanətiniz varsa, hər birində 200₼ güzəşt ayrıca hesablanır.</p>
              </div>
            </div>
          </div>

          {/* Misallar */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span>📝</span>
              Praktiki misallar
            </h4>
            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">Misal 1: 12 aylıq AZN depozit</p>
                <p className="text-muted">30.000₼ məbləğ, illik 10%, 12 ay müddətinə</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>Ümumi faiz: 30.000 × 10% = <span className="font-medium text-foreground">3.000₼</span></p>
                  <p>İllik güzəşt: 200 × 12 = <span className="font-medium text-foreground">2.400₼</span></p>
                  <p>Vergiyə cəlb olunan: 3.000 − 2.400 = <span className="font-medium text-foreground">600₼</span></p>
                  <p>Vergi (10%): 600 × 10% = <span className="font-medium text-red-600">60₼</span></p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">Misal 2: Aylıq ödənişli depozit</p>
                <p className="text-muted">180.000₼ məbləğ, illik 8%, aylıq ödəniş</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>Aylıq faiz: 180.000 × 8% ÷ 12 = <span className="font-medium text-foreground">1.200₼</span></p>
                  <p>Aylıq vergi: (1.200 − 200) × 10% = <span className="font-medium text-red-600">100₼</span></p>
                  <p>Aylıq əlinizə çatan: 1.200 − 100 = <span className="font-medium text-primary">1.100₼</span></p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">Misal 3: 24 aylıq AZN depozit (vergisiz)</p>
                <p className="text-muted">30.000₼ məbləğ, illik 10%, 24 ay, vaxtında çıxarılır</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>Müddət ≥18 ay və vaxtından əvvəl çıxarılmır → <span className="font-medium text-green-700">100% vergidən azad</span></p>
                  <p>Aylıq 1.200₼ faizin hamısını alacaqsınız, heç bir vergi tutulmayacaq.</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">Misal 4: 24 aylıq depozit, 12 aydan sonra çıxarılır</p>
                <p className="text-muted">30.000₼ məbləğ, illik 10%, 24 aylıq müqavilə, amma 12 ayda çıxarılır</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>Müddət 24 ay (≥18) olsa da, 18 aydan <span className="font-medium text-red-600">tez çıxarıldığı üçün</span> V.M. 102.1.22-4 tətbiq olunmur.</p>
                  <p>V.M. 102.1.22-3 tətbiq olunur: aylıq 200₼ güzəşt.</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">Misal 5: USD depozit</p>
                <p className="text-muted">50.000 USD, 24 ay müddətinə</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>Xarici valyutada olduğu üçün <span className="font-medium text-red-600">heç bir güzəşt yoxdur</span>.</p>
                  <p>18 ay qaydası yalnız milli valyutaya şamil olunur. Bütün faiz gəlirindən 10% vergi tutulur.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sual-Cavab */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span>❓</span>
              Tez-tez verilən suallar
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-foreground">5 bankda əmanətim var, hər biri ≥18 ay. Hamısı vergidən azaddır?</p>
                <p className="text-muted mt-1">Bəli. Güzəşt hər bir bankda ayrıca tətbiq olunur.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">12 aylıq əmanətdən 1.000₼ gəlir əldə edirəm. Hamısı vergiyə cəlb olunur?</p>
                <p className="text-muted mt-1">Xeyr. 1.000₼-dan 200₼ güzəşt çıxılır, 800₼ vergiyə cəlb olunur. Vergi: 800 × 10% = 80₼.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">24 aylıq USD əmanət vergidən azad olur?</p>
                <p className="text-muted mt-1">Xeyr. 18 ay qaydası yalnız milli valyutaya (AZN) şamil edilir. USD-dən 10% vergi tutulur.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Vergidən azadolma müddəti nə qədərdir?</p>
                <p className="text-muted mt-1">2024-cü ilin yanvarından etibarən 3 il müddətinə (V.M. 102.1.22-4). V.M. 123-cü maddəsinə əsasən faiz gəlirləri kapital gəlirləri olub, 10% dərəcə ilə ödəmə mənbəyində tutulur.</p>
              </div>
            </div>
          </div>

          {/* Depozit sığortası */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span>🛡️</span>
              Depozit sığortası
            </h4>
            <p className="text-sm text-amber-700">
              Azərbaycan Depozit Sığorta Fondu fiziki şəxslərin bank depozitlərini{" "}
              {currency === "AZN" ? "100.000 AZN" : "ekvivalent məbləğdə"}-dək sığortalayır.
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
