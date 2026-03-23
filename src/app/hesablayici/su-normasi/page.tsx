"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Climate = "cold" | "moderate" | "hot" | "very_hot";

const activityLevels: { id: ActivityLevel; label: string; icon: string; factor: number; description: string }[] = [
  { id: "sedentary", label: "Oturaq", icon: "🪑", factor: 1.0, description: "Masa arxasında iş, az hərəkət" },
  { id: "light", label: "Yüngül", icon: "🚶", factor: 1.1, description: "Həftədə 1–3 gün yüngül idman" },
  { id: "moderate", label: "Orta", icon: "🏃", factor: 1.25, description: "Həftədə 3–5 gün idman" },
  { id: "active", label: "Aktiv", icon: "🏋️", factor: 1.4, description: "Həftədə 6–7 gün ağır idman" },
  { id: "very_active", label: "Çox aktiv", icon: "⚡", factor: 1.6, description: "Gündə 2+ saat intensiv idman" },
];

const climates: { id: Climate; label: string; icon: string; factor: number; description: string }[] = [
  { id: "cold", label: "Soyuq", icon: "❄️", factor: 0.9, description: "< 10°C" },
  { id: "moderate", label: "Mülayim", icon: "🌤️", factor: 1.0, description: "10–25°C" },
  { id: "hot", label: "İsti", icon: "☀️", factor: 1.15, description: "25–35°C" },
  { id: "very_hot", label: "Çox isti", icon: "🔥", factor: 1.3, description: "35°C+" },
];

// Stəkan = 250 ml
const GLASS_ML = 250;

// Öğün vaxtları üçün su bölgüsü
interface WaterSchedule {
  time: string;
  label: string;
  icon: string;
  percent: number;
}

const waterSchedule: WaterSchedule[] = [
  { time: "07:00", label: "Oyananda (acqarına)", icon: "🌅", percent: 10 },
  { time: "08:00", label: "Səhər yeməyindən əvvəl", icon: "☕", percent: 8 },
  { time: "10:00", label: "Səhər ara", icon: "🕙", percent: 12 },
  { time: "12:00", label: "Nahardan əvvəl", icon: "🕛", percent: 10 },
  { time: "14:00", label: "Nahardan sonra", icon: "☀️", percent: 12 },
  { time: "16:00", label: "Günortadan sonra", icon: "🕓", percent: 15 },
  { time: "18:00", label: "Axşam", icon: "🌆", percent: 13 },
  { time: "20:00", label: "Şam yeməyindən sonra", icon: "🌙", percent: 12 },
  { time: "22:00", label: "Yatmadan əvvəl", icon: "😴", percent: 8 },
];

