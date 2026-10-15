import { useEffect, useState, type ReactNode } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";

/** Başlıqlı siyahı kartı (saytdakı "bg-gray-50 başlıq + divide-y" blokları). */
export function ListCard({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
      <View style={[styles.cardHeader, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
        <Text style={[styles.cardTitle, { color: colors.n940 }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/** Siyahı sətri: sol tərəfdə ikon + başlıq + alt mətn, sağda dəyər + alt dəyər. */
export function ListRow({
  icon,
  label,
  sub,
  value,
  valueSub,
  active,
  activeColor,
  labelColor,
  valueColor,
  badge,
}: {
  icon?: string;
  label: string;
  sub?: string;
  value?: string;
  valueSub?: string;
  active?: boolean;
  activeColor?: string;
  labelColor?: string;
  valueColor?: string;
  badge?: string;
}) {
  const { colors } = useTheme();
  const hl = activeColor ?? colors.accent;
  return (
    <View style={[styles.row, { borderBottomColor: colors.n240 }, active && { backgroundColor: hl + "1f" }]}>
      <View style={styles.rowLeft}>
        {icon ? <Text style={styles.rowIcon}>{icon}</Text> : null}
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.rowLabel, { color: labelColor ?? colors.n940, fontWeight: active ? "700" : "500" }]}>
            {label}
          </Text>
          {sub ? <Text style={[styles.rowSub, { color: colors.n580 }]}>{sub}</Text> : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, { color: valueColor ?? colors.n940 }]}>{value}</Text>
        ) : null}
        {valueSub ? <Text style={[styles.rowSub, { color: colors.n580, textAlign: "right" }]}>{valueSub}</Text> : null}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: colors.n960 }]}>
            <Text style={[styles.badgeText, { color: colors.n145 }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export interface TileOption<T extends string> {
  value: T;
  icon?: string;
  label: string;
  sub?: string;
}

/** Seçilə bilən kafel şəbəkəsi (saytdakı ikonlu seçim düymələri). */
export function TileGrid<T extends string>({
  label,
  options,
  selected,
  onSelect,
  columns = 2,
  activeColor,
}: {
  label?: string;
  options: TileOption<T>[];
  selected: T;
  onSelect: (v: T) => void;
  columns?: number;
  activeColor?: (v: T) => string | undefined;
}) {
  const { colors } = useTheme();
  const basis = `${Math.floor(100 / columns) - 3}%` as const;
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text> : null}
      <View style={styles.tiles}>
        {options.map((o) => {
          const active = o.value === selected;
          const ac = (active && activeColor?.(o.value)) || colors.accent;
          return (
            <Pressable
              key={o.value}
              onPress={() => onSelect(o.value)}
              style={[
                styles.tile,
                { flexBasis: basis as `${number}%`, backgroundColor: active ? ac + "22" : colors.n240, borderColor: active ? ac : colors.n280 },
                active && { borderWidth: 2 },
              ]}
            >
              {o.icon ? <Text style={styles.tileIcon}>{o.icon}</Text> : null}
              <Text style={[styles.tileLabel, { color: colors.n940 }]}>{o.label}</Text>
              {o.sub ? <Text style={[styles.tileSub, { color: colors.n580 }]}>{o.sub}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Kiçik mərkəzlənmiş statistik kartlar (label / dəyər / vahid). */
export function StatTiles({
  items,
}: {
  items: { label: string; value: string; unit?: string; color?: string }[];
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stats}>
      {items.map((it, i) => (
        <View
          key={i}
          style={[
            styles.stat,
            {
              backgroundColor: it.color ? it.color + "1a" : colors.n200,
              borderColor: it.color ? it.color + "55" : colors.n280,
            },
          ]}
        >
          <Text style={[styles.statLabel, { color: it.color ?? colors.n580 }]}>{it.label}</Text>
          <Text style={[styles.statValue, { color: it.color ?? colors.n940 }]}>{it.value}</Text>
          {it.unit ? <Text style={[styles.statLabel, { color: it.color ?? colors.n580 }]}>{it.unit}</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** Rəngli hissələrdən ibarət üfüqi zolaq (faizlər). */
export function SegmentBar({ segments, height = 20 }: { segments: { pct: number; color: string }[]; height?: number }) {
  return (
    <View style={[styles.bar, { height, borderRadius: height / 2 }]}>
      {segments.map((s, i) => (
        <View key={i} style={{ width: `${s.pct}%`, backgroundColor: s.color, height: "100%" }} />
      ))}
    </View>
  );
}

/** Proqres zolağı (0–100). */
export function ProgressBar({ pct, color, height = 10 }: { pct: number; color: string; height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.bar, { height, borderRadius: height / 2, backgroundColor: colors.n280 }]}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color, height: "100%", borderRadius: height / 2 }} />
    </View>
  );
}

/** Böyük rəngli nəticə kartı. */
export function BigResult({
  label,
  value,
  unit,
  extra,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  extra?: ReactNode;
  color?: string;
}) {
  const { colors } = useTheme();
  const bg = color ?? colors.accent;
  const fg = color ? "#ffffff" : colors.onAccent;
  return (
    <View style={[styles.big, { backgroundColor: bg }]}>
      <Text style={[styles.bigLabel, { color: fg }]}>{label}</Text>
      <Text style={[styles.bigValue, { color: fg }]}>{value}</Text>
      {unit ? <Text style={[styles.bigLabel, { color: fg }]}>{unit}</Text> : null}
      {typeof extra === "string" ? <Text style={[styles.bigExtra, { color: fg }]}>{extra}</Text> : extra}
    </View>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 36, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ fontSize: 14, color: colors.n580, textAlign: "center" }}>{text}</Text>
    </View>
  );
}

/** Kiçik etiket mətni */
export function Caption({ children, color, center }: { children: ReactNode; color?: string; center?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: 12, lineHeight: 17, color: color ?? colors.n580, textAlign: center ? "center" : "left" }}>
      {children}
    </Text>
  );
}

/**
 * HTML <input type="time"> əvəzi: "HH:MM" formatında maskalı mətn sahəsi.
 * Düzgün vaxt daxil edildikdə onChange("HH:MM") çağırılır.
 */
export function TimeInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const { colors } = useTheme();
  const [text, setText] = useState(value);

  useEffect(() => {
    if (value !== text && /^\d{2}:\d{2}$/.test(value)) setText(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handle = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    const out = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
    setText(out);
    if (digits.length === 4) {
      const h = +digits.slice(0, 2);
      const m = +digits.slice(2);
      if (h <= 23 && m <= 59) onChange(out);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: colors.n700 }]}>{label}</Text>
      <View style={[styles.timeRow, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <MaterialIcons name="schedule" size={20} color={colors.n580} style={{ marginLeft: 12 }} />
        <TextInput
          value={text}
          onChangeText={handle}
          placeholder="SS:DD"
          placeholderTextColor={colors.n400c}
          keyboardType="number-pad"
          maxLength={5}
          style={[styles.timeInput, { color: colors.n940 }]}
        />
      </View>
      {hint ? <Text style={{ fontSize: 12, marginTop: 4, color: colors.n580 }}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  timeRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1 },
  timeInput: { flex: 1, fontSize: 18, paddingHorizontal: 10, paddingVertical: 11, fontVariant: ["tabular-nums"] },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  cardHeader: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, flex: 1 },
  rowIcon: { fontSize: 16 },
  rowLabel: { fontSize: 13 },
  rowSub: { fontSize: 11, marginTop: 1 },
  rowRight: { alignItems: "flex-end", gap: 2, maxWidth: "50%" },
  rowValue: { fontSize: 13, fontWeight: "700", textAlign: "right" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { flexGrow: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center" },
  tileIcon: { fontSize: 22, marginBottom: 4 },
  tileLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  tileSub: { fontSize: 10, marginTop: 2, textAlign: "center" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: { flexGrow: 1, flexBasis: "30%", borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  statLabel: { fontSize: 11, textAlign: "center" },
  statValue: { fontSize: 18, fontWeight: "800", marginVertical: 3, textAlign: "center" },
  bar: { flexDirection: "row", overflow: "hidden", width: "100%" },
  big: { borderRadius: 16, padding: 20, alignItems: "center" },
  bigLabel: { fontSize: 13, opacity: 0.85, textAlign: "center" },
  bigValue: { fontSize: 44, fontWeight: "800", marginVertical: 2, textAlign: "center" },
  bigExtra: { fontSize: 12, opacity: 0.85, marginTop: 6, textAlign: "center" },
  empty: { alignItems: "center", paddingVertical: 24 },
});
