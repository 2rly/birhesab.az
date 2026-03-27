"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("birhesab-lang") as Lang) || "az";
    }
    return "az";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("birhesab-lang", newLang);
    }
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
