import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function ZakatCalculator() {
  const [members, setMembers] = useState("4");

  const result = useMemo(() => {
    const m = parseInt(members) || 0;
    if (m <= 0) return null;

    const perPerson = 15;
    const total = perPerson * m;

    return { perPerson, total, members: m };
  }, [members]);

  return (
    <View>
      <InputField label="Ailə üzvü sayı" value={members} onChangeText={setMembers} placeholder="4" keyboardType="numeric" suffix="nəfər" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Hər nəfər üçün" value={fmt(result.perPerson)} />
          <ResultRow label="Ailə üzvü sayı" value={`${result.members} nəfər`} />
          <ResultRow label="Ümumi fitrə zəkatı" value={fmt(result.total)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
