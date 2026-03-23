import Link from "next/link";
import { type Calculator, categories } from "@/data/calculators";

interface CalculatorCardProps {
  calculator: Calculator;
}

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  const category = categories.find((c) => c.id === calculator.category);

  return (
    <Link
      href={calculator.path}
      className="group block bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{calculator.icon}</span>
        {category && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-light text-primary">
            {category.name}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">
        {calculator.name}
      </h3>

      <p className="text-sm text-muted leading-relaxed mb-4">{calculator.description}</p>

      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Hesabla
        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
