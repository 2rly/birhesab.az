"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// Fitrə zəkatı — Qafqaz Müsəlmanları İdarəsi tərəfindən hər il elan olunur
// 2024-cü il üçün təxmini məbləğlər

const FITRE_RATES_TR: Record<Lang, { id: string; label: string; amount: number; description: string }[]> = {
  az: [
    { id: "minimum", label: "Minimum (buğda)", amount: 5, description: "Buğda və ya un əsasında" },
    { id: "standard", label: "Standart (arpa)", amount: 7, description: "Arpa əsasında — ən çox istifadə olunan" },
    { id: "medium", label: "Orta (kişmiş)", amount: 12, description: "Kişmiş əsasında" },
    { id: "high", label: "Yüksək (xurma)", amount: 20, description: "Xurma əsasında" },
  ],
  en: [
    { id: "minimum", label: "Minimum (wheat)", amount: 5, description: "Based on wheat or flour" },
    { id: "standard", label: "Standard (barley)", amount: 7, description: "Based on barley — most commonly used" },
    { id: "medium", label: "Medium (raisins)", amount: 12, description: "Based on raisins" },
    { id: "high", label: "High (dates)", amount: 20, description: "Based on dates" },
  ],
  ru: [
    { id: "minimum", label: "Минимум (пшеница)", amount: 5, description: "На основе пшеницы или муки" },
    { id: "standard", label: "Стандарт (ячмень)", amount: 7, description: "На основе ячменя — наиболее распространённый" },
    { id: "medium", label: "Средний (изюм)", amount: 12, description: "На основе изюма" },
    { id: "high", label: "Высокий (финики)", amount: 20, description: "На основе фиников" },
  ],
};

