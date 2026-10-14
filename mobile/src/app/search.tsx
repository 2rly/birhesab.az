import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";
import { calculators, Calculator } from "@/data/calculators";

function azLower(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}

function normalize(s: string): string {
  return azLower(s)
    .replace(/ə/g, "e")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g");
}

const TAGS = ["Əmək haqqı", "Kredit", "ƏDV", "IELTS", "BMI", "Endirim"];

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = azLower(query.trim());
    const qn = normalize(query.trim());
    return calculators.filter(
      (c) =>
        azLower(c.name).includes(q) ||
        azLower(c.description).includes(q) ||
        normalize(c.name).includes(qn) ||
        normalize(c.description).includes(qn)
    );
  }, [query]);

  const renderItem = ({ item }: { item: Calculator }) => (
    <Pressable
      style={[styles.resultRow, { backgroundColor: colors.n195 }]}
      onPress={() => {
        Keyboard.dismiss();
        router.push(`/calculator/${item.slug}`);
      }}
    >
      <View style={[styles.resultIcon, { backgroundColor: colors.n240 }]}>
        <MaterialIcons
          name={item.icon as keyof typeof MaterialIcons.glyphMap}
          size={18}
          color={colors.accent}
        />
      </View>
      <View style={styles.resultText}>
        <Text style={[styles.resultName, { color: colors.n840 }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.resultDesc, { color: colors.n500c }]}
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={18} color={colors.n400} />
    </Pressable>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.n165, paddingTop: insets.top }]}
    >
      {/* Search bar */}
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.n700} />
        </Pressable>
        <View
          style={[styles.inputWrap, { backgroundColor: colors.n200 }]}
        >
          <MaterialIcons name="search" size={20} color={colors.n500c} />
          <TextInput
            style={[styles.input, { color: colors.n940 }]}
            placeholder="Hesablayıcı axtar..."
            placeholderTextColor={colors.n400c}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={colors.n500c} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tags */}
      {!results && (
        <View style={styles.tags}>
          <Text style={[styles.tagsLabel, { color: colors.n580 }]}>
            Populyar axtarışlar
          </Text>
          <View style={styles.tagRow}>
            {TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => setQuery(tag)}
                style={[styles.tag, { backgroundColor: colors.n200 }]}
              >
                <Text style={[styles.tagText, { color: colors.n700 }]}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {results && (
        <>
          <Text style={[styles.resultCount, { color: colors.n580 }]}>
            {results.length} nəticə
          </Text>
          {results.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons
                name="search-off"
                size={48}
                color={colors.n340}
              />
              <Text style={[styles.emptyText, { color: colors.n500c }]}>
                Nəticə tapılmadı
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: { flex: 1, fontSize: 15 },
  tags: { paddingHorizontal: 20, paddingTop: 12 },
  tagsLabel: { fontSize: 13, fontWeight: "600", marginBottom: 10 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: "500" },
  resultCount: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  resultList: { paddingHorizontal: 16 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  resultIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: "600" },
  resultDesc: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 15, marginTop: 12 },
});
