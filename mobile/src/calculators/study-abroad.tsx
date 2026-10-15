import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SegmentControl } from "@/components/SegmentControl";
import { InfoBox, ResultHero, Card, FormulaSection, RelatedCalculators } from "@/components/Content";
import { ToneBox, EmptyState, Bar, TONE, type Tone } from "./_edu-scores-parts";

type CountryId = "usa" | "uk" | "germany" | "turkey" | "russia";
type ExamType = "ielts" | "toefl";

interface Country {
  id: CountryId;
  name: string;
  icon: string;
  minGPA: number;
  goodGPA: number;
  minIELTS: number;
  goodIELTS: number;
  minTOEFL: number;
  goodTOEFL: number;
  notes: string;
  tuitionRange: string;
}

const COUNTRIES: Country[] = [
  {
    id: "usa",
    name: "ABŞ",
    icon: "🇺🇸",
    minGPA: 3.0,
    goodGPA: 3.5,
    minIELTS: 6.5,
    goodIELTS: 7.5,
    minTOEFL: 80,
    goodTOEFL: 100,
    notes: "SAT/GRE tələb oluna bilər. Təqaüd imkanları geniş.",
    tuitionRange: "$20,000 – $60,000/il",
  },
  {
    id: "uk",
    name: "Böyük Britaniya",
    icon: "🇬🇧",
    minGPA: 2.8,
    goodGPA: 3.3,
    minIELTS: 6.0,
    goodIELTS: 7.0,
    minTOEFL: 75,
    goodTOEFL: 95,
    notes: "Bakalavr 3 il, magistr 1 il. Chevening təqaüdü mövcuddur.",
    tuitionRange: "£12,000 – £40,000/il",
  },
  {
    id: "germany",
    name: "Almaniya",
    icon: "🇩🇪",
    minGPA: 2.5,
    goodGPA: 3.0,
    minIELTS: 6.0,
    goodIELTS: 6.5,
    minTOEFL: 75,
    goodTOEFL: 90,
    notes: "Dövlət universitetlərində təhsil haqqı azdır. Alman dili bilmək üstünlükdür.",
    tuitionRange: "€0 – €3,000/il",
  },
  {
    id: "turkey",
    name: "Türkiyə",
    icon: "🇹🇷",
    minGPA: 2.5,
    goodGPA: 3.0,
    minIELTS: 5.5,
    goodIELTS: 6.5,
    minTOEFL: 65,
    goodTOEFL: 80,
    notes: "Türkiyə Bursları proqramı tam təqaüd verir. YÖS imtahanı tələb oluna bilər.",
    tuitionRange: "₺5,000 – ₺80,000/il",
  },
  {
    id: "russia",
    name: "Rusiya",
    icon: "🇷🇺",
    minGPA: 2.3,
    goodGPA: 3.0,
    minIELTS: 5.0,
    goodIELTS: 6.0,
    minTOEFL: 60,
    goodTOEFL: 75,
    notes: "Rus dili bilmək böyük üstünlükdür. Dövlət kvotaları mövcuddur.",
    tuitionRange: "₽100,000 – ₽500,000/il",
  },
];

function calculateChance(gpa: number, examScore: number, examType: ExamType, country: Country): number {
  let gpaScore = 0;
  const gpaRange = country.goodGPA - country.minGPA;
  if (gpa >= country.goodGPA) gpaScore = 50;
  else if (gpa >= country.minGPA) gpaScore = 20 + ((gpa - country.minGPA) / gpaRange) * 30;
  else if (gpa >= country.minGPA - 0.5) gpaScore = 5 + ((gpa - (country.minGPA - 0.5)) / 0.5) * 15;
  else gpaScore = Math.max(0, gpa * 2);

  let examScoreVal = 0;
  const minExam = examType === "ielts" ? country.minIELTS : country.minTOEFL;
  const goodExam = examType === "ielts" ? country.goodIELTS : country.goodTOEFL;
  const examRange = goodExam - minExam;

  if (examScore >= goodExam) examScoreVal = 50;
  else if (examScore >= minExam) examScoreVal = 20 + ((examScore - minExam) / examRange) * 30;
  else if (examScore >= minExam * 0.85) examScoreVal = 5 + ((examScore - minExam * 0.85) / (minExam * 0.15)) * 15;
  else examScoreVal = Math.max(0, (examScore / minExam) * 5);

  return Math.min(98, Math.max(2, Math.round(gpaScore + examScoreVal)));
}

function getChanceLevel(chance: number): { label: string; tone: Tone } {
  if (chance >= 75) return { label: "Yüksək", tone: "green" };
  if (chance >= 50) return { label: "Orta-yaxşı", tone: "blue" };
  if (chance >= 30) return { label: "Orta", tone: "yellow" };
  if (chance >= 15) return { label: "Aşağı", tone: "orange" };
  return { label: "Çox aşağı", tone: "red" };
}

