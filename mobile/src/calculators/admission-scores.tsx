// Qəbul balları — I-V qrup, 9-illik və 11-illik kolleclər.
// Saytdakı qebul-ballari-* səhifələrinin (AdmissionScoreCalculator) mobil portu.
// Qrup route slug-una görə seçilir.

import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";

import {
  AdmissionScoreEngine,
  type AdmissionEngineProps,
  type AdmissionEntry,
  type AdmissionTranslation,
  type SubgroupOption,
} from "./_admission-parts";

import { admissionsGroup1 } from "@/data/admissions-group1-2026";
import { admissionsGroup2 } from "@/data/admissions-group2-2026";
import { admissionsGroup3 } from "@/data/admissions-group3-2026";
import { admissionsGroup4 } from "@/data/admissions-group4-2026";
import { admissionsGroup5 } from "@/data/admissions-group5-2026";
import { admissionsCollege9 } from "@/data/admissions-college-9-2026";
import { admissionsCollege11 } from "@/data/admissions-college-11-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup1 } from "@/data/admissions-plan-2026-group1";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";
import { planGroup3 } from "@/data/admissions-plan-2026-group3";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";

// ── Ümumi tərcümə sahələri (bütün qrup səhifələrində eynidir) ────────────────

const COMMON_UNI = {
  breadcrumbCategory: "Təhsil",
  formulaTitle: "Necə işləyir?",
  yourScore: "DİM balınız",
  filterUni: "Universitet üzrə süz",
  allUniversities: "Bütün universitetlər",
  searchSpecialty: "İxtisas axtar...",
  guaranteed: "Qəbul olunma şansı yüksək",
  borderline: "Risk zonası (±10 bal)",
  notEnough: "Bal kifayət deyil",
  university: "Universitet",
  specialty: "İxtisas",
  passingScore: "Keçid balı",
  difference: "Fərq",
  totalFound: "ixtisas tapıldı",
  guaranteedCount: "şans yüksək",
  borderlineCount: "riskli",
  emptyState: "DİM balınızı daxil edin (100-700 aralığında).",
  noResults: "Bu bala uyğun ixtisas tapılmadı.",
  source: "",
  showAll: "Hamısını göstər",
  showLess: "Azalt",
};

const COMMON_COLLEGE = {
  breadcrumbCategory: "Təhsil",
  formulaTitle: "Necə işləyir?",
  yourScore: "Balınız",
  filterUni: "Kollec üzrə süz",
  allUniversities: "Bütün kolleclər",
  searchSpecialty: "İxtisas axtar...",
  guaranteed: "Qəbul şansı yüksək",
  borderline: "Risk zonası (±10 bal)",
  notEnough: "Bal kifayət deyil",
  university: "Kollec",
  specialty: "İxtisas",
  passingScore: "Keçid balı",
  difference: "Fərq",
  totalFound: "ixtisas tapıldı",
  guaranteedCount: "şans yüksək",
  borderlineCount: "riskli",
  emptyState: "Balınızı daxil edin (0-300 aralığında).",
  noResults: "Bu bala uyğun ixtisas tapılmadı.",
  source: "",
  showAll: "Hamısını göstər",
  showLess: "Azalt",
};

// ── I qrup ────────────────────────────────────────────────────────────────────

// Riyaziyyat-İnformatika (Rİ) altqrupu — DİM rəsmi siyahısı
const R_INFORMATIKA = [
  "İnformatika (rəqəmsal bacarıqlar) müəllimliyi",
  "Riyaziyyat və informatika (rəqəmsal bacarıqlar) müəllimliyi",
  "Kompüter elmləri",
  "Data analitikası",
  "Proqram təminatı mühəndisliyi",
  "İnformasiya təhlükəsizliyi",
  "İnformasiya texnologiyaları",
  "Kompüter mühəndisliyi",
  "Mexatronika və robototexnika mühəndisliyi",
  "Proseslərin avtomatlaşdırılması mühəndisliyi",
  "Sistemlər mühəndisliyi",
];

