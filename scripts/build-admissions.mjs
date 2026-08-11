// Parse /tmp/birhesab-data/*.txt (piped format) and generate TS data files.
// Format per line: UNIVERSITY | SPECIALTY | SCORE | PAID_SCORE
// (PAID_SCORE optional; an empty/missing score field is OK)

import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2]; // source txt
const OUT = process.argv[3]; // target ts
const CONST_NAME = process.argv[4]; // e.g. admissionsGroup2
const HEADER_COMMENT = process.argv[5] || "";

function escapeString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const lines = fs.readFileSync(SRC, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const entries = [];
for (const line of lines) {
  const parts = line.split("|").map((p) => p.trim());
  if (parts.length < 3) continue;
  const [uni, spec, s1Raw, s2Raw = ""] = parts;
  // Handle group 5 "N/SCORE" format where N is aptitude min — take SCORE only
  const stripApt = (r) => r.includes("/") ? r.split("/").slice(-1)[0] : r;
  const s1 = s1Raw ? parseFloat(stripApt(s1Raw)) : NaN;
  const s2 = s2Raw ? parseFloat(stripApt(s2Raw)) : NaN;
  if (!spec || spec.toLowerCase().includes("subbakalavr")) continue;
  let score, stateScore;
  if (!isNaN(s1) && !isNaN(s2)) { score = s1; stateScore = s2 !== s1 ? s2 : undefined; }
  else if (!isNaN(s1)) { score = s1; }
  else if (!isNaN(s2)) { score = s2; }
  else continue;
  entries.push({ university: uni, specialty: spec, score, stateScore });
}

// Group by university preserving order of first occurrence
const groups = new Map();
for (const e of entries) {
  if (!groups.has(e.university)) groups.set(e.university, []);
  groups.get(e.university).push(e);
}

let out = "";
if (HEADER_COMMENT) out += HEADER_COMMENT + "\n\n";
out += `export interface AdmissionEntry {\n  university: string;\n  specialty: string;\n  stream?: string;\n  score: number;\n  /** Dövlət sifarişli (state-funded) — mötərizə içindəki bal */\n  stateScore?: number;\n}\n\n`;
out += `export const ${CONST_NAME}: AdmissionEntry[] = [\n`;
for (const [uni, list] of groups) {
  out += `  // ═══ ${uni} ═══\n`;
  for (const e of list) {
    const ss = e.stateScore != null ? `, stateScore: ${e.stateScore}` : "";
    out += `  { university: "${escapeString(e.university)}", specialty: "${escapeString(e.specialty)}", stream: "Ə", score: ${e.score}${ss} },\n`;
  }
}
out += `];\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log(`Wrote ${OUT} (${entries.length} entries, ${groups.size} universities)`);
