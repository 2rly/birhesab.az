"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";
import { privileges } from "@/data/privileges-2026";

// Gömrük rüsumu hesablayıcısı
// Kommersiya idxalı — Dövlət Gömrük Komitəsinin rəsmi servisi ilə (HS kod əsasında, iki mərhələli):
//   1) /api/goods-duty (GET)  → check-code: malın təsviri + tələb olunan ölçü sahələri
//   2) /api/goods-duty (POST) → calculate-duty: yekun rüsumlar
// Poçt/kuryer və telefon idxalı — fiziki şəxslər üçün sadələşdirilmiş yerli hesablama.

// ── Poçt/kuryer bağlamalarına güzəşt ──
const POSTAL_EXEMPTION_LIMIT = 300; // AZN — aylıq limit
const POSTAL_DUTY_RATE = 30; // % — limitdən artıq hissəyə

// ── Telefon idxalı (şəxsi) ──
const PHONE_USD_LIMIT = 300; // USD — gömrük rüsumundan azad limit
const PHONE_DUTY_RATE = 0.36; // 36% — limitdən artıq hissəyə
const PHONE_USD_RATE = 1.70; // USD → AZN
const PHONE_SERVICE_FEE_LOW = 15;
const PHONE_SERVICE_FEE_HIGH = 30;
const PHONE_SERVICE_FEE_THRESHOLD = 1000;

const IMEI_TIERS: { upTo: number; fee: number }[] = [
  { upTo: 100, fee: 20 },
  { upTo: 200, fee: 30 },
  { upTo: 400, fee: 40 },
  { upTo: 700, fee: 50 },
  { upTo: 1000, fee: 100 },
  { upTo: Infinity, fee: 150 },
];

function getImeiFee(aznValue: number): number {
  const tier = IMEI_TIERS.find((t) => aznValue <= t.upTo);
  return tier ? tier.fee : 150;
}

type DeliveryMethod = "commercial" | "postal" | "phone";
type PhoneType = "smartphone" | "other";

// ── Rəsmi API tipləri ──
interface DependedField {
  key?: string;
  code: string;
  unit?: string;
  value?: number;
}
interface CheckCodeData {
  name: string;
  dependOnQuantity: boolean;
  dependedFields: DependedField[];
}
interface Duty {
  code: string;
  name: string;
  value: number;
}
interface GoodsDutyData {
  usdCourse: number;
  customsCost: number;
  duties: Duty[];
  total: Duty;
}
interface BaseResponse<T> {
  code: number;
  data: T | null;
  exception: {
    errorMessage?: string | null;
    validationError?: Record<string, string> | null;
  } | null;
}

