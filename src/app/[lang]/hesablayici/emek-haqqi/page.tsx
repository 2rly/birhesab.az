"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// ============================================================
// Azərbaycan əmək haqqı hesablama qaydaları (2026)
// Qeyri neft-qaz / Özəl sektor  vs  Dövlət / Neft-qaz sektoru
// ============================================================

const MINIMUM_WAGE = 400; // AZN (2026)

type Sector = "private" | "state";
type Direction = "gross-to-net" | "net-to-gross";

// ══════════════════════════════════════════════════════════════
// QEYRİ NEFT-QAZ VƏ ÖZƏL SEKTOR
// ══════════════════════════════════════════════════════════════

// Gəlir vergisi (2026-cı il yanvarın 1-dən 2027-ci il yanvarın 1-dək)
// Rəsmi qaydalar: taxes.gov.az
function calcPrivateIncomeTax(gross: number, exemption: number = 0): number {
  const taxFree = 200 + exemption;
  if (gross <= taxFree) return 0;

  // VCM ≤ 2500: (VCM − taxFree) × 3%
  if (gross <= 2500) {
    return (gross - taxFree) * 0.03;
  }
  // VCM 2500–8000: baseTax + (gross − 2500) × 10%
  // Rəsmi sabit: güzəştsiz 75, güzəştli isə (2500 − taxFree) × 3%
  const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.03 : 75;
  if (gross <= 8000) {
    return baseTax + (gross - 2500) * 0.10;
  }
  // VCM > 8000: baseTax + 550 + (gross − 8000) × 14%
  // Rəsmi sabit: güzəştsiz 625
  return baseTax + (8000 - 2500) * 0.10 + (gross - 8000) * 0.14;
}

// DSMF işçi (rəsmi qaydalar):
// ≤200: gross × 3%
// 200–8000: 6 + (gross − 200) × 10%
// 8000+: 786 + (gross − 8000) × 10%
function calcPrivateDSMFEmployee(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  if (gross <= 8000) return 6 + (gross - 200) * 0.10;
  return 786 + (gross - 8000) * 0.10;
}

// İcbari tibbi sığorta (rəsmi qaydalar):
// ≤2500: gross × 2%
// 2500+: 50 + (gross − 2500) × 0.5%
function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 50 + (gross - 2500) * 0.005;
}

// DSMF işəgötürən (rəsmi qaydalar):
// ≤200: gross × 22%
// 200–8000: 44 + (gross − 200) × 15%
// 8000+: 1214 + (gross − 8000) × 11%
function calcPrivateDSMFEmployer(gross: number): number {
  if (gross <= 200) return gross * 0.22;
  if (gross <= 8000) return 44 + (gross - 200) * 0.15;
  return 1214 + (gross - 8000) * 0.11;
}

// ══════════════════════════════════════════════════════════════
// DÖVLƏT VƏ NEFT-QAZ SEKTORU
// ══════════════════════════════════════════════════════════════

// Gəlir vergisi — Dövlət sektoru (rəsmi qaydalar: taxes.gov.az)
// VCM = gross − güzəşt
// VCM ≤ 2500: (VCM − 200) × 14%
// VCM > 2500: 350 + (VCM − 2500) × 25%
function calcStateIncomeTax(gross: number, exemption: number = 0): number {
  const taxFree = 200 + exemption;
  if (gross <= taxFree) return 0;

  if (gross <= 2500) {
    return (gross - taxFree) * 0.14;
  }
  const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.14 : 350;
  return baseTax + (gross - 2500) * 0.25;
}

// İcbari tibbi sığorta — Dövlət sektoru (rəsmi qaydalar):
// ≤8000: gross × 2%
// 8000+: 160 + (gross − 8000) × 0.5%
function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 160 + (gross - 8000) * 0.005;
}

// ══════════════════════════════════════════════════════════════
// HESABLAMA
// ══════════════════════════════════════════════════════════════

