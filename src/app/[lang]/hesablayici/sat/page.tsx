"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

function getScoreLevel(total: number, lang: Lang): { level: string; description: string; color: string } {
  const levels = {
    az: {
      excellent: { level: "Əla", description: "Ən yaxşı universitetlər üçün rəqabətli bal." },
      good: { level: "Yaxşı", description: "Bir çox güclü universitetlər üçün yetərli bal." },
      average: { level: "Orta", description: "Orta səviyyəli universitetlər üçün uyğun bal." },
      belowAvg: { level: "Orta altı", description: "Bəzi proqramlar üçün yetərli ola bilər." },
      low: { level: "Aşağı", description: "Hazırlığı davam etdirmək tövsiyə olunur." },
    },
    en: {
      excellent: { level: "Excellent", description: "Competitive score for top universities." },
      good: { level: "Good", description: "Sufficient for many strong universities." },
      average: { level: "Average", description: "Suitable for mid-level universities." },
      belowAvg: { level: "Below Average", description: "May be sufficient for some programs." },
      low: { level: "Low", description: "Further preparation is recommended." },
    },
    ru: {
      excellent: { level: "Отлично", description: "Конкурентный балл для лучших университетов." },
      good: { level: "Хорошо", description: "Достаточно для многих сильных университетов." },
      average: { level: "Средний", description: "Подходит для университетов среднего уровня." },
      belowAvg: { level: "Ниже среднего", description: "Может быть достаточно для некоторых программ." },
      low: { level: "Низкий", description: "Рекомендуется продолжить подготовку." },
    },
  };
  const l = levels[lang];
  if (total >= 1400) return { ...l.excellent, color: "text-green-700 bg-green-50 border-green-200" };
  if (total >= 1200) return { ...l.good, color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (total >= 1000) return { ...l.average, color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  if (total >= 800) return { ...l.belowAvg, color: "text-orange-700 bg-orange-50 border-orange-200" };
  return { ...l.low, color: "text-red-700 bg-red-50 border-red-200" };
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

const pageTranslations = {
  az: {
    title: "SAT Bal Hesablayıcısı",
    description: "Evidence-Based Reading and Writing (EBRW) və Math ballarınızı daxil edin — ümumi SAT balınızı və persentil təxmininizi hesablayın.",
    breadcrumbCategory: "Təhsil",
    breadcrumbLabel: "SAT hesablayıcısı",
    formulaTitle: "SAT balı necə hesablanır?",
    formulaContent: `SAT Total Score = EBRW + Math

Hər bölmə 200–800 bal arasındadır.
Ümumi bal: 400–1600

Persentil — sizin balınızdan aşağı bal alan test verənlərin faizini göstərir.
Məsələn: 75-ci persentil = siz test verənlərin 75%-dən yaxşı nəticə göstərmisiniz.

Səviyyələr:
• 1400–1600 — Əla (top universitetlər)
• 1200–1399 — Yaxşı
• 1000–1199 — Orta
• 800–999 — Orta altı
• 400–799 — Aşağı`,
    ebrwLabel: "Evidence-Based Reading and Writing (200–800)",
    mathLabel: "Math (200–800)",
    totalScore: "Ümumi SAT balı",
    outOf: "1600 baldan",
    levelLabel: "Səviyyə",
    estimatedPercentile: "Təxmini persentil",
    betterThan: "Test verənlərin {pct}%-dən yaxşı",
    scoreSummary: "Bal icmalı",
    scoreLevels: "SAT bal səviyyələri",
    you: "Siz",
    uniScores: "Universitetlər üçün orta SAT balları",
    avgUsUni: "Orta ABŞ universitetləri",
    emptyState: "Nəticəni görmək üçün hər iki bölmənin balını daxil edin.",
    excellent: "Əla",
    good: "Yaxşı",
    average: "Orta",
    belowAvg: "Orta altı",
    low: "Aşağı",
  },
  en: {
    title: "SAT Score Calculator",
    description: "Enter your Evidence-Based Reading and Writing (EBRW) and Math scores — calculate your total SAT score and percentile estimate.",
    breadcrumbCategory: "Education",
    breadcrumbLabel: "SAT calculator",
    formulaTitle: "How is SAT score calculated?",
    formulaContent: `SAT Total Score = EBRW + Math

Each section is scored 200–800.
Total score: 400–1600

Percentile — shows the percentage of test-takers who scored lower than you.
Example: 75th percentile = you scored better than 75% of test-takers.

Levels:
• 1400–1600 — Excellent (top universities)
• 1200–1399 — Good
• 1000–1199 — Average
• 800–999 — Below Average
• 400–799 — Low`,
    ebrwLabel: "Evidence-Based Reading and Writing (200–800)",
    mathLabel: "Math (200–800)",
    totalScore: "Total SAT Score",
    outOf: "out of 1600",
    levelLabel: "Level",
    estimatedPercentile: "Estimated Percentile",
    betterThan: "Better than {pct}% of test-takers",
    scoreSummary: "Score Summary",
    scoreLevels: "SAT score levels",
    you: "You",
    uniScores: "Average SAT scores for universities",
    avgUsUni: "Average US universities",
    emptyState: "Enter both section scores to see the result.",
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    belowAvg: "Below Average",
    low: "Low",
  },
  ru: {
    title: "Калькулятор баллов SAT",
    description: "Введите баллы EBRW и Math — рассчитайте общий балл SAT и оценку перцентиля.",
    breadcrumbCategory: "Образование",
    breadcrumbLabel: "Калькулятор SAT",
    formulaTitle: "Как рассчитывается балл SAT?",
    formulaContent: `SAT Total Score = EBRW + Math

Каждый раздел оценивается от 200 до 800 баллов.
Общий балл: 400–1600

Перцентиль — показывает процент сдающих, набравших балл ниже вашего.
Пример: 75-й перцентиль = вы показали результат лучше 75% сдающих.

Уровни:
• 1400–1600 — Отлично (топ университеты)
• 1200–1399 — Хорошо
• 1000–1199 — Средний
• 800–999 — Ниже среднего
• 400–799 — Низкий`,
    ebrwLabel: "Evidence-Based Reading and Writing (200–800)",
    mathLabel: "Math (200–800)",
    totalScore: "Общий балл SAT",
    outOf: "из 1600",
    levelLabel: "Уровень",
    estimatedPercentile: "Приблизительный перцентиль",
    betterThan: "Лучше {pct}% сдающих тест",
    scoreSummary: "Сводка баллов",
    scoreLevels: "Уровни баллов SAT",
    you: "Вы",
    uniScores: "Средние баллы SAT для университетов",
    avgUsUni: "Средние университеты США",
    emptyState: "Введите баллы обоих разделов, чтобы увидеть результат.",
    excellent: "Отлично",
    good: "Хорошо",
    average: "Средний",
    belowAvg: "Ниже среднего",
    low: "Низкий",
  },
};

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

export default function SATCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [ebrw, setEbrw] = useState("");
  const [math, setMath] = useState("");

  const result = useMemo(() => {
    const e = parseInt(ebrw);
    const m = parseInt(math);
    if (!e || !m || e < 200 || e > 800 || m < 200 || m > 800) return null;

    const total = e + m;
    const level = getScoreLevel(total, lang);
    const percentile = getPercentile(total);

    return { total, ebrw: e, math: m, level, percentile };
  }, [ebrw, math, lang]);

  const levelRows = [
    { level: pt.excellent, range: "1400–1600", color: "text-green-700", bg: "bg-green-50" },
    { level: pt.good, range: "1200–1399", color: "text-blue-700", bg: "bg-blue-50" },
    { level: pt.average, range: "1000–1199", color: "text-yellow-700", bg: "bg-yellow-50" },
    { level: pt.belowAvg, range: "800–999", color: "text-orange-700", bg: "bg-orange-50" },
    { level: pt.low, range: "400–799", color: "text-red-700", bg: "bg-red-50" },
  ];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=education" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["toefl", "ielts", "gpa", "university-admission"]}
    >
      {/* Input Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="mr-1.5">📖</span>
            {pt.ebrwLabel}
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
            {pt.mathLabel}
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
            <p className="text-sm font-medium text-blue-200 mb-1">{pt.totalScore}</p>
            <p className="text-6xl font-bold mb-2">{fmt(result.total)}</p>
            <p className="text-sm text-blue-200">{pt.outOf}</p>
          </div>

          {/* Level & Percentile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`rounded-xl border p-5 ${result.level.color}`}>
              <p className="font-semibold text-lg mb-1">{pt.levelLabel}: {result.level.level}</p>
              <p className="text-sm">{result.level.description}</p>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-center">
              <p className="text-sm text-purple-600 mb-1">{pt.estimatedPercentile}</p>
              <p className="text-4xl font-bold text-purple-700">{result.percentile}%</p>
              <p className="text-xs text-purple-500 mt-1">{pt.betterThan.replace("{pct}", String(result.percentile))}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">{pt.scoreSummary}</h4>
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
                {pt.scoreLevels}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {levelRows.map((item) => {
                const isActive = item.level === result.level.level;
                return (
                  <div key={item.level} className={`flex items-center justify-between px-5 py-3 ${isActive ? item.bg : ""}`}>
                    <span className={`text-sm ${isActive ? "font-semibold" : ""} ${item.color}`}>{item.level}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted">{item.range}</span>
                      {isActive && (
                        <span className="text-xs bg-foreground text-white px-2 py-0.5 rounded-full">{pt.you}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* University Requirements */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-3">📌 {pt.uniScores}</h4>
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
                <span>{pt.avgUsUni}</span>
                <span className="font-semibold">1000–1200</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">✏️</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
