// Universitet/kollec adından şəhəri çıxaran helper.
// 1. Əvvəlcə specialty-də "(... filialı)" / "(... şəhəri)" pattern-i yoxlanır.
// 2. Sonra universitetin adında "(... şəhəri)" pattern-i.
// 3. Sonra universitet adında məlum şəhər adı axtarılır.
// 4. Açıq overrides (Qarabağ Universiteti = Xankəndi).
// 5. Default: Bakı (Azərbaycandakı dövlət universitetlərinin əksəriyyəti).

export const KNOWN_CITIES = [
  "Bakı",
  "Sumqayıt",
  "Gəncə",
  "Mingəçevir",
  "Naxçıvan",
  "Lənkəran",
  "Qazax",
  "Quba",
  "Şəki",
  "Şamaxı",
  "Şirvan",
  "Tovuz",
  "Zaqatala",
  "İsmayıllı",
  "Cəlilabad",
  "Ağcabədi",
  "Ağdam",
  "Ağdaş",
  "Astara",
  "Bərdə",
  "Göyçay",
  "Masallı",
  "Sabirabad",
  "Şuşa",
  "Xankəndi",
] as const;

const CITY_OVERRIDES_BY_UNI: Record<string, string> = {
  "Qarabağ Universiteti": "Xankəndi",
  "Azərbaycan Dövlət Aqrar Universiteti": "Gəncə",
  "Azərbaycan Texnologiya Universiteti": "Gəncə",
};

const PAREN_FILIAL_RE = /\(([^)]+?)\s+(?:filialı|şəhəri)\)/i;

export function getCityForEntry(entry: { university: string; specialty: string }): string {
  // 1. Specialty-də filial / şəhər mötərizəsi.
  //    Mötərizədə əlavə qeydlər ola bilər ("(MBA, ..., Zaqatala filialı)") — ona görə
  //    həm bütün mətn, həm də sonuncu söz şəhər adı kimi yoxlanılır.
  const sm = entry.specialty.match(PAREN_FILIAL_RE);
  if (sm) {
    const candidate = sm[1].trim();
    const lastWord = candidate.split(/[\s,]+/).pop() ?? "";
    const hit = KNOWN_CITIES.find(
      (c) => candidate === c || candidate.startsWith(c) || lastWord === c || lastWord.startsWith(c)
    );
    if (hit) return hit;
  }
  // 2. Universitet adında mötərizədə şəhər.
  const um = entry.university.match(PAREN_FILIAL_RE);
  if (um) {
    const candidate = um[1].trim();
    const hit = KNOWN_CITIES.find((c) => candidate === c || candidate.startsWith(c));
    if (hit) return hit;
  }
  // 3. Açıq override.
  if (CITY_OVERRIDES_BY_UNI[entry.university]) {
    return CITY_OVERRIDES_BY_UNI[entry.university];
  }
  // 4. Universitet adının başlanğıcında / içində şəhər adı.
  //    Bakı sondan yoxlanır — "Azərbaycan Dövlət ..." kimi adlar Bakıda olur, amma
  //    "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)" kimi mötərizəli versiya
  //    yuxarıda artıq tutulub.
  for (const city of KNOWN_CITIES) {
    if (city === "Bakı") continue;
    if (entry.university.includes(city)) return city;
  }
  // 5. Default: Bakı.
  return "Bakı";
}
