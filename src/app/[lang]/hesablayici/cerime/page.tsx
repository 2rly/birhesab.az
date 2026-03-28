"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface Fine {
  id: number;
  article: string;
  description: Record<Lang, string>;
  amount: number;
  amountMax?: number;
  points?: number;
  note?: Record<Lang, string>;
}

const fines: Fine[] = [
  // Madd@ 327
  { id: 1, article: "327.1", description: { az: "Yol nişanlarının və ya yolların hərəkət hissəsinin işarələrinin tələblərinə riayət edilməməsi, NV-nin yolda yerləşdirilməsi, araməsafəsi, yedəyə alma, yük daşıma, sürmə təlimi, yaşayış zonasında hərəkət, ötmə/manevr qaydaları, səkil/yolun çiyni ilə hərəkət", en: "Non-compliance with road signs/markings, vehicle placement, towing, cargo, driving lessons, residential zone, overtaking/maneuvering rules", ru: "Несоблюдение дорожных знаков/разметки, размещение ТС, буксировка, перевозка грузов, учебная езда, движение в жилой зоне, обгон/маневрирование" }, amount: 40 },
  { id: 2, article: "327.1-1", description: { az: "Ümumi istifadədə olan NV üçün nəzərdə tutulmuş hərəkət zolağında digər NV-lərin hərəkət etməsi", en: "Driving in bus/public transport lane", ru: "Движение по полосе для общественного транспорта" }, amount: 100, points: 2 },
  { id: 3, article: "327.1-2", description: { az: "Velosiped yollarında velosiped və kiçik elektrik NV istisna olmaqla, digər NV-lərin hərəkət etməsi", en: "Driving on bicycle lanes (except bicycles and small EVs)", ru: "Движение по велосипедным дорожкам (кроме велосипедов и малых ЭТС)" }, amount: 100, points: 2 },
  { id: 4, article: "327.2", description: { az: "Svetoforun/nizamlayıcının qadağanedici işarəsi, 3.1 nişanının pozulması, sərnişin daşıma qaydası, əks istiqamətli ötmə, yolayrıcını keçmə, 1.1/1.3/1.11 xətlərinin pozulması ilə sola/geriyə dönmə", en: "Running red light, violating 3.1 sign, passenger rules, overtaking into oncoming, intersection rules, crossing 1.1/1.3/1.11 lines", ru: "Проезд на красный, нарушение знака 3.1, перевозка пассажиров, обгон по встречной, проезд перекрёстка, пересечение линий 1.1/1.3/1.11" }, amount: 100, points: 3 },
  { id: 5, article: "327.3", description: { az: "Dəmiryol keçidlərindən keçmə qaydalarının pozulması, müvafiq orqan əməkdaşının saxlamaq tələbinin yerinə yetirilməməsi", en: "Violation of railway crossing rules, failure to stop when ordered by officer", ru: "Нарушение правил ж/д переезда, неподчинение требованию остановки" }, amount: 100, points: 4 },
  { id: 6, article: "327.4", description: { az: "Birtərəfli hərəkət yolunda əks istiqamətdə hərəkət, 1.1/1.3/1.11 xətlərini pozmaqla əks istiqamətli zolağa keçmə", en: "Wrong-way driving on one-way road, crossing into oncoming lane violating 1.1/1.3/1.11 lines", ru: "Встречное движение на односторонней дороге, выезд на встречку с нарушением линий 1.1/1.3/1.11" }, amount: 150, points: 4 },
  { id: 7, article: "327.5", description: { az: "Avtomagistrallarda sürəti 50 km/s-dan az NV, 3.5t+ yük avtomobilinin 2-ci zolaqdan sonrakına keçməsi, geriyə dönmə/hərəkət, sürmə təlimi", en: "Slow vehicles on motorway, heavy trucks beyond 2nd lane, U-turn/reverse, driving lessons on motorway", ru: "Тихоходные ТС на автомагистрали, грузовики 3.5т+ дальше 2-й полосы, разворот/задний ход, учебная езда" }, amount: 100, points: 4 },
  { id: 8, article: "327.6", description: { az: "YHQ pozan sürücünün yol-nəqliyyat hadisəsi yerindən yayınması", en: "Traffic violator fleeing accident scene", ru: "Уклонение нарушителя ПДД с места ДТП" }, amount: 300 },
  { id: 9, article: "327.8", description: { az: "327.1–327.6, 328, 330-cu maddələrdəki xətalar nəticəsində yüngül bədən xəsarəti", en: "Minor bodily harm caused by violations under articles 327.1–327.6, 328, 330", ru: "Лёгкий вред здоровью в результате нарушений по ст. 327.1–327.6, 328, 330" }, amount: 200, note: { az: "və ya idarəetmə hüququ 1 ilədək məhdudlaşdırılır", en: "or driving rights restricted for up to 1 year", ru: "или ограничение права управления до 1 года" } },

  // Maddə 328 — Sürət
  { id: 10, article: "328.1", description: { az: "Sürət həddini 10–20 km/s aşma", en: "Exceeding speed limit by 10–20 km/h", ru: "Превышение скорости на 10–20 км/ч" }, amount: 10 },
  { id: 11, article: "328.2", description: { az: "Sürət həddini 21–40 km/s aşma", en: "Exceeding speed limit by 21–40 km/h", ru: "Превышение скорости на 21–40 км/ч" }, amount: 50, points: 2 },
  { id: 12, article: "328.3", description: { az: "Sürət həddini 41–60 km/s aşma", en: "Exceeding speed limit by 41–60 km/h", ru: "Превышение скорости на 41–60 км/ч" }, amount: 200, points: 3 },
  { id: 13, article: "328.4", description: { az: "Sürət həddini 61 km/s-dan çox aşma", en: "Exceeding speed limit by more than 60 km/h", ru: "Превышение скорости более чем на 60 км/ч" }, amount: 300, points: 4 },

  // Maddə 329 — Kəmər, dəbilqə
  { id: 14, article: "329.1", description: { az: "Təhlükəsizlik kəmərini bağlamadan NV idarə etmə", en: "Driving without wearing seatbelt", ru: "Управление ТС без ремня безопасности" }, amount: 40 },
  { id: 15, article: "329.2", description: { az: "Motodəbilqə taxmadan/düymələmədən motosikleti idarə etmə, dəbilqəsiz sərnişin daşımaq", en: "Riding motorcycle without helmet, carrying passengers without helmet", ru: "Управление мотоциклом без шлема, перевозка пассажиров без шлема" }, amount: 40 },
  { id: 16, article: "329.3", description: { az: "İşıq cihazlarından və səs siqnallarından istifadə qaydalarının pozulması", en: "Violation of rules on lights and sound signals", ru: "Нарушение правил использования световых приборов и звуковых сигналов" }, amount: 30 },

  // Maddə 330 — Piyadaya yol verilməməsi
  { id: 17, article: "330.0", description: { az: "Sürücü tərəfindən piyadaya yol verilməməsi (nizamlanmayan keçid, sağa/sola dönərkən)", en: "Not yielding to pedestrians (unregulated crossing, turning)", ru: "Непредоставление преимущества пешеходу (нерегулируемый переход, поворот)" }, amount: 50 },

  // Maddə 331 — Keçid üstünlüyü
  { id: 18, article: "331", description: { az: "Xüsusi səs/işıq siqnallı NV-lərə yol verilməməsi, mütəşəkkil nəqliyyat dəstəsinə qoşulma", en: "Not yielding to emergency vehicles, joining organized convoy", ru: "Непредоставление преимущества спецтранспорту, присоединение к колонне" }, amount: 100, points: 3 },

  // Maddə 332 — İdarəetmə hüququ olmadan
  { id: 19, article: "332.1", description: { az: "NV-ni etibarnamə olmadan idarə etmə (sahibi yanında olmadıqda)", en: "Driving without power of attorney (owner not present)", ru: "Управление ТС без доверенности (владелец отсутствует)" }, amount: 40 },
  { id: 20, article: "332.2", description: { az: "NV idarə etmək hüququ olmadan NV idarə etmə", en: "Driving without a valid license", ru: "Управление ТС без водительского удостоверения" }, amount: 200 },
  { id: 21, article: "332.3", description: { az: "332.2-nin 1 il ərzində təkrarı və ya hüququ məhdudlaşdırılmış şəxs tərəfindən idarə", en: "Repeat of 332.2 within 1 year or driving with restricted license", ru: "Повтор 332.2 в течение 1 года или управление с ограниченными правами" }, amount: 400 },
  { id: 22, article: "332.4", description: { az: "332.2 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", en: "Minor bodily harm or material damage from driving without license", ru: "Лёгкий вред здоровью или материальный ущерб при управлении без прав" }, amount: 500, note: { az: "və ya 1 ayadək inzibati həbs", en: "or up to 1 month administrative arrest", ru: "или адм. арест до 1 месяца" } },
  { id: 23, article: "332.5", description: { az: "Ümumi istifadədə olan NV-ni hüququ olmadan sərnişin daşımaqla idarə etmə", en: "Driving public transport without license with passengers", ru: "Управление общественным ТС без прав с пассажирами" }, amount: 0, note: { az: "15 gündən 1 ayadək inzibati həbs", en: "15 days to 1 month administrative arrest", ru: "адм. арест от 15 дней до 1 месяца" } },
  { id: 24, article: "332.6", description: { az: "332.5-in 1 il ərzində təkrarı", en: "Repeat of 332.5 within 1 year", ru: "Повтор 332.5 в течение 1 года" }, amount: 0, note: { az: "1 aydan 2 ayadək inzibati həbs", en: "1 to 2 months administrative arrest", ru: "адм. арест от 1 до 2 месяцев" } },
  { id: 25, article: "332.7", description: { az: "332.5 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", en: "Minor harm or material damage from 332.5", ru: "Лёгкий вред или мат. ущерб по 332.5" }, amount: 0, note: { az: "2 aydan 3 ayadək inzibati həbs", en: "2 to 3 months administrative arrest", ru: "адм. арест от 2 до 3 месяцев" } },

  // Maddə 333 — Alkoqol
  { id: 26, article: "333.1", description: { az: "Sərxoş vəziyyətdə NV idarə etmə (hüququ olan şəxs)", en: "Driving under influence of alcohol (licensed driver)", ru: "Управление ТС в нетрезвом состоянии (с правами)" }, amount: 400, note: { az: "və ya hüquq 6 aydan 1 ilədək məhdudlaşdırılır", en: "or license restricted for 6 months to 1 year", ru: "или ограничение прав от 6 мес. до 1 года" } },
  { id: 27, article: "333.2", description: { az: "333.1-in 1 il ərzində təkrarı", en: "Repeat of 333.1 within 1 year", ru: "Повтор 333.1 в течение 1 года" }, amount: 500, note: { az: "hüquq 2 il məhdudlaşdırılır və ya 15 günədək həbs", en: "license restricted 2 years or up to 15 days arrest", ru: "ограничение прав на 2 года или арест до 15 дней" } },
  { id: 28, article: "333.3", description: { az: "333.1 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", en: "Minor harm or material damage from drunk driving", ru: "Лёгкий вред или мат. ущерб от пьяного вождения" }, amount: 700, note: { az: "hüquq 2 il məhdudlaşdırılır və ya 15 gün–1 ay həbs", en: "license restricted 2 years or 15 days–1 month arrest", ru: "ограничение прав на 2 года или арест 15 дней–1 мес." } },
  { id: 29, article: "333.4", description: { az: "Ümumi NV-ni sərxoş vəziyyətdə sərnişin daşımaqla idarə etmə", en: "Driving public transport drunk with passengers", ru: "Управление общественным ТС в нетрезвом виде с пассажирами" }, amount: 0, note: { az: "hüquq 2 il + 15 gün–1 ay həbs", en: "license restricted 2 years + 15 days–1 month arrest", ru: "ограничение прав 2 года + арест 15 дней–1 мес." } },
  { id: 30, article: "333.5", description: { az: "333.4 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", en: "Minor harm or damage from 333.4", ru: "Лёгкий вред или ущерб по 333.4" }, amount: 0, note: { az: "hüquq 2 il + 2–3 ay həbs", en: "license restricted 2 years + 2–3 months arrest", ru: "ограничение прав 2 года + арест 2–3 мес." } },

  // Maddə 333-1 — Narkotik
  { id: 31, article: "333-1.1", description: { az: "Narkotik/psixotrop maddələrin təsiri ilə NV idarə etmə (hüququ olan)", en: "Driving under drugs/psychotropic substances (licensed)", ru: "Управление ТС под наркотиками/психотропами (с правами)" }, amount: 600, note: { az: "və ya hüquq 6 aydan 1 ilədək məhdudlaşdırılır", en: "or license restricted 6 months to 1 year", ru: "или ограничение прав от 6 мес. до 1 года" } },
  { id: 32, article: "333-1.2", description: { az: "333-1.1-in 1 il ərzində təkrarı", en: "Repeat of 333-1.1 within 1 year", ru: "Повтор 333-1.1 в течение 1 года" }, amount: 800, note: { az: "hüquq 2 il + 15 gün–1 ay həbs", en: "license restricted 2 years + 15 days–1 month arrest", ru: "ограничение прав 2 года + арест 15 дней–1 мес." } },
  { id: 33, article: "333-1.3", description: { az: "333-1.1 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", en: "Minor harm or damage from 333-1.1", ru: "Лёгкий вред или ущерб по 333-1.1" }, amount: 900, note: { az: "hüquq 2 il + 1–2 ay həbs", en: "license restricted 2 years + 1–2 months arrest", ru: "ограничение прав 2 года + арест 1–2 мес." } },
  { id: 34, article: "333-1.4", description: { az: "Ümumi NV-ni narkotik ilə sərnişin daşımaqla idarə etmə", en: "Driving public transport under drugs with passengers", ru: "Управление общественным ТС под наркотиками с пассажирами" }, amount: 0, note: { az: "hüquq 2 il + 1–2 ay həbs", en: "license restricted 2 years + 1–2 months arrest", ru: "ограничение прав 2 года + арест 1–2 мес." } },
  { id: 35, article: "333-1.5", description: { az: "333-1.4 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", en: "Minor harm or damage from 333-1.4", ru: "Лёгкий вред или ущерб по 333-1.4" }, amount: 0, note: { az: "hüquq 2 il + 2–3 ay həbs", en: "license restricted 2 years + 2–3 months arrest", ru: "ограничение прав 2 года + арест 2–3 мес." } },

  // Maddə 334 — Hüququ olmadan + alkoqol
  { id: 36, article: "334.1", description: { az: "Hüququ olmayan şəxsin sərxoş vəziyyətdə NV idarə etməsi", en: "Unlicensed drunk driving", ru: "Управление ТС в нетрезвом виде без прав" }, amount: 500, note: { az: "və ya 15 günədək həbs", en: "or up to 15 days arrest", ru: "или арест до 15 дней" } },
  { id: 37, article: "334.2", description: { az: "334.1-in 1 il ərzində təkrarı", en: "Repeat of 334.1 within 1 year", ru: "Повтор 334.1 в течение 1 года" }, amount: 0, note: { az: "15 gündən 1 ayadək həbs", en: "15 days to 1 month arrest", ru: "арест от 15 дней до 1 месяца" } },
  { id: 38, article: "334.3", description: { az: "334.1 nəticəsində xəsarət və ya maddi zərər", en: "Harm or damage from 334.1", ru: "Вред или ущерб по 334.1" }, amount: 800, note: { az: "və ya 1–2 ay həbs", en: "or 1–2 months arrest", ru: "или арест 1–2 мес." } },
  { id: 39, article: "334.4", description: { az: "Ümumi NV hüququ olmadan sərxoş sərnişin daşımaqla idarə", en: "Unlicensed drunk driving of public transport with passengers", ru: "Управление общ. ТС без прав в нетрезвом виде с пассажирами" }, amount: 0, note: { az: "1–2 ay həbs", en: "1–2 months arrest", ru: "арест 1–2 мес." } },
  { id: 40, article: "334.5", description: { az: "334.4-ün təkrarı və ya nəticəsində xəsarət/zərər", en: "Repeat of 334.4 or harm/damage from it", ru: "Повтор 334.4 или вред/ущерб" }, amount: 0, note: { az: "2–3 ay həbs", en: "2–3 months arrest", ru: "арест 2–3 мес." } },

  // Maddə 334-1 — Hüququ olmadan + narkotik
  { id: 41, article: "334-1.1", description: { az: "Hüququ olmayan şəxsin narkotik təsiri ilə NV idarə etməsi", en: "Unlicensed driving under drugs", ru: "Управление ТС без прав под наркотиками" }, amount: 800, note: { az: "və ya 15 günədək həbs", en: "or up to 15 days arrest", ru: "или арест до 15 дней" } },
  { id: 42, article: "334-1.2", description: { az: "334-1.1-in 1 il ərzində təkrarı", en: "Repeat of 334-1.1 within 1 year", ru: "Повтор 334-1.1 в течение 1 года" }, amount: 0, note: { az: "1–2 ay həbs", en: "1–2 months arrest", ru: "арест 1–2 мес." } },
  { id: 43, article: "334-1.3", description: { az: "334-1.1 nəticəsində xəsarət və ya maddi zərər", en: "Harm or damage from 334-1.1", ru: "Вред или ущерб по 334-1.1" }, amount: 1000, note: { az: "və ya 1–3 ay həbs", en: "or 1–3 months arrest", ru: "или арест 1–3 мес." } },
  { id: 44, article: "334-1.4", description: { az: "Ümumi NV narkotik ilə hüququ olmadan sərnişin daşımaqla idarə", en: "Unlicensed drugged driving of public transport", ru: "Управление общ. ТС без прав под наркотиками с пассажирами" }, amount: 0, note: { az: "1–3 ay həbs", en: "1–3 months arrest", ru: "арест 1–3 мес." } },
  { id: 45, article: "334-1.5", description: { az: "334-1.4-ün təkrarı və ya nəticəsində xəsarət/zərər", en: "Repeat of 334-1.4 or harm/damage", ru: "Повтор 334-1.4 или вред/ущерб" }, amount: 0, note: { az: "2–3 ay həbs", en: "2–3 months arrest", ru: "арест 2–3 мес." } },

  // Maddə 335 — NV hüququ olmayan şəxsə vermə
  { id: 46, article: "335.1", description: { az: "NV-ni idarəetmə hüququ olmayan şəxsə vermə", en: "Letting unlicensed person drive", ru: "Передача ТС лицу без прав" }, amount: 60, note: { az: "Vəzifəli: 200, Hüquqi: 2000 AZN", en: "Officials: 200, Legal entities: 2000 AZN", ru: "Должн.: 200, Юр. лица: 2000 AZN" } },
  { id: 47, article: "335.2", description: { az: "335.1-in 1 il ərzində təkrarı", en: "Repeat of 335.1 within 1 year", ru: "Повтор 335.1 в течение 1 года" }, amount: 100, note: { az: "Vəzifəli: 300, Hüquqi: 3000 AZN", en: "Officials: 300, Legal entities: 3000 AZN", ru: "Должн.: 300, Юр. лица: 3000 AZN" } },
  { id: 48, article: "335.3", description: { az: "335.1 nəticəsində fiziki/maddi zərər", en: "Physical/material damage from 335.1", ru: "Физ./мат. вред по 335.1" }, amount: 180, note: { az: "Vəzifəli: 500, Hüquqi: 5000 AZN", en: "Officials: 500, Legal entities: 5000 AZN", ru: "Должн.: 500, Юр. лица: 5000 AZN" } },
  { id: 49, article: "335.4", description: { az: "Ümumi NV-ni hüququ olmayan şəxsə sərnişin daşımaq üçün vermə", en: "Letting unlicensed person drive public transport", ru: "Передача общ. ТС лицу без прав для перевозки пассажиров" }, amount: 200, note: { az: "Vəzifəli: 500, Hüquqi: 3000 AZN", en: "Officials: 500, Legal entities: 3000 AZN", ru: "Должн.: 500, Юр. лица: 3000 AZN" } },

  // Maddə 336 — Sərxoş şəxsə NV vermə
  { id: 50, article: "336.1", description: { az: "Sərxoş olduğunu bilə-bilə NV-ni həmin şəxsə vermə", en: "Letting a known drunk person drive", ru: "Передача ТС заведомо пьяному лицу" }, amount: 100, note: { az: "Vəzifəli: 300, Hüquqi: 3000 AZN", en: "Officials: 300, Legal entities: 3000 AZN", ru: "Должн.: 300, Юр. лица: 3000 AZN" } },
  { id: 51, article: "336.2", description: { az: "336.1-in 1 il ərzində təkrarı", en: "Repeat of 336.1 within 1 year", ru: "Повтор 336.1 в течение 1 года" }, amount: 200, note: { az: "Vəzifəli: 400, Hüquqi: 4000 AZN", en: "Officials: 400, Legal entities: 4000 AZN", ru: "Должн.: 400, Юр. лица: 4000 AZN" } },
  { id: 52, article: "336.3", description: { az: "336.1 nəticəsində fiziki/maddi zərər", en: "Physical/material damage from 336.1", ru: "Физ./мат. вред по 336.1" }, amount: 300, note: { az: "Vəzifəli: 600, Hüquqi: 6000 AZN", en: "Officials: 600, Legal entities: 6000 AZN", ru: "Должн.: 600, Юр. лица: 6000 AZN" } },

  // Maddə 337 — Hüququ olmayan+sərxoş şəxsə vermə
  { id: 53, article: "337.1", description: { az: "Hüququ olmadığını və sərxoş olduğunu bilə-bilə NV-ni həmin şəxsə vermə", en: "Letting known unlicensed drunk person drive", ru: "Передача ТС заведомо бесправному пьяному лицу" }, amount: 200, note: { az: "Vəzifəli: 400, Hüquqi: 4000 AZN", en: "Officials: 400, Legal entities: 4000 AZN", ru: "Должн.: 400, Юр. лица: 4000 AZN" } },
  { id: 54, article: "337.2", description: { az: "337.1-in 1 il ərzində təkrarı", en: "Repeat of 337.1 within 1 year", ru: "Повтор 337.1 в течение 1 года" }, amount: 300, note: { az: "Vəzifəli: 600, Hüquqi: 6000 AZN", en: "Officials: 600, Legal entities: 6000 AZN", ru: "Должн.: 600, Юр. лица: 6000 AZN" } },
  { id: 55, article: "337.3", description: { az: "337.1 nəticəsində fiziki/maddi zərər", en: "Physical/material damage from 337.1", ru: "Физ./мат. вред по 337.1" }, amount: 400, note: { az: "Vəzifəli: 800, Hüquqi: 8000 AZN", en: "Officials: 800, Legal entities: 8000 AZN", ru: "Должн.: 800, Юр. лица: 8000 AZN" } },

  // Maddə 338 — Piyadalar və digərləri
  { id: 56, article: "338.1", description: { az: "Piyadanın YHQ pozması (svetofor, qəflətən çıxma, xüsusi siqnallı NV)", en: "Pedestrian traffic violation (traffic light, sudden crossing, emergency vehicle)", ru: "Нарушение ПДД пешеходом (светофор, внезапный выход, спецтранспорт)" }, amount: 20 },
  { id: 57, article: "338.2", description: { az: "Piyadanın yolun hərəkət hissəsini/dəmiryol keçidini müəyyən olunmayan yerdən keçməsi", en: "Pedestrian crossing road/railway at unmarked location", ru: "Переход дороги/ж/д вне установленного места" }, amount: 20 },
  { id: 58, article: "338.2-1", description: { az: "Sürət həddi 80+ km/s yolda piyadanın müəyyən yerdən kənar keçməsi", en: "Pedestrian jaywalking on 80+ km/h road", ru: "Пешеход переходит дорогу вне места на трассе 80+ км/ч" }, amount: 40 },
  { id: 59, article: "338.3", description: { az: "Sərnişinlərin minmə/düşmə qaydalarının pozulması, kəmər bağlanmaması, dəbilqə geyilməməsi, əşya atılması, sürücünü yayındırma", en: "Passenger violations: boarding/alighting, seatbelt, helmet, littering, distracting driver", ru: "Нарушения пассажира: посадка/высадка, ремень, шлем, мусор, отвлечение водителя" }, amount: 30 },
  { id: 60, article: "338.4", description: { az: "Velosipedçilər və moped sürücüləri tərəfindən YHQ pozulması", en: "Cyclist/moped traffic violations", ru: "Нарушения ПДД велосипедистами/мопедами" }, amount: 40 },
  { id: 61, article: "338.4-1", description: { az: "Kiçik elektrik nəqliyyat vasitələrini idarə edənlər tərəfindən YHQ pozulması", en: "Small electric vehicle traffic violations", ru: "Нарушения ПДД малыми электро ТС" }, amount: 40 },
  { id: 62, article: "338.5", description: { az: "At arabası/kirşə idarə edənlər və mal-qara ötürənlər tərəfindən YHQ pozulması", en: "Horse cart drivers and cattle herders traffic violations", ru: "Нарушения ПДД повозками и погонщиками скота" }, amount: 40 },
  { id: 63, article: "338.6", description: { az: "338.4/338.5-dəki xətaların sərxoş vəziyyətdə törədilməsi", en: "338.4/338.5 violations committed while intoxicated", ru: "Нарушения по 338.4/338.5 в нетрезвом виде" }, amount: 70 },
  { id: 64, article: "338.7", description: { az: "338.4–338.6 nəticəsində yüngül xəsarət və ya maddi zərər", en: "Minor harm or material damage from 338.4–338.6", ru: "Лёгкий вред или мат. ущерб по 338.4–338.6" }, amount: 80, amountMax: 100 },

  // Maddə 339 — Qeydiyyat/texniki baxış
  { id: 65, article: "339.1", description: { az: "NV-ni dövlət qeydiyyatından keçirmədən idarə etmə, təkrar qeydiyyat, özgəninkiləşdirmə qaydalarını pozma", en: "Driving unregistered vehicle, re-registration violations", ru: "Управление незарегистрированным ТС, нарушение перерегистрации" }, amount: 50, note: { az: "Vəzifəli: 100, Hüquqi: 300 AZN", en: "Officials: 100, Legal entities: 300 AZN", ru: "Должн.: 100, Юр. лица: 300 AZN" } },
  { id: 66, article: "339.1-1", description: { az: "NV-ni texniki baxışdan keçirmədən idarə etmə", en: "Driving without passing technical inspection", ru: "Управление ТС без техосмотра" }, amount: 50 },
  { id: 67, article: "339.2", description: { az: "Qeydiyyat üçün qanunsuz sənəd tələbi, süründürməçilik, sənədin həqiqətə uyğun olmaması", en: "Illegal document demands for registration, bureaucratic delays, false documents", ru: "Незаконные требования документов для регистрации, волокита, несоответствие документов" }, amount: 150, amountMax: 200 },
  { id: 68, article: "339.3", description: { az: "Sürücülük vəsiqəsi ilə bağlı süründürməçilik, imtahana əsassız buraxmama", en: "Driver's license bureaucratic delays, groundless exam refusal", ru: "Волокита с водительскими правами, необоснованный отказ в допуске к экзамену" }, amount: 200, amountMax: 250 },
  { id: 69, article: "339.4", description: { az: "Cərimənin ödəniş sistemindən istifadə etmədən qanunsuz bilavasitə alınması", en: "Illegal direct collection of fines without payment system", ru: "Незаконный прямой сбор штрафов без системы оплаты" }, amount: 300, amountMax: 500 },
  { id: 70, article: "339.5", description: { az: "Protokolun/qərarın vaxtında informasiya sisteminə göndərilməməsi", en: "Failure to send protocol/decision to information system on time", ru: "Несвоевременная отправка протокола/решения в информационную систему" }, amount: 500, amountMax: 700 },

  // Maddə 342 — İstismar qaydaları
  { id: 71, article: "342.1", description: { az: "NV istismar qaydalarının pozulması (qapı bağlanmaması, nişanlar, su sıçratma, palçıq, nişanın təmiz saxlanmaması, əlil piyadaya dayanmama)", en: "Vehicle operation violations (doors, plates, splashing, mud, dirty plates, not stopping for blind pedestrian)", ru: "Нарушения эксплуатации ТС (двери, знаки, брызги, грязь, грязные номера, непредоставление пути слепому)" }, amount: 40 },
  { id: 72, article: "342.2", description: { az: "Tormoz/sükan nasazlığı, normativ pozulması ilə avadanlıq quraşdırılması/dəyişdirilməsi, ban şüşələrinə qanunsuz örtük", en: "Brake/steering defects, non-standard equipment, illegal window tinting", ru: "Неисправность тормозов/руля, нестандартное оборудование, незаконная тонировка" }, amount: 150 },
  { id: 73, article: "342.3", description: { az: "Mühərrik səsinin artırılması məqsədi ilə egzoz sisteminə avadanlıq quraşdırılması", en: "Installing equipment to increase engine noise (exhaust modification)", ru: "Установка оборудования для увеличения шума двигателя (модификация выхлопа)" }, amount: 500 },
  { id: 74, article: "342.4", description: { az: "342.3-ün 1 il ərzində təkrarı", en: "Repeat of 342.3 within 1 year", ru: "Повтор 342.3 в течение 1 года" }, amount: 1000 },
  { id: 75, article: "342.5", description: { az: "İşıq cihazları, silgəclər, təkərlər, mühərrik və ya digər konstruksiya nasazlığı ilə istismar", en: "Operating vehicle with defective lights, wipers, tires, engine or other parts", ru: "Эксплуатация ТС с неисправными фарами, дворниками, шинами, двигателем" }, amount: 50 },
  { id: 76, article: "342.6", description: { az: "Sürücünün hərəkət zamanı telefonu əldə saxlamaqla istifadə etməsi", en: "Using handheld phone while driving", ru: "Использование телефона в руке за рулём" }, amount: 50 },
  { id: 77, article: "342.7", description: { az: "Qeydiyyat nişanlarının olmaması, saxta və ya başqa NV-yə verilmiş nişanlarla idarə", en: "Missing, fake, or other vehicle's registration plates", ru: "Отсутствие, поддельные или чужие номерные знаки" }, amount: 100, points: 4 },
  { id: 78, article: "342.8", description: { az: "342.1/342.2 nəticəsində yüngül bədən xəsarəti", en: "Minor bodily harm from 342.1/342.2 violations", ru: "Лёгкий вред здоровью по 342.1/342.2" }, amount: 200, note: { az: "və ya hüquq 1–2 il məhdudlaşdırılır", en: "or license restricted 1–2 years", ru: "или ограничение прав на 1–2 года" } },
  { id: 79, article: "342.9", description: { az: "İcazəsiz xüsusi siqnal, antiradar, əhalinin dincliyini pozan səs siqnalı istifadəsi", en: "Unauthorized special signals, anti-radar, noise-disturbing horns", ru: "Несанкц. спецсигналы, антирадар, звуковые сигналы, нарушающие покой" }, amount: 500, amountMax: 800, note: { az: "predmet müsadirə edilir", en: "device is confiscated", ru: "устройство конфискуется" } },

  // Maddə 343 — Tibbi müayinədən imtina
  { id: 80, article: "343.1", description: { az: "Alkoqol müayinəsindən imtina (hüququ olan şəxs)", en: "Refusing alcohol test (licensed driver)", ru: "Отказ от освидетельствования на алкоголь (с правами)" }, amount: 400, note: { az: "və ya hüquq 6 aydan 1 ilədək məhdudlaşdırılır", en: "or license restricted 6 months to 1 year", ru: "или ограничение прав от 6 мес. до 1 года" } },
  { id: 81, article: "343.1-1", description: { az: "343.1-in 1 il ərzində təkrarı", en: "Repeat of 343.1 within 1 year", ru: "Повтор 343.1 в течение 1 года" }, amount: 500, note: { az: "hüquq 2 il + 15 günədək həbs", en: "license 2 years + up to 15 days arrest", ru: "ограничение 2 года + арест до 15 дней" } },
  { id: 82, article: "343.4", description: { az: "Hüququ olmayan şəxsin alkoqol müayinəsindən imtinası", en: "Unlicensed driver refusing alcohol test", ru: "Отказ от теста на алкоголь лицом без прав" }, amount: 500, note: { az: "və ya 15 günədək həbs", en: "or up to 15 days arrest", ru: "или арест до 15 дней" } },
  { id: 83, article: "343.8", description: { az: "YHQ iştirakçısının sərxoşluq müayinəsindən imtinası", en: "Traffic participant refusing sobriety test", ru: "Отказ участника ДД от освидетельствования" }, amount: 150 },
  { id: 84, article: "343.9", description: { az: "338.10 halında alkoqol müayinəsindən imtina", en: "Refusing alcohol test in 338.10 case", ru: "Отказ от теста на алкоголь по 338.10" }, amount: 250, amountMax: 300 },

  // Maddə 344
  { id: 85, article: "344", description: { az: "Tibbi müayinədən keçmədən NV idarə etmə", en: "Driving without passing medical examination", ru: "Управление ТС без прохождения медосмотра" }, amount: 30 },

  // Maddə 345
  { id: 86, article: "345.1", description: { az: "NV saxlanca qəbul/saxlama qaydalarının pozulması", en: "Violation of vehicle storage/custody rules", ru: "Нарушение правил хранения ТС" }, amount: 60, note: { az: "Vəzifəli: 60, Hüquqi: 150 AZN", en: "Officials: 60, Legal entities: 150 AZN", ru: "Должн.: 60, Юр. лица: 150 AZN" } },
  { id: 87, article: "345.2", description: { az: "Banı zədələnmiş NV-nin icazəsiz təmirə qəbulu", en: "Accepting damaged vehicle for repair without permission", ru: "Приём повреждённого ТС в ремонт без разрешения" }, amount: 250 },

  // Maddə 346 — Dayanma/durma
  { id: 88, article: "346.1", description: { az: "Dayanma və ya durma qaydalarını pozma", en: "Violation of stopping or parking rules", ru: "Нарушение правил остановки или стоянки" }, amount: 20 },
  { id: 89, article: "346.2", description: { az: "Ümumi NV dayanacaqlarında/5.12, 5.13 nişanlarından 15m-dən yaxın dayanma/durma", en: "Stopping/parking at bus stop or within 15m of 5.12/5.13 signs", ru: "Остановка/стоянка на остановке или ближе 15м от знаков 5.12/5.13" }, amount: 40, points: 2 },
  { id: 90, article: "346.3", description: { az: "Ümumi NV-ni müəyyən dayanacaq meydançalarından kənarda dayandırma", en: "Stopping public transport outside designated stops", ru: "Остановка общ. ТС вне остановочных пунктов" }, amount: 100, points: 4 },
  { id: 91, article: "346.4", description: { az: "Yolun kənarında ikinci və sonrakı cərgələrdə dayanma/durma", en: "Double parking (2nd or more rows)", ru: "Стоянка во 2-м и последующих рядах" }, amount: 80, points: 2 },
  { id: 92, article: "346.5", description: { az: "Hərəkət hissələrinin kəsişməsində və kənardan 5m-dən yaxın dayanma/durma", en: "Stopping/parking at intersection or within 5m", ru: "Остановка/стоянка на перекрёстке или ближе 5м" }, amount: 40, points: 2 },
  { id: 93, article: "346.6", description: { az: "Taksi duracaqlarında taksi olmayan NV-lərin dayanması/durması", en: "Non-taxi vehicles stopping at taxi stands", ru: "Остановка не-такси на стоянке такси" }, amount: 40, points: 2 },
  { id: 94, article: "346.7", description: { az: "Velosiped yollarında dayanma/durma (velosiped/kiçik elektrik NV istisna)", en: "Stopping/parking on bicycle lanes", ru: "Остановка/стоянка на велодорожках" }, amount: 100, points: 2 },
  { id: 95, article: "346.8", description: { az: "Ümumi NV üçün hərəkət zolağında dayanma/durma", en: "Stopping/parking in bus lane", ru: "Остановка/стоянка на полосе для общ. транспорта" }, amount: 100, points: 2 },
  { id: 96, article: "346.9", description: { az: "Səkilərdə NV-lərin dayanması/durması", en: "Stopping/parking on sidewalks", ru: "Остановка/стоянка на тротуарах" }, amount: 60, points: 2 },

  // Maddə 346-1 — Parklanma
  { id: 97, article: "346-1.1", description: { az: "Ödənişli parklanma qaydalarının pozulması (ödəniş edilmədən/vaxtı keçmiş)", en: "Paid parking violations (unpaid/expired)", ru: "Нарушение правил платной парковки (неоплата/просрочка)" }, amount: 20 },
  { id: 98, article: "346-1.2", description: { az: "Parklanma üsulunun pozulması (digər NV-nin parklanmasına/hərəkətinə maneə)", en: "Parking method violation (blocking other vehicles)", ru: "Нарушение способа парковки (блокировка других ТС)" }, amount: 20 },
  { id: 99, article: "346-1.3", description: { az: "Əlillər üçün parklanma yerində digər NV-lərin parklanması", en: "Parking in disabled parking spots", ru: "Парковка на местах для инвалидов" }, amount: 60 },
  { id: 100, article: "346-1.4", description: { az: "3.5t+ yük avtomobilinin parklanması, parklanma yerinin rezervasiyası, maneə yaradılması", en: "Heavy truck parking, space reservation, obstruction", ru: "Парковка грузовиков 3.5т+, резервирование мест, создание препятствий" }, amount: 20 },
  { id: 101, article: "346-1.5", description: { az: "24 saatdan artıq parklanma yerində saxlanılma", en: "Parking for more than 24 hours", ru: "Стоянка более 24 часов" }, amount: 20 },
  { id: 102, article: "346-1.6", description: { az: "Elektrik doldurma yerində elektrik NV-dən başqa digər NV parklanması", en: "Non-EV parking in EV charging spots", ru: "Парковка не-электромобилей на зарядных местах" }, amount: 20 },
  { id: 103, article: "346-1.7", description: { az: "Velosiped/kiçik elektrik NV-lərin ayrılmış parklanma yerindən kənarda parklanması", en: "Bicycles/small EVs parked outside designated areas", ru: "Парковка велосипедов/малых ЭТС вне отведённых мест" }, amount: 10 },
  { id: 104, article: "346-1.8", description: { az: "Xidməti parklanma yerlərində digər NV-lərin parklanması", en: "Parking in service/official parking spots", ru: "Парковка на служебных парковочных местах" }, amount: 40 },

  // Maddə 347
  { id: 105, article: "347", description: { az: "NV istifadəçisi barədə sorğuya 5 gün ərzində məlumat verilməməsi", en: "Failure to provide vehicle user info within 5 days", ru: "Непредоставление информации о пользователе ТС в течение 5 дней" }, amount: 150, note: { az: "Vəzifəli: 150, Hüquqi: 300 AZN", en: "Officials: 150, Legal entities: 300 AZN", ru: "Должн.: 150, Юр. лица: 300 AZN" } },

  // Maddə 348
  { id: 106, article: "348", description: { az: "Təhlükəli yüklərin daşınması qaydalarının pozulması", en: "Violation of dangerous goods transportation rules", ru: "Нарушение правил перевозки опасных грузов" }, amount: 100, note: { az: "Vəzifəli: 500, Hüquqi: 5000 AZN", en: "Officials: 500, Legal entities: 5000 AZN", ru: "Должн.: 500, Юр. лица: 5000 AZN" } },

  // Maddə 349
  { id: 107, article: "349", description: { az: "YH təhlükəsizlik səviyyəsinin azaldılması hesabına buraxılış qabiliyyətinin artırılması", en: "Increasing road capacity at expense of safety", ru: "Увеличение пропускной способности за счёт снижения безопасности" }, amount: 350, amountMax: 500, note: { az: "Vəzifəli: 350–500, Hüquqi: 3000–4000 AZN", en: "Officials: 350–500, Legal entities: 3000–4000 AZN", ru: "Должн.: 350–500, Юр. лица: 3000–4000 AZN" } },

  // Maddə 350
  { id: 108, article: "350.1", description: { az: "Avtomobil yollarında icazəsiz tikinti/qazıntı/təmir işləri, təhlükəsizlik standartlarına əməl edilməməsi", en: "Unauthorized construction/excavation on roads, safety standard violations", ru: "Несанкц. строительство/раскопки на дорогах, нарушение стандартов безопасности" }, amount: 200, amountMax: 300, note: { az: "Vəzifəli: 1000–1500, Hüquqi: 10000–12000 AZN", en: "Officials: 1000–1500, Legal entities: 10000–12000 AZN", ru: "Должн.: 1000–1500, Юр. лица: 10000–12000 AZN" } },
  { id: 109, article: "350.2", description: { az: "İcazəsiz svetofor/yol nişanı quraşdırılması", en: "Unauthorized installation of traffic lights/signs", ru: "Несанкц. установка светофоров/знаков" }, amount: 30, amountMax: 50, note: { az: "Vəzifəli: 150–200, Hüquqi: 1500–2000 AZN", en: "Officials: 150–200, Legal entities: 1500–2000 AZN", ru: "Должн.: 150–200, Юр. лица: 1500–2000 AZN" } },

  // Maddə 351
  { id: 110, article: "351", description: { az: "Avtomobil yollarının saxlanılması, qorunması və abadlaşdırılması qaydalarının pozulması", en: "Road maintenance and improvement rules violation", ru: "Нарушение правил содержания и благоустройства дорог" }, amount: 100, amountMax: 150, note: { az: "Vəzifəli: 100–150, Hüquqi: 1000–1200 AZN", en: "Officials: 100–150, Legal entities: 1000–1200 AZN", ru: "Должн.: 100–150, Юр. лица: 1000–1200 AZN" } },

  // Maddə 352
  { id: 111, article: "352.1", description: { az: "Avtomobil yollarında hərəkət təhlükəsizliyinin pozulması (material yığılması, kənd təsərrüfatı, kommunikasiya və s.)", en: "Road safety violations (materials, agriculture, communication lines, etc.)", ru: "Нарушения безопасности на дорогах (материалы, с/х, коммуникации и т.д.)" }, amount: 30, amountMax: 50, note: { az: "Vəzifəli: 150–200, Hüquqi: 1500–2000 AZN", en: "Officials: 150–200, Legal entities: 1500–2000 AZN", ru: "Должн.: 150–200, Юр. лица: 1500–2000 AZN" } },
  { id: 112, article: "352.2", description: { az: "Yollara/yol qurğularına tullantı atılması, NV-dən bayıra əşya atılması", en: "Littering on roads/road structures, throwing objects from vehicle", ru: "Мусор на дорогах, выброс предметов из ТС" }, amount: 200, note: { az: "Vəzifəli: 1000, Hüquqi: 4000 AZN", en: "Officials: 1000, Legal entities: 4000 AZN", ru: "Должн.: 1000, Юр. лица: 4000 AZN" } },

  // Maddə 353
  { id: 113, article: "353.1", description: { az: "İriqabaritli/ağırçəkili NV-lərin qabarit parametrlərini pozmaqla idarə edilməsi", en: "Oversized vehicle dimension violations", ru: "Нарушение габаритных параметров крупногабаритных ТС" }, amount: 200, amountMax: 1500 },
  { id: 114, article: "353.2", description: { az: "İriqabaritli/ağırçəkili NV-lərin çəki parametrlərini aşmaqla idarə edilməsi", en: "Overweight vehicle violations", ru: "Превышение весовых параметров крупногабаритных ТС" }, amount: 600 },
  { id: 115, article: "353.3", description: { az: "İriqabaritli/ağırçəkili NV-lərin qabarit/çəki parametrlərini aşmaqla yüklənməsi", en: "Overloading oversized/heavy vehicles", ru: "Погрузка с превышением параметров крупногабаритных/тяжеловесных ТС" }, amount: 1400, amountMax: 1700, note: { az: "Vəzifəli: 1400–1700, Hüquqi: 4000–5000 AZN", en: "Officials: 1400–1700, Legal entities: 4000–5000 AZN", ru: "Должн.: 1400–1700, Юр. лица: 4000–5000 AZN" } },

  // Maddə 354
  { id: 116, article: "354", description: { az: "Avtomobil yollarında hərəkət təhlükəsizliyi qaydalarının pozulması (icazəsiz tikinti, kommunikasiya, reklam və s.)", en: "Road safety violations (unauthorized construction, communication, advertising)", ru: "Нарушения безопасности на дорогах (несанкц. строительство, коммуникации, реклама)" }, amount: 80, amountMax: 100, note: { az: "Vəzifəli: 400–500, Hüquqi: 3000–4000 AZN", en: "Officials: 400–500, Legal entities: 3000–4000 AZN", ru: "Должн.: 400–500, Юр. лица: 3000–4000 AZN" } },

  // Maddə 355
  { id: 117, article: "355", description: { az: "YH-nin müvəqqəti məhdudlaşdırılması/qadağan edilməsi qaydalarının pozulması", en: "Violating temporary traffic restriction/prohibition", ru: "Нарушение временного ограничения/запрета движения" }, amount: 40, amountMax: 50, note: { az: "Vəzifəli: 250–300, Hüquqi: 500–600 AZN", en: "Officials: 250–300, Legal entities: 500–600 AZN", ru: "Должн.: 250–300, Юр. лица: 500–600 AZN" } },

  // Maddə 356
  { id: 118, article: "356.1", description: { az: "Dərman qutusu olmadan NV idarə etmə", en: "Driving without first aid kit", ru: "Управление ТС без аптечки" }, amount: 10 },
  { id: 119, article: "356.2", description: { az: "Təcili tibbi yardıma ehtiyacı olan şəxsi daşımama, NV təqdim etməmə", en: "Refusing to transport emergency patient, not providing vehicle to medic", ru: "Отказ перевезти нуждающегося в помощи, непредоставление ТС медику" }, amount: 40 },

  // Maddə 469
  { id: 120, article: "469.3", description: { az: "İcbari sığortanın (OSAGO) olmaması", en: "No mandatory OSAGO insurance", ru: "Отсутствие обязательного страхования ОСАГО" }, amount: 50, note: { az: "Vəzifəli: 100, Hüquqi: 300 AZN", en: "Officials: 100, Legal entities: 300 AZN", ru: "Должн.: 100, Юр. лица: 300 AZN" } },

  // Maddə 511 — Avtoxuliqanlıq
  { id: 121, article: "511.1", description: { az: "Avtoxuliqanlıq (sürət yarışı, təkər qaldırma, təkər sürtmə ilə səs çıxarma/iz buraxma)", en: "Auto hooliganism (racing, wheelies, burnouts/drifting)", ru: "Автохулиганство (гонки, езда на одном колесе, дрифт/прожигание шин)" }, amount: 500, amountMax: 750, note: { az: "hüquq 1 il məhdudlaşdırılır və ya 15 gün–1 ay həbs", en: "license restricted 1 year or 15 days–1 month arrest", ru: "ограничение прав 1 год или арест 15 дней–1 мес." } },
  { id: 122, article: "511.2", description: { az: "511.1-in 1 il ərzində təkrarı", en: "Repeat of 511.1 within 1 year", ru: "Повтор 511.1 в течение 1 года" }, amount: 750, amountMax: 1000, note: { az: "hüquq 2 il + 1–2 ay həbs", en: "license restricted 2 years + 1–2 months arrest", ru: "ограничение прав 2 года + арест 1–2 мес." } },
  { id: 123, article: "511.3", description: { az: "Sürət yarışı zamanı sürəti 60+ km/s aşmaqla avtoxuliqanlıq", en: "Auto hooliganism with racing exceeding 60+ km/h over limit", ru: "Автохулиганство с гонками с превышением 60+ км/ч" }, amount: 2000, amountMax: 4000, note: { az: "hüquq 2 il + 1–2 ay həbs", en: "license restricted 2 years + 1–2 months arrest", ru: "ограничение прав 2 года + арест 1–2 мес." } },

  // Maddə 529
  { id: 124, article: "529.3", description: { az: "YHQ cərimə qərarının 3 ay ərzində icra edilməməsi", en: "Failure to pay traffic fine within 3 months", ru: "Неуплата штрафа за ПДД в течение 3 месяцев" }, amount: 0, note: { az: "hüquq 6 aydan 1 ilədək məhdudlaşdırılır", en: "license restricted 6 months to 1 year", ru: "ограничение прав от 6 мес. до 1 года" } },
];

