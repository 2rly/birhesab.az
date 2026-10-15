import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { TONE, type Tone } from "./_edu-scores-parts";

// ÜOMG (Ümumi Orta Müvəffəqiyyət Göstəricisi) hesablayıcısı
// 4 kurs × 2 semestr = 8 semestr üzrə fənn balları və kreditlər.
// Hərf qiymətləndirmə: 91–100 → A, 81–90 → B, 71–80 → C, 61–70 → D, 51–60 → E, <51 → F

interface Course {
  id: number;
  name: string;
  score: string;
  credits: string;
}

type SemKey = "1A" | "1B" | "2A" | "2B" | "3A" | "3B" | "4A" | "4B";
type Kurs = 1 | 2 | 3 | 4;

const SEMESTERS: { key: SemKey; kurs: Kurs; semester: 1 | 2 }[] = [
  { key: "1A", kurs: 1, semester: 1 }, { key: "1B", kurs: 1, semester: 2 },
  { key: "2A", kurs: 2, semester: 1 }, { key: "2B", kurs: 2, semester: 2 },
  { key: "3A", kurs: 3, semester: 1 }, { key: "3B", kurs: 3, semester: 2 },
  { key: "4A", kurs: 4, semester: 1 }, { key: "4B", kurs: 4, semester: 2 },
];

function scoreToLetter(score: number): { letter: string; tone: Tone; label: string } {
  if (score >= 91) return { letter: "A", tone: "green", label: "Əla" };
  if (score >= 81) return { letter: "B", tone: "blue", label: "Çox yaxşı" };
  if (score >= 71) return { letter: "C", tone: "cyan", label: "Yaxşı" };
  if (score >= 61) return { letter: "D", tone: "yellow", label: "Kafi" };
  if (score >= 51) return { letter: "E", tone: "orange", label: "Qənaətbəxş" };
  return { letter: "F", tone: "red", label: "Qeyri-kafi" };
}

const fmt = (n: number) => n.toFixed(2);
const pf = (s: string) => parseFloat(s.replace(",", "."));

function weighted(courses: Course[]): { avg: number; totalCredits: number; valid: boolean } {
  let sumWeighted = 0;
  let sumCredits = 0;
  for (const c of courses) {
    const s = pf(c.score);
    const cr = pf(c.credits);
    if (!isNaN(s) && !isNaN(cr) && cr > 0 && s >= 0 && s <= 100) {
      sumWeighted += s * cr;
      sumCredits += cr;
    }
  }
  return { avg: sumCredits > 0 ? sumWeighted / sumCredits : 0, totalCredits: sumCredits, valid: sumCredits > 0 };
}

const FORMULA_TITLE = "ÜOMG necə hesablanır?";
const FORMULA_CONTENT = `ÜOMG = Σ(Fənn balı × Kredit) ÷ Σ(Kredit)

Hərf qiymətləndirməsi:
• 91–100 → A (Əla)
• 81–90 → B (Çox yaxşı)
• 71–80 → C (Yaxşı)
• 61–70 → D (Kafi)
• 51–60 → E (Qənaətbəxş)
• 0–50 → F (Qeyri-kafi)

Hesablama səviyyələri:
1. Semestr ÜOMG — bir semestrin fənləri üzrə çəkili ortalama
2. Kurs ÜOMG — kursun hər iki semestri üçün birgə çəkili ortalama
3. Ümumi ÜOMG — bütün 4 il (8 semestr) üzrə çəkili ortalama

Misal: Riyaziyyat (95 bal, 5 kr) + Fizika (82 bal, 4 kr)
ÜOMG = (95×5 + 82×4) ÷ (5+4) = 803 ÷ 9 = 89.22 (B)`;

let nextId = 1;
const newCourse = (): Course => ({ id: nextId++, name: "", score: "", credits: "" });

function LetterPill({ text, tone }: { text: string; tone: Tone }) {
  const c = TONE[tone];
  return (
    <View style={[styles.pill, { borderColor: c + "77", backgroundColor: c + "1f" }]}>
      <Text style={[styles.pillText, { color: c }]}>{text}</Text>
    </View>
  );
}

