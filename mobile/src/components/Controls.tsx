import { useEffect, useState } from "react";
import { View, Text, Pressable, Switch, TextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { parseISODate, toISODate } from "@/lib/format";

/** HTML checkbox əvəzi — etiket, izah və açar (Switch). */
export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.toggle, { backgroundColor: colors.n240, borderColor: colors.n280 }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: colors.n940 }]}>{label}</Text>
        {description && (
          <Text style={[styles.toggleDesc, { color: colors.n580 }]}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.accent, false: colors.n340 }}
        thumbColor="#ffffff"
      />
    </Pressable>
  );
}

/** Kvadrat checkbox — siyahılarda çoxlu seçim üçün. */
export function Checkbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <MaterialIcons
        name={checked ? "check-box" : "check-box-outline-blank"}
        size={22}
        color={checked ? colors.accent : colors.n580}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.checkLabel, { color: colors.n940 }]}>{label}</Text>
        {description && (
          <Text style={[styles.toggleDesc, { color: colors.n580 }]}>{description}</Text>
        )}
      </View>
    </Pressable>
  );
}

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/** Bükülən düymə qrupu — 3-dən çox seçim olduqda SegmentControl əvəzi. */
export function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label?: string;
  options: ChipOption<T>[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>}
      <View style={styles.chips}>
        {options.map((o) => {
          const active = o.value === selected;
          return (
            <Pressable
              key={o.value}
              onPress={() => onSelect(o.value)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.accent : colors.n240, borderColor: active ? colors.accent : colors.n280 },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.onAccent : colors.n760 }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Çoxlu seçimli chip qrupu. */
export function MultiChipGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label?: string;
  options: ChipOption<T>[];
  selected: T[];
  onChange: (v: T[]) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>}
      <View style={styles.chips}>
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <Pressable
              key={o.value}
              onPress={() =>
                onChange(active ? selected.filter((v) => v !== o.value) : [...selected, o.value])
              }
              style={[
                styles.chip,
                { backgroundColor: active ? colors.accent : colors.n240, borderColor: active ? colors.accent : colors.n280 },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.onAccent : colors.n760 }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * HTML <input type="date"> əvəzi. Dəyər "YYYY-MM-DD" sətridir (sayt ilə eyni),
 * istifadəçi isə GG.AA.İİİİ formatında daxil edir. Etibarsız daxiletmədə onChange("") çağırılır.
 */
export function DateField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  hint?: string;
}) {
  const { colors } = useTheme();
  const toDisplay = (iso: string) => {
    const d = parseISODate(iso);
    if (!d) return "";
    const p = (x: number) => String(x).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
  };
  const [text, setText] = useState(toDisplay(value));

  useEffect(() => {
    // Xaricdən dəyər dəyişərsə (məs. "bu gün" düyməsi) mətni yenilə
    if (value && toDisplay(value) !== text) setText(toDisplay(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handle = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let out = digits;
    if (digits.length > 4) out = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
    else if (digits.length > 2) out = `${digits.slice(0, 2)}.${digits.slice(2)}`;
    setText(out);
    if (digits.length === 8) {
      const d = new Date(+digits.slice(4, 8), +digits.slice(2, 4) - 1, +digits.slice(0, 2));
      if (d.getDate() === +digits.slice(0, 2) && d.getMonth() === +digits.slice(2, 4) - 1) {
        onChange(toISODate(d));
        return;
      }
    }
    onChange("");
  };

  const setToday = () => {
    const iso = toISODate(new Date());
    setText(toDisplay(iso));
    onChange(iso);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>
      <View style={[styles.dateRow, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <MaterialIcons name="event" size={20} color={colors.n580} style={{ marginLeft: 12 }} />
        <TextInput
          value={text}
          onChangeText={handle}
          placeholder="GG.AA.İİİİ"
          placeholderTextColor={colors.n400c}
          keyboardType="number-pad"
          maxLength={10}
          style={[styles.dateInput, { color: colors.n940 }]}
        />
        <Pressable onPress={setToday} hitSlop={6} style={styles.todayBtn}>
          <Text style={[styles.todayText, { color: colors.accent }]}>Bu gün</Text>
        </Pressable>
      </View>
      {hint && <Text style={[styles.hint, { color: colors.n580 }]}>{hint}</Text>}
    </View>
  );
}

/** Əsas / ikinci dərəcəli düymə. */
export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: primary ? colors.accent : colors.n240,
          borderColor: primary ? colors.accent : colors.n280,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {icon && <MaterialIcons name={icon} size={18} color={primary ? colors.onAccent : colors.n840} />}
      <Text style={[styles.buttonText, { color: primary ? colors.onAccent : colors.n840 }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  hint: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 10,
  },
  toggleLabel: { fontSize: 14, fontWeight: "600" },
  toggleDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  checkLabel: { fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  dateRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1 },
  dateInput: { flex: 1, fontSize: 16, paddingHorizontal: 10, paddingVertical: 12 },
  todayBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  todayText: { fontSize: 13, fontWeight: "700" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  buttonText: { fontSize: 15, fontWeight: "700" },
});
