"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type CountryId = "usa" | "uk" | "germany" | "turkey" | "russia";
type ExamType = "ielts" | "toefl";

interface Country {
  id: CountryId;
  name: string;
  icon: string;
  minGPA: number;
  goodGPA: number;
  minIELTS: number;
  goodIELTS: number;
  minTOEFL: number;
  goodTOEFL: number;
  notes: string;
  tuitionRange: string;
}

const countries: Country[] = [
  {
    id: "usa",
    name: "ABŞ",
    icon: "🇺🇸",
    minGPA: 3.0,
    goodGPA: 3.5,
    minIELTS: 6.5,
    goodIELTS: 7.5,
    minTOEFL: 80,
    goodTOEFL: 100,
    notes: "SAT/GRE tələb oluna bilər. Təqaüd imkanları geniş.",
    tuitionRange: "$20,000 – $60,000/il",
  },
  {
    id: "uk",
    name: "Böyük Britaniya",
    icon: "🇬🇧",
    minGPA: 2.8,
    goodGPA: 3.3,
    minIELTS: 6.0,
    goodIELTS: 7.0,
    minTOEFL: 75,
    goodTOEFL: 95,
    notes: "Bakalavr 3 il, magistr 1 il. Chevening təqaüdü mövcuddur.",
    tuitionRange: "£12,000 – £40,000/il",
  },
  {
    id: "germany",
    name: "Almaniya",
    icon: "🇩🇪",
    minGPA: 2.5,
    goodGPA: 3.0,
    minIELTS: 6.0,
    goodIELTS: 6.5,
    minTOEFL: 75,
    goodTOEFL: 90,
    notes: "Dövlət universitetlərində təhsil haqqı azdır. Alman dili bilmək üstünlükdür.",
    tuitionRange: "€0 – €3,000/il (dövlət)",
  },
  {
    id: "turkey",
    name: "Türkiyə",
    icon: "🇹🇷",
    minGPA: 2.5,
    goodGPA: 3.0,
    minIELTS: 5.5,
    goodIELTS: 6.5,
    minTOEFL: 65,
    goodTOEFL: 80,
    notes: "Türkiyə Bursları proqramı tam təqaüd verir. YÖS imtahanı tələb oluna bilər.",
    tuitionRange: "₺5,000 – ₺80,000/il",
  },
  {
    id: "russia",
    name: "Rusiya",
    icon: "🇷🇺",
    minGPA: 2.3,
    goodGPA: 3.0,
    minIELTS: 5.0,
    goodIELTS: 6.0,
    minTOEFL: 60,
    goodTOEFL: 75,
    notes: "Rus dili bilmək böyük üstünlükdür. Dövlət kvotaları mövcuddur.",
    tuitionRange: "₽100,000 – ₽500,000/il",
  },
];

function calculateChance(gpa: number, examScore: number, examType: ExamType, country: Country): number {
  let gpaScore = 0;
  const gpaRange = country.goodGPA - country.minGPA;
  if (gpa >= country.goodGPA) gpaScore = 50;
  else if (gpa >= country.minGPA) gpaScore = 20 + ((gpa - country.minGPA) / gpaRange) * 30;
  else if (gpa >= country.minGPA - 0.5) gpaScore = 5 + ((gpa - (country.minGPA - 0.5)) / 0.5) * 15;
  else gpaScore = Math.max(0, gpa * 2);

  let examScoreVal = 0;
  const minExam = examType === "ielts" ? country.minIELTS : country.minTOEFL;
  const goodExam = examType === "ielts" ? country.goodIELTS : country.goodTOEFL;
  const examRange = goodExam - minExam;

  if (examScore >= goodExam) examScoreVal = 50;
  else if (examScore >= minExam) examScoreVal = 20 + ((examScore - minExam) / examRange) * 30;
  else if (examScore >= minExam * 0.85) examScoreVal = 5 + ((examScore - minExam * 0.85) / (minExam * 0.15)) * 15;
  else examScoreVal = Math.max(0, (examScore / minExam) * 5);

  return Math.min(98, Math.max(2, Math.round(gpaScore + examScoreVal)));
}

