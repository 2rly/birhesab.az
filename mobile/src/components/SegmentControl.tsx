import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentControlProps<T extends string> {
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
  label?: string;
}

export function SegmentControl<T extends string>({
  options,
  selected,
  onSelect,
  label,
}: SegmentControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>
      )}
      <View style={[styles.segmentRow, { backgroundColor: colors.n240 }]}>
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[
                styles.segment,
                active && { backgroundColor: colors.accent },
              ]}
              onPress={() => onSelect(opt.value)}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: colors.n580 },
                  active && { color: colors.onAccent },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  segmentRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentText: { fontSize: 14, fontWeight: "600" },
});
