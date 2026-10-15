import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { DataTable, FormulaSection, RelatedCalculators, Card } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { useTheme } from "@/constants/theme";
import { QuickChips, StackedBar, EmptyState, TONES } from "./_loan-parts";

// Azərbaycan Respublikası Dövlət Statistika Komitəsi — rəsmi illik inflyasiya (%)
// Mənbə: stat.gov.az
const INFLATION_DATA: { year: number; rate: number }[] = [
  { year: 2021, rate: 6.7 },
  { year: 2022, rate: 13.9 },
  { year: 2023, rate: 8.8 },
  { year: 2024, rate: 4.9 },
  { year: 2025, rate: 5.2 },
];

const formatMoney = (n: number) => fmtNum(n, 2);
const ORANGE = TONES.orange;

const pt = {
  formulaTitle: "İnflyasiya korrektoru necə işləyir?",
  formulaContent: `Hesablama Azərbaycan Respublikası Dövlət Statistika Komitəsinin (stat.gov.az) rəsmi illik inflyasiya göstəriciləri əsasında aparılır.

Real dəyər = Nominal məbləğ / (1 + i₁) / (1 + i₂) / ... / (1 + iₙ)

Burada i₁, i₂, ... iₙ — hər ilin inflyasiya dərəcəsidir (onluq kəsr şəklində).

Məsələn, 2021-ci ildəki 1000 ₼ 2026-cı ildə:
1000 / 1.067 / 1.139 / 1.088 / 1.049 / 1.052 ≈ 681.46 ₼ alıcılıq qüvvəsinə bərabərdir.

Rəsmi illik inflyasiya (İQE):
• 2021: 6.7%
• 2022: 13.9%
• 2023: 8.8%
• 2024: 4.9%
• 2025: 5.2%`,
  annualInflationRate: "İllik inflyasiya dərəcəsi (Dövlət Statistika Komitəsi)",
  startYear: "Başlanğıc il",
  amountInYear: "-ci ildəki məbləğ (₼)",
  example: "Məs: 2000",
  amountOf: "-ci ildəki",
  realPurchasingPower: "-cı ildəki real alıcılıq qüvvəsi:",
  lostPurchasingPower: "İtirilən alıcılıq qüvvəsi:",
  cumulativeInflation: "Kumulativ inflyasiya:",
  realValueOfMoney: "Pulunuzun real dəyəri",
  nominalValue: "Nominal dəyər",
  realValue: "Real dəyər",
  annualInflationImpact: "İllik inflyasiya təsiri",
  yearCol: "İl",
  inflationCol: "İnflyasiya",
  yearStartCol: "İl başı",
  lossCol: "İtki",
  yearEndCol: "İl sonu",
  emptyState: "Nəticəni görmək üçün məbləği daxil edin.",
};

