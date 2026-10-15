import { useState, useMemo, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";
import { Select } from "@/components/Select";
import { Checkbox, ChipGroup } from "@/components/Controls";
import {
  ResultHero,
  StatGrid,
  Collapsible,
  RelatedCalculators,
} from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";

// ============================================================
// edu.gov.az /calculator məntiqi — saytla eyni
// Fənn üzrə saat daxiletmələri, müəssisə tipinə görə əlavələr,
// hərbi rəhbər və bədən tərbiyəsi müəllimi üçün xüsusi qaydalar
// ============================================================

// ---------- maaş cədvəlləri (stavka = 18 saat/həftə) ----------
const SALARY_PASSED: Record<string, Record<string, number> | number> = {
  high: { "0_3": 607, "3_8": 653, "8_13": 686, "13_18": 733, "18_up": 785 },
  technical: { "0_3": 554, "3_8": 587, "8_13": 607, "13_18": 647, "18_up": 700 },
  secondary: 554,
};

const SALARY_NOT_PASSED: Record<string, Record<string, number> | number> = {
  high: { "0_3": 455.25, "3_8": 489.75, "8_13": 514.5, "13_18": 549.75, "18_up": 588.75 },
  technical: { "0_3": 415.5, "3_8": 440.25, "8_13": 455.25, "13_18": 485.25, "18_up": 525.0 },
  secondary: 415.5,
};

// Hərbi rəhbər baza maaşları
const MILITARY_SALARY_PASSED = [477, 493, 508, 539];
const MILITARY_SALARY_NOT_PASSED = [429.3, 443.7, 457.2, 485.1];
const MILITARY_LABELS = [
  "Xüsusi hazırlıq keçmiş, ümumi orta təhsilli, pedaqoji stajı ən azı 5 ilə qədər",
  "Xüsusi hazırlıq keçmiş, ümumi orta təhsilli, pedaqoji stajı 10 ildən çox və ya orta ixtisas təhsilli, pedaqoji stajı 5 ilə qədər",
  "Orta ixtisas təhsilli, pedaqoji stajı 5 ildən 10 ilədək və ya orta hərbi təhsilli, yaxud ali təhsilli, pedaqoji stajı hər iki halda 5 ilə qədər",
  "Ali təhsilli, pedaqoji stajı 5 ildən çox; orta ixtisas təhsilli, pedaqoji stajı 10 ildən çox; orta hərbi təhsilli, pedaqoji stajı 5 ildən artıq; ali hərbi təhsilli, pedaqoji staja tələb qoyulmayan",
];

// Bədən tərbiyəsi üzrə sinifdənkənar işlər
const GYM_EXTRA_PASSED = { "10_19": 55, "20_29": 110, "30_up": 165 };
const GYM_EXTRA_NOT_PASSED = { "10_19": 49.5, "20_29": 99, "30_up": 148.5 };
type GymRange = keyof typeof GYM_EXTRA_PASSED;

// Dərnək rəhbəri — dərəcə üzrə stavka (18 saat)
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
  { id: "0_3", label: "3 ilə qədər" },
  { id: "3_8", label: "3-8 ilədək" },
  { id: "8_13", label: "8-13 ilədək" },
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

// Sinif rəhbərliyi — diaqnostikadan keçməyənlər üçün stavkanın faizi
const CLASS_LEADER_NOT_PASSED: Record<string, number> = { "1_4": 0.15, "5_11": 0.2 };

const pt = {
  description:
    "Dövlət ümumi təhsil müəssisələrində çalışan müəllimlərin əmək haqqı hesablaması (edu.gov.az məlumatına əsasən)",
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
  specialtyScore: "İxtisas balı",
  methodologyScore: "Metodika balı",
  interviewScore: "Müsahibə balı",
  institutionType: "Müəssisə tipi",
  hasCharter: "Nizamnamə var",
  charterNote: "Lisey saatlarına +15% əlavə olunur",
  subjectName: "Tədris olunan fənnin adı",
  physEd: "Bədən Tərbiyəsi",
  militaryInstr: "Hərbi rəhbər",
  other: "Digər",
  militaryInstrTitle: "Hərbi rəhbər",
  militaryInstrNote:
    "Ümumtəhsil məktəblərində, lisey və gimnaziyalarda hərbi rəhbərin həftədə 8 saata qədər tədris etdikləri dərs saatlarının əmək haqqı vəzifə maaşına daxildir. Əlavə olaraq həftədə 12 saata qədər dərs yükü verilə bilər. Zəruri ehtiyac yaranarsa həftədə 6 saata qədər əlavə dərs verilə bilər.",
  qualificationLevel: "İxtisas səviyyəsi",
  positionSalary: "Vəzifə maaşı",
  weeklyHours: "Həftəlik dərs yükü (saat)",
  first8HoursNote: "İlk 8 saat vəzifə maaşına daxildir. 8-dən yuxarı saatlar əlavə ödənilir.",
  gymExtracurricularTitle: "Bədən tərbiyəsi üzrə sinifdənkənar işlərin aparılması",
  gymExtracurricularNote:
    "Ümumtəhsil müəssisələrində bədən tərbiyəsi üzrə şagirdlərlə sinifdənkənar işlər iki və daha çox müəllim tərəfindən aparıldıqda əlavənin məbləği iş həcmindən asılı olaraq onlar arasında bölünür.",
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
  unionMember: "Üzvdür (2% tutulma)",
  notMember: "Üzv deyil",
  mainJob: "Əsas iş yeri",
  mainJobNote: "Əsas iş yeri olduqda 200 AZN vergi güzəşti tətbiq olunur",
  youngSpecTitle: "Gənc mütəxəssis stimullaşdırması",
  youngSpecDesc:
    "Pedaqoji profilli ali və orta ixtisas təhsilini bitirmiş yaşı 35-dək olan gənc mütəxəssislərin kənd rayonlarında yerləşən ümumi təhsil müəssisələrinə işə cəlb olunması (90 manatdan vergi tutulmur)",
  youngSpecNone: "Yoxdur",
  youngSpecH1: "H1 — 90 manat",
  youngSpecH2: "H2 — 190 manat",
  youngSpecBonus: "Gənc mütəxəssis stimullaşdırması",
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
  tradeUnionFee: "Həmkarlar ittifaqı (2%)",
  otherDeductionsLabel: "Digər tutulmalar",
  totalDeductions: "Cəmi tutulmalar",
  annualNetSalary: "İllik net maaş",
  annualGrossSalary: "İllik gross maaş",
};

function fmt(n: number): string {
  return fmtNum(n, 2);
}
const azn = (n: number) => `${fmt(n)} AZN`;

// ---------- kiçik köməkçi komponentlər ----------
function Label({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.n940 }]}>{children}</Text>;
}

