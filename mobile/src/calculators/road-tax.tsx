import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type VehicleType = "petrol" | "hybrid" | "electric";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function getTax(volume: number): number {
  if (volume <= 1500) return 10;
  if (volume <= 2000) return 20;
  if (volume <= 2500) return 30;
  if (volume <= 3000) return 50;
  if (volume <= 3500) return 75;
  if (volume <= 4000) return 100;
  if (volume <= 4500) return 150;
  return 200;
}

export function RoadTaxCalculator() {
  const [type, setType] = useState<VehicleType>("petrol");
  const [volume, setVolume] = useState("2000");

  const result = useMemo(() => {
    const v = parseInt(volume) || 0;
    if (v <= 0) return null;

    if (type === "electric") {
      return { annual: 0, monthly: 0, effectiveVolume: 0 };
    }

    const effectiveVolume = type === "hybrid" ? Math.round(v * 0.7) : v;
    const annual = getTax(effectiveVolume);
    return { annual, monthly: annual / 12, effectiveVolume };
  }, [type, volume]);

  return (
    <View>
      <SegmentControl
        label="Nəqliyyat növü"
        options={[
          { value: "petrol", label: "Benzin/Dizel" },
          { value: "hybrid", label: "Hibrid" },
          { value: "electric", label: "Elektrik" },
        ]}
        selected={type}
        onSelect={setType}
      />

      {type !== "electric" && (
        <InputField
          label="Mühərrik həcmi"
          value={volume}
          onChangeText={setVolume}
          placeholder="2000"
          keyboardType="numeric"
          suffix="sm³"
        />
      )}

      {result && (
        <ResultSection title="Nəticə">
          {type === "electric" ? (
            <ResultRow label="Yol vergisi" value="Azaddır (0 ₼)" highlight bold />
          ) : (
            <>
              {type === "hybrid" && (
                <ResultRow
                  label="Effektiv həcm (70%)"
                  value={`${result.effectiveVolume} sm³`}
                />
              )}
              <ResultRow
                label="İllik yol vergisi"
                value={fmt(result.annual)}
                highlight
                bold
              />
              <ResultRow
                label="Aylıq ekvivalent"
                value={fmt(result.monthly)}
              />
            </>
          )}
        </ResultSection>
      )}
    </View>
  );
}
