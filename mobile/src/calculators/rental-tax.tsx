import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Method = "simplified" | "standard";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function RentalTaxCalculator() {
  const [method, setMethod] = useState<Method>("simplified");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");

  const result = useMemo(() => {
    const inc = parseFloat(income) || 0;
    if (inc <= 0) return null;

    const exp = parseFloat(expenses) || 0;

    const simplifiedTax = inc <= 2000 ? inc * 0.04 : 2000 * 0.04 + (inc - 2000) * 0.08;
    const simplifiedNet = inc - simplifiedTax;

    const standardProfit = Math.max(0, inc - exp);
    const standardTax = standardProfit * 0.14;
    const standardNet = inc - exp - standardTax;

    return {
      simplifiedTax, simplifiedNet,
      standardTax, standardNet, standardProfit,
      saving: simplifiedTax < standardTax ? standardTax - simplifiedTax : simplifiedTax - standardTax,
      bestMethod: simplifiedTax <= standardTax ? "simplified" : "standard",
    };
  }, [income, expenses]);

  return (
    <View>
      <SegmentControl
        label="Vergi üsulu"
        options={[
          { value: "simplified", label: "Sadələşdirilmiş" },
          { value: "standard", label: "Standart (14%)" },
        ]}
        selected={method}
        onSelect={setMethod}
      />
      <InputField label="Aylıq kirayə gəliri" value={income} onChangeText={setIncome} placeholder="1500" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Aylıq xərclər (standart üsul üçün)" value={expenses} onChangeText={setExpenses} placeholder="200" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <>
          <ResultSection title="Sadələşdirilmiş üsul">
            <ResultRow label="Vergi" value={fmt(result.simplifiedTax)} highlight={result.bestMethod === "simplified"} bold={result.bestMethod === "simplified"} />
            <ResultRow label="Xalis gəlir" value={fmt(result.simplifiedNet)} />
          </ResultSection>
          <ResultSection title="Standart üsul (14%)">
            <ResultRow label="Mənfəət" value={fmt(result.standardProfit)} />
            <ResultRow label="Vergi" value={fmt(result.standardTax)} highlight={result.bestMethod === "standard"} bold={result.bestMethod === "standard"} />
            <ResultRow label="Xalis gəlir" value={fmt(result.standardNet)} />
          </ResultSection>
          <ResultSection title="Müqayisə">
            <ResultRow label="Sərfəli üsul" value={result.bestMethod === "simplified" ? "Sadələşdirilmiş" : "Standart"} bold />
            <ResultRow label="Qənaət (aylıq)" value={fmt(result.saving)} />
          </ResultSection>
        </>
      )}
    </View>
  );
}
