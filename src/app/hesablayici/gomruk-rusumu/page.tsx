"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Azərbaycan gömrük rüsumu dərəcələri (2024)
// Gömrük Məcəlləsi və Nazirlər Kabinetinin qərarına əsasən

type GoodsCategory = "electronics" | "clothing" | "food" | "cosmetics" | "medicine" | "furniture" | "toys" | "auto_parts" | "other";

interface CategoryInfo {
  id: GoodsCategory;
  name: string;
  icon: string;
  dutyRate: number; // % gömrük rüsumu
  vatRate: number; // % ƏDV
  exciseRate: number; // % aksiz (əksər mallarda 0)
  description: string;
}

const goodsCategories: CategoryInfo[] = [
  { id: "electronics", name: "Elektronika", icon: "📱", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Telefon, kompüter, planşet və s." },
  { id: "clothing", name: "Geyim və ayaqqabı", icon: "👕", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Geyim, ayaqqabı, aksessuarlar" },
  { id: "food", name: "Ərzaq məhsulları", icon: "🍎", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Qida məhsulları, içkilər" },
  { id: "cosmetics", name: "Kosmetika və parfümeriya", icon: "💄", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Kosmetik və parfümeriya məhsulları" },
  { id: "medicine", name: "Dərman preparatları", icon: "💊", dutyRate: 0, vatRate: 18, exciseRate: 0, description: "Dərman və tibbi ləvazimatlar (güzəştli)" },
  { id: "furniture", name: "Mebel", icon: "🪑", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Ev mebeli və aksesuarları" },
  { id: "toys", name: "Oyuncaqlar", icon: "🧸", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Uşaq oyuncaqları və oyunlar" },
  { id: "auto_parts", name: "Avtomobil hissələri", icon: "🔧", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Avtomobil ehtiyat hissələri" },
  { id: "other", name: "Digər mallar", icon: "📦", dutyRate: 15, vatRate: 18, exciseRate: 0, description: "Siyahıda olmayan digər mallar" },
];

// Poçt/kuryer ilə göndərilən bağlamalara güzəşt (2024)
const POSTAL_EXEMPTION_LIMIT = 300; // AZN — aylıq limit
const POSTAL_DUTY_RATE = 30; // % — limitdən artıq hissəyə

type DeliveryMethod = "postal" | "commercial";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CustomsDutyCalculator() {
  const [goodsValue, setGoodsValue] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [category, setCategory] = useState<GoodsCategory>("electronics");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("postal");
  const [weight, setWeight] = useState("");

  const selectedCategory = goodsCategories.find((c) => c.id === category)!;

  const result = useMemo(() => {
    const value = parseFloat(goodsValue);
    if (!value || value <= 0) return null;

    const shipping = parseFloat(shippingCost) || 0;
    const totalValue = value + shipping; // Gömrük dəyəri = mal dəyəri + daşınma

    if (deliveryMethod === "postal") {
      // Poçt/kuryer bağlaması
      if (totalValue <= POSTAL_EXEMPTION_LIMIT) {
        return {
          goodsValue: value,
          shippingCost: shipping,
          totalValue,
          customsDuty: 0,
          vatAmount: 0,
          exciseAmount: 0,
          totalDuty: 0,
          finalCost: totalValue,
          exemptionUsed: totalValue,
          exemptionRemaining: POSTAL_EXEMPTION_LIMIT - totalValue,
          isExempt: true,
        };
      }

      // Limitdən artıq hissəyə 30% rüsum
      const taxableAmount = totalValue - POSTAL_EXEMPTION_LIMIT;
      const customsDuty = taxableAmount * (POSTAL_DUTY_RATE / 100);
      const totalDuty = customsDuty;

      return {
        goodsValue: value,
        shippingCost: shipping,
        totalValue,
        customsDuty,
        vatAmount: 0,
        exciseAmount: 0,
        totalDuty,
        finalCost: totalValue + totalDuty,
        exemptionUsed: POSTAL_EXEMPTION_LIMIT,
        exemptionRemaining: 0,
        taxableAmount,
        isExempt: false,
      };
    } else {
      // Kommersiya idxalı
      const customsDuty = totalValue * (selectedCategory.dutyRate / 100);
      const vatBase = totalValue + customsDuty;
      const vatAmount = vatBase * (selectedCategory.vatRate / 100);
      const exciseAmount = totalValue * (selectedCategory.exciseRate / 100);
      const totalDuty = customsDuty + vatAmount + exciseAmount;

      return {
        goodsValue: value,
        shippingCost: shipping,
        totalValue,
        customsDuty,
        vatAmount,
        exciseAmount,
        totalDuty,
        finalCost: totalValue + totalDuty,
        isExempt: false,
      };
    }
  }, [goodsValue, shippingCost, category, deliveryMethod, selectedCategory]);

  return (
    <CalculatorLayout
      title="Gömrük rüsumu hesablayıcısı"
      description="Xaricdən gətirilən mallara gömrük rüsumu, ƏDV və digər ödənişləri hesablayın."
      breadcrumbs={[
        { label: "Hüquq və Dövlət", href: "/?category=legal" },
        { label: "Gömrük rüsumu hesablayıcısı" },
      ]}
      formulaTitle="Gömrük rüsumu necə hesablanır?"
      formulaContent={`Poçt/kuryer bağlamaları (fiziki şəxslər):
• Aylıq ${POSTAL_EXEMPTION_LIMIT} AZN-dək — RÜSUMSUZ
• ${POSTAL_EXEMPTION_LIMIT} AZN-dən artıq hissəyə — 30% gömrük rüsumu

Kommersiya idxalı:
Gömrük dəyəri = Malın dəyəri + Daşınma xərci
Gömrük rüsumu = Gömrük dəyəri × Rüsum dərəcəsi (%)
ƏDV bazası = Gömrük dəyəri + Gömrük rüsumu
ƏDV = ƏDV bazası × 18%
Ümumi ödəniş = Gömrük rüsumu + ƏDV + Aksiz (varsa)

Qeyd: Dərman preparatları gömrük rüsumundan azaddır.
Bəzi mallar əlavə aksiz vergisi tələb edə bilər (spirtli içki, tütün və s.).`}
      relatedIds={["car-customs", "vat", "currency", "customs-duty"]}
    >
      {/* Delivery Method Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setDeliveryMethod("postal")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            deliveryMethod === "postal"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          📮 Poçt / Kuryer bağlaması
        </button>
        <button
          onClick={() => setDeliveryMethod("commercial")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            deliveryMethod === "commercial"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          🏭 Kommersiya idxalı
        </button>
      </div>

      {/* Category Selection (only for commercial) */}
      {deliveryMethod === "commercial" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">Mal kateqoriyası</label>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
            {goodsCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  category === cat.id
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <p className="text-xs font-medium text-foreground">{cat.name}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            {selectedCategory.description} — Rüsum: {selectedCategory.dutyRate}%, ƏDV: {selectedCategory.vatRate}%
          </p>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📦 Malın dəyəri (AZN)
          </label>
          <input
            type="number"
            value={goodsValue}
            onChange={(e) => setGoodsValue(e.target.value)}
            placeholder="500"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🚚 Daşınma xərci (AZN)
          </label>
          <input
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Exemption Notice for Postal */}
          {deliveryMethod === "postal" && result.isExempt && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <h4 className="font-semibold text-green-800 mb-1">Rüsumsuz!</h4>
              <p className="text-sm text-green-600">
                Malın dəyəri aylıq {POSTAL_EXEMPTION_LIMIT} AZN limitindən azdır. Gömrük rüsumu tətbiq olunmur.
              </p>
              <p className="text-xs text-green-500 mt-2">
                Qalan limit: {fmt(result.exemptionRemaining!)} AZN
              </p>
            </div>
          )}

          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Gömrük dəyəri</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.totalValue)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Ümumi rüsum və vergi</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalDuty)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Ümumi xərc</p>
              <p className="text-2xl font-bold">{fmt(result.finalCost)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
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
                <span className="text-sm text-muted">Malın dəyəri</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.goodsValue)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Daşınma xərci</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.shippingCost)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-foreground">Gömrük dəyəri</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.totalValue)} AZN</span>
              </div>

              {deliveryMethod === "postal" && !result.isExempt && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Güzəşt limiti</span>
                    <span className="text-sm font-medium text-green-600">−{fmt(POSTAL_EXEMPTION_LIMIT)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Rüsuma cəlb olunan</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.taxableAmount!)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Gömrük rüsumu ({POSTAL_DUTY_RATE}%)</span>
                    <span className="text-sm font-medium text-amber-700">{fmt(result.customsDuty)} AZN</span>
                  </div>
                </>
              )}

              {deliveryMethod === "commercial" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Gömrük rüsumu ({selectedCategory.dutyRate}%)</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.customsDuty)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">ƏDV ({selectedCategory.vatRate}%)</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                  </div>
                  {result.exciseAmount > 0 && (
                    <div className="flex justify-between px-5 py-3">
                      <span className="text-sm text-muted">Aksiz vergisi</span>
                      <span className="text-sm font-medium text-foreground">{fmt(result.exciseAmount)} AZN</span>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">Cəmi rüsum və vergi</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.totalDuty)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Ümumi xərc (mal + rüsum)</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.finalCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Malın dəyəri + Daşınma</span>
              <span className="text-muted">Rüsum və Vergi</span>
            </div>
            <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(result.totalValue / result.finalCost) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">
                {fmt(result.totalValue)} AZN ({((result.totalValue / result.finalCost) * 100).toFixed(1)}%)
              </span>
              <span className="font-medium text-amber-700">
                {fmt(result.totalDuty)} AZN ({((result.totalDuty / result.finalCost) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Bu hesablama təxmini xarakter daşıyır.
              Faktiki gömrük rüsumu malın HS kodu, mənşə ölkəsi, ticarət sazişləri və digər amillərə görə
              fərqlənə bilər. Dəqiq məlumat üçün Dövlət Gömrük Komitəsinə müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📦</span>
          <p>Nəticəni görmək üçün malın dəyərini daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
