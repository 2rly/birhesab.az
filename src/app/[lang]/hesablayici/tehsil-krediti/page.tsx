"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type TtkType = "social" | "standard";

const termOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

const pageTranslations = {
  az: {
    title: "Təhsil tələbə krediti (TTK) hesablayıcısı",
    description: "Sosial və standart TTK-nın sığorta haqqı, güzəşt, yekun borc və aylıq ödənişini hesablayın. TTK almaq hüququnuzu yoxlayın.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "TTK necə hesablanır?",
    formulaContent: `Təhsil Tələbə Krediti (TTK) — Prezidentin 2021-ci il 17 iyun Fərmanına əsasən:

Kredit növləri:
• Sosial TTK: illik 2% faiz
• Standart TTK: illik 6% faiz

Sığorta haqqı = Kredit məbləği × Faiz dərəcəsi × Müddət (il)
Ümumi borc = Kredit məbləği + Sığorta haqqı

Güzəştlər (ÜOMG-yə görə):
Sosial: ≥71 bal → sığorta haqqı tutulmur; bütün semestrlər ≥91 → kreditin 50%-i bağışlanır
Standart: bütün semestrlər ≥91 → kreditin 25%-i bağışlanır

Yekun = Ümumi borc − Güzəşt
Aylıq ödəniş = Yekun ÷ (Müddət × 12)

Təhsil, güzəşt və möhlət müddətində kreditə faiz hesablanmır və ödəniş tələb olunmur.
Girov və zəmanət tələb olunmur.
Mənbə: e-ttkf.edu.az`,
    ttkType: "TTK növü",
    social: "Sosial",
    standard: "Standart",
    term: "Müddət (il)",
    loanAmount: "Kredit məbləği (sığortasız)",
    loanAmountRequired: "Kredit məbləği daxil edilməlidir.",
    gpa71: "Bütün semestrlər üzrə 71 bal və üzəri",
    gpa91: "Bütün semestrlər üzrə 91 bal və üzəri",
    insuranceFee: "Sığorta haqqı",
    totalDebt: "Ümumi borc",
    discount: "Güzəşt",
    finalAmount: "Yekun",
    monthlyPayment: "Aylıq ödəniş",
    source: "Mənbə: TTKF (e-ttkf.edu.az)",
    // Eligibility checker
    eligibilityTitle: "TTK almaq hüququmu yoxla",
    eligibilityDesc: "Aşağıdakı şərtlərə uyğunluğunuzu yoxlayın",
    socialEligTitle: "Sosial TTK şərtləri",
    socialEligDesc: "Aşağıdakı şərtlərdən hər hansı BİRİ olduqda sosial TTK almaq hüququ yaranır:",
    standardEligTitle: "Standart TTK şərtləri",
    standardEligDesc: "Aşağıdakı şərtlərin HƏR ÜÇÜ eyni vaxtda olmalıdır:",
    socialCond1: "Ünvanlı dövlət sosial yardımı alan ailənin üzvüyəm",
    socialCond2: "3-cü dərəcə əlilliyim var",
    socialCond3: "Hər iki valideynim (tək valideynim olduqda, həmin şəxs) aşağıdakılardan birinə aiddir:",
    parentCond1: "1-ci və ya 2-ci dərəcə əlilliyi var",
    parentCond2: "İşsiz kimi qeydiyyatdadır",
    parentCond3: "Yaşa görə əmək pensiyası alır",
    parentCond4: "Yaşa görə sosial müavinət alır",
    standardCond1: "ÜOMG-m 71 bal və yuxarıdır",
    standardCond2: "Təhsil haqqı xərcinin 20%-ni özüm ödəyirəm",
    standardCond3: "Sosial TTK almaq hüququm yoxdur",
    resultSocial: "Sosial TTK almaq hüququnuz var!",
    resultStandard: "Standart TTK almaq hüququnuz var!",
    resultBoth: "Həm Sosial, həm Standart TTK almaq hüququnuz var! Sosial TTK daha sərfəlidir (2% faiz).",
    resultNone: "Hazırda TTK almaq şərtlərinə uyğun gəlmirsiniz.",
    resultSocialNote: "Sosial TTK: illik 2% faiz, girov tələb olunmur.",
    resultStandardNote: "Standart TTK: illik 6% faiz, girov tələb olunmur.",
    // Discounts info
    discountsTitle: "Tətbiq edilən güzəştlər",
    socialDiscount1: "Sosial TTK: ÜOMG ≥71 → həmin semestr üçün faiz hesablanmır",
    socialDiscount2: "Sosial TTK: Bütün semestrlər ÜOMG ≥91 → kreditin 50%-i bağışlanır",
    standardDiscount1: "Standart TTK: ÜOMG ≥91 → həmin semestr üçün faiz hesablanmır",
    standardDiscount2: "Standart TTK: Bütün semestrlər ÜOMG ≥91 → kreditin 25%-i bağışlanır",
    // Extra info
    tuitionRange: "Təhsil haqqı: 400 – 10 000 AZN (təhsil səviyyəsi, müəssisə və ixtisasa görə dəyişir)",
    minScoreTitle: "1-ci kurs, 1-ci semestr üçün minimum bal həddi",
    minScoreBachelor: "Bakalavriat: 300 – 700 bal",
    minScoreMaster: "Magistratura: 50 – 100 bal",
    minScoreVocational: "Subbakalavriat: 110 – 300 bal",
    defermentTitle: "Möhlət verilən hallar",
    deferment1: "Yuxarı təhsil səviyyəsində əyani təhsil",
    deferment2: "Həqiqi hərbi xidmət",
    deferment3: "Məhkumluq",
    deferment4: "Hamiləlik, doğum və uşağa qulluq məzuniyyəti (3 yaşadək)",
    deferment5: "Sağlamlıq imkanları məhdud uşaqlara və I dərəcə əlillərə qulluq",
    defermentNote: "Möhlətin 1 tələbə üçün orta müddəti 2-4 ildir.",
    insuredTitle: "Sığortalanan hallar",
    insured1: "Ölüm",
    insured2: "Əmək qabiliyyətinin tam və ya qismən itirilməsi (əlillik)",
    insuredNote: "Sığorta haqqı kreditin məbləğinə əlavə olunaraq müvəkkil bank tərəfindən ödənilir.",
  },
  en: {
    title: "Student Education Loan (TTK) Calculator",
    description: "Calculate insurance fee, discount, total debt and monthly payment for Social and Standard TTK. Check your eligibility.",
    breadcrumbCategory: "Education",
    formulaTitle: "How is TTK calculated?",
    formulaContent: `Student Education Loan (TTK) — based on the Presidential Decree of June 17, 2021:

Loan types:
• Social TTK: 2% annual interest
• Standard TTK: 6% annual interest

Insurance fee = Loan amount × Interest rate × Term (years)
Total debt = Loan amount + Insurance fee

Discounts (based on GPA):
Social: ≥71 → no insurance fee; all semesters ≥91 → 50% of loan forgiven
Standard: all semesters ≥91 → 25% of loan forgiven

Final = Total debt − Discount
Monthly payment = Final ÷ (Term × 12)

No interest or payment required during education, grace and deferment periods.
No collateral required.
Source: e-ttkf.edu.az`,
    ttkType: "TTK type",
    social: "Social",
    standard: "Standard",
    term: "Term (years)",
    loanAmount: "Loan amount (without insurance)",
    loanAmountRequired: "Loan amount is required.",
    gpa71: "All semesters GPA 71 and above",
    gpa91: "All semesters GPA 91 and above",
    insuranceFee: "Insurance fee",
    totalDebt: "Total debt",
    discount: "Discount",
    finalAmount: "Final",
    monthlyPayment: "Monthly payment",
    source: "Source: TTKF (e-ttkf.edu.az)",
    eligibilityTitle: "Check your TTK eligibility",
    eligibilityDesc: "Check if you meet the requirements below",
    socialEligTitle: "Social TTK requirements",
    socialEligDesc: "ANY ONE of the following conditions grants Social TTK eligibility:",
    standardEligTitle: "Standard TTK requirements",
    standardEligDesc: "ALL THREE conditions must be met simultaneously:",
    socialCond1: "I am a member of a family receiving targeted state social assistance",
    socialCond2: "I have a 3rd degree disability",
    socialCond3: "Both parents (or single parent) fall into any of the following:",
    parentCond1: "Has 1st or 2nd degree disability",
    parentCond2: "Is registered as unemployed",
    parentCond3: "Receives age-based labor pension",
    parentCond4: "Receives age-based social allowance",
    standardCond1: "My GPA is 71 and above",
    standardCond2: "I pay 20% of my tuition fee myself",
    standardCond3: "I am not eligible for Social TTK",
    resultSocial: "You are eligible for Social TTK!",
    resultStandard: "You are eligible for Standard TTK!",
    resultBoth: "You are eligible for both Social and Standard TTK! Social TTK is more beneficial (2% interest).",
    resultNone: "You currently do not meet TTK eligibility requirements.",
    resultSocialNote: "Social TTK: 2% annual interest, no collateral required.",
    resultStandardNote: "Standard TTK: 6% annual interest, no collateral required.",
    discountsTitle: "Available discounts",
    socialDiscount1: "Social TTK: GPA ≥71 → no interest for that semester",
    socialDiscount2: "Social TTK: All semesters GPA ≥91 → 50% of loan forgiven",
    standardDiscount1: "Standard TTK: GPA ≥91 → no interest for that semester",
    standardDiscount2: "Standard TTK: All semesters GPA ≥91 → 25% of loan forgiven",
    tuitionRange: "Tuition fee: 400 – 10,000 AZN (varies by education level, institution and major)",
    minScoreTitle: "Minimum score threshold for 1st year, 1st semester",
    minScoreBachelor: "Bachelor's: 300 – 700 points",
    minScoreMaster: "Master's: 50 – 100 points",
    minScoreVocational: "Sub-bachelor: 110 – 300 points",
    defermentTitle: "Deferment cases",
    deferment1: "Full-time higher education",
    deferment2: "Mandatory military service",
    deferment3: "Imprisonment",
    deferment4: "Maternity, childbirth and childcare leave (up to 3 years)",
    deferment5: "Care for children with limited health abilities and persons with 1st degree disability",
    defermentNote: "Average deferment period per student is 2-4 years.",
    insuredTitle: "Insured cases",
    insured1: "Death",
    insured2: "Full or partial loss of work capacity (disability)",
    insuredNote: "Insurance fee is added to the loan amount and paid by the authorized bank.",
  },
  ru: {
    title: "Калькулятор студенческого кредита (ТТК)",
    description: "Рассчитайте страховой взнос, скидку, общий долг и ежемесячный платёж. Проверьте право на получение ТТК.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Как рассчитывается ТТК?",
    formulaContent: `Студенческий кредит (ТТК) — на основании Указа Президента от 17 июня 2021 года:

Типы кредита:
• Социальный ТТК: 2% годовых
• Стандартный ТТК: 6% годовых

Страховой взнос = Сумма кредита × Процентная ставка × Срок (лет)
Общий долг = Сумма кредита + Страховой взнос

Скидки (по среднему баллу):
Социальный: ≥71 → без страхового взноса; все семестры ≥91 → 50% кредита прощается
Стандартный: все семестры ≥91 → 25% кредита прощается

Итого = Общий долг − Скидка
Ежемесячный платёж = Итого ÷ (Срок × 12)

В период обучения, льготный и отсрочки проценты не начисляются и платежи не требуются.
Залог не требуется.
Источник: e-ttkf.edu.az`,
    ttkType: "Тип ТТК",
    social: "Социальный",
    standard: "Стандартный",
    term: "Срок (лет)",
    loanAmount: "Сумма кредита (без страховки)",
    loanAmountRequired: "Необходимо указать сумму кредита.",
    gpa71: "Все семестры — балл 71 и выше",
    gpa91: "Все семестры — балл 91 и выше",
    insuranceFee: "Страховой взнос",
    totalDebt: "Общий долг",
    discount: "Скидка",
    finalAmount: "Итого",
    monthlyPayment: "Ежемесячный платёж",
    source: "Источник: TTKF (e-ttkf.edu.az)",
    eligibilityTitle: "Проверить право на ТТК",
    eligibilityDesc: "Проверьте, соответствуете ли вы требованиям",
    socialEligTitle: "Условия социального ТТК",
    socialEligDesc: "ЛЮБОЕ ОДНО из следующих условий даёт право на социальный ТТК:",
    standardEligTitle: "Условия стандартного ТТК",
    standardEligDesc: "ВСЕ ТРИ условия должны выполняться одновременно:",
    socialCond1: "Я являюсь членом семьи, получающей адресную государственную социальную помощь",
    socialCond2: "У меня инвалидность 3-й степени",
    socialCond3: "Оба родителя (или один, если единственный) относятся к одной из категорий:",
    parentCond1: "Инвалидность 1-й или 2-й степени",
    parentCond2: "Зарегистрирован как безработный",
    parentCond3: "Получает трудовую пенсию по возрасту",
    parentCond4: "Получает социальное пособие по возрасту",
    standardCond1: "Мой средний балл 71 и выше",
    standardCond2: "Я оплачиваю 20% стоимости обучения самостоятельно",
    standardCond3: "У меня нет права на социальный ТТК",
    resultSocial: "Вы имеете право на социальный ТТК!",
    resultStandard: "Вы имеете право на стандартный ТТК!",
    resultBoth: "Вы имеете право на оба типа ТТК! Социальный ТТК выгоднее (2% годовых).",
    resultNone: "В настоящее время вы не соответствуете условиям ТТК.",
    resultSocialNote: "Социальный ТТК: 2% годовых, залог не требуется.",
    resultStandardNote: "Стандартный ТТК: 6% годовых, залог не требуется.",
    discountsTitle: "Применяемые скидки",
    socialDiscount1: "Социальный ТТК: Средний балл ≥71 → без процентов за этот семестр",
    socialDiscount2: "Социальный ТТК: Все семестры ≥91 → 50% кредита прощается",
    standardDiscount1: "Стандартный ТТК: Средний балл ≥91 → без процентов за этот семестр",
    standardDiscount2: "Стандартный ТТК: Все семестры ≥91 → 25% кредита прощается",
    tuitionRange: "Плата за обучение: 400 – 10 000 AZN (зависит от уровня, учреждения и специальности)",
    minScoreTitle: "Минимальный порог баллов для 1-го курса, 1-го семестра",
    minScoreBachelor: "Бакалавриат: 300 – 700 баллов",
    minScoreMaster: "Магистратура: 50 – 100 баллов",
    minScoreVocational: "Суббакалавриат: 110 – 300 баллов",
    defermentTitle: "Случаи предоставления отсрочки",
    deferment1: "Очное обучение на более высоком уровне",
    deferment2: "Действительная военная служба",
    deferment3: "Лишение свободы",
    deferment4: "Отпуск по беременности, родам и уходу за ребёнком (до 3 лет)",
    deferment5: "Уход за детьми с ОВЗ и лицами с инвалидностью 1-й степени",
    defermentNote: "Средний срок отсрочки на 1 студента — 2-4 года.",
    insuredTitle: "Страхуемые случаи",
    insured1: "Смерть",
    insured2: "Полная или частичная потеря трудоспособности (инвалидность)",
    insuredNote: "Страховой взнос добавляется к сумме кредита и оплачивается уполномоченным банком.",
  },
};

