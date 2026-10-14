import { useState, useMemo } from "react";
import { View } from "react-native";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

export function BusinessTripCalculator() {
  const [days, setDays] = useState("5");
  const [destination, setDestination] = useState<"domestic" | "foreign">("domestic");
  const [transport, setTransport] = useState("200");
  const [accommodation, setAccommodation] = useState("100");

  const result = useMemo(() => {
    const d = parseInt(days) || 0;
    const t = parseFloat(transport) || 0;
    const a = parseFloat(accommodation) || 0;
    if (d <= 0) return null;

    const dailyRate = destination === "domestic" ? 20 : 50;
    const dailyTotal = dailyRate * d;
    const accommodationTotal = a * d;
    const total = dailyTotal + accommodationTotal + t;

    return { dailyRate, dailyTotal, accommodationTotal, transport: t, total, days: d };
  }, [days, destination, transport, accommodation]);

  return (
    <View>
      <SegmentControl
        label="İstiqamət"
        options={[
          { value: "domestic", label: "Daxili (20₼/gün)" },
          { value: "foreign", label: "Xarici (50₼/gün)" },
        ]}
        selected={destination}
        onSelect={setDestination}
      />
      <InputField label="Ezamiyyət müddəti" value={days} onChangeText={setDays} placeholder="5" keyboardType="numeric" suffix="gün" />
      <InputField label="Nəqliyyat xərci" value={transport} onChangeText={setTransport} placeholder="200" keyboardType="decimal-pad" suffix="₼" />
      <InputField label="Gündəlik yaşayış xərci" value={accommodation} onChangeText={setAccommodation} placeholder="100" keyboardType="decimal-pad" suffix="₼" />

      {result && (
        <ResultSection title="Nəticə">
          <ResultRow label="Gündəlik norma" value={`${result.dailyRate} ₼ × ${result.days} gün`} />
          <ResultRow label="Gündəlik cəmi" value={fmt(result.dailyTotal)} />
          <ResultRow label="Yaşayış xərci" value={fmt(result.accommodationTotal)} />
          <ResultRow label="Nəqliyyat xərci" value={fmt(result.transport)} />
          <ResultRow label="Ümumi ezamiyyə xərci" value={fmt(result.total)} highlight bold />
        </ResultSection>
      )}
    </View>
  );
}
