import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { Select } from "@/components/Select";
import { Checkbox } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";

// ============================================================
// Azərbaycan əmək haqqı hesablama qaydaları (2026)
// Qeyri neft-qaz / Özəl sektor  vs  Dövlət / Neft-qaz sektoru
// ============================================================

const MINIMUM_WAGE = 400; // AZN (2026)

type Sector = "private" | "state";
type Direction = "gross-to-net" | "net-to-gross";
type WorkplaceType = "primary" | "secondary" | "employer";

// ══════════════════════════════════════════════════════════════
// QEYRİ NEFT-QAZ VƏ ÖZƏL SEKTOR
// ══════════════════════════════════════════════════════════════

// Gəlir vergisi (2026-cı il yanvarın 1-dən 2027-ci il yanvarın 1-dək)
function calcPrivateIncomeTax(gross: number, exemption: number = 0): number {
  const taxFree = 200 + exemption;
  if (gross <= taxFree) return 0;
  if (gross <= 2500) {
    return (gross - taxFree) * 0.03;
  }
  const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.03 : 75;
  if (gross <= 8000) {
    return baseTax + (gross - 2500) * 0.1;
  }
  return baseTax + (8000 - 2500) * 0.1 + (gross - 8000) * 0.14;
}

// DSMF işçi
function calcPrivateDSMFEmployee(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  if (gross <= 8000) return 6 + (gross - 200) * 0.1;
  return 786 + (gross - 8000) * 0.1;
}

// İcbari tibbi sığorta
function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 50 + (gross - 2500) * 0.005;
}

// DSMF işəgötürən
function calcPrivateDSMFEmployer(gross: number): number {
  if (gross <= 200) return gross * 0.22;
  if (gross <= 8000) return 44 + (gross - 200) * 0.15;
  return 1214 + (gross - 8000) * 0.11;
}

// ══════════════════════════════════════════════════════════════
// DÖVLƏT VƏ NEFT-QAZ SEKTORU
// ══════════════════════════════════════════════════════════════

function calcStateIncomeTax(gross: number, exemption: number = 0): number {
  const taxFree = 200 + exemption;
  if (gross <= taxFree) return 0;
  if (gross <= 2500) {
    return (gross - taxFree) * 0.14;
  }
  const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.14 : 350;
  return baseTax + (gross - 2500) * 0.25;
}

function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 160 + (gross - 8000) * 0.005;
}

// ══════════════════════════════════════════════════════════════
// HESABLAMA
// ══════════════════════════════════════════════════════════════

interface BreakdownStep {
  label: string;
  amount: number;
  rate: string;
  result: number;
}

function calculateSalary(gross: number, sector: Sector, exemption: number = 0) {
  const unemploymentEmployee = gross * 0.005;
  const unemploymentEmployer = gross * 0.005;

  let incomeTax: number;
  let dsmfEmployee: number;
  let medicalInsurance: number;
  let dsmfEmployer: number;
  const taxSteps: BreakdownStep[] = [];
  const dsmfSteps: BreakdownStep[] = [];
  const medicalSteps: BreakdownStep[] = [];
  const dsmfEmployerSteps: BreakdownStep[] = [];
  const taxFree = 200 + exemption;

  if (sector === "private") {
    incomeTax = calcPrivateIncomeTax(gross, exemption);
    dsmfEmployee = calcPrivateDSMFEmployee(gross);
    medicalInsurance = calcPrivateMedical(gross);
    dsmfEmployer = calcPrivateDSMFEmployer(gross);

    if (exemption > 0 && gross > taxFree) {
      taxSteps.push({ label: `Güzəşt: vergi tutulan gəlir ${exemption}₼ azaldılır (azad hissə: ${taxFree}₼)`, amount: exemption, rate: "", result: 0 });
    }
    if (gross > taxFree && gross <= 2500) {
      taxSteps.push({ label: `(${gross.toFixed(0)} − ${taxFree}) × 3%`, amount: gross - taxFree, rate: "3%", result: (gross - taxFree) * 0.03 });
    }
    if (gross > 2500 && gross <= 8000) {
      const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.03 : 75;
      taxSteps.push({ label: `75 + (${gross.toFixed(0)} − 2500) × 10%`, amount: gross - 2500, rate: "10%", result: baseTax + (gross - 2500) * 0.1 });
    }
    if (gross > 8000) {
      const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.03 + (8000 - 2500) * 0.1 : 625;
      taxSteps.push({ label: `625 + (${gross.toFixed(0)} − 8000) × 14%`, amount: gross - 8000, rate: "14%", result: baseTax + (gross - 8000) * 0.14 });
    }

    if (gross <= 200) {
      dsmfSteps.push({ label: `${gross.toFixed(0)}₼ × 3%`, amount: gross, rate: "3%", result: gross * 0.03 });
    } else if (gross <= 8000) {
      dsmfSteps.push({ label: `6 + (${gross.toFixed(0)} − 200) × 10%`, amount: gross - 200, rate: "10%", result: 6 + (gross - 200) * 0.1 });
    } else {
      dsmfSteps.push({ label: `786 + (${gross.toFixed(0)} − 8000) × 10%`, amount: gross - 8000, rate: "10%", result: 786 + (gross - 8000) * 0.1 });
    }

    if (gross <= 2500) {
      medicalSteps.push({ label: `${gross.toFixed(0)}₼ × 2%`, amount: gross, rate: "2%", result: gross * 0.02 });
    } else {
      medicalSteps.push({ label: `50 + (${gross.toFixed(0)} − 2500) × 0,5%`, amount: gross - 2500, rate: "0,5%", result: 50 + (gross - 2500) * 0.005 });
    }

    if (gross <= 200) {
      dsmfEmployerSteps.push({ label: `${gross.toFixed(0)}₼ × 22%`, amount: gross, rate: "22%", result: gross * 0.22 });
    } else if (gross <= 8000) {
      dsmfEmployerSteps.push({ label: `44 + (${gross.toFixed(0)} − 200) × 15%`, amount: gross - 200, rate: "15%", result: 44 + (gross - 200) * 0.15 });
    } else {
      dsmfEmployerSteps.push({ label: `1214 + (${gross.toFixed(0)} − 8000) × 11%`, amount: gross - 8000, rate: "11%", result: 1214 + (gross - 8000) * 0.11 });
    }
  } else {
    incomeTax = calcStateIncomeTax(gross, exemption);
    dsmfEmployee = gross * 0.03;
    medicalInsurance = calcStateMedical(gross);
    dsmfEmployer = gross * 0.22;

    if (exemption > 0 && gross > taxFree) {
      taxSteps.push({ label: `Güzəşt: VCM = ${gross.toFixed(0)} − ${exemption} = ${(gross - exemption).toFixed(0)}₼`, amount: exemption, rate: "", result: 0 });
    }
    if (gross > taxFree && gross <= 2500) {
      taxSteps.push({ label: `(${gross.toFixed(0)} − ${taxFree}) × 14%`, amount: gross - taxFree, rate: "14%", result: (gross - taxFree) * 0.14 });
    }
    if (gross > 2500) {
      const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.14 : 350;
      taxSteps.push({ label: `350 + (${gross.toFixed(0)} − 2500) × 25%`, amount: gross - 2500, rate: "25%", result: baseTax + (gross - 2500) * 0.25 });
    }

    dsmfSteps.push({ label: `${gross.toFixed(0)}₼ × 3%`, amount: gross, rate: "3%", result: gross * 0.03 });

    if (gross <= 8000) {
      medicalSteps.push({ label: `${gross.toFixed(0)}₼ × 2%`, amount: gross, rate: "2%", result: gross * 0.02 });
    } else {
      medicalSteps.push({ label: `160 + (${gross.toFixed(0)} − 8000) × 0,5%`, amount: gross - 8000, rate: "0,5%", result: 160 + (gross - 8000) * 0.005 });
    }

    dsmfEmployerSteps.push({ label: `${gross.toFixed(0)}₼ × 22%`, amount: gross, rate: "22%", result: gross * 0.22 });
  }

  const totalDeductions = incomeTax + dsmfEmployee + unemploymentEmployee + medicalInsurance;
  const net = gross - totalDeductions;
  const totalEmployerCost = gross + dsmfEmployer + unemploymentEmployer;

  return {
    gross,
    net: Math.max(0, net),
    exemption,
    incomeTax,
    dsmfEmployee,
    unemploymentEmployee,
    medicalInsurance,
    totalDeductions,
    dsmfEmployer,
    unemploymentEmployer,
    totalEmployerCost,
    taxSteps,
    dsmfSteps,
    medicalSteps,
    dsmfEmployerSteps,
  };
}

