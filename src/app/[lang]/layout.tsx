import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientProvider from "@/components/ClientProvider";
import type { Lang } from "@/i18n";

const SUPPORTED_LANGS: Lang[] = ["az", "en", "ru"];

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (SUPPORTED_LANGS.includes(rawLang as Lang) ? rawLang : "az") as Lang;

  return (
    <ClientProvider initialLang={lang}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="min-h-screen">{children}</main>
      <Footer />
    </ClientProvider>
  );
}
