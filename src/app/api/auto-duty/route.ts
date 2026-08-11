import { NextRequest, NextResponse } from "next/server";

// DGK avtomobil gömrük rüsumu proxy
// Brauzerdən birbaşa çağırış CORS səbəbilə bloklanır — buna görə server tərəfdən ötürülür.
// Dev rejimdə Next.js, production-da OpenNext worker / Cloudflare Function (functions/api/auto-duty.js) işləyir.
export const dynamic = "force-dynamic";

const UPSTREAM = "https://c2b-fbusiness.customs.gov.az/api/v1/dictionaries/calAutoDutyv2";

export async function POST(req: NextRequest) {
  const lang = (req.nextUrl.searchParams.get("lang") || "az").toLowerCase();
  const safeLang = ["az", "en", "ru"].includes(lang) ? lang : "az";

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        lang: safeLang,
        requestSource: "1",
        "User-Agent": "BirHesab.az/1.0",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Upstream returned non-JSON" }, { status: 502 });
    }
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Customs service unavailable" }, { status: 503 });
  }
}
