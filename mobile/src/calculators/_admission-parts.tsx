// Saytdakı src/components/AdmissionScoreCalculator.tsx-in mobil portu.
// Qəbul balları (I-V qrup, kolleclər) və magistr keçid balları səhifələri bu
// mühərriki istifadə edir. Məntiq (filtrlər, status, şans düsturu, sıralama)
// saytla eynidir.

import { useMemo, useState, type ReactNode } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { ChipGroup, Button } from "@/components/Controls";
import { Paragraph, FormulaSection, RelatedCalculators } from "@/components/Content";
import { calculators } from "@/data/calculators";
import { pageHeaders } from "@/data/page-headers";
import { getCityForEntry } from "@/data/university-cities";

// ── Köməkçilər ─────────────────────────────────────────────────────────────────

// Azərbaycan hərflərini ingilis klaviatura analoqlarına çevirir və lowercase edir.
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

/**
 * Saytdakı relatedIds bəzən registr id-si, bəzən slug verir. Hər ikisini
 * registr id-sinə çevirir (tapılmayanlar atılır).
 */
export function resolveRelatedIds(ids: string[]): string[] {
  const out: string[] = [];
  for (const id of ids) {
    const c = calculators.find((x) => x.id === id) ?? calculators.find((x) => x.slug === id);
    if (c && !out.includes(c.id)) out.push(c.id);
  }
  return out;
}

/**
 * Səhifənin öz təsviri. Ekran sarğısı ([slug].tsx) artıq səhifə başlığı altında
 * pageHeaders təsvirini (yoxdursa registr təsvirini) göstərir — eynidirsə təkrarlanmır.
 */
export function PageIntro({ slug, text }: { slug?: string; text: string }) {
  const reg = calculators.find((c) => c.slug === slug);
  const shown = (slug && pageHeaders[slug]?.description) || reg?.description;
  if (shown && shown.trim() === text.trim()) return null;
  return <Paragraph>{text}</Paragraph>;
}

/** Kiçik rəngli nişan (Əyani, Qiyabi, yer sayı, dil və s.). */
export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "1f", borderColor: color + "55" }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export const BADGE = {
  blue: "#2563eb",
  orange: "#ea580c",
  emerald: "#059669",
  violet: "#7c3aed",
  amber: "#d97706",
  green: "#16a34a",
  red: "#dc2626",
};

/** "Daha çox göstər" / "Azalt" düymələri — uzun siyahılar üçün. */
export function ShowMore({
  total,
  limit,
  initial,
  step,
  onChange,
  noun = "nəticə",
}: {
  total: number;
  limit: number;
  initial: number;
  step: number;
  onChange: (n: number) => void;
  noun?: string;
}) {
  const { colors } = useTheme();
  if (total <= initial) return null;
  const rest = total - limit;
  return (
    <View style={{ gap: 8, marginTop: 8 }}>
      <Text style={{ fontSize: 12, textAlign: "center", color: colors.n580 }}>
        {Math.min(limit, total)} / {total} {noun} göstərilir
      </Text>
      {rest > 0 && (
        <Button
          title={`Daha çox göstər (+${Math.min(step, rest)})`}
          icon="expand-more"
          onPress={() => onChange(limit + step)}
        />
      )}
      {limit > initial && (
        <Button title="Azalt" variant="secondary" icon="expand-less" onPress={() => onChange(initial)} />
      )}
    </View>
  );
}

// ── Tiplər ─────────────────────────────────────────────────────────────────────

