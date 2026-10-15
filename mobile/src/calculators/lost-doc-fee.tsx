import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { Checkbox } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { Panel, TintRow, TintHero, NoteBox, FieldLabel, TINT, moneyAZN } from "./_legal-parts";

// Azərbaycanda itirilmiş sənədlərə görə dövlət rüsumu və cərimə
// Mənbə: "Dövlət rüsumu haqqında" Qanun + İnzibati Xətalar Məcəlləsi (Maddə 327, 328)
// Qiymətlər ASAN xidmət və DİN-in rəsmi tariflərinə əsaslanır (təxmini)

interface UrgencyOption {
  id: string;
  label: string;
  days: string;
  fee: number;
}

interface DocumentType {
  id: string;
  icon: string;
  name: string;
  description: string;
  lossFine: number;
  lossFineNote?: string;
  urgencies: UrgencyOption[];
}

const documents: DocumentType[] = [
  {
    id: "id-card",
    icon: "🪪",
    name: "Şəxsiyyət vəsiqəsi (yeni nəsil)",
    description: "ASAN xidmət vasitəsilə yeni nəsil ID kart",
    lossFine: 30,
    lossFineNote: "İnzibati Xətalar Məcəlləsi 327.2.2 — sənədin itirilməsi və ya korlanması",
    urgencies: [
      { id: "std-7", label: "Standart", days: "7 iş günü", fee: 15 },
      { id: "exp-5", label: "Sürətli", days: "5 iş günü", fee: 25 },
      { id: "exp-3", label: "Təcili", days: "3 iş günü", fee: 40 },
      { id: "exp-1", label: "Çox təcili", days: "1 iş günü", fee: 60 },
    ],
  },
  {
    id: "passport",
    icon: "📕",
    name: "Ümumvətəndaş pasportu",
    description: "Xarici səfərlər üçün biometrik pasport",
    lossFine: 30,
    lossFineNote: "İXM 327.2.2 — pasportun itirilməsi",
    urgencies: [
      { id: "std-10", label: "Standart", days: "10 iş günü", fee: 40 },
      { id: "exp-5", label: "Sürətli", days: "5 iş günü", fee: 60 },
      { id: "exp-3", label: "Təcili", days: "3 iş günü", fee: 70 },
      { id: "exp-1", label: "Çox təcili", days: "1 iş günü", fee: 90 },
    ],
  },
  {
    id: "driver-license",
    icon: "🚗",
    name: "Sürücülük vəsiqəsi",
    description: "DYP-nin verdiyi sürücü vəsiqəsi (dublikat)",
    lossFine: 40,
    lossFineNote: "İXM 327.2.2 — sürücülük vəsiqəsinin itirilməsi",
    urgencies: [
      { id: "std", label: "Standart", days: "5-7 iş günü", fee: 30 },
      { id: "exp", label: "Sürətli", days: "1-3 iş günü", fee: 50 },
    ],
  },
  {
    id: "car-registration",
    icon: "🚙",
    name: "Avtomobil qeydiyyat vəsiqəsi",
    description: "Texniki pasport (dublikat)",
    lossFine: 40,
    lossFineNote: "İXM 327.2.2 — qeydiyyat sənədinin itirilməsi",
    urgencies: [
      { id: "std", label: "Standart", days: "3-5 iş günü", fee: 15 },
      { id: "exp", label: "Sürətli", days: "1 iş günü", fee: 30 },
    ],
  },
  {
    id: "license-plate",
    icon: "🔢",
    name: "Dövlət qeydiyyat nişanı",
    description: "Avtomobil nömrə nişanı (dublikat)",
    lossFine: 40,
    urgencies: [{ id: "std", label: "Standart", days: "3-7 iş günü", fee: 40 }],
  },
  {
    id: "birth-certificate",
    icon: "👶",
    name: "Doğum şəhadətnaməsi",
    description: "ASAN xidmət vasitəsilə dublikat",
    lossFine: 5,
    lossFineNote: "Aşağı təsnifatlı sənəd — minimum cərimə",
    urgencies: [
      { id: "std", label: "Standart", days: "3-5 iş günü", fee: 5 },
      { id: "exp", label: "Sürətli", days: "1 iş günü", fee: 15 },
    ],
  },
  {
    id: "marriage-certificate",
    icon: "💍",
    name: "Nikah şəhadətnaməsi",
    description: "ASAN xidmət vasitəsilə dublikat",
    lossFine: 5,
    urgencies: [
      { id: "std", label: "Standart", days: "3-5 iş günü", fee: 5 },
      { id: "exp", label: "Sürətli", days: "1 iş günü", fee: 15 },
    ],
  },
  {
    id: "diploma",
    icon: "🎓",
    name: "Ali məktəb diplomu (dublikat)",
    description: "Təhsil müəssisəsindən dublikat alınması",
    lossFine: 0,
    lossFineNote: "Cərimə tətbiq edilmir, yalnız dublikat rüsumu",
    urgencies: [{ id: "std", label: "Standart", days: "10-30 iş günü", fee: 30 }],
  },
  {
    id: "vehicle-tech-passport",
    icon: "📋",
    name: "Texniki baxış sertifikatı",
    description: "Avtomobil texniki baxış sertifikatı (dublikat)",
    lossFine: 20,
    urgencies: [{ id: "std", label: "Standart", days: "1 iş günü", fee: 10 }],
  },
];

