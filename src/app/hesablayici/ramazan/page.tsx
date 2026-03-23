"use client";

import CalculatorLayout from "@/components/CalculatorLayout";
import { useState, useMemo, useEffect } from "react";

interface City {
  name: string;
  lat: number;
  lng: number;
}

const cities: City[] = [
  // Böyük şəhərlər
  { name: "Bakı", lat: 40.4093, lng: 49.8671 },
  { name: "Gəncə", lat: 40.6828, lng: 46.3606 },
  { name: "Sumqayıt", lat: 40.5855, lng: 49.6317 },
  { name: "Mingəçevir", lat: 40.7703, lng: 47.0594 },
  { name: "Şirvan", lat: 39.9383, lng: 48.9206 },
  { name: "Naxçıvan", lat: 39.2089, lng: 45.4122 },
  { name: "Lənkəran", lat: 38.7533, lng: 48.8511 },
  { name: "Yevlax", lat: 40.6197, lng: 47.1503 },
  // Rayonlar
  { name: "Ağcabədi", lat: 40.0528, lng: 47.4614 },
  { name: "Ağdam", lat: 39.9914, lng: 46.9936 },
  { name: "Ağdaş", lat: 40.6456, lng: 47.4750 },
  { name: "Ağstafa", lat: 41.1194, lng: 45.4539 },
  { name: "Ağsu", lat: 40.5683, lng: 48.3947 },
  { name: "Astara", lat: 38.4561, lng: 48.8728 },
  { name: "Balakən", lat: 41.7239, lng: 46.4044 },
  { name: "Beyləqan", lat: 39.7736, lng: 47.6156 },
  { name: "Bərdə", lat: 40.3744, lng: 47.1264 },
  { name: "Biləsuvar", lat: 39.4597, lng: 48.5442 },
  { name: "Cəbrayıl", lat: 39.3986, lng: 47.0286 },
  { name: "Cəlilabad", lat: 39.2089, lng: 48.5100 },
  { name: "Daşkəsən", lat: 40.5208, lng: 46.0800 },
  { name: "Füzuli", lat: 39.6003, lng: 47.1453 },
  { name: "Gədəbəy", lat: 40.5697, lng: 45.8106 },
  { name: "Goranboy", lat: 40.6100, lng: 46.7900 },
  { name: "Göyçay", lat: 40.6536, lng: 47.7406 },
  { name: "Göygöl", lat: 40.5867, lng: 46.3167 },
  { name: "Hacıqabul", lat: 40.0394, lng: 48.9422 },
  { name: "İmişli", lat: 39.8694, lng: 48.0597 },
  { name: "İsmayıllı", lat: 40.7872, lng: 48.1517 },
  { name: "Kəlbəcər", lat: 40.1025, lng: 46.0364 },
  { name: "Kürdəmir", lat: 40.3411, lng: 48.1614 },
  { name: "Laçın", lat: 39.6381, lng: 46.5461 },
  { name: "Lerik", lat: 38.7736, lng: 48.4150 },
  { name: "Masallı", lat: 39.0342, lng: 48.6589 },
  { name: "Neftçala", lat: 39.3778, lng: 49.2472 },
  { name: "Oğuz", lat: 41.0711, lng: 47.4650 },
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
  { name: "Xızı", lat: 40.9100, lng: 49.0700 },
  { name: "Yardımlı", lat: 38.9058, lng: 48.2417 },
  { name: "Zaqatala", lat: 41.6031, lng: 46.6361 },
  { name: "Zəngilan", lat: 39.0853, lng: 46.6642 },
  { name: "Zərdab", lat: 40.2147, lng: 47.7139 },
];

