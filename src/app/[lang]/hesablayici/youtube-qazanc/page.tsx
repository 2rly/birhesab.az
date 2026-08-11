"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface Region {
  id: string;
  name: { az: string; en: string; ru: string };
  flag: string;
  cpmMin: number; // USD per 1000 views
  cpmMax: number;
}

const regions: Region[] = [
  { id: "az-tr", name: { az: "Azərbaycan / Türkiyə", en: "Azerbaijan / Turkey", ru: "Азербайджан / Турция" }, flag: "🇦🇿", cpmMin: 0.5, cpmMax: 1.5 },
  { id: "ru-cis", name: { az: "Rusiya / MDB", en: "Russia / CIS", ru: "Россия / СНГ" }, flag: "🇷🇺", cpmMin: 0.7, cpmMax: 2 },
  { id: "eu-east", name: { az: "Şərqi Avropa", en: "Eastern Europe", ru: "Восточная Европа" }, flag: "🇵🇱", cpmMin: 1.5, cpmMax: 3 },
  { id: "eu-west", name: { az: "Qərbi Avropa", en: "Western Europe", ru: "Западная Европа" }, flag: "🇪🇺", cpmMin: 2, cpmMax: 5 },
  { id: "uk", name: { az: "Böyük Britaniya", en: "United Kingdom", ru: "Великобритания" }, flag: "🇬🇧", cpmMin: 4, cpmMax: 8 },
  { id: "us", name: { az: "ABŞ / Kanada", en: "USA / Canada", ru: "США / Канада" }, flag: "🇺🇸", cpmMin: 5, cpmMax: 10 },
  { id: "au", name: { az: "Avstraliya", en: "Australia", ru: "Австралия" }, flag: "🇦🇺", cpmMin: 4, cpmMax: 9 },
  { id: "asia", name: { az: "Cənub-Şərqi Asiya", en: "Southeast Asia", ru: "Юго-Восточная Азия" }, flag: "🌏", cpmMin: 0.5, cpmMax: 2 },
  { id: "india", name: { az: "Hindistan", en: "India", ru: "Индия" }, flag: "🇮🇳", cpmMin: 0.3, cpmMax: 1 },
  { id: "mixed", name: { az: "Qarışıq auditoriya", en: "Mixed audience", ru: "Смешанная аудитория" }, flag: "🌍", cpmMin: 1, cpmMax: 3 },
];

interface Niche {
  id: string;
  name: { az: string; en: string; ru: string };
  emoji: string;
  multiplier: number; // Niche multiplier on base CPM
}

const niches: Niche[] = [
  { id: "finance", emoji: "💰", name: { az: "Maliyyə / Biznes", en: "Finance / Business", ru: "Финансы / Бизнес" }, multiplier: 2.5 },
  { id: "tech", emoji: "💻", name: { az: "Texnologiya / Proqramlaşdırma", en: "Tech / Programming", ru: "Технологии / Программирование" }, multiplier: 2.0 },
  { id: "education", emoji: "🎓", name: { az: "Təhsil", en: "Education", ru: "Образование" }, multiplier: 1.6 },
  { id: "health", emoji: "❤️", name: { az: "Sağlamlıq / Fitness", en: "Health / Fitness", ru: "Здоровье / Фитнес" }, multiplier: 1.5 },
  { id: "lifestyle", emoji: "✨", name: { az: "Lifestyle / Vlog", en: "Lifestyle / Vlog", ru: "Лайфстайл / Влог" }, multiplier: 1.0 },
  { id: "food", emoji: "🍔", name: { az: "Yemək / Resept", en: "Food / Recipes", ru: "Еда / Рецепты" }, multiplier: 1.0 },
  { id: "gaming", emoji: "🎮", name: { az: "Oyunlar", en: "Gaming", ru: "Игры" }, multiplier: 0.7 },
  { id: "music", emoji: "🎵", name: { az: "Musiqi", en: "Music", ru: "Музыка" }, multiplier: 0.6 },
  { id: "entertainment", emoji: "🎬", name: { az: "Əyləncə", en: "Entertainment", ru: "Развлечения" }, multiplier: 0.8 },
  { id: "kids", emoji: "🧸", name: { az: "Uşaqlar üçün", en: "Kids content", ru: "Для детей" }, multiplier: 0.5 },
];

