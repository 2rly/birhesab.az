import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";

type Region = "baku" | "other";
type DriverAge = "under25" | "25plus";
type Experience = "under2" | "2plus";
type AccidentHistory = "clean" | "one" | "multiple";
type EnginePower = "under100" | "100to150" | "150to200" | "over200";

const BASE_RATE_BAKU = 50;
const BASE_RATE_OTHER = 40;

const REGION_OPTIONS: { value: Region; label: string; icon: string }[] = [
  { value: "baku", label: "Bakı", icon: "🏙️" },
  { value: "other", label: "Digər regionlar", icon: "🌄" },
];
const AGE_OPTIONS: { value: DriverAge; label: string }[] = [
  { value: "under25", label: "25 yaşdan kiçik" },
  { value: "25plus", label: "25 yaş və yuxarı" },
];
const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: "under2", label: "2 ildən az" },
  { value: "2plus", label: "2 il və yuxarı" },
];
const ACCIDENT_OPTIONS: { value: AccidentHistory; label: string; icon: string }[] = [
  { value: "clean", label: "Qəzasız", icon: "✅" },
  { value: "one", label: "1 qəza", icon: "⚠️" },
  { value: "multiple", label: "2+ qəza", icon: "🚨" },
];
const ENGINE_POWER_OPTIONS: { value: EnginePower; label: string }[] = [
  { value: "under100", label: "100 a.g.-dək" },
  { value: "100to150", label: "100–150 a.g." },
  { value: "150to200", label: "150–200 a.g." },
  { value: "over200", label: "200+ a.g." },
];

const FORMULA_TITLE = "OSAGO haqqı necə hesablanır?";
const FORMULA_CONTENT = `OSAGO haqqı = Baza dərəcə × Əmsallar

Baza dərəcə:
• Bakı: 50 AZN
• Digər regionlar: 40 AZN

Əmsallar:
• Region əmsalı: Bakı ×1.0, digər ×0.8
• Yaş/təcrübə: gənc sürücü (<25 yaş, <2 il) ×1.5
• Qəza tarixi: qəzasız ×0.8, 1 qəza ×1.5, 2+ qəza ×2.0
• Mühərrik gücü: <100 a.g. ×0.9, 100-150 ×1.0, 150-200 ×1.2, 200+ ×1.5

Bonus-malus sistemi:
Qəzasız sürücülər güzəştli tarif (×0.8) alır.
Qəza halında əmsal artır və növbəti il daha yüksək haqq ödənilir.`;

function getRegionCoeff(region: Region): number {
  return region === "baku" ? 1.0 : 0.8;
}
function getAgeExpCoeff(age: DriverAge, exp: Experience): number {
  if (age === "under25" && exp === "under2") return 1.5;
  if (age === "under25") return 1.3;
  if (exp === "under2") return 1.2;
  return 1.0;
}
function getAccidentCoeff(history: AccidentHistory): number {
  if (history === "clean") return 0.8;
  if (history === "one") return 1.5;
  return 2.0;
}
function getEnginePowerCoeff(power: EnginePower): number {
  if (power === "under100") return 0.9;
  if (power === "100to150") return 1.0;
  if (power === "150to200") return 1.2;
  return 1.5;
}
function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const GREEN = "#16a34a";
const AMBER = "#f59e0b";
const RED = "#dc2626";

