"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const sections = [
  { id: "reading", label: "Reading", icon: "📖", max: 30 },
  { id: "listening", label: "Listening", icon: "🎧", max: 30 },
  { id: "speaking", label: "Speaking", icon: "🗣️", max: 30 },
  { id: "writing", label: "Writing", icon: "✍️", max: 30 },
] as const;

function getScoreLevel(total: number, lang: Lang): { level: string; description: string; color: string } {
  const levels = {
    az: {
      outstanding: { level: "Mükəmməl", description: "Mükəmməl səviyyə — ən yaxşı universitetlərə uyğundur." },
      excellent: { level: "Əla", description: "Əla səviyyə — əksər universitetlərin tələblərinə cavab verir." },
      good: { level: "Yaxşı", description: "Yaxşı səviyyə — bir çox proqramlar üçün kifayət edir." },
      average: { level: "Orta", description: "Orta səviyyə — bəzi proqramlar üçün yetərli ola bilər." },
      below: { level: "Orta altı", description: "Orta səviyyədən aşağı — daha çox hazırlıq lazımdır." },
    },
    en: {
      outstanding: { level: "Outstanding", description: "Outstanding level — suitable for top universities." },
      excellent: { level: "Excellent", description: "Excellent level — meets most university requirements." },
      good: { level: "Good", description: "Good level — sufficient for many programs." },
      average: { level: "Average", description: "Average level — may be sufficient for some programs." },
      below: { level: "Below Average", description: "Below average — more preparation is needed." },
    },
    ru: {
      outstanding: { level: "Превосходно", description: "Превосходный уровень — подходит для лучших университетов." },
      excellent: { level: "Отлично", description: "Отличный уровень — соответствует требованиям большинства университетов." },
      good: { level: "Хорошо", description: "Хороший уровень — достаточно для многих программ." },
      average: { level: "Средний", description: "Средний уровень — может быть достаточно для некоторых программ." },
      below: { level: "Ниже среднего", description: "Ниже среднего — требуется дополнительная подготовка." },
    },
  };
  const l = levels[lang];
  if (total >= 110) return { ...l.outstanding, color: "text-green-700 bg-green-50 border-green-200" };
  if (total >= 94) return { ...l.excellent, color: "text-green-600 bg-green-50 border-green-200" };
  if (total >= 79) return { ...l.good, color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (total >= 60) return { ...l.average, color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  return { ...l.below, color: "text-red-700 bg-red-50 border-red-200" };
}

const pageTranslations = {
  az: {
    title: "TOEFL Bal Hesablayıcısı",
    description: "Reading, Listening, Speaking və Writing ballarınızı daxil edin — ümumi TOEFL balınızı və səviyyənizi hesablayın.",
    breadcrumbCategory: "Təhsil",
    breadcrumbLabel: "TOEFL hesablayıcısı",
    formulaTitle: "TOEFL balı necə hesablanır?",
    formulaContent: `TOEFL iBT Total Score = Reading + Listening + Speaking + Writing

Hər bölmə 0–30 bal arasındadır.
Ümumi bal: 0–120

Səviyyələr:
• 110–120 — Mükəmməl
• 94–109 — Əla
• 79–93 — Yaxşı
• 60–78 — Orta
• 0–59 — Orta altı

Məsələn: Reading 28 + Listening 26 + Speaking 24 + Writing 27 = 105 (Əla)`,
    totalScore: "Ümumi TOEFL balı",
    outOf: "120 baldan",
    levelLabel: "Səviyyə",
    scoreSummary: "Bal icmalı",
    scoreLevels: "TOEFL bal səviyyələri",
    you: "Siz",
    uniRequirements: "Universitetlər üçün minimum TOEFL balları",
    usTopUni: "ABŞ top universitetləri",
    ukBachelor: "UK universitetləri (bakalavr)",
    ukMaster: "UK universitetləri (magistr)",
    germanyUni: "Almanya universitetləri",
    canadaUni: "Kanada universitetləri",
    emptyState: "Nəticəni görmək üçün bütün bölmələrin ballarını daxil edin.",
    outstanding: "Mükəmməl",
    excellent: "Əla",
    good: "Yaxşı",
    average: "Orta",
    belowAverage: "Orta altı",
  },
  en: {
    title: "TOEFL Score Calculator",
    description: "Enter your Reading, Listening, Speaking and Writing scores — calculate your total TOEFL score and level.",
    breadcrumbCategory: "Education",
    breadcrumbLabel: "TOEFL calculator",
    formulaTitle: "How is TOEFL score calculated?",
    formulaContent: `TOEFL iBT Total Score = Reading + Listening + Speaking + Writing

Each section is scored 0–30.
Total score: 0–120

Levels:
• 110–120 — Outstanding
• 94–109 — Excellent
• 79–93 — Good
• 60–78 — Average
• 0–59 — Below Average

Example: Reading 28 + Listening 26 + Speaking 24 + Writing 27 = 105 (Excellent)`,
    totalScore: "Total TOEFL Score",
    outOf: "out of 120",
    levelLabel: "Level",
    scoreSummary: "Score Summary",
    scoreLevels: "TOEFL score levels",
    you: "You",
    uniRequirements: "Minimum TOEFL scores for universities",
    usTopUni: "US top universities",
    ukBachelor: "UK universities (bachelor)",
    ukMaster: "UK universities (master)",
    germanyUni: "German universities",
    canadaUni: "Canadian universities",
    emptyState: "Enter all section scores to see the result.",
    outstanding: "Outstanding",
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    belowAverage: "Below Average",
  },
  ru: {
    title: "Калькулятор баллов TOEFL",
    description: "Введите баллы по Reading, Listening, Speaking и Writing — рассчитайте общий балл TOEFL и уровень.",
    breadcrumbCategory: "Образование",
    breadcrumbLabel: "Калькулятор TOEFL",
    formulaTitle: "Как рассчитывается балл TOEFL?",
    formulaContent: `TOEFL iBT Total Score = Reading + Listening + Speaking + Writing

Каждый раздел оценивается от 0 до 30 баллов.
Общий балл: 0–120

Уровни:
• 110–120 — Превосходно
• 94–109 — Отлично
• 79–93 — Хорошо
• 60–78 — Средний
• 0–59 — Ниже среднего

Пример: Reading 28 + Listening 26 + Speaking 24 + Writing 27 = 105 (Отлично)`,
    totalScore: "Общий балл TOEFL",
    outOf: "из 120",
    levelLabel: "Уровень",
    scoreSummary: "Сводка баллов",
    scoreLevels: "Уровни баллов TOEFL",
    you: "Вы",
    uniRequirements: "Минимальные баллы TOEFL для университетов",
    usTopUni: "Топ университеты США",
    ukBachelor: "Университеты Великобритании (бакалавр)",
    ukMaster: "Университеты Великобритании (магистр)",
    germanyUni: "Университеты Германии",
    canadaUni: "Университеты Канады",
    emptyState: "Введите баллы всех разделов, чтобы увидеть результат.",
    outstanding: "Превосходно",
    excellent: "Отлично",
    good: "Хорошо",
    average: "Средний",
    belowAverage: "Ниже среднего",
  },
};

function fmt(n: number): string {
  return n.toLocaleString("az-AZ");
}

export default function TOEFLCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

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
    const level = getScoreLevel(total, lang);

    return { total, level, scores: nums };
  }, [scores, lang]);

  const levelRows = [
    { level: pt.outstanding, range: "110–120", color: "text-green-700", bg: "bg-green-50" },
    { level: pt.excellent, range: "94–109", color: "text-green-600", bg: "bg-green-50" },
    { level: pt.good, range: "79–93", color: "text-blue-700", bg: "bg-blue-50" },
    { level: pt.average, range: "60–78", color: "text-yellow-700", bg: "bg-yellow-50" },
    { level: pt.belowAverage, range: "0–59", color: "text-red-700", bg: "bg-red-50" },
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
            <p className="text-sm font-medium text-blue-200 mb-1">{pt.totalScore}</p>
            <p className="text-6xl font-bold mb-2">{result.total}</p>
            <p className="text-sm text-blue-200">{pt.outOf}</p>
          </div>

          {/* Level */}
          <div className={`rounded-xl border p-5 ${result.level.color}`}>
            <p className="font-semibold text-lg mb-1">{pt.levelLabel}: {result.level.level}</p>
            <p className="text-sm">{result.level.description}</p>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">{pt.scoreSummary}</h4>
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
            <h4 className="font-semibold text-amber-800 mb-3">📌 {pt.uniRequirements}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700">
              <div className="flex justify-between">
                <span>Harvard, MIT, Stanford</span>
                <span className="font-semibold">100+</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.usTopUni}</span>
                <span className="font-semibold">90–100</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.ukBachelor}</span>
                <span className="font-semibold">80–90</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.ukMaster}</span>
                <span className="font-semibold">90–100</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.germanyUni}</span>
                <span className="font-semibold">80–95</span>
              </div>
              <div className="flex justify-between">
                <span>{pt.canadaUni}</span>
                <span className="font-semibold">85–100</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📝</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
