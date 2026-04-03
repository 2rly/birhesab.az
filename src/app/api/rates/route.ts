import { NextResponse } from "next/server";

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const url = `https://www.cbar.az/currencies/${dd}.${mm}.${yyyy}.xml`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`CBAR returned ${res.status}`);
    const xml = await res.text();

    const rates: Record<string, number> = { AZN: 1 };

    const valuteRegex = /<Valute Code="([^"]+)">\s*<Nominal>([^<]+)<\/Nominal>\s*<Name>[^<]*<\/Name>\s*<Value>([^<]+)<\/Value>/g;
    let match;
    while ((match = valuteRegex.exec(xml)) !== null) {
      const code = match[1];
      const nominal = parseFloat(match[2]);
      const value = parseFloat(match[3]);
      if (nominal > 0 && value > 0) {
        rates[code] = value / nominal;
      }
    }

    // Extract date from XML
    const dateMatch = xml.match(/Date="([^"]+)"/);
    const date = dateMatch ? dateMatch[1] : `${dd}.${mm}.${yyyy}`;

    return NextResponse.json({ rates, date }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
