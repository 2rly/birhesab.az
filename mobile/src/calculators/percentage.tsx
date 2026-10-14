import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Mode = "basic" | "reverse" | "change";

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("basic");
  const [valueA, setValueA] = useState("");
  const [valueB, setValueB] = useState("");

  const result = useMemo(() => {
    const a = parseFloat(valueA);
    const b = parseFloat(valueB);
    if (!a && a !== 0) return null;
    if (!b && b !== 0) return null;

    switch (mode) {
      case "basic": {
        if (b === 0) return null;
        const res = a * (b / 100);
        return { label: `${a}-in ${b}%-i`, value: res.toFixed(2) };
      }
      case "reverse": {
        if (b === 0) return null;
        const res = (a / b) * 100;
        return { label: `${a}, ${b}-in faizi`, value: `${res.toFixed(2)}%` };
      }
      case "change": {
        if (a === 0) return null;
        const res = ((b - a) / Math.abs(a)) * 100;
        return { label: `${a}-dən ${b}-ə dəyişiklik`, value: `${res >= 0 ? "+" : ""}${res.toFixed(2)}%` };
      }
    }
  }, [mode, valueA, valueB]);

  const labels: Record<Mode, [string, string]> = {
    basic: ["Ədəd", "Faiz (%)"],
    reverse: ["Hissə", "Tam ədəd"],
    change: ["Əvvəlki dəyər", "Yeni dəyər"],
  };

  return (
    <View>
      <SegmentControl
        label="Hesablama növü"
        options={[
          { value: "basic", label: "%-i neçədir?" },
          { value: "reverse", label: "Neçə %?" },
          { value: "change", label: "% dəyişiklik" },
        ]}
        selected={mode}
        onSelect={(v) => { setMode(v); setValueA(""); setValueB(""); }}
      />
      <InputField label={labels[mode][0]} value={valueA} onChangeText={setValueA} placeholder="100" keyboardType="decimal-pad" />
      <InputField label={labels[mode][1]} value={valueB} onChangeText={setValueB} placeholder={mode === "basic" ? "25" : "200"} keyboardType="decimal-pad" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label={result.label} value={result.value} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
