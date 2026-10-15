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
import { admissionsMagistr2027 } from "@/data/admissions-magistr-2027";
import type { MagistrEntry } from "@/data/admissions-magistr-2027";

const SCORE_MIN = 0;
const SCORE_MAX = 100;
const BORDERLINE_RANGE = 5;
const INITIAL_COUNT = 30;

type Status = "guaranteed" | "borderline" | "notEnough";

interface ScoredEntry extends MagistrEntry {
  diff: number;
  chance: number;
  status: Status;
}

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

function getStatus(diff: number): Status {
  if (diff >= BORDERLINE_RANGE) return "guaranteed";
  if (diff >= -BORDERLINE_RANGE) return "borderline";
  return "notEnough";
}

function getChance(diff: number): number {
  return Math.max(0, Math.min(100, Math.round(100 / (1 + Math.exp(-diff / 5)))));
}

const STATUS_ORDER: Record<Status, number> = {
  guaranteed: 0,
  borderline: 1,
  notEnough: 2,
};

export function MagistrScoresCalculator() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [scoreInput, setScoreInput] = useState("");
  const [showAll, setShowAll] = useState(false);

  const userScore = parseFloat(scoreInput) || 0;

  const results = useMemo(() => {
    let items = admissionsMagistr2027;

    if (query.trim()) {
      const q = normalize(query.trim());
      items = items.filter(
        (e) =>
          normalize(e.university).includes(q) ||
          normalize(e.specialty).includes(q) ||
          (e.code && e.code.toLowerCase().includes(q))
      );
    }

    if (userScore <= 0) return [];

    const scored: ScoredEntry[] = items
      .filter((e) => e.score != null || e.stateScore != null)
      .map((e) => {
        const threshold = e.score ?? e.stateScore ?? 0;
        const diff = userScore - threshold;
        return {
          ...e,
          diff,
          chance: getChance(diff),
          status: getStatus(diff),
        };
      });

    scored.sort((a, b) => {
      const so = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (so !== 0) return so;
      return b.diff - a.diff;
    });

    return scored;
  }, [query, userScore]);

  const counts = useMemo(() => {
    let guaranteed = 0;
    let borderline = 0;
    let notEnough = 0;
    for (const r of results) {
      if (r.status === "guaranteed") guaranteed++;
      else if (r.status === "borderline") borderline++;
      else notEnough++;
    }
    return { guaranteed, borderline, notEnough };
  }, [results]);

  const displayData = showAll ? results : results.slice(0, INITIAL_COUNT);

  const statusColor = useCallback(
    (status: Status) => {
      if (status === "guaranteed") return "#16a34a";
      if (status === "borderline") return "#d97706";
      return "#dc2626";
    },
    []
  );

  const statusBg = useCallback(
    (status: Status) => {
      if (status === "guaranteed") return "#dcfce7";
      if (status === "borderline") return "#fef3c7";
      return "#fee2e2";
    },
    []
  );

  const statusLabel = useCallback((status: Status) => {
    if (status === "guaranteed") return "Yaxşı şans";
    if (status === "borderline") return "Sərhəddə";
    return "Çətin";
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ScoredEntry }) => (
      <View
        style={[
          styles.row,
          {
            borderLeftColor: statusColor(item.status),
            borderLeftWidth: 3,
            borderBottomColor: colors.n260,
          },
        ]}
      >
        <View style={styles.rowHeader}>
          {item.code ? (
            <Text style={[styles.code, { color: colors.n580 }]}>{item.code}</Text>
          ) : null}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusBg(item.status) },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
              {statusLabel(item.status)} ({item.chance}%)
            </Text>
          </View>
        </View>
        <Text style={[styles.uni, { color: colors.n840 }]}>{item.university}</Text>
        <Text style={[styles.spec, { color: colors.n660 }]}>{item.specialty}</Text>
        <View style={styles.rowBottom}>
          {item.score != null && (
            <Text style={[styles.score, { color: colors.accent }]}>
              Ödənişli: {item.score}
            </Text>
          )}
          {item.stateScore != null && (
            <Text style={[styles.score, { color: "#16a34a" }]}>
              Dövlət s.: {item.stateScore}
            </Text>
          )}
        </View>
      </View>
    ),
    [colors, statusColor, statusBg, statusLabel]
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.title, { color: colors.accent }]}>
        Magistr keçid balları · 2027
      </Text>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.n240, borderColor: colors.n280 },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: colors.n940 }]}
          value={scoreInput}
          onChangeText={setScoreInput}
          placeholder="Balınızı daxil edin (0-100)"
          placeholderTextColor={colors.n400c}
          keyboardType="numeric"
        />
      </View>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.n240, borderColor: colors.n280, marginTop: 8 },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: colors.n940 }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Universitet, ixtisas və ya kod axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      {userScore > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#dcfce7" }]}>
            <Text style={[styles.summaryCount, { color: "#16a34a" }]}>
              {counts.guaranteed}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#16a34a" }]}>
              Yaxşı şans
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#fef3c7" }]}>
            <Text style={[styles.summaryCount, { color: "#d97706" }]}>
              {counts.borderline}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#d97706" }]}>
              Sərhəddə
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#fee2e2" }]}>
            <Text style={[styles.summaryCount, { color: "#dc2626" }]}>
              {counts.notEnough}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#dc2626" }]}>Çətin</Text>
          </View>
        </View>
      )}

      <Text style={[styles.count, { color: colors.n580 }]}>
        {results.length} nəticə
        {!showAll && results.length > INITIAL_COUNT
          ? ` (ilk ${INITIAL_COUNT} göstərilir)`
          : ""}
      </Text>

      <FlatList
        data={displayData}
        renderItem={renderItem}
        keyExtractor={(item, i) => (item.code || "") + i}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.n500c }]}>
            {userScore > 0
              ? "Nəticə tapılmadı"
              : "Balınızı daxil edin"}
          </Text>
        }
        ListFooterComponent={
          !showAll && results.length > INITIAL_COUNT ? (
            <Pressable
              style={[styles.showAllBtn, { backgroundColor: colors.accent }]}
              onPress={() => setShowAll(true)}
            >
              <Text style={styles.showAllText}>
                Hamısını göstər ({results.length})
              </Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  searchWrap: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12 },
  searchInput: { fontSize: 14, paddingVertical: 10 },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  summaryCount: { fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
  summaryLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  count: { fontSize: 12, marginTop: 10, marginBottom: 6 },
  row: { paddingVertical: 12, paddingLeft: 10, borderBottomWidth: 1 },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  code: { fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "700" },
  uni: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  spec: { fontSize: 13 },
  rowBottom: { flexDirection: "row", gap: 12, marginTop: 6 },
  score: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  empty: { textAlign: "center", paddingVertical: 20 },
  showAllBtn: {
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  showAllText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
