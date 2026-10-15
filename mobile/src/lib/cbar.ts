/**
 * CBAR (Mərkəzi Bank) rəsmi məzənnələri — saytdakı /api/cbar proxy-sinin
 * (src/app/api/cbar/route.ts, functions/api/cbar.js) mobil ekvivalenti.
 * Native tətbiqdə CORS olmadığı üçün cbar.az XML birbaşa çəkilir və regex ilə parse olunur.
 */

export const TROY_OZ_GRAMS = 31.1035;

export type CbarMetals = { gold: number; silver: number; platinum: number; palladium: number };

export type CbarData = {
  /** XML-dəki tarix (DD.MM.YYYY) */
  date: string;
  source: "cbar";
  /** 1 qram üçün AZN */
  metals: CbarMetals;
  /** 1 troy unsiya üçün AZN */
  metalsPerOunce: CbarMetals;
  /** Kod → 1 vahid üçün AZN (nominal nəzərə alınıb). AZN = 1 */
  rates: Record<string, number>;
  /** Kod → XML-dəki ad (az) */
  names: Record<string, string>;
};

/** Date → "DD.MM.YYYY" */
export function cbarDateStr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function parseCbarXml(xml: string): { rates: Record<string, number>; names: Record<string, string>; date: string } {
  const rates: Record<string, number> = { AZN: 1 };
  const names: Record<string, string> = {};
  const regex =
    /<Valute Code="([^"]+)">\s*<Nominal>([^<]+)<\/Nominal>\s*<Name>([^<]*)<\/Name>\s*<Value>([^<]+)<\/Value>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    const code = m[1];
    const nominal = parseFloat(m[2]);
    const value = parseFloat(m[4]);
    if (nominal > 0 && value > 0) {
      rates[code] = value / nominal;
      names[code] = m[3].trim();
    }
  }
  const dateMatch = xml.match(/Date="([^"]+)"/);
  return { rates, names, date: dateMatch ? dateMatch[1] : "" };
}

/** Konkret gün üçün XML (həmin gün dərc olunmayıbsa null). */
export async function fetchCbarForDate(d: Date): Promise<CbarData | null> {
  const dateStr = cbarDateStr(d);
  try {
    const res = await fetch(`https://www.cbar.az/currencies/${dateStr}.xml`, {
      headers: { "User-Agent": "BirHesab.az/1.0" },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const { rates, names, date } = parseCbarXml(xml);
    if (Object.keys(rates).length <= 1) return null;
    const ounce: CbarMetals = {
      gold: rates.XAU ?? 0,
      silver: rates.XAG ?? 0,
      platinum: rates.XPT ?? 0,
      palladium: rates.XPD ?? 0,
    };
    return {
      date: date || dateStr,
      source: "cbar",
      metals: {
        gold: ounce.gold / TROY_OZ_GRAMS,
        silver: ounce.silver / TROY_OZ_GRAMS,
        platinum: ounce.platinum / TROY_OZ_GRAMS,
        palladium: ounce.palladium / TROY_OZ_GRAMS,
      },
      metalsPerOunce: ounce,
      rates,
      names,
    };
  } catch {
    return null;
  }
}

let cache: { at: number; data: CbarData } | null = null;
let inflight: Promise<CbarData | null> | null = null;

/**
 * Ən son məzənnələr: bu gündən 7 günə qədər geri sınayır (həftəsonu/bayram),
 * saytdakı kimi XAU olmayan günləri ötürür. 1 saatlıq modul-səviyyəli keş.
 */
export async function fetchCbarLatest(from: Date = new Date()): Promise<CbarData | null> {
  if (cache && Date.now() - cache.at < 3600_000) return cache.data;
  if (inflight) return inflight;
  inflight = (async () => {
    for (let i = 0; i < 7; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() - i);
      const data = await fetchCbarForDate(d);
      if (data && data.rates.XAU && data.rates.XAU > 0) {
        cache = { at: Date.now(), data };
        return data;
      }
    }
    return null;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Seçilmiş tarix üçün (və ya ondan əvvəlki ilk dərc olunmuş gün üçün) məzənnələr. */
export async function fetchCbarOnOrBefore(d: Date, maxBack = 7): Promise<CbarData | null> {
  for (let i = 0; i < maxBack; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    const data = await fetchCbarForDate(x);
    if (data) return data;
  }
  return null;
}
