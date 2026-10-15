import type { ReactNode } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";

/** Saytdakı böyük seçim düymələri (başlıq + izah) — məzuniyyət/müavinət hesablayıcıları üçün. */
export function OptionCards<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
  columns = 1,
}: {
  label?: string;
  options: { value: T; label: string; desc?: string; icon?: string }[];
  selected: T;
  onSelect: (v: T) => void;
  columns?: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={s.container}>
      {label && <Text style={[s.label, { color: colors.n700 }]}>{label}</Text>}
      <View style={s.grid}>
        {options.map((o) => {
          const active = o.value === selected;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onSelect(o.value)}
              style={[
                s.card,
                { flexBasis: (columns > 1 ? `${Math.floor(100 / columns) - 3}%` : "100%") as `${number}%` },
                {
                  backgroundColor: active ? colors.accent + "1f" : colors.n200,
                  borderColor: active ? colors.accent : colors.n280,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              {o.icon ? <Text style={s.icon}>{o.icon}</Text> : null}
              <Text style={[s.title, { color: active ? colors.accent : colors.n940 }]}>{o.label}</Text>
              {o.desc ? <Text style={[s.desc, { color: colors.n580 }]}>{o.desc}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const TONES = {
  neutral: "",
  amber: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6",
  red: "#ef4444",
  purple: "#a855f7",
} as const;

/** Rəngli məbləğ kartı (saytdakı bg-amber-50 / bg-green-50 və s. nəticə kartları). */
export function AmountCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof TONES;
}) {
  const { colors } = useTheme();
  const c = TONES[tone];
  return (
    <View
      style={[
        s.amount,
        c
          ? { backgroundColor: c + "1a", borderColor: c + "66" }
          : { backgroundColor: colors.n200, borderColor: colors.n280 },
      ]}
    >
      <Text style={[s.amountLabel, { color: c || colors.n580 }]}>{label}</Text>
      <Text style={[s.amountValue, { color: c || colors.n940 }]}>{value}</Text>
      {sub ? <Text style={[s.amountSub, { color: c || colors.n580 }]}>{sub}</Text> : null}
    </View>
  );
}

/** Kartlar şəbəkəsi. */
export function CardRow({ children }: { children: ReactNode }) {
  return <View style={s.row}>{children}</View>;
}

/** Sadə mətn (kiçik, solğun). */
export function Muted({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[s.muted, { color: colors.n580 }]}>{children}</Text>;
}

/** Qalın + adi mətn birləşməsi: "Qeyd: ..." */
export function LabeledText({ label, children }: { label: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={[s.infoText, { color: colors.n760 }]}>
      <Text style={{ fontWeight: "700", color: colors.n940 }}>{label} </Text>
      {children}
    </Text>
  );
}

/** Üfüqi zolaq (saytdakı progress bar / qrafik əvəzi). */
export function BarRow({
  label,
  value,
  ratio,
  color,
}: {
  label: string;
  value: string;
  ratio: number;
  color?: string;
}) {
  const { colors } = useTheme();
  const r = Math.max(0, Math.min(1, isFinite(ratio) ? ratio : 0));
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 13, color: colors.n760, flex: 1 }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.n940 }}>{value}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.n240, overflow: "hidden" }}>
        <View style={{ width: `${r * 100}%`, height: 8, borderRadius: 4, backgroundColor: color ?? colors.accent }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { flexGrow: 1, borderRadius: 12, padding: 12 },
  icon: { fontSize: 20, marginBottom: 4 },
  title: { fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  amount: { flexGrow: 1, flexBasis: "45%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center" },
  amountLabel: { fontSize: 12, textAlign: "center", marginBottom: 4 },
  amountValue: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  amountSub: { fontSize: 11, marginTop: 3, textAlign: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  muted: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 19 },
  step: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  stepHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  stepTitle: { fontSize: 13, fontWeight: "600", flex: 1 },
  stepBody: { borderRadius: 8, padding: 10, marginLeft: 30, marginTop: 8 },
  miniRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2, gap: 8 },
  table: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  tr: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, gap: 8 },
  thCell: { fontSize: 12, fontWeight: "600" },
  cell: { fontSize: 13 },
  cellInput: { flex: 1.4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, fontSize: 14, textAlign: "right" },
  tint: { borderRadius: 12, borderWidth: 1, padding: 12, marginVertical: 8 },
  tintTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
});

