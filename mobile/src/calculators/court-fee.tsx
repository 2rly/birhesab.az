import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type ClaimType = "property" | "non-property" | "divorce" | "appeal";
type PersonType = "individual" | "legal";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function CourtFeeCalculator() {
  const [claimType, setClaimType] = useState<ClaimType>("property");
  const [claimAmount, setClaimAmount] = useState("10000");
  const [personType, setPersonType] = useState<PersonType>("individual");
  const [firstInstanceFee, setFirstInstanceFee] = useState("100");

  const result = useMemo(() => {
    if (claimType === "property") {
      const amount = parseFloat(claimAmount) || 0;
      if (amount <= 0) return null;
      const fee = Math.max(amount * 0.01, 10);
      return { fee, description: `İddia məbləğinin 1%-i (min. 10 ₼)` };
    }
    if (claimType === "non-property") {
      const fee = personType === "individual" ? 20 : 50;
      return { fee, description: personType === "individual" ? "Fiziki şəxs: 20 ₼" : "Hüquqi şəxs: 50 ₼" };
    }
    if (claimType === "divorce") {
      return { fee: 20, description: "Boşanma işi: 20 ₼" };
    }
    if (claimType === "appeal") {
      const firstFee = parseFloat(firstInstanceFee) || 0;
      if (firstFee <= 0) return null;
      return { fee: firstFee * 0.5, description: "İlk instansiya rüsumunun 50%-i" };
    }
    return null;
  }, [claimType, claimAmount, personType, firstInstanceFee]);

  return (
    <View>
      <SegmentControl
        label="İddia növü"
        options={[
          { value: "property", label: "Əmlak" },
          { value: "non-property", label: "Qeyri-əmlak" },
          { value: "divorce", label: "Boşanma" },
          { value: "appeal", label: "Apellyasiya" },
        ]}
        selected={claimType}
        onSelect={setClaimType}
      />

      {claimType === "property" && (
        <InputField
          label="İddia məbləği"
          value={claimAmount}
          onChangeText={setClaimAmount}
          placeholder="10000"
          keyboardType="decimal-pad"
          suffix="₼"
        />
      )}

      {claimType === "non-property" && (
        <SegmentControl
          label="Müraciət edən"
          options={[
            { value: "individual", label: "Fiziki şəxs" },
            { value: "legal", label: "Hüquqi şəxs" },
          ]}
          selected={personType}
          onSelect={setPersonType}
        />
      )}

      {claimType === "appeal" && (
        <InputField
          label="İlk instansiya rüsumu"
          value={firstInstanceFee}
          onChangeText={setFirstInstanceFee}
          placeholder="100"
          keyboardType="decimal-pad"
          suffix="₼"
        />
      )}

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Məhkəmə rüsumu" value={fmt(result.fee)} highlight bold />
          <ResultRow label="Hesablama" value={result.description} />
        </ResultSection>
      )}
    </View>
  );
}
