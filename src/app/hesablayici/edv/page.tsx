"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Direction = "add" | "extract";
type VatRate = 18 | 10 | 5;
type PaymentType = "cash" | "cashless";

// Nağdsız ödənişdə ƏDV-nin 15%-i geri qaytarılır (cashback)
const CASHLESS_CASHBACK_RATE = 0.15;

const vatRates: { value: VatRate; label: string; description: string }[] = [
  { value: 18, label: "18%", description: "Standart dərəcə (əksər mal və xidmətlər)" },
  { value: 10, label: "10%", description: "Güzəştli dərəcə (ərzaq, dərman və s.)" },
  { value: 5, label: "5%", description: "Aşağı dərəcə (kənd təsərrüfatı və s.)" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function VATCalculator() {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("add");
  const [vatRate, setVatRate] = useState<VatRate>(18);
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");

  const result = useMemo(() => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return null;

    let priceWithoutVat: number, vatAmount: number, totalWithVat: number;

    if (direction === "add") {
      priceWithoutVat = a;
      vatAmount = a * (vatRate / 100);
      totalWithVat = a + vatAmount;
    } else {
      priceWithoutVat = a / (1 + vatRate / 100);
      vatAmount = a - priceWithoutVat;
      totalWithVat = a;
    }

    // Nağdsız ödənişdə ƏDV cashback
    const cashback = paymentType === "cashless" ? vatAmount * CASHLESS_CASHBACK_RATE : 0;
    const effectiveVat = vatAmount - cashback;
    const effectiveTotal = totalWithVat - cashback;
    const saving = cashback;

    return { priceWithoutVat, vatAmount, totalWithVat, cashback, effectiveVat, effectiveTotal, saving };
  }, [amount, direction, vatRate, paymentType]);

  return (
    <CalculatorLayout
      title="ƏDV hesablayıcısı"
      description="Əlavə Dəyər Vergisini hesablayın — məbləğə əlavə edin və ya məbləğdən ayırın."
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "ƏDV hesablayıcısı" },
      ]}
      formulaTitle="ƏDV necə hesablanır?"
      formulaContent={`ƏDV əlavə etmək:
ƏDV məbləği = Qiymət × (ƏDV dərəcəsi ÷ 100)
ƏDV-li qiymət = Qiymət + ƏDV məbləği

ƏDV ayırmaq (ƏDV-li qiymətdən):
ƏDV-siz qiymət = ƏDV-li qiymət ÷ (1 + ƏDV dərəcəsi ÷ 100)
ƏDV məbləği = ƏDV-li qiymət − ƏDV-siz qiymət

Azərbaycanda ƏDV dərəcələri (Vergi Məcəlləsi, Maddə 175):
• 18% — standart (əksər mal və xidmətlər)
• 10% — güzəştli (bəzi ərzaq, dərman, tibb avadanlığı)
• 5% — aşağı (kənd təsərrüfatı məhsulları və s.)
• 0% — ixrac əməliyyatları

Nağdsız ödəniş üstünlüyü:
Nağdsız ödəniş zamanı ƏDV məbləğinin 15%-i alıcıya geri qaytarılır (cashback).
Məsələn: 1000 AZN məbləğə 18% ƏDV = 180 AZN
Nağd ödəniş: 1180 AZN
Nağdsız ödəniş: 1180 − (180 × 15%) = 1180 − 27 = 1153 AZN`}
      relatedIds={["salary", "currency", "customs-duty", "freelancer-tax"]}
    >
      {/* Direction Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setDirection("add")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "add"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          ƏDV əlavə et
        </button>
        <button
          onClick={() => setDirection("extract")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "extract"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          ƏDV ayır
        </button>
      </div>

      {/* VAT Rate Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">ƏDV dərəcəsi</label>
        <div className="grid grid-cols-3 gap-3">
          {vatRates.map((r) => (
            <button
              key={r.value}
              onClick={() => setVatRate(r.value)}
              className={`p-4 rounded-xl border text-center transition-all ${
                vatRate === r.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-2xl font-bold text-foreground">{r.label}</p>
              <p className="text-xs text-muted mt-1">{r.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Ödəniş üsulu</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentType("cash")}
            className={`p-4 rounded-xl border text-left transition-all ${
              paymentType === "cash"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">💵</span>
            <p className="text-sm font-medium text-foreground">Nağd ödəniş</p>
            <p className="text-xs text-muted mt-1">Standart ƏDV tətbiq olunur</p>
          </button>
          <button
            onClick={() => setPaymentType("cashless")}
            className={`p-4 rounded-xl border text-left transition-all ${
              paymentType === "cashless"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">💳</span>
            <p className="text-sm font-medium text-foreground">Nağdsız ödəniş</p>
            <p className="text-xs text-muted mt-1">ƏDV-nin 15%-i geri qaytarılır</p>
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          💰 {direction === "add" ? "ƏDV-siz məbləğ" : "ƏDV-li məbləğ"} (AZN)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">ƏDV-siz qiymət</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.priceWithoutVat)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">ƏDV məbləği ({vatRate}%)</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.vatAmount)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">ƏDV-li qiymət</p>
              <p className="text-2xl font-bold">{fmt(result.totalWithVat)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>
          </div>

          {/* Cashback Info */}
          {paymentType === "cashless" && result.cashback > 0 && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span>💳</span>
                Nağdsız ödəniş üstünlüyü
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-green-600 mb-1">ƏDV cashback (15%)</p>
                  <p className="text-xl font-bold text-green-700">{fmt(result.cashback)} AZN</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1">Faktiki ƏDV</p>
                  <p className="text-xl font-bold text-green-700">{fmt(result.effectiveVat)} AZN</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1">Faktiki ödəniş</p>
                  <p className="text-xl font-bold text-green-700">{fmt(result.effectiveTotal)} AZN</p>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-3 text-center">
                Nağd ödəyəndə: {fmt(result.totalWithVat)} AZN → Nağdsız ödəyəndə: {fmt(result.effectiveTotal)} AZN (qənaət: {fmt(result.saving)} AZN)
              </p>
            </div>
          )}

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">ƏDV-siz</span>
              <span className="text-muted">ƏDV</span>
            </div>
            <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(result.priceWithoutVat / result.totalWithVat) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">
                {fmt(result.priceWithoutVat)} AZN ({((result.priceWithoutVat / result.totalWithVat) * 100).toFixed(1)}%)
              </span>
              <span className="font-medium text-amber-700">
                {fmt(result.vatAmount)} AZN ({((result.vatAmount / result.totalWithVat) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Sürətli müqayisə — {fmt(parseFloat(amount))} AZN üçün
              </h3>
            </div>
            <div className="divide-y divide-border">
              {vatRates.map((r) => {
                const a = parseFloat(amount);
                let without: number, vat: number, total: number;
                if (direction === "add") {
                  without = a;
                  vat = a * (r.value / 100);
                  total = a + vat;
                } else {
                  without = a / (1 + r.value / 100);
                  vat = a - without;
                  total = a;
                }
                return (
                  <div key={r.value} className={`flex items-center justify-between px-5 py-3 ${r.value === vatRate ? "bg-primary-light" : ""}`}>
                    <span className="text-sm font-medium text-foreground">{r.label}</span>
                    <div className="flex gap-6 text-sm">
                      <span className="text-muted">ƏDV-siz: <span className="font-medium text-foreground">{fmt(without)}</span></span>
                      <span className="text-muted">ƏDV: <span className="font-medium text-amber-700">{fmt(vat)}</span></span>
                      <span className="text-muted">Cəmi: <span className="font-medium text-primary">{fmt(total)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🧾</span>
          <p>Nəticəni görmək üçün məbləğ daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
