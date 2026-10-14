import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Switch } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type BusinessType = "ie" | "micro";
type ActivityType = "services" | "trade";

const IE_TRADE_RATE = 0.02;
const IE_SERVICES_RATE = 0.04;
const MICRO_THRESHOLD = 100000;
const MICRO_OVER_RATE = 0.02;
const DSMF_RATE = 0.25;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function FreelancerTaxCalculator() {
  const { colors } = useTheme();
  const [monthlyIncome, setMonthlyIncome] = useState("3000");
  const [businessType, setBusinessType] = useState<BusinessType>("ie");
  const [activityType, setActivityType] = useState<ActivityType>("services");
  const [includeDsmf, setIncludeDsmf] = useState(true);
  const [dsmfBase, setDsmfBase] = useState("500");

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome) || 0;
    if (income <= 0) return null;

    const annualIncome = income * 12;
    let monthlyTax = 0;
    let taxLabel = "";

    if (businessType === "ie") {
      const rate = activityType === "trade" ? IE_TRADE_RATE : IE_SERVICES_RATE;
      monthlyTax = income * rate;
      taxLabel =
        activityType === "trade"
          ? "Sadələşdirilmiş vergi (2%)"
          : "Sadələşdirilmiş vergi (4%)";
    } else {
      if (annualIncome < MICRO_THRESHOLD) {
        monthlyTax = 0;
        taxLabel = "Mikro biznes — vergidən azad";
      } else {
        monthlyTax = income * MICRO_OVER_RATE;
        taxLabel = "Mikro biznes (hədd aşılıb, 2%)";
      }
    }

    const dsmfDeclared = parseFloat(dsmfBase) || 0;
    const monthlyDsmf =
      includeDsmf && dsmfDeclared > 0 ? dsmfDeclared * DSMF_RATE : 0;

    const totalPayment = monthlyTax + monthlyDsmf;
    const netIncome = income - totalPayment;
    const effectiveRate = income > 0 ? (totalPayment / income) * 100 : 0;

    return {
      income,
      annualIncome,
      monthlyTax,
      taxLabel,
      monthlyDsmf,
      totalPayment,
      netIncome,
      effectiveRate,
    };
  }, [monthlyIncome, businessType, activityType, includeDsmf, dsmfBase]);

  return (
    <View>
      <SegmentControl
        label="Biznes statusu"
        options={[
          { value: "ie", label: "Fərdi sahibkar" },
          { value: "micro", label: "Mikro biznes" },
        ]}
        selected={businessType}
        onSelect={setBusinessType}
      />

      {businessType === "ie" && (
        <SegmentControl
          label="Fəaliyyət növü"
          options={[
            { value: "services", label: "Xidmət (4%)" },
            { value: "trade", label: "Ticarət (2%)" },
          ]}
          selected={activityType}
          onSelect={setActivityType}
        />
      )}

      <InputField
        label="Aylıq gəlir"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        placeholder="3000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      <View style={styles.dsmfRow}>
        <Text style={[styles.dsmfLabel, { color: colors.n700 }]}>
          DSMF (könüllü ödəniş)
        </Text>
        <Switch
          value={includeDsmf}
          onValueChange={setIncludeDsmf}
          trackColor={{ true: colors.accent, false: colors.n240 }}
        />
      </View>

      {includeDsmf && (
        <InputField
          label="DSMF bazası (bəyan edilən məbləğ)"
          value={dsmfBase}
          onChangeText={setDsmfBase}
          placeholder="500"
          keyboardType="decimal-pad"
          suffix="₼"
        />
      )}

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow label="Aylıq gəlir" value={fmt(result.income)} />
            <ResultRow label={result.taxLabel} value={fmt(result.monthlyTax)} />
            {result.monthlyDsmf > 0 && (
              <ResultRow
                label="DSMF (25%)"
                value={fmt(result.monthlyDsmf)}
              />
            )}
            <ResultRow
              label="Cəmi ödəniş"
              value={`${fmt(result.totalPayment)} (${result.effectiveRate.toFixed(1)}%)`}
            />
            <ResultRow
              label="Xalis gəlir"
              value={fmt(result.netIncome)}
              highlight
              bold
            />
          </ResultSection>

          <ResultSection title="İllik hesablama">
            <ResultRow
              label="İllik gəlir"
              value={fmt(result.income * 12)}
            />
            <ResultRow
              label="İllik vergi"
              value={fmt(result.monthlyTax * 12)}
            />
            {result.monthlyDsmf > 0 && (
              <ResultRow
                label="İllik DSMF"
                value={fmt(result.monthlyDsmf * 12)}
              />
            )}
            <ResultRow
              label="İllik xalis gəlir"
              value={fmt(result.netIncome * 12)}
              highlight
              bold
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dsmfRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dsmfLabel: { fontSize: 13, fontWeight: "600" },
});
