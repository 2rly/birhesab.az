import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { Paragraph, Card, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { OptionCards, AmountCard, CardRow, LabeledText } from "./_leave-parts";

const MINIMUM_WAGE = 345; // AZN

type BirthType = "normal" | "complicated" | "twins";

const BIRTH_TYPES: { value: BirthType; label: string; before: number; after: number; total: number; description: string }[] = [
  { value: "normal", label: "Normal doğuş", before: 70, after: 56, total: 126, description: "70 gün (doğuşdan əvvəl) + 56 gün (doğuşdan sonra)" },
  { value: "complicated", label: "Ağırlaşmış doğuş", before: 70, after: 70, total: 140, description: "70 gün (doğuşdan əvvəl) + 70 gün (doğuşdan sonra)" },
  { value: "twins", label: "Əkiz doğuş", before: 70, after: 110, total: 180, description: "70 gün (doğuşdan əvvəl) + 110 gün (doğuşdan sonra)" },
];

const FORMULA_TITLE = "Analıq məzuniyyəti necə hesablanır?";
const FORMULA_CONTENT = `Azərbaycan Əmək Məcəlləsi, Maddə 125-126:

Məzuniyyət günləri:
• Normal doğuş: 70 + 56 = 126 təqvim günü
• Ağırlaşmış doğuş: 70 + 70 = 140 təqvim günü
• Əkiz doğuş: 70 + 110 = 180 təqvim günü

Ödəniş formulu:
Orta günlük əmək haqqı = Son 12 ayın əmək haqqı / 365
Analıq ödənişi = Orta günlük əmək haqqı × Məzuniyyət günləri

Minimum: Minimum əmək haqqına (${MINIMUM_WAGE} AZN) əsasən hesablanır.
Ödəniş DSMF tərəfindən həyata keçirilir.`;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function MaternityCalculator() {
  const { colors } = useTheme();
  const [monthlySalary, setMonthlySalary] = useState("");
  const [birthType, setBirthType] = useState<BirthType>("normal");

  const result = useMemo(() => {
    const salary = parseFloat(monthlySalary.replace(",", "."));
    if (!salary || salary <= 0) return null;

    const selected = BIRTH_TYPES.find((b) => b.value === birthType)!;
    const annualSalary = salary * 12;
    const avgDailySalary = annualSalary / 365;

    const minDailySalary = (MINIMUM_WAGE * 12) / 365;
    const effectiveDailySalary = Math.max(avgDailySalary, minDailySalary);

    const beforeBirthPayment = effectiveDailySalary * selected.before;
    const afterBirthPayment = effectiveDailySalary * selected.after;
    const totalPayment = effectiveDailySalary * selected.total;

    return {
      annualSalary,
      avgDailySalary,
      minDailySalary,
      effectiveDailySalary,
      beforeBirthPayment,
      afterBirthPayment,
      totalPayment,
      daysBefore: selected.before,
      daysAfter: selected.after,
      totalDays: selected.total,
      isMinimumApplied: avgDailySalary < minDailySalary,
    };
  }, [monthlySalary, birthType]);

  return (
    <View>
      <OptionCards
        label="Doğuş növü"
        options={BIRTH_TYPES.map((bt) => ({ value: bt.value, label: bt.label, desc: `${bt.total} gün\n${bt.description}` }))}
        selected={birthType}
        onSelect={setBirthType}
      />

      <InputField
        label="Aylıq əmək haqqı (gross, AZN)"
        value={monthlySalary}
        onChangeText={setMonthlySalary}
        placeholder="1000"
        keyboardType="decimal-pad"
      />

      {result ? (
        <View>
          <CardRow>
            <AmountCard
              tone="blue"
              label="Ümumi analıq ödənişi"
              value={fmt(result.totalPayment)}
              sub={`AZN / ${result.totalDays} gün`}
            />
            <AmountCard tone="amber" label="Orta günlük əmək haqqı" value={fmt(result.effectiveDailySalary)} sub="AZN / gün" />
          </CardRow>

          {result.isMinimumApplied && (
            <InfoBox variant="warning">
              {`Daxil etdiyiniz əmək haqqı minimum əmək haqqından (${MINIMUM_WAGE} AZN) aşağı olduğu üçün minimum dərəcə tətbiq edildi.`}
            </InfoBox>
          )}

          <ResultSection title="Ödəniş bölgüləri">
            <ResultRow label="İllik əmək haqqı" value={`${fmt(result.annualSalary)} AZN`} />
            <ResultRow label="Orta günlük əmək haqqı (illik / 365)" value={`${fmt(result.avgDailySalary)} AZN`} />
            <ResultRow label={`Doğuşdan əvvəl (${result.daysBefore} gün)`} value={`${fmt(result.beforeBirthPayment)} AZN`} />
            <ResultRow label={`Doğuşdan sonra (${result.daysAfter} gün)`} value={`${fmt(result.afterBirthPayment)} AZN`} />
            <ResultRow label={`Cəmi ödəniş (${result.totalDays} gün)`} value={`${fmt(result.totalPayment)} AZN`} highlight />
          </ResultSection>

          {/* Vizual zolaq */}
          <View style={{ backgroundColor: colors.n200, borderRadius: 12, padding: 14, marginTop: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: colors.n580 }}>Doğuşdan əvvəl</Text>
              <Text style={{ fontSize: 13, color: colors.n580 }}>Doğuşdan sonra</Text>
            </View>
            <View style={{ height: 14, borderRadius: 7, backgroundColor: "#f59e0b55", overflow: "hidden" }}>
              <View
                style={{
                  width: `${(result.daysBefore / result.totalDays) * 100}%`,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6, gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n940, flex: 1 }}>
                {result.daysBefore} gün ({fmt(result.beforeBirthPayment)} AZN)
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#d97706", flex: 1, textAlign: "right" }}>
                {result.daysAfter} gün ({fmt(result.afterBirthPayment)} AZN)
              </Text>
            </View>
          </View>

          <ResultSection title="Doğuş növlərinə görə müqayisə">
            {BIRTH_TYPES.map((bt) => (
              <ResultRow
                key={bt.value}
                label={`${bt.label} · ${bt.total} gün`}
                value={`${fmt(result.effectiveDailySalary * bt.total)} AZN`}
                highlight={bt.value === birthType}
              />
            ))}
          </ResultSection>

          <InfoBox variant="info">
            <LabeledText label="Qeyd:">
              Analıq məzuniyyəti ödənişi DSMF (Dövlət Sosial Müdafiə Fondu) tərəfindən həyata keçirilir. İşəgötürən
              məzuniyyət müddətində iş yerini saxlamalıdır. Məzuniyyətdən sonra qadın uşaq 3 yaşına çatana qədər
              ödənişsiz məzuniyyət götürə bilər.
            </LabeledText>
          </InfoBox>
        </View>
      ) : (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>👶</Text>
          <Paragraph>Nəticəni görmək üçün aylıq əmək haqqını daxil edin.</Paragraph>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "unemployment-benefit", "disability-benefit", "maternity-leave"]} />
    </View>
  );
}
