"use client";

import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// ── Types ──────────────────────────────────────────────────────────────────────

type ExamType = "buraxilis" | "blok";
type GradeLevel = "9" | "11";
type GroupId = "1rk" | "1ri" | "2" | "3dt" | "3tc" | "4" | "5";

interface GroupDef {
  id: GroupId;
  name: string;
  subjects: [string, number][]; // [subjectName, weightCoeff]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const GROUP_DEFS: GroupDef[] = [
  { id: "1rk", name: "I qrup (RK)", subjects: [["Riyaziyyat", 1.5], ["Fizika", 1.5], ["Kimya", 1]] },
  { id: "1ri", name: "I qrup (Rİ)", subjects: [["Riyaziyyat", 1.5], ["İnformatika", 1.5], ["Fizika", 1]] },
  { id: "2", name: "II qrup", subjects: [["Riyaziyyat", 1.5], ["Coğrafiya", 1.5], ["Tarix", 1]] },
  { id: "3dt", name: "III qrup (DT)", subjects: [["Azərbaycan dili", 1.5], ["Tarix", 1.5], ["Ədəbiyyat", 1]] },
  { id: "3tc", name: "III qrup (TC)", subjects: [["Azərbaycan dili", 1.5], ["Tarix", 1.5], ["Coğrafiya", 1]] },
  { id: "4", name: "IV qrup", subjects: [["Biologiya", 1.5], ["Kimya", 1.5], ["Fizika", 1]] },
  { id: "5", name: "V qrup", subjects: [] },
];

const WRITTEN_OPTIONS = [
  { label: "0", value: 0 },
  { label: "1/3", value: 1 / 3 },
  { label: "1/2", value: 0.5 },
  { label: "2/3", value: 2 / 3 },
  { label: "1", value: 1 },
];

const UNIVERSITIES_TR: Record<Lang, { name: string; minScore: number }[]> = {
  az: [
    { name: "ADA Universiteti", minScore: 550 },
    { name: "Bakı Dövlət Universiteti (BDU)", minScore: 450 },
    { name: "ADNSU (Neft Universiteti)", minScore: 430 },
    { name: "Azərbaycan Tibb Universiteti (ATU)", minScore: 480 },
    { name: "UNEC (İqtisad Universiteti)", minScore: 400 },
    { name: "ADPU (Pedaqoji Universitet)", minScore: 300 },
    { name: "Azərbaycan Texniki Universiteti (AzTU)", minScore: 350 },
    { name: "Azərbaycan Memarlıq və İnşaat Universiteti", minScore: 360 },
  ],
  en: [
    { name: "ADA University", minScore: 550 },
    { name: "Baku State University (BSU)", minScore: 450 },
    { name: "ASOIU (Oil University)", minScore: 430 },
    { name: "Azerbaijan Medical University (AMU)", minScore: 480 },
    { name: "UNEC (Economics University)", minScore: 400 },
    { name: "ASPU (Pedagogical University)", minScore: 300 },
    { name: "Azerbaijan Technical University (AzTU)", minScore: 350 },
    { name: "Azerbaijan Architecture & Construction University", minScore: 360 },
  ],
  ru: [
    { name: "Университет ADA", minScore: 550 },
    { name: "Бакинский государственный университет (БГУ)", minScore: 450 },
    { name: "АГУНП (Нефтяной университет)", minScore: 430 },
    { name: "Азербайджанский медицинский университет (АМУ)", minScore: 480 },
    { name: "UNEC (Университет экономики)", minScore: 400 },
    { name: "АГПУ (Педагогический университет)", minScore: 300 },
    { name: "Азербайджанский технический университет (АзТУ)", minScore: 350 },
    { name: "Азербайджанский университет архитектуры и строительства", minScore: 360 },
  ],
};

// ── Helpers ─────────────────────────────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

const scoreLevelTranslations: Record<Lang, { excellent: string; good: string; average: string; belowAvg: string; low: string }> = {
  az: { excellent: "Əla nəticə", good: "Yaxşı nəticə", average: "Orta nəticə", belowAvg: "Orta-aşağı nəticə", low: "Aşağı nəticə" },
  en: { excellent: "Excellent result", good: "Good result", average: "Average result", belowAvg: "Below average", low: "Low result" },
  ru: { excellent: "Отличный результат", good: "Хороший результат", average: "Средний результат", belowAvg: "Ниже среднего", low: "Низкий результат" },
};

