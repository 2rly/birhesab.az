"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface KsqEntry {
  id: number;
  value: string; // bal (0-100)
}

interface SemesterState {
  ksq: KsqEntry[];
  bsq: string; // bal (0-100)
}

const pageTranslations: Record<Lang, {
  title: string;
  description: string;
  breadcrumbCategory: string;
  breadcrumbLabel: string;
  formulaTitle: string;
  formulaContent: string;
  semester1: string;
  semester2: string;
  ksqLabel: string;
  bsqLabel: string;
  addKsq: string;
  pointsPlaceholder: string;
  gradeFromScore: string;
  scoreSuffix: string;
  semesterGrade: string;
  annualGrade: string;
  y1: string;
  y2: string;
  rawScore: string;
  rounded: string;
  emptyState: string;
  includeSemester2: string;
  ksqNote: string;
  levelExcellent: string;
  levelGood: string;
  levelSatisfactory: string;
  levelUnsatisfactory: string;
  levelFail: string;
  gradeLabel: string;
  invalidScore: string;
  scoreToGradeTable: string;
}> = {
  az: {
    title: "KSQ / BSQ qiymət hesablayıcısı",
    description: "Məktəbdaxili qiymətləndirmə — KSQ və BSQ balları əsasında yarımillik və illik qiymət hesablayın.",
    breadcrumbCategory: "Təhsil",
    breadcrumbLabel: "KSQ / BSQ qiymət",
    formulaTitle: "Bal → qiymət → yarımillik və illik qiymət",
    formulaContent: `Addım 1 — Bal → Qiymət (1–5):
• 0–10% → 1
• 10–20% → 2
• 20–50% → 3
• 50–80% → 4
• 80–100% → 5

Addım 2 — Yarımillik qiymət:
Y = (ksq₁ + ksq₂ + ... + ksqₙ) ÷ n × (40 / 100) + BSQ × (60 / 100)

Addım 3 — İllik qiymət:
I = (Y1 + Y2) ÷ 2

Nümunə: KSQ balları 45, 70, 65 → qiymətlər 3, 4, 4. BSQ balı 55 → qiymət 4.
Y = (3+4+4)/3 × 0.40 + 4 × 0.60 = 1.466 + 2.40 = 3.87 ≈ 4

Mənbə: "Ümumtəhsil məktəblərində məktəbdaxili qiymətləndirmənin aparılması Qaydaları", bəndlər 14, 15, 17.`,
    semester1: "I yarımil",
    semester2: "II yarımil",
    ksqLabel: "KSQ balları (%)",
    bsqLabel: "BSQ balı (%)",
    addKsq: "+ KSQ əlavə et",
    pointsPlaceholder: "bal",
    gradeFromScore: "qiymət",
    scoreSuffix: "%",
    semesterGrade: "Yarımillik qiymət",
    annualGrade: "İllik qiymət",
    y1: "Y1",
    y2: "Y2",
    rawScore: "Dəqiq nəticə",
    rounded: "Yuvarlaqlaşdırılmış",
    emptyState: "Nəticəni görmək üçün ən azı bir KSQ və BSQ balı daxil edin.",
    includeSemester2: "II yarımili də hesablayın",
    ksqNote: "Hər KSQ üçün düz cavabların faizini (0–100) daxil edin.",
    levelExcellent: "Əla",
    levelGood: "Yaxşı",
    levelSatisfactory: "Kafi",
    levelUnsatisfactory: "Qeyri-kafi",
    levelFail: "Qeyri-kafi (ən aşağı)",
    gradeLabel: "Qiymət",
    invalidScore: "Bal 0–100 aralığında olmalıdır.",
    scoreToGradeTable: "Bal → qiymət şkalası",
  },
  en: {
    title: "KSQ / BSQ Grade Calculator",
    description: "In-school assessment — calculate semester and annual grades from KSQ and BSQ scores.",
    breadcrumbCategory: "Education",
    breadcrumbLabel: "KSQ / BSQ grade",
    formulaTitle: "Score → grade → semester & annual grade",
    formulaContent: `Step 1 — Score → Grade (1–5):
• 0–10% → 1
• 10–20% → 2
• 20–50% → 3
• 50–80% → 4
• 80–100% → 5

Step 2 — Semester grade:
Y = (ksq₁ + ksq₂ + ... + ksqₙ) ÷ n × (40 / 100) + BSQ × (60 / 100)

Step 3 — Annual grade:
I = (Y1 + Y2) ÷ 2

Example: KSQ scores 45, 70, 65 → grades 3, 4, 4. BSQ score 55 → grade 4.
Y = (3+4+4)/3 × 0.40 + 4 × 0.60 = 1.466 + 2.40 = 3.87 ≈ 4

Source: "Rules on in-school assessment in general education schools", items 14, 15, 17.`,
    semester1: "Semester I",
    semester2: "Semester II",
    ksqLabel: "KSQ scores (%)",
    bsqLabel: "BSQ score (%)",
    addKsq: "+ Add KSQ",
    pointsPlaceholder: "score",
    gradeFromScore: "grade",
    scoreSuffix: "%",
    semesterGrade: "Semester grade",
    annualGrade: "Annual grade",
    y1: "Y1",
    y2: "Y2",
    rawScore: "Exact result",
    rounded: "Rounded",
    emptyState: "Enter at least one KSQ and a BSQ score to see the result.",
    includeSemester2: "Calculate Semester II too",
    ksqNote: "For each KSQ, enter the percentage of correct answers (0–100).",
    levelExcellent: "Excellent",
    levelGood: "Good",
    levelSatisfactory: "Satisfactory",
    levelUnsatisfactory: "Unsatisfactory",
    levelFail: "Lowest (unsatisfactory)",
    gradeLabel: "Grade",
    invalidScore: "Score must be between 0 and 100.",
    scoreToGradeTable: "Score → grade scale",
  },
  ru: {
    title: "Калькулятор оценок МСО / БСО",
    description: "Внутришкольное оценивание — рассчитайте полугодовую и годовую оценки из баллов МСО / БСО.",
    breadcrumbCategory: "Образование",
    breadcrumbLabel: "Оценка МСО / БСО",
    formulaTitle: "Балл → оценка → полугодовая и годовая оценка",
    formulaContent: `Шаг 1 — Балл → Оценка (1–5):
• 0–10% → 1
• 10–20% → 2
• 20–50% → 3
• 50–80% → 4
• 80–100% → 5

Шаг 2 — Полугодовая оценка:
Y = (ksq₁ + ksq₂ + ... + ksqₙ) ÷ n × (40 / 100) + BSQ × (60 / 100)

Шаг 3 — Годовая оценка:
I = (Y1 + Y2) ÷ 2

Пример: баллы МСО 45, 70, 65 → оценки 3, 4, 4. Балл БСО 55 → оценка 4.
Y = (3+4+4)/3 × 0.40 + 4 × 0.60 = 1.466 + 2.40 = 3.87 ≈ 4

Источник: «Правила проведения внутришкольного оценивания в общеобразовательных школах», пункты 14, 15, 17.`,
    semester1: "I полугодие",
    semester2: "II полугодие",
    ksqLabel: "Баллы МСО (%)",
    bsqLabel: "Балл БСО (%)",
    addKsq: "+ Добавить МСО",
    pointsPlaceholder: "балл",
    gradeFromScore: "оценка",
    scoreSuffix: "%",
    semesterGrade: "Полугодовая оценка",
    annualGrade: "Годовая оценка",
    y1: "Y1",
    y2: "Y2",
    rawScore: "Точный результат",
    rounded: "Округлённо",
    emptyState: "Введите хотя бы один балл МСО и балл БСО, чтобы увидеть результат.",
    includeSemester2: "Посчитать и II полугодие",
    ksqNote: "Для каждого МСО укажите процент правильных ответов (0–100).",
    levelExcellent: "Отлично",
    levelGood: "Хорошо",
    levelSatisfactory: "Удовл.",
    levelUnsatisfactory: "Неудовл.",
    levelFail: "Самый низкий (неудовл.)",
    gradeLabel: "Оценка",
    invalidScore: "Балл должен быть от 0 до 100.",
    scoreToGradeTable: "Шкала балл → оценка",
  },
};

