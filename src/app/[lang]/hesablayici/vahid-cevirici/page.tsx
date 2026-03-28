"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

/* ───────── conversion factors (everything relative to a base unit) ───────── */

type UnitDef = {
  key: string;
  label: Record<Lang, string>;
  toBase: number; // multiply by this to get base unit
};

type CategoryDef = {
  key: string;
  label: Record<Lang, string>;
  icon: string;
  units: UnitDef[];
};

const categories: CategoryDef[] = [
  {
    key: "length",
    label: { az: "Uzunluq", en: "Length", ru: "Длина" },
    icon: "📏",
    units: [
      { key: "km", label: { az: "Kilometr", en: "Kilometer", ru: "Километр" }, toBase: 1000 },
      { key: "mil", label: { az: "Mil", en: "Mile", ru: "Миля" }, toBase: 1609.344 },
      { key: "m", label: { az: "Metr", en: "Meter", ru: "Метр" }, toBase: 1 },
      { key: "ft", label: { az: "Fut", en: "Foot", ru: "Фут" }, toBase: 0.3048 },
      { key: "cm", label: { az: "Santimetr", en: "Centimeter", ru: "Сантиметр" }, toBase: 0.01 },
      { key: "inch", label: { az: "Düym", en: "Inch", ru: "Дюйм" }, toBase: 0.0254 },
    ],
  },
  {
    key: "weight",
    label: { az: "Çəki", en: "Weight", ru: "Вес" },
    icon: "⚖️",
    units: [
      { key: "kq", label: { az: "Kiloqram", en: "Kilogram", ru: "Килограмм" }, toBase: 1000 },
      { key: "lb", label: { az: "Funt", en: "Pound", ru: "Фунт" }, toBase: 453.592 },
      { key: "q", label: { az: "Qram", en: "Gram", ru: "Грамм" }, toBase: 1 },
      { key: "oz", label: { az: "Unsiya", en: "Ounce", ru: "Унция" }, toBase: 28.3495 },
    ],
  },
  {
    key: "data",
    label: { az: "Data", en: "Data", ru: "Данные" },
    icon: "💾",
    units: [
      { key: "MB", label: { az: "Meqabayt", en: "Megabyte", ru: "Мегабайт" }, toBase: 1 },
      { key: "GB", label: { az: "Giqabayt", en: "Gigabyte", ru: "Гигабайт" }, toBase: 1024 },
      { key: "TB", label: { az: "Terabayt", en: "Terabyte", ru: "Терабайт" }, toBase: 1048576 },
    ],
  },
];

/* ───────── page translations ───────── */

const pageTranslations = {
  az: {
    title: "Vahid çevirici",
    description: "Uzunluq, çəki və data vahidlərini ani çevirin.",
    breadcrumbCategory: "Gündəlik",
    formulaTitle: "Çevirmə haqqında",
    formulaContent: `Vahid çevirici standart çevirmə əmsallarından istifadə edir.

Uzunluq: 1 mil = 1.609 km, 1 fut = 0.3048 m, 1 düym = 2.54 sm
Çəki: 1 funt = 0.4536 kq, 1 unsiya = 28.35 q
Data: 1 GB = 1024 MB, 1 TB = 1024 GB`,
    swap: "Dəyişdir",
    from: "Buradan",
    to: "Bura",
    refTable: "Tez-tez istifadə olunan çevirmələr",
    fromCol: "Dən",
    toCol: "Ə",
    valueCol: "Nəticə",
  },
  en: {
    title: "Unit Converter",
    description: "Instantly convert length, weight, and data units.",
    breadcrumbCategory: "Daily",
    formulaTitle: "About conversions",
    formulaContent: `The unit converter uses standard conversion factors.

Length: 1 mile = 1.609 km, 1 foot = 0.3048 m, 1 inch = 2.54 cm
Weight: 1 pound = 0.4536 kg, 1 ounce = 28.35 g
Data: 1 GB = 1024 MB, 1 TB = 1024 GB`,
    swap: "Swap",
    from: "From",
    to: "To",
    refTable: "Common conversion reference",
    fromCol: "From",
    toCol: "To",
    valueCol: "Result",
  },
  ru: {
    title: "Конвертер единиц",
    description: "Мгновенно конвертируйте единицы длины, веса и данных.",
    breadcrumbCategory: "Ежедневное",
    formulaTitle: "О конвертации",
    formulaContent: `Конвертер единиц использует стандартные коэффициенты.

Длина: 1 миля = 1.609 км, 1 фут = 0.3048 м, 1 дюйм = 2.54 см
Вес: 1 фунт = 0.4536 кг, 1 унция = 28.35 г
Данные: 1 ГБ = 1024 МБ, 1 ТБ = 1024 ГБ`,
    swap: "Поменять",
    from: "Из",
    to: "В",
    refTable: "Часто используемые преобразования",
    fromCol: "Из",
    toCol: "В",
    valueCol: "Результат",
  },
};

/* ───────── common conversions for reference table ───────── */

const commonConversions = [
  { catIdx: 0, fromKey: "km", toKey: "mil", value: 1 },
  { catIdx: 0, fromKey: "m", toKey: "ft", value: 1 },
  { catIdx: 0, fromKey: "cm", toKey: "inch", value: 1 },
  { catIdx: 0, fromKey: "mil", toKey: "km", value: 1 },
  { catIdx: 1, fromKey: "kq", toKey: "lb", value: 1 },
  { catIdx: 1, fromKey: "q", toKey: "oz", value: 1 },
  { catIdx: 2, fromKey: "GB", toKey: "MB", value: 1 },
  { catIdx: 2, fromKey: "TB", toKey: "GB", value: 1 },
];

