import { NextRequest, NextResponse } from "next/server";

// DGK malların gömrük rüsumu proxy (iki mərhələli)
// GET  /api/goods-duty?lang=az&declarationMode=1&code=2201101100  → check-code
// POST /api/goods-duty?lang=az  (body = CalculateDto)             → calculate-duty
// Brauzerdən birbaşa çağırış CORS səbəbilə bloklanır — server tərəfdən ötürülür.
export const dynamic = "force-dynamic";

const BASE = "https://c2b-fbusiness.customs.gov.az/api/v1/goods";

function upstreamHeaders(lang: string) {
  const safeLang = ["az", "en", "ru"].includes(lang) ? lang : "az";
  return {
    "Content-Type": "application/json",
    lang: safeLang,
    requestSource: "ECustoms",
    "User-Agent": "BirHesab.az/1.0",
  };
}

async function relay(res: Response) {
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Upstream returned non-JSON" }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const lang = (req.nextUrl.searchParams.get("lang") || "az").toLowerCase();
  const declarationMode = req.nextUrl.searchParams.get("declarationMode") || "1";
  const code = req.nextUrl.searchParams.get("code") || "";

  try {
    const res = await fetch(
      `${BASE}/check-code?declarationMode=${encodeURIComponent(declarationMode)}&code=${encodeURIComponent(code)}`,
      { headers: upstreamHeaders(lang) }
    );
    return relay(res);
  } catch {
    return NextResponse.json({ error: "Customs service unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const lang = (req.nextUrl.searchParams.get("lang") || "az").toLowerCase();

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE}/calculate-duty`, {
      method: "POST",
      headers: upstreamHeaders(lang),
      body: JSON.stringify(payload),
    });
    return relay(res);
  } catch {
    return NextResponse.json({ error: "Customs service unavailable" }, { status: 503 });
  }
}