function OptionGrid<T extends string>({
  label,
  options,
  selected,
  onSelect,
  columns,
  activeColor,
}: {
  label: string;
  options: { value: T; label: string; icon?: string }[];
  selected: T;
  onSelect: (v: T) => void;
  columns: number;
  activeColor?: (v: T) => string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: colors.n700 }]}>{label}</Text>
      <View style={styles.grid}>
        {options.map((o) => {
          const active = o.value === selected;
          const ac = activeColor ? activeColor(o.value) : colors.accent;
          return (
            <Pressable
              key={o.value}
              onPress={() => onSelect(o.value)}
              style={[
                styles.tile,
                { flexBasis: `${100 / columns - 3}%` },
                {
                  backgroundColor: active ? ac + "22" : colors.n240,
                  borderColor: active ? ac : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              {o.icon && <Text style={styles.tileIcon}>{o.icon}</Text>}
              <Text style={[styles.tileText, { color: colors.n940 }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function OsagoCalculator() {
  const { colors } = useTheme();
  const [region, setRegion] = useState<Region>("baku");
  const [driverAge, setDriverAge] = useState<DriverAge>("25plus");
  const [experience, setExperience] = useState<Experience>("2plus");
  const [accidentHistory, setAccidentHistory] = useState<AccidentHistory>("clean");
  const [enginePower, setEnginePower] = useState<EnginePower>("100to150");

  const result = useMemo(() => {
    const baseRate = region === "baku" ? BASE_RATE_BAKU : BASE_RATE_OTHER;
    const regionCoeff = getRegionCoeff(region);
    const ageExpCoeff = getAgeExpCoeff(driverAge, experience);
    const accidentCoeff = getAccidentCoeff(accidentHistory);
    const powerCoeff = getEnginePowerCoeff(enginePower);
    const totalCoeff = regionCoeff * ageExpCoeff * accidentCoeff * powerCoeff;
    const premium = baseRate * totalCoeff;
    return { baseRate, regionCoeff, ageExpCoeff, accidentCoeff, powerCoeff, totalCoeff, premium };
  }, [region, driverAge, experience, accidentHistory, enginePower]);

  const minPremium = BASE_RATE_OTHER * 0.8 * 1.0 * 0.8 * 0.9;
  const maxPremium = BASE_RATE_BAKU * 1.0 * 1.5 * 2.0 * 1.5;
  const scalePos = Math.max(0, Math.min(((result.premium - minPremium) / (maxPremium - minPremium)) * 100, 100));

  const coeffColor = (v: number, neutralBelow = false) =>
    v < 1 ? GREEN : v > 1 ? RED : neutralBelow ? GREEN : colors.n940;

  return (
    <View>
      <OptionGrid label="Region" options={REGION_OPTIONS} selected={region} onSelect={setRegion} columns={2} />
      <OptionGrid label="Sürücünün yaşı" options={AGE_OPTIONS} selected={driverAge} onSelect={setDriverAge} columns={2} />
      <OptionGrid
        label="Sürücülük təcrübəsi"
        options={EXPERIENCE_OPTIONS}
        selected={experience}
        onSelect={setExperience}
        columns={2}
      />
      <OptionGrid
        label="Qəza tarixi (son 1 il)"
        options={ACCIDENT_OPTIONS}
        selected={accidentHistory}
        onSelect={setAccidentHistory}
        columns={3}
        activeColor={(v) => (v === "clean" ? GREEN : v === "one" ? AMBER : RED)}
      />
      <OptionGrid
        label="Mühərrikin gücü"
        options={ENGINE_POWER_OPTIONS}
        selected={enginePower}
        onSelect={setEnginePower}
        columns={2}
      />

      {/* Əsas kartlar */}
      <View style={[styles.hero, { backgroundColor: colors.accent }]}>
        <Text style={[styles.heroLabel, { color: colors.onAccent }]}>OSAGO haqqı</Text>
        <Text style={[styles.heroValue, { color: colors.onAccent }]}>{fmt(result.premium)}</Text>
        <Text style={[styles.heroSub, { color: colors.onAccent }]}>AZN / il</Text>
      </View>
      <View style={styles.cardRow}>
        <View style={[styles.miniCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
          <Text style={[styles.miniLabel, { color: colors.n580 }]}>Baza dərəcə</Text>
          <Text style={[styles.miniValue, { color: colors.n940 }]}>{result.baseRate}</Text>
          <Text style={[styles.miniSub, { color: colors.n580 }]}>
            AZN ({region === "baku" ? REGION_OPTIONS[0].label : "Digər"})
          </Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: AMBER + "1a", borderColor: AMBER + "66" }]}>
          <Text style={[styles.miniLabel, { color: AMBER }]}>Ümumi əmsal</Text>
          <Text style={[styles.miniValue, { color: AMBER }]}>×{result.totalCoeff.toFixed(2)}</Text>
          <Text style={[styles.miniSub, { color: AMBER }]}>
            {result.totalCoeff < 1 ? "Güzəştli" : result.totalCoeff > 1.5 ? "Yüksək risk" : "Normal"}
          </Text>
        </View>
      </View>

      {/* Əmsal tərkibi */}
      <ResultSection title="📋 Əmsal tərkibi">
        <ResultRow label="Baza dərəcə" value={`${result.baseRate} AZN`} />
        <CoeffRow label="Region əmsalı" value={result.regionCoeff} color={result.regionCoeff < 1 ? GREEN : colors.n940} />
        <CoeffRow label="Yaş/təcrübə əmsalı" value={result.ageExpCoeff} color={result.ageExpCoeff > 1 ? RED : GREEN} />
        <CoeffRow label="Bonus-malus (qəza tarixi)" value={result.accidentCoeff} color={coeffColor(result.accidentCoeff)} />
        <CoeffRow label="Mühərrik gücü əmsalı" value={result.powerCoeff} color={coeffColor(result.powerCoeff)} />
        <ResultRow
          label={`OSAGO haqqı (${result.baseRate} × ${result.totalCoeff.toFixed(2)})`}
          value={`${fmt(result.premium)} AZN`}
          highlight
          bold
        />
      </ResultSection>

      {/* Vizual skala */}
      <View style={[styles.scaleBox, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
        <Text style={[styles.scaleTitle, { color: colors.n580 }]}>Sizin haqq skalada</Text>
        <View style={styles.scaleTrack}>
          <View style={[styles.scaleSeg, { backgroundColor: "#86efac" }]} />
          <View style={[styles.scaleSeg, { backgroundColor: "#fcd34d" }]} />
          <View style={[styles.scaleSeg, { backgroundColor: "#f87171" }]} />
          <View style={[styles.scaleMarker, { left: `${scalePos}%`, backgroundColor: colors.n960 }]} />
        </View>
        <View style={styles.scaleLabels}>
          <Text style={[styles.scaleLabel, { color: colors.n580 }]}>{fmt(minPremium)} AZN (min)</Text>
          <Text style={[styles.scaleLabel, { color: colors.n580 }]}>{fmt(maxPremium)} AZN (max)</Text>
        </View>
      </View>

      {accidentHistory === "clean" ? (
        <InfoBox variant="success" title="Bonus:">
          Qəzasız sürücü kimi güzəştli tarif (×0.8) tətbiq olunur. Növbəti il də qəzasız keçsəniz, güzəşt davam edəcək.
        </InfoBox>
      ) : (
        <InfoBox variant="warning" title="Malus:">
          Qəza tarixi olduğu üçün artırılmış tarif tətbiq olunur. 1 il qəzasız keçdikdən sonra əmsal azaldılacaq.
        </InfoBox>
      )}

      <InfoBox variant="info" title="Diqqət:">
        Bu hesablama təxmini xarakter daşıyır. OSAGO sığortası icbaridir və sığorta şirkətinə müraciət etməklə
        rəsmiləşdirilir. Faktiki haqq sığorta şirkətinin tariflərinə əsasən fərqlənə bilər.
      </InfoBox>

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["road-tax", "car-customs", "car-loan", "fuel-cost"]} />
    </View>
  );
}

function CoeffRow({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.coeffRow, { borderBottomColor: colors.n240 }]}>
      <Text style={[styles.coeffLabel, { color: colors.n580 }]}>{label}</Text>
      <Text style={[styles.coeffValue, { color }]}>×{value.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  groupLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { flexGrow: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center" },
  tileIcon: { fontSize: 22, marginBottom: 4 },
  tileText: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  hero: { borderRadius: 16, padding: 18, marginTop: 8, alignItems: "center" },
  heroLabel: { fontSize: 13, fontWeight: "600", opacity: 0.85 },
  heroValue: { fontSize: 30, fontWeight: "800", marginTop: 4 },
  heroSub: { fontSize: 12, marginTop: 4, opacity: 0.85 },
  cardRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  miniCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center" },
  miniLabel: { fontSize: 12, marginBottom: 4 },
  miniValue: { fontSize: 22, fontWeight: "800" },
  miniSub: { fontSize: 11, marginTop: 4, textAlign: "center" },
  coeffRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  coeffLabel: { fontSize: 14, flex: 1 },
  coeffValue: { fontSize: 14, fontWeight: "600" },
  scaleBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  scaleTitle: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  scaleTrack: { flexDirection: "row", height: 16, borderRadius: 8, overflow: "visible", position: "relative" },
  scaleSeg: { flex: 1, height: 16 },
  scaleMarker: { position: "absolute", top: 0, width: 4, height: 16, borderRadius: 2, marginLeft: -2 },
  scaleLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  scaleLabel: { fontSize: 11 },
});
