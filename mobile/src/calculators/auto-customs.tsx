import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { Select } from "@/components/Select";
import { Button, DateField } from "@/components/Controls";
import {
  SectionHeading,
  InfoBox,
  ResultHero,
  StatGrid,
  FormulaSection,
  RelatedCalculators,
} from "@/components/Content";
import { fmtNum } from "@/lib/format";

// Avtomobil gömrük rüsumu — Dövlət Gömrük Komitəsinin rəsmi servisi ilə hesablanır
// (saytdakı /hesablayici/avtomobil-gomruk ilə eyni). Native tətbiqdə CORS yoxdur — birbaşa çağırılır.
const UPSTREAM = "https://c2b-fbusiness.customs.gov.az/api/v1/dictionaries/calAutoDutyv2";

// ── API tipləri ──
interface Duty {
  code: string;
  name: string;
  value: number;
}
interface AutoDutyData {
  usdCourse: string;
  autoDuty: {
    duties: Duty[];
    total: Duty;
    customsCost?: number;
  };
}
interface BaseResponse {
  code: number;
  data: AutoDutyData | null;
  exception: {
    errorMessage?: string | null;
    validationError?: Record<string, string> | null;
  } | null;
}

type AutoType = "0" | "1";
type CommerceType = "0" | "1";

// Mühərrik növləri — DGK "AutoEngineTypes" lüğəti.
// code = lüğət kodu (select dəyəri), api = calAutoDuty-yə göndərilən engineType.
// Saytda 14 ad göstərilir, lakin hesablama 6 əsas mühərrik koduna (0-5) yönləndirilir.
const ENGINE_TYPES: { code: string; api: string; label: string }[] = [
  { code: "8", api: "3", label: "Plug-in-hibrid benzin" },
  { code: "1", api: "0", label: "Benzin" },
  { code: "2", api: "1", label: "Dizel" },
  { code: "3", api: "2", label: "Qaz" },
  { code: "4", api: "0", label: "Benzin-Qaz" },
  { code: "5", api: "1", label: "Dizel-Qaz" },
  { code: "6", api: "3", label: "Hibrid-Benzin" },
  { code: "7", api: "4", label: "Hibrid-Dizel" },
  { code: "11", api: "0", label: "Mild-hibrid benzin" },
  { code: "12", api: "5", label: "Tam elektrik" },
  { code: "9", api: "3", label: "Hibrid-Qaz" },
  { code: "10", api: "4", label: "Plug-in-hibrid dizel" },
  { code: "13", api: "1", label: "Mild-hibrid dizel" },
  { code: "14", api: "2", label: "Mild-hibrid qaz" },
];
const ELECTRIC_API = "5"; // engineType=5 (Tam elektrik) → mühərrik həcmi tələb olunmur

const fmt = (n: number) => fmtNum(n, 2);

// yyyy-mm-dd → dd.MM.yyyy
function toApiDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
}

const autoTypeOptions: { value: AutoType; label: string }[] = [
  { value: "0", label: "Minik-avtomobili" },
  { value: "1", label: "Avtobus" },
];

