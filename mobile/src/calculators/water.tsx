import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Activity = "sedentary" | "light" | "moderate" | "active" | "very-active";
type Climate = "cold" | "moderate" | "hot" | "very-hot";

const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.0,
  light: 1.1,
  moderate: 1.25,
  active: 1.4,
  "very-active": 1.6,
};

const CLIMATE_FACTORS: Record<Climate, number> = {
  cold: 0.9,
  moderate: 1.0,
  hot: 1.15,
  "very-hot": 1.3,
};

export function WaterCalculator() {
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [climate, setClimate] = useState<Climate>("moderate");

  const result = useMemo(() => {
    const w = parseFloat(weight) || 0;
    if (w <= 0) return null;

    const base = w * 33;
    const total = base * ACTIVITY_FACTORS[activity] * CLIMATE_FACTORS[climate];
    const glasses = Math.ceil(total / 250);

    return {
      totalMl: Math.round(total),
      totalL: (total / 1000).toFixed(1),
      glasses,
    };
  }, [weight, activity, climate]);

  return (
    <View>
      <InputField
        label="Çəki"
        value={weight}
        onChangeText={setWeight}
        placeholder="70"
        keyboardType="decimal-pad"
        suffix="kq"
      />

      <SegmentControl
        label="Aktivlik"
        options={[
          { value: "sedentary", label: "Az" },
          { value: "light", label: "Yüngül" },
          { value: "moderate", label: "Orta" },
          { value: "active", label: "Aktiv" },
          { value: "very-active", label: "Çox" },
        ]}
        selected={activity}
        onSelect={setActivity}
      />

      <SegmentControl
        label="İqlim"
        options={[
          { value: "cold", label: "Soyuq" },
          { value: "moderate", label: "Mülayim" },
          { value: "hot", label: "İsti" },
          { value: "very-hot", label: "Çox isti" },
        ]}
        selected={climate}
        onSelect={setClimate}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Gündəlik su norması"
            value={`${result.totalMl} ml (${result.totalL} L)`}
            highlight
            bold
          />
          <ResultRow
            label="Stəkan sayı (250 ml)"
            value={`${result.glasses} stəkan`}
          />
        </ResultSection>
      )}
    </View>
  );
}
