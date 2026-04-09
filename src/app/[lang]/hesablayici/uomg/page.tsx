"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// ============================================================
// ÜOMG (Ümumi Orta Müvəffəqiyyət Göstəricisi) hesablayıcısı
// 4 kurs × 2 semestr = 8 semestr üzrə fənn balları və kreditlər.
// Hər semestr / kurs / ümumi üçün çəkili ortalama hesablanır.
// Hərf qiymətləndirmə (UNEC, BDU və s. ümumi sistem):
//   91–100 → A, 81–90 → B, 71–80 → C, 61–70 → D, 51–60 → E, <51 → F
// ============================================================

interface Course {
  id: number;
  name: string;
  score: string;
  credits: string;
}

type SemKey = "1A" | "1B" | "2A" | "2B" | "3A" | "3B" | "4A" | "4B";

const SEMESTERS: { key: SemKey; kurs: 1 | 2 | 3 | 4; semester: 1 | 2 }[] = [
  { key: "1A", kurs: 1, semester: 1 }, { key: "1B", kurs: 1, semester: 2 },
  { key: "2A", kurs: 2, semester: 1 }, { key: "2B", kurs: 2, semester: 2 },
  { key: "3A", kurs: 3, semester: 1 }, { key: "3B", kurs: 3, semester: 2 },
  { key: "4A", kurs: 4, semester: 1 }, { key: "4B", kurs: 4, semester: 2 },
];

