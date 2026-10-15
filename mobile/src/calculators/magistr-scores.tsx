// Magistr keçid balları 2026 — saytdakı magistr-kecid-ballari səhifəsinin mobil portu.

import { AdmissionScoreEngine, type AdmissionTranslation, type SubgroupOption } from "./_admission-parts";
import { admissionsMagistr2027 } from "@/data/admissions-magistr-2027";
import { magistrPrograms } from "@/data/magistr-programs-2025";
import { bachelorToMagistr } from "@/data/magistr-bachelor-map";

const SUBGROUPS_MAGISTR: SubgroupOption[] = [
  { value: "all", label: "Hamısı (MBA-sız)", specialties: [], excludeTags: ["mba"] },
  { value: "mba", label: "Yalnız MBA", specialties: [], tag: "mba" },
];

const T: AdmissionTranslation = {
  title: "Magistr keçid balları 2026",
  description:
    "Magistratura balınızı daxil edin — hansı magistr proqramlarına qəbul ola biləcəyinizi görün. Qeyd: 2027-ci il magistr ixtisas seçimi 2026 keçid ballarına əsasən aparılır.",
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
};

export function MagistrScoresCalculator() {
  return (
    <AdmissionScoreEngine
      slug="magistr-kecid-ballari"
      entries={admissionsMagistr2027}
      t={T}
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
