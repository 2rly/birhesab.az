"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// ═══════════════════════════════════════════════
// İnzibati vəzifələr üzrə maaş cədvəli (35 səviyyə × 7 pillə)
// ═══════════════════════════════════════════════
const adminGrid: Record<number, number[]> = {
  1:[13680,14020,14365,14705,15050,15390,15730],
  2:[12725,13045,13360,13680,14000,14315,14635],
  3:[11835,12135,12430,12725,13020,13315,13615],
  4:[11010,11285,11560,11835,12115,12390,12665],
  5:[10245,10500,10755,11010,11265,11525,11780],
  6:[9530,9765,10005,10245,10480,10720,10960],
  7:[8865,9085,9305,9530,9750,9970,10195],
  8:[8245,8450,8660,8865,9070,9275,9485],
  9:[7670,7860,8055,8245,8435,8630,8820],
  10:[7135,7315,7490,7670,7850,8025,8205],
  11:[6635,6805,6970,7135,7300,7465,7635],
  12:[6175,6330,6485,6635,6790,6945,7100],
  13:[5745,5885,6030,6175,6320,6460,6605],
  14:[5340,5475,5610,5745,5875,6010,6145],
  15:[4970,5095,5220,5340,5465,5590,5715],
  16:[4625,4740,4855,4970,5085,5200,5315],
  17:[4300,4410,4515,4625,4730,4840,4945],
  18:[4000,4100,4200,4300,4400,4500,4600],
  19:[3720,3815,3910,4000,4095,4185,4280],
  20:[3460,3550,3635,3720,3810,3895,3980],
  21:[3220,3300,3380,3460,3545,3620,3705],
  22:[2995,3070,3145,3220,3295,3370,3445],
  23:[2785,2855,2925,2995,3065,3135,3205],
  24:[2590,2655,2720,2785,2850,2915,2980],
  25:[2410,2470,2530,2595,2650,2715,2775],
  26:[2245,2300,2355,2410,2470,2525,2580],
  27:[2085,2140,2190,2245,2295,2350,2400],
  28:[1940,1990,2040,2085,2135,2185,2230],
  29:[1805,1850,1895,1940,1985,2030,2075],
  30:[1680,1720,1765,1805,1845,1890,1930],
  31:[1560,1600,1640,1680,1720,1755,1795],
  32:[1455,1490,1525,1560,1600,1635,1670],
  33:[1355,1385,1420,1455,1485,1520,1555],
  34:[1260,1290,1320,1355,1385,1415,1445],
  35:[1170,1200,1230,1260,1285,1315,1345],
};

// Yardımçı vəzifələr (17 səviyyə × 7 pillə)
const supportGrid: Record<number, number[]> = {
  1:[1165,1195,1220,1250,1280,1310,1340],
  2:[1135,1160,1190,1220,1245,1275,1305],
  3:[1105,1130,1160,1185,1215,1240,1270],
  4:[1075,1100,1130,1155,1180,1210,1235],
  5:[1045,1070,1100,1125,1150,1175,1205],
  6:[1020,1045,1070,1095,1120,1145,1170],
  7:[990,1015,1040,1065,1090,1115,1140],
  8:[965,990,1015,1040,1065,1085,1110],
  9:[940,965,985,1010,1035,1060,1080],
  10:[915,940,960,985,1010,1030,1055],
  11:[890,915,935,960,980,1005,1025],
  12:[870,890,910,935,955,975,1000],
  13:[845,865,890,910,930,950,970],
  14:[825,845,865,885,905,925,945],
  15:[800,820,840,860,880,900,920],
  16:[780,800,820,840,860,880,900],
  17:[760,780,800,815,835,855,875],
};

interface Position { name: string; level: number }

