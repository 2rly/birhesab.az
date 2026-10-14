import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Region = "baku" | "other";
type AccidentHistory = "clean" | "one" | "multiple";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function OsagoCalculator() {
  const [region, setRegion] = useState<Region>("baku");
  const [age, setAge] = useState("30");
  const [experience, setExperience] = useState("5");
  const [enginePower, setEnginePower] = useState("120");
  const [accident, setAccident] = useState<AccidentHistory>("clean");

  const result = useMemo(() => {
    const ageVal = parseInt(age) || 0;
    const expVal = parseInt(experience) || 0;
    const power = parseInt(enginePower) || 0;
    if (ageVal <= 0 || power <= 0) return null;

    const baseRate = region === "baku" ? 50 : 40;
    const regionCoeff = region === "baku" ? 1.0 : 0.8;

    let ageExpCoeff = 1.0;
    if (ageVal < 25 && expVal < 2) ageExpCoeff = 1.5;
    else if (ageVal < 25) ageExpCoeff = 1.3;
    else if (expVal < 2) ageExpCoeff = 1.2;

    const accidentCoeff = accident === "clean" ? 0.8 : accident === "one" ? 1.5 : 2.0;

    let powerCoeff = 1.0;
    if (power < 100) powerCoeff = 0.9;
    else if (power <= 150) powerCoeff = 1.0;
    else if (power <= 200) powerCoeff = 1.2;
    else powerCoeff = 1.5;

    const premium = baseRate * regionCoeff * ageExpCoeff * accidentCoeff * powerCoeff;

    return { premium, baseRate, regionCoeff, ageExpCoeff, accidentCoeff, powerCoeff };
  }, [region, age, experience, enginePower, accident]);

  return (
    <View>
      <SegmentControl
        label="Region"
        options={[
          { value: "baku", label: "Bakı" },
          { value: "other", label: "Digər" },
        ]}
        selected={region}
        onSelect={setRegion}
      />

      <InputField
        label="Yaş"
        value={age}
        onChangeText={setAge}
        placeholder="30"
        keyboardType="numeric"
      />
      <InputField
        label="Sürücülük təcrübəsi"
        value={experience}
        onChangeText={setExperience}
        placeholder="5"
        keyboardType="numeric"
        suffix="il"
      />
      <InputField
        label="Mühərrik gücü"
        value={enginePower}
        onChangeText={setEnginePower}
        placeholder="120"
        keyboardType="numeric"
        suffix="a.g."
      />

      <SegmentControl
        label="Qəza tarixçəsi"
        options={[
          { value: "clean", label: "Qəzasız" },
          { value: "one", label: "1 qəza" },
          { value: "multiple", label: "2+ qəza" },
        ]}
        selected={accident}
        onSelect={setAccident}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Sığorta haqqı" value={fmt(result.premium)} highlight bold />
          <ResultRow label="Baza tarif" value={fmt(result.baseRate)} />
          <ResultRow label="Region əmsalı" value={`×${result.regionCoeff}`} />
          <ResultRow label="Yaş/təcrübə əmsalı" value={`×${result.ageExpCoeff}`} />
          <ResultRow label="Qəza əmsalı" value={`×${result.accidentCoeff}`} />
          <ResultRow label="Güc əmsalı" value={`×${result.powerCoeff}`} />
        </ResultSection>
      )}
    </View>
  );
}
