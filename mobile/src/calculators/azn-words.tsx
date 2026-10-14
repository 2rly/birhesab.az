import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const ONES = ["", "bir", "iki", "üç", "dörd", "beş", "altı", "yeddi", "səkkiz", "doqquz"];
const TEENS = ["on", "on bir", "on iki", "on üç", "on dörd", "on beş", "on altı", "on yeddi", "on səkkiz", "on doqquz"];
const TENS = ["", "", "iyirmi", "otuz", "qırx", "əlli", "altmış", "yetmiş", "səksən", "doxsan"];

function numberToWords(n: number): string {
  if (n === 0) return "sıfır";
  if (n < 0) return "mənfi " + numberToWords(-n);

  let result = "";

  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    result += (millions === 1 ? "" : numberToWords(millions) + " ") + "milyon ";
    n %= 1000000;
  }

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    result += (thousands === 1 ? "" : numberToWords(thousands) + " ") + "min ";
    n %= 1000;
  }

  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    result += (hundreds === 1 ? "" : ONES[hundreds] + " ") + "yüz ";
    n %= 100;
  }

  if (n >= 10 && n <= 19) {
    result += TEENS[n - 10];
  } else if (n >= 20) {
    result += TENS[Math.floor(n / 10)];
    if (n % 10 > 0) result += " " + ONES[n % 10];
  } else if (n > 0) {
    result += ONES[n];
  }

  return result.trim();
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function AznWordsCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) return null;

    const manat = Math.floor(val);
    const qepik = Math.round((val - manat) * 100);

    let words = numberToWords(manat) + " manat";
    if (qepik > 0) {
      words += " " + numberToWords(qepik) + " qəpik";
    }

    return { manat, qepik, words, formatted: fmt(val) };
  }, [amount]);

  return (
    <View>
      <InputField label="Məbləğ (AZN)" value={amount} onChangeText={setAmount} placeholder="1234.56" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <>
          <ResultSection title="Nəticə">
            <ResultRow label="Rəqəmlə" value={`${result.formatted} ₼`} />
          </ResultSection>
          <View style={[styles.wordsBox, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
            <Text style={[styles.wordsLabel, { color: colors.n580 }]}>Sözlə</Text>
            <Text style={[styles.wordsText, { color: colors.n940 }]}>{result.words}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wordsBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginTop: 16 },
  wordsLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase" },
  wordsText: { fontSize: 16, fontWeight: "600", lineHeight: 24 },
});
