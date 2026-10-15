import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { Select } from "@/components/Select";
import { DateField } from "@/components/Controls";
import { DataTable, FormulaSection, RelatedCalculators } from "@/components/Content";
import { parseISODate, toISODate } from "@/lib/format";

interface City {
  name: string;
  lat: number;
  lng: number;
}

const cities: City[] = [
  { name: "Bakı", lat: 40.4093, lng: 49.8671 },
  { name: "Gəncə", lat: 40.6828, lng: 46.3606 },
  { name: "Sumqayıt", lat: 40.5855, lng: 49.6317 },
  { name: "Mingəçevir", lat: 40.7703, lng: 47.0594 },
  { name: "Şirvan", lat: 39.9383, lng: 48.9206 },
  { name: "Naxçıvan", lat: 39.2089, lng: 45.4122 },
  { name: "Lənkəran", lat: 38.7533, lng: 48.8511 },
  { name: "Yevlax", lat: 40.6197, lng: 47.1503 },
  { name: "Ağcabədi", lat: 40.0528, lng: 47.4614 },
  { name: "Ağdam", lat: 39.9914, lng: 46.9936 },
  { name: "Ağdaş", lat: 40.6456, lng: 47.475 },
  { name: "Ağstafa", lat: 41.1194, lng: 45.4539 },
  { name: "Ağsu", lat: 40.5683, lng: 48.3947 },
  { name: "Astara", lat: 38.4561, lng: 48.8728 },
  { name: "Balakən", lat: 41.7239, lng: 46.4044 },
  { name: "Beyləqan", lat: 39.7736, lng: 47.6156 },
  { name: "Bərdə", lat: 40.3744, lng: 47.1264 },
  { name: "Biləsuvar", lat: 39.4597, lng: 48.5442 },
  { name: "Cəbrayıl", lat: 39.3986, lng: 47.0286 },
  { name: "Cəlilabad", lat: 39.2089, lng: 48.51 },
  { name: "Daşkəsən", lat: 40.5208, lng: 46.08 },
  { name: "Füzuli", lat: 39.6003, lng: 47.1453 },
  { name: "Gədəbəy", lat: 40.5697, lng: 45.8106 },
  { name: "Goranboy", lat: 40.61, lng: 46.79 },
  { name: "Göyçay", lat: 40.6536, lng: 47.7406 },
  { name: "Göygöl", lat: 40.5867, lng: 46.3167 },
  { name: "Hacıqabul", lat: 40.0394, lng: 48.9422 },
  { name: "İmişli", lat: 39.8694, lng: 48.0597 },
  { name: "İsmayıllı", lat: 40.7872, lng: 48.1517 },
  { name: "Kəlbəcər", lat: 40.1025, lng: 46.0364 },
  { name: "Kürdəmir", lat: 40.3411, lng: 48.1614 },
  { name: "Laçın", lat: 39.6381, lng: 46.5461 },
  { name: "Lerik", lat: 38.7736, lng: 48.415 },
  { name: "Masallı", lat: 39.0342, lng: 48.6589 },
  { name: "Neftçala", lat: 39.3778, lng: 49.2472 },
  { name: "Oğuz", lat: 41.0711, lng: 47.465 },
  { name: "Ordubad", lat: 38.9061, lng: 46.0231 },
  { name: "Qax", lat: 41.4208, lng: 46.9219 },
  { name: "Qazax", lat: 41.0972, lng: 45.3658 },
  { name: "Qəbələ", lat: 41.0436, lng: 47.8461 },
  { name: "Qobustan", lat: 40.5328, lng: 48.9269 },
  { name: "Quba", lat: 41.3611, lng: 48.5128 },
  { name: "Qusar", lat: 41.4275, lng: 48.4303 },
  { name: "Saatlı", lat: 39.9319, lng: 48.3697 },
  { name: "Sabirabad", lat: 39.9881, lng: 48.4772 },
  { name: "Salyan", lat: 39.5942, lng: 48.9836 },
  { name: "Samux", lat: 40.7617, lng: 46.4072 },
  { name: "Siyəzən", lat: 41.0781, lng: 49.1117 },
  { name: "Şabran", lat: 41.2161, lng: 48.8547 },
  { name: "Şahbuz", lat: 39.4078, lng: 45.5728 },
  { name: "Şamaxı", lat: 40.6319, lng: 48.6364 },
  { name: "Şəki", lat: 41.1975, lng: 47.1706 },
  { name: "Şəmkir", lat: 40.8297, lng: 46.0178 },
  { name: "Şərur", lat: 39.5536, lng: 44.9819 },
  { name: "Şuşa", lat: 39.7586, lng: 46.7492 },
  { name: "Tərtər", lat: 40.3444, lng: 46.9308 },
  { name: "Tovuz", lat: 40.9925, lng: 45.6283 },
  { name: "Ucar", lat: 40.5133, lng: 47.6536 },
  { name: "Xaçmaz", lat: 41.4589, lng: 48.8025 },
  { name: "Xankəndi", lat: 39.8153, lng: 46.7519 },
  { name: "Xırdalan", lat: 40.4486, lng: 49.7553 },
  { name: "Xızı", lat: 40.91, lng: 49.07 },
  { name: "Yardımlı", lat: 38.9058, lng: 48.2417 },
  { name: "Zaqatala", lat: 41.6031, lng: 46.6361 },
  { name: "Zəngilan", lat: 39.0853, lng: 46.6642 },
  { name: "Zərdab", lat: 40.2147, lng: 47.7139 },
];

