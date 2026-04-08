import { MetadataRoute } from "next";
import { calculators } from "@/data/calculators";

export const dynamic = "force-static";

const LANGS = ["az", "en", "ru"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://birhesab.az";
  const entries: MetadataRoute.Sitemap = [];

  // Homepage for each language
  for (const lang of LANGS) {
    entries.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // Calculator pages for each language
  for (const calc of calculators) {
    for (const lang of LANGS) {
      entries.push({
        url: `${baseUrl}/${lang}${calc.path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
