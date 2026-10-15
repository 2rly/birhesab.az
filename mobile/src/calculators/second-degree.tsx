import { useState, useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import {
  secondDegreeData,
  type SecondDegreeUniversity,
  type SecondDegreeProgram,
  type StudyForm,
} from "@/data/ikinci-ali-tehsil";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

const FORM_COLORS: Record<StudyForm, string> = {
  "əyani": "#3b82f6",
  qiyabi: "#f59e0b",
  "əyani/qiyabi": "#8b5cf6",
};

const FORM_LABELS: Record<StudyForm, string> = {
  "əyani": "Ǝyani",
  qiyabi: "Qiyabi",
  "əyani/qiyabi": "Ǝyani/Qiyabi",
};

function formatFee(fee?: number | string): string {
  if (fee == null) return "—";
  if (typeof fee === "number") return fee.toLocaleString("az-AZ") + " ₼";
  return fee + " ₼";
}

interface FilteredUniversity {
  uni: SecondDegreeUniversity;
  programs: SecondDegreeProgram[];
}

export function SecondDegreeCalculator() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { filtered, totalPrograms, totalUnis } = useMemo(() => {
    const q = search.trim();
    const nq = q ? normalize(q) : "";

    const result: FilteredUniversity[] = [];
    let progCount = 0;

    for (const uni of secondDegreeData) {
      if (!nq) {
        result.push({ uni, programs: uni.programs });
        progCount += uni.programs.length;
        continue;
      }

      const uniMatch = normalize(uni.name).includes(nq) ||
        (uni.shortName && normalize(uni.shortName).includes(nq));

      if (uniMatch) {
        result.push({ uni, programs: uni.programs });
        progCount += uni.programs.length;
      } else {
        const matchedPrograms = uni.programs.filter(
          (p) => normalize(p.specialty).includes(nq) ||
            (p.code && p.code.includes(q))
        );
        if (matchedPrograms.length > 0) {
          result.push({ uni, programs: matchedPrograms });
          progCount += matchedPrograms.length;
        }
      }
    }

    return { filtered: result, totalPrograms: progCount, totalUnis: result.length };
  }, [search]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderProgram = useCallback(
    (prog: SecondDegreeProgram, index: number) => {
      const formColor = FORM_COLORS[prog.form];
      return (
        <View
          key={`${prog.code ?? prog.specialty}-${index}`}
          style={[styles.progCard, { borderBottomColor: colors.n250 }]}
        >
          <View style={styles.progHeader}>
            <Text style={[styles.progName, { color: colors.n840 }]} numberOfLines={2}>
              {prog.code ? `${prog.code} — ` : ""}{prog.specialty}
            </Text>
          </View>
          <View style={styles.progBadges}>
            <View style={[styles.badge, { backgroundColor: formColor + "18" }]}>
              <Text style={[styles.badgeText, { color: formColor }]}>{FORM_LABELS[prog.form]}</Text>
            </View>
            {prog.language && (
              <View style={[styles.badge, { backgroundColor: colors.n240 }]}>
                <Text style={[styles.badgeText, { color: colors.n660 }]}>{prog.language}</Text>
              </View>
            )}
            {prog.fee != null && (
              <View style={[styles.badge, { backgroundColor: colors.accent + "15" }]}>
                <Text style={[styles.badgeText, { color: colors.accent }]}>{formatFee(prog.fee)}/il</Text>
              </View>
            )}
          </View>
          {prog.note && (
            <Text style={[styles.progNote, { color: colors.n500c }]}>{prog.note}</Text>
          )}
        </View>
      );
    },
    [colors]
  );

  const renderUniversity = useCallback(
    ({ item }: { item: FilteredUniversity }) => {
      const { uni, programs } = item;
      const isExpanded = expandedId === uni.id || expandedId === null;

      return (
        <View style={[styles.uniSection, { backgroundColor: colors.n195, borderColor: colors.n280 }]}>
          <Pressable onPress={() => toggleExpand(uni.id)} style={styles.uniHeader}>
            <View style={styles.uniTitleRow}>
              <Text style={[styles.uniName, { color: colors.n940 }]}>{uni.name}</Text>
              {uni.shortName && (
                <View style={[styles.badge, { backgroundColor: colors.n240, marginLeft: 8 }]}>
                  <Text style={[styles.badgeText, { color: colors.n660 }]}>{uni.shortName}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.progCount, { color: colors.n580 }]}>
              {programs.length} ixtisas {isExpanded ? "▲" : "▼"}
            </Text>
          </Pressable>
          {uni.note && (
            <Text style={[styles.uniNote, { color: colors.n500c }]}>{uni.note}</Text>
          )}
          {isExpanded && programs.map((p, i) => renderProgram(p, i))}
        </View>
      );
    },
    [colors, expandedId, toggleExpand, renderProgram]
  );

  const keyExtractor = useCallback((item: FilteredUniversity) => item.uni.id, []);

  return (
    <View style={styles.container}>
      {/* Search */}
      <InputField
        label="Axtarış"
        value={search}
        onChangeText={setSearch}
        placeholder="İxtisas və ya universitet adı"
      />

      {/* Count */}
      <Text style={[styles.countText, { color: colors.n580 }]}>
        {totalUnis} universitet, {totalPrograms} ixtisas
      </Text>

      {/* No results */}
      {filtered.length === 0 && search.trim().length > 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>
            Uyğun nəticə tapılmadı
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderUniversity}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  countText: { fontSize: 12, marginBottom: 12 },
  uniSection: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  uniHeader: {
    padding: 14,
  },
  uniTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  uniName: { fontSize: 16, fontWeight: "700", flexShrink: 1 },
  progCount: { fontSize: 12 },
  uniNote: { fontSize: 12, paddingHorizontal: 14, paddingBottom: 10, lineHeight: 17 },
  progCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  progHeader: {
    marginBottom: 6,
  },
  progName: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  progBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  progNote: { fontSize: 11, marginTop: 4, fontStyle: "italic", lineHeight: 16 },
  emptyBox: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, textAlign: "center" },
});
