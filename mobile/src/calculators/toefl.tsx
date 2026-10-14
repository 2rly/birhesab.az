import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function getLevel(total: number): string {
  if (total >= 100) return "Əla";
  if (total >= 80) return "Yaxşı";
  if (total >= 60) return "Orta";
  return "Aşağı";
}

export function ToeflCalculator() {
  const [reading, setReading] = useState("");
  const [listening, setListening] = useState("");
  const [speaking, setSpeaking] = useState("");
  const [writing, setWriting] = useState("");

  const result = useMemo(() => {
    const r = parseInt(reading) || 0;
    const l = parseInt(listening) || 0;
    const s = parseInt(speaking) || 0;
    const w = parseInt(writing) || 0;
    if (r === 0 && l === 0 && s === 0 && w === 0) return null;

    const total = Math.min(r, 30) + Math.min(l, 30) + Math.min(s, 30) + Math.min(w, 30);
    const level = getLevel(total);

    return { r: Math.min(r, 30), l: Math.min(l, 30), s: Math.min(s, 30), w: Math.min(w, 30), total, level };
  }, [reading, listening, speaking, writing]);

  return (
    <View>
      <InputField label="Reading (0-30)" value={reading} onChangeText={setReading} placeholder="25" keyboardType="numeric" />
      <InputField label="Listening (0-30)" value={listening} onChangeText={setListening} placeholder="25" keyboardType="numeric" />
      <InputField label="Speaking (0-30)" value={speaking} onChangeText={setSpeaking} placeholder="23" keyboardType="numeric" />
      <InputField label="Writing (0-30)" value={writing} onChangeText={setWriting} placeholder="24" keyboardType="numeric" />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow label="Ümumi bal" value={`${result.total} / 120`} highlight bold />
            <ResultRow label="Səviyyə" value={result.level} />
          </ResultSection>
          <ResultSection title="Bölmələr">
            <ResultRow label="Reading" value={`${result.r} / 30`} />
            <ResultRow label="Listening" value={`${result.l} / 30`} />
            <ResultRow label="Speaking" value={`${result.s} / 30`} />
            <ResultRow label="Writing" value={`${result.w} / 30`} />
          </ResultSection>
          <ResultSection title="Universitet tələbləri">
            <ResultRow label="Top universitetlər" value="100+" />
            <ResultRow label="Yaxşı universitetlər" value="80-99" />
            <ResultRow label="Orta universitetlər" value="60-79" />
          </ResultSection>
        </>
      )}
    </View>
  );
}
