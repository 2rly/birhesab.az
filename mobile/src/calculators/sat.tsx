import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function getLevel(total: number): string {
  if (total >= 1400) return "Əla";
  if (total >= 1200) return "Yaxşı";
  if (total >= 1000) return "Orta";
  return "Aşağı";
}

export function SatCalculator() {
  const [reading, setReading] = useState("");
  const [math, setMath] = useState("");

  const result = useMemo(() => {
    const r = parseInt(reading) || 0;
    const m = parseInt(math) || 0;
    if (r === 0 && m === 0) return null;

    const rClamped = Math.min(Math.max(r, 200), 800);
    const mClamped = Math.min(Math.max(m, 200), 800);
    const total = rClamped + mClamped;
    const level = getLevel(total);

    return { reading: rClamped, math: mClamped, total, level };
  }, [reading, math]);

  return (
    <View>
      <InputField label="Reading & Writing (200-800)" value={reading} onChangeText={setReading} placeholder="600" keyboardType="numeric" />
      <InputField label="Math (200-800)" value={math} onChangeText={setMath} placeholder="650" keyboardType="numeric" />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow label="Ümumi bal" value={`${result.total} / 1600`} highlight bold />
            <ResultRow label="Səviyyə" value={result.level} />
          </ResultSection>
          <ResultSection title="Bölmələr">
            <ResultRow label="Reading & Writing" value={`${result.reading} / 800`} />
            <ResultRow label="Math" value={`${result.math} / 800`} />
          </ResultSection>
          <ResultSection title="Universitet tələbləri">
            <ResultRow label="Ivy League" value="1500+" />
            <ResultRow label="Top 50" value="1300-1500" />
            <ResultRow label="Top 100" value="1100-1300" />
          </ResultSection>
        </>
      )}
    </View>
  );
}
