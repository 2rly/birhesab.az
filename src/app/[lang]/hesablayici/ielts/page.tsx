"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const bandScores = [
  "1.0", "1.5", "2.0", "2.5", "3.0", "3.5",
  "4.0", "4.5", "5.0", "5.5", "6.0", "6.5",
  "7.0", "7.5", "8.0", "8.5", "9.0",
];

const sections = [
  { id: "listening", label: "Listening", icon: "\u{1F3A7}" },
  { id: "reading", label: "Reading", icon: "\u{1F4D6}" },
  { id: "writing", label: "Writing", icon: "\u270D\uFE0F" },
  { id: "speaking", label: "Speaking", icon: "\u{1F5E3}\uFE0F" },
] as const;

function roundIELTS(avg: number): number {
  const floor = Math.floor(avg);
  const decimal = avg - floor;

  if (decimal < 0.25) return floor;
  if (decimal < 0.75) return floor + 0.5;
  return floor + 1;
}

interface Interpretation {
  level: string;
  description: string;
  color: string;
}

const interpretationsTranslations: Record<Lang, (score: number) => Interpretation> = {
  az: (score: number) => {
    if (score >= 8.5) return { level: "Ekspert", description: "Dili tam serbest ve deqiq istifade edirsiniz.", color: "text-green-700 bg-green-50 border-green-200" };
    if (score >= 7.5) return { level: "Cox yaxsi", description: "Dili yaxsi bilirsiniz, bezi deqiq olmayan ifadeler ola biler.", color: "text-green-600 bg-green-50 border-green-200" };
    if (score >= 6.5) return { level: "Yaxsi", description: "Dili umumiyyetle effektiv istifade edirsiniz.", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (score >= 5.5) return { level: "Orta", description: "Murekkeble dilce cetinlikler olsa da, umumi menani basa dusursunuz.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    if (score >= 4.5) return { level: "Mehdud", description: "Tanis situasiyalarda esas bacariqlar gosterirsiniz.", color: "text-orange-700 bg-orange-50 border-orange-200" };
    return { level: "Zeif", description: "Dil biliklerini cox mehduddur.", color: "text-red-700 bg-red-50 border-red-200" };
  },
  en: (score: number) => {
    if (score >= 8.5) return { level: "Expert", description: "You use the language fluently and accurately.", color: "text-green-700 bg-green-50 border-green-200" };
    if (score >= 7.5) return { level: "Very good", description: "You have a good command of the language with occasional inaccuracies.", color: "text-green-600 bg-green-50 border-green-200" };
    if (score >= 6.5) return { level: "Good", description: "You generally use the language effectively.", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (score >= 5.5) return { level: "Moderate", description: "You understand the general meaning despite difficulties with complex language.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    if (score >= 4.5) return { level: "Limited", description: "You demonstrate basic competence in familiar situations.", color: "text-orange-700 bg-orange-50 border-orange-200" };
    return { level: "Weak", description: "Language skills are very limited.", color: "text-red-700 bg-red-50 border-red-200" };
  },
  ru: (score: number) => {
    if (score >= 8.5) return { level: "\u042D\u043A\u0441\u043F\u0435\u0440\u0442", description: "\u0412\u044B \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E \u0438 \u0442\u043E\u0447\u043D\u043E \u0432\u043B\u0430\u0434\u0435\u0435\u0442\u0435 \u044F\u0437\u044B\u043A\u043E\u043C.", color: "text-green-700 bg-green-50 border-green-200" };
    if (score >= 7.5) return { level: "\u041E\u0447\u0435\u043D\u044C \u0445\u043E\u0440\u043E\u0448\u043E", description: "\u0412\u044B \u0445\u043E\u0440\u043E\u0448\u043E \u0432\u043B\u0430\u0434\u0435\u0435\u0442\u0435 \u044F\u0437\u044B\u043A\u043E\u043C, \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u044B \u043D\u0435\u0437\u043D\u0430\u0447\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0435\u0442\u043E\u0447\u043D\u043E\u0441\u0442\u0438.", color: "text-green-600 bg-green-50 border-green-200" };
    if (score >= 6.5) return { level: "\u0425\u043E\u0440\u043E\u0448\u043E", description: "\u0412\u044B \u0432 \u0446\u0435\u043B\u043E\u043C \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0435 \u044F\u0437\u044B\u043A.", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (score >= 5.5) return { level: "\u0421\u0440\u0435\u0434\u043D\u0435", description: "\u0412\u044B \u043F\u043E\u043D\u0438\u043C\u0430\u0435\u0442\u0435 \u043E\u0431\u0449\u0438\u0439 \u0441\u043C\u044B\u0441\u043B, \u043D\u0435\u0441\u043C\u043E\u0442\u0440\u044F \u043D\u0430 \u0442\u0440\u0443\u0434\u043D\u043E\u0441\u0442\u0438 \u0441\u043E \u0441\u043B\u043E\u0436\u043D\u044B\u043C \u044F\u0437\u044B\u043A\u043E\u043C.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    if (score >= 4.5) return { level: "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u043E", description: "\u0412\u044B \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0438\u0440\u0443\u0435\u0442\u0435 \u0431\u0430\u0437\u043E\u0432\u044B\u0435 \u043D\u0430\u0432\u044B\u043A\u0438 \u0432 \u0437\u043D\u0430\u043A\u043E\u043C\u044B\u0445 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044F\u0445.", color: "text-orange-700 bg-orange-50 border-orange-200" };
    return { level: "\u0421\u043B\u0430\u0431\u043E", description: "\u0417\u043D\u0430\u043D\u0438\u044F \u044F\u0437\u044B\u043A\u0430 \u043E\u0447\u0435\u043D\u044C \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u044B.", color: "text-red-700 bg-red-50 border-red-200" };
  },
};

interface RequirementItem {
  label: string;
  score: string;
}

const requirementsTranslations: Record<Lang, RequirementItem[]> = {
  az: [
    { label: "UK universitetleri (bakalavr)", score: "6.0 \u2013 6.5" },
    { label: "UK universitetleri (magistr)", score: "6.5 \u2013 7.0" },
    { label: "Kanada immiqrasiyasi", score: "6.0 \u2013 7.0" },
    { label: "Avstraliya immiqrasiyasi", score: "7.0 \u2013 8.0" },
    { label: "ABS universitetleri", score: "6.5 \u2013 7.5" },
    { label: "Almaniya universitetleri", score: "6.0 \u2013 7.0" },
  ],
  en: [
    { label: "UK universities (bachelor)", score: "6.0 \u2013 6.5" },
    { label: "UK universities (master)", score: "6.5 \u2013 7.0" },
    { label: "Canada immigration", score: "6.0 \u2013 7.0" },
    { label: "Australia immigration", score: "7.0 \u2013 8.0" },
    { label: "US universities", score: "6.5 \u2013 7.5" },
    { label: "Germany universities", score: "6.0 \u2013 7.0" },
  ],
  ru: [
    { label: "\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u044B \u0412\u0435\u043B\u0438\u043A\u043E\u0431\u0440\u0438\u0442\u0430\u043D\u0438\u0438 (\u0431\u0430\u043A\u0430\u043B\u0430\u0432\u0440)", score: "6.0 \u2013 6.5" },
    { label: "\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u044B \u0412\u0435\u043B\u0438\u043A\u043E\u0431\u0440\u0438\u0442\u0430\u043D\u0438\u0438 (\u043C\u0430\u0433\u0438\u0441\u0442\u0440)", score: "6.5 \u2013 7.0" },
    { label: "\u0418\u043C\u043C\u0438\u0433\u0440\u0430\u0446\u0438\u044F \u0432 \u041A\u0430\u043D\u0430\u0434\u0443", score: "6.0 \u2013 7.0" },
    { label: "\u0418\u043C\u043C\u0438\u0433\u0440\u0430\u0446\u0438\u044F \u0432 \u0410\u0432\u0441\u0442\u0440\u0430\u043B\u0438\u044E", score: "7.0 \u2013 8.0" },
    { label: "\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u044B \u0421\u0428\u0410", score: "6.5 \u2013 7.5" },
    { label: "\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u044B \u0413\u0435\u0440\u043C\u0430\u043D\u0438\u0438", score: "6.0 \u2013 7.0" },
  ],
};

const pageTranslations = {
  az: {
    title: "IELTS Overall Band Score Hesablayicisi",
    description: "Listening, Reading, Writing ve Speaking ballarinizi daxil edin \u2014 umumi IELTS band balinizi ani hesablayin.",
    breadcrumbCategory: "Tehsil",
    breadcrumbTitle: "IELTS hesablayicisi",
    formulaTitle: "IELTS Overall Band Score nece hesablanir?",
    formulaContent: `Overall Band Score = (Listening + Reading + Writing + Speaking) \u00F7 4

Netice en yaxin 0.5 ve ya tam edede yuvarlaqlasdirilir:
\u2022 Ortalama .25-den azdirsa \u2192 asagi yuvarlaqlasdirilir
\u2022 Ortalama .25 ile .75 arasindadirsa \u2192 .5-e yuvarlaqlasdirilir
\u2022 Ortalama .75 ve ya daha coxdursa \u2192 yuxari yuvarlaqlasdirilir

Meselen: (6.5 + 6.0 + 5.5 + 6.0) \u00F7 4 = 6.0 \u2192 Overall: 6.0
Meselen: (7.0 + 6.5 + 6.0 + 6.5) \u00F7 4 = 6.5 \u2192 Overall: 6.5
Meselen: (7.0 + 7.0 + 6.5 + 7.0) \u00F7 4 = 6.875 \u2192 Overall: 7.0`,
    selectBand: "Band secin",
    overallBandScore: "Overall Band Score",
    exactAverage: "Deqiq ortalama",
    level: "Seviyye",
    scoreSummary: "Bal icmali",
    minimumScores: "Teleb olunan minimum ballar",
    emptyStateText: "Neticeni gormek ucun butun bolmelerin ballarini secin.",
  },
  en: {
    title: "IELTS Overall Band Score Calculator",
    description: "Enter your Listening, Reading, Writing, and Speaking scores \u2014 instantly calculate your overall IELTS band score.",
    breadcrumbCategory: "Education",
    breadcrumbTitle: "IELTS calculator",
    formulaTitle: "How is the IELTS Overall Band Score calculated?",
    formulaContent: `Overall Band Score = (Listening + Reading + Writing + Speaking) \u00F7 4

The result is rounded to the nearest 0.5 or whole number:
\u2022 If the average is less than .25 \u2192 rounded down
\u2022 If the average is between .25 and .75 \u2192 rounded to .5
\u2022 If the average is .75 or more \u2192 rounded up

Example: (6.5 + 6.0 + 5.5 + 6.0) \u00F7 4 = 6.0 \u2192 Overall: 6.0
Example: (7.0 + 6.5 + 6.0 + 6.5) \u00F7 4 = 6.5 \u2192 Overall: 6.5
Example: (7.0 + 7.0 + 6.5 + 7.0) \u00F7 4 = 6.875 \u2192 Overall: 7.0`,
    selectBand: "Select band",
    overallBandScore: "Overall Band Score",
    exactAverage: "Exact average",
    level: "Level",
    scoreSummary: "Score summary",
    minimumScores: "Required minimum scores",
    emptyStateText: "Select scores for all sections to see the result.",
  },
  ru: {
    title: "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 IELTS Overall Band Score",
    description: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0431\u0430\u043B\u043B\u044B Listening, Reading, Writing \u0438 Speaking \u2014 \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u043E\u0431\u0449\u0438\u0439 \u0431\u0430\u043B\u043B IELTS.",
    breadcrumbCategory: "\u041E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435",
    breadcrumbTitle: "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 IELTS",
    formulaTitle: "\u041A\u0430\u043A \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F IELTS Overall Band Score?",
    formulaContent: `Overall Band Score = (Listening + Reading + Writing + Speaking) \u00F7 4

\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043E\u043A\u0440\u0443\u0433\u043B\u044F\u0435\u0442\u0441\u044F \u0434\u043E \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0433\u043E 0.5 \u0438\u043B\u0438 \u0446\u0435\u043B\u043E\u0433\u043E \u0447\u0438\u0441\u043B\u0430:
\u2022 \u0415\u0441\u043B\u0438 \u0441\u0440\u0435\u0434\u043D\u0435\u0435 \u043C\u0435\u043D\u044C\u0448\u0435 .25 \u2192 \u043E\u043A\u0440\u0443\u0433\u043B\u044F\u0435\u0442\u0441\u044F \u0432\u043D\u0438\u0437
\u2022 \u0415\u0441\u043B\u0438 \u0441\u0440\u0435\u0434\u043D\u0435\u0435 \u043C\u0435\u0436\u0434\u0443 .25 \u0438 .75 \u2192 \u043E\u043A\u0440\u0443\u0433\u043B\u044F\u0435\u0442\u0441\u044F \u0434\u043E .5
\u2022 \u0415\u0441\u043B\u0438 \u0441\u0440\u0435\u0434\u043D\u0435\u0435 .75 \u0438\u043B\u0438 \u0431\u043E\u043B\u044C\u0448\u0435 \u2192 \u043E\u043A\u0440\u0443\u0433\u043B\u044F\u0435\u0442\u0441\u044F \u0432\u0432\u0435\u0440\u0445

\u041F\u0440\u0438\u043C\u0435\u0440: (6.5 + 6.0 + 5.5 + 6.0) \u00F7 4 = 6.0 \u2192 Overall: 6.0
\u041F\u0440\u0438\u043C\u0435\u0440: (7.0 + 6.5 + 6.0 + 6.5) \u00F7 4 = 6.5 \u2192 Overall: 6.5
\u041F\u0440\u0438\u043C\u0435\u0440: (7.0 + 7.0 + 6.5 + 7.0) \u00F7 4 = 6.875 \u2192 Overall: 7.0`,
    selectBand: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0431\u0430\u043B\u043B",
    overallBandScore: "Overall Band Score",
    exactAverage: "\u0422\u043E\u0447\u043D\u043E\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0435",
    level: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C",
    scoreSummary: "\u041E\u0431\u0437\u043E\u0440 \u0431\u0430\u043B\u043B\u043E\u0432",
    minimumScores: "\u0422\u0440\u0435\u0431\u0443\u0435\u043C\u044B\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0435 \u0431\u0430\u043B\u043B\u044B",
    emptyStateText: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0431\u0430\u043B\u043B\u044B \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.",
  },
};

export default function IELTSCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const getInterpretation = interpretationsTranslations[lang];
  const requirements = requirementsTranslations[lang];

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
  }, [scores, getInterpretation]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=education" },
        { label: pt.breadcrumbTitle },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
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
              <option value="">{pt.selectBand}</option>
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
            <p className="text-sm font-medium text-blue-200 mb-1">{pt.overallBandScore}</p>
            <p className="text-6xl font-bold mb-2">{result.overall.toFixed(1)}</p>
            <p className="text-sm text-blue-200">{pt.exactAverage}: {result.avg}</p>
          </div>

          {/* Interpretation */}
          <div className={`rounded-xl border p-5 ${result.interpretation.color}`}>
            <p className="font-semibold text-lg mb-1">{pt.level}: {result.interpretation.level}</p>
            <p className="text-sm">{result.interpretation.description}</p>
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
                </div>
              ))}
            </div>
          </div>

          {/* Common Requirements */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-3">{"\u{1F4CC}"} {pt.minimumScores}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700">
              {requirements.map((req) => (
                <div key={req.label} className="flex justify-between">
                  <span>{req.label}</span>
                  <span className="font-semibold">{req.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">{"\u{1F4DD}"}</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