const t: Record<Lang, {
  title: string; description: string; bcat: string; blabel: string;
  formulaTitle: string; formulaContent: string;
  monthlyViews: string; viewsHint: string;
  regionLabel: string; nicheLabel: string;
  estimatedRevenue: string; perMonth: string; perYear: string;
  cpmRange: string; effectiveCpm: string;
  inUsd: string; inAzn: string;
  minRevenue: string; maxRevenue: string; avgRevenue: string;
  disclaimer: string;
  emptyState: string;
}> = {
  az: {
    title: "YouTube qazanc hesablayıcısı",
    description: "Aylıq baxış sayınız, region və mövzunuza əsasən təxmini YouTube qazancınızı hesablayın.",
    bcat: "Maliyyə", blabel: "YouTube qazanc",
    formulaTitle: "YouTube qazancı necə hesablanır?",
    formulaContent: `YouTube reklam gəliri CPM (Cost Per Mille — min baxışa düşən qiymət) əsasında hesablanır.

Düstur:
• Gəlir = (Baxış sayı / 1000) × CPM × Niche əmsalı

CPM regionlara və mövzulara görə dəyişir:
• Azərbaycan / Türkiyə: $0.50 - $1.50
• Rusiya / MDB: $0.70 - $2.00
• Şərqi Avropa: $1.50 - $3.00
• Qərbi Avropa: $2.00 - $5.00
• ABŞ / Kanada: $5.00 - $10.00

Niche əmsalları:
• Maliyyə / Biznes — 2.5× (ən yüksək)
• Texnologiya — 2.0×
• Təhsil — 1.6×
• Sağlamlıq / Fitness — 1.5×
• Lifestyle / Yemək — 1.0×
• Oyunlar — 0.7×
• Musiqi — 0.6×
• Uşaq kontenti — 0.5× (COPPA məhdudiyyəti)

Qeyd: Bu hesablama TƏXMİNİDİR. Real qazanc YouTube əməkdaşlıq müqaviləsi (55% kanal payı), reklam blokerləri, mövsümi tərəddüdlər və demoqrafik faktordan asılıdır.`,
    monthlyViews: "Aylıq baxış sayı",
    viewsHint: "Məsələn: 100000 (100 min)",
    regionLabel: "Auditoriyanın əsas regionu",
    nicheLabel: "Kanal mövzusu (niche)",
    estimatedRevenue: "Təxmini gəlir",
    perMonth: "Aylıq", perYear: "İllik",
    cpmRange: "CPM aralığı", effectiveCpm: "Effektiv CPM",
    inUsd: "USD-də", inAzn: "AZN-də",
    minRevenue: "Minimum", maxRevenue: "Maksimum", avgRevenue: "Orta",
    disclaimer: "⚠️ Bu rəqəmlər təxminidir. Real gəlir bir çox faktordan asılıdır.",
    emptyState: "Baxış sayını daxil edin və region/niche seçin.",
  },
  en: {
    title: "YouTube earnings calculator",
    description: "Estimate YouTube ad revenue based on monthly views, region and content niche.",
    bcat: "Finance", blabel: "YouTube earnings",
    formulaTitle: "How is YouTube revenue calculated?",
    formulaContent: `YouTube ad revenue is based on CPM (Cost Per Mille).

Formula: Revenue = (Views / 1000) × CPM × Niche multiplier

Regional CPM:
• Azerbaijan/Turkey: $0.50-$1.50
• Eastern Europe: $1.50-$3.00
• Western Europe: $2.00-$5.00
• USA/Canada: $5.00-$10.00

Niche multipliers:
• Finance: 2.5× • Tech: 2.0× • Education: 1.6× • Gaming: 0.7× • Music: 0.6×

Note: estimates only. Actual revenue depends on contract terms, ad blockers, etc.`,
    monthlyViews: "Monthly views",
    viewsHint: "Example: 100000 (100K)",
    regionLabel: "Main audience region",
    nicheLabel: "Channel niche",
    estimatedRevenue: "Estimated revenue",
    perMonth: "Monthly", perYear: "Yearly",
    cpmRange: "CPM range", effectiveCpm: "Effective CPM",
    inUsd: "in USD", inAzn: "in AZN",
    minRevenue: "Minimum", maxRevenue: "Maximum", avgRevenue: "Average",
    disclaimer: "⚠️ These are estimates. Real income depends on many factors.",
    emptyState: "Enter monthly views and select region/niche.",
  },
  ru: {
    title: "Калькулятор доходов на YouTube",
    description: "Рассчитайте примерный доход на YouTube на основе ежемесячных просмотров, региона и тематики.",
    bcat: "Финансы", blabel: "Доходы YouTube",
    formulaTitle: "Как рассчитывается доход на YouTube?",
    formulaContent: `Доход с рекламы YouTube рассчитывается по CPM (стоимость за 1000 просмотров).

Формула: Доход = (Просмотры / 1000) × CPM × Множитель ниши

CPM по регионам:
• Азербайджан/Турция: $0.50-$1.50
• Восточная Европа: $1.50-$3.00
• Западная Европа: $2.00-$5.00
• США/Канада: $5.00-$10.00

Примечание: расчёт примерный.`,
    monthlyViews: "Просмотров в месяц",
    viewsHint: "Например: 100000 (100 тыс.)",
    regionLabel: "Основной регион аудитории",
    nicheLabel: "Тематика канала",
    estimatedRevenue: "Примерный доход",
    perMonth: "В месяц", perYear: "В год",
    cpmRange: "Диапазон CPM", effectiveCpm: "Эффективный CPM",
    inUsd: "в USD", inAzn: "в AZN",
    minRevenue: "Минимум", maxRevenue: "Максимум", avgRevenue: "Среднее",
    disclaimer: "⚠️ Это примерные цифры. Реальный доход зависит от многих факторов.",
    emptyState: "Введите количество просмотров и выберите регион/нишу.",
  },
};

