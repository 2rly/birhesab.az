"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// Azərbaycan avtomobil gömrük rüsumu qaydaları (2024)
// Nazirlər Kabinetinin Qərarı əsasında

type FuelType = "petrol" | "diesel" | "hybrid" | "electric";

// Mühərrik həcminə görə gömrük rüsumu (hər sm³ üçün)
// Benzin/dizel mühərrikli avtomobillər
function getCustomsDutyPerCc(engineCc: number, ageYears: number): number {
  if (ageYears <= 3) {
    if (engineCc <= 1500) return 0.4;
    if (engineCc <= 2000) return 0.6;
    if (engineCc <= 3000) return 0.8;
    if (engineCc <= 4000) return 1.0;
    return 1.2;
  } else if (ageYears <= 7) {
    if (engineCc <= 1500) return 0.5;
    if (engineCc <= 2000) return 0.7;
    if (engineCc <= 3000) return 1.0;
    if (engineCc <= 4000) return 1.5;
    return 2.0;
  } else {
    // 7 ildən yuxarı
    if (engineCc <= 1500) return 0.6;
    if (engineCc <= 2000) return 0.9;
    if (engineCc <= 3000) return 1.2;
    if (engineCc <= 4000) return 2.0;
    return 3.0;
  }
}

// Aksiz vergisi dərəcələri (mühərrik həcminə görə, AZN)
function getExciseDuty(engineCc: number): number {
  if (engineCc <= 2000) return 0.15 * engineCc;
  if (engineCc <= 3000) return 300 + 0.5 * (engineCc - 2000);
  if (engineCc <= 4000) return 800 + 1.0 * (engineCc - 3000);
  if (engineCc <= 5000) return 1800 + 2.0 * (engineCc - 4000);
  return 3800 + 3.0 * (engineCc - 5000);
}

// ƏDV dərəcəsi
const VAT_RATE = 0.18;

// Gömrük rəsmiləşdirmə xərci (təxmini)
const CUSTOMS_PROCESSING_FEE = 30; // AZN

const currentYear = new Date().getFullYear();