const TIMEZONE = 4; // Azerbaijan GMT+4

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

  // Mean longitude (degrees)
  let L0 = 280.46646 + 36000.76983 * T;
  L0 = ((L0 % 360) + 360) % 360;

  // Mean anomaly (degrees)
  let M = 357.52911 + 35999.05029 * T;
  M = ((M % 360) + 360) % 360;

  // Equation of center
  const Mrad = toRad(M);
  const C =
    (1.9146 - 0.004817 * T) * Math.sin(Mrad) +
    0.019993 * Math.sin(2 * Mrad) +
    0.00029 * Math.sin(3 * Mrad);

  // Sun's true longitude
  let sunLon = L0 + C;
  sunLon = ((sunLon % 360) + 360) % 360;

  // Obliquity of ecliptic
  const obliquity = 23.439 - 0.00000036 * (jd - 2451545);

  // Sun declination
  const declination = toDeg(
    Math.asin(Math.sin(toRad(obliquity)) * Math.sin(toRad(sunLon)))
  );

  // Equation of time (minutes)
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

  const hourAngle = toDeg(Math.acos(cosHA)) / 15; // in hours

  // Dhuhr time (solar noon)
  const dhuhr = 12 - eqTime / 60 + (TIMEZONE * 15 - lng) / 15;

  return isBefore ? dhuhr - hourAngle : dhuhr + hourAngle;
}

function calcAsrTime(
  lat: number,
  lng: number,
  declination: number,
  eqTime: number
): number {
  const latRad = toRad(lat);
  const decRad = toRad(declination);

  // Shadow ratio at noon
  const noonAlt = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad)
  );
  const shadowRatio = 1 + 1 / Math.tan(noonAlt);

  // Asr angle
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

