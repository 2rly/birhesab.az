import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { Button } from "@/components/Controls";
import { ResultHero, Card, FormulaSection, RelatedCalculators } from "@/components/Content";
import { ToneBox, EmptyState, Bar, TONE, type Tone } from "./_edu-scores-parts";

interface Subject {
  id: number;
  name: string;
  grade: string;
}

const GRADE_LABELS: Record<string, { label: string; tone: Tone; emoji: string; option: string }> = {
  "5": { label: "Əla", tone: "green", emoji: "🌟", option: "5 — Əla" },
  "4": { label: "Yaxşı", tone: "blue", emoji: "👍", option: "4 — Yaxşı" },
  "3": { label: "Kafi", tone: "yellow", emoji: "📝", option: "3 — Kafi" },
  "2": { label: "Pis", tone: "red", emoji: "⚠️", option: "2 — Pis" },
};
const GRADE_KEYS = ["5", "4", "3", "2"] as const;

const DEFAULT_SUBJECTS = ["Riyaziyyat", "Azərbaycan dili", "Fizika", "Tarix", "Xarici dil"];

function getAverageLevel(avg: number): { level: string; description: string; tone: Tone } {
  if (avg >= 4.5) return { level: "Əla", description: "Tələbə əla nəticə göstərir.", tone: "green" };
  if (avg >= 3.5) return { level: "Yaxşı", description: "Tələbə yaxşı səviyyədədir.", tone: "blue" };
  if (avg >= 2.5) return { level: "Kafi", description: "Orta səviyyə — yaxşılaşdırma lazımdır.", tone: "yellow" };
  return { level: "Qeyri-kafi", description: "Nəticə zəifdir — ciddi hazırlıq lazımdır.", tone: "red" };
}

const FORMULA_TITLE = "Ortalama qiymət necə hesablanır?";
const FORMULA_CONTENT = `Ortalama qiymət = Bütün qiymətlərin cəmi ÷ Fənn sayı

Azərbaycan qiymətləndirmə sistemi:
• 5 — Əla
• 4 — Yaxşı
• 3 — Kafi
• 2 — Pis (qeyri-kafi)

Məsələn: (5 + 4 + 5 + 3 + 4) ÷ 5 = 4.2 → Yaxşı

Səviyyələr:
• 4.5–5.0 — Əla
• 3.5–4.4 — Yaxşı
• 2.5–3.4 — Kafi
• 2.0–2.4 — Qeyri-kafi`;

let nextId = 1;

