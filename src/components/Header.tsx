"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600">Bir<span className="text-foreground">Hesab</span></span>
            <span className="text-xs text-emerald-500 font-semibold">.az</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Ana səhifə
            </Link>
            <Link href="/#calculators" className="text-sm font-medium text-muted hover:text-primary transition-colors">
              Hesablayıcılar
            </Link>
            <Link href="/#about" className="text-sm font-medium text-muted hover:text-primary transition-colors">
              Haqqımızda
            </Link>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menyu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <nav className="flex flex-col gap-2 pt-4">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-primary-light transition-colors"
              >
                Ana səhifə
              </Link>
              <Link
                href="/#calculators"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted hover:bg-primary-light transition-colors"
              >
                Hesablayıcılar
              </Link>
              <Link
                href="/#about"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted hover:bg-primary-light transition-colors"
              >
                Haqqımızda
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
