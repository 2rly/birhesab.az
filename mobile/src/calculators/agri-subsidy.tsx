import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type CropType = "grain" | "cotton" | "tobacco" | "fruit" | "vegetable";

const CROPS: Record<CropType, { label: string; subsidyPerHa: number }> = {
  grain: { label: "Taxıl", subsidyPerHa: 200 },
  cotton: { label: "Pambıq", subsidyPerHa: 300 },
  tobacco: { label: "Tütün", subsidyPerHa: 250 },
  fruit: { label: "Meyvə", subsidyPerHa: 150 },
  vegetable: { label: "Tərəvəz", subsidyPerHa: 100 },
};

const FUEL_SUBSIDY_PER_HA = 100;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function AgriSubsidyCalculator() {
  const [cropType, setCropType] = useState<CropType>("grain");
  const [area, setArea] = useState("10");

  const crop = CROPS[cropType];

  const result = useMemo(() => {
    const a = parseFloat(area) || 0;
    if (a <= 0) return null;

    const cropSubsidy = crop.subsidyPerHa * a;
    const fuelSubsidy = FUEL_SUBSIDY_PER_HA * a;
    const total = cropSubsidy + fuelSubsidy;

    return { cropSubsidy, fuelSubsidy, total };
  }, [area, crop]);

  return (
    <View>
      <SegmentControl
        label="Əkin növü"
        options={[
          { value: "grain", label: "Taxıl" },
          { value: "cotton", label: "Pambıq" },
          { value: "tobacco", label: "Tütün" },
          { value: "fruit", label: "Meyvə" },
        ]}
        selected={cropType}
        onSelect={setCropType}
      />

      <InputField label="Əkin sahəsi" value={area} onChangeText={setArea} placeholder="10" keyboardType="decimal-pad" suffix="hektar" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi subsidiya" value={fmt(result.total)} highlight bold />
          <ResultRow label={`Əkin subsidiyası (${crop.subsidyPerHa} ₼/ha)`} value={fmt(result.cropSubsidy)} />
          <ResultRow label={`Yanacaq subsidiyası (${FUEL_SUBSIDY_PER_HA} ₼/ha)`} value={fmt(result.fuelSubsidy)} />
        </ResultSection>
      )}
    </View>
  );
}