const pt = {
  formulaTitle: "Hesablama necə aparılır?",
  formulaContent: `Mənbələr:
• "Dövlət rüsumu haqqında" Azərbaycan Respublikasının Qanunu
• İnzibati Xətalar Məcəlləsi (Maddə 327, 328) — sənədin itirilməsinə görə cərimə
• ASAN Xidmət rəsmi tarifləri

Düstur:
Yekun məbləğ = İtkinin cəriməsi + Dublikat rüsumu (təcililik dərəcəsindən asılı)

3 komponent:

1. İTKİNİN CƏRİMƏSİ (inzibati məsuliyyət)
Şəxsiyyət vəsiqəsi, pasport, sürücülük vəsiqəsi kimi sənədlərin itirilməsi inzibati xəta sayılır:
• Şəxsiyyət vəsiqəsi/pasport: 30 AZN
• Sürücülük vəsiqəsi: 40 AZN
• Avtomobil qeydiyyat vəsiqəsi: 40 AZN
• Doğum/nikah şəhadətnaməsi: 5 AZN
• Diplom: cərimə yoxdur

2. YENİ DUBLİKATIN RÜSUMU
Hər sənəd üçün dövlət rüsumu fərqlidir.

3. TƏCİLİLİK DƏRƏCƏSİ
ASAN xidmətdə standart 5-10 iş günü, lakin əlavə ödənişlə 1 iş gününə qədər sürətləndirmə mümkündür.

Misal — şəxsiyyət vəsiqəsi:
• Cərimə: 30 AZN
• Dublikat (3 iş günü): 40 AZN
• Yekun: 70 AZN

Diqqət: Tariflər ASAN xidmət və DİN tərəfindən vaxtaşırı yenilənir. Dəqiq məbləğ üçün asanxidmet.gov.az saytına və ya yerli ASAN mərkəzinə müraciət edin.`,
  documentType: "İtirilmiş sənədin növü",
  urgency: "Hazırlanma müddəti",
  includeFine: "İtkinin cəriməsi əlavə olunsun",
  includeFineDesc: "İnzibati Xətalar Məcəlləsinə əsasən sənəd itirməyə görə cərimə",
  fineLabel: "İtkinin cəriməsi",
  feeLabel: "Dublikat rüsumu",
  totalLabel: "Yekun məbləğ",
  note: "* Tariflər təxmini xarakter daşıyır. Dəqiq məbləğ üçün asanxidmet.gov.az saytına müraciət edin.",
  breakdown: "Bölgü",
  selectedDocument: "Seçilmiş sənəd",
  selectedUrgency: "Hazırlanma müddəti",
};

const formatMoney = moneyAZN;

