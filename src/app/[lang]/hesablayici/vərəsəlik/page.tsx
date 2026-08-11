"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// Azərbaycan Mülki Məcəlləsi — vərəsəlik hüququ
// Növbəlilik prinsipi: əvvəlki növbə vərəsələri varsa, sonrakı növbə miras almır
// Məcburi pay: vəsiyyətnamə olduqda uşaqlar, valideynlər və həyat yoldaşı
// vəsiyyətnamə olmasaydı alacaqları payın 50%-ni alır

type Order = 1 | 2 | 3 | 4;

const MANDATORY_SHARE = 0.5;
const MARITAL_SHARE = 0.5;

interface Heir {
  key: string;
  label: string;
  count: number;
  shareEach: number;
  total: number;
  isProtected?: boolean; // məcburi pay sahibi
}

const t = {
  az: {
    title: "Vərəsəlik hesablayıcısı",
    description: "Mirası növbəlilik prinsipi ilə bölün — məcburi pay, nikah payı və vəsiyyətnamə daxil.",
    breadcrumbCategory: "Hüquq və Dövlət",
    formulaTitle: "Vərəsəlik necə hesablanır?",
    formulaContent: `Mənbə: Azərbaycan Respublikasının Mülki Məcəlləsi (Bölmə X — Vərəsəlik hüququ)

Növbəlilik prinsipi:
Əgər vəsiyyətnamə yoxdursa, miras "Növbəlilik" prinsipi ilə bölünür. Əvvəlki növbə vərəsələri varsa, sonrakı növbə vərəsələri miras ala bilməz.

1-ci növbə: Uşaqlar (nikahdan kənar və övladlığa götürülənlər daxil), həyat yoldaşı, valideynlər
2-ci növbə: Bacılar və qardaşlar
3-cü növbə: Babalar və nənələr
4-cü növbə: Xalalar, bibilər, dayılar və əmilər

Bərabər bölgü: Eyni növbədəki vərəsələr arasında miras bərabər şəkildə bölünür.

"Nikah payı" (50%):
Əgər əmlak nikah dövründə alınıbsa, onun yarısı (50%-i) onsuz da sağ qalan həyat yoldaşının mülkiyyətidir. Miras isə yerdə qalan 50% üzərindən hesablanır. Sağ qalan həyat yoldaşı bu nikah payına əlavə olaraq qalan mirasdan da pay alır.

"Məcburi pay" (50%):
Vəsiyyətnamə olduqda da uşaqlar, valideynlər və həyat yoldaşı qanunla qorunur. Onlar vəsiyyətnamə olmasaydı alacaqları payın yarısını (50%-ni) hər halda alır.

Düstur:
1. Nikah dövründə əmlakdırsa: Miras = Ümumi əmlak × 50%
2. Hər bir vərəsənin payı = Miras ÷ Vərəsələrin sayı
3. Vəsiyyətnamə varsa: Məcburi pay sahiblərinin payı × 50%

Diqqət: Real bölgü notarius və məhkəmə qərarı ilə dəqiqləşir. Bu hesablayıcı təxmini məlumat verir.`,
    estateAmount: "Ümumi miras məbləği (AZN)",
    inheritanceOrder: "Vərəsəlik növbəsi",
    order1: "1-ci növbə (uşaqlar, həyat yoldaşı, valideynlər)",
    order2: "2-ci növbə (bacılar, qardaşlar)",
    order3: "3-cü növbə (babalar, nənələr)",
    order4: "4-cü növbə (xalalar, bibilər, dayılar, əmilər)",
    childrenCount: "Uşaqların sayı",
    childrenDesc: "Nikahdan kənar və övladlığa götürülənlər daxil",
    hasSpouse: "Sağ qalan həyat yoldaşı var",
    hasSpouseDesc: "Vəfat anında rəsmi nikahda olan",
    parentsCount: "Sağ olan valideynlərin sayı",
    parentsDesc: "0, 1 və ya 2",
    siblingsCount: "Bacı və qardaşların sayı",
    grandparentsCount: "Baba və nənələrin sayı",
    auntsCount: "Xala, bibi, dayı və əmilərin sayı",
    options: "Əlavə şərtlər",
    maritalProperty: "Əmlak nikah dövründə alınıb",
    maritalPropertyDesc: "Belə olduqda 50% sağ qalan həyat yoldaşına aiddir",
    hasWill: "Vəsiyyətnamə var",
    hasWillDesc: "Bu halda yalnız məcburi pay sahibləri qorunur",
    result: "Mirasın bölgüsü",
    heir: "Vərəsə",
    count: "Say",
    shareEach: "Bir nəfərə",
    total: "Cəmi",
    totalDistributed: "Cəmi bölünmüş",
    remainingByWill: "Vəsiyyətnaməyə görə bölünür",
    remainingByWillDesc: "Bu məbləği vəsiyyətnamə sahibi öz istəyi ilə bölə bilər",
    summary: "Hesablama xülasəsi",
    estateLabel: "Ümumi əmlak",
    maritalShareLabel: "Nikah payı (50% həyat yoldaşına)",
    estateAfterMarital: "Bölünməli miras",
    children: "Uşaq",
    spouse: "Həyat yoldaşı",
    parents: "Valideyn",
    siblings: "Bacı/qardaş",
    grandparents: "Baba/nənə",
    aunts: "Xala/bibi/dayı/əmi",
    spouseInherit: "Həyat yoldaşı (miras payı)",
    spouseMarital: "Həyat yoldaşı (nikah payı)",
    spouseTotal: "Həyat yoldaşı (cəmi)",
    protected: "məcburi pay",
    emptyState: "Miras məbləğini və ən azı bir vərəsəni daxil edin.",
    note: "* Real bölgü notarius və məhkəmə qərarı ilə həyata keçirilir. Bu hesablayıcı qanunvericilik əsasında təxmini bölgü göstərir.",
    noHeirs: "Bu növbədə vərəsə yoxdur. Növbəti növbəyə keçin və ya vərəsələrin sayını daxil edin.",
  },
  en: {
    title: "Inheritance Calculator",
    description: "Distribute inheritance by order — including mandatory share, marital share and wills.",
    breadcrumbCategory: "Legal & Government",
    formulaTitle: "How is inheritance calculated?",
    formulaContent: `Source: Civil Code of the Republic of Azerbaijan (Section X — Inheritance Law)

Order principle:
If there is no will, inheritance is distributed by "Order". If heirs of an earlier order exist, later-order heirs cannot inherit.

Order 1: Children (incl. born outside marriage and adopted), spouse, parents
Order 2: Siblings
Order 3: Grandparents
Order 4: Aunts and uncles

Equal division: Heirs in the same order share inheritance equally.

"Marital share" (50%):
If property was acquired during marriage, half of it already belongs to the surviving spouse. Inheritance is calculated only on the remaining 50%. The surviving spouse also receives an inheritance share on top of the marital share.

"Mandatory share" (50%):
Even when there is a will, children, parents and spouse are protected by law. They receive at least half of what they would get without a will.

Formula:
1. If marital property: Estate = Total property × 50%
2. Each heir's share = Estate ÷ Number of heirs
3. With a will: Mandatory heirs' share × 50%`,
    estateAmount: "Total estate amount (AZN)",
    inheritanceOrder: "Inheritance order",
    order1: "Order 1 (children, spouse, parents)",
    order2: "Order 2 (siblings)",
    order3: "Order 3 (grandparents)",
    order4: "Order 4 (aunts and uncles)",
    childrenCount: "Number of children",
    childrenDesc: "Including born outside marriage and adopted",
    hasSpouse: "Surviving spouse",
    hasSpouseDesc: "In a registered marriage at the time of death",
    parentsCount: "Living parents",
    parentsDesc: "0, 1 or 2",
    siblingsCount: "Number of siblings",
    grandparentsCount: "Number of grandparents",
    auntsCount: "Number of aunts and uncles",
    options: "Additional conditions",
    maritalProperty: "Property acquired during marriage",
    maritalPropertyDesc: "If so, 50% belongs to the surviving spouse",
    hasWill: "Will exists",
    hasWillDesc: "Only mandatory-share heirs are protected",
    result: "Inheritance distribution",
    heir: "Heir",
    count: "Count",
    shareEach: "Per person",
    total: "Total",
    totalDistributed: "Total distributed",
    remainingByWill: "Distributed by will",
    remainingByWillDesc: "This amount is distributed according to the will",
    summary: "Calculation summary",
    estateLabel: "Total property",
    maritalShareLabel: "Marital share (50% to spouse)",
    estateAfterMarital: "Estate to divide",
    children: "Children",
    spouse: "Spouse",
    parents: "Parents",
    siblings: "Siblings",
    grandparents: "Grandparents",
    aunts: "Aunts/uncles",
    spouseInherit: "Spouse (inheritance share)",
    spouseMarital: "Spouse (marital share)",
    spouseTotal: "Spouse (total)",
    protected: "mandatory",
    emptyState: "Enter estate amount and at least one heir.",
    note: "* Final distribution is determined by notary and court. This calculator gives an approximate division based on legislation.",
    noHeirs: "No heirs in this order. Move to the next order or enter the number of heirs.",
  },
  ru: {
    title: "Калькулятор наследства",
    description: "Распределение наследства по очередности — обязательная доля, супружеская доля и завещание.",
    breadcrumbCategory: "Право и Государство",
    formulaTitle: "Как рассчитывается наследство?",
    formulaContent: `Источник: Гражданский кодекс Азербайджанской Республики (Раздел X — Наследственное право)

Принцип очередности:
Если нет завещания, наследство распределяется по "очередям". Если есть наследники предыдущей очереди, наследники следующей очереди не наследуют.

1-я очередь: Дети (вкл. внебрачных и усыновлённых), супруг(а), родители
2-я очередь: Братья и сёстры
3-я очередь: Дедушки и бабушки
4-я очередь: Тёти и дяди

Равное распределение: наследники одной очереди делят наследство поровну.

"Супружеская доля" (50%):
Если имущество приобретено в браке, 50% уже принадлежит пережившему супругу. Наследство считается только с оставшихся 50%. Переживший супруг также получает наследственную долю.

"Обязательная доля" (50%):
Даже при наличии завещания дети, родители и супруг(а) защищены законом. Они получают не менее половины того, что получили бы без завещания.

Формула:
1. Имущество в браке: Наследство = Общее × 50%
2. Доля наследника = Наследство ÷ Кол-во наследников
3. При завещании: Доля обязательного наследника × 50%`,
    estateAmount: "Общая сумма наследства (AZN)",
    inheritanceOrder: "Очередь наследования",
    order1: "1-я очередь (дети, супруг(а), родители)",
    order2: "2-я очередь (братья, сёстры)",
    order3: "3-я очередь (бабушки, дедушки)",
    order4: "4-я очередь (тёти, дяди)",
    childrenCount: "Количество детей",
    childrenDesc: "Включая внебрачных и усыновлённых",
    hasSpouse: "Переживший супруг(а)",
    hasSpouseDesc: "В зарегистрированном браке на момент смерти",
    parentsCount: "Живые родители",
    parentsDesc: "0, 1 или 2",
    siblingsCount: "Количество братьев и сестёр",
    grandparentsCount: "Количество бабушек и дедушек",
    auntsCount: "Количество тётей и дядей",
    options: "Дополнительные условия",
    maritalProperty: "Имущество приобретено в браке",
    maritalPropertyDesc: "В этом случае 50% принадлежит супругу",
    hasWill: "Есть завещание",
    hasWillDesc: "Защищены только наследники с обязательной долей",
    result: "Распределение наследства",
    heir: "Наследник",
    count: "Кол-во",
    shareEach: "На одного",
    total: "Всего",
    totalDistributed: "Всего распределено",
    remainingByWill: "Распределяется по завещанию",
    remainingByWillDesc: "Эта сумма распределяется по воле завещателя",
    summary: "Сводка расчёта",
    estateLabel: "Общее имущество",
    maritalShareLabel: "Супружеская доля (50% супругу)",
    estateAfterMarital: "Наследственная масса",
    children: "Дети",
    spouse: "Супруг(а)",
    parents: "Родители",
    siblings: "Братья/сёстры",
    grandparents: "Бабушки/дедушки",
    aunts: "Тёти/дяди",
    spouseInherit: "Супруг (наследственная доля)",
    spouseMarital: "Супруг (супружеская доля)",
    spouseTotal: "Супруг (всего)",
    protected: "обязательная",
    emptyState: "Введите сумму наследства и хотя бы одного наследника.",
    note: "* Окончательное распределение определяется нотариусом и судом. Калькулятор даёт приблизительный расчёт.",
    noHeirs: "Нет наследников этой очереди. Перейдите к следующей или укажите наследников.",
  },
};

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