const adminOrgs: Record<string, Position[]> = {
  "Prezident Administrasiyası": [
    {name:"Rəhbər",level:1},
    {name:"Prezidentin köməkçisi – şöbə müdiri",level:3},
    {name:"Prezidentin köməkçisi",level:3},
    {name:"Şöbə müdiri",level:4},
    {name:"Prezidentin Mətbuat katibi",level:4},
    {name:"Şöbə müdirinin müavini",level:5},
    {name:"Rəhbərin köməkçisi",level:6},
    {name:"Sektor müdiri",level:7},
    {name:"Baş məsləhətçi",level:8},
    {name:"Böyük məsləhətçi",level:9},
    {name:"Aparıcı məsləhətçi",level:10},
    {name:"Məsləhətçi",level:11},
  ],
  "Birinci vitse-prezidentin Katibliyi": [
    {name:"Katibliyin rəisi",level:2},
    {name:"Rəisin müavini",level:4},
    {name:"Birinci vitse-prezidentin köməkçisi",level:4},
  ],
  "Prezidentin İşlər İdarəsi": [
    {name:"İşlər müdiri",level:2},
    {name:"Birinci müavin",level:4},
    {name:"Müavin",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"Şöbə müdirinin müavini",level:7},
    {name:"Sektor müdiri, baş mühasib",level:8},
    {name:"İşlər müdirinin köməkçisi",level:10},
    {name:"Baş məsləhətçi",level:9},
    {name:"Böyük məsləhətçi",level:10},
    {name:"Aparıcı məsləhətçi",level:11},
    {name:"Məsləhətçi",level:12},
  ],
  "Xüsusi Tibb Xidməti": [
    {name:"Rəis",level:2},
    {name:"Birinci müavin",level:4},
    {name:"Müavin",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"Şöbə müdirinin müavini",level:7},
    {name:"Sektor müdiri, baş mühasib",level:8},
    {name:"Rəisin köməkçisi",level:10},
    {name:"Baş məsləhətçi",level:9},
    {name:"Böyük məsləhətçi",level:10},
    {name:"Aparıcı məsləhətçi",level:11},
    {name:"Məsləhətçi",level:12},
  ],
  "Prezidentin Protokol Xidməti": [
    {name:"Rəis",level:2},
    {name:"Birinci müavin",level:4},
    {name:"Müavin",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"Şöbə müdirinin müavini",level:7},
    {name:"Sektor müdiri, baş mühasib",level:8},
    {name:"Baş məsləhətçi",level:9},
    {name:"Böyük məsləhətçi",level:10},
    {name:"Aparıcı məsləhətçi",level:11},
    {name:"Məsləhətçi",level:12},
  ],
  "Təhlükəsizlik Şurası katibinin xidməti": [
    {name:"Katib",level:2},
    {name:"Katib müavini",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"Baş məsləhətçi",level:9},
    {name:"Böyük məsləhətçi",level:10},
    {name:"Aparıcı məsləhətçi",level:11},
    {name:"Məsləhətçi",level:12},
  ],
  "Nazirlər Kabineti Aparatı": [
    {name:"Aparatın rəhbəri",level:4},
    {name:"Rəhbərin müavini",level:5},
    {name:"Baş nazirin Katibliyinin rəisi",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"Mətbuat xidmətinin rəhbəri",level:6},
    {name:"İşlər müdiri",level:6},
    {name:"Şöbə müdirinin müavini",level:7},
    {name:"Mətbuat xidməti rəhbərinin müavini",level:7},
    {name:"İşlər müdirinin müavini",level:7},
    {name:"Baş nazirin müşaviri, köməkçisi",level:7},
    {name:"Baş nazirin müavininin köməkçisi",level:8},
    {name:"İşlər İdarəsində şöbə müdiri",level:8},
    {name:"Sektor müdiri",level:9},
    {name:"İşlər İdarəsində şöbə müdirinin müavini",level:9},
    {name:"Baş məsləhətçi",level:10},
    {name:"Rəhbərin köməkçisi",level:10},
    {name:"İşlər İdarəsində sektor müdiri, baş mühasib",level:10},
    {name:"İşlər müdirinin köməkçisi",level:10},
    {name:"Böyük məsləhətçi",level:11},
    {name:"İşlər İdarəsində baş məsləhətçi",level:11},
    {name:"Aparıcı məsləhətçi",level:12},
    {name:"İşlər İdarəsində böyük məsləhətçi",level:12},
    {name:"Məsləhətçi",level:13},
    {name:"İşlər İdarəsində aparıcı məsləhətçi",level:13},
    {name:"İşlər İdarəsində məsləhətçi",level:14},
  ],
  "Milli Məclis Aparatı": [
    {name:"Aparatın rəhbəri",level:4},
    {name:"Rəhbərin müavini",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"İşlər müdiri",level:6},
    {name:"Şöbə müdirinin müavini",level:7},
    {name:"İşlər müdirinin müavini",level:7},
    {name:"Sədrin müşaviri, köməkçisi",level:7},
    {name:"Sədrin müavininin köməkçisi",level:8},
    {name:"İşlər İdarəsində şöbə müdiri",level:8},
    {name:"Sektor müdiri",level:9},
    {name:"Baş məsləhətçi",level:10},
    {name:"Rəhbərin köməkçisi",level:10},
    {name:"Böyük məsləhətçi",level:11},
    {name:"Aparıcı məsləhətçi",level:12},
    {name:"Məsləhətçi",level:13},
    {name:"İşlər İdarəsində məsləhətçi",level:14},
    {name:"İşlər müdirinin köməkçisi",level:14},
  ],
  "Konstitusiya Məhkəməsi Aparatı": [
    {name:"Aparatın rəhbəri",level:4},
    {name:"Rəhbərin müavini",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"İşlər müdiri",level:6},
    {name:"Şöbə müdirinin müavini",level:7},
    {name:"Sədrin müşaviri, köməkçisi",level:7},
    {name:"İşlər İdarəsində şöbə müdiri",level:8},
    {name:"Sektor müdiri",level:9},
    {name:"Baş məsləhətçi",level:10},
    {name:"Böyük məsləhətçi",level:11},
    {name:"Aparıcı məsləhətçi",level:12},
    {name:"Aparat rəhbərinin köməkçisi",level:12},
    {name:"Məsləhətçi",level:13},
    {name:"İşlər İdarəsində məsləhətçi",level:14},
  ],
  "Ali Məhkəmə Aparatı": [
    {name:"Aparatın rəhbəri",level:4},
    {name:"Rəhbərin müavini",level:5},
    {name:"Şöbə müdiri",level:6},
    {name:"İşlər müdiri",level:6},
    {name:"Şöbə müdirinin müavini",level:7},
    {name:"Sədrin müşaviri, köməkçisi",level:7},
    {name:"İşlər İdarəsində şöbə müdiri",level:8},
    {name:"Sektor müdiri",level:9},
    {name:"Baş məsləhətçi",level:10},
    {name:"İşlər İdarəsində sektor müdiri, baş mühasib",level:10},
    {name:"Böyük məsləhətçi",level:11},
    {name:"Aparıcı məsləhətçi",level:12},
    {name:"Məsləhətçi, hakimin köməkçisi",level:13},
    {name:"İşlər İdarəsində məsləhətçi",level:14},
  ],
  "Hesablama Palatası": [
    {name:"Aparatın rəhbəri",level:6},
    {name:"Rəhbərin müavini",level:7},
    {name:"Şöbə müdiri",level:8},
    {name:"Şöbə müdirinin müavini",level:11},
    {name:"Sektor müdiri, baş mühasib",level:15},
    {name:"Sədrin köməkçisi, müşaviri",level:10},
    {name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},
    {name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},
  ],
  "Məhkəmə-Hüquq Şurası": [
    {name:"Aparatın rəhbəri",level:6},
    {name:"Rəhbərin müavini",level:7},
    {name:"Şöbə müdiri",level:8},
    {name:"Şöbə müdirinin müavini",level:11},
    {name:"Sektor müdiri, baş mühasib",level:15},
    {name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},
    {name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},
  ],
  "Ombudsman Aparatı": [
    {name:"Aparatın rəhbəri",level:6},
    {name:"Rəhbərin müavini",level:7},
    {name:"Şöbə müdiri",level:8},
    {name:"Şöbə müdirinin müavini",level:11},
    {name:"Ombudsmanın köməkçisi, müşaviri",level:10},
    {name:"Sektor müdiri, baş mühasib",level:15},
    {name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},
    {name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},
    {name:"Regional mərkəz rəhbəri",level:18},
    {name:"Regional mərkəz rəhbərinin müavini",level:19},
    {name:"Regional mərkəzdə sektor müdiri, baş mühasib",level:25},
    {name:"Regional mərkəzdə baş məsləhətçi",level:26},
    {name:"Regional mərkəzdə böyük məsləhətçi",level:27},
    {name:"Regional mərkəzdə aparıcı məsləhətçi",level:28},
    {name:"Regional mərkəzdə məsləhətçi",level:29},
  ],
  "Baş Prokurorluq": [
    {name:"Şöbə müdiri",level:8},
    {name:"Şöbə müdirinin müavini",level:11},
    {name:"Sektor müdiri, baş mühasib",level:15},
    {name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},
    {name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},
  ],
  "Nazirlik aparatı": [
    {name:"Aparatın rəhbəri",level:6},
    {name:"Aparatın rəhbərinin müavini",level:7},
    {name:"Şöbə müdiri",level:8},
    {name:"Şöbə müdirinin müavini",level:11},
    {name:"Rəhbərin müşaviri, köməkçisi",level:10},
    {name:"Sektor müdiri, baş mühasib",level:15},
    {name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},
    {name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},
  ],
  "Mərkəzi Seçki Komissiyası Katibliyi": [
    {name:"Katibliyin rəhbəri",level:7},
    {name:"Rəhbərin müavini",level:9},
    {name:"Şöbə müdiri",level:11},
    {name:"Şöbə müdirinin müavini",level:15},
    {name:"Rəhbərin köməkçisi",level:15},
    {name:"Sektor müdiri, baş mühasib",level:19},
    {name:"Baş məsləhətçi",level:20},
    {name:"Böyük məsləhətçi",level:21},
    {name:"Aparıcı məsləhətçi",level:22},
    {name:"Məsləhətçi",level:23},
  ],
  "Korrupsiyaya qarşı mübarizə Komissiyası": [
    {name:"Katib",level:7},
    {name:"Baş məsləhətçi",level:20},
    {name:"Böyük məsləhətçi",level:21},
    {name:"Aparıcı məsləhətçi",level:22},
    {name:"Məsləhətçi",level:23},
  ],
  "NMR Ali Məclisi": [
    {name:"Aparatın rəhbəri",level:6},
    {name:"Rəhbərin müavini",level:7},
    {name:"Şöbə müdiri",level:8},
    {name:"Şöbə müdirinin müavini",level:11},
    {name:"Sədrin müşaviri, köməkçisi",level:10},
    {name:"Sektor müdiri, baş mühasib",level:15},
    {name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},
    {name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},
  ],
  "NMR Nazirlər Kabineti Aparatı": [
    {name:"Aparatın rəhbəri",level:6},
    {name:"Rəhbərin müavini",level:7},
    {name:"Şöbə müdiri",level:8},
    {name:"Şöbə müdirinin müavini",level:11},
    {name:"Baş nazirin müşaviri, köməkçisi",level:10},
    {name:"Sektor müdiri, baş mühasib",level:15},
    {name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},
    {name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},
  ],
  "NMR Ali Məhkəməsi Aparatı": [
    {name:"Aparatın rəhbəri",level:7},
    {name:"Rəhbərin müavini",level:9},
    {name:"Şöbə müdiri",level:11},
    {name:"Şöbə müdirinin müavini",level:15},
    {name:"Sədrin köməkçisi",level:19},
    {name:"Sektor müdiri, baş mühasib",level:19},
    {name:"Baş məsləhətçi",level:20},
    {name:"Böyük məsləhətçi",level:21},
    {name:"Aparıcı məsləhətçi",level:22},
    {name:"Məsləhətçi, hakimin köməkçisi",level:23},
  ],
  "Hərbi Prokurorluq": [
    {name:"Şöbə müdiri",level:14},
    {name:"Sektor müdiri, baş mühasib",level:20},
    {name:"Baş məsləhətçi",level:21},
    {name:"Böyük məsləhətçi",level:22},
    {name:"Aparıcı məsləhətçi",level:23},
    {name:"Məsləhətçi",level:24},
  ],
  "NMR Prokurorluğu": [
    {name:"Şöbə müdiri",level:11},
    {name:"Sektor müdiri, baş mühasib",level:20},
    {name:"Baş məsləhətçi",level:21},
    {name:"Böyük məsləhətçi",level:22},
    {name:"Aparıcı məsləhətçi",level:23},
    {name:"Məsləhətçi",level:24},
  ],
  "Bakı Şəhər Prokurorluğu": [
    {name:"Şöbə müdiri",level:20},
    {name:"Sektor müdiri, baş mühasib",level:25},
    {name:"Baş məsləhətçi",level:26},
    {name:"Böyük məsləhətçi",level:27},
    {name:"Aparıcı məsləhətçi",level:28},
    {name:"Məsləhətçi",level:29},
  ],
  "Bakı Şəhər İcra Hakimiyyəti": [
    {name:"Başçının birinci müavini",level:6},
    {name:"Başçının müavini",level:7},
    {name:"Aparatın rəhbəri",level:11},
    {name:"Şöbə müdiri",level:14},
    {name:"Şöbə müdirinin müavini, müşaviri, köməkçisi",level:17},
    {name:"Sektor müdiri, baş mühasib",level:20},
    {name:"Baş məsləhətçi",level:21},
    {name:"Böyük məsləhətçi",level:22},
    {name:"Aparıcı məsləhətçi",level:23},
    {name:"Məsləhətçi",level:24},
  ],
  "Gəncə / Sumqayıt İcra Hakimiyyəti": [
    {name:"Başçının birinci müavini",level:15},
    {name:"Başçının müavini",level:16},
  ],
  "Yerli icra hakimiyyəti": [
    {name:"Başçının birinci müavini",level:16},
    {name:"Başçının müavini",level:17},
    {name:"Şöbə müdiri",level:27},
    {name:"Şöbə müdirinin müavini",level:29},
    {name:"Sektor müdiri, baş mühasib",level:30},
    {name:"Baş məsləhətçi, köməkçi",level:31},
    {name:"Böyük məsləhətçi",level:32},
    {name:"Aparıcı məsləhətçi",level:33},
    {name:"Məsləhətçi",level:34},
    {name:"Nümayəndə (şəhər/sahə dairəsi)",level:33},
    {name:"Nümayəndə (qəsəbə/kənd dairəsi)",level:33},
  ],
  "Apellyasiya məhkəmələri": [
    {name:"Aparatın rəhbəri",level:7},
    {name:"Rəhbərin müavini",level:9},
    {name:"Şöbə müdiri",level:11},
    {name:"Şöbə müdirinin müavini",level:15},
    {name:"Sektor müdiri, baş mühasib",level:19},
    {name:"Baş məsləhətçi",level:20},
    {name:"Böyük məsləhətçi",level:21},
    {name:"Aparıcı məsləhətçi",level:22},
    {name:"Məsləhətçi, hakimin köməkçisi",level:23},
  ],
  "Ağır cinayətlər / İnzibati / Kommersiya / Hərbi məhkəmələri": [
    {name:"Şöbə müdiri",level:20},
    {name:"Şöbə müdirinin müavini",level:23},
    {name:"Sektor müdiri, baş mühasib",level:25},
    {name:"Baş məsləhətçi",level:26},
    {name:"Böyük məsləhətçi",level:27},
    {name:"Aparıcı məsləhətçi",level:28},
    {name:"Məsləhətçi, hakimin köməkçisi",level:29},
  ],
  "Rayon / şəhər məhkəməsi": [
    {name:"Sektor müdiri, baş mühasib",level:30},
    {name:"Baş məsləhətçi",level:31},
    {name:"Böyük məsləhətçi",level:32},
    {name:"Aparıcı məsləhətçi",level:33},
    {name:"Məsləhətçi, hakimin köməkçisi",level:34},
  ],
  "Dövlət agentliyi / xidməti (Prezident təyin edən)": [
    {name:"Rəhbər",level:7},
    {name:"Rəhbərin müavini",level:9},
    {name:"Aparatın rəhbəri",level:11},
    {name:"Aparatın rəhbərinin müavini",level:14},
    {name:"Şöbə müdiri",level:15},
    {name:"Şöbə müdirinin müavini, müşaviri",level:17},
    {name:"Sektor müdiri, baş mühasib",level:20},
    {name:"Baş məsləhətçi",level:21},
    {name:"Böyük məsləhətçi",level:22},
    {name:"Aparıcı məsləhətçi",level:23},
    {name:"Məsləhətçi",level:24},
  ],
  "Dövlət agentliyi / xidməti (nazirlik yanında)": [
    {name:"Rəhbər",level:7},
    {name:"Rəhbərin müavini",level:9},
    {name:"Şöbə müdiri",level:16},
    {name:"Şöbə müdirinin müavini",level:19},
    {name:"Sektor müdiri, baş mühasib",level:21},
    {name:"Baş məsləhətçi",level:22},
    {name:"Böyük məsləhətçi",level:23},
    {name:"Aparıcı məsləhətçi",level:24},
    {name:"Məsləhətçi",level:25},
  ],
  "Digər MİH orqanları (nazirlik istisna)": [
    {name:"Aparatın rəhbəri",level:7},
    {name:"Rəhbərin müavini",level:9},
    {name:"Şöbə müdiri",level:11},
    {name:"Şöbə müdirinin müavini",level:15},
    {name:"Rəhbərin müşaviri, köməkçisi",level:15},
    {name:"Sektor müdiri, baş mühasib",level:19},
    {name:"Baş məsləhətçi",level:20},
    {name:"Böyük məsləhətçi",level:21},
    {name:"Aparıcı məsləhətçi",level:22},
    {name:"Məsləhətçi",level:23},
  ],
  "Digər MİH yanında dövlət agentliyi / xidməti": [
    {name:"Rəhbər",level:9},
    {name:"Rəhbərin müavini",level:11},
    {name:"Şöbə müdiri",level:20},
    {name:"Şöbə müdirinin müavini",level:23},
    {name:"Sektor müdiri, baş mühasib",level:25},
    {name:"Baş məsləhətçi",level:26},
    {name:"Böyük məsləhətçi",level:27},
    {name:"Aparıcı məsləhətçi",level:28},
    {name:"Məsləhətçi",level:29},
  ],
  "MİH yanında / tabeliyində orqanlar": [
    {name:"Rəhbər",level:22},
    {name:"Rəhbərin müavini",level:27},
    {name:"Sektor müdiri, baş mühasib",level:30},
    {name:"Baş məsləhətçi",level:31},
    {name:"Böyük məsləhətçi",level:32},
    {name:"Aparıcı məsləhətçi",level:33},
    {name:"Məsləhətçi",level:34},
  ],
  "MİH yerli bölmələri": [
    {name:"Rəhbər",level:23},
    {name:"Rəhbərin müavini",level:27},
    {name:"Sektor müdiri, baş mühasib",level:30},
    {name:"Baş məsləhətçi",level:31},
    {name:"Böyük məsləhətçi",level:32},
    {name:"Aparıcı məsləhətçi",level:33},
    {name:"Məsləhətçi",level:34},
  ],
  "Rayon / şəhər prokurorluğu": [
    {name:"Sektor müdiri, baş mühasib",level:30},
    {name:"Baş məsləhətçi",level:31},
    {name:"Böyük məsləhətçi",level:32},
    {name:"Aparıcı məsləhətçi",level:33},
    {name:"Məsləhətçi",level:34},
  ],
  "Yerli icra hakimiyyəti nümayəndəlikləri": [
    {name:"Baş məsləhətçi (şəhər/sahə dairəsi)",level:34},
    {name:"Baş məsləhətçi (qəsəbə/kənd dairəsi)",level:34},
    {name:"Məsləhətçi - mühəndis (şəhər/sahə dairəsi)",level:35},
    {name:"Məsləhətçi (qəsəbə/kənd dairəsi)",level:35},
  ],
  "Agentlik / xidmət yerli bölmələri": [
    {name:"Rəhbər",level:28},
    {name:"Rəhbərin müavini",level:29},
    {name:"Sektor müdiri, baş mühasib",level:31},
    {name:"Baş məsləhətçi",level:32},
    {name:"Böyük məsləhətçi",level:33},
    {name:"Aparıcı məsləhətçi",level:34},
    {name:"Məsləhətçi",level:35},
  ],
};

