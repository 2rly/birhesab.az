import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  suffix?: string;
  prefix?: string;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  suffix,
  prefix,
}: InputFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.n240, borderColor: colors.n280 },
        ]}
      >
        {prefix && (
          <Text style={[styles.affix, { color: colors.n580 }]}>{prefix}</Text>
        )}
        <TextInput
          style={[
            styles.input,
            { color: colors.n940 },
            prefix && styles.inputWithPrefix,
            suffix && styles.inputWithSuffix,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.n400c}
          keyboardType={keyboardType}
        />
        {suffix && (
          <Text style={[styles.affix, { color: colors.n580 }]}>{suffix}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWithPrefix: { paddingLeft: 4 },
  inputWithSuffix: { paddingRight: 4 },
  affix: { fontSize: 14, paddingHorizontal: 12 },
});
