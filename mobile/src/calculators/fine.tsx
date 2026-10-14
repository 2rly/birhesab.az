import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function FineCalculator() {
  const { colors } = useTheme();
  const [fineAmount, setFineAmount] = useState("");
  const [delayDays, setDelayDays] = useState("");

  const result = useMemo(() => {
    const fine = parseFloat(fineAmount) || 0;
    const days = parseInt(delayDays) || 0;
    if (fine <= 0) return null;

    const discounted = fine * 0.5;
    const penalty = days > 0 ? fine * 0.001 * days : 0;
    const totalWithPenalty = fine + penalty;

    return { fine, discounted, penalty, totalWithPenalty, days };
  }, [fineAmount, delayDays]);

  return (
    <View>
      <InputField label="Cərimə məbləği" value={fineAmount} onChangeText={setFineAmount} placeholder="200" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Gecikmə müddəti (gün)" value={delayDays} onChangeText={setDelayDays} placeholder="0" keyboardType="numeric" suffix="gün" />

      <View style={[styles.note, { backgroundColor: colors.n240 }]}>
        <Text style={[styles.noteText, { color: colors.n580 }]}>
          30 gün ərzində ödəsəniz 50% güzəşt tətbiq olunur.
        </Text>
      </View>

      {result && (
        <ResultSection title="Cərimə hesabı">
          <ResultRow label="Cərimə məbləği" value={fmt(result.fine)} />
          <ResultRow label="30 gün güzəştlə" value={fmt(result.discounted)} highlight bold />
          {result.penalty > 0 && (
            <>
              <ResultRow label={`Gecikdirmə penaltisi (${result.days} gün)`} value={fmt(result.penalty)} />
              <ResultRow label="Penalti ilə ümumi" value={fmt(result.totalWithPenalty)} bold />
            </>
          )}
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { borderRadius: 10, padding: 12, marginBottom: 16 },
  noteText: { fontSize: 12, lineHeight: 18 },
});
