import { useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import type { ThemeColors } from "@/constants/colors";
import type { PlanEntry } from "@/data/admissions-plan-2026";
import { planGroup1 } from "@/data/admissions-plan-2026-group1";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";
import { planGroup3 } from "@/data/admissions-plan-2026-group3";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";

interface GroupDef {
  id: string;
  roman: string;
  label: string;
  entries: PlanEntry[];
}

const GROUPS: GroupDef[] = [
  { id: "1", roman: "I", label: "I qrup", entries: planGroup1 },
  { id: "2", roman: "II", label: "II qrup", entries: planGroup2 },
  { id: "3", roman: "III", label: "III qrup", entries: planGroup3 },
  { id: "4", roman: "IV", label: "IV qrup", entries: planGroup4 },
];

function byUniversity(entries: PlanEntry[]): [string, PlanEntry[]][] {
  const map = new Map<string, PlanEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.university);
    if (list) list.push(entry);
    else map.set(entry.university, [entry]);
  }
  return [...map];
}

function UniversitySection({
  university,
  rows,
  colors,
}: {
  university: string;
  rows: PlanEntry[];
  colors: ThemeColors;
}) {
  return (
    <View style={[s.uniCard, { backgroundColor: colors.n195, borderColor: colors.n300 }]}>
      <View style={[s.uniHeader, { backgroundColor: colors.n240 }]}>
        <Text style={[s.uniName, { color: colors.n940 }]}>{university}</Text>
      </View>
      {rows.map((row) => (
        <View key={row.code} style={[s.row, { borderColor: colors.n280 }]}>
          <View style={s.rowLeft}>
            <Text style={[s.code, { color: colors.accent }]}>{row.code}</Text>
            <View style={s.specWrap}>
              <Text style={[s.specName, { color: colors.n840 }]}>{row.specialty}</Text>
              <View style={s.badges}>
                {row.subgroup && (
                  <View style={[s.badge, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#1d4ed8" }}>
                      {row.subgroup}
                    </Text>
                  </View>
                )}
                {row.aptitudeRequired && (
                  <View style={[s.badge, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#b45309" }}>
                      Qabiliyyət
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={s.rowRight}>
            <Text style={[s.seats, { color: colors.n700 }]}>{row.seats} yer</Text>
            <Text style={[s.lang, { color: colors.n500c }]}>{row.language}</Text>
            {row.fee && (
              <Text style={[s.fee, { color: colors.n580 }]}>{row.fee}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

export function IxtisasKodlariCalculator() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    return GROUPS.filter((g) => activeGroup === "all" || g.id === activeGroup).map((g) => {
      const entries = q
        ? g.entries.filter(
            (e) =>
              e.code.includes(q) ||
              e.specialty.toLocaleLowerCase("az").includes(q) ||
              e.university.toLocaleLowerCase("az").includes(q)
          )
        : g.entries;
      return { ...g, grouped: byUniversity(entries), total: entries.length };
    });
  }, [query, activeGroup]);

  const totalFound = visible.reduce((sum, g) => sum + g.total, 0);
  const totalSeats = visible.reduce(
    (sum, g) =>
      sum +
      g.grouped.reduce(
        (s, [, rows]) => s + rows.reduce((n, r) => n + r.seats, 0),
        0
      ),
    0
  );

  return (
    <View>
      {/* Search */}
      <View style={[s.searchWrap, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <TextInput
          style={[s.searchInput, { color: colors.n940 }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Kod, ixtisas və ya universitet axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      {/* Group filter */}
      <View style={s.groupRow}>
        {[{ id: "all", label: "Hamısı" }, ...GROUPS.map((g) => ({ id: g.id, label: `${g.roman} qrup` }))].map(
          (tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveGroup(tab.id)}
              style={[
                s.groupBtn,
                {
                  backgroundColor: activeGroup === tab.id ? colors.accent : colors.n240,
                  borderColor: activeGroup === tab.id ? colors.accent : colors.n300,
                },
              ]}
            >
              <Text
                style={[
                  s.groupBtnText,
                  { color: activeGroup === tab.id ? colors.onAccent : colors.n700 },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Text style={[s.countText, { color: colors.n580 }]}>
        {totalFound} ixtisas · {totalSeats} plan yeri
      </Text>

      {totalFound === 0 ? (
        <Text style={[s.empty, { color: colors.n500c }]}>
          Axtarışa uyğun ixtisas tapılmadı.
        </Text>
      ) : (
        visible.map((group) =>
          group.total === 0
            ? null
            : (
                <View key={group.id}>
                  <Text style={[s.groupTitle, { color: colors.n860 }]}>
                    {group.label} · {group.total} ixtisas
                  </Text>
                  {group.grouped.map(([uni, rows]) => (
                    <UniversitySection
                      key={uni}
                      university={uni}
                      rows={rows}
                      colors={colors}
                    />
                  ))}
                </View>
              )
        )
      )}

      <View style={[s.sourceNote, { backgroundColor: colors.n240 }]}>
        <Text style={[s.sourceText, { color: colors.n580 }]}>
          Mənbə: DİM 2026 «Abituriyent 4» jurnalı. Rəqəmlər 2026/2027 tədris ili üçündür.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  searchWrap: { borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  searchInput: { fontSize: 14, paddingHorizontal: 14, paddingVertical: 12 },
  groupRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  groupBtn: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  groupBtnText: { fontSize: 12, fontWeight: "600" },
  countText: { fontSize: 12, marginBottom: 14 },
  empty: { fontSize: 14, textAlign: "center", marginTop: 24 },
  groupTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8, marginTop: 8 },
  uniCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
  uniHeader: { paddingHorizontal: 12, paddingVertical: 8 },
  uniName: { fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1 },
  rowLeft: { flex: 1, flexDirection: "row", gap: 8, paddingRight: 8 },
  code: { fontSize: 12, fontWeight: "700", width: 56 },
  specWrap: { flex: 1 },
  specName: { fontSize: 12, lineHeight: 16 },
  badges: { flexDirection: "row", gap: 4, marginTop: 4 },
  badge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  rowRight: { alignItems: "flex-end" },
  seats: { fontSize: 12, fontWeight: "600" },
  lang: { fontSize: 10, marginTop: 2 },
  fee: { fontSize: 10, marginTop: 2 },
  sourceNote: { borderRadius: 12, padding: 14, marginTop: 16 },
  sourceText: { fontSize: 11, lineHeight: 16 },
});
