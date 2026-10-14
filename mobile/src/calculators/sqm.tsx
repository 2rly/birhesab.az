import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Shape = "rectangle" | "lshape" | "triangle" | "circle";

export function SqmCalculator() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [w1, setW1] = useState("");
  const [l1, setL1] = useState("");
  const [w2, setW2] = useState("");
  const [l2, setL2] = useState("");
  const [base, setBase] = useState("");
  const [heightVal, setHeightVal] = useState("");
  const [radius, setRadius] = useState("");
  const [pricePerSqm, setPricePerSqm] = useState("");

  const result = useMemo(() => {
    let area = 0;
    let perimeter = 0;

    switch (shape) {
      case "rectangle": {
        const w = parseFloat(w1) || 0;
        const l = parseFloat(l1) || 0;
        if (w <= 0 || l <= 0) return null;
        area = w * l;
        perimeter = 2 * (w + l);
        break;
      }
      case "lshape": {
        const a = parseFloat(w1) || 0;
        const b = parseFloat(l1) || 0;
        const c = parseFloat(w2) || 0;
        const d = parseFloat(l2) || 0;
        if (a <= 0 || b <= 0 || c <= 0 || d <= 0) return null;
        area = a * b + c * d;
        break;
      }
      case "triangle": {
        const b = parseFloat(base) || 0;
        const h = parseFloat(heightVal) || 0;
        if (b <= 0 || h <= 0) return null;
        area = (b * h) / 2;
        break;
      }
      case "circle": {
        const r = parseFloat(radius) || 0;
        if (r <= 0) return null;
        area = Math.PI * r * r;
        perimeter = 2 * Math.PI * r;
        break;
      }
    }

    const price = parseFloat(pricePerSqm) || 0;
    const totalCost = price > 0 ? area * price : 0;

    return { area, perimeter, totalCost };
  }, [shape, w1, l1, w2, l2, base, heightVal, radius, pricePerSqm]);

  return (
    <View>
      <SegmentControl
        label="Otaq forması"
        options={[
          { value: "rectangle", label: "Düzbucaq" },
          { value: "lshape", label: "L-forma" },
          { value: "triangle", label: "Üçbucaq" },
          { value: "circle", label: "Dairə" },
        ]}
        selected={shape}
        onSelect={setShape}
      />

      {shape === "rectangle" && (
        <>
          <InputField label="En (m)" value={w1} onChangeText={setW1} placeholder="5" keyboardType="decimal-pad" suffix="m" />
          <InputField label="Uzunluq (m)" value={l1} onChangeText={setL1} placeholder="8" keyboardType="decimal-pad" suffix="m" />
        </>
      )}
      {shape === "lshape" && (
        <>
          <InputField label="En 1 (m)" value={w1} onChangeText={setW1} placeholder="5" keyboardType="decimal-pad" suffix="m" />
          <InputField label="Uzunluq 1 (m)" value={l1} onChangeText={setL1} placeholder="8" keyboardType="decimal-pad" suffix="m" />
          <InputField label="En 2 (m)" value={w2} onChangeText={setW2} placeholder="3" keyboardType="decimal-pad" suffix="m" />
          <InputField label="Uzunluq 2 (m)" value={l2} onChangeText={setL2} placeholder="4" keyboardType="decimal-pad" suffix="m" />
        </>
      )}
      {shape === "triangle" && (
        <>
          <InputField label="Əsas (m)" value={base} onChangeText={setBase} placeholder="6" keyboardType="decimal-pad" suffix="m" />
          <InputField label="Hündürlük (m)" value={heightVal} onChangeText={setHeightVal} placeholder="4" keyboardType="decimal-pad" suffix="m" />
        </>
      )}
      {shape === "circle" && (
        <InputField label="Radius (m)" value={radius} onChangeText={setRadius} placeholder="5" keyboardType="decimal-pad" suffix="m" />
      )}

      <InputField label="Qiymət (ixtiyari)" value={pricePerSqm} onChangeText={setPricePerSqm} placeholder="500" keyboardType="decimal-pad" suffix="₼/m²" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Sahə" value={`${result.area.toFixed(2)} m²`} highlight bold />
          {result.perimeter > 0 && <ResultRow label="Perimetr" value={`${result.perimeter.toFixed(2)} m`} />}
          {result.totalCost > 0 && <ResultRow label="Ümumi qiymət" value={`${result.totalCost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₼`} bold />}
        </ResultSection>
      )}
    </View>
  );
}
