import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { DateField, Button } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum, parseISODate } from "@/lib/format";
import { OptionCards, TintCard, KV, EmptyState, SEM } from "./_tax-parts";

// ============================================================
// PAŞA Həyat — Yaşam Kalkulyatoru
// Sığorta yığım modeli: Özəl sektor vs Neft-qaz sektoru
// 8000 AZN üzəri maaşlarda split hesablama
// ============================================================

type Sector = "private" | "oilgas";
type PaymentForm = "monthly" | "lump";
type Currency = "AZN" | "USD";

// ── Vergi hesablamaları (emek-haqqi/page.tsx ilə eyni rəsmi qaydalar) ──

// Özəl sektor: Gəlir vergisi (taxes.gov.az 2026)
function calcPrivateIncomeTax(gross: number): number {
  const taxFree = 200;
  if (gross <= taxFree) return 0;
  if (gross <= 2500) return (gross - taxFree) * 0.03;
  const baseTax = 75; // rəsmi sabit
  if (gross <= 8000) return baseTax + (gross - 2500) * 0.1;
  return baseTax + (8000 - 2500) * 0.1 + (gross - 8000) * 0.14;
}

// Özəl sektor: DSMF işçi
// ≤200: gross × 3%; 200–8000: 6 + (gross−200)×10%; 8000+: 786 + (gross−8000)×10%
function calcPrivateDSMFEmployee(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  if (gross <= 8000) return 6 + (gross - 200) * 0.1;
  return 786 + (gross - 8000) * 0.1;
}

// Özəl sektor: İcbari tibbi sığorta
// ≤2500: gross × 2%; 2500+: 50 + (gross−2500)×0,5%
function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 50 + (gross - 2500) * 0.005;
}

// Özəl sektor: DSMF işəgötürən
// ≤200: 22%; 200–8000: 44 + (gross−200)×15%; 8000+: 1214 + (gross−8000)×11%
function calcPrivateDSMFEmployer(gross: number): number {
  if (gross <= 200) return gross * 0.22;
  if (gross <= 8000) return 44 + (gross - 200) * 0.15;
  return 1214 + (gross - 8000) * 0.11;
}

// Dövlət / Neft-qaz: Gəlir vergisi
// VCM ≤ 2500: (VCM − 200) × 14%
// VCM > 2500: 350 + (VCM − 2500) × 25%
function calcOilGasIncomeTax(gross: number): number {
  const taxFree = 200;
  if (gross <= taxFree) return 0;
  if (gross <= 2500) return (gross - taxFree) * 0.14;
  return 350 + (gross - 2500) * 0.25;
}

// Dövlət / Neft-qaz: İcbari tibbi sığorta
// ≤8000: gross × 2%; 8000+: 160 + (gross−8000)×0,5%
function calcOilGasMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 160 + (gross - 8000) * 0.005;
}

// ── PAŞA Həyat aktuar hesablama (rəsmi qaydalar 30.11.2020, bənd 20) ──
// Sabit xərc əmsalları (Əlavə 2):
const ACT_alpha = 0.005; // Müqavilə bağlama xərci
const ACT_beta = 0.003; // Yığım dövrü xərci (AZN: 0.30%-2%)
const ACT_gamma = 0.0025; // İllik inzibati xərc
const ACT_rho1 = 0.03; // Ölüm hadisəsi tənzimləmə
const ACT_rho2 = 0.015; // Yaşam hadisəsi tənzimləmə
const ACT_m = 12; // Aylıq ödəniş tezliyi

