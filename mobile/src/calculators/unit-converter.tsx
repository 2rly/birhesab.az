import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { DataTable, FormulaSection, RelatedCalculators } from "@/components/Content";

/* ───────── çevirmə əmsalları (hamısı baza vahidə nisbətən) ───────── */

type UnitDef = { key: string; label: string; toBase: number };
type CategoryDef = { key: string; label: string; icon: string; units: UnitDef[] };

const CATEGORIES: CategoryDef[] = [
  {
    key: "length",
    label: "Uzunluq",
    icon: "📏",
    units: [
      { key: "km", label: "Kilometr", toBase: 1000 },
      { key: "mil", label: "Mil", toBase: 1609.344 },
      { key: "m", label: "Metr", toBase: 1 },
      { key: "ft", label: "Fut", toBase: 0.3048 },
      { key: "cm", label: "Santimetr", toBase: 0.01 },
      { key: "inch", label: "Düym", toBase: 0.0254 },
    ],
  },
  {
    key: "weight",
    label: "Çəki",
    icon: "⚖️",
    units: [
      { key: "kq", label: "Kiloqram", toBase: 1000 },
      { key: "lb", label: "Funt", toBase: 453.592 },
      { key: "q", label: "Qram", toBase: 1 },
      { key: "oz", label: "Unsiya", toBase: 28.3495 },
    ],
  },
  {
    key: "data",
    label: "Data",
    icon: "💾",
    units: [
      { key: "MB", label: "Meqabayt", toBase: 1 },
      { key: "GB", label: "Giqabayt", toBase: 1024 },
      { key: "TB", label: "Terabayt", toBase: 1048576 },
    ],
  },
];

const COMMON_CONVERSIONS = [
  { catIdx: 0, fromKey: "km", toKey: "mil", value: 1 },
  { catIdx: 0, fromKey: "m", toKey: "ft", value: 1 },
  { catIdx: 0, fromKey: "cm", toKey: "inch", value: 1 },
  { catIdx: 0, fromKey: "mil", toKey: "km", value: 1 },
  { catIdx: 1, fromKey: "kq", toKey: "lb", value: 1 },
  { catIdx: 1, fromKey: "q", toKey: "oz", value: 1 },
  { catIdx: 2, fromKey: "GB", toKey: "MB", value: 1 },
  { catIdx: 2, fromKey: "TB", toKey: "GB", value: 1 },
];

const FORMULA_TITLE = "Çevirmə haqqında";
const FORMULA_CONTENT = `Vahid çevirici standart çevirmə əmsallarından istifadə edir.

Uzunluq: 1 mil = 1.609 km, 1 fut = 0.3048 m, 1 düym = 2.54 sm
Çəki: 1 funt = 0.4536 kq, 1 unsiya = 28.35 q
Data: 1 GB = 1024 MB, 1 TB = 1024 GB`;

/** toLocaleString("en", { maximumFractionDigits: 2 }) ekvivalenti */
function fmtEn(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const [int, frac] = Math.abs(rounded).toFixed(2).split(".");
  const fracTrim = frac.replace(/0+$/, "");
  return (rounded < 0 ? "-" : "") + int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (fracTrim ? "." + fracTrim : "");
}

function formatResult(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(4);
  if (Math.abs(n) < 1) return n.toFixed(4);
  if (Math.abs(n) >= 1e6) return fmtEn(n);
  return n.toFixed(4).replace(/\.?0+$/, "");
}

function convert(value: number, from: UnitDef, to: UnitDef) {
  return (value * from.toBase) / to.toBase;
}

