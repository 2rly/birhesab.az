"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import CalculatorCard from "@/components/CalculatorCard";
import { calculators, type Category } from "@/data/calculators";

function azLower(s: string): string {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase();
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

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
        (c) =>
          azLower(c.name).includes(query) ||
          azLower(c.description).includes(query) ||
          azLower(c.id).includes(query)
      );
    }

    return results;
  }, [search, activeCategory]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Bir<span className="text-amber-300">Hesab</span><span className="text-emerald-200">.az</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-200 max-w-2xl mx-auto">
              Bütün hesablamalar bir yerdə — Azərbaycanın ən geniş onlayn hesablayıcı platforması
            </p>
          </div>
          <SearchBar value={search} onChange={setSearch} />
          <div className="flex justify-center gap-6 mt-8 text-sm text-emerald-200">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">📊</span>
              <span>{calculators.length}+ hesablayıcı</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🇦🇿</span>
              <span>Azərbaycan qaydaları</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">⚡</span>
              <span>Ani nəticə</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Section */}
      {!search && activeCategory === "all" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold text-foreground">Ən çox istifadə olunanlar</h2>
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
          <h2 className="text-2xl font-bold text-foreground">Bütün hesablayıcılar</h2>
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
            <h3 className="text-lg font-semibold text-foreground mb-2">Nəticə tapılmadı</h3>
            <p className="text-muted">
              &ldquo;{search}&rdquo; üçün heç bir hesablayıcı tapılmadı. Başqa açar söz yoxlayın.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
