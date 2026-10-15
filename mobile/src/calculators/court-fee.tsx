import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { Panel, TintRow, TintBox, TintText, EmptyState, FieldLabel, TINT } from "./_legal-parts";

type ClaimType = "property" | "non-property" | "divorce" | "appeal";
type PersonType = "individual" | "legal";

const claimTypes: { value: ClaimType; label: string; icon: string; description: string }[] = [
  { value: "property", label: "Əmlak iddiası", icon: "🏠", description: "Əmlak tələbləri üzrə" },
  { value: "non-property", label: "Qeyri-əmlak", icon: "📝", description: "Qeyri-əmlak iddiası" },
  { value: "divorce", label: "Boşanma", icon: "💔", description: "Boşanma işi" },
  { value: "appeal", label: "Apellyasiya", icon: "⚖️", description: "Apellyasiya şikayəti" },
];

const pt = {
  formulaTitle: "Məhkəmə rüsumu necə hesablanır?",
  formulaContent: `Əmlak iddiaları:
• İddia məbləğinin 1%-i
• Minimum rüsum: 10 AZN

Qeyri-əmlak iddiaları:
• Fiziki şəxs: 20 AZN
• Hüquqi şəxs: 50 AZN

Boşanma işi:
• 20 AZN

Apellyasiya şikayəti:
• İlk instansiya rüsumunun 50%-i

Qeyd: Dövlət rüsumu məhkəməyə müraciət zamanı ödənilir.
Bəzi hallarda rüsumdan azad edilmə və güzəştlər tətbiq oluna bilər
(məsələn, əmək mübahisələri, əlillik və s.).`,
  claimTypeLabel: "İddia növü",
  claimAmountLabel: "İddia məbləği (AZN)",
  applicantStatus: "Müraciət edənin statusu",
  individual: "Fiziki şəxs",
  legalEntity: "Hüquqi şəxs",
  firstInstanceFee: "İlk instansiya rüsumu (AZN)",
  appealFeeNote: "Apellyasiya rüsumu ilk instansiya rüsumunun 50%-i qədərdir",
  courtFee: "Məhkəmə rüsumu",
  claimType: "İddia növü",
  detailedCalc: "Ətraflı hesablama",
  claimAmount: "İddia məbləği",
  appliedTariff: "Tətbiq olunan tarif",
  applicant: "Müraciət edən",
  firstInstanceFeeLabel: "İlk instansiya rüsumu",
  calcRule: "Hesablama qaydası",
  comparisonByAmount: "Məbləğə görə müqayisə",
  allClaimTypes: "Bütün iddia növləri",
  propertyClaim: "Əmlak iddiası",
  propertyClaimRate: "İddia məbləğinin 1% (min. 10 AZN)",
  nonPropertyIndividual: "Qeyri-əmlak (fiziki)",
  nonPropertyLegal: "Qeyri-əmlak (hüquqi)",
  divorceLabel: "Boşanma",
  appealLabel: "Apellyasiya",
  appealRate: "İlk instansiya rüsumunun 50%-i",
  exemptionsTitle: "Rüsumdan azad olunan hallar:",
  exemption1: "Əmək mübahisələri üzrə işçilər",
  exemption2: "Alimentlə bağlı iddialar",
  exemption3: "I və II qrup əlillər (iddia 1000 AZN-dək)",
  exemption4: "Dövlət orqanları (dövlət marağı üçün)",
  infoNote:
    "Bu hesablama Azərbaycan Respublikasının Mülki Prosessual Məcəlləsinə əsaslanır. Bəzi hallarda məhkəmə rüsumunun azaldılması və ya taksitlə ödənilməsi mümkündür. Dəqiq məlumat üçün vəkilə müraciət edin.",
  attention: "Diqqət:",
  emptyState: "Nəticəni görmək üçün lazımi məlumatları daxil edin.",
  minFeeApplied: "Minimum rüsum tətbiq olundu (10 AZN)",
  claimPercentage: "İddia məbləğinin 1%-i",
  individualLabel: "Fiziki şəxs",
  legalLabel: "Hüquqi şəxs",
  appealCalcNote: "İlk instansiya rüsumunun 50%-i",
};

