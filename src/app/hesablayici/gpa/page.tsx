"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

interface Course {
  id: number;
  name: string;
  score: string;
  credits: string;
}

function scoreToGPA(score: number): { gpa: number; letter: string; color: string } {
  if (score >= 91) return { gpa: 4.0, letter: "A", color: "text-green-700" };
  if (score >= 81) return { gpa: 3.0 + ((score - 81) / 10) * 1.0, letter: "B", color: "text-blue-700" };
  if (score >= 71) return { gpa: 2.0 + ((score - 71) / 10) * 1.0, letter: "C", color: "text-yellow-700" };
  if (score >= 51) return { gpa: 1.0 + ((score - 51) / 20) * 1.0, letter: "D", color: "text-orange-700" };
  return { gpa: 0, letter: "F", color: "text-red-700" };
}

function fmt(n: number): string {
  return n.toFixed(2);
}

let nextId = 1;

export default function GPACalculator() {
  const [singleScore, setSingleScore] = useState("");
  const [courses, setCourses] = useState<Course[]>([
    { id: nextId++, name: "", score: "", credits: "" },
  ]);

  const singleResult = useMemo(() => {
    const s = parseInt(singleScore);
    if (!s || s < 0 || s > 100) return null;
    return scoreToGPA(s);
  }, [singleScore]);

  const weightedResult = useMemo(() => {
    const validCourses = courses.filter(
      (c) => c.score && c.credits && Number(c.score) >= 0 && Number(c.score) <= 100 && Number(c.credits) > 0
    );
    if (validCourses.length === 0) return null;

    let totalWeightedGPA = 0;
    let totalCredits = 0;
    const breakdown = validCourses.map((c) => {
      const score = Number(c.score);
      const credits = Number(c.credits);
      const result = scoreToGPA(score);
      totalWeightedGPA += result.gpa * credits;
      totalCredits += credits;
      return { ...c, gpa: result.gpa, letter: result.letter, color: result.color, creditNum: credits };
    });

    const weightedGPA = totalWeightedGPA / totalCredits;

    return { weightedGPA, totalCredits, breakdown };
  }, [courses]);

  const addCourse = () => {
    setCourses((prev) => [...prev, { id: nextId++, name: "", score: "", credits: "" }]);
  };

  const removeCourse = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCourse = (id: number, field: keyof Course, value: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <CalculatorLayout
      title="GPA Çevirici Hesablayıcısı"
      description="Azərbaycan 100 ballıq sistemindən 4.0 GPA şkalasına çevirmə. Tək bal və ya çoxlu fənlərlə çəkili GPA hesablayın."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "GPA çevirici" },
      ]}
      formulaTitle="GPA necə hesablanır?"
      formulaContent={`100 ballıq sistemdən 4.0 GPA-ya çevirmə:

• 91–100 → 4.0 (A)
• 81–90 → 3.0–3.9 (B)
• 71–80 → 2.0–2.9 (C)
• 51–70 → 1.0–1.9 (D)
• 0–50 → 0.0 (F)

Çəkili GPA = Σ(Fənn GPA × Kredit) ÷ Σ(Kredit)

Məsələn: Riyaziyyat (95 bal, 5 kredit) + Fizika (82 bal, 4 kredit)
GPA = (4.0×5 + 3.1×4) ÷ (5+4) = 32.4 ÷ 9 = 3.60`}
      relatedIds={["school-grade", "university-admission", "foreign-university", "ielts"]}
    >
      {/* Single Score Converter */}
      <div className="mb-8">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>🔄</span>
          Tək bal çevirmə
        </h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              Bal (0–100)
            </label>
            <input
              type="number"
              value={singleScore}
              onChange={(e) => setSingleScore(e.target.value)}
              placeholder="85"
              min="0"
              max="100"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
          {singleResult && (
            <div className="flex gap-3">
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl px-6 py-3 text-center text-white">
                <p className="text-xs text-blue-200">GPA</p>
                <p className="text-2xl font-bold">{fmt(singleResult.gpa)}</p>
              </div>
              <div className={`rounded-xl border px-6 py-3 text-center ${singleResult.color} bg-gray-50`}>
                <p className="text-xs text-muted">Hərf</p>
                <p className="text-2xl font-bold">{singleResult.letter}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GPA Scale Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-8">
        <div className="bg-gray-50 px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span>📊</span>
            Çevirmə cədvəli
          </h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { range: "91–100", gpa: "4.0", letter: "A", color: "text-green-700", bg: "" },
            { range: "81–90", gpa: "3.0–3.9", letter: "B", color: "text-blue-700", bg: "" },
            { range: "71–80", gpa: "2.0–2.9", letter: "C", color: "text-yellow-700", bg: "" },
            { range: "51–70", gpa: "1.0–1.9", letter: "D", color: "text-orange-700", bg: "" },
            { range: "0–50", gpa: "0.0", letter: "F", color: "text-red-700", bg: "" },
          ].map((row) => {
            const isActive = singleResult && row.letter === singleResult.letter;
            return (
              <div key={row.letter} className={`grid grid-cols-3 px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-muted">{row.range} bal</span>
                <span className={`text-sm font-medium ${row.color}`}>{row.gpa} GPA</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${row.color}`}>{row.letter}</span>
                  {isActive && (
                    <span className="text-xs bg-foreground text-white px-2 py-0.5 rounded-full">Siz</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weighted GPA Calculator */}
      <div className="border-t border-border pt-8">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📚</span>
          Çəkili GPA hesablaması (çoxlu fənn)
        </h3>

        <div className="space-y-3 mb-4">
          {courses.map((course, index) => (
            <div key={course.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4 sm:col-span-5">
                {index === 0 && <label className="block text-xs text-muted mb-1">Fənn adı</label>}
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                  placeholder="Riyaziyyat"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-3 sm:col-span-3">
                {index === 0 && <label className="block text-xs text-muted mb-1">Bal (0–100)</label>}
                <input
                  type="number"
                  value={course.score}
                  onChange={(e) => updateCourse(course.id, "score", e.target.value)}
                  placeholder="85"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-3 sm:col-span-3">
                {index === 0 && <label className="block text-xs text-muted mb-1">Kredit</label>}
                <input
                  type="number"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, "credits", e.target.value)}
                  placeholder="3"
                  min="1"
                  max="10"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                {courses.length > 1 && (
                  <button
                    onClick={() => removeCourse(course.id)}
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
          onClick={addCourse}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors text-sm font-medium"
        >
          + Fənn əlavə et
        </button>

        {/* Weighted GPA Result */}
        {weightedResult && (
          <div className="mt-6 space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
              <p className="text-sm font-medium text-blue-200 mb-1">Çəkili GPA</p>
              <p className="text-6xl font-bold mb-2">{fmt(weightedResult.weightedGPA)}</p>
              <p className="text-sm text-blue-200">Ümumi kredit: {weightedResult.totalCredits}</p>
            </div>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-semibold text-foreground mb-3">Fənn icmalı</h4>
              <div className="space-y-2">
                {weightedResult.breakdown.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${c.color}`}>{c.letter}</span>
                      <span className="text-sm text-foreground">{c.name || "Fənn"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted">{c.score}/100</span>
                      <span className="font-medium text-foreground">{fmt(c.gpa)} GPA</span>
                      <span className="text-muted text-xs">({c.creditNum} kr)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
