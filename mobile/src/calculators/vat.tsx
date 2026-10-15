import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { StatGrid, FormulaSection, RelatedCalculators } from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";
import { OptionCards, SplitBar, Note, TintCard, KV, SEM } from "./_tax-parts";

type Direction = "add" | "extract";
type VatRate = "18" | "10" | "5";
type PaymentType = "cash" | "cashless";

// Nağdsız ödənişdə ƏDV-nin 15%-i geri qaytarılır (cashback)
const CASHLESS_CASHBACK_RATE = 0.15;

const vatRates: { value: VatRate; label: string; description: string }[] = [
  { value: "18", label: "18%", description: "Standart dərəcə (əksər mal və xidmətlər)" },
  { value: "10", label: "10%", description: "Güzəştli dərəcə (ərzaq, dərman və s.)" },
  { value: "5", label: "5%", description: "Aşağı dərəcə (kənd təsərrüfatı və s.)" },
];

const FORMULA_TITLE = "ƏDV necə hesablanır?";
const FORMULA_CONTENT = `ƏDV əlavə etmək:
ƏDV məbləği = Qiymət × (ƏDV dərəcəsi ÷ 100)
ƏDV-li qiymət = Qiymət + ƏDV məbləği

ƏDV ayırmaq (ƏDV-li qiymətdən):
ƏDV-siz qiymət = ƏDV-li qiymət ÷ (1 + ƏDV dərəcəsi ÷ 100)
ƏDV məbləği = ƏDV-li qiymət − ƏDV-siz qiymət

Azərbaycanda ƏDV dərəcələri (Vergi Məcəlləsi, Maddə 175):
• 18% — standart (əksər mal və xidmətlər)
• 10% — güzəştli (bəzi ərzaq, dərman, tibb avadanlığı)
• 5% — aşağı (kənd təsərrüfatı məhsulları və s.)
• 0% — ixrac əməliyyatları

Nağdsız ödəniş üstünlüyü:
Nağdsız ödəniş zamanı ƏDV məbləğinin 15%-i alıcıya geri qaytarılır (cashback).
Məsələn: 1000 AZN məbləğə 18% ƏDV = 180 AZN
Nağd ödəniş: 1180 AZN
Nağdsız ödəniş: 1180 − (180 × 15%) = 1180 − 27 = 1153 AZN`;

const fmt = (n: number) => fmtNum(n, 2);

function calc(a: number, rate: number, direction: Direction) {
  if (direction === "add") {
    const vat = a * (rate / 100);
    return { without: a, vat, total: a + vat };
  }
  const without = a / (1 + rate / 100);
  return { without, vat: a - without, total: a };
}

