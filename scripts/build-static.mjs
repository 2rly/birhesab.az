// Static export build.
//
// `output: "export"` rejim `export const dynamic = "force-dynamic"` olan route-ları
// qəbul etmir. auto-duty və goods-duty route-ları xarici API-yə sorğu atdığı üçün
// statik ola bilməz — production-da onları Cloudflare Pages Functions qarşılayır
// (functions/api/auto-duty.js, functions/api/goods-duty.js).
// Ona görə build müddətinə həmin qovluqları kənara çıxarırıq. cbar force-static
// olduğu üçün yerində qalır və out/api/cbar kimi export olunur.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DYNAMIC_ROUTES = ["auto-duty", "goods-duty"];
const STASH = path.join(ROOT, ".static-build-stash");

const moved = [];

function stash() {
  fs.mkdirSync(STASH, { recursive: true });
  for (const name of DYNAMIC_ROUTES) {
    const from = path.join(ROOT, "src", "app", "api", name);
    if (!fs.existsSync(from)) continue;
    const to = path.join(STASH, name);
    fs.renameSync(from, to);
    moved.push([from, to]);
    console.log(`  kənara çıxarıldı: src/app/api/${name}`);
  }
}

function restore() {
  for (const [from, to] of moved.reverse()) {
    if (fs.existsSync(to)) fs.renameSync(to, from);
  }
  moved.length = 0;
  if (fs.existsSync(STASH) && fs.readdirSync(STASH).length === 0) fs.rmdirSync(STASH);
}

process.on("SIGINT", () => {
  restore();
  process.exit(130);
});

console.log("Static export build:");
stash();
try {
  execSync("npx next build", {
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "true" },
  });
  console.log("\n✓ out/ hazırdır");
} finally {
  restore();
  console.log("  api route-ları yerinə qaytarıldı");
}
