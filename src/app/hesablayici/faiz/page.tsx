"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type CalcMode = "percent-of" | "what-percent" | "change" | "increase" | "decrease";

const modes: { value: CalcMode; label: string; description: string }[] = [
  { value: "percent-of", label: "X% of Y", description: "Ededin faizini tap" },
  { value: "what-percent", label: "X → Y %", description: "Faiz nisbetini tap" },
  { value: "change", label: "Deyisim %", description: "Artim / azalma faizi" },
  { value: "increase", label: "Artir", description: "Faizle artir" },
  { value: "decrease", label: "Azalt", description: "Faizle azalt" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function PercentageCalculator() {
  const [mode, setMode] = useState<CalcMode>("percent-of");
  const [valueX, setValueX] = useState("");
  const [valueY, setValueY] = useState("");

  const result = useMemo(() => {
    const x = parseFloat(valueX);
    const y = parseFloat(valueY);

    if (mode === "percent-of") {
      if (isNaN(x) || isNaN(y)) return null;
      const answer = y * (x / 100);
      return {
        mode,
        answer,
        label: `${fmt(x)}% of ${fmt(y)}`,
        resultLabel: "Netice",
        explanation: `${fmt(y)} x ${fmt(x)} / 100 = ${fmt(answer)}`,
      };
    }

    if (mode === "what-percent") {
      if (isNaN(x) || isNaN(y) || y === 0) return null;
      const answer = (x / y) * 100;
      return {
        mode,
        answer,
        label: `${fmt(x)}, ${fmt(y)}-in nece faizididir?`,
        resultLabel: "Faiz",
        explanation: `${fmt(x)} / ${fmt(y)} x 100 = ${answer.toFixed(2)}%`,
      };
    }

    if (mode === "change") {
      if (isNaN(x) || isNaN(y) || x === 0) return null;
      const change = ((y - x) / Math.abs(x)) * 100;
      const isIncrease = change >= 0;
      return {
        mode,
        answer: Math.abs(change),
        label: `${fmt(x)} → ${fmt(y)}`,
        resultLabel: isIncrease ? "Artim" : "Azalma",
        explanation: `(${fmt(y)} - ${fmt(x)}) / |${fmt(x)}| x 100 = ${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
        isIncrease,
        difference: y - x,
      };
    }

    if (mode === "increase") {
      if (isNaN(x) || isNaN(y)) return null;
      const answer = x * (1 + y / 100);
      const increase = x * (y / 100);
      return {
        mode,
        answer,
        label: `${fmt(x)}, ${fmt(y)}% artirilmis`,
        resultLabel: "Netice",
        explanation: `${fmt(x)} x (1 + ${fmt(y)} / 100) = ${fmt(answer)}`,
        increase,
      };
    }

    if (mode === "decrease") {
      if (isNaN(x) || isNaN(y)) return null;
      const answer = x * (1 - y / 100);
      const decrease = x * (y / 100);
      return {
        mode,
        answer,
        label: `${fmt(x)}, ${fmt(y)}% azaldilmis`,
        resultLabel: "Netice",
        explanation: `${fmt(x)} x (1 - ${fmt(y)} / 100) = ${fmt(answer)}`,
        decrease,
      };
    }

    return null;
  }, [mode, valueX, valueY]);

  const getInputLabels = (): { labelX: string; labelY: string; placeholderX: string; placeholderY: string } => {
    switch (mode) {
      case "percent-of":
        return { labelX: "Faiz (%)", labelY: "Eded", placeholderX: "25", placeholderY: "200" };
      case "what-percent":
        return { labelX: "Eded (X)", labelY: "Esas eded (Y)", placeholderX: "50", placeholderY: "200" };
      case "change":
        return { labelX: "Kohne deyeer", labelY: "Yeni deyeer", placeholderX: "100", placeholderY: "125" };
      case "increase":
        return { labelX: "Eded", labelY: "Artim faizi (%)", placeholderX: "200", placeholderY: "15" };
      case "decrease":
        return { labelX: "Eded", labelY: "Azalma faizi (%)", placeholderX: "200", placeholderY: "15" };
    }
  };

  const labels = getInputLabels();

  return (
    <CalculatorLayout
      title="Faiz hesablayıcısı"
      description="Faiz hesablamalari: faizini tap, nisbeti hesabla, artim/azalma faizi."
      breadcrumbs={[
        { label: "Gundelik", href: "/?category=daily" },
        { label: "Faiz hesablayıcısı" },
      ]}
      formulaTitle="Faiz formulalari"
      formulaContent={`1. X% of Y = Y x (X / 100)
   Meseleln: 25% of 200 = 200 x 0.25 = 50

2. X, Y-in nece faizidir = (X / Y) x 100
   Meseleln: 50, 200-un nece faizidir = (50/200) x 100 = 25%

3. Artim/azalma faizi = ((Yeni - Kohne) / |Kohne|) x 100
   Meseleln: 100 → 125 = ((125-100)/100) x 100 = +25%

4. Faizle artirmaq: Eded x (1 + Faiz/100)
   Meseleln: 200, 15% artir = 200 x 1.15 = 230

5. Faizle azaltmaq: Eded x (1 - Faiz/100)
   Meseleln: 200, 15% azalt = 200 x 0.85 = 170`}
      relatedIds={["discount", "vat", "deposit", "percentage"]}
    >
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m.value
                ? "bg-primary text-white"
                : "bg-gray-50 border border-border text-muted hover:border-primary/30"
            }`}
          >
            <span className="block">{m.label}</span>
            <span className="text-xs opacity-75">{m.description}</span>
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{labels.labelX}</label>
          <input
            type="number"
            value={valueX}
            onChange={(e) => setValueX(e.target.value)}
            placeholder={labels.placeholderX}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{labels.labelY}</label>
          <input
            type="number"
            value={valueY}
            onChange={(e) => setValueY(e.target.value)}
            placeholder={labels.placeholderY}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{result.resultLabel}</p>
            <p className="text-4xl font-bold">
              {result.mode === "what-percent" || result.mode === "change"
                ? `${result.answer.toFixed(2)}%`
                : fmt(result.answer)}
            </p>
            <p className="text-sm text-blue-200 mt-2">{result.label}</p>
          </div>

          {/* Additional Info */}
          {result.mode === "change" && "isIncrease" in result && (
            <div className={`rounded-2xl border p-6 text-center ${
              result.isIncrease
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <p className={`text-sm mb-1 ${result.isIncrease ? "text-green-600" : "text-red-600"}`}>
                {result.isIncrease ? "Artim" : "Azalma"}
              </p>
              <p className={`text-2xl font-bold ${result.isIncrease ? "text-green-700" : "text-red-700"}`}>
                {"difference" in result ? (result.isIncrease ? "+" : "") + fmt(result.difference as number) : ""}
              </p>
            </div>
          )}

          {result.mode === "increase" && "increase" in result && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">Ilkin deyeer</p>
                <p className="text-2xl font-bold text-foreground">{fmt(parseFloat(valueX))}</p>
              </div>
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
                <p className="text-sm text-green-600 mb-1">Artim meblegi</p>
                <p className="text-2xl font-bold text-green-700">+{fmt(result.increase as number)}</p>
              </div>
            </div>
          )}

          {result.mode === "decrease" && "decrease" in result && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                <p className="text-sm text-muted mb-1">Ilkin deyeer</p>
                <p className="text-2xl font-bold text-foreground">{fmt(parseFloat(valueX))}</p>
              </div>
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
                <p className="text-sm text-red-600 mb-1">Azalma meblegi</p>
                <p className="text-2xl font-bold text-red-700">-{fmt(result.decrease as number)}</p>
              </div>
            </div>
          )}

          {/* Formula Explanation */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-1 font-medium">Hesablama</p>
            <p className="text-sm font-mono text-foreground">{result.explanation}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">➗</span>
          <p>Neticeni gormek ucun deyeerleri daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
