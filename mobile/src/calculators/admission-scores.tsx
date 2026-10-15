import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";

import { admissionsGroup1 } from "@/data/admissions-group1-2026";
import { admissionsGroup2 } from "@/data/admissions-group2-2026";
import { admissionsGroup3 } from "@/data/admissions-group3-2026";
import { admissionsGroup4 } from "@/data/admissions-group4-2026";
import { admissionsGroup5 } from "@/data/admissions-group5-2026";
import { admissionsCollege9 } from "@/data/admissions-college-9-2026";
import { admissionsCollege11 } from "@/data/admissions-college-11-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup1 } from "@/data/admissions-plan-2026-group1";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";
import { planGroup3 } from "@/data/admissions-plan-2026-group3";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";
import { getCityForEntry } from "@/data/university-cities";

interface AdmissionEntry {
  code?: string;
  stateCode?: string;
  stateSeats?: number;
  fee?: string;
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

type Status = "guaranteed" | "borderline" | "notEnough";

interface ScoredEntry extends AdmissionEntry {
  paidDiff: number | null;
  paidChance: number | null;
  paidStatus: Status | null;
  stateDiff: number | null;
  stateChance: number | null;
  stateStatus: Status | null;
  primaryDiff: number;
  primaryStatus: Status;
  city: string;
}

interface SubgroupOption {
  value: string;
  label: string;
  specialties: string[];
  tag?: string;
  excludeTags?: string[];
}

interface GroupConfig {
  label: string;
  scoreMin: number;
  scoreMax: number;
  placeholder: string;
  fundingCodes: boolean;
  subgroups?: SubgroupOption[];
  subgroupLabel?: string;
  lowBlockSpecialties?: string[];
}

const BORDERLINE = 10;
const INITIAL_LIMIT = 30;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

function getStatus(diff: number): Status {
  if (diff >= BORDERLINE) return "guaranteed";
  if (diff >= -BORDERLINE) return "borderline";
  return "notEnough";
}

function getChance(diff: number): number {
  return Math.max(0, Math.min(100, Math.round(100 / (1 + Math.exp(-diff / BORDERLINE)))));
}

const R_INFORMATIKA = [
  "İnformatika (rəqəmsal bacarıqlar) müəllimliyi",
  "Riyaziyyat və informatika (rəqəmsal bacarıqlar) müəllimliyi",
  "Kompüter elmləri", "Data analitikası",
  "Proqram təminatı mühəndisliyi", "İnformasiya təhlükəsizliyi",
  "İnformasiya texnologiyaları", "Kompüter mühəndisliyi",
  "Mexatronika və robototexnika mühəndisliyi",
  "Proseslərin avtomatlaşdırılması mühəndisliyi",
  "Sistemlər mühəndisliyi",
];

const R_KIMYA = [
  "Fizika müəllimliyi", "Riyaziyyat müəllimliyi",
  "Texnologiya müəllimliyi", "Fizika", "Geologiya", "Mexanika", "Riyaziyyat",
  "Aerokosmik mühəndislik", "Aqromühəndislik",
  "Aviasiya təhlükəsizliyi mühəndisliyi", "Cihaz mühəndisliyi",
  "Dəniz naviqasiyası mühəndisliyi", "Ekologiya mühəndisliyi",
  "Elektrik və elektronika mühəndisliyi", "Energetika mühəndisliyi",
  "Gəmi energetik qurğularının istismarı mühəndisliyi",
  "Gəmiqayırma və gəmi təmiri mühəndisliyi",
  "Geologiya və geofizika mühəndisliyi",
  "Geomatika və geodeziya mühəndisliyi",
  "Hava nəqliyyatının hərəkətinin təşkili",
  "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi",
  "İnşaat mühəndisliyi", "Kimya mühəndisliyi",
  "Kommunikasiya sistemləri mühəndisliyi",
  "Logistika və nəqliyyat texnologiyaları mühəndisliyi",
  "Maşın mühəndisliyi", "Materiallar mühəndisliyi",
  "Mədən mühəndisliyi", "Meliorasiya mühəndisliyi",
  "Memarlıq", "Metallurgiya mühəndisliyi", "Mexanika mühəndisliyi",
  "Mühəndislik fizikası", "Neft-qaz mühəndisliyi",
  "Nəqliyyat mühəndisliyi", "Nəqliyyat tikintisi mühəndisliyi",
  "Qida mühəndisliyi", "Radiotexnika və telekommunikasiya mühəndisliyi",
  "Şəhərsalma", "Sənaye mühəndisliyi", "Uçuş mühəndisliyi",
  "Yanğın təhlükəsizliyi mühəndisliyi",
  "Aqronomluq", "Balıqçılıq", "Meşəçilik", "Şərabçılıq",
  "Torpaqşünaslıq və aqrokimya",
  "Yerquruluşu və daşınmaz əmlakın kadastrı", "Zoomühəndislik",
  "Daşınmaz əmlakın idarə olunması", "Heyvandarlıq",
  "Kənd təsərrüfatı texnologiyaları", "Qida texnologiyaları",
  "Silah sistemləri mühəndisliyi",
  "Xüsusi rabitə vasitələri mühəndisliyi",
];

const DIL_TARIX = [
  "Azərbaycan dili və ədəbiyyatı müəllimliyi",
  "Dil və ədəbiyyat müəllimliyi", "İbtidai sinif müəllimliyi",
  "Korreksiyaedici təlim", "Xüsusi pedaqogika", "Məktəbəqədər təhsil",
  "Tarix müəllimliyi", "Təhsildə sosial-psixoloji xidmət",
  "Xarici dil müəllimliyi", "Dinşünaslıq",
  "Dövlət və ictimai münasibətlər", "Fəlsəfə", "Filologiya",
  "Hüquqşünaslıq", "İslamşünaslıq", "Jurnalistika",
  "Kitabxanaçılıq və informasiya fəaliyyəti", "Politologiya",
  "Tarix", "Tərcümə", "Bədii yaradıcılıq və ekran dramaturgiyası",
  "Ədəbi yaradıcılıq və ekran dramaturgiyası",
  "Muzey, arxiv işi və abidələrin qorunması", "Sənətşünaslıq",
  "Sosial iş", "İctimai təhlükəsizlik və idarəetmə",
  "Kommunikasiya və rəqəmsal media",
];

const TARIX_COGRAFIYA = ["Beynəlxalq münasibətlər", "Regionşün"];

const GROUP_CONFIGS: Record<string, GroupConfig> = {
  "qebul-ballari-1ci-qrup": {
    label: "I qrup keçid balları · 2026",
    scoreMin: 100, scoreMax: 700, placeholder: "350",
    fundingCodes: false,
    subgroups: [
      { value: "all", label: "Hamısı", specialties: [] },
      { value: "rk", label: "Riyaziyyat-Kimya (RK)", specialties: R_KIMYA },
      { value: "ri", label: "Riyaziyyat-İnformatika (Rİ)", specialties: R_INFORMATIKA },
    ],
    subgroupLabel: "İmtahan verdiyiniz altqrup",
    lowBlockSpecialties: [
      "Meliorasiya mühəndisliyi", "Texnologiya müəllimliyi",
      "Ekologiya mühəndisliyi", "Aqronomluq", "Balıqçılıq",
      "Meşəçilik", "Şərabçılıq", "Torpaqşünaslıq və aqrokimya",
      "Yerquruluşu və daşınmaz əmlakın kadastrı", "Zoomühəndislik",
    ],
  },
  "qebul-ballari-2ci-qrup": {
    label: "II qrup keçid balları · 2026",
    scoreMin: 100, scoreMax: 700, placeholder: "350",
    fundingCodes: false,
    lowBlockSpecialties: [
      "Marketinq", "Biznesin idarə edilməsi",
      "Turizm bələdçiliyi", "Turizm işinin təşkili",
    ],
  },
  "qebul-ballari-3cu-qrup": {
    label: "III qrup keçid balları · 2026",
    scoreMin: 100, scoreMax: 700, placeholder: "350",
    fundingCodes: false,
    subgroups: [
      { value: "all", label: "Hamısı", specialties: [] },
      { value: "dt", label: "Dil-tarix (DT)", specialties: DIL_TARIX },
      { value: "tc", label: "Tarix-coğrafiya (TC)", specialties: TARIX_COGRAFIYA },
    ],
    subgroupLabel: "İmtahan verdiyiniz altqrup",
    lowBlockSpecialties: ["Muzey, arxiv işi", "Sosial iş", "Regionşün"],
  },
  "qebul-ballari-4cu-qrup": {
    label: "IV qrup keçid balları · 2026",
    scoreMin: 100, scoreMax: 700, placeholder: "350",
    fundingCodes: false,
    lowBlockSpecialties: [
      "Ekologiya", "Bağçılıq və tərəvəzçilik",
      "Baytarlıq təbabəti", "Bitki mühafizəsi",
      "Su bioehtiyatları və akvakultura",
    ],
  },
  "qebul-ballari-5ci-qrup": {
    label: "V qrup keçid balları · 2026",
    scoreMin: 0, scoreMax: 300, placeholder: "180",
    fundingCodes: false,
  },
  "qebul-ballari-9illik-kollec": {
    label: "9-illik kollec balları · 2026",
    scoreMin: 0, scoreMax: 300, placeholder: "140",
    fundingCodes: true,
  },
  "qebul-ballari-11illik-kollec": {
    label: "11-illik kollec balları · 2026",
    scoreMin: 0, scoreMax: 300, placeholder: "180",
    fundingCodes: true,
  },
};

function getDataForSlug(slug: string): AdmissionEntry[] {
  switch (slug) {
    case "qebul-ballari-1ci-qrup":
      return attachPlan(admissionsGroup1, planGroup1) as AdmissionEntry[];
    case "qebul-ballari-2ci-qrup":
      return attachPlan(admissionsGroup2, planGroup2) as AdmissionEntry[];
    case "qebul-ballari-3cu-qrup":
      return attachPlan(admissionsGroup3, planGroup3) as AdmissionEntry[];
    case "qebul-ballari-4cu-qrup":
      return attachPlan(admissionsGroup4, planGroup4) as AdmissionEntry[];
    case "qebul-ballari-5ci-qrup":
      return admissionsGroup5 as AdmissionEntry[];
    case "qebul-ballari-9illik-kollec":
      return admissionsCollege9 as AdmissionEntry[];
    case "qebul-ballari-11illik-kollec":
      return admissionsCollege11 as AdmissionEntry[];
    default:
      return [];
  }
}

type FundingFilter = "all" | "paid" | "state";
type SectionFilter = "all" | "AZ" | "RU";

export function AdmissionScoresCalculator() {
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const groupKey = slug || "qebul-ballari-1ci-qrup";
  const config = GROUP_CONFIGS[groupKey] ?? GROUP_CONFIGS["qebul-ballari-1ci-qrup"];

  const [scoreInput, setScoreInput] = useState("");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [subgroup, setSubgroup] = useState(config.subgroups?.[0]?.value ?? "");
  const [section, setSection] = useState<SectionFilter>("all");
  const [lowBlock, setLowBlock] = useState(false);
  const [fundingFilter, setFundingFilter] = useState<FundingFilter>("all");

  const rawData = useMemo(() => getDataForSlug(groupKey), [groupKey]);

  const hasSections = useMemo(
    () => rawData.some((e) => e.language === "RU" || e.language === "AZ/RU"),
    [rawData]
  );

  const userScore = useMemo(() => {
    const v = parseFloat(scoreInput);
    if (isNaN(v) || v < config.scoreMin) return null;
    return Math.min(v, config.scoreMax);
  }, [scoreInput, config.scoreMin, config.scoreMax]);

  const filteredData = useMemo(() => {
    let result = rawData;

    if (section !== "all") {
      result = result.filter((e) => e.language === section || e.language === "AZ/RU");
    }

    if (config.subgroups?.length && subgroup) {
      const active = config.subgroups.find((s) => s.value === subgroup);
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

    if (lowBlock && config.lowBlockSpecialties?.length) {
      const needles = config.lowBlockSpecialties.map((s) => s.toLocaleLowerCase("az"));
      result = result.filter((e) => {
        const hay = e.specialty.toLocaleLowerCase("az");
        return needles.some((n) => hay.includes(n));
      });
    }

    if (fundingFilter === "state") {
      result = result.filter((e) => e.stateScore != null);
    } else if (fundingFilter === "paid") {
      result = result.filter((e) => e.score != null);
    }

    return result;
  }, [rawData, section, subgroup, lowBlock, fundingFilter, config]);

  const results = useMemo(() => {
    const q = query.trim() ? normalize(query.trim()) : "";
    const scored: ScoredEntry[] = [];

    for (const entry of filteredData) {
      if (q) {
        const haystack = normalize(entry.university) + " " + normalize(entry.specialty)
          + " " + (entry.code ?? "").toLowerCase() + " " + (entry.stateCode ?? "").toLowerCase();
        if (!haystack.includes(q)) continue;
      }

      const city = getCityForEntry(entry);

      if (userScore == null) {
        scored.push({
          ...entry,
          paidDiff: null, paidChance: null, paidStatus: null,
          stateDiff: null, stateChance: null, stateStatus: null,
          primaryDiff: 0, primaryStatus: "notEnough", city,
        });
        continue;
      }

      let paidDiff: number | null = null;
      let paidChance: number | null = null;
      let paidStatus: Status | null = null;
      if (entry.score != null) {
        paidDiff = userScore - entry.score;
        paidChance = getChance(paidDiff);
        paidStatus = getStatus(paidDiff);
      }

      let stateDiff: number | null = null;
      let stateChance: number | null = null;
      let stateStatus: Status | null = null;
      if (entry.stateScore != null) {
        stateDiff = userScore - entry.stateScore;
        stateChance = getChance(stateDiff);
        stateStatus = getStatus(stateDiff);
      }

      const preferState = fundingFilter === "state" || paidDiff === null;
      const primaryDiff = (preferState ? stateDiff ?? paidDiff : paidDiff) ?? 0;
      const primaryStatus = (preferState ? stateStatus ?? paidStatus : paidStatus) ?? "notEnough";

      scored.push({
        ...entry,
        paidDiff, paidChance, paidStatus,
        stateDiff, stateChance, stateStatus,
        primaryDiff, primaryStatus, city,
      });
    }

    if (userScore != null) {
      const order = { guaranteed: 0, borderline: 1, notEnough: 2 };
      scored.sort((a, b) => {
        if (order[a.primaryStatus] !== order[b.primaryStatus])
          return order[a.primaryStatus] - order[b.primaryStatus];
        return b.primaryDiff - a.primaryDiff;
      });
    }

    return scored;
  }, [filteredData, query, userScore, fundingFilter]);

  const summary = useMemo(() => {
    if (userScore == null) return null;
    let guaranteed = 0, borderline = 0, notEnough = 0;
    for (const r of results) {
      if (r.primaryStatus === "guaranteed") guaranteed++;
      else if (r.primaryStatus === "borderline") borderline++;
      else notEnough++;
    }
    return { guaranteed, borderline, notEnough, total: results.length };
  }, [results, userScore]);

  const displayItems = showAll ? results : results.slice(0, INITIAL_LIMIT);

  const statusColor = useCallback((status: Status) => {
    switch (status) {
      case "guaranteed": return "#16a34a";
      case "borderline": return "#d97706";
      case "notEnough": return "#dc2626";
    }
  }, []);

  const statusBg = useCallback((status: Status) => {
    switch (status) {
      case "guaranteed": return "#dcfce7";
      case "borderline": return "#fef3c7";
      case "notEnough": return "#fee2e2";
    }
  }, []);

  const ChipButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.accent : colors.n240 },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? "#fff" : colors.n660 }]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderItem = ({ item }: { item: ScoredEntry }) => {
    const borderColor = userScore != null ? statusColor(item.primaryStatus) : colors.n280;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.n195, borderLeftColor: borderColor, borderLeftWidth: 3 },
        ]}
      >
        {/* Header badges */}
        <View style={styles.rowHeader}>
          {!config.fundingCodes && item.code && (
            <Text style={[styles.code, { color: colors.accent }]}>{item.code}</Text>
          )}
          {item.language && (
            <View style={[styles.badge, { backgroundColor: "#ede9fe" }]}>
              <Text style={[styles.badgeText, { color: "#6d28d9" }]}>{item.language}</Text>
            </View>
          )}
          {item.stream === "Ə" && (
            <View style={[styles.badge, { backgroundColor: "#dbeafe" }]}>
              <Text style={[styles.badgeText, { color: "#1d4ed8" }]}>Əyani</Text>
            </View>
          )}
          {item.stream === "Q" && (
            <View style={[styles.badge, { backgroundColor: "#ffedd5" }]}>
              <Text style={[styles.badgeText, { color: "#c2410c" }]}>Qiyabi</Text>
            </View>
          )}
          {!config.fundingCodes && item.seats != null && (
            <View style={[styles.badge, { backgroundColor: "#ecfdf5" }]}>
              <Text style={[styles.badgeText, { color: "#047857" }]}>{item.seats} yer</Text>
            </View>
          )}
          {item.aptitudeRequired && (
            <View style={[styles.badge, { backgroundColor: "#fef3c7" }]}>
              <Text style={[styles.badgeText, { color: "#92400e" }]}>Qabiliyyət</Text>
            </View>
          )}
        </View>

        {/* University */}
        <Text style={[styles.uni, { color: colors.n840 }]} numberOfLines={2}>
          {item.university}
        </Text>
        {/* Specialty */}
        <Text style={[styles.spec, { color: colors.n660 }]} numberOfLines={3}>
          {item.specialty}
        </Text>

        {/* Aptitude warning */}
        {item.aptitude != null && (
          <View style={styles.aptitudeWarn}>
            <Text style={styles.aptitudeIcon}>⚠️</Text>
            <Text style={styles.aptitudeText}>
              Qabiliyyət imtahanı tələb edir. Min bal:{" "}
              <Text style={{ fontWeight: "700" }}>{item.aptitude}</Text>
              {item.aptitudeState != null && item.aptitudeState !== item.aptitude && (
                <Text> (d.s.: <Text style={{ fontWeight: "700" }}>{item.aptitudeState}</Text>)</Text>
              )}
            </Text>
          </View>
        )}

        {/* Score section */}
        {userScore != null ? (
          <View style={styles.scoreGrid}>
            {/* Paid column */}
            {fundingFilter !== "state" && (
              <View style={[styles.scoreCol, { backgroundColor: colors.n165 }]}>
                <Text style={[styles.scoreColLabel, { color: colors.n580 }]}>Ödənişli</Text>
                {item.score != null ? (
                  <>
                    <Text style={[styles.scoreVal, { color: colors.n940 }]}>{item.score}</Text>
                    {item.paidDiff != null && item.paidStatus != null && (
                      <View style={[styles.diffBadge, { backgroundColor: statusBg(item.paidStatus) }]}>
                        <Text style={[styles.diffBadgeText, { color: statusColor(item.paidStatus) }]}>
                          {item.paidDiff >= 0 ? "+" : ""}{item.paidDiff.toFixed(1)} · {item.paidChance}%
                        </Text>
                      </View>
                    )}
                    {config.fundingCodes && (
                      <View style={styles.codeSeats}>
                        {item.code && <Text style={[styles.codeSeatsText, { color: colors.n840 }]}>{item.code}</Text>}
                        {item.seats != null && <Text style={[styles.codeSeatsText, { color: colors.n580 }]}>{item.seats} yer</Text>}
                        {item.fee && <Text style={[styles.codeSeatsText, { color: colors.n580 }]}>{item.fee} ₼</Text>}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={[styles.scoreVal, { color: colors.n400 }]}>—</Text>
                )}
              </View>
            )}
            {/* State column */}
            {fundingFilter !== "paid" && (
              <View style={[styles.scoreCol, { backgroundColor: colors.n165 }]}>
                <Text style={[styles.scoreColLabel, { color: colors.n580 }]}>Dövlət sifarişli</Text>
                {item.stateScore != null ? (
                  <>
                    <Text style={[styles.scoreVal, { color: colors.n940 }]}>{item.stateScore}</Text>
                    {item.stateDiff != null && item.stateStatus != null && (
                      <View style={[styles.diffBadge, { backgroundColor: statusBg(item.stateStatus) }]}>
                        <Text style={[styles.diffBadgeText, { color: statusColor(item.stateStatus) }]}>
                          {item.stateDiff >= 0 ? "+" : ""}{item.stateDiff.toFixed(1)} · {item.stateChance}%
                        </Text>
                      </View>
                    )}
                    {config.fundingCodes && (
                      <View style={styles.codeSeats}>
                        {item.stateCode && <Text style={[styles.codeSeatsText, { color: colors.n840 }]}>{item.stateCode}</Text>}
                        {item.stateSeats != null && <Text style={[styles.codeSeatsText, { color: colors.n580 }]}>{item.stateSeats} yer</Text>}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={[styles.scoreVal, { color: colors.n400 }]}>—</Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.rowFooter}>
            {item.score != null && (
              <Text style={[styles.scoreText, { color: colors.accent }]}>{item.score} bal</Text>
            )}
            {item.stateScore != null && (
              <Text style={[styles.scoreText, { color: "#16a34a" }]}>DQ: {item.stateScore}</Text>
            )}
            {!config.fundingCodes && item.seats != null && (
              <Text style={[styles.seatsText, { color: colors.n580 }]}>{item.seats} yer</Text>
            )}
          </View>
        )}

        {/* City */}
        <Text style={[styles.cityText, { color: colors.n500c }]}>{item.city}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Title */}
      <Text style={[styles.groupLabel, { color: colors.accent }]}>
        {config.label}
      </Text>

      {/* Score input */}
      <View style={[styles.inputWrap, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <TextInput
          style={[styles.inputField, { color: colors.n940 }]}
          value={scoreInput}
          onChangeText={setScoreInput}
          placeholder={`İmtahan balınızı daxil edin (${config.scoreMin}–${config.scoreMax})`}
          placeholderTextColor={colors.n400c}
          keyboardType="numeric"
        />
      </View>

      {/* Section filter (AZ/RU) */}
      {hasSections && (
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.n840 }]}>Tədris bölməsi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <ChipButton label="Hər iki bölmə" active={section === "all"} onPress={() => setSection("all")} />
              <ChipButton label="Azərbaycan bölməsi" active={section === "AZ"} onPress={() => setSection("AZ")} />
              <ChipButton label="Rus bölməsi" active={section === "RU"} onPress={() => setSection("RU")} />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Subgroup filter */}
      {config.subgroups && config.subgroups.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.n840 }]}>
            {config.subgroupLabel || "Altqrup"}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {config.subgroups.map((sg) => (
                <ChipButton
                  key={sg.value}
                  label={sg.label}
                  active={subgroup === sg.value}
                  onPress={() => setSubgroup(sg.value)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Low-block toggle */}
      {config.lowBlockSpecialties && config.lowBlockSpecialties.length > 0 && (
        <Pressable
          onPress={() => setLowBlock(!lowBlock)}
          style={[
            styles.lowBlockWrap,
            { backgroundColor: lowBlock ? "#fef3c7" : colors.n240, borderColor: lowBlock ? "#fbbf24" : colors.n280 },
          ]}
        >
          <View style={[styles.checkbox, { borderColor: lowBlock ? "#d97706" : colors.n400 }]}>
            {lowBlock && <MaterialIcons name="check" size={14} color="#d97706" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lowBlockTitle, { color: lowBlock ? "#92400e" : colors.n840 }]}>
              Blok balınız 100-dən aşağıdır?
            </Text>
            <Text style={[styles.lowBlockDesc, { color: lowBlock ? "#92400e" : colors.n580 }]}>
              Yalnız blok balı 100-dən aşağı olan abituriyentlər üçün açıq olan ixtisasları göstər
            </Text>
          </View>
        </Pressable>
      )}

      {/* Search */}
      <View style={[styles.inputWrap, { backgroundColor: colors.n240, borderColor: colors.n280, marginTop: 8 }]}>
        <TextInput
          style={[styles.inputField, { color: colors.n940 }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Universitet və ya ixtisas axtar..."
          placeholderTextColor={colors.n400c}
        />
      </View>

      {/* Funding filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.n840 }]}>Maliyyələşmə növü</Text>
        <View style={styles.chipRow}>
          <ChipButton label="Hamısı" active={fundingFilter === "all"} onPress={() => setFundingFilter("all")} />
          <ChipButton label="Ödənişli" active={fundingFilter === "paid"} onPress={() => setFundingFilter("paid")} />
          <ChipButton label="Dövlət sifarişli" active={fundingFilter === "state"} onPress={() => setFundingFilter("state")} />
        </View>
      </View>

      {/* Summary */}
      {summary && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#dcfce7" }]}>
            <Text style={[styles.summaryNum, { color: "#16a34a" }]}>{summary.guaranteed}</Text>
            <Text style={[styles.summaryLabel, { color: "#16a34a" }]}>Şans yüksək</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#fef3c7" }]}>
            <Text style={[styles.summaryNum, { color: "#d97706" }]}>{summary.borderline}</Text>
            <Text style={[styles.summaryLabel, { color: "#d97706" }]}>Riskli</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#fee2e2" }]}>
            <Text style={[styles.summaryNum, { color: "#dc2626" }]}>{summary.notEnough}</Text>
            <Text style={[styles.summaryLabel, { color: "#dc2626" }]}>Şans 0-a yaxın</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.summaryNum, { color: colors.n840 }]}>{summary.total}</Text>
            <Text style={[styles.summaryLabel, { color: colors.n580 }]}>Cəmi</Text>
          </View>
        </View>
      )}

      {/* Result count */}
      <Text style={[styles.resultCount, { color: colors.n580 }]}>
        {results.length} nəticə
        {!showAll && results.length > INITIAL_LIMIT ? ` (ilk ${INITIAL_LIMIT} göstərilir)` : ""}
      </Text>

      {/* List */}
      <FlatList
        data={displayItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.code ?? "") + "-" + (item.stateCode ?? "") + "-" + index}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>
              {userScore == null ? "🎯" : "🔍"}
            </Text>
            <Text style={[styles.empty, { color: colors.n580 }]}>
              {userScore == null
                ? `İmtahan balınızı daxil edin (${config.scoreMin}–${config.scoreMax} aralığında)`
                : "Bu bala uyğun ixtisas tapılmadı"}
            </Text>
          </View>
        }
        ListFooterComponent={
          !showAll && results.length > INITIAL_LIMIT ? (
            <Pressable
              onPress={() => setShowAll(true)}
              style={[styles.showAllBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.showAllText}>
                Hamısını göstər ({results.length})
              </Text>
            </Pressable>
          ) : showAll && results.length > INITIAL_LIMIT ? (
            <Pressable
              onPress={() => setShowAll(false)}
              style={[styles.showAllBtn, { backgroundColor: colors.n400 }]}
            >
              <Text style={styles.showAllText}>Azalt</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    fontSize: 16, fontWeight: "700", marginBottom: 12,
  },
  inputWrap: {
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12,
  },
  inputField: {
    fontSize: 14, paddingVertical: 10,
  },
  filterSection: {
    marginTop: 10,
  },
  filterLabel: {
    fontSize: 13, fontWeight: "600", marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row", gap: 6, flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
  },
  chipText: {
    fontSize: 12, fontWeight: "600",
  },
  lowBlockWrap: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    marginTop: 10, padding: 12, borderRadius: 10, borderWidth: 1,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2,
    alignItems: "center", justifyContent: "center", marginTop: 2,
  },
  lowBlockTitle: {
    fontSize: 13, fontWeight: "600",
  },
  lowBlockDesc: {
    fontSize: 11, marginTop: 2, lineHeight: 15,
  },
  summaryRow: {
    flexDirection: "row", gap: 6, marginTop: 12,
  },
  summaryCard: {
    flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center",
  },
  summaryNum: {
    fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"],
  },
  summaryLabel: {
    fontSize: 9, fontWeight: "600", marginTop: 2, textAlign: "center",
  },
  resultCount: {
    fontSize: 12, marginTop: 10, marginBottom: 6,
  },
  card: {
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  rowHeader: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap",
  },
  code: {
    fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"],
  },
  badge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  badgeText: {
    fontSize: 10, fontWeight: "600",
  },
  uni: {
    fontSize: 14, fontWeight: "600", marginBottom: 2,
  },
  spec: {
    fontSize: 13, marginBottom: 6,
  },
  aptitudeWarn: {
    flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 6,
  },
  aptitudeIcon: { fontSize: 12 },
  aptitudeText: {
    fontSize: 11, color: "#92400e", flex: 1, lineHeight: 16,
  },
  scoreGrid: {
    flexDirection: "row", gap: 8, marginBottom: 4,
  },
  scoreCol: {
    flex: 1, borderRadius: 8, padding: 8,
  },
  scoreColLabel: {
    fontSize: 10, marginBottom: 4,
  },
  scoreVal: {
    fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"],
  },
  diffBadge: {
    alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, marginTop: 4,
  },
  diffBadgeText: {
    fontSize: 10, fontWeight: "700", fontVariant: ["tabular-nums"],
  },
  codeSeats: {
    marginTop: 4, gap: 2,
  },
  codeSeatsText: {
    fontSize: 10, fontVariant: ["tabular-nums"],
  },
  rowFooter: {
    flexDirection: "row", gap: 12, marginTop: 4,
  },
  scoreText: {
    fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"],
  },
  seatsText: {
    fontSize: 12, fontVariant: ["tabular-nums"],
  },
  cityText: {
    fontSize: 11, marginTop: 4,
  },
  emptyWrap: {
    alignItems: "center", paddingVertical: 24,
  },
  empty: {
    textAlign: "center", fontSize: 13,
  },
  showAllBtn: {
    borderRadius: 8, paddingVertical: 12, alignItems: "center",
    marginTop: 4, marginBottom: 16,
  },
  showAllText: {
    color: "#fff", fontSize: 14, fontWeight: "600",
  },
});