const TIMEZONE = 4;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function getJulianDay(year: number, month: number, day: number): number {
  return (
    367 * year -
    Math.floor((7 * (year + Math.floor((month + 9) / 12))) / 4) +
    Math.floor((275 * month) / 9) +
    day +
    1721013.5
  );
}

function getSunPosition(jd: number) {
  const T = (jd - 2451545) / 36525;
  let L0 = 280.46646 + 36000.76983 * T;
  L0 = ((L0 % 360) + 360) % 360;
  let M = 357.52911 + 35999.05029 * T;
  M = ((M % 360) + 360) % 360;
  const Mrad = toRad(M);
  const C =
    (1.9146 - 0.004817 * T) * Math.sin(Mrad) +
    0.019993 * Math.sin(2 * Mrad) +
    0.00029 * Math.sin(3 * Mrad);
  let sunLon = L0 + C;
  sunLon = ((sunLon % 360) + 360) % 360;
  const obliquity = 23.439 - 0.00000036 * (jd - 2451545);
  const declination = toDeg(Math.asin(Math.sin(toRad(obliquity)) * Math.sin(toRad(sunLon))));
  const y = Math.tan(toRad(obliquity / 2)) ** 2;
  const L0rad = toRad(L0);
  const eqTime =
    4 *
    toDeg(
      y * Math.sin(2 * L0rad) -
        2 * 0.01671 * Math.sin(Mrad) +
        4 * 0.01671 * y * Math.sin(Mrad) * Math.cos(2 * L0rad) -
        0.5 * y * y * Math.sin(4 * L0rad) -
        1.25 * 0.01671 * 0.01671 * Math.sin(2 * Mrad)
    );
  return { declination, eqTime };
}

function calcPrayerTime(
  angle: number,
  lat: number,
  lng: number,
  declination: number,
  eqTime: number,
  isBefore: boolean
): number {
  const latRad = toRad(lat);
  const decRad = toRad(declination);
  const cosHA =
    (Math.sin(toRad(angle)) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));
  if (cosHA > 1 || cosHA < -1) return NaN;
  const hourAngle = toDeg(Math.acos(cosHA)) / 15;
  const dhuhr = 12 - eqTime / 60 + (TIMEZONE * 15 - lng) / 15;
  return isBefore ? dhuhr - hourAngle : dhuhr + hourAngle;
}

function calcAsrTime(lat: number, lng: number, declination: number, eqTime: number): number {
  const latRad = toRad(lat);
  const decRad = toRad(declination);
  const noonAlt = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad)
  );
  const shadowRatio = 1 + 1 / Math.tan(noonAlt);
  const asrAngle = toDeg(Math.atan(1 / shadowRatio));
  return calcPrayerTime(asrAngle, lat, lng, declination, eqTime, false);
}

interface PrayerTimes {
  imsak: string;
  gunesh: string;
  zohr: string;
  asr: string;
  meghrib: string;
  isha: string;
}