type SalaryCalc = ReturnType<typeof calculateSalary> & {
  unionFee: number;
  yapFee: number;
  extraDeductions: number;
};

function formatMoney(n: number): string {
  return fmtNum(n, 2);
}

// ══════════════════════════════════════════════════════════════
// MƏTNLƏR (az)
// ══════════════════════════════════════════════════════════════

const exemptions: { value: number; article: string; title: string; desc: string }[] = [
  {
    value: 800,
    article: "102.1-1",
    title: "Şəhidlərin yaxınları",
    desc: "Şəhid statusu almış şəxslərin valideynləri, dul arvadları (ərləri) və övladları.",
  },
  {
    value: 400,
    article: "102.2",
    title: "Qəhrəmanlar və müharibə əlilləri",
    desc: "Vətən Müharibəsi Qəhrəmanları və Azərbaycanın Milli Qəhrəmanları; Sovet İttifaqı və Sosialist Əməyi Qəhrəmanları; Şöhrət ordeninin hər üç dərəcəsi ilə təltif olunanlar; I və II qrup müharibə ilə əlaqədar əlilliyi olanlar; həlak olmuş döyüşçülərin (şəhidlər istisna) dul arvadları (ərləri) və övladları; 1941-1945 arxa cəbhə fədakarları; müharibə veteranları; Çernobıl və digər radiasiya qəzalarının iştirakçıları; həlak olmuş minatəmizləyənlərin valideynləri, dul arvadları (ərləri) və övladları.",
  },
  {
    value: 200,
    article: "102.3",
    title: "Əlillər və əlilə qulluq edənlər",
    desc: "Orqanizmin funksiyalarının 61-100% pozulmasına görə əlilliyi olanlar (müharibə əlilləri istisna); əlilliyi olan uşaqlar; daimi qulluq tələb edən əlil uşağa və ya 81-100% əlilə baxıb onunla yaşayan valideyndən biri, ər/arvad, himayəçi və ya qəyyum.",
  },
  {
    value: 100,
    article: "102.4",
    title: "Şəhid valideynləri, köçkünlər və b.",
    desc: "Həlak olmuş döyüşçülərin (şəhidlər istisna) və vəzifə icrasında həlak olmuş dövlət qulluqçularının valideynləri və təkrar nikaha girməmiş arvadları (ərləri); 20 Yanvar və ərazi bütövlüyü uğrunda həlak olanların valideynləri, arvadları (ərləri) və övladları; Əfqanıstan və digər döyüş bölgələrindəki hərbçilər; I dərəcə əlilə daimi qulluq edən valideyn, ər/arvad, himayəçi və ya qəyyum; məcburi köçkünlər və onlara bərabər tutulanlar.",
  },
  {
    value: 50,
    article: "102.5",
    title: "Himayəsində 3+ nəfər olanlar",
    desc: "Himayəsində azı üç nəfər, o cümlədən gündüz təhsil alan 23 yaşınadək şagird və tələbələr olan ər və ya arvaddan biri. Güzəşt uşaqların 18, tələbələrin 23 yaşa çatdığı ilin sonunadək saxlanılır.",
  },
];

