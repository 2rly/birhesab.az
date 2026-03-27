"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// ============================================================
// PAŞA Həyat — Yaşam Kalkulyatoru
// Sığorta yığım modeli: Özəl sektor vs Neft-qaz sektoru
// 8000 AZN üzəri maaşlarda split hesablama
// ============================================================

type Sector = "private" | "oilgas";
type PaymentForm = "monthly" | "lump";
type Currency = "AZN" | "USD";

// ── Vergi hesablamaları ──

// Özəl sektor: DSMF İşəgötürən
function calcPrivateDSMFEmployer(gross: number): number {
  if (gross <= 200) return gross * 0.22;
  return 200 * 0.22 + (gross - 200) * 0.15;
}

// Özəl sektor: Gəlir vergisi
function calcPrivateIncomeTax(gross: number): number {
  const taxFree = 200;
  if (gross <= taxFree) return 0;
  const taxable = gross - taxFree;
  const b1 = 2300; // 2500 - 200
  const b2 = 7800; // 8000 - 200
  if (taxable <= b1) return taxable * 0.03;
  if (taxable <= b2) return b1 * 0.03 + (taxable - b1) * 0.10;
  return b1 * 0.03 + (b2 - b1) * 0.10 + (taxable - b2) * 0.14;
}

// Özəl sektor: DSMF işçi
function calcPrivateDSMFEmployee(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  return 200 * 0.03 + (gross - 200) * 0.10;
}

// Özəl sektor: İcbari tibbi sığorta
function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 2500 * 0.02 + (gross - 2500) * 0.005;
}

// Neft-qaz: Gəlir vergisi
function calcOilGasIncomeTax(gross: number): number {
  const taxFree = 200;
  if (gross <= taxFree) return 0;
  const taxable = gross - taxFree;
  const b1 = 2300;
  if (taxable <= b1) return taxable * 0.14;
  return b1 * 0.14 + (taxable - b1) * 0.25;
}

// Neft-qaz: İcbari tibbi sığorta
function calcOilGasMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 8000 * 0.02 + (gross - 8000) * 0.005;
}

// ── Split hesablama (8000+ maaşlar üçün sığorta bonusu) ──

interface BonusBreakdown {
  highTierAmount: number;
  normalTierAmount: number;
  highTierBonus: number;
  normalTierBonus: number;
  totalBonus: number;
}

function calculateBonus(gross: number, insurancePremium: number, sector: Sector): BonusBreakdown {
  if (gross <= 8000) {
    const rate = sector === "private" ? 0.11 : 0.11;
    const bonus = insurancePremium * rate;
    return {
      highTierAmount: 0,
      normalTierAmount: insurancePremium,
      highTierBonus: 0,
      normalTierBonus: bonus,
      totalBonus: bonus,
    };
  }

  const excessAmount = gross - 8000;
  const highTier = Math.min(insurancePremium, excessAmount);
  const normalTier = Math.max(0, insurancePremium - highTier);

  const highTierBonus = highTier * 0.30;
  const normalTierBonus = normalTier * 0.11;

  return {
    highTierAmount: highTier,
    normalTierAmount: normalTier,
    highTierBonus,
    normalTierBonus,
    totalBonus: highTierBonus + normalTierBonus,
  };
}

// ── Əsas hesablama ──

interface CalcResult {
  gross: number;
  net: number;
  insuranceGross: number;
  insuranceNet: number;
  bonus: BonusBreakdown;
  monthlyBase: number;
  monthlyWith15: number;
  totalSavings36: number;
  investmentReturn: number;
  totalWithInvestment: number;
  selfSavings: number;
  gainAmount: number;
  lumpSumPremium: number;
  employerDSMF: number;
  employerUnemployment: number;
  employerTotalCost: number;
  employerSavingsPerMonth: number;
  incomeTax: number;
  dsmfEmployee: number;
  medicalInsurance: number;
  unemploymentEmployee: number;
  totalDeductions: number;
  duration: number;
}

