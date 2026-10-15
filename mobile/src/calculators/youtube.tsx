import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";

interface Region {
  id: string;
  name: string;
  flag: string;
  cpmMin: number; // 1000 baxışa USD
  cpmMax: number;
}

const regions: Region[] = [
  { id: "az-tr", name: "Azərbaycan / Türkiyə", flag: "🇦🇿", cpmMin: 0.5, cpmMax: 1.5 },
  { id: "ru-cis", name: "Rusiya / MDB", flag: "🇷🇺", cpmMin: 0.7, cpmMax: 2 },
  { id: "eu-east", name: "Şərqi Avropa", flag: "🇵🇱", cpmMin: 1.5, cpmMax: 3 },
  { id: "eu-west", name: "Qərbi Avropa", flag: "🇪🇺", cpmMin: 2, cpmMax: 5 },
  { id: "uk", name: "Böyük Britaniya", flag: "🇬🇧", cpmMin: 4, cpmMax: 8 },
  { id: "us", name: "ABŞ / Kanada", flag: "🇺🇸", cpmMin: 5, cpmMax: 10 },
  { id: "au", name: "Avstraliya", flag: "🇦🇺", cpmMin: 4, cpmMax: 9 },
  { id: "asia", name: "Cənub-Şərqi Asiya", flag: "🌏", cpmMin: 0.5, cpmMax: 2 },
  { id: "india", name: "Hindistan", flag: "🇮🇳", cpmMin: 0.3, cpmMax: 1 },
  { id: "mixed", name: "Qarışıq auditoriya", flag: "🌍", cpmMin: 1, cpmMax: 3 },
];

interface Niche {
  id: string;
  name: string;
  emoji: string;
  multiplier: number; // Baza CPM üzərində mövzu əmsalı
}

const niches: Niche[] = [
  { id: "finance", emoji: "💰", name: "Maliyyə / Biznes", multiplier: 2.5 },
  { id: "tech", emoji: "💻", name: "Texnologiya / Proqramlaşdırma", multiplier: 2.0 },
  { id: "education", emoji: "🎓", name: "Təhsil", multiplier: 1.6 },
  { id: "health", emoji: "❤️", name: "Sağlamlıq / Fitness", multiplier: 1.5 },
  { id: "lifestyle", emoji: "✨", name: "Lifestyle / Vlog", multiplier: 1.0 },
  { id: "food", emoji: "🍔", name: "Yemək / Resept", multiplier: 1.0 },
  { id: "gaming", emoji: "🎮", name: "Oyunlar", multiplier: 0.7 },
  { id: "music", emoji: "🎵", name: "Musiqi", multiplier: 0.6 },
  { id: "entertainment", emoji: "🎬", name: "Əyləncə", multiplier: 0.8 },
  { id: "kids", emoji: "🧸", name: "Uşaqlar üçün", multiplier: 0.5 },
];

const pt = {
  formulaTitle: "YouTube qazancı necə hesablanır?",
  formulaContent: `YouTube reklam gəliri CPM (Cost Per Mille — min baxışa düşən qiymət) əsasında hesablanır.

Düstur:
• Gəlir = (Baxış sayı / 1000) × CPM × Niche əmsalı

CPM regionlara və mövzulara görə dəyişir:
• Azərbaycan / Türkiyə: $0.50 - $1.50
• Rusiya / MDB: $0.70 - $2.00
• Şərqi Avropa: $1.50 - $3.00
• Qərbi Avropa: $2.00 - $5.00
• ABŞ / Kanada: $5.00 - $10.00

Niche əmsalları:
• Maliyyə / Biznes — 2.5× (ən yüksək)
• Texnologiya — 2.0×
• Təhsil — 1.6×
• Sağlamlıq / Fitness — 1.5×
• Lifestyle / Yemək — 1.0×
• Oyunlar — 0.7×
• Musiqi — 0.6×
• Uşaq kontenti — 0.5× (COPPA məhdudiyyəti)

Qeyd: Bu hesablama TƏXMİNİDİR. Real qazanc YouTube əməkdaşlıq müqaviləsi (55% kanal payı), reklam blokerləri, mövsümi tərəddüdlər və demoqrafik faktordan asılıdır.`,
  monthlyViews: "Aylıq baxış sayı",
  viewsHint: "Məsələn: 100000 (100 min)",
  regionLabel: "Auditoriyanın əsas regionu",
  nicheLabel: "Kanal mövzusu (niche)",
  estimatedRevenue: "Təxmini gəlir",
  perMonth: "Aylıq",
  perYear: "İllik",
  effectiveCpm: "Effektiv CPM",
  minRevenue: "Minimum",
  maxRevenue: "Maksimum",
  avgRevenue: "Orta",
  disclaimer: "⚠️ Bu rəqəmlər təxminidir. Real gəlir bir çox faktordan asılıdır.",
  emptyState: "Baxış sayını daxil edin və region/niche seçin.",
};

