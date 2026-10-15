import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";

/** Semantik rənglər (saytdakı green/blue/yellow/orange/red tonları). */
export const TONE = {
  green: "#16a34a",
  blue: "#2563eb",
  cyan: "#0891b2",
  yellow: "#ca8a04",
  orange: "#ea580c",
  red: "#dc2626",
  purple: "#9333ea",
  gray: "#64748b",
} as const;
export type Tone = keyof typeof TONE;

/** Boş vəziyyət: emoji + mətn. */
export function EmptyState({ icon = "📝", text }: { icon?: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyText, { color: colors.n580 }]}>{text}</Text>
    </View>
  );
}

/** Proqres zolağı (0..1). */
export function Bar({ ratio, color, height = 8 }: { ratio: number; color?: string; height?: number }) {
  const { colors } = useTheme();
  const r = Math.max(0, Math.min(1, isFinite(ratio) ? ratio : 0));
  return (
    <View style={[styles.barTrack, { backgroundColor: colors.n240, height, borderRadius: height / 2 }]}>
      <View
        style={{ width: `${r * 100}%`, height, borderRadius: height / 2, backgroundColor: color ?? colors.accent }}
      />
    </View>
  );
}

/** Etiket — dəyər cərgəsi (sağda qalın dəyər). */
export function KVRow({
  label,
  value,
  color,
  bold,
}: {
  label: ReactNode;
  value: ReactNode;
  color?: string;
  bold?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.kv}>
      <Text style={[styles.kvLabel, { color: colors.n760 }, bold && { fontWeight: "700" }]}>{label}</Text>
      <Text style={[styles.kvValue, { color: color ?? colors.n940 }]}>{value}</Text>
    </View>
  );
}

/** Səviyyə cədvəli — aktiv sətir vurğulanır və "Siz" nişanı göstərilir. */
export function LevelScale({
  title,
  rows,
  activeIndex,
  youLabel = "Siz",
}: {
  title: string;
  rows: { label: string; range: string; tone: Tone }[];
  activeIndex: number;
  youLabel?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.scale, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
      <View style={[styles.scaleHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
        <Text style={[styles.scaleTitle, { color: colors.n940 }]}>📊 {title}</Text>
      </View>
      {rows.map((row, i) => {
        const active = i === activeIndex;
        const c = TONE[row.tone];
        return (
          <View
            key={row.label + row.range}
            style={[
              styles.scaleRow,
              { borderBottomColor: colors.n240 },
              i === rows.length - 1 && { borderBottomWidth: 0 },
              active && { backgroundColor: c + "1f" },
            ]}
          >
            <Text style={[styles.scaleLabel, { color: c }, active && { fontWeight: "700" }]}>{row.label}</Text>
            <View style={styles.scaleRight}>
              <Text style={[styles.scaleRange, { color: colors.n580 }]}>{row.range}</Text>
              {active && (
                <View style={[styles.youBadge, { backgroundColor: colors.n940 }]}>
                  <Text style={[styles.youText, { color: colors.n145 }]}>{youLabel}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Rəngli çərçivəli blok (səviyyə nəticəsi və s.). */
export function ToneBox({ tone, title, children }: { tone: Tone; title?: string; children?: ReactNode }) {
  const { colors } = useTheme();
  const c = TONE[tone];
  return (
    <View style={[styles.toneBox, { borderColor: c + "66", backgroundColor: c + "1a" }]}>
      {title ? <Text style={[styles.toneTitle, { color: c }]}>{title}</Text> : null}
      {typeof children === "string" ? (
        <Text style={[styles.toneText, { color: colors.n760 }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  barTrack: { width: "100%", overflow: "hidden" },
  kv: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, paddingVertical: 3 },
  kvLabel: { fontSize: 13, flex: 1, lineHeight: 18 },
  kvValue: { fontSize: 13, fontWeight: "700", textAlign: "right", flexShrink: 0, maxWidth: "55%" },
  scale: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  scaleHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  scaleTitle: { fontSize: 14, fontWeight: "700" },
  scaleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  scaleLabel: { fontSize: 13, flex: 1 },
  scaleRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  scaleRange: { fontSize: 13 },
  youBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  youText: { fontSize: 11, fontWeight: "700" },
  toneBox: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 4 },
  toneTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  toneText: { fontSize: 13, lineHeight: 19 },
});
