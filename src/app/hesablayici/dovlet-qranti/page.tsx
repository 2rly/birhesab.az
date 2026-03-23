"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type GroupId = "1" | "2" | "3" | "4";

const groups = [
  { id: "1" as GroupId, name: "I qrup", desc: "Riyaziyyat–Fizika", icon: "📐" },
  { id: "2" as GroupId, name: "II qrup", desc: "Riyaziyyat–Coğrafiya", icon: "🌍" },
  { id: "3" as GroupId, name: "III qrup", desc: "Azərbaycan dili–Tarix", icon: "📚" },
  { id: "4" as GroupId, name: "IV qrup", desc: "Biologiya–Kimya", icon: "🔬" },
];

// Approximate grant thresholds per group (these vary by year)
const grantThresholds: Record<GroupId, { full: number; half: number; quarter: number }> = {
  "1": { full: 600, half: 500, quarter: 400 },
  "2": { full: 580, half: 480, quarter: 380 },
  "3": { full: 550, half: 450, quarter: 350 },
  "4": { full: 620, half: 520, quarter: 420 },
};

function getGrantLevel(score: number, group: GroupId): { level: string; description: string; color: string; percentage: string } {
  const t = grantThresholds[group];
  if (score >= t.full) return { level: "Tam qrant (100%)", description: "Təhsil haqqının tam ödənilməsi — dövlət tərəfindən.", percentage: "100%", color: "text-green-700 bg-green-50 border-green-200" };
  if (score >= t.half) return { level: "50% qrant", description: "Təhsil haqqının yarısı dövlət tərəfindən ödənilir.", percentage: "50%", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (score >= t.quarter) return { level: "25% qrant", description: "Təhsil haqqının dörddə biri dövlət tərəfindən ödənilir.", percentage: "25%", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  return { level: "Qrant yoxdur", description: "Bu bal ilə dövlət qrantı almaq mümkün deyil.", percentage: "0%", color: "text-red-700 bg-red-50 border-red-200" };
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

export default function DovletQrantiCalculator() {
  const [selectedGroup, setSelectedGroup] = useState<GroupId>("1");
  const [score, setScore] = useState("");

  const result = useMemo(() => {
    const s = parseInt(score);
    if (!s || s < 0 || s > 700) return null;

    const grant = getGrantLevel(s, selectedGroup);
    const thresholds = grantThresholds[selectedGroup];

    return { score: s, grant, thresholds };
  }, [score, selectedGroup]);

  return (
    <CalculatorLayout
      title="Dövlət Qrantı Balı Hesablayıcısı"
      description="DIM imtahan balınızı daxil edin — hansı dövlət qrantına uyğun olduğunuzu öyrənin."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "Dövlət qrantı balı" },
      ]}
      formulaTitle="Dövlət qrantı necə müəyyən edilir?"
      formulaContent={`Azərbaycanda dövlət qrantları DIM imtahan balına əsaslanır.

Qrant növləri:
• Tam qrant (100%) — təhsil haqqının tam ödənilməsi
• 50% qrant — təhsil haqqının yarısının ödənilməsi
• 25% qrant — təhsil haqqının dörddə birinin ödənilməsi

Minimum bal hədləri hər il və hər qrup üçün fərqlidir.
Yuxarıda göstərilən hədlər təxminidir və illik dəyişə bilər.

Qrant almaq üçün namizədin həm ümumi bal, həm də ixtisas üzrə minimum tələbləri
ödəməsi lazımdır. Dəqiq məlumat üçün DIM-in rəsmi saytına müraciət edin.`}
      relatedIds={["university-admission", "gpa", "ielts", "foreign-university"]}
    >
      {/* Group Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">İxtisas qrupu</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedGroup === g.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{g.icon}</span>
              <p className="text-xs font-medium text-foreground">{g.name}</p>
              <p className="text-xs text-muted">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Score Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          DIM imtahan balı (0–700)
        </label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0–700"
          min="0"
          max="700"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Result */}
      {result ? (
        <div className="space-y-4">
          {/* Grant Result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
            <p className="text-sm font-medium text-blue-200 mb-1">Sizin balınız</p>
            <p className="text-6xl font-bold mb-2">{fmt(result.score)}</p>
            <p className="text-sm text-blue-200">700 baldan</p>
          </div>

          {/* Grant Level */}
          <div className={`rounded-xl border p-5 ${result.grant.color}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-lg">{result.grant.level}</p>
              <span className="text-3xl font-bold">{result.grant.percentage}</span>
            </div>
            <p className="text-sm">{result.grant.description}</p>
          </div>

          {/* Progress to next level */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-4">Qrant hədlərinə qədər məsafə</h4>
            <div className="space-y-4">
              {[
                { label: "Tam qrant (100%)", threshold: result.thresholds.full, color: "bg-green-500" },
                { label: "50% qrant", threshold: result.thresholds.half, color: "bg-blue-500" },
                { label: "25% qrant", threshold: result.thresholds.quarter, color: "bg-yellow-500" },
              ].map((item) => {
                const progress = Math.min(100, (result.score / item.threshold) * 100);
                const diff = item.threshold - result.score;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-medium text-foreground">
                        {diff <= 0 ? (
                          <span className="text-green-600">Keçir ✓</span>
                        ) : (
                          <span>{diff} bal lazım</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${item.color} rounded-full h-3 transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-1 text-right">Hədd: {fmt(item.threshold)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grant Thresholds Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Bütün qruplar üzrə təxmini qrant hədləri
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-4 py-2 text-muted font-medium">Qrup</th>
                    <th className="text-center px-4 py-2 text-green-700 font-medium">Tam (100%)</th>
                    <th className="text-center px-4 py-2 text-blue-700 font-medium">50%</th>
                    <th className="text-center px-4 py-2 text-yellow-700 font-medium">25%</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => {
                    const t = grantThresholds[g.id];
                    const isActive = g.id === selectedGroup;
                    return (
                      <tr key={g.id} className={`border-b border-border ${isActive ? "bg-primary-light" : ""}`}>
                        <td className="px-4 py-2.5 font-medium">
                          {g.icon} {g.name}
                          {isActive && <span className="text-xs bg-foreground text-white px-1.5 py-0.5 rounded-full ml-2">Siz</span>}
                        </td>
                        <td className="text-center px-4 py-2.5 font-semibold text-green-700">{t.full}+</td>
                        <td className="text-center px-4 py-2.5 font-semibold text-blue-700">{t.half}+</td>
                        <td className="text-center px-4 py-2.5 font-semibold text-yellow-700">{t.quarter}+</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Diqqət:</span> Göstərilən bal hədləri təxminidir və hər il DIM tərəfindən
              yenilənir. Dəqiq qrant hədləri ixtisasa, universitetə və il üzrə dəyişir.
              Rəsmi məlumat üçün dim.gov.az saytına müraciət edin.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏆</span>
          <p>Nəticəni görmək üçün imtahan balınızı daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
