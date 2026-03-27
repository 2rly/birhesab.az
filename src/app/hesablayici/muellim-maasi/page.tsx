"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// ============================================================
// edu.gov.az /calculator logic — complete rewrite
// Subject-based hour inputs, institution-specific bonuses,
// military instructor & gym teacher special rules
// ============================================================

// ---------- salary tables (stavka = 18 saat/həftə) ----------
const SALARY_PASSED: Record<string, Record<string, number> | number> = {
  high:      { "0_3": 607, "3_8": 653, "8_13": 686, "13_18": 733, "18_up": 785 },
  technical: { "0_3": 554, "3_8": 587, "8_13": 607, "13_18": 647, "18_up": 700 },
  secondary: 554,
};

const SALARY_NOT_PASSED: Record<string, Record<string, number> | number> = {
  high:      { "0_3": 455.25, "3_8": 489.75, "8_13": 514.50, "13_18": 549.75, "18_up": 588.75 },
  technical: { "0_3": 415.50, "3_8": 440.25, "8_13": 455.25, "13_18": 485.25, "18_up": 525.00 },
  secondary: 415.50,
};

// Military instructor base salaries
const MILITARY_SALARY_PASSED = [477, 493, 508, 539];
const MILITARY_SALARY_NOT_PASSED = [429.30, 443.70, 457.20, 485.10];
const MILITARY_LABELS = [
  "Xüsusi hazırlıq keçmiş, ümumi orta təhsilli, pedaqoji stajı ən azı 5 ilə qədər",
  "Xüsusi hazırlıq keçmiş, ümumi orta təhsilli, pedaqoji stajı 10 ildən çox və ya orta ixtisas təhsilli, pedaqoji stajı 5 ilə qədər",
  "Orta ixtisas təhsilli, pedaqoji stajı 5 ildən 10 ilədək və ya orta hərbi təhsilli, yaxud ali təhsilli, pedaqoji stajı hər iki halda 5 ilə qədər",
  "Ali təhsilli, pedaqoji stajı 5 ildən çox; orta ixtisas təhsilli, pedaqoji stajı 10 ildən çox; orta hərbi təhsilli, pedaqoji stajı 5 ildən artıq; ali hərbi təhsilli, pedaqoji staja tələb qoyulmayan",
];

// Gym extracurricular payments (exam_passed)
const GYM_EXTRA_PASSED = { "10_19": 55, "20_29": 110, "30_up": 165 };
const GYM_EXTRA_NOT_PASSED = { "10_19": 49.50, "20_29": 99, "30_up": 148.50 };

// Hobby group (dərnək) salary data per level (stavka for 18h)
const HOBBY_GROUP_SALARY: Record<string, number> = {
  level_8: 458, level_9: 478, level_10: 497, level_11: 518,
  level_12: 538, level_13: 560, level_14: 584,
};
const HOBBY_GROUP_OPTIONS = [
  { id: "level_8", label: "8-ci dərəcə — 458 AZN" },
  { id: "level_9", label: "9-cu dərəcə — 478 AZN" },
  { id: "level_10", label: "10-cu dərəcə — 497 AZN" },
  { id: "level_11", label: "11-ci dərəcə — 518 AZN" },
  { id: "level_12", label: "12-ci dərəcə — 538 AZN" },
  { id: "level_13", label: "13-cü dərəcə — 560 AZN" },
  { id: "level_14", label: "14-cü dərəcə — 584 AZN" },
];

const EXPERIENCE_OPTIONS = [
  { id: "0_3",   label: "3 ilə qədər" },
  { id: "3_8",   label: "3-8 ilədək" },
  { id: "8_13",  label: "8-13 ilədək" },
  { id: "13_18", label: "13-18 ilədək" },
  { id: "18_up", label: "18 ildən çox" },
];

const STANDARD_HOURS = 18;

type InstitutionType = "1" | "2" | "3";
const INSTITUTION_OPTIONS: { id: InstitutionType; label: string; bonus: string }[] = [
  { id: "1", label: "Ümumtəhsil məktəbləri / Məktəb-liseylər", bonus: "Nizamnamə ilə lisey saatlarına +15%" },
  { id: "2", label: "Lisey, gimnaziya, internat məktəbləri", bonus: "+15% bütün saatlara" },
  { id: "3", label: "Xüsusi təhsil müəssisələri", bonus: "+50% bütün saatlara" },
];

// Əmək şəraiti əlavələri
interface WorkCondition {
  id: string;
  label: string;
  options: { label: string; value: number }[];
}
const WORK_CONDITIONS: WorkCondition[] = [
  {
    id: "xezer", label: "Xəzər dənizindəki obyektlər",
    options: [
      { label: "Yoxdur", value: 0 },
      { label: "Sahillə quru yol əlaqəsi (40%)", value: 40 },
      { label: "Sahildən 0.5 km-ədək (50%)", value: 50 },
      { label: "0.5-70 km (65%)", value: 65 },
      { label: "70 km+ (75%)", value: 75 },
    ],
  },
  {
    id: "susuz", label: "Susuz torpaq əraziləri",
    options: [
      { label: "Yoxdur", value: 0 },
      { label: "20-40 km (20%)", value: 20 },
      { label: "40 km+ (40%)", value: 40 },
    ],
  },
  {
    id: "hundurlik", label: "Dəniz səviyyəsindən hündürlük",
    options: [
      { label: "Yoxdur", value: 0 },
      { label: "1200-1500 m (10%)", value: 10 },
      { label: "1500-2000 m (20%)", value: 20 },
      { label: "2000 m+ (30%)", value: 30 },
    ],
  },
  {
    id: "agir", label: "Əmək şəraiti ağır və zərərli",
    options: [
      { label: "Yoxdur", value: 0 },
      { label: "Aşağı (4%)", value: 4 },
      { label: "Orta (8%)", value: 8 },
      { label: "Yuxarı (12%)", value: 12 },
    ],
  },
  {
    id: "xususi_agir", label: "Əmək şəraiti xüsusilə ağır",
    options: [
      { label: "Yoxdur", value: 0 },
      { label: "Aşağı (16%)", value: 16 },
      { label: "Orta (20%)", value: 20 },
      { label: "Yuxarı (24%)", value: 24 },
    ],
  },
  {
    id: "elillik", label: "Əlilliyə görə",
    options: [
      { label: "Yoxdur", value: 0 },
      { label: "I-II qrup (25%)", value: 25 },
      { label: "III qrup (15%)", value: 15 },
    ],
  },
];

// Vergi güzəştləri
interface TaxExemption {
  id: string;
  label: string;
  amount: number;
  fullExempt: boolean;
}
const TAX_EXEMPTIONS: TaxExemption[] = [
  { id: "hero", label: "AR Milli Qəhrəmanı və s. (vergidən azad)", amount: 0, fullExempt: true },
  { id: "disabled12", label: "I-II qrup əlillər (200 AZN güzəşt)", amount: 200, fullExempt: false },
  { id: "martyr", label: "Həlak olmuş döyüşçülərin valideynləri (200 AZN güzəşt)", amount: 200, fullExempt: false },
  { id: "children3", label: "3+ uşaqlı ailə (50 AZN güzəşt)", amount: 50, fullExempt: false },
];