function SmallNote({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.note, { color: colors.n580 }]}>{children}</Text>;
}

/** Radio kartı — başlıq + alt sətir (saytdakı müəssisə tipi / ixtisas səviyyəsi düymələri). */
function RadioCard({
  title,
  subtitle,
  active,
  onPress,
}: {
  title: string;
  subtitle?: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={[
        styles.radioCard,
        {
          backgroundColor: active ? colors.accent + "1a" : colors.n240,
          borderColor: active ? colors.accent : colors.n280,
        },
      ]}
    >
      <MaterialIcons
        name={active ? "radio-button-checked" : "radio-button-unchecked"}
        size={20}
        color={active ? colors.accent : colors.n580}
        style={{ marginTop: 1 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.radioTitle, { color: colors.n940 }]}>{title}</Text>
        {subtitle ? <Text style={[styles.radioSub, { color: colors.n580 }]}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "1a", borderColor: color + "66" }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

function Block({ children, color }: { children: ReactNode; color?: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.block,
        color
          ? { backgroundColor: color + "14", borderColor: color + "55" }
          : { backgroundColor: colors.n200, borderColor: colors.n280 },
      ]}
    >
      {children}
    </View>
  );
}

const GREEN = "#16a34a";
const AMBER = "#d97706";
const BLUE = "#2563eb";

