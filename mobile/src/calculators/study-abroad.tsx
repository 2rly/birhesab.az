import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

interface Country {
  id: string;
  name: string;
  flag: string;
  tuitionMin: number;
  tuitionMax: number;
  livingMin: number;
  livingMax: number;
  currency: string;
  minIELTS: number;
  minGPA: number;
}

const COUNTRIES: Country[] = [
  { id: "usa", name: "ABŞ", flag: "🇺🇸", tuitionMin: 20000, tuitionMax: 55000, livingMin: 12000, livingMax: 20000, currency: "USD", minIELTS: 6.5, minGPA: 3.0 },
  { id: "uk", name: "Böyük Britaniya", flag: "🇬🇧", tuitionMin: 15000, tuitionMax: 40000, livingMin: 10000, livingMax: 18000, currency: "GBP", minIELTS: 6.0, minGPA: 3.0 },
  { id: "germany", name: "Almaniya", flag: "🇩🇪", tuitionMin: 0, tuitionMax: 1500, livingMin: 10000, livingMax: 14000, currency: "EUR", minIELTS: 6.0, minGPA: 2.5 },
  { id: "turkey", name: "Türkiyə", flag: "🇹🇷", tuitionMin: 500, tuitionMax: 8000, livingMin: 4000, livingMax: 8000, currency: "USD", minIELTS: 5.5, minGPA: 2.5 },
  { id: "russia", name: "Rusiya", flag: "🇷🇺", tuitionMin: 2000, tuitionMax: 8000, livingMin: 3000, livingMax: 7000, currency: "USD", minIELTS: 0, minGPA: 2.0 },
];

function fmt(n: number): string {
  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function StudyAbroadCalculator() {
  const { colors } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState("usa");
  const [yearsInput, setYearsInput] = useState("4");
  const [gpa, setGpa] = useState("");
  const [ielts, setIelts] = useState("");

  const country = COUNTRIES.find((c) => c.id === selectedCountry)!;

  const result = useMemo(() => {
    const years = parseInt(yearsInput) || 4;
    const totalMin = (country.tuitionMin + country.livingMin) * years;
    const totalMax = (country.tuitionMax + country.livingMax) * years;
    const gpaVal = parseFloat(gpa) || 0;
    const ieltsVal = parseFloat(ielts) || 0;

    const gpaOk = gpaVal >= country.minGPA;
    const ieltsOk = country.minIELTS === 0 || ieltsVal >= country.minIELTS;

    return { totalMin, totalMax, years, gpaOk, ieltsOk, gpaVal, ieltsVal };
  }, [selectedCountry, yearsInput, gpa, ielts, country]);

  return (
    <View>
      <Text style={[styles.label, { color: colors.n700 }]}>Ölkə seçin</Text>
      <View style={styles.chipRow}>
        {COUNTRIES.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, { backgroundColor: colors.n240 }, selectedCountry === c.id && { backgroundColor: colors.accent }]}
            onPress={() => setSelectedCountry(c.id)}
          >
            <Text style={[styles.chipText, { color: colors.n580 }, selectedCountry === c.id && { color: colors.onAccent }]}>
              {c.flag} {c.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <InputField label="Təhsil müddəti" value={yearsInput} onChangeText={setYearsInput} placeholder="4" keyboardType="numeric" suffix="il" />
      <InputField label="GPA balınız" value={gpa} onChangeText={setGpa} placeholder="3.5" keyboardType="decimal-pad" />
      {country.minIELTS > 0 && (
        <InputField label="IELTS balınız" value={ielts} onChangeText={setIelts} placeholder="6.5" keyboardType="decimal-pad" />
      )}

      <ResultSection title={`${country.flag} ${country.name} — Təxmini xərc`}>
        <ResultRow label={`Təhsil haqqı (illik)`} value={`${fmt(country.tuitionMin)} – ${fmt(country.tuitionMax)} ${country.currency}`} />
        <ResultRow label="Yaşayış xərci (illik)" value={`${fmt(country.livingMin)} – ${fmt(country.livingMax)} ${country.currency}`} />
        <ResultRow label={`Ümumi (${result.years} il, min)`} value={`${fmt(result.totalMin)} ${country.currency}`} />
        <ResultRow label={`Ümumi (${result.years} il, maks)`} value={`${fmt(result.totalMax)} ${country.currency}`} highlight bold />
      </ResultSection>

      {(result.gpaVal > 0 || result.ieltsVal > 0) && (
        <ResultSection title="Uyğunluq yoxlaması">
          {result.gpaVal > 0 && (
            <ResultRow label={`GPA (min ${country.minGPA})`} value={result.gpaOk ? "Uyğundur ✓" : "Aşağıdır ✗"} highlight={result.gpaOk} />
          )}
          {result.ieltsVal > 0 && country.minIELTS > 0 && (
            <ResultRow label={`IELTS (min ${country.minIELTS})`} value={result.ieltsOk ? "Uyğundur ✓" : "Aşağıdır ✗"} highlight={result.ieltsOk} />
          )}
        </ResultSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },
});
