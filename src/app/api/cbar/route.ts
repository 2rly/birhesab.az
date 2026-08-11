import { NextResponse } from "next/server";

// Dev rejim üçün CBAR proxy — production-da Cloudflare Pages Function işləyir (functions/api/cbar.js)
// Static export üçün build-də bir dəfə snapshot götürür; runtime-da Cloudflare Function-a yönləndirilir.
export const dynamic = "force-static";

const TROY_OZ_GRAMS = 31.1035;

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function parseXml(xml: string) {
  const rates: Record<string, number> = { AZN: 1 };
  const regex =
    /<Valute Code="([^"]+)">\s*<Nominal>([^<]+)<\/Nominal>\s*<Name>[^<]*<\/Name>\s*<Value>([^<]+)<\/Value>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    const code = m[1];
    const nominal = parseFloat(m[2]);
    const value = parseFloat(m[3]);
    if (nominal > 0 && value > 0) rates[code] = value / nominal;
  }
  const dateMatch = xml.match(/Date="([^"]+)"/);
  return { rates, date: dateMatch ? dateMatch[1] : "" };
}

export async function GET() {
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    try {
      const res = await fetch(`https://www.cbar.az/currencies/${dateStr}.xml`, {
        headers: { "User-Agent": "BirHesab.az/1.0" },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const { rates, date } = parseXml(xml);
      if (!rates.XAU || rates.XAU <= 0) continue;
      return NextResponse.json({
        date: date || dateStr,
        source: "cbar",
        metals: {
          gold: rates.XAU / TROY_OZ_GRAMS,
          silver: rates.XAG / TROY_OZ_GRAMS,
          platinum: rates.XPT / TROY_OZ_GRAMS,
          palladium: rates.XPD / TROY_OZ_GRAMS,
        },
        metalsPerOunce: {
          gold: rates.XAU,
          silver: rates.XAG,
          platinum: rates.XPT,
          palladium: rates.XPD,
        },
        rates,
      }, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    } catch {
      continue;
    }
  }
  return NextResponse.json({ error: "CBAR unavailable" }, { status: 503 });
}
