import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";

/**
 * Kredit / depozit / inflyasiya hesablayıcıları üçün köməkçi komponentlər
 * (mortgage, deposit, loan, auto-loan, education-loan, deposit-tax, inflation).
 */

export const TONES = {
  green: "#22c55e",
  emerald: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  purple: "#a855f7",
  orange: "#FF5722",
} as const;
export type Tone = keyof typeof TONES | "neutral" | "accent";

function useToneColor() {
  const { colors } = useTheme();
  return (tone: Tone | undefined) =>
    tone === undefined || tone === "neutral" ? null : tone === "accent" ? colors.accent : TONES[tone];
}

export interface OptionCardItem<T extends string> {
  value: T;
  title: string;
  description?: string;
  icon?: string;
}

/** Saytdakı seçim kartları (başlıq + izah). */
export function OptionCards<T extends string>({
  label,
  options,
  selected,
  onSelect,
  columns = 2,
  center,
}: {
  label?: string;
  options: OptionCardItem<T>[];
  selected: T;
  onSelect: (v: T) => void;
  columns?: 1 | 2 | 3;
  center?: boolean;
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
                { flexBasis: basis, alignItems: center ? "center" : "flex-start" },
                {
                  backgroundColor: active ? colors.accent + "1f" : colors.n240,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              {center && o.icon ? <Text style={styles.bigIcon}>{o.icon}</Text> : null}
              <Text
                style={[
                  styles.cardTitle,
                  { color: active ? colors.accent : colors.n940, textAlign: center ? "center" : "left" },
                ]}
              >
                {!center && o.icon ? `${o.icon} ` : ""}
                {o.title}
              </Text>
              {o.description ? (
                <Text style={[styles.cardDesc, { color: colors.n580, textAlign: center ? "center" : "left" }]}>
                  {o.description}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Rəngli statistik kart (saytdakı bg-green-50 / bg-red-50 və s. nəticə kartları). */
export function ToneCard({
  label,
  value,
  sub,
  tone = "neutral",
  big,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  big?: boolean;
}) {
  const { colors } = useTheme();
  const toneColor = useToneColor()(tone);
  return (
    <View
      style={[
        styles.toneCard,
        {
          backgroundColor: toneColor ? toneColor + "1a" : colors.n200,
          borderColor: toneColor ? toneColor + "66" : colors.n280,
        },
      ]}
    >
      <Text style={[styles.toneLabel, { color: toneColor ?? colors.n580 }]}>{label}</Text>
      <Text style={[styles.toneValue, big && { fontSize: 24 }, { color: toneColor ?? colors.n940 }]}>{value}</Text>
      {sub ? <Text style={[styles.toneSub, { color: colors.n580 }]}>{sub}</Text> : null}
    </View>
  );
}

/** ToneCard-ların bükülən şəbəkəsi. */
export function ToneGrid({ children }: { children: ReactNode }) {
  return <View style={styles.toneGrid}>{children}</View>;
}

/** Rəngli sətir — ResultSection içində istifadə üçün. */
export function ToneRow({
  label,
  value,
  tone,
  bold,
  shaded,
}: {
  label: string;
  value: string;
  tone?: Tone;
  bold?: boolean;
  /** Sətir fonunu ton rəngi ilə boya */
  shaded?: boolean;
}) {
  const { colors } = useTheme();
  const toneColor = useToneColor()(tone);
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: colors.n240 },
        shaded && toneColor ? { backgroundColor: toneColor + "1a" } : null,
      ]}
    >
      <Text
        style={[
          styles.rowLabel,
          { color: shaded && toneColor ? toneColor : colors.n580 },
          bold && { fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: toneColor ?? colors.n840 }, bold && { fontWeight: "700" }]}>
        {value}
      </Text>
    </View>
  );
}

/** Kiçik sürətli seçim düymələri (məs. "6 ay", "12 ay", "10k"). */
export function QuickChips({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected?: string;
  onSelect: (v: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.quickRow}>
      {options.map((o) => {
        const active = selected === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            style={[
              styles.quick,
              {
                backgroundColor: active ? colors.accent + "1f" : colors.n240,
                borderColor: active ? colors.accent : colors.n280,
              },
            ]}
          >
            <Text style={[styles.quickText, { color: active ? colors.accent : colors.n760 }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** "Bütün N ayı göstər" / "Yığ" düyməsi. */
export function ShowMoreButton({
  expanded,
  onPress,
  moreLabel,
  lessLabel = "Yığ",
}: {
  expanded: boolean;
  onPress: () => void;
  moreLabel: string;
  lessLabel?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.more} hitSlop={6}>
      <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={20} color={colors.accent} />
      <Text style={[styles.moreText, { color: colors.accent }]}>{expanded ? lessLabel : moreLabel}</Text>
    </Pressable>
  );
}

/** Üfüqi yığılmış zolaq (saytdakı progress bar). */
export function StackedBar({
  segments,
  height = 14,
  background,
}: {
  segments: { value: number; color: string; label?: string }[];
  height?: number;
  background?: string;
}) {
  const { colors } = useTheme();
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  return (
    <View style={[styles.bar, { height, borderRadius: height / 2, backgroundColor: background ?? colors.n240 }]}>
      {segments.map((s, i) => (
        <View
          key={i}
          style={{
            width: `${(Math.max(0, s.value) / total) * 100}%`,
            backgroundColor: s.color,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {s.label ? (
            <Text style={styles.barLabel} numberOfLines={1}>
              {s.label}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Rəngli nöqtə + mətn (qrafik legendası). */
export function Legend({ items }: { items: { color: string; text: string }[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.legend}>
      {items.map((it, i) => (
        <View key={i} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: it.color }]} />
          <Text style={[styles.legendText, { color: colors.n760 }]}>{it.text}</Text>
        </View>
      ))}
    </View>
  );
}

/** Rəngli çərçivəli blok (saytdakı bg-green-50 border-green-200 kartları). */
export function TonePanel({
  tone,
  title,
  children,
}: {
  tone: Tone;
  title?: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  const toneColor = useToneColor()(tone) ?? colors.n580;
  return (
    <View style={[styles.panel, { backgroundColor: toneColor + "14", borderColor: toneColor + "55" }]}>
      {title ? <Text style={[styles.panelTitle, { color: toneColor }]}>{title}</Text> : null}
      {children}
    </View>
  );
}

/** Kiçik mətn (izah, qeyd). */
export function SmallText({ children, italic, color }: { children: ReactNode; italic?: boolean; color?: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.small, { color: color ?? colors.n580 }, italic && { fontStyle: "italic" }]}>{children}</Text>
  );
}

/** Nəticə olmadıqda göstərilən boş vəziyyət. */
export function EmptyState({ icon, text }: { icon?: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
      <Text style={[styles.emptyText, { color: colors.n580 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 8 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { flexGrow: 1, borderRadius: 12, padding: 12 },
  bigIcon: { fontSize: 24, marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  cardDesc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  toneGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  toneCard: { flexGrow: 1, flexBasis: "45%", borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  toneLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  toneValue: { fontSize: 18, fontWeight: "800", marginTop: 4, textAlign: "center" },
  toneSub: { fontSize: 11, marginTop: 3, textAlign: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  rowLabel: { fontSize: 14, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: "600", textAlign: "right", flexShrink: 1 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: -8, marginBottom: 16 },
  quick: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  quickText: { fontSize: 12, fontWeight: "600" },
  more: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 10 },
  moreText: { fontSize: 14, fontWeight: "600" },
  bar: { flexDirection: "row", overflow: "hidden", width: "100%" },
  barLabel: { fontSize: 11, fontWeight: "700", color: "#ffffff", paddingHorizontal: 4 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
  panel: { borderRadius: 12, borderWidth: 1, padding: 14, marginVertical: 8 },
  panelTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  small: { fontSize: 12, lineHeight: 17, marginTop: 4 },
});
