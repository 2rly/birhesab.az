import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Currency = "AZN" | "USD";

const TAX_RATE = 0.1;
const MONTHLY_EXEMPTION = 200;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DepositTaxCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("30000");
  const [rate, setRate] = useState("10");
  const [months, setMonths] = useState("12");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [earlyWithdrawal, setEarlyWithdrawal] = useState(false);

  const m = parseInt(months) || 0;
  const is18MonthRule = currency === "AZN" && m >= 18 && !earlyWithdrawal;

  const result = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const r = parseFloat(rate) || 0;
    if (a <= 0 || r <= 0 || m <= 0) return null;

    const monthlyInterest = a * (r / 100 / 12);
    const totalInterest = monthlyInterest * m;

    let monthlyExempt: number;
    let monthlyTaxable: number;
    let monthlyTax: number;

    if (currency === "USD") {
      monthlyExempt = 0;
      monthlyTaxable = monthlyInterest;
      monthlyTax = monthlyInterest * TAX_RATE;
    } else if (is18MonthRule) {
      monthlyExempt = monthlyInterest;
      monthlyTaxable = 0;
      monthlyTax = 0;
    } else {
      monthlyExempt = Math.min(monthlyInterest, MONTHLY_EXEMPTION);
      monthlyTaxable = Math.max(0, monthlyInterest - MONTHLY_EXEMPTION);
      monthlyTax = monthlyTaxable * TAX_RATE;
    }

    const totalTax = monthlyTax * m;
    const totalNetInterest = totalInterest - totalTax;
    const effectiveTaxRate =
      totalInterest > 0 ? (totalTax / totalInterest) * 100 : 0;

    return {
      monthlyInterest,
      monthlyExempt,
      monthlyTaxable,
      monthlyTax,
      totalInterest,
      totalTax,
      totalNetInterest,
      effectiveTaxRate,
    };
  }, [amount, rate, months, currency, is18MonthRule, m]);

  return (
    <View>
      <SegmentControl
        label="Valyuta"
        options={[
          { value: "AZN", label: "Manat (AZN)" },
          { value: "USD", label: "Xarici valyuta" },
        ]}
        selected={currency}
        onSelect={setCurrency}
      />

      <InputField
        label={`Depozit məbləği (${currency})`}
        value={amount}
        onChangeText={setAmount}
        placeholder="30000"
        keyboardType="decimal-pad"
        suffix={currency}
      />
      <InputField
        label="İllik faiz dərəcəsi"
        value={rate}
        onChangeText={setRate}
        placeholder="10"
        keyboardType="decimal-pad"
        suffix="%"
      />
      <InputField
        label="Müddət"
        value={months}
        onChangeText={setMonths}
        placeholder="12"
        keyboardType="numeric"
        suffix="ay"
      />

      {currency === "AZN" && m >= 18 && (
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.n700 }]}>
            18 aydan əvvəl çıxaracağam
          </Text>
          <Switch
            value={earlyWithdrawal}
            onValueChange={setEarlyWithdrawal}
            trackColor={{ true: colors.accent, false: colors.n240 }}
          />
        </View>
      )}

      {currency === "AZN" && (
        <View
          style={[
            styles.ruleNote,
            {
              backgroundColor: is18MonthRule
                ? colors.n240
                : colors.n240,
            },
          ]}
        >
          <Text style={[styles.ruleText, { color: colors.n700 }]}>
            {is18MonthRule
              ? "V.M. 102.1.22-4: 100% vergidən azad (≥18 ay müddət)"
              : "V.M. 102.1.22-3: Aylıq 200₼ güzəşt"}
          </Text>
        </View>
      )}

      {currency === "USD" && (
        <View style={[styles.ruleNote, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.ruleText, { color: colors.n700 }]}>
            Xarici valyuta — güzəşt yoxdur, bütün faiz gəlirindən 10% vergi
            tutulur
          </Text>
        </View>
      )}

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow
              label="Ümumi faiz gəliri"
              value={fmt(result.totalInterest)}
            />
            <ResultRow
              label="Tutulan vergi"
              value={
                result.totalTax > 0
                  ? fmt(result.totalTax)
                  : "0.00 ₼ (100% azad)"
              }
            />
            <ResultRow
              label="Xalis gəlir"
              value={fmt(result.totalNetInterest)}
              highlight
              bold
            />
            <ResultRow
              label="Effektiv vergi dərəcəsi"
              value={`${result.effectiveTaxRate.toFixed(1)}%`}
            />
          </ResultSection>

          <ResultSection title="Aylıq hesablama">
            <ResultRow
              label="Aylıq faiz gəliri"
              value={fmt(result.monthlyInterest)}
            />
            {currency === "AZN" && !is18MonthRule && (
              <ResultRow
                label="Güzəşt (200₼)"
                value={fmt(result.monthlyExempt)}
              />
            )}
            <ResultRow
              label="Vergiyə cəlb olunan"
              value={fmt(result.monthlyTaxable)}
            />
            <ResultRow
              label="Aylıq vergi (10%)"
              value={fmt(result.monthlyTax)}
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  switchLabel: { fontSize: 13, fontWeight: "600", flex: 1, marginRight: 8 },
  ruleNote: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  ruleText: { fontSize: 12, lineHeight: 18 },
});
