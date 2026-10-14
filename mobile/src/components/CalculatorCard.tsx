import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import type { Calculator } from "@/data/calculators";

export function CalculatorCard({ calculator }: { calculator: Calculator }) {
  const { colors } = useTheme();

  return (
    <Link
      href={{
        pathname: "/calculator/[slug]",
        params: { slug: calculator.slug },
      }}
      asChild
    >
      <Pressable
        style={[
          styles.card,
          { backgroundColor: colors.n195, borderColor: colors.n280 },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.n240 }]}>
          <MaterialIcons
            name={calculator.icon as keyof typeof MaterialIcons.glyphMap}
            size={20}
            color={colors.accent}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.n960 }]} numberOfLines={1}>
            {calculator.name}
          </Text>
          <Text
            style={[styles.description, { color: colors.n580 }]}
            numberOfLines={2}
          >
            {calculator.description}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.n400} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  description: { fontSize: 12, lineHeight: 16 },
});
