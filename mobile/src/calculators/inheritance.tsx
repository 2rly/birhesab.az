import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function InheritanceCalculator() {
  const [totalValue, setTotalValue] = useState("");
  const [heirs, setHeirs] = useState("3");

  const result = useMemo(() => {
    const total = parseFloat(totalValue) || 0;
    const h = parseInt(heirs) || 1;
    if (total <= 0) return null;

    const perHeir = total / h;
    const notaryFee = total * 0.003 + 15;

    return { total, perHeir, notaryFee, heirCount: h };
  }, [totalValue, heirs]);

  return (
    <View>
      <InputField label="Miras dəyəri" value={totalValue} onChangeText={setTotalValue} placeholder="200000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Varis sayı" value={heirs} onChangeText={setHeirs} placeholder="3" keyboardType="numeric" />

      {result && (
        <ResultSection title="Vərəsəlik hesabı">
          <ResultRow label="Ümumi miras" value={fmt(result.total)} />
          <ResultRow label={`Hər varisə (${result.heirCount} nəfər)`} value={fmt(result.perHeir)} highlight bold />
          <ResultRow label="Notarius xərci" value={fmt(result.notaryFee)} />
        </ResultSection>
      )}
    </View>
  );
}
