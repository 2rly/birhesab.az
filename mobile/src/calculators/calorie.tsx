import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Gender = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "very-active";

const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

export function CalorieCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<Activity>("moderate");

  const result = useMemo(() => {
    const a = parseInt(age) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    if (a <= 0 || h <= 0 || w <= 0) return null;

    const bmr =
      gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;

    const tdee = bmr * ACTIVITY_FACTORS[activity];

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      lose: Math.round(tdee - 500),
      gain: Math.round(tdee + 500),
    };
  }, [gender, age, height, weight, activity]);

  return (
    <View>
      <SegmentControl
        label="Cins"
        options={[
          { value: "male", label: "Kişi" },
          { value: "female", label: "Qadın" },
        ]}
        selected={gender}
        onSelect={setGender}
      />

      <InputField
        label="Yaş"
        value={age}
        onChangeText={setAge}
        placeholder="25"
        keyboardType="numeric"
        suffix="il"
      />
      <InputField
        label="Boy"
        value={height}
        onChangeText={setHeight}
        placeholder="175"
        keyboardType="decimal-pad"
        suffix="sm"
      />
      <InputField
        label="Çəki"
        value={weight}
        onChangeText={setWeight}
        placeholder="70"
        keyboardType="decimal-pad"
        suffix="kq"
      />

      <SegmentControl
        label="Aktivlik"
        options={[
          { value: "sedentary", label: "Az" },
          { value: "light", label: "Yüngül" },
          { value: "moderate", label: "Orta" },
          { value: "active", label: "Aktiv" },
          { value: "very-active", label: "Çox" },
        ]}
        selected={activity}
        onSelect={setActivity}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="BMR (bazal)" value={`${result.bmr} kkal`} />
          <ResultRow
            label="Gündəlik norma (TDEE)"
            value={`${result.tdee} kkal`}
            highlight
            bold
          />
          <ResultRow
            label="Arıqlamaq üçün (−500)"
            value={`${result.lose} kkal`}
          />
          <ResultRow
            label="Kökəlmək üçün (+500)"
            value={`${result.gain} kkal`}
          />
        </ResultSection>
      )}
    </View>
  );
}
