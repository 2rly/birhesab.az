"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";

interface ActivityLevel {
  id: string;
  label: string;
  factor: number;
  icon: string;
  description: string;
}

const activityLevels: ActivityLevel[] = [
  { id: "sedentary", label: "Oturaq", factor: 1.2, icon: "🪑", description: "Masa arxasında iş, az hərəkət" },
  { id: "light", label: "Yüngül", factor: 1.375, icon: "🚶", description: "Həftədə 1–3 gün yüngül idman" },
  { id: "moderate", label: "Orta", factor: 1.55, icon: "🏃", description: "Həftədə 3–5 gün orta intensiv idman" },
  { id: "active", label: "Aktiv", factor: 1.725, icon: "🏋️", description: "Həftədə 6–7 gün ağır idman" },
  { id: "very_active", label: "Çox aktiv", factor: 1.9, icon: "⚡", description: "Gündə 2 dəfə idman / fiziki iş" },
];

const goals: { value: Goal; label: string; icon: string; description: string; adjustment: number }[] = [
  { value: "lose", label: "Arıqlamaq", icon: "📉", description: "Həftədə ~0.5 kq itirmək", adjustment: -500 },
  { value: "maintain", label: "Çəkini saxlamaq", icon: "⚖️", description: "Hazırkı çəkini qorumaq", adjustment: 0 },
  { value: "gain", label: "Kilo almaq", icon: "📈", description: "Həftədə ~0.5 kq artırmaq", adjustment: 500 },
];

// Makronutrient paylanması
interface MacroSplit {
  label: string;
  protein: number; // % of calories
  carbs: number;
  fat: number;
  description: string;
}

const macroSplits: MacroSplit[] = [
  { label: "Balanslaşdırılmış", protein: 30, carbs: 40, fat: 30, description: "Ümumi sağlamlıq üçün" },
  { label: "Yüksək protein", protein: 40, carbs: 30, fat: 30, description: "Əzələ artımı / arıqlama" },
  { label: "Aşağı karbohidrat", protein: 30, carbs: 20, fat: 50, description: "Keto / low-carb rejimi" },
  { label: "Yüksək karbohidrat", protein: 20, carbs: 55, fat: 25, description: "Dözümlülük idmanları" },
];

