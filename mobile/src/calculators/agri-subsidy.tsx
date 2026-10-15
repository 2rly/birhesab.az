import { useState, useMemo, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import {
  plantingSubsidies,
  productSubsidies,
  fallowSubsidies,
  type CropEntry,
  type SubsidyType,
} from "@/data/subsidies-2026";

// 2026 Aqrar Subsidiya Şurası — tam məlumat
// Mənbə: agro.gov.az (01.09.2025 elanı)

const LIBERATED_BONUS = 0.5; // birillik bitkilər və yonca üçün +50%

const pt = {
  formulaTitle: "Subsidiya necə hesablanır?",
  formulaContent: `Mənbə: Aqrar Subsidiya Şurası, 01.09.2025 (agro.gov.az)

3 növ subsidiya var:

1. ƏKİN SUBSIDIYASI (manat/ha) — sahəyə görə
Düstur: Subsidiya = Dərəcə (AZN/ha) × Sahə (ha)

2. MƏHSUL SUBSIDIYASI (manat/ton) — istehsal həcminə görə
Pambıq, tütün, şəkər çuğunduru, soya, qarğıdalı, günəbaxan, buğda, nar, alma üzrə.
Düstur: Subsidiya = Dərəcə (AZN/ton) × Həcm (ton)

3. DİNCƏ QOYULMUŞ TORPAQ (manat/ha) — yeni proqram
Şamaxı, Şəki, Qobustan və Yardımlı rayonlarında dəmyə ərazilərdə son 3 ildə ardıcıl olaraq buğda və ya arpa əkilmiş torpaqların 2026-cı ildə dincə qoyulması üçün hektar başına 220 AZN.

Əlavə güzəştlər:
• "Böyük Qayıdış" bonusu — işğaldan azad edilmiş kənd və qəsəbələrdə məskunlaşan sakinlər üçün birillik bitkilər və yonca üzrə əkin subsidiyası +50% artırılır.

Şərtlər və məhdudiyyətlər:
• Sertifikatlı toxum tələbi: 10 ha-dan çox buğda və ya 100 ha-dan çox arpa əkən fermerlər sertifikatlı toxum istifadə etməlidir, əks halda əkin əmsalı 0-a bərabər olur.
• Pambıq üzrə məhsul əmsalı yalnız müəyyən rayonlarda tətbiq edilir (Ağcabədi, Ağdam, Beyləqan, Bərdə, Biləsuvar, Goranboy, İmişli, Kürdəmir, Neftçala, Saatlı, Sabirabad, Salyan, Tərtər, Yevlax, Zərdab və s.).
• Tütün üzrə məhsul əmsalı yalnız müəyyən rayonlarda (Ağstafa, Balakən, Gədəbəy, Goranboy, İsmayıllı, Lerik, Masallı, Oğuz, Qax, Qazax, Qəbələ, Qubadlı, Şəki, Tovuz, Yardımlı, Zaqatala, Zəngilan).
• Aqrokimyəvi analiz tələb edilən ərazilərdə analiz olunmadıqda məhsul subsidiyası azaldılır (pambıq −10 AZN/ton, tütün −2 AZN/ton, şəkər çuğunduru −1 AZN/ton, soya −10 AZN/ton).
• İntensiv alma və şaftalı bağlarının subsidiyası 2026-cı ilin 1 iyunundan dayandırılacaq (yalnız işğaldan azad ərazilər və NMR istisna).

Diqqət: Dəqiq məbləğ Aqrar Subsidiya Şurasının qərarı ilə təsdiqlənir. Bu hesablayıcı rəsmi siyahıya əsasən təxmini məbləği göstərir.`,
  subsidyType: "Subsidiya növü",
  typePlanting: "Əkin subsidiyası (manat/ha)",
  typeProduct: "Məhsul subsidiyası (manat/ton)",
  typeFallow: "Dincə qoyulmuş torpaq (manat/ha)",
  cropType: "Bitki / variant",
  selectCrop: "Bitkini seçin",
  area: "Sahə (ha)",
  production: "Məhsul həcmi (ton)",
  ha: "ha",
  ton: "ton",
  rate: "Dərəcə",
  options: "Əlavə şərtlər",
  liberated: '"Böyük Qayıdış" bonusu (+50%)',
  liberatedDesc: "İşğaldan azad ərazilərdə məskunlaşan sakinlər üçün birillik bitkilər və yoncaya tətbiq edilir",
  liberatedNotEligible:
    "Bu bitki üçün +50% bonus tətbiq edilmir (rəsmi dərəcədə artıq nəzərə alınıb və ya çoxillik bitkidir)",
  certifiedSeed: "Sertifikatlı toxum istifadə edilir",
  certifiedSeedDesc: "10 ha-dan çox buğda və ya 100 ha-dan çox arpa əkəndə tələb olunur",
  certifiedSeedWarning: "⚠️ Sertifikatlı toxum istifadə edilməsə subsidiya 0 olacaq",
  quickAreas: "Sürətli seçim",
  result: "Subsidiya məbləği",
  baseSubsidy: "Əsas subsidiya",
  liberatedBonus: '"Böyük Qayıdış" bonusu (+50%)',
  total: "Yekun subsidiya",
  details: "Hesablama detalları",
  formula: "Düstur",
  emptyState: "Sahə və ya məhsul həcmini daxil edin.",
  note: "* Qiymətlər 01.09.2025 tarixli rəsmi siyahıya əsasən hesablanır. Yekun məbləğ üçün agro.gov.az saytına müraciət edin.",
  cropCount: "bitki variantı",
  sourceLabel: "Mənbə",
  cropName: "Bitki",
  quantity: "Miqdar",
  perUnit: "vahid başına",
};

const GREEN = "#16a34a";
const AMBER = "#d97706";
const RED = "#dc2626";

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

function getCropList(type: SubsidyType): CropEntry[] {
  if (type === "planting") return plantingSubsidies;
  if (type === "product") return productSubsidies;
  return fallowSubsidies;
}

function CheckCard({
  checked,
  disabled,
  onToggle,
  title,
  children,
}: {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  title: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onToggle}
      style={[
        styles.checkCard,
        { backgroundColor: colors.n200, borderColor: colors.n280 },
        disabled && { opacity: 0.5 },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <MaterialIcons
        name={checked ? "check-box" : "check-box-outline-blank"}
        size={22}
        color={checked ? colors.accent : colors.n580}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.checkTitle, { color: colors.n940 }]}>{title}</Text>
        {children}
      </View>
    </Pressable>
  );
}

