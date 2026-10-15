import { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { DataTable, FormulaSection, RelatedCalculators, SectionHeading } from "@/components/Content";
import { fetchCbarLatest, TROY_OZ_GRAMS } from "@/lib/cbar";

type MetalType = "gold" | "silver" | "platinum" | "palladium";
type Direction = "buy" | "sell";

interface PurityOption {
  value: number;
  label: string;
  karat?: string;
}

const goldPurities: PurityOption[] = [
  { value: 375, label: "375", karat: "9K" },
  { value: 500, label: "500", karat: "12K" },
  { value: 585, label: "585", karat: "14K" },
  { value: 750, label: "750", karat: "18K" },
  { value: 875, label: "875", karat: "21K" },
  { value: 999, label: "999", karat: "24K" },
];

const silverPurities: PurityOption[] = [
  { value: 800, label: "800", karat: "800" },
  { value: 925, label: "925", karat: "Sterling" },
  { value: 999, label: "999", karat: "999" },
];

const platinumPurities: PurityOption[] = [
  { value: 585, label: "585", karat: "585" },
  { value: 750, label: "750", karat: "750" },
  { value: 850, label: "850", karat: "850" },
  { value: 900, label: "900", karat: "900" },
  { value: 950, label: "950", karat: "950" },
  { value: 999, label: "999", karat: "999" },
];

const palladiumPurities: PurityOption[] = [
  { value: 500, label: "500", karat: "500" },
  { value: 850, label: "850", karat: "850" },
  { value: 950, label: "950", karat: "950" },
  { value: 999, label: "999", karat: "999" },
];

const FALLBACK_PRICES = {
  gold: 265.15,
  silver: 4.14,
  platinum: 112.04,
  palladium: 82.63,
};

const FALLBACK_PRICES_PER_OUNCE = {
  gold: FALLBACK_PRICES.gold * TROY_OZ_GRAMS,
  silver: FALLBACK_PRICES.silver * TROY_OZ_GRAMS,
  platinum: FALLBACK_PRICES.platinum * TROY_OZ_GRAMS,
  palladium: FALLBACK_PRICES.palladium * TROY_OZ_GRAMS,
};

const SELL_SPREAD = 0.96;
const quickWeights = [1, 5, 10, 50, 100];

interface CbarPrices {
  gold: number; // AZN/qram
  silver: number;
  platinum: number;
  palladium: number;
  goldOz: number; // AZN/troy uns
  silverOz: number;
  platinumOz: number;
  palladiumOz: number;
  date: string;
  source: "cbar" | "fallback";
}

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

function formatWeight(n: number): string {
  return n.toFixed(3);
}

const pt = {
  formulaTitle: "Qiymətli metalların qiyməti necə hesablanır?",
  formulaContent: `Mənbə: Azərbaycan Respublikası Mərkəzi Bankı (CBAR)
CBAR bank metallarının qiymətini AZN/troy uns olaraq verir.
1 troy uns = 31.1035 qram

Qrama çevirmə: Qiymət/qram = CBAR qiyməti ÷ 31.1035

Əyara görə qiymət:
Qiymət = Çəki (qram) × Baza qiymət (999/qram) × (Əyar / 1000)

Saf metal çəkisi = Ümumi çəki × (Əyar / 1000)

Satış qiyməti alış qiymətindən ~4% aşağıdır (zərgərlik/bank spread).`,
  loading: "Qiymətlər yüklənir...",
  cbarRates: "CBAR məzənnələri",
  staticPrices: "Statik qiymətlər (CBAR əlçatmaz)",
  refresh: "Yenilə",
  goldPerOz: "Qızıl / 1 troy uns",
  silverPerOz: "Gümüş / 1 troy uns",
  platinumPerOz: "Platin / 1 troy uns",
  palladiumPerOz: "Palladium / 1 troy uns",
  perOunceTitle: "1 troy uns (≈31.1 qr) qiyməti — CBAR rəsmi məzənnəsi",
  gold: "Qızıl",
  silver: "Gümüş",
  platinum: "Platin",
  palladium: "Palladium",
  weightGram: "Çəki (qram)",
  puritySelection: "Əyar seçimi",
  operationType: "Əməliyyat növü",
  buy: "Alış",
  sell: "Satış",
  buyPrice: "Alış qiyməti",
  sellPrice: "Satış qiyməti",
  spread: "Fərq (spread)",
  buySellDiff: "alış - satış",
  pureMetalWeight: "Saf metal çəkisi",
  pureGold: "saf qızıl",
  pureSilver: "saf gümüş",
  purePlatinum: "saf platin",
  purePalladium: "saf palladium",
  calculationDetails: "Hesablama detalları",
  metalType: "Metal növü",
  totalWeight: "Ümumi çəki",
  purity: "Əyar",
  pureWeight: "Saf metal çəkisi",
  basePrice: "Baza qiymət (999, 1qr)",
  buyLabel: "Alış",
  sellLabel: "Satış",
  allPuritiesComparison: "Bütün əyarlar üzrə müqayisə",
  gram: "qram",
  grShort: "qr",
  selected: "seçilmiş",
  purityCol: "Əyar",
  purityPct: "Saflıq",
  pureWeightCol: "Saf çəki",
  buyCol: "Alış",
  sellCol: "Satış",
  priceNote:
    "Qiymətlər məlumat xarakteri daşıyır, bank/zərgərlik qiymətləri fərqli ola bilər. Son yenilənmə: 2024",
  emptyState: "Qiyməti hesablamaq üçün çəki daxil edin.",
};

const GREEN = "#16a34a";
const RED = "#dc2626";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const GRAY = "#6b7280";

const metalButtons: { id: MetalType; icon: string; color: string }[] = [
  { id: "gold", icon: "🪙", color: "#f59e0b" },
  { id: "silver", icon: "🥈", color: "#6b7280" },
  { id: "platinum", icon: "💠", color: "#475569" },
  { id: "palladium", icon: "⚪", color: "#71717a" },
];

const metalNames: Record<MetalType, string> = {
  gold: pt.gold,
  silver: pt.silver,
  platinum: pt.platinum,
  palladium: pt.palladium,
};

const pureNames: Record<MetalType, string> = {
  gold: pt.pureGold,
  silver: pt.pureSilver,
  platinum: pt.purePlatinum,
  palladium: pt.purePalladium,
};

function puritiesFor(m: MetalType): PurityOption[] {
  return m === "gold" ? goldPurities : m === "silver" ? silverPurities : m === "platinum" ? platinumPurities : palladiumPurities;
}

export function GoldSilverCalculator() {
  const { colors } = useTheme();
  const [metalType, setMetalType] = useState<MetalType>("gold");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState(999);
  const [direction, setDirection] = useState<Direction>("buy");
  const [prices, setPrices] = useState<CbarPrices>({
    ...FALLBACK_PRICES,
    goldOz: FALLBACK_PRICES_PER_OUNCE.gold,
    silverOz: FALLBACK_PRICES_PER_OUNCE.silver,
    platinumOz: FALLBACK_PRICES_PER_OUNCE.platinum,
    palladiumOz: FALLBACK_PRICES_PER_OUNCE.palladium,
    date: "",
    source: "fallback",
  });
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCbarLatest();
      if (data && data.metals.gold > 0) {
        setPrices({
          gold: data.metals.gold,
          silver: data.metals.silver,
          platinum: data.metals.platinum,
          palladium: data.metals.palladium,
          goldOz: data.metalsPerOunce.gold,
          silverOz: data.metalsPerOunce.silver,
          platinumOz: data.metalsPerOunce.platinum,
          palladiumOz: data.metalsPerOunce.palladium,
          date: data.date || "",
          source: "cbar",
        });
      }
    } catch {
      /* fallback qiymətlər saxlanılır */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const purities = puritiesFor(metalType);

  const handleMetalSwitch = (type: MetalType) => {
    setMetalType(type);
    setPurity(999);
  };

  const baseBuyPerGram = prices[metalType];
  const baseSellPerGram = prices[metalType] * SELL_SPREAD;

  const result = useMemo(() => {
    const w = parseFloat(weight.replace(",", "."));
    if (!w || w <= 0) return null;

    const factor = purity / 1000;
    const pureWeight = w * factor;
    const buyPrice = w * baseBuyPerGram * factor;
    const sellPrice = w * baseSellPerGram * factor;
    const spread = buyPrice - sellPrice;
    const pricePerGramBuy = baseBuyPerGram * factor;
    const pricePerGramSell = baseSellPerGram * factor;

    const comparisonTable = puritiesFor(metalType).map((p) => {
      const f = p.value / 1000;
      return {
        ...p,
        pureWeight: w * f,
        buyTotal: w * baseBuyPerGram * f,
        sellTotal: w * baseSellPerGram * f,
        isSelected: p.value === purity,
      };
    });

    return { pureWeight, buyPrice, sellPrice, spread, pricePerGramBuy, pricePerGramSell, comparisonTable, factor };
  }, [weight, purity, metalType, baseBuyPerGram, baseSellPerGram]);

  const isCbar = prices.source === "cbar";
  const statusColor = isCbar ? "#22c55e" : AMBER;

  const ozCards: { icon: string; label: string; oz: number; gr: number }[] = [
    { icon: "🪙", label: pt.goldPerOz, oz: prices.goldOz, gr: prices.gold },
    { icon: "🥈", label: pt.silverPerOz, oz: prices.silverOz, gr: prices.silver },
    { icon: "💠", label: pt.platinumPerOz, oz: prices.platinumOz, gr: prices.platinum },
    { icon: "⚪", label: pt.palladiumPerOz, oz: prices.palladiumOz, gr: prices.palladium },
  ];

  const detailRows: [string, string][] = result
    ? [
        [pt.metalType, metalNames[metalType]],
        [pt.totalWeight, `${weight} ${pt.gram}`],
        [pt.purity, `${purity} (${(purity / 10).toFixed(1)}%)`],
        [pt.pureWeight, `${formatWeight(result.pureWeight)} ${pt.gram}`],
        [pt.basePrice, `${pt.buyLabel}: ${formatMoney(baseBuyPerGram)} / ${pt.sellLabel}: ${formatMoney(baseSellPerGram)}`],
      ]
    : [];

  return (
    <View>
      {/* CBAR qiymət statusu */}
      <View style={[styles.statusBox, { backgroundColor: statusColor + "1a", borderColor: statusColor + "66" }]}>
        <View style={styles.statusHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1, flexWrap: "wrap" }}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={{ color: colors.n940, fontSize: 12, fontWeight: "600" }}>
              {loading ? pt.loading : isCbar ? pt.cbarRates : pt.staticPrices}
            </Text>
            {!!prices.date && <Text style={{ color: colors.n580, fontSize: 12 }}>({prices.date})</Text>}
          </View>
          <Pressable onPress={fetchPrices} disabled={loading} hitSlop={8}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600" }}>{loading ? "..." : pt.refresh}</Text>
          </Pressable>
        </View>
        <Text style={[styles.ozTitle, { color: colors.n580 }]}>{pt.perOunceTitle}</Text>
        <View style={styles.ozGrid}>
          {ozCards.map((c) => (
            <View key={c.label} style={[styles.ozCard, { backgroundColor: colors.n200 }]}>
              <Text style={{ color: colors.n580, fontSize: 11, textAlign: "center" }}>
                {c.icon} {c.label}
              </Text>
              <Text style={{ color: colors.n940, fontSize: 15, fontWeight: "700", textAlign: "center", marginTop: 2 }}>
                {formatMoney(c.oz)}
              </Text>
              <Text style={{ color: colors.n580, fontSize: 11, textAlign: "center", marginTop: 2 }}>
                {formatMoney(c.gr)}/{pt.grShort}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Metal növü */}
      <View style={styles.metalGrid}>
        {metalButtons.map((m) => {
          const active = metalType === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => handleMetalSwitch(m.id)}
              style={[
                styles.metalBtn,
                {
                  backgroundColor: active ? m.color : colors.n200,
                  borderColor: active ? m.color : colors.n280,
                },
              ]}
            >
              <Text style={{ color: active ? "#ffffff" : colors.n580, fontSize: 14, fontWeight: "600" }}>
                {m.icon} {metalNames[m.id]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Çəki */}
      <InputField
        label={pt.weightGram}
        value={weight}
        onChangeText={setWeight}
        placeholder="10"
        keyboardType="decimal-pad"
      />
      <View style={[styles.chips, { marginTop: -6 }]}>
        {quickWeights.map((qw) => {
          const active = weight === String(qw);
          return (
            <Pressable
              key={qw}
              onPress={() => setWeight(String(qw))}
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.accent : colors.n280,
                  backgroundColor: active ? colors.accent + "1f" : colors.n200,
                },
              ]}
            >
              <Text style={{ color: active ? colors.accent : colors.n580, fontSize: 13, fontWeight: "600" }}>
                {qw}
                {pt.grShort}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Əyar */}
      <Text style={[styles.label, { color: colors.n840 }]}>{pt.puritySelection}</Text>
      <View style={styles.purityGrid}>
        {purities.map((p) => {
          const active = purity === p.value;
          const ring = metalType === "gold" ? AMBER : GRAY;
          return (
            <Pressable
              key={p.value}
              onPress={() => setPurity(p.value)}
              style={[
                styles.purityBtn,
                {
                  borderColor: active ? ring : colors.n280,
                  borderWidth: active ? 2 : 1,
                  backgroundColor: active ? ring + "1f" : colors.n200,
                },
              ]}
            >
              <Text style={{ color: colors.n940, fontSize: 14, fontWeight: "700" }}>{p.karat}</Text>
              <Text style={{ color: colors.n580, fontSize: 12 }}>{(p.value / 10).toFixed(1)}%</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Əməliyyat növü */}
      <Text style={[styles.label, { color: colors.n840 }]}>{pt.operationType}</Text>
      <View style={[styles.dirRow, { borderColor: colors.n280 }]}>
        {(["buy", "sell"] as Direction[]).map((d) => {
          const active = direction === d;
          const c = d === "buy" ? GREEN : "#ef4444";
          return (
            <Pressable
              key={d}
              onPress={() => setDirection(d)}
              style={[styles.dirBtn, { backgroundColor: active ? c : colors.n200 }]}
            >
              <Text style={{ color: active ? "#ffffff" : colors.n580, fontSize: 14, fontWeight: "600" }}>
                {d === "buy" ? pt.buy : pt.sell}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {result ? (
        <View>
          <View style={[styles.resultCard, { backgroundColor: GREEN }]}>
            <Text style={styles.resultLabelW}>{pt.buyPrice}</Text>
            <Text style={styles.resultValueW}>{formatMoney(result.buyPrice)}</Text>
            <Text style={styles.resultSubW}>
              {formatMoney(result.pricePerGramBuy)}/{pt.grShort}
            </Text>
          </View>
          <View style={[styles.resultCard, { backgroundColor: RED }]}>
            <Text style={styles.resultLabelW}>{pt.sellPrice}</Text>
            <Text style={styles.resultValueW}>{formatMoney(result.sellPrice)}</Text>
            <Text style={styles.resultSubW}>
              {formatMoney(result.pricePerGramSell)}/{pt.grShort}
            </Text>
          </View>
          <View style={[styles.resultCard, { backgroundColor: AMBER + "1a", borderColor: AMBER + "66", borderWidth: 1 }]}>
            <Text style={{ color: colors.amber, fontSize: 13 }}>{pt.spread}</Text>
            <Text style={[styles.resultValue, { color: colors.amber }]}>{formatMoney(result.spread)}</Text>
            <Text style={{ color: colors.amber, fontSize: 12, marginTop: 4 }}>{pt.buySellDiff}</Text>
          </View>

          <View style={[styles.resultCard, { backgroundColor: BLUE + "1a", borderColor: BLUE + "66", borderWidth: 1 }]}>
            <Text style={{ color: BLUE, fontSize: 13 }}>{pt.pureMetalWeight}</Text>
            <Text style={[styles.resultValue, { color: BLUE }]}>
              {formatWeight(result.pureWeight)} {pt.gram}
            </Text>
            <Text style={{ color: colors.n760, fontSize: 12, marginTop: 4, textAlign: "center" }}>
              {weight} {pt.grShort} x {(result.factor * 100).toFixed(1)}% = {formatWeight(result.pureWeight)} {pt.grShort}{" "}
              {pureNames[metalType]}
            </Text>
          </View>

          {/* Hesablama detalları */}
          <View style={[styles.details, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <View style={[styles.detailsHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={{ color: colors.n940, fontSize: 15, fontWeight: "700" }}>📊 {pt.calculationDetails}</Text>
            </View>
            {detailRows.map(([l, v]) => (
              <View key={l} style={[styles.detailRow, { borderBottomColor: colors.n280 }]}>
                <Text style={{ color: colors.n580, fontSize: 13, flex: 1 }}>{l}</Text>
                <Text style={{ color: colors.n940, fontSize: 13, fontWeight: "600", flex: 1.4, textAlign: "right" }}>{v}</Text>
              </View>
            ))}
            <View style={[styles.detailRow, { backgroundColor: GREEN + "1a", borderBottomColor: colors.n280 }]}>
              <Text style={{ color: GREEN, fontSize: 13, fontWeight: "700", flex: 1 }}>{pt.buyPrice}</Text>
              <Text style={{ color: GREEN, fontSize: 13, fontWeight: "800" }}>{formatMoney(result.buyPrice)}</Text>
            </View>
            <View style={[styles.detailRow, { backgroundColor: RED + "1a", borderBottomWidth: 0 }]}>
              <Text style={{ color: RED, fontSize: 13, fontWeight: "700", flex: 1 }}>{pt.sellPrice}</Text>
              <Text style={{ color: RED, fontSize: 13, fontWeight: "800" }}>{formatMoney(result.sellPrice)}</Text>
            </View>
          </View>

          {/* Bütün əyarlar üzrə müqayisə */}
          <SectionHeading icon="📋">
            {pt.allPuritiesComparison} ({weight} {pt.gram})
          </SectionHeading>
          <DataTable
            headers={[pt.purityCol, pt.purityPct, pt.pureWeightCol, pt.buyCol, pt.sellCol]}
            columnWidths={[140, 80, 100, 130, 130]}
            highlightRows={result.comparisonTable.map((r, i) => (r.isSelected ? i : -1)).filter((i) => i >= 0)}
            rows={result.comparisonTable.map((row) => [
              `${row.karat}${row.isSelected ? ` (${pt.selected})` : ""}`,
              `${(row.value / 10).toFixed(1)}%`,
              `${formatWeight(row.pureWeight)} ${pt.grShort}`,
              formatMoney(row.buyTotal),
              formatMoney(row.sellTotal),
            ])}
          />

          <View style={[styles.note, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <Text style={{ color: colors.n580, fontSize: 12, textAlign: "center" }}>{pt.priceNote}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>{metalType === "gold" ? "🪙" : "🥈"}</Text>
          <Text style={{ color: colors.n580, textAlign: "center" }}>{pt.emptyState}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["zakat", "currency", "deposit", "vat"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  statusHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ozTitle: { fontSize: 10, textAlign: "center", marginTop: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  ozGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ozCard: { flexBasis: "47%", flexGrow: 1, borderRadius: 8, padding: 8 },
  metalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  metalBtn: { flexBasis: "47%", flexGrow: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  purityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  purityBtn: { flexBasis: "30%", flexGrow: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  dirRow: { flexDirection: "row", borderWidth: 1, borderRadius: 12, overflow: "hidden", marginBottom: 20 },
  dirBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  resultCard: { borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 10 },
  resultLabelW: { color: "#ffffff", fontSize: 13, opacity: 0.9 },
  resultValueW: { color: "#ffffff", fontSize: 24, fontWeight: "800", marginTop: 4 },
  resultSubW: { color: "#ffffff", fontSize: 12, marginTop: 4, opacity: 0.85 },
  resultValue: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  details: { borderWidth: 1, borderRadius: 12, overflow: "hidden", marginTop: 8 },
  detailsHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  note: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 16 },
  empty: { alignItems: "center", paddingVertical: 28 },
});
