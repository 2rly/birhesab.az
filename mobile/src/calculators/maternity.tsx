import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type BirthType = "normal" | "complicated" | "twins";

const BIRTH_TYPES = {
  normal: { label: "Normal doğuş", before: 70, after: 56, total: 126 },
  complicated: { label: "Ağırlaşmış doğuş", before: 70, after: 70, total: 140 },
  twins: { label: "Əkiz doğuş", before: 70, after: 110, total: 180 },
};

const MIN_WAGE = 345;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function MaternityCalculator() {
  const [birthType, setBirthType] = useState<BirthType>("normal");
  const [salary, setSalary] = useState("1000");

  const result = useMemo(() => {
    const gross = parseFloat(salary) || 0;
    if (gross <= 0) return null;

    const effectiveSalary = Math.max(gross, MIN_WAGE);
    const bt = BIRTH_TYPES[birthType];
    const annualSalary = effectiveSalary * 12;
    const dailyRate = annualSalary / 365;
    const beforePay = dailyRate * bt.before;
    const afterPay = dailyRate * bt.after;
    const totalPay = dailyRate * bt.total;
    const usedMinWage = gross < MIN_WAGE;

    return { dailyRate, beforePay, afterPay, totalPay, bt, usedMinWage, annualSalary };
  }, [salary, birthType]);

  return (
    <View>
      <SegmentControl
        label="Doğuş növü"
        options={[
          { value: "normal", label: "Normal" },
          { value: "complicated", label: "Ağırlaşmış" },
          { value: "twins", label: "Əkiz" },
        ]}
        selected={birthType}
        onSelect={setBirthType}
      />

      <InputField
        label="Aylıq əmək haqqı (gross)"
        value={salary}
        onChangeText={setSalary}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi analıq ödənişi" value={fmt(result.totalPay)} highlight bold />
          <ResultRow label="Orta günlük əmək haqqı" value={fmt(result.dailyRate)} />
          <ResultRow label={`Doğuşdan əvvəl (${result.bt.before} gün)`} value={fmt(result.beforePay)} />
          <ResultRow label={`Doğuşdan sonra (${result.bt.after} gün)`} value={fmt(result.afterPay)} />
          <ResultRow label="Ümumi günlər" value={`${result.bt.total} gün`} />
          {result.usedMinWage && (
            <ResultRow label="Qeyd" value={`Minimum əmək haqqı (${MIN_WAGE} ₼) tətbiq edildi`} />
          )}
        </ResultSection>
      )}
    </View>
  );
}
