import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { FormulaSection, InfoBox, RelatedCalculators } from "@/components/Content";

type CalcMode = "total-to-sqm" | "sqm-to-total";

const districtAverages = [
  { name: "Nəsimi", min: 2000, max: 3000, color: "#f87171" },
  { name: "Yasamal", min: 1500, max: 2500, color: "#fb923c" },
  { name: "Xətai", min: 1200, max: 2000, color: "#fbbf24" },
  { name: "Binəqədi", min: 800, max: 1500, color: "#60a5fa" },
  { name: "Suraxanı", min: 600, max: 1000, color: "#4ade80" },
];

const FORMULA_TITLE = "Kvadratmetr qiyməti necə hesablanır?";
const FORMULA_CONTENT = `1 m² qiyməti = Ümumi qiymət / Sahə (m²)

Məsələn: 80 000 AZN / 60 m² = 1 333 AZN/m²

Əks hesablama:
Ümumi qiymət = 1 m² qiyməti × Sahə (m²)

Bakı rayonlarında orta qiymətlər (2024):
• Nəsimi: 2000–3000 AZN/m²
• Yasamal: 1500–2500 AZN/m²
• Xətai: 1200–2000 AZN/m²
• Binəqədi: 800–1500 AZN/m²
• Suraxanı: 600–1000 AZN/m²`;

const AMBER = "#f59e0b";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function fmtInt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function num(s: string): number {
  return parseFloat(s.replace(",", "."));
}

