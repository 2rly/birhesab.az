import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { ToggleRow } from "@/components/Controls";
import { ResultSection } from "@/components/ResultRow";
import {
  DataTable,
  FormulaSection,
  RelatedCalculators,
  SectionHeading,
  Paragraph,
  Card,
  InfoBox,
  FaqSection,
} from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { useTheme } from "@/constants/theme";
import {
  OptionCards,
  ToneCard,
  ToneGrid,
  ToneRow,
  TonePanel,
  QuickChips,
  ShowMoreButton,
  EmptyState,
  TONES,
} from "./_loan-parts";

type Currency = "AZN" | "USD";
type PayoutType = "end" | "monthly";

interface MonthRow {
  month: number;
  interest: number;
  taxExempt: number;
  taxableAmount: number;
  tax: number;
  netInterest: number;
  payout: number;
  balance: number;
}

const TAX_RATE = 0.1;
const MONTHLY_EXEMPTION = 200;

function formatMoney(n: number, currency: Currency): string {
  return `${fmtNum(n, 2)} ${currency}`;
}

const pt = {
  formulaTitle: "Depozit vergisi necə hesablanır? (V.M. 102.1.22)",
  formulaContent: `Aylıq faiz ödənişi (sadə faiz):
Aylıq gəlir = Məbləğ × (İllik faiz ÷ 12 ÷ 100)

Müddət sonunda (mürəkkəb faiz):
Yekun məbləğ = Məbləğ × (1 + aylıq faiz)ⁿ

V.M. 102.1.22-3 (200₼ Güzəşti):
• AZN depozitlər üzrə aylıq faiz gəlirinin 200₼-dək hissəsi vergidən azaddır
• Vergi (10%) yalnız 200₼-i keçən hissədən tutulur
• Hər bir bankda ayrıca tətbiq olunur

V.M. 102.1.22-4 (18 Ay Qaydası):
• AZN depozit, müddəti ≥18 ay, vaxtından əvvəl çıxarılmırsa
• Bütün faiz gəlirləri 100% vergidən azaddır (3 il müddətinə)
• Vaxtından əvvəl çıxarılsa, 200₼ güzəşt qaydası tətbiq olunur

Xarici valyuta (USD/EUR):
• Heç bir güzəşt yoxdur
• Bütün faiz gəlirindən 10% ÖMV tutulur

Depozit sığortası:
• Fiziki şəxslər üçün 100.000 AZN-dək sığortalanır`,
  manat: "Manat (AZN)",
  dollar: "Dollar (USD)",
  depositAmount: "Depozit məbləği",
  annualRate: "İllik faiz dərəcəsi (%)",
  termMonths: "Müddət (ay)",
  monthShort: "ay",
  interestPayoutMethod: "Faiz ödəniş üsulu",
  monthlyPayout: "Aylıq ödəniş",
  monthlyPayoutDesc: "Faiz hər ay hesabınıza köçürülür (sadə faiz)",
  endPayout: "Müddətin sonunda",
  endPayoutDesc: "Faiz depozitə əlavə olunur (mürəkkəb faiz)",
  earlyWithdrawal: "Depoziti 18 aydan əvvəl çıxaracağam",
  earlyWithdrawalDesc: "İşarələsəniz, 100% vergisiz güzəşt əvəzinə 200₼ aylıq güzəşt tətbiq olunacaq",
  foreignCurrencyWarning: "Xarici valyuta depozitlərində heç bir güzəşt yoxdur — bütün faiz gəlirindən",
  foreignCurrencyTax: "10% ÖMV",
  foreignCurrencyTaxSuffix: "tutulur.",
  rule18MonthPrefix: "V.M. 102.1.22-4:",
  rule18MonthText: "AZN depozit, müddəti {m} ay (≥18 ay), vaxtında çıxarılacaq — bütün faiz gəlirləri",
  rule18MonthBold: "100% vergidən azaddır",
  rule200Prefix: "V.M. 102.1.22-3:",
  rule200Text: "Aylıq faiz gəlirinin",
  rule200Bold: "200₼-dək",
  rule200Suffix: "hissəsi vergidən azaddır. 200₼-dən artıq hissədən",
  rule200Tax: "10% ÖMV",
  rule200TaxSuffix: "tutulur.",
  totalInterestIncome: "Ümumi faiz gəliri",
  tax10: "Vergi (10% ÖMV)",
  taxLabel: "Vergi",
  taxFree100: "100% vergidən azad",
  netInterestIncome: "Xalis faiz gəliri",
  finalAmount: "Yekun məbləğ",
  depositAmountLabel: "Depozit məbləği",
  calculationDetails: "Hesablama detalları",
  annualRateLabel: "İllik faiz dərəcəsi",
  termLabel: "Müddət",
  taxRuleLabel: "Vergi qaydası",
  taxRuleNoExemption: "Güzəşt yoxdur — 10% ÖMV",
  taxRule18Month: "V.M. 102.1.22-4 — 100% vergidən azad",
  taxRule200: "V.M. 102.1.22-3 — aylıq 200₼ güzəşt",
  totalInterest: "Ümumi faiz gəliri",
  taxExemptPortion: "Vergidən azad hissə",
  taxDeduction: "Vergi tutulması (10%)",
  netInterestReceived: "Xalis faiz gəliri (əlinizə çatan)",
  monthlyTable: "Aylıq cədvəl",
  monthCol: "Ay",
  interestCol: "Faiz",
  exemptionCol: "Güzəşt",
  taxCol: "Vergi",
  netCol: "Xalis",
  balanceCol: "Balans",
  collapse: "Yığ",
  showAll: "Bütün {count} ayı göstər",
  taxRulesTitle: "Depozit vergisi qaydaları (Vergi Məcəlləsi)",
  rule200Title: "V.M. 102.1.22-3 — Aylıq 200₼ güzəşt",
  rule200Desc:
    "Yerli bank və xarici bankın AR-dakı filialı tərəfindən fiziki şəxslərin hər bir bankda milli valyutada olan depozitlər üzrə hesablanan aylıq faiz gəlirlərinin 200₼-dək hissəsi gəlir vergisindən azaddır. Müddət tələbi yoxdur.",
  rule18Title: "V.M. 102.1.22-4 — 18 ay qaydası",
  rule18Desc:
    "Milli valyutada olan depozit 18 ay və daha artıq müddətə yerləşdirildikdə və məbləğ 18 aydan tez olmadan ödənildikdə, hesablanmış faiz gəlirlərinin tam hissəsi 3 il müddətinə vergidən azaddır (2024-cü ildən). Vaxtından əvvəl çıxarılsa, 200₼ güzəşt qaydası tətbiq olunur.",
  foreignCurrencyTitle: "Xarici valyuta (USD/EUR)",
  foreignCurrencyDesc:
    "Heç bir güzəşt yoxdur — bütün faiz gəlirindən 10% vergi tutulur. 18 ay qaydası yalnız milli valyutaya şamil edilir.",
  perBankTitle: "Hər bir bank ayrıca",
  perBankDesc:
    "Güzəşt hər bir bankda ayrı-ayrılıqda tətbiq olunur. 5 bankda əmanətiniz varsa, hər birində 200₼ güzəşt ayrıca hesablanır.",
  practicalExamples: "Praktiki misallar",
  faqTitle: "Tez-tez verilən suallar",
  depositInsurance: "Depozit sığortası",
  depositInsuranceTextAZN:
    "Azərbaycan Depozit Sığorta Fondu fiziki şəxslərin bank depozitlərini 100.000 AZN-dək sığortalayır.",
  depositInsuranceTextUSD:
    "Azərbaycan Depozit Sığorta Fondu fiziki şəxslərin bank depozitlərini ekvivalent məbləğdə-dək sığortalayır.",
  emptyStateText: "Nəticəni görmək üçün məbləğ, faiz və müddət daxil edin.",
};

