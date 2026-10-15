import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { Panel, TintRow, TintBox, TintText, EmptyState, FieldLabel, TINT } from "./_legal-parts";

type TransactionType = "sale" | "power-of-attorney" | "will" | "lease" | "company";

const transactionTypes: { value: TransactionType; label: string; icon: string; description: string }[] = [
  { value: "sale", label: "Alqı-satqı", icon: "🏠", description: "Alqı-satqı müqaviləsi" },
  { value: "power-of-attorney", label: "Etibarnamə", icon: "📝", description: "Etibarnamə təsdiqi" },
  { value: "will", label: "Vəsiyyətnamə", icon: "📜", description: "Vəsiyyətnamə təsdiqi" },
  { value: "lease", label: "İcarə", icon: "🔑", description: "İcarə müqaviləsi" },
  { value: "company", label: "Şirkət təsis", icon: "🏢", description: "Şirkət təsis sənədləri" },
];

const pt = {
  formulaTitle: "Notarius xərcləri necə hesablanır?",
  formulaContent: `Alqı-satqı müqaviləsi:
• 10 000 AZN-dək: 0.5% + 15 AZN
• 10 001–50 000 AZN: 50 + 0.3% (10K-dən artıq hissə)
• 50 001–100 000 AZN: 170 + 0.2% (50K-dən artıq hissə)
• 100 000+ AZN: 270 + 0.1% (100K-dən artıq hissə)

Etibarnamə:
• Sadə etibarnamə: 20 AZN
• Ümumi etibarnamə: 50 AZN

Vəsiyyətnamə: 30 AZN

İcarə müqaviləsi:
• 5 000 AZN-dək: 0.5% + 10 AZN
• 5 001–20 000 AZN: 35 + 0.3%
• 20 000+ AZN: 80 + 0.2%

Şirkət təsis sənədləri:
• 100 AZN + nizamnamə kapitalından 0.5% (10K-dək)
• 10K+ üzərindən: 150 + 0.3%`,
  transactionType: "Əməliyyat növü",
  propertyPrice: "Əmlakın qiyməti (AZN)",
  poaType: "Etibarnamə növü",
  simplePoa: "Sadə etibarnamə",
  generalPoa: "Ümumi etibarnamə",
  monthlyRent: "Aylıq icarə haqqı (AZN)",
  leaseDuration: "Müddət (ay)",
  charterCapital: "Nizamnamə kapitalı (AZN)",
  notaryFee: "Notarius rüsumu",
  propertyPriceResult: "Əmlak qiyməti",
  totalRent: "Ümumi icarə məbləği",
  charterCapitalResult: "Nizamnamə kapitalı",
  poaTypeResult: "Etibarnamə növü",
  fixedFee: "Sabit rüsum",
  documentType: "Sənəd növü",
  willLabel: "Vəsiyyətnamə",
  detailedCalc: "Ətraflı hesablama",
  transactionTypeLabel: "Əməliyyat növü",
  appliedTariff: "Tətbiq olunan tarif",
  monthlyRentResult: "Aylıq icarə",
  durationResult: "Müddət",
  months: "ay",
  tariffComparison: "Tarif pilləsi müqayisəsi",
  infoNote:
    "Bu hesablama Notariat haqqında Azərbaycan Respublikasının Qanununa əsaslanır. Faktiki xərclər notariat kontoruna və əlavə xidmətlərə (surətçıxarma, tərcümə və s.) görə fərqlənə bilər. Dəqiq məlumat üçün notariusa müraciət edin.",
  attention: "Diqqət:",
  emptyState: "Nəticəni görmək üçün lazımi məlumatları daxil edin.",
};

// Notarius rüsumları
function getSaleFee(price: number): number {
  if (price <= 10000) return price * 0.005 + 15;
  if (price <= 50000) return 50 + (price - 10000) * 0.003;
  if (price <= 100000) return 170 + (price - 50000) * 0.002;
  return 270 + (price - 100000) * 0.001;
}

function getPowerOfAttorneyFee(type: "simple" | "general"): number {
  return type === "simple" ? 20 : 50;
}

function getWillFee(): number {
  return 30;
}

function getLeaseFee(monthlyRent: number, months: number): number {
  const totalRent = monthlyRent * months;
  if (totalRent <= 5000) return totalRent * 0.005 + 10;
  if (totalRent <= 20000) return 35 + (totalRent - 5000) * 0.003;
  return 80 + (totalRent - 20000) * 0.002;
}

