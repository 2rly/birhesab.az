"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";
import { adlar } from "@/data/adlar";
import type { Gender, Origin, NameEntry } from "@/data/adlar";

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

const pageTranslations: Record<Lang, {
  title: string;
  description: string;
  breadcrumbCategory: string;
  breadcrumbLabel: string;
  formulaTitle: string;
  formulaContent: string;
  searchPlaceholder: string;
  filterGender: string;
  filterOrigin: string;
  all: string;
  male: string;
  female: string;
  unisex: string;
  meaning: string;
  origin: string;
  gender: string;
  totalNames: string;
  noResults: string;
  emptyState: string;
  popularNames: string;
  nameNotFound: string;
  nameNotFoundDesc: string;
}> = {
  az: {
    title: "Adın mənası",
    description: "Adınızın mənasını, mənşəyini və tarixini öyrənin — Azərbaycanda istifadə olunan kişi və qadın adları lüğəti.",
    breadcrumbCategory: "Gündəlik",
    breadcrumbLabel: "Adın mənası",
    formulaTitle: "Adlar haqqında",
    formulaContent: `Bu lüğətdə Azərbaycanda işlədilən məşhur kişi və qadın adlarının mənası, mənşəyi və tarixi məlumatı var.

Adların əksəriyyəti aşağıdakı dillərdən gəlir:
• Ərəb dili — dini və klassik adlar (Məhəmməd, Əli, Fatma)
• Fars dili — klassik və poetik adlar (Lalə, Şirin, Pərvanə)
• Türk dilləri — milli adlar (Aslan, Aynur, Tural)
• Yəhudi dili — peyğəmbər adları (İbrahim, Yusif)
• Yunan/Latın — qədim adlar (İskəndər, Roza)

Mənbə: Azərbaycan dili lüğəti, ad lüğətləri, etimoloji araşdırmalar.

Qeyd: bəzi adların mənası tam dəqiq olmaya bilər — eyni ad fərqli mənbələrdə fərqli izahlanır. Əgər adınız siyahıda yoxdursa və ya mənası dəqiq deyilsə, bizimlə əlaqə saxlayın.`,
    searchPlaceholder: "Adınızı yazın... (məs: Aysel, Murad, Leyla)",
    filterGender: "Cinsi",
    filterOrigin: "Mənşəyi",
    all: "Hamısı",
    male: "Kişi",
    female: "Qadın",
    unisex: "Uniseks",
    meaning: "Mənası",
    origin: "Mənşəyi",
    gender: "Cinsi",
    totalNames: "ad",
    noResults: "Bu ad lüğətdə tapılmadı.",
    emptyState: "Adınızı yazın və ya filtrlərdən istifadə edin.",
    popularNames: "Məşhur adlar",
    nameNotFound: "Bu ad lüğətdə yoxdur",
    nameNotFoundDesc: "Lüğətimiz inkişaf etməkdədir. Sizə daha doğru məlumat verməyə çalışırıq.",
  },
  en: {
    title: "Name Meaning",
    description: "Find the meaning, origin and history of your name — dictionary of male and female names used in Azerbaijan.",
    breadcrumbCategory: "Daily",
    breadcrumbLabel: "Name Meaning",
    formulaTitle: "About names",
    formulaContent: `This dictionary contains popular male and female names used in Azerbaijan with their meanings, origins and historical context.

Most names come from the following languages:
• Arabic — religious and classical names (Muhammad, Ali, Fatima)
• Persian — classical and poetic names (Lale, Shirin, Pervane)
• Turkic — national names (Aslan, Aynur, Tural)
• Hebrew — prophet names (Ibrahim, Yusif)
• Greek/Latin — ancient names (Iskender, Roza)

Sources: Azerbaijani language dictionary, name dictionaries, etymological research.

Note: some name meanings may not be fully accurate — different sources may interpret the same name differently.`,
    searchPlaceholder: "Type your name... (e.g. Aysel, Murad, Leyla)",
    filterGender: "Gender",
    filterOrigin: "Origin",
    all: "All",
    male: "Male",
    female: "Female",
    unisex: "Unisex",
    meaning: "Meaning",
    origin: "Origin",
    gender: "Gender",
    totalNames: "names",
    noResults: "This name was not found in the dictionary.",
    emptyState: "Type your name or use the filters.",
    popularNames: "Popular names",
    nameNotFound: "This name is not in the dictionary",
    nameNotFoundDesc: "Our dictionary is growing. We strive to provide accurate information.",
  },
  ru: {
    title: "Значение имени",
    description: "Узнайте значение, происхождение и историю вашего имени — словарь мужских и женских имён, используемых в Азербайджане.",
    breadcrumbCategory: "Ежедневно",
    breadcrumbLabel: "Значение имени",
    formulaTitle: "Об именах",
    formulaContent: `В этом словаре собраны популярные мужские и женские имена, используемые в Азербайджане, с их значением, происхождением и исторической справкой.

Большинство имён приходят из следующих языков:
• Арабский — религиозные и классические имена (Мухаммед, Али, Фатима)
• Персидский — классические и поэтические имена (Лале, Ширин, Пярване)
• Тюркские — национальные имена (Аслан, Айнур, Турал)
• Еврейский — имена пророков (Ибрагим, Юсиф)
• Греческий/латинский — древние имена (Искендер, Роза)

Источники: словарь азербайджанского языка, словари имён, этимологические исследования.

Примечание: значение некоторых имён может быть не точным — разные источники могут интерпретировать одно и то же имя по-разному.`,
    searchPlaceholder: "Введите ваше имя... (напр. Айсель, Мурад, Лейла)",
    filterGender: "Пол",
    filterOrigin: "Происхождение",
    all: "Все",
    male: "Мужское",
    female: "Женское",
    unisex: "Унисекс",
    meaning: "Значение",
    origin: "Происхождение",
    gender: "Пол",
    totalNames: "имён",
    noResults: "Это имя не найдено в словаре.",
    emptyState: "Введите ваше имя или используйте фильтры.",
    popularNames: "Популярные имена",
    nameNotFound: "Это имя отсутствует в словаре",
    nameNotFoundDesc: "Наш словарь развивается. Мы стремимся предоставить точную информацию.",
  },
};

