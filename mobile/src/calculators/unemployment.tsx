import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function UnemploymentCalculator() {
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const e = parseFloat(experience) || 0;
    if (s <= 0) return null;

    let rate = 0.5;
    if (e >= 10) rate = 0.7;
    else if (e >= 5) rate = 0.6;

    const benefit = Math.min(s * rate, 250);
    const months = e >= 5 ? 26 : 26;

    return { rate, benefit, months };
  }, [salary, experience]);

  return (
    <View>
      <InputField label="Son aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1000" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="İş stajı (il)" value={experience} onChangeText={setExperience} placeholder="5" keyboardType="decimal-pad" suffix="il" />

      {result && (
        <ResultSection title="İşsizlik müavinəti">
          <ResultRow label="Hesablama faizi" value={`${(result.rate * 100).toFixed(0)}%`} />
          <ResultRow label="Aylıq müavinət" value={fmt(result.benefit)} highlight bold />
          <ResultRow label="Müddət" value={`${result.months} həftə`} />
        </ResultSection>
      )}
    </View>
  );
}
