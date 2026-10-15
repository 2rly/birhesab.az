import { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ChipGroup } from "@/components/Controls";
import { SectionHeading, InfoBox, FormulaSection, RelatedCalculators, Paragraph } from "@/components/Content";

type FeeCategory = "registration" | "inspection" | "certificate" | "license" | "plates" | "notary";

const CATEGORIES: { value: FeeCategory; label: string; icon: string }[] = [
  { value: "registration", label: "Qeydiyyat", icon: "📋" },
  { value: "inspection", label: "Texniki baxış", icon: "🔧" },
  { value: "certificate", label: "Şəhadətnamə", icon: "📄" },
  { value: "license", label: "Sürücülük", icon: "🪪" },
  { value: "plates", label: "Nömrə nişanları", icon: "🔢" },
  { value: "notary", label: "Notarius", icon: "📝" },
];

interface FeeItem {
  description: string;
  amount: string;
  highlight?: boolean;
}

const registrationFees: FeeItem[] = [
  { description: "2000 sm³-dək: 0.05 AZN hər sm³", amount: "0 – 100" },
  { description: "2001–3000 sm³: 100 + 0.10 AZN (2000-dən yuxarı hər sm³)", amount: "100 – 200" },
  { description: "3001–4000 sm³: 200 + 0.20 AZN (3000-dən yuxarı hər sm³)", amount: "200 – 400" },
  { description: "4001–5000 sm³: 400 + 0.30 AZN (4000-dən yuxarı hər sm³)", amount: "400 – 700" },
  { description: "5000 sm³-dən yuxarı (sabit)", amount: "1 500" },
  { description: "Yaxın qohumlara bağışlama və digər hallar — avtonəqliyyat (18.65.3.1)", amount: "20" },
  { description: "Motonəqliyyat, traktor, tikinti/kənd təsərrüfatı texnikası, qoşqular (18.65.3.2)", amount: "10" },
];

const inspectionFees: FeeItem[] = [
  { description: "Avtonəqliyyat vasitələri (18.65.1.1)", amount: "30" },
  { description: "Motonəqliyyat, traktor, tikinti/kənd təsərrüfatı texnikası, qoşqular (18.65.1.2)", amount: "15" },
  { description: "Texniki uçot dəyişikliyi və ya alıcı tələbi ilə texniki baxış — avtonəqliyyat (18.65.2.1)", amount: "30" },
  { description: "Texniki uçot dəyişikliyi və ya alıcı tələbi ilə texniki baxış — motonəqliyyat (18.65.2.2)", amount: "15" },
];

const certificateFees: FeeItem[] = [
  { description: "Avto-moto nəqliyyat vasitələri (18.65.7.1)", amount: "30" },
  { description: "Traktor, tikinti/kənd təsərrüfatı texnikası, qoşqular (18.65.7.2)", amount: "10" },
];

const licenseFees: FeeItem[] = [
  { description: "İlkin imtahan — avto-moto NV, tramvay, trolleybus (18.65.4.1)", amount: "40" },
  { description: "Təkrar imtahan — avto-moto NV, tramvay, trolleybus (18.65.4.1-1)", amount: "20" },
  { description: "Digər sürücülük vəsiqəsi, traktorçu-maşinist vəsiqəsi imtahanı (18.65.4.2)", amount: "10" },
  { description: "Sürücülük vəsiqəsinin verilməsi/dəyişdirilməsi — avto-moto NV (18.65.5.1)", amount: "30" },
  { description: "Beynəlxalq sürücülük vəsiqəsinin verilməsi/dəyişdirilməsi (18.65.5.1-1)", amount: "12" },
  { description: "Digər NV — traktor, tikinti texnikası və s. sürücülük vəsiqəsi (18.65.5.2)", amount: "10" },
];

