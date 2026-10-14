import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

interface Course {
  id: number;
  name: string;
  grade: number;
  credit: string;
}

const GRADES = [
  { value: 5, label: "Əla (5)" },
  { value: 4, label: "Yaxşı (4)" },
  { value: 3, label: "Kafi (3)" },
  { value: 2, label: "Qeyri-kafi (2)" },
];

let nextId = 1;

export function GpaCalculator() {
  const { colors } = useTheme();
  const [courses, setCourses] = useState<Course[]>([
    { id: nextId++, name: "Fənn 1", grade: 5, credit: "3" },
    { id: nextId++, name: "Fənn 2", grade: 4, credit: "3" },
  ]);

  const addCourse = () => {
    setCourses([...courses, { id: nextId++, name: `Fənn ${courses.length + 1}`, grade: 5, credit: "3" }]);
  };

  const removeCourse = (id: number) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: number, field: keyof Course, value: string | number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const result = useMemo(() => {
    let totalWeighted = 0;
    let totalCredits = 0;

    for (const c of courses) {
      const cr = parseFloat(c.credit) || 0;
      totalWeighted += c.grade * cr;
      totalCredits += cr;
    }

    if (totalCredits === 0) return null;

    const gpa5 = totalWeighted / totalCredits;
    const gpa4 = ((gpa5 - 2) / 3) * 4;

    return { gpa5, gpa4: Math.max(0, gpa4), totalCredits };
  }, [courses]);

  return (
    <View>
      {courses.map((course) => (
        <View key={course.id} style={[styles.courseCard, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
          <View style={styles.courseHeader}>
            <InputField label="Fənn adı" value={course.name} onChangeText={(v) => updateCourse(course.id, "name", v)} placeholder="Riyaziyyat" />
            {courses.length > 1 && (
              <Pressable style={[styles.removeBtn, { backgroundColor: colors.n280 }]} onPress={() => removeCourse(course.id)}>
                <Text style={{ color: colors.n580, fontSize: 16, fontWeight: "700" }}>✕</Text>
              </Pressable>
            )}
          </View>

          <Text style={[styles.gradeLabel, { color: colors.n700 }]}>Qiymət</Text>
          <View style={styles.gradeRow}>
            {GRADES.map((g) => (
              <Pressable
                key={g.value}
                style={[styles.gradeChip, { backgroundColor: colors.n200 }, course.grade === g.value && { backgroundColor: colors.accent }]}
                onPress={() => updateCourse(course.id, "grade", g.value)}
              >
                <Text style={[styles.gradeChipText, { color: colors.n580 }, course.grade === g.value && { color: colors.onAccent }]}>
                  {g.value}
                </Text>
              </Pressable>
            ))}
          </View>

          <InputField label="Kredit" value={course.credit} onChangeText={(v) => updateCourse(course.id, "credit", v)} placeholder="3" keyboardType="numeric" />
        </View>
      ))}

      <Pressable style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={addCourse}>
        <Text style={[styles.addBtnText, { color: colors.onAccent }]}>+ Fənn əlavə et</Text>
      </Pressable>

      {result && (
        <ResultSection title="GPA nəticəsi">
          <ResultRow label="GPA (5 ballıq)" value={result.gpa5.toFixed(2)} highlight bold />
          <ResultRow label="GPA (4 ballıq)" value={result.gpa4.toFixed(2)} />
          <ResultRow label="Ümumi kredit" value={`${result.totalCredits}`} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  courseCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  courseHeader: { flexDirection: "row", alignItems: "flex-start" },
  removeBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginLeft: 8, marginTop: 22 },
  gradeLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  gradeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  gradeChip: { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  gradeChipText: { fontSize: 16, fontWeight: "700" },
  addBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: "700" },
});
