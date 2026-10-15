import { useState, useMemo, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";
import { Select } from "@/components/Select";
import { ChipGroup, Button } from "@/components/Controls";
import { Paragraph, Card, InfoBox, ResultHero, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { OptionCards, AmountCard, CardRow } from "./_leave-parts";

// Ərazilər üzrə gündəlik normalar (AZN)
const REGIONS: { label: string; norm: number }[] = [
  { label: "Bakı şəhəri", norm: 125 },
  { label: "Naxçıvan şəhərləri", norm: 100 },
  { label: "Gəncə və Sumqayıt şəhərləri", norm: 95 },
  { label: "Digər şəhər, rayon mərkəzləri, qəsəbə və kəndlər", norm: 90 },
];

type Mode = "single" | "multicity";

interface Leg {
  id: number;
  regionIndex: number;
  days: string;
}

const formatMoney = (n: number) => fmtNum(n, 2);

function calcLeg(norm: number, numDays: number) {
  const dailyExpense = norm * 0.3 * numDays;
  const hotelExpense = numDays > 1 ? norm * 0.7 * (numDays - 1) : 0;
  return { dailyExpense, hotelExpense, total: dailyExpense + hotelExpense };
}

const FORMULA_TITLE = "Ezamiyyə xərcləri necə hesablanır?";
const FORMULA_CONTENT = `Gündəlik xərc (30%):
Norma × 30% × Gün sayı

Mehmanxana xərci (70%):
Norma × 70% × (Gün sayı − 1)

Yekun məbləğ = Gündəlik xərc + Mehmanxana xərci

Ərazilər üzrə normalar:
• Bakı şəhəri — 125 AZN
• Naxçıvan şəhərləri — 100 AZN
• Gəncə və Sumqayıt şəhərləri — 95 AZN
• Digər şəhər, rayon mərkəzləri, qəsəbə və kəndlər — 90 AZN

Qeyd: Marşrut üzrə ezamiyyədə hər ərazi ayrıca hesablanır. Sonuncu gün yalnız gündəlik xərc hesablanır (gecələmə xərci yoxdur).`;

export function BusinessTripCalculator() {
  const { colors } = useTheme();
  const nextId = useRef(2);
  const [mode, setMode] = useState<Mode>("single");

  const [regionIndex, setRegionIndex] = useState(0);
  const [days, setDays] = useState("");

  const [legs, setLegs] = useState<Leg[]>([{ id: 1, regionIndex: 0, days: "" }]);

  const singleResult = useMemo(() => {
    const numDays = parseInt(days);
    if (!numDays || numDays <= 0) return null;
    const norm = REGIONS[regionIndex].norm;
    const { dailyExpense, hotelExpense, total } = calcLeg(norm, numDays);
    return { norm, numDays, dailyExpense, hotelExpense, total };
  }, [regionIndex, days]);

  const multiResult = useMemo(() => {
    const parsed = legs.map((leg) => {
      const numDays = parseInt(leg.days);
      if (!numDays || numDays <= 0) return null;
      const norm = REGIONS[leg.regionIndex].norm;
      const { dailyExpense, hotelExpense, total } = calcLeg(norm, numDays);
      return { norm, numDays, dailyExpense, hotelExpense, total, regionLabel: REGIONS[leg.regionIndex].label };
    });
    if (parsed.some((p) => p === null)) return null;
    const validLegs = parsed as NonNullable<(typeof parsed)[0]>[];
    const totalDaily = validLegs.reduce((s, l) => s + l.dailyExpense, 0);
    const totalHotel = validLegs.reduce((s, l) => s + l.hotelExpense, 0);
    const grandTotal = totalDaily + totalHotel;
    const totalDays = validLegs.reduce((s, l) => s + l.numDays, 0);
    return { legs: validLegs, totalDaily, totalHotel, grandTotal, totalDays };
  }, [legs]);

  const addLeg = () => setLegs([...legs, { id: nextId.current++, regionIndex: 0, days: "" }]);
  const removeLeg = (id: number) => {
    if (legs.length <= 1) return;
    setLegs(legs.filter((l) => l.id !== id));
  };
  const updateLeg = (id: number, field: "regionIndex" | "days", value: string | number) => {
    setLegs(legs.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const hasResult = mode === "single" ? !!singleResult : !!multiResult;

  return (
    <View>
      <SegmentControl
        label="Ezamiyyə tək bir rayondur, yoxsa bir neçə?"
        options={[
          { value: "single", label: "Tək rayon" },
          { value: "multicity", label: "Marşrut üzrə (Multicity)" },
        ]}
        selected={mode}
        onSelect={(v) => setMode(v as Mode)}
      />

      {mode === "single" && (
        <View>
          <OptionCards
            label="1. Ezam olunacağınız ərazini seçin"
            options={REGIONS.map((r, i) => ({ value: i, label: r.label, desc: `Norma: ${r.norm} AZN` }))}
            selected={regionIndex}
            onSelect={setRegionIndex}
          />
          <InputField
            label="2. Ezamiyyət neçə təqvim günü davam edəcək?"
            value={days}
            onChangeText={setDays}
            placeholder="Məsələn: 4"
            keyboardType="number-pad"
          />
          <ChipGroup
            options={[2, 3, 5, 7, 10, 14].map((d) => ({ value: String(d), label: `${d} gün` }))}
            selected={days}
            onSelect={setDays}
          />
        </View>
      )}

      {mode === "multicity" && (
        <View>
          <InfoBox variant="info">
            ℹ️ Sistem avtomatik olaraq sonuncu günü gecələmə xərci olmadan (yalnız gündəlik xərc) hesablayacaq.
          </InfoBox>
          {legs.map((leg, idx) => (
            <View
              key={leg.id}
              style={{ backgroundColor: colors.n200, borderColor: colors.n280, borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.n940 }}>Marşrut #{idx + 1}</Text>
                {legs.length > 1 && (
                  <Pressable onPress={() => removeLeg(leg.id)} hitSlop={8}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#ef4444" }}>✕ Sil</Text>
                  </Pressable>
                )}
              </View>
              <Select
                label="Ərazi"
                value={String(leg.regionIndex)}
                options={REGIONS.map((r, i) => ({ value: String(i), label: `${r.label} (${r.norm} AZN)` }))}
                onSelect={(v) => updateLeg(leg.id, "regionIndex", parseInt(v))}
              />
              <InputField
                label="Gün sayı"
                value={leg.days}
                onChangeText={(v) => updateLeg(leg.id, "days", v)}
                placeholder="Məs: 2"
                keyboardType="number-pad"
              />
            </View>
          ))}
          <View style={{ marginTop: 12 }}>
            <Button title="+ Marşrut əlavə et" variant="secondary" onPress={addLeg} />
          </View>
        </View>
      )}

      {hasResult && (
        <InfoBox variant="warning">🚕 Taksi xərcləri gündəlik xərcə daxildir (Sənəd tələb olunmur)</InfoBox>
      )}

      {mode === "single" && singleResult && (
        <View>
          <ResultHero label="Yekun məbləğ" value={formatMoney(singleResult.total)} sub="AZN" />
          <CardRow>
            <AmountCard
              tone="green"
              label="Gündəlik xərc (30%)"
              value={formatMoney(singleResult.dailyExpense)}
              sub={`${singleResult.norm} × 30% × ${singleResult.numDays} gün`}
            />
            <AmountCard
              tone="purple"
              label="Mehmanxana xərci (70%)"
              value={formatMoney(singleResult.hotelExpense)}
              sub={`${singleResult.norm} × 70% × ${singleResult.numDays > 1 ? singleResult.numDays - 1 : 0} gecə`}
            />
          </CardRow>
          <ResultSection title="📊 Hesablama cədvəli">
            <ResultRow label="Ərazi" value={REGIONS[regionIndex].label} />
            <ResultRow label="Gündəlik norma" value={`${singleResult.norm} AZN`} />
            <ResultRow label="Gün sayı" value={`${singleResult.numDays} gün`} />
            <ResultRow
              label={`Gündəlik xərc (30%) (${singleResult.norm} × 30% × ${singleResult.numDays})`}
              value={`${formatMoney(singleResult.dailyExpense)} AZN`}
              bold
            />
            <ResultRow
              label={`Mehmanxana xərci (70%) (${singleResult.norm} × 70% × ${singleResult.numDays > 1 ? singleResult.numDays - 1 : 0})`}
              value={`${formatMoney(singleResult.hotelExpense)} AZN`}
              bold
            />
            <ResultRow label="Yekun məbləğ" value={`${formatMoney(singleResult.total)} AZN`} highlight />
          </ResultSection>
        </View>
      )}

      {mode === "multicity" && multiResult && (
        <View>
          <ResultHero
            label={`Ümumi yekun məbləğ (${multiResult.totalDays} gün)`}
            value={formatMoney(multiResult.grandTotal)}
            sub="AZN"
          />
          <CardRow>
            <AmountCard
              tone="green"
              label="Ümumi gündəlik xərc (30%)"
              value={formatMoney(multiResult.totalDaily)}
              sub="Bütün marşrutlar"
            />
            <AmountCard
              tone="purple"
              label="Ümumi mehmanxana xərci (70%)"
              value={formatMoney(multiResult.totalHotel)}
              sub="Bütün marşrutlar"
            />
          </CardRow>
          <ResultSection title="📊 Marşrut üzrə hesablama">
            {multiResult.legs.map((leg, i) => (
              <View key={i} style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.n240 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.n940, flex: 1 }}>
                    #{i + 1} {leg.regionLabel}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.accent }}>{formatMoney(leg.total)} AZN</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.n580 }}>
                  Gündəlik: {leg.norm} × 30% × {leg.numDays} = {formatMoney(leg.dailyExpense)} AZN
                </Text>
                <Text style={{ fontSize: 12, color: colors.n580 }}>
                  Mehmanxana: {leg.norm} × 70% × {leg.numDays > 1 ? leg.numDays - 1 : 0} = {formatMoney(leg.hotelExpense)} AZN
                </Text>
              </View>
            ))}
            <ResultRow label="Ümumi yekun" value={`${formatMoney(multiResult.grandTotal)} AZN`} highlight />
          </ResultSection>
        </View>
      )}

      {!hasResult && (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>✈️</Text>
          <Paragraph>
            {mode === "single"
              ? "Nəticəni görmək üçün ərazini seçin və gün sayını daxil edin."
              : "Nəticəni görmək üçün hər marşrutun ərazisini və gün sayını daxil edin."}
          </Paragraph>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "vacation-pay", "severance-pay", "overtime"]} />
    </View>
  );
}
