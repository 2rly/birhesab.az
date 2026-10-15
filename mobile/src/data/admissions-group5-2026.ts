// V ixtisas qrupu üzrə keçid balları — 2026/2027 qəbulu.
// Mənbə: DİM rəsmi keçid balı siyahısı (ödənişli / dövlət sifarişli).
// Bu fayl scripts/build-group5-scores-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.
// 22 ali məktəb, 181 ixtisas.

export interface AdmissionEntry {
  /** DİM ixtisas kodu (6 rəqəm) */
  code?: string;
  university: string;
  specialty: string;
  /** Ə — əyani, Q — qiyabi */
  stream?: string;
  /** Tədris dili (bölmə): AZ · RU · AZ/RU */
  language?: string;
  /** Qabiliyyət imtahanının minimum balı (ödənişli yer üçün) */
  aptitude?: number;
  /** Qabiliyyət imtahanının minimum balı (dövlət sifarişli yer üçün) */
  aptitudeState?: number;
  /** Ödənişli keçid balı */
  score?: number;
  /** Dövlət sifarişli (ödənişsiz) keçid balı */
  stateScore?: number;
  /** Xüsusi qabiliyyət imtahanı tələb edir */
  aptitudeRequired?: boolean;
  /** Altqrup süzgəci üçün etiket (məs. "subbakalavr") */
  tag?: string;
}