// ============================================================
export function TeacherSalaryCalculator() {
  const { colors } = useTheme();

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
  // 6. Tədris olunan fənn (bir neçəsi seçilə bilər)
  const [hasBeden, setHasBeden] = useState(false);
  const [hasHerbi, setHasHerbi] = useState(false);
  const [hasDiger, setHasDiger] = useState(true);
  // 7. Saat daxiletmələri
  const [umumtehsilHours, setUmumtehsilHours] = useState("");
  const [liseyHours, setLiseyHours] = useState("");
  const [xususiHours, setXususiHours] = useState("");
  // Dərnək
  const [umumtehsilDernekHours, setUmumtehsilDernekHours] = useState("");
  const [liseyDernekHours, setLiseyDernekHours] = useState("");
  const [xususiDernekHours, setXususiDernekHours] = useState("");
  const [dernekLevel, setDernekLevel] = useState("level_8");
  // Bədən tərbiyəsi əlavələri
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
  // 11. Vergi güzəştləri
  const [taxExemptions, setTaxExemptions] = useState<Record<string, boolean>>({});
  // 12. Həmkarlar
  const [isUnionMember, setIsUnionMember] = useState(false);
  // 13. Əsas iş yeri
  const [isMainJob, setIsMainJob] = useState(true);
  // 14. Gənc mütəxəssis stimullaşdırması
  const [youngSpecialist, setYoungSpecialist] = useState<"none" | "h1" | "h2">("none");
  // 15. Digər tutulmalar
  const [otherDeductionAZN, setOtherDeductionAZN] = useState("");
  const [otherDeductionPct, setOtherDeductionPct] = useState("");

  const needsExperience = education !== "secondary";

  // ---- hesablama (saytla eyni) ----
  const result = useMemo(() => {
    const table = examPassed ? SALARY_PASSED : SALARY_NOT_PASSED;
    const eduTable = table[education];
    let stavka: number;
    if (typeof eduTable === "number") {
      stavka = eduTable;
    } else {
      stavka = eduTable[experience] ?? 0;
    }

    let dersYukuSalary = 0;
    let institutionBonus = 0;
    let gymExtraSalary = 0;
    let dernekSalary = 0;
    let militaryBaseSalary = 0;
    let militaryExtraHoursSalary = 0;
    let totalHours = 0;

    const pf = (s: string) => parseFloat(s.replace(",", ".")) || 0;
    const uH = pf(umumtehsilHours);
    const lH = pf(liseyHours);
    const xH = pf(xususiHours);
    const uDH = pf(umumtehsilDernekHours);
    const lDH = pf(liseyDernekHours);
    const xDH = pf(xususiDernekHours);
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
      institutionBonus += xSalary * 0.5;
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
      d *= 1.5;
      dernekSalary += d;
    }

    if (hasHerbi) {
      const milSalaries = examPassed ? MILITARY_SALARY_PASSED : MILITARY_SALARY_NOT_PASSED;
      militaryBaseSalary = milSalaries[militaryLevel];
      const milHours = pf(militaryHours);
      if (milHours > 8) {
        militaryExtraHoursSalary = stavka * ((milHours - 8) / STANDARD_HOURS);
      }
      totalHours += milHours;
      if (institution === "3" && militaryExtraHoursSalary > 0) {
        institutionBonus += militaryExtraHoursSalary * 0.5;
      }
    }

    if (hasBeden && gymClassRange) {
      const gymData = examPassed ? GYM_EXTRA_PASSED : GYM_EXTRA_NOT_PASSED;
      const gymBase = gymData[gymClassRange as GymRange] ?? 0;
      const teacherCount = Math.max(1, parseInt(gymTeacherCount) || 1);
      gymExtraSalary = gymBase / teacherCount;
    }

    const hasAnySalary =
      dersYukuSalary > 0 || militaryBaseSalary > 0 || gymExtraSalary > 0 || dernekSalary > 0 || militaryExtraHoursSalary > 0;
    if (!hasAnySalary && totalHours <= 0 && !hasHerbi) return null;

    const dersYukuWithInst = dersYukuSalary + institutionBonus;

    let certBonus = 0;
    if (examPassed && hasCertification) {
      const ix = pf(ixtisasBal);
      const met = pf(metodikaBal);
      const mus = pf(musahibeBal);
      const ixMetSum = ix + met;
      const certBase = dersYukuWithInst + militaryBaseSalary + militaryExtraHoursSalary;
      if (mus >= 20) {
        if (ixMetSum >= 51) {
          certBonus = certBase * 0.35;
        } else if (ixMetSum >= 30) {
          certBonus = certBase * 0.1;
        }
      }
    }

    let taxableFixed = 0;
    if (isClassLeader) {
      if (examPassed) {
        taxableFixed += 40;
      } else {
        const clPct = CLASS_LEADER_NOT_PASSED[classGradeRange] ?? 0.2;
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

    const youngSpecAmount = youngSpecialist === "h1" ? 90 : youngSpecialist === "h2" ? 190 : 0;
    // H1 (90₼) — 90 manatın hamısı vergidən və bütün tutulmalardan azaddır.
    // H2 (190₼) — 90 manatı tam azaddır, 100 manatı isə vergi/tutulmalara cəlbdir.
    const youngSpecExempt = youngSpecialist === "none" ? 0 : 90;
    const youngSpecTaxable = youngSpecialist === "h2" ? 100 : 0;

    const grossSalary =
      dersYukuWithInst + militaryBaseSalary + militaryExtraHoursSalary +
      certBonus + taxableFixed + workConditionTotal + gymExtraSalary + dernekSalary +
      youngSpecTaxable;

    if (grossSalary <= 0 && youngSpecExempt <= 0) return null;

    let totalTaxExemption = isMainJob ? 200 : 0;
    let isFullExempt = false;
    for (const ex of TAX_EXEMPTIONS) {
      if (taxExemptions[ex.id]) {
        if (ex.fullExempt) {
          isFullExempt = true;
          break;
        }
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
    const unionDue = isUnionMember ? grossSalary * 0.02 : 0;

    const otherAZN = pf(otherDeductionAZN);
    const otherPct = pf(otherDeductionPct);
    const otherDeduction = otherAZN + (grossSalary * otherPct) / 100;

    const totalDeductions = incomeTax + dsmf + unemployment + medical + unionDue + otherDeduction;
    const netSalary = grossSalary - totalDeductions + youngSpecExempt;
    const finalGross = grossSalary + youngSpecExempt;

    return {
      stavka, totalHours, dersYukuSalary, institutionBonus, dersYukuWithInst,
      militaryBaseSalary, militaryExtraHoursSalary, gymExtraSalary, dernekSalary,
      certBonus, taxableFixed, workConditionTotal, totalCondPct, youngSpecAmount,
      grossSalary: finalGross, totalTaxExemption, isFullExempt,
      incomeTax, dsmf, unemployment, medical, unionDue, otherDeduction, totalDeductions, netSalary,
    };
  }, [
    examPassed, education, experience, institution, hasNizamname,
    hasBeden, hasHerbi,
    umumtehsilHours, liseyHours, xususiHours,
    umumtehsilDernekHours, liseyDernekHours, xususiDernekHours, dernekLevel,
    gymClassRange, gymTeacherCount,
    militaryLevel, militaryHours,
    hasCertification, ixtisasBal, metodikaBal, musahibeBal,
    isClassLeader, classGradeRange,
    hasElmiDerece, hasFelsefe, hasElmler,
    workConditions,
    taxExemptions, isUnionMember, isMainJob,
    youngSpecialist,
    otherDeductionAZN, otherDeductionPct,
  ]);

  const lyceeBonus = institution === "2" || (institution === "1" && hasNizamname);
  const anyClubHours =
    (parseFloat(umumtehsilDernekHours) || 0) > 0 ||
    (parseFloat(liseyDernekHours) || 0) > 0 ||
    (parseFloat(xususiDernekHours) || 0) > 0;
  const anyWorkCondition = Object.values(workConditions).some((v) => v > 0);

  const gymPreview = gymClassRange
    ? (examPassed ? GYM_EXTRA_PASSED : GYM_EXTRA_NOT_PASSED)[gymClassRange as GymRange] /
      Math.max(1, parseInt(gymTeacherCount) || 1)
    : 0;

  const fixedLabel =
    pt.fixedBonuses +
    (isClassLeader ? ` (${pt.classLeaderShort})` : "") +
    (hasElmiDerece ? ` (${pt.scientificDegreeShort})` : "") +
    (hasFelsefe ? ` (${pt.philosophyDoctorShort})` : "") +
    (hasElmler ? ` (${pt.scienceDoctorShort})` : "");

  return (
    <View>
      {/* Səhifə təsviri ekran sarğısında (pageHeaders) göstərilir */}

      {/* 1. Diaqnostik */}
      <SegmentControl
        label={pt.diagnosticAssessment}
        options={[
          { value: "yes", label: pt.passed },
          { value: "no", label: pt.notPassed },
        ]}
        selected={examPassed ? "yes" : "no"}
        onSelect={(v) => setExamPassed(v === "yes")}
      />

      {/* 2. Təhsil */}
      <ChipGroup
        label={pt.education}
        options={[
          { value: "high", label: pt.highEd },
          { value: "technical", label: pt.technicalEd },
          { value: "secondary", label: pt.secondaryEd },
        ]}
        selected={education}
        onSelect={setEducation}
      />

      {/* 3. Pedaqoji staj */}
      {needsExperience && (
        <ChipGroup
          label={pt.pedagogicalExp}
          options={EXPERIENCE_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
          selected={experience}
          onSelect={setExperience}
        />
      )}

      {/* 4. Sertifikatlaşma (yalnız "Keçib") */}
      {examPassed && (
        <View>
          <SegmentControl
            label={pt.certification}
            options={[
              { value: "yes", label: pt.yes },
              { value: "no", label: pt.no },
            ]}
            selected={hasCertification ? "yes" : "no"}
            onSelect={(v) => setHasCertification(v === "yes")}
          />
          {hasCertification && (
            <Block color={BLUE}>
              <InputField label={pt.specialtyScore} value={ixtisasBal} onChangeText={setIxtisasBal} placeholder="0" keyboardType="decimal-pad" />
              <InputField label={pt.methodologyScore} value={metodikaBal} onChangeText={setMetodikaBal} placeholder="0" keyboardType="decimal-pad" />
              <InputField label={pt.interviewScore} value={musahibeBal} onChangeText={setMusahibeBal} placeholder="0" keyboardType="decimal-pad" />
            </Block>
          )}
        </View>
      )}

      {/* 5. Müəssisə tipi */}
      <View style={styles.group}>
        <Label>{pt.institutionType}</Label>
        <View style={{ gap: 8 }}>
          {INSTITUTION_OPTIONS.map((opt) => (
            <RadioCard
              key={opt.id}
              title={opt.label}
              subtitle={opt.bonus}
              active={institution === opt.id}
              onPress={() => {
                setInstitution(opt.id);
                if (opt.id !== "1") setHasNizamname(false);
              }}
            />
          ))}
        </View>
        {institution === "1" && (
          <View style={{ marginTop: 8 }}>
            <Checkbox label={pt.hasCharter} description={pt.charterNote} checked={hasNizamname} onChange={setHasNizamname} />
          </View>
        )}
      </View>

      {/* 6. Tədris olunan fənn */}
      <View style={styles.group}>
        <Label>{pt.subjectName}</Label>
        <Checkbox label={pt.physEd} checked={hasBeden} onChange={setHasBeden} />
        <Checkbox label={pt.militaryInstr} checked={hasHerbi} onChange={setHasHerbi} />
        <Checkbox label={pt.other} checked={hasDiger} onChange={setHasDiger} />
      </View>

      {/* 7. Hərbi rəhbər */}
      {hasHerbi && (
        <View style={styles.group}>
          <Block color={AMBER}>
            <Text style={[styles.blockTitle, { color: colors.n940 }]}>{pt.militaryInstrTitle}</Text>
            <Text style={[styles.blockNote, { color: AMBER }]}>{pt.militaryInstrNote}</Text>
            <Text style={[styles.subLabel, { color: colors.n940 }]}>{pt.qualificationLevel}</Text>
            <View style={{ gap: 8 }}>
              {MILITARY_LABELS.map((label, idx) => {
                const salaryVal = examPassed ? MILITARY_SALARY_PASSED[idx] : MILITARY_SALARY_NOT_PASSED[idx];
                return (
                  <RadioCard
                    key={idx}
                    title={label}
                    subtitle={`${pt.positionSalary}: ${azn(salaryVal)}`}
                    active={militaryLevel === idx}
                    onPress={() => setMilitaryLevel(idx)}
                  />
                );
              })}
            </View>
          </Block>
          <InputField
            label={pt.weeklyHours}
            value={militaryHours}
            onChangeText={setMilitaryHours}
            placeholder="8"
            keyboardType="decimal-pad"
            hint={pt.first8HoursNote}
          />
        </View>
      )}

      {/* Dərs yükü sahələri */}
      {(hasBeden || hasDiger) && (
        <View style={styles.group}>
          {hasBeden && (
            <Block color={GREEN}>
              <Text style={[styles.blockTitle, { color: colors.n940 }]}>{pt.gymExtracurricularTitle}</Text>
              <Text style={[styles.blockNote, { color: GREEN }]}>{pt.gymExtracurricularNote}</Text>
              <Select
                label={pt.classCount}
                value={gymClassRange}
                placeholder={pt.selectClassCount}
                options={[
                  { value: "", label: pt.selectClassCount },
                  { value: "10_19", label: pt.classes10_19 },
                  { value: "20_29", label: pt.classes20_29 },
                  { value: "30_up", label: pt.classes30plus },
                ]}
                onSelect={setGymClassRange}
              />
              <InputField
                label={pt.teacherCount}
                value={gymTeacherCount}
                onChangeText={setGymTeacherCount}
                placeholder="1"
                keyboardType="number-pad"
                suffix={pt.person}
              />
              {gymClassRange !== "" && (
                <Text style={[styles.blockNote, { color: GREEN, fontWeight: "600", marginBottom: 0 }]}>
                  {pt.extracurricularPayment}: {azn(gymPreview)}
                </Text>
              )}
            </Block>
          )}

          <Block>
            <Text style={[styles.blockTitle, { color: colors.n940 }]}>{pt.lessonLoad}</Text>
            <InputField
              label={pt.generalEdHours + (institution === "2" ? " (+15%)" : "")}
              value={umumtehsilHours}
              onChangeText={setUmumtehsilHours}
              placeholder="0"
              keyboardType="decimal-pad"
              suffix={pt.hours}
            />
            <InputField
              label={pt.generalEdClubHours + (institution === "2" ? " (+15%)" : "")}
              value={umumtehsilDernekHours}
              onChangeText={setUmumtehsilDernekHours}
              placeholder="0"
              keyboardType="decimal-pad"
              suffix={pt.hours}
            />
            <InputField
              label={pt.lyceeHours + (lyceeBonus ? " (+15%)" : "")}
              value={liseyHours}
              onChangeText={setLiseyHours}
              placeholder="0"
              keyboardType="decimal-pad"
              suffix={pt.hours}
            />
            <InputField
              label={pt.lyceeClubHours + (lyceeBonus ? " (+15%)" : "")}
              value={liseyDernekHours}
              onChangeText={setLiseyDernekHours}
              placeholder="0"
              keyboardType="decimal-pad"
              suffix={pt.hours}
            />
            <InputField
              label={pt.specialEdHours + " (+50%)"}
              value={xususiHours}
              onChangeText={setXususiHours}
              placeholder="0"
              keyboardType="decimal-pad"
              suffix={pt.hours}
            />
            <InputField
              label={pt.specialEdClubHours + " (+50%)"}
              value={xususiDernekHours}
              onChangeText={setXususiDernekHours}
              placeholder="0"
              keyboardType="decimal-pad"
              suffix={pt.hours}
            />
            {anyClubHours && (
              <Select
                label={pt.clubLeaderLevel}
                value={dernekLevel}
                options={HOBBY_GROUP_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
                onSelect={setDernekLevel}
              />
            )}
            <SmallNote>
              {pt.stavkaNorm}: {STANDARD_HOURS} {pt.hoursPerWeek}
            </SmallNote>
          </Block>
        </View>
      )}

      {/* 8. Sinif rəhbərliyi */}
      <View style={styles.group}>
        <Checkbox
          label={pt.classLeadership}
          description={examPassed ? pt.classLeadershipNote : pt.classLeadershipNotPassedNote(classGradeRange)}
          checked={isClassLeader}
          onChange={setIsClassLeader}
        />
        {isClassLeader && !examPassed && (
          <SegmentControl
            options={[
              { value: "1_4", label: pt.grades1_4 },
              { value: "5_11", label: pt.grades5_11 },
            ]}
            selected={classGradeRange}
            onSelect={setClassGradeRange}
          />
        )}
      </View>

      {/* 9. Elmi dərəcə */}
      <View style={styles.group}>
        <Label>{pt.scientificDegree}</Label>
        <Checkbox label={pt.scientificDegreeHolder} description="+45 AZN" checked={hasElmiDerece} onChange={setHasElmiDerece} />
        <Checkbox label={pt.philosophyDoctor} description="+60 AZN" checked={hasFelsefe} onChange={setHasFelsefe} />
        <Checkbox label={pt.scienceDoctor} description="+100 AZN" checked={hasElmler} onChange={setHasElmler} />
      </View>

      {/* 10. Əmək şəraiti (açılan) */}
      <View style={styles.group}>
        <Collapsible title={pt.workConditions + (anyWorkCondition ? ` (${pt.selected})` : "")}>
          {WORK_CONDITIONS.map((cond) => (
            <Select
              key={cond.id}
              label={cond.label}
              value={String(workConditions[cond.id] ?? 0)}
              options={cond.options.map((o) => ({ value: String(o.value), label: o.label }))}
              onSelect={(v) => setWorkConditions((prev) => ({ ...prev, [cond.id]: parseFloat(v) }))}
            />
          ))}
        </Collapsible>
      </View>

      {/* 11. Vergi güzəştləri */}
      <View style={styles.group}>
        <Label>{pt.taxExemptions}</Label>
        {TAX_EXEMPTIONS.map((ex) => (
          <Checkbox
            key={ex.id}
            label={ex.label}
            checked={!!taxExemptions[ex.id]}
            onChange={(v) => setTaxExemptions((prev) => ({ ...prev, [ex.id]: v }))}
          />
        ))}
      </View>

      {/* 12. Həmkarlar */}
      <SegmentControl
        label={pt.tradeUnion}
        options={[
          { value: "yes", label: pt.unionMember },
          { value: "no", label: pt.notMember },
        ]}
        selected={isUnionMember ? "yes" : "no"}
        onSelect={(v) => setIsUnionMember(v === "yes")}
      />

      {/* 13. Əsas iş yeri */}
      <SegmentControl
        label={pt.mainJob}
        options={[
          { value: "yes", label: pt.yes },
          { value: "no", label: pt.no },
        ]}
        selected={isMainJob ? "yes" : "no"}
        onSelect={(v) => setIsMainJob(v === "yes")}
      />
      <SmallNote>{pt.mainJobNote}</SmallNote>

      {/* 14. Gənc mütəxəssis */}
      <ChipGroup
        label={pt.youngSpecTitle}
        options={[
          { value: "none", label: pt.youngSpecNone },
          { value: "h1", label: pt.youngSpecH1 },
          { value: "h2", label: pt.youngSpecH2 },
        ]}
        selected={youngSpecialist}
        onSelect={setYoungSpecialist}
      />
      <SmallNote>{pt.youngSpecDesc}</SmallNote>

      {/* 15. Digər tutulmalar */}
      <View style={styles.group}>
        <Label>{pt.otherDeductions}</Label>
        <InputField label={pt.amountAZN} value={otherDeductionAZN} onChangeText={setOtherDeductionAZN} placeholder="0" keyboardType="decimal-pad" />
        <InputField label={pt.percentage} value={otherDeductionPct} onChangeText={setOtherDeductionPct} placeholder="0" keyboardType="decimal-pad" />
      </View>

      {/* ===== NƏTİCƏLƏR ===== */}
      {result && (
        <View>
          <ResultHero label={pt.netSalary} value={fmt(result.netSalary)} sub={pt.perMonth} />
          <StatGrid items={[{ label: `${pt.grossSalary} (${pt.perMonth})`, value: fmt(result.grossSalary) }]} />

          <View style={styles.badges}>
            <Badge
              text={`${pt.diagnostic}: ${examPassed ? pt.passed : pt.notPassed}`}
              color={examPassed ? GREEN : AMBER}
            />
            <Badge text={`${pt.stavka}: ${azn(result.stavka)}`} color={BLUE} />
            {hasHerbi && <Badge text={pt.militaryInstr} color={AMBER} />}
            {hasBeden && <Badge text={pt.physEd} color={GREEN} />}
          </View>

          <ResultSection title={pt.salaryBreakdown}>
            {hasHerbi && result.militaryBaseSalary > 0 && (
              <ResultRow label={pt.militaryBaseSalary} value={azn(result.militaryBaseSalary)} />
            )}
            {hasHerbi && result.militaryExtraHoursSalary > 0 && (
              <ResultRow label={pt.extraHoursPayment} value={`+${azn(result.militaryExtraHoursSalary)}`} />
            )}
            {result.dersYukuSalary > 0 && (
              <ResultRow label={pt.lessonLoadSalary} value={azn(result.dersYukuSalary)} />
            )}
            {result.institutionBonus > 0 && (
              <ResultRow label={pt.institutionBonus} value={`+${azn(result.institutionBonus)}`} />
            )}
            {result.dernekSalary > 0 && (
              <ResultRow label={pt.clubHours} value={`+${azn(result.dernekSalary)}`} />
            )}
            {result.gymExtraSalary > 0 && (
              <ResultRow label={pt.extracurricularWork} value={`+${azn(result.gymExtraSalary)}`} />
            )}
            {result.certBonus > 0 && (
              <ResultRow label={pt.certificationBonus} value={`+${azn(result.certBonus)}`} />
            )}
            {result.workConditionTotal > 0 && (
              <ResultRow
                label={`${pt.workConditionBonus} (${result.totalCondPct}%)`}
                value={`+${azn(result.workConditionTotal)}`}
              />
            )}
            {result.taxableFixed > 0 && <ResultRow label={fixedLabel} value={`+${azn(result.taxableFixed)}`} />}
            {result.youngSpecAmount > 0 && (
              <ResultRow
                label={`${pt.youngSpecBonus} (${youngSpecialist === "h1" ? "H1" : "H2"})`}
                value={`+${azn(result.youngSpecAmount)}`}
              />
            )}
            <ResultRow label={pt.grossSalary} value={azn(result.grossSalary)} bold highlight />
          </ResultSection>

          <ResultSection title={pt.deductions}>
            {!result.isFullExempt ? (
              <ResultRow
                label={
                  pt.incomeTax +
                  (result.totalTaxExemption > 0 ? ` — ${pt.exemption}: ${azn(result.totalTaxExemption)}` : "")
                }
                value={`-${azn(result.incomeTax)}`}
              />
            ) : (
              <ResultRow label={pt.taxExempt} value="0.00 AZN" />
            )}
            <ResultRow label={pt.dsmf} value={`-${azn(result.dsmf)}`} />
            <ResultRow label={pt.unemploymentIns} value={`-${azn(result.unemployment)}`} />
            <ResultRow label={pt.medicalIns} value={`-${azn(result.medical)}`} />
            {result.unionDue > 0 && <ResultRow label={pt.tradeUnionFee} value={`-${azn(result.unionDue)}`} />}
            {result.otherDeduction > 0 && (
              <ResultRow label={pt.otherDeductionsLabel} value={`-${azn(result.otherDeduction)}`} />
            )}
            <ResultRow label={pt.totalDeductions} value={`-${azn(result.totalDeductions)}`} bold />
          </ResultSection>

          <StatGrid
            items={[
              { label: pt.annualNetSalary, value: azn(result.netSalary * 12), accent: true },
              { label: pt.annualGrossSalary, value: azn(result.grossSalary * 12) },
            ]}
          />
        </View>
      )}

      <RelatedCalculators ids={["salary", "overtime", "freelancer-tax", "unemployment-benefit"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  subLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  note: { fontSize: 12, lineHeight: 17, marginTop: -8, marginBottom: 16 },
  radioCard: { flexDirection: "row", gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  radioTitle: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  radioSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  block: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  blockTitle: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  blockNote: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },
});
