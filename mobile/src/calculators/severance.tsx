import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Reason = "reduction" | "liquidation" | "other";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function SeveranceCalculator() {
  const [salary, setSalary] = useState("1000");
  const [years, setYears] = useState("3");
  const [reason, setReason] = useState<Reason>("reduction");

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const y = parseFloat(years) || 0;
    if (s <= 0 || y <= 0) return null;

    const avgDaily = s / 30.4;
    const unusedVacationDays = Math.round(21 * (y - Math.floor(y)));
    const unusedVacation = avgDaily * unusedVacationDays;

    let severance = 0;
    if (reason === "reduction" || reason === "liquidation") {
      severance = s * Math.ceil(y);
    }

    return { severance, unusedVacation, unusedVacationDays, total: severance + unusedVacation };
  }, [salary, years, reason]);

  return (
    <View>
      <InputField
        label="Aylıq əmək haqqı (gross)"
        value={salary}
        onChangeText={setSalary}
        placeholder="1000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="İş stajı"
        value={years}
        onChangeText={setYears}
        placeholder="3"
        keyboardType="decimal-pad"
        suffix="il"
      />

      <SegmentControl
        label="İşdən çıxma səbəbi"
        options={[
          { value: "reduction", label: "Ştat ixtisar" },
          { value: "liquidation", label: "Ləğv" },
          { value: "other", label: "Digər" },
        ]}
        selected={reason}
        onSelect={setReason}
      />

      {result && (
        <ResultSection title="Nəticə">
          {result.severance > 0 && (
            <ResultRow
              label="Kompensasiya"
              value={fmt(result.severance)}
              bold
            />
          )}
          {result.unusedVacationDays > 0 && (
            <ResultRow
              label={`İstifadə olunmamış məzuniyyət (${result.unusedVacationDays} gün)`}
              value={fmt(result.unusedVacation)}
            />
          )}
          <ResultRow
            label="Ümumi ödəniş"
            value={fmt(result.total)}
            highlight
            bold
          />
        </ResultSection>
      )}
    </View>
  );
}