export function VatCalculator() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("add");
  const [vatRate, setVatRate] = useState<VatRate>("18");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");

  const result = useMemo(() => {
    const a = parseFloat(amount.replace(",", "."));
    if (!a || a <= 0) return null;
    const { without: priceWithoutVat, vat: vatAmount, total: totalWithVat } = calc(a, Number(vatRate), direction);
    // Nağdsız ödənişdə ƏDV cashback
    const cashback = paymentType === "cashless" ? vatAmount * CASHLESS_CASHBACK_RATE : 0;
    const effectiveVat = vatAmount - cashback;
    const effectiveTotal = totalWithVat - cashback;
    return { a, priceWithoutVat, vatAmount, totalWithVat, cashback, effectiveVat, effectiveTotal, saving: cashback };
  }, [amount, direction, vatRate, paymentType]);

  return (
    <View>
      <SegmentControl
        options={[
          { value: "add", label: "ƏDV əlavə et" },
          { value: "extract", label: "ƏDV ayır" },
        ]}
        selected={direction}
        onSelect={setDirection}
      />

      <OptionCards
        label="ƏDV dərəcəsi"
        columns={3}
        options={vatRates.map((r) => ({ value: r.value, title: r.label, description: r.description }))}
        selected={vatRate}
        onSelect={setVatRate}
      />

      <OptionCards
        label="Ödəniş üsulu"
        columns={2}
        options={[
          { value: "cash", icon: "💵", title: "Nağd ödəniş", description: "Standart ƏDV tətbiq olunur" },
          { value: "cashless", icon: "💳", title: "Nağdsız ödəniş", description: "ƏDV-nin 15%-i geri qaytarılır" },
        ]}
        selected={paymentType}
        onSelect={setPaymentType}
      />

      <InputField
        label={`💰 ${direction === "add" ? "ƏDV-siz məbləğ" : "ƏDV-li məbləğ"} (AZN)`}
        value={amount}
        onChangeText={setAmount}
        placeholder="1000"
        keyboardType="decimal-pad"
      />

      {result ? (
        <View>
          <StatGrid
            items={[
              { label: "ƏDV-siz qiymət", value: `${fmt(result.priceWithoutVat)} AZN` },
              { label: `ƏDV məbləği (${vatRate}%)`, value: `${fmt(result.vatAmount)} AZN` },
              { label: "ƏDV-li qiymət", value: `${fmt(result.totalWithVat)} AZN`, accent: true },
            ]}
          />

          {paymentType === "cashless" && result.cashback > 0 && (
            <TintCard color={SEM.green} title="💳 Nağdsız ödəniş üstünlüyü">
              <KV label="ƏDV cashback (15%)" value={`${fmt(result.cashback)} AZN`} color={SEM.green} />
              <KV label="Faktiki ƏDV" value={`${fmt(result.effectiveVat)} AZN`} color={SEM.green} />
              <KV label="Faktiki ödəniş" value={`${fmt(result.effectiveTotal)} AZN`} color={SEM.green} bold />
              <Note center>
                Nağd ödəyəndə: {fmt(result.totalWithVat)} AZN → Nağdsız ödəyəndə: {fmt(result.effectiveTotal)} AZN
                (qənaət: {fmt(result.saving)} AZN)
              </Note>
            </TintCard>
          )}

          <TintCard color={SEM.gray}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: colors.n580 }}>ƏDV-siz</Text>
              <Text style={{ fontSize: 13, color: colors.n580 }}>ƏDV</Text>
            </View>
            <SplitBar
              segments={[
                { value: result.priceWithoutVat, color: colors.accent },
                { value: result.vatAmount, color: SEM.amber },
              ]}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.n940, flexShrink: 1 }}>
                {fmt(result.priceWithoutVat)} AZN ({((result.priceWithoutVat / result.totalWithVat) * 100).toFixed(1)}%)
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: SEM.amber, flexShrink: 1, textAlign: "right" }}>
                {fmt(result.vatAmount)} AZN ({((result.vatAmount / result.totalWithVat) * 100).toFixed(1)}%)
              </Text>
            </View>
          </TintCard>

          <TintCard color={SEM.blue} title={`📊 Sürətli müqayisə — ${fmt(result.a)} AZN üçün`}>
            {vatRates.map((r) => {
              const c = calc(result.a, Number(r.value), direction);
              const active = r.value === vatRate;
              return (
                <View
                  key={r.value}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: active ? colors.accent + "22" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.n940, marginBottom: 2 }}>{r.label}</Text>
                  <Text style={{ fontSize: 13, color: colors.n580 }}>
                    ƏDV-siz: <Text style={{ color: colors.n940, fontWeight: "600" }}>{fmt(c.without)}</Text>
                    {"   "}ƏDV: <Text style={{ color: SEM.amber, fontWeight: "600" }}>{fmt(c.vat)}</Text>
                    {"   "}Cəmi: <Text style={{ color: colors.accent, fontWeight: "600" }}>{fmt(c.total)}</Text>
                  </Text>
                </View>
              );
            })}
          </TintCard>
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🧾</Text>
          <Text style={{ color: colors.n580, textAlign: "center" }}>Nəticəni görmək üçün məbləğ daxil edin.</Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "currency", "customs-duty", "freelancer-tax"]} />
    </View>
  );
}
