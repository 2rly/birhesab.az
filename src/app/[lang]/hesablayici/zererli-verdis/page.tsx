"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface HabitPreset {
  id: string;
  emoji: string;
  name: { az: string; en: string; ru: string };
  unit: { az: string; en: string; ru: string };
  defaultPrice: number; // AZN
  defaultDaily: number;
}

const habits: HabitPreset[] = [
  { id: "siqaret", emoji: "🚬", name: { az: "Siqaret (qutu)", en: "Cigarettes (pack)", ru: "Сигареты (пачка)" }, unit: { az: "qutu/gün", en: "pack/day", ru: "пачка/день" }, defaultPrice: 5.5, defaultDaily: 1 },
  { id: "kofe", emoji: "☕", name: { az: "Kofe (kafedə)", en: "Coffee (cafe)", ru: "Кофе (в кафе)" }, unit: { az: "fincan/gün", en: "cup/day", ru: "чашка/день" }, defaultPrice: 5, defaultDaily: 2 },
  { id: "enerji", emoji: "⚡", name: { az: "Enerji içkisi", en: "Energy drink", ru: "Энергетик" }, unit: { az: "ədəd/gün", en: "can/day", ru: "банка/день" }, defaultPrice: 3.5, defaultDaily: 1 },
  { id: "fastfood", emoji: "🍔", name: { az: "Fast-food", en: "Fast food", ru: "Фастфуд" }, unit: { az: "dəfə/gün", en: "meal/day", ru: "приём/день" }, defaultPrice: 12, defaultDaily: 1 },
  { id: "alkol", emoji: "🍺", name: { az: "Pivə", en: "Beer", ru: "Пиво" }, unit: { az: "şüşə/gün", en: "bottle/day", ru: "бутылка/день" }, defaultPrice: 3, defaultDaily: 2 },
  { id: "qumar", emoji: "🎰", name: { az: "Qumar/lotereya", en: "Gambling/lottery", ru: "Азартные игры/лотерея" }, unit: { az: "AZN/gün", en: "AZN/day", ru: "AZN/день" }, defaultPrice: 1, defaultDaily: 10 },
  { id: "custom", emoji: "✏️", name: { az: "Digər (xüsusi)", en: "Other (custom)", ru: "Другое (своё)" }, unit: { az: "ədəd/gün", en: "unit/day", ru: "шт./день" }, defaultPrice: 5, defaultDaily: 1 },
];

interface AlternativeItem {
  emoji: string;
  name: { az: string; en: string; ru: string };
  price: number; // AZN
}

const alternatives: AlternativeItem[] = [
  { emoji: "📱", name: { az: "iPhone 16 Pro", en: "iPhone 16 Pro", ru: "iPhone 16 Pro" }, price: 3500 },
  { emoji: "💻", name: { az: "MacBook Air M3", en: "MacBook Air M3", ru: "MacBook Air M3" }, price: 2500 },
  { emoji: "✈️", name: { az: "Türkiyəyə bilet", en: "Flight to Turkey", ru: "Билет в Турцию" }, price: 400 },
  { emoji: "🌍", name: { az: "Avropaya səyahət", en: "Trip to Europe", ru: "Путешествие в Европу" }, price: 2500 },
  { emoji: "🚗", name: { az: "İşlənmiş avtomobil", en: "Used car", ru: "Подержанный автомобиль" }, price: 15000 },
  { emoji: "🏠", name: { az: "İlkin köçürmə (kvartira)", en: "Apartment down payment", ru: "Первый взнос за квартиру" }, price: 20000 },
  { emoji: "🎓", name: { az: "TOEFL/IELTS hazırlığı", en: "TOEFL/IELTS prep", ru: "Подготовка к TOEFL/IELTS" }, price: 800 },
  { emoji: "🏋️", name: { az: "İllik fitness üzvlüyü", en: "Annual gym membership", ru: "Годовое членство в зале" }, price: 600 },
  { emoji: "📚", name: { az: "100 kitab", en: "100 books", ru: "100 книг" }, price: 1500 },
  { emoji: "🎮", name: { az: "PlayStation 5", en: "PlayStation 5", ru: "PlayStation 5" }, price: 1200 },
];