export interface AdmissionEntry {
  code?: string;
  /** Dövlət sifarişli yer üzrə ayrıca ixtisas kodu (kollec siyahılarında). */
  stateCode?: string;
  /** Dövlət sifarişli yerlərin sayı. */
  stateSeats?: number;
  /** Ödənişli yer üzrə illik təhsil haqqı (manatla). */
  fee?: string;
  /** Xüsusi qabiliyyət imtahanı tələb edir (minimum bal göstərilmədən). */
  aptitudeRequired?: boolean;
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

export interface AdmissionTranslation {
  title: string;
  description: string;
  breadcrumbCategory: string;
  formulaTitle: string;
  formulaContent: string;
  yourScore: string;
  filterUni: string;
  allUniversities: string;
  searchSpecialty: string;
  guaranteed: string;
  borderline: string;
  notEnough: string;
  university: string;
  specialty: string;
  passingScore: string;
  difference: string;
  totalFound: string;
  guaranteedCount: string;
  borderlineCount: string;
  emptyState: string;
  noResults: string;
  source: string;
  showAll: string;
  showLess: string;
}

export interface SubgroupOption {
  value: string;
  label: string;
  /** Substrings that must match specialty name. Empty means "all". */
  specialties: string[];
  /** If set, entries whose `tag` equals this are also included. */
  tag?: string;
  /** If set, entries whose `tag` is in this list are excluded. */
  excludeTags?: string[];
}

export interface AdmissionEngineProps {
  slug?: string;
  entries: AdmissionEntry[];
  t: AdmissionTranslation;
  relatedIds?: string[];
  scoreMin?: number;
  scoreMax?: number;
  scorePlaceholder?: string;
  borderlineRange?: number;
  lowBlockSpecialties?: string[];
  subgroups?: SubgroupOption[];
  subgroupLabel?: string;
  showSpecialtySelector?: boolean;
  specialtySelectorLabel?: string;
  specialtySelectorAllLabel?: string;
  programGroups?: { number: number; name: string; keywords: string[] }[];
  programGroupsLabel?: string;
  bachelorMap?: { name: string; programs: { num: number; minScore: number }[] }[];
  bachelorMapLabel?: string;
  bachelorMapPlaceholder?: string;
  fundingCodes?: boolean;
  /** Formul bölməsindən əvvəl əlavə məzmun (lazım olduqda). */
  extra?: ReactNode;
}

type Status = "guaranteed" | "borderline" | "notEnough";
type Funding = "all" | "paid" | "state";
type Section = "all" | "AZ" | "RU";

const SECTION_OPTIONS: { value: Section; label: string }[] = [
  { value: "all", label: "Hər iki bölmə" },
  { value: "AZ", label: "Azərbaycan bölməsi" },
  { value: "RU", label: "Rus bölməsi" },
];

const FUNDING_OPTIONS: { value: Funding; label: string }[] = [
  { value: "all", label: "Hamısı" },
  { value: "paid", label: "Yalnız ödənişli" },
  { value: "state", label: "Yalnız dövlət sifarişli" },
];

const STATUS_COLOR: Record<Status, string> = {
  guaranteed: "#16a34a",
  borderline: "#d97706",
  notEnough: "#dc2626",
};

const INITIAL = 30;
const STEP = 50;

// ── Çoxlu seçim (saytdakı datalist + chip) ────────────────────────────────────

function MultiChipPicker({
  label,
  placeholder,
  options,
  selected,
  onChange,
  clearLabel,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  clearLabel: string;
}) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const available = useMemo(() => {
    const sel = new Set(selected);
    const q = normalizeText(draft.trim());
    const base = options.filter((o) => !sel.has(o));
    if (!q) return base;
    return base.filter((o) => normalizeText(o).includes(q));
  }, [options, selected, draft]);