const pt = {
  formulaTitle: "Avtomobil gömrük rüsumu necə hesablanır?",
  formulaContent: `Bu hesablayıcı Dövlət Gömrük Komitəsinin (DGK) rəsmi xidmətindən (e-customs.gov.az) istifadə edir və nəticələr birbaşa rəsmi servisdən gəlir.

Hesablamaya təsir edən amillər:
• Avtomobilin növü (minik, avtobus və s.)
• Mühərrik növü (benzin, dizel, qaz, hibrid, elektrik)
• Mühərrik həcmi (sm³)
• Mənşə və göndərən ölkə (Azad Ticarət Sazişi ölkəsidirsə, idxal gömrük rüsumu hesablanmır)
• İstehsal (buraxılış) tarixi — avtomobilin yaşı
• İnvoys dəyəri (USD)

Hesablanan ödənişlərə daxildir: idxal gömrük rüsumu, ƏDV, aksiz, gömrük yığımları, utilizasiya haqqı, vəsiqə və sertifikat rüsumları, elektron gömrük xidməti haqqı və s.

USD dəyəri Mərkəzi Bankın məzənnəsi ilə AZN-ə çevrilir.`,
  sectionTitle: "Nəqliyyat vasitəsinin məlumatları",
  autoType: "Nəqliyyat vasitəsinin növü *",
  engineType: "Mühərrikin növü *",
  engineTypePlaceholder: "Seçin...",
  engineVolume: "Mühərrikin həcmi (sm³) *",
  engineVolumePlaceholder: "Məsələn: 1600",
  commerceType: "Mənşə (istehsal) ölkəsi və göndərən ölkə haqqında",
  commerceOther: "Digər ölkələr",
  commerceFree: "Azad ticarət sazişi bağlanan ölkədə istehsal olunub və oradan gətirilir",
  issueDate: "İstehsal tarixi *",
  invoice: "İnvoys dəyəri (USD) *",
  transportExpenses: "Nəqliyyat xərci (USD)",
  otherExpenses: "Digər xərclər (USD)",
  pricePlaceholder: "Məsələn: 15000",
  calculate: "Rüsumları Hesabla",
  calculating: "Hesablanır...",
  freeTradeInfo:
    "Azad ticarət sazişi bağlanan ölkələr: Rusiya, Gürcüstan, Moldova, Ukrayna, Özbəkistan, Türkmənistan, Qazaxıstan, Qırğızıstan, Tacikistan. Bu ölkələr üçün idxal gömrük rüsumu hesablanmır.",
  resultTitle: "📋 Gömrük ödənişləri",
  customsCost: "Gömrük dəyəri (AZN)",
  usdCourse: "USD məzənnəsi (USD → AZN)",
  total: "Cəmi gömrük ödənişləri",
  disclaimerTitle: "Diqqət:",
  disclaimer:
    "Nəticələr Dövlət Gömrük Komitəsinin rəsmi servisindən alınır. Faktiki məbləğ bəyannamənin rəsmiləşdirilməsi zamanı dəqiqləşə bilər.",
  errorTitle: "Xəta baş verdi",
  errorGeneric: "Hesablama mümkün olmadı. Bir azdan yenidən cəhd edin.",
  fillFields: "Hesablamaq üçün bütün məcburi sahələri doldurun.",
  emptyState: "Məlumatları daxil edib “Rüsumları Hesabla” düyməsini basın.",
};

