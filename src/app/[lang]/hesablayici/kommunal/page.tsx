"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

// ============================================================
// Azərbaycan kommunal xidmət tarifləri (2025)
// Tarif (Qiymət) Şurasının 29.12.2024 tarixli qərarı
// Qüvvəyə minmə: 02.01.2025
// ============================================================

// ── ELEKTRİK ──────────────────────────────────────────────────
const ELECTRICITY_TIERS = [
  { limit: 200, rate: 0.084, label: "0–200 kVt·saat", oldRate: 0.08 },
  { limit: 100, rate: 0.10, label: "201–300 kVt·saat", oldRate: 0.09 },
  { limit: Infinity, rate: 0.15, label: "300+ kVt·saat", oldRate: 0.13 },
];
const ELECTRICITY_SERVICE_FEE = 1.00;

// ── QAZ ───────────────────────────────────────────────────────
const GAS_TIERS = [
  { yearLimit: 1200, rate: 0.12, label: "0–1200 m³/il" },
  { yearLimit: 2500, rate: 0.20, label: "1200–2500 m³/il" },
  { yearLimit: Infinity, rate: 0.25, label: "2500+ m³/il" },
];
const GAS_SERVICE_FEE = 1.00;

// ── SU ────────────────────────────────────────────────────────
const WATER_BAKU = 0.70;
const WATER_OTHER = 0.60;
const WASTEWATER = 0.30;

// ── İSTİLİK ───────────────────────────────────────────────────
const HEATING_RATE = 0.04;

type ActiveTab = "all" | "electricity" | "gas" | "water";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function calcElectricity(kwh: number) {
  let remaining = kwh;
  const breakdown: { label: string; kwh: number; rate: number; cost: number }[] = [];
  let subtotal = 0;
  for (const tier of ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    const used = Math.min(remaining, tier.limit);
    const cost = used * tier.rate;
    breakdown.push({ label: tier.label, kwh: used, rate: tier.rate, cost });
    subtotal += cost;
    remaining -= used;
  }
  const serviceFee = kwh > 0 ? ELECTRICITY_SERVICE_FEE : 0;
  return { subtotal, serviceFee, total: subtotal + serviceFee, breakdown };
}

function calcGas(monthlyM3: number, prevYearlyM3: number) {
  const breakdown: { label: string; m3: number; rate: number; cost: number }[] = [];
  let subtotal = 0;
  let remaining = monthlyM3;
  let cumulative = prevYearlyM3;

  for (const tier of GAS_TIERS) {
    if (remaining <= 0) break;
    const tierCeiling = tier.yearLimit;
    const spaceInTier = Math.max(0, tierCeiling - cumulative);
    if (spaceInTier <= 0) { continue; }
    const used = Math.min(remaining, spaceInTier);
    const cost = used * tier.rate;
    breakdown.push({ label: tier.label, m3: used, rate: tier.rate, cost });
    subtotal += cost;
    remaining -= used;
    cumulative += used;
  }
  if (remaining > 0) {
    const lastTier = GAS_TIERS[GAS_TIERS.length - 1];
    const cost = remaining * lastTier.rate;
    const existing = breakdown.find(b => b.label === lastTier.label);
    if (existing) {
      existing.m3 += remaining;
      existing.cost += cost;
    } else {
      breakdown.push({ label: lastTier.label, m3: remaining, rate: lastTier.rate, cost });
    }
    subtotal += cost;
  }

  const serviceFee = monthlyM3 > 0 ? GAS_SERVICE_FEE : 0;
  return { subtotal, serviceFee, total: subtotal + serviceFee, breakdown, newYearlyCumulative: prevYearlyM3 + monthlyM3 };
}

