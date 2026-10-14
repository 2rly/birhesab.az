import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type TxType = "sale" | "poa" | "will" | "lease" | "company";
type PoaType = "simple" | "general";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function calcSaleFee(price: number): number {
  if (price <= 10000) return price * 0.005 + 15;
  if (price <= 50000) return 50 + (price - 10000) * 0.003;
  if (price <= 100000) return 170 + (price - 50000) * 0.002;
  return 270 + (price - 100000) * 0.001;
}

function calcLeaseFee(total: number): number {
  if (total <= 5000) return total * 0.005 + 10;
  if (total <= 20000) return 35 + total * 0.003;
  return 80 + total * 0.002;
}

function calcCompanyFee(capital: number): number {
  if (capital <= 10000) return 100 + capital * 0.005;
  return 150 + (capital - 10000) * 0.003;
}

export function NotaryCalculator() {
  const [txType, setTxType] = useState<TxType>("sale");
  const [price, setPrice] = useState("50000");
  const [poaType, setPoaType] = useState<PoaType>("simple");
  const [monthlyRent, setMonthlyRent] = useState("500");
  const [leaseDuration, setLeaseDuration] = useState("12");
  const [capital, setCapital] = useState("5000");

  const result = useMemo(() => {
    if (txType === "sale") {
      const p = parseFloat(price) || 0;
      if (p <= 0) return null;
      return { fee: calcSaleFee(p), label: "Alqı-satqı rüsumu" };
    }
    if (txType === "poa") {
      return { fee: poaType === "simple" ? 20 : 50, label: poaType === "simple" ? "Sadə etibarnamə" : "Ümumi etibarnamə" };
    }
    if (txType === "will") {
      return { fee: 30, label: "Vəsiyyətnamə" };
    }
    if (txType === "lease") {
      const rent = parseFloat(monthlyRent) || 0;
      const dur = parseInt(leaseDuration) || 0;
      if (rent <= 0 || dur <= 0) return null;
      const total = rent * dur;
      return { fee: calcLeaseFee(total), label: `İcarə (${dur} ay, cəmi ${fmt(total)})` };
    }
    if (txType === "company") {
      const cap = parseFloat(capital) || 0;
      if (cap <= 0) return null;
      return { fee: calcCompanyFee(cap), label: "Şirkət təsis sənədləri" };
    }
    return null;
  }, [txType, price, poaType, monthlyRent, leaseDuration, capital]);

  return (
    <View>
      <SegmentControl
        label="Əməliyyat növü"
        options={[
          { value: "sale", label: "Alqı-satqı" },
          { value: "poa", label: "Etibarnamə" },
          { value: "will", label: "Vəsiyyət" },
          { value: "lease", label: "İcarə" },
        ]}
        selected={txType}
        onSelect={setTxType}
      />

      {txType === "sale" && (
        <InputField label="Əmlakın qiyməti" value={price} onChangeText={setPrice} placeholder="50000" keyboardType="decimal-pad" suffix="₼" />
      )}

      {txType === "poa" && (
        <SegmentControl
          label="Etibarnamə növü"
          options={[
            { value: "simple", label: "Sadə" },
            { value: "general", label: "Ümumi" },
          ]}
          selected={poaType}
          onSelect={setPoaType}
        />
      )}

      {txType === "lease" && (
        <>
          <InputField label="Aylıq icarə haqqı" value={monthlyRent} onChangeText={setMonthlyRent} placeholder="500" keyboardType="decimal-pad" suffix="₼" />
          <InputField label="Müddət" value={leaseDuration} onChangeText={setLeaseDuration} placeholder="12" keyboardType="numeric" suffix="ay" />
        </>
      )}

      {txType === "company" && (
        <InputField label="Nizamnamə kapitalı" value={capital} onChangeText={setCapital} placeholder="5000" keyboardType="decimal-pad" suffix="₼" />
      )}

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Notarius rüsumu" value={fmt(result.fee)} highlight bold />
          <ResultRow label="Əməliyyat" value={result.label} />
        </ResultSection>
      )}
    </View>
  );
}
