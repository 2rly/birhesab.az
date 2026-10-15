import { useState, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { Select } from "@/components/Select";
import { SectionHeading, InfoBox, DataTable, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fetchCbarLatest } from "@/lib/cbar";

interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
}

const currencyList: CurrencyInfo[] = [
  { code: "AZN", name: "Azərbaycan manatı", flag: "🇦🇿" },
  { code: "USD", name: "ABŞ dolları", flag: "🇺🇸" },
  { code: "EUR", name: "Avro", flag: "🇪🇺" },
  { code: "GBP", name: "Britaniya funtu", flag: "🇬🇧" },
  { code: "CHF", name: "İsveçrə frankı", flag: "🇨🇭" },
  { code: "TRY", name: "Türk lirəsi", flag: "🇹🇷" },
  { code: "RUB", name: "Rusiya rublu", flag: "🇷🇺" },
  { code: "UAH", name: "Ukrayna qrivnası", flag: "🇺🇦" },
  { code: "GEL", name: "Gürcüstan larisi", flag: "🇬🇪" },
  { code: "KZT", name: "Qazaxıstan tengesi", flag: "🇰🇿" },
  { code: "UZS", name: "Özbəkistan somu", flag: "🇺🇿" },
  { code: "TMT", name: "Türkmənistan manatı", flag: "🇹🇲" },
  { code: "SAR", name: "Səudiyyə riyalı", flag: "🇸🇦" },
  { code: "AED", name: "BƏƏ dirhəmi", flag: "🇦🇪" },
  { code: "CNY", name: "Çin yuanı", flag: "🇨🇳" },
  { code: "JPY", name: "Yapon yeni", flag: "🇯🇵" },
  { code: "KRW", name: "Koreya vonu", flag: "🇰🇷" },
  { code: "INR", name: "Hindistan rupisi", flag: "🇮🇳" },
  { code: "CAD", name: "Kanada dolları", flag: "🇨🇦" },
  { code: "AUD", name: "Avstraliya dolları", flag: "🇦🇺" },
  { code: "NZD", name: "Yeni Zelandiya dolları", flag: "🇳🇿" },
  { code: "SEK", name: "İsveç kronu", flag: "🇸🇪" },
  { code: "NOK", name: "Norveç kronu", flag: "🇳🇴" },
  { code: "DKK", name: "Danimarka kronu", flag: "🇩🇰" },
  { code: "PLN", name: "Polşa zlotısı", flag: "🇵🇱" },
  { code: "CZK", name: "Çexiya kronu", flag: "🇨🇿" },
  { code: "HUF", name: "Macarıstan forinti", flag: "🇭🇺" },
  { code: "RON", name: "Rumıniya leyi", flag: "🇷🇴" },
  { code: "BGN", name: "Bolqarıstan levi", flag: "🇧🇬" },
  { code: "BYN", name: "Belarus rublu", flag: "🇧🇾" },
  { code: "MDL", name: "Moldova leyi", flag: "🇲🇩" },
  { code: "RSD", name: "Serbiya dinarı", flag: "🇷🇸" },
  { code: "KGS", name: "Qırğızıstan somu", flag: "🇰🇬" },
  { code: "PKR", name: "Pakistan rupisi", flag: "🇵🇰" },
  { code: "SGD", name: "Sinqapur dolları", flag: "🇸🇬" },
  { code: "HKD", name: "Honq Konq dolları", flag: "🇭🇰" },
  { code: "KWD", name: "Küveyt dinarı", flag: "🇰🇼" },
  { code: "QAR", name: "Qətər rialı", flag: "🇶🇦" },
  { code: "ILS", name: "İsrail şekeli", flag: "🇮🇱" },
  { code: "SDR", name: "SDR (BVF)", flag: "💎" },
  { code: "XAU", name: "Qızıl (1 troy unsiyası)", flag: "🥇" },
  { code: "XAG", name: "Gümüş (1 troy unsiyası)", flag: "🥈" },
  { code: "XPT", name: "Platin (1 troy unsiyası)", flag: "⬜" },
  { code: "XPD", name: "Palladium (1 troy unsiyası)", flag: "🔲" },
];

/** az-AZ lokalı: qruplar "." ilə, onluq "," ilə, maks. 2 onluq rəqəm (toLocaleString ekvivalenti). */
function azLocale(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const [int, frac] = rounded.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const f = frac.replace(/0+$/, "");
  return f ? `${grouped},${f}` : grouped;
}

