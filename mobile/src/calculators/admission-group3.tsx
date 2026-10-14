import { AdmissionScoreCalculator, type SubgroupOption } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup3 } from "@/data/admissions-group3-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup3 } from "@/data/admissions-plan-2026-group3";

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

const TARIX_COGRAFIYA = [
  "Beynəlxalq münasibətlər",
  "Regionşün",
];

const SUBGROUPS: SubgroupOption[] = [
  { value: "all", label: "Hamısı", specialties: [] },
  { value: "dt", label: "Dil-tarix (DT)", specialties: DIL_TARIX },
  { value: "tc", label: "Tarix-coğrafiya (TC)", specialties: TARIX_COGRAFIYA },
];

const LOW_BLOCK = [
  "Muzey, arxiv işi",
  "Sosial iş",
  "Regionşün",
];

const ENTRIES = attachPlan(admissionsGroup3, planGroup3);

export function AdmissionGroup3Calculator() {
  return (
    <AdmissionScoreCalculator
      entries={ENTRIES}
      subgroups={SUBGROUPS}
      lowBlockSpecialties={LOW_BLOCK}
    />
  );
}
