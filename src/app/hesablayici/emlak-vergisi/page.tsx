"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Azərbaycan əmlak alqı-satqı vergi və xərcləri (2024)
// Vergi Məcəlləsi və Notariat haqqında Qanun əsasında

type PropertyType = "apartment" | "house" | "land" | "commercial";
type SellerType = "individual" | "legal";
type OwnershipDuration = "less5" | "more5";

const propertyTypes: { value: PropertyType; label: string; icon: string; description: string }[] = [
  { value: "apartment", label: "Mənzil", icon: "🏢", description: "Yaşayış mənzili" },
  { value: "house", label: "Ev", icon: "🏠", description: "Fərdi yaşayış evi" },
  { value: "land", label: "Torpaq", icon: "🌍", description: "Torpaq sahəsi" },
  { value: "commercial", label: "Kommersiya", icon: "🏪", description: "Kommersiya obyekti" },
];

// Gəlir vergisi dərəcəsi (əmlak satışından)
// Fiziki şəxs, 5 ildən az sahiblik
const INCOME_TAX_RATE_INDIVIDUAL = 0.14; // 14%
// Hüquqi şəxs
const INCOME_TAX_RATE_LEGAL = 0.20; // 20% mənfəət vergisi

// Notarius xərcləri (alqı-satqı müqaviləsi)
function getNotaryFee(price: number): number {
  // Notariat haqqında Qanuna əsasən
  if (price <= 10000) return price * 0.005 + 15; // 0.5% + 15 AZN
  if (price <= 50000) return 50 + (price - 10000) * 0.003; // 50 + 0.3%
  if (price <= 100000) return 170 + (price - 50000) * 0.002; // 170 + 0.2%
  return 270 + (price - 100000) * 0.001; // 270 + 0.1%
}

// Dövlət rüsumu (əmlak qeydiyyatı)
const STATE_REGISTRATION_FEE = 20; // AZN
// Texniki pasport xərci
const TECHNICAL_PASSPORT_FEE = 50; // AZN
// Çıxarış xərci (Daşınmaz Əmlak Reyestri)
const REGISTRY_EXTRACT_FEE = 20; // AZN
// Arayış və sənəd xərcləri
const DOCUMENT_FEES = 30; // AZN (təxmini)

