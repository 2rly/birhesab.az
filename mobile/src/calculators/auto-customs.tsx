import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type CarAge = "0-3" | "3-7" | "7+";

const USD_TO_AZN = 1.7;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function AutoCustomsCalculator() {
  const [price, setPrice] = useState("15000");
  const [engineCc, setEngineCc] = useState("2000");
  const [carAge, setCarAge] = useState<CarAge>("3-7");

  const result = useMemo(() => {
    const priceUsd = parseFloat(price) || 0;
    const cc = parseInt(engineCc) || 0;
    if (priceUsd <= 0 || cc <= 0) return null;

    const priceAzn = priceUsd * USD_TO_AZN;

    const customsRate = carAge === "0-3" ? 0.15 : carAge === "3-7" ? 0.20 : 0.30;
    const customsDuty = priceAzn * customsRate;

    let excisePerCc = 0.7;
    if (cc > 3000) excisePerCc = 1.5;
    else if (cc > 2000) excisePerCc = 1.0;
    const excise = cc * excisePerCc;

    const vat = (priceAzn + customsDuty + excise) * 0.18;
    const total = customsDuty + excise + vat;

    return { priceAzn, customsDuty, customsRate, excise, excisePerCc, vat, total };
  }, [price, engineCc, carAge]);

  return (
    <View>
      <SegmentControl
        label="Avtomobilin yaşı"
        options={[
          { value: "0-3", label: "0-3 il" },
          { value: "3-7", label: "3-7 il" },
          { value: "7+", label: "7+ il" },
        ]}
        selected={carAge}
        onSelect={setCarAge}
      />

      <InputField
        label="Qiymət"
        value={price}
        onChangeText={setPrice}
        placeholder="15000"
        keyboardType="decimal-pad"
        suffix="USD"
      />
      <InputField
        label="Mühərrik həcmi"
        value={engineCc}
        onChangeText={setEngineCc}
        placeholder="2000"
        keyboardType="numeric"
        suffix="cc"
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi gömrük xərci" value={fmt(result.total)} highlight bold />
          <ResultRow label="Qiymət (AZN)" value={fmt(result.priceAzn)} />
          <ResultRow
            label={`Gömrük rüsumu (${(result.customsRate * 100).toFixed(0)}%)`}
            value={fmt(result.customsDuty)}
          />
          <ResultRow
            label={`Aksiz (${result.excisePerCc} ₼/cc)`}
            value={fmt(result.excise)}
          />
          <ResultRow label="ƏDV (18%)" value={fmt(result.vat)} />
        </ResultSection>
      )}
    </View>
  );
}
