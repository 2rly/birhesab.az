import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Mode = "pof" | "wpt" | "chg" | "inc" | "dec";

export function PercentageCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("pof");
  const [a, setA] = useState("25");
  const [b, setB] = useState("200");

  const config: Record<Mode, { labelA: string; labelB: string; suffA: string; suffB: string }> = {
    pof: { labelA: "Faiz", labelB: "Ədəd", suffA: "%", suffB: "" },
    wpt: { labelA: "Hissə", labelB: "Tam", suffA: "", suffB: "" },
    chg: { labelA: "Köhnə dəyər", labelB: "Yeni dəyər", suffA: "", suffB: "" },
    inc: { labelA: "Ədəd", labelB: "Artım faizi", suffA: "", suffB: "%" },
    dec: { labelA: "Ədəd", labelB: "Azalma faizi", suffA: "", suffB: "%" },
  };

  const result = useMemo(() => {
    const va = parseFloat(a) || 0;
    const vb = parseFloat(b) || 0;
    if (va === 0 && vb === 0) return null;

    switch (mode) {
      case "pof": {
        const r = (va / 100) * vb;
        return { value: r.toFixed(2), formula: `${va}% × ${vb} = ${r.toFixed(2)}` };
      }
      case "wpt": {
        if (vb === 0) return null;
        const r = (va / vb) * 100;
        return { value: r.toFixed(2) + "%", formula: `${va} / ${vb} × 100 = ${r.toFixed(2)}%` };
      }
      case "chg": {
        if (va === 0) return null;
        const r = ((vb - va) / Math.abs(va)) * 100;
        return { value: r.toFixed(2) + "%", formula: `(${vb} − ${va}) / |${va}| × 100 = ${r.toFixed(2)}%` };
      }
      case "inc": {
        const r = va * (1 + vb / 100);
        return { value: r.toFixed(2), formula: `${va} × (1 + ${vb}%) = ${r.toFixed(2)}` };
      }
      case "dec": {
        const r = va * (1 - vb / 100);
        return { value: r.toFixed(2), formula: `${va} × (1 − ${vb}%) = ${r.toFixed(2)}` };
      }
    }
  }, [mode, a, b]);

  const c = config[mode];

  return (
    <View>
      <SegmentControl
        label="Hesablama növü"
        options={[
          { value: "pof" as Mode, label: "X% of Y" },
          { value: "wpt" as Mode, label: "Neçə %?" },
          { value: "chg" as Mode, label: "Dəyişim" },
        ]}
        selected={mode}
        onSelect={setMode}
      />
      {(mode === "inc" || mode === "dec") ? null : null}
      <View style={styles.row2}>
        <SegmentControl
          options={[
            { value: "inc" as Mode, label: "Artır" },
            { value: "dec" as Mode, label: "Azalt" },
          ]}
          selected={mode === "inc" || mode === "dec" ? mode : "inc"}
          onSelect={(v) => { if (mode !== "pof" && mode !== "wpt" && mode !== "chg") setMode(v); }}
        />
      </View>

      <InputField
        label={c.labelA}
        value={a}
        onChangeText={setA}
        placeholder="0"
        keyboardType="decimal-pad"
        suffix={c.suffA || undefined}
      />
      <InputField
        label={c.labelB}
        value={b}
        onChangeText={setB}
        placeholder="0"
        keyboardType="decimal-pad"
        suffix={c.suffB || undefined}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Cavab" value={result.value} highlight bold />
          <ResultRow label="Formula" value={result.formula} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row2: { marginBottom: 8 },
});
