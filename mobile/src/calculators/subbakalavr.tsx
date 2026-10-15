import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  SectionList,
} from "react-native";
import { useTheme } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";

// ── Keçid balları data ──
import { admissionsGroup1Sub } from "@/data/admissions-group1-subbakalavr-2026";
import { admissionsGroup2Sub } from "@/data/admissions-group2-subbakalavr-2026";
import { admissionsGroup4Sub } from "@/data/admissions-group4-subbakalavr-2026";
import { admissionsGroup5Sub } from "@/data/admissions-group5-subbakalavr-2026";
import type { AdmissionEntry } from "@/data/admissions-group1-2026";

// ── İxtisas uyğunluğu data ──
import {
  subbakalavrMatches,
  subbakalavrRules,
  subbakalavrAptitude,
} from "@/data/subbakalavr-uygunluq-2026";
import type {
  SubbakalavrMatch,
  SubbakalavrAptitude,
} from "@/data/subbakalavr-uygunluq-2026";

const GROUP_DATA: Record<number, AdmissionEntry[]> = {
  1: admissionsGroup1Sub,
  2: admissionsGroup2Sub,
  3: [],
  4: admissionsGroup4Sub,
  5: admissionsGroup5Sub,
};

const GROUP_LABELS = ["I", "II", "III", "IV", "V"] as const;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g");
}

