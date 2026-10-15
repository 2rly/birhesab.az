import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InfoBox, FormulaSection, RelatedCalculators } from "@/components/Content";
import { ListCard } from "./_health-parts";

interface CityTimezone {
  name: string;
  country: string;
  timezone: string;
  emoji: string;
  /** Intl mövcud olmadıqda istifadə olunan standart ofset (dəqiqə) */
  fallbackOffset: number;
}

const CITIES: CityTimezone[] = [
  { name: "Bakı", country: "Azərbaycan", timezone: "Asia/Baku", emoji: "🇦🇿", fallbackOffset: 240 },
  { name: "London", country: "Böyük Britaniya", timezone: "Europe/London", emoji: "🇬🇧", fallbackOffset: 0 },
  { name: "Nyu-York", country: "ABŞ", timezone: "America/New_York", emoji: "🇺🇸", fallbackOffset: -300 },
  { name: "İstanbul", country: "Türkiyə", timezone: "Europe/Istanbul", emoji: "🇹🇷", fallbackOffset: 180 },
  { name: "Dubay", country: "BƏƏ", timezone: "Asia/Dubai", emoji: "🇦🇪", fallbackOffset: 240 },
  { name: "Berlin", country: "Almaniya", timezone: "Europe/Berlin", emoji: "🇩🇪", fallbackOffset: 60 },
  { name: "Moskva", country: "Rusiya", timezone: "Europe/Moscow", emoji: "🇷🇺", fallbackOffset: 180 },
  { name: "Tokio", country: "Yaponiya", timezone: "Asia/Tokyo", emoji: "🇯🇵", fallbackOffset: 540 },
  { name: "Sidney", country: "Avstraliya", timezone: "Australia/Sydney", emoji: "🇦🇺", fallbackOffset: 600 },
];

const AZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

const FORMULA_TITLE = "Saat qurşaqları necə işləyir?";
const FORMULA_CONTENT = `Saat qurşaqları GMT (Greenwich Mean Time) əsasında müəyyən olunur.

Bakı vaxtı: GMT+4

Əsas şəhərlərin vaxt fərqləri (Bakıya nisbətən):
• Nyu-York: -8 saat (GMT-4, yay vaxtı)
• London: -3 saat (GMT+1, yay vaxtı)
• Berlin: -2 saat (GMT+2, yay vaxtı)
• Moskva / İstanbul: -1 saat (GMT+3)
• Dubay: 0 saat (GMT+4)
• Tokio: +5 saat (GMT+9)
• Sidney: +7 saat (GMT+11)

Qeyd: Azərbaycan 2016-cı ildən yay vaxt keçidini ləğv edib. Bəzi ölkələrdə yay/qış vaxt keçidləri tətbiq olunur.`;

/** Saat qurşağının verilmiş andakı UTC ofseti (dəqiqə) — DST nəzərə alınır. */
function getOffsetMinutes(date: Date, city: CityTimezone): number {
  try {
    const s = new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
    const m = /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})/.exec(s);
    if (!m) return city.fallbackOffset;
    const asUtc = Date.UTC(+m[3], +m[1] - 1, +m[2], +m[4] % 24, +m[5], +m[6]);
    const base = Math.floor(date.getTime() / 1000) * 1000;
    return Math.round((asUtc - base) / 60000);
  } catch {
    return city.fallbackOffset;
  }
}

function zoned(date: Date, city: CityTimezone) {
  const offset = getOffsetMinutes(date, city);
  const d = new Date(date.getTime() + offset * 60000);
  return { d, offset };
}

const pad = (n: number) => String(n).padStart(2, "0");