/* ───────── helpers ───────── */

function formatResult(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(4);
  if (Math.abs(n) < 1) return n.toFixed(4);
  if (Math.abs(n) >= 1e6) return n.toLocaleString("en", { maximumFractionDigits: 2 });
  return n.toFixed(4).replace(/\.?0+$/, "");
}

/* ───────── component ───────── */

export default function UnitConverter() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [catIdx, setCatIdx] = useState(0);
  const [fromUnit, setFromUnit] = useState(categories[0].units[0].key);
  const [toUnit, setToUnit] = useState(categories[0].units[2].key);
  const [leftValue, setLeftValue] = useState("1");
  const [rightValue, setRightValue] = useState("");
  const [activeField, setActiveField] = useState<"left" | "right">("left");
  const [swapped, setSwapped] = useState(false);

  const cat = categories[catIdx];

  const fromDef = cat.units.find((u) => u.key === fromUnit)!;
  const toDef = cat.units.find((u) => u.key === toUnit)!;

  /* ── convert logic ── */
  const convert = (value: number, from: UnitDef, to: UnitDef) => {
    const base = value * from.toBase;
    return base / to.toBase;
  };

  const computedRight = useMemo(() => {
    if (activeField !== "left") return rightValue;
    const n = parseFloat(leftValue);
    if (isNaN(n)) return "";
    return formatResult(convert(n, fromDef, toDef));
  }, [leftValue, fromDef, toDef, activeField]);

  const computedLeft = useMemo(() => {
    if (activeField !== "right") return leftValue;
    const n = parseFloat(rightValue);
    if (isNaN(n)) return "";
    return formatResult(convert(n, toDef, fromDef));
  }, [rightValue, fromDef, toDef, activeField]);

  const displayLeft = activeField === "left" ? leftValue : computedLeft;
  const displayRight = activeField === "right" ? rightValue : computedRight;

  /* ── handlers ── */
  const handleLeftChange = (v: string) => {
    setActiveField("left");
    setLeftValue(v);
  };

  const handleRightChange = (v: string) => {
    setActiveField("right");
    setRightValue(v);
  };

  const handleCategoryChange = (idx: number) => {
    setCatIdx(idx);
    setFromUnit(categories[idx].units[0].key);
    setToUnit(categories[idx].units.length > 2 ? categories[idx].units[2].key : categories[idx].units[1].key);
    setLeftValue("1");
    setRightValue("");
    setActiveField("left");
  };

  const handleSwap = () => {
    setSwapped((p) => !p);
    const tmpFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tmpFrom);
    // keep the active field's value, recalculate the other
    if (activeField === "left") {
      setActiveField("left");
    } else {
      setActiveField("right");
    }
  };

  /* ── reference table rows ── */
  const refRows = commonConversions
    .filter((r) => r.catIdx === catIdx)
    .map((r) => {
      const fDef = cat.units.find((u) => u.key === r.fromKey)!;
      const tDef = cat.units.find((u) => u.key === r.toKey)!;
      const result = convert(r.value, fDef, tDef);
      return {
        from: `${r.value} ${fDef.label[lang]}`,
        to: tDef.label[lang],
        result: `${formatResult(result)} ${r.toKey}`,
      };
    });

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=daily" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["currency", "percentage", "faiz"]}
    >
      {/* ── Category Tabs ── */}
      <div className="flex gap-2 mb-6">
        {categories.map((c, i) => (
          <button
            key={c.key}
            onClick={() => handleCategoryChange(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              catIdx === i
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            <span>{c.icon}</span>
            {c.label[lang]}
          </button>
        ))}
      </div>

      {/* ── Converter ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
        {/* Left field */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted mb-1">{pt.from}</label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={displayLeft}
              onChange={(e) => handleLeftChange(e.target.value)}
              onFocus={() => setActiveField("left")}
              placeholder="0"
              className="flex-1 min-w-0 rounded-lg border border-border px-3 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                setActiveField("left");
              }}
              className="w-24 rounded-lg border border-border px-2 py-2.5 text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {cat.units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.key}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex items-center justify-center sm:pb-0.5">
          <button
            onClick={handleSwap}
            aria-label={pt.swap}
            title={pt.swap}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-white hover:bg-gray-50 text-primary transition-transform duration-300"
            style={{ transform: swapped ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>
        </div>

        {/* Right field */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted mb-1">{pt.to}</label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={displayRight}
              onChange={(e) => handleRightChange(e.target.value)}
              onFocus={() => setActiveField("right")}
              placeholder="0"
              className="flex-1 min-w-0 rounded-lg border border-border px-3 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                setActiveField("right");
              }}
              className="w-24 rounded-lg border border-border px-2 py-2.5 text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {cat.units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.key}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Quick rate display ── */}
      {displayLeft && displayRight && (
        <p className="text-sm text-muted mt-4 text-center">
          1 {fromUnit} = {formatResult(convert(1, fromDef, toDef))} {toUnit}
        </p>
      )}

      {/* ── Reference Table ── */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground mb-3">{pt.refTable}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted font-medium">{pt.fromCol}</th>
                <th className="text-left py-2 pr-4 text-muted font-medium">{pt.toCol}</th>
                <th className="text-right py-2 text-muted font-medium">{pt.valueCol}</th>
              </tr>
            </thead>
            <tbody>
              {refRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4">{row.from}</td>
                  <td className="py-2 pr-4">{row.to}</td>
                  <td className="py-2 text-right font-medium">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CalculatorLayout>
  );
}