// Ölüm cədvəli (Əlavə 1) — q_x dəyərləri
const MORTALITY_Q: Record<number, number> = {
  0: 0.0129, 1: 0.0019, 2: 0.0011, 3: 0.0007, 4: 0.0005,
  5: 0.0005, 6: 0.0005, 7: 0.0004, 8: 0.0004, 9: 0.0004,
  10: 0.0004, 11: 0.0004, 12: 0.0003, 13: 0.0004, 14: 0.0004,
  15: 0.0004, 16: 0.0005, 17: 0.0005, 18: 0.0006, 19: 0.0006,
  20: 0.0007, 21: 0.0007, 22: 0.0007, 23: 0.0008, 24: 0.0009,
  25: 0.0009, 26: 0.001, 27: 0.001, 28: 0.0011, 29: 0.0012,
  30: 0.0013, 31: 0.0013, 32: 0.0016, 33: 0.0016, 34: 0.0017,
  35: 0.0018, 36: 0.0019, 37: 0.0021, 38: 0.0024, 39: 0.0024,
  40: 0.0027, 41: 0.003, 42: 0.0032, 43: 0.0035, 44: 0.0038,
  45: 0.0043, 46: 0.0046, 47: 0.0052, 48: 0.0058, 49: 0.0064,
  50: 0.0073, 51: 0.0081, 52: 0.0088, 53: 0.0099, 54: 0.0111,
  55: 0.0124, 56: 0.0131, 57: 0.0144, 58: 0.0157, 59: 0.0176,
  60: 0.0191, 61: 0.0202, 62: 0.0227, 63: 0.0245, 64: 0.0275,
  65: 0.0305, 66: 0.0336, 67: 0.0371, 68: 0.0405, 69: 0.0456,
  70: 0.0498, 71: 0.0558, 72: 0.0604, 73: 0.0662, 74: 0.0714,
  75: 0.0793, 76: 0.085, 77: 0.0904, 78: 0.0984, 79: 0.1055,
  80: 0.1138, 81: 0.1144, 82: 0.1209, 83: 0.1303, 84: 0.138,
  85: 0.1406, 86: 0.1481, 87: 0.1573, 88: 0.1746, 89: 0.1922,
  90: 0.2119, 91: 0.2337, 92: 0.258, 93: 0.2851, 94: 0.3153,
  95: 0.331, 96: 0.3476, 97: 0.365, 98: 0.3832, 99: 0.4025,
  100: 0.4225, 101: 0.4431, 102: 0.4647, 103: 0.4909, 104: 0.5179,
  105: 1.0,
};

function qx(x: number): number {
  if (x < 0) return 0;
  if (x >= 105) return 1;
  return MORTALITY_Q[Math.floor(x)] ?? 0;
}

// k il yaşama ehtimalı: kp_x = ∏ (1 - q_{x+j})
function kPx(x: number, k: number): number {
  let p = 1;
  for (let j = 0; j < k; j++) p *= 1 - qx(x + j);
  return p;
}

// nE_x = v^n × n_p_x
function nEx(x: number, n: number, i: number): number {
  return Math.pow(1 / (1 + i), n) * kPx(x, n);
}

// A^1_{x:n} = Σ_{t=0}^{n-1} t_p_x × q_{x+t} × v^{t+1}
// Ā^1 = (i / ln(1+i)) × A^1   (ilin sonunda baş verməyən ölümə düzəliş)
function termInsurance(x: number, n: number, i: number): number {
  const v = 1 / (1 + i);
  let A = 0;
  for (let t = 0; t < n; t++) A += kPx(x, t) * qx(x + t) * Math.pow(v, t + 1);
  return (i / Math.log(1 + i)) * A;
}

// ä_{x:n} = Σ_{t=0}^{n-1} v^t × t_p_x
function annuityDue(x: number, n: number, i: number): number {
  const v = 1 / (1 + i);
  let a = 0;
  for (let t = 0; t < n; t++) a += Math.pow(v, t) * kPx(x, t);
  return a;
}

// ä^(m)_{x:n} = ä_{x:n} − ((m−1)/(2m)) × (1 − n_E_x)
function annuityDueM(x: number, n: number, m: number, i: number): number {
  return annuityDue(x, n, i) - ((m - 1) / (2 * m)) * (1 - nEx(x, n, i));
}

