import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type MetalType = "gold585" | "gold750" | "gold999" | "silver925";

const METALS = {
  gold585: { label: "Qızıl 585 (14K)", price: 45 },
  gold750: { label: "Qızıl 750 (18K)", price: 58 },
  gold999: { label: "Qızıl 999 (24K)", price: 77 },
  silver925: { label: "Gümüş 925", price: 1.2 },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function GoldSilverCalculator() {
  const { colors } = useTheme();
  const [metalType, setMetalType] = useState<MetalType>("gold585");
  const [weight, setWeight] = useState("10");

  const metal = METALS[metalType];

  const result = useMemo(() => {
    const w = parseFloat(weight) || 0;
    if (w <= 0) return null;
    return { totalValue: w * metal.price, pricePerGram: metal.price };
  }, [weight, metal]);

  return (
    <View>
      <SegmentControl
        label="Metal növü"
        options={[
          { value: "gold585", label: "14K" },
          { value: "gold750", label: "18K" },
          { value: "gold999", label: "24K" },
          { value: "silver925", label: "Gümüş" },
        ]}
        selected={metalType}
        onSelect={setMetalType}
      />

      <InputField label="Çəki" value={weight} onChangeText={setWeight} placeholder="10" keyboardType="decimal-pad" suffix="qram" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Ümumi dəyər" value={fmt(result.totalValue)} highlight bold />
          <ResultRow label="Metal" value={metal.label} />
          <ResultRow label="1 qram qiyməti" value={fmt(result.pricePerGram)} />
        </ResultSection>
      )}

      <Text style={[styles.note, { color: colors.n500c }]}>
        Qeyd: Qiymətlər təxminidir. Dəqiq qiymət üçün zərgərlik mağazasına müraciət edin.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 12, fontStyle: "italic", marginTop: 16, textAlign: "center" },
});
