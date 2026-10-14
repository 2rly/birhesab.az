import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

export function ToeflCalculator() {
  const [reading, setReading] = useState("25");
  const [listening, setListening] = useState("25");
  const [speaking, setSpeaking] = useState("25");
  const [writing, setWriting] = useState("25");

  const result = useMemo(() => {
    const r = parseInt(reading) || 0;
    const l = parseInt(listening) || 0;
    const s = parseInt(speaking) || 0;
    const w = parseInt(writing) || 0;
    const total = r + l + s + w;
    if (total <= 0) return null;

    let level = "";
    if (total >= 110) level = "Mükəmməl";
    else if (total >= 90) level = "Yaxşı";
    else if (total >= 70) level = "Orta";
    else if (total >= 50) level = "Aşağı orta";
    else level = "Zəif";

    return { total, level };
  }, [reading, listening, speaking, writing]);

  return (
    <View>
      <InputField label="Reading (0-30)" value={reading} onChangeText={setReading} placeholder="25" keyboardType="numeric" suffix="/30" />
      <InputField label="Listening (0-30)" value={listening} onChangeText={setListening} placeholder="25" keyboardType="numeric" suffix="/30" />
      <InputField label="Speaking (0-30)" value={speaking} onChangeText={setSpeaking} placeholder="25" keyboardType="numeric" suffix="/30" />
      <InputField label="Writing (0-30)" value={writing} onChangeText={setWriting} placeholder="25" keyboardType="numeric" suffix="/30" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi bal" value={`${result.total} / 120`} highlight bold />
          <ResultRow label="Səviyyə" value={result.level} />
        </ResultSection>
      )}
    </View>
  );
}