const USD_TO_AZN = 1.7;

function fmtMoney(n: number, currency: "USD" | "AZN"): string {
  const symbol = currency === "USD" ? "$" : "₼";
  return symbol + n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtViews(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

export default function YouTubeQazanc() {
  const { lang } = useLanguage();
  const pt = t[lang];

  const [views, setViews] = useState("100000");
  const [regionId, setRegionId] = useState("az-tr");
  const [nicheId, setNicheId] = useState("lifestyle");

  const region = regions.find((r) => r.id === regionId)!;
  const niche = niches.find((n) => n.id === nicheId)!;

  const result = useMemo(() => {
    const v = parseFloat(views.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(v) || v <= 0) return null;

    const minCpm = region.cpmMin * niche.multiplier;
    const maxCpm = region.cpmMax * niche.multiplier;
    const avgCpm = (minCpm + maxCpm) / 2;

    const minRev = (v / 1000) * minCpm;
    const maxRev = (v / 1000) * maxCpm;
    const avgRev = (v / 1000) * avgCpm;

    return {
      views: v,
      minCpm, maxCpm, avgCpm,
      minRev, maxRev, avgRev,
      yearlyMin: minRev * 12,
      yearlyMax: maxRev * 12,
      yearlyAvg: avgRev * 12,
    };
  }, [views, region, niche]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[{ label: pt.bcat, href: "/?category=finance" }, { label: pt.blabel }]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["currency", "frilansci-vergi", "salary"]}
    >
      {/* Views */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">📊 {pt.monthlyViews}</label>
        <input
          type="number"
          value={views}
          onChange={(e) => setViews(e.target.value)}
          placeholder={pt.viewsHint}
          min={0}
          step={1000}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
        />
        {result && (
          <p className="text-xs text-muted mt-1">= {fmtViews(result.views)} baxış/ay</p>
        )}
      </div>

      {/* Region */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">🌍 {pt.regionLabel}</label>
        <select
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.flag} {r.name[lang]} (CPM ${r.cpmMin.toFixed(2)}–${r.cpmMax.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* Niche */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">🎯 {pt.nicheLabel}</label>
        <div className="grid grid-cols-2 gap-2">
          {niches.map((n) => (
            <button
              key={n.id}
              onClick={() => setNicheId(n.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                nicheId === n.id ? "border-primary bg-primary-light ring-2 ring-primary" : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{n.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{n.name[lang]}</p>
                  <p className="text-[10px] text-muted">×{n.multiplier.toFixed(1)} CPM</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Effective CPM */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-700 mb-1">{pt.effectiveCpm}</p>
            <p className="text-lg font-bold text-blue-900">
              ${result.minCpm.toFixed(2)} – ${result.maxCpm.toFixed(2)}
            </p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              {region.name[lang]} × {niche.name[lang]} (×{niche.multiplier.toFixed(1)})
            </p>
          </div>

          {/* Monthly */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-emerald-900 mb-3">💵 {pt.perMonth} — {pt.estimatedRevenue}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-xl p-3 border border-emerald-100">
                <p className="text-[10px] text-muted">{pt.minRevenue}</p>
                <p className="text-base font-bold text-emerald-700">{fmtMoney(result.minRev, "USD")}</p>
                <p className="text-[10px] text-muted">{fmtMoney(result.minRev * USD_TO_AZN, "AZN")}</p>
              </div>
              <div className="bg-emerald-600 text-white rounded-xl p-3">
                <p className="text-[10px] opacity-80">{pt.avgRevenue}</p>
                <p className="text-lg font-bold">{fmtMoney(result.avgRev, "USD")}</p>
                <p className="text-[10px] opacity-80">{fmtMoney(result.avgRev * USD_TO_AZN, "AZN")}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-emerald-100">
                <p className="text-[10px] text-muted">{pt.maxRevenue}</p>
                <p className="text-base font-bold text-emerald-700">{fmtMoney(result.maxRev, "USD")}</p>
                <p className="text-[10px] text-muted">{fmtMoney(result.maxRev * USD_TO_AZN, "AZN")}</p>
              </div>
            </div>
          </div>

          {/* Yearly */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-purple-900 mb-3">📅 {pt.perYear} — {pt.estimatedRevenue}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-xl p-3 border border-purple-100">
                <p className="text-[10px] text-muted">{pt.minRevenue}</p>
                <p className="text-base font-bold text-purple-700">{fmtMoney(result.yearlyMin, "USD")}</p>
                <p className="text-[10px] text-muted">{fmtMoney(result.yearlyMin * USD_TO_AZN, "AZN")}</p>
              </div>
              <div className="bg-purple-600 text-white rounded-xl p-3">
                <p className="text-[10px] opacity-80">{pt.avgRevenue}</p>
                <p className="text-lg font-bold">{fmtMoney(result.yearlyAvg, "USD")}</p>
                <p className="text-[10px] opacity-80">{fmtMoney(result.yearlyAvg * USD_TO_AZN, "AZN")}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-purple-100">
                <p className="text-[10px] text-muted">{pt.maxRevenue}</p>
                <p className="text-base font-bold text-purple-700">{fmtMoney(result.yearlyMax, "USD")}</p>
                <p className="text-[10px] text-muted">{fmtMoney(result.yearlyMax * USD_TO_AZN, "AZN")}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            {pt.disclaimer}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📺</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
