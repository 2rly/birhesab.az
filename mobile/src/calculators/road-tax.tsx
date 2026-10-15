import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";

type VehicleType = "petrol-diesel" | "hybrid" | "electric";

const VEHICLE_TYPES: { value: VehicleType; label: string; icon: string }[] = [
  { value: "petrol-diesel", label: "Benzin / Dizel", icon: "⛽" },
  { value: "hybrid", label: "Hibrid", icon: "🔋" },
  { value: "electric", label: "Elektrik", icon: "⚡" },
];

const taxBrackets = [
  { min: 0, max: 1500, tax: 10, label: "1500 sm³-dək" },
  { min: 1501, max: 2000, tax: 20, label: "1501–2000 sm³" },
  { min: 2001, max: 2500, tax: 30, label: "2001–2500 sm³" },
  { min: 2501, max: 3000, tax: 50, label: "2501–3000 sm³" },
  { min: 3001, max: 3500, tax: 75, label: "3001–3500 sm³" },
  { min: 3501, max: 4000, tax: 100, label: "3501–4000 sm³" },
  { min: 4001, max: 4500, tax: 150, label: "4001–4500 sm³" },
  { min: 4501, max: 99999, tax: 200, label: "4500+ sm³" },
];

function getRoadTax(engineCc: number): number {
  const bracket = taxBrackets.find((b) => engineCc >= b.min && engineCc <= b.max);
  return bracket ? bracket.tax : 200;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const FORMULA_TITLE = "Yol vergisi necə hesablanır?";
const FORMULA_CONTENT = `Azərbaycanda illik yol vergisi mühərrik həcminə (sm³) görə müəyyən olunur:

• 1500 sm³-dək: 10 AZN
• 1501–2000 sm³: 20 AZN
• 2001–2500 sm³: 30 AZN
• 2501–3000 sm³: 50 AZN
• 3001–3500 sm³: 75 AZN
• 3501–4000 sm³: 100 AZN
• 4001–4500 sm³: 150 AZN
• 4500+ sm³: 200 AZN

Hibrid avtomobillər: mühərrik həcminin 70%-i əsas götürülür.
Elektrik avtomobilləri: yol vergisindən azaddır.

Yol vergisi hər il ödənilir və texniki baxışdan keçmək üçün tələb olunur.`;

const GREEN = "#16a34a";
const BLUE = "#3b82f6";
const AMBER = "#f59e0b";

type Result =
  | { tax: number; isExempt: true; engineCc: number; effectiveCc?: undefined }
  | { tax: number; isExempt: false; engineCc: number; effectiveCc: number; bracket: string };

export function RoadTaxCalculator() {
  const { colors } = useTheme();
  const [vehicleType, setVehicleType] = useState<VehicleType>("petrol-diesel");
  const [engineCc, setEngineCc] = useState("");

  const result = useMemo<Result | null>(() => {
    if (vehicleType === "electric") return { tax: 0, isExempt: true, engineCc: 0 };
    const cc = parseInt(engineCc);
    if (!cc || cc <= 0) return null;
    const effectiveCc = vehicleType === "hybrid" ? Math.round(cc * 0.7) : cc;
    const tax = getRoadTax(effectiveCc);
    const bracket = taxBrackets.find((b) => effectiveCc >= b.min && effectiveCc <= b.max);
    return { tax, isExempt: false, engineCc: cc, effectiveCc, bracket: bracket?.label || "" };
  }, [vehicleType, engineCc]);

  const maxTax = 200;

  return (
    <View>
      {/* Avtomobil növü */}
      <Text style={[styles.groupLabel, { color: colors.n700 }]}>Avtomobil növü</Text>
      <View style={styles.grid}>
        {VEHICLE_TYPES.map((vt) => {
          const active = vehicleType === vt.value;
          return (
            <Pressable
              key={vt.value}
              onPress={() => setVehicleType(vt.value)}
              style={[
                styles.tile,
                {
                  backgroundColor: active ? colors.accent + "22" : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={styles.tileIcon}>{vt.icon}</Text>
              <Text style={[styles.tileText, { color: colors.n940 }]}>{vt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {vehicleType !== "electric" && (
        <InputField
          label="🔧 Mühərrik həcmi (sm³)"
          value={engineCc}
          onChangeText={setEngineCc}
          placeholder="1600"
          keyboardType="number-pad"
          suffix="sm³"
          maxLength={5}
          hint={vehicleType === "hybrid" ? "Hibrid: effektiv həcm = mühərrik həcmi x 70%" : undefined}
        />
      )}

      {result ? (
        <View>
          {result.isExempt ? (
            <View style={[styles.exempt, { backgroundColor: GREEN + "1a", borderColor: GREEN + "66" }]}>
              <Text style={styles.exemptIcon}>✅</Text>
              <Text style={[styles.exemptTitle, { color: GREEN }]}>Yol vergisindən azad!</Text>
              <Text style={[styles.exemptDesc, { color: colors.n760 }]}>
                Elektrik avtomobilləri Azərbaycanda yol vergisindən azaddır.
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.hero, { backgroundColor: colors.accent }]}>
                <Text style={[styles.heroLabel, { color: colors.onAccent }]}>İllik yol vergisi</Text>
                <Text style={[styles.heroValue, { color: colors.onAccent }]}>{fmt(result.tax)}</Text>
                <Text style={[styles.heroSub, { color: colors.onAccent }]}>AZN / il</Text>
              </View>
              <View style={styles.cardRow}>
                <MiniCard label="Mühərrik həcmi" value={String(result.engineCc)} sub="sm³" color={colors.n940} bg={colors.n200} border={colors.n280} />
                {vehicleType === "hybrid" && !!result.effectiveCc && (
                  <MiniCard label="Effektiv həcm (70%)" value={String(result.effectiveCc)} sub="sm³" color={BLUE} bg={BLUE + "1a"} border={BLUE + "66"} />
                )}
                <MiniCard label="Aylıq ekvivalent" value={fmt(result.tax / 12)} sub="AZN / ay" color={AMBER} bg={AMBER + "1a"} border={AMBER + "66"} />
              </View>
              {vehicleType === "hybrid" && !!result.effectiveCc && (
                <View style={[styles.badge, { backgroundColor: BLUE + "1a", borderColor: BLUE + "66" }]}>
                  <Text style={[styles.badgeText, { color: BLUE }]}>
                    🔋 Hibrid güzəşti: {result.engineCc} sm³ → {result.effectiveCc} sm³ (70%)
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Vergi pilləsi cədvəli */}
          <View style={[styles.table, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <View style={[styles.tableHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={[styles.tableTitle, { color: colors.n940 }]}>📊 Vergi pilləsi cədvəli</Text>
            </View>
            {taxBrackets.map((bracket) => {
              const isActive =
                !result.isExempt && result.effectiveCc
                  ? result.effectiveCc >= bracket.min && result.effectiveCc <= bracket.max
                  : !result.isExempt && result.engineCc >= bracket.min && result.engineCc <= bracket.max;
              return (
                <View
                  key={bracket.label}
                  style={[
                    styles.bracketRow,
                    { borderBottomColor: colors.n240 },
                    isActive && { backgroundColor: colors.accent + "22" },
                  ]}
                >
                  <Text style={[styles.bracketLabel, { color: isActive ? colors.accent : colors.n940 }, isActive && { fontWeight: "700" }]}>
                    {bracket.label}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.n240 }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${(bracket.tax / maxTax) * 100}%`, backgroundColor: isActive ? colors.accent : colors.n340 },
                      ]}
                    />
                  </View>
                  <Text style={[styles.bracketTax, { color: isActive ? colors.accent : colors.n940 }, isActive && { fontWeight: "800" }]}>
                    {bracket.tax} AZN
                  </Text>
                </View>
              );
            })}
          </View>

          <InfoBox variant="info" title="Diqqət:">
            Yol vergisi hər il ödənilir və texniki baxışdan keçmək üçün zəruridir. Vergini onlayn (e-gov.az) və ya bank
            vasitəsilə ödəmək mümkündür. Gecikdirmə halında cərimə tətbiq oluna bilər.
          </InfoBox>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>Nəticəni görmək üçün mühərrik həcmini daxil edin.</Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["car-customs", "osago", "fuel-cost", "car-loan"]} />
    </View>
  );
}

function MiniCard({ label, value, sub, color, bg, border }: { label: string; value: string; sub: string; color: string; bg: string; border: string }) {
  return (
    <View style={[styles.miniCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.miniLabel, { color }]}>{label}</Text>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={[styles.miniSub, { color }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  grid: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tile: { flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6, alignItems: "center" },
  tileIcon: { fontSize: 22, marginBottom: 4 },
  tileText: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  exempt: { borderRadius: 16, borderWidth: 1, padding: 18, alignItems: "center", marginTop: 8 },
  exemptIcon: { fontSize: 36, marginBottom: 6 },
  exemptTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  exemptDesc: { fontSize: 13, textAlign: "center" },
  hero: { borderRadius: 16, padding: 18, marginTop: 8, alignItems: "center" },
  heroLabel: { fontSize: 13, fontWeight: "600", opacity: 0.85 },
  heroValue: { fontSize: 30, fontWeight: "800", marginTop: 4 },
  heroSub: { fontSize: 12, marginTop: 4, opacity: 0.85 },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  miniCard: { flexGrow: 1, flexBasis: "30%", borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center" },
  miniLabel: { fontSize: 12, marginBottom: 4, textAlign: "center" },
  miniValue: { fontSize: 20, fontWeight: "800" },
  miniSub: { fontSize: 11, marginTop: 4 },
  badge: { alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  table: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 16 },
  tableHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  tableTitle: { fontSize: 14, fontWeight: "700" },
  bracketRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  bracketLabel: { flex: 1, fontSize: 13 },
  barTrack: { width: 80, height: 10, borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
  bracketTax: { width: 64, textAlign: "right", fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