// ƏDV — kommersiya əmlakı satışında
const VAT_RATE = 0.18;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function PropertyTaxCalculator() {
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [sellerType, setSellerType] = useState<SellerType>("individual");
  const [ownershipDuration, setOwnershipDuration] = useState<OwnershipDuration>("less5");
  const [area, setArea] = useState("");

  const result = useMemo(() => {
    const salePrice = parseFloat(price);
    if (!salePrice || salePrice <= 0) return null;

    const buyPrice = parseFloat(purchasePrice) || 0;
    const sqm = parseFloat(area) || 0;
    const pricePerSqm = sqm > 0 ? salePrice / sqm : 0;

    // Gəlir (mənfəət)
    const profit = buyPrice > 0 ? Math.max(0, salePrice - buyPrice) : salePrice;

    // Gəlir vergisi
    let incomeTax = 0;
    let incomeTaxNote = "";

    if (sellerType === "individual") {
      if (ownershipDuration === "more5") {
        // 5 ildən çox sahiblik — yaşayış əmlakı satışı vergidən azad
        if (propertyType === "apartment" || propertyType === "house") {
          incomeTax = 0;
          incomeTaxNote = "5 ildən çox sahiblik — vergidən azad";
        } else {
          incomeTax = profit * INCOME_TAX_RATE_INDIVIDUAL;
          incomeTaxNote = `Mənfəətdən 14% (${fmt(profit)} AZN × 14%)`;
        }
      } else {
        incomeTax = profit * INCOME_TAX_RATE_INDIVIDUAL;
        incomeTaxNote = `Mənfəətdən 14% (${fmt(profit)} AZN × 14%)`;
      }
    } else {
      incomeTax = profit * INCOME_TAX_RATE_LEGAL;
      incomeTaxNote = `Mənfəətdən 20% (${fmt(profit)} AZN × 20%)`;
    }

    // ƏDV (yalnız kommersiya əmlakı və hüquqi şəxs)
    let vatAmount = 0;
    if (propertyType === "commercial" && sellerType === "legal") {
      vatAmount = salePrice * VAT_RATE;
    }

    // Notarius xərci
    const notaryFee = getNotaryFee(salePrice);

    // Dövlət rüsumları
    const registrationFee = STATE_REGISTRATION_FEE;
    const technicalPassport = TECHNICAL_PASSPORT_FEE;
    const registryExtract = REGISTRY_EXTRACT_FEE;
    const documentFees = DOCUMENT_FEES;
    const totalStateFees = registrationFee + technicalPassport + registryExtract + documentFees;

    // Satıcının xərcləri
    const sellerCosts = incomeTax + notaryFee / 2;
    // Alıcının xərcləri
    const buyerCosts = notaryFee / 2 + totalStateFees + vatAmount;

    const totalTaxAndFees = incomeTax + vatAmount + notaryFee + totalStateFees;

    return {
      salePrice,
      buyPrice,
      profit,
      incomeTax,
      incomeTaxNote,
      vatAmount,
      notaryFee,
      registrationFee,
      technicalPassport,
      registryExtract,
      documentFees,
      totalStateFees,
      sellerCosts,
      buyerCosts,
      totalTaxAndFees,
      pricePerSqm,
      sqm,
    };
  }, [price, purchasePrice, propertyType, sellerType, ownershipDuration, area]);

  return (
    <CalculatorLayout
      title="Əmlak alqı-satqı vergisi"
      description="Azərbaycanda əmlak alışında vergi, notarius və dövlət rüsumlarını hesablayın."
      breadcrumbs={[
        { label: "Daşınmaz Əmlak", href: "/?category=realestate" },
        { label: "Əmlak alqı-satqı vergisi" },
      ]}
      formulaTitle="Əmlak satışında hansı vergi və xərclər var?"
      formulaContent={`Gəlir vergisi (satıcıdan):
• Fiziki şəxs: mənfəətin 14%-i (satış qiyməti − alış qiyməti)
• Hüquqi şəxs: mənfəətin 20%-i
• Güzəşt: Yaşayış əmlakı 5+ il sahiblikdə — vergidən azad

ƏDV (18%):
• Yalnız kommersiya əmlakı + hüquqi şəxs satışında tətbiq olunur
• Yaşayış əmlakı satışı ƏDV-dən azaddır

Notarius xərcləri (alqı-satqı müqaviləsi):
• 10 000 AZN-dək: 0.5% + 15 AZN
• 10 001–50 000 AZN: 50 + 0.3%
• 50 001–100 000 AZN: 170 + 0.2%
• 100 000+ AZN: 270 + 0.1%

Dövlət rüsumları:
• Qeydiyyat rüsumu: 20 AZN
• Texniki pasport: 50 AZN
• Reyestr çıxarışı: 20 AZN
• Sənəd xərcləri: ~30 AZN`}
      relatedIds={["rental-tax", "mortgage", "price-per-sqm", "notary-fee"]}
    >
      {/* Property Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Əmlak növü</label>
        <div className="grid grid-cols-4 gap-3">
          {propertyTypes.map((pt) => (
            <button
              key={pt.value}
              onClick={() => setPropertyType(pt.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                propertyType === pt.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{pt.icon}</span>
              <p className="text-xs font-medium text-foreground">{pt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Seller Type & Ownership */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Satıcının statusu</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSellerType("individual")}
              className={`p-3 rounded-xl border text-center transition-all ${
                sellerType === "individual"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">👤</span>
              <p className="text-xs font-medium text-foreground">Fiziki şəxs</p>
            </button>
            <button
              onClick={() => setSellerType("legal")}
              className={`p-3 rounded-xl border text-center transition-all ${
                sellerType === "legal"
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">🏢</span>
              <p className="text-xs font-medium text-foreground">Hüquqi şəxs</p>
            </button>
          </div>
        </div>

        {sellerType === "individual" && (propertyType === "apartment" || propertyType === "house") && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Sahiblik müddəti</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOwnershipDuration("less5")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  ownershipDuration === "less5"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-lg font-bold text-foreground">&lt; 5 il</p>
                <p className="text-xs text-muted">Vergiyə cəlb olunur</p>
              </button>
              <button
                onClick={() => setOwnershipDuration("more5")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  ownershipDuration === "more5"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-lg font-bold text-foreground">5+ il</p>
                <p className="text-xs text-green-600">Vergidən azad</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price Inputs */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 Satış qiyməti (AZN)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="80000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              🏷️ Alış qiyməti (AZN) <span className="text-muted font-normal">— ixtiyari</span>
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="60000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">Mənfəət vergisi hesablaması üçün</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📐 Sahə (m²) <span className="text-muted font-normal">— ixtiyari</span>
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="75"
            min="0"
            className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Tax Exemption Notice */}
          {result.incomeTax === 0 && ownershipDuration === "more5" && sellerType === "individual" && (propertyType === "apartment" || propertyType === "house") && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <h4 className="font-semibold text-green-800 mb-1">Gəlir vergisindən azad!</h4>
              <p className="text-sm text-green-600">
                Yaşayış əmlakı 5 ildən çox sahiblikdə olduğu üçün satışdan gəlir vergisi tutulmur.
              </p>
            </div>
          )}

          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Satış qiyməti</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.salePrice)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Ümumi vergi və xərc</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalTaxAndFees)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>

            {result.sqm > 0 && (
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">1 m² qiyməti</p>
                <p className="text-2xl font-bold">{fmt(result.pricePerSqm)}</p>
                <p className="text-xs text-blue-200 mt-1">AZN / m²</p>
              </div>
            )}
          </div>

          {/* Seller vs Buyer Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-red-50 px-5 py-3 border-b border-red-100">
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  <span>📤</span>
                  Satıcının xərcləri
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Gəlir vergisi</span>
                  <span className="text-sm font-medium text-foreground">
                    {result.incomeTax > 0 ? `${fmt(result.incomeTax)} AZN` : "Azad"}
                  </span>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Notarius (½)</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.notaryFee / 2)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3 bg-red-50">
                  <span className="text-sm font-semibold text-red-700">Cəmi</span>
                  <span className="text-sm font-bold text-red-700">{fmt(result.sellerCosts)} AZN</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <span>📥</span>
                  Alıcının xərcləri
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Notarius (½)</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.notaryFee / 2)} AZN</span>
                </div>
                {result.vatAmount > 0 && (
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">ƏDV (18%)</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                  </div>
                )}
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Dövlət rüsumları</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.totalStateFees)} AZN</span>
                </div>
                <div className="flex justify-between px-5 py-3 bg-blue-50">
                  <span className="text-sm font-semibold text-blue-700">Cəmi</span>
                  <span className="text-sm font-bold text-blue-700">{fmt(result.buyerCosts)} AZN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Ətraflı hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Satış qiyməti</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.salePrice)} AZN</span>
              </div>
              {result.buyPrice > 0 && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Alış qiyməti</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.buyPrice)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Mənfəət (satış − alış)</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.profit)} AZN</span>
                  </div>
                </>
              )}

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">Vergilər</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-muted">Gəlir vergisi</span>
                  {result.incomeTaxNote && (
                    <p className="text-xs text-muted mt-0.5">{result.incomeTaxNote}</p>
                  )}
                </div>
                <span className={`text-sm font-medium ${result.incomeTax === 0 ? "text-green-600" : "text-foreground"}`}>
                  {result.incomeTax > 0 ? `${fmt(result.incomeTax)} AZN` : "Azad"}
                </span>
              </div>

              {result.vatAmount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">ƏDV (18%)</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
                </div>
              )}

              <div className="px-5 py-3 bg-gray-50">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">Rüsum və xərclər</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Notarius xərci</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.notaryFee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Qeydiyyat rüsumu</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.registrationFee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Texniki pasport</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.technicalPassport)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Reyestr çıxarışı</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.registryExtract)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Sənəd xərcləri</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.documentFees)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Ümumi vergi və xərclər</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.totalTaxAndFees)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Xərcin strukturu</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              {result.incomeTax > 0 && (
                <div className="h-full bg-red-400" style={{ width: `${(result.incomeTax / result.totalTaxAndFees) * 100}%` }} />
              )}
              {result.vatAmount > 0 && (
                <div className="h-full bg-orange-400" style={{ width: `${(result.vatAmount / result.totalTaxAndFees) * 100}%` }} />
              )}
              <div className="h-full bg-amber-400" style={{ width: `${(result.notaryFee / result.totalTaxAndFees) * 100}%` }} />
              <div className="h-full bg-blue-400" style={{ width: `${(result.totalStateFees / result.totalTaxAndFees) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              {result.incomeTax > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  Gəlir vergisi: {fmt(result.incomeTax)}
                </span>
              )}
              {result.vatAmount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
                  ƏDV: {fmt(result.vatAmount)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                Notarius: {fmt(result.notaryFee)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                Dövlət rüsumları: {fmt(result.totalStateFees)}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Bu hesablama təxmini xarakter daşıyır.
              Notarius xərcləri razılaşma ilə satıcı və alıcı arasında bərabər bölünə və ya bir tərəfin üzərinə düşə bilər.
              Dəqiq məlumat üçün notariusa və vergi orqanına müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏢</span>
          <p>Nəticəni görmək üçün satış qiymətini daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
