import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { TileGrid, EmptyState } from "./_health-parts";

interface HabitPreset {
  id: string;
  emoji: string;
  name: string;
  unit: string;
  defaultPrice: number; // AZN
  defaultDaily: number;
}

const HABITS: HabitPreset[] = [
  { id: "siqaret", emoji: "🚬", name: "Siqaret (qutu)", unit: "qutu/gün", defaultPrice: 5.5, defaultDaily: 1 },
  { id: "kofe", emoji: "☕", name: "Kofe (kafedə)", unit: "fincan/gün", defaultPrice: 5, defaultDaily: 2 },
  { id: "enerji", emoji: "⚡", name: "Enerji içkisi", unit: "ədəd/gün", defaultPrice: 3.5, defaultDaily: 1 },
  { id: "fastfood", emoji: "🍔", name: "Fast-food", unit: "dəfə/gün", defaultPrice: 12, defaultDaily: 1 },
  { id: "alkol", emoji: "🍺", name: "Pivə", unit: "şüşə/gün", defaultPrice: 3, defaultDaily: 2 },
  { id: "qumar", emoji: "🎰", name: "Qumar/lotereya", unit: "AZN/gün", defaultPrice: 1, defaultDaily: 10 },
  { id: "custom", emoji: "✏️", name: "Digər (xüsusi)", unit: "ədəd/gün", defaultPrice: 5, defaultDaily: 1 },
];

const ALTERNATIVES = [
  { emoji: "📱", name: "iPhone 16 Pro", price: 3500 },
  { emoji: "💻", name: "MacBook Air M3", price: 2500 },
  { emoji: "✈️", name: "Türkiyəyə bilet", price: 400 },
  { emoji: "🌍", name: "Avropaya səyahət", price: 2500 },
  { emoji: "🚗", name: "İşlənmiş avtomobil", price: 15000 },
  { emoji: "🏠", name: "İlkin köçürmə (kvartira)", price: 20000 },
  { emoji: "🎓", name: "TOEFL/IELTS hazırlığı", price: 800 },
  { emoji: "🏋️", name: "İllik fitness üzvlüyü", price: 600 },
  { emoji: "📚", name: "100 kitab", price: 1500 },
  { emoji: "🎮", name: "PlayStation 5", price: 1200 },
];

const FORMULA_TITLE = "Necə hesablanır?";
const FORMULA_CONTENT = `Hesablama formulu:
• Gündəlik xərc = Vahid qiyməti × Gündəlik miqdar
• Aylıq = Gündəlik × 30
• İllik = Gündəlik × 365
• 5 illik = İllik × 5
• 10 illik = İllik × 10

Nümunə: gündə 1 qutu siqaret (5.50 AZN) çəkənin illik itkisi: 5.50 × 365 = 2007.50 AZN. Bu pulla 1 ədəd MacBook Air ala bilərsiniz.

Qeyd: real rəqəmlər inflyasiya, faiz və qiymət artışı ilə daha yüksək olur.`;

/** Saytdakı toLocaleString("az-AZ", 2 onluq) ilə eyni: 2.007,50 */
function fmt(n: number): string {
  const [int, frac] = Math.abs(n).toFixed(2).split(".");
  return (n < 0 ? "-" : "") + int.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + frac;
}

const EMERALD = "#059669";