let nextId = 1;

// Bal (%) → Qiymət (1-5) — madde 17 əsasında
function scoreToGrade(pct: number): number {
  if (pct < 10) return 1;
  if (pct < 20) return 2;
  if (pct < 50) return 3;
  if (pct < 80) return 4;
  return 5;
}

function parseScore(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(",", "."));
  if (Number.isNaN(n) || n < 0 || n > 100) return null;
  return n;
}

const gradeBadgeColor = (g: number): string => {
  if (g >= 5) return "bg-green-100 text-green-800 border-green-300";
  if (g >= 4) return "bg-blue-100 text-blue-800 border-blue-300";
  if (g >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (g >= 2) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
};

const gradeColor = (g: number): string => {
  if (g >= 4.5) return "text-green-700 bg-green-50 border-green-200";
  if (g >= 3.5) return "text-blue-700 bg-blue-50 border-blue-200";
  if (g >= 2.5) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  if (g >= 1.5) return "text-orange-700 bg-orange-50 border-orange-200";
  return "text-red-700 bg-red-50 border-red-200";
};

const levelOf = (g: number, pt: (typeof pageTranslations)["az"]): string => {
  if (g >= 4.5) return pt.levelExcellent;
  if (g >= 3.5) return pt.levelGood;
  if (g >= 2.5) return pt.levelSatisfactory;
  if (g >= 1.5) return pt.levelUnsatisfactory;
  return pt.levelFail;
};

function semesterGrade(ksqGrades: number[], bsqGrade: number | null): number | null {
  if (ksqGrades.length === 0 || bsqGrade === null) return null;
  const ksqAvg = ksqGrades.reduce((a, b) => a + b, 0) / ksqGrades.length;
  return 0.4 * ksqAvg + 0.6 * bsqGrade;
}

function ScoreInput({
  value,
  onChange,
  placeholder,
  scoreSuffix,
  gradeLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  scoreSuffix: string;
  gradeLabel: string;
}) {
  const parsed = parseScore(value);
  const grade = parsed !== null ? scoreToGrade(parsed) : null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">
          {scoreSuffix}
        </span>
      </div>
      <div className="shrink-0 w-20 sm:w-24">
        {grade !== null ? (
          <div className={`text-center py-2 px-2 rounded-lg border text-sm font-bold ${gradeBadgeColor(grade)}`}>
            {gradeLabel} {grade}
          </div>
        ) : (
          <div className="text-center py-2 px-2 rounded-lg border border-dashed border-border text-xs text-muted">
            —
          </div>
        )}
      </div>
    </div>
  );
}

