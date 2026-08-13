import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Google AdSense — sayt üzrə avtomatik reklamlar
const ADSENSE_CLIENT = "ca-pub-8490042577570912";

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
      <head>
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        {/* AdSense teqi HTML-in içində olmalıdır — next/script onu yalnız
            hidrasiyadan sonra əlavə edir, ona görə birbaşa yazılır. */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
