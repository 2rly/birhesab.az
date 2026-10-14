import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function YoutubeCalculator() {
  const [views, setViews] = useState("");
  const [cpm, setCpm] = useState("2");
  const [subscribers, setSubscribers] = useState("");

  const result = useMemo(() => {
    const v = parseInt(views) || 0;
    const c = parseFloat(cpm) || 0;
    if (v <= 0) return null;

    const monetizedViews = v * 0.5;
    const daily = (monetizedViews * c) / 1000;
    const monthly = daily * 30;
    const yearly = monthly * 12;
    const monthlyAzn = monthly * 1.7;

    return { daily, monthly, yearly, monthlyAzn, monetizedViews };
  }, [views, cpm]);

  return (
    <View>
      <InputField label="Gündəlik baxış sayı" value={views} onChangeText={setViews} placeholder="10000" keyboardType="numeric" />
      <InputField label="CPM (1000 baxışa görə)" value={cpm} onChangeText={setCpm} placeholder="2" keyboardType="decimal-pad" suffix="$" />
      <InputField label="Abunəçi sayı (ixtiyari)" value={subscribers} onChangeText={setSubscribers} placeholder="1000" keyboardType="numeric" />

      {result && (
        <ResultSection title="Təxmini YouTube gəliri">
          <ResultRow label="Gündəlik" value={`${fmt(result.daily)} $`} />
          <ResultRow label="Aylıq" value={`${fmt(result.monthly)} $`} highlight bold />
          <ResultRow label="Aylıq (AZN)" value={`${fmt(result.monthlyAzn)} ₼`} />
          <ResultRow label="İllik" value={`${fmt(result.yearly)} $`} />
        </ResultSection>
      )}
    </View>
  );
}
