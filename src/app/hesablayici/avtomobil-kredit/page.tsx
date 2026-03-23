"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type CarCondition = "new" | "used";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function calculateAnnuity(amount: number, yearlyRate: number, months: number) {
  const monthlyRate = yearlyRate / 100 / 12;

  if (monthlyRate === 0) {
    const payment = amount / months;
    return { payment, totalPayment: amount, totalInterest: 0, monthlyRate: 0 };
  }

  const payment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = payment * months;
  const totalInterest = totalPayment - amount;

  return { payment, totalPayment, totalInterest, monthlyRate };
}

function buildAmortizationSummary(
  amount: number,
  monthlyRate: number,
  monthlyPayment: number,
  months: number
): { firstYear: AmortizationRow[]; lastPayment: AmortizationRow } {
  const rows: AmortizationRow[] = [];
  let balance = amount;

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);

    if (i <= 12 || i === months) {
      rows.push({ month: i, payment: monthlyPayment, principal, interest, balance });
    }
  }

  return {
    firstYear: rows.filter((r) => r.month <= 12),
    lastPayment: rows[rows.length - 1],
  };
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CarLoanCalculator() {
  const [carPrice, setCarPrice] = useState("");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [loanTerm, setLoanTerm] = useState("36");
  const [interestRate, setInterestRate] = useState("");
  const [carCondition, setCarCondition] = useState<CarCondition>("new");
  const [showFullTable, setShowFullTable] = useState(false);

  const suggestedRate = carCondition === "new" ? "15" : "18";

  const result = useMemo(() => {
    const price = parseFloat(carPrice);
    const downPct = parseFloat(downPaymentPercent);
    const months = parseInt(loanTerm);
    const rate = parseFloat(interestRate) || parseFloat(suggestedRate);

    if (!price || price <= 0 || isNaN(downPct) || downPct < 0 || downPct > 99) return null;
    if (!months || months <= 0) return null;
    if (!rate || rate < 0) return null;

    const downPayment = (price * downPct) / 100;
    const loanAmount = price - downPayment;

    if (loanAmount <= 0) return null;

    const { payment, totalPayment, totalInterest, monthlyRate } = calculateAnnuity(loanAmount, rate, months);
    const amortization = buildAmortizationSummary(loanAmount, monthlyRate, payment, months);

    return {
      carPrice: price,
      downPayment,
      downPaymentPercent: downPct,
      loanAmount,
      monthlyPayment: payment,
      totalPayment,
      totalInterest,
      totalCost: downPayment + totalPayment,
      interestRate: rate,
      months,
      amortization,
    };
  }, [carPrice, downPaymentPercent, loanTerm, interestRate, suggestedRate]);

  const termOptions = [12, 24, 36, 48, 60, 72];

  return (
    <CalculatorLayout
      title="Avtomobil kredit hesablayıcısı"
      description="Avtomobil krediti üçün aylıq ödəniş, faiz və ümumi xərci hesablayın."
      breadcrumbs={[
        { label: "Avtomobil", href: "/?category=automotive" },
        { label: "Avtomobil krediti" },
      ]}
      formulaTitle="Avtomobil krediti necə hesablanır?"
      formulaContent={`Aylıq ödəniş (annuitet) = M × (r × (1+r)ⁿ) / ((1+r)ⁿ − 1)

M — kredit məbləği (qiymət − ilkin ödəniş)
r — aylıq faiz dərəcəsi (illik faiz / 12 / 100)
n — kredit müddəti (ay)

Azərbaycanda tipik faiz dərəcələri:
• Yeni avtomobil: 12–18% illik
• İşlənmiş avtomobil: 15–22% illik

İlkin ödəniş adətən 20–30% tələb olunur.
Daha yüksək ilkin ödəniş — daha az faiz xərci.`}
      relatedIds={["loan", "car-customs", "road-tax", "osago"]}
    >
      {/* Car Condition */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Avtomobilin vəziyyəti</label>
        <div className="grid grid-cols-2 gap-3 sm:w-1/2">
          <button
            onClick={() => setCarCondition("new")}
            className={`p-3 rounded-xl border text-center transition-all ${
              carCondition === "new"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🚗</span>
            <p className="text-xs font-medium text-foreground">Yeni</p>
            <p className="text-xs text-muted">12–18% illik</p>
          </button>
          <button
            onClick={() => setCarCondition("used")}
            className={`p-3 rounded-xl border text-center transition-all ${
              carCondition === "used"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🔧</span>
            <p className="text-xs font-medium text-foreground">İşlənmiş</p>
            <p className="text-xs text-muted">15–22% illik</p>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 Avtomobilin qiyməti (AZN)
          </label>
          <input
            type="number"
            value={carPrice}
            onChange={(e) => setCarPrice(e.target.value)}
            placeholder="30000"
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
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder={suggestedRate}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Down Payment Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          💳 İlkin ödəniş: {downPaymentPercent}%
          {carPrice && parseFloat(carPrice) > 0 && (
            <span className="text-muted font-normal">
              {" "}— {fmt((parseFloat(carPrice) * parseFloat(downPaymentPercent || "0")) / 100)} AZN
            </span>
          )}
        </label>
        <input
          type="range"
          min="0"
          max="80"
          step="5"
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>0%</span>
          <span>20%</span>
          <span>40%</span>
          <span>60%</span>
          <span>80%</span>
        </div>
      </div>

      {/* Loan Term */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">📅 Kredit müddəti</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {termOptions.map((term) => (
            <button
              key={term}
              onClick={() => setLoanTerm(String(term))}
              className={`p-3 rounded-xl border text-center transition-all ${
                loanTerm === String(term)
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-lg font-bold text-foreground">{term}</p>
              <p className="text-xs text-muted">ay</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Aylıq ödəniş</p>
              <p className="text-3xl font-bold">{fmt(result.monthlyPayment)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Kredit məbləği</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.loanAmount)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Artıq ödəniş (faiz)</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalInterest)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Ümumi xərcin strukturu</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-400"
                style={{ width: `${(result.downPayment / result.totalCost) * 100}%` }}
                title="İlkin ödəniş"
              />
              <div
                className="h-full bg-primary"
                style={{ width: `${(result.loanAmount / result.totalCost) * 100}%` }}
                title="Əsas borc"
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.totalInterest / result.totalCost) * 100}%` }}
                title="Faiz"
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                İlkin ödəniş: {fmt(result.downPayment)} AZN
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                Əsas borc: {fmt(result.loanAmount)} AZN
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                Faiz: {fmt(result.totalInterest)} AZN
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Ətraflı hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Avtomobilin qiyməti</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.carPrice)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İlkin ödəniş ({result.downPaymentPercent}%)</span>
                <span className="text-sm font-medium text-green-600">{fmt(result.downPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Kredit məbləği</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.loanAmount)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Faiz dərəcəsi</span>
                <span className="text-sm font-medium text-foreground">{result.interestRate}% illik</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Müddət</span>
                <span className="text-sm font-medium text-foreground">{result.months} ay</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Aylıq ödəniş</span>
                <span className="text-sm font-medium text-primary">{fmt(result.monthlyPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ümumi faiz ödənişi</span>
                <span className="text-sm font-medium text-amber-600">{fmt(result.totalInterest)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ümumi ödəniş (kredit)</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.totalPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Ümumi xərc (ilkin + kredit)</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.totalCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Amortization Summary */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              Ödəniş cədvəli (ilk 12 ay)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">Ay</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Ödəniş</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Əsas borc</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Faiz</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">Qalıq</th>
                  </tr>
                </thead>
                <tbody>
                  {(showFullTable
                    ? result.amortization.firstYear
                    : result.amortization.firstYear.slice(0, 6)
                  ).map((row) => (
                    <tr key={row.month} className="border-t border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 text-right">{fmt(row.payment)}</td>
                      <td className="px-4 py-3 text-right text-primary">{fmt(row.principal)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{fmt(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-medium">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                  {result.months > 12 && (
                    <tr className="border-t border-border bg-gray-50">
                      <td className="px-4 py-3 font-medium text-muted" colSpan={5}>
                        ... {result.months - 12} ay daha ...
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-border bg-primary-light">
                    <td className="px-4 py-3 font-bold text-primary-dark">{result.amortization.lastPayment.month}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.payment)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.principal)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.interest)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.balance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {result.amortization.firstYear.length > 6 && (
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
                    12 ayı tam göstər
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Bu hesablama təxmini xarakter daşıyır.
              Faktiki faiz dərəcəsi bankın siyasətinə, kredit tarixçəsinə və müraciət zamanına görə
              fərqlənə bilər. Komisyon və sığorta xərcləri daxil edilməyib.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🚗</span>
          <p>Nəticəni görmək üçün avtomobilin qiymətini daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
