// Subbakalavr — saytdakı subbakalavr-ixtisas-uygunlugu (ixtisas uyğunluğu cədvəli)
// və subbakalavr-kecid-ballari (keçid balları) səhifələrinin mobil portu.
// Səhifə route slug-una görə seçilir.

import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ChipGroup } from "@/components/Controls";
import { BulletList, Collapsible, FormulaSection, InfoBox, RelatedCalculators } from "@/components/Content";
import { Badge, BADGE, PageIntro, ShowMore, resolveRelatedIds, type AdmissionEntry } from "./_admission-parts";

import { subbakalavrAptitude, subbakalavrMatches, subbakalavrRules } from "@/data/subbakalavr-uygunluq-2026";
import { admissionsGroup1Sub } from "@/data/admissions-group1-subbakalavr-2026";
import { admissionsGroup2Sub } from "@/data/admissions-group2-subbakalavr-2026";
import { admissionsGroup4Sub } from "@/data/admissions-group4-subbakalavr-2026";
import { admissionsGroup5Sub } from "@/data/admissions-group5-subbakalavr-2026";

// ═══════════════════════════════════════════════════════════════════════════════
// Subbakalavrların ixtisas uyğunluq kodları 2026
// ═══════════════════════════════════════════════════════════════════════════════

const SOURCE = "DİM 2026 «Subbakalavrların ixtisas seçimi elanı» buraxılışından götürülüb";

const TOTAL_TARGETS = subbakalavrMatches.reduce((n, m) => n + m.targets.length, 0);
const TOTAL_SOURCES = subbakalavrMatches.reduce((n, m) => n + m.sources.length, 0);

const GROUPS = (() => {
  const seen = new Map<string, string>();
  for (const match of subbakalavrMatches) {
    if (match.group && !seen.has(match.group.code)) seen.set(match.group.code, match.group.name);
  }
  return [...seen].map(([code, name]) => ({ code, name }));
})();

const MATCH_T = {
  title: "Subbakalavrların ixtisas uyğunluq kodları 2026",
  description:
    "Subbakalavr dərəcəsi almış şəxslərin bakalavriata qəbulu üçün ixtisas uyğunluğu cədvəli: bitirdiyiniz ixtisasa görə seçə biləcəyiniz bakalavriat ixtisasları və kodları.",
  formulaTitle: "Bu cədvəl nə üçündür?",
  formulaContent: `Orta ixtisas təhsili pilləsini və ya yüksək texniki peşə təhsili səviyyəsini bitirib "subbakalavr" peşə-ixtisas dərəcəsi almış şəxslər qəbul imtahanı vermədən, müsabiqə yolu ilə ali təhsil müəssisələrinə qəbul ola bilərlər.

Lakin subbakalavr istənilən ixtisası seçə bilmir — yalnız **bitirdiyi ixtisasa uyğun olan** bakalavriat ixtisaslarını seçmək hüququ var. Hansı ixtisasın hansına uyğun olduğu bu cədvəllə müəyyən edilir. Uyğunluq Elm və Təhsil Nazirliyi tərəfindən, DİM ilə razılaşdırılmaqla təsdiqlənib.

Cədvəldə ${TOTAL_TARGETS} bakalavriat ixtisası və onlara uyğun ${TOTAL_SOURCES} subbakalavr ixtisası var.

Necə istifadə etməli:
• Axtarış xanasına bitirdiyiniz ixtisasın adını və ya şifrini yazın
• Tapılan bənddə sağda həmin ixtisasla seçə biləcəyiniz bakalavriat ixtisasları göstərilir
• Bakalavriat ixtisasının 7 rəqəmli kodunu elektron ixtisas seçimi ərizəsinə yazırsınız

Şifrlərin oxunuşu:
• Hərf prefiksli şifrlər (M, HS, T və s.) — orta ixtisas təhsili pilləsi
• Rəqəmli şifrlər — peşə təhsili pilləsinin yüksək peşə təhsili səviyyəsi

Qeyd: subbakalavr yalnız orta ixtisas və ya peşə təhsilini aldığı **tədris dilinə uyğun** ixtisasları seçə bilər.

Mənbə: ${SOURCE}.`,
};

const LEVEL_LABEL: Record<string, string> = {
  "orta-ixtisas": "Orta ixtisas təhsili",
  "pese-tehsili": "Peşə təhsili",
};

const MATCH_INITIAL = 20;
const MATCH_STEP = 20;

