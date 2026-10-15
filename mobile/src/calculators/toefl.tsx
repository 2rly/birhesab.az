import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { InfoBox, ResultHero, Card, FormulaSection, RelatedCalculators } from "@/components/Content";
import { ToneBox, EmptyState, Bar, KVRow, LevelScale, type Tone } from "./_edu-scores-parts";

const SECTIONS = [
  { id: "reading", label: "Reading", icon: "📖", max: 30 },
  { id: "listening", label: "Listening", icon: "🎧", max: 30 },
  { id: "speaking", label: "Speaking", icon: "🗣️", max: 30 },
  { id: "writing", label: "Writing", icon: "✍️", max: 30 },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const LEVELS = {
  outstanding: { level: "Mükəmməl", description: "Mükəmməl səviyyə — ən yaxşı universitetlərə uyğundur." },
  excellent: { level: "Əla", description: "Əla səviyyə — əksər universitetlərin tələblərinə cavab verir." },
  good: { level: "Yaxşı", description: "Yaxşı səviyyə — bir çox proqramlar üçün kifayət edir." },
  average: { level: "Orta", description: "Orta səviyyə — bəzi proqramlar üçün yetərli ola bilər." },
  below: { level: "Orta altı", description: "Orta səviyyədən aşağı — daha çox hazırlıq lazımdır." },
};

function getScoreLevel(total: number): { level: string; description: string; tone: Tone } {
  if (total >= 110) return { ...LEVELS.outstanding, tone: "green" };
  if (total >= 94) return { ...LEVELS.excellent, tone: "green" };
  if (total >= 79) return { ...LEVELS.good, tone: "blue" };
  if (total >= 60) return { ...LEVELS.average, tone: "yellow" };
  return { ...LEVELS.below, tone: "red" };
}

const LEVEL_ROWS: { label: string; range: string; tone: Tone }[] = [
  { label: "Mükəmməl", range: "110–120", tone: "green" },
  { label: "Əla", range: "94–109", tone: "green" },
  { label: "Yaxşı", range: "79–93", tone: "blue" },
  { label: "Orta", range: "60–78", tone: "yellow" },
  { label: "Orta altı", range: "0–59", tone: "red" },
];

const UNI_REQUIREMENTS = [
  { label: "Harvard, MIT, Stanford", score: "100+" },
  { label: "ABŞ top universitetləri", score: "90–100" },
  { label: "UK universitetləri (bakalavr)", score: "80–90" },
  { label: "UK universitetləri (magistr)", score: "90–100" },
  { label: "Almanya universitetləri", score: "80–95" },
  { label: "Kanada universitetləri", score: "85–100" },
];

const FORMULA_TITLE = "TOEFL balı necə hesablanır?";
const FORMULA_CONTENT = `TOEFL iBT Total Score = Reading + Listening + Speaking + Writing

Hər bölmə 0–30 bal arasındadır.
Ümumi bal: 0–120

Səviyyələr:
• 110–120 — Mükəmməl
• 94–109 — Əla
• 79–93 — Yaxşı
• 60–78 — Orta
• 0–59 — Orta altı

Məsələn: Reading 28 + Listening 26 + Speaking 24 + Writing 27 = 105 (Əla)`;

export function ToeflCalculator() {
  const { colors } = useTheme();
  const [scores, setScores] = useState<Record<SectionId, string>>({
    reading: "",
    listening: "",
    speaking: "",
    writing: "",
  });

  const result = useMemo(() => {
    const values = Object.values(scores);
    if (values.some((v) => !v)) return null;
    const nums = values.map((v) => Number(v.replace(",", ".")));
    if (nums.some((n) => isNaN(n) || n < 0 || n > 30)) return null;
    const total = nums.reduce((a, b) => a + b, 0);
    return { total, level: getScoreLevel(total) };
  }, [scores]);

  return (
    <View>
      {SECTIONS.map((s) => (
        <InputField
          key={s.id}
          label={`${s.icon} ${s.label} (0–30)`}
          value={scores[s.id]}
          onChangeText={(v) => setScores((prev) => ({ ...prev, [s.id]: v }))}
          placeholder="0"
          keyboardType="number-pad"
          maxLength={2}
        />
      ))}

      {result ? (
        <View style={{ gap: 12, marginTop: 8 }}>
          <ResultHero label="Ümumi TOEFL balı" value={String(result.total)} sub="120 baldan" />

          <ToneBox tone={result.level.tone} title={`Səviyyə: ${result.level.level}`}>
            {result.level.description}
          </ToneBox>

          <Card title="Bal icmalı">
            <View style={styles.grid}>
              {SECTIONS.map((s) => (
                <View key={s.id} style={[styles.cell, { backgroundColor: colors.n145, borderColor: colors.n280 }]}>
                  <Text style={styles.cellIcon}>{s.icon}</Text>
                  <Text style={[styles.cellLabel, { color: colors.n580 }]}>{s.label}</Text>
                  <Text style={[styles.cellValue, { color: colors.n940 }]}>{scores[s.id]}</Text>
                  <Bar ratio={Number(scores[s.id]) / 30} />
                </View>
              ))}
            </View>
          </Card>

          <LevelScale
            title="TOEFL bal səviyyələri"
            rows={LEVEL_ROWS}
            activeIndex={LEVEL_ROWS.findIndex((r) => r.label === result.level.level)}
          />

          <InfoBox variant="warning" title="📌 Universitetlər üçün minimum TOEFL balları">
            <View style={{ gap: 2, marginTop: 4 }}>
              {UNI_REQUIREMENTS.map((r) => (
                <KVRow key={r.label} label={r.label} value={r.score} />
              ))}
            </View>
          </InfoBox>
        </View>
      ) : (
        <EmptyState text="Nəticəni görmək üçün bütün bölmələrin ballarını daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["ielts", "sat", "gpa", "university-admission"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  cell: { width: "48%", flexGrow: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: "center", gap: 4 },
  cellIcon: { fontSize: 22 },
  cellLabel: { fontSize: 12 },
  cellValue: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
});