const pageTranslations = {
  az: {
    title: "Fitrə zəkatı hesablayıcısı",
    description: "Ailə üzvlərinin sayına görə fitrə zəkatı məbləğini hesablayın.",
    breadcrumbCategory: "Din",
    formulaTitle: "Fitrə zəkatı nədir?",
    formulaContent: `Fitrə zəkatı (sədəqətül-fitr) Ramazan ayının sonunda hər bir müsəlmanın
öz ailə üzvləri adından verdiyi vacib sədəqədir.

Kimin üçün verilir:
• Ailə başçısı özü və himayəsindəki hər kəs üçün verir
• Uşaqlar, yaşlılar, himayədəki şəxslər daxildir
• Bayram namazından əvvəl verilməlidir

Fitrə məbləği:
• Buğda əsasında (minimum): ~5 AZN/nəfər
• Arpa əsasında (standart): ~7 AZN/nəfər
• Kişmiş əsasında: ~12 AZN/nəfər
• Xurma əsasında: ~20 AZN/nəfər

Hesablama: Fitrə = Ailə üzvü sayı × Nəfər başına məbləğ

Qeyd: Dəqiq məbləğ hər il Qafqaz Müsəlmanları İdarəsi tərəfindən elan olunur.`,
    familyMembers: "Ailə üzvləri",
    adults: "Böyüklər (18+ yaş)",
    children: "Uşaqlar (18 yaşadək)",
    person: "nəfər",
    fitrAmountPerPerson: "Fitrə miqdarı (nəfər başına)",
    orEnterCustom: "Və ya öz məbləğinizi daxil edin (AZN/nəfər)",
    customAmount: "Xüsusi məbləğ",
    totalFitre: "Ümumi fitrə zəkatı",
    familyMemberCount: "Ailə üzvü sayı",
    perPerson: "Nəfər başına",
    total: "Ümumi",
    detailedCalc: "Ətraflı hesablama",
    adultsCalc: "Böyüklər",
    childrenCalc: "Uşaqlar",
    totalFitreZakat: "Ümumi fitrə zəkatı",
    comparisonTitle: "Müxtəlif dərəcələr üzrə müqayisə",
    personsLabel: "nəfər",
    selected: "Seçilmiş",
    aboutFitre: "Fitrə zəkatı haqqında",
    aboutItems: [
      "Ramazan bayramı namazından əvvəl verilməlidir",
      "Hər ailə üzvü üçün (uşaqlar daxil) ayrıca verilir",
      "Ailə başçısı himayəsindəki hər kəs üçün verir",
      "Yoxsullara, ehtiyacı olanlara verilir",
      "Dəqiq məbləğ hər il QMİ tərəfindən elan olunur",
    ],
    emptyStateText: "Nəticəni görmək üçün ailə üzvü sayını daxil edin.",
    adult: "böyük",
    child: "uşaq",
  },
  en: {
    title: "Fitr Zakat Calculator",
    description: "Calculate the fitr zakat amount based on the number of family members.",
    breadcrumbCategory: "Religion",
    formulaTitle: "What is fitr zakat?",
    formulaContent: `Fitr zakat (sadaqat al-fitr) is an obligatory charity given by every Muslim
on behalf of their family members at the end of Ramadan.

Who it is given for:
• The head of the family gives for themselves and all dependents
• Children, elderly, and dependents are included
• Must be given before the Eid prayer

Fitr amounts:
• Based on wheat (minimum): ~5 AZN/person
• Based on barley (standard): ~7 AZN/person
• Based on raisins: ~12 AZN/person
• Based on dates: ~20 AZN/person

Calculation: Fitr = Number of family members × Amount per person

Note: The exact amount is announced annually by the Caucasus Muslims Board.`,
    familyMembers: "Family members",
    adults: "Adults (18+)",
    children: "Children (under 18)",
    person: "persons",
    fitrAmountPerPerson: "Fitr amount (per person)",
    orEnterCustom: "Or enter your own amount (AZN/person)",
    customAmount: "Custom amount",
    totalFitre: "Total fitr zakat",
    familyMemberCount: "Family member count",
    perPerson: "Per person",
    total: "Total",
    detailedCalc: "Detailed calculation",
    adultsCalc: "Adults",
    childrenCalc: "Children",
    totalFitreZakat: "Total fitr zakat",
    comparisonTitle: "Comparison across different rates",
    personsLabel: "persons",
    selected: "Selected",
    aboutFitre: "About fitr zakat",
    aboutItems: [
      "Must be given before the Eid prayer",
      "Given separately for each family member (including children)",
      "The head of the family gives for all dependents",
      "Given to the poor and those in need",
      "The exact amount is announced annually by the CMB",
    ],
    emptyStateText: "Enter the number of family members to see the result.",
    adult: "adults",
    child: "children",
  },
  ru: {
    title: "Калькулятор закята аль-фитр",
    description: "Рассчитайте сумму закята аль-фитр по количеству членов семьи.",
    breadcrumbCategory: "Религия",
    formulaTitle: "Что такое закят аль-фитр?",
    formulaContent: `Закят аль-фитр (садакат аль-фитр) — обязательная милостыня, которую каждый мусульманин
даёт от имени членов своей семьи в конце Рамадана.

За кого даётся:
• Глава семьи даёт за себя и всех иждивенцев
• Дети, пожилые и иждивенцы включены
• Должен быть дан до праздничной молитвы

Суммы фитр:
• На основе пшеницы (минимум): ~5 AZN/чел.
• На основе ячменя (стандарт): ~7 AZN/чел.
• На основе изюма: ~12 AZN/чел.
• На основе фиников: ~20 AZN/чел.

Расчёт: Фитр = Количество членов семьи × Сумма на человека

Примечание: Точная сумма ежегодно объявляется Управлением мусульман Кавказа.`,
    familyMembers: "Члены семьи",
    adults: "Взрослые (18+)",
    children: "Дети (до 18 лет)",
    person: "чел.",
    fitrAmountPerPerson: "Сумма фитр (на человека)",
    orEnterCustom: "Или введите свою сумму (AZN/чел.)",
    customAmount: "Своя сумма",
    totalFitre: "Общий закят аль-фитр",
    familyMemberCount: "Количество членов семьи",
    perPerson: "На человека",
    total: "Итого",
    detailedCalc: "Подробный расчёт",
    adultsCalc: "Взрослые",
    childrenCalc: "Дети",
    totalFitreZakat: "Общий закят аль-фитр",
    comparisonTitle: "Сравнение по разным ставкам",
    personsLabel: "чел.",
    selected: "Выбрано",
    aboutFitre: "О закяте аль-фитр",
    aboutItems: [
      "Должен быть дан до праздничной молитвы",
      "Даётся отдельно за каждого члена семьи (включая детей)",
      "Глава семьи даёт за всех иждивенцев",
      "Даётся бедным и нуждающимся",
      "Точная сумма ежегодно объявляется УМК",
    ],
    emptyStateText: "Введите количество членов семьи, чтобы увидеть результат.",
    adult: "взр.",
    child: "дет.",
  },
};

