"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type FeeCategory =
  | "registration"
  | "inspection"
  | "certificate"
  | "license"
  | "plates"
  | "notary";

const categoryTranslations: Record<
  Lang,
  { value: FeeCategory; label: string; icon: string }[]
> = {
  az: [
    { value: "registration", label: "Qeydiyyat", icon: "📋" },
    { value: "inspection", label: "Texniki baxış", icon: "🔧" },
    { value: "certificate", label: "Şəhadətnamə", icon: "📄" },
    { value: "license", label: "Sürücülük", icon: "🪪" },
    { value: "plates", label: "Nömrə nişanları", icon: "🔢" },
    { value: "notary", label: "Notarius", icon: "📝" },
  ],
  en: [
    { value: "registration", label: "Registration", icon: "📋" },
    { value: "inspection", label: "Technical Inspection", icon: "🔧" },
    { value: "certificate", label: "Certificate", icon: "📄" },
    { value: "license", label: "Driver's License", icon: "🪪" },
    { value: "plates", label: "License Plates", icon: "🔢" },
    { value: "notary", label: "Notary", icon: "📝" },
  ],
  ru: [
    { value: "registration", label: "Регистрация", icon: "📋" },
    { value: "inspection", label: "Техосмотр", icon: "🔧" },
    { value: "certificate", label: "Свидетельство", icon: "📄" },
    { value: "license", label: "Водительские права", icon: "🪪" },
    { value: "plates", label: "Номерные знаки", icon: "🔢" },
    { value: "notary", label: "Нотариус", icon: "📝" },
  ],
};

interface FeeItem {
  description: Record<Lang, string>;
  amount: string;
  highlight?: boolean;
}

const registrationFees: FeeItem[] = [
  {
    description: {
      az: "2000 sm\u00B3-d\u0259k: 0.05 AZN h\u0259r sm\u00B3",
      en: "Up to 2000 cc: 0.05 AZN per cc",
      ru: "До 2000 см\u00B3: 0.05 AZN за см\u00B3",
    },
    amount: "0 \u2013 100",
  },
  {
    description: {
      az: "2001\u20133000 sm\u00B3: 100 + 0.10 AZN (2000-d\u0259n yuxarı h\u0259r sm\u00B3)",
      en: "2001\u20133000 cc: 100 + 0.10 AZN per cc above 2000",
      ru: "2001\u20133000 см\u00B3: 100 + 0.10 AZN за каждый см\u00B3 свыше 2000",
    },
    amount: "100 \u2013 200",
  },
  {
    description: {
      az: "3001\u20134000 sm\u00B3: 200 + 0.20 AZN (3000-d\u0259n yuxarı h\u0259r sm\u00B3)",
      en: "3001\u20134000 cc: 200 + 0.20 AZN per cc above 3000",
      ru: "3001\u20134000 см\u00B3: 200 + 0.20 AZN за каждый см\u00B3 свыше 3000",
    },
    amount: "200 \u2013 400",
  },
  {
    description: {
      az: "4001\u20135000 sm\u00B3: 400 + 0.30 AZN (4000-d\u0259n yuxarı h\u0259r sm\u00B3)",
      en: "4001\u20135000 cc: 400 + 0.30 AZN per cc above 4000",
      ru: "4001\u20135000 см\u00B3: 400 + 0.30 AZN за каждый см\u00B3 свыше 4000",
    },
    amount: "400 \u2013 700",
  },
  {
    description: {
      az: "5000 sm\u00B3-d\u0259n yuxarı (sabit)",
      en: "Over 5000 cc (flat rate)",
      ru: "Свыше 5000 см\u00B3 (фиксированная)",
    },
    amount: "1 500",
  },
  {
    description: {
      az: "Yaxın qohumlara bağışlama və digər hallar — avtonəqliyyat (18.65.3.1)",
      en: "Close relatives donation & other cases — motor vehicles (18.65.3.1)",
      ru: "Дарение близким родственникам и другие случаи — авто (18.65.3.1)",
    },
    amount: "20",
  },
  {
    description: {
      az: "Motonəqliyyat, traktor, tikinti/kənd təsərrüfatı texnikası, qoşqular (18.65.3.2)",
      en: "Motorcycles, tractors, construction/agricultural machinery, trailers (18.65.3.2)",
      ru: "Мототехника, тракторы, строительная/сельхозтехника, прицепы (18.65.3.2)",
    },
    amount: "10",
  },
];

