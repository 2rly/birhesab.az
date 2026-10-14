import { useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import type { ThemeColors } from "@/constants/colors";
import {
  subbakalavrMatches,
  subbakalavrRules,
  subbakalavrAptitude,
  type SubbakalavrMatch,
} from "@/data/subbakalavr-uygunluq-2026";

const GROUPS = (() => {
  const seen = new Map<string, string>();
  for (const match of subbakalavrMatches) {
    if (match.group && !seen.has(match.group.code)) seen.set(match.group.code, match.group.name);
  }
  return [...seen].map(([code, name]) => ({ code, name }));
})();

const LEVEL_LABEL: Record<string, string> = {
  "orta-ixtisas": "Orta ixtisas",
  "pese-tehsili": "Peşə təhsili",
};

function MatchCard({ match, colors }: { match: SubbakalavrMatch; colors: ThemeColors }) {
  const [expanded, setExpanded] = useState(false);
  const visibleSources = expanded ? match.sources : match.sources.slice(0, 3);

  return (
    <View style={[s.card, { backgroundColor: colors.n195, borderColor: colors.n300 }]}>
      {match.group && (
        <Text style={[s.groupLabel, { color: colors.n500c }]}>
          {match.group.code} · {match.group.name}
        </Text>
      )}
      {match.targets.map((t) => (
        <Text key={t.code} style={[s.targetName, { color: colors.n940 }]}>
          <Text style={{ color: colors.accent }}>{t.code}</Text> {t.name}
        </Text>
      ))}
      <Text style={[s.sourceCount, { color: colors.n580 }]}>
        Uyğun subbakalavr ixtisası: {match.sources.length}
      </Text>

      <View style={[s.sourceTable, { borderColor: colors.n280 }]}>
        <View style={[s.sourceHeader, { backgroundColor: colors.n240 }]}>
          <Text style={[s.colCode, s.headerText, { color: colors.n580 }]}>Şifr</Text>
          <Text style={[s.colName, s.headerText, { color: colors.n580 }]}>İxtisas</Text>
          <Text style={[s.colLevel, s.headerText, { color: colors.n580 }]}>Pillə</Text>
        </View>
        {visibleSources.map((src, i) => (
          <View
            key={`${src.code}-${i}`}
            style={[s.sourceRow, { borderColor: colors.n280 }]}
          >
            <Text style={[s.colCode, { color: colors.accent, fontWeight: "600" }]}>{src.code}</Text>
            <Text style={[s.colName, { color: colors.n840 }]} numberOfLines={2}>{src.name}</Text>
            <View
              style={[
                s.levelBadge,
                {
                  backgroundColor:
                    src.level === "orta-ixtisas" ? "#eff6ff" : "#ecfdf5",
                  borderColor:
                    src.level === "orta-ixtisas" ? "#bfdbfe" : "#a7f3d0",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "700",
                  color: src.level === "orta-ixtisas" ? "#1d4ed8" : "#047857",
                }}
              >
                {LEVEL_LABEL[src.level]}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {match.sources.length > 3 && (
        <Pressable onPress={() => setExpanded(!expanded)} style={s.toggleBtn}>
          <Text style={[s.toggleText, { color: colors.accent }]}>
            {expanded ? "Azalt" : `Hamısını göstər (${match.sources.length})`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function SubbakalavrUygunluqCalculator() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [showRules, setShowRules] = useState(false);
  const [showAptitude, setShowAptitude] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    return subbakalavrMatches.filter((match) => {
      if (activeGroup !== "all" && match.group?.code !== activeGroup) return false;
      if (!q) return true;
      return (
        match.targets.some(
          (x) => x.code.includes(q) || x.name.toLocaleLowerCase("az").includes(q)
        ) ||
        match.sources.some(
          (x) =>
            x.code.toLocaleLowerCase("az").includes(q) ||
            x.name.toLocaleLowerCase("az").includes(q)
        )
      );
    });
  }, [query, activeGroup]);

  const shownSources = visible.reduce((n, m) => n + m.sources.length, 0);

  return (
    <View>
      {/* Rules accordion */}
      <Pressable
        onPress={() => setShowRules(!showRules)}
        style={[s.accordion, { backgroundColor: colors.n240, borderColor: colors.n300 }]}
      >
        <Text style={[s.accordionTitle, { color: colors.n840 }]}>
          İxtisas seçimi qaydaları ({subbakalavrRules.length} bənd)
        </Text>
        <Text style={{ color: colors.n580 }}>{showRules ? "▲" : "▼"}</Text>
      </Pressable>
      {showRules && (
        <View style={[s.rulesBox, { backgroundColor: colors.n240, borderColor: colors.n300 }]}>
          {subbakalavrRules.map((rule, i) => (
            <Text key={i} style={[s.ruleText, { color: colors.n700 }]}>
              {i + 1}. {rule.replace(/^\s*\d+\.\s*/, "")}
            </Text>
          ))}
        </View>
      )}

      {/* Aptitude accordion */}
      <Pressable
        onPress={() => setShowAptitude(!showAptitude)}
        style={[s.accordion, { backgroundColor: colors.n240, borderColor: colors.n300, marginTop: 8 }]}
      >
        <Text style={[s.accordionTitle, { color: colors.n840 }]}>
          Qabiliyyət imtahanı şərtləri ({subbakalavrAptitude.length})
        </Text>
        <Text style={{ color: colors.n580 }}>{showAptitude ? "▲" : "▼"}</Text>
      </Pressable>
      {showAptitude && (
        <View style={[s.rulesBox, { backgroundColor: colors.n240, borderColor: colors.n300 }]}>
          {subbakalavrAptitude.map((row, i) => (
            <View key={i} style={s.aptRow}>
              <Text style={[s.aptSpecialty, { color: colors.n840 }]}>{row.specialty}</Text>
              <Text style={[s.aptDetail, { color: colors.n580 }]}>
                Min bal: {row.minScore} · II mərhələ: {row.stage2} · Yekun: {row.result}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={[s.searchWrap, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <TextInput
          style={[s.searchInput, { color: colors.n940 }]}
          value={query}
          onChangeText={setQuery}
          placeholder="İxtisas adı, şifri və ya kodu..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      {/* Group filter */}
      <View style={s.groupRow}>
        {[{ code: "all", name: "Hamısı" }, ...GROUPS].map((tab) => (
          <Pressable
            key={tab.code}
            onPress={() => setActiveGroup(tab.code)}
            style={[
              s.groupBtn,
              {
                backgroundColor: activeGroup === tab.code ? colors.accent : colors.n240,
                borderColor: activeGroup === tab.code ? colors.accent : colors.n300,
              },
            ]}
          >
            <Text
              style={[
                s.groupBtnText,
                {
                  color: activeGroup === tab.code ? colors.onAccent : colors.n700,
                },
              ]}
              numberOfLines={1}
            >
              {tab.code === "all" ? tab.name : tab.code}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[s.countText, { color: colors.n580 }]}>
        {visible.length} bakalavriat ixtisası · {shownSources} uyğun subbakalavr
      </Text>

      {visible.length === 0 ? (
        <Text style={[s.empty, { color: colors.n500c }]}>
          Axtarışa uyğun ixtisas tapılmadı.
        </Text>
      ) : (
        <FlatList<SubbakalavrMatch>
          data={visible}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <MatchCard match={item} colors={colors} />}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  accordion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  accordionTitle: { fontSize: 13, fontWeight: "700", flex: 1 },
  rulesBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 14,
    marginTop: -1,
  },
  ruleText: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  aptRow: { marginBottom: 10 },
  aptSpecialty: { fontSize: 12, fontWeight: "600" },
  aptDetail: { fontSize: 11, marginTop: 2 },
  searchWrap: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  searchInput: { fontSize: 14, paddingHorizontal: 14, paddingVertical: 12 },
  groupRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  groupBtn: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  groupBtnText: { fontSize: 12, fontWeight: "600" },
  countText: { fontSize: 12, marginBottom: 12 },
  empty: { fontSize: 14, textAlign: "center", marginTop: 24 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  groupLabel: { fontSize: 10, marginBottom: 4 },
  targetName: { fontSize: 14, fontWeight: "700", lineHeight: 20, marginBottom: 2 },
  sourceCount: { fontSize: 11, marginBottom: 10 },
  sourceTable: { borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  sourceHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerText: { fontSize: 10, fontWeight: "600" },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  colCode: { width: 80, fontSize: 12 },
  colName: { flex: 1, fontSize: 12, paddingRight: 6 },
  colLevel: { width: 60 },
  levelBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  toggleBtn: { alignItems: "center", marginTop: 8 },
  toggleText: { fontSize: 12, fontWeight: "600" },
});