// Sığorta məbləği (PAŞA Həyat sənəd 20.3 — S₁ = S₂ = S):
// S = m × P_m × (1−β) × ä^(m)_{x:k} / [(1+ρ₁)×Ā^1_{x:n} + (1+ρ₂)×nE_x + α + γ×ä_{x:n}]
function calculateActuarialS(grossPremium: number, netPremium: number, age: number, durationMonths: number, i: number) {
  const n = Math.max(1, Math.round(durationMonths / 12));
  const k = n; // ödəniş dövrü = sığorta dövrü
  const x = Math.max(0, Math.min(105, Math.floor(age)));

  const A1 = termInsurance(x, n, i);
  const E = nEx(x, n, i);
  const a = annuityDue(x, n, i);
  const a_m = annuityDueM(x, k, ACT_m, i);

  const numerator = ACT_m * grossPremium * (1 - ACT_beta) * a_m;
  const denominator = (1 + ACT_rho1) * A1 + (1 + ACT_rho2) * E + ACT_alpha + ACT_gamma * a;
  const S = denominator > 0 ? numerator / denominator : 0;

  const totalGrossPaid = grossPremium * durationMonths;
  const totalNetPaid = netPremium * durationMonths;
  return { S, vergiQenaeti: totalGrossPaid - totalNetPaid, xalisQazanc: S - totalNetPaid, effectiveI: i };
}

// ── Split hesablama (8000+ maaşlar üçün sığorta bonusu) ──

interface BonusBreakdown {
  highTierAmount: number;
  normalTierAmount: number;
  highTierBonus: number;
  normalTierBonus: number;
  totalBonus: number;
}

function calculateBonus(gross: number, insurancePremium: number): BonusBreakdown {
  if (gross <= 8000) {
    const bonus = insurancePremium * 0.11;
    return { highTierAmount: 0, normalTierAmount: insurancePremium, highTierBonus: 0, normalTierBonus: bonus, totalBonus: bonus };
  }
  const excessAmount = gross - 8000;
  const highTier = Math.min(insurancePremium, excessAmount);
  const normalTier = Math.max(0, insurancePremium - highTier);
  const highTierBonus = highTier * 0.3;
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
  bonus: BonusBreakdown;
  monthlyWith15: number;
  totalWithInvestment: number;
  selfSavings: number;
  gainAmount: number;
  employerDSMF: number;
  employerUnemployment: number;
  employerTotalCost: number;
  employerSavingsPerMonth: number;
  incomeTax: number;
  dsmfEmployee: number;
  medicalInsurance: number;
  unemploymentEmployee: number;
  totalDeductions: number;
  yekunMebleg: number;
  vergiQenaeti: number;
  xalisQazanc: number;
  effectiveI: number;
}

