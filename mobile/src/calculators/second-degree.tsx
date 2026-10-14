import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";

interface Program {
  name: string;
  university: string;
  fee: number;
  duration: number;
}

const PROGRAMS: Program[] = [
  { name: "Hüquq", university: "Bakı Dövlət Universiteti", fee: 2500, duration: 2 },
  { name: "İqtisadiyyat", university: "UNEC", fee: 2200, duration: 2 },
  { name: "Menecment", university: "UNEC", fee: 2200, duration: 2 },
  { name: "Maliyyə", university: "UNEC", fee: 2400, duration: 2 },
  { name: "Mühasibatlıq", university: "UNEC", fee: 2200, duration: 2 },
  { name: "Beynəlxalq münasibətlər", university: "ADA Universiteti", fee: 5000, duration: 2 },
  { name: "İnformasiya texnologiyaları", university: "BDU", fee: 2500, duration: 2 },
  { name: "Psixologiya", university: "BDU", fee: 2000, duration: 2 },
  { name: "Biznes idarəetmə", university: "Qafqaz Universiteti", fee: 3500, duration: 2 },
  { name: "Filologiya", university: "BDU", fee: 1800, duration: 2 },
  { name: "Pedaqogika", university: "ADPU", fee: 1500, duration: 2 },
  { name: "Tibb", university: "ATU", fee: 4000, duration: 3 },
];

export function SecondDegreeCalculator() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return PROGRAMS;
    const q = search.toLowerCase();
    return PROGRAMS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.university.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <View>
      <InputField label="Axtarış" value={search} onChangeText={setSearch} placeholder="İxtisas və ya universitet adı" />

      <Text style={[styles.count, { color: colors.n580 }]}>{filtered.length} nəticə</Text>

      {filtered.map((p, i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
          <Text style={[styles.progName, { color: colors.n940 }]}>{p.name}</Text>
          <Text style={[styles.uniName, { color: colors.n580 }]}>{p.university}</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.info, { color: colors.accent }]}>{p.fee} ₼/il</Text>
            <Text style={[styles.info, { color: colors.n500c }]}>{p.duration} il</Text>
            <Text style={[styles.info, { color: colors.n500c }]}>Ümumi: {p.fee * p.duration} ₼</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  count: { fontSize: 12, marginBottom: 12 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  progName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  uniName: { fontSize: 13, marginBottom: 8 },
  infoRow: { flexDirection: "row", gap: 12 },
  info: { fontSize: 12, fontWeight: "600" },
});
