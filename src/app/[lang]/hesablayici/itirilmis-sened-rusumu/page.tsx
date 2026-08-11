"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

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
  lossFine: number;        // İtirməyə görə inzibati cərimə
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
    urgencies: [
      { id: "std", label: "Standart", days: "3-7 iş günü", fee: 40 },
    ],
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
    urgencies: [
      { id: "std", label: "Standart", days: "10-30 iş günü", fee: 30 },
    ],
  },
  {
    id: "vehicle-tech-passport",
    icon: "📋",
    name: "Texniki baxış sertifikatı",
    description: "Avtomobil texniki baxış sertifikatı (dublikat)",
    lossFine: 20,
    urgencies: [
      { id: "std", label: "Standart", days: "1 iş günü", fee: 10 },
    ],
  },
];

const t = {
  az: {
    title: "Dövlət rüsumu — itirilmiş sənəd",
    description: "Şəxsiyyət vəsiqəsi, pasport, sürücülük vəsiqəsi və digər sənədlərin itkisi: cərimə + dublikat rüsumu + təcililik dərəcəsi.",
    breadcrumbCategory: "Hüquq və Dövlət",
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
    quickAccess: "Sürətli seçim",
    emptyState: "Sənəd növünü və hazırlanma müddətini seçin.",
    summary: "Hesablama detalları",
    note: "* Tariflər təxmini xarakter daşıyır. Dəqiq məbləğ üçün asanxidmet.gov.az saytına müraciət edin.",
    legalBasis: "Hüquqi əsas",
    days: "iş günü",
    breakdown: "Bölgü",
    selectedDocument: "Seçilmiş sənəd",
    selectedUrgency: "Hazırlanma müddəti",
  },
  en: {
    title: "State Fee — Lost Document",
    description: "ID card, passport, driver's license and other lost documents: fine + duplicate fee + urgency.",
    breadcrumbCategory: "Legal & Government",
    formulaTitle: "How is it calculated?",
    formulaContent: `Sources:
• Law of the Republic of Azerbaijan on State Fees
• Code of Administrative Offences (Articles 327, 328) — fines for lost documents
• Official ASAN Service tariffs

Formula:
Total = Loss fine + Duplicate fee (depending on urgency)

3 components:
1. LOSS FINE (administrative liability)
2. DUPLICATE FEE (state fee for new document)
3. URGENCY LEVEL (1-10 working days)

Example — ID card:
• Fine: 30 AZN
• Duplicate (3 working days): 40 AZN
• Total: 70 AZN`,
    documentType: "Type of lost document",
    urgency: "Processing time",
    includeFine: "Include loss fine",
    includeFineDesc: "Fine for losing the document under the Code of Administrative Offences",
    fineLabel: "Loss fine",
    feeLabel: "Duplicate fee",
    totalLabel: "Total amount",
    quickAccess: "Quick select",
    emptyState: "Select the type of document and processing time.",
    summary: "Calculation details",
    note: "* Tariffs are approximate. For exact amounts, visit asanxidmet.gov.az.",
    legalBasis: "Legal basis",
    days: "working days",
    breakdown: "Breakdown",
    selectedDocument: "Selected document",
    selectedUrgency: "Processing time",
  },
  ru: {
    title: "Госпошлина — утерянный документ",
    description: "Удостоверение личности, паспорт, водительские права и другие утерянные документы: штраф + пошлина за дубликат + срочность.",
    breadcrumbCategory: "Право и Государство",
    formulaTitle: "Как рассчитывается?",
    formulaContent: `Источники:
• Закон Азербайджанской Республики "О государственной пошлине"
• Кодекс об административных проступках (Статьи 327, 328)
• Официальные тарифы ASAN xidmət

Формула:
Итого = Штраф за утерю + Пошлина за дубликат (по срочности)

3 компонента:
1. ШТРАФ ЗА УТЕРЮ
2. ПОШЛИНА ЗА ДУБЛИКАТ
3. УРОВЕНЬ СРОЧНОСТИ`,
    documentType: "Тип утерянного документа",
    urgency: "Срок изготовления",
    includeFine: "Учесть штраф за утерю",
    includeFineDesc: "Штраф по Кодексу об административных проступках",
    fineLabel: "Штраф за утерю",
    feeLabel: "Пошлина за дубликат",
    totalLabel: "Итоговая сумма",
    quickAccess: "Быстрый выбор",
    emptyState: "Выберите тип документа и срок изготовления.",
    summary: "Детали расчёта",
    note: "* Тарифы приблизительные. Точные суммы — на asanxidmet.gov.az.",
    legalBasis: "Правовая основа",
    days: "рабочих дней",
    breakdown: "Разбивка",
    selectedDocument: "Выбранный документ",
    selectedUrgency: "Срок изготовления",
  },
};

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " AZN";
}

