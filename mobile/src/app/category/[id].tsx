import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";
import { categories } from "@/constants/categories";
import { calculators } from "@/data/calculators";

export default function CategoryDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const category = categories.find((c) => c.id === id);
  const items = useMemo(
    () => calculators.filter((c) => c.category === id),
    [id]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.n165 }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.n700} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.n960 }]}>
          {category?.name || "Kateqoriya"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.count, { color: colors.n580 }]}>
          {items.length} hesablayıcı
        </Text>

        <View style={styles.list}>
          {items.map((calc, i) => (
            <Pressable
              key={calc.id}
              onPress={() => router.push(`/calculator/${calc.slug}`)}
              style={[
                styles.row,
                { backgroundColor: colors.n195 },
                i === 0 && styles.rowFirst,
                i === items.length - 1 && styles.rowLast,
              ]}
            >
              <View
                style={[styles.iconWrap, { backgroundColor: colors.n240 }]}
              >
                <MaterialIcons
                  name={calc.icon as keyof typeof MaterialIcons.glyphMap}
                  size={20}
                  color={colors.accent}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowName, { color: colors.n840 }]}>
                  {calc.name}
                </Text>
                <Text
                  style={[styles.rowDesc, { color: colors.n500c }]}
                  numberOfLines={1}
                >
                  {calc.description}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={colors.n400c}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { paddingBottom: 32 },
  count: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 16, gap: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  rowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  rowLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: "600" },
  rowDesc: { fontSize: 12, marginTop: 2 },
});
