import { useState, useMemo } from "react";
import { View, Text, Pressable, Share, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { FormulaSection, RelatedCalculators } from "@/components/Content";

const birler = ["", "bir", "iki", "üç", "dörd", "beş", "altı", "yeddi", "səkkiz", "doqquz"];
const onluqlar = ["", "on", "iyirmi", "otuz", "qırx", "əlli", "altmış", "yetmiş", "səksən", "doxsan"];

function convertHundreds(n: number): string {
  if (n === 0) return "";

  let result = "";

  const yuz = Math.floor(n / 100);
  const qalan = n % 100;
  const onluq = Math.floor(qalan / 10);
  const birlik = qalan % 10;

  if (yuz > 0) {
    result += (yuz === 1 ? "" : birler[yuz] + " ") + "yüz";
    if (qalan > 0) result += " ";
  }

  if (onluq > 0) {
    result += onluqlar[onluq];
    if (birlik > 0) result += " ";
  }

  if (birlik > 0) {
    result += birler[birlik];
  }

  return result;
}

function numberToWords(num: number): string {
  if (num === 0) return "sıfır";

  const parts: string[] = [];

  const trilyon = Math.floor(num / 1_000_000_000_000);
  const milyard = Math.floor((num % 1_000_000_000_000) / 1_000_000_000);
  const milyon = Math.floor((num % 1_000_000_000) / 1_000_000);
  const min = Math.floor((num % 1_000_000) / 1_000);
  const yuz = Math.floor(num % 1_000);

  if (trilyon > 0) parts.push(convertHundreds(trilyon) + " trilyon");
  if (milyard > 0) parts.push(convertHundreds(milyard) + " milyard");
  if (milyon > 0) parts.push(convertHundreds(milyon) + " milyon");
  if (min > 0) parts.push((min === 1 ? "bir" : convertHundreds(min)) + " min");
  if (yuz > 0) parts.push(convertHundreds(yuz));

  return parts.join(" ");
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function convertToAznWords(value: number): string {
  const manat = Math.floor(value);
  const qepik = Math.round((value - manat) * 100);

  let result = "";

  if (manat > 0) {
    result = capitalize(numberToWords(manat)) + " manat";
  }

  if (qepik > 0) {
    const qepikText = numberToWords(qepik) + " qəpik";
    if (manat > 0) {
      result += " " + qepikText;
    } else {
      result = capitalize(qepikText);
    }
  }

  if (manat === 0 && qepik === 0) {
    result = "Sıfır manat";
  }

  return result;
}

const examples = [
  { value: 1500.5, label: "1 500,50" },
  { value: 25000, label: "25 000" },
  { value: 100.01, label: "100,01" },
  { value: 999999.99, label: "999 999,99" },
];

const pt = {
  formulaTitle: "Məbləğin sözlə yazılışı qaydaları",
  formulaContent: `Azərbaycan dilində məbləğin sözlə yazılışı:
• Rəqəmlər: bir, iki, üç, dörd, beş, altı, yeddi, səkkiz, doqquz
• Onluqlar: on, iyirmi, otuz, qırx, əlli, altmış, yetmiş, səksən, doxsan
• Böyük rəqəmlər: yüz, min, milyon, milyard, trilyon
• Valyuta: manat və qəpik

Məsələn: 1 547,32 → Bir min beş yüz qırx yeddi manat otuz iki qəpik`,
  amountLabel: "Məbləğ (AZN)",
  maxNote: "Maksimum: 999 999 999 999,99 AZN (1 trilyona qədər)",
  writtenForm: "Sözlə yazılışı",
  copied: "Kopyalandı!",
  copy: "Kopyala",
  examples: "Nümunələr",
  emptyStateText: "Nəticəni görmək üçün məbləği daxil edin.",
};

export function AznWordsCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const value = parseFloat(amount.replace(/\s/g, "").replace(",", "."));
    if (isNaN(value) || value < 0 || value > 999999999999.99) return null;
    return convertToAznWords(value);
  }, [amount]);

  // Mobil tətbiqdə panoya birbaşa yazmaq üçün əlavə paket yoxdur —
  // sistemin paylaşma pəncərəsi açılır (orada "Kopyala" seçimi var).
  const handleCopy = async () => {
    if (!result) return;
    try {
      const res = await Share.share({ message: result });
      if (res.action !== Share.dismissedAction) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const ExamplesList = () => (
    <View style={[styles.exBox, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
      <View style={[styles.exHeader, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
        <Text style={[styles.exTitle, { color: colors.n940 }]}>📝 {pt.examples}</Text>
      </View>
      {examples.map((ex, i) => (
        <Pressable
          key={ex.value}
          onPress={() => setAmount(ex.value.toString())}
          style={[
            styles.exRow,
            i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.n280 },
          ]}
        >
          <Text style={[styles.exLabel, { color: colors.n940 }]}>{ex.label} AZN</Text>
          <Text style={[styles.exWords, { color: colors.n580 }]}>{convertToAznWords(ex.value)}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View>
      <InputField
        label={`💵 ${pt.amountLabel}`}
        value={amount}
        onChangeText={setAmount}
        placeholder="1547.32"
        keyboardType="decimal-pad"
        hint={pt.maxNote}
      />

      {result ? (
        <View>
          <View style={[styles.hero, { backgroundColor: colors.accent }]}>
            <Text style={[styles.heroLabel, { color: colors.onAccent }]}>{pt.writtenForm}</Text>
            <Text selectable style={[styles.heroText, { color: colors.onAccent }]}>
              {result}
            </Text>
          </View>

          <Pressable
            onPress={handleCopy}
            style={[
              styles.copyBtn,
              copied
                ? { backgroundColor: "#22c55e22", borderColor: "#22c55e88" }
                : { backgroundColor: colors.n240, borderColor: colors.n280 },
            ]}
          >
            <Text style={[styles.copyText, { color: copied ? "#22c55e" : colors.n940 }]}>
              {copied ? pt.copied : `📋 ${pt.copy}`}
            </Text>
          </Pressable>

          <ExamplesList />
        </View>
      ) : (
        <View>
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔤</Text>
            <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyStateText}</Text>
          </View>
          <ExamplesList />
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["percentage", "discount", "currency", "vat"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 16, padding: 18, marginTop: 8 },
  heroLabel: { fontSize: 13, fontWeight: "600", opacity: 0.85, marginBottom: 8 },
  heroText: { fontSize: 20, fontWeight: "700", lineHeight: 30 },
  copyBtn: { borderRadius: 12, borderWidth: 1, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  copyText: { fontSize: 15, fontWeight: "600" },
  exBox: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 16 },
  exHeader: { paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1 },
  exTitle: { fontSize: 15, fontWeight: "600" },
  exRow: { paddingHorizontal: 16, paddingVertical: 11, gap: 3 },
  exLabel: { fontSize: 14, fontWeight: "600" },
  exWords: { fontSize: 13, lineHeight: 18 },
  empty: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
