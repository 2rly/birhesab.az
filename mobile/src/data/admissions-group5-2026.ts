// 5-ci qrup keçid balları 2026
// Mənbə: qebulol.az/5-ci-qrup-kecid-ballari-2026
// Format: X/Y — X qabiliyyət imtahanı minimum balı, Y keçid balı.
// Mötərizədəki (Xs/Ys) dövlət sifarişli variantdır. "(-)" — dövlət sifarişli yoxdur.
// Stream: Ə=Əyani, Q=Qiyabi.

export interface AdmissionEntry {
  code?: string;
  university: string;
  specialty: string;
  stream?: string;
  /** Qabiliyyət imtahanı minimum balı (X/Y → X). */
  aptitude?: number;
  /** Dövlət sifarişli qabiliyyət imtahanı minimum balı. */
  aptitudeState?: number;
  score: number;
  /** Dövlət sifarişli keçid balı (mötərizədəki ədəd). */
  stateScore?: number;
  /** Altqrup süzgəci üçün etiket (məs. "subbakalavr") */
  tag?: string;
}

export const admissionsGroup5: AdmissionEntry[] = [
  // ═══ Bakı Dövlət Universiteti ═══
  { university: "Bakı Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi (Qazax filialı)", stream: "Ə", score: 129.7 },

  // ═══ Azərbaycan Memarlıq və İnşaat Universiteti ═══
  { university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Dizayn (interyer dizayn, qrafik dizayn)", stream: "Ə", aptitude: 6, score: 155.1, aptitudeState: 8, stateScore: 95.8 },
  { university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Dizayn (interyer dizayn, qrafik dizayn) — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 87.3, aptitudeState: 8, stateScore: 91.9 },
  { university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Dizayn (interyer dizayn, qrafik dizayn, tədris ingilis dilində)", stream: "Ə", aptitude: 7, score: 235, aptitudeState: 8, stateScore: 131 },

  // ═══ Azərbaycan Dövlət Pedaqoji Universiteti ═══
  { university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", score: 140.5, stateScore: 177.2 },
  { university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Musiqi müəllimliyi", stream: "Ə", score: 101.4, stateScore: 108.4 },
  { university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 156.3, stateScore: 166.5 },

  // ═══ Azərbaycan Dövlət İqtisad Universiteti ═══
  { university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Dizayn (geyim dizaynı, mühit dizaynı)", stream: "Ə", score: 215.3, stateScore: 239.9 },

  // ═══ Bakı Mühəndislik Universiteti ═══
  { university: "Bakı Mühəndislik Universiteti", specialty: "Dekorativ-tətbiqi sənət", stream: "Ə", score: 201.8, stateScore: 228.6 },
  { university: "Bakı Mühəndislik Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn, sənaye dizaynı, geyim dizaynı)", stream: "Ə", score: 192.9, stateScore: 241.1 },
  { university: "Bakı Mühəndislik Universiteti", specialty: "Dizayn (tədris ingilis dilində)", stream: "Ə", score: 225.6, stateScore: 241.1 },

  // ═══ ADA Universiteti ═══
  { university: "ADA Universiteti", specialty: "Dizayn (interyer dizaynı, tədris ingilis dilində)", stream: "Ə", score: 237.1 },
  { university: "ADA Universiteti", specialty: "Dizayn (kommunikasiya dizaynı, tədris ingilis dilində)", stream: "Ə", score: 187.1 },

  // ═══ Bakı Musiqi Akademiyası ═══
  { university: "Bakı Musiqi Akademiyası", specialty: "Musiqi müəllimliyi", stream: "Ə", score: 123.1, stateScore: 123.1 },
  { university: "Bakı Musiqi Akademiyası", specialty: "Bəstəkarlıq", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 70.3 },
  { university: "Bakı Musiqi Akademiyası", specialty: "Dirijorluq (xor dirijoru)", stream: "Ə", aptitude: 7, score: 61.4, aptitudeState: 7, stateScore: 61.4 },
  { university: "Bakı Musiqi Akademiyası", specialty: "İnstrumental ifaçılıq (fortepiano, orqan, klavesin, violin, viola, violonçel, kontrabas, arfa, fleyta, qoboy, klarnet, saksofon, faqot, valtoma, truba, trombon, tuba, zərb alətləri)", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 9, stateScore: 62 },
  { university: "Bakı Musiqi Akademiyası", specialty: "İnstrumental ifaçılıq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 6, score: 51 },
  { university: "Bakı Musiqi Akademiyası", specialty: "Musiqişünaslıq", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 101.6 },
  { university: "Bakı Musiqi Akademiyası", specialty: "Populyar musiqi və caz ifaçılığı (vokal, fortepiano, truba, saksofon)", stream: "Ə", aptitude: 9, score: 149.3, aptitudeState: 9, stateScore: 149.3 },
  { university: "Bakı Musiqi Akademiyası", specialty: "Vokal sənəti (akademik vokal)", stream: "Ə", aptitude: 7, score: 150, aptitudeState: 7, stateScore: 150 },

  // ═══ Azərbaycan Milli Konservatoriyası ═══
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Musiqi müəllimliyi", stream: "Ə", score: 120.3, stateScore: 120.3 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Bəstəkarlıq", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 186.3 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Dirijorluq (xalq çalğı alətləri orkestrinin dirijorluğu)", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Dirijorluq (xor dirijorluğu)", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Dirijorluq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 6, score: 51, aptitudeState: 7, stateScore: 82.8 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "İnstrumental ifaçılıq (tar, kamança, qanun, balaban, saz, qarmon, nağara, klarnet)", stream: "Ə", aptitude: 8, score: 60, aptitudeState: 9, stateScore: 64.2 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "İnstrumental ifaçılıq (milli alətlər) — Subbakalavrlar üzrə", stream: "Ə", aptitude: 8, score: 70.6, aptitudeState: 9, stateScore: 84.3 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Musiqişünaslıq", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 133.9 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Populyar musiqi və caz ifaçılığı (vokal, alətlər üzrə: fortepiano, violin, akkordeon, klarnet, saksofon, fleyta, qoboy, truba, gitara, tar, kamança, balaban, qanun, zərb alətləri)", stream: "Ə", aptitude: 7, score: 88.7, aptitudeState: 8, stateScore: 150.9 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Vokal sənəti (xanəndəlik)", stream: "Ə", aptitude: 8, score: 60, aptitudeState: 8, stateScore: 68.7 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Vokal sənəti (xanəndəlik) — Subbakalavrlar üzrə", stream: "Ə", aptitude: 8, score: 69.4, aptitudeState: 8, stateScore: 69.4 },
  { university: "Azərbaycan Milli Konservatoriyası", specialty: "Vokal sənəti (milli vokal)", stream: "Ə", aptitude: 7, score: 114.8, aptitudeState: 7, stateScore: 169.5 },

  // ═══ Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti ═══
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Musiqi müəllimliyi", stream: "Ə", score: 117, stateScore: 117 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 178.7, stateScore: 178.7 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru, musiqili teatr aktyoru)", stream: "Ə", aptitude: 7, score: 74, aptitudeState: 7, stateScore: 74 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru) — Subbakalavrlar üzrə", stream: "Ə", aptitude: 8, score: 76.4, aptitudeState: 8, stateScore: 76.4 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru, musiqili teatr aktyoru)", stream: "Q", aptitude: 7, score: 63.5, aptitudeState: 7, stateScore: 63.5 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Aktyor sənəti (dram teatrı və kino aktyoru) — ikinci variant", stream: "Ə", aptitude: 8, score: 112, aptitudeState: 8, stateScore: 112 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Dekorativ-tətbiqi sənət (bədii xalça, bədii toxuculuq)", stream: "Ə", aptitude: 7, score: 122.6, aptitudeState: 7, stateScore: 158.2 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn və geyim dizaynı)", stream: "Ə", aptitude: 6, score: 138.7, aptitudeState: 8, stateScore: 107.8 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Dizayn — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 83.5 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "İnstrumental ifaçılıq (fortepiano, violin, viola, gitara, klarnet, saksafon, zərb alətləri)", stream: "Ə", aptitude: 8, score: 154.3, aptitudeState: 9, stateScore: 71.6 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qanun, nağara, balaban, saz)", stream: "Ə", aptitude: 8, score: 81, aptitudeState: 9, stateScore: 60.1 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "İnstrumental ifaçılıq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 9, score: 71.3, aptitudeState: 9, stateScore: 81.3 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Qrafika", stream: "Ə", aptitude: 7, score: 83.7, aptitudeState: 7, stateScore: 83.7 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Musiqişünaslıq", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Operator sənəti", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 6, stateScore: 68 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Operator sənəti — Subbakalavrlar üzrə", stream: "Ə", aptitude: 6, score: 51 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Operator sənəti", stream: "Q", aptitude: 6, score: 60, aptitudeState: 7, stateScore: 140.7 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Populyar musiqi və caz ifaçılığı (vokal)", stream: "Ə", aptitude: 6, score: 91, aptitudeState: 9, stateScore: 142.1 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Populyar musiqi və caz ifaçılığı — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 81.2 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Rejissorluq (televiziya rejissoru, kino rejissoru, teatr rejissoru, animasiya rejissoru)", stream: "Ə", aptitude: 6, score: 120, aptitudeState: 6, stateScore: 145.3 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Rəngkarlıq", stream: "Ə", aptitude: 6, score: 103, aptitudeState: 6, stateScore: 103 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Vokal sənəti (xanəndə)", stream: "Ə", aptitude: 7, score: 60, aptitudeState: 7, stateScore: 148 },
  { university: "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", specialty: "Vokal sənəti (xanəndə) — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 71.6, aptitudeState: 8, stateScore: 62.7 },

  // ═══ Azərbaycan Dövlət Rəssamlıq Akademiyası ═══
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 185.1, stateScore: 185.1 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Dekorativ-tətbiqi sənət (bədii xalça, bədii toxuculuq, bədii keramika və şüşə, bədii metal)", stream: "Ə", aptitude: 7, score: 116.4, aptitudeState: 7, stateScore: 155.4 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Dekorativ-tətbiqi sənət — Subbakalavrlar üzrə", stream: "Ə", aptitude: 8, score: 69, aptitudeState: 8, stateScore: 69 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Dizayn (interyer dizaynı, sənaye dizaynı, qrafik dizayn, geyim dizaynı, kukla rəssamı)", stream: "Ə", aptitude: 6, score: 139.2, aptitudeState: 8, stateScore: 73.9 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Heykəltəraşlıq (monumental heykəltəraşlıq, dəzgah heykəltəraşlığı)", stream: "Ə", aptitude: 7, score: 60, aptitudeState: 7, stateScore: 82.9 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Heykəltəraşlıq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 81.2, aptitudeState: 8, stateScore: 81.9 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Qrafika (dəzgah qrafikası, kitab tərtibatı və illüstrasiyası, plakat, animasiya üzrə quruluşçu rəssam)", stream: "Ə", aptitude: 7, score: 113.5, aptitudeState: 7, stateScore: 113.5 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Qrafika — Subbakalavrlar üzrə", stream: "Ə", aptitude: 8, score: 78.9, aptitudeState: 8, stateScore: 78.9 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Rəngkarlıq (monumental rəngkarlıq, dəzgah rəngkarlığı, teatr dekorasiyası rəngkarlığı, kino rəssamı)", stream: "Ə", aptitude: 7, score: 60, aptitudeState: 7, stateScore: 72.2 },
  { university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Rəngkarlıq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 74, aptitudeState: 7, stateScore: 74 },

  // ═══ Bakı Xoreoqrafiya Akademiyası ═══
  { university: "Bakı Xoreoqrafiya Akademiyası", specialty: "Xoreoqrafiya sənəti (milli rəqs, modern rəqs, balet pedaqogikası, baletmeyster sənəti, rəqs müəllimliyi)", stream: "Ə", aptitude: 6, score: 48.5, aptitudeState: 8, stateScore: 53.1 },
  { university: "Bakı Xoreoqrafiya Akademiyası", specialty: "Xoreoqrafiya sənəti — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 58.5, aptitudeState: 9, stateScore: 81.3 },
  { university: "Bakı Xoreoqrafiya Akademiyası", specialty: "Xoreoqrafiya sənəti (milli rəqs, modern rəqs, balet pedaqogikası, baletmeyster sənəti, rəqs müəllimliyi)", stream: "Q", aptitude: 7, score: 48.4, aptitudeState: 8, stateScore: 93.3 },
  { university: "Bakı Xoreoqrafiya Akademiyası", specialty: "Xoreoqrafiya sənəti — Subbakalavrlar üzrə", stream: "Q", aptitude: 8, score: 78.3 },
  { university: "Bakı Xoreoqrafiya Akademiyası", specialty: "İnstrumental ifaçılıq (nağara, qarmon)", stream: "Ə", aptitude: 7, score: 60 },
  { university: "Bakı Xoreoqrafiya Akademiyası", specialty: "İnstrumental ifaçılıq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 93.1 },

  // ═══ Azərbaycan İdman Akademiyası ═══
  { university: "Azərbaycan İdman Akademiyası", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", score: 145.5, stateScore: 171.6 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Adaptiv bədən tərbiyəsi", stream: "Ə", score: 139.5, stateScore: 162.1 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Kütləvi-sağlamlaşdırıcı idman", stream: "Ə", score: 135.7, stateScore: 155.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Ümumi fiziki hazırlıq", stream: "Ə", score: 130.9, stateScore: 155.5 },
  // Tədris ingilis dilində
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atletika, tədris ingilis dilində)", stream: "Ə", aptitude: 8, score: 120.7 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (kanoe və avarçəkmə, tədris ingilis dilində)", stream: "Ə", aptitude: 10, score: 114.8, aptitudeState: 10, stateScore: 148.8 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (basketbol, tədris ingilis dilində)", stream: "Ə", aptitude: 9, score: 97.3 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (cüdo, tədris ingilis dilində)", stream: "Ə", aptitude: 9, score: 153.6, aptitudeState: 10, stateScore: 143.8 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (gimnastika, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 70, aptitudeState: 10, stateScore: 145.3 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (yunan-Roma güləşi, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 70 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (həndbol, tədris ingilis dilində)", stream: "Ə", aptitude: 9, score: 103.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (taekvando, tədris ingilis dilində)", stream: "Ə", aptitude: 9, score: 128.6 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (voleybol, tədris ingilis dilində)", stream: "Ə", aptitude: 8, score: 127 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (ağırlıqqaldırma, tədris ingilis dilində)", stream: "Ə", aptitude: 9, score: 110.9 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atıcılıq, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 70 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (badminton, tədris ingilis dilində)", stream: "Ə", aptitude: 8, score: 141.9 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (boks, tədris ingilis dilində)", stream: "Ə", aptitude: 10, score: 152.7, aptitudeState: 10, stateScore: 152.7 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (futbol, tədris ingilis dilində)", stream: "Ə", aptitude: 10, score: 139.9, aptitudeState: 10, stateScore: 139.9 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sərbəst güləş, tədris ingilis dilində)", stream: "Ə", aptitude: 10, score: 115.3 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (kamandan oxatma, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 70 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (qılıncoynatma, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 70 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (stolüstü tennis, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 70, aptitudeState: 10, stateScore: 167.2 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (tennis, tədris ingilis dilində)", stream: "Ə", aptitude: 7, score: 113.2 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (üzgüçülük, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 114.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (velosiped, tədris ingilis dilində)", stream: "Ə", aptitude: 10, score: 125.2, aptitudeState: 10, stateScore: 138.6 },
  // Azərbaycan bölməsi (əyani / qiyabi)
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (ağırlıqqaldırma)", stream: "Ə", aptitude: 10, score: 74.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (ağırlıqqaldırma)", stream: "Q", aptitude: 10, score: 72.7, aptitudeState: 10, stateScore: 158.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (alpinizm)", stream: "Ə", aptitude: 10, score: 106 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atıcılıq)", stream: "Ə", aptitude: 8, score: 119.3, aptitudeState: 10, stateScore: 150.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atıcılıq)", stream: "Q", aptitude: 9, score: 198 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atıcılıq) — Subbakalavrlar üzrə", stream: "Q", aptitude: 10, score: 69 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atletika)", stream: "Ə", aptitude: 8, score: 122.1, aptitudeState: 10, stateScore: 147 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (atletika)", stream: "Q", aptitude: 8, score: 112.8, aptitudeState: 10, stateScore: 147.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (kanoe və avarçəkmə)", stream: "Ə", aptitude: 10, score: 95.2, aptitudeState: 10, stateScore: 139.9 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (badminton)", stream: "Ə", aptitude: 9, score: 97 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (basketbol)", stream: "Ə", aptitude: 9, score: 96.6, aptitudeState: 10, stateScore: 141.7 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (basketbol)", stream: "Q", aptitude: 8, score: 101.6 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (boks)", stream: "Ə", aptitude: 10, score: 109.4, aptitudeState: 10, stateScore: 143.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (boks)", stream: "Q", aptitude: 10, score: 106.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (cüdo)", stream: "Ə", aptitude: 10, score: 102.4, aptitudeState: 10, stateScore: 139 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (cüdo)", stream: "Q", aptitude: 10, score: 99.1 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (futbol)", stream: "Ə", aptitude: 10, score: 115.9, aptitudeState: 10, stateScore: 142.6 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (gimnastika)", stream: "Ə", aptitude: 6, score: 70, aptitudeState: 10, stateScore: 146.8 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (gimnastika)", stream: "Q", aptitude: 6, score: 70, aptitudeState: 10, stateScore: 198.2 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sərbəst güləş)", stream: "Ə", aptitude: 10, score: 118.8, aptitudeState: 10, stateScore: 143.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sərbəst güləş)", stream: "Q", aptitude: 10, score: 107.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (yunan-Roma güləşi)", stream: "Ə", aptitude: 10, score: 89.1, aptitudeState: 10, stateScore: 160 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (yunan-Roma güləşi)", stream: "Q", aptitude: 8, score: 75.8 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (həndbol)", stream: "Ə", aptitude: 9, score: 105.7 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (həndbol)", stream: "Q", aptitude: 9, score: 93 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (kamandan oxatma)", stream: "Ə", aptitude: 6, score: 70, aptitudeState: 10, stateScore: 165.1 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (karate)", stream: "Ə", aptitude: 10, score: 83.3 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (karate)", stream: "Q", aptitude: 9, score: 156.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (karate) — Subbakalavrlar üzrə", stream: "Q", aptitude: 10, score: 67.1 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (qılıncoynatma)", stream: "Ə", aptitude: 8, score: 97.1 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (qış idman növləri)", stream: "Ə", aptitude: 7, score: 83.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (şahmat)", stream: "Ə", aptitude: 9, score: 101.2, aptitudeState: 10, stateScore: 165.1 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (sambo)", stream: "Ə", aptitude: 10, score: 100.8 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (stolüstü tennis)", stream: "Ə", aptitude: 7, score: 112.4, aptitudeState: 10, stateScore: 147.8 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (stolüstü tennis)", stream: "Q", aptitude: 7, score: 103.9 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (stolüstü tennis) — Subbakalavrlar üzrə", stream: "Q", aptitude: 10, score: 62.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (taekvando)", stream: "Ə", aptitude: 9, score: 138.1, aptitudeState: 10, stateScore: 143.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (taekvando)", stream: "Q", aptitude: 9, score: 147.8, aptitudeState: 10, stateScore: 156.6 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (tennis)", stream: "Ə", aptitude: 7, score: 122.1 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (triatlon)", stream: "Ə", aptitude: 9, score: 98.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (üzgüçülük)", stream: "Ə", aptitude: 7, score: 82.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (üzgüçülük)", stream: "Q", aptitude: 9, score: 82.5 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (velosiped)", stream: "Ə", aptitude: 10, score: 74.6, aptitudeState: 10, stateScore: 149.4 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (velosiped)", stream: "Q", aptitude: 10, score: 72.9 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (voleybol)", stream: "Ə", aptitude: 9, score: 128.2, aptitudeState: 10, stateScore: 194.2 },
  { university: "Azərbaycan İdman Akademiyası", specialty: "Məşqçilik (voleybol)", stream: "Q", aptitude: 9, score: 123.9, aptitudeState: 10, stateScore: 144.2 },

  // ═══ Qarabağ Universiteti ═══
  { university: "Qarabağ Universiteti", specialty: "Musiqi müəllimliyi (fortepiano)", stream: "Ə", score: 102.8 },
  { university: "Qarabağ Universiteti", specialty: "Musiqi müəllimliyi (digər alətlər)", stream: "Ə", score: 60 },
  // Qarabağda qabiliyyət tələb edən ixtisaslar yalnız dövlət sifarişli
  { university: "Qarabağ Universiteti", specialty: "Bəstəkarlıq", stream: "Ə", aptitudeState: 6, score: 60, stateScore: 60 },
  { university: "Qarabağ Universiteti", specialty: "Dekorativ-tətbiqi sənət (bədii toxuculuq, keramika)", stream: "Ə", aptitudeState: 7, score: 113, stateScore: 113 },
  { university: "Qarabağ Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn, geyim dizaynı)", stream: "Ə", aptitudeState: 6, score: 122.6, stateScore: 122.6 },
  { university: "Qarabağ Universiteti", specialty: "İnstrumental ifaçılıq (fortepiano)", stream: "Ə", aptitudeState: 8, score: 108.2, stateScore: 108.2 },
  { university: "Qarabağ Universiteti", specialty: "İnstrumental ifaçılıq (fleyta, qoboy, klarnet, faqot, valtoma, truba, trombon, zərb alətləri, violin, viola, violonçel, kontrabas, orqan, gitara)", stream: "Ə", aptitudeState: 7, score: 68.9, stateScore: 68.9 },
  { university: "Qarabağ Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, saz, nağara, qanun, balaban)", stream: "Ə", aptitudeState: 8, score: 83.3, stateScore: 83.3 },
  { university: "Qarabağ Universiteti", specialty: "Musiqişünaslıq", stream: "Ə", aptitudeState: 6, score: 60, stateScore: 60 },
  { university: "Qarabağ Universiteti", specialty: "Vokal sənəti (xanəndə)", stream: "Ə", aptitudeState: 6, score: 71, stateScore: 71 },
  { university: "Qarabağ Universiteti", specialty: "Vokal sənəti (akademik vokal, milli vokal)", stream: "Ə", aptitudeState: 7, score: 65.2, stateScore: 65.2 },

  // ═══ Naxçıvan Dövlət Universiteti ═══
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Dizayn (interyer dizaynı)", stream: "Ə", score: 181.6 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", score: 130, stateScore: 172.1 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Musiqi müəllimliyi", stream: "Ə", score: 86.4, stateScore: 114.7 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 125.1, stateScore: 172.5 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Aktyor sənəti (teatr və kino aktyorluğu, musiqili teatr aktyorluğu)", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 6, stateScore: 78.5 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Aktyor sənəti — Subbakalavrlar üzrə", stream: "Ə", aptitude: 6, score: 51, aptitudeState: 8, stateScore: 87.3 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Bəstəkarlıq", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Dirijorluq (xor dirijorluğu, nəfəs alətləri orkestrinin dirijorluğu)", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qarmon, balaban, qanun, nağara, saz)", stream: "Ə", aptitude: 8, score: 135.2, aptitudeState: 9, stateScore: 63.5 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (tar, kamança, qarmon, balaban, qanun, nağara, saz)", stream: "Q", aptitude: 9, score: 94.5, aptitudeState: 9, stateScore: 94.5 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (fortepiano)", stream: "Ə", aptitude: 8, score: 78.9, aptitudeState: 9, stateScore: 112.4 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (violin, viola, violonçel, kontrabas)", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq (fleyta, klarnet, saksofon, truba, trombon, qoboy, valtoma, faqot, tuba, zərb alətləri)", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "İnstrumental ifaçılıq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 6, score: 51 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Musiqişünaslıq", stream: "Ə", aptitude: 6, score: 60 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Musiqişünaslıq", stream: "Q", aptitude: 7, score: 69.8, aptitudeState: 7, stateScore: 83.9 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Rəngkarlıq", stream: "Ə", aptitude: 6, score: 93.1, aptitudeState: 6, stateScore: 93.1 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Rəngkarlıq — Subbakalavrlar üzrə", stream: "Ə", aptitude: 7, score: 89.2, aptitudeState: 7, stateScore: 89.2 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Vokal sənəti (xanəndəlik, milli vokal)", stream: "Ə", aptitude: 6, score: 60, aptitudeState: 8, stateScore: 84.8 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Vokal sənəti — Subbakalavrlar üzrə", stream: "Ə", aptitude: 6, score: 51, aptitudeState: 8, stateScore: 82.3 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Ə", aptitude: 8, score: 103.9 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Q", aptitude: 7, score: 115.9 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş)", stream: "Ə", aptitude: 10, score: 82, aptitudeState: 10, stateScore: 149.8 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş)", stream: "Q", aptitude: 8, score: 122.3 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş) — Subbakalavrlar üzrə", stream: "Q", aptitude: 10, score: 64.8 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (voleybol)", stream: "Ə", aptitude: 9, score: 91.9, aptitudeState: 10, stateScore: 144.7 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Məşqçilik (voleybol)", stream: "Q", aptitude: 8, score: 79.3 },

  // ═══ Naxçıvan Müəllimlər İnstitutu ═══
  { university: "Naxçıvan Müəllimlər İnstitutu", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 115.8 },

  // ═══ Azərbaycan Dövlət Aqrar Universiteti ═══
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Dizayn (interyer, qrafik)", stream: "Ə", score: 188.2, stateScore: 241.9 },

  // ═══ Gəncə Dövlət Universiteti ═══
  { university: "Gəncə Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", score: 135.1, stateScore: 172.9 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Musiqi müəllimliyi", stream: "Ə", score: 107.8, stateScore: 110.8 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 124.9, stateScore: 167.9 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Ümumi fiziki hazırlıq", stream: "Ə", score: 128.7, stateScore: 155.5 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (futbol)", stream: "Ə", aptitude: 10, score: 110.6 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Ə", aptitude: 8, score: 111.8 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (atletika)", stream: "Q", aptitude: 8, score: 89.1 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (boks)", stream: "Ə", aptitude: 10, score: 83.6 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş)", stream: "Ə", aptitude: 10, score: 106.1 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (sərbəst güləş)", stream: "Q", aptitude: 10, score: 74.3 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Məşqçilik (yunan-Roma güləşi)", stream: "Ə", aptitude: 8, score: 126.9 },

  // ═══ Azərbaycan Texnologiya Universiteti ═══
  { university: "Azərbaycan Texnologiya Universiteti", specialty: "Dizayn (geyim, sənaye)", stream: "Ə", score: 175 },

  // ═══ Sumqayıt Dövlət Universiteti ═══
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Fiziki tərbiyə və çağırışaqədərki hazırlıq müəllimliyi", stream: "Ə", score: 140.7, stateScore: 173.8 },

  // ═══ Lənkəran Dövlət Universiteti ═══
  { university: "Lənkəran Dövlət Universiteti", specialty: "Musiqi müəllimliyi", stream: "Ə", score: 83.3 },
  { university: "Lənkəran Dövlət Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 125.9, stateScore: 172.5 },

  // ═══ Qərbi Kaspi Universiteti ═══
  { university: "Qərbi Kaspi Universiteti", specialty: "Dizayn (interyer, qrafik, sənaye)", stream: "Ə", score: 190.3 },
  { university: "Qərbi Kaspi Universiteti", specialty: "Dizayn (tədris ingilis dilində)", stream: "Ə", score: 198.8, stateScore: 261.3 },

  // ═══ Xəzər Universiteti ═══
  { university: "Xəzər Universiteti", specialty: "Dizayn (qrafik, interyer, landşaft)", stream: "Ə", score: 191.8 },
  { university: "Xəzər Universiteti", specialty: "Dizayn (tədris ingilis dilində)", stream: "Ə", score: 205.5, stateScore: 243.9 },
  { university: "Xəzər Universiteti", specialty: "Təsviri incəsənət müəllimliyi", stream: "Ə", score: 151.7, stateScore: 166.6 },

  // ═══ "Odlar Yurdu" Universiteti ═══
  { university: "\"Odlar Yurdu\" Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn və geyim dizaynı, tədris ingilis dilində)", stream: "Ə", aptitude: 6, score: 122.7 },
  { university: "\"Odlar Yurdu\" Universiteti", specialty: "Dizayn (interyer dizaynı, qrafik dizayn və geyim dizaynı)", stream: "Ə", aptitude: 6, score: 110.6 },
];
