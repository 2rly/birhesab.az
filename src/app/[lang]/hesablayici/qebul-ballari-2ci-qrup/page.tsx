"use client";

import AdmissionScoreCalculator, { type AdmissionTranslation } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup2 } from "@/data/admissions-group2-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";

const LOW_BLOCK_SPECIALTIES_G2 = [
  "Marketinq",
  "Biznesin idarə edilməsi",
  "Turizm bələdçiliyi",
  "Turizm işinin təşkili",
];

const t: { az: AdmissionTranslation; en: AdmissionTranslation; ru: AdmissionTranslation } = {
  az: {
    title: "2-ci qrup keçid balları 2026",
    description: "DİM balınızı daxil edin — 2-ci qrup üzrə hansı universitetlərə və ixtisaslara qəbul ola biləcəyinizi görün.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Necə işləyir?",
    formulaContent: `Bu hesablayıcı sizin DİM balınızı 2026-cı ilin rəsmi keçid balları ilə müqayisə edir.

Əgər balınız keçid balından yuxarıdırsa — həmin ixtisasa qəbul olma şansınız var.
Balınız keçid balına yaxındırsa — riskli zonadadır.

Qeyd: Real qəbul zamanı ballar dəyişə bilər.`,
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
    title: "2nd Group Passing Scores 2026",
    description: "Enter your exam score — see which universities and specialties you can enter.",
    breadcrumbCategory: "Education",
    formulaTitle: "How does it work?",
    formulaContent: `Compares your score with official passing scores.

Score above passing — high chance.
Within ±10 — borderline.`,
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
    noResults: "No specialties found.",
    source: "",
    showAll: "Show all",
    showLess: "Show less",
  },
  ru: {
    title: "Проходные баллы 2-й группы 2026",
    description: "Введите свой балл — узнайте, в какие программы 2-й группы можете поступить.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как это работает?",
    formulaContent: `Сравнивает ваш балл с официальными проходными баллами.`,
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
const ENTRIES = attachPlan(admissionsGroup2, planGroup2);

export default function AdmissionGroup2Page() {
  return (
    <AdmissionScoreCalculator
      entries={ENTRIES}
      translations={t}
      lowBlockSpecialties={LOW_BLOCK_SPECIALTIES_G2}
      relatedIds={["qebul-ballari-1ci-qrup", "qebul-ballari-3cu-qrup", "qebul-ballari-4cu-qrup", "gpa"]}
    />
  );
}
