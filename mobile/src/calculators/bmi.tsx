import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";

type Gender = "male" | "female";
type Unit = "metric" | "imperial";

interface BmiCategory {
  label: string;
  range: string;
  color: string;
  emoji: string;
  description: string;
}

const BMI_CATEGORIES: BmiCategory[] = [
  { label: "Çəki çatışmazlığı", range: "< 18.5", color: "#1d4ed8", emoji: "🔵", description: "Normal çəkidən aşağı — qidalanma rejimini yaxşılaşdırın" },
  { label: "Normal çəki", range: "18.5 – 24.9", color: "#15803d", emoji: "🟢", description: "Sağlam çəki — bu çəkini qorumağa çalışın" },
  { label: "Artıq çəki", range: "25.0 – 29.9", color: "#b45309", emoji: "🟡", description: "Normaldan yuxarı — fiziki aktivliyi artırın" },
  { label: "I dərəcə piylənmə", range: "30.0 – 34.9", color: "#c2410c", emoji: "🟠", description: "Mülayim piylənmə — həkim məsləhəti tövsiyə olunur" },
  { label: "II dərəcə piylənmə", range: "35.0 – 39.9", color: "#dc2626", emoji: "🔴", description: "Ciddi piylənmə — tibbi müdaxilə lazım ola bilər" },
  { label: "III dərəcə piylənmə", range: "≥ 40.0", color: "#991b1b", emoji: "⛔", description: "Ağır piylənmə — mütləq həkim nəzarəti" },
];

const SCALE_SEGMENTS = [
  { width: 21.25, color: "#60a5fa" },
  { width: 16, color: "#4ade80" },
  { width: 12.5, color: "#fbbf24" },
  { width: 12.5, color: "#fb923c" },
  { width: 12.5, color: "#f87171" },
  { width: 25.25, color: "#b91c1c" },
];

const ACTIVITY_LEVELS = [
  { label: "Oturaq həyat tərzi", factor: 1.2, desc: "Az və ya heç hərəkət yox" },
  { label: "Yüngül aktivlik", factor: 1.375, desc: "Həftədə 1–3 gün idman" },
  { label: "Orta aktivlik", factor: 1.55, desc: "Həftədə 3–5 gün idman" },
  { label: "Yüksək aktivlik", factor: 1.725, desc: "Həftədə 6–7 gün idman" },
  { label: "Çox yüksək aktivlik", factor: 1.9, desc: "Gündə 2 dəfə idman / ağır fiziki iş" },
];

