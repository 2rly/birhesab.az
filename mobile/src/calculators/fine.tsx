import { useState, useMemo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { TintBox, TintText, TINT } from "./_legal-parts";

// Azərbaycan Respublikası İnzibati Xətalar Məcəlləsi — yol hərəkəti qaydalarının pozulmasına görə cərimələr

interface Fine {
  id: number;
  article: string;
  description: string;
  amount: number;
  amountMax?: number;
  points?: number;
  note?: string;
}

const fines: Fine[] = [
  { id: 1, article: "327.1", description: "Yol nişanlarının və ya yolların hərəkət hissəsinin işarələrinin tələblərinə riayət edilməməsi, NV-nin yolda yerləşdirilməsi, araməsafəsi, yedəyə alma, yük daşıma, sürmə təlimi, yaşayış zonasında hərəkət, ötmə/manevr qaydaları, səkil/yolun çiyni ilə hərəkət", amount: 40 },
  { id: 2, article: "327.1-1", description: "Ümumi istifadədə olan NV üçün nəzərdə tutulmuş hərəkət zolağında digər NV-lərin hərəkət etməsi", amount: 100, points: 2 },
  { id: 3, article: "327.1-2", description: "Velosiped yollarında velosiped və kiçik elektrik NV istisna olmaqla, digər NV-lərin hərəkət etməsi", amount: 100, points: 2 },
  { id: 4, article: "327.2", description: "Svetoforun/nizamlayıcının qadağanedici işarəsi, 3.1 nişanının pozulması, sərnişin daşıma qaydası, əks istiqamətli ötmə, yolayrıcını keçmə, 1.1/1.3/1.11 xətlərinin pozulması ilə sola/geriyə dönmə", amount: 100, points: 3 },
  { id: 5, article: "327.3", description: "Dəmiryol keçidlərindən keçmə qaydalarının pozulması, müvafiq orqan əməkdaşının saxlamaq tələbinin yerinə yetirilməməsi", amount: 100, points: 4 },
  { id: 6, article: "327.4", description: "Birtərəfli hərəkət yolunda əks istiqamətdə hərəkət, 1.1/1.3/1.11 xətlərini pozmaqla əks istiqamətli zolağa keçmə", amount: 150, points: 4 },
  { id: 7, article: "327.5", description: "Avtomagistrallarda sürəti 50 km/s-dan az NV, 3.5t+ yük avtomobilinin 2-ci zolaqdan sonrakına keçməsi, geriyə dönmə/hərəkət, sürmə təlimi", amount: 100, points: 4 },
  { id: 8, article: "327.6", description: "YHQ pozan sürücünün yol-nəqliyyat hadisəsi yerindən yayınması", amount: 300 },
  { id: 9, article: "327.8", description: "327.1–327.6, 328, 330-cu maddələrdəki xətalar nəticəsində yüngül bədən xəsarəti", amount: 200, note: "və ya idarəetmə hüququ 1 ilədək məhdudlaşdırılır" },
  { id: 10, article: "328.1", description: "Sürət həddini 10–20 km/s aşma", amount: 10 },
  { id: 11, article: "328.2", description: "Sürət həddini 21–40 km/s aşma", amount: 50, points: 2 },
  { id: 12, article: "328.3", description: "Sürət həddini 41–60 km/s aşma", amount: 200, points: 3 },
  { id: 13, article: "328.4", description: "Sürət həddini 61 km/s-dan çox aşma", amount: 300, points: 4 },
  { id: 14, article: "329.1", description: "Təhlükəsizlik kəmərini bağlamadan NV idarə etmə", amount: 40 },
  { id: 15, article: "329.2", description: "Motodəbilqə taxmadan/düymələmədən motosikleti idarə etmə, dəbilqəsiz sərnişin daşımaq", amount: 40 },
  { id: 16, article: "329.3", description: "İşıq cihazlarından və səs siqnallarından istifadə qaydalarının pozulması", amount: 30 },
  { id: 17, article: "330.0", description: "Sürücü tərəfindən piyadaya yol verilməməsi (nizamlanmayan keçid, sağa/sola dönərkən)", amount: 50 },
  { id: 18, article: "331", description: "Xüsusi səs/işıq siqnallı NV-lərə yol verilməməsi, mütəşəkkil nəqliyyat dəstəsinə qoşulma", amount: 100, points: 3 },
  { id: 19, article: "332.1", description: "NV-ni etibarnamə olmadan idarə etmə (sahibi yanında olmadıqda)", amount: 40 },
  { id: 20, article: "332.2", description: "NV idarə etmək hüququ olmadan NV idarə etmə", amount: 200 },
  { id: 21, article: "332.3", description: "332.2-nin 1 il ərzində təkrarı və ya hüququ məhdudlaşdırılmış şəxs tərəfindən idarə", amount: 400 },
  { id: 22, article: "332.4", description: "332.2 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", amount: 500, note: "və ya 1 ayadək inzibati həbs" },
  { id: 23, article: "332.5", description: "Ümumi istifadədə olan NV-ni hüququ olmadan sərnişin daşımaqla idarə etmə", amount: 0, note: "15 gündən 1 ayadək inzibati həbs" },
  { id: 24, article: "332.6", description: "332.5-in 1 il ərzində təkrarı", amount: 0, note: "1 aydan 2 ayadək inzibati həbs" },
  { id: 25, article: "332.7", description: "332.5 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", amount: 0, note: "2 aydan 3 ayadək inzibati həbs" },
  { id: 26, article: "333.1", description: "Sərxoş vəziyyətdə NV idarə etmə (hüququ olan şəxs)", amount: 400, note: "və ya hüquq 6 aydan 1 ilədək məhdudlaşdırılır" },
  { id: 27, article: "333.2", description: "333.1-in 1 il ərzində təkrarı", amount: 500, note: "hüquq 2 il məhdudlaşdırılır və ya 15 günədək həbs" },
  { id: 28, article: "333.3", description: "333.1 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", amount: 700, note: "hüquq 2 il məhdudlaşdırılır və ya 15 gün–1 ay həbs" },
  { id: 29, article: "333.4", description: "Ümumi NV-ni sərxoş vəziyyətdə sərnişin daşımaqla idarə etmə", amount: 0, note: "hüquq 2 il + 15 gün–1 ay həbs" },
  { id: 30, article: "333.5", description: "333.4 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", amount: 0, note: "hüquq 2 il + 2–3 ay həbs" },
  { id: 31, article: "333-1.1", description: "Narkotik/psixotrop maddələrin təsiri ilə NV idarə etmə (hüququ olan)", amount: 600, note: "və ya hüquq 6 aydan 1 ilədək məhdudlaşdırılır" },
  { id: 32, article: "333-1.2", description: "333-1.1-in 1 il ərzində təkrarı", amount: 800, note: "hüquq 2 il + 15 gün–1 ay həbs" },
  { id: 33, article: "333-1.3", description: "333-1.1 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", amount: 900, note: "hüquq 2 il + 1–2 ay həbs" },
  { id: 34, article: "333-1.4", description: "Ümumi NV-ni narkotik ilə sərnişin daşımaqla idarə etmə", amount: 0, note: "hüquq 2 il + 1–2 ay həbs" },
  { id: 35, article: "333-1.5", description: "333-1.4 nəticəsində yüngül bədən xəsarəti və ya maddi zərər", amount: 0, note: "hüquq 2 il + 2–3 ay həbs" },
  { id: 36, article: "334.1", description: "Hüququ olmayan şəxsin sərxoş vəziyyətdə NV idarə etməsi", amount: 500, note: "və ya 15 günədək həbs" },
  { id: 37, article: "334.2", description: "334.1-in 1 il ərzində təkrarı", amount: 0, note: "15 gündən 1 ayadək həbs" },
  { id: 38, article: "334.3", description: "334.1 nəticəsində xəsarət və ya maddi zərər", amount: 800, note: "və ya 1–2 ay həbs" },
  { id: 39, article: "334.4", description: "Ümumi NV hüququ olmadan sərxoş sərnişin daşımaqla idarə", amount: 0, note: "1–2 ay həbs" },
  { id: 40, article: "334.5", description: "334.4-ün təkrarı və ya nəticəsində xəsarət/zərər", amount: 0, note: "2–3 ay həbs" },
  { id: 41, article: "334-1.1", description: "Hüququ olmayan şəxsin narkotik təsiri ilə NV idarə etməsi", amount: 800, note: "və ya 15 günədək həbs" },
  { id: 42, article: "334-1.2", description: "334-1.1-in 1 il ərzində təkrarı", amount: 0, note: "1–2 ay həbs" },
  { id: 43, article: "334-1.3", description: "334-1.1 nəticəsində xəsarət və ya maddi zərər", amount: 1000, note: "və ya 1–3 ay həbs" },
  { id: 44, article: "334-1.4", description: "Ümumi NV narkotik ilə hüququ olmadan sərnişin daşımaqla idarə", amount: 0, note: "1–3 ay həbs" },
  { id: 45, article: "334-1.5", description: "334-1.4-ün təkrarı və ya nəticəsində xəsarət/zərər", amount: 0, note: "2–3 ay həbs" },
  { id: 46, article: "335.1", description: "NV-ni idarəetmə hüququ olmayan şəxsə vermə", amount: 60, note: "Vəzifəli: 200, Hüquqi: 2000 AZN" },
  { id: 47, article: "335.2", description: "335.1-in 1 il ərzində təkrarı", amount: 100, note: "Vəzifəli: 300, Hüquqi: 3000 AZN" },
  { id: 48, article: "335.3", description: "335.1 nəticəsində fiziki/maddi zərər", amount: 180, note: "Vəzifəli: 500, Hüquqi: 5000 AZN" },
  { id: 49, article: "335.4", description: "Ümumi NV-ni hüququ olmayan şəxsə sərnişin daşımaq üçün vermə", amount: 200, note: "Vəzifəli: 500, Hüquqi: 3000 AZN" },
  { id: 50, article: "336.1", description: "Sərxoş olduğunu bilə-bilə NV-ni həmin şəxsə vermə", amount: 100, note: "Vəzifəli: 300, Hüquqi: 3000 AZN" },
  { id: 51, article: "336.2", description: "336.1-in 1 il ərzində təkrarı", amount: 200, note: "Vəzifəli: 400, Hüquqi: 4000 AZN" },
  { id: 52, article: "336.3", description: "336.1 nəticəsində fiziki/maddi zərər", amount: 300, note: "Vəzifəli: 600, Hüquqi: 6000 AZN" },
  { id: 53, article: "337.1", description: "Hüququ olmadığını və sərxoş olduğunu bilə-bilə NV-ni həmin şəxsə vermə", amount: 200, note: "Vəzifəli: 400, Hüquqi: 4000 AZN" },
  { id: 54, article: "337.2", description: "337.1-in 1 il ərzində təkrarı", amount: 300, note: "Vəzifəli: 600, Hüquqi: 6000 AZN" },
  { id: 55, article: "337.3", description: "337.1 nəticəsində fiziki/maddi zərər", amount: 400, note: "Vəzifəli: 800, Hüquqi: 8000 AZN" },
  { id: 56, article: "338.1", description: "Piyadanın YHQ pozması (svetofor, qəflətən çıxma, xüsusi siqnallı NV)", amount: 20 },
  { id: 57, article: "338.2", description: "Piyadanın yolun hərəkət hissəsini/dəmiryol keçidini müəyyən olunmayan yerdən keçməsi", amount: 20 },
  { id: 58, article: "338.2-1", description: "Sürət həddi 80+ km/s yolda piyadanın müəyyən yerdən kənar keçməsi", amount: 40 },
  { id: 59, article: "338.3", description: "Sərnişinlərin minmə/düşmə qaydalarının pozulması, kəmər bağlanmaması, dəbilqə geyilməməsi, əşya atılması, sürücünü yayındırma", amount: 30 },
  { id: 60, article: "338.4", description: "Velosipedçilər və moped sürücüləri tərəfindən YHQ pozulması", amount: 40 },
  { id: 61, article: "338.4-1", description: "Kiçik elektrik nəqliyyat vasitələrini idarə edənlər tərəfindən YHQ pozulması", amount: 40 },
  { id: 62, article: "338.5", description: "At arabası/kirşə idarə edənlər və mal-qara ötürənlər tərəfindən YHQ pozulması", amount: 40 },
  { id: 63, article: "338.6", description: "338.4/338.5-dəki xətaların sərxoş vəziyyətdə törədilməsi", amount: 70 },
  { id: 64, article: "338.7", description: "338.4–338.6 nəticəsində yüngül xəsarət və ya maddi zərər", amount: 80, amountMax: 100 },
  { id: 65, article: "339.1", description: "NV-ni dövlət qeydiyyatından keçirmədən idarə etmə, təkrar qeydiyyat, özgəninkiləşdirmə qaydalarını pozma", amount: 50, note: "Vəzifəli: 100, Hüquqi: 300 AZN" },
  { id: 66, article: "339.1-1", description: "NV-ni texniki baxışdan keçirmədən idarə etmə", amount: 50 },
  { id: 67, article: "339.2", description: "Qeydiyyat üçün qanunsuz sənəd tələbi, süründürməçilik, sənədin həqiqətə uyğun olmaması", amount: 150, amountMax: 200 },
  { id: 68, article: "339.3", description: "Sürücülük vəsiqəsi ilə bağlı süründürməçilik, imtahana əsassız buraxmama", amount: 200, amountMax: 250 },
  { id: 69, article: "339.4", description: "Cərimənin ödəniş sistemindən istifadə etmədən qanunsuz bilavasitə alınması", amount: 300, amountMax: 500 },
  { id: 70, article: "339.5", description: "Protokolun/qərarın vaxtında informasiya sisteminə göndərilməməsi", amount: 500, amountMax: 700 },
  { id: 71, article: "342.1", description: "NV istismar qaydalarının pozulması (qapı bağlanmaması, nişanlar, su sıçratma, palçıq, nişanın təmiz saxlanmaması, əlil piyadaya dayanmama)", amount: 40 },
  { id: 72, article: "342.2", description: "Tormoz/sükan nasazlığı, normativ pozulması ilə avadanlıq quraşdırılması/dəyişdirilməsi, ban şüşələrinə qanunsuz örtük", amount: 150 },
  { id: 73, article: "342.3", description: "Mühərrik səsinin artırılması məqsədi ilə egzoz sisteminə avadanlıq quraşdırılması", amount: 500 },
  { id: 74, article: "342.4", description: "342.3-ün 1 il ərzində təkrarı", amount: 1000 },
  { id: 75, article: "342.5", description: "İşıq cihazları, silgəclər, təkərlər, mühərrik və ya digər konstruksiya nasazlığı ilə istismar", amount: 50 },
  { id: 76, article: "342.6", description: "Sürücünün hərəkət zamanı telefonu əldə saxlamaqla istifadə etməsi", amount: 50 },
  { id: 77, article: "342.7", description: "Qeydiyyat nişanlarının olmaması, saxta və ya başqa NV-yə verilmiş nişanlarla idarə", amount: 100, points: 4 },
  { id: 78, article: "342.8", description: "342.1/342.2 nəticəsində yüngül bədən xəsarəti", amount: 200, note: "və ya hüquq 1–2 il məhdudlaşdırılır" },
  { id: 79, article: "342.9", description: "İcazəsiz xüsusi siqnal, antiradar, əhalinin dincliyini pozan səs siqnalı istifadəsi", amount: 500, amountMax: 800, note: "predmet müsadirə edilir" },
  { id: 80, article: "343.1", description: "Alkoqol müayinəsindən imtina (hüququ olan şəxs)", amount: 400, note: "və ya hüquq 6 aydan 1 ilədək məhdudlaşdırılır" },
  { id: 81, article: "343.1-1", description: "343.1-in 1 il ərzində təkrarı", amount: 500, note: "hüquq 2 il + 15 günədək həbs" },
  { id: 82, article: "343.4", description: "Hüququ olmayan şəxsin alkoqol müayinəsindən imtinası", amount: 500, note: "və ya 15 günədək həbs" },
  { id: 83, article: "343.8", description: "YHQ iştirakçısının sərxoşluq müayinəsindən imtinası", amount: 150 },
  { id: 84, article: "343.9", description: "338.10 halında alkoqol müayinəsindən imtina", amount: 250, amountMax: 300 },
  { id: 85, article: "344", description: "Tibbi müayinədən keçmədən NV idarə etmə", amount: 30 },
  { id: 86, article: "345.1", description: "NV saxlanca qəbul/saxlama qaydalarının pozulması", amount: 60, note: "Vəzifəli: 60, Hüquqi: 150 AZN" },
  { id: 87, article: "345.2", description: "Banı zədələnmiş NV-nin icazəsiz təmirə qəbulu", amount: 250 },
  { id: 88, article: "346.1", description: "Dayanma və ya durma qaydalarını pozma", amount: 20 },
  { id: 89, article: "346.2", description: "Ümumi NV dayanacaqlarında/5.12, 5.13 nişanlarından 15m-dən yaxın dayanma/durma", amount: 40, points: 2 },
  { id: 90, article: "346.3", description: "Ümumi NV-ni müəyyən dayanacaq meydançalarından kənarda dayandırma", amount: 100, points: 4 },
  { id: 91, article: "346.4", description: "Yolun kənarında ikinci və sonrakı cərgələrdə dayanma/durma", amount: 80, points: 2 },
  { id: 92, article: "346.5", description: "Hərəkət hissələrinin kəsişməsində və kənardan 5m-dən yaxın dayanma/durma", amount: 40, points: 2 },
  { id: 93, article: "346.6", description: "Taksi duracaqlarında taksi olmayan NV-lərin dayanması/durması", amount: 40, points: 2 },
  { id: 94, article: "346.7", description: "Velosiped yollarında dayanma/durma (velosiped/kiçik elektrik NV istisna)", amount: 100, points: 2 },
  { id: 95, article: "346.8", description: "Ümumi NV üçün hərəkət zolağında dayanma/durma", amount: 100, points: 2 },
  { id: 96, article: "346.9", description: "Səkilərdə NV-lərin dayanması/durması", amount: 60, points: 2 },
  { id: 97, article: "346-1.1", description: "Ödənişli parklanma qaydalarının pozulması (ödəniş edilmədən/vaxtı keçmiş)", amount: 20 },
  { id: 98, article: "346-1.2", description: "Parklanma üsulunun pozulması (digər NV-nin parklanmasına/hərəkətinə maneə)", amount: 20 },
  { id: 99, article: "346-1.3", description: "Əlillər üçün parklanma yerində digər NV-lərin parklanması", amount: 60 },
  { id: 100, article: "346-1.4", description: "3.5t+ yük avtomobilinin parklanması, parklanma yerinin rezervasiyası, maneə yaradılması", amount: 20 },
  { id: 101, article: "346-1.5", description: "24 saatdan artıq parklanma yerində saxlanılma", amount: 20 },
  { id: 102, article: "346-1.6", description: "Elektrik doldurma yerində elektrik NV-dən başqa digər NV parklanması", amount: 20 },
  { id: 103, article: "346-1.7", description: "Velosiped/kiçik elektrik NV-lərin ayrılmış parklanma yerindən kənarda parklanması", amount: 10 },
  { id: 104, article: "346-1.8", description: "Xidməti parklanma yerlərində digər NV-lərin parklanması", amount: 40 },
  { id: 105, article: "347", description: "NV istifadəçisi barədə sorğuya 5 gün ərzində məlumat verilməməsi", amount: 150, note: "Vəzifəli: 150, Hüquqi: 300 AZN" },
  { id: 106, article: "348", description: "Təhlükəli yüklərin daşınması qaydalarının pozulması", amount: 100, note: "Vəzifəli: 500, Hüquqi: 5000 AZN" },
  { id: 107, article: "349", description: "YH təhlükəsizlik səviyyəsinin azaldılması hesabına buraxılış qabiliyyətinin artırılması", amount: 350, amountMax: 500, note: "Vəzifəli: 350–500, Hüquqi: 3000–4000 AZN" },
  { id: 108, article: "350.1", description: "Avtomobil yollarında icazəsiz tikinti/qazıntı/təmir işləri, təhlükəsizlik standartlarına əməl edilməməsi", amount: 200, amountMax: 300, note: "Vəzifəli: 1000–1500, Hüquqi: 10000–12000 AZN" },
  { id: 109, article: "350.2", description: "İcazəsiz svetofor/yol nişanı quraşdırılması", amount: 30, amountMax: 50, note: "Vəzifəli: 150–200, Hüquqi: 1500–2000 AZN" },
  { id: 110, article: "351", description: "Avtomobil yollarının saxlanılması, qorunması və abadlaşdırılması qaydalarının pozulması", amount: 100, amountMax: 150, note: "Vəzifəli: 100–150, Hüquqi: 1000–1200 AZN" },
  { id: 111, article: "352.1", description: "Avtomobil yollarında hərəkət təhlükəsizliyinin pozulması (material yığılması, kənd təsərrüfatı, kommunikasiya və s.)", amount: 30, amountMax: 50, note: "Vəzifəli: 150–200, Hüquqi: 1500–2000 AZN" },
  { id: 112, article: "352.2", description: "Yollara/yol qurğularına tullantı atılması, NV-dən bayıra əşya atılması", amount: 200, note: "Vəzifəli: 1000, Hüquqi: 4000 AZN" },
  { id: 113, article: "353.1", description: "İriqabaritli/ağırçəkili NV-lərin qabarit parametrlərini pozmaqla idarə edilməsi", amount: 200, amountMax: 1500 },
  { id: 114, article: "353.2", description: "İriqabaritli/ağırçəkili NV-lərin çəki parametrlərini aşmaqla idarə edilməsi", amount: 600 },
  { id: 115, article: "353.3", description: "İriqabaritli/ağırçəkili NV-lərin qabarit/çəki parametrlərini aşmaqla yüklənməsi", amount: 1400, amountMax: 1700, note: "Vəzifəli: 1400–1700, Hüquqi: 4000–5000 AZN" },
  { id: 116, article: "354", description: "Avtomobil yollarında hərəkət təhlükəsizliyi qaydalarının pozulması (icazəsiz tikinti, kommunikasiya, reklam və s.)", amount: 80, amountMax: 100, note: "Vəzifəli: 400–500, Hüquqi: 3000–4000 AZN" },
  { id: 117, article: "355", description: "YH-nin müvəqqəti məhdudlaşdırılması/qadağan edilməsi qaydalarının pozulması", amount: 40, amountMax: 50, note: "Vəzifəli: 250–300, Hüquqi: 500–600 AZN" },
  { id: 118, article: "356.1", description: "Dərman qutusu olmadan NV idarə etmə", amount: 10 },
  { id: 119, article: "356.2", description: "Təcili tibbi yardıma ehtiyacı olan şəxsi daşımama, NV təqdim etməmə", amount: 40 },
  { id: 120, article: "469.3", description: "İcbari sığortanın (OSAGO) olmaması", amount: 50, note: "Vəzifəli: 100, Hüquqi: 300 AZN" },
  { id: 121, article: "511.1", description: "Avtoxuliqanlıq (sürət yarışı, təkər qaldırma, təkər sürtmə ilə səs çıxarma/iz buraxma)", amount: 500, amountMax: 750, note: "hüquq 1 il məhdudlaşdırılır və ya 15 gün–1 ay həbs" },
  { id: 122, article: "511.2", description: "511.1-in 1 il ərzində təkrarı", amount: 750, amountMax: 1000, note: "hüquq 2 il + 1–2 ay həbs" },
  { id: 123, article: "511.3", description: "Sürət yarışı zamanı sürəti 60+ km/s aşmaqla avtoxuliqanlıq", amount: 2000, amountMax: 4000, note: "hüquq 2 il + 1–2 ay həbs" },
  { id: 124, article: "529.3", description: "YHQ cərimə qərarının 3 ay ərzində icra edilməməsi", amount: 0, note: "hüquq 6 aydan 1 ilədək məhdudlaşdırılır" },
];

const pt = {
  formulaTitle: "Cərimələr necə tətbiq olunur?",
  formulaContent: `Azərbaycan Respublikasının İnzibati Xətalar Məcəlləsinə əsasən yol hərəkəti qaydalarının pozulmasına görə cərimələr tətbiq olunur.

Ödəniş qaydaları:
• Cərimə 30 gün ərzində ödənilməlidir
• İlk 30 gündə ödəniş zamanı 50% güzəşt tətbiq oluna bilər
• Vaxtında ödənilməyən cərimələrə əlavə faiz hesablanır

Ödəniş üsulları:
• Bank şöbələri
• Onlayn bankçılıq
• ASAN xidmət mərkəzləri
• Mobil tətbiqetmələr`,
  searchPlaceholder: "Cərimə axtarın (məs.: sürət, kəmər, parklanma...)",
  resultCount: "nəticə",
  article: "Maddə",
  noResults: "Heç bir nəticə tapılmadı",
  noResultsHint: "Axtarış sözünüzü dəyişdirin və ya başqa açar söz istifadə edin.",
  allFines: "Bütün cərimələr",
  infoNote:
    "Bu məlumatlar məlumat xərakterlidir. Cərimə məbləğləri qanunvericilik dəyişikliklərinə əsasən yenilənə bilər. Dəqiq məlumat üçün DYP-nin rəsmi mənbələrinə müraciət edin.",
  attention: "Diqqət:",
  arrestBadge: "Həbs",
  pointsLabel: "bal",
};

/** Saytdakı getAmountColor / getAmountBadgeColor: 0 → boz, <50 → yaşıl, ≤200 → sarı, >200 → qırmızı */
function getAmountTint(amount: number, amountMax?: number): string {
  const value = Math.max(amount, amountMax || 0);
  if (value === 0) return TINT.gray;
  if (value < 50) return TINT.green;
  if (value <= 200) return TINT.amber;
  return TINT.red;
}

export function FineCalculator() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");

  const filteredFines = useMemo(() => {
    if (!search.trim()) return fines;
    const query = search.toLocaleLowerCase("az").trim();
    return fines.filter(
      (f) =>
        f.description.toLocaleLowerCase("az").includes(query) ||
        f.article.toLowerCase().includes(query) ||
        f.amount.toString().includes(query) ||
        (f.amountMax && f.amountMax.toString().includes(query)) ||
        (f.note && f.note.toLocaleLowerCase("az").includes(query))
    );
  }, [search]);

  return (
    <View>
      {/* Axtarış */}
      <View style={[st.search, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
        <MaterialIcons name="search" size={20} color={colors.n580} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={pt.searchPlaceholder}
          placeholderTextColor={colors.n580}
          style={[st.searchInput, { color: colors.n940 }]}
          autoCorrect={false}
        />
        {search.length > 0 && <MaterialIcons name="close" size={18} color={colors.n580} onPress={() => setSearch("")} />}
      </View>

      {/* Nəticə sayı */}
      <Text style={{ fontSize: 13, color: colors.n580, marginBottom: 12 }}>
        <Text style={{ fontWeight: "700", color: colors.n940 }}>{filteredFines.length}</Text> {pt.resultCount}
        {!search.trim() && <Text style={{ fontSize: 12 }}> ({pt.allFines})</Text>}
      </Text>

      {filteredFines.length > 0 ? (
        <View style={{ gap: 10 }}>
          {filteredFines.map((fine) => {
            const c = getAmountTint(fine.amount, fine.amountMax);
            return (
              <View key={fine.id} style={[st.card, { borderColor: c + "55", backgroundColor: c + "10" }]}>
                <View style={st.badges}>
                  <View style={[st.tag, { backgroundColor: colors.n240 }]}>
                    <Text style={[st.tagText, { color: colors.n760, fontFamily: "monospace" }]}>
                      {pt.article} {fine.article}
                    </Text>
                  </View>
                  {fine.points ? (
                    <View style={[st.tag, { backgroundColor: TINT.blue + "22" }]}>
                      <Text style={[st.tagText, { color: TINT.blue }]}>
                        {fine.points} {pt.pointsLabel}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.n940 }}>{fine.description}</Text>
                {fine.note && fine.amount > 0 ? (
                  <Text style={{ fontSize: 12, fontStyle: "italic", color: colors.n580, marginTop: 4 }}>{fine.note}</Text>
                ) : null}
                <View style={{ marginTop: 10, alignItems: "flex-start", gap: 4 }}>
                  {fine.amount > 0 ? (
                    <View style={[st.amount, { backgroundColor: c + "26" }]}>
                      <Text style={{ fontSize: 17, fontWeight: "800", color: c }}>
                        {fine.amountMax ? `${fine.amount} – ${fine.amountMax} AZN` : `${fine.amount} AZN`}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={[st.amount, { backgroundColor: colors.n240 }]}>
                        <Text style={{ fontSize: 14, fontWeight: "800", color: colors.n760 }}>{pt.arrestBadge}</Text>
                      </View>
                      {fine.note ? <Text style={{ fontSize: 12, color: colors.n580 }}>{fine.note}</Text> : null}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🔎</Text>
          <Text style={{ fontSize: 17, fontWeight: "700", color: colors.n940, marginBottom: 6 }}>{pt.noResults}</Text>
          <Text style={{ fontSize: 13, color: colors.n580, textAlign: "center" }}>{pt.noResultsHint}</Text>
        </View>
      )}

      <TintBox tint="blue">
        <TintText tint="blue" size={12}>
          <Text style={{ fontWeight: "700" }}>{pt.attention}</Text> {pt.infoNote}
        </TintText>
      </TintBox>

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["car-customs", "road-tax", "osago", "vehicle-fees"]} />
    </View>
  );
}

const st = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 12, fontWeight: "700" },
  amount: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
});