function formatAmount(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001 && n > 0) return n.toFixed(8);
  if (n < 0.01 && n > 0) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  if (n >= 1000000) return azLocale(n);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const pt = {
  formulaTitle: "Məzənnə haqqında",
  formulaContent: `Bu çevirici Azərbaycan Mərkəzi Bankının (CBAR) rəsmi gündəlik məzənnələrindən istifadə edir.

Məzənnələr hər gün avtomatik yenilənir.

Mənbə: www.cbar.az`,
  from: "Buradan",
  to: "Bura",
  swapLabel: "Dəyişdir",
  exchangeRate: "Məzənnə",
  allCurrencies: "bütün valyutalarda",
  rateTable: "CBAR rəsmi məzənnə cədvəli",
  currencyCol: "Valyuta",
  oneUnitAzn: "1 vahid = AZN",
  oneAznEquals: "1 AZN =",
  source: "Mənbə",
  cbarOfficial: "Azərbaycan Respublikası Mərkəzi Bankı (CBAR)",
  rateDate: "Məzənnə tarixi",
  loading: "Məzənnələr yüklənir...",
  loadError: "Məzənnələr yüklənmədi. Təxmini dəyərlər göstərilir.",
  liveRates: "Canlı məzənnələr",
};

// API uğursuz olarsa istifadə olunan təxmini məzənnələr (saytdakı kimi)
const fallbackRates: Record<string, number> = {
  AZN: 1, USD: 1.7, EUR: 1.9608, GBP: 2.2485, CHF: 2.1283, TRY: 0.0381, RUB: 0.021123,
  UAH: 0.0388, GEL: 0.6327, KZT: 0.003595, UZS: 0.00014, TMT: 0.4857, SAR: 0.4529,
  AED: 0.4628, CNY: 0.247, JPY: 0.01065, KRW: 0.001127, INR: 0.0183, CAD: 1.2208,
  AUD: 1.1741, NZD: 0.9704, SEK: 0.1801, NOK: 0.1746, DKK: 0.2624, PLN: 0.4583,
  CZK: 0.08, HUF: 0.005102, RON: 0.3847, BGN: 0.946, BYN: 0.5759, MDL: 0.0966,
  RSD: 0.0167, KGS: 0.0194, PKR: 0.006076, SGD: 1.3221, HKD: 0.2169, KWD: 5.4949,
  QAR: 0.4662, ILS: 0.5423, SDR: 2.3096, XAU: 7950.492, XAG: 124.129, XPT: 3381.9885, XPD: 2557.531,
};