const pageTranslations: Record<Lang, {
  title: string;
  description: string;
  breadcrumbCategory: string;
  breadcrumbLabel: string;
  formulaTitle: string;
  formulaContent: string;
  searchPlaceholder: string;
  resultCount: string;
  article: string;
  fine: string;
  noResults: string;
  noResultsHint: string;
  allFines: string;
  infoNote: string;
  attention: string;
  arrestBadge: string;
  pointsLabel: string;
}> = {
  az: {
    title: "Yol hərəkəti cərimələri",
    description: "Azərbaycanda yol hərəkəti qayda pozuntularına görə cərimələri axtarın.",
    breadcrumbCategory: "Avtomobil",
    breadcrumbLabel: "Cərimələr",
    formulaTitle: "Cərimələr necə tətbiq olunur?",
    formulaContent: `Azərbaycan Respublikasının İnzibati Xətalar Məcəlləsinə əsasən yol hərəkəti qaydalarının pozulmasına görə cərimələr tətbiq olunur.

Ödəniş qaydaları:
\u2022 Cərimə 30 gün ərzində ödənilməlidir
\u2022 İlk 30 gündə ödəniş zamanı 50% güzəşt tətbiq oluna bilər
\u2022 Vaxtında ödənilməyən cərimələrə əlavə faiz hesablanır

Ödəniş üsulları:
\u2022 Bank şöbələri
\u2022 Onlayn bankçılıq
\u2022 ASAN xidmət mərkəzləri
\u2022 Mobil tətbiqetmələr`,
    searchPlaceholder: "Cərimə axtarın (məs.: sürət, kəmər, parklanma...)",
    resultCount: "nəticə",
    article: "Maddə",
    fine: "Cərimə",
    noResults: "Heç bir nəticə tapılmadı",
    noResultsHint: "Axtarış sözünüzü dəyişdirin və ya başqa açar söz istifadə edin.",
    allFines: "Bütün cərimələr",
    infoNote: "Bu məlumatlar məlumat xərakterlidir. Cərimə məbləğləri qanunvericilik dəyişikliklərinə əsasən yenilənə bilər. Dəqiq məlumat üçün DYP-nin rəsmi mənbələrinə müraciət edin.",
    attention: "Diqqət:",
    arrestBadge: "Həbs",
    pointsLabel: "bal",
  },
  en: {
    title: "Traffic Fines",
    description: "Search traffic violation fines in Azerbaijan.",
    breadcrumbCategory: "Automotive",
    breadcrumbLabel: "Traffic Fines",
    formulaTitle: "How are fines applied?",
    formulaContent: `Fines for traffic violations are applied according to the Administrative Code of the Republic of Azerbaijan.

Payment rules:
\u2022 Fines must be paid within 30 days
\u2022 A 50% discount may apply if paid within the first 30 days
\u2022 Late payment incurs additional interest charges

Payment methods:
\u2022 Bank branches
\u2022 Online banking
\u2022 ASAN service centers
\u2022 Mobile applications`,
    searchPlaceholder: "Search fines (e.g.: speed, seatbelt, parking...)",
    resultCount: "results",
    article: "Article",
    fine: "Fine",
    noResults: "No results found",
    noResultsHint: "Try changing your search term or use a different keyword.",
    allFines: "All fines",
    infoNote: "This information is for reference only. Fine amounts may be updated based on legislative changes. For accurate information, please refer to official traffic police sources.",
    attention: "Note:",
    arrestBadge: "Arrest",
    pointsLabel: "pts",
  },
  ru: {
    title: "Штрафы за нарушение ПДД",
    description: "Поиск штрафов за нарушение правил дорожного движения в Азербайджане.",
    breadcrumbCategory: "Автомобиль",
    breadcrumbLabel: "Штрафы",
    formulaTitle: "Как применяются штрафы?",
    formulaContent: `Штрафы за нарушения ПДД применяются согласно Кодексу об административных правонарушениях Азербайджанской Республики.

Правила оплаты:
\u2022 Штраф должен быть оплачен в течение 30 дней
\u2022 При оплате в первые 30 дней может применяться скидка 50%
\u2022 При просрочке начисляются дополнительные проценты

Способы оплаты:
\u2022 Отделения банков
\u2022 Онлайн-банкинг
\u2022 Центры ASAN
\u2022 Мобильные приложения`,
    searchPlaceholder: "Поиск штрафов (напр.: скорость, ремень, парковка...)",
    resultCount: "результатов",
    article: "Статья",
    fine: "Штраф",
    noResults: "Результаты не найдены",
    noResultsHint: "Попробуйте изменить поисковый запрос или используйте другое ключевое слово.",
    allFines: "Все штрафы",
    infoNote: "Данная информация носит справочный характер. Размеры штрафов могут обновляться в соответствии с изменениями законодательства. Для точной информации обращайтесь к официальным источникам ДПС.",
    attention: "Внимание:",
    arrestBadge: "Арест",
    pointsLabel: "б.",
  },
};