const pt = {
  formulaTitle: "Əmək haqqından tutulmalar necə hesablanır? (2026)",
  formulaContent: `Qeyri neft-qaz / Özəl sektor (işçidən):
• Gəlir vergisi:
  0–200₼: 0%
  200–2500₼: (maaş − 200) × 3%
  2500–8000₼: 75 + (maaş − 2500) × 10%
  8000₼+: 625 + (maaş − 8000) × 14%
• DSMF: 200₼-dək 3%, üstü 10%
• İşsizlik sığortası: 0,5%
• İcbari tibbi sığorta: 2500₼-dək 2%, üstü 0,5%
• İşəgötürən DSMF: 200₼-dək 22%, üstü 15%

Dövlət / Neft-qaz sektoru (işçidən):
• Vergiyə cəlb olunan məbləğ: Əməkhaqqı − Güzəşt
• Gəlir vergisi:
  VCM ≤ 2500₼: (VCM − 200) × 14%
  VCM > 2500₼: 350 + (VCM − 2500) × 25%
• DSMF: gross × 3%
• İşsizlik sığortası: gross × 0,5%
• İcbari tibbi sığorta:
  ≤ 8000₼: gross × 2%
  > 8000₼: 160 + (gross − 8000) × 0,5%
• İşəgötürən DSMF: gross × 22%

Vergi Məcəlləsinin 102-ci maddəsi üzrə güzəştlər (vergi tutulan aylıq gəlir azaldılır):

• 800₼ (V.M. 102.1-1): Şəhid statusu almış şəxslərin valideynləri, dul arvadları (ərləri) və övladları.

• 400₼ (V.M. 102.2):
  – Vətən Müharibəsi Qəhrəmanları və Azərbaycanın Milli Qəhrəmanları;
  – Sovet İttifaqı və Sosialist Əməyi Qəhrəmanları;
  – Şöhrət ordeninin hər üç dərəcəsi ilə təltif edilmiş şəxslər;
  – I və II qrup müharibə ilə əlaqədar əlilliyi olan şəxslər;
  – həlak olmuş döyüşçülərin (şəhidlər istisna) dul arvadları (ərləri) və övladları;
  – 1941-1945-ci illərdə arxa cəbhədə fədakar əməyə görə təltif olunanlar;
  – müharibə veteranı adı almış şəxslər;
  – Çernobıl AES və digər radiasiya qəzalarının nəticələrindən zərər çəkənlər;
  – həlak olmuş minatəmizləyənlərin valideynləri, dul arvadları (ərləri) və övladları.

• 200₼ (V.M. 102.3): Orqanizmin funksiyalarının 61-100% pozulmasına görə əlilliyi olanlar (müharibə əlilləri istisna); əlilliyi olan uşaqlar; daimi qulluq tələb edən əlil uşağa və ya 81-100% əlilə baxıb onunla yaşayan valideyndən biri, ər/arvad, himayəçi və ya qəyyum.

• 100₼ (V.M. 102.4):
  – həlak olmuş döyüşçülərin (şəhidlər istisna) və vəzifə icrasında həlak olmuş dövlət qulluqçularının valideynləri, təkrar nikaha girməmiş arvadları (ərləri);
  – 20 Yanvar və ərazi bütövlüyü uğrunda həlak olanların valideynləri, arvadları (ərləri) və övladları;
  – Əfqanıstan və digər döyüş bölgələrinə göndərilmiş hərbçilər;
  – I dərəcə əlilə daimi qulluq edən valideyn, ər/arvad, himayəçi və ya qəyyum;
  – məcburi köçkünlər və onlara bərabər tutulan şəxslər.

• 50₼ (V.M. 102.5): Himayəsində azı üç nəfər, o cümlədən gündüz təhsil alan 23 yaşınadək şagird və tələbələr olan ər və ya arvaddan biri. Güzəşt uşaqların 18, tələbələrin və şagirdlərin 23 yaşa çatdığı ilin sonunadək saxlanılır.

Əlavə tutulmalar (könüllü):
• Həmkarlar İttifaqı üzvlüyü: 2%
• Yeni Azərbaycan Partiyası üzvlüyü: 1%

Minimum əmək haqqı: ${MINIMUM_WAGE} AZN (2026)`,
  tabPrimary: "Əsas iş yeri",
  tabSecondary: "Əlavə iş yeri",
  tabEmployer: "İşəgötürən üçün",
  jobCategory: "İş kateqoriyası:",
  sectorPrivate: "Qeyri-dövlət və qeyri-neft sektoru",
  sectorState: "Dövlət və neft sektoru",
  exemptions: "Güzəştlər",
  exemptionLabel: (value: number, article: string) => `V.M. ${article} — vergi tutulan gəlir ${value} AZN azaldılır`,
  grossToNet: "Gross → Net",
  netToGross: "Net → Gross",
  grossSalary: "Gross əmək haqqı",
  netSalary: "Net əmək haqqı (əlinizə çatan)",
  grossMonthlySalary: "Gross aylıq əməkhaqqı",
  additionalDeductions: "Əlavə tutulmalar",
  unionMember: "Həmkarlar İttifaqı üzvüyəm",
  unionMemberDesc: "Gross əmək haqqının 2%-i tutulur",
  yapMember: "Yeni Azərbaycan Partiyası üzvüyəm",
  yapMemberDesc: "Gross əmək haqqının 1%-i tutulur",
  netSalaryResult: "Net əmək haqqı (əlinizə çatan)",
  grossSalaryResult: "Gross əmək haqqı",
  perMonth: "AZN / ay",
  sectorPrivateBadge: "Qeyri neft-qaz / Özəl sektor",
  sectorStateBadge: "Dövlət / Neft-qaz sektoru",
  secondaryWorkplace: "Əlavə iş yeri",
  deductedFromEmployee: "İşçidən tutulan",
  incomeTax: "Gəlir vergisi",
  dsmf: "DSMF",
  unemploymentInsurance: "İşsizlik sığortası",
  medicalInsurance: "İcbari tibbi sığorta",
  unionFee: "Həmkarlar İttifaqı haqqı",
  yapFee: "Yeni Azərbaycan Partiyası haqqı",
  totalDeduction: "Cəmi tutulma",
  total: "Cəmi",
  noTaxUnder200: "200₼-dək vergi tutulmur",
  noIncomeTaxUnder200: "200₼-dək gəlir vergisi tutulmur",
  taxSubPrivate: "200₼-dək 0%, 200–2500₼ arası 3%, 2500–8000₼ arası 10%, 8000₼-dan çox 14%",
  taxSubState: "200₼-dək 0%, 200–2500₼ arası 14%, 2500₼-dan çox 25%",
  dsmfSubPrivate: "≤200₼: 3%, 200–8000₼: 6+(gross−200)×10%, 8000₼+: 786+(gross−8000)×10%",
  dsmfSubState: "Gross məbləğin 3%-i",
  medicalSubPrivate: "≤2500₼: gross×2%, 2500₼+: 50+(gross−2500)×0,5%",
  medicalSubState: "≤8000₼: gross×2%, 8000₼+: 160+(gross−8000)×0,5%",
  dsmfEmployerSubPrivate: "200₼-dək 22%, 200₼-dan çox 15%",
  dsmfEmployerSubState: "Gross məbləğin 22%-i",
  employerSide: "İşəgötürən tərəfdən",
  totalEmployerCost: "İşəgötürənin ümumi xərci",
  annualCalculation: "İllik hesablama",
  annualNetIncome: "İllik net gəlir",
  annualGross: "İllik gross",
  annualDeduction: "İllik tutulma",
  emptyStateSalary: "Nəticəni görmək üçün əmək haqqını daxil edin.",
  emptyStateGross: "Nəticəni görmək üçün gross əmək haqqını daxil edin.",
  employerTabDesc: "İşçinin GROSS əməkhaqqına əsasən işəgötürənin ödəyəcəyi məbləği hesablayın",
  employeeSalary: "İşçinin əməkhaqqı",
  mandatorySocialInsurance: "Məcburi dövlət sosial sığorta haqqı:",
  unemploymentInsuranceFee: "İşsizlikdən sığorta haqqı:",
  medicalInsuranceFee: "İcbari tibbi sığorta haqqı:",
  employerPayment: "İşəgötürənin ödəyəcəyi məbləğ",
  employerPaymentRules: (sector: string) => `İşəgötürənin ödəməsi (${sector === "private" ? "Özəl sektor" : "Dövlət sektoru"})`,
  salaryUpTo200: "Əməkhaqqı 200 ₼-dək olduqda:",
  insurableIncomeX22: "Sığorta haqqına cəlb edilən aylıq gəlir × 22%",
  salaryFrom200To8000: "Əməkhaqqı 200 ₼-dən 8 000 ₼-dək olduqda:",
  formula44Plus: "44 + (Sığorta haqqına cəlb edilən aylıq gəlir − 200) × 15%",
  salaryOver8000: "Əməkhaqqı 8 000 ₼-dən çox olduqda:",
  formula1214Plus: "1 214 + (Sığorta haqqına cəlb edilən aylıq gəlir − 8 000) × 11%",
  payrollFundX05: "Hesablanmış əməyin ödənişi fondu × 0.5%",
  salaryUpTo2500Medical: "Əməkhaqqı 2 500 ₼-dək olduqda:",
  monthlySalaryX2: "Hesablanan aylıq əməkhaqqı × 2%",
  salaryOver2500Medical: "Əməkhaqqı 2 500 ₼-dən çox olduqda:",
  formula50PlusMedical: "50 + (Hesablanan aylıq əməkhaqqı − 2 500) × 0.5%",
  salaryUpTo8000Medical: "Əməkhaqqı 8 000 ₼-dək olduqda:",
  salaryOver8000Medical: "Əməkhaqqı 8 000 ₼-dən çox olduqda:",
  formula160PlusMedical: "160 + (Hesablanan aylıq əməkhaqqı − 8 000) × 0.5%",
};