export function SqmCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<CalcMode>("total-to-sqm");
  const [totalPrice, setTotalPrice] = useState("");
  const [area, setArea] = useState("");
  const [pricePerSqm, setPricePerSqm] = useState("");

  const result = useMemo(() => {
    if (mode === "total-to-sqm") {
      const price = num(totalPrice);
      const sqm = num(area);
      if (!price || price <= 0 || !sqm || sqm <= 0) return null;
      return { totalPrice: price, area: sqm, pricePerSqm: price / sqm };
    } else {
      const perSqm = num(pricePerSqm);
      const sqm = num(area);
      if (!perSqm || perSqm <= 0 || !sqm || sqm <= 0) return null;
      return { totalPrice: perSqm * sqm, area: sqm, pricePerSqm: perSqm };
    }
  }, [mode, totalPrice, area, pricePerSqm]);

  const maxDistrictPrice = Math.max(...districtAverages.map((d) => d.max));
  const barMax = result ? Math.max(maxDistrictPrice, result.pricePerSqm) * 1.1 : maxDistrictPrice * 1.1;

  const modes: { value: CalcMode; icon: string; title: string; desc: string }[] = [
    { value: "total-to-sqm", icon: "🏠", title: "Ümumi qiymətdən → m²", desc: "Qiymət və sahə daxil edin" },
    { value: "sqm-to-total", icon: "📐", title: "m² qiymətindən → ümumi", desc: "m² qiyməti və sahə daxil edin" },
  ];

  const matchText = (() => {
    if (!result) return "";
    const p = result.pricePerSqm;
    const match = districtAverages.find((d) => p >= d.min && p <= d.max);
    if (match) {
      return `Sizin qiymət (${fmtInt(p)} AZN/m²) ${match.name} rayonunun orta qiymət aralığına (${fmtInt(match.min)}–${fmtInt(match.max)} AZN/m²) uyğun gəlir.`;
    } else if (p > districtAverages[0].max) {
      return `Sizin qiymət (${fmtInt(p)} AZN/m²) Bakının ən bahalı rayonlarının orta qiymətindən yüksəkdir. Bu, premium segment və ya mərkəzi yerləşmə ola bilər.`;
    }
    return `Sizin qiymət (${fmtInt(p)} AZN/m²) Bakının ucuz rayonlarının orta qiymətindən aşağıdır. Bu, ətraflarda və ya tikintisi davam edən layihələr ola bilər.`;
  })();

  const bar = (pct: number, color: string, opacity = 1) => (
    <View style={[styles.barTrack, { backgroundColor: colors.n240 }]}>
      <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color, opacity }]} />
    </View>
  );

  return (
    <View>
      {/* Rejim */}
      <Text style={[styles.groupLabel, { color: colors.n940 }]}>Hesablama rejimi</Text>
      <View style={styles.modeGrid}>
        {modes.map((m) => {
          const active = mode === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => setMode(m.value)}
              style={[
                styles.modeCard,
                {
                  backgroundColor: active ? colors.accent + "1f" : colors.n200,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={styles.modeIcon}>{m.icon}</Text>
              <Text style={[styles.modeTitle, { color: colors.n940 }]}>{m.title}</Text>
              <Text style={[styles.modeDesc, { color: colors.n580 }]}>{m.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "total-to-sqm" ? (
        <InputField
          label="💰 Ümumi qiymət (AZN)"
          value={totalPrice}
          onChangeText={setTotalPrice}
          placeholder="80000"
          keyboardType="decimal-pad"
        />
      ) : (
        <InputField
          label="💲 1 m² qiyməti (AZN)"
          value={pricePerSqm}
          onChangeText={setPricePerSqm}
          placeholder="1500"
          keyboardType="decimal-pad"
        />
      )}
      <InputField label="📐 Sahə (m²)" value={area} onChangeText={setArea} placeholder="60" keyboardType="decimal-pad" />

      {result ? (
        <View>
          {/* Əsas kartlar */}
          <View style={styles.cards}>
            <View style={[styles.card, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text style={[styles.cardLabel, { color: colors.onAccent }]}>1 m² qiyməti</Text>
              <Text style={[styles.cardValue, { color: colors.onAccent }]}>{fmt(result.pricePerSqm)}</Text>
              <Text style={[styles.cardUnit, { color: colors.onAccent }]}>AZN / m²</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={[styles.cardLabel, { color: colors.n580 }]}>Ümumi qiymət</Text>
              <Text style={[styles.cardValue, { color: colors.n940 }]}>{fmt(result.totalPrice)}</Text>
              <Text style={[styles.cardUnit, { color: colors.n580 }]}>AZN</Text>
            </View>
            <View style={[styles.card, { backgroundColor: AMBER + "1a", borderColor: AMBER + "66" }]}>
              <Text style={[styles.cardLabel, { color: AMBER }]}>Sahə</Text>
              <Text style={[styles.cardValue, { color: AMBER }]}>{fmt(result.area)}</Text>
              <Text style={[styles.cardUnit, { color: AMBER }]}>m²</Text>
            </View>
          </View>

          {/* Rayon müqayisəsi */}
          <ResultSection title="📊 Bakı rayonları ilə müqayisə">
            <View style={styles.barsWrap}>
              <View style={styles.barRow}>
                <Text style={[styles.barName, { color: colors.n940, fontWeight: "600" }]}>Sizin qiymət</Text>
                {bar((result.pricePerSqm / barMax) * 100, colors.accent)}
                <Text style={[styles.barValue, { color: colors.accent, fontWeight: "700" }]}>
                  {fmtInt(result.pricePerSqm)} AZN
                </Text>
              </View>
              {districtAverages.map((district) => {
                const avg = (district.min + district.max) / 2;
                return (
                  <View key={district.name} style={styles.barRow}>
                    <Text style={[styles.barName, { color: colors.n580 }]}>{district.name}</Text>
                    {bar((avg / barMax) * 100, district.color, 0.6)}
                    <Text style={[styles.barValue, { color: colors.n580, fontSize: 11 }]}>
                      {fmtInt(district.min)}–{fmtInt(district.max)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ResultSection>

          <InfoBox variant="info">
            <Text style={[styles.matchText, { color: colors.n760 }]}>
              <Text style={{ fontWeight: "700" }}>Nəticə:</Text> {matchText}
            </Text>
          </InfoBox>

          <ResultSection title="📋 Ətraflı hesablama">
            <ResultRow label="Ümumi qiymət" value={`${fmt(result.totalPrice)} AZN`} />
            <ResultRow label="Sahə" value={`${fmt(result.area)} m²`} />
            <ResultRow label="1 m² qiyməti" value={`${fmt(result.pricePerSqm)} AZN`} highlight bold />
          </ResultSection>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>
            Nəticəni görmək üçün {mode === "total-to-sqm" ? "qiymət və sahə" : "m² qiyməti və sahə"} daxil edin.
          </Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["property-tax", "mortgage", "rental-tax", "notary-fee"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  modeGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  modeCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  modeIcon: { fontSize: 24, marginBottom: 4 },
  modeTitle: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  modeDesc: { fontSize: 11, textAlign: "center", marginTop: 2 },
  cards: { gap: 10, marginTop: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center" },
  cardLabel: { fontSize: 13, opacity: 0.9 },
  cardValue: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  cardUnit: { fontSize: 12, marginTop: 2, opacity: 0.85 },
  barsWrap: { padding: 14, gap: 12 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barName: { width: 78, fontSize: 13 },
  barTrack: { flex: 1, height: 18, borderRadius: 9, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 9 },
  barValue: { width: 82, fontSize: 12, textAlign: "right" },
  matchText: { fontSize: 13, lineHeight: 19 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
