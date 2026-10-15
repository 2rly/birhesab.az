import { useState, useMemo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { Select } from "@/components/Select";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { adlar } from "@/data/adlar";
import type { Gender, Origin, NameEntry } from "@/data/adlar";

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

const pt = {
  formulaTitle: "Adlar haqqında",
  formulaContent: `Bu lüğətdə Azərbaycanda işlədilən məşhur kişi və qadın adlarının mənası, mənşəyi və tarixi məlumatı var.

Adların əksəriyyəti aşağıdakı dillərdən gəlir:
• Ərəb dili — dini və klassik adlar (Məhəmməd, Əli, Fatma)
• Fars dili — klassik və poetik adlar (Lalə, Şirin, Pərvanə)
• Türk dilləri — milli adlar (Aslan, Aynur, Tural)
• Yəhudi dili — peyğəmbər adları (İbrahim, Yusif)
• Yunan/Latın — qədim adlar (İskəndər, Roza)

Mənbə: Azərbaycan dili lüğəti, ad lüğətləri, etimoloji araşdırmalar.

Qeyd: bəzi adların mənası tam dəqiq olmaya bilər — eyni ad fərqli mənbələrdə fərqli izahlanır. Əgər adınız siyahıda yoxdursa və ya mənası dəqiq deyilsə, bizimlə əlaqə saxlayın.`,
  searchPlaceholder: "Adınızı yazın... (məs: Aysel, Murad, Leyla)",
  filterGender: "Cinsi",
  filterOrigin: "Mənşəyi",
  all: "Hamısı",
  male: "Kişi",
  female: "Qadın",
  unisex: "Uniseks",
  meaning: "Mənası",
  origin: "Mənşəyi",
  gender: "Cinsi",
  totalNames: "ad",
  noResults: "Bu ad lüğətdə tapılmadı.",
  emptyState: "Adınızı yazın və ya filtrlərdən istifadə edin.",
  popularNames: "Məşhur adlar",
  nameNotFound: "Bu ad lüğətdə yoxdur",
  nameNotFoundDesc: "Lüğətimiz inkişaf etməkdədir. Sizə daha doğru məlumat verməyə çalışırıq.",
};

const genderEmoji: Record<Gender, string> = {
  kişi: "👨",
  qadın: "👩",
  uniseks: "🧑",
};

const genderColor: Record<Gender, string> = {
  kişi: "#3b82f6",
  qadın: "#ec4899",
  uniseks: "#a855f7",
};

const originColor: Record<string, string> = {
  ərəb: "#d97706",
  fars: "#e11d48",
  türk: "#059669",
  yəhudi: "#4f46e5",
  yunan: "#0284c7",
  latın: "#7c3aed",
};

function originBadge(origin: Origin | string): string {
  return originColor[origin] ?? "#6b7280";
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "1a", borderColor: color + "55" }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

function NameCard({ entry, highlight }: { entry: NameEntry; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.n200, borderColor: highlight ? colors.accent : colors.n280 },
        highlight && { borderWidth: 2 },
      ]}
    >
      <Text style={[styles.name, { color: colors.n960 }]}>{entry.name}</Text>
      <View style={styles.badges}>
        <Badge
          text={`${genderEmoji[entry.gender]} ${
            entry.gender === "kişi" ? pt.male : entry.gender === "qadın" ? pt.female : pt.unisex
          }`}
          color={genderColor[entry.gender]}
        />
        <Badge text={entry.origin} color={originBadge(entry.origin)} />
      </View>
      <Text style={[styles.meaning, { color: colors.n940 }]}>
        <Text style={{ fontWeight: "700", color: colors.n580 }}>{pt.meaning}: </Text>
        {entry.meaning}
      </Text>
      {entry.note && <Text style={[styles.note, { color: colors.n580 }]}>{entry.note}</Text>}
    </View>
  );
}

const MALE_COUNT = adlar.filter((a) => a.gender === "kişi").length;
const FEMALE_COUNT = adlar.filter((a) => a.gender === "qadın").length;
const ALL_ORIGINS: Origin[] = Array.from(new Set(adlar.map((a) => a.origin))).sort();

