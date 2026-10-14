import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Gender = "male" | "female";

function devine(h: number, g: Gender) {
  const over60 = Math.max(0, h / 2.54 - 60);
  const ideal = g === "male" ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}
function robinson(h: number, g: Gender) {
  const over60 = Math.max(0, h / 2.54 - 60);
  const ideal = g === "male" ? 52 + 1.9 * over60 : 49 + 1.7 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}
function miller(h: number, g: Gender) {
  const over60 = Math.max(0, h / 2.54 - 60);
  const ideal = g === "male" ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}
function hamwi(h: number, g: Gender) {
  const over60 = Math.max(0, h / 2.54 - 60);
  const ideal = g === "male" ? 48 + 2.7 * over60 : 45.5 + 2.2 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}
function bmiRange(h: number) {
  const m = h / 100;
  return { min: 18.5 * m * m, max: 24.9 * m * m };
}

export function IdealWeightCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");

  const result = useMemo(() => {
    const h = parseFloat(height);
    if (!h || h < 100 || h > 250) return null;

    const formulas = [
      { name: "BMI əsaslı (ÜST)", ...bmiRange(h) },
      { name: "Devine düsturu", ...devine(h, gender) },
      { name: "Robinson düsturu", ...robinson(h, gender) },
      { name: "Miller düsturu", ...miller(h, gender) },
      { name: "Hamwi düsturu", ...hamwi(h, gender) },
    ];

    const avgMin = formulas.reduce((s, f) => s + f.min, 0) / formulas.length;
    const avgMax = formulas.reduce((s, f) => s + f.max, 0) / formulas.length;
    const idealAvg = (avgMin + avgMax) / 2;
    const cw = parseFloat(currentWeight) || 0;

    let diff = "";
    if (cw > 0) {
      if (cw < avgMin) diff = `+${(avgMin - cw).toFixed(1)} kq artırın`;
      else if (cw > avgMax) diff = `−${(cw - avgMax).toFixed(1)} kq azaldın`;
      else diff = "Normal aralıqdadır";
    }

    return { formulas, avgMin, avgMax, idealAvg, diff };
  }, [gender, height, currentWeight]);

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
      <InputField label="Boy (sm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="decimal-pad" suffix="sm" />
      <InputField label="Hazırkı çəki (ixtiyari)" value={currentWeight} onChangeText={setCurrentWeight} placeholder="75" keyboardType="decimal-pad" suffix="kq" />

      {result && (
        <>
          <ResultSection title="İdeal çəki aralığı">
            <ResultRow label="Aralıq" value={`${result.avgMin.toFixed(1)} – ${result.avgMax.toFixed(1)} kq`} highlight bold />
            <ResultRow label="Ortalama" value={`${result.idealAvg.toFixed(1)} kq`} />
            {result.diff && <ResultRow label="Fərq" value={result.diff} />}
          </ResultSection>
          <ResultSection title="Düsturlar üzrə">
            {result.formulas.map((f) => (
              <ResultRow key={f.name} label={f.name} value={`${f.min.toFixed(1)} – ${f.max.toFixed(1)} kq`} />
            ))}
          </ResultSection>
        </>
      )}
    </View>
  );
}
