import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { TimeInput, Caption } from "./_health-parts";

const FALL_ASLEEP_MINUTES = 14;
const CYCLE_MINUTES = 90;

type Mode = "wakeup" | "sleepNow" | "sleepAt";

const MODE_LABELS: Record<Mode, string> = {
  wakeup: "⏰ Konkret saatda oyanmaq istəyirəm",
  sleepNow: "🛏️ İndi yatsam, neçədə oyanım?",
  sleepAt: "🌙 Konkret saatda yatacam",
};

const FORMULA_TITLE = "Yuxu dövrü necə işləyir?";
const FORMULA_CONTENT = `İnsan yuxusu orta hesabla 90 dəqiqəlik fazalardan (siklus) ibarətdir. Hər siklus 4-5 mərhələni əhatə edir: yüngül yuxu → dərin yuxu → REM (yuxu görmə).

Düstur:
• Yatma vaxtı = İndi + 14 dəq (yuxuya getmə müddəti)
• Hər oyanma vaxtı = Yatma vaxtı + (90 dəq × N siklus)

Optimal yuxu: 5 və ya 6 siklus (7.5 saat və ya 9 saat).

Nümunə: əgər saat 23:00-da yatağa girsəniz:
• 06:30-da oyansanız (5 siklus = 7.5 saat) — gümrah
• 08:00-da oyansanız (6 siklus = 9 saat) — çox gümrah

Yuxunun ortasında (məsələn 4 siklus + 30 dəq) oyanmaq sizi yorğun edir.`;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} saat` : `${h} saat ${m} dəq`;
}

interface SleepOption {
  time: Date;
  cycles: number;
  duration: number;
  quality: "ideal" | "good" | "short";
  recommended: boolean;
}

const QUALITY: Record<SleepOption["quality"], { label: string; color: string }> = {
  ideal: { label: "İdeal", color: "#16a34a" },
  good: { label: "Yaxşı", color: "#2563eb" },
  short: { label: "Qısa", color: "#6b7280" },
};

export function SleepCycleCalculator() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("wakeup");
  const [now] = useState<Date>(() => new Date());
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [nowTime, setNowTime] = useState(() => formatTime(new Date()));

  const options: SleepOption[] = useMemo(() => {
    if (mode === "sleepNow" && !nowTime) return [];

    const parseTimeOf = (s: string, futureIfPast: boolean): Date => {
      const [h, m] = s.split(":").map(Number);
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      if (futureIfPast && d <= now) d.setDate(d.getDate() + 1);
      return d;
    };

    const quality = (cycles: number): SleepOption["quality"] =>
      cycles === 5 || cycles === 6 ? "ideal" : cycles === 4 ? "good" : "short";

    if (mode === "wakeup") {
      const wake = parseTimeOf(wakeTime, true);
      const result: SleepOption[] = [];
      for (let cycles = 1; cycles <= 6; cycles++) {
        const totalMin = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
        result.push({
          time: new Date(wake.getTime() - totalMin * 60000),
          cycles,
          duration: cycles * CYCLE_MINUTES,
          quality: quality(cycles),
          recommended: cycles === 5 || cycles === 6,
        });
      }
      return result.reverse();
    }

    const start = mode === "sleepNow" ? parseTimeOf(nowTime, false) : parseTimeOf(sleepTime, false);
    const sleepStart = new Date(start.getTime() + FALL_ASLEEP_MINUTES * 60000);
    const result: SleepOption[] = [];
    for (let cycles = 1; cycles <= 6; cycles++) {
      result.push({
        time: new Date(sleepStart.getTime() + cycles * CYCLE_MINUTES * 60000),
        cycles,
        duration: cycles * CYCLE_MINUTES,
        quality: quality(cycles),
        recommended: cycles === 5 || cycles === 6,
      });
    }
    return result;
  }, [mode, wakeTime, sleepTime, now, nowTime]);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Hesablama növü</Text>
      <View style={{ gap: 8, marginBottom: 18 }}>
        {(["wakeup", "sleepNow", "sleepAt"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[
                styles.modeBtn,
                {
                  backgroundColor: active ? colors.accent + "22" : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                },
              ]}
            >
              <Text style={[styles.modeText, { color: active ? colors.accent : colors.n940, fontWeight: active ? "700" : "500" }]}>
                {MODE_LABELS[m]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "wakeup" && (
        <TimeInput label="Hansı saatda oyanmaq istəyirsiniz?" value={wakeTime} onChange={setWakeTime} />
      )}
      {mode === "sleepAt" && <TimeInput label="Hansı saatda yatacaqsınız?" value={sleepTime} onChange={setSleepTime} />}
      {mode === "sleepNow" && (
        <View>
          <TimeInput label="🕐 Hazırda" value={nowTime} onChange={setNowTime} />
          <View style={styles.nowRow}>
            <View style={{ flex: 1 }}>
              <Caption>Yuxuya getmə müddəti: 14 dəqiqə nəzərə alınır</Caption>
            </View>
            <Pressable onPress={() => setNowTime(formatTime(now))} hitSlop={8}>
              <Text style={[styles.refresh, { color: colors.accent }]}>↻ {formatTime(now)}</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={[styles.resultsTitle, { color: colors.n940 }]}>
        {mode === "sleepNow" ? "🌙 Əgər indi yatsanız:" : "✨ Tövsiyə olunan vaxtlar"}
      </Text>
      <View style={{ gap: 8 }}>
        {options.map((opt) => {
          const q = QUALITY[opt.quality];
          return (
            <View
              key={opt.cycles}
              style={[
                styles.option,
                { backgroundColor: q.color + "14", borderColor: opt.recommended ? q.color : q.color + "55" },
                opt.recommended && { borderWidth: 2.5 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.timeRow}>
                  <Text style={[styles.time, { color: q.color }]}>{formatTime(opt.time)}</Text>
                  {opt.recommended && (
                    <View style={[styles.badge, { backgroundColor: q.color }]}>
                      <Text style={styles.badgeText}>⭐ Tövsiyə</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.meta, { color: colors.n760 }]}>
                  {opt.cycles} siklus • {formatDuration(opt.duration)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.meta, { color: colors.n580 }]}>Keyfiyyət</Text>
                <Text style={[styles.quality, { color: q.color }]}>{q.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["bmi", "ideal-ceki", "yas"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  modeBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  modeText: { fontSize: 14 },
  nowRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: -8, marginBottom: 16 },
  refresh: { fontSize: 12, fontWeight: "700" },
  resultsTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10, marginTop: 4 },
  option: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, padding: 14, gap: 10 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  time: { fontSize: 26, fontWeight: "800", fontVariant: ["tabular-nums"] },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#ffffff" },
  meta: { fontSize: 12, marginTop: 2 },
  quality: { fontSize: 14, fontWeight: "800" },
});
