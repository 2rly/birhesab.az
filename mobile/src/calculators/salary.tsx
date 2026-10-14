import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { useTheme } from "@/constants/theme";
import { SegmentControl } from "@/components/SegmentControl";
import type { ThemeColors } from "@/constants/colors";

type Sector = "private" | "public";
type Direction = "gross-to-net" | "net-to-gross";

interface SalaryResult {
  gross: number;
  net: number;
  incomeTax: number;
  dsmf: number;
  medical: number;
  unemployment: number;
  employerDsmf: number;
  employerMedical: number;
}

function calcPrivate(g: number): SalaryResult {
  const it = g <= 2500 ? Math.max(0, g - 200) * 0.03 : g <= 8000 ? 75 + (g - 2500) * 0.10 : 625 + (g - 8000) * 0.14;
  const dsmf = g <= 200 ? g * 0.03 : 6 + (g - 200) * 0.10;
  const its = Math.min(g, 2500) * 0.02 + Math.max(0, g - 2500) * 0.005;
  const un = g * 0.005;
  const net = g - it - dsmf - its - un;
  const eDsmf = g <= 200 ? g * 0.22 : g <= 8000 ? 44 + (g - 200) * 0.15 : 1214 + (g - 8000) * 0.11;
  const eIts = its;
  return { gross: g, net, incomeTax: it, dsmf, medical: its, unemployment: un, employerDsmf: eDsmf, employerMedical: eIts };
}

function calcPublic(g: number): SalaryResult {
  const it = g <= 2500 ? Math.max(0, g - 200) * 0.14 : 350 + (g - 2500) * 0.25;
  const dsmf = g * 0.03;
  const its = g <= 8000 ? g * 0.02 : 160 + (g - 8000) * 0.005;
  const un = g * 0.005;
  const net = g - it - dsmf - its - un;
  const eDsmf = g * 0.22;
  const eIts = its;
  return { gross: g, net, incomeTax: it, dsmf, medical: its, unemployment: un, employerDsmf: eDsmf, employerMedical: eIts };
}

