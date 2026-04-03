import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Təhsil tələbə krediti (TTK) hesablayıcısı | BirHesab.az",
  description:
    "Sosial və standart TTK hesablanması — faiz dərəcəsi, güzəşt dövrü, aylıq ödəniş və qaytarma qrafiki.",
  keywords: [
    "TTK",
    "təhsil krediti",
    "tələbə krediti",
    "TTKF",
    "təhsil haqqı",
  ],
  openGraph: {
    title: "Təhsil tələbə krediti (TTK) hesablayıcısı | BirHesab.az",
    description:
      "Sosial və standart TTK hesablanması — faiz dərəcəsi, güzəşt dövrü, aylıq ödəniş və qaytarma qrafiki.",
    url: "https://birhesab.az/hesablayici/tehsil-krediti",
    type: "website",
    siteName: "BirHesab.az",
    locale: "az_AZ",
  },
  twitter: {
    card: "summary",
    title: "Təhsil tələbə krediti (TTK) hesablayıcısı | BirHesab.az",
    description:
      "Sosial və standart TTK hesablanması — faiz dərəcəsi, güzəşt dövrü, aylıq ödəniş və qaytarma qrafiki.",
  },
  alternates: {
    canonical: "https://birhesab.az/hesablayici/tehsil-krediti",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