// Sinif rəhbərliyi for keçməyib
const CLASS_LEADER_NOT_PASSED: Record<string, number> = { "1_4": 0.15, "5_11": 0.20 };

const pageTranslations = {
  az: {
    title: "Müəllim maaşı hesablayıcısı",
    description: "Dövlət ümumi təhsil müəssisələrində çalışan müəllimlərin əmək haqqı hesablaması (edu.gov.az məlumatına əsasən)",
    breadcrumbCategory: "Maliyyə",
    breadcrumbLabel: "Müəllim maaşı hesablayıcısı",
    diagnosticAssessment: "Diaqnostik qiymətləndirmə",
    passed: "Keçib",
    notPassed: "Keçməyib",
    education: "Təhsili",
    highEd: "Ali təhsilli",
    technicalEd: "Orta ixtisas təhsilli",
    secondaryEd: "Orta təhsilli",
    pedagogicalExp: "Pedaqoji staj",
    certification: "Sertifikatlaşma",
    yes: "Bəli",
    no: "Xeyr",
    specialtyScore: "İxtisas balı (0-40)",
    methodologyScore: "Metodika balı (0-20)",
    interviewScore: "Müsahibə balı",
    avgScore: "Orta bal",
    certBonus35: "Əlavə: +35%",
    certBonus10: "Əlavə: +10%",
    certNotMet: "Sertifikatlaşma şərtləri ödənilməmişdir",
    institutionType: "Müəssisə tipi",
    hasCharter: "Nizamnamə var",
    charterNote: "Lisey saatlarına +15% əlavə olunur",
    subjectName: "Tədris olunan fənnin adı",
    physEd: "Bədən Tərbiyəsi",
    militaryInstr: "Hərbi rəhbər",
    other: "Digər",
    militaryInstrTitle: "Hərbi rəhbər",
    militaryInstrNote: "Ümumtəhsil məktəblərində, lisey və gimnaziyalarda hərbi rəhbərin həftədə 8 saata qədər tədris etdikləri dərs saatlarının əmək haqqı vəzifə maaşına daxildir. Əlavə olaraq həftədə 12 saata qədər dərs yükü verilə bilər. Zəruri ehtiyac yaranarsa həftədə 6 saata qədər əlavə dərs verilə bilər.",
    qualificationLevel: "İxtisas səviyyəsi",
    positionSalary: "Vəzifə maaşı",
    weeklyHours: "Həftəlik dərs yükü (saat)",
    first8HoursNote: "İlk 8 saat vəzifə maaşına daxildir. 8-dən yuxarı saatlar əlavə ödənilir.",
    gymExtracurricular: "Bədən tərbiyəsi üzrə sinifdənkənar işlər",
    gymExtracurricularTitle: "Bədən tərbiyəsi üzrə sinifdənkənar işlərin aparılması",
    gymExtracurricularNote: "Ümumtəhsil müəssisələrində bədən tərbiyəsi üzrə şagirdlərlə sinifdənkənar işlər iki və daha çox müəllim tərəfindən aparıldıqda əlavənin məbləği iş həcmindən asılı olaraq onlar arasında bölünür.",
    classCount: "Siniflərin sayını göstərin",
    selectClassCount: "Siniflərin sayını göstərin",
    classes10_19: "10-19-a qədər",
    classes20_29: "20-29-a qədər",
    classes30plus: "30-dan çox",
    teacherCount: "Müəllim sayı",
    person: "nəfər",
    extracurricularPayment: "Sinifdənkənar ödəniş",
    lessonLoad: "Dərs yükü",
    generalEdHours: "Ümumtəhsil siniflərində dərs yükü",
    generalEdClubHours: "Ümumtəhsil dərnək saatları",
    lyceeHours: "Lisey siniflərdə dərs yükü",
    lyceeClubHours: "Lisey dərnək saatları",
    specialEdHours: "Xüsusi təhsil müəssisələrində dərs yükü",
    specialEdClubHours: "Xüsusi təhsil dərnək saatları",
    clubLeaderLevel: "Dərnək rəhbərinin dərəcəsi",
    stavkaNorm: "Stavka norması",
    hoursPerWeek: "saat/həftə",
    hours: "saat",
    classLeadership: "Sinif rəhbərliyi",
    classLeadershipNote: "+40 AZN",
    classLeadershipNotPassedNote: (range: string) => `Stavkanın ${range === "1_4" ? "15" : "20"}%-i`,
    grades1_4: "1-4 siniflər (15%)",
    grades5_11: "5-11 siniflər (20%)",
    scientificDegree: "Elmi dərəcə",
    scientificDegreeHolder: "Elmi dərəcəsi olan / fəxri adlar / dərslik müəllifləri",
    philosophyDoctor: "Fəlsəfə doktoru",
    scienceDoctor: "Elmlər doktoru",
    workConditions: "Əmək şəraiti əlavələri",
    selected: "Seçilib",
    taxExemptions: "Vergi güzəştləri",
    tradeUnion: "Həmkarlar ittifaqı",
    unionMember: "Üzvdür (1% tutulma)",
    notMember: "Üzv deyil",
    mainJob: "Əsas iş yeri",
    mainJobNote: "Əsas iş yeri olduqda 200 AZN vergi güzəşti tətbiq olunur",
    otherDeductions: "Digər tutulmalar",
    amountAZN: "Məbləğ (AZN)",
    percentage: "Faiz (%)",
    netSalary: "Net maaş (əlinizə çatan)",
    perMonth: "AZN / ay",
    grossSalary: "Gross maaş",
    diagnostic: "Diaqnostik",
    stavka: "Stavka",
    salaryBreakdown: "Maaşın tərkibi",
    militaryBaseSalary: "Hərbi rəhbər baza maaşı",
    extraHoursPayment: "8 saatdan yuxarı əlavə ödəniş",
    lessonLoadSalary: "Dərs yükü maaşı",
    institutionBonus: "Müəssisə tipi əlavəsi",
    clubHours: "Dərnək saatları",
    extracurricularWork: "Sinifdənkənar işlər (bədən tərb.)",
    certificationBonus: "Sertifikatlaşma əlavəsi",
    workConditionBonus: "Əmək şəraiti əlavəsi",
    fixedBonuses: "Sabit əlavələr",
    classLeaderShort: "sinif rəhb.",
    scientificDegreeShort: "elmi dər.",
    philosophyDoctorShort: "fəlsəfə d.",
    scienceDoctorShort: "elmlər d.",
    deductions: "Tutulmalar",
    incomeTax: "Gəlir vergisi (14%)",
    exemption: "güzəşt",
    taxExempt: "Gəlir vergisi (vergidən azad)",
    dsmf: "DSMF (3%)",
    unemploymentIns: "İşsizlik sığortası (0.5%)",
    medicalIns: "Tibbi sığorta (2%)",
    tradeUnionFee: "Həmkarlar ittifaqı (1%)",
    otherDeductionsLabel: "Digər tutulmalar",
    totalDeductions: "Cəmi tutulmalar",
    annualNetSalary: "İllik net maaş",
    annualGrossSalary: "İllik gross maaş",
  },
  en: {
    title: "Teacher Salary Calculator",
    description: "Salary calculation for teachers working in state general education institutions (based on edu.gov.az data)",
    breadcrumbCategory: "Finance",
    breadcrumbLabel: "Teacher salary calculator",
    diagnosticAssessment: "Diagnostic assessment",
    passed: "Passed",
    notPassed: "Not passed",
    education: "Education",
    highEd: "Higher education",
    technicalEd: "Technical education",
    secondaryEd: "Secondary education",
    pedagogicalExp: "Pedagogical experience",
    certification: "Certification",
    yes: "Yes",
    no: "No",
    specialtyScore: "Specialty score (0-40)",
    methodologyScore: "Methodology score (0-20)",
    interviewScore: "Interview score",
    avgScore: "Average score",
    certBonus35: "Bonus: +35%",
    certBonus10: "Bonus: +10%",
    certNotMet: "Certification requirements not met",
    institutionType: "Institution type",
    hasCharter: "Has charter",
    charterNote: "+15% added to lycee hours",
    subjectName: "Subject taught",
    physEd: "Physical Education",
    militaryInstr: "Military instructor",
    other: "Other",
    militaryInstrTitle: "Military instructor",
    militaryInstrNote: "In general education schools, lyceums and gymnasiums, the salary for up to 8 hours per week taught by the military instructor is included in the position salary. Additionally, up to 12 hours per week of teaching load can be given. If necessary, up to 6 additional hours per week can be assigned.",
    qualificationLevel: "Qualification level",
    positionSalary: "Position salary",
    weeklyHours: "Weekly teaching hours",
    first8HoursNote: "First 8 hours are included in the position salary. Hours above 8 are paid additionally.",
    gymExtracurricular: "PE extracurricular activities",
    gymExtracurricularTitle: "Conducting PE extracurricular activities with students",
    gymExtracurricularNote: "In general education institutions, when PE extracurricular activities are conducted by two or more teachers, the bonus amount is divided among them depending on the workload.",
    classCount: "Number of classes",
    selectClassCount: "Select number of classes",
    classes10_19: "10-19 classes",
    classes20_29: "20-29 classes",
    classes30plus: "30+ classes",
    teacherCount: "Number of teachers",
    person: "persons",
    extracurricularPayment: "Extracurricular payment",
    lessonLoad: "Teaching load",
    generalEdHours: "General education class hours",
    generalEdClubHours: "General education club hours",
    lyceeHours: "Lycee class hours",
    lyceeClubHours: "Lycee club hours",
    specialEdHours: "Special education institution hours",
    specialEdClubHours: "Special education club hours",
    clubLeaderLevel: "Club leader level",
    stavkaNorm: "Rate norm",
    hoursPerWeek: "hours/week",
    hours: "hours",
    classLeadership: "Class leadership",
    classLeadershipNote: "+40 AZN",
    classLeadershipNotPassedNote: (range: string) => `${range === "1_4" ? "15" : "20"}% of the rate`,
    grades1_4: "Grades 1-4 (15%)",
    grades5_11: "Grades 5-11 (20%)",
    scientificDegree: "Scientific degree",
    scientificDegreeHolder: "Scientific degree holders / honorary titles / textbook authors",
    philosophyDoctor: "Doctor of Philosophy",
    scienceDoctor: "Doctor of Sciences",
    workConditions: "Work condition bonuses",
    selected: "Selected",
    taxExemptions: "Tax exemptions",
    tradeUnion: "Trade union",
    unionMember: "Member (1% deduction)",
    notMember: "Not a member",
    mainJob: "Main workplace",
    mainJobNote: "200 AZN tax exemption applies if this is the main workplace",
    otherDeductions: "Other deductions",
    amountAZN: "Amount (AZN)",
    percentage: "Percentage (%)",
    netSalary: "Net salary (take-home)",
    perMonth: "AZN / month",
    grossSalary: "Gross salary",
    diagnostic: "Diagnostic",
    stavka: "Rate",
    salaryBreakdown: "Salary breakdown",
    militaryBaseSalary: "Military instructor base salary",
    extraHoursPayment: "Extra payment above 8 hours",
    lessonLoadSalary: "Teaching load salary",
    institutionBonus: "Institution type bonus",
    clubHours: "Club hours",
    extracurricularWork: "Extracurricular activities (PE)",
    certificationBonus: "Certification bonus",
    workConditionBonus: "Work condition bonus",
    fixedBonuses: "Fixed bonuses",
    classLeaderShort: "class lead.",
    scientificDegreeShort: "sci. deg.",
    philosophyDoctorShort: "PhD",
    scienceDoctorShort: "DSc",
    deductions: "Deductions",
    incomeTax: "Income tax (14%)",
    exemption: "exemption",
    taxExempt: "Income tax (tax exempt)",
    dsmf: "SSPF (3%)",
    unemploymentIns: "Unemployment insurance (0.5%)",
    medicalIns: "Medical insurance (2%)",
    tradeUnionFee: "Trade union (1%)",
    otherDeductionsLabel: "Other deductions",
    totalDeductions: "Total deductions",
    annualNetSalary: "Annual net salary",
    annualGrossSalary: "Annual gross salary",
  },
  ru: {
    title: "Калькулятор зарплаты учителя",
    description: "Расчёт заработной платы учителей государственных общеобразовательных учреждений (на основе данных edu.gov.az)",
    breadcrumbCategory: "Финансы",
    breadcrumbLabel: "Калькулятор зарплаты учителя",
    diagnosticAssessment: "Диагностическая оценка",
    passed: "Сдал",
    notPassed: "Не сдал",
    education: "Образование",
    highEd: "Высшее образование",
    technicalEd: "Среднее специальное",
    secondaryEd: "Среднее образование",
    pedagogicalExp: "Педагогический стаж",
    certification: "Сертификация",
    yes: "Да",
    no: "Нет",
    specialtyScore: "Балл по специальности (0-40)",
    methodologyScore: "Балл по методике (0-20)",
    interviewScore: "Балл собеседования",
    avgScore: "Средний балл",
    certBonus35: "Надбавка: +35%",
    certBonus10: "Надбавка: +10%",
    certNotMet: "Условия сертификации не выполнены",
    institutionType: "Тип учреждения",
    hasCharter: "Есть устав",
    charterNote: "+15% к лицейским часам",
    subjectName: "Преподаваемый предмет",
    physEd: "Физкультура",
    militaryInstr: "Военный руководитель",
    other: "Другое",
    militaryInstrTitle: "Военный руководитель",
    militaryInstrNote: "В общеобразовательных школах, лицеях и гимназиях оплата за преподавание до 8 часов в неделю военным руководителем включена в должностной оклад. Дополнительно может быть назначена нагрузка до 12 часов в неделю. При необходимости — до 6 дополнительных часов.",
    qualificationLevel: "Уровень квалификации",
    positionSalary: "Должностной оклад",
    weeklyHours: "Недельная нагрузка (часов)",
    first8HoursNote: "Первые 8 часов включены в должностной оклад. Часы свыше 8 оплачиваются дополнительно.",
    gymExtracurricular: "Внеклассная работа по физкультуре",
    gymExtracurricularTitle: "Проведение внеклассной работы по физкультуре с учащимися",
    gymExtracurricularNote: "В общеобразовательных учреждениях, когда внеклассная работа по физкультуре проводится двумя и более учителями, сумма надбавки делится между ними в зависимости от объёма работы.",
    classCount: "Количество классов",
    selectClassCount: "Укажите количество классов",
    classes10_19: "10-19 классов",
    classes20_29: "20-29 классов",
    classes30plus: "30+ классов",
    teacherCount: "Количество учителей",
    person: "чел.",
    extracurricularPayment: "Оплата внеклассной работы",
    lessonLoad: "Учебная нагрузка",
    generalEdHours: "Часы в общеобразовательных классах",
    generalEdClubHours: "Часы кружков общеобразовательных",
    lyceeHours: "Часы в лицейских классах",
    lyceeClubHours: "Часы кружков лицейских",
    specialEdHours: "Часы в спец. образовательных учреждениях",
    specialEdClubHours: "Часы кружков спец. образования",
    clubLeaderLevel: "Уровень руководителя кружка",
    stavkaNorm: "Норма ставки",
    hoursPerWeek: "час/нед.",
    hours: "часов",
    classLeadership: "Классное руководство",
    classLeadershipNote: "+40 AZN",
    classLeadershipNotPassedNote: (range: string) => `${range === "1_4" ? "15" : "20"}% от ставки`,
    grades1_4: "1-4 классы (15%)",
    grades5_11: "5-11 классы (20%)",
    scientificDegree: "Учёная степень",
    scientificDegreeHolder: "Обладатели учёной степени / почётных званий / авторы учебников",
    philosophyDoctor: "Доктор философии",
    scienceDoctor: "Доктор наук",
    workConditions: "Надбавки за условия труда",
    selected: "Выбрано",
    taxExemptions: "Налоговые льготы",
    tradeUnion: "Профсоюз",
    unionMember: "Член (удержание 1%)",
    notMember: "Не член",
    mainJob: "Основное место работы",
    mainJobNote: "Налоговая льгота 200 AZN при основном месте работы",
    otherDeductions: "Прочие удержания",
    amountAZN: "Сумма (AZN)",
    percentage: "Процент (%)",
    netSalary: "Чистая зарплата (на руки)",
    perMonth: "AZN / мес.",
    grossSalary: "Брутто зарплата",
    diagnostic: "Диагностика",
    stavka: "Ставка",
    salaryBreakdown: "Состав зарплаты",
    militaryBaseSalary: "Базовый оклад военного руководителя",
    extraHoursPayment: "Доплата за часы свыше 8",
    lessonLoadSalary: "Зарплата за учебную нагрузку",
    institutionBonus: "Надбавка за тип учреждения",
    clubHours: "Часы кружков",
    extracurricularWork: "Внеклассная работа (физк.)",
    certificationBonus: "Надбавка за сертификацию",
    workConditionBonus: "Надбавка за условия труда",
    fixedBonuses: "Фиксированные надбавки",
    classLeaderShort: "класс. рук.",
    scientificDegreeShort: "уч. степ.",
    philosophyDoctorShort: "докт. филос.",
    scienceDoctorShort: "докт. наук",
    deductions: "Удержания",
    incomeTax: "Подоходный налог (14%)",
    exemption: "льгота",
    taxExempt: "Подоходный налог (освобождён)",
    dsmf: "ГФСЗ (3%)",
    unemploymentIns: "Страхование от безработицы (0.5%)",
    medicalIns: "Медицинское страхование (2%)",
    tradeUnionFee: "Профсоюз (1%)",
    otherDeductionsLabel: "Прочие удержания",
    totalDeductions: "Итого удержания",
    annualNetSalary: "Годовая чистая зарплата",
    annualGrossSalary: "Годовая брутто зарплата",
  },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ============================================================
export default function TeacherSalaryCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  // 1. Diaqnostik
  const [examPassed, setExamPassed] = useState(true);
  // 2. Təhsil
  const [education, setEducation] = useState<"high" | "technical" | "secondary">("high");
  // 3. Pedaqoji staj
  const [experience, setExperience] = useState("0_3");
  // 4. Sertifikatlaşma
  const [hasCertification, setHasCertification] = useState(false);
  const [ixtisasBal, setIxtisasBal] = useState("");
  const [metodikaBal, setMetodikaBal] = useState("");
  const [musahibeBal, setMusahibeBal] = useState("");
  // 5. Müəssisə tipi
  const [institution, setInstitution] = useState<InstitutionType>("1");
  const [hasNizamname, setHasNizamname] = useState(false);
  // 6. Tədris olunan fənn (checkboxes — multiple can be selected)
  const [hasBeden, setHasBeden] = useState(false);
  const [hasHerbi, setHasHerbi] = useState(false);
  const [hasDiger, setHasDiger] = useState(true);
  // 7. Hour inputs — all 6 shown regardless of institution type
  const [umumtehsilHours, setUmumtehsilHours] = useState("");
  const [liseyHours, setLiseyHours] = useState("");
  const [xususiHours, setXususiHours] = useState("");
  // Dərnək
  const [umumtehsilDernekHours, setUmumtehsilDernekHours] = useState("");
  const [liseyDernekHours, setLiseyDernekHours] = useState("");
  const [xususiDernekHours, setXususiDernekHours] = useState("");
  const [dernekLevel, setDernekLevel] = useState("level_8");
  // Bədən Tərbiyəsi extras
  const [gymClassRange, setGymClassRange] = useState("");
  const [gymTeacherCount, setGymTeacherCount] = useState("1");
  // Hərbi rəhbər
  const [militaryLevel, setMilitaryLevel] = useState(0);
  const [militaryHours, setMilitaryHours] = useState("");
  // 8. Sinif rəhbərliyi
  const [isClassLeader, setIsClassLeader] = useState(false);
  const [classGradeRange, setClassGradeRange] = useState<"1_4" | "5_11">("5_11");
  // 9. Elmi dərəcə
  const [hasElmiDerece, setHasElmiDerece] = useState(false);
  const [hasFelsefe, setHasFelsefe] = useState(false);
  const [hasElmler, setHasElmler] = useState(false);
  // 10. Əmək şəraiti
  const [workConditions, setWorkConditions] = useState<Record<string, number>>({});
  const [showWorkConditions, setShowWorkConditions] = useState(false);
  // 11. Vergi güzəştləri
  const [taxExemptions, setTaxExemptions] = useState<Record<string, boolean>>({});
  // 12. Həmkarlar
  const [isUnionMember, setIsUnionMember] = useState(false);
  // 13. Əsas iş yeri
  const [isMainJob, setIsMainJob] = useState(true);
  // 14. Digər tutulmalar
  const [otherDeductionAZN, setOtherDeductionAZN] = useState("");
  const [otherDeductionPct, setOtherDeductionPct] = useState("");

  const needsExperience = education !== "secondary";

  // ---- calculation ----
  const result = useMemo(() => {
    const table = examPassed ? SALARY_PASSED : SALARY_NOT_PASSED;
    const eduTable = table[education];
    let stavka: number;
    if (typeof eduTable === "number") {
      stavka = eduTable;
    } else {
      stavka = (eduTable as Record<string, number>)[experience] ?? 0;
    }

    let dersYukuSalary = 0;
    let institutionBonus = 0;
    let gymExtraSalary = 0;
    let dernekSalary = 0;
    let militaryBaseSalary = 0;
    let militaryExtraHoursSalary = 0;
    let totalHours = 0;

    const uH = parseFloat(umumtehsilHours) || 0;
    const lH = parseFloat(liseyHours) || 0;
    const xH = parseFloat(xususiHours) || 0;
    const uDH = parseFloat(umumtehsilDernekHours) || 0;
    const lDH = parseFloat(liseyDernekHours) || 0;
    const xDH = parseFloat(xususiDernekHours) || 0;
    const hobbyStavka = HOBBY_GROUP_SALARY[dernekLevel] ?? 458;

    if (uH > 0) {
      const uSalary = stavka * (uH / STANDARD_HOURS);
      dersYukuSalary += uSalary;
      totalHours += uH;
      if (institution === "2") institutionBonus += uSalary * 0.15;
    }

    if (lH > 0) {
      const lSalary = stavka * (lH / STANDARD_HOURS);
      dersYukuSalary += lSalary;
      totalHours += lH;
      if (institution === "1" && hasNizamname) institutionBonus += lSalary * 0.15;
      if (institution === "2") institutionBonus += lSalary * 0.15;
    }

    if (xH > 0) {
      const xSalary = stavka * (xH / STANDARD_HOURS);
      dersYukuSalary += xSalary;
      institutionBonus += xSalary * 0.50;
      totalHours += xH;
    }

    if (uDH > 0) {
      let d = hobbyStavka * (uDH / STANDARD_HOURS);
      if (institution === "2") d *= 1.15;
      dernekSalary += d;
    }
    if (lDH > 0) {
      let d = hobbyStavka * (lDH / STANDARD_HOURS);
      if (institution === "1" && hasNizamname) d *= 1.15;
      if (institution === "2") d *= 1.15;
      dernekSalary += d;
    }
    if (xDH > 0) {
      let d = hobbyStavka * (xDH / STANDARD_HOURS);
      d *= 1.50;
      dernekSalary += d;
    }

    if (hasHerbi) {
      const milSalaries = examPassed ? MILITARY_SALARY_PASSED : MILITARY_SALARY_NOT_PASSED;
      militaryBaseSalary = milSalaries[militaryLevel];
      const milHours = parseFloat(militaryHours) || 0;
      if (milHours > 8) {
        militaryExtraHoursSalary = stavka * ((milHours - 8) / STANDARD_HOURS);
      }
      totalHours += milHours;
      if (institution === "3" && militaryExtraHoursSalary > 0) {
        institutionBonus += militaryExtraHoursSalary * 0.50;
      }
    }

    if (hasBeden && gymClassRange) {
      const gymData = examPassed ? GYM_EXTRA_PASSED : GYM_EXTRA_NOT_PASSED;
      const gymBase = gymData[gymClassRange as keyof typeof gymData] ?? 0;
      const teacherCount = Math.max(1, parseInt(gymTeacherCount) || 1);
      gymExtraSalary = gymBase / teacherCount;
    }

    const hasAnySalary = dersYukuSalary > 0 || militaryBaseSalary > 0 || gymExtraSalary > 0 || dernekSalary > 0 || militaryExtraHoursSalary > 0;
    if (!hasAnySalary && totalHours <= 0 && !hasHerbi) return null;

    const dersYukuWithInst = dersYukuSalary + institutionBonus;

    let certBonus = 0;
    if (examPassed && hasCertification) {
      const ix = parseFloat(ixtisasBal) || 0;
      const met = parseFloat(metodikaBal) || 0;
      const mus = parseFloat(musahibeBal) || 0;
      const avg = (ix + met) / 2;
      const certBase = dersYukuWithInst + militaryBaseSalary + militaryExtraHoursSalary;
      if (avg >= 30 && mus >= 20) {
        certBonus = avg >= 51 ? certBase * 0.35 : certBase * 0.10;
      }
    }

    let taxableFixed = 0;
    if (isClassLeader) {
      if (examPassed) {
        taxableFixed += 40;
      } else {
        const clPct = CLASS_LEADER_NOT_PASSED[classGradeRange] ?? 0.20;
        taxableFixed += stavka * clPct;
      }
    }
    if (hasElmiDerece) taxableFixed += 45;
    if (hasFelsefe) taxableFixed += 60;
    if (hasElmler) taxableFixed += 100;

    let workConditionTotal = 0;
    const totalCondPct = Object.values(workConditions).reduce((s, v) => s + v, 0);
    if (totalCondPct > 0) {
      const baseForConditions = dersYukuWithInst + militaryBaseSalary + militaryExtraHoursSalary;
      workConditionTotal = baseForConditions * (totalCondPct / 100);
    }

    const grossSalary = dersYukuWithInst + militaryBaseSalary + militaryExtraHoursSalary
      + certBonus + taxableFixed + workConditionTotal + gymExtraSalary + dernekSalary;

    if (grossSalary <= 0) return null;

    let totalTaxExemption = isMainJob ? 200 : 0;
    let isFullExempt = false;
    for (const ex of TAX_EXEMPTIONS) {
      if (taxExemptions[ex.id]) {
        if (ex.fullExempt) { isFullExempt = true; break; }
        totalTaxExemption += ex.amount;
      }
    }

    let incomeTax = 0;
    if (!isFullExempt) {
      const taxableIncome = Math.max(0, grossSalary - totalTaxExemption);
      incomeTax = taxableIncome * 0.14;
    }

    const dsmf = grossSalary * 0.03;
    const unemployment = grossSalary * 0.005;
    const medical = grossSalary * 0.02;
    const unionDue = isUnionMember ? grossSalary * 0.01 : 0;

    const otherAZN = parseFloat(otherDeductionAZN) || 0;
    const otherPct = parseFloat(otherDeductionPct) || 0;
    const otherDeduction = otherAZN + (grossSalary * otherPct / 100);

    const totalDeductions = incomeTax + dsmf + unemployment + medical + unionDue + otherDeduction;
    const netSalary = grossSalary - totalDeductions;

    return {
      stavka, totalHours, dersYukuSalary, institutionBonus, dersYukuWithInst,
      militaryBaseSalary, militaryExtraHoursSalary, gymExtraSalary, dernekSalary,
      certBonus, taxableFixed, workConditionTotal, totalCondPct,
      grossSalary, totalTaxExemption, isFullExempt,
      incomeTax, dsmf, unemployment, medical, unionDue, otherDeduction, totalDeductions, netSalary,
    };
  }, [
    examPassed, education, experience, institution, hasNizamname,
    hasBeden, hasHerbi, hasDiger,
    umumtehsilHours, liseyHours, xususiHours,
    umumtehsilDernekHours, liseyDernekHours, xususiDernekHours, dernekLevel,
    gymClassRange, gymTeacherCount,
    militaryLevel, militaryHours,
    hasCertification, ixtisasBal, metodikaBal, musahibeBal,
    isClassLeader, classGradeRange,
    hasElmiDerece, hasFelsefe, hasElmler,
    workConditions,
    taxExemptions, isUnionMember, isMainJob,
    otherDeductionAZN, otherDeductionPct,
  ]);

  // ---- style helpers ----
  const toggleBtn = (active: boolean) =>
    `px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
      active
        ? "border-primary bg-primary-light ring-2 ring-primary text-foreground"
        : "border-border bg-white hover:border-primary/30 text-muted"
    }`;

  const checkboxCard = (checked: boolean) =>
    `flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
      checked ? "border-primary bg-primary-light" : "border-border bg-white hover:border-primary/30"
    }`;

  const radioCard = (checked: boolean) =>
    `flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
      checked ? "border-primary bg-primary-light ring-2 ring-primary" : "border-border bg-white hover:border-primary/30"
    }`;

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm";
  const inputLgCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";
  const sectionTitle = "block text-sm font-medium text-foreground mb-3";
  const subLabel = "block text-xs font-medium text-foreground mb-1";

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.breadcrumbLabel },
      ]}
      relatedIds={["salary", "overtime", "freelancer-tax", "unemployment-benefit"]}
    >
      {/* ===================== 1. Diaqnostik ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.diagnosticAssessment}</label>
        <div className="flex gap-3">
          <button onClick={() => setExamPassed(true)} className={toggleBtn(examPassed)}>{pt.passed}</button>
          <button onClick={() => setExamPassed(false)} className={toggleBtn(!examPassed)}>{pt.notPassed}</button>
        </div>
      </div>

      {/* ===================== 2. Tehsil ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.education}</label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: "high" as const, label: pt.highEd },
            { id: "technical" as const, label: pt.technicalEd },
            { id: "secondary" as const, label: pt.secondaryEd },
          ]).map((e) => (
            <button key={e.id} onClick={() => setEducation(e.id)} className={toggleBtn(education === e.id)}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== 3. Pedaqoji staj ===================== */}
      {needsExperience && (
        <div className="mb-6">
          <label className={sectionTitle}>{pt.pedagogicalExp}</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button key={opt.id} onClick={() => setExperience(opt.id)} className={toggleBtn(experience === opt.id)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================== 4. Sertifikatlasma (only Kecib) ===================== */}
      {examPassed && (
        <div className="mb-6">
          <label className={sectionTitle}>{pt.certification}</label>
          <div className="flex gap-3 mb-3">
            <button onClick={() => setHasCertification(true)} className={toggleBtn(hasCertification)}>{pt.yes}</button>
            <button onClick={() => setHasCertification(false)} className={toggleBtn(!hasCertification)}>{pt.no}</button>
          </div>
          {hasCertification && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div>
                <label className={subLabel}>{pt.specialtyScore}</label>
                <input type="number" value={ixtisasBal} onChange={(e) => setIxtisasBal(e.target.value)}
                  min="0" max="40" placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={subLabel}>{pt.methodologyScore}</label>
                <input type="number" value={metodikaBal} onChange={(e) => setMetodikaBal(e.target.value)}
                  min="0" max="20" placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={subLabel}>{pt.interviewScore}</label>
                <input type="number" value={musahibeBal} onChange={(e) => setMusahibeBal(e.target.value)}
                  min="0" placeholder="0" className={inputCls} />
              </div>
              {(() => {
                const ix = parseFloat(ixtisasBal) || 0;
                const met = parseFloat(metodikaBal) || 0;
                const mus = parseFloat(musahibeBal) || 0;
                const avg = (ix + met) / 2;
                if (ix === 0 && met === 0 && mus === 0) return null;
                const qualified = avg >= 30 && mus >= 20;
                return (
                  <div className="col-span-full">
                    <p className={`text-xs font-medium ${qualified ? "text-green-700" : "text-red-600"}`}>
                      {pt.avgScore}: {avg.toFixed(1)}
                      {qualified
                        ? avg >= 51 ? ` — ${pt.certBonus35}` : ` — ${pt.certBonus10}`
                        : ` — ${pt.certNotMet}`}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ===================== 5. Muessise tipi ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.institutionType}</label>
        <div className="space-y-2">
          {INSTITUTION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setInstitution(opt.id); if (opt.id !== "1") setHasNizamname(false); }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                institution === opt.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted">{opt.bonus}</p>
            </button>
          ))}
        </div>
        {institution === "1" && (
          <label className={`mt-3 ${checkboxCard(hasNizamname)}`}>
            <input type="checkbox" checked={hasNizamname} onChange={(e) => setHasNizamname(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">{pt.hasCharter}</p>
              <p className="text-[10px] text-muted">{pt.charterNote}</p>
            </div>
          </label>
        )}
      </div>

      {/* ===================== 6. Tədris olunan fənn ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.subjectName}</label>
        <div className="grid grid-cols-3 gap-3">
          <label className={checkboxCard(hasBeden)}>
            <input type="checkbox" checked={hasBeden} onChange={(e) => setHasBeden(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs font-medium text-foreground">{pt.physEd}</span>
          </label>
          <label className={checkboxCard(hasHerbi)}>
            <input type="checkbox" checked={hasHerbi} onChange={(e) => setHasHerbi(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs font-medium text-foreground">{pt.militaryInstr}</span>
          </label>
          <label className={checkboxCard(hasDiger)}>
            <input type="checkbox" checked={hasDiger} onChange={(e) => setHasDiger(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs font-medium text-foreground">{pt.other}</span>
          </label>
        </div>
      </div>

      {/* ===================== 7. HOUR INPUTS ===================== */}

      {/* --- Hərbi rəhbər --- */}
      {hasHerbi && (
        <div className="mb-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-2">{pt.militaryInstrTitle}</p>
            <p className="text-xs text-amber-700 mb-3 leading-relaxed">{pt.militaryInstrNote}</p>
            <label className={subLabel}>{pt.qualificationLevel}</label>
            <div className="space-y-2 mt-2">
              {MILITARY_LABELS.map((label, idx) => {
                const salaryVal = examPassed ? MILITARY_SALARY_PASSED[idx] : MILITARY_SALARY_NOT_PASSED[idx];
                return (
                  <label key={idx} className={radioCard(militaryLevel === idx)}>
                    <input type="radio" name="militaryLevel" checked={militaryLevel === idx}
                      onChange={() => setMilitaryLevel(idx)}
                      className="w-4 h-4 mt-0.5 shrink-0 text-primary focus:ring-primary" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted">{pt.positionSalary}: {fmt(salaryVal)} AZN</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className={subLabel}>{pt.weeklyHours}</label>
            <input type="number" value={militaryHours} onChange={(e) => setMilitaryHours(e.target.value)}
              placeholder="8" min="0" max="26" className={inputLgCls} />
            <p className="text-xs text-muted mt-1">{pt.first8HoursNote}</p>
          </div>
        </div>
      )}

      {/* --- Dərs yükü sahələri --- */}
      {(hasBeden || hasDiger) && (
        <div className="mb-6 space-y-4">
          {hasBeden && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{pt.gymExtracurricularTitle}</p>
              <p className="text-xs text-green-700 leading-relaxed">{pt.gymExtracurricularNote}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={subLabel}>{pt.classCount}</label>
                  <select value={gymClassRange} onChange={(e) => setGymClassRange(e.target.value)} className={inputCls}>
                    <option value="">{pt.selectClassCount}</option>
                    <option value="10_19">{pt.classes10_19}</option>
                    <option value="20_29">{pt.classes20_29}</option>
                    <option value="30_up">{pt.classes30plus}</option>
                  </select>
                </div>
                <div>
                  <label className={subLabel}>{pt.teacherCount}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={gymTeacherCount} onChange={(e) => setGymTeacherCount(e.target.value)}
                      min="1" placeholder="1" className={inputCls} />
                    <span className="text-xs text-muted whitespace-nowrap">{pt.person}</span>
                  </div>
                </div>
              </div>
              {gymClassRange && (
                <p className="text-xs text-green-700 font-medium">
                  {pt.extracurricularPayment}: {fmt(
                    (examPassed ? GYM_EXTRA_PASSED : GYM_EXTRA_NOT_PASSED)[gymClassRange as keyof typeof GYM_EXTRA_PASSED] /
                    Math.max(1, parseInt(gymTeacherCount) || 1)
                  )} AZN
                </p>
              )}
            </div>
          )}

          {/* All 6 hour inputs shown */}
          <div className="bg-gray-50 border border-border rounded-xl p-4 space-y-4">
            <p className="text-sm font-medium text-foreground">{pt.lessonLoad}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={subLabel}>
                  {pt.generalEdHours}
                  {institution === "2" && <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={umumtehsilHours} onChange={(e) => setUmumtehsilHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">{pt.hours}</span>
                </div>
              </div>
              <div>
                <label className={subLabel}>
                  {pt.generalEdClubHours}
                  {institution === "2" && <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={umumtehsilDernekHours}
                    onChange={(e) => setUmumtehsilDernekHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">{pt.hours}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={subLabel}>
                  {pt.lyceeHours}
                  {(institution === "2" || (institution === "1" && hasNizamname)) &&
                    <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={liseyHours} onChange={(e) => setLiseyHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">{pt.hours}</span>
                </div>
              </div>
              <div>
                <label className={subLabel}>
                  {pt.lyceeClubHours}
                  {(institution === "2" || (institution === "1" && hasNizamname)) &&
                    <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={liseyDernekHours}
                    onChange={(e) => setLiseyDernekHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">{pt.hours}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={subLabel}>
                  {pt.specialEdHours}
                  <span className="text-green-600 ml-1">(+50%)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={xususiHours} onChange={(e) => setXususiHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">{pt.hours}</span>
                </div>
              </div>
              <div>
                <label className={subLabel}>
                  {pt.specialEdClubHours}
                  <span className="text-green-600 ml-1">(+50%)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={xususiDernekHours}
                    onChange={(e) => setXususiDernekHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">{pt.hours}</span>
                </div>
              </div>
            </div>

            {((parseFloat(umumtehsilDernekHours) || 0) > 0 || (parseFloat(liseyDernekHours) || 0) > 0 || (parseFloat(xususiDernekHours) || 0) > 0) && (
              <div className="border-t border-border pt-3">
                <label className={subLabel}>{pt.clubLeaderLevel}</label>
                <select value={dernekLevel} onChange={(e) => setDernekLevel(e.target.value)} className={inputCls}>
                  {HOBBY_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-xs text-muted">{pt.stavkaNorm}: {STANDARD_HOURS} {pt.hoursPerWeek}</p>
          </div>
        </div>
      )}

      {/* ===================== 8. Sinif rəhbərliyi ===================== */}
      <div className="mb-6">
        <label className={checkboxCard(isClassLeader)}>
          <input type="checkbox" checked={isClassLeader} onChange={(e) => setIsClassLeader(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{pt.classLeadership}</p>
            <p className="text-xs text-muted">
              {examPassed ? pt.classLeadershipNote : pt.classLeadershipNotPassedNote(classGradeRange)}
            </p>
          </div>
        </label>
        {isClassLeader && !examPassed && (
          <div className="mt-2 flex gap-3">
            <button onClick={() => setClassGradeRange("1_4")} className={toggleBtn(classGradeRange === "1_4")}>
              {pt.grades1_4}
            </button>
            <button onClick={() => setClassGradeRange("5_11")} className={toggleBtn(classGradeRange === "5_11")}>
              {pt.grades5_11}
            </button>
          </div>
        )}
      </div>

      {/* ===================== 9. Elmi dərəcə ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.scientificDegree}</label>
        <div className="space-y-2">
          <label className={checkboxCard(hasElmiDerece)}>
            <input type="checkbox" checked={hasElmiDerece} onChange={(e) => setHasElmiDerece(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">{pt.scientificDegreeHolder}</p>
              <p className="text-[10px] text-muted">+45 AZN</p>
            </div>
          </label>
          <label className={checkboxCard(hasFelsefe)}>
            <input type="checkbox" checked={hasFelsefe} onChange={(e) => setHasFelsefe(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">{pt.philosophyDoctor}</p>
              <p className="text-[10px] text-muted">+60 AZN</p>
            </div>
          </label>
          <label className={checkboxCard(hasElmler)}>
            <input type="checkbox" checked={hasElmler} onChange={(e) => setHasElmler(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">{pt.scienceDoctor}</p>
              <p className="text-[10px] text-muted">+100 AZN</p>
            </div>
          </label>
        </div>
      </div>

      {/* ===================== 10. Emek seraiti (collapsible) ===================== */}
      <div className="mb-6">
        <button
          onClick={() => setShowWorkConditions(!showWorkConditions)}
          className="flex items-center justify-between w-full p-3 rounded-xl border border-border bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">
            {pt.workConditions}
            {Object.values(workConditions).some((v) => v > 0) && (
              <span className="ml-2 text-xs text-primary">({pt.selected})</span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-muted transition-transform ${showWorkConditions ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showWorkConditions && (
          <div className="mt-3 space-y-4 bg-gray-50 border border-border rounded-xl p-4">
            {WORK_CONDITIONS.map((cond) => (
              <div key={cond.id}>
                <label className={subLabel}>{cond.label}</label>
                <select
                  value={workConditions[cond.id] ?? 0}
                  onChange={(e) => setWorkConditions((prev) => ({ ...prev, [cond.id]: parseFloat(e.target.value) }))}
                  className={inputCls}
                >
                  {cond.options.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== 11. Vergi güzəştləri ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.taxExemptions}</label>
        <div className="space-y-2">
          {TAX_EXEMPTIONS.map((ex) => (
            <label key={ex.id} className={checkboxCard(!!taxExemptions[ex.id])}>
              <input type="checkbox" checked={!!taxExemptions[ex.id]}
                onChange={(e) => setTaxExemptions((prev) => ({ ...prev, [ex.id]: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-xs font-medium text-foreground">{ex.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ===================== 12. Hemkarlar ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.tradeUnion}</label>
        <div className="flex gap-3">
          <button onClick={() => setIsUnionMember(true)} className={toggleBtn(isUnionMember)}>{pt.unionMember}</button>
          <button onClick={() => setIsUnionMember(false)} className={toggleBtn(!isUnionMember)}>{pt.notMember}</button>
        </div>
      </div>

      {/* ===================== 13. Əsas iş yeri ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>{pt.mainJob}</label>
        <div className="flex gap-3">
          <button onClick={() => setIsMainJob(true)} className={toggleBtn(isMainJob)}>{pt.yes}</button>
          <button onClick={() => setIsMainJob(false)} className={toggleBtn(!isMainJob)}>{pt.no}</button>
        </div>
        <p className="text-xs text-muted mt-1">{pt.mainJobNote}</p>
      </div>

      {/* ===================== 14. Digər tutulmalar ===================== */}
      <div className="mb-8">
        <label className={sectionTitle}>{pt.otherDeductions}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">{pt.amountAZN}</label>
            <input type="number" value={otherDeductionAZN} onChange={(e) => setOtherDeductionAZN(e.target.value)}
              placeholder="0" min="0" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{pt.percentage}</label>
            <input type="number" value={otherDeductionPct} onChange={(e) => setOtherDeductionPct(e.target.value)}
              placeholder="0" min="0" max="100" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ===================== RESULTS ===================== */}
      {result && (
        <div className="space-y-4">
          {/* Main result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netSalary}</p>
              <p className="text-3xl font-bold">{fmt(result.netSalary)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.grossSalary}</p>
              <p className="text-3xl font-bold text-foreground">{fmt(result.grossSalary)}</p>
              <p className="text-xs text-muted mt-1">{pt.perMonth}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              examPassed
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {pt.diagnostic}: {examPassed ? pt.passed : pt.notPassed}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {pt.stavka}: {fmt(result.stavka)} AZN
            </span>
            {hasHerbi && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                {pt.militaryInstr}
              </span>
            )}
            {hasBeden && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                {pt.physEd}
              </span>
            )}
          </div>

          {/* Salary breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">{pt.salaryBreakdown}</h3>
            </div>
            <div className="divide-y divide-border">
              {hasHerbi && result.militaryBaseSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.militaryBaseSalary}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.militaryBaseSalary)} AZN</span>
                </div>
              )}

              {hasHerbi && result.militaryExtraHoursSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.extraHoursPayment}</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.militaryExtraHoursSalary)} AZN</span>
                </div>
              )}

              {result.dersYukuSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.lessonLoadSalary}</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.dersYukuSalary)} AZN</span>
                </div>
              )}

              {result.institutionBonus > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.institutionBonus}</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.institutionBonus)} AZN</span>
                </div>
              )}

              {result.dernekSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.clubHours}</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.dernekSalary)} AZN</span>
                </div>
              )}

              {result.gymExtraSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.extracurricularWork}</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.gymExtraSalary)} AZN</span>
                </div>
              )}

              {result.certBonus > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.certificationBonus}</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.certBonus)} AZN</span>
                </div>
              )}

              {result.workConditionTotal > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.workConditionBonus} ({result.totalCondPct}%)</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.workConditionTotal)} AZN</span>
                </div>
              )}

              {result.taxableFixed > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">
                    {pt.fixedBonuses}
                    {isClassLeader ? ` (${pt.classLeaderShort})` : ""}
                    {hasElmiDerece ? ` (${pt.scientificDegreeShort})` : ""}
                    {hasFelsefe ? ` (${pt.philosophyDoctorShort})` : ""}
                    {hasElmler ? ` (${pt.scienceDoctorShort})` : ""}
                  </span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.taxableFixed)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-foreground">{pt.grossSalary}</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.grossSalary)} AZN</span>
              </div>
            </div>
          </div>

          {/* Deductions breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-red-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-red-800">{pt.deductions}</h3>
            </div>
            <div className="divide-y divide-border">
              {!result.isFullExempt && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">
                    {pt.incomeTax}
                    {result.totalTaxExemption > 0 && (
                      <span className="text-xs"> — {pt.exemption}: {fmt(result.totalTaxExemption)} AZN</span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-red-600">-{fmt(result.incomeTax)} AZN</span>
                </div>
              )}
              {result.isFullExempt && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.taxExempt}</span>
                  <span className="text-sm font-medium text-green-600">0.00 AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.dsmf}</span>
                <span className="text-sm font-medium text-red-600">-{fmt(result.dsmf)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.unemploymentIns}</span>
                <span className="text-sm font-medium text-red-600">-{fmt(result.unemployment)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.medicalIns}</span>
                <span className="text-sm font-medium text-red-600">-{fmt(result.medical)} AZN</span>
              </div>

              {result.unionDue > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.tradeUnionFee}</span>
                  <span className="text-sm font-medium text-red-600">-{fmt(result.unionDue)} AZN</span>
                </div>
              )}

              {result.otherDeduction > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.otherDeductionsLabel}</span>
                  <span className="text-sm font-medium text-red-600">-{fmt(result.otherDeduction)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-800">{pt.totalDeductions}</span>
                <span className="text-sm font-bold text-red-800">-{fmt(result.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>

          {/* Annual summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
              <p className="text-xs text-green-600 mb-1">{pt.annualNetSalary}</p>
              <p className="text-lg font-bold text-green-800">{fmt(result.netSalary * 12)} AZN</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">{pt.annualGrossSalary}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.grossSalary * 12)} AZN</p>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
