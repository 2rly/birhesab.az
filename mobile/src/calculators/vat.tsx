import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Direction = "add" | "extract";
type VatRate = "18" | "10" | "5";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function VatCalculator() {
  const [direction, setDirection] = useState<Direction>("add");
  const [rate, setRate] = useState<VatRate>("18");
  const [amount, setAmount] = useState("1000");

  const result = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) return null;
    const r = parseInt(rate) / 100;

    if (direction === "add") {
      const vatAmount = val * r;
      return {
        priceWithoutVat: val,
        vatAmount,
        priceWithVat: val + vatAmount,
      };
    } else {
      const priceWithoutVat = val / (1 + r);
      const vatAmount = val - priceWithoutVat;
      return {
        priceWithoutVat,
        vatAmount,
        priceWithVat: val,
      };
    }
  }, [direction, rate, amount]);

  return (
    <View>
      <SegmentControl
        label="İstiqamət"
        options={[
          { value: "add", label: "ƏDV əlavə et" },
          { value: "extract", label: "ƏDV ayır" },
        ]}
        selected={direction}
        onSelect={setDirection}
      />

      <SegmentControl
        label="ƏDV dərəcəsi"
        options={[
          { value: "18", label: "18%" },
          { value: "10", label: "10%" },
          { value: "5", label: "5%" },
        ]}
        selected={rate}
        onSelect={setRate}
      />

      <InputField
        label={
          direction === "add" ? "ƏDV-siz məbləğ" : "ƏDV-li məbləğ"
        }
        value={amount}
        onChangeText={setAmount}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="ƏDV-siz qiymət"
            value={fmt(result.priceWithoutVat)}
          />
          <ResultRow
            label={`ƏDV (${rate}%)`}
            value={fmt(result.vatAmount)}
          />
          <ResultRow
            label="ƏDV-li qiymət"
            value={fmt(result.priceWithVat)}
            highlight
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}