const plateFees: FeeItem[] = [
  { description: "Standart avtonəqliyyat nişanı (təkrar verilmə daxil) (18.65.6.2)", amount: "30" },
  { description: "Motonəqliyyat, traktor, qoşqular üçün nişan (18.65.6.3)", amount: "15" },
  { description: "Premium 001–009 (müxtəlif hərflər)", amount: "2 000", highlight: true },
  { description: "Premium 001–009 (eyni hərflər)", amount: "3 000", highlight: true },
  { description: "Premium 100–900 (müxtəlif hərflər)", amount: "1 500", highlight: true },
  { description: "Premium 100–900 (eyni hərflər)", amount: "2 000", highlight: true },
  { description: "Premium 111–999 (müxtəlif hərflər)", amount: "1 000", highlight: true },
  { description: "Premium 111–999 (eyni hərflər)", amount: "1 500", highlight: true },
];

const notaryFees: FeeItem[] = [
  { description: "NV özgəninkiləşdirilməsi etibarnaməsi (yaxın qohumlar): 35 + 5.25 xidmət haqqı", amount: "40.25" },
  { description: "NV özgəninkiləşdirilməsi etibarnaməsi (digər şəxslər): 70 + 10.50 xidmət haqqı", amount: "80.50" },
  { description: "NV istifadə etibarnaməsi (yaxın qohumlar)", amount: "10" },
  { description: "NV istifadə etibarnaməsi (digər şəxslər)", amount: "15" },
  { description: "Vəsiyyətnamələrin təsdiqi", amount: "15" },
  { description: "Notariat sənədlərinin dublikatı", amount: "6" },
  { description: "İmzanın həqiqiliyinin təsdiqi (hər imza)", amount: "3" },
  { description: "Sənəd tərcüməsinin təsdiqi (ilk səhifə: 1.50, sonrakı hər səhifə: 0.50)", amount: "1.50" },
];

const FEE_DATA: Record<FeeCategory, FeeItem[]> = {
  registration: registrationFees,
  inspection: inspectionFees,
  certificate: certificateFees,
  license: licenseFees,
  plates: plateFees,
  notary: notaryFees,
};

const SECTION_TITLES: Record<FeeCategory, string> = {
  registration: "Qeydiyyat rüsumu",
  inspection: "Texniki baxış rüsumu",
  certificate: "Qeydiyyat şəhadətnaməsi",
  license: "Sürücülük vəsiqəsi",
  plates: "Nömrə nişanları",
  notary: "Notarius xidmətləri",
};

const FORMULA_TITLE = "Qeydiyyat rüsumu necə hesablanır?";
const FORMULA_CONTENT = `Mühərrik həcminə görə qeydiyyat rüsumu:

• 2000 sm³-dək: 0.05 AZN × həcm
• 2001–3000 sm³: 100 + 0.10 AZN × (həcm – 2000)
• 3001–4000 sm³: 200 + 0.20 AZN × (həcm – 3000)
• 4001–5000 sm³: 400 + 0.30 AZN × (həcm – 4000)
• 5000 sm³-dən yuxarı: 1500 AZN (sabit)

Yaxın qohumlar arasında bağışlama:
• Avtomobil: 20 AZN
• Motosiklet: 10 AZN`;

