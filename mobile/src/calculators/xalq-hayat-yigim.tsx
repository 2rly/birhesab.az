import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { DateField, Button } from "@/components/Controls";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SectionHeading, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum, parseISODate } from "@/lib/format";
import { EmptyState, SEM } from "./_tax-parts";

// ============================================================
// Xalq Həyat — Yığım sığortası kalkulyatoru
// Aktuar model (Excel "Yığım Kalkulyator" ilə bit-dəqiq uyğun).
// Yekun sığorta məbləği aylıq kommutasiya funksiyaları ilə hesablanır.
// ============================================================

type Sector = "nonOil" | "oil";
type Currency = "AZN" | "USD";

// ── Aktuar xərc əmsalları (Excel Hesablama_olum BD/BE bloku) ──
const ALFA = 0.005; // α — sığorta məbləğinə mütənasib müqavilə xərci
const BETTA = 0.003; // β — sığorta haqqından asılı xərc
const QAMMA = 0.0025; // γ — sığorta məbləğinə mütənasib cari xərc
const RO1 = 0.03; // ρ₁ — ölüm təminatı üzrə yükləmə
const RO2 = 0.015; // ρ₂ — yaşam təminatı üzrə yükləmə
const I_POLICY = 0.05; // sığorta olunanın investisiya faizi (5%) — valyutadan asılı deyil

// Ölüm cədvəli (Excel Sheet4 A3:D108) — dx (ölənlərin sayı), yaş 0..105, l₀ = 1 000 000
const L0 = 1_000_000;
const DX = [
  12887, 1906, 1068, 701, 536, 487, 464, 429, 411, 403,
  392, 375, 342, 343, 376, 429, 458, 500, 570, 600,
  645, 666, 721, 757, 841, 856, 934, 979, 1063, 1131,
  1234, 1271, 1535, 1578, 1613, 1759, 1859, 2010, 2276, 2300,
  2547, 2797, 3016, 3317, 3561, 3986, 4296, 4863, 5371, 5882,
  6653, 7364, 7851, 8765, 9798, 10833, 11283, 12201, 13131, 14520,
  15427, 15995, 17634, 18567, 20359, 21959, 23457, 25019, 26318, 28418,
  29665, 31568, 32267, 33200, 33449, 34489, 34058, 33118, 32793, 31694,
  30578, 27247, 25502, 24176, 22252, 19549, 17698, 16015, 14980, 13613,
  12118, 10535, 8912, 7308, 5778, 4154, 2917, 1999, 1333, 863,
  542, 328, 192, 108, 58, 54,
];

// Aylıq ("modifikasiya olunmuş") ölüm cədvəli: dm = dxAnnual/12, lm rekurrensiya, qm = dm/lm
function buildMonthlyTable() {
  const lm: number[] = [L0];
  const qm: number[] = [];
  for (let m = 0; m < DX.length * 12; m++) {
    const d = DX[Math.floor(m / 12)] / 12;
    qm.push(d / lm[m]);
    lm.push(lm[m] - d);
  }
  return { lm, qm };
}
const { lm: LM, qm: QM } = buildMonthlyTable();

// Excel DATEDIF(a,b,"m") — tam ayların sayı
function datedifM(a: Date, b: Date): number {
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months--;
  return Math.max(0, months);
}

// ── Maaş → net (Excel sheet2 M/N sütunları) ──
function netSalaryGivenPremium(G: number, p: number, sector: Sector): number {
  const B = G - p; // vergi tutulan baza
  const dsmf =
    sector === "oil" ? B * 0.03 : Math.max(B - 200, 0) * 0.1 + Math.min(200, Math.max(B, 0)) * 0.03;
  const ui = G * 0.005; // işsizlik sığortası — tam gross üzərindən
  const med =
    sector === "oil"
      ? G <= 8000
        ? G * 0.02
        : 160 + (G - 8000) * 0.005
      : G <= 2500
        ? G * 0.02
        : 50 + (G - 2500) * 0.005;
  const tax =
    sector === "oil"
      ? B <= 2500
        ? Math.max(B - 200, 0) * 0.14
        : 350 + (B - 2500) * 0.25
      : B <= 200
        ? 0
        : B <= 2500
          ? (B - 200) * 0.03
          : B <= 8000
            ? 75 + (B - 2500) * 0.1
            : 625 + (B - 8000) * 0.14;
  return G - p - dsmf - ui - tax - med;
}

function employerTopUp(G: number, p: number, sector: Sector): number {
  if (sector === "oil") return p * 0.22;
  if (G <= 8000) return p * 0.15;
  if (p < G - 8000) return p * 0.11;
  return (G - 8000) * 0.11 + (p - (G - 8000)) * 0.15;
}

