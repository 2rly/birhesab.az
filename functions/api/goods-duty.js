// Cloudflare Pages Function — DGK malların gömrük rüsumu proxy (iki mərhələli)
// GET  /api/goods-duty?lang=az&declarationMode=1&code=2201101100  → check-code
// POST /api/goods-duty?lang=az  (body = CalculateDto)             → calculate-duty

const BASE = "https://c2b-fbusiness.customs.gov.az/api/v1/goods";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

function upstreamHeaders(lang) {
  const safeLang = ["az", "en", "ru"].includes(lang) ? lang : "az";
  return {
    "Content-Type": "application/json",
    lang: safeLang,
    requestSource: "ECustoms",
    "User-Agent": "BirHesab.az/1.0",
  };
}

async function relay(res) {
  const text = await res.text();
  try {
    return jsonResponse(JSON.parse(text));
  } catch {
    return jsonResponse({ error: "Upstream returned non-JSON" }, 502);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const lang = (url.searchParams.get("lang") || "az").toLowerCase();
  const declarationMode = url.searchParams.get("declarationMode") || "1";
  const code = url.searchParams.get("code") || "";

  try {
    const res = await fetch(
      `${BASE}/check-code?declarationMode=${encodeURIComponent(declarationMode)}&code=${encodeURIComponent(code)}`,
      { headers: upstreamHeaders(lang) }
    );
    return relay(res);
  } catch {
    return jsonResponse({ error: "Customs service unavailable" }, 503);
  }
}

export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const lang = (url.searchParams.get("lang") || "az").toLowerCase();

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  try {
    const res = await fetch(`${BASE}/calculate-duty`, {
      method: "POST",
      headers: upstreamHeaders(lang),
      body: JSON.stringify(payload),
    });
    return relay(res);
  } catch {
    return jsonResponse({ error: "Customs service unavailable" }, 503);
  }
}
