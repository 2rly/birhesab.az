import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const ZONES = [
  { name: "Bakı", offset: 4 },
  { name: "İstanbul", offset: 3 },
  { name: "Moskva", offset: 3 },
  { name: "London", offset: 0 },
  { name: "Berlin", offset: 1 },
  { name: "Nyu-York", offset: -5 },
  { name: "Los-Anceles", offset: -8 },
  { name: "Dubay", offset: 4 },
  { name: "Tokyo", offset: 9 },
  { name: "Pekin", offset: 8 },
];

function fmtTime(h: number, m: number): string {
  const hh = ((h % 24) + 24) % 24;
  return `${hh.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function TimezoneCalculator() {
  const { colors } = useTheme();
  const [fromIdx, setFromIdx] = useState(0);
  const [timeInput, setTimeInput] = useState("");

  const result = useMemo(() => {
    const match = timeInput.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (h > 23 || m > 59) return null;

    const fromOffset = ZONES[fromIdx].offset;
    const converted = ZONES.map((z) => ({
      name: z.name,
      time: fmtTime(h + (z.offset - fromOffset), m),
      diff: z.offset - fromOffset,
    }));

    return { converted };
  }, [fromIdx, timeInput]);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Şəhər seçin</Text>
      <View style={styles.chipRow}>
        {ZONES.map((z, i) => (
          <Pressable
            key={z.name}
            style={[styles.chip, { backgroundColor: colors.n240 }, fromIdx === i && { backgroundColor: colors.accent }]}
            onPress={() => setFromIdx(i)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, fromIdx === i && { color: colors.onAccent }]}>{z.name}</Text>
          </Pressable>
        ))}
      </View>
      <InputField label={`Vaxt (${ZONES[fromIdx].name})`} value={timeInput} onChangeText={setTimeInput} placeholder="14:00" />

      {result && (
        <ResultSection title="Digər şəhərlərdə vaxt">
          {result.converted.map((c) => (
            <ResultRow key={c.name} label={c.name} value={c.time} highlight={c.diff === 0} bold={c.diff === 0} />
          ))}
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: "600" },
});
