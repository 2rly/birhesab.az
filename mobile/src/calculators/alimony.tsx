import { useState, useMemo, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { Panel, OptionCard, EmptyState, FieldLabel, TINT, type Tint } from "./_legal-parts";

// ============================================================
// Aliment hesablayıcısı
// Azərbaycan Respublikası Ailə Məcəlləsi
// Aliment: gəlir vergisi çıxıldıqdan sonrakı məbləğdən tutulur
// ============================================================

type Sector = "private" | "state";

// ── QEYRİ NEFT-QAZ / ÖZƏL SEKTOR ──
function calcPrivateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.03;
  if (gross <= 8000) return 75 + (gross - 2500) * 0.1;
  return 625 + (gross - 8000) * 0.14;
}
function calcPrivateDSMF(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  return 200 * 0.03 + (gross - 200) * 0.1;
}
function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 2500 * 0.02 + (gross - 2500) * 0.005;
}

// ── DÖVLƏT / NEFT-QAZ ──
function calcStateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.14;
  return 350 + (gross - 2500) * 0.25;
}
function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 8000 * 0.02 + (gross - 8000) * 0.005;
}

const fmt = (n: number) => fmtNum(n, 2);

const CHILD_OPTIONS: { id: number; label: string; percent: number }[] = [
  { id: 1, label: "1 uşaq", percent: 25 },
  { id: 2, label: "2 uşaq", percent: 33.3 },
  { id: 3, label: "3+ uşaq", percent: 50 },
  { id: 0, label: "Sabit məbləğ", percent: 0 },
];

const pt = {
  formulaTitle: "Aliment necə hesablanır?",
  formulaContent: `Alimentlər — qanunla müəyyən edilmiş qaydada ailənin bir üzvünün digər üzvlərinə verməli olduğu dolanacaq vasitəsidir.

Hesablama qaydası:
1. Gəlir vergisi hesablanır
2. Aliment bazası = Gross maaş − Gəlir vergisi
3. Aliment = Baza × faiz (uşaq sayına görə)
4. Digər tutulmalar: DSMF, işsizlik, tibbi sığorta
5. Əlinizə çatan = Gross − bütün tutulmalar

Aliment faizləri (Ailə Məcəlləsi, maddə 81):
• 1 uşaq: 25%
• 2 uşaq: 33,3% (1/3)
• 3 və daha çox uşaq: 50%
• Məhkəmə sabit məbləğ də təyin edə bilər

Nümunə (Dövlət sektoru, 800₼):
Gəlir vergisi = (800 − 200) × 14% = 84₼
Aliment bazası = 800 − 84 = 716₼
Aliment (25%) = 716 × 25% = 179₼
DSMF = 800 × 3% = 24₼
İşsizlik = 800 × 0,5% = 4₼
Tibbi sığorta = 800 × 2% = 16₼
Əlinizə çatan = 800 − 84 − 179 − 24 − 4 − 16 = 493₼`,
  sector: "Sektor",
  privateLabel: "Qeyri neft-qaz / Özəl",
  privateDesc: "200₼-dək vergi 0%",
  stateLabel: "Dövlət / Neft-qaz",
  stateDesc: "200₼ güzəşt, 14%/25%",
  grossSalary: "Aylıq gross əmək haqqı (AZN)",
  alimentType: "Aliment növü",
  fixedAlimentAmount: "Sabit aliment məbləği (AZN)",
  fixedByCourtDesc: "Məhkəmənin təyin etdiyi sabit məbləğ",
  customPercentLabel: "Xüsusi faiz daxil edin (istəyə bağlı)",
  customPercentHint: "Boş buraxsanız, standart faiz ({percent}%) tətbiq olunacaq",
  netSalary: "Əlinizə çatan",
  aliment: "Aliment",
  fixedAmountLabel: "sabit məbləğ",
  totalDeductions: "Cəmi tutulma",
  perMonth: "AZN / ay",
  calculationOrder: "Hesablama qaydası",
  stepByStep: "addım-addım",
  step1: "Gəlir vergisi hesablanır",
  taxExempt: "200₼-dək gəlir vergisi tutulmur",
  fixedPortion: "-dək hissə üçün sabit:",
  total: "Cəmi:",
  step2: "Aliment bazası müəyyən edilir",
  alimentBaseNote: "Aliment gəlir vergisi çıxıldıqdan sonrakı məbləğdən tutulur",
  step3: "Aliment məbləği hesablanır",
  fixedLabel: "Sabit məbləğ:",
  step4: "Digər tutulmalar",
  dsmf: "DSMF",
  unemployment: "İşsizlik sığortası",
  medicalInsurance: "İcbari tibbi sığorta",
  step5: "Əlinizə çatan məbləğ",
  salaryBreakdown: "Maaşın bölgüsü",
  legendNet: "Əlinizə çatan:",
  legendAliment: "Aliment:",
  legendTax: "Vergi:",
  legendDsmfInsurance: "DSMF+sığorta:",
  emptyStateText: "Nəticəni görmək üçün əmək haqqını daxil edin.",
};