// Riyaziyyat-Kimya (RK) altqrupu — 55 ixtisas (DİM rəsmi siyahısı)
const R_KIMYA = [
  "Fizika müəllimliyi",
  "Riyaziyyat müəllimliyi",
  "Texnologiya müəllimliyi",
  "Fizika",
  "Geologiya",
  "Mexanika",
  "Riyaziyyat",
  "Aerokosmik mühəndislik",
  "Aqromühəndislik",
  "Aviasiya təhlükəsizliyi mühəndisliyi",
  "Cihaz mühəndisliyi",
  "Dəniz naviqasiyası mühəndisliyi",
  "Ekologiya mühəndisliyi",
  "Elektrik və elektronika mühəndisliyi",
  "Energetika mühəndisliyi",
  "Gəmi energetik qurğularının istismarı mühəndisliyi",
  "Gəmiqayırma və gəmi təmiri mühəndisliyi",
  "Geologiya və geofizika mühəndisliyi",
  "Geomatika və geodeziya mühəndisliyi",
  "Hava nəqliyyatının hərəkətinin təşkili",
  "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi",
  "İnşaat mühəndisliyi",
  "Kimya mühəndisliyi",
  "Kommunikasiya sistemləri mühəndisliyi",
  "Logistika və nəqliyyat texnologiyaları mühəndisliyi",
  "Maşın mühəndisliyi",
  "Materiallar mühəndisliyi",
  "Mədən mühəndisliyi",
  "Meliorasiya mühəndisliyi",
  "Memarlıq",
  "Metallurgiya mühəndisliyi",
  "Mexanika mühəndisliyi",
  "Mühəndislik fizikası",
  "Neft-qaz mühəndisliyi",
  "Nəqliyyat mühəndisliyi",
  "Nəqliyyat tikintisi mühəndisliyi",
  "Qida mühəndisliyi",
  "Radiotexnika və telekommunikasiya mühəndisliyi",
  "Şəhərsalma",
  "Sənaye mühəndisliyi",
  "Uçuş mühəndisliyi",
  "Yanğın təhlükəsizliyi mühəndisliyi",
  "Aqronomluq",
  "Balıqçılıq",
  "Meşəçilik",
  "Şərabçılıq",
  "Torpaqşünaslıq və aqrokimya",
  "Yerquruluşu və daşınmaz əmlakın kadastrı",
  "Zoomühəndislik",
  "Daşınmaz əmlakın idarə olunması",
  "Heyvandarlıq",
  "Kənd təsərrüfatı texnologiyaları",
  "Qida texnologiyaları",
  "Silah sistemləri mühəndisliyi",
  "Xüsusi rabitə vasitələri mühəndisliyi",
];

const SUBGROUPS_G1: SubgroupOption[] = [
  { value: "all", label: "Hamısı", specialties: [] },
  { value: "rk", label: "Riyaziyyat-Kimya (RK)", specialties: R_KIMYA },
  { value: "ri", label: "Riyaziyyat-İnformatika (Rİ)", specialties: R_INFORMATIKA },
];

const LOW_BLOCK_SPECIALTIES_G1 = [
  "Meliorasiya mühəndisliyi",
  "Texnologiya müəllimliyi",
  "Ekologiya mühəndisliyi",
  "Aqronomluq",
  "Balıqçılıq",
  "Meşəçilik",
  "Şərabçılıq",
  "Torpaqşünaslıq və aqrokimya",
  "Yerquruluşu və daşınmaz əmlakın kadastrı",
  "Zoomühəndislik",
];