const t: Record<Lang, {
  title: string; description: string; bcat: string; blabel: string;
  formulaTitle: string; formulaContent: string;
  habitLabel: string; pricePerUnit: string; dailyAmount: string;
  daily: string; weekly: string; monthly: string; yearly: string; fiveYears: string; tenYears: string;
  altTitle: string; altDesc: string; canBuy: string; almost: string;
  emptyState: string;
}> = {
  az: {
    title: "Zərərli vərdişdən qənaət hesablayıcısı",
    description: "Siqaret, kofe, enerji içkisi və ya digər vərdişlərə nə qədər xərc çəkdiyinizi və bu pulla nə almaq mümkün olduğunu görün.",
    bcat: "Maliyyə", blabel: "Vərdiş qənaəti",
    formulaTitle: "Necə hesablanır?",
    formulaContent: `Hesablama formulu:
• Gündəlik xərc = Vahid qiyməti × Gündəlik miqdar
• Aylıq = Gündəlik × 30
• İllik = Gündəlik × 365
• 5 illik = İllik × 5
• 10 illik = İllik × 10

Nümunə: gündə 1 qutu siqaret (5.50 AZN) çəkənin illik itkisi: 5.50 × 365 = 2007.50 AZN. Bu pulla 1 ədəd MacBook Air ala bilərsiniz.

Qeyd: real rəqəmlər inflyasiya, faiz və qiymət artışı ilə daha yüksək olur.`,
    habitLabel: "Vərdiş seçin", pricePerUnit: "Vahid qiyməti (AZN)", dailyAmount: "Gündəlik miqdar",
    daily: "Gündəlik", weekly: "Həftəlik", monthly: "Aylıq", yearly: "İllik", fiveYears: "5 il", tenYears: "10 il",
    altTitle: "Bu pulla nə almaq olar?", altDesc: "İllik itirilən məbləğlə müqayisə",
    canBuy: "ala bilərsiniz", almost: "almağa çatır",
    emptyState: "Vərdiş seçin və miqdarı daxil edin.",
  },
  en: {
    title: "Bad habit savings calculator",
    description: "See how much you spend on cigarettes, coffee, energy drinks or other habits — and what you could buy instead.",
    bcat: "Finance", blabel: "Habit savings",
    formulaTitle: "How is it calculated?",
    formulaContent: `Formula:
• Daily cost = unit price × daily amount
• Monthly = Daily × 30
• Yearly = Daily × 365

Example: 1 pack of cigarettes/day (5.50 AZN) → yearly: 2007.50 AZN — enough for a MacBook Air.`,
    habitLabel: "Choose habit", pricePerUnit: "Unit price (AZN)", dailyAmount: "Daily amount",
    daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly", fiveYears: "5 years", tenYears: "10 years",
    altTitle: "What could you buy?", altDesc: "Compared to yearly loss",
    canBuy: "you can buy", almost: "almost enough for",
    emptyState: "Pick a habit and enter the amount.",
  },
  ru: {
    title: "Калькулятор экономии от вредных привычек",
    description: "Узнайте, сколько вы тратите на сигареты, кофе, энергетики и другие привычки — и что можно купить вместо этого.",
    bcat: "Финансы", blabel: "Экономия от привычек",
    formulaTitle: "Как считается?",
    formulaContent: `Формула:
• Ежедневно = цена × количество в день
• Ежемесячно = ежедневно × 30
• Ежегодно = ежедневно × 365

Пример: 1 пачка сигарет в день (5.50 AZN) → за год: 2007.50 AZN — этого хватит на MacBook Air.`,
    habitLabel: "Выберите привычку", pricePerUnit: "Цена за единицу (AZN)", dailyAmount: "Ежедневно",
    daily: "В день", weekly: "В неделю", monthly: "В месяц", yearly: "В год", fiveYears: "5 лет", tenYears: "10 лет",
    altTitle: "Что можно купить вместо?", altDesc: "Сравнение с годовой потерей",
    canBuy: "можно купить", almost: "почти хватит на",
    emptyState: "Выберите привычку и введите количество.",
  },
};

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HabitSavings() {
  const { lang } = useLanguage();
  const pt = t[lang];

  const [habitId, setHabitId] = useState("siqaret");
  const habit = habits.find((h) => h.id === habitId)!;
  const [price, setPrice] = useState(String(habit.defaultPrice));
  const [daily, setDaily] = useState(String(habit.defaultDaily));

  const handleHabitChange = (id: string) => {
    setHabitId(id);
    const h = habits.find((x) => x.id === id)!;
    setPrice(String(h.defaultPrice));
    setDaily(String(h.defaultDaily));
  };

  const result = useMemo(() => {
    const p = parseFloat(price.replace(",", "."));
    const d = parseFloat(daily.replace(",", "."));
    if (Number.isNaN(p) || Number.isNaN(d) || p <= 0 || d <= 0) return null;
    const dayCost = p * d;
    return {
      day: dayCost,
      week: dayCost * 7,
      month: dayCost * 30,
      year: dayCost * 365,
      fiveYear: dayCost * 365 * 5,
      tenYear: dayCost * 365 * 10,
    };
  }, [price, daily]);

  const matchedAlternatives = useMemo(() => {
    if (!result) return [];
    return alternatives.map((alt) => {
      const yearCount = result.year / alt.price;
      const fiveYearCount = result.fiveYear / alt.price;
      return { ...alt, yearCount, fiveYearCount };
    });
  }, [result]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[{ label: pt.bcat, href: "/?category=finance" }, { label: pt.blabel }]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["compound-interest", "savings-target", "deposit"]}
    >
      {/* Habit selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.habitLabel}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => handleHabitChange(h.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                habitId === h.id ? "border-primary bg-primary-light ring-2 ring-primary" : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <div className="text-2xl mb-1">{h.emoji}</div>
              <div className="text-xs font-medium text-foreground leading-tight">{h.name[lang]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-xs text-muted mb-1">{pt.dailyAmount} ({habit.unit[lang]})</label>
          <input
            type="number"
            value={daily}
            onChange={(e) => setDaily(e.target.value)}
            min={0}
            step="0.5"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">{pt.pricePerUnit}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
            step="0.1"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-700 mb-1">{pt.daily}</p>
              <p className="text-lg font-bold text-blue-900">{fmt(result.day)} ₼</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-700 mb-1">{pt.weekly}</p>
              <p className="text-lg font-bold text-blue-900">{fmt(result.week)} ₼</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-700 mb-1">{pt.monthly}</p>
              <p className="text-lg font-bold text-amber-900">{fmt(result.month)} ₼</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-700 mb-1">{pt.yearly}</p>
              <p className="text-lg font-bold text-orange-900">{fmt(result.year)} ₼</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-xs text-red-700 mb-1">{pt.fiveYears}</p>
              <p className="text-lg font-bold text-red-900">{fmt(result.fiveYear)} ₼</p>
            </div>
            <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-center">
              <p className="text-xs text-red-800 mb-1">{pt.tenYears}</p>
              <p className="text-lg font-bold text-red-900">{fmt(result.tenYear)} ₼</p>
            </div>
          </div>

          {/* Alternatives */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
            <h4 className="text-base font-bold text-emerald-900 mb-1">💡 {pt.altTitle}</h4>
            <p className="text-xs text-emerald-700 mb-4">{pt.altDesc}</p>
            <div className="space-y-2">
              {matchedAlternatives
                .filter((a) => a.yearCount >= 0.3 || a.fiveYearCount >= 0.5)
                .sort((a, b) => b.yearCount - a.yearCount)
                .slice(0, 8)
                .map((a) => (
                  <div key={a.name.az} className="flex items-center justify-between bg-white rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{a.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{a.name[lang]}</p>
                        <p className="text-[11px] text-muted">{fmt(a.price)} ₼</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {a.yearCount >= 1 ? (
                        <>
                          <p className="text-sm font-bold text-emerald-700">{a.yearCount.toFixed(1)}× / il</p>
                          <p className="text-[10px] text-muted">{pt.canBuy}</p>
                        </>
                      ) : a.fiveYearCount >= 1 ? (
                        <>
                          <p className="text-sm font-bold text-emerald-700">{a.fiveYearCount.toFixed(1)}× / 5 il</p>
                          <p className="text-[10px] text-muted">{pt.canBuy}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-amber-700">{(a.yearCount * 100).toFixed(0)}%</p>
                          <p className="text-[10px] text-muted">{pt.almost}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💸</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
