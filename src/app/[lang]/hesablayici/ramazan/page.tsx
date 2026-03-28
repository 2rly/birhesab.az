"use client";

import CalculatorLayout from "@/components/CalculatorLayout";
import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface City {
  name: Record<Lang, string>;
  lat: number;
  lng: number;
}

const cities: City[] = [
  { name: { az: "Bakı", en: "Baku", ru: "Баку" }, lat: 40.4093, lng: 49.8671 },
  { name: { az: "Gəncə", en: "Ganja", ru: "Гянджа" }, lat: 40.6828, lng: 46.3606 },
  { name: { az: "Sumqayıt", en: "Sumgait", ru: "Сумгаит" }, lat: 40.5855, lng: 49.6317 },
  { name: { az: "Mingəçevir", en: "Mingachevir", ru: "Мингечевир" }, lat: 40.7703, lng: 47.0594 },
  { name: { az: "Şirvan", en: "Shirvan", ru: "Ширван" }, lat: 39.9383, lng: 48.9206 },
  { name: { az: "Naxçıvan", en: "Nakhchivan", ru: "Нахчыван" }, lat: 39.2089, lng: 45.4122 },
  { name: { az: "Lənkəran", en: "Lankaran", ru: "Ленкорань" }, lat: 38.7533, lng: 48.8511 },
  { name: { az: "Yevlax", en: "Yevlakh", ru: "Евлах" }, lat: 40.6197, lng: 47.1503 },
  { name: { az: "Ağcabədi", en: "Aghjabadi", ru: "Агджабеди" }, lat: 40.0528, lng: 47.4614 },
  { name: { az: "Ağdam", en: "Aghdam", ru: "Агдам" }, lat: 39.9914, lng: 46.9936 },
  { name: { az: "Ağdaş", en: "Aghdash", ru: "Агдаш" }, lat: 40.6456, lng: 47.4750 },
  { name: { az: "Ağstafa", en: "Aghstafa", ru: "Агстафа" }, lat: 41.1194, lng: 45.4539 },
  { name: { az: "Ağsu", en: "Aghsu", ru: "Агсу" }, lat: 40.5683, lng: 48.3947 },
  { name: { az: "Astara", en: "Astara", ru: "Астара" }, lat: 38.4561, lng: 48.8728 },
  { name: { az: "Balakən", en: "Balakan", ru: "Балакен" }, lat: 41.7239, lng: 46.4044 },
  { name: { az: "Beyləqan", en: "Beylagan", ru: "Бейлаган" }, lat: 39.7736, lng: 47.6156 },
  { name: { az: "Bərdə", en: "Barda", ru: "Барда" }, lat: 40.3744, lng: 47.1264 },
  { name: { az: "Biləsuvar", en: "Bilasuvar", ru: "Билясувар" }, lat: 39.4597, lng: 48.5442 },
  { name: { az: "Cəbrayıl", en: "Jabrayil", ru: "Джебраил" }, lat: 39.3986, lng: 47.0286 },
  { name: { az: "Cəlilabad", en: "Jalilabad", ru: "Джалилабад" }, lat: 39.2089, lng: 48.5100 },
  { name: { az: "Daşkəsən", en: "Dashkasan", ru: "Дашкесан" }, lat: 40.5208, lng: 46.0800 },
  { name: { az: "Füzuli", en: "Fuzuli", ru: "Физули" }, lat: 39.6003, lng: 47.1453 },
  { name: { az: "Gədəbəy", en: "Gadabay", ru: "Гедабек" }, lat: 40.5697, lng: 45.8106 },
  { name: { az: "Goranboy", en: "Goranboy", ru: "Горанбой" }, lat: 40.6100, lng: 46.7900 },
  { name: { az: "Göyçay", en: "Goychay", ru: "Гейчай" }, lat: 40.6536, lng: 47.7406 },
  { name: { az: "Göygöl", en: "Goygol", ru: "Гёйгёль" }, lat: 40.5867, lng: 46.3167 },
  { name: { az: "Hacıqabul", en: "Hajigabul", ru: "Гаджигабул" }, lat: 40.0394, lng: 48.9422 },
  { name: { az: "İmişli", en: "Imishli", ru: "Имишли" }, lat: 39.8694, lng: 48.0597 },
  { name: { az: "İsmayıllı", en: "Ismayilli", ru: "Исмаиллы" }, lat: 40.7872, lng: 48.1517 },
  { name: { az: "Kəlbəcər", en: "Kalbajar", ru: "Кельбаджар" }, lat: 40.1025, lng: 46.0364 },
  { name: { az: "Kürdəmir", en: "Kurdamir", ru: "Кюрдамир" }, lat: 40.3411, lng: 48.1614 },
  { name: { az: "Laçın", en: "Lachin", ru: "Лачин" }, lat: 39.6381, lng: 46.5461 },
  { name: { az: "Lerik", en: "Lerik", ru: "Лерик" }, lat: 38.7736, lng: 48.4150 },
  { name: { az: "Masallı", en: "Masalli", ru: "Масаллы" }, lat: 39.0342, lng: 48.6589 },
  { name: { az: "Neftçala", en: "Neftchala", ru: "Нефтчала" }, lat: 39.3778, lng: 49.2472 },
  { name: { az: "Oğuz", en: "Oghuz", ru: "Огуз" }, lat: 41.0711, lng: 47.4650 },
  { name: { az: "Ordubad", en: "Ordubad", ru: "Ордубад" }, lat: 38.9061, lng: 46.0231 },
  { name: { az: "Qax", en: "Gakh", ru: "Гах" }, lat: 41.4208, lng: 46.9219 },
  { name: { az: "Qazax", en: "Gazakh", ru: "Газах" }, lat: 41.0972, lng: 45.3658 },
  { name: { az: "Qəbələ", en: "Gabala", ru: "Габала" }, lat: 41.0436, lng: 47.8461 },
  { name: { az: "Qobustan", en: "Gobustan", ru: "Гобустан" }, lat: 40.5328, lng: 48.9269 },
  { name: { az: "Quba", en: "Guba", ru: "Губа" }, lat: 41.3611, lng: 48.5128 },
  { name: { az: "Qusar", en: "Gusar", ru: "Гусар" }, lat: 41.4275, lng: 48.4303 },
  { name: { az: "Saatlı", en: "Saatli", ru: "Саатлы" }, lat: 39.9319, lng: 48.3697 },
  { name: { az: "Sabirabad", en: "Sabirabad", ru: "Сабирабад" }, lat: 39.9881, lng: 48.4772 },
  { name: { az: "Salyan", en: "Salyan", ru: "Сальян" }, lat: 39.5942, lng: 48.9836 },
  { name: { az: "Samux", en: "Samukh", ru: "Самух" }, lat: 40.7617, lng: 46.4072 },
  { name: { az: "Siyəzən", en: "Siyazan", ru: "Сиязань" }, lat: 41.0781, lng: 49.1117 },
  { name: { az: "Şabran", en: "Shabran", ru: "Шабран" }, lat: 41.2161, lng: 48.8547 },
  { name: { az: "Şahbuz", en: "Shahbuz", ru: "Шахбуз" }, lat: 39.4078, lng: 45.5728 },
  { name: { az: "Şamaxı", en: "Shamakhi", ru: "Шамахы" }, lat: 40.6319, lng: 48.6364 },
  { name: { az: "Şəki", en: "Sheki", ru: "Шеки" }, lat: 41.1975, lng: 47.1706 },
  { name: { az: "Şəmkir", en: "Shamkir", ru: "Шамкир" }, lat: 40.8297, lng: 46.0178 },
  { name: { az: "Şərur", en: "Sharur", ru: "Шарур" }, lat: 39.5536, lng: 44.9819 },
  { name: { az: "Şuşa", en: "Shusha", ru: "Шуша" }, lat: 39.7586, lng: 46.7492 },
  { name: { az: "Tərtər", en: "Tartar", ru: "Тертер" }, lat: 40.3444, lng: 46.9308 },
  { name: { az: "Tovuz", en: "Tovuz", ru: "Товуз" }, lat: 40.9925, lng: 45.6283 },
  { name: { az: "Ucar", en: "Ujar", ru: "Уджар" }, lat: 40.5133, lng: 47.6536 },
  { name: { az: "Xaçmaz", en: "Khachmaz", ru: "Хачмаз" }, lat: 41.4589, lng: 48.8025 },
  { name: { az: "Xankəndi", en: "Khankendi", ru: "Ханкенди" }, lat: 39.8153, lng: 46.7519 },
  { name: { az: "Xırdalan", en: "Khirdalan", ru: "Хырдалан" }, lat: 40.4486, lng: 49.7553 },
  { name: { az: "Xızı", en: "Khizi", ru: "Хызы" }, lat: 40.9100, lng: 49.0700 },
  { name: { az: "Yardımlı", en: "Yardimli", ru: "Ярдымлы" }, lat: 38.9058, lng: 48.2417 },
  { name: { az: "Zaqatala", en: "Zagatala", ru: "Загатала" }, lat: 41.6031, lng: 46.6361 },
  { name: { az: "Zəngilan", en: "Zangilan", ru: "Зангилан" }, lat: 39.0853, lng: 46.6642 },
  { name: { az: "Zərdab", en: "Zardab", ru: "Зардоб" }, lat: 40.2147, lng: 47.7139 },
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
  const declination = toDeg(
    Math.asin(Math.sin(toRad(obliquity)) * Math.sin(toRad(sunLon)))
  );
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

function calcAsrTime(
  lat: number,
  lng: number,
  declination: number,
  eqTime: number
): number {
  const latRad = toRad(lat);
  const decRad = toRad(declination);
  const noonAlt = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad)
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

const pageTranslations = {
  az: {
    title: "Ramazan İmsakiyyəsi",
    description: "İmsak, iftar və namaz vaxtları — Azərbaycan şəhərləri üzrə",
    breadcrumbCategory: "Din",
    breadcrumbLabel: "Ramazan İmsakiyyəsi",
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
  },
  en: {
    title: "Ramadan Imsakiyyah",
    description: "Imsak, iftar and prayer times — for cities of Azerbaijan",
    breadcrumbCategory: "Religion",
    breadcrumbLabel: "Ramadan Imsakiyyah",
    formulaTitle: "How are prayer times calculated?",
    formulaContent: `Prayer times are calculated using astronomical formulas based on the sun's angle from the horizon.

1. Julian day number is calculated from the date
2. Sun's declination and equation of time are found
3. Specific sun angles are used for each prayer time:
   • Imsak (Fajr): sun angle -18° (below horizon)
   • Sunrise: -0.833° (accounting for atmospheric refraction)
   • Dhuhr: when sun crosses the meridian (highest point)
   • Asr: shadow length = object length + noon shadow (Shafi method)
   • Maghrib (Iftar): -0.833° (sunset)
   • Isha: sun angle -17°

GMT+4 time zone is used for Azerbaijan. Calculations are accurate to ±1-2 minutes.`,
    toImsak: "To Imsak",
    toIftar: "To Iftar",
    remaining: "remaining",
    city: "City",
    date: "Date",
    imsak: "Imsak",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    fajr: "Fajr",
    sunriseSub: "Sunrise",
    dhuhrSub: "Dhuhr",
    asrSub: "Asr",
    iftarSub: "Iftar",
    ishaSub: "Isha",
    hide: "Hide",
    showMonth: "Full month",
    dayColumn: "Day",
    imsakColumn: "Imsak",
    iftarColumn: "Iftar",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
  ru: {
    title: "Рамадан Имсакия",
    description: "Имсак, ифтар и время намаза — по городам Азербайджана",
    breadcrumbCategory: "Религия",
    breadcrumbLabel: "Рамадан Имсакия",
    formulaTitle: "Как рассчитывается время намаза?",
    formulaContent: `Время намаза рассчитывается с помощью астрономических формул на основе угла солнца от горизонта.

1. Юлианский номер дня вычисляется из даты
2. Определяются склонение солнца и уравнение времени
3. Для каждого времени намаза используется определённый угол солнца:
   • Имсак (Фаджр): угол солнца -18° (ниже горизонта)
   • Восход: -0.833° (с учётом атмосферной рефракции)
   • Зухр: когда солнце пересекает меридиан (наивысшая точка)
   • Аср: длина тени = длина объекта + тень в полдень (метод Шафии)
   • Магриб (Ифтар): -0.833° (закат)
   • Иша: угол солнца -17°

Для Азербайджана используется часовой пояс GMT+4. Расчёты точны до ±1-2 минут.`,
    toImsak: "До имсака",
    toIftar: "До ифтара",
    remaining: "осталось",
    city: "Город",
    date: "Дата",
    imsak: "Имсак",
    sunrise: "Восход",
    dhuhr: "Зухр",
    asr: "Аср",
    maghrib: "Магриб",
    isha: "Иша",
    fajr: "Фаджр",
    sunriseSub: "Восход",
    dhuhrSub: "Зухр",
    asrSub: "Аср",
    iftarSub: "Ифтар",
    ishaSub: "Иша",
    hide: "Скрыть",
    showMonth: "Весь месяц",
    dayColumn: "День",
    imsakColumn: "Имсак",
    iftarColumn: "Ифтар",
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  },
};

export default function RamazanPage() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

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
      targetSec = imsakSec;
      label = pt.toImsak;
    } else if (currentMinutes < iftarMin) {
      targetSec = iftarSec;
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
      const tomorrowImsakMin = timeToMinutes(tomorrowTimes.imsak);
      targetSec = tomorrowImsakMin * 60 + 24 * 3600;
      label = pt.toImsak;
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
  }, [now, todayTimes, city, pt.toImsak, pt.toIftar]);

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
      label: pt.imsak,
      sub: pt.fajr,
      time: times.imsak,
      bg: "bg-indigo-900",
      text: "text-white",
      border: "border-indigo-800",
    },
    {
      label: pt.sunrise,
      sub: pt.sunriseSub,
      time: times.gunesh,
      bg: "bg-orange-500",
      text: "text-white",
      border: "border-orange-400",
    },
    {
      label: pt.dhuhr,
      sub: pt.dhuhrSub,
      time: times.zohr,
      bg: "bg-yellow-400",
      text: "text-yellow-900",
      border: "border-yellow-300",
    },
    {
      label: pt.asr,
      sub: pt.asrSub,
      time: times.asr,
      bg: "bg-amber-500",
      text: "text-white",
      border: "border-amber-400",
    },
    {
      label: pt.maghrib,
      sub: pt.iftarSub,
      time: times.meghrib,
      bg: "bg-emerald-600",
      text: "text-white",
      border: "border-emerald-500",
      prominent: true,
    },
    {
      label: pt.isha,
      sub: pt.ishaSub,
      time: times.isha,
      bg: "bg-blue-900",
      text: "text-white",
      border: "border-blue-800",
    },
  ];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=religion" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
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
        <p className="text-sm mt-2 opacity-80">{pt.remaining}</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.city}
          </label>
          <select
            value={cityIndex}
            onChange={(e) => setCityIndex(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          >
            {cities.map((c, i) => (
              <option key={i} value={i}>
                {c.name[lang]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.date}
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
          {showMonth ? pt.hide : pt.showMonth}
        </button>
      </div>

      {/* Monthly Table */}
      {showMonth && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-left font-semibold">{pt.dayColumn}</th>
                <th className="px-4 py-3 text-center font-semibold">
                  {pt.imsakColumn}
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  {pt.iftarColumn}
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
                      {row.day} {pt.months[dateParts.month - 1]}
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
