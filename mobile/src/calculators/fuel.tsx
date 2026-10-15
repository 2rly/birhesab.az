import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ToggleRow } from "@/components/Controls";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";

type FuelType = "ai92" | "ai95" | "ai98" | "diesel" | "lpg";

const FUEL_TYPES: { value: FuelType; icon: string; price: number; label: string }[] = [
  { value: "ai92", icon: "⛽", price: 1.15, label: "Aİ-92" },
  { value: "ai95", icon: "⛽", price: 1.6, label: "Aİ-95" },
  { value: "ai98", icon: "⛽", price: 2.3, label: "Aİ-98" },
  { value: "diesel", icon: "🛢️", price: 1.1, label: "Dizel" },
  { value: "lpg", icon: "🔵", price: 0.45, label: "Qaz (LPG)" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Saytdakı parseFloat ilə eyni, mobil klaviaturadakı vergülü də qəbul edir. */
function pf(s: string): number {
  return parseFloat(s.replace(",", "."));
}

const FORMULA_TITLE = "Yanacaq xərci necə hesablanır?";
const FORMULA_CONTENT = `Yanacaq miqdarı = (Məsafə / 100) × Sərfiyyat (L/100km)
Ümumi xərc = Yanacaq miqdarı × Yanacağın qiyməti

Məsələn: 200 km, 8 L/100km, Aİ-92 (1.15 AZN/L)
Yanacaq = (200/100) × 8 = 16 litr
Xərc = 16 × 1.15 = 18.40 AZN

Azərbaycanda cari yanacaq qiymətləri:
• Aİ-92: 1.15 AZN/L
• Aİ-95: 1.60 AZN/L
• Aİ-98: 2.30 AZN/L
• Dizel: 1.10 AZN/L
• Qaz (LPG): 0.45 AZN/L`;

const BLUE = "#3b82f6";
const AMBER = "#f59e0b";

export function FuelCalculator() {
  const { colors } = useTheme();
  const [fuelType, setFuelType] = useState<FuelType>("ai92");
  const [distance, setDistance] = useState("");
  const [consumption, setConsumption] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const defaultPrice = FUEL_TYPES.find((f) => f.value === fuelType)?.price || 1.0;
  const effectivePrice = pf(customPrice) || defaultPrice;

  const result = useMemo(() => {
    const dist = pf(distance);
    const cons = pf(consumption);
    if (!dist || dist <= 0 || !cons || cons <= 0) return null;
    const actualDistance = isRoundTrip ? dist * 2 : dist;
    const fuelNeeded = (actualDistance / 100) * cons;
    const totalCost = fuelNeeded * effectivePrice;
    const costPerKm = totalCost / actualDistance;
    return { distance: dist, actualDistance, consumption: cons, fuelNeeded, totalCost, costPerKm, fuelPrice: effectivePrice, isRoundTrip };
  }, [distance, consumption, effectivePrice, isRoundTrip]);

  return (
    <View>
      {/* Yanacaq növü */}
      <Text style={[styles.groupLabel, { color: colors.n700 }]}>Yanacaq növü</Text>
      <View style={styles.grid}>
        {FUEL_TYPES.map((ft) => {
          const active = fuelType === ft.value;
          return (
            <Pressable
              key={ft.value}
              onPress={() => {
                setFuelType(ft.value);
                setCustomPrice("");
              }}
              style={[
                styles.tile,
                {
                  backgroundColor: active ? colors.accent + "22" : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={styles.tileIcon}>{ft.icon}</Text>
              <Text style={[styles.tileText, { color: colors.n940 }]}>{ft.label}</Text>
              <Text style={[styles.tilePrice, { color: colors.n580 }]}>{ft.price.toFixed(2)} AZN</Text>
            </Pressable>
          );
        })}
      </View>

      <InputField
        label="📍 Məsafə (km)"
        value={distance}
        onChangeText={setDistance}
        placeholder="200"
        keyboardType="decimal-pad"
        suffix="km"
      />
      <InputField
        label="⛽ Sərfiyyat (L/100km)"
        value={consumption}
        onChangeText={setConsumption}
        placeholder="8"
        keyboardType="decimal-pad"
        suffix="L/100km"
      />
      <InputField
        label="💲 Yanacaq qiyməti (AZN/L) — ixtiyari"
        value={customPrice}
        onChangeText={setCustomPrice}
        placeholder={defaultPrice.toFixed(2)}
        keyboardType="decimal-pad"
        suffix="AZN/L"
      />

      <ToggleRow label="Gediş-gəliş" value={isRoundTrip} onValueChange={setIsRoundTrip} />

      {result ? (
        <View>
          <View style={[styles.hero, { backgroundColor: colors.accent }]}>
            <Text style={[styles.heroLabel, { color: colors.onAccent }]}>Ümumi xərc</Text>
            <Text style={[styles.heroValue, { color: colors.onAccent }]}>{fmt(result.totalCost)}</Text>
            <Text style={[styles.heroSub, { color: colors.onAccent }]}>AZN</Text>
          </View>
          <View style={styles.cardRow}>
            <View style={[styles.miniCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={[styles.miniLabel, { color: colors.n580 }]}>Lazım olan yanacaq</Text>
              <Text style={[styles.miniValue, { color: colors.n940 }]}>{fmt(result.fuelNeeded)}</Text>
              <Text style={[styles.miniSub, { color: colors.n580 }]}>litr</Text>
            </View>
            <View style={[styles.miniCard, { backgroundColor: AMBER + "1a", borderColor: AMBER + "66" }]}>
              <Text style={[styles.miniLabel, { color: AMBER }]}>1 km-in dəyəri</Text>
              <Text style={[styles.miniValue, { color: AMBER }]}>{fmt(result.costPerKm)}</Text>
              <Text style={[styles.miniSub, { color: AMBER }]}>AZN / km</Text>
            </View>
          </View>

          {result.isRoundTrip && (
            <View style={[styles.badge, { backgroundColor: BLUE + "1a", borderColor: BLUE + "66" }]}>
              <Text style={[styles.badgeText, { color: BLUE }]}>
                🔄 Gediş-gəliş: {result.distance} km × 2 = {result.actualDistance} km
              </Text>
            </View>
          )}

          <ResultSection title="📋 Ətraflı hesablama">
            <ResultRow
              label="Məsafə"
              value={`${result.actualDistance} km ${result.isRoundTrip ? `(${result.distance} × 2)` : ""}`.trim()}
            />
            <ResultRow label="Sərfiyyat" value={`${result.consumption} L/100km`} />
            <ResultRow label="Yanacaq qiyməti" value={`${fmt(result.fuelPrice)} AZN/L`} />
            <ResultRow label="Lazım olan yanacaq" value={`${fmt(result.fuelNeeded)} L`} />
            <ResultRow label="1 km-in dəyəri" value={`${fmt(result.costPerKm)} AZN`} />
            <ResultRow label="Ümumi xərc" value={`${fmt(result.totalCost)} AZN`} highlight bold />
          </ResultSection>

          {/* Yanacaq növləri ilə müqayisə */}
          <View style={[styles.table, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <View style={[styles.tableHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={[styles.tableTitle, { color: colors.n940 }]}>📊 Yanacaq növləri ilə müqayisə</Text>
            </View>
            {FUEL_TYPES.map((ft) => {
              const cost = (result.actualDistance / 100) * result.consumption * ft.price;
              const maxCost = (result.actualDistance / 100) * result.consumption * 2.3;
              const isActive = ft.value === fuelType;
              return (
                <View
                  key={ft.value}
                  style={[styles.cmpRow, { borderBottomColor: colors.n240 }, isActive && { backgroundColor: colors.accent + "22" }]}
                >
                  <Text style={[styles.cmpLabel, { color: isActive ? colors.accent : colors.n940 }, isActive && { fontWeight: "700" }]}>
                    {ft.icon} {ft.label} ({ft.price.toFixed(2)} AZN/L)
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.n240 }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.min((cost / maxCost) * 100, 100)}%`, backgroundColor: isActive ? colors.accent : colors.n340 },
                      ]}
                    />
                  </View>
                  <Text style={[styles.cmpCost, { color: isActive ? colors.accent : colors.n940 }, isActive && { fontWeight: "800" }]}>
                    {fmt(cost)} AZN
                  </Text>
                </View>
              );
            })}
          </View>

          <InfoBox variant="info" title="Diqqət:">
            Yanacaq qiymətləri SOCAR-ın rəsmi tariflərinə əsaslanır (2024). Faktiki sərfiyyat yol şəraitinə, sürətə, hava
            şəraitinə və avtomobilin texniki vəziyyətinə görə fərqlənə bilər.
          </InfoBox>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⛽</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>Nəticəni görmək üçün məsafə və sərfiyyatı daxil edin.</Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["road-tax", "osago", "car-customs", "car-loan"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tile: { flexGrow: 1, flexBasis: "30%", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: "center" },
  tileIcon: { fontSize: 20, marginBottom: 2 },
  tileText: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  tilePrice: { fontSize: 11, marginTop: 2 },
  hero: { borderRadius: 16, padding: 18, marginTop: 8, alignItems: "center" },
  heroLabel: { fontSize: 13, fontWeight: "600", opacity: 0.85 },
  heroValue: { fontSize: 30, fontWeight: "800", marginTop: 4 },
  heroSub: { fontSize: 12, marginTop: 4, opacity: 0.85 },
  cardRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  miniCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center" },
  miniLabel: { fontSize: 12, marginBottom: 4, textAlign: "center" },
  miniValue: { fontSize: 20, fontWeight: "800" },
  miniSub: { fontSize: 11, marginTop: 4 },
  badge: { alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  table: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 16 },
  tableHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  tableTitle: { fontSize: 14, fontWeight: "700" },
  cmpRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  cmpLabel: { flex: 1, fontSize: 13 },
  barTrack: { width: 60, height: 10, borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
  cmpCost: { width: 84, textAlign: "right", fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