function MatchesView() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [limit, setLimit] = useState(MATCH_INITIAL);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    return subbakalavrMatches.filter((match) => {
      if (activeGroup !== "all" && match.group?.code !== activeGroup) return false;
      if (!q) return true;
      return (
        match.targets.some((x) => x.code.includes(q) || x.name.toLocaleLowerCase("az").includes(q)) ||
        match.sources.some(
          (x) => x.code.toLocaleLowerCase("az").includes(q) || x.name.toLocaleLowerCase("az").includes(q)
        )
      );
    });
  }, [query, activeGroup]);

  const shownSources = visible.reduce((n, m) => n + m.sources.length, 0);

  return (
    <View>
      <PageIntro slug="subbakalavr-ixtisas-uygunlugu" text={MATCH_T.description} />

      <Collapsible title={`Subbakalavrların ixtisas seçimi qaydaları (${subbakalavrRules.length} bənd)`}>
        <BulletList ordered items={subbakalavrRules.map((rule) => rule.replace(/^\s*\d+\.\s*/, ""))} />
      </Collapsible>

      <Collapsible
        title={`Qabiliyyət imtahanı tələb edən ixtisaslar üzrə müsabiqə şərtləri (${subbakalavrAptitude.length} ixtisas)`}
      >
        {subbakalavrAptitude.map((row, i) => {
          const isNewGroup = i === 0 || subbakalavrAptitude[i - 1].group !== row.group;
          return (
            <View key={`${row.specialty}-${i}`}>
              {isNewGroup && <Text style={[styles.aptGroup, { color: colors.accent }]}>{row.group}</Text>}
              <View style={[styles.aptRow, { borderBottomColor: colors.n240 }]}>
                <Text style={[styles.aptSpec, { color: colors.n940 }]}>{row.specialty}</Text>
                <View style={styles.aptMeta}>
                  <Text style={[styles.metaKey, { color: colors.n580 }]}>
                    Minimal bal: <Text style={[styles.metaVal, { color: colors.n840 }]}>{row.minScore}</Text>
                  </Text>
                  <Text style={[styles.metaKey, { color: colors.n580 }]}>
                    II mərhələ: <Text style={[styles.metaVal, { color: colors.n840 }]}>{row.stage2}</Text>
                  </Text>
                  <Text style={[styles.metaKey, { color: colors.n580 }]}>
                    Yekun nəticə: <Text style={[styles.metaVal, { color: colors.n840 }]}>{row.result}</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </Collapsible>

      <View style={{ height: 8 }} />

      <InputField
        label="Bitirdiyiniz ixtisası və ya seçmək istədiyiniz bakalavriat ixtisasını yazın"
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setLimit(MATCH_INITIAL);
        }}
        placeholder="məs. Mühasibat, HS 140102, 6006010, Proqram təminatı"
      />

      <ChipGroup
        label="İxtisas qrupu"
        options={[
          { value: "all", label: "Hamısı" },
          ...GROUPS.map((g) => ({ value: g.code, label: `${g.code} ${g.name}` })),
        ]}
        selected={activeGroup}
        onSelect={(v) => {
          setActiveGroup(v);
          setLimit(MATCH_INITIAL);
        }}
      />

      <Text style={[styles.summary, { color: colors.n580 }]}>
        <Text style={{ fontWeight: "700", color: colors.n940 }}>{visible.length}</Text> bakalavriat ixtisası ·{" "}
        <Text style={{ fontWeight: "700", color: colors.n940 }}>{shownSources}</Text> uyğun subbakalavr ixtisası
      </Text>

      {visible.length === 0 && (
        <View style={[styles.box, { backgroundColor: colors.n200, borderColor: colors.n280, paddingVertical: 22 }]}>
          <Text style={{ textAlign: "center", color: colors.n580, fontSize: 14 }}>Axtarışa uyğun ixtisas tapılmadı.</Text>
        </View>
      )}

      <View style={{ gap: 12 }}>
        {visible.slice(0, limit).map((match, index) => (
          <View
            key={`${match.targets[0]?.code ?? "x"}-${index}`}
            style={[styles.matchCard, { borderColor: colors.n280, backgroundColor: colors.n200 }]}
          >
            <View style={[styles.matchHeader, { backgroundColor: colors.accent + "14", borderBottomColor: colors.n280 }]}>
              {match.group && (
                <Text style={[styles.small, { color: colors.n580 }]}>
                  {match.group.code} · {match.group.name}
                </Text>
              )}
              {match.targets.map((target) => (
                <Text key={target.code} style={[styles.targetTitle, { color: colors.n960 }]}>
                  <Text style={{ color: colors.accent }}>{target.code}</Text> {target.name}
                </Text>
              ))}
              <Text style={[styles.small, { color: colors.n580, marginTop: 4 }]}>
                Bu ixtisası seçə bilən subbakalavr ixtisasları:{" "}
                <Text style={{ fontWeight: "700", color: colors.n940 }}>{match.sources.length}</Text>
              </Text>
            </View>
            <View style={[styles.colHead, { backgroundColor: colors.n240 }]}>
              <Text style={[styles.colHeadText, { color: colors.n580 }]}>Şifr · Bitirdiyiniz ixtisas · Təhsil pilləsi</Text>
            </View>
            {match.sources.map((source, i) => (
              <View key={`${source.code}-${i}`} style={[styles.sourceRow, { borderBottomColor: colors.n240 }]}>
                <Text style={[styles.sourceCode, { color: colors.n940 }]}>{source.code}</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.sourceName, { color: colors.n840 }]}>{source.name}</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Badge
                      label={LEVEL_LABEL[source.level]}
                      color={source.level === "orta-ixtisas" ? BADGE.blue : BADGE.emerald}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      <ShowMore
        total={visible.length}
        limit={limit}
        initial={MATCH_INITIAL}
        step={MATCH_STEP}
        onChange={setLimit}
        noun="bakalavriat ixtisası"
      />

      <View style={[styles.box, { backgroundColor: colors.n200, borderColor: colors.n280, marginTop: 16 }]}>
        <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n580 }}>
          <Text style={{ fontWeight: "700", color: colors.n940 }}>Mənbə:</Text> {SOURCE}. Cədvəl 2026/2027 tədris ili
          üçündür.
        </Text>
      </View>

      <FormulaSection title={MATCH_T.formulaTitle} content={MATCH_T.formulaContent} />
      <RelatedCalculators
        ids={resolveRelatedIds(["admission-subbakalavr", "admission-codes", "admission-group1", "admission-group2"])}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Subbakalavr keçid balları 2026
// ═══════════════════════════════════════════════════════════════════════════════

type GroupKey = "1" | "2" | "3" | "4" | "5";

const GROUP_DATA: Record<GroupKey, AdmissionEntry[]> = {
  "1": admissionsGroup1Sub,
  "2": admissionsGroup2Sub,
  "3": [],
  "4": admissionsGroup4Sub,
  "5": admissionsGroup5Sub,
};

function fmtScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const SCORES_T = {
  title: "Subbakalavr keçid balları 2026",
  description:
    "Subbakalavr təhsilini bitirənlərin ali təhsilin bakalavr səviyyəsinə keçid balları. Qrupu seçin — ixtisaslar və ballar görünsün.",
  formulaTitle: "Bu nədir?",
  formulaContent: `Bu siyahı subbakalavr (ilk ali təhsil) məzunlarının bakalavriat səviyyəsinə keçid (qəbul) ballarını göstərir. Ballar 0-100 şkalasındadır.

Qrupu seçin — həmin qrup üzrə universitetlər, ixtisaslar və keçid balları görünəcək.

Ə = Əyani, Q = Qiyabi. "Dövlət sifarişli" sütunu pulsuz (büdcə) yerlər üçün balı göstərir. "—" həmin variantın olmadığını bildirir.`,
  selectGroup: "Qrupu seçin",
  group: "qrup",
  searchPlaceholder: "Universitet və ya ixtisas axtar...",
  passingScore: "Keçid balı",
  stateScore: "Dövlət sifarişli",
  aptitude: "Qabiliyyət",
  found: "ixtisas",
  noData: "Bu qrup üzrə subbakalavr məlumatı yoxdur.",
  noResults: "Axtarışa uyğun nəticə tapılmadı.",
  note: "Qeyd: Ballar 2026-cı il rəsmi nəticələrinə əsaslanır və təxmini xarakter daşıyır.",
};

function ScoresView() {
  const { colors } = useTheme();
  const pt = SCORES_T;
  const [group, setGroup] = useState<GroupKey>("1");
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const data = GROUP_DATA[group];
    const q = query.trim().toLocaleLowerCase("az");
    const filtered = q
      ? data.filter(
          (e) => e.specialty.toLocaleLowerCase("az").includes(q) || e.university.toLocaleLowerCase("az").includes(q)
        )
      : data;
    const map = new Map<string, AdmissionEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.university)) map.set(e.university, []);
      map.get(e.university)!.push(e);
    }
    return { list: Array.from(map.entries()), count: filtered.length };
  }, [group, query]);

  return (
    <View>
      <PageIntro slug="subbakalavr-kecid-ballari" text={pt.description} />

      {/* Qrup seçimi */}
      <Text style={[styles.label, { color: colors.n700 }]}>{pt.selectGroup}</Text>
      <View style={styles.groupRow}>
        {(["1", "2", "3", "4", "5"] as GroupKey[]).map((g) => {
          const active = group === g;
          return (
            <Pressable
              key={g}
              onPress={() => setGroup(g)}
              style={[
                styles.groupBtn,
                { backgroundColor: active ? colors.accent : colors.n240, borderColor: active ? colors.accent : colors.n280 },
              ]}
            >
              <Text style={[styles.groupBtnText, { color: active ? colors.onAccent : colors.n760 }]}>
                {g}-{pt.group}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Axtarış */}
      <InputField label="Axtarış" value={query} onChangeText={setQuery} placeholder={pt.searchPlaceholder} />

      {GROUP_DATA[group].length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.noData}</Text>
        </View>
      ) : grouped.count === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.noResults}</Text>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          <Text style={[styles.summary, { color: colors.n580, marginBottom: 0 }]}>
            {group}-{pt.group} • {grouped.count} {pt.found}
          </Text>
          {grouped.list.map(([uni, items]) => (
            <View key={uni} style={[styles.matchCard, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
              <View style={[styles.uniHeader, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
                <Text style={[styles.uniTitle, { color: colors.n940 }]}>{uni}</Text>
              </View>
              {items.map((e, i) => (
                <View key={i} style={[styles.scoreRow, { borderBottomColor: colors.n240 }]}>
                  <View style={styles.scoreLeft}>
                    {e.stream ? (
                      <View
                        style={[
                          styles.streamBox,
                          {
                            backgroundColor: (e.stream === "Q" ? BADGE.amber : BADGE.blue) + "1f",
                            borderColor: (e.stream === "Q" ? BADGE.amber : BADGE.blue) + "55",
                          },
                        ]}
                        accessibilityLabel={e.stream === "Q" ? "Qiyabi" : "Əyani"}
                      >
                        <Text style={[styles.streamText, { color: e.stream === "Q" ? BADGE.amber : BADGE.blue }]}>
                          {e.stream}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={[styles.scoreSpec, { color: colors.n940 }]}>{e.specialty}</Text>
                  </View>
                  <View style={styles.scoreRight}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {e.aptitude != null && (
                        <Text style={{ fontSize: 11, color: colors.n580 }}>
                          {pt.aptitude}: {fmtScore(e.aptitude)}
                        </Text>
                      )}
                      <Text style={[styles.scoreMain, { color: colors.accent }]}>
                        {e.score != null ? fmtScore(e.score) : "—"}
                      </Text>
                    </View>
                    {e.stateScore != null && (
                      <Text style={{ fontSize: 11, color: BADGE.green, marginTop: 2 }}>
                        {pt.stateScore}: {fmtScore(e.stateScore)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      <InfoBox variant="info">{pt.note}</InfoBox>

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators
        ids={resolveRelatedIds(["admission-magistr", "qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "gpa"])}
      />
    </View>
  );
}

// ── Əsas export — slug-a görə ─────────────────────────────────────────────────

export function SubbakalavCalculator() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  if (slug === "subbakalavr-kecid-ballari") return <ScoresView />;
  return <MatchesView />;
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  summary: { fontSize: 13, marginBottom: 10 },
  small: { fontSize: 11, lineHeight: 15 },
  box: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  aptGroup: { fontSize: 11, fontWeight: "700", marginTop: 10, marginBottom: 2 },
  aptRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  aptSpec: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  aptMeta: { flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 2, marginTop: 3 },
  metaKey: { fontSize: 12 },
  metaVal: { fontSize: 12, fontWeight: "600" },
  matchCard: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  matchHeader: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  targetTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  colHead: { paddingHorizontal: 12, paddingVertical: 6 },
  colHeadText: { fontSize: 11, fontWeight: "600" },
  sourceRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sourceCode: { fontSize: 13, fontWeight: "700", minWidth: 78, fontVariant: ["tabular-nums"] },
  sourceName: { fontSize: 13, lineHeight: 18 },
  groupRow: { flexDirection: "row", gap: 6, marginBottom: 16 },
  groupBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  groupBtnText: { fontSize: 13, fontWeight: "700" },
  uniHeader: { paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1 },
  uniTitle: { fontSize: 13, fontWeight: "700" },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scoreLeft: { flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 },
  streamBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  streamText: { fontSize: 10, fontWeight: "800" },
  scoreSpec: { fontSize: 13, lineHeight: 18, flex: 1 },
  scoreRight: { alignItems: "flex-end" },
  scoreMain: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  empty: { alignItems: "center", paddingVertical: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
