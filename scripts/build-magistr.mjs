// Parse magistr-raw.txt (PDF-extracted format) → admissions-magistr-2026.ts
// Line formats:
//   @@UNI:University Name
//   ▶ Specialty Name Ə SCORE(STATE)
//   ▶ Specialty Name Ə SCORE(-)
//   ▶ Specialty Name Ə SCORE
//   ▶ Specialty Name Ə -(STATE)   (no main, only state)
//   Stream may be Q instead of Ə.

import fs from "node:fs";

const SRC = "C:/tmp/birhesab-data/magistr-raw.txt";
const OUT = "src/data/admissions-magistr-2026.ts";
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const ENTRY_RE = /^▶\s+(.+?)\s+([ƏQ])\s+(-|\d+(?:\.\d+)?)\s*(?:\((-|\d+(?:\.\d+)?)\))?\s*$/;

const groups = new Map();
let currentUni = null;

for (const raw of fs.readFileSync(SRC, "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  if (!line) continue;
  if (line.startsWith("@@UNI:")) {
    currentUni = line.slice(6).trim();
    if (!groups.has(currentUni)) groups.set(currentUni, []);
    continue;
  }
  if (!currentUni) continue;
  const m = line.match(ENTRY_RE);
  if (!m) continue;
  const [, specialty, stream, s1, s2] = m;
  const score = s1 === "-" ? null : parseFloat(s1);
  const stateScore = s2 != null && s2 !== "-" ? parseFloat(s2) : null;
  // if no main score but state exists, use state as score
  const finalScore = score ?? stateScore;
  if (finalScore == null) continue;
  const entry = { specialty: specialty.trim(), stream, score: finalScore };
  if (stateScore != null && score != null && stateScore !== score) entry.stateScore = stateScore;
  groups.get(currentUni).push(entry);
}

let total = 0;
let out = "// Magistr keçid balları 2026\n// Mənbə: qebul bukleti 2026 (PDF extracted)\n\n";
out += "export interface AdmissionEntry {\n  university: string;\n  specialty: string;\n  stream?: string;\n  score: number;\n  /** Dövlət sifarişli (state-funded) — mötərizə içindəki bal */\n  stateScore?: number;\n}\n\n";
out += "export const admissionsMagistr: AdmissionEntry[] = [\n";
for (const [uni, list] of groups) {
  out += `  // ═══ ${uni} ═══\n`;
  for (const e of list) {
    const ss = e.stateScore != null ? `, stateScore: ${e.stateScore}` : "";
    out += `  { university: "${esc(uni)}", specialty: "${esc(e.specialty)}", stream: "${e.stream}", score: ${e.score}${ss} },\n`;
    total++;
  }
}
out += "];\n";

fs.writeFileSync(OUT, out);
console.log(`Wrote ${OUT} (${total} entries, ${groups.size} universities)`);
