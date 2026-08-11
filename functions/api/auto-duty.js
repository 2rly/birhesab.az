// Cloudflare Pages Function — DGK avtomobil gömrük rüsumu proxy
// URL: /api/auto-duty → e-customs calAutoDuty servisinə POST sorğusu ötürür
// CORS problemsiz, server tərəfdə çağırılır (brauzerdən birbaşa CORS bağlıdır)

const UPSTREAM = "https://c2b-fbusiness.customs.gov.az/api/v1/dictionaries/calAutoDutyv2";

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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function onRequestPost(context) {
  const { request } = context;
  const url = new URL(request.url);
  const lang = (url.searchParams.get("lang") || "az").toLowerCase();
  const safeLang = ["az", "en", "ru"].includes(lang) ? lang : "az";

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
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
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return jsonResponse({ error: "Upstream returned non-JSON", status: res.status }, 502);
    }
    return jsonResponse(data, 200);
  } catch {
    return jsonResponse({ error: "Customs service unavailable" }, 503);
  }
}
