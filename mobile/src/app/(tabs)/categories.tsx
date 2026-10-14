import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { categories } from "@/constants/categories";
import { calculators } from "@/data/calculators";
import type { ThemeColors } from "@/constants/colors";

export default function CatalogScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(colors);

  const catList = categories.filter((c) => c.id !== "all");

  return (
    <ScrollView
      style={[s.container, { paddingTop: insets.top }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.title}>Kataloq</Text>
      <Text style={s.subtitle}>{calculators.length} hesablayıcı</Text>

      <View style={s.card}>
        {catList.map((cat, i) => {
          const count = calculators.filter(
            (c) => c.category === cat.id
          ).length;
          return (
            <Pressable
              key={cat.id}
              style={[s.row, i < catList.length - 1 && s.rowBorder]}
              onPress={() =>
                router.push({
                  pathname: "/category/[id]",
                  params: { id: cat.id },
                })
              }
            >
              <Text style={s.rowNum}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              <View style={s.rowContent}>
                <Text style={s.rowName}>{cat.name}</Text>
                <Text style={s.rowCount}>{count}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={colors.n400}
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.n165 },
    content: { paddingBottom: 32 },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: c.n960,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    subtitle: {
      fontSize: 14,
      color: c.n580,
      paddingHorizontal: 20,
      marginTop: 4,
      marginBottom: 20,
    },
    card: {
      marginHorizontal: 20,
      backgroundColor: c.n195,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.n280,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: c.n240,
    },
    rowNum: {
      fontSize: 13,
      fontWeight: "600",
      color: c.n400,
      width: 28,
      fontVariant: ["tabular-nums"],
    },
    rowContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginRight: 8,
    },
    rowName: {
      fontSize: 15,
      fontWeight: "600",
      color: c.n960,
    },
    rowCount: {
      fontSize: 13,
      color: c.n580,
      fontVariant: ["tabular-nums"],
    },
  });
}
