import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/theme";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const BANDS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

function roundIELTS(avg: number): number {
  const floor = Math.floor(avg);
  const frac = avg - floor;
  if (frac < 0.25) return floor;
  if (frac < 0.75) return floor + 0.5;
  return floor + 1;
}

function getLevel(band: number): string {
  if (band >= 9) return "Expert — Tam sərbəst istifadəçi";
  if (band >= 8) return "Çox yaxşı — Yüksək səviyyə";
  if (band >= 7) return "Yaxşı — Effektiv istifadəçi";
  if (band >= 6) return "Kafi — Kompetent istifadəçi";
  if (band >= 5) return "Orta — Məhdud istifadəçi";
  if (band >= 4) return "Məhdud — Çox məhdud";
  return "Zəif — Başlanğıc səviyyə";
}

function BandPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.pickerContainer}>
      <Text style={[styles.pickerLabel, { color: colors.n700 }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {BANDS.map((b) => {
            const active = value === b;
            return (
              <Pressable
                key={b}
                style={[
                  styles.chip,
                  { backgroundColor: colors.n240 },
                  active && { backgroundColor: colors.accent },
                ]}
                onPress={() => onChange(b)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.n580 },
                    active && { color: colors.onAccent },
                  ]}
                >
                  {b.toFixed(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export function IeltsCalculator() {
  const { colors } = useTheme();
  const [listening, setListening] = useState(6.5);
  const [reading, setReading] = useState(6.5);
  const [writing, setWriting] = useState(6);
  const [speaking, setSpeaking] = useState(6);

  const result = useMemo(() => {
    const avg = (listening + reading + writing + speaking) / 4;
    const overall = roundIELTS(avg);
    return { overall, level: getLevel(overall), avg };
  }, [listening, reading, writing, speaking]);

  return (
    <View>
      <BandPicker label="Listening" value={listening} onChange={setListening} />
      <BandPicker label="Reading" value={reading} onChange={setReading} />
      <BandPicker label="Writing" value={writing} onChange={setWriting} />
      <BandPicker label="Speaking" value={speaking} onChange={setSpeaking} />

      <View style={[styles.overallBox, { backgroundColor: colors.n240 }]}>
        <Text style={[styles.overallLabel, { color: colors.n580 }]}>
          Overall Band Score
        </Text>
        <Text style={[styles.overallValue, { color: colors.accent }]}>
          {result.overall.toFixed(1)}
        </Text>
        <Text style={[styles.levelText, { color: colors.n700 }]}>
          {result.level}
        </Text>
      </View>

      <ResultSection title="Ətraflı">
        <ResultRow label="Listening" value={listening.toFixed(1)} />
        <ResultRow label="Reading" value={reading.toFixed(1)} />
        <ResultRow label="Writing" value={writing.toFixed(1)} />
        <ResultRow label="Speaking" value={speaking.toFixed(1)} />
        <ResultRow label="Ortalama" value={result.avg.toFixed(2)} />
        <ResultRow
          label="Overall Band"
          value={result.overall.toFixed(1)}
          highlight
          bold
        />
      </ResultSection>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: { marginBottom: 16 },
  pickerLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  chipRow: { flexDirection: "row", gap: 6, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  overallBox: {
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  overallLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  overallValue: { fontSize: 52, fontWeight: "800" },
  levelText: { fontSize: 14, fontWeight: "500", marginTop: 4 },
});
