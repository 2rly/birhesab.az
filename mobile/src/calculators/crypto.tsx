import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { Button } from "@/components/Controls";
import { SectionHeading, InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";

const USD_TO_AZN = 1.7;

interface CoinInfo {
  id: string;
  symbol: string;
  icon: string;
  name: string;
}

const coins: CoinInfo[] = [
  { id: "bitcoin", symbol: "BTC", icon: "₿", name: "Bitkoin" },
  { id: "ethereum", symbol: "ETH", icon: "Ξ", name: "Efirium" },
  { id: "solana", symbol: "SOL", icon: "◎", name: "Solana" },
  { id: "tether", symbol: "USDT", icon: "₮", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", icon: "⬡", name: "BNB" },
];

const pt = {
  formulaTitle: "Kripto qiymət necə hesablanır?",
  formulaContent: `Dəyər = Miqdar × Cari qiymət (USD)
AZN dəyəri = USD dəyəri × 1.70 (USD/AZN məzənnəsi)

Qiymətlər CoinGecko API-dən real vaxtda alınır.
Məzənnə: 1 USD = 1.70 AZN (Mərkəzi Bank təxmini məzənnəsi)

Diqqət: Kripto bazarı 24/7 işləyir və qiymətlər hər an dəyişə bilər.
Bu hesablayıcı yalnız informativ məqsədlə istifadə olunmalıdır.`,
  amount: "Miqdar",
  selectCoin: "Kriptovalyuta seçin",
  usdValue: "USD dəyəri",
  aznValue: "AZN dəyəri",
  currentPrice: "Cari qiymət",
  lastUpdated: "Son yenilənmə",
  refresh: "Yenilə",
  loading: "Qiymətlər yüklənir...",
  error: "Qiymətlər yüklənmədi. Yenidən cəhd edin.",
  retry: "Yenidən cəhd et",
  allPrices: "Bütün qiymətlər",
  perUnit: "1 vahid",
  enterAmount: "Nəticəni görmək üçün miqdar daxil edin.",
  warning: "Diqqət",
  warningText:
    "Qiymətlər CoinGecko-dan alınır və təxmini xarakter daşıyır. İnvestisiya qərarları üçün bu məlumatlara etibar etməyin.",
};

type Prices = Record<string, { usd: number; try: number }>;

function fmt(n: number): string {
  if (n < 0.01 && n > 0) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatTime(d: Date): string {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function CryptoCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("1");
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether,binancecoin&vs_currencies=usd,try"
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as Prices;
      setPrices(data);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const coin = coins.find((c) => c.id === selectedCoin)!;
  const coinPrice = prices?.[selectedCoin];

  const a = parseFloat(amount.replace(",", "."));
  const hasResult = !!coinPrice && !!a && a > 0;
  const usdValue = hasResult ? a * coinPrice.usd : 0;
  const aznValue = hasResult ? usdValue * USD_TO_AZN : 0;

  return (
    <View>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.n580, marginTop: 12 }}>{pt.loading}</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>⚠️</Text>
          <Text style={{ color: colors.n580, marginBottom: 14, textAlign: "center" }}>{pt.error}</Text>
          <Button title={pt.retry} onPress={fetchPrices} icon="refresh" />
        </View>
      )}

      {!loading && !error && prices && (
        <View>
          <Select
            label={pt.selectCoin}
            value={selectedCoin}
            onSelect={setSelectedCoin}
            options={coins.map((c) => ({ value: c.id, label: `${c.icon} ${c.symbol} — ${c.name}` }))}
          />

          <InputField
            label={`${pt.amount} (${coin.symbol})`}
            value={amount}
            onChangeText={setAmount}
            placeholder="1"
            keyboardType="decimal-pad"
          />

          {coinPrice && (
            <View style={styles.priceRow}>
              <Text style={{ color: colors.n580, fontSize: 13, flex: 1 }}>
                {pt.currentPrice}:{" "}
                <Text style={{ color: colors.n940, fontWeight: "700" }}>
                  1 {coin.symbol} = ${fmt(coinPrice.usd)}
                </Text>
              </Text>
              <Pressable onPress={fetchPrices} style={styles.refresh}>
                <MaterialIcons name="refresh" size={18} color={colors.accent} />
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "600" }}>{pt.refresh}</Text>
              </Pressable>
            </View>
          )}

          {hasResult ? (
            <View>
              <View style={[styles.card, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <Text style={{ color: colors.n580, fontSize: 13 }}>{pt.usdValue}</Text>
                <Text style={[styles.big, { color: colors.n960 }]}>${fmt(usdValue)}</Text>
                <Text style={{ color: colors.n580, fontSize: 12, marginTop: 6 }}>
                  {fmt(a)} {coin.symbol} × ${fmt(coinPrice.usd)}
                </Text>
              </View>
              <View style={[styles.card, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                <Text style={{ color: colors.onAccent, fontSize: 13, opacity: 0.85 }}>{pt.aznValue}</Text>
                <Text style={[styles.big, { color: colors.onAccent }]}>{fmt(aznValue)} AZN</Text>
                <Text style={{ color: colors.onAccent, fontSize: 12, marginTop: 6, opacity: 0.85 }}>
                  ${fmt(usdValue)} × 1.70
                </Text>
              </View>

              <SectionHeading icon="📊">
                {pt.allPrices} ({pt.perUnit})
              </SectionHeading>
              {coins.map((c) => {
                const p = prices[c.id];
                if (!p) return null;
                const isSelected = c.id === selectedCoin;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCoin(c.id)}
                    style={[
                      styles.coinRow,
                      {
                        backgroundColor: colors.n200,
                        borderColor: isSelected ? colors.accent : colors.n280,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Text style={{ fontSize: 22, width: 30, textAlign: "center", color: colors.n940 }}>{c.icon}</Text>
                      <View>
                        <Text style={{ color: colors.n940, fontSize: 14, fontWeight: "600" }}>{c.symbol}</Text>
                        <Text style={{ color: colors.n580, fontSize: 12 }}>{c.name}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ color: colors.n940, fontSize: 15, fontWeight: "700" }}>${fmt(p.usd)}</Text>
                      <Text style={{ color: colors.n580, fontSize: 12 }}>{fmt(p.usd * USD_TO_AZN)} AZN</Text>
                    </View>
                  </Pressable>
                );
              })}

              {lastUpdated && (
                <Text style={{ color: colors.n580, fontSize: 12, textAlign: "center", marginTop: 12 }}>
                  {pt.lastUpdated}: {formatTime(lastUpdated)}
                </Text>
              )}

              <InfoBox variant="warning" title={`⚠️ ${pt.warning}`}>
                {pt.warningText}
              </InfoBox>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>🪙</Text>
              <Text style={{ color: colors.n580, textAlign: "center" }}>{pt.enterAmount}</Text>
            </View>
          )}
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["currency", "gold-silver", "deposit"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", paddingVertical: 32 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, paddingHorizontal: 2 },
  refresh: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, alignItems: "center", marginBottom: 12 },
  big: { fontSize: 28, fontWeight: "800", marginTop: 4, textAlign: "center" },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
});
