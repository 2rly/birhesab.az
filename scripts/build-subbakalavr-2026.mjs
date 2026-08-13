// subbak.json → src/data/subbakalavr-uygunluq-2026.ts
//
// İstifadə: node scripts/build-subbakalavr-2026.mjs <subbak.json>

import fs from "node:fs";

const SRC = process.argv[2];
const OUT = "src/data/subbakalavr-uygunluq-2026.ts";

const rows = JSON.parse(fs.readFileSync(SRC, "utf8"));

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

export const subbakalavrMatches: SubbakalavrMatch[] = [
${serialized}
];
`;

fs.writeFileSync(OUT, out, "utf8");
const sources = rows.reduce((n, r) => n + r.sources.length, 0);
const targets = rows.reduce((n, r) => n + r.targets.length, 0);
console.log(`${OUT} yazıldı`);
console.log(`  uyğunluq bəndi        : ${rows.length}`);
console.log(`  bakalavriat ixtisası  : ${targets}`);
console.log(`  subbakalavr ixtisası  : ${sources}`);