export function CurrencyCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("1");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("AZN");
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [rateDate, setRateDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchCbarLatest()
      .then((data) => {
        if (!alive) return;
        if (data?.rates) {
          setRates((prev) => ({ ...prev, ...data.rates }));
          setRateDate(data.date || "");
          setIsLive(true);
        } else {
          setFailed(true);
        }
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const availableCurrencies = useMemo(() => currencyList.filter((c) => c.code in rates), [rates]);

  const from = availableCurrencies.find((c) => c.code === fromCode) || availableCurrencies[0];
  const to = availableCurrencies.find((c) => c.code === toCode) || availableCurrencies[1];

  const result = useMemo(() => {
    const a = parseFloat(amount.replace(",", "."));
    if (!a || a <= 0) return null;
    const fromRate = rates[from.code] || 1;
    const toRate = rates[to.code] || 1;
    const inAZN = a * fromRate;
    const converted = inAZN / toRate;
    const rate = fromRate / toRate;
    const reverseRate = toRate / fromRate;
    return { converted, rate, reverseRate, inAZN };
  }, [amount, from, to, rates]);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const allConversions = useMemo(() => {
    const a = parseFloat(amount.replace(",", "."));
    if (!a || a <= 0) return [];
    const fromRate = rates[from.code] || 1;
    const inAZN = a * fromRate;
    return availableCurrencies
      .filter((c) => c.code !== from.code)
      .map((c) => {
        const cRate = rates[c.code] || 1;
        return { ...c, converted: inAZN / cRate, rate: fromRate / cRate };
      });
  }, [amount, from, rates, availableCurrencies]);

  const options = availableCurrencies.map((c) => ({
    value: c.code,
    label: `${c.flag} ${c.code}`,
    description: c.name,
  }));

  return (
    <View>
      {/* Canlı nişanı */}
      {isLive && !!rateDate && (
        <View style={[styles.liveBadge, { backgroundColor: "#22c55e1a", borderColor: "#22c55e66" }]}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveText, { color: colors.n840 }]}>
            {pt.liveRates} — CBAR {rateDate}
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={{ color: colors.n580, fontSize: 13 }}>{pt.loading}</Text>
        </View>
      )}

      {!loading && failed && <InfoBox variant="warning">{pt.loadError}</InfoBox>}

      {/* Buradan */}
      <Text style={[styles.label, { color: colors.n840 }]}>{pt.from}</Text>
      <View style={styles.row}>
        <View style={styles.selectCol}>
          <Select value={from.code} options={options} onSelect={setFromCode} searchable />
        </View>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="1"
          placeholderTextColor={colors.n580}
          keyboardType="decimal-pad"
          style={[styles.amountInput, { color: colors.n960, borderColor: colors.n280, backgroundColor: colors.n240 }]}
        />
      </View>
      <Text style={[styles.sub, { color: colors.n580 }]}>
        {from.flag} {from.name}
      </Text>

      {/* Dəyişdir */}
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Pressable
          onPress={swap}
          accessibilityLabel={pt.swapLabel}
          style={[styles.swapBtn, { borderColor: colors.n280, backgroundColor: colors.n200 }]}
        >
          <MaterialIcons name="swap-vert" size={22} color={colors.accent} />
        </Pressable>
      </View>

      {/* Bura */}
      <Text style={[styles.label, { color: colors.n840 }]}>{pt.to}</Text>
      <View style={styles.row}>
        <View style={styles.selectCol}>
          <Select value={to.code} options={options} onSelect={setToCode} searchable />
        </View>
        <View style={[styles.amountInput, styles.resultBox, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
          <Text style={{ color: colors.n960, fontSize: 16, fontWeight: "700" }} numberOfLines={1}>
            {result ? formatAmount(result.converted) : "—"}
          </Text>
        </View>
      </View>
      <Text style={[styles.sub, { color: colors.n580 }]}>
        {to.flag} {to.name}
      </Text>

      {result && (
        <View>
          {/* Məzənnə */}
          <View style={[styles.hero, { backgroundColor: colors.accent }]}>
            <Text style={[styles.heroLabel, { color: colors.onAccent }]}>{pt.exchangeRate}</Text>
            <Text style={[styles.heroValue, { color: colors.onAccent }]}>
              1 {from.code} = {formatAmount(result.rate)} {to.code}
            </Text>
            <Text style={[styles.heroLabel, { color: colors.onAccent }]}>
              1 {to.code} = {formatAmount(result.reverseRate)} {from.code}
            </Text>
          </View>

          {/* Bütün valyutalarda */}
          <SectionHeading icon="💱">
            {amount} {from.code} — {pt.allCurrencies}
          </SectionHeading>
          {allConversions.map((c) => {
            const active = c.code === toCode;
            return (
              <Pressable
                key={c.code}
                onPress={() => setToCode(c.code)}
                style={[
                  styles.convRow,
                  {
                    borderColor: active ? colors.accent : colors.n280,
                    backgroundColor: active ? colors.accent + "1f" : colors.n200,
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Text style={{ fontSize: 24 }}>{c.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.n940, fontSize: 14, fontWeight: "600" }}>{c.code}</Text>
                    <Text style={{ color: colors.n580, fontSize: 12 }} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.n940, fontSize: 15, fontWeight: "700" }}>{formatAmount(c.converted)}</Text>
                  <Text style={{ color: colors.n580, fontSize: 12 }}>
                    1 {from.code} = {formatAmount(c.rate)}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {/* Məzənnə cədvəli */}
          <SectionHeading icon="📊">{pt.rateTable}</SectionHeading>
          <DataTable
            headers={[pt.currencyCol, pt.oneUnitAzn, pt.oneAznEquals]}
            columnWidths={[230, 130, 150]}
            rows={availableCurrencies
              .filter((c) => c.code !== "AZN")
              .map((c) => {
                const r = rates[c.code] || 0;
                return [
                  `${c.flag} ${c.code} — ${c.name}`,
                  `${formatAmount(r)} AZN`,
                  `${r > 0 ? formatAmount(1 / r) : "—"} ${c.code}`,
                ];
              })}
          />

          {/* Mənbə */}
          <InfoBox variant="info" title={`🏦 ${pt.source}: ${pt.cbarOfficial}`}>
            <View>
              {!!rateDate && (
                <Text style={{ color: colors.n760, fontSize: 12 }}>
                  {pt.rateDate}: {rateDate}
                </Text>
              )}
              <Text style={{ color: colors.n760, fontSize: 12, marginTop: 2 }}>www.cbar.az</Text>
            </View>
          </InfoBox>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["vat", "deposit", "salary", "customs-duty"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
  liveText: { fontSize: 12, fontWeight: "600" },
  loading: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  selectCol: { width: 130, marginBottom: -16 },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  resultBox: { justifyContent: "center" },
  sub: { fontSize: 12, marginTop: 6 },
  swapBtn: { borderWidth: 1, borderRadius: 24, padding: 10 },
  hero: { borderRadius: 16, padding: 18, marginTop: 20, alignItems: "center", gap: 4 },
  heroLabel: { fontSize: 13, opacity: 0.85, textAlign: "center" },
  heroValue: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
});
