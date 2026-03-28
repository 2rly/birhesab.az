"use client";

import { LanguageProvider } from "@/i18n";
import type { Lang } from "@/i18n";

export default function ClientProvider({
  children,
  initialLang = "az",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  return <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>;
}
