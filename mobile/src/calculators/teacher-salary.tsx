import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type InstitutionType = "school" | "preschool" | "vocational";
type DiagnosticLevel = "none" | "level1" | "level2" | "level3" | "level4";

const BASE_SALARY: Record<InstitutionType, number> = {
  school: 416,
  preschool: 350,
  vocational: 416,
};

const DIAGNOSTIC_BONUS: Record<DiagnosticLevel, number> = {
  none: 0,
  level1: 50,
  level2: 100,
  level3: 150,
  level4: 200,
};

const HOUR_RATE: Record<InstitutionType, number> = {
  school: 5.0,
  preschool: 4.5,
  vocational: 5.0,
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function TeacherSalaryCalculator() {
  const [institution, setInstitution] =
    useState<InstitutionType>("school");
  const [weeklyHours, setWeeklyHours] = useState("18");
  const [experience, setExperience] = useState("5");
  const [diagnostic, setDiagnostic] = useState<DiagnosticLevel>("none");
  const [classLeader, setClassLeader] = useState<"yes" | "no">("no");

  const result = useMemo(() => {
    const hours = parseInt(weeklyHours) || 0;
    const exp = parseInt(experience) || 0;
    if (hours <= 0) return null;

    const baseSalary = BASE_SALARY[institution];
    const hourRate = HOUR_RATE[institution];
    const standardHours = institution === "preschool" ? 25 : 18;
    const teachingPay = hourRate * hours * 4.33;

    let experienceBonus = 0;
    if (exp >= 20) experienceBonus = baseSalary * 0.2;
    else if (exp >= 15) experienceBonus = baseSalary * 0.15;
    else if (exp >= 10) experienceBonus = baseSalary * 0.1;
    else if (exp >= 5) experienceBonus = baseSalary * 0.05;

    const diagnosticBonus = DIAGNOSTIC_BONUS[diagnostic];
    const classLeaderBonus = classLeader === "yes" ? 50 : 0;

    const grossSalary =
      baseSalary +
      teachingPay +
      experienceBonus +
      diagnosticBonus +
      classLeaderBonus;

    const incomeTax =
      grossSalary <= 200
        ? 0
        : grossSalary <= 2500
          ? (grossSalary - 200) * 0.14
          : 350 + (grossSalary - 2500) * 0.25;

    const dsmf =
      grossSalary <= 200
        ? grossSalary * 0.03
        : grossSalary <= 8000
          ? 6 + (grossSalary - 200) * 0.1
          : 786 + (grossSalary - 8000) * 0.1;

    const medical =
      grossSalary <= 8000
        ? grossSalary * 0.02
        : 160 + (grossSalary - 8000) * 0.005;

    const netSalary = grossSalary - incomeTax - dsmf - medical;

    return {
      baseSalary,
      teachingPay,
      experienceBonus,
      diagnosticBonus,
      classLeaderBonus,
      grossSalary,
      incomeTax,
      dsmf,
      medical,
      netSalary,
    };
  }, [institution, weeklyHours, experience, diagnostic, classLeader]);

  return (
    <View>
      <SegmentControl
        label="Müəssisə növü"
        options={[
          { value: "school", label: "Məktəb" },
          { value: "preschool", label: "Məktəbəqədər" },
          { value: "vocational", label: "Peşə" },
        ]}
        selected={institution}
        onSelect={setInstitution}
      />

      <InputField
        label="Həftəlik dərs saatı"
        value={weeklyHours}
        onChangeText={setWeeklyHours}
        placeholder="18"
        keyboardType="numeric"
        suffix="saat"
      />
      <InputField
        label="İş stajı"
        value={experience}
        onChangeText={setExperience}
        placeholder="5"
        keyboardType="numeric"
        suffix="il"
      />

      <SegmentControl
        label="Diaqnostik qiymətləndirmə"
        options={[
          { value: "none", label: "Yox" },
          { value: "level1", label: "I" },
          { value: "level2", label: "II" },
          { value: "level3", label: "III" },
          { value: "level4", label: "IV" },
        ]}
        selected={diagnostic}
        onSelect={setDiagnostic}
      />

      <SegmentControl
        label="Sinif rəhbəri"
        options={[
          { value: "no", label: "Xeyr" },
          { value: "yes", label: "Bəli (+50₼)" },
        ]}
        selected={classLeader}
        onSelect={setClassLeader}
      />

      {result && (
        <>
          <ResultSection title="Maaş tərkibi">
            <ResultRow label="Baza maaş" value={fmt(result.baseSalary)} />
            <ResultRow
              label="Dərs saatı ödənişi"
              value={fmt(result.teachingPay)}
            />
            {result.experienceBonus > 0 && (
              <ResultRow
                label="Staj əlavəsi"
                value={fmt(result.experienceBonus)}
              />
            )}
            {result.diagnosticBonus > 0 && (
              <ResultRow
                label="Diaqnostik əlavə"
                value={fmt(result.diagnosticBonus)}
              />
            )}
            {result.classLeaderBonus > 0 && (
              <ResultRow
                label="Sinif rəhbəri"
                value={fmt(result.classLeaderBonus)}
              />
            )}
            <ResultRow
              label="Gross maaş"
              value={fmt(result.grossSalary)}
              bold
            />
          </ResultSection>

          <ResultSection title="Tutulmalar">
            <ResultRow
              label="Gəlir vergisi"
              value={fmt(result.incomeTax)}
            />
            <ResultRow label="DSMF" value={fmt(result.dsmf)} />
            <ResultRow
              label="Tibbi sığorta"
              value={fmt(result.medical)}
            />
          </ResultSection>

          <ResultSection title="Nəticə">
            <ResultRow
              label="Xalis maaş"
              value={fmt(result.netSalary)}
              highlight
              bold
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}
