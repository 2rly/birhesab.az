import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { DateField } from "@/components/Controls";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { parseISODate } from "@/lib/format";
import { ListCard, ListRow, TileGrid, StatTiles, ProgressBar, BigResult, EmptyState } from "./_health-parts";

type CalcMethod = "lmp" | "conception" | "ultrasound" | "ivf";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

const TRIMESTERS = [
  { name: "I Trimester", weeks: "1–12 həftə", icon: "🌱", color: "#15803d" },
  { name: "II Trimester", weeks: "13–27 həftə", icon: "🌸", color: "#be185d" },
  { name: "III Trimester", weeks: "28–40 həftə", icon: "👶", color: "#7e22ce" },
];

const MILESTONES = [
  { week: 4, title: "Ürək döyüntüsü", description: "Embrionun ürəyi döyünməyə başlayır", icon: "💓" },
  { week: 8, title: "Orqanlar formalaşır", description: "Əsas orqanlar inkişaf etməyə başlayır", icon: "🧬" },
  { week: 12, title: "I trimester sonu", description: "Toksikozu azalır, enerji artır", icon: "✨" },
  { week: 16, title: "Cinsin müəyyən olunması", description: "USM-də cinsi müəyyən etmək olar", icon: "🔍" },
  { week: 20, title: "İlk hərəkətlər", description: "Körpənin hərəkətlərini hiss edirsiniz", icon: "🤸" },
  { week: 24, title: "Yaşama qabiliyyəti", description: "Vaxtından əvvəl doğulsa yaşaya bilər", icon: "🏥" },
  { week: 28, title: "III trimester", description: "Körpə sürətlə böyüyür, göz açıb-yumur", icon: "👁️" },
  { week: 32, title: "Ciyərlər yetişir", description: "Ciyərlər inkişaf edir, baş aşağı dönür", icon: "🫁" },
  { week: 36, title: "Tam formalaşma", description: "Körpə demək olar tam formalaşıb", icon: "👶" },
  { week: 37, title: "Tam müddətli", description: "Bu həftədən doğuş normal sayılır", icon: "✅" },
  { week: 40, title: "Təxmini doğuş tarixi", description: "Doğuş gözlənilir!", icon: "🎉" },
];

const BABY_SIZES = [
  { week: 8, length: "1.6 sm", weight: "1 q", comparison: "Moruq" },
  { week: 12, length: "5.4 sm", weight: "14 q", comparison: "Gavalı" },
  { week: 16, length: "11.6 sm", weight: "100 q", comparison: "Avokado" },
  { week: 20, length: "16.5 sm", weight: "300 q", comparison: "Banan" },
  { week: 24, length: "30 sm", weight: "600 q", comparison: "Qarğıdalı" },
  { week: 28, length: "37 sm", weight: "1 kq", comparison: "Badımcan" },
  { week: 32, length: "42 sm", weight: "1.7 kq", comparison: "Qabaq" },
  { week: 36, length: "47 sm", weight: "2.6 kq", comparison: "Yetişmiş ananas" },
  { week: 40, length: "51 sm", weight: "3.4 kq", comparison: "Qarpız" },
];

const METHODS: { id: CalcMethod; label: string; icon: string }[] = [
  { id: "lmp", label: "Son adet tarixi", icon: "📅" },
  { id: "conception", label: "Konsepsiya tarixi", icon: "🧬" },
  { id: "ultrasound", label: "USM nəticəsi", icon: "🔍" },
  { id: "ivf", label: "IVF transfer", icon: "🏥" },
];

const DATE_LABELS: Record<CalcMethod, string> = {
  lmp: "Son adet tarixi",
  conception: "Konsepsiya tarixi",
  ultrasound: "USM tarixi",
  ivf: "IVF transfer tarixi",
};

const FORMULA_TITLE = "Doğuş tarixi necə hesablanır?";
const FORMULA_CONTENT = `Naegele düsturu:
Təxmini doğuş tarixi = Son adet tarixi (SAT) + 280 gün (40 həftə)

Hesablama üsulları:
• SAT (Son Adet Tarixi): ən geniş yayılmış üsul
• Konsepsiya tarixi: SAT + 14 gün = konsepsiya
• USM (Ultrasəs): USM tarixində körpənin yaşı əsasında
• IVF: embrion transfer tarixi əsasında

Trimesterlər:
• I Trimester: 1–12 həftə (orqanlar formalaşır)
• II Trimester: 13–27 həftə (sürətli böyümə)
• III Trimester: 28–40 həftə (yetişmə, hazırlıq)

Qeyd: Doğuş tarixi təxminidir. Körpələrin yalnız ~5%-i dəqiq həmin gün doğulur.
Normal doğuş 37–42 həftə arasında baş verir.`;

