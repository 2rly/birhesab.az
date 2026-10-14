import { AdmissionScoreCalculator, type AdmissionEntry, type SubgroupOption } from "@/components/AdmissionScoreCalculator";
import { admissionsMagistr2027 } from "@/data/admissions-magistr-2027";

const SUBGROUPS: SubgroupOption[] = [
  { value: "all", label: "Hamısı (MBA-sız)", specialties: [], excludeTags: ["mba"] },
  { value: "mba", label: "Yalnız MBA", specialties: [], tag: "mba" },
];

export function MagistrAdmissionCalculator() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsMagistr2027 as unknown as AdmissionEntry[]}
      scoreMin={0}
      scoreMax={100}
      scorePlaceholder="55"
      borderlineRange={5}
      subgroups={SUBGROUPS}
    />
  );
}
