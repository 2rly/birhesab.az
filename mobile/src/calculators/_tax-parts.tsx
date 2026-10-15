import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";

/**
 * Vergi/sığorta hesablayıcıları üçün kiçik köməkçi komponentlər
 * (vat, freelancer-tax, dividend-tax, rental-*, property-tax, life-insurance, xalq-hayat-yigim).
 */

export interface OptionCardItem<T extends string> {
  value: T;
  title: string;
  description?: string;
  icon?: string;
  badge?: string;
}

/** Saytdakı "grid" seçim kartları (başlıq + izah). */
export function OptionCards<T extends string>({
  label,
  options,
  selected,
  onSelect,
  columns = 1,
}: {
  label?: string;
  options: OptionCardItem<T>[];
  selected: T;
  onSelect: (v: T) => void;
  columns?: 1 | 2 | 3;
}) {
  const { colors } = useTheme();
  const basis = columns === 1 ? "100%" : columns === 2 ? "47%" : "30%";
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>}
      <View style={styles.grid}>
        {options.map((o) => {
          const active = o.value === selected;
          return (
            <Pressable
              key={o.value}
              onPress={() => onSelect(o.value)}
              style={[
                styles.card,
                { flexBasis: basis },
                {
                  backgroundColor: active ? colors.accent + "1f" : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {o.icon ? <Text style={styles.icon}>{o.icon}</Text> : null}
                <Text style={[styles.title, { color: active ? colors.accent : colors.n940 }]}>{o.title}</Text>
              </View>
              {o.description ? (
                <Text style={[styles.desc, { color: colors.n580 }]}>{o.description}</Text>
              ) : null}
              {o.badge ? (
                <Text style={[styles.badge, { color: colors.accent }]}>{o.badge}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export interface BarSegment {
  value: number;
  color: string;
  label?: string;
}

/** Üfüqi bölünmüş zolaq (saytdakı vizual bölgü). */
export function SplitBar({
  segments,
  height = 14,
  total: totalProp,
}: {
  segments: BarSegment[];
  height?: number;
  /** Faizlərin hesablandığı baza (verilməzsə seqmentlərin cəmi). */
  total?: number;
}) {
  const { colors } = useTheme();
  const total = totalProp ?? segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  return (
    <View style={[styles.bar, { height, backgroundColor: colors.n280 }]}>
      {total > 0 &&
        segments.map((s, i) =>
          s.value > 0 ? (
            <View key={i} style={{ width: `${Math.min(100, (s.value / total) * 100)}%`, backgroundColor: s.color, height: "100%" }} />
          ) : null,
        )}
    </View>
  );
}

/** Rəngli rəng nöqtəsi + etiket + dəyər (legend). */
export function LegendRow({ color, label, value }: { color: string; label: string; value?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.legend}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: colors.n760 }]}>{label}</Text>
      {value ? <Text style={[styles.legendValue, { color: colors.n940 }]}>{value}</Text> : null}
    </View>
  );
}

/** Kiçik izah mətni. */
export function Note({ children, center }: { children: ReactNode; center?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.note, { color: colors.n580 }, center && { textAlign: "center" }]}>{children}</Text>
  );
}

/** Rəngli fonlu kart (saytdakı bg-green-50 / bg-amber-50 və s. nəticə blokları). */
export function TintCard({
  color,
  title,
  children,
}: {
  color: string;
  title?: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tint, { borderColor: color + "66", backgroundColor: color + "14" }]}>
      {title ? <Text style={[styles.tintTitle, { color: colors.n940 }]}>{title}</Text> : null}
      {children}
    </View>
  );
}

/** Kartın içində "etiket — dəyər" sətri (ResultRow-dan yığcam). */
export function KV({
  label,
  value,
  bold,
  color,
  sub,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  sub?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.kv}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.kvLabel, { color: colors.n760 }, bold && { fontWeight: "700", color: colors.n940 }]}>
          {label}
        </Text>
        {sub ? <Text style={[styles.kvSub, { color: colors.n580 }]}>{sub}</Text> : null}
      </View>
      <Text style={[styles.kvValue, { color: color ?? colors.n940 }, bold && { fontWeight: "800" }]}>{value}</Text>
    </View>
  );
}

/** Nəticə olmadıqda göstərilən boş vəziyyət (emoji + mətn). */
export function EmptyState({ icon, text }: { icon: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 24 }}>
      <Text style={{ fontSize: 36, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ color: colors.n580, textAlign: "center", fontSize: 14 }}>{text}</Text>
    </View>
  );
}

/** Kiçik sürətli seçim düymələri (preset məbləğlər). */
export function PresetChips({
  values,
  onPick,
  format,
  active,
}: {
  values: number[];
  onPick: (v: number) => void;
  format?: (v: number) => string;
  active?: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: -8, marginBottom: 16 }}>
      {values.map((v) => {
        const on = active === v;
        return (
          <Pressable
            key={v}
            onPress={() => onPick(v)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              backgroundColor: on ? colors.accent : colors.n240,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: on ? colors.onAccent : colors.n580 }}>
              {format ? format(v) : String(v)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const SEM = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  orange: "#f97316",
  teal: "#14b8a6",
  gray: "#94a3b8",
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { flexGrow: 1, borderRadius: 12, padding: 12 },
  icon: { fontSize: 18 },
  title: { fontSize: 14, fontWeight: "700", flexShrink: 1 },
  desc: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  badge: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  bar: { width: "100%", borderRadius: 999, overflow: "hidden", flexDirection: "row", marginVertical: 8 },
  legend: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13 },
  legendValue: { fontSize: 13, fontWeight: "600" },
  note: { fontSize: 12, lineHeight: 17, marginTop: 6 },
  tint: { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 12 },
  tintTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  kv: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  kvLabel: { fontSize: 13, lineHeight: 18 },
  kvSub: { fontSize: 11, marginTop: 1 },
  kvValue: { fontSize: 14, fontWeight: "600", textAlign: "right" },
});