const supportOrgs: Record<string, Position[]> = {
  "Prezident Administrasiyası / İşlər İdarəsi / Xüsusi Tibb / Protokol Xidməti": [
    {name:"Baş mütəxəssis",level:1},{name:"Böyük mütəxəssis",level:2},
    {name:"Aparıcı mütəxəssis",level:3},{name:"Mütəxəssis",level:4},
  ],
  "Nazirlər Kabineti Aparatı və İşlər İdarəsi": [
    {name:"Baş mütəxəssis",level:2},{name:"Böyük mütəxəssis",level:3},
    {name:"Aparıcı mütəxəssis",level:4},{name:"Mütəxəssis",level:5},
  ],
  "Milli Məclis / Konstitusiya Məhkəməsi / Ali Məhkəmə Aparatı": [
    {name:"Baş mütəxəssis",level:2},{name:"Böyük mütəxəssis",level:3},
    {name:"Aparıcı mütəxəssis",level:4},{name:"Mütəxəssis",level:5},
  ],
  "Hesablama Palatası / Məhkəmə-Hüquq Şurası / Ombudsman / Baş Prokurorluq": [
    {name:"Baş mütəxəssis",level:6},{name:"Böyük mütəxəssis",level:7},
    {name:"Aparıcı mütəxəssis",level:8},{name:"Mütəxəssis",level:9},
  ],
  "Nazirlik aparatı": [
    {name:"Baş mütəxəssis",level:6},{name:"Böyük mütəxəssis",level:7},
    {name:"Aparıcı mütəxəssis",level:8},{name:"Mütəxəssis",level:9},
  ],
  "NMR Nazirlər Kabineti Aparatı": [
    {name:"Baş mütəxəssis",level:6},{name:"Böyük mütəxəssis",level:7},
    {name:"Aparıcı mütəxəssis",level:8},{name:"Mütəxəssis",level:9},
  ],
  "Digər MİH / Audiovizual Şura / Mərkəzi Seçki Komissiyası": [
    {name:"Baş mütəxəssis",level:10},{name:"Böyük mütəxəssis",level:11},
    {name:"Aparıcı mütəxəssis",level:12},{name:"Mütəxəssis",level:13},
  ],
  "Dövlət agentliyi / xidməti / Bakı Şəhər İcra Hakimiyyəti / Məhkəmələr / Prokurorluqlar": [
    {name:"Baş mütəxəssis",level:10},{name:"Böyük mütəxəssis",level:11},
    {name:"Aparıcı mütəxəssis",level:12},{name:"Mütəxəssis",level:13},
  ],
  "MİH yerli bölmələri / Rayon-şəhər məhkəmələri / Yerli icra hakimiyyəti": [
    {name:"Baş mütəxəssis",level:14},{name:"Böyük mütəxəssis",level:15},
    {name:"Aparıcı mütəxəssis",level:16},{name:"Mütəxəssis",level:17},
  ],
};