export function LostDocFeeCalculator() {
  const { colors } = useTheme();
  const [docId, setDocId] = useState<string>(documents[0].id);
  const [urgencyId, setUrgencyId] = useState<string>(documents[0].urgencies[0].id);
  const [includeFine, setIncludeFine] = useState(true);

  const doc = useMemo(() => documents.find((d) => d.id === docId) || documents[0], [docId]);
  const urgency = useMemo(() => doc.urgencies.find((u) => u.id === urgencyId) || doc.urgencies[0], [doc, urgencyId]);

  const handleDocChange = (id: string) => {
    setDocId(id);
    const newDoc = documents.find((d) => d.id === id);
    if (newDoc) setUrgencyId(newDoc.urgencies[0].id);
  };

  const result = useMemo(() => {
    const fine = includeFine ? doc.lossFine : 0;
    const fee = urgency.fee;
    return { fine, fee, total: fine + fee };
  }, [includeFine, doc, urgency]);

  return (
    <View>
      {/* Sənəd seçimi */}
      <FieldLabel>{pt.documentType}</FieldLabel>
      <View style={st.grid}>
        {documents.map((d) => {
          const active = docId === d.id;
          return (
            <Pressable
              key={d.id}
              onPress={() => handleDocChange(d.id)}
              style={[st.docBtn, { borderColor: active ? colors.accent : colors.n280, backgroundColor: active ? colors.accent + "1f" : colors.n200 }]}
            >
              <Text style={{ fontSize: 22, marginBottom: 4 }}>{d.icon}</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", lineHeight: 15, color: active ? colors.accent : colors.n940 }}>{d.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Təcililik */}
      <FieldLabel>{pt.urgency}</FieldLabel>
      <View style={{ marginBottom: 12 }}>
        {doc.urgencies.map((u) => {
          const active = urgencyId === u.id;
          return (
            <Pressable
              key={u.id}
              onPress={() => setUrgencyId(u.id)}
              style={[
                st.urgBtn,
                { borderColor: active ? TINT.amber : colors.n280, backgroundColor: active ? TINT.amber + "1a" : colors.n200 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.n940 }}>{u.label}</Text>
                <Text style={{ fontSize: 12, color: colors.n580 }}>{u.days}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: TINT.blue }}>{formatMoney(u.fee)}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Cərimə seçimi */}
      <View style={[st.fineBox, { borderColor: colors.n280, backgroundColor: colors.n200, opacity: doc.lossFine === 0 ? 0.6 : 1, pointerEvents: doc.lossFine === 0 ? "none" : "auto" }]}>
        <Checkbox
          label={doc.lossFine > 0 ? `${pt.includeFine}  (+${formatMoney(doc.lossFine)})` : pt.includeFine}
          description={pt.includeFineDesc}
          checked={includeFine}
          onChange={setIncludeFine}
        />
        {doc.lossFineNote && (
          <Text style={{ fontSize: 11, fontStyle: "italic", color: colors.n580, marginLeft: 32, marginTop: -2, marginBottom: 4 }}>{doc.lossFineNote}</Text>
        )}
      </View>

      {/* Nəticə */}
      <TintHero label={pt.totalLabel} value={formatMoney(result.total)} sub={`${doc.icon} ${doc.name}`} tint="red" />

      <Panel title={pt.breakdown} icon="📊">
        <TintRow label={pt.selectedDocument} value={`${doc.icon} ${doc.name}`} />
        <TintRow label={pt.selectedUrgency} value={`${urgency.label} — ${urgency.days}`} />
        {result.fine > 0 && <TintRow label={pt.fineLabel} value={`+${formatMoney(result.fine)}`} tint="red" />}
        <TintRow label={pt.feeLabel} value={`+${formatMoney(result.fee)}`} tint="blue" />
        <TintRow label={pt.totalLabel} value={formatMoney(result.total)} tint="green" bold last />
      </Panel>

      <NoteBox>{pt.note}</NoteBox>

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["court-fee", "vehicle-fees", "notary-fee", "civil-servant-salary"]} />
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  docBtn: { flexBasis: "47%", flexGrow: 1, borderWidth: 1.5, borderRadius: 12, padding: 10 },
  urgBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 8 },
  fineBox: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
});
