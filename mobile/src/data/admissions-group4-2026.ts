// 4-cu qrup keçid balları 2026
// Mənbə: qebulol.az/4-cu-qrup-kecid-ballari-2026

export interface AdmissionEntry {
  code?: string;
  university: string;
  specialty: string;
  stream?: string;
  aptitude?: number;
  score: number;
  /** Dövlət sifarişli keçid balı (mötərizədəki ədəd). */
  stateScore?: number;
  /** Altqrup süzgəci üçün etiket (məs. "subbakalavr") */
  tag?: string;
}

export const admissionsGroup4: AdmissionEntry[] = [
  // ═══ Bakı Dövlət Universiteti ═══
  { university: "Bakı Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", score: 433.9, stateScore: 433.9 },
  { university: "Bakı Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", score: 454.4, stateScore: 454.4 },
  { university: "Bakı Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", score: 540.7, stateScore: 540.7 },
  { university: "Bakı Dövlət Universiteti", specialty: "Psixologiya", stream: "Q", score: 356.9, stateScore: 533.9 },
  { university: "Bakı Dövlət Universiteti", specialty: "Psixologiya (tədris ingilis dilində)", stream: "Ə", score: 581.5, stateScore: 581.5 },
  { university: "Bakı Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", score: 493.5, stateScore: 493.5 },
  { university: "Bakı Dövlət Universiteti", specialty: "Biologiya (tədris ingilis dilində)", stream: "Ə", score: 542.2, stateScore: 542.2 },
  { university: "Bakı Dövlət Universiteti", specialty: "Biotexnologiya", stream: "Ə", score: 562.3, stateScore: 562.3 },
  { university: "Bakı Dövlət Universiteti", specialty: "Biotexnologiya (tədris ingilis dilində)", stream: "Ə", score: 586.8, stateScore: 586.8 },
  { university: "Bakı Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", score: 349.9, stateScore: 349.9 },
  { university: "Bakı Dövlət Universiteti", specialty: "Ekologiya (tədris ingilis dilində)", stream: "Ə", score: 396.2, stateScore: 396.2 },
  { university: "Bakı Dövlət Universiteti", specialty: "Kimya", stream: "Ə", score: 482.6, stateScore: 482.6 },
  { university: "Bakı Dövlət Universiteti", specialty: "Kimya (tədris ingilis dilində)", stream: "Ə", score: 548.1, stateScore: 548.1 },
  { university: "Bakı Dövlət Universiteti", specialty: "Su bioehtiyatları və akvakultura", stream: "Ə", score: 266.2, stateScore: 266.2 },
  { university: "Bakı Dövlət Universiteti", specialty: "Bitki mühafizəsi", stream: "Ə", score: 270.4, stateScore: 270.4 },
  { university: "Bakı Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", score: 200 },
  // ═══ Azərbaycan Tibb Universiteti ═══
  { university: "Azərbaycan Tibb Universiteti", specialty: "Əczaçılıq", stream: "Ə", score: 580.6, stateScore: 580.6 },
  { university: "Azərbaycan Tibb Universiteti", specialty: "Fizioterapiya", stream: "Ə", score: 603.4, stateScore: 603.4 },
  { university: "Azərbaycan Tibb Universiteti", specialty: "İctimai səhiyyə", stream: "Ə", score: 593, stateScore: 593 },
  { university: "Azərbaycan Tibb Universiteti", specialty: "Tibb bacısı (qardaşı) işi", stream: "Ə", score: 547.8, stateScore: 547.8 },
  { university: "Azərbaycan Tibb Universiteti", specialty: "Stomatologiya", stream: "Ə", score: 615.5, stateScore: 615.5 },
  { university: "Azərbaycan Tibb Universiteti", specialty: "Tibb", stream: "Ə", score: 624.3, stateScore: 624.3 },
  { university: "Azərbaycan Tibb Universiteti", specialty: "Tibb (tədris ingilis dilində)", stream: "Ə", score: 683.7, stateScore: 683.7 },
  // ═══ Azərbaycan Dövlət Pedaqoji Universiteti ═══
  { university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", score: 291.4, stateScore: 381 },
  { university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", score: 318.1, stateScore: 394.2 },
  { university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", score: 400.1, stateScore: 400.1 },
  // ═══ Azərbaycan Dövlət İqtisad Universiteti ═══
  { university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Ekologiya", stream: "Ə", score: 314.7, stateScore: 314.7 },
  // ═══ Bakı Slavyan Universiteti ═══
  { university: "Bakı Slavyan Universiteti", specialty: "Psixologiya", stream: "Ə", score: 492.8, stateScore: 499 },
  { university: "Bakı Slavyan Universiteti", specialty: "Psixologiya", stream: "Q", score: 268.6 },
  // ═══ Bakı Mühəndislik Universiteti ═══
  { university: "Bakı Mühəndislik Universiteti", specialty: "Biotexnologiya", stream: "Ə", score: 515.2, stateScore: 524.3 },
  { university: "Bakı Mühəndislik Universiteti", specialty: "Kimya", stream: "Ə", score: 415.2, stateScore: 468.4 },
  { university: "Bakı Mühəndislik Universiteti", specialty: "Kimya (tədris ingilis dilində)", stream: "Ə", score: 477.2, stateScore: 477.2 },
  // ═══ Azərbaycan İdman Akademiyası ═══
  { university: "Azərbaycan İdman Akademiyası", specialty: "Fizioterapiya", stream: "Ə", score: 453.9, stateScore: 453.9 },
  // ═══ Qarabağ Universiteti ═══
  { university: "Qarabağ Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", score: 286.2, stateScore: 286.2 },
  { university: "Qarabağ Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", score: 325.9, stateScore: 325.9 },
  { university: "Qarabağ Universiteti", specialty: "Psixologiya", stream: "Ə", score: 485.9, stateScore: 485.9 },
  { university: "Qarabağ Universiteti", specialty: "Tibb bacısı (qardaşı) işi", stream: "Ə", score: 490.6, stateScore: 490.6 },
  { university: "Qarabağ Universiteti", specialty: "Tibb", stream: "Ə", score: 614.6, stateScore: 614.6 },
  // ═══ Naxçıvan Dövlət Universiteti ═══
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", score: 289.1, stateScore: 385.7 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", score: 200, stateScore: 395.8 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", score: 416.5, stateScore: 503.4 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", score: 364.8, stateScore: 364.8 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Kimya", stream: "Ə", score: 200, stateScore: 485.2 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", score: 150, stateScore: 150 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Əczaçılıq", stream: "Ə", score: 566.7, stateScore: 566.7 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "İctimai səhiyyə", stream: "Ə", score: 582, stateScore: 582 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Tibb bacısı (qardaşı) işi", stream: "Ə", score: 482.4, stateScore: 482.4 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Stomatologiya", stream: "Ə", score: 600.4, stateScore: 600.9 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Tibb", stream: "Ə", score: 604.1, stateScore: 604.1 },
  { university: "Naxçıvan Dövlət Universiteti", specialty: "Tibb (tədris ingilis dilində)", stream: "Ə", score: 607.3, stateScore: 607.3 },
  // ═══ Azərbaycan Dövlət Aqrar Universiteti ═══
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Biotexnologiya", stream: "Ə", score: 200 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Ekologiya", stream: "Ə", score: 150 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Su bioehtiyatları və akvakultura", stream: "Ə", score: 171.6, stateScore: 171.6 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Bağçılıq və tərəvəzçilik (tədris türk dilində)", stream: "Ə", score: 150, stateScore: 150 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Bağçılıq və tərəvəzçilik", stream: "Ə", score: 150, stateScore: 150 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Bağçılıq və tərəvəzçilik", stream: "Q", score: 150, stateScore: 150 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Bağçılıq və tərəvəzçilik (tədris ingilis dilində)", stream: "Ə", score: 168.6, stateScore: 168.6 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", score: 150, stateScore: 150 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Baytarlıq təbabəti (tədris ingilis dilində)", stream: "Ə", score: 275.8, stateScore: 275.8 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Bitki mühafizəsi (tədris türk dilində)", stream: "Ə", score: 150, stateScore: 150 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Bitki mühafizəsi", stream: "Ə", score: 150, stateScore: 150 },
  { university: "Azərbaycan Dövlət Aqrar Universiteti", specialty: "Əczaçılıq", stream: "Ə", score: 200, stateScore: 238.2 },
  // ═══ Gəncə Dövlət Universiteti ═══
  { university: "Gəncə Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", score: 200, stateScore: 473.7 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", score: 200, stateScore: 528.5 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", score: 200, stateScore: 366.8 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", score: 200 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", score: 200, stateScore: 348.2 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", score: 211.5, stateScore: 265.3 },
  { university: "Gəncə Dövlət Universiteti", specialty: "Kimya", stream: "Ə", score: 200, stateScore: 478.8 },
  // ═══ Azərbaycan Texnologiya Universiteti ═══
  { university: "Azərbaycan Texnologiya Universiteti", specialty: "Ekologiya", stream: "Ə", score: 150 },
  // ═══ Sumqayıt Dövlət Universiteti ═══
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", score: 200 },
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", score: 200, stateScore: 438.9 },
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya müəllimliyi (tədris ingilis dilində)", stream: "Ə", score: 200 },
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", score: 263.1, stateScore: 366.3 },
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", score: 334.8, stateScore: 503 },
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", score: 200, stateScore: 335.4 },
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", score: 236.7, stateScore: 284.2 },
  { university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya", stream: "Ə", score: 200 },
  // ═══ Mingəçevir Dövlət Universiteti ═══
  { university: "Mingəçevir Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", score: 200, stateScore: 373.4 },
  { university: "Mingəçevir Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", score: 150, stateScore: 322.1 },
  // ═══ Lənkəran Dövlət Universiteti ═══
  { university: "Lənkəran Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", score: 200, stateScore: 367.5 },
  { university: "Lənkəran Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", score: 150, stateScore: 312.4 },
  { university: "Lənkəran Dövlət Universiteti", specialty: "Bağçılıq və tərəvəzçilik", stream: "Ə", score: 150, stateScore: 150 },
  { university: "Lənkəran Dövlət Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", score: 150, stateScore: 150 },
  // ═══ Azərbaycan Kooperasiya Universiteti ═══
  { university: "Azərbaycan Kooperasiya Universiteti", specialty: "Ekologiya", stream: "Ə", score: 185.4 },
  // ═══ Qərbi Kaspi Universiteti ═══
  { university: "Qərbi Kaspi Universiteti", specialty: "Psixologiya (tədris ingilis dilində)", stream: "Ə", score: 378.7, stateScore: 499.1 },
  { university: "Qərbi Kaspi Universiteti", specialty: "Psixologiya", stream: "Ə", score: 341 },
  { university: "Qərbi Kaspi Universiteti", specialty: "Biologiya (tədris ingilis dilində)", stream: "Ə", score: 404, stateScore: 404 },
  { university: "Qərbi Kaspi Universiteti", specialty: "Biologiya", stream: "Ə", score: 366.2, stateScore: 366.2 },
  { university: "Qərbi Kaspi Universiteti", specialty: "Ekologiya", stream: "Ə", score: 290, stateScore: 290 },
  { university: "Qərbi Kaspi Universiteti", specialty: "Su bioehtiyatları və akvakultura", stream: "Ə", score: 222.6, stateScore: 222.6 },
  // ═══ Xəzər Universiteti ═══
  { university: "Xəzər Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", score: 382, stateScore: 382 },
  { university: "Xəzər Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", score: 387.5, stateScore: 387.5 },
  { university: "Xəzər Universiteti", specialty: "Psixologiya (tədris ingilis dilində)", stream: "Ə", score: 528.5, stateScore: 528.5 },
  { university: "Xəzər Universiteti", specialty: "Biotexnologiya (tədris ingilis dilində)", stream: "Ə", score: 557.8, stateScore: 557.8 },
  { university: "Xəzər Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", score: 242, stateScore: 242 },
  { university: "Xəzər Universiteti", specialty: "Baytarlıq təbabəti (tədris ingilis dilində)", stream: "Ə", score: 297.6, stateScore: 297.6 },
  // ═══ Bakı Qızlar Universiteti ═══
  { university: "Bakı Qızlar Universiteti", specialty: "Psixologiya", stream: "Ə", score: 200 },
  // ═══ "Odlar Yurdu" Universiteti ═══
  { university: "\"Odlar Yurdu\" Universiteti", specialty: "Psixologiya", score: 311.7, stateScore: 608.1 },
  { university: "\"Odlar Yurdu\" Universiteti", specialty: "Biologiya", score: 315.7, stateScore: 339.6 },
  { university: "\"Odlar Yurdu\" Universiteti", specialty: "Ekologiya", score: 263.9, stateScore: 269.6 },
];
