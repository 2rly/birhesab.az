import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const DOCUMENTS = [
  { id: "passport", name: "Şəxsiyyət vəsiqəsi", fee: 15, urgent: 30 },
  { id: "birth", name: "Doğum haqqında şəhadətnamə", fee: 5, urgent: 10 },
  { id: "marriage", name: "Nikah şəhadətnaməsi", fee: 5, urgent: 10 },
  { id: "driver", name: "Sürücülük vəsiqəsi", fee: 20, urgent: 40 },
  { id: "vehicle", name: "Nəqliyyat şəhadətnaməsi", fee: 20, urgent: 40 },
  { id: "diploma", name: "Diplom", fee: 15, urgent: 30 },
];

function fmt(n: number): string {
  return n.toFixed(2) + " ₼";
}

export function LostDocFeeCalculator() {
  const { colors } = useTheme();
  const [selectedDoc, setSelectedDoc] = useState("passport");

  const result = useMemo(() => {
    const doc = DOCUMENTS.find((d) => d.id === selectedDoc);
    if (!doc) return null;
    return { name: doc.name, fee: doc.fee, urgent: doc.urgent };
  }, [selectedDoc]);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Sənəd növü</Text>
      <View style={styles.chipRow}>
        {DOCUMENTS.map((d) => (
          <Pressable
            key={d.id}
            style={[styles.chip, { backgroundColor: colors.n240 }, selectedDoc === d.id && { backgroundColor: colors.accent }]}
            onPress={() => setSelectedDoc(d.id)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, selectedDoc === d.id && { color: colors.onAccent }]}>{d.name}</Text>
          </Pressable>
        ))}
      </View>

      {result && (
        <ResultSection title="Rüsum məbləği">
          <ResultRow label="Standart rüsum" value={fmt(result.fee)} highlight bold />
          <ResultRow label="Təcili xidmət" value={fmt(result.urgent)} />
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
