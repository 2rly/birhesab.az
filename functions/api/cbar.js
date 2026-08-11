// Cloudflare Pages Function — CBAR XML proxy
// URL: /api/cbar → cbar.az XML-dən metallar və valyutaları çəkir
// CORS problemsiz, Cloudflare edge-də cache olunur

const TROY_OZ_GRAMS = 31.1035;

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function parseXml(xml) {
  const rates = { AZN: 1 };
  const regex =
    /<Valute Code="([^"]+)">\s*<Nominal>([^<]+)<\/Nominal>\s*<Name>[^<]*<\/Name>\s*<Value>([^<]+)<\/Value>/gs;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const code = m[1];
    const nominal = parseFloat(m[2]);
    const value = parseFloat(m[3]);
    if (nominal > 0 && value > 0) rates[code] = value / nominal;
  }
  const dateMatch = xml.match(/Date="([^"]+)"/);
  return { rates, date: dateMatch ? dateMatch[1] : "" };
}

export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  };

  // CBAR həftəsonları/bayramlarda yeniləmir — 7 günə qədər geri sına
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    const url = `https://www.cbar.az/currencies/${dateStr}.xml`;

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "BirHesab.az/1.0" },
        cf: { cacheTtl: 3600, cacheEverything: true },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const { rates, date } = parseXml(xml);
      if (!rates.XAU || rates.XAU <= 0) continue;

      return new Response(
        JSON.stringify({
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
        }),
        { headers }
      );
    } catch {
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: "CBAR data unavailable" }),
    { status: 503, headers }
  );
}
