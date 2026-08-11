// Strip "Mənbə: qebulol.az" / "Source: ..." / "Источник: ..." from admission pages.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.resolve(__dirname, "../src/app/[lang]/hesablayici");

const ADMISSION_DIRS = [
  "qebul-ballari-1ci-qrup",
  "qebul-ballari-2ci-qrup",
  "qebul-ballari-3cu-qrup",
  "qebul-ballari-4cu-qrup",
  "qebul-ballari-5ci-qrup",
  "qebul-ballari-9illik-kollec",
  "qebul-ballari-11illik-kollec",
  "magistr-kecid-ballari",
];

for (const dir of ADMISSION_DIRS) {
  const filePath = path.join(PAGES_DIR, dir, "page.tsx");
  if (!fs.existsSync(filePath)) {
    console.warn(`skip: ${filePath}`);
    continue;
  }
  let src = fs.readFileSync(filePath, "utf8");
  const before = src;

  // 1. Drop the first "Mənbə:/Source:/Источник:" line inside formulaContent backtick strings,
  //    plus the blank line that typically follows it.
  src = src.replace(
    /formulaContent:\s*`(Mənbə:|Source:|Источник:)[^\n]*\n\n?/g,
    "formulaContent: `"
  );

  // 2. Empty all `source:` translation fields.
  src = src.replace(/source:\s*"[^"]*"/g, 'source: ""');

  if (src !== before) {
    fs.writeFileSync(filePath, src, "utf8");
    console.log(`updated: ${dir}`);
  } else {
    console.log(`no changes: ${dir}`);
  }
}
