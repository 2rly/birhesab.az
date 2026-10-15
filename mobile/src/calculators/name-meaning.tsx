import { useState, useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { adlar, type NameEntry, type Gender } from "@/data/adlar";

const MAX_RESULTS = 50;

type GenderFilter = "all" | Gender;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

const GENDER_COLORS: Record<Gender, string> = {
  "kişi": "#3b82f6",
  "qadın": "#ec4899",
  uniseks: "#8b5cf6",
};

const GENDER_LABELS: Record<Gender, string> = {
  "kişi": "Kişi",
  "qadın": "Qadın",
  uniseks: "Uniseks",
};

const allOrigins = Array.from(new Set(adlar.map((a) => a.origin))).sort();

const totalMale = adlar.filter((a) => a.gender === "kişi").length;
const totalFemale = adlar.filter((a) => a.gender === "qadın").length;
const totalUnisex = adlar.filter((a) => a.gender === "uniseks").length;

export function NameMeaningCalculator() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [originFilter, setOriginFilter] = useState<string | null>(null);

  const { exactMatch, results } = useMemo(() => {
    const q = search.trim();
    const nq = q ? normalize(q) : "";

    let filtered = adlar;

    if (genderFilter !== "all") {
      filtered = filtered.filter((a) => a.gender === genderFilter);
    }
    if (originFilter) {
      filtered = filtered.filter((a) => a.origin === originFilter);
    }

    let exact: NameEntry | null = null;

    if (nq) {
      exact = filtered.find((a) => normalize(a.name) === nq) ?? null;
      filtered = filtered.filter((a) => normalize(a.name).includes(nq));
    }

    return { exactMatch: exact, results: filtered.slice(0, MAX_RESULTS) };
  }, [search, genderFilter, originFilter]);

  const totalFiltered = useMemo(() => {
    let filtered = adlar;
    const q = search.trim();
    const nq = q ? normalize(q) : "";
    if (genderFilter !== "all") filtered = filtered.filter((a) => a.gender === genderFilter);
    if (originFilter) filtered = filtered.filter((a) => a.origin === originFilter);
    if (nq) filtered = filtered.filter((a) => normalize(a.name).includes(nq));
    return filtered.length;
  }, [search, genderFilter, originFilter]);

  const renderItem = useCallback(
    ({ item }: { item: NameEntry }) => {
      const gc = GENDER_COLORS[item.gender];
      return (
        <View style={[styles.card, { backgroundColor: colors.n195, borderColor: colors.n280 }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.nameText, { color: colors.n940 }]}>{item.name}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: gc + "20" }]}>
                <Text style={[styles.badgeText, { color: gc }]}>{GENDER_LABELS[item.gender]}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.n240 }]}>
                <Text style={[styles.badgeText, { color: colors.n660 }]}>{item.origin}</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.meaningText, { color: colors.n760 }]}>{item.meaning}</Text>
          {item.note && (
            <Text style={[styles.noteText, { color: colors.n580 }]}>{item.note}</Text>
          )}
        </View>
      );
    },
    [colors]
  );

  const keyExtractor = useCallback(
    (item: NameEntry, index: number) => item.name + index,
    []
  );

  const genderOptions: { value: GenderFilter; label: string }[] = [
    { value: "all", label: "Hamısı" },
    { value: "kişi", label: "Kişi" },
    { value: "qadın", label: "Qadın" },
    { value: "uniseks", label: "Uniseks" },
  ];

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.statNum, { color: colors.accent }]}>{adlar.length}</Text>
          <Text style={[styles.statLabel, { color: colors.n580 }]}>Toplam</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#3b82f6" + "15" }]}>
          <Text style={[styles.statNum, { color: "#3b82f6" }]}>{totalMale}</Text>
          <Text style={[styles.statLabel, { color: colors.n580 }]}>Kişi</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#ec4899" + "15" }]}>
          <Text style={[styles.statNum, { color: "#ec4899" }]}>{totalFemale}</Text>
          <Text style={[styles.statLabel, { color: colors.n580 }]}>Qadın</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#8b5cf6" + "15" }]}>
          <Text style={[styles.statNum, { color: "#8b5cf6" }]}>{totalUnisex}</Text>
          <Text style={[styles.statLabel, { color: colors.n580 }]}>Uniseks</Text>
        </View>
      </View>

      {/* Search */}
      <InputField
        label="Ad axtarışı"
        value={search}
        onChangeText={setSearch}
        placeholder="Məsələn: Aysel"
      />

      {/* Gender filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.n700 }]}>Cins</Text>
        <View style={styles.chipRow}>
          {genderOptions.map((opt) => {
            const active = genderFilter === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setGenderFilter(opt.value)}
                style={[
                  styles.chip,
                  { borderColor: colors.n280 },
                  active && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.n660 },
                    active && { color: colors.onAccent },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Origin filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.n700 }]}>Mənşə</Text>
        <FlatList
          data={[null, ...allOrigins]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item ?? "all"}
          renderItem={({ item }) => {
            const active = originFilter === item;
            return (
              <Pressable
                onPress={() => setOriginFilter(item)}
                style={[
                  styles.chip,
                  { borderColor: colors.n280 },
                  active && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.n660 },
                    active && { color: colors.onAccent },
                  ]}
                >
                  {item ?? "Hamısı"}
                </Text>
              </Pressable>
            );
          }}
          style={styles.originList}
        />
      </View>

      {/* Count */}
      <Text style={[styles.countText, { color: colors.n580 }]}>
        {totalFiltered} nəticə{totalFiltered > MAX_RESULTS ? ` (ilk ${MAX_RESULTS} göstərilir)` : ""}
      </Text>

      {/* Exact match highlight */}
      {exactMatch && (
        <View style={[styles.exactCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent }]}>
          <Text style={[styles.exactLabel, { color: colors.accent }]}>Tam uyğunluq</Text>
          <Text style={[styles.exactName, { color: colors.n940 }]}>{exactMatch.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: GENDER_COLORS[exactMatch.gender] + "20" }]}>
              <Text style={[styles.badgeText, { color: GENDER_COLORS[exactMatch.gender] }]}>
                {GENDER_LABELS[exactMatch.gender]}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.n240 }]}>
              <Text style={[styles.badgeText, { color: colors.n660 }]}>{exactMatch.origin}</Text>
            </View>
          </View>
          <Text style={[styles.exactMeaning, { color: colors.n760 }]}>{exactMatch.meaning}</Text>
          {exactMatch.note && (
            <Text style={[styles.noteText, { color: colors.n580 }]}>{exactMatch.note}</Text>
          )}
        </View>
      )}

      {/* Results */}
      {results.length === 0 && search.trim().length > 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>
            Bu ad lügətdə tapılmadı
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  statNum: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
  filterSection: { marginBottom: 12 },
  filterLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  originList: { marginTop: 2 },
  countText: { fontSize: 12, marginBottom: 10 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nameText: { fontSize: 18, fontWeight: "700" },
  badgeRow: { flexDirection: "row", gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  meaningText: { fontSize: 14, lineHeight: 20 },
  noteText: { fontSize: 12, fontStyle: "italic", marginTop: 4, lineHeight: 17 },
  exactCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  exactLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  exactName: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  exactMeaning: { fontSize: 15, lineHeight: 22, marginTop: 6 },
  emptyBox: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, textAlign: "center" },
});