/** Addım-addım hesablama bloku (nömrəli dairə + başlıq + boz qutu). */
export function Step({
  n,
  title,
  children,
  tone = "accent",
  emphasized,
}: {
  n: number | string;
  title: string;
  children?: ReactNode;
  tone?: "accent" | "amber" | "green";
  emphasized?: boolean;
}) {
  const { colors } = useTheme();
  const c = tone === "amber" ? "#f59e0b" : tone === "green" ? "#22c55e" : colors.accent;
  return (
    <View style={[s.step, { borderBottomColor: colors.n240 }, emphasized && { backgroundColor: c + "14" }]}>
      <View style={s.stepHead}>
        <View style={[s.badge, { backgroundColor: c }]}>
          <Text style={s.badgeText}>{n}</Text>
        </View>
        <Text style={[s.stepTitle, { color: emphasized ? c : colors.n940 }]}>{title}</Text>
      </View>
      {children ? <View style={[s.stepBody, { backgroundColor: colors.n240 }]}>{children}</View> : null}
    </View>
  );
}

/** "a ÷ b = " + qalın nəticə. */
export function Calc({
  children,
  strong,
  danger,
  color,
}: {
  children?: ReactNode;
  strong: string;
  danger?: boolean;
  color?: string;
}) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: 13, color: colors.n840 }}>
      {children}
      <Text style={{ fontWeight: "700", color: danger ? "#ef4444" : color ?? colors.accent }}>{strong}</Text>
    </Text>
  );
}

/** Kiçik "etiket: dəyər" sətri (boz qutuların içində). */
export function MiniRow({ label, value, dim, bold }: { label: string; value: string; dim?: boolean; bold?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={s.miniRow}>
      <Text style={{ fontSize: 12, color: bold ? colors.n940 : colors.n580, flex: 1, fontWeight: bold ? "700" : "400" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 12, fontWeight: bold ? "700" : "600", color: dim ? colors.n580 : bold ? colors.accent : colors.n940 }}>
        {value}
      </Text>
    </View>
  );
}

/** 12 aylıq məbləğ daxiletmə cədvəli (İl | Ay | Məbləğ). */
export function MonthAmountsTable({
  months,
  monthNames,
  values,
  onChange,
  amountHeader,
  totalLabel,
  totalValue,
}: {
  months: { year: number; month: number }[];
  monthNames: string[];
  values: Record<string, string>;
  onChange: (key: string, v: string) => void;
  amountHeader: string;
  totalLabel: string;
  totalValue: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[s.table, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
      <View style={[s.tr, { borderBottomColor: colors.n280, backgroundColor: colors.n240 }]}>
        <Text style={[s.thCell, { color: colors.n580, flex: 0.8 }]}>İl</Text>
        <Text style={[s.thCell, { color: colors.n580, flex: 1.2 }]}>Ay</Text>
        <Text style={[s.thCell, { color: colors.n580, flex: 1.4, textAlign: "right" }]}>{amountHeader}</Text>
      </View>
      {months.map((m) => {
        const key = `${m.year}-${m.month}`;
        return (
          <View key={key} style={[s.tr, { borderBottomColor: colors.n240 }]}>
            <Text style={[s.cell, { color: colors.n580, flex: 0.8 }]}>{m.year}</Text>
            <Text style={[s.cell, { color: colors.n940, flex: 1.2, fontWeight: "600" }]}>{monthNames[m.month]}</Text>
            <TextInput
              value={values[key] || ""}
              onChangeText={(v) => onChange(key, v)}
              placeholder="0"
              placeholderTextColor={colors.n580}
              keyboardType="decimal-pad"
              style={[s.cellInput, { color: colors.n940, borderColor: colors.n280, backgroundColor: colors.n145 }]}
            />
          </View>
        );
      })}
      <View style={[s.tr, { backgroundColor: colors.n240, borderBottomWidth: 0 }]}>
        <Text style={[s.cell, { color: colors.n940, flex: 2, fontWeight: "700" }]}>{totalLabel}</Text>
        <Text style={[s.cell, { color: colors.accent, flex: 1.4, fontWeight: "700", textAlign: "right" }]}>
          {totalValue}
        </Text>
      </View>
    </View>
  );
}

/** Rəngli çərçivəli qutu (bg-amber-50/40 border-amber-200 və s.). */
export function TintBox({
  tone = "amber",
  title,
  children,
}: {
  tone?: "amber" | "blue" | "green" | "red" | "purple";
  title?: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const c = TONES[tone];
  return (
    <View style={[s.tint, { borderColor: c + "66", backgroundColor: c + "12" }]}>
      {title ? <Text style={[s.tintTitle, { color: colors.n940 }]}>{title}</Text> : null}
      {children}
    </View>
  );
}
