"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// ============================================================
// Azərbaycan kommunal xidmət tarifləri (2025)
// Tarif (Qiymət) Şurasının 29.12.2024 tarixli qərarı
// Qüvvəyə minmə: 02.01.2025
// ============================================================

// ── ELEKTRİK ──────────────────────────────────────────────────
// ƏDV daxil
const ELECTRICITY_TIERS = [
  { limit: 200, rate: 0.084, label: "0–200 kVt·saat", oldRate: 0.08 },
  { limit: 100, rate: 0.10, label: "201–300 kVt·saat", oldRate: 0.09 },
  { limit: Infinity, rate: 0.15, label: "300+ kVt·saat", oldRate: 0.13 },
];
const ELECTRICITY_SERVICE_FEE = 1.00; // Sabit aylıq xidmət haqqı

// ── QAZ ───────────────────────────────────────────────────────
// İllik kumulyativ istehlaka görə pillələr (Azəriqaz 2026)
const GAS_TIERS = [
  { yearLimit: 1200, rate: 0.12, label: "0–1200 m³/il" },
  { yearLimit: 2500, rate: 0.20, label: "1200–2500 m³/il" },
  { yearLimit: Infinity, rate: 0.25, label: "2500+ m³/il" },
];
const GAS_SERVICE_FEE = 1.00; // Sabit aylıq xidmət haqqı

// ── SU ────────────────────────────────────────────────────────
const WATER_BAKU = 0.70; // Bakı, Sumqayıt, Xırdalan, Abşeron
const WATER_OTHER = 0.60; // Digər inzibati ərazi vahidləri
const WASTEWATER = 0.30; // Tullantı sularının axıdılması

// ── İSTİLİK ───────────────────────────────────────────────────
const HEATING_RATE = 0.04; // AZN/m² (aylıq, qış mövsümü)


type ActiveTab = "all" | "electricity" | "gas" | "water";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function calcElectricity(kwh: number) {
  let remaining = kwh;
  const breakdown: { label: string; kwh: number; rate: number; cost: number }[] = [];
  let subtotal = 0;
  for (const tier of ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    const used = Math.min(remaining, tier.limit);
    const cost = used * tier.rate;
    breakdown.push({ label: tier.label, kwh: used, rate: tier.rate, cost });
    subtotal += cost;
    remaining -= used;
  }
  const serviceFee = kwh > 0 ? ELECTRICITY_SERVICE_FEE : 0;
  return { subtotal, serviceFee, total: subtotal + serviceFee, breakdown };
}


// monthlyM3: bu ayki istehlak, prevYearlyM3: ilin əvvəlindən bu aya qədər cəmi
function calcGas(monthlyM3: number, prevYearlyM3: number) {
  const breakdown: { label: string; m3: number; rate: number; cost: number }[] = [];
  let subtotal = 0;
  let remaining = monthlyM3;
  let cumulative = prevYearlyM3;

  for (const tier of GAS_TIERS) {
    if (remaining <= 0) break;
    // Bu pillədə nə qədər yer var
    const tierCeiling = tier.yearLimit;
    const spaceInTier = Math.max(0, tierCeiling - cumulative);
    if (spaceInTier <= 0) { continue; }
    const used = Math.min(remaining, spaceInTier);
    const cost = used * tier.rate;
    breakdown.push({ label: tier.label, m3: used, rate: tier.rate, cost });
    subtotal += cost;
    remaining -= used;
    cumulative += used;
  }
  // Əgər hələ remaining varsa (2500+ pillə)
  if (remaining > 0) {
    const lastTier = GAS_TIERS[GAS_TIERS.length - 1];
    const cost = remaining * lastTier.rate;
    // Əgər artıq bu pillədə breakdown varsa, birləşdir
    const existing = breakdown.find(b => b.label === lastTier.label);
    if (existing) {
      existing.m3 += remaining;
      existing.cost += cost;
    } else {
      breakdown.push({ label: lastTier.label, m3: remaining, rate: lastTier.rate, cost });
    }
    subtotal += cost;
  }

  const serviceFee = monthlyM3 > 0 ? GAS_SERVICE_FEE : 0;
  return { subtotal, serviceFee, total: subtotal + serviceFee, breakdown, newYearlyCumulative: prevYearlyM3 + monthlyM3 };
}


