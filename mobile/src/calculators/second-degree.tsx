import { useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import type { ThemeColors } from "@/constants/colors";
import { secondDegreeData, type SecondDegreeProgram, type StudyForm } from "@/data/ikinci-ali-tehsil";

interface FlatProgram extends SecondDegreeProgram {
  universityId: string;
  universityName: string;
  universityShort?: string;
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

function formatFee(fee: number | string | undefined): string {
  if (fee === undefined) return "—";
  return `${fee} AZN`;
}

const ALL_PROGRAMS: FlatProgram[] = (() => {
  const flat: FlatProgram[] = [];
  for (const uni of secondDegreeData) {
    for (const p of uni.programs) {
      flat.push({
        ...p,
        universityId: uni.id,
        universityName: uni.name,
        universityShort: uni.shortName,
      });
    }
  }
  return flat;
})();

const FORM_OPTIONS: { value: "" | StudyForm; label: string }[] = [
  { value: "", label: "Hamısı" },
  { value: "əyani", label: "Əyani" },
  { value: "qiyabi", label: "Qiyabi" },
];

function ProgramCard({ item, colors }: { item: FlatProgram; colors: ThemeColors }) {
  const formStyle =
    item.form === "əyani"
      ? { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" }
      : item.form === "qiyabi"
      ? { bg: "#fefce8", text: "#a16207", border: "#fde68a" }
      : { bg: "#faf5ff", text: "#7e22ce", border: "#d8b4fe" };

  const formLabel =
    item.form === "əyani" ? "Əyani" : item.form === "qiyabi" ? "Qiyabi" : "Əyani/Qiyabi";

  return (
    <View style={[s.card, { backgroundColor: colors.n195, borderColor: colors.n300 }]}>
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[s.specName, { color: colors.n940 }]}>{item.specialty}</Text>
          <Text style={[s.uniName, { color: colors.n580 }]}>
            {item.universityShort ? `${item.universityShort} — ${item.universityName}` : item.universityName}
          </Text>
        </View>
        {item.fee !== undefined && (
          <View style={[s.feeBadge, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d" }}>{formatFee(item.fee)}</Text>
          </View>
        )}
      </View>
      <View style={s.badges}>
        <View style={[s.badge, { backgroundColor: formStyle.bg, borderColor: formStyle.border }]}>
          <Text style={{ fontSize: 10, fontWeight: "600", color: formStyle.text }}>{formLabel}</Text>
        </View>
        {item.code && (
          <View style={[s.badge, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: colors.n700, fontVariant: ["tabular-nums"] }}>{item.code}</Text>
          </View>
        )}
        {item.language && (
          <View style={[s.badge, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: colors.n700 }}>{item.language}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function SecondDegreeCalculator() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [formFilter, setFormFilter] = useState<"" | StudyForm>("");

  const filtered = useMemo(() => {
    let result = ALL_PROGRAMS;

    if (uniFilter) {
      result = result.filter((p) => p.universityId === uniFilter);
    }

    if (formFilter) {
      result = result.filter((p) => {
        if (formFilter === "əyani") return p.form === "əyani" || p.form === "əyani/qiyabi";
        if (formFilter === "qiyabi") return p.form === "qiyabi" || p.form === "əyani/qiyabi";
        return p.form === formFilter;
      });
    }

    if (search.trim()) {
      const q = normalizeText(search.trim());
      result = result.filter(
        (p) =>
          normalizeText(p.specialty).includes(q) ||
          normalizeText(p.universityName).includes(q) ||
          (p.universityShort && normalizeText(p.universityShort).includes(q)) ||
          (p.code && p.code.includes(q))
      );
    }

    return result;
  }, [uniFilter, formFilter, search]);

  return (
    <View style={{ flex: 1 }}>
      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Text style={[s.summaryNum, { color: "#1e40af" }]}>{secondDegreeData.length}</Text>
          <Text style={{ fontSize: 11, color: "#1e40af" }}>universitet</Text>
        </View>
        <View style={[s.summaryCard, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
          <Text style={[s.summaryNum, { color: "#166534" }]}>{ALL_PROGRAMS.length}</Text>
          <Text style={{ fontSize: 11, color: "#166534" }}>proqram</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[s.searchWrap, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <TextInput
          style={[s.searchInput, { color: colors.n940 }]}
          value={search}
          onChangeText={setSearch}
          placeholder="İxtisas axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      {/* University filter */}
      <View style={s.filterRow}>
        <Pressable
          onPress={() => setUniFilter("")}
          style={[s.filterPill, uniFilter === "" && { backgroundColor: colors.accent, borderColor: colors.accent }]}
        >
          <Text style={[s.filterText, uniFilter === "" && { color: colors.onAccent }]}>Hamısı</Text>
        </Pressable>
        {secondDegreeData.slice(0, 6).map((uni) => (
          <Pressable
            key={uni.id}
            onPress={() => setUniFilter(uniFilter === uni.id ? "" : uni.id)}
            style={[
              s.filterPill,
              { borderColor: colors.n280 },
              uniFilter === uni.id && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
          >
            <Text style={[s.filterText, { color: colors.n700 }, uniFilter === uni.id && { color: colors.onAccent }]}>
              {uni.shortName || uni.name.slice(0, 12)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Form filter */}
      <View style={s.filterRow}>
        {FORM_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setFormFilter(opt.value)}
            style={[
              s.filterPill,
              { borderColor: colors.n280 },
              formFilter === opt.value && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
          >
            <Text style={[s.filterText, { color: colors.n700 }, formFilter === opt.value && { color: colors.onAccent }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Count */}
      <Text style={[s.count, { color: colors.n580 }]}>
        <Text style={{ fontWeight: "700", color: colors.n940 }}>{filtered.length}</Text> nəticə
      </Text>

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <ProgramCard item={item} colors={colors} />}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={[s.empty, { color: colors.n500c }]}>Seçilmiş filtrlərə uyğun ixtisas tapılmadı.</Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  summaryNum: { fontSize: 22, fontWeight: "800" },
  searchWrap: { borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  searchInput: { fontSize: 14, paddingHorizontal: 14, paddingVertical: 10 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  filterText: { fontSize: 11, fontWeight: "600" },
  count: { fontSize: 13, marginBottom: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  specName: { fontSize: 14, fontWeight: "700", lineHeight: 19 },
  uniName: { fontSize: 12, marginTop: 2 },
  feeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  empty: { textAlign: "center", paddingVertical: 32, fontSize: 14 },
});
