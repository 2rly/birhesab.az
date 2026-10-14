import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type ChildCount = "1" | "2" | "3";

const RATES: Record<ChildCount, number> = {
  "1": 0.25,
  "2": 0.33,
  "3": 0.50,
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function AlimentCalculator() {
  const [salary, setSalary] = useState("1000");
  const [children, setChildren] = useState<ChildCount>("1");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    if (s <= 0) return null;

    const rate = RATES[children];
    const totalAliment = s * rate;
    const childCount = parseInt(children);
    const perChild = totalAliment / childCount;
    const remaining = s - totalAliment;

    return { totalAliment, perChild, remaining, rate, childCount };
  }, [salary, children]);

  return (
    <View>
      <InputField
        label="Net əmək haqqı"
        value={salary}
        onChangeText={setSalary}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      <SegmentControl
        label="Uşaq sayı"
        options={[
          { value: "1", label: "1 uşaq (25%)" },
          { value: "2", label: "2 uşaq (33%)" },
          { value: "3", label: "3+ uşaq (50%)" },
        ]}
        selected={children}
        onSelect={setChildren}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Aliment faizi"
            value={`${(result.rate * 100).toFixed(0)}%`}
          />
          {result.childCount > 1 && (
            <ResultRow
              label="Hər uşağa"
              value={fmt(result.perChild)}
            />
          )}
          <ResultRow
            label="Ümumi aliment"
            value={fmt(result.totalAliment)}
            highlight
            bold
          />
          <ResultRow
            label="Əlinizdə qalan"
            value={fmt(result.remaining)}
          />
        </ResultSection>
      )}
    </View>
  );
}