const USD_TO_AZN = 1.7;

/** Saytdakı toLocaleString("az-AZ", 2 onluq) — az-AZ: minlik ".", onluq "," */
function fmtMoney(n: number, currency: "USD" | "AZN"): string {
  const symbol = currency === "USD" ? "$" : "₼";
  const fixed = Math.abs(n).toFixed(2);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return symbol + (n < 0 ? "-" : "") + `${grouped},${frac}`;
}

function fmtViews(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

const BLUE = "#3b82f6";
const EMERALD = "#10b981";
const PURPLE = "#a855f7";

export function YoutubeCalculator() {
  const { colors } = useTheme();
  const [views, setViews] = useState("100000");
  const [regionId, setRegionId] = useState("az-tr");
  const [nicheId, setNicheId] = useState("lifestyle");

  const region = regions.find((r) => r.id === regionId)!;
  const niche = niches.find((n) => n.id === nicheId)!;

  const result = useMemo(() => {
    const v = parseFloat(views.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(v) || v <= 0) return null;

    const minCpm = region.cpmMin * niche.multiplier;
    const maxCpm = region.cpmMax * niche.multiplier;
    const avgCpm = (minCpm + maxCpm) / 2;

    const minRev = (v / 1000) * minCpm;
    const maxRev = (v / 1000) * maxCpm;
    const avgRev = (v / 1000) * avgCpm;

    return {
      views: v,
      minCpm,
      maxCpm,
      avgCpm,
      minRev,
      maxRev,
      avgRev,
      yearlyMin: minRev * 12,
      yearlyMax: maxRev * 12,
      yearlyAvg: avgRev * 12,
    };
  }, [views, region, niche]);

  const RevenueBlock = ({
    title,
    color,
    min,
    avg,
    max,
  }: {
    title: string;
    color: string;
    min: number;
    avg: number;
    max: number;
  }) => {
    const Cell = ({ label, value, featured }: { label: string; value: number; featured?: boolean }) => (
      <View
        style={[
          styles.cell,
          featured
            ? { backgroundColor: color, borderColor: color }
            : { backgroundColor: colors.n200, borderColor: color + "40" },
        ]}
      >
        <Text style={[styles.cellLabel, { color: featured ? "#ffffff" : colors.n580 }, featured && { opacity: 0.85 }]}>
          {label}
        </Text>
        <Text
          style={[styles.cellValue, { color: featured ? "#ffffff" : color }, featured && { fontSize: 15 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {fmtMoney(value, "USD")}
        </Text>
        <Text
          style={[styles.cellLabel, { color: featured ? "#ffffff" : colors.n580 }, featured && { opacity: 0.85 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {fmtMoney(value * USD_TO_AZN, "AZN")}
        </Text>
      </View>
    );
    return (
      <View style={[styles.revBlock, { backgroundColor: color + "14", borderColor: color + "55" }]}>
        <Text style={[styles.revTitle, { color: colors.n940 }]}>{title}</Text>
        <View style={styles.cells}>
          <Cell label={pt.minRevenue} value={min} />
          <Cell label={pt.avgRevenue} value={avg} featured />
          <Cell label={pt.maxRevenue} value={max} />
        </View>
      </View>
    );
  };

  return (
    <View>
      <InputField
        label={`📊 ${pt.monthlyViews}`}
        value={views}
        onChangeText={setViews}
        placeholder={pt.viewsHint}
        keyboardType="number-pad"
        hint={result ? `= ${fmtViews(result.views)} baxış/ay` : undefined}
      />

      <Select
        label={`🌍 ${pt.regionLabel}`}
        value={regionId}
        onSelect={setRegionId}
        options={regions.map((r) => ({
          value: r.id,
          label: `${r.flag} ${r.name} (CPM $${r.cpmMin.toFixed(2)}–$${r.cpmMax.toFixed(2)})`,
        }))}
      />

      <Text style={[styles.label, { color: colors.n700 }]}>🎯 {pt.nicheLabel}</Text>
      <View style={styles.nicheGrid}>
        {niches.map((n) => {
          const active = nicheId === n.id;
          return (
            <Pressable
              key={n.id}
              onPress={() => setNicheId(n.id)}
              style={[
                styles.nicheBtn,
                {
                  backgroundColor: active ? colors.accent + "22" : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={styles.nicheEmoji}>{n.emoji}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.nicheName, { color: colors.n940 }]} numberOfLines={1}>
                  {n.name}
                </Text>
                <Text style={[styles.nicheMul, { color: colors.n580 }]}>×{n.multiplier.toFixed(1)} CPM</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {result ? (
        <View style={{ gap: 12 }}>
          {/* Effektiv CPM */}
          <View style={[styles.cpmBox, { backgroundColor: BLUE + "1a", borderColor: BLUE + "66" }]}>
            <Text style={[styles.cpmLabel, { color: BLUE }]}>{pt.effectiveCpm}</Text>
            <Text style={[styles.cpmValue, { color: colors.n960 }]}>
              ${result.minCpm.toFixed(2)} – ${result.maxCpm.toFixed(2)}
            </Text>
            <Text style={[styles.cpmSub, { color: BLUE }]}>
              {region.name} × {niche.name} (×{niche.multiplier.toFixed(1)})
            </Text>
          </View>

          <RevenueBlock
            title={`💵 ${pt.perMonth} — ${pt.estimatedRevenue}`}
            color={EMERALD}
            min={result.minRev}
            avg={result.avgRev}
            max={result.maxRev}
          />
          <RevenueBlock
            title={`📅 ${pt.perYear} — ${pt.estimatedRevenue}`}
            color={PURPLE}
            min={result.yearlyMin}
            avg={result.yearlyAvg}
            max={result.yearlyMax}
          />

          <InfoBox variant="warning">{pt.disclaimer}</InfoBox>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📺</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyState}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["currency", "frilansci-vergi", "salary"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  nicheGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  nicheBtn: {
    flexBasis: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
  },
  nicheEmoji: { fontSize: 20 },
  nicheName: { fontSize: 12, fontWeight: "600" },
  nicheMul: { fontSize: 10, marginTop: 1 },
  cpmBox: { borderRadius: 12, borderWidth: 1, padding: 14 },
  cpmLabel: { fontSize: 12, marginBottom: 4 },
  cpmValue: { fontSize: 18, fontWeight: "700" },
  cpmSub: { fontSize: 11, marginTop: 2 },
  revBlock: { borderRadius: 16, borderWidth: 1, padding: 14 },
  revTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  cells: { flexDirection: "row", gap: 6 },
  cell: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 6, alignItems: "center" },
  cellLabel: { fontSize: 10, textAlign: "center" },
  cellValue: { fontSize: 14, fontWeight: "700", marginVertical: 2, textAlign: "center" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
