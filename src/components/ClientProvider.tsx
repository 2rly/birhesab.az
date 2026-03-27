"use client";

import { LanguageProvider } from "@/i18n";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
