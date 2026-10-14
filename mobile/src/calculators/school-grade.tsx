import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

interface Subject {
  id: number;
  name: string;
  grade: string;
}

let nextId = 1;

function getGradeLabel(avg: number): string {
  if (avg >= 4.5) return "Əla";
  if (avg >= 3.5) return "Yaxşı";
  if (avg >= 2.5) return "Kafi";
  return "Qeyri-kafi";
}

export function SchoolGradeCalculator() {
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: nextId++, name: "Riyaziyyat", grade: "5" },
    { id: nextId++, name: "Azərbaycan dili", grade: "4" },
    { id: nextId++, name: "İngilis dili", grade: "4" },
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { id: nextId++, name: `Fənn ${subjects.length + 1}`, grade: "5" }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubject = (id: number, field: keyof Subject, value: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const result = useMemo(() => {
    const grades = subjects.map((s) => parseInt(s.grade) || 0).filter((g) => g > 0);
    if (grades.length === 0) return null;

    const sum = grades.reduce((a, b) => a + b, 0);
    const avg = sum / grades.length;
    const label = getGradeLabel(avg);

    return { avg, label, count: grades.length };
  }, [subjects]);

  return (
    <View>
      {subjects.map((sub) => (
        <View key={sub.id} style={[styles.row, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
          <View style={styles.rowContent}>
            <InputField label="Fənn" value={sub.name} onChangeText={(v) => updateSubject(sub.id, "name", v)} />
            <InputField label="Qiymət (2-5)" value={sub.grade} onChangeText={(v) => updateSubject(sub.id, "grade", v)} placeholder="5" keyboardType="numeric" />
          </View>
          {subjects.length > 1 && (
            <Pressable style={[styles.removeBtn, { backgroundColor: colors.n280 }]} onPress={() => removeSubject(sub.id)}>
              <Text style={{ color: colors.n580, fontWeight: "700" }}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}

      <Pressable style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={addSubject}>
        <Text style={[styles.addBtnText, { color: colors.onAccent }]}>+ Fənn əlavə et</Text>
      </Pressable>

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Orta bal" value={result.avg.toFixed(2)} highlight bold />
          <ResultRow label="Qiymətləndirmə" value={result.label} />
          <ResultRow label="Fənn sayı" value={`${result.count}`} />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12, flexDirection: "row" },
  rowContent: { flex: 1 },
  removeBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginLeft: 8, alignSelf: "center" },
  addBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: "700" },
});
