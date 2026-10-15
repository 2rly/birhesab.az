import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { InfoBox, ResultHero, Card, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { ToneBox, EmptyState, Bar, KVRow, LevelScale, TONE, type Tone } from "./_edu-scores-parts";

const LEVELS = {
  excellent: { level: "Əla", description: "Ən yaxşı universitetlər üçün rəqabətli bal." },
  good: { level: "Yaxşı", description: "Bir çox güclü universitetlər üçün yetərli bal." },
  average: { level: "Orta", description: "Orta səviyyəli universitetlər üçün uyğun bal." },
  belowAvg: { level: "Orta altı", description: "Bəzi proqramlar üçün yetərli ola bilər." },
  low: { level: "Aşağı", description: "Hazırlığı davam etdirmək tövsiyə olunur." },
};

function getScoreLevel(total: number): { level: string; description: string; tone: Tone } {
  if (total >= 1400) return { ...LEVELS.excellent, tone: "green" };
  if (total >= 1200) return { ...LEVELS.good, tone: "blue" };
  if (total >= 1000) return { ...LEVELS.average, tone: "yellow" };
  if (total >= 800) return { ...LEVELS.belowAvg, tone: "orange" };
  return { ...LEVELS.low, tone: "red" };
}

function getPercentile(total: number): number {
  if (total >= 1550) return 99;
  if (total >= 1500) return 98;
  if (total >= 1450) return 96;
  if (total >= 1400) return 94;
  if (total >= 1350) return 91;
  if (total >= 1300) return 87;
  if (total >= 1250) return 82;
  if (total >= 1200) return 76;
  if (total >= 1150) return 69;
  if (total >= 1100) return 62;
  if (total >= 1050) return 54;
  if (total >= 1000) return 47;
  if (total >= 950) return 39;
  if (total >= 900) return 32;
  if (total >= 850) return 25;
  if (total >= 800) return 19;
  if (total >= 750) return 14;
  if (total >= 700) return 9;
  if (total >= 650) return 6;
  if (total >= 600) return 3;
  return 1;
}

const LEVEL_ROWS: { label: string; range: string; tone: Tone }[] = [
  { label: "Əla", range: "1400–1600", tone: "green" },
  { label: "Yaxşı", range: "1200–1399", tone: "blue" },
  { label: "Orta", range: "1000–1199", tone: "yellow" },
  { label: "Orta altı", range: "800–999", tone: "orange" },
  { label: "Aşağı", range: "400–799", tone: "red" },
];

const UNI_SCORES = [
  { label: "Harvard University", score: "1480–1580" },
  { label: "MIT", score: "1510–1580" },
  { label: "Stanford University", score: "1470–1570" },
  { label: "UCLA", score: "1290–1510" },
  { label: "University of Michigan", score: "1340–1520" },
  { label: "Orta ABŞ universitetləri", score: "1000–1200" },
];

const FORMULA_TITLE = "SAT balı necə hesablanır?";
const FORMULA_CONTENT = `SAT Total Score = EBRW + Math

Hər bölmə 200–800 bal arasındadır.
Ümumi bal: 400–1600

Persentil — sizin balınızdan aşağı bal alan test verənlərin faizini göstərir.
Məsələn: 75-ci persentil = siz test verənlərin 75%-dən yaxşı nəticə göstərmisiniz.

Səviyyələr:
• 1400–1600 — Əla (top universitetlər)
• 1200–1399 — Yaxşı
• 1000–1199 — Orta
• 800–999 — Orta altı
• 400–799 — Aşağı`;

export function SatCalculator() {
  const { colors } = useTheme();
  const [ebrw, setEbrw] = useState("");
  const [math, setMath] = useState("");

  const result = useMemo(() => {
    const e = parseInt(ebrw);
    const m = parseInt(math);
    if (!e || !m || e < 200 || e > 800 || m < 200 || m > 800) return null;
    const total = e + m;
    return { total, ebrw: e, math: m, level: getScoreLevel(total), percentile: getPercentile(total) };
  }, [ebrw, math]);

  return (
    <View>
      <InputField
        label="📖 Evidence-Based Reading and Writing (200–800)"
        value={ebrw}
        onChangeText={setEbrw}
        placeholder="200–800"
        keyboardType="number-pad"
        maxLength={3}
      />
      <InputField
        label="🔢 Math (200–800)"
        value={math}
        onChangeText={setMath}
        placeholder="200–800"
        keyboardType="number-pad"
        maxLength={3}
      />

      {result ? (
        <View style={{ gap: 12, marginTop: 8 }}>
          <ResultHero label="Ümumi SAT balı" value={fmtNum(result.total, 0)} sub="1600 baldan" />

          <ToneBox tone={result.level.tone} title={`Səviyyə: ${result.level.level}`}>
            {result.level.description}
          </ToneBox>

          <View style={[styles.pctBox, { borderColor: TONE.purple + "55", backgroundColor: TONE.purple + "14" }]}>
            <Text style={[styles.pctLabel, { color: TONE.purple }]}>Təxmini persentil</Text>
            <Text style={[styles.pctValue, { color: TONE.purple }]}>{result.percentile}%</Text>
            <Text style={[styles.pctSub, { color: colors.n580 }]}>
              Test verənlərin {result.percentile}%-dən yaxşı
            </Text>
          </View>

          <Card title="Bal icmalı">
            <View style={styles.grid}>
              {[
                { icon: "📖", label: "EBRW", value: result.ebrw, color: "#3b82f6" },
                { icon: "🔢", label: "Math", value: result.math, color: "#22c55e" },
              ].map((s) => (
                <View key={s.label} style={[styles.cell, { backgroundColor: colors.n145, borderColor: colors.n280 }]}>
                  <Text style={styles.cellIcon}>{s.icon}</Text>
                  <Text style={[styles.cellLabel, { color: colors.n580 }]}>{s.label}</Text>
                  <Text style={[styles.cellValue, { color: colors.n940 }]}>{s.value}</Text>
                  <Bar ratio={(s.value - 200) / 600} color={s.color} />
                </View>
              ))}
            </View>
          </Card>

          <LevelScale
            title="SAT bal səviyyələri"
            rows={LEVEL_ROWS}
            activeIndex={LEVEL_ROWS.findIndex((r) => r.label === result.level.level)}
          />

          <InfoBox variant="warning" title="📌 Universitetlər üçün orta SAT balları">
            <View style={{ gap: 2, marginTop: 4 }}>
              {UNI_SCORES.map((r) => (
                <KVRow key={r.label} label={r.label} value={r.score} />
              ))}
            </View>
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="✏️" text="Nəticəni görmək üçün hər iki bölmənin balını daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["toefl", "ielts", "gpa", "university-admission"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pctBox: { borderWidth: 1, borderRadius: 12, padding: 16, alignItems: "center" },
  pctLabel: { fontSize: 13, marginBottom: 2 },
  pctValue: { fontSize: 34, fontWeight: "800" },
  pctSub: { fontSize: 12, marginTop: 2 },
  grid: { flexDirection: "row", gap: 8, marginTop: 4 },
  cell: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: "center", gap: 4 },
  cellIcon: { fontSize: 22 },
  cellLabel: { fontSize: 12 },
  cellValue: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
});
