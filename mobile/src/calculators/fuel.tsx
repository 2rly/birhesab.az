import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const FUEL_TYPES = [
  { id: "ai92", label: "Aİ-92", price: 1.15 },
  { id: "ai95", label: "Aİ-95", price: 1.60 },
  { id: "ai98", label: "Aİ-98", price: 2.30 },
  { id: "diesel", label: "Dizel", price: 1.10 },
  { id: "lpg", label: "LPG", price: 0.45 },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function FuelCalculator() {
  const { colors } = useTheme();
  const [distance, setDistance] = useState("100");
  const [consumption, setConsumption] = useState("8");
  const [fuelIdx, setFuelIdx] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);

  const fuel = FUEL_TYPES[fuelIdx];

  const result = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const cons = parseFloat(consumption) || 0;
    if (dist <= 0 || cons <= 0) return null;

    const totalDist = roundTrip ? dist * 2 : dist;
    const fuelNeeded = (totalDist / 100) * cons;
    const totalCost = fuelNeeded * fuel.price;

    return { totalDist, fuelNeeded, totalCost };
  }, [distance, consumption, fuel, roundTrip]);

  return (
    <View>
      <View style={styles.chips}>
        {FUEL_TYPES.map((f, i) => (
          <Pressable
            key={f.id}
            style={[
              styles.chip,
              { backgroundColor: colors.n240 },
              fuelIdx === i && { backgroundColor: colors.accent },
            ]}
            onPress={() => setFuelIdx(i)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.n580 },
                fuelIdx === i && { color: colors.onAccent },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <InputField
        label="Məsafə"
        value={distance}
        onChangeText={setDistance}
        placeholder="100"
        keyboardType="decimal-pad"
        suffix="km"
      />
      <InputField
        label="Yanacaq sərfiyyatı"
        value={consumption}
        onChangeText={setConsumption}
        placeholder="8"
        keyboardType="decimal-pad"
        suffix="L/100km"
      />

      <Pressable
        style={[styles.toggle, { backgroundColor: colors.n240 }]}
        onPress={() => setRoundTrip(!roundTrip)}
      >
        <Text style={[styles.toggleText, { color: colors.n840 }]}>
          {roundTrip ? "✓ Gediş-gəliş" : "Yalnız gediş"}
        </Text>
      </Pressable>

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi xərc" value={fmt(result.totalCost)} highlight bold />
          <ResultRow label="Lazım olan yanacaq" value={`${result.fuelNeeded.toFixed(1)} L`} />
          <ResultRow label="Ümumi məsafə" value={`${result.totalDist} km`} />
          <ResultRow label="Yanacaq qiyməti" value={`${fuel.price.toFixed(2)} ₼/L`} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },
  toggle: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  toggleText: { fontSize: 14, fontWeight: "600" },
});
