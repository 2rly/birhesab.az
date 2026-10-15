// V ixtisas qrupu üzrə keçid balları — 2026/2027 qəbulu.
// Mənbə: DİM rəsmi keçid balı siyahısı (ödənişli / dövlət sifarişli).
// Bu fayl scripts/build-group5-scores-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.
// Subbakalavr pilləsi — 9 ali məktəb, 26 ixtisas (0-100 şkalası).

import type { AdmissionEntry } from "./admissions-group5-2026";

export const admissionsGroup5Sub: AdmissionEntry[] = [
  // ═══ Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası ═══
  { code: "132142", university: "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", specialty: "İnstrumental ifaçılıq (fortepiano, orqan, klavesin, violin, viola, violonçel, kontrabas, arfa, fleyta, qoboy, klarnet, saksofon, faqot, valtorna, truba, trombon, tuba, zərb alətləri)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 76.6, aptitudeState: 8, stateScore: 76.6, tag: "subbakalavr" },
  // ═══ Azərbaycan Milli Konservatoriyası ═══
  { code: "133155", university: "Azərbaycan Milli Konservatoriyası", specialty: "İnstrumental ifaçılıq (tar, kamança, qanun, balaban, saz, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 51, aptitudeState: 8, stateScore: 69.8, tag: "subbakalavr" },
  { code: "133188", university: "Azərbaycan Milli Konservatoriyası", specialty: "Vokal sənəti (xanəndəlik, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 65.1, aptitudeState: 7, stateScore: 65.1, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti ═══
  { code: "134265", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru, musiqili teatr aktyoru)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 75.1, aptitudeState: 7, stateScore: 75.1, tag: "subbakalavr" },
  { code: "134273", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru, musiqili teatr aktyoru)", stream: "Q", language: "AZ/RU", aptitude: 6, score: 51, aptitudeState: 8, stateScore: 73.8, tag: "subbakalavr" },
  { code: "134313", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "İnstrumental ifaçılıq (fortepiano, violin, viola, gitara, klarnet, saksofon, zərb alətləri)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 51, tag: "subbakalavr" },
  { code: "134321", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qanun, nağara, balaban, saz)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 51, aptitudeState: 8, stateScore: 64.2, tag: "subbakalavr" },
  { code: "134379", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Populyar musiqi və caz ifaçılığı (vokal)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 51, aptitudeState: 8, stateScore: 79.1, tag: "subbakalavr" },
  { code: "134387", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Rejissorluq (televiziya rejissoru, kino rejissoru, teatr rejissoru, animasiya rejissoru)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 83.5, aptitudeState: 9, stateScore: 83.5, tag: "subbakalavr" },
  { code: "134395", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Rəngkarlıq", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 65.6, aptitudeState: 7, stateScore: 86.2, tag: "subbakalavr" },
  { code: "134419", university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Vokal sənəti (xanəndəlik)", stream: "Ə", language: "AZ/RU", aptitude: 6, score: 51, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Rəssamlıq Akademiyası ═══
  { code: "135148", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Dekorativ-tətbiqi sənət (bədii xalça, bədii toxuculuq, bədii keramika və şüşə, bədii metal, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 70.1, aptitudeState: 8, stateScore: 74.2, tag: "subbakalavr" },
  { code: "135164", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Heykəltəraşlıq (monumental heykəltəraşlıq, dəzgah heykəltəraşlığı, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 80.4, aptitudeState: 8, stateScore: 80.4, tag: "subbakalavr" },
  { code: "135172", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Qrafika (dəzgah qrafikası, kitab tərtibatı və illüstrasiyası, plakat, animasiya üzrə quruluşçu rəssam, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 73, aptitudeState: 8, stateScore: 73, tag: "subbakalavr" },
  { code: "135189", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Rəngkarlıq (monumental rəngkarlıq, dəzgah rəngkarlığı, teatr dekorasiyası rəngkarlığı, kino rəssamı, tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", aptitude: 8, score: 76.7, aptitudeState: 8, stateScore: 76.7, tag: "subbakalavr" },
  // ═══ Bakı Xoreoqrafiya Akademiyası ═══
  { code: "136517", university: "Bakı Xoreoqrafiya Akademiyası", specialty: "Xoreoqrafiya sənəti (milli rəqs, modern rəqs, balet pedaqogikası, baletmeyster sənəti, rəqs müəllimliyi)", stream: "Ə", language: "AZ/RU", aptitude: 7, score: 63.7, aptitudeState: 8, stateScore: 61, tag: "subbakalavr" },
  // ═══ Azərbaycan İdman Akademiyası ═══
  { code: "137246", university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (idman dırmanması)", stream: "Ə", language: "AZ/RU", aptitude: 9, score: 85.7, tag: "subbakalavr" },
  // ═══ Naxçıvan Dövlət Universiteti ═══
  { code: "143134", university: "Naxçıvan Dövlət Universiteti", specialty: "Musiqi müəllimliyi (fortepiano, tar, kamança, qarmon, nağara, saz, zurna)", stream: "Ə", language: "AZ", score: 77.2, tag: "subbakalavr" },
  { code: "143159", university: "Naxçıvan Dövlət Universiteti", specialty: "Aktyor sənəti (teatr və kino aktyorluğu, musiqili teatr aktyorluğu)", stream: "Ə", language: "AZ", aptitude: 6, score: 51, aptitudeState: 8, stateScore: 90.1, tag: "subbakalavr" },
  { code: "143191", university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qarmon, balaban, qanun, nağara, saz)", stream: "Q", language: "AZ", aptitude: 9, score: 78, aptitudeState: 9, stateScore: 78, tag: "subbakalavr" },
  { code: "143231", university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (fleyta, klarnet, saksofon, truba, trombon, qoboy, valtorna, faqot, tuba, zərb alətləri)", stream: "Ə", language: "AZ", aptitude: 6, score: 51, tag: "subbakalavr" },
  { code: "143272", university: "Naxçıvan Dövlət Universiteti", specialty: "Vokal sənəti (xanəndəlik, milli vokal)", stream: "Ə", language: "AZ", aptitude: 6, score: 51, aptitudeState: 7, stateScore: 84.1, tag: "subbakalavr" },
  { code: "143329", university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (voleybol)", stream: "Q", language: "AZ", aptitude: 9, score: 91.1, tag: "subbakalavr" },
  // ═══ Gəncə Dövlət Universiteti ═══
  { code: "145743", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş)", stream: "Q", language: "AZ", aptitude: 10, score: 79.4, tag: "subbakalavr" },
  { code: "145776", university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (voleybol)", stream: "Ə", language: "AZ", aptitude: 9, score: 91.9, tag: "subbakalavr" },
  // ═══ Lənkəran Dövlət Universiteti ═══
  { code: "151656", university: "Lənkəran Dövlət Universiteti", specialty: "Musiqi müəllimliyi (fortepiano, qarmon, tar, saz, kamança, qanun, violin, gitara, klarnet, balaban, nağara, vokal)", stream: "Ə", language: "AZ", score: 76.8, tag: "subbakalavr" },
];
