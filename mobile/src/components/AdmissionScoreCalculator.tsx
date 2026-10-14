import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import type { ThemeColors } from "@/constants/colors";
import { getCityForEntry } from "@/data/university-cities";

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

export interface AdmissionEntry {
  code?: string;
  university: string;
  specialty: string;
  stream?: string;
  aptitude?: number;
  aptitudeState?: number;
  score?: number;
  stateScore?: number;
  seats?: number;
  language?: string;
  tag?: string;
}

export interface SubgroupOption {
  value: string;
  label: string;
  specialties: string[];
  tag?: string;
  excludeTags?: string[];
}

interface Props {
  entries: AdmissionEntry[];
  scoreMin?: number;
  scoreMax?: number;
  scorePlaceholder?: string;
  borderlineRange?: number;
  lowBlockSpecialties?: string[];
  subgroups?: SubgroupOption[];
}

type Status = "guaranteed" | "borderline" | "notEnough";

interface MappedEntry extends AdmissionEntry {
  _city: string;
  paidDiff: number | null;
  paidChance: number | null;
  paidStatus: Status | null;
  stateDiff: number | null;
  stateChance: number | null;
  stateStatus: Status | null;
  diff: number;
  status: Status;
}

function statusColor(s: Status, c: ThemeColors) {
  if (s === "guaranteed") return { bg: "#064e3b20", border: "#064e3b40", text: "#10b981" };
  if (s === "borderline") return { bg: "#92400e20", border: "#92400e40", text: "#f59e0b" };
  return { bg: "#991b1b20", border: "#991b1b40", text: "#ef4444" };
}

function DiffBadge({ diff, chance, status, colors }: { diff: number; chance: number; status: Status; colors: ThemeColors }) {
  const sc = statusColor(status, colors);
  return (
    <View style={[styles.diffBadge, { backgroundColor: sc.bg }]}>
      <Text style={[styles.diffText, { color: sc.text }]}>
        {diff >= 0 ? "+" : ""}{diff.toFixed(1)} · {chance}%
      </Text>
    </View>
  );
}