function SemesterForm({
  title,
  state,
  setState,
  pt,
}: {
  title: string;
  state: SemesterState;
  setState: (s: SemesterState) => void;
  pt: (typeof pageTranslations)["az"];
}) {
  const updateKsq = (id: number, value: string) => {
    setState({
      ...state,
      ksq: state.ksq.map((k) => (k.id === id ? { ...k, value } : k)),
    });
  };

  const addKsq = () => {
    setState({ ...state, ksq: [...state.ksq, { id: nextId++, value: "" }] });
  };

  const removeKsq = (id: number) => {
    setState({ ...state, ksq: state.ksq.filter((k) => k.id !== id) });
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <span>📘</span> {title}
      </h3>

      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-1">{pt.ksqLabel}</label>
        <p className="text-[11px] text-muted mb-3">{pt.ksqNote}</p>
        <div className="space-y-2">
          {state.ksq.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-2">
              <span className="w-10 text-sm text-muted shrink-0">KSQ{index + 1}</span>
              <div className="flex-1">
                <ScoreInput
                  value={entry.value}
                  onChange={(v) => updateKsq(entry.id, v)}
                  placeholder={pt.pointsPlaceholder}
                  scoreSuffix={pt.scoreSuffix}
                  gradeLabel={pt.gradeFromScore}
                />
              </div>
              {state.ksq.length > 1 && (
                <button
                  onClick={() => removeKsq(entry.id)}
                  aria-label="Sil"
                  className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addKsq}
          className="mt-3 w-full py-2 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors text-sm font-medium"
        >
          {pt.addKsq}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{pt.bsqLabel}</label>
        <ScoreInput
          value={state.bsq}
          onChange={(v) => setState({ ...state, bsq: v })}
          placeholder={pt.pointsPlaceholder}
          scoreSuffix={pt.scoreSuffix}
          gradeLabel={pt.gradeFromScore}
        />
      </div>
    </div>
  );
}

export default function KsqBsqCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [sem1, setSem1] = useState<SemesterState>({
    ksq: [{ id: nextId++, value: "" }, { id: nextId++, value: "" }, { id: nextId++, value: "" }],
    bsq: "",
  });
  const [sem2, setSem2] = useState<SemesterState>({
    ksq: [{ id: nextId++, value: "" }, { id: nextId++, value: "" }, { id: nextId++, value: "" }],
    bsq: "",
  });
  const [includeSem2, setIncludeSem2] = useState(false);

  const result = useMemo(() => {
    const sem1Ksq = sem1.ksq.map((k) => parseScore(k.value)).filter((n): n is number => n !== null).map(scoreToGrade);
    const sem1Bsq = (() => {
      const n = parseScore(sem1.bsq);
      return n !== null ? scoreToGrade(n) : null;
    })();
    const y1 = semesterGrade(sem1Ksq, sem1Bsq);

    const sem2Ksq = sem2.ksq.map((k) => parseScore(k.value)).filter((n): n is number => n !== null).map(scoreToGrade);
    const sem2Bsq = (() => {
      const n = parseScore(sem2.bsq);
      return n !== null ? scoreToGrade(n) : null;
    })();
    const y2 = includeSem2 ? semesterGrade(sem2Ksq, sem2Bsq) : null;

    const y1Rounded = y1 !== null ? Math.round(y1) : null;
    const y2Rounded = y2 !== null ? Math.round(y2) : null;

    let annual: number | null = null;
    let annualRounded: number | null = null;
    if (y1Rounded !== null && y2Rounded !== null) {
      annual = (y1Rounded + y2Rounded) / 2;
      annualRounded = Math.round(annual);
    }

    return {
      y1, y2, y1Rounded, y2Rounded, annual, annualRounded,
      sem1Ksq, sem1Bsq, sem2Ksq, sem2Bsq,
    };
  }, [sem1, sem2, includeSem2]);

  const hasAny = result.y1 !== null || result.y2 !== null;

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
      relatedIds={["school-grade", "uomg", "gpa"]}
    >
      {/* Score → Grade reference */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-900 mb-2">{pt.scoreToGradeTable}</p>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-white rounded-lg py-2 border border-blue-200">
            <div className="font-semibold text-red-700">0–10%</div>
            <div className="text-red-700 font-bold">1</div>
          </div>
          <div className="bg-white rounded-lg py-2 border border-blue-200">
            <div className="font-semibold text-orange-700">10–20%</div>
            <div className="text-orange-700 font-bold">2</div>
          </div>
          <div className="bg-white rounded-lg py-2 border border-blue-200">
            <div className="font-semibold text-yellow-700">20–50%</div>
            <div className="text-yellow-700 font-bold">3</div>
          </div>
          <div className="bg-white rounded-lg py-2 border border-blue-200">
            <div className="font-semibold text-blue-700">50–80%</div>
            <div className="text-blue-700 font-bold">4</div>
          </div>
          <div className="bg-white rounded-lg py-2 border border-blue-200">
            <div className="font-semibold text-green-700">80–100%</div>
            <div className="text-green-700 font-bold">5</div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <SemesterForm title={pt.semester1} state={sem1} setState={setSem1} pt={pt} />

        <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/40 transition-colors">
          <input
            type="checkbox"
            checked={includeSem2}
            onChange={(e) => setIncludeSem2(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-sm font-medium text-foreground">{pt.includeSemester2}</span>
        </label>

        {includeSem2 && (
          <SemesterForm title={pt.semester2} state={sem2} setState={setSem2} pt={pt} />
        )}
      </div>

      <div className="mt-8">
        {hasAny ? (
          <div className="space-y-4">
            {result.y1 !== null && (
              <div className={`rounded-2xl border p-6 ${gradeColor(result.y1Rounded!)}`}>
                <p className="text-sm font-medium mb-1">
                  {pt.y1} — {pt.semesterGrade} ({pt.semester1})
                </p>
                <p className="text-5xl font-bold mb-1">{result.y1Rounded}</p>
                <p className="text-xs opacity-80">
                  KSQ: [{result.sem1Ksq.join(", ")}], BSQ: {result.sem1Bsq} — {pt.rawScore}: {result.y1.toFixed(2)} → {pt.rounded}: {result.y1Rounded} ({levelOf(result.y1Rounded!, pt)})
                </p>
              </div>
            )}

            {result.y2 !== null && (
              <div className={`rounded-2xl border p-6 ${gradeColor(result.y2Rounded!)}`}>
                <p className="text-sm font-medium mb-1">
                  {pt.y2} — {pt.semesterGrade} ({pt.semester2})
                </p>
                <p className="text-5xl font-bold mb-1">{result.y2Rounded}</p>
                <p className="text-xs opacity-80">
                  KSQ: [{result.sem2Ksq.join(", ")}], BSQ: {result.sem2Bsq} — {pt.rawScore}: {result.y2.toFixed(2)} → {pt.rounded}: {result.y2Rounded} ({levelOf(result.y2Rounded!, pt)})
                </p>
              </div>
            )}

            {result.annual !== null && (
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
                <p className="text-sm font-medium text-blue-200 mb-1">{pt.annualGrade}</p>
                <p className="text-6xl font-bold mb-2">{result.annualRounded}</p>
                <p className="text-xs text-blue-200">
                  ({result.y1Rounded} + {result.y2Rounded}) ÷ 2 = {result.annual.toFixed(2)} → {result.annualRounded} ({levelOf(result.annualRounded!, pt)})
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            <span className="text-4xl block mb-3">📝</span>
            <p>{pt.emptyState}</p>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
