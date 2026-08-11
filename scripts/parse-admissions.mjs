// One-off scraper for admission score pages.
// Reads HTML files from C:/Users/XalqHack/AppData/Local/Temp/admissions and writes TS data files to src/data/.
import fs from "node:fs";
import path from "node:path";

const SRC_DATA_DIR = path.resolve("src/data");

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function decodeEntities(s) {
  return s
    .replace(/&#8211;/g, "–")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

// ─── qebulol.az parser (groups 3/4/5, magistr) ───
// <p>University name</p> ... <p>▶ Specialty Ə 572.5 (572.5)<br>cont<br>▶ Next ...</p>
function parseQebulol(html, { labelNonAz = true } = {}) {
  html = decodeEntities(html);
  // Focus on the article body: find between the first <p>Bakı and the first h3>Əlaqəli
  const startIdx = html.search(/<p>\s*Bakı\s+Dövlət\s+Universiteti\s*<\/p>/);
  const endIdx = html.search(/<h3>\s*Əlaqəli/);
  const body = html.substring(startIdx >= 0 ? startIdx : 0, endIdx >= 0 ? endIdx : html.length);

  const entries = [];
  // Split by university headings: <p>Heading</p> where heading has no ▶ and no digits
  // Then for each heading we capture the content until next heading.
  const headingRe = /<p>\s*([^<▶]{5,120}?)\s*<\/p>/g;
  const headings = [];
  let m;
  while ((m = headingRe.exec(body)) !== null) {
    const txt = stripTags(m[1]);
    // Heuristic: a university/institution name — no bullet, no number, no colon, fewer than 15 words
    if (/[▶0-9]/.test(txt)) continue;
    if (/KONKURS|GIVEAWAY|reklam|Reklam/i.test(txt)) continue;
    if (txt.split(/\s+/).length > 15) continue;
    if (txt.length < 5) continue;
    headings.push({ name: txt, index: m.index });
  }

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const nextIdx = i + 1 < headings.length ? headings[i + 1].index : body.length;
    const chunk = body.substring(h.index, nextIdx);

    // Extract specialty blocks from <p> tags containing ▶
    const pRe = /<p>([\s\S]*?)<\/p>/g;
    let pm;
    while ((pm = pRe.exec(chunk)) !== null) {
      const inner = pm[1];
      if (!inner.includes("▶")) continue;

      // Normalize: replace <br> with newline, strip other tags
      const lines = inner
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      // Each specialty entry starts with ▶ and may wrap to multiple lines until next ▶
      // Within a single logical entry we must find the stream marker (Ə/O/Q) and score
      const joined = lines.join(" ").replace(/\s+/g, " ");
      // Split by ▶
      const parts = joined.split("▶").map((s) => s.trim()).filter(Boolean);

      for (const part of parts) {
        const cleaned = part.replace(/^@\s*/, "").replace(/^\s*Reklam\s*/i, "").trim();
        // Try dual-score first: `(Ə|O|Q) N/M.M` (qabiliyyət/DİM)
        const reDual = /^(.*?)\s+(Ə|O|Q|K)\s+(\d+)\/(\d+(?:[.,]\d+)?)(?:\s*\(([^)]*)\))?\s*(.*)$/;
        // Then single: `(Ə|O|Q) N.N`
        const reSingle = /^(.*?)\s+(Ə|O|Q|K)\s+(\d+(?:[.,]\d+)?|[–—-])(?:\s*\(([^)]*)\))?\s*(.*)$/;

        let specialtyRaw, stream, scoreStr, trailing, aptitude;
        const mdual = reDual.exec(cleaned);
        if (mdual) {
          specialtyRaw = mdual[1];
          stream = mdual[2];
          aptitude = parseInt(mdual[3], 10);
          scoreStr = mdual[4];
          trailing = (mdual[6] || "").trim();
        } else {
          const mm = reSingle.exec(cleaned);
          if (!mm) continue;
          specialtyRaw = mm[1];
          stream = mm[2];
          scoreStr = mm[3];
          trailing = (mm[5] || "").trim();
        }
        // If specialty has unmatched "(", try to complete it with tokens from trailing.
        const openCount = (specialtyRaw.match(/\(/g) || []).length;
        const closeCount = (specialtyRaw.match(/\)/g) || []).length;
        if (openCount > closeCount && trailing) {
          // take tokens until matching ")" found
          const tokens = trailing.split(/\s+/);
          const taken = [];
          let remaining = openCount - closeCount;
          for (const tk of tokens) {
            taken.push(tk);
            remaining -= (tk.match(/\)/g) || []).length;
            remaining += (tk.match(/\(/g) || []).length;
            if (remaining <= 0) break;
          }
          specialtyRaw = `${specialtyRaw} ${taken.join(" ")}`.trim();
        } else if (trailing && !/^\d/.test(trailing) && trailing.length < 40 && !/Subbakalavr/i.test(trailing) && !/\b(Ə|O|Q)\b/.test(trailing)) {
          specialtyRaw = `${specialtyRaw} ${trailing}`.trim();
        }
        const specialty = specialtyRaw.replace(/\s+/g, " ").replace(/\s*@\s*$/, "").trim();
        if (!specialty) continue;
        const score = /^[–—-]$/.test(scoreStr) ? null : parseFloat(scoreStr.replace(",", "."));

        const entry = { university: h.name, specialty, stream, score };
        if (aptitude != null) entry.aptitude = aptitude;
        entries.push(entry);
      }
    }
  }

  return entries;
}