export function NameMeaningCalculator() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"" | Gender>("");
  const [originFilter, setOriginFilter] = useState<"" | Origin>("");

  const filtered = useMemo(() => {
    let result = adlar;
    if (genderFilter) result = result.filter((a) => a.gender === genderFilter);
    if (originFilter) result = result.filter((a) => a.origin === originFilter);
    if (search.trim()) {
      const q = normalizeText(search.trim());
      result = result.filter((a) => normalizeText(a.name).includes(q));
    }
    return [...result].sort((a, b) => a.name.localeCompare(b.name, "az"));
  }, [search, genderFilter, originFilter]);

  // Tam uyğunluq — istifadəçi adı dəqiq yazıbsa onu öndə göstər
  const exactMatch = useMemo(() => {
    if (!search.trim()) return null;
    const q = normalizeText(search.trim());
    return adlar.find((a) => normalizeText(a.name) === q) ?? null;
  }, [search]);

  const hasSearched = search.trim().length > 0;
  const showNotFound = hasSearched && !exactMatch && filtered.length === 0;

  const stats = [
    { value: MALE_COUNT, label: `👨 ${pt.male}`, color: "#3b82f6" },
    { value: FEMALE_COUNT, label: `👩 ${pt.female}`, color: "#ec4899" },
    { value: adlar.length, label: `📚 ${pt.totalNames}`, color: "#10b981" },
  ];

  return (
    <View>
      {/* Statistika */}
      <View style={styles.stats}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.stat, { backgroundColor: s.color + "14", borderColor: s.color + "55" }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Axtarış */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={pt.searchPlaceholder}
        placeholderTextColor={colors.n400c}
        autoCorrect={false}
        autoCapitalize="words"
        style={[styles.search, { backgroundColor: colors.n240, borderColor: colors.n280, color: colors.n940 }]}
      />

      {/* Filtrlər */}
      <Select
        label={pt.filterGender}
        value={genderFilter}
        options={[
          { value: "", label: pt.all },
          { value: "kişi", label: `👨 ${pt.male}` },
          { value: "qadın", label: `👩 ${pt.female}` },
          { value: "uniseks", label: `🧑 ${pt.unisex}` },
        ]}
        onSelect={(v) => setGenderFilter(v as Gender | "")}
      />
      <Select
        label={pt.filterOrigin}
        value={originFilter}
        options={[{ value: "", label: pt.all }, ...ALL_ORIGINS.map((o) => ({ value: o, label: o }))]}
        onSelect={(v) => setOriginFilter(v)}
      />

      {/* Tam uyğunluq */}
      {exactMatch && (
        <View style={{ marginBottom: 14 }}>
          <NameCard entry={exactMatch} highlight />
        </View>
      )}

      {/* Tapılmadı */}
      {showNotFound && (
        <View style={[styles.notFound, { backgroundColor: "#f59e0b1a", borderColor: "#f59e0b66" }]}>
          <Text style={{ fontSize: 36, marginBottom: 6 }}>🔍</Text>
          <Text style={[styles.nfTitle, { color: colors.n940 }]}>{pt.nameNotFound}</Text>
          <Text style={[styles.nfDesc, { color: colors.n760 }]}>{pt.nameNotFoundDesc}</Text>
        </View>
      )}

      {/* Nəticələr */}
      {filtered.length > 0 && !exactMatch && (
        <Text style={[styles.count, { color: colors.n580 }]}>
          <Text style={{ fontWeight: "700", color: colors.n940 }}>{filtered.length}</Text> {pt.totalNames}
        </Text>
      )}

      <View style={{ gap: 10 }}>
        {filtered
          .filter((e) => !exactMatch || e.name !== exactMatch.name)
          .slice(0, hasSearched ? 30 : 50)
          .map((entry) => (
            <NameCard key={entry.name} entry={entry} />
          ))}
      </View>

      {!hasSearched && filtered.length > 50 && (
        <Text style={[styles.hint, { color: colors.n580 }]}>↑ Yuxarıdakı axtarış xanasından adı yazın</Text>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["bmi", "yas", "hamilelik"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 8, marginBottom: 16 },
  stat: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  search: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 14 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  name: { fontSize: 22, fontWeight: "800" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 8 },
  badge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  meaning: { fontSize: 14, lineHeight: 21 },
  note: { fontSize: 12, fontStyle: "italic", marginTop: 6, lineHeight: 17 },
  notFound: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", marginBottom: 14 },
  nfTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  nfDesc: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  count: { fontSize: 13, marginBottom: 10 },
  hint: { fontSize: 13, textAlign: "center", marginTop: 14 },
});