// XİF MN nomenklatura kataloqu (public/data/hs-codes.json)
interface HsNode { c: string; az: string; en: string; ru: string }
interface HsCatalog { chapters: HsNode[]; leaves: HsNode[] }

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Gömrük rüsumu hesablayıcısı",
    description: "Xaricdən gətirilən mallara gömrük rüsumu, ƏDV və digər ödənişləri hesablayın.",
    breadcrumbCategory: "Hüquq və Dövlət",
    breadcrumbLabel: "Gömrük rüsumu hesablayıcısı",
    formulaTitle: "Gömrük rüsumu necə hesablanır?",
    formulaContent: `Kommersiya idxalı (rəsmi):
Bu rejim Dövlət Gömrük Komitəsinin (DGK) rəsmi servisindən istifadə edir. Malın HS (TN FƏ) kodu daxil edilir, sistem malı yoxlayır və rüsumları rəsmi tarifə əsasən hesablayır.
Addımlar:
1) Prosedur növünü seçin (İdxal / İxrac)
2) Malın 10 rəqəmli HS kodunu daxil edib "Kodu yoxla" düyməsini basın
3) İnvoys dəyəri (USD), nəqliyyat və digər xərcləri daxil edin
4) Tələb olunarsa, miqdar/ölçü məlumatlarını daxil edin
5) "Rüsumları hesabla" düyməsini basın

Poçt/kuryer bağlamaları (fiziki şəxslər):
• Aylıq ${POSTAL_EXEMPTION_LIMIT} AZN-dək — RÜSUMSUZ
• ${POSTAL_EXEMPTION_LIMIT} AZN-dən artıq hissəyə — 30% gömrük rüsumu

Telefon idxalı (şəxsi):
• 300 USD-dək — gömrük rüsumundan azad
• Artıq hissəyə 36% + gömrük xidmət haqqı + IMEI qeydiyyat rüsumu (smartfon)`,
    // Modes
    commercialImport: "🏭 Kommersiya idxalı (rəsmi)",
    postalDelivery: "📮 Poçt / Kuryer bağlaması",
    phoneImport: "📱 Telefon idxalı (şəxsi)",
    // Commercial (official API)
    declarationMode: "Prosedur növü",
    import: "İdxal",
    export: "İxrac",
    hsCode: "Malın HS (TN FƏ) kodu",
    hsCodePlaceholder: "10 rəqəm, məsələn: 2201101100",
    checkCode: "Kodu yoxla",
    checking: "Yoxlanılır...",
    goodsName: "Malın təsviri",
    invoice: "İnvoys dəyəri (USD)",
    invoicePlaceholder: "Məsələn: 1000",
    transportExpenses: "Nəqliyyat xərcləri (USD)",
    otherExpenses: "Digər xərclər (USD)",
    measurements: "Hesablama üçün ölçü məlumatları",
    quantityFor: "Miqdar (tələb olunarsa)",
    quantityHint: "Bəzi mallar (içki, yanacaq və s.) üçün miqdar tələb olunur. Vahid HS koduna görə dəyişir (litr, kq, ədəd).",
    quantityNeeded: "Bu mal üçün miqdar daxil edin (məs. litr, kq və ya ədəd).",
    privilegeLabel: "İmtiyaz (güzəşt)",
    privilegeHint: "Azad ticarət, humanitar yardım və digər güzəştlər. Uyğun deyilsə «İmtiyaz yoxdur» saxlayın.",
    calculate: "Rüsumları hesabla",
    calculating: "Hesablanır...",
    customsCostRow: "Gömrük dəyəri",
    usdCourse: "USD məzənnəsi",
    needCheckFirst: "Əvvəlcə HS kodunu yoxlayın.",
    hsCodeRequired: "Zəhmət olmasa, düzgün HS kodu daxil edin.",
    fillMeasurements: "Hesablama üçün bütün ölçü məlumatlarını doldurun.",
    invoiceRequired: "İnvoys dəyərini daxil edin.",
    errorTitle: "Xəta",
    errorGeneric: "Əməliyyat mümkün olmadı. Bir azdan yenidən cəhd edin.",
    officialNote:
      "Nəticələr Dövlət Gömrük Komitəsinin rəsmi servisindən alınır. Faktiki məbləğ bəyannamənin rəsmiləşdirilməsi zamanı dəqiqləşə bilər.",
    emptyStateCommercial: "Malın HS kodunu daxil edib yoxlayın, sonra rüsumları hesablayın.",
    pickerToggle: "Kataloqdan seç (kateqoriya / mal axtarışı)",
    pickerLoading: "Kataloq yüklənir...",
    allChapters: "Bütün fəsillər",
    pickerSearchPlaceholder: "Mal adı və ya kod axtar",
    pickerNoResults: "Nəticə tapılmadı",
    pickerHint: "Fəsil seçin və ya mal adı/kod yazın",
    // Phone
    phoneType: "Elektronika növü",
    smartphone: "Smartfon",
    smartphoneDesc: "IMEI qeydiyyatı tələb olunur",
    otherElectronics: "Digər elektronika",
    otherElectronicsDesc: "IMEI tələb olunmur",
    usdPrice: "💵 Telefonun qiyməti (USD)",
    exchangeRate: "USD → AZN dərəcəsi",
    aznValue: "AZN dəyəri (Qiymət × Dərəcə)",
    phoneCustomsDuty: "Gömrük rüsumu (300$ limiti)",
    phoneCustomsDutyDesc: "300 USD-dən artıq hissəyə 36%",
    phoneServiceFee: "Gömrük xidmət haqqı",
    phoneServiceFeeDesc: "Cəmi məbləğ ≥1000 AZN olduqda 30 AZN, əks halda 15 AZN",
    imeiFee: "IMEI qeydiyyat rüsumu",
    imeiFeeDesc: "Yalnız smartfon üçün, telefonun bazar qiymətinə görə pilləli",
    phoneFreeUnder300: "✓ 300 USD-dən az — gömrük rüsumu yoxdur",
    // Postal
    goodsValue: "📦 Malın dəyəri (AZN)",
    shippingCost: "🚚 Daşınma xərci (AZN)",
    dutyFreeTitle: "Rüsumsuz!",
    dutyFreeDesc: `Malın dəyəri aylıq ${POSTAL_EXEMPTION_LIMIT} AZN limitindən azdır. Gömrük rüsumu tətbiq olunmur.`,
    remainingLimit: "Qalan limit:",
    customsValue: "Gömrük dəyəri",
    totalDutyAndTax: "Ümumi rüsum və vergi",
    totalCost: "Ümumi xərc",
    detailedCalc: "Ətraflı hesablama",
    goodsValueRow: "Malın dəyəri",
    shippingCostRow: "Daşınma xərci",
    customsValueRow: "Gömrük dəyəri",
    exemptionLimit: "Güzəşt limiti",
    taxableAmount: "Rüsuma cəlb olunan",
    customsDutyRow: "Gömrük rüsumu",
    totalDutyRow: "Cəmi rüsum və vergi",
    totalCostRow: "Ümumi xərc (mal + rüsum)",
    goodsAndShipping: "Malın dəyəri + Daşınma",
    dutyAndTax: "Rüsum və Vergi",
    warningTitle: "Diqqət:",
    warningText: "Bu hesablama təxmini xarakter daşıyır. Faktiki gömrük rüsumu malın HS kodu, mənşə ölkəsi, ticarət sazişləri və digər amillərə görə fərqlənə bilər.",
    emptyState: "Nəticəni görmək üçün malın dəyərini daxil edin.",
  },
  en: {
    title: "Customs Duty Calculator",
    description: "Calculate customs duties, VAT and other charges on imported goods.",
    breadcrumbCategory: "Legal & Government",
    breadcrumbLabel: "Customs duty calculator",
    formulaTitle: "How are customs duties calculated?",
    formulaContent: `Commercial import (official):
This mode uses the official State Customs Committee (SCC) service. You enter the goods' HS code, the system validates it and calculates duties based on the official tariff.
Steps:
1) Select the procedure (Import / Export)
2) Enter the 10-digit HS code and press "Check code"
3) Enter invoice value (USD), transport and other expenses
4) If required, enter quantity/measurement data
5) Press "Calculate duties"

Postal/courier parcels (individuals):
• Up to ${POSTAL_EXEMPTION_LIMIT} AZN per month — DUTY FREE
• Amount exceeding ${POSTAL_EXEMPTION_LIMIT} AZN — 30% customs duty

Phone import (personal):
• Up to 300 USD — exempt from customs duty
• Excess at 36% + customs service fee + IMEI registration fee (smartphone)`,
    commercialImport: "🏭 Commercial import (official)",
    postalDelivery: "📮 Postal / Courier parcel",
    phoneImport: "📱 Phone import (personal)",
    declarationMode: "Procedure",
    import: "Import",
    export: "Export",
    hsCode: "Goods HS code",
    hsCodePlaceholder: "10 digits, e.g. 2201101100",
    checkCode: "Check code",
    checking: "Checking...",
    goodsName: "Goods description",
    invoice: "Invoice value (USD)",
    invoicePlaceholder: "e.g. 1000",
    transportExpenses: "Transport expenses (USD)",
    otherExpenses: "Other expenses (USD)",
    measurements: "Measurement data for calculation",
    quantityFor: "Quantity (if required)",
    quantityHint: "Some goods (beverages, fuel, etc.) require a quantity. The unit depends on the HS code (litre, kg, pcs).",
    quantityNeeded: "Enter a quantity for this product (e.g. litre, kg or pcs).",
    privilegeLabel: "Privilege (exemption)",
    privilegeHint: "Free trade, humanitarian aid and other exemptions. Keep \"No privilege\" if not applicable.",
    calculate: "Calculate duties",
    calculating: "Calculating...",
    customsCostRow: "Customs value",
    usdCourse: "USD exchange rate",
    needCheckFirst: "Please check the HS code first.",
    hsCodeRequired: "Please enter a valid HS code.",
    fillMeasurements: "Please fill in all measurement fields.",
    invoiceRequired: "Please enter the invoice value.",
    errorTitle: "Error",
    errorGeneric: "Operation failed. Please try again shortly.",
    officialNote:
      "Results are obtained from the official State Customs Committee service. The actual amount may be refined during declaration processing.",
    emptyStateCommercial: "Enter and check the goods' HS code, then calculate the duties.",
    pickerToggle: "Pick from catalog (category / product search)",
    pickerLoading: "Loading catalog...",
    allChapters: "All chapters",
    pickerSearchPlaceholder: "Search product name or code",
    pickerNoResults: "No results found",
    pickerHint: "Select a chapter or type a product name/code",
    phoneType: "Electronics type",
    smartphone: "Smartphone",
    smartphoneDesc: "IMEI registration required",
    otherElectronics: "Other electronics",
    otherElectronicsDesc: "No IMEI required",
    usdPrice: "💵 Phone price (USD)",
    exchangeRate: "USD → AZN rate",
    aznValue: "AZN value (Price × Rate)",
    phoneCustomsDuty: "Customs duty ($300 limit)",
    phoneCustomsDutyDesc: "36% on the amount exceeding 300 USD",
    phoneServiceFee: "Customs service fee",
    phoneServiceFeeDesc: "30 AZN if total ≥1000 AZN, otherwise 15 AZN",
    imeiFee: "IMEI registration fee",
    imeiFeeDesc: "Smartphone only, tiered by market value",
    phoneFreeUnder300: "✓ Under 300 USD — no customs duty",
    goodsValue: "📦 Goods value (AZN)",
    shippingCost: "🚚 Shipping cost (AZN)",
    dutyFreeTitle: "Duty free!",
    dutyFreeDesc: `The goods value is below the monthly ${POSTAL_EXEMPTION_LIMIT} AZN limit. No customs duty applies.`,
    remainingLimit: "Remaining limit:",
    customsValue: "Customs value",
    totalDutyAndTax: "Total duty and tax",
    totalCost: "Total cost",
    detailedCalc: "Detailed calculation",
    goodsValueRow: "Goods value",
    shippingCostRow: "Shipping cost",
    customsValueRow: "Customs value",
    exemptionLimit: "Exemption limit",
    taxableAmount: "Taxable amount",
    customsDutyRow: "Customs duty",
    totalDutyRow: "Total duty and tax",
    totalCostRow: "Total cost (goods + duty)",
    goodsAndShipping: "Goods value + Shipping",
    dutyAndTax: "Duty and Tax",
    warningTitle: "Note:",
    warningText: "This calculation is approximate. Actual customs duty may vary based on the HS code, country of origin, trade agreements and other factors.",
    emptyState: "Enter the goods value to see the result.",
  },
  ru: {
    title: "Калькулятор таможенной пошлины",
    description: "Рассчитайте таможенные пошлины, НДС и другие платежи на импортируемые товары.",
    breadcrumbCategory: "Право и государство",
    breadcrumbLabel: "Калькулятор таможенной пошлины",
    formulaTitle: "Как рассчитывается таможенная пошлина?",
    formulaContent: `Коммерческий импорт (официально):
Этот режим использует официальный сервис Государственного таможенного комитета (ГТК). Вы вводите код ТН ВЭД (HS) товара, система проверяет его и рассчитывает пошлины по официальному тарифу.
Шаги:
1) Выберите процедуру (Импорт / Экспорт)
2) Введите 10-значный код HS и нажмите «Проверить код»
3) Введите стоимость по инвойсу (USD), транспортные и прочие расходы
4) При необходимости введите данные о количестве/мере
5) Нажмите «Рассчитать платежи»

Почтовые/курьерские посылки (физические лица):
• До ${POSTAL_EXEMPTION_LIMIT} AZN в месяц — БЕЗ ПОШЛИНЫ
• Сумма свыше ${POSTAL_EXEMPTION_LIMIT} AZN — 30% таможенная пошлина

Импорт телефона (личный):
• До 300 USD — освобождён от пошлины
• Свыше — 36% + сбор за таможенное оформление + регистрация IMEI (смартфон)`,
    commercialImport: "🏭 Коммерческий импорт (офиц.)",
    postalDelivery: "📮 Почтовая / Курьерская посылка",
    phoneImport: "📱 Импорт телефона (личный)",
    declarationMode: "Процедура",
    import: "Импорт",
    export: "Экспорт",
    hsCode: "Код HS (ТН ВЭД) товара",
    hsCodePlaceholder: "10 цифр, например: 2201101100",
    checkCode: "Проверить код",
    checking: "Проверка...",
    goodsName: "Описание товара",
    invoice: "Стоимость по инвойсу (USD)",
    invoicePlaceholder: "Например: 1000",
    transportExpenses: "Транспортные расходы (USD)",
    otherExpenses: "Прочие расходы (USD)",
    measurements: "Данные о мере для расчёта",
    quantityFor: "Количество (если требуется)",
    quantityHint: "Для некоторых товаров (напитки, топливо и т.д.) требуется количество. Единица зависит от кода HS (литр, кг, шт).",
    quantityNeeded: "Введите количество для этого товара (например, литр, кг или шт).",
    privilegeLabel: "Льгота (привилегия)",
    privilegeHint: "Свободная торговля, гуманитарная помощь и др. льготы. Если не применимо, оставьте «Без льготы».",
    calculate: "Рассчитать платежи",
    calculating: "Расчёт...",
    customsCostRow: "Таможенная стоимость",
    usdCourse: "Курс USD",
    needCheckFirst: "Сначала проверьте код HS.",
    hsCodeRequired: "Пожалуйста, введите корректный код HS.",
    fillMeasurements: "Заполните все поля меры для расчёта.",
    invoiceRequired: "Введите стоимость по инвойсу.",
    errorTitle: "Ошибка",
    errorGeneric: "Не удалось выполнить операцию. Повторите попытку позже.",
    officialNote:
      "Результаты получены из официального сервиса Государственного таможенного комитета. Фактическая сумма может уточняться при оформлении декларации.",
    emptyStateCommercial: "Введите и проверьте код HS товара, затем рассчитайте платежи.",
    pickerToggle: "Выбрать из каталога (категория / поиск товара)",
    pickerLoading: "Загрузка каталога...",
    allChapters: "Все разделы",
    pickerSearchPlaceholder: "Поиск по названию или коду",
    pickerNoResults: "Ничего не найдено",
    pickerHint: "Выберите раздел или введите название/код товара",
    phoneType: "Тип электроники",
    smartphone: "Смартфон",
    smartphoneDesc: "Требуется регистрация IMEI",
    otherElectronics: "Другая электроника",
    otherElectronicsDesc: "IMEI не требуется",
    usdPrice: "💵 Цена телефона (USD)",
    exchangeRate: "Курс USD → AZN",
    aznValue: "Стоимость в AZN (Цена × Курс)",
    phoneCustomsDuty: "Таможенная пошлина (лимит 300$)",
    phoneCustomsDutyDesc: "36% от суммы свыше 300 USD",
    phoneServiceFee: "Сбор за таможенное оформление",
    phoneServiceFeeDesc: "30 AZN если итого ≥1000 AZN, иначе 15 AZN",
    imeiFee: "Сбор за регистрацию IMEI",
    imeiFeeDesc: "Только для смартфонов, по рыночной стоимости",
    phoneFreeUnder300: "✓ Менее 300 USD — таможенной пошлины нет",
    goodsValue: "📦 Стоимость товара (AZN)",
    shippingCost: "🚚 Стоимость доставки (AZN)",
    dutyFreeTitle: "Без пошлины!",
    dutyFreeDesc: `Стоимость товара ниже ежемесячного лимита ${POSTAL_EXEMPTION_LIMIT} AZN. Таможенная пошлина не применяется.`,
    remainingLimit: "Оставшийся лимит:",
    customsValue: "Таможенная стоимость",
    totalDutyAndTax: "Общая пошлина и налог",
    totalCost: "Общая стоимость",
    detailedCalc: "Подробный расчёт",
    goodsValueRow: "Стоимость товара",
    shippingCostRow: "Стоимость доставки",
    customsValueRow: "Таможенная стоимость",
    exemptionLimit: "Лимит льготы",
    taxableAmount: "Облагаемая сумма",
    customsDutyRow: "Таможенная пошлина",
    totalDutyRow: "Итого пошлина и налог",
    totalCostRow: "Общая стоимость (товар + пошлина)",
    goodsAndShipping: "Стоимость товара + Доставка",
    dutyAndTax: "Пошлина и налог",
    warningTitle: "Внимание:",
    warningText: "Данный расчёт является приблизительным. Фактическая таможенная пошлина может отличаться в зависимости от кода HS, страны происхождения, торговых соглашений и других факторов.",
    emptyState: "Введите стоимость товара, чтобы увидеть результат.",
  },
};

