// Strip stream: "Ə"/"Q" and stateScore fields from admissions-*.ts files.
// Reverts data files to {university, specialty, score} shape.

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
  // Remove ", stream: \"X\"" (also handles \"Ə\", \"Q\" etc)
  src = src.replace(/,\s*stream:\s*"[^"]*"/g, "");
  // Remove ", stateScore: <number>"
  src = src.replace(/,\s*stateScore:\s*[\d.]+/g, "");
  // Simplify the interface: remove stream/stateScore fields
  src = src.replace(/\s*stream\?:\s*string;\s*\n/g, "\n");
  src = src.replace(/\n\s*\/\*\*[^\n]*\*\/\n\s*stateScore\?:\s*number;/g, "");
  fs.writeFileSync(f, src);
  console.log(`Stripped ${f}`);
}