// ═══════════════════════════════════════════════
// İxtisas dərəcəsi əlavəsi (17 dərəcə)
// ═══════════════════════════════════════════════
const specialtyGrades: { name: string; amount: number }[] = [
  { name: "Həqiqi dövlət müşaviri", amount: 600 },
  { name: "1-ci dərəcə dövlət müşaviri", amount: 550 },
  { name: "2-ci dərəcə dövlət müşaviri", amount: 500 },
  { name: "3-cü dərəcə dövlət müşaviri", amount: 450 },
  { name: "Dövlət qulluğunun baş müşaviri", amount: 400 },
  { name: "Dövlət qulluğunun müşaviri", amount: 350 },
  { name: "Dövlət qulluğunun kiçik müşaviri", amount: 300 },
  { name: "1-ci dərəcə dövlət qulluqçusu", amount: 275 },
  { name: "2-ci dərəcə dövlət qulluqçusu", amount: 250 },
  { name: "3-cü dərəcə dövlət qulluqçusu", amount: 225 },
  { name: "Kiçik dövlət qulluqçusu", amount: 200 },
  { name: "Dövlət qulluğunun baş referenti", amount: 175 },
  { name: "Dövlət qulluğunun böyük referenti", amount: 150 },
  { name: "Dövlət qulluğunun 1-ci dərəcə referenti", amount: 125 },
  { name: "Dövlət qulluğunun 2-ci dərəcə referenti", amount: 100 },
  { name: "Dövlət qulluğunun 3-cü dərəcə referenti", amount: 75 },
  { name: "Dövlət qulluğunun kiçik referenti", amount: 50 },
];

// ═══════════════════════════════════════════════
// Pillə-staj cədvəli
// ═══════════════════════════════════════════════
const stepInfo = [
  { label: "I", range: "1 ilədək" },
  { label: "II", range: "1–5 il" },
  { label: "III", range: "5–10 il" },
  { label: "IV", range: "10–15 il" },
  { label: "V", range: "15–20 il" },
  { label: "VI", range: "20–25 il" },
  { label: "VII", range: "25+ il" },
];

// ═══════════════════════════════════════════════
// Vergi hesablaması (Dövlət sektoru)
// ═══════════════════════════════════════════════
// Gəlir vergisi hesablaması
// taxable = Vergiyə cəlb olunan məbləğ (gross - güzəşt)
// ≤200: 0%
// 200-2500: (taxable - 200) × 14%
// >2500: 350 + (taxable - 2500) × 25%
function calcIncomeTax(taxable: number): number {
  if (taxable <= 200) return 0;
  if (taxable <= 2500) return (taxable - 200) * 0.14;
  return 350 + (taxable - 2500) * 0.25;
}

function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 8000 * 0.02 + (gross - 8000) * 0.005;
}

interface CalcNetParams {
  gross: number;
  baseSalary: number;
  guzesht: number; // 0 for güzəştsiz, V.M. amount for güzəştlə
  unionMember: boolean;
  yapaMember: boolean;
}

