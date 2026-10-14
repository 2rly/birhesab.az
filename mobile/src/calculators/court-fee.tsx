import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

type ClaimType = "property" | "non-property" | "divorce";

export function CourtFeeCalculator() {
  const [claimType, setClaimType] = useState<ClaimType>("property");
  const [amount, setAmount] = useState("10000");

  const result = useMemo(() => {
    if (claimType === "divorce") return { fee: 20, label: "Boşanma rüsumu" };
    if (claimType === "non-property") return { fee: 30, label: "Qeyri-əmlak tələbi" };

    const val = parseFloat(amount) || 0;
    if (val <= 0) return null;

    let fee: number;
    if (val <= 1000) fee = Math.max(val * 0.01, 10);
    else if (val <= 10000) fee = 10 + (val - 1000) * 0.03;
    else if (val <= 50000) fee = 280 + (val - 10000) * 0.02;
    else fee = 1080 + (val - 50000) * 0.01;

    return { fee, label: "Əmlak tələbi rüsumu" };
  }, [claimType, amount]);

  return (
    <View>
      <SegmentControl
        label="Tələb növü"
        options={[
          { value: "property", label: "Əmlak" },
          { value: "non-property", label: "Qeyri-əmlak" },
          { value: "divorce", label: "Boşanma" },
        ]}
        selected={claimType}
        onSelect={setClaimType}
      />
      {claimType === "property" && (
        <InputField label="Tələbin məbləği" value={amount} onChangeText={setAmount} placeholder="10000" keyboardType="decimal-pad" suffix="₼" />
      )}

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label={result.label} value={fmt(result.fee)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
