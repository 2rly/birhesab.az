import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { ResultHero, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";

type OvertimeType = "weekday" | "night" | "weekend";

const overtimeLabels: Record<OvertimeType, { label: string; icon: string; description: string }> = {
  weekday: { label: "İş günü (əlavə saat)", icon: "🕐", description: "İş vaxtından artıq işləmə — 2x əmək haqqı" },
  night: { label: "Gecə saatları (22:00–06:00)", icon: "🌙", description: "Gecə vaxtı işləmə — 1.2x əlavə" },
  weekend: { label: "İstirahət / bayram günü", icon: "📅", description: "İstirahət və bayram günləri — 2x əmək haqqı" },
};

const pt = {
  formulaTitle: "Əlavə iş saatı necə hesablanır?",
  formulaContent: `Əsas saatlıq tarif = Aylıq əmək haqqı ÷ (İş günü × Gündəlik saat)

Əmək Məcəlləsi, Maddə 165:
• İş günü əlavə saatlar: saatlıq tarif × 2
• Gecə saatları (22:00–06:00), Maddə 164: saatlıq tarif × 1.2 əlavə
• İstirahət / bayram günləri, Maddə 166: saatlıq tarif × 2

Məsələn: 2000 AZN maaş, 22 iş günü, 8 saat
Saatlıq tarif = 2000 ÷ 176 = 11.36 AZN
10 saat əlavə iş (iş günü) = 11.36 × 2 × 10 = 227.27 AZN`,
  monthlyGrossSalary: "Aylıq gross əmək haqqı (AZN)",
  overtimeHoursLabel: "Əlavə iş saatı (saat)",
  monthlyWorkDays: "Aylıq iş günü",
  dailyWorkHours: "Gündəlik iş saatı",
  overtimeType: "Əlavə iş növü",
  overtimePay: "Əlavə iş haqqı",
  totalSalary: "Ümumi əmək haqqı",
  basePlusOvertime: "AZN (əsas + əlavə)",
  calculationDetails: "Hesablama detalları",
  monthlyWorkHours: "Aylıq iş saatı",
  hours: "saat",
  hourlyRate: "Saatlıq tarif",
  multiplier: "Əmsalı",
  overtimeHourlyRate: "Əlavə saatlıq tarif",
  overtimeHoursDetail: "Əlavə iş saatı",
  overtimePayDetail: "Əlavə iş haqqı",
  emptyStateText: "Nəticəni görmək üçün əmək haqqı və əlavə iş saatını daxil edin.",
};

const formatMoney = (n: number) => fmtNum(n, 2);
const num = (s: string) => parseFloat(s.replace(",", "."));

export function OvertimeCalculator() {
  const { colors } = useTheme();
  const [monthlySalary, setMonthlySalary] = useState("");
  const [workingDays, setWorkingDays] = useState("22");
  const [dailyHours, setDailyHours] = useState("8");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [overtimeType, setOvertimeType] = useState<OvertimeType>("weekday");

  const result = useMemo(() => {
    const salary = num(monthlySalary);
    const days = parseInt(workingDays);
    const hours = parseInt(dailyHours);
    const overtime = num(overtimeHours);

    if (!salary || salary <= 0 || !days || days <= 0 || !hours || hours <= 0 || !overtime || overtime <= 0)
      return null;

    const totalMonthlyHours = days * hours;
    const hourlyRate = salary / totalMonthlyHours;

    let multiplier: number;
    switch (overtimeType) {
      case "weekday":
        multiplier = 2;
        break;
      case "night":
        multiplier = 1.2;
        break;
      case "weekend":
        multiplier = 2;
        break;
    }

    const overtimeRate = hourlyRate * multiplier;
    const overtimePayment = overtimeRate * overtime;
    const totalSalary = salary + overtimePayment;

    return { hourlyRate, multiplier, overtimeRate, overtimePayment, totalSalary, totalMonthlyHours };
  }, [monthlySalary, workingDays, dailyHours, overtimeHours, overtimeType]);

  return (
    <View>
      <InputField
        label={`💵 ${pt.monthlyGrossSalary}`}
        value={monthlySalary}
        onChangeText={setMonthlySalary}
        placeholder="2000"
        keyboardType="decimal-pad"
      />
      <InputField
        label={`⏰ ${pt.overtimeHoursLabel}`}
        value={overtimeHours}
        onChangeText={setOvertimeHours}
        placeholder="10"
        keyboardType="decimal-pad"
      />
      <InputField
        label={`📆 ${pt.monthlyWorkDays}`}
        value={workingDays}
        onChangeText={setWorkingDays}
        placeholder="22"
        keyboardType="number-pad"
        maxLength={2}
      />
      <InputField
        label={`🕐 ${pt.dailyWorkHours}`}
        value={dailyHours}
        onChangeText={setDailyHours}
        placeholder="8"
        keyboardType="number-pad"
        maxLength={2}
      />

      <Text style={[styles.label, { color: colors.n700 }]}>{pt.overtimeType}</Text>
      <View style={{ gap: 8, marginBottom: 8 }}>
        {(Object.keys(overtimeLabels) as OvertimeType[]).map((type) => {
          const active = overtimeType === type;
          const o = overtimeLabels[type];
          return (
            <Pressable
              key={type}
              onPress={() => setOvertimeType(type)}
              style={[
                styles.typeCard,
                {
                  borderColor: active ? colors.accent : colors.n280,
                  backgroundColor: active ? colors.accent + "1f" : colors.n200,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{o.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.typeLabel, { color: colors.n940 }]}>{o.label}</Text>
                <Text style={[styles.typeDesc, { color: colors.n580 }]}>{o.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {result ? (
        <View>
          <ResultHero label={pt.overtimePay} value={formatMoney(result.overtimePayment)} sub="AZN" />
          <View style={[styles.totalCard, { borderColor: "#22c55e66", backgroundColor: "#22c55e1a" }]}>
            <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>{pt.totalSalary}</Text>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#16a34a", marginTop: 4 }}>
              {formatMoney(result.totalSalary)}
            </Text>
            <Text style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>{pt.basePlusOvertime}</Text>
          </View>

          <ResultSection title={`📊 ${pt.calculationDetails}`}>
            <ResultRow label={pt.monthlyWorkHours} value={`${result.totalMonthlyHours} ${pt.hours}`} />
            <ResultRow label={pt.hourlyRate} value={`${formatMoney(result.hourlyRate)} AZN`} />
            <ResultRow label={pt.multiplier} value={`×${result.multiplier}`} />
            <ResultRow label={pt.overtimeHourlyRate} value={`${formatMoney(result.overtimeRate)} AZN`} />
            <ResultRow label={pt.overtimeHoursDetail} value={`${overtimeHours} ${pt.hours}`} />
            <ResultRow label={pt.overtimePayDetail} value={`${formatMoney(result.overtimePayment)} AZN`} highlight bold />
          </ResultSection>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>⏰</Text>
          <Text style={{ color: colors.n580, textAlign: "center" }}>{pt.emptyStateText}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["salary", "freelancer-tax", "loan"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  typeCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 12 },
  typeLabel: { fontSize: 14, fontWeight: "600" },
  typeDesc: { fontSize: 12, marginTop: 2 },
  totalCard: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center", marginTop: 10 },
  empty: { alignItems: "center", paddingVertical: 28 },
});
