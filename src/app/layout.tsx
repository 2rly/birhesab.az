import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BirHesab.az — Bütün hesablamalar bir yerdə",
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
  ],
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
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
