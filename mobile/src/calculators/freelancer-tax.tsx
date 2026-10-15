import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { ToggleRow } from "@/components/Controls";
import { StatGrid, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";
import { OptionCards, SplitBar, LegendRow, TintCard, KV, EmptyState, PresetChips, SEM } from "./_tax-parts";

type BusinessType = "individual-entrepreneur" | "micro-business";
type ActivityType = "trade" | "services";

// Fərdi sahibkar — sadələşdirilmiş vergi
const SIMPLIFIED_TRADE_RATE = 0.02; // 2% ticarət
const SIMPLIFIED_SERVICES_RATE = 0.04; // 4% xidmətlər

// Mikro biznes — gəlir vergisindən azad (illik <100K AZN)
const MICRO_BUSINESS_THRESHOLD = 100000; // AZN illik
const MICRO_BUSINESS_OVER_RATE = 0.02; // 100K+ üçün sadələşdirilmiş

// DSMF — könüllü (fərdi sahibkar)
const DSMF_VOLUNTARY_RATE = 0.25; // bəyan edilən məbləğin 25%-i

const FORMULA_TITLE = "Frilansçı vergisi necə hesablanır?";
const FORMULA_CONTENT = `Fərdi sahibkar (sadələşdirilmiş vergi):
• Ticarət fəaliyyəti: dövriyyənin 2%-i
• Xidmət fəaliyyəti: dövriyyənin 4%-i
• ƏDV: illik dövriyyə 200 000+ AZN olduqda 18%

Mikro biznes:
• İllik gəlir 100 000 AZN-dək: gəlir vergisindən azaddır
• İllik gəlir 100 000+ AZN: sadələşdirilmiş vergi tətbiq olunur
• İşçi sayı: max 5 nəfər

DSMF (könüllü ödəniş):
• Fərdi sahibkarlar üçün könüllüdür
• Bəyan edilən məbləğin 25%-i
• Pensiya və sosial müdafiə hüququ verir

Nümunə (xidmət, aylıq 3000 AZN):
Vergi: 3000 × 4% = 120 AZN/ay
DSMF (500 AZN bazadan): 500 × 25% = 125 AZN/ay
Cəmi: 245 AZN/ay, Xalis: 2755 AZN/ay`;

const fmt = (n: number) => fmtNum(n, 2);

export function FreelancerTaxCalculator() {
  const { colors } = useTheme();
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("individual-entrepreneur");
  const [activityType, setActivityType] = useState<ActivityType>("services");
  const [dsmfBase, setDsmfBase] = useState("");
  const [includeDsmf, setIncludeDsmf] = useState(true);

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome.replace(",", "."));
    if (!income || income <= 0) return null;
    const annualIncome = income * 12;
    let monthlyTax = 0;
    let taxMethod = "";
    let taxDescription = "";

    if (businessType === "individual-entrepreneur") {
      if (activityType === "trade") {
        monthlyTax = income * SIMPLIFIED_TRADE_RATE;
        taxMethod = "Sadələşdirilmiş vergi (ticarət)";
        taxDescription = "Dövriyyənin 2%-i";
      } else {
        monthlyTax = income * SIMPLIFIED_SERVICES_RATE;
        taxMethod = "Sadələşdirilmiş vergi (xidmət)";
        taxDescription = "Dövriyyənin 4%-i";
      }
    } else if (annualIncome < MICRO_BUSINESS_THRESHOLD) {
      monthlyTax = 0;
      taxMethod = "Mikro biznes (gəlir vergisindən azad)";
      taxDescription = "İllik gəlir 100 000 AZN-dən az olduqda vergi yoxdur";
    } else {
      monthlyTax = income * MICRO_BUSINESS_OVER_RATE;
      taxMethod = "Mikro biznes (hədd aşılıb)";
      taxDescription = "İllik gəlir 100 000+ AZN — sadələşdirilmiş 2%";
    }

    // DSMF (könüllü)
    const dsmfDeclaredBase = parseFloat(dsmfBase.replace(",", ".")) || 0;
    const monthlyDsmf = includeDsmf && dsmfDeclaredBase > 0 ? dsmfDeclaredBase * DSMF_VOLUNTARY_RATE : 0;
    const totalMonthlyPayment = monthlyTax + monthlyDsmf;
    const netMonthlyIncome = income - totalMonthlyPayment;
    const effectiveTaxRate = income > 0 ? (totalMonthlyPayment / income) * 100 : 0;

    const ieTradeMonthly = income * SIMPLIFIED_TRADE_RATE;
    const ieServicesMonthly = income * SIMPLIFIED_SERVICES_RATE;
    const microMonthly = annualIncome < MICRO_BUSINESS_THRESHOLD ? 0 : income * MICRO_BUSINESS_OVER_RATE;

    return {
      income, annualIncome, monthlyTax, taxMethod, taxDescription, monthlyDsmf, dsmfDeclaredBase,
      totalMonthlyPayment, netMonthlyIncome, annualTax: monthlyTax * 12, annualDsmf: monthlyDsmf * 12,
      annualNetIncome: netMonthlyIncome * 12, effectiveTaxRate, ieTradeMonthly, ieServicesMonthly, microMonthly,
    };
  }, [monthlyIncome, businessType, activityType, dsmfBase, includeDsmf]);

  const cmpRow = (active: boolean, title: string, desc: string, monthly: number) => (
    <View style={{ borderRadius: 8, paddingHorizontal: 8, backgroundColor: active ? SEM.green + "22" : "transparent" }}>
      <KV label={title} sub={desc} value={`${fmt(monthly)} AZN/ay\n${fmt(monthly * 12)} AZN/il`} />
    </View>
  );

  return (
    <View>
      <OptionCards
        label="Biznes statusu"
        columns={2}
        options={[
          { value: "individual-entrepreneur", icon: "📋", title: "Fərdi sahibkar", description: "Sadələşdirilmiş vergi: 2–4%" },
          { value: "micro-business", icon: "🏪", title: "Mikro biznes", description: "<100K AZN/il: vergi yoxdur" },
        ]}
        selected={businessType}
        onSelect={setBusinessType}
      />

      {businessType === "individual-entrepreneur" && (
        <OptionCards
          label="Fəaliyyət növü"
          columns={2}
          options={[
            { value: "services", icon: "💻", title: "Xidmət", description: "IT, konsaltinq, dizayn və s. — 4%" },
            { value: "trade", icon: "🛒", title: "Ticarət", description: "Mal alqı-satqısı — 2%" },
          ]}
          selected={activityType}
          onSelect={setActivityType}
        />
      )}

      <InputField
        label="💰 Aylıq gəlir (AZN)"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        placeholder="3000"
        keyboardType="decimal-pad"
      />
      <PresetChips
        values={[1000, 2000, 3000, 5000, 8000]}
        onPick={(v) => setMonthlyIncome(String(v))}
        active={parseFloat(monthlyIncome)}
      />

      <View style={{ marginBottom: 12 }}>
        <ToggleRow label="DSMF (könüllü ödəniş)" value={includeDsmf} onValueChange={setIncludeDsmf} />
      </View>
      {includeDsmf && (
        <InputField
          label="Bəyan edilən aylıq məbləğ (AZN) — DSMF bazası"
          value={dsmfBase}
          onChangeText={setDsmfBase}
          placeholder="500"
          keyboardType="decimal-pad"
          hint="DSMF = bəyan edilən məbləğin 25%-i. Pensiya hüququ üçün tövsiyə olunur."
        />
      )}

      {result ? (
        <View>
          <StatGrid
            items={[
              { label: "Aylıq gəlir", value: `${fmt(result.income)} AZN` },
              {
                label: "Aylıq ödənişlər",
                value: `${fmt(result.totalMonthlyPayment)} AZN (${result.effectiveTaxRate.toFixed(1)}%)`,
              },
              { label: "Xalis gəlir", value: `${fmt(result.netMonthlyIncome)} AZN / ay`, accent: true },
            ]}
          />

          {businessType === "micro-business" && result.annualIncome < MICRO_BUSINESS_THRESHOLD && (
            <TintCard color={SEM.green} title="✅ Mikro biznes statusu — vergidən azad">
              <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
                İllik gəliriniz {fmt(result.annualIncome)} AZN — 100 000 AZN həddindən aşağıdır. Gəlir vergisi
                ödəmirsiniz. Həddə qalan: {fmt(MICRO_BUSINESS_THRESHOLD - result.annualIncome)} AZN
              </Text>
              <SplitBar
                height={10}
                total={MICRO_BUSINESS_THRESHOLD}
                segments={[{ value: result.annualIncome, color: SEM.green }]}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: SEM.green }}>0 AZN</Text>
                <Text style={{ fontSize: 11, color: SEM.green }}>100 000 AZN</Text>
              </View>
            </TintCard>
          )}

          <TintCard color={SEM.blue} title="📅 İllik hesablama">
            <KV label="İllik gəlir" value={`${fmt(result.annualIncome)} AZN`} />
            <KV label="İllik vergi" value={`${fmt(result.annualTax)} AZN`} color={SEM.amber} />
            <KV label="İllik DSMF" value={`${fmt(result.annualDsmf)} AZN`} />
            <KV label="İllik xalis gəlir" value={`${fmt(result.annualNetIncome)} AZN`} color={colors.accent} bold />
          </TintCard>

          <TintCard color={SEM.gray} title="📋 Ətraflı hesablama (aylıq)">
            <KV label="Aylıq gəlir" value={`${fmt(result.income)} AZN`} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.n580, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 10 }}>
              Vergi və ödənişlər
            </Text>
            <KV label={result.taxMethod} sub={result.taxDescription} value={`${fmt(result.monthlyTax)} AZN`} />
            {result.monthlyDsmf > 0 && (
              <KV
                label="DSMF (könüllü, 25%)"
                sub={`Baza: ${fmt(result.dsmfDeclaredBase)} AZN`}
                value={`${fmt(result.monthlyDsmf)} AZN`}
              />
            )}
            <KV label="Cəmi aylıq ödəniş" value={`${fmt(result.totalMonthlyPayment)} AZN`} bold color={SEM.amber} />
            <KV label="Xalis aylıq gəlir" value={`${fmt(result.netMonthlyIncome)} AZN`} bold color={colors.accent} />
          </TintCard>

          <TintCard color={SEM.gray} title={`⚖️ Status müqayisəsi — ${fmt(result.income)} AZN/ay üçün`}>
            {cmpRow(
              businessType === "individual-entrepreneur" && activityType === "services",
              "Fərdi sahibkar (xidmət)",
              "Sadələşdirilmiş vergi — 4%",
              result.ieServicesMonthly,
            )}
            {cmpRow(
              businessType === "individual-entrepreneur" && activityType === "trade",
              "Fərdi sahibkar (ticarət)",
              "Sadələşdirilmiş vergi — 2%",
              result.ieTradeMonthly,
            )}
            {cmpRow(
              businessType === "micro-business",
              "Mikro biznes",
              result.annualIncome < MICRO_BUSINESS_THRESHOLD ? "İllik <100K AZN — vergidən azad" : "İllik 100K+ AZN — 2%",
              result.microMonthly,
            )}
            <Text style={{ fontSize: 13, fontWeight: "600", color: SEM.green, marginTop: 8 }}>
              💡{" "}
              {result.microMonthly === 0 && result.annualIncome < MICRO_BUSINESS_THRESHOLD
                ? "Mikro biznes ən sərfəlidir — vergi yoxdur!"
                : result.ieTradeMonthly <= result.ieServicesMonthly && result.ieTradeMonthly <= result.microMonthly
                  ? "Fərdi sahibkar (ticarət) ən sərfəlidir"
                  : result.microMonthly <= result.ieServicesMonthly
                    ? "Mikro biznes ən sərfəlidir"
                    : "Fərdi sahibkar (xidmət) statusu seçilib"}
            </Text>
          </TintCard>

          <TintCard color={SEM.gray}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n580 }}>Gəlirin bölgüsü</Text>
            <SplitBar
              height={20}
              total={result.income}
              segments={[
                { value: Math.max(0, result.netMonthlyIncome), color: colors.accent },
                { value: result.monthlyTax, color: "#fbbf24" },
                { value: result.monthlyDsmf, color: "#60a5fa" },
              ]}
            />
            <LegendRow
              color={colors.accent}
              label={`Xalis: ${fmt(result.netMonthlyIncome)} (${((Math.max(0, result.netMonthlyIncome) / result.income) * 100).toFixed(0)}%)`}
            />
            <LegendRow
              color="#fbbf24"
              label={`Vergi: ${fmt(result.monthlyTax)} (${((result.monthlyTax / result.income) * 100).toFixed(0)}%)`}
            />
            {result.monthlyDsmf > 0 && (
              <LegendRow
                color="#60a5fa"
                label={`DSMF: ${fmt(result.monthlyDsmf)} (${((result.monthlyDsmf / result.income) * 100).toFixed(0)}%)`}
              />
            )}
          </TintCard>

          <InfoBox variant="info">
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
              <Text style={{ fontWeight: "700" }}>Qeyd:</Text> Fərdi sahibkar qeydiyyatı Vergilər Nazirliyinin
              e-taxes.gov.az portalından onlayn edilə bilər. Mikro biznes statusu üçün ASAN xidmətə müraciət edin. Vergi
              bəyannaməsi rüblük (hər rübdən sonrakı ayın 20-dək) verilməlidir. DSMF ödənişi pensiya yaşında təqaüd almaq
              üçün vacibdir — ən azı 25 il staj tələb olunur.
            </Text>
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="💼" text="Nəticəni görmək üçün aylıq gəlirinizi daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "dividend-tax", "vat", "rental-income-tax"]} />
    </View>
  );
}