export function SchoolGradeCalculator() {
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    DEFAULT_SUBJECTS.map((name) => ({ id: nextId++, name, grade: "" }))
  );

  const updateSubject = (id: number, field: keyof Subject, value: string) =>
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const result = useMemo(() => {
    const valid = subjects.filter((s) => s.grade);
    if (valid.length === 0) return null;
    const grades = valid.map((s) => Number(s.grade));
    const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
    const dist: Record<string, number> = { "5": 0, "4": 0, "3": 0, "2": 0 };
    grades.forEach((g) => {
      dist[String(g)]++;
    });
    return { avg, level: getAverageLevel(avg), count: valid.length, dist, subjects: valid };
  }, [subjects]);

  return (
    <View>
      <View style={styles.headRow}>
        <Text style={[styles.headLabel, { color: colors.n580 }]}>Fənn adı</Text>
        <Text style={[styles.headLabel, { color: colors.n580 }]}>Qiymət (2–5)</Text>
      </View>

      {subjects.map((subject) => (
        <View key={subject.id} style={[styles.subject, { backgroundColor: colors.n145, borderColor: colors.n280 }]}>
          <View style={styles.subjectTop}>
            <TextInput
              value={subject.name}
              onChangeText={(v) => updateSubject(subject.id, "name", v)}
              placeholder="Fənn adı"
              placeholderTextColor={colors.n500c}
              style={[styles.nameInput, { color: colors.n940, borderColor: colors.n280, backgroundColor: colors.n200 }]}
            />
            {subjects.length > 1 && (
              <Pressable
                onPress={() => setSubjects((prev) => prev.filter((s) => s.id !== subject.id))}
                hitSlop={8}
                style={styles.remove}
              >
                <MaterialIcons name="close" size={18} color="#ef4444" />
              </Pressable>
            )}
          </View>
          <View style={styles.grades}>
            {GRADE_KEYS.map((g) => {
              const active = subject.grade === g;
              const c = TONE[GRADE_LABELS[g].tone];
              return (
                <Pressable
                  key={g}
                  onPress={() => updateSubject(subject.id, "grade", active ? "" : g)}
                  style={[
                    styles.gradeChip,
                    { borderColor: active ? c : colors.n280, backgroundColor: active ? c + "22" : colors.n200 },
                  ]}
                >
                  <Text style={[styles.gradeText, { color: active ? c : colors.n760 }]} numberOfLines={1}>
                    {GRADE_LABELS[g].option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Button
        title="+ Fənn əlavə et"
        variant="secondary"
        onPress={() => setSubjects((prev) => [...prev, { id: nextId++, name: "", grade: "" }])}
      />

      {result ? (
        <View style={{ gap: 12, marginTop: 16 }}>
          <ResultHero label="Ortalama qiymət" value={result.avg.toFixed(2)} sub={`${result.count} fənn üzrə`} />

          <ToneBox tone={result.level.tone} title={`Səviyyə: ${result.level.level}`}>
            {result.level.description}
          </ToneBox>

          <Card title="Qiymət bölgüsü">
            <View style={styles.distGrid}>
              {GRADE_KEYS.map((g) => {
                const info = GRADE_LABELS[g];
                const count = result.dist[g];
                const pct = result.count > 0 ? (count / result.count) * 100 : 0;
                return (
                  <View key={g} style={styles.distCell}>
                    <Text style={styles.distEmoji}>{info.emoji}</Text>
                    <Text style={[styles.distCount, { color: TONE[info.tone] }]}>{count}</Text>
                    <Text style={[styles.distLabel, { color: colors.n580 }]} numberOfLines={1}>
                      {info.label} ({g})
                    </Text>
                    <Bar ratio={pct / 100} />
                    <Text style={[styles.distPct, { color: colors.n580 }]}>{pct.toFixed(0)}%</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <View style={[styles.list, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <View style={[styles.listHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={[styles.listTitle, { color: colors.n940 }]}>📋 Fənlər üzrə qiymətlər</Text>
            </View>
            {result.subjects.map((s, i) => {
              const info = GRADE_LABELS[s.grade];
              const c = info ? TONE[info.tone] : colors.n940;
              return (
                <View
                  key={s.id}
                  style={[
                    styles.listRow,
                    { borderBottomColor: colors.n240 },
                    i === result.subjects.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[styles.listName, { color: colors.n940 }]}>{s.name || "Fənn"}</Text>
                  <View style={styles.listRight}>
                    <Text>{info?.emoji}</Text>
                    <Text style={[styles.listGrade, { color: c }]}>{s.grade}</Text>
                    <Text style={[styles.listLabel, { color: c }]}>({info?.label})</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <EmptyState icon="📚" text="Nəticəni görmək üçün ən azı bir fənnin qiymətini seçin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["gpa", "university-admission", "ielts"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  headLabel: { fontSize: 12 },
  subject: { borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10, gap: 8 },
  subjectTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  remove: { padding: 4 },
  grades: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  gradeChip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, flexGrow: 1, alignItems: "center" },
  gradeText: { fontSize: 12, fontWeight: "600" },
  distGrid: { flexDirection: "row", gap: 8, marginTop: 4 },
  distCell: { flex: 1, alignItems: "center", gap: 3 },
  distEmoji: { fontSize: 22 },
  distCount: { fontSize: 22, fontWeight: "800" },
  distLabel: { fontSize: 11 },
  distPct: { fontSize: 11 },
  list: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  listHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  listTitle: { fontSize: 14, fontWeight: "700" },
  listRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, gap: 8 },
  listName: { fontSize: 13, flex: 1 },
  listRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  listGrade: { fontSize: 14, fontWeight: "800" },
  listLabel: { fontSize: 12 },
});
