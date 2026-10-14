import { AdmissionScoreCalculator, type AdmissionEntry } from "@/components/AdmissionScoreCalculator";
import { admissionsCollege9 } from "@/data/admissions-college-9-2026";

export function AdmissionCollege9Calculator() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsCollege9 as unknown as AdmissionEntry[]}
      scoreMin={0}
      scoreMax={300}
      scorePlaceholder="150"
      borderlineRange={5}
    />
  );
}
