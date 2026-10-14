import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

export function SatCalculator() {
  const [reading, setReading] = useState("600");
  const [math, setMath] = useState("600");

  const result = useMemo(() => {
    const r = parseInt(reading) || 0;
    const m = parseInt(math) || 0;
    const total = r + m;
    if (total <= 0) return null;

    let level = "";
    if (total >= 1400) level = "Mükəmməl";
    else if (total >= 1200) level = "Yaxşı";
    else if (total >= 1000) level = "Orta";
    else level = "Aşağı";

    return { total, level };
  }, [reading, math]);

  return (
    <View>
      <InputField label="Reading & Writing (200-800)" value={reading} onChangeText={setReading} placeholder="600" keyboardType="numeric" suffix="/800" />
      <InputField label="Math (200-800)" value={math} onChangeText={setMath} placeholder="600" keyboardType="numeric" suffix="/800" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi bal" value={`${result.total} / 1600`} highlight bold />
          <ResultRow label="Səviyyə" value={result.level} />
        </ResultSection>
      )}
    </View>
  );
}