function formatTime(date: Date, city: CityTimezone): string {
  const { d } = zoned(date, city);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function formatDate(date: Date, city: CityTimezone): string {
  const { d } = zoned(date, city);
  return `${d.getUTCDate()} ${AZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Intl "shortOffset" formatı: GMT, GMT+4, GMT-5, GMT+5:30 */
function getGmtOffset(date: Date, city: CityTimezone): string {
  const { offset } = zoned(date, city);
  if (offset === 0) return "GMT";
  const sign = offset > 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? `:${pad(m)}` : ""}`;
}

function getHour(date: Date, city: CityTimezone): number {
  return zoned(date, city).d.getUTCHours();
}

function getTimeOfDayIcon(date: Date, city: CityTimezone): string {
  const hour = getHour(date, city);
  if (hour >= 22 || hour < 6) return "🌙";
  if (hour >= 18) return "🌆";
  if (hour >= 12) return "☀️";
  return "🌅";
}

export function TimezoneCalculator() {
  const { colors } = useTheme();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const baku = CITIES[0];

  return (
    <View>
      <View style={{ gap: 14 }}>
        {/* Bakı */}
        <View style={[styles.hero, { backgroundColor: colors.accent }]}>
          <Text style={[styles.heroCity, { color: colors.onAccent }]}>🇦🇿 {baku.name}</Text>
          <Text style={[styles.heroTime, { color: colors.onAccent }]}>{formatTime(now, baku)}</Text>
          <Text style={[styles.heroSub, { color: colors.onAccent }]}>
            {formatDate(now, baku)} · {getGmtOffset(now, baku)}
          </Text>
        </View>

        {/* Digər şəhərlər */}
        <View style={styles.grid}>
          {CITIES.filter((c) => c.timezone !== "Asia/Baku").map((city) => {
            const hour = getHour(now, city);
            const isNight = hour >= 22 || hour < 6;
            return (
              <View
                key={city.timezone}
                style={[
                  styles.cityCard,
                  isNight
                    ? { backgroundColor: "#1f2937", borderColor: "#1f2937" }
                    : { backgroundColor: colors.n240, borderColor: colors.n280 },
                ]}
              >
                <Text style={[styles.cityName, { color: isNight ? "#d1d5db" : colors.n940 }]}>
                  {city.emoji} {city.name}
                </Text>
                <Text style={[styles.cityTime, { color: isNight ? "#ffffff" : colors.n960 }]}>
                  <Text style={{ fontSize: 16 }}>{getTimeOfDayIcon(now, city)} </Text>
                  {formatTime(now, city)}
                </Text>
                <Text style={[styles.tiny, { color: isNight ? "#9ca3af" : colors.n580 }]}>{formatDate(now, city)}</Text>
                <Text style={[styles.tiny, { color: isNight ? "#6b7280" : colors.n580 }]}>{getGmtOffset(now, city)}</Text>
              </View>
            );
          })}
        </View>

        {/* Cədvəl */}
        <ListCard title="Bütün şəhərlərin vaxtı">
          {CITIES.map((city) => {
            const isBaku = city.timezone === "Asia/Baku";
            return (
              <View
                key={city.timezone}
                style={[styles.row, { borderBottomColor: colors.n240 }, isBaku && { backgroundColor: colors.accent + "1f" }]}
              >
                <Text style={{ fontSize: 18 }}>{city.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowName, { color: colors.n940 }]}>{city.name}</Text>
                  <Text style={[styles.tiny, { color: colors.n580 }]}>
                    {city.country} ({getGmtOffset(now, city)})
                  </Text>
                </View>
                <Text>{getTimeOfDayIcon(now, city)}</Text>
                <Text style={[styles.rowTime, { color: colors.n940 }]}>{formatTime(now, city)}</Text>
              </View>
            );
          })}
        </ListCard>

        <InfoBox variant="info" title="Qeyd:">
          Vaxtlar avtomatik olaraq yay/qış vaxt keçidlərini (DST) nəzərə alır. Azərbaycan 2016-cı ildən yay vaxt keçidini ləğv edib.
        </InfoBox>
      </View>

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["date-difference", "age", "percentage"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 16, paddingVertical: 24, paddingHorizontal: 16, alignItems: "center" },
  heroCity: { fontSize: 17, fontWeight: "600", opacity: 0.85 },
  heroTime: { fontSize: 48, fontWeight: "800", fontVariant: ["tabular-nums"], marginVertical: 4 },
  heroSub: { fontSize: 13, opacity: 0.85 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityCard: { flexGrow: 1, flexBasis: "45%", borderRadius: 16, borderWidth: 1, padding: 12, alignItems: "center" },
  cityName: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  cityTime: { fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"], marginBottom: 4 },
  tiny: { fontSize: 11, marginTop: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowName: { fontSize: 14, fontWeight: "600" },
  rowTime: { fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
