"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { calculators } from "@/data/calculators";

export default function ComingSoonPage() {
  const pathname = usePathname();
  const calculator = calculators.find((c) => c.path === pathname);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Ana səhifə
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {calculator?.name || "Hesablayıcı"}
        </span>
      </nav>

      <div className="bg-white rounded-2xl border border-border p-12 text-center">
        <span className="text-6xl block mb-6">{calculator?.icon || "🔧"}</span>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {calculator?.name || "Hesablayıcı"}
        </h1>
        <p className="text-muted mb-2">{calculator?.description}</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-5 py-2.5 mt-4 text-sm font-medium">
          <span>🚧</span>
          Tezliklə əlavə olunacaq
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    </div>
  );
}
