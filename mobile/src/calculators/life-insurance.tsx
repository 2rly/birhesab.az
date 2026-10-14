import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Sector = "private" | "oilgas";

function calcPrivateIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.03;
  if (gross <= 8000) return 75 + (gross - 2500) * 0.1;
  return 75 + 550 + (gross - 8000) * 0.14;
}

function calcPrivateDSMF(gross: number): number {
  if (gross <= 200) return gross * 0.03;
  if (gross <= 8000) return 6 + (gross - 200) * 0.1;
  return 786 + (gross - 8000) * 0.1;
}

function calcPrivateMedical(gross: number): number {
  if (gross <= 2500) return gross * 0.02;
  return 50 + (gross - 2500) * 0.005;
}

function calcOilGasIncomeTax(gross: number): number {
  if (gross <= 200) return 0;
  if (gross <= 2500) return (gross - 200) * 0.14;
  return 350 + (gross - 2500) * 0.25;
}

function calcOilGasMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 160 + (gross - 8000) * 0.005;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function LifeInsuranceCalculator() {
  const { colors } = useTheme();
  const [sector, setSector] = useState<Sector>("private");
  const [grossSalary, setGrossSalary] = useState("2000");
  const [age, setAge] = useState("30");
  const [retireAge, setRetireAge] = useState("65");
  const [interestRate, setInterestRate] = useState("5");

  const result = useMemo(() => {
    const gross = parseFloat(grossSalary) || 0;
    const currentAge = parseInt(age) || 0;
    const retire = parseInt(retireAge) || 0;
    const iRate = (parseFloat(interestRate) || 0) / 100;
    if (gross <= 0 || currentAge <= 0 || retire <= currentAge) return null;

    let incomeTax: number;
    let dsmf: number;
    let medical: number;

    if (sector === "private") {
      incomeTax = calcPrivateIncomeTax(gross);
      dsmf = calcPrivateDSMF(gross);
      medical = calcPrivateMedical(gross);
    } else {
      incomeTax = calcOilGasIncomeTax(gross);
      dsmf = gross <= 200 ? gross * 0.03 : gross <= 8000 ? 6 + (gross - 200) * 0.1 : 786 + (gross - 8000) * 0.1;
      medical = calcOilGasMedical(gross);
    }

    const netSalary = gross - incomeTax - dsmf - medical;
    const insuranceContribution = gross * 0.02;
    const monthlyYield = iRate / 12;
    const yearsToRetire = retire - currentAge;
    const monthsToRetire = yearsToRetire * 12;

    let accumulatedFund = 0;
    for (let i = 0; i < monthsToRetire; i++) {
      accumulatedFund = (accumulatedFund + insuranceContribution) * (1 + monthlyYield);
    }

    const totalContributions = insuranceContribution * monthsToRetire;
    const investmentGain = accumulatedFund - totalContributions;

    return {
      grossSalary: gross,
      incomeTax,
      dsmf,
      medical,
      netSalary,
      insuranceContribution,
      yearsToRetire,
      totalContributions,
      accumulatedFund,
      investmentGain,
    };
  }, [sector, grossSalary, age, retireAge, interestRate]);

  return (
    <View>
      <SegmentControl
        label="Sektor"
        options={[
          { value: "private", label: "Özəl sektor" },
          { value: "oilgas", label: "Neft-qaz / Dövlət" },
        ]}
        selected={sector}
        onSelect={setSector}
      />

      <InputField
        label="Aylıq gross maaş"
        value={grossSalary}
        onChangeText={setGrossSalary}
        placeholder="2000"
        keyboardType="decimal-pad"
        suffix="₼"
      />
      <InputField
        label="Hazırkı yaş"
        value={age}
        onChangeText={setAge}
        placeholder="30"
        keyboardType="numeric"
        suffix="yaş"
      />
      <InputField
        label="Təqaüd yaşı"
        value={retireAge}
        onChangeText={setRetireAge}
        placeholder="65"
        keyboardType="numeric"
        suffix="yaş"
      />
      <InputField
        label="İllik gəlirlilik norması"
        value={interestRate}
        onChangeText={setInterestRate}
        placeholder="5"
        keyboardType="decimal-pad"
        suffix="%"
      />

      {result && (
        <>
          <ResultSection title="Maaş detalları">
            <ResultRow label="Gross maaş" value={fmt(result.grossSalary)} />
            <ResultRow label="Gəlir vergisi" value={fmt(result.incomeTax)} />
            <ResultRow label="DSMF" value={fmt(result.dsmf)} />
            <ResultRow label="Tibbi sığorta" value={fmt(result.medical)} />
            <ResultRow
              label="Xalis maaş"
              value={fmt(result.netSalary)}
              highlight
              bold
            />
          </ResultSection>

          <ResultSection title="Sığorta yığımı">
            <ResultRow
              label="Aylıq sığorta haqqı (2%)"
              value={fmt(result.insuranceContribution)}
            />
            <ResultRow
              label="Yığım müddəti"
              value={`${result.yearsToRetire} il`}
            />
            <ResultRow
              label="Ümumi ödənişlər"
              value={fmt(result.totalContributions)}
            />
            <ResultRow
              label="İnvestisiya gəliri"
              value={fmt(result.investmentGain)}
            />
            <ResultRow
              label="Yığılmış fond"
              value={fmt(result.accumulatedFund)}
              highlight
              bold
            />
          </ResultSection>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