export function InflationCalculator() {
  const { colors } = useTheme();
  const startYears = INFLATION_DATA.map((d) => d.year);
  const currentYear = INFLATION_DATA[INFLATION_DATA.length - 1].year + 1; // 2026

  const [amount, setAmount] = useState("");
  const [startYear, setStartYear] = useState(startYears[0]);

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return null;

    const relevantYears = INFLATION_DATA.filter((d) => d.year >= startYear);
    let cumulativeMultiplier = 1;
    const yearBreakdown: { year: number; rate: number; valueStart: number; valueEnd: number; lost: number }[] = [];

    let currentValue = val;
    for (const d of relevantYears) {
      const factor = 1 + d.rate / 100;
      cumulativeMultiplier *= factor;
      const valueEnd = currentValue / factor;
      const lost = currentValue - valueEnd;
      yearBreakdown.push({ year: d.year, rate: d.rate, valueStart: currentValue, valueEnd, lost });
      currentValue = valueEnd;
    }

    const adjustedValue = val / cumulativeMultiplier;
    const totalLost = val - adjustedValue;
    const totalInflationPercent = (cumulativeMultiplier - 1) * 100;

    return { originalAmount: val, adjustedValue, totalLost, totalInflationPercent, cumulativeMultiplier, yearBreakdown };
  }, [amount, startYear]);

  const maxRate = Math.max(...INFLATION_DATA.map((d) => d.rate));

  return (
    <View>
      {/* İnflyasiya tarixi barları */}
      <Text style={[styles.h3, { color: colors.n940 }]}>{pt.annualInflationRate}</Text>
      <View style={styles.chart}>
        {INFLATION_DATA.map((d) => (
          <View key={d.year} style={styles.barCol}>
            <Text style={[styles.barValue, { color: colors.n940 }]}>{d.rate}%</Text>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${(d.rate / maxRate) * 100}%`, backgroundColor: colors.accent }]} />
            </View>
            <Text style={[styles.barYear, { color: colors.n580 }]}>{d.year}</Text>
          </View>
        ))}
      </View>

      <Select
        label={pt.startYear}
        value={String(startYear)}
        options={startYears.map((y) => ({ value: String(y), label: String(y) }))}
        onSelect={(v) => setStartYear(parseInt(v))}
        searchable={false}
      />
      <InputField
        label={`${startYear}${pt.amountInYear}`}
        value={amount}
        onChangeText={setAmount}
        placeholder={pt.example}
        keyboardType="decimal-pad"
      />
      <QuickChips
        options={[500, 1000, 2000, 3000, 5000].map((v) => ({ value: String(v), label: `${v}₼` }))}
        onSelect={setAmount}
      />

      {result ? (
        <View>
          {/* Əsas kart — itki */}
          <View style={[styles.mainCard, { borderColor: ORANGE, backgroundColor: colors.n200 }]}>
            <Text style={[styles.muted, { color: colors.n580 }]}>
              {startYear}
              {pt.amountOf} {formatMoney(result.originalAmount)} ₼
            </Text>
            <Text style={[styles.muted, { color: colors.n580 }]}>
              {currentYear}
              {pt.realPurchasingPower}
            </Text>
            <Text style={[styles.big, { color: colors.n940 }]}>{formatMoney(result.adjustedValue)} ₼</Text>
            <View style={[styles.divider, { backgroundColor: colors.n280 }]} />
            <Text style={[styles.muted, { color: colors.n580 }]}>{pt.lostPurchasingPower}</Text>
            <Text style={[styles.big, { color: ORANGE }]}>−{formatMoney(result.totalLost)} ₼</Text>
            <Text style={[styles.small, { color: colors.n580 }]}>
              {pt.cumulativeInflation} {result.totalInflationPercent.toFixed(1)}%
            </Text>
          </View>

          {/* Orijinal vs real */}
          <Card title={pt.realValueOfMoney}>
            <View style={styles.barRow}>
              <Text style={[styles.small, { color: colors.n580 }]}>
                {startYear} — {pt.nominalValue}
              </Text>
              <Text style={[styles.small, { color: colors.n580 }]}>{formatMoney(result.originalAmount)} ₼</Text>
            </View>
            <StackedBar height={28} segments={[{ value: 1, color: colors.accent, label: "100%" }]} />
            <View style={[styles.barRow, { marginTop: 12 }]}>
              <Text style={[styles.small, { color: colors.n580 }]}>
                {currentYear} — {pt.realValue}
              </Text>
              <Text style={[styles.small, { color: colors.n580 }]}>{formatMoney(result.adjustedValue)} ₼</Text>
            </View>
            <StackedBar
              height={28}
              segments={[
                {
                  value: result.adjustedValue,
                  color: TONES.emerald,
                  label: `${((result.adjustedValue / result.originalAmount) * 100).toFixed(1)}%`,
                },
                {
                  value: result.totalLost,
                  color: ORANGE,
                  label: `−${((result.totalLost / result.originalAmount) * 100).toFixed(1)}%`,
                },
              ]}
            />
          </Card>

          {/* İllik bölgü */}
          <DataTable
            title={pt.annualInflationImpact}
            headers={[pt.yearCol, pt.inflationCol, pt.yearStartCol, pt.lossCol, pt.yearEndCol]}
            columnWidths={[60, 90, 120, 110, 120]}
            rows={result.yearBreakdown.map((row) => [
              row.year,
              `${row.rate}%`,
              `${formatMoney(row.valueStart)} ₼`,
              `−${formatMoney(row.lost)} ₼`,
              `${formatMoney(row.valueEnd)} ₼`,
            ])}
          />
        </View>
      ) : (
        <EmptyState text={pt.emptyState} />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["salary", "deposit", "currency"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  h3: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 10, height: 150, marginBottom: 20 },
  barCol: { flex: 1, alignItems: "center", height: "100%" },
  barValue: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  barYear: { fontSize: 11, marginTop: 4 },
  mainCard: { borderWidth: 2, borderRadius: 16, padding: 18, marginTop: 8, marginBottom: 12 },
  muted: { fontSize: 13, marginBottom: 2 },
  big: { fontSize: 28, fontWeight: "800", marginTop: 6 },
  small: { fontSize: 12, marginTop: 4 },
  divider: { height: 1, marginVertical: 14 },
  barRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
});
