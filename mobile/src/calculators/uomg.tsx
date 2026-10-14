import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { useTheme } from "@/constants/theme";
import { ResultRow, ResultSection } from "@/components/ResultRow";

interface Course {
  id: number;
  name: string;
  score: string;
  credits: string;
}

function scoreToLetter(score: number): { letter: string; label: string } {
  if (score >= 91) return { letter: "A", label: "Əla" };
  if (score >= 81) return { letter: "B", label: "Çox yaxşı" };
  if (score >= 71) return { letter: "C", label: "Yaxşı" };
  if (score >= 61) return { letter: "D", label: "Kafi" };
  if (score >= 51) return { letter: "E", label: "Qənaətbəxş" };
  return { letter: "F", label: "Qeyri-kafi" };
}

let nextId = 1;

export function UomgCalculator() {
  const { colors } = useTheme();
  const [courses, setCourses] = useState<Course[]>([
    { id: nextId++, name: "", score: "", credits: "" },
    { id: nextId++, name: "", score: "", credits: "" },
    { id: nextId++, name: "", score: "", credits: "" },
  ]);

  const updateCourse = (id: number, field: keyof Omit<Course, "id">, value: string) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addCourse = () => {
    setCourses((prev) => [...prev, { id: nextId++, name: "", score: "", credits: "" }]);
  };

  const removeCourse = (id: number) => {
    if (courses.length <= 1) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const result = useMemo(() => {
    const valid = courses.filter((c) => {
      const s = parseFloat(c.score);
      const cr = parseFloat(c.credits);
      return s > 0 && s <= 100 && cr > 0;
    });
    if (valid.length === 0) return null;

    let totalWeighted = 0;
    let totalCredits = 0;
    for (const c of valid) {
      const s = parseFloat(c.score);
      const cr = parseFloat(c.credits);
      totalWeighted += s * cr;
      totalCredits += cr;
    }
    const avg = totalWeighted / totalCredits;
    const info = scoreToLetter(avg);
    return { avg, totalCredits, courseCount: valid.length, ...info };
  }, [courses]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.n700 }]}>Fənlər</Text>

      {courses.map((c, i) => (
        <View key={c.id} style={[styles.courseRow, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
          <View style={styles.courseHeader}>
            <Text style={[styles.courseNum, { color: colors.n580 }]}>#{i + 1}</Text>
            {courses.length > 1 && (
              <Pressable onPress={() => removeCourse(c.id)}>
                <Text style={{ color: colors.n500c, fontSize: 18 }}>✕</Text>
              </Pressable>
            )}
          </View>
          <TextInput
            style={[styles.input, { color: colors.n940, borderColor: colors.n280, backgroundColor: colors.n195 }]}
            placeholder="Fənn adı"
            placeholderTextColor={colors.n400}
            value={c.name}
            onChangeText={(v) => updateCourse(c.id, "name", v)}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.halfInput, { color: colors.n940, borderColor: colors.n280, backgroundColor: colors.n195 }]}
              placeholder="Bal (0-100)"
              placeholderTextColor={colors.n400}
              value={c.score}
              onChangeText={(v) => updateCourse(c.id, "score", v)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, styles.halfInput, { color: colors.n940, borderColor: colors.n280, backgroundColor: colors.n195 }]}
              placeholder="Kredit"
              placeholderTextColor={colors.n400}
              value={c.credits}
              onChangeText={(v) => updateCourse(c.id, "credits", v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      ))}

      <Pressable style={[styles.addBtn, { borderColor: colors.accent }]} onPress={addCourse}>
        <Text style={[styles.addBtnText, { color: colors.accent }]}>+ Fənn əlavə et</Text>
      </Pressable>

      {result && (
        <ResultSection title="ÜOMG Nəticəsi">
          <ResultRow label="Orta bal" value={result.avg.toFixed(2)} highlight bold />
          <ResultRow label="Hərf qiyməti" value={`${result.letter} — ${result.label}`} />
          <ResultRow label="Ümumi kredit" value={result.totalCredits.toString()} />
          <ResultRow label="Fənn sayı" value={result.courseCount.toString()} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  courseRow: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  courseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  courseNum: { fontSize: 12, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginBottom: 6 },
  inputRow: { flexDirection: "row", gap: 8 },
  halfInput: { flex: 1 },
  addBtn: { borderWidth: 1.5, borderRadius: 10, borderStyle: "dashed", paddingVertical: 10, alignItems: "center", marginTop: 4, marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: "600" },
});