interface BreakdownStep { label: string; amount: number; rate: string; result: number }

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

    // Tax breakdown (rəsmi qaydalar: taxes.gov.az)
    if (exemption > 0 && gross > taxFree) {
      taxSteps.push({ label: `Güzəşt: vergi tutulan gəlir ${exemption}₼ azaldılır (azad hissə: ${taxFree}₼)`, amount: exemption, rate: "", result: 0 });
    }
    if (gross > taxFree && gross <= 2500) {
      taxSteps.push({ label: `(${gross.toFixed(0)} − ${taxFree}) × 3%`, amount: gross - taxFree, rate: "3%", result: (gross - taxFree) * 0.03 });
    }
    if (gross > 2500 && gross <= 8000) {
      const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.03 : 75;
      taxSteps.push({ label: `75 + (${gross.toFixed(0)} − 2500) × 10%`, amount: gross - 2500, rate: "10%", result: baseTax + (gross - 2500) * 0.10 });
    }
    if (gross > 8000) {
      const baseTax = exemption > 0 ? Math.max(0, 2500 - taxFree) * 0.03 + (8000 - 2500) * 0.10 : 625;
      taxSteps.push({ label: `625 + (${gross.toFixed(0)} − 8000) × 14%`, amount: gross - 8000, rate: "14%", result: baseTax + (gross - 8000) * 0.14 });
    }

    // DSMF breakdown (rəsmi qaydalar)
    if (gross <= 200) {
      dsmfSteps.push({ label: `${gross.toFixed(0)}₼ × 3%`, amount: gross, rate: "3%", result: gross * 0.03 });
    } else if (gross <= 8000) {
      dsmfSteps.push({ label: `6 + (${gross.toFixed(0)} − 200) × 10%`, amount: gross - 200, rate: "10%", result: 6 + (gross - 200) * 0.10 });
    } else {
      dsmfSteps.push({ label: `786 + (${gross.toFixed(0)} − 8000) × 10%`, amount: gross - 8000, rate: "10%", result: 786 + (gross - 8000) * 0.10 });
    }

    // Medical breakdown (rəsmi qaydalar)
    if (gross <= 2500) {
      medicalSteps.push({ label: `${gross.toFixed(0)}₼ × 2%`, amount: gross, rate: "2%", result: gross * 0.02 });
    } else {
      medicalSteps.push({ label: `50 + (${gross.toFixed(0)} − 2500) × 0,5%`, amount: gross - 2500, rate: "0,5%", result: 50 + (gross - 2500) * 0.005 });
    }

    // Employer DSMF breakdown (rəsmi qaydalar)
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

    // Tax breakdown (Dövlət sektoru — rəsmi qaydalar)
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

    // DSMF: gross × 3%
    dsmfSteps.push({ label: `${gross.toFixed(0)}₼ × 3%`, amount: gross, rate: "3%", result: gross * 0.03 });

    // Medical breakdown (rəsmi qaydalar)
    if (gross <= 8000) {
      medicalSteps.push({ label: `${gross.toFixed(0)}₼ × 2%`, amount: gross, rate: "2%", result: gross * 0.02 });
    } else {
      medicalSteps.push({ label: `160 + (${gross.toFixed(0)} − 8000) × 0,5%`, amount: gross - 8000, rate: "0,5%", result: 160 + (gross - 8000) * 0.005 });
    }

    // Employer DSMF: gross × 22%
    dsmfEmployerSteps.push({ label: `${gross.toFixed(0)}₼ × 22%`, amount: gross, rate: "22%", result: gross * 0.22 });
  }

  const totalDeductions = incomeTax + dsmfEmployee + unemploymentEmployee + medicalInsurance;
  const net = gross - totalDeductions;
  const totalEmployerCost = gross + dsmfEmployer + unemploymentEmployer;

  return {
    gross, net: Math.max(0, net), exemption,
    incomeTax, dsmfEmployee, unemploymentEmployee, medicalInsurance,
    totalDeductions, dsmfEmployer, unemploymentEmployer, totalEmployerCost,
    taxSteps, dsmfSteps, medicalSteps, dsmfEmployerSteps,
  };
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type WorkplaceType = "primary" | "secondary" | "employer";

// ══════════════════════════════════════════════════════════════
// PAGE TRANSLATIONS
// ══════════════════════════════════════════════════════════════

const exemptionOptions: Record<Lang, { value: number; desc: string }[]> = {
  az: [
    { value: 800, desc: "Şəhid ailə üzvləri, I qrup əlillər, müharibə əlilləri" },
    { value: 400, desc: "II qrup əlillər, Çernobıl qəzası nəticəsində əlil olanlar" },
    { value: 200, desc: "Döyüş əməliyyatları veteranları, 3 uşaqlı ailələr" },
    { value: 100, desc: "Hərbi qulluqçuların ailə üzvləri" },
    { value: 50, desc: "Digər güzəşt kateqoriyaları" },
  ],
  en: [
    { value: 800, desc: "Families of martyrs, Group I disabled, war-disabled persons" },
    { value: 400, desc: "Group II disabled, Chernobyl disaster disabled persons" },
    { value: 200, desc: "Combat veterans, families with 3 children" },
    { value: 100, desc: "Family members of military personnel" },
    { value: 50, desc: "Other exemption categories" },
  ],
  ru: [
    { value: 800, desc: "Семьи шехидов, инвалиды I группы, инвалиды войны" },
    { value: 400, desc: "Инвалиды II группы, пострадавшие от аварии в Чернобыле" },
    { value: 200, desc: "Ветераны боевых действий, семьи с 3 детьми" },
    { value: 100, desc: "Члены семей военнослужащих" },
    { value: 50, desc: "Другие категории льгот" },
  ],
};

