import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGS = ["az", "en", "ru"];
const DEFAULT_LANG = "az";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, api routes, _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a supported lang
  const pathLang = pathname.split("/")[1];
  if (SUPPORTED_LANGS.includes(pathLang)) {
    return NextResponse.next();
  }

  // Redirect to default language
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|icon|favicon|sitemap|robots).*)"],
};
