"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Region = "baku" | "other";
type DriverAge = "under25" | "25plus";
type Experience = "under2" | "2plus";
type AccidentHistory = "clean" | "one" | "multiple";
type EnginePower = "under100" | "100to150" | "150to200" | "over200";

const BASE_RATE_BAKU = 50;
const BASE_RATE_OTHER = 40;

const regionOptions: { value: Region; label: string; icon: string }[] = [
  { value: "baku", label: "Bakı", icon: "🏙️" },
  { value: "other", label: "Digər regionlar", icon: "🌄" },
];

const ageOptions: { value: DriverAge; label: string }[] = [
  { value: "under25", label: "25 yaşdan kiçik" },
  { value: "25plus", label: "25 yaş və yuxarı" },
];

const experienceOptions: { value: Experience; label: string }[] = [
  { value: "under2", label: "2 ildən az" },
  { value: "2plus", label: "2 il və yuxarı" },
];

const accidentOptions: { value: AccidentHistory; label: string; icon: string }[] = [
  { value: "clean", label: "Qəzasız", icon: "✅" },
  { value: "one", label: "1 qəza", icon: "⚠️" },
  { value: "multiple", label: "2+ qəza", icon: "🚨" },
];

const enginePowerOptions: { value: EnginePower; label: string }[] = [
  { value: "under100", label: "100 a.g.-dək" },
  { value: "100to150", label: "100–150 a.g." },
  { value: "150to200", label: "150–200 a.g." },
  { value: "over200", label: "200+ a.g." },
];

function getRegionCoeff(region: Region): number {
  return region === "baku" ? 1.0 : 0.8;
}

function getAgeExpCoeff(age: DriverAge, exp: Experience): number {
  if (age === "under25" && exp === "under2") return 1.5;
  if (age === "under25") return 1.3;
  if (exp === "under2") return 1.2;
  return 1.0;
}

function getAccidentCoeff(history: AccidentHistory): number {
  if (history === "clean") return 0.8;
  if (history === "one") return 1.5;
  return 2.0;
}

