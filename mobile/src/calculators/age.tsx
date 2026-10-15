import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { Select } from "@/components/Select";
import { FormulaSection, RelatedCalculators, ResultHero, StatGrid } from "@/components/Content";
import { fmtNum } from "@/lib/format";

const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

interface ZodiacSign {
  name: string;
  symbol: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const zodiacSigns: ZodiacSign[] = [
  { name: "Qoç", symbol: "♈", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: "Buğa", symbol: "♉", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: "Əkizlər", symbol: "♊", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: "Xərçəng", symbol: "♋", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: "Şir", symbol: "♌", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: "Qız", symbol: "♍", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: "Tərəzi", symbol: "♎", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: "Əqrəb", symbol: "♏", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: "Oxatan", symbol: "♐", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: "Oğlaq", symbol: "♑", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: "Dolça", symbol: "♒", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: "Balıqlar", symbol: "♓", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

function getZodiac(month: number, day: number): ZodiacSign {
  for (const sign of zodiacSigns) {
    if (sign.startMonth === sign.endMonth) {
      if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) return sign;
    } else if ((month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay)) {
      return sign;
    }
  }
  return zodiacSigns[0];
}

const chineseZodiacAnimals = [
  { name: "Siçan", emoji: "🐀" },
  { name: "Öküz", emoji: "🐂" },
  { name: "Pələng", emoji: "🐅" },
  { name: "Dovşan", emoji: "🐇" },
  { name: "Əjdaha", emoji: "🐉" },
  { name: "İlan", emoji: "🐍" },
  { name: "At", emoji: "🐎" },
  { name: "Qoyun", emoji: "🐐" },
  { name: "Meymun", emoji: "🐒" },
  { name: "Xoruz", emoji: "🐓" },
  { name: "İt", emoji: "🐕" },
  { name: "Donuz", emoji: "🐖" },
];

function getChineseZodiac(year: number) {
  return chineseZodiacAnimals[(year - 1900) % 12];
}

const FORMULA_TITLE = "Yaş necə hesablanır?";
const FORMULA_CONTENT = `Dəqiq yaş = Bu günün tarixi − Doğum tarixi

Hesablamaya il, ay və gün daxildir. Keçən günlər, həftələr və saatlar avtomatik hesablanır.

Bürclər (zodiak) doğum tarixinə görə müəyyən edilir.
Azərbaycanda ən çox istifadə olunan bürc sistemi Qərb zodiak sistemidir.`;

const AMBER = "#f59e0b";
const PURPLE = "#a855f7";
const RED = "#ef4444";

function fmt(n: number): string {
  return fmtNum(n, 0);
}

export function AgeCalculator() {
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();
  const [birthDay, setBirthDay] = useState(0);
  const [birthMonth, setBirthMonth] = useState(0);
  const [birthYear, setBirthYear] = useState(0);

  const daysInMonth = useMemo(() => {
    if (!birthMonth || !birthYear) return 31;
    return new Date(birthYear, birthMonth, 0).getDate();
  }, [birthMonth, birthYear]);

  // Seçilmiş ayda olmayan gün sıfırlanır
  const effectiveDay = birthDay > daysInMonth ? 0 : birthDay;

  const result = useMemo(() => {
    if (!effectiveDay || !birthMonth || !birthYear) return null;
    const birth = new Date(birthYear, birthMonth - 1, effectiveDay);
    const today = new Date();
    if (birth >= today || isNaN(birth.getTime())) return null;

    let years = today.getFullYear() - birth.getFullYear();
    let monthsDiff = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
      monthsDiff--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (monthsDiff < 0) {
      years--;
      monthsDiff += 12;
    }

    const diffMs = today.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= today) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months: monthsDiff,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      daysUntilBirthday,
      nextAge: years + 1,
      birthWeekdayIdx: birth.getDay(),
      zodiac: getZodiac(birth.getMonth() + 1, birth.getDate()),
      chineseZodiac: getChineseZodiac(birth.getFullYear()),
      birthMonth: birth.getMonth(),
      birthDay: birth.getDate(),
      birthYear: birth.getFullYear(),
    };
  }, [effectiveDay, birthMonth, birthYear]);

  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const monthOptions = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
  const yearOptions = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i).map((y) => ({
    value: String(y),
    label: String(y),
  }));

  const colorCard = (color: string, label: string, big: string, bigSize: number, sub: string) => (
    <View style={[styles.card, { backgroundColor: color + "1a", borderColor: color + "66" }]}>
      <Text style={[styles.cardLabel, { color }]}>{label}</Text>
      <Text style={[styles.cardBig, { color, fontSize: bigSize }]}>{big}</Text>
      <Text style={[styles.cardSub, { color }]}>{sub}</Text>
    </View>
  );

  return (
    <View>
      <Text style={[styles.groupLabel, { color: colors.n940 }]}>Doğum tarixiniz</Text>
      <View style={styles.selectRow}>
        <View style={{ flex: 1 }}>
          <Select
            value={effectiveDay ? String(effectiveDay) : ""}
            options={dayOptions}
            onSelect={(v) => setBirthDay(Number(v))}
            placeholder="gün"
            searchable={false}
          />
        </View>
        <View style={{ flex: 1.4 }}>
          <Select
            value={birthMonth ? String(birthMonth) : ""}
            options={monthOptions}
            onSelect={(v) => setBirthMonth(Number(v))}
            placeholder="ay"
            searchable={false}
          />
        </View>
        <View style={{ flex: 1.2 }}>
          <Select
            value={birthYear ? String(birthYear) : ""}
            options={yearOptions}
            onSelect={(v) => setBirthYear(Number(v))}
            placeholder="il"
            searchable
          />
        </View>
      </View>

      {result ? (
        <View>
          <ResultHero
            label="Sizin yaşınız"
            value={`${result.years} il, ${result.months} ay, ${result.days} gün`}
            sub={`${result.birthDay} ${MONTHS[result.birthMonth]} ${result.birthYear}, ${WEEKDAYS[result.birthWeekdayIdx]}`}
          />

          <StatGrid
            items={[
              { label: "Ümumi gün", value: fmt(result.totalDays) },
              { label: "Ümumi həftə", value: fmt(result.totalWeeks) },
              { label: "Ümumi saat", value: fmt(result.totalHours) },
              { label: "Ümumi dəqiqə", value: fmt(result.totalMinutes) },
            ]}
          />

          <View style={styles.cards}>
            {colorCard(
              AMBER,
              "Növbəti ad günü",
              String(result.daysUntilBirthday),
              30,
              `gün sonra (${result.nextAge} yaşına girəcəksiniz)`
            )}
            <View style={[styles.card, { backgroundColor: PURPLE + "1a", borderColor: PURPLE + "66" }]}>
              <Text style={[styles.cardLabel, { color: PURPLE }]}>Bürcünüz</Text>
              <Text style={[styles.symbol, { color: colors.n940 }]}>{result.zodiac.symbol}</Text>
              <Text style={[styles.cardName, { color: PURPLE }]}>{result.zodiac.name}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: RED + "1a", borderColor: RED + "66" }]}>
              <Text style={[styles.cardLabel, { color: RED }]}>Şərq təqvimi</Text>
              <Text style={styles.symbol}>{result.chineseZodiac.emoji}</Text>
              <Text style={[styles.cardName, { color: RED }]}>{result.chineseZodiac.name} ili</Text>
            </View>
          </View>

          <ResultSection title="Ətraflı məlumat">
            <ResultRow label="Doğum tarixi" value={`${result.birthDay} ${MONTHS[result.birthMonth]} ${result.birthYear}`} />
            <ResultRow label="Doğum günü" value={WEEKDAYS[result.birthWeekdayIdx]} />
            <ResultRow label="Yaş (il)" value={`${result.years} il`} />
            <ResultRow label="Yaş (ay)" value={`${result.years * 12 + result.months} ay`} />
            <ResultRow label="Bürc" value={`${result.zodiac.symbol} ${result.zodiac.name}`} />
            <ResultRow label="Şərq təqvimi" value={`${result.chineseZodiac.emoji} ${result.chineseZodiac.name} ili`} />
          </ResultSection>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎂</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>Nəticəni görmək üçün doğum tarixinizi daxil edin.</Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["date-difference", "pregnancy", "age", "timezone"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  selectRow: { flexDirection: "row", gap: 8 },
  cards: { gap: 10, marginTop: 14 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center" },
  cardLabel: { fontSize: 13 },
  cardBig: { fontWeight: "800", marginTop: 2 },
  cardSub: { fontSize: 13, marginTop: 2, textAlign: "center" },
  symbol: { fontSize: 36, marginVertical: 2 },
  cardName: { fontSize: 19, fontWeight: "800" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
