import { useState, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";
import { Select } from "@/components/Select";
import { Checkbox } from "@/components/Controls";
import {
  InfoBox,
  ResultHero,
  StatGrid,
  FormulaSection,
  RelatedCalculators,
} from "@/components/Content";
import { useTheme } from "@/constants/theme";
import { fmtNum } from "@/lib/format";

// Mənbə: saytdakı /hesablayici/dovlet-qullugcusu (Prezidentin 19 mart 2026-cı il Fərmanı)

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

// İnzibati vəzifələr üzrə 4 pilləli cədvəl (sekildeki qurumlar üçün)
const adminGrid4: Record<number, number[]> = {
  1:[13680,14020,14365,14705],
  2:[12725,13045,13360,13680],
  3:[11835,12135,12430,12725],
  4:[11010,11285,11560,11835],
  5:[10245,10500,10755,11010],
  6:[9530,9765,10005,10245],
  7:[8865,9085,9305,9530],
  8:[8245,8450,8660,8865],
  9:[7670,7860,8055,8245],
  10:[7135,7315,7490,7670],
  11:[6635,6805,6970,7135],
  12:[6175,6330,6485,6635],
  13:[5745,5885,6030,6175],
  14:[5340,5475,5610,5745],
  15:[4970,5095,5220,5340],
  16:[4625,4740,4855,4970],
  17:[4300,4410,4515,4625],
  18:[4000,4100,4200,4300],
  19:[3720,3815,3910,4000],
  20:[3460,3550,3635,3720],
  21:[3220,3300,3380,3460],
  22:[2995,3070,3145,3220],
  23:[2785,2855,2925,2995],
  24:[2590,2655,2720,2785],
  25:[2410,2470,2530,2595],
  26:[2245,2300,2355,2410],
  27:[2085,2140,2190,2245],
  28:[1940,1990,2040,2085],
  29:[1805,1850,1895,1940],
  30:[1680,1720,1765,1805],
  31:[1560,1600,1640,1680],
  32:[1455,1490,1525,1560],
  33:[1355,1385,1420,1455],
  34:[1260,1290,1320,1355],
  35:[1170,1200,1230,1260],
};

// Yardımçı vəzifələr üzrə 4 pilləli cədvəl
const supportGrid4: Record<number, number[]> = {
  1:[1165,1195,1220,1250],
  2:[1135,1160,1190,1220],
  3:[1105,1130,1160,1185],
  4:[1075,1100,1130,1155],
  5:[1045,1070,1100,1125],
  6:[1020,1045,1070,1095],
  7:[990,1015,1040,1065],
  8:[965,990,1015,1040],
  9:[940,965,985,1010],
  10:[915,940,960,985],
  11:[890,915,935,960],
  12:[870,890,910,935],
  13:[845,865,890,910],
  14:[825,845,865,885],
  15:[800,820,840,860],
  16:[780,800,820,840],
  17:[760,780,800,815],
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

// Sadələşdirilmiş 4 pillə — hər biri grid-dəki müvafiq sütuna uyğunlaşır
const simpleSteps = [
  { label: "1-ci", range: "1 ilədək", gridIndex: 0 },
  { label: "2-ci", range: "1–5 il", gridIndex: 1 },
  { label: "3-cü", range: "5–15 il", gridIndex: 2 },
  { label: "4-cü", range: "15+ il", gridIndex: 3 },
];

// Yuxarı səviyyəli qurumlar — 7 pillə saxlayır. Qalanları 4 pillə göstərir.
const fullStepOrgs = new Set([
  "Prezident Administrasiyası",
  "Birinci vitse-prezidentin Katibliyi",
  "Prezidentin İşlər İdarəsi",
  "Xüsusi Tibb Xidməti",
  "Prezidentin Protokol Xidməti",
  "Təhlükəsizlik Şurası katibinin xidməti",
  "Nazirlər Kabineti Aparatı",
  "Milli Məclis Aparatı",
  "Konstitusiya Məhkəməsi Aparatı",
  "Ali Məhkəmə Aparatı",
]);

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
  unionRate: 0 | 1 | 2; // faiz
  yapaMember: boolean;
}

function calcNet(p: CalcNetParams) {
  const taxable = Math.max(0, p.gross - p.guzesht);
  const incomeTax = calcIncomeTax(taxable);
  const dsmf = p.gross * 0.03;
  const unemployment = p.gross * 0.005;
  const medical = calcStateMedical(p.gross);
  const union = p.gross * (p.unionRate / 100);
  // YAP: baseSalary-dan (ixtisas dərəcəsi əlavəsi daxil deyil)
  const yapa = p.yapaMember ? p.baseSalary * 0.01 : 0;
  const totalDeductions = incomeTax + dsmf + unemployment + medical + union + yapa;
  return { net: Math.max(0, p.gross - totalDeductions), incomeTax, dsmf, unemployment, medical, union, yapa, totalDeductions, taxable, guzesht: p.guzesht };
}

function formatMoney(n: number): string {
  return fmtNum(n, 2);
}

type JobType = "admin" | "support";

const pt = {
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
  taxMode: "Vergi güzəşti",
  noExemption: "Güzəştsiz",
  withExemption: "Güzəştlə",
  selectExemption: "Güzəşti seçin:",
  dependentCount: "Himayədə olanların sayı",
  taxableAmount: "Vergiyə cəlb olunan məbləğ",
  exemptionAmount: "Güzəşt məbləği",
  unionLabel: "Həmkarlar İttifaqı üzvüyəm",
  yapaMember: "YAP üzvü",
  yapaDesc: "Vəzifə maaşının 1%-i (ixtisas dərəcəsi əlavəsi daxil deyil)",
  memberships: "Üzvlüklər",
  emptyStateText: "Nəticəni görmək üçün qurum, vəzifə və pilləni seçin.",
};

const EXEMPTIONS: { amount: number; title: string; desc: string }[] = [
  {
    amount: 800,
    title: "V.M. 102.1-1 (800 AZN)",
    desc: "Şəhid statusu almış şəxslərin valideyinlərinin, dul arvadlarının (ərlərinin) və övladlarının",
  },
  {
    amount: 400,
    title: "V.M. 102.2 (400 AZN)",
    desc: "Vətən Müharibəsi Qəhrəmanları, Milli Qəhrəmanlar, Sovet İttifaqı və Sosialist Əməyi Qəhrəmanları, müharibə əlilləri, şəhid dul arvadları/övladları, 1941-1945 arxa cəbhə fədakarları, Çernobıl qəzası zərərçəkmişləri",
  },
  {
    amount: 200,
    title: "V.M. 102.3 (200 AZN)",
    desc: "Orqanizmin funksiyalarının 61-100% pozulmasına görə əlilliyi müəyyən edilmiş şəxslər, əlilli uşaqlar, daimi qulluq tələb edən əlilli uşağa baxan valideynlər",
  },
  {
    amount: 100,
    title: "V.M. 102.4 (100 AZN)",
    desc: "Şəhid valideynləri və arvadları (ərləri), Əfqanıstan və döyüş əməliyyatlarına göndərilmiş hərbçilər, məcburi köçkünlər",
  },
];
const VM1025 = {
  title: "V.M. 102.5 (əlavə 50 AZN)",
  desc: "Himayəsində 3+ nəfər olan (23 yaşınadək şagird/tələbə, ər/arvad) — hər biri üçün 50 AZN əlavə",
};

/** Seçim kartı (saytdakı düymə / radio kartları). */
function OptionCard({
  title,
  desc,
  active,
  onPress,
  disabled,
  center,
}: {
  title: string;
  desc?: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  center?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.optCard,
        {
          backgroundColor: active ? colors.accent + "1f" : colors.n240,
          borderColor: active ? colors.accent : colors.n280,
          opacity: disabled ? 0.35 : 1,
        },
        center && { alignItems: "center" },
      ]}
    >
      <Text style={[styles.optTitle, { color: active ? colors.accent : colors.n940 }]}>{title}</Text>
      {desc ? <Text style={[styles.optDesc, { color: colors.n580 }]}>{desc}</Text> : null}
    </Pressable>
  );
}

