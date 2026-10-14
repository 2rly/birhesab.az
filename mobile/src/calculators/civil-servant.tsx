import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type PositionType = "admin" | "support";

const ADMIN_BASE_RANGE = { min: 300, max: 1200 };
const SUPPORT_BASE_RANGE = { min: 250, max: 600 };

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function CivilServantCalculator() {
  const [positionType, setPositionType] = useState<PositionType>("admin");
  const [baseSalary, setBaseSalary] = useState("600");
  const [experience, setExperience] = useState("5");
  const [specialGrade, setSpecialGrade] = useState<"yes" | "no">("no");
  const [gradeBonus, setGradeBonus] = useState("100");

  const result = useMemo(() => {
    const base = parseFloat(baseSalary) || 0;
    const exp = parseInt(experience) || 0;
    if (base <= 0) return null;

    let experienceBonus = 0;
    if (exp >= 25) experienceBonus = base * 0.3;
    else if (exp >= 20) experienceBonus = base * 0.25;
    else if (exp >= 15) experienceBonus = base * 0.2;
    else if (exp >= 10) experienceBonus = base * 0.15;
    else if (exp >= 5) experienceBonus = base * 0.1;
    else if (exp >= 2) experienceBonus = base * 0.05;

    const gradeExtra =
      specialGrade === "yes" ? parseFloat(gradeBonus) || 0 : 0;

    const grossSalary = base + experienceBonus + gradeExtra;

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
      base,
      experienceBonus,
      gradeExtra,
      grossSalary,
      incomeTax,
      dsmf,
      medical,
      netSalary,
    };
  }, [baseSalary, experience, specialGrade, gradeBonus, positionType]);

  return (
    <View>
      <SegmentControl
        label="Vəzifə kateqoriyası"
        options={[
          { value: "admin", label: "İnzibati" },
          { value: "support", label: "Texniki-xidmət" },
        ]}
        selected={positionType}
        onSelect={setPositionType}
      />

      <InputField
        label="Vəzifə maaşı"
        value={baseSalary}
        onChangeText={setBaseSalary}
        placeholder={
          positionType === "admin"
            ? String(ADMIN_BASE_RANGE.min)
            : String(SUPPORT_BASE_RANGE.min)
        }
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="Dövlət qulluğu stajı"
        value={experience}
        onChangeText={setExperience}
        placeholder="5"
        keyboardType="numeric"
        suffix="il"
      />

      <SegmentControl
        label="Xüsusi rütbə / dərəcə əlavəsi"
        options={[
          { value: "no", label: "Yoxdur" },
          { value: "yes", label: "Var" },
        ]}
        selected={specialGrade}
        onSelect={setSpecialGrade}
      />

      {specialGrade === "yes" && (
        <InputField
          label="Rütbə / dərəcə əlavəsi"
          value={gradeBonus}
          onChangeText={setGradeBonus}
          placeholder="100"
          keyboardType="decimal-pad"
          suffix="₼"
        />
      )}

      {result && (
        <>
          <ResultSection title="Maaş tərkibi">
            <ResultRow label="Vəzifə maaşı" value={fmt(result.base)} />
            {result.experienceBonus > 0 && (
              <ResultRow
                label="Staj əlavəsi"
                value={fmt(result.experienceBonus)}
              />
            )}
            {result.gradeExtra > 0 && (
              <ResultRow
                label="Rütbə əlavəsi"
                value={fmt(result.gradeExtra)}
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
