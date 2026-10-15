import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";

/** Semantik rənglər (saytdakı green/amber/red/blue/pink blokları üçün). */
export const TINT = {
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  blue: "#2563eb",
  pink: "#db2777",
  purple: "#7c3aed",
  orange: "#ea580c",
  gray: "#64748b",
} as const;

export type Tint = keyof typeof TINT;

/** Başlıqlı kart (saytdakı "bg-gray-50 başlıq + divide-y" blokları). */
export function Panel({ title, icon, children }: { title?: string; icon?: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[s.panel, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
      {title ? (
        <View style={[s.panelHead, { borderBottomColor: colors.n280, backgroundColor: colors.n240 }]}>
          <Text style={[s.panelTitle, { color: colors.n940 }]}>
            {icon ? `${icon} ` : ""}
            {title}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Sətir: sol etiket + sağ dəyər, istəyə görə rəngli fon. */
export function TintRow({
  label,
  value,
  tint,
  bold,
  sub,
  valueTint,
  last,
}: {
  label: string;
  value: string;
  tint?: Tint;
  bold?: boolean;
  sub?: string;
  valueTint?: Tint;
  last?: boolean;
}) {
  const { colors } = useTheme();
  const c = tint ? TINT[tint] : undefined;
  const vc = valueTint ? TINT[valueTint] : c;
  return (
    <View
      style={[
        s.row,
        { borderBottomColor: colors.n280, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
        c ? { backgroundColor: c + "1a" } : null,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, { color: c ?? colors.n580 }, bold && s.bold]}>{label}</Text>
        {sub ? <Text style={[s.rowSub, { color: c ?? colors.n580 }]}>{sub}</Text> : null}
      </View>
      <Text style={[s.rowValue, { color: vc ?? colors.n940 }, bold && s.bold]}>{value}</Text>
    </View>
  );
}

/** Kiçik nişan. */
export function Badge({ text, tint }: { text: string; tint: Tint }) {
  const c = TINT[tint];
  return (
    <View style={[s.badge, { backgroundColor: c + "26" }]}>
      <Text style={[s.badgeText, { color: c }]}>{text}</Text>
    </View>
  );
}

/** Rəngli böyük nəticə bloku (saytdakı gradient hero). */
export function TintHero({
  label,
  value,
  sub,
  tint = "blue",
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  tint?: Tint;
  children?: ReactNode;
}) {
  const c = TINT[tint];
  return (
    <View style={[s.hero, { backgroundColor: c }]}>
      <Text style={s.heroLabel}>{label}</Text>
      <Text style={s.heroValue}>{value}</Text>
      {sub ? <Text style={s.heroSub}>{sub}</Text> : null}
      {children}
    </View>
  );
}

/** Rəngli çərçivəli qutu. */
export function TintBox({ tint, children, center }: { tint: Tint; children: ReactNode; center?: boolean }) {
  const c = TINT[tint];
  return (
    <View style={[s.box, { borderColor: c + "66", backgroundColor: c + "14" }, center && { alignItems: "center" }]}>
      {children}
    </View>
  );
}

export function TintText({
  tint,
  children,
  bold,
  size = 13,
  center,
}: {
  tint?: Tint;
  children: ReactNode;
  bold?: boolean;
  size?: number;
  center?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: tint ? TINT[tint] : colors.n760,
        fontWeight: bold ? "700" : "400",
        fontSize: size,
        lineHeight: Math.round(size * 1.45),
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </Text>
  );
}

/** Boz qeyd qutusu (saytdakı "* Real bölgü..." qeydləri). */
export function NoteBox({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[s.box, { borderColor: colors.n280, backgroundColor: colors.n200, alignItems: "center" }]}>
      <Text style={{ color: colors.n580, fontSize: 12, lineHeight: 18, textAlign: "center" }}>{children}</Text>
    </View>
  );
}

/** Boş vəziyyət (nəticə yoxdursa). */
export function EmptyState({ icon, text, tint }: { icon?: string; text: string; tint?: Tint }) {
  const { colors } = useTheme();
  const c = tint ? TINT[tint] : undefined;
  return (
    <View
      style={[
        s.empty,
        c ? { backgroundColor: c + "14", borderColor: c + "55", borderWidth: 1, borderRadius: 12 } : null,
      ]}
    >
      {icon ? <Text style={{ fontSize: 36, marginBottom: 10 }}>{icon}</Text> : null}
      <Text style={{ color: c ?? colors.n580, fontSize: 14, textAlign: "center", lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

/** Seçilə bilən kart (saytdakı grid düymələri — başlıq + izah). */
export function OptionCard({
  title,
  desc,
  icon,
  right,
  selected,
  onPress,
  disabled,
}: {
  title: string;
  desc?: string;
  icon?: string;
  right?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        s.option,
        {
          borderColor: selected ? colors.accent : colors.n280,
          backgroundColor: selected ? colors.accent + "1f" : colors.n200,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {icon ? <Text style={{ fontSize: 20 }}>{icon}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={[s.optTitle, { color: selected ? colors.accent : colors.n940 }]}>{title}</Text>
        {desc ? <Text style={[s.optDesc, { color: colors.n580 }]}>{desc}</Text> : null}
      </View>
      {right ? <Text style={[s.optRight, { color: selected ? colors.accent : colors.n760 }]}>{right}</Text> : null}
      {selected ? <MaterialIcons name="check-circle" size={18} color={colors.accent} /> : null}
    </Pressable>
  );
}

/** Kiçik etiket mətni. */
export function FieldLabel({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[s.fieldLabel, { color: colors.n700 }]}>{children}</Text>;
}

export function Hint({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.n580, fontSize: 12, lineHeight: 16, marginTop: -10, marginBottom: 14 }}>{children}</Text>;
}

/** Mətndən daxil olan tam ədəd (parseInt ekvivalenti). */
export function toInt(s: string): number {
  const v = parseInt(s, 10);
  return isFinite(v) ? v : 0;
}

/** Saytdakı formatMoney: "1 234.56 AZN" (toFixed(2) + boşluq). */
export function moneyAZN(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

const s = StyleSheet.create({
  panel: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 16 },
  panelHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  panelTitle: { fontSize: 14, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  rowLabel: { fontSize: 13, lineHeight: 18 },
  rowSub: { fontSize: 11, marginTop: 2, lineHeight: 15, opacity: 0.9 },
  rowValue: { fontSize: 13, fontWeight: "600", textAlign: "right", maxWidth: "55%" },
  bold: { fontWeight: "700" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  hero: { borderRadius: 16, padding: 18, marginTop: 16 },
  heroLabel: { color: "#ffffffd9", fontSize: 13, fontWeight: "600" },
  heroValue: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "#ffffffcc", fontSize: 12, marginTop: 6, lineHeight: 17 },
  box: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  empty: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 16, marginTop: 16 },
  option: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1.5, padding: 12, marginBottom: 8 },
  optTitle: { fontSize: 14, fontWeight: "600" },
  optDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  optRight: { fontSize: 13, fontWeight: "700" },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
});
