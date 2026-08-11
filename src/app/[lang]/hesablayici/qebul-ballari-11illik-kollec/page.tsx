"use client";

import AdmissionScoreCalculator, { type AdmissionTranslation } from "@/components/AdmissionScoreCalculator";
import { admissionsCollege11 } from "@/data/admissions-college-11-2026";

const t: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation } = {
  az: {
    title: "11-illik kolleclərə keçid balları 2025-2026",
    description: "Tam orta təhsil bazasında (11-illik) — balınızı daxil edin, kolleclərə və ixtisaslara qəbul şansınızı görün.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Necə işləyir?",
    formulaContent: `11 illik tam orta təhsilini bitirənlər üçün kollec ixtisaslarına keçid balları.

Kolleclərdə əsas üstünlük: qısa müddətdə peşə bilikləri + praktik hazırlıq.

Qeyd: 11-illik baza üçün keçid balları 9-illikdən fərqlənir.`,
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
  },
  en: {
    title: "11-year College Passing Scores 2025-2026",
    description: "For graduates of full secondary education (11 years) — check college admission chances.",
    breadcrumbCategory: "Education",
    formulaTitle: "How does it work?",
    formulaContent: `College passing scores for full-secondary (11-year) school graduates.`,
    yourScore: "Your score",
    filterUni: "Filter by college",
    allUniversities: "All colleges",
    searchSpecialty: "Search specialty...",
    guaranteed: "High chance",
    borderline: "Borderline (±10)",
    notEnough: "Score not enough",
    university: "College",
    specialty: "Specialty",
    passingScore: "Passing score",
    difference: "Difference",
    totalFound: "specialties found",
    guaranteedCount: "high chance",
    borderlineCount: "borderline",
    emptyState: "Enter your score (0-300).",
    noResults: "No specialties found.",
    source: "",
    showAll: "Show all",
    showLess: "Show less",
  },
  ru: {
    title: "Проходные баллы в 11-летние колледжи 2025-2026",
    description: "Для выпускников полного среднего (11-летнего) образования — шансы поступления в колледжи.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как это работает?",
    formulaContent: `Проходные баллы колледжей для выпускников 11-летнего образования.`,
    yourScore: "Ваш балл",
    filterUni: "Фильтр по колледжу",
    allUniversities: "Все колледжи",
    searchSpecialty: "Поиск специальности...",
    guaranteed: "Высокий шанс",
    borderline: "Зона риска (±10)",
    notEnough: "Баллов недостаточно",
    university: "Колледж",
    specialty: "Специальность",
    passingScore: "Проходной балл",
    difference: "Разница",
    totalFound: "специальностей найдено",
    guaranteedCount: "высокий шанс",
    borderlineCount: "зона риска",
    emptyState: "Введите свой балл (0-300).",
    noResults: "Специальностей не найдено.",
    source: "",
    showAll: "Показать все",
    showLess: "Свернуть",
  },
};

export default function AdmissionCollege11Page() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsCollege11}
      translations={t}
      scoreMin={0}
      scoreMax={300}
      scorePlaceholder="180"
      relatedIds={["qebul-ballari-9illik-kollec", "qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "gpa"]}
    />
  );
}
