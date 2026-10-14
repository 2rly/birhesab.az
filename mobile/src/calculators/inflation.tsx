import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const INFLATION_DATA = [
  { year: 2021, rate: 6.7 },
  { year: 2022, rate: 13.9 },
  { year: 2023, rate: 8.8 },
  { year: 2024, rate: 4.9 },
  { year: 2025, rate: 5.2 },
];

const START_YEARS = INFLATION_DATA.map((d) => d.year);
const CURRENT_YEAR = 2026;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function InflationCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("1000");
  const [startYear, setStartYear] = useState(2021);

  const result = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) return null;

    const applicableYears = INFLATION_DATA.filter(
      (d) => d.year >= startYear
    );
    if (applicableYears.length === 0) return null;

    let realValue = val;
    const yearlyBreakdown: {
      year: number;
      rate: number;
      startValue: number;
      loss: number;
      endValue: number;
    }[] = [];

    for (const d of applicableYears) {
      const startValue = realValue;
      realValue = realValue / (1 + d.rate / 100);
      const loss = startValue - realValue;
      yearlyBreakdown.push({
        year: d.year,
        rate: d.rate,
        startValue,
        loss,
        endValue: realValue,
      });
    }

    const totalLoss = val - realValue;
    const cumulativeInflation = ((val - realValue) / realValue) * 100;

    return {
      realValue,
      totalLoss,
      cumulativeInflation,
      yearlyBreakdown,
    };
  }, [amount, startYear]);

  return (
    <View>
      <View style={styles.yearPicker}>
        {START_YEARS.map((y) => (
          <Pressable
            key={y}
            style={[
              styles.yearChip,
              { backgroundColor: colors.n240 },
              startYear === y && { backgroundColor: colors.accent },
            ]}
            onPress={() => setStartYear(y)}
          >
            <Text
              style={[
                styles.yearText,
                { color: colors.n580 },
                startYear === y && { color: colors.onAccent },
              ]}
            >
              {y}
            </Text>
          </Pressable>
        ))}
      </View>

      <InputField
        label={`${startYear}-ci ildəki məbləğ`}
        value={amount}
        onChangeText={setAmount}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow
              label={`${startYear}-ci ildəki dəyər`}
              value={fmt(parseFloat(amount) || 0)}
            />
            <ResultRow
              label={`${CURRENT_YEAR}-cı ildə real dəyər`}
              value={fmt(result.realValue)}
              highlight
              bold
            />
            <ResultRow
              label="İtirilən alıcılıq qüvvəsi"
              value={fmt(result.totalLoss)}
            />
            <ResultRow
              label="Kumulativ inflyasiya"
              value={`${result.cumulativeInflation.toFixed(1)}%`}
            />
          </ResultSection>

          <ResultSection title="İllik inflyasiya təsiri">
            {result.yearlyBreakdown.map((row) => (
              <ResultRow
                key={row.year}
                label={`${row.year} (${row.rate}%)`}
                value={`${fmt(row.startValue)} → ${fmt(row.endValue)}`}
              />
            ))}
          </ResultSection>
        </>
      )}

      <View style={[styles.infoBox, { backgroundColor: colors.n240 }]}>
        <Text style={[styles.infoText, { color: colors.n580 }]}>
          Mənbə: Dövlət Statistika Komitəsi (stat.gov.az) rəsmi illik
          inflyasiya göstəriciləri
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  yearPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  yearText: { fontSize: 14, fontWeight: "600" },
  infoBox: {
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  infoText: { fontSize: 11, lineHeight: 16 },
});
