import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function CryptoCalculator() {
  const { colors } = useTheme();
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [feePercent, setFeePercent] = useState("0.1");

  const result = useMemo(() => {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    const qty = parseFloat(amount) || 0;
    const fee = parseFloat(feePercent) || 0;
    if (buy <= 0 || qty <= 0) return null;

    const investment = buy * qty;
    const saleValue = sell > 0 ? sell * qty : 0;
    const buyFee = investment * (fee / 100);
    const sellFee = saleValue * (fee / 100);
    const totalFees = buyFee + sellFee;
    const profit = saleValue - investment - totalFees;
    const profitPercent = investment > 0 ? (profit / investment) * 100 : 0;

    return { investment, saleValue, buyFee, sellFee, totalFees, profit, profitPercent };
  }, [buyPrice, sellPrice, amount, feePercent]);

  return (
    <View>
      <InputField label="Alış qiyməti" value={buyPrice} onChangeText={setBuyPrice} placeholder="45000" keyboardType="decimal-pad" suffix="$" />
      <InputField label="Satış qiyməti" value={sellPrice} onChangeText={setSellPrice} placeholder="50000" keyboardType="decimal-pad" suffix="$" />
      <InputField label="Miqdar" value={amount} onChangeText={setAmount} placeholder="0.5" keyboardType="decimal-pad" />
      <InputField label="Komissiya faizi" value={feePercent} onChangeText={setFeePercent} placeholder="0.1" keyboardType="decimal-pad" suffix="%" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="İnvestisiya" value={`${fmt(result.investment)} $`} />
          {result.saleValue > 0 && <ResultRow label="Satış dəyəri" value={`${fmt(result.saleValue)} $`} />}
          <ResultRow label="Ümumi komissiya" value={`${fmt(result.totalFees)} $`} />
          {result.saleValue > 0 && (
            <>
              <ResultRow label="Mənfəət/Zərər" value={`${result.profit >= 0 ? "+" : ""}${fmt(result.profit)} $`} highlight bold />
              <ResultRow label="Faizlə" value={`${result.profitPercent >= 0 ? "+" : ""}${result.profitPercent.toFixed(2)}%`} />
            </>
          )}
        </ResultSection>
      )}
    </View>
  );
}
