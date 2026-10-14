import { useMemo } from "react";
import { View } from "react-native";
import { AdmissionScoreCalculator } from "@/components/AdmissionScoreCalculator";
import type { AdmissionEntry } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup1Sub } from "@/data/admissions-group1-subbakalavr-2026";
import { admissionsGroup2Sub } from "@/data/admissions-group2-subbakalavr-2026";
import { admissionsGroup4Sub } from "@/data/admissions-group4-subbakalavr-2026";
import { admissionsGroup5Sub } from "@/data/admissions-group5-subbakalavr-2026";

export function SubbakalavrAdmissionCalculator() {
  const allEntries = useMemo<AdmissionEntry[]>(
    () => [
      ...admissionsGroup1Sub,
      ...admissionsGroup2Sub,
      ...admissionsGroup4Sub,
      ...admissionsGroup5Sub,
    ] as AdmissionEntry[],
    []
  );

  return (
    <View>
      <AdmissionScoreCalculator
        entries={allEntries}
        scoreMin={0}
        scoreMax={100}
        scorePlaceholder="55"
        borderlineRange={5}
      />
    </View>
  );
}
