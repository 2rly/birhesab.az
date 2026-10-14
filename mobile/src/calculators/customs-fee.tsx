import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function CustomsFeeCalculator() {
  const [value, setValue] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const v = parseFloat(value) || 0;
    const w = parseFloat(weight) || 0;
    if (v <= 0) return null;

    const customsDuty = v > 300 ? (v - 300) * 0.18 : 0;
    const edv = (v + customsDuty) * 0.18;
    const total = customsDuty + edv;

    return { customsDuty, edv, total, freeLimit: 300 };
  }, [value, weight]);

  return (
    <View>
      <InputField label="Malın dəyəri (USD)" value={value} onChangeText={setValue} placeholder="500" keyboardType="decimal-pad" suffix="$" />
      <InputField label="Çəki (kq)" value={weight} onChangeText={setWeight} placeholder="5" keyboardType="decimal-pad" suffix="kq" />

      {result && (
        <ResultSection title="Gömrük rüsumu">
          <ResultRow label="Azad limit" value="300 $" />
          <ResultRow label="Gömrük rüsumu (18%)" value={fmt(result.customsDuty)} />
          <ResultRow label="ƏDV (18%)" value={fmt(result.edv)} />
          <ResultRow label="Ümumi ödəniş" value={fmt(result.total)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
