import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Reason = "layoff" | "agreement" | "voluntary" | "contract-end";

function getCompMonths(years: number): number {
  if (years < 1) return 1;
  if (years < 5) return 1.4;
  if (years < 10) return 1.7;
  return 2;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DismissalCalculator() {
  const [salary, setSalary] = useState("1500");
  const [years, setYears] = useState("3");
  const [unusedDays, setUnusedDays] = useState("10");
  const [reason, setReason] = useState<Reason>("layoff");

  const result = useMemo(() => {
    const gross = parseFloat(salary) || 0;
    const yrs = parseFloat(years) || 0;
    const days = parseInt(unusedDays) || 0;
    if (gross <= 0) return null;

    const compMonths = getCompMonths(yrs);
    let compensation = 0;
    if (reason === "layoff" || reason === "agreement") {
      compensation = gross * compMonths;
    } else if (reason === "contract-end") {
      compensation = gross * compMonths * 0.5;
    }

    const vacationPay = (gross / 30.4) * days;
    const total = compensation + vacationPay;

    const compLabel = yrs < 1 ? "1 aylıq" : yrs < 5 ? "1.4 aylıq" : yrs < 10 ? "1.7 aylıq" : "2 aylıq";

    return { compensation, vacationPay, total, compMonths, compLabel };
  }, [salary, years, unusedDays, reason]);

  return (
    <View>
      <SegmentControl
        label="İşdən çıxma səbəbi"
        options={[
          { value: "layoff", label: "İxtisar" },
          { value: "agreement", label: "Razılıq" },
          { value: "voluntary", label: "Öz istəyi" },
          { value: "contract-end", label: "Müqavilə" },
        ]}
        selected={reason}
        onSelect={setReason}
      />

      <InputField label="Aylıq əmək haqqı" value={salary} onChangeText={setSalary} placeholder="1500" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="İş stajı" value={years} onChangeText={setYears} placeholder="3" keyboardType="decimal-pad" suffix="il" />
      <InputField label="İstifadə olunmamış məzuniyyət" value={unusedDays} onChangeText={setUnusedDays} placeholder="10" keyboardType="numeric" suffix="gün" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi ödəniş" value={fmt(result.total)} highlight bold />
          {reason !== "voluntary" && (
            <ResultRow label={`Kompensasiya (${result.compLabel})`} value={fmt(result.compensation)} />
          )}
          {reason === "voluntary" && (
            <ResultRow label="Kompensasiya" value="Ödənilmir" />
          )}
          <ResultRow label="Məzuniyyət pulu" value={fmt(result.vacationPay)} />
        </ResultSection>
      )}
    </View>
  );
}