function getEnginePowerCoeff(power: EnginePower): number {
  if (power === "under100") return 0.9;
  if (power === "100to150") return 1.0;
  if (power === "150to200") return 1.2;
  return 1.5;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function OsagoCalculator() {
  const [region, setRegion] = useState<Region>("baku");
  const [driverAge, setDriverAge] = useState<DriverAge>("25plus");
  const [experience, setExperience] = useState<Experience>("2plus");
  const [accidentHistory, setAccidentHistory] = useState<AccidentHistory>("clean");
  const [enginePower, setEnginePower] = useState<EnginePower>("100to150");

  const result = useMemo(() => {
    const baseRate = region === "baku" ? BASE_RATE_BAKU : BASE_RATE_OTHER;
    const regionCoeff = getRegionCoeff(region);
    const ageExpCoeff = getAgeExpCoeff(driverAge, experience);
    const accidentCoeff = getAccidentCoeff(accidentHistory);
    const powerCoeff = getEnginePowerCoeff(enginePower);

    const totalCoeff = regionCoeff * ageExpCoeff * accidentCoeff * powerCoeff;
    const premium = baseRate * totalCoeff;

    return {
      baseRate,
      regionCoeff,
      ageExpCoeff,
      accidentCoeff,
      powerCoeff,
      totalCoeff,
      premium,
    };
  }, [region, driverAge, experience, accidentHistory, enginePower]);

  const minPremium = BASE_RATE_OTHER * 0.8 * 1.0 * 0.8 * 0.9;
  const maxPremium = BASE_RATE_BAKU * 1.0 * 1.5 * 2.0 * 1.5;

  return (
    <CalculatorLayout
      title="OSAGO hesablayıcısı"
      description="Azərbaycanda icbari avtomobil sığortası (OSAGO) haqqını hesablayın."
      breadcrumbs={[
        { label: "Avtomobil", href: "/?category=automotive" },
        { label: "OSAGO sığortası" },
      ]}
      formulaTitle="OSAGO haqqı necə hesablanır?"
      formulaContent={`OSAGO haqqı = Baza dərəcə × Əmsallar

Baza dərəcə:
• Bakı: 50 AZN
• Digər regionlar: 40 AZN

Əmsallar:
• Region əmsalı: Bakı ×1.0, digər ×0.8
• Yaş/təcrübə: gənc sürücü (<25 yaş, <2 il) ×1.5
• Qəza tarixi: qəzasız ×0.8, 1 qəza ×1.5, 2+ qəza ×2.0
• Mühərrik gücü: <100 a.g. ×0.9, 100-150 ×1.0, 150-200 ×1.2, 200+ ×1.5

Bonus-malus sistemi:
Qəzasız sürücülər güzəştli tarif (×0.8) alır.
Qəza halında əmsal artır və növbəti il daha yüksək haqq ödənilir.`}
      relatedIds={["road-tax", "car-customs", "car-loan", "fuel-cost"]}
    >
      {/* Region */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Region</label>
        <div className="grid grid-cols-2 gap-3 sm:w-1/2">
          {regionOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                region === r.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{r.icon}</span>
              <p className="text-xs font-medium text-foreground">{r.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Driver Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Sürücünün yaşı</label>
          <div className="grid grid-cols-2 gap-3">
            {ageOptions.map((a) => (
              <button
                key={a.value}
                onClick={() => setDriverAge(a.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  driverAge === a.value
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-xs font-medium text-foreground">{a.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Sürücülük təcrübəsi</label>
          <div className="grid grid-cols-2 gap-3">
            {experienceOptions.map((e) => (
              <button
                key={e.value}
                onClick={() => setExperience(e.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  experience === e.value
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-xs font-medium text-foreground">{e.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accident History */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Qəza tarixi (son 1 il)</label>
        <div className="grid grid-cols-3 gap-3">
          {accidentOptions.map((a) => (
            <button
              key={a.value}
              onClick={() => setAccidentHistory(a.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                accidentHistory === a.value
                  ? accidentHistory === "clean"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                    : accidentHistory === "one"
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                    : "border-red-500 bg-red-50 ring-2 ring-red-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{a.icon}</span>
              <p className="text-xs font-medium text-foreground">{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Engine Power */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">Mühərrikin gücü</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {enginePowerOptions.map((ep) => (
            <button
              key={ep.value}
              onClick={() => setEnginePower(ep.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                enginePower === ep.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-xs font-medium text-foreground">{ep.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Main Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">OSAGO haqqı</p>
            <p className="text-3xl font-bold">{fmt(result.premium)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN / il</p>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted mb-1">Baza dərəcə</p>
            <p className="text-2xl font-bold text-foreground">{result.baseRate}</p>
            <p className="text-xs text-muted mt-1">AZN ({region === "baku" ? "Bakı" : "Digər"})</p>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
            <p className="text-sm text-amber-600 mb-1">Ümumi əmsal</p>
            <p className="text-2xl font-bold text-amber-700">×{result.totalCoeff.toFixed(2)}</p>
            <p className="text-xs text-amber-600 mt-1">
              {result.totalCoeff < 1 ? "Güzəştli" : result.totalCoeff > 1.5 ? "Yüksək risk" : "Normal"}
            </p>
          </div>
        </div>

        {/* Coefficient Breakdown */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span>📋</span>
              Əmsal tərkibi
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">Baza dərəcə</span>
              <span className="text-sm font-medium text-foreground">{result.baseRate} AZN</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">Region əmsalı</span>
              <span className={`text-sm font-medium ${result.regionCoeff < 1 ? "text-green-600" : "text-foreground"}`}>
                ×{result.regionCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">Yaş/təcrübə əmsalı</span>
              <span className={`text-sm font-medium ${result.ageExpCoeff > 1 ? "text-red-600" : "text-green-600"}`}>
                ×{result.ageExpCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">Bonus-malus (qəza tarixi)</span>
              <span className={`text-sm font-medium ${result.accidentCoeff < 1 ? "text-green-600" : result.accidentCoeff > 1 ? "text-red-600" : "text-foreground"}`}>
                ×{result.accidentCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">Mühərrik gücü əmsalı</span>
              <span className={`text-sm font-medium ${result.powerCoeff < 1 ? "text-green-600" : result.powerCoeff > 1 ? "text-red-600" : "text-foreground"}`}>
                ×{result.powerCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-4 bg-primary-light">
              <span className="text-sm font-semibold text-primary-dark">
                OSAGO haqqı ({result.baseRate} × {result.totalCoeff.toFixed(2)})
              </span>
              <span className="text-sm font-bold text-primary-dark">{fmt(result.premium)} AZN</span>
            </div>
          </div>
        </div>

        {/* Visual Scale */}
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-xs text-muted mb-3 font-medium">Sizin haqq skalada</p>
          <div className="relative">
            <div className="w-full h-4 bg-gradient-to-r from-green-300 via-amber-300 to-red-400 rounded-full" />
            <div
              className="absolute top-0 w-1 h-4 bg-foreground rounded-full"
              style={{ left: `${Math.min(((result.premium - minPremium) / (maxPremium - minPremium)) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>{fmt(minPremium)} AZN (min)</span>
            <span>{fmt(maxPremium)} AZN (max)</span>
          </div>
        </div>

        {/* Bonus-Malus Notice */}
        {accidentHistory === "clean" && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-700 leading-relaxed">
              <span className="font-semibold">Bonus:</span> Qəzasız sürücü kimi güzəştli tarif (×0.8) tətbiq olunur.
              Növbəti il də qəzasız keçsəniz, güzəşt davam edəcək.
            </p>
          </div>
        )}

        {accidentHistory !== "clean" && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">Malus:</span> Qəza tarixi olduğu üçün artırılmış tarif tətbiq olunur.
              1 il qəzasız keçdikdən sonra əmsal azaldılacaq.
            </p>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Diqqət:</span> Bu hesablama təxmini xarakter daşıyır.
            OSAGO sığortası icbaridir və sığorta şirkətinə müraciət etməklə rəsmiləşdirilir.
            Faktiki haqq sığorta şirkətinin tariflərinə əsasən fərqlənə bilər.
          </p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
