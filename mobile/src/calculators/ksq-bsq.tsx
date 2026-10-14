import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Switch } from "react-native";
import { useTheme } from "@/constants/theme";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import type { ThemeColors } from "@/constants/colors";

interface KsqEntry {
  id: number;
  value: string;
}

interface SemesterState {
  ksq: KsqEntry[];
  bsq: string;
}

let nextId = 1;

function scoreToGrade(pct: number): number {
  if (pct < 10) return 1;
  if (pct < 20) return 2;
  if (pct < 50) return 3;
  if (pct < 80) return 4;
  return 5;
}

function parseScore(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(",", "."));
  if (Number.isNaN(n) || n < 0 || n > 100) return null;
  return n;
}

function semGrade(ksqGrades: number[], bsqGrade: number | null): number | null {
  if (ksqGrades.length === 0 || bsqGrade === null) return null;
  const avg = ksqGrades.reduce((a, b) => a + b, 0) / ksqGrades.length;
  return 0.4 * avg + 0.6 * bsqGrade;
}

function levelOf(g: number): string {
  if (g >= 4.5) return "Əla";
  if (g >= 3.5) return "Yaxşı";
  if (g >= 2.5) return "Kafi";
  if (g >= 1.5) return "Qeyri-kafi";
  return "Qeyri-kafi (ən aşağı)";
}

const SCALE = [
  { range: "0–10%", grade: 1 },
  { range: "10–20%", grade: 2 },
  { range: "20–50%", grade: 3 },
  { range: "50–80%", grade: 4 },
  { range: "80–100%", grade: 5 },
];