// ═══════════════════════════════════════════════
// Keçid balları view
// ═══════════════════════════════════════════════
function ScoresView() {
  const { colors } = useTheme();
  const [group, setGroup] = useState(1);
  const [query, setQuery] = useState("");

  const entries = GROUP_DATA[group] || [];

  const sections = useMemo(() => {
    let items = entries;
    if (query.trim()) {
      const q = normalize(query.trim());
      items = items.filter(
        (e) =>
          normalize(e.university).includes(q) ||
          normalize(e.specialty).includes(q) ||
          (e.code && e.code.toLowerCase().includes(q))
      );
    }

    const byUni: Record<string, AdmissionEntry[]> = {};
    for (const e of items) {
      if (!byUni[e.university]) byUni[e.university] = [];
      byUni[e.university].push(e);
    }

    return Object.entries(byUni).map(([title, data]) => ({ title, data }));
  }, [entries, query]);

  const totalCount = sections.reduce((s, sec) => s + sec.data.length, 0);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.title, { color: colors.accent }]}>
        Subbakalavr keçid balları · 2026
      </Text>

      {/* Group selector */}
      <View style={styles.groupRow}>
        {GROUP_LABELS.map((label, i) => {
          const g = i + 1;
          const active = g === group;
          return (
            <Pressable
              key={g}
              onPress={() => setGroup(g)}
              style={[
                styles.groupBtn,
                {
                  backgroundColor: active ? colors.accent : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                },
              ]}
            >
              <Text
                style={[
                  styles.groupBtnText,
                  { color: active ? "#fff" : colors.n660 },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.n240, borderColor: colors.n280 },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: colors.n940 }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Universitet və ya ixtisas axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      <Text style={[styles.count, { color: colors.n580 }]}>
        {totalCount} ixtisas
      </Text>

      {entries.length === 0 ? (
        <Text style={[styles.empty, { color: colors.n500c }]}>
          Bu qrup üçün subbakalavr məlumatı mövcud deyil
        </Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, i) => (item.code || "") + i}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: colors.n840, backgroundColor: colors.n195 }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={[styles.row, { borderBottomColor: colors.n260 }]}>
              <View style={styles.rowTop}>
                <Text style={[styles.spec, { color: colors.n840, flex: 1 }]}>
                  {item.specialty}
                </Text>
                {item.stream && (
                  <View style={[styles.badge, { backgroundColor: colors.n250 }]}>
                    <Text style={[styles.badgeText, { color: colors.n660 }]}>
                      {item.stream}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.scoreRow}>
                {item.score != null && (
                  <Text style={[styles.scoreVal, { color: colors.accent }]}>
                    Ödənişli: {item.score}
                  </Text>
                )}
                {item.stateScore != null && (
                  <Text style={[styles.scoreVal, { color: "#16a34a" }]}>
                    Dövlət s.: {item.stateScore}
                  </Text>
                )}
                {item.aptitude != null && (
                  <Text style={[styles.scoreVal, { color: colors.n580 }]}>
                    Qabiliyyət: {item.aptitude}
                  </Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.n500c }]}>
              Nəticə tapılmadı
            </Text>
          }
        />
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════
// İxtisas uyğunluğu view
// ═══════════════════════════════════════════════
function MatchView() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return subbakalavrMatches;
    const q = normalize(query.trim());
    return subbakalavrMatches.filter((m) => {
      for (const t of m.targets) {
        if (normalize(t.name).includes(q) || t.code.includes(q)) return true;
      }
      for (const s of m.sources) {
        if (normalize(s.name).includes(q) || s.code.toLowerCase().includes(q))
          return true;
      }
      if (m.group && normalize(m.group.name).includes(q)) return true;
      return false;
    });
  }, [query]);

  const renderMatch = useCallback(
    ({ item }: { item: SubbakalavrMatch }) => (
      <View style={[styles.matchCard, { backgroundColor: colors.n195, borderColor: colors.n280 }]}>
        {item.group && (
          <Text style={[styles.matchGroup, { color: colors.n580 }]}>
            {item.group.code} — {item.group.name}
          </Text>
        )}

        <Text style={[styles.matchSectionLabel, { color: colors.accent }]}>
          Bakalavriat ixtisasları:
        </Text>
        {item.targets.map((t) => (
          <Text key={t.code} style={[styles.matchItem, { color: colors.n840 }]}>
            {t.code} — {t.name}
          </Text>
        ))}

        <Text style={[styles.matchSectionLabel, { color: "#16a34a", marginTop: 8 }]}>
          Subbakalavr ixtisasları:
        </Text>
        {item.sources.map((s, i) => (
          <View key={s.code + i} style={styles.sourceRow}>
            <Text style={[styles.matchItem, { color: colors.n660, flex: 1 }]}>
              {s.code} — {s.name}
            </Text>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor:
                    s.level === "orta-ixtisas" ? "#dbeafe" : "#f3e8ff",
                },
              ]}
            >
              <Text
                style={[
                  styles.levelText,
                  {
                    color:
                      s.level === "orta-ixtisas" ? "#2563eb" : "#7c3aed",
                  },
                ]}
              >
                {s.level === "orta-ixtisas" ? "OİT" : "PT"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    ),
    [colors]
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.title, { color: colors.accent }]}>
        Subbakalavr ixtisas uyğunluğu · 2026
      </Text>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.n240, borderColor: colors.n280 },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: colors.n940 }]}
          value={query}
          onChangeText={setQuery}
          placeholder="İxtisas adı və ya kodu axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      <Text style={[styles.count, { color: colors.n580 }]}>
        {filtered.length} uyğunluq
      </Text>

      <FlatList
        data={filtered}
        renderItem={renderMatch}
        keyExtractor={(_, i) => String(i)}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.n500c }]}>
            Nəticə tapılmadı
          </Text>
        }
      />
    </View>
  );
}

// ═══════════════════════════════════════════════
// Main export — route via slug
// ═══════════════════════════════════════════════
export function SubbakalavCalculator() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  if (slug === "subbakalavr-kecid-ballari") return <ScoresView />;
  return <MatchView />;
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  groupRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  groupBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  groupBtnText: { fontSize: 13, fontWeight: "700" },
  searchWrap: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12 },
  searchInput: { fontSize: 14, paddingVertical: 10 },
  count: { fontSize: 12, marginTop: 10, marginBottom: 6 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 8,
    borderRadius: 6,
  },
  row: { paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  spec: { fontSize: 13, fontWeight: "500" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  scoreRow: { flexDirection: "row", gap: 12, marginTop: 4, flexWrap: "wrap" },
  scoreVal: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  // ── Match view ──
  matchCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  matchGroup: { fontSize: 11, fontWeight: "600", marginBottom: 6 },
  matchSectionLabel: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  matchItem: { fontSize: 13, marginBottom: 2, paddingLeft: 4 },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  levelBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  levelText: { fontSize: 9, fontWeight: "700" },
  empty: { textAlign: "center", paddingVertical: 20 },
});