export function UnitConverterCalculator() {
  const { colors } = useTheme();
  const [catIdx, setCatIdx] = useState(0);
  const [fromUnit, setFromUnit] = useState(CATEGORIES[0].units[0].key);
  const [toUnit, setToUnit] = useState(CATEGORIES[0].units[2].key);
  const [leftValue, setLeftValue] = useState("1");
  const [rightValue, setRightValue] = useState("");
  const [activeField, setActiveField] = useState<"left" | "right">("left");

  const cat = CATEGORIES[catIdx];
  const fromDef = cat.units.find((u) => u.key === fromUnit)!;
  const toDef = cat.units.find((u) => u.key === toUnit)!;

  const num = (s: string) => parseFloat(s.replace(",", "."));

  const computedRight = useMemo(() => {
    if (activeField !== "left") return rightValue;
    const n = num(leftValue);
    if (isNaN(n)) return "";
    return formatResult(convert(n, fromDef, toDef));
  }, [leftValue, rightValue, fromDef, toDef, activeField]);

  const computedLeft = useMemo(() => {
    if (activeField !== "right") return leftValue;
    const n = num(rightValue);
    if (isNaN(n)) return "";
    return formatResult(convert(n, toDef, fromDef));
  }, [leftValue, rightValue, fromDef, toDef, activeField]);

  const displayLeft = activeField === "left" ? leftValue : computedLeft;
  const displayRight = activeField === "right" ? rightValue : computedRight;

  const handleCategoryChange = (idx: number) => {
    setCatIdx(idx);
    setFromUnit(CATEGORIES[idx].units[0].key);
    setToUnit(CATEGORIES[idx].units.length > 2 ? CATEGORIES[idx].units[2].key : CATEGORIES[idx].units[1].key);
    setLeftValue("1");
    setRightValue("");
    setActiveField("left");
  };

  const handleSwap = () => {
    const tmp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tmp);
  };

  const unitOptions = cat.units.map((u) => ({ value: u.key, label: u.key, description: u.label }));

  const refRows = COMMON_CONVERSIONS.filter((r) => r.catIdx === catIdx).map((r) => {
    const fDef = cat.units.find((u) => u.key === r.fromKey)!;
    const tDef = cat.units.find((u) => u.key === r.toKey)!;
    return [`${r.value} ${fDef.label}`, tDef.label, `${formatResult(convert(r.value, fDef, tDef))} ${r.toKey}`];
  });

  return (
    <View>
      {/* Kateqoriyalar */}
      <View style={styles.tabs}>
        {CATEGORIES.map((c, i) => {
          const active = catIdx === i;
          return (
            <Pressable
              key={c.key}
              onPress={() => handleCategoryChange(i)}
              style={[styles.tab, { backgroundColor: active ? colors.accent : colors.n240 }]}
            >
              <Text style={[styles.tabText, { color: active ? colors.onAccent : colors.n760 }]}>
                {c.icon} {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Buradan */}
      <View style={styles.convRow}>
        <View style={{ flex: 1 }}>
          <InputField
            label="Buradan"
            value={displayLeft}
            onChangeText={(v) => {
              setActiveField("left");
              setLeftValue(v);
            }}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.unitCol}>
          <Select
            label=" "
            value={fromUnit}
            options={unitOptions}
            onSelect={(v) => {
              setFromUnit(v);
              setActiveField("left");
            }}
            searchable={false}
          />
        </View>
      </View>

      <View style={styles.swapWrap}>
        <Pressable
          onPress={handleSwap}
          accessibilityLabel="Dəyişdir"
          style={[styles.swapBtn, { backgroundColor: colors.n240, borderColor: colors.n280 }]}
        >
          <MaterialIcons name="swap-vert" size={22} color={colors.accent} />
        </Pressable>
      </View>

      {/* Bura */}
      <View style={styles.convRow}>
        <View style={{ flex: 1 }}>
          <InputField
            label="Bura"
            value={displayRight}
            onChangeText={(v) => {
              setActiveField("right");
              setRightValue(v);
            }}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.unitCol}>
          <Select
            label=" "
            value={toUnit}
            options={unitOptions}
            onSelect={(v) => {
              setToUnit(v);
              setActiveField("right");
            }}
            searchable={false}
          />
        </View>
      </View>

      {!!displayLeft && !!displayRight && (
        <Text style={[styles.rate, { color: colors.n580 }]}>
          1 {fromUnit} = {formatResult(convert(1, fromDef, toDef))} {toUnit}
        </Text>
      )}

      <DataTable
        title="Tez-tez istifadə olunan çevirmələr"
        headers={["Dən", "Ə", "Nəticə"]}
        rows={refRows}
        columnWidths={[130, 110, 130]}
      />

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["currency", "percentage", "faiz"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  tab: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  tabText: { fontSize: 14, fontWeight: "600" },
  convRow: { flexDirection: "row", gap: 10 },
  unitCol: { width: 110 },
  swapWrap: { alignItems: "center", marginTop: -6, marginBottom: 6 },
  swapBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  rate: { fontSize: 14, textAlign: "center", marginTop: 4 },
});
