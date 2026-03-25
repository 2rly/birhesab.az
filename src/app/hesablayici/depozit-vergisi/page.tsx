"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Currency = "AZN" | "USD";

const TAX_RATE = 0.10;
const MONTHLY_EXEMPTION = 200;

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DepositTaxCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("12");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [earlyWithdrawal, setEarlyWithdrawal] = useState(false);

  const m = parseInt(months) || 0;
  const is18MonthRule = currency === "AZN" && m >= 18 && !earlyWithdrawal;

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);

    if (!a || a <= 0 || !r || r <= 0 || !m || m <= 0) return null;

    // Sadə faiz (aylıq ödəniş əsasında hesablanır)
    const monthlyInterest = a * (r / 100 / 12);
    const totalInterest = monthlyInterest * m;

    let monthlyExempt: number;
    let monthlyTaxable: number;
    let monthlyTax: number;

    if (currency === "USD") {
      monthlyExempt = 0;
      monthlyTaxable = monthlyInterest;
      monthlyTax = monthlyInterest * TAX_RATE;
    } else if (is18MonthRule) {
      monthlyExempt = monthlyInterest;
      monthlyTaxable = 0;
      monthlyTax = 0;
    } else {
      monthlyExempt = Math.min(monthlyInterest, MONTHLY_EXEMPTION);
      monthlyTaxable = Math.max(0, monthlyInterest - MONTHLY_EXEMPTION);
      monthlyTax = monthlyTaxable * TAX_RATE;
    }

    const totalExempt = monthlyExempt * m;
    const totalTaxable = monthlyTaxable * m;
    const totalTax = monthlyTax * m;
    const totalNetInterest = totalInterest - totalTax;
    const monthlyNet = monthlyInterest - monthlyTax;

    // Effektiv vergi dərəcəsi
    const effectiveTaxRate = totalInterest > 0 ? (totalTax / totalInterest) * 100 : 0;

    return {
      monthlyInterest,
      monthlyExempt,
      monthlyTaxable,
      monthlyTax,
      monthlyNet,
      totalInterest,
      totalExempt,
      totalTaxable,
      totalTax,
      totalNetInterest,
      effectiveTaxRate,
    };
  }, [amount, rate, months, currency, is18MonthRule, m]);

  return (
    <CalculatorLayout
      title="Depozit vergisi (ÖMV) hesablayıcısı"
      description="Depozit faiz gəlirindən tutulan vergini hesablayın — V.M. 102.1.22 güzəştləri ilə."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Depozit vergisi hesablayıcısı" },
      ]}
      formulaTitle="Depozit faiz gəlirindən vergi necə tutulur?"
      formulaContent={`Vergi Məcəlləsinin 123-cü maddəsinə əsasən, fiziki şəxslərin bank əmanətləri üzrə faiz gəlirləri kapital gəlirləri hesab olunur və banklar tərəfindən ödəmə mənbəyində 10% dərəcə ilə vergi tutulur.

V.M. 102.1.22-3 — Aylıq 200₼ güzəşt:
• Hər bir bankda, milli valyutada olan əmanətlər üzrə aylıq faiz gəlirinin 200₼-dək hissəsi vergidən azaddır
• Vergi (10%) yalnız 200₼-i keçən hissədən tutulur
• Müddət tələbi yoxdur, hər bankda ayrıca tətbiq olunur

V.M. 102.1.22-4 — 18 ay qaydası:
• AZN depozit ≥18 ay müddətə yerləşdirilib, 18 aydan tez çıxarılmırsa — bütün faiz gəlirləri 100% vergidən azaddır
• 2024-dən etibarən 3 il müddətinə qüvvədədir
• Vaxtından əvvəl çıxarılsa, V.M. 102.1.22-3 (200₼ güzəşt) tətbiq olunur

Xarici valyuta (USD/EUR):
• Heç bir güzəşt yoxdur — bütün faiz gəlirindən 10% vergi tutulur
• 18 ay qaydası yalnız milli valyutaya şamil edilir`}
      relatedIds={["deposit", "dividend-tax", "salary", "rental-income-tax"]}
    >
      {/* Valyuta */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setCurrency("AZN")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            currency === "AZN" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Manat (AZN)
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            currency === "USD" ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Xarici valyuta (USD/EUR)
        </button>
      </div>

      {/* Daxiletmə */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Depozit məbləği ({currency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="30000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[10000, 30000, 50000, 100000, 180000].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="px-2 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {(v / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            İllik faiz dərəcəsi (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="10"
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

      {/* 18 ay seçimi */}
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
              <p className="text-[11px] text-muted">100% vergisiz güzəşt əvəzinə 200₼ aylıq güzəşt tətbiq olunacaq</p>
            </div>
          </label>
        </div>
      )}

      {/* Vergi qaydası banner */}
      <div className={`mb-8 rounded-xl border p-4 ${
        currency === "USD"
          ? "bg-red-50 border-red-200"
          : is18MonthRule
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
      }`}>
        {currency === "USD" ? (
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">Xarici valyuta — güzəşt yoxdur</p>
            <p>Bütün faiz gəlirindən 10% ÖMV tutulur. 18 ay qaydası yalnız milli valyutaya şamil edilir.</p>
          </div>
        ) : is18MonthRule ? (
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">V.M. 102.1.22-4: 100% vergidən azad</p>
            <p>AZN depozit, müddəti {m} ay (≥18 ay), vaxtında çıxarılacaq — heç bir vergi tutulmayacaq.</p>
          </div>
        ) : (
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">V.M. 102.1.22-3: Aylıq 200₼ güzəşt</p>
            <p>Aylıq faiz gəlirinin 200₼-dək hissəsi vergidən azaddır. 200₼-dən artıq hissədən 10% vergi tutulur.</p>
          </div>
        )}
      </div>

      {/* Nəticələr */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-green-100 mb-1">Ümumi faiz gəliri</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalInterest)} {currency}</p>
            </div>
            {result.totalTax > 0 ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-center">
                <p className="text-sm text-red-600 mb-1">Tutulan vergi</p>
                <p className="text-2xl font-bold text-red-700">-{formatMoney(result.totalTax)} {currency}</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
                <p className="text-sm text-green-600 mb-1">Vergi</p>
                <p className="text-2xl font-bold text-green-700">0,00 {currency}</p>
                <p className="text-xs text-green-600">100% azad</p>
              </div>
            )}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Xalis gəlir</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalNetInterest)} {currency}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
              <p className="text-sm text-muted mb-1">Effektiv vergi dərəcəsi</p>
              <p className="text-2xl font-bold text-foreground">{result.effectiveTaxRate.toFixed(1)}%</p>
              <p className="text-xs text-muted">nominal 10%-dən</p>
            </div>
          </div>

          {/* Aylıq hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Aylıq vergi hesablaması
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Aylıq faiz gəliri</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.monthlyInterest)} {currency}</span>
              </div>
              {currency === "AZN" && !is18MonthRule && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Vergidən azad hissə (güzəşt)</span>
                  <span className="text-sm font-medium text-green-600">-{formatMoney(result.monthlyExempt)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Vergiyə cəlb olunan hissə</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.monthlyTaxable)} {currency}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">Aylıq vergi (10%)</span>
                <span className="text-sm font-bold text-red-700">
                  {result.monthlyTax > 0 ? `-${formatMoney(result.monthlyTax)}` : "0,00"} {currency}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Aylıq əlinizə çatan</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.monthlyNet)} {currency}</span>
              </div>
            </div>
          </div>

          {/* İllik / ümumi hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📅</span>
                Ümumi hesablama ({m} ay)
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ümumi faiz gəliri</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.totalInterest)} {currency}</span>
              </div>
              {result.totalExempt > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Vergidən azad hissə</span>
                  <span className="text-sm font-medium text-green-600">{formatMoney(result.totalExempt)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Vergiyə cəlb olunan</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(result.totalTaxable)} {currency}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">Ümumi vergi</span>
                <span className="text-sm font-bold text-red-700">
                  {result.totalTax > 0 ? `-${formatMoney(result.totalTax)}` : "0,00"} {currency}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Xalis faiz gəliri</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.totalNetInterest)} {currency}</span>
              </div>
            </div>
          </div>

          {/* Hesablama addımları */}
          {currency === "AZN" && !is18MonthRule && result.monthlyTax > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>🔢</span>
                  Hesablama addımları (V.M. 102.1.22-3)
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">1. Aylıq faiz gəliri:</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {formatMoney(parseFloat(amount))} × {rate}% ÷ 12 = {formatMoney(result.monthlyInterest)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">2. Güzəşt çıxılır (aylıq 200₼):</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {formatMoney(result.monthlyInterest)} − 200,00 = {formatMoney(result.monthlyTaxable)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">3. Aylıq vergi (10%):</p>
                  <p className="text-sm font-medium text-red-600 mt-1">
                    {formatMoney(result.monthlyTaxable)} × 10% = {formatMoney(result.monthlyTax)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted">4. Aylıq əlinizə çatan:</p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatMoney(result.monthlyInterest)} − {formatMoney(result.monthlyTax)} = {formatMoney(result.monthlyNet)} {currency}
                  </p>
                </div>
                <div className="px-5 py-3 bg-gray-50">
                  <p className="text-sm text-muted">5. Ümumi vergi ({m} ay):</p>
                  <p className="text-sm font-medium text-red-600 mt-1">
                    {formatMoney(result.monthlyTax)} × {m} ay = {formatMoney(result.totalTax)} {currency}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Misallar */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Qanunvericilik əsası
            </h4>
            <div className="space-y-3 text-sm text-muted">
              <div>
                <p className="font-medium text-foreground">V.M. 102.1.22-3</p>
                <p>Yerli bank və xarici bankın AR-dakı filialı tərəfindən fiziki şəxslərin hər bir bankda milli valyutada olan depozitlər üzrə hesablanan aylıq faiz gəlirlərinin 200₼-dək hissəsi gəlir vergisindən azaddır.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">V.M. 102.1.22-4</p>
                <p>Milli valyutada olan depozit 18 ay və daha artıq müddətə yerləşdirildikdə və depozitin məbləği 18 aydan tez olmadan ödənildikdə, hesablanmış faiz gəlirlərinin tam hissəsi 3 il müddətinə vergidən azad edilir.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">V.M. 123</p>
                <p>Fiziki şəxslərin əmanətləri üzrə faiz gəlirləri kapital gəlirləri olub, faiz gəlirlərinin milli və ya xarici valyutada olmasından asılı olmayaraq, banklar tərəfindən ödəmə mənbəyində 10% dərəcə ilə vergi tutulur.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🧾</span>
          <p>Nəticəni görmək üçün məbləğ, faiz və müddət daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