function getAmountColor(amount: number, amountMax?: number): string {
  const value = Math.max(amount, amountMax || 0);
  if (value === 0) return "text-gray-600 bg-gray-50 border-gray-200";
  if (value < 50) return "text-green-600 bg-green-50 border-green-200";
  if (value <= 200) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function getAmountBadgeColor(amount: number, amountMax?: number): string {
  const value = Math.max(amount, amountMax || 0);
  if (value === 0) return "bg-gray-100 text-gray-700";
  if (value < 50) return "bg-green-100 text-green-700";
  if (value <= 200) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function TrafficFinesPage() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const [search, setSearch] = useState("");

  const filteredFines = useMemo(() => {
    if (!search.trim()) return fines;
    const query = search.toLowerCase().trim();
    return fines.filter(
      (f) =>
        f.description[lang].toLowerCase().includes(query) ||
        f.article.toLowerCase().includes(query) ||
        f.amount.toString().includes(query) ||
        (f.amountMax && f.amountMax.toString().includes(query)) ||
        (f.note && f.note[lang].toLowerCase().includes(query))
    );
  }, [search, lang]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=automotive" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["car-customs", "road-tax", "osago", "vehicle-fees"]}
    >
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-muted"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={pt.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filteredFines.length}</span>{" "}
          {pt.resultCount}
          {!search.trim() && (
            <span className="ml-1 text-xs text-muted">({pt.allFines})</span>
          )}
        </p>
      </div>

      {/* Fines List */}
      {filteredFines.length > 0 ? (
        <div className="space-y-3">
          {filteredFines.map((fine) => (
            <div
              key={fine.id}
              className={`rounded-xl border p-4 transition-all hover:shadow-md ${getAmountColor(fine.amount, fine.amountMax)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-mono font-semibold text-gray-700">
                      {pt.article} {fine.article}
                    </span>
                    {fine.points && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-xs font-semibold text-blue-700">
                        {fine.points} {pt.pointsLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {fine.description[lang]}
                  </p>
                  {fine.note && fine.amount > 0 && (
                    <p className="text-xs italic text-muted mt-1">
                      {fine.note[lang]}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  {fine.amount > 0 ? (
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-lg font-bold ${getAmountBadgeColor(fine.amount, fine.amountMax)}`}
                    >
                      {fine.amountMax
                        ? `${fine.amount} – ${fine.amountMax} AZN`
                        : `${fine.amount} AZN`}
                    </span>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-700">
                        {pt.arrestBadge}
                      </span>
                      {fine.note && (
                        <span className="text-xs text-gray-500 text-right max-w-[180px]">
                          {fine.note[lang]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-5xl mb-4">&#128270;</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {pt.noResults}
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            {pt.noResultsHint}
          </p>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="font-semibold">{pt.attention}</span> {pt.infoNote}
        </p>
      </div>
    </CalculatorLayout>
  );
}
