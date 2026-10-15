import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { Select } from "@/components/Select";
import {
  InfoBox,
  ResultHero,
  StatGrid,
  FormulaSection,
  RelatedCalculators,
  Card,
} from "@/components/Content";
import { ToneBox, EmptyState, type Tone } from "./_edu-scores-parts";

const BAND_SCORES = [
  "1.0", "1.5", "2.0", "2.5", "3.0", "3.5",
  "4.0", "4.5", "5.0", "5.5", "6.0", "6.5",
  "7.0", "7.5", "8.0", "8.5", "9.0",
];

const SECTIONS = [
  { id: "listening", label: "Listening", icon: "🎧" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "writing", label: "Writing", icon: "✍️" },
  { id: "speaking", label: "Speaking", icon: "🗣️" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function roundIELTS(avg: number): number {
  const floor = Math.floor(avg);
  const decimal = avg - floor;
  if (decimal < 0.25) return floor;
  if (decimal < 0.75) return floor + 0.5;
  return floor + 1;
}


function getInterpretation(score: number): { level: string; description: string; tone: Tone } {
  if (score >= 8.5) return { level: "Ekspert", description: "Dili tam sərbəst və dəqiq istifadə edirsiniz.", tone: "green" };
  if (score >= 7.5) return { level: "Çox yaxşı", description: "Dili yaxşı bilirsiniz, bəzi dəqiq olmayan ifadələr ola bilər.", tone: "green" };
  if (score >= 6.5) return { level: "Yaxşı", description: "Dili ümumiyyətlə effektiv istifadə edirsiniz.", tone: "blue" };
  if (score >= 5.5) return { level: "Orta", description: "Mürəkkəb dildə çətinliklər olsa da, ümumi mənanı başa düşürsünüz.", tone: "yellow" };
  if (score >= 4.5) return { level: "Məhdud", description: "Tanış situasiyalarda əsas bacarıqlar göstərirsiniz.", tone: "orange" };
  return { level: "Zəif", description: "Dil bilikləriniz çox məhduddur.", tone: "red" };
}

const REQUIREMENTS = [
  { label: "UK universitetləri (bakalavr)", score: "6.0 – 6.5" },
  { label: "UK universitetləri (magistr)", score: "6.5 – 7.0" },
  { label: "Kanada immiqrasiyası", score: "6.0 – 7.0" },
  { label: "Avstraliya immiqrasiyası", score: "7.0 – 8.0" },
  { label: "ABŞ universitetləri", score: "6.5 – 7.5" },
  { label: "Almaniya universitetləri", score: "6.0 – 7.0" },
];

const FORMULA_TITLE = "IELTS Overall Band Score necə hesablanır?";
const FORMULA_CONTENT = `Overall Band Score = (Listening + Reading + Writing + Speaking) ÷ 4

Nəticə ən yaxın 0.5 və ya tam ədədə yuvarlaqlaşdırılır:
• Ortalama .25-dən azdırsa → aşağı yuvarlaqlaşdırılır
• Ortalama .25 ilə .75 arasındadırsa → .5-ə yuvarlaqlaşdırılır
• Ortalama .75 və ya daha çoxdursa → yuxarı yuvarlaqlaşdırılır

Məsələn: (6.5 + 6.0 + 5.5 + 6.0) ÷ 4 = 6.0 → Overall: 6.0
Məsələn: (7.0 + 6.5 + 6.0 + 6.5) ÷ 4 = 6.5 → Overall: 6.5
Məsələn: (7.0 + 7.0 + 6.5 + 7.0) ÷ 4 = 6.875 → Overall: 7.0`;

export function IeltsCalculator() {
  const { colors } = useTheme();
  const [scores, setScores] = useState<Record<SectionId, string>>({
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });

  const result = useMemo(() => {
    const values = Object.values(scores);
    if (values.some((v) => !v)) return null;
    const nums = values.map(Number);
    const avg = nums.reduce((a, b) => a + b, 0) / 4;
    const overall = roundIELTS(avg);
    return { overall, avg: avg.toFixed(4), interpretation: getInterpretation(overall) };
  }, [scores]);

  const bandOptions = BAND_SCORES.map((s) => ({ value: s, label: s }));

  return (
    <View>
      {SECTIONS.map((section) => (
        <Select
          key={section.id}
          label={`${section.icon} ${section.label}`}
          value={scores[section.id]}
          options={bandOptions}
          placeholder="Band seçin"
          searchable={false}
          onSelect={(v) => setScores((prev) => ({ ...prev, [section.id]: v }))}
        />
      ))}

      {result ? (
        <View style={{ gap: 12, marginTop: 8 }}>
          <ResultHero
            label="Overall Band Score"
            value={result.overall.toFixed(1)}
            sub={`Dəqiq ortalama: ${result.avg}`}
          />

          <ToneBox tone={result.interpretation.tone} title={`Səviyyə: ${result.interpretation.level}`}>
            {result.interpretation.description}
          </ToneBox>

          <Card title="Bal icmalı">
            <StatGrid
              items={SECTIONS.map((s) => ({ label: `${s.icon} ${s.label}`, value: scores[s.id] }))}
            />
          </Card>

          <InfoBox variant="warning" title="📌 Tələb olunan minimum ballar">
            <View style={{ gap: 6, marginTop: 4 }}>
              {REQUIREMENTS.map((req) => (
                <View key={req.label} style={styles.reqRow}>
                  <Text style={[styles.reqLabel, { color: colors.n760 }]}>{req.label}</Text>
                  <Text style={[styles.reqScore, { color: colors.n940 }]}>{req.score}</Text>
                </View>
              ))}
            </View>
          </InfoBox>
        </View>
      ) : (
        <EmptyState text="Nəticəni görmək üçün bütün bölmələrin ballarını seçin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["toefl", "sat", "gpa", "university-admission", "foreign-university"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  reqRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  reqLabel: { fontSize: 13, flex: 1 },
  reqScore: { fontSize: 13, fontWeight: "700" },
});