const inspectionFees: FeeItem[] = [
  {
    description: {
      az: "Avtonəqliyyat vasitələri (18.65.1.1)",
      en: "Motor vehicles (18.65.1.1)",
      ru: "Автотранспортные средства (18.65.1.1)",
    },
    amount: "30",
  },
  {
    description: {
      az: "Motonəqliyyat, traktor, tikinti/kənd təsərrüfatı texnikası, qoşqular (18.65.1.2)",
      en: "Motorcycles, tractors, construction/agricultural machinery, trailers (18.65.1.2)",
      ru: "Мототехника, тракторы, строительная/сельхозтехника, прицепы (18.65.1.2)",
    },
    amount: "15",
  },
  {
    description: {
      az: "Texniki uçot dəyişikliyi və ya alıcı tələbi ilə texniki baxış — avtonəqliyyat (18.65.2.1)",
      en: "Technical record change or buyer request inspection — motor vehicles (18.65.2.1)",
      ru: "Техосмотр при изменении учёта или по требованию покупателя — авто (18.65.2.1)",
    },
    amount: "30",
  },
  {
    description: {
      az: "Texniki uçot dəyişikliyi və ya alıcı tələbi ilə texniki baxış — motonəqliyyat (18.65.2.2)",
      en: "Technical record change or buyer request inspection — motorcycles/tractors (18.65.2.2)",
      ru: "Техосмотр при изменении учёта или по требованию покупателя — мото (18.65.2.2)",
    },
    amount: "15",
  },
];

const certificateFees: FeeItem[] = [
  {
    description: {
      az: "Avto-moto nəqliyyat vasitələri (18.65.7.1)",
      en: "Motor vehicles and motorcycles (18.65.7.1)",
      ru: "Авто-мотоТС (18.65.7.1)",
    },
    amount: "30",
  },
  {
    description: {
      az: "Traktor, tikinti/kənd təsərrüfatı texnikası, qoşqular (18.65.7.2)",
      en: "Tractors, construction/agricultural machinery, trailers (18.65.7.2)",
      ru: "Тракторы, строительная/сельхозтехника, прицепы (18.65.7.2)",
    },
    amount: "10",
  },
];

const licenseFees: FeeItem[] = [
  {
    description: {
      az: "İlkin imtahan — avto-moto NV, tramvay, trolleybus (18.65.4.1)",
      en: "Initial exam — motor vehicles, tram, trolleybus (18.65.4.1)",
      ru: "Первичный экзамен — авто-мото, трамвай, троллейбус (18.65.4.1)",
    },
    amount: "40",
  },
  {
    description: {
      az: "Təkrar imtahan — avto-moto NV, tramvay, trolleybus (18.65.4.1-1)",
      en: "Retake exam — motor vehicles, tram, trolleybus (18.65.4.1-1)",
      ru: "Пересдача — авто-мото, трамвай, троллейбус (18.65.4.1-1)",
    },
    amount: "20",
  },
  {
    description: {
      az: "Digər sürücülük vəsiqəsi, traktorçu-maşinist vəsiqəsi imtahanı (18.65.4.2)",
      en: "Other license exam, tractor-machinist license (18.65.4.2)",
      ru: "Экзамен на другие права, тракторист-машинист (18.65.4.2)",
    },
    amount: "10",
  },
  {
    description: {
      az: "Sürücülük vəsiqəsinin verilməsi/dəyişdirilməsi — avto-moto NV (18.65.5.1)",
      en: "License issuance/replacement — motor vehicles (18.65.5.1)",
      ru: "Выдача/замена прав — авто-мото (18.65.5.1)",
    },
    amount: "30",
  },
  {
    description: {
      az: "Beynəlxalq sürücülük vəsiqəsinin verilməsi/dəyişdirilməsi (18.65.5.1-1)",
      en: "International driving permit issuance/replacement (18.65.5.1-1)",
      ru: "Выдача/замена международного водительского удостоверения (18.65.5.1-1)",
    },
    amount: "12",
  },
  {
    description: {
      az: "Digər NV — traktor, tikinti texnikası və s. sürücülük vəsiqəsi (18.65.5.2)",
      en: "Other vehicles — tractors, construction machinery license (18.65.5.2)",
      ru: "Другие ТС — тракторы, строительная техника, права (18.65.5.2)",
    },
    amount: "10",
  },
];