function DetailRow({
  label,
  value,
  tint,
  bold,
}: {
  label: string;
  value: string;
  tint?: string;
  bold?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.detailRow,
        { borderBottomColor: colors.n240 },
        tint ? { backgroundColor: tint + "14" } : null,
      ]}
    >
      <Text style={[styles.detailLabel, { color: tint ?? colors.n580 }, bold && { fontWeight: "700" }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.detailValue,
          { color: tint ?? colors.n940 },
          bold && { fontWeight: "800" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function AgriSubsidyCalculator() {
  const { colors } = useTheme();
  const [type, setType] = useState<SubsidyType>("planting");
  const [cropId, setCropId] = useState<string>(plantingSubsidies[0].id);
  const [quantity, setQuantity] = useState<string>("");
  const [liberated, setLiberated] = useState<boolean>(false);
  const [certifiedSeed, setCertifiedSeed] = useState<boolean>(true);

  const cropList = useMemo(() => getCropList(type), [type]);
  const crop = useMemo(() => cropList.find((c) => c.id === cropId) || cropList[0], [cropList, cropId]);

  const handleTypeChange = (newType: SubsidyType) => {
    setType(newType);
    const list = getCropList(newType);
    setCropId(list[0].id);
    setLiberated(false);
  };

  const isWheatOrBarley =
    crop.id.includes("wheat") || crop.id.includes("barley") || crop.id.includes("grain");
  const showCertifiedSeed = type === "planting" && isWheatOrBarley;

  const result = useMemo(() => {
    const q = parseFloat(quantity.replace(",", "."));
    if (!q || q <= 0) return null;

    // Sertifikatlı toxum tələbi pozulduqda subsidiya 0 olur
    if (showCertifiedSeed && !certifiedSeed) {
      return { baseSubsidy: 0, liberatedBonus: 0, total: 0, zeroedByRule: true };
    }

    const baseSubsidy = crop.rate * q;
    const liberatedBonus = liberated && crop.liberatedEligible ? baseSubsidy * LIBERATED_BONUS : 0;
    const total = baseSubsidy + liberatedBonus;

    return { baseSubsidy, liberatedBonus, total, zeroedByRule: false };
  }, [quantity, crop, liberated, certifiedSeed, showCertifiedSeed]);

  const unitLabel = crop.unit === "ha" ? pt.ha : pt.ton;
  const quickValues = crop.unit === "ha" ? [1, 5, 10, 50, 100] : [1, 10, 50, 100, 500];

  const typeOptions = [
    { id: "planting" as const, label: pt.typePlanting, icon: "🌾" },
    { id: "product" as const, label: pt.typeProduct, icon: "📦" },
    { id: "fallow" as const, label: pt.typeFallow, icon: "🏞️" },
  ];

  return (
    <View>
      {/* Subsidiya növü */}
      <Text style={[styles.label, { color: colors.n700 }]}>{pt.subsidyType}</Text>
      <View style={{ gap: 8, marginBottom: 18 }}>
        {typeOptions.map((opt) => {
          const active = type === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => handleTypeChange(opt.id)}
              style={[
                styles.typeBtn,
                active
                  ? { backgroundColor: GREEN, borderColor: GREEN }
                  : { backgroundColor: colors.n200, borderColor: colors.n280 },
              ]}
            >
              <Text style={{ fontSize: 16 }}>{opt.icon}</Text>
              <Text style={[styles.typeText, { color: active ? "#ffffff" : colors.n760 }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bitki seçimi */}
      <View style={styles.rowBetween}>
        <Text style={[styles.label, { color: colors.n700, marginBottom: 0 }]}>{pt.cropType}</Text>
        <View style={[styles.pill, { backgroundColor: colors.accent + "22" }]}>
          <Text style={[styles.pillText, { color: colors.accent }]}>
            {cropList.length} {pt.cropCount}
          </Text>
        </View>
      </View>
      <View style={{ height: 6 }} />
      <Select
        value={crop.id}
        options={cropList.map((c) => ({ value: c.id, label: c.name, group: c.group }))}
        onSelect={setCropId}
        placeholder={pt.selectCrop}
        searchable
      />
      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: GREEN + "1a", borderColor: GREEN + "55" }]}>
          <Text style={[styles.badgeText, { color: GREEN }]}>
            {pt.rate}: {formatMoney(crop.rate)}/{unitLabel}
          </Text>
        </View>
        {crop.liberatedEligible && (
          <View style={[styles.badge, { backgroundColor: AMBER + "1a", borderColor: AMBER + "55" }]}>
            <Text style={[styles.badgeText, { color: AMBER }]}>✓ Böyük Qayıdış uyğun</Text>
          </View>
        )}
      </View>

      {/* Miqdar */}
      <InputField
        label={crop.unit === "ha" ? pt.area : pt.production}
        value={quantity}
        onChangeText={setQuantity}
        placeholder={crop.unit === "ha" ? "10" : "100"}
        keyboardType="decimal-pad"
        suffix={unitLabel}
      />
      <View style={styles.quickRow}>
        <Text style={[styles.quickLabel, { color: colors.n580 }]}>{pt.quickAreas}:</Text>
        {quickValues.map((qv) => {
          const active = quantity === String(qv);
          return (
            <Pressable
              key={qv}
              onPress={() => setQuantity(String(qv))}
              style={[
                styles.quickBtn,
                active
                  ? { borderColor: colors.accent, backgroundColor: colors.accent + "22" }
                  : { borderColor: colors.n280, backgroundColor: colors.n200 },
              ]}
            >
              <Text style={[styles.quickText, { color: active ? colors.accent : colors.n580 }]}>
                {qv} {unitLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Əlavə şərtlər */}
      <Text style={[styles.label, { color: colors.n700 }]}>{pt.options}</Text>
      <View style={{ gap: 8, marginBottom: 20 }}>
        <CheckCard
          checked={liberated && !!crop.liberatedEligible}
          disabled={!crop.liberatedEligible}
          onToggle={() => setLiberated(!liberated)}
          title={pt.liberated}
        >
          <Text style={[styles.checkDesc, { color: colors.n580 }]}>
            {crop.liberatedEligible ? pt.liberatedDesc : pt.liberatedNotEligible}
          </Text>
        </CheckCard>

        {showCertifiedSeed && (
          <CheckCard checked={certifiedSeed} onToggle={() => setCertifiedSeed(!certifiedSeed)} title={pt.certifiedSeed}>
            <Text style={[styles.checkDesc, { color: colors.n580 }]}>{pt.certifiedSeedDesc}</Text>
            {!certifiedSeed && (
              <Text style={[styles.checkDesc, { color: RED, fontWeight: "600", marginTop: 4 }]}>
                {pt.certifiedSeedWarning}
              </Text>
            )}
          </CheckCard>
        )}
      </View>

      {/* Nəticə */}
      {result ? (
        <View style={{ gap: 16 }}>
          <View style={[styles.hero, { backgroundColor: GREEN }]}>
            <Text style={styles.heroLabel}>{pt.total}</Text>
            <Text style={styles.heroValue}>{formatMoney(result.total)}</Text>
            {!result.zeroedByRule && (
              <Text style={styles.heroSub}>
                {formatMoney(crop.rate)} × {quantity} {unitLabel}
              </Text>
            )}
          </View>

          <View style={[styles.details, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <View style={[styles.detailsHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={[styles.detailsTitle, { color: colors.n940 }]}>📊 {pt.details}</Text>
            </View>
            <DetailRow label={pt.cropName} value={crop.name} />
            <DetailRow label={pt.rate} value={`${formatMoney(crop.rate)} / ${unitLabel}`} />
            <DetailRow label={pt.quantity} value={`${quantity} ${unitLabel}`} />
            {!result.zeroedByRule && (
              <>
                <DetailRow label={pt.baseSubsidy} value={formatMoney(result.baseSubsidy)} />
                {result.liberatedBonus > 0 && (
                  <DetailRow label={pt.liberatedBonus} value={`+${formatMoney(result.liberatedBonus)}`} tint={AMBER} />
                )}
              </>
            )}
            {result.zeroedByRule && <DetailRow label={pt.certifiedSeedWarning} value="0 AZN" tint={RED} bold />}
            <DetailRow label={pt.total} value={formatMoney(result.total)} tint={GREEN} bold />
          </View>

          <View style={[styles.note, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <Text style={[styles.noteText, { color: colors.n580 }]}>{pt.note}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>🌾</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyState}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["vat", "salary", "freelancer-tax", "currency"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  typeText: { fontSize: 14, fontWeight: "600" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  pillText: { fontSize: 11, fontWeight: "700" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: -6, marginBottom: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  quickRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: -6, marginBottom: 18 },
  quickLabel: { fontSize: 12, marginRight: 2 },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  quickText: { fontSize: 13, fontWeight: "600" },
  checkCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  checkTitle: { fontSize: 14, fontWeight: "600" },
  checkDesc: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  hero: { borderRadius: 16, padding: 20, alignItems: "center" },
  heroLabel: { color: "#ffffff", fontSize: 13, opacity: 0.85 },
  heroValue: { color: "#ffffff", fontSize: 30, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "#ffffff", fontSize: 12, opacity: 0.85, marginTop: 6 },
  details: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  detailsHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  detailsTitle: { fontSize: 14, fontWeight: "700" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: { fontSize: 13, flexShrink: 1 },
  detailValue: { fontSize: 13, fontWeight: "600", textAlign: "right", maxWidth: "60%" },
  note: { borderRadius: 12, borderWidth: 1, padding: 12 },
  noteText: { fontSize: 12, textAlign: "center", lineHeight: 17 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
