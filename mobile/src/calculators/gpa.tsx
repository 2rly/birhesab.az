import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Button } from "@/components/Controls";
import { SectionHeading, ResultHero, Card, FormulaSection, RelatedCalculators } from "@/components/Content";
import { TONE, type Tone } from "./_edu-scores-parts";

interface Course {
  id: number;
  name: string;
  score: string;
  credits: string;
}

function scoreToGPA(score: number): { gpa: number; letter: string; tone: Tone } {
  if (score >= 91) return { gpa: 4.0, letter: "A", tone: "green" };
  if (score >= 81) return { gpa: 3.0 + ((score - 81) / 10) * 1.0, letter: "B", tone: "blue" };
  if (score >= 71) return { gpa: 2.0 + ((score - 71) / 10) * 1.0, letter: "C", tone: "yellow" };
  if (score >= 51) return { gpa: 1.0 + ((score - 51) / 20) * 1.0, letter: "D", tone: "orange" };
  return { gpa: 0, letter: "F", tone: "red" };
}

const fmt = (n: number) => n.toFixed(2);
const num = (s: string) => Number(s.replace(",", "."));

const SCALE: { range: string; gpa: string; letter: string; tone: Tone }[] = [
  { range: "91–100", gpa: "4.0", letter: "A", tone: "green" },
  { range: "81–90", gpa: "3.0–3.9", letter: "B", tone: "blue" },
  { range: "71–80", gpa: "2.0–2.9", letter: "C", tone: "yellow" },
  { range: "51–70", gpa: "1.0–1.9", letter: "D", tone: "orange" },
  { range: "0–50", gpa: "0.0", letter: "F", tone: "red" },
];

const FORMULA_TITLE = "GPA necə hesablanır?";
const FORMULA_CONTENT = `100 ballıq sistemdən 4.0 GPA-ya çevirmə:

• 91–100 → 4.0 (A)
• 81–90 → 3.0–3.9 (B)
• 71–80 → 2.0–2.9 (C)
• 51–70 → 1.0–1.9 (D)
• 0–50 → 0.0 (F)

Çəkili GPA = Σ(Fənn GPA × Kredit) ÷ Σ(Kredit)

Məsələn: Riyaziyyat (95 bal, 5 kredit) + Fizika (82 bal, 4 kredit)
GPA = (4.0×5 + 3.1×4) ÷ (5+4) = 32.4 ÷ 9 = 3.60`;

let nextId = 1;

