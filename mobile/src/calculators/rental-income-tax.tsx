import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { StatGrid, DataTable, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";
import { SplitBar, TintCard, KV, EmptyState, PresetChips, SEM } from "./_tax-parts";

const SIMPLIFIED_TIER1_LIMIT = 2000; // AZN/ay
const SIMPLIFIED_TIER1_RATE = 0.04; // 4%
const SIMPLIFIED_TIER2_RATE = 0.08; // 8%
const STANDARD_TAX_RATE = 0.14; // 14%

type TaxMethod = "simplified" | "standard" | "compare";

const FORMULA_TITLE = "Kirayə gəlir vergisi necə hesablanır?";
const FORMULA_CONTENT = `Sadələşdirilmiş vergi yanaşması:
• Aylıq gəlir 2000 AZN-dək: 4%
• Aylıq gəlir 2000+ AZN: ilk 2000-ə 4%, qalanına 8%
• Xərclər çıxılmır, vergi birbaşa gəlirdən hesablanır

Standart yanaşma (gəlir vergisi):
• Mənfəət = Gəlir − Xərclər (təmir, kommunal, amortizasiya, sığorta)
• Vergi = Mənfəət × 14%
• Xərclər sənədləşdirilməlidir

Nümunə (3000 AZN/ay, 500 AZN xərc):
Sadələşdirilmiş: 2000×4% + 1000×8% = 80+80 = 160 AZN/ay
Standart: (3000−500)×14% = 350 AZN/ay
Bu halda sadələşdirilmiş üsul 190 AZN/ay qənaət edir.

Nə vaxt standart üsul sərfəlidir?
Xərcləriniz yüksək olduqda (təmir, yenidənqurma və s.) standart üsul daha sərfəli ola bilər.`;

const fmt = (n: number) => fmtNum(n, 2);

function simplifiedTax(amount: number): number {
  if (amount <= SIMPLIFIED_TIER1_LIMIT) return amount * SIMPLIFIED_TIER1_RATE;
  return SIMPLIFIED_TIER1_LIMIT * SIMPLIFIED_TIER1_RATE + (amount - SIMPLIFIED_TIER1_LIMIT) * SIMPLIFIED_TIER2_RATE;
}

export function RentalIncomeTaxCalculator() {
  const { colors } = useTheme();
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [taxMethod, setTaxMethod] = useState<TaxMethod>("compare");

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome.replace(",", "."));
    if (!income || income <= 0) return null;
    const expenses = parseFloat(monthlyExpenses.replace(",", ".")) || 0;
    const annualIncome = income * 12;

    const simplifiedMonthly = simplifiedTax(income);
    const simplifiedTier = income <= SIMPLIFIED_TIER1_LIMIT ? "4% (2000 AZN-dək)" : "4% + 8% (2000+ AZN)";
    const simplifiedAnnual = simplifiedMonthly * 12;
    const simplifiedNet = income - simplifiedMonthly;
    const simplifiedAnnualNet = simplifiedNet * 12;

    const profit = Math.max(0, income - expenses);
    const standardMonthly = profit * STANDARD_TAX_RATE;
    const standardAnnual = standardMonthly * 12;
    const standardNet = income - expenses - standardMonthly;
    const standardAnnualNet = standardNet * 12;

    const simplifiedBetter = simplifiedMonthly <= standardMonthly;
    const savings = Math.abs(simplifiedMonthly - standardMonthly);
    const annualSavings = savings * 12;
    const simplifiedEffective = (simplifiedMonthly / income) * 100;
    const standardEffective = income > 0 ? (standardMonthly / income) * 100 : 0;
    const breakevenExpenses = income - simplifiedMonthly / STANDARD_TAX_RATE;

    return {
      income, expenses, annualIncome, simplifiedMonthly, simplifiedAnnual, simplifiedNet, simplifiedAnnualNet,
      simplifiedTier, simplifiedEffective, standardMonthly, standardAnnual, standardNet, standardAnnualNet,
      standardEffective, profit, simplifiedBetter, savings, annualSavings,
      breakevenExpenses: Math.max(0, breakevenExpenses),
    };
  }, [monthlyIncome, monthlyExpenses]);

  const quickRows = useMemo(() => {
    const exp = parseFloat(monthlyExpenses.replace(",", ".")) || 0;
    return [500, 1000, 2000, 3000, 5000, 8000].map((amount) => {
      const simp = simplifiedTax(amount);
      const std = Math.max(0, amount - exp) * STANDARD_TAX_RATE;
      return { amount, simp, std };
    });
  }, [monthlyExpenses]);

  const methodCard = (opts: {
    best: boolean;
    title: string;
    sub: string;
    tax: number;
    net: number;
    eff: number;
  }) => (
    <TintCard color={opts.best ? SEM.green : SEM.gray} title={`${opts.best ? "✅ " : ""}${opts.title}`}>
      <Text style={{ fontSize: 12, color: colors.n580 }}>{opts.sub}</Text>
      <Text style={{ fontSize: 22, fontWeight: "800", color: colors.n940, marginVertical: 4 }}>
        {fmt(opts.tax)} <Text style={{ fontSize: 13, fontWeight: "400", color: colors.n580 }}>AZN/ay</Text>
      </Text>
      <Text style={{ fontSize: 13, color: colors.n580 }}>
        Xalis gəlir: <Text style={{ fontWeight: "700", color: colors.n940 }}>{fmt(opts.net)} AZN/ay</Text>
      </Text>
      <Text style={{ fontSize: 12, color: colors.n580, marginTop: 2 }}>Effektiv dərəcə: {opts.eff.toFixed(1)}%</Text>
    </TintCard>
  );

  return (
    <View>
      <SegmentControl
        label="Hesablama rejimi"
        options={[
          { value: "compare", label: "Müqayisə" },
          { value: "simplified", label: "Sadələşdirilmiş" },
          { value: "standard", label: "Standart (14%)" },
        ]}
        selected={taxMethod}
        onSelect={setTaxMethod}
      />

      <InputField
        label="💰 Aylıq kirayə gəliri (AZN)"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        placeholder="2000"
        keyboardType="decimal-pad"
      />
      <PresetChips
        values={[500, 1000, 2000, 3000, 5000]}
        onPick={(v) => setMonthlyIncome(String(v))}
        active={parseFloat(monthlyIncome)}
      />
      <InputField
        label="🔧 Aylıq xərclər (AZN) — standart üsul üçün"
        value={monthlyExpenses}
        onChangeText={setMonthlyExpenses}
        placeholder="0"
        keyboardType="decimal-pad"
        hint="Təmir, kommunal, amortizasiya, sığorta və s."
      />

      {result ? (
        <View>
          {taxMethod === "compare" && (
            <>
              {methodCard({
                best: result.simplifiedBetter,
                title: "Sadələşdirilmiş",
                sub: result.simplifiedTier,
                tax: result.simplifiedMonthly,
                net: result.simplifiedNet,
                eff: result.simplifiedEffective,
              })}
              {methodCard({
                best: !result.simplifiedBetter,
                title: "Standart (14%)",
                sub: `Mənfəətdən: (${fmt(result.income)} − ${fmt(result.expenses)}) × 14%`,
                tax: result.standardMonthly,
                net: result.standardNet,
                eff: result.standardEffective,
              })}
              <InfoBox variant="success">
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.n940 }}>
                  💡{" "}
                  {result.simplifiedBetter
                    ? `Sadələşdirilmiş üsul ayda ${fmt(result.savings)} AZN, ildə ${fmt(result.annualSavings)} AZN qənaət edir`
                    : `Standart üsul ayda ${fmt(result.savings)} AZN, ildə ${fmt(result.annualSavings)} AZN qənaət edir`}
                </Text>
                {result.breakevenExpenses > 0 && result.simplifiedBetter && (
                  <Text style={{ fontSize: 12, color: colors.n760, marginTop: 6 }}>
                    Standart üsulun sərfəli olması üçün aylıq xərcləriniz {fmt(result.breakevenExpenses)} AZN-dən çox
                    olmalıdır.
                  </Text>
                )}
              </InfoBox>
            </>
          )}

          {taxMethod === "simplified" && (
            <StatGrid
              items={[
                { label: "Aylıq gəlir", value: `${fmt(result.income)} AZN` },
                { label: `Vergi (${result.simplifiedTier})`, value: `${fmt(result.simplifiedMonthly)} AZN` },
                { label: "Xalis gəlir", value: `${fmt(result.simplifiedNet)} AZN / ay`, accent: true },
              ]}
            />
          )}

          {taxMethod === "standard" && (
            <StatGrid
              items={[
                {
                  label: `Aylıq mənfəət (${fmt(result.income)} − ${fmt(result.expenses)})`,
                  value: `${fmt(result.profit)} AZN`,
                },
                { label: "Standart (14%)", value: `${fmt(result.standardMonthly)} AZN` },
                { label: "Xalis gəlir", value: `${fmt(result.standardNet)} AZN / ay`, accent: true },
              ]}
            />
          )}

          <TintCard color={SEM.blue} title="📅 İllik hesablama">
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.n580, letterSpacing: 0.5, marginTop: 2 }}>
              SADƏLƏŞDİRİLMİŞ
            </Text>
            <KV label="İllik gəlir" value={fmt(result.annualIncome)} />
            <KV label="İllik vergi" value={fmt(result.simplifiedAnnual)} color={SEM.amber} />
            <KV label="İllik xalis" value={fmt(result.simplifiedAnnualNet)} color={colors.accent} bold />
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.n580, letterSpacing: 0.5, marginTop: 10 }}>
              STANDART (14%)
            </Text>
            <KV label="İllik gəlir" value={fmt(result.annualIncome)} />
            <KV label="İllik vergi" value={fmt(result.standardAnnual)} color={SEM.amber} />
            <KV label="İllik xalis" value={fmt(result.standardAnnualNet)} color={colors.accent} bold />
          </TintCard>

          <DataTable
            title="📋 Ətraflı müqayisə (aylıq)"
            headers={["", "Sadələşdirilmiş", "Standart (14%)"]}
            columnWidths={[130, 150, 120]}
            rows={[
              ["Aylıq gəlir", fmt(result.income), fmt(result.income)],
              ["Xərclər", "çıxılmır", `−${fmt(result.expenses)}`],
              ["Vergi bazası", fmt(result.income), fmt(result.profit)],
              ["Vergi dərəcəsi", result.simplifiedTier, "14%"],
              ["Vergi məbləği", fmt(result.simplifiedMonthly), fmt(result.standardMonthly)],
            ]}
            highlightRows={[4]}
            footer={["Xalis gəlir", fmt(result.simplifiedNet), fmt(result.standardNet)]}
          />

          <TintCard color={SEM.gray}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n580 }}>Vergi yükü müqayisəsi</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: colors.n580 }}>Sadələşdirilmiş</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n940 }}>
                {fmt(result.simplifiedMonthly)} AZN ({result.simplifiedEffective.toFixed(1)}%)
              </Text>
            </View>
            <SplitBar total={100} segments={[{ value: result.simplifiedEffective, color: "#fbbf24" }]} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: colors.n580 }}>Standart (14%)</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n940 }}>
                {fmt(result.standardMonthly)} AZN ({result.standardEffective.toFixed(1)}%)
              </Text>
            </View>
            <SplitBar total={100} segments={[{ value: result.standardEffective, color: "#fb923c" }]} />
          </TintCard>

          <DataTable
            title="📊 Sürətli müqayisə — müxtəlif kirayə məbləğləri"
            headers={["Aylıq gəlir", "Sadələşdirilmiş", "Standart (14%)", "Sərfəli"]}
            columnWidths={[110, 120, 120, 130]}
            rows={quickRows.map((r) => [
              `${fmt(r.amount)} AZN`,
              fmt(r.simp),
              fmt(r.std),
              r.simp <= r.std ? "Sadələşdirilmiş" : "Standart (14%)",
            ])}
            highlightRows={quickRows
              .map((r, i) => (Math.abs(r.amount - result.income) < 0.01 ? i : -1))
              .filter((i) => i >= 0)}
          />

          <InfoBox variant="info">
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
              <Text style={{ fontWeight: "700" }}>Qeyd:</Text> Sadələşdirilmiş vergidə xərclər çıxılmır — vergi birbaşa
              gəlirdən hesablanır. Standart üsulda isə sənədləşdirilmiş xərclər (təmir, kommunal, amortizasiya, sığorta)
              gəlirdən çıxılır və vergi yalnız mənfəətdən tutulur. Kirayə müqaviləsi notarial qaydada təsdiq olunmalı və
              vergi orqanında qeydiyyatdan keçirilməlidir. Bəyannamə hər il 31 marta qədər verilməlidir.
            </Text>
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🏠" text="Nəticəni görmək üçün aylıq kirayə gəlirini daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["rental-tax", "property-tax", "deposit", "vat"]} />
    </View>
  );
}