type ExLine = { text: string; val?: string; tone?: "red" | "green" | "accent" | "bold"; after?: string };
const EXAMPLES: { title: string; desc: string; tone: "neutral" | "green" | "red"; lines: ExLine[] }[] = [
  {
    title: "Misal 1: 12 aylıq AZN depozit",
    desc: "30.000₼ məbləğ, illik 10%, 12 ay müddətinə",
    tone: "neutral",
    lines: [
      { text: "Ümumi faiz: 30.000 × 10% =", val: "3.000₼", tone: "bold" },
      { text: "İllik güzəşt: 200 × 12 =", val: "2.400₼", tone: "bold" },
      { text: "Vergiyə cəlb olunan: 3.000 − 2.400 =", val: "600₼", tone: "bold" },
      { text: "Vergi (10%): 600 × 10% =", val: "60₼", tone: "red" },
    ],
  },
  {
    title: "Misal 2: Aylıq ödənişli depozit",
    desc: "180.000₼ məbləğ, illik 8%, aylıq ödəniş",
    tone: "neutral",
    lines: [
      { text: "Aylıq faiz: 180.000 × 8% ÷ 12 =", val: "1.200₼", tone: "bold" },
      { text: "Aylıq vergi: (1.200 − 200) × 10% =", val: "100₼", tone: "red" },
      { text: "Aylıq əlinizə çatan: 1.200 − 100 =", val: "1.100₼", tone: "accent" },
    ],
  },
  {
    title: "Misal 3: 24 aylıq AZN depozit (vergisiz)",
    desc: "30.000₼ məbləğ, illik 10%, 24 ay, vaxtında çıxarılır",
    tone: "green",
    lines: [
      { text: "Müddət ≥18 ay və vaxtından əvvəl çıxarılmır →", val: "100% vergidən azad", tone: "green" },
      { text: "Aylıq 1.200₼ faizin hamısını alacaqsınız, heç bir vergi tutulmayacaq." },
    ],
  },
  {
    title: "Misal 4: 24 aylıq depozit, 12 aydan sonra çıxarılır",
    desc: "30.000₼ məbləğ, illik 10%, 24 aylıq müqavilə, amma 12 ayda çıxarılır",
    tone: "red",
    lines: [
      {
        text: "Müddət 24 ay (≥18) olsa da, 18 aydan",
        val: "tez çıxarıldığı üçün",
        tone: "red",
        after: " V.M. 102.1.22-4 tətbiq olunmur.",
      },
      { text: "V.M. 102.1.22-3 tətbiq olunur: aylıq 200₼ güzəşt." },
    ],
  },
  {
    title: "Misal 5: USD depozit",
    desc: "50.000 USD, 24 ay müddətinə",
    tone: "red",
    lines: [
      { text: "Xarici valyutada olduğu üçün", val: "heç bir güzəşt yoxdur", tone: "red", after: "." },
      { text: "18 ay qaydası yalnız milli valyutaya şamil olunur. Bütün faiz gəlirindən 10% vergi tutulur." },
    ],
  },
];

