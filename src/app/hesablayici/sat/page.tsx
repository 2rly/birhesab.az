"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

function getScoreLevel(total: number): { level: string; description: string; color: string } {
  if (total >= 1400) return { level: "Əla", description: "Ən yaxşı universitetlər üçün rəqabətli bal.", color: "text-green-700 bg-green-50 border-green-200" };
  if (total >= 1200) return { level: "Yaxşı", description: "Bir çox güclü universitetlər üçün yetərli bal.", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (total >= 1000) return { level: "Orta", description: "Orta səviyyəli universitetlər üçün uyğun bal.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  if (total >= 800) return { level: "Orta altı", description: "Bəzi proqramlar üçün yetərli ola bilər.", color: "text-orange-700 bg-orange-50 border-orange-200" };
  return { level: "Aşağı", description: "Hazırlığı davam etdirmək tövsiyə olunur.", color: "text-red-700 bg-red-50 border-red-200" };
}

function getPercentile(total: number): number {
  if (total >= 1550) return 99;
  if (total >= 1500) return 98;
  if (total >= 1450) return 96;
  if (total >= 1400) return 94;
  if (total >= 1350) return 91;
  if (total >= 1300) return 87;
  if (total >= 1250) return 82;
  if (total >= 1200) return 76;
  if (total >= 1150) return 69;
  if (total >= 1100) return 62;
  if (total >= 1050) return 54;
  if (total >= 1000) return 47;
  if (total >= 950) return 39;
  if (total >= 900) return 32;
  if (total >= 850) return 25;
  if (total >= 800) return 19;
  if (total >= 750) return 14;
  if (total >= 700) return 9;
  if (total >= 650) return 6;
  if (total >= 600) return 3;
  return 1;
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

export default function SATCalculator() {
  const [ebrw, setEbrw] = useState("");
  const [math, setMath] = useState("");

  const result = useMemo(() => {
    const e = parseInt(ebrw);
    const m = parseInt(math);
    if (!e || !m || e < 200 || e > 800 || m < 200 || m > 800) return null;

    const total = e + m;
    const level = getScoreLevel(total);
    const percentile = getPercentile(total);

    return { total, ebrw: e, math: m, level, percentile };
  }, [ebrw, math]);

  return (
    <CalculatorLayout
      title="SAT Bal Hesablayıcısı"
      description="Evidence-Based Reading and Writing (EBRW) və Math ballarınızı daxil edin — ümumi SAT balınızı və persentil təxmininizi hesablayın."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "SAT hesablayıcısı" },
      ]}
      formulaTitle="SAT balı necə hesablanır?"
      formulaContent={`SAT Total Score = EBRW + Math

Hər bölmə 200–800 bal arasındadır.
Ümumi bal: 400–1600

Persentil — sizin balınızdan aşağı bal alan test verənlərin faizini göstərir.
Məsələn: 75-ci persentil = siz test verənlərin 75%-dən yaxşı nəticə göstərmisiniz.

Səviyyələr:
• 1400–1600 — Əla (top universitetlər)
• 1200–1399 — Yaxşı
• 1000–1199 — Orta
• 800–999 — Orta altı
• 400–799 — Aşağı`}
      relatedIds={["toefl", "ielts", "gpa", "university-admission"]}
    >
      {/* Input Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="mr-1.5">📖</span>
            Evidence-Based Reading and Writing (200–800)
          </label>
          <input
            type="number"
            value={ebrw}
            onChange={(e) => setEbrw(e.target.value)}
            placeholder="200–800"
            min="200"
            max="800"
            step="10"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="mr-1.5">🔢</span>
            Math (200–800)
          </label>
          <input
            type="number"
            value={math}
            onChange={(e) => setMath(e.target.value)}
            placeholder="200–800"
            min="200"
            max="800"
            step="10"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Result Section */}
      {result ? (
        <div className="space-y-4">
          {/* Total Score */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
            <p className="text-sm font-medium text-blue-200 mb-1">Ümumi SAT balı</p>
            <p className="text-6xl font-bold mb-2">{fmt(result.total)}</p>
            <p className="text-sm text-blue-200">1600 baldan</p>
          </div>

          {/* Level & Percentile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`rounded-xl border p-5 ${result.level.color}`}>
              <p className="font-semibold text-lg mb-1">Səviyyə: {result.level.level}</p>
              <p className="text-sm">{result.level.description}</p>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-center">
              <p className="text-sm text-purple-600 mb-1">Təxmini persentil</p>
              <p className="text-4xl font-bold text-purple-700">{result.percentile}%</p>
              <p className="text-xs text-purple-500 mt-1">Test verənlərin {result.percentile}%-dən yaxşı</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">Bal icmalı</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl mb-1">📖</p>
                <p className="text-xs text-muted mb-1">EBRW</p>
                <p className="text-xl font-bold text-foreground">{result.ebrw}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all"
                    style={{ width: `${((result.ebrw - 200) / 600) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl mb-1">🔢</p>
                <p className="text-xs text-muted mb-1">Math</p>
                <p className="text-xl font-bold text-foreground">{result.math}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${((result.math - 200) / 600) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Score Levels Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                SAT bal səviyyələri
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { level: "Əla", range: "1400–1600", color: "text-green-700", bg: "bg-green-50" },
                { level: "Yaxşı", range: "1200–1399", color: "text-blue-700", bg: "bg-blue-50" },
                { level: "Orta", range: "1000–1199", color: "text-yellow-700", bg: "bg-yellow-50" },
                { level: "Orta altı", range: "800–999", color: "text-orange-700", bg: "bg-orange-50" },
                { level: "Aşağı", range: "400–799", color: "text-red-700", bg: "bg-red-50" },
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
            <h4 className="font-semibold text-amber-800 mb-3">📌 Universitetlər üçün orta SAT balları</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700">
              <div className="flex justify-between">
                <span>Harvard University</span>
                <span className="font-semibold">1480–1580</span>
              </div>
              <div className="flex justify-between">
                <span>MIT</span>
                <span className="font-semibold">1510–1580</span>
              </div>
              <div className="flex justify-between">
                <span>Stanford University</span>
                <span className="font-semibold">1470–1570</span>
              </div>
              <div className="flex justify-between">
                <span>UCLA</span>
                <span className="font-semibold">1290–1510</span>
              </div>
              <div className="flex justify-between">
                <span>University of Michigan</span>
                <span className="font-semibold">1340–1520</span>
              </div>
              <div className="flex justify-between">
                <span>Orta ABŞ universitetləri</span>
                <span className="font-semibold">1000–1200</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">✏️</span>
          <p>Nəticəni görmək üçün hər iki bölmənin balını daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