function barColor(chance: number): string {
  if (chance >= 75) return "#22c55e";
  if (chance >= 50) return "#3b82f6";
  if (chance >= 30) return "#eab308";
  return "#ef4444";
}

const FORMULA_TITLE = "Qəbul şansı necə hesablanır?";
const FORMULA_CONTENT = `Qəbul şansı GPA və dil imtahanı balına əsasən təxmin edilir.

Əsas faktorlar:
• GPA (4.0 şkalası) — akademik performans (50% çəki)
• IELTS/TOEFL balı — dil bilikləri (50% çəki)

Hər ölkənin minimum və yaxşı bal tələbləri fərqlidir.
Balınız minimum tələbdən yuxarı olduqca şans artır.

Qeyd: Bu təxmini hesablamadır. Real qəbul prosesində tövsiyə
məktubları, motivasiya məktubu, iş təcrübəsi, portfolyo və digər
amillər də nəzərə alınır.`;

const NOTE =
  "Bu təxmini hesablamadır. Hər universitetin öz tələbləri var. Real qəbul prosesində GPA və dil balından əlavə, tövsiyə məktubları, motivasiya məktubu, iş təcrübəsi, portfolyo, müsahibə və digər amillər nəzərə alınır. Dəqiq tələblər üçün hədəf universitetin rəsmi saytına müraciət edin.";

const pf = (s: string) => parseFloat(s.replace(",", "."));

