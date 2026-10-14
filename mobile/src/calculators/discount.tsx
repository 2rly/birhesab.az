import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DiscountCalculator() {
  const [price, setPrice] = useState("100");
  const [discount, setDiscount] = useState("20");

  const result = useMemo(() => {
    const p = parseFloat(price) || 0;
    const d = parseFloat(discount) || 0;
    if (p <= 0 || d <= 0 || d > 100) return null;

    const discountAmount = p * (d / 100);
    const finalPrice = p - discountAmount;

    return {
      originalPrice: p,
      discountAmount,
      finalPrice,
    };
  }, [price, discount]);

  return (
    <View>
      <InputField
        label="Orijinal qiymət"
        value={price}
        onChangeText={setPrice}
        placeholder="100"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="Endirim faizi"
        value={discount}
        onChangeText={setDiscount}
        placeholder="20"
        keyboardType="decimal-pad"
        suffix="%"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Orijinal qiymət"
            value={fmt(result.originalPrice)}
          />
          <ResultRow
            label={`Endirim (${discount}%)`}
            value={`-${fmt(result.discountAmount)}`}
          />
          <ResultRow
            label="Endirimli qiymət"
            value={fmt(result.finalPrice)}
            highlight
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}
