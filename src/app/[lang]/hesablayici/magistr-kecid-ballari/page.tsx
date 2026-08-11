"use client";

import AdmissionScoreCalculator, { type AdmissionTranslation, type SubgroupOption } from "@/components/AdmissionScoreCalculator";
import { admissionsMagistr2027 } from "@/data/admissions-magistr-2027";
import { magistrPrograms } from "@/data/magistr-programs-2025";
import { bachelorToMagistr } from "@/data/magistr-bachelor-map";

const SUBGROUPS_MAGISTR: SubgroupOption[] = [
  { value: "all", label: "Hamısı (MBA-sız)", specialties: [], excludeTags: ["mba"] },
  { value: "mba", label: "Yalnız MBA", specialties: [], tag: "mba" },
];

const t: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation } = {
  az: {
    title: "Magistr keçid balları 2026",
    description: "Magistratura balınızı daxil edin — hansı magistr proqramlarına qəbul ola biləcəyinizi görün. Qeyd: 2027-ci il magistr ixtisas seçimi 2026 keçid ballarına əsasən aparılır.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Necə işləyir?",
    formulaContent: `Magistratura imtahan balınızı (0-100 şkalasında) 2026-cı il üzrə rəsmi keçid balları ilə müqayisə edir.

Qeyd: 2027-ci il magistr ixtisas seçimi 2026 keçid ballarına əsasən aparılır.

Balınız ≥5 yuxarıdırsa — şansınız yüksəkdir.
±5 aralığında — risk zonasındasınız.

Hər sətirdə ixtisasın DİM kodu göstərilir — axtarış xanasına kodu yazaraq da ixtisas tapa bilərsiniz.
Ödənişli və dövlət sifarişli ballar ayrı sütunlarda verilib; "—" işarəsi həmin forma üzrə plan olmadığını bildirir.

Qeyd: Magistr qəbulu zamanı bakalavr diplomunun orta balı da nəzərə alınır.`,
    yourScore: "Magistr balınız (0-100)",
    filterUni: "Universitet üzrə süz",
    allUniversities: "Bütün universitetlər",
    searchSpecialty: "İxtisas axtar...",
    guaranteed: "Şans yüksək",
    borderline: "Risk zonası (±5 bal)",
    notEnough: "Bal kifayət deyil",
    university: "Universitet",
    specialty: "İxtisas",
    passingScore: "Keçid balı",
    difference: "Fərq",
    totalFound: "proqram tapıldı",
    guaranteedCount: "şans yüksək",
    borderlineCount: "riskli",
    emptyState: "Magistr balınızı daxil edin (0-100 aralığında).",
    noResults: "Bu bala uyğun proqram tapılmadı.",
    source: "",
    showAll: "Hamısını göstər",
    showLess: "Azalt",
  },
  en: {
    title: "Master's (Magistratura) Passing Scores 2026",
    description: "Enter your master's exam score — see which programs you can enter. Note: 2027 master's specialty selection is based on the 2026 passing scores.",
    breadcrumbCategory: "Education",
    formulaTitle: "How does it work?",
    formulaContent: `Compares your master's exam score (0-100 scale) with official passing scores.

Score ≥5 above passing — high chance.
Within ±5 — borderline zone.

Note: Bachelor's GPA is also considered during master's admission.`,
    yourScore: "Your master's score (0-100)",
    filterUni: "Filter by university",
    allUniversities: "All universities",
    searchSpecialty: "Search program...",
    guaranteed: "High chance",
    borderline: "Borderline (±5 points)",
    notEnough: "Score not enough",
    university: "University",
    specialty: "Program",
    passingScore: "Passing score",
    difference: "Difference",
    totalFound: "programs found",
    guaranteedCount: "high chance",
    borderlineCount: "borderline",
    emptyState: "Enter your master's score (0-100).",
    noResults: "No programs found.",
    source: "",
    showAll: "Show all",
    showLess: "Show less",
  },
  ru: {
    title: "Проходные баллы магистратуры 2026",
    description: "Введите балл магистратуры — узнайте, в какие программы можете поступить. Примечание: выбор специальности магистратуры на 2027 год проводится на основе проходных баллов 2026 года.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как это работает?",
    formulaContent: `Сравнивает ваш балл (шкала 0-100) с официальными проходными баллами.

Балл ≥5 выше — высокий шанс.
В пределах ±5 — зона риска.`,
    yourScore: "Ваш балл (0-100)",
    filterUni: "Фильтр по университету",
    allUniversities: "Все университеты",
    searchSpecialty: "Поиск программы...",
    guaranteed: "Высокий шанс",
    borderline: "Зона риска (±5 баллов)",
    notEnough: "Баллов недостаточно",
    university: "Университет",
    specialty: "Программа",
    passingScore: "Проходной балл",
    difference: "Разница",
    totalFound: "программ найдено",
    guaranteedCount: "высокий шанс",
    borderlineCount: "зона риска",
    emptyState: "Введите балл (0-100).",
    noResults: "Программ не найдено.",
    source: "",
    showAll: "Показать все",
    showLess: "Свернуть",
  },
};

export default function AdmissionMagistrPage() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsMagistr2027}
      translations={t}
      subgroups={SUBGROUPS_MAGISTR}
      subgroupLabel="Proqram tipi"
      programGroups={magistrPrograms}
      programGroupsLabel="Proqram nömrəsini seçin"
      showSpecialtySelector
      specialtySelectorLabel="Konkret ixtisas seçin"
      specialtySelectorAllLabel="Bütün ixtisaslar"
      scoreMin={0}
      scoreMax={100}
      scorePlaceholder="55"
      borderlineRange={5}
      bachelorMap={bachelorToMagistr}
      bachelorMapLabel="Bakalavr ixtisasınız"
      bachelorMapPlaceholder="Bakalavr ixtisasınızı yazın..."
      relatedIds={["qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "gpa", "xaricde-tehsil"]}
    />
  );
}
