"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type Gender = "male" | "female";
type BodyFrame = "small" | "medium" | "large";

interface FormulaResult {
  name: string;
  min: number;
  max: number;
  description: string;
}

// Düsturlar
function calculateDevine(heightCm: number, gender: Gender): { min: number; max: number } {
  const heightInch = heightCm / 2.54;
  const over60 = Math.max(0, heightInch - 60);
  if (gender === "male") {
    const ideal = 50 + 2.3 * over60;
    return { min: ideal * 0.9, max: ideal * 1.1 };
  }
  const ideal = 45.5 + 2.3 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateRobinson(heightCm: number, gender: Gender): { min: number; max: number } {
  const heightInch = heightCm / 2.54;
  const over60 = Math.max(0, heightInch - 60);
  if (gender === "male") {
    const ideal = 52 + 1.9 * over60;
    return { min: ideal * 0.9, max: ideal * 1.1 };
  }
  const ideal = 49 + 1.7 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateMiller(heightCm: number, gender: Gender): { min: number; max: number } {
  const heightInch = heightCm / 2.54;
  const over60 = Math.max(0, heightInch - 60);
  if (gender === "male") {
    const ideal = 56.2 + 1.41 * over60;
    return { min: ideal * 0.9, max: ideal * 1.1 };
  }
  const ideal = 53.1 + 1.36 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateHamwi(heightCm: number, gender: Gender): { min: number; max: number } {
  const heightInch = heightCm / 2.54;
  const over60 = Math.max(0, heightInch - 60);
  if (gender === "male") {
    const ideal = 48 + 2.7 * over60;
    return { min: ideal * 0.9, max: ideal * 1.1 };
  }
  const ideal = 45.5 + 2.2 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateBMI(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  return {
    min: 18.5 * heightM * heightM,
    max: 24.9 * heightM * heightM,
  };
}

// Bədən quruluşuna görə düzəliş
function adjustForFrame(weight: number, frame: BodyFrame): number {
  if (frame === "small") return weight * 0.9;
  if (frame === "large") return weight * 1.1;
  return weight;
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export default function IdealWeightCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [age, setAge] = useState("");
  const [bodyFrame, setBodyFrame] = useState<BodyFrame>("medium");

  const result = useMemo(() => {
    const h = parseFloat(heightCm);
    if (!h || h < 100 || h > 250) return null;

    const currentW = parseFloat(currentWeight) || 0;
    const userAge = parseInt(age) || 0;

    const formulas: FormulaResult[] = [
      { name: "BMI əsaslı (ÜST)", ...calculateBMI(h), description: "BMI 18.5–24.9 aralığı" },
      { name: "Devine düsturu", ...calculateDevine(h, gender), description: "1974, klinik istifadə" },
      { name: "Robinson düsturu", ...calculateRobinson(h, gender), description: "1983, yenilənmiş" },
      { name: "Miller düsturu", ...calculateMiller(h, gender), description: "1983, alternativ" },
      { name: "Hamwi düsturu", ...calculateHamwi(h, gender), description: "1964, klassik" },
    ];

    // Bədən quruluşuna görə düzəliş
    const adjustedFormulas = formulas.map((f) => ({
      ...f,
      min: adjustForFrame(f.min, bodyFrame),
      max: adjustForFrame(f.max, bodyFrame),
    }));

    // Orta dəyər (bütün düsturların ortası)
    const avgMin = adjustedFormulas.reduce((s, f) => s + f.min, 0) / adjustedFormulas.length;
    const avgMax = adjustedFormulas.reduce((s, f) => s + f.max, 0) / adjustedFormulas.length;
    const idealAvg = (avgMin + avgMax) / 2;

    // Fərq
    let weightDiff = 0;
    let diffLabel = "";
    if (currentW > 0) {
      if (currentW < avgMin) {
        weightDiff = avgMin - currentW;
        diffLabel = "İdeal çəkiyə çatmaq üçün artırın";
      } else if (currentW > avgMax) {
        weightDiff = currentW - avgMax;
        diffLabel = "İdeal çəkiyə düşmək üçün azaldın";
      }
    }

    // BMI (əgər çəki daxil edilibsə)
    const heightM = h / 100;
    const currentBmi = currentW > 0 ? currentW / (heightM * heightM) : 0;
    const idealBmi = idealAvg / (heightM * heightM);

    return {
      formulas: adjustedFormulas,
      avgMin,
      avgMax,
      idealAvg,
      currentWeight: currentW,
      weightDiff,
      diffLabel,
      currentBmi,
      idealBmi,
      heightCm: h,
      userAge,
    };
  }, [gender, heightCm, currentWeight, age, bodyFrame]);

  return (
    <CalculatorLayout
      title="İdeal çəki hesablayıcısı"
      description="Boy, cins və yaşınıza görə ideal çəkinizi 5 fərqli düsturla hesablayın."
      breadcrumbs={[
        { label: "Sağlamlıq", href: "/?category=health" },
        { label: "İdeal çəki hesablayıcısı" },
      ]}
      formulaTitle="İdeal çəki necə hesablanır?"
      formulaContent={`5 fərqli düstur istifadə olunur:

1. BMI əsaslı (ÜST): BMI 18.5–24.9 aralığındakı çəki
   Çəki = BMI × Boy²(m)

2. Devine (1974): Kişi: 50 + 2.3 × (boy(düym) − 60)
   Qadın: 45.5 + 2.3 × (boy(düym) − 60)

3. Robinson (1983): Kişi: 52 + 1.9 × (boy(düym) − 60)
   Qadın: 49 + 1.7 × (boy(düym) − 60)

4. Miller (1983): Kişi: 56.2 + 1.41 × (boy(düym) − 60)
   Qadın: 53.1 + 1.36 × (boy(düym) − 60)

5. Hamwi (1964): Kişi: 48 + 2.7 × (boy(düym) − 60)
   Qadın: 45.5 + 2.2 × (boy(düym) − 60)

Bədən quruluşuna görə düzəliş: Kiçik −10%, Orta 0%, İri +10%

Nəticə bütün düsturların ortalamasıdır.`}
      relatedIds={["bmi", "bmr", "water-intake", "pregnancy"]}
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

      {/* Body Frame */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Bədən quruluşu</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "small" as BodyFrame, label: "Kiçik", icon: "🦴", desc: "Nazik sümüklər, dar çiyinlər" },
            { id: "medium" as BodyFrame, label: "Orta", icon: "🧍", desc: "Standart quruluş" },
            { id: "large" as BodyFrame, label: "İri", icon: "💪", desc: "Geniş sümüklər, enli çiyinlər" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setBodyFrame(f.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                bodyFrame === f.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{f.icon}</span>
              <p className="text-xs font-medium text-foreground">{f.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">📏 Boy (sm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="175"
            min="100"
            max="250"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            ⚖️ Hazırkı çəki (kq) <span className="text-muted font-normal">— ixtiyari</span>
          </label>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="75"
            min="20"
            max="300"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
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
          {/* Main Result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">İdeal çəki aralığınız</p>
            <p className="text-4xl font-bold">
              {fmt(result.avgMin)} — {fmt(result.avgMax)}
            </p>
            <p className="text-sm text-blue-200 mt-1">kq (ortalama: {fmt(result.idealAvg)} kq)</p>
          </div>

          {/* Current vs Ideal */}
          {result.currentWeight > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <p className="text-xs text-muted mb-1">Hazırkı çəki</p>
                <p className="text-2xl font-bold text-foreground">{fmt(result.currentWeight)} kq</p>
                <p className="text-xs text-muted mt-1">BMI: {result.currentBmi.toFixed(1)}</p>
              </div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
                <p className="text-xs text-green-600 mb-1">İdeal çəki</p>
                <p className="text-2xl font-bold text-green-700">{fmt(result.idealAvg)} kq</p>
                <p className="text-xs text-green-600 mt-1">BMI: {result.idealBmi.toFixed(1)}</p>
              </div>
              <div className={`rounded-xl border p-5 text-center ${
                result.weightDiff === 0
                  ? "bg-green-50 border-green-200"
                  : result.currentWeight < result.avgMin
                  ? "bg-blue-50 border-blue-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <p className="text-xs text-muted mb-1">Fərq</p>
                {result.weightDiff > 0 ? (
                  <>
                    <p className={`text-2xl font-bold ${result.currentWeight < result.avgMin ? "text-blue-700" : "text-amber-700"}`}>
                      {result.currentWeight < result.avgMin ? "+" : "−"}{fmt(result.weightDiff)} kq
                    </p>
                    <p className="text-xs text-muted mt-1">{result.diffLabel}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-700">Normal!</p>
                    <p className="text-xs text-green-600 mt-1">Çəkiniz ideal aralıqdadır</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Visual Scale */}
          {result.currentWeight > 0 && (
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-muted mb-3 font-medium">Çəki şkalası</p>
              {(() => {
                const scaleMin = Math.min(result.avgMin - 10, result.currentWeight - 5);
                const scaleMax = Math.max(result.avgMax + 10, result.currentWeight + 5);
                const range = scaleMax - scaleMin;
                const idealStartPct = ((result.avgMin - scaleMin) / range) * 100;
                const idealWidthPct = ((result.avgMax - result.avgMin) / range) * 100;
                const currentPct = ((result.currentWeight - scaleMin) / range) * 100;

                return (
                  <div className="relative">
                    <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden relative">
                      <div
                        className="absolute h-full bg-green-300 rounded-full"
                        style={{ left: `${idealStartPct}%`, width: `${idealWidthPct}%` }}
                      />
                    </div>
                    <div
                      className="absolute -top-1 transition-all"
                      style={{ left: `calc(${currentPct}% - 4px)` }}
                    >
                      <div className="w-2 h-7 bg-foreground rounded-full shadow-md" />
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-3">
                      <span>{fmt(scaleMin)} kq</span>
                      <span className="text-green-600 font-medium">{fmt(result.avgMin)}–{fmt(result.avgMax)} kq (ideal)</span>
                      <span>{fmt(scaleMax)} kq</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Formula Comparison Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Düsturlar üzrə müqayisə
                {bodyFrame !== "medium" && (
                  <span className="text-xs text-muted font-normal">({bodyFrame === "small" ? "kiçik −10%" : "iri +10%"} düzəlişi ilə)</span>
                )}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.formulas.map((f) => {
                const avg = (f.min + f.max) / 2;
                const isInRange = result.currentWeight >= f.min && result.currentWeight <= f.max;
                return (
                  <div key={f.name} className={`flex items-center justify-between px-5 py-3 ${result.currentWeight > 0 && isInRange ? "bg-green-50" : ""}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted">{f.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{fmt(f.min)} – {fmt(f.max)} kq</p>
                      <p className="text-xs text-muted">orta: {fmt(avg)} kq</p>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">Ümumi ortalama</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.avgMin)} – {fmt(result.avgMax)} kq</span>
              </div>
            </div>
          </div>

          {/* Height-Weight Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📏</span>
                Boy-Çəki cədvəli ({gender === "male" ? "Kişi" : "Qadın"})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[150, 155, 160, 165, 170, 175, 180, 185, 190].map((h) => {
                const bmiRange = calculateBMI(h);
                const isActive = Math.abs(h - result.heightCm) < 3;
                return (
                  <div key={h} className={`flex items-center justify-between px-5 py-2.5 ${isActive ? "bg-primary-light" : ""}`}>
                    <span className={`text-sm ${isActive ? "font-semibold" : ""} text-foreground`}>{h} sm</span>
                    <span className="text-sm font-medium text-foreground">
                      {fmt(adjustForFrame(bmiRange.min, bodyFrame))} – {fmt(adjustForFrame(bmiRange.max, bodyFrame))} kq
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> İdeal çəki düsturları ümumi göstəricilərdir.
              Əzələ kütləsi, sümük quruluşu, etnik mənsubiyyət və fərdi fizioloji xüsusiyyətlər nəzərə alınmır.
              İdmançılar üçün çəki daha yüksək ola bilər. Sağlamlıq qərarları üçün həkimə müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏃</span>
          <p>Nəticəni görmək üçün boyunuzu daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
