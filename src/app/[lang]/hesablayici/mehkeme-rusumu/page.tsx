"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type ClaimType = "property" | "non-property" | "divorce" | "appeal";
type PersonType = "individual" | "legal";

const claimTypesTranslations: Record<Lang, { value: ClaimType; label: string; icon: string; description: string }[]> = {
  az: [
    { value: "property", label: "Əmlak iddiası", icon: "🏠", description: "Əmlak tələbləri üzrə" },
    { value: "non-property", label: "Qeyri-əmlak", icon: "📝", description: "Qeyri-əmlak iddiası" },
    { value: "divorce", label: "Boşanma", icon: "💔", description: "Boşanma işi" },
    { value: "appeal", label: "Apellyasiya", icon: "⚖️", description: "Apellyasiya şikayəti" },
  ],
  en: [
    { value: "property", label: "Property claim", icon: "🏠", description: "Property-related claims" },
    { value: "non-property", label: "Non-property", icon: "📝", description: "Non-property claim" },
    { value: "divorce", label: "Divorce", icon: "💔", description: "Divorce case" },
    { value: "appeal", label: "Appeal", icon: "⚖️", description: "Appeal complaint" },
  ],
  ru: [
    { value: "property", label: "Имущественный иск", icon: "🏠", description: "По имущественным требованиям" },
    { value: "non-property", label: "Неимущественный", icon: "📝", description: "Неимущественный иск" },
    { value: "divorce", label: "Развод", icon: "💔", description: "Дело о разводе" },
    { value: "appeal", label: "Апелляция", icon: "⚖️", description: "Апелляционная жалоба" },
  ],
};

