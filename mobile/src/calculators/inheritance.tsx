import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { Checkbox } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { Panel, TintRow, Badge, TintHero, NoteBox, EmptyState, FieldLabel, TINT, toInt, moneyAZN } from "./_legal-parts";

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
  isProtected?: boolean;
}

const pt = {
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
};

const formatMoney = moneyAZN;

export function InheritanceCalculator() {
  const { colors } = useTheme();
  const [estate, setEstate] = useState("");
  const [order, setOrder] = useState<Order>(1);
  const [maritalProperty, setMaritalProperty] = useState(false);
  const [hasWill, setHasWill] = useState(false);

  const [children, setChildren] = useState("0");
  const [hasSpouse, setHasSpouse] = useState(false);
  const [parents, setParents] = useState("0");

  const [siblings, setSiblings] = useState("0");
  const [grandparents, setGrandparents] = useState("0");
  const [aunts, setAunts] = useState("0");

  const calculation = useMemo(() => {
    const total = parseFloat(estate.replace(",", "."));
    if (!total || total <= 0) return null;

    // Nikah payı: yalnız 1-ci növbədə və həyat yoldaşı varsa anlamlıdır
    const applyMarital = maritalProperty && order === 1 && hasSpouse;
    const maritalShareAmount = applyMarital ? total * MARITAL_SHARE : 0;
    const inheritanceMass = total - maritalShareAmount;

    const childrenN = Math.max(0, toInt(children));
    const parentsN = Math.max(0, Math.min(2, toInt(parents)));
    const siblingsN = Math.max(0, toInt(siblings));
    const grandparentsN = Math.max(0, toInt(grandparents));
    const auntsN = Math.max(0, toInt(aunts));

    let totalHeirs = 0;
    if (order === 1) totalHeirs = childrenN + (hasSpouse ? 1 : 0) + parentsN;
    else if (order === 2) totalHeirs = siblingsN;
    else if (order === 3) totalHeirs = grandparentsN;
    else if (order === 4) totalHeirs = auntsN;

    if (totalHeirs === 0)
      return {
        total, maritalShareAmount, inheritanceMass, heirs: [] as Heir[], totalHeirs: 0,
        hasWill, applyMarital, distributed: 0, remainingByWill: 0, spouseTotalAmount: 0,
      };

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

    let spouseTotalAmount = 0;
    if (applyMarital) {
      spouseTotalAmount = maritalShareAmount;
      const spouseHeir = heirs.find((h) => h.key === "spouse");
      if (spouseHeir) spouseTotalAmount += spouseHeir.total;
    }

    return {
      total, maritalShareAmount, inheritanceMass, heirs, totalHeirs, hasWill: willActive,
      applyMarital, distributed: distributedFromInheritance, remainingByWill, spouseTotalAmount,
    };
  }, [estate, order, maritalProperty, hasWill, hasSpouse, children, parents, siblings, grandparents, aunts]);

  const orderOptions = [
    { value: "1", label: pt.order1 },
    { value: "2", label: pt.order2 },
    { value: "3", label: pt.order3 },
    { value: "4", label: pt.order4 },
  ];

  const maritalEnabled = order === 1 && hasSpouse;

  return (
    <View>
      <InputField label={pt.estateAmount} value={estate} onChangeText={setEstate} placeholder="120000" keyboardType="decimal-pad" suffix="AZN" />

      <Select label={pt.inheritanceOrder} value={String(order)} options={orderOptions} onSelect={(v) => setOrder(Number(v) as Order)} />

      {order === 1 && (
        <View>
          <InputField label={pt.childrenCount} value={children} onChangeText={setChildren} keyboardType="number-pad" hint={pt.childrenDesc} />
          <Checkbox label={pt.hasSpouse} description={pt.hasSpouseDesc} checked={hasSpouse} onChange={setHasSpouse} />
          <View style={{ height: 8 }} />
          <InputField label={pt.parentsCount} value={parents} onChangeText={setParents} keyboardType="number-pad" hint={pt.parentsDesc} maxLength={1} />
        </View>
      )}
      {order === 2 && <InputField label={pt.siblingsCount} value={siblings} onChangeText={setSiblings} keyboardType="number-pad" />}
      {order === 3 && <InputField label={pt.grandparentsCount} value={grandparents} onChangeText={setGrandparents} keyboardType="number-pad" />}
      {order === 4 && <InputField label={pt.auntsCount} value={aunts} onChangeText={setAunts} keyboardType="number-pad" />}

      <FieldLabel>{pt.options}</FieldLabel>
      <View style={{ opacity: maritalEnabled ? 1 : 0.5, pointerEvents: maritalEnabled ? "auto" : "none" }}>
        <Checkbox
          label={pt.maritalProperty}
          description={pt.maritalPropertyDesc}
          checked={maritalProperty && maritalEnabled}
          onChange={setMaritalProperty}
        />
      </View>
      <View style={{ opacity: order === 1 ? 1 : 0.5, pointerEvents: order === 1 ? "auto" : "none" }}>
        <Checkbox label={pt.hasWill} description={pt.hasWillDesc} checked={hasWill && order === 1} onChange={setHasWill} />
      </View>

      {calculation ? (
        calculation.totalHeirs === 0 ? (
          <EmptyState icon="⚠️" text={pt.noHeirs} tint="amber" />
        ) : (
          <View>
            <TintHero
              label={pt.totalDistributed}
              value={formatMoney(calculation.distributed + calculation.maritalShareAmount)}
              sub={`${calculation.totalHeirs} ${pt.heir.toLowerCase()}`}
            />

            <Panel title={pt.result} icon="👥">
              <View style={[st.tr, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
                <Text style={[st.th, { color: colors.n580, flex: 1.6 }]}>{pt.heir}</Text>
                <Text style={[st.th, st.num, { color: colors.n580, flex: 0.5 }]}>{pt.count}</Text>
                <Text style={[st.th, st.num, { color: colors.n580 }]}>{pt.shareEach}</Text>
                <Text style={[st.th, st.num, { color: colors.n580 }]}>{pt.total}</Text>
              </View>
              {calculation.heirs.map((h) => (
                <View key={h.key} style={[st.tr, { borderBottomColor: colors.n280 }]}>
                  <View style={{ flex: 1.6, gap: 4 }}>
                    <Text style={[st.td, { color: colors.n940, fontWeight: "600" }]}>{h.label}</Text>
                    {h.isProtected && <Badge text={pt.protected} tint="amber" />}
                  </View>
                  <Text style={[st.td, st.num, { color: colors.n580, flex: 0.5 }]}>{h.count}</Text>
                  <Text style={[st.td, st.num, { color: colors.n940 }]}>{formatMoney(h.shareEach)}</Text>
                  <Text style={[st.td, st.num, { color: colors.accent, fontWeight: "700" }]}>{formatMoney(h.total)}</Text>
                </View>
              ))}
              {calculation.applyMarital && (
                <View style={[st.tr, { borderBottomColor: colors.n280, backgroundColor: TINT.blue + "1a" }]}>
                  <Text style={[st.td, { color: TINT.blue, fontWeight: "600", flex: 1.6 }]}>{pt.spouseMarital}</Text>
                  <Text style={[st.td, st.num, { color: TINT.blue, flex: 0.5 }]}>1</Text>
                  <Text style={[st.td, st.num, { color: TINT.blue }]}>{formatMoney(calculation.maritalShareAmount)}</Text>
                  <Text style={[st.td, st.num, { color: TINT.blue, fontWeight: "700" }]}>{formatMoney(calculation.maritalShareAmount)}</Text>
                </View>
              )}
              {calculation.hasWill && calculation.remainingByWill > 0.01 && (
                <View style={[st.tr, { borderBottomColor: colors.n280, backgroundColor: TINT.amber + "1a" }]}>
                  <View style={{ flex: 3.1 }}>
                    <Text style={[st.td, { color: TINT.amber, fontWeight: "600" }]}>{pt.remainingByWill}</Text>
                    <Text style={{ color: TINT.amber, fontSize: 11, marginTop: 2 }}>{pt.remainingByWillDesc}</Text>
                  </View>
                  <Text style={[st.td, st.num, { color: TINT.amber, fontWeight: "700" }]}>{formatMoney(calculation.remainingByWill)}</Text>
                </View>
              )}
            </Panel>

            <Panel title={pt.summary} icon="📊">
              <TintRow label={pt.estateLabel} value={formatMoney(calculation.total)} />
              {calculation.applyMarital && (
                <>
                  <TintRow label={pt.maritalShareLabel} value={`−${formatMoney(calculation.maritalShareAmount)}`} tint="blue" />
                  <TintRow label={pt.estateAfterMarital} value={formatMoney(calculation.inheritanceMass)} />
                </>
              )}
              {calculation.applyMarital && calculation.spouseTotalAmount > 0 && (
                <TintRow label={pt.spouseTotal} value={formatMoney(calculation.spouseTotalAmount)} tint="green" bold last />
              )}
            </Panel>

            <NoteBox>{pt.note}</NoteBox>
          </View>
        )
      ) : (
        <EmptyState icon="📜" text={pt.emptyState} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["notary-fee", "court-fee", "property-tax", "rental-income-tax"]} />
    </View>
  );
}

const st = StyleSheet.create({
  tr: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth },
  th: { flex: 1, fontSize: 11, fontWeight: "600" },
  td: { flex: 1, fontSize: 12 },
  num: { textAlign: "right" },
});