// ─── kurslar.az parser (9-illik, 11-illik) ───
// <h2>College Name</h2> <p>CODE Specialty Ə score<br />CODE Specialty Ə score</p>
function parseKurslar(html) {
  html = decodeEntities(html);
  const entries = [];
  // Match <h2>...</h2> blocks followed by content until next <h2> or article end
  const sectionRe = /<h2>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2>|<div[^>]*class="breadcrumb|$)/g;
  let m;
  while ((m = sectionRe.exec(html)) !== null) {
    const collegeName = stripTags(m[1]);
    if (!/Kollec|kollec/i.test(collegeName)) continue;
    const content = m[2];
    const lines = content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      // Try with stream marker: [digits] [specialty] (Ə|O|Q) [score]
      let mm = /^(\d{5,7})\s+(.+?)\s+(Ə|O|Q|K)\s+(\d+(?:[.,]\d+)?|[–—-])\s*$/.exec(line);
      let stream;
      let codeStr, specStr, scoreStr;
      if (mm) {
        [, codeStr, specStr, stream, scoreStr] = mm;
      } else {
        // 9-illik format: [digits] [specialty] [score]
        mm = /^(\d{5,7})\s+(.+?)\s+(\d+(?:[.,]\d+)?|[–—-])\s*$/.exec(line);
        if (!mm) continue;
        [, codeStr, specStr, scoreStr] = mm;
      }
      const specialty = specStr.replace(/\s+/g, " ").trim();
      const score = /^[–—-]$/.test(scoreStr) ? null : parseFloat(scoreStr.replace(",", "."));
      entries.push({
        code: codeStr,
        university: collegeName,
        specialty,
        stream,
        score,
      });
    }
  }
  return entries;
}

function toTs(exportName, comment, entries, withCode = false) {
  const lines = [];
  lines.push(`// ${comment}`);
  lines.push(`// Generated from public source; scores may be approximate.`);
  lines.push(``);
  lines.push(`export interface AdmissionEntry {`);
  if (withCode) lines.push(`  code?: string;`);
  lines.push(`  university: string;`);
  lines.push(`  specialty: string;`);
  lines.push(`  stream?: string;`);
  lines.push(`  aptitude?: number;`);
  lines.push(`  score: number;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const ${exportName}: AdmissionEntry[] = [`);
  for (const e of entries) {
    if (e.score == null) continue;
    const obj = [];
    if (withCode && e.code) obj.push(`code: ${JSON.stringify(e.code)}`);
    obj.push(`university: ${JSON.stringify(e.university)}`);
    obj.push(`specialty: ${JSON.stringify(e.specialty)}`);
    if (e.stream) obj.push(`stream: ${JSON.stringify(e.stream)}`);
    if (e.aptitude != null) obj.push(`aptitude: ${e.aptitude}`);
    obj.push(`score: ${e.score}`);
    lines.push(`  { ${obj.join(", ")} },`);
  }
  lines.push(`];`);
  lines.push(``);
  return lines.join("\n");
}

const jobs = [
  {
    file: "C:/Users/XalqHack/AppData/Local/Temp/admissions/g3.html",
    out: "admissions-group3-2026.ts",
    name: "admissionsGroup3",
    parser: parseQebulol,
    comment: "3-cü qrup keçid balları 2026 — Mənbə: qebulol.az",
  },
  {
    file: "C:/Users/XalqHack/AppData/Local/Temp/admissions/g4.html",
    out: "admissions-group4-2026.ts",
    name: "admissionsGroup4",
    parser: parseQebulol,
    comment: "4-cü qrup keçid balları 2026 — Mənbə: qebulol.az",
  },
  {
    file: "C:/Users/XalqHack/AppData/Local/Temp/admissions/g5.html",
    out: "admissions-group5-2026.ts",
    name: "admissionsGroup5",
    parser: parseQebulol,
    comment: "5-ci qrup keçid balları 2026 — Mənbə: qebulol.az",
  },
  {
    file: "C:/Users/XalqHack/AppData/Local/Temp/admissions/magistr.html",
    out: "admissions-magistr-2026.ts",
    name: "admissionsMagistr",
    parser: parseQebulol,
    comment: "Magistr keçid balları 2026 — Mənbə: qebulol.az",
  },
  {
    file: "C:/Users/XalqHack/AppData/Local/Temp/admissions/k11.html",
    out: "admissions-college-11-2026.ts",
    name: "admissionsCollege11",
    parser: parseKurslar,
    comment: "11-illik kolleclərə keçid balları 2025-2026 — Mənbə: kurslar.az",
    withCode: true,
  },
  {
    file: "C:/Users/XalqHack/AppData/Local/Temp/admissions/k9.html",
    out: "admissions-college-9-2026.ts",
    name: "admissionsCollege9",
    parser: parseKurslar,
    comment: "9-illik kolleclərə keçid balları 2025-2026 — Mənbə: kurslar.az",
    withCode: true,
  },
];

for (const job of jobs) {
  const html = fs.readFileSync(job.file, "utf8");
  const entries = job.parser(html);
  const ts = toTs(job.name, job.comment, entries, job.withCode);
  const outPath = path.join(SRC_DATA_DIR, job.out);
  fs.writeFileSync(outPath, ts, "utf8");
  console.log(`${job.out}: ${entries.filter((e) => e.score != null).length} entries`);
}
