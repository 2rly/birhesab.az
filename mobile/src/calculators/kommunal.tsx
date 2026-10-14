import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const ELEC_TIERS = [
  { limit: 200, rate: 0.084 },
  { limit: 100, rate: 0.10 },
  { limit: Infinity, rate: 0.15 },
];
const GAS_RATE = 0.12;
const WATER_RATE = 0.70;
const WASTEWATER = 0.30;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function calcElectricity(kwh: number): number {
  let remaining = kwh;
  let total = 0;
  for (const tier of ELEC_TIERS) {
    if (remaining <= 0) break;
    const used = Math.min(remaining, tier.limit);
    total += used * tier.rate;
    remaining -= used;
  }
  return total + (kwh > 0 ? 1.0 : 0);
}

export function KommunalCalculator() {
  const [electricity, setElectricity] = useState("");
  const [gas, setGas] = useState("");
  const [water, setWater] = useState("");

  const result = useMemo(() => {
    const elec = parseFloat(electricity) || 0;
    const g = parseFloat(gas) || 0;
    const w = parseFloat(water) || 0;
    if (elec === 0 && g === 0 && w === 0) return null;

    const elecCost = calcElectricity(elec);
    const gasCost = g * GAS_RATE + (g > 0 ? 1.0 : 0);
    const waterCost = w * WATER_RATE + w * WASTEWATER;
    const total = elecCost + gasCost + waterCost;

    return { elecCost, gasCost, waterCost, total };
  }, [electricity, gas, water]);

  return (
    <View>
      <InputField label="Elektrik (kVt·saat)" value={electricity} onChangeText={setElectricity} placeholder="250" keyboardType="decimal-pad" suffix="kVt·s" />
      <InputField label="Qaz (m³)" value={gas} onChangeText={setGas} placeholder="50" keyboardType="decimal-pad" suffix="m³" />
      <InputField label="Su (m³)" value={water} onChangeText={setWater} placeholder="10" keyboardType="decimal-pad" suffix="m³" />

      {result && (
        <ResultSection title="Kommunal xərclər">
          <ResultRow label="Elektrik" value={fmt(result.elecCost)} />
          <ResultRow label="Qaz" value={fmt(result.gasCost)} />
          <ResultRow label="Su + kanalizasiya" value={fmt(result.waterCost)} />
          <ResultRow label="Ümumi" value={fmt(result.total)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
