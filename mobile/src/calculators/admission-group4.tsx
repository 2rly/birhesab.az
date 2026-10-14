import { AdmissionScoreCalculator } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup4 } from "@/data/admissions-group4-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";

const LOW_BLOCK = [
  "Ekologiya",
  "Bağçılıq və tərəvəzçilik",
  "Baytarlıq təbabəti",
  "Bitki mühafizəsi",
  "Su bioehtiyatları və akvakultura",
];

const ENTRIES = attachPlan(admissionsGroup4, planGroup4);

export function AdmissionGroup4Calculator() {
  return (
    <AdmissionScoreCalculator
      entries={ENTRIES}
      lowBlockSpecialties={LOW_BLOCK}
    />
  );
}
