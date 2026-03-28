"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lang, translations } from "./translations";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations.az;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "az",
  setLang: () => {},
  t: translations.az,
});

const SUPPORTED_LANGS: Lang[] = ["az", "en", "ru"];

export function LanguageProvider({
  children,
  initialLang = "az",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const router = useRouter();
  const pathname = usePathname();

  const setLang = useCallback(
    (newLang: Lang) => {
      setLangState(newLang);
      // Replace lang segment in URL
      const segments = pathname.split("/");
      if (segments.length >= 2 && SUPPORTED_LANGS.includes(segments[1] as Lang)) {
        segments[1] = newLang;
      } else {
        segments.splice(1, 0, newLang);
      }
      router.push(segments.join("/"));
    },
    [pathname, router]
  );

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  const localizedPath = useCallback(
    (path: string) => {
      // Don't prefix external URLs, anchors, or already prefixed paths
      if (path.startsWith("http") || path.startsWith("#")) return path;
      const lang = ctx.lang;
      // Handle hash in path like /?category=finance or /#calculators
      if (path.startsWith("/")) {
        return `/${lang}${path}`;
      }
      return `/${lang}/${path}`;
    },
    [ctx.lang]
  );
  return { ...ctx, localizedPath };
}
