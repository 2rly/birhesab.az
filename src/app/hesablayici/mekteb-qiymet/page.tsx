"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

interface Subject {
  id: number;
  name: string;
  grade: string;
}

const gradeLabels: Record<string, { label: string; color: string; emoji: string }> = {
  "5": { label: "Əla", color: "text-green-700", emoji: "🌟" },
  "4": { label: "Yaxşı", color: "text-blue-700", emoji: "👍" },
  "3": { label: "Kafi", color: "text-yellow-700", emoji: "📝" },
  "2": { label: "Pis", color: "text-red-700", emoji: "⚠️" },
};

function getAverageLevel(avg: number): { level: string; description: string; color: string } {
  if (avg >= 4.5) return { level: "Əla", description: "Tələbə əla nəticə göstərir.", color: "text-green-700 bg-green-50 border-green-200" };
  if (avg >= 3.5) return { level: "Yaxşı", description: "Tələbə yaxşı səviyyədədir.", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (avg >= 2.5) return { level: "Kafi", description: "Orta səviyyə — yaxşılaşdırma lazımdır.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  return { level: "Qeyri-kafi", description: "Nəticə zəifdir — ciddi hazırlıq lazımdır.", color: "text-red-700 bg-red-50 border-red-200" };
}

let nextId = 1;

export default function MektebQiymetCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: nextId++, name: "Riyaziyyat", grade: "" },
    { id: nextId++, name: "Azərbaycan dili", grade: "" },
    { id: nextId++, name: "Fizika", grade: "" },
    { id: nextId++, name: "Tarix", grade: "" },
    { id: nextId++, name: "Xarici dil", grade: "" },
  ]);

  const updateSubject = (id: number, field: keyof Subject, value: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSubject = () => {
    setSubjects((prev) => [...prev, { id: nextId++, name: "", grade: "" }]);
  };

  const removeSubject = (id: number) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const result = useMemo(() => {
    const valid = subjects.filter((s) => s.grade);
    if (valid.length === 0) return null;

    const grades = valid.map((s) => Number(s.grade));
    const sum = grades.reduce((a, b) => a + b, 0);
    const avg = sum / grades.length;
    const level = getAverageLevel(avg);

    // Distribution
    const dist = { "5": 0, "4": 0, "3": 0, "2": 0 };
    grades.forEach((g) => {
      dist[String(g) as keyof typeof dist]++;
    });

    return { avg, level, count: valid.length, dist, subjects: valid };
  }, [subjects]);

  return (
    <CalculatorLayout
      title="Məktəb Qiymət Ortalaması Hesablayıcısı"
      description="Fənlər üzrə qiymətlərinizi daxil edin — ortalama qiyməti və bölgünü hesablayın. Azərbaycan 2–5 qiymətləndirmə sistemi."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "Məktəb qiymət ortalaması" },
      ]}
      formulaTitle="Ortalama qiymət necə hesablanır?"
      formulaContent={`Ortalama qiymət = Bütün qiymətlərin cəmi ÷ Fənn sayı

Azərbaycan qiymətləndirmə sistemi:
• 5 — Əla
• 4 — Yaxşı
• 3 — Kafi
• 2 — Pis (qeyri-kafi)

Məsələn: (5 + 4 + 5 + 3 + 4) ÷ 5 = 4.2 → Yaxşı

Səviyyələr:
• 4.5–5.0 — Əla
• 3.5–4.4 — Yaxşı
• 2.5–3.4 — Kafi
• 2.0–2.4 — Qeyri-kafi`}
      relatedIds={["gpa", "university-admission", "state-grant", "school-grade"]}
    >
      {/* Subjects */}
      <div className="space-y-3 mb-4">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6 sm:col-span-7">
              {index === 0 && <label className="block text-xs text-muted mb-1">Fənn adı</label>}
              <input
                type="text"
                value={subject.name}
                onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                placeholder="Fənn adı"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div className="col-span-4 sm:col-span-4">
              {index === 0 && <label className="block text-xs text-muted mb-1">Qiymət (2–5)</label>}
              <select
                value={subject.grade}
                onChange={(e) => updateSubject(subject.id, "grade", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
              >
                <option value="">Seçin</option>
                <option value="5">5 — Əla</option>
                <option value="4">4 — Yaxşı</option>
                <option value="3">3 — Kafi</option>
                <option value="2">2 — Pis</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              {subjects.length > 1 && (
                <button
                  onClick={() => removeSubject(subject.id)}
                  className="w-full py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSubject}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors text-sm font-medium mb-8"
      >
        + Fənn əlavə et
      </button>

      {/* Result */}
      {result ? (
        <div className="space-y-4">
          {/* Average */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
            <p className="text-sm font-medium text-blue-200 mb-1">Ortalama qiymət</p>
            <p className="text-6xl font-bold mb-2">{result.avg.toFixed(2)}</p>
            <p className="text-sm text-blue-200">{result.count} fənn üzrə</p>
          </div>

          {/* Level */}
          <div className={`rounded-xl border p-5 ${result.level.color}`}>
            <p className="font-semibold text-lg mb-1">Səviyyə: {result.level.level}</p>
            <p className="text-sm">{result.level.description}</p>
          </div>

          {/* Distribution */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">Qiymət bölgüsü</h4>
            <div className="grid grid-cols-4 gap-3">
              {(["5", "4", "3", "2"] as const).map((grade) => {
                const info = gradeLabels[grade];
                const count = result.dist[grade];
                const pct = result.count > 0 ? (count / result.count) * 100 : 0;
                return (
                  <div key={grade} className="text-center">
                    <p className="text-2xl mb-1">{info.emoji}</p>
                    <p className={`text-2xl font-bold ${info.color}`}>{count}</p>
                    <p className="text-xs text-muted">{info.label} ({grade})</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-1">{pct.toFixed(0)}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject List */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                Fənlər üzrə qiymətlər
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.subjects.map((s) => {
                const info = gradeLabels[s.grade];
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-foreground">{s.name || "Fənn"}</span>
                    <div className="flex items-center gap-2">
                      <span>{info?.emoji}</span>
                      <span className={`text-sm font-bold ${info?.color}`}>{s.grade}</span>
                      <span className={`text-xs ${info?.color}`}>({info?.label})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📚</span>
          <p>Nəticəni görmək üçün ən azı bir fənnin qiymətini seçin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