const plateFees: FeeItem[] = [
  {
    description: {
      az: "Standart avtonəqliyyat nişanı (təkrar verilmə daxil) (18.65.6.2)",
      en: "Standard motor vehicle plates (incl. reissue) (18.65.6.2)",
      ru: "Стандартные номера авто (вкл. повторную выдачу) (18.65.6.2)",
    },
    amount: "30",
  },
  {
    description: {
      az: "Motonəqliyyat, traktor, qoşqular üçün nişan (18.65.6.3)",
      en: "Motorcycle, tractor, trailer plates (18.65.6.3)",
      ru: "Номера для мото, тракторов, прицепов (18.65.6.3)",
    },
    amount: "15",
  },
  {
    description: {
      az: "Premium 001–009 (müxtəlif hərflər)",
      en: "Premium 001–009 (mixed letters)",
      ru: "Премиум 001–009 (разные буквы)",
    },
    amount: "2 000",
    highlight: true,
  },
  {
    description: {
      az: "Premium 001–009 (eyni hərflər)",
      en: "Premium 001–009 (same letters)",
      ru: "Премиум 001–009 (одинаковые буквы)",
    },
    amount: "3 000",
    highlight: true,
  },
  {
    description: {
      az: "Premium 100–900 (müxtəlif hərflər)",
      en: "Premium 100–900 (mixed letters)",
      ru: "Премиум 100–900 (разные буквы)",
    },
    amount: "1 500",
    highlight: true,
  },
  {
    description: {
      az: "Premium 100–900 (eyni hərflər)",
      en: "Premium 100–900 (same letters)",
      ru: "Премиум 100–900 (одинаковые буквы)",
    },
    amount: "2 000",
    highlight: true,
  },
  {
    description: {
      az: "Premium 111–999 (müxtəlif hərflər)",
      en: "Premium 111–999 (mixed letters)",
      ru: "Премиум 111–999 (разные буквы)",
    },
    amount: "1 000",
    highlight: true,
  },
  {
    description: {
      az: "Premium 111–999 (eyni hərflər)",
      en: "Premium 111–999 (same letters)",
      ru: "Премиум 111–999 (одинаковые буквы)",
    },
    amount: "1 500",
    highlight: true,
  },
];