const pageTranslations = {
  az: {
    title: "Məhkəmə rüsumu hesablayıcısı",
    description: "Azərbaycanda məhkəmə rüsumunu iddia növü və məbləğinə görə hesablayın.",
    breadcrumbCategory: "Hüquq və Dövlət",
    breadcrumbLabel: "Məhkəmə rüsumu",
    formulaTitle: "Məhkəmə rüsumu necə hesablanır?",
    formulaContent: `Əmlak iddiaları:
• İddia məbləğinin 1%-i
• Minimum rüsum: 10 AZN

Qeyri-əmlak iddiaları:
• Fiziki şəxs: 20 AZN
• Hüquqi şəxs: 50 AZN

Boşanma işi:
• 20 AZN

Apellyasiya şikayəti:
• İlk instansiya rüsumunun 50%-i

Qeyd: Dövlət rüsumu məhkəməyə müraciət zamanı ödənilir.
Bəzi hallarda rüsumdan azad edilmə və güzəştlər tətbiq oluna bilər
(məsələn, əmək mübahisələri, əlillik və s.).`,
    claimTypeLabel: "İddia növü",
    claimAmountLabel: "İddia məbləği (AZN)",
    applicantStatus: "Müraciət edənin statusu",
    individual: "Fiziki şəxs",
    legalEntity: "Hüquqi şəxs",
    firstInstanceFee: "İlk instansiya rüsumu (AZN)",
    appealFeeNote: "Apellyasiya rüsumu ilk instansiya rüsumunun 50%-i qədərdir",
    courtFee: "Məhkəmə rüsumu",
    claimType: "İddia növü",
    detailedCalc: "Ətraflı hesablama",
    claimAmount: "İddia məbləği",
    appliedTariff: "Tətbiq olunan tarif",
    applicant: "Müraciət edən",
    firstInstanceFeeLabel: "İlk instansiya rüsumu",
    calcRule: "Hesablama qaydası",
    comparisonByAmount: "Məbləğə görə müqayisə",
    allClaimTypes: "Bütün iddia növləri",
    propertyClaim: "Əmlak iddiası",
    propertyClaimRate: "İddia məbləğinin 1% (min. 10 AZN)",
    nonPropertyIndividual: "Qeyri-əmlak (fiziki)",
    nonPropertyLegal: "Qeyri-əmlak (hüquqi)",
    divorceLabel: "Boşanma",
    appealLabel: "Apellyasiya",
    appealRate: "İlk instansiya rüsumunun 50%-i",
    exemptionsTitle: "Rüsumdan azad olunan hallar:",
    exemption1: "Əmək mübahisələri üzrə işçilər",
    exemption2: "Alimentlə bağlı iddialar",
    exemption3: "I və II qrup əlillər (iddia 1000 AZN-dək)",
    exemption4: "Dövlət orqanları (dövlət marağı üçün)",
    infoNote: "Bu hesablama Azərbaycan Respublikasının Mülki Prosessual Məcəlləsinə əsaslanır. Bəzi hallarda məhkəmə rüsumunun azaldılması və ya taksitlə ödənilməsi mümkündür. Dəqiq məlumat üçün vəkilə müraciət edin.",
    attention: "Diqqət:",
    emptyState: "Nəticəni görmək üçün lazımi məlumatları daxil edin.",
    minFeeApplied: "Minimum rüsum tətbiq olundu (10 AZN)",
    claimPercentage: "İddia məbləğinin 1%-i",
    individualLabel: "Fiziki şəxs",
    legalLabel: "Hüquqi şəxs",
    appealCalcNote: "İlk instansiya rüsumunun 50%-i",
  },
  en: {
    title: "Court Fee Calculator",
    description: "Calculate court fees in Azerbaijan based on claim type and amount.",
    breadcrumbCategory: "Law & Government",
    breadcrumbLabel: "Court fee",
    formulaTitle: "How are court fees calculated?",
    formulaContent: `Property claims:
• 1% of the claim amount
• Minimum fee: 10 AZN

Non-property claims:
• Individual: 20 AZN
• Legal entity: 50 AZN

Divorce case:
• 20 AZN

Appeal:
• 50% of the first instance fee

Note: The state fee is paid when applying to court.
In some cases, fee exemptions and discounts may apply
(e.g., labor disputes, disability, etc.).`,
    claimTypeLabel: "Claim type",
    claimAmountLabel: "Claim amount (AZN)",
    applicantStatus: "Applicant status",
    individual: "Individual",
    legalEntity: "Legal entity",
    firstInstanceFee: "First instance fee (AZN)",
    appealFeeNote: "Appeal fee is 50% of the first instance fee",
    courtFee: "Court fee",
    claimType: "Claim type",
    detailedCalc: "Detailed calculation",
    claimAmount: "Claim amount",
    appliedTariff: "Applied tariff",
    applicant: "Applicant",
    firstInstanceFeeLabel: "First instance fee",
    calcRule: "Calculation rule",
    comparisonByAmount: "Comparison by amount",
    allClaimTypes: "All claim types",
    propertyClaim: "Property claim",
    propertyClaimRate: "1% of claim amount (min. 10 AZN)",
    nonPropertyIndividual: "Non-property (individual)",
    nonPropertyLegal: "Non-property (legal entity)",
    divorceLabel: "Divorce",
    appealLabel: "Appeal",
    appealRate: "50% of first instance fee",
    exemptionsTitle: "Fee exemption cases:",
    exemption1: "Employees in labor disputes",
    exemption2: "Alimony claims",
    exemption3: "Group I and II disabled persons (claims up to 1000 AZN)",
    exemption4: "Government bodies (for state interests)",
    infoNote: "This calculation is based on the Civil Procedure Code of the Republic of Azerbaijan. In some cases, court fees may be reduced or paid in installments. Consult a lawyer for exact information.",
    attention: "Note:",
    emptyState: "Enter the required information to see the result.",
    minFeeApplied: "Minimum fee applied (10 AZN)",
    claimPercentage: "1% of the claim amount",
    individualLabel: "Individual",
    legalLabel: "Legal entity",
    appealCalcNote: "50% of the first instance fee",
  },
  ru: {
    title: "Калькулятор судебной пошлины",
    description: "Рассчитайте судебную пошлину в Азербайджане по виду и сумме иска.",
    breadcrumbCategory: "Право и государство",
    breadcrumbLabel: "Судебная пошлина",
    formulaTitle: "Как рассчитывается судебная пошлина?",
    formulaContent: `Имущественные иски:
• 1% от суммы иска
• Минимальная пошлина: 10 AZN

Неимущественные иски:
• Физическое лицо: 20 AZN
• Юридическое лицо: 50 AZN

Дело о разводе:
• 20 AZN

Апелляционная жалоба:
• 50% пошлины первой инстанции

Примечание: Государственная пошлина уплачивается при подаче заявления в суд.
В некоторых случаях возможно освобождение от пошлины и льготы
(например, трудовые споры, инвалидность и т.д.).`,
    claimTypeLabel: "Вид иска",
    claimAmountLabel: "Сумма иска (AZN)",
    applicantStatus: "Статус заявителя",
    individual: "Физическое лицо",
    legalEntity: "Юридическое лицо",
    firstInstanceFee: "Пошлина первой инстанции (AZN)",
    appealFeeNote: "Пошлина за апелляцию составляет 50% от пошлины первой инстанции",
    courtFee: "Судебная пошлина",
    claimType: "Вид иска",
    detailedCalc: "Подробный расчёт",
    claimAmount: "Сумма иска",
    appliedTariff: "Применённый тариф",
    applicant: "Заявитель",
    firstInstanceFeeLabel: "Пошлина первой инстанции",
    calcRule: "Правило расчёта",
    comparisonByAmount: "Сравнение по суммам",
    allClaimTypes: "Все виды исков",
    propertyClaim: "Имущественный иск",
    propertyClaimRate: "1% от суммы иска (мин. 10 AZN)",
    nonPropertyIndividual: "Неимущественный (физ. лицо)",
    nonPropertyLegal: "Неимущественный (юр. лицо)",
    divorceLabel: "Развод",
    appealLabel: "Апелляция",
    appealRate: "50% пошлины первой инстанции",
    exemptionsTitle: "Случаи освобождения от пошлины:",
    exemption1: "Работники в трудовых спорах",
    exemption2: "Иски об алиментах",
    exemption3: "Инвалиды I и II группы (иски до 1000 AZN)",
    exemption4: "Государственные органы (в государственных интересах)",
    infoNote: "Этот расчёт основан на Гражданском процессуальном кодексе Азербайджанской Республики. В некоторых случаях возможно снижение судебной пошлины или оплата в рассрочку. Обратитесь к адвокату за точной информацией.",
    attention: "Внимание:",
    emptyState: "Введите необходимые данные, чтобы увидеть результат.",
    minFeeApplied: "Применена минимальная пошлина (10 AZN)",
    claimPercentage: "1% от суммы иска",
    individualLabel: "Физическое лицо",
    legalLabel: "Юридическое лицо",
    appealCalcNote: "50% пошлины первой инстанции",
  },
};

