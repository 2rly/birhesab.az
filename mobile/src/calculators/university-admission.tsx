import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

export function UniversityAdmissionCalculator() {
  const [totalQuestions, setTotalQuestions] = useState("25");
  const [correct, setCorrect] = useState("18");
  const [wrong, setWrong] = useState("3");

  const result = useMemo(() => {
    const total = parseInt(totalQuestions) || 0;
    const c = parseInt(correct) || 0;
    const w = parseInt(wrong) || 0;
    if (total <= 0) return null;

    const unanswered = Math.max(0, total - c - w);
    const score = c * 4 - w * 1;
    const maxScore = total * 4;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    return { score: Math.max(0, score), maxScore, percentage, unanswered, correct: c, wrong: w };
  }, [totalQuestions, correct, wrong]);

  return (
    <View>
      <InputField label="Ümumi sual sayı" value={totalQuestions} onChangeText={setTotalQuestions} placeholder="25" keyboardType="numeric" />
      <InputField label="Düzgün cavab" value={correct} onChangeText={setCorrect} placeholder="18" keyboardType="numeric" />
      <InputField label="Səhv cavab" value={wrong} onChangeText={setWrong} placeholder="3" keyboardType="numeric" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Bal" value={`${result.score} / ${result.maxScore}`} highlight bold />
          <ResultRow label="Faiz" value={`${result.percentage.toFixed(1)}%`} />
          <ResultRow label="Düzgün" value={`${result.correct} (×4 = ${result.correct * 4})`} />
          <ResultRow label="Səhv" value={`${result.wrong} (×-1 = -${result.wrong})`} />
          <ResultRow label="Cavabsız" value={`${result.unanswered}`} />
        </ResultSection>
      )}
    </View>
  );
}
