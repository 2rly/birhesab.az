import { useState, type ReactNode } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/constants/theme";
import { calculators } from "@/data/calculators";

/** Bölmə başlığı (saytdakı h2/h3 bölmələri üçün). */
export function SectionHeading({ children, icon }: { children: ReactNode; icon?: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.heading, { color: colors.n960 }]}>
      {icon ? `${icon} ` : ""}
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.paragraph, { color: colors.n760 }]}>{children}</Text>;
}

export function BulletList({ items, ordered }: { items: ReactNode[]; ordered?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.list}>
      {items.map((it, i) => (
        <View key={i} style={styles.listItem}>
          <Text style={[styles.bullet, { color: colors.accent }]}>{ordered ? `${i + 1}.` : "•"}</Text>
          <Text style={[styles.listText, { color: colors.n760 }]}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

/** Çərçivəli kart — nəticə və ya məlumat qrupları üçün. */
export function Card({ children, title }: { children: ReactNode; title?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
      {title && <Text style={[styles.cardTitle, { color: colors.n940 }]}>{title}</Text>}
      {children}
    </View>
  );
}

const INFO_VARIANTS = {
  info: { icon: "info-outline", color: "#3b82f6" },
  warning: { icon: "warning-amber", color: "#f59e0b" },
  success: { icon: "check-circle-outline", color: "#22c55e" },
  danger: { icon: "error-outline", color: "#ef4444" },
} as const;

/** Rəngli xəbərdarlıq/məlumat qutusu (saytdakı bg-blue-50, bg-amber-50 və s. bloklar). */
export function InfoBox({
  variant = "info",
  title,
  children,
}: {
  variant?: keyof typeof INFO_VARIANTS;
  title?: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  const v = INFO_VARIANTS[variant];
  return (
    <View style={[styles.info, { borderColor: v.color + "66", backgroundColor: v.color + "1a" }]}>
      <MaterialIcons name={v.icon} size={20} color={v.color} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        {title && <Text style={[styles.infoTitle, { color: colors.n940 }]}>{title}</Text>}
        {typeof children === "string" ? (
          <Text style={[styles.infoText, { color: colors.n760 }]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

/** Böyük nəticə kartı — əsas göstərici. */
export function ResultHero({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.hero, { backgroundColor: colors.accent }]}>
      <Text style={[styles.heroLabel, { color: colors.onAccent }]}>{label}</Text>
      <Text style={[styles.heroValue, { color: colors.onAccent }]}>{value}</Text>
      {sub && <Text style={[styles.heroSub, { color: colors.onAccent }]}>{sub}</Text>}
    </View>
  );
}

/** Kiçik statistik kartlar sırası. */
export function StatGrid({ items }: { items: { label: string; value: string; accent?: boolean }[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.statGrid}>
      {items.map((it, i) => (
        <View
          key={i}
          style={[styles.stat, { backgroundColor: colors.n200, borderColor: it.accent ? colors.accent : colors.n280 }]}
        >
          <Text style={[styles.statLabel, { color: colors.n580 }]}>{it.label}</Text>
          <Text style={[styles.statValue, { color: it.accent ? colors.accent : colors.n940 }]}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Cədvəl — üfüqi sürüşdürülə bilər. rows hüceyrələri sətir və ya rəqəmdir.
 * highlightRows: vurğulanacaq sətir indeksləri.
 */
export function DataTable({
  title,
  headers,
  rows,
  highlightRows = [],
  columnWidths,
  footer,
}: {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
  highlightRows?: number[];
  columnWidths?: number[];
  footer?: (string | number)[];
}) {
  const { colors } = useTheme();
  const width = (i: number) => columnWidths?.[i] ?? (i === 0 ? 140 : 110);
  const renderRow = (cells: (string | number)[], key: string, opts: { header?: boolean; hl?: boolean; foot?: boolean }) => (
    <View
      key={key}
      style={[
        styles.tr,
        { borderBottomColor: colors.n240 },
        opts.header && { backgroundColor: colors.n240 },
        opts.hl && { backgroundColor: colors.accent + "22" },
        opts.foot && { backgroundColor: colors.n240 },
      ]}
    >
      {cells.map((c, i) => (
        <Text
          key={i}
          style={[
            styles.td,
            { width: width(i), color: opts.header ? colors.n840 : colors.n760 },
            (opts.header || opts.foot) && styles.th,
            opts.hl && { color: colors.accent, fontWeight: "700" },
            i > 0 && { textAlign: "right" },
          ]}
        >
          {c}
        </Text>
      ))}
    </View>
  );
  return (
    <View style={styles.tableWrap}>
      {title && <Text style={[styles.tableTitle, { color: colors.n760 }]}>{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
          {renderRow(headers, "h", { header: true })}
          {rows.map((r, i) => renderRow(r, String(i), { hl: highlightRows.includes(i) }))}
          {footer && renderRow(footer, "f", { foot: true })}
        </View>
      </ScrollView>
    </View>
  );
}

/** Saytdakı "📐 Düstur" bölməsi — formulaTitle + formulaContent (whitespace-pre-line). */
export function FormulaSection({ title, content }: { title: string; content: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.formula, { borderColor: "#3b82f666", backgroundColor: "#3b82f614" }]}>
      <Text style={[styles.formulaTitle, { color: colors.n960 }]}>📐 {title}</Text>
      <Text style={[styles.formulaText, { color: colors.n760 }]}>{content}</Text>
    </View>
  );
}

/** Tez-tez verilən suallar — açılan siyahı. */
export function FaqSection({
  title = "Tez-tez verilən suallar",
  items,
}: {
  title?: string;
  items: { q: string; a: string }[];
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View style={styles.section}>
      <SectionHeading icon="❓">{title}</SectionHeading>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <View key={i} style={[styles.faq, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
            <Pressable onPress={() => setOpen(isOpen ? null : i)} style={styles.faqQ}>
              <Text style={[styles.faqQText, { color: colors.n940 }]}>{it.q}</Text>
              <MaterialIcons name={isOpen ? "expand-less" : "expand-more"} size={22} color={colors.n580} />
            </Pressable>
            {isOpen && <Text style={[styles.faqA, { color: colors.n760 }]}>{it.a}</Text>}
          </View>
        );
      })}
    </View>
  );
}

/** Açılıb-bağlanan bölmə (saytdakı <details> və ya "ətraflı" blokları). */
export function Collapsible({
  title,
  children,
  initiallyOpen = false,
}: {
  title: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={[styles.faq, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
      <Pressable onPress={() => setOpen(!open)} style={styles.faqQ}>
        <Text style={[styles.faqQText, { color: colors.n940 }]}>{title}</Text>
        <MaterialIcons name={open ? "expand-less" : "expand-more"} size={22} color={colors.n580} />
      </Pressable>
      {open && <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>{children}</View>}
    </View>
  );
}

/** Saytdakı "🔗 Əlaqəli hesablayıcılar" — registry id-lərinə görə. */
export function RelatedCalculators({ ids }: { ids: string[] }) {
  const { colors } = useTheme();
  const items = ids
    .map((id) => calculators.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <SectionHeading icon="🔗">Əlaqəli hesablayıcılar</SectionHeading>
      {items.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => router.push({ pathname: "/calculator/[slug]", params: { slug: c.slug } })}
          style={[styles.related, { backgroundColor: colors.n200, borderColor: colors.n280 }]}
        >
          <MaterialIcons
            name={c.icon as keyof typeof MaterialIcons.glyphMap}
            size={20}
            color={colors.accent}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.relatedName, { color: colors.n940 }]} numberOfLines={1}>{c.name}</Text>
            <Text style={[styles.relatedDesc, { color: colors.n580 }]} numberOfLines={1}>{c.description}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.n400} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  heading: { fontSize: 17, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  paragraph: { fontSize: 14, lineHeight: 21, marginBottom: 10 },
  list: { marginBottom: 10, gap: 6 },
  listItem: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 14, lineHeight: 21, fontWeight: "700", minWidth: 14 },
  listText: { flex: 1, fontSize: 14, lineHeight: 21 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  info: { flexDirection: "row", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginVertical: 8 },
  infoTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  infoText: { fontSize: 13, lineHeight: 19 },
  hero: { borderRadius: 16, padding: 18, marginTop: 16, marginBottom: 4, alignItems: "center" },
  heroLabel: { fontSize: 13, fontWeight: "600", opacity: 0.85 },
  heroValue: { fontSize: 30, fontWeight: "800", marginTop: 4 },
  heroSub: { fontSize: 13, marginTop: 4, opacity: 0.85, textAlign: "center" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  stat: { flexGrow: 1, flexBasis: "45%", borderRadius: 12, borderWidth: 1, padding: 12 },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 17, fontWeight: "700", marginTop: 4 },
  tableWrap: { marginTop: 16 },
  tableTitle: { fontSize: 13, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  table: { borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  tr: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  td: { fontSize: 13, paddingVertical: 9, paddingHorizontal: 10 },
  th: { fontWeight: "700" },
  formula: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 24 },
  formulaTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  formulaText: { fontSize: 13, lineHeight: 20 },
  faq: { borderRadius: 12, borderWidth: 1, marginBottom: 8, overflow: "hidden" },
  faqQ: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  faqQText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  faqA: { fontSize: 13, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14 },
  related: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  relatedName: { fontSize: 14, fontWeight: "600" },
  relatedDesc: { fontSize: 12, marginTop: 2 },
});