interface CalcResult {
  termMonths: number;
  ageMonths: number;
  netSalary: number;
  netPremium: number;
  superGross: number;
  maxPct: number;
  maxAmount: number;
  finalSum: number; // Yekun sığorta məbləği (D25)
  totalNetPremiums: number;
  netGain: number;
  netGainPct: number;
}

function calculate(birth: Date, start: Date, end: Date, sector: Sector, G: number, P: number): CalcResult | null {
  const n = datedifM(start, end);
  const xM = datedifM(birth, start);
  if (n <= 0 || G <= 0 || P <= 0) return null;
  if (xM < 0 || xM + n >= LM.length) return null;

  // Maaş bloku
  const netSalary = netSalaryGivenPremium(G, 0, sector); // H13
  const netPremium = netSalary - netSalaryGivenPremium(G, P, sector); // H14
  const SG = P + employerTopUp(G, P, sector); // super gross (H15)

  const o11 =
    (0.4997 * G) / 1.055 <= G - 8000 ? (0.4997 * G) / 1.055 : (0.4997 * G + 0.02 * (G - 8000)) / 1.075;
  const maxPct = sector === "oil" ? 0.45 : G > 8000 ? o11 / G : 0.465;
  const maxAmount = G * maxPct;

  // Aktuar nüvə (sığorta olunan bazası, i = 5%)
  const j = I_POLICY / 12;
  const v = 1 / (1 + j);
  const coef = j / Math.log(1 + j); // i/δ — kəsilməz ölüm düzəlişi
  let A = 0;
  let sumS = 0;
  let Sn = 0;
  for (let t = 1; t <= n; t++) {
    const p = LM[xM + t - 1] / LM[xM]; // tp_x
    const S = p * Math.pow(v, t - 1);
    A += p * QM[xM + t - 1] * Math.pow(v, t) * coef;
    sumS += S;
    if (t === n) Sn = S;
  }
  const aM = sumS / 12;
  const nEx = Sn;
  const aAnn = aM + (11 / 24) * (1 - nEx);

  const finalSum = ((1 - BETTA) * SG * sumS) / ((1 + RO1) * A + (1 + RO2) * nEx + ALFA + QAMMA * aAnn);
  const totalNetPremiums = netPremium * n;
  const netGain = finalSum - totalNetPremiums;

  return {
    termMonths: n,
    ageMonths: xM,
    netSalary,
    netPremium,
    superGross: SG,
    maxPct,
    maxAmount,
    finalSum,
    totalNetPremiums,
    netGain,
    netGainPct: totalNetPremiums > 0 ? netGain / totalNetPremiums : 0,
  };
}

const fmt = (n: number) => fmtNum(n, 2);

const FORMULA_TITLE = "Xalq Həyat yığım sığortası necə hesablanır?";
const FORMULA_CONTENT = `Bu kalkulyator Xalq Həyatın "Yığım sığortası" aktuar modelini tətbiq edir:

1. Gross maaş və gross sığorta haqqından net sığorta haqqı hesablanır (DSMF, gəlir vergisi, tibbi sığorta, işsizlik sığortası nəzərə alınır).
2. İşəgötürənin yaşama yönəltdiyi məbləğ əlavə olunub "super gross" sığorta haqqı alınır.
3. Yekun sığorta məbləği aylıq aktuar kommutasiya funksiyaları (ölüm cədvəli, 5% investisiya faizi, xərc əmsalları) ilə hesablanır:

   S = (1−β) × SG × Σ[tp_x·v^(t−1)] / [(1+ρ₁)·Ā¹ + (1+ρ₂)·nEx + α + γ·ä]

   α=0,5%  β=0,3%  γ=0,25%  ρ₁=3%  ρ₂=1,5%  i=5%

4. Xalis gəlir = Yekun sığorta məbləği − ödənilən net sığorta haqlarının cəmi.

Qeyd: Yekun məbləğ valyutadan asılı deyil (i=5% sabitdir).`;

