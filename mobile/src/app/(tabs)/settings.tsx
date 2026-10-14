import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";

export default function SettingsScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.n165 }]}
      contentContainerStyle={{ paddingBottom: 32, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.n960 }]}>Ayarlar</Text>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.n580 }]}>
          GÖRÜNÜŞ
        </Text>
        <View style={[styles.card, { backgroundColor: colors.n195 }]}>
          <View style={styles.row}>
            <View
              style={[styles.iconWrap, { backgroundColor: colors.n240 }]}
            >
              <MaterialIcons
                name={theme === "dark" ? "dark-mode" : "light-mode"}
                size={20}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.rowLabel, { color: colors.n840 }]}>
              Qaranlıq rejim
            </Text>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.n300, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.n580 }]}>
          HAQQINDA
        </Text>
        <View style={[styles.card, { backgroundColor: colors.n195 }]}>
          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL("https://birhesab.az")}
          >
            <View
              style={[styles.iconWrap, { backgroundColor: colors.n240 }]}
            >
              <MaterialIcons name="language" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.n840 }]}>
              Veb sayt
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={colors.n400c}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.n240 }]} />

          <Pressable
            style={styles.row}
            onPress={() =>
              Linking.openURL("mailto:support@birhesab.az?subject=Rəy")
            }
          >
            <View
              style={[styles.iconWrap, { backgroundColor: colors.n240 }]}
            >
              <MaterialIcons
                name="mail-outline"
                size={20}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.rowLabel, { color: colors.n840 }]}>
              Rəy göndər
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={colors.n400c}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.n240 }]} />

          <View style={styles.row}>
            <View
              style={[styles.iconWrap, { backgroundColor: colors.n240 }]}
            >
              <MaterialIcons name="info-outline" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.n840 }]}>
              Versiya
            </Text>
            <Text style={[styles.rowValue, { color: colors.n500c }]}>
              1.0.0
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.n400 }]}>
          BirHesab.az © 2026
        </Text>
        <Text style={[styles.footerText, { color: colors.n340 }]}>
          Bütün hesablamalar bir yerdə
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: 14, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  rowValue: { fontSize: 14 },
  divider: { height: 0.5, marginLeft: 62 },
  footer: { alignItems: "center", marginTop: 48 },
  footerText: { fontSize: 13, marginTop: 4 },
});
