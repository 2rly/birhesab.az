// IV ixtisas qrupu üzrə keçid balları — 2026/2027 qəbulu.
// Mənbə: DİM rəsmi keçid balı siyahısı (ödənişli / dövlət sifarişli).
// Bu fayl scripts/build-group4-scores-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.
// Subbakalavr pilləsi — 10 ali məktəb, 26 ixtisas (0-100 şkalası).

import type { AdmissionEntry } from "./admissions-group4-2026";

export const admissionsGroup4Sub: AdmissionEntry[] = [
  // ═══ Naxçıvan Dövlət Universiteti ═══
  { code: "142892", university: "Naxçıvan Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 95.5, tag: "subbakalavr" },
  { code: "142924", university: "Naxçıvan Dövlət Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "AZ", stateScore: 75, tag: "subbakalavr" },
  { code: "142932", university: "Naxçıvan Dövlət Universiteti", specialty: "Bitki mühafizəsi", stream: "Ə", language: "AZ", stateScore: 80.3, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri) ═══
  { code: "144617", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Biotexnologiya", stream: "Ə", language: "AZ", score: 90.3, tag: "subbakalavr" },
  { code: "144625", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 88.5, stateScore: 90.6, tag: "subbakalavr" },
  { code: "144641", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bağçılıq və tərəvəzçilik", stream: "Ə", language: "AZ", stateScore: 88.1, tag: "subbakalavr" },
  { code: "144658", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bağçılıq və tərəvəzçilik", stream: "Q", language: "AZ", stateScore: 93.2, tag: "subbakalavr" },
  { code: "144666", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bağçılıq və tərəvəzçilik (tədris türk dilində)", stream: "Ə", language: "AZ", score: 81.4, tag: "subbakalavr" },
  { code: "144682", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "AZ", stateScore: 83.1, tag: "subbakalavr" },
  { code: "144722", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bitki mühafizəsi", stream: "Ə", language: "AZ", stateScore: 89, tag: "subbakalavr" },
  { code: "144739", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bitki mühafizəsi (tədris türk dilində)", stream: "Ə", language: "AZ", score: 83.3, tag: "subbakalavr" },
  { code: "144747", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Əczaçılıq", stream: "Ə", language: "AZ", score: 83.5, tag: "subbakalavr" },
  // ═══ Gəncə Dövlət Universiteti ═══
  { code: "145613", university: "Gəncə Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 87.3, tag: "subbakalavr" },
  { code: "145621", university: "Gəncə Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 86.7, tag: "subbakalavr" },
  { code: "145638", university: "Gəncə Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 91.5, stateScore: 91.5, tag: "subbakalavr" },
  // ═══ Azərbaycan Texnologiya Universiteti (Gəncə şəhəri) ═══
  { code: "147452", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Ekologiya", stream: "Ə", language: "AZ/RU", score: 85.6, tag: "subbakalavr" },
  // ═══ Sumqayıt Dövlət Universiteti ═══
  { code: "148724", university: "Sumqayıt Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 92.3, tag: "subbakalavr" },
  // ═══ Mingəçevir Dövlət Universiteti ═══
  { code: "149623", university: "Mingəçevir Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 86.5, stateScore: 90.6, tag: "subbakalavr" },
  // ═══ Lənkəran Dövlət Universiteti ═══
  { code: "151623", university: "Lənkəran Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 85.3, stateScore: 90.8, tag: "subbakalavr" },
  { code: "151631", university: "Lənkəran Dövlət Universiteti", specialty: "Bağçılıq və tərəvəzçilik", stream: "Ə", language: "AZ", stateScore: 77.7, tag: "subbakalavr" },
  { code: "151648", university: "Lənkəran Dövlət Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "AZ", stateScore: 78.7, tag: "subbakalavr" },
  // ═══ Azərbaycan Kooperasiya Universiteti ═══
  { code: "154467", university: "Azərbaycan Kooperasiya Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 89, stateScore: 90.6, tag: "subbakalavr" },
  // ═══ Qərbi Kaspi Universiteti ═══
  { code: "157594", university: "Qərbi Kaspi Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 90, tag: "subbakalavr" },
  { code: "157634", university: "Qərbi Kaspi Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 91.3, stateScore: 91.3, tag: "subbakalavr" },
  // ═══ "Odlar Yurdu" Universiteti ═══
  { code: "164519", university: "\"Odlar Yurdu\" Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ/RU", score: 90.7, tag: "subbakalavr" },
  // ═══ Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri) ═══
  { code: "144755", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Əczaçılıq", stream: "Ə", language: "RU", score: 51, tag: "subbakalavr" },
];