function getPropertyClaimFee(amount: number): number {
  const fee = amount * 0.01; // 1% of claim amount
  return Math.max(fee, 10); // minimum 10 AZN
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CourtFeeCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const claimTypes = claimTypesTranslations[lang];

  const [claimType, setClaimType] = useState<ClaimType>("property");
  const [claimAmount, setClaimAmount] = useState("");
  const [personType, setPersonType] = useState<PersonType>("individual");
  const [originalFee, setOriginalFee] = useState("");

  const result = useMemo(() => {
    switch (claimType) {
      case "property": {
        const amount = parseFloat(claimAmount);
        if (!amount || amount <= 0) return null;
        const fee = getPropertyClaimFee(amount);
        return {
          type: "property" as const,
          fee,
          claimAmount: amount,
          percentage: (fee / amount) * 100,
          note: fee === 10 ? pt.minFeeApplied : pt.claimPercentage,
        };
      }
      case "non-property": {
        const fee = personType === "individual" ? 20 : 50;
        return {
          type: "non-property" as const,
          fee,
          personType,
          label: personType === "individual" ? pt.individualLabel : pt.legalLabel,
        };
      }
      case "divorce": {
        return {
          type: "divorce" as const,
          fee: 20,
        };
      }
      case "appeal": {
        const origFee = parseFloat(originalFee);
        if (!origFee || origFee <= 0) return null;
        const fee = origFee * 0.5;
        return {
          type: "appeal" as const,
          fee,
          originalFee: origFee,
          note: pt.appealCalcNote,
        };
      }
      default:
        return null;
    }
  }, [claimType, claimAmount, personType, originalFee, pt]);

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
      relatedIds={["notary-fee", "property-tax", "court-fee", "customs-duty"]}
    >
      {/* Claim Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.claimTypeLabel}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {claimTypes.map((ct) => (
            <button
              key={ct.value}
              onClick={() => setClaimType(ct.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                claimType === ct.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{ct.icon}</span>
              <p className="text-xs font-medium text-foreground">{ct.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Inputs */}
      <div className="space-y-4 mb-8">
        {claimType === "property" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              💰 {pt.claimAmountLabel}
            </label>
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="50000"
              min="0"
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        )}

        {claimType === "non-property" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">{pt.applicantStatus}</label>
            <div className="grid grid-cols-2 gap-3 sm:w-1/2">
              <button
                onClick={() => setPersonType("individual")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  personType === "individual"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <span className="text-xl block mb-1">👤</span>
                <p className="text-xs font-medium text-foreground">{pt.individual}</p>
                <p className="text-xs text-muted">20 AZN</p>
              </button>
              <button
                onClick={() => setPersonType("legal")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  personType === "legal"
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <span className="text-xl block mb-1">🏢</span>
                <p className="text-xs font-medium text-foreground">{pt.legalEntity}</p>
                <p className="text-xs text-muted">50 AZN</p>
              </button>
            </div>
          </div>
        )}

        {claimType === "appeal" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📋 {pt.firstInstanceFee}
            </label>
            <input
              type="number"
              value={originalFee}
              onChange={(e) => setOriginalFee(e.target.value)}
              placeholder="500"
              min="0"
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <p className="text-xs text-muted mt-1">{pt.appealFeeNote}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.courtFee}</p>
              <p className="text-3xl font-bold">{fmt(result.fee)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.claimType}</p>
              <p className="text-xl font-bold text-foreground">
                {claimTypes.find((c) => c.value === claimType)?.label}
              </p>
              <p className="text-xs text-muted mt-1">
                {claimTypes.find((c) => c.value === claimType)?.description}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.detailedCalc}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.claimType}</span>
                <span className="text-sm font-medium text-foreground">
                  {claimTypes.find((c) => c.value === claimType)?.description}
                </span>
              </div>

              {result.type === "property" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.claimAmount}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.claimAmount)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.appliedTariff}</span>
                    <span className="text-sm font-medium text-foreground">{result.note}</span>
                  </div>
                </>
              )}

              {result.type === "non-property" && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.applicant}</span>
                  <span className="text-sm font-medium text-foreground">{result.label}</span>
                </div>
              )}

              {result.type === "appeal" && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.firstInstanceFeeLabel}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.originalFee)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.calcRule}</span>
                    <span className="text-sm font-medium text-foreground">{result.note}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.courtFee}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.fee)} AZN</span>
              </div>
            </div>
          </div>

          {/* Property Claim Comparison */}
          {result.type === "property" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📊</span>
                  {pt.comparisonByAmount}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "1 000 AZN", amount: 1000 },
                  { label: "5 000 AZN", amount: 5000 },
                  { label: "10 000 AZN", amount: 10000 },
                  { label: "50 000 AZN", amount: 50000 },
                  { label: "100 000 AZN", amount: 100000 },
                  { label: "500 000 AZN", amount: 500000 },
                ].map((item) => {
                  const fee = getPropertyClaimFee(item.amount);
                  const maxFee = getPropertyClaimFee(500000);
                  const isActive = Math.abs(result.claimAmount - item.amount) < 1;
                  return (
                    <div
                      key={item.amount}
                      className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}
                    >
                      <span className={`text-sm ${isActive ? "font-semibold text-primary-dark" : "text-foreground"}`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isActive ? "bg-primary" : "bg-gray-300"}`}
                            style={{ width: `${(fee / maxFee) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-20 text-right ${isActive ? "text-primary-dark font-bold" : "text-foreground"}`}>
                          {fmt(fee)} AZN
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Claim Types Overview */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.allClaimTypes}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className={`flex justify-between px-5 py-3 ${claimType === "property" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">🏠 {pt.propertyClaim}</span>
                <span className="text-sm text-muted">{pt.propertyClaimRate}</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "non-property" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">📝 {pt.nonPropertyIndividual}</span>
                <span className="text-sm font-medium text-foreground">20 AZN</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "non-property" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">📝 {pt.nonPropertyLegal}</span>
                <span className="text-sm font-medium text-foreground">50 AZN</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "divorce" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">💔 {pt.divorceLabel}</span>
                <span className="text-sm font-medium text-foreground">20 AZN</span>
              </div>
              <div className={`flex justify-between px-5 py-3 ${claimType === "appeal" ? "bg-primary-light" : ""}`}>
                <span className="text-sm text-foreground">⚖️ {pt.appealLabel}</span>
                <span className="text-sm text-muted">{pt.appealRate}</span>
              </div>
            </div>
          </div>

          {/* Exemption Info */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2">{pt.exemptionsTitle}</h4>
            <ul className="text-xs text-green-700 leading-relaxed space-y-1">
              <li>- {pt.exemption1}</li>
              <li>- {pt.exemption2}</li>
              <li>- {pt.exemption3}</li>
              <li>- {pt.exemption4}</li>
            </ul>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.attention}</span> {pt.infoNote}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">⚖️</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