export default function CustomsDutyCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("commercial");

  // ── Kommersiya idxalı (rəsmi API) ──
  const [declarationMode, setDeclarationMode] = useState<1 | 2>(1);
  const [hsCode, setHsCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkData, setCheckData] = useState<CheckCodeData | null>(null);
  const [invoice, setInvoice] = useState("");
  const [transportExpenses, setTransportExpenses] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [quantity, setQuantity] = useState("");
  const [privilege, setPrivilege] = useState("000");
  const [calculating, setCalculating] = useState(false);
  const [calcData, setCalcData] = useState<GoodsDutyData | null>(null);
  const [comError, setComError] = useState<string | null>(null);

  // Poçt/kuryer
  const [goodsValue, setGoodsValue] = useState("");
  const [shippingCost, setShippingCost] = useState("");

  // Telefon
  const [usdPrice, setUsdPrice] = useState("");
  const [exchangeRate, setExchangeRate] = useState(String(PHONE_USD_RATE));
  const [phoneType, setPhoneType] = useState<PhoneType>("smartphone");

  // XİF MN kataloqu (kataloqdan kod seçmək üçün, lazy-load)
  const [hsData, setHsData] = useState<HsCatalog | null>(null);
  const [hsLoading, setHsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerChapter, setPickerChapter] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");

  async function loadCatalog(): Promise<HsCatalog | null> {
    if (hsData) return hsData;
    setHsLoading(true);
    try {
      const res = await fetch("/data/hs-codes.json");
      const data: HsCatalog = await res.json();
      setHsData(data);
      return data;
    } catch {
      return null;
    } finally {
      setHsLoading(false);
    }
  }

  async function openPicker() {
    setShowPicker((s) => !s);
    loadCatalog();
  }

  const pickerResults = useMemo(() => {
    if (!hsData) return [];
    const q = pickerSearch.trim().toLowerCase();
    let items = hsData.leaves;
    if (pickerChapter) items = items.filter((l) => l.c.startsWith(pickerChapter));
    if (q) {
      const numeric = /^\d+$/.test(q);
      items = items.filter((l) =>
        numeric ? l.c.startsWith(q) : (l[lang] || "").toLowerCase().includes(q)
      );
    } else if (!pickerChapter) {
      return [];
    }
    return items.slice(0, 80);
  }, [hsData, pickerSearch, pickerChapter, lang]);

  function resetCommercialResult() {
    setCalcData(null);
    setComError(null);
  }

  // HS kodu kataloqda yoxlanılır (check-code servisi CORS vermir — kataloqdan ad alınır)
  async function handleCheckCode(codeArg?: string) {
    setComError(null);
    setCalcData(null);
    setCheckData(null);
    const code = (codeArg ?? hsCode).trim();
    if (code.length < 4) {
      setComError(pt.hsCodeRequired);
      return;
    }
    setChecking(true);
    try {
      const data = await loadCatalog();
      const leaf = data?.leaves.find((l) => l.c === code);
      setCheckData({ name: leaf ? leaf[lang] || leaf.az : "", dependOnQuantity: false, dependedFields: [] });
      setQuantity("");
    } catch {
      setCheckData({ name: "", dependOnQuantity: false, dependedFields: [] });
    } finally {
      setChecking(false);
    }
  }

  async function handleCalculate() {
    setComError(null);
    setCalcData(null);
    if (!checkData) {
      setComError(pt.needCheckFirst);
      return;
    }
    const invoiceNum = parseFloat(invoice);
    if (!invoiceNum || invoiceNum <= 0) {
      setComError(pt.invoiceRequired);
      return;
    }
    const qty = parseFloat(quantity);
    const dependedFields: DependedField[] = qty && qty > 0 ? [{ code: "20", value: qty }] : [];

    const body = {
      declarationMode,
      hsCode: hsCode.trim(),
      invoice: invoiceNum,
      transportExpenses: parseFloat(transportExpenses) || 0,
      otherExpenses: parseFloat(otherExpenses) || 0,
      privilege: privilege === "000" ? null : privilege,
      dependedFields,
    };

    setCalculating(true);
    try {
      // Birbaşa DGK servisi (CORS açıqdır), uğursuz olarsa proxy-yə keç.
      let json: BaseResponse<GoodsDutyData> | null = null;
      try {
        const res = await fetch("https://c2b-fbusiness.customs.gov.az/api/v1/goods/calculate-duty", {
          method: "POST",
          headers: { "Content-Type": "application/json", lang, requestSource: "ECustoms" },
          body: JSON.stringify(body),
        });
        json = await res.json();
      } catch {
        const res = await fetch(`/api/goods-duty?lang=${lang}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        json = await res.json();
      }

      if (json && json.code === 200 && json.data) {
        // Miqdardan asılı mal — miqdar verilməyibsə nəticə boş gəlir
        if ((!json.data.duties || json.data.duties.length === 0) && (!qty || qty <= 0)) {
          setComError(pt.quantityNeeded);
        } else {
          setCalcData(json.data);
        }
      } else if (json?.exception?.validationError) {
        setComError(Object.values(json.exception.validationError).join(" • "));
      } else if (json?.exception?.errorMessage) {
        setComError(json.exception.errorMessage);
      } else {
        setComError(pt.errorGeneric);
      }
    } catch {
      setComError(pt.errorGeneric);
    } finally {
      setCalculating(false);
    }
  }

  // ── Telefon idxalı ──
  const phoneResult = useMemo(() => {
    if (deliveryMethod !== "phone") return null;
    const usd = parseFloat(usdPrice);
    if (!usd || usd <= 0) return null;
    const rate = parseFloat(exchangeRate) || PHONE_USD_RATE;
    const aznValue = usd * rate;
    const dutyUsd = usd > PHONE_USD_LIMIT ? (usd - PHONE_USD_LIMIT) * PHONE_DUTY_RATE : 0;
    const customsDuty = dutyUsd * rate;
    const subtotal = aznValue + customsDuty;
    const serviceFee = subtotal >= PHONE_SERVICE_FEE_THRESHOLD ? PHONE_SERVICE_FEE_HIGH : PHONE_SERVICE_FEE_LOW;
    const imeiFee = phoneType === "smartphone" ? getImeiFee(aznValue) : 0;
    const total = customsDuty + serviceFee + imeiFee;
    return { usd, rate, aznValue, customsDuty, serviceFee, imeiFee, total, finalCost: aznValue + total, isPhoneFree: usd <= PHONE_USD_LIMIT };
  }, [deliveryMethod, usdPrice, exchangeRate, phoneType]);

  // ── Poçt/kuryer ──
  const postalResult = useMemo(() => {
    if (deliveryMethod !== "postal") return null;
    const value = parseFloat(goodsValue);
    if (!value || value <= 0) return null;
    const shipping = parseFloat(shippingCost) || 0;
    const totalValue = value + shipping;

    if (totalValue <= POSTAL_EXEMPTION_LIMIT) {
      return { goodsValue: value, shippingCost: shipping, totalValue, customsDuty: 0, totalDuty: 0, finalCost: totalValue, exemptionRemaining: POSTAL_EXEMPTION_LIMIT - totalValue, isExempt: true, taxableAmount: 0 };
    }
    const taxableAmount = totalValue - POSTAL_EXEMPTION_LIMIT;
    const customsDuty = taxableAmount * (POSTAL_DUTY_RATE / 100);
    return { goodsValue: value, shippingCost: shipping, totalValue, customsDuty, totalDuty: customsDuty, finalCost: totalValue + customsDuty, exemptionRemaining: 0, isExempt: false, taxableAmount };
  }, [deliveryMethod, goodsValue, shippingCost]);

  const btnPrimary =
    "w-full py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=legal" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["car-customs", "vat", "currency", "customs-duty"]}
    >
      {/* Delivery Method Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {([
          { m: "commercial" as const, label: pt.commercialImport },
          { m: "postal" as const, label: pt.postalDelivery },
          { m: "phone" as const, label: pt.phoneImport },
        ]).map(({ m, label }) => (
          <button
            key={m}
            onClick={() => setDeliveryMethod(m)}
            className={`py-3 text-sm font-medium rounded-xl border transition-colors ${
              deliveryMethod === m
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted border-border hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══════════ KOMMERSIYA İDXALI (rəsmi API) ══════════ */}
      {deliveryMethod === "commercial" && (
        <div className="space-y-5">
          {/* Prosedur növü */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.declarationMode}</label>
            <div className="flex rounded-xl border border-border overflow-hidden">
              {([
                { v: 1 as const, label: pt.import },
                { v: 2 as const, label: pt.export },
              ]).map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => { setDeclarationMode(v); setCheckData(null); resetCommercialResult(); }}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    declarationMode === v ? "bg-primary text-white" : "bg-white text-muted hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* HS kod + yoxla */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{pt.hsCode}</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={hsCode}
                onChange={(e) => { setHsCode(e.target.value.replace(/\D/g, "").slice(0, 10)); setCheckData(null); resetCommercialResult(); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleCheckCode(); }}
                placeholder={pt.hsCodePlaceholder}
                className={inputClass}
              />
              <button
                onClick={() => handleCheckCode()}
                disabled={checking}
                className="shrink-0 px-5 rounded-xl bg-gray-100 text-foreground font-medium hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                {checking ? pt.checking : pt.checkCode}
              </button>
            </div>

            {/* Kataloqdan seç */}
            <button
              type="button"
              onClick={openPicker}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              {showPicker ? "▾ " : "▸ "}{pt.pickerToggle}
            </button>

            {showPicker && (
              <div className="mt-3 rounded-xl border border-border bg-gray-50 p-3 space-y-3">
                {hsLoading && <p className="text-sm text-muted text-center py-3">{pt.pickerLoading}</p>}
                {hsData && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={pickerChapter}
                        onChange={(e) => setPickerChapter(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-border bg-white text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="">{pt.allChapters}</option>
                        {hsData.chapters.map((c) => (
                          <option key={c.c} value={c.c}>{c.c} — {c[lang]}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        placeholder={pt.pickerSearchPlaceholder}
                        className="w-full p-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    {pickerResults.length > 0 ? (
                      <div className="max-h-72 overflow-y-auto rounded-lg border border-border bg-white divide-y divide-border">
                        {pickerResults.map((l) => (
                          <button
                            key={l.c}
                            type="button"
                            onClick={() => { setHsCode(l.c); setShowPicker(false); handleCheckCode(l.c); }}
                            className="w-full text-left px-3 py-2 hover:bg-primary-light transition-colors flex items-start gap-3"
                          >
                            <span className="font-mono text-xs text-primary shrink-0 mt-0.5">{l.c}</span>
                            <span className="text-xs text-foreground">{l[lang]}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted text-center py-2">
                        {pickerSearch || pickerChapter ? pt.pickerNoResults : pt.pickerHint}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Malın təsviri */}
          {checkData && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium mb-1">{pt.goodsName}</p>
              <p className="text-sm text-green-800 leading-relaxed">{checkData.name}</p>
            </div>
          )}

          {/* Hesablama sahələri (yoxladıqdan sonra) */}
          {checkData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{pt.invoice}</label>
                  <input type="number" min="0" value={invoice} onChange={(e) => { setInvoice(e.target.value); resetCommercialResult(); }} placeholder={pt.invoicePlaceholder} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{pt.transportExpenses}</label>
                  <input type="number" min="0" value={transportExpenses} onChange={(e) => { setTransportExpenses(e.target.value); resetCommercialResult(); }} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{pt.otherExpenses}</label>
                  <input type="number" min="0" value={otherExpenses} onChange={(e) => { setOtherExpenses(e.target.value); resetCommercialResult(); }} placeholder="0" className={inputClass} />
                </div>
              </div>

              {/* Miqdar (bəzi mallar üçün tələb olunur) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{pt.quantityFor}</label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => { setQuantity(e.target.value); resetCommercialResult(); }}
                  placeholder="0"
                  className={inputClass}
                />
                <p className="text-[11px] text-muted mt-1">{pt.quantityHint}</p>
              </div>

              {/* İmtiyaz */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{pt.privilegeLabel}</label>
                <select
                  value={privilege}
                  onChange={(e) => { setPrivilege(e.target.value); resetCommercialResult(); }}
                  className="w-full p-3 rounded-xl border border-border bg-white text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {privileges.map((p) => (
                    <option key={p.code} value={p.code}>{p.code === "000" ? p.name : `${p.code} — ${p.name}`}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1">{pt.privilegeHint}</p>
              </div>

              <button onClick={handleCalculate} disabled={calculating} className={btnPrimary}>
                {calculating ? pt.calculating : pt.calculate}
              </button>
            </>
          )}

          {/* Xəta */}
          {comError && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <p className="text-sm font-semibold text-red-700 mb-0.5">{pt.errorTitle}</p>
              <p className="text-sm text-red-600">{comError}</p>
            </div>
          )}

          {/* Nəticə */}
          {calcData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
                  <p className="text-sm text-muted mb-1">{pt.customsCostRow}</p>
                  <p className="text-xl font-bold text-foreground">{fmt(calcData.customsCost)}</p>
                  <p className="text-xs text-muted mt-1">AZN</p>
                </div>
                <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
                  <p className="text-sm text-muted mb-1">{pt.usdCourse}</p>
                  <p className="text-xl font-bold text-foreground">{calcData.usdCourse}</p>
                  <p className="text-xs text-muted mt-1">USD → AZN</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">{calcData.total.name}</p>
                  <p className="text-xl font-bold">{fmt(calcData.total.value)}</p>
                  <p className="text-xs text-blue-200 mt-1">AZN</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><span>📋</span>{pt.detailedCalc}</h3>
                </div>
                <div className="divide-y divide-border">
                  {calcData.duties.map((d) => (
                    <div key={d.code} className="flex justify-between px-5 py-3 gap-4">
                      <span className="text-sm text-muted">{d.name}</span>
                      <span className={`text-sm font-medium whitespace-nowrap ${d.value > 0 ? "text-foreground" : "text-green-600"}`}>{fmt(d.value)} AZN</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-5 py-4 bg-primary-light">
                    <span className="text-sm font-semibold text-primary-dark">{calcData.total.name}</span>
                    <span className="text-sm font-bold text-primary-dark whitespace-nowrap">{fmt(calcData.total.value)} AZN</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <p className="text-xs text-blue-700 leading-relaxed"><span className="font-semibold">{pt.warningTitle}</span> {pt.officialNote}</p>
              </div>
            </div>
          )}

          {!checkData && !comError && (
            <div className="text-center py-6 text-muted">
              <span className="text-4xl block mb-3">🏭</span>
              <p>{pt.emptyStateCommercial}</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TELEFON İDXALI ══════════ */}
      {deliveryMethod === "phone" && (
        <>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{pt.phoneType}</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPhoneType("smartphone")} className={`p-4 rounded-xl border text-left transition-all ${phoneType === "smartphone" ? "border-primary bg-primary-light ring-2 ring-primary" : "border-border bg-white hover:border-primary/30"}`}>
                  <p className="text-2xl mb-1">📱</p>
                  <p className="text-sm font-bold text-foreground">{pt.smartphone}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.smartphoneDesc}</p>
                </button>
                <button onClick={() => setPhoneType("other")} className={`p-4 rounded-xl border text-left transition-all ${phoneType === "other" ? "border-primary bg-primary-light ring-2 ring-primary" : "border-border bg-white hover:border-primary/30"}`}>
                  <p className="text-2xl mb-1">⌚</p>
                  <p className="text-sm font-bold text-foreground">{pt.otherElectronics}</p>
                  <p className="text-xs text-muted mt-0.5">{pt.otherElectronicsDesc}</p>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{pt.usdPrice}</label>
                <input type="number" value={usdPrice} onChange={(e) => setUsdPrice(e.target.value)} placeholder="500" min="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{pt.exchangeRate}</label>
                <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} placeholder="1.70" min="0" step="0.01" className={inputClass} />
              </div>
            </div>
          </div>

          {phoneResult ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-blue-200 mb-1">{pt.totalCost}</p>
                <p className="text-3xl font-bold">{fmt(phoneResult.finalCost)} AZN</p>
                <p className="text-xs text-blue-200 mt-2">{phoneType === "smartphone" ? "📱 " + pt.smartphone : "⌚ " + pt.otherElectronics}{" — "}{fmt(phoneResult.usd)} USD</p>
              </div>
              {phoneResult.isPhoneFree && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-sm text-green-700 font-medium">{pt.phoneFreeUnder300}</div>
              )}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><span>📋</span>{pt.detailedCalc}</h3>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex justify-between px-5 py-3 bg-gray-50">
                    <span className="text-sm font-semibold text-foreground">{pt.aznValue}</span>
                    <span className="text-sm font-bold text-foreground">{fmt(phoneResult.aznValue)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <div><p className="text-sm text-muted">{pt.phoneCustomsDuty}</p><p className="text-[11px] text-muted">{pt.phoneCustomsDutyDesc}</p></div>
                    <span className="text-sm font-medium text-amber-700">{phoneResult.customsDuty > 0 ? `+${fmt(phoneResult.customsDuty)}` : "0.00"} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <div><p className="text-sm text-muted">{pt.phoneServiceFee}</p><p className="text-[11px] text-muted">{pt.phoneServiceFeeDesc}</p></div>
                    <span className="text-sm font-medium text-amber-700">+{fmt(phoneResult.serviceFee)} AZN</span>
                  </div>
                  {phoneType === "smartphone" && (
                    <div className="flex justify-between px-5 py-3">
                      <div><p className="text-sm text-muted">{pt.imeiFee}</p><p className="text-[11px] text-muted">{pt.imeiFeeDesc}</p></div>
                      <span className="text-sm font-medium text-amber-700">+{fmt(phoneResult.imeiFee)} AZN</span>
                    </div>
                  )}
                  <div className="flex justify-between px-5 py-3 bg-amber-50">
                    <span className="text-sm font-semibold text-amber-700">{pt.totalDutyRow}</span>
                    <span className="text-sm font-bold text-amber-700">{fmt(phoneResult.total)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-4 bg-primary-light">
                    <span className="text-sm font-semibold text-primary-dark">{pt.totalCostRow}</span>
                    <span className="text-sm font-bold text-primary-dark">{fmt(phoneResult.finalCost)} AZN</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <p className="text-xs text-blue-700 leading-relaxed"><span className="font-semibold">{pt.warningTitle}</span> {pt.warningText}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted"><span className="text-4xl block mb-3">📱</span><p>{pt.emptyState}</p></div>
          )}
        </>
      )}

      {/* ══════════ POÇT / KURYER ══════════ */}
      {deliveryMethod === "postal" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{pt.goodsValue}</label>
              <input type="number" value={goodsValue} onChange={(e) => setGoodsValue(e.target.value)} placeholder="500" min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{pt.shippingCost}</label>
              <input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} placeholder="0" min="0" className={inputClass} />
            </div>
          </div>

          {postalResult ? (
            <div className="space-y-4">
              {postalResult.isExempt && (
                <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
                  <span className="text-4xl block mb-2">✅</span>
                  <h4 className="font-semibold text-green-800 mb-1">{pt.dutyFreeTitle}</h4>
                  <p className="text-sm text-green-600">{pt.dutyFreeDesc}</p>
                  <p className="text-xs text-green-500 mt-2">{pt.remainingLimit} {fmt(postalResult.exemptionRemaining)} AZN</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
                  <p className="text-sm text-muted mb-1">{pt.customsValue}</p>
                  <p className="text-2xl font-bold text-foreground">{fmt(postalResult.totalValue)}</p>
                  <p className="text-xs text-muted mt-1">AZN</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
                  <p className="text-sm text-amber-600 mb-1">{pt.totalDutyAndTax}</p>
                  <p className="text-2xl font-bold text-amber-700">{fmt(postalResult.totalDuty)}</p>
                  <p className="text-xs text-amber-600 mt-1">AZN</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
                  <p className="text-sm text-blue-200 mb-1">{pt.totalCost}</p>
                  <p className="text-2xl font-bold">{fmt(postalResult.finalCost)}</p>
                  <p className="text-xs text-blue-200 mt-1">AZN</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><span>📋</span>{pt.detailedCalc}</h3>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex justify-between px-5 py-3"><span className="text-sm text-muted">{pt.goodsValueRow}</span><span className="text-sm font-medium text-foreground">{fmt(postalResult.goodsValue)} AZN</span></div>
                  <div className="flex justify-between px-5 py-3"><span className="text-sm text-muted">{pt.shippingCostRow}</span><span className="text-sm font-medium text-foreground">{fmt(postalResult.shippingCost)} AZN</span></div>
                  <div className="flex justify-between px-5 py-3 bg-gray-50"><span className="text-sm font-semibold text-foreground">{pt.customsValueRow}</span><span className="text-sm font-bold text-foreground">{fmt(postalResult.totalValue)} AZN</span></div>
                  {!postalResult.isExempt && (
                    <>
                      <div className="flex justify-between px-5 py-3"><span className="text-sm text-muted">{pt.exemptionLimit}</span><span className="text-sm font-medium text-green-600">−{fmt(POSTAL_EXEMPTION_LIMIT)} AZN</span></div>
                      <div className="flex justify-between px-5 py-3"><span className="text-sm text-muted">{pt.taxableAmount}</span><span className="text-sm font-medium text-foreground">{fmt(postalResult.taxableAmount)} AZN</span></div>
                      <div className="flex justify-between px-5 py-3"><span className="text-sm text-muted">{pt.customsDutyRow} ({POSTAL_DUTY_RATE}%)</span><span className="text-sm font-medium text-amber-700">{fmt(postalResult.customsDuty)} AZN</span></div>
                    </>
                  )}
                  <div className="flex justify-between px-5 py-3 bg-amber-50"><span className="text-sm font-semibold text-amber-700">{pt.totalDutyRow}</span><span className="text-sm font-bold text-amber-700">{fmt(postalResult.totalDuty)} AZN</span></div>
                  <div className="flex justify-between px-5 py-4 bg-primary-light"><span className="text-sm font-semibold text-primary-dark">{pt.totalCostRow}</span><span className="text-sm font-bold text-primary-dark">{fmt(postalResult.finalCost)} AZN</span></div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <p className="text-xs text-blue-700 leading-relaxed"><span className="font-semibold">{pt.warningTitle}</span> {pt.warningText}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted"><span className="text-4xl block mb-3">📦</span><p>{pt.emptyState}</p></div>
          )}
        </>
      )}
    </CalculatorLayout>
  );
}
