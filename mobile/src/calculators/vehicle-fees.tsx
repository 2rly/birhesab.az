import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

type Tab = "registration" | "inspection" | "license" | "plates";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

function calcRegistration(cc: number): number {
  if (cc <= 0) return 0;
  if (cc <= 2000) return cc * 0.05;
  if (cc <= 3000) return 100 + (cc - 2000) * 0.1;
  if (cc <= 4000) return 200 + (cc - 3000) * 0.2;
  if (cc <= 5000) return 400 + (cc - 4000) * 0.3;
  return 1500;
}

function tierLabel(cc: number): string {
  if (cc <= 2000) return "0–2000 cc → 0.05 ₼/cc";
  if (cc <= 3000) return "2001–3000 cc → 100 + 0.10 ₼/cc";
  if (cc <= 4000) return "3001–4000 cc → 200 + 0.20 ₼/cc";
  if (cc <= 5000) return "4001–5000 cc → 400 + 0.30 ₼/cc";
  return "5001+ cc → 1 500 ₼ sabit";
}

export function VehicleFeesCalculator() {
  const [tab, setTab] = useState<Tab>("registration");
  const [engineCc, setEngineCc] = useState("1600");

  const regFee = useMemo(() => {
    const cc = parseInt(engineCc) || 0;
    return { fee: calcRegistration(cc), tier: cc > 0 ? tierLabel(cc) : "" };
  }, [engineCc]);

  return (
    <View>
      <SegmentControl
        options={[
          { value: "registration", label: "Qeydiyyat" },
          { value: "inspection", label: "Texniki baxış" },
          { value: "license", label: "Sürücülük" },
          { value: "plates", label: "Nömrə" },
        ]}
        selected={tab}
        onSelect={setTab}
      />

      {tab === "registration" && (
        <>
          <InputField
            label="Mühərrik həcmi"
            value={engineCc}
            onChangeText={setEngineCc}
            placeholder="1600"
            keyboardType="numeric"
            suffix="cc"
          />
          {regFee.fee > 0 && (
            <ResultSection title="Qeydiyyat rüsumu">
              <ResultRow label="Rüsum" value={fmt(regFee.fee)} highlight bold />
              <ResultRow label="Tarif pilləsi" value={regFee.tier} />
            </ResultSection>
          )}
          <ResultSection title="Tarif cədvəli">
            <ResultRow label="0–2 000 cc" value="0.05 ₼/cc" />
            <ResultRow label="2 001–3 000 cc" value="100 + 0.10 ₼/cc" />
            <ResultRow label="3 001–4 000 cc" value="200 + 0.20 ₼/cc" />
            <ResultRow label="4 001–5 000 cc" value="400 + 0.30 ₼/cc" />
            <ResultRow label="5 001+ cc" value="1 500 ₼ sabit" />
          </ResultSection>
        </>
      )}

      {tab === "inspection" && (
        <ResultSection title="Texniki baxış rüsumları">
          <ResultRow label="Minik avtomobil" value="20,00 ₼" />
          <ResultRow label="Yük avtomobili" value="30,00 ₼" />
          <ResultRow label="Avtobus" value="40,00 ₼" />
          <ResultRow label="Motosikl" value="10,00 ₼" />
          <ResultRow label="Qoşqu" value="15,00 ₼" />
        </ResultSection>
      )}

      {tab === "license" && (
        <ResultSection title="Sürücülük vəsiqəsi rüsumları">
          <ResultRow label="Yeni vəsiqə" value="20,00 ₼" />
          <ResultRow label="Dəyişdirmə" value="20,00 ₼" />
          <ResultRow label="Beynəlxalq vəsiqə" value="30,00 ₼" />
          <ResultRow label="İmtahan rüsumu" value="20,00 ₼" />
        </ResultSection>
      )}

      {tab === "plates" && (
        <ResultSection title="Nömrə nişanı rüsumları">
          <ResultRow label="Adi nömrə" value="20,00 ₼" />
          <ResultRow label="Seçilmiş nömrə" value="200,00 ₼" />
          <ResultRow label="Müvəqqəti nömrə" value="10,00 ₼" />
          <ResultRow label="Dublikat" value="20,00 ₼" />
        </ResultSection>
      )}
    </View>
  );
}
