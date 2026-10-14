import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Gender = "male" | "female";

export function IdealWeightCalculator() {
  const [height, setHeight] = useState("170");
  const [gender, setGender] = useState<Gender>("male");

  const result = useMemo(() => {
    const h = parseFloat(height) || 0;
    if (h < 100 || h > 250) return null;

    const inch = h / 2.54;
    const over60 = Math.max(0, inch - 60);
    const hm = h / 100;

    const devine =
      gender === "male" ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;
    const robinson =
      gender === "male" ? 52 + 1.9 * over60 : 49 + 1.7 * over60;
    const miller =
      gender === "male" ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;

    const bmiMin = 18.5 * hm * hm;
    const bmiMax = 24.9 * hm * hm;

    return { devine, robinson, miller, bmiMin, bmiMax };
  }, [height, gender]);

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
        label="Boy"
        value={height}
        onChangeText={setHeight}
        placeholder="170"
        keyboardType="decimal-pad"
        suffix="sm"
      />

      {result && (
        <>
          <ResultSection title="Formula nəticələri">
            <ResultRow
              label="Devine formulu"
              value={`${result.devine.toFixed(1)} kq`}
            />
            <ResultRow
              label="Robinson formulu"
              value={`${result.robinson.toFixed(1)} kq`}
            />
            <ResultRow
              label="Miller formulu"
              value={`${result.miller.toFixed(1)} kq`}
            />
          </ResultSection>
          <ResultSection title="BMI əsasında aralıq">
            <ResultRow
              label="İdeal çəki aralığı"
              value={`${result.bmiMin.toFixed(1)} – ${result.bmiMax.toFixed(1)} kq`}
              highlight
              bold
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}