const PRESETS = [400, 1000, 2000, 3000, 5000, 8100];
const SECTOR_OPTIONS = [
  { value: "private", label: pt.sectorPrivate },
  { value: "state", label: pt.sectorState },
];
const DIRECTION_OPTIONS: { value: Direction; label: string }[] = [
  { value: "gross-to-net", label: pt.grossToNet },
  { value: "net-to-gross", label: pt.netToGross },
];

const GREEN = "#22c55e";
const BLUE = "#3b82f6";
const RED = "#ef4444";
const AMBER = "#f59e0b";

// ══════════════════════════════════════════════════════════════
// KİÇİK KOMPONENTLƏR
// ══════════════════════════════════════════════════════════════

function Presets({ onPick }: { onPick: (v: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.presets}>
      {PRESETS.map((v) => (
        <Pressable
          key={v}
          onPress={() => onPick(String(v))}
          style={[styles.preset, { backgroundColor: colors.n240, borderColor: colors.n280 }]}
        >
          <Text style={[styles.presetText, { color: colors.n760 }]}>{v}₼</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "1a", borderColor: color + "55" }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

function ResultCards({ net, gross }: { net: number; gross: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={[styles.heroCard, { backgroundColor: colors.accent }]}>
        <Text style={[styles.heroLabel, { color: colors.onAccent }]}>{pt.netSalaryResult}</Text>
        <Text style={[styles.heroValue, { color: colors.onAccent }]}>{formatMoney(net)}</Text>
        <Text style={[styles.heroSub, { color: colors.onAccent }]}>{pt.perMonth}</Text>
      </View>
      <View style={[styles.heroCard, { backgroundColor: colors.n200, borderWidth: 1, borderColor: colors.n280 }]}>
        <Text style={[styles.heroLabel, { color: colors.n580 }]}>{pt.grossSalaryResult}</Text>
        <Text style={[styles.heroValue, { color: colors.n940 }]}>{formatMoney(gross)}</Text>
        <Text style={[styles.heroSub, { color: colors.n580 }]}>{pt.perMonth}</Text>
      </View>
    </View>
  );
}

function StepLine({ label, result }: { label: string; result: number }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.stepText, { color: colors.n580 }]}>
      {label} = <Text style={{ color: colors.n940, fontWeight: "600" }}>{formatMoney(result)} AZN</Text>
    </Text>
  );
}

function StepBox({ children, tone }: { children: React.ReactNode; tone?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stepBox, { backgroundColor: tone ? tone + "1a" : colors.n240 }]}>{children}</View>
  );
}

