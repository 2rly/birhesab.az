import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

const DIVIDEND_TAX_RATE = 0.05;

type Frequency = "monthly" | "quarterly" | "annual";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function DividendTaxCalculator() {
  const [grossDividend, setGrossDividend] = useState("10000");
  const [frequency, setFrequency] = useState<Frequency>("annual");

  const result = useMemo(() => {
    const gross = parseFloat(grossDividend) || 0;
    if (gross <= 0) return null;

    const taxAmount = gross * DIVIDEND_TAX_RATE;
    const netDividend = gross - taxAmount;

    let periodsPerYear: number;
    switch (frequency) {
      case "monthly":
        periodsPerYear = 12;
        break;
      case "quarterly":
        periodsPerYear = 4;
        break;
      default:
        periodsPerYear = 1;
    }

    const annualGross = gross * periodsPerYear;
    const annualTax = annualGross * DIVIDEND_TAX_RATE;
    const annualNet = annualGross - annualTax;

    return {
      gross,
      taxAmount,
      netDividend,
      annualGross,
      annualTax,
      annualNet,
      periodsPerYear,
    };
  }, [grossDividend, frequency]);

  return (
    <View>
      <SegmentControl
        label="Ödəniş tezliyi"
        options={[
          { value: "monthly", label: "Aylıq" },
          { value: "quarterly", label: "Rüblük" },
          { value: "annual", label: "İllik" },
        ]}
        selected={frequency}
        onSelect={setFrequency}
      />

      <InputField
        label="Ümumi dividend məbləği"
        value={grossDividend}
        onChangeText={setGrossDividend}
        placeholder="10000"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow
              label="Ümumi dividend"
              value={fmt(result.gross)}
            />
            <ResultRow
              label="Vergi (5%)"
              value={fmt(result.taxAmount)}
            />
            <ResultRow
              label="Xalis dividend"
              value={fmt(result.netDividend)}
              highlight
              bold
            />
          </ResultSection>

          {result.periodsPerYear > 1 && (
            <ResultSection title="İllik hesablama">
              <ResultRow
                label="İllik ümumi dividend"
                value={fmt(result.annualGross)}
              />
              <ResultRow
                label="İllik vergi"
                value={fmt(result.annualTax)}
              />
              <ResultRow
                label="İllik xalis gəlir"
                value={fmt(result.annualNet)}
                highlight
                bold
              />
            </ResultSection>
          )}
        </>
      )}
    </View>
  );
}
