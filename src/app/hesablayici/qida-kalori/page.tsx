"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

interface FoodItem {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AddedFood {
  id: number;
  food: FoodItem;
  grams: number;
}

const categories = [
  "Hamısı",
  "Azərbaycan mətbəxi",
  "Ət və quş",
  "Süd məhsulları",
  "Meyvələr",
  "Tərəvəzlər",
  "Taxıl və çörək",
  "Quru meyvə və qərzəklilər",
  "İçkilər",
  "Şirniyyat",
  "Yağlar",
] as const;

const foodDatabase: FoodItem[] = [
  // Azərbaycan mətbəxi
  { name: "Plov (aş)", category: "Azərbaycan mətbəxi", calories: 180, protein: 5, carbs: 25, fat: 7 },
  { name: "Səbzili plov", category: "Azərbaycan mətbəxi", calories: 160, protein: 4, carbs: 26, fat: 5 },
  { name: "Şüyüd plov", category: "Azərbaycan mətbəxi", calories: 190, protein: 6, carbs: 24, fat: 8 },
  { name: "Dolma (yarpaqdolma)", category: "Azərbaycan mətbəxi", calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: "Kələm dolması", category: "Azərbaycan mətbəxi", calories: 140, protein: 7, carbs: 14, fat: 6 },
  { name: "Badımcan dolması", category: "Azərbaycan mətbəxi", calories: 135, protein: 7, carbs: 10, fat: 7 },
  { name: "Qutab (ətli)", category: "Azərbaycan mətbəxi", calories: 220, protein: 10, carbs: 22, fat: 10 },
  { name: "Qutab (göyərtili)", category: "Azərbaycan mətbəxi", calories: 180, protein: 5, carbs: 25, fat: 7 },
  { name: "Qutab (balkabaqlı)", category: "Azərbaycan mətbəxi", calories: 190, protein: 4, carbs: 28, fat: 7 },
  { name: "Düşbərə", category: "Azərbaycan mətbəxi", calories: 160, protein: 9, carbs: 18, fat: 6 },
  { name: "Gürzə", category: "Azərbaycan mətbəxi", calories: 210, protein: 11, carbs: 20, fat: 9 },
  { name: "Bozbash", category: "Azərbaycan mətbəxi", calories: 120, protein: 8, carbs: 8, fat: 6 },
  { name: "Piti", category: "Azərbaycan mətbəxi", calories: 150, protein: 10, carbs: 10, fat: 8 },
  { name: "Lüləkebab", category: "Azərbaycan mətbəxi", calories: 250, protein: 18, carbs: 2, fat: 19 },
  { name: "Tikəkebab", category: "Azərbaycan mətbəxi", calories: 200, protein: 22, carbs: 1, fat: 12 },
  { name: "Tava kebab", category: "Azərbaycan mətbəxi", calories: 230, protein: 16, carbs: 10, fat: 14 },
  { name: "Cız-bız", category: "Azərbaycan mətbəxi", calories: 280, protein: 20, carbs: 5, fat: 20 },
  { name: "Lahmacun", category: "Azərbaycan mətbəxi", calories: 230, protein: 10, carbs: 28, fat: 9 },
  { name: "Dovğa", category: "Azərbaycan mətbəxi", calories: 50, protein: 3, carbs: 5, fat: 2 },
  { name: "Xəngəl", category: "Azərbaycan mətbəxi", calories: 200, protein: 8, carbs: 28, fat: 7 },
  { name: "Küftə bozbaş", category: "Azərbaycan mətbəxi", calories: 130, protein: 9, carbs: 10, fat: 6 },
  { name: "Söyüdlü toyuq", category: "Azərbaycan mətbəxi", calories: 165, protein: 25, carbs: 0, fat: 7 },
  { name: "Səbzi qovurma", category: "Azərbaycan mətbəxi", calories: 110, protein: 2, carbs: 8, fat: 8 },
  { name: "Toyuq sac", category: "Azərbaycan mətbəxi", calories: 175, protein: 18, carbs: 8, fat: 8 },
  { name: "Balıq lavaşda", category: "Azərbaycan mətbəxi", calories: 210, protein: 16, carbs: 18, fat: 8 },
  { name: "Aş (süd aşı)", category: "Azərbaycan mətbəxi", calories: 140, protein: 4, carbs: 22, fat: 4 },
  { name: "Dogramac", category: "Azərbaycan mətbəxi", calories: 45, protein: 2, carbs: 6, fat: 1 },
  { name: "Ovdux", category: "Azərbaycan mətbəxi", calories: 55, protein: 1, carbs: 12, fat: 0.5 },
  { name: "Ayran", category: "Azərbaycan mətbəxi", calories: 40, protein: 2, carbs: 3, fat: 2 },
  { name: "Şərbət (limon)", category: "Azərbaycan mətbəxi", calories: 60, protein: 0, carbs: 15, fat: 0 },
  // Ət və quş
  { name: "Toyuq sinəsi (bişmiş)", category: "Ət və quş", calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: "Toyuq budu (bişmiş)", category: "Ət və quş", calories: 209, protein: 26, carbs: 0, fat: 11 },
  { name: "Toyuq qanadı", category: "Ət və quş", calories: 203, protein: 18, carbs: 0, fat: 14 },
  { name: "Mal əti (yağsız)", category: "Ət və quş", calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "Mal əti (yağlı)", category: "Ət və quş", calories: 330, protein: 20, carbs: 0, fat: 27 },
  { name: "Quzu əti", category: "Ət və quş", calories: 290, protein: 25, carbs: 0, fat: 21 },
  { name: "Dana əti", category: "Ət və quş", calories: 170, protein: 28, carbs: 0, fat: 6 },
  { name: "Hind quşu (sinə)", category: "Ət və quş", calories: 135, protein: 30, carbs: 0, fat: 1.5 },
  { name: "Qıyma (mal)", category: "Ət və quş", calories: 280, protein: 18, carbs: 0, fat: 23 },
  { name: "Qıyma (toyuq)", category: "Ət və quş", calories: 170, protein: 20, carbs: 0, fat: 10 },
  { name: "Sosiska", category: "Ət və quş", calories: 300, protein: 12, carbs: 2, fat: 27 },
  { name: "Kolbasa (qazılmış)", category: "Ət və quş", calories: 350, protein: 14, carbs: 1, fat: 32 },
  { name: "Balıq (qızardılmış)", category: "Ət və quş", calories: 200, protein: 20, carbs: 8, fat: 10 },
  { name: "Balıq (buxarlanmış)", category: "Ət və quş", calories: 130, protein: 22, carbs: 0, fat: 5 },
  { name: "Qızıl balıq (salmon)", category: "Ət və quş", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Ton balığı (konserv)", category: "Ət və quş", calories: 130, protein: 28, carbs: 0, fat: 1 },
  { name: "Krevet", category: "Ət və quş", calories: 85, protein: 18, carbs: 1, fat: 1 },
  { name: "Yumurta (bişmiş)", category: "Ət və quş", calories: 155, protein: 13, carbs: 1, fat: 11 },
  { name: "Yumurta (qayğanaq)", category: "Ət və quş", calories: 196, protein: 14, carbs: 2, fat: 15 },
  { name: "Ciyər (mal)", category: "Ət və quş", calories: 135, protein: 20, carbs: 4, fat: 4 },
  // Süd məhsulları
  { name: "Süd (2.5%)", category: "Süd məhsulları", calories: 52, protein: 3, carbs: 5, fat: 2.5 },
  { name: "Süd (yağsız)", category: "Süd məhsulları", calories: 34, protein: 3, carbs: 5, fat: 0.1 },
  { name: "Qatıq", category: "Süd məhsulları", calories: 60, protein: 3, carbs: 4, fat: 3 },
  { name: "Kefir", category: "Süd məhsulları", calories: 55, protein: 3, carbs: 4, fat: 2.5 },
  { name: "Pendir (ağ)", category: "Süd məhsulları", calories: 260, protein: 17, carbs: 1, fat: 21 },
  { name: "Pendir (sarı/Cheddar)", category: "Süd məhsulları", calories: 402, protein: 25, carbs: 1, fat: 33 },
  { name: "Pendir (mozzarella)", category: "Süd məhsulları", calories: 280, protein: 22, carbs: 2, fat: 17 },
  { name: "Süzma", category: "Süd məhsulları", calories: 120, protein: 10, carbs: 4, fat: 7 },
  { name: "Qaymaq", category: "Süd məhsulları", calories: 340, protein: 2, carbs: 3, fat: 35 },
  { name: "Şor", category: "Süd məhsulları", calories: 160, protein: 11, carbs: 3, fat: 12 },
  { name: "Dondurma", category: "Süd məhsulları", calories: 207, protein: 4, carbs: 24, fat: 11 },
  // Meyvələr
  { name: "Alma", category: "Meyvələr", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "Armud", category: "Meyvələr", calories: 57, protein: 0.4, carbs: 15, fat: 0.1 },
  { name: "Banan", category: "Meyvələr", calories: 89, protein: 1, carbs: 23, fat: 0.3 },
  { name: "Portağal", category: "Meyvələr", calories: 47, protein: 1, carbs: 12, fat: 0.1 },
  { name: "Mandarin", category: "Meyvələr", calories: 53, protein: 1, carbs: 13, fat: 0.3 },
  { name: "Limon", category: "Meyvələr", calories: 29, protein: 1, carbs: 9, fat: 0.3 },
  { name: "Nar", category: "Meyvələr", calories: 83, protein: 2, carbs: 19, fat: 1 },
  { name: "Əncir", category: "Meyvələr", calories: 74, protein: 1, carbs: 19, fat: 0.3 },
  { name: "Üzüm", category: "Meyvələr", calories: 69, protein: 1, carbs: 18, fat: 0.2 },
  { name: "Qarpız", category: "Meyvələr", calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  { name: "Yemiş (qovun)", category: "Meyvələr", calories: 34, protein: 0.8, carbs: 8, fat: 0.2 },
  { name: "Şaftalı", category: "Meyvələr", calories: 39, protein: 1, carbs: 10, fat: 0.3 },
  { name: "Ərik", category: "Meyvələr", calories: 48, protein: 1, carbs: 11, fat: 0.4 },
  { name: "Albalı", category: "Meyvələr", calories: 50, protein: 1, carbs: 12, fat: 0.3 },
  { name: "Çiyələk", category: "Meyvələr", calories: 33, protein: 0.7, carbs: 8, fat: 0.3 },
  { name: "Gilas", category: "Meyvələr", calories: 63, protein: 1, carbs: 16, fat: 0.2 },
  { name: "Kivi", category: "Meyvələr", calories: 61, protein: 1, carbs: 15, fat: 0.5 },
  { name: "Ananas", category: "Meyvələr", calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { name: "Avokado", category: "Meyvələr", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: "Xurma", category: "Meyvələr", calories: 282, protein: 2, carbs: 75, fat: 0.4 },
  // Tərəvəzlər
  { name: "Pomidor", category: "Tərəvəzlər", calories: 18, protein: 1, carbs: 4, fat: 0.2 },
  { name: "Xiyar", category: "Tərəvəzlər", calories: 15, protein: 1, carbs: 4, fat: 0.1 },
  { name: "Kartof (bişmiş)", category: "Tərəvəzlər", calories: 87, protein: 2, carbs: 20, fat: 0.1 },
  { name: "Kartof (qızardılmış)", category: "Tərəvəzlər", calories: 270, protein: 3, carbs: 35, fat: 14 },
  { name: "Soğan", category: "Tərəvəzlər", calories: 40, protein: 1, carbs: 9, fat: 0.1 },
  { name: "Sarımsaq", category: "Tərəvəzlər", calories: 149, protein: 6, carbs: 33, fat: 0.5 },
  { name: "Badımcan (bişmiş)", category: "Tərəvəzlər", calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  { name: "Badımcan (qızardılmış)", category: "Tərəvəzlər", calories: 130, protein: 1, carbs: 6, fat: 11 },
  { name: "Bibər (şirin)", category: "Tərəvəzlər", calories: 27, protein: 1, carbs: 6, fat: 0.3 },
  { name: "Bibər (acı)", category: "Tərəvəzlər", calories: 40, protein: 2, carbs: 9, fat: 0.4 },
  { name: "Kökü (yerkökü)", category: "Tərəvəzlər", calories: 41, protein: 1, carbs: 10, fat: 0.2 },
  { name: "Çuğundur", category: "Tərəvəzlər", calories: 43, protein: 2, carbs: 10, fat: 0.2 },
  { name: "Turp", category: "Tərəvəzlər", calories: 16, protein: 1, carbs: 3, fat: 0.1 },
  { name: "Kələm (ağ)", category: "Tərəvəzlər", calories: 25, protein: 1, carbs: 6, fat: 0.1 },
  { name: "Brokkoli", category: "Tərəvəzlər", calories: 34, protein: 3, carbs: 7, fat: 0.4 },
  { name: "Ispanaq", category: "Tərəvəzlər", calories: 23, protein: 3, carbs: 4, fat: 0.4 },
  { name: "Göyərti (keşniş, şüyüd)", category: "Tərəvəzlər", calories: 23, protein: 2, carbs: 4, fat: 0.5 },
  { name: "Noxud (bişmiş)", category: "Tərəvəzlər", calories: 164, protein: 9, carbs: 27, fat: 3 },
  { name: "Lobya (bişmiş)", category: "Tərəvəzlər", calories: 127, protein: 9, carbs: 22, fat: 0.5 },
  { name: "Mərcimək (bişmiş)", category: "Tərəvəzlər", calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: "Zeytun (yaşıl)", category: "Tərəvəzlər", calories: 145, protein: 1, carbs: 4, fat: 15 },
  { name: "Göbələk", category: "Tərəvəzlər", calories: 22, protein: 3, carbs: 3, fat: 0.3 },
  { name: "Qarğıdalı (bişmiş)", category: "Tərəvəzlər", calories: 96, protein: 3, carbs: 21, fat: 1 },
  { name: "Balqabaq", category: "Tərəvəzlər", calories: 26, protein: 1, carbs: 7, fat: 0.1 },
  // Taxıl və çörək
  { name: "Düyü (bişmiş)", category: "Taxıl və çörək", calories: 130, protein: 3, carbs: 28, fat: 0.3 },
  { name: "Makaron (bişmiş)", category: "Taxıl və çörək", calories: 157, protein: 6, carbs: 31, fat: 1 },
  { name: "Lavaş", category: "Taxıl və çörək", calories: 280, protein: 9, carbs: 56, fat: 1 },
  { name: "Çörək (ağ)", category: "Taxıl və çörək", calories: 265, protein: 8, carbs: 50, fat: 3 },
  { name: "Çörək (qara/çovdar)", category: "Taxıl və çörək", calories: 250, protein: 9, carbs: 48, fat: 3 },
  { name: "Təndir çörəyi", category: "Taxıl və çörək", calories: 260, protein: 8, carbs: 52, fat: 2 },
  { name: "Yuxa", category: "Taxıl və çörək", calories: 290, protein: 8, carbs: 58, fat: 2 },
  { name: "Suxari", category: "Taxıl və çörək", calories: 395, protein: 11, carbs: 72, fat: 7 },
  { name: "Qarabaşaq (bişmiş)", category: "Taxıl və çörək", calories: 92, protein: 3, carbs: 20, fat: 1 },
  { name: "Yulaf (bişmiş)", category: "Taxıl və çörək", calories: 68, protein: 2, carbs: 12, fat: 1 },
  { name: "Bulgur (bişmiş)", category: "Taxıl və çörək", calories: 83, protein: 3, carbs: 18, fat: 0.2 },
  { name: "Un (buğda)", category: "Taxıl və çörək", calories: 364, protein: 10, carbs: 76, fat: 1 },
  // Quru meyvə və qərzəklilər
  { name: "Badam", category: "Quru meyvə və qərzəklilər", calories: 579, protein: 21, carbs: 22, fat: 50 },
  { name: "Qoz", category: "Quru meyvə və qərzəklilər", calories: 654, protein: 15, carbs: 14, fat: 65 },
  { name: "Fındıq", category: "Quru meyvə və qərzəklilər", calories: 628, protein: 15, carbs: 17, fat: 61 },
  { name: "Fıstıq", category: "Quru meyvə və qərzəklilər", calories: 567, protein: 26, carbs: 16, fat: 49 },
  { name: "Püstə", category: "Quru meyvə və qərzəklilər", calories: 562, protein: 20, carbs: 28, fat: 45 },
  { name: "Kişmiş", category: "Quru meyvə və qərzəklilər", calories: 299, protein: 3, carbs: 79, fat: 0.5 },
  { name: "Quru ərik", category: "Quru meyvə və qərzəklilər", calories: 241, protein: 3, carbs: 63, fat: 0.5 },
  { name: "Quru əncir", category: "Quru meyvə və qərzəklilər", calories: 249, protein: 3, carbs: 64, fat: 1 },
  { name: "Günəbaxan toxumu", category: "Quru meyvə və qərzəklilər", calories: 584, protein: 21, carbs: 20, fat: 51 },
  // İçkilər
  { name: "Çay (şəkərsiz)", category: "İçkilər", calories: 1, protein: 0, carbs: 0, fat: 0 },
  { name: "Çay (1 şəkərlə)", category: "İçkilər", calories: 20, protein: 0, carbs: 5, fat: 0 },
  { name: "Qəhvə (şəkərsiz)", category: "İçkilər", calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  { name: "Qəhvə (südlü)", category: "İçkilər", calories: 50, protein: 2, carbs: 5, fat: 2 },
  { name: "Kola", category: "İçkilər", calories: 42, protein: 0, carbs: 11, fat: 0 },
  { name: "Şirə (portağal)", category: "İçkilər", calories: 45, protein: 1, carbs: 10, fat: 0.2 },
  { name: "Şirə (nar)", category: "İçkilər", calories: 54, protein: 0.2, carbs: 13, fat: 0.3 },
  { name: "Kompot", category: "İçkilər", calories: 60, protein: 0.2, carbs: 15, fat: 0 },
  { name: "Su", category: "İçkilər", calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: "Mineral su", category: "İçkilər", calories: 0, protein: 0, carbs: 0, fat: 0 },
  // Şirniyyat
  { name: "Şəkərbura", category: "Şirniyyat", calories: 350, protein: 6, carbs: 40, fat: 18 },
  { name: "Pakhlava (Bakı)", category: "Şirniyyat", calories: 400, protein: 7, carbs: 42, fat: 23 },
  { name: "Qoğal", category: "Şirniyyat", calories: 320, protein: 6, carbs: 38, fat: 16 },
  { name: "Churchkhela (sucuq)", category: "Şirniyyat", calories: 380, protein: 5, carbs: 52, fat: 18 },
  { name: "Bal", category: "Şirniyyat", calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  { name: "Şəkər", category: "Şirniyyat", calories: 387, protein: 0, carbs: 100, fat: 0 },
  { name: "Halva", category: "Şirniyyat", calories: 469, protein: 12, carbs: 54, fat: 22 },
  { name: "Şokolad (südlü)", category: "Şirniyyat", calories: 535, protein: 7, carbs: 60, fat: 30 },
  { name: "Şokolad (tünd)", category: "Şirniyyat", calories: 546, protein: 5, carbs: 60, fat: 31 },
  { name: "Tort (biskvit)", category: "Şirniyyat", calories: 340, protein: 5, carbs: 50, fat: 14 },
  { name: "Pəhləva (Şəki)", category: "Şirniyyat", calories: 420, protein: 8, carbs: 45, fat: 24 },
  { name: "Mutəkkə", category: "Şirniyyat", calories: 360, protein: 5, carbs: 44, fat: 19 },
  { name: "Mürəbbə", category: "Şirniyyat", calories: 250, protein: 0.3, carbs: 65, fat: 0.1 },
  { name: "Küləçə", category: "Şirniyyat", calories: 380, protein: 6, carbs: 50, fat: 17 },
  // Yağlar
  { name: "Kərə yağı", category: "Yağlar", calories: 717, protein: 1, carbs: 0, fat: 81 },
  { name: "Zeytun yağı", category: "Yağlar", calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: "Günəbaxan yağı", category: "Yağlar", calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: "Marqarin", category: "Yağlar", calories: 717, protein: 0.2, carbs: 1, fat: 80 },
  { name: "Mayonez", category: "Yağlar", calories: 680, protein: 1, carbs: 1, fat: 75 },
  { name: "Xama (20%)", category: "Yağlar", calories: 206, protein: 3, carbs: 4, fat: 20 },
];

const pageTranslations = {
  az: {
    title: "Qida Kalori Hesablayıcısı",
    description: "Yediyiniz qidaların kalori və makro qida dəyərlərini hesablayın. 50-dən çox Azərbaycan və beynəlxalq qida məlumatı daxildir.",
    breadcrumbCategory: "Qidalanma",
    breadcrumbLabel: "Qida kalori hesablayıcısı",
    formulaTitle: "Kalori hesablama haqqında",
    formulaContent: `Kalori — qidanın enerji dəyərini ölçən vahiddir. Hər bir qida maddəsi 3 əsas makro qida qrupundan ibarətdir:

• Protein (zülal): 1 qram = 4 kkal
• Karbohidrat: 1 qram = 4 kkal
• Yağ: 1 qram = 9 kkal

Gündəlik kalori ehtiyacı insanın yaşı, cinsi, çəkisi, boyu və fiziki aktivliyindən asılıdır. Orta hesabla:
• Qadınlar: 1800-2200 kkal/gün
• Kişilər: 2200-2800 kkal/gün

Çəki itkisi üçün gündəlik normanızdan 500 kkal az, çəki artımı üçün isə 500 kkal çox qəbul etmək tövsiyə olunur.`,
    category: "Kateqoriya",
    searchFood: "Qida axtar",
    searchPlaceholder: "Qida adını yazın...",
    gram: "Qram",
    add: "Əlavə et",
    foodNotFound: "Qida tapılmadı",
    addedFoods: "Əlavə edilmiş qidalar",
    food: "Qida",
    kcal: "Kkal",
    protein: "Protein",
    carb: "Karb",
    fat: "Yağ",
    delete: "Sil",
    calories: "Kalori (kkal)",
    carbohydrate: "Karbohidrat",
    macroDistribution: "Makro qida paylanması",
    dailyCalorieGoal: "Gündəlik kalori hədəfi",
    goalReached: "Hədəfə çatdınız!",
    remaining: "Qalır: {val} kkal",
    emptyState: "Yuxarıdan qida seçib əlavə edin",
    emptyStateDetail: "Kalori və makro qida dəyərləri avtomatik hesablanacaq",
  },
  en: {
    title: "Food Calorie Calculator",
    description: "Calculate the calorie and macro nutritional values of the foods you eat. Includes 50+ Azerbaijani and international food data.",
    breadcrumbCategory: "Nutrition",
    breadcrumbLabel: "Food calorie calculator",
    formulaTitle: "About calorie calculation",
    formulaContent: `A calorie is a unit that measures the energy value of food. Each food item consists of 3 main macronutrient groups:

• Protein: 1 gram = 4 kcal
• Carbohydrate: 1 gram = 4 kcal
• Fat: 1 gram = 9 kcal

Daily calorie needs depend on age, sex, weight, height and physical activity. On average:
• Women: 1800-2200 kcal/day
• Men: 2200-2800 kcal/day

For weight loss, consume 500 kcal less than your daily norm; for weight gain, consume 500 kcal more.`,
    category: "Category",
    searchFood: "Search food",
    searchPlaceholder: "Type food name...",
    gram: "Grams",
    add: "Add",
    foodNotFound: "Food not found",
    addedFoods: "Added foods",
    food: "Food",
    kcal: "Kcal",
    protein: "Protein",
    carb: "Carb",
    fat: "Fat",
    delete: "Delete",
    calories: "Calories (kcal)",
    carbohydrate: "Carbohydrate",
    macroDistribution: "Macronutrient distribution",
    dailyCalorieGoal: "Daily calorie goal",
    goalReached: "Goal reached!",
    remaining: "Remaining: {val} kcal",
    emptyState: "Select and add food from above",
    emptyStateDetail: "Calorie and macro values will be calculated automatically",
  },
  ru: {
    title: "Калькулятор калорий продуктов",
    description: "Рассчитайте калорийность и макронутриенты продуктов, которые вы едите. Включает 50+ азербайджанских и международных продуктов.",
    breadcrumbCategory: "Питание",
    breadcrumbLabel: "Калькулятор калорий",
    formulaTitle: "О расчёте калорий",
    formulaContent: `Калория — единица измерения энергетической ценности пищи. Каждый продукт состоит из 3 основных групп макронутриентов:

• Белок: 1 грамм = 4 ккал
• Углеводы: 1 грамм = 4 ккал
• Жиры: 1 грамм = 9 ккал

Суточная потребность в калориях зависит от возраста, пола, веса, роста и физической активности. В среднем:
• Женщины: 1800-2200 ккал/день
• Мужчины: 2200-2800 ккал/день

Для похудения потребляйте на 500 ккал меньше нормы, для набора веса — на 500 ккал больше.`,
    category: "Категория",
    searchFood: "Поиск продукта",
    searchPlaceholder: "Введите название продукта...",
    gram: "Граммы",
    add: "Добавить",
    foodNotFound: "Продукт не найден",
    addedFoods: "Добавленные продукты",
    food: "Продукт",
    kcal: "Ккал",
    protein: "Белок",
    carb: "Углев.",
    fat: "Жиры",
    delete: "Удалить",
    calories: "Калории (ккал)",
    carbohydrate: "Углеводы",
    macroDistribution: "Распределение макронутриентов",
    dailyCalorieGoal: "Суточная цель калорий",
    goalReached: "Цель достигнута!",
    remaining: "Осталось: {val} ккал",
    emptyState: "Выберите и добавьте продукт выше",
    emptyStateDetail: "Калории и макронутриенты будут рассчитаны автоматически",
  },
};

export default function QidaKaloriHesablayicisi() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hamısı");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState<string>("100");
  const [addedFoods, setAddedFoods] = useState<AddedFood[]>([]);
  const [dailyGoal, setDailyGoal] = useState<string>("2000");
  const [nextId, setNextId] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((food) => {
      const matchesCategory = selectedCategory === "Hamısı" || food.category === selectedCategory;
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const totals = useMemo(() => {
    return addedFoods.reduce(
      (acc, item) => {
        const multiplier = item.grams / 100;
        return {
          calories: acc.calories + item.food.calories * multiplier,
          protein: acc.protein + item.food.protein * multiplier,
          carbs: acc.carbs + item.food.carbs * multiplier,
          fat: acc.fat + item.food.fat * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [addedFoods]);

  const macroTotal = totals.protein + totals.carbs + totals.fat;
  const proteinPct = macroTotal > 0 ? (totals.protein / macroTotal) * 100 : 0;
  const carbsPct = macroTotal > 0 ? (totals.carbs / macroTotal) * 100 : 0;
  const fatPct = macroTotal > 0 ? (totals.fat / macroTotal) * 100 : 0;

  const goalNum = parseFloat(dailyGoal) || 2000;
  const goalProgress = Math.min((totals.calories / goalNum) * 100, 100);
  const remaining = Math.max(goalNum - totals.calories, 0);

  function handleAddFood() {
    if (!selectedFood || !grams || parseFloat(grams) <= 0) return;
    setAddedFoods((prev) => [
      ...prev,
      { id: nextId, food: selectedFood, grams: parseFloat(grams) },
    ]);
    setNextId((prev) => prev + 1);
    setSelectedFood(null);
    setSearchQuery("");
    setGrams("100");
  }

  function handleRemoveFood(id: number) {
    setAddedFoods((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSelectFood(food: FoodItem) {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setShowDropdown(false);
  }

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=nutrition" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["bmr", "bmi", "water-intake", "ideal-weight"]}
    >
      <div className="space-y-6">
        {/* Category Tabs */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.category}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery("");
                  setSelectedFood(null);
                  setShowDropdown(true);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Grams + Add */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-3 items-end">
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-1">
              {pt.searchFood}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedFood(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={pt.searchPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {showDropdown && filteredFoods.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredFoods.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex justify-between items-center border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <span className="font-medium text-sm text-foreground">{food.name}</span>
                      <span className="text-xs text-muted ml-2">({food.category})</span>
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap">
                      {food.calories} kkal/100{lang === "ru" ? "г" : "q"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && filteredFoods.length === 0 && searchQuery && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg p-4 text-sm text-muted text-center">
                {pt.foodNotFound}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {pt.gram}
            </label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              min="1"
              placeholder="100"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <button
            onClick={handleAddFood}
            disabled={!selectedFood || !grams || parseFloat(grams) <= 0}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pt.add}
          </button>
        </div>

        {/* Selected food preview */}
        {selectedFood && (
          <div className="bg-blue-50 rounded-xl p-4 flex flex-wrap gap-4 items-center text-sm">
            <span className="font-semibold text-foreground">{selectedFood.name}</span>
            <span className="text-muted">
              {grams ? Math.round(selectedFood.calories * (parseFloat(grams) / 100)) : selectedFood.calories} kkal
            </span>
            <span className="text-red-600">P: {grams ? ((selectedFood.protein * (parseFloat(grams) / 100)).toFixed(1)) : selectedFood.protein}{lang === "ru" ? "г" : "q"}</span>
            <span className="text-amber-600">K: {grams ? ((selectedFood.carbs * (parseFloat(grams) / 100)).toFixed(1)) : selectedFood.carbs}{lang === "ru" ? "г" : "q"}</span>
            <span className="text-blue-600">Y: {grams ? ((selectedFood.fat * (parseFloat(grams) / 100)).toFixed(1)) : selectedFood.fat}{lang === "ru" ? "г" : "q"}</span>
          </div>
        )}

        {/* Added Foods List */}
        {addedFoods.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {pt.addedFoods} ({addedFoods.length})
            </h3>
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_80px_40px] gap-2 px-4 py-2 bg-gray-50 text-xs font-semibold text-muted border-b border-border">
                <span>{pt.food}</span>
                <span className="text-right">{pt.gram}</span>
                <span className="text-right">{pt.kcal}</span>
                <span className="text-right text-red-600">{pt.protein}</span>
                <span className="text-right text-amber-600">{pt.carb}</span>
                <span className="text-right text-blue-600">{pt.fat}</span>
                <span></span>
              </div>
              {addedFoods.map((item) => {
                const m = item.grams / 100;
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-2 sm:grid-cols-[1fr_80px_80px_80px_80px_80px_40px] gap-2 px-4 py-3 border-b border-gray-50 last:border-0 items-center text-sm hover:bg-gray-50/50 transition"
                  >
                    <span className="font-medium text-foreground col-span-2 sm:col-span-1">{item.food.name}</span>
                    <span className="text-right text-muted">
                      <span className="sm:hidden text-xs text-muted mr-1">{pt.gram}:</span>
                      {item.grams}{lang === "ru" ? "г" : "q"}
                    </span>
                    <span className="text-right font-semibold text-foreground">
                      <span className="sm:hidden text-xs text-muted mr-1">{pt.kcal}:</span>
                      {Math.round(item.food.calories * m)}
                    </span>
                    <span className="text-right text-red-600">
                      <span className="sm:hidden text-xs mr-1">P:</span>
                      {(item.food.protein * m).toFixed(1)}{lang === "ru" ? "г" : "q"}
                    </span>
                    <span className="text-right text-amber-600">
                      <span className="sm:hidden text-xs mr-1">K:</span>
                      {(item.food.carbs * m).toFixed(1)}{lang === "ru" ? "г" : "q"}
                    </span>
                    <span className="text-right text-blue-600">
                      <span className="sm:hidden text-xs mr-1">Y:</span>
                      {(item.food.fat * m).toFixed(1)}{lang === "ru" ? "г" : "q"}
                    </span>
                    <button
                      onClick={() => handleRemoveFood(item.id)}
                      className="text-red-400 hover:text-red-600 transition text-lg leading-none justify-self-end"
                      title={pt.delete}
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total Summary Cards */}
        {addedFoods.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(totals.calories)}
                </div>
                <div className="text-xs text-orange-600/70 font-medium mt-1">{pt.calories}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {totals.protein.toFixed(1)}{lang === "ru" ? "г" : "q"}
                </div>
                <div className="text-xs text-red-600/70 font-medium mt-1">{pt.protein}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {totals.carbs.toFixed(1)}{lang === "ru" ? "г" : "q"}
                </div>
                <div className="text-xs text-amber-600/70 font-medium mt-1">{pt.carbohydrate}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totals.fat.toFixed(1)}{lang === "ru" ? "г" : "q"}
                </div>
                <div className="text-xs text-blue-600/70 font-medium mt-1">{pt.fat}</div>
              </div>
            </div>

            {macroTotal > 0 && (
              <div>
                <div className="text-sm font-medium text-foreground mb-2">{pt.macroDistribution}</div>
                <div className="flex rounded-full overflow-hidden h-5">
                  <div
                    className="bg-red-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    style={{ width: `${proteinPct}%` }}
                    title={`${pt.protein}: ${proteinPct.toFixed(1)}%`}
                  >
                    {proteinPct >= 8 && `${proteinPct.toFixed(0)}%`}
                  </div>
                  <div
                    className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    style={{ width: `${carbsPct}%` }}
                    title={`${pt.carbohydrate}: ${carbsPct.toFixed(1)}%`}
                  >
                    {carbsPct >= 8 && `${carbsPct.toFixed(0)}%`}
                  </div>
                  <div
                    className="bg-blue-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    style={{ width: `${fatPct}%` }}
                    title={`${pt.fat}: ${fatPct.toFixed(1)}%`}
                  >
                    {fatPct >= 8 && `${fatPct.toFixed(0)}%`}
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                    {pt.protein} {proteinPct.toFixed(1)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    {pt.carbohydrate} {carbsPct.toFixed(1)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                    {pt.fat} {fatPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Daily Goal */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{pt.dailyCalorieGoal}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    min="500"
                    max="10000"
                    className="w-24 px-3 py-1.5 rounded-lg border border-border bg-white text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <span className="text-sm text-muted">kkal</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    goalProgress >= 100 ? "bg-red-500" : goalProgress >= 80 ? "bg-amber-500" : "bg-green-500"
                  }`}
                  style={{ width: `${goalProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>
                  {Math.round(totals.calories)} / {goalNum} kkal ({goalProgress.toFixed(0)}%)
                </span>
                <span
                  className={
                    remaining === 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"
                  }
                >
                  {remaining === 0
                    ? pt.goalReached
                    : pt.remaining.replace("{val}", String(Math.round(remaining)))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {addedFoods.length === 0 && (
          <div className="text-center py-8 text-muted">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-sm">{pt.emptyState}</p>
            <p className="text-xs mt-1">{pt.emptyStateDetail}</p>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
