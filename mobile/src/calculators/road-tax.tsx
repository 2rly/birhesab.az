import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type EngineType = "benzin" | "dizel" | "hibrid" | "elektrik";

const TAX_BRACKETS = [
  { maxCc: 1500, tax: 10 },
  { maxCc: 2000, tax: 20 },
  { maxCc: 2500, tax: 30 },
  { maxCc: 3000, tax: 50 },
  { maxCc: 3500, tax: 75 },
  { maxCc: 4000, tax: 100 },
  { maxCc: 4500, tax: 150 },
  { maxCc: Infinity, tax: 200 },
];

function getTax(cc: number): number {
  for (const b of TAX_BRACKETS) {
    if (cc <= b.maxCc) return b.tax;
  }
  return 200;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function RoadTaxCalculator() {
  const [engineCc, setEngineCc] = useState("2000");
  const [engineType, setEngineType] = useState<EngineType>("benzin");

  const result = useMemo(() => {
    const cc = parseInt(engineCc) || 0;
    if (cc <= 0) return null;

    if (engineType === "elektrik") {
      return { tax: 0, effectiveCc: 0, note: "Elektrik avtomobilləri vergidən azaddır" };
    }

    const effectiveCc = engineType === "hibrid" ? Math.round(cc * 0.7) : cc;
    const tax = getTax(effectiveCc);

    return {
      tax,
      effectiveCc,
      note: engineType === "hibrid" ? `Hibrid: ${cc} cc × 70% = ${effectiveCc} cc` : null,
    };
  }, [engineCc, engineType]);

  return (
    <View>
      <SegmentControl
        label="Mühərrik növü"
        options={[
          { value: "benzin", label: "Benzin" },
          { value: "dizel", label: "Dizel" },
          { value: "hibrid", label: "Hibrid" },
          { value: "elektrik", label: "Elektrik" },
        ]}
        selected={engineType}
        onSelect={setEngineType}
      />

      {engineType !== "elektrik" && (
        <InputField
          label="Mühərrik həcmi"
          value={engineCc}
          onChangeText={setEngineCc}
          placeholder="2000"
          keyboardType="numeric"
          suffix="cc"
        />
      )}

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="İllik yol vergisi" value={fmt(result.tax)} highlight bold />
          {result.effectiveCc > 0 && (
            <ResultRow label="Hesablama həcmi" value={`${result.effectiveCc} cc`} />
          )}
          {result.note && <ResultRow label="Qeyd" value={result.note} />}
        </ResultSection>
      )}
    </View>
  );
}