export function StudyAbroadCalculator() {
  const { colors } = useTheme();
  const [gpa, setGpa] = useState("");
  const [examType, setExamType] = useState<ExamType>("ielts");
  const [examScore, setExamScore] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryId>("usa");

  const result = useMemo(() => {
    const g = pf(gpa);
    const e = pf(examScore);
    if (!g || g < 0 || g > 4.0) return null;
    if (!e) return null;
    if (examType === "ielts" && (e < 0 || e > 9)) return null;
    if (examType === "toefl" && (e < 0 || e > 120)) return null;
    const country = COUNTRIES.find((c) => c.id === selectedCountry)!;
    const chance = calculateChance(g, e, examType, country);
    const allCountries = COUNTRIES.map((c) => ({ ...c, chance: calculateChance(g, e, examType, c) })).sort(
      (a, b) => b.chance - a.chance
    );
    return { chance, chanceLevel: getChanceLevel(chance), country, allCountries, gpa: g, examScore: e };
  }, [gpa, examScore, examType, selectedCountry]);

  const yoursColor = (v: number, min: number, good: number) =>
    v >= good ? TONE.green : v >= min ? TONE.blue : TONE.red;

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Ölkə seçin</Text>
      <View style={styles.countryGrid}>
        {COUNTRIES.map((c) => {
          const active = selectedCountry === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCountry(c.id)}
              style={[
                styles.countryBtn,
                {
                  borderColor: active ? colors.accent : colors.n280,
                  backgroundColor: active ? colors.accent + "1f" : colors.n200,
                },
              ]}
            >
              <Text style={styles.countryIcon}>{c.icon}</Text>
              <Text style={[styles.countryName, { color: colors.n940 }]} numberOfLines={1}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SegmentControl
        options={[
          { value: "ielts", label: "IELTS (0–9)" },
          { value: "toefl", label: "TOEFL (0–120)" },
        ]}
        selected={examType}
        onSelect={(v) => {
          setExamType(v);
          setExamScore("");
        }}
      />

      <InputField
        label="📐 GPA (0.0–4.0)"
        value={gpa}
        onChangeText={setGpa}
        placeholder="3.50"
        keyboardType="decimal-pad"
      />
      <InputField
        label={examType === "ielts" ? "📝 IELTS balı (0–9)" : "📝 TOEFL balı (0–120)"}
        value={examScore}
        onChangeText={setExamScore}
        placeholder={examType === "ielts" ? "6.5" : "85"}
        keyboardType="decimal-pad"
      />

      {result ? (
        <View style={{ gap: 12, marginTop: 8 }}>
          <ResultHero
            label={`${result.country.icon} ${result.country.name} — qəbul şansınız`}
            value={`${result.chance}%`}
            sub="Təxmini ehtimal"
          />

          <ToneBox tone={result.chanceLevel.tone} title={`Səviyyə: ${result.chanceLevel.label}`}>
            {result.country.notes}
          </ToneBox>

          <Card title={`${result.country.icon} ${result.country.name} — tələblər`}>
            <View style={styles.reqGrid}>
              <View style={styles.reqCol}>
                <Text style={[styles.reqHead, { color: colors.n580 }]}>GPA tələbi</Text>
                <Text style={[styles.reqText, { color: colors.n760 }]}>
                  Minimum: <Text style={styles.b}>{result.country.minGPA}</Text>
                  {" · "}
                  Yaxşı: <Text style={styles.b}>{result.country.goodGPA}+</Text>
                </Text>
                <Text style={[styles.reqSmall, { color: colors.n760 }]}>
                  Sizin:{" "}
                  <Text
                    style={{
                      fontWeight: "800",
                      color: yoursColor(result.gpa, result.country.minGPA, result.country.goodGPA),
                    }}
                  >
                    {result.gpa.toFixed(2)}
                  </Text>
                </Text>
              </View>
              <View style={styles.reqCol}>
                <Text style={[styles.reqHead, { color: colors.n580 }]}>{examType.toUpperCase()} tələbi</Text>
                <Text style={[styles.reqText, { color: colors.n760 }]}>
                  Minimum:{" "}
                  <Text style={styles.b}>
                    {examType === "ielts" ? result.country.minIELTS : result.country.minTOEFL}
                  </Text>
                  {" · "}
                  Yaxşı:{" "}
                  <Text style={styles.b}>
                    {examType === "ielts" ? result.country.goodIELTS : result.country.goodTOEFL}+
                  </Text>
                </Text>
                <Text style={[styles.reqSmall, { color: colors.n760 }]}>
                  Sizin:{" "}
                  <Text
                    style={{
                      fontWeight: "800",
                      color: yoursColor(
                        result.examScore,
                        examType === "ielts" ? result.country.minIELTS : result.country.minTOEFL,
                        examType === "ielts" ? result.country.goodIELTS : result.country.goodTOEFL
                      ),
                    }}
                  >
                    {result.examScore}
                  </Text>
                </Text>
              </View>
            </View>
            <View style={[styles.tuition, { borderTopColor: colors.n280 }]}>
              <Text style={[styles.reqSmall, { color: colors.n580 }]}>
                Təhsil haqqı: <Text style={{ fontWeight: "600", color: colors.n940 }}>{result.country.tuitionRange}</Text>
              </Text>
            </View>
          </Card>

          <View style={[styles.cmp, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <View style={[styles.cmpHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={[styles.cmpTitle, { color: colors.n940 }]}>🌍 Bütün ölkələr üzrə müqayisə</Text>
            </View>
            {result.allCountries.map((c, i) => {
              const level = getChanceLevel(c.chance);
              const active = c.id === selectedCountry;
              return (
                <View
                  key={c.id}
                  style={[
                    styles.cmpRow,
                    { borderBottomColor: colors.n240 },
                    i === result.allCountries.length - 1 && { borderBottomWidth: 0 },
                    active && { backgroundColor: colors.accent + "1a" },
                  ]}
                >
                  <View style={styles.cmpTop}>
                    <View style={styles.cmpLeft}>
                      <Text>{c.icon}</Text>
                      <Text style={[styles.cmpName, { color: colors.n940 }, active && { fontWeight: "700" }]}>
                        {c.name}
                      </Text>
                      {active && (
                        <View style={[styles.badge, { backgroundColor: colors.n940 }]}>
                          <Text style={[styles.badgeText, { color: colors.n145 }]}>Seçilmiş</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cmpPct, { color: TONE[level.tone] }]}>
                      {c.chance}% <Text style={styles.cmpLevel}>({level.label})</Text>
                    </Text>
                  </View>
                  <Bar ratio={c.chance / 100} color={barColor(c.chance)} />
                </View>
              );
            })}
          </View>

          <InfoBox variant="info">
            <Text style={[styles.note, { color: colors.n760 }]}>
              <Text style={{ fontWeight: "700" }}>Diqqət:</Text> {NOTE}
            </Text>
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🌍" text="Nəticəni görmək üçün GPA və dil imtahanı balını daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["gpa", "ielts", "toefl", "university-admission"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  countryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  countryBtn: { width: "31%", flexGrow: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  countryIcon: { fontSize: 24, marginBottom: 2 },
  countryName: { fontSize: 12, fontWeight: "600" },
  reqGrid: { flexDirection: "row", gap: 12 },
  reqCol: { flex: 1, gap: 3 },
  reqHead: { fontSize: 12 },
  reqText: { fontSize: 13, lineHeight: 18 },
  reqSmall: { fontSize: 12 },
  b: { fontWeight: "700" },
  tuition: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  cmp: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  cmpHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  cmpTitle: { fontSize: 14, fontWeight: "700" },
  cmpRow: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, gap: 6 },
  cmpTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6 },
  cmpLeft: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  cmpName: { fontSize: 13 },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  cmpPct: { fontSize: 13, fontWeight: "800" },
  cmpLevel: { fontSize: 11, fontWeight: "500" },
  note: { fontSize: 12, lineHeight: 18 },
});