function fmt2(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function ZakatCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const fitrRates = FITRE_RATES_TR[lang];

  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("2");
  const [selectedRate, setSelectedRate] = useState("standard");
  const [customAmount, setCustomAmount] = useState("");

  const result = useMemo(() => {
    const adultCount = parseInt(adults) || 0;
    const childCount = parseInt(children) || 0;
    const totalPersons = adultCount + childCount;

    if (totalPersons <= 0) return null;

    const rate = fitrRates.find((r) => r.id === selectedRate);
    const perPerson = customAmount ? parseFloat(customAmount) || 0 : rate?.amount || 7;

    const totalFitre = totalPersons * perPerson;

    return {
      adultCount,
      childCount,
      totalPersons,
      perPerson,
      totalFitre,
    };
  }, [adults, children, selectedRate, customAmount, fitrRates]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=religion" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["ramadan", "age", "percentage", "currency"]}
    >
      {/* Family Members */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.familyMembers}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl border border-border p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              👨‍👩 {pt.adults}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdults(String(Math.max(0, (parseInt(adults) || 0) - 1)))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                min="0"
                max="20"
                className="w-16 text-center px-2 py-2 rounded-xl border border-border bg-white text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setAdults(String((parseInt(adults) || 0) + 1))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted">{pt.person}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl border border-border p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              👶 {pt.children}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChildren(String(Math.max(0, (parseInt(children) || 0) - 1)))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                min="0"
                max="20"
                className="w-16 text-center px-2 py-2 rounded-xl border border-border bg-white text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setChildren(String((parseInt(children) || 0) + 1))}
                className="w-10 h-10 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted">{pt.person}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          {pt.fitrAmountPerPerson}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {fitrRates.map((rate) => (
            <button
              key={rate.id}
              onClick={() => { setSelectedRate(rate.id); setCustomAmount(""); }}
              className={`p-4 rounded-xl border text-center transition-all ${
                selectedRate === rate.id && !customAmount
                  ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                  : "border-border bg-white hover:border-green-300"
              }`}
            >
              <p className="text-2xl font-bold text-foreground">{rate.amount}</p>
              <p className="text-[10px] text-muted">AZN</p>
              <p className="text-xs font-medium text-foreground mt-1">{rate.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{rate.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          {pt.orEnterCustom}
        </label>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder={pt.customAmount}
          min="0"
          className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Result */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-green-100 mb-1">{pt.totalFitre}</p>
            <p className="text-5xl font-bold">{fmt2(result.totalFitre)}</p>
            <p className="text-sm text-green-200 mt-1">AZN</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.familyMemberCount}</p>
              <p className="text-2xl font-bold text-foreground">{result.totalPersons}</p>
              <p className="text-xs text-muted mt-1">
                {result.adultCount} {pt.adult} + {result.childCount} {pt.child}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.perPerson}</p>
              <p className="text-2xl font-bold text-foreground">{fmt2(result.perPerson)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
              <p className="text-xs text-green-600 mb-1">{pt.total}</p>
              <p className="text-2xl font-bold text-green-700">{fmt2(result.totalFitre)}</p>
              <p className="text-xs text-green-600 mt-1">AZN</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedCalc}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {result.adultCount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.adultsCalc} ({result.adultCount} × {fmt2(result.perPerson)} AZN)</span>
                  <span className="text-sm font-medium text-foreground">{fmt2(result.adultCount * result.perPerson)} AZN</span>
                </div>
              )}
              {result.childCount > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.childrenCalc} ({result.childCount} × {fmt2(result.perPerson)} AZN)</span>
                  <span className="text-sm font-medium text-foreground">{fmt2(result.childCount * result.perPerson)} AZN</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-4 bg-green-50">
                <span className="text-sm font-semibold text-green-700">{pt.totalFitreZakat}</span>
                <span className="text-sm font-bold text-green-700">{fmt2(result.totalFitre)} AZN</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.comparisonTitle} ({result.totalPersons} {pt.personsLabel})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {fitrRates.map((rate) => {
                const total = result.totalPersons * rate.amount;
                const isActive = selectedRate === rate.id && !customAmount;
                return (
                  <div key={rate.id} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-green-50" : ""}`}>
                    <div>
                      <p className={`text-sm ${isActive ? "font-semibold" : ""} text-foreground`}>{rate.label}</p>
                      <p className="text-xs text-muted">{rate.amount} AZN/{pt.person}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{fmt2(total)} AZN</p>
                      {isActive && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full">{pt.selected}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span>🤲</span>
              {pt.aboutFitre}
            </h4>
            <ul className="text-xs text-amber-700 space-y-1.5">
              {pt.aboutItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🤲</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
