import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";

// RN runtime-da ScrollView.Context mövcuddur, lakin ictimai TS tiplərində elan olunmayıb.
const ScrollViewContext = (
  ScrollView as unknown as { Context: React.Context<{ horizontal: boolean } | null> }
).Context;

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  /** Qrup başlığı — eyni group dəyərli seçimlər bir başlıq altında göstərilir */
  group?: string;
}

interface SelectProps<T extends string> {
  label?: string;
  value: T | "";
  options: SelectOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
  /** Axtarış qutusu. Göstərilməsə, 8-dən çox seçim olduqda avtomatik açılır */
  searchable?: boolean;
  hint?: string;
}

/** HTML <select> əvəzi: toxunduqda alt pəncərədə siyahı açılır. */
export function Select<T extends string>({
  label,
  value,
  options,
  onSelect,
  placeholder = "Seçin",
  searchable,
  hint,
}: SelectProps<T>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const showSearch = searchable ?? options.length > 8;

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLocaleLowerCase("az").includes(q) ||
        o.description?.toLocaleLowerCase("az").includes(q) ||
        o.value.toLocaleLowerCase("az").includes(q)
    );
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: colors.n240, borderColor: colors.n280 }]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={[styles.fieldText, { color: selected ? colors.n940 : colors.n400c }]}
          numberOfLines={2}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <MaterialIcons name="expand-more" size={22} color={colors.n580} />
      </Pressable>
      {hint && <Text style={[styles.hint, { color: colors.n580 }]}>{hint}</Text>}

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        {/* Select adətən hesablayıcı ekranının ScrollView-u içindədir; React konteksti
            Modal-dan keçdiyi üçün FlatList "nested VirtualizedList" xətası verir.
            Konteksti sıfırlayırıq — modal ayrıca pəncərədir, iç-içə sürüşmə yoxdur. */}
        <ScrollViewContext.Provider value={null}>
        <Pressable style={styles.backdrop} onPress={close} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.n195, paddingBottom: insets.bottom + 12 },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.n960 }]} numberOfLines={1}>
              {label ?? placeholder}
            </Text>
            <Pressable onPress={close} hitSlop={10}>
              <MaterialIcons name="close" size={24} color={colors.n700} />
            </Pressable>
          </View>
          {showSearch && (
            <View style={[styles.search, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
              <MaterialIcons name="search" size={20} color={colors.n580} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Axtar..."
                placeholderTextColor={colors.n400c}
                style={[styles.searchInput, { color: colors.n940 }]}
                autoCorrect={false}
              />
            </View>
          )}
          <FlatList
            data={filtered}
            keyExtractor={(o) => o.value}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={30}
            renderItem={({ item, index }) => {
              const active = item.value === value;
              const prev = filtered[index - 1];
              const showGroup = item.group && item.group !== prev?.group;
              return (
                <View>
                  {showGroup && (
                    <Text style={[styles.group, { color: colors.accent }]}>{item.group}</Text>
                  )}
                  <Pressable
                    onPress={() => {
                      onSelect(item.value);
                      close();
                    }}
                    style={[
                      styles.option,
                      { borderBottomColor: colors.n240 },
                      active && { backgroundColor: colors.n240 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.optionText,
                          { color: active ? colors.accent : colors.n940 },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text style={[styles.optionDesc, { color: colors.n580 }]}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    {active && <MaterialIcons name="check" size={20} color={colors.accent} />}
                  </Pressable>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.n580 }]}>Nəticə tapılmadı</Text>
            }
          />
        </View>
        </ScrollViewContext.Provider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  hint: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  fieldText: { flex: 1, fontSize: 16 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    maxHeight: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", flex: 1, marginRight: 12 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  group: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  optionText: { fontSize: 15 },
  optionDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  empty: { textAlign: "center", padding: 24, fontSize: 14 },
});
