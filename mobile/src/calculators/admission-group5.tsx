import { AdmissionScoreCalculator } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup5 } from "@/data/admissions-group5-2026";

export function AdmissionGroup5Calculator() {
  return (
    <AdmissionScoreCalculator
      entries={admissionsGroup5}
      scoreMin={0}
      scoreMax={300}
      scorePlaceholder="180"
    />
  );
}
