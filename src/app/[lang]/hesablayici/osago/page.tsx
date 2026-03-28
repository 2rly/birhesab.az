"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type Region = "baku" | "other";
type DriverAge = "under25" | "25plus";
type Experience = "under2" | "2plus";
type AccidentHistory = "clean" | "one" | "multiple";
type EnginePower = "under100" | "100to150" | "150to200" | "over200";

const BASE_RATE_BAKU = 50;
const BASE_RATE_OTHER = 40;

const regionOptionsTranslations: Record<Lang, { value: Region; label: string; icon: string }[]> = {
  az: [
    { value: "baku", label: "Bakı", icon: "🏙️" },
    { value: "other", label: "Digər regionlar", icon: "🌄" },
  ],
  en: [
    { value: "baku", label: "Baku", icon: "🏙️" },
    { value: "other", label: "Other regions", icon: "🌄" },
  ],
  ru: [
    { value: "baku", label: "Баку", icon: "🏙️" },
    { value: "other", label: "Другие регионы", icon: "🌄" },
  ],
};

const ageOptionsTranslations: Record<Lang, { value: DriverAge; label: string }[]> = {
  az: [
    { value: "under25", label: "25 yaşdan kiçik" },
    { value: "25plus", label: "25 yaş və yuxarı" },
  ],
  en: [
    { value: "under25", label: "Under 25" },
    { value: "25plus", label: "25 and older" },
  ],
  ru: [
    { value: "under25", label: "Младше 25 лет" },
    { value: "25plus", label: "25 лет и старше" },
  ],
};

const experienceOptionsTranslations: Record<Lang, { value: Experience; label: string }[]> = {
  az: [
    { value: "under2", label: "2 ildən az" },
    { value: "2plus", label: "2 il və yuxarı" },
  ],
  en: [
    { value: "under2", label: "Less than 2 years" },
    { value: "2plus", label: "2 years and more" },
  ],
  ru: [
    { value: "under2", label: "Менее 2 лет" },
    { value: "2plus", label: "2 года и более" },
  ],
};

const accidentOptionsTranslations: Record<Lang, { value: AccidentHistory; label: string; icon: string }[]> = {
  az: [
    { value: "clean", label: "Qəzasız", icon: "✅" },
    { value: "one", label: "1 qəza", icon: "⚠️" },
    { value: "multiple", label: "2+ qəza", icon: "🚨" },
  ],
  en: [
    { value: "clean", label: "No accidents", icon: "✅" },
    { value: "one", label: "1 accident", icon: "⚠️" },
    { value: "multiple", label: "2+ accidents", icon: "🚨" },
  ],
  ru: [
    { value: "clean", label: "Без аварий", icon: "✅" },
    { value: "one", label: "1 авария", icon: "⚠️" },
    { value: "multiple", label: "2+ аварии", icon: "🚨" },
  ],
};

const enginePowerOptionsTranslations: Record<Lang, { value: EnginePower; label: string }[]> = {
  az: [
    { value: "under100", label: "100 a.g.-dək" },
    { value: "100to150", label: "100–150 a.g." },
    { value: "150to200", label: "150–200 a.g." },
    { value: "over200", label: "200+ a.g." },
  ],
  en: [
    { value: "under100", label: "Under 100 HP" },
    { value: "100to150", label: "100–150 HP" },
    { value: "150to200", label: "150–200 HP" },
    { value: "over200", label: "200+ HP" },
  ],
  ru: [
    { value: "under100", label: "До 100 л.с." },
    { value: "100to150", label: "100–150 л.с." },
    { value: "150to200", label: "150–200 л.с." },
    { value: "over200", label: "200+ л.с." },
  ],
};

