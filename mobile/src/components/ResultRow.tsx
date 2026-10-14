import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";

interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}

export function ResultRow({ label, value, highlight, bold }: ResultRowProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: colors.n240 },
        highlight && { backgroundColor: colors.n240, borderRadius: 8, borderBottomWidth: 0, marginVertical: 2 },
      ]}
    >
      <Text style={[styles.label, { color: colors.n580 }, bold && styles.bold]}>
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          { color: colors.n840 },
          bold && styles.bold,
          highlight && { color: colors.accent, fontWeight: "700" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function ResultSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      {title && (
        <Text style={[styles.sectionTitle, { color: colors.n760 }]}>
          {title}
        </Text>
      )}
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: colors.n200, borderColor: colors.n280 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  label: { fontSize: 13, flex: 1 },
  value: { fontSize: 14, fontWeight: "500", textAlign: "right" },
  bold: { fontWeight: "700", fontSize: 14 },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
});
