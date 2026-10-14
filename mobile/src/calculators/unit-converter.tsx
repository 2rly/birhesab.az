import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

type Category = "length" | "weight" | "volume" | "temperature" | "area";

interface UnitDef {
  code: string;
  name: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "length", label: "Uzunluq" },
  { id: "weight", label: "Çəki" },
  { id: "volume", label: "Həcm" },
  { id: "temperature", label: "Temperatur" },
  { id: "area", label: "Sahə" },
];

const linear = (factor: number): Pick<UnitDef, "toBase" | "fromBase"> => ({
  toBase: (v) => v * factor,
  fromBase: (v) => v / factor,
});

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { code: "mm", name: "Millimetr", ...linear(0.001) },
    { code: "sm", name: "Santimetr", ...linear(0.01) },
    { code: "m", name: "Metr", ...linear(1) },
    { code: "km", name: "Kilometr", ...linear(1000) },
    { code: "düym", name: "Düym", ...linear(0.0254) },
    { code: "fut", name: "Fut", ...linear(0.3048) },
    { code: "yard", name: "Yard", ...linear(0.9144) },
    { code: "mil", name: "Mil", ...linear(1609.344) },
  ],
  weight: [
    { code: "mq", name: "Milliqram", ...linear(0.000001) },
    { code: "q", name: "Qram", ...linear(0.001) },
    { code: "kq", name: "Kiloqram", ...linear(1) },
    { code: "ton", name: "Ton", ...linear(1000) },
    { code: "uns", name: "Uns", ...linear(0.0283495) },
    { code: "funt", name: "Funt", ...linear(0.453592) },
  ],
  volume: [
    { code: "ml", name: "Millilitr", ...linear(0.001) },
    { code: "l", name: "Litr", ...linear(1) },
    { code: "qal", name: "Qallon", ...linear(3.78541) },
  ],
  temperature: [
    { code: "°C", name: "Selsi", toBase: (v) => v, fromBase: (v) => v },
    { code: "°F", name: "Farenheyt", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
    { code: "K", name: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  area: [
    { code: "m²", name: "Kvadrat metr", ...linear(1) },
    { code: "km²", name: "Kvadrat km", ...linear(1000000) },
    { code: "ha", name: "Hektar", ...linear(10000) },
    { code: "sot", name: "Sotka", ...linear(100) },
  ],
};

export function UnitConverterCalculator() {
  const { colors } = useTheme();
  const [category, setCategory] = useState<Category>("length");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [amount, setAmount] = useState("1");

  const units = UNITS[category];

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) return null;
    const from = units[fromIdx] || units[0];
    const to = units[toIdx] || units[1];
    const baseValue = from.toBase(val);
    const converted = to.fromBase(baseValue);
    return { converted, fromCode: from.code, toCode: to.code };
  }, [amount, fromIdx, toIdx, units]);

  return (
    <View>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, { backgroundColor: colors.n240 }, category === c.id && { backgroundColor: colors.accent }]}
            onPress={() => { setCategory(c.id); setFromIdx(0); setToIdx(1); }}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, category === c.id && { color: colors.onAccent }]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.n700 }]}>Haradan</Text>
      <View style={styles.chipRow}>
        {units.map((u, i) => (
          <Pressable
            key={u.code}
            style={[styles.unitChip, { backgroundColor: colors.n240 }, fromIdx === i && { backgroundColor: colors.accent }]}
            onPress={() => setFromIdx(i)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, fromIdx === i && { color: colors.onAccent }]}>{u.code}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.n700 }]}>Haraya</Text>
      <View style={styles.chipRow}>
        {units.map((u, i) => (
          <Pressable
            key={u.code}
            style={[styles.unitChip, { backgroundColor: colors.n240 }, toIdx === i && { backgroundColor: colors.accent }]}
            onPress={() => setToIdx(i)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, toIdx === i && { color: colors.onAccent }]}>{u.code}</Text>
          </Pressable>
        ))}
      </View>

      <InputField label="Məbləğ" value={amount} onChangeText={setAmount} placeholder="1" keyboardType="decimal-pad" suffix={units[fromIdx]?.code} />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label={`${amount} ${result.fromCode}`}
            value={`${result.converted.toPrecision(6)} ${result.toCode}`}
            highlight
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },
});