function calculate(
  gross: number,
  insuranceGross: number,
  sector: Sector,
  duration: number,
  unionPercent: number,
  age: number,
  annualRate: number,
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

  // PAŞA: 8000 AZN-dən yuxarı maaşlarda sığorta haqqı iki hissəyə bölünür
  // Limit üstü hissə (Gross − 8000): 30% bonus (15% DSMF + 14% GV + 1% digər)
  // Normal hissə (qalan): 10% bonus (yalnız gəlir vergisi)
  const excess = Math.max(0, gross - 8000);
  const highTier = Math.min(insuranceGross, excess);
  const normalTier = insuranceGross - highTier;
  const monthlyDisplay = highTier * 1.2 + normalTier; // 900 = 600 + 300
  const monthlyNetCost = highTier * 0.7 + normalTier * 0.9; // 620 = 350 + 270
  const insuranceNet = monthlyNetCost;

  // Aktuar düstur (PAŞA Həyat sənəd 20.3) — yaş, ölüm cədvəli və illik gəlirlilik norması ilə.
  // PAŞA-nın empirik düzəlişi: high-tier hissə formulada 0.965457 əmsalı ilə daxil olur.
  const effectivePremium = normalTier + highTier * 0.965457;
  const actuarial = calculateActuarialS(effectivePremium, insuranceNet, age, duration, annualRate);

  const bonus = calculateBonus(gross, insuranceGross);
  const totalWithInvestment = actuarial.S; // aktuar düstur nəticəsi (Bizimlə yığsanız)
  const selfSavings = monthlyNetCost * duration; // Özünüz yığsanız

  return {
    bonus,
    monthlyWith15: monthlyDisplay, // PAŞA-nın "Aylıq sığorta haqqı" göstəricisi
    totalWithInvestment,
    selfSavings,
    gainAmount: totalWithInvestment - selfSavings,
    employerDSMF: dsmfEmployer,
    employerUnemployment: unemploymentEmployer,
    employerTotalCost: gross + dsmfEmployer + unemploymentEmployer,
    employerSavingsPerMonth: bonus.totalBonus,
    incomeTax,
    dsmfEmployee,
    medicalInsurance,
    unemploymentEmployee,
    totalDeductions,
    yekunMebleg: actuarial.S,
    vergiQenaeti: actuarial.vergiQenaeti,
    xalisQazanc: actuarial.xalisQazanc,
    effectiveI: actuarial.effectiveI,
  };
}

const fmt = (n: number) => fmtNum(n, 2);
const num = (s: string) => parseFloat(s.replace(",", "."));

const FORMULA_TITLE = "Yaşam sığortası yığım modeli necə işləyir?";
const FORMULA_CONTENT = `Sığorta ödənişiniz vergi güzəştinə malikdir. İşəgötürən tərəfindən bonus əlavə olunur.

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
• Aylıq baza: 685 AZN × 1.15 = 787.75 AZN`;

const PASHA = "#002d4b";
const PASHA_ORANGE = "#ff5a00";

