import type { Metadata } from "next";
import { calculators } from "@/data/calculators";

export function getCalculatorMetadata(slug: string): Metadata {
  const calc = calculators.find((c) => c.path === `/hesablayici/${slug}`);
  if (!calc) return {};

  const title = calc.name;
  const description = calc.description;
  const url = `https://birhesab.az/hesablayici/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | BirHesab.az`,
      description,
      url,
      type: "website",
      siteName: "BirHesab.az",
      locale: "az_AZ",
    },
    twitter: {
      card: "summary",
      title: `${title} | BirHesab.az`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}
