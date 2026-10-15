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
import { FeedbackForm } from "@/components/FeedbackForm";

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

      {/* Haqqımızda — saytın footer mətni */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.n580 }]}>
          HAQQIMIZDA
        </Text>
        <View style={[styles.card, styles.textCard, { backgroundColor: colors.n195 }]}>
          <Text style={[styles.brand, { color: colors.n960 }]}>
            <Text style={{ color: colors.accent }}>Bir</Text>Hesab
            <Text style={{ color: colors.accent, fontSize: 13 }}>.az</Text>
          </Text>
          <Text style={[styles.bodyText, { color: colors.n760 }]}>
            Bütün hesablamalar bir yerdə. Azərbaycanın ən geniş onlayn hesablayıcı platforması.
          </Text>
          <Text style={[styles.subTitle, { color: colors.n940 }]}>Məxfilik</Text>
          <Text style={[styles.bodyText, { color: colors.n760 }]}>
            Məxfiliyiniz bizim üçün prioritetdir. BirHesab.az platformasında apardığınız heç bir
            hesablama və daxil etdiyiniz fərdi məlumatlar serverlərimizdə saxlanılmır. Bütün
            hesablamalar birbaşa sizin cihazınızda icra edilir.
          </Text>
        </View>
      </View>

      {/* Təklif və iradlar */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.n580 }]}>
          TƏKLİF VƏ İRADLAR
        </Text>
        <View style={[styles.card, styles.textCard, { backgroundColor: colors.n195 }]}>
          <FeedbackForm />
        </View>
      </View>

      {/* Əlaqə */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.n580 }]}>
          ƏLAQƏ
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
            onPress={() => Linking.openURL("mailto:info@birhesab.az")}
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
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.n840 }]}>
                info@birhesab.az
              </Text>
              <Text style={[styles.rowHint, { color: colors.n500c }]}>
                Təklif və iradlarınız üçün bizimlə əlaqə saxlayın.
              </Text>
            </View>
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
          © {new Date().getFullYear()} BirHesab.az — Bütün hüquqlar qorunur.
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
  rowHint: { fontSize: 12, marginTop: 2 },
  textCard: { padding: 16 },
  brand: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subTitle: { fontSize: 15, fontWeight: "700", marginTop: 14, marginBottom: 4 },
  bodyText: { fontSize: 14, lineHeight: 21 },
  divider: { height: 0.5, marginLeft: 62 },
  footer: { alignItems: "center", marginTop: 48 },
  footerText: { fontSize: 13, marginTop: 4 },
});
