"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface Subject {
  id: number;
  name: string;
  grade: string;
}

const gradeLabelsTranslations: Record<Lang, Record<string, { label: string; color: string; emoji: string }>> = {
  az: {
    "5": { label: "Əla", color: "text-green-700", emoji: "🌟" },
    "4": { label: "Yaxşı", color: "text-blue-700", emoji: "👍" },
    "3": { label: "Kafi", color: "text-yellow-700", emoji: "📝" },
    "2": { label: "Pis", color: "text-red-700", emoji: "⚠️" },
  },
  en: {
    "5": { label: "Excellent", color: "text-green-700", emoji: "🌟" },
    "4": { label: "Good", color: "text-blue-700", emoji: "👍" },
    "3": { label: "Satisfactory", color: "text-yellow-700", emoji: "📝" },
    "2": { label: "Poor", color: "text-red-700", emoji: "⚠️" },
  },
  ru: {
    "5": { label: "Отлично", color: "text-green-700", emoji: "🌟" },
    "4": { label: "Хорошо", color: "text-blue-700", emoji: "👍" },
    "3": { label: "Удовл.", color: "text-yellow-700", emoji: "📝" },
    "2": { label: "Плохо", color: "text-red-700", emoji: "⚠️" },
  },
};

const defaultSubjectsTranslations: Record<Lang, string[]> = {
  az: ["Riyaziyyat", "Azərbaycan dili", "Fizika", "Tarix", "Xarici dil"],
  en: ["Mathematics", "Azerbaijani language", "Physics", "History", "Foreign language"],
  ru: ["Математика", "Азербайджанский язык", "Физика", "История", "Иностранный язык"],
};

const pageTranslations = {
  az: {
    title: "Məktəb Qiymət Ortalaması Hesablayıcısı",
    description: "Fənlər üzrə qiymətlərinizi daxil edin — ortalama qiyməti və bölgünü hesablayın. Azərbaycan 2–5 qiymətləndirmə sistemi.",
    breadcrumbCategory: "Təhsil",
    breadcrumbLabel: "Məktəb qiymət ortalaması",
    formulaTitle: "Ortalama qiymət necə hesablanır?",
    formulaContent: `Ortalama qiymət = Bütün qiymətlərin cəmi ÷ Fənn sayı

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
• 2.0–2.4 — Qeyri-kafi`,
    subjectName: "Fənn adı",
    subjectNamePlaceholder: "Fənn adı",
    grade: "Qiymət (2–5)",
    selectGrade: "Seçin",
    gradeExcellent: "5 — Əla",
    gradeGood: "4 — Yaxşı",
    gradeSatisfactory: "3 — Kafi",
    gradePoor: "2 — Pis",
    addSubject: "+ Fənn əlavə et",
    averageGrade: "Ortalama qiymət",
    subjectsCount: "fənn üzrə",
    level: "Səviyyə",
    levelExcellent: "Əla",
    levelGood: "Yaxşı",
    levelSatisfactory: "Kafi",
    levelUnsatisfactory: "Qeyri-kafi",
    descExcellent: "Tələbə əla nəticə göstərir.",
    descGood: "Tələbə yaxşı səviyyədədir.",
    descSatisfactory: "Orta səviyyə — yaxşılaşdırma lazımdır.",
    descUnsatisfactory: "Nəticə zəifdir — ciddi hazırlıq lazımdır.",
    gradeDistribution: "Qiymət bölgüsü",
    subjectGrades: "Fənlər üzrə qiymətlər",
    subjectFallback: "Fənn",
    emptyState: "Nəticəni görmək üçün ən azı bir fənnin qiymətini seçin.",
  },
  en: {
    title: "School Grade Average Calculator",
    description: "Enter your grades by subject — calculate the average grade and distribution. Azerbaijan 2–5 grading system.",
    breadcrumbCategory: "Education",
    breadcrumbLabel: "School grade average",
    formulaTitle: "How is the average grade calculated?",
    formulaContent: `Average grade = Sum of all grades ÷ Number of subjects

Azerbaijan grading system:
• 5 — Excellent
• 4 — Good
• 3 — Satisfactory
• 2 — Poor (unsatisfactory)

Example: (5 + 4 + 5 + 3 + 4) ÷ 5 = 4.2 → Good

Levels:
• 4.5–5.0 — Excellent
• 3.5–4.4 — Good
• 2.5–3.4 — Satisfactory
• 2.0–2.4 — Unsatisfactory`,
    subjectName: "Subject name",
    subjectNamePlaceholder: "Subject name",
    grade: "Grade (2–5)",
    selectGrade: "Select",
    gradeExcellent: "5 — Excellent",
    gradeGood: "4 — Good",
    gradeSatisfactory: "3 — Satisfactory",
    gradePoor: "2 — Poor",
    addSubject: "+ Add subject",
    averageGrade: "Average grade",
    subjectsCount: "subjects",
    level: "Level",
    levelExcellent: "Excellent",
    levelGood: "Good",
    levelSatisfactory: "Satisfactory",
    levelUnsatisfactory: "Unsatisfactory",
    descExcellent: "The student demonstrates excellent results.",
    descGood: "The student is at a good level.",
    descSatisfactory: "Average level — improvement needed.",
    descUnsatisfactory: "Results are weak — serious preparation needed.",
    gradeDistribution: "Grade distribution",
    subjectGrades: "Grades by subject",
    subjectFallback: "Subject",
    emptyState: "Select at least one subject grade to see the result.",
  },
  ru: {
    title: "Калькулятор среднего балла в школе",
    description: "Введите оценки по предметам — рассчитайте средний балл и распределение. Система оценки Азербайджана 2–5.",
    breadcrumbCategory: "Образование",
    breadcrumbLabel: "Средний балл в школе",
    formulaTitle: "Как рассчитывается средний балл?",
    formulaContent: `Средний балл = Сумма всех оценок ÷ Количество предметов

Система оценивания Азербайджана:
• 5 — Отлично
• 4 — Хорошо
• 3 — Удовлетворительно
• 2 — Плохо (неудовлетворительно)

Пример: (5 + 4 + 5 + 3 + 4) ÷ 5 = 4.2 → Хорошо

Уровни:
• 4.5–5.0 — Отлично
• 3.5–4.4 — Хорошо
• 2.5–3.4 — Удовлетворительно
• 2.0–2.4 — Неудовлетворительно`,
    subjectName: "Название предмета",
    subjectNamePlaceholder: "Название предмета",
    grade: "Оценка (2–5)",
    selectGrade: "Выберите",
    gradeExcellent: "5 — Отлично",
    gradeGood: "4 — Хорошо",
    gradeSatisfactory: "3 — Удовл.",
    gradePoor: "2 — Плохо",
    addSubject: "+ Добавить предмет",
    averageGrade: "Средний балл",
    subjectsCount: "предметов",
    level: "Уровень",
    levelExcellent: "Отлично",
    levelGood: "Хорошо",
    levelSatisfactory: "Удовлетворительно",
    levelUnsatisfactory: "Неудовлетворительно",
    descExcellent: "Ученик показывает отличные результаты.",
    descGood: "Ученик на хорошем уровне.",
    descSatisfactory: "Средний уровень — требуется улучшение.",
    descUnsatisfactory: "Результаты слабые — требуется серьёзная подготовка.",
    gradeDistribution: "Распределение оценок",
    subjectGrades: "Оценки по предметам",
    subjectFallback: "Предмет",
    emptyState: "Выберите оценку хотя бы по одному предмету, чтобы увидеть результат.",
  },
};

