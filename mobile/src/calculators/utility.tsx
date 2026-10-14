import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function calcElectricity(kwh: number): number {
  if (kwh <= 0) return 0;
  let cost = 0;
  if (kwh <= 200) {
    cost = kwh * 0.084;
  } else if (kwh <= 300) {
    cost = 200 * 0.084 + (kwh - 200) * 0.1;
  } else {
    cost = 200 * 0.084 + 100 * 0.1 + (kwh - 300) * 0.15;
  }
  return cost + 1;
}

function calcGas(m3: number): number {
  if (m3 <= 0) return 0;
  let cost = 0;
  if (m3 <= 100) {
    cost = m3 * 0.12;
  } else if (m3 <= 208) {
    cost = 100 * 0.12 + (m3 - 100) * 0.2;
  } else {
    cost = 100 * 0.12 + 108 * 0.2 + (m3 - 208) * 0.25;
  }
  return cost + 1;
}

function calcWater(m3: number): number {
  if (m3 <= 0) return 0;
  return m3 * 0.7 + m3 * 0.3;
}

export function UtilityCalculator() {
  const [electricity, setElectricity] = useState("200");
  const [gas, setGas] = useState("100");
  const [water, setWater] = useState("10");

  const result = useMemo(() => {
    const e = parseFloat(electricity) || 0;
    const g = parseFloat(gas) || 0;
    const w = parseFloat(water) || 0;

    const elCost = calcElectricity(e);
    const gasCost = calcGas(g);
    const waterCost = calcWater(w);
    const total = elCost + gasCost + waterCost;

    return { elCost, gasCost, waterCost, total };
  }, [electricity, gas, water]);

  return (
    <View>
      <InputField
        label="Elektrik enerjisi"
        value={electricity}
        onChangeText={setElectricity}
        placeholder="200"
        keyboardType="decimal-pad"
        suffix="kVt·s"
      />
      <InputField
        label="Təbii qaz"
        value={gas}
        onChangeText={setGas}
        placeholder="100"
        keyboardType="decimal-pad"
        suffix="m³"
      />
      <InputField
        label="Su"
        value={water}
        onChangeText={setWater}
        placeholder="10"
        keyboardType="decimal-pad"
        suffix="m³"
      />

      <ResultSection title="Nəticə">
        <ResultRow label="Elektrik" value={fmt(result.elCost)} />
        <ResultRow label="Qaz" value={fmt(result.gasCost)} />
        <ResultRow label="Su + kanalizasiya" value={fmt(result.waterCost)} />
        <ResultRow
          label="Ümumi kommunal xərc"
          value={fmt(result.total)}
          highlight
          bold
        />
      </ResultSection>
    </View>
  );
}