export function AutoCustomsCalculator() {
  const { colors } = useTheme();
  const [autoType, setAutoType] = useState<AutoType>("0");
  const [engineCode, setEngineCode] = useState("");
  const [engine, setEngine] = useState("");
  const [commerceType, setCommerceType] = useState<CommerceType>("0");
  const [issueDate, setIssueDate] = useState("");
  const [invoice, setInvoice] = useState("");
  const [transportExpenses, setTransportExpenses] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [showFreeTradeTip, setShowFreeTradeTip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AutoDutyData | null>(null);

  const selectedEngine = ENGINE_TYPES.find((e) => e.code === engineCode);
  const isElectric = selectedEngine?.api === ELECTRIC_API;

  async function handleCalculate() {
    setError(null);
    setResult(null);

    const invoiceNum = parseFloat(invoice.replace(",", "."));
    const engineNum = parseInt(engine, 10);

    // Validasiya
    if (
      !selectedEngine ||
      !issueDate ||
      !invoiceNum ||
      invoiceNum <= 0 ||
      (!isElectric && (!engineNum || engineNum <= 0))
    ) {
      setError(pt.fillFields);
      return;
    }

    const body = {
      autoType,
      engineType: selectedEngine.api,
      engine: isElectric ? 0 : engineNum,
      commerceType,
      issueDate: toApiDate(issueDate),
      price: invoiceNum,
      transportExpenses: parseFloat(transportExpenses.replace(",", ".")) || 0,
      otherExpenses: parseFloat(otherExpenses.replace(",", ".")) || 0,
    };

    setLoading(true);
    try {
      const res = await fetch(UPSTREAM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          lang: "az",
          requestSource: "1",
          "User-Agent": "BirHesab.az/1.0",
        },
        body: JSON.stringify(body),
      });
      const json: BaseResponse | null = await res.json();

      if (json && json.code === 200 && json.data) {
        setResult(json.data);
      } else if (json?.exception?.validationError) {
        setError(Object.values(json.exception.validationError).join(" • "));
      } else if (json?.exception?.errorMessage) {
        setError(json.exception.errorMessage);
      } else {
        setError(pt.errorGeneric);
      }
    } catch {
      setError(pt.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <SectionHeading>{pt.sectionTitle}</SectionHeading>

      <Select
        label={pt.autoType}
        value={autoType}
        options={autoTypeOptions}
        onSelect={(v) => setAutoType(v)}
      />

      <Select
        label={pt.engineType}
        value={engineCode}
        options={ENGINE_TYPES.map((o) => ({ value: o.code, label: o.label }))}
        onSelect={setEngineCode}
        placeholder={pt.engineTypePlaceholder}
      />

      <InputField
        label={pt.invoice}
        value={invoice}
        onChangeText={setInvoice}
        placeholder={pt.pricePlaceholder}
        keyboardType="decimal-pad"
        suffix="$"
      />
      <InputField
        label={pt.transportExpenses}
        value={transportExpenses}
        onChangeText={setTransportExpenses}
        placeholder="0"
        keyboardType="decimal-pad"
        suffix="$"
      />
      <InputField
        label={pt.otherExpenses}
        value={otherExpenses}
        onChangeText={setOtherExpenses}
        placeholder="0"
        keyboardType="decimal-pad"
        suffix="$"
      />
      {!isElectric && (
        <InputField
          label={pt.engineVolume}
          value={engine}
          onChangeText={(t) => setEngine(t.replace(/\D/g, "").slice(0, 6))}
          placeholder={pt.engineVolumePlaceholder}
          keyboardType="number-pad"
          suffix="sm³"
          maxLength={6}
        />
      )}

      <DateField label={pt.issueDate} value={issueDate} onChange={setIssueDate} />

      {/* Mənşə / göndərən ölkə — radio */}
      <View style={{ marginBottom: 16 }}>
        <Pressable
          onPress={() => setShowFreeTradeTip((s) => !s)}
          style={styles.labelRow}
          hitSlop={6}
        >
          <Text style={[styles.label, { color: colors.n700 }]}>{pt.commerceType}</Text>
          <Text style={{ color: colors.n580, fontSize: 13 }}> ⓘ</Text>
        </Pressable>
        {showFreeTradeTip && (
          <Text style={[styles.tip, { color: colors.n580 }]}>{pt.freeTradeInfo}</Text>
        )}
        {([
          { v: "0" as const, label: pt.commerceOther },
          { v: "1" as const, label: pt.commerceFree },
        ]).map(({ v, label }) => {
          const active = commerceType === v;
          return (
            <Pressable key={v} onPress={() => setCommerceType(v)} style={styles.radioRow}>
              <View style={[styles.radio, { borderColor: active ? colors.accent : colors.n400 }]}>
                {active && <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />}
              </View>
              <Text style={[styles.radioText, { color: colors.n840 }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title={loading ? pt.calculating : pt.calculate} onPress={handleCalculate} disabled={loading} />

      {/* Azad ticarət info */}
      <InfoBox variant="info">{`ℹ️ ${pt.freeTradeInfo}`}</InfoBox>

      {/* Xəta */}
      {error && (
        <InfoBox variant="danger" title={pt.errorTitle}>
          {error}
        </InfoBox>
      )}

      {/* Nəticə */}
      {result && (
        <View>
          <ResultHero label={pt.total} value={`${fmt(result.autoDuty.total.value)} AZN`} />
          <StatGrid
            items={[
              ...(result.autoDuty.customsCost != null
                ? [{ label: pt.customsCost, value: fmt(result.autoDuty.customsCost) }]
                : []),
              { label: pt.usdCourse, value: String(result.usdCourse) },
            ]}
          />
          <ResultSection title={pt.resultTitle}>
            {result.autoDuty.duties.map((d) => (
              <ResultRow key={d.code} label={d.name} value={`${fmt(d.value)} AZN`} />
            ))}
            <ResultRow
              label={result.autoDuty.total.name}
              value={`${fmt(result.autoDuty.total.value)} AZN`}
              highlight
              bold
            />
          </ResultSection>
          <InfoBox variant="info">
            <Text style={[styles.note, { color: colors.n760 }]}>
              <Text style={{ fontWeight: "700" }}>{pt.disclaimerTitle}</Text> {pt.disclaimer}
            </Text>
          </InfoBox>
        </View>
      )}

      {/* Boş vəziyyət */}
      {!result && !error && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={[styles.emptyText, { color: colors.n580 }]}>{pt.emptyState}</Text>
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["road-tax", "osago", "fuel-cost", "car-loan"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600", flexShrink: 1 },
  tip: { fontSize: 12, lineHeight: 17, marginBottom: 6 },
  radioRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 7 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 1 },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioText: { flex: 1, fontSize: 14, lineHeight: 20 },
  note: { fontSize: 13, lineHeight: 19 },
  empty: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
