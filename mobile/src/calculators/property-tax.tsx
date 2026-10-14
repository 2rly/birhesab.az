import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type SellerType = "individual" | "legal";

const INCOME_TAX_INDIVIDUAL = 0.14;
const INCOME_TAX_LEGAL = 0.20;
const STATE_REG_FEE = 20;
const TECH_PASSPORT = 50;

function getNotaryFee(price: number): number {
  if (price <= 10000) return price * 0.005 + 15;
  if (price <= 50000) return 50 + (price - 10000) * 0.003;
  if (price <= 100000) return 170 + (price - 50000) * 0.002;
  return 270 + (price - 100000) * 0.001;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function PropertyTaxCalculator() {
  const [sellerType, setSellerType] = useState<SellerType>("individual");
  const [salePrice, setSalePrice] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  const result = useMemo(() => {
    const sale = parseFloat(salePrice) || 0;
    const buy = parseFloat(buyPrice) || 0;
    if (sale <= 0) return null;

    const profit = Math.max(0, sale - buy);
    const taxRate = sellerType === "individual" ? INCOME_TAX_INDIVIDUAL : INCOME_TAX_LEGAL;
    const incomeTax = profit * taxRate;
    const notaryFee = getNotaryFee(sale);
    const totalFees = STATE_REG_FEE + TECH_PASSPORT + 50;
    const totalCost = incomeTax + notaryFee + totalFees;

    return { profit, incomeTax, notaryFee, totalFees, totalCost };
  }, [sellerType, salePrice, buyPrice]);

  return (
    <View>
      <SegmentControl
        label="Satıcı növü"
        options={[
          { value: "individual", label: "Fiziki şəxs" },
          { value: "legal", label: "Hüquqi şəxs" },
        ]}
        selected={sellerType}
        onSelect={setSellerType}
      />
      <InputField label="Satış qiyməti" value={salePrice} onChangeText={setSalePrice} placeholder="100000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Alış qiyməti" value={buyPrice} onChangeText={setBuyPrice} placeholder="80000" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Mənfəət" value={fmt(result.profit)} />
          <ResultRow label={`Gəlir vergisi (${sellerType === "individual" ? "14" : "20"}%)`} value={fmt(result.incomeTax)} />
          <ResultRow label="Notarius xərci" value={fmt(result.notaryFee)} />
          <ResultRow label="Dövlət rüsumları" value={fmt(result.totalFees)} />
          <ResultRow label="Ümumi xərc" value={fmt(result.totalCost)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
