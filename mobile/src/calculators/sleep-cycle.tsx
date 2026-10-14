import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Mode = "wakeup" | "sleep";

function parseTime(s: string): { h: number; m: number } | null {
  const match = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1]);
  const m = parseInt(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

function fmtTime(totalMin: number): string {
  let m = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

const FALL_ASLEEP_MIN = 14;
const CYCLE_MIN = 90;

export function SleepCycleCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("wakeup");
  const [timeInput, setTimeInput] = useState("");

  const result = useMemo(() => {
    const parsed = parseTime(timeInput);
    if (!parsed) return null;

    const baseMin = parsed.h * 60 + parsed.m;
    const options: { time: string; cycles: number; duration: string; optimal: boolean }[] = [];

    if (mode === "wakeup") {
      for (let cycles = 6; cycles >= 3; cycles--) {
        const sleepMin = cycles * CYCLE_MIN + FALL_ASLEEP_MIN;
        const bedtimeMin = baseMin - sleepMin;
        const hours = Math.floor((cycles * CYCLE_MIN) / 60);
        const mins = (cycles * CYCLE_MIN) % 60;
        options.push({
          time: fmtTime(bedtimeMin),
          cycles,
          duration: mins > 0 ? `${hours} saat ${mins} dəq` : `${hours} saat`,
          optimal: cycles === 5,
        });
      }
    } else {
      for (let cycles = 3; cycles <= 6; cycles++) {
        const sleepMin = cycles * CYCLE_MIN + FALL_ASLEEP_MIN;
        const wakeMin = baseMin + sleepMin;
        const hours = Math.floor((cycles * CYCLE_MIN) / 60);
        const mins = (cycles * CYCLE_MIN) % 60;
        options.push({
          time: fmtTime(wakeMin),
          cycles,
          duration: mins > 0 ? `${hours} saat ${mins} dəq` : `${hours} saat`,
          optimal: cycles === 5,
        });
      }
    }

    return { options };
  }, [mode, timeInput]);

  return (
    <View>
      <SegmentControl
        label="Rejim"
        options={[
          { value: "wakeup", label: "Oyanmaq istəyirəm" },
          { value: "sleep", label: "Yatmaq istəyirəm" },
        ]}
        selected={mode}
        onSelect={setMode}
      />
      <InputField
        label={mode === "wakeup" ? "Oyanma vaxtı" : "Yatma vaxtı"}
        value={timeInput}
        onChangeText={setTimeInput}
        placeholder="07:00"
      />
      <View style={[styles.note, { backgroundColor: colors.n240 }]}>
        <Text style={[styles.noteText, { color: colors.n580 }]}>
          Hər yuxu dövrü ~90 dəqiqədir. Yuxuya getmək üçün orta hesabla 14 dəqiqə lazımdır.
        </Text>
      </View>

      {result && (
        <ResultSection title={mode === "wakeup" ? "Yatma vaxtları" : "Oyanma vaxtları"}>
          {result.options.map((opt) => (
            <ResultRow
              key={opt.cycles}
              label={`${opt.cycles} dövr — ${opt.duration}`}
              value={opt.time}
              highlight={opt.optimal}
              bold={opt.optimal}
            />
          ))}
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { borderRadius: 10, padding: 12, marginBottom: 16 },
  noteText: { fontSize: 12, lineHeight: 18 },
});
