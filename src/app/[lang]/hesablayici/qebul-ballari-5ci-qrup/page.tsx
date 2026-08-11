"use client";

import AdmissionScoreCalculator, { type AdmissionTranslation } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup5 } from "@/data/admissions-group5-2026";

const t: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation } = {
  az: {
    title: "5-ci qrup keçid balları 2026",
    description: "DİM balınızı daxil edin — 5-ci qrup (dizayn, incəsənət, fiziki tərbiyə) ixtisaslarına qəbul şansınızı yoxlayın.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Necə işləyir?",
    formulaContent: `5-ci qrup dizayn, təsviri incəsənət, musiqi, aktyorluq və fiziki tərbiyə ixtisaslarını əhatə edir.

⚠️ Vacib: 5-ci qrupun əksər ixtisasları QABILIYYƏT imtahanı tələb edir. Bu cür ixtisasların yanında 🎨 Qab: N+ nişanı göstərilir — "N" qabiliyyət imtahanından minimum keçid balıdır.

Format:
• Yalnız DİM balı (məs. 156.3) — qabiliyyət imtahanı tələb olunmur.
• Qab: 6+ / DİM 155.1 — qabiliyyət imtahanından ≥6 bal + DİM balı ≥155.1 lazımdır.

Hesablayıcı yalnız DİM balınızı müqayisə edir. Qabiliyyət tələb edən ixtisaslarda həm də qabiliyyət imtahanından minimum balı keçməlisiniz.`,
    yourScore: "DİM balınız",
    filterUni: "Universitet üzrə süz",
    allUniversities: "Bütün universitetlər",
    searchSpecialty: "İxtisas axtar...",
    guaranteed: "Şans yüksək",
    borderline: "Risk zonası (±10 bal)",
    notEnough: "Bal kifayət deyil",
    university: "Universitet",
    specialty: "İxtisas",
    passingScore: "Keçid balı",
    difference: "Fərq",
    totalFound: "ixtisas tapıldı",
    guaranteedCount: "şans yüksək",
    borderlineCount: "riskli",
    emptyState: "DİM balınızı daxil edin (0-300 aralığında).",
    noResults: "Bu bala uyğun ixtisas tapılmadı.",
    source: "",
    showAll: "Hamısını göstər",
    showLess: "Azalt",
  },
  en: {
    title: "5th Group Passing Scores 2026",
    description: "Check your admission chances for design, arts and physical education specialties.",
    breadcrumbCategory: "Education",
    formulaTitle: "How does it work?",
    formulaContent: `Group 5 covers design, fine arts, music and physical education specialties. These often require an aptitude exam in addition to the standard entrance score.

Note: This is an approximate comparison — actual admission requires the aptitude exam.`,
    yourScore: "Your exam score",
    filterUni: "Filter by university",
    allUniversities: "All universities",
    searchSpecialty: "Search specialty...",
    guaranteed: "High chance",
    borderline: "Borderline (±10 points)",
    notEnough: "Score not enough",
    university: "University",
    specialty: "Specialty",
    passingScore: "Passing score",
    difference: "Difference",
    totalFound: "specialties found",
    guaranteedCount: "high chance",
    borderlineCount: "borderline",
    emptyState: "Enter your exam score (0-300).",
    noResults: "No specialties found.",
    source: "",
    showAll: "Show all",
    showLess: "Show less",
  },
  ru: {
    title: "Проходные баллы 5-й группы 2026",
    description: "Проверьте шансы поступления на специальности дизайна, искусства и физического воспитания.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как это работает?",
    formulaContent: `5-я группа включает дизайн, изобразительное искусство, музыку и физическое воспитание. Часто требуется экзамен по способностям.

Примечание: Это приблизительное сравнение.`,
    yourScore: "Ваш балл",
    filterUni: "Фильтр по университету",
    allUniversities: "Все университеты",
    searchSpecialty: "Поиск специальности...",
    guaranteed: "Высокий шанс",
    borderline: "Зона риска (±10 баллов)",
    notEnough: "Баллов недостаточно",
    university: "Университет",
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

export default function AdmissionGroup5Page() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsGroup5}
      translations={t}
      scoreMin={0}
      scoreMax={300}
      scorePlaceholder="180"
      relatedIds={["qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "qebul-ballari-3cu-qrup", "gpa"]}
    />
  );
}