function getPropertyClaimFee(amount: number): number {
  const fee = amount * 0.01; // iddia məbləğinin 1%-i
  return Math.max(fee, 10); // minimum 10 AZN
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const num = (s: string) => parseFloat(s.replace(",", "."));

export function CourtFeeCalculator() {
  const { colors } = useTheme();
  const [claimType, setClaimType] = useState<ClaimType>("property");
  const [claimAmount, setClaimAmount] = useState("");
  const [personType, setPersonType] = useState<PersonType>("individual");
  const [originalFee, setOriginalFee] = useState("");

  const result = useMemo(() => {
    switch (claimType) {
      case "property": {
        const amount = num(claimAmount);
        if (!amount || amount <= 0) return null;
        const fee = getPropertyClaimFee(amount);
        return {
          type: "property" as const,
          fee,
          claimAmount: amount,
          percentage: (fee / amount) * 100,
          note: fee === 10 ? pt.minFeeApplied : pt.claimPercentage,
        };
      }
      case "non-property": {
        const fee = personType === "individual" ? 20 : 50;
        return { type: "non-property" as const, fee, personType, label: personType === "individual" ? pt.individualLabel : pt.legalLabel };
      }
      case "divorce":
        return { type: "divorce" as const, fee: 20 };
      case "appeal": {
        const origFee = num(originalFee);
        if (!origFee || origFee <= 0) return null;
        return { type: "appeal" as const, fee: origFee * 0.5, originalFee: origFee, note: pt.appealCalcNote };
      }
      default:
        return null;
    }
  }, [claimType, claimAmount, personType, originalFee]);

  const current = claimTypes.find((c) => c.value === claimType);
  const activeBg = TINT.blue + "1a";

  const overview: { icon: string; label: string; value: string; muted: boolean; active: boolean }[] = [
    { icon: "🏠", label: pt.propertyClaim, value: pt.propertyClaimRate, muted: true, active: claimType === "property" },
    { icon: "📝", label: pt.nonPropertyIndividual, value: "20 AZN", muted: false, active: claimType === "non-property" },
    { icon: "📝", label: pt.nonPropertyLegal, value: "50 AZN", muted: false, active: claimType === "non-property" },
    { icon: "💔", label: pt.divorceLabel, value: "20 AZN", muted: false, active: claimType === "divorce" },
    { icon: "⚖️", label: pt.appealLabel, value: pt.appealRate, muted: true, active: claimType === "appeal" },
  ];

  return (
    <View>
      <FieldLabel>{pt.claimTypeLabel}</FieldLabel>
      <View style={st.grid}>
        {claimTypes.map((ct) => {
          const active = claimType === ct.value;
          return (
            <Pressable
              key={ct.value}
              onPress={() => setClaimType(ct.value)}
              style={[st.typeBtn, { borderColor: active ? colors.accent : colors.n280, backgroundColor: active ? colors.accent + "1f" : colors.n200 }]}
            >
              <Text style={{ fontSize: 24, marginBottom: 2 }}>{ct.icon}</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: active ? colors.accent : colors.n940, textAlign: "center" }}>{ct.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {claimType === "property" && (
        <InputField label={`💰 ${pt.claimAmountLabel}`} value={claimAmount} onChangeText={setClaimAmount} placeholder="50000" keyboardType="decimal-pad" suffix="AZN" />
      )}

      {claimType === "non-property" && (
        <View>
          <FieldLabel>{pt.applicantStatus}</FieldLabel>
          <View style={st.grid}>
            {(
              [
                { k: "individual", icon: "👤", label: pt.individual, fee: "20 AZN" },
                { k: "legal", icon: "🏢", label: pt.legalEntity, fee: "50 AZN" },
              ] as const
            ).map((o) => {
              const active = personType === o.k;
              return (
                <Pressable
                  key={o.k}
                  onPress={() => setPersonType(o.k)}
                  style={[st.personBtn, { borderColor: active ? colors.accent : colors.n280, backgroundColor: active ? colors.accent + "1f" : colors.n200 }]}
                >
                  <Text style={{ fontSize: 20, marginBottom: 2 }}>{o.icon}</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? colors.accent : colors.n940 }}>{o.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.n580 }}>{o.fee}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {claimType === "appeal" && (
        <InputField
          label={`📋 ${pt.firstInstanceFee}`}
          value={originalFee}
          onChangeText={setOriginalFee}
          placeholder="500"
          keyboardType="decimal-pad"
          suffix="AZN"
          hint={pt.appealFeeNote}
        />
      )}

      {result ? (
        <View>
          <View style={st.cardRow}>
            <View style={[st.card, { backgroundColor: TINT.blue, borderColor: TINT.blue }]}>
              <Text style={{ fontSize: 12, color: "#ffffffd9" }}>{pt.courtFee}</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 2 }}>{fmt(result.fee)}</Text>
              <Text style={{ fontSize: 11, color: "#ffffffcc", marginTop: 2 }}>AZN</Text>
            </View>
            <View style={[st.card, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={{ fontSize: 12, color: colors.n580 }}>{pt.claimType}</Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: colors.n940, marginTop: 2, textAlign: "center" }}>{current?.label}</Text>
              <Text style={{ fontSize: 11, color: colors.n580, marginTop: 2, textAlign: "center" }}>{current?.description}</Text>
            </View>
          </View>

          <Panel title={pt.detailedCalc} icon="📋">
            <TintRow label={pt.claimType} value={current?.description ?? ""} />
            {result.type === "property" && (
              <>
                <TintRow label={pt.claimAmount} value={`${fmt(result.claimAmount)} AZN`} />
                <TintRow label={pt.appliedTariff} value={result.note} />
              </>
            )}
            {result.type === "non-property" && <TintRow label={pt.applicant} value={result.label} />}
            {result.type === "appeal" && (
              <>
                <TintRow label={pt.firstInstanceFeeLabel} value={`${fmt(result.originalFee)} AZN`} />
                <TintRow label={pt.calcRule} value={result.note} />
              </>
            )}
            <TintRow label={pt.courtFee} value={`${fmt(result.fee)} AZN`} tint="blue" bold last />
          </Panel>

          {result.type === "property" && (
            <Panel title={pt.comparisonByAmount} icon="📊">
              {[
                { label: "1 000 AZN", amount: 1000 },
                { label: "5 000 AZN", amount: 5000 },
                { label: "10 000 AZN", amount: 10000 },
                { label: "50 000 AZN", amount: 50000 },
                { label: "100 000 AZN", amount: 100000 },
                { label: "500 000 AZN", amount: 500000 },
              ].map((item, i, arr) => {
                const fee = getPropertyClaimFee(item.amount);
                const maxFee = getPropertyClaimFee(500000);
                const isActive = Math.abs(result.claimAmount - item.amount) < 1;
                return (
                  <View
                    key={item.amount}
                    style={[
                      st.cmpRow,
                      { borderBottomColor: colors.n280, borderBottomWidth: i === arr.length - 1 ? 0 : StyleSheet.hairlineWidth },
                      isActive && { backgroundColor: activeBg },
                    ]}
                  >
                    <Text style={{ flex: 1, fontSize: 13, color: isActive ? TINT.blue : colors.n940, fontWeight: isActive ? "700" : "400" }}>
                      {item.label}
                    </Text>
                    <View style={[st.barTrack, { backgroundColor: colors.n240 }]}>
                      <View style={{ height: "100%", borderRadius: 6, width: `${(fee / maxFee) * 100}%`, backgroundColor: isActive ? TINT.blue : colors.n400 }} />
                    </View>
                    <Text style={{ width: 92, textAlign: "right", fontSize: 13, color: isActive ? TINT.blue : colors.n940, fontWeight: isActive ? "700" : "600" }}>
                      {fmt(fee)} AZN
                    </Text>
                  </View>
                );
              })}
            </Panel>
          )}

          <Panel title={pt.allClaimTypes} icon="📊">
            {overview.map((o, i) => (
              <View
                key={i}
                style={[
                  st.cmpRow,
                  { borderBottomColor: colors.n280, borderBottomWidth: i === overview.length - 1 ? 0 : StyleSheet.hairlineWidth },
                  o.active && { backgroundColor: activeBg },
                ]}
              >
                <Text style={{ flex: 1, fontSize: 13, color: colors.n940 }}>
                  {o.icon} {o.label}
                </Text>
                <Text style={{ maxWidth: "50%", textAlign: "right", fontSize: 13, color: o.muted ? colors.n580 : colors.n940, fontWeight: o.muted ? "400" : "600" }}>
                  {o.value}
                </Text>
              </View>
            ))}
          </Panel>

          <TintBox tint="green">
            <TintText tint="green" bold size={14}>{pt.exemptionsTitle}</TintText>
            <View style={{ marginTop: 6, gap: 3 }}>
              {[pt.exemption1, pt.exemption2, pt.exemption3, pt.exemption4].map((e) => (
                <TintText key={e} tint="green" size={12}>- {e}</TintText>
              ))}
            </View>
          </TintBox>

          <TintBox tint="blue">
            <TintText tint="blue" size={12}>
              <Text style={{ fontWeight: "700" }}>{pt.attention}</Text> {pt.infoNote}
            </TintText>
          </TintBox>
        </View>
      ) : (
        <EmptyState icon="⚖️" text={pt.emptyState} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["notary-fee", "property-tax", "court-fee", "customs-duty"]} />
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  typeBtn: { flexBasis: "47%", flexGrow: 1, alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4 },
  personBtn: { flex: 1, alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingVertical: 10 },
  cardRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  card: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", justifyContent: "center" },
  cmpRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  barTrack: { width: 60, height: 10, borderRadius: 6, overflow: "hidden" },
});