const FORMULA_TITLE = "BMI necə hesablanır?";
const FORMULA_CONTENT = `BMI = Çəki (kq) ÷ Boy² (m)

Məsələn: 75 kq, 175 sm → BMI = 75 ÷ 1.75² = 75 ÷ 3.0625 = 24.5

Kateqoriyalar (ÜST — Ümumdünya Səhiyyə Təşkilatı):
• < 18.5 — Çəki çatışmazlığı
• 18.5–24.9 — Normal çəki
• 25.0–29.9 — Artıq çəki
• 30.0–34.9 — I dərəcə piylənmə
• 35.0–39.9 — II dərəcə piylənmə
• ≥ 40.0 — III dərəcə piylənmə

Qeyd: BMI əzələ kütləsini, yaşı və cinsi nəzərə almır.
Buna görə idmançılar və yaşlılarda nəticə fərqli ola bilər.`;

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return BMI_CATEGORIES[0];
  if (bmi < 25) return BMI_CATEGORIES[1];
  if (bmi < 30) return BMI_CATEGORIES[2];
  if (bmi < 35) return BMI_CATEGORIES[3];
  if (bmi < 40) return BMI_CATEGORIES[4];
  return BMI_CATEGORIES[5];
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export function BmiCalculator() {
  const { colors } = useTheme();
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit] = useState<Unit>("metric");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");

  const result = useMemo(() => {
    let heightM: number;
    let weightKg: number;

    if (unit === "metric") {
      const h = parseFloat(heightCm);
      const w = parseFloat(weight);
      if (!h || h <= 0 || !w || w <= 0) return null;
      heightM = h / 100;
      weightKg = w;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const lbs = parseFloat(weightLbs);
      if ((ft <= 0 && inches <= 0) || !lbs || lbs <= 0) return null;
      const totalInches = ft * 12 + inches;
      heightM = totalInches * 0.0254;
      weightKg = lbs * 0.4536;
    }

    const userAge = parseInt(age) || 0;
    const bmi = weightKg / (heightM * heightM);
    const category = getBmiCategory(bmi);
    const idealRange = { min: 18.5 * heightM * heightM, max: 24.9 * heightM * heightM };

    let weightDiff = 0;
    let weightDiffLabel = "";
    if (bmi < 18.5) {
      weightDiff = idealRange.min - weightKg;
      weightDiffLabel = "Normal çəkiyə çatmaq üçün artırın";
    } else if (bmi >= 25) {
      weightDiff = weightKg - idealRange.max;
      weightDiffLabel = "Normal çəkiyə düşmək üçün azaldın";
    }

    // BMR — Mifflin-St Jeor
    let bmr = 0;
    if (userAge > 0) {
      bmr =
        gender === "male"
          ? 10 * weightKg + 6.25 * (heightM * 100) - 5 * userAge + 5
          : 10 * weightKg + 6.25 * (heightM * 100) - 5 * userAge - 161;
    }

    const bmiPrime = bmi / 25;

    return { bmi, category, weightKg, heightM, heightCm: heightM * 100, idealRange, weightDiff, weightDiffLabel, bmr, bmiPrime };
  }, [heightCm, weight, age, gender, unit, heightFt, heightIn, weightLbs]);

  const scalePosition = result ? Math.min(100, Math.max(0, ((result.bmi - 10) / 40) * 100)) : 0;

  const cardStyle = [styles.card, { backgroundColor: colors.n200, borderColor: colors.n280 }];
  const headerStyle = [styles.cardHeader, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }];

  return (
    <View>
      <SegmentControl
        options={[
          { value: "metric", label: "Metrik (kq, sm)" },
          { value: "imperial", label: "Imperial (lbs, ft)" },
        ]}
        selected={unit}
        onSelect={setUnit}
      />

      <SegmentControl
        label="Cins"
        options={[
          { value: "male", label: "👨 Kişi" },
          { value: "female", label: "👩 Qadın" },
        ]}
        selected={gender}
        onSelect={setGender}
      />

      {unit === "metric" ? (
        <>
          <InputField label="📏 Boy (sm)" value={heightCm} onChangeText={setHeightCm} placeholder="175" keyboardType="decimal-pad" />
          <InputField label="⚖️ Çəki (kq)" value={weight} onChangeText={setWeight} placeholder="75" keyboardType="decimal-pad" />
        </>
      ) : (
        <>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <InputField label="📏 Boy" value={heightFt} onChangeText={setHeightFt} placeholder="5" keyboardType="decimal-pad" suffix="fut" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label=" " value={heightIn} onChangeText={setHeightIn} placeholder="9" keyboardType="decimal-pad" suffix="düym" />
            </View>
          </View>
          <InputField label="⚖️ Çəki (lbs)" value={weightLbs} onChangeText={setWeightLbs} placeholder="165" keyboardType="decimal-pad" />
        </>
      )}
      <InputField label="🎂 Yaş — ixtiyari" value={age} onChangeText={setAge} placeholder="30" keyboardType="number-pad" />

      {result ? (
        <View style={{ gap: 14 }}>
          {/* BMI nəticə kartı */}
          <View style={[styles.hero, { backgroundColor: result.category.color + "1a", borderColor: result.category.color + "55" }]}>
            <Text style={[styles.small, { color: colors.n580 }]}>Sizin BMI göstəriciniz</Text>
            <Text style={[styles.heroValue, { color: result.category.color }]}>{fmt(result.bmi)}</Text>
            <Text style={[styles.heroCat, { color: result.category.color }]}>
              {result.category.emoji} {result.category.label}
            </Text>
            <Text style={[styles.small, { color: colors.n580, marginTop: 6, textAlign: "center" }]}>{result.category.description}</Text>
          </View>

          {/* BMI skalası */}
          <View style={[styles.scaleBox, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.smallBold, { color: colors.n580, marginBottom: 10 }]}>BMI skalası</Text>
            <View>
              <View style={styles.scaleBar}>
                {SCALE_SEGMENTS.map((s, i) => (
                  <View key={i} style={{ width: `${s.width}%`, backgroundColor: s.color, height: "100%" }} />
                ))}
              </View>
              <View style={[styles.marker, { left: `${scalePosition}%`, backgroundColor: colors.n960 }]} />
            </View>
            <View style={styles.scaleLabels}>
              {["10", "18.5", "25", "30", "35", "40", "50"].map((l) => (
                <Text key={l} style={[styles.tiny, { color: colors.n580 }]}>{l}</Text>
              ))}
            </View>
          </View>

          {/* Məlumat kartları */}
          <View style={styles.statRow}>
            <View style={[styles.stat, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={[styles.tiny, { color: colors.n580, textAlign: "center" }]}>İdeal çəki aralığı</Text>
              <Text style={[styles.statValue, { color: colors.n940 }]}>
                {fmt(result.idealRange.min)} – {fmt(result.idealRange.max)}
              </Text>
              <Text style={[styles.tiny, { color: colors.n580 }]}>kq</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
              <Text style={[styles.tiny, { color: colors.n580 }]}>BMI Prime</Text>
              <Text style={[styles.statValue, { color: colors.n940 }]}>{result.bmiPrime.toFixed(2)}</Text>
              <Text style={[styles.tiny, { color: colors.n580 }]}>{result.bmiPrime <= 1 ? "Normal" : "Normaldan yuxarı"}</Text>
            </View>
            {result.bmr > 0 && (
              <View style={[styles.stat, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <Text style={[styles.tiny, { color: colors.n580, textAlign: "center" }]}>Bazal metabolizm (BMR)</Text>
                <Text style={[styles.statValue, { color: colors.n940 }]}>{Math.round(result.bmr)}</Text>
                <Text style={[styles.tiny, { color: colors.n580 }]}>kkal / gün</Text>
              </View>
            )}
          </View>

          {/* Çəki fərqi */}
          {result.weightDiff > 0 && (
            <InfoBox variant={result.bmi < 18.5 ? "info" : "warning"}>
              {`${result.bmi < 18.5 ? "📈" : "📉"} ${result.weightDiffLabel}: ${fmt(result.weightDiff)} kq`}
            </InfoBox>
          )}

          {/* Kateqoriyalar cədvəli */}
          <View style={cardStyle}>
            <View style={headerStyle}>
              <Text style={[styles.cardTitle, { color: colors.n940 }]}>📊 BMI kateqoriyaları (ÜST)</Text>
            </View>
            {BMI_CATEGORIES.map((cat) => {
              const isActive = cat.label === result.category.label;
              return (
                <View
                  key={cat.label}
                  style={[styles.listRow, { borderBottomColor: colors.n240 }, isActive && { backgroundColor: cat.color + "1a" }]}
                >
                  <Text style={[styles.rowLabel, { color: cat.color, fontWeight: isActive ? "700" : "400" }]}>
                    {cat.emoji} {cat.label}
                  </Text>
                  <View style={styles.rowRight}>
                    <Text style={[styles.rowLabel, { color: colors.n580 }]}>{cat.range}</Text>
                    {isActive && (
                      <View style={[styles.badge, { backgroundColor: colors.n960 }]}>
                        <Text style={[styles.badgeText, { color: colors.n145 }]}>Siz</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Bu boy üçün çəki cədvəli */}
          <View style={cardStyle}>
            <View style={headerStyle}>
              <Text style={[styles.cardTitle, { color: colors.n940 }]}>📏 {fmt(result.heightCm)} sm boy üçün çəki cədvəli</Text>
            </View>
            {BMI_CATEGORIES.slice(0, 4).map((cat, i) => {
              const bmiLow = [0, 18.5, 25, 30][i];
              const bmiHigh = [18.5, 25, 30, 35][i];
              const wLow = bmiLow > 0 ? bmiLow * result.heightM * result.heightM : 0;
              const wHigh = bmiHigh * result.heightM * result.heightM;
              const isActive = cat.label === result.category.label;
              return (
                <View
                  key={cat.label}
                  style={[styles.listRow, { borderBottomColor: colors.n240 }, isActive && { backgroundColor: cat.color + "1a" }]}
                >
                  <Text style={[styles.rowLabel, { color: cat.color }]}>
                    {cat.emoji} {cat.label}
                  </Text>
                  <Text style={[styles.rowValue, { color: colors.n940 }]}>
                    {bmiLow > 0 ? `${fmt(wLow)} – ${fmt(wHigh)}` : `< ${fmt(wHigh)}`} kq
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Gündəlik kalori ehtiyacı */}
          {result.bmr > 0 && (
            <View style={cardStyle}>
              <View style={headerStyle}>
                <Text style={[styles.cardTitle, { color: colors.n940 }]}>🔥 Gündəlik kalori ehtiyacı (BMR əsasında)</Text>
              </View>
              {ACTIVITY_LEVELS.map((level) => (
                <View key={level.factor} style={[styles.listRow, { borderBottomColor: colors.n240 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowValue, { color: colors.n940 }]}>{level.label}</Text>
                    <Text style={[styles.tiny, { color: colors.n580 }]}>{level.desc}</Text>
                  </View>
                  <Text style={[styles.rowValue, { color: colors.n940, fontWeight: "700" }]}>
                    {Math.round(result.bmr * level.factor)} kkal
                  </Text>
                </View>
              ))}
            </View>
          )}

          <InfoBox variant="info" title="Diqqət:">
            BMI ümumi göstəricidir və əzələ kütləsi, sümük quruluşu, yaş və cins kimi fərdi amilləri nəzərə almır. İdmançılar və hamilə qadınlarda nəticə dəqiq olmaya bilər. Sağlamlıq qərarları üçün həkimə müraciət edin.
          </InfoBox>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>⚖️</Text>
          <Text style={[styles.rowLabel, { color: colors.n580, textAlign: "center" }]}>
            Nəticəni görmək üçün boy və çəkinizi daxil edin.
          </Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["bmr", "ideal-weight", "water-intake", "pregnancy"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row2: { flexDirection: "row", gap: 10 },
  hero: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center" },
  heroValue: { fontSize: 48, fontWeight: "800", marginTop: 4 },
  heroCat: { fontSize: 17, fontWeight: "700", marginTop: 6 },
  small: { fontSize: 13 },
  smallBold: { fontSize: 12, fontWeight: "600" },
  tiny: { fontSize: 11 },
  scaleBox: { borderRadius: 12, padding: 14 },
  scaleBar: { flexDirection: "row", height: 18, borderRadius: 9, overflow: "hidden" },
  marker: { position: "absolute", top: -4, width: 8, height: 26, borderRadius: 4, marginLeft: -4 },
  scaleLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: { flexGrow: 1, flexBasis: "30%", borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", marginVertical: 4, textAlign: "center" },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  cardHeader: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowLabel: { fontSize: 13, flexShrink: 1 },
  rowValue: { fontSize: 13, fontWeight: "600" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 24 },
});
