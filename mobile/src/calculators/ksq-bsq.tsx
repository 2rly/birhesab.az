import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { Checkbox } from "@/components/Controls";
import { ResultHero, FormulaSection, RelatedCalculators } from "@/components/Content";
import { EmptyState, TONE, type Tone } from "./_edu-scores-parts";

interface KsqEntry {
  id: number;
  value: string; // bal (0-100)
}

interface SemesterState {
  ksq: KsqEntry[];
  bsq: string; // bal (0-100)
}

const FORMULA_TITLE = "Bal → qiymət → yarımillik və illik qiymət";
const FORMULA_CONTENT = `Addım 1 — Bal → Qiymət (1–5):
• 0–10% → 1
• 10–20% → 2
• 20–50% → 3
• 50–80% → 4
• 80–100% → 5

Addım 2 — Yarımillik qiymət:
Y = (ksq₁ + ksq₂ + ... + ksqₙ) ÷ n × (40 / 100) + BSQ × (60 / 100)

Addım 3 — İllik qiymət:
I = (Y1 + Y2) ÷ 2

Nümunə: KSQ balları 45, 70, 65 → qiymətlər 3, 4, 4. BSQ balı 55 → qiymət 4.
Y = (3+4+4)/3 × 0.40 + 4 × 0.60 = 1.466 + 2.40 = 3.87 ≈ 4

Mənbə: "Ümumtəhsil məktəblərində məktəbdaxili qiymətləndirmənin aparılması Qaydaları", bəndlər 14, 15, 17.`;

let nextId = 1;

// Bal (%) → Qiymət (1-5) — bənd 17 əsasında
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

const badgeTone = (g: number): Tone => {
  if (g >= 5) return "green";
  if (g >= 4) return "blue";
  if (g >= 3) return "yellow";
  if (g >= 2) return "orange";
  return "red";
};

const gradeTone = (g: number): Tone => {
  if (g >= 4.5) return "green";
  if (g >= 3.5) return "blue";
  if (g >= 2.5) return "yellow";
  if (g >= 1.5) return "orange";
  return "red";
};

const levelOf = (g: number): string => {
  if (g >= 4.5) return "Əla";
  if (g >= 3.5) return "Yaxşı";
  if (g >= 2.5) return "Kafi";
  if (g >= 1.5) return "Qeyri-kafi";
  return "Qeyri-kafi (ən aşağı)";
};

function semesterGrade(ksqGrades: number[], bsqGrade: number | null): number | null {
  if (ksqGrades.length === 0 || bsqGrade === null) return null;
  const ksqAvg = ksqGrades.reduce((a, b) => a + b, 0) / ksqGrades.length;
  return 0.4 * ksqAvg + 0.6 * bsqGrade;
}

const SCALE: { range: string; grade: number; tone: Tone }[] = [
  { range: "0–10%", grade: 1, tone: "red" },
  { range: "10–20%", grade: 2, tone: "orange" },
  { range: "20–50%", grade: 3, tone: "yellow" },
  { range: "50–80%", grade: 4, tone: "blue" },
  { range: "80–100%", grade: 5, tone: "green" },
];

function ScoreInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { colors } = useTheme();
  const parsed = parseScore(value);
  const grade = parsed !== null ? scoreToGrade(parsed) : null;
  return (
    <View style={styles.scoreRow}>
      <View style={[styles.inputWrap, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="bal"
          placeholderTextColor={colors.n500c}
          keyboardType="decimal-pad"
          style={[styles.input, { color: colors.n940 }]}
        />
        <Text style={[styles.suffix, { color: colors.n580 }]}>%</Text>
      </View>
      {grade !== null ? (
        <View
          style={[
            styles.badge,
            { borderColor: TONE[badgeTone(grade)] + "77", backgroundColor: TONE[badgeTone(grade)] + "22" },
          ]}
        >
          <Text style={[styles.badgeText, { color: TONE[badgeTone(grade)] }]}>qiymət {grade}</Text>
        </View>
      ) : (
        <View style={[styles.badge, styles.badgeEmpty, { borderColor: colors.n280 }]}>
          <Text style={[styles.badgeDash, { color: colors.n580 }]}>—</Text>
        </View>
      )}
    </View>
  );
}

function SemesterForm({
  title,
  state,
  setState,
}: {
  title: string;
  state: SemesterState;
  setState: (s: SemesterState) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.sem, { borderColor: colors.n280, backgroundColor: colors.n145 }]}>
      <Text style={[styles.semTitle, { color: colors.n940 }]}>📘 {title}</Text>

      <Text style={[styles.label, { color: colors.n700 }]}>KSQ balları (%)</Text>
      <Text style={[styles.note, { color: colors.n580 }]}>Hər KSQ üçün düz cavabların faizini (0–100) daxil edin.</Text>
      <View style={{ gap: 8 }}>
        {state.ksq.map((entry, index) => (
          <View key={entry.id} style={styles.ksqRow}>
            <Text style={[styles.ksqNo, { color: colors.n580 }]}>KSQ{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <ScoreInput
                value={entry.value}
                onChange={(v) =>
                  setState({ ...state, ksq: state.ksq.map((k) => (k.id === entry.id ? { ...k, value: v } : k)) })
                }
              />
            </View>
            {state.ksq.length > 1 && (
              <Pressable
                onPress={() => setState({ ...state, ksq: state.ksq.filter((k) => k.id !== entry.id) })}
                accessibilityLabel="Sil"
                hitSlop={6}
                style={styles.remove}
              >
                <MaterialIcons name="close" size={18} color="#ef4444" />
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <Pressable
        onPress={() => setState({ ...state, ksq: [...state.ksq, { id: nextId++, value: "" }] })}
        style={[styles.add, { borderColor: colors.n280 }]}
      >
        <Text style={[styles.addText, { color: colors.n580 }]}>+ KSQ əlavə et</Text>
      </Pressable>

      <Text style={[styles.label, { color: colors.n700, marginTop: 16 }]}>BSQ balı (%)</Text>
      <ScoreInput value={state.bsq} onChange={(v) => setState({ ...state, bsq: v })} />
    </View>
  );
}

function SemesterResult({
  title,
  raw,
  rounded,
  ksq,
  bsq,
}: {
  title: string;
  raw: number;
  rounded: number;
  ksq: number[];
  bsq: number | null;
}) {
  const { colors } = useTheme();
  const c = TONE[gradeTone(rounded)];
  return (
    <View style={[styles.semRes, { borderColor: c + "66", backgroundColor: c + "1a" }]}>
      <Text style={[styles.semResTitle, { color: c }]}>{title}</Text>
      <Text style={[styles.semResValue, { color: c }]}>{rounded}</Text>
      <Text style={[styles.semResSub, { color: colors.n760 }]}>
        KSQ: [{ksq.join(", ")}], BSQ: {bsq} — Dəqiq nəticə: {raw.toFixed(2)} → Yuvarlaqlaşdırılmış: {rounded} (
        {levelOf(rounded)})
      </Text>
    </View>
  );
}

const newSem = (): SemesterState => ({
  ksq: [{ id: nextId++, value: "" }, { id: nextId++, value: "" }, { id: nextId++, value: "" }],
  bsq: "",
});

export function KsqBsqCalculator() {
  const { colors } = useTheme();
  const [sem1, setSem1] = useState<SemesterState>(newSem);
  const [sem2, setSem2] = useState<SemesterState>(newSem);
  const [includeSem2, setIncludeSem2] = useState(false);

  const result = useMemo(() => {
    const grades = (s: SemesterState) =>
      s.ksq.map((k) => parseScore(k.value)).filter((n): n is number => n !== null).map(scoreToGrade);
    const bsqGrade = (s: SemesterState) => {
      const n = parseScore(s.bsq);
      return n !== null ? scoreToGrade(n) : null;
    };
    const sem1Ksq = grades(sem1);
    const sem1Bsq = bsqGrade(sem1);
    const y1 = semesterGrade(sem1Ksq, sem1Bsq);
    const sem2Ksq = grades(sem2);
    const sem2Bsq = bsqGrade(sem2);
    const y2 = includeSem2 ? semesterGrade(sem2Ksq, sem2Bsq) : null;
    const y1Rounded = y1 !== null ? Math.round(y1) : null;
    const y2Rounded = y2 !== null ? Math.round(y2) : null;
    let annual: number | null = null;
    let annualRounded: number | null = null;
    if (y1Rounded !== null && y2Rounded !== null) {
      annual = (y1Rounded + y2Rounded) / 2;
      annualRounded = Math.round(annual);
    }
    return { y1, y2, y1Rounded, y2Rounded, annual, annualRounded, sem1Ksq, sem1Bsq, sem2Ksq, sem2Bsq };
  }, [sem1, sem2, includeSem2]);

  const hasAny = result.y1 !== null || result.y2 !== null;

  return (
    <View>
      <View style={[styles.scale, { borderColor: TONE.blue + "55", backgroundColor: TONE.blue + "14" }]}>
        <Text style={[styles.scaleTitle, { color: colors.n940 }]}>Bal → qiymət şkalası</Text>
        <View style={styles.scaleGrid}>
          {SCALE.map((s) => (
            <View key={s.grade} style={[styles.scaleCell, { backgroundColor: colors.n145, borderColor: TONE.blue + "44" }]}>
              <Text style={[styles.scaleRange, { color: TONE[s.tone] }]}>{s.range}</Text>
              <Text style={[styles.scaleGrade, { color: TONE[s.tone] }]}>{s.grade}</Text>
            </View>
          ))}
        </View>
      </View>

      <SemesterForm title="I yarımil" state={sem1} setState={setSem1} />

      <View style={{ marginVertical: 12 }}>
        <Checkbox label="II yarımili də hesablayın" checked={includeSem2} onChange={setIncludeSem2} />
      </View>

      {includeSem2 && <SemesterForm title="II yarımil" state={sem2} setState={setSem2} />}

      <View style={{ marginTop: 16 }}>
        {hasAny ? (
          <View style={{ gap: 12 }}>
            {result.y1 !== null && (
              <SemesterResult
                title="Y1 — Yarımillik qiymət (I yarımil)"
                raw={result.y1}
                rounded={result.y1Rounded!}
                ksq={result.sem1Ksq}
                bsq={result.sem1Bsq}
              />
            )}
            {result.y2 !== null && (
              <SemesterResult
                title="Y2 — Yarımillik qiymət (II yarımil)"
                raw={result.y2}
                rounded={result.y2Rounded!}
                ksq={result.sem2Ksq}
                bsq={result.sem2Bsq}
              />
            )}
            {result.annual !== null && (
              <ResultHero
                label="İllik qiymət"
                value={String(result.annualRounded)}
                sub={`(${result.y1Rounded} + ${result.y2Rounded}) ÷ 2 = ${result.annual.toFixed(2)} → ${result.annualRounded} (${levelOf(result.annualRounded!)})`}
              />
            )}
          </View>
        ) : (
          <EmptyState text="Nəticəni görmək üçün ən azı bir KSQ və BSQ balı daxil edin." />
        )}
      </View>

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["school-grade", "uomg", "gpa"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scale: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  scaleTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8 },
  scaleGrid: { flexDirection: "row", gap: 5 },
  scaleCell: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 7, alignItems: "center" },
  scaleRange: { fontSize: 10, fontWeight: "700" },
  scaleGrade: { fontSize: 14, fontWeight: "800" },
  sem: { borderWidth: 1, borderRadius: 16, padding: 14 },
  semTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  note: { fontSize: 11, marginBottom: 10 },
  ksqRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ksqNo: { width: 40, fontSize: 13 },
  remove: { width: 30, height: 36, alignItems: "center", justifyContent: "center" },
  add: { borderWidth: 2, borderStyle: "dashed", borderRadius: 12, paddingVertical: 9, alignItems: "center", marginTop: 10 },
  addText: { fontSize: 13, fontWeight: "600" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
  input: { flex: 1, paddingVertical: 8, fontSize: 14, minWidth: 0 },
  suffix: { fontSize: 12 },
  badge: { width: 82, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  badgeEmpty: { borderStyle: "dashed" },
  badgeText: { fontSize: 13, fontWeight: "800" },
  badgeDash: { fontSize: 12 },
  semRes: { borderWidth: 1, borderRadius: 16, padding: 16 },
  semResTitle: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  semResValue: { fontSize: 42, fontWeight: "800", marginBottom: 2 },
  semResSub: { fontSize: 12, lineHeight: 17 },
});