export function AlimonyCalculator() {
  const { colors } = useTheme();
  const [gross, setGross] = useState("");
  const [sector, setSector] = useState<Sector>("state");
  const [childOption, setChildOption] = useState(1);
  const [customPercent, setCustomPercent] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");

  const result = useMemo(() => {
    const g = parseFloat(gross.replace(",", "."));
    if (!g || g <= 0) return null;

    let incomeTax: number;
    let dsmf: number;
    let medical: number;
    const unemployment = g * 0.005;

    if (sector === "private") {
      incomeTax = calcPrivateIncomeTax(g);
      dsmf = calcPrivateDSMF(g);
      medical = calcPrivateMedical(g);
    } else {
      incomeTax = calcStateIncomeTax(g);
      dsmf = g * 0.03;
      medical = calcStateMedical(g);
    }

    // Aliment bazası = gross - gəlir vergisi (qanuna əsasən)
    const alimentBase = g - incomeTax;

    let alimentPercent: number;
    let alimentAmount: number;
    let isFixed = false;

    const selected = CHILD_OPTIONS.find((c) => c.id === childOption);
    if (childOption === 0) {
      isFixed = true;
      alimentAmount = parseFloat(fixedAmount.replace(",", ".")) || 0;
      alimentPercent = alimentBase > 0 ? (alimentAmount / alimentBase) * 100 : 0;
    } else {
      const cp = parseFloat(customPercent.replace(",", "."));
      alimentPercent = cp > 0 ? cp : selected?.percent || 25;
      alimentAmount = alimentBase * (alimentPercent / 100);
    }

    const totalDeductions = incomeTax + alimentAmount + dsmf + unemployment + medical;
    const netSalary = g - totalDeductions;

    return {
      gross: g, incomeTax, alimentBase, alimentPercent, alimentAmount, dsmf, unemployment, medical,
      totalDeductions, netSalary: Math.max(0, netSalary), isFixed,
    };
  }, [gross, sector, childOption, customPercent, fixedAmount]);

  const selectedPercent = CHILD_OPTIONS.find((c) => c.id === childOption)?.percent;

  const Sub = ({ children, tint, bold, muted }: { children: ReactNode; tint?: Tint; bold?: boolean; muted?: boolean }) => (
    <Text style={{ fontSize: 12, lineHeight: 18, color: tint ? TINT[tint] : muted ? colors.n580 : colors.n940, fontWeight: bold ? "700" : "400" }}>
      {children}
    </Text>
  );
  const B = ({ children, tint }: { children: ReactNode; tint?: Tint }) => (
    <Text style={{ fontWeight: "700", color: tint ? TINT[tint] : undefined }}>{children}</Text>
  );

  const Step = ({ n, title, tint, children }: { n: number; title: string; tint: Tint | "accent"; children: ReactNode }) => {
    const c = tint === "accent" ? colors.accent : TINT[tint];
    const boxTint = tint === "amber" || tint === "green" ? TINT[tint] : undefined;
    return (
      <View style={[st.step, { borderBottomColor: colors.n280 }]}>
        <View style={st.stepHead}>
          <View style={[st.stepNum, { backgroundColor: c }]}>
            <Text style={st.stepNumText}>{n}</Text>
          </View>
          <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.n940 }}>{title}</Text>
        </View>
        <View
          style={[
            st.stepBox,
            boxTint
              ? { backgroundColor: boxTint + "14", borderColor: boxTint + "55", borderWidth: 1 }
              : { backgroundColor: colors.n240 },
          ]}
        >
          {children}
        </View>
      </View>
    );
  };

  const Dl = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, paddingVertical: 2 }}>
      <Text style={{ flex: 1, fontSize: 12, color: colors.n580 }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n940 }}>{value}</Text>
    </View>
  );

  const renderTaxStep = () => {
    if (!result) return null;
    const g = result.gross;
    if (g <= 200) return <Sub tint="green">{pt.taxExempt}</Sub>;
    if (sector === "state") {
      if (g <= 2500)
        return (
          <Sub>
            ({fmt(g)} − 200) × 14% = {fmt(g - 200)} × 14% = <B>{fmt(result.incomeTax)} AZN</B>
          </Sub>
        );
      return (
        <View style={{ gap: 3 }}>
          <Sub muted>2500₼ × 14% = 350 AZN</Sub>
          <Sub muted>
            ({fmt(g)} − 2500) × 25% = {fmt(g - 2500)} × 25% = {fmt((g - 2500) * 0.25)} AZN
          </Sub>
          <View style={[st.topLine, { borderTopColor: colors.n280 }]}>
            <Sub>
              {pt.total} <B>{fmt(result.incomeTax)} AZN</B>
            </Sub>
          </View>
        </View>
      );
    }
    if (g <= 2500)
      return (
        <Sub>
          ({fmt(g)} − 200) × 3% = {fmt(g - 200)} × 3% = <B>{fmt(result.incomeTax)} AZN</B>
        </Sub>
      );
    if (g <= 8000)
      return (
        <View style={{ gap: 3 }}>
          <Sub muted>2500₼{pt.fixedPortion} 75 AZN</Sub>
          <Sub muted>
            ({fmt(g)} − 2500) × 10% = {fmt(g - 2500)} × 10% = {fmt((g - 2500) * 0.1)} AZN
          </Sub>
          <View style={[st.topLine, { borderTopColor: colors.n280 }]}>
            <Sub>
              {pt.total} <B>{fmt(result.incomeTax)} AZN</B>
            </Sub>
          </View>
        </View>
      );
    return (
      <View style={{ gap: 3 }}>
        <Sub muted>8000₼{pt.fixedPortion} 625 AZN</Sub>
        <Sub muted>
          ({fmt(g)} − 8000) × 14% = {fmt(g - 8000)} × 14% = {fmt((g - 8000) * 0.14)} AZN
        </Sub>
        <View style={[st.topLine, { borderTopColor: colors.n280 }]}>
          <Sub>
            {pt.total} <B>{fmt(result.incomeTax)} AZN</B>
          </Sub>
        </View>
      </View>
    );
  };

  return (
    <View>
      {/* Sektor */}
      <FieldLabel>{pt.sector}</FieldLabel>
      <OptionCard title={pt.privateLabel} desc={pt.privateDesc} selected={sector === "private"} onPress={() => setSector("private")} />
      <OptionCard title={pt.stateLabel} desc={pt.stateDesc} selected={sector === "state"} onPress={() => setSector("state")} />
      <View style={{ height: 8 }} />

      {/* Gross maaş */}
      <InputField label={pt.grossSalary} value={gross} onChangeText={setGross} placeholder="800" keyboardType="decimal-pad" suffix="AZN" />
      <View style={[st.chips, { marginTop: -8 }]}>
        {[500, 800, 1200, 2000, 3000].map((v) => (
          <Pressable key={v} onPress={() => setGross(String(v))} style={[st.chip, { backgroundColor: colors.n240 }]}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n700 }}>{v}₼</Text>
          </Pressable>
        ))}
      </View>

      {/* Aliment növü */}
      <FieldLabel>{pt.alimentType}</FieldLabel>
      <View style={st.grid}>
        {CHILD_OPTIONS.map((opt) => {
          const active = childOption === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => {
                setChildOption(opt.id);
                setCustomPercent("");
              }}
              style={[
                st.gridBtn,
                {
                  borderColor: active ? colors.accent : colors.n280,
                  backgroundColor: active ? colors.accent + "1f" : colors.n200,
                },
              ]}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: active ? colors.accent : colors.n940 }}>{opt.label}</Text>
              {opt.percent > 0 && <Text style={{ fontSize: 12, color: colors.n580 }}>{opt.percent}%</Text>}
            </Pressable>
          );
        })}
      </View>

      {childOption === 0 ? (
        <InputField
          label={pt.fixedAlimentAmount}
          value={fixedAmount}
          onChangeText={setFixedAmount}
          placeholder="200"
          keyboardType="decimal-pad"
          suffix="AZN"
          hint={pt.fixedByCourtDesc}
        />
      ) : (
        <InputField
          label={pt.customPercentLabel}
          value={customPercent}
          onChangeText={setCustomPercent}
          placeholder={`${selectedPercent || 25}`}
          keyboardType="decimal-pad"
          suffix="%"
          hint={pt.customPercentHint.replace("{percent}", String(selectedPercent))}
        />
      )}

      {result ? (
        <View>
          {/* Əsas kartlar */}
          <View style={[st.hero, { backgroundColor: TINT.blue }]}>
            <Text style={st.heroLabel}>{pt.netSalary}</Text>
            <Text style={st.heroValue}>{fmt(result.netSalary)}</Text>
            <Text style={st.heroSub}>{pt.perMonth}</Text>
          </View>
          <View style={st.cardRow}>
            <View style={[st.miniCard, { backgroundColor: TINT.amber + "14", borderColor: TINT.amber + "55" }]}>
              <Text style={{ fontSize: 12, color: TINT.amber }}>{pt.aliment}</Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: TINT.amber, marginTop: 2 }}>{fmt(result.alimentAmount)}</Text>
              <Text style={{ fontSize: 11, color: TINT.amber, marginTop: 2 }}>
                {result.isFixed ? pt.fixedAmountLabel : `${result.alimentPercent.toFixed(1)}%`}
              </Text>
            </View>
            <View style={[st.miniCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={{ fontSize: 12, color: colors.n580 }}>{pt.totalDeductions}</Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: TINT.red, marginTop: 2 }}>{fmt(result.totalDeductions)}</Text>
              <Text style={{ fontSize: 11, color: colors.n580, marginTop: 2 }}>{pt.perMonth}</Text>
            </View>
          </View>

          {/* Addım-addım */}
          <Panel title={`${pt.calculationOrder} · ${pt.stepByStep}`} icon="📋">
            <Step n={1} title={pt.step1} tint="accent">
              {renderTaxStep()}
            </Step>
            <Step n={2} title={pt.step2} tint="accent">
              <Sub>
                {fmt(result.gross)} − {fmt(result.incomeTax)} = <B tint="blue">{fmt(result.alimentBase)} AZN</B>
              </Sub>
              <Text style={{ fontSize: 11, color: colors.n580, marginTop: 4 }}>{pt.alimentBaseNote}</Text>
            </Step>
            <Step n={3} title={pt.step3} tint="amber">
              {result.isFixed ? (
                <Text style={{ fontSize: 13, color: colors.n940 }}>
                  {pt.fixedLabel} <B tint="amber">{fmt(result.alimentAmount)} AZN</B>
                </Text>
              ) : (
                <Text style={{ fontSize: 13, color: colors.n940 }}>
                  {fmt(result.alimentBase)} × {result.alimentPercent.toFixed(1)}% = <B tint="amber">{fmt(result.alimentAmount)} AZN</B>
                </Text>
              )}
            </Step>
            <Step n={4} title={pt.step4} tint="accent">
              <Dl label={`${pt.dsmf}${sector === "state" ? ` (${fmt(result.gross)} × 3%)` : ""}`} value={`${fmt(result.dsmf)} AZN`} />
              <Dl label={`${pt.unemployment} (${fmt(result.gross)} × 0,5%)`} value={`${fmt(result.unemployment)} AZN`} />
              <Dl
                label={`${pt.medicalInsurance}${sector === "state" && result.gross <= 8000 ? ` (${fmt(result.gross)} × 2%)` : ""}`}
                value={`${fmt(result.medical)} AZN`}
              />
            </Step>
            <Step n={5} title={pt.step5} tint="green">
              <Text style={{ fontSize: 12, color: colors.n580, marginBottom: 6 }}>
                {fmt(result.gross)} − {fmt(result.incomeTax)} − {fmt(result.alimentAmount)} − {fmt(result.dsmf)} − {fmt(result.unemployment)} −{" "}
                {fmt(result.medical)}
              </Text>
              <Text style={{ fontSize: 13, color: colors.n940 }}>
                = {fmt(result.gross)} − {fmt(result.totalDeductions)} ={" "}
                <Text style={{ fontWeight: "800", fontSize: 16, color: TINT.green }}>{fmt(result.netSalary)} AZN</Text>
              </Text>
            </Step>
          </Panel>

          {/* Vizual bölgü */}
          <View style={[st.breakdown, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n580, marginBottom: 10 }}>{pt.salaryBreakdown}</Text>
            <View style={[st.bar, { backgroundColor: colors.n240 }]}>
              <View style={{ backgroundColor: "#4ade80", width: `${Math.max(0, (result.netSalary / result.gross) * 100)}%` }} />
              <View style={{ backgroundColor: "#fbbf24", width: `${Math.max(0, (result.alimentAmount / result.gross) * 100)}%` }} />
              <View style={{ backgroundColor: "#f87171", width: `${Math.max(0, (result.incomeTax / result.gross) * 100)}%` }} />
              <View
                style={{
                  backgroundColor: "#60a5fa",
                  width: `${Math.max(0, ((result.dsmf + result.unemployment + result.medical) / result.gross) * 100)}%`,
                }}
              />
            </View>
            <View style={{ gap: 6, marginTop: 10 }}>
              <Legend color="#4ade80" text={`${pt.legendNet} ${fmt(result.netSalary)} (${((result.netSalary / result.gross) * 100).toFixed(0)}%)`} />
              <Legend
                color="#fbbf24"
                text={`${pt.legendAliment} ${fmt(result.alimentAmount)} (${((result.alimentAmount / result.gross) * 100).toFixed(0)}%)`}
              />
              <Legend color="#f87171" text={`${pt.legendTax} ${fmt(result.incomeTax)} (${((result.incomeTax / result.gross) * 100).toFixed(0)}%)`} />
              <Legend
                color="#60a5fa"
                text={`${pt.legendDsmfInsurance} ${fmt(result.dsmf + result.unemployment + result.medical)} (${(
                  ((result.dsmf + result.unemployment + result.medical) / result.gross) *
                  100
                ).toFixed(0)}%)`}
              />
            </View>
          </View>
        </View>
      ) : (
        <EmptyState icon="⚖️" text={pt.emptyStateText} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["salary", "sick-leave", "vacation-pay", "severance-pay"]} />
    </View>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: colors.n760 }}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  gridBtn: { flexBasis: "47%", flexGrow: 1, alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingVertical: 10 },
  hero: { borderRadius: 16, padding: 18, marginTop: 16, alignItems: "center" },
  heroLabel: { color: "#ffffffd9", fontSize: 12 },
  heroValue: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 2 },
  heroSub: { color: "#ffffffcc", fontSize: 11, marginTop: 2 },
  cardRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  miniCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center" },
  step: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  stepHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepBox: { marginLeft: 32, borderRadius: 8, padding: 10 },
  topLine: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4, marginTop: 2 },
  breakdown: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 16 },
  bar: { flexDirection: "row", height: 22, borderRadius: 11, overflow: "hidden" },
});
