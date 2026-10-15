import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { SegmentControl } from "@/components/SegmentControl";
import { Select } from "@/components/Select";
import { Button } from "@/components/Controls";
import { InfoBox, ResultHero, StatGrid, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { privileges } from "@/data/privileges-2026";

// Gömrük rüsumu hesablayıcısı (saytdakı /hesablayici/gomruk-rusumu ilə eyni)
// Kommersiya idxalı — Dövlət Gömrük Komitəsinin rəsmi servisi ilə (HS kod əsasında, iki mərhələli)
// Poçt/kuryer və telefon idxalı — fiziki şəxslər üçün sadələşdirilmiş yerli hesablama.

// ── Poçt/kuryer bağlamalarına güzəşt ──
const POSTAL_EXEMPTION_LIMIT = 300; // AZN — aylıq limit
const POSTAL_DUTY_RATE = 30; // % — limitdən artıq hissəyə

// ── Telefon idxalı (şəxsi) ──
const PHONE_USD_LIMIT = 300; // USD — gömrük rüsumundan azad limit
const PHONE_DUTY_RATE = 0.36; // 36% — limitdən artıq hissəyə
const PHONE_USD_RATE = 1.7; // USD → AZN
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

// XİF MN nomenklatura kataloqu (saytdakı public/data/hs-codes.json — runtime-da yüklənir)
interface HsNode { c: string; az: string; en: string; ru: string }
interface HsCatalog { chapters: HsNode[]; leaves: HsNode[] }

const HS_CATALOG_URL = "https://birhesab.az/data/hs-codes.json";
const GOODS_API = "https://c2b-fbusiness.customs.gov.az/api/v1/goods";
const API_HEADERS = {
  "Content-Type": "application/json",
  lang: "az",
  requestSource: "ECustoms",
  "User-Agent": "BirHesab.az/1.0",
};

// Modul səviyyəli keş — kataloq (1.8 MB) bir dəfə yüklənir
let hsCatalogCache: HsCatalog | null = null;
let hsCatalogPromise: Promise<HsCatalog | null> | null = null;

function fetchHsCatalog(): Promise<HsCatalog | null> {
  if (hsCatalogCache) return Promise.resolve(hsCatalogCache);
  if (!hsCatalogPromise) {
    hsCatalogPromise = fetch(HS_CATALOG_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: HsCatalog | null) => {
        if (d && Array.isArray(d.leaves)) hsCatalogCache = d;
        return hsCatalogCache;
      })
      .catch(() => null)
      .finally(() => {
        hsCatalogPromise = null;
      });
  }
  return hsCatalogPromise;
}

const fmt = (n: number) => fmtNum(n, 2);

const pt = {
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
  commercialImport: "🏭 Kommersiya idxalı (rəsmi)",
  postalDelivery: "📮 Poçt / Kuryer bağlaması",
  phoneImport: "📱 Telefon idxalı (şəxsi)",
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
  invoiceRequired: "İnvoys dəyərini daxil edin.",
  errorTitle: "Xəta",
  errorGeneric: "Əməliyyat mümkün olmadı. Bir azdan yenidən cəhd edin.",
  officialNote:
    "Nəticələr Dövlət Gömrük Komitəsinin rəsmi servisindən alınır. Faktiki məbləğ bəyannamənin rəsmiləşdirilməsi zamanı dəqiqləşə bilər.",
  emptyStateCommercial: "Malın HS kodunu daxil edib yoxlayın, sonra rüsumları hesablayın.",
  pickerToggle: "Kataloqdan seç (kateqoriya / mal axtarışı)",
  pickerLoading: "Kataloq yüklənir...",
  pickerError: "Kataloqu yükləmək mümkün olmadı. İnternet bağlantısını yoxlayın.",
  allChapters: "Bütün fəsillər",
  pickerSearchPlaceholder: "Mal adı və ya kod axtar",
  pickerNoResults: "Nəticə tapılmadı",
  pickerHint: "Fəsil seçin və ya mal adı/kod yazın",
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
  goodsValue: "📦 Malın dəyəri (AZN)",
  shippingCost: "🚚 Daşınma xərci (AZN)",
  dutyFreeTitle: "Rüsumsuz!",
  dutyFreeDesc: `Malın dəyəri aylıq ${POSTAL_EXEMPTION_LIMIT} AZN limitindən azdır. Gömrük rüsumu tətbiq olunmur.`,
  remainingLimit: "Qalan limit:",
  customsValue: "Gömrük dəyəri",
  totalDutyAndTax: "Ümumi rüsum və vergi",
  totalCost: "Ümumi xərc",
  detailedCalc: "📋 Ətraflı hesablama",
  goodsValueRow: "Malın dəyəri",
  shippingCostRow: "Daşınma xərci",
  customsValueRow: "Gömrük dəyəri",
  exemptionLimit: "Güzəşt limiti",
  taxableAmount: "Rüsuma cəlb olunan",
  customsDutyRow: "Gömrük rüsumu",
  totalDutyRow: "Cəmi rüsum və vergi",
  totalCostRow: "Ümumi xərc (mal + rüsum)",
  warningTitle: "Diqqət:",
  warningText:
    "Bu hesablama təxmini xarakter daşıyır. Faktiki gömrük rüsumu malın HS kodu, mənşə ölkəsi, ticarət sazişləri və digər amillərə görə fərqlənə bilər.",
  emptyState: "Nəticəni görmək üçün malın dəyərini daxil edin.",
};