const pageTranslations = {
  az: {
    title: "OSAGO hesablayıcısı",
    description: "Azərbaycanda icbari avtomobil sığortası (OSAGO) haqqını hesablayın.",
    breadcrumbCategory: "Avtomobil",
    breadcrumbLabel: "OSAGO sığortası",
    formulaTitle: "OSAGO haqqı necə hesablanır?",
    formulaContent: `OSAGO haqqı = Baza dərəcə × Əmsallar

Baza dərəcə:
• Bakı: 50 AZN
• Digər regionlar: 40 AZN

Əmsallar:
• Region əmsalı: Bakı ×1.0, digər ×0.8
• Yaş/təcrübə: gənc sürücü (<25 yaş, <2 il) ×1.5
• Qəza tarixi: qəzasız ×0.8, 1 qəza ×1.5, 2+ qəza ×2.0
• Mühərrik gücü: <100 a.g. ×0.9, 100-150 ×1.0, 150-200 ×1.2, 200+ ×1.5

Bonus-malus sistemi:
Qəzasız sürücülər güzəştli tarif (×0.8) alır.
Qəza halında əmsal artır və növbəti il daha yüksək haqq ödənilir.`,
    regionLabel: "Region",
    driverAge: "Sürücünün yaşı",
    drivingExperience: "Sürücülük təcrübəsi",
    accidentHistory: "Qəza tarixi (son 1 il)",
    enginePower: "Mühərrikin gücü",
    osagoPremium: "OSAGO haqqı",
    perYear: "AZN / il",
    baseRate: "Baza dərəcə",
    otherLabel: "Digər",
    totalCoefficient: "Ümumi əmsal",
    discounted: "Güzəştli",
    highRisk: "Yüksək risk",
    normal: "Normal",
    coefficientBreakdown: "Əmsal tərkibi",
    regionCoeff: "Region əmsalı",
    ageExpCoeff: "Yaş/təcrübə əmsalı",
    bonusMalus: "Bonus-malus (qəza tarixi)",
    enginePowerCoeff: "Mühərrik gücü əmsalı",
    yourPremiumOnScale: "Sizin haqq skalada",
    bonusNote: "Qəzasız sürücü kimi güzəştli tarif (×0.8) tətbiq olunur. Növbəti il də qəzasız keçsəniz, güzəşt davam edəcək.",
    bonus: "Bonus:",
    malusNote: "Qəza tarixi olduğu üçün artırılmış tarif tətbiq olunur. 1 il qəzasız keçdikdən sonra əmsal azaldılacaq.",
    malus: "Malus:",
    infoNote: "Bu hesablama təxmini xarakter daşıyır. OSAGO sığortası icbaridir və sığorta şirkətinə müraciət etməklə rəsmiləşdirilir. Faktiki haqq sığorta şirkətinin tariflərinə əsasən fərqlənə bilər.",
    attention: "Diqqət:",
  },
  en: {
    title: "OSAGO Calculator",
    description: "Calculate compulsory motor third party liability insurance (OSAGO) premium in Azerbaijan.",
    breadcrumbCategory: "Automotive",
    breadcrumbLabel: "OSAGO insurance",
    formulaTitle: "How is OSAGO premium calculated?",
    formulaContent: `OSAGO premium = Base rate × Coefficients

Base rate:
• Baku: 50 AZN
• Other regions: 40 AZN

Coefficients:
• Region coefficient: Baku ×1.0, other ×0.8
• Age/experience: young driver (<25 years, <2 years) ×1.5
• Accident history: no accidents ×0.8, 1 accident ×1.5, 2+ accidents ×2.0
• Engine power: <100 HP ×0.9, 100-150 ×1.0, 150-200 ×1.2, 200+ ×1.5

Bonus-malus system:
Accident-free drivers receive a discounted rate (×0.8).
In case of an accident, the coefficient increases and a higher premium is paid next year.`,
    regionLabel: "Region",
    driverAge: "Driver's age",
    drivingExperience: "Driving experience",
    accidentHistory: "Accident history (last 1 year)",
    enginePower: "Engine power",
    osagoPremium: "OSAGO premium",
    perYear: "AZN / year",
    baseRate: "Base rate",
    otherLabel: "Other",
    totalCoefficient: "Total coefficient",
    discounted: "Discounted",
    highRisk: "High risk",
    normal: "Normal",
    coefficientBreakdown: "Coefficient breakdown",
    regionCoeff: "Region coefficient",
    ageExpCoeff: "Age/experience coefficient",
    bonusMalus: "Bonus-malus (accident history)",
    enginePowerCoeff: "Engine power coefficient",
    yourPremiumOnScale: "Your premium on the scale",
    bonusNote: "As an accident-free driver, a discounted rate (×0.8) applies. If you remain accident-free next year, the discount continues.",
    bonus: "Bonus:",
    malusNote: "Due to accident history, an increased rate applies. After 1 accident-free year, the coefficient will be reduced.",
    malus: "Malus:",
    infoNote: "This calculation is approximate. OSAGO insurance is mandatory and is processed by contacting an insurance company. The actual premium may differ based on the insurance company's rates.",
    attention: "Note:",
  },
  ru: {
    title: "Калькулятор ОСАГО",
    description: "Рассчитайте стоимость обязательного страхования автогражданской ответственности (ОСАГО) в Азербайджане.",
    breadcrumbCategory: "Автомобиль",
    breadcrumbLabel: "Страхование ОСАГО",
    formulaTitle: "Как рассчитывается стоимость ОСАГО?",
    formulaContent: `Стоимость ОСАГО = Базовая ставка × Коэффициенты

Базовая ставка:
• Баку: 50 AZN
• Другие регионы: 40 AZN

Коэффициенты:
• Региональный: Баку ×1.0, другие ×0.8
• Возраст/стаж: молодой водитель (<25 лет, <2 лет) ×1.5
• История аварий: без аварий ×0.8, 1 авария ×1.5, 2+ аварии ×2.0
• Мощность двигателя: <100 л.с. ×0.9, 100-150 ×1.0, 150-200 ×1.2, 200+ ×1.5

Система бонус-малус:
Безаварийные водители получают льготный тариф (×0.8).
В случае аварии коэффициент растёт, и в следующем году оплата увеличивается.`,
    regionLabel: "Регион",
    driverAge: "Возраст водителя",
    drivingExperience: "Водительский стаж",
    accidentHistory: "История аварий (за последний 1 год)",
    enginePower: "Мощность двигателя",
    osagoPremium: "Стоимость ОСАГО",
    perYear: "AZN / год",
    baseRate: "Базовая ставка",
    otherLabel: "Другие",
    totalCoefficient: "Общий коэффициент",
    discounted: "Льготный",
    highRisk: "Высокий риск",
    normal: "Обычный",
    coefficientBreakdown: "Состав коэффициентов",
    regionCoeff: "Региональный коэффициент",
    ageExpCoeff: "Коэффициент возраста/стажа",
    bonusMalus: "Бонус-малус (история аварий)",
    enginePowerCoeff: "Коэффициент мощности двигателя",
    yourPremiumOnScale: "Ваша стоимость на шкале",
    bonusNote: "Как безаварийный водитель, вам предоставляется льготный тариф (×0.8). Если в следующем году вы также будете без аварий, скидка сохранится.",
    bonus: "Бонус:",
    malusNote: "Из-за истории аварий применяется повышенный тариф. После 1 безаварийного года коэффициент будет снижен.",
    malus: "Малус:",
    infoNote: "Этот расчёт является приблизительным. Страхование ОСАГО обязательно и оформляется в страховой компании. Фактическая стоимость может отличаться в зависимости от тарифов страховой компании.",
    attention: "Внимание:",
  },
};