function getChanceLevel(chance: number): { label: string; color: string } {
  if (chance >= 75) return { label: "Yüksək", color: "text-green-700 bg-green-50 border-green-200" };
  if (chance >= 50) return { label: "Orta-yaxşı", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (chance >= 30) return { label: "Orta", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  if (chance >= 15) return { label: "Aşağı", color: "text-orange-700 bg-orange-50 border-orange-200" };
  return { label: "Çox aşağı", color: "text-red-700 bg-red-50 border-red-200" };
}

export default function XaricdeTehsilCalculator() {
  const [gpa, setGpa] = useState("");
  const [examType, setExamType] = useState<ExamType>("ielts");
  const [examScore, setExamScore] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryId>("usa");

  const result = useMemo(() => {
    const g = parseFloat(gpa);
    const e = parseFloat(examScore);
    if (!g || g < 0 || g > 4.0) return null;
    if (!e) return null;
    if (examType === "ielts" && (e < 0 || e > 9)) return null;
    if (examType === "toefl" && (e < 0 || e > 120)) return null;

    const country = countries.find((c) => c.id === selectedCountry)!;
    const chance = calculateChance(g, e, examType, country);
    const chanceLevel = getChanceLevel(chance);

    // Calculate for all countries
    const allCountries = countries.map((c) => ({
      ...c,
      chance: calculateChance(g, e, examType, c),
    })).sort((a, b) => b.chance - a.chance);

    return { chance, chanceLevel, country, allCountries, gpa: g, examScore: e };
  }, [gpa, examScore, examType, selectedCountry]);

  return (
    <CalculatorLayout
      title="Xaricdə Təhsil Şansı Hesablayıcısı"
      description="GPA və IELTS/TOEFL balınızı daxil edin, ölkə seçin — xaricdə universitetə qəbul şansınızı təxmin edin."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "Xaricdə təhsil şansı" },
      ]}
      formulaTitle="Qəbul şansı necə hesablanır?"
      formulaContent={`Qəbul şansı GPA və dil imtahanı balına əsasən təxmin edilir.

Əsas faktorlar:
• GPA (4.0 şkalası) — akademik performans (50% çəki)
• IELTS/TOEFL balı — dil bilikləri (50% çəki)

Hər ölkənin minimum və yaxşı bal tələbləri fərqlidir.
Balınız minimum tələbdən yuxarı olduqca şans artır.

Qeyd: Bu təxmini hesablamadır. Real qəbul prosesində tövsiyə
məktubları, motivasiya məktubu, iş təcrübəsi, portfolyo və digər
amillər də nəzərə alınır.`}
      relatedIds={["gpa", "ielts", "toefl", "university-admission"]}
    >
      {/* Country Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Ölkə seçin</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {countries.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCountry(c.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedCountry === c.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{c.icon}</span>
              <p className="text-xs font-medium text-foreground">{c.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Exam Type Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => { setExamType("ielts"); setExamScore(""); }}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            examType === "ielts"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          IELTS (0–9)
        </button>
        <button
          onClick={() => { setExamType("toefl"); setExamScore(""); }}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            examType === "toefl"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          TOEFL (0–120)
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📐 GPA (0.0–4.0)
          </label>
          <input
            type="number"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="3.50"
            min="0"
            max="4.0"
            step="0.01"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📝 {examType === "ielts" ? "IELTS balı (0–9)" : "TOEFL balı (0–120)"}
          </label>
          <input
            type="number"
            value={examScore}
            onChange={(e) => setExamScore(e.target.value)}
            placeholder={examType === "ielts" ? "6.5" : "85"}
            min="0"
            max={examType === "ielts" ? "9" : "120"}
            step={examType === "ielts" ? "0.5" : "1"}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Result */}
      {result ? (
        <div className="space-y-4">
          {/* Chance Result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
            <p className="text-sm font-medium text-blue-200 mb-1">
              {result.country.icon} {result.country.name} — qəbul şansınız
            </p>
            <p className="text-6xl font-bold mb-2">{result.chance}%</p>
            <p className="text-sm text-blue-200">Təxmini ehtimal</p>
          </div>

          {/* Chance Level */}
          <div className={`rounded-xl border p-5 ${result.chanceLevel.color}`}>
            <p className="font-semibold text-lg mb-1">Səviyyə: {result.chanceLevel.label}</p>
            <p className="text-sm">{result.country.notes}</p>
          </div>

          {/* Country Requirements */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">
              {result.country.icon} {result.country.name} — tələblər
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">GPA tələbi</p>
                <p className="text-sm">
                  Minimum: <span className="font-semibold">{result.country.minGPA}</span>
                  {" · "}
                  Yaxşı: <span className="font-semibold">{result.country.goodGPA}+</span>
                </p>
                <p className="text-xs mt-1">
                  Sizin: <span className={`font-bold ${result.gpa >= result.country.goodGPA ? "text-green-600" : result.gpa >= result.country.minGPA ? "text-blue-600" : "text-red-600"}`}>{result.gpa.toFixed(2)}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{examType.toUpperCase()} tələbi</p>
                <p className="text-sm">
                  Minimum: <span className="font-semibold">{examType === "ielts" ? result.country.minIELTS : result.country.minTOEFL}</span>
                  {" · "}
                  Yaxşı: <span className="font-semibold">{examType === "ielts" ? result.country.goodIELTS : result.country.goodTOEFL}+</span>
                </p>
                <p className="text-xs mt-1">
                  Sizin: <span className={`font-bold ${
                    result.examScore >= (examType === "ielts" ? result.country.goodIELTS : result.country.goodTOEFL) ? "text-green-600" :
                    result.examScore >= (examType === "ielts" ? result.country.minIELTS : result.country.minTOEFL) ? "text-blue-600" : "text-red-600"
                  }`}>{result.examScore}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-muted">Təhsil haqqı: <span className="font-medium text-foreground">{result.country.tuitionRange}</span></p>
            </div>
          </div>

          {/* All Countries Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🌍</span>
                Bütün ölkələr üzrə müqayisə
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.allCountries.map((c) => {
                const level = getChanceLevel(c.chance);
                const isActive = c.id === selectedCountry;
                return (
                  <div key={c.id} className={`px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{c.icon}</span>
                        <span className={`text-sm ${isActive ? "font-semibold" : ""} text-foreground`}>{c.name}</span>
                        {isActive && <span className="text-xs bg-foreground text-white px-1.5 py-0.5 rounded-full">Seçilmiş</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${level.color.split(" ")[0]}`}>{c.chance}%</span>
                        <span className={`text-xs ${level.color.split(" ")[0]}`}>({level.label})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 transition-all ${
                          c.chance >= 75 ? "bg-green-500" :
                          c.chance >= 50 ? "bg-blue-500" :
                          c.chance >= 30 ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${c.chance}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Bu təxmini hesablamadır. Hər universitetin öz tələbləri var.
              Real qəbul prosesində GPA və dil balından əlavə, tövsiyə məktubları, motivasiya məktubu,
              iş təcrübəsi, portfolyo, müsahibə və digər amillər nəzərə alınır. Dəqiq tələblər üçün
              hədəf universitetin rəsmi saytına müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🌍</span>
          <p>Nəticəni görmək üçün GPA və dil imtahanı balını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