function EntryCard({ item, hasScore, colors }: { item: MappedEntry; hasScore: boolean; colors: ThemeColors }) {
  const sc = statusColor(item.status, colors);

  return (
    <View style={[styles.card, { backgroundColor: colors.n195, borderColor: sc.border, borderLeftColor: sc.text, borderLeftWidth: 4 }]}>
      <Text style={[styles.cardUni, { color: colors.n580 }]}>
        {item.code ? `${item.code} · ` : ""}{item.university}
      </Text>
      <Text style={[styles.cardSpec, { color: colors.n940 }]}>
        {item.specialty}
        {item.stream === "Ə" ? " (Əyani)" : item.stream === "Q" ? " (Qiyabi)" : ""}
      </Text>

      {(item.seats != null || item.language) && (
        <View style={styles.badgeRow}>
          {item.seats != null && (
            <View style={[styles.badge, { backgroundColor: "#10b98120" }]}>
              <Text style={[styles.badgeText, { color: "#10b981" }]}>{item.seats} yer</Text>
            </View>
          )}
          {item.language && (
            <View style={[styles.badge, { backgroundColor: "#8b5cf620" }]}>
              <Text style={[styles.badgeText, { color: "#8b5cf6" }]}>{item.language}</Text>
            </View>
          )}
        </View>
      )}

      {item.aptitude != null && (
        <Text style={styles.aptitude}>
          Qabiliyyət imtahanı tələb edir. Min bal: {item.aptitude}
          {item.aptitudeState != null && item.aptitudeState !== item.aptitude ? ` (d.s.: ${item.aptitudeState})` : ""}
        </Text>
      )}

      <View style={styles.scoreGrid}>
        <View style={[styles.scoreCol, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.scoreColLabel, { color: colors.n580 }]}>Ödənişli</Text>
          {item.score != null ? (
            <>
              <Text style={[styles.scoreVal, { color: colors.n940 }]}>{item.score}</Text>
              {hasScore && item.paidDiff !== null && item.paidStatus !== null && (
                <DiffBadge diff={item.paidDiff} chance={item.paidChance!} status={item.paidStatus} colors={colors} />
              )}
            </>
          ) : (
            <Text style={[styles.scoreVal, { color: colors.n400 }]}>—</Text>
          )}
        </View>
        <View style={[styles.scoreCol, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.scoreColLabel, { color: colors.n580 }]}>Dövlət sifarişli</Text>
          {item.stateScore != null ? (
            <>
              <Text style={[styles.scoreVal, { color: colors.n940 }]}>{item.stateScore}</Text>
              {hasScore && item.stateDiff !== null && item.stateStatus !== null && (
                <DiffBadge diff={item.stateDiff} chance={item.stateChance!} status={item.stateStatus} colors={colors} />
              )}
            </>
          ) : (
            <Text style={[styles.scoreVal, { color: colors.n400 }]}>—</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function AdmissionScoreCalculator({
  entries,
  scoreMin = 100,
  scoreMax = 700,
  scorePlaceholder = "350",
  borderlineRange = 10,
  lowBlockSpecialties,
  subgroups,
}: Props) {
  const { colors } = useTheme();
  const [score, setScore] = useState("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [lowBlock, setLowBlock] = useState(false);
  const [subgroup, setSubgroup] = useState(subgroups?.[0]?.value ?? "");

  const effectiveEntries = useMemo(() => {
    let result = entries;
    if (subgroups?.length && subgroup) {
      const active = subgroups.find((s) => s.value === subgroup);
      if (active) {
        const needles = active.specialties.map((s) => s.toLowerCase());
        const hasNameFilter = needles.length > 0;
        result = result.filter((e) => {
          if (active.excludeTags && e.tag && active.excludeTags.includes(e.tag)) return false;
          if (!hasNameFilter && !active.tag) return true;
          const hay = e.specialty.toLowerCase();
          const byName = needles.some((n) => hay.includes(n));
          const byTag = active.tag ? e.tag === active.tag : false;
          return byName || byTag;
        });
      }
    }
    if (lowBlock && lowBlockSpecialties?.length) {
      const needles = lowBlockSpecialties.map((s) => s.toLowerCase());
      result = result.filter((e) => {
        const hay = e.specialty.toLowerCase();
        return needles.some((n) => hay.includes(n));
      });
    }
    return result;
  }, [entries, lowBlock, lowBlockSpecialties, subgroups, subgroup]);

  const entriesWithCity = useMemo(
    () => effectiveEntries.map((e) => ({ ...e, _city: getCityForEntry(e) })),
    [effectiveEntries],
  );

  const results = useMemo(() => {
    const s = parseFloat(score);
    if (!s || s < scoreMin || s > scoreMax) return null;

    let filtered = entriesWithCity;

    if (search.trim()) {
      const q = normalizeText(search.trim());
      filtered = filtered.filter(
        (e) =>
          normalizeText(e.specialty).includes(q) ||
          normalizeText(e.university).includes(q) ||
          (e.code ? e.code.includes(search.trim()) : false),
      );
    }

    const statusOf = (diff: number): Status => {
      if (diff >= borderlineRange) return "guaranteed";
      if (diff >= -borderlineRange) return "borderline";
      return "notEnough";
    };
    const chanceOf = (diff: number) =>
      Math.max(0, Math.min(100, Math.round(100 / (1 + Math.exp(-diff / borderlineRange)))));

    const mapped: MappedEntry[] = filtered.map((e) => {
      let paidDiff: number | null = null;
      let paidChance: number | null = null;
      let paidStatus: Status | null = null;
      if (e.score != null) {
        paidDiff = s - e.score;
        paidChance = chanceOf(paidDiff);
        paidStatus = statusOf(paidDiff);
      }

      let stateDiff: number | null = null;
      let stateChance: number | null = null;
      let stateStatus: Status | null = null;
      if (e.stateScore != null) {
        stateDiff = s - e.stateScore;
        stateChance = chanceOf(stateDiff);
        stateStatus = statusOf(stateDiff);
      }

      const primaryDiff = (paidDiff === null ? stateDiff ?? 0 : paidDiff);
      const primaryStatus = (paidStatus === null ? stateStatus ?? "notEnough" : paidStatus);

      return {
        ...e,
        paidDiff, paidChance, paidStatus,
        stateDiff, stateChance, stateStatus,
        diff: primaryDiff,
        status: primaryStatus,
      };
    });

    mapped.sort((a, b) => {
      const order = { guaranteed: 0, borderline: 1, notEnough: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return b.diff - a.diff;
    });

    const guaranteed = mapped.filter((m) => m.status === "guaranteed").length;
    const borderline = mapped.filter((m) => m.status === "borderline").length;
    const notEnough = mapped.filter((m) => m.status === "notEnough").length;

    return { items: mapped, guaranteed, borderline, notEnough };
  }, [score, search, entriesWithCity, scoreMin, scoreMax, borderlineRange]);

  const visibleItems = results ? (showAll ? results.items : results.items.slice(0, 30)) : [];
  const hasScore = score.trim() !== "";

  return (
    <View>
      {/* Score input */}
      <View style={styles.inputWrap}>
        <Text style={[styles.inputLabel, { color: colors.n700 }]}>Balınız</Text>
        <TextInput
          style={[styles.scoreInput, { backgroundColor: colors.n240, borderColor: colors.n280, color: colors.n940 }]}
          value={score}
          onChangeText={setScore}
          placeholder={scorePlaceholder}
          placeholderTextColor={colors.n400c}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Subgroups */}
      {subgroups && subgroups.length > 0 && (
        <View style={styles.chipRow}>
          {subgroups.map((sg) => {
            const active = sg.value === subgroup;
            return (
              <Pressable
                key={sg.value}
                onPress={() => setSubgroup(sg.value)}
                style={[styles.chip, active ? { backgroundColor: colors.accent } : { backgroundColor: colors.n240 }]}
              >
                <Text style={[styles.chipText, active ? { color: colors.onAccent } : { color: colors.n660 }]}>
                  {sg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Low block toggle */}
      {lowBlockSpecialties && lowBlockSpecialties.length > 0 && (
        <Pressable
          onPress={() => setLowBlock(!lowBlock)}
          style={[styles.toggleRow, { borderColor: lowBlock ? colors.accent : colors.n280 }]}
        >
          <View style={[styles.checkbox, lowBlock && { backgroundColor: colors.accent }]}>
            {lowBlock && <Text style={{ color: colors.onAccent, fontSize: 12, fontWeight: "800" }}>✓</Text>}
          </View>
          <Text style={[styles.toggleLabel, { color: colors.n760 }]}>Blok balı {"<"}100 olan ixtisaslar</Text>
        </Pressable>
      )}

      {/* Search */}
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.n240, borderColor: colors.n280, color: colors.n940 }]}
          value={search}
          onChangeText={setSearch}
          placeholder="İxtisas və ya universitet axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      {/* Results */}
      {results ? (
        results.items.length > 0 ? (
          <View>
            {/* Summary cards */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: "#064e3b20" }]}>
                <Text style={[styles.summaryNum, { color: "#10b981" }]}>{results.guaranteed}</Text>
                <Text style={[styles.summaryLabel, { color: "#10b981" }]}>Yaxşı şans</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: "#92400e20" }]}>
                <Text style={[styles.summaryNum, { color: "#f59e0b" }]}>{results.borderline}</Text>
                <Text style={[styles.summaryLabel, { color: "#f59e0b" }]}>Sərhəddə</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: "#991b1b20" }]}>
                <Text style={[styles.summaryNum, { color: "#ef4444" }]}>{results.notEnough}</Text>
                <Text style={[styles.summaryLabel, { color: "#ef4444" }]}>Çətin</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.n240 }]}>
                <Text style={[styles.summaryNum, { color: colors.n760 }]}>{results.items.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.n580 }]}>Ümumi</Text>
              </View>
            </View>

            {/* Entry cards */}
            {visibleItems.map((item, i) => (
              <EntryCard key={`${item.university}-${item.specialty}-${i}`} item={item} hasScore={hasScore} colors={colors} />
            ))}

            {results.items.length > 30 && (
              <Pressable onPress={() => setShowAll(!showAll)} style={styles.showAllBtn}>
                <Text style={[styles.showAllText, { color: colors.accent }]}>
                  {showAll ? "Daha az göstər" : `Hamısını göstər (${results.items.length})`}
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Text style={[styles.empty, { color: colors.n500c }]}>Uyğun ixtisas tapılmadı.</Text>
        )
      ) : (
        <Text style={[styles.empty, { color: colors.n500c }]}>
          {hasScore ? "Bal düzgün deyil." : "Balınızı daxil edin."}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  scoreInput: { fontSize: 20, fontWeight: "700", borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
  searchInput: { fontSize: 14, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "600" },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#888", alignItems: "center", justifyContent: "center" },
  toggleLabel: { fontSize: 13, fontWeight: "500" },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: "center" },
  summaryNum: { fontSize: 20, fontWeight: "800" },
  summaryLabel: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  card: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  cardUni: { fontSize: 11, marginBottom: 4 },
  cardSpec: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  aptitude: { fontSize: 11, color: "#d97706", marginBottom: 8 },
  scoreGrid: { flexDirection: "row", gap: 8 },
  scoreCol: { flex: 1, borderRadius: 10, padding: 10 },
  scoreColLabel: { fontSize: 10, marginBottom: 4 },
  scoreVal: { fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  diffBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  diffText: { fontSize: 11, fontWeight: "700", fontVariant: ["tabular-nums"] },
  showAllBtn: { paddingVertical: 12, alignItems: "center" },
  showAllText: { fontSize: 14, fontWeight: "600" },
  empty: { fontSize: 14, textAlign: "center", marginTop: 24, lineHeight: 20 },
});