function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CalorieCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [selectedMacro, setSelectedMacro] = useState(0);

  const result = useMemo(() => {
    const a = parseInt(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(weight);

    if (!a || a <= 0 || !h || h <= 0 || !w || w <= 0) return null;

    // BMR — Mifflin-St Jeor düsturu
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const actLevel = activityLevels.find((l) => l.id === activity)!;
    const tdee = bmr * actLevel.factor; // Total Daily Energy Expenditure

    const goalInfo = goals.find((g) => g.value === goal)!;
    const targetCalories = Math.max(1200, tdee + goalInfo.adjustment);

    // Makronutrientlər
    const macro = macroSplits[selectedMacro];
    const proteinCal = targetCalories * (macro.protein / 100);
    const carbsCal = targetCalories * (macro.carbs / 100);
    const fatCal = targetCalories * (macro.fat / 100);

    // 1q protein = 4 kkal, 1q karbohidrat = 4 kkal, 1q yağ = 9 kkal
    const proteinG = proteinCal / 4;
    const carbsG = carbsCal / 4;
    const fatG = fatCal / 9;

    // Su norması (təxmini: 30-35 ml/kq)
    const waterMl = w * 33;
    const waterL = waterMl / 1000;

    // BMI
    const heightM = h / 100;
    const bmi = w / (heightM * heightM);

    // Harris-Benedict (müqayisə üçün)
    let bmrHB: number;
    if (gender === "male") {
      bmrHB = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      bmrHB = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    }
    const tdeeHB = bmrHB * actLevel.factor;

    // Həftəlik dəyişiklik
    const weeklyChange = (goalInfo.adjustment * 7) / 7700; // 7700 kkal ≈ 1 kq yağ

    return {
      bmr,
      bmrHB,
      tdee,
      tdeeHB,
      targetCalories,
      proteinG,
      carbsG,
      fatG,
      proteinCal,
      carbsCal,
      fatCal,
      waterL,
      bmi,
      weeklyChange,
      actLevel,
      goalInfo,
    };
  }, [gender, age, heightCm, weight, activity, goal, selectedMacro]);

  return (
    <CalculatorLayout
      title="Kalori hesablayıcısı"
      description="Gündəlik kalori ehtiyacınızı, makronutrient paylanmanızı və su normanızı hesablayın."
      breadcrumbs={[
        { label: "Sağlamlıq", href: "/?category=health" },
        { label: "Kalori hesablayıcısı" },
      ]}
      formulaTitle="Kalori ehtiyacı necə hesablanır?"
      formulaContent={`BMR (Bazal Metabolizm Dərəcəsi) — Mifflin-St Jeor düsturu:
Kişi: BMR = 10 × çəki(kq) + 6.25 × boy(sm) − 5 × yaş + 5
Qadın: BMR = 10 × çəki(kq) + 6.25 × boy(sm) − 5 × yaş − 161

TDEE (Ümumi Gündəlik Enerji Xərci):
TDEE = BMR × Aktivlik əmsalı

Aktivlik əmsalları:
• Oturaq: ×1.2
• Yüngül: ×1.375
• Orta: ×1.55
• Aktiv: ×1.725
• Çox aktiv: ×1.9

Hədəf kalori:
• Arıqlamaq: TDEE − 500 kkal (həftədə ~0.5 kq)
• Saxlamaq: TDEE
• Kilo almaq: TDEE + 500 kkal (həftədə ~0.5 kq)

Makronutrientlər:
• 1 q protein = 4 kkal
• 1 q karbohidrat = 4 kkal
• 1 q yağ = 9 kkal`}
      relatedIds={["bmi", "ideal-weight", "water-intake", "pregnancy"]}
    >
      {/* Gender */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Cins</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGender("male")}
            className={`p-3 rounded-xl border text-center transition-all ${
              gender === "male"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">👨</span>
            <p className="text-xs font-medium text-foreground">Kişi</p>
          </button>
          <button
            onClick={() => setGender("female")}
            className={`p-3 rounded-xl border text-center transition-all ${
              gender === "female"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">👩</span>
            <p className="text-xs font-medium text-foreground">Qadın</p>
          </button>
        </div>
      </div>

      {/* Body Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">🎂 Yaş</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="30"
            min="2"
            max="120"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">📏 Boy (sm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="175"
            min="50"
            max="250"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">⚖️ Çəki (kq)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="75"
            min="20"
            max="300"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Activity Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Fiziki aktivlik səviyyəsi</label>
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
              <p className="text-[10px] text-muted mt-0.5">×{level.factor}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          {activityLevels.find((l) => l.id === activity)?.description}
        </p>
      </div>

      {/* Goal */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">Hədəfiniz</label>
        <div className="grid grid-cols-3 gap-3">
          {goals.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`p-4 rounded-xl border text-center transition-all ${
                goal === g.value
                  ? g.value === "lose"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                    : g.value === "maintain"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                    : "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{g.icon}</span>
              <p className="text-sm font-medium text-foreground">{g.label}</p>
              <p className="text-xs text-muted mt-1">{g.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">Gündəlik hədəf kalori</p>
            <p className="text-5xl font-bold">{fmt(result.targetCalories)}</p>
            <p className="text-sm text-blue-200 mt-1">kkal / gün</p>
            {goal !== "maintain" && (
              <p className="text-xs text-blue-300 mt-2">
                {goal === "lose" ? "📉" : "📈"} Həftəlik dəyişiklik: {result.weeklyChange > 0 ? "+" : ""}{result.weeklyChange.toFixed(2)} kq
              </p>
            )}
          </div>

          {/* BMR & TDEE Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">BMR (istirahətdə)</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.bmr)}</p>
              <p className="text-xs text-muted mt-1">kkal / gün</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 text-center">
              <p className="text-xs text-amber-600 mb-1">TDEE (ümumi xərc)</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.tdee)}</p>
              <p className="text-xs text-amber-600 mt-1">kkal / gün</p>
            </div>
            <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-5 text-center">
              <p className="text-xs text-cyan-600 mb-1">Su norması</p>
              <p className="text-2xl font-bold text-cyan-700">{result.waterL.toFixed(1)}</p>
              <p className="text-xs text-cyan-600 mt-1">litr / gün</p>
            </div>
          </div>

          {/* Macro Distribution */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🥗</span>
                Makronutrient paylanması
              </h3>
            </div>

            {/* Macro Type Selection */}
            <div className="px-5 py-3 border-b border-border">
              <div className="flex gap-2 flex-wrap">
                {macroSplits.map((m, i) => (
                  <button
                    key={m.label}
                    onClick={() => setSelectedMacro(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedMacro === i
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-muted hover:bg-gray-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">{macroSplits[selectedMacro].description}</p>
            </div>

            {/* Macro Bar */}
            <div className="px-5 py-4">
              <div className="w-full h-6 rounded-full overflow-hidden flex mb-3">
                <div className="h-full bg-red-400" style={{ width: `${macroSplits[selectedMacro].protein}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${macroSplits[selectedMacro].carbs}%` }} />
                <div className="h-full bg-blue-400" style={{ width: `${macroSplits[selectedMacro].fat}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="text-xs text-muted">Protein</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{Math.round(result.proteinG)}q</p>
                  <p className="text-xs text-muted">{fmt(result.proteinCal)} kkal ({macroSplits[selectedMacro].protein}%)</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="text-xs text-muted">Karbohidrat</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{Math.round(result.carbsG)}q</p>
                  <p className="text-xs text-muted">{fmt(result.carbsCal)} kkal ({macroSplits[selectedMacro].carbs}%)</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                    <span className="text-xs text-muted">Yağ</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{Math.round(result.fatG)}q</p>
                  <p className="text-xs text-muted">{fmt(result.fatCal)} kkal ({macroSplits[selectedMacro].fat}%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calorie by Activity */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Aktivlik səviyyəsinə görə kalori ehtiyacı
              </h3>
            </div>
            <div className="divide-y divide-border">
              {activityLevels.map((level) => {
                const tdee = result.bmr * level.factor;
                const target = Math.max(1200, tdee + result.goalInfo.adjustment);
                const isActive = level.id === activity;
                return (
                  <div key={level.id} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{level.icon}</span>
                      <div>
                        <p className={`text-sm ${isActive ? "font-semibold" : ""} text-foreground`}>{level.label}</p>
                        <p className="text-xs text-muted">{level.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{fmt(target)} kkal</p>
                      <p className="text-xs text-muted">TDEE: {fmt(tdee)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meal Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🍽️</span>
                Öğünlərə bölgü (tövsiyə)
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: "Səhər yeməyi", percent: 25, icon: "🌅", time: "07:00–09:00" },
                { label: "Ara qəlyanaltı", percent: 10, icon: "🍎", time: "10:30–11:00" },
                { label: "Nahar", percent: 35, icon: "☀️", time: "12:30–14:00" },
                { label: "Ara qəlyanaltı", percent: 10, icon: "🥜", time: "16:00–16:30" },
                { label: "Şam yeməyi", percent: 20, icon: "🌙", time: "19:00–20:00" },
              ].map((meal) => (
                <div key={meal.label + meal.time} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span>{meal.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{meal.label}</p>
                      <p className="text-xs text-muted">{meal.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{fmt(result.targetCalories * meal.percent / 100)} kkal</p>
                    <p className="text-xs text-muted">{meal.percent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formula Comparison */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">Düstur müqayisəsi</p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted mb-1">Mifflin-St Jeor</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.bmr)} kkal</p>
                <p className="text-xs text-green-600">Daha dəqiq (istifadə olunan)</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted mb-1">Harris-Benedict</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.bmrHB)} kkal</p>
                <p className="text-xs text-muted">Klassik düstur</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Bu hesablama təxmini xarakter daşıyır. Faktiki kalori
              ehtiyacı metabolizm sürəti, genetika, stress səviyyəsi və digər amillərə görə fərqlənə bilər.
              Arıqlama və ya kilo alma proqramına başlamazdan əvvəl dietoloqa və ya həkimə müraciət edin.
              Gündəlik kalori 1200 kkal-dan aşağı düşməməlidir.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🔥</span>
          <p>Nəticəni görmək üçün yaş, boy və çəkinizi daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
