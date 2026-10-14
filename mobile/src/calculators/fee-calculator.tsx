import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const FEE_TYPES = [
  { id: "passport", name: "Şəxsiyyət vəsiqəsi", fee: 15 },
  { id: "birth_cert", name: "Doğum şəhadətnaməsi", fee: 5 },
  { id: "marriage", name: "Nikah qeydiyyatı", fee: 11 },
  { id: "divorce", name: "Boşanma qeydiyyatı", fee: 35 },
  { id: "driver", name: "Sürücülük vəsiqəsi", fee: 20 },
  { id: "vehicle_reg", name: "Nəqliyyat qeydiyyatı", fee: 25 },
  { id: "company_reg", name: "Şirkət qeydiyyatı", fee: 110 },
  { id: "visa", name: "Viza rüsumu", fee: 20 },
];

function fmt(n: number): string {
  return n.toFixed(2) + " ₼";
}

export function FeeCalculator() {
  const { colors } = useTheme();
  const [selectedFee, setSelectedFee] = useState("passport");

  const fee = FEE_TYPES.find((f) => f.id === selectedFee);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Rüsum növü</Text>
      <View style={styles.chipRow}>
        {FEE_TYPES.map((f) => (
          <Pressable
            key={f.id}
            style={[styles.chip, { backgroundColor: colors.n240 }, selectedFee === f.id && { backgroundColor: colors.accent }]}
            onPress={() => setSelectedFee(f.id)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, selectedFee === f.id && { color: colors.onAccent }]}>{f.name}</Text>
          </Pressable>
        ))}
      </View>

      {fee && (
        <ResultSection title="Rüsum məbləği">
          <ResultRow label={fee.name} value={fmt(fee.fee)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },
});
