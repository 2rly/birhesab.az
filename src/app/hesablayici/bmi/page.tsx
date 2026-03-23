"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Gender = "male" | "female";
type Unit = "metric" | "imperial";

interface BmiCategory {
  label: string;
  range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  description: string;
}

const bmiCategories: BmiCategory[] = [
  { label: "Çəki çatışmazlığı", range: "< 18.5", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", emoji: "🔵", description: "Normal çəkidən aşağı — qidalanma rejimini yaxşılaşdırın" },
  { label: "Normal çəki", range: "18.5 – 24.9", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200", emoji: "🟢", description: "Sağlam çəki — bu çəkini qorumağa çalışın" },
  { label: "Artıq çəki", range: "25.0 – 29.9", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", emoji: "🟡", description: "Normaldan yuxarı — fiziki aktivliyi artırın" },
  { label: "I dərəcə piylənmə", range: "30.0 – 34.9", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", emoji: "🟠", description: "Mülayim piylənmə — həkim məsləhəti tövsiyə olunur" },
  { label: "II dərəcə piylənmə", range: "35.0 – 39.9", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", emoji: "🔴", description: "Ciddi piylənmə — tibbi müdaxilə lazım ola bilər" },
  { label: "III dərəcə piylənmə", range: "≥ 40.0", color: "text-red-800", bgColor: "bg-red-100", borderColor: "border-red-300", emoji: "⛔", description: "Ağır piylənmə — mütləq həkim nəzarəti" },
];

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return bmiCategories[0];
  if (bmi < 25) return bmiCategories[1];
  if (bmi < 30) return bmiCategories[2];
  if (bmi < 35) return bmiCategories[3];
  if (bmi < 40) return bmiCategories[4];
  return bmiCategories[5];
}

function getIdealWeightRange(heightM: number): { min: number; max: number } {
  return {
    min: 18.5 * heightM * heightM,
    max: 24.9 * heightM * heightM,
  };
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export default function BMICalculator() {
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit] = useState<Unit>("metric");

  // Imperial inputs
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");

  const result = useMemo(() => {
    let heightM: number;
    let weightKg: number;

    if (unit === "metric") {
      const h = parseFloat(heightCm);
      const w = parseFloat(weight);
      if (!h || h <= 0 || !w || w <= 0) return null;
      heightM = h / 100;
      weightKg = w;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const lbs = parseFloat(weightLbs);
      if ((ft <= 0 && inches <= 0) || !lbs || lbs <= 0) return null;
      const totalInches = ft * 12 + inches;
      heightM = totalInches * 0.0254;
      weightKg = lbs * 0.4536;
    }

    const userAge = parseInt(age) || 0;
    const bmi = weightKg / (heightM * heightM);
    const category = getBmiCategory(bmi);
    const idealRange = getIdealWeightRange(heightM);

    // Fərq
    let weightDiff = 0;
    let weightDiffLabel = "";
    if (bmi < 18.5) {
      weightDiff = idealRange.min - weightKg;
      weightDiffLabel = "Normal çəkiyə çatmaq üçün artırın";
    } else if (bmi >= 25) {
      weightDiff = weightKg - idealRange.max;
      weightDiffLabel = "Normal çəkiyə düşmək üçün azaldın";
    }

    // BMR (Bazal metabolizm dərəcəsi) — Mifflin-St Jeor
    let bmr = 0;
    if (userAge > 0) {
      if (gender === "male") {
        bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * userAge + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * userAge - 161;
      }
    }

    // BMI prime (BMI / 25 — 1.0 = üst normal hədd)
    const bmiPrime = bmi / 25;

    return {
      bmi,
      category,
      weightKg,
      heightM,
      heightCm: heightM * 100,
      idealRange,
      weightDiff,
      weightDiffLabel,
      bmr,
      bmiPrime,
      userAge,
    };
  }, [heightCm, weight, age, gender, unit, heightFt, heightIn, weightLbs]);

  // BMI scale marker position (BMI 10–50 range mapped to 0–100%)
  const scalePosition = result ? Math.min(100, Math.max(0, ((result.bmi - 10) / 40) * 100)) : 0;

  return (
    <CalculatorLayout
      title="BMI hesablayıcısı"
      description="Bədən kütlə indeksinizi hesablayın və sağlamlıq kateqoriyanızı öyrənin."
      breadcrumbs={[
        { label: "Sağlamlıq", href: "/?category=health" },
        { label: "BMI hesablayıcısı" },
      ]}
      formulaTitle="BMI necə hesablanır?"
      formulaContent={`BMI = Çəki (kq) ÷ Boy² (m)

Məsələn: 75 kq, 175 sm → BMI = 75 ÷ 1.75² = 75 ÷ 3.0625 = 24.5

Kateqoriyalar (ÜST — Ümumdünya Səhiyyə Təşkilatı):
• < 18.5 — Çəki çatışmazlığı
• 18.5–24.9 — Normal çəki
• 25.0–29.9 — Artıq çəki
• 30.0–34.9 — I dərəcə piylənmə
• 35.0–39.9 — II dərəcə piylənmə
• ≥ 40.0 — III dərəcə piylənmə

Qeyd: BMI əzələ kütləsini, yaşı və cinsi nəzərə almır.
Buna görə idmançılar və yaşlı insanlarda nəticə fərqli ola bilər.`}
      relatedIds={["bmr", "ideal-weight", "water-intake", "pregnancy"]}
    >
      {/* Unit Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setUnit("metric")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            unit === "metric"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          Metrik (kq, sm)
        </button>
        <button
          onClick={() => setUnit("imperial")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            unit === "imperial"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          İmperial (lbs, ft)
        </button>
      </div>

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

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {unit === "metric" ? (
          <>
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
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">📏 Boy</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    min="1"
                    max="8"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  />
                  <p className="text-xs text-muted mt-1 text-center">fut</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="9"
                    min="0"
                    max="11"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  />
                  <p className="text-xs text-muted mt-1 text-center">düym</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">⚖️ Çəki (lbs)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                placeholder="165"
                min="50"
                max="600"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🎂 Yaş <span className="text-muted font-normal">— ixtiyari</span>
          </label>
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
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* BMI Result Card */}
          <div className={`${result.category.bgColor} rounded-2xl border ${result.category.borderColor} p-6 text-center`}>
            <p className="text-sm text-muted mb-2">Sizin BMI göstəriciniz</p>
            <p className={`text-5xl font-bold ${result.category.color}`}>{fmt(result.bmi)}</p>
            <div className="mt-3 inline-flex items-center gap-2">
              <span className="text-lg">{result.category.emoji}</span>
              <span className={`text-lg font-semibold ${result.category.color}`}>{result.category.label}</span>
            </div>
            <p className="text-sm text-muted mt-2">{result.category.description}</p>
          </div>

          {/* BMI Scale */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">BMI şkalası</p>
            <div className="relative">
              <div className="w-full h-5 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400" style={{ width: "21.25%" }} title="Çəki çatışmazlığı" />
                <div className="h-full bg-green-400" style={{ width: "16%" }} title="Normal" />
                <div className="h-full bg-amber-400" style={{ width: "12.5%" }} title="Artıq çəki" />
                <div className="h-full bg-orange-400" style={{ width: "12.5%" }} title="I dərəcə" />
                <div className="h-full bg-red-400" style={{ width: "12.5%" }} title="II dərəcə" />
                <div className="h-full bg-red-700" style={{ width: "25.25%" }} title="III dərəcə" />
              </div>
              {/* Marker */}
              <div
                className="absolute -top-1 transition-all duration-500"
                style={{ left: `calc(${scalePosition}% - 4px)` }}
              >
                <div className="w-2 h-7 bg-foreground rounded-full shadow-md" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>10</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
              <span>50</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">İdeal çəki aralığı</p>
              <p className="text-lg font-bold text-foreground">
                {fmt(result.idealRange.min)} – {fmt(result.idealRange.max)}
              </p>
              <p className="text-xs text-muted mt-1">kq</p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">BMI Prime</p>
              <p className="text-lg font-bold text-foreground">{result.bmiPrime.toFixed(2)}</p>
              <p className="text-xs text-muted mt-1">{result.bmiPrime <= 1 ? "Normal" : "Normaldan yuxarı"}</p>
            </div>

            {result.bmr > 0 && (
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <p className="text-xs text-muted mb-1">Bazal metabolizm (BMR)</p>
                <p className="text-lg font-bold text-foreground">{Math.round(result.bmr)}</p>
                <p className="text-xs text-muted mt-1">kkal / gün</p>
              </div>
            )}
          </div>

          {/* Weight Difference */}
          {result.weightDiff > 0 && (
            <div className={`${result.bmi < 18.5 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"} rounded-xl border p-4`}>
              <p className={`text-sm font-medium ${result.bmi < 18.5 ? "text-blue-700" : "text-amber-700"} flex items-center gap-2`}>
                <span>{result.bmi < 18.5 ? "📈" : "📉"}</span>
                {result.weightDiffLabel}: <span className="font-bold">{fmt(result.weightDiff)} kq</span>
              </p>
            </div>
          )}

          {/* All Categories Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                BMI kateqoriyaları (ÜST)
              </h3>
            </div>
            <div className="divide-y divide-border">
              {bmiCategories.map((cat) => {
                const isActive = cat.label === result.category.label;
                return (
                  <div key={cat.label} className={`flex items-center justify-between px-5 py-3 ${isActive ? cat.bgColor : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className={`text-sm ${isActive ? "font-semibold" : ""} ${cat.color}`}>{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted">{cat.range}</span>
                      {isActive && (
                        <span className="text-xs bg-foreground text-white px-2 py-0.5 rounded-full">Siz</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weight table for this height */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📏</span>
                {fmt(result.heightCm)} sm boy üçün çəki cədvəli
              </h3>
            </div>
            <div className="divide-y divide-border">
              {bmiCategories.slice(0, 4).map((cat, i) => {
                const bmiLow = [0, 18.5, 25, 30][i];
                const bmiHigh = [18.5, 25, 30, 35][i];
                const wLow = bmiLow > 0 ? bmiLow * result.heightM * result.heightM : 0;
                const wHigh = bmiHigh * result.heightM * result.heightM;
                const isActive = cat.label === result.category.label;
                return (
                  <div key={cat.label} className={`flex items-center justify-between px-5 py-3 ${isActive ? cat.bgColor : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className={`text-sm ${cat.color}`}>{cat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {bmiLow > 0 ? `${fmt(wLow)}` : "< " + fmt(wHigh)} {bmiLow > 0 ? `– ${fmt(wHigh)}` : ""} kq
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Calorie Needs */}
          {result.bmr > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>🔥</span>
                  Gündəlik kalori ehtiyacı (BMR əsasında)
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "Oturaq həyat tərzi", factor: 1.2, desc: "Az və ya heç hərəkət yox" },
                  { label: "Yüngül aktivlik", factor: 1.375, desc: "Həftədə 1–3 gün idman" },
                  { label: "Orta aktivlik", factor: 1.55, desc: "Həftədə 3–5 gün idman" },
                  { label: "Yüksək aktivlik", factor: 1.725, desc: "Həftədə 6–7 gün idman" },
                  { label: "Çox yüksək aktivlik", factor: 1.9, desc: "Gündə 2 dəfə idman / ağır fiziki iş" },
                ].map((level) => (
                  <div key={level.factor} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{level.label}</p>
                      <p className="text-xs text-muted">{level.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{Math.round(result.bmr * level.factor)} kkal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> BMI ümumi göstəricidir və əzələ kütləsi, sümük quruluşu,
              yaş və cins kimi fərdi amilləri nəzərə almır. İdmançılar və hamilə qadınlarda nəticə dəqiq olmaya bilər.
              Sağlamlıq qərarları üçün həkimə müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⚖️</span>
          <p>Nəticəni görmək üçün boy və çəkinizi daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
