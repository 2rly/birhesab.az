"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const sections = [
  { id: "reading", label: "Reading", icon: "📖", max: 30 },
  { id: "listening", label: "Listening", icon: "🎧", max: 30 },
  { id: "speaking", label: "Speaking", icon: "🗣️", max: 30 },
  { id: "writing", label: "Writing", icon: "✍️", max: 30 },
] as const;

function getScoreLevel(total: number): { level: string; description: string; color: string } {
  if (total >= 110) return { level: "Outstanding", description: "Mükəmməl səviyyə — ən yaxşı universitetlərə uyğundur.", color: "text-green-700 bg-green-50 border-green-200" };
  if (total >= 94) return { level: "Excellent", description: "Əla səviyyə — əksər universitetlərin tələblərinə cavab verir.", color: "text-green-600 bg-green-50 border-green-200" };
  if (total >= 79) return { level: "Good", description: "Yaxşı səviyyə — bir çox proqramlar üçün kifayət edir.", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (total >= 60) return { level: "Average", description: "Orta səviyyə — bəzi proqramlar üçün yetərli ola bilər.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  return { level: "Below Average", description: "Orta səviyyədən aşağı — daha çox hazırlıq lazımdır.", color: "text-red-700 bg-red-50 border-red-200" };
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

export default function TOEFLCalculator() {
  const [scores, setScores] = useState({
    reading: "",
    listening: "",
    speaking: "",
    writing: "",
  });

  const updateScore = (section: string, value: string) => {
    setScores((prev) => ({ ...prev, [section]: value }));
  };

  const result = useMemo(() => {
    const values = Object.values(scores);
    if (values.some((v) => !v)) return null;

    const nums = values.map(Number);
    if (nums.some((n) => isNaN(n) || n < 0 || n > 30)) return null;

    const total = nums.reduce((a, b) => a + b, 0);
    const level = getScoreLevel(total);

    return { total, level, scores: nums };
  }, [scores]);

  return (
    <CalculatorLayout
      title="TOEFL Bal Hesablayıcısı"
      description="Reading, Listening, Speaking və Writing ballarınızı daxil edin — ümumi TOEFL balınızı və səviyyənizi hesablayın."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "TOEFL hesablayıcısı" },
      ]}
      formulaTitle="TOEFL balı necə hesablanır?"
      formulaContent={`TOEFL iBT Total Score = Reading + Listening + Speaking + Writing

Hər bölmə 0–30 bal arasındadır.
Ümumi bal: 0–120

Səviyyələr:
• 110–120 — Outstanding (Mükəmməl)
• 94–109 — Excellent (Əla)
• 79–93 — Good (Yaxşı)
• 60–78 — Average (Orta)
• 0–59 — Below Average (Orta altı)

Məsələn: Reading 28 + Listening 26 + Speaking 24 + Writing 27 = 105 (Excellent)`}
      relatedIds={["ielts", "sat", "gpa", "university-admission"]}
    >
      {/* Input Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {sections.map((section) => (
          <div key={section.id}>
            <label className="block text-sm font-medium text-foreground mb-2">
              <span className="mr-1.5">{section.icon}</span>
              {section.label} (0–30)
            </label>
            <input
              type="number"
              value={scores[section.id]}
              onChange={(e) => updateScore(section.id, e.target.value)}
              placeholder="0"
              min="0"
              max="30"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        ))}
      </div>

      {/* Result Section */}
      {result ? (
        <div className="space-y-4">
          {/* Total Score */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
            <p className="text-sm font-medium text-blue-200 mb-1">Ümumi TOEFL balı</p>
            <p className="text-6xl font-bold mb-2">{result.total}</p>
            <p className="text-sm text-blue-200">120 baldan</p>
          </div>

          {/* Level */}
          <div className={`rounded-xl border p-5 ${result.level.color}`}>
            <p className="font-semibold text-lg mb-1">Səviyyə: {result.level.level}</p>
            <p className="text-sm">{result.level.description}</p>
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
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(Number(scores[section.id]) / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Scale */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                TOEFL bal səviyyələri
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { level: "Outstanding", range: "110–120", color: "text-green-700", bg: "bg-green-50" },
                { level: "Excellent", range: "94–109", color: "text-green-600", bg: "bg-green-50" },
                { level: "Good", range: "79–93", color: "text-blue-700", bg: "bg-blue-50" },
                { level: "Average", range: "60–78", color: "text-yellow-700", bg: "bg-yellow-50" },
                { level: "Below Average", range: "0–59", color: "text-red-700", bg: "bg-red-50" },
              ].map((item) => {
                const isActive = item.level === result.level.level;
                return (
                  <div key={item.level} className={`flex items-center justify-between px-5 py-3 ${isActive ? item.bg : ""}`}>
                    <span className={`text-sm ${isActive ? "font-semibold" : ""} ${item.color}`}>{item.level}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted">{item.range}</span>
                      {isActive && (
                        <span className="text-xs bg-foreground text-white px-2 py-0.5 rounded-full">Siz</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* University Requirements */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-3">📌 Universitetlər üçün minimum TOEFL balları</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700">
              <div className="flex justify-between">
                <span>Harvard, MIT, Stanford</span>
                <span className="font-semibold">100+</span>
              </div>
              <div className="flex justify-between">
                <span>ABŞ top universitetləri</span>
                <span className="font-semibold">90–100</span>
              </div>
              <div className="flex justify-between">
                <span>UK universitetləri (bakalavr)</span>
                <span className="font-semibold">80–90</span>
              </div>
              <div className="flex justify-between">
                <span>UK universitetləri (magistr)</span>
                <span className="font-semibold">90–100</span>
              </div>
              <div className="flex justify-between">
                <span>Almanya universitetləri</span>
                <span className="font-semibold">80–95</span>
              </div>
              <div className="flex justify-between">
                <span>Kanada universitetləri</span>
                <span className="font-semibold">85–100</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📝</span>
          <p>Nəticəni görmək üçün bütün bölmələrin ballarını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
