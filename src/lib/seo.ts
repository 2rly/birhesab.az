import type { Metadata } from "next";
import { calculators } from "@/data/calculators";

const BASE_URL = "https://birhesab.az";
const LANGS = ["az", "en", "ru"] as const;
type SeoLang = (typeof LANGS)[number];

const OG_LOCALE: Record<SeoLang, string> = {
  az: "az_AZ",
  en: "en_US",
  ru: "ru_RU",
};

const HREFLANG: Record<SeoLang, string> = {
  az: "az",
  en: "en",
  ru: "ru",
};

function normalizeLang(value: string | undefined): SeoLang {
  return (LANGS as readonly string[]).includes(value ?? "") ? (value as SeoLang) : "az";
}

/**
 * Hesablayıcı səhifəsi üçün metadata.
 *
 * Canonical dilə uyğun və son (yönləndirilməyən) URL-ə işarə edir: sayt
 * `trailingSlash: true` ilə qurulur və `/hesablayici/*` → `/az/hesablayici/*`
 * yönləndirməsi var, ona görə `/az/hesablayici/slug/` formasından istifadə olunur.
 */
export function getCalculatorMetadata(slug: string, lang: string = "az"): Metadata {
  const calc = calculators.find((c) => c.path === `/hesablayici/${slug}`);
  if (!calc) return {};

  const current = normalizeLang(lang);
  const title = calc.name;
  const description = calc.description;
  const url = `${BASE_URL}/${current}/hesablayici/${slug}/`;

  const languages: Record<string, string> = {};
  for (const item of LANGS) {
    languages[HREFLANG[item]] = `${BASE_URL}/${item}/hesablayici/${slug}/`;
  }
  languages["x-default"] = `${BASE_URL}/az/hesablayici/${slug}/`;

  return {
    title,
    description,
    keywords: calc.keywords,
    openGraph: {
      title: `${title} | BirHesab.az`,
      description,
      url,
      type: "website",
      siteName: "BirHesab.az",
      locale: OG_LOCALE[current],
    },
    twitter: {
      card: "summary",
      title: `${title} | BirHesab.az`,
      description,
    },
    alternates: {
      canonical: url,
      languages,
    },
  };
}
