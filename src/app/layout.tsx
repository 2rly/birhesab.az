import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientProvider from "@/components/ClientProvider";

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
    "hesablayıcı",
    "Azərbaycan",
    "əmək haqqı",
    "kredit",
    "vergi",
    "IELTS",
    "gömrük",
    "BMI",
    "ƏDV",
    "onlayn hesablama",
    "birhesab",
    "kalkulyator",
  ],
  metadataBase: new URL("https://birhesab.az"),
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "https://birhesab.az",
    siteName: "BirHesab.az",
    title: "BirHesab.az — Bütün hesablamalar bir yerdə",
    description:
      "Azərbaycanın ən geniş onlayn hesablayıcı platforması. Əmək haqqı, kredit, vergi, IELTS, gömrük və 50+ hesablayıcı.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BirHesab.az — Bütün hesablamalar bir yerdə",
    description:
      "Azərbaycanın ən geniş onlayn hesablayıcı platforması. 50+ hesablayıcı bir yerdə.",
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
        <ClientProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
          <Header />
          <main id="main-content" className="min-h-screen">{children}</main>
          <Footer />
        </ClientProvider>
      </body>
    </html>
  );
}