const PINK = "#db2777";

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function PregnancyCalculator() {
  const { colors } = useTheme();
  const [method, setMethod] = useState<CalcMethod>("lmp");
  const [dateInput, setDateInput] = useState("");
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState("");
  const [ultrasoundDays, setUltrasoundDays] = useState("");

  const result = useMemo(() => {
    if (!dateInput) return null;
    const inputDate = parseISODate(dateInput);
    if (!inputDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lmpDate: Date;
    switch (method) {
      case "lmp":
        lmpDate = new Date(inputDate);
        break;
      case "conception":
      case "ivf":
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
        break;
      case "ultrasound": {
        const usWeeks = parseInt(ultrasoundWeeks) || 0;
        const usDays = parseInt(ultrasoundDays) || 0;
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - (usWeeks * 7 + usDays));
        break;
      }
      default:
        return null;
    }

    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);

    const daysPassed = daysBetween(lmpDate, today);
    if (daysPassed < 0) return null;

    const currentWeek = Math.floor(daysPassed / 7);
    const currentDay = daysPassed % 7;
    const daysRemaining = daysBetween(today, dueDate);
    const weeksRemaining = Math.floor(daysRemaining / 7);
    const progress = Math.min(100, (daysPassed / 280) * 100);

    let trimesterIndex: number;
    if (currentWeek < 13) trimesterIndex = 0;
    else if (currentWeek < 28) trimesterIndex = 1;
    else trimesterIndex = 2;

    const conceptionDate = new Date(lmpDate);
    conceptionDate.setDate(conceptionDate.getDate() + 14);
    const trimester2Start = new Date(lmpDate);
    trimester2Start.setDate(trimester2Start.getDate() + 13 * 7);
    const trimester3Start = new Date(lmpDate);
    trimester3Start.setDate(trimester3Start.getDate() + 28 * 7);

    const babySize = [...BABY_SIZES].reverse().find((s) => currentWeek >= s.week) || BABY_SIZES[0];

    return {
      lmpDate,
      dueDate,
      conceptionDate,
      currentWeek: Math.min(currentWeek, 42),
      currentDay,
      daysPassed: Math.min(daysPassed, 294),
      daysRemaining: Math.max(0, daysRemaining),
      weeksRemaining: Math.max(0, weeksRemaining),
      progress: Math.min(100, progress),
      trimesterIndex,
      trimester2Start,
      trimester3Start,
      babySize,
    };
  }, [dateInput, method, ultrasoundWeeks, ultrasoundDays]);

  const tri = result ? TRIMESTERS[result.trimesterIndex] : TRIMESTERS[0];

  return (
    <View>
      <TileGrid
        label="Hesablama üsulu"
        columns={2}
        options={METHODS.map((m) => ({ value: m.id, icon: m.icon, label: m.label }))}
        selected={method}
        onSelect={setMethod}
        activeColor={() => "#ec4899"}
      />

      <DateField label={`📅 ${DATE_LABELS[method]}`} value={dateInput} onChange={setDateInput} />

      {method === "ultrasound" && (
        <>
          <Text style={[styles.label, { color: colors.n700 }]}>🔍 USM-də hamiləlik yaşı</Text>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <InputField label="Həftə" value={ultrasoundWeeks} onChangeText={setUltrasoundWeeks} placeholder="12" keyboardType="number-pad" suffix="həftə" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Gün" value={ultrasoundDays} onChangeText={setUltrasoundDays} placeholder="0" keyboardType="number-pad" suffix="gün" />
            </View>
          </View>
        </>
      )}

      {result ? (
        <View style={{ gap: 14 }}>
          <BigResult
            label="Hazırkı hamiləlik həftəsi"
            value={`${result.currentWeek}+${result.currentDay}`}
            unit="həftə + gün"
            color={PINK}
            extra={`${tri.icon} ${tri.name}`}
          />

          {/* Proqres */}
          <View style={[styles.box, { backgroundColor: colors.n240 }]}>
            <View style={styles.progressLabels}>
              <Text style={[styles.tiny, { color: colors.n580 }]}>0 həftə</Text>
              <Text style={[styles.tiny, { color: colors.n580 }]}>{result.progress.toFixed(0)}% tamamlanıb</Text>
              <Text style={[styles.tiny, { color: colors.n580 }]}>40 həftə</Text>
            </View>
            <ProgressBar pct={result.progress} color={PINK} height={16} />
            <View style={styles.markers}>
              <Text style={[styles.marker, { left: "32.5%", color: colors.n580 }]}>|13h</Text>
              <Text style={[styles.marker, { left: "70%", color: colors.n580 }]}>|28h</Text>
            </View>
          </View>

          {/* Əsas tarixlər */}
          <StatTiles
            items={[
              { label: "📅 Təxmini doğuş tarixi", value: formatDate(result.dueDate), unit: `${result.daysRemaining} gün qalıb` },
              { label: "🧬 Konsepsiya tarixi", value: formatDate(result.conceptionDate), unit: "Təxmini" },
              {
                label: "⏱️ Keçən müddət",
                value: `${result.daysPassed} gün`,
                unit: `${result.currentWeek} həftə ${result.currentDay} gün`,
              },
            ]}
          />

          {/* Körpənin ölçüsü */}
          <View style={[styles.babyBox, { backgroundColor: tri.color + "14", borderColor: tri.color + "55" }]}>
            <Text style={[styles.babyTitle, { color: tri.color }]}>
              👶 Körpənizin təxmini ölçüsü ({result.currentWeek}. həftə)
            </Text>
            <View style={styles.babyRow}>
              {[
                { l: "Uzunluq", v: result.babySize.length },
                { l: "Çəki", v: result.babySize.weight },
                { l: "Müqayisə", v: result.babySize.comparison },
              ].map((x) => (
                <View key={x.l} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={[styles.tiny, { color: colors.n580 }]}>{x.l}</Text>
                  <Text style={[styles.babyValue, { color: colors.n940 }]}>{x.v}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trimester cədvəli */}
          <ListCard title="📊 Trimester cədvəli">
            {TRIMESTERS.map((t, i) => {
              const dates = [formatDate(result.lmpDate), formatDate(result.trimester2Start), formatDate(result.trimester3Start)];
              const isActive = i === result.trimesterIndex;
              return (
                <ListRow
                  key={t.name}
                  icon={t.icon}
                  label={t.name}
                  sub={t.weeks}
                  valueSub={`${dates[i]}-dən`}
                  badge={isActive ? "Hazırda" : undefined}
                  active={isActive}
                  activeColor={t.color}
                />
              );
            })}
          </ListCard>

          {/* İnkişaf mərhələləri */}
          <ListCard title="🎯 İnkişaf mərhələləri">
            {MILESTONES.map((m) => {
              const isPassed = result.currentWeek >= m.week;
              const isCurrent = result.currentWeek >= m.week - 1 && result.currentWeek <= m.week;
              return (
                <View
                  key={m.week}
                  style={[styles.msRow, { borderBottomColor: colors.n240 }, isCurrent && { backgroundColor: PINK + "1a" }]}
                >
                  <Text style={[styles.msIcon, !isPassed && { opacity: 0.4 }]}>{m.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.msTitle, { color: isPassed ? colors.n940 : colors.n580, fontWeight: isPassed ? "600" : "400" }]}>
                      {m.week}. həftə — {m.title}
                    </Text>
                    <Text style={[styles.tiny, { color: colors.n580 }]}>{m.description}</Text>
                  </View>
                  {isPassed && <Text style={{ color: "#22c55e", fontSize: 14 }}>✓</Text>}
                </View>
              );
            })}
          </ListCard>

          {/* Körpənin həftələrə görə ölçüsü */}
          <ListCard title="📏 Körpənin həftələrə görə ölçüsü">
            {BABY_SIZES.map((s, idx) => {
              const isActive = result.currentWeek >= s.week && result.currentWeek < (BABY_SIZES[idx + 1]?.week || 99);
              return (
                <ListRow
                  key={s.week}
                  icon={`${s.week}h`}
                  label={s.comparison}
                  value={s.weight}
                  valueSub={s.length}
                  active={isActive}
                  activeColor={PINK}
                />
              );
            })}
          </ListCard>

          <InfoBox variant="info" title="Diqqət:">
            Bu hesablama təxmini xarakter daşıyır. Faktiki doğuş tarixi 2 həftə əvvəl və ya sonra ola bilər. Normal doğuş 37–42 həftə arasında baş verir. Müntəzəm həkim müayinəsi və USM nəzarəti vacibdir.
          </InfoBox>
        </View>
      ) : (
        <EmptyState icon="🤰" text="Nəticəni görmək üçün tarix daxil edin." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["bmi", "bmr", "water-intake", "ideal-weight"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  row2: { flexDirection: "row", gap: 10 },
  box: { borderRadius: 12, padding: 14 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  markers: { height: 16, marginTop: 2 },
  marker: { position: "absolute", top: 0, fontSize: 10 },
  tiny: { fontSize: 11 },
  babyBox: { borderRadius: 16, borderWidth: 1, padding: 14 },
  babyTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  babyRow: { flexDirection: "row", gap: 8 },
  babyValue: { fontSize: 16, fontWeight: "800", marginTop: 3, textAlign: "center" },
  msRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  msIcon: { fontSize: 18 },
  msTitle: { fontSize: 13 },
});
