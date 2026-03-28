import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "BirHesab.az — Bütün hesablamalar bir yerdə",
    template: "%s | BirHesab.az",
  },
  description:
    "Azərbaycanın ən geniş onlayn hesablayıcı platforması. Əmək haqqı, kredit, vergi, IELTS, gömrük və daha çox hesablayıcılar.",
  keywords: [
    "hesablayıcı", "Azərbaycan", "əmək haqqı", "kredit", "vergi",
    "IELTS", "gömrük", "BMI", "ƏDV", "onlayn hesablama", "birhesab", "kalkulyator",
  ],
  metadataBase: new URL("https://birhesab.az"),
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "https://birhesab.az",
    siteName: "BirHesab.az",
    title: "BirHesab.az — Bütün hesablamalar bir yerdə",
    description: "Azərbaycanın ən geniş onlayn hesablayıcı platforması. 50+ hesablayıcı.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BirHesab.az — Bütün hesablamalar bir yerdə",
    description: "Azərbaycanın ən geniş onlayn hesablayıcı platforması. 50+ hesablayıcı bir yerdə.",
  },
  alternates: {
    canonical: "https://birhesab.az",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
