import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function RamazanCalculator() {
  const [familySize, setFamilySize] = useState("4");

  const result = useMemo(() => {
    const size = parseInt(familySize) || 0;
    if (size <= 0) return null;

    const fitraPerPerson = 15;
    const totalFitra = fitraPerPerson * size;

    return { fitraPerPerson, totalFitra, familySize: size };
  }, [familySize]);

  return (
    <View>
      <InputField label="Ailə üzvlərinin sayı" value={familySize} onChangeText={setFamilySize} placeholder="4" keyboardType="numeric" />

      {result && (
        <ResultSection title="Fitrə hesabı">
          <ResultRow label="Hər nəfərə fitrə" value={fmt(result.fitraPerPerson)} />
          <ResultRow label={`Ümumi fitrə (${result.familySize} nəfər)`} value={fmt(result.totalFitra)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
