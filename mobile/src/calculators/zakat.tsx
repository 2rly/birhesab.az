import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { BulletList, FormulaSection, InfoBox, RelatedCalculators, ResultHero } from "@/components/Content";

// Fitrə zəkatı — Qafqaz Müsəlmanları İdarəsi tərəfindən hər il elan olunur
// 2024-cü il üçün təxmini məbləğlər
const FITRE_RATES = [
  { id: "minimum", label: "Minimum (buğda)", amount: 5, description: "Buğda və ya un əsasında" },
  { id: "standard", label: "Standart (arpa)", amount: 7, description: "Arpa əsasında — ən çox istifadə olunan" },
  { id: "medium", label: "Orta (kişmiş)", amount: 12, description: "Kişmiş əsasında" },
  { id: "high", label: "Yüksək (xurma)", amount: 20, description: "Xurma əsasında" },
];

const FORMULA_TITLE = "Fitrə zəkatı nədir?";
const FORMULA_CONTENT = `Fitrə zəkatı (sədəqətül-fitr) Ramazan ayının sonunda hər bir müsəlmanın
öz ailə üzvləri adından verdiyi vacib sədəqədir.

Kimin üçün verilir:
• Ailə başçısı özü və himayəsindəki hər kəs üçün verir
• Uşaqlar, yaşlılar, himayədəki şəxslər daxildir
• Bayram namazından əvvəl verilməlidir

Fitrə məbləği:
• Buğda əsasında (minimum): ~5 AZN/nəfər
• Arpa əsasında (standart): ~7 AZN/nəfər
• Kişmiş əsasında: ~12 AZN/nəfər
• Xurma əsasında: ~20 AZN/nəfər

Hesablama: Fitrə = Ailə üzvü sayı × Nəfər başına məbləğ

Qeyd: Dəqiq məbləğ hər il Qafqaz Müsəlmanları İdarəsi tərəfindən elan olunur.`;

const ABOUT_ITEMS = [
  "Ramazan bayramı namazından əvvəl verilməlidir",
  "Hər ailə üzvü üçün (uşaqlar daxil) ayrıca verilir",
  "Ailə başçısı himayəsindəki hər kəs üçün verir",
  "Yoxsullara, ehtiyacı olanlara verilir",
  "Dəqiq məbləğ hər il QMİ tərəfindən elan olunur",
];

const GREEN = "#22c55e";

