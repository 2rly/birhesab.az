// I ixtisas qrupu üzrə keçid balları — 2026/2027 qəbulu.
// Mənbə: DİM rəsmi keçid balı siyahısı (ödənişli / dövlət sifarişli).
// Bu fayl scripts/build-group1-scores-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.
// Subbakalavr pilləsi — 19 ali məktəb, 69 ixtisas (0-100 şkalası).

import type { AdmissionEntry } from "./admissions-group1-2026";

export const admissionsGroup1Sub: AdmissionEntry[] = [
  // ═══ Bakı Dövlət Universiteti ═══
  { code: "111293", university: "Bakı Dövlət Universiteti", specialty: "Geomatika və geodeziya mühəndisliyi", stream: "Ə", language: "AZ", score: 89.4, stateScore: 89.4, tag: "subbakalavr" },
  { code: "111374", university: "Bakı Dövlət Universiteti", specialty: "Mədən mühəndisliyi", stream: "Ə", language: "AZ", score: 68.9, stateScore: 70.6, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Neft və Sənaye Universiteti ═══
  { code: "114558", university: "Azərbaycan Dövlət Neft və Sənaye Universiteti", specialty: "Mədən mühəndisliyi", stream: "Ə", language: "AZ/RU", score: 87.8, stateScore: 87.8, tag: "subbakalavr" },
  // ═══ Azərbaycan Texniki Universiteti ═══
  { code: "116372", university: "Azərbaycan Texniki Universiteti", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", stateScore: 88.2, tag: "subbakalavr" },
  { code: "116389", university: "Azərbaycan Texniki Universiteti", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", score: 88.8, stateScore: 88.8, tag: "subbakalavr" },
  { code: "116461", university: "Azərbaycan Texniki Universiteti", specialty: "Metallurgiya mühəndisliyi", stream: "Ə", language: "AZ", score: 60.5, stateScore: 60.5, tag: "subbakalavr" },
  { code: "116478", university: "Azərbaycan Texniki Universiteti", specialty: "Mədən mühəndisliyi", stream: "Ə", language: "AZ", score: 51, stateScore: 75.2, tag: "subbakalavr" },
  // ═══ Azərbaycan Memarlıq və İnşaat Universiteti ═══
  { code: "118162", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Geomatika və geodeziya mühəndisliyi", stream: "Ə", language: "AZ", score: 87.7, stateScore: 87.7, tag: "subbakalavr" },
  { code: "118284", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Kommunikasiya sistemləri mühəndisliyi", stream: "Ə", language: "AZ", score: 84.7, stateScore: 84.7, tag: "subbakalavr" },
  { code: "118324", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", score: 85.2, stateScore: 85.2, tag: "subbakalavr" },
  { code: "118332", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Materiallar mühəndisliyi", stream: "Ə", language: "AZ", score: 76.9, stateScore: 76.9, tag: "subbakalavr" },
  { code: "118381", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Nəqliyyat mühəndisliyi", stream: "Ə", language: "AZ", score: 92.9, stateScore: 92.9, tag: "subbakalavr" },
  { code: "118398", university: "Azərbaycan Memarlıq və İnşaat Universiteti", specialty: "Nəqliyyat tikintisi mühəndisliyi", stream: "Ə", language: "AZ", score: 80.4, stateScore: 80.4, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Pedaqoji Universiteti ═══
  { code: "122714", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Aqronomluq (Cəlilabad filialı)", stream: "Ə", language: "AZ", score: 80.2, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət İqtisad Universiteti ═══
  { code: "123298", university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", score: 90.7, stateScore: 90.7, tag: "subbakalavr" },
  { code: "123313", university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Materiallar mühəndisliyi", stream: "Ə", language: "AZ", score: 87.8, stateScore: 87.8, tag: "subbakalavr" },
  // ═══ Bakı Mühəndislik Universiteti ═══
  { code: "128377", university: "Bakı Mühəndislik Universiteti", specialty: "Kommunikasiya sistemləri mühəndisliyi", stream: "Ə", language: "AZ", score: 83.5, stateScore: 83.5, tag: "subbakalavr" },
  { code: "128441", university: "Bakı Mühəndislik Universiteti", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", score: 79.6, stateScore: 79.6, tag: "subbakalavr" },
  { code: "128499", university: "Bakı Mühəndislik Universiteti", specialty: "Memarlıq", stream: "Ə", language: "AZ", score: 88.8, tag: "subbakalavr" },
  { code: "128522", university: "Bakı Mühəndislik Universiteti", specialty: "Nəqliyyat mühəndisliyi", stream: "Ə", language: "AZ", score: 91.5, stateScore: 91.5, tag: "subbakalavr" },
  { code: "128539", university: "Bakı Mühəndislik Universiteti", specialty: "Nəqliyyat tikintisi mühəndisliyi", stream: "Ə", language: "AZ", score: 75.9, stateScore: 75.9, tag: "subbakalavr" },
  { code: "128588", university: "Bakı Mühəndislik Universiteti", specialty: "Sənaye mühəndisliyi", stream: "Ə", language: "AZ", score: 87.1, tag: "subbakalavr" },
  // ═══ ADA Universiteti ═══
  { code: "131251", university: "ADA Universiteti", specialty: "Heyvandarlıq (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 91, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Rəssamlıq Akademiyası ═══
  { code: "135115", university: "Azərbaycan Dövlət Rəssamlıq Akademiyası", specialty: "Memarlıq (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 88.4, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Dəniz Akademiyası ═══
  { code: "139125", university: "Azərbaycan Dövlət Dəniz Akademiyası", specialty: "Dəniz naviqasiyası mühəndisliyi", stream: "Q", language: "AZ", score: 51, tag: "subbakalavr" },
  { code: "139182", university: "Azərbaycan Dövlət Dəniz Akademiyası", specialty: "Gəmi energetik qurğularının istismarı mühəndisliyi", stream: "Q", language: "AZ", score: 70.8, tag: "subbakalavr" },
  { code: "139214", university: "Azərbaycan Dövlət Dəniz Akademiyası", specialty: "Gəmiqayırma və gəmi təmiri mühəndisliyi", stream: "Ə", language: "AZ", score: 62.8, stateScore: 62.8, tag: "subbakalavr" },
  // ═══ Naxçıvan Dövlət Universiteti ═══
  { code: "142187", university: "Naxçıvan Dövlət Universiteti", specialty: "Ekologiya mühəndisliyi", stream: "Ə", language: "AZ", score: 72.6, tag: "subbakalavr" },
  { code: "142219", university: "Naxçıvan Dövlət Universiteti", specialty: "Energetika mühəndisliyi", stream: "Ə", language: "AZ", score: 80.7, stateScore: 80.8, tag: "subbakalavr" },
  { code: "142268", university: "Naxçıvan Dövlət Universiteti", specialty: "Kimya mühəndisliyi", stream: "Ə", language: "AZ", score: 51, tag: "subbakalavr" },
  { code: "142316", university: "Naxçıvan Dövlət Universiteti", specialty: "Meliorasiya mühəndisliyi", stream: "Ə", language: "AZ", score: 51, stateScore: 78.3, tag: "subbakalavr" },
  { code: "142324", university: "Naxçıvan Dövlət Universiteti", specialty: "Memarlıq", stream: "Ə", language: "AZ", score: 72.2, tag: "subbakalavr" },
  { code: "142332", university: "Naxçıvan Dövlət Universiteti", specialty: "Nəqliyyat mühəndisliyi", stream: "Ə", language: "AZ", score: 85.6, stateScore: 85.6, tag: "subbakalavr" },
  { code: "142349", university: "Naxçıvan Dövlət Universiteti", specialty: "Proseslərin avtomatlaşdırılması mühəndisliyi", stream: "Ə", language: "AZ", score: 98.1, tag: "subbakalavr" },
  { code: "142365", university: "Naxçıvan Dövlət Universiteti", specialty: "Yerquruluşu və daşınmaz əmlakın kadastrı", stream: "Ə", language: "AZ", score: 89.3, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri) ═══
  { code: "144155", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Energetika mühəndisliyi", stream: "Ə", language: "AZ", score: 87.9, stateScore: 87.9, tag: "subbakalavr" },
  { code: "144163", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi", stream: "Ə", language: "AZ", score: 88.9, stateScore: 88.9, tag: "subbakalavr" },
  { code: "144228", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", score: 77.9, stateScore: 77.9, tag: "subbakalavr" },
  { code: "144333", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Balıqçılıq", stream: "Q", language: "AZ", stateScore: 70.2, tag: "subbakalavr" },
  { code: "144341", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Meşəçilik", stream: "Ə", language: "AZ", stateScore: 85.5, tag: "subbakalavr" },
  { code: "144455", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Zoomühəndislik (tədris türk dilində)", stream: "Ə", language: "AZ", score: 85.5, tag: "subbakalavr" },
  // ═══ Gəncə Dövlət Universiteti ═══
  { code: "145176", university: "Gəncə Dövlət Universiteti", specialty: "Kimya mühəndisliyi", stream: "Ə", language: "AZ", score: 71.2, tag: "subbakalavr" },
  { code: "145184", university: "Gəncə Dövlət Universiteti", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", score: 74.3, stateScore: 74.6, tag: "subbakalavr" },
  // ═══ Azərbaycan Texnologiya Universiteti (Gəncə şəhəri) ═══
  { code: "147136", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi", stream: "Ə", language: "AZ/RU", score: 75.5, stateScore: 75.5, tag: "subbakalavr" },
  { code: "147193", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Maşın mühəndisliyi", stream: "Ə", language: "AZ", score: 73, stateScore: 73, tag: "subbakalavr" },
  { code: "147217", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Metallurgiya mühəndisliyi", stream: "Ə", language: "AZ", score: 51, stateScore: 59.3, tag: "subbakalavr" },
  { code: "147225", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Nəqliyyat mühəndisliyi", stream: "Ə", language: "AZ", score: 86, stateScore: 86, tag: "subbakalavr" },
  { code: "147258", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Sənaye mühəndisliyi", stream: "Ə", language: "AZ", score: 69.7, tag: "subbakalavr" },
  { code: "147266", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Şərabçılıq", stream: "Ə", language: "AZ/RU", score: 51, tag: "subbakalavr" },
  // ═══ Sumqayıt Dövlət Universiteti ═══
  { code: "148213", university: "Sumqayıt Dövlət Universiteti", specialty: "Energetika mühəndisliyi", stream: "Ə", language: "AZ", score: 90.4, stateScore: 90.4, tag: "subbakalavr" },
  { code: "148246", university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya mühəndisliyi", stream: "Ə", language: "AZ", score: 78.1, tag: "subbakalavr" },
  { code: "148254", university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya mühəndisliyi", stream: "Ə", language: "AZ", score: 72.5, tag: "subbakalavr" },
  { code: "148327", university: "Sumqayıt Dövlət Universiteti", specialty: "Neft-qaz mühəndisliyi", stream: "Ə", language: "AZ", score: 85.1, tag: "subbakalavr" },
  // ═══ Mingəçevir Dövlət Universiteti ═══
  { code: "149161", university: "Mingəçevir Dövlət Universiteti", specialty: "Kompüter elmləri", stream: "Ə", language: "AZ", score: 84.7, tag: "subbakalavr" },
  { code: "149178", university: "Mingəçevir Dövlət Universiteti", specialty: "Kompüter elmləri (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 91.6, tag: "subbakalavr" },
  { code: "149218", university: "Mingəçevir Dövlət Universiteti", specialty: "Energetika mühəndisliyi", stream: "Ə", language: "AZ", score: 85.4, stateScore: 85.4, tag: "subbakalavr" },
  { code: "149226", university: "Mingəçevir Dövlət Universiteti", specialty: "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi", stream: "Ə", language: "AZ", score: 78.9, stateScore: 78.9, tag: "subbakalavr" },
  { code: "149267", university: "Mingəçevir Dövlət Universiteti", specialty: "Nəqliyyat mühəndisliyi", stream: "Ə", language: "AZ", score: 88.1, stateScore: 88.1, tag: "subbakalavr" },
  { code: "149283", university: "Mingəçevir Dövlət Universiteti", specialty: "Sənaye mühəndisliyi", stream: "Ə", language: "AZ", score: 51, tag: "subbakalavr" },
  // ═══ Lənkəran Dövlət Universiteti ═══
  { code: "151218", university: "Lənkəran Dövlət Universiteti", specialty: "Şərabçılıq", stream: "Ə", language: "AZ", stateScore: 58.4, tag: "subbakalavr" },
  { code: "151242", university: "Lənkəran Dövlət Universiteti", specialty: "Meşəçilik", stream: "Ə", language: "AZ", stateScore: 77.7, tag: "subbakalavr" },
  { code: "151259", university: "Lənkəran Dövlət Universiteti", specialty: "Meşəçilik", stream: "Q", language: "AZ", stateScore: 92.6, tag: "subbakalavr" },
  { code: "151283", university: "Lənkəran Dövlət Universiteti", specialty: "Zoomühəndislik", stream: "Ə", language: "AZ", stateScore: 62.3, tag: "subbakalavr" },
  // ═══ Qərbi Kaspi Universiteti ═══
  { code: "157131", university: "Qərbi Kaspi Universiteti", specialty: "Cihaz mühəndisliyi", stream: "Ə", language: "AZ", score: 83.1, stateScore: 83.1, tag: "subbakalavr" },
  // ═══ Xəzər Universiteti ═══
  { code: "158177", university: "Xəzər Universiteti", specialty: "İnşaat mühəndisliyi (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 86.5, stateScore: 86.5, tag: "subbakalavr" },
  { code: "158185", university: "Xəzər Universiteti", specialty: "Kimya mühəndisliyi (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 51, tag: "subbakalavr" },
  { code: "158225", university: "Xəzər Universiteti", specialty: "Memarlıq", stream: "Ə", language: "AZ/RU", score: 83.6, tag: "subbakalavr" },
  { code: "158233", university: "Xəzər Universiteti", specialty: "Memarlıq (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 78.3, tag: "subbakalavr" },
  { code: "158241", university: "Xəzər Universiteti", specialty: "Neft-qaz mühəndisliyi (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 77.8, tag: "subbakalavr" },
];