export default function TtkCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  // Calculator state
  const [ttkType, setTtkType] = useState<TtkType>("social");
  const [term, setTerm] = useState("10");
  const [loanAmount, setLoanAmount] = useState("");
  const [gpa71, setGpa71] = useState(false);
  const [gpa91, setGpa91] = useState(false);

  // Eligibility checker state
  const [showEligibility, setShowEligibility] = useState(false);
  const [socialCond1, setSocialCond1] = useState(false);
  const [socialCond2, setSocialCond2] = useState(false);
  const [parentCond1, setParentCond1] = useState(false);
  const [parentCond2, setParentCond2] = useState(false);
  const [parentCond3, setParentCond3] = useState(false);
  const [parentCond4, setParentCond4] = useState(false);
  const [stdCond1, setStdCond1] = useState(false);
  const [stdCond2, setStdCond2] = useState(false);
  const [stdCond3, setStdCond3] = useState(false);

  function handleTtkType(type: TtkType) {
    setTtkType(type);
    if (type === "standard") setGpa71(false);
  }

  const annualRate = ttkType === "social" ? 0.02 : 0.06;
  const years = parseInt(term) || 10;

  const result = useMemo(() => {
    const loan = parseFloat(loanAmount);
    if (!loan || loan <= 0) return null;

    let insuranceFee = loan * annualRate * years;
    if (ttkType === "social" && gpa71) {
      insuranceFee = 0;
    }

    const totalDebt = loan + insuranceFee;

    let discountAmount = 0;
    if (gpa91) {
      if (ttkType === "social") {
        discountAmount = loan * 0.5;
      } else {
        discountAmount = loan * 0.25;
      }
    }

    const finalAmount = totalDebt - discountAmount;
    const totalMonths = years * 12;
    const monthlyPayment = totalMonths > 0 ? finalAmount / totalMonths : 0;

    return { insuranceFee, totalDebt, discountAmount, finalAmount, monthlyPayment };
  }, [loanAmount, ttkType, annualRate, years, gpa71, gpa91]);

  // Eligibility result
  const parentCondMet = parentCond1 || parentCond2 || parentCond3 || parentCond4;
  const socialEligible = socialCond1 || socialCond2 || parentCondMet;
  const standardEligible = stdCond1 && stdCond2 && stdCond3;

  const showError = loanAmount !== "" && (parseFloat(loanAmount) <= 0 || isNaN(parseFloat(loanAmount)));
  const anyEligChecked = socialCond1 || socialCond2 || parentCond1 || parentCond2 || parentCond3 || parentCond4 || stdCond1 || stdCond2 || stdCond3;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=education" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["loan", "gpa", "university-admission"]}
    >
      {/* TTK növü + Müddət */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.ttkType}
          </label>
          <select
            value={ttkType}
            onChange={(e) => handleTtkType(e.target.value as TtkType)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          >
            <option value="social">{pt.social}</option>
            <option value="standard">{pt.standard}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.term}
          </label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          >
            {termOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kredit məbləği + Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.loanAmount}
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="0"
            min="0"
            className={`w-full px-4 py-3 rounded-xl border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base ${
              showError ? "border-red-500" : "border-border"
            }`}
          />
          {showError && (
            <p className="text-xs text-red-500 mt-1">{pt.loanAmountRequired}</p>
          )}
        </div>
        <div className="flex flex-col justify-center gap-3">
          {ttkType === "social" && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gpa71}
                onChange={(e) => setGpa71(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">{pt.gpa71}</span>
            </label>
          )}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gpa91}
              onChange={(e) => setGpa91(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">{pt.gpa91}</span>
          </label>
        </div>
      </div>

      {/* Nəticələr */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-8">
        <div className="divide-y divide-border">
          <div className="flex justify-between px-5 py-3">
            <span className="text-sm font-medium text-foreground">{pt.insuranceFee}</span>
            <span className="text-sm font-bold text-primary">{result ? formatMoney(result.insuranceFee) : "0,00"} AZN</span>
          </div>
          <div className="flex justify-between px-5 py-3">
            <span className="text-sm font-medium text-foreground">{pt.totalDebt}</span>
            <span className="text-sm font-bold text-primary">{result ? formatMoney(result.totalDebt) : "0,00"} AZN</span>
          </div>
          <div className="flex justify-between px-5 py-3">
            <span className="text-sm font-medium text-foreground">{pt.discount}</span>
            <span className="text-sm font-bold text-primary">{result ? formatMoney(result.discountAmount) : "0,00"} AZN</span>
          </div>
          <div className="flex justify-between px-5 py-3">
            <span className="text-sm font-semibold text-foreground">{pt.finalAmount}</span>
            <span className="text-sm font-bold text-primary">{result ? formatMoney(result.finalAmount) : "0,00"} AZN</span>
          </div>
        </div>
        <div className="border-t-2 border-border">
          <div className="flex justify-between px-5 py-4">
            <span className="text-sm font-semibold text-foreground">{pt.monthlyPayment}</span>
            <span className="text-lg font-bold text-primary">{result ? formatMoney(result.monthlyPayment) : "0,00"} AZN</span>
          </div>
        </div>
      </div>

      {/* Eligibility Checker Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowEligibility(!showEligibility)}
          className="w-full p-4 rounded-xl border border-primary bg-primary-light text-left transition-all hover:bg-blue-100 flex items-center justify-between"
        >
          <span className="text-sm font-semibold text-primary flex items-center gap-2">
            <span>&#9989;</span>
            {pt.eligibilityTitle}
          </span>
          <svg className={`w-5 h-5 text-primary transition-transform ${showEligibility ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showEligibility && (
        <div className="space-y-6 mb-8">
          {/* Sosial TTK şərtləri */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-5">
            <h4 className="font-semibold text-green-800 mb-1">{pt.socialEligTitle}</h4>
            <p className="text-xs text-green-600 mb-4">{pt.socialEligDesc}</p>
            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={socialCond1} onChange={(e) => setSocialCond1(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-green-600 focus:ring-green-500" />
                <span className="text-sm text-foreground">{pt.socialCond1}</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={socialCond2} onChange={(e) => setSocialCond2(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-green-600 focus:ring-green-500" />
                <span className="text-sm text-foreground">{pt.socialCond2}</span>
              </label>
              <div>
                <p className="text-sm text-foreground mb-2">{pt.socialCond3}</p>
                <div className="ml-6 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={parentCond1} onChange={(e) => setParentCond1(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-foreground">{pt.parentCond1}</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={parentCond2} onChange={(e) => setParentCond2(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-foreground">{pt.parentCond2}</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={parentCond3} onChange={(e) => setParentCond3(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-foreground">{pt.parentCond3}</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={parentCond4} onChange={(e) => setParentCond4(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-foreground">{pt.parentCond4}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Standart TTK şərtləri */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-blue-800 mb-1">{pt.standardEligTitle}</h4>
            <p className="text-xs text-blue-600 mb-4">{pt.standardEligDesc}</p>
            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={stdCond1} onChange={(e) => setStdCond1(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-foreground">{pt.standardCond1}</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={stdCond2} onChange={(e) => setStdCond2(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-foreground">{pt.standardCond2}</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={stdCond3} onChange={(e) => setStdCond3(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-foreground">{pt.standardCond3}</span>
              </label>
            </div>
          </div>

          {/* Nəticə */}
          {anyEligChecked && (
            <div className={`rounded-xl border p-5 ${
              socialEligible && standardEligible
                ? "bg-green-50 border-green-300"
                : socialEligible
                ? "bg-green-50 border-green-300"
                : standardEligible
                ? "bg-blue-50 border-blue-300"
                : "bg-red-50 border-red-300"
            }`}>
              {socialEligible && standardEligible ? (
                <p className="text-sm font-semibold text-green-800">{pt.resultBoth}</p>
              ) : socialEligible ? (
                <>
                  <p className="text-sm font-semibold text-green-800">{pt.resultSocial}</p>
                  <p className="text-xs text-green-600 mt-1">{pt.resultSocialNote}</p>
                </>
              ) : standardEligible ? (
                <>
                  <p className="text-sm font-semibold text-blue-800">{pt.resultStandard}</p>
                  <p className="text-xs text-blue-600 mt-1">{pt.resultStandardNote}</p>
                </>
              ) : (
                <p className="text-sm font-semibold text-red-700">{pt.resultNone}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Əlavə məlumatlar */}
      <div className="space-y-4">
        {/* Güzəştlər */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h4 className="font-semibold text-foreground mb-3">{pt.discountsTitle}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700">{pt.socialDiscount1}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700">{pt.socialDiscount2}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-700">{pt.standardDiscount1}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-700">{pt.standardDiscount2}</p>
            </div>
          </div>
        </div>

        {/* Minimum bal + Təhsil haqqı */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h4 className="font-semibold text-foreground mb-3">{pt.minScoreTitle}</h4>
          <div className="space-y-1.5">
            <p className="text-sm text-muted">{pt.minScoreBachelor}</p>
            <p className="text-sm text-muted">{pt.minScoreMaster}</p>
            <p className="text-sm text-muted">{pt.minScoreVocational}</p>
          </div>
          <p className="text-xs text-muted mt-3 border-t border-border pt-3">{pt.tuitionRange}</p>
        </div>

        {/* Möhlət + Sığorta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-3">{pt.defermentTitle}</h4>
            <ul className="space-y-1.5">
              <li className="text-xs text-muted flex items-start gap-1.5"><span className="text-muted mt-0.5">&#8226;</span>{pt.deferment1}</li>
              <li className="text-xs text-muted flex items-start gap-1.5"><span className="text-muted mt-0.5">&#8226;</span>{pt.deferment2}</li>
              <li className="text-xs text-muted flex items-start gap-1.5"><span className="text-muted mt-0.5">&#8226;</span>{pt.deferment3}</li>
              <li className="text-xs text-muted flex items-start gap-1.5"><span className="text-muted mt-0.5">&#8226;</span>{pt.deferment4}</li>
              <li className="text-xs text-muted flex items-start gap-1.5"><span className="text-muted mt-0.5">&#8226;</span>{pt.deferment5}</li>
            </ul>
            <p className="text-[11px] text-muted mt-2 italic">{pt.defermentNote}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-3">{pt.insuredTitle}</h4>
            <ul className="space-y-1.5">
              <li className="text-xs text-muted flex items-start gap-1.5"><span className="text-muted mt-0.5">&#8226;</span>{pt.insured1}</li>
              <li className="text-xs text-muted flex items-start gap-1.5"><span className="text-muted mt-0.5">&#8226;</span>{pt.insured2}</li>
            </ul>
            <p className="text-[11px] text-muted mt-2 italic">{pt.insuredNote}</p>
          </div>
        </div>

        {/* Source */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-600">{pt.source}</p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