const notaryFees: FeeItem[] = [
  {
    description: {
      az: "NV özgəninkiləşdirilməsi etibarnaməsi (yaxın qohumlar): 35 + 5.25 xidmət haqqı",
      en: "Vehicle transfer power of attorney (close relatives): 35 + 5.25 service fee",
      ru: "Доверенность на отчуждение ТС (близкие родственники): 35 + 5.25 сервисный сбор",
    },
    amount: "40.25",
  },
  {
    description: {
      az: "NV özgəninkiləşdirilməsi etibarnaməsi (digər şəxslər): 70 + 10.50 xidmət haqqı",
      en: "Vehicle transfer power of attorney (others): 70 + 10.50 service fee",
      ru: "Доверенность на отчуждение ТС (другие лица): 70 + 10.50 сервисный сбор",
    },
    amount: "80.50",
  },
  {
    description: {
      az: "NV istifadə etibarnaməsi (yaxın qohumlar)",
      en: "Vehicle usage power of attorney (close relatives)",
      ru: "Доверенность на использование ТС (близкие родственники)",
    },
    amount: "10",
  },
  {
    description: {
      az: "NV istifadə etibarnaməsi (digər şəxslər)",
      en: "Vehicle usage power of attorney (others)",
      ru: "Доверенность на использование ТС (другие лица)",
    },
    amount: "15",
  },
  {
    description: {
      az: "Vəsiyyətnamələrin təsdiqi",
      en: "Testament notarization",
      ru: "Удостоверение завещания",
    },
    amount: "15",
  },
  {
    description: {
      az: "Notariat sənədlərinin dublikatı",
      en: "Duplicate of notarized documents",
      ru: "Дубликат нотариальных документов",
    },
    amount: "6",
  },
  {
    description: {
      az: "İmzanın həqiqiliyinin təsdiqi (hər imza)",
      en: "Signature authentication (per signature)",
      ru: "Удостоверение подлинности подписи (за каждую)",
    },
    amount: "3",
  },
  {
    description: {
      az: "Sənəd tərcüməsinin təsdiqi (ilk səhifə: 1.50, sonrakı hər səhifə: 0.50)",
      en: "Document translation verification (1st page: 1.50, each additional: 0.50)",
      ru: "Удостоверение перевода документа (1-я стр.: 1.50, каждая следующая: 0.50)",
    },
    amount: "1.50",
  },
];

const feeDataMap: Record<FeeCategory, FeeItem[]> = {
  registration: registrationFees,
  inspection: inspectionFees,
  certificate: certificateFees,
  license: licenseFees,
  plates: plateFees,
  notary: notaryFees,
};

const sectionTitleTranslations: Record<Lang, Record<FeeCategory, string>> = {
  az: {
    registration: "Qeydiyyat rüsumu",
    inspection: "Texniki baxış rüsumu",
    certificate: "Qeydiyyat şəhadətnaməsi",
    license: "Sürücülük vəsiqəsi",
    plates: "Nömrə nişanları",
    notary: "Notarius xidmətləri",
  },
  en: {
    registration: "Vehicle Registration Fee",
    inspection: "Technical Inspection Fee",
    certificate: "Registration Certificate",
    license: "Driver's License",
    plates: "License Plates",
    notary: "Notary Services",
  },
  ru: {
    registration: "Регистрационная пошлина",
    inspection: "Пошлина за техосмотр",
    certificate: "Свидетельство о регистрации",
    license: "Водительское удостоверение",
    plates: "Номерные знаки",
    notary: "Нотариальные услуги",
  },
};

