import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Activity = "sedentary" | "moderate" | "active";
type Climate = "normal" | "hot";

export function WaterCalculator() {
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [climate, setClimate] = useState<Climate>("normal");

  const result = useMemo(() => {
    const w = parseFloat(weight) || 0;
    if (w <= 0) return null;

    const activityMult = activity === "sedentary" ? 1.0 : activity === "moderate" ? 1.2 : 1.4;
    const climateMult = climate === "normal" ? 1.0 : 1.15;
    const dailyMl = w * 30 * activityMult * climateMult;
    const glasses = Math.round(dailyMl / 250);

    return { dailyMl: Math.round(dailyMl), liters: (dailyMl / 1000).toFixed(1), glasses };
  }, [weight, activity, climate]);

  return (
    <View>
      <InputField label="Çəki" value={weight} onChangeText={setWeight} placeholder="70" keyboardType="decimal-pad" suffix="kq" />

      <SegmentControl
        label="Aktivlik səviyyəsi"
        options={[
          { value: "sedentary", label: "Oturaq" },
          { value: "moderate", label: "Orta" },
          { value: "active", label: "Aktiv" },
        ]}
        selected={activity}
        onSelect={setActivity}
      />

      <SegmentControl
        label="İqlim"
        options={[
          { value: "normal", label: "Mülayim" },
          { value: "hot", label: "İsti" },
        ]}
        selected={climate}
        onSelect={setClimate}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Gündəlik su norması" value={`${result.liters} L`} highlight bold />
          <ResultRow label="Millilitrlə" value={`${result.dailyMl} ml`} />
          <ResultRow label="Stəkan (250 ml)" value={`${result.glasses} stəkan`} />
        </ResultSection>
      )}
    </View>
  );
}
