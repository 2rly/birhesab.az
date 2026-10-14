import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Sector = "private" | "state";
type ChildOption = "1" | "2" | "3" | "fixed";

function calcPrivateIncomeTax(g: number): number {
  if (g <= 200) return 0;
  if (g <= 2500) return (g - 200) * 0.03;
  if (g <= 8000) return 75 + (g - 2500) * 0.10;
  return 625 + (g - 8000) * 0.14;
}

function calcStateIncomeTax(g: number): number {
  if (g <= 200) return 0;
  if (g <= 2500) return (g - 200) * 0.14;
  return 350 + (g - 2500) * 0.25;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function AlimonyCalculator() {
  const [sector, setSector] = useState<Sector>("private");
  const [salary, setSalary] = useState("2000");
  const [childOpt, setChildOpt] = useState<ChildOption>("1");
  const [fixedAmount, setFixedAmount] = useState("300");

  const result = useMemo(() => {
    const gross = parseFloat(salary) || 0;
    if (gross <= 0) return null;

    const incomeTax = sector === "private" ? calcPrivateIncomeTax(gross) : calcStateIncomeTax(gross);
    const alimentBase = gross - incomeTax;

    let alimentPercent = 0;
    let alimentAmount = 0;
    if (childOpt === "fixed") {
      alimentAmount = parseFloat(fixedAmount) || 0;
    } else {
      alimentPercent = childOpt === "1" ? 25 : childOpt === "2" ? 33.3 : 50;
      alimentAmount = alimentBase * (alimentPercent / 100);
    }

    const dsmf = sector === "private"
      ? (gross <= 200 ? gross * 0.03 : 6 + (gross - 200) * 0.10)
      : gross * 0.03;
    const unemployment = gross * 0.005;
    const medical = sector === "private"
      ? (gross <= 2500 ? gross * 0.02 : 50 + (gross - 2500) * 0.005)
      : (gross <= 8000 ? gross * 0.02 : 160 + (gross - 8000) * 0.005);

    const netSalary = gross - incomeTax - dsmf - unemployment - medical - alimentAmount;

    return { gross, incomeTax, alimentBase, alimentPercent, alimentAmount, dsmf, unemployment, medical, netSalary };
  }, [sector, salary, childOpt, fixedAmount]);

  return (
    <View>
      <SegmentControl
        label="Sektor"
        options={[
          { value: "private", label: "Özəl sektor" },
          { value: "state", label: "Dövlət" },
        ]}
        selected={sector}
        onSelect={setSector}
      />

      <InputField
        label="Aylıq gross əmək haqqı"
        value={salary}
        onChangeText={setSalary}
        placeholder="2000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      <SegmentControl
        label="Uşaq sayı"
        options={[
          { value: "1", label: "1 uşaq" },
          { value: "2", label: "2 uşaq" },
          { value: "3", label: "3+ uşaq" },
          { value: "fixed", label: "Sabit" },
        ]}
        selected={childOpt}
        onSelect={setChildOpt}
      />

      {childOpt === "fixed" && (
        <InputField
          label="Sabit aliment məbləği"
          value={fixedAmount}
          onChangeText={setFixedAmount}
          placeholder="300"
          keyboardType="decimal-pad"
          suffix="₼"
        />
      )}

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Aliment məbləği" value={fmt(result.alimentAmount)} highlight bold />
          <ResultRow label="Gross maaş" value={fmt(result.gross)} />
          <ResultRow label="Gəlir vergisi" value={fmt(result.incomeTax)} />
          <ResultRow label="Aliment bazası" value={fmt(result.alimentBase)} />
          {result.alimentPercent > 0 && (
            <ResultRow label="Aliment faizi" value={`${result.alimentPercent}%`} />
          )}
          <ResultRow label="DSMF" value={fmt(result.dsmf)} />
          <ResultRow label="İşsizlik sığortası" value={fmt(result.unemployment)} />
          <ResultRow label="Tibbi sığorta" value={fmt(result.medical)} />
          <ResultRow label="Əlinizə çatan" value={fmt(result.netSalary)} bold />
        </ResultSection>
      )}
    </View>
  );
}
