"use client";

import AdmissionScoreCalculator, { type AdmissionTranslation, type SubgroupOption } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup1 } from "@/data/admissions-group1-2026";

// Riyaziyyat-İnformatika (Rİ) altqrupu — 9 ixtisas (DİM rəsmi siyahısı)
const R_INFORMATIKA = [
  "İnformatika müəllimliyi",
  "Riyaziyyat və informatika müəllimliyi",
  "Kompüter elmləri",
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
  "Mühəndis fizikası",
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

const t: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation } = {
  az: {
    title: "1-ci qrup keçid balları 2026",
    description: "DİM balınızı daxil edin — 1-ci qrup üzrə hansı universitetlərə və ixtisaslara qəbul ola biləcəyinizi görün.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Necə işləyir?",
    formulaContent: `Bu hesablayıcı sizin DİM balınızı 2026-cı ilin rəsmi keçid balları ilə müqayisə edir.

Əgər balınız keçid balından yuxarıdırsa — həmin ixtisasa qəbul olma şansınız var.
Balınız keçid balına yaxındırsa — riskli zonadadır.

Qeyd: Real qəbul zamanı ballar dəyişə bilər. Bu hesablayıcı keçən ilin nəticələrinə əsasən təxmini qiymətləndirmə verir.`,
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
  },
  en: {
    title: "1st Group Passing Scores 2026",
    description: "Enter your exam score — see which universities and specialties you can get into.",
    breadcrumbCategory: "Education",
    formulaTitle: "How does it work?",
    formulaContent: `This calculator compares your score with official passing scores.

If your score is above the passing score — high chance of admission.
If your score is close — borderline zone.

Note: Actual scores may change. This is an estimate based on last year's results.`,
    yourScore: "Your exam score",
    filterUni: "Filter by university",
    allUniversities: "All universities",
    searchSpecialty: "Search specialty...",
    guaranteed: "High chance of admission",
    borderline: "Borderline (±10 points)",
    notEnough: "Score not enough",
    university: "University",
    specialty: "Specialty",
    passingScore: "Passing score",
    difference: "Difference",
    totalFound: "specialties found",
    guaranteedCount: "high chance",
    borderlineCount: "borderline",
    emptyState: "Enter your exam score (100-700).",
    noResults: "No specialties found for this score.",
    source: "",
    showAll: "Show all",
    showLess: "Show less",
  },
  ru: {
    title: "Проходные баллы 1-й группы 2026",
    description: "Введите свой балл — узнайте, в какие университеты и на какие специальности можете поступить.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как это работает?",
    formulaContent: `Калькулятор сравнивает ваш балл с официальными проходными баллами.

Если ваш балл выше проходного — высокий шанс поступления.
Если ваш балл близок — зона риска.

Примечание: Фактические баллы могут измениться. Это приблизительная оценка.`,
    yourScore: "Ваш балл",
    filterUni: "Фильтр по университету",
    allUniversities: "Все университеты",
    searchSpecialty: "Поиск специальности...",
    guaranteed: "Высокий шанс поступления",
    borderline: "Зона риска (±10 баллов)",
    notEnough: "Баллов недостаточно",
    university: "Университет",
    specialty: "Специальность",
    passingScore: "Проходной балл",
    difference: "Разница",
    totalFound: "специальностей найдено",
    guaranteedCount: "высокий шанс",
    borderlineCount: "зона риска",
    emptyState: "Введите свой балл (100-700).",
    noResults: "Специальностей для этого балла не найдено.",
    source: "",
    showAll: "Показать все",
    showLess: "Свернуть",
  },
};

export default function AdmissionGroup1Page() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsGroup1}
      translations={t}
      subgroups={SUBGROUPS_G1}
      subgroupLabel="İmtahan verdiyiniz altqrup"
      lowBlockSpecialties={LOW_BLOCK_SPECIALTIES_G1}
      relatedIds={["qebul-ballari-2ci-qrup", "qebul-ballari-3cu-qrup", "qebul-ballari-4cu-qrup", "gpa"]}
    />
  );
}
