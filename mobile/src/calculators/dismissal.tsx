import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { Paragraph, Card, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { OptionCards, AmountCard, CardRow } from "./_leave-parts";

const DSMF_RATE = 0.03;
const UNEMPLOYMENT_RATE = 0.005;
const MEDICAL_RATE = 0.02;
const INCOME_TAX_RATE = 0.14;

type Reason = "layoff" | "agreement" | "voluntary" | "contract-end";

const formatMoney = (n: number) => fmtNum(n, 2);

function getCompLabel(years: number): string {
  if (years < 1) return "1 il-dək: 1 aylıq";
  if (years < 5) return "1-5 il: 1.4 aylıq";
  if (years < 10) return "5-10 il: 1.7 aylıq";
  return "10+ il: 2 aylıq";
}

function getCompensationMonths(years: number): number {
  if (years < 1) return 1;
  if (years < 5) return 1.4;
  if (years < 10) return 1.7;
  return 2;
}

const REASONS: { value: Reason; label: string; description: string }[] = [
  { value: "layoff", label: "İşəgötürən tərəfindən ləğv (ixtisar)", description: "Tam kompensasiya ödənilir" },
  { value: "agreement", label: "Tərəflərin razılığı ilə", description: "Tam kompensasiya ödənilir" },
  { value: "voluntary", label: "İşçinin öz istəyi ilə", description: "Kompensasiya ödənilmir" },
  { value: "contract-end", label: "Müddətli müqavilənin bitməsi", description: "Proporsional kompensasiya" },
];

const FORMULA_TITLE = "İşdən çıxma kompensasiyası necə hesablanır?";
const FORMULA_CONTENT = `Əmək Məcəlləsinin 77-ci maddəsinə görə:
• 1 ilədək staj: 1 aylıq orta əmək haqqı
• 1-5 il staj: 1.4 aylıq orta əmək haqqı
• 5-10 il staj: 1.7 aylıq orta əmək haqqı
• 10+ il staj: 2 aylıq orta əmək haqqı

İşdən çıxma səbəbinə görə:
• İxtisar / ləğv: tam kompensasiya
• Tərəflərin razılığı: tam kompensasiya
• İşçinin öz istəyi: kompensasiya yoxdur
• Müqavilə bitməsi: proporsional kompensasiya

İstifadə olunmamış məzuniyyət günləri də ödənilir.`;

export function DismissalCalculator() {
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState<Reason>("layoff");
  const [unusedVacationDays, setUnusedVacationDays] = useState("");

  const result = useMemo(() => {
    const monthlySalary = parseFloat(salary.replace(",", "."));
    const years = parseFloat(experience.replace(",", "."));
    if (!monthlySalary || monthlySalary <= 0 || isNaN(years) || years < 0) return null;

    const compensationMonths = getCompensationMonths(years);
    let grossCompensation = 0;
    let showCompensation = true;

    if (reason === "voluntary") {
      grossCompensation = 0;
      showCompensation = false;
    } else if (reason === "contract-end") {
      grossCompensation = monthlySalary * compensationMonths * 0.5;
    } else {
      grossCompensation = monthlySalary * compensationMonths;
    }

    const vacDays = parseFloat(unusedVacationDays.replace(",", ".")) || 0;
    const dailyRate = (monthlySalary * 12) / 365;
    const vacationCompensation = dailyRate * vacDays;

    const totalGross = grossCompensation + vacationCompensation;

    const dsmf = totalGross * DSMF_RATE;
    const unemployment = totalGross * UNEMPLOYMENT_RATE;
    const medical = totalGross * MEDICAL_RATE;
    const afterDeductions = totalGross - dsmf - unemployment - medical;
    const incomeTax = Math.max(0, afterDeductions) * INCOME_TAX_RATE;
    const totalDeductions = dsmf + unemployment + medical + incomeTax;
    const netAmount = totalGross - totalDeductions;

    return {
      compensationMonths,
      grossCompensation,
      vacationCompensation,
      dailyRate,
      totalGross,
      dsmf,
      unemployment,
      medical,
      incomeTax,
      totalDeductions,
      netAmount,
      showCompensation,
    };
  }, [salary, experience, reason, unusedVacationDays]);

  const years = parseFloat(experience.replace(",", ".")) || 0;

  return (
    <View>
      <InputField
        label="💵 Aylıq əmək haqqı (AZN)"
        value={salary}
        onChangeText={setSalary}
        placeholder="2000"
        keyboardType="decimal-pad"
      />
      <InputField
        label="📅 İş stajı (il)"
        value={experience}
        onChangeText={setExperience}
        placeholder="5"
        keyboardType="decimal-pad"
        hint={years > 0 ? `${getCompLabel(years)} əmək haqqı` : undefined}
      />

      <OptionCards
        label="📋 İşdən çıxma səbəbi"
        options={REASONS.map((r) => ({ value: r.value, label: r.label, desc: r.description }))}
        selected={reason}
        onSelect={setReason}
      />

      <InputField
        label="🏖️ İstifadə olunmamış məzuniyyət günləri"
        value={unusedVacationDays}
        onChangeText={setUnusedVacationDays}
        placeholder="0"
        keyboardType="decimal-pad"
      />

      {result ? (
        <View>
          {reason === "voluntary" && (
            <InfoBox variant="warning">
              ⚠️ İşçinin öz istəyi ilə işdən çıxdıqda kompensasiya ödənilmir. Yalnız istifadə olunmamış məzuniyyət
              günlərinin əvəzi ödənilir.
            </InfoBox>
          )}

          <CardRow>
            <AmountCard tone="blue" label="Net ödəniş" value={formatMoney(result.netAmount)} sub="AZN (əlinizə çatan)" />
            <AmountCard label="Gross ödəniş" value={formatMoney(result.totalGross)} sub="AZN" />
          </CardRow>

          <ResultSection title="📊 Hesablama detalları">
            {result.showCompensation && (
              <ResultRow
                label={`Kompensasiya (${getCompLabel(years)})`}
                value={`${formatMoney(result.grossCompensation)} AZN`}
              />
            )}
            {result.vacationCompensation > 0 && (
              <ResultRow
                label={`Məzuniyyət kompensasiyası (${unusedVacationDays} gün × ${formatMoney(result.dailyRate)} AZN)`}
                value={`${formatMoney(result.vacationCompensation)} AZN`}
              />
            )}
            <ResultRow label="Cəmi gross" value={`${formatMoney(result.totalGross)} AZN`} bold />
            <ResultRow label="DSMF (3%)" value={`-${formatMoney(result.dsmf)} AZN`} />
            <ResultRow label="İşsizlik sığortası (0.5%)" value={`-${formatMoney(result.unemployment)} AZN`} />
            <ResultRow label="İcbari tibbi sığorta (2%)" value={`-${formatMoney(result.medical)} AZN`} />
            <ResultRow label="Gəlir vergisi (14%)" value={`-${formatMoney(result.incomeTax)} AZN`} />
            <ResultRow label="Cəmi tutulma" value={`${formatMoney(result.totalDeductions)} AZN`} bold />
            <ResultRow label="Net ödəniş" value={`${formatMoney(result.netAmount)} AZN`} highlight />
          </ResultSection>

          <ResultSection title="⚖️ Əmək Məcəlləsi, Maddə 77">
            <ResultRow label="1 ilədək staj" value="1 aylıq əmək haqqı" highlight={years < 1} />
            <ResultRow label="1-5 il staj" value="1.4 aylıq əmək haqqı" highlight={years >= 1 && years < 5} />
            <ResultRow label="5-10 il staj" value="1.7 aylıq əmək haqqı" highlight={years >= 5 && years < 10} />
            <ResultRow label="10+ il staj" value="2 aylıq əmək haqqı" highlight={years >= 10} />
          </ResultSection>
        </View>
      ) : (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>📋</Text>
          <Paragraph>Nəticəni görmək üçün əmək haqqını və stajı daxil edin.</Paragraph>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "vacation-pay", "unemployment-benefit", "business-trip"]} />
    </View>
  );
}