const pageTranslations = {
  az: {
    title: "Kommunal xərclər hesablayıcısı",
    description: "Elektrik, qaz, su və digər kommunal xərclərinizi 2025-ci il tarifləri ilə hesablayın.",
    breadcrumbCategory: "Daşınmaz Əmlak",
    formulaTitle: "2025-ci il kommunal tarifləri",
    formulaContent: `Elektrik enerjisi (02.01.2025-dən, ƏDV daxil):
• 0–200 kVt·saat: 8,4 qəpik (əvvəl 8 qəpik)
• 201–300 kVt·saat: 10 qəpik (əvvəl 9 qəpik)
• 300+ kVt·saat: 15 qəpik (əvvəl 13 qəpik)
• Sabit aylıq xidmət haqqı: 1,00 AZN

Nümunə: 350 kVt·saat istehlak
İlk 200 kVt × 0,084 = 16,80 AZN
Növbəti 100 kVt × 0,10 = 10,00 AZN
Qalan 50 kVt × 0,15 = 7,50 AZN
Xidmət haqqı = 1,00 AZN
Yekun = 35,30 AZN

Təbii qaz (Azəriqaz, illik kumulyativ):
• 0–1200 m³/il: 12 qəpik
• 1200–2500 m³/il: 20 qəpik
• 2500+ m³/il: 25 qəpik
• Sabit aylıq xidmət haqqı: 1,00 AZN
Sayğac yanvar 1-də sıfırlanır.

Nümunə: İl boyu 1150 m³ işlətmisiniz, dekabrda 100 m³:
Limitə qalan 50 m³ × 0,12 = 6,00 AZN
Limiti keçən 50 m³ × 0,20 = 10,00 AZN
Xidmət haqqı = 1,00 AZN
Yekun = 17,00 AZN

Su təchizatı:
• Bakı, Sumqayıt, Xırdalan, Abşeron: 0,70 AZN/m³
• Digər ərazilər: 0,60 AZN/m³
• Tullantı sularının axıdılması: 0,30 AZN/m³

İstilik: 0,04 AZN/m² (noyabr–mart)`,
    tabAll: "Hamısı",
    tabElectricity: "İşıq",
    tabGas: "Qaz",
    tabWater: "Su",
    electricity: "Elektrik enerjisi",
    tariff2025: "2025 tarif",
    monthlyConsumption: "Aylıq istehlak (kVt·saat)",
    calcMethod: "Hesablama qaydası",
    receipt: "qəbz",
    monthlyConsumptionLabel: "Aylıq istehlak:",
    tariffPerKwh: "Tarif: hər kVt·saat üçün",
    qepik: "qəpik",
    tierLimitFull: "bu pillənin limiti doldu",
    ofEnergyFee: "Enerji haqqının",
    fixedServiceFee: "Sabit aylıq xidmət haqqı",
    fixedServiceFeeDesc: "Hər ay sabit olaraq tutulur (sayğac xidməti)",
    energyFee: "Enerji haqqı",
    serviceFee: "Xidmət haqqı",
    totalPayment: "Yekun ödəniş",
    tier1Only: "Yalnız 1-ci pillədəsiniz — ən ucuz tarif ilə hesablanır!",
    tier2Warning: "2-ci pilləyə keçmisiniz — 200 kVt-dan sonrakı hissə 19% baha hesablanır.",
    tier3Warning: "3-cü pilləyə keçmisiniz — 300 kVt-dan sonrakı hissə 50% baha hesablanır!",
    naturalGas: "Təbii qaz (Azəriqaz)",
    tariff2026: "2026 tarif",
    thisMonthConsumption: "Bu ayki istehlak (m³)",
    yearToDate: "İlin əvvəlindən bəri cəmi (m³)",
    yearToDateHint: "Sayğac yanvardan bu aya qədər nə qədər göstərir? (Bu ay daxil deyil)",
    annualConsumption: "İllik istehlak:",
    tier1: "1-ci pillə",
    tier2: "2-ci pillə",
    tier3: "3-cü pillə",
    thisMonthConsumptionLabel: "Bu ayki istehlak:",
    annualTotal: "İllik cəmi:",
    yearUsedSoFar: "İlin əvvəlindən {amount} m³ işlətmisiniz",
    tier1Remaining: "1-ci pillə limitinə {amount} m³ qalıb",
    tier2Remaining: "2-ci pillə limitinə {amount} m³ qalıb",
    alreadyTier3: "artıq 3-cü pillədəsiniz",
    tariffPerM3: "Tarif: hər m³ üçün",
    ofGasFee: "Qaz haqqının",
    fixedServiceFeeGas: "Sabit aylıq xidmət haqqı",
    fixedServiceFeeGasDesc: "Hər ay sabit olaraq tutulur (abonent xidməti)",
    gasFee: "Qaz haqqı",
    gasTier1Only: "Yalnız 1-ci pillədəsiniz (12 qəpik) — ən ucuz tarif!",
    gasTier2Warning: "Diqqət: 1200 m³ illik limiti keçmisiniz — artıq hissə 20 qəpikdən hesablanır (67% baha).",
    gasTier3Warning: "Diqqət: 2500 m³ illik limiti keçmisiniz — artıq hissə 25 qəpikdən hesablanır!",
    waterSupply: "Su təchizatı",
    bakuRegion: "Bakı / Sumqayıt / Abşeron (0,70)",
    otherRegion: "Digər ərazilər (0,60)",
    coldWater: "Soyuq su (m³/ay)",
    hotWater: "İsti su (m³/ay)",
    coldWaterLabel: "Soyuq su",
    sewage: "Kanalizasiya",
    hotWaterLabel: "İsti su",
    apartmentArea: "Mənzilin sahəsi (m²)",
    centralHeating: "Mərkəzi istilik (noyabr–mart, 0,04 AZN/m²)",
    monthlyUtility: "Aylıq kommunal xərc",
    perMonth: "AZN / ay",
    annual: "İllik:",
    electricityLabel: "Elektrik",
    gasLabel: "Qaz",
    waterLabel: "Su",
    heatingLabel: "İstilik",
    costStructure: "Xərcin strukturu",
    savingTips: "Qənaət məsləhətləri",
    tip1: "Elektrik: 200 kVt·saat limitində qalın — sonrakı pillədə tarif 19% artır",
    tip2: "Qaz: Aylıq 100 m³-dən az istifadə edin — sonrakı pillədə tarif 76% artır",
    tip3: "LED lampalar adi lampalara nisbətən 80% az enerji sərf edir",
    tip4: "Qazanın temperaturunu 1°C azaltmaq ~6% qənaət edir",
    tip5: "Su sayğacı quraşdırın — normativ istehlakdan 30-40% az ödəyərsiniz",
    emptyState: "Nəticəni görmək üçün istehlak məlumatlarını daxil edin.",
  },
  en: {
    title: "Utility bills calculator",
    description: "Calculate your electricity, gas, water, and other utility costs based on 2025 tariffs.",
    breadcrumbCategory: "Real Estate",
    formulaTitle: "2025 utility tariffs",
    formulaContent: `Electricity (from 02.01.2025, VAT included):
• 0–200 kWh: 8.4 qepik (previously 8 qepik)
• 201–300 kWh: 10 qepik (previously 9 qepik)
• 300+ kWh: 15 qepik (previously 13 qepik)
• Fixed monthly service fee: 1.00 AZN

Example: 350 kWh consumption
First 200 kWh × 0.084 = 16.80 AZN
Next 100 kWh × 0.10 = 10.00 AZN
Remaining 50 kWh × 0.15 = 7.50 AZN
Service fee = 1.00 AZN
Total = 35.30 AZN

Natural gas (Azeriqaz, annual cumulative):
• 0–1200 m³/year: 12 qepik
• 1200–2500 m³/year: 20 qepik
• 2500+ m³/year: 25 qepik
• Fixed monthly service fee: 1.00 AZN
Meter resets on January 1st.

Water supply:
• Baku, Sumgait, Khirdalan, Absheron: 0.70 AZN/m³
• Other areas: 0.60 AZN/m³
• Wastewater: 0.30 AZN/m³

Heating: 0.04 AZN/m² (November–March)`,
    tabAll: "All",
    tabElectricity: "Electricity",
    tabGas: "Gas",
    tabWater: "Water",
    electricity: "Electricity",
    tariff2025: "2025 tariff",
    monthlyConsumption: "Monthly consumption (kWh)",
    calcMethod: "Calculation method",
    receipt: "receipt",
    monthlyConsumptionLabel: "Monthly consumption:",
    tariffPerKwh: "Tariff: per kWh",
    qepik: "qepik",
    tierLimitFull: "this tier's limit is full",
    ofEnergyFee: "of energy fee",
    fixedServiceFee: "Fixed monthly service fee",
    fixedServiceFeeDesc: "Charged monthly (meter service)",
    energyFee: "Energy fee",
    serviceFee: "Service fee",
    totalPayment: "Total payment",
    tier1Only: "You're in tier 1 only — calculated at the cheapest rate!",
    tier2Warning: "You've entered tier 2 — consumption above 200 kWh costs 19% more.",
    tier3Warning: "You've entered tier 3 — consumption above 300 kWh costs 50% more!",
    naturalGas: "Natural gas (Azeriqaz)",
    tariff2026: "2026 tariff",
    thisMonthConsumption: "This month's consumption (m³)",
    yearToDate: "Year-to-date total (m³)",
    yearToDateHint: "How much does the meter show from January to this month? (This month not included)",
    annualConsumption: "Annual consumption:",
    tier1: "Tier 1",
    tier2: "Tier 2",
    tier3: "Tier 3",
    thisMonthConsumptionLabel: "This month's consumption:",
    annualTotal: "Annual total:",
    yearUsedSoFar: "You've used {amount} m³ since the beginning of the year",
    tier1Remaining: "{amount} m³ remaining to tier 1 limit",
    tier2Remaining: "{amount} m³ remaining to tier 2 limit",
    alreadyTier3: "already in tier 3",
    tariffPerM3: "Tariff: per m³",
    ofGasFee: "of gas fee",
    fixedServiceFeeGas: "Fixed monthly service fee",
    fixedServiceFeeGasDesc: "Charged monthly (subscriber service)",
    gasFee: "Gas fee",
    gasTier1Only: "You're in tier 1 only (12 qepik) — cheapest rate!",
    gasTier2Warning: "Attention: You've exceeded the 1200 m³ annual limit — excess is charged at 20 qepik (67% more expensive).",
    gasTier3Warning: "Attention: You've exceeded the 2500 m³ annual limit — excess is charged at 25 qepik!",
    waterSupply: "Water supply",
    bakuRegion: "Baku / Sumgait / Absheron (0.70)",
    otherRegion: "Other areas (0.60)",
    coldWater: "Cold water (m³/month)",
    hotWater: "Hot water (m³/month)",
    coldWaterLabel: "Cold water",
    sewage: "Sewage",
    hotWaterLabel: "Hot water",
    apartmentArea: "Apartment area (m²)",
    centralHeating: "Central heating (Nov–Mar, 0.04 AZN/m²)",
    monthlyUtility: "Monthly utility cost",
    perMonth: "AZN / month",
    annual: "Annual:",
    electricityLabel: "Electricity",
    gasLabel: "Gas",
    waterLabel: "Water",
    heatingLabel: "Heating",
    costStructure: "Cost structure",
    savingTips: "Saving tips",
    tip1: "Electricity: Stay within 200 kWh limit — the next tier is 19% more expensive",
    tip2: "Gas: Use less than 100 m³/month — the next tier is 76% more expensive",
    tip3: "LED bulbs use 80% less energy compared to regular bulbs",
    tip4: "Reducing boiler temperature by 1°C saves ~6%",
    tip5: "Install a water meter — you'll pay 30-40% less than the standard rate",
    emptyState: "Enter consumption data to see the result.",
  },
  ru: {
    title: "Калькулятор коммунальных расходов",
    description: "Рассчитайте расходы на электричество, газ, воду и другие коммунальные услуги по тарифам 2025 года.",
    breadcrumbCategory: "Недвижимость",
    formulaTitle: "Коммунальные тарифы 2025 года",
    formulaContent: `Электричество (с 02.01.2025, включая НДС):
• 0–200 кВт·ч: 8,4 гяпик (ранее 8 гяпик)
• 201–300 кВт·ч: 10 гяпик (ранее 9 гяпик)
• 300+ кВт·ч: 15 гяпик (ранее 13 гяпик)
• Фиксированная ежемесячная плата за обслуживание: 1,00 AZN

Природный газ (Азеригаз, годовой кумулятив):
• 0–1200 м³/год: 12 гяпик
• 1200–2500 м³/год: 20 гяпик
• 2500+ м³/год: 25 гяпик
• Фиксированная ежемесячная плата: 1,00 AZN

Водоснабжение:
• Баку, Сумгаит, Хырдалан, Абшерон: 0,70 AZN/м³
• Другие районы: 0,60 AZN/м³
• Канализация: 0,30 AZN/м³

Отопление: 0,04 AZN/м² (ноябрь–март)`,
    tabAll: "Все",
    tabElectricity: "Свет",
    tabGas: "Газ",
    tabWater: "Вода",
    electricity: "Электроэнергия",
    tariff2025: "тариф 2025",
    monthlyConsumption: "Ежемесячное потребление (кВт·ч)",
    calcMethod: "Метод расчёта",
    receipt: "квитанция",
    monthlyConsumptionLabel: "Ежемесячное потребление:",
    tariffPerKwh: "Тариф: за кВт·ч",
    qepik: "гяпик",
    tierLimitFull: "лимит этой ступени заполнен",
    ofEnergyFee: "от платы за энергию",
    fixedServiceFee: "Фиксированная ежемесячная плата",
    fixedServiceFeeDesc: "Взимается ежемесячно (обслуживание счётчика)",
    energyFee: "Плата за энергию",
    serviceFee: "Плата за обслуживание",
    totalPayment: "Итого к оплате",
    tier1Only: "Вы только на 1-й ступени — рассчитано по самому дешёвому тарифу!",
    tier2Warning: "Вы перешли на 2-ю ступень — потребление свыше 200 кВт·ч на 19% дороже.",
    tier3Warning: "Вы перешли на 3-ю ступень — потребление свыше 300 кВт·ч на 50% дороже!",
    naturalGas: "Природный газ (Азеригаз)",
    tariff2026: "тариф 2026",
    thisMonthConsumption: "Потребление за этот месяц (м³)",
    yearToDate: "Всего с начала года (м³)",
    yearToDateHint: "Сколько показывает счётчик с января до этого месяца? (Этот месяц не включён)",
    annualConsumption: "Годовое потребление:",
    tier1: "1-я ступень",
    tier2: "2-я ступень",
    tier3: "3-я ступень",
    thisMonthConsumptionLabel: "Потребление за месяц:",
    annualTotal: "Годовой итог:",
    yearUsedSoFar: "С начала года вы использовали {amount} м³",
    tier1Remaining: "до лимита 1-й ступени осталось {amount} м³",
    tier2Remaining: "до лимита 2-й ступени осталось {amount} м³",
    alreadyTier3: "уже на 3-й ступени",
    tariffPerM3: "Тариф: за м³",
    ofGasFee: "от платы за газ",
    fixedServiceFeeGas: "Фиксированная ежемесячная плата",
    fixedServiceFeeGasDesc: "Взимается ежемесячно (абонентское обслуживание)",
    gasFee: "Плата за газ",
    gasTier1Only: "Вы только на 1-й ступени (12 гяпик) — самый дешёвый тариф!",
    gasTier2Warning: "Внимание: Вы превысили годовой лимит 1200 м³ — превышение рассчитывается по 20 гяпик (на 67% дороже).",
    gasTier3Warning: "Внимание: Вы превысили годовой лимит 2500 м³ — превышение рассчитывается по 25 гяпик!",
    waterSupply: "Водоснабжение",
    bakuRegion: "Баку / Сумгаит / Абшерон (0,70)",
    otherRegion: "Другие районы (0,60)",
    coldWater: "Холодная вода (м³/мес.)",
    hotWater: "Горячая вода (м³/мес.)",
    coldWaterLabel: "Холодная вода",
    sewage: "Канализация",
    hotWaterLabel: "Горячая вода",
    apartmentArea: "Площадь квартиры (м²)",
    centralHeating: "Центральное отопление (нояб.–март, 0,04 AZN/м²)",
    monthlyUtility: "Ежемесячные коммунальные расходы",
    perMonth: "AZN / мес.",
    annual: "Годовой:",
    electricityLabel: "Электричество",
    gasLabel: "Газ",
    waterLabel: "Вода",
    heatingLabel: "Отопление",
    costStructure: "Структура расходов",
    savingTips: "Советы по экономии",
    tip1: "Электричество: Оставайтесь в пределах 200 кВт·ч — следующая ступень на 19% дороже",
    tip2: "Газ: Используйте менее 100 м³/мес. — следующая ступень на 76% дороже",
    tip3: "LED лампы потребляют на 80% меньше энергии по сравнению с обычными",
    tip4: "Снижение температуры котла на 1°C экономит ~6%",
    tip5: "Установите счётчик воды — будете платить на 30-40% меньше нормативного",
    emptyState: "Введите данные о потреблении, чтобы увидеть результат.",
  },
};