function fmt(n: number): string {
  return n.toFixed(1);
}

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<Climate>("moderate");
  const [exerciseMin, setExerciseMin] = useState("");
  const [caffeineCount, setCaffeineCount] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;

    const actLevel = activityLevels.find((l) => l.id === activity)!;
    const climateLevel = climates.find((c) => c.id === climate)!;

    // Baza: 33 ml/kq
    const baseMl = w * 33;

    // Aktivlik əmsalı
    let totalMl = baseMl * actLevel.factor;

    // İqlim əmsalı
    totalMl *= climateLevel.factor;

    // İdman əlavəsi (hər 30 dəq üçün +350 ml)
    const exMin = parseInt(exerciseMin) || 0;
    const exerciseExtra = Math.round(exMin / 30) * 350;
    totalMl += exerciseExtra;

    // Kofein əlavəsi (hər fincan üçün +150 ml)
    const caffeine = parseInt(caffeineCount) || 0;
    const caffeineExtra = caffeine * 150;
    totalMl += caffeineExtra;

    // Hamiləlik / Əmizdirmə
    let pregnancyExtra = 0;
    if (isPregnant) {
      pregnancyExtra = 300;
      totalMl += pregnancyExtra;
    }
    let breastfeedingExtra = 0;
    if (isBreastfeeding) {
      breastfeedingExtra = 700;
      totalMl += breastfeedingExtra;
    }

    const totalL = totalMl / 1000;
    const glasses = Math.ceil(totalMl / GLASS_ML);

    // Minimum / Maksimum
    const minMl = w * 25;
    const maxMl = w * 45;

    return {
      baseMl,
      totalMl,
      totalL,
      glasses,
      exerciseExtra,
      caffeineExtra,
      pregnancyExtra,
      breastfeedingExtra,
      minL: minMl / 1000,
      maxL: maxMl / 1000,
      actLevel,
      climateLevel,
      weight: w,
    };
  }, [weight, activity, climate, exerciseMin, caffeineCount, isPregnant, isBreastfeeding]);

  // Su doldurma vizualı üçün stəkan sayı (max 12 göstər)
  const displayGlasses = result ? Math.min(12, result.glasses) : 0;

  return (
    <CalculatorLayout
      title="Su norması hesablayıcısı"
      description="Gündəlik su qəbulu normanızı çəki, aktivlik, iqlim və digər amillərə görə hesablayın."
      breadcrumbs={[
        { label: "Sağlamlıq", href: "/?category=health" },
        { label: "Su norması hesablayıcısı" },
      ]}
      formulaTitle="Gündəlik su norması necə hesablanır?"
      formulaContent={`Baza norma: Çəki (kq) × 33 ml

Əmsallar:
• Aktivlik: oturaq ×1.0, yüngül ×1.1, orta ×1.25, aktiv ×1.4, çox aktiv ×1.6
• İqlim: soyuq ×0.9, mülayim ×1.0, isti ×1.15, çox isti ×1.3

Əlavələr:
• İdman: hər 30 dəqiqə üçün +350 ml
• Kofein: hər fincan çay/qəhvə üçün +150 ml
• Hamiləlik: +300 ml
• Əmizdirmə: +700 ml

Ümumi norma: Baza × Aktivlik × İqlim + Əlavələr

Tövsiyə: Gün ərzində kiçik porsiyalarla, 200–300 ml aralıqla için.
Susuzluq hiss etməyi gözləməyin — susuzluq artıq dehidratasiyanın əlamətidir.
Sidik rəngi açıq sarı olmalıdır — tünd rəng dehidratsiyanı göstərir.`}
      relatedIds={["bmi", "bmr", "ideal-weight", "pregnancy"]}
    >
      {/* Weight */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">⚖️ Çəki (kq)</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="75"
          min="20"
          max="250"
          className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[55, 65, 75, 85, 100].map((v) => (
            <button
              key={v}
              onClick={() => setWeight(String(v))}
              className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              {v} kq
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Fiziki aktivlik</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {activityLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setActivity(level.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                activity === level.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{level.icon}</span>
              <p className="text-xs font-medium text-foreground">{level.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Climate */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">İqlim / Hava temperaturu</label>
        <div className="grid grid-cols-4 gap-3">
          {climates.map((c) => (
            <button
              key={c.id}
              onClick={() => setClimate(c.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                climate === c.id
                  ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{c.icon}</span>
              <p className="text-xs font-medium text-foreground">{c.label}</p>
              <p className="text-[10px] text-muted">{c.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl border border-border p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            🏃 Gündəlik idman (dəqiqə)
          </label>
          <input
            type="number"
            value={exerciseMin}
            onChange={(e) => setExerciseMin(e.target.value)}
            placeholder="0"
            min="0"
            max="480"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <p className="text-xs text-muted mt-1">Hər 30 dəq üçün +350 ml</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-border p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            ☕ Çay/Qəhvə (fincan/gün)
          </label>
          <input
            type="number"
            value={caffeineCount}
            onChange={(e) => setCaffeineCount(e.target.value)}
            placeholder="0"
            min="0"
            max="15"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <p className="text-xs text-muted mt-1">Hər fincan üçün +150 ml</p>
        </div>
      </div>

      {/* Pregnancy/Breastfeeding */}
      <div className="flex gap-4 mb-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPregnant}
            onChange={(e) => setIsPregnant(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">🤰 Hamiləyəm (+300 ml)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isBreastfeeding}
            onChange={(e) => setIsBreastfeeding(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">🍼 Əmizdirirəm (+700 ml)</span>
        </label>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Result */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-cyan-100 mb-1">Gündəlik su normanız</p>
            <p className="text-5xl font-bold">{fmt(result.totalL)}</p>
            <p className="text-lg text-cyan-100 mt-1">litr / gün</p>
            <div className="flex justify-center gap-6 mt-3 text-sm text-cyan-200">
              <span>{Math.round(result.totalMl)} ml</span>
              <span>•</span>
              <span>{result.glasses} stəkan</span>
            </div>
          </div>

          {/* Glass Visual */}
          <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-5">
            <p className="text-xs text-cyan-600 mb-3 font-medium text-center">
              {result.glasses} stəkan (hər biri {GLASS_ML} ml)
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: displayGlasses }).map((_, i) => (
                <div key={i} className="text-2xl" title={`Stəkan ${i + 1}`}>
                  💧
                </div>
              ))}
              {result.glasses > 12 && (
                <span className="text-sm text-cyan-600 self-center ml-1">+{result.glasses - 12}</span>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">Baza norma</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.baseMl / 1000)} L</p>
              <p className="text-xs text-muted mt-1">{result.weight} kq × 33 ml</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">Minimum</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.minL)} L</p>
              <p className="text-xs text-muted mt-1">25 ml/kq</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">Maksimum</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.maxL)} L</p>
              <p className="text-xs text-muted mt-1">45 ml/kq</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Hesablamanın tərkibi
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Baza ({result.weight} kq × 33 ml)</span>
                <span className="text-sm font-medium text-foreground">{Math.round(result.baseMl)} ml</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Aktivlik əmsalı (×{result.actLevel.factor})</span>
                <span className="text-sm font-medium text-foreground">{Math.round(result.baseMl * result.actLevel.factor)} ml</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">İqlim əmsalı (×{result.climateLevel.factor})</span>
                <span className="text-sm font-medium text-foreground">
                  {result.climateLevel.factor !== 1
                    ? `${result.climateLevel.factor > 1 ? "+" : ""}${Math.round(result.baseMl * result.actLevel.factor * (result.climateLevel.factor - 1))} ml`
                    : "0 ml"
                  }
                </span>
              </div>
              {result.exerciseExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">İdman əlavəsi</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.exerciseExtra} ml</span>
                </div>
              )}
              {result.caffeineExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Kofein kompensasiyası</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.caffeineExtra} ml</span>
                </div>
              )}
              {result.pregnancyExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Hamiləlik əlavəsi</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.pregnancyExtra} ml</span>
                </div>
              )}
              {result.breastfeedingExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Əmizdirmə əlavəsi</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.breastfeedingExtra} ml</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-4 bg-cyan-50">
                <span className="text-sm font-semibold text-cyan-700">Ümumi gündəlik norma</span>
                <span className="text-sm font-bold text-cyan-700">{Math.round(result.totalMl)} ml ({fmt(result.totalL)} L)</span>
              </div>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🕐</span>
                Gün ərzində su qəbulu cədvəli
              </h3>
            </div>
            <div className="divide-y divide-border">
              {waterSchedule.map((slot) => {
                const ml = Math.round(result.totalMl * slot.percent / 100);
                const glasses = Math.round(ml / GLASS_ML * 10) / 10;
                return (
                  <div key={slot.time} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted w-12">{slot.time}</span>
                      <span>{slot.icon}</span>
                      <span className="text-sm text-foreground">{slot.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">{ml} ml</span>
                      <span className="text-xs text-muted ml-2">({glasses} stəkan)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hydration Signs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✅</span>
                Yaxşı hidratasiya əlamətləri
              </h4>
              <ul className="text-xs text-green-700 space-y-1.5">
                <li>• Sidik rəngi açıq sarı</li>
                <li>• Dəri elastik və nəmli</li>
                <li>• Enerji səviyyəsi yüksək</li>
                <li>• Konsentrasiya yaxşı</li>
                <li>• Baş ağrısı yoxdur</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                Dehidratasiya əlamətləri
              </h4>
              <ul className="text-xs text-red-700 space-y-1.5">
                <li>• Sidik rəngi tünd sarı/narıncı</li>
                <li>• Ağız quruluğu</li>
                <li>• Baş ağrısı və yorğunluq</li>
                <li>• Başgicəllənmə</li>
                <li>• Quru dəri</li>
              </ul>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              Su içmə məsləhətləri
            </h4>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li>• Səhər oyananda 1 stəkan su için — metabolizmanı işə salır</li>
              <li>• Yeməkdən 30 dəq əvvəl su için — həzmə kömək edir</li>
              <li>• Susuzluq hiss etməyi gözləməyin — bu artıq gecdir</li>
              <li>• Yanınızda su şüşəsi gəzdirin — xatırlatma rolunu oynayır</li>
              <li>• Meyvə və tərəvəzlər də su təmin edir (xiyar ~95%, qarpız ~92%)</li>
              <li>• Soyuq su deyil, otaq temperaturu su için — bədən daha asan qəbul edir</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💧</span>
          <p>Nəticəni görmək üçün çəkinizi daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
