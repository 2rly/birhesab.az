import { useState, useMemo, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { ChipGroup, Checkbox } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";

// ============================================================
// Azərbaycan kommunal xidmət tarifləri (2025)
// Tarif (Qiymət) Şurasının 29.12.2024 tarixli qərarı
// Qüvvəyə minmə: 02.01.2025
// ============================================================

// ── ELEKTRİK ──────────────────────────────────────────────────
const ELECTRICITY_TIERS = [
  { limit: 200, rate: 0.084, label: "0–200 kVt·saat", oldRate: 0.08 },
  { limit: 100, rate: 0.1, label: "201–300 kVt·saat", oldRate: 0.09 },
  { limit: Infinity, rate: 0.15, label: "300+ kVt·saat", oldRate: 0.13 },
];
const ELECTRICITY_SERVICE_FEE = 1.0;

// ── QAZ ───────────────────────────────────────────────────────
const GAS_TIERS = [
  { yearLimit: 1200, rate: 0.12, label: "0–1200 m³/il" },
  { yearLimit: 2500, rate: 0.2, label: "1200–2500 m³/il" },
  { yearLimit: Infinity, rate: 0.25, label: "2500+ m³/il" },
];
const GAS_SERVICE_FEE = 1.0;

// ── SU ────────────────────────────────────────────────────────
const WATER_BAKU = 0.7;
const WATER_OTHER = 0.6;
const WASTEWATER = 0.3;

// ── İSTİLİK ───────────────────────────────────────────────────
const HEATING_RATE = 0.04;

type ActiveTab = "all" | "electricity" | "gas" | "water";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function calcElectricity(kwh: number) {
  let remaining = kwh;
  const breakdown: { label: string; kwh: number; rate: number; cost: number }[] = [];
  let subtotal = 0;
  for (const tier of ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    const used = Math.min(remaining, tier.limit);
    const cost = used * tier.rate;
    breakdown.push({ label: tier.label, kwh: used, rate: tier.rate, cost });
    subtotal += cost;
    remaining -= used;
  }
  const serviceFee = kwh > 0 ? ELECTRICITY_SERVICE_FEE : 0;
  return { subtotal, serviceFee, total: subtotal + serviceFee, breakdown };
}

function calcGas(monthlyM3: number, prevYearlyM3: number) {
  const breakdown: { label: string; m3: number; rate: number; cost: number }[] = [];
  let subtotal = 0;
  let remaining = monthlyM3;
  let cumulative = prevYearlyM3;

  for (const tier of GAS_TIERS) {
    if (remaining <= 0) break;
    const tierCeiling = tier.yearLimit;
    const spaceInTier = Math.max(0, tierCeiling - cumulative);
    if (spaceInTier <= 0) {
      continue;
    }
    const used = Math.min(remaining, spaceInTier);
    const cost = used * tier.rate;
    breakdown.push({ label: tier.label, m3: used, rate: tier.rate, cost });
    subtotal += cost;
    remaining -= used;
    cumulative += used;
  }
  if (remaining > 0) {
    const lastTier = GAS_TIERS[GAS_TIERS.length - 1];
    const cost = remaining * lastTier.rate;
    const existing = breakdown.find((b) => b.label === lastTier.label);
    if (existing) {
      existing.m3 += remaining;
      existing.cost += cost;
    } else {
      breakdown.push({ label: lastTier.label, m3: remaining, rate: lastTier.rate, cost });
    }
    subtotal += cost;
  }

  const serviceFee = monthlyM3 > 0 ? GAS_SERVICE_FEE : 0;
  return {
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
    breakdown,
    newYearlyCumulative: prevYearlyM3 + monthlyM3,
  };
}

const pt = {
  formulaTitle: "2025-ci il kommunal tarifləri",
  formulaContent: `Elektrik enerjisi (02.01.2025-dən, ƏDV daxil):
• 0–200 kVt·saat: 8,4 qəpik (əvvəl 8 qəpik)
• 201–300 kVt·saat: 10 qəpik (əvvəl 9 qəpik)
• 300+ kVt·saat: 15 qəpik (əvvəl 13 qəpik)
• Sabit aylıq xidmət haqqı: 1,00 AZN

Nümunə: 350 kVt·saat istehlak
İlk 200 kVt × 0,084 = 16,80 AZN
Növbəti 100 kVt × 0,10 = 10,00 AZN
Qalan 50 kVt × 0,15 = 7,50 AZN
Xidmət haqqı = 1,00 AZN
Yekun = 35,30 AZN

Təbii qaz (Azəriqaz, illik kumulyativ):
• 0–1200 m³/il: 12 qəpik
• 1200–2500 m³/il: 20 qəpik
• 2500+ m³/il: 25 qəpik
• Sabit aylıq xidmət haqqı: 1,00 AZN
Sayğac yanvar 1-də sıfırlanır.

Nümunə: İl boyu 1150 m³ işlətmisiniz, dekabrda 100 m³:
Limitə qalan 50 m³ × 0,12 = 6,00 AZN
Limiti keçən 50 m³ × 0,20 = 10,00 AZN
Xidmət haqqı = 1,00 AZN
Yekun = 17,00 AZN

Su təchizatı:
• Bakı, Sumqayıt, Xırdalan, Abşeron: 0,70 AZN/m³
• Digər ərazilər: 0,60 AZN/m³
• Tullantı sularının axıdılması: 0,30 AZN/m³

İstilik: 0,04 AZN/m² (noyabr–mart)`,
  tabAll: "Hamısı",
  tabElectricity: "İşıq",
  tabGas: "Qaz",
  tabWater: "Su",
  electricity: "Elektrik enerjisi",
  tariff2025: "2025 tarif",
  monthlyConsumption: "Aylıq istehlak (kVt·saat)",
  calcMethod: "Hesablama qaydası",
  receipt: "qəbz",
  monthlyConsumptionLabel: "Aylıq istehlak:",
  tariffPerKwh: "Tarif: hər kVt·saat üçün",
  qepik: "qəpik",
  tierLimitFull: "bu pillənin limiti doldu",
  ofEnergyFee: "Enerji haqqının",
  fixedServiceFee: "Sabit aylıq xidmət haqqı",
  fixedServiceFeeDesc: "Hər ay sabit olaraq tutulur (sayğac xidməti)",
  energyFee: "Enerji haqqı",
  serviceFee: "Xidmət haqqı",
  totalPayment: "Yekun ödəniş",
  tier1Only: "Yalnız 1-ci pillədəsiniz — ən ucuz tarif ilə hesablanır!",
  tier2Warning: "2-ci pilləyə keçmisiniz — 200 kVt-dan sonrakı hissə 19% baha hesablanır.",
  tier3Warning: "3-cü pilləyə keçmisiniz — 300 kVt-dan sonrakı hissə 50% baha hesablanır!",
  naturalGas: "Təbii qaz (Azəriqaz)",
  tariff2026: "2026 tarif",
  thisMonthConsumption: "Bu ayki istehlak (m³)",
  yearToDate: "İlin əvvəlindən bəri cəmi (m³)",
  yearToDateHint: "Sayğac yanvardan bu aya qədər nə qədər göstərir? (Bu ay daxil deyil)",
  annualConsumption: "İllik istehlak:",
  tier1: "1-ci pillə",
  tier2: "2-ci pillə",
  tier3: "3-cü pillə",
  thisMonthConsumptionLabel: "Bu ayki istehlak:",
  annualTotal: "İllik cəmi:",
  yearUsedSoFar: "İlin əvvəlindən {amount} m³ işlətmisiniz",
  tier1Remaining: "1-ci pillə limitinə {amount} m³ qalıb",
  tier2Remaining: "2-ci pillə limitinə {amount} m³ qalıb",
  alreadyTier3: "artıq 3-cü pillədəsiniz",
  tariffPerM3: "Tarif: hər m³ üçün",
  ofGasFee: "Qaz haqqının",
  fixedServiceFeeGas: "Sabit aylıq xidmət haqqı",
  fixedServiceFeeGasDesc: "Hər ay sabit olaraq tutulur (abonent xidməti)",
  gasFee: "Qaz haqqı",
  gasTier1Only: "Yalnız 1-ci pillədəsiniz (12 qəpik) — ən ucuz tarif!",
  gasTier2Warning:
    "Diqqət: 1200 m³ illik limiti keçmisiniz — artıq hissə 20 qəpikdən hesablanır (67% baha).",
  gasTier3Warning: "Diqqət: 2500 m³ illik limiti keçmisiniz — artıq hissə 25 qəpikdən hesablanır!",
  waterSupply: "Su təchizatı",
  bakuRegion: "Bakı / Sumqayıt / Abşeron (0,70)",
  otherRegion: "Digər ərazilər (0,60)",
  coldWater: "Soyuq su (m³/ay)",
  hotWater: "İsti su (m³/ay)",
  coldWaterLabel: "Soyuq su",
  sewage: "Kanalizasiya",
  hotWaterLabel: "İsti su",
  apartmentArea: "Mənzilin sahəsi (m²)",
  centralHeating: "Mərkəzi istilik (noyabr–mart, 0,04 AZN/m²)",
  monthlyUtility: "Aylıq kommunal xərc",
  perMonth: "AZN / ay",
  annual: "İllik:",
  electricityLabel: "Elektrik",
  gasLabel: "Qaz",
  waterLabel: "Su",
  heatingLabel: "İstilik",
  costStructure: "Xərcin strukturu",
  savingTips: "Qənaət məsləhətləri",
  tip1: "Elektrik: 200 kVt·saat limitində qalın — sonrakı pillədə tarif 19% artır",
  tip2: "Qaz: Aylıq 100 m³-dən az istifadə edin — sonrakı pillədə tarif 76% artır",
  tip3: "LED lampalar adi lampalara nisbətən 80% az enerji sərf edir",
  tip4: "Qazanın temperaturunu 1°C azaltmaq ~6% qənaət edir",
  tip5: "Su sayğacı quraşdırın — normativ istehlakdan 30-40% az ödəyərsiniz",
  emptyState: "Nəticəni görmək üçün istehlak məlumatlarını daxil edin.",
};

const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const CYAN = "#06b6d4";
const ORANGE = "#f97316";
const GREEN = "#22c55e";
const RED = "#ef4444";

function TierBadge({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "33" }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={[styles.barTrack, { backgroundColor: color + "26" }]}>
      <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }]} />
    </View>
  );
}