export default function KommunalCalculator() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  // Elektrik
  const [electricityKwh, setElectricityKwh] = useState("");
  // Qaz
  const [gasM3, setGasM3] = useState("");
  const [gasPrevYearly, setGasPrevYearly] = useState("0"); // ilin əvvəlindən bu aya qədər cəmi
  // Su
  const [isBaku, setIsBaku] = useState(true);
  const [coldWaterM3, setColdWaterM3] = useState("");
  const [hotWaterM3, setHotWaterM3] = useState("");
  // İstilik
  const [areaM2, setAreaM2] = useState("");
  const [includeHeating, setIncludeHeating] = useState(false);

  const result = useMemo(() => {
    const elKwh = parseFloat(electricityKwh) || 0;
    const gM3 = parseFloat(gasM3) || 0;
    const cwM3 = parseFloat(coldWaterM3) || 0;
    const hwM3 = parseFloat(hotWaterM3) || 0;
    const area = parseFloat(areaM2) || 0;


    const electricity = calcElectricity(elKwh);
    const prevYearly = parseFloat(gasPrevYearly) || 0;
    const gas = calcGas(gM3, prevYearly);

    const waterRate = isBaku ? WATER_BAKU : WATER_OTHER;
    const coldWater = cwM3 * waterRate;
    const wastewater = cwM3 * WASTEWATER;
    const hotWater = hwM3 * 2.20; // isti su təxmini
    const waterTotal = coldWater + wastewater + hotWater;

    const heating = includeHeating ? area * HEATING_RATE : 0;
    const total = electricity.total + gas.total + waterTotal + heating;

    return {
      electricity, gas,
      coldWater, wastewater, hotWater, waterTotal, waterRate,
      heating, total,
      elKwh, gM3, cwM3, hwM3, area,
    };
  }, [electricityKwh, gasM3, gasPrevYearly, coldWaterM3, hotWaterM3, areaM2, includeHeating, isBaku]);

  const hasAnyInput = result.elKwh > 0 || result.gM3 > 0 || result.cwM3 > 0 || result.hwM3 > 0;

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "all", label: "Hamısı", icon: "📋" },
    { id: "electricity", label: "İşıq", icon: "💡" },
    { id: "gas", label: "Qaz", icon: "🔥" },
    { id: "water", label: "Su", icon: "💧" },
  ];

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";

  return (
    <CalculatorLayout
      title="Kommunal xərclər hesablayıcısı"
      description="Elektrik, qaz, su və digər kommunal xərclərinizi 2025-ci il tarifləri ilə hesablayın."
      breadcrumbs={[
        { label: "Daşınmaz Əmlak", href: "/?category=realestate" },
        { label: "Kommunal xərclər hesablayıcısı" },
      ]}
      formulaTitle="2025-ci il kommunal tarifləri"
      formulaContent={`Elektrik enerjisi (02.01.2025-dən, ƏDV daxil):
• 0–200 kVt·saat: 8,4 qəpik (əvvəl 8 qəpik)
• 201–300 kVt·saat: 10 qəpik (əvvəl 9 qəpik)
• 300+ kVt·saat: 15 qəpik (əvvəl 13 qəpik)
• Sabit aylıq xidmət haqqı: 1,00 AZN

Nümunə: 350 kVt·saat istehlak
İlk 200 kVt × 0,084 = 16,80 AZN
Növbəti 100 kVt × 0,10 = 10,00 AZN
Qalan 50 kVt × 0,15 = 7,50 AZN
Xidmət haqqı = 1,00 AZN
Yekun = 35,30 AZN

Təbii qaz (Azəriqaz, illik kumulyativ):
• 0–1200 m³/il: 12 qəpik
• 1200–2500 m³/il: 20 qəpik
• 2500+ m³/il: 25 qəpik
• Sabit aylıq xidmət haqqı: 1,00 AZN
Sayğac yanvar 1-də sıfırlanır.

Nümunə: İl boyu 1150 m³ işlətmisiniz, dekabrda 100 m³:
Limitə qalan 50 m³ × 0,12 = 6,00 AZN
Limiti keçən 50 m³ × 0,20 = 10,00 AZN
Xidmət haqqı = 1,00 AZN
Yekun = 17,00 AZN

Su təchizatı:
• Bakı, Sumqayıt, Xırdalan, Abşeron: 0,70 AZN/m³
• Digər ərazilər: 0,60 AZN/m³
• Tullantı sularının axıdılması: 0,30 AZN/m³

İstilik: 0,04 AZN/m² (noyabr–mart)`}
      relatedIds={["price-per-sqm", "property-tax", "rental-tax", "deposit"]}
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════ ELEKTRİK ═══════════ */}
      {(activeTab === "all" || activeTab === "electricity") && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h3 className="font-semibold text-foreground">Elektrik enerjisi</h3>
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">2025 tarif</span>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-foreground mb-1">Aylıq istehlak (kVt·saat)</label>
            <input
              type="number"
              value={electricityKwh}
              onChange={(e) => setElectricityKwh(e.target.value)}
              placeholder="350"
              min="0"
              className={inputCls}
            />
            <div className="flex gap-2 mt-2">
              {[100, 200, 300, 500].map((v) => (
                <button key={v} onClick={() => setElectricityKwh(String(v))}
                  className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-colors">
                  {v} kVt
                </button>
              ))}
            </div>
          </div>

          {/* Detallı qəbz */}
          {result.electricity.subtotal > 0 && (() => {
            const el = result.electricity;
            return (
              <div className="mt-3 bg-white rounded-xl border border-amber-200 overflow-hidden">
                <div className="bg-amber-100 px-4 py-3 border-b border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-amber-800">Hesablama qaydası</span>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">qəbz</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">Aylıq istehlak: <span className="font-bold">{result.elKwh} kVt·saat</span></p>
                </div>

                {/* Pillə-pillə izah */}
                <div className="divide-y divide-amber-100">
                  {el.breakdown.map((b, i) => {
                    const pct = el.subtotal > 0 ? (b.cost / el.subtotal) * 100 : 0;
                    const tierFull = b.kwh >= (ELECTRICITY_TIERS[i]?.limit ?? 0) && ELECTRICITY_TIERS[i]?.limit !== Infinity;
                    return (
                      <div key={b.label} className="px-4 py-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-green-100 text-green-700" : i === 1 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{i + 1}</span>
                            <span className="text-sm font-medium text-foreground">{b.label}</span>
                          </div>
                          <span className="text-sm font-bold text-amber-700">{fmt(b.cost)} AZN</span>
                        </div>
                        <div className="ml-7">
                          <p className="text-xs text-foreground">
                            {b.kwh} kVt·saat × {b.rate} AZN = <span className="font-semibold">{fmt(b.cost)} AZN</span>
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            Tarif: hər kVt·saat üçün {(b.rate * 100).toFixed(1)} qəpik
                            {tierFull && <span className="text-amber-600 ml-1"> — bu pillənin limiti doldu</span>}
                          </p>
                          {/* Mini progress bar */}
                          <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-muted mt-0.5">Enerji haqqının {pct.toFixed(0)}%-i</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Sabit xidmət haqqı */}
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-600">+</span>
                        <span className="text-sm font-medium text-foreground">Sabit aylıq xidmət haqqı</span>
                      </div>
                      <span className="text-sm font-bold text-amber-700">{fmt(el.serviceFee)} AZN</span>
                    </div>
                    <p className="text-xs text-muted ml-7">Hər ay sabit olaraq tutulur (sayğac xidməti)</p>
                  </div>
                </div>

                {/* Yekun */}
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-200">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted">
                      <span>Enerji haqqı</span>
                      <span>{fmt(el.subtotal)} AZN</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>Xidmət haqqı</span>
                      <span>{fmt(el.serviceFee)} AZN</span>
                    </div>
                    <div className="border-t border-amber-200 pt-1.5 mt-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-foreground">Yekun ödəniş</span>
                      <span className="font-bold text-lg text-amber-700">{fmt(el.total)} AZN</span>
                    </div>
                  </div>
                </div>

                {/* Məsləhət */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-amber-100 text-xs">
                  {el.breakdown.length === 1 && (
                    <p className="text-green-600">Yalnız 1-ci pillədəsiniz — ən ucuz tarif ilə hesablanır!</p>
                  )}
                  {el.breakdown.length === 2 && (
                    <p className="text-amber-600">2-ci pilləyə keçmisiniz — 200 kVt-dan sonrakı hissə 19% baha hesablanır.</p>
                  )}
                  {el.breakdown.length >= 3 && (
                    <p className="text-red-600">3-cü pilləyə keçmisiniz — 300 kVt-dan sonrakı hissə 50% baha hesablanır!</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════ QAZ ═══════════ */}
      {(activeTab === "all" || activeTab === "gas") && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔥</span>
            <h3 className="font-semibold text-foreground">Təbii qaz (Azəriqaz)</h3>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">2026 tarif</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Bu ayki istehlak (m³)</label>
              <input
                type="number"
                value={gasM3}
                onChange={(e) => setGasM3(e.target.value)}
                placeholder="300"
                min="0"
                className={inputCls}
              />
              <div className="flex gap-2 mt-2">
                {[50, 150, 300, 500].map((v) => (
                  <button key={v} onClick={() => setGasM3(String(v))}
                    className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors">
                    {v} m³
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">İlin əvvəlindən bəri cəmi (m³)</label>
              <input
                type="number"
                value={gasPrevYearly}
                onChange={(e) => setGasPrevYearly(e.target.value)}
                placeholder="0"
                min="0"
                className={inputCls}
              />
              <p className="text-[11px] text-muted mt-1">Sayğac yanvardan bu aya qədər nə qədər göstərir? (Bu ay daxil deyil)</p>
            </div>
          </div>

          {/* İllik pillə göstəricisi */}
          {(() => {
            const prevYearly = parseFloat(gasPrevYearly) || 0;
            const newTotal = prevYearly + (parseFloat(gasM3) || 0);
            return (
              <div className="bg-white rounded-lg border border-blue-200 p-3 mb-3">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>İllik istehlak: {Math.round(newTotal)} m³ / 2500 m³</span>
                  <span>{newTotal <= 1200 ? "1-ci pillə" : newTotal <= 2500 ? "2-ci pillə" : "3-cü pillə"}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-400" style={{ width: `${Math.min((Math.min(newTotal, 1200) / 2500) * 100, 48)}%` }} />
                  {newTotal > 1200 && <div className="h-full bg-amber-400" style={{ width: `${Math.min(((Math.min(newTotal, 2500) - 1200) / 2500) * 100, 52)}%` }} />}
                  {newTotal > 2500 && <div className="h-full bg-red-400" style={{ width: "2%" }} />}
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-1">
                  <span>0</span>
                  <span className={newTotal > 1200 ? "text-amber-600 font-medium" : ""}>1200 m³</span>
                  <span className={newTotal > 2500 ? "text-red-600 font-medium" : ""}>2500 m³</span>
                </div>
              </div>
            );
          })()}

          {/* Detallı qəbz */}
          {result.gas.subtotal > 0 && (() => {
            const g = result.gas;
            const prevYearly = parseFloat(gasPrevYearly) || 0;
            return (
              <div className="mt-3 bg-white rounded-xl border border-blue-200 overflow-hidden">
                <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-blue-800">Hesablama qaydası</span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">qəbz</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Bu ayki istehlak: <span className="font-bold">{result.gM3} m³</span>
                    {prevYearly > 0 && <span className="ml-2">| İllik cəmi: {prevYearly} + {result.gM3} = {g.newYearlyCumulative} m³</span>}
                  </p>
                </div>

                {/* Pillə izahı */}
                {prevYearly > 0 && (
                  <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-700">
                    İlin əvvəlindən {prevYearly} m³ işlətmisiniz
                    {prevYearly < 1200 ? ` — 1-ci pillə limitinə ${1200 - prevYearly} m³ qalıb` :
                     prevYearly < 2500 ? ` — 2-ci pillə limitinə ${2500 - prevYearly} m³ qalıb` :
                     ` — artıq 3-cü pillədəsiniz`}
                  </div>
                )}

                <div className="divide-y divide-blue-100">
                  {g.breakdown.map((b, i) => {
                    const pct = g.subtotal > 0 ? (b.cost / g.subtotal) * 100 : 0;
                    return (
                      <div key={b.label} className="px-4 py-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${b.rate === 0.12 ? "bg-green-100 text-green-700" : b.rate === 0.20 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                              {b.rate === 0.12 ? "1" : b.rate === 0.20 ? "2" : "3"}
                            </span>
                            <span className="text-sm font-medium text-foreground">{b.label}</span>
                          </div>
                          <span className="text-sm font-bold text-blue-700">{fmt(b.cost)} AZN</span>
                        </div>
                        <div className="ml-7">
                          <p className="text-xs text-foreground">
                            {b.m3} m³ × {b.rate} AZN = <span className="font-semibold">{fmt(b.cost)} AZN</span>
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            Tarif: hər m³ üçün {(b.rate * 100).toFixed(0)} qəpik
                          </p>
                          <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-muted mt-0.5">Qaz haqqının {pct.toFixed(0)}%-i</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Sabit xidmət haqqı */}
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-600">+</span>
                        <span className="text-sm font-medium text-foreground">Sabit aylıq xidmət haqqı</span>
                      </div>
                      <span className="text-sm font-bold text-blue-700">{fmt(g.serviceFee)} AZN</span>
                    </div>
                    <p className="text-xs text-muted ml-7">Hər ay sabit olaraq tutulur (abonent xidməti)</p>
                  </div>
                </div>

                {/* Yekun */}
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted">
                      <span>Qaz haqqı</span>
                      <span>{fmt(g.subtotal)} AZN</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>Xidmət haqqı</span>
                      <span>{fmt(g.serviceFee)} AZN</span>
                    </div>
                    <div className="border-t border-blue-200 pt-1.5 mt-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-foreground">Yekun ödəniş</span>
                      <span className="font-bold text-lg text-blue-700">{fmt(g.total)} AZN</span>
                    </div>
                  </div>
                </div>

                {/* Məsləhət */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-blue-100 text-xs">
                  {g.breakdown.length === 1 && g.breakdown[0].rate === 0.12 && (
                    <p className="text-green-600">Yalnız 1-ci pillədəsiniz (12 qəpik) — ən ucuz tarif!</p>
                  )}
                  {g.breakdown.some(b => b.rate === 0.20) && (
                    <p className="text-amber-600">Diqqət: 1200 m³ illik limiti keçmisiniz — artıq hissə 20 qəpikdən hesablanır (67% baha).</p>
                  )}
                  {g.breakdown.some(b => b.rate === 0.25) && (
                    <p className="text-red-600">Diqqət: 2500 m³ illik limiti keçmisiniz — artıq hissə 25 qəpikdən hesablanır!</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════ SU ═══════════ */}
      {(activeTab === "all" || activeTab === "water") && (
        <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💧</span>
            <h3 className="font-semibold text-foreground">Su təchizatı</h3>
          </div>

          {/* Region */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setIsBaku(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isBaku ? "bg-cyan-500 text-white" : "bg-white text-muted border border-cyan-200"
              }`}
            >
              Bakı / Sumqayıt / Abşeron (0,70)
            </button>
            <button
              onClick={() => setIsBaku(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !isBaku ? "bg-cyan-500 text-white" : "bg-white text-muted border border-cyan-200"
              }`}
            >
              Digər ərazilər (0,60)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-muted mb-1">Soyuq su (m³/ay)</label>
              <input
                type="number"
                value={coldWaterM3}
                onChange={(e) => setColdWaterM3(e.target.value)}
                placeholder="8"
                min="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">İsti su (m³/ay)</label>
              <input
                type="number"
                value={hotWaterM3}
                onChange={(e) => setHotWaterM3(e.target.value)}
                placeholder="3"
                min="0"
                className={inputCls}
              />
            </div>
          </div>

          {/* Su tarif cədvəli */}
          <div className="bg-white rounded-lg border border-cyan-200 overflow-hidden mt-3">
            <div className="divide-y divide-cyan-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-foreground">Soyuq su ({result.cwM3} m³ × {result.waterRate} AZN)</span>
                <span className="text-sm font-medium text-cyan-700">{fmt(result.coldWater)} AZN</span>
              </div>
              {result.cwM3 > 0 && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-foreground">Kanalizasiya ({result.cwM3} m³ × {WASTEWATER} AZN)</span>
                  <span className="text-sm font-medium text-cyan-700">{fmt(result.wastewater)} AZN</span>
                </div>
              )}
              {result.hwM3 > 0 && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-foreground">İsti su ({result.hwM3} m³ × 2,20 AZN)</span>
                  <span className="text-sm font-medium text-cyan-700">{fmt(result.hotWater)} AZN</span>
                </div>
              )}
            </div>
          </div>

          {result.waterTotal > 0 && (
            <div className="mt-3 text-right">
              <span className="text-lg font-bold text-cyan-700">{fmt(result.waterTotal)} AZN</span>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ İSTİLİK + ZİBİL ═══════════ */}
      {activeTab === "all" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-gray-50 rounded-xl border border-border p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <span>🏠</span> Mənzilin sahəsi (m²)
            </label>
            <input
              type="number"
              value={areaM2}
              onChange={(e) => setAreaM2(e.target.value)}
              placeholder="80"
              min="0"
              className={inputCls}
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHeating}
                onChange={(e) => setIncludeHeating(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-xs text-muted">Mərkəzi istilik (noyabr–mart, 0,04 AZN/m²)</span>
            </label>
          </div>

        </div>
      )}

      {/* ═══════════ NƏTİCƏLƏR ═══════════ */}
      {hasAnyInput ? (
        <div className="space-y-4">
          {/* Ümumi */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">Aylıq kommunal xərc</p>
            <p className="text-4xl font-bold">{fmt(result.total)}</p>
            <p className="text-sm text-blue-200 mt-1">AZN / ay</p>
            <p className="text-xs text-blue-300 mt-2">İllik: {fmt(result.total * 12)} AZN</p>
          </div>

          {/* Xidmətlər üzrə kartlar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {result.electricity.total > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                <span className="text-2xl block mb-1">💡</span>
                <p className="text-xs text-amber-600">Elektrik</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.electricity.total)}</p>
              </div>
            )}
            {result.gas.total > 0 && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                <span className="text-2xl block mb-1">🔥</span>
                <p className="text-xs text-blue-600">Qaz</p>
                <p className="text-lg font-bold text-blue-700">{fmt(result.gas.total)}</p>
              </div>
            )}
            {result.waterTotal > 0 && (
              <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-4 text-center">
                <span className="text-2xl block mb-1">💧</span>
                <p className="text-xs text-cyan-600">Su</p>
                <p className="text-lg font-bold text-cyan-700">{fmt(result.waterTotal)}</p>
              </div>
            )}
            {result.heating > 0 && (
              <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
                <span className="text-2xl block mb-1">🏠</span>
                <p className="text-xs text-orange-600">İstilik</p>
                <p className="text-lg font-bold text-orange-700">{fmt(result.heating)}</p>
              </div>
            )}
          </div>

          {/* Vizual */}
          {result.total > 0 && (
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-muted mb-3 font-medium">Xərcin strukturu</p>
              <div className="w-full h-6 rounded-full overflow-hidden flex">
                {result.electricity.total > 0 && <div className="h-full bg-amber-400" style={{ width: `${(result.electricity.total / result.total) * 100}%` }} />}
                {result.gas.total > 0 && <div className="h-full bg-blue-400" style={{ width: `${(result.gas.total / result.total) * 100}%` }} />}
                {result.waterTotal > 0 && <div className="h-full bg-cyan-400" style={{ width: `${(result.waterTotal / result.total) * 100}%` }} />}
                {result.heating > 0 && <div className="h-full bg-orange-400" style={{ width: `${(result.heating / result.total) * 100}%` }} />}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                {result.electricity.total > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Elektrik: {fmt(result.electricity.total)} ({((result.electricity.total / result.total) * 100).toFixed(0)}%)</span>
                )}
                {result.gas.total > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />Qaz: {fmt(result.gas.total)} ({((result.gas.total / result.total) * 100).toFixed(0)}%)</span>
                )}
                {result.waterTotal > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />Su: {fmt(result.waterTotal)} ({((result.waterTotal / result.total) * 100).toFixed(0)}%)</span>
                )}
              </div>
            </div>
          )}

          {/* Qənaət məsləhətləri */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              Qənaət məsləhətləri
            </h4>
            <ul className="text-xs text-green-700 space-y-1.5">
              <li>• Elektrik: 200 kVt·saat limitində qalın — sonrakı pillədə tarif 19% artır</li>
              <li>• Qaz: Aylıq 100 m³-dən az istifadə edin — sonrakı pillədə tarif 76% artır</li>
              <li>• LED lampalar adi lampalara nisbətən 80% az enerji sərf edir</li>
              <li>• Qazanın temperaturunu 1°C azaltmaq ~6% qənaət edir</li>
              <li>• Su sayğacı quraşdırın — normativ istehlakdan 30-40% az ödəyərsiniz</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💡</span>
          <p>Nəticəni görmək üçün istehlak məlumatlarını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