function fmt2(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function Stepper({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { colors } = useTheme();
  const btn = [styles.stepBtn, { backgroundColor: colors.n240, borderColor: colors.n280 }];
  return (
    <View style={[styles.stepCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
      <Text style={[styles.stepLabel, { color: colors.n940 }]}>{label}</Text>
      <View style={styles.stepRow}>
        <Pressable style={btn} onPress={() => onChange(String(Math.max(0, (parseInt(value) || 0) - 1)))}>
          <Text style={[styles.stepBtnText, { color: colors.n940 }]}>−</Text>
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          maxLength={2}
          style={[styles.stepInput, { color: colors.n940, backgroundColor: colors.n240, borderColor: colors.n280 }]}
        />
        <Pressable style={btn} onPress={() => onChange(String((parseInt(value) || 0) + 1))}>
          <Text style={[styles.stepBtnText, { color: colors.n940 }]}>+</Text>
        </Pressable>
        <Text style={[styles.stepUnit, { color: colors.n580 }]}>nəfər</Text>
      </View>
    </View>
  );
}

export function ZakatCalculator() {
  const { colors } = useTheme();
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("2");
  const [selectedRate, setSelectedRate] = useState("standard");
  const [customAmount, setCustomAmount] = useState("");

  const result = useMemo(() => {
    const adultCount = parseInt(adults) || 0;
    const childCount = parseInt(children) || 0;
    const totalPersons = adultCount + childCount;
    if (totalPersons <= 0) return null;

    const rate = FITRE_RATES.find((r) => r.id === selectedRate);
    const perPerson = customAmount ? parseFloat(customAmount.replace(",", ".")) || 0 : rate?.amount || 7;
    const totalFitre = totalPersons * perPerson;

    return { adultCount, childCount, totalPersons, perPerson, totalFitre };
  }, [adults, children, selectedRate, customAmount]);

  return (
    <View>
      {/* Ailə üzvləri */}
      <Text style={[styles.groupLabel, { color: colors.n940 }]}>Ailə üzvləri</Text>
      <Stepper label="👨‍👩 Böyüklər (18+ yaş)" value={adults} onChange={setAdults} />
      <Stepper label="👶 Uşaqlar (18 yaşadək)" value={children} onChange={setChildren} />

      {/* Dərəcə seçimi */}
      <Text style={[styles.groupLabel, { color: colors.n940, marginTop: 8 }]}>Fitrə miqdarı (nəfər başına)</Text>
      <View style={styles.rateGrid}>
        {FITRE_RATES.map((rate) => {
          const active = selectedRate === rate.id && !customAmount;
          return (
            <Pressable
              key={rate.id}
              onPress={() => {
                setSelectedRate(rate.id);
                setCustomAmount("");
              }}
              style={[
                styles.rateCard,
                {
                  backgroundColor: active ? GREEN + "1f" : colors.n200,
                  borderColor: active ? GREEN : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.rateAmount, { color: colors.n940 }]}>{rate.amount}</Text>
              <Text style={[styles.rateSmall, { color: colors.n580 }]}>AZN</Text>
              <Text style={[styles.rateLabel, { color: colors.n940 }]}>{rate.label}</Text>
              <Text style={[styles.rateSmall, { color: colors.n580, textAlign: "center" }]}>{rate.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Xüsusi məbləğ */}
      <InputField
        label="Və ya öz məbləğinizi daxil edin (AZN/nəfər)"
        value={customAmount}
        onChangeText={setCustomAmount}
        placeholder="Xüsusi məbləğ"
        keyboardType="decimal-pad"
      />

      {result ? (
        <View>
          <ResultHero label="Ümumi fitrə zəkatı" value={fmt2(result.totalFitre)} sub="AZN" />

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={[styles.summaryLabel, { color: colors.n580 }]}>Ailə üzvü sayı</Text>
              <Text style={[styles.summaryValue, { color: colors.n940 }]}>{result.totalPersons}</Text>
              <Text style={[styles.summaryLabel, { color: colors.n580 }]}>
                {result.adultCount} böyük + {result.childCount} uşaq
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={[styles.summaryLabel, { color: colors.n580 }]}>Nəfər başına</Text>
              <Text style={[styles.summaryValue, { color: colors.n940 }]}>{fmt2(result.perPerson)}</Text>
              <Text style={[styles.summaryLabel, { color: colors.n580 }]}>AZN</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: GREEN + "1a", borderColor: GREEN + "66" }]}>
              <Text style={[styles.summaryLabel, { color: GREEN }]}>Ümumi</Text>
              <Text style={[styles.summaryValue, { color: GREEN }]}>{fmt2(result.totalFitre)}</Text>
              <Text style={[styles.summaryLabel, { color: GREEN }]}>AZN</Text>
            </View>
          </View>

          <ResultSection title="📋 Ətraflı hesablama">
            {result.adultCount > 0 && (
              <ResultRow
                label={`Böyüklər (${result.adultCount} × ${fmt2(result.perPerson)} AZN)`}
                value={`${fmt2(result.adultCount * result.perPerson)} AZN`}
              />
            )}
            {result.childCount > 0 && (
              <ResultRow
                label={`Uşaqlar (${result.childCount} × ${fmt2(result.perPerson)} AZN)`}
                value={`${fmt2(result.childCount * result.perPerson)} AZN`}
              />
            )}
            <ResultRow label="Ümumi fitrə zəkatı" value={`${fmt2(result.totalFitre)} AZN`} highlight bold />
          </ResultSection>

          <ResultSection title={`📊 Müxtəlif dərəcələr üzrə müqayisə (${result.totalPersons} nəfər)`}>
            {FITRE_RATES.map((rate, i) => {
              const total = result.totalPersons * rate.amount;
              const isActive = selectedRate === rate.id && !customAmount;
              return (
                <View
                  key={rate.id}
                  style={[
                    styles.compRow,
                    { borderBottomColor: colors.n240, borderBottomWidth: i < FITRE_RATES.length - 1 ? 1 : 0 },
                    isActive && { backgroundColor: GREEN + "1a" },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.compLabel, { color: colors.n940 }, isActive && { fontWeight: "700" }]}>
                      {rate.label}
                    </Text>
                    <Text style={[styles.rateSmall, { color: colors.n580 }]}>{rate.amount} AZN/nəfər</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={[styles.compValue, { color: colors.n940 }]}>{fmt2(total)} AZN</Text>
                    {isActive && (
                      <View style={[styles.badge, { backgroundColor: GREEN }]}>
                        <Text style={styles.badgeText}>Seçilmiş</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ResultSection>

          <InfoBox variant="warning" title="🤲 Fitrə zəkatı haqqında">
            <BulletList items={ABOUT_ITEMS} />
          </InfoBox>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🤲</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>Nəticəni görmək üçün ailə üzvü sayını daxil edin.</Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["ramadan", "age", "percentage", "currency"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  stepCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  stepLabel: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: { width: 42, height: 42, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  stepBtnText: { fontSize: 20, fontWeight: "700" },
  stepInput: {
    width: 64,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  stepUnit: { fontSize: 13 },
  rateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  rateCard: { flexBasis: "47%", flexGrow: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  rateAmount: { fontSize: 24, fontWeight: "800" },
  rateSmall: { fontSize: 11 },
  rateLabel: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  summaryGrid: { gap: 10, marginTop: 14 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center" },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 22, fontWeight: "800", marginVertical: 2 },
  compRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  compLabel: { fontSize: 14 },
  compValue: { fontSize: 14, fontWeight: "700" },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
