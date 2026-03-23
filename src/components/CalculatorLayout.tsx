import Link from "next/link";
import { calculators } from "@/data/calculators";
import CalculatorCard from "./CalculatorCard";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface CalculatorLayoutProps {
  title: string;
  description: string;
  breadcrumbs: Breadcrumb[];
  formulaTitle?: string;
  formulaContent?: string;
  relatedIds?: string[];
  children: React.ReactNode;
}

export default function CalculatorLayout({
  title,
  description,
  breadcrumbs,
  formulaTitle,
  formulaContent,
  relatedIds = [],
  children,
}: CalculatorLayoutProps) {
  const relatedCalculators = calculators.filter((c) => relatedIds.includes(c.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Ana səhifə
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>/</span>
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-primary transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted">{description}</p>
      </div>

      {/* Calculator Content */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-8">
        {children}
      </div>

      {/* Formula Explanation */}
      {formulaTitle && formulaContent && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <span>📐</span>
            {formulaTitle}
          </h3>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{formulaContent}</p>
        </div>
      )}

      {/* Related Calculators */}
      {relatedCalculators.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>🔗</span>
            Əlaqəli hesablayıcılar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedCalculators.map((calc) => (
              <CalculatorCard key={calc.id} calculator={calc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