const fuelTypes: { value: FuelType; label: string; icon: string }[] = [
  { value: "petrol", label: "Benzin", icon: "⛽" },
  { value: "diesel", label: "Dizel", icon: "🛢️" },
  { value: "hybrid", label: "Hibrid", icon: "🔋" },
  { value: "electric", label: "Elektrik", icon: "⚡" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function fmtInt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CarCustomsCalculator() {
  const [carPrice, setCarPrice] = useState("");
  const [engineCc, setEngineCc] = useState("");
  const [productionYear, setProductionYear] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("petrol");

  const result = useMemo(() => {
    const price = parseFloat(carPrice);
    const cc = parseInt(engineCc);
    const year = parseInt(productionYear);

    if (!price || price <= 0) return null;
    if (fuelType !== "electric" && (!cc || cc <= 0)) return null;
    if (!year || year < 1990 || year > currentYear + 1) return null;

    const ageYears = currentYear - year;

    if (fuelType === "electric") {
      // Elektrik avtomobilləri — güzəştli
      const customsDuty = price * 0.15;
      const vatAmount = (price + customsDuty) * VAT_RATE;
      const totalDuty = customsDuty + vatAmount + CUSTOMS_PROCESSING_FEE;

      return {
        price,
        engineCc: 0,
        ageYears,
        customsDuty,
        exciseDuty: 0,
        vatAmount,
        processingFee: CUSTOMS_PROCESSING_FEE,
        totalDuty,
        finalCost: price + totalDuty,
        dutyPerCc: 0,
      };
    }

    // Benzin/Dizel/Hibrid
    const effectiveCc = fuelType === "hybrid" ? Math.round(cc * 0.7) : cc;
    const dutyPerCc = getCustomsDutyPerCc(effectiveCc, ageYears);

    // Gömrük rüsumu: mühərrik həcmi × dərəcə (sm³ başına)
    // Minimum olaraq qiymətin 15%-i tətbiq olunur
    const dutyByCc = effectiveCc * dutyPerCc;
    const dutyByPercent = price * 0.15;
    const customsDuty = Math.max(dutyByCc, dutyByPercent);

    // Aksiz vergisi
    const exciseDuty = fuelType === "hybrid" ? getExciseDuty(effectiveCc) : getExciseDuty(cc);

    // ƏDV (gömrük dəyəri + gömrük rüsumu + aksiz üzərindən)
    const vatBase = price + customsDuty + exciseDuty;
    const vatAmount = vatBase * VAT_RATE;

    const totalDuty = customsDuty + exciseDuty + vatAmount + CUSTOMS_PROCESSING_FEE;

    return {
      price,
      engineCc: cc,
      effectiveCc,
      ageYears,
      customsDuty,
      dutyByCc,
      dutyByPercent,
      exciseDuty,
      vatAmount,
      vatBase,
      processingFee: CUSTOMS_PROCESSING_FEE,
      totalDuty,
      finalCost: price + totalDuty,
      dutyPerCc,
    };
  }, [carPrice, engineCc, productionYear, fuelType]);

  return (
    <CalculatorLayout
      title="Avtomobil gömrük hesablayıcısı"
      description="Xaricdən avtomobil idxalında gömrük rüsumu, aksiz vergisi və ƏDV-ni hesablayın."
      breadcrumbs={[
        { label: "Avtomobil", href: "/?category=automotive" },
        { label: "Avtomobil gömrük hesablayıcısı" },
      ]}
      formulaTitle="Avtomobil gömrük rüsumu necə hesablanır?"
      formulaContent={`Gömrük rüsumu iki üsuldan böyük olanı tətbiq olunur:
1) Mühərrik həcmi × sm³ başına dərəcə (yaşa və həcmə görə)
2) Avtomobilin qiymətinin 15%-i

Aksiz vergisi mühərrik həcminə görə:
• 2000 sm³-dək: 0.15 AZN × həcm
• 2001–3000 sm³: 300 + 0.50 AZN × (həcm − 2000)
• 3001–4000 sm³: 800 + 1.00 AZN × (həcm − 3000)
• 4001–5000 sm³: 1800 + 2.00 AZN × (həcm − 4000)
• 5000+ sm³: 3800 + 3.00 AZN × (həcm − 5000)

ƏDV = (Qiymət + Gömrük rüsumu + Aksiz) × 18%

Hibrid avtomobillər: mühərrik həcminin 70%-i əsas götürülür.
Elektrik avtomobilləri: aksiz vergisindən azaddır.

Yaş qrupları: 0–3 il (yeni), 3–7 il (orta), 7+ il (köhnə).
Köhnə avtomobillərə daha yüksək dərəcə tətbiq olunur.`}
      relatedIds={["road-tax", "osago", "fuel-cost", "car-loan"]}
    >
      {/* Fuel Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Yanacaq növü</label>
        <div className="grid grid-cols-4 gap-3">
          {fuelTypes.map((ft) => (
            <button
              key={ft.value}
              onClick={() => setFuelType(ft.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                fuelType === ft.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{ft.icon}</span>
              <p className="text-xs font-medium text-foreground">{ft.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💲 Avtomobilin qiyməti (AZN)
          </label>
          <input
            type="number"
            value={carPrice}
            onChange={(e) => setCarPrice(e.target.value)}
            placeholder="20000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        {fuelType !== "electric" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              🔧 Mühərrik həcmi (sm³)
            </label>
            <input
              type="number"
              value={engineCc}
              onChange={(e) => setEngineCc(e.target.value)}
              placeholder="1600"
              min="0"
              max="10000"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 Buraxılış ili
          </label>
          <input
            type="number"
            value={productionYear}
            onChange={(e) => setProductionYear(e.target.value)}
            placeholder={String(currentYear - 2)}
            min="1990"
            max={currentYear + 1}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Age Badge */}
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              result.ageYears <= 3
                ? "bg-green-50 text-green-700 border border-green-200"
                : result.ageYears <= 7
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {result.ageYears <= 3 ? "🟢" : result.ageYears <= 7 ? "🟡" : "🔴"}
              {result.ageYears} il yaş ({result.ageYears <= 3 ? "yeni" : result.ageYears <= 7 ? "orta" : "köhnə"})
            </span>
            {fuelType === "hybrid" && result.effectiveCc && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                🔋 Effektiv həcm: {fmtInt(result.effectiveCc)} sm³ (70%)
              </span>
            )}
            {fuelType === "electric" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                ⚡ Aksiz vergisindən azad
              </span>
            )}
          </div>

          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Avtomobilin qiyməti</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.price)}</p>
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
                <span className="text-sm text-muted">Avtomobilin qiyməti</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.price)} AZN</span>
              </div>

              {fuelType !== "electric" && result.dutyByCc !== undefined && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">
                      Həcmə görə rüsum ({fmtInt(result.effectiveCc || result.engineCc)} sm³ × {result.dutyPerCc} AZN)
                    </span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.dutyByCc)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">Qiymətə görə rüsum (15%)</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.dutyByPercent!)} AZN</span>
                  </div>
                </>
              )}

              <div className="flex justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-foreground">
                  Gömrük rüsumu {fuelType !== "electric" && result.dutyByCc !== undefined && (
                    <span className="font-normal text-muted">
                      ({result.dutyByCc >= result.dutyByPercent! ? "həcmə görə" : "qiymətə görə"})
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold text-foreground">{fmt(result.customsDuty)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Aksiz vergisi</span>
                <span className="text-sm font-medium text-foreground">
                  {result.exciseDuty > 0 ? `${fmt(result.exciseDuty)} AZN` : "Azad"}
                </span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">ƏDV (18%)</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.vatAmount)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Gömrük rəsmiləşdirmə xərci</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.processingFee)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">Cəmi rüsum və vergi</span>
                <span className="text-sm font-bold text-amber-700">{fmt(result.totalDuty)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Ümumi xərc (qiymət + rüsum)</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.finalCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Xərcin strukturu</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${(result.price / result.finalCost) * 100}%` }}
                title="Qiymət"
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.customsDuty / result.finalCost) * 100}%` }}
                title="Gömrük rüsumu"
              />
              <div
                className="h-full bg-orange-400"
                style={{ width: `${(result.exciseDuty / result.finalCost) * 100}%` }}
                title="Aksiz"
              />
              <div
                className="h-full bg-red-400"
                style={{ width: `${(result.vatAmount / result.finalCost) * 100}%` }}
                title="ƏDV"
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                Qiymət: {fmt(result.price)} AZN
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                Rüsum: {fmt(result.customsDuty)} AZN
              </span>
              {result.exciseDuty > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
                  Aksiz: {fmt(result.exciseDuty)} AZN
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                ƏDV: {fmt(result.vatAmount)} AZN
              </span>
            </div>
          </div>

          {/* Comparison Table by Age */}
          {fuelType !== "electric" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📊</span>
                  Yaş qrupuna görə müqayisə ({fmtInt(parseInt(engineCc))} sm³)
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "0–3 il (yeni)", years: 1 },
                  { label: "3–7 il (orta)", years: 5 },
                  { label: "7+ il (köhnə)", years: 10 },
                ].map((group) => {
                  const cc = parseInt(engineCc);
                  const effCc = fuelType === "hybrid" ? Math.round(cc * 0.7) : cc;
                  const rate = getCustomsDutyPerCc(effCc, group.years);
                  const dutyByCc = effCc * rate;
                  const dutyByPct = parseFloat(carPrice) * 0.15;
                  const duty = Math.max(dutyByCc, dutyByPct);
                  const excise = fuelType === "hybrid" ? getExciseDuty(effCc) : getExciseDuty(cc);
                  const vat = (parseFloat(carPrice) + duty + excise) * VAT_RATE;
                  const total = duty + excise + vat + CUSTOMS_PROCESSING_FEE;
                  const isActive = result.ageYears <= 3 ? group.years === 1 : result.ageYears <= 7 ? group.years === 5 : group.years === 10;

                  return (
                    <div key={group.years} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                      <span className="text-sm font-medium text-foreground">{group.label}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted">{rate} AZN/sm³</span>
                        <span className="font-medium text-amber-700">{fmt(total)} AZN</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Bu hesablama təxmini xarakter daşıyır.
              Faktiki gömrük rüsumu avtomobilin mənşə ölkəsi, texniki vəziyyəti, ekoloji sinfi və digər
              amillərə görə fərqlənə bilər. Dəqiq məlumat üçün Dövlət Gömrük Komitəsinə müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🚗</span>
          <p>Nəticəni görmək üçün avtomobilin məlumatlarını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