function getScoreColor(total: number, lang: Lang): { bg: string; border: string; text: string; label: string } {
  const t = scoreLevelTranslations[lang];
  if (total >= 600) return { bg: "bg-green-50", border: "border-green-400", text: "text-green-700", label: t.excellent };
  if (total >= 500) return { bg: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-700", label: t.good };
  if (total >= 400) return { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", label: t.average };
  if (total >= 300) return { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", label: t.belowAvg };
  return { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", label: t.low };
}

// ── Stage 1 calculations ───────────────────────────────────────────────────────

interface Stage1Inputs {
  xariciClosed: number;
  xariciOpenWritten: number;
  azClosed: number;
  azOpenWritten: number;
  riyaClosed: number;
  riyaOpenCoded: number;
  riyaOpenWritten: number;
}

function calcStage1Xarici(closed: number, openWritten: number): number {
  const raw = (2 * openWritten + closed) * 100 / 37;
  return round1(clamp(raw, 0, 100));
}

function calcStage1Az(closed: number, openWritten: number): number {
  const raw = (2 * openWritten + closed) * 5 / 2;
  return round1(clamp(raw, 0, 100));
}

function calcStage1Riya(closed: number, openCoded: number, openWritten: number): number {
  const raw = (2 * openWritten + openCoded + closed) * 25 / 8;
  return round1(clamp(raw, 0, 100));
}

// ── 9-cu sinif buraxılış imtahanı (PDF qaydaları) ──────────────────────────────

interface Stage9Inputs {
  // Tədris dili — 30 tapşırıq (26 qapalı, 4 açıq yazılı)
  tdQapali: number;
  tdYazili: number[]; // 4 task scores (each 0, 1/3, 1/2, 2/3, 1)
  // Riyaziyyat — 25 tapşırıq (15 qapalı, 6 kod, 4 açıq yazılı)
  riyaQapali: number;
  riyaKod: number;
  riyaYazili: number[]; // 4 task scores
  // Xarici dil — 26 tapşırıq (22 qapalı, 2 kod, 1 doğru/yanlış, 1 esse)
  xdQapali: number;
  xdKod: number;
  xdDY: number; // 0, 0.5, or 1
  xdEsse: number; // 0..5
}

function calc9Tedris(qapali: number, yazili: number[]): number {
  const y = yazili.reduce((s, v) => s + v, 0);
  const raw = (2 * y + qapali) * 100 / 34;
  return round1(clamp(raw, 0, 100));
}
function calc9Riya(qapali: number, kod: number, yazili: number[]): number {
  const y = yazili.reduce((s, v) => s + v, 0);
  const raw = (2 * y + kod + qapali) * 100 / 29;
  return round1(clamp(raw, 0, 100));
}
function calc9Xarici(qapali: number, kod: number, dy: number, esse: number): number {
  const raw = (esse + dy + kod + qapali) * 100 / 30;
  return round1(clamp(raw, 0, 100));
}

const DY_OPTIONS = [
  { label: "0", value: 0 },
  { label: "0.5", value: 0.5 },
  { label: "1", value: 1 },
];

// ── Stage 2 calculations ───────────────────────────────────────────────────────

interface Stage2SubjectInputs {
  dq: number;
  yq: number;
  dkod: number;
  writtenScores: number[];
}

function calcStage2Closed(dq: number, yq: number): number {
  const raw = (dq - yq / 4) * 100 / 33;
  return round1(Math.max(0, raw));
}

function calcStage2Open(dkod: number, writtenScores: number[]): number {
  const dyazili = writtenScores.reduce((s, v) => s + v, 0);
  const raw = (dkod + 2 * dyazili) * 100 / 33;
  return round1(clamp(raw, 0, 100));
}

function calcStage2Subject(inputs: Stage2SubjectInputs): { nbq: number; nba: number; nb: number } {
  const nbq = calcStage2Closed(inputs.dq, inputs.yq);
  const nba = calcStage2Open(inputs.dkod, inputs.writtenScores);
  const nb = round1(nbq + nba);
  return { nbq, nba, nb };
}

// ── Page Translations ──────────────────────────────────────────────────────────

const pageTranslations = {
  az: {
    title: "DİM Bal Hesablanması",
    description: "DİM imtahan nəticələrinizi daxil edin — birinci və ikinci mərhələ üzrə qəbul balınızı hesablayın.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "DİM bal hesablama qaydaları",
    formulaContent: `Birinci mərhələ (max 300 bal):

Xarici dil (30 tapşırıq): NB = (2 × düzgün_yazılı + düzgün_qapalı) × 100/37
Azərbaycan (rus) dili (30 tapşırıq): NB = (2 × düzgün_yazılı + düzgün_qapalı) × 5/2
Riyaziyyat (25 tapşırıq): NB = (2 × düzgün_yazılı + düzgün_kodlaşdırılma + düzgün_qapalı) × 25/8

İkinci mərhələ (max 400 bal):

Hər fənn üzrə 30 tapşırıq (22 qapalı + 5 kodlaşdırılma + 3 yazılı)

Qapalı tip: NBq = (Dq - Yq/4) × 100/33  (mənfi olarsa, 0 qəbul edilir)
Açıq tip: NBa = (Dkod + 2 × Dyazılı) × 100/33

Fənn balı = NBq + NBa (0.1-ə yuvarlaqlaşdırılır)
Sonra çəki əmsalı ilə vurulur.

Çəki əmsalları:
I qrup (RK): Riyaziyyat ×1.5, Fizika ×1.5, Kimya ×1
I qrup (Rİ): Riyaziyyat ×1.5, İnformatika ×1.5, Fizika ×1
II qrup: Riyaziyyat ×1.5, Coğrafiya ×1.5, Tarix ×1
III qrup (DT): Azərbaycan dili ×1.5, Tarix ×1.5, Ədəbiyyat ×1
III qrup (TC): Azərbaycan dili ×1.5, Tarix ×1.5, Coğrafiya ×1
IV qrup: Biologiya ×1.5, Kimya ×1.5, Fizika ×1

Ümumi bal = Birinci mərhələ + İkinci mərhələ (max 700)`,
    selectGroup: "1. İxtisas qrupunu seçin",
    stage1Title: "2. Birinci mərhələ",
    stage1Desc: "Xarici dil, Azərbaycan dili və Riyaziyyat (max 300 bal)",
    foreignLang: "Xarici dil",
    tasks: "tapşırıq",
    score: "bal",
    closedCorrect: "Qapalı tipli düzgün cavab sayı",
    openWrittenCorrect: "Açıq tipli (yazılı) düzgün cavab sayı",
    azLang: "Azərbaycan (rus) dili",
    math: "Riyaziyyat",
    openCodedCorrect: "Açıq (kodlaşdırılma) düzgün cavab sayı",
    openWrittenCorrectMath: "Açıq (yazılı) düzgün cavab sayı",
    stage1Total: "Birinci mərhələ cəmi",
    foreignLangShort: "Xarici dil",
    azLangShort: "Az. dili",
    mathShort: "Riyaziyyat",
    stage2Title: "3. İkinci mərhələ",
    stage2Subjects: "fənləri (max 400 bal)",
    weight: "çəki",
    closedType: "Qapalı tip",
    closedTasks: "tapşırıq",
    correctCount: "Düzgün cavab sayı (Dq)",
    wrongCount: "Yanlış cavab sayı (Yq)",
    openType: "Açıq tip",
    codedPlusWritten: "kodlaşdırılma + 3 yazılı",
    codedCorrect: "Kodlaşdırılma düzgün cavab sayı (Dkod)",
    writtenTask: "Yazılı tapşırıq",
    nbClosed: "NBq (qapalı)",
    nbOpen: "NBa (açıq)",
    weighted: "Çəkili",
    stage2Total: "İkinci mərhələ cəmi",
    vGroupNote: "V qrup üçün yalnız birinci mərhələ balı hesablanır. Qabiliyyət imtahanı balı ayrıca qiymətləndirilir.",
    stage1Score: "Birinci mərhələ balınız",
    totalScore: "Ümumi qəbul balınız",
    outOf: "baldan",
    stage1Label: "Birinci mərhələ",
    stage2Label: "İkinci mərhələ",
    uniComparison: "Universitetlər ilə müqayisə (təxmini)",
    passes: "Keçir",
    minApprox: "Min: ~",
    minScoresNote: "Minimum ballar təxminidir və hər il dəyişə bilər.",
    disclaimer: "Bu hesablama DİM-in rəsmi bal hesablama qaydalarına əsaslanır. Lakin universitetlərin minimum keçid balları hər il dəyişir. Ən dəqiq məlumat üçün DİM-in rəsmi saytına (dim.gov.az) müraciət edin.",
    disclaimerLabel: "Diqqət:",
    examTypeTitle: "İmtahan növünü seçin",
    buraxilis: "Buraxılış imtahanı",
    blok: "Blok imtahanı",
    gradeTitle: "Sinifi seçin",
    grade9: "9-cu sinif",
    grade11: "11-ci sinif",
    nativeLang: "Azərbaycan (rus) dili",
    nativeLangShort: "Az. dili",
    closedAnswers: "Qapalı tipli düzgün cavablar",
    openCodedAnswers: "Açıq (kodlaşdırılma) düzgün cavablar",
    openWrittenAnswers: "Açıq (yazılı) tapşırıqlar",
    truefalseTask: "Doğru/yanlış tapşırığı",
    essayTask: "Esse balı (0–5)",
    grade9Note: "9-cu sinif buraxılış imtahanı 3 fənn üzrə hesablanır: tədris dili, riyaziyyat və xarici dil. Hər fənn 100 baldır, ümumi 300 bal.",
    grade11Note: "11-ci sinif buraxılış imtahanı DİM-in birinci mərhələ qaydalarına əsasən hesablanır.",
    blokNote: "Blok imtahanı seçilmiş ixtisas qrupuna uyğun 3 fənn üzrə hesablanır (max 400 bal).",
  },
  en: {
    title: "DIM Score Calculator",
    description: "Enter your DIM exam results — calculate your admission score for the first and second stages.",
    breadcrumbCategory: "Education",
    formulaTitle: "DIM score calculation rules",
    formulaContent: `First stage (max 300 points):

Foreign language (30 tasks): NB = (2 × correct_written + correct_closed) × 100/37
Azerbaijani (Russian) language (30 tasks): NB = (2 × correct_written + correct_closed) × 5/2
Mathematics (25 tasks): NB = (2 × correct_written + correct_coded + correct_closed) × 25/8

Second stage (max 400 points):

Each subject 30 tasks (22 closed + 5 coded + 3 written)

Closed type: NBq = (Dq - Yq/4) × 100/33  (if negative, taken as 0)
Open type: NBa = (Dkod + 2 × Dwritten) × 100/33

Subject score = NBq + NBa (rounded to 0.1)
Then multiplied by weight coefficient.

Weight coefficients:
Group I (RK): Mathematics ×1.5, Physics ×1.5, Chemistry ×1
Group I (Rİ): Mathematics ×1.5, Informatics ×1.5, Physics ×1
Group II: Mathematics ×1.5, Geography ×1.5, History ×1
Group III (DT): Azerbaijani ×1.5, History ×1.5, Literature ×1
Group III (TC): Azerbaijani ×1.5, History ×1.5, Geography ×1
Group IV: Biology ×1.5, Chemistry ×1.5, Physics ×1

Total score = First stage + Second stage (max 700)`,
    selectGroup: "1. Select specialty group",
    stage1Title: "2. First stage",
    stage1Desc: "Foreign language, Azerbaijani language, and Mathematics (max 300 points)",
    foreignLang: "Foreign language",
    tasks: "tasks",
    score: "pts",
    closedCorrect: "Closed-type correct answer count",
    openWrittenCorrect: "Open-type (written) correct answer count",
    azLang: "Azerbaijani (Russian) language",
    math: "Mathematics",
    openCodedCorrect: "Open (coded) correct answer count",
    openWrittenCorrectMath: "Open (written) correct answer count",
    stage1Total: "First stage total",
    foreignLangShort: "Foreign lang.",
    azLangShort: "Az. lang.",
    mathShort: "Math",
    stage2Title: "3. Second stage",
    stage2Subjects: "subjects (max 400 points)",
    weight: "weight",
    closedType: "Closed type",
    closedTasks: "tasks",
    correctCount: "Correct answer count (Dq)",
    wrongCount: "Wrong answer count (Yq)",
    openType: "Open type",
    codedPlusWritten: "coded + 3 written",
    codedCorrect: "Coded correct answer count (Dkod)",
    writtenTask: "Written task",
    nbClosed: "NBq (closed)",
    nbOpen: "NBa (open)",
    weighted: "Weighted",
    stage2Total: "Second stage total",
    vGroupNote: "For Group V, only the first stage score is calculated. The aptitude test score is evaluated separately.",
    stage1Score: "Your first stage score",
    totalScore: "Your total admission score",
    outOf: "out of",
    stage1Label: "First stage",
    stage2Label: "Second stage",
    uniComparison: "University comparison (approximate)",
    passes: "Passes",
    minApprox: "Min: ~",
    minScoresNote: "Minimum scores are approximate and change every year.",
    disclaimer: "This calculation is based on DIM's official score calculation rules. However, universities' minimum passing scores change every year. For the most accurate information, refer to DIM's official website (dim.gov.az).",
    disclaimerLabel: "Note:",
    examTypeTitle: "Select exam type",
    buraxilis: "Graduation exam",
    blok: "Block exam",
    gradeTitle: "Select grade",
    grade9: "9th grade",
    grade11: "11th grade",
    nativeLang: "Azerbaijani (Russian) language",
    nativeLangShort: "Az. lang.",
    closedAnswers: "Closed-type correct answers",
    openCodedAnswers: "Open (coded) correct answers",
    openWrittenAnswers: "Open (written) tasks",
    truefalseTask: "True/false task",
    essayTask: "Essay score (0–5)",
    grade9Note: "9th grade graduation exam covers 3 subjects: native language, mathematics, and foreign language. Each subject is worth 100 points (300 total).",
    grade11Note: "11th grade graduation exam is calculated according to DIM's first stage rules.",
    blokNote: "Block exam covers 3 subjects depending on the chosen specialty group (max 400 points).",
  },
  ru: {
    title: "Калькулятор баллов ГЭЦ",
    description: "Введите результаты экзамена ГЭЦ — рассчитайте свой проходной балл по первому и второму этапам.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Правила расчёта баллов ГЭЦ",
    formulaContent: `Первый этап (макс. 300 баллов):

Иностранный язык (30 заданий): НБ = (2 × правильные_письменные + правильные_закрытые) × 100/37
Азербайджанский (русский) язык (30 заданий): НБ = (2 × правильные_письменные + правильные_закрытые) × 5/2
Математика (25 заданий): НБ = (2 × правильные_письменные + правильные_кодированные + правильные_закрытые) × 25/8

Второй этап (макс. 400 баллов):

По каждому предмету 30 заданий (22 закрытых + 5 кодированных + 3 письменных)

Закрытый тип: НБз = (Пз - Нз/4) × 100/33  (если отрицательно, берётся 0)
Открытый тип: НБо = (Пкод + 2 × Ппис) × 100/33

Балл предмета = НБз + НБо (округляется до 0.1)
Затем умножается на весовой коэффициент.

Весовые коэффициенты:
Группа I (RK): Математика ×1.5, Физика ×1.5, Химия ×1
Группа I (Rİ): Математика ×1.5, Информатика ×1.5, Физика ×1
Группа II: Математика ×1.5, География ×1.5, История ×1
Группа III (ДТ): Азерб. язык ×1.5, История ×1.5, Литература ×1
Группа III (ТС): Азерб. язык ×1.5, История ×1.5, География ×1
Группа IV: Биология ×1.5, Химия ×1.5, Физика ×1

Общий балл = Первый этап + Второй этап (макс. 700)`,
    selectGroup: "1. Выберите группу специальности",
    stage1Title: "2. Первый этап",
    stage1Desc: "Иностранный язык, Азербайджанский язык и Математика (макс. 300 баллов)",
    foreignLang: "Иностранный язык",
    tasks: "заданий",
    score: "балл",
    closedCorrect: "Количество правильных закрытых ответов",
    openWrittenCorrect: "Количество правильных открытых (письменных) ответов",
    azLang: "Азербайджанский (русский) язык",
    math: "Математика",
    openCodedCorrect: "Количество правильных открытых (кодированных) ответов",
    openWrittenCorrectMath: "Количество правильных открытых (письменных) ответов",
    stage1Total: "Итого первый этап",
    foreignLangShort: "Иностр. язык",
    azLangShort: "Аз. язык",
    mathShort: "Математика",
    stage2Title: "3. Второй этап",
    stage2Subjects: "предметы (макс. 400 баллов)",
    weight: "вес",
    closedType: "Закрытый тип",
    closedTasks: "заданий",
    correctCount: "Количество правильных ответов (Пз)",
    wrongCount: "Количество неправильных ответов (Нз)",
    openType: "Открытый тип",
    codedPlusWritten: "кодированных + 3 письменных",
    codedCorrect: "Количество правильных кодированных ответов (Пкод)",
    writtenTask: "Письменное задание",
    nbClosed: "НБз (закрытые)",
    nbOpen: "НБо (открытые)",
    weighted: "Взвешенный",
    stage2Total: "Итого второй этап",
    vGroupNote: "Для V группы рассчитывается только балл первого этапа. Балл за тест способностей оценивается отдельно.",
    stage1Score: "Ваш балл первого этапа",
    totalScore: "Ваш общий проходной балл",
    outOf: "из",
    stage1Label: "Первый этап",
    stage2Label: "Второй этап",
    uniComparison: "Сравнение с университетами (приблизительно)",
    passes: "Проходит",
    minApprox: "Мин: ~",
    minScoresNote: "Минимальные баллы приблизительны и меняются каждый год.",
    disclaimer: "Этот расчёт основан на официальных правилах расчёта баллов ГЭЦ. Однако минимальные проходные баллы университетов меняются каждый год. Для наиболее точной информации обращайтесь на официальный сайт ГЭЦ (dim.gov.az).",
    disclaimerLabel: "Внимание:",
    examTypeTitle: "Выберите тип экзамена",
    buraxilis: "Выпускной экзамен",
    blok: "Блочный экзамен",
    gradeTitle: "Выберите класс",
    grade9: "9-й класс",
    grade11: "11-й класс",
    nativeLang: "Азербайджанский (русский) язык",
    nativeLangShort: "Аз. язык",
    closedAnswers: "Правильные ответы (закрытые)",
    openCodedAnswers: "Правильные открытые (кодированные)",
    openWrittenAnswers: "Открытые (письменные) задания",
    truefalseTask: "Задание «верно/неверно»",
    essayTask: "Балл за эссе (0–5)",
    grade9Note: "Выпускной экзамен 9-го класса включает 3 предмета: язык обучения, математика и иностранный язык. Каждый — 100 баллов (всего 300).",
    grade11Note: "Выпускной экзамен 11-го класса рассчитывается по правилам первого этапа ГЭЦ.",
    blokNote: "Блочный экзамен охватывает 3 предмета выбранной группы специальностей (макс. 400 баллов).",
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

const defaultStage1: Stage1Inputs = {
  xariciClosed: 0, xariciOpenWritten: 0,
  azClosed: 0, azOpenWritten: 0,
  riyaClosed: 0, riyaOpenCoded: 0, riyaOpenWritten: 0,
};

const defaultStage2Subject: Stage2SubjectInputs = {
  dq: 0, yq: 0, dkod: 0, writtenScores: [0, 0, 0],
};

const defaultStage9: Stage9Inputs = {
  tdQapali: 0,
  tdYazili: [0, 0, 0, 0],
  riyaQapali: 0,
  riyaKod: 0,
  riyaYazili: [0, 0, 0, 0],
  xdQapali: 0,
  xdKod: 0,
  xdDY: 0,
  xdEsse: 0,
};

export default function UniversitetQebulCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const universities = UNIVERSITIES_TR[lang];

  const [examType, setExamType] = useState<ExamType>("buraxilis");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("11");
  const [selectedGroup, setSelectedGroup] = useState<GroupId>("1rk");
  const [s1, setS1] = useState<Stage1Inputs>({ ...defaultStage1 });
  const [s9, setS9] = useState<Stage9Inputs>({ ...defaultStage9, tdYazili: [0, 0, 0, 0], riyaYazili: [0, 0, 0, 0] });
  const [s2, setS2] = useState<Stage2SubjectInputs[]>([
    { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
    { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
    { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
  ]);

  const group = GROUP_DEFS.find((g) => g.id === selectedGroup)!;
  const isVGroup = selectedGroup === "5";
  const isBuraxilis = examType === "buraxilis";
  const isBlok = examType === "blok";
  const is9 = isBuraxilis && gradeLevel === "9";
  const is11 = isBuraxilis && gradeLevel === "11";

  const resetAll = useCallback(() => {
    setS1({ ...defaultStage1 });
    setS2([
      { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
      { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
      { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
    ]);
  }, []);

  const updateS1 = (field: keyof Stage1Inputs, val: string) => {
    const num = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setS1((prev) => ({ ...prev, [field]: num }));
  };

  const updateS2 = (subjectIdx: number, field: keyof Omit<Stage2SubjectInputs, "writtenScores">, val: string) => {
    const num = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setS2((prev) => {
      const next = prev.map((s, i) => (i === subjectIdx ? { ...s, [field]: num } : s));
      return next;
    });
  };

  const updateS9 = (field: keyof Omit<Stage9Inputs, "tdYazili" | "riyaYazili">, val: string) => {
    const num = val === "" ? 0 : parseFloat(val);
    if (isNaN(num) || num < 0) return;
    setS9((prev) => ({ ...prev, [field]: num }));
  };

  const updateS9Yazili = (group: "td" | "riya", taskIdx: number, val: number) => {
    setS9((prev) => {
      const key = group === "td" ? "tdYazili" : "riyaYazili";
      const arr = [...prev[key]];
      arr[taskIdx] = val;
      return { ...prev, [key]: arr };
    });
  };

  const updateS2Written = (subjectIdx: number, taskIdx: number, val: number) => {
    setS2((prev) => {
      const next = prev.map((s, i) => {
        if (i !== subjectIdx) return s;
        const ws = [...s.writtenScores];
        ws[taskIdx] = val;
        return { ...s, writtenScores: ws };
      });
      return next;
    });
  };

  // ── Calculations ──

  const stage1Results = useMemo(() => {
    const xarici = calcStage1Xarici(
      clamp(s1.xariciClosed, 0, 23),
      clamp(s1.xariciOpenWritten, 0, 7)
    );
    const az = calcStage1Az(
      clamp(s1.azClosed, 0, 20),
      clamp(s1.azOpenWritten, 0, 10)
    );
    const riya = calcStage1Riya(
      clamp(s1.riyaClosed, 0, 13),
      clamp(s1.riyaOpenCoded, 0, 5),
      clamp(s1.riyaOpenWritten, 0, 7)
    );
    const total = round1(xarici + az + riya);
    return { xarici, az, riya, total };
  }, [s1]);

  const stage9Results = useMemo(() => {
    const td = calc9Tedris(clamp(s9.tdQapali, 0, 26), s9.tdYazili);
    const riya = calc9Riya(clamp(s9.riyaQapali, 0, 15), clamp(s9.riyaKod, 0, 6), s9.riyaYazili);
    const xd = calc9Xarici(clamp(s9.xdQapali, 0, 22), clamp(s9.xdKod, 0, 2), clamp(s9.xdDY, 0, 1), clamp(s9.xdEsse, 0, 5));
    const total = round1(td + riya + xd);
    return { td, riya, xd, total };
  }, [s9]);

  const stage2Results = useMemo(() => {
    if (isVGroup) return null;
    const results = group.subjects.map((_, i) => {
      const inp = s2[i];
      const clamped: Stage2SubjectInputs = {
        dq: clamp(inp.dq, 0, 22),
        yq: clamp(inp.yq, 0, 22 - clamp(inp.dq, 0, 22)),
        dkod: clamp(inp.dkod, 0, 5),
        writtenScores: inp.writtenScores,
      };
      const { nbq, nba, nb } = calcStage2Subject(clamped);
      const weighted = round1(nb * group.subjects[i][1]);
      return { nbq, nba, nb, weighted, subjectName: group.subjects[i][0], coeff: group.subjects[i][1] };
    });
    const total = round1(results.reduce((sum, r) => sum + r.weighted, 0));
    return { results, total };
  }, [s2, group, isVGroup]);

  const grandTotal = isBlok
    ? round1(stage2Results?.total ?? 0)
    : is9
    ? stage9Results.total
    : stage1Results.total;
  const maxTotal = isBlok ? 400 : 300;
  const scoreColor = getScoreColor(grandTotal * 700 / maxTotal, lang);

  // ── Render helpers ──

  const numberInput = (
    label: string,
    value: number,
    onChange: (val: string) => void,
    max: number,
    hint?: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
        {hint && <span className="text-xs text-muted ml-1">({hint})</span>}
      </label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`0–${max}`}
        min="0"
        max={max}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
      />
    </div>
  );

  const writtenSelect = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
      >
        {WRITTEN_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

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
      relatedIds={["gpa", "ielts", "sat"]}
    >
      {/* ── Step 0: Exam type ── */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">{pt.examTypeTitle}</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "buraxilis" as ExamType, label: pt.buraxilis, icon: "🎓" },
            { id: "blok" as ExamType, label: pt.blok, icon: "📚" },
          ]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setExamType(opt.id)}
              className={`p-4 rounded-xl border text-center transition-all text-sm font-medium ${
                examType === opt.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary text-primary"
                  : "border-border bg-white hover:border-primary/30 text-foreground"
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Buraxılış: grade selector ── */}
      {isBuraxilis && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">{pt.gradeTitle}</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "9" as GradeLevel, label: pt.grade9 },
              { id: "11" as GradeLevel, label: pt.grade11 },
            ]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setGradeLevel(opt.id)}
                className={`p-3 rounded-xl border text-center transition-all text-sm font-medium ${
                  gradeLevel === opt.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary text-primary"
                    : "border-border bg-white hover:border-primary/30 text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">{is9 ? pt.grade9Note : pt.grade11Note}</p>
        </div>
      )}

      {/* ── Blok: Group Selection ── */}
      {isBlok && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">{pt.selectGroup}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GROUP_DEFS.filter((g) => g.id !== "5").map((g) => (
              <button
                key={g.id}
                onClick={() => { setSelectedGroup(g.id); resetAll(); }}
                className={`p-3 rounded-xl border text-center transition-all text-sm font-medium ${
                  selectedGroup === g.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary text-primary"
                    : "border-border bg-white hover:border-primary/30 text-foreground"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">{pt.blokNote}</p>
        </div>
      )}

      {/* ── 9-cu sinif buraxılış inputs ── */}
      {is9 && (
        <div className="mb-8">
          {/* Tədris dili */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">{pt.nativeLang} <span className="text-xs text-muted">(30 {pt.tasks})</span></h3>
              <span className="text-sm font-semibold text-primary">{stage9Results.td} {pt.score}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {numberInput(pt.closedAnswers, s9.tdQapali, (v) => updateS9("tdQapali", v), 26, "max 26")}
            </div>
            <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">{pt.openWrittenAnswers} (4)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {s9.tdYazili.map((v, i) => (
                <div key={`td-${i}`}>
                  {writtenSelect(`${pt.writtenTask} ${i + 1}`, v, (val) => updateS9Yazili("td", i, val))}
                </div>
              ))}
            </div>
          </div>

          {/* Riyaziyyat */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">{pt.math} <span className="text-xs text-muted">(25 {pt.tasks})</span></h3>
              <span className="text-sm font-semibold text-primary">{stage9Results.riya} {pt.score}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {numberInput(pt.closedAnswers, s9.riyaQapali, (v) => updateS9("riyaQapali", v), 15, "max 15")}
              {numberInput(pt.openCodedAnswers, s9.riyaKod, (v) => updateS9("riyaKod", v), 6, "max 6")}
            </div>
            <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">{pt.openWrittenAnswers} (4)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {s9.riyaYazili.map((v, i) => (
                <div key={`riya-${i}`}>
                  {writtenSelect(`${pt.writtenTask} ${i + 1}`, v, (val) => updateS9Yazili("riya", i, val))}
                </div>
              ))}
            </div>
          </div>

          {/* Xarici dil */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">{pt.foreignLang} <span className="text-xs text-muted">(26 {pt.tasks})</span></h3>
              <span className="text-sm font-semibold text-primary">{stage9Results.xd} {pt.score}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {numberInput(pt.closedAnswers, s9.xdQapali, (v) => updateS9("xdQapali", v), 22, "max 22")}
              {numberInput(pt.openCodedAnswers, s9.xdKod, (v) => updateS9("xdKod", v), 2, "max 2")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{pt.truefalseTask}</label>
                <select
                  value={s9.xdDY}
                  onChange={(e) => updateS9("xdDY", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  {DY_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {numberInput(pt.essayTask, s9.xdEsse, (v) => updateS9("xdEsse", v), 5, "0–5")}
            </div>
          </div>

          {/* 9th total */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">{pt.stage1Total}</p>
              <p className="text-xs text-blue-600 mt-0.5">{pt.nativeLangShort} ({stage9Results.td}) + {pt.mathShort} ({stage9Results.riya}) + {pt.foreignLangShort} ({stage9Results.xd})</p>
            </div>
            <p className="text-2xl font-bold text-blue-800">{stage9Results.total} <span className="text-sm font-normal">/ 300</span></p>
          </div>
        </div>
      )}

      {/* ── 11-ci sinif buraxılış / Stage 1 ── */}
      {is11 && (
      <div className="mb-8">
        <p className="text-sm text-muted mb-4">{pt.stage1Desc}</p>

        {/* Xarici dil */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">{pt.foreignLang} <span className="text-xs text-muted">(30 {pt.tasks})</span></h3>
            <span className="text-sm font-semibold text-primary">{stage1Results.xarici} {pt.score}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {numberInput(pt.closedCorrect, s1.xariciClosed, (v) => updateS1("xariciClosed", v), 23, "max 23")}
            {numberInput(pt.openWrittenCorrect, s1.xariciOpenWritten, (v) => updateS1("xariciOpenWritten", v), 7, "max 7")}
          </div>
        </div>

        {/* Azərbaycan dili */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">{pt.azLang} <span className="text-xs text-muted">(30 {pt.tasks})</span></h3>
            <span className="text-sm font-semibold text-primary">{stage1Results.az} {pt.score}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {numberInput(pt.closedCorrect, s1.azClosed, (v) => updateS1("azClosed", v), 20, "max 20")}
            {numberInput(pt.openWrittenCorrect, s1.azOpenWritten, (v) => updateS1("azOpenWritten", v), 10, "max 10")}
          </div>
        </div>

        {/* Riyaziyyat */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">{pt.math} <span className="text-xs text-muted">(25 {pt.tasks})</span></h3>
            <span className="text-sm font-semibold text-primary">{stage1Results.riya} {pt.score}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {numberInput(pt.closedCorrect, s1.riyaClosed, (v) => updateS1("riyaClosed", v), 13, "max 13")}
            {numberInput(pt.openCodedCorrect, s1.riyaOpenCoded, (v) => updateS1("riyaOpenCoded", v), 5, "max 5")}
            {numberInput(pt.openWrittenCorrectMath, s1.riyaOpenWritten, (v) => updateS1("riyaOpenWritten", v), 7, "max 7")}
          </div>
        </div>

        {/* Stage 1 Total */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">{pt.stage1Total}</p>
            <p className="text-xs text-blue-600 mt-0.5">{pt.foreignLangShort} ({stage1Results.xarici}) + {pt.azLangShort} ({stage1Results.az}) + {pt.mathShort} ({stage1Results.riya})</p>
          </div>
          <p className="text-2xl font-bold text-blue-800">{stage1Results.total} <span className="text-sm font-normal">/ 300</span></p>
        </div>
      </div>
      )}

      {/* ── Blok: Stage 2 ── */}
      {isBlok && !isVGroup && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">{pt.stage2Title}</h2>
          <p className="text-sm text-muted mb-4">{group.name} {pt.stage2Subjects}</p>

          {group.subjects.map(([subjectName, coeff], idx) => {
            const r = stage2Results?.results[idx];
            return (
              <div key={subjectName} className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">
                    {subjectName}
                    <span className="text-xs text-muted ml-2">(30 {pt.tasks}, ×{coeff} {pt.weight})</span>
                  </h3>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-primary">{r?.weighted ?? 0} {pt.score}</span>
                    <span className="text-xs text-muted block">NB: {r?.nb ?? 0}</span>
                  </div>
                </div>

                {/* Closed type inputs */}
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">{pt.closedType} (22 {pt.closedTasks})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {numberInput(
                    pt.correctCount,
                    s2[idx].dq,
                    (v) => updateS2(idx, "dq", v),
                    22,
                    "max 22"
                  )}
                  {numberInput(
                    pt.wrongCount,
                    s2[idx].yq,
                    (v) => updateS2(idx, "yq", v),
                    22 - clamp(s2[idx].dq, 0, 22),
                    `max ${22 - clamp(s2[idx].dq, 0, 22)}`
                  )}
                </div>

                {/* Open type inputs */}
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">{pt.openType} (5 {pt.codedPlusWritten})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {numberInput(
                    pt.codedCorrect,
                    s2[idx].dkod,
                    (v) => updateS2(idx, "dkod", v),
                    5,
                    "max 5"
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {s2[idx].writtenScores.map((ws, ti) =>
                    writtenSelect(
                      `${pt.writtenTask} ${ti + 1}`,
                      ws,
                      (val) => updateS2Written(idx, ti, val)
                    )
                  )}
                </div>

                {/* Subject breakdown */}
                {r && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4 text-xs text-muted">
                    <span>{pt.nbClosed}: <strong className="text-foreground">{r.nbq}</strong></span>
                    <span>{pt.nbOpen}: <strong className="text-foreground">{r.nba}</strong></span>
                    <span>NB: <strong className="text-foreground">{r.nb}</strong></span>
                    <span>{pt.weighted}: <strong className="text-foreground">{r.nb} × {coeff} = {r.weighted}</strong></span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Stage 2 Total */}
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">{pt.stage2Total}</p>
              <p className="text-xs text-purple-600 mt-0.5">
                {stage2Results?.results.map((r) => `${r.subjectName} (${r.weighted})`).join(" + ")}
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-800">{stage2Results?.total ?? 0} <span className="text-sm font-normal">/ 400</span></p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      <div className="space-y-4">
        {/* Grand Total */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
          <p className="text-sm font-medium text-blue-200 mb-1">
            {isBuraxilis ? pt.buraxilis : pt.blok}
          </p>
          <p className="text-6xl font-bold mb-2">{grandTotal}</p>
          <p className="text-sm text-blue-200">{maxTotal} {pt.outOf}</p>
        </div>

        {/* Score range indicator */}
        <div className={`${scoreColor.bg} ${scoreColor.border} border rounded-xl p-4 text-center`}>
          <p className={`text-sm font-semibold ${scoreColor.text}`}>{scoreColor.label}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className={`rounded-full h-3 transition-all ${
                grandTotal >= maxTotal * 0.85 ? "bg-green-500" :
                grandTotal >= maxTotal * 0.7 ? "bg-emerald-500" :
                grandTotal >= maxTotal * 0.55 ? "bg-yellow-500" :
                grandTotal >= maxTotal * 0.4 ? "bg-orange-500" : "bg-red-500"
              }`}
              style={{ width: `${clamp((grandTotal / maxTotal) * 100, 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1">{round1((grandTotal / maxTotal) * 100)}%</p>
        </div>

        {/* University comparison */}
        {isBlok && grandTotal > 0 && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {pt.uniComparison}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {universities
                .sort((a, b) => b.minScore - a.minScore)
                .map((uni) => {
                  const passes = grandTotal >= uni.minScore;
                  return (
                    <div key={uni.name} className={`flex items-center justify-between px-5 py-3 ${passes ? "bg-green-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${passes ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className={`text-sm ${passes ? "text-green-700 font-medium" : "text-muted"}`}>{uni.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{pt.minApprox}{uni.minScore}</span>
                        {passes && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">{pt.passes}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="px-5 py-2 bg-gray-50 border-t border-border">
              <p className="text-xs text-muted">
                {pt.minScoresNote}
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">{pt.disclaimerLabel}</span> {pt.disclaimer}
          </p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
