import { MetadataRoute } from "next";
import { calculators } from "@/data/calculators";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://birhesab.az";

  const calculatorPages = calculators.map((calc) => ({
    url: `${baseUrl}${calc.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...calculatorPages,
  ];
}