export const admissionsGroup5: AdmissionEntry[] = [
  // ═══ Bakı Dövlət Universiteti ═══
  { code: "112719", university: "Bakı Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi (Qazax filialı)", stream: "Ə", language: "AZ", score: 122.4, aptitudeRequired: true },
  // ═══ Azərbaycan Memarlıq və İnşaat Universiteti ═══
  { code: "118632", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Dizayn (interyer dizayn, qrafik dizayn)", stream: "Ə", language: "AZ", score: 153.1, stateScore: 212.8, aptitudeRequired: true },
  { code: "118657", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Dizayn (interyer dizayn, qrafik dizayn, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 220.2, stateScore: 220.2, aptitudeRequired: true },
  // ═══ Azərbaycan Dövlət Pedaqoji Universiteti ═══
  { code: "122358", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", language: "AZ", score: 130.6, stateScore: 169.1, aptitudeRequired: true },
  { code: "122374", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Musiqi müəllimliyi (fortepiano, violin, qarmon, tar, saz, kamança, qanun, klarnet, balaban, vokal)", stream: "Ə", language: "AZ", score: 79.5, stateScore: 97.8, aptitudeRequired: true },
  { code: "122382", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", language: "AZ", score: 144.9, stateScore: 158.1, aptitudeRequired: true },
  // ═══ Azərbaycan Dövlət İqtisad Universiteti ═══
  { code: "123849", university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Dizayn (geyim dizaynı, interyer dizaynı, eksteryer dizaynı, sənaye dizaynı, qrafik dizayn)", stream: "Ə", language: "AZ", score: 186.7, stateScore: 218.9 },
  // ═══ Bakı Mühəndislik Universiteti ═══
  { code: "128969", university: "Bakı Mühəndislik Universiteti", specialty: "Dekorativ-tətbiqi sənət (bədii keramika, şüşə, xalça, bədii toxuculuq)", stream: "Ə", language: "AZ", score: 161.7, stateScore: 196.6 },
  { code: "128977", university: "Bakı Mühəndislik Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn, sənaye dizaynı, geyim dizaynı)", stream: "Ə", language: "AZ", score: 158.9, stateScore: 234.3 },
  { code: "128985", university: "Bakı Mühəndislik Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn, sənaye dizaynı, geyim dizaynı, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 205.3, stateScore: 219.9 },
  // ═══ ADA Universiteti ═══
  { code: "131373", university: "ADA Universiteti", specialty: "Dizayn (interyer dizayn, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 186.9 },
  { code: "131381", university: "ADA Universiteti", specialty: "Dizayn (kommunikasiya dizaynı, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 148.3 },
  // ═══ Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası ═══
  { code: "132118", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "Musiqi müəllimliyi (fortepiano, violin, viola, violonçel, kontrabas, arfa, fleyta, qoboy, klarnet, saksofon, faqot, valtorna, truba, trombon, tuba, zərb alətləri)", stream: "Ə", language: "AZ/RU", score: 102.7, stateScore: 102.7, aptitudeRequired: true },
  { code: "132126", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "Bəstəkarlıq", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "132134", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "Dirijorluq (xor dirijoru, nəfəs alətləri orkestrinin dirijorluğu)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 130.1, aptitudeRequired: true },
  { code: "132142", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "İnstrumental ifaçılıq (fortepiano, orqan, klavesin, violin, viola, violonçel, kontrabas, arfa, fleyta, qoboy, klarnet, saksofon, faqot, valtorna, truba, trombon, tuba, zərb alətləri)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 77.9, aptitudeState: 7, stateScore: 139.2, aptitudeRequired: true },
  { code: "132159", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "Musiqişünaslıq", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 112.4, aptitudeRequired: true },
  { code: "132167", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "Populyar musiqi və caz ifaçılığı (vokal, fortepiano, saksofon və zərb alətləri)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 105.5, aptitudeState: 7, stateScore: 105.5, aptitudeRequired: true },
  { code: "132175", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "Vokal sənəti (akademik vokal)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 104.7, aptitudeRequired: true },
  // ═══ Azərbaycan Milli Konservatoriyası ═══
  { code: "133114", university: "Azərbaycan Milli Konservatoriyası", specialty: "Musiqi müəllimliyi (fortepiano, tar, kamança, qanun, balaban, saz, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 105.7, stateScore: 105.7, aptitudeRequired: true },
  { code: "133122", university: "Azərbaycan Milli Konservatoriyası", specialty: "Bəstəkarlıq (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "133139", university: "Azərbaycan Milli Konservatoriyası", specialty: "Dirijorluq (xalq çalğı alətləri orkestrinin dirijorluğu, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "133147", university: "Azərbaycan Milli Konservatoriyası", specialty: "Dirijorluq (xor dirijorluğu, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "133155", university: "Azərbaycan Milli Konservatoriyası", specialty: "İnstrumental ifaçılıq (tar, kamança, qanun, balaban, saz, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 158.7, aptitudeRequired: true },
  { code: "133163", university: "Azərbaycan Milli Konservatoriyası", specialty: "Musiqişünaslıq (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 141.1, aptitudeRequired: true },
  { code: "133171", university: "Azərbaycan Milli Konservatoriyası", specialty: "Populyar musiqi və caz ifaçılığı (vokal, alətlər üzrə: fortepiano, violin, akkordeon, klarnet, saksofon, fleyta, qoboy, truba, gitara, tar, kamança, balaban, qanun, zərb alətləri, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 75.9, aptitudeRequired: true },
  { code: "133188", university: "Azərbaycan Milli Konservatoriyası", specialty: "Vokal sənəti (xanəndəlik, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 69.8, aptitudeState: 7, stateScore: 69.2, aptitudeRequired: true },
  { code: "133196", university: "Azərbaycan Milli Konservatoriyası", specialty: "Vokal sənəti (milli vokal, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 6, stateScore: 163.9, aptitudeRequired: true },
  // ═══ Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti ═══
  { code: "134249", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Musiqi müəllimliyi (fortepiano, violin, viola, gitara, klarnet, saksofon, fleyta, zərb alətləri, tar, kamança, qarmon, saz, qanun, nağara, balaban, vokal)", stream: "Ə", language: "AZ/RU", score: 95.9, stateScore: 98, aptitudeRequired: true },
  { code: "134257", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", language: "AZ/RU", score: 172.9, stateScore: 172.9, aptitudeRequired: true },
  { code: "134265", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru, musiqili teatr aktyoru)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 164.4, aptitudeState: 6, stateScore: 164.4, aptitudeRequired: true },
  { code: "134273", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru, musiqili teatr aktyoru)", stream: "Q", language: "AZ/RU", aptitude: 6, score: 100, aptitudeState: 9, stateScore: 116.5, aptitudeRequired: true },
  { code: "134281", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Dekorativ-tətbiqi sənət (bədii xalça, bədii toxuculuq)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 141.5, aptitudeState: 7, stateScore: 191, aptitudeRequired: true },
  { code: "134298", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Dizayn (geyim dizaynı, interyer dizaynı və qrafik dizayn)", stream: "Ə", language: "AZ/RU", score: 149.7, aptitudeRequired: true },
  { code: "134313", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "İnstrumental ifaçılıq (fortepiano, violin, viola, gitara, klarnet, saksofon, zərb alətləri)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 137.7, aptitudeRequired: true },
  { code: "134321", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qanun, nağara, balaban, saz)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 62.6, aptitudeRequired: true },
  { code: "134338", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Qrafika", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 125.8, aptitudeState: 7, stateScore: 132.8, aptitudeRequired: true },
  { code: "134346", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Musiqişünaslıq", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "134354", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Operator sənəti", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 86.9, aptitudeState: 6, stateScore: 86.9, aptitudeRequired: true },
  { code: "134362", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Operator sənəti", stream: "Q", language: "AZ/RU", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "134379", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Populyar musiqi və caz ifaçılığı (vokal)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "134387", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Rejissorluq (televiziya rejissoru, kino rejissoru, teatr rejissoru, animasiya rejissoru)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 132.5, aptitudeState: 7, stateScore: 132.5, aptitudeRequired: true },
  { code: "134395", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Rəngkarlıq", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 81.6, aptitudeState: 7, stateScore: 81.6, aptitudeRequired: true },
  { code: "134419", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Vokal sənəti (xanəndəlik)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 115.1, aptitudeRequired: true },
  // ═══ Azərbaycan Dövlət Rəssamlıq Akademiyası ═══
  { code: "135131", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Təsviri incəsənət müəllimliyi (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 178.5, stateScore: 178.5, aptitudeRequired: true },
  { code: "135148", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Dekorativ-tətbiqi sənət (bədii xalça, bədii toxuculuq, bədii keramika və şüşə, bədii metal, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 118.2, aptitudeState: 7, stateScore: 177.3, aptitudeRequired: true },
  { code: "135156", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Dizayn (interyer dizaynı, sənaye dizaynı, qrafik dizayn, geyim dizaynı, kukla rəssamı, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 144.6, stateScore: 215.4, aptitudeRequired: true },
  { code: "135164", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Heykəltəraşlıq (monumental heykəltəraşlıq, dəzgah heykəltəraşlığı, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 114.4, aptitudeState: 7, stateScore: 114.4, aptitudeRequired: true },
  { code: "135172", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Qrafika (dəzgah qrafikası, kitab tərtibatı və illüstrasiyası, plakat, animasiya üzrə quruluşçu rəssam, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 132.7, aptitudeState: 7, stateScore: 136.6, aptitudeRequired: true },
  { code: "135189", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Rəngkarlıq (monumental rəngkarlıq, dəzgah rəngkarlığı, teatr dekorasiyası rəngkarlığı, kino rəssamı, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 126.1, aptitudeState: 7, stateScore: 126.1, aptitudeRequired: true },
  // ═══ Bakı Xoreoqrafiya Akademiyası ═══
  { code: "136517", university: "Bakı Xoreoqrafiya Akademiyası", specialty: "Xoreoqrafiya sənəti (milli rəqs, modern rəqs, balet pedaqogikası, baletmeyster sənəti, rəqs müəllimliyi)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 69.5, aptitudeState: 7, stateScore: 123.1, aptitudeRequired: true },
  { code: "136525", university: "Bakı Xoreoqrafiya Akademiyası", specialty: "Xoreoqrafiya sənəti (milli rəqs, modern rəqs, balet pedaqogikası, baletmeyster sənəti, rəqs müəllimliyi)", stream: "Q", language: "AZ/RU", aptitude: 6, score: 50, aptitudeState: 9, stateScore: 60, aptitudeRequired: true },
  { code: "136533", university: "Bakı Xoreoqrafiya Akademiyası", specialty: "İnstrumental ifaçılıq (nağara, qarmon)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 78.7, aptitudeState: 9, stateScore: 78.7, aptitudeRequired: true },
  // ═══ Azərbaycan İdman Akademiyası ═══
  { code: "137157", university: "Azərbaycan İdman Akademiyası", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", language: "AZ/RU", score: 138.4, stateScore: 160.3, aptitudeRequired: true },
  { code: "137165", university: "Azərbaycan İdman Akademiyası", specialty: "Adaptiv bədən tərbiyəsi", stream: "Ə", language: "AZ/RU", score: 134.7, stateScore: 157, aptitudeRequired: true },
  { code: "137173", university: "Azərbaycan İdman Akademiyası", specialty: "Kütləvi-sağlamlaşdırıcı idman", stream: "Ə", language: "AZ/RU", score: 127.4, stateScore: 150.1, aptitudeRequired: true },
  { code: "137181", university: "Azərbaycan İdman Akademiyası", specialty: "Kütləvi-sağlamlaşdırıcı idman", stream: "Q", language: "AZ/RU", score: 125.9, stateScore: 150.9, aptitudeRequired: true },
  { code: "137198", university: "Azərbaycan İdman Akademiyası", specialty: "Ümumi fiziki hazırlıq", stream: "Ə", language: "AZ/RU", score: 121.8, stateScore: 151.3, aptitudeRequired: true },
  { code: "137213", university: "Azərbaycan İdman Akademiyası", specialty: "Ümumi fiziki hazırlıq", stream: "Q", language: "AZ/RU", score: 114.5, stateScore: 153.2, aptitudeRequired: true },
  { code: "137221", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (ağırlıqqaldırma)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 86.2, aptitudeState: 10, stateScore: 138.9, aptitudeRequired: true },
  { code: "137238", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (ağırlıqqaldırma)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 85.2, aptitudeRequired: true },
  { code: "137246", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (idman dırmanması)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 88.1, aptitudeRequired: true },
  { code: "137254", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atıcılıq)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 92.5, aptitudeRequired: true },
  { code: "137262", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atıcılıq)", stream: "Q", language: "AZ/RU", aptitude: 9, score: 104.1, aptitudeState: 10, stateScore: 175.9, aptitudeRequired: true },
  { code: "137279", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atletika)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 99.1, aptitudeState: 10, stateScore: 156.6, aptitudeRequired: true },
  { code: "137287", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atletika)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 80.7, aptitudeRequired: true },
  { code: "137295", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (badminton)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 104.3, aptitudeRequired: true },
  { code: "137319", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (kanoe və avarçəkmə)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137327", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (basketbol)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 107, aptitudeState: 10, stateScore: 141.1, aptitudeRequired: true },
  { code: "137335", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (basketbol)", stream: "Q", language: "AZ/RU", aptitude: 9, score: 144.5, aptitudeRequired: true },
  { code: "137343", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (boks)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 116.9, aptitudeRequired: true },
  { code: "137351", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (boks)", stream: "Q", language: "AZ/RU", aptitude: 9, score: 108, aptitudeRequired: true },
  { code: "137368", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (cüdo)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 115.5, aptitudeState: 10, stateScore: 139.3, aptitudeRequired: true },
  { code: "137376", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (cüdo)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 111.8, aptitudeState: 10, stateScore: 140.9, aptitudeRequired: true },
  { code: "137384", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (futbol)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 102.7, aptitudeState: 10, stateScore: 142, aptitudeRequired: true },
  { code: "137392", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (gimnastika)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 146.2, aptitudeState: 10, stateScore: 146.2, aptitudeRequired: true },
  { code: "137416", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (gimnastika)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 82.8, aptitudeRequired: true },
  { code: "137424", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sərbəst güləş)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 111.5, aptitudeState: 10, stateScore: 138.6, aptitudeRequired: true },
  { code: "137432", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sərbəst güləş)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 110.5, aptitudeRequired: true },
  { code: "137449", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (yunan-Roma güləşi)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 111.4, aptitudeState: 10, stateScore: 182.3, aptitudeRequired: true },
  { code: "137457", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (yunan-Roma güləşi)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 104.9, aptitudeRequired: true },
  { code: "137465", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (həndbol)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 110.9, aptitudeRequired: true },
  { code: "137473", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (həndbol)", stream: "Q", language: "AZ/RU", aptitude: 9, score: 101.6, aptitudeRequired: true },
  { code: "137481", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (kamandan oxatma)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 95.3, aptitudeState: 10, stateScore: 149.2, aptitudeRequired: true },
  { code: "137498", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (karate)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 100.5, aptitudeState: 10, stateScore: 144.9, aptitudeRequired: true },
  { code: "137513", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (karate)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 94.3, aptitudeRequired: true },
  { code: "137521", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (qılıncoynatma)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137538", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (qış idman növləri)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 80.8, aptitudeRequired: true },
  { code: "137546", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (şahmat)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 106.8, aptitudeState: 10, stateScore: 164.5, aptitudeRequired: true },
  { code: "137554", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sambo)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 122.5, aptitudeRequired: true },
  { code: "137562", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (stolüstü tennis)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 79.5, aptitudeState: 10, stateScore: 140.2, aptitudeRequired: true },
  { code: "137579", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (stolüstü tennis)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 79.1, aptitudeRequired: true },
  { code: "137587", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (taekvando)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 79.2, aptitudeState: 10, stateScore: 138.9, aptitudeRequired: true },
  { code: "137595", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (taekvando)", stream: "Q", language: "AZ/RU", aptitude: 9, score: 74.3, aptitudeState: 10, stateScore: 145.1, aptitudeRequired: true },
  { code: "137619", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (tennis)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 105.9, aptitudeRequired: true },
  { code: "137627", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (triatlon)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeState: 10, stateScore: 152.7, aptitudeRequired: true },
  { code: "137635", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (üzgüçülük)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 122, aptitudeRequired: true },
  { code: "137643", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (üzgüçülük)", stream: "Q", language: "AZ/RU", aptitude: 8, score: 87, aptitudeRequired: true },
  { code: "137651", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (velosiped)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 101.8, aptitudeRequired: true },
  { code: "137668", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (velosiped)", stream: "Q", language: "AZ/RU", aptitude: 10, score: 97.2, aptitudeRequired: true },
  { code: "137676", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (voleybol)", stream: "Ə", language: "AZ/RU", aptitude: 10, score: 80.5, aptitudeState: 10, stateScore: 140, aptitudeRequired: true },
  { code: "137684", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (ağırlıqqaldırma, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137692", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atıcılıq, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137716", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atletika, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 126.9, aptitudeRequired: true },
  { code: "137724", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (badminton, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137732", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (kanoe və avarçəkmə, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137749", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (basketbol, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 156.5, aptitudeState: 10, stateScore: 154.7, aptitudeRequired: true },
  { code: "137757", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (boks, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137765", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (cüdo, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeState: 10, stateScore: 162.9, aptitudeRequired: true },
  { code: "137773", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (futbol, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137781", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sərbəst güləş, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137798", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (yunan-Roma güləşi, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137813", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (həndbol, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137821", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (qılıncoynatma, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137838", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (qış idman növləri, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137846", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (stolüstü tennis, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137854", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (taekvando, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137862", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (tennis, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  { code: "137879", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (velosiped, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 70, aptitudeRequired: true },
  // ═══ Naxçıvan Dövlət Universiteti ═══
  { code: "143118", university: "Naxçıvan Dövlət Universiteti", specialty: "Dizayn (interyer dizaynı)", stream: "Ə", language: "AZ", score: 148.5 },
  { code: "143126", university: "Naxçıvan Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", language: "AZ", score: 131, stateScore: 161.5, aptitudeRequired: true },
  { code: "143134", university: "Naxçıvan Dövlət Universiteti", specialty: "Musiqi müəllimliyi (fortepiano, tar, kamança, qarmon, nağara, saz, zurna)", stream: "Ə", language: "AZ", score: 60, stateScore: 98.7, aptitudeRequired: true },
  { code: "143142", university: "Naxçıvan Dövlət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", language: "AZ", score: 123.3, stateScore: 170.7, aptitudeRequired: true },
  { code: "143159", university: "Naxçıvan Dövlət Universiteti", specialty: "Aktyor sənəti (teatr və kino aktyorluğu, musiqili teatr aktyorluğu)", stream: "Ə", language: "AZ", aptitude: 6, score: 100, aptitudeState: 6, stateScore: 101.4, aptitudeRequired: true },
  { code: "143167", university: "Naxçıvan Dövlət Universiteti", specialty: "Bəstəkarlıq", stream: "Ə", language: "AZ", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "143175", university: "Naxçıvan Dövlət Universiteti", specialty: "Dirijorluq (xor dirijorluğu, nəfəs alətləri orkestrinin dirijorluğu)", stream: "Ə", language: "AZ", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "143183", university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qarmon, balaban, qanun, nağara, saz)", stream: "Ə", language: "AZ", aptitude: 8, score: 78.7, aptitudeState: 8, stateScore: 78.7, aptitudeRequired: true },
  { code: "143191", university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qarmon, balaban, qanun, nağara, saz)", stream: "Q", language: "AZ", aptitude: 8, score: 109.5, aptitudeState: 8, stateScore: 109.5, aptitudeRequired: true },
  { code: "143215", university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (fortepiano)", stream: "Ə", language: "AZ", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 149.1, aptitudeRequired: true },
  { code: "143223", university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (violin, viola, violonçel, kontrabas)", stream: "Ə", language: "AZ", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 150.2, aptitudeRequired: true },
  { code: "143231", university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (fleyta, klarnet, saksofon, truba, trombon, qoboy, valtorna, faqot, tuba, zərb alətləri)", stream: "Ə", language: "AZ", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "143248", university: "Naxçıvan Dövlət Universiteti", specialty: "Musiqişünaslıq", stream: "Ə", language: "AZ", aptitude: 6, score: 60, aptitudeRequired: true },
  { code: "143256", university: "Naxçıvan Dövlət Universiteti", specialty: "Musiqişünaslıq", stream: "Q", language: "AZ", aptitude: 6, score: 60, aptitudeState: 6, stateScore: 127, aptitudeRequired: true },
  { code: "143264", university: "Naxçıvan Dövlət Universiteti", specialty: "Rəngkarlıq", stream: "Ə", language: "AZ", aptitude: 7, score: 66.8, aptitudeState: 7, stateScore: 66.8, aptitudeRequired: true },
  { code: "143272", university: "Naxçıvan Dövlət Universiteti", specialty: "Vokal sənəti (xanəndəlik, milli vokal)", stream: "Ə", language: "AZ", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 60.8, aptitudeRequired: true },
  { code: "143289", university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Ə", language: "AZ", aptitude: 8, score: 102.8, aptitudeRequired: true },
  { code: "143297", university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Q", language: "AZ", aptitude: 8, score: 73.3, aptitudeRequired: true },
  { code: "143312", university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (voleybol)", stream: "Ə", language: "AZ", aptitude: 8, score: 122.5, aptitudeRequired: true },
  { code: "143329", university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (voleybol)", stream: "Q", language: "AZ", aptitude: 8, score: 105.3, aptitudeRequired: true },
  { code: "143337", university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (futbol)", stream: "Ə", language: "AZ", aptitude: 9, score: 111.3, aptitudeRequired: true },
  { code: "143345", university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (futbol)", stream: "Q", language: "AZ", aptitude: 9, score: 98.9, aptitudeRequired: true },
  // ═══ Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri) ═══
  { code: "144763", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Dizayn (interyer dizayn, qrafik dizayn, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 170.3, stateScore: 229.8 },
  // ═══ Gəncə Dövlət Universiteti ═══
  { code: "145646", university: "Gəncə Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", language: "AZ", score: 134.8, stateScore: 163, aptitudeRequired: true },
  { code: "145654", university: "Gəncə Dövlət Universiteti", specialty: "Musiqi müəllimliyi (fortepiano, qarmon, tar, saz, kamança, violin, viola, klarnet, balaban, nağara, zərb alətləri, vokal, xanəndəlik, nəzəriyyə)", stream: "Ə", language: "AZ", score: 74.9, stateScore: 97.6, aptitudeRequired: true },
  { code: "145662", university: "Gəncə Dövlət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", language: "AZ", score: 127.2, stateScore: 160.3, aptitudeRequired: true },
  { code: "145679", university: "Gəncə Dövlət Universiteti", specialty: "Ümumi fiziki hazırlıq", stream: "Ə", language: "AZ", score: 118.9, stateScore: 156.6, aptitudeRequired: true },
  { code: "145687", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (futbol)", stream: "Ə", language: "AZ", aptitude: 9, score: 127.6, aptitudeRequired: true },
  { code: "145695", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Ə", language: "AZ", aptitude: 8, score: 114.3, aptitudeRequired: true },
  { code: "145719", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Q", language: "AZ", aptitude: 8, score: 97.2, aptitudeRequired: true },
  { code: "145727", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (boks)", stream: "Ə", language: "AZ", aptitude: 9, score: 86.7, aptitudeRequired: true },
  { code: "145735", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş)", stream: "Ə", language: "AZ", aptitude: 10, score: 84.1, aptitudeRequired: true },
  { code: "145743", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş)", stream: "Q", language: "AZ", aptitude: 9, score: 77.4, aptitudeRequired: true },
  { code: "145751", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (yunan-Roma güləşi)", stream: "Ə", language: "AZ", aptitude: 10, score: 100.1, aptitudeRequired: true },
  { code: "145768", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (basketbol)", stream: "Ə", language: "AZ", aptitude: 7, score: 91, aptitudeRequired: true },
  { code: "145776", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (voleybol)", stream: "Ə", language: "AZ", aptitude: 9, score: 92.7, aptitudeRequired: true },
  // ═══ Azərbaycan Texnologiya Universiteti (Gəncə şəhəri) ═══
  { code: "147469", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Dizayn (geyim dizaynı, sənaye dizaynı)", stream: "Ə", language: "AZ", score: 141.7 },
  // ═══ Sumqayıt Dövlət Universiteti ═══
  { code: "148757", university: "Sumqayıt Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", language: "AZ", score: 134.2, stateScore: 168.2, aptitudeRequired: true },
  // ═══ Lənkəran Dövlət Universiteti ═══
  { code: "151656", university: "Lənkəran Dövlət Universiteti", specialty: "Musiqi müəllimliyi (fortepiano, qarmon, tar, saz, kamança, qanun, violin, gitara, klarnet, balaban, nağara, vokal)", stream: "Ə", language: "AZ", score: 60, stateScore: 127.6, aptitudeRequired: true },
  { code: "151664", university: "Lənkəran Dövlət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", language: "AZ", score: 126.9, aptitudeRequired: true },
  { code: "151672", university: "Lənkəran Dövlət Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn, sənaye dizaynı)", stream: "Ə", language: "AZ", score: 139.3 },
  // ═══ Qarabağ Universiteti ═══
  { code: "152522", university: "Qarabağ Universiteti", specialty: "Musiqi müəllimliyi (fortepiano)", stream: "Ə", language: "AZ", stateScore: 132.2, aptitudeRequired: true },
  { code: "152539", university: "Qarabağ Universiteti", specialty: "Musiqi müəllimliyi (fleyta, qoboy, klarnet, faqot, valtorna, truba, trombon, zərb alətləri, violin, viola, violonçel, kontrabas, tar, kamança, saz, nağara, qanun, balaban, qarmon)", stream: "Ə", language: "AZ", stateScore: 87.5, aptitudeRequired: true },
  { code: "152555", university: "Qarabağ Universiteti", specialty: "Dekorativ-tətbiqi sənət (bədii toxuculuq, keramika, şüşə)", stream: "Ə", language: "AZ/RU", aptitudeState: 7, stateScore: 124.5, aptitudeRequired: true },
  { code: "152571", university: "Qarabağ Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn, geyim dizaynı)", stream: "Ə", language: "AZ/RU", stateScore: 155.9, aptitudeRequired: true },
  { code: "152588", university: "Qarabağ Universiteti", specialty: "İnstrumental ifaçılıq (fleyta, qoboy, klarnet, faqot, valtorna, truba, trombon, zərb alətləri, violin, viola, violonçel, kontrabas, orqan, gitara)", stream: "Ə", language: "AZ/RU", aptitudeState: 6, stateScore: 112.8, aptitudeRequired: true },
  { code: "152596", university: "Qarabağ Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, saz, nağara, qanun, balaban)", stream: "Ə", language: "AZ/RU", aptitudeState: 7, stateScore: 93.1, aptitudeRequired: true },
  { code: "152611", university: "Qarabağ Universiteti", specialty: "İnstrumental ifaçılıq (fortepiano)", stream: "Ə", language: "AZ/RU", aptitudeState: 6, stateScore: 105.6, aptitudeRequired: true },
  { code: "152636", university: "Qarabağ Universiteti", specialty: "Rəngkarlıq", stream: "Ə", language: "AZ/RU", aptitudeState: 6, stateScore: 60.2, aptitudeRequired: true },
  { code: "152644", university: "Qarabağ Universiteti", specialty: "Vokal sənəti (xanəndəlik)", stream: "Ə", language: "AZ/RU", aptitudeState: 6, stateScore: 93.9, aptitudeRequired: true },
  // ═══ Qərbi Kaspi Universiteti ═══
  { code: "157659", university: "Qərbi Kaspi Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn və sənaye dizaynı)", stream: "Ə", language: "AZ", score: 155.8 },
  { code: "157667", university: "Qərbi Kaspi Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn və sənaye dizaynı, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 194.6 },
  // ═══ Xəzər Universiteti ═══
  { code: "158566", university: "Xəzər Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn və landşaft dizaynı)", stream: "Ə", language: "AZ/RU", score: 188.8 },
  { code: "158574", university: "Xəzər Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn və landşaft dizaynı, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 195.9, stateScore: 228.8 },
  { code: "158582", university: "Xəzər Universiteti", specialty: "Təsviri incəsənət müəllimliyi (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 165.3, stateScore: 165.3, aptitudeRequired: true },
  // ═══ "Odlar Yurdu" Universiteti ═══
  { code: "164535", university: "\"Odlar Yurdu\" Universiteti", specialty: "Dizayn (interyer dizayn; qrafik dizayn; modelyer dizayn)", stream: "Ə", language: "AZ/RU", score: 133.6, aptitudeRequired: true },
  { code: "164543", university: "\"Odlar Yurdu\" Universiteti", specialty: "Dizayn (interyer dizayn; qrafik dizayn; modelyer dizayn, tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 135.1, aptitudeRequired: true },
  // ═══ Azərbaycan Memarlıq və İnşaat Universiteti ═══
  { code: "118649", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Dizayn (interyer dizayn, qrafik dizayn)", stream: "Ə", language: "RU", score: 177.4, stateScore: 213, aptitudeRequired: true },
  // ═══ Azərbaycan Dövlət Pedaqoji Universiteti ═══
  { code: "122366", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", language: "RU", score: 122.2, stateScore: 161.5, aptitudeRequired: true },
  { code: "122399", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", language: "RU", score: 157.9, stateScore: 159, aptitudeRequired: true },
  // ═══ Azərbaycan Dövlət İqtisad Universiteti ═══
  { code: "123857", university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Dizayn (geyim dizaynı, interyer dizaynı, eksteryer dizaynı, sənaye dizaynı, qrafik dizayn)", stream: "Ə", language: "RU", score: 219.9, stateScore: 219.9 },
  // ═══ Azərbaycan Texnologiya Universiteti (Gəncə şəhəri) ═══
  { code: "147477", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Dizayn (geyim dizaynı, sənaye dizaynı)", stream: "Ə", language: "RU", score: 174.9 },
];
