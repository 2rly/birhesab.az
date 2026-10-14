import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

export function BsaCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    if (h <= 0 || w <= 0) return null;

    const dubois = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
    const mosteller = Math.sqrt((h * w) / 3600);
    const haycock = 0.024265 * Math.pow(h, 0.3964) * Math.pow(w, 0.5378);

    return { dubois, mosteller, haycock };
  }, [height, weight]);

  return (
    <View>
      <InputField label="Boy (sm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="decimal-pad" suffix="sm" />
      <InputField label="Çəki (kq)" value={weight} onChangeText={setWeight} placeholder="75" keyboardType="decimal-pad" suffix="kq" />

      {result && (
        <ResultSection title="Bədən Səthi Sahəsi (KSQ)">
          <ResultRow label="Du Bois düsturu" value={`${result.dubois.toFixed(4)} m²`} highlight bold />
          <ResultRow label="Mosteller düsturu" value={`${result.mosteller.toFixed(4)} m²`} />
          <ResultRow label="Haycock düsturu" value={`${result.haycock.toFixed(4)} m²`} />
        </ResultSection>
      )}
    </View>
  );
}
