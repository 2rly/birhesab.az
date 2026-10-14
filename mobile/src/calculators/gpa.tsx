import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function scoreToGpa(score: number): { gpa: number; letter: string; label: string } {
  if (score >= 91) return { gpa: 4.0, letter: "A", label: "Əla" };
  if (score >= 81) return { gpa: 3.0 + ((score - 81) / 9), letter: "B", label: "Yaxşı" };
  if (score >= 71) return { gpa: 2.0 + ((score - 71) / 9), letter: "C", label: "Kafi" };
  if (score >= 51) return { gpa: 1.0 + ((score - 51) / 19), letter: "D", label: "Zəif" };
  return { gpa: 0, letter: "F", label: "Kəsilmə" };
}

function getColor(letter: string): string {
  switch (letter) {
    case "A": return "#22c55e";
    case "B": return "#3b82f6";
    case "C": return "#f59e0b";
    case "D": return "#f97316";
    default: return "#ef4444";
  }
}

export function GpaCalculator() {
  const { colors } = useTheme();
  const [score, setScore] = useState("85");

  const result = useMemo(() => {
    const s = parseInt(score) || 0;
    if (s < 0 || s > 100) return null;
    return scoreToGpa(s);
  }, [score]);

  return (
    <View>
      <InputField
        label="Bal (0–100)"
        value={score}
        onChangeText={setScore}
        placeholder="85"
        keyboardType="numeric"
        suffix="bal"
      />

      {result && (
        <>
          <View style={[styles.gpaResult, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.gpaValue, { color: colors.n960 }]}>
              {result.gpa.toFixed(2)}
            </Text>
            <Text style={[styles.gpaLetter, { color: getColor(result.letter) }]}>
              {result.letter} — {result.label}
            </Text>
          </View>

          <ResultSection title="Şkala">
            <ResultRow label="91–100" value="4.0 (A) — Əla" />
            <ResultRow label="81–90" value="3.0–3.9 (B) — Yaxşı" />
            <ResultRow label="71–80" value="2.0–2.9 (C) — Kafi" />
            <ResultRow label="51–70" value="1.0–1.9 (D) — Zəif" />
            <ResultRow label="0–50" value="0 (F) — Kəsilmə" />
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gpaResult: {
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  gpaValue: { fontSize: 48, fontWeight: "800" },
  gpaLetter: { fontSize: 16, fontWeight: "600", marginTop: 4 },
});
