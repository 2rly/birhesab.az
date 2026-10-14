import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function SqmCalculator() {
  const [totalPrice, setTotalPrice] = useState("120000");
  const [area, setArea] = useState("60");

  const result = useMemo(() => {
    const price = parseFloat(totalPrice) || 0;
    const sqm = parseFloat(area) || 0;
    if (price <= 0 || sqm <= 0) return null;

    return {
      pricePerSqm: price / sqm,
      totalPrice: price,
      area: sqm,
    };
  }, [totalPrice, area]);

  return (
    <View>
      <InputField label="Ümumi qiymət" value={totalPrice} onChangeText={setTotalPrice} placeholder="120000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Sahə" value={area} onChangeText={setArea} placeholder="60" keyboardType="decimal-pad" suffix="m²" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="1 m² qiyməti" value={fmt(result.pricePerSqm)} highlight bold />
          <ResultRow label="Ümumi qiymət" value={fmt(result.totalPrice)} />
          <ResultRow label="Sahə" value={`${result.area} m²`} />
        </ResultSection>
      )}
    </View>
  );
}