function findGross(targetNet: number, calcFn: (g: number) => SalaryResult): number {
  let lo = targetNet;
  let hi = targetNet * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const r = calcFn(mid);
    if (Math.abs(r.net - targetNet) < 0.01) return mid;
    if (r.net < targetNet) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function fmt(n: number): string {
  const fixed = Math.abs(n).toFixed(2);
  const [whole, dec] = fixed.split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return spaced + "," + dec;
}

const PRESETS = [500, 1000, 1500, 2500, 5000];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"];

export function SalaryCalculator() {
  const { colors } = useTheme();
  const [sector, setSector] = useState<Sector>("private");
  const [direction, setDirection] = useState<Direction>("gross-to-net");
  const [amount, setAmount] = useState("1000");
  const [keypadOpen, setKeypadOpen] = useState(false);
  const s = makeStyles(colors);

  const result = useMemo(() => {
    const val = parseFloat(amount.replace(",", ".")) || 0;
    if (val <= 0) return null;
    const calcFn = sector === "private" ? calcPrivate : calcPublic;
    if (direction === "gross-to-net") return calcFn(val);
    const gross = findGross(val, calcFn);
    return calcFn(gross);
  }, [sector, direction, amount]);

  const totalDeduction = result ? result.incomeTax + result.dsmf + result.medical + result.unemployment : 0;
  const employerTotal = result ? result.gross + result.employerDsmf + result.employerMedical + result.unemployment : 0;

  function onKey(k: string) {
    if (k === "⌫") {
      setAmount((v) => (v.length <= 1 ? "0" : v.slice(0, -1)));
    } else if (k === ",") {
      setAmount((v) => (v.includes(",") ? v : v + ","));
    } else {
      setAmount((v) => (v === "0" ? k : v + k));
    }
  }

  const barSegments = result
    ? [
        { key: "net", pct: (result.net / result.gross) * 100, color: colors.accent },
        { key: "it", pct: (result.incomeTax / result.gross) * 100, color: colors.amber },
        { key: "dsmf", pct: (result.dsmf / result.gross) * 100, color: colors.n620c },
        { key: "its", pct: (result.medical / result.gross) * 100, color: colors.n500c },
        { key: "un", pct: (result.unemployment / result.gross) * 100, color: colors.n400c },
      ]
    : [];

  return (
    <View>
      <SegmentControl
        options={[
          { value: "private", label: "Özəl / qeyri-neft" },
          { value: "public", label: "Dövlət / neft-qaz" },
        ]}
        selected={sector}
        onSelect={setSector}
      />

      <View style={{ height: 8 }} />

      <SegmentControl
        options={[
          { value: "gross-to-net", label: "Gross → Net" },
          { value: "net-to-gross", label: "Net → Gross" },
        ]}
        selected={direction}
        onSelect={setDirection}
      />

      {/* Amount Input */}
      <Pressable
        onPress={() => setKeypadOpen(true)}
        style={[
          s.amountCard,
          keypadOpen && { borderColor: colors.accent },
        ]}
      >
        <Text style={s.amountLabel}>
          {direction === "gross-to-net" ? "GROSS MAAŞ" : "NET MAAŞ"}
        </Text>
        <View style={s.amountRow}>
          <Text style={s.amountValue}>{amount || "0"}</Text>
          <Text style={s.amountCurrency}>₼</Text>
        </View>
      </Pressable>

      {/* Numpad Modal */}
      <Modal visible={keypadOpen} transparent animationType="slide">
        <Pressable style={s.modalOverlay} onPress={() => setKeypadOpen(false)} />
        <View style={[s.keypadSheet, { backgroundColor: colors.n185 }]}>
          <View style={s.keypadHeader}>
            <View style={s.presetRow}>
              {PRESETS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setAmount(String(p))}
                  style={[s.presetBtn, { backgroundColor: colors.n250 }]}
                >
                  <Text style={[s.presetText, { color: colors.n860 }]}>{p}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => setKeypadOpen(false)}
              style={[s.doneBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={[s.doneText, { color: colors.onAccent }]}>Hazır</Text>
            </Pressable>
          </View>
          <View style={s.keyGrid}>
            {KEYS.map((k) => (
              <Pressable
                key={k}
                onPress={() => onKey(k)}
                style={[s.key, { backgroundColor: colors.n250 }]}
              >
                <Text style={[s.keyText, { color: colors.n940 }]}>{k}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Result */}
      {result && (
        <>
          <View style={s.resultCard}>
            <Text style={s.resultLabel}>
              {direction === "gross-to-net" ? "ƏLİNİZƏ ÇATAN" : "HESABLANMALI OLAN (GROSS)"}
            </Text>
            <Text style={s.resultAmount}>
              {fmt(direction === "gross-to-net" ? result.net : result.gross)} ₼
            </Text>
            <Text style={s.resultSub}>
              Tutulma {fmt(totalDeduction)} ₼ · {((totalDeduction / result.gross) * 100).toFixed(1)}%
            </Text>

            {/* Color Bar */}
            <View style={s.barTrack}>
              {barSegments.map((seg) => (
                <View
                  key={seg.key}
                  style={{ width: `${seg.pct}%` as any, height: 8, backgroundColor: seg.color }}
                />
              ))}
            </View>

            {/* Breakdown */}
            <View style={s.breakdown}>
              <BreakdownRow dot={colors.accent} label="Əlinizə çatan (net)" value={`${fmt(result.net)} ₼`} colors={colors} />
              <BreakdownRow dot={colors.amber} label="Gəlir vergisi" value={`${fmt(result.incomeTax)} ₼`} colors={colors} />
              <BreakdownRow dot={colors.n620c} label="DSMF" value={`${fmt(result.dsmf)} ₼`} colors={colors} />
              <BreakdownRow dot={colors.n500c} label="İcbari tibbi sığorta" value={`${fmt(result.medical)} ₼`} colors={colors} />
              <BreakdownRow dot={colors.n400c} label="İşsizlikdən sığorta" value={`${fmt(result.unemployment)} ₼`} colors={colors} />
            </View>

            <View style={[s.divider, { backgroundColor: colors.n280 }]} />

            <View style={s.totalRow}>
              <Text style={[s.totalLabel, { color: colors.n700 }]}>İşəgötürənin ümumi xərci</Text>
              <Text style={[s.totalValue, { color: colors.n860 }]}>{fmt(employerTotal)} ₼</Text>
            </View>
          </View>

          {/* Rules */}
          <View style={s.rulesCard}>
            <Text style={s.rulesTitle}>Necə hesablanır · 2026</Text>
            <RuleRow label="Gəlir vergisi" value={sector === "private" ? "0-2500: 3%, 2500-8000: 10%, 8000+: 14%" : "0-2500: 14%, 2500+: 25%"} colors={colors} />
            <RuleRow label="DSMF (işçi)" value={sector === "private" ? "0-200: 3%, 200+: 10%" : "3%"} colors={colors} />
            <RuleRow label="Tibbi sığorta" value={sector === "private" ? "0-2500: 2%, 2500+: 0.5%" : "0-8000: 2%, 8000+: 0.5%"} colors={colors} />
            <RuleRow label="İşsizlik" value="0.5%" colors={colors} />
            <RuleRow label="DSMF (işəgötürən)" value={sector === "private" ? "0-200: 22%, 200-8000: 15%, 8000+: 11%" : "22%"} colors={colors} last />
          </View>
        </>
      )}
    </View>
  );
}

function BreakdownRow({ dot, label, value, colors }: { dot: string; label: string; value: string; colors: ThemeColors }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: dot, marginRight: 10 }} />
      <Text style={{ flex: 1, fontSize: 13, color: colors.n760 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: colors.n860, fontVariant: ["tabular-nums"] }}>{value}</Text>
    </View>
  );
}

function RuleRow({ label, value, colors, last }: { label: string; value: string; colors: ThemeColors; last?: boolean }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.n260 }}>
      <Text style={{ flex: 1, fontSize: 13, color: colors.n660 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: colors.n840, fontVariant: ["tabular-nums"] }}>{value}</Text>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    amountCard: {
      marginTop: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.n300,
      backgroundColor: c.n195,
      padding: 16,
    },
    amountLabel: {
      fontSize: 11,
      fontVariant: ["tabular-nums"],
      letterSpacing: 1,
      color: c.n660,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    amountRow: { flexDirection: "row", alignItems: "baseline" },
    amountValue: { fontSize: 36, fontWeight: "700", color: c.n960, fontVariant: ["tabular-nums"] },
    amountCurrency: { fontSize: 20, color: c.n580, marginLeft: 6 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    keypadSheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      paddingBottom: 32,
    },
    keypadHeader: { flexDirection: "row", gap: 8, marginBottom: 12, alignItems: "center" },
    presetRow: { flex: 1, flexDirection: "row", gap: 6 },
    presetBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    presetText: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
    doneBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    doneText: { fontSize: 14, fontWeight: "700" },
    keyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    key: {
      width: "31.5%" as any,
      height: 52,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    keyText: { fontSize: 22, fontWeight: "500" },
    resultCard: {
      marginTop: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.n300,
      backgroundColor: c.n195,
      padding: 20,
    },
    resultLabel: {
      fontSize: 11,
      letterSpacing: 1,
      color: c.n660,
      textTransform: "uppercase",
      fontVariant: ["tabular-nums"],
    },
    resultAmount: {
      fontSize: 44,
      fontWeight: "700",
      color: c.accent,
      fontVariant: ["tabular-nums"],
      marginVertical: 4,
    },
    resultSub: { fontSize: 13, color: c.n580, marginBottom: 16, fontVariant: ["tabular-nums"] },
    barTrack: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      flexDirection: "row",
      marginBottom: 16,
    },
    breakdown: { marginTop: 4 },
    divider: { height: 1, marginVertical: 12 },
    totalRow: { flexDirection: "row", alignItems: "center" },
    totalLabel: { flex: 1, fontSize: 13 },
    totalValue: { fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
    rulesCard: {
      marginTop: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.n280,
      backgroundColor: c.n185,
      padding: 16,
    },
    rulesTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: c.n760,
      marginBottom: 8,
    },
  });
}
