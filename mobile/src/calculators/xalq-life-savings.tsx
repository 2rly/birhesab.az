import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Sector = "nonOil" | "oil";

const ALFA = 0.005;
const BETTA = 0.003;
const QAMMA = 0.0025;
const RO1 = 0.03;
const RO2 = 0.015;
const I_POLICY = 0.05;

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

function datedifM(a: Date, b: Date): number {
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months--;
  return Math.max(0, months);
}

function netSalaryGivenPremium(G: number, p: number, sector: Sector): number {
  const B = G - p;
  const dsmf =
    sector === "oil"
      ? B * 0.03
      : Math.max(B - 200, 0) * 0.1 + Math.min(200, Math.max(B, 0)) * 0.03;
  const ui = G * 0.005;
  const med =
    sector === "oil"
      ? G <= 8000 ? G * 0.02 : 160 + (G - 8000) * 0.005
      : G <= 2500 ? G * 0.02 : 50 + (G - 2500) * 0.005;
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
  finalSum: number;
  totalNetPremiums: number;
  netGain: number;
  netGainPct: number;
}

function calculate(
  birth: Date, start: Date, end: Date,
  sector: Sector, G: number, P: number,
): CalcResult | null {
  const n = datedifM(start, end);
  const xM = datedifM(birth, start);
  if (n <= 0 || G <= 0 || P <= 0) return null;
  if (xM < 0 || xM + n >= LM.length) return null;

  const netSalary = netSalaryGivenPremium(G, 0, sector);
  const netPremium = netSalary - netSalaryGivenPremium(G, P, sector);
  const SG = P + employerTopUp(G, P, sector);

  const o11 =
    (0.4997 * G) / 1.055 <= G - 8000
      ? (0.4997 * G) / 1.055
      : (0.4997 * G + 0.02 * (G - 8000)) / 1.075;
  const maxPct = sector === "oil" ? 0.45 : G > 8000 ? o11 / G : 0.465;
  const maxAmount = G * maxPct;

  const j = I_POLICY / 12;
  const v = 1 / (1 + j);
  const coef = j / Math.log(1 + j);
  let A = 0;
  let sumS = 0;
  let Sn = 0;
  for (let t = 1; t <= n; t++) {
    const p = LM[xM + t - 1] / LM[xM];
    const S = p * Math.pow(v, t - 1);
    A += p * QM[xM + t - 1] * Math.pow(v, t) * coef;
    sumS += S;
    if (t === n) Sn = S;
  }
  const nEx = Sn;
  const aAnn = sumS / 12 + (11 / 24) * (1 - nEx);

  const finalSum =
    ((1 - BETTA) * SG * sumS) /
    ((1 + RO1) * A + (1 + RO2) * nEx + ALFA + QAMMA * aAnn);

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

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function parseDate(s: string): Date | null {
  const parts = s.split(/[.\-\/]/);
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  if (y > 1000) return new Date(y, m - 1, d);
  return new Date(d, m - 1, y);
}

export function XalqLifeSavingsCalculator() {
  const { colors } = useTheme();
  const [sector, setSector] = useState<Sector>("nonOil");
  const [birthDate, setBirthDate] = useState("01.01.1990");
  const [startDate, setStartDate] = useState("01.01.2026");
  const [endDate, setEndDate] = useState("01.01.2029");
  const [grossSalary, setGrossSalary] = useState("1000");
  const [grossPremium, setGrossPremium] = useState("100");

  const result = useMemo(() => {
    const b = parseDate(birthDate);
    const s = parseDate(startDate);
    const e = parseDate(endDate);
    const G = parseFloat(grossSalary.replace(",", ".")) || 0;
    const P = parseFloat(grossPremium.replace(",", ".")) || 0;
    if (!b || !s || !e || G <= 0 || P <= 0) return null;
    if (e <= s) return null;
    return calculate(b, s, e, sector, G, P);
  }, [birthDate, startDate, endDate, sector, grossSalary, grossPremium]);

  return (
    <View>
      <SegmentControl
        label="Sektor"
        options={[
          { value: "nonOil", label: "Qeyri-neft / Özəl" },
          { value: "oil", label: "Neft-qaz sektoru" },
        ]}
        selected={sector}
        onSelect={setSector}
      />

      <InputField
        label="Doğum tarixi (GG.AA.İİİİ)"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="01.01.1990"
      />
      <InputField
        label="Müqavilə başlama tarixi"
        value={startDate}
        onChangeText={setStartDate}
        placeholder="01.01.2026"
      />
      <InputField
        label="Müqavilə bitmə tarixi"
        value={endDate}
        onChangeText={setEndDate}
        placeholder="01.01.2029"
      />
      <InputField
        label="Gross əmək haqqı (aylıq)"
        value={grossSalary}
        onChangeText={setGrossSalary}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="Gross sığorta haqqı (aylıq)"
        value={grossPremium}
        onChangeText={setGrossPremium}
        placeholder="100"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      {result ? (
        <>
          <ResultSection title="Əsas nəticə">
            <ResultRow
              label="Yekun sığorta məbləği"
              value={fmt(result.finalSum)}
              highlight
              bold
            />
            <ResultRow
              label="Xalis gəlir"
              value={`${fmt(result.netGain)} (${(result.netGainPct * 100).toFixed(1)}%)`}
              bold
            />
          </ResultSection>

          <ResultSection title="Detallar">
            <ResultRow
              label="Müddət"
              value={`${result.termMonths} ay`}
            />
            <ResultRow
              label="Başlanğıc yaş"
              value={`${Math.floor(result.ageMonths / 12)} il`}
            />
            <ResultRow label="Net əmək haqqı" value={fmt(result.netSalary)} />
            <ResultRow label="Net sığorta haqqı (aylıq)" value={fmt(result.netPremium)} />
            <ResultRow label="Super Gross sığorta haqqı" value={fmt(result.superGross)} />
            <ResultRow
              label={`Maks. sığorta haqqı (${(result.maxPct * 100).toFixed(1)}%)`}
              value={fmt(result.maxAmount)}
            />
            <ResultRow
              label="Net haqların cəmi"
              value={fmt(result.totalNetPremiums)}
            />
          </ResultSection>
        </>
      ) : (
        <Text style={[styles.emptyText, { color: colors.n500c }]}>
          Məlumatları daxil edin — tarixlər, maaş və sığorta haqqı.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 20,
  },
});