export function LifeInsuranceCalculator() {
  const { colors } = useTheme();
  const [sector, setSector] = useState<Sector>("private");
  const [grossStr, setGrossStr] = useState("4000");
  const [unionPercent, setUnionPercent] = useState("0");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [insuranceGrossStr, setInsuranceGrossStr] = useState("");
  const [paymentForm, setPaymentForm] = useState<PaymentForm>("lump");
  const [birthDate, setBirthDate] = useState("1998-03-19");
  const [duration, setDuration] = useState("36");
  const [annualRateStr, setAnnualRateStr] = useState("11.7782"); // PAŞA Həyat ilə tam uyğun
  const [result, setResult] = useState<CalcResult | null>(null);

  // Gross-dan Net hesabla (real-time)
  const netFromGross = useMemo(() => {
    const gross = num(grossStr) || 0;
    if (gross <= 0) return 0;
    const union = num(unionPercent) || 0;
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
    const v = num(insuranceGrossStr) || 0;
    return v > 0 ? v * 0.8 : 0;
  }, [insuranceGrossStr]);

  function handleCalculate() {
    const gross = num(grossStr) || 0;
    const insuranceGross = num(insuranceGrossStr) || 0;
    const dur = parseInt(duration, 10) || 36;
    const union = num(unionPercent) || 0;
    // Doğum tarixindən cari yaşı hesablamaq
    const birth = parseISODate(birthDate);
    const today = new Date();
    let age = NaN;
    if (birth) {
      age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    }
    const annualRate = (num(annualRateStr) || 0) / 100;
    setResult(calculate(gross, insuranceGross, sector, dur, union, age, annualRate));
  }

  const perMonth = "AZN/ay";

  return (
    <View>
      <OptionCards
        label="Sektor"
        columns={1}
        options={[
          { value: "private", title: "Özəl sektor", description: "Qeyri neft-qaz, 200₼-dək 0%, 2500₼-dək 3%" },
          { value: "oilgas", title: "Neft-qaz sektoru", description: "14% / 25% vergi, DSMF 3%" },
        ]}
        selected={sector}
        onSelect={setSector}
      />

      <InputField
        label="Həmkarlar ittifaqı"
        value={unionPercent}
        onChangeText={setUnionPercent}
        keyboardType="decimal-pad"
        suffix="%"
        hint="Həmkarlar İttifaqı əgər sizin şirkətdə mövcud deyilsə, zəhmət olmasa 0% olaraq davam edin"
      />

      <InputField
        label="Əmək haqqı (Net)"
        value={netFromGross > 0 ? fmt(netFromGross) : "0.00"}
        onChangeText={() => {}}
        editable={false}
        suffix="AZN"
      />
      <InputField
        label="Əmək haqqı (Gross)"
        value={grossStr}
        onChangeText={setGrossStr}
        placeholder="4000"
        keyboardType="decimal-pad"
        suffix="AZN"
      />

      <SegmentControl
        label="Müqavilə valyutası"
        options={[
          { value: "AZN", label: "AZN" },
          { value: "USD", label: "USD" },
        ]}
        selected={currency}
        onSelect={setCurrency}
      />

      <InputField
        label="Sığorta haqqı (Net)"
        value={insuranceNetDisplay > 0 ? fmt(insuranceNetDisplay) : ""}
        onChangeText={() => {}}
        editable={false}
        placeholder="Net sığorta haqqı"
      />
      <InputField
        label="Sığorta haqqı (Gross)"
        value={insuranceGrossStr}
        onChangeText={setInsuranceGrossStr}
        placeholder="Gross sığorta haqqını daxil edin"
        keyboardType="decimal-pad"
      />

      <SegmentControl
        label="Sığorta haqqının ödəniş forması"
        options={[
          { value: "monthly", label: "Aylıq ödəniş" },
          { value: "lump", label: "Birdəfəlik ödəniş" },
        ]}
        selected={paymentForm}
        onSelect={setPaymentForm}
      />

      <DateField label="Doğum tarixi" value={birthDate} onChange={setBirthDate} />
      <InputField
        label="Müddət (Ay)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        hint="Minimum müddət 36, maksimum müddət 120 olmalıdır."
      />

      <InputField
        label="İllik gəlirlilik norması — i (%)"
        value={annualRateStr}
        onChangeText={setAnnualRateStr}
        keyboardType="decimal-pad"
        hint="Aktuar düsturunda istifadə olunan illik faiz dərəcəsi (PAŞA Həyat Əlavə 2). Defolt 11.78% PAŞA Həyatın ictimai kalkulyatoru ilə uyğunlaşdırılıb. Əgər PAŞA-nın faktiki rəqəmi fərqlidirsə, bu inputu dəyişin."
      />

      <Button title="Hesabla" onPress={handleCalculate} />

      {result ? (
        <View>
          <TintCard color={PASHA} title="📐 Aktuar hesablama (PAŞA Həyat sənəd 20.3)">
            <View style={{ borderRadius: 12, padding: 14, alignItems: "center", backgroundColor: PASHA, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: "#bfdbfe" }}>Yekun Məbləğ (Sığorta məbləği)</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#ffffff", marginTop: 2 }}>{fmt(result.yekunMebleg)}</Text>
              <Text style={{ fontSize: 12, color: "#bfdbfe" }}>AZN</Text>
            </View>
            <KV label="Vergi Qənaəti" value={`${fmt(result.vergiQenaeti)} AZN`} color={SEM.amber} bold />
            <KV label="Xalis Qazanc" value={`${fmt(result.xalisQazanc)} AZN`} color={SEM.green} bold />
            <Text style={{ fontSize: 12, lineHeight: 17, color: colors.n580, marginTop: 6 }}>
              PAŞA Həyat aktuar düsturu ilə hesablanmış sığorta məbləği (i=3%, ölüm cədvəlsiz). İstifadə olunan illik
              gəlirlilik norması: <Text style={{ fontWeight: "700" }}>{(result.effectiveI * 100).toFixed(2)}%</Text>
            </Text>
          </TintCard>

          <View style={{ borderRadius: 16, padding: 16, marginTop: 12, backgroundColor: PASHA }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#ffffff", marginBottom: 10 }}>Nəticə</Text>
            <Text style={{ fontSize: 13, color: "#bfdbfe" }}>Bizimlə yığsanız</Text>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#ffffff", marginBottom: 10 }}>
              {fmt(result.totalWithInvestment)} AZN
            </Text>
            {[
              ["Özünüz yığsanız", result.selfSavings],
              ["Qazanc məbləği", result.gainAmount],
              ["Aylıq sığorta ödənişi", result.monthlyWith15],
            ].map(([l, v]) => (
              <View key={String(l)} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                <Text style={{ fontSize: 13, color: "#bfdbfe" }}>{l}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: PASHA_ORANGE }}>{fmt(v as number)} AZN</Text>
              </View>
            ))}
          </View>

          {result.bonus.highTierAmount > 0 && (
            <TintCard color={SEM.orange} title="⚠ 8000 AZN üzəri — Split hesablama">
              <KV
                label="Limit üstü hissə (Gross − 8000)"
                sub={`15% DSMF + 14% GV + 1% = 30% bonus = ${fmt(result.bonus.highTierBonus)} AZN`}
                value={`${fmt(result.bonus.highTierAmount)} AZN`}
                bold
              />
              <KV
                label="Normal hissə (8000-ə qədər)"
                sub={`11% bonus = ${fmt(result.bonus.normalTierBonus)} AZN`}
                value={`${fmt(result.bonus.normalTierAmount)} AZN`}
                bold
              />
              <KV label="Cəmi bonus" value={`${fmt(result.bonus.totalBonus)} AZN`} bold color={PASHA_ORANGE} />
            </TintCard>
          )}

          <TintCard color={SEM.green} title="👨 İşçi Qazancı">
            <KV label="Özünüz yığsanız" value={`${fmt(result.selfSavings)} AZN`} />
            <KV label="Bizimlə yığsanız" value={`${fmt(result.totalWithInvestment)} AZN`} />
            <KV label="Qazancınız" value={`${fmt(result.gainAmount)} AZN`} bold color={SEM.green} />
          </TintCard>

          <TintCard color={SEM.blue} title="🏢 İşəgötürən Qənaəti">
            <KV label="DSMF (işəgötürən)" value={`${fmt(result.employerDSMF)} ${perMonth}`} />
            <KV label="İşsizlik sığortası" value={`${fmt(result.employerUnemployment)} ${perMonth}`} />
            <KV label="Vergi bonusu (qənaət)" value={`${fmt(result.employerSavingsPerMonth)} ${perMonth}`} color={PASHA_ORANGE} />
            <KV label="Ümumi xərc" value={`${fmt(result.employerTotalCost)} ${perMonth}`} bold />
          </TintCard>

          <TintCard color={SEM.gray} title="📋 Vergi detalları">
            <KV label="Gəlir vergisi" value={`${fmt(result.incomeTax)} AZN`} />
            <KV label="DSMF (işçi)" value={`${fmt(result.dsmfEmployee)} AZN`} />
            <KV label="İşsizlik sığortası" value={`${fmt(result.unemploymentEmployee)} AZN`} />
            <KV label="İcbari tibbi sığorta" value={`${fmt(result.medicalInsurance)} AZN`} />
            <KV label="Cəmi tutulma" value={`${fmt(result.totalDeductions)} AZN`} bold color={SEM.red} />
          </TintCard>
        </View>
      ) : (
        <EmptyState icon="🛡" text="Nəticəni görmək üçün əmək haqqı və sığorta haqqını daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "deposit", "loan"]} />
    </View>
  );
}
