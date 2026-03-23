"use client";

import { categories, type Category } from "@/data/calculators";

interface CategoryTabsProps {
  active: Category;
  onChange: (category: Category) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            active === cat.id
              ? "bg-primary text-white shadow-md"
              : "bg-white text-muted hover:bg-primary-light hover:text-primary border border-border"
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
