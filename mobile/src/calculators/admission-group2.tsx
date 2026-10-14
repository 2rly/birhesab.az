import { AdmissionScoreCalculator } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup2 } from "@/data/admissions-group2-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";

const LOW_BLOCK = [
  "Marketinq",
  "Biznesin idarə edilməsi",
  "Turizm bələdçiliyi",
  "Turizm işinin təşkili",
];

const ENTRIES = attachPlan(admissionsGroup2, planGroup2);

export function AdmissionGroup2Calculator() {
  return (
    <AdmissionScoreCalculator
      entries={ENTRIES}
      lowBlockSpecialties={LOW_BLOCK}
    />
  );
}