export default function InheritanceCalculator() {
  const { lang } = useLanguage();
  const pt = t[lang];

  const [estate, setEstate] = useState<string>("");
  const [order, setOrder] = useState<Order>(1);
  const [maritalProperty, setMaritalProperty] = useState<boolean>(false);
  const [hasWill, setHasWill] = useState<boolean>(false);

  // Order 1
  const [children, setChildren] = useState<string>("0");
  const [hasSpouse, setHasSpouse] = useState<boolean>(false);
  const [parents, setParents] = useState<string>("0");

  // Order 2-4
  const [siblings, setSiblings] = useState<string>("0");
  const [grandparents, setGrandparents] = useState<string>("0");
  const [aunts, setAunts] = useState<string>("0");

  const calculation = useMemo(() => {
    const total = parseFloat(estate);
    if (!total || total <= 0) return null;

    // Nikah payı: yalnız 1-ci növbədə və həyat yoldaşı varsa anlamlıdır
    const applyMarital = maritalProperty && order === 1 && hasSpouse;
    const maritalShareAmount = applyMarital ? total * MARITAL_SHARE : 0;
    const inheritanceMass = total - maritalShareAmount;

    const childrenN = Math.max(0, parseInt(children) || 0);
    const parentsN = Math.max(0, Math.min(2, parseInt(parents) || 0));
    const siblingsN = Math.max(0, parseInt(siblings) || 0);
    const grandparentsN = Math.max(0, parseInt(grandparents) || 0);
    const auntsN = Math.max(0, parseInt(aunts) || 0);

    let totalHeirs = 0;
    if (order === 1) totalHeirs = childrenN + (hasSpouse ? 1 : 0) + parentsN;
    else if (order === 2) totalHeirs = siblingsN;
    else if (order === 3) totalHeirs = grandparentsN;
    else if (order === 4) totalHeirs = auntsN;

    if (totalHeirs === 0) return { total, maritalShareAmount, inheritanceMass, heirs: [] as Heir[], totalHeirs: 0, hasWill, applyMarital, distributed: 0, remainingByWill: 0 };

    const baseShare = inheritanceMass / totalHeirs;
    // Vəsiyyətnamə yalnız 1-ci növbədə anlamlıdır (məcburi pay sahibləri var)
    const willActive = hasWill && order === 1;
    const factor = willActive ? MANDATORY_SHARE : 1;

    const heirs: Heir[] = [];
    if (order === 1) {
      if (childrenN > 0) {
        const each = baseShare * factor;
        heirs.push({ key: "children", label: pt.children, count: childrenN, shareEach: each, total: each * childrenN, isProtected: willActive });
      }
      if (hasSpouse) {
        const each = baseShare * factor;
        heirs.push({ key: "spouse", label: willActive ? pt.spouseInherit : pt.spouse, count: 1, shareEach: each, total: each, isProtected: willActive });
      }
      if (parentsN > 0) {
        const each = baseShare * factor;
        heirs.push({ key: "parents", label: pt.parents, count: parentsN, shareEach: each, total: each * parentsN, isProtected: willActive });
      }
    } else if (order === 2 && siblingsN > 0) {
      heirs.push({ key: "siblings", label: pt.siblings, count: siblingsN, shareEach: baseShare, total: inheritanceMass });
    } else if (order === 3 && grandparentsN > 0) {
      heirs.push({ key: "grandparents", label: pt.grandparents, count: grandparentsN, shareEach: baseShare, total: inheritanceMass });
    } else if (order === 4 && auntsN > 0) {
      heirs.push({ key: "aunts", label: pt.aunts, count: auntsN, shareEach: baseShare, total: inheritanceMass });
    }

    const distributedFromInheritance = heirs.reduce((s, h) => s + h.total, 0);
    const remainingByWill = inheritanceMass - distributedFromInheritance;

    // Spouse total (with marital share)
    let spouseTotalAmount = 0;
    if (applyMarital) {
      spouseTotalAmount = maritalShareAmount;
      const spouseHeir = heirs.find((h) => h.key === "spouse");
      if (spouseHeir) spouseTotalAmount += spouseHeir.total;
    }

    return {
      total,
      maritalShareAmount,
      inheritanceMass,
      heirs,
      totalHeirs,
      hasWill: willActive,
      applyMarital,
      distributed: distributedFromInheritance,
      remainingByWill,
      spouseTotalAmount,
    };
  }, [estate, order, maritalProperty, hasWill, hasSpouse, children, parents, siblings, grandparents, aunts, pt]);

  const orderOptions = [
    { value: 1, label: pt.order1 },
    { value: 2, label: pt.order2 },
    { value: 3, label: pt.order3 },
    { value: 4, label: pt.order4 },
  ];

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
      relatedIds={["notary-fee", "court-fee", "property-tax", "rental-income-tax"]}
    >
      {/* Estate amount */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.estateAmount}</label>
        <input
          type="number"
          value={estate}
          onChange={(e) => setEstate(e.target.value)}
          placeholder="120000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Inheritance order */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.inheritanceOrder}</label>
        <select
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) as Order)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base appearance-none cursor-pointer"
        >
          {orderOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Heirs by order */}
      {order === 1 && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{pt.childrenCount}</label>
            <input
              type="number"
              min="0"
              value={children}
              onChange={(e) => setChildren(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">{pt.childrenDesc}</p>
          </div>
          <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={hasSpouse}
              onChange={(e) => setHasSpouse(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{pt.hasSpouse}</p>
              <p className="text-xs text-muted mt-0.5">{pt.hasSpouseDesc}</p>
            </div>
          </label>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{pt.parentsCount}</label>
            <input
              type="number"
              min="0"
              max="2"
              value={parents}
              onChange={(e) => setParents(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">{pt.parentsDesc}</p>
          </div>
        </div>
      )}

      {order === 2 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1">{pt.siblingsCount}</label>
          <input
            type="number"
            min="0"
            value={siblings}
            onChange={(e) => setSiblings(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      )}

      {order === 3 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1">{pt.grandparentsCount}</label>
          <input
            type="number"
            min="0"
            max="4"
            value={grandparents}
            onChange={(e) => setGrandparents(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      )}

      {order === 4 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1">{pt.auntsCount}</label>
          <input
            type="number"
            min="0"
            value={aunts}
            onChange={(e) => setAunts(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      )}

      {/* Options */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.options}</label>
        <div className="space-y-2">
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border bg-white transition-colors ${
              order === 1 && hasSpouse ? "border-border cursor-pointer hover:border-primary/40" : "border-border opacity-50 cursor-not-allowed"
            }`}
          >
            <input
              type="checkbox"
              checked={maritalProperty && order === 1 && hasSpouse}
              disabled={!(order === 1 && hasSpouse)}
              onChange={(e) => setMaritalProperty(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{pt.maritalProperty}</p>
              <p className="text-xs text-muted mt-0.5">{pt.maritalPropertyDesc}</p>
            </div>
          </label>
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border bg-white transition-colors ${
              order === 1 ? "border-border cursor-pointer hover:border-primary/40" : "border-border opacity-50 cursor-not-allowed"
            }`}
          >
            <input
              type="checkbox"
              checked={hasWill && order === 1}
              disabled={order !== 1}
              onChange={(e) => setHasWill(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{pt.hasWill}</p>
              <p className="text-xs text-muted mt-0.5">{pt.hasWillDesc}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Result */}
      {calculation ? (
        calculation.totalHeirs === 0 ? (
          <div className="text-center py-8 text-muted bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-4xl block mb-3">⚠️</span>
            <p className="text-amber-700">{pt.noHeirs}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero result */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
              <p className="text-sm text-blue-100 mb-1">{pt.totalDistributed}</p>
              <p className="text-3xl font-bold">{formatMoney(calculation.distributed + calculation.maritalShareAmount)}</p>
              <p className="text-xs text-blue-200 mt-2">
                {calculation.totalHeirs} {pt.heir.toLowerCase()}
              </p>
            </div>

            {/* Heir breakdown */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>👥</span>
                  {pt.result}
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-muted">
                    <th className="px-5 py-2 font-medium">{pt.heir}</th>
                    <th className="px-5 py-2 font-medium text-right">{pt.count}</th>
                    <th className="px-5 py-2 font-medium text-right">{pt.shareEach}</th>
                    <th className="px-5 py-2 font-medium text-right">{pt.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {calculation.heirs.map((h) => (
                    <tr key={h.key}>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {h.label}
                        {h.isProtected && (
                          <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            {pt.protected}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-muted">{h.count}</td>
                      <td className="px-5 py-3 text-right text-foreground">{formatMoney(h.shareEach)}</td>
                      <td className="px-5 py-3 text-right font-bold text-primary">{formatMoney(h.total)}</td>
                    </tr>
                  ))}
                  {calculation.applyMarital && (
                    <tr className="bg-blue-50">
                      <td className="px-5 py-3 font-medium text-blue-700">{pt.spouseMarital}</td>
                      <td className="px-5 py-3 text-right text-blue-700">1</td>
                      <td className="px-5 py-3 text-right text-blue-700">{formatMoney(calculation.maritalShareAmount)}</td>
                      <td className="px-5 py-3 text-right font-bold text-blue-700">{formatMoney(calculation.maritalShareAmount)}</td>
                    </tr>
                  )}
                  {calculation.hasWill && calculation.remainingByWill > 0.01 && (
                    <tr className="bg-amber-50">
                      <td className="px-5 py-3 font-medium text-amber-700" colSpan={3}>
                        {pt.remainingByWill}
                        <p className="text-xs text-amber-600 font-normal mt-0.5">{pt.remainingByWillDesc}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-amber-700">{formatMoney(calculation.remainingByWill)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📊</span>
                  {pt.summary}
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.estateLabel}</span>
                  <span className="text-sm font-medium text-foreground">{formatMoney(calculation.total)}</span>
                </div>
                {calculation.applyMarital && (
                  <>
                    <div className="flex justify-between px-5 py-3 bg-blue-50">
                      <span className="text-sm text-blue-700">{pt.maritalShareLabel}</span>
                      <span className="text-sm font-medium text-blue-700">−{formatMoney(calculation.maritalShareAmount)}</span>
                    </div>
                    <div className="flex justify-between px-5 py-3">
                      <span className="text-sm text-muted">{pt.estateAfterMarital}</span>
                      <span className="text-sm font-medium text-foreground">{formatMoney(calculation.inheritanceMass)}</span>
                    </div>
                  </>
                )}
                {calculation.applyMarital && calculation.spouseTotalAmount !== undefined && calculation.spouseTotalAmount > 0 && (
                  <div className="flex justify-between px-5 py-3 bg-green-50">
                    <span className="text-sm font-semibold text-green-700">{pt.spouseTotal}</span>
                    <span className="text-sm font-bold text-green-700">{formatMoney(calculation.spouseTotalAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted">{pt.note}</p>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">📜</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