export default function LostDocumentFeeCalculator() {
  const { lang } = useLanguage();
  const pt = t[lang];

  const [docId, setDocId] = useState<string>(documents[0].id);
  const [urgencyId, setUrgencyId] = useState<string>(documents[0].urgencies[0].id);
  const [includeFine, setIncludeFine] = useState<boolean>(true);

  const doc = useMemo(() => documents.find((d) => d.id === docId) || documents[0], [docId]);
  const urgency = useMemo(
    () => doc.urgencies.find((u) => u.id === urgencyId) || doc.urgencies[0],
    [doc, urgencyId]
  );

  const handleDocChange = (id: string) => {
    setDocId(id);
    const newDoc = documents.find((d) => d.id === id);
    if (newDoc) setUrgencyId(newDoc.urgencies[0].id);
  };

  const result = useMemo(() => {
    const fine = includeFine ? doc.lossFine : 0;
    const fee = urgency.fee;
    const total = fine + fee;
    return { fine, fee, total };
  }, [includeFine, doc, urgency]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=legal" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["court-fee", "vehicle-fees", "notary-fee", "civil-servant-salary"]}
    >
      {/* Document grid */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.documentType}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {documents.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDocChange(d.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                docId === d.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <div className="text-2xl mb-1">{d.icon}</div>
              <p className="text-xs font-medium text-foreground leading-tight">{d.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Urgency selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.urgency}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {doc.urgencies.map((u) => (
            <button
              key={u.id}
              onClick={() => setUrgencyId(u.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                urgencyId === u.id
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-foreground">{u.label}</p>
                  <p className="text-xs text-muted">{u.days}</p>
                </div>
                <span className="text-sm font-bold text-primary">{formatMoney(u.fee)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Include fine option */}
      <div className="mb-8">
        <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/40 transition-colors">
          <input
            type="checkbox"
            checked={includeFine}
            onChange={(e) => setIncludeFine(e.target.checked)}
            disabled={doc.lossFine === 0}
            className="mt-1 w-4 h-4 accent-primary"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {pt.includeFine}
              {doc.lossFine > 0 && (
                <span className="ml-2 text-xs text-red-600 font-semibold">+{formatMoney(doc.lossFine)}</span>
              )}
            </p>
            <p className="text-xs text-muted mt-0.5">{pt.includeFineDesc}</p>
            {doc.lossFineNote && (
              <p className="text-[11px] text-muted mt-1 italic">{doc.lossFineNote}</p>
            )}
          </div>
        </label>
      </div>

      {/* Result */}
      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-center text-white">
          <p className="text-sm text-red-100 mb-1">{pt.totalLabel}</p>
          <p className="text-4xl font-bold">{formatMoney(result.total)}</p>
          <p className="text-xs text-red-100 mt-2">{doc.icon} {doc.name}</p>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span>📊</span>
              {pt.breakdown}
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">{pt.selectedDocument}</span>
              <span className="text-sm font-medium text-foreground">{doc.icon} {doc.name}</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">{pt.selectedUrgency}</span>
              <span className="text-sm font-medium text-foreground">{urgency.label} — {urgency.days}</span>
            </div>
            {result.fine > 0 && (
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm text-red-700">{pt.fineLabel}</span>
                <span className="text-sm font-medium text-red-700">+{formatMoney(result.fine)}</span>
              </div>
            )}
            <div className="flex justify-between px-5 py-3 bg-blue-50">
              <span className="text-sm text-blue-700">{pt.feeLabel}</span>
              <span className="text-sm font-medium text-blue-700">+{formatMoney(result.fee)}</span>
            </div>
            <div className="flex justify-between px-5 py-3 bg-green-50">
              <span className="text-sm font-semibold text-green-700">{pt.totalLabel}</span>
              <span className="text-base font-bold text-green-700">{formatMoney(result.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted">{pt.note}</p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
