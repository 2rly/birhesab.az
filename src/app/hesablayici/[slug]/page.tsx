"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { calculators } from "@/data/calculators";
import { useLanguage } from "@/i18n";

const pageTranslations = {
  az: {
    home: "Ana s\u0259hif\u0259",
    calculator: "Hesablay\u0131c\u0131",
    comingSoon: "Tezlikl\u0259 \u0259lav\u0259 olunacaq",
    backHome: "Ana s\u0259hif\u0259y\u0259 qay\u0131t",
  },
  en: {
    home: "Home",
    calculator: "Calculator",
    comingSoon: "Coming soon",
    backHome: "Back to home",
  },
  ru: {
    home: "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
    calculator: "\u041a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440",
    comingSoon: "\u0421\u043a\u043e\u0440\u043e \u0431\u0443\u0434\u0435\u0442 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e",
    backHome: "\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e",
  },
};

export default function ComingSoonPage() {
  const pathname = usePathname();
  const calculator = calculators.find((c) => c.path === pathname);
  const { lang, t } = useLanguage();
  const pt = pageTranslations[lang] || pageTranslations.az;

  const calcName = calculator
    ? (t.calculatorNames[calculator.id as keyof typeof t.calculatorNames] || calculator.name)
    : pt.calculator;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          {pt.home}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {calcName}
        </span>
      </nav>

      <div className="bg-white rounded-2xl border border-border p-12 text-center">
        <span className="text-6xl block mb-6">{calculator?.icon || "\ud83d\udd27"}</span>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {calcName}
        </h1>
        <p className="text-muted mb-2">
          {calculator
            ? (t.calculatorDescriptions[calculator.id as keyof typeof t.calculatorDescriptions] || calculator.description)
            : ""}
        </p>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-5 py-2.5 mt-4 text-sm font-medium">
          <span>\ud83d\udea7</span>
          {pt.comingSoon}
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {pt.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
