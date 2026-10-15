import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";

// ── Universitet plan data ──
import type { PlanEntry } from "@/data/admissions-plan-2026";
import { planGroup1 } from "@/data/admissions-plan-2026-group1";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";
import { planGroup3 } from "@/data/admissions-plan-2026-group3";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";

// ── Kolec plan data ──
import { planCollege11 } from "@/data/admissions-plan-college11-2026";
import type { CollegePlanEntry } from "@/data/admissions-plan-college11-2026";

const GROUP_DATA: Record<number, PlanEntry[]> = {
  1: planGroup1,
  2: planGroup2,
  3: planGroup3,
  4: planGroup4,
};

const GROUP_LABELS = ["I", "II", "III", "IV"] as const;

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
// Universitet ixtisas kodları
// ═══════════════════════════════════════════════
function UniCodesView() {
  const { colors } = useTheme();
  const [group, setGroup] = useState(1);
  const [query, setQuery] = useState("");

  const entries = GROUP_DATA[group] || [];

  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = normalize(query.trim());
    return entries.filter(
      (e) =>
        e.code.includes(q) ||
        normalize(e.university).includes(q) ||
        normalize(e.specialty).includes(q)
    );
  }, [entries, query]);

  const renderItem = useCallback(
    ({ item }: { item: PlanEntry }) => (
      <View style={[styles.row, { borderBottomColor: colors.n260 }]}>
        <View style={styles.rowTop}>
          <Text style={[styles.code, { color: colors.accent }]}>{item.code}</Text>
          <View style={[styles.badge, { backgroundColor: colors.n250 }]}>
            <Text style={[styles.badgeText, { color: colors.n580 }]}>
              {item.language}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#dbeafe" }]}>
            <Text style={[styles.badgeText, { color: "#2563eb" }]}>
              {item.seats} yer
            </Text>
          </View>
          {item.aptitudeRequired && (
            <View style={[styles.badge, { backgroundColor: "#fef3c7" }]}>
              <Text style={[styles.badgeText, { color: "#d97706" }]}>QI</Text>
            </View>
          )}
        </View>
        <Text style={[styles.uni, { color: colors.n840 }]}>{item.university}</Text>
        <Text style={[styles.spec, { color: colors.n660 }]}>{item.specialty}</Text>
        {item.fee && (
          <Text style={[styles.fee, { color: colors.n580 }]}>
            {item.fee === "YDS"
              ? "Yalnız dövlət sifarişi"
              : item.fee === "DH"
              ? "Dövlət hesabına"
              : `${item.fee} AZN`}
          </Text>
        )}
      </View>
    ),
    [colors]
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.title, { color: colors.accent }]}>
        Universitet ixtisas kodları · 2026
      </Text>

      {/* Group tabs */}
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
                {label} qrup
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
          placeholder="Kod, ixtisas və ya universitet axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      <Text style={[styles.count, { color: colors.n580 }]}>
        {filtered.length} ixtisas
      </Text>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.code + i}
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
// Kolec ixtisas kodları
// ═══════════════════════════════════════════════
function CollegeCodesView() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return planCollege11;
    const q = normalize(query.trim());
    return planCollege11.filter(
      (e) =>
        e.code.includes(q) ||
        normalize(e.university).includes(q) ||
        normalize(e.specialty).includes(q)
    );
  }, [query]);

  const renderItem = useCallback(
    ({ item }: { item: CollegePlanEntry }) => (
      <View style={[styles.row, { borderBottomColor: colors.n260 }]}>
        <View style={styles.rowTop}>
          <Text style={[styles.code, { color: colors.accent }]}>{item.code}</Text>
          <View style={[styles.badge, { backgroundColor: colors.n250 }]}>
            <Text style={[styles.badgeText, { color: colors.n580 }]}>
              {item.language}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#dbeafe" }]}>
            <Text style={[styles.badgeText, { color: "#2563eb" }]}>
              {item.seats} yer
            </Text>
          </View>
          {item.stream && (
            <View style={[styles.badge, { backgroundColor: colors.n250 }]}>
              <Text style={[styles.badgeText, { color: colors.n660 }]}>
                {item.stream}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.uni, { color: colors.n840 }]}>{item.university}</Text>
        <Text style={[styles.spec, { color: colors.n660 }]}>{item.specialty}</Text>
        {item.fee && (
          <Text style={[styles.fee, { color: colors.n580 }]}>
            {item.fee === "DH" ? "Dövlət hesabına" : `${item.fee} AZN`}
          </Text>
        )}
      </View>
    ),
    [colors]
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.title, { color: colors.accent }]}>
        Kollec ixtisas kodları · 2026
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
          placeholder="Kod, ixtisas və ya kollec axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      <Text style={[styles.count, { color: colors.n580 }]}>
        {filtered.length} ixtisas
      </Text>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.code + i}
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
export function SpecialtyCodesCalculator() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  if (slug === "kollec-ixtisas-kodlari") return <CollegeCodesView />;
  return <UniCodesView />;
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
  groupBtnText: { fontSize: 12, fontWeight: "700" },
  searchWrap: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12 },
  searchInput: { fontSize: 14, paddingVertical: 10 },
  count: { fontSize: 12, marginTop: 10, marginBottom: 6 },
  row: { paddingVertical: 12, borderBottomWidth: 1 },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  code: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  uni: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  spec: { fontSize: 13 },
  fee: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
  empty: { textAlign: "center", paddingVertical: 20 },
});
