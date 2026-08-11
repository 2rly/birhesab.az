// Restore stream: "Ə" + stream?: string interface field on group/college files
// to match 11-illik format. Does NOT touch magistr.

import fs from "node:fs";

const files = [
  "src/data/admissions-group1-2026.ts",
  "src/data/admissions-group2-2026.ts",
  "src/data/admissions-group3-2026.ts",
  "src/data/admissions-group4-2026.ts",
  "src/data/admissions-group5-2026.ts",
  "src/data/admissions-college-9-2026.ts",
];

for (const f of files) {
  let src = fs.readFileSync(f, "utf8");
  // Add stream? and aptitude? to interface if missing
  src = src.replace(
    /export interface AdmissionEntry \{\n  university: string;\n  specialty: string;\n  score: number;\n\}/,
    `export interface AdmissionEntry {\n  code?: string;\n  university: string;\n  specialty: string;\n  stream?: string;\n  aptitude?: number;\n  score: number;\n}`
  );
  // Insert stream: "Ə" before score on every entry line that doesn't already have stream
  src = src.replace(
    /(\{ university: "[^"]+", specialty: "[^"]+",) (score:)/g,
    '$1 stream: "Ə", $2'
  );
  fs.writeFileSync(f, src);
  console.log(`Restored ${f}`);
}
