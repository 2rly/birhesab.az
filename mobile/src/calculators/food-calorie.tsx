import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Button } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { ProgressBar, Caption } from "./_health-parts";

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

const FORMULA_TITLE = "Kalori hesablama haqqında";
const FORMULA_CONTENT = `Kalori — qidanın enerji dəyərini ölçən vahiddir. Hər bir qida maddəsi 3 əsas makro qida qrupundan ibarətdir:

• Protein (zülal): 1 qram = 4 kkal
• Karbohidrat: 1 qram = 4 kkal
• Yağ: 1 qram = 9 kkal

Gündəlik kalori ehtiyacı insanın yaşı, cinsi, çəkisi, boyu və fiziki aktivliyindən asılıdır. Orta hesabla:
• Qadınlar: 1800-2200 kkal/gün
• Kişilər: 2200-2800 kkal/gün

Çəki itkisi üçün gündəlik normanızdan 500 kkal az, çəki artımı üçün isə 500 kkal çox qəbul etmək tövsiyə olunur.`;

const RED = "#dc2626";
const AMBER = "#d97706";
const BLUE = "#2563eb";
const ORANGE = "#ea580c";

export function FoodCalorieCalculator() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Hamısı");
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

  const gramsNum = parseFloat(grams);
  const canAdd = !!selectedFood && !!grams && gramsNum > 0;

  function handleAddFood() {
    if (!selectedFood || !grams || parseFloat(grams) <= 0) return;
    setAddedFoods((prev) => [...prev, { id: nextId, food: selectedFood, grams: parseFloat(grams) }]);
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

  const scaled = (v: number) => (grams ? (v * (parseFloat(grams) / 100)).toFixed(1) : String(v));

  return (
    <View>
      {/* Kateqoriya */}
      <Text style={[styles.label, { color: colors.n700 }]}>Kateqoriya</Text>
      <View style={styles.chips}>
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                setSelectedCategory(cat);
                setSearchQuery("");
                setSelectedFood(null);
                setShowDropdown(true);
              }}
              style={[styles.chip, { backgroundColor: active ? colors.accent : colors.n240 }]}
            >
              <Text style={[styles.chipText, { color: active ? colors.onAccent : colors.n760 }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Qida axtar */}
      <Text style={[styles.label, { color: colors.n700, marginTop: 16 }]}>Qida axtar</Text>
      <View style={[styles.searchRow, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <MaterialIcons name="search" size={20} color={colors.n580} style={{ marginLeft: 12 }} />
        <TextInput
          value={searchQuery}
          onChangeText={(t) => {
            setSearchQuery(t);
            setSelectedFood(null);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Qida adını yazın..."
          placeholderTextColor={colors.n400c}
          style={[styles.searchInput, { color: colors.n940 }]}
        />
        {showDropdown && (
          <Pressable onPress={() => setShowDropdown(false)} hitSlop={8} style={{ paddingHorizontal: 12 }}>
            <MaterialIcons name="expand-less" size={22} color={colors.n580} />
          </Pressable>
        )}
      </View>
      {showDropdown && filteredFoods.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 260 }}>
            {filteredFoods.map((food, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleSelectFood(food)}
                style={[styles.dropItem, { borderBottomColor: colors.n240 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropName, { color: colors.n940 }]}>{food.name}</Text>
                  <Text style={[styles.tiny, { color: colors.n580 }]}>({food.category})</Text>
                </View>
                <Text style={[styles.tiny, { color: colors.n580 }]}>{food.calories} kkal/100q</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
      {showDropdown && filteredFoods.length === 0 && !!searchQuery && (
        <View style={[styles.dropdown, styles.notFound, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
          <Text style={[styles.small, { color: colors.n580 }]}>Qida tapılmadı</Text>
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <InputField label="Qram" value={grams} onChangeText={setGrams} placeholder="100" keyboardType="decimal-pad" suffix="q" />
      </View>
      <Button title="Əlavə et" icon="add" onPress={handleAddFood} disabled={!canAdd} />

      {/* Seçilmiş qida önizləməsi */}
      {selectedFood && (
        <View style={[styles.preview, { backgroundColor: "#3b82f61a", borderColor: "#3b82f644" }]}>
          <Text style={[styles.previewName, { color: colors.n940 }]}>{selectedFood.name}</Text>
          <Text style={[styles.small, { color: colors.n580 }]}>
            {grams ? Math.round(selectedFood.calories * (parseFloat(grams) / 100)) : selectedFood.calories} kkal
          </Text>
          <Text style={[styles.small, { color: RED }]}>P: {scaled(selectedFood.protein)}q</Text>
          <Text style={[styles.small, { color: AMBER }]}>K: {scaled(selectedFood.carbs)}q</Text>
          <Text style={[styles.small, { color: BLUE }]}>Y: {scaled(selectedFood.fat)}q</Text>
        </View>
      )}

      {/* Əlavə edilmiş qidalar */}
      {addedFoods.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.n940 }]}>Əlavə edilmiş qidalar ({addedFoods.length})</Text>
          <View style={[styles.table, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            {addedFoods.map((item) => {
              const m = item.grams / 100;
              return (
                <View key={item.id} style={[styles.foodRow, { borderBottomColor: colors.n240 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dropName, { color: colors.n940 }]}>{item.food.name}</Text>
                    <View style={styles.foodStats}>
                      <Text style={[styles.tiny, { color: colors.n580 }]}>Qram: {item.grams}q</Text>
                      <Text style={[styles.tiny, { color: colors.n940, fontWeight: "700" }]}>
                        Kkal: {Math.round(item.food.calories * m)}
                      </Text>
                      <Text style={[styles.tiny, { color: RED }]}>P: {(item.food.protein * m).toFixed(1)}q</Text>
                      <Text style={[styles.tiny, { color: AMBER }]}>K: {(item.food.carbs * m).toFixed(1)}q</Text>
                      <Text style={[styles.tiny, { color: BLUE }]}>Y: {(item.food.fat * m).toFixed(1)}q</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleRemoveFood(item.id)} hitSlop={8} accessibilityLabel="Sil">
                    <MaterialIcons name="close" size={22} color="#f87171" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Yekun */}
      {addedFoods.length > 0 && (
        <View style={{ gap: 16, marginTop: 16 }}>
          <View style={styles.totals}>
            {[
              { v: String(Math.round(totals.calories)), l: "Kalori (kkal)", c: ORANGE },
              { v: `${totals.protein.toFixed(1)}q`, l: "Protein", c: RED },
              { v: `${totals.carbs.toFixed(1)}q`, l: "Karbohidrat", c: AMBER },
              { v: `${totals.fat.toFixed(1)}q`, l: "Yağ", c: BLUE },
            ].map((t) => (
              <View key={t.l} style={[styles.totalCard, { backgroundColor: t.c + "1a", borderColor: t.c + "55" }]}>
                <Text style={[styles.totalValue, { color: t.c }]}>{t.v}</Text>
                <Text style={[styles.tiny, { color: t.c, fontWeight: "600" }]}>{t.l}</Text>
              </View>
            ))}
          </View>

          {macroTotal > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.n940 }]}>Makro qida paylanması</Text>
              <View style={styles.macroBar}>
                {[
                  { pct: proteinPct, c: "#ef4444" },
                  { pct: carbsPct, c: "#f59e0b" },
                  { pct: fatPct, c: "#3b82f6" },
                ].map((s, i) => (
                  <View key={i} style={[styles.macroSeg, { width: `${s.pct}%`, backgroundColor: s.c }]}>
                    {s.pct >= 8 && <Text style={styles.macroSegText}>{s.pct.toFixed(0)}%</Text>}
                  </View>
                ))}
              </View>
              <View style={styles.legendRow}>
                {[
                  { l: "Protein", pct: proteinPct, c: "#ef4444" },
                  { l: "Karbohidrat", pct: carbsPct, c: "#f59e0b" },
                  { l: "Yağ", pct: fatPct, c: "#3b82f6" },
                ].map((s) => (
                  <View key={s.l} style={styles.legend}>
                    <View style={[styles.dot, { backgroundColor: s.c }]} />
                    <Text style={[styles.tiny, { color: colors.n580 }]}>
                      {s.l} {s.pct.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Gündəlik hədəf */}
          <View style={[styles.goalBox, { backgroundColor: colors.n240 }]}>
            <View style={styles.goalHead}>
              <Text style={[styles.sectionTitle, { color: colors.n940, marginBottom: 0, flex: 1 }]}>Gündəlik kalori hədəfi</Text>
              <View style={[styles.goalInputWrap, { backgroundColor: colors.n200, borderColor: colors.n280 }]}>
                <TextInput
                  value={dailyGoal}
                  onChangeText={setDailyGoal}
                  keyboardType="number-pad"
                  style={[styles.goalInput, { color: colors.n940 }]}
                />
              </View>
              <Text style={[styles.small, { color: colors.n580 }]}>kkal</Text>
            </View>
            <ProgressBar
              pct={goalProgress}
              height={16}
              color={goalProgress >= 100 ? "#ef4444" : goalProgress >= 80 ? "#f59e0b" : "#22c55e"}
            />
            <View style={styles.goalFoot}>
              <Caption>
                {Math.round(totals.calories)} / {goalNum} kkal ({goalProgress.toFixed(0)}%)
              </Caption>
              <Text style={[styles.tiny, { fontWeight: "700", color: remaining === 0 ? RED : "#16a34a" }]}>
                {remaining === 0 ? "Hədəfə çatdınız!" : `Qalır: ${Math.round(remaining)} kkal`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {addedFoods.length === 0 && (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🍽️</Text>
          <Text style={[styles.small, { color: colors.n580, textAlign: "center" }]}>Yuxarıdan qida seçib əlavə edin</Text>
          <Text style={[styles.tiny, { color: colors.n580, marginTop: 4, textAlign: "center" }]}>
            Kalori və makro qida dəyərləri avtomatik hesablanacaq
          </Text>
        </View>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["bmr", "bmi", "water-intake", "ideal-weight"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  chipText: { fontSize: 12, fontWeight: "600" },
  searchRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, paddingHorizontal: 10, paddingVertical: 12 },
  dropdown: { borderRadius: 10, borderWidth: 1, marginTop: 4, overflow: "hidden" },
  notFound: { padding: 14, alignItems: "center" },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropName: { fontSize: 14, fontWeight: "600" },
  tiny: { fontSize: 11 },
  small: { fontSize: 13 },
  preview: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 12 },
  previewName: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  table: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  foodRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  foodStats: { flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 2, marginTop: 3 },
  totals: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  totalCard: { flexGrow: 1, flexBasis: "45%", borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  totalValue: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  macroBar: { flexDirection: "row", height: 20, borderRadius: 10, overflow: "hidden" },
  macroSeg: { height: "100%", alignItems: "center", justifyContent: "center" },
  macroSegText: { fontSize: 10, color: "#ffffff", fontWeight: "700" },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  legend: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  goalBox: { borderRadius: 12, padding: 14, gap: 10 },
  goalHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  goalInputWrap: { borderRadius: 8, borderWidth: 1, width: 90 },
  goalInput: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 6, textAlign: "right" },
  goalFoot: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 6 },
  empty: { alignItems: "center", paddingVertical: 28 },
});
