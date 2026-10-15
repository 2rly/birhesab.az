import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { StatGrid, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";
import { OptionCards, SplitBar, LegendRow, TintCard, KV, EmptyState, PresetChips, SEM } from "./_tax-parts";

type RecipientType = "individual" | "legal";
type Frequency = "monthly" | "quarterly" | "annual";

const DIVIDEND_TAX_RATE = 0.05; // 5% for both

const FORMULA_TITLE = "Dividend vergisi necə hesablanır?";
const FORMULA_CONTENT = `Azərbaycanda dividend gəliri vergisi (Vergi Məcəlləsi, Maddə 123):

Fiziki şəxslər:
• Dividend gəlirindən 5% vergi tutulur
• Vergi ödəmə mənbəyində (şirkət tərəfindən) tutulur
• Əlavə bəyannamə tələb olunmur

Hüquqi şəxslər:
• Dividend gəlirindən 5% vergi tutulur
• Şirkət tərəfindən ödəmə mənbəyində tutulur

Hesablama:
Vergi məbləği = Ümumi dividend × 5%
Xalis dividend = Ümumi dividend − Vergi məbləği

Nümunə:
10 000 AZN dividend → 500 AZN vergi → 9 500 AZN xalis
Qeyd: Dividend vergisi mənfəət vergisindən sonra hesablanır (ikili vergitutma yoxdur).`;

const fmt = (n: number) => fmtNum(n, 2);

export function DividendTaxCalculator() {
  const { colors } = useTheme();
  const [grossDividend, setGrossDividend] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("individual");
  const [frequency, setFrequency] = useState<Frequency>("annual");

  const result = useMemo(() => {
    const gross = parseFloat(grossDividend.replace(",", "."));
    if (!gross || gross <= 0) return null;
    const taxRate = DIVIDEND_TAX_RATE;
    const taxAmount = gross * taxRate;
    const netDividend = gross - taxAmount;

    let annualGross: number;
    let periodLabel: string;
    switch (frequency) {
      case "monthly":
        annualGross = gross * 12;
        periodLabel = "aylıq";
        break;
      case "quarterly":
        annualGross = gross * 4;
        periodLabel = "rüblük";
        break;
      default:
        annualGross = gross;
        periodLabel = "illik";
    }
    const annualTax = annualGross * taxRate;
    const annualNet = annualGross - annualTax;
    return { gross, taxAmount, netDividend, annualGross, annualTax, annualNet, periodLabel };
  }, [grossDividend, frequency]);

  return (
    <View>
      <OptionCards
        label="Alıcının statusu"
        columns={2}
        options={[
          { value: "individual", icon: "👤", title: "Fiziki şəxs", description: "Dividend vergisi: 5%" },
          { value: "legal", icon: "🏢", title: "Hüquqi şəxs", description: "Dividend vergisi: 5%" },
        ]}
        selected={recipientType}
        onSelect={setRecipientType}
      />

      <SegmentControl
        label="Ödəniş tezliyi"
        options={[
          { value: "monthly", label: "Aylıq" },
          { value: "quarterly", label: "Rüblük" },
          { value: "annual", label: "İllik" },
        ]}
        selected={frequency}
        onSelect={setFrequency}
      />

      <InputField
        label="💰 Ümumi dividend məbləği (AZN)"
        value={grossDividend}
        onChangeText={setGrossDividend}
        placeholder="10000"
        keyboardType="decimal-pad"
      />
      <PresetChips
        values={[1000, 5000, 10000, 25000, 50000]}
        onPick={(v) => setGrossDividend(String(v))}
        format={(v) => fmtNum(v, 0)}
        active={parseFloat(grossDividend)}
      />

      {result ? (
        <View>
          <StatGrid
            items={[
              { label: "Ümumi dividend", value: `${fmt(result.gross)} AZN` },
              { label: "Vergi (5%)", value: `${fmt(result.taxAmount)} AZN` },
              { label: "Xalis dividend", value: `${fmt(result.netDividend)} AZN`, accent: true },
            ]}
          />

          <TintCard color={SEM.blue} title={`📅 İllik hesablama (${result.periodLabel} ödəniş)`}>
            <KV label="İllik ümumi dividend" value={`${fmt(result.annualGross)} AZN`} />
            <KV label="İllik vergi" value={`${fmt(result.annualTax)} AZN`} color={SEM.amber} />
            <KV label="İllik xalis gəlir" value={`${fmt(result.annualNet)} AZN`} color={colors.accent} bold />
          </TintCard>

          <ResultSection title="📋 Ətraflı hesablama">
            <ResultRow label="Ümumi dividend məbləği" value={`${fmt(result.gross)} AZN`} />
            <ResultRow label="Alıcı statusu" value={recipientType === "individual" ? "Fiziki şəxs" : "Hüquqi şəxs"} />
            <ResultRow label="Vergi dərəcəsi" value="5%" />
            <ResultRow label="Vergi məbləği" value={`${fmt(result.taxAmount)} AZN`} bold />
            <ResultRow label="Xalis dividend" value={`${fmt(result.netDividend)} AZN`} highlight bold />
          </ResultSection>

          <TintCard color={SEM.gray}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n580 }}>Dividendin bölgüsü</Text>
            <SplitBar
              height={20}
              segments={[
                { value: result.netDividend, color: colors.accent },
                { value: result.taxAmount, color: SEM.amber },
              ]}
            />
            <LegendRow
              color={colors.accent}
              label={`Xalis: ${fmt(result.netDividend)} AZN (${((result.netDividend / result.gross) * 100).toFixed(1)}%)`}
            />
            <LegendRow
              color={SEM.amber}
              label={`Vergi: ${fmt(result.taxAmount)} AZN (${((result.taxAmount / result.gross) * 100).toFixed(1)}%)`}
            />
          </TintCard>

          <TintCard color={SEM.blue} title="📊 Sürətli müqayisə — müxtəlif məbləğlər">
            {[1000, 5000, 10000, 25000, 50000, 100000].map((amount) => {
              const tax = amount * DIVIDEND_TAX_RATE;
              const net = amount - tax;
              const isActive = Math.abs(amount - result.gross) < 0.01;
              return (
                <View
                  key={amount}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: isActive ? colors.accent + "22" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.n940 }}>{fmt(amount)} AZN</Text>
                  <Text style={{ fontSize: 13, color: colors.n580 }}>
                    Vergi: <Text style={{ color: SEM.amber, fontWeight: "600" }}>{fmt(tax)}</Text>
                    {"   "}Xalis: <Text style={{ color: colors.accent, fontWeight: "600" }}>{fmt(net)}</Text>
                  </Text>
                </View>
              );
            })}
          </TintCard>

          <InfoBox variant="info">
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
              <Text style={{ fontWeight: "700" }}>Qeyd:</Text> Dividend vergisi ödəmə mənbəyində tutulur — yəni şirkət
              dividendi ödəyərkən vergini avtomatik tutur və dövlət büdcəsinə köçürür. Dividend alan şəxsin əlavə
              bəyannamə verməsinə ehtiyac yoxdur. Dividend mənfəət vergisi ödənildikdən sonra qalan xalis mənfəətdən
              ödənilir.
            </Text>
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="💹" text="Nəticəni görmək üçün dividend məbləğini daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "freelancer-tax", "vat", "deposit"]} />
    </View>
  );
}
