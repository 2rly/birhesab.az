import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { StatGrid, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";
import { OptionCards, SplitBar, LegendRow, TintCard, KV, EmptyState, SEM } from "./_tax-parts";

// Azərbaycan əmlak alqı-satqı vergi və xərcləri (2024)
// Vergi Məcəlləsi və Notariat haqqında Qanun əsasında

type PropertyType = "apartment" | "house" | "land" | "commercial";
type SellerType = "individual" | "legal";
type OwnershipDuration = "less5" | "more5";

const propertyTypes: { value: PropertyType; label: string; icon: string; description: string }[] = [
  { value: "apartment", label: "Mənzil", icon: "🏢", description: "Yaşayış mənzili" },
  { value: "house", label: "Ev", icon: "🏠", description: "Fərdi yaşayış evi" },
  { value: "land", label: "Torpaq", icon: "🌍", description: "Torpaq sahəsi" },
  { value: "commercial", label: "Kommersiya", icon: "🏪", description: "Kommersiya obyekti" },
];

// Gəlir vergisi dərəcəsi (əmlak satışından)
const INCOME_TAX_RATE_INDIVIDUAL = 0.14;
const INCOME_TAX_RATE_LEGAL = 0.2;

function getNotaryFee(price: number): number {
  if (price <= 10000) return price * 0.005 + 15;
  if (price <= 50000) return 50 + (price - 10000) * 0.003;
  if (price <= 100000) return 170 + (price - 50000) * 0.002;
  return 270 + (price - 100000) * 0.001;
}

const STATE_REGISTRATION_FEE = 20;
const TECHNICAL_PASSPORT_FEE = 50;
const REGISTRY_EXTRACT_FEE = 20;
const DOCUMENT_FEES = 30;
const VAT_RATE = 0.18;

const FORMULA_TITLE = "Əmlak satışında hansı vergi və xərclər var?";
const FORMULA_CONTENT = `Gəlir vergisi (satıcıdan):
• Fiziki şəxs: mənfəətin 14%-i (satış qiyməti − alış qiyməti)
• Hüquqi şəxs: mənfəətin 20%-i
• Güzəşt: Yaşayış əmlakı 5+ il sahiblikdə — vergidən azad

ƏDV (18%):
• Yalnız kommersiya əmlakı + hüquqi şəxs satışında tətbiq olunur
• Yaşayış əmlakı satışı ƏDV-dən azaddır

Notarius xərcləri (alqı-satqı müqaviləsi):
• 10 000 AZN-dək: 0.5% + 15 AZN
• 10 001–50 000 AZN: 50 + 0.3%
• 50 001–100 000 AZN: 170 + 0.2%
• 100 000+ AZN: 270 + 0.1%

Dövlət rüsumları:
• Qeydiyyat rüsumu: 20 AZN
• Texniki pasport: 50 AZN
• Reyestr çıxarışı: 20 AZN
• Sənəd xərcləri: ~30 AZN`;

const fmt = (n: number) => fmtNum(n, 2);
const num = (s: string) => parseFloat(s.replace(",", "."));

export function PropertyTaxCalculator() {
  const { colors } = useTheme();
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [sellerType, setSellerType] = useState<SellerType>("individual");
  const [ownershipDuration, setOwnershipDuration] = useState<OwnershipDuration>("less5");
  const [area, setArea] = useState("");

  const isResidential = propertyType === "apartment" || propertyType === "house";

  const result = useMemo(() => {
    const salePrice = num(price);
    if (!salePrice || salePrice <= 0) return null;
    const buyPrice = num(purchasePrice) || 0;
    const sqm = num(area) || 0;
    const pricePerSqm = sqm > 0 ? salePrice / sqm : 0;
    const profit = buyPrice > 0 ? Math.max(0, salePrice - buyPrice) : salePrice;

    let incomeTax = 0;
    let incomeTaxNote = "";
    if (sellerType === "individual") {
      if (ownershipDuration === "more5" && (propertyType === "apartment" || propertyType === "house")) {
        incomeTax = 0;
        incomeTaxNote = "5 ildən çox sahiblik — vergidən azad";
      } else {
        incomeTax = profit * INCOME_TAX_RATE_INDIVIDUAL;
        incomeTaxNote = `Mənfəətdən 14% (${fmt(profit)} AZN × 14%)`;
      }
    } else {
      incomeTax = profit * INCOME_TAX_RATE_LEGAL;
      incomeTaxNote = `Mənfəətdən 20% (${fmt(profit)} AZN × 20%)`;
    }

    let vatAmount = 0;
    if (propertyType === "commercial" && sellerType === "legal") vatAmount = salePrice * VAT_RATE;

    const notaryFee = getNotaryFee(salePrice);
    const totalStateFees = STATE_REGISTRATION_FEE + TECHNICAL_PASSPORT_FEE + REGISTRY_EXTRACT_FEE + DOCUMENT_FEES;
    const sellerCosts = incomeTax + notaryFee / 2;
    const buyerCosts = notaryFee / 2 + totalStateFees + vatAmount;
    const totalTaxAndFees = incomeTax + vatAmount + notaryFee + totalStateFees;

    return {
      salePrice, buyPrice, profit, incomeTax, incomeTaxNote, vatAmount, notaryFee,
      totalStateFees, sellerCosts, buyerCosts, totalTaxAndFees, pricePerSqm, sqm,
    };
  }, [price, purchasePrice, propertyType, sellerType, ownershipDuration, area]);

  const sub = (t: string) => (
    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.n580, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 10, marginBottom: 2 }}>
      {t}
    </Text>
  );

  return (
    <View>
      <OptionCards
        label="Əmlak növü"
        columns={2}
        options={propertyTypes.map((p) => ({ value: p.value, icon: p.icon, title: p.label, description: p.description }))}
        selected={propertyType}
        onSelect={setPropertyType}
      />

      <OptionCards
        label="Satıcının statusu"
        columns={2}
        options={[
          { value: "individual", icon: "👤", title: "Fiziki şəxs" },
          { value: "legal", icon: "🏢", title: "Hüquqi şəxs" },
        ]}
        selected={sellerType}
        onSelect={setSellerType}
      />

      {sellerType === "individual" && isResidential && (
        <OptionCards
          label="Sahiblik müddəti"
          columns={2}
          options={[
            { value: "less5", title: "< 5 il", description: "Vergiyə cəlb olunur" },
            { value: "more5", title: "5+ il", description: "Vergidən azad" },
          ]}
          selected={ownershipDuration}
          onSelect={setOwnershipDuration}
        />
      )}

      <InputField
        label="💰 Satış qiyməti (AZN)"
        value={price}
        onChangeText={setPrice}
        placeholder="80000"
        keyboardType="decimal-pad"
      />
      <InputField
        label="🏷️ Alış qiyməti (AZN) — ixtiyari"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
        placeholder="60000"
        keyboardType="decimal-pad"
        hint="Mənfəət vergisi hesablaması üçün"
      />
      <InputField
        label="📐 Sahə (m²) — ixtiyari"
        value={area}
        onChangeText={setArea}
        placeholder="75"
        keyboardType="decimal-pad"
      />

      {result ? (
        <View>
          {result.incomeTax === 0 && ownershipDuration === "more5" && sellerType === "individual" && isResidential && (
            <InfoBox variant="success" title="✅ Gəlir vergisindən azad!">
              Yaşayış əmlakı 5 ildən çox sahiblikdə olduğu üçün satışdan gəlir vergisi tutulmur.
            </InfoBox>
          )}

          <StatGrid
            items={[
              { label: "Satış qiyməti", value: `${fmt(result.salePrice)} AZN` },
              { label: "Ümumi vergi və xərc", value: `${fmt(result.totalTaxAndFees)} AZN` },
              ...(result.sqm > 0 ? [{ label: "1 m² qiyməti", value: `${fmt(result.pricePerSqm)} AZN / m²`, accent: true }] : []),
            ]}
          />

          <TintCard color={SEM.red} title="📤 Satıcının xərcləri">
            <KV label="Gəlir vergisi" value={result.incomeTax > 0 ? `${fmt(result.incomeTax)} AZN` : "Azad"} />
            <KV label="Notarius (½)" value={`${fmt(result.notaryFee / 2)} AZN`} />
            <KV label="Cəmi" value={`${fmt(result.sellerCosts)} AZN`} bold color={SEM.red} />
          </TintCard>

          <TintCard color={SEM.blue} title="📥 Alıcının xərcləri">
            <KV label="Notarius (½)" value={`${fmt(result.notaryFee / 2)} AZN`} />
            {result.vatAmount > 0 && <KV label="ƏDV (18%)" value={`${fmt(result.vatAmount)} AZN`} />}
            <KV label="Dövlət rüsumları" value={`${fmt(result.totalStateFees)} AZN`} />
            <KV label="Cəmi" value={`${fmt(result.buyerCosts)} AZN`} bold color={SEM.blue} />
          </TintCard>

          <TintCard color={SEM.gray} title="📋 Ətraflı hesablama">
            <KV label="Satış qiyməti" value={`${fmt(result.salePrice)} AZN`} />
            {result.buyPrice > 0 && (
              <>
                <KV label="Alış qiyməti" value={`${fmt(result.buyPrice)} AZN`} />
                <KV label="Mənfəət (satış − alış)" value={`${fmt(result.profit)} AZN`} />
              </>
            )}
            {sub("Vergilər")}
            <KV
              label="Gəlir vergisi"
              sub={result.incomeTaxNote || undefined}
              value={result.incomeTax > 0 ? `${fmt(result.incomeTax)} AZN` : "Azad"}
              color={result.incomeTax === 0 ? SEM.green : undefined}
            />
            {result.vatAmount > 0 && <KV label="ƏDV (18%)" value={`${fmt(result.vatAmount)} AZN`} />}
            {sub("Rüsum və xərclər")}
            <KV label="Notarius xərci" value={`${fmt(result.notaryFee)} AZN`} />
            <KV label="Qeydiyyat rüsumu" value={`${fmt(STATE_REGISTRATION_FEE)} AZN`} />
            <KV label="Texniki pasport" value={`${fmt(TECHNICAL_PASSPORT_FEE)} AZN`} />
            <KV label="Reyestr çıxarışı" value={`${fmt(REGISTRY_EXTRACT_FEE)} AZN`} />
            <KV label="Sənəd xərcləri" value={`${fmt(DOCUMENT_FEES)} AZN`} />
            <KV label="Ümumi vergi və xərclər" value={`${fmt(result.totalTaxAndFees)} AZN`} bold color={colors.accent} />
          </TintCard>

          <TintCard color={SEM.gray}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n580 }}>Xərcin strukturu</Text>
            <SplitBar
              height={20}
              segments={[
                { value: result.incomeTax, color: "#f87171" },
                { value: result.vatAmount, color: "#fb923c" },
                { value: result.notaryFee, color: "#fbbf24" },
                { value: result.totalStateFees, color: "#60a5fa" },
              ]}
            />
            {result.incomeTax > 0 && <LegendRow color="#f87171" label="Gəlir vergisi:" value={fmt(result.incomeTax)} />}
            {result.vatAmount > 0 && <LegendRow color="#fb923c" label="ƏDV:" value={fmt(result.vatAmount)} />}
            <LegendRow color="#fbbf24" label="Notarius:" value={fmt(result.notaryFee)} />
            <LegendRow color="#60a5fa" label="Dövlət rüsumları:" value={fmt(result.totalStateFees)} />
          </TintCard>

          <InfoBox variant="info">
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
              <Text style={{ fontWeight: "700" }}>Diqqət:</Text> Bu hesablama təxmini xarakter daşıyır. Notarius xərcləri
              razılaşma ilə satıcı və alıcı arasında bərabər bölünə və ya bir tərəfin üzərinə düşə bilər. Dəqiq məlumat
              üçün notariusa və vergi orqanına müraciət edin.
            </Text>
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🏢" text="Nəticəni görmək üçün satış qiymətini daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["rental-tax", "mortgage", "price-per-sqm", "notary-fee"]} />
    </View>
  );
}