function calculateRegistrationFee(cc: number): number {
  if (cc <= 0) return 0;
  if (cc <= 2000) return cc * 0.05;
  if (cc <= 3000) return 100 + (cc - 2000) * 0.1;
  if (cc <= 4000) return 200 + (cc - 3000) * 0.2;
  if (cc <= 5000) return 400 + (cc - 4000) * 0.3;
  return 1500;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const AMBER = "#f59e0b";

function FeeTable({ items }: { items: FeeItem[] }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.table, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
      <View style={[styles.tr, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
        <Text style={[styles.th, { color: colors.n840, flex: 1 }]}>Xidmət</Text>
        <Text style={[styles.th, { color: colors.n840, textAlign: "right" }]}>Məbləğ (AZN)</Text>
      </View>
      {items.map((item, i) => (
        <View
          key={i}
          style={[
            styles.tr,
            { borderBottomColor: colors.n240 },
            item.highlight && { backgroundColor: AMBER + "1f" },
            i === items.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <Text style={[styles.td, { color: colors.n940, flex: 1 }]}>{item.description}</Text>
          <Text style={[styles.amount, { color: item.highlight ? AMBER : colors.accent }]}>{item.amount} AZN</Text>
        </View>
      ))}
    </View>
  );
}

export function VehicleFeesCalculator() {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState<FeeCategory>("registration");
  const [engineCc, setEngineCc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const registrationResult = useMemo(() => {
    const cc = parseInt(engineCc, 10);
    if (isNaN(cc) || cc <= 0) return null;
    return calculateRegistrationFee(cc);
  }, [engineCc]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { category: FeeCategory; items: FeeItem[] }[] = [];
    for (const [cat, items] of Object.entries(FEE_DATA) as [FeeCategory, FeeItem[]][]) {
      const matched = items.filter(
        (item) => item.description.toLowerCase().includes(q) || item.amount.toLowerCase().includes(q)
      );
      if (matched.length > 0) results.push({ category: cat, items: matched });
    }
    return results;
  }, [searchQuery]);

  const iconOf = (c: FeeCategory) => CATEGORIES.find((x) => x.value === c)?.icon;

  return (
    <View>
      <InputField
        label="Axtarış"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Rüsum axtar..."
      />

      {searchQuery.trim() ? (
        filteredCategories && filteredCategories.length === 0 ? (
          <Text style={[styles.noResults, { color: colors.n580 }]}>Axtarışa uyğun nəticə tapılmadı</Text>
        ) : (
          filteredCategories?.map(({ category, items }) => (
            <View key={category}>
              <SectionHeading icon={iconOf(category)}>{SECTION_TITLES[category]}</SectionHeading>
              <FeeTable items={items} />
            </View>
          ))
        )
      ) : (
        <>
          <ChipGroup
            options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
            selected={activeCategory}
            onSelect={setActiveCategory}
          />

          <SectionHeading icon={iconOf(activeCategory)}>{SECTION_TITLES[activeCategory]}</SectionHeading>

          {activeCategory === "registration" && (
            <View style={[styles.calcBox, { borderColor: colors.accent + "44", backgroundColor: colors.accent + "14" }]}>
              <InputField
                label="Mühərrik həcmi (sm³)"
                value={engineCc}
                onChangeText={setEngineCc}
                placeholder="1600"
                keyboardType="number-pad"
                suffix="sm³"
                maxLength={5}
              />
              {registrationResult !== null ? (
                <View style={[styles.resultBox, { backgroundColor: colors.n200, borderColor: colors.accent + "55" }]}>
                  <Text style={[styles.resultLabel, { color: colors.n580 }]}>Hesablanmış qeydiyyat rüsumu</Text>
                  <Text style={[styles.resultValue, { color: colors.accent }]}>
                    {fmt(registrationResult)} <Text style={[styles.resultUnit, { color: colors.n580 }]}>AZN</Text>
                  </Text>
                </View>
              ) : (
                engineCc === "" && <Paragraph>Mühərrik həcmini daxil edin</Paragraph>
              )}
            </View>
          )}

          <FeeTable items={FEE_DATA[activeCategory]} />
        </>
      )}

      <InfoBox variant="warning" title="Diqqət:">
        Bu məlumatlar informativ xarakter daşıyır. Dəqiq məbləğlər üçün DYP-yə və ya müvafiq quruma müraciət edin.
      </InfoBox>

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["car-customs", "road-tax", "traffic-fines", "osago"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  table: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 8, marginBottom: 8 },
  tr: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  th: { fontSize: 13, fontWeight: "700" },
  td: { fontSize: 13, lineHeight: 19 },
  amount: { fontSize: 13, fontWeight: "700", textAlign: "right", minWidth: 80 },
  noResults: { textAlign: "center", fontSize: 16, paddingVertical: 28 },
  calcBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  resultBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 4 },
  resultLabel: { fontSize: 13, marginBottom: 4 },
  resultValue: { fontSize: 28, fontWeight: "800" },
  resultUnit: { fontSize: 16, fontWeight: "400" },
});