function TotalLine({ value }: { value: number }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.stepTotal, { color: colors.n940, borderTopColor: colors.n280 }]}>
      {pt.total}: {formatMoney(value)} AZN
    </Text>
  );
}

function ItemRow({
  label,
  amount,
  sub,
  children,
}: {
  label: string;
  amount: number;
  sub?: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.item, { borderBottomColor: colors.n280 }]}>
      <View style={styles.itemHead}>
        <Text style={[styles.itemLabel, { color: colors.n940 }]}>{label}</Text>
        <Text style={[styles.itemValue, { color: colors.n940 }]}>{formatMoney(amount)} AZN</Text>
      </View>
      {sub ? <Text style={[styles.itemSub, { color: colors.n580 }]}>{sub}</Text> : null}
      {children}
    </View>
  );
}

function Panel({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.panel, { borderColor: colors.n280, backgroundColor: colors.n145 }]}>
      <View style={[styles.panelHead, { backgroundColor: colors.n200, borderBottomColor: colors.n280 }]}>
        <Text style={[styles.panelTitle, { color: colors.n940 }]}>
          {icon} {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function TotalBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.totalBar, { backgroundColor: color + "1a" }]}>
      <Text style={[styles.totalBarText, { color }]}>{label}</Text>
      <Text style={[styles.totalBarText, { color, fontWeight: "800" }]}>{formatMoney(value)} AZN</Text>
    </View>
  );
}

function AnnualSummary({ net, gross, deductions }: { net: number; gross: number; deductions: number }) {
  const { colors } = useTheme();
  const cells = [
    { label: pt.annualNetIncome, value: net * 12, color: colors.accent },
    { label: pt.annualGross, value: gross * 12, color: colors.n940 },
    { label: pt.annualDeduction, value: deductions * 12, color: RED },
  ];
  return (
    <View style={[styles.annual, { backgroundColor: BLUE + "14", borderColor: BLUE + "55" }]}>
      <Text style={[styles.panelTitle, { color: colors.n940, marginBottom: 10 }]}>📅 {pt.annualCalculation}</Text>
      {cells.map((c) => (
        <View key={c.label} style={styles.annualCell}>
          <Text style={[styles.annualLabel, { color: colors.n580 }]}>{c.label}</Text>
          <Text style={[styles.annualValue, { color: c.color }]}>{formatMoney(c.value)} AZN</Text>
        </View>
      ))}
    </View>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyText, { color: colors.n580 }]}>{text}</Text>
    </View>
  );
}

function RuleBox({ caption, formula }: { caption?: string; formula: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.ruleBox, { backgroundColor: BLUE + "1f" }]}>
      {caption ? <Text style={[styles.ruleCaption, { color: colors.n580 }]}>{caption}</Text> : null}
      <Text style={[styles.ruleFormula, { color: colors.n940 }]}>{formula}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionLabel, { color: colors.n940 }]}>{children}</Text>;
}

// ══════════════════════════════════════════════════════════════
// NƏTİCƏ BLOKLARI
// ══════════════════════════════════════════════════════════════

function PrimaryResult({ result, sector }: { result: SalaryCalc; sector: Sector }) {
  const taxSub = sector === "private" ? pt.taxSubPrivate : pt.taxSubState;
  const dsmfSub = sector === "private" ? pt.dsmfSubPrivate : pt.dsmfSubState;
  const medicalSub = sector === "private" ? pt.medicalSubPrivate : pt.medicalSubState;
  const dsmfEmployerSub = sector === "private" ? pt.dsmfEmployerSubPrivate : pt.dsmfEmployerSubState;

  return (
    <View style={styles.resultWrap}>
      <ResultCards net={result.net} gross={result.gross} />

      <View style={styles.badges}>
        <Badge
          text={sector === "private" ? pt.sectorPrivateBadge : pt.sectorStateBadge}
          color={sector === "private" ? GREEN : BLUE}
        />
      </View>

      <Panel icon="👤" title={pt.deductedFromEmployee}>
        <ItemRow label={pt.incomeTax} amount={result.incomeTax} sub={taxSub}>
          {result.taxSteps.length > 0 ? (
            <StepBox>
              {result.incomeTax === 0 && <Text style={[styles.stepText, { color: GREEN }]}>{pt.noTaxUnder200}</Text>}
              {result.taxSteps.map((s, i) => (
                <StepLine key={i} label={s.label} result={s.result} />
              ))}
              {result.taxSteps.length > 1 && <TotalLine value={result.incomeTax} />}
            </StepBox>
          ) : (
            <StepBox tone={GREEN}>
              <Text style={[styles.stepText, { color: GREEN }]}>{pt.noIncomeTaxUnder200}</Text>
            </StepBox>
          )}
        </ItemRow>

        <ItemRow label={pt.dsmf} amount={result.dsmfEmployee} sub={dsmfSub}>
          <StepBox>
            {result.dsmfSteps.map((s, i) => (
              <StepLine key={i} label={s.label} result={s.result} />
            ))}
            {result.dsmfSteps.length > 1 && <TotalLine value={result.dsmfEmployee} />}
          </StepBox>
        </ItemRow>

        <ItemRow label={pt.unemploymentInsurance} amount={result.unemploymentEmployee}>
          <StepBox>
            <StepLine label={`${formatMoney(result.gross)}₼ × 0,5%`} result={result.unemploymentEmployee} />
          </StepBox>
        </ItemRow>

        <ItemRow label={pt.medicalInsurance} amount={result.medicalInsurance} sub={medicalSub}>
          <StepBox>
            {result.medicalSteps.map((s, i) => (
              <StepLine key={i} label={s.label} result={s.result} />
            ))}
            {result.medicalSteps.length > 1 && <TotalLine value={result.medicalInsurance} />}
          </StepBox>
        </ItemRow>

        {result.unionFee > 0 && (
          <ItemRow label={pt.unionFee} amount={result.unionFee}>
            <StepBox>
              <StepLine label={`${formatMoney(result.gross)}₼ × 2%`} result={result.unionFee} />
            </StepBox>
          </ItemRow>
        )}

        {result.yapFee > 0 && (
          <ItemRow label={pt.yapFee} amount={result.yapFee}>
            <StepBox>
              <StepLine label={`${formatMoney(result.gross)}₼ × 1%`} result={result.yapFee} />
            </StepBox>
          </ItemRow>
        )}

        <TotalBar label={pt.totalDeduction} value={result.totalDeductions} color={RED} />
      </Panel>

      <Panel icon="🏢" title={pt.employerSide}>
        <ItemRow label={pt.dsmf} amount={result.dsmfEmployer} sub={dsmfEmployerSub}>
          <StepBox>
            {result.dsmfEmployerSteps.map((s, i) => (
              <StepLine key={i} label={s.label} result={s.result} />
            ))}
            {result.dsmfEmployerSteps.length > 1 && <TotalLine value={result.dsmfEmployer} />}
          </StepBox>
        </ItemRow>
        <ItemRow label={pt.unemploymentInsurance} amount={result.unemploymentEmployer}>
          <StepBox>
            <StepLine label={`${formatMoney(result.gross)}₼ × 0,5%`} result={result.unemploymentEmployer} />
          </StepBox>
        </ItemRow>
        <TotalBar label={pt.totalEmployerCost} value={result.totalEmployerCost} color={AMBER} />
      </Panel>

      <AnnualSummary net={result.net} gross={result.gross} deductions={result.totalDeductions} />
    </View>
  );
}