export default function RamazanPage() {
  const [cityIndex, setCityIndex] = useState(0);
  const [dateStr, setDateStr] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [showMonth, setShowMonth] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const city = cities[cityIndex];

  const dateParts = useMemo(() => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return { year: y, month: m, day: d };
  }, [dateStr]);

  const times = useMemo(
    () =>
      calcAllPrayerTimes(
        dateParts.year,
        dateParts.month,
        dateParts.day,
        city.lat,
        city.lng
      ),
    [dateParts, city]
  );

  const todayTimes = useMemo(() => {
    const t = new Date();
    return calcAllPrayerTimes(
      t.getFullYear(),
      t.getMonth() + 1,
      t.getDate(),
      city.lat,
      city.lng
    );
  }, [city, now]);

  const countdown = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const imsakMin = timeToMinutes(todayTimes.imsak);
    const iftarMin = timeToMinutes(todayTimes.meghrib);

    const imsakSec = imsakMin * 60;
    const iftarSec = iftarMin * 60;

    let targetSec: number;
    let label: string;

    if (currentMinutes < imsakMin) {
      // Before imsak — count down to imsak
      targetSec = imsakSec;
      label = "İmsaka";
    } else if (currentMinutes < iftarMin) {
      // After imsak, before iftar — count down to iftar
      targetSec = iftarSec;
      label = "İftara";
    } else {
      // After iftar — count down to tomorrow's imsak
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = calcAllPrayerTimes(
        tomorrow.getFullYear(),
        tomorrow.getMonth() + 1,
        tomorrow.getDate(),
        city.lat,
        city.lng
      );
      const tomorrowImsakMin = timeToMinutes(tomorrowTimes.imsak);
      targetSec = tomorrowImsakMin * 60 + 24 * 3600;
      label = "İmsaka";
    }

    let diff = targetSec - currentSeconds;
    if (diff < 0) diff += 24 * 3600;

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return {
      label,
      time: `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
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
    {
      label: "İmsak",
      sub: "Fajr",
      time: times.imsak,
      bg: "bg-indigo-900",
      text: "text-white",
      border: "border-indigo-800",
    },
    {
      label: "Günəş",
      sub: "Sunrise",
      time: times.gunesh,
      bg: "bg-orange-500",
      text: "text-white",
      border: "border-orange-400",
    },
    {
      label: "Zöhr",
      sub: "Dhuhr",
      time: times.zohr,
      bg: "bg-yellow-400",
      text: "text-yellow-900",
      border: "border-yellow-300",
    },
    {
      label: "Əsr",
      sub: "Asr",
      time: times.asr,
      bg: "bg-amber-500",
      text: "text-white",
      border: "border-amber-400",
    },
    {
      label: "Məğrib",
      sub: "İftar",
      time: times.meghrib,
      bg: "bg-emerald-600",
      text: "text-white",
      border: "border-emerald-500",
      prominent: true,
    },
    {
      label: "İşa",
      sub: "Isha",
      time: times.isha,
      bg: "bg-blue-900",
      text: "text-white",
      border: "border-blue-800",
    },
  ];

  const monthNames = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "İyun",
    "İyul",
    "Avqust",
    "Sentyabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
  ];

  return (
    <CalculatorLayout
      title="Ramazan İmsakiyyəsi"
      description="İmsak, iftar və namaz vaxtları — Azərbaycan şəhərləri üzrə"
      breadcrumbs={[
        { label: "Din", href: "/?category=religion" },
        { label: "Ramazan İmsakiyyəsi" },
      ]}
      formulaTitle="Namaz vaxtları necə hesablanır?"
      formulaContent={`Namaz vaxtları günəşin üfüqdən olan bucaq mövqeyinə əsasən astronomik formullarla hesablanır.

1. Julian günü nömrəsi tarixdən hesablanır
2. Günəşin deklinasiyası (meyli) və zaman tənliyi tapılır
3. Hər namaz vaxtı üçün günəşin müəyyən bucağı istifadə olunur:
   • İmsak (Fajr): günəş bucağı -18° (üfüqdən aşağı)
   • Günəş (Sunrise): -0.833° (atmosfer refraksiyası nəzərə alınaraq)
   • Zöhr (Dhuhr): günəş meridianı keçəndə (ən yüksək nöqtə)
   • Əsr (Asr): cismin kölgəsi = cismin uzunluğu + günortadakı kölgə (Şafi metodu)
   • Məğrib (İftar): -0.833° (günəş batımı)
   • İşa: günəş bucağı -17°

Azərbaycan üçün vaxt zonası GMT+4 istifadə olunur. Hesablamalar ±1-2 dəqiqə dəqiqliklə aparılır.`}
      relatedIds={["zakat", "age", "date-difference", "timezone"]}
    >
      {/* Countdown Timer */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-wider opacity-80 mb-1">
          {countdown.label}
        </p>
        <p className="text-4xl sm:text-5xl font-bold font-mono tracking-widest">
          {countdown.time}
        </p>
        <p className="text-sm mt-2 opacity-80">qalıb</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şəhər
          </label>
          <select
            value={cityIndex}
            onChange={(e) => setCityIndex(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          >
            {cities.map((c, i) => (
              <option key={c.name} value={i}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tarix
          </label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          />
        </div>
      </div>

      {/* Prayer Time Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {prayerCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} ${card.text} rounded-xl p-4 text-center shadow-md ${
              card.prominent ? "ring-2 ring-emerald-300 ring-offset-2" : ""
            } transition-transform hover:scale-105`}
          >
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">
              {card.sub}
            </p>
            <p className="text-lg font-bold mt-0.5">{card.label}</p>
            <p className="text-2xl sm:text-3xl font-bold font-mono mt-2">
              {card.time}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Table Toggle */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowMonth(!showMonth)}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              showMonth ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {showMonth ? "Gizlət" : "Bütün ay"}
        </button>
      </div>

      {/* Monthly Table */}
      {showMonth && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-left font-semibold">Gün</th>
                <th className="px-4 py-3 text-center font-semibold">
                  İmsak
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  İftar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthData.map((row) => {
                const isToday =
                  row.day === dateParts.day;
                return (
                  <tr
                    key={row.day}
                    className={
                      isToday
                        ? "bg-emerald-50 font-semibold"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-2.5 text-left">
                      {row.day} {monthNames[dateParts.month - 1]}
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono">
                      {row.imsak}
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-emerald-700">
                      {row.iftar}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CalculatorLayout>
  );
}
