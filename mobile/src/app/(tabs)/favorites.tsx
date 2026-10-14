import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";
import { useFavorites } from "@/constants/favorites";
import { calculators } from "@/data/calculators";

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { favorites, toggle } = useFavorites();

  const favoriteCalcs = useMemo(
    () => calculators.filter((c) => favorites.has(c.id)),
    [favorites]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.n165 }]}
      contentContainerStyle={{ paddingBottom: 32, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.n960 }]}>Seçilmişlər</Text>
        <Text style={[styles.subtitle, { color: colors.n580 }]}>
          {favoriteCalcs.length > 0
            ? `${favoriteCalcs.length} hesablayıcı saxlanılıb`
            : "Hələ seçilmiş yoxdur"}
        </Text>
      </View>

      {favoriteCalcs.length === 0 ? (
        <View style={styles.empty}>
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.n200 }]}
          >
            <MaterialIcons name="bookmark-outline" size={40} color={colors.n400} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.n700 }]}>
            Seçilmişlər boşdur
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.n500c }]}>
            Hesablayıcıları bəyəndikdə burada görünəcək
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {favoriteCalcs.map((calc, i) => (
            <Pressable
              key={calc.id}
              onPress={() => router.push(`/calculator/${calc.slug}`)}
              style={[
                styles.row,
                { backgroundColor: colors.n195 },
                i === 0 && styles.rowFirst,
                i === favoriteCalcs.length - 1 && styles.rowLast,
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
              <Pressable onPress={() => toggle(calc.id)} hitSlop={8}>
                <MaterialIcons name="bookmark" size={22} color={colors.accent} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
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