/** Hesablama izahı qutusu (saytdakı bg-gray-50 kiçik bloklar). */
function CalcNote({ lines, tone }: { lines: string[]; tone?: "green" }) {
  const { colors } = useTheme();
  const green = tone === "green";
  return (
    <View
      style={[
        styles.note,
        { backgroundColor: green ? "#22c55e1a" : colors.n240 },
      ]}
    >
      {lines.map((l, i) => (
        <Text
          key={i}
          style={[
            styles.noteText,
            { color: green ? "#16a34a" : colors.n760 },
            i === lines.length - 1 && lines.length > 2 && { fontWeight: "700" },
          ]}
        >
          {l}
        </Text>
      ))}
    </View>
  );
}

function DeductionBlock({
  label,
  value,
  desc,
  children,
}: {
  label: string;
  value: string;
  desc?: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.dedBlock, { borderBottomColor: colors.n240 }]}>
      <View style={styles.dedHead}>
        <Text style={[styles.dedLabel, { color: colors.n940 }]}>{label}</Text>
        <Text style={[styles.dedValue, { color: colors.n940 }]}>{value}</Text>
      </View>
      {desc ? <Text style={[styles.dedDesc, { color: colors.n580 }]}>{desc}</Text> : null}
      {children}
    </View>
  );
}

