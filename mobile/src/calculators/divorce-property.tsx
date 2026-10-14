import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type DivisionType = "equal" | "custom";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DivorcePropertyCalculator() {
  const [type, setType] = useState<DivisionType>("equal");
  const [totalProperty, setTotalProperty] = useState("");
  const [spouseShare, setSpouseShare] = useState("50");

  const result = useMemo(() => {
    const total = parseFloat(totalProperty) || 0;
    if (total <= 0) return null;

    const share = type === "equal" ? 50 : parseFloat(spouseShare) || 50;
    const spouse1 = total * (share / 100);
    const spouse2 = total - spouse1;

    return { total, spouse1, spouse2, share };
  }, [type, totalProperty, spouseShare]);

  return (
    <View>
      <SegmentControl
        label="Bölgü növü"
        options={[
          { value: "equal", label: "Bərabər (50/50)" },
          { value: "custom", label: "Xüsusi faiz" },
        ]}
        selected={type}
        onSelect={setType}
      />
      <InputField label="Ümumi əmlak dəyəri" value={totalProperty} onChangeText={setTotalProperty} placeholder="200000" keyboardType="decimal-pad" suffix="₼" />
      {type === "custom" && (
        <InputField label="Tərəf 1 payı (%)" value={spouseShare} onChangeText={setSpouseShare} placeholder="50" keyboardType="decimal-pad" suffix="%" />
      )}

      {result && (
        <ResultSection title="Əmlak bölgüsü">
          <ResultRow label="Ümumi dəyər" value={fmt(result.total)} />
          <ResultRow label={`Tərəf 1 (${result.share}%)`} value={fmt(result.spouse1)} highlight bold />
          <ResultRow label={`Tərəf 2 (${100 - result.share}%)`} value={fmt(result.spouse2)} bold />
        </ResultSection>
      )}
    </View>
  );
}
