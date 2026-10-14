import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";

type Category = "length" | "weight" | "temperature" | "data";

interface UnitDef {
  id: string;
  label: string;
}

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { id: "km", label: "km" },
    { id: "m", label: "m" },
    { id: "cm", label: "sm" },
    { id: "mi", label: "mil" },
    { id: "ft", label: "fut" },
    { id: "in", label: "düym" },
  ],
  weight: [
    { id: "kg", label: "kq" },
    { id: "g", label: "q" },
    { id: "lb", label: "lb" },
    { id: "oz", label: "oz" },
  ],
  temperature: [
    { id: "c", label: "°C" },
    { id: "f", label: "°F" },
  ],
  data: [
    { id: "b", label: "B" },
    { id: "kb", label: "KB" },
    { id: "mb", label: "MB" },
    { id: "gb", label: "GB" },
    { id: "tb", label: "TB" },
  ],
};

const LENGTH_TO_M: Record<string, number> = {
  km: 1000,
  m: 1,
  cm: 0.01,
  mi: 1609.344,
  ft: 0.3048,
  in: 0.0254,
};

const WEIGHT_TO_G: Record<string, number> = {
  kg: 1000,
  g: 1,
  lb: 453.592,
  oz: 28.3495,
};

const DATA_TO_B: Record<string, number> = {
  b: 1,
  kb: 1024,
  mb: 1024 ** 2,
  gb: 1024 ** 3,
  tb: 1024 ** 4,
};

function convert(
  val: number,
  from: string,
  to: string,
  cat: Category
): number | null {
  if (cat === "temperature") {
    if (from === to) return val;
    if (from === "c" && to === "f") return val * 1.8 + 32;
    if (from === "f" && to === "c") return (val - 32) / 1.8;
    return null;
  }

  const table =
    cat === "length"
      ? LENGTH_TO_M
      : cat === "weight"
        ? WEIGHT_TO_G
        : DATA_TO_B;

  const fromFactor = table[from];
  const toFactor = table[to];
  if (!fromFactor || !toFactor) return null;

  return (val * fromFactor) / toFactor;
}

export function UnitConverterCalculator() {
  const { colors } = useTheme();
  const [category, setCategory] = useState<Category>("length");
  const [value, setValue] = useState("1");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);

  const units = UNITS[category];
  const from = units[fromIdx] || units[0];
  const to = units[toIdx] || units[1];

  const result = useMemo(() => {
    const v = parseFloat(value) || 0;
    if (v === 0) return null;
    return convert(v, from.id, to.id, category);
  }, [value, from, to, category]);

  const handleCategoryChange = (c: Category) => {
    setCategory(c);
    setFromIdx(0);
    setToIdx(1);
  };

  return (
    <View>
      <SegmentControl
        label="Kateqoriya"
        options={[
          { value: "length", label: "Uzunluq" },
          { value: "weight", label: "Çəki" },
          { value: "temperature", label: "Temp." },
          { value: "data", label: "Data" },
        ]}
        selected={category}
        onSelect={handleCategoryChange}
      />

      <View style={styles.unitPickers}>
        <View style={styles.unitGroup}>
          <Text style={[styles.unitLabel, { color: colors.n700 }]}>Haradan</Text>
          <View style={styles.unitRow}>
            {units.map((u, i) => (
              <Pressable
                key={u.id}
                style={[
                  styles.unitChip,
                  { backgroundColor: colors.n240 },
                  fromIdx === i && { backgroundColor: colors.accent },
                ]}
                onPress={() => setFromIdx(i)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    { color: colors.n580 },
                    fromIdx === i && { color: colors.onAccent },
                  ]}
                >
                  {u.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.unitGroup}>
          <Text style={[styles.unitLabel, { color: colors.n700 }]}>Haraya</Text>
          <View style={styles.unitRow}>
            {units.map((u, i) => (
              <Pressable
                key={u.id}
                style={[
                  styles.unitChip,
                  { backgroundColor: colors.n240 },
                  toIdx === i && { backgroundColor: colors.accent },
                ]}
                onPress={() => setToIdx(i)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    { color: colors.n580 },
                    toIdx === i && { color: colors.onAccent },
                  ]}
                >
                  {u.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <InputField
        label={`Dəyər (${from.label})`}
        value={value}
        onChangeText={setValue}
        placeholder="1"
        keyboardType="decimal-pad"
        suffix={from.label}
      />

      {result !== null && (
        <View style={[styles.resultCard, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.resultValue, { color: colors.accent }]}>
            {result < 0.01 && result > 0
              ? result.toExponential(4)
              : result.toLocaleString("az-AZ", {
                  maximumFractionDigits: 6,
                })}
          </Text>
          <Text style={[styles.resultUnit, { color: colors.n700 }]}>
            {to.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  unitPickers: { gap: 12, marginBottom: 16 },
  unitGroup: {},
  unitLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  unitChipText: { fontSize: 13, fontWeight: "600" },
  resultCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  resultValue: { fontSize: 36, fontWeight: "800" },
  resultUnit: { fontSize: 16, fontWeight: "600", marginTop: 4 },
});