export function CivilServantCalculator() {
  const { colors } = useTheme();

  const [jobType, setJobType] = useState<JobType | null>(null);
  const [org, setOrg] = useState("");
  const [posIdx, setPosIdx] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [gradeIdx, setGradeIdx] = useState<number | null>(null);
  const [exemptionMode, setExemptionMode] = useState<"none" | "exempt">("none");
  const [selectedExemption, setSelectedExemption] = useState<number>(200);
  const [vm1025Enabled, setVm1025Enabled] = useState(false);
  const [dependentCount, setDependentCount] = useState("3");
  const [unionRate, setUnionRate] = useState<0 | 1 | 2>(0);
  const [yapaMember, setYapaMember] = useState(false);

  const orgs = jobType === "admin" ? adminOrgs : jobType === "support" ? supportOrgs : null;
  const positions = orgs && org ? orgs[org] : null;
  const useSimpleSteps = org !== "" && !fullStepOrgs.has(org);
  const grid = useSimpleSteps
    ? jobType === "admin"
      ? adminGrid4
      : supportGrid4
    : jobType === "admin"
      ? adminGrid
      : supportGrid;

  const pos = positions && posIdx !== null ? positions[posIdx] : null;
  const baseSalary = pos && step !== null ? grid[pos.level]?.[step] ?? null : null;
  const gradeBonus = gradeIdx !== null ? specialtyGrades[gradeIdx].amount : 0;
  const gross = baseSalary !== null ? baseSalary + gradeBonus : null;
  const guzesht = (() => {
    if (exemptionMode === "none") return 0;
    let amount = selectedExemption;
    if (vm1025Enabled) {
      const deps = parseInt(dependentCount) || 0;
      amount += deps * 50;
    }
    return amount;
  })();

  const result =
    gross !== null && baseSalary !== null
      ? calcNet({ gross, baseSalary, guzesht, unionRate, yapaMember })
      : null;

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

  const stepCards = useSimpleSteps
    ? simpleSteps
    : stepInfo.map((s, i) => ({ label: s.label, range: s.range, gridIndex: i }));

  return (
    <View>
      {/* Vəzifə növü */}
      <Text style={[styles.label, { color: colors.n700 }]}>{pt.jobType}</Text>
      <View style={{ gap: 8, marginBottom: 16 }}>
        <OptionCard
          title={pt.adminJob}
          desc={pt.adminJobDesc}
          active={jobType === "admin"}
          onPress={() => handleJobType("admin")}
        />
        <OptionCard
          title={pt.supportJob}
          desc={pt.supportJobDesc}
          active={jobType === "support"}
          onPress={() => handleJobType("support")}
        />
      </View>

      {/* Qurum */}
      <Select
        label={pt.organization}
        value={org}
        placeholder={orgs ? pt.selectOrg : pt.selectJobFirst}
        options={orgs ? Object.keys(orgs).map((name) => ({ value: name, label: name })) : []}
        onSelect={handleOrg}
        searchable
      />

      {/* Vəzifə */}
      <Select
        label={pt.position}
        value={posIdx !== null ? String(posIdx) : ""}
        placeholder={positions ? pt.selectPos : pt.selectOrgFirst}
        options={
          positions
            ? positions.map((p, i) => ({ value: String(i), label: `${p.name} (${pt.level} ${p.level})` }))
            : []
        }
        onSelect={handlePos}
      />

      {/* Ödəniş pilləsi */}
      <Text style={[styles.label, { color: colors.n700 }]}>{pt.payStep}</Text>
      {useSimpleSteps ? (
        <View style={styles.grid2}>
          {simpleSteps.map((s) => (
            <View key={s.gridIndex} style={styles.gridCell}>
              <OptionCard
                title={`${s.label} pillə`}
                desc={s.range}
                active={step === s.gridIndex}
                onPress={() => setStep(s.gridIndex)}
                disabled={posIdx === null}
                center
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.stepRow}>
          {stepInfo.map((s, i) => (
            <Pressable
              key={i}
              onPress={() => setStep(i)}
              disabled={posIdx === null}
              style={[
                styles.stepBtn,
                {
                  backgroundColor: step === i ? colors.accent + "1f" : colors.n240,
                  borderColor: step === i ? colors.accent : colors.n280,
                  opacity: posIdx === null ? 0.35 : 1,
                },
              ]}
            >
              <Text style={[styles.stepBtnText, { color: step === i ? colors.accent : colors.n940 }]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <Text style={[styles.hint, { color: colors.n580 }]}>{pt.stepNote}</Text>

      {/* İxtisas dərəcəsi */}
      <View style={{ marginTop: 16 }}>
        <Select
          label={`🎓 ${pt.specialtyGrade}`}
          value={gradeIdx !== null ? String(gradeIdx) : ""}
          placeholder={pt.selectGrade}
          options={[
            { value: "", label: pt.selectGrade },
            ...specialtyGrades.map((g, i) => ({ value: String(i), label: `${g.name} (+${g.amount} AZN)` })),
          ]}
          onSelect={(v) => setGradeIdx(v ? parseInt(v) : null)}
        />
      </View>

      {/* Həmkarlar + YAP */}
      <Text style={[styles.label, { color: colors.n700 }]}>🏛️ {pt.memberships}</Text>
      <SegmentControl
        label={pt.unionLabel}
        options={[
          { value: "0", label: "Üzv deyil" },
          { value: "1", label: "1%" },
          { value: "2", label: "2%" },
        ]}
        selected={String(unionRate) as "0" | "1" | "2"}
        onSelect={(v) => setUnionRate(Number(v) as 0 | 1 | 2)}
      />
      <Checkbox label={`${pt.yapaMember} (1%)`} checked={yapaMember} onChange={setYapaMember} />

      {/* Güzəştsiz / Güzəştlə */}
      <View style={{ marginTop: 16 }}>
        <SegmentControl
          label={`⚖️ ${pt.taxMode}`}
          options={[
            { value: "none", label: pt.noExemption },
            { value: "exempt", label: pt.withExemption },
          ]}
          selected={exemptionMode}
          onSelect={setExemptionMode}
        />
      </View>

      {exemptionMode === "exempt" && (
        <View style={{ gap: 8, marginBottom: 12 }}>
          <Text style={[styles.subLabel, { color: colors.n940 }]}>{pt.selectExemption}</Text>
          {EXEMPTIONS.map((e) => (
            <OptionCard
              key={e.amount}
              title={e.title}
              desc={e.desc}
              active={selectedExemption === e.amount}
              onPress={() => setSelectedExemption(e.amount)}
            />
          ))}
          <View
            style={[
              styles.optCard,
              {
                backgroundColor: vm1025Enabled ? colors.accent + "1f" : colors.n240,
                borderColor: vm1025Enabled ? colors.accent : colors.n280,
              },
            ]}
          >
            <Checkbox
              label={VM1025.title}
              description={VM1025.desc}
              checked={vm1025Enabled}
              onChange={setVm1025Enabled}
            />
            {vm1025Enabled && (
              <InputField
                label={pt.dependentCount}
                value={dependentCount}
                onChangeText={setDependentCount}
                keyboardType="number-pad"
                hint="3 – 10"
                maxLength={2}
              />
            )}
          </View>
        </View>
      )}

      {/* Pillə-Staj cədvəli */}
      <View style={[styles.stepTable, { borderColor: "#3b82f666", backgroundColor: "#3b82f614" }]}>
        <Text style={[styles.stepTableTitle, { color: colors.n940 }]}>📅 {pt.stepTableTitle}</Text>
        <View style={styles.grid2}>
          {stepCards.map((s) => {
            const active = step === s.gridIndex;
            return (
              <View key={s.gridIndex} style={styles.gridCell}>
                <View
                  style={[
                    styles.stepInfoCard,
                    {
                      backgroundColor: active ? colors.accent + "1f" : colors.n200,
                      borderColor: active ? colors.accent : "#3b82f644",
                    },
                  ]}
                >
                  <Text style={[styles.stepInfoLabel, { color: active ? colors.accent : colors.n940 }]}>
                    {s.label} {pt.step}
                  </Text>
                  <Text style={[styles.stepInfoRange, { color: colors.n580 }]}>{s.range}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Nəticə */}
      {result && gross !== null && baseSalary !== null && pos && step !== null ? (
        <View>
          <ResultHero label={pt.netSalary} value={formatMoney(result.net)} sub={pt.perMonth} />
          <StatGrid
            items={[
              { label: `${pt.grossSalary} (${pt.perMonth})`, value: formatMoney(baseSalary) },
              ...(gradeBonus > 0
                ? [{ label: pt.gradeBonus, value: `+${formatMoney(gradeBonus)}`, accent: true }]
                : []),
            ]}
          />
          {gradeBonus > 0 && (
            <InfoBox variant="success">
              {`${pt.totalWithGrade}: ${formatMoney(gross)} AZN`}
            </InfoBox>
          )}

          {/* Badge */}
          <View style={[styles.badge, { borderColor: "#3b82f666", backgroundColor: "#3b82f61a" }]}>
            <Text style={[styles.badgeText, { color: "#3b82f6" }]}>
              {pt.stateSector} — {pt.levelLabel} {pos.level}, {stepInfo[step].label} {pt.step}
            </Text>
          </View>

          {/* İşçidən tutulan */}
          <View style={[styles.dedCard, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <View style={[styles.dedHeader, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={[styles.dedHeaderText, { color: colors.n940 }]}>👤 {pt.employeeDeductions}</Text>
            </View>

            <View style={[styles.dedBlock, { borderBottomColor: colors.n240 }]}>
              <View style={styles.dedHead}>
                <Text style={[styles.dedDesc, { color: colors.n580, fontSize: 14 }]}>{pt.taxableAmount}</Text>
                <Text style={[styles.dedLabel, { color: colors.n940 }]}>{formatMoney(result.taxable)} AZN</Text>
              </View>
              <CalcNote
                lines={[
                  `${formatMoney(gross)} − ${formatMoney(result.guzesht)} (${pt.exemptionAmount}) = ${formatMoney(result.taxable)} AZN`,
                ]}
              />
              <View style={[styles.dedHead, { marginTop: 8 }]}>
                <Text style={[styles.dedLabel, { color: colors.n940 }]}>{pt.incomeTax}</Text>
                <Text style={[styles.dedValue, { color: colors.n940 }]}>{formatMoney(result.incomeTax)} AZN</Text>
              </View>
              {result.incomeTax === 0 ? (
                <CalcNote tone="green" lines={[pt.noTaxNote]} />
              ) : result.taxable <= 2500 ? (
                <CalcNote
                  lines={[`(${formatMoney(result.taxable)} − 200) × 14% = ${formatMoney(result.incomeTax)} AZN`]}
                />
              ) : (
                <CalcNote
                  lines={[
                    `350 + (${formatMoney(result.taxable)} − 2.500) × 25%`,
                    `= 350 + ${formatMoney((result.taxable - 2500) * 0.25)}`,
                    `= ${formatMoney(result.incomeTax)} AZN`,
                  ]}
                />
              )}
            </View>

            <DeductionBlock label={pt.dsmf} value={`${formatMoney(result.dsmf)} AZN`} desc={pt.dsmfDesc}>
              <CalcNote lines={[`${formatMoney(gross)}₼ × 3% = ${formatMoney(result.dsmf)} AZN`]} />
            </DeductionBlock>

            <DeductionBlock label={pt.unemployment} value={`${formatMoney(result.unemployment)} AZN`}>
              <CalcNote lines={[`${formatMoney(gross)}₼ × 0,5% = ${formatMoney(result.unemployment)} AZN`]} />
            </DeductionBlock>

            <DeductionBlock label={pt.medical} value={`${formatMoney(result.medical)} AZN`} desc={pt.medicalDesc}>
              {gross <= 8000 ? (
                <CalcNote lines={[`${formatMoney(gross)}₼ × 2% = ${formatMoney(result.medical)} AZN`]} />
              ) : (
                <CalcNote
                  lines={[
                    `8000₼ × 2% = ${formatMoney(8000 * 0.02)} AZN`,
                    `${gross - 8000}₼ × 0,5% = ${formatMoney((gross - 8000) * 0.005)} AZN`,
                    `${pt.totalLabel}: ${formatMoney(result.medical)} AZN`,
                  ]}
                />
              )}
            </DeductionBlock>

            {unionRate > 0 && (
              <DeductionBlock label={pt.unionLabel} value={`${formatMoney(result.union)} AZN`}>
                <CalcNote lines={[`${formatMoney(gross)}₼ × ${unionRate}% = ${formatMoney(result.union)} AZN`]} />
              </DeductionBlock>
            )}

            {yapaMember && (
              <DeductionBlock label={pt.yapaMember} value={`${formatMoney(result.yapa)} AZN`} desc={pt.yapaDesc}>
                <CalcNote lines={[`${formatMoney(baseSalary)}₼ × 1% = ${formatMoney(result.yapa)} AZN`]} />
              </DeductionBlock>
            )}

            <View style={[styles.dedTotal, { backgroundColor: "#ef44441a" }]}>
              <Text style={[styles.dedTotalText, { color: "#ef4444" }]}>{pt.totalDeduction}</Text>
              <Text style={[styles.dedTotalText, { color: "#ef4444" }]}>{formatMoney(result.totalDeductions)} AZN</Text>
            </View>
          </View>

          {/* İllik hesablama */}
          <ResultSection title={`📅 ${pt.annualCalc}`}>
            <ResultRow label={pt.annualNetIncome} value={`${formatMoney(result.net * 12)} AZN`} highlight />
            <ResultRow label={pt.annualGross} value={`${formatMoney(gross * 12)} AZN`} />
            <ResultRow label={pt.annualDeduction} value={`${formatMoney(result.totalDeductions * 12)} AZN`} />
          </ResultSection>

          {/* Seçim xülasəsi */}
          <StatGrid
            items={[
              { label: pt.orgLabel, value: org },
              { label: pt.jobTypeLabel, value: jobType === "admin" ? pt.adminLabel : pt.supportLabel },
              { label: pt.payLevel, value: `${pt.levelLabel} ${pos.level}` },
              { label: pt.stepLabel, value: `${stepInfo[step].label} ${pt.step} (${stepInfo[step].range})` },
            ]}
          />
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyStateText}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["salary", "overtime", "vacation-pay"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  subLabel: { fontSize: 14, fontWeight: "600" },
  hint: { fontSize: 12, marginTop: 6, lineHeight: 17 },
  optCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  optTitle: { fontSize: 14, fontWeight: "600" },
  optDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  grid2: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  gridCell: { width: "50%", padding: 4 },
  stepRow: { flexDirection: "row", gap: 6 },
  stepBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 10, alignItems: "center" },
  stepBtnText: { fontSize: 13, fontWeight: "700" },
  stepTable: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 16 },
  stepTableTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  stepInfoCard: { borderRadius: 10, borderWidth: 1, padding: 10, alignItems: "center" },
  stepInfoLabel: { fontSize: 16, fontWeight: "800" },
  stepInfoRange: { fontSize: 12, marginTop: 2 },
  badge: { alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  dedCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 16 },
  dedHeader: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  dedHeaderText: { fontSize: 15, fontWeight: "700" },
  dedBlock: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  dedHead: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 4 },
  dedLabel: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
  dedValue: { fontSize: 14, fontWeight: "800" },
  dedDesc: { fontSize: 11, marginBottom: 6, flexShrink: 1 },
  dedTotal: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  dedTotalText: { fontSize: 14, fontWeight: "800" },
  note: { borderRadius: 8, padding: 8, gap: 2 },
  noteText: { fontSize: 12, lineHeight: 17 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
