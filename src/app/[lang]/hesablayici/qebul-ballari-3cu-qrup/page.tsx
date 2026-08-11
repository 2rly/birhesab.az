"use client";

import AdmissionScoreCalculator, { type AdmissionTranslation, type SubgroupOption } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup3 } from "@/data/admissions-group3-2026";

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
];

// Tarix-coğrafiya (TC) altqrupu — DİM rəsmi siyahısı
const TARIX_COGRAFIYA = [
  "Beynəlxalq münasibətlər",
  "Regionşün", // matches "Regionşünaslıq" və "Regionşünashq" (data variant)
];

const SUBGROUPS_G3: SubgroupOption[] = [
  { value: "all", label: "Hamısı", specialties: [] },
  { value: "dt", label: "Dil-tarix (DT)", specialties: DIL_TARIX },
  { value: "tc", label: "Tarix-coğrafiya (TC)", specialties: TARIX_COGRAFIYA },
];

const LOW_BLOCK_SPECIALTIES_G3 = [
  "Muzey, arxiv işi",
  "Sosial iş",
  "Regionşün", // matches both "Regionşünaslıq" and variant "Regionşünashq"
];

const t: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation } = {
  az: {
    title: "3-cü qrup keçid balları 2026",
    description: "DİM balınızı daxil edin — 3-cü qrup (humanitar) üzrə hansı universitet və ixtisaslara qəbul ola biləcəyinizi görün.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Necə işləyir?",
    formulaContent: `Bu hesablayıcı DİM balınızı 2026-cı ilin rəsmi 3-cü qrup keçid balları ilə müqayisə edir.

Əgər balınız keçid balından yuxarıdırsa — qəbul olma şansınız yüksəkdir.
Balınız keçid balına yaxındırsa (±10) — risk zonasındasınız.

Qeyd: Real qəbul zamanı ballar dəyişə bilər. Hesablayıcı keçən ilin nəticələrinə əsasən təxmini qiymətləndirmə verir.`,
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
    title: "3rd Group Passing Scores 2026",
    description: "Enter your exam score — see which universities and humanities specialties you can enter.",
    breadcrumbCategory: "Education",
    formulaTitle: "How does it work?",
    formulaContent: `This calculator compares your score with official 3rd-group passing scores.

If your score is above the passing score — high chance of admission.
If your score is within ±10 points — borderline zone.

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
    title: "Проходные баллы 3-й группы 2026",
    description: "Введите ваш балл — узнайте, в какие гуманитарные специальности 3-й группы можете поступить.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как это работает?",
    formulaContent: `Калькулятор сравнивает ваш балл с официальными проходными баллами 3-й группы.

Если ваш балл выше проходного — высокий шанс поступления.
Если в пределах ±10 баллов — зона риска.

Примечание: Баллы могут измениться. Это приблизительная оценка.`,
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

export default function AdmissionGroup3Page() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsGroup3}
      translations={t}
      subgroups={SUBGROUPS_G3}
      subgroupLabel="İmtahan verdiyiniz altqrup"
      lowBlockSpecialties={LOW_BLOCK_SPECIALTIES_G3}
      relatedIds={["qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "qebul-ballari-4cu-qrup", "gpa"]}
    />
  );
}
