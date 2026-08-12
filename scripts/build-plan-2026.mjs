// abit4.json (Abituriyent 4 bukletindən çıxarılmış plan) → src/data/admissions-plan-2026*.ts
//
// Hər qrup ayrıca fayla yazılır ki, qrup səhifəsi yalnız öz datasını yükləsin.
//
// İstifadə: node scripts/build-plan-2026.mjs <abit4.json>

import fs from "node:fs";

const SRC = process.argv[2];
const OUT_BASE = "src/data/admissions-plan-2026";

const rows = JSON.parse(fs.readFileSync(SRC, "utf8"));

/** Tədris dili: əvvəlcə ixtisas adındakı açıq göstərici, sonra bölmə başlığı. */
function language(row) {
  const s = row.specialty.toLocaleLowerCase("az");
  if (s.includes("tədris ingilis dilində")) return "EN";
  if (s.includes("tədris türk dilində")) return "TR";
  if (s.includes("tədris alman dilində")) return "DE";
  if (s.includes("tədris rus dilində")) return "RU";
  if (s.includes("tədris azərbaycan dilində")) return "AZ";
  switch (row.section) {
    case "Rus bölməsi":
      return "RU";
    case "Azərbaycan və rus bölmələri birgə":
      return "AZ/RU";
    default:
      return "AZ";
  }
}

const GROUP_KEYS = { I: "planGroup1", II: "planGroup2", III: "planGroup3", IV: "planGroup4" };

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function serialize(row) {
  const parts = [
    `code: "${row.code}"`,
    `university: "${esc(row.university)}"`,
    `specialty: "${esc(row.specialty)}"`,
    `language: "${language(row)}"`,
    `seats: ${row.seats}`,
  ];
  if (row.subgroup) parts.push(`subgroup: "${row.subgroup}"`);
  if (row.fee) parts.push(`fee: "${esc(String(row.fee))}"`);
  if (row.special) parts.push("aptitudeRequired: true");
  return `  { ${parts.join(", ")} },`;
}

const SHARED = `// 2026/2027 tədris ili üçün qəbul planı — tip və birləşdirmə köməkçisi.
// Mənbə: DİM "Abituriyent 4" (2026) bukleti, I-IV ixtisas qrupları.
// Bu fayl scripts/build-plan-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.

export interface PlanEntry {
  /** DİM ixtisas kodu (6 rəqəm) */
  code: string;
  university: string;
  specialty: string;
  /** Tədris dili: AZ · RU · AZ/RU · EN · TR · DE */
  language: string;
  /** Bu il ayrılmış plan yerlərinin sayı */
  seats: number;
  /** I qrup üçün RK/Rİ, III qrup üçün DT/TC */
  subgroup?: string;
  /** İllik təhsil haqqı (manat). "YDS" — yalnız dövlət sifarişi, "DH" — dövlət hesabına. */
  fee?: string;
  /** Xüsusi qabiliyyət imtahanı tələb edir (buklet-də ** ilə işarələnib) */
  aptitudeRequired?: boolean;
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("az")
    .replace(/tədris\\s+/g, "")
    .replace(/[""''\`]/g, "")
    .replace(/[.,]/g, "")
    .replace(/\\s*-\\s*/g, "-")
    .replace(/\\s+/g, " ")
    .trim();
}

function universityKey(value: string): string {
  return normalize(value)
    .replace(/\\s*\\((gəncə|bakı)[^)]*\\)/g, "")
    .replace(/"/g, "")
    .trim();
}

/**
 * DİM bəzi ixtisasların adını 2026-da dəyişib, bal siyahısı isə köhnə adı saxlayır.
 * Dəqiq uyğunluq tapılmayanda bu "yumşaq" açar işə düşür.
 */
function looseSpecialty(value: string): string {
  return normalize(value)
    .replace(/\\(rəqəmsal bacarıqlar\\)\\s*/g, "") // İnformatika (rəqəmsal bacarıqlar) müəllimliyi
    .replace(/\\s*\\(azərbaycan dilində\\)/g, "") // planda var, bal siyahısında yox
    .replace(/əmlak kadastrı/g, "əmlakın kadastrı")
    .replace(/ədəbiyyat(?= |$)/g, "ədəbiyyatı üzrə")
    .replace(/\\s+/g, " ")
    .trim();
}

function planKey(university: string, specialty: string): string {
  return universityKey(university) + "||" + normalize(specialty);
}

function loosePlanKey(university: string, specialty: string): string {
  return universityKey(university) + "||" + looseSpecialty(specialty);
}

/**
 * Bal siyahısındakı hər yazıya plan məlumatını (kod, yer sayı, tədris dili) qoşur.
 * Planda tapılmayan ixtisas — bu il yer ayrılmayan ixtisasdır — olduğu kimi qalır.
 */
export function attachPlan<T extends { university: string; specialty: string }>(
  entries: T[],
  plan: PlanEntry[],
): (T & { code?: string; seats?: number; language?: string })[] {
  const index = new Map<string, PlanEntry>();
  const loose = new Map<string, PlanEntry>();
  for (const item of plan) {
    const key = planKey(item.university, item.specialty);
    if (!index.has(key)) index.set(key, item);
    const alt = loosePlanKey(item.university, item.specialty);
    if (!loose.has(alt)) loose.set(alt, item);
  }
  return entries.map((entry) => {
    const match =
      index.get(planKey(entry.university, entry.specialty)) ??
      loose.get(loosePlanKey(entry.university, entry.specialty));
    if (!match) return entry;
    return { ...entry, code: match.code, seats: match.seats, language: match.language };
  });
}
`;

fs.writeFileSync(`${OUT_BASE}.ts`, SHARED, "utf8");

const counts = {};
for (const [group, key] of Object.entries(GROUP_KEYS)) {
  const list = rows.filter((r) => r.group === group);
  counts[group] = list.length;
  const lines = [
    `// ${group} ixtisas qrupu üzrə 2026/2027 qəbul planı (DİM "Abituriyent 4").`,
    "// Bu fayl scripts/build-plan-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.",
    "",
    'import type { PlanEntry } from "./admissions-plan-2026";',
    "",
    `export const ${key}: PlanEntry[] = [`,
    ...list.map(serialize),
    "];",
    "",
  ];
  fs.writeFileSync(`${OUT_BASE}-group${key.slice(-1)}.ts`, lines.join("\n"), "utf8");
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`${OUT_BASE}.ts (tip + attachPlan) və 4 qrup faylı yazıldı — ${total} sətir`);
for (const [g, n] of Object.entries(counts)) console.log(`  ${g} qrup: ${n}`);
