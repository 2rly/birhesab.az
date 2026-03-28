"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import CalculatorCard from "@/components/CalculatorCard";
import { calculators, type Category } from "@/data/calculators";
import { useLanguage } from "@/i18n";

function azLower(s: string): string {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase();
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const { t } = useLanguage();

  const popularCalculators = useMemo(
    () => calculators.filter((c) => c.popular),
    []
  );

  const filteredCalculators = useMemo(() => {
    let results = calculators;

    if (activeCategory !== "all") {
      results = results.filter((c) => c.category === activeCategory);
    }

    if (search.trim()) {
      const query = azLower(search.trim());
      results = results.filter(
        (c) => {
          const name = t.calculatorNames[c.id as keyof typeof t.calculatorNames] || c.name;
          const desc = t.calculatorDescriptions[c.id as keyof typeof t.calculatorDescriptions] || c.description;
          return (
            azLower(name).includes(query) ||
            azLower(desc).includes(query) ||
            azLower(c.id).includes(query) ||
            azLower(c.name).includes(query) ||
            azLower(c.description).includes(query)
          );
        }
      );
    }

    return results;
  }, [search, activeCategory, t]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Bir<span className="text-amber-300">Hesab</span><span className="text-emerald-200">.az</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>
          <SearchBar value={search} onChange={setSearch} />
          <div className="flex justify-center gap-6 mt-8 text-sm text-emerald-50">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">📊</span>
              <span>{t.calculatorCount.replace("{count}", String(calculators.length))}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🇦🇿</span>
              <span>{t.azRules}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">⚡</span>
              <span>{t.instantResult}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Section */}
      {!search && activeCategory === "all" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold text-foreground">{t.mostPopular}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCalculators.map((calc) => (
              <CalculatorCard key={calc.id} calculator={calc} />
            ))}
          </div>
        </section>
      )}

      {/* All Calculators */}
      <section id="calculators" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📋</span>
          <h2 className="text-2xl font-bold text-foreground">{t.allCalculators}</h2>
        </div>

        <div className="mb-8">
          <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
        </div>

        {filteredCalculators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCalculators.map((calc) => (
              <CalculatorCard key={calc.id} calculator={calc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.noResults}</h3>
            <p className="text-muted">
              &ldquo;{search}&rdquo; {t.noResultsMessage}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