const T_G1: AdmissionTranslation = {
  ...COMMON_UNI,
  title: "1-ci qrup keçid balları 2026-2027",
  description: "DİM balınızı daxil edin — 1-ci qrup üzrə hansı universitetlərə və ixtisaslara qəbul ola biləcəyinizi görün.",
  formulaContent: `Bu hesablayıcı sizin DİM balınızı I ixtisas qrupu üzrə 2026/2027 qəbulunun rəsmi keçid balları ilə müqayisə edir.

Hər ixtisas üzrə iki bal göstərilir:
• Dövlət sifarişli (ödənişsiz) yer — təhsil haqqını dövlət ödəyir, keçid balı yüksəkdir
• Ödənişli yer — eyni ixtisas, daha aşağı keçid balı

Əgər balınız keçid balından yuxarıdırsa — həmin ixtisasa qəbul olma şansınız var.
Balınız keçid balına yaxındırsa — riskli zonadadır.

"—" işarəsi həmin formada yer ayrılmadığını bildirir. Hər sətirdə ixtisas kodu, ayrılan plan yeri və tədris dili (AZ · RU · AZ/RU) da göstərilir.

Subbakalavr pilləsinin balları ayrıca "Subbakalavr keçid balları" bölməsindədir — orada şkala 0-100-dür.

Qeyd: Real qəbul zamanı ballar dəyişə bilər. Bu hesablayıcı keçən ilin nəticələrinə əsasən təxmini qiymətləndirmə verir.`,
};

// ── II qrup ───────────────────────────────────────────────────────────────────

const LOW_BLOCK_SPECIALTIES_G2 = [
  "Marketinq",
  "Biznesin idarə edilməsi",
  "Turizm bələdçiliyi",
  "Turizm işinin təşkili",
];

const T_G2: AdmissionTranslation = {
  ...COMMON_UNI,
  title: "2-ci qrup keçid balları 2026-2027",
  description: "DİM balınızı daxil edin — 2-ci qrup üzrə hansı universitetlərə və ixtisaslara qəbul ola biləcəyinizi görün.",
  formulaContent: `Bu hesablayıcı sizin DİM balınızı II ixtisas qrupu üzrə 2026/2027 qəbulunun rəsmi keçid balları ilə müqayisə edir.

Hər ixtisas üzrə iki bal göstərilir:
• Dövlət sifarişli (ödənişsiz) yer — təhsil haqqını dövlət ödəyir, keçid balı yüksəkdir
• Ödənişli yer — eyni ixtisas, daha aşağı keçid balı

Əgər balınız keçid balından yuxarıdırsa — həmin ixtisasa qəbul olma şansınız var.
Balınız keçid balına yaxındırsa — riskli zonadadır.

"—" işarəsi həmin formada yer ayrılmadığını bildirir. Hər sətirdə ixtisas kodu, ayrılan plan yeri, əyani/qiyabi forma (Q) və tədris dili (AZ · RU · AZ/RU) da göstərilir.

Subbakalavr pilləsinin balları ayrıca "Subbakalavr keçid balları" bölməsindədir — orada şkala 0-100-dür.

Qeyd: Real qəbul zamanı ballar dəyişə bilər.`,
};

// ── III qrup ──────────────────────────────────────────────────────────────────

// Dil-tarix (DT) altqrupu — DİM rəsmi siyahısı
const DIL_TARIX = [
  "Azərbaycan dili və ədəbiyyatı müəllimliyi",
  "Dil və ədəbiyyat müəllimliyi",
  "İbtidai sinif müəllimliyi",
  "Korreksiyaedici təlim",
  "Xüsusi pedaqogika",
  "Məktəbəqədər təhsil",
  "Tarix müəllimliyi",
  "Təhsildə sosial-psixoloji xidmət",
  "Xarici dil müəllimliyi",
  "Dinşünaslıq",
  "Dövlət və ictimai münasibətlər",
  "Fəlsəfə",
  "Filologiya",
  "Hüquqşünaslıq",
  "İslamşünaslıq",
  "Jurnalistika",
  "Kitabxanaçılıq və informasiya fəaliyyəti",
  "Politologiya",
  "Tarix",
  "Tərcümə",
  "Bədii yaradıcılıq və ekran dramaturgiyası",
  "Ədəbi yaradıcılıq və ekran dramaturgiyası",
  "Muzey, arxiv işi və abidələrin qorunması",
  "Sənətşünaslıq",
  "Sosial iş",
  "İctimai təhlükəsizlik və idarəetmə",
  "Kommunikasiya və rəqəmsal media",
];

// Tarix-coğrafiya (TC) altqrupu — DİM rəsmi siyahısı
const TARIX_COGRAFIYA = [
  "Beynəlxalq münasibətlər",
  "Regionşün", // "Regionşünaslıq" və "Regionşünashq" (data variantı)
];