function getCompanyFee(capitalAmount: number): number {
  const baseFee = 100;
  if (capitalAmount <= 10000) return baseFee + capitalAmount * 0.005;
  return baseFee + 50 + (capitalAmount - 10000) * 0.003;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const num = (s: string) => parseFloat(s.replace(",", "."));

export function NotaryCalculator() {
  const { colors } = useTheme();
  const [transactionType, setTransactionType] = useState<TransactionType>("sale");
  const [salePrice, setSalePrice] = useState("");
  const [poaType, setPoaType] = useState<"simple" | "general">("simple");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [leaseMonths, setLeaseMonths] = useState("12");
  const [capitalAmount, setCapitalAmount] = useState("");

  const result = useMemo(() => {
    switch (transactionType) {
      case "sale": {
        const price = num(salePrice);
        if (!price || price <= 0) return null;
        const fee = getSaleFee(price);
        let bracket = "";
        if (price <= 10000) bracket = "0.5% + 15 AZN";
        else if (price <= 50000) bracket = "50 + 0.3% (10K+)";
        else if (price <= 100000) bracket = "170 + 0.2% (50K+)";
        else bracket = "270 + 0.1% (100K+)";
        return { type: "sale" as const, fee, baseAmount: price, bracket, percentage: (fee / price) * 100 };
      }
      case "power-of-attorney": {
        const fee = getPowerOfAttorneyFee(poaType);
        return { type: "poa" as const, fee, poaType, label: poaType === "simple" ? pt.simplePoa : pt.generalPoa };
      }
      case "will":
        return { type: "will" as const, fee: getWillFee() };
      case "lease": {
        const rent = num(monthlyRent);
        const months = parseInt(leaseMonths, 10);
        if (!rent || rent <= 0 || !months || months <= 0) return null;
        const totalRent = rent * months;
        const fee = getLeaseFee(rent, months);
        return { type: "lease" as const, fee, monthlyRent: rent, months, totalRent, percentage: (fee / totalRent) * 100 };
      }
      case "company": {
        const capital = num(capitalAmount);
        if (!capital || capital <= 0) return null;
        const fee = getCompanyFee(capital);
        return { type: "company" as const, fee, capital, percentage: (fee / capital) * 100 };
      }
      default:
        return null;
    }
  }, [transactionType, salePrice, poaType, monthlyRent, leaseMonths, capitalAmount]);

  const side = (() => {
    if (!result) return null;
    switch (result.type) {
      case "sale":
        return { label: pt.propertyPriceResult, value: fmt(result.baseAmount), sub: `AZN (${result.percentage.toFixed(2)}%)` };
      case "lease":
        return { label: pt.totalRent, value: fmt(result.totalRent), sub: `${result.months} ${pt.months} × ${fmt(result.monthlyRent)} AZN` };
      case "company":
        return { label: pt.charterCapitalResult, value: fmt(result.capital), sub: `AZN (${result.percentage.toFixed(2)}%)` };
      case "poa":
        return { label: pt.poaTypeResult, value: result.label, sub: pt.fixedFee };
      case "will":
        return { label: pt.documentType, value: pt.willLabel, sub: pt.fixedFee };
    }
  })();

  return (
    <View>
      <FieldLabel>{pt.transactionType}</FieldLabel>
      <View style={st.grid}>
        {transactionTypes.map((tt) => {
          const active = transactionType === tt.value;
          return (
            <Pressable
              key={tt.value}
              onPress={() => setTransactionType(tt.value)}
              style={[
                st.typeBtn,
                { borderColor: active ? colors.accent : colors.n280, backgroundColor: active ? colors.accent + "1f" : colors.n200 },
              ]}
            >
              <Text style={{ fontSize: 24, marginBottom: 2 }}>{tt.icon}</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: active ? colors.accent : colors.n940, textAlign: "center" }}>{tt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {transactionType === "sale" && (
        <InputField label={`💰 ${pt.propertyPrice}`} value={salePrice} onChangeText={setSalePrice} placeholder="80000" keyboardType="decimal-pad" suffix="AZN" />
      )}

      {transactionType === "power-of-attorney" && (
        <View>
          <FieldLabel>{pt.poaType}</FieldLabel>
          <View style={[st.grid, { marginBottom: 16 }]}>
            {(["simple", "general"] as const).map((k) => {
              const active = poaType === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setPoaType(k)}
                  style={[
                    st.poaBtn,
                    { borderColor: active ? colors.accent : colors.n280, backgroundColor: active ? colors.accent + "1f" : colors.n200 },
                  ]}
                >
                  <Text style={{ fontSize: 18, fontWeight: "800", color: active ? colors.accent : colors.n940 }}>
                    {k === "simple" ? "20 AZN" : "50 AZN"}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.n580 }}>{k === "simple" ? pt.simplePoa : pt.generalPoa}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {transactionType === "lease" && (
        <View>
          <InputField label={`💰 ${pt.monthlyRent}`} value={monthlyRent} onChangeText={setMonthlyRent} placeholder="500" keyboardType="decimal-pad" suffix="AZN" />
          <InputField label={`📅 ${pt.leaseDuration}`} value={leaseMonths} onChangeText={setLeaseMonths} placeholder="12" keyboardType="number-pad" suffix={pt.months} maxLength={3} />
        </View>
      )}

      {transactionType === "company" && (
        <InputField label={`💼 ${pt.charterCapital}`} value={capitalAmount} onChangeText={setCapitalAmount} placeholder="5000" keyboardType="decimal-pad" suffix="AZN" />
      )}

      {result && side ? (
        <View>
          <View style={st.cardRow}>
            <View style={[st.card, { backgroundColor: TINT.blue, borderColor: TINT.blue }]}>
              <Text style={{ fontSize: 12, color: "#ffffffd9" }}>{pt.notaryFee}</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 2 }}>{fmt(result.fee)}</Text>
              <Text style={{ fontSize: 11, color: "#ffffffcc", marginTop: 2 }}>AZN</Text>
            </View>
            <View style={[st.card, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={{ fontSize: 12, color: colors.n580 }}>{side.label}</Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: colors.n940, marginTop: 2, textAlign: "center" }}>{side.value}</Text>
              <Text style={{ fontSize: 11, color: colors.n580, marginTop: 2, textAlign: "center" }}>{side.sub}</Text>
            </View>
          </View>

          <Panel title={pt.detailedCalc} icon="📋">
            <TintRow label={pt.transactionTypeLabel} value={transactionTypes.find((t) => t.value === transactionType)?.description ?? ""} />
            {result.type === "sale" && (
              <>
                <TintRow label={pt.propertyPriceResult} value={`${fmt(result.baseAmount)} AZN`} />
                <TintRow label={pt.appliedTariff} value={result.bracket} />
              </>
            )}
            {result.type === "lease" && (
              <>
                <TintRow label={pt.monthlyRentResult} value={`${fmt(result.monthlyRent)} AZN`} />
                <TintRow label={pt.durationResult} value={`${result.months} ${pt.months}`} />
                <TintRow label={pt.totalRent} value={`${fmt(result.totalRent)} AZN`} />
              </>
            )}
            {result.type === "company" && <TintRow label={pt.charterCapitalResult} value={`${fmt(result.capital)} AZN`} />}
            <TintRow label={pt.notaryFee} value={`${fmt(result.fee)} AZN`} tint="blue" bold last />
          </Panel>

          {result.type === "sale" && (
            <Panel title={pt.tariffComparison} icon="📊">
              {[
                { label: "10 000 AZN", amount: 10000 },
                { label: "30 000 AZN", amount: 30000 },
                { label: "50 000 AZN", amount: 50000 },
                { label: "80 000 AZN", amount: 80000 },
                { label: "100 000 AZN", amount: 100000 },
                { label: "200 000 AZN", amount: 200000 },
              ].map((item, i, arr) => {
                const fee = getSaleFee(item.amount);
                const pct = (fee / item.amount) * 100;
                const isActive = result.baseAmount === item.amount;
                return (
                  <View
                    key={item.amount}
                    style={[
                      st.cmpRow,
                      { borderBottomColor: colors.n280, borderBottomWidth: i === arr.length - 1 ? 0 : StyleSheet.hairlineWidth },
                      isActive && { backgroundColor: TINT.blue + "1a" },
                    ]}
                  >
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: colors.n940 }}>{item.label}</Text>
                    <Text style={{ fontSize: 13, color: colors.n580, marginRight: 14 }}>{pct.toFixed(2)}%</Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: TINT.amber }}>{fmt(fee)} AZN</Text>
                  </View>
                );
              })}
            </Panel>
          )}

          <TintBox tint="blue">
            <TintText tint="blue" size={12}>
              <Text style={{ fontWeight: "700" }}>{pt.attention}</Text> {pt.infoNote}
            </TintText>
          </TintBox>
        </View>
      ) : (
        <EmptyState icon="📋" text={pt.emptyState} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["property-tax", "rental-tax", "court-fee", "price-per-sqm"]} />
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  typeBtn: { flexBasis: "30%", flexGrow: 1, alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4 },
  poaBtn: { flex: 1, alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingVertical: 12 },
  cardRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  card: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", justifyContent: "center" },
  cmpRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
});