function getRegionCoeff(region: Region): number {
  return region === "baku" ? 1.0 : 0.8;
}

function getAgeExpCoeff(age: DriverAge, exp: Experience): number {
  if (age === "under25" && exp === "under2") return 1.5;
  if (age === "under25") return 1.3;
  if (exp === "under2") return 1.2;
  return 1.0;
}

function getAccidentCoeff(history: AccidentHistory): number {
  if (history === "clean") return 0.8;
  if (history === "one") return 1.5;
  return 2.0;
}

function getEnginePowerCoeff(power: EnginePower): number {
  if (power === "under100") return 0.9;
  if (power === "100to150") return 1.0;
  if (power === "150to200") return 1.2;
  return 1.5;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function OsagoCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const regionOptions = regionOptionsTranslations[lang];
  const ageOptions = ageOptionsTranslations[lang];
  const experienceOptions = experienceOptionsTranslations[lang];
  const accidentOptions = accidentOptionsTranslations[lang];
  const enginePowerOptions = enginePowerOptionsTranslations[lang];

  const [region, setRegion] = useState<Region>("baku");
  const [driverAge, setDriverAge] = useState<DriverAge>("25plus");
  const [experience, setExperience] = useState<Experience>("2plus");
  const [accidentHistory, setAccidentHistory] = useState<AccidentHistory>("clean");
  const [enginePower, setEnginePower] = useState<EnginePower>("100to150");

  const result = useMemo(() => {
    const baseRate = region === "baku" ? BASE_RATE_BAKU : BASE_RATE_OTHER;
    const regionCoeff = getRegionCoeff(region);
    const ageExpCoeff = getAgeExpCoeff(driverAge, experience);
    const accidentCoeff = getAccidentCoeff(accidentHistory);
    const powerCoeff = getEnginePowerCoeff(enginePower);

    const totalCoeff = regionCoeff * ageExpCoeff * accidentCoeff * powerCoeff;
    const premium = baseRate * totalCoeff;

    return {
      baseRate,
      regionCoeff,
      ageExpCoeff,
      accidentCoeff,
      powerCoeff,
      totalCoeff,
      premium,
    };
  }, [region, driverAge, experience, accidentHistory, enginePower]);

  const minPremium = BASE_RATE_OTHER * 0.8 * 1.0 * 0.8 * 0.9;
  const maxPremium = BASE_RATE_BAKU * 1.0 * 1.5 * 2.0 * 1.5;

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
      relatedIds={["road-tax", "car-customs", "car-loan", "fuel-cost"]}
    >
      {/* Region */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.regionLabel}</label>
        <div className="grid grid-cols-2 gap-3 sm:w-1/2">
          {regionOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                region === r.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{r.icon}</span>
              <p className="text-xs font-medium text-foreground">{r.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Driver Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">{pt.driverAge}</label>
          <div className="grid grid-cols-2 gap-3">
            {ageOptions.map((a) => (
              <button
                key={a.value}
                onClick={() => setDriverAge(a.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  driverAge === a.value
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-xs font-medium text-foreground">{a.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">{pt.drivingExperience}</label>
          <div className="grid grid-cols-2 gap-3">
            {experienceOptions.map((e) => (
              <button
                key={e.value}
                onClick={() => setExperience(e.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  experience === e.value
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-xs font-medium text-foreground">{e.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accident History */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.accidentHistory}</label>
        <div className="grid grid-cols-3 gap-3">
          {accidentOptions.map((a) => (
            <button
              key={a.value}
              onClick={() => setAccidentHistory(a.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                accidentHistory === a.value
                  ? accidentHistory === "clean"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                    : accidentHistory === "one"
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                    : "border-red-500 bg-red-50 ring-2 ring-red-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{a.icon}</span>
              <p className="text-xs font-medium text-foreground">{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Engine Power */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.enginePower}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {enginePowerOptions.map((ep) => (
            <button
              key={ep.value}
              onClick={() => setEnginePower(ep.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                enginePower === ep.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-xs font-medium text-foreground">{ep.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Main Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.osagoPremium}</p>
            <p className="text-3xl font-bold">{fmt(result.premium)}</p>
            <p className="text-xs text-blue-200 mt-1">{pt.perYear}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted mb-1">{pt.baseRate}</p>
            <p className="text-2xl font-bold text-foreground">{result.baseRate}</p>
            <p className="text-xs text-muted mt-1">AZN ({region === "baku" ? regionOptions[0].label : pt.otherLabel})</p>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
            <p className="text-sm text-amber-600 mb-1">{pt.totalCoefficient}</p>
            <p className="text-2xl font-bold text-amber-700">×{result.totalCoeff.toFixed(2)}</p>
            <p className="text-xs text-amber-600 mt-1">
              {result.totalCoeff < 1 ? pt.discounted : result.totalCoeff > 1.5 ? pt.highRisk : pt.normal}
            </p>
          </div>
        </div>

        {/* Coefficient Breakdown */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span>📋</span>
              {pt.coefficientBreakdown}
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">{pt.baseRate}</span>
              <span className="text-sm font-medium text-foreground">{result.baseRate} AZN</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">{pt.regionCoeff}</span>
              <span className={`text-sm font-medium ${result.regionCoeff < 1 ? "text-green-600" : "text-foreground"}`}>
                ×{result.regionCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">{pt.ageExpCoeff}</span>
              <span className={`text-sm font-medium ${result.ageExpCoeff > 1 ? "text-red-600" : "text-green-600"}`}>
                ×{result.ageExpCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">{pt.bonusMalus}</span>
              <span className={`text-sm font-medium ${result.accidentCoeff < 1 ? "text-green-600" : result.accidentCoeff > 1 ? "text-red-600" : "text-foreground"}`}>
                ×{result.accidentCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">{pt.enginePowerCoeff}</span>
              <span className={`text-sm font-medium ${result.powerCoeff < 1 ? "text-green-600" : result.powerCoeff > 1 ? "text-red-600" : "text-foreground"}`}>
                ×{result.powerCoeff.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between px-5 py-4 bg-primary-light">
              <span className="text-sm font-semibold text-primary-dark">
                {pt.osagoPremium} ({result.baseRate} × {result.totalCoeff.toFixed(2)})
              </span>
              <span className="text-sm font-bold text-primary-dark">{fmt(result.premium)} AZN</span>
            </div>
          </div>
        </div>

        {/* Visual Scale */}
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-xs text-muted mb-3 font-medium">{pt.yourPremiumOnScale}</p>
          <div className="relative">
            <div className="w-full h-4 bg-gradient-to-r from-green-300 via-amber-300 to-red-400 rounded-full" />
            <div
              className="absolute top-0 w-1 h-4 bg-foreground rounded-full"
              style={{ left: `${Math.min(((result.premium - minPremium) / (maxPremium - minPremium)) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>{fmt(minPremium)} AZN (min)</span>
            <span>{fmt(maxPremium)} AZN (max)</span>
          </div>
        </div>

        {/* Bonus-Malus Notice */}
        {accidentHistory === "clean" && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-700 leading-relaxed">
              <span className="font-semibold">{pt.bonus}</span> {pt.bonusNote}
            </p>
          </div>
        )}

        {accidentHistory !== "clean" && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">{pt.malus}</span> {pt.malusNote}
            </p>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">{pt.attention}</span> {pt.infoNote}
          </p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
