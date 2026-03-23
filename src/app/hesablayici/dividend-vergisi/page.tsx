"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Azərbaycan dividend vergisi qaydaları
// Vergi Məcəlləsi, Maddə 123
// Fiziki şəxslər: 5%
// Hüquqi şəxslər: 5%

type RecipientType = "individual" | "legal";

const DIVIDEND_TAX_RATE = 0.05; // 5% for both

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function DividendTaxCalculator() {
  const [grossDividend, setGrossDividend] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("individual");
  const [frequency, setFrequency] = useState<"monthly" | "quarterly" | "annual">("annual");

  const result = useMemo(() => {
    const gross = parseFloat(grossDividend);
    if (!gross || gross <= 0) return null;

    const taxRate = DIVIDEND_TAX_RATE;
    const taxAmount = gross * taxRate;
    const netDividend = gross - taxAmount;

    // Annual calculations based on frequency
    let annualGross: number;
    let periodsPerYear: number;
    let periodLabel: string;

    switch (frequency) {
      case "monthly":
        annualGross = gross * 12;
        periodsPerYear = 12;
        periodLabel = "aylıq";
        break;
      case "quarterly":
        annualGross = gross * 4;
        periodsPerYear = 4;
        periodLabel = "rüblük";
        break;
      default:
        annualGross = gross;
        periodsPerYear = 1;
        periodLabel = "illik";
    }

    const annualTax = annualGross * taxRate;
    const annualNet = annualGross - annualTax;

    return {
      gross,
      taxRate,
      taxAmount,
      netDividend,
      annualGross,
      annualTax,
      annualNet,
      periodsPerYear,
      periodLabel,
      effectiveTaxRate: (taxAmount / gross) * 100,
    };
  }, [grossDividend, recipientType, frequency]);

  return (
    <CalculatorLayout
      title="Dividend vergisi hesablayıcısı"
      description="Dividend gəlirindən tutulacaq vergini hesablayın — fiziki və hüquqi şəxslər üçün."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Dividend vergisi hesablayıcısı" },
      ]}
      formulaTitle="Dividend vergisi necə hesablanır?"
      formulaContent={`Azərbaycanda dividend gəliri vergisi (Vergi Məcəlləsi, Maddə 123):

Fiziki şəxslər:
• Dividend gəlirindən 5% vergi tutulur
• Vergi ödəmə mənbəyində (şirkət tərəfindən) tutulur
• Əlavə bəyannamə tələb olunmur

Hüquqi şəxslər:
• Dividend gəlirindən 5% vergi tutulur
• Şirkət tərəfindən ödəmə mənbəyində tutulur

Hesablama:
Vergi məbləği = Ümumi dividend × 5%
Xalis dividend = Ümumi dividend − Vergi məbləği

Nümunə:
10 000 AZN dividend → 500 AZN vergi → 9 500 AZN xalis
Qeyd: Dividend vergisi mənfəət vergisindən sonra hesablanır (ikili vergitutma yoxdur).`}
      relatedIds={["salary", "freelancer-tax", "vat", "deposit"]}
    >
      {/* Recipient Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Alıcının statusu</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRecipientType("individual")}
            className={`p-4 rounded-xl border text-left transition-all ${
              recipientType === "individual"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">👤</span>
            <p className="text-sm font-medium text-foreground">Fiziki şəxs</p>
            <p className="text-xs text-muted mt-1">Dividend vergisi: 5%</p>
          </button>
          <button
            onClick={() => setRecipientType("legal")}
            className={`p-4 rounded-xl border text-left transition-all ${
              recipientType === "legal"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">🏢</span>
            <p className="text-sm font-medium text-foreground">Hüquqi şəxs</p>
            <p className="text-xs text-muted mt-1">Dividend vergisi: 5%</p>
          </button>
        </div>
      </div>

      {/* Frequency */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Ödəniş tezliyi</label>
        <div className="flex rounded-xl border border-border overflow-hidden">
          {([
            { value: "monthly" as const, label: "Aylıq" },
            { value: "quarterly" as const, label: "Rüblük" },
            { value: "annual" as const, label: "İllik" },
          ]).map((f) => (
            <button
              key={f.value}
              onClick={() => setFrequency(f.value)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                frequency === f.value
                  ? "bg-primary text-white"
                  : "bg-white text-muted hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          💰 Ümumi dividend məbləği (AZN)
        </label>
        <input
          type="number"
          value={grossDividend}
          onChange={(e) => setGrossDividend(e.target.value)}
          placeholder="10000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[1000, 5000, 10000, 25000, 50000].map((v) => (
            <button
              key={v}
              onClick={() => setGrossDividend(String(v))}
              className="px-2.5 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              {v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Ümumi dividend</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.gross)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Vergi (5%)</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.taxAmount)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Xalis dividend</p>
              <p className="text-2xl font-bold">{fmt(result.netDividend)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              İllik hesablama ({result.periodLabel} ödəniş)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">İllik ümumi dividend</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.annualGross)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik vergi</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.annualTax)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik xalis gəlir</p>
                <p className="text-lg font-bold text-primary">{fmt(result.annualNet)}</p>
                <p className="text-xs text-muted">AZN</p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Ətraflı hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ümumi dividend məbləği</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.gross)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Alıcı statusu</span>
                <span className="text-sm font-medium text-foreground">
                  {recipientType === "individual" ? "Fiziki şəxs" : "Hüquqi şəxs"}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Vergi dərəcəsi</span>
                <span className="text-sm font-medium text-foreground">5%</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">Vergi məbləği</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.taxAmount)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Xalis dividend</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.netDividend)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Dividendin bölgüsü</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${(result.netDividend / result.gross) * 100}%` }}
                title="Xalis dividend"
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.taxAmount / result.gross) * 100}%` }}
                title="Vergi"
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                Xalis: {fmt(result.netDividend)} AZN ({((result.netDividend / result.gross) * 100).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                Vergi: {fmt(result.taxAmount)} AZN ({((result.taxAmount / result.gross) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Quick Reference Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Sürətli müqayisə — müxtəlif məbləğlər
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[1000, 5000, 10000, 25000, 50000, 100000].map((amount) => {
                const tax = amount * DIVIDEND_TAX_RATE;
                const net = amount - tax;
                const isActive = Math.abs(amount - result.gross) < 0.01;
                return (
                  <div key={amount} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <span className="text-sm font-medium text-foreground">{fmt(amount)} AZN</span>
                    <div className="flex gap-6 text-sm">
                      <span className="text-muted">Vergi: <span className="font-medium text-amber-700">{fmt(tax)}</span></span>
                      <span className="text-muted">Xalis: <span className="font-medium text-primary">{fmt(net)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Qeyd:</span> Dividend vergisi ödəmə mənbəyində tutulur — yəni şirkət dividendi
              ödəyərkən vergini avtomatik tutur və dövlət büdcəsinə köçürür. Dividend alan şəxsin əlavə bəyannamə verməsinə
              ehtiyac yoxdur. Dividend mənfəət vergisi ödənildikdən sonra qalan xalis mənfəətdən ödənilir.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💹</span>
          <p>Nəticəni görmək üçün dividend məbləğini daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
