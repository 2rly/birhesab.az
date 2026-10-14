import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Group = "1" | "2" | "3";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

const BASE_AMOUNTS: Record<Group, number> = {
  "1": 260,
  "2": 220,
  "3": 180,
};

export function DisabilityCalculator() {
  const [group, setGroup] = useState<Group>("2");
  const [dependents, setDependents] = useState("");

  const result = useMemo(() => {
    const dep = parseInt(dependents) || 0;
    const base = BASE_AMOUNTS[group];
    const dependentAdd = dep * 30;
    const total = base + dependentAdd;

    return { base, dependentAdd, total };
  }, [group, dependents]);

  return (
    <View>
      <SegmentControl
        label="Əlillik qrupu"
        options={[
          { value: "1", label: "I qrup" },
          { value: "2", label: "II qrup" },
          { value: "3", label: "III qrup" },
        ]}
        selected={group}
        onSelect={setGroup}
      />
      <InputField label="Himayəsindəki şəxs sayı" value={dependents} onChangeText={setDependents} placeholder="0" keyboardType="numeric" />

      <ResultSection title="Əlillik müavinəti">
        <ResultRow label="Baza məbləğ" value={fmt(result.base)} />
        {result.dependentAdd > 0 && <ResultRow label="Himayə əlavəsi" value={fmt(result.dependentAdd)} />}
        <ResultRow label="Aylıq müavinət" value={fmt(result.total)} highlight bold />
      </ResultSection>
    </View>
  );
}