export function UomgCalculator() {
  const { colors } = useTheme();
  const [activeKurs, setActiveKurs] = useState<Kurs>(1);
  const [data, setData] = useState<Record<SemKey, Course[]>>(() => {
    const init = {} as Record<SemKey, Course[]>;
    for (const s of SEMESTERS) init[s.key] = [newCourse(), newCourse(), newCourse()];
    return init;
  });

  const update = (sem: SemKey, idx: number, field: keyof Course, value: string) =>
    setData((prev) => {
      const arr = [...prev[sem]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [sem]: arr };
    });
  const addCourse = (sem: SemKey) => setData((prev) => ({ ...prev, [sem]: [...prev[sem], newCourse()] }));
  const removeCourse = (sem: SemKey, id: number) =>
    setData((prev) => ({ ...prev, [sem]: prev[sem].filter((c) => c.id !== id) }));

  const semesterResults = useMemo(() => {
    const map = {} as Record<SemKey, ReturnType<typeof weighted>>;
    for (const s of SEMESTERS) map[s.key] = weighted(data[s.key]);
    return map;
  }, [data]);

  const kursResults = useMemo(() => {
    const map = {} as Record<Kurs, ReturnType<typeof weighted>>;
    for (const k of [1, 2, 3, 4] as const) map[k] = weighted([...data[`${k}A` as SemKey], ...data[`${k}B` as SemKey]]);
    return map;
  }, [data]);

  const overall = useMemo(() => {
    const all: Course[] = [];
    for (const s of SEMESTERS) all.push(...data[s.key]);
    return weighted(all);
  }, [data]);

  const inputStyle = [styles.input, { color: colors.n940, borderColor: colors.n280, backgroundColor: colors.n200 }];

  const renderSemester = (semKey: SemKey, label: string) => {
    const courses = data[semKey];
    const r = semesterResults[semKey];
    const lt = r.valid ? scoreToLetter(r.avg) : null;
    return (
      <View style={[styles.sem, { borderColor: colors.n280, backgroundColor: colors.n145 }]}>
        <View style={[styles.semHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
          <Text style={[styles.semTitle, { color: colors.n940 }]}>{label}</Text>
          {lt && <LetterPill text={`${fmt(r.avg)} · ${lt.letter}`} tone={lt.tone} />}
        </View>
        <View style={styles.semBody}>
          {courses.length === 0 ? (
            <Text style={[styles.noCourses, { color: colors.n580 }]}>Bu semestrdə fənn yoxdur</Text>
          ) : (
            courses.map((c, i) => (
              <View key={c.id} style={styles.courseRow}>
                <TextInput
                  value={c.name}
                  onChangeText={(v) => update(semKey, i, "name", v)}
                  placeholder="Fənnin adı"
                  placeholderTextColor={colors.n500c}
                  style={[inputStyle, { flex: 6 }]}
                />
                <TextInput
                  value={c.score}
                  onChangeText={(v) => update(semKey, i, "score", v)}
                  placeholder="Bal"
                  placeholderTextColor={colors.n500c}
                  keyboardType="decimal-pad"
                  style={[inputStyle, { flex: 3 }]}
                />
                <TextInput
                  value={c.credits}
                  onChangeText={(v) => update(semKey, i, "credits", v)}
                  placeholder="Kredit"
                  placeholderTextColor={colors.n500c}
                  keyboardType="decimal-pad"
                  style={[inputStyle, { flex: 3 }]}
                />
                <Pressable
                  onPress={() => removeCourse(semKey, c.id)}
                  hitSlop={6}
                  accessibilityLabel="Sil"
                  style={styles.del}
                >
                  <Text style={styles.delText}>×</Text>
                </Pressable>
              </View>
            ))
          )}
          <Pressable onPress={() => addCourse(semKey)} style={[styles.add, { borderColor: colors.accent + "66" }]}>
            <Text style={[styles.addText, { color: colors.accent }]}>+ Fənn əlavə et</Text>
          </Pressable>
          {r.valid && (
            <View style={[styles.semFoot, { borderTopColor: colors.n240 }]}>
              <Text style={[styles.small, { color: colors.n580 }]}>
                Cəm kredit: <Text style={{ fontWeight: "700", color: colors.n940 }}>{r.totalCredits}</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const kursR = kursResults[activeKurs];
  const kursLt = kursR.valid ? scoreToLetter(kursR.avg) : null;
  const overallLt = overall.valid ? scoreToLetter(overall.avg) : null;

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Kurs seçin</Text>
      <View style={styles.kursRow}>
        {([1, 2, 3, 4] as const).map((k) => {
          const active = activeKurs === k;
          return (
            <Pressable
              key={k}
              onPress={() => setActiveKurs(k)}
              style={[
                styles.kursBtn,
                {
                  borderColor: active ? colors.accent : colors.n280,
                  backgroundColor: active ? colors.accent + "1f" : colors.n200,
                },
              ]}
            >
              <Text style={[styles.kursText, { color: active ? colors.accent : colors.n940 }]}>{k}-ci Kurs</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 12, marginBottom: 16 }}>
        {renderSemester(`${activeKurs}A` as SemKey, "I semestr")}
        {renderSemester(`${activeKurs}B` as SemKey, "II semestr")}
      </View>

      {kursR.valid && kursLt && (
        <View
          style={[
            styles.kursCard,
            { borderColor: TONE[kursLt.tone] + "88", backgroundColor: TONE[kursLt.tone] + "14" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.small, { color: colors.n580 }]}>{activeKurs}-ci Kurs Kurs ÜOMG</Text>
            <Text style={[styles.kursAvg, { color: TONE[kursLt.tone] }]}>{fmt(kursR.avg)}</Text>
            <Text style={[styles.small, { color: colors.n580 }]}>Cəm kredit: {kursR.totalCredits}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.kursLetter, { color: TONE[kursLt.tone] }]}>{kursLt.letter}</Text>
            <Text style={[styles.small, { color: TONE[kursLt.tone] }]}>{kursLt.label}</Text>
          </View>
        </View>
      )}

      <View style={[styles.summary, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
        <View style={[styles.semHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
          <Text style={[styles.semTitle, { color: colors.n940 }]}>📊 4 illik xülasə</Text>
        </View>
        {([1, 2, 3, 4] as const).map((k) => {
          const r = kursResults[k];
          const lt = r.valid ? scoreToLetter(r.avg) : null;
          return (
            <View key={k} style={[styles.sumRow, { borderBottomColor: colors.n240 }]}>
              <View>
                <Text style={[styles.sumKurs, { color: colors.n940 }]}>{k}-ci Kurs</Text>
                <Text style={[styles.small, { color: colors.n580 }]}>Cəm kredit: {r.totalCredits}</Text>
              </View>
              {lt ? (
                <View style={styles.sumRight}>
                  <Text style={[styles.sumAvg, { color: colors.n940 }]}>{fmt(r.avg)}</Text>
                  <LetterPill text={lt.letter} tone={lt.tone} />
                </View>
              ) : (
                <Text style={[styles.small, { color: colors.n580 }]}>—</Text>
              )}
            </View>
          );
        })}
        {overall.valid && overallLt && (
          <View style={[styles.overall, { backgroundColor: TONE[overallLt.tone] + "1a", borderTopColor: TONE[overallLt.tone] + "88" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sumKurs, { color: colors.n940 }]}>Ümumi ÜOMG</Text>
              <Text style={[styles.small, { color: colors.n580 }]}>4 illik (8 semestr) üzrə ümumi</Text>
              <Text style={[styles.small, { color: colors.n580, marginTop: 2 }]}>Cəm kredit: {overall.totalCredits}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.overallAvg, { color: TONE[overallLt.tone] }]}>{fmt(overall.avg)}</Text>
              <Text style={[styles.overallLetter, { color: TONE[overallLt.tone] }]}>{overallLt.letter}</Text>
              <Text style={[styles.small, { color: TONE[overallLt.tone] }]}>{overallLt.label}</Text>
            </View>
          </View>
        )}
      </View>

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["gpa", "school-grade", "ielts", "sat"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  kursRow: { flexDirection: "row", gap: 6, marginBottom: 16 },
  kursBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  kursText: { fontSize: 12, fontWeight: "700" },
  sem: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  semHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  semTitle: { fontSize: 14, fontWeight: "700" },
  semBody: { padding: 10, gap: 8 },
  noCourses: { fontSize: 12, textAlign: "center", paddingVertical: 6 },
  courseRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, fontSize: 13, minWidth: 0 },
  del: { width: 22, alignItems: "center" },
  delText: { color: "#ef4444", fontSize: 20, fontWeight: "600" },
  add: { borderWidth: 1, borderStyle: "dashed", borderRadius: 8, paddingVertical: 8, alignItems: "center", marginTop: 2 },
  addText: { fontSize: 12, fontWeight: "600" },
  semFoot: { borderTopWidth: 1, paddingTop: 6 },
  small: { fontSize: 12 },
  pill: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3 },
  pillText: { fontSize: 12, fontWeight: "800" },
  kursCard: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: 16, padding: 16, marginBottom: 16 },
  kursAvg: { fontSize: 28, fontWeight: "800" },
  kursLetter: { fontSize: 42, fontWeight: "800" },
  summary: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sumKurs: { fontSize: 14, fontWeight: "600" },
  sumRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  sumAvg: { fontSize: 17, fontWeight: "800" },
  overall: { flexDirection: "row", alignItems: "center", padding: 14, borderTopWidth: 2 },
  overallAvg: { fontSize: 30, fontWeight: "800" },
  overallLetter: { fontSize: 22, fontWeight: "800" },
});