const genderEmoji: Record<Gender, string> = {
  "kişi": "👨",
  "qadın": "👩",
  "uniseks": "🧑",
};

const genderColor: Record<Gender, string> = {
  "kişi": "bg-blue-50 text-blue-700 border-blue-200",
  "qadın": "bg-pink-50 text-pink-700 border-pink-200",
  "uniseks": "bg-purple-50 text-purple-700 border-purple-200",
};

const originColor: Record<string, string> = {
  "ərəb": "bg-amber-50 text-amber-700 border-amber-200",
  "fars": "bg-rose-50 text-rose-700 border-rose-200",
  "türk": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "yəhudi": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "yunan": "bg-sky-50 text-sky-700 border-sky-200",
  "latın": "bg-violet-50 text-violet-700 border-violet-200",
};

function originBadge(origin: Origin | string): string {
  return originColor[origin] ?? "bg-gray-50 text-gray-700 border-gray-200";
}

function NameCard({ entry, pt }: { entry: NameEntry; pt: (typeof pageTranslations)["az"] }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{entry.name}</h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${genderColor[entry.gender]}`}>
              <span>{genderEmoji[entry.gender]}</span>
              <span>
                {entry.gender === "kişi" ? pt.male : entry.gender === "qadın" ? pt.female : pt.unisex}
              </span>
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${originBadge(entry.origin)}`}>
              {entry.origin}
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        <span className="font-semibold text-muted">{pt.meaning}: </span>
        {entry.meaning}
      </p>
      {entry.note && (
        <p className="mt-2 text-xs text-muted italic">{entry.note}</p>
      )}
    </div>
  );
}

export default function AdMenasiPage() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"" | Gender>("");
  const [originFilter, setOriginFilter] = useState<"" | Origin>("");

  const allOrigins: Origin[] = useMemo(() => {
    return Array.from(new Set(adlar.map((a) => a.origin))).sort();
  }, []);

  const filtered = useMemo(() => {
    let result = adlar;
    if (genderFilter) result = result.filter((a) => a.gender === genderFilter);
    if (originFilter) result = result.filter((a) => a.origin === originFilter);
    if (search.trim()) {
      const q = normalizeText(search.trim());
      result = result.filter((a) => normalizeText(a.name).includes(q));
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, "az"));
  }, [search, genderFilter, originFilter]);

  // Tam uyğunluq — istifadəçi adı dəqiq yazıbsa onu öndə göstər
  const exactMatch = useMemo(() => {
    if (!search.trim()) return null;
    const q = normalizeText(search.trim());
    return adlar.find((a) => normalizeText(a.name) === q) ?? null;
  }, [search]);

  const hasSearched = search.trim().length > 0;
  const showNotFound = hasSearched && !exactMatch && filtered.length === 0;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=daily" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["bmi", "yas", "hamilelik"]}
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-800">{adlar.filter((a) => a.gender === "kişi").length}</p>
          <p className="text-[11px] text-blue-700">👨 {pt.male}</p>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-pink-800">{adlar.filter((a) => a.gender === "qadın").length}</p>
          <p className="text-[11px] text-pink-700">👩 {pt.female}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-800">{adlar.length}</p>
          <p className="text-[11px] text-emerald-700">📚 {pt.totalNames}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={pt.searchPlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
          autoFocus
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs text-muted mb-1">{pt.filterGender}</label>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as Gender | "")}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{pt.all}</option>
            <option value="kişi">👨 {pt.male}</option>
            <option value="qadın">👩 {pt.female}</option>
            <option value="uniseks">🧑 {pt.unisex}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">{pt.filterOrigin}</label>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value as Origin | "")}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{pt.all}</option>
            {allOrigins.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exact match (highlight) */}
      {exactMatch && (
        <div className="mb-5 ring-2 ring-primary rounded-2xl">
          <NameCard entry={exactMatch} pt={pt} />
        </div>
      )}

      {/* Not found message */}
      {showNotFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-5">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-amber-900 font-semibold mb-1">{pt.nameNotFound}</p>
          <p className="text-sm text-amber-800">{pt.nameNotFoundDesc}</p>
        </div>
      )}

      {/* Results list */}
      {filtered.length > 0 && !exactMatch && (
        <p className="text-sm text-muted mb-3">
          <span className="font-semibold text-foreground">{filtered.length}</span> {pt.totalNames}
        </p>
      )}

      <div className="space-y-3">
        {filtered
          .filter((e) => !exactMatch || e.name !== exactMatch.name)
          .slice(0, hasSearched ? 30 : 50)
          .map((entry) => (
            <NameCard key={entry.name} entry={entry} pt={pt} />
          ))}
      </div>

      {!hasSearched && filtered.length > 50 && (
        <p className="text-center text-sm text-muted mt-4">
          ↑ Yuxarıdakı axtarış xanasından adı yazın
        </p>
      )}
    </CalculatorLayout>
  );
}
