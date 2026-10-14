import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Sector = "private" | "state";

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

export function VacationPayCalculator() {
  const [sector, setSector] = useState<Sector>("private");
  const [salary, setSalary] = useState("1500");
  const [days, setDays] = useState("21");

  const result = useMemo(() => {
    const gross = parseFloat(salary) || 0;
    const vacDays = parseInt(days) || 0;
    if (gross <= 0 || vacDays <= 0) return null;

    const dailyRate = gross / 30.4;
    const grossVacationPay = dailyRate * vacDays;

    const incomeTax = sector === "private" ? calcPrivateIncomeTax(grossVacationPay) : calcStateIncomeTax(grossVacationPay);
    const dsmf = sector === "private"
      ? (grossVacationPay <= 200 ? grossVacationPay * 0.03 : 6 + (grossVacationPay - 200) * 0.10)
      : grossVacationPay * 0.03;
    const unemployment = grossVacationPay * 0.005;
    const medical = sector === "private"
      ? (grossVacationPay <= 2500 ? grossVacationPay * 0.02 : 50 + (grossVacationPay - 2500) * 0.005)
      : (grossVacationPay <= 8000 ? grossVacationPay * 0.02 : 160 + (grossVacationPay - 8000) * 0.005);

    const totalDeductions = incomeTax + dsmf + unemployment + medical;
    const netVacationPay = grossVacationPay - totalDeductions;

    return { dailyRate, grossVacationPay, incomeTax, dsmf, unemployment, medical, totalDeductions, netVacationPay };
  }, [sector, salary, days]);

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

      <InputField label="Aylıq gross əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1500" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Məzuniyyət günləri" value={days} onChangeText={setDays} placeholder="21" keyboardType="numeric" suffix="gün" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Net məzuniyyət pulu" value={fmt(result.netVacationPay)} highlight bold />
          <ResultRow label="Orta günlük" value={fmt(result.dailyRate)} />
          <ResultRow label="Gross məzuniyyət" value={fmt(result.grossVacationPay)} />
          <ResultRow label="Gəlir vergisi" value={fmt(result.incomeTax)} />
          <ResultRow label="DSMF" value={fmt(result.dsmf)} />
          <ResultRow label="İşsizlik" value={fmt(result.unemployment)} />
          <ResultRow label="Tibbi sığorta" value={fmt(result.medical)} />
        </ResultSection>
      )}
    </View>
  );
}
