// İxtisas kodları — saytdakı ixtisas-kodlari (Abituriyent 4, I-IV qrup) və
// kollec-ixtisas-kodlari (11-illik kollec) səhifələrinin mobil portu.
// Səhifə route slug-una görə seçilir.

import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ChipGroup } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { Badge, BADGE, PageIntro, ShowMore, resolveRelatedIds } from "./_admission-parts";

import type { PlanEntry } from "@/data/admissions-plan-2026";
import { planGroup1 } from "@/data/admissions-plan-2026-group1";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";
import { planGroup3 } from "@/data/admissions-plan-2026-group3";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";
import { planCollege11, type CollegePlanEntry } from "@/data/admissions-plan-college11-2026";

const INITIAL = 50;
const STEP = 50;

// ── Ortaq UI ──────────────────────────────────────────────────────────────────

function Summary({ parts }: { parts: [number, string][] }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.summary, { color: colors.n580 }]}>
      {parts.map(([n, label], i) => (
        <Text key={i}>
          {i > 0 ? " · " : ""}
          <Text style={{ fontWeight: "700", color: colors.n940 }}>{n}</Text> {label}
        </Text>
      ))}
    </Text>
  );
}

function EmptyBox({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.n200, borderColor: colors.n280, paddingVertical: 22 }]}>
      <Text style={{ textAlign: "center", color: colors.n580, fontSize: 14 }}>{text}</Text>
    </View>
  );
}

function SourceBox({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.n200, borderColor: colors.n280, marginTop: 16 }]}>
      <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n580 }}>{children}</Text>
    </View>
  );
}

