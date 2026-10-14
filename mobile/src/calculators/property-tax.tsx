import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function calcNotary(price: number): number {
  if (price <= 10000) return price * 0.005 + 15;
  if (price <= 50000) return 50 + (price - 10000) * 0.003;
  if (price <= 100000) return 170 + (price - 50000) * 0.002;
  return 270 + (price - 100000) * 0.001;
}

export function PropertyTaxCalculator() {
  const [price, setPrice] = useState("100000");
  const [prevPrice, setPrevPrice] = useState("80000");
  const [sellerType, setSellerType] = useState<"individual" | "legal">("individual");

  const result = useMemo(() => {
    const salePrice = parseFloat(price) || 0;
    const buyPrice = parseFloat(prevPrice) || 0;
    if (salePrice <= 0) return null;

    const profit = Math.max(0, salePrice - buyPrice);
    const incomeTaxRate = sellerType === "individual" ? 0.14 : 0.20;
    const incomeTax = profit * incomeTaxRate;
    const notary = calcNotary(salePrice);
    const registration = 20;
    const techPassport = 50;
    const extract = 20;
    const docs = 30;
    const fixedFees = registration + techPassport + extract + docs;
    const total = incomeTax + notary + fixedFees;

    return { profit, incomeTax, notary, fixedFees, total };
  }, [price, prevPrice, sellerType]);

  return (
    <View>
      <SegmentControl
        label="Satıcı tipi"
        options={[
          { value: "individual", label: "Fiziki şəxs" },
          { value: "legal", label: "Hüquqi şəxs" },
        ]}
        selected={sellerType}
        onSelect={setSellerType}
      />
      <InputField label="Satış qiyməti" value={price} onChangeText={setPrice} placeholder="100000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Alış qiyməti" value={prevPrice} onChangeText={setPrevPrice} placeholder="80000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Mənfəət" value={fmt(result.profit)} />
          <ResultRow label={`Gəlir vergisi (${sellerType === "individual" ? "14" : "20"}%)`} value={fmt(result.incomeTax)} />
          <ResultRow label="Notarius rüsumu" value={fmt(result.notary)} />
          <ResultRow label="Dövlət rüsumları" value={fmt(result.fixedFees)} />
          <ResultRow label="Ümumi xərc" value={fmt(result.total)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
