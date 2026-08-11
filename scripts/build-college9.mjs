// Parse 9-illik university data. Format per line: COLLEGE | SPECIALTY | SCORE
// When the same (university, specialty) appears >1 times:
//   - HIGHER score → stateScore (dövlət sifarişli)
//   - LOWER score → score (ödənişli)

import fs from "node:fs";

const SRC = "C:/tmp/birhesab-data/college9.txt";
const OUT = "src/data/admissions-college-9-2026.ts";

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const rows = [];
for (const raw of fs.readFileSync(SRC, "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#") || line.startsWith("...")) continue;
  const parts = line.split("|").map((p) => p.trim());
  if (parts.length < 3) continue;
  const [col, spec, scoreRaw] = parts;
  const score = parseFloat(scoreRaw);
  if (isNaN(score)) continue;
  rows.push({ university: col, specialty: spec, score });
}

// Group by (university, specialty); collapse duplicates into {score, stateScore}
const map = new Map();
for (const r of rows) {
  const key = `${r.university}|${r.specialty}`;
  if (!map.has(key)) map.set(key, { university: r.university, specialty: r.specialty, scores: [] });
  map.get(key).scores.push(r.score);
}

const entries = [];
for (const { university, specialty, scores } of map.values()) {
  if (scores.length === 1) {
    entries.push({ university, specialty, score: scores[0] });
  } else {
    const sorted = [...scores].sort((a, b) => a - b); // ascending
    entries.push({ university, specialty, score: sorted[0], stateScore: sorted[sorted.length - 1] });
  }
}

// Group by university (preserve first-seen order)
const groups = new Map();
for (const e of entries) {
  if (!groups.has(e.university)) groups.set(e.university, []);
  groups.get(e.university).push(e);
}

let out = "// 9-illik kolleclərə keçid balları 2025-2026\n";
out += "// Mənbə: kurslar.az/melumat/9-illik-kolleclere-kecid-ballari-2025-2026-193\n";
out += "// Qeyd: eyni ixtisasdan iki dəfə görünəndə yüksək bal dövlət sifarişli (stateScore), aşağı bal ödənişli (score).\n\n";
out += "export interface CollegeAdmissionEntry {\n  university: string;\n  specialty: string;\n  score: number;\n  /** Dövlət sifarişli (state-funded) — yüksək eşik */\n  stateScore?: number;\n}\n\n";
out += "export const admissionsCollege9: CollegeAdmissionEntry[] = [\n";
for (const [col, list] of groups) {
  out += `  // ═══ ${col} ═══\n`;
  for (const e of list) {
    const ss = e.stateScore != null ? `, stateScore: ${e.stateScore}` : "";
    out += `  { university: "${esc(e.university)}", specialty: "${esc(e.specialty)}", score: ${e.score}${ss} },\n`;
  }
}
out += "];\n";

fs.writeFileSync(OUT, out);
console.log(`Wrote ${OUT} (${entries.length} unique entries from ${rows.length} rows, ${groups.size} universitys)`);