const FAQ = [
  {
    q: "5 bankda əmanətim var, hər biri ≥18 ay. Hamısı vergidən azaddır?",
    a: "Bəli. Güzəşt hər bir bankda ayrıca tətbiq olunur.",
  },
  {
    q: "12 aylıq əmanətdən 1.000₼ gəlir əldə edirəm. Hamısı vergiyə cəlb olunur?",
    a: "Xeyr. 1.000₼-dan 200₼ güzəşt çıxılır, 800₼ vergiyə cəlb olunur. Vergi: 800 × 10% = 80₼.",
  },
  {
    q: "24 aylıq USD əmanət vergidən azad olur?",
    a: "Xeyr. 18 ay qaydası yalnız milli valyutaya (AZN) şamil edilir. USD-dən 10% vergi tutulur.",
  },
  {
    q: "Vergidən azadolma müddəti nə qədərdir?",
    a: "2024-cü ilin yanvarından etibarən 3 il müddətinə (V.M. 102.1.22-4). V.M. 123-cü maddəsinə əsasən faiz gəlirləri kapital gəlirləri olub, 10% dərəcə ilə ödəmə mənbəyində tutulur.",
  },
];

export function DepositCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [payoutType, setPayoutType] = useState<PayoutType>("end");
  const [earlyWithdrawal, setEarlyWithdrawal] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);

  const m = parseInt(months) || 0;
  const is18MonthRule = currency === "AZN" && m >= 18 && !earlyWithdrawal;

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);

    if (!a || a <= 0 || !r || r <= 0 || !m || m <= 0) return null;

    const monthlyRate = r / 100 / 12;
    const table: MonthRow[] = [];
    let totalInterest = 0;
    let totalTax = 0;
    let totalNetInterest = 0;
    let totalExempt = 0;

    const taxFor = (interest: number) => {
      if (currency === "USD") {
        return { taxExempt: 0, taxableAmount: interest, tax: interest * TAX_RATE };
      } else if (is18MonthRule) {
        return { taxExempt: interest, taxableAmount: 0, tax: 0 };
      }
      const taxableAmount = Math.max(0, interest - MONTHLY_EXEMPTION);
      return {
        taxExempt: Math.min(interest, MONTHLY_EXEMPTION),
        taxableAmount,
        tax: taxableAmount * TAX_RATE,
      };
    };

    if (payoutType === "end") {
      let balance = a;
      for (let i = 1; i <= m; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        const { taxExempt, taxableAmount, tax } = taxFor(interest);
        const netInterest = interest - tax;
        totalTax += tax;
        totalNetInterest += netInterest;
        totalExempt += taxExempt;
        balance += interest;
        table.push({ month: i, interest, taxExempt, taxableAmount, tax, netInterest, payout: 0, balance });
      }
      return {
        totalInterest,
        totalTax,
        totalNetInterest,
        totalExempt,
        finalAmount: a + totalInterest,
        finalAmountAfterTax: a + totalNetInterest,
        monthlyInterest: 0,
        table,
      };
    }

    const monthlyInterest = a * monthlyRate;
    for (let i = 1; i <= m; i++) {
      totalInterest += monthlyInterest;
      const { taxExempt, taxableAmount, tax } = taxFor(monthlyInterest);
      const netInterest = monthlyInterest - tax;
      totalTax += tax;
      totalNetInterest += netInterest;
      totalExempt += taxExempt;
      table.push({
        month: i,
        interest: monthlyInterest,
        taxExempt,
        taxableAmount,
        tax,
        netInterest,
        payout: netInterest,
        balance: a,
      });
    }
    return {
      totalInterest,
      totalTax,
      totalNetInterest,
      totalExempt,
      finalAmount: a,
      finalAmountAfterTax: a,
      monthlyInterest,
      table,
    };
  }, [amount, rate, payoutType, currency, is18MonthRule, m]);

  const visibleRows = result ? (showFullTable ? result.table : result.table.slice(0, 12)) : [];

  const bold = { fontWeight: "700" as const, color: colors.n940 };

  return (
    <View>
      <SegmentControl
        options={[
          { value: "AZN", label: pt.manat },
          { value: "USD", label: pt.dollar },
        ]}
        selected={currency}
        onSelect={setCurrency}
      />

      <InputField
        label={`${pt.depositAmount} (${currency})`}
        value={amount}
        onChangeText={setAmount}
        placeholder="10000"
        keyboardType="decimal-pad"
      />
      <InputField
        label={pt.annualRate}
        value={rate}
        onChangeText={setRate}
        placeholder={currency === "AZN" ? "10" : "3"}
        keyboardType="decimal-pad"
      />
      <InputField
        label={pt.termMonths}
        value={months}
        onChangeText={setMonths}
        placeholder="12"
        keyboardType="number-pad"
      />
      <QuickChips
        options={[6, 12, 18, 24, 36].map((v) => ({ value: String(v), label: `${v} ${pt.monthShort}` }))}
        selected={months}
        onSelect={setMonths}
      />

      <OptionCards
        label={pt.interestPayoutMethod}
        selected={payoutType}
        onSelect={setPayoutType}
        columns={1}
        options={[
          { value: "monthly", title: pt.monthlyPayout, description: pt.monthlyPayoutDesc },
          { value: "end", title: pt.endPayout, description: pt.endPayoutDesc },
        ]}
      />

      {currency === "AZN" && m >= 18 && (
        <ToggleRow
          label={pt.earlyWithdrawal}
          description={pt.earlyWithdrawalDesc}
          value={earlyWithdrawal}
          onValueChange={setEarlyWithdrawal}
        />
      )}

      {/* Vergi qaydası məlumatı */}
      <InfoBox variant={currency === "USD" ? "danger" : is18MonthRule ? "success" : "warning"}>
        <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>
          {currency === "USD" ? (
            <>
              {pt.foreignCurrencyWarning} <Text style={bold}>{pt.foreignCurrencyTax}</Text> {pt.foreignCurrencyTaxSuffix}
            </>
          ) : is18MonthRule ? (
            <>
              <Text style={bold}>{pt.rule18MonthPrefix}</Text> {pt.rule18MonthText.replace("{m}", String(m))}{" "}
              <Text style={bold}>{pt.rule18MonthBold}</Text>.
            </>
          ) : (
            <>
              <Text style={bold}>{pt.rule200Prefix}</Text> {pt.rule200Text} <Text style={bold}>{pt.rule200Bold}</Text>{" "}
              {pt.rule200Suffix} <Text style={bold}>{pt.rule200Tax}</Text> {pt.rule200TaxSuffix}
            </>
          )}
        </Text>
      </InfoBox>

      {result ? (
        <View>
          <ToneGrid>
            <ToneCard label={pt.totalInterestIncome} value={formatMoney(result.totalInterest, currency)} tone="green" />
            {result.totalTax > 0 ? (
              <ToneCard label={pt.tax10} value={`-${formatMoney(result.totalTax, currency)}`} tone="red" />
            ) : (
              <ToneCard label={pt.taxLabel} value={formatMoney(0, currency)} sub={pt.taxFree100} tone="green" />
            )}
            <ToneCard label={pt.netInterestIncome} value={formatMoney(result.totalNetInterest, currency)} tone="accent" />
            <ToneCard
              label={payoutType === "end" ? pt.finalAmount : pt.depositAmountLabel}
              value={formatMoney(payoutType === "end" ? result.finalAmountAfterTax : parseFloat(amount), currency)}
            />
          </ToneGrid>

          <ResultSection title={`📊 ${pt.calculationDetails}`}>
            <ToneRow label={pt.depositAmountLabel} value={formatMoney(parseFloat(amount), currency)} />
            <ToneRow label={pt.annualRateLabel} value={`${rate}%`} />
            <ToneRow label={pt.termLabel} value={`${months} ${pt.monthShort}`} />
            <ToneRow
              label={pt.taxRuleLabel}
              value={currency === "USD" ? pt.taxRuleNoExemption : is18MonthRule ? pt.taxRule18Month : pt.taxRule200}
            />
            <ToneRow label={pt.totalInterest} value={formatMoney(result.totalInterest, currency)} tone="green" bold shaded />
            {result.totalExempt > 0 && (
              <ToneRow label={pt.taxExemptPortion} value={formatMoney(result.totalExempt, currency)} tone="green" />
            )}
            {result.totalTax > 0 && (
              <ToneRow label={pt.taxDeduction} value={`-${formatMoney(result.totalTax, currency)}`} tone="red" bold shaded />
            )}
            <ToneRow
              label={pt.netInterestReceived}
              value={formatMoney(result.totalNetInterest, currency)}
              tone="accent"
              bold
              shaded
            />
          </ResultSection>

          <DataTable
            title={`📋 ${pt.monthlyTable}`}
            headers={[
              pt.monthCol,
              pt.interestCol,
              pt.exemptionCol,
              pt.taxCol,
              pt.netCol,
              ...(payoutType === "end" ? [pt.balanceCol] : []),
            ]}
            columnWidths={[50, 120, 120, 110, 120, 130]}
            rows={visibleRows.map((row) => [
              row.month,
              formatMoney(row.interest, currency),
              row.taxExempt > 0 ? formatMoney(row.taxExempt, currency) : "—",
              row.tax > 0 ? `-${formatMoney(row.tax, currency)}` : "0.00",
              formatMoney(row.netInterest, currency),
              ...(payoutType === "end" ? [formatMoney(row.balance, currency)] : []),
            ])}
          />
          {result.table.length > 12 && (
            <ShowMoreButton
              expanded={showFullTable}
              onPress={() => setShowFullTable(!showFullTable)}
              moreLabel={pt.showAll.replace("{count}", String(result.table.length))}
              lessLabel={pt.collapse}
            />
          )}

          {/* Vergi qaydaları */}
          <TonePanel tone="blue" title={`📋 ${pt.taxRulesTitle}`}>
            {[
              [pt.rule200Title, pt.rule200Desc],
              [pt.rule18Title, pt.rule18Desc],
              [pt.foreignCurrencyTitle, pt.foreignCurrencyDesc],
              [pt.perBankTitle, pt.perBankDesc],
            ].map(([t, d]) => (
              <View key={t} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.n940, marginBottom: 2 }}>{t}</Text>
                <Text style={{ fontSize: 13, lineHeight: 19, color: colors.n760 }}>{d}</Text>
              </View>
            ))}
          </TonePanel>

          {/* Praktiki misallar */}
          <SectionHeading icon="📝">{pt.practicalExamples}</SectionHeading>
          {EXAMPLES.map((ex) => {
            const body = (
              <>
                <Paragraph>{ex.desc}</Paragraph>
                {ex.lines.map((l, i) => (
                  <Text key={i} style={{ fontSize: 13, lineHeight: 20, color: colors.n760 }}>
                    {l.text}
                    {l.val ? " " : ""}
                    {l.val ? (
                      <Text
                        style={{
                          fontWeight: "700",
                          color:
                            l.tone === "red"
                              ? TONES.red
                              : l.tone === "green"
                              ? TONES.green
                              : l.tone === "accent"
                              ? colors.accent
                              : colors.n940,
                        }}
                      >
                        {l.val}
                      </Text>
                    ) : null}
                    {l.after ?? ""}
                  </Text>
                ))}
              </>
            );
            return ex.tone === "neutral" ? (
              <Card key={ex.title} title={ex.title}>
                {body}
              </Card>
            ) : (
              <TonePanel key={ex.title} tone={ex.tone} title={ex.title}>
                {body}
              </TonePanel>
            );
          })}

          <FaqSection title={pt.faqTitle} items={FAQ} />

          <InfoBox variant="warning" title={`🛡️ ${pt.depositInsurance}`}>
            {currency === "AZN" ? pt.depositInsuranceTextAZN : pt.depositInsuranceTextUSD}
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🏧" text={pt.emptyStateText} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["loan", "currency", "salary", "dividend-tax"]} />
    </View>
  );
}