let nextId = 1;

export default function MektebQiymetCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const gradeLabels = gradeLabelsTranslations[lang];
  const defaultSubjects = defaultSubjectsTranslations[lang];

  const [subjects, setSubjects] = useState<Subject[]>(() =>
    defaultSubjects.map((name) => ({ id: nextId++, name, grade: "" }))
  );

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

  const getAverageLevel = (avg: number): { level: string; description: string; color: string } => {
    if (avg >= 4.5) return { level: pt.levelExcellent, description: pt.descExcellent, color: "text-green-700 bg-green-50 border-green-200" };
    if (avg >= 3.5) return { level: pt.levelGood, description: pt.descGood, color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (avg >= 2.5) return { level: pt.levelSatisfactory, description: pt.descSatisfactory, color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    return { level: pt.levelUnsatisfactory, description: pt.descUnsatisfactory, color: "text-red-700 bg-red-50 border-red-200" };
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
  }, [subjects, pt]);

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
      relatedIds={["gpa", "university-admission", "ielts"]}
    >
      {/* Subjects */}
      <div className="space-y-3 mb-4">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6 sm:col-span-7">
              {index === 0 && <label className="block text-xs text-muted mb-1">{pt.subjectName}</label>}
              <input
                type="text"
                value={subject.name}
                onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                placeholder={pt.subjectNamePlaceholder}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div className="col-span-4 sm:col-span-4">
              {index === 0 && <label className="block text-xs text-muted mb-1">{pt.grade}</label>}
              <select
                value={subject.grade}
                onChange={(e) => updateSubject(subject.id, "grade", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
              >
                <option value="">{pt.selectGrade}</option>
                <option value="5">{pt.gradeExcellent}</option>
                <option value="4">{pt.gradeGood}</option>
                <option value="3">{pt.gradeSatisfactory}</option>
                <option value="2">{pt.gradePoor}</option>
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
        {pt.addSubject}
      </button>

      {/* Result */}
      {result ? (
        <div className="space-y-4">
          {/* Average */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
            <p className="text-sm font-medium text-blue-200 mb-1">{pt.averageGrade}</p>
            <p className="text-6xl font-bold mb-2">{result.avg.toFixed(2)}</p>
            <p className="text-sm text-blue-200">{result.count} {pt.subjectsCount}</p>
          </div>

          {/* Level */}
          <div className={`rounded-xl border p-5 ${result.level.color}`}>
            <p className="font-semibold text-lg mb-1">{pt.level}: {result.level.level}</p>
            <p className="text-sm">{result.level.description}</p>
          </div>

          {/* Distribution */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-foreground mb-3">{pt.gradeDistribution}</h4>
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
                {pt.subjectGrades}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.subjects.map((s) => {
                const info = gradeLabels[s.grade];
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-foreground">{s.name || pt.subjectFallback}</span>
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
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