export function HarmfulHabitsCalculator() {
  const { colors } = useTheme();
  const [habitId, setHabitId] = useState("siqaret");
  const habit = HABITS.find((h) => h.id === habitId)!;
  const [price, setPrice] = useState(String(habit.defaultPrice));
  const [daily, setDaily] = useState(String(habit.defaultDaily));

  const handleHabitChange = (id: string) => {
    setHabitId(id);
    const h = HABITS.find((x) => x.id === id)!;
    setPrice(String(h.defaultPrice));
    setDaily(String(h.defaultDaily));
  };

  const result = useMemo(() => {
    const p = parseFloat(price.replace(",", "."));
    const d = parseFloat(daily.replace(",", "."));
    if (Number.isNaN(p) || Number.isNaN(d) || p <= 0 || d <= 0) return null;
    const dayCost = p * d;
    return {
      day: dayCost,
      week: dayCost * 7,
      month: dayCost * 30,
      year: dayCost * 365,
      fiveYear: dayCost * 365 * 5,
      tenYear: dayCost * 365 * 10,
    };
  }, [price, daily]);

  const matched = useMemo(() => {
    if (!result) return [];
    return ALTERNATIVES.map((alt) => ({ ...alt, yearCount: result.year / alt.price, fiveYearCount: result.fiveYear / alt.price }))
      .filter((a) => a.yearCount >= 0.3 || a.fiveYearCount >= 0.5)
      .sort((a, b) => b.yearCount - a.yearCount)
      .slice(0, 8);
  }, [result]);

  return (
    <View>
      <TileGrid
        label="Vərdiş seçin"
        columns={3}
        options={HABITS.map((h) => ({ value: h.id, icon: h.emoji, label: h.name }))}
        selected={habitId}
        onSelect={handleHabitChange}
      />

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <InputField label={`Gündəlik miqdar (${habit.unit})`} value={daily} onChangeText={setDaily} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <InputField label="Vahid qiyməti (AZN)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        </View>
      </View>

      {result ? (
        <View style={{ gap: 16 }}>
          <View style={styles.grid}>
            {[
              { l: "Gündəlik", v: result.day, c: "#2563eb" },
              { l: "Həftəlik", v: result.week, c: "#2563eb" },
              { l: "Aylıq", v: result.month, c: "#d97706" },
              { l: "İllik", v: result.year, c: "#ea580c" },
              { l: "5 il", v: result.fiveYear, c: "#dc2626" },
              { l: "10 il", v: result.tenYear, c: "#991b1b" },
            ].map((x) => (
              <View key={x.l} style={[styles.cell, { backgroundColor: x.c + "1a", borderColor: x.c + "55" }]}>
                <Text style={[styles.cellLabel, { color: x.c }]}>{x.l}</Text>
                <Text style={[styles.cellValue, { color: colors.n940 }]}>{fmt(x.v)} ₼</Text>
              </View>
            ))}
          </View>

          <View style={[styles.altBox, { backgroundColor: EMERALD + "14", borderColor: EMERALD + "55" }]}>
            <Text style={[styles.altTitle, { color: EMERALD }]}>💡 Bu pulla nə almaq olar?</Text>
            <Text style={[styles.altDesc, { color: EMERALD }]}>İllik itirilən məbləğlə müqayisə</Text>
            <View style={{ gap: 8 }}>
              {matched.map((a) => (
                <View key={a.name} style={[styles.altRow, { backgroundColor: colors.n200, borderColor: EMERALD + "33" }]}>
                  <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.altName, { color: colors.n940 }]}>{a.name}</Text>
                    <Text style={[styles.tiny, { color: colors.n580 }]}>{fmt(a.price)} ₼</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {a.yearCount >= 1 ? (
                      <>
                        <Text style={[styles.altCount, { color: EMERALD }]}>{a.yearCount.toFixed(1)}× / il</Text>
                        <Text style={[styles.tiny, { color: colors.n580 }]}>ala bilərsiniz</Text>
                      </>
                    ) : a.fiveYearCount >= 1 ? (
                      <>
                        <Text style={[styles.altCount, { color: EMERALD }]}>{a.fiveYearCount.toFixed(1)}× / 5 il</Text>
                        <Text style={[styles.tiny, { color: colors.n580 }]}>ala bilərsiniz</Text>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.altCount, { color: "#b45309" }]}>{(a.yearCount * 100).toFixed(0)}%</Text>
                        <Text style={[styles.tiny, { color: colors.n580 }]}>almağa çatır</Text>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <EmptyState icon="💸" text="Vərdiş seçin və miqdarı daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["compound-interest", "savings-target", "deposit"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row2: { flexDirection: "row", gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { flexGrow: 1, flexBasis: "45%", borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  cellLabel: { fontSize: 12, marginBottom: 3 },
  cellValue: { fontSize: 17, fontWeight: "800" },
  altBox: { borderRadius: 16, borderWidth: 1, padding: 14 },
  altTitle: { fontSize: 16, fontWeight: "800" },
  altDesc: { fontSize: 12, marginTop: 2, marginBottom: 12 },
  altRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 10 },
  altName: { fontSize: 14, fontWeight: "700" },
  altCount: { fontSize: 14, fontWeight: "800" },
  tiny: { fontSize: 11 },
});
