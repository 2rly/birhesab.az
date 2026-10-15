import { useState, useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { Checkbox } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { Panel, TintRow, Badge, TintBox, TintText, NoteBox, EmptyState, FieldLabel, TINT, toInt, moneyAZN } from "./_legal-parts";

// Azərbaycan Ailə Məcəlləsi (Maddə 31-37) — boşanma zamanı əmlak bölgüsü
// Birgə mülkiyyət — nikah dövründə əldə edilmiş, alqı yolu ilə (hədiyyə/miras/özəlləşdirmə xaric)
// Şəxsi mülkiyyət — nikahdan əvvəl, hədiyyə/miras yolu ilə, fərdi əşyalar (zinət xaric)

type AcquiredWhen = "before" | "during";
type Source = "purchase" | "gift" | "inheritance" | "privatization";

interface PropertyItem {
  id: string;
  name: string;
  value: number;
  valueText: string;
  when: AcquiredWhen;
  source: Source;
  isPersonal: boolean;
  assignTo: "A" | "B";
  hasMortgage: boolean;
  mortgageRemaining: number;
  mortgageText: string;
}

const pt = {
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
  hasMortgage: "Bu əmlak ipotekadadır",
  mortgageRemaining: "Qalıq borc (AZN)",
  spouseA: "1-ci tərəf (ər)",
  spouseB: "2-ci tərəf (arvad)",
  assignTo: "Bu əmlak kimə qalır?",
  receives: "alır",
  receivedItems: "Aldığı əmlaklar",
  fairShare: "Hüquqi pay",
  actualReceived: "Faktiki alır",
  equalization: "Tarazlaşdırma (kompensasiya)",
  aPaysB: "1-ci tərəf 2-ci tərəfə ödəyir",
  bPaysA: "2-ci tərəf 1-ci tərəfə ödəyir",
  balanced: "Tarazdır — kompensasiya yoxdur",
  finalA: "1-ci tərəf — yekun",
  finalB: "2-ci tərəf — yekun",
  debtTaken: "Götürdüyü borc",
  splitRule: "Bölgü qaydası",
  fromJointPool: "birgə əmlak hovuzundan",
  personalKept: "şəxsi əmlak (öz mülkiyyətində qalır)",
  mortgagedAsset: "ipotekalı əmlak",
  children: "Uşaqlar",
  childrenCount: "Uşaqların sayı",
  childrenWith: "Uşaqlar kiminlə qalır?",
  bothEqual: "Bərabər (heç biri)",
  adjustShare: "Uşaqların qaldığı tərəfə pay artırımı",
  adjustShareDesc: "Məhkəmə qərarı ilə nadir hallarda 50%-dən artıq verilə bilər",
  noAdjust: "Bərabər (50/50)",
  adjust55: "55/45 (yüngül artım)",
  adjust60: "60/40 (maksimum)",
  jointProperty: "Birgə mülkiyyət",
  personalProperty: "Şəxsi mülkiyyət",
  netJoint: "Bölünməli xalis məbləğ",
  mortgageDeduction: "Qalıq ipoteka",
  joint: "BİRGƏ (bölünür)",
  personal: "ŞƏXSİ (bölünmür)",
  summary: "Hesablama xülasəsi",
  totalProperties: "Cəmi əmlak dəyəri",
  note: "* Real bölgü məhkəmə qərarı və qarşılıqlı razılıqla dəqiqləşir. Bu hesablayıcı təxmini ilkin məlumat verir.",
  housingRightNote:
    "ℹ️ Yaşayış hüququ qeydi: Uşaqların yanında qalan valideyn evin sahibi olmasa da, məhkəmə uşaqların mənafeyinə əsasən ona həmin mənzildə yaşamaq hüququ verə bilər.",
  emptyState: "Bölgüyə daxil etmək üçün ən azı bir əmlak əlavə edin.",
};

const formatMoney = moneyAZN;

// Birgə mülkiyyət təsnifatı
function isJoint(item: PropertyItem): boolean {
  if (item.when === "before") return false;
  if (item.source !== "purchase") return false; // hədiyyə, miras, özəlləşdirmə — şəxsi
  if (item.isPersonal) return false; // şəxsi istifadə əşyası
  return true;
}

function blankItem(id: string, name = ""): PropertyItem {
  return {
    id,
    name,
    value: 0,
    valueText: "",
    when: "during",
    source: "purchase",
    isPersonal: false,
    assignTo: "A",
    hasMortgage: false,
    mortgageRemaining: 0,
    mortgageText: "",
  };
}

const presets: { label: string; icon: string }[] = [
  { label: pt.presetHouse, icon: "🏠" },
  { label: pt.presetCar, icon: "🚗" },
  { label: pt.presetLand, icon: "🌳" },
  { label: pt.presetBank, icon: "🏦" },
  { label: pt.presetBusiness, icon: "💼" },
  { label: pt.presetJewelry, icon: "💍" },
  { label: pt.presetFurniture, icon: "🛋️" },
];

export function DivorcePropertyCalculator() {
  const { colors } = useTheme();
  const nextId = useRef(2);
  const newId = () => `p${nextId.current++}`;

  const [items, setItems] = useState<PropertyItem[]>([blankItem("p1")]);
  const [childrenCount, setChildrenCount] = useState("0");
  const [childrenWith, setChildrenWith] = useState<"none" | "A" | "B">("none");
  const [shareAdjust, setShareAdjust] = useState<"50" | "55" | "60">("50");

  const updateItem = (id: string, patch: Partial<PropertyItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));
  const addItem = (presetName = "") => {
    const id = newId();
    setItems((prev) => {
      // Avtomatik nömrələmə: eyni adla neçə əmlak var?
      let finalName = presetName;
      if (presetName) {
        const count = prev.filter((it) => it.name.startsWith(presetName)).length;
        finalName = count > 0 ? `${presetName} ${count + 1}` : presetName;
      }
      return [...prev, blankItem(id, finalName)];
    });
  };
  const clearItems = () => setItems([blankItem(newId())]);

  const calculation = useMemo(() => {
    const validItems = items.filter((it) => it.value > 0);
    if (validItems.length === 0) return null;

    const jointItems = validItems.filter(isJoint);
    const personalItems = validItems.filter((it) => !isJoint(it));

    const jointTotal = jointItems.reduce((s, it) => s + it.value, 0);
    const personalTotal = personalItems.reduce((s, it) => s + it.value, 0);

    const debtOf = (it: PropertyItem) => (it.hasMortgage ? Math.max(0, it.mortgageRemaining) : 0);

    // Qalıq ipoteka borcu yalnız birgə əmlaklarda nəzərə alınır
    const totalMortgageDebt = jointItems.reduce((s, it) => s + debtOf(it), 0);
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

    const aFair = netJoint * aPct;
    const bFair = netJoint * bPct;

    const aJointItems = jointItems.filter((it) => it.assignTo === "A");
    const bJointItems = jointItems.filter((it) => it.assignTo === "B");

    const aJointNet = aJointItems.reduce((s, it) => s + it.value - debtOf(it), 0);
    const bJointNet = bJointItems.reduce((s, it) => s + it.value - debtOf(it), 0);
    const aDebt = aJointItems.reduce((s, it) => s + debtOf(it), 0);
    const bDebt = bJointItems.reduce((s, it) => s + debtOf(it), 0);

    const aPersonalItems = personalItems.filter((it) => it.assignTo === "A");
    const bPersonalItems = personalItems.filter((it) => it.assignTo === "B");
    const aPersonalTotal = aPersonalItems.reduce((s, it) => s + it.value, 0);
    const bPersonalTotal = bPersonalItems.reduce((s, it) => s + it.value, 0);

    const aDelta = aJointNet - aFair;
    const bDelta = bJointNet - bFair;

    let payer: "A" | "B" | null = null;
    let paymentAmount = 0;
    if (aDelta > 0.01) {
      payer = "A";
      paymentAmount = aDelta;
    } else if (bDelta > 0.01) {
      payer = "B";
      paymentAmount = bDelta;
    }

    const aFinal = aPersonalTotal + aJointNet - (payer === "A" ? paymentAmount : 0) + (payer === "B" ? paymentAmount : 0);
    const bFinal = bPersonalTotal + bJointNet - (payer === "B" ? paymentAmount : 0) + (payer === "A" ? paymentAmount : 0);

    return {
      jointTotal, personalTotal, totalMortgageDebt, netJoint, aFair, bFair, aPct, bPct,
      aJointItems, bJointItems, aJointNet, bJointNet, aDebt, bDebt,
      aPersonalItems, bPersonalItems, aPersonalTotal, bPersonalTotal, payer, paymentAmount, aFinal, bFinal,
    };
  }, [items, childrenWith, shareAdjust]);

  const showChildren = childrenWith !== "none" && toInt(childrenCount) > 0;

  const renderSpouse = (side: "A" | "B") => {
    if (!calculation) return null;
    const c = calculation;
    const isA = side === "A";
    const tint = isA ? TINT.blue : TINT.pink;
    const jointItems = isA ? c.aJointItems : c.bJointItems;
    const personalItems = isA ? c.aPersonalItems : c.bPersonalItems;
    const jointNet = isA ? c.aJointNet : c.bJointNet;
    const debt = isA ? c.aDebt : c.bDebt;
    const personalTotal = isA ? c.aPersonalTotal : c.bPersonalTotal;
    const final = isA ? c.aFinal : c.bFinal;
    const other = isA ? pt.spouseB : pt.spouseA;
    const pays = c.payer === side && c.paymentAmount > 0.01;
    const gets = c.payer !== null && c.payer !== side && c.paymentAmount > 0.01;
    return (
      <View style={[st.spouseCard, { borderColor: tint + "66", backgroundColor: colors.n200 }]}>
        <View style={[st.spouseHead, { backgroundColor: tint }]}>
          <Text style={st.spouseHeadLabel}>
            {isA ? pt.spouseA : pt.spouseB} {pt.receives}
          </Text>
          <Text style={st.spouseHeadValue}>{formatMoney(final)}</Text>
        </View>
        <View style={{ padding: 12 }}>
          {(jointItems.length > 0 || personalItems.length > 0) && (
            <View style={{ marginBottom: 10 }}>
              <Text style={[st.small, { color: colors.n580, fontWeight: "600", marginBottom: 6 }]}>{pt.receivedItems}</Text>
              {jointItems.map((it) => (
                <View key={it.id} style={st.itemLine}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.n940, fontSize: 13 }}>{it.name || "—"}</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                      <Badge text={pt.fromJointPool} tint="green" />
                      {it.hasMortgage && it.mortgageRemaining > 0 && (
                        <Badge text={`−${formatMoney(it.mortgageRemaining)}`} tint="red" />
                      )}
                    </View>
                  </View>
                  <Text style={{ color: colors.n940, fontSize: 13, fontWeight: "600" }}>{formatMoney(it.value)}</Text>
                </View>
              ))}
              {personalItems.map((it) => (
                <View key={it.id} style={st.itemLine}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.n940, fontSize: 13 }}>{it.name || "—"}</Text>
                    <Badge text={pt.personalKept} tint="amber" />
                  </View>
                  <Text style={{ color: colors.n940, fontSize: 13, fontWeight: "600" }}>{formatMoney(it.value)}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={[st.sep, { borderTopColor: colors.n280 }]}>
            <Line label={`${pt.actualReceived} (${pt.fromJointPool})`} value={formatMoney(jointNet)} />
            {debt > 0 && <Line label={pt.debtTaken} value={`−${formatMoney(debt)}`} color={TINT.red} />}
            <Line label={pt.personalProperty} value={formatMoney(personalTotal)} valueColor={TINT.amber} />
            {pays && <Line label={`→ ${other}`} value={`−${formatMoney(c.paymentAmount)}`} color={TINT.red} bold />}
            {gets && <Line label={`← ${other}`} value={`+${formatMoney(c.paymentAmount)}`} color={TINT.green} bold />}
            <View style={[st.sep, { borderTopColor: colors.n280, marginTop: 6 }]}>
              <Line label={isA ? pt.finalA : pt.finalB} value={formatMoney(final)} color={tint} bold />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      {/* Əmlak siyahısı */}
      <View style={st.headRow}>
        <View style={{ flex: 1 }}>
          <Text style={[st.h, { color: colors.n940 }]}>{pt.properties}</Text>
          <Text style={[st.small, { color: colors.n580 }]}>{pt.propertiesHint}</Text>
        </View>
        <View style={[st.pill, { backgroundColor: colors.accent + "26" }]}>
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "700" }}>
            {items.filter((it) => it.value > 0 || it.name).length} {pt.itemCount}
          </Text>
        </View>
      </View>

      {/* Sürətli əlavə */}
      <View style={[st.quick, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
        <Text style={[st.small, { color: colors.n580, fontWeight: "600", marginBottom: 8 }]}>⚡ {pt.quickAdd}</Text>
        <View style={st.wrap}>
          {presets.map((p) => (
            <Pressable
              key={p.label}
              onPress={() => addItem(p.label)}
              style={[st.presetBtn, { borderColor: colors.n280, backgroundColor: colors.n145 }]}
            >
              <Text style={{ fontSize: 12, color: colors.n940, fontWeight: "600" }}>
                {p.icon} + {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={[st.quickFoot, { borderTopColor: colors.n280 }]}>
          <Pressable onPress={() => addItem()} style={[st.presetBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
            <Text style={{ fontSize: 12, color: colors.onAccent, fontWeight: "700" }}>+ {pt.addProperty}</Text>
          </Pressable>
          {items.length > 1 && (
            <Pressable onPress={clearItems} style={[st.presetBtn, { borderColor: TINT.red + "66", marginLeft: "auto" }]}>
              <Text style={{ fontSize: 12, color: TINT.red, fontWeight: "600" }}>{pt.clearAll}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {items.map((it, idx) => {
        const joint = it.value > 0 && isJoint(it);
        const tintC = it.value > 0 ? (joint ? TINT.green : TINT.amber) : undefined;
        return (
          <View
            key={it.id}
            style={[
              st.itemCard,
              {
                borderColor: tintC ? tintC + "55" : colors.n280,
                backgroundColor: tintC ? tintC + "0f" : colors.n200,
              },
            ]}
          >
            <View style={st.itemTop}>
              <Text style={[st.small, { color: colors.n580 }]}>#{idx + 1}</Text>
              {items.length > 1 && (
                <Pressable onPress={() => removeItem(it.id)} hitSlop={8}>
                  <Text style={{ color: TINT.red, fontSize: 12, fontWeight: "600" }}>{pt.remove}</Text>
                </Pressable>
              )}
            </View>
            <InputField
              label={pt.propertyName}
              value={it.name}
              onChangeText={(v) => updateItem(it.id, { name: v })}
              placeholder={pt.placeholderName}
            />
            <InputField
              label={pt.propertyValue}
              value={it.valueText}
              onChangeText={(v) => updateItem(it.id, { valueText: v, value: parseFloat(v.replace(",", ".")) || 0 })}
              placeholder={pt.propertyValue}
              keyboardType="decimal-pad"
              suffix="AZN"
            />
            <Select
              label={pt.when}
              value={it.when}
              onSelect={(v) => updateItem(it.id, { when: v })}
              options={[
                { value: "before", label: pt.beforeMarriage },
                { value: "during", label: pt.duringMarriage },
              ]}
            />
            <Select
              label={pt.source}
              value={it.source}
              onSelect={(v) => updateItem(it.id, { source: v })}
              options={[
                { value: "purchase", label: pt.purchase },
                { value: "gift", label: pt.gift },
                { value: "inheritance", label: pt.inheritance },
                { value: "privatization", label: pt.privatization },
              ]}
            />
            <Checkbox
              label={pt.isPersonal}
              description={pt.isPersonalDesc}
              checked={it.isPersonal}
              onChange={(v) => updateItem(it.id, { isPersonal: v })}
            />

            {/* Bu əmlak kimə qalır? */}
            <View style={{ marginTop: 8, marginBottom: 8 }}>
              <FieldLabel>{pt.assignTo}</FieldLabel>
              <View style={[st.split, { borderColor: colors.n280 }]}>
                {(["A", "B"] as const).map((side) => {
                  const active = it.assignTo === side;
                  const c = side === "A" ? TINT.blue : TINT.pink;
                  return (
                    <Pressable
                      key={side}
                      onPress={() => updateItem(it.id, { assignTo: side })}
                      style={[st.splitBtn, { backgroundColor: active ? c : "transparent" }]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "#fff" : colors.n580, textAlign: "center" }}>
                        {side === "A" ? pt.spouseA : pt.spouseB}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* İpoteka — yalnız birgə əmlak üçün */}
            {joint && (
              <View>
                <Checkbox label={pt.hasMortgage} checked={it.hasMortgage} onChange={(v) => updateItem(it.id, { hasMortgage: v })} />
                {it.hasMortgage && (
                  <View style={{ paddingLeft: 12, marginTop: 6 }}>
                    <InputField
                      label={pt.mortgageRemaining}
                      value={it.mortgageText}
                      onChangeText={(v) =>
                        updateItem(it.id, { mortgageText: v, mortgageRemaining: parseFloat(v.replace(",", ".")) || 0 })
                      }
                      placeholder="0"
                      keyboardType="decimal-pad"
                      suffix="AZN"
                    />
                  </View>
                )}
              </View>
            )}

            {it.value > 0 && (
              <View style={[st.badges, { borderTopColor: colors.n280 }]}>
                <Badge text={joint ? pt.joint : pt.personal} tint={joint ? "green" : "amber"} />
                {joint && it.hasMortgage && it.mortgageRemaining > 0 && (
                  <Badge text={`${pt.mortgagedAsset}: −${formatMoney(it.mortgageRemaining)}`} tint="red" />
                )}
              </View>
            )}
          </View>
        );
      })}

      {/* Uşaqlar */}
      <Text style={[st.h, { color: colors.n940, marginTop: 16, marginBottom: 8 }]}>{pt.children}</Text>
      <InputField label={pt.childrenCount} value={childrenCount} onChangeText={setChildrenCount} keyboardType="number-pad" />
      <Select
        label={pt.childrenWith}
        value={childrenWith}
        onSelect={setChildrenWith}
        options={[
          { value: "none", label: pt.bothEqual },
          { value: "A", label: pt.spouseA },
          { value: "B", label: pt.spouseB },
        ]}
      />
      {showChildren && (
        <View style={{ marginBottom: 8 }}>
          <FieldLabel>{pt.adjustShare}</FieldLabel>
          <View style={[st.split, { borderColor: colors.n280 }]}>
            {(["50", "55", "60"] as const).map((v) => {
              const active = shareAdjust === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setShareAdjust(v)}
                  style={[st.splitBtn, { backgroundColor: active ? colors.accent : "transparent" }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", textAlign: "center", color: active ? colors.onAccent : colors.n580 }}>
                    {v === "50" ? pt.noAdjust : v === "55" ? pt.adjust55 : pt.adjust60}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[st.small, { color: colors.n580, marginTop: 4 }]}>{pt.adjustShareDesc}</Text>
        </View>
      )}

      {/* Nəticə */}
      {calculation ? (
        <View>
          <Panel title={pt.summary} icon="📊">
            <TintRow label={pt.totalProperties} value={formatMoney(calculation.jointTotal + calculation.personalTotal)} />
            <TintRow label={pt.jointProperty} value={formatMoney(calculation.jointTotal)} tint="green" />
            <TintRow label={pt.personalProperty} value={formatMoney(calculation.personalTotal)} tint="amber" />
            {calculation.totalMortgageDebt > 0 && (
              <TintRow label={pt.mortgageDeduction} value={`−${formatMoney(calculation.totalMortgageDebt)}`} tint="red" />
            )}
            <TintRow label={pt.netJoint} value={formatMoney(calculation.netJoint)} tint="blue" bold />
            <TintRow
              label={pt.splitRule}
              value={`${(calculation.aPct * 100).toFixed(0)}% / ${(calculation.bPct * 100).toFixed(0)}%`}
            />
            <TintRow label={`${pt.spouseA} — ${pt.fairShare}`} value={formatMoney(calculation.aFair)} valueTint="blue" />
            <TintRow label={`${pt.spouseB} — ${pt.fairShare}`} value={formatMoney(calculation.bFair)} valueTint="pink" last />
          </Panel>

          {renderSpouse("A")}
          {renderSpouse("B")}

          {calculation.payer && calculation.paymentAmount > 0.01 ? (
            <TintBox tint="amber">
              <TintText tint="amber" bold size={12}>⚖️ {pt.equalization}</TintText>
              <TintText tint="amber" bold size={16}>
                {calculation.payer === "A" ? pt.aPaysB : pt.bPaysA}:{" "}
                <Text style={{ fontSize: 22 }}>{formatMoney(calculation.paymentAmount)}</Text>
              </TintText>
            </TintBox>
          ) : (
            <TintBox tint="green" center>
              <TintText tint="green" bold>✓ {pt.balanced}</TintText>
            </TintBox>
          )}

          {showChildren && (
            <TintBox tint="blue">
              <TintText tint="blue">{pt.housingRightNote}</TintText>
            </TintBox>
          )}

          <NoteBox>{pt.note}</NoteBox>
        </View>
      ) : (
        <EmptyState icon="💔" text={pt.emptyState} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["inheritance", "notary-fee", "court-fee", "aliment"]} />
    </View>
  );
}

function Line({
  label,
  value,
  color,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  valueColor?: string;
  bold?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={st.line}>
      <Text style={{ flex: 1, fontSize: 13, color: color ?? colors.n580, fontWeight: bold ? "700" : "400" }}>{label}</Text>
      <Text style={{ fontSize: 13, color: valueColor ?? color ?? colors.n940, fontWeight: bold ? "700" : "600" }}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  headRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 10 },
  h: { fontSize: 15, fontWeight: "700" },
  small: { fontSize: 12, lineHeight: 16 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  quick: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  quickFoot: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  itemCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  itemTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  split: { flexDirection: "row", borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  splitBtn: { flex: 1, paddingVertical: 9, paddingHorizontal: 4, justifyContent: "center" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  spouseCard: { borderRadius: 16, borderWidth: 2, overflow: "hidden", marginTop: 16 },
  spouseHead: { paddingHorizontal: 16, paddingVertical: 14 },
  spouseHeadLabel: { color: "#ffffffd9", fontSize: 12 },
  spouseHeadValue: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 2 },
  itemLine: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 5 },
  sep: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  line: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 },
});