const pageTranslations = {
  az: {
    title: "Əmək haqqı hesablayıcısı",
    description: "Gross və ya net əmək haqqını daxil edin — sektora uyğun bütün vergi və tutulmaları ani hesablayın.",
    breadcrumbCategory: "Maliyyə",
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

V.M. 102.1-1 Güzəştlər (vergi tutulan gəlir azaldılır):
• 800₼: Şəhid ailə üzvləri, I qrup əlillər, müharibə əlilləri
• 400₼: II qrup əlillər, Çernobıl qəzası əlilləri
• 200₼: Döyüş veteranları, 3 uşaqlı ailələr
• 100₼: Hərbi qulluqçuların ailə üzvləri
• 50₼: Digər güzəşt kateqoriyaları

Əlavə tutulmalar (könüllü):
• Həmkarlar İttifaqı üzvlüyü: 2%
• Yeni Azərbaycan Partiyası üzvlüyü: 1%

Minimum əmək haqqı: ${MINIMUM_WAGE} AZN (2026)`,
    // Tabs
    tabPrimary: "Əsas iş yeri",
    tabSecondary: "Əlavə iş yeri",
    tabEmployer: "İşəgötürən üçün",
    // Sector
    jobCategory: "İş kateqoriyası:",
    sectorPrivate: "Qeyri-dövlət və qeyri-neft sektoru",
    sectorState: "Dövlət və neft sektoru",
    // Exemptions
    exemptions: "Güzəştlər",
    exemptionLabel: (value: number) => `V.M. 102.1-1 Vergi tutulan gəlir ${value} AZN azaldılır`,
    // Direction
    grossToNet: "Gross → Net",
    netToGross: "Net → Gross",
    // Input labels
    grossSalary: "Gross əmək haqqı",
    netSalary: "Net əmək haqqı (əlinizə çatan)",
    grossMonthlySalary: "Gross aylıq əməkhaqqı",
    // Additional deductions
    additionalDeductions: "Əlavə tutulmalar",
    unionMember: "Həmkarlar İttifaqı üzvüyəm",
    unionMemberDesc: "Gross əmək haqqının 2%-i tutulur",
    yapMember: "Yeni Azərbaycan Partiyası üzvüyəm",
    yapMemberDesc: "Gross əmək haqqının 1%-i tutulur",
    // Result cards
    netSalaryResult: "Net əmək haqqı (əlinizə çatan)",
    grossSalaryResult: "Gross əmək haqqı",
    perMonth: "AZN / ay",
    // Sector badges
    sectorPrivateBadge: "Qeyri neft-qaz / Özəl sektor",
    sectorStateBadge: "Dövlət / Neft-qaz sektoru",
    secondaryWorkplace: "Əlavə iş yeri",
    // Deduction details
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
    // Tax descriptions
    taxSubPrivate: "200₼-dək 0%, 200–2500₼ arası 3%, 2500–8000₼ arası 10%, 8000₼-dan çox 14%",
    taxSubState: "200₼-dək 0%, 200–2500₼ arası 14%, 2500₼-dan çox 25%",
    dsmfSubPrivate: "≤200₼: 3%, 200–8000₼: 6+(gross−200)×10%, 8000₼+: 786+(gross−8000)×10%",
    dsmfSubState: "Gross məbləğin 3%-i",
    medicalSubPrivate: "≤2500₼: gross×2%, 2500₼+: 50+(gross−2500)×0,5%",
    medicalSubState: "≤8000₼: gross×2%, 8000₼+: 160+(gross−8000)×0,5%",
    dsmfEmployerSubPrivate: "200₼-dək 22%, 200₼-dan çox 15%",
    dsmfEmployerSubState: "Gross məbləğin 22%-i",
    // Employer section
    employerSide: "İşəgötürən tərəfdən",
    totalEmployerCost: "İşəgötürənin ümumi xərci",
    // Annual
    annualCalculation: "İllik hesablama",
    annualNetIncome: "İllik net gəlir",
    annualGross: "İllik gross",
    annualDeduction: "İllik tutulma",
    // Empty states
    emptyStateSalary: "Nəticəni görmək üçün əmək haqqını daxil edin.",
    emptyStateGross: "Nəticəni görmək üçün gross əmək haqqını daxil edin.",
    // Employer tab
    employerTabDesc: "İşçinin GROSS əməkhaqqına əsasən işəgötürənin ödəyəcəyi məbləği hesablayın",
    employeeSalary: "İşçinin əməkhaqqı",
    mandatorySocialInsurance: "Məcburi dövlət sosial sığorta haqqı:",
    unemploymentInsuranceFee: "İşsizlikdən sığorta haqqı:",
    medicalInsuranceFee: "İcbari tibbi sığorta haqqı:",
    employerPayment: "İşəgötürənin ödəyəcəyi məbləğ",
    employerPaymentRules: (sector: string) => `İşəgötürənin ödəməsi (${sector === "private" ? "Özəl sektor" : "Dövlət sektoru"})`,
    // Employer rules - private
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
    // Employer rules - state
    salaryUpTo8000Medical: "Əməkhaqqı 8 000 ₼-dək olduqda:",
    salaryOver8000Medical: "Əməkhaqqı 8 000 ₼-dən çox olduqda:",
    formula160PlusMedical: "160 + (Hesablanan aylıq əməkhaqqı − 8 000) × 0.5%",
  },
  en: {
    title: "Salary Calculator",
    description: "Enter gross or net salary — instantly calculate all taxes and deductions by sector.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How are salary deductions calculated? (2026)",
    formulaContent: `Non-oil/gas / Private sector (from employee):
• Income tax:
  0–200 AZN: 0%
  200–2500 AZN: (salary − 200) × 3%
  2500–8000 AZN: 75 + (salary − 2500) × 10%
  8000+ AZN: 625 + (salary − 8000) × 14%
• SSPF: up to 200 AZN 3%, above 10%
• Unemployment insurance: 0.5%
• Mandatory health insurance: up to 2500 AZN 2%, above 0.5%
• Employer SSPF: up to 200 AZN 22%, above 15%

State / Oil-gas sector (from employee):
• Taxable amount: Salary − Exemption
• Income tax:
  TAI ≤ 2500 AZN: (TAI − 200) × 14%
  TAI > 2500 AZN: 350 + (TAI − 2500) × 25%
• SSPF: gross × 3%
• Unemployment insurance: gross × 0.5%
• Mandatory health insurance:
  ≤ 8000 AZN: gross × 2%
  > 8000 AZN: 160 + (gross − 8000) × 0.5%
• Employer SSPF: gross × 22%

Tax Code 102.1-1 Exemptions (taxable income reduced):
• 800 AZN: Families of martyrs, Group I disabled, war-disabled
• 400 AZN: Group II disabled, Chernobyl disaster disabled
• 200 AZN: Combat veterans, families with 3 children
• 100 AZN: Family members of military personnel
• 50 AZN: Other exemption categories

Additional deductions (voluntary):
• Trade union membership: 2%
• New Azerbaijan Party membership: 1%

Minimum wage: ${MINIMUM_WAGE} AZN (2026)`,
    tabPrimary: "Primary workplace",
    tabSecondary: "Secondary workplace",
    tabEmployer: "For employer",
    jobCategory: "Job category:",
    sectorPrivate: "Non-state and non-oil sector",
    sectorState: "State and oil sector",
    exemptions: "Exemptions",
    exemptionLabel: (value: number) => `TC 102.1-1 Taxable income reduced by ${value} AZN`,
    grossToNet: "Gross → Net",
    netToGross: "Net → Gross",
    grossSalary: "Gross salary",
    netSalary: "Net salary (take-home)",
    grossMonthlySalary: "Gross monthly salary",
    additionalDeductions: "Additional deductions",
    unionMember: "I am a trade union member",
    unionMemberDesc: "2% of gross salary is deducted",
    yapMember: "I am a New Azerbaijan Party member",
    yapMemberDesc: "1% of gross salary is deducted",
    netSalaryResult: "Net salary (take-home)",
    grossSalaryResult: "Gross salary",
    perMonth: "AZN / month",
    sectorPrivateBadge: "Non-oil/gas / Private sector",
    sectorStateBadge: "State / Oil-gas sector",
    secondaryWorkplace: "Secondary workplace",
    deductedFromEmployee: "Deducted from employee",
    incomeTax: "Income tax",
    dsmf: "SSPF",
    unemploymentInsurance: "Unemployment insurance",
    medicalInsurance: "Mandatory health insurance",
    unionFee: "Trade union fee",
    yapFee: "New Azerbaijan Party fee",
    totalDeduction: "Total deduction",
    total: "Total",
    noTaxUnder200: "No tax under 200 AZN",
    noIncomeTaxUnder200: "No income tax under 200 AZN",
    taxSubPrivate: "Up to 200 AZN 0%, 200–2500 AZN 3%, 2500–8000 AZN 10%, over 8000 AZN 14%",
    taxSubState: "Up to 200 AZN 0%, 200–2500 AZN 14%, over 2500 AZN 25%",
    dsmfSubPrivate: "≤200 AZN: 3%, 200–8000 AZN: 6+(gross−200)×10%, 8000+: 786+(gross−8000)×10%",
    dsmfSubState: "3% of gross amount",
    medicalSubPrivate: "≤2500 AZN: gross×2%, 2500+: 50+(gross−2500)×0.5%",
    medicalSubState: "≤8000 AZN: gross×2%, 8000+: 160+(gross−8000)×0.5%",
    dsmfEmployerSubPrivate: "Up to 200 AZN 22%, over 200 AZN 15%",
    dsmfEmployerSubState: "22% of gross amount",
    employerSide: "Employer side",
    totalEmployerCost: "Total employer cost",
    annualCalculation: "Annual calculation",
    annualNetIncome: "Annual net income",
    annualGross: "Annual gross",
    annualDeduction: "Annual deduction",
    emptyStateSalary: "Enter a salary to see the result.",
    emptyStateGross: "Enter a gross salary to see the result.",
    employerTabDesc: "Calculate the amount the employer will pay based on the employee's GROSS salary",
    employeeSalary: "Employee salary",
    mandatorySocialInsurance: "Mandatory state social insurance:",
    unemploymentInsuranceFee: "Unemployment insurance fee:",
    medicalInsuranceFee: "Mandatory health insurance fee:",
    employerPayment: "Amount to be paid by employer",
    employerPaymentRules: (sector: string) => `Employer payments (${sector === "private" ? "Private sector" : "State sector"})`,
    salaryUpTo200: "Salary up to 200 AZN:",
    insurableIncomeX22: "Monthly insurable income × 22%",
    salaryFrom200To8000: "Salary from 200 AZN to 8,000 AZN:",
    formula44Plus: "44 + (Monthly insurable income − 200) × 15%",
    salaryOver8000: "Salary over 8,000 AZN:",
    formula1214Plus: "1,214 + (Monthly insurable income − 8,000) × 11%",
    payrollFundX05: "Payroll fund × 0.5%",
    salaryUpTo2500Medical: "Salary up to 2,500 AZN:",
    monthlySalaryX2: "Monthly salary × 2%",
    salaryOver2500Medical: "Salary over 2,500 AZN:",
    formula50PlusMedical: "50 + (Monthly salary − 2,500) × 0.5%",
    salaryUpTo8000Medical: "Salary up to 8,000 AZN:",
    salaryOver8000Medical: "Salary over 8,000 AZN:",
    formula160PlusMedical: "160 + (Monthly salary − 8,000) × 0.5%",
  },
  ru: {
    title: "Калькулятор зарплаты",
    description: "Введите брутто или нетто зарплату — мгновенно рассчитайте все налоги и удержания по секторам.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как рассчитываются удержания из зарплаты? (2026)",
    formulaContent: `Ненефтяной/негазовый / Частный сектор (с работника):
• Подоходный налог:
  0–200 AZN: 0%
  200–2500 AZN: (зарплата − 200) × 3%
  2500–8000 AZN: 75 + (зарплата − 2500) × 10%
  8000+ AZN: 625 + (зарплата − 8000) × 14%
• ГФСЗ: до 200 AZN 3%, свыше 10%
• Страхование от безработицы: 0,5%
• Обязательное медстрахование: до 2500 AZN 2%, свыше 0,5%
• ГФСЗ работодателя: до 200 AZN 22%, свыше 15%

Государственный / Нефтегазовый сектор (с работника):
• Налогооблагаемая сумма: Зарплата − Льгота
• Подоходный налог:
  НОС ≤ 2500 AZN: (НОС − 200) × 14%
  НОС > 2500 AZN: 350 + (НОС − 2500) × 25%
• ГФСЗ: брутто × 3%
• Страхование от безработицы: брутто × 0,5%
• Обязательное медстрахование:
  ≤ 8000 AZN: брутто × 2%
  > 8000 AZN: 160 + (брутто − 8000) × 0,5%
• ГФСЗ работодателя: брутто × 22%

НК 102.1-1 Льготы (налогооблагаемый доход уменьшается):
• 800 AZN: Семьи шехидов, инвалиды I группы, инвалиды войны
• 400 AZN: Инвалиды II группы, пострадавшие от Чернобыля
• 200 AZN: Ветераны боевых действий, семьи с 3 детьми
• 100 AZN: Члены семей военнослужащих
• 50 AZN: Другие категории льгот

Дополнительные удержания (добровольные):
• Членство в профсоюзе: 2%
• Членство в партии «Новый Азербайджан»: 1%

Минимальная зарплата: ${MINIMUM_WAGE} AZN (2026)`,
    tabPrimary: "Основное место работы",
    tabSecondary: "Дополнительное место работы",
    tabEmployer: "Для работодателя",
    jobCategory: "Категория работы:",
    sectorPrivate: "Негосударственный и ненефтяной сектор",
    sectorState: "Государственный и нефтяной сектор",
    exemptions: "Льготы",
    exemptionLabel: (value: number) => `НК 102.1-1 Налогооблагаемый доход уменьшается на ${value} AZN`,
    grossToNet: "Брутто → Нетто",
    netToGross: "Нетто → Брутто",
    grossSalary: "Брутто зарплата",
    netSalary: "Нетто зарплата (на руки)",
    grossMonthlySalary: "Брутто месячная зарплата",
    additionalDeductions: "Дополнительные удержания",
    unionMember: "Я член профсоюза",
    unionMemberDesc: "Удерживается 2% от брутто зарплаты",
    yapMember: "Я член партии «Новый Азербайджан»",
    yapMemberDesc: "Удерживается 1% от брутто зарплаты",
    netSalaryResult: "Нетто зарплата (на руки)",
    grossSalaryResult: "Брутто зарплата",
    perMonth: "AZN / мес.",
    sectorPrivateBadge: "Ненефтегазовый / Частный сектор",
    sectorStateBadge: "Государственный / Нефтегазовый сектор",
    secondaryWorkplace: "Дополнительное место работы",
    deductedFromEmployee: "Удержано с работника",
    incomeTax: "Подоходный налог",
    dsmf: "ГФСЗ",
    unemploymentInsurance: "Страхование от безработицы",
    medicalInsurance: "Обязательное медстрахование",
    unionFee: "Профсоюзный взнос",
    yapFee: "Взнос партии «Новый Азербайджан»",
    totalDeduction: "Итого удержания",
    total: "Итого",
    noTaxUnder200: "До 200 AZN налог не взимается",
    noIncomeTaxUnder200: "До 200 AZN подоходный налог не взимается",
    taxSubPrivate: "До 200 AZN 0%, 200–2500 AZN 3%, 2500–8000 AZN 10%, свыше 8000 AZN 14%",
    taxSubState: "До 200 AZN 0%, 200–2500 AZN 14%, свыше 2500 AZN 25%",
    dsmfSubPrivate: "≤200 AZN: 3%, 200–8000 AZN: 6+(брутто−200)×10%, 8000+: 786+(брутто−8000)×10%",
    dsmfSubState: "3% от суммы брутто",
    medicalSubPrivate: "≤2500 AZN: брутто×2%, 2500+: 50+(брутто−2500)×0,5%",
    medicalSubState: "≤8000 AZN: брутто×2%, 8000+: 160+(брутто−8000)×0,5%",
    dsmfEmployerSubPrivate: "До 200 AZN 22%, свыше 200 AZN 15%",
    dsmfEmployerSubState: "22% от суммы брутто",
    employerSide: "Со стороны работодателя",
    totalEmployerCost: "Общие расходы работодателя",
    annualCalculation: "Годовой расчёт",
    annualNetIncome: "Годовой чистый доход",
    annualGross: "Годовой брутто",
    annualDeduction: "Годовые удержания",
    emptyStateSalary: "Введите зарплату, чтобы увидеть результат.",
    emptyStateGross: "Введите брутто зарплату, чтобы увидеть результат.",
    employerTabDesc: "Рассчитайте сумму, которую заплатит работодатель на основе БРУТТО зарплаты работника",
    employeeSalary: "Зарплата работника",
    mandatorySocialInsurance: "Обязательное государственное социальное страхование:",
    unemploymentInsuranceFee: "Страховой взнос от безработицы:",
    medicalInsuranceFee: "Обязательное медицинское страхование:",
    employerPayment: "Сумма к оплате работодателем",
    employerPaymentRules: (sector: string) => `Выплаты работодателя (${sector === "private" ? "Частный сектор" : "Государственный сектор"})`,
    salaryUpTo200: "Зарплата до 200 AZN:",
    insurableIncomeX22: "Ежемесячный страхуемый доход × 22%",
    salaryFrom200To8000: "Зарплата от 200 AZN до 8 000 AZN:",
    formula44Plus: "44 + (Ежемесячный страхуемый доход − 200) × 15%",
    salaryOver8000: "Зарплата свыше 8 000 AZN:",
    formula1214Plus: "1 214 + (Ежемесячный страхуемый доход − 8 000) × 11%",
    payrollFundX05: "Фонд оплаты труда × 0,5%",
    salaryUpTo2500Medical: "Зарплата до 2 500 AZN:",
    monthlySalaryX2: "Ежемесячная зарплата × 2%",
    salaryOver2500Medical: "Зарплата свыше 2 500 AZN:",
    formula50PlusMedical: "50 + (Ежемесячная зарплата − 2 500) × 0,5%",
    salaryUpTo8000Medical: "Зарплата до 8 000 AZN:",
    salaryOver8000Medical: "Зарплата свыше 8 000 AZN:",
    formula160PlusMedical: "160 + (Ежемесячная зарплата − 8 000) × 0,5%",
  },
};

export default function SalaryCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const exemptions = exemptionOptions[lang];

  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>("primary");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("gross-to-net");
  const [sector, setSector] = useState<Sector>("private");
  const [isUnionMember, setIsUnionMember] = useState(false);
  const [isYapMember, setIsYapMember] = useState(false);
  const [hasExemption, setHasExemption] = useState(false);
  const [exemptionAmount, setExemptionAmount] = useState(0);

  // Əlavə iş yeri üçün ayrıca state
  const [secAmount, setSecAmount] = useState("");
  const [secDirection, setSecDirection] = useState<Direction>("gross-to-net");
  const [secSector, setSecSector] = useState<Sector>("private");

  // İşəgötürən üçün state
  const [empAmount, setEmpAmount] = useState("");
  const [empSector, setEmpSector] = useState<Sector>("private");

  const activeExemption = hasExemption ? exemptionAmount : 0;

  const result = useMemo(() => {
    const value = parseFloat(amount);
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

  // Əlavə iş yeri hesablaması (güzəştsiz, həmkarlar/YAP yoxdur)
  const secResult = useMemo(() => {
    const value = parseFloat(secAmount);
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

  // İşəgötürən hesablaması
  const empResult = useMemo(() => {
    const gross = parseFloat(empAmount);
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

  // Sektor üzrə label-lər
  const taxSub = sector === "private" ? pt.taxSubPrivate : pt.taxSubState;
  const dsmfSub = sector === "private" ? pt.dsmfSubPrivate : pt.dsmfSubState;
  const medicalSub = sector === "private" ? pt.medicalSubPrivate : pt.medicalSubState;
  const dsmfEmployerSub = sector === "private" ? pt.dsmfEmployerSubPrivate : pt.dsmfEmployerSubState;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["overtime", "freelancer-tax", "rental-income-tax", "loan"]}
    >
      {/* İş yeri seçimi */}
      <div className="mb-6">
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setWorkplaceType("primary")}
            className={`flex-1 py-3 text-xs sm:text-sm font-medium transition-colors ${
              workplaceType === "primary"
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            {pt.tabPrimary}
          </button>
          <button
            onClick={() => setWorkplaceType("secondary")}
            className={`flex-1 py-3 text-xs sm:text-sm font-medium transition-colors ${
              workplaceType === "secondary"
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            {pt.tabSecondary}
          </button>
          <button
            onClick={() => setWorkplaceType("employer")}
            className={`flex-1 py-3 text-xs sm:text-sm font-medium transition-colors ${
              workplaceType === "employer"
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            {pt.tabEmployer}
          </button>
        </div>
      </div>

      {workplaceType === "primary" ? (
      <>
      {/* Sektor seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.jobCategory}</label>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value as Sector)}
          className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
        >
          <option value="private">{pt.sectorPrivate}</option>
          <option value="state">{pt.sectorState}</option>
        </select>
      </div>

      {/* Güzəştlər */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={hasExemption}
            onChange={(e) => {
              setHasExemption(e.target.checked);
              if (!e.target.checked) setExemptionAmount(0);
              else if (exemptionAmount === 0) setExemptionAmount(800);
            }}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-foreground">{pt.exemptions}</span>
        </label>
        {hasExemption && (
          <div className="space-y-2 ml-1">
            {exemptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  exemptionAmount === opt.value
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <input
                  type="radio"
                  name="exemption"
                  checked={exemptionAmount === opt.value}
                  onChange={() => setExemptionAmount(opt.value)}
                  className="w-4 h-4 mt-0.5 border-border text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {pt.exemptionLabel(opt.value)}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Direction Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setDirection("gross-to-net")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "gross-to-net"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.grossToNet}
        </button>
        <button
          onClick={() => setDirection("net-to-gross")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            direction === "net-to-gross"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.netToGross}
        </button>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          💵 {direction === "gross-to-net" ? pt.grossSalary : pt.netSalary} (AZN)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={direction === "gross-to-net" ? "2000" : "1500"}
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[400, 1000, 2000, 3000, 5000, 8100].map((v) => (
            <button key={v} onClick={() => setAmount(String(v))}
              className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors">
              {v}₼
            </button>
          ))}
        </div>
      </div>

      {/* Üzvlük seçimləri */}
      <div className="mb-8 space-y-3">
        <label className="block text-sm font-medium text-foreground mb-1">{pt.additionalDeductions}</label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/30 transition-all">
          <input
            type="checkbox"
            checked={isUnionMember}
            onChange={(e) => setIsUnionMember(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">{pt.unionMember}</p>
            <p className="text-[11px] text-muted">{pt.unionMemberDesc}</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/30 transition-all">
          <input
            type="checkbox"
            checked={isYapMember}
            onChange={(e) => setIsYapMember(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">{pt.yapMember}</p>
            <p className="text-[11px] text-muted">{pt.yapMemberDesc}</p>
          </div>
        </label>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netSalaryResult}</p>
              <p className="text-3xl font-bold">{formatMoney(result.net)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.grossSalaryResult}</p>
              <p className="text-3xl font-bold text-foreground">{formatMoney(result.gross)}</p>
              <p className="text-xs text-muted mt-1">{pt.perMonth}</p>
            </div>
          </div>

          {/* Sektor badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              sector === "private"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {sector === "private" ? pt.sectorPrivateBadge : pt.sectorStateBadge}
            </span>
          </div>

          {/* Detallı hesablama (qəbz) */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>👤</span>
                {pt.deductedFromEmployee}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {/* Gəlir vergisi */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.incomeTax}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.incomeTax)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{taxSub}</p>
                {result.taxSteps.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                    {result.incomeTax === 0 && <p className="text-xs text-green-600">{pt.noTaxUnder200}</p>}
                    {result.taxSteps.map((s, i) => (
                      <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                    ))}
                    {result.taxSteps.length > 1 && (
                      <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.total}: {formatMoney(result.incomeTax)} AZN</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="text-xs text-green-600">{pt.noIncomeTaxUnder200}</p>
                  </div>
                )}
              </div>

              {/* DSMF */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.dsmf}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dsmfEmployee)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{dsmfSub}</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {result.dsmfSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                  {result.dsmfSteps.length > 1 && (
                    <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.total}: {formatMoney(result.dsmfEmployee)} AZN</p>
                  )}
                </div>
              </div>

              {/* İşsizlik */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.unemploymentInsurance}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.unemploymentEmployee)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(result.unemploymentEmployee)} AZN</span></p>
                </div>
              </div>

              {/* İcbari tibbi sığorta */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.medicalInsurance}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.medicalInsurance)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{medicalSub}</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {result.medicalSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                  {result.medicalSteps.length > 1 && (
                    <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.total}: {formatMoney(result.medicalInsurance)} AZN</p>
                  )}
                </div>
              </div>

              {/* Həmkarlar İttifaqı */}
              {result.unionFee > 0 && (
                <div className="px-5 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{pt.unionFee}</span>
                    <span className="text-sm font-bold text-foreground">{formatMoney(result.unionFee)} AZN</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 2% = <span className="font-medium text-foreground">{formatMoney(result.unionFee)} AZN</span></p>
                  </div>
                </div>
              )}

              {/* YAP */}
              {result.yapFee > 0 && (
                <div className="px-5 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{pt.yapFee}</span>
                    <span className="text-sm font-bold text-foreground">{formatMoney(result.yapFee)} AZN</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 1% = <span className="font-medium text-foreground">{formatMoney(result.yapFee)} AZN</span></p>
                  </div>
                </div>
              )}

              {/* Cəmi */}
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.totalDeduction}</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>

          {/* Employer Costs */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🏢</span>
                {pt.employerSide}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.dsmf}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dsmfEmployer)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{dsmfEmployerSub}</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {result.dsmfEmployerSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                  {result.dsmfEmployerSteps.length > 1 && (
                    <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.total}: {formatMoney(result.dsmfEmployer)} AZN</p>
                  )}
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.unemploymentInsurance}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.unemploymentEmployer)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(result.gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(result.unemploymentEmployer)} AZN</span></p>
                </div>
              </div>
              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">{pt.totalEmployerCost}</span>
                <span className="text-sm font-bold text-amber-700">{formatMoney(result.totalEmployerCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              {pt.annualCalculation}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualNetIncome}</p>
                <p className="text-lg font-bold text-primary">{formatMoney(result.net * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualGross}</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(result.gross * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualDeduction}</p>
                <p className="text-lg font-bold text-red-600">{formatMoney(result.totalDeductions * 12)} AZN</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💵</span>
          <p>{pt.emptyStateSalary}</p>
        </div>
      )}
      </>
      ) : workplaceType === "secondary" ? (
      <>
      {/* ═══════════ ƏLAVƏ İŞ YERİ ═══════════ */}

      {/* Direction Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setSecDirection("gross-to-net")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            secDirection === "gross-to-net"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.grossToNet}
        </button>
        <button
          onClick={() => setSecDirection("net-to-gross")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            secDirection === "net-to-gross"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.netToGross}
        </button>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          💵 {secDirection === "gross-to-net" ? pt.grossSalary : pt.netSalary} (AZN)
        </label>
        <input
          type="number"
          value={secAmount}
          onChange={(e) => setSecAmount(e.target.value)}
          placeholder={secDirection === "gross-to-net" ? "3000" : "2500"}
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[400, 1000, 2000, 3000, 5000, 8100].map((v) => (
            <button key={v} onClick={() => setSecAmount(String(v))}
              className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors">
              {v}₼
            </button>
          ))}
        </div>
      </div>

      {/* Sektor */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.jobCategory}</label>
        <select
          value={secSector}
          onChange={(e) => setSecSector(e.target.value as Sector)}
          className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
        >
          <option value="private">{pt.sectorPrivate}</option>
          <option value="state">{pt.sectorState}</option>
        </select>
      </div>

      {/* Əlavə iş yeri nəticələri */}
      {secResult ? (
        <div className="space-y-6">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netSalaryResult}</p>
              <p className="text-3xl font-bold">{formatMoney(secResult.net)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.grossSalaryResult}</p>
              <p className="text-3xl font-bold text-foreground">{formatMoney(secResult.gross)}</p>
              <p className="text-xs text-muted mt-1">{pt.perMonth}</p>
            </div>
          </div>

          {/* Sektor badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              secSector === "private"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {secSector === "private" ? pt.sectorPrivateBadge : pt.sectorStateBadge}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              {pt.secondaryWorkplace}
            </span>
          </div>

          {/* Detallı hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>👤</span>
                {pt.deductedFromEmployee}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {/* Gəlir vergisi */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.incomeTax}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(secResult.incomeTax)} AZN</span>
                </div>
                {secResult.taxSteps.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                    {secResult.taxSteps.map((s, i) => (
                      <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                    ))}
                  </div>
                )}
              </div>

              {/* DSMF */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.dsmf}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(secResult.dsmfEmployee)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {secResult.dsmfSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                </div>
              </div>

              {/* İşsizlik */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.unemploymentInsurance}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(secResult.unemploymentEmployee)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(secResult.gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(secResult.unemploymentEmployee)} AZN</span></p>
                </div>
              </div>

              {/* Tibbi sığorta */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.medicalInsurance}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(secResult.medicalInsurance)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {secResult.medicalSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                </div>
              </div>

              {/* Cəmi */}
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.totalDeduction}</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(secResult.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>

          {/* Employer Costs */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🏢</span>
                {pt.employerSide}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.dsmf}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(secResult.dsmfEmployer)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {secResult.dsmfEmployerSteps.map((s, i) => (
                    <p key={i} className="text-xs text-muted">{s.label} = <span className="font-medium text-foreground">{formatMoney(s.result)} AZN</span></p>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.unemploymentInsurance}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(secResult.unemploymentEmployer)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(secResult.gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(secResult.unemploymentEmployer)} AZN</span></p>
                </div>
              </div>
              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm font-semibold text-amber-700">{pt.totalEmployerCost}</span>
                <span className="text-sm font-bold text-amber-700">{formatMoney(secResult.totalEmployerCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📅</span>
              {pt.annualCalculation}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualNetIncome}</p>
                <p className="text-lg font-bold text-primary">{formatMoney(secResult.net * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualGross}</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(secResult.gross * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualDeduction}</p>
                <p className="text-lg font-bold text-red-600">{formatMoney(secResult.totalDeductions * 12)} AZN</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💵</span>
          <p>{pt.emptyStateSalary}</p>
        </div>
      )}
      </>
      ) : (
      <>
      {/* ═══════════ İŞƏGÖTÜRƏN ÜÇÜN ═══════════ */}
      <p className="text-sm text-muted mb-6">{pt.employerTabDesc}</p>

      {/* Input + Sektor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">💵 {pt.grossMonthlySalary} (AZN)</label>
          <input
            type="number"
            value={empAmount}
            onChange={(e) => setEmpAmount(e.target.value)}
            placeholder="3000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[400, 1000, 2000, 3000, 5000, 8100].map((v) => (
              <button key={v} onClick={() => setEmpAmount(String(v))}
                className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors">
                {v}₼
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.jobCategory}</label>
          <select
            value={empSector}
            onChange={(e) => setEmpSector(e.target.value as Sector)}
            className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
          >
            <option value="private">{pt.sectorPrivate}</option>
            <option value="state">{pt.sectorState}</option>
          </select>
        </div>
      </div>

      {/* Nəticə */}
      {empResult ? (
        <div className="space-y-6">
          {/* İşçinin əməkhaqqı */}
          <div className="inline-block bg-green-400 text-white px-4 py-2 rounded-lg font-semibold text-sm">
            {pt.employeeSalary}: {formatMoney(empResult.gross)} ₼
          </div>

          {/* Detallar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">{pt.mandatorySocialInsurance}</span>
              <span className="text-sm font-bold text-foreground">{formatMoney(empResult.dsmf)} ₼</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">{pt.unemploymentInsuranceFee}</span>
              <span className="text-sm font-bold text-foreground">{formatMoney(empResult.unemployment)} ₼</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">{pt.medicalInsuranceFee}</span>
              <span className="text-sm font-bold text-foreground">{formatMoney(empResult.medical)} ₼</span>
            </div>
          </div>

          {/* Ümumi */}
          <div className="inline-block bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm">
            {pt.employerPayment}: {formatMoney(empResult.total)} ₼
          </div>

          {/* Hesablama qaydası */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mt-6">
            <h3 className="font-semibold text-foreground mb-4 bg-primary text-white px-4 py-2 rounded-lg text-sm inline-block">
              {pt.employerPaymentRules(empSector)}
            </h3>

            {empSector === "private" ? (
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{pt.mandatorySocialInsurance}</h4>
                  <div className="space-y-2">
                    <div className="bg-blue-100/50 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">{pt.salaryUpTo200}</p>
                      <p className="text-sm italic text-foreground">{pt.insurableIncomeX22}</p>
                    </div>
                    <div className="bg-blue-100/50 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">{pt.salaryFrom200To8000}</p>
                      <p className="text-sm italic text-foreground">{pt.formula44Plus}</p>
                    </div>
                    <div className="bg-blue-100/50 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">{pt.salaryOver8000}</p>
                      <p className="text-sm italic text-foreground">{pt.formula1214Plus}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{pt.unemploymentInsuranceFee}</h4>
                  <div className="bg-blue-100/50 rounded-lg p-3">
                    <p className="text-sm italic text-foreground">{pt.payrollFundX05}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{pt.medicalInsuranceFee}</h4>
                  <div className="space-y-2">
                    <div className="bg-blue-100/50 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">{pt.salaryUpTo2500Medical}</p>
                      <p className="text-sm italic text-foreground">{pt.monthlySalaryX2}</p>
                    </div>
                    <div className="bg-blue-100/50 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">{pt.salaryOver2500Medical}</p>
                      <p className="text-sm italic text-foreground">{pt.formula50PlusMedical}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{pt.mandatorySocialInsurance}</h4>
                  <div className="bg-blue-100/50 rounded-lg p-3">
                    <p className="text-sm italic text-foreground">{pt.insurableIncomeX22}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{pt.unemploymentInsuranceFee}</h4>
                  <div className="bg-blue-100/50 rounded-lg p-3">
                    <p className="text-sm italic text-foreground">{pt.payrollFundX05}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{pt.medicalInsuranceFee}</h4>
                  <div className="space-y-2">
                    <div className="bg-blue-100/50 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">{pt.salaryUpTo8000Medical}</p>
                      <p className="text-sm italic text-foreground">{pt.monthlySalaryX2}</p>
                    </div>
                    <div className="bg-blue-100/50 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">{pt.salaryOver8000Medical}</p>
                      <p className="text-sm italic text-foreground">{pt.formula160PlusMedical}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏢</span>
          <p>{pt.emptyStateGross}</p>
        </div>
      )}
      </>
      )}
    </CalculatorLayout>
  );
}