const privilegeOptions = privileges.map((p) => ({
  value: p.code,
  label: p.code === "000" ? p.name : `${p.code} — ${p.name}`,
}));

export function CustomsFeeCalculator() {
  const { colors } = useTheme();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("commercial");

  // ── Kommersiya idxalı (rəsmi API) ──
  const [declarationMode, setDeclarationMode] = useState<"1" | "2">("1");
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

  // XİF MN kataloqu
  const [hsData, setHsData] = useState<HsCatalog | null>(hsCatalogCache);
  const [hsLoading, setHsLoading] = useState(false);
  const [hsFailed, setHsFailed] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerChapter, setPickerChapter] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");

  async function loadCatalog(): Promise<HsCatalog | null> {
    if (hsData) return hsData;
    setHsLoading(true);
    setHsFailed(false);
    try {
      const data = await fetchHsCatalog();
      if (data) setHsData(data);
      else setHsFailed(true);
      return data;
    } finally {
      setHsLoading(false);
    }
  }

  function openPicker() {
    setShowPicker((s) => !s);
    loadCatalog();
  }

  const chapterOptions = useMemo(
    () => [
      { value: "", label: pt.allChapters },
      ...(hsData?.chapters ?? []).map((c) => ({ value: c.c, label: `${c.c} — ${c.az}` })),
    ],
    [hsData]
  );

  const pickerResults = useMemo(() => {
    if (!hsData) return [];
    const q = pickerSearch.trim().toLowerCase();
    let items = hsData.leaves;
    if (pickerChapter) items = items.filter((l) => l.c.startsWith(pickerChapter));
    if (q) {
      const numeric = /^\d+$/.test(q);
      items = items.filter((l) => (numeric ? l.c.startsWith(q) : (l.az || "").toLowerCase().includes(q)));
    } else if (!pickerChapter) {
      return [];
    }
    return items.slice(0, 80);
  }, [hsData, pickerSearch, pickerChapter]);

  function resetCommercialResult() {
    setCalcData(null);
    setComError(null);
  }

  // HS kodu kataloqda yoxlanılır (saytdakı kimi); kataloqda ad tapılmazsa DGK check-code servisi sınanır
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
      let name = leaf ? leaf.az : "";
      if (!name) {
        try {
          const res = await fetch(
            `${GOODS_API}/check-code?declarationMode=${encodeURIComponent(declarationMode)}&code=${encodeURIComponent(code)}`,
            { headers: API_HEADERS }
          );
          const json: BaseResponse<CheckCodeData> = await res.json();
          if (json && json.code === 200 && json.data?.name) name = json.data.name;
        } catch {
          // ad tapılmadı — saytdakı kimi boş adla davam edilir
        }
      }
      setCheckData({ name, dependOnQuantity: false, dependedFields: [] });
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
    const invoiceNum = parseFloat(invoice.replace(",", "."));
    if (!invoiceNum || invoiceNum <= 0) {
      setComError(pt.invoiceRequired);
      return;
    }
    const qty = parseFloat(quantity.replace(",", "."));
    const dependedFields: DependedField[] = qty && qty > 0 ? [{ code: "20", value: qty }] : [];

    const body = {
      declarationMode: Number(declarationMode),
      hsCode: hsCode.trim(),
      invoice: invoiceNum,
      transportExpenses: parseFloat(transportExpenses.replace(",", ".")) || 0,
      otherExpenses: parseFloat(otherExpenses.replace(",", ".")) || 0,
      privilege: privilege === "000" ? null : privilege,
      dependedFields,
    };

    setCalculating(true);
    try {
      const res = await fetch(`${GOODS_API}/calculate-duty`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify(body),
      });
      const json: BaseResponse<GoodsDutyData> | null = await res.json();

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
    const usd = parseFloat(usdPrice.replace(",", "."));
    if (!usd || usd <= 0) return null;
    const rate = parseFloat(exchangeRate.replace(",", ".")) || PHONE_USD_RATE;
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
    const value = parseFloat(goodsValue.replace(",", "."));
    if (!value || value <= 0) return null;
    const shipping = parseFloat(shippingCost.replace(",", ".")) || 0;
    const totalValue = value + shipping;

    if (totalValue <= POSTAL_EXEMPTION_LIMIT) {
      return { goodsValue: value, shippingCost: shipping, totalValue, customsDuty: 0, totalDuty: 0, finalCost: totalValue, exemptionRemaining: POSTAL_EXEMPTION_LIMIT - totalValue, isExempt: true, taxableAmount: 0 };
    }
    const taxableAmount = totalValue - POSTAL_EXEMPTION_LIMIT;
    const customsDuty = taxableAmount * (POSTAL_DUTY_RATE / 100);
    return { goodsValue: value, shippingCost: shipping, totalValue, customsDuty, totalDuty: customsDuty, finalCost: totalValue + customsDuty, exemptionRemaining: 0, isExempt: false, taxableAmount };
  }, [deliveryMethod, goodsValue, shippingCost]);

  const warningBox = (text: string) => (
    <InfoBox variant="info">
      <Text style={[styles.note, { color: colors.n760 }]}>
        <Text style={{ fontWeight: "700" }}>{pt.warningTitle}</Text> {text}
      </Text>
    </InfoBox>
  );

  const emptyState = (icon: string, text: string) => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyText, { color: colors.n580 }]}>{text}</Text>
    </View>
  );

  return (
    <View>
      {/* Çatdırılma üsulu */}
      <View style={styles.modeList}>
        {([
          { m: "commercial" as const, label: pt.commercialImport },
          { m: "postal" as const, label: pt.postalDelivery },
          { m: "phone" as const, label: pt.phoneImport },
        ]).map(({ m, label }) => {
          const active = deliveryMethod === m;
          return (
            <Pressable
              key={m}
              onPress={() => setDeliveryMethod(m)}
              style={[
                styles.modeBtn,
                { borderColor: active ? colors.accent : colors.n280, backgroundColor: active ? colors.accent : colors.n200 },
              ]}
            >
              <Text style={[styles.modeText, { color: active ? colors.onAccent : colors.n760 }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ══════════ KOMMERSIYA İDXALI (rəsmi API) ══════════ */}
      {deliveryMethod === "commercial" && (
        <View>
          <SegmentControl
            label={pt.declarationMode}
            options={[
              { value: "1", label: pt.import },
              { value: "2", label: pt.export },
            ]}
            selected={declarationMode}
            onSelect={(v) => {
              setDeclarationMode(v);
              setCheckData(null);
              resetCommercialResult();
            }}
          />

          <InputField
            label={pt.hsCode}
            value={hsCode}
            onChangeText={(t) => {
              setHsCode(t.replace(/\D/g, "").slice(0, 10));
              setCheckData(null);
              resetCommercialResult();
            }}
            placeholder={pt.hsCodePlaceholder}
            keyboardType="number-pad"
            maxLength={10}
          />
          <Button
            title={checking ? pt.checking : pt.checkCode}
            onPress={() => handleCheckCode()}
            disabled={checking}
            variant="secondary"
            icon="search"
          />

          {/* Kataloqdan seç */}
          <Pressable onPress={openPicker} style={{ marginTop: 10 }} hitSlop={6}>
            <Text style={[styles.link, { color: colors.accent }]}>
              {showPicker ? "▾ " : "▸ "}
              {pt.pickerToggle}
            </Text>
          </Pressable>

          {showPicker && (
            <View style={[styles.picker, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
              {hsLoading && (
                <View style={styles.pickerLoading}>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={[styles.small, { color: colors.n580 }]}>{pt.pickerLoading}</Text>
                </View>
              )}
              {!hsLoading && hsFailed && !hsData && (
                <Text style={[styles.small, { color: "#ef4444", textAlign: "center" }]}>{pt.pickerError}</Text>
              )}
              {hsData && (
                <>
                  <Select
                    value={pickerChapter}
                    options={chapterOptions}
                    onSelect={setPickerChapter}
                    placeholder={pt.allChapters}
                    searchable
                  />
                  <TextInput
                    value={pickerSearch}
                    onChangeText={setPickerSearch}
                    placeholder={pt.pickerSearchPlaceholder}
                    placeholderTextColor={colors.n400c}
                    style={[styles.search, { backgroundColor: colors.n240, borderColor: colors.n280, color: colors.n940 }]}
                  />
                  {pickerResults.length > 0 ? (
                    <View style={[styles.results, { borderColor: colors.n280 }]}>
                      {pickerResults.map((l, i) => (
                        <Pressable
                          key={l.c}
                          onPress={() => {
                            setHsCode(l.c);
                            setShowPicker(false);
                            handleCheckCode(l.c);
                          }}
                          style={[
                            styles.resultItem,
                            i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.n280 },
                          ]}
                        >
                          <Text style={[styles.code, { color: colors.accent }]}>{l.c}</Text>
                          <Text style={[styles.small, { color: colors.n840, flex: 1 }]}>{l.az}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.small, { color: colors.n580, textAlign: "center", paddingVertical: 8 }]}>
                      {pickerSearch || pickerChapter ? pt.pickerNoResults : pt.pickerHint}
                    </Text>
                  )}
                </>
              )}
            </View>
          )}

          {/* Malın təsviri */}
          {checkData && (
            <InfoBox variant="success" title={pt.goodsName}>
              {checkData.name || "—"}
            </InfoBox>
          )}

          {/* Hesablama sahələri (yoxladıqdan sonra) */}
          {checkData && (
            <View style={{ marginTop: 8 }}>
              <InputField
                label={pt.invoice}
                value={invoice}
                onChangeText={(t) => { setInvoice(t); resetCommercialResult(); }}
                placeholder={pt.invoicePlaceholder}
                keyboardType="decimal-pad"
                suffix="$"
              />
              <InputField
                label={pt.transportExpenses}
                value={transportExpenses}
                onChangeText={(t) => { setTransportExpenses(t); resetCommercialResult(); }}
                placeholder="0"
                keyboardType="decimal-pad"
                suffix="$"
              />
              <InputField
                label={pt.otherExpenses}
                value={otherExpenses}
                onChangeText={(t) => { setOtherExpenses(t); resetCommercialResult(); }}
                placeholder="0"
                keyboardType="decimal-pad"
                suffix="$"
              />
              <InputField
                label={pt.quantityFor}
                value={quantity}
                onChangeText={(t) => { setQuantity(t); resetCommercialResult(); }}
                placeholder="0"
                keyboardType="decimal-pad"
                hint={pt.quantityHint}
              />
              <Select
                label={pt.privilegeLabel}
                value={privilege}
                options={privilegeOptions}
                onSelect={(v) => { setPrivilege(v); resetCommercialResult(); }}
                hint={pt.privilegeHint}
                searchable
              />
              <Button
                title={calculating ? pt.calculating : pt.calculate}
                onPress={handleCalculate}
                disabled={calculating}
              />
            </View>
          )}

          {/* Xəta */}
          {comError && (
            <InfoBox variant="danger" title={pt.errorTitle}>
              {comError}
            </InfoBox>
          )}

          {/* Nəticə */}
          {calcData && (
            <View>
              <ResultHero label={calcData.total.name} value={`${fmt(calcData.total.value)} AZN`} />
              <StatGrid
                items={[
                  { label: pt.customsCostRow, value: `${fmt(calcData.customsCost)} AZN` },
                  { label: `${pt.usdCourse} (USD → AZN)`, value: String(calcData.usdCourse) },
                ]}
              />
              <ResultSection title={pt.detailedCalc}>
                {calcData.duties.map((d) => (
                  <ResultRow key={d.code} label={d.name} value={`${fmt(d.value)} AZN`} />
                ))}
                <ResultRow label={calcData.total.name} value={`${fmt(calcData.total.value)} AZN`} highlight bold />
              </ResultSection>
              {warningBox(pt.officialNote)}
            </View>
          )}

          {!checkData && !comError && emptyState("🏭", pt.emptyStateCommercial)}
        </View>
      )}

      {/* ══════════ TELEFON İDXALI ══════════ */}
      {deliveryMethod === "phone" && (
        <View>
          <Text style={[styles.label, { color: colors.n700 }]}>{pt.phoneType}</Text>
          <View style={styles.typeRow}>
            {([
              { v: "smartphone" as const, icon: "📱", title: pt.smartphone, desc: pt.smartphoneDesc },
              { v: "other" as const, icon: "⌚", title: pt.otherElectronics, desc: pt.otherElectronicsDesc },
            ]).map((o) => {
              const active = phoneType === o.v;
              return (
                <Pressable
                  key={o.v}
                  onPress={() => setPhoneType(o.v)}
                  style={[
                    styles.typeCard,
                    {
                      borderColor: active ? colors.accent : colors.n280,
                      backgroundColor: active ? colors.accent + "1f" : colors.n200,
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <Text style={styles.typeIcon}>{o.icon}</Text>
                  <Text style={[styles.typeTitle, { color: colors.n940 }]}>{o.title}</Text>
                  <Text style={[styles.small, { color: colors.n580, marginTop: 2 }]}>{o.desc}</Text>
                </Pressable>
              );
            })}
          </View>
          <InputField label={pt.usdPrice} value={usdPrice} onChangeText={setUsdPrice} placeholder="500" keyboardType="decimal-pad" suffix="$" />
          <InputField label={pt.exchangeRate} value={exchangeRate} onChangeText={setExchangeRate} placeholder="1.70" keyboardType="decimal-pad" />

          {phoneResult ? (
            <View>
              <ResultHero
                label={pt.totalCost}
                value={`${fmt(phoneResult.finalCost)} AZN`}
                sub={`${phoneType === "smartphone" ? "📱 " + pt.smartphone : "⌚ " + pt.otherElectronics} — ${fmt(phoneResult.usd)} USD`}
              />
              {phoneResult.isPhoneFree && <InfoBox variant="success">{pt.phoneFreeUnder300}</InfoBox>}
              <ResultSection title={pt.detailedCalc}>
                <ResultRow label={pt.aznValue} value={`${fmt(phoneResult.aznValue)} AZN`} bold />
                <DescRow
                  label={pt.phoneCustomsDuty}
                  desc={pt.phoneCustomsDutyDesc}
                  value={`${phoneResult.customsDuty > 0 ? `+${fmt(phoneResult.customsDuty)}` : "0.00"} AZN`}
                />
                <DescRow label={pt.phoneServiceFee} desc={pt.phoneServiceFeeDesc} value={`+${fmt(phoneResult.serviceFee)} AZN`} />
                {phoneType === "smartphone" && (
                  <DescRow label={pt.imeiFee} desc={pt.imeiFeeDesc} value={`+${fmt(phoneResult.imeiFee)} AZN`} />
                )}
                <ResultRow label={pt.totalDutyRow} value={`${fmt(phoneResult.total)} AZN`} bold />
                <ResultRow label={pt.totalCostRow} value={`${fmt(phoneResult.finalCost)} AZN`} highlight bold />
              </ResultSection>
              {warningBox(pt.warningText)}
            </View>
          ) : (
            emptyState("📱", pt.emptyState)
          )}
        </View>
      )}

      {/* ══════════ POÇT / KURYER ══════════ */}
      {deliveryMethod === "postal" && (
        <View>
          <InputField label={pt.goodsValue} value={goodsValue} onChangeText={setGoodsValue} placeholder="500" keyboardType="decimal-pad" suffix="₼" />
          <InputField label={pt.shippingCost} value={shippingCost} onChangeText={setShippingCost} placeholder="0" keyboardType="decimal-pad" suffix="₼" />

          {postalResult ? (
            <View>
              {postalResult.isExempt && (
                <InfoBox variant="success" title={`✅ ${pt.dutyFreeTitle}`}>
                  <Text style={[styles.note, { color: colors.n760 }]}>{pt.dutyFreeDesc}</Text>
                  <Text style={[styles.small, { color: colors.n580, marginTop: 6 }]}>
                    {pt.remainingLimit} {fmt(postalResult.exemptionRemaining)} AZN
                  </Text>
                </InfoBox>
              )}
              <ResultHero label={pt.totalCost} value={`${fmt(postalResult.finalCost)} AZN`} />
              <StatGrid
                items={[
                  { label: pt.customsValue, value: `${fmt(postalResult.totalValue)} AZN` },
                  { label: pt.totalDutyAndTax, value: `${fmt(postalResult.totalDuty)} AZN`, accent: true },
                ]}
              />
              <ResultSection title={pt.detailedCalc}>
                <ResultRow label={pt.goodsValueRow} value={`${fmt(postalResult.goodsValue)} AZN`} />
                <ResultRow label={pt.shippingCostRow} value={`${fmt(postalResult.shippingCost)} AZN`} />
                <ResultRow label={pt.customsValueRow} value={`${fmt(postalResult.totalValue)} AZN`} bold />
                {!postalResult.isExempt && (
                  <>
                    <ResultRow label={pt.exemptionLimit} value={`−${fmt(POSTAL_EXEMPTION_LIMIT)} AZN`} />
                    <ResultRow label={pt.taxableAmount} value={`${fmt(postalResult.taxableAmount)} AZN`} />
                    <ResultRow label={`${pt.customsDutyRow} (${POSTAL_DUTY_RATE}%)`} value={`${fmt(postalResult.customsDuty)} AZN`} />
                  </>
                )}
                <ResultRow label={pt.totalDutyRow} value={`${fmt(postalResult.totalDuty)} AZN`} bold />
                <ResultRow label={pt.totalCostRow} value={`${fmt(postalResult.finalCost)} AZN`} highlight bold />
              </ResultSection>
              {warningBox(pt.warningText)}
            </View>
          ) : (
            emptyState("📦", pt.emptyState)
          )}
        </View>
      )}

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["car-customs", "vat", "currency", "customs-duty"]} />
    </View>
  );
}

/** Alt izahlı nəticə sətri (saytdakı iki sətirli label). */
function DescRow({ label, desc, value }: { label: string; desc: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.descRow, { borderBottomColor: colors.n240 }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: colors.n580 }}>{label}</Text>
        <Text style={{ fontSize: 11, color: colors.n580, marginTop: 2 }}>{desc}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.amber }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modeList: { gap: 8, marginBottom: 20 },
  modeBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: "center" },
  modeText: { fontSize: 14, fontWeight: "600" },
  link: { fontSize: 13, fontWeight: "600" },
  picker: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10, marginBottom: 8 },
  pickerLoading: { alignItems: "center", gap: 6, paddingVertical: 10 },
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 10 },
  results: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  resultItem: { flexDirection: "row", gap: 10, paddingHorizontal: 12, paddingVertical: 9, alignItems: "flex-start" },
  code: { fontFamily: "monospace", fontSize: 12, marginTop: 1 },
  small: { fontSize: 12, lineHeight: 17 },
  note: { fontSize: 13, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  typeCard: { flex: 1, borderRadius: 12, padding: 14 },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  typeTitle: { fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
  descRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
});
