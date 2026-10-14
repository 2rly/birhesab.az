import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const CURRENCIES = [
  { code: "USD", name: "ABŞ dolları", rate: 1.7 },
  { code: "EUR", name: "Avro", rate: 1.87 },
  { code: "GBP", name: "Britaniya funtu", rate: 2.17 },
  { code: "TRY", name: "Türk lirəsi", rate: 0.049 },
  { code: "RUB", name: "Rus rublu", rate: 0.0175 },
  { code: "GEL", name: "Gürcü larisi", rate: 0.62 },
  { code: "UAH", name: "Ukrayna qrivnası", rate: 0.041 },
];

export function CurrencyCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("100");
  const [fromIdx, setFromIdx] = useState(0);
  const [toAzn, setToAzn] = useState(true);

  const from = CURRENCIES[fromIdx];

  const result = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (val <= 0 || !from) return null;

    if (toAzn) {
      return { converted: val * from.rate, label: "AZN" };
    } else {
      return { converted: val / from.rate, label: from.code };
    }
  }, [amount, from, toAzn]);

  return (
    <View>
      <Text style={[styles.note, { color: colors.n580 }]}>
        Qeyd: Məzənnələr mərkəzi bank kursu əsasında göstərilir
      </Text>

      <View style={styles.currencyPicker}>
        {CURRENCIES.map((c, i) => (
          <Pressable
            key={c.code}
            style={[
              styles.currChip,
              { backgroundColor: colors.n240 },
              fromIdx === i && { backgroundColor: colors.accent },
            ]}
            onPress={() => setFromIdx(i)}
          >
            <Text
              style={[
                styles.currChipText,
                { color: colors.n580 },
                fromIdx === i && { color: colors.onAccent },
              ]}
            >
              {c.code}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.directionToggle, { backgroundColor: colors.n240 }]}
        onPress={() => setToAzn(!toAzn)}
      >
        <Text style={[styles.directionText, { color: colors.n840 }]}>
          {toAzn ? `${from.code} → AZN` : `AZN → ${from.code}`}
        </Text>
        <MaterialIcons name="swap-horiz" size={20} color={colors.accent} />
      </Pressable>

      <InputField
        label={toAzn ? `Məbləğ (${from.code})` : "Məbləğ (AZN)"}
        value={amount}
        onChangeText={setAmount}
        placeholder="100"
        keyboardType="decimal-pad"
        suffix={toAzn ? from.code : "AZN"}
      />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow
            label="Çevrilmiş məbləğ"
            value={`${result.converted.toFixed(2)} ${result.label}`}
            highlight
            bold
          />
          <ResultRow
            label="Məzənnə"
            value={`1 ${from.code} = ${from.rate.toFixed(4)} AZN`}
          />
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 16,
  },
  currencyPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  currChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  currChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  directionToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  directionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
