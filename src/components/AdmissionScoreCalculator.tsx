"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import { getCityForEntry } from "@/data/university-cities";

// Azərbaycan hərflərini ingilis klaviatura analoqlarına çevirir və lowercase edir.
// NFD + combining-mark silmə "İ" → "i" problemi və digər diakritikləri həll edir
// (ç→c, ş→s, ğ→g, ö→o, ü→u). ı və ə üçün əlavə manual əvəz.
// Beləliklə "İqtisadiyyat", "iqtisadiyyat", "Iqtisadiyyat" hamısı uyğunlaşır.
function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

export interface AdmissionEntry {
  code?: string;
  university: string;
  specialty: string;
  stream?: string;
  aptitude?: number;
  /** Dövlət sifarişli (state-funded) qabiliyyət imtahanı minimum balı. */
  aptitudeState?: number;
  /** Ödənişli keçid balı. Yalnız dövlət sifarişli yer ayrılan ixtisaslarda olmur. */
  score?: number;
  /** Dövlət sifarişli (state-funded) keçid balı — shown in parentheses on source. */
  stateScore?: number;
  /** Bu il ayrılmış plan yerlərinin sayı (DİM "Abituriyent 4" bukleti). */
  seats?: number;
  /** Tədris dili: AZ · RU · AZ/RU · EN · TR · DE */
  language?: string;
  /** Optional tag for subgroup filtering (e.g. "mba"). */
  tag?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  AZ: "Azərbaycan dili",
  RU: "Rus dili",
  "AZ/RU": "Azərbaycan / rus dili",
  EN: "İngilis dili",
  TR: "Türk dili",
  DE: "Alman dili",
};

/** Plan məlumatı: bu il ayrılmış yer sayı və tədris dili. */
function PlanBadges({ seats, language }: { seats?: number; language?: string }) {
  if (seats == null && !language) return null;
  return (
    <>
      {seats != null && (
        <span
          title="Bu il ayrılmış plan yerlərinin sayı"
          className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 align-middle whitespace-nowrap"
        >
          {seats} yer
        </span>
      )}
      {language && (
        <span
          title={LANGUAGE_LABELS[language] ?? language}
          className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 align-middle whitespace-nowrap"
        >
          {language}
        </span>
      )}
    </>
  );
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
  /** Substrings (lowercased) that must match specialty name. Empty means "all". */
  specialties: string[];
  /** If set, entries whose `tag` equals this are also included (OR with specialties match). */
  tag?: string;
  /** If set, entries whose `tag` is in this list are excluded from this subgroup. */
  excludeTags?: string[];
}

// ── Multi-select chip picker ────────────────────────────────────────────────────
// Datalist-li input + seçilmiş chip-lər. İstifadəçi yazır, dropdown-dan seçir
// və ya Enter basır → seçilənlər siyahısına əlavə olunur.

interface MultiChipPickerProps {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  clearLabel: string;
}

function MultiChipPicker({ id, label, placeholder, options, selected, onChange, clearLabel }: MultiChipPickerProps) {
  const [draft, setDraft] = useState("");

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
    // Exact match yoxlanılır — datalist seçimi və ya tam yazılmış seçimə imkan ver.
    if (options.includes(v) && !selected.includes(v)) {
      onChange([...selected, v]);
      setDraft("");
      return;
    }
    // Case-insensitive exact match-ə də imkan ver.
    const ciHit = options.find((o) => normalizeText(o) === normalizeText(v) && !selected.includes(o));
    if (ciHit) {
      onChange([...selected, ciHit]);
      setDraft("");
    }
  };

  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2.5 h-7 rounded-full bg-primary text-white text-xs font-medium max-w-full"
            >
              <span className="truncate">{s}</span>
              <button
                type="button"
                onClick={() => onChange(selected.filter((x) => x !== s))}
                className="text-white/80 hover:text-white text-base leading-none -mr-0.5"
                aria-label={`${s} sil`}
              >
                ×
              </button>
            </span>
          ))}
          {selected.length > 1 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="inline-flex items-center px-2.5 h-7 rounded-full bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 hover:text-foreground"
            >
              {clearLabel}
            </button>
          )}
        </div>
      )}
      <input
        type="text"
        list={id}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          // Əgər istifadəçi datalist-dən seçim edib (dəqiq uyğunluq) — dərhal əlavə et.
          if (options.includes(v)) add(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (available.length > 0) add(available[0]);
          } else if (e.key === "Backspace" && draft === "" && selected.length > 0) {
            onChange(selected.slice(0, -1));
          }
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        autoComplete="off"
      />
      <datalist id={id}>
        {available.slice(0, 200).map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}