function CodeRow({
  code,
  specialty,
  badges,
  meta,
}: {
  code: string;
  specialty: string;
  badges: React.ReactNode;
  meta: [string, React.ReactNode][];
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.n240 }]}>
      <View style={styles.rowTop}>
        <Text style={[styles.code, { color: colors.accent }]}>{code}</Text>
        {badges}
      </View>
      <Text style={[styles.spec, { color: colors.n940 }]}>{specialty}</Text>
      <View style={styles.metaRow}>
        {meta.map(([k, v]) => (
          <View key={k} style={styles.metaItem}>
            <Text style={[styles.metaKey, { color: colors.n580 }]}>{k}: </Text>
            {typeof v === "string" || typeof v === "number" ? (
              <Text style={[styles.metaVal, { color: colors.n840 }]}>{v}</Text>
            ) : (
              v
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// İxtisas kodları 2026 — DİM Abituriyent 4 (I-IV qrup)
// ═══════════════════════════════════════════════════════════════════════════════

const GROUPS: { id: string; roman: string; label: string; entries: PlanEntry[] }[] = [
  { id: "1", roman: "I", label: "I qrup (riyaziyyat, fizika, kimya)", entries: planGroup1 },
  { id: "2", roman: "II", label: "II qrup (riyaziyyat, coğrafiya)", entries: planGroup2 },
  { id: "3", roman: "III", label: "III qrup (ədəbiyyat, tarix)", entries: planGroup3 },
  { id: "4", roman: "IV", label: "IV qrup (biologiya, kimya, fizika)", entries: planGroup4 },
];

const UNI_LANGUAGE_LABELS: Record<string, string> = {
  AZ: "Azərbaycan dili",
  RU: "Rus dili",
  "AZ/RU": "Azərbaycan / rus dili",
  EN: "İngilis dili",
  TR: "Türk dili",
  DE: "Alman dili",
};

const UNI_SOURCE = "DİM 2026 «Abituriyent 4» jurnalından götürülüb";

const UNI_T = {
  title: "İxtisas kodları 2026 — DİM Abituriyent 4",
  description:
    "DİM-in 2026-cı il «Abituriyent 4» jurnalı üzrə I, II, III və IV ixtisas qruplarının tam siyahısı: ixtisas kodu, universitet, plan yerlərinin sayı, tədris dili və illik təhsil haqqı.",
  formulaTitle: "Bu siyahı nədir?",
  formulaContent: `Dövlət İmtahan Mərkəzinin (DİM) hər il nəşr etdiyi «Abituriyent 4» jurnalı ixtisas seçimi üçün əsas sənəddir. Orada qəbul aparılan bütün ixtisaslar kodu, plan yerlərinin sayı və təhsil haqqı ilə birlikdə verilir.

Bu səhifədə həmin jurnalın I-IV ixtisas qrupları üzrə tam siyahısı yerləşdirilib — 1668 ixtisas, 41 ali təhsil müəssisəsi, ümumilikdə 61 516 plan yeri.

Hər sətirdə göstərilir:
• İxtisas kodu — ixtisas seçimi zamanı elektron formaya yazılan 6 rəqəmli kod
• Universitet və ixtisasın tam adı
• Altqrup — I qrup üçün RK/Rİ, III qrup üçün DT/TC
• Plan yeri — bu il həmin ixtisasa ayrılmış yerlərin sayı
• Tədris dili — Azərbaycan, rus, ingilis, türk və ya alman
• İllik təhsil haqqı (manatla). "YDS" — yalnız dövlət sifarişi, "DH" — dövlət hesabına.

Axtarış xanasına ixtisas kodunu, ixtisasın adını və ya universitetin adını yazaraq siyahını süzgəcdən keçirə bilərsiniz.

Mənbə: ${UNI_SOURCE}. Keçid balları ilə birlikdə baxmaq üçün qrup hesablayıcılarından istifadə edin.`,
};

/** Universitet → sətirlər, jurnaldakı sıra qorunmaqla. */
function byUniversity(entries: PlanEntry[]): [string, PlanEntry[]][] {
  const map = new Map<string, PlanEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.university);
    if (list) list.push(entry);
    else map.set(entry.university, [entry]);
  }
  return [...map];
}

type UniItem =
  | { kind: "group"; key: string; label: string; total: number }
  | { kind: "uni"; key: string; name: string }
  | { kind: "row"; key: string; row: PlanEntry };

function UniCodesView() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [limit, setLimit] = useState(INITIAL);

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
    (sum, g) => sum + g.grouped.reduce((s, [, rows]) => s + rows.reduce((n, r) => n + r.seats, 0), 0),
    0
  );

  // Siyahı səhifələnir: yalnız ilk `limit` sətir (başlıqlarla birlikdə) göstərilir.
  const items = useMemo(() => {
    const out: UniItem[] = [];
    let n = 0;
    for (const g of visible) {
      if (g.total === 0) continue;
      if (n >= limit) break;
      out.push({ kind: "group", key: `g-${g.id}`, label: g.label, total: g.total });
      for (const [uni, rows] of g.grouped) {
        if (n >= limit) break;
        out.push({ kind: "uni", key: `u-${g.id}-${uni}`, name: uni });
        for (const row of rows) {
          if (n >= limit) break;
          out.push({ kind: "row", key: `r-${g.id}-${row.code}`, row });
          n++;
        }
      }
    }
    return out;
  }, [visible, limit]);

  return (
    <View>
      <PageIntro slug="ixtisas-kodlari" text={UNI_T.description} />

      <InputField
        label="İxtisas kodu, ixtisas və ya universitet üzrə axtarın"
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setLimit(INITIAL);
        }}
        placeholder="məs. 111114, Kompüter elmləri, Bakı Dövlət Universiteti"
      />

      <ChipGroup
        label="İxtisas qrupu"
        options={[{ value: "all", label: "Hamısı" }, ...GROUPS.map((g) => ({ value: g.id, label: `${g.roman} qrup` }))]}
        selected={activeGroup}
        onSelect={(v) => {
          setActiveGroup(v);
          setLimit(INITIAL);
        }}
      />

      <Summary parts={[[totalFound, "ixtisas"], [totalSeats, "plan yeri"]]} />

      {totalFound === 0 && <EmptyBox text="Axtarışa uyğun ixtisas tapılmadı." />}

      {items.map((it) => {
        if (it.kind === "group") {
          return (
            <View key={it.key} style={{ marginTop: 14 }}>
              <Text style={[styles.groupTitle, { color: colors.n960 }]}>{it.label}</Text>
              <Text style={[styles.small, { color: colors.n580 }]}>{it.total} ixtisas</Text>
            </View>
          );
        }
        if (it.kind === "uni") {
          return (
            <Text key={it.key} style={[styles.uniTitle, { color: colors.n940, backgroundColor: colors.n200 }]}>
              {it.name}
            </Text>
          );
        }
        const row = it.row;
        return (
          <CodeRow
            key={it.key}
            code={row.code}
            specialty={row.specialty}
            badges={
              <>
                {row.subgroup ? <Badge label={row.subgroup} color={BADGE.blue} /> : null}
                {row.aptitudeRequired ? <Badge label="Qabiliyyət" color={BADGE.amber} /> : null}
              </>
            }
            meta={[
              ["Plan yeri", String(row.seats)],
              ["Tədris dili", `${row.language}${UNI_LANGUAGE_LABELS[row.language] ? ` (${UNI_LANGUAGE_LABELS[row.language]})` : ""}`],
              ["Təhsil haqqı", row.fee ?? "—"],
            ]}
          />
        );
      })}

      <ShowMore total={totalFound} limit={limit} initial={INITIAL} step={STEP} onChange={setLimit} noun="ixtisas" />

      <SourceBox>
        <Text style={{ fontWeight: "700", color: colors.n940 }}>Mənbə:</Text> {UNI_SOURCE}. Rəqəmlər 2026/2027 tədris ili
        üçündür.
      </SourceBox>

      <FormulaSection title={UNI_T.formulaTitle} content={UNI_T.formulaContent} />
      <RelatedCalculators
        ids={resolveRelatedIds(["admission-group1", "admission-group2", "admission-group3", "admission-group4", "admission-magistr"])}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11-illik kollec ixtisas kodları 2026
// ═══════════════════════════════════════════════════════════════════════════════

const COLLEGE_LANGUAGE_LABELS: Record<string, string> = {
  AZ: "Azərbaycan bölməsi",
  RU: "Rus bölməsi",
  "AZ/RU": "Azərbaycan və rus bölmələri üçün birgə",
};

const COLLEGE_SOURCE = "DİM 2026 «Abituriyent N5» jurnalı — 11-illik (tam orta) təhsil bazası";

const TOTAL_SEATS = planCollege11.reduce((sum, row) => sum + row.seats, 0);
const TOTAL_COLLEGES = new Set(planCollege11.map((row) => row.university)).size;

const COLLEGE_T = {
  title: "11-illik kollec ixtisas kodları 2026",
  description:
    "Tam orta (11-illik) təhsil bazasında kolleclərə qəbul üzrə DİM ixtisas kodlarının tam siyahısı: kod, kollec, ixtisas, ayrılan plan yeri, əyani/qiyabi forma və tədris dili.",
  formulaTitle: "Bu siyahı nədir?",
  formulaContent: `11 illik tam orta təhsilini bitirənlər üçün kollec (orta ixtisas təhsili) qəbulunda ixtisas seçimi elektron ərizədə 6 rəqəmli ixtisas kodu ilə aparılır. Kodu səhv yazmaq — başqa ixtisasa müraciət etmək deməkdir.

Bu səhifədə DİM-in 2026-cı il qəbul jurnalındakı bütün kollec ixtisasları verilib — ${TOTAL_COLLEGES} kollec, ${planCollege11.length} ixtisas kodu, ümumilikdə ${TOTAL_SEATS} plan yeri.

Hər sətirdə göstərilir:
• İxtisas kodu — ixtisas seçimi ərizəsinə yazılan 6 rəqəmli kod
• İxtisasın tam adı
• Plan yeri — bu il həmin koda ayrılmış yerlərin sayı
• Forma — əyani və ya qiyabi (Q)
• Təhsil haqqı — illik ödəniş; "Dövlət hesabına" nişanı təhsilin dövlət tərəfindən ödənildiyini bildirir
• Qabiliyyət nişanı — həmin ixtisasa qabiliyyət imtahanı tələb olunur

Kolleclər jurnaldakı ardıcıllıqla, bölmələr (Azərbaycan, rus, birgə) ayrıca verilib. Hər kollecin daxilində eyni ixtisas iki dəfə — iki fərqli kodla — sadalanır: DİM jurnalında əvvəlcə dövlət sifarişli, sonra ödənişli yerlər siyahılanır.

Axtarış xanasına kodu, ixtisasın və ya kollecin adını yazaraq siyahını süzgəcdən keçirə bilərsiniz.

Mənbə: ${COLLEGE_SOURCE}. Keçid balları ilə birlikdə baxmaq üçün "11-illik kolleclərə keçid balları" hesablayıcısından istifadə edin — orada hər ixtisasın üstündə həmin kod göstərilir.`,
};

interface CollegeSection {
  language: string;
  rows: CollegePlanEntry[];
}

interface CollegeGroup {
  university: string;
  note?: string;
  sections: CollegeSection[];
  total: number;
  seats: number;
}

/** Kollec → bölmə (tədris dili) → sətirlər, jurnaldakı sıra qorunmaqla. */
function groupByCollege(entries: CollegePlanEntry[]): CollegeGroup[] {
  const groups: CollegeGroup[] = [];
  for (const row of entries) {
    let group =
      groups.length > 0 && groups[groups.length - 1].university === row.university
        ? groups[groups.length - 1]
        : groups.find((g) => g.university === row.university);
    if (!group) {
      group = { university: row.university, note: row.note, sections: [], total: 0, seats: 0 };
      groups.push(group);
    }
    let section = group.sections.find((s) => s.language === row.language);
    if (!section) {
      section = { language: row.language, rows: [] };
      group.sections.push(section);
    }
    section.rows.push(row);
    group.total += 1;
    group.seats += row.seats;
  }
  return groups;
}

type CollegeItem =
  | { kind: "college"; key: string; group: CollegeGroup }
  | { kind: "section"; key: string; label: string }
  | { kind: "row"; key: string; row: CollegePlanEntry };

function CollegeCodesView() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [aptitudeOnly, setAptitudeOnly] = useState(false);
  const [streamFilter, setStreamFilter] = useState<"all" | "Ə" | "Q">("all");
  const [limit, setLimit] = useState(INITIAL);

  const groups = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    const filtered = planCollege11.filter((row) => {
      if (aptitudeOnly && !row.aptitudeRequired) return false;
      if (streamFilter !== "all" && row.stream !== streamFilter) return false;
      if (!q) return true;
      return (
        row.code.includes(q) ||
        row.specialty.toLocaleLowerCase("az").includes(q) ||
        row.university.toLocaleLowerCase("az").includes(q)
      );
    });
    return groupByCollege(filtered);
  }, [query, aptitudeOnly, streamFilter]);

  const totalFound = groups.reduce((sum, g) => sum + g.total, 0);
  const totalSeats = groups.reduce((sum, g) => sum + g.seats, 0);

  const items = useMemo(() => {
    const out: CollegeItem[] = [];
    let n = 0;
    for (const g of groups) {
      if (n >= limit) break;
      out.push({ kind: "college", key: `c-${g.university}`, group: g });
      for (const s of g.sections) {
        if (n >= limit) break;
        if (g.sections.length > 1) {
          out.push({
            kind: "section",
            key: `s-${g.university}-${s.language}`,
            label: COLLEGE_LANGUAGE_LABELS[s.language] ?? s.language,
          });
        }
        for (const row of s.rows) {
          if (n >= limit) break;
          out.push({ kind: "row", key: `r-${row.code}`, row });
          n++;
        }
      }
    }
    return out;
  }, [groups, limit]);

  return (
    <View>
      <PageIntro slug="kollec-ixtisas-kodlari" text={COLLEGE_T.description} />

      <InputField
        label="İxtisas kodu, ixtisas və ya kollec üzrə axtarın"
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setLimit(INITIAL);
        }}
        placeholder="məs. 476118, Tibb bacısı, Gəncə Tibb Kolleci"
      />

      {/* Saytda "Hamısı/Əyani/Qiyabi" düymələri və ayrıca "Yalnız qabiliyyət" açarı bir sırada verilib. */}
      <ChipGroup<"all" | "Ə" | "Q">
        options={[
          { value: "all", label: "Hamısı" },
          { value: "Ə", label: "Əyani" },
          { value: "Q", label: "Qiyabi" },
        ]}
        selected={streamFilter}
        onSelect={(v) => {
          setStreamFilter(v);
          setLimit(INITIAL);
        }}
      />
      <View style={{ marginTop: -6, marginBottom: 14, flexDirection: "row" }}>
        <Pressable
          onPress={() => {
            setAptitudeOnly((v) => !v);
            setLimit(INITIAL);
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: aptitudeOnly }}
          style={[
            styles.aptToggle,
            aptitudeOnly
              ? { backgroundColor: "#f59e0b", borderColor: "#f59e0b" }
              : { backgroundColor: colors.n240, borderColor: colors.n280 },
          ]}
        >
          <Text style={[styles.aptToggleText, { color: aptitudeOnly ? "#ffffff" : colors.n760 }]}>
            Yalnız qabiliyyət tələb edənlər
          </Text>
        </Pressable>
      </View>

      <Summary parts={[[totalFound, "ixtisas kodu"], [groups.length, "kollec"], [totalSeats, "plan yeri"]]} />

      {totalFound === 0 && <EmptyBox text="Axtarışa uyğun ixtisas tapılmadı." />}

      {items.map((it) => {
        if (it.kind === "college") {
          const g = it.group;
          return (
            <View key={it.key} style={{ marginTop: 16 }}>
              <Text style={[styles.groupTitle, { color: colors.n960, fontSize: 15 }]}>{g.university}</Text>
              {g.note ? <Text style={[styles.small, { color: colors.n580 }]}>{g.note}</Text> : null}
              <Text style={[styles.small, { color: colors.n580 }]}>
                {g.total} ixtisas · {g.seats} plan yeri
              </Text>
            </View>
          );
        }
        if (it.kind === "section") {
          return (
            <Text key={it.key} style={[styles.sectionTitle, { color: colors.n580 }]}>
              {it.label.toLocaleUpperCase("az")}
            </Text>
          );
        }
        const row = it.row;
        return (
          <CodeRow
            key={it.key}
            code={row.code}
            specialty={row.specialty}
            badges={row.aptitudeRequired ? <Badge label="Qabiliyyət" color={BADGE.amber} /> : null}
            meta={[
              ["Plan yeri", String(row.seats)],
              [
                "Forma",
                row.stream === "Q" ? <Badge label="Qiyabi" color={BADGE.orange} /> : <Badge label="Əyani" color={BADGE.blue} />,
              ],
              [
                "Təhsil haqqı",
                row.fee === "DH" ? (
                  <Badge label="Dövlət hesabına" color={BADGE.emerald} />
                ) : row.fee ? (
                  `${row.fee} ₼`
                ) : (
                  "—"
                ),
              ],
            ]}
          />
        );
      })}

      <ShowMore total={totalFound} limit={limit} initial={INITIAL} step={STEP} onChange={setLimit} noun="ixtisas kodu" />

      <SourceBox>
        <Text style={{ fontWeight: "700", color: colors.n940 }}>Mənbə:</Text> {COLLEGE_SOURCE}. Rəqəmlər 2026/2027 tədris
        ili üçündür. &quot;Qabiliyyət&quot; nişanı olan ixtisaslar üzrə əlavə qabiliyyət imtahanı tələb olunur,
        &quot;Qiyabi&quot; nişanı isə qiyabi təhsil formasını bildirir.
      </SourceBox>

      <FormulaSection title={COLLEGE_T.formulaTitle} content={COLLEGE_T.formulaContent} />
      <RelatedCalculators
        ids={resolveRelatedIds([
          "admission-college11",
          "admission-college9",
          "admission-codes",
          "subbakalavr-uygunlug",
          "admission-group1",
        ])}
      />
    </View>
  );
}

// ── Əsas export — slug-a görə ─────────────────────────────────────────────────

export function SpecialtyCodesCalculator() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  if (slug === "kollec-ixtisas-kodlari") return <CollegeCodesView />;
  return <UniCodesView />;
}

const styles = StyleSheet.create({
  summary: { fontSize: 13, marginBottom: 8 },
  box: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  groupTitle: { fontSize: 17, fontWeight: "700", lineHeight: 22 },
  small: { fontSize: 12, marginTop: 2, marginBottom: 4 },
  uniTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginTop: 10, marginBottom: 2 },
  row: { paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  rowTop: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 3 },
  code: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  spec: { fontSize: 14, lineHeight: 19 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 4, marginTop: 5 },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaKey: { fontSize: 12 },
  metaVal: { fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] },
  aptToggle: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  aptToggleText: { fontSize: 13, fontWeight: "600" },
});