const SUBGROUPS_G3: SubgroupOption[] = [
  { value: "all", label: "Hamısı", specialties: [] },
  { value: "dt", label: "Dil-tarix (DT)", specialties: DIL_TARIX },
  { value: "tc", label: "Tarix-coğrafiya (TC)", specialties: TARIX_COGRAFIYA },
];

const LOW_BLOCK_SPECIALTIES_G3 = ["Muzey, arxiv işi", "Sosial iş", "Regionşün"];

const T_G3: AdmissionTranslation = {
  ...COMMON_UNI,
  title: "3-cü qrup keçid balları 2026-2027",
  description: "DİM balınızı daxil edin — 3-cü qrup (humanitar) üzrə hansı universitet və ixtisaslara qəbul ola biləcəyinizi görün.",
  formulaContent: `Bu hesablayıcı DİM balınızı III ixtisas qrupu üzrə 2026/2027 qəbulunun rəsmi keçid balları ilə müqayisə edir.

Hər ixtisas üzrə iki bal göstərilir:
• Dövlət sifarişli (ödənişsiz) yer — təhsil haqqını dövlət ödəyir, keçid balı yüksəkdir
• Ödənişli yer — eyni ixtisas, daha aşağı keçid balı

Əgər balınız keçid balından yuxarıdırsa — qəbul olma şansınız yüksəkdir.
Balınız keçid balına yaxındırsa (±10) — risk zonasındasınız.

"—" işarəsi həmin formada yer ayrılmadığını, "Qabiliyyət" nişanı isə əlavə qabiliyyət imtahanı tələb olunduğunu bildirir (Jurnalistika). Hər sətirdə ixtisas kodu, ayrılan plan yeri, əyani/qiyabi forma (Q) və tədris dili (AZ · RU · AZ/RU) da göstərilir.

Qeyd: III qrupda bu il subbakalavr qəbulu aparılmayıb. Real qəbul zamanı ballar dəyişə bilər.`,
};

// ── IV qrup ───────────────────────────────────────────────────────────────────

const LOW_BLOCK_SPECIALTIES_G4 = [
  "Ekologiya",
  "Bağçılıq və tərəvəzçilik",
  "Baytarlıq təbabəti",
  "Bitki mühafizəsi",
  "Su bioehtiyatları və akvakultura",
];

const T_G4: AdmissionTranslation = {
  ...COMMON_UNI,
  title: "4-cü qrup keçid balları 2026-2027",
  description: "DİM balınızı daxil edin — 4-cü qrup (biologiya, kimya, tibb) üzrə ixtisaslara qəbul şansınızı yoxlayın.",
  formulaContent: `IV ixtisas qrupu 2026/2027 qəbulu — biologiya, kimya, tibb, əczaçılıq, psixologiya və əlaqəli ixtisaslar.

Hər ixtisas üzrə iki bal göstərilir:
• Dövlət sifarişli (ödənişsiz) yer — təhsil haqqını dövlət ödəyir, keçid balı yüksəkdir
• Ödənişli yer — eyni ixtisas, daha aşağı keçid balı

Balınız keçid balından ≥10 yuxarıdırsa — şansınız yüksəkdir.
±10 aralığında — risk zonasındasınız.

"—" işarəsi həmin formada yer ayrılmadığını bildirir. Hər sətirdə ixtisas kodu, ayrılan plan yeri, əyani/qiyabi forma (Q) və tədris dili (AZ · RU · AZ/RU) da göstərilir.

Subbakalavr pilləsinin balları ayrıca "Subbakalavr keçid balları" bölməsindədir — orada şkala 0-100-dür.

Qeyd: Tibb universitetlərində reytinq ballar hər il dəyişir.`,
};

// ── V qrup ────────────────────────────────────────────────────────────────────

