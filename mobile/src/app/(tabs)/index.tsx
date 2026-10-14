import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";
import { calculators } from "@/data/calculators";

const { width } = Dimensions.get("window");
const CARD_GAP = 10;
const CARD_WIDTH = (width - 32 - CARD_GAP) / 2;

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const popularCalculators = useMemo(
    () => calculators.filter((c) => c.popular),
    []
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.n165 }]}
      contentContainerStyle={{ paddingBottom: 32, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.logo, { color: colors.n960 }]}>
            Bir<Text style={{ color: colors.accent }}>Hesab</Text>
          </Text>
          <Text style={[styles.tagline, { color: colors.n580 }]}>
            Bütün hesablamalar bir yerdə
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/search")}
          style={[styles.searchBtn, { backgroundColor: colors.n200 }]}
        >
          <MaterialIcons name="search" size={22} color={colors.n580} />
        </Pressable>
      </View>

      {/* Featured Salary Card */}
      <Pressable
        onPress={() => router.push("/calculator/emek-haqqi")}
        style={[styles.featuredCard, { backgroundColor: colors.accent }]}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadge}>
            <MaterialIcons name="payments" size={16} color={colors.onAccent} />
            <Text style={[styles.featuredBadgeText, { color: colors.onAccent }]}>
              Ən populyar
            </Text>
          </View>
          <Text style={[styles.featuredTitle, { color: colors.onAccent }]}>
            Əmək haqqı{"\n"}hesablayıcısı
          </Text>
          <Text
            style={[styles.featuredDesc, { color: colors.onAccent, opacity: 0.7 }]}
          >
            Gross → Net, vergi, DSMF
          </Text>
        </View>
        <View style={styles.featuredIcon}>
          <MaterialIcons name="arrow-forward" size={24} color={colors.onAccent} />
        </View>
      </Pressable>

      {/* Popular Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.n760 }]}>
          Populyar hesablayıcılar
        </Text>
        <View style={styles.grid}>
          {popularCalculators.map((calc) => (
            <Pressable
              key={calc.id}
              onPress={() => router.push(`/calculator/${calc.slug}`)}
              style={[
                styles.gridCard,
                { backgroundColor: colors.n195, width: CARD_WIDTH },
              ]}
            >
              <View
                style={[
                  styles.gridIconWrap,
                  { backgroundColor: colors.n240 },
                ]}
              >
                <MaterialIcons
                  name={calc.icon as keyof typeof MaterialIcons.glyphMap}
                  size={20}
                  color={colors.accent}
                />
              </View>
              <Text
                style={[styles.gridCardTitle, { color: colors.n840 }]}
                numberOfLines={2}
              >
                {calc.name}
              </Text>
              <Text
                style={[styles.gridCardDesc, { color: colors.n500c }]}
                numberOfLines={1}
              >
                {calc.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* All calculators count */}
      <Pressable
        onPress={() => router.push("/(tabs)/categories")}
        style={[styles.allCalcBtn, { backgroundColor: colors.n195 }]}
      >
        <Text style={[styles.allCalcText, { color: colors.n700 }]}>
          Bütün hesablayıcılar ({calculators.length})
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.n500c} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logo: { fontSize: 28, fontWeight: "800" },
  tagline: { fontSize: 13, marginTop: 2 },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  featuredContent: { flex: 1 },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  featuredBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  featuredTitle: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  featuredDesc: { fontSize: 13, marginTop: 6 },
  featuredIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  section: { marginTop: 28, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: CARD_GAP },
  gridCard: {
    borderRadius: 14,
    padding: 14,
    minHeight: 120,
  },
  gridIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridCardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  gridCardDesc: { fontSize: 11 },
  allCalcBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  allCalcText: { fontSize: 14, fontWeight: "600" },
});
