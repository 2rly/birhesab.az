"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import {
  plantingSubsidies,
  productSubsidies,
  fallowSubsidies,
  type CropEntry,
  type SubsidyType,
} from "@/data/subsidies-2026";

// 2026 Aqrar Subsidiya Şurası — tam məlumat
// Mənbə: agro.gov.az (01.09.2025 elanı)

const LIBERATED_BONUS = 0.5; // birillik bitkilər və yonca üçün +50%

const t = {
  az: {
    title: "Aqrar subsidiya hesablayıcısı",
    description: "2026 əkin və məhsul subsidiyalarının tam hesablanması — bütün bitki növləri, müasir suvarma və regional dərəcələr daxil.",
    breadcrumbCategory: "Kənd Təsərrüfatı",
    formulaTitle: "Subsidiya necə hesablanır?",
    formulaContent: `Mənbə: Aqrar Subsidiya Şurası, 01.09.2025 (agro.gov.az)

3 növ subsidiya var:

1. ƏKİN SUBSIDIYASI (manat/ha) — sahəyə görə
Düstur: Subsidiya = Dərəcə (AZN/ha) × Sahə (ha)

2. MƏHSUL SUBSIDIYASI (manat/ton) — istehsal həcminə görə
Pambıq, tütün, şəkər çuğunduru, soya, qarğıdalı, günəbaxan, buğda, nar, alma üzrə.
Düstur: Subsidiya = Dərəcə (AZN/ton) × Həcm (ton)

3. DİNCƏ QOYULMUŞ TORPAQ (manat/ha) — yeni proqram
Şamaxı, Şəki, Qobustan və Yardımlı rayonlarında dəmyə ərazilərdə son 3 ildə ardıcıl olaraq buğda və ya arpa əkilmiş torpaqların 2026-cı ildə dincə qoyulması üçün hektar başına 220 AZN.

Əlavə güzəştlər:
• "Böyük Qayıdış" bonusu — işğaldan azad edilmiş kənd və qəsəbələrdə məskunlaşan sakinlər üçün birillik bitkilər və yonca üzrə əkin subsidiyası +50% artırılır.

Şərtlər və məhdudiyyətlər:
• Sertifikatlı toxum tələbi: 10 ha-dan çox buğda və ya 100 ha-dan çox arpa əkən fermerlər sertifikatlı toxum istifadə etməlidir, əks halda əkin əmsalı 0-a bərabər olur.
• Pambıq üzrə məhsul əmsalı yalnız müəyyən rayonlarda tətbiq edilir (Ağcabədi, Ağdam, Beyləqan, Bərdə, Biləsuvar, Goranboy, İmişli, Kürdəmir, Neftçala, Saatlı, Sabirabad, Salyan, Tərtər, Yevlax, Zərdab və s.).
• Tütün üzrə məhsul əmsalı yalnız müəyyən rayonlarda (Ağstafa, Balakən, Gədəbəy, Goranboy, İsmayıllı, Lerik, Masallı, Oğuz, Qax, Qazax, Qəbələ, Qubadlı, Şəki, Tovuz, Yardımlı, Zaqatala, Zəngilan).
• Aqrokimyəvi analiz tələb edilən ərazilərdə analiz olunmadıqda məhsul subsidiyası azaldılır (pambıq −10 AZN/ton, tütün −2 AZN/ton, şəkər çuğunduru −1 AZN/ton, soya −10 AZN/ton).
• İntensiv alma və şaftalı bağlarının subsidiyası 2026-cı ilin 1 iyunundan dayandırılacaq (yalnız işğaldan azad ərazilər və NMR istisna).

Diqqət: Dəqiq məbləğ Aqrar Subsidiya Şurasının qərarı ilə təsdiqlənir. Bu hesablayıcı rəsmi siyahıya əsasən təxmini məbləği göstərir.`,
    subsidyType: "Subsidiya növü",
    typePlanting: "Əkin subsidiyası (manat/ha)",
    typeProduct: "Məhsul subsidiyası (manat/ton)",
    typeFallow: "Dincə qoyulmuş torpaq (manat/ha)",
    cropType: "Bitki / variant",
    selectCrop: "Bitkini seçin",
    area: "Sahə (ha)",
    production: "Məhsul həcmi (ton)",
    ha: "ha",
    ton: "ton",
    rate: "Dərəcə",
    options: "Əlavə şərtlər",
    liberated: '"Böyük Qayıdış" bonusu (+50%)',
    liberatedDesc: "İşğaldan azad ərazilərdə məskunlaşan sakinlər üçün birillik bitkilər və yoncaya tətbiq edilir",
    liberatedNotEligible: "Bu bitki üçün +50% bonus tətbiq edilmir (rəsmi dərəcədə artıq nəzərə alınıb və ya çoxillik bitkidir)",
    certifiedSeed: "Sertifikatlı toxum istifadə edilir",
    certifiedSeedDesc: "10 ha-dan çox buğda və ya 100 ha-dan çox arpa əkəndə tələb olunur",
    certifiedSeedWarning: "⚠️ Sertifikatlı toxum istifadə edilməsə subsidiya 0 olacaq",
    quickAreas: "Sürətli seçim",
    result: "Subsidiya məbləği",
    baseSubsidy: "Əsas subsidiya",
    liberatedBonus: '"Böyük Qayıdış" bonusu (+50%)',
    total: "Yekun subsidiya",
    details: "Hesablama detalları",
    formula: "Düstur",
    emptyState: "Sahə və ya məhsul həcmini daxil edin.",
    note: "* Qiymətlər 01.09.2025 tarixli rəsmi siyahıya əsasən hesablanır. Yekun məbləğ üçün agro.gov.az saytına müraciət edin.",
    cropCount: "bitki variantı",
    sourceLabel: "Mənbə",
    cropName: "Bitki",
    quantity: "Miqdar",
    perUnit: "vahid başına",
  },
  en: {
    title: "Agricultural Subsidy Calculator",
    description: "Full 2026 planting and product subsidy calculation — all crops, irrigation and regional rates.",
    breadcrumbCategory: "Agriculture",
    formulaTitle: "How are subsidies calculated?",
    formulaContent: `Source: Agricultural Subsidy Council, 01.09.2025 (agro.gov.az)

Three subsidy types:
1. Planting subsidy (AZN/ha)
2. Product subsidy (AZN/ton) — cotton, tobacco, sugar beet, soya, corn, sunflower, wheat, pomegranate, apple
3. Fallow land (AZN/ha) — wheat/barley, 3-year rotation in selected districts

Bonuses:
• "Great Return" — +50% for residents of liberated villages (annual crops and alfalfa only)

Conditions:
• Certified seeds required for >10 ha wheat or >100 ha barley
• Cotton & tobacco product subsidies only in specific districts
• Intensive apple and peach orchard subsidies discontinued from 1 June 2026 (except liberated areas and Nakhchivan)`,
    subsidyType: "Subsidy type",
    typePlanting: "Planting subsidy (AZN/ha)",
    typeProduct: "Product subsidy (AZN/ton)",
    typeFallow: "Fallow land (AZN/ha)",
    cropType: "Crop / variant",
    selectCrop: "Select crop",
    area: "Area (ha)",
    production: "Production (tons)",
    ha: "ha",
    ton: "tons",
    rate: "Rate",
    options: "Additional conditions",
    liberated: '"Great Return" bonus (+50%)',
    liberatedDesc: "For residents of liberated areas — annual crops and alfalfa only",
    liberatedNotEligible: "+50% bonus does not apply to this crop (already included in rate or perennial)",
    certifiedSeed: "Certified seed used",
    certifiedSeedDesc: "Required for >10 ha wheat or >100 ha barley",
    certifiedSeedWarning: "⚠️ Without certified seed the subsidy will be 0",
    quickAreas: "Quick select",
    result: "Subsidy amount",
    baseSubsidy: "Base subsidy",
    liberatedBonus: '"Great Return" bonus (+50%)',
    total: "Total subsidy",
    details: "Calculation details",
    formula: "Formula",
    emptyState: "Enter area or production volume.",
    note: "* Rates from official 01.09.2025 list. For final amounts visit agro.gov.az.",
    cropCount: "crop variants",
    sourceLabel: "Source",
    cropName: "Crop",
    quantity: "Quantity",
    perUnit: "per unit",
  },
  ru: {
    title: "Калькулятор аграрных субсидий",
    description: "Полный расчёт субсидий 2026 — все культуры, ирригация и региональные ставки.",
    breadcrumbCategory: "Сельское хозяйство",
    formulaTitle: "Как рассчитываются субсидии?",
    formulaContent: `Источник: Совет по аграрным субсидиям, 01.09.2025 (agro.gov.az)

Три типа субсидий:
1. Субсидия за посев (AZN/га)
2. Субсидия за продукт (AZN/т) — хлопок, табак, свёкла, соя, кукуруза, подсолнух, пшеница, гранат, яблоки
3. Земля под паром (AZN/га) — пшеница/ячмень, 3-летняя ротация

Бонусы:
• "Великое Возвращение" — +50% для жителей освобождённых сёл (только однолетние культуры и люцерна)

Условия:
• Сертифицированные семена обязательны при >10 га пшеницы или >100 га ячменя
• Субсидии на хлопок и табак — только в определённых районах
• Субсидия на интенсивные яблочные и персиковые сады прекращается с 1 июня 2026 (кроме освобождённых территорий и НАР)`,
    subsidyType: "Тип субсидии",
    typePlanting: "Субсидия за посев (AZN/га)",
    typeProduct: "Субсидия за продукт (AZN/т)",
    typeFallow: "Земля под паром (AZN/га)",
    cropType: "Культура / вариант",
    selectCrop: "Выберите культуру",
    area: "Площадь (га)",
    production: "Объём (т)",
    ha: "га",
    ton: "т",
    rate: "Ставка",
    options: "Дополнительные условия",
    liberated: 'Бонус "Великое Возвращение" (+50%)',
    liberatedDesc: "Для жителей освобождённых сёл — только однолетние культуры и люцерна",
    liberatedNotEligible: "Бонус +50% не применяется к этой культуре",
    certifiedSeed: "Используются сертифицированные семена",
    certifiedSeedDesc: "Требуется при >10 га пшеницы или >100 га ячменя",
    certifiedSeedWarning: "⚠️ Без сертифицированных семян субсидия будет 0",
    quickAreas: "Быстрый выбор",
    result: "Сумма субсидии",
    baseSubsidy: "Базовая субсидия",
    liberatedBonus: 'Бонус "Великое Возвращение" (+50%)',
    total: "Итого",
    details: "Детали расчёта",
    formula: "Формула",
    emptyState: "Введите площадь или объём.",
    note: "* Ставки из официального списка от 01.09.2025. agro.gov.az.",
    cropCount: "вариантов",
    sourceLabel: "Источник",
    cropName: "Культура",
    quantity: "Количество",
    perUnit: "за единицу",
  },
};

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