const T_G5: AdmissionTranslation = {
  ...COMMON_UNI,
  title: "5-ci qrup keçid balları 2026-2027",
  description: "DİM balınızı daxil edin — 5-ci qrup (dizayn, incəsənət, fiziki tərbiyə) ixtisaslarına qəbul şansınızı yoxlayın.",
  formulaContent: `V ixtisas qrupu 2026/2027 qəbulu — dizayn, təsviri incəsənət, musiqi, aktyorluq, xoreoqrafiya və fiziki tərbiyə ixtisasları.

Hər ixtisas üzrə iki bal göstərilir: dövlət sifarişli (ödənişsiz) və ödənişli yer. "—" işarəsi həmin formada yer ayrılmadığını bildirir.

⚠️ Vacib: 5-ci qrupun əksər ixtisasları QABILIYYƏT imtahanı tələb edir. Bu cür ixtisasların yanında 🎨 Qab: N+ nişanı göstərilir — "N" qabiliyyət imtahanından minimum keçid balıdır.

Format:
• Yalnız DİM balı (məs. 156.3) — qabiliyyət imtahanı tələb olunmur.
• Qab: 6+ / DİM 155.1 — qabiliyyət imtahanından ≥6 bal + DİM balı ≥155.1 lazımdır.

Hesablayıcı yalnız DİM balınızı müqayisə edir. Qabiliyyət tələb edən ixtisaslarda həm də qabiliyyət imtahanından minimum balı keçməlisiniz.`,
  guaranteed: "Şans yüksək",
  emptyState: "DİM balınızı daxil edin (0-300 aralığında).",
};

// ── 9-illik kollec ────────────────────────────────────────────────────────────

const T_C9: AdmissionTranslation = {
  ...COMMON_COLLEGE,
  title: "9-illik kollec balları 2026-2027",
  description: "Əsas təhsil bazasında (9-illik) — balınızı daxil edin, kolleclərə qəbul şansınızı yoxlayın.",
  formulaContent: `9 illik əsas təhsili bitirənlər üçün kollec ixtisaslarına 2026/2027 qəbulunun keçid balları.

Hər ixtisas üzrə iki bal göstərilir:
• Dövlət sifarişli (ödənişsiz) yer — təhsil haqqını dövlət ödəyir, keçid balı yüksəkdir
• Ödənişli yer — eyni ixtisas, daha aşağı keçid balı

Hər balın altında həmin yerin ixtisas kodu verilir. Dövlət sifarişli və ödənişli yerlərin kodları FƏRQLİDİR — ixtisas seçimi ərizəsinə hansı yerə iddia edirsinizsə, onun kodunu yazmalısınız.

"—" işarəsi həmin formada yer ayrılmadığını, "Qabiliyyət" nişanı isə əlavə qabiliyyət imtahanı tələb olunduğunu bildirir. Tədris dili nişanı (AZ · RU · AZ/RU) ixtisasın hansı bölmə üzrə olduğunu göstərir — musiqi, rəssamlıq və bəzi qabiliyyət ixtisaslarında müsabiqə hər iki bölmə üçün birgə aparılır.

Qeyd: 9-illik baza üçün keçid balları 11-illikdən fərqlənir — eyni ixtisasda ballar adətən daha aşağı olur.`,
};

// ── 11-illik kollec ───────────────────────────────────────────────────────────

const T_C11: AdmissionTranslation = {
  ...COMMON_COLLEGE,
  title: "11-illik kolleclərə keçid balları 2025-2026",
  description: "Tam orta təhsil bazasında (11-illik) — balınızı daxil edin, kolleclərə və ixtisaslara qəbul şansınızı görün.",
  formulaContent: `11 illik tam orta təhsilini bitirənlər üçün kollec ixtisaslarına 2025-ci il qəbulunun keçid balları.

Hər ixtisas üzrə iki bal göstərilir:
• Dövlət sifarişli (ödənişsiz) yer — təhsil haqqını dövlət ödəyir, keçid balı yüksəkdir
• Ödənişli yer — eyni ixtisas, daha aşağı keçid balı

Hər balın altında həmin yerin 2026 ixtisas kodu və bu il ayrılmış plan yerlərinin sayı verilir. Dövlət sifarişli və ödənişli yerlərin kodları FƏRQLİDİR — ixtisas seçimi ərizəsinə hansı yerə iddia edirsinizsə, onun kodunu yazmalısınız.

"—" işarəsi həmin formada yer ayrılmadığını, "Qabiliyyət" nişanı isə əlavə qabiliyyət imtahanı tələb olunduğunu bildirir.

Qeyd: 11-illik baza üçün keçid balları 9-illikdən fərqlənir. Bütün kodların tam siyahısı üçün "11-illik kollec ixtisas kodları 2026" bölməsinə baxın.`,
};

