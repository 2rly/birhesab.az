"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type CountryId = "usa" | "uk" | "germany" | "turkey" | "russia";
type ExamType = "ielts" | "toefl";

interface Country {
  id: CountryId;
  name: Record<Lang, string>;
  icon: string;
  minGPA: number;
  goodGPA: number;
  minIELTS: number;
  goodIELTS: number;
  minTOEFL: number;
  goodTOEFL: number;
  notes: Record<Lang, string>;
  tuitionRange: string;
}

const countries: Country[] = [
  {
    id: "usa",
    name: { az: "ABŞ", en: "USA", ru: "США" },
    icon: "🇺🇸",
    minGPA: 3.0,
    goodGPA: 3.5,
    minIELTS: 6.5,
    goodIELTS: 7.5,
    minTOEFL: 80,
    goodTOEFL: 100,
    notes: {
      az: "SAT/GRE tələb oluna bilər. Təqaüd imkanları geniş.",
      en: "SAT/GRE may be required. Scholarship opportunities are wide.",
      ru: "Может потребоваться SAT/GRE. Широкие возможности стипендий.",
    },
    tuitionRange: "$20,000 – $60,000/il",
  },
  {
    id: "uk",
    name: { az: "Böyük Britaniya", en: "United Kingdom", ru: "Великобритания" },
    icon: "🇬🇧",
    minGPA: 2.8,
    goodGPA: 3.3,
    minIELTS: 6.0,
    goodIELTS: 7.0,
    minTOEFL: 75,
    goodTOEFL: 95,
    notes: {
      az: "Bakalavr 3 il, magistr 1 il. Chevening təqaüdü mövcuddur.",
      en: "Bachelor's 3 years, Master's 1 year. Chevening scholarship available.",
      ru: "Бакалавриат 3 года, магистратура 1 год. Стипендия Chevening доступна.",
    },
    tuitionRange: "£12,000 – £40,000/il",
  },
  {
    id: "germany",
    name: { az: "Almaniya", en: "Germany", ru: "Германия" },
    icon: "🇩🇪",
    minGPA: 2.5,
    goodGPA: 3.0,
    minIELTS: 6.0,
    goodIELTS: 6.5,
    minTOEFL: 75,
    goodTOEFL: 90,
    notes: {
      az: "Dövlət universitetlərində təhsil haqqı azdır. Alman dili bilmək üstünlükdür.",
      en: "Public universities have low tuition fees. Knowing German is an advantage.",
      ru: "В государственных вузах низкая плата за обучение. Знание немецкого — преимущество.",
    },
    tuitionRange: "€0 – €3,000/il",
  },
  {
    id: "turkey",
    name: { az: "Türkiyə", en: "Turkey", ru: "Турция" },
    icon: "🇹🇷",
    minGPA: 2.5,
    goodGPA: 3.0,
    minIELTS: 5.5,
    goodIELTS: 6.5,
    minTOEFL: 65,
    goodTOEFL: 80,
    notes: {
      az: "Türkiyə Bursları proqramı tam təqaüd verir. YÖS imtahanı tələb oluna bilər.",
      en: "Turkey Burslari program offers full scholarships. YOS exam may be required.",
      ru: "Программа Turkiye Burslari предоставляет полные стипендии. Может потребоваться экзамен YOS.",
    },
    tuitionRange: "₺5,000 – ₺80,000/il",
  },
  {
    id: "russia",
    name: { az: "Rusiya", en: "Russia", ru: "Россия" },
    icon: "🇷🇺",
    minGPA: 2.3,
    goodGPA: 3.0,
    minIELTS: 5.0,
    goodIELTS: 6.0,
    minTOEFL: 60,
    goodTOEFL: 75,
    notes: {
      az: "Rus dili bilmək böyük üstünlükdür. Dövlət kvotaları mövcuddur.",
      en: "Knowing Russian is a big advantage. Government quotas are available.",
      ru: "Знание русского языка — большое преимущество. Доступны государственные квоты.",
    },
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

const chanceLevelTranslations: Record<Lang, { high: string; medHigh: string; medium: string; low: string; veryLow: string }> = {
  az: { high: "Yüksək", medHigh: "Orta-yaxşı", medium: "Orta", low: "Aşağı", veryLow: "Çox aşağı" },
  en: { high: "High", medHigh: "Medium-High", medium: "Medium", low: "Low", veryLow: "Very Low" },
  ru: { high: "Высокий", medHigh: "Средне-высокий", medium: "Средний", low: "Низкий", veryLow: "Очень низкий" },
};

function getChanceLevel(chance: number, lang: Lang): { label: string; color: string } {
  const t = chanceLevelTranslations[lang];
  if (chance >= 75) return { label: t.high, color: "text-green-700 bg-green-50 border-green-200" };
  if (chance >= 50) return { label: t.medHigh, color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (chance >= 30) return { label: t.medium, color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  if (chance >= 15) return { label: t.low, color: "text-orange-700 bg-orange-50 border-orange-200" };
  return { label: t.veryLow, color: "text-red-700 bg-red-50 border-red-200" };
}

const pageTranslations = {
  az: {
    title: "Xaricdə Təhsil Şansı Hesablayıcısı",
    description: "GPA və IELTS/TOEFL balınızı daxil edin, ölkə seçin — xaricdə universitetə qəbul şansınızı təxmin edin.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Qəbul şansı necə hesablanır?",
    formulaContent: `Qəbul şansı GPA və dil imtahanı balına əsasən təxmin edilir.

Əsas faktorlar:
• GPA (4.0 şkalası) — akademik performans (50% çəki)
• IELTS/TOEFL balı — dil bilikləri (50% çəki)

Hər ölkənin minimum və yaxşı bal tələbləri fərqlidir.
Balınız minimum tələbdən yuxarı olduqca şans artır.

Qeyd: Bu təxmini hesablamadır. Real qəbul prosesində tövsiyə
məktubları, motivasiya məktubu, iş təcrübəsi, portfolyo və digər
amillər də nəzərə alınır.`,
    selectCountry: "Ölkə seçin",
    admissionChance: "qəbul şansınız",
    estimatedProbability: "Təxmini ehtimal",
    level: "Səviyyə",
    requirements: "tələblər",
    gpaRequirement: "GPA tələbi",
    minimum: "Minimum",
    good: "Yaxşı",
    yours: "Sizin",
    tuitionFee: "Təhsil haqqı",
    allCountriesComparison: "Bütün ölkələr üzrə müqayisə",
    selected: "Seçilmiş",
    note: "Bu təxmini hesablamadır. Hər universitetin öz tələbləri var. Real qəbul prosesində GPA və dil balından əlavə, tövsiyə məktubları, motivasiya məktubu, iş təcrübəsi, portfolyo, müsahibə və digər amillər nəzərə alınır. Dəqiq tələblər üçün hədəf universitetin rəsmi saytına müraciət edin.",
    noteLabel: "Diqqət:",
    emptyStateText: "Nəticəni görmək üçün GPA və dil imtahanı balını daxil edin.",
    examScoreLabel: "balı",
    requirementLabel: "tələbi",
  },
  en: {
    title: "Study Abroad Chance Calculator",
    description: "Enter your GPA and IELTS/TOEFL score, select a country — estimate your university admission chances.",
    breadcrumbCategory: "Education",
    formulaTitle: "How is admission chance calculated?",
    formulaContent: `Admission chance is estimated based on GPA and language exam score.

Key factors:
• GPA (4.0 scale) — academic performance (50% weight)
• IELTS/TOEFL score — language skills (50% weight)

Each country has different minimum and good score requirements.
The higher your score above the minimum, the greater your chances.

Note: This is an approximate calculation. In the actual admissions process,
recommendation letters, motivation letter, work experience, portfolio, and
other factors are also considered.`,
    selectCountry: "Select country",
    admissionChance: "your admission chance",
    estimatedProbability: "Estimated probability",
    level: "Level",
    requirements: "requirements",
    gpaRequirement: "GPA requirement",
    minimum: "Minimum",
    good: "Good",
    yours: "Yours",
    tuitionFee: "Tuition fee",
    allCountriesComparison: "Comparison across all countries",
    selected: "Selected",
    note: "This is an approximate calculation. Each university has its own requirements. In the actual admissions process, recommendation letters, motivation letter, work experience, portfolio, interview, and other factors are also considered. Refer to the target university's official website for exact requirements.",
    noteLabel: "Note:",
    emptyStateText: "Enter your GPA and language exam score to see the result.",
    examScoreLabel: "score",
    requirementLabel: "requirement",
  },
  ru: {
    title: "Калькулятор шансов на обучение за рубежом",
    description: "Введите GPA и балл IELTS/TOEFL, выберите страну — оцените свои шансы на поступление.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как рассчитывается шанс поступления?",
    formulaContent: `Шанс поступления оценивается на основе GPA и балла языкового экзамена.

Основные факторы:
• GPA (шкала 4.0) — академическая успеваемость (50% веса)
• Балл IELTS/TOEFL — языковые навыки (50% веса)

У каждой страны разные требования к минимальному и хорошему баллу.
Чем выше ваш балл превышает минимум, тем выше шансы.

Примечание: Это приблизительный расчёт. В реальном процессе поступления
также учитываются рекомендательные письма, мотивационное письмо, опыт работы,
портфолио и другие факторы.`,
    selectCountry: "Выберите страну",
    admissionChance: "ваш шанс на поступление",
    estimatedProbability: "Примерная вероятность",
    level: "Уровень",
    requirements: "требования",
    gpaRequirement: "Требование GPA",
    minimum: "Минимум",
    good: "Хороший",
    yours: "Ваш",
    tuitionFee: "Стоимость обучения",
    allCountriesComparison: "Сравнение по всем странам",
    selected: "Выбрано",
    note: "Это приблизительный расчёт. У каждого университета свои требования. В реальном процессе поступления, помимо GPA и языкового балла, учитываются рекомендательные и мотивационные письма, опыт работы, портфолио, собеседование и другие факторы. Для точных требований обращайтесь на сайт целевого университета.",
    noteLabel: "Внимание:",
    emptyStateText: "Введите GPA и балл языкового экзамена, чтобы увидеть результат.",
    examScoreLabel: "балл",
    requirementLabel: "требование",
  },
};

export default function XaricdeTehsilCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

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
    const chanceLevel = getChanceLevel(chance, lang);

    // Calculate for all countries
    const allCountries = countries.map((c) => ({
      ...c,
      chance: calculateChance(g, e, examType, c),
    })).sort((a, b) => b.chance - a.chance);

    return { chance, chanceLevel, country, allCountries, gpa: g, examScore: e };
  }, [gpa, examScore, examType, selectedCountry, lang]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=education" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["gpa", "ielts", "toefl", "university-admission"]}
    >
      {/* Country Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.selectCountry}</label>
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
              <p className="text-xs font-medium text-foreground">{c.name[lang]}</p>
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
            📝 {examType === "ielts" ? `IELTS ${pt.examScoreLabel} (0–9)` : `TOEFL ${pt.examScoreLabel} (0–120)`}
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
              {result.country.icon} {result.country.name[lang]} — {pt.admissionChance}
            </p>
            <p className="text-6xl font-bold mb-2">{result.chance}%</p>
            <p className="text-sm text-blue-200">{pt.estimatedProbability}</p>
          </div>

          {/* Chance Level */}
          <div className={`rounded-xl border p-5 ${result.chanceLevel.color}`}>
            <p className="font-semibold text-lg mb-1">{pt.level}: {result.chanceLevel.label}</p>
            <p className="text-sm">{result.country.notes[lang]}</p>
          </div>

          {/* Country Requirements */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">
              {result.country.icon} {result.country.name[lang]} — {pt.requirements}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">{pt.gpaRequirement}</p>
                <p className="text-sm">
                  {pt.minimum}: <span className="font-semibold">{result.country.minGPA}</span>
                  {" · "}
                  {pt.good}: <span className="font-semibold">{result.country.goodGPA}+</span>
                </p>
                <p className="text-xs mt-1">
                  {pt.yours}: <span className={`font-bold ${result.gpa >= result.country.goodGPA ? "text-green-600" : result.gpa >= result.country.minGPA ? "text-blue-600" : "text-red-600"}`}>{result.gpa.toFixed(2)}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{examType.toUpperCase()} {pt.requirementLabel}</p>
                <p className="text-sm">
                  {pt.minimum}: <span className="font-semibold">{examType === "ielts" ? result.country.minIELTS : result.country.minTOEFL}</span>
                  {" · "}
                  {pt.good}: <span className="font-semibold">{examType === "ielts" ? result.country.goodIELTS : result.country.goodTOEFL}+</span>
                </p>
                <p className="text-xs mt-1">
                  {pt.yours}: <span className={`font-bold ${
                    result.examScore >= (examType === "ielts" ? result.country.goodIELTS : result.country.goodTOEFL) ? "text-green-600" :
                    result.examScore >= (examType === "ielts" ? result.country.minIELTS : result.country.minTOEFL) ? "text-blue-600" : "text-red-600"
                  }`}>{result.examScore}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-muted">{pt.tuitionFee}: <span className="font-medium text-foreground">{result.country.tuitionRange}</span></p>
            </div>
          </div>

          {/* All Countries Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🌍</span>
                {pt.allCountriesComparison}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.allCountries.map((c) => {
                const level = getChanceLevel(c.chance, lang);
                const isActive = c.id === selectedCountry;
                return (
                  <div key={c.id} className={`px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{c.icon}</span>
                        <span className={`text-sm ${isActive ? "font-semibold" : ""} text-foreground`}>{c.name[lang]}</span>
                        {isActive && <span className="text-xs bg-foreground text-white px-1.5 py-0.5 rounded-full">{pt.selected}</span>}
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
              <span className="font-semibold">{pt.noteLabel}</span> {pt.note}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🌍</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
