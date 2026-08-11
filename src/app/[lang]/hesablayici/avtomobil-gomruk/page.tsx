"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// Avtomobil gömrük rüsumu — Dövlət Gömrük Komitəsinin rəsmi servisi ilə hesablanır
// API: https://c2b-fbusiness.customs.gov.az/api/v1/dictionaries/calAutoDuty
// /api/auto-duty proxy vasitəsilə çağırılır (CORS səbəbilə birbaşa çağırış mümkün deyil)

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
// code = lüğət kodu (select dəyəri/açarı), api = calAutoDuty-yə göndərilən engineType (abbreviation2).
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

function fmt(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// HTML date (yyyy-mm-dd) → dd.MM.yyyy
function toApiDate(htmlDate: string): string {
  if (!htmlDate) return "";
  const [y, m, d] = htmlDate.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
}

const autoTypeOptions: Record<Lang, { value: AutoType; label: string }[]> = {
  az: [
    { value: "0", label: "Minik-avtomobili" },
    { value: "1", label: "Avtobus" },
  ],
  en: [
    { value: "0", label: "Passenger car" },
    { value: "1", label: "Bus" },
  ],
  ru: [
    { value: "0", label: "Легковой автомобиль" },
    { value: "1", label: "Автобус" },
  ],
};

const pageTranslations = {
  az: {
    title: "Avtomobil gömrük hesablayıcısı",
    description:
      "Dövlət Gömrük Komitəsinin rəsmi servisi ilə avtomobil idxalında gömrük rüsumu, aksiz, ƏDV və digər ödənişləri dəqiq hesablayın.",
    breadcrumbCategory: "Avtomobil",
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
    autoType: "Nəqliyyat vasitəsinin növü",
    engineType: "Mühərrikin növü",
    engineTypePlaceholder: "Seçin...",
    engineVolume: "Mühərrikin həcmi (sm³)",
    engineVolumePlaceholder: "Məsələn: 1600",
    commerceType: "Mənşə (istehsal) ölkəsi və göndərən ölkə haqqında",
    commerceOther: "Digər ölkələr",
    commerceFree: "Azad ticarət sazişi bağlanan ölkədə istehsal olunub və oradan gətirilir",
    issueDate: "İstehsal tarixi",
    invoice: "İnvoys dəyəri (USD)",
    transportExpenses: "Nəqliyyat xərci (USD)",
    otherExpenses: "Digər xərclər (USD)",
    pricePlaceholder: "Məsələn: 15000",
    calculate: "Rüsumları Hesabla",
    calculating: "Hesablanır...",
    freeTradeInfo:
      "Azad ticarət sazişi bağlanan ölkələr: Rusiya, Gürcüstan, Moldova, Ukrayna, Özbəkistan, Türkmənistan, Qazaxıstan, Qırğızıstan, Tacikistan. Bu ölkələr üçün idxal gömrük rüsumu hesablanmır.",
    resultTitle: "Gömrük ödənişləri",
    customsCost: "Gömrük dəyəri (AZN)",
    usdCourse: "USD məzənnəsi",
    total: "Cəmi gömrük ödənişləri",
    disclaimerTitle: "Diqqət:",
    disclaimer:
      "Nəticələr Dövlət Gömrük Komitəsinin rəsmi servisindən alınır. Faktiki məbləğ bəyannamənin rəsmiləşdirilməsi zamanı dəqiqləşə bilər.",
    errorTitle: "Xəta baş verdi",
    errorGeneric: "Hesablama mümkün olmadı. Bir azdan yenidən cəhd edin.",
    fillFields: "Hesablamaq üçün bütün məcburi sahələri doldurun.",
    emptyState: "Məlumatları daxil edib “Rüsumları Hesabla” düyməsini basın.",
  },
  en: {
    title: "Car customs duty calculator",
    description:
      "Calculate customs duty, excise, VAT and other charges for car imports precisely using the official State Customs Committee service.",
    breadcrumbCategory: "Automotive",
    formulaTitle: "How is car customs duty calculated?",
    formulaContent: `This calculator uses the official State Customs Committee (SCC) service (e-customs.gov.az); results come directly from the official service.

Factors affecting the calculation:
• Vehicle type (passenger car, bus, etc.)
• Engine type (petrol, diesel, gas, hybrid, electric)
• Engine volume (cc)
• Country of origin and dispatch (no import duty for Free Trade Agreement countries)
• Production (issue) date — vehicle age
• Invoice value (USD)

Charges calculated include: import customs duty, VAT, excise, customs fees, disposal fee, certificate and license fees, electronic customs service fee, etc.

The USD value is converted to AZN at the Central Bank rate.`,
    sectionTitle: "Vehicle data",
    autoType: "Vehicle type",
    engineType: "Engine type",
    engineTypePlaceholder: "Select...",
    engineVolume: "Engine volume (cc)",
    engineVolumePlaceholder: "e.g. 1600",
    commerceType: "About the country of origin and dispatch",
    commerceOther: "Other countries",
    commerceFree: "Produced in and imported from a country with a free trade agreement",
    issueDate: "Production date",
    invoice: "Invoice value (USD)",
    transportExpenses: "Transport expenses (USD)",
    otherExpenses: "Other expenses (USD)",
    pricePlaceholder: "e.g. 15000",
    calculate: "Calculate duties",
    calculating: "Calculating...",
    freeTradeInfo:
      "Free Trade Agreement countries: Russia, Georgia, Moldova, Ukraine, Uzbekistan, Turkmenistan, Kazakhstan, Kyrgyzstan, Tajikistan. No import customs duty is calculated for these countries.",
    resultTitle: "Customs payments",
    customsCost: "Customs value (AZN)",
    usdCourse: "USD exchange rate",
    total: "Total customs payments",
    disclaimerTitle: "Note:",
    disclaimer:
      "Results are obtained from the official State Customs Committee service. The actual amount may be refined during declaration processing.",
    errorTitle: "An error occurred",
    errorGeneric: "Calculation failed. Please try again shortly.",
    fillFields: "Please fill in all required fields to calculate.",
    emptyState: "Enter the details and press “Calculate duties”.",
  },
  ru: {
    title: "Калькулятор автомобильной таможни",
    description:
      "Точно рассчитайте таможенную пошлину, акциз, НДС и другие платежи при импорте автомобиля с помощью официального сервиса Государственного таможенного комитета.",
    breadcrumbCategory: "Автомобиль",
    formulaTitle: "Как рассчитывается таможенная пошлина на автомобиль?",
    formulaContent: `Этот калькулятор использует официальный сервис Государственного таможенного комитета (ГТК, e-customs.gov.az); результаты поступают напрямую из официального сервиса.

Факторы, влияющие на расчёт:
• Тип транспортного средства (легковой, автобус и т.д.)
• Тип двигателя (бензин, дизель, газ, гибрид, электро)
• Объём двигателя (см³)
• Страна происхождения и отправления (для стран Соглашения о свободной торговле импортная пошлина не начисляется)
• Дата выпуска — возраст автомобиля
• Стоимость по инвойсу (USD)

В расчёт входят: импортная таможенная пошлина, НДС, акциз, таможенные сборы, плата за утилизацию, сборы за удостоверение и сертификат, сбор за электронную таможенную услугу и др.

Стоимость в USD конвертируется в AZN по курсу Центрального банка.`,
    sectionTitle: "Данные транспортного средства",
    autoType: "Тип транспортного средства",
    engineType: "Тип двигателя",
    engineTypePlaceholder: "Выберите...",
    engineVolume: "Объём двигателя (см³)",
    engineVolumePlaceholder: "Например: 1600",
    commerceType: "О стране происхождения и отправления",
    commerceOther: "Другие страны",
    commerceFree: "Произведено в стране с соглашением о свободной торговле и ввезено оттуда",
    issueDate: "Дата выпуска",
    invoice: "Стоимость по инвойсу (USD)",
    transportExpenses: "Транспортные расходы (USD)",
    otherExpenses: "Прочие расходы (USD)",
    pricePlaceholder: "Например: 15000",
    calculate: "Рассчитать платежи",
    calculating: "Расчёт...",
    freeTradeInfo:
      "Страны Соглашения о свободной торговле: Россия, Грузия, Молдова, Украина, Узбекистан, Туркменистан, Казахстан, Киргизия, Таджикистан. Для этих стран импортная таможенная пошлина не начисляется.",
    resultTitle: "Таможенные платежи",
    customsCost: "Таможенная стоимость (AZN)",
    usdCourse: "Курс USD",
    total: "Всего таможенных платежей",
    disclaimerTitle: "Внимание:",
    disclaimer:
      "Результаты получены из официального сервиса Государственного таможенного комитета. Фактическая сумма может уточняться при оформлении декларации.",
    errorTitle: "Произошла ошибка",
    errorGeneric: "Не удалось выполнить расчёт. Повторите попытку позже.",
    fillFields: "Заполните все обязательные поля для расчёта.",
    emptyState: "Введите данные и нажмите «Рассчитать платежи».",
  },
};

export default function CarCustomsCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [autoType, setAutoType] = useState<AutoType>("0");
  const [engineCode, setEngineCode] = useState("");
  const [engine, setEngine] = useState("");
  const [commerceType, setCommerceType] = useState<CommerceType>("0");
  const [issueDate, setIssueDate] = useState("");
  const [invoice, setInvoice] = useState("");
  const [transportExpenses, setTransportExpenses] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AutoDutyData | null>(null);

  const selectedEngine = ENGINE_TYPES.find((e) => e.code === engineCode);
  const isElectric = selectedEngine?.api === ELECTRIC_API;

  async function handleCalculate() {
    setError(null);
    setResult(null);

    const invoiceNum = parseFloat(invoice);
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
      transportExpenses: parseFloat(transportExpenses) || 0,
      otherExpenses: parseFloat(otherExpenses) || 0,
    };

    setLoading(true);
    try {
      // Birbaşa DGK servisi (CORS açıqdır) — statik hostda da işləyir.
      // Uğursuz olarsa, lokal proxy-yə (Cloudflare Function / dev) keç.
      let json: BaseResponse | null = null;
      try {
        const res = await fetch("https://c2b-fbusiness.customs.gov.az/api/v1/dictionaries/calAutoDutyv2", {
          method: "POST",
          headers: { "Content-Type": "application/json", lang, requestSource: "1" },
          body: JSON.stringify(body),
        });
        json = await res.json();
      } catch {
        const res = await fetch(`/api/auto-duty?lang=${lang}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        json = await res.json();
      }

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

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";
  const selectClass =
    "w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer";

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=automotive" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["road-tax", "osago", "fuel-cost", "car-loan"]}
    >
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-foreground">{pt.sectionTitle}</h3>

        {/* Nəqliyyat vasitəsinin növü */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.autoType} <span className="text-red-500">*</span>
          </label>
          <select value={autoType} onChange={(e) => setAutoType(e.target.value as AutoType)} className={selectClass}>
            {autoTypeOptions[lang].map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Mühərrikin növü */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.engineType} <span className="text-red-500">*</span>
          </label>
          <select
            value={engineCode}
            onChange={(e) => setEngineCode(e.target.value)}
            className={selectClass}
          >
            <option value="">{pt.engineTypePlaceholder}</option>
            {ENGINE_TYPES.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* İnvoys dəyəri + Nəqliyyat xərci */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.invoice} <span className="text-red-500">*</span>
            </label>
            <input type="number" value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder={pt.pricePlaceholder} min="0" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.transportExpenses}
            </label>
            <input type="number" value={transportExpenses} onChange={(e) => setTransportExpenses(e.target.value)} placeholder="0" min="0" className={inputClass} />
          </div>
        </div>

        {/* Digər xərclər + Mühərrikin həcmi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.otherExpenses}
            </label>
            <input type="number" value={otherExpenses} onChange={(e) => setOtherExpenses(e.target.value)} placeholder="0" min="0" className={inputClass} />
          </div>
          {!isElectric && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {pt.engineVolume} <span className="text-red-500">*</span>
              </label>
              <input type="number" value={engine} onChange={(e) => setEngine(e.target.value)} placeholder={pt.engineVolumePlaceholder} min="0" max="999999" className={inputClass} />
            </div>
          )}
        </div>

        {/* İstehsal tarixi */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.issueDate} <span className="text-red-500">*</span>
          </label>
          <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
        </div>

        {/* Mənşə / göndərən ölkə — radio */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <label className="block text-sm font-medium text-foreground">{pt.commerceType}</label>
            <span className="text-muted text-xs" title={pt.freeTradeInfo}>ⓘ</span>
          </div>
          <div className="space-y-2">
            {([
              { v: "0" as const, label: pt.commerceOther },
              { v: "1" as const, label: pt.commerceFree },
            ]).map(({ v, label }) => (
              <label key={v} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="commerceType"
                  checked={commerceType === v}
                  onChange={() => setCommerceType(v)}
                  className="w-4 h-4 mt-0.5 border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hesabla düyməsi */}
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? pt.calculating : pt.calculate}
        </button>

        {/* Azad ticarət info */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">ℹ️ {pt.freeTradeInfo}</p>
        </div>

        {/* Xəta */}
        {error && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-sm font-semibold text-red-700 mb-0.5">{pt.errorTitle}</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Nəticə */}
        {result && (
          <div className="space-y-4">
            {/* Üst kartlar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {result.autoDuty.customsCost != null && (
                <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
                  <p className="text-sm text-muted mb-1">{pt.customsCost}</p>
                  <p className="text-xl font-bold text-foreground">{fmt(result.autoDuty.customsCost)}</p>
                  <p className="text-xs text-muted mt-1">AZN</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
                <p className="text-sm text-muted mb-1">{pt.usdCourse}</p>
                <p className="text-xl font-bold text-foreground">{result.usdCourse}</p>
                <p className="text-xs text-muted mt-1">USD → AZN</p>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">{pt.total}</p>
                <p className="text-xl font-bold">{fmt(result.autoDuty.total.value)}</p>
                <p className="text-xs text-blue-200 mt-1">AZN</p>
              </div>
            </div>

            {/* Detallı cədvəl */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span>
                  {pt.resultTitle}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {result.autoDuty.duties.map((d) => (
                  <div key={d.code} className="flex justify-between px-5 py-3 gap-4">
                    <span className="text-sm text-muted">{d.name}</span>
                    <span className={`text-sm font-medium whitespace-nowrap ${d.value > 0 ? "text-foreground" : "text-green-600"}`}>
                      {fmt(d.value)} AZN
                    </span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-4 bg-primary-light">
                  <span className="text-sm font-semibold text-primary-dark">{result.autoDuty.total.name}</span>
                  <span className="text-sm font-bold text-primary-dark whitespace-nowrap">
                    {fmt(result.autoDuty.total.value)} AZN
                  </span>
                </div>
              </div>
            </div>

            {/* Qeyd */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-semibold">{pt.disclaimerTitle}</span> {pt.disclaimer}
              </p>
            </div>
          </div>
        )}

        {/* Boş vəziyyət */}
        {!result && !error && (
          <div className="text-center py-6 text-muted">
            <span className="text-4xl block mb-3">🚗</span>
            <p>{pt.emptyState}</p>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