// ── Slug → səhifə konfiqurasiyası ─────────────────────────────────────────────

type PageConfig = Omit<AdmissionEngineProps, "entries" | "slug"> & { getEntries: () => AdmissionEntry[] };

const PAGES: Record<string, PageConfig> = {
  "qebul-ballari-1ci-qrup": {
    // Bal siyahısına 2026 planından kod, yer sayı və tədris dili qoşulur.
    getEntries: () => attachPlan(admissionsGroup1, planGroup1),
    t: T_G1,
    subgroups: SUBGROUPS_G1,
    subgroupLabel: "İmtahan verdiyiniz altqrup",
    lowBlockSpecialties: LOW_BLOCK_SPECIALTIES_G1,
    relatedIds: ["qebul-ballari-2ci-qrup", "qebul-ballari-3cu-qrup", "qebul-ballari-4cu-qrup", "gpa"],
  },
  "qebul-ballari-2ci-qrup": {
    getEntries: () => attachPlan(admissionsGroup2, planGroup2),
    t: T_G2,
    lowBlockSpecialties: LOW_BLOCK_SPECIALTIES_G2,
    relatedIds: ["qebul-ballari-1ci-qrup", "qebul-ballari-3cu-qrup", "qebul-ballari-4cu-qrup", "gpa"],
  },
  "qebul-ballari-3cu-qrup": {
    getEntries: () => attachPlan(admissionsGroup3, planGroup3),
    t: T_G3,
    subgroups: SUBGROUPS_G3,
    subgroupLabel: "İmtahan verdiyiniz altqrup",
    lowBlockSpecialties: LOW_BLOCK_SPECIALTIES_G3,
    relatedIds: ["qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "qebul-ballari-4cu-qrup", "gpa"],
  },
  "qebul-ballari-4cu-qrup": {
    getEntries: () => attachPlan(admissionsGroup4, planGroup4),
    t: T_G4,
    lowBlockSpecialties: LOW_BLOCK_SPECIALTIES_G4,
    relatedIds: ["qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "qebul-ballari-3cu-qrup", "gpa"],
  },
  "qebul-ballari-5ci-qrup": {
    getEntries: () => admissionsGroup5,
    t: T_G5,
    scoreMin: 0,
    scoreMax: 300,
    scorePlaceholder: "180",
    relatedIds: ["qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "qebul-ballari-3cu-qrup", "gpa"],
  },
  "qebul-ballari-9illik-kollec": {
    getEntries: () => admissionsCollege9,
    t: T_C9,
    scoreMin: 0,
    scoreMax: 300,
    scorePlaceholder: "140",
    fundingCodes: true,
    relatedIds: ["admission-college11", "college-admission-codes", "admission-group1", "gpa"],
  },
  "qebul-ballari-11illik-kollec": {
    getEntries: () => admissionsCollege11,
    t: T_C11,
    scoreMin: 0,
    scoreMax: 300,
    scorePlaceholder: "180",
    fundingCodes: true,
    relatedIds: ["college-admission-codes", "qebul-ballari-9illik-kollec", "qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "gpa"],
  },
};

const DEFAULT_SLUG = "qebul-ballari-1ci-qrup";

export function AdmissionScoresCalculator() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const key = slug && PAGES[slug] ? slug : DEFAULT_SLUG;
  const { getEntries, ...config } = PAGES[key];
  // getEntries modul səviyyəli sabitdir — hər slug üçün bir dəfə hesablanır.
  const entries = useMemo(() => getEntries(), [getEntries]);

  // key — slug dəyişəndə bütün daxili state sıfırlansın.
  return <AdmissionScoreEngine key={key} slug={key} entries={entries} {...config} />;
}
