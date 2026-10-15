import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { Paragraph, Card, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { AmountCard, CardRow, LabeledText, BarRow } from "./_leave-parts";

const MAX_BENEFIT = 250; // AZN/ay
const MIN_BENEFIT = 180; // AZN/ay
const TOTAL_WEEKS = 26;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const FORMULA_TITLE = "İşsizlik müavinəti necə hesablanır?";
const FORMULA_CONTENT = `Azərbaycan Əmək və Əhali Sosial Müdafiə Nazirliyi:

Müavinətin məbləği:
- İlk 3 ay: orta əmək haqqının 50%-i
- Növbəti 3 ay: orta əmək haqqının 45%-i
- Qalan aylar: orta əmək haqqının 40%-i

Hədlər:
- Maksimum: ${MAX_BENEFIT} AZN / ay
- Minimum: ${MIN_BENEFIT} AZN / ay

Müavinət müddəti: ${TOTAL_WEEKS} həftə (təqribən 6 ay)

Şərtlər:
- Minimum 1 il iş təcrübəsi olmalıdır
- DSMF-yə sığorta haqqı ödənilmiş olmalıdır
- Məşğulluq Xidmətində qeydiyyata alınmalıdır`;

export function UnemploymentCalculator() {
  const { colors } = useTheme();
  const [avgSalary, setAvgSalary] = useState("");
  const [workExperience, setWorkExperience] = useState("");

  const result = useMemo(() => {
    const salary = parseFloat(avgSalary.replace(",", "."));
    const experience = parseFloat(workExperience.replace(",", "."));
    if (!salary || salary <= 0) return null;
    if (!experience || experience < 1) return null;

    const month1_3 = Math.min(Math.max(salary * 0.5, MIN_BENEFIT), MAX_BENEFIT);
    const month4_6 = Math.min(Math.max(salary * 0.45, MIN_BENEFIT), MAX_BENEFIT);
    const monthRemaining = Math.min(Math.max(salary * 0.4, MIN_BENEFIT), MAX_BENEFIT);

    const rawMonth1_3 = salary * 0.5;
    const rawMonth4_6 = salary * 0.45;
    const rawMonthRemaining = salary * 0.4;

    const total6Months = month1_3 * 3 + month4_6 * 3;

    const months = [
      { month: 1, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 2, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 3, rate: "50%", raw: rawMonth1_3, adjusted: month1_3 },
      { month: 4, rate: "45%", raw: rawMonth4_6, adjusted: month4_6 },
      { month: 5, rate: "45%", raw: rawMonth4_6, adjusted: month4_6 },
      { month: 6, rate: "40%", raw: rawMonthRemaining, adjusted: monthRemaining },
    ];

    return { salary, month1_3, month4_6, monthRemaining, total6Months, months };
  }, [avgSalary, workExperience]);

  const expNum = parseFloat(workExperience.replace(",", "."));

  return (
    <View>
      <InputField
        label="Orta aylıq əmək haqqı (AZN)"
        value={avgSalary}
        onChangeText={setAvgSalary}
        placeholder="800"
        keyboardType="decimal-pad"
      />
      <InputField
        label="İş təcrübəsi (il)"
        value={workExperience}
        onChangeText={setWorkExperience}
        placeholder="3"
        keyboardType="decimal-pad"
      />
      {!!workExperience && expNum < 1 && (
        <Text style={{ fontSize: 12, color: "#ef4444", marginTop: -8, marginBottom: 12 }}>
          İşsizlik müavinəti almaq üçün minimum 1 il iş təcrübəsi tələb olunur.
        </Text>
      )}

      {result ? (
        <View>
          <CardRow>
            <AmountCard tone="blue" label="İlk 3 ay (aylıq)" value={fmt(result.month1_3)} sub="AZN / ay" />
            <AmountCard tone="amber" label="4-6-cı aylar (aylıq)" value={fmt(result.month4_6)} sub="AZN / ay" />
            <AmountCard label="6 ayın ümumi müavinəti" value={fmt(result.total6Months)} sub="AZN" />
          </CardRow>

          <ResultSection title="Aylıq bölgü">
            {result.months.map((m) => (
              <ResultRow
                key={m.month}
                label={`${m.month}-ci ay  (${m.rate})${m.raw !== m.adjusted ? `\nhesablanan: ${fmt(m.raw)} AZN` : ""}`}
                value={`${fmt(m.adjusted)} AZN`}
              />
            ))}
            <ResultRow label="Cəmi (6 ay)" value={`${fmt(result.total6Months)} AZN`} highlight />
          </ResultSection>

          <View style={{ backgroundColor: colors.n200, borderRadius: 12, padding: 14, marginTop: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.n580, marginBottom: 10 }}>
              Müavinət dinamikası
            </Text>
            {result.months.map((m) => (
              <BarRow key={m.month} label={`${m.month}-ci ay`} value={fmt(m.adjusted)} ratio={m.adjusted / MAX_BENEFIT} />
            ))}
          </View>

          <InfoBox variant="info">
            <LabeledText label="Qeyd:">
              {`İşsizlik müavinəti Məşğulluq Xidmətində qeydiyyata alınmış şəxslərə verilir. Müavinət müddəti ${TOTAL_WEEKS} həftədir. Maksimum məbləğ ${MAX_BENEFIT} AZN, minimum ${MIN_BENEFIT} AZN-dir. İş təklifi rəddi müavinəti dayandırır.`}
            </LabeledText>
          </InfoBox>
        </View>
      ) : (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>📋</Text>
          <Paragraph>Nəticəni görmək üçün əmək haqqını və iş təcrübəni daxil edin.</Paragraph>
          <Text style={{ fontSize: 12, color: colors.n580, textAlign: "center" }}>
            Minimum 1 il iş təcrübəsi tələb olunur.
          </Text>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "maternity-leave", "disability-benefit", "overtime"]} />
    </View>
  );
}