function PresetButtons({
  values,
  unit,
  color,
  onPick,
}: {
  values: number[];
  unit: string;
  color: string;
  onPick: (v: string) => void;
}) {
  return (
    <View style={styles.presets}>
      {values.map((v) => (
        <Pressable
          key={v}
          onPress={() => onPick(String(v))}
          style={[styles.preset, { backgroundColor: color + "26" }]}
        >
          <Text style={[styles.presetText, { color }]}>
            {v} {unit}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Panel({
  icon,
  title,
  tag,
  color,
  children,
}: {
  icon: string;
  title: string;
  tag?: string;
  color: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: color + "12", borderColor: color + "55" }]}>
      <View style={styles.panelHead}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
        <Text style={[styles.panelTitle, { color: colors.n940 }]}>{title}</Text>
        {tag && (
          <View style={[styles.tag, { backgroundColor: color + "26" }]}>
            <Text style={[styles.tagText, { color }]}>{tag}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

function Receipt({
  color,
  headerLines,
  notice,
  rows,
  feeTitle,
  feeDesc,
  fee,
  subLabel,
  subtotal,
  total,
  footer,
}: {
  color: string;
  headerLines: ReactNode;
  notice?: string;
  rows: {
    key: string;
    badge: string;
    badgeColor: string;
    label: string;
    cost: number;
    formula: string;
    tariff: ReactNode;
    pct: number;
    pctLabel: string;
  }[];
  feeTitle: string;
  feeDesc: string;
  fee: number;
  subLabel: string;
  subtotal: number;
  total: number;
  footer: { text: string; color: string }[];
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.receipt, { borderColor: color + "55", backgroundColor: colors.n200 }]}>
      <View style={[styles.receiptHead, { backgroundColor: color + "26", borderBottomColor: color + "55" }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.receiptTitle, { color: colors.n940 }]}>{pt.calcMethod}</Text>
          <View style={[styles.tag, { backgroundColor: color + "1a" }]}>
            <Text style={[styles.tagText, { color }]}>{pt.receipt}</Text>
          </View>
        </View>
        <Text style={[styles.small, { color: colors.n760, marginTop: 4 }]}>{headerLines}</Text>
      </View>
      {notice && (
        <View style={[styles.notice, { backgroundColor: color + "14", borderBottomColor: colors.n240 }]}>
          <Text style={[styles.small, { color: colors.n760 }]}>{notice}</Text>
        </View>
      )}
      {rows.map((r) => (
        <View key={r.key} style={[styles.tierRow, { borderBottomColor: colors.n240 }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowCenter}>
              <TierBadge text={r.badge} color={r.badgeColor} />
              <Text style={[styles.tierLabel, { color: colors.n940 }]}>{r.label}</Text>
            </View>
            <Text style={[styles.tierCost, { color }]}>{fmt(r.cost)} AZN</Text>
          </View>
          <View style={{ marginLeft: 28 }}>
            <Text style={[styles.small, { color: colors.n940 }]}>{r.formula}</Text>
            <Text style={[styles.tiny, { color: colors.n580 }]}>{r.tariff}</Text>
            <Bar pct={r.pct} color={color} />
            <Text style={[styles.tiny, { color: colors.n580 }]}>
              {r.pctLabel} {r.pct.toFixed(0)}%
            </Text>
          </View>
        </View>
      ))}
      <View style={[styles.tierRow, { borderBottomColor: colors.n240 }]}>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <TierBadge text="+" color={colors.n580} />
            <Text style={[styles.tierLabel, { color: colors.n940 }]}>{feeTitle}</Text>
          </View>
          <Text style={[styles.tierCost, { color }]}>{fmt(fee)} AZN</Text>
        </View>
        <Text style={[styles.small, { color: colors.n580, marginLeft: 28 }]}>{feeDesc}</Text>
      </View>
      <View style={[styles.totals, { backgroundColor: color + "12" }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.small, { color: colors.n580 }]}>{subLabel}</Text>
          <Text style={[styles.small, { color: colors.n580 }]}>{fmt(subtotal)} AZN</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={[styles.small, { color: colors.n580 }]}>{pt.serviceFee}</Text>
          <Text style={[styles.small, { color: colors.n580 }]}>{fmt(fee)} AZN</Text>
        </View>
        <View style={[styles.rowBetween, styles.totalLine, { borderTopColor: color + "55" }]}>
          <Text style={[styles.totalLabel, { color: colors.n940 }]}>{pt.totalPayment}</Text>
          <Text style={[styles.totalValue, { color }]}>{fmt(total)} AZN</Text>
        </View>
      </View>
      {footer.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.n240 }]}>
          {footer.map((f, i) => (
            <Text key={i} style={[styles.small, { color: f.color }]}>
              {f.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export function KommunalCalculator() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  const [electricityKwh, setElectricityKwh] = useState("");
  const [gasM3, setGasM3] = useState("");
  const [gasPrevYearly, setGasPrevYearly] = useState("0");
  const [isBaku, setIsBaku] = useState(true);
  const [coldWaterM3, setColdWaterM3] = useState("");
  const [hotWaterM3, setHotWaterM3] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [includeHeating, setIncludeHeating] = useState(false);

  const num = (s: string) => parseFloat(s.replace(",", ".")) || 0;

  const result = useMemo(() => {
    const elKwh = num(electricityKwh);
    const gM3 = num(gasM3);
    const cwM3 = num(coldWaterM3);
    const hwM3 = num(hotWaterM3);
    const area = num(areaM2);

    const electricity = calcElectricity(elKwh);
    const prevYearly = num(gasPrevYearly);
    const gas = calcGas(gM3, prevYearly);

    const waterRate = isBaku ? WATER_BAKU : WATER_OTHER;
    const coldWater = cwM3 * waterRate;
    const wastewater = cwM3 * WASTEWATER;
    const hotWater = hwM3 * 2.2;
    const waterTotal = coldWater + wastewater + hotWater;

    const heating = includeHeating ? area * HEATING_RATE : 0;
    const total = electricity.total + gas.total + waterTotal + heating;

    return {
      electricity,
      gas,
      coldWater,
      wastewater,
      hotWater,
      waterTotal,
      waterRate,
      heating,
      total,
      elKwh,
      gM3,
      cwM3,
      hwM3,
      area,
      prevYearly,
    };
  }, [electricityKwh, gasM3, gasPrevYearly, coldWaterM3, hotWaterM3, areaM2, includeHeating, isBaku]);

  const hasAnyInput = result.elKwh > 0 || result.gM3 > 0 || result.cwM3 > 0 || result.hwM3 > 0;

  const tabs: { value: ActiveTab; label: string }[] = [
    { value: "all", label: `📋 ${pt.tabAll}` },
    { value: "electricity", label: `💡 ${pt.tabElectricity}` },
    { value: "gas", label: `🔥 ${pt.tabGas}` },
    { value: "water", label: `💧 ${pt.tabWater}` },
  ];

  const el = result.electricity;
  const g = result.gas;
  const prevYearly = result.prevYearly;
  const newTotal = prevYearly + result.gM3;

  const tierColor = (i: number) => (i === 0 ? GREEN : i === 1 ? AMBER : RED);

  return (
    <View>
      <ChipGroup options={tabs} selected={activeTab} onSelect={setActiveTab} />
      <View style={{ height: 16 }} />

      {/* ELEKTRİK */}
      {(activeTab === "all" || activeTab === "electricity") && (
        <Panel icon="💡" title={pt.electricity} tag={pt.tariff2025} color={AMBER}>
          <InputField
            label={pt.monthlyConsumption}
            value={electricityKwh}
            onChangeText={setElectricityKwh}
            placeholder="350"
            keyboardType="decimal-pad"
          />
          <PresetButtons values={[100, 200, 300, 500]} unit="kVt" color={AMBER} onPick={setElectricityKwh} />

          {el.subtotal > 0 && (
            <Receipt
              color={AMBER}
              headerLines={
                <>
                  {pt.monthlyConsumptionLabel}{" "}
                  <Text style={{ fontWeight: "700" }}>{result.elKwh} kVt·saat</Text>
                </>
              }
              rows={el.breakdown.map((b, i) => {
                const pct = el.subtotal > 0 ? (b.cost / el.subtotal) * 100 : 0;
                const tierFull =
                  b.kwh >= (ELECTRICITY_TIERS[i]?.limit ?? 0) && ELECTRICITY_TIERS[i]?.limit !== Infinity;
                return {
                  key: b.label,
                  badge: String(i + 1),
                  badgeColor: tierColor(i),
                  label: b.label,
                  cost: b.cost,
                  formula: `${b.kwh} kVt·saat × ${b.rate} AZN = ${fmt(b.cost)} AZN`,
                  tariff: (
                    <>
                      {pt.tariffPerKwh} {(b.rate * 100).toFixed(1)} {pt.qepik}
                      {tierFull && <Text style={{ color: AMBER }}> — {pt.tierLimitFull}</Text>}
                    </>
                  ),
                  pct,
                  pctLabel: pt.ofEnergyFee,
                };
              })}
              feeTitle={pt.fixedServiceFee}
              feeDesc={pt.fixedServiceFeeDesc}
              fee={el.serviceFee}
              subLabel={pt.energyFee}
              subtotal={el.subtotal}
              total={el.total}
              footer={[
                ...(el.breakdown.length === 1 ? [{ text: pt.tier1Only, color: GREEN }] : []),
                ...(el.breakdown.length === 2 ? [{ text: pt.tier2Warning, color: AMBER }] : []),
                ...(el.breakdown.length >= 3 ? [{ text: pt.tier3Warning, color: RED }] : []),
              ]}
            />
          )}
        </Panel>
      )}

      {/* QAZ */}
      {(activeTab === "all" || activeTab === "gas") && (
        <Panel icon="🔥" title={pt.naturalGas} tag={pt.tariff2026} color={BLUE}>
          <InputField
            label={pt.thisMonthConsumption}
            value={gasM3}
            onChangeText={setGasM3}
            placeholder="300"
            keyboardType="decimal-pad"
          />
          <PresetButtons values={[50, 150, 300, 500]} unit="m³" color={BLUE} onPick={setGasM3} />
          <InputField
            label={pt.yearToDate}
            value={gasPrevYearly}
            onChangeText={setGasPrevYearly}
            placeholder="0"
            keyboardType="decimal-pad"
            hint={pt.yearToDateHint}
          />

          {/* İllik istehlak göstəricisi */}
          <View style={[styles.yearBox, { backgroundColor: colors.n200, borderColor: BLUE + "55" }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.small, { color: colors.n580, flex: 1 }]}>
                {pt.annualConsumption} {Math.round(newTotal)} m³ / 2500 m³
              </Text>
              <Text style={[styles.small, { color: colors.n580 }]}>
                {newTotal <= 1200 ? pt.tier1 : newTotal <= 2500 ? pt.tier2 : pt.tier3}
              </Text>
            </View>
            <View style={[styles.stackTrack, { backgroundColor: colors.n240 }]}>
              <View
                style={{
                  height: "100%",
                  backgroundColor: "#4ade80",
                  width: `${Math.min((Math.min(newTotal, 1200) / 2500) * 100, 48)}%`,
                }}
              />
              {newTotal > 1200 && (
                <View
                  style={{
                    height: "100%",
                    backgroundColor: "#fbbf24",
                    width: `${Math.min(((Math.min(newTotal, 2500) - 1200) / 2500) * 100, 52)}%`,
                  }}
                />
              )}
              {newTotal > 2500 && <View style={{ height: "100%", backgroundColor: "#f87171", width: "2%" }} />}
            </View>
            <View style={styles.rowBetween}>
              <Text style={[styles.tiny, { color: colors.n580 }]}>0</Text>
              <Text
                style={[
                  styles.tiny,
                  { color: newTotal > 1200 ? AMBER : colors.n580, fontWeight: newTotal > 1200 ? "600" : "400" },
                ]}
              >
                1200 m³
              </Text>
              <Text
                style={[
                  styles.tiny,
                  { color: newTotal > 2500 ? RED : colors.n580, fontWeight: newTotal > 2500 ? "600" : "400" },
                ]}
              >
                2500 m³
              </Text>
            </View>
          </View>

          {g.subtotal > 0 && (
            <Receipt
              color={BLUE}
              headerLines={
                <>
                  {pt.thisMonthConsumptionLabel} <Text style={{ fontWeight: "700" }}>{result.gM3} m³</Text>
                  {prevYearly > 0 &&
                    `  | ${pt.annualTotal} ${prevYearly} + ${result.gM3} = ${g.newYearlyCumulative} m³`}
                </>
              }
              notice={
                prevYearly > 0
                  ? pt.yearUsedSoFar.replace("{amount}", String(prevYearly)) +
                    (prevYearly < 1200
                      ? ` — ${pt.tier1Remaining.replace("{amount}", String(1200 - prevYearly))}`
                      : prevYearly < 2500
                        ? ` — ${pt.tier2Remaining.replace("{amount}", String(2500 - prevYearly))}`
                        : ` — ${pt.alreadyTier3}`)
                  : undefined
              }
              rows={g.breakdown.map((b) => {
                const pct = g.subtotal > 0 ? (b.cost / g.subtotal) * 100 : 0;
                const idx = b.rate === 0.12 ? 0 : b.rate === 0.2 ? 1 : 2;
                return {
                  key: b.label,
                  badge: String(idx + 1),
                  badgeColor: tierColor(idx),
                  label: b.label,
                  cost: b.cost,
                  formula: `${b.m3} m³ × ${b.rate} AZN = ${fmt(b.cost)} AZN`,
                  tariff: `${pt.tariffPerM3} ${(b.rate * 100).toFixed(0)} ${pt.qepik}`,
                  pct,
                  pctLabel: pt.ofGasFee,
                };
              })}
              feeTitle={pt.fixedServiceFeeGas}
              feeDesc={pt.fixedServiceFeeGasDesc}
              fee={g.serviceFee}
              subLabel={pt.gasFee}
              subtotal={g.subtotal}
              total={g.total}
              footer={[
                ...(g.breakdown.length === 1 && g.breakdown[0].rate === 0.12
                  ? [{ text: pt.gasTier1Only, color: GREEN }]
                  : []),
                ...(g.breakdown.some((b) => b.rate === 0.2) ? [{ text: pt.gasTier2Warning, color: AMBER }] : []),
                ...(g.breakdown.some((b) => b.rate === 0.25) ? [{ text: pt.gasTier3Warning, color: RED }] : []),
              ]}
            />
          )}
        </Panel>
      )}

      {/* SU */}
      {(activeTab === "all" || activeTab === "water") && (
        <Panel icon="💧" title={pt.waterSupply} color={CYAN}>
          <SegmentControl
            options={[
              { value: "baku", label: pt.bakuRegion },
              { value: "other", label: pt.otherRegion },
            ]}
            selected={isBaku ? "baku" : "other"}
            onSelect={(v) => setIsBaku(v === "baku")}
          />
          <InputField
            label={pt.coldWater}
            value={coldWaterM3}
            onChangeText={setColdWaterM3}
            placeholder="8"
            keyboardType="decimal-pad"
          />
          <InputField
            label={pt.hotWater}
            value={hotWaterM3}
            onChangeText={setHotWaterM3}
            placeholder="3"
            keyboardType="decimal-pad"
          />

          <View style={[styles.waterBox, { backgroundColor: colors.n200, borderColor: CYAN + "55" }]}>
            <View style={[styles.waterRow, { borderBottomColor: colors.n240 }]}>
              <Text style={[styles.waterLabel, { color: colors.n940 }]}>
                {pt.coldWaterLabel} ({result.cwM3} m³ × {result.waterRate} AZN)
              </Text>
              <Text style={[styles.waterValue, { color: CYAN }]}>{fmt(result.coldWater)} AZN</Text>
            </View>
            {result.cwM3 > 0 && (
              <View style={[styles.waterRow, { borderBottomColor: colors.n240 }]}>
                <Text style={[styles.waterLabel, { color: colors.n940 }]}>
                  {pt.sewage} ({result.cwM3} m³ × {WASTEWATER} AZN)
                </Text>
                <Text style={[styles.waterValue, { color: CYAN }]}>{fmt(result.wastewater)} AZN</Text>
              </View>
            )}
            {result.hwM3 > 0 && (
              <View style={[styles.waterRow, { borderBottomColor: colors.n240 }]}>
                <Text style={[styles.waterLabel, { color: colors.n940 }]}>
                  {pt.hotWaterLabel} ({result.hwM3} m³ × 2,20 AZN)
                </Text>
                <Text style={[styles.waterValue, { color: CYAN }]}>{fmt(result.hotWater)} AZN</Text>
              </View>
            )}
          </View>

          {result.waterTotal > 0 && (
            <Text style={[styles.waterTotal, { color: CYAN }]}>{fmt(result.waterTotal)} AZN</Text>
          )}
        </Panel>
      )}

      {/* İSTİLİK */}
      {activeTab === "all" && (
        <View style={[styles.panel, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
          <InputField
            label={`🏠 ${pt.apartmentArea}`}
            value={areaM2}
            onChangeText={setAreaM2}
            placeholder="80"
            keyboardType="decimal-pad"
          />
          <Checkbox label={pt.centralHeating} checked={includeHeating} onChange={setIncludeHeating} />
        </View>
      )}

      {/* NƏTİCƏLƏR */}
      {hasAnyInput ? (
        <View style={{ gap: 14 }}>
          <View style={[styles.hero, { backgroundColor: colors.accent }]}>
            <Text style={[styles.heroLabel, { color: colors.onAccent }]}>{pt.monthlyUtility}</Text>
            <Text style={[styles.heroValue, { color: colors.onAccent }]}>{fmt(result.total)}</Text>
            <Text style={[styles.heroLabel, { color: colors.onAccent }]}>{pt.perMonth}</Text>
            <Text style={[styles.heroSmall, { color: colors.onAccent }]}>
              {pt.annual} {fmt(result.total * 12)} AZN
            </Text>
          </View>

          <View style={styles.statGrid}>
            {result.electricity.total > 0 && (
              <StatCard icon="💡" label={pt.electricityLabel} value={fmt(result.electricity.total)} color={AMBER} />
            )}
            {result.gas.total > 0 && (
              <StatCard icon="🔥" label={pt.gasLabel} value={fmt(result.gas.total)} color={BLUE} />
            )}
            {result.waterTotal > 0 && (
              <StatCard icon="💧" label={pt.waterLabel} value={fmt(result.waterTotal)} color={CYAN} />
            )}
            {result.heating > 0 && (
              <StatCard icon="🏠" label={pt.heatingLabel} value={fmt(result.heating)} color={ORANGE} />
            )}
          </View>

          {result.total > 0 && (
            <View style={[styles.structure, { backgroundColor: colors.n200 }]}>
              <Text style={[styles.small, { color: colors.n580, fontWeight: "600", marginBottom: 10 }]}>
                {pt.costStructure}
              </Text>
              <View style={[styles.structTrack, { backgroundColor: colors.n240 }]}>
                {result.electricity.total > 0 && (
                  <View
                    style={{
                      height: "100%",
                      backgroundColor: "#fbbf24",
                      width: `${(result.electricity.total / result.total) * 100}%`,
                    }}
                  />
                )}
                {result.gas.total > 0 && (
                  <View
                    style={{
                      height: "100%",
                      backgroundColor: "#60a5fa",
                      width: `${(result.gas.total / result.total) * 100}%`,
                    }}
                  />
                )}
                {result.waterTotal > 0 && (
                  <View
                    style={{
                      height: "100%",
                      backgroundColor: "#22d3ee",
                      width: `${(result.waterTotal / result.total) * 100}%`,
                    }}
                  />
                )}
                {result.heating > 0 && (
                  <View
                    style={{
                      height: "100%",
                      backgroundColor: "#fb923c",
                      width: `${(result.heating / result.total) * 100}%`,
                    }}
                  />
                )}
              </View>
              <View style={styles.legend}>
                {result.electricity.total > 0 && (
                  <Legend
                    color="#fbbf24"
                    text={`${pt.electricityLabel}: ${fmt(result.electricity.total)} (${(
                      (result.electricity.total / result.total) *
                      100
                    ).toFixed(0)}%)`}
                  />
                )}
                {result.gas.total > 0 && (
                  <Legend
                    color="#60a5fa"
                    text={`${pt.gasLabel}: ${fmt(result.gas.total)} (${((result.gas.total / result.total) * 100).toFixed(0)}%)`}
                  />
                )}
                {result.waterTotal > 0 && (
                  <Legend
                    color="#22d3ee"
                    text={`${pt.waterLabel}: ${fmt(result.waterTotal)} (${((result.waterTotal / result.total) * 100).toFixed(0)}%)`}
                  />
                )}
              </View>
            </View>
          )}

          <View style={[styles.tips, { backgroundColor: GREEN + "14", borderColor: GREEN + "55" }]}>
            <Text style={[styles.tipsTitle, { color: colors.n940 }]}>💡 {pt.savingTips}</Text>
            {[pt.tip1, pt.tip2, pt.tip3, pt.tip4, pt.tip5].map((t) => (
              <Text key={t} style={[styles.small, { color: colors.n760, marginTop: 4 }]}>
                • {t}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>💡</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyState}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["price-per-sqm", "property-tax", "rental-tax", "deposit"]} />
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: color + "14", borderColor: color + "55" }]}>
      <Text style={{ fontSize: 22, marginBottom: 2 }}>{icon}</Text>
      <Text style={[styles.small, { color }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.rowCenter}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.small, { color: colors.n760 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  panelHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  panelTitle: { fontSize: 15, fontWeight: "700" },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: "600" },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: -8, marginBottom: 14 },
  preset: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  presetText: { fontSize: 12, fontWeight: "600" },
  receipt: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 6 },
  receiptHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  receiptTitle: { fontSize: 14, fontWeight: "700" },
  notice: { paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  tierRow: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 4 },
  tierLabel: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
  tierCost: { fontSize: 14, fontWeight: "700" },
  badge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 10, fontWeight: "800" },
  small: { fontSize: 12, lineHeight: 17 },
  tiny: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  barTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", borderRadius: 3 },
  totals: { paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  totalLine: { borderTopWidth: 1, paddingTop: 6, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "800" },
  footer: { paddingHorizontal: 14, paddingVertical: 8, gap: 2 },
  yearBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6, gap: 6 },
  stackTrack: { height: 12, borderRadius: 6, overflow: "hidden", flexDirection: "row" },
  waterBox: { borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  waterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  waterLabel: { fontSize: 13, flex: 1 },
  waterValue: { fontSize: 13, fontWeight: "600" },
  waterTotal: { fontSize: 18, fontWeight: "800", textAlign: "right", marginTop: 10 },
  hero: { borderRadius: 16, padding: 20, alignItems: "center" },
  heroLabel: { fontSize: 13, opacity: 0.85 },
  heroValue: { fontSize: 36, fontWeight: "800", marginVertical: 2 },
  heroSmall: { fontSize: 12, opacity: 0.75, marginTop: 6 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: { flexBasis: "47%", flexGrow: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  structure: { borderRadius: 12, padding: 14 },
  structTrack: { height: 22, borderRadius: 11, overflow: "hidden", flexDirection: "row" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  tips: { borderRadius: 12, borderWidth: 1, padding: 14 },
  tipsTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
