"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type ClaimType = "property" | "non-property" | "divorce" | "appeal";
type PersonType = "individual" | "legal";

const claimTypes: { value: ClaimType; label: string; icon: string; description: string }[] = [
  { value: "property", label: "Əmlak iddiası", icon: "🏠", description: "Əmlak tələbləri üzrə" },
  { value: "non-property", label: "Qeyri-əmlak", icon: "📝", description: "Qeyri-əmlak iddiası" },
  { value: "divorce", label: "Boşanma", icon: "💔", description: "Boşanma işi" },
  { value: "appeal", label: "Apellyasiya", icon: "⚖️", description: "Apellyasiya şikayəti" },
];

function getPropertyClaimFee(amount: number): number {
  const fee = amount * 0.01; // 1% of claim amount
  return Math.max(fee, 10); // minimum 10 AZN
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CourtFeeCalculator() {
  const [claimType, setClaimType] = useState<ClaimType>("property");
  const [claimAmount, setClaimAmount] = useState("");
  const [personType, setPersonType] = useState<PersonType>("individual");
  const [originalFee, setOriginalFee] = useState("");

  const result = useMemo(() => {
    switch (claimType) {
      case "property": {
        const amount = parseFloat(claimAmount);
        if (!amount || amount <= 0) return null;
        const fee = getPropertyClaimFee(amount);
        return {
          type: "property" as const,
          fee,
          claimAmount: amount,
          percentage: (fee / amount) * 100,
          note: fee === 10 ? "Minimum rüsum tətbiq olundu (10 AZN)" : `İddia məbləğinin 1%-i`,
        };
      }
      case "non-property": {
        const fee = personType === "individual" ? 20 : 50;
        return {
          type: "non-property" as const,
          fee,
          personType,
          label: personType === "individual" ? "Fiziki şəxs" : "Hüquqi şəxs",
        };
      }
      case "divorce": {
        return {
          type: "divorce" as const,
          fee: 20,
        };
      }
      case "appeal": {
        const origFee = parseFloat(originalFee);
        if (!origFee || origFee <= 0) return null;
        const fee = origFee * 0.5;
        return {
          type: "appeal" as const,
          fee,
          originalFee: origFee,
          note: "İlk instansiya rüsumunun 50%-i",
        };
      }
      default:
        return null;
    }
  }, [claimType, claimAmount, personType, originalFee]);

  return (
    <CalculatorLayout
      title="Məhkəmə rüsumu hesablayıcısı"
      description="Azərbaycanda məhkəmə rüsumunu iddia növü və məbləğinə görə hesablayın."
      breadcrumbs={[
        { label: "Hüquq və Dövlət", href: "/?category=legal" },
        { label: "Məhkəmə rüsumu" },
      ]}
      formulaTitle="Məhkəmə rüsumu necə hesablanır?"
      formulaContent={`Əmlak iddiaları:
• İddia məbləğinin 1%-i
• Minimum rüsum: 10 AZN

Qeyri-əmlak iddiaları:
• Fiziki şəxs: 20 AZN
• Hüquqi şəxs: 50 AZN

Boşanma işi:
• 20 AZN

Apellyasiya şikayəti:
• İlk instansiya rüsumunun 50%-i

Qeyd: Dövlət rüsumu məhkəməyə müraciət zamanı ödənilir.
Bəzi hallarda rüsumdan azad edilmə və güzəştlər tətbiq oluna bilər
(məsələn, əmək mübahisələri, əlillik və s.).`}
      relatedIds={["notary-fee", "property-tax", "court-fee", "customs-duty"]}
    >
      {/* Claim Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">İddia növü</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {claimTypes.map((ct) => (
            <button
              key={ct.value}
              onClick={() => setClaimType(ct.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                claimType === ct.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{ct.icon}</span>
              <p className="text-xs font-medium text-foreground">{ct.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Inputs */}
      <div className="space-y-4 mb-8">
        {claimType === "property" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 İddia məbləği (AZN)
            </label>
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="50000"
              min="0"
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        )}

        {claimType === "non-property" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Müraciət edənin statusu</label>
            <div className="grid grid-cols-2 gap-3 sm:w-1/2">
              <button
                onClick={() => setPersonType("individual")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  personType === "individual"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <span className="text-xl block mb-1">👤</span>
                <p className="text-xs font-medium text-foreground">Fiziki şəxs</p>
                <p className="text-xs text-muted">20 AZN</p>
              </button>
              <button
                onClick={() => setPersonType("legal")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  personType === "legal"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <span className="text-xl block mb-1">🏢</span>
                <p className="text-xs font-medium text-foreground">Hüquqi şəxs</p>
                <p className="text-xs text-muted">50 AZN</p>
              </button>
            </div>
          </div>
        )}

        {claimType === "appeal" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📋 İlk instansiya rüsumu (AZN)
            </label>
            <input
              type="number"
              value={originalFee}
              onChange={(e) => setOriginalFee(e.target.value)}
              placeholder="500"
              min="0"
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">Apellyasiya rüsumu ilk instansiya rüsumunun 50%-i qədərdir</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Məhkəmə rüsumu</p>
              <p className="text-3xl font-bold">{fmt(result.fee)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">İddia növü</p>
              <p className="text-xl font-bold text-foreground">
                {claimTypes.find((c) => c.value === claimType)?.label}
              </p>
              <p className="text-xs text-muted mt-1">
                {claimTypes.find((c) => c.value === claimType)?.description}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Ətraflı hesablama
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İddia növü</span>
                <span className="text-sm font-medium text-foreground">
                  {claimTypes.find((c) => c.value === claimType)?.description}
                </span>
              </div>

              {result.type === "property" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">İddia məbləği</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.claimAmount)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Tətbiq olunan tarif</span>
                    <span className="text-sm font-medium text-foreground">{result.note}</span>
                  </div>
                </>
              )}

              {result.type === "non-property" && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Müraciət edən</span>
                  <span className="text-sm font-medium text-foreground">{result.label}</span>
                </div>
              )}

              {result.type === "appeal" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">İlk instansiya rüsumu</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.originalFee)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Hesablama qaydası</span>
                    <span className="text-sm font-medium text-foreground">{result.note}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Məhkəmə rüsumu</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.fee)} AZN</span>
              </div>
            </div>
          </div>

          {/* Property Claim Comparison */}
          {result.type === "property" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📊</span>
                  Məbləğə görə müqayisə
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "1 000 AZN", amount: 1000 },
                  { label: "5 000 AZN", amount: 5000 },
                  { label: "10 000 AZN", amount: 10000 },
                  { label: "50 000 AZN", amount: 50000 },
                  { label: "100 000 AZN", amount: 100000 },
                  { label: "500 000 AZN", amount: 500000 },
                ].map((item) => {
                  const fee = getPropertyClaimFee(item.amount);
                  const maxFee = getPropertyClaimFee(500000);
                  const isActive = Math.abs(result.claimAmount - item.amount) < 1;
                  return (
                    <div
                      key={item.amount}
                      className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}
                    >
                      <span className={`text-sm ${isActive ? "font-semibold text-primary-dark" : "text-foreground"}`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isActive ? "bg-primary" : "bg-gray-300"}`}
                            style={{ width: `${(fee / maxFee) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-20 text-right ${isActive ? "text-primary-dark font-bold" : "text-foreground"}`}>
                          {fmt(fee)} AZN
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Claim Types Overview */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Bütün iddia növləri
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className={`flex justify-between px-5 py-3 ${claimType === "property" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">🏠 Əmlak iddiası</span>
                <span className="text-sm text-muted">İddia məbləğinin 1% (min. 10 AZN)</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "non-property" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">📝 Qeyri-əmlak (fiziki)</span>
                <span className="text-sm font-medium text-foreground">20 AZN</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "non-property" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">📝 Qeyri-əmlak (hüquqi)</span>
                <span className="text-sm font-medium text-foreground">50 AZN</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "divorce" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">💔 Boşanma</span>
                <span className="text-sm font-medium text-foreground">20 AZN</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "appeal" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">⚖️ Apellyasiya</span>
                <span className="text-sm text-muted">İlk instansiya rüsumunun 50%-i</span>
              </div>
            </div>
          </div>

          {/* Exemption Info */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Rüsumdan azad olunan hallar:</h4>
            <ul className="text-xs text-green-700 leading-relaxed space-y-1">
              <li>- Əmək mübahisələri üzrə işçilər</li>
              <li>- Alimentlə bağlı iddialar</li>
              <li>- I və II qrup əlillər (iddia 1000 AZN-dək)</li>
              <li>- Dövlət orqanları (dövlət marağı üçün)</li>
            </ul>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Bu hesablama Azərbaycan Respublikasının
              Mülki Prosessual Məcəlləsinə əsaslanır. Bəzi hallarda məhkəmə rüsumunun azaldılması və ya
              taksitlə ödənilməsi mümkündür. Dəqiq məlumat üçün vəkilə müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⚖️</span>
          <p>Nəticəni görmək üçün lazımi məlumatları daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
