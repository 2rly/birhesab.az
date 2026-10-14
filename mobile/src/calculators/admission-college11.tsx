import { AdmissionScoreCalculator } from "@/components/AdmissionScoreCalculator";
import { admissionsCollege11 } from "@/data/admissions-college-11-2026";

export function AdmissionCollege11Calculator() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsCollege11}
      scoreMin={0}
      scoreMax={300}
      scorePlaceholder="150"
      borderlineRange={5}
    />
  );
}