export function XalqHayatYigimCalculator() {
  const { colors } = useTheme();
  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2029-01-01");
  const [sector, setSector] = useState<Sector>("nonOil");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [grossSalary, setGrossSalary] = useState("1000");
  const [grossPremium, setGrossPremium] = useState("100");
  const [submitted, setSubmitted] = useState(false);

  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setSubmitted(false);
  };

  const result = useMemo(() => {
    if (!submitted) return null;
    const b = parseISODate(birthDate);
    const s = parseISODate(startDate);
    const e = parseISODate(endDate);
    const G = parseFloat(grossSalary.replace(",", "."));
    const P = parseFloat(grossPremium.replace(",", "."));
    if (!b || !s || !e || !G || !P) return "inputs" as const;
    if (e <= s) return "dates" as const;
    return calculate(b, s, e, sector, G, P);
  }, [submitted, birthDate, startDate, endDate, sector, grossSalary, grossPremium]);

  const res = result && typeof result === "object" ? result : null;
  const gainColor = res && res.netGain >= 0 ? SEM.green : SEM.red;

  return (
    <View>
      <SectionHeading>Sığortalı məlumatları</SectionHeading>

      <DateField label="Doğum tarixi" value={birthDate} onChange={touch(setBirthDate)} />
      <DateField label="Müqavilənin başlama tarixi" value={startDate} onChange={touch(setStartDate)} />
      <DateField label="Müqavilənin bitmə tarixi" value={endDate} onChange={touch(setEndDate)} />

      <Select
        label="Biznes sektoru"
        value={sector}
        onSelect={touch(setSector)}
        options={[
          { value: "nonOil", label: "Qeyri-neft və özəl sektor" },
          { value: "oil", label: "Neft-qaz sektoru" },
        ]}
      />
      <Select
        label="Valyuta"
        value={currency}
        onSelect={touch(setCurrency)}
        options={[
          { value: "AZN", label: "AZN" },
          { value: "USD", label: "USD" },
        ]}
      />

      <InputField
        label="Gross əmək haqqı (AZN)"
        value={grossSalary}
        onChangeText={touch(setGrossSalary)}
        placeholder="1000"
        keyboardType="decimal-pad"
      />
      <InputField
        label="Gross sığorta haqqı (aylıq) (AZN)"
        value={grossPremium}
        onChangeText={touch(setGrossPremium)}
        placeholder="100"
        keyboardType="decimal-pad"
      />

      <Button title="Hesabla" onPress={() => setSubmitted(true)} />

      {result === "dates" && (
        <InfoBox variant="danger">Müqavilə bitmə tarixi başlama tarixindən sonra olmalıdır.</InfoBox>
      )}
      {result === "inputs" && (
        <InfoBox variant="danger">Bütün sahələri düzgün doldurun (tarixlər, maaş, sığorta haqqı).</InfoBox>
      )}

      {res ? (
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <View style={{ flexGrow: 1, flexBasis: "45%", borderRadius: 16, padding: 16, alignItems: "center", backgroundColor: colors.accent }}>
              <Text style={{ fontSize: 13, color: colors.onAccent, opacity: 0.85 }}>Yekun sığorta məbləği</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: colors.onAccent, marginTop: 4 }}>{fmt(res.finalSum)}</Text>
              <Text style={{ fontSize: 12, color: colors.onAccent, opacity: 0.85 }}>AZN</Text>
            </View>
            <View
              style={{
                flexGrow: 1,
                flexBasis: "45%",
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: gainColor + "66",
                backgroundColor: gainColor + "1a",
              }}
            >
              <Text style={{ fontSize: 13, color: colors.n580 }}>Xalis gəlir</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: gainColor, marginTop: 4 }}>{fmt(res.netGain)}</Text>
              <Text style={{ fontSize: 12, color: colors.n580 }}>AZN · {(res.netGainPct * 100).toFixed(2)}%</Text>
            </View>
          </View>

          <ResultSection title="📋 Nəticə">
            <ResultRow
              label="Müddət · Başlanğıcda yaş"
              value={`${res.termMonths} ay · ${Math.floor(res.ageMonths / 12)} il`}
            />
            <ResultRow label="Net əmək haqqı" value={`${fmt(res.netSalary)} AZN`} />
            <ResultRow label="Net sığorta haqqı (aylıq)" value={`${fmt(res.netPremium)} AZN`} />
            <ResultRow label="Super Gross sığorta haqqı" value={`${fmt(res.superGross)} AZN`} />
            <ResultRow
              label={`Maks. sığorta haqqı (gross-un ${(res.maxPct * 100).toFixed(1)}%-i)`}
              value={`${fmt(res.maxAmount)} AZN`}
            />
            <ResultRow label="Net sığorta haqlarının cəmi" value={`${fmt(res.totalNetPremiums)} AZN`} bold />
            <ResultRow label="Yekun sığorta məbləği" value={`${fmt(res.finalSum)} AZN`} highlight bold />
          </ResultSection>

          <InfoBox variant="info">
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
              <Text style={{ fontWeight: "700" }}>Qeyd:</Text> Bu hesablama Xalq Həyatın yığım modelinin aktuar düsturuna
              əsaslanır və təxmini xarakter daşıyır. Dəqiq təklif üçün sığorta şirkətinə müraciət edin.
            </Text>
          </InfoBox>
        </View>
      ) : !result ? (
        <EmptyState icon="💰" text="Məlumatları daxil edib «Hesabla» düyməsini basın." />
      ) : null}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["life-insurance", "salary", "deposit", "loan"]} />
    </View>
  );
}