function calculateRegistrationFee(cc: number): number {
  if (cc <= 0) return 0;
  if (cc <= 2000) return cc * 0.05;
  if (cc <= 3000) return 100 + (cc - 2000) * 0.1;
  if (cc <= 4000) return 200 + (cc - 3000) * 0.2;
  if (cc <= 5000) return 400 + (cc - 4000) * 0.3;
  return 1500;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Nəqliyyat rüsumları hesablayıcısı",
    description:
      "Azərbaycanda nəqliyyat vasitələri ilə bağlı bütün rüsum və ödənişləri öyrənin.",
    breadcrumbCategory: "Avtomobil",
    breadcrumbLabel: "Rüsumlar",
    formulaTitle: "Qeydiyyat rüsumu necə hesablanır?",
    formulaContent: `Mühərrik həcminə görə qeydiyyat rüsumu:

\u2022 2000 sm\u00B3-d\u0259k: 0.05 AZN \u00D7 h\u0259cm
\u2022 2001\u20133000 sm\u00B3: 100 + 0.10 AZN \u00D7 (h\u0259cm \u2013 2000)
\u2022 3001\u20134000 sm\u00B3: 200 + 0.20 AZN \u00D7 (h\u0259cm \u2013 3000)
\u2022 4001\u20135000 sm\u00B3: 400 + 0.30 AZN \u00D7 (h\u0259cm \u2013 4000)
\u2022 5000 sm\u00B3-d\u0259n yuxarı: 1500 AZN (sabit)

Yaxın qohumlar arasında bağışlama:
\u2022 Avtomobil: 20 AZN
\u2022 Motosiklet: 10 AZN`,
    searchPlaceholder: "Rüsum axtar...",
    engineDisplacement: "Mühərrik həcmi (sm\u00B3)",
    calculatedFee: "Hesablanmış qeydiyyat rüsumu",
    enterEngine: "Mühərrik həcmini daxil edin",
    feeDescription: "Xidmət",
    feeAmount: "Məbləğ (AZN)",
    allFees: "Bütün rüsumlar",
    noResults: "Axtarışa uyğun nəticə tapılmadı",
    infoNote:
      "Bu məlumatlar informativ xarakter daşıyır. Dəqiq məbləğlər üçün DYP-yə və ya müvafiq quruma müraciət edin.",
    attention: "Diqqət:",
  },
  en: {
    title: "Vehicle Fees & Duties Calculator",
    description:
      "Find all vehicle-related fees and duties in Azerbaijan.",
    breadcrumbCategory: "Automotive",
    breadcrumbLabel: "Fees & Duties",
    formulaTitle: "How is the registration fee calculated?",
    formulaContent: `Registration fee by engine displacement:

\u2022 Up to 2000 cc: 0.05 AZN \u00D7 displacement
\u2022 2001\u20133000 cc: 100 + 0.10 AZN \u00D7 (displacement \u2013 2000)
\u2022 3001\u20134000 cc: 200 + 0.20 AZN \u00D7 (displacement \u2013 3000)
\u2022 4001\u20135000 cc: 400 + 0.30 AZN \u00D7 (displacement \u2013 4000)
\u2022 Over 5000 cc: 1500 AZN (flat)

Close relatives donation:
\u2022 Cars: 20 AZN
\u2022 Motorcycles: 10 AZN`,
    searchPlaceholder: "Search fees...",
    engineDisplacement: "Engine displacement (cc)",
    calculatedFee: "Calculated registration fee",
    enterEngine: "Enter engine displacement",
    feeDescription: "Service",
    feeAmount: "Amount (AZN)",
    allFees: "All fees",
    noResults: "No results found for your search",
    infoNote:
      "This information is for reference only. For exact amounts, contact the Traffic Police or the relevant authority.",
    attention: "Note:",
  },
  ru: {
    title: "Калькулятор транспортных пошлин",
    description:
      "Узнайте все сборы и пошлины, связанные с транспортными средствами в Азербайджане.",
    breadcrumbCategory: "Автомобиль",
    breadcrumbLabel: "Пошлины",
    formulaTitle: "Как рассчитывается регистрационная пошлина?",
    formulaContent: `Регистрационная пошлина по объёму двигателя:

\u2022 До 2000 см\u00B3: 0.05 AZN \u00D7 объём
\u2022 2001\u20133000 см\u00B3: 100 + 0.10 AZN \u00D7 (объём \u2013 2000)
\u2022 3001\u20134000 см\u00B3: 200 + 0.20 AZN \u00D7 (объём \u2013 3000)
\u2022 4001\u20135000 см\u00B3: 400 + 0.30 AZN \u00D7 (объём \u2013 4000)
\u2022 Свыше 5000 см\u00B3: 1500 AZN (фиксированная)

Дарение между близкими родственниками:
\u2022 Автомобиль: 20 AZN
\u2022 Мотоцикл: 10 AZN`,
    searchPlaceholder: "Поиск пошлин...",
    engineDisplacement: "Объём двигателя (см\u00B3)",
    calculatedFee: "Рассчитанная пошлина за регистрацию",
    enterEngine: "Введите объём двигателя",
    feeDescription: "Услуга",
    feeAmount: "Сумма (AZN)",
    allFees: "Все пошлины",
    noResults: "По вашему запросу ничего не найдено",
    infoNote:
      "Данная информация носит справочный характер. Для уточнения сумм обращайтесь в ДПС или соответствующий орган.",
    attention: "Внимание:",
  },
};

