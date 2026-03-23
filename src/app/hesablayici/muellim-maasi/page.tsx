"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

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

// Subject types are checkboxes — multiple can be selected

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

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ============================================================
export default function TeacherSalaryCalculator() {
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

  // All 6 hour inputs always shown (edu.gov.az pattern)

  // ---- calculation ----
  const result = useMemo(() => {
    // Get base stavka
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

    // === Hour-based salary calculation ===
    // All 6 hour inputs contribute — same as edu.gov.az
    const uH = parseFloat(umumtehsilHours) || 0;
    const lH = parseFloat(liseyHours) || 0;
    const xH = parseFloat(xususiHours) || 0;
    const uDH = parseFloat(umumtehsilDernekHours) || 0;
    const lDH = parseFloat(liseyDernekHours) || 0;
    const xDH = parseFloat(xususiDernekHours) || 0;
    const hobbyStavka = HOBBY_GROUP_SALARY[dernekLevel] ?? 458;

    // Ümumtəhsil hours
    if (uH > 0) {
      const uSalary = stavka * (uH / STANDARD_HOURS);
      dersYukuSalary += uSalary;
      totalHours += uH;
      // Type 2: +15% bonus on all hours
      if (institution === "2") institutionBonus += uSalary * 0.15;
    }

    // Lisey hours
    if (lH > 0) {
      const lSalary = stavka * (lH / STANDARD_HOURS);
      dersYukuSalary += lSalary;
      totalHours += lH;
      // Type 1 + nizamnamə: +15% on lisey hours
      if (institution === "1" && hasNizamname) institutionBonus += lSalary * 0.15;
      // Type 2: +15% bonus
      if (institution === "2") institutionBonus += lSalary * 0.15;
    }

    // Xüsusi təhsil hours — +50% bonus
    if (xH > 0) {
      const xSalary = stavka * (xH / STANDARD_HOURS);
      dersYukuSalary += xSalary;
      institutionBonus += xSalary * 0.50;
      totalHours += xH;
    }

    // Dərnək hours
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
      d *= 1.50; // xüsusi: +50%
      dernekSalary += d;
    }

    // === Hərbi rəhbər (if selected) ===
    if (hasHerbi) {
      const milSalaries = examPassed ? MILITARY_SALARY_PASSED : MILITARY_SALARY_NOT_PASSED;
      militaryBaseSalary = milSalaries[militaryLevel];
      const milHours = parseFloat(militaryHours) || 0;
      // First 8 hours included in base, extra at stavka rate
      if (milHours > 8) {
        militaryExtraHoursSalary = stavka * ((milHours - 8) / STANDARD_HOURS);
      }
      totalHours += milHours;
      // Xüsusi təhsil bonus on military extra hours
      if (institution === "3" && militaryExtraHoursSalary > 0) {
        institutionBonus += militaryExtraHoursSalary * 0.50;
      }
    }

    // === Bədən tərbiyəsi sinifdənkənar ===
    if (hasBeden && gymClassRange) {
      const gymData = examPassed ? GYM_EXTRA_PASSED : GYM_EXTRA_NOT_PASSED;
      const gymBase = gymData[gymClassRange as keyof typeof gymData] ?? 0;
      const teacherCount = Math.max(1, parseInt(gymTeacherCount) || 1);
      gymExtraSalary = gymBase / teacherCount;
    }

    // Check if there's any salary to calculate
    const hasAnySalary = dersYukuSalary > 0 || militaryBaseSalary > 0 || gymExtraSalary > 0 || dernekSalary > 0 || militaryExtraHoursSalary > 0;
    if (!hasAnySalary && totalHours <= 0 && !hasHerbi) return null;

    // Dərs yükü with institution bonus
    const dersYukuWithInst = dersYukuSalary + institutionBonus;

    // Certification bonus (only for "Keçib", applied to dərs yükü + inst bonus)
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

    // Taxable fixed bonuses
    let taxableFixed = 0;
    // Sinif rəhbərliyi
    if (isClassLeader) {
      if (examPassed) {
        taxableFixed += 40;
      } else {
        // keçməyib: percentage of stavka
        const clPct = CLASS_LEADER_NOT_PASSED[classGradeRange] ?? 0.20;
        taxableFixed += stavka * clPct;
      }
    }
    // Elmi dərəcə
    if (hasElmiDerece) taxableFixed += 45;
    if (hasFelsefe) taxableFixed += 60;
    if (hasElmler) taxableFixed += 100;

    // Əmək şəraiti
    let workConditionTotal = 0;
    const totalCondPct = Object.values(workConditions).reduce((s, v) => s + v, 0);
    if (totalCondPct > 0) {
      const baseForConditions = dersYukuWithInst + militaryBaseSalary + militaryExtraHoursSalary;
      workConditionTotal = baseForConditions * (totalCondPct / 100);
    }

    // Gross salary
    const grossSalary = dersYukuWithInst + militaryBaseSalary + militaryExtraHoursSalary
      + certBonus + taxableFixed + workConditionTotal + gymExtraSalary + dernekSalary;

    if (grossSalary <= 0) return null;

    // Tax calculation
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
      stavka,
      totalHours,
      dersYukuSalary,
      institutionBonus,
      dersYukuWithInst,
      militaryBaseSalary,
      militaryExtraHoursSalary,
      gymExtraSalary,
      dernekSalary,
      certBonus,
      taxableFixed,
      workConditionTotal,
      totalCondPct,
      grossSalary,
      totalTaxExemption,
      isFullExempt,
      incomeTax,
      dsmf,
      unemployment,
      medical,
      unionDue,
      otherDeduction,
      totalDeductions,
      netSalary,
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
      title="Müəllim maaşı hesablayıcısı"
      description="Dövlət ümumi təhsil müəssisələrində çalışan müəllimlərin əmək haqqı hesablaması (edu.gov.az məlumatına əsasən)"
      breadcrumbs={[
        { label: "Maliyyə", href: "/?category=finance" },
        { label: "Müəllim maaşı hesablayıcısı" },
      ]}
      relatedIds={["salary", "overtime", "freelancer-tax", "unemployment-benefit"]}
    >
      {/* ===================== 1. Diaqnostik ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>Diaqnostik qiymətləndirmə</label>
        <div className="flex gap-3">
          <button onClick={() => setExamPassed(true)} className={toggleBtn(examPassed)}>Keçib</button>
          <button onClick={() => setExamPassed(false)} className={toggleBtn(!examPassed)}>Keçməyib</button>
        </div>
      </div>

      {/* ===================== 2. Tehsil ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>Təhsili</label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: "high" as const, label: "Ali təhsilli" },
            { id: "technical" as const, label: "Orta ixtisas təhsilli" },
            { id: "secondary" as const, label: "Orta təhsilli" },
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
          <label className={sectionTitle}>Pedaqoji staj</label>
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
          <label className={sectionTitle}>Sertifikatlaşma</label>
          <div className="flex gap-3 mb-3">
            <button onClick={() => setHasCertification(true)} className={toggleBtn(hasCertification)}>Bəli</button>
            <button onClick={() => setHasCertification(false)} className={toggleBtn(!hasCertification)}>Xeyr</button>
          </div>
          {hasCertification && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div>
                <label className={subLabel}>İxtisas balı (0-40)</label>
                <input type="number" value={ixtisasBal} onChange={(e) => setIxtisasBal(e.target.value)}
                  min="0" max="40" placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={subLabel}>Metodika balı (0-20)</label>
                <input type="number" value={metodikaBal} onChange={(e) => setMetodikaBal(e.target.value)}
                  min="0" max="20" placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={subLabel}>Müsahibə balı</label>
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
                      Orta bal: {avg.toFixed(1)}
                      {qualified
                        ? avg >= 51 ? " — Əlavə: +35%" : " — Əlavə: +10%"
                        : " — Sertifikatlaşma şərtləri ödənilməmişdir"}
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
        <label className={sectionTitle}>Müəssisə tipi</label>
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
              <p className="text-xs font-medium text-foreground">Nizamnamə var</p>
              <p className="text-[10px] text-muted">Lisey saatlarına +15% əlavə olunur</p>
            </div>
          </label>
        )}
      </div>

      {/* ===================== 6. Tədris olunan fənn ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>Tədris olunan fənnin adı</label>
        <div className="grid grid-cols-3 gap-3">
          <label className={checkboxCard(hasBeden)}>
            <input type="checkbox" checked={hasBeden} onChange={(e) => setHasBeden(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs font-medium text-foreground">Bədən Tərbiyəsi</span>
          </label>
          <label className={checkboxCard(hasHerbi)}>
            <input type="checkbox" checked={hasHerbi} onChange={(e) => setHasHerbi(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs font-medium text-foreground">Hərbi rəhbər</span>
          </label>
          <label className={checkboxCard(hasDiger)}>
            <input type="checkbox" checked={hasDiger} onChange={(e) => setHasDiger(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs font-medium text-foreground">Digər</span>
          </label>
        </div>
      </div>

      {/* ===================== 7. HOUR INPUTS — varies by subject + institution ===================== */}

      {/* --- Hərbi rəhbər --- */}
      {hasHerbi && (
        <div className="mb-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Hərbi rəhbər</p>
            <p className="text-xs text-amber-700 mb-3 leading-relaxed">
              Ümumtəhsil məktəblərində, lisey və gimnaziyalarda hərbi rəhbərin həftədə 8 saata qədər
              tədris etdikləri dərs saatlarının əmək haqqı vəzifə maaşına daxildir. Əlavə olaraq həftədə
              12 saata qədər dərs yükü verilə bilər. Zəruri ehtiyac yaranarsa həftədə 6 saata qədər əlavə dərs verilə bilər.
            </p>
            <label className={subLabel}>İxtisas səviyyəsi</label>
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
                      <p className="text-[10px] text-muted">Vəzifə maaşı: {fmt(salaryVal)} AZN</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className={subLabel}>Həftəlik dərs yükü (saat)</label>
            <input type="number" value={militaryHours} onChange={(e) => setMilitaryHours(e.target.value)}
              placeholder="8" min="0" max="26" className={inputLgCls} />
            <p className="text-xs text-muted mt-1">İlk 8 saat vəzifə maaşına daxildir. 8-dən yuxarı saatlar əlavə ödənilir.</p>
          </div>
        </div>
      )}

      {/* --- Dərs yükü sahələri --- */}
      {(hasBeden || hasDiger) && (
        <div className="mb-6 space-y-4">
          {/* Bədən tərbiyəsi sinifdənkənar */}
          {hasBeden && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Bədən tərbiyəsi üzrə sinifdənkənar işlərin aparılması</p>
              <p className="text-xs text-green-700 leading-relaxed">
                Ümumtəhsil müəssisələrində bədən tərbiyəsi üzrə şagirdlərlə sinifdənkənar işlər iki və daha çox
                müəllim tərəfindən aparıldıqda əlavənin məbləği iş həcmindən asılı olaraq onlar arasında bölünür.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={subLabel}>Siniflərin sayını göstərin</label>
                  <select value={gymClassRange} onChange={(e) => setGymClassRange(e.target.value)}
                    className={inputCls}>
                    <option value="">Siniflərin sayını göstərin</option>
                    <option value="10_19">10-19-a qədər</option>
                    <option value="20_29">20-29-a qədər</option>
                    <option value="30_up">30-dan çox</option>
                  </select>
                </div>
                <div>
                  <label className={subLabel}>Müəllim sayı</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={gymTeacherCount} onChange={(e) => setGymTeacherCount(e.target.value)}
                      min="1" placeholder="1" className={inputCls} />
                    <span className="text-xs text-muted whitespace-nowrap">nəfər</span>
                  </div>
                </div>
              </div>
              {gymClassRange && (
                <p className="text-xs text-green-700 font-medium">
                  Sinifdənkənar ödəniş: {fmt(
                    (examPassed ? GYM_EXTRA_PASSED : GYM_EXTRA_NOT_PASSED)[gymClassRange as keyof typeof GYM_EXTRA_PASSED] /
                    Math.max(1, parseInt(gymTeacherCount) || 1)
                  )} AZN
                </p>
              )}
            </div>
          )}

          {/* All 6 hour inputs shown — edu.gov.az pattern */}
          <div className="bg-gray-50 border border-border rounded-xl p-4 space-y-4">
            <p className="text-sm font-medium text-foreground">Dərs yükü</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={subLabel}>
                  Ümumtəhsil siniflərində dərs yükü
                  {institution === "2" && <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={umumtehsilHours} onChange={(e) => setUmumtehsilHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">saat</span>
                </div>
              </div>
              <div>
                <label className={subLabel}>
                  Ümumtəhsil dərnək saatları
                  {institution === "2" && <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={umumtehsilDernekHours}
                    onChange={(e) => setUmumtehsilDernekHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">saat</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={subLabel}>
                  Lisey siniflərdə dərs yükü
                  {(institution === "2" || (institution === "1" && hasNizamname)) &&
                    <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={liseyHours} onChange={(e) => setLiseyHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">saat</span>
                </div>
              </div>
              <div>
                <label className={subLabel}>
                  Lisey dərnək saatları
                  {(institution === "2" || (institution === "1" && hasNizamname)) &&
                    <span className="text-green-600 ml-1">(+15%)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={liseyDernekHours}
                    onChange={(e) => setLiseyDernekHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">saat</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={subLabel}>
                  Xüsusi təhsil müəssisələrində dərs yükü
                  <span className="text-green-600 ml-1">(+50%)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={xususiHours} onChange={(e) => setXususiHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">saat</span>
                </div>
              </div>
              <div>
                <label className={subLabel}>
                  Xüsusi təhsil dərnək saatları
                  <span className="text-green-600 ml-1">(+50%)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" value={xususiDernekHours}
                    onChange={(e) => setXususiDernekHours(e.target.value)}
                    placeholder="0" min="0" max="50" className={inputCls} />
                  <span className="text-xs text-muted whitespace-nowrap">saat</span>
                </div>
              </div>
            </div>

            {/* Dərnək rəhbəri dərəcəsi — only if any dərnək hours entered */}
            {((parseFloat(umumtehsilDernekHours) || 0) > 0 || (parseFloat(liseyDernekHours) || 0) > 0 || (parseFloat(xususiDernekHours) || 0) > 0) && (
              <div className="border-t border-border pt-3">
                <label className={subLabel}>Dərnək rəhbərinin dərəcəsi</label>
                <select value={dernekLevel} onChange={(e) => setDernekLevel(e.target.value)} className={inputCls}>
                  {HOBBY_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-xs text-muted">Stavka norması: {STANDARD_HOURS} saat/həftə</p>
          </div>
        </div>
      )}

      {/* ===================== 8. Sinif rəhbərliyi ===================== */}
      <div className="mb-6">
        <label className={checkboxCard(isClassLeader)}>
          <input type="checkbox" checked={isClassLeader} onChange={(e) => setIsClassLeader(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Sinif rəhbərliyi</p>
            <p className="text-xs text-muted">
              {examPassed ? "+40 AZN" : `Stavkanın ${classGradeRange === "1_4" ? "15" : "20"}%-i`}
            </p>
          </div>
        </label>
        {isClassLeader && !examPassed && (
          <div className="mt-2 flex gap-3">
            <button onClick={() => setClassGradeRange("1_4")} className={toggleBtn(classGradeRange === "1_4")}>
              1-4 siniflər (15%)
            </button>
            <button onClick={() => setClassGradeRange("5_11")} className={toggleBtn(classGradeRange === "5_11")}>
              5-11 siniflər (20%)
            </button>
          </div>
        )}
      </div>

      {/* ===================== 9. Elmi dərəcə ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>Elmi dərəcə</label>
        <div className="space-y-2">
          <label className={checkboxCard(hasElmiDerece)}>
            <input type="checkbox" checked={hasElmiDerece} onChange={(e) => setHasElmiDerece(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">Elmi dərəcəsi olan / fəxri adlar / dərslik müəllifləri</p>
              <p className="text-[10px] text-muted">+45 AZN</p>
            </div>
          </label>
          <label className={checkboxCard(hasFelsefe)}>
            <input type="checkbox" checked={hasFelsefe} onChange={(e) => setHasFelsefe(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">Fəlsəfə doktoru</p>
              <p className="text-[10px] text-muted">+60 AZN</p>
            </div>
          </label>
          <label className={checkboxCard(hasElmler)}>
            <input type="checkbox" checked={hasElmler} onChange={(e) => setHasElmler(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">Elmlər doktoru</p>
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
            Əmək şəraiti əlavələri
            {Object.values(workConditions).some((v) => v > 0) && (
              <span className="ml-2 text-xs text-primary">(Seçilib)</span>
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
        <label className={sectionTitle}>Vergi güzəştləri</label>
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
        <label className={sectionTitle}>Həmkarlar ittifaqı</label>
        <div className="flex gap-3">
          <button onClick={() => setIsUnionMember(true)} className={toggleBtn(isUnionMember)}>Üzvdür (1% tutulma)</button>
          <button onClick={() => setIsUnionMember(false)} className={toggleBtn(!isUnionMember)}>Üzv deyil</button>
        </div>
      </div>

      {/* ===================== 13. Əsas iş yeri ===================== */}
      <div className="mb-6">
        <label className={sectionTitle}>Əsas iş yeri</label>
        <div className="flex gap-3">
          <button onClick={() => setIsMainJob(true)} className={toggleBtn(isMainJob)}>Bəli</button>
          <button onClick={() => setIsMainJob(false)} className={toggleBtn(!isMainJob)}>Xeyr</button>
        </div>
        <p className="text-xs text-muted mt-1">Əsas iş yeri olduqda 200 AZN vergi güzəşti tətbiq olunur</p>
      </div>

      {/* ===================== 14. Digər tutulmalar ===================== */}
      <div className="mb-8">
        <label className={sectionTitle}>Digər tutulmalar</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">Məbləğ (AZN)</label>
            <input type="number" value={otherDeductionAZN} onChange={(e) => setOtherDeductionAZN(e.target.value)}
              placeholder="0" min="0" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Faiz (%)</label>
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
              <p className="text-sm text-blue-200 mb-1">Net maaş (əlinizə çatan)</p>
              <p className="text-3xl font-bold">{fmt(result.netSalary)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Gross maaş</p>
              <p className="text-3xl font-bold text-foreground">{fmt(result.grossSalary)}</p>
              <p className="text-xs text-muted mt-1">AZN / ay</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              examPassed
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              Diaqnostik: {examPassed ? "Keçib" : "Keçməyib"}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Stavka: {fmt(result.stavka)} AZN
            </span>
            {hasHerbi && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Hərbi rəhbər
              </span>
            )}
            {hasBeden && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                Bədən tərbiyəsi
              </span>
            )}
          </div>

          {/* Salary breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Maasin terkibi</h3>
            </div>
            <div className="divide-y divide-border">
              {hasHerbi && result.militaryBaseSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Hərbi rəhbər baza maaşı</span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.militaryBaseSalary)} AZN</span>
                </div>
              )}

              {hasHerbi && result.militaryExtraHoursSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">8 saatdan yuxari elave odenis</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.militaryExtraHoursSalary)} AZN</span>
                </div>
              )}

              {result.dersYukuSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">
                    Dərs yükü maaşı
                  </span>
                  <span className="text-sm font-medium text-foreground">{fmt(result.dersYukuSalary)} AZN</span>
                </div>
              )}

              {result.institutionBonus > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Müəssisə tipi əlavəsi</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.institutionBonus)} AZN</span>
                </div>
              )}

              {result.dernekSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Dernek saatlari</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.dernekSalary)} AZN</span>
                </div>
              )}

              {result.gymExtraSalary > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Sinifdenkenar isler (beden terb.)</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.gymExtraSalary)} AZN</span>
                </div>
              )}

              {result.certBonus > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Sertifikatlaşma əlavəsi</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.certBonus)} AZN</span>
                </div>
              )}

              {result.workConditionTotal > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Əmək şəraiti əlavəsi ({result.totalCondPct}%)</span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.workConditionTotal)} AZN</span>
                </div>
              )}

              {result.taxableFixed > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">
                    Sabit elaveler
                    {isClassLeader ? " (sinif rehb.)" : ""}
                    {hasElmiDerece ? " (elmi der.)" : ""}
                    {hasFelsefe ? " (felsefe d.)" : ""}
                    {hasElmler ? " (elmler d.)" : ""}
                  </span>
                  <span className="text-sm font-medium text-green-600">+{fmt(result.taxableFixed)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-foreground">Gross maaş</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.grossSalary)} AZN</span>
              </div>
            </div>
          </div>

          {/* Deductions breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-red-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-red-800">Tutulmalar</h3>
            </div>
            <div className="divide-y divide-border">
              {!result.isFullExempt && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">
                    Gelir vergisi (14%)
                    {result.totalTaxExemption > 0 && (
                      <span className="text-xs"> — guzest: {fmt(result.totalTaxExemption)} AZN</span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-red-600">-{fmt(result.incomeTax)} AZN</span>
                </div>
              )}
              {result.isFullExempt && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Gelir vergisi (vergiden azad)</span>
                  <span className="text-sm font-medium text-green-600">0.00 AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">DSMF (3%)</span>
                <span className="text-sm font-medium text-red-600">-{fmt(result.dsmf)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Issizlik sigortasi (0.5%)</span>
                <span className="text-sm font-medium text-red-600">-{fmt(result.unemployment)} AZN</span>
              </div>

              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Tibbi sigorta (2%)</span>
                <span className="text-sm font-medium text-red-600">-{fmt(result.medical)} AZN</span>
              </div>

              {result.unionDue > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Həmkarlar ittifaqı (1%)</span>
                  <span className="text-sm font-medium text-red-600">-{fmt(result.unionDue)} AZN</span>
                </div>
              )}

              {result.otherDeduction > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">Digər tutulmalar</span>
                  <span className="text-sm font-medium text-red-600">-{fmt(result.otherDeduction)} AZN</span>
                </div>
              )}

              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-800">Cemi tutulmalar</span>
                <span className="text-sm font-bold text-red-800">-{fmt(result.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>

          {/* Annual summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
              <p className="text-xs text-green-600 mb-1">Illik net maas</p>
              <p className="text-lg font-bold text-green-800">{fmt(result.netSalary * 12)} AZN</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted mb-1">Illik gross maas</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.grossSalary * 12)} AZN</p>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
