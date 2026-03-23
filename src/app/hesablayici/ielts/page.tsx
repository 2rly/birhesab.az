"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const bandScores = [
  "1.0", "1.5", "2.0", "2.5", "3.0", "3.5",
  "4.0", "4.5", "5.0", "5.5", "6.0", "6.5",
  "7.0", "7.5", "8.0", "8.5", "9.0",
];

const sections = [
  { id: "listening", label: "Listening", icon: "🎧" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "writing", label: "Writing", icon: "✍️" },
  { id: "speaking", label: "Speaking", icon: "🗣️" },
] as const;

function roundIELTS(avg: number): number {
  const floor = Math.floor(avg);
  const decimal = avg - floor;

  if (decimal < 0.25) return floor;
  if (decimal < 0.75) return floor + 0.5;
  return floor + 1;
}

function getInterpretation(score: number): { level: string; description: string; color: string } {
  if (score >= 8.5) return { level: "Ekspert", description: "Dili tam sərbəst və dəqiq istifadə edirsiniz.", color: "text-green-700 bg-green-50 border-green-200" };
  if (score >= 7.5) return { level: "Çox yaxşı", description: "Dili yaxşı bilirsiniz, bəzi dəqiq olmayan ifadələr ola bilər.", color: "text-green-600 bg-green-50 border-green-200" };
  if (score >= 6.5) return { level: "Yaxşı", description: "Dili ümumiyyətlə effektiv istifadə edirsiniz.", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (score >= 5.5) return { level: "Orta", description: "Mürəkkəb dildə çətinliklər olsa da, ümumi mənanı başa düşürsünüz.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  if (score >= 4.5) return { level: "Məhdud", description: "Tanış situasiyalarda əsas bacarıqlar göstərirsiniz.", color: "text-orange-700 bg-orange-50 border-orange-200" };
  return { level: "Zəif", description: "Dil bilikləri çox məhduddur.", color: "text-red-700 bg-red-50 border-red-200" };
}

export default function IELTSCalculator() {
  const [scores, setScores] = useState({
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });

  const updateScore = (section: string, value: string) => {
    setScores((prev) => ({ ...prev, [section]: value }));
  };

  const result = useMemo(() => {
    const values = Object.values(scores);
    if (values.some((v) => !v)) return null;

    const nums = values.map(Number);
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / 4;
    const overall = roundIELTS(avg);

    return {
      overall,
      avg: avg.toFixed(4),
      interpretation: getInterpretation(overall),
    };
  }, [scores]);

  return (
    <CalculatorLayout
      title="IELTS Overall Band Score Hesablayıcısı"
      description="Listening, Reading, Writing və Speaking ballarınızı daxil edin — ümumi IELTS band balınızı ani hesablayın."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "IELTS hesablayıcısı" },
      ]}
      formulaTitle="IELTS Overall Band Score necə hesablanır?"
      formulaContent={`Overall Band Score = (Listening + Reading + Writing + Speaking) ÷ 4

Nəticə ən yaxın 0.5 və ya tam ədədə yuvarlaqlaşdırılır:
• Ortalama .25-dən azdırsa → aşağı yuvarlaqlaşdırılır
• Ortalama .25 ilə .75 arasındadırsa → .5-ə yuvarlaqlaşdırılır
• Ortalama .75 və ya daha çoxdursa → yuxarı yuvarlaqlaşdırılır

Məsələn: (6.5 + 6.0 + 5.5 + 6.0) ÷ 4 = 6.0 → Overall: 6.0
Məsələn: (7.0 + 6.5 + 6.0 + 6.5) ÷ 4 = 6.5 → Overall: 6.5
Məsələn: (7.0 + 7.0 + 6.5 + 7.0) ÷ 4 = 6.875 → Overall: 7.0`}
      relatedIds={["toefl", "sat", "gpa", "university-admission", "foreign-university"]}
    >
      {/* Input Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {sections.map((section) => (
          <div key={section.id}>
            <label className="block text-sm font-medium text-foreground mb-2">
              <span className="mr-1.5">{section.icon}</span>
              {section.label}
            </label>
            <select
              value={scores[section.id]}
              onChange={(e) => updateScore(section.id, e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
            >
              <option value="">Band seçin</option>
              {bandScores.map((score) => (
                <option key={score} value={score}>
                  {score}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Result Section */}
      {result ? (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
            <p className="text-sm font-medium text-blue-200 mb-1">Overall Band Score</p>
            <p className="text-6xl font-bold mb-2">{result.overall.toFixed(1)}</p>
            <p className="text-sm text-blue-200">Dəqiq ortalama: {result.avg}</p>
          </div>

          {/* Interpretation */}
          <div className={`rounded-xl border p-5 ${result.interpretation.color}`}>
            <p className="font-semibold text-lg mb-1">Səviyyə: {result.interpretation.level}</p>
            <p className="text-sm">{result.interpretation.description}</p>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">Bal icmalı</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {sections.map((section) => (
                <div key={section.id} className="text-center">
                  <p className="text-2xl mb-1">{section.icon}</p>
                  <p className="text-xs text-muted mb-1">{section.label}</p>
                  <p className="text-xl font-bold text-foreground">{scores[section.id]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Requirements */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-3">📌 Tələb olunan minimum ballar</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700">
              <div className="flex justify-between">
                <span>UK universitetləri (bakalavr)</span>
                <span className="font-semibold">6.0 – 6.5</span>
              </div>
              <div className="flex justify-between">
                <span>UK universitetləri (magistr)</span>
                <span className="font-semibold">6.5 – 7.0</span>
              </div>
              <div className="flex justify-between">
                <span>Kanada immiqrasiyası</span>
                <span className="font-semibold">6.0 – 7.0</span>
              </div>
              <div className="flex justify-between">
                <span>Avstraliya immiqrasiyası</span>
                <span className="font-semibold">7.0 – 8.0</span>
              </div>
              <div className="flex justify-between">
                <span>ABŞ universitetləri</span>
                <span className="font-semibold">6.5 – 7.5</span>
              </div>
              <div className="flex justify-between">
                <span>Almanya universitetləri</span>
                <span className="font-semibold">6.0 – 7.0</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📝</span>
          <p>Nəticəni görmək üçün bütün bölmələrin ballarını seçin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
