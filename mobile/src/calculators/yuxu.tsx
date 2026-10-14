import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Mode = "sleep" | "wake";

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function YuxuCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("sleep");
  const [hour, setHour] = useState("23");
  const [minute, setMinute] = useState("00");

  const result = useMemo(() => {
    const h = parseInt(hour) || 0;
    const m = parseInt(minute) || 0;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;

    const totalMins = h * 60 + m;
    const cycleMins = 90;
    const fallAsleep = 15;
    const cycles = [6, 5, 4, 3];

    if (mode === "sleep") {
      return cycles.map((c) => {
        const wakeMins = (totalMins + fallAsleep + c * cycleMins) % 1440;
        const wakeH = Math.floor(wakeMins / 60);
        const wakeM = wakeMins % 60;
        return { cycles: c, time: formatTime(wakeH, wakeM), hours: (c * cycleMins) / 60 };
      });
    } else {
      return cycles.map((c) => {
        let sleepMins = (totalMins - fallAsleep - c * cycleMins) % 1440;
        if (sleepMins < 0) sleepMins += 1440;
        const sleepH = Math.floor(sleepMins / 60);
        const sleepM = sleepMins % 60;
        return { cycles: c, time: formatTime(sleepH, sleepM), hours: (c * cycleMins) / 60 };
      });
    }
  }, [mode, hour, minute]);

  return (
    <View>
      <SegmentControl
        label="Rejim"
        options={[
          { value: "sleep", label: "Yatıram, nə vaxt oyanım?" },
          { value: "wake", label: "Oyanmalıyam, nə vaxt yatım?" },
        ]}
        selected={mode}
        onSelect={setMode}
      />

      <View style={styles.timeRow}>
        <InputField label="Saat" value={hour} onChangeText={setHour} placeholder="23" keyboardType="numeric" />
        <Text style={[styles.colon, { color: colors.n700 }]}>:</Text>
        <InputField label="Dəqiqə" value={minute} onChangeText={setMinute} placeholder="00" keyboardType="numeric" />
      </View>

      {result && (
        <ResultSection title={mode === "sleep" ? "Oyanma vaxtları" : "Yatma vaxtları"}>
          {result.map((r) => (
            <ResultRow
              key={r.cycles}
              label={`${r.cycles} siklus (${r.hours} saat)`}
              value={r.time}
              highlight={r.cycles === 6 || r.cycles === 5}
              bold={r.cycles === 6}
            />
          ))}
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timeRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  colon: { fontSize: 24, fontWeight: "700", paddingBottom: 20 },
});
