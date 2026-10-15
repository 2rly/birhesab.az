import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { StatGrid, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";
import { OptionCards, SplitBar, LegendRow, TintCard, KV, EmptyState, PresetChips, SEM } from "./_tax-parts";

// Azərbaycan kirayə vergisi qaydaları (2024)
// Vergi Məcəlləsi, Maddə 101, 124

type LandlordType = "individual" | "legal";
type PropertyUsage = "residential" | "commercial";
type Method = "simplified" | "standard";

const INDIVIDUAL_TAX_RATE = 0.1;
const LEGAL_TAX_RATE = 0.2;
const VAT_THRESHOLD = 200000; // AZN
const VAT_RATE = 0.18;
const SIMPLIFIED_TIER1_LIMIT = 2000;
const SIMPLIFIED_TIER1_RATE = 0.04;
const SIMPLIFIED_TIER2_RATE = 0.08;

function getPropertyTax(annualValue: number): number {
  return annualValue * 0.01;
}

const FORMULA_TITLE = "Kirayə gəlirindən vergi necə hesablanır?";
const FORMULA_CONTENT = `Fiziki şəxs — Sadələşdirilmiş vergi (kirayə gəlirindən):
• Aylıq 2000 AZN-dək: 4%
• Aylıq 2000+ AZN: 8%
Xərclər çıxılmır, verginin ödənişi sadədir.

Fiziki şəxs — Standart gəlir vergisi:
• Xalis gəlirdən (gəlir − xərclər) 10%
• Xərclərə daxildir: təmir, kommunal, amortizasiya, sığorta

Hüquqi şəxs:
• Mənfəət vergisi: xalis gəlirdən 20%
• ƏDV: illik dövriyyə 200 000+ AZN olduqda 18%

Əmlak vergisi (bütün mülkiyyətçilər):
• İllik, inventar dəyərindən ~1%

Hansı üsul sərfəlidir?
• Xərcləriniz azdırsa → sadələşdirilmiş (4–8%)
• Xərcləriniz çoxdursa (təmir, kommunal) → standart (10%, amma xərclər çıxılır)`;

const fmt = (n: number) => fmtNum(n, 2);

export function RentalTaxCalculator() {
  const { colors } = useTheme();
  const [monthlyRent, setMonthlyRent] = useState("");
  const [landlordType, setLandlordType] = useState<LandlordType>("individual");
  const [propertyUsage, setPropertyUsage] = useState<PropertyUsage>("residential");
  const [expenses, setExpenses] = useState("");
  const [method, setMethod] = useState<Method>("simplified");
  const useSimplified = method === "simplified";

  const result = useMemo(() => {
    const rent = parseFloat(monthlyRent.replace(",", "."));
    if (!rent || rent <= 0) return null;
    const monthlyExpenses = parseFloat(expenses.replace(",", ".")) || 0;
    const annualRent = rent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const annualNet = annualRent - annualExpenses;

    let incomeTax = 0;
    let taxMethod = "";
    let vatAmount = 0;
    let simplifiedTax = 0;
    let standardTax = 0;

    if (landlordType === "individual") {
      if (rent <= SIMPLIFIED_TIER1_LIMIT) {
        simplifiedTax = rent * SIMPLIFIED_TIER1_RATE;
      } else {
        simplifiedTax =
          SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE + (rent - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
      }
      standardTax = (Math.max(0, annualNet) * INDIVIDUAL_TAX_RATE) / 12;
      if (useSimplified) {
        incomeTax = simplifiedTax;
        taxMethod = "Sadələşdirilmiş vergi";
      } else {
        incomeTax = standardTax;
        taxMethod = "Standart gəlir vergisi (10%)";
      }
    } else {
      incomeTax = (Math.max(0, annualNet) * LEGAL_TAX_RATE) / 12;
      taxMethod = "Mənfəət vergisi (20%)";
      if (annualRent >= VAT_THRESHOLD) vatAmount = rent * VAT_RATE;
    }

    const propertyTax = getPropertyTax(annualRent) / 12;
    const totalMonthlyTax = incomeTax + vatAmount + propertyTax;
    const netIncome = rent - monthlyExpenses - totalMonthlyTax;
    const effectiveTaxRate = rent > 0 ? (totalMonthlyTax / rent) * 100 : 0;

    return {
      monthlyRent: rent, annualRent, monthlyExpenses, annualExpenses, incomeTax, taxMethod, vatAmount,
      propertyTax, totalMonthlyTax, totalAnnualTax: totalMonthlyTax * 12, netIncome,
      annualNetIncome: netIncome * 12, effectiveTaxRate, simplifiedTax, standardTax,
    };
  }, [monthlyRent, landlordType, expenses, useSimplified]);

  return (
    <View>
      <OptionCards
        label="Mülkiyyətçinin statusu"
        columns={2}
        options={[
          { value: "individual", icon: "👤", title: "Fiziki şəxs", description: "Sadələşdirilmiş və ya gəlir vergisi" },
          { value: "legal", icon: "🏢", title: "Hüquqi şəxs", description: "Mənfəət vergisi + ƏDV" },
        ]}
        selected={landlordType}
        onSelect={setLandlordType}
      />

      <OptionCards
        label="Əmlakın istifadə təyinatı"
        columns={2}
        options={[
          { value: "residential", icon: "🏠", title: "Yaşayış" },
          { value: "commercial", icon: "🏪", title: "Kommersiya" },
        ]}
        selected={propertyUsage}
        onSelect={setPropertyUsage}
      />

      {landlordType === "individual" && (
        <OptionCards
          label="Vergitutma üsulu"
          columns={2}
          options={[
            { value: "simplified", title: "Sadələşdirilmiş", description: "4–8% (xərclər çıxılmır)" },
            { value: "standard", title: "Standart", description: "10% (xərclər çıxılır)" },
          ]}
          selected={method}
          onSelect={setMethod}
        />
      )}

      <InputField
        label="💰 Aylıq kirayə haqqı (AZN)"
        value={monthlyRent}
        onChangeText={setMonthlyRent}
        placeholder="800"
        keyboardType="decimal-pad"
      />
      <PresetChips
        values={[500, 800, 1200, 2000, 3500]}
        onPick={(v) => setMonthlyRent(String(v))}
        active={parseFloat(monthlyRent)}
      />
      <InputField
        label="🔧 Aylıq xərclər (AZN) — ixtiyari"
        value={expenses}
        onChangeText={setExpenses}
        placeholder="0"
        keyboardType="decimal-pad"
        hint="Təmir, kommunal, amortizasiya, sığorta və s."
      />

      {result ? (
        <View>
          <StatGrid
            items={[
              { label: "Aylıq kirayə", value: `${fmt(result.monthlyRent)} AZN` },
              { label: "Aylıq vergi", value: `${fmt(result.totalMonthlyTax)} AZN (${result.effectiveTaxRate.toFixed(1)}%)` },
              { label: "Xalis gəlir", value: `${fmt(result.netIncome)} AZN / ay`, accent: true },
            ]}
          />

          <TintCard color={SEM.blue} title="📅 İllik hesablama">
            <KV label="İllik kirayə gəliri" value={`${fmt(result.annualRent)} AZN`} />
            <KV label="İllik xərclər" value={`${fmt(result.annualExpenses)} AZN`} />
            <KV label="İllik vergi" value={`${fmt(result.totalAnnualTax)} AZN`} color={SEM.amber} />
            <KV label="İllik xalis gəlir" value={`${fmt(result.annualNetIncome)} AZN`} color={colors.accent} bold />
          </TintCard>

          {landlordType === "individual" && (
            <TintCard color={SEM.gray} title="⚖️ Üsul müqayisəsi — hansı sərfəlidir?">
              <View style={{ borderRadius: 8, paddingHorizontal: 8, backgroundColor: useSimplified ? SEM.green + "22" : "transparent" }}>
                <KV
                  label="Sadələşdirilmiş vergi"
                  sub={`${result.monthlyRent <= SIMPLIFIED_TIER1_LIMIT ? "4%" : "4% + 8%"} — xərclər çıxılmır`}
                  value={`${fmt(result.simplifiedTax)} AZN/ay\n${fmt(result.simplifiedTax * 12)} AZN/il`}
                />
              </View>
              <View style={{ borderRadius: 8, paddingHorizontal: 8, backgroundColor: !useSimplified ? SEM.green + "22" : "transparent" }}>
                <KV
                  label="Standart gəlir vergisi"
                  sub="10% — xərclər çıxılır"
                  value={`${fmt(result.standardTax)} AZN/ay\n${fmt(result.standardTax * 12)} AZN/il`}
                />
              </View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: SEM.green, marginTop: 8 }}>
                💡{" "}
                {result.simplifiedTax <= result.standardTax
                  ? `Sadələşdirilmiş üsul ${fmt(Math.abs(result.standardTax - result.simplifiedTax) * 12)} AZN/il qənaət edir`
                  : `Standart üsul ${fmt(Math.abs(result.simplifiedTax - result.standardTax) * 12)} AZN/il qənaət edir`}
              </Text>
            </TintCard>
          )}

          <TintCard color={SEM.gray} title="📋 Ətraflı hesablama (aylıq)">
            <KV label="Kirayə haqqı" value={`${fmt(result.monthlyRent)} AZN`} />
            {result.monthlyExpenses > 0 && (
              <KV label="Xərclər" value={`−${fmt(result.monthlyExpenses)} AZN`} color={SEM.red} />
            )}
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.n580, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 10 }}>
              Vergilər
            </Text>
            <KV label={result.taxMethod} value={`${fmt(result.incomeTax)} AZN`} />
            {result.vatAmount > 0 && <KV label="ƏDV (18%)" value={`${fmt(result.vatAmount)} AZN`} />}
            <KV label="Əmlak vergisi (~1%/il)" value={`${fmt(result.propertyTax)} AZN`} />
            <KV label="Cəmi aylıq vergi" value={`${fmt(result.totalMonthlyTax)} AZN`} bold color={SEM.amber} />
            <KV label="Xalis aylıq gəlir" value={`${fmt(result.netIncome)} AZN`} bold color={colors.accent} />
          </TintCard>

          <TintCard color={SEM.gray}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n580 }}>Kirayə gəlirinin bölgüsü</Text>
            <SplitBar
              height={20}
              total={result.monthlyRent}
              segments={[
                { value: Math.max(0, result.netIncome), color: colors.accent },
                { value: result.monthlyExpenses, color: "#9ca3af" },
                { value: result.incomeTax, color: "#fbbf24" },
                { value: result.vatAmount, color: "#fb923c" },
                { value: result.propertyTax, color: "#fca5a5" },
              ]}
            />
            <LegendRow
              color={colors.accent}
              label={`Xalis: ${fmt(result.netIncome)} (${((Math.max(0, result.netIncome) / result.monthlyRent) * 100).toFixed(0)}%)`}
            />
            {result.monthlyExpenses > 0 && <LegendRow color="#9ca3af" label={`Xərclər: ${fmt(result.monthlyExpenses)}`} />}
            <LegendRow color="#fbbf24" label={`Vergi: ${fmt(result.incomeTax)}`} />
          </TintCard>

          <InfoBox variant="info">
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
              <Text style={{ fontWeight: "700" }}>Diqqət:</Text> Kirayə müqaviləsi notarial qaydada təsdiq olunmalı və
              vergi orqanında qeydiyyatdan keçirilməlidir. Qeydiyyatsız kirayə gəliri vergidən yayınma sayılır və cərimə
              tətbiq oluna bilər. Vergi bəyannaməsi hər il 31 marta qədər verilməlidir.
            </Text>
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🏘️" text="Nəticəni görmək üçün aylıq kirayə haqqını daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["rental-income-tax", "property-tax", "deposit", "mortgage"]} />
    </View>
  );
}