function scoreToLetter(score: number): { letter: string; color: string; bg: string; label: string } {
  if (score >= 91) return { letter: "A", color: "text-green-700", bg: "bg-green-50 border-green-300", label: "Əla" };
  if (score >= 81) return { letter: "B", color: "text-blue-700", bg: "bg-blue-50 border-blue-300", label: "Çox yaxşı" };
  if (score >= 71) return { letter: "C", color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-300", label: "Yaxşı" };
  if (score >= 61) return { letter: "D", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-300", label: "Kafi" };
  if (score >= 51) return { letter: "E", color: "text-orange-700", bg: "bg-orange-50 border-orange-300", label: "Qənaətbəxş" };
  return { letter: "F", color: "text-red-700", bg: "bg-red-50 border-red-300", label: "Qeyri-kafi" };
}

function fmt(n: number): string {
  return n.toFixed(2);
}

function weighted(courses: Course[]): { avg: number; totalCredits: number; valid: boolean } {
  let sumWeighted = 0;
  let sumCredits = 0;
  for (const c of courses) {
    const s = parseFloat(c.score);
    const cr = parseFloat(c.credits);
    if (!isNaN(s) && !isNaN(cr) && cr > 0 && s >= 0 && s <= 100) {
      sumWeighted += s * cr;
      sumCredits += cr;
    }
  }
  return { avg: sumCredits > 0 ? sumWeighted / sumCredits : 0, totalCredits: sumCredits, valid: sumCredits > 0 };
}

const pageTranslations = {
  az: {
    title: "ÜOMG Hesablayıcısı",
    description: "Ümumi orta müvəffəqiyyət göstəricisi — semestr, kurs və 4 illik üzrə çəkili ortalama hesablayıcısı.",
    breadcrumbCategory: "Təhsil",
    breadcrumbLabel: "ÜOMG hesablayıcısı",
    formulaTitle: "ÜOMG necə hesablanır?",
    formulaContent: `ÜOMG = Σ(Fənn balı × Kredit) ÷ Σ(Kredit)

Hərf qiymətləndirməsi:
• 91–100 → A (Əla)
• 81–90 → B (Çox yaxşı)
• 71–80 → C (Yaxşı)
• 61–70 → D (Kafi)
• 51–60 → E (Qənaətbəxş)
• 0–50 → F (Qeyri-kafi)

Hesablama səviyyələri:
1. Semestr ÜOMG — bir semestrin fənləri üzrə çəkili ortalama
2. Kurs ÜOMG — kursun hər iki semestri üçün birgə çəkili ortalama
3. Ümumi ÜOMG — bütün 4 il (8 semestr) üzrə çəkili ortalama

Misal: Riyaziyyat (95 bal, 5 kr) + Fizika (82 bal, 4 kr)
ÜOMG = (95×5 + 82×4) ÷ (5+4) = 803 ÷ 9 = 89.22 (B)`,
    selectKurs: "Kurs seçin",
    kurs: "Kurs",
    firstSemester: "I semestr",
    secondSemester: "II semestr",
    courseName: "Fənn adı",
    courseNamePlaceholder: "Fənnin adı",
    score: "Bal",
    credit: "Kredit",
    addCourse: "+ Fənn əlavə et",
    semesterUOMG: "Semestr ÜOMG",
    kursUOMG: "Kurs ÜOMG",
    overallUOMG: "Ümumi ÜOMG",
    totalCredits: "Cəm kredit",
    summary: "4 illik xülasə",
    noCourses: "Bu semestrdə fənn yoxdur",
    letter: "Hərf",
    overall4year: "4 illik (8 semestr) üzrə ümumi",
    deleteCourse: "Sil",
  },
  en: {
    title: "ÜOMG Calculator",
    description: "General Average Achievement Indicator — weighted average calculator for semester, year, and 4-year totals.",
    breadcrumbCategory: "Education",
    breadcrumbLabel: "ÜOMG calculator",
    formulaTitle: "How is ÜOMG calculated?",
    formulaContent: `ÜOMG = Σ(Course score × Credits) ÷ Σ(Credits)

Letter grading:
• 91–100 → A (Excellent)
• 81–90 → B (Very good)
• 71–80 → C (Good)
• 61–70 → D (Satisfactory)
• 51–60 → E (Pass)
• 0–50 → F (Fail)

Calculation levels:
1. Semester ÜOMG — weighted average for one semester
2. Year ÜOMG — combined weighted average for both semesters of a year
3. Overall ÜOMG — weighted average for all 4 years (8 semesters)`,
    selectKurs: "Select year",
    kurs: "Year",
    firstSemester: "1st semester",
    secondSemester: "2nd semester",
    courseName: "Course name",
    courseNamePlaceholder: "Course name",
    score: "Score",
    credit: "Credit",
    addCourse: "+ Add course",
    semesterUOMG: "Semester ÜOMG",
    kursUOMG: "Year ÜOMG",
    overallUOMG: "Overall ÜOMG",
    totalCredits: "Total credits",
    summary: "4-year summary",
    noCourses: "No courses in this semester",
    letter: "Letter",
    overall4year: "Overall across 4 years (8 semesters)",
    deleteCourse: "Delete",
  },
  ru: {
    title: "Калькулятор ÜOMG",
    description: "Общий показатель средней успеваемости — взвешенный средний балл по семестру, курсу и за 4 года.",
    breadcrumbCategory: "Образование",
    breadcrumbLabel: "Калькулятор ÜOMG",
    formulaTitle: "Как рассчитывается ÜOMG?",
    formulaContent: `ÜOMG = Σ(Балл предмета × Кредиты) ÷ Σ(Кредиты)

Буквенная оценка:
• 91–100 → A (Отлично)
• 81–90 → B (Очень хорошо)
• 71–80 → C (Хорошо)
• 61–70 → D (Удовлетворительно)
• 51–60 → E (Зачёт)
• 0–50 → F (Неудовлетворительно)

Уровни расчёта:
1. ÜOMG семестра — взвешенный средний за один семестр
2. ÜOMG курса — общий взвешенный средний за два семестра курса
3. Общий ÜOMG — взвешенный средний за все 4 года (8 семестров)`,
    selectKurs: "Выберите курс",
    kurs: "Курс",
    firstSemester: "I семестр",
    secondSemester: "II семестр",
    courseName: "Название предмета",
    courseNamePlaceholder: "Название предмета",
    score: "Балл",
    credit: "Кредит",
    addCourse: "+ Добавить предмет",
    semesterUOMG: "ÜOMG семестра",
    kursUOMG: "ÜOMG курса",
    overallUOMG: "Общий ÜOMG",
    totalCredits: "Сумма кредитов",
    summary: "Итоги за 4 года",
    noCourses: "Нет предметов в этом семестре",
    letter: "Буква",
    overall4year: "Общий за 4 года (8 семестров)",
    deleteCourse: "Удалить",
  },
};

let nextId = 1;
const newCourse = (): Course => ({ id: nextId++, name: "", score: "", credits: "" });

export default function UOMGCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [activeKurs, setActiveKurs] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<Record<SemKey, Course[]>>(() => {
    const init: Record<string, Course[]> = {};
    for (const s of SEMESTERS) init[s.key] = [newCourse(), newCourse(), newCourse()];
    return init as Record<SemKey, Course[]>;
  });

  const update = (sem: SemKey, idx: number, field: keyof Course, value: string) => {
    setData((prev) => {
      const next = { ...prev };
      const arr = [...next[sem]];
      arr[idx] = { ...arr[idx], [field]: value };
      next[sem] = arr;
      return next;
    });
  };

  const addCourse = (sem: SemKey) => {
    setData((prev) => ({ ...prev, [sem]: [...prev[sem], newCourse()] }));
  };

  const removeCourse = (sem: SemKey, id: number) => {
    setData((prev) => ({ ...prev, [sem]: prev[sem].filter((c) => c.id !== id) }));
  };

  // Per-semester results
  const semesterResults = useMemo(() => {
    const map: Record<SemKey, ReturnType<typeof weighted>> = {} as Record<SemKey, ReturnType<typeof weighted>>;
    for (const s of SEMESTERS) map[s.key] = weighted(data[s.key]);
    return map;
  }, [data]);

  // Per-kurs results (combine both semesters)
  const kursResults = useMemo(() => {
    const map: Record<1 | 2 | 3 | 4, { avg: number; totalCredits: number; valid: boolean }> = {} as Record<1 | 2 | 3 | 4, { avg: number; totalCredits: number; valid: boolean }>;
    for (const k of [1, 2, 3, 4] as const) {
      const all = [...data[`${k}A` as SemKey], ...data[`${k}B` as SemKey]];
      map[k] = weighted(all);
    }
    return map;
  }, [data]);

  // Overall (4 years)
  const overall = useMemo(() => {
    const all: Course[] = [];
    for (const s of SEMESTERS) all.push(...data[s.key]);
    return weighted(all);
  }, [data]);

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  const semKey1: SemKey = `${activeKurs}A` as SemKey;
  const semKey2: SemKey = `${activeKurs}B` as SemKey;

  const renderSemester = (semKey: SemKey, label: string) => {
    const courses = data[semKey];
    const r = semesterResults[semKey];
    const lt = r.valid ? scoreToLetter(r.avg) : null;
    return (
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-border flex justify-between items-center">
          <h3 className="font-semibold text-foreground">{label}</h3>
          {lt && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${lt.bg} ${lt.color}`}>
              {fmt(r.avg)} · {lt.letter}
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          {courses.length === 0 ? (
            <p className="text-xs text-muted text-center py-2">{pt.noCourses}</p>
          ) : (
            courses.map((c, i) => (
              <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => update(semKey, i, "name", e.target.value)}
                  placeholder={pt.courseNamePlaceholder}
                  className={`col-span-6 ${inputCls}`}
                />
                <input
                  type="number"
                  value={c.score}
                  onChange={(e) => update(semKey, i, "score", e.target.value)}
                  placeholder={pt.score}
                  min="0"
                  max="100"
                  className={`col-span-3 ${inputCls}`}
                />
                <input
                  type="number"
                  value={c.credits}
                  onChange={(e) => update(semKey, i, "credits", e.target.value)}
                  placeholder={pt.credit}
                  min="0"
                  step="0.5"
                  className={`col-span-2 ${inputCls}`}
                />
                <button
                  onClick={() => removeCourse(semKey, c.id)}
                  className="col-span-1 text-red-500 hover:text-red-700 text-lg"
                  title={pt.deleteCourse}
                  aria-label={pt.deleteCourse}
                >
                  ×
                </button>
              </div>
            ))
          )}
          <button
            onClick={() => addCourse(semKey)}
            className="w-full mt-2 px-3 py-2 rounded-lg border border-dashed border-primary/40 text-primary text-xs font-medium hover:bg-primary/5 transition-colors"
          >
            {pt.addCourse}
          </button>
          {r.valid && (
            <div className="text-xs text-muted pt-2 border-t border-border">
              {pt.totalCredits}: <span className="font-semibold text-foreground">{r.totalCredits}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const kursR = kursResults[activeKurs];
  const kursLt = kursR.valid ? scoreToLetter(kursR.avg) : null;
  const overallLt = overall.valid ? scoreToLetter(overall.avg) : null;

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
      relatedIds={["gpa", "school-grade", "ielts", "sat"]}
    >
      {/* Kurs seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.selectKurs}</label>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as const).map((k) => (
            <button
              key={k}
              onClick={() => setActiveKurs(k)}
              className={`p-3 rounded-xl border text-center transition-all text-sm font-semibold ${
                activeKurs === k
                  ? "border-primary bg-primary/5 ring-2 ring-primary text-primary"
                  : "border-border bg-white hover:border-primary/30 text-foreground"
              }`}
            >
              {k}-ci {pt.kurs}
            </button>
          ))}
        </div>
      </div>

      {/* Aktiv kursun iki semestri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {renderSemester(semKey1, pt.firstSemester)}
        {renderSemester(semKey2, pt.secondSemester)}
      </div>

      {/* Aktiv kurs ÜOMG */}
      {kursR.valid && kursLt && (
        <div className={`rounded-2xl border-2 p-5 mb-6 ${kursLt.bg}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">{activeKurs}-ci {pt.kurs} {pt.kursUOMG}</p>
              <p className={`text-3xl font-bold ${kursLt.color}`}>{fmt(kursR.avg)}</p>
              <p className="text-xs text-muted mt-1">{pt.totalCredits}: {kursR.totalCredits}</p>
            </div>
            <div className={`text-right ${kursLt.color}`}>
              <p className="text-5xl font-bold">{kursLt.letter}</p>
              <p className="text-xs">{kursLt.label}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4 illik xülasə */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span>📊</span> {pt.summary}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {([1, 2, 3, 4] as const).map((k) => {
            const r = kursResults[k];
            const lt = r.valid ? scoreToLetter(r.avg) : null;
            return (
              <div key={k} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">{k}-ci {pt.kurs}</p>
                  <p className="text-xs text-muted">{pt.totalCredits}: {r.totalCredits}</p>
                </div>
                {lt ? (
                  <div className="text-right flex items-center gap-3">
                    <span className="text-lg font-bold text-foreground">{fmt(r.avg)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${lt.bg} ${lt.color}`}>
                      {lt.letter}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </div>
            );
          })}
        </div>
        {overall.valid && overallLt && (
          <div className={`px-5 py-4 ${overallLt.bg} border-t-2`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">{pt.overallUOMG}</p>
                <p className="text-xs text-muted">{pt.overall4year}</p>
                <p className="text-xs text-muted mt-1">{pt.totalCredits}: {overall.totalCredits}</p>
              </div>
              <div className={`text-right ${overallLt.color}`}>
                <p className="text-4xl font-bold">{fmt(overall.avg)}</p>
                <p className="text-2xl font-bold">{overallLt.letter}</p>
                <p className="text-xs">{overallLt.label}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
