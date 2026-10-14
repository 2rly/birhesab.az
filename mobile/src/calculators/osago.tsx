import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

type VehicleType = "car" | "taxi" | "truck";

export function OsagoCalculator() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [engineVolume, setEngineVolume] = useState("1600");

  const result = useMemo(() => {
    const vol = parseInt(engineVolume) || 0;
    if (vol <= 0) return null;

    let basePremium: number;

    if (vehicleType === "car") {
      if (vol <= 1500) basePremium = 50;
      else if (vol <= 2000) basePremium = 70;
      else if (vol <= 3000) basePremium = 100;
      else basePremium = 150;
    } else if (vehicleType === "taxi") {
      if (vol <= 1500) basePremium = 80;
      else if (vol <= 2000) basePremium = 110;
      else basePremium = 150;
    } else {
      if (vol <= 3500) basePremium = 100;
      else basePremium = 200;
    }

    return { basePremium, vehicleType };
  }, [engineVolume, vehicleType]);

  return (
    <View>
      <SegmentControl
        label="Nəqliyyat növü"
        options={[
          { value: "car", label: "Minik" },
          { value: "taxi", label: "Taksi" },
          { value: "truck", label: "Yük" },
        ]}
        selected={vehicleType}
        onSelect={setVehicleType}
      />
      <InputField label="Mühərrik həcmi" value={engineVolume} onChangeText={setEngineVolume} placeholder="1600" keyboardType="numeric" suffix="cm³" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="İllik sığorta haqqı" value={fmt(result.basePremium)} highlight bold />
          <ResultRow label="Aylıq" value={fmt(result.basePremium / 12)} />
        </ResultSection>
      )}
    </View>
  );
}