function calculate(
  gross: number,
  insuranceGross: number,
  sector: Sector,
  duration: number,
  unionPercent: number,
): CalcResult | null {
  if (gross <= 0 || insuranceGross <= 0) return null;

  let incomeTax: number;
  let dsmfEmployee: number;
  let medicalInsurance: number;
  let dsmfEmployer: number;
  const unemploymentEmployee = gross * 0.005;
  const unemploymentEmployer = gross * 0.005;

  if (sector === "private") {
    incomeTax = calcPrivateIncomeTax(gross);
    dsmfEmployee = calcPrivateDSMFEmployee(gross);
    medicalInsurance = calcPrivateMedical(gross);
    dsmfEmployer = calcPrivateDSMFEmployer(gross);
  } else {
    incomeTax = calcOilGasIncomeTax(gross);
    dsmfEmployee = gross * 0.03;
    medicalInsurance = calcOilGasMedical(gross);
    dsmfEmployer = gross * 0.22;
  }

  const unionFee = gross * (unionPercent / 100);
  const totalDeductions = incomeTax + dsmfEmployee + unemploymentEmployee + medicalInsurance + unionFee;
  const net = gross - totalDeductions;

  const insuranceNet = insuranceGross * 0.85;

  const bonus = calculateBonus(gross, insuranceGross, sector);

  const monthlyBase = insuranceGross + bonus.totalBonus;
  const monthlyWith15 = monthlyBase * 1.15;
  const totalSavings36 = monthlyWith15 * duration;
  const investmentReturn = totalSavings36 * 0.03;
  const totalWithInvestment = totalSavings36 + investmentReturn;
  const selfSavings = insuranceGross * duration;
  const gainAmount = totalWithInvestment - selfSavings;

  const lumpSumPremium = insuranceGross * duration * 0.80;

  const employerTotalCost = gross + dsmfEmployer + unemploymentEmployer;
  const employerSavingsPerMonth = bonus.totalBonus;

  return {
    gross,
    net: Math.max(0, net),
    insuranceGross,
    insuranceNet,
    bonus,
    monthlyBase,
    monthlyWith15,
    totalSavings36,
    investmentReturn,
    totalWithInvestment,
    selfSavings,
    gainAmount,
    lumpSumPremium,
    employerDSMF: dsmfEmployer,
    employerUnemployment: unemploymentEmployer,
    employerTotalCost,
    employerSavingsPerMonth,
    incomeTax,
    dsmfEmployee,
    medicalInsurance,
    unemploymentEmployee,
    totalDeductions,
    duration,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pageTranslations = {
  az: {
    title: "Yaşam sığortası hesablayıcısı",
    description: "PAŞA Həyat yığım modeli — sığorta ödənişi, vergi bonusu və investisiya gəlirini hesablayın.",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "Yaşam sığortası yığım modeli necə işləyir?",
    formulaContent: `Sığorta ödənişiniz vergi güzəştinə malikdir. İşəgötürən tərəfindən bonus əlavə olunur.

8000 AZN-dən yuxarı maaşlarda sığorta ödənişi iki hissəyə bölünür:
• Limit üstü hissə (Gross − 8000): 15% DSMF + 14% GV + 1% digər = 30% bonus
• Normal hissə (qalan): 11% bonus

Yığım zənciri:
1. Aylıq Baza = Sığorta ödənişi + Vergi bonusu
2. 15% əlavə bonus: Baza × 1.15
3. Müddət ərzində cəm yığım
4. +3% investisiya gəliri

Nümunə (8500 Gross / 600 Sığorta):
• 100 AZN (8000-dən yuxarı) → 30% = 30 AZN bonus
• 500 AZN (8000-ə qədər) → 11% = 55 AZN bonus
• Cəmi bonus: 85 AZN
• Aylıq baza: 685 AZN × 1.15 = 787.75 AZN`,
    sector: "Sektor",
    privateSector: "Özəl sektor",
    privateSectorDesc: "Qeyri neft-qaz, 200₼-dək 0%, 2500₼-dək 3%",
    oilGasSector: "Neft-qaz sektoru",
    oilGasSectorDesc: "14% / 25% vergi, DSMF 3%",
    tradeUnion: "Həmkarlar ittifaqı",
    tradeUnionHint: "Həmkarlar İttifaqı əgər sizin şirkətdə mövcud deyilsə, zəhmət olmasa 0% olaraq davam edin",
    salaryNet: "Əmək haqqı (Net)",
    salaryGross: "Əmək haqqı (Gross)",
    contractCurrency: "Müqavilə valyutası",
    insurancePremiumNet: "Sığorta haqqı (Net)",
    insurancePremiumNetPlaceholder: "Net sığorta haqqı",
    insurancePremiumGross: "Sığorta haqqı (Gross)",
    insurancePremiumGrossPlaceholder: "Gross sığorta haqqını daxil edin",
    paymentForm: "Sığorta haqqının ödəniş forması",
    monthlyPayment: "Aylıq ödəniş",
    lumpPayment: "Birdəfəlik ödəniş",
    birthDate: "Doğum tarixi",
    duration: "Müddət (Ay)",
    durationHint: "Minimum müddət 36, maksimum müddət 120 olmalıdır.",
    calculate: "Hesabla",
    result: "Nəticə",
    withUsSave: "Bizimlə yığsanız",
    selfSave: "Özünüz yığsanız",
    gainAmount: "Qazanc məbləği",
    lumpSumPremium: "Birdəfəlik sığorta haqqı",
    joinNow: "İndi qoşulun",
    splitCalcTitle: "8000 AZN üzəri — Split hesablama",
    highTierPart: "Limit üstü hissə (Gross − 8000)",
    normalTierPart: "Normal hissə (8000-ə qədər)",
    totalBonus: "Cəmi bonus",
    savingsChain: "Yığım zənciri",
    monthlyInsurance: "Aylıq sığorta ödənişi",
    taxBonusMonthly: "Vergi bonusu (aylıq)",
    monthlyBase: "Aylıq baza (sığorta + bonus)",
    with15Bonus: "15% əlavə bonus ilə",
    totalSavings: "aylıq cəm yığım",
    investmentReturn: "+3% investisiya gəliri",
    total: "Cəmi",
    employeeGain: "İşçi Qazancı",
    selfSaveLabel: "Özünüz yığsanız",
    withUsSaveLabel: "Bizimlə yığsanız",
    yourGain: "Qazancınız",
    employerSavings: "İşəgötürən Qənaəti",
    dsmfEmployer: "DSMF (işəgötürən)",
    unemploymentInsurance: "İşsizlik sığortası",
    taxBonusSaving: "Vergi bonusu (qənaət)",
    totalCost: "Ümumi xərc",
    taxDetails: "Vergi detalları",
    incomeTax: "Gəlir vergisi",
    dsmfEmployee: "DSMF (işçi)",
    unemploymentIns: "İşsizlik sığortası",
    medicalInsurance: "İcbari tibbi sığorta",
    totalDeduction: "Cəmi tutulma",
    emptyStateText: "Nəticəni görmək üçün əmək haqqı və sığorta haqqını daxil edin.",
  },
  en: {
    title: "Life Insurance Calculator",
    description: "PASHA Life savings model — calculate insurance premium, tax bonus, and investment income.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How does the life insurance savings model work?",
    formulaContent: `Your insurance premium is tax-deductible. A bonus is added by the employer.

For salaries above 8000 AZN, the insurance premium is split into two parts:
• Excess portion (Gross − 8000): 15% DSMF + 14% IT + 1% other = 30% bonus
• Normal portion (remaining): 11% bonus

Savings chain:
1. Monthly Base = Insurance premium + Tax bonus
2. 15% additional bonus: Base × 1.15
3. Total savings over the period
4. +3% investment return

Example (8500 Gross / 600 Insurance):
• 100 AZN (above 8000) → 30% = 30 AZN bonus
• 500 AZN (up to 8000) → 11% = 55 AZN bonus
• Total bonus: 85 AZN
• Monthly base: 685 AZN × 1.15 = 787.75 AZN`,
    sector: "Sector",
    privateSector: "Private sector",
    privateSectorDesc: "Non oil-gas, up to 200₼ 0%, up to 2500₼ 3%",
    oilGasSector: "Oil & gas sector",
    oilGasSectorDesc: "14% / 25% tax, DSMF 3%",
    tradeUnion: "Trade union",
    tradeUnionHint: "If there is no trade union at your company, please continue with 0%",
    salaryNet: "Salary (Net)",
    salaryGross: "Salary (Gross)",
    contractCurrency: "Contract currency",
    insurancePremiumNet: "Insurance premium (Net)",
    insurancePremiumNetPlaceholder: "Net insurance premium",
    insurancePremiumGross: "Insurance premium (Gross)",
    insurancePremiumGrossPlaceholder: "Enter gross insurance premium",
    paymentForm: "Insurance payment form",
    monthlyPayment: "Monthly payment",
    lumpPayment: "Lump sum payment",
    birthDate: "Date of birth",
    duration: "Duration (Months)",
    durationHint: "Minimum duration 36, maximum duration 120.",
    calculate: "Calculate",
    result: "Result",
    withUsSave: "Save with us",
    selfSave: "Save yourself",
    gainAmount: "Gain amount",
    lumpSumPremium: "Lump sum premium",
    joinNow: "Join now",
    splitCalcTitle: "Above 8000 AZN — Split calculation",
    highTierPart: "Excess portion (Gross − 8000)",
    normalTierPart: "Normal portion (up to 8000)",
    totalBonus: "Total bonus",
    savingsChain: "Savings chain",
    monthlyInsurance: "Monthly insurance premium",
    taxBonusMonthly: "Tax bonus (monthly)",
    monthlyBase: "Monthly base (insurance + bonus)",
    with15Bonus: "With 15% additional bonus",
    totalSavings: "month total savings",
    investmentReturn: "+3% investment return",
    total: "Total",
    employeeGain: "Employee Gain",
    selfSaveLabel: "Save yourself",
    withUsSaveLabel: "Save with us",
    yourGain: "Your gain",
    employerSavings: "Employer Savings",
    dsmfEmployer: "DSMF (employer)",
    unemploymentInsurance: "Unemployment insurance",
    taxBonusSaving: "Tax bonus (savings)",
    totalCost: "Total cost",
    taxDetails: "Tax details",
    incomeTax: "Income tax",
    dsmfEmployee: "DSMF (employee)",
    unemploymentIns: "Unemployment insurance",
    medicalInsurance: "Compulsory medical insurance",
    totalDeduction: "Total deduction",
    emptyStateText: "Enter salary and insurance premium to see the result.",
  },
  ru: {
    title: "Калькулятор страхования жизни",
    description: "Модель накоплений PASHA Life — рассчитайте страховую премию, налоговый бонус и инвестиционный доход.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как работает модель накоплений по страхованию жизни?",
    formulaContent: `Ваш страховой взнос имеет налоговую льготу. Бонус добавляется работодателем.

Для зарплат выше 8000 AZN страховой взнос делится на две части:
• Сверхлимитная часть (Gross − 8000): 15% ГФСЗ + 14% ПН + 1% прочее = 30% бонус
• Обычная часть (остаток): 11% бонус

Цепочка накоплений:
1. Ежемесячная база = Страховой взнос + Налоговый бонус
2. 15% дополнительный бонус: База × 1.15
3. Общие накопления за период
4. +3% инвестиционный доход

Пример (8500 Gross / 600 Страховка):
• 100 AZN (выше 8000) → 30% = 30 AZN бонус
• 500 AZN (до 8000) → 11% = 55 AZN бонус
• Общий бонус: 85 AZN
• Ежемесячная база: 685 AZN × 1.15 = 787.75 AZN`,
    sector: "Сектор",
    privateSector: "Частный сектор",
    privateSectorDesc: "Не нефтегазовый, до 200₼ 0%, до 2500₼ 3%",
    oilGasSector: "Нефтегазовый сектор",
    oilGasSectorDesc: "14% / 25% налог, ГФСЗ 3%",
    tradeUnion: "Профсоюз",
    tradeUnionHint: "Если в вашей компании нет профсоюза, пожалуйста, оставьте 0%",
    salaryNet: "Зарплата (Нетто)",
    salaryGross: "Зарплата (Брутто)",
    contractCurrency: "Валюта договора",
    insurancePremiumNet: "Страховой взнос (Нетто)",
    insurancePremiumNetPlaceholder: "Нетто страховой взнос",
    insurancePremiumGross: "Страховой взнос (Брутто)",
    insurancePremiumGrossPlaceholder: "Введите брутто страховой взнос",
    paymentForm: "Форма оплаты страхового взноса",
    monthlyPayment: "Ежемесячная оплата",
    lumpPayment: "Единовременная оплата",
    birthDate: "Дата рождения",
    duration: "Срок (месяцев)",
    durationHint: "Минимальный срок 36, максимальный срок 120.",
    calculate: "Рассчитать",
    result: "Результат",
    withUsSave: "Накопите с нами",
    selfSave: "Накопите сами",
    gainAmount: "Сумма выгоды",
    lumpSumPremium: "Единовременный взнос",
    joinNow: "Присоединиться",
    splitCalcTitle: "Свыше 8000 AZN — Раздельный расчёт",
    highTierPart: "Сверхлимитная часть (Gross − 8000)",
    normalTierPart: "Обычная часть (до 8000)",
    totalBonus: "Общий бонус",
    savingsChain: "Цепочка накоплений",
    monthlyInsurance: "Ежемесячный страховой взнос",
    taxBonusMonthly: "Налоговый бонус (ежемесячно)",
    monthlyBase: "Ежемесячная база (страховка + бонус)",
    with15Bonus: "С 15% дополнительным бонусом",
    totalSavings: "мес. общие накопления",
    investmentReturn: "+3% инвестиционный доход",
    total: "Итого",
    employeeGain: "Выгода работника",
    selfSaveLabel: "Накопите сами",
    withUsSaveLabel: "Накопите с нами",
    yourGain: "Ваша выгода",
    employerSavings: "Экономия работодателя",
    dsmfEmployer: "ГФСЗ (работодатель)",
    unemploymentInsurance: "Страхование от безработицы",
    taxBonusSaving: "Налоговый бонус (экономия)",
    totalCost: "Общие расходы",
    taxDetails: "Налоговые детали",
    incomeTax: "Подоходный налог",
    dsmfEmployee: "ГФСЗ (работник)",
    unemploymentIns: "Страхование от безработицы",
    medicalInsurance: "Обязательное медицинское страхование",
    totalDeduction: "Общие удержания",
    emptyStateText: "Введите зарплату и страховой взнос, чтобы увидеть результат.",
  },
};

export default function YasamSigortasiCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [sector, setSector] = useState<Sector>("private");
  const [grossStr, setGrossStr] = useState("4000");
  const [unionPercent, setUnionPercent] = useState("0");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [insuranceGrossStr, setInsuranceGrossStr] = useState("");
  const [paymentForm, setPaymentForm] = useState<PaymentForm>("lump");
  const [birthDate, setBirthDate] = useState("1998-03-19");
  const [duration, setDuration] = useState("36");
  const [result, setResult] = useState<CalcResult | null>(null);

  // Gross-dan Net hesabla (real-time)
  const netFromGross = useMemo(() => {
    const gross = parseFloat(grossStr) || 0;
    if (gross <= 0) return 0;
    const union = parseFloat(unionPercent) || 0;
    let incomeTax: number, dsmfEmp: number, medical: number;
    const unemployment = gross * 0.005;
    if (sector === "private") {
      incomeTax = calcPrivateIncomeTax(gross);
      dsmfEmp = calcPrivateDSMFEmployee(gross);
      medical = calcPrivateMedical(gross);
    } else {
      incomeTax = calcOilGasIncomeTax(gross);
      dsmfEmp = gross * 0.03;
      medical = calcOilGasMedical(gross);
    }
    const unionFee = gross * (union / 100);
    return Math.max(0, gross - incomeTax - dsmfEmp - unemployment - medical - unionFee);
  }, [grossStr, sector, unionPercent]);

  // Sığorta net (real-time)
  const insuranceNetDisplay = useMemo(() => {
    const v = parseFloat(insuranceGrossStr) || 0;
    return v > 0 ? v * 0.85 : 0;
  }, [insuranceGrossStr]);

  function handleCalculate() {
    const gross = parseFloat(grossStr) || 0;
    const insuranceGross = parseFloat(insuranceGrossStr) || 0;
    const dur = parseInt(duration) || 36;
    const union = parseFloat(unionPercent) || 0;
    setResult(calculate(gross, insuranceGross, sector, dur, union));
  }

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
      relatedIds={["salary", "deposit", "loan"]}
    >
      {/* ── Sektor seçimi ── */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.sector}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setSector("private")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "private"
                ? "border-[#002d4b] bg-[#002d4b]/5 ring-2 ring-[#002d4b]"
                : "border-border bg-white hover:border-[#002d4b]/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.privateSector}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.privateSectorDesc}</p>
          </button>
          <button
            onClick={() => setSector("oilgas")}
            className={`p-3 rounded-xl border text-left transition-all ${
              sector === "oilgas"
                ? "border-[#002d4b] bg-[#002d4b]/5 ring-2 ring-[#002d4b]"
                : "border-border bg-white hover:border-[#002d4b]/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.oilGasSector}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.oilGasSectorDesc}</p>
          </button>
        </div>
      </div>

      {/* ── Həmkarlar ittifaqı ── */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.tradeUnion}</label>
        <div className="relative">
          <input
            type="number"
            value={unionPercent}
            onChange={(e) => setUnionPercent(e.target.value)}
            min="0"
            max="100"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#002d4b] focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">%</span>
        </div>
        <p className="text-xs text-muted mt-1">{pt.tradeUnionHint}</p>
      </div>

      {/* ── Əmək haqqı ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.salaryNet}</label>
          <div className="relative">
            <input
              type="text"
              value={netFromGross > 0 ? fmt(netFromGross) : "0.00"}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-foreground font-medium"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">AZN</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.salaryGross}</label>
          <div className="relative">
            <input
              type="number"
              value={grossStr}
              onChange={(e) => setGrossStr(e.target.value)}
              placeholder="4000"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#002d4b] focus:border-transparent"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">AZN</span>
          </div>
        </div>
      </div>

      {/* ── Müqavilə valyutası ── */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.contractCurrency}</label>
        <div className="flex gap-3">
          {(["AZN", "USD"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                currency === c
                  ? "border-[#002d4b] bg-[#002d4b]/5 ring-2 ring-[#002d4b] text-[#002d4b]"
                  : "border-border bg-white text-muted hover:border-[#002d4b]/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sığorta haqqı ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.insurancePremiumNet}</label>
          <input
            type="text"
            value={insuranceNetDisplay > 0 ? fmt(insuranceNetDisplay) : ""}
            readOnly
            placeholder={pt.insurancePremiumNetPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-foreground placeholder:text-muted font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.insurancePremiumGross}</label>
          <input
            type="number"
            value={insuranceGrossStr}
            onChange={(e) => setInsuranceGrossStr(e.target.value)}
            placeholder={pt.insurancePremiumGrossPlaceholder}
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#002d4b] focus:border-transparent"
          />
        </div>
      </div>

      {/* ── Sığorta haqqının ödəniş forması ── */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.paymentForm}</label>
        <div className="flex gap-3">
          <button
            onClick={() => setPaymentForm("monthly")}
            className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
              paymentForm === "monthly"
                ? "border-[#002d4b] bg-[#002d4b]/5 ring-2 ring-[#002d4b] text-[#002d4b]"
                : "border-border bg-white text-muted hover:border-[#002d4b]/30"
            }`}
          >
            {pt.monthlyPayment}
          </button>
          <button
            onClick={() => setPaymentForm("lump")}
            className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
              paymentForm === "lump"
                ? "border-[#002d4b] bg-[#002d4b]/5 ring-2 ring-[#002d4b] text-[#002d4b]"
                : "border-border bg-white text-muted hover:border-[#002d4b]/30"
            }`}
          >
            {pt.lumpPayment}
          </button>
        </div>
      </div>

      {/* ── Doğum tarixi & Müddət ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.birthDate}</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#002d4b] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.duration}</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="36"
            max="120"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#002d4b] focus:border-transparent"
          />
          <p className="text-xs text-muted mt-1">{pt.durationHint}</p>
        </div>
      </div>

      {/* ── Hesabla düyməsi ── */}
      <button
        onClick={handleCalculate}
        className="w-full sm:w-auto px-12 py-3.5 rounded-xl bg-[#002d4b] hover:bg-[#001a2e] text-white font-semibold text-base transition-colors mb-8"
      >
        {pt.calculate}
      </button>

      {/* ── Nəticə ── */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas nəticə kartı */}
          <div className="bg-gradient-to-br from-[#002d4b] to-[#001a2e] rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">{pt.result}</h3>

            <p className="text-sm text-blue-200 mb-1">{pt.withUsSave}</p>
            <p className="text-3xl font-bold mb-4">{fmt(result.totalWithInvestment)} AZN</p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-200">{pt.selfSave}</span>
                <span className="text-sm font-bold text-[#ff5a00]">{fmt(result.selfSavings)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-200">{pt.gainAmount}</span>
                <span className="text-sm font-bold text-[#ff5a00]">{fmt(result.gainAmount)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-200">{pt.lumpSumPremium}</span>
                <span className="text-sm font-bold text-[#ff5a00]">{fmt(result.lumpSumPremium)} AZN</span>
              </div>
            </div>

            <a
              href="#"
              className="block mt-6 bg-emerald-400 hover:bg-emerald-500 text-white text-center py-3 rounded-xl font-semibold transition-colors"
            >
              {pt.joinNow}
            </a>
          </div>

          {/* 8000+ split göstər */}
          {result.bonus.highTierAmount > 0 && (
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-[#ff5a00]">&#9888;</span>
                {pt.splitCalcTitle}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">{pt.highTierPart}</span>
                  <span className="font-bold text-foreground">{fmt(result.bonus.highTierAmount)} AZN</span>
                </div>
                <p className="text-xs text-muted ml-4">15% DSMF + 14% GV + 1% = 30% bonus = <span className="font-medium text-foreground">{fmt(result.bonus.highTierBonus)} AZN</span></p>
                <div className="flex justify-between">
                  <span className="text-muted">{pt.normalTierPart}</span>
                  <span className="font-bold text-foreground">{fmt(result.bonus.normalTierAmount)} AZN</span>
                </div>
                <p className="text-xs text-muted ml-4">11% bonus = <span className="font-medium text-foreground">{fmt(result.bonus.normalTierBonus)} AZN</span></p>
                <div className="flex justify-between border-t border-orange-200 pt-2">
                  <span className="font-semibold text-foreground">{pt.totalBonus}</span>
                  <span className="font-bold text-[#ff5a00]">{fmt(result.bonus.totalBonus)} AZN</span>
                </div>
              </div>
            </div>
          )}

          {/* Yığım zənciri */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-[#002d4b] px-5 py-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span>&#128200;</span>
                {pt.savingsChain}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.monthlyInsurance}</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.insuranceGross)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.taxBonusMonthly}</span>
                <span className="text-sm font-bold text-[#ff5a00]">+{fmt(result.bonus.totalBonus)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.monthlyBase}</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.monthlyBase)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.with15Bonus}</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.monthlyWith15)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{result.duration} {pt.totalSavings}</span>
                <span className="text-sm font-bold text-foreground">{fmt(result.totalSavings36)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.investmentReturn}</span>
                <span className="text-sm font-bold text-emerald-600">+{fmt(result.investmentReturn)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-[#002d4b]/5">
                <span className="text-sm font-semibold text-[#002d4b]">{pt.total}</span>
                <span className="text-sm font-bold text-[#002d4b]">{fmt(result.totalWithInvestment)} AZN</span>
              </div>
            </div>
          </div>

          {/* İşçi qazancı & İşəgötürən qənaəti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* İşçi Qazancı */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-emerald-600 px-5 py-3">
                <h3 className="font-semibold text-white text-sm">&#128104; {pt.employeeGain}</h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-muted">{pt.selfSaveLabel}</span>
                  <span className="text-xs font-bold">{fmt(result.selfSavings)} AZN</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-muted">{pt.withUsSaveLabel}</span>
                  <span className="text-xs font-bold">{fmt(result.totalWithInvestment)} AZN</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 bg-emerald-50">
                  <span className="text-xs font-semibold text-emerald-700">{pt.yourGain}</span>
                  <span className="text-xs font-bold text-emerald-700">{fmt(result.gainAmount)} AZN</span>
                </div>
              </div>
            </div>

            {/* İşəgötürən Qənaəti */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-[#002d4b] px-5 py-3">
                <h3 className="font-semibold text-white text-sm">&#127970; {pt.employerSavings}</h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-muted">{pt.dsmfEmployer}</span>
                  <span className="text-xs font-bold">{fmt(result.employerDSMF)} AZN/{lang === "ru" ? "мес." : lang === "en" ? "mo" : "ay"}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-muted">{pt.unemploymentInsurance}</span>
                  <span className="text-xs font-bold">{fmt(result.employerUnemployment)} AZN/{lang === "ru" ? "мес." : lang === "en" ? "mo" : "ay"}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-muted">{pt.taxBonusSaving}</span>
                  <span className="text-xs font-bold text-[#ff5a00]">{fmt(result.employerSavingsPerMonth)} AZN/{lang === "ru" ? "мес." : lang === "en" ? "mo" : "ay"}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 bg-[#002d4b]/5">
                  <span className="text-xs font-semibold text-[#002d4b]">{pt.totalCost}</span>
                  <span className="text-xs font-bold text-[#002d4b]">{fmt(result.employerTotalCost)} AZN/{lang === "ru" ? "мес." : lang === "en" ? "mo" : "ay"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vergi detalları */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <span>&#128203;</span>
                {pt.taxDetails}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-2.5">
                <span className="text-sm text-muted">{pt.incomeTax}</span>
                <span className="text-sm font-bold">{fmt(result.incomeTax)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-2.5">
                <span className="text-sm text-muted">{pt.dsmfEmployee}</span>
                <span className="text-sm font-bold">{fmt(result.dsmfEmployee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-2.5">
                <span className="text-sm text-muted">{pt.unemploymentIns}</span>
                <span className="text-sm font-bold">{fmt(result.unemploymentEmployee)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-2.5">
                <span className="text-sm text-muted">{pt.medicalInsurance}</span>
                <span className="text-sm font-bold">{fmt(result.medicalInsurance)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-2.5 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.totalDeduction}</span>
                <span className="text-sm font-bold text-red-700">{fmt(result.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">&#128737;</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