function ScoreRow({
  label,
  value,
  onChange,
  onRemove,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onRemove?: () => void;
  colors: ThemeColors;
}) {
  const parsed = parseScore(value);
  const grade = parsed !== null ? scoreToGrade(parsed) : null;

  return (
    <View style={s.scoreRow}>
      <Text style={[s.scoreLabel, { color: colors.n580 }]}>{label}</Text>
      <View style={[s.scoreInput, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <TextInput
          style={[s.scoreText, { color: colors.n940 }]}
          value={value}
          onChangeText={onChange}
          placeholder="bal"
          placeholderTextColor={colors.n400c}
          keyboardType="decimal-pad"
        />
        <Text style={[s.scoreSuffix, { color: colors.n580 }]}>%</Text>
      </View>
      {grade !== null && (
        <View style={[s.gradeBadge, { backgroundColor: colors.accent }]}>
          <Text style={[s.gradeBadgeText, { color: colors.onAccent }]}>{grade}</Text>
        </View>
      )}
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={{ color: "#ef4444", fontSize: 18 }}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

function SemesterBlock({
  title,
  state,
  setState,
  colors,
}: {
  title: string;
  state: SemesterState;
  setState: (s: SemesterState) => void;
  colors: ThemeColors;
}) {
  return (
    <View style={[s.semCard, { backgroundColor: colors.n195, borderColor: colors.n300 }]}>
      <Text style={[s.semTitle, { color: colors.n860 }]}>{title}</Text>

      <Text style={[s.fieldLabel, { color: colors.n700 }]}>KSQ balları (%)</Text>
      <Text style={[s.hint, { color: colors.n500c }]}>Hər KSQ üçün düz cavabların faizini daxil edin.</Text>

      {state.ksq.map((entry, i) => (
        <ScoreRow
          key={entry.id}
          label={`KSQ${i + 1}`}
          value={entry.value}
          onChange={(v) =>
            setState({ ...state, ksq: state.ksq.map((k) => (k.id === entry.id ? { ...k, value: v } : k)) })
          }
          onRemove={state.ksq.length > 1 ? () => setState({ ...state, ksq: state.ksq.filter((k) => k.id !== entry.id) }) : undefined}
          colors={colors}
        />
      ))}

      <Pressable
        onPress={() => setState({ ...state, ksq: [...state.ksq, { id: nextId++, value: "" }] })}
        style={[s.addBtn, { borderColor: colors.n380 }]}
      >
        <Text style={[s.addBtnText, { color: colors.n660 }]}>+ KSQ əlavə et</Text>
      </Pressable>

      <Text style={[s.fieldLabel, { color: colors.n700, marginTop: 16 }]}>BSQ balı (%)</Text>
      <ScoreRow label="BSQ" value={state.bsq} onChange={(v) => setState({ ...state, bsq: v })} colors={colors} />
    </View>
  );
}

export function KsqBsqCalculator() {
  const { colors } = useTheme();

  const [sem1, setSem1] = useState<SemesterState>({
    ksq: [{ id: nextId++, value: "" }, { id: nextId++, value: "" }, { id: nextId++, value: "" }],
    bsq: "",
  });
  const [sem2, setSem2] = useState<SemesterState>({
    ksq: [{ id: nextId++, value: "" }, { id: nextId++, value: "" }, { id: nextId++, value: "" }],
    bsq: "",
  });
  const [includeSem2, setIncludeSem2] = useState(false);

  const result = useMemo(() => {
    const s1g = sem1.ksq.map((k) => parseScore(k.value)).filter((n): n is number => n !== null).map(scoreToGrade);
    const s1b = (() => { const n = parseScore(sem1.bsq); return n !== null ? scoreToGrade(n) : null; })();
    const y1 = semGrade(s1g, s1b);

    const s2g = sem2.ksq.map((k) => parseScore(k.value)).filter((n): n is number => n !== null).map(scoreToGrade);
    const s2b = (() => { const n = parseScore(sem2.bsq); return n !== null ? scoreToGrade(n) : null; })();
    const y2 = includeSem2 ? semGrade(s2g, s2b) : null;

    const y1r = y1 !== null ? Math.round(y1) : null;
    const y2r = y2 !== null ? Math.round(y2) : null;

    let annual: number | null = null;
    let annualR: number | null = null;
    if (y1r !== null && y2r !== null) {
      annual = (y1r + y2r) / 2;
      annualR = Math.round(annual);
    }

    return { y1, y2, y1r, y2r, annual, annualR, s1g, s1b, s2g, s2b };
  }, [sem1, sem2, includeSem2]);

  const hasAny = result.y1 !== null || result.y2 !== null;

  return (
    <View>
      {/* Scale reference */}
      <View style={[s.scaleCard, { backgroundColor: colors.n240 }]}>
        <Text style={[s.scaleTitle, { color: colors.n760 }]}>Bal → qiymət şkalası</Text>
        <View style={s.scaleRow}>
          {SCALE.map((sc) => (
            <View key={sc.grade} style={[s.scaleItem, { backgroundColor: colors.n195 }]}>
              <Text style={[s.scaleRange, { color: colors.n660 }]}>{sc.range}</Text>
              <Text style={[s.scaleGrade, { color: colors.accent }]}>{sc.grade}</Text>
            </View>
          ))}
        </View>
      </View>

      <SemesterBlock title="I yarımil" state={sem1} setState={setSem1} colors={colors} />

      <View style={s.switchRow}>
        <Switch
          value={includeSem2}
          onValueChange={setIncludeSem2}
          trackColor={{ false: colors.n340, true: colors.accent }}
          thumbColor={colors.n195}
        />
        <Text style={[s.switchLabel, { color: colors.n760 }]}>II yarımili də hesablayın</Text>
      </View>

      {includeSem2 && <SemesterBlock title="II yarımil" state={sem2} setState={setSem2} colors={colors} />}

      {hasAny ? (
        <View style={{ marginTop: 20 }}>
          {result.y1 !== null && (
            <View style={[s.resultCard, { backgroundColor: colors.accent }]}>
              <Text style={[s.resultLabel, { color: colors.onAccent }]}>I yarımil qiyməti</Text>
              <Text style={[s.resultBig, { color: colors.onAccent }]}>{result.y1r}</Text>
              <Text style={[s.resultSub, { color: colors.onAccent }]}>
                Dəqiq: {result.y1!.toFixed(2)} — {levelOf(result.y1r!)}
              </Text>
            </View>
          )}
          {result.y2 !== null && (
            <View style={[s.resultCard, { backgroundColor: colors.accent, marginTop: 12 }]}>
              <Text style={[s.resultLabel, { color: colors.onAccent }]}>II yarımil qiyməti</Text>
              <Text style={[s.resultBig, { color: colors.onAccent }]}>{result.y2r}</Text>
              <Text style={[s.resultSub, { color: colors.onAccent }]}>
                Dəqiq: {result.y2!.toFixed(2)} — {levelOf(result.y2r!)}
              </Text>
            </View>
          )}
          {result.annual !== null && (
            <View style={[s.resultCard, { backgroundColor: colors.n195, borderWidth: 2, borderColor: colors.accent, marginTop: 12 }]}>
              <Text style={[s.resultLabel, { color: colors.n660 }]}>İllik qiymət</Text>
              <Text style={[s.resultBig, { color: colors.accent }]}>{result.annualR}</Text>
              <Text style={[s.resultSub, { color: colors.n580 }]}>
                ({result.y1r} + {result.y2r}) ÷ 2 = {result.annual!.toFixed(2)} — {levelOf(result.annualR!)}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={[s.emptyText, { color: colors.n500c }]}>
          Nəticəni görmək üçün ən azı bir KSQ və BSQ balı daxil edin.
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  scaleCard: { borderRadius: 14, padding: 14, marginBottom: 16 },
  scaleTitle: { fontSize: 12, fontWeight: "700", marginBottom: 10 },
  scaleRow: { flexDirection: "row", gap: 6 },
  scaleItem: { flex: 1, borderRadius: 8, padding: 8, alignItems: "center" },
  scaleRange: { fontSize: 10, fontWeight: "600" },
  scaleGrade: { fontSize: 16, fontWeight: "800" },
  semCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  semTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  hint: { fontSize: 11, marginBottom: 8 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  scoreLabel: { width: 40, fontSize: 12, fontWeight: "600" },
  scoreInput: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1 },
  scoreText: { flex: 1, fontSize: 15, paddingHorizontal: 12, paddingVertical: 10 },
  scoreSuffix: { paddingRight: 10, fontSize: 13 },
  gradeBadge: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  gradeBadgeText: { fontSize: 14, fontWeight: "800" },
  addBtn: { borderWidth: 2, borderStyle: "dashed", borderRadius: 12, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  addBtnText: { fontSize: 13, fontWeight: "600" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  switchLabel: { fontSize: 14, fontWeight: "600" },
  resultCard: { borderRadius: 16, padding: 20, alignItems: "center" },
  resultLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  resultBig: { fontSize: 48, fontWeight: "800" },
  resultSub: { fontSize: 12, marginTop: 4, opacity: 0.85 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 24, lineHeight: 20 },
});