function getCropList(type: SubsidyType): CropEntry[] {
  if (type === "planting") return plantingSubsidies;
  if (type === "product") return productSubsidies;
  return fallowSubsidies;
}

function groupCrops(list: CropEntry[]): Record<string, CropEntry[]> {
  const groups: Record<string, CropEntry[]> = {};
  for (const c of list) {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  }
  return groups;
}

export default function AgrarianSubsidyCalculator() {
  const { lang } = useLanguage();
  const pt = t[lang];

  const [type, setType] = useState<SubsidyType>("planting");
  const [cropId, setCropId] = useState<string>(plantingSubsidies[0].id);
  const [quantity, setQuantity] = useState<string>("");
  const [liberated, setLiberated] = useState<boolean>(false);
  const [certifiedSeed, setCertifiedSeed] = useState<boolean>(true);

  const cropList = useMemo(() => getCropList(type), [type]);
  const grouped = useMemo(() => groupCrops(cropList), [cropList]);
  const crop = useMemo(
    () => cropList.find((c) => c.id === cropId) || cropList[0],
    [cropList, cropId]
  );

  const handleTypeChange = (newType: SubsidyType) => {
    setType(newType);
    const list = getCropList(newType);
    setCropId(list[0].id);
    setLiberated(false);
  };

  const isWheatOrBarley = crop.id.includes("wheat") || crop.id.includes("barley") || crop.id.includes("grain");
  const showCertifiedSeed = type === "planting" && isWheatOrBarley;

  const result = useMemo(() => {
    const q = parseFloat(quantity);
    if (!q || q <= 0) return null;

    // Sertifikatlı toxum tələbi pozulduqda subsidiya 0 olur
    if (showCertifiedSeed && !certifiedSeed) {
      return {
        baseSubsidy: 0,
        liberatedBonus: 0,
        total: 0,
        zeroedByRule: true,
      };
    }

    const baseSubsidy = crop.rate * q;
    const liberatedBonus = liberated && crop.liberatedEligible ? baseSubsidy * LIBERATED_BONUS : 0;
    const total = baseSubsidy + liberatedBonus;

    return { baseSubsidy, liberatedBonus, total, zeroedByRule: false };
  }, [quantity, crop, liberated, certifiedSeed, showCertifiedSeed]);

  const quickValues = crop.unit === "ha" ? [1, 5, 10, 50, 100] : [1, 10, 50, 100, 500];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=agriculture" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["vat", "salary", "freelancer-tax", "currency"]}
    >
      {/* Subsidy type selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.subsidyType}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {([
            { id: "planting", label: pt.typePlanting, icon: "🌾" },
            { id: "product", label: pt.typeProduct, icon: "📦" },
            { id: "fallow", label: pt.typeFallow, icon: "🏞️" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleTypeChange(opt.id)}
              className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                type === opt.id
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-muted border-border hover:border-primary/30"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crop selector */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-foreground">{pt.cropType}</label>
          <span className="text-xs px-2 py-1 rounded-full bg-primary-light text-primary font-medium">
            {cropList.length} {pt.cropCount}
          </span>
        </div>
        <select
          value={cropId}
          onChange={(e) => setCropId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
        >
          {Object.entries(grouped).map(([groupName, list]) => (
            <optgroup key={groupName} label={groupName}>
              {list.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
            {pt.rate}: {formatMoney(crop.rate)}/{crop.unit === "ha" ? pt.ha : pt.ton}
          </span>
          {crop.liberatedEligible && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              ✓ Böyük Qayıdış uyğun
            </span>
          )}
        </div>
      </div>

      {/* Quantity input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          {crop.unit === "ha" ? pt.area : pt.production}
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={crop.unit === "ha" ? "10" : "100"}
          min="0"
          step="0.1"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base mb-3"
        />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted self-center mr-1">{pt.quickAreas}:</span>
          {quickValues.map((qv) => (
            <button
              key={qv}
              onClick={() => setQuantity(String(qv))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                quantity === String(qv)
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border bg-white text-muted hover:border-primary/30"
              }`}
            >
              {qv} {crop.unit === "ha" ? pt.ha : pt.ton}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.options}</label>
        <div className="space-y-2">
          {/* Liberated bonus */}
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border bg-white transition-colors ${
              crop.liberatedEligible ? "border-border cursor-pointer hover:border-primary/40" : "border-border opacity-50 cursor-not-allowed"
            }`}
          >
            <input
              type="checkbox"
              checked={liberated && !!crop.liberatedEligible}
              disabled={!crop.liberatedEligible}
              onChange={(e) => setLiberated(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{pt.liberated}</p>
              <p className="text-xs text-muted mt-0.5">
                {crop.liberatedEligible ? pt.liberatedDesc : pt.liberatedNotEligible}
              </p>
            </div>
          </label>

          {/* Certified seed (only for wheat/barley) */}
          {showCertifiedSeed && (
            <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={certifiedSeed}
                onChange={(e) => setCertifiedSeed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{pt.certifiedSeed}</p>
                <p className="text-xs text-muted mt-0.5">{pt.certifiedSeedDesc}</p>
                {!certifiedSeed && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{pt.certifiedSeedWarning}</p>
                )}
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Result */}
      {result ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-green-100 mb-1">{pt.total}</p>
            <p className="text-3xl font-bold">{formatMoney(result.total)}</p>
            {!result.zeroedByRule && (
              <p className="text-xs text-green-100 mt-2">
                {formatMoney(crop.rate)} × {quantity} {crop.unit === "ha" ? pt.ha : pt.ton}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.details}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.cropName}</span>
                <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{crop.name}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.rate}</span>
                <span className="text-sm font-medium text-foreground">
                  {formatMoney(crop.rate)} / {crop.unit === "ha" ? pt.ha : pt.ton}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.quantity}</span>
                <span className="text-sm font-medium text-foreground">
                  {quantity} {crop.unit === "ha" ? pt.ha : pt.ton}
                </span>
              </div>
              {!result.zeroedByRule && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.baseSubsidy}</span>
                    <span className="text-sm font-medium text-foreground">{formatMoney(result.baseSubsidy)}</span>
                  </div>
                  {result.liberatedBonus > 0 && (
                    <div className="flex justify-between px-5 py-3 bg-amber-50">
                      <span className="text-sm text-amber-700">{pt.liberatedBonus}</span>
                      <span className="text-sm font-medium text-amber-700">+{formatMoney(result.liberatedBonus)}</span>
                    </div>
                  )}
                </>
              )}
              {result.zeroedByRule && (
                <div className="flex justify-between px-5 py-3 bg-red-50">
                  <span className="text-sm text-red-700">{pt.certifiedSeedWarning}</span>
                  <span className="text-sm font-bold text-red-700">0 AZN</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">{pt.total}</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(result.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted">{pt.note}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🌾</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