function calcNet(p: CalcNetParams) {
  const taxable = Math.max(0, p.gross - p.guzesht);
  const incomeTax = calcIncomeTax(taxable);
  const dsmf = p.gross * 0.03;
  const unemployment = p.gross * 0.005;
  const medical = calcStateMedical(p.gross);
  const union = p.unionMember ? p.gross * 0.02 : 0;
  // YAP: baseSalary-dan (ixtisas dərəcəsi əlavəsi daxil deyil)
  const yapa = p.yapaMember ? p.baseSalary * 0.01 : 0;
  const totalDeductions = incomeTax + dsmf + unemployment + medical + union + yapa;
  return { net: Math.max(0, p.gross - totalDeductions), incomeTax, dsmf, unemployment, medical, union, yapa, totalDeductions, taxable, guzesht: p.guzesht };
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type JobType = "admin" | "support";

const pageTranslations = {
  az: {
    title: "Dövlət qulluqçularının maaş hesablayıcısı",
    description: "Qurum, vəzifə və pilləyə uyğun aylıq vəzifə maaşını (gross və net) hesablayın — Prezidentin 19 mart 2026-cı il tarixli Fərmanına əsasən.",
    breadcrumbCategory: "Hüquq və Dövlət",
    breadcrumbLabel: "Dövlət qulluqçusu maaş hesablayıcısı",
    formulaTitle: "Dövlət qulluqçusunun maaşı necə hesablanır? (Yeni qayda 2026)",
    formulaContent: `Prezidentin 19 mart 2026-cı il tarixli Fərmanına əsasən:

1. Vəzifə maaşı cədvəldən müəyyən edilir (səviyyə × pillə)
2. Aylıq vəzifə maaşları tam ədədə (sonuncu rəqəmi 0 və ya 5) yuvarlaqlaşdırılır

Dövlət sektoru üzrə tutulmalar (işçidən):
• Gəlir vergisi:
  0–200₼: 0%
  200–2500₼: (maaş − 200) × 14%
  2500₼+: 350 + (maaş − 2500) × 25%
• DSMF: 3%
• İşsizlik sığortası: 0,5%
• İcbari tibbi sığorta: 8000₼-dək 2%, üstü 0,5%
• Həmkarlar təşkilatına üzvlük haqqı: 2%

Net maaş = Gross − Gəlir vergisi − DSMF − İşsizlik − Tibbi sığorta − Həmkarlar üzvlük haqqı

Pillə sistemi (vəzifədəki staj müddəti):
• I pillə: 1 ilədək staj
• II pillə: 1–5 il staj
• III pillə: 5–10 il staj
• IV pillə: 10–15 il staj
• V pillə: 15–20 il staj
• VI pillə: 20–25 il staj
• VII pillə: 25 ildən yuxarı staj

Qeyd: Pillə həmin vəzifədəki staj müddətinə görə müəyyən edilir.`,
    jobType: "Vəzifə növü",
    adminJob: "İnzibati vəzifə",
    adminJobDesc: "35 ödəniş səviyyəsi (aparatın rəhbəri, şöbə müdiri, məsləhətçi...)",
    supportJob: "Yardımçı vəzifə",
    supportJobDesc: "17 ödəniş səviyyəsi (mütəxəssis, inspektor, kargüzar...)",
    organization: "Qurum",
    selectOrg: "Qurum seçin...",
    selectJobFirst: "Əvvəlcə vəzifə növünü seçin",
    position: "Vəzifə",
    selectPos: "Vəzifə seçin...",
    selectOrgFirst: "Əvvəlcə qurumu seçin",
    level: "səviyyə",
    payStep: "Ödəniş pilləsi",
    stepNote: "Pillə vəzifədəki staja görə müəyyən edilir (I: 1 ilədək, II: 1–5 il ... VII: 25+ il).",
    stepTableTitle: "Pillə — Staj müddəti cədvəli",
    step: "pillə",
    netSalary: "Net əmək haqqı (əlinizə çatan)",
    grossSalary: "Gross əmək haqqı",
    perMonth: "AZN / ay",
    stateSector: "Dövlət sektoru",
    levelLabel: "Səviyyə",
    employeeDeductions: "İşçidən tutulan",
    incomeTax: "Gəlir vergisi",
    incomeTaxDesc: "200₼-dək 0%, 200–2500₼ arası 14%, 2500₼-dan çox 25%",
    noTaxNote: "200₼-dək gəlir vergisi tutulmur",
    totalLabel: "Cəmi",
    dsmf: "DSMF",
    dsmfDesc: "Gross məbləğin 3%-i",
    unemployment: "İşsizlik sığortası",
    medical: "İcbari tibbi sığorta",
    medicalDesc: "8000₼-dək 2%, 8000₼-dan çox 0,5%",
    totalDeduction: "Cəmi tutulma",
    annualCalc: "İllik hesablama",
    annualNetIncome: "İllik net gəlir",
    annualGross: "İllik gross",
    annualDeduction: "İllik tutulma",
    orgLabel: "Qurum",
    jobTypeLabel: "Vəzifə növü",
    adminLabel: "İnzibati",
    supportLabel: "Yardımçı",
    payLevel: "Ödəniş səviyyəsi",
    stepLabel: "Pillə",
    specialtyGrade: "İxtisas dərəcəsi (əlavə haqq)",
    selectGrade: "Yoxdur / Seçin...",
    gradeBonus: "İxtisas dərəcəsi əlavəsi",
    totalWithGrade: "Ümumi gross (maaş + ixtisas əlavəsi)",
    // Güzəşt system
    taxMode: "Vergi güzəşti",
    noExemption: "Güzəştsiz",
    withExemption: "Güzəştlə",
    selectExemption: "Güzəşti seçin:",
    vm1021_1: "V.M. 102.1-1 (800 AZN)",
    vm1021_1Desc: "Şəhid statusu almış şəxslərin valideyinlərinin, dul arvadlarının (ərlərinin) və övladlarının",
    vm1022: "V.M. 102.2 (400 AZN)",
    vm1022Desc: "Vətən Müharibəsi Qəhrəmanları, Milli Qəhrəmanlar, Sovet İttifaqı və Sosialist Əməyi Qəhrəmanları, müharibə əlilləri, şəhid dul arvadları/övladları, 1941-1945 arxa cəbhə fədakarları, Çernobıl qəzası zərərçəkmişləri",
    vm1023: "V.M. 102.3 (200 AZN)",
    vm1023Desc: "Orqanizmin funksiyalarının 61-100% pozulmasına görə əlilliyi müəyyən edilmiş şəxslər, əlilli uşaqlar, daimi qulluq tələb edən əlilli uşağa baxan valideynlər",
    vm1024: "V.M. 102.4 (100 AZN)",
    vm1024Desc: "Şəhid valideynləri və arvadları (ərləri), Əfqanıstan və döyüş əməliyyatlarına göndərilmiş hərbçilər, məcburi köçkünlər",
    vm1025: "V.M. 102.5 (əlavə 50 AZN)",
    vm1025Desc: "Himayəsində 3+ nəfər olan (23 yaşınadək şagird/tələbə, ər/arvad) — hər biri üçün 50 AZN əlavə",
    dependentCount: "Himayədə olanların sayı",
    taxableAmount: "Vergiyə cəlb olunan məbləğ",
    exemptionAmount: "Güzəşt məbləği",
    // Memberships
    unionLabel: "Həmkarlar İttifaqı üzvüyəm",
    yapaMember: "YAP üzvü",
    yapaDesc: "Vəzifə maaşının 1%-i (ixtisas dərəcəsi əlavəsi daxil deyil)",
    memberships: "Üzvlüklər",
    emptyStateText: "Nəticəni görmək üçün qurum, vəzifə və pilləni seçin.",
  },
  en: {
    title: "Civil Servant Salary Calculator",
    description: "Calculate the monthly salary (gross and net) based on institution, position, and step — per the Presidential Decree of March 19, 2026.",
    breadcrumbCategory: "Law & Government",
    breadcrumbLabel: "Civil servant salary calculator",
    formulaTitle: "How is a civil servant's salary calculated? (New rules 2026)",
    formulaContent: `Per the Presidential Decree of March 19, 2026:

1. Position salary is determined from the table (level × step)
2. Monthly salaries are rounded to whole numbers (last digit 0 or 5)

Government sector deductions (from employee):
• Income tax:
  0–200₼: 0%
  200–2500₼: (salary − 200) × 14%
  2500₼+: 350 + (salary − 2500) × 25%
• SSPF: 3%
• Unemployment insurance: 0.5%
• Compulsory medical insurance: up to 8000₼ 2%, above 0.5%
• Trade union membership fee: 2%

Net salary = Gross − Income tax − SSPF − Unemployment − Medical insurance − Trade union fee

Step system (tenure in position):
• Step I: up to 1 year
• Step II: 1–5 years
• Step III: 5–10 years
• Step IV: 10–15 years
• Step V: 15–20 years
• Step VI: 20–25 years
• Step VII: over 25 years

Note: Step is determined by tenure in the position.`,
    jobType: "Position type",
    adminJob: "Administrative position",
    adminJobDesc: "35 pay levels (department head, section chief, advisor...)",
    supportJob: "Support position",
    supportJobDesc: "17 pay levels (specialist, inspector, clerk...)",
    organization: "Institution",
    selectOrg: "Select institution...",
    selectJobFirst: "First select position type",
    position: "Position",
    selectPos: "Select position...",
    selectOrgFirst: "First select institution",
    level: "level",
    payStep: "Pay step",
    stepNote: "Step is determined by tenure in position (I: up to 1 yr, II: 1–5 yrs ... VII: 25+ yrs).",
    stepTableTitle: "Step — Tenure table",
    step: "step",
    netSalary: "Net salary (take-home)",
    grossSalary: "Gross salary",
    perMonth: "AZN / month",
    stateSector: "Government sector",
    levelLabel: "Level",
    employeeDeductions: "Employee deductions",
    incomeTax: "Income tax",
    incomeTaxDesc: "Up to 200₼ 0%, 200–2500₼ 14%, above 2500₼ 25%",
    noTaxNote: "No income tax on amounts up to 200₼",
    totalLabel: "Total",
    dsmf: "SSPF",
    dsmfDesc: "3% of gross amount",
    unemployment: "Unemployment insurance",
    medical: "Compulsory medical insurance",
    medicalDesc: "Up to 8000₼ 2%, above 8000₼ 0.5%",
    totalDeduction: "Total deduction",
    annualCalc: "Annual calculation",
    annualNetIncome: "Annual net income",
    annualGross: "Annual gross",
    annualDeduction: "Annual deduction",
    orgLabel: "Institution",
    jobTypeLabel: "Position type",
    adminLabel: "Administrative",
    supportLabel: "Support",
    payLevel: "Pay level",
    stepLabel: "Step",
    specialtyGrade: "Specialty grade (bonus)",
    selectGrade: "None / Select...",
    gradeBonus: "Specialty grade bonus",
    totalWithGrade: "Total gross (salary + specialty bonus)",
    taxMode: "Tax exemption",
    noExemption: "No exemption",
    withExemption: "With exemption",
    selectExemption: "Select exemption:",
    vm1021_1: "V.M. 102.1-1 (800 AZN)",
    vm1021_1Desc: "Parents, widows and children of martyrs",
    vm1022: "V.M. 102.2 (400 AZN)",
    vm1022Desc: "National Heroes, war veterans, war disabled, Chernobyl victims",
    vm1023: "V.M. 102.3 (200 AZN)",
    vm1023Desc: "Persons with 61-100% disability, disabled children, caregivers",
    vm1024: "V.M. 102.4 (100 AZN)",
    vm1024Desc: "Parents/spouses of martyrs, Afghan war veterans, IDPs",
    vm1025: "V.M. 102.5 (additional 50 AZN)",
    vm1025Desc: "3+ dependents (students under 23, spouse) — 50 AZN each additional",
    dependentCount: "Number of dependents",
    taxableAmount: "Taxable amount",
    exemptionAmount: "Exemption amount",
    unionLabel: "Trade union member",
    yapaMember: "YAP member",
    yapaDesc: "1% of base salary (excl. specialty bonus)",
    memberships: "Memberships",
    emptyStateText: "Select institution, position, and step to see the result.",
  },
  ru: {
    title: "Калькулятор зарплаты госслужащих",
    description: "Рассчитайте ежемесячную зарплату (брутто и нетто) по учреждению, должности и ступени — согласно Указу Президента от 19 марта 2026 года.",
    breadcrumbCategory: "Право и государство",
    breadcrumbLabel: "Калькулятор зарплаты госслужащих",
    formulaTitle: "Как рассчитывается зарплата госслужащего? (Новые правила 2026)",
    formulaContent: `Согласно Указу Президента от 19 марта 2026 года:

1. Должностной оклад определяется из таблицы (уровень × ступень)
2. Ежемесячные оклады округляются до целых чисел (последняя цифра 0 или 5)

Удержания в госсекторе (с работника):
• Подоходный налог:
  0–200₼: 0%
  200–2500₼: (оклад − 200) × 14%
  2500₼+: 350 + (оклад − 2500) × 25%
• ГФСЗ: 3%
• Страхование от безработицы: 0,5%
• Обяз. медстрахование: до 8000₼ 2%, свыше 0,5%
• Членский взнос профсоюза: 2%

Нетто = Брутто − Подоходный налог − ГФСЗ − Безработица − Медстрахование − Профсоюз

Система ступеней (стаж на должности):
• Ступень I: до 1 года
• Ступень II: 1–5 лет
• Ступень III: 5–10 лет
• Ступень IV: 10–15 лет
• Ступень V: 15–20 лет
• Ступень VI: 20–25 лет
• Ступень VII: свыше 25 лет

Примечание: Ступень определяется стажем на данной должности.`,
    jobType: "Тип должности",
    adminJob: "Административная должность",
    adminJobDesc: "35 уровней оплаты (руководитель аппарата, начальник отдела, советник...)",
    supportJob: "Вспомогательная должность",
    supportJobDesc: "17 уровней оплаты (специалист, инспектор, делопроизводитель...)",
    organization: "Учреждение",
    selectOrg: "Выберите учреждение...",
    selectJobFirst: "Сначала выберите тип должности",
    position: "Должность",
    selectPos: "Выберите должность...",
    selectOrgFirst: "Сначала выберите учреждение",
    level: "уровень",
    payStep: "Ступень оплаты",
    stepNote: "Ступень определяется стажем на должности (I: до 1 г., II: 1–5 л. ... VII: 25+ л.).",
    stepTableTitle: "Ступень — Таблица стажа",
    step: "ступень",
    netSalary: "Нетто-зарплата (на руки)",
    grossSalary: "Брутто-зарплата",
    perMonth: "AZN / мес.",
    stateSector: "Государственный сектор",
    levelLabel: "Уровень",
    employeeDeductions: "Удержания с работника",
    incomeTax: "Подоходный налог",
    incomeTaxDesc: "До 200₼ 0%, 200–2500₼ 14%, свыше 2500₼ 25%",
    noTaxNote: "На суммы до 200₼ подоходный налог не начисляется",
    totalLabel: "Итого",
    dsmf: "ГФСЗ",
    dsmfDesc: "3% от брутто-суммы",
    unemployment: "Страхование от безработицы",
    medical: "Обяз. медицинское страхование",
    medicalDesc: "До 8000₼ 2%, свыше 8000₼ 0,5%",
    totalDeduction: "Общее удержание",
    annualCalc: "Годовой расчёт",
    annualNetIncome: "Годовой нетто-доход",
    annualGross: "Годовой брутто",
    annualDeduction: "Годовое удержание",
    orgLabel: "Учреждение",
    jobTypeLabel: "Тип должности",
    adminLabel: "Административная",
    supportLabel: "Вспомогательная",
    payLevel: "Уровень оплаты",
    stepLabel: "Ступень",
    specialtyGrade: "Квалификационный разряд (надбавка)",
    selectGrade: "Нет / Выберите...",
    gradeBonus: "Надбавка за квалификационный разряд",
    totalWithGrade: "Общий брутто (оклад + надбавка)",
    taxMode: "Налоговая льгота",
    noExemption: "Без льготы",
    withExemption: "Со льготой",
    selectExemption: "Выберите льготу:",
    vm1021_1: "V.M. 102.1-1 (800 AZN)",
    vm1021_1Desc: "Родители, вдовы и дети шехидов",
    vm1022: "V.M. 102.2 (400 AZN)",
    vm1022Desc: "Национальные герои, ветераны, инвалиды войны, жертвы Чернобыля",
    vm1023: "V.M. 102.3 (200 AZN)",
    vm1023Desc: "Лица с инвалидностью 61-100%, дети-инвалиды, опекуны",
    vm1024: "V.M. 102.4 (100 AZN)",
    vm1024Desc: "Родители/супруги шехидов, ветераны Афганистана, вынужденные переселенцы",
    vm1025: "V.M. 102.5 (доп. 50 AZN)",
    vm1025Desc: "3+ иждивенца (студенты до 23, супруг) — 50 AZN за каждого",
    dependentCount: "Количество иждивенцев",
    taxableAmount: "Налогооблагаемая сумма",
    exemptionAmount: "Сумма льготы",
    unionLabel: "Член профсоюза",
    yapaMember: "Член ПНА",
    yapaDesc: "1% от должностного оклада (без надбавки)",
    memberships: "Членство",
    emptyStateText: "Выберите учреждение, должность и ступень, чтобы увидеть результат.",
  },
};

export default function CivilServantSalary() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [jobType, setJobType] = useState<JobType | null>(null);
  const [org, setOrg] = useState("");
  const [posIdx, setPosIdx] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [gradeIdx, setGradeIdx] = useState<number | null>(null);
  const [exemptionMode, setExemptionMode] = useState<"none" | "exempt">("none");
  const [selectedExemption, setSelectedExemption] = useState<number>(200); // default 200 AZN
  const [vm1025Enabled, setVm1025Enabled] = useState(false);
  const [dependentCount, setDependentCount] = useState("3");
  const [unionMember, setUnionMember] = useState(false);
  const [yapaMember, setYapaMember] = useState(false);

  const orgs = jobType === "admin" ? adminOrgs : jobType === "support" ? supportOrgs : null;
  const grid = jobType === "admin" ? adminGrid : supportGrid;
  const positions = orgs && org ? orgs[org] : null;

  const pos = positions && posIdx !== null ? positions[posIdx] : null;
  const baseSalary = pos && step !== null ? grid[pos.level]?.[step] ?? null : null;
  const gradeBonus = gradeIdx !== null ? specialtyGrades[gradeIdx].amount : 0;
  const gross = baseSalary !== null ? baseSalary + gradeBonus : null;
  // Güzəşt məbləği: güzəştsiz = 0, güzəştlə = V.M. məbləği
  const guzesht = (() => {
    if (exemptionMode === "none") return 0;
    let amount = selectedExemption;
    if (vm1025Enabled) {
      const deps = parseInt(dependentCount) || 0;
      amount += deps * 50;
    }
    return amount;
  })();

  const result = gross !== null && baseSalary !== null ? calcNet({
    gross,
    baseSalary,
    guzesht,
    unionMember,
    yapaMember,
  }) : null;

  function handleJobType(type: JobType) {
    setJobType(type);
    setOrg("");
    setPosIdx(null);
    setStep(null);
  }

  function handleOrg(value: string) {
    setOrg(value);
    setPosIdx(null);
    setStep(null);
  }

  function handlePos(value: string) {
    setPosIdx(value ? parseInt(value) : null);
    setStep(null);
  }

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=legal" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "overtime", "vacation-pay"]}
    >
      {/* Vəzifə növü */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.jobType}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleJobType("admin")}
            className={`p-3 rounded-xl border text-left transition-all ${
              jobType === "admin"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.adminJob}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.adminJobDesc}</p>
          </button>
          <button
            onClick={() => handleJobType("support")}
            className={`p-3 rounded-xl border text-left transition-all ${
              jobType === "support"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.supportJob}</p>
            <p className="text-[11px] text-muted mt-0.5">{pt.supportJobDesc}</p>
          </button>
        </div>
      </div>

      {/* Qurum */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.organization}</label>
        <select
          value={org}
          onChange={(e) => handleOrg(e.target.value)}
          disabled={!orgs}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          <option value="">{orgs ? pt.selectOrg : pt.selectJobFirst}</option>
          {orgs && Object.keys(orgs).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Vəzifə */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.position}</label>
        <select
          value={posIdx !== null ? String(posIdx) : ""}
          onChange={(e) => handlePos(e.target.value)}
          disabled={!positions}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          <option value="">{positions ? pt.selectPos : pt.selectOrgFirst}</option>
          {positions && positions.map((p, i) => (
            <option key={i} value={i}>{p.name} ({pt.level} {p.level})</option>
          ))}
        </select>
      </div>

      {/* Ödəniş pilləsi */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.payStep}</label>
        <div className="flex gap-2">
          {stepInfo.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              disabled={posIdx === null}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                step === i
                  ? "border-primary bg-primary-light ring-2 ring-primary text-primary-dark"
                  : "border-border bg-white hover:border-primary/30 text-foreground"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-2">{pt.stepNote}</p>
      </div>

      {/* İxtisas dərəcəsi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">🎓 {pt.specialtyGrade}</label>
        <select
          value={gradeIdx !== null ? String(gradeIdx) : ""}
          onChange={(e) => setGradeIdx(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        >
          <option value="">{pt.selectGrade}</option>
          {specialtyGrades.map((g, i) => (
            <option key={i} value={i}>{g.name} (+{g.amount} AZN)</option>
          ))}
        </select>
      </div>

      {/* Həmkarlar + YAP */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">🏛️ {pt.memberships}</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unionMember}
              onChange={(e) => setUnionMember(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">{pt.unionLabel}</span>
            <span className="text-[11px] text-muted">(2%)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={yapaMember}
              onChange={(e) => setYapaMember(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">{pt.yapaMember}</span>
            <span className="text-[11px] text-muted">(1%)</span>
          </label>
        </div>
      </div>

      {/* Güzəştsiz / Güzəştlə */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">⚖️ {pt.taxMode}</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="exemption"
              checked={exemptionMode === "none"}
              onChange={() => setExemptionMode("none")}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">{pt.noExemption}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="exemption"
              checked={exemptionMode === "exempt"}
              onChange={() => setExemptionMode("exempt")}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">{pt.withExemption}</span>
          </label>
        </div>

        {exemptionMode === "exempt" && (
          <div className="space-y-3 pl-1">
            <p className="text-sm font-medium text-foreground">{pt.selectExemption}</p>

            {/* V.M. 102.1-1 */}
            <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${selectedExemption === 800 ? "border-primary bg-primary-light ring-1 ring-primary" : "border-border bg-white hover:border-primary/30"}`}>
              <div className="flex items-start gap-2">
                <input type="radio" name="vm" checked={selectedExemption === 800} onChange={() => setSelectedExemption(800)} className="w-4 h-4 mt-0.5 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.vm1021_1}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.vm1021_1Desc}</p>
                </div>
              </div>
            </label>

            {/* V.M. 102.2 */}
            <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${selectedExemption === 400 ? "border-primary bg-primary-light ring-1 ring-primary" : "border-border bg-white hover:border-primary/30"}`}>
              <div className="flex items-start gap-2">
                <input type="radio" name="vm" checked={selectedExemption === 400} onChange={() => setSelectedExemption(400)} className="w-4 h-4 mt-0.5 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.vm1022}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.vm1022Desc}</p>
                </div>
              </div>
            </label>

            {/* V.M. 102.3 */}
            <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${selectedExemption === 200 ? "border-primary bg-primary-light ring-1 ring-primary" : "border-border bg-white hover:border-primary/30"}`}>
              <div className="flex items-start gap-2">
                <input type="radio" name="vm" checked={selectedExemption === 200} onChange={() => setSelectedExemption(200)} className="w-4 h-4 mt-0.5 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.vm1023}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.vm1023Desc}</p>
                </div>
              </div>
            </label>

            {/* V.M. 102.4 */}
            <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${selectedExemption === 100 ? "border-primary bg-primary-light ring-1 ring-primary" : "border-border bg-white hover:border-primary/30"}`}>
              <div className="flex items-start gap-2">
                <input type="radio" name="vm" checked={selectedExemption === 100} onChange={() => setSelectedExemption(100)} className="w-4 h-4 mt-0.5 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.vm1024}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.vm1024Desc}</p>
                </div>
              </div>
            </label>

            {/* V.M. 102.5 */}
            <div className={`p-3 rounded-xl border transition-all ${vm1025Enabled ? "border-primary bg-primary-light ring-1 ring-primary" : "border-border bg-white"}`}>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={vm1025Enabled} onChange={(e) => setVm1025Enabled(e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{pt.vm1025}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.vm1025Desc}</p>
                </div>
              </label>
              {vm1025Enabled && (
                <div className="mt-2 ml-6">
                  <label className="text-xs text-muted">{pt.dependentCount}</label>
                  <input
                    type="number"
                    value={dependentCount}
                    onChange={(e) => setDependentCount(e.target.value)}
                    min="3"
                    max="10"
                    className="w-20 ml-2 px-3 py-1.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pillə-Staj cədvəli */}
      <div className="mb-8 bg-blue-50 rounded-xl border border-blue-200 p-4">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
          <span>&#128197;</span>
          {pt.stepTableTitle}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepInfo.map((s, i) => (
            <div
              key={i}
              className={`rounded-lg border p-2.5 text-center transition-all ${
                step === i
                  ? "border-primary bg-primary-light"
                  : "border-blue-200 bg-white"
              }`}
            >
              <p className={`text-lg font-bold ${step === i ? "text-primary" : "text-foreground"}`}>{s.label} {pt.step}</p>
              <p className="text-xs text-muted">{s.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nəticə */}
      {result && gross !== null && baseSalary !== null && pos ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className={`grid grid-cols-1 ${gradeBonus > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netSalary}</p>
              <p className="text-3xl font-bold">{formatMoney(result.net)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.grossSalary}</p>
              <p className="text-3xl font-bold text-foreground">{formatMoney(baseSalary)}</p>
              <p className="text-xs text-muted mt-1">{pt.perMonth}</p>
            </div>
            {gradeBonus > 0 && (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
                <p className="text-sm text-green-600 mb-1">{pt.gradeBonus}</p>
                <p className="text-2xl font-bold text-green-700">+{formatMoney(gradeBonus)}</p>
                <p className="text-xs text-green-600 mt-1">{pt.totalWithGrade}: {formatMoney(gross)} AZN</p>
              </div>
            )}
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {pt.stateSector} — {pt.levelLabel} {pos.level}, {stepInfo[step!].label} {pt.step}
            </span>
          </div>

          {/* İşçidən tutulan */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>&#128100;</span>
                {pt.employeeDeductions}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {/* Vergiyə cəlb olunan + Gəlir vergisi */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted">{pt.taxableAmount}</span>
                  <span className="text-sm font-medium text-foreground">{formatMoney(result.taxable)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mb-2">
                  <p className="text-xs text-muted">{formatMoney(gross!)} − {formatMoney(result.guzesht)} ({pt.exemptionAmount}) = <span className="font-medium text-foreground">{formatMoney(result.taxable)} AZN</span></p>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.incomeTax}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.incomeTax)} AZN</span>
                </div>
                {result.incomeTax === 0 ? (
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="text-xs text-green-600">{pt.noTaxNote}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                    {(() => {
                      const taxable = result.taxable;
                      if (taxable <= 2500) {
                        return <p className="text-xs text-muted">({formatMoney(taxable)} − 200) × 14% = <span className="font-medium text-foreground">{formatMoney(result.incomeTax)} AZN</span></p>;
                      }
                      return (
                        <>
                          <p className="text-xs text-muted">350 + ({formatMoney(taxable)} − 2.500) × 25%</p>
                          <p className="text-xs text-muted">= 350 + {formatMoney((taxable - 2500) * 0.25)}</p>
                          <p className="text-xs font-medium text-foreground border-t border-border pt-1">= {formatMoney(result.incomeTax)} AZN</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* DSMF */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.dsmf}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dsmf)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{pt.dsmfDesc}</p>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(gross)}₼ × 3% = <span className="font-medium text-foreground">{formatMoney(result.dsmf)} AZN</span></p>
                </div>
              </div>

              {/* İşsizlik */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.unemployment}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.unemployment)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(result.unemployment)} AZN</span></p>
                </div>
              </div>

              {/* İcbari tibbi sığorta */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{pt.medical}</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.medical)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">{pt.medicalDesc}</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {gross <= 8000 ? (
                    <p className="text-xs text-muted">{formatMoney(gross)}₼ × 2% = <span className="font-medium text-foreground">{formatMoney(result.medical)} AZN</span></p>
                  ) : (
                    <>
                      <p className="text-xs text-muted">8000₼ × 2% = <span className="font-medium text-foreground">{formatMoney(8000 * 0.02)} AZN</span></p>
                      <p className="text-xs text-muted">{gross - 8000}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney((gross - 8000) * 0.005)} AZN</span></p>
                      <p className="text-xs font-medium text-foreground border-t border-border pt-1">{pt.totalLabel}: {formatMoney(result.medical)} AZN</p>
                    </>
                  )}
                </div>
              </div>

              {/* Həmkarlar */}
              {unionMember && (
                <div className="px-5 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{pt.unionLabel}</span>
                    <span className="text-sm font-bold text-foreground">{formatMoney(result.union)} AZN</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 mt-1.5">
                    <p className="text-xs text-muted">{formatMoney(gross!)}₼ × 2% = <span className="font-medium text-foreground">{formatMoney(result.union)} AZN</span></p>
                  </div>
                </div>
              )}

              {/* YAP */}
              {yapaMember && (
                <div className="px-5 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{pt.yapaMember}</span>
                    <span className="text-sm font-bold text-foreground">{formatMoney(result.yapa)} AZN</span>
                  </div>
                  <p className="text-[11px] text-muted">{pt.yapaDesc}</p>
                  <div className="bg-gray-50 rounded-lg p-2.5 mt-1.5">
                    <p className="text-xs text-muted">{formatMoney(baseSalary)}₼ × 1% = <span className="font-medium text-foreground">{formatMoney(result.yapa)} AZN</span></p>
                  </div>
                </div>
              )}

              {/* Cəmi */}
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">{pt.totalDeduction}</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>

          {/* İllik hesablama */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>&#128197;</span>
              {pt.annualCalc}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualNetIncome}</p>
                <p className="text-lg font-bold text-primary">{formatMoney(result.net * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualGross}</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(gross * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.annualDeduction}</p>
                <p className="text-lg font-bold text-red-600">{formatMoney(result.totalDeductions * 12)} AZN</p>
              </div>
            </div>
          </div>

          {/* Seçim xülasəsi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">{pt.orgLabel}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{org}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">{pt.jobTypeLabel}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{jobType === "admin" ? pt.adminLabel : pt.supportLabel}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">{pt.payLevel}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{pt.levelLabel} {pos.level}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">{pt.stepLabel}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{stepInfo[step!].label} {pt.step} ({stepInfo[step!].range})</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">&#127970;</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
