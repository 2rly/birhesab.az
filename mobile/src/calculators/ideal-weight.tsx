import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { ListCard, ListRow, TileGrid, StatTiles, BigResult, EmptyState } from "./_health-parts";

type Gender = "male" | "female";
type BodyFrame = "small" | "medium" | "large";

interface FormulaResult {
  name: string;
  min: number;
  max: number;
  description: string;
}

// Düsturlar
function calculateDevine(heightCm: number, gender: Gender): { min: number; max: number } {
  const over60 = Math.max(0, heightCm / 2.54 - 60);
  const ideal = gender === "male" ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateRobinson(heightCm: number, gender: Gender): { min: number; max: number } {
  const over60 = Math.max(0, heightCm / 2.54 - 60);
  const ideal = gender === "male" ? 52 + 1.9 * over60 : 49 + 1.7 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateMiller(heightCm: number, gender: Gender): { min: number; max: number } {
  const over60 = Math.max(0, heightCm / 2.54 - 60);
  const ideal = gender === "male" ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateHamwi(heightCm: number, gender: Gender): { min: number; max: number } {
  const over60 = Math.max(0, heightCm / 2.54 - 60);
  const ideal = gender === "male" ? 48 + 2.7 * over60 : 45.5 + 2.2 * over60;
  return { min: ideal * 0.9, max: ideal * 1.1 };
}

function calculateBMI(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  return { min: 18.5 * heightM * heightM, max: 24.9 * heightM * heightM };
}

function adjustForFrame(weight: number, frame: BodyFrame): number {
  if (frame === "small") return weight * 0.9;
  if (frame === "large") return weight * 1.1;
  return weight;
}

function fmt(n: number): string {
  return n.toFixed(1);
}

const FRAMES: { id: BodyFrame; label: string; icon: string; desc: string }[] = [
  { id: "small", label: "Kiçik", icon: "🦴", desc: "Nazik sümüklər, dar çiyinlər" },
  { id: "medium", label: "Orta", icon: "🧍", desc: "Standart quruluş" },
  { id: "large", label: "İri", icon: "💪", desc: "Geniş sümüklər, enli çiyinlər" },
];

const FORMULA_TITLE = "İdeal çəki necə hesablanır?";
const FORMULA_CONTENT = `5 fərqli düstur istifadə olunur:

1. BMI əsaslı (ÜST): BMI 18.5–24.9 aralığındakı çəki
   Çəki = BMI × Boy²(m)

2. Devine (1974): Kişi: 50 + 2.3 × (boy(düym) − 60)
   Qadın: 45.5 + 2.3 × (boy(düym) − 60)

3. Robinson (1983): Kişi: 52 + 1.9 × (boy(düym) − 60)
   Qadın: 49 + 1.7 × (boy(düym) − 60)

4. Miller (1983): Kişi: 56.2 + 1.41 × (boy(düym) − 60)
   Qadın: 53.1 + 1.36 × (boy(düym) − 60)

5. Hamwi (1964): Kişi: 48 + 2.7 × (boy(düym) − 60)
   Qadın: 45.5 + 2.2 × (boy(düym) − 60)

Bədən quruluşuna görə düzəliş: Kiçik −10%, Orta 0%, İri +10%

Nəticə bütün düsturların ortalamasıdır.`;

const GREEN = "#16a34a";

export function IdealWeightCalculator() {
  const { colors } = useTheme();
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [age, setAge] = useState("");
  const [bodyFrame, setBodyFrame] = useState<BodyFrame>("medium");

  const result = useMemo(() => {
    const h = parseFloat(heightCm);
    if (!h || h < 100 || h > 250) return null;

    const currentW = parseFloat(currentWeight) || 0;

    const formulas: FormulaResult[] = [
      { name: "BMI əsaslı (ÜST)", ...calculateBMI(h), description: "BMI 18.5–24.9 aralığı" },
      { name: "Devine düsturu", ...calculateDevine(h, gender), description: "1974, klinik istifadə" },
      { name: "Robinson düsturu", ...calculateRobinson(h, gender), description: "1983, yenilənmiş" },
      { name: "Miller düsturu", ...calculateMiller(h, gender), description: "1983, alternativ" },
      { name: "Hamwi düsturu", ...calculateHamwi(h, gender), description: "1964, klassik" },
    ];

    const adjusted = formulas.map((f) => ({
      ...f,
      min: adjustForFrame(f.min, bodyFrame),
      max: adjustForFrame(f.max, bodyFrame),
    }));

    const avgMin = adjusted.reduce((s, f) => s + f.min, 0) / adjusted.length;
    const avgMax = adjusted.reduce((s, f) => s + f.max, 0) / adjusted.length;
    const idealAvg = (avgMin + avgMax) / 2;

    let weightDiff = 0;
    let diffLabel = "";
    if (currentW > 0) {
      if (currentW < avgMin) {
        weightDiff = avgMin - currentW;
        diffLabel = "İdeal çəkiyə çatmaq üçün artırın";
      } else if (currentW > avgMax) {
        weightDiff = currentW - avgMax;
        diffLabel = "İdeal çəkiyə düşmək üçün azaldın";
      }
    }

    const heightM = h / 100;
    const currentBmi = currentW > 0 ? currentW / (heightM * heightM) : 0;
    const idealBmi = idealAvg / (heightM * heightM);

    return { formulas: adjusted, avgMin, avgMax, idealAvg, currentWeight: currentW, weightDiff, diffLabel, currentBmi, idealBmi, heightCm: h };
  }, [gender, heightCm, currentWeight, bodyFrame]);

  // Çəki şkalası
  const scale = useMemo(() => {
    if (!result || result.currentWeight <= 0) return null;
    const scaleMin = Math.min(result.avgMin - 10, result.currentWeight - 5);
    const scaleMax = Math.max(result.avgMax + 10, result.currentWeight + 5);
    const range = scaleMax - scaleMin;
    return {
      scaleMin,
      scaleMax,
      idealStartPct: ((result.avgMin - scaleMin) / range) * 100,
      idealWidthPct: ((result.avgMax - result.avgMin) / range) * 100,
      currentPct: ((result.currentWeight - scaleMin) / range) * 100,
    };
  }, [result]);

  const under = result ? result.currentWeight < result.avgMin : false;
  const diffColor = result && result.weightDiff === 0 ? GREEN : under ? "#2563eb" : "#d97706";

  return (
    <View>
      <SegmentControl
        label="Cins"
        options={[
          { value: "male", label: "👨 Kişi" },
          { value: "female", label: "👩 Qadın" },
        ]}
        selected={gender}
        onSelect={setGender}
      />

      <TileGrid
        label="Bədən quruluşu"
        columns={3}
        options={FRAMES.map((f) => ({ value: f.id, icon: f.icon, label: f.label, sub: f.desc }))}
        selected={bodyFrame}
        onSelect={setBodyFrame}
      />

      <InputField label="📏 Boy (sm)" value={heightCm} onChangeText={setHeightCm} placeholder="175" keyboardType="decimal-pad" />
      <InputField
        label="⚖️ Hazırkı çəki (kq) — ixtiyari"
        value={currentWeight}
        onChangeText={setCurrentWeight}
        placeholder="75"
        keyboardType="decimal-pad"
      />
      <InputField label="🎂 Yaş — ixtiyari" value={age} onChangeText={setAge} placeholder="30" keyboardType="number-pad" />

      {result ? (
        <View style={{ gap: 14 }}>
          <BigResult
            label="İdeal çəki aralığınız"
            value={`${fmt(result.avgMin)} — ${fmt(result.avgMax)}`}
            unit={`kq (ortalama: ${fmt(result.idealAvg)} kq)`}
          />

          {result.currentWeight > 0 && (
            <StatTiles
              items={[
                { label: "Hazırkı çəki", value: `${fmt(result.currentWeight)} kq`, unit: `BMI: ${result.currentBmi.toFixed(1)}` },
                { label: "İdeal çəki", value: `${fmt(result.idealAvg)} kq`, unit: `BMI: ${result.idealBmi.toFixed(1)}`, color: GREEN },
                result.weightDiff > 0
                  ? { label: "Fərq", value: `${under ? "+" : "−"}${fmt(result.weightDiff)} kq`, unit: result.diffLabel, color: diffColor }
                  : { label: "Fərq", value: "Normal!", unit: "Çəkiniz ideal aralıqdadır", color: GREEN },
              ]}
            />
          )}

          {scale && (
            <View style={[styles.box, { backgroundColor: colors.n240 }]}>
              <Text style={[styles.boxTitle, { color: colors.n580 }]}>Çəki şkalası</Text>
              <View>
                <View style={[styles.track, { backgroundColor: colors.n280 }]}>
                  <View
                    style={[styles.idealZone, { left: `${scale.idealStartPct}%`, width: `${scale.idealWidthPct}%` }]}
                  />
                </View>
                <View style={[styles.marker, { left: `${scale.currentPct}%`, backgroundColor: colors.n960 }]} />
              </View>
              <View style={styles.scaleLabels}>
                <Text style={[styles.tiny, { color: colors.n580 }]}>{fmt(scale.scaleMin)} kq</Text>
                <Text style={[styles.tiny, { color: GREEN, fontWeight: "600", flexShrink: 1, textAlign: "center" }]}>
                  {fmt(result.avgMin)}–{fmt(result.avgMax)} kq (ideal)
                </Text>
                <Text style={[styles.tiny, { color: colors.n580 }]}>{fmt(scale.scaleMax)} kq</Text>
              </View>
            </View>
          )}

          <ListCard
            title={`📊 Düsturlar üzrə müqayisə${
              bodyFrame !== "medium" ? ` (${bodyFrame === "small" ? "kiçik −10%" : "iri +10%"} düzəlişi ilə)` : ""
            }`}
          >
            {result.formulas.map((f) => {
              const avg = (f.min + f.max) / 2;
              const isInRange = result.currentWeight >= f.min && result.currentWeight <= f.max;
              return (
                <ListRow
                  key={f.name}
                  label={f.name}
                  sub={f.description}
                  value={`${fmt(f.min)} – ${fmt(f.max)} kq`}
                  valueSub={`orta: ${fmt(avg)} kq`}
                  active={result.currentWeight > 0 && isInRange}
                  activeColor={GREEN}
                />
              );
            })}
            <ListRow
              label="Ümumi ortalama"
              value={`${fmt(result.avgMin)} – ${fmt(result.avgMax)} kq`}
              active
              labelColor={colors.accent}
              valueColor={colors.accent}
            />
          </ListCard>

          <ListCard title={`📏 Boy-Çəki cədvəli (${gender === "male" ? "Kişi" : "Qadın"})`}>
            {[150, 155, 160, 165, 170, 175, 180, 185, 190].map((h) => {
              const r = calculateBMI(h);
              return (
                <ListRow
                  key={h}
                  label={`${h} sm`}
                  value={`${fmt(adjustForFrame(r.min, bodyFrame))} – ${fmt(adjustForFrame(r.max, bodyFrame))} kq`}
                  active={Math.abs(h - result.heightCm) < 3}
                />
              );
            })}
          </ListCard>

          <InfoBox variant="info" title="Diqqət:">
            İdeal çəki düsturları ümumi göstəricilərdir. Əzələ kütləsi, sümük quruluşu, etnik mənsubiyyət və fərdi fizioloji xüsusiyyətlər nəzərə alınmır. İdmançılar üçün çəki daha yüksək ola bilər. Sağlamlıq qərarları üçün həkimə müraciət edin.
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🏃" text="Nəticəni görmək üçün boyunuzu daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["bmi", "bmr", "water-intake", "pregnancy"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, padding: 14 },
  boxTitle: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  track: { height: 18, borderRadius: 9, overflow: "hidden" },
  idealZone: { position: "absolute", top: 0, bottom: 0, backgroundColor: "#86efac", borderRadius: 9 },
  marker: { position: "absolute", top: -4, width: 8, height: 26, borderRadius: 4, marginLeft: -4 },
  scaleLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 6 },
  tiny: { fontSize: 11 },
});