  const add = (val: string) => {
    const v = val.trim();
    if (!v) return;
    if (options.includes(v) && !selected.includes(v)) {
      onChange([...selected, v]);
      setDraft("");
      return;
    }
    const ciHit = options.find((o) => normalizeText(o) === normalizeText(v) && !selected.includes(o));
    if (ciHit) {
      onChange([...selected, ciHit]);
      setDraft("");
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[styles.smallLabel, { color: colors.n580 }]}>{label}</Text>
      {selected.length > 0 && (
        <View style={styles.chipWrap}>
          {selected.map((s) => (
            <Pressable
              key={s}
              onPress={() => onChange(selected.filter((x) => x !== s))}
              style={[styles.selChip, { backgroundColor: colors.accent }]}
              accessibilityLabel={`${s} sil`}
            >
              <Text style={[styles.selChipText, { color: colors.onAccent }]} numberOfLines={1}>
                {s}
              </Text>
              <Text style={[styles.selChipX, { color: colors.onAccent }]}>×</Text>
            </Pressable>
          ))}
          {selected.length > 1 && (
            <Pressable onPress={() => onChange([])} style={[styles.selChip, { backgroundColor: colors.n240 }]}>
              <Text style={[styles.selChipText, { color: colors.n580 }]}>{clearLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
      <TextInput
        value={draft}
        onChangeText={(v) => {
          setDraft(v);
          setOpen(true);
          if (options.includes(v)) add(v);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onSubmitEditing={() => {
          if (available.length > 0) add(available[0]);
        }}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Backspace" && draft === "" && selected.length > 0) {
            onChange(selected.slice(0, -1));
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.n400c}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="done"
        style={[styles.textInput, { color: colors.n940, backgroundColor: colors.n200, borderColor: colors.n280 }]}
      />
      {open && available.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 240 }}>
            {available.slice(0, 50).map((o) => (
              <Pressable
                key={o}
                onPress={() => add(o)}
                style={({ pressed }) => [styles.dropItem, pressed && { backgroundColor: colors.n240 }]}
              >
                <Text style={[styles.dropText, { color: colors.n940 }]}>{o}</Text>
              </Pressable>
            ))}
            {available.length > 50 && (
              <Text style={[styles.dropMore, { color: colors.n580, backgroundColor: colors.n240 }]}>
                +{available.length - 50} nəticə — axtarışı dəqiqləşdirin
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── Nəticə kartının xalı ─────────────────────────────────────────────────────

function ScoreCell({
  title,
  value,
  diff,
  chance,
  status,
  code,
  seats,
  fee,
  fundingCodes,
}: {
  title: string;
  value?: number;
  diff: number | null;
  chance: number | null;
  status: Status | null;
  code?: string;
  seats?: number;
  fee?: string;
  fundingCodes: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.scoreCol, { backgroundColor: colors.n200 }]}>
      <Text style={[styles.scoreColLabel, { color: colors.n580 }]}>{title}</Text>
      {value != null ? (
        <>
          <Text style={[styles.scoreVal, { color: colors.n940 }]}>{value}</Text>
          {diff !== null && status !== null && (
            <View style={[styles.diffBadge, { backgroundColor: STATUS_COLOR[status] + "26" }]}>
              <Text style={[styles.diffBadgeText, { color: STATUS_COLOR[status] }]}>
                {diff >= 0 ? "+" : ""}
                {diff.toFixed(1)} • {chance}%
              </Text>
            </View>
          )}
          {fundingCodes && (code || seats != null) && (
            <Text style={[styles.codeSeats, { color: colors.n580 }]}>
              {code ? <Text style={{ fontWeight: "700", color: colors.n940 }}>{code}</Text> : null}
              {code && seats != null ? " · " : ""}
              {seats != null ? `${seats} yer` : ""}
              {fee ? `\n${fee} ₼` : ""}
            </Text>
          )}
        </>
      ) : (
        <Text style={[styles.dash, { color: colors.n580 }]}>—</Text>
      )}
    </View>
  );
}

// ── Əsas mühərrik ─────────────────────────────────────────────────────────────

export function AdmissionScoreEngine({
  slug,
  entries,
  t: pt,
  relatedIds = ["university-admission", "gpa"],
  scoreMin = 100,
  scoreMax = 700,
  scorePlaceholder = "350",
  borderlineRange = 10,
  fundingCodes = false,
  lowBlockSpecialties,
  subgroups,
  subgroupLabel = "Altqrup",
  showSpecialtySelector = false,
  specialtySelectorLabel = "Proqramı seçin",
  specialtySelectorAllLabel = "Bütün proqramlar",
  programGroups,
  programGroupsLabel = "Proqram",
  bachelorMap,
  bachelorMapLabel = "Bakalavr ixtisasınız",
  bachelorMapPlaceholder = "Bakalavr ixtisasınızı axtarın...",
  extra,
}: AdmissionEngineProps) {
  const { colors } = useTheme();

  const [score, setScore] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedUnis, setSelectedUnis] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [specSearch, setSpecSearch] = useState("");
  const [limit, setLimit] = useState(INITIAL);
  const [lowBlock, setLowBlock] = useState(false);
  const [fundingFilter, setFundingFilter] = useState<Funding>("all");
  const [section, setSection] = useState<Section>("all");
  const [subgroup, setSubgroup] = useState<string>(subgroups?.[0]?.value ?? "");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedBachelor, setSelectedBachelor] = useState("");
  const [bachelorOpen, setBachelorOpen] = useState(false);

  const bachelorFiltered = useMemo(() => {
    if (!bachelorMap?.length) return [];
    const q = normalizeText(selectedBachelor.trim());
    if (!q) return bachelorMap;
    return bachelorMap.filter((b) => normalizeText(b.name).includes(q));
  }, [bachelorMap, selectedBachelor]);

  const bachelorPrograms = useMemo(() => {
    if (!bachelorMap?.length || !selectedBachelor) return null;
    const q = normalizeText(selectedBachelor.trim());
    if (!q) return null;
    const exact = bachelorMap.find((b) => normalizeText(b.name) === q);
    const found = exact ?? bachelorMap.find((b) => normalizeText(b.name).includes(q));
    return found ? found.programs : null;
  }, [bachelorMap, selectedBachelor]);

  const hasSections = useMemo(
    () => entries.some((e) => e.language === "RU" || e.language === "AZ/RU"),
    [entries]
  );

  const effectiveEntries = useMemo(() => {
    let result = entries;
    if (section !== "all") {
      result = result.filter((e) => e.language === section || e.language === "AZ/RU");
    }
    if (bachelorPrograms && programGroups?.length) {
      const allowedNums = new Set(bachelorPrograms.map((p) => p.num));
      const allowedKeywords: string[] = [];
      for (const pg of programGroups) {
        if (allowedNums.has(pg.number)) {
          allowedKeywords.push(...pg.keywords.map((k) => k.toLocaleLowerCase("az")));
        }
      }
      if (allowedKeywords.length > 0) {
        result = result.filter((e) => {
          const hay = e.specialty.toLocaleLowerCase("az");
          return allowedKeywords.some((k) => hay.includes(k));
        });
      }
    }
    if (programGroups?.length && selectedProgram) {
      const active = programGroups.find((p) => String(p.number) === selectedProgram);
      if (active && active.keywords.length > 0) {
        const needles = active.keywords.map((s) => s.toLocaleLowerCase("az"));
        result = result.filter((e) => {
          const hay = e.specialty.toLocaleLowerCase("az");
          return needles.some((n) => hay.includes(n));
        });
      }
    }
    if (subgroups?.length && subgroup) {
      const active = subgroups.find((s) => s.value === subgroup);
      if (active) {
        const needles = active.specialties.map((s) => s.toLocaleLowerCase("az"));
        const hasNameFilter = needles.length > 0;
        result = result.filter((e) => {
          if (active.excludeTags && e.tag && active.excludeTags.includes(e.tag)) return false;
          if (!hasNameFilter && !active.tag) return true;
          const hay = e.specialty.toLocaleLowerCase("az");
          const byName = needles.some((n) => hay.includes(n));
          const byTag = active.tag ? e.tag === active.tag : false;
          return byName || byTag;
        });
      }
    }
    if (lowBlock && lowBlockSpecialties?.length) {
      const needles = lowBlockSpecialties.map((s) => s.toLocaleLowerCase("az"));
      result = result.filter((e) => {
        const hay = e.specialty.toLocaleLowerCase("az");
        return needles.some((n) => hay.includes(n));
      });
    }
    return result;
  }, [entries, section, lowBlock, lowBlockSpecialties, subgroups, subgroup, programGroups, selectedProgram, bachelorPrograms]);

  const entriesWithCity = useMemo(
    () => effectiveEntries.map((e) => ({ ...e, _city: getCityForEntry(e) })),
    [effectiveEntries]
  );

  const allUniversities = useMemo(
    () => [...new Set(entriesWithCity.map((e) => e.university))].sort((a, b) => a.localeCompare(b, "az")),
    [entriesWithCity]
  );
  const allSpecialties = useMemo(
    () => [...new Set(entriesWithCity.map((e) => e.specialty))].sort((a, b) => a.localeCompare(b, "az")),
    [entriesWithCity]
  );
  const allCities = useMemo(
    () => [...new Set(entriesWithCity.map((e) => e._city))].sort((a, b) => a.localeCompare(b, "az")),
    [entriesWithCity]
  );

  const results = useMemo(() => {
    const s = parseFloat(score.replace(",", "."));
    if (!s || s < scoreMin || s > scoreMax) return null;

    let filtered = entriesWithCity;
    if (selectedSpecialty) filtered = filtered.filter((e) => e.specialty === selectedSpecialty);
    if (selectedCities.length > 0) {
      const set = new Set(selectedCities);
      filtered = filtered.filter((e) => set.has(e._city));
    }
    if (selectedUnis.length > 0) {
      const set = new Set(selectedUnis);
      filtered = filtered.filter((e) => set.has(e.university));
    }
    if (selectedSpecs.length > 0) {
      const set = new Set(selectedSpecs);
      filtered = filtered.filter((e) => set.has(e.specialty));
    }
    if (specSearch.trim()) {
      const raw = specSearch.trim();
      const q = normalizeText(raw);
      filtered = filtered.filter(
        (e) =>
          normalizeText(e.specialty).includes(q) ||
          normalizeText(e.university).includes(q) ||
          (e.code ? e.code.includes(raw) : false) ||
          (e.stateCode ? e.stateCode.includes(raw) : false)
      );
    }
    if (fundingFilter === "state") filtered = filtered.filter((e) => e.stateScore != null);
    else if (fundingFilter === "paid") filtered = filtered.filter((e) => e.score != null);

    const statusOf = (diff: number): Status => {
      if (diff >= borderlineRange) return "guaranteed";
      if (diff >= -borderlineRange) return "borderline";
      return "notEnough";
    };
    const chanceOf = (diff: number) =>
      Math.max(0, Math.min(100, Math.round(100 / (1 + Math.exp(-diff / borderlineRange)))));

    const mapped = filtered.map((e) => {
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
      const preferState = fundingFilter === "state" || paidDiff === null;
      const primaryDiff = (preferState ? stateDiff ?? paidDiff : paidDiff) ?? 0;
      const primaryStatus = (preferState ? stateStatus ?? paidStatus : paidStatus) ?? "notEnough";
      return {
        ...e,
        paidDiff, paidChance, paidStatus,
        stateDiff, stateChance, stateStatus,
        diff: primaryDiff,
        status: primaryStatus,
      };
    });

    const order = { guaranteed: 0, borderline: 1, notEnough: 2 };
    mapped.sort((a, b) => {
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return b.diff - a.diff;
    });

    const guaranteed = mapped.filter((m) => m.status === "guaranteed").length;
    const borderline = mapped.filter((m) => m.status === "borderline").length;
    const notEnough = mapped.filter((m) => m.status === "notEnough").length;
    return { items: mapped, guaranteed, borderline, notEnough };
  }, [score, selectedCities, selectedUnis, selectedSpecs, specSearch, selectedSpecialty, entriesWithCity, scoreMin, scoreMax, borderlineRange, fundingFilter]);

  const visibleItems = results ? results.items.slice(0, limit) : [];

  return (
    <View>
      <PageIntro slug={slug} text={pt.description} />

      {/* Bal */}
      <InputField
        label={pt.yourScore}
        value={score}
        onChangeText={setScore}
        placeholder={scorePlaceholder}
        keyboardType="decimal-pad"
        hint={`${scoreMin}–${scoreMax} aralığında`}
      />

      {/* Tədris bölməsi */}
      {hasSections && (
        <View>
          <ChipGroup label="Tədris bölməsi" options={SECTION_OPTIONS} selected={section} onSelect={setSection} />
          {section !== "all" && (
            <Text style={[styles.note, { color: colors.n580 }]}>
              Müsabiqəsi hər iki bölmə üçün birgə aparılan ixtisaslar (AZ/RU) hər iki seçimdə görünür.
            </Text>
          )}
        </View>
      )}

      {/* Altqrup */}
      {subgroups?.length ? (
        <ChipGroup
          label={subgroupLabel}
          options={subgroups.map((sg) => ({ value: sg.value, label: sg.label }))}
          selected={subgroup}
          onSelect={setSubgroup}
        />
      ) : null}

      {/* Blok balı < 100 */}
      {lowBlockSpecialties?.length ? (
        <Pressable
          onPress={() => setLowBlock(!lowBlock)}
          style={[styles.lowBlock, { backgroundColor: BADGE.amber + "1a", borderColor: BADGE.amber + "66" }]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: lowBlock }}
        >
          <MaterialIcons
            name={lowBlock ? "check-box" : "check-box-outline-blank"}
            size={22}
            color={BADGE.amber}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.lowBlockTitle, { color: colors.n940 }]}>Blok balınız 100-dən aşağıdır?</Text>
            <Text style={[styles.lowBlockDesc, { color: colors.n760 }]}>
              Yalnız blok balı 100-dən aşağı olan abituriyentlər üçün açıq olan ixtisasları göstər.
            </Text>
          </View>
        </Pressable>
      ) : null}

      {/* Bakalavr ixtisası (magistr) */}
      {bachelorMap?.length ? (
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: colors.n700 }]}>{bachelorMapLabel}</Text>
          <TextInput
            value={selectedBachelor}
            onChangeText={(v) => {
              setSelectedBachelor(v);
              setSelectedProgram("");
              setSelectedSpecialty("");
              setBachelorOpen(true);
            }}
            onFocus={() => setBachelorOpen(true)}
            onBlur={() => setTimeout(() => setBachelorOpen(false), 200)}
            placeholder={bachelorMapPlaceholder}
            placeholderTextColor={colors.n400c}
            autoCorrect={false}
            style={[styles.textInput, { color: colors.n940, backgroundColor: colors.n200, borderColor: colors.n280 }]}
          />
          {bachelorOpen && bachelorFiltered.length > 0 && (
            <View style={[styles.dropdown, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 256 }}>
                {bachelorFiltered.slice(0, 50).map((b) => (
                  <Pressable
                    key={b.name}
                    onPress={() => {
                      setSelectedBachelor(b.name);
                      setSelectedProgram("");
                      setSelectedSpecialty("");
                      setBachelorOpen(false);
                    }}
                    style={({ pressed }) => [styles.dropItem, pressed && { backgroundColor: colors.n240 }]}
                  >
                    <Text style={[styles.dropText, { color: colors.n940 }]}>{b.name}</Text>
                  </Pressable>
                ))}
                {bachelorFiltered.length > 50 && (
                  <Text style={[styles.dropMore, { color: colors.n580, backgroundColor: colors.n240 }]}>
                    +{bachelorFiltered.length - 50} nəticə — axtarışı dəqiqləşdirin
                  </Text>
                )}
              </ScrollView>
            </View>
          )}
          {bachelorPrograms && (
            <View style={[styles.okBox, { backgroundColor: BADGE.green + "1a", borderColor: BADGE.green + "55" }]}>
              <Text style={{ fontSize: 12, color: BADGE.green, lineHeight: 17 }}>
                <Text style={{ fontWeight: "700" }}>{bachelorPrograms.length}</Text> magistr proqramına müraciət edə
                bilərsiniz (Proqram №: {bachelorPrograms.map((p) => p.num).join(", ")})
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Proqram N X (magistr) */}
      {programGroups?.length ? (
        <View style={{ marginBottom: 16 }}>
          <Select
            label={programGroupsLabel}
            value={selectedProgram}
            onSelect={setSelectedProgram}
            searchable
            options={[
              { value: "", label: "Bütün proqramlar" },
              ...programGroups.map((p) => ({ value: String(p.number), label: `Proqram №${p.number} — ${p.name}` })),
            ]}
          />
        </View>
      ) : null}

      {/* Konkret ixtisas (magistr) */}
      {showSpecialtySelector && allSpecialties.length > 0 ? (
        <View style={{ marginBottom: 16 }}>
          <Select
            label={specialtySelectorLabel}
            value={selectedSpecialty}
            onSelect={setSelectedSpecialty}
            searchable
            options={[
              { value: "", label: `${specialtySelectorAllLabel} (${allSpecialties.length})` },
              ...allSpecialties.map((s) => ({ value: s, label: s })),
            ]}
          />
        </View>
      ) : null}

      {/* Şəhər / müəssisə / ixtisas çoxlu seçimi */}
      <MultiChipPicker
        label="Şəhərlər"
        placeholder="Şəhər seçin..."
        options={allCities}
        selected={selectedCities}
        onChange={setSelectedCities}
        clearLabel="Hamısını sil"
      />
      <MultiChipPicker
        label="Universitet / Kollec"
        placeholder="Müəssisə seçin..."
        options={allUniversities}
        selected={selectedUnis}
        onChange={setSelectedUnis}
        clearLabel="Hamısını sil"
      />
      <MultiChipPicker
        label="İxtisaslar"
        placeholder="İxtisas seçin..."
        options={allSpecialties}
        selected={selectedSpecs}
        onChange={setSelectedSpecs}
        clearLabel="Hamısını sil"
      />

      {/* Sərbəst axtarış */}
      <InputField label={pt.searchSpecialty} value={specSearch} onChangeText={setSpecSearch} placeholder={pt.searchSpecialty} />

      {/* Maliyyələşmə */}
      <ChipGroup label="Maliyyələşmə növü" options={FUNDING_OPTIONS} selected={fundingFilter} onSelect={setFundingFilter} />

      {/* Nəticələr */}
      {results ? (
        results.items.length > 0 ? (
          <View style={{ gap: 12 }}>
            <View style={styles.summaryRow}>
              {[
                { n: results.guaranteed, l: pt.guaranteedCount, c: STATUS_COLOR.guaranteed },
                { n: results.borderline, l: pt.borderlineCount, c: STATUS_COLOR.borderline },
                { n: results.notEnough, l: "şans 0-a yaxın", c: STATUS_COLOR.notEnough },
              ].map((x) => (
                <View key={x.l} style={[styles.summaryCard, { backgroundColor: x.c + "1a", borderColor: x.c + "55" }]}>
                  <Text style={[styles.summaryNum, { color: x.c }]}>{x.n}</Text>
                  <Text style={[styles.summaryLabel, { color: x.c }]}>{x.l}</Text>
                </View>
              ))}
              <View style={[styles.summaryCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <Text style={[styles.summaryNum, { color: colors.n940 }]}>{results.items.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.n580 }]}>{pt.totalFound}</Text>
              </View>
            </View>

            {visibleItems.map((item, i) => {
              const c = STATUS_COLOR[item.status];
              return (
                <View
                  key={`${item.university}-${item.specialty}-${item.code ?? ""}-${i}`}
                  style={[styles.card, { backgroundColor: c + "12", borderColor: c + "55" }]}
                >
                  <Text style={[styles.uni, { color: colors.n580 }]}>
                    {!fundingCodes && item.code ? `${item.code} · ` : ""}
                    {item.university}
                  </Text>
                  <Text style={[styles.spec, { color: colors.n940 }]}>{item.specialty}</Text>
                  <View style={styles.badgeRow}>
                    {item.stream === "Ə" && <Badge label="Əyani" color={BADGE.blue} />}
                    {item.stream === "Q" && <Badge label="Qiyabi" color={BADGE.orange} />}
                    {!fundingCodes && item.seats != null && <Badge label={`${item.seats} yer`} color={BADGE.emerald} />}
                    {item.language ? <Badge label={item.language} color={BADGE.violet} /> : null}
                    {item.aptitudeRequired && <Badge label="Qabiliyyət" color={BADGE.amber} />}
                  </View>
                  {item.aptitude != null && (
                    <Text style={[styles.aptitude, { color: BADGE.amber }]}>
                      ⚠️ Qabiliyyət imtahanı tələb edir. Min bal:{" "}
                      <Text style={{ fontWeight: "700" }}>{item.aptitude}</Text>
                      {item.aptitudeState != null && item.aptitudeState !== item.aptitude ? (
                        <Text>
                          {" "}(d.s.: <Text style={{ fontWeight: "700" }}>{item.aptitudeState}</Text>)
                        </Text>
                      ) : null}
                    </Text>
                  )}
                  <View style={styles.scoreGrid}>
                    {fundingFilter !== "state" && (
                      <ScoreCell
                        title="Ödənişli"
                        value={item.score}
                        diff={item.paidDiff}
                        chance={item.paidChance}
                        status={item.paidStatus}
                        code={item.code}
                        seats={item.seats}
                        fee={item.fee}
                        fundingCodes={fundingCodes}
                      />
                    )}
                    {fundingFilter !== "paid" && (
                      <ScoreCell
                        title="Dövlət sifarişli"
                        value={item.stateScore}
                        diff={item.stateDiff}
                        chance={item.stateChance}
                        status={item.stateStatus}
                        code={item.stateCode}
                        seats={item.stateSeats}
                        fundingCodes={fundingCodes}
                      />
                    )}
                  </View>
                </View>
              );
            })}

            <ShowMore total={results.items.length} limit={limit} initial={INITIAL} step={STEP} onChange={setLimit} />

            {pt.source ? (
              <View style={[styles.sourceBox, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <Text style={{ fontSize: 12, color: colors.n580, textAlign: "center" }}>{pt.source}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.noResults}</Text>
          </View>
        )
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyState}</Text>
        </View>
      )}

      {extra}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={resolveRelatedIds(relatedIds)} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  smallLabel: { fontSize: 12, marginBottom: 4 },
  note: { fontSize: 12, marginTop: -8, marginBottom: 16, lineHeight: 17 },
  textInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  selChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    maxWidth: "100%",
  },
  selChipText: { fontSize: 12, fontWeight: "600", flexShrink: 1 },
  selChipX: { fontSize: 16, fontWeight: "700", lineHeight: 18 },
  dropdown: { borderWidth: 1, borderRadius: 10, marginTop: 4, overflow: "hidden" },
  dropItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropText: { fontSize: 14 },
  dropMore: { fontSize: 12, paddingHorizontal: 12, paddingVertical: 8 },
  lowBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  lowBlockTitle: { fontSize: 14, fontWeight: "600" },
  lowBlockDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  okBox: { marginTop: 8, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  summaryCard: {
    flexGrow: 1,
    flexBasis: "45%",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  summaryNum: { fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] },
  summaryLabel: { fontSize: 11, marginTop: 2, textAlign: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 12 },
  uni: { fontSize: 11, lineHeight: 15, marginBottom: 3 },
  spec: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6, marginBottom: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  aptitude: { fontSize: 11, lineHeight: 16, marginBottom: 6 },
  scoreGrid: { flexDirection: "row", gap: 8 },
  scoreCol: { flex: 1, borderRadius: 8, padding: 8 },
  scoreColLabel: { fontSize: 10, marginBottom: 2 },
  scoreVal: { fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  dash: { fontSize: 13 },
  diffBadge: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  diffBadgeText: { fontSize: 10, fontWeight: "700", fontVariant: ["tabular-nums"] },
  codeSeats: { fontSize: 10, lineHeight: 14, marginTop: 4, fontVariant: ["tabular-nums"] },
  sourceBox: { borderWidth: 1, borderRadius: 12, padding: 14 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
