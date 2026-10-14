import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type FuelType = "ai92" | "ai95" | "ai98" | "diesel" | "lpg";

const FUEL_PRICES: Record<FuelType, { label: string; price: number }> = {
  ai92: { label: "Aİ-92", price: 1.15 },
  ai95: { label: "Aİ-95", price: 1.60 },
  ai98: { label: "Aİ-98", price: 2.30 },
  diesel: { label: "Dizel", price: 1.10 },
  lpg: { label: "LPQ", price: 0.45 },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function FuelCalculator() {
  const [fuelType, setFuelType] = useState<FuelType>("ai92");
  const [distance, setDistance] = useState("100");
  const [consumption, setConsumption] = useState("8");

  const fuel = FUEL_PRICES[fuelType];

  const result = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const cons = parseFloat(consumption) || 0;
    if (dist <= 0 || cons <= 0) return null;

    const fuelNeeded = (dist / 100) * cons;
    const totalCost = fuelNeeded * fuel.price;
    const costPerKm = totalCost / dist;

    return { fuelNeeded, totalCost, costPerKm };
  }, [distance, consumption, fuel.price]);

  return (
    <View>
      <SegmentControl
        label="Yanacaq növü"
        options={[
          { value: "ai92" as FuelType, label: "Aİ-92" },
          { value: "ai95" as FuelType, label: "Aİ-95" },
          { value: "diesel" as FuelType, label: "Dizel" },
        ]}
        selected={fuelType}
        onSelect={setFuelType}
      />
      <SegmentControl
        options={[
          { value: "ai98" as FuelType, label: "Aİ-98" },
          { value: "lpg" as FuelType, label: "LPQ" },
        ]}
        selected={fuelType}
        onSelect={setFuelType}
      />

      <InputField
        label="Məsafə"
        value={distance}
        onChangeText={setDistance}
        placeholder="100"
        keyboardType="decimal-pad"
        suffix="km"
      />
      <InputField
        label="Sərfiyyat (100 km-ə)"
        value={consumption}
        onChangeText={setConsumption}
        placeholder="8"
        keyboardType="decimal-pad"
        suffix="L"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Lazım olan yanacaq"
            value={`${result.fuelNeeded.toFixed(1)} L`}
          />
          <ResultRow
            label={`Qiymət (${fuel.label})`}
            value={`${fuel.price.toFixed(2)} ₼/L`}
          />
          <ResultRow
            label="Ümumi xərc"
            value={fmt(result.totalCost)}
            highlight
            bold
          />
          <ResultRow
            label="1 km-ə xərc"
            value={fmt(result.costPerKm)}
          />
        </ResultSection>
      )}
    </View>
  );
}
