import { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useTheme } from "@/constants/theme";
import { ResultRow, ResultSection } from "@/components/ResultRow";

const BAND_SCORES = [
  1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5,
  8.0, 8.5, 9.0,
];

const SECTIONS = [
  { id: "listening", label: "Listening" },
  { id: "reading", label: "Reading" },
  { id: "writing", label: "Writing" },
  { id: "speaking", label: "Speaking" },
] as const;

function roundIELTS(avg: number): number {
  const floor = Math.floor(avg);
  const decimal = avg - floor;
  if (decimal < 0.25) return floor;
  if (decimal < 0.75) return floor + 0.5;
  return floor + 1;
}

function getInterpretation(score: number): {
  level: string;
  description: string;
} {
  if (score >= 8.5)
    return {
      level: "Ekspert",
      description: "Dili tam sərbəst və dəqiq istifadə edirsiniz.",
    };
  if (score >= 7.5)
    return {
      level: "Çox yaxşı",
      description:
        "Dili yaxşı bilirsiniz, bəzi dəqiq olmayan ifadələr ola bilər.",
    };
  if (score >= 6.5)
    return {
      level: "Yaxşı",
      description: "Dili ümumiyyətlə effektiv istifadə edirsiniz.",
    };
  if (score >= 5.5)
    return {
      level: "Orta",
      description:
        "Mürəkkəb dilcə çətinliklər olsa da, ümumi mənanı başa düşürsünüz.",
    };
  if (score >= 4.5)
    return {
      level: "Məhdud",
      description: "Tanış situasiyalarda əsas bacarıqlar göstərirsiniz.",
    };
  return {
    level: "Zəif",
    description: "Dil bilikləriniz çox məhduddur.",
  };
}

type SectionId = (typeof SECTIONS)[number]["id"];

export function IeltsCalculator() {
  const { colors } = useTheme();
  const [scores, setScores] = useState<Record<SectionId, number | null>>({
    listening: null,
    reading: null,
    writing: null,
    speaking: null,
  });

  const updateScore = (section: SectionId, value: number) => {
    setScores((prev) => ({ ...prev, [section]: value }));
  };

  const result = useMemo(() => {
    const values = Object.values(scores);
    if (values.some((v) => v === null)) return null;

    const nums = values as number[];
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / 4;
    const overall = roundIELTS(avg);

    return {
      overall,
      avg: avg.toFixed(2),
      interpretation: getInterpretation(overall),
    };
  }, [scores]);

  return (
    <View>
      {SECTIONS.map((section) => (
        <View key={section.id} style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: colors.n700 }]}>
            {section.label}
            {scores[section.id] !== null && (
              <Text style={{ color: colors.accent }}>
                {" "}
                — {scores[section.id]!.toFixed(1)}
              </Text>
            )}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bandRow}
          >
            {BAND_SCORES.map((band) => {
              const active = scores[section.id] === band;
              return (
                <Pressable
                  key={band}
                  style={[
                    styles.bandChip,
                    { backgroundColor: colors.n240 },
                    active && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => updateScore(section.id, band)}
                >
                  <Text
                    style={[
                      styles.bandText,
                      { color: colors.n580 },
                      active && { color: colors.onAccent },
                    ]}
                  >
                    {band.toFixed(1)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ))}

      {result ? (
        <View style={styles.resultBlock}>
          <View
            style={[styles.overallCard, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.overallLabel, { color: colors.onAccent }]}>
              Overall Band Score
            </Text>
            <Text style={[styles.overallScore, { color: colors.onAccent }]}>
              {result.overall.toFixed(1)}
            </Text>
            <Text style={[styles.overallAvg, { color: colors.onAccent }]}>
              Dəqiq ortalama: {result.avg}
            </Text>
          </View>

          <ResultSection title="Nəticə">
            <ResultRow
              label="Səviyyə"
              value={result.interpretation.level}
              highlight
              bold
            />
            <ResultRow label="Təsvir" value={result.interpretation.description} />
          </ResultSection>

          <ResultSection title="Bal icmalı">
            {SECTIONS.map((s) => (
              <ResultRow
                key={s.id}
                label={s.label}
                value={scores[s.id]!.toFixed(1)}
              />
            ))}
          </ResultSection>
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: colors.n500c }]}>
          Nəticəni görmək üçün bütün bölmələrin ballarını seçin.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: { marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  bandRow: { gap: 6, paddingRight: 8 },
  bandChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
  },
  bandText: { fontSize: 13, fontWeight: "600" },
  resultBlock: { marginTop: 8 },
  overallCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  overallLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  overallScore: { fontSize: 48, fontWeight: "800" },
  overallAvg: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
  },
});
