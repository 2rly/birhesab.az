"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// Azərbaycan Ailə Məcəlləsi (Maddə 31-37) — boşanma zamanı əmlak bölgüsü
// Birgə mülkiyyət — nikah dövründə əldə edilmiş, alqı yolu ilə (hədiyyə/miras/özəlləşdirmə xaric)
// Şəxsi mülkiyyət — nikahdan əvvəl, hədiyyə/miras yolu ilə, fərdi əşyalar (zinət xaric)

type AcquiredWhen = "before" | "during";
type Source = "purchase" | "gift" | "inheritance" | "privatization";

interface PropertyItem {
  id: string;
  name: string;
  value: number;
  when: AcquiredWhen;
  source: Source;
  isPersonal: boolean; // şəxsi istifadə əşyası (paltar, və s.) — zinət istisna
  assignTo: "A" | "B"; // boşanmadan sonra əmlak kimə qalır
  hasMortgage: boolean; // bu konkret əmlak ipotekadadır
  mortgageRemaining: number; // qalıq borc
}

const t = {
  az: {
    title: "Boşanma və əmlak bölgüsü hesablayıcısı",
    description: "Birgə və şəxsi mülkiyyətin ayrılması, ipoteka bölgüsü və uşaq faktorunun nəzərə alınması.",
    breadcrumbCategory: "Hüquq və Dövlət",
    formulaTitle: "Əmlak bölgüsü necə aparılır?",
    formulaContent: `Mənbə: Azərbaycan Respublikasının Ailə Məcəlləsi (Maddə 31-37)

1. Birgə mülkiyyət vs Şəxsi mülkiyyət

Birgə mülkiyyət (50/50 bölünür):
• Nikah dövründə alqı yolu ilə əldə edilmiş əmlak
• Birgə qazanılmış gəlir, əmanətlər, qiymətli kağızlar
• Mülkiyyətin kimin adına yazıldığının fərqi yoxdur

Şəxsi mülkiyyət (BÖLÜNMÜR):
• Nikahdan əvvəl mövcud olan əmlak
• Nikah dövründə də olsa hədiyyə, miras və ya əvəzsiz özəlləşdirmə yolu ilə əldə edilən
• Şəxsi istifadə əşyaları (paltar, ayaqqabı və s.) — ZİNƏT ƏŞYALARI istisna olmaqla bölünür

2. Uşaq faktoru və yaşayış hüququ

• Azərbaycanda uşaqların olması mülkiyyət payını avtomatik artırmır
• Lakin məhkəmə uşaqların mənafeyinə görə valideynlərdən birinə (uşaqların qaldığı tərəfə) həmin mənzildə yaşamaq hüququ verə bilər
• Nadir hallarda pay 60/40 nisbətində dəyişdirilir
• Bu hesablayıcıda istəyə bağlı pay düzəlişi mövcuddur

3. İpoteka və kredit

Nikah dövründə ödənilən ipoteka məbləği BİRGƏ borc/aktiv hesab olunur.
• Nikah dövründə ödənilmiş hissə yarı bölünür
• Qalıq borc evdə qalan tərəfə keçirsə, onun payı qalıq borcun yarısı qədər azalır

Düstur:
1. Hər tərəfin payı = (Birgə əmlakın cəmi − Qalıq ipoteka borcu) × 50%
2. Şəxsi əmlak — sahibinə qalır
3. Uşaq tənzimləməsi (istəyə bağlı): pay 50% yerinə 55-60%

Diqqət: Real bölgü məhkəmə qərarı ilə dəqiqləşir. Bu hesablayıcı qanunvericilik əsasında təxmini bölgü göstərir.`,
    properties: "Əmlak siyahısı",
    propertiesHint: "Bütün əmlakları bir-bir əlavə edin (5 mənzil, 6 maşın və s.) — hər biri ayrıca qiymətləndirilir",
    addProperty: "Boş əlavə et",
    quickAdd: "Sürətli əlavə",
    itemCount: "əmlak siyahıda",
    presetApartment: "Mənzil",
    presetCar: "Maşın",
    presetLand: "Torpaq",
    presetHouse: "Ev",
    presetBank: "Bank əmanəti",
    presetBusiness: "Biznes payı",
    presetJewelry: "Zinət əşyaları",
    presetFurniture: "Mebel/texnika",
    clearAll: "Hamısını sil",
    propertyName: "Əmlak adı",
    propertyValue: "Dəyər (AZN)",
    when: "Nə vaxt əldə edilib?",
    beforeMarriage: "Nikahdan əvvəl",
    duringMarriage: "Nikah dövründə",
    source: "Necə əldə edilib?",
    purchase: "Alqı (qazanc hesabına)",
    gift: "Hədiyyə",
    inheritance: "Miras",
    privatization: "Əvəzsiz özəlləşdirmə",
    isPersonal: "Şəxsi istifadə əşyası (zinət xaric)",
    isPersonalDesc: "Paltar, ayaqqabı və s. — bölünmür",
    placeholderName: "Məs: Mənzil",
    remove: "Sil",
    mortgage: "İpoteka / Kredit",
    hasMortgage: "Bu əmlak ipotekadadır",
    mortgagePaid: "Nikah dövründə ödənilmiş hissə (AZN)",
    mortgageRemaining: "Qalıq borc (AZN)",
    whoKeepsProperty: "Bu əmlak kimə qalır?",
    spouseA: "1-ci tərəf (ər)",
    spouseB: "2-ci tərəf (arvad)",
    assignTo: "Bu əmlak kimə qalır?",
    receives: "alır",
    receivedItems: "Aldığı əmlaklar",
    receivedTotal: "Cəmi əldə etdiyi",
    fairShare: "Hüquqi pay",
    actualReceived: "Faktiki alır",
    equalization: "Tarazlaşdırma (kompensasiya)",
    aPaysB: "1-ci tərəf 2-ci tərəfə ödəyir",
    bPaysA: "2-ci tərəf 1-ci tərəfə ödəyir",
    balanced: "Tarazdır — kompensasiya yoxdur",
    finalA: "1-ci tərəf — yekun",
    finalB: "2-ci tərəf — yekun",
    debtTaken: "Götürdüyü borc",
    netValue: "Xalis dəyər",
    splitRule: "Bölgü qaydası",
    fiftyFifty: "50/50 bərabər",
    fromJointPool: "birgə əmlak hovuzundan",
    personalKept: "şəxsi əmlak (öz mülkiyyətində qalır)",
    mortgagedAsset: "ipotekalı əmlak",
    children: "Uşaqlar",
    childrenCount: "Uşaqların sayı",
    childrenWith: "Uşaqlar kiminlə qalır?",
    none: "Yoxdur",
    bothEqual: "Bərabər (heç biri)",
    adjustShare: "Uşaqların qaldığı tərəfə pay artırımı",
    adjustShareDesc: "Məhkəmə qərarı ilə nadir hallarda 50%-dən artıq verilə bilər",
    noAdjust: "Bərabər (50/50)",
    adjust55: "55/45 (yüngül artım)",
    adjust60: "60/40 (maksimum)",
    result: "Bölgü nəticəsi",
    jointProperty: "Birgə mülkiyyət",
    personalProperty: "Şəxsi mülkiyyət",
    netJoint: "Bölünməli xalis məbləğ",
    mortgageDeduction: "Qalıq ipoteka",
    spouseAShare: "1-ci tərəfin payı",
    spouseBShare: "2-ci tərəfin payı",
    classification: "Təsnifat",
    joint: "BİRGƏ (bölünür)",
    personal: "ŞƏXSİ (bölünmür)",
    summary: "Hesablama xülasəsi",
    totalProperties: "Cəmi əmlak dəyəri",
    note: "* Real bölgü məhkəmə qərarı və qarşılıqlı razılıqla dəqiqləşir. Bu hesablayıcı təxmini ilkin məlumat verir.",
    housingRightNote: "ℹ️ Yaşayış hüququ qeydi: Uşaqların yanında qalan valideyn evin sahibi olmasa da, məhkəmə uşaqların mənafeyinə əsasən ona həmin mənzildə yaşamaq hüququ verə bilər.",
    emptyState: "Bölgüyə daxil etmək üçün ən azı bir əmlak əlavə edin.",
    mortgageNote: "Nikah dövründə ödənilmiş ipoteka məbləği birgə investisiya kimi nəzərə alınır.",
  },
  en: {
    title: "Divorce & Property Division Calculator",
    description: "Separate joint vs personal property, divide mortgages and consider the children factor.",
    breadcrumbCategory: "Legal & Government",
    formulaTitle: "How is property divided?",
    formulaContent: `Source: Family Code of the Republic of Azerbaijan (Articles 31-37)

1. Joint vs Personal property

Joint property (split 50/50):
• Property acquired through purchase during marriage
• Joint earnings, savings, securities
• It does not matter in whose name the property is registered

Personal property (NOT divided):
• Property owned before marriage
• Property received through gift, inheritance or free privatization (even during marriage)
• Personal use items (clothes, shoes, etc.) — JEWELRY is divided

2. Children factor and housing right

• In Azerbaijan, having children does not automatically increase a spouse's property share
• However, the court may grant the parent with whom the children live the right to use the dwelling, even if the other spouse owns it
• Rarely, the share may be adjusted to 60/40
• This calculator offers an optional share adjustment

3. Mortgage and credit

Mortgage paid during marriage is treated as a JOINT debt/asset.
• Amount paid during marriage is split equally
• If the remaining debt stays with the spouse keeping the property, their share decreases by half of the remaining debt`,
    properties: "Property list",
    propertiesHint: "Add every property one by one (5 apartments, 6 cars, etc.) — each is evaluated separately",
    addProperty: "Add empty",
    quickAdd: "Quick add",
    itemCount: "items in list",
    presetApartment: "Apartment",
    presetCar: "Car",
    presetLand: "Land",
    presetHouse: "House",
    presetBank: "Bank deposit",
    presetBusiness: "Business share",
    presetJewelry: "Jewelry",
    presetFurniture: "Furniture/appliances",
    clearAll: "Clear all",
    propertyName: "Property name",
    propertyValue: "Value (AZN)",
    when: "When was it acquired?",
    beforeMarriage: "Before marriage",
    duringMarriage: "During marriage",
    source: "How was it acquired?",
    purchase: "Purchase (from earnings)",
    gift: "Gift",
    inheritance: "Inheritance",
    privatization: "Free privatization",
    isPersonal: "Personal use item (excluding jewelry)",
    isPersonalDesc: "Clothes, shoes, etc. — not divided",
    placeholderName: "e.g. Apartment",
    remove: "Remove",
    mortgage: "Mortgage / Credit",
    hasMortgage: "This property has a mortgage",
    mortgagePaid: "Amount paid during marriage (AZN)",
    mortgageRemaining: "Remaining debt (AZN)",
    whoKeepsProperty: "Who keeps this property?",
    spouseA: "Spouse A (husband)",
    spouseB: "Spouse B (wife)",
    assignTo: "Who keeps this property?",
    receives: "receives",
    receivedItems: "Items received",
    receivedTotal: "Total received",
    fairShare: "Legal share",
    actualReceived: "Actually receives",
    equalization: "Equalization (compensation)",
    aPaysB: "Spouse A pays Spouse B",
    bPaysA: "Spouse B pays Spouse A",
    balanced: "Balanced — no compensation",
    finalA: "Spouse A — final",
    finalB: "Spouse B — final",
    debtTaken: "Debt taken on",
    netValue: "Net value",
    splitRule: "Division rule",
    fiftyFifty: "50/50 equal",
    fromJointPool: "from joint pool",
    personalKept: "personal property (kept by owner)",
    mortgagedAsset: "mortgaged asset",
    children: "Children",
    childrenCount: "Number of children",
    childrenWith: "Children stay with",
    none: "None",
    bothEqual: "Equal (neither)",
    adjustShare: "Share increase for the parent with children",
    adjustShareDesc: "Rarely granted by court above 50%",
    noAdjust: "Equal (50/50)",
    adjust55: "55/45 (slight increase)",
    adjust60: "60/40 (maximum)",
    result: "Division result",
    jointProperty: "Joint property",
    personalProperty: "Personal property",
    netJoint: "Net amount to divide",
    mortgageDeduction: "Remaining mortgage",
    spouseAShare: "Spouse A share",
    spouseBShare: "Spouse B share",
    classification: "Classification",
    joint: "JOINT (divided)",
    personal: "PERSONAL (kept)",
    summary: "Calculation summary",
    totalProperties: "Total property value",
    note: "* Final division is determined by court and mutual agreement. This calculator provides an approximate estimate.",
    housingRightNote: "ℹ️ Housing right note: Even if the parent staying with the children does not own the dwelling, the court may grant them the right to live there in the children's interest.",
    emptyState: "Add at least one property to start the division.",
    mortgageNote: "Mortgage payments made during marriage count as a joint investment.",
  },
  ru: {
    title: "Калькулятор раздела имущества при разводе",
    description: "Разделение совместной и личной собственности, раздел ипотеки и фактор детей.",
    breadcrumbCategory: "Право и Государство",
    formulaTitle: "Как делится имущество?",
    formulaContent: `Источник: Семейный кодекс Азербайджанской Республики (Статьи 31-37)

1. Совместная vs Личная собственность

Совместная собственность (делится 50/50):
• Имущество, приобретённое в браке за общие средства
• Совместные доходы, сбережения, ценные бумаги
• Не имеет значения, на чьё имя оформлено

Личная собственность (НЕ делится):
• Имущество, имевшееся до брака
• Полученное в дар, по наследству или путём бесплатной приватизации (даже в браке)
• Личные вещи (одежда, обувь и т.д.) — ДРАГОЦЕННОСТИ делятся

2. Фактор детей и право на жильё

• В Азербайджане наличие детей автоматически не увеличивает долю
• Однако суд может предоставить родителю, с которым остаются дети, право пользоваться жильём
• В редких случаях доля может быть изменена 60/40
• Калькулятор предлагает опциональную корректировку

3. Ипотека и кредиты

Ипотека, выплаченная в браке, считается СОВМЕСТНЫМ долгом/активом.
• Сумма, выплаченная в браке, делится поровну
• Если оставшийся долг остаётся за супругом, оставшимся с имуществом, его доля уменьшается на половину остатка`,
    properties: "Список имущества",
    propertiesHint: "Добавьте каждый объект отдельно (5 квартир, 6 машин и т.д.) — каждый оценивается отдельно",
    addProperty: "Добавить пустой",
    quickAdd: "Быстрое добавление",
    itemCount: "объектов в списке",
    presetApartment: "Квартира",
    presetCar: "Машина",
    presetLand: "Земля",
    presetHouse: "Дом",
    presetBank: "Банковский вклад",
    presetBusiness: "Доля в бизнесе",
    presetJewelry: "Украшения",
    presetFurniture: "Мебель/техника",
    clearAll: "Очистить",
    propertyName: "Название",
    propertyValue: "Стоимость (AZN)",
    when: "Когда приобретено?",
    beforeMarriage: "До брака",
    duringMarriage: "В браке",
    source: "Как приобретено?",
    purchase: "Покупка (за доходы)",
    gift: "Подарок",
    inheritance: "Наследство",
    privatization: "Бесплатная приватизация",
    isPersonal: "Личная вещь (кроме украшений)",
    isPersonalDesc: "Одежда, обувь и т.д. — не делится",
    placeholderName: "Напр.: Квартира",
    remove: "Удалить",
    mortgage: "Ипотека / Кредит",
    hasMortgage: "Это имущество в ипотеке",
    mortgagePaid: "Выплачено в браке (AZN)",
    mortgageRemaining: "Остаток долга (AZN)",
    whoKeepsProperty: "Кому остаётся это имущество?",
    spouseA: "Сторона А (муж)",
    spouseB: "Сторона Б (жена)",
    assignTo: "Кому остаётся это имущество?",
    receives: "получает",
    receivedItems: "Полученное имущество",
    receivedTotal: "Всего получено",
    fairShare: "Юридическая доля",
    actualReceived: "Фактически получает",
    equalization: "Выравнивание (компенсация)",
    aPaysB: "Сторона А платит стороне Б",
    bPaysA: "Сторона Б платит стороне А",
    balanced: "Сбалансировано — компенсация не нужна",
    finalA: "Сторона А — итог",
    finalB: "Сторона Б — итог",
    debtTaken: "Принимаемый долг",
    netValue: "Чистая стоимость",
    splitRule: "Правило раздела",
    fiftyFifty: "50/50 поровну",
    fromJointPool: "из совместного фонда",
    personalKept: "личное имущество (остаётся владельцу)",
    mortgagedAsset: "ипотечное имущество",
    children: "Дети",
    childrenCount: "Количество детей",
    childrenWith: "С кем остаются дети",
    none: "Нет",
    bothEqual: "Поровну (ни с кем)",
    adjustShare: "Увеличение доли стороны с детьми",
    adjustShareDesc: "Редко суд назначает свыше 50%",
    noAdjust: "Поровну (50/50)",
    adjust55: "55/45 (небольшое увеличение)",
    adjust60: "60/40 (максимум)",
    result: "Результат раздела",
    jointProperty: "Совместное имущество",
    personalProperty: "Личное имущество",
    netJoint: "Чистая сумма к разделу",
    mortgageDeduction: "Остаток ипотеки",
    spouseAShare: "Доля стороны А",
    spouseBShare: "Доля стороны Б",
    classification: "Классификация",
    joint: "СОВМ. (делится)",
    personal: "ЛИЧНОЕ (не делится)",
    summary: "Итоги расчёта",
    totalProperties: "Общая стоимость имущества",
    note: "* Окончательный раздел определяется судом и соглашением сторон. Калькулятор даёт приблизительный расчёт.",
    housingRightNote: "ℹ️ Право на жильё: Даже если родитель с детьми не является собственником жилья, суд может предоставить ему право проживания в интересах детей.",
    emptyState: "Добавьте хотя бы одну запись об имуществе.",
    mortgageNote: "Платежи по ипотеке в браке считаются совместной инвестицией.",
  },
};

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

