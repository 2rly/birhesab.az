"use client";

import AdmissionScoreCalculator, { type AdmissionTranslation } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup4 } from "@/data/admissions-group4-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";

const LOW_BLOCK_SPECIALTIES_G4 = [
  "Ekologiya",
  "Bağçılıq və tərəvəzçilik",
  "Baytarlıq təbabəti",
  "Bitki mühafizəsi",
  "Su bioehtiyatları və akvakultura",
];

const t: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation } = {
  az: {
    title: "4-cü qrup keçid balları 2026",
    description: "DİM balınızı daxil edin — 4-cü qrup (biologiya, kimya, tibb) üzrə ixtisaslara qəbul şansınızı yoxlayın.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Necə işləyir?",
    formulaContent: `4-cü qrup biologiya, kimya, tibb, əczaçılıq və əlaqəli ixtisasları əhatə edir.

Balınız keçid balından ≥10 yuxarıdırsa — şansınız yüksəkdir.
±10 aralığında — risk zonasındasınız.

Qeyd: Tibb universitetlərində reytinq ballar hər il dəyişir.`,
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
    title: "4th Group Passing Scores 2026",
    description: "Enter your exam score — check admission chances for biology, chemistry, medicine specialties.",
    breadcrumbCategory: "Education",
    formulaTitle: "How does it work?",
    formulaContent: `Group 4 covers biology, chemistry, medicine, pharmacy and related specialties.

Score ≥10 above passing — high chance.
Within ±10 — borderline.

Note: Medical school cutoffs change annually.`,
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
    title: "Проходные баллы 4-й группы 2026",
    description: "Введите ваш балл — проверьте шансы поступления на биологию, химию, медицину.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как это работает?",
    formulaContent: `4-я группа включает биологию, химию, медицину, фармацию и смежные специальности.

Балл ≥10 выше проходного — высокий шанс.
В пределах ±10 — зона риска.`,
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
    noResults: "Специальностей не найдено.",
    source: "",
    showAll: "Показать все",
    showLess: "Свернуть",
  },
};

// Bal siyahısına 2026 planından kod, yer sayı və tədris dili qoşulur.
const ENTRIES = attachPlan(admissionsGroup4, planGroup4);

export default function AdmissionGroup4Page() {
  return (
    <AdmissionScoreCalculator
      entries={ENTRIES}
      translations={t}
      lowBlockSpecialties={LOW_BLOCK_SPECIALTIES_G4}
      relatedIds={["qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "qebul-ballari-3cu-qrup", "gpa"]}
    />
  );
}