export default function RusumCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const categories = categoryTranslations[lang];
  const sectionTitles = sectionTitleTranslations[lang];

  const [activeCategory, setActiveCategory] = useState<FeeCategory>("registration");
  const [engineCc, setEngineCc] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const registrationResult = useMemo(() => {
    const cc = parseInt(engineCc, 10);
    if (isNaN(cc) || cc <= 0) return null;
    return calculateRegistrationFee(cc);
  }, [engineCc]);

  // Filter fees based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { category: FeeCategory; items: FeeItem[] }[] = [];
    for (const [cat, items] of Object.entries(feeDataMap) as [FeeCategory, FeeItem[]][]) {
      const matched = items.filter(
        (item) =>
          item.description[lang].toLowerCase().includes(q) ||
          item.amount.toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        results.push({ category: cat as FeeCategory, items: matched });
      }
    }
    return results;
  }, [searchQuery, lang]);

  const renderFeeTable = (items: FeeItem[], highlightCalc?: number | null) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              {pt.feeDescription}
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap">
              {pt.feeAmount}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className={`border-b border-border/50 transition-colors ${
                item.highlight
                  ? "bg-amber-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <td className="py-3 px-4 text-sm text-foreground">
                {item.description[lang]}
              </td>
              <td
                className={`py-3 px-4 text-sm text-right font-semibold whitespace-nowrap ${
                  item.highlight ? "text-amber-600" : "text-primary"
                }`}
              >
                {item.amount} AZN
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSearchResults = () => {
    if (!filteredCategories) return null;
    if (filteredCategories.length === 0) {
      return (
        <div className="text-center py-8 text-muted">
          <p className="text-lg">{pt.noResults}</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {filteredCategories.map(({ category, items }) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>
                {categories.find((c) => c.value === category)?.icon}
              </span>
              {sectionTitles[category]}
            </h3>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              {renderFeeTable(items)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=automotive" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["car-customs", "road-tax", "traffic-fines", "osago"]}
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={pt.searchPlaceholder}
            className="w-full px-4 py-3 pl-10 border border-border rounded-xl bg-white text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Search results or category view */}
      {searchQuery.trim() ? (
        renderSearchResults()
      ) : (
        <>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.value
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white border border-border text-foreground hover:border-primary/30 hover:bg-primary-light"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Section Title */}
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>
              {categories.find((c) => c.value === activeCategory)?.icon}
            </span>
            {sectionTitles[activeCategory]}
          </h2>

          {/* Engine Displacement Calculator (only for registration) */}
          {activeCategory === "registration" && (
            <div className="mb-6 p-4 bg-primary-light border border-primary/20 rounded-xl">
              <label className="block text-sm font-medium text-foreground mb-2">
                {pt.engineDisplacement}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={engineCc}
                  onChange={(e) => setEngineCc(e.target.value)}
                  placeholder="1600"
                  className="flex-1 px-4 py-3 border border-border rounded-xl bg-white text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <span className="text-sm text-muted whitespace-nowrap">
                  sm&sup3;
                </span>
              </div>
              {registrationResult !== null ? (
                <div className="mt-4 p-4 bg-white border border-primary/30 rounded-xl">
                  <p className="text-sm text-muted mb-1">{pt.calculatedFee}</p>
                  <p className="text-3xl font-bold text-primary">
                    {fmt(registrationResult)}{" "}
                    <span className="text-lg font-normal text-muted">AZN</span>
                  </p>
                </div>
              ) : (
                engineCc === "" && (
                  <p className="mt-3 text-sm text-muted">{pt.enterEngine}</p>
                )
              )}
            </div>
          )}

          {/* Fee Table */}
          <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
            {renderFeeTable(feeDataMap[activeCategory])}
          </div>
        </>
      )}

      {/* Info Note */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">{pt.attention} </span>
          {pt.infoNote}
        </p>
      </div>
    </CalculatorLayout>
  );
}
