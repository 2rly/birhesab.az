import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";

const NAME_DB: Record<string, { meaning: string; origin: string }> = {
  "əli": { meaning: "Uca, yüksək", origin: "Ərəb" },
  "aysel": { meaning: "Ay kimi gözəl", origin: "Türk" },
  "elvin": { meaning: "Xalqın dostu", origin: "Türk" },
  "günel": { meaning: "Günəşli el", origin: "Türk" },
  "nigar": { meaning: "Gözəl rəsm, gözəl", origin: "Fars" },
  "orxan": { meaning: "Böyük hökmdar", origin: "Türk" },
  "leyla": { meaning: "Gecə, qaranlıq gözəl", origin: "Ərəb" },
  "rəşad": { meaning: "Doğru yol", origin: "Ərəb" },
  "sevinc": { meaning: "Xoşbəxtlik, sevinc", origin: "Türk" },
  "tural": { meaning: "Əbədi yaşayan", origin: "Türk" },
  "aynur": { meaning: "Ay nuru", origin: "Türk" },
  "farid": { meaning: "Tək, nadir", origin: "Ərəb" },
  "ülvi": { meaning: "Yüksək, uca", origin: "Ərəb" },
  "nərmin": { meaning: "Zərif, incə", origin: "Fars" },
  "kənan": { meaning: "Cənnət torpağı", origin: "Ərəb" },
};

export function NameMeaningCalculator() {
  const { colors } = useTheme();
  const [name, setName] = useState("");

  const normalized = name.trim().toLowerCase();
  const found = NAME_DB[normalized];

  return (
    <View>
      <InputField label="Ad daxil edin" value={name} onChangeText={setName} placeholder="Aysel" />

      {name.length > 0 && (
        found ? (
          <View style={[styles.resultBox, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
            <Text style={[styles.nameText, { color: colors.n940 }]}>{name}</Text>
            <Text style={[styles.meaningText, { color: colors.accent }]}>{found.meaning}</Text>
            <Text style={[styles.originText, { color: colors.n580 }]}>Mənşə: {found.origin}</Text>
          </View>
        ) : (
          <View style={[styles.resultBox, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
            <Text style={[styles.notFound, { color: colors.n580 }]}>
              "{name}" adı bazada tapılmadı. Daha çox ad tezliklə əlavə olunacaq.
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  resultBox: { borderRadius: 12, borderWidth: 1, padding: 20, alignItems: "center", marginTop: 8 },
  nameText: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  meaningText: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  originText: { fontSize: 13 },
  notFound: { fontSize: 14, textAlign: "center" },
});
