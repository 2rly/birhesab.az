import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";

const BIRLER = [
  "",
  "bir",
  "iki",
  "üç",
  "dörd",
  "beş",
  "altı",
  "yeddi",
  "səkkiz",
  "doqquz",
];

const ONLUQLAR = [
  "",
  "on",
  "iyirmi",
  "otuz",
  "qırx",
  "əlli",
  "altmış",
  "yetmiş",
  "səksən",
  "doxsan",
];

function threeDigits(n: number): string {
  if (n === 0) return "";
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;

  if (hundreds > 0) {
    parts.push(hundreds === 1 ? "yüz" : BIRLER[hundreds] + " yüz");
  }
  if (tens > 0) parts.push(ONLUQLAR[tens]);
  if (ones > 0) parts.push(BIRLER[ones]);

  return parts.join(" ");
}

function numberToWords(n: number): string {
  if (n === 0) return "sıfır";

  const groups: { divisor: number; name: string }[] = [
    { divisor: 1_000_000_000, name: "milyard" },
    { divisor: 1_000_000, name: "milyon" },
    { divisor: 1_000, name: "min" },
    { divisor: 1, name: "" },
  ];

  const parts: string[] = [];
  let remaining = Math.floor(n);

  for (const { divisor, name } of groups) {
    if (remaining >= divisor) {
      const groupVal = Math.floor(remaining / divisor);
      remaining %= divisor;

      if (name === "min" && groupVal === 1) {
        parts.push("min");
      } else {
        const words = threeDigits(groupVal);
        parts.push(name ? `${words} ${name}` : words);
      }
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function AznWordsCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("1234.56");

  const text = useMemo(() => {
    const val = parseFloat(amount.replace(",", "."));
    if (isNaN(val) || val < 0) return null;
    if (val > 999_999_999_999.99) return null;

    const manat = Math.floor(val);
    const qepik = Math.round((val - manat) * 100);

    const parts: string[] = [];
    parts.push(numberToWords(manat));
    parts.push("manat");

    if (qepik > 0) {
      parts.push(numberToWords(qepik));
      parts.push("qəpik");
    }

    return capitalize(parts.join(" "));
  }, [amount]);

  return (
    <View>
      <InputField
        label="Məbləğ"
        value={amount}
        onChangeText={setAmount}
        placeholder="1234.56"
        keyboardType="decimal-pad"
        suffix="₼"
      />

      {text && (
        <View style={[styles.resultCard, { backgroundColor: colors.n240 }]}>
          <Text style={[styles.resultText, { color: colors.accent }]}>
            {text}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 28,
  },
});