function SecondaryResult({ result, sector }: { result: SalaryCalc; sector: Sector }) {
  return (
    <View style={styles.resultWrap}>
      <ResultCards net={result.net} gross={result.gross} />

      <View style={styles.badges}>
        <Badge
          text={sector === "private" ? pt.sectorPrivateBadge : pt.sectorStateBadge}
          color={sector === "private" ? GREEN : BLUE}
        />
        <Badge text={pt.secondaryWorkplace} color={AMBER} />
      </View>

      <Panel icon="👤" title={pt.deductedFromEmployee}>
        <ItemRow label={pt.incomeTax} amount={result.incomeTax}>
          {result.taxSteps.length > 0 && (
            <StepBox>
              {result.taxSteps.map((s, i) => (
                <StepLine key={i} label={s.label} result={s.result} />
              ))}
            </StepBox>
          )}
        </ItemRow>
        <ItemRow label={pt.dsmf} amount={result.dsmfEmployee}>
          <StepBox>
            {result.dsmfSteps.map((s, i) => (
              <StepLine key={i} label={s.label} result={s.result} />
            ))}
          </StepBox>
        </ItemRow>
        <ItemRow label={pt.unemploymentInsurance} amount={result.unemploymentEmployee}>
          <StepBox>
            <StepLine label={`${formatMoney(result.gross)}₼ × 0,5%`} result={result.unemploymentEmployee} />
          </StepBox>
        </ItemRow>
        <ItemRow label={pt.medicalInsurance} amount={result.medicalInsurance}>
          <StepBox>
            {result.medicalSteps.map((s, i) => (
              <StepLine key={i} label={s.label} result={s.result} />
            ))}
          </StepBox>
        </ItemRow>
        <TotalBar label={pt.totalDeduction} value={result.totalDeductions} color={RED} />
      </Panel>

      <Panel icon="🏢" title={pt.employerSide}>
        <ItemRow label={pt.dsmf} amount={result.dsmfEmployer}>
          <StepBox>
            {result.dsmfEmployerSteps.map((s, i) => (
              <StepLine key={i} label={s.label} result={s.result} />
            ))}
          </StepBox>
        </ItemRow>
        <ItemRow label={pt.unemploymentInsurance} amount={result.unemploymentEmployer}>
          <StepBox>
            <StepLine label={`${formatMoney(result.gross)}₼ × 0,5%`} result={result.unemploymentEmployer} />
          </StepBox>
        </ItemRow>
        <TotalBar label={pt.totalEmployerCost} value={result.totalEmployerCost} color={AMBER} />
      </Panel>

      <AnnualSummary net={result.net} gross={result.gross} deductions={result.totalDeductions} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// ƏSAS KOMPONENT
// ══════════════════════════════════════════════════════════════

export function SalaryCalculator() {
  const { colors } = useTheme();

  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>("primary");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("gross-to-net");
  const [sector, setSector] = useState<Sector>("private");
  const [isUnionMember, setIsUnionMember] = useState(false);
  const [isYapMember, setIsYapMember] = useState(false);
  const [hasExemption, setHasExemption] = useState(false);
  const [exemptionAmount, setExemptionAmount] = useState(0);

  // Əlavə iş yeri
  const [secAmount, setSecAmount] = useState("");
  const [secDirection, setSecDirection] = useState<Direction>("gross-to-net");
  const [secSector, setSecSector] = useState<Sector>("private");

  // İşəgötürən
  const [empAmount, setEmpAmount] = useState("");
  const [empSector, setEmpSector] = useState<Sector>("private");

  const activeExemption = hasExemption ? exemptionAmount : 0;

  const result = useMemo<SalaryCalc | null>(() => {
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return null;

    if (direction === "gross-to-net") {
      const calc = calculateSalary(value, sector, activeExemption);
      const unionFee = isUnionMember ? value * 0.02 : 0;
      const yapFee = isYapMember ? value * 0.01 : 0;
      const extraDeductions = unionFee + yapFee;
      return {
        ...calc,
        unionFee,
        yapFee,
        extraDeductions,
        totalDeductions: calc.totalDeductions + extraDeductions,
        net: Math.max(0, calc.net - extraDeductions),
      };
    } else {
      // Net → Gross: iterativ yanaşma
      let gross = value;
      for (let i = 0; i < 200; i++) {
        const calc = calculateSalary(gross, sector, activeExemption);
        const unionFee = isUnionMember ? gross * 0.02 : 0;
        const yapFee = isYapMember ? gross * 0.01 : 0;
        const netCalc = calc.net - unionFee - yapFee;
        const diff = value - netCalc;
        if (Math.abs(diff) < 0.01) break;
        gross += diff;
      }
      const final = calculateSalary(gross, sector, activeExemption);
      const unionFee = isUnionMember ? gross * 0.02 : 0;
      const yapFee = isYapMember ? gross * 0.01 : 0;
      const extraDeductions = unionFee + yapFee;
      return {
        ...final,
        unionFee,
        yapFee,
        extraDeductions,
        totalDeductions: final.totalDeductions + extraDeductions,
        net: value,
      };
    }
  }, [amount, direction, sector, isUnionMember, isYapMember, activeExemption]);

  // Əlavə iş yeri (güzəştsiz, həmkarlar/YAP yoxdur)
  const secResult = useMemo<SalaryCalc | null>(() => {
    const value = parseFloat(secAmount.replace(",", "."));
    if (!value || value <= 0) return null;

    if (secDirection === "gross-to-net") {
      return { ...calculateSalary(value, secSector, 0), unionFee: 0, yapFee: 0, extraDeductions: 0 };
    } else {
      let gross = value;
      for (let i = 0; i < 200; i++) {
        const calc = calculateSalary(gross, secSector, 0);
        const diff = value - calc.net;
        if (Math.abs(diff) < 0.01) break;
        gross += diff;
      }
      const final = calculateSalary(gross, secSector, 0);
      return { ...final, net: value, unionFee: 0, yapFee: 0, extraDeductions: 0 };
    }
  }, [secAmount, secDirection, secSector]);

  // İşəgötürən
  const empResult = useMemo(() => {
    const gross = parseFloat(empAmount.replace(",", "."));
    if (!gross || gross <= 0) return null;

    let dsmf: number;
    let medical: number;
    const unemployment = gross * 0.005;

    if (empSector === "private") {
      dsmf = calcPrivateDSMFEmployer(gross);
      medical = calcPrivateMedical(gross);
    } else {
      dsmf = gross * 0.22;
      medical = calcStateMedical(gross);
    }

    const total = gross + dsmf + unemployment + medical;
    return { gross, dsmf, unemployment, medical, total };
  }, [empAmount, empSector]);

  return (
    <View>
      {/* İş yeri seçimi */}
      <SegmentControl
        options={[
          { value: "primary", label: pt.tabPrimary },
          { value: "secondary", label: pt.tabSecondary },
          { value: "employer", label: pt.tabEmployer },
        ]}
        selected={workplaceType}
        onSelect={(v) => setWorkplaceType(v as WorkplaceType)}
      />

      {workplaceType === "primary" ? (
        <>
          <Select
            label={pt.jobCategory}
            value={sector}
            options={SECTOR_OPTIONS}
            onSelect={(v) => setSector(v as Sector)}
          />

          {/* Güzəştlər */}
          <View style={{ marginBottom: 12 }}>
            <Checkbox
              label={pt.exemptions}
              checked={hasExemption}
              onChange={(checked) => {
                setHasExemption(checked);
                if (!checked) setExemptionAmount(0);
                else if (exemptionAmount === 0) setExemptionAmount(800);
              }}
            />
            {hasExemption && (
              <View style={{ gap: 8, marginTop: 8 }}>
                {exemptions.map((opt) => {
                  const active = exemptionAmount === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setExemptionAmount(opt.value)}
                      style={[
                        styles.radioCard,
                        {
                          borderColor: active ? colors.accent : colors.n280,
                          backgroundColor: active ? colors.accent + "1a" : colors.n200,
                          borderWidth: active ? 2 : 1,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                    >
                      <MaterialIcons
                        name={active ? "radio-button-checked" : "radio-button-unchecked"}
                        size={20}
                        color={active ? colors.accent : colors.n580}
                        style={{ marginTop: 1 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.radioTitle, { color: colors.n940 }]}>{opt.title}</Text>
                        <Text style={[styles.radioArticle, { color: colors.accent }]}>
                          {pt.exemptionLabel(opt.value, opt.article)}
                        </Text>
                        <Text style={[styles.radioDesc, { color: colors.n580 }]}>{opt.desc}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <SegmentControl
            options={DIRECTION_OPTIONS}
            selected={direction}
            onSelect={setDirection}
          />

          <InputField
            label={`💵 ${direction === "gross-to-net" ? pt.grossSalary : pt.netSalary} (AZN)`}
            value={amount}
            onChangeText={setAmount}
            placeholder={direction === "gross-to-net" ? "2000" : "1500"}
            keyboardType="decimal-pad"
          />
          <Presets onPick={setAmount} />

          {/* Üzvlük seçimləri */}
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <SectionLabel>{pt.additionalDeductions}</SectionLabel>
            <View style={[styles.checkCard, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
              <Checkbox
                label={pt.unionMember}
                description={pt.unionMemberDesc}
                checked={isUnionMember}
                onChange={setIsUnionMember}
              />
            </View>
            <View style={[styles.checkCard, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
              <Checkbox
                label={pt.yapMember}
                description={pt.yapMemberDesc}
                checked={isYapMember}
                onChange={setIsYapMember}
              />
            </View>
          </View>

          {result ? (
            <PrimaryResult result={result} sector={sector} />
          ) : (
            <EmptyState icon="💵" text={pt.emptyStateSalary} />
          )}
        </>
      ) : workplaceType === "secondary" ? (
        <>
          <SegmentControl
            options={DIRECTION_OPTIONS}
            selected={secDirection}
            onSelect={setSecDirection}
          />

          <InputField
            label={`💵 ${secDirection === "gross-to-net" ? pt.grossSalary : pt.netSalary} (AZN)`}
            value={secAmount}
            onChangeText={setSecAmount}
            placeholder={secDirection === "gross-to-net" ? "3000" : "2500"}
            keyboardType="decimal-pad"
          />
          <Presets onPick={setSecAmount} />

          <View style={{ marginTop: 12 }}>
            <Select
              label={pt.jobCategory}
              value={secSector}
              options={SECTOR_OPTIONS}
              onSelect={(v) => setSecSector(v as Sector)}
            />
          </View>

          {secResult ? (
            <SecondaryResult result={secResult} sector={secSector} />
          ) : (
            <EmptyState icon="💵" text={pt.emptyStateSalary} />
          )}
        </>
      ) : (
        <>
          <Text style={[styles.desc, { color: colors.n580 }]}>{pt.employerTabDesc}</Text>

          <InputField
            label={`💵 ${pt.grossMonthlySalary} (AZN)`}
            value={empAmount}
            onChangeText={setEmpAmount}
            placeholder="3000"
            keyboardType="decimal-pad"
          />
          <Presets onPick={setEmpAmount} />

          <View style={{ marginTop: 12 }}>
            <Select
              label={pt.jobCategory}
              value={empSector}
              options={SECTOR_OPTIONS}
              onSelect={(v) => setEmpSector(v as Sector)}
            />
          </View>

          {empResult ? (
            <View style={styles.resultWrap}>
              <View style={[styles.pill, { backgroundColor: "#4ade80" }]}>
                <Text style={styles.pillText}>
                  {pt.employeeSalary}: {formatMoney(empResult.gross)} ₼
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                {[
                  { label: pt.mandatorySocialInsurance, value: empResult.dsmf },
                  { label: pt.unemploymentInsuranceFee, value: empResult.unemployment },
                  { label: pt.medicalInsuranceFee, value: empResult.medical },
                ].map((r) => (
                  <View key={r.label} style={styles.empRow}>
                    <Text style={[styles.empLabel, { color: colors.n940 }]}>{r.label}</Text>
                    <Text style={[styles.empValue, { color: colors.n940 }]}>{formatMoney(r.value)} ₼</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.pill, { backgroundColor: colors.accent }]}>
                <Text style={[styles.pillText, { color: colors.onAccent }]}>
                  {pt.employerPayment}: {formatMoney(empResult.total)} ₼
                </Text>
              </View>

              {/* Hesablama qaydası */}
              <View style={[styles.rules, { backgroundColor: BLUE + "14", borderColor: BLUE + "55" }]}>
                <View style={[styles.pill, { backgroundColor: colors.accent, marginBottom: 6 }]}>
                  <Text style={[styles.pillText, { color: colors.onAccent }]}>{pt.employerPaymentRules(empSector)}</Text>
                </View>

                {empSector === "private" ? (
                  <View style={{ gap: 14 }}>
                    <View style={{ gap: 6 }}>
                      <SectionLabel>{pt.mandatorySocialInsurance}</SectionLabel>
                      <RuleBox caption={pt.salaryUpTo200} formula={pt.insurableIncomeX22} />
                      <RuleBox caption={pt.salaryFrom200To8000} formula={pt.formula44Plus} />
                      <RuleBox caption={pt.salaryOver8000} formula={pt.formula1214Plus} />
                    </View>
                    <View style={{ gap: 6 }}>
                      <SectionLabel>{pt.unemploymentInsuranceFee}</SectionLabel>
                      <RuleBox formula={pt.payrollFundX05} />
                    </View>
                    <View style={{ gap: 6 }}>
                      <SectionLabel>{pt.medicalInsuranceFee}</SectionLabel>
                      <RuleBox caption={pt.salaryUpTo2500Medical} formula={pt.monthlySalaryX2} />
                      <RuleBox caption={pt.salaryOver2500Medical} formula={pt.formula50PlusMedical} />
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: 14 }}>
                    <View style={{ gap: 6 }}>
                      <SectionLabel>{pt.mandatorySocialInsurance}</SectionLabel>
                      <RuleBox formula={pt.insurableIncomeX22} />
                    </View>
                    <View style={{ gap: 6 }}>
                      <SectionLabel>{pt.unemploymentInsuranceFee}</SectionLabel>
                      <RuleBox formula={pt.payrollFundX05} />
                    </View>
                    <View style={{ gap: 6 }}>
                      <SectionLabel>{pt.medicalInsuranceFee}</SectionLabel>
                      <RuleBox caption={pt.salaryUpTo8000Medical} formula={pt.monthlySalaryX2} />
                      <RuleBox caption={pt.salaryOver8000Medical} formula={pt.formula160PlusMedical} />
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <EmptyState icon="🏢" text={pt.emptyStateGross} />
          )}
        </>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["overtime", "freelancer-tax", "rental-income-tax", "loan"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: -4, marginBottom: 4 },
  preset: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  presetText: { fontSize: 12, fontWeight: "600" },
  radioCard: { flexDirection: "row", gap: 10, borderRadius: 12, padding: 12 },
  radioTitle: { fontSize: 14, fontWeight: "700" },
  radioArticle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  radioDesc: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  checkCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  sectionLabel: { fontSize: 14, fontWeight: "700" },
  resultWrap: { gap: 16, marginTop: 16 },
  heroCard: { borderRadius: 16, padding: 18, alignItems: "center" },
  heroLabel: { fontSize: 13, fontWeight: "600", opacity: 0.9 },
  heroValue: { fontSize: 30, fontWeight: "800", marginTop: 4 },
  heroSub: { fontSize: 12, marginTop: 4, opacity: 0.85 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  panel: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  panelHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  panelTitle: { fontSize: 15, fontWeight: "700" },
  item: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  itemHead: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: "600", flex: 1 },
  itemValue: { fontSize: 14, fontWeight: "800" },
  itemSub: { fontSize: 11, lineHeight: 16, marginBottom: 6 },
  stepBox: { borderRadius: 8, padding: 10, gap: 4 },
  stepText: { fontSize: 12, lineHeight: 18 },
  stepTotal: { fontSize: 12, fontWeight: "700", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4, marginTop: 2 },
  totalBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  totalBarText: { fontSize: 14, fontWeight: "700" },
  annual: { borderWidth: 1, borderRadius: 12, padding: 14 },
  annualCell: { alignItems: "center", paddingVertical: 6 },
  annualLabel: { fontSize: 12, marginBottom: 2 },
  annualValue: { fontSize: 18, fontWeight: "800" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  pill: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  empRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  empLabel: { fontSize: 14, fontWeight: "600", flex: 1 },
  empValue: { fontSize: 14, fontWeight: "800" },
  rules: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 6, gap: 10 },
  ruleBox: { borderRadius: 8, padding: 10 },
  ruleCaption: { fontSize: 12, marginBottom: 2 },
  ruleFormula: { fontSize: 14, fontStyle: "italic" },
});