// Birgə mülkiyyət təsnifatı
function isJoint(item: PropertyItem): boolean {
  if (item.when === "before") return false;
  if (item.source !== "purchase") return false; // hədiyyə, miras, özəlləşdirmə — şəxsi
  if (item.isPersonal) return false; // şəxsi istifadə əşyası
  return true;
}

let nextId = 1;
const newId = () => `p${nextId++}`;

export default function DivorcePropertyCalculator() {
  const { lang } = useLanguage();
  const pt = t[lang];

  const [items, setItems] = useState<PropertyItem[]>([
    { id: newId(), name: "", value: 0, when: "during", source: "purchase", isPersonal: false, assignTo: "A", hasMortgage: false, mortgageRemaining: 0 },
  ]);

  // Children
  const [childrenCount, setChildrenCount] = useState("0");
  const [childrenWith, setChildrenWith] = useState<"none" | "A" | "B">("none");
  const [shareAdjust, setShareAdjust] = useState<"50" | "55" | "60">("50");

  const updateItem = (id: string, patch: Partial<PropertyItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };
  const addItem = (presetName = "") => {
    setItems((prev) => {
      // Avtomatik nömrələmə: eyni adla neçə əmlak var?
      let finalName = presetName;
      if (presetName) {
        const count = prev.filter((it) => it.name.startsWith(presetName)).length;
        finalName = count > 0 ? `${presetName} ${count + 1}` : presetName;
      }
      return [
        ...prev,
        { id: newId(), name: finalName, value: 0, when: "during", source: "purchase", isPersonal: false, assignTo: "A", hasMortgage: false, mortgageRemaining: 0 },
      ];
    });
  };
  const clearItems = () => {
    setItems([{ id: newId(), name: "", value: 0, when: "during", source: "purchase", isPersonal: false, assignTo: "A", hasMortgage: false, mortgageRemaining: 0 }]);
  };

  const presets: { label: string; icon: string }[] = [
    { label: pt.presetHouse, icon: "🏠" },
    { label: pt.presetCar, icon: "🚗" },
    { label: pt.presetLand, icon: "🌳" },
    { label: pt.presetBank, icon: "🏦" },
    { label: pt.presetBusiness, icon: "💼" },
    { label: pt.presetJewelry, icon: "💍" },
    { label: pt.presetFurniture, icon: "🛋️" },
  ];

  const calculation = useMemo(() => {
    const validItems = items.filter((it) => it.value > 0);
    if (validItems.length === 0) return null;

    const jointItems = validItems.filter(isJoint);
    const personalItems = validItems.filter((it) => !isJoint(it));

    const jointTotal = jointItems.reduce((s, it) => s + it.value, 0);
    const personalTotal = personalItems.reduce((s, it) => s + it.value, 0);

    // Qalıq ipoteka borcu yalnız birgə əmlaklarda nəzərə alınır
    const totalMortgageDebt = jointItems.reduce(
      (s, it) => s + (it.hasMortgage ? Math.max(0, it.mortgageRemaining) : 0),
      0
    );

    // Birgə əmlakın xalis dəyəri (borc düşüldükdən sonra)
    const netJoint = Math.max(0, jointTotal - totalMortgageDebt);

    // Pay düzəlişi (uşaq faktoruna görə)
    let aPct = 0.5;
    let bPct = 0.5;
    if (childrenWith === "A") {
      if (shareAdjust === "55") { aPct = 0.55; bPct = 0.45; }
      else if (shareAdjust === "60") { aPct = 0.6; bPct = 0.4; }
    } else if (childrenWith === "B") {
      if (shareAdjust === "55") { bPct = 0.55; aPct = 0.45; }
      else if (shareAdjust === "60") { bPct = 0.6; aPct = 0.4; }
    }

    // Hər tərəfin hüquqi payı (birgə hovuzdan)
    const aFair = netJoint * aPct;
    const bFair = netJoint * bPct;

    // Hər tərəf faktiki olaraq hansı əmlakları götürür?
    const aJointItems = jointItems.filter((it) => it.assignTo === "A");
    const bJointItems = jointItems.filter((it) => it.assignTo === "B");

    // Hər tərəfin götürdüyü birgə əmlakların xalis dəyəri (öz üzərinə düşən borc daxil)
    const aJointNet = aJointItems.reduce(
      (s, it) => s + it.value - (it.hasMortgage ? Math.max(0, it.mortgageRemaining) : 0),
      0
    );
    const bJointNet = bJointItems.reduce(
      (s, it) => s + it.value - (it.hasMortgage ? Math.max(0, it.mortgageRemaining) : 0),
      0
    );

    const aDebt = aJointItems.reduce(
      (s, it) => s + (it.hasMortgage ? Math.max(0, it.mortgageRemaining) : 0),
      0
    );
    const bDebt = bJointItems.reduce(
      (s, it) => s + (it.hasMortgage ? Math.max(0, it.mortgageRemaining) : 0),
      0
    );

    // Şəxsi əmlaklar — sahibinə aiddir (assignTo)
    const aPersonalItems = personalItems.filter((it) => it.assignTo === "A");
    const bPersonalItems = personalItems.filter((it) => it.assignTo === "B");
    const aPersonalTotal = aPersonalItems.reduce((s, it) => s + it.value, 0);
    const bPersonalTotal = bPersonalItems.reduce((s, it) => s + it.value, 0);

    // Tarazlaşdırma: faktiki birgə pay - hüquqi birgə pay
    // Pozitivdirsə → həmin tərəf çoxunu götürüb, digərinə ödəməlidir
    const aDelta = aJointNet - aFair;
    const bDelta = bJointNet - bFair;

    // Kim kimə nə qədər ödəyir?
    let payer: "A" | "B" | null = null;
    let paymentAmount = 0;
    if (aDelta > 0.01) {
      payer = "A";
      paymentAmount = aDelta;
    } else if (bDelta > 0.01) {
      payer = "B";
      paymentAmount = bDelta;
    }

    // Yekun (kompensasiyadan sonra)
    const aFinal = aPersonalTotal + aJointNet - (payer === "A" ? paymentAmount : 0) + (payer === "B" ? paymentAmount : 0);
    const bFinal = bPersonalTotal + bJointNet - (payer === "B" ? paymentAmount : 0) + (payer === "A" ? paymentAmount : 0);

    return {
      validItems,
      jointItems,
      personalItems,
      jointTotal,
      personalTotal,
      totalMortgageDebt,
      netJoint,
      aFair,
      bFair,
      aPct,
      bPct,
      aJointItems,
      bJointItems,
      aJointNet,
      bJointNet,
      aDebt,
      bDebt,
      aPersonalItems,
      bPersonalItems,
      aPersonalTotal,
      bPersonalTotal,
      payer,
      paymentAmount,
      aFinal,
      bFinal,
    };
  }, [items, childrenWith, shareAdjust]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=legal" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["inheritance", "notary-fee", "court-fee", "aliment"]}
    >
      {/* Property list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <label className="block text-sm font-medium text-foreground">{pt.properties}</label>
            <p className="text-xs text-muted">{pt.propertiesHint}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary-light text-primary font-medium">
            {items.filter((it) => it.value > 0 || it.name).length} {pt.itemCount}
          </span>
        </div>

        {/* Sürətli əlavə düymələri */}
        <div className="mb-3 p-3 rounded-xl bg-gray-50 border border-border">
          <p className="text-xs font-medium text-muted mb-2">⚡ {pt.quickAdd}</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => addItem(p.label)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-border hover:border-primary hover:bg-primary-light transition-colors flex items-center gap-1"
              >
                <span>{p.icon}</span>
                <span className="font-medium text-foreground">+ {p.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => addItem()}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              + {pt.addProperty}
            </button>
            {items.length > 1 && (
              <button
                onClick={clearItems}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-auto"
              >
                {pt.clearAll}
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {items.map((it, idx) => {
            const joint = it.value > 0 && isJoint(it);
            return (
              <div
                key={it.id}
                className={`rounded-xl border p-4 ${
                  it.value > 0 ? (joint ? "border-green-200 bg-green-50/40" : "border-amber-200 bg-amber-50/40") : "border-border bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs text-muted">#{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(it.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      {pt.remove}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => updateItem(it.id, { name: e.target.value })}
                    placeholder={pt.placeholderName}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={it.value || ""}
                    onChange={(e) => updateItem(it.id, { value: parseFloat(e.target.value) || 0 })}
                    placeholder={pt.propertyValue}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">{pt.when}</label>
                    <select
                      value={it.when}
                      onChange={(e) => updateItem(it.id, { when: e.target.value as AcquiredWhen })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="before">{pt.beforeMarriage}</option>
                      <option value="during">{pt.duringMarriage}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">{pt.source}</label>
                    <select
                      value={it.source}
                      onChange={(e) => updateItem(it.id, { source: e.target.value as Source })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="purchase">{pt.purchase}</option>
                      <option value="gift">{pt.gift}</option>
                      <option value="inheritance">{pt.inheritance}</option>
                      <option value="privatization">{pt.privatization}</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-start gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={it.isPersonal}
                    onChange={(e) => updateItem(it.id, { isPersonal: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-primary"
                  />
                  <div>
                    <p className="text-xs font-medium text-foreground">{pt.isPersonal}</p>
                    <p className="text-[11px] text-muted">{pt.isPersonalDesc}</p>
                  </div>
                </label>

                {/* Bu əmlak kimə qalır? */}
                <div className="mb-3">
                  <label className="block text-xs text-muted mb-1">{pt.assignTo}</label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => updateItem(it.id, { assignTo: "A" })}
                      className={`flex-1 py-2 text-xs font-medium transition-colors ${
                        it.assignTo === "A" ? "bg-blue-600 text-white" : "bg-white text-muted hover:bg-gray-50"
                      }`}
                    >
                      {pt.spouseA}
                    </button>
                    <button
                      onClick={() => updateItem(it.id, { assignTo: "B" })}
                      className={`flex-1 py-2 text-xs font-medium transition-colors ${
                        it.assignTo === "B" ? "bg-pink-600 text-white" : "bg-white text-muted hover:bg-gray-50"
                      }`}
                    >
                      {pt.spouseB}
                    </button>
                  </div>
                </div>

                {/* Per-item ipoteka — yalnız birgə əmlak üçün məntiqlidir */}
                {joint && (
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={it.hasMortgage}
                        onChange={(e) => updateItem(it.id, { hasMortgage: e.target.checked })}
                        className="mt-0.5 w-4 h-4 accent-primary"
                      />
                      <p className="text-xs font-medium text-foreground">{pt.hasMortgage}</p>
                    </label>
                    {it.hasMortgage && (
                      <div className="mt-2 pl-6">
                        <label className="block text-[11px] text-muted mb-1">{pt.mortgageRemaining}</label>
                        <input
                          type="number"
                          value={it.mortgageRemaining || ""}
                          onChange={(e) => updateItem(it.id, { mortgageRemaining: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                )}

                {it.value > 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block text-[10px] px-2 py-1 rounded-full font-medium ${
                        joint ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {joint ? pt.joint : pt.personal}
                    </span>
                    {joint && it.hasMortgage && it.mortgageRemaining > 0 && (
                      <span className="inline-block text-[10px] px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                        {pt.mortgagedAsset}: −{formatMoney(it.mortgageRemaining)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Children */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.children}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-muted mb-1">{pt.childrenCount}</label>
            <input
              type="number"
              value={childrenCount}
              onChange={(e) => setChildrenCount(e.target.value)}
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{pt.childrenWith}</label>
            <select
              value={childrenWith}
              onChange={(e) => setChildrenWith(e.target.value as "none" | "A" | "B")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="none">{pt.bothEqual}</option>
              <option value="A">{pt.spouseA}</option>
              <option value="B">{pt.spouseB}</option>
            </select>
          </div>
        </div>
        {childrenWith !== "none" && (parseInt(childrenCount) || 0) > 0 && (
          <div>
            <label className="block text-xs text-muted mb-1">{pt.adjustShare}</label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["50", "55", "60"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setShareAdjust(v)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    shareAdjust === v ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
                  }`}
                >
                  {v === "50" ? pt.noAdjust : v === "55" ? pt.adjust55 : pt.adjust60}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-1">{pt.adjustShareDesc}</p>
          </div>
        )}
      </div>

      {/* Result */}
      {calculation ? (
        <div className="space-y-6">
          {/* Birgə hovuz xülasəsi */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.summary}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.totalProperties}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(calculation.jointTotal + calculation.personalTotal)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm text-green-700">{pt.jointProperty}</span>
                <span className="text-sm font-medium text-green-700">{formatMoney(calculation.jointTotal)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-amber-50">
                <span className="text-sm text-amber-700">{pt.personalProperty}</span>
                <span className="text-sm font-medium text-amber-700">{formatMoney(calculation.personalTotal)}</span>
              </div>
              {calculation.totalMortgageDebt > 0 && (
                <div className="flex justify-between px-5 py-3 bg-red-50">
                  <span className="text-sm text-red-700">{pt.mortgageDeduction}</span>
                  <span className="text-sm font-medium text-red-700">−{formatMoney(calculation.totalMortgageDebt)}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3 bg-primary-light">
                <span className="text-sm font-semibold text-primary">{pt.netJoint}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(calculation.netJoint)}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.splitRule}</span>
                <span className="text-sm font-medium text-foreground">
                  {(calculation.aPct * 100).toFixed(0)}% / {(calculation.bPct * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.spouseA} — {pt.fairShare}</span>
                <span className="text-sm font-medium text-blue-700">{formatMoney(calculation.aFair)}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.spouseB} — {pt.fairShare}</span>
                <span className="text-sm font-medium text-pink-700">{formatMoney(calculation.bFair)}</span>
              </div>
            </div>
          </div>

          {/* Per-spouse detalı */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Spouse A */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 px-5 py-4 text-white">
                <p className="text-xs text-blue-100">{pt.spouseA} {pt.receives}</p>
                <p className="text-2xl font-bold">{formatMoney(calculation.aFinal)}</p>
              </div>
              <div className="p-4 space-y-3">
                {(calculation.aJointItems.length > 0 || calculation.aPersonalItems.length > 0) && (
                  <div>
                    <p className="text-xs font-medium text-muted mb-2">{pt.receivedItems}</p>
                    <ul className="space-y-1.5">
                      {calculation.aJointItems.map((it) => (
                        <li key={it.id} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {it.name || "—"}
                            <span className="ml-2 text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                              {pt.fromJointPool}
                            </span>
                            {it.hasMortgage && it.mortgageRemaining > 0 && (
                              <span className="ml-1 text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                −{formatMoney(it.mortgageRemaining)}
                              </span>
                            )}
                          </span>
                          <span className="text-foreground font-medium">{formatMoney(it.value)}</span>
                        </li>
                      ))}
                      {calculation.aPersonalItems.map((it) => (
                        <li key={it.id} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {it.name || "—"}
                            <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              {pt.personalKept}
                            </span>
                          </span>
                          <span className="text-foreground font-medium">{formatMoney(it.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">{pt.actualReceived} ({pt.fromJointPool})</span>
                    <span className="font-medium text-foreground">{formatMoney(calculation.aJointNet)}</span>
                  </div>
                  {calculation.aDebt > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>{pt.debtTaken}</span>
                      <span>−{formatMoney(calculation.aDebt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted">{pt.personalProperty}</span>
                    <span className="font-medium text-amber-700">{formatMoney(calculation.aPersonalTotal)}</span>
                  </div>
                  {calculation.payer === "A" && calculation.paymentAmount > 0.01 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>→ {pt.spouseB}</span>
                      <span>−{formatMoney(calculation.paymentAmount)}</span>
                    </div>
                  )}
                  {calculation.payer === "B" && calculation.paymentAmount > 0.01 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>← {pt.spouseB}</span>
                      <span>+{formatMoney(calculation.paymentAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-bold text-blue-700">{pt.finalA}</span>
                    <span className="font-bold text-blue-700">{formatMoney(calculation.aFinal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spouse B */}
            <div className="bg-white rounded-2xl border-2 border-pink-200 overflow-hidden">
              <div className="bg-gradient-to-br from-pink-500 to-pink-700 px-5 py-4 text-white">
                <p className="text-xs text-pink-100">{pt.spouseB} {pt.receives}</p>
                <p className="text-2xl font-bold">{formatMoney(calculation.bFinal)}</p>
              </div>
              <div className="p-4 space-y-3">
                {(calculation.bJointItems.length > 0 || calculation.bPersonalItems.length > 0) && (
                  <div>
                    <p className="text-xs font-medium text-muted mb-2">{pt.receivedItems}</p>
                    <ul className="space-y-1.5">
                      {calculation.bJointItems.map((it) => (
                        <li key={it.id} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {it.name || "—"}
                            <span className="ml-2 text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                              {pt.fromJointPool}
                            </span>
                            {it.hasMortgage && it.mortgageRemaining > 0 && (
                              <span className="ml-1 text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                −{formatMoney(it.mortgageRemaining)}
                              </span>
                            )}
                          </span>
                          <span className="text-foreground font-medium">{formatMoney(it.value)}</span>
                        </li>
                      ))}
                      {calculation.bPersonalItems.map((it) => (
                        <li key={it.id} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {it.name || "—"}
                            <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              {pt.personalKept}
                            </span>
                          </span>
                          <span className="text-foreground font-medium">{formatMoney(it.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">{pt.actualReceived} ({pt.fromJointPool})</span>
                    <span className="font-medium text-foreground">{formatMoney(calculation.bJointNet)}</span>
                  </div>
                  {calculation.bDebt > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>{pt.debtTaken}</span>
                      <span>−{formatMoney(calculation.bDebt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted">{pt.personalProperty}</span>
                    <span className="font-medium text-amber-700">{formatMoney(calculation.bPersonalTotal)}</span>
                  </div>
                  {calculation.payer === "B" && calculation.paymentAmount > 0.01 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>→ {pt.spouseA}</span>
                      <span>−{formatMoney(calculation.paymentAmount)}</span>
                    </div>
                  )}
                  {calculation.payer === "A" && calculation.paymentAmount > 0.01 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>← {pt.spouseA}</span>
                      <span>+{formatMoney(calculation.paymentAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-bold text-pink-700">{pt.finalB}</span>
                    <span className="font-bold text-pink-700">{formatMoney(calculation.bFinal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equalization banner */}
          {calculation.payer && calculation.paymentAmount > 0.01 ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5">
              <p className="text-xs text-amber-700 font-medium mb-2">⚖️ {pt.equalization}</p>
              <p className="text-lg font-bold text-amber-900">
                {calculation.payer === "A" ? pt.aPaysB : pt.bPaysA}: <span className="text-2xl">{formatMoney(calculation.paymentAmount)}</span>
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm text-green-700 font-medium">✓ {pt.balanced}</p>
            </div>
          )}

          {childrenWith !== "none" && (parseInt(childrenCount) || 0) > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              {pt.housingRightNote}
            </div>
          )}

          <div className="bg-gray-50 border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted">{pt.note}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💔</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