export function GpaCalculator() {
  const { colors } = useTheme();
  const [singleScore, setSingleScore] = useState("");
  const [courses, setCourses] = useState<Course[]>(() => [{ id: nextId++, name: "", score: "", credits: "" }]);

  const singleResult = useMemo(() => {
    const s = parseInt(singleScore);
    if (!s || s < 0 || s > 100) return null;
    return scoreToGPA(s);
  }, [singleScore]);

  const weightedResult = useMemo(() => {
    const valid = courses.filter(
      (c) => c.score && c.credits && num(c.score) >= 0 && num(c.score) <= 100 && num(c.credits) > 0
    );
    if (valid.length === 0) return null;
    let totalWeighted = 0;
    let totalCredits = 0;
    const breakdown = valid.map((c) => {
      const credits = num(c.credits);
      const r = scoreToGPA(num(c.score));
      totalWeighted += r.gpa * credits;
      totalCredits += credits;
      return { ...c, gpa: r.gpa, letter: r.letter, tone: r.tone, creditNum: credits };
    });
    return { weightedGPA: totalWeighted / totalCredits, totalCredits, breakdown };
  }, [courses]);

  const updateCourse = (id: number, field: keyof Course, value: string) =>
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  return (
    <View>
      {/* Tək bal çevirmə */}
      <SectionHeading icon="🔄">Tək bal çevirmə</SectionHeading>
      <InputField
        label="Bal (0–100)"
        value={singleScore}
        onChangeText={setSingleScore}
        placeholder="85"
        keyboardType="number-pad"
        maxLength={3}
      />
      {singleResult && (
        <View style={styles.singleRow}>
          <View style={[styles.singleBox, { backgroundColor: colors.accent }]}>
            <Text style={[styles.singleLabel, { color: colors.onAccent }]}>GPA</Text>
            <Text style={[styles.singleValue, { color: colors.onAccent }]}>{fmt(singleResult.gpa)}</Text>
          </View>
          <View style={[styles.singleBox, { backgroundColor: colors.n200, borderWidth: 1, borderColor: colors.n280 }]}>
            <Text style={[styles.singleLabel, { color: colors.n580 }]}>Hərf</Text>
            <Text style={[styles.singleValue, { color: TONE[singleResult.tone] }]}>{singleResult.letter}</Text>
          </View>
        </View>
      )}

      {/* Çevirmə cədvəli */}
      <View style={[styles.table, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
        <View style={[styles.tableHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
          <Text style={[styles.tableTitle, { color: colors.n940 }]}>📊 Çevirmə cədvəli</Text>
        </View>
        {SCALE.map((row, i) => {
          const active = singleResult && row.letter === singleResult.letter;
          const c = TONE[row.tone];
          return (
            <View
              key={row.letter}
              style={[
                styles.tableRow,
                { borderBottomColor: colors.n240 },
                i === SCALE.length - 1 && { borderBottomWidth: 0 },
                active && { backgroundColor: colors.accent + "22" },
              ]}
            >
              <Text style={[styles.cellRange, { color: colors.n580 }]}>{row.range} bal</Text>
              <Text style={[styles.cellGpa, { color: c }]}>{row.gpa} GPA</Text>
              <View style={styles.cellLetter}>
                <Text style={[styles.letter, { color: c }]}>{row.letter}</Text>
                {active && (
                  <View style={[styles.youBadge, { backgroundColor: colors.n940 }]}>
                    <Text style={[styles.youText, { color: colors.n145 }]}>Siz</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Çəkili GPA */}
      <View style={[styles.divider, { borderTopColor: colors.n280 }]} />
      <SectionHeading icon="📚">Çəkili GPA hesablaması (çoxlu fənn)</SectionHeading>

      {courses.map((course, index) => (
        <View key={course.id} style={[styles.course, { backgroundColor: colors.n145, borderColor: colors.n280 }]}>
          <View style={styles.courseHead}>
            <Text style={[styles.courseNo, { color: colors.n580 }]}>#{index + 1}</Text>
            {courses.length > 1 && (
              <Pressable
                onPress={() => setCourses((prev) => prev.filter((c) => c.id !== course.id))}
                hitSlop={8}
                style={styles.remove}
              >
                <MaterialIcons name="close" size={18} color="#ef4444" />
              </Pressable>
            )}
          </View>
          <InputField
            label="Fənn adı"
            value={course.name}
            onChangeText={(v) => updateCourse(course.id, "name", v)}
            placeholder="Riyaziyyat"
          />
          <View style={styles.pair}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Bal (0–100)"
                value={course.score}
                onChangeText={(v) => updateCourse(course.id, "score", v)}
                placeholder="85"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Kredit"
                value={course.credits}
                onChangeText={(v) => updateCourse(course.id, "credits", v)}
                placeholder="3"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
      ))}

      <Button
        title="+ Fənn əlavə et"
        variant="secondary"
        onPress={() => setCourses((prev) => [...prev, { id: nextId++, name: "", score: "", credits: "" }])}
      />

      {weightedResult && (
        <View style={{ gap: 12, marginTop: 16 }}>
          <ResultHero
            label="Çəkili GPA"
            value={fmt(weightedResult.weightedGPA)}
            sub={`Ümumi kredit: ${weightedResult.totalCredits}`}
          />
          <Card title="Fənn icmalı">
            {weightedResult.breakdown.map((c) => (
              <View key={c.id} style={styles.sumRow}>
                <View style={styles.sumLeft}>
                  <Text style={[styles.letter, { color: TONE[c.tone] }]}>{c.letter}</Text>
                  <Text style={[styles.sumName, { color: colors.n940 }]} numberOfLines={1}>
                    {c.name || "Fənn"}
                  </Text>
                </View>
                <Text style={[styles.sumMeta, { color: colors.n580 }]}>{c.score}/100</Text>
                <Text style={[styles.sumGpa, { color: colors.n940 }]}>{fmt(c.gpa)} GPA</Text>
                <Text style={[styles.sumCr, { color: colors.n580 }]}>({c.creditNum} kr)</Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["school-grade", "university-admission", "foreign-university", "ielts"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  singleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  singleBox: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  singleLabel: { fontSize: 12 },
  singleValue: { fontSize: 26, fontWeight: "800" },
  table: { borderWidth: 1, borderRadius: 14, overflow: "hidden", marginBottom: 8 },
  tableHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  tableTitle: { fontSize: 14, fontWeight: "700" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  cellRange: { flex: 1, fontSize: 13 },
  cellGpa: { flex: 1, fontSize: 13, fontWeight: "600" },
  cellLetter: { flex: 0.8, flexDirection: "row", alignItems: "center", gap: 6 },
  letter: { fontSize: 14, fontWeight: "800" },
  youBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  youText: { fontSize: 11, fontWeight: "700" },
  divider: { borderTopWidth: 1, marginVertical: 16 },
  course: { borderWidth: 1, borderRadius: 12, padding: 12, paddingBottom: 0, marginBottom: 10 },
  courseHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  courseNo: { fontSize: 12, fontWeight: "700" },
  remove: { padding: 2 },
  pair: { flexDirection: "row", gap: 10 },
  sumRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5 },
  sumLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  sumName: { fontSize: 13, flexShrink: 1 },
  sumMeta: { fontSize: 12 },
  sumGpa: { fontSize: 13, fontWeight: "600" },
  sumCr: { fontSize: 11 },
});
