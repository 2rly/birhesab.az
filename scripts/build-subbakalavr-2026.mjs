// subbak.json → src/data/subbakalavr-uygunluq-2026.ts
//
// İstifadə: node scripts/build-subbakalavr-2026.mjs <subbak.json>

import fs from "node:fs";

const SRC = process.argv[2];
const OUT = "src/data/subbakalavr-uygunluq-2026.ts";

const parsed = JSON.parse(fs.readFileSync(SRC, "utf8"));
const rows = parsed.matches;
const clauses = parsed.clauses ?? [];
const aptitude = parsed.aptitude ?? [];

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const serialized = rows
  .map((row) => {
    const targets = row.targets
      .map((t) => `{ code: "${t.code}", name: "${esc(t.name)}" }`)
      .join(", ");
    const sources = row.sources
      .map((s) => `      { code: "${s.code}", name: "${esc(s.name)}", level: "${s.level}" },`)
      .join("\n");
    const group = row.group
      ? `{ code: "${row.group.code}", name: "${esc(row.group.name)}" }`
      : "undefined";
    return `  {
    group: ${group},
    targets: [${targets}],
    sources: [
${sources}
    ],
  },`;
  })
  .join("\n");

const out = `// Subbakalavrların ixtisas uyğunluğu cədvəli — 2026/2027 tədris ili.
// Mənbə: DİM "Subbakalavrların ixtisas seçimi elanı" (2026) buraxılışı,
// "İXTİSAS UYĞUNLUĞU CƏDVƏLİ" bölməsi.
// Bu fayl scripts/build-subbakalavr-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.

/** Subbakalavrın bitirdiyi ixtisas (mənbə). */
export interface SubbakalavrSource {
  /** Şifr — orta ixtisas təhsilində hərf prefiksli (məs. "HS 140102"), peşə təhsilində rəqəm. */
  code: string;
  name: string;
  /** orta-ixtisas — orta ixtisas təhsili pilləsi; pese-tehsili — yüksək peşə təhsili səviyyəsi */
  level: "orta-ixtisas" | "pese-tehsili";
}

/** Seçilə bilən bakalavriat ixtisası (hədəf). */
export interface SubbakalavrTarget {
  /** 7 rəqəmli bakalavriat şifri */
  code: string;
  name: string;
}

export interface SubbakalavrMatch {
  /** Bakalavriat ixtisas qrupu (məs. "6006 Texniki və texnoloji ixtisaslar qrupu") */
  group?: { code: string; name: string };
  /** Bu bənddə seçilə bilən bakalavriat ixtisasları */
  targets: SubbakalavrTarget[];
  /** Həmin ixtisası seçmək hüququ verən subbakalavr ixtisasları */
  sources: SubbakalavrSource[];
}

/** Qabiliyyət imtahanı tələb edən ixtisaslar üzrə müsabiqə şərti. */
export interface SubbakalavrAptitude {
  /** İxtisas qrupu, məs. "V ixtisas qrupu" */
  group: string;
  specialty: string;
  /** Qabiliyyət imtahanı üzrə minimal bal */
  minScore: string;
  /** II mərhələ üzrə minimal bal ("-" — tələb olunmur) */
  stage2: string;
  /** Qabiliyyət imtahanının yekun nəticəsi üzrə tələb */
  result: string;
}

export const subbakalavrMatches: SubbakalavrMatch[] = [
${serialized}
];

/** Elandakı əsas şərtlər (DİM buraxılışının 1-ci səhifəsi). */
export const subbakalavrRules: string[] = [
${clauses.map((c) => `  "${esc(c)}",`).join("\n")}
];

export const subbakalavrAptitude: SubbakalavrAptitude[] = [
${aptitude
  .map(
    (a) =>
      `  { group: "${esc(a.group ?? "")}", specialty: "${esc(a.specialty)}", minScore: "${esc(a.minScore)}", stage2: "${esc(a.stage2)}", result: "${esc(a.result)}" },`,
  )
  .join("\n")}
];
`;

fs.writeFileSync(OUT, out, "utf8");
const sources = rows.reduce((n, r) => n + r.sources.length, 0);
const targets = rows.reduce((n, r) => n + r.targets.length, 0);
console.log(`${OUT} yazıldı`);
console.log(`  uyğunluq bəndi        : ${rows.length}`);
console.log(`  bakalavriat ixtisası  : ${targets}`);
console.log(`  subbakalavr ixtisası  : ${sources}`);
console.log(`  elan bendi            : ${clauses.length}`);
console.log(`  qabiliyyet serti      : ${aptitude.length}`);
