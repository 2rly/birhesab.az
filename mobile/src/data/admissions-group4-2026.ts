// IV ixtisas qrupu üzrə keçid balları — 2026/2027 qəbulu.
// Mənbə: DİM rəsmi keçid balı siyahısı (ödənişli / dövlət sifarişli).
// Bu fayl scripts/build-group4-scores-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.
// 21 ali məktəb, 127 ixtisas.

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

export const admissionsGroup4: AdmissionEntry[] = [
  // ═══ Bakı Dövlət Universiteti ═══
  { code: "112395", university: "Bakı Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 397.7, stateScore: 397.7 },
  { code: "112427", university: "Bakı Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", language: "AZ", score: 397.3, stateScore: 397.3 },
  { code: "112435", university: "Bakı Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", score: 489, stateScore: 492.5 },
  { code: "112443", university: "Bakı Dövlət Universiteti", specialty: "Psixologiya", stream: "Q", language: "AZ", score: 200 },
  { code: "112468", university: "Bakı Dövlət Universiteti", specialty: "Psixologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 581.7, stateScore: 581.7 },
  { code: "112476", university: "Bakı Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 466.9, stateScore: 466.9 },
  { code: "112492", university: "Bakı Dövlət Universiteti", specialty: "Biologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 552.3, stateScore: 552.3 },
  { code: "112516", university: "Bakı Dövlət Universiteti", specialty: "Biotexnologiya", stream: "Ə", language: "AZ", score: 562.4, stateScore: 562.4 },
  { code: "112532", university: "Bakı Dövlət Universiteti", specialty: "Biotexnologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 605.9, stateScore: 605.9 },
  { code: "112549", university: "Bakı Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 296, stateScore: 315.4 },
  { code: "112565", university: "Bakı Dövlət Universiteti", specialty: "Ekologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 368.6, stateScore: 391.7 },
  { code: "112573", university: "Bakı Dövlət Universiteti", specialty: "Kimya", stream: "Ə", language: "AZ", score: 200, stateScore: 466.6 },
  { code: "112581", university: "Bakı Dövlət Universiteti", specialty: "Su bioehtiyatları və akvakultura", stream: "Ə", language: "AZ", score: 258.8, stateScore: 260.6 },
  { code: "112598", university: "Bakı Dövlət Universiteti", specialty: "Bitki mühafizəsi", stream: "Ə", language: "AZ", score: 258.9, stateScore: 258.9 },
  { code: "112695", university: "Bakı Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi (Qazax filialı)", stream: "Ə", language: "AZ", score: 200, stateScore: 276.4 },
  // ═══ Azərbaycan Dövlət Neft və Sənaye Universiteti ═══
  { code: "114793", university: "Azərbaycan Dövlət Neft və Sənaye Universiteti", specialty: "Biotexnologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 562.7, stateScore: 562.7 },
  { code: "114817", university: "Azərbaycan Dövlət Neft və Sənaye Universiteti", specialty: "Kimya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 535.8, stateScore: 535.8 },
  // ═══ Azərbaycan Tibb Universiteti ═══
  { code: "121126", university: "Azərbaycan Tibb Universiteti", specialty: "Əczaçılıq", stream: "Ə", language: "AZ", score: 586.2, stateScore: 587.4 },
  { code: "121142", university: "Azərbaycan Tibb Universiteti", specialty: "Fizioterapiya", stream: "Ə", language: "AZ", score: 616.5, stateScore: 616.5 },
  { code: "121175", university: "Azərbaycan Tibb Universiteti", specialty: "İctimai səhiyyə", stream: "Ə", language: "AZ", score: 606.6, stateScore: 606.6 },
  { code: "121191", university: "Azərbaycan Tibb Universiteti", specialty: "Tibb bacısı (qardaşı) işi", stream: "Ə", language: "AZ", score: 517.6, stateScore: 517.6 },
  { code: "121272", university: "Azərbaycan Tibb Universiteti", specialty: "Stomatologiya", stream: "Ə", language: "AZ", score: 627.8, stateScore: 627.8 },
  { code: "121297", university: "Azərbaycan Tibb Universiteti", specialty: "Tibb", stream: "Ə", language: "AZ", score: 638.5, stateScore: 638.5 },
  { code: "121329", university: "Azərbaycan Tibb Universiteti", specialty: "Tibb (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 692.8, stateScore: 692.8 },
  // ═══ Azərbaycan Dövlət Pedaqoji Universiteti ═══
  { code: "122317", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 261.6 },
  { code: "122325", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 252.3 },
  { code: "122333", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 337.5, stateScore: 337.5 },
  { code: "122593", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Psixologiya (Şəki filialı)", stream: "Ə", language: "AZ", score: 200, stateScore: 469.9 },
  // ═══ Azərbaycan Dövlət İqtisad Universiteti ═══
  { code: "123824", university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 266.9, stateScore: 266.9 },
  // ═══ Azərbaycan Dillər Universiteti ═══
  { code: "126943", university: "Azərbaycan Dillər Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", score: 456.5, stateScore: 458.4 },
  // ═══ Bakı Slavyan Universiteti ═══
  { code: "127623", university: "Bakı Slavyan Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 478.4 },
  { code: "127631", university: "Bakı Slavyan Universiteti", specialty: "Psixologiya", stream: "Q", language: "AZ", score: 200 },
  // ═══ Bakı Mühəndislik Universiteti ═══
  { code: "128896", university: "Bakı Mühəndislik Universiteti", specialty: "Biotexnologiya", stream: "Ə", language: "AZ", score: 428.1, stateScore: 561.8 },
  { code: "128911", university: "Bakı Mühəndislik Universiteti", specialty: "Biotexnologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 561.3, stateScore: 561.3 },
  { code: "128928", university: "Bakı Mühəndislik Universiteti", specialty: "Biotexnologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 493.7, stateScore: 561 },
  { code: "128936", university: "Bakı Mühəndislik Universiteti", specialty: "Kimya", stream: "Ə", language: "AZ", score: 200, stateScore: 487 },
  { code: "128944", university: "Bakı Mühəndislik Universiteti", specialty: "Kimya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 413.9, stateScore: 467.9 },
  { code: "128952", university: "Bakı Mühəndislik Universiteti", specialty: "Kimya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 367.7, stateScore: 468.7 },
  // ═══ Azərbaycan İdman Akademiyası ═══
  { code: "137149", university: "Azərbaycan İdman Akademiyası", specialty: "Fizioterapiya", stream: "Ə", language: "AZ/RU", score: 440, stateScore: 470.9 },
  // ═══ Naxçıvan Dövlət Universiteti ═══
  { code: "142868", university: "Naxçıvan Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 200 },
  { code: "142876", university: "Naxçıvan Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 319.7 },
  { code: "142884", university: "Naxçıvan Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 462.7 },
  { code: "142892", university: "Naxçıvan Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 328.4 },
  { code: "142916", university: "Naxçıvan Dövlət Universiteti", specialty: "Kimya", stream: "Ə", language: "AZ", score: 200, stateScore: 563.8 },
  { code: "142924", university: "Naxçıvan Dövlət Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "AZ", stateScore: 151.8 },
  { code: "142932", university: "Naxçıvan Dövlət Universiteti", specialty: "Bitki mühafizəsi", stream: "Ə", language: "AZ", stateScore: 191.2 },
  { code: "142949", university: "Naxçıvan Dövlət Universiteti", specialty: "Əczaçılıq", stream: "Ə", language: "AZ", score: 508.9, stateScore: 508.9 },
  { code: "142957", university: "Naxçıvan Dövlət Universiteti", specialty: "İctimai səhiyyə", stream: "Ə", language: "AZ", score: 588.7, stateScore: 588.7 },
  { code: "142965", university: "Naxçıvan Dövlət Universiteti", specialty: "Tibb bacısı (qardaşı) işi", stream: "Ə", language: "AZ", score: 430, stateScore: 430 },
  { code: "142973", university: "Naxçıvan Dövlət Universiteti", specialty: "Stomatologiya", stream: "Ə", language: "AZ", score: 620.6, stateScore: 620.6 },
  { code: "142981", university: "Naxçıvan Dövlət Universiteti", specialty: "Tibb", stream: "Ə", language: "AZ", score: 622.2, stateScore: 622.2 },
  { code: "142998", university: "Naxçıvan Dövlət Universiteti", specialty: "Tibb (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 624.6, stateScore: 624.6 },
  // ═══ Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri) ═══
  { code: "144617", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Biotexnologiya", stream: "Ə", language: "AZ", score: 200 },
  { code: "144625", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 150, stateScore: 260.6 },
  { code: "144633", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Su bioehtiyatları və akvakultura", stream: "Ə", language: "AZ", stateScore: 151.5 },
  { code: "144658", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bağçılıq və tərəvəzçilik", stream: "Q", language: "AZ", stateScore: 182 },
  { code: "144666", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bağçılıq və tərəvəzçilik (tədris türk dilində)", stream: "Ə", language: "AZ", score: 150 },
  { code: "144674", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bağçılıq və tərəvəzçilik (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", stateScore: 172.3 },
  { code: "144682", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "AZ", stateScore: 153.4 },
  { code: "144714", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Baytarlıq təbabəti (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", stateScore: 277.6 },
  { code: "144722", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bitki mühafizəsi", stream: "Ə", language: "AZ", stateScore: 178.1 },
  { code: "144739", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Bitki mühafizəsi (tədris türk dilində)", stream: "Ə", language: "AZ", score: 150 },
  { code: "144747", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Əczaçılıq", stream: "Ə", language: "AZ", score: 200, stateScore: 335.8 },
  // ═══ Gəncə Dövlət Universiteti ═══
  { code: "145549", university: "Gəncə Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 252.1 },
  { code: "145557", university: "Gəncə Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 221.9 },
  { code: "145565", university: "Gəncə Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 273.2, stateScore: 294.8 },
  { code: "145581", university: "Gəncə Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 200, stateScore: 272.4 },
  { code: "145598", university: "Gəncə Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", score: 226.7 },
  { code: "145613", university: "Gəncə Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 334 },
  { code: "145621", university: "Gəncə Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 370.4 },
  { code: "145638", university: "Gəncə Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 150 },
  // ═══ Azərbaycan Texnologiya Universiteti (Gəncə şəhəri) ═══
  { code: "147452", university: "Azərbaycan Texnologiya Universiteti (Gəncə şəhəri)", specialty: "Ekologiya", stream: "Ə", language: "AZ/RU", score: 150 },
  // ═══ Sumqayıt Dövlət Universiteti ═══
  { code: "148668", university: "Sumqayıt Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 222.6 },
  { code: "148676", university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 344 },
  { code: "148684", university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya müəllimliyi (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 200, stateScore: 248.4 },
  { code: "148692", university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 246.7, stateScore: 256.7 },
  { code: "148716", university: "Sumqayıt Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 501.4 },
  { code: "148724", university: "Sumqayıt Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 332.8 },
  { code: "148732", university: "Sumqayıt Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 203, stateScore: 225.6 },
  { code: "148749", university: "Sumqayıt Dövlət Universiteti", specialty: "Kimya", stream: "Ə", language: "AZ", score: 200 },
  // ═══ Mingəçevir Dövlət Universiteti ═══
  { code: "149615", university: "Mingəçevir Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 236.8, stateScore: 291.4 },
  { code: "149623", university: "Mingəçevir Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 150 },
  // ═══ Lənkəran Dövlət Universiteti ═══
  { code: "151615", university: "Lənkəran Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", language: "AZ", score: 200, stateScore: 260 },
  { code: "151623", university: "Lənkəran Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 150, stateScore: 327.8 },
  { code: "151648", university: "Lənkəran Dövlət Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "AZ", stateScore: 161.5 },
  // ═══ Qarabağ Universiteti ═══
  { code: "152425", university: "Qarabağ Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", language: "AZ", stateScore: 353.3 },
  { code: "152433", university: "Qarabağ Universiteti", specialty: "Kimya müəllimliyi", stream: "Ə", language: "AZ", stateScore: 379.3 },
  { code: "152441", university: "Qarabağ Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", stateScore: 496 },
  { code: "152458", university: "Qarabağ Universiteti", specialty: "Biologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", stateScore: 445.3 },
  { code: "152466", university: "Qarabağ Universiteti", specialty: "Kimya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", stateScore: 454.3 },
  { code: "152474", university: "Qarabağ Universiteti", specialty: "Əczaçılıq", stream: "Ə", language: "AZ", stateScore: 562.8 },
  { code: "152482", university: "Qarabağ Universiteti", specialty: "Tibb bacısı (qardaşı) işi", stream: "Ə", language: "AZ", stateScore: 470.8 },
  { code: "152499", university: "Qarabağ Universiteti", specialty: "Stomatologiya", stream: "Ə", language: "AZ", stateScore: 624.3 },
  { code: "152514", university: "Qarabağ Universiteti", specialty: "Tibb", stream: "Ə", language: "AZ", stateScore: 634.2 },
  // ═══ Azərbaycan Kooperasiya Universiteti ═══
  { code: "154467", university: "Azərbaycan Kooperasiya Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 150 },
  // ═══ Qərbi Kaspi Universiteti ═══
  { code: "157578", university: "Qərbi Kaspi Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 469 },
  { code: "157586", university: "Qərbi Kaspi Universiteti", specialty: "Psixologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 200, stateScore: 558.6 },
  { code: "157594", university: "Qərbi Kaspi Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 332.9 },
  { code: "157618", university: "Qərbi Kaspi Universiteti", specialty: "Biologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 407.9, stateScore: 407.9 },
  { code: "157626", university: "Qərbi Kaspi Universiteti", specialty: "Biotexnologiya", stream: "Ə", language: "AZ", score: 250.3 },
  { code: "157634", university: "Qərbi Kaspi Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ", score: 200, stateScore: 244.6 },
  { code: "157642", university: "Qərbi Kaspi Universiteti", specialty: "Su bioehtiyatları və akvakultura", stream: "Ə", language: "AZ", score: 150, stateScore: 158.4 },
  // ═══ Xəzər Universiteti ═══
  { code: "158493", university: "Xəzər Universiteti", specialty: "Biologiya müəllimliyi (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 200, stateScore: 274.5 },
  { code: "158517", university: "Xəzər Universiteti", specialty: "Kimya və biologiya müəllimliyi (tədris Azərbaycan dilində)", stream: "Ə", language: "AZ/RU", score: 200, stateScore: 302 },
  { code: "158525", university: "Xəzər Universiteti", specialty: "Psixologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 402.1, stateScore: 460.6 },
  { code: "158533", university: "Xəzər Universiteti", specialty: "Biotexnologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 569.3, stateScore: 569.3 },
  { code: "158541", university: "Xəzər Universiteti", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "AZ/RU", score: 289.9, stateScore: 289.9 },
  { code: "158558", university: "Xəzər Universiteti", specialty: "Baytarlıq təbabəti (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 373.2, stateScore: 373.2 },
  // ═══ "Odlar Yurdu" Universiteti ═══
  { code: "164487", university: "\"Odlar Yurdu\" Universiteti", specialty: "Psixologiya", stream: "Ə", language: "AZ/RU", score: 200 },
  { code: "164495", university: "\"Odlar Yurdu\" Universiteti", specialty: "Psixologiya (tədris ingilis dilində)", stream: "Ə", language: "AZ/RU", score: 200 },
  { code: "164519", university: "\"Odlar Yurdu\" Universiteti", specialty: "Biologiya", stream: "Ə", language: "AZ/RU", score: 200, stateScore: 334.7 },
  { code: "164527", university: "\"Odlar Yurdu\" Universiteti", specialty: "Ekologiya", stream: "Ə", language: "AZ/RU", score: 242.4, stateScore: 247.5 },
  // ═══ Bakı Dövlət Universiteti ═══
  { code: "112419", university: "Bakı Dövlət Universiteti", specialty: "Biologiya müəllimliyi", stream: "Ə", language: "RU", score: 421.7, stateScore: 421.7 },
  { code: "112451", university: "Bakı Dövlət Universiteti", specialty: "Psixologiya", stream: "Ə", language: "RU", score: 466.2, stateScore: 466.3 },
  { code: "112484", university: "Bakı Dövlət Universiteti", specialty: "Biologiya", stream: "Ə", language: "RU", score: 452, stateScore: 452 },
  { code: "112524", university: "Bakı Dövlət Universiteti", specialty: "Biotexnologiya", stream: "Ə", language: "RU", score: 456.3, stateScore: 578 },
  { code: "112557", university: "Bakı Dövlət Universiteti", specialty: "Ekologiya", stream: "Ə", language: "RU", score: 317.5, stateScore: 324.1 },
  // ═══ Azərbaycan Tibb Universiteti ═══
  { code: "121134", university: "Azərbaycan Tibb Universiteti", specialty: "Əczaçılıq", stream: "Ə", language: "RU", score: 531.1, stateScore: 531.1 },
  { code: "121183", university: "Azərbaycan Tibb Universiteti", specialty: "İctimai səhiyyə", stream: "Ə", language: "RU", score: 561.6, stateScore: 561.6 },
  { code: "121289", university: "Azərbaycan Tibb Universiteti", specialty: "Stomatologiya", stream: "Ə", language: "RU", score: 606.9, stateScore: 611.6 },
  { code: "121312", university: "Azərbaycan Tibb Universiteti", specialty: "Tibb", stream: "Ə", language: "RU", score: 618.2, stateScore: 618.2 },
  // ═══ Azərbaycan Dövlət Pedaqoji Universiteti ═══
  { code: "122341", university: "Azərbaycan Dövlət Pedaqoji Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", language: "RU", score: 364, stateScore: 364 },
  // ═══ Azərbaycan Dövlət İqtisad Universiteti ═══
  { code: "123832", university: "Azərbaycan Dövlət İqtisad Universiteti", specialty: "Ekologiya", stream: "Ə", language: "RU", score: 314.2, stateScore: 318.5 },
  // ═══ Bakı Slavyan Universiteti ═══
  { code: "127648", university: "Bakı Slavyan Universiteti", specialty: "Psixologiya", stream: "Ə", language: "RU", score: 377.7, stateScore: 458.5 },
  // ═══ Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri) ═══
  { code: "144699", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Baytarlıq təbabəti", stream: "Ə", language: "RU", stateScore: 251.4 },
  { code: "144755", university: "Azərbaycan Dövlət Aqrar Universiteti (Gəncə şəhəri)", specialty: "Əczaçılıq", stream: "Ə", language: "RU", score: 200, stateScore: 440.5 },
  // ═══ Gəncə Dövlət Universiteti ═══
  { code: "145573", university: "Gəncə Dövlət Universiteti", specialty: "Kimya və biologiya müəllimliyi", stream: "Ə", language: "RU", score: 200, stateScore: 437.1 },
];