export default function KommunalCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  const [electricityKwh, setElectricityKwh] = useState("");
  const [gasM3, setGasM3] = useState("");
  const [gasPrevYearly, setGasPrevYearly] = useState("0");
  const [isBaku, setIsBaku] = useState(true);
  const [coldWaterM3, setColdWaterM3] = useState("");
  const [hotWaterM3, setHotWaterM3] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [includeHeating, setIncludeHeating] = useState(false);

  const result = useMemo(() => {
    const elKwh = parseFloat(electricityKwh) || 0;
    const gM3 = parseFloat(gasM3) || 0;
    const cwM3 = parseFloat(coldWaterM3) || 0;
    const hwM3 = parseFloat(hotWaterM3) || 0;
    const area = parseFloat(areaM2) || 0;

    const electricity = calcElectricity(elKwh);
    const prevYearly = parseFloat(gasPrevYearly) || 0;
    const gas = calcGas(gM3, prevYearly);

    const waterRate = isBaku ? WATER_BAKU : WATER_OTHER;
    const coldWater = cwM3 * waterRate;
    const wastewater = cwM3 * WASTEWATER;
    const hotWater = hwM3 * 2.20;
    const waterTotal = coldWater + wastewater + hotWater;

    const heating = includeHeating ? area * HEATING_RATE : 0;
    const total = electricity.total + gas.total + waterTotal + heating;

    return {
      electricity, gas,
      coldWater, wastewater, hotWater, waterTotal, waterRate,
      heating, total,
      elKwh, gM3, cwM3, hwM3, area,
    };
  }, [electricityKwh, gasM3, gasPrevYearly, coldWaterM3, hotWaterM3, areaM2, includeHeating, isBaku]);

  const hasAnyInput = result.elKwh > 0 || result.gM3 > 0 || result.cwM3 > 0 || result.hwM3 > 0;

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "all", label: pt.tabAll, icon: "📋" },
    { id: "electricity", label: pt.tabElectricity, icon: "💡" },
    { id: "gas", label: pt.tabGas, icon: "🔥" },
    { id: "water", label: pt.tabWater, icon: "💧" },
  ];

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=realestate" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["price-per-sqm", "property-tax", "rental-tax", "deposit"]}
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ELEKTRİK */}
      {(activeTab === "all" || activeTab === "electricity") && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h3 className="font-semibold text-foreground">{pt.electricity}</h3>
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{pt.tariff2025}</span>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-foreground mb-1">{pt.monthlyConsumption}</label>
            <input type="number" value={electricityKwh} onChange={(e) => setElectricityKwh(e.target.value)} placeholder="350" min="0" className={inputCls} />
            <div className="flex gap-2 mt-2">
              {[100, 200, 300, 500].map((v) => (
                <button key={v} onClick={() => setElectricityKwh(String(v))} className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-colors">
                  {v} kVt
                </button>
              ))}
            </div>
          </div>

          {result.electricity.subtotal > 0 && (() => {
            const el = result.electricity;
            return (
              <div className="mt-3 bg-white rounded-xl border border-amber-200 overflow-hidden">
                <div className="bg-amber-100 px-4 py-3 border-b border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-amber-800">{pt.calcMethod}</span>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{pt.receipt}</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">{pt.monthlyConsumptionLabel} <span className="font-bold">{result.elKwh} kVt·saat</span></p>
                </div>
                <div className="divide-y divide-amber-100">
                  {el.breakdown.map((b, i) => {
                    const pct = el.subtotal > 0 ? (b.cost / el.subtotal) * 100 : 0;
                    const tierFull = b.kwh >= (ELECTRICITY_TIERS[i]?.limit ?? 0) && ELECTRICITY_TIERS[i]?.limit !== Infinity;
                    return (
                      <div key={b.label} className="px-4 py-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-green-100 text-green-700" : i === 1 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{i + 1}</span>
                            <span className="text-sm font-medium text-foreground">{b.label}</span>
                          </div>
                          <span className="text-sm font-bold text-amber-700">{fmt(b.cost)} AZN</span>
                        </div>
                        <div className="ml-7">
                          <p className="text-xs text-foreground">
                            {b.kwh} kVt·saat × {b.rate} AZN = <span className="font-semibold">{fmt(b.cost)} AZN</span>
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            {pt.tariffPerKwh} {(b.rate * 100).toFixed(1)} {pt.qepik}
                            {tierFull && <span className="text-amber-600 ml-1"> — {pt.tierLimitFull}</span>}
                          </p>
                          <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-muted mt-0.5">{pt.ofEnergyFee} {pct.toFixed(0)}%</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-600">+</span>
                        <span className="text-sm font-medium text-foreground">{pt.fixedServiceFee}</span>
                      </div>
                      <span className="text-sm font-bold text-amber-700">{fmt(el.serviceFee)} AZN</span>
                    </div>
                    <p className="text-xs text-muted ml-7">{pt.fixedServiceFeeDesc}</p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-200">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted"><span>{pt.energyFee}</span><span>{fmt(el.subtotal)} AZN</span></div>
                    <div className="flex justify-between text-xs text-muted"><span>{pt.serviceFee}</span><span>{fmt(el.serviceFee)} AZN</span></div>
                    <div className="border-t border-amber-200 pt-1.5 mt-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-foreground">{pt.totalPayment}</span>
                      <span className="font-bold text-lg text-amber-700">{fmt(el.total)} AZN</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-gray-50 border-t border-amber-100 text-xs">
                  {el.breakdown.length === 1 && <p className="text-green-600">{pt.tier1Only}</p>}
                  {el.breakdown.length === 2 && <p className="text-amber-600">{pt.tier2Warning}</p>}
                  {el.breakdown.length >= 3 && <p className="text-red-600">{pt.tier3Warning}</p>}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* QAZ */}
      {(activeTab === "all" || activeTab === "gas") && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔥</span>
            <h3 className="font-semibold text-foreground">{pt.naturalGas}</h3>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{pt.tariff2026}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{pt.thisMonthConsumption}</label>
              <input type="number" value={gasM3} onChange={(e) => setGasM3(e.target.value)} placeholder="300" min="0" className={inputCls} />
              <div className="flex gap-2 mt-2">
                {[50, 150, 300, 500].map((v) => (
                  <button key={v} onClick={() => setGasM3(String(v))} className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors">
                    {v} m³
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{pt.yearToDate}</label>
              <input type="number" value={gasPrevYearly} onChange={(e) => setGasPrevYearly(e.target.value)} placeholder="0" min="0" className={inputCls} />
              <p className="text-[11px] text-muted mt-1">{pt.yearToDateHint}</p>
            </div>
          </div>

          {(() => {
            const prevYearly = parseFloat(gasPrevYearly) || 0;
            const newTotal = prevYearly + (parseFloat(gasM3) || 0);
            return (
              <div className="bg-white rounded-lg border border-blue-200 p-3 mb-3">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>{pt.annualConsumption} {Math.round(newTotal)} m³ / 2500 m³</span>
                  <span>{newTotal <= 1200 ? pt.tier1 : newTotal <= 2500 ? pt.tier2 : pt.tier3}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-400" style={{ width: `${Math.min((Math.min(newTotal, 1200) / 2500) * 100, 48)}%` }} />
                  {newTotal > 1200 && <div className="h-full bg-amber-400" style={{ width: `${Math.min(((Math.min(newTotal, 2500) - 1200) / 2500) * 100, 52)}%` }} />}
                  {newTotal > 2500 && <div className="h-full bg-red-400" style={{ width: "2%" }} />}
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-1">
                  <span>0</span>
                  <span className={newTotal > 1200 ? "text-amber-600 font-medium" : ""}>1200 m³</span>
                  <span className={newTotal > 2500 ? "text-red-600 font-medium" : ""}>2500 m³</span>
                </div>
              </div>
            );
          })()}

          {result.gas.subtotal > 0 && (() => {
            const g = result.gas;
            const prevYearly = parseFloat(gasPrevYearly) || 0;
            return (
              <div className="mt-3 bg-white rounded-xl border border-blue-200 overflow-hidden">
                <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-blue-800">{pt.calcMethod}</span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{pt.receipt}</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {pt.thisMonthConsumptionLabel} <span className="font-bold">{result.gM3} m³</span>
                    {prevYearly > 0 && <span className="ml-2">| {pt.annualTotal} {prevYearly} + {result.gM3} = {g.newYearlyCumulative} m³</span>}
                  </p>
                </div>
                {prevYearly > 0 && (
                  <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-700">
                    {pt.yearUsedSoFar.replace("{amount}", String(prevYearly))}
                    {prevYearly < 1200 ? ` — ${pt.tier1Remaining.replace("{amount}", String(1200 - prevYearly))}` :
                     prevYearly < 2500 ? ` — ${pt.tier2Remaining.replace("{amount}", String(2500 - prevYearly))}` :
                     ` — ${pt.alreadyTier3}`}
                  </div>
                )}
                <div className="divide-y divide-blue-100">
                  {g.breakdown.map((b) => {
                    const pct = g.subtotal > 0 ? (b.cost / g.subtotal) * 100 : 0;
                    return (
                      <div key={b.label} className="px-4 py-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${b.rate === 0.12 ? "bg-green-100 text-green-700" : b.rate === 0.20 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                              {b.rate === 0.12 ? "1" : b.rate === 0.20 ? "2" : "3"}
                            </span>
                            <span className="text-sm font-medium text-foreground">{b.label}</span>
                          </div>
                          <span className="text-sm font-bold text-blue-700">{fmt(b.cost)} AZN</span>
                        </div>
                        <div className="ml-7">
                          <p className="text-xs text-foreground">{b.m3} m³ × {b.rate} AZN = <span className="font-semibold">{fmt(b.cost)} AZN</span></p>
                          <p className="text-[11px] text-muted mt-0.5">{pt.tariffPerM3} {(b.rate * 100).toFixed(0)} {pt.qepik}</p>
                          <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-muted mt-0.5">{pt.ofGasFee} {pct.toFixed(0)}%</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-600">+</span>
                        <span className="text-sm font-medium text-foreground">{pt.fixedServiceFeeGas}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-700">{fmt(g.serviceFee)} AZN</span>
                    </div>
                    <p className="text-xs text-muted ml-7">{pt.fixedServiceFeeGasDesc}</p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted"><span>{pt.gasFee}</span><span>{fmt(g.subtotal)} AZN</span></div>
                    <div className="flex justify-between text-xs text-muted"><span>{pt.serviceFee}</span><span>{fmt(g.serviceFee)} AZN</span></div>
                    <div className="border-t border-blue-200 pt-1.5 mt-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-foreground">{pt.totalPayment}</span>
                      <span className="font-bold text-lg text-blue-700">{fmt(g.total)} AZN</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-gray-50 border-t border-blue-100 text-xs">
                  {g.breakdown.length === 1 && g.breakdown[0].rate === 0.12 && <p className="text-green-600">{pt.gasTier1Only}</p>}
                  {g.breakdown.some(b => b.rate === 0.20) && <p className="text-amber-600">{pt.gasTier2Warning}</p>}
                  {g.breakdown.some(b => b.rate === 0.25) && <p className="text-red-600">{pt.gasTier3Warning}</p>}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SU */}
      {(activeTab === "all" || activeTab === "water") && (
        <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💧</span>
            <h3 className="font-semibold text-foreground">{pt.waterSupply}</h3>
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setIsBaku(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isBaku ? "bg-cyan-500 text-white" : "bg-white text-muted border border-cyan-200"
              }`}
            >
              {pt.bakuRegion}
            </button>
            <button
              onClick={() => setIsBaku(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !isBaku ? "bg-cyan-500 text-white" : "bg-white text-muted border border-cyan-200"
              }`}
            >
              {pt.otherRegion}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-muted mb-1">{pt.coldWater}</label>
              <input type="number" value={coldWaterM3} onChange={(e) => setColdWaterM3(e.target.value)} placeholder="8" min="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">{pt.hotWater}</label>
              <input type="number" value={hotWaterM3} onChange={(e) => setHotWaterM3(e.target.value)} placeholder="3" min="0" className={inputCls} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-cyan-200 overflow-hidden mt-3">
            <div className="divide-y divide-cyan-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-foreground">{pt.coldWaterLabel} ({result.cwM3} m³ × {result.waterRate} AZN)</span>
                <span className="text-sm font-medium text-cyan-700">{fmt(result.coldWater)} AZN</span>
              </div>
              {result.cwM3 > 0 && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-foreground">{pt.sewage} ({result.cwM3} m³ × {WASTEWATER} AZN)</span>
                  <span className="text-sm font-medium text-cyan-700">{fmt(result.wastewater)} AZN</span>
                </div>
              )}
              {result.hwM3 > 0 && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-foreground">{pt.hotWaterLabel} ({result.hwM3} m³ × 2,20 AZN)</span>
                  <span className="text-sm font-medium text-cyan-700">{fmt(result.hotWater)} AZN</span>
                </div>
              )}
            </div>
          </div>

          {result.waterTotal > 0 && (
            <div className="mt-3 text-right">
              <span className="text-lg font-bold text-cyan-700">{fmt(result.waterTotal)} AZN</span>
            </div>
          )}
        </div>
      )}

      {/* İSTİLİK */}
      {activeTab === "all" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-gray-50 rounded-xl border border-border p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <span>🏠</span> {pt.apartmentArea}
            </label>
            <input type="number" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} placeholder="80" min="0" className={inputCls} />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={includeHeating} onChange={(e) => setIncludeHeating(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-xs text-muted">{pt.centralHeating}</span>
            </label>
          </div>
        </div>
      )}

      {/* NƏTİCƏLƏR */}
      {hasAnyInput ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.monthlyUtility}</p>
            <p className="text-4xl font-bold">{fmt(result.total)}</p>
            <p className="text-sm text-blue-200 mt-1">{pt.perMonth}</p>
            <p className="text-xs text-blue-300 mt-2">{pt.annual} {fmt(result.total * 12)} AZN</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {result.electricity.total > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                <span className="text-2xl block mb-1">💡</span>
                <p className="text-xs text-amber-600">{pt.electricityLabel}</p>
                <p className="text-lg font-bold text-amber-700">{fmt(result.electricity.total)}</p>
              </div>
            )}
            {result.gas.total > 0 && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                <span className="text-2xl block mb-1">🔥</span>
                <p className="text-xs text-blue-600">{pt.gasLabel}</p>
                <p className="text-lg font-bold text-blue-700">{fmt(result.gas.total)}</p>
              </div>
            )}
            {result.waterTotal > 0 && (
              <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-4 text-center">
                <span className="text-2xl block mb-1">💧</span>
                <p className="text-xs text-cyan-600">{pt.waterLabel}</p>
                <p className="text-lg font-bold text-cyan-700">{fmt(result.waterTotal)}</p>
              </div>
            )}
            {result.heating > 0 && (
              <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
                <span className="text-2xl block mb-1">🏠</span>
                <p className="text-xs text-orange-600">{pt.heatingLabel}</p>
                <p className="text-lg font-bold text-orange-700">{fmt(result.heating)}</p>
              </div>
            )}
          </div>

          {result.total > 0 && (
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-muted mb-3 font-medium">{pt.costStructure}</p>
              <div className="w-full h-6 rounded-full overflow-hidden flex">
                {result.electricity.total > 0 && <div className="h-full bg-amber-400" style={{ width: `${(result.electricity.total / result.total) * 100}%` }} />}
                {result.gas.total > 0 && <div className="h-full bg-blue-400" style={{ width: `${(result.gas.total / result.total) * 100}%` }} />}
                {result.waterTotal > 0 && <div className="h-full bg-cyan-400" style={{ width: `${(result.waterTotal / result.total) * 100}%` }} />}
                {result.heating > 0 && <div className="h-full bg-orange-400" style={{ width: `${(result.heating / result.total) * 100}%` }} />}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                {result.electricity.total > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />{pt.electricityLabel}: {fmt(result.electricity.total)} ({((result.electricity.total / result.total) * 100).toFixed(0)}%)</span>
                )}
                {result.gas.total > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />{pt.gasLabel}: {fmt(result.gas.total)} ({((result.gas.total / result.total) * 100).toFixed(0)}%)</span>
                )}
                {result.waterTotal > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />{pt.waterLabel}: {fmt(result.waterTotal)} ({((result.waterTotal / result.total) * 100).toFixed(0)}%)</span>
                )}
              </div>
            </div>
          )}

          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              {pt.savingTips}
            </h4>
            <ul className="text-xs text-green-700 space-y-1.5">
              <li>• {pt.tip1}</li>
              <li>• {pt.tip2}</li>
              <li>• {pt.tip3}</li>
              <li>• {pt.tip4}</li>
              <li>• {pt.tip5}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💡</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