function formatTime(hours: number): string {
  if (isNaN(hours)) return "--:--";
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) {
    h++;
    m = 0;
  }
  h = ((h % 24) + 24) % 24;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function calcAllPrayerTimes(
  year: number,
  month: number,
  day: number,
  lat: number,
  lng: number
): PrayerTimes {
  const jd = getJulianDay(year, month, day);
  const { declination, eqTime } = getSunPosition(jd);
  const dhuhr = 12 - eqTime / 60 + (TIMEZONE * 15 - lng) / 15;
  const imsak = calcPrayerTime(-18, lat, lng, declination, eqTime, true);
  const gunesh = calcPrayerTime(-0.833, lat, lng, declination, eqTime, true);
  const meghrib = calcPrayerTime(-0.833, lat, lng, declination, eqTime, false);
  const isha = calcPrayerTime(-17, lat, lng, declination, eqTime, false);
  const asr = calcAsrTime(lat, lng, declination, eqTime);
  return {
    imsak: formatTime(imsak),
    gunesh: formatTime(gunesh),
    zohr: formatTime(dhuhr),
    asr: formatTime(asr),
    meghrib: formatTime(meghrib),
    isha: formatTime(isha),
  };
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const pt = {
  formulaTitle: "Namaz vaxtları necə hesablanır?",
  formulaContent: `Namaz vaxtları günəşin üfüqdən olan bucaq mövqeyinə əsasən astronomik formullarla hesablanır.

1. Julian günü nömrəsi tarixdən hesablanır
2. Günəşin deklinasiyası (meyli) və zaman tənliyi tapılır
3. Hər namaz vaxtı üçün günəşin müəyyən bucağı istifadə olunur:
   • İmsak (Fajr): günəş bucağı -18° (üfüqdən aşağı)
   • Günəş (Sunrise): -0.833° (atmosfer refraksiyası nəzərə alınaraq)
   • Zöhr (Dhuhr): günəş meridianı keçəndə (ən yüksək nöqtə)
   • Əsr (Asr): cismin kölgəsi = cismin uzunluğu + günortadakı kölgə (Şafi metodu)
   • Məğrib (İftar): -0.833° (günəş batımı)
   • İşa: günəş bucağı -17°

Azərbaycan üçün vaxt zonası GMT+4 istifadə olunur. Hesablamalar ±1-2 dəqiqə dəqiqliklə aparılır.`,
  toImsak: "İmsaka",
  toIftar: "İftara",
  remaining: "qalıb",
  city: "Şəhər",
  date: "Tarix",
  imsak: "İmsak",
  sunrise: "Günəş",
  dhuhr: "Zöhr",
  asr: "Əsr",
  maghrib: "Məğrib",
  isha: "İşa",
  fajr: "Fajr",
  sunriseSub: "Sunrise",
  dhuhrSub: "Dhuhr",
  asrSub: "Asr",
  iftarSub: "İftar",
  ishaSub: "Isha",
  hide: "Gizlət",
  showMonth: "Bütün ay",
  dayColumn: "Gün",
  imsakColumn: "İmsak",
  iftarColumn: "İftar",
  months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
};

export function RamazanCalculator() {
  const { colors } = useTheme();
  const [cityIndex, setCityIndex] = useState(0);
  const [dateStr, setDateStr] = useState(() => toISODate(new Date()));
  const [showMonth, setShowMonth] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const city = cities[cityIndex];

  const dateParts = useMemo(() => {
    const d = parseISODate(dateStr) ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, [dateStr]);

  const times = useMemo(
    () => calcAllPrayerTimes(dateParts.year, dateParts.month, dateParts.day, city.lat, city.lng),
    [dateParts, city]
  );

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const todayTimes = useMemo(() => {
    const t = new Date();
    return calcAllPrayerTimes(t.getFullYear(), t.getMonth() + 1, t.getDate(), city.lat, city.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, todayKey]);

  const countdown = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const imsakMin = timeToMinutes(todayTimes.imsak);
    const iftarMin = timeToMinutes(todayTimes.meghrib);

    let targetSec: number;
    let label: string;

    if (currentMinutes < imsakMin) {
      targetSec = imsakMin * 60;
      label = pt.toImsak;
    } else if (currentMinutes < iftarMin) {
      targetSec = iftarMin * 60;
      label = pt.toIftar;
    } else {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = calcAllPrayerTimes(
        tomorrow.getFullYear(),
        tomorrow.getMonth() + 1,
        tomorrow.getDate(),
        city.lat,
        city.lng
      );
      targetSec = timeToMinutes(tomorrowTimes.imsak) * 60 + 24 * 3600;
      label = pt.toImsak;
    }

    let diff = targetSec - currentSeconds;
    if (diff < 0) diff += 24 * 3600;

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return {
      label,
      time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`,
    };
  }, [now, todayTimes, city]);

  const monthData = useMemo(() => {
    if (!showMonth) return [];
    const { year, month } = dateParts;
    const days = getDaysInMonth(year, month);
    const result: { day: number; imsak: string; iftar: string }[] = [];
    for (let d = 1; d <= days; d++) {
      const t = calcAllPrayerTimes(year, month, d, city.lat, city.lng);
      result.push({ day: d, imsak: t.imsak, iftar: t.meghrib });
    }
    return result;
  }, [showMonth, dateParts, city]);

  const prayerCards = [
    { label: pt.imsak, sub: pt.fajr, time: times.imsak, bg: "#312e81", text: "#ffffff" },
    { label: pt.sunrise, sub: pt.sunriseSub, time: times.gunesh, bg: "#f97316", text: "#ffffff" },
    { label: pt.dhuhr, sub: pt.dhuhrSub, time: times.zohr, bg: "#facc15", text: "#713f12" },
    { label: pt.asr, sub: pt.asrSub, time: times.asr, bg: "#f59e0b", text: "#ffffff" },
    { label: pt.maghrib, sub: pt.iftarSub, time: times.meghrib, bg: "#059669", text: "#ffffff", prominent: true },
    { label: pt.isha, sub: pt.ishaSub, time: times.isha, bg: "#1e3a8a", text: "#ffffff" },
  ];

  const todayIndex = monthData.findIndex((r) => r.day === dateParts.day);

  return (
    <View>
      {/* Geri sayım */}
      <View style={styles.countdown}>
        <Text style={styles.cdLabel}>{countdown.label}</Text>
        <Text style={styles.cdTime}>{countdown.time}</Text>
        <Text style={styles.cdSub}>{pt.remaining}</Text>
      </View>

      <Select
        label={pt.city}
        value={String(cityIndex)}
        options={cities.map((c, i) => ({ value: String(i), label: c.name }))}
        onSelect={(v) => setCityIndex(Number(v))}
        searchable
      />
      <DateField label={pt.date} value={dateStr} onChange={setDateStr} />

      {/* Namaz vaxtları kartları */}
      <View style={styles.grid}>
        {prayerCards.map((card) => (
          <View
            key={card.label}
            style={[
              styles.card,
              { backgroundColor: card.bg },
              card.prominent && { borderWidth: 3, borderColor: "#6ee7b7" },
            ]}
          >
            <Text style={[styles.cardSub, { color: card.text }]}>{card.sub}</Text>
            <Text style={[styles.cardLabel, { color: card.text }]}>{card.label}</Text>
            <Text style={[styles.cardTime, { color: card.text }]}>{card.time}</Text>
          </View>
        ))}
      </View>

      {/* Aylıq cədvəl düyməsi */}
      <Pressable
        onPress={() => setShowMonth(!showMonth)}
        style={[styles.toggleBtn, { backgroundColor: colors.n240, borderColor: colors.n280 }]}
      >
        <MaterialIcons name={showMonth ? "expand-less" : "expand-more"} size={20} color={colors.n760} />
        <Text style={[styles.toggleText, { color: colors.n760 }]}>{showMonth ? pt.hide : pt.showMonth}</Text>
      </Pressable>

      {showMonth && (
        <DataTable
          headers={[pt.dayColumn, pt.imsakColumn, pt.iftarColumn]}
          rows={monthData.map((r) => [`${r.day} ${pt.months[dateParts.month - 1]}`, r.imsak, r.iftar])}
          highlightRows={todayIndex >= 0 ? [todayIndex] : []}
          columnWidths={[140, 90, 90]}
        />
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["zakat", "age", "date-difference", "timezone"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  countdown: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#047857",
    marginBottom: 20,
  },
  cdLabel: { color: "#ffffff", fontSize: 13, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 },
  cdTime: { color: "#ffffff", fontSize: 40, fontWeight: "800", letterSpacing: 3, fontVariant: ["tabular-nums"], marginTop: 4 },
  cdSub: { color: "#ffffff", fontSize: 13, opacity: 0.85, marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4, marginBottom: 16 },
  card: { flexBasis: "47%", flexGrow: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  cardSub: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", opacity: 0.85 },
  cardLabel: { fontSize: 17, fontWeight: "700", marginTop: 2 },
  cardTime: { fontSize: 26, fontWeight: "800", marginTop: 6, fontVariant: ["tabular-nums"] },
  toggleBtn: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  toggleText: { fontSize: 14, fontWeight: "600" },
});