interface Props {
  entries: AdmissionEntry[];
  translations: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation };
  relatedIds?: string[];
  scoreMin?: number;
  scoreMax?: number;
  scorePlaceholder?: string;
  borderlineRange?: number;
  /** If provided, shows a "block score < 100" toggle that filters to specialties matching these phrases. */
  lowBlockSpecialties?: string[];
  /** If provided, shows a subgroup selector (e.g. RK / Rİ for 1st group). First option = "all". */
  subgroups?: SubgroupOption[];
  subgroupLabel?: string;
  /** If true, shows a dropdown listing all unique specialties so user can pick one directly. */
  showSpecialtySelector?: boolean;
  specialtySelectorLabel?: string;
  specialtySelectorAllLabel?: string;
  /** Magistr-style program groups (N X → specialty keywords). Rendered as a numbered select. */
  programGroups?: { number: number; name: string; keywords: string[] }[];
  programGroupsLabel?: string;
  /** Bachelor-to-magistr mapping: when user selects their bachelor specialty, filter to matching programs. */
  bachelorMap?: { name: string; programs: { num: number; minScore: number }[] }[];
  bachelorMapLabel?: string;
  bachelorMapPlaceholder?: string;
}

export default function AdmissionScoreCalculator({
  entries,
  translations,
  relatedIds = ["university-admission", "gpa"],
  scoreMin = 100,
  scoreMax = 700,
  scorePlaceholder = "350",
  borderlineRange = 10,
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
}: Props) {
  const { lang } = useLanguage();
  const pt = translations[lang];

  const [score, setScore] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedUnis, setSelectedUnis] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [specSearch, setSpecSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [lowBlock, setLowBlock] = useState(false);
  const [fundingFilter, setFundingFilter] = useState<"all" | "paid" | "state">("all");
  const [subgroup, setSubgroup] = useState<string>(subgroups?.[0]?.value ?? "");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedBachelor, setSelectedBachelor] = useState("");
  const [bachelorOpen, setBachelorOpen] = useState(false);
  const bachelorWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bachelorOpen) return;
    const handler = (e: MouseEvent) => {
      if (!bachelorWrapRef.current?.contains(e.target as Node)) {
        setBachelorOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bachelorOpen]);

  const bachelorFiltered = useMemo(() => {
    if (!bachelorMap?.length) return [];
    const q = normalizeText(selectedBachelor.trim());
    if (!q) return bachelorMap;
    return bachelorMap.filter((b) => normalizeText(b.name).includes(q));
  }, [bachelorMap, selectedBachelor]);

  // Bachelor map: resolve selected bachelor to allowed program numbers
  const bachelorPrograms = useMemo(() => {
    if (!bachelorMap?.length || !selectedBachelor) return null;
    const q = normalizeText(selectedBachelor.trim());
    if (!q) return null;
    // Əvvəlcə tam bərabərlik, olmadıqda qismən uyğunluq.
    const exact = bachelorMap.find((b) => normalizeText(b.name) === q);
    const found = exact ?? bachelorMap.find((b) => normalizeText(b.name).includes(q));
    return found ? found.programs : null;
  }, [bachelorMap, selectedBachelor]);

  const effectiveEntries = useMemo(() => {
    let result = entries;
    // Bachelor filter: only show entries matching allowed program numbers
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
    // Program group filter (magistr: Proqram N X)
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
    // Subgroup filter (e.g. 1st group RK vs Rİ)
    if (subgroups?.length && subgroup) {
      const active = subgroups.find((s) => s.value === subgroup);
      if (active) {
        const needles = active.specialties.map((s) => s.toLocaleLowerCase("az"));
        const hasNameFilter = needles.length > 0;
        result = result.filter((e) => {
          // Exclude tagged entries this subgroup doesn't want
          if (active.excludeTags && e.tag && active.excludeTags.includes(e.tag)) return false;
          // No name filter and no tag → "all" (after exclusions)
          if (!hasNameFilter && !active.tag) return true;
          const hay = e.specialty.toLocaleLowerCase("az");
          const byName = needles.some((n) => hay.includes(n));
          const byTag = active.tag ? e.tag === active.tag : false;
          return byName || byTag;
        });
      }
    }
    // Low-block whitelist
    if (lowBlock && lowBlockSpecialties?.length) {
      const needles = lowBlockSpecialties.map((s) => s.toLocaleLowerCase("az"));
      result = result.filter((e) => {
        const hay = e.specialty.toLocaleLowerCase("az");
        return needles.some((n) => hay.includes(n));
      });
    }
    return result;
  }, [entries, lowBlock, lowBlockSpecialties, subgroups, subgroup, programGroups, selectedProgram, bachelorPrograms]);

  // Hər entry üçün şəhəri əvvəlcədən hesabla — filterləmə və siyahılar üçün istifadə olunur.
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
    const s = parseFloat(score);
    if (!s || s < scoreMin || s > scoreMax) return null;

    let filtered = entriesWithCity;

    if (selectedSpecialty) {
      filtered = filtered.filter((e) => e.specialty === selectedSpecialty);
    }

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
      const q = normalizeText(specSearch.trim());
      filtered = filtered.filter(
        (e) =>
          normalizeText(e.specialty).includes(q) ||
          normalizeText(e.university).includes(q) ||
          (e.code ? e.code.includes(specSearch.trim()) : false)
      );
    }

    // Maliyyələşmə (ödənişli / dövlət sifarişli) filtri
    if (fundingFilter === "state") {
      filtered = filtered.filter((e) => e.stateScore != null);
    } else if (fundingFilter === "paid") {
      filtered = filtered.filter((e) => e.score != null);
    }

    const statusOf = (diff: number): "guaranteed" | "borderline" | "notEnough" => {
      if (diff >= borderlineRange) return "guaranteed";
      if (diff >= -borderlineRange) return "borderline";
      return "notEnough";
    };
    const chanceOf = (diff: number) =>
      Math.max(0, Math.min(100, Math.round(100 / (1 + Math.exp(-diff / borderlineRange)))));

    const mapped = filtered.map((e) => {
      // Ödənişli bal olmaya bilər (yalnız dövlət sifarişli yer ayrılan ixtisaslar).
      let paidDiff: number | null = null;
      let paidChance: number | null = null;
      let paidStatus: "guaranteed" | "borderline" | "notEnough" | null = null;
      if (e.score != null) {
        paidDiff = s - e.score;
        paidChance = chanceOf(paidDiff);
        paidStatus = statusOf(paidDiff);
      }

      let stateDiff: number | null = null;
      let stateChance: number | null = null;
      let stateStatus: "guaranteed" | "borderline" | "notEnough" | null = null;
      if (e.stateScore != null) {
        stateDiff = s - e.stateScore;
        stateChance = chanceOf(stateDiff);
        stateStatus = statusOf(stateDiff);
      }

      // Primary (filter-based) diff & status — sayımlar və sıralama üçün.
      // Ödənişli bal yoxdursa, dövlət sifarişli bal əsas götürülür.
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

    mapped.sort((a, b) => {
      const order = { guaranteed: 0, borderline: 1, notEnough: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return b.diff - a.diff;
    });

    const guaranteed = mapped.filter((m) => m.status === "guaranteed").length;
    const borderline = mapped.filter((m) => m.status === "borderline").length;
    const notEnough = mapped.filter((m) => m.status === "notEnough").length;

    return { items: mapped, guaranteed, borderline, notEnough };
  }, [score, selectedCities, selectedUnis, selectedSpecs, specSearch, selectedSpecialty, entriesWithCity, scoreMin, scoreMax, borderlineRange, fundingFilter]);

  const visibleItems = results ? (showAll ? results.items : results.items.slice(0, 30)) : [];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=education" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={relatedIds}
    >
      {/* Score input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.yourScore}</label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={scorePlaceholder}
          min={scoreMin}
          max={scoreMax}
          step="0.1"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-lg font-bold placeholder:text-muted placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Subgroup selector (e.g. RK / Rİ for 1st group) */}
      {subgroups?.length ? (
        <div className="mb-4">
          <div className="text-sm font-medium text-foreground mb-2">{subgroupLabel}</div>
          <div className="flex flex-wrap gap-2">
            {subgroups.map((sg) => {
              const isActive = sg.value === subgroup;
              return (
                <button
                  key={sg.value}
                  type="button"
                  onClick={() => setSubgroup(sg.value)}
                  className={`px-3.5 h-9 rounded-full text-[13px] font-medium border transition-colors ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-foreground-muted border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {sg.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Low-block toggle */}
      {lowBlockSpecialties?.length ? (
        <label className="flex items-start gap-2.5 mb-6 p-3 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer hover:bg-amber-100/60 transition-colors">
          <input
            type="checkbox"
            checked={lowBlock}
            onChange={(e) => setLowBlock(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-amber-600"
          />
          <div className="flex-1 text-sm">
            <div className="font-medium text-amber-900">Blok balınız 100-dən aşağıdır?</div>
            <div className="text-xs text-amber-800 mt-0.5">
              Yalnız blok balı 100-dən aşağı olan abituriyentlər üçün açıq olan ixtisasları göstər.
            </div>
          </div>
        </label>
      ) : null}

      {/* Bachelor specialty selector */}
      {bachelorMap?.length ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">{bachelorMapLabel}</label>
          <div ref={bachelorWrapRef} className="relative">
            <input
              type="text"
              value={selectedBachelor}
              onChange={(e) => {
                setSelectedBachelor(e.target.value);
                setSelectedProgram("");
                setSelectedSpecialty("");
                setBachelorOpen(true);
              }}
              onFocus={() => setBachelorOpen(true)}
              placeholder={bachelorMapPlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="off"
            />
            {bachelorOpen && bachelorFiltered.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
                {bachelorFiltered.slice(0, 50).map((b) => (
                  <li key={b.name}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedBachelor(b.name);
                        setSelectedProgram("");
                        setSelectedSpecialty("");
                        setBachelorOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary-light hover:text-primary-dark transition-colors"
                    >
                      {b.name}
                    </button>
                  </li>
                ))}
                {bachelorFiltered.length > 50 && (
                  <li className="px-3 py-2 text-xs text-muted bg-gray-50 border-t border-border">
                    +{bachelorFiltered.length - 50} nəticə — axtarışı dəqiqləşdirin
                  </li>
                )}
              </ul>
            )}
          </div>
          {bachelorPrograms && (
            <div className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="font-medium">{bachelorPrograms.length}</span> magistr proqramına müraciət edə bilərsiniz
              (Proqram №: {bachelorPrograms.map((p) => p.num).join(", ")})
            </div>
          )}
        </div>
      ) : null}

      {/* Proqram N X selector (magistr) */}
      {programGroups?.length ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">{programGroupsLabel}</label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Bütün proqramlar</option>
            {programGroups.map((p) => (
              <option key={p.number} value={p.number}>
                Proqram №{p.number} — {p.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Specialty selector (yalnız magistr üçün) */}
      {showSpecialtySelector && allSpecialties.length > 0 ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">{specialtySelectorLabel}</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{specialtySelectorAllLabel} ({allSpecialties.length})</option>
            {allSpecialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Multi-select filters: cities, universities/colleges, specialties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <MultiChipPicker
          id="city-options"
          label={lang === "en" ? "Cities" : lang === "ru" ? "Города" : "Şəhərlər"}
          placeholder={lang === "en" ? "Select city..." : lang === "ru" ? "Выберите город..." : "Şəhər seçin..."}
          options={allCities}
          selected={selectedCities}
          onChange={setSelectedCities}
          clearLabel={lang === "en" ? "Clear all" : lang === "ru" ? "Очистить" : "Hamısını sil"}
        />
        <MultiChipPicker
          id="uni-options"
          label={lang === "en" ? "Universities / Colleges" : lang === "ru" ? "Университеты / Колледжи" : "Universitet / Kollec"}
          placeholder={lang === "en" ? "Select institution..." : lang === "ru" ? "Выберите учреждение..." : "Müəssisə seçin..."}
          options={allUniversities}
          selected={selectedUnis}
          onChange={setSelectedUnis}
          clearLabel={lang === "en" ? "Clear all" : lang === "ru" ? "Очистить" : "Hamısını sil"}
        />
        <MultiChipPicker
          id="spec-multi-options"
          label={lang === "en" ? "Specialties" : lang === "ru" ? "Специальности" : "İxtisaslar"}
          placeholder={lang === "en" ? "Select specialty..." : lang === "ru" ? "Выберите специальность..." : "İxtisas seçin..."}
          options={allSpecialties}
          selected={selectedSpecs}
          onChange={setSelectedSpecs}
          clearLabel={lang === "en" ? "Clear all" : lang === "ru" ? "Очистить" : "Hamısını sil"}
        />
      </div>

      {/* Free-text search across specialty + university */}
      <div className="mb-3">
        <label className="block text-xs text-muted mb-1">{pt.searchSpecialty}</label>
        <input
          type="text"
          value={specSearch}
          onChange={(e) => setSpecSearch(e.target.value)}
          placeholder={pt.searchSpecialty}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Maliyyələşmə filtri */}
      <div className="mb-6">
        <label className="block text-xs text-muted mb-1">Maliyyələşmə növü</label>
        <div className="inline-flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFundingFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              fundingFilter === "all" ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Hamısı
          </button>
          <button
            type="button"
            onClick={() => setFundingFilter("paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              fundingFilter === "paid" ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Yalnız ödənişli
          </button>
          <button
            type="button"
            onClick={() => setFundingFilter("state")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              fundingFilter === "state" ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Yalnız dövlət sifarişli
          </button>
        </div>
      </div>

      {/* Results */}
      {results ? (
        results.items.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{results.guaranteed}</p>
                <p className="text-[11px] text-green-600">{pt.guaranteedCount}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{results.borderline}</p>
                <p className="text-[11px] text-amber-600">{pt.borderlineCount}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{results.notEnough}</p>
                <p className="text-[11px] text-red-600">şans 0-a yaxın</p>
              </div>
              <div className="bg-gray-50 border border-border rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{results.items.length}</p>
                <p className="text-[11px] text-muted">{pt.totalFound}</p>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-muted">
                    <th className="px-4 py-3 font-medium">{pt.specialty}</th>
                    {fundingFilter !== "state" && (
                      <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Ödənişli keçid balı</th>
                    )}
                    {fundingFilter !== "paid" && (
                      <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Dövlət sifarişli keçid balı</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleItems.map((item, i) => (
                    <tr
                      key={`${item.university}-${item.specialty}-${i}`}
                      className={
                        item.status === "guaranteed"
                          ? "bg-green-50/50"
                          : item.status === "borderline"
                          ? "bg-amber-50/50"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 text-foreground">
                        <div className="text-[11px] text-muted leading-tight mb-0.5">
                          {item.code && <span className="tabular-nums">{item.code} · </span>}
                          {item.university}
                        </div>
                        <div className="font-medium leading-snug">
                          {item.specialty}
                          {item.stream === "Ə" && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 align-middle">Əyani</span>
                          )}
                          {item.stream === "Q" && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 align-middle">Qiyabi</span>
                          )}
                          <PlanBadges seats={item.seats} language={item.language} />
                        </div>
                        {item.aptitude != null && (
                          <div className="mt-1 flex items-start gap-1 text-[11px] font-normal text-amber-700 leading-snug">
                            <span aria-hidden>⚠️</span>
                            <span>
                              Qabiliyyət imtahanı tələb edir. Min bal: <strong>{item.aptitude}</strong>
                              {item.aptitudeState != null && item.aptitudeState !== item.aptitude && (
                                <> (d.s.: <strong>{item.aptitudeState}</strong>)</>
                              )}
                            </span>
                          </div>
                        )}
                      </td>
                      {fundingFilter !== "state" && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {item.score != null ? (
                            <>
                              <div className="font-medium tabular-nums">{item.score}</div>
                              {score.trim() && item.paidDiff !== null && item.paidStatus !== null && (
                                <div
                                  className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    item.paidStatus === "guaranteed"
                                      ? "bg-green-100 text-green-700"
                                      : item.paidStatus === "borderline"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  <span>{item.paidDiff >= 0 ? "+" : ""}{item.paidDiff.toFixed(1)}</span>
                                  <span className="opacity-80">• {item.paidChance}%</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                      )}
                      {fundingFilter !== "paid" && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {item.stateScore != null ? (
                            <>
                              <div className="font-medium tabular-nums">{item.stateScore}</div>
                              {score.trim() && item.stateDiff !== null && item.stateStatus !== null && (
                                <div
                                  className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    item.stateStatus === "guaranteed"
                                      ? "bg-green-100 text-green-700"
                                      : item.stateStatus === "borderline"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  <span>{item.stateDiff >= 0 ? "+" : ""}{item.stateDiff.toFixed(1)}</span>
                                  <span className="opacity-80">• {item.stateChance}%</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
              {visibleItems.map((item, i) => (
                <div
                  key={`${item.university}-${item.specialty}-${i}`}
                  className={`rounded-xl border p-3 ${
                    item.status === "guaranteed"
                      ? "bg-green-50 border-green-200"
                      : item.status === "borderline"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="text-[11px] text-muted leading-tight mb-1">
                    {item.code && <span className="tabular-nums">{item.code} · </span>}
                    {item.university}
                  </div>
                  <div className="font-medium text-foreground text-sm leading-snug mb-2">
                    {item.specialty}
                    {item.stream === "Ə" && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 align-middle">Əyani</span>
                    )}
                    {item.stream === "Q" && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 align-middle">Qiyabi</span>
                    )}
                    <PlanBadges seats={item.seats} language={item.language} />
                  </div>
                  {item.aptitude != null && (
                    <div className="mb-2 flex items-start gap-1 text-[11px] text-amber-700 leading-snug">
                      <span aria-hidden>⚠️</span>
                      <span>
                        Qabiliyyət imtahanı tələb edir. Min bal: <strong>{item.aptitude}</strong>
                        {item.aptitudeState != null && item.aptitudeState !== item.aptitude && (
                          <> (d.s.: <strong>{item.aptitudeState}</strong>)</>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {fundingFilter !== "state" && (
                      <div className="bg-white/60 rounded-lg p-2">
                        <div className="text-[10px] text-muted mb-0.5">Ödənişli</div>
                        {item.score != null ? (
                          <>
                            <div className="text-sm font-bold tabular-nums">{item.score}</div>
                            {score.trim() && item.paidDiff !== null && item.paidStatus !== null && (
                              <div
                                className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.paidStatus === "guaranteed"
                                    ? "bg-green-100 text-green-700"
                                    : item.paidStatus === "borderline"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {item.paidDiff >= 0 ? "+" : ""}{item.paidDiff.toFixed(1)} • {item.paidChance}%
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-muted">—</div>
                        )}
                      </div>
                    )}
                    {fundingFilter !== "paid" && (
                      <div className="bg-white/60 rounded-lg p-2">
                        <div className="text-[10px] text-muted mb-0.5">Dövlət sifarişli</div>
                        {item.stateScore != null ? (
                          <>
                            <div className="text-sm font-bold tabular-nums">{item.stateScore}</div>
                            {score.trim() && item.stateDiff !== null && item.stateStatus !== null && (
                              <div
                                className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.stateStatus === "guaranteed"
                                    ? "bg-green-100 text-green-700"
                                    : item.stateStatus === "borderline"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {item.stateDiff >= 0 ? "+" : ""}{item.stateDiff.toFixed(1)} • {item.stateChance}%
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-muted">—</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {results.items.length > 30 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-sm text-primary font-medium py-2 hover:underline"
              >
                {showAll ? pt.showLess : `${pt.showAll} (${results.items.length})`}
              </button>
            )}

            {pt.source ? (
              <div className="bg-gray-50 border border-border rounded-xl p-4 text-center">
                <p className="text-xs text-muted">{pt.source}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            <span className="text-4xl block mb-3">🔍</span>
            <p>{pt.noResults}</p>
          </div>
        )
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🎯</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
