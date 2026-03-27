"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

type Currency = "AZN" | "USD";
type PayoutType = "end" | "monthly";

interface MonthRow {
  month: number;
  interest: number;
  taxExempt: number;
  taxableAmount: number;
  tax: number;
  netInterest: number;
  payout: number;
  balance: number;
}

const TAX_RATE = 0.10;
const MONTHLY_EXEMPTION = 200;

function formatMoney(n: number, currency: Currency): string {
  const formatted = n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} ${currency}`;
}

const pageTranslations = {
  az: {
    title: "Depozit hesablayıcısı",
    description: "Depozit gəlirinizi və vergi tutulmalarını hesablayın — V.M. 102.1.22 güzəştləri ilə.",
    breadcrumbCategory: "Maliyyə",
    formulaTitle: "Depozit vergisi necə hesablanır? (V.M. 102.1.22)",
    formulaContent: `Aylıq faiz ödənişi (sadə faiz):
Aylıq gəlir = Məbləğ × (İllik faiz ÷ 12 ÷ 100)

Müddət sonunda (mürəkkəb faiz):
Yekun məbləğ = Məbləğ × (1 + aylıq faiz)ⁿ

V.M. 102.1.22-3 (200₼ Güzəşti):
• AZN depozitlər üzrə aylıq faiz gəlirinin 200₼-dək hissəsi vergidən azaddır
• Vergi (10%) yalnız 200₼-i keçən hissədən tutulur
• Hər bir bankda ayrıca tətbiq olunur

V.M. 102.1.22-4 (18 Ay Qaydası):
• AZN depozit, müddəti ≥18 ay, vaxtından əvvəl çıxarılmırsa
• Bütün faiz gəlirləri 100% vergidən azaddır (3 il müddətinə)
• Vaxtından əvvəl çıxarılsa, 200₼ güzəşt qaydası tətbiq olunur

Xarici valyuta (USD/EUR):
• Heç bir güzəşt yoxdur
• Bütün faiz gəlirindən 10% ÖMV tutulur

Depozit sığortası:
• Fiziki şəxslər üçün 100.000 AZN-dək sığortalanır`,
    manat: "Manat (AZN)",
    dollar: "Dollar (USD)",
    depositAmount: "Depozit məbləği",
    annualRate: "İllik faiz dərəcəsi (%)",
    termMonths: "Müddət (ay)",
    monthShort: "ay",
    interestPayoutMethod: "Faiz ödəniş üsulu",
    monthlyPayout: "Aylıq ödəniş",
    monthlyPayoutDesc: "Faiz hər ay hesabınıza köçürülür (sadə faiz)",
    endPayout: "Müddətin sonunda",
    endPayoutDesc: "Faiz depozitə əlavə olunur (mürəkkəb faiz)",
    earlyWithdrawal: "Depoziti 18 aydan əvvəl çıxaracağam",
    earlyWithdrawalDesc: "İşarələsəniz, 100% vergisiz güzəşt əvəzinə 200₼ aylıq güzəşt tətbiq olunacaq",
    foreignCurrencyWarning: "Xarici valyuta depozitlərində heç bir güzəşt yoxdur — bütün faiz gəlirindən",
    foreignCurrencyTax: "10% ÖMV",
    foreignCurrencyTaxSuffix: "tutulur.",
    rule18MonthPrefix: "V.M. 102.1.22-4:",
    rule18MonthText: "AZN depozit, müddəti {m} ay (≥18 ay), vaxtında çıxarılacaq — bütün faiz gəlirləri",
    rule18MonthBold: "100% vergidən azaddır",
    rule200Prefix: "V.M. 102.1.22-3:",
    rule200Text: "Aylıq faiz gəlirinin",
    rule200Bold: "200₼-dək",
    rule200Suffix: "hissəsi vergidən azaddır. 200₼-dən artıq hissədən",
    rule200Tax: "10% ÖMV",
    rule200TaxSuffix: "tutulur.",
    totalInterestIncome: "Ümumi faiz gəliri",
    tax10: "Vergi (10% ÖMV)",
    taxLabel: "Vergi",
    taxFree100: "100% vergidən azad",
    netInterestIncome: "Xalis faiz gəliri",
    finalAmount: "Yekun məbləğ",
    depositAmountLabel: "Depozit məbləği",
    calculationDetails: "Hesablama detalları",
    annualRateLabel: "İllik faiz dərəcəsi",
    termLabel: "Müddət",
    taxRuleLabel: "Vergi qaydası",
    taxRuleNoExemption: "Güzəşt yoxdur — 10% ÖMV",
    taxRule18Month: "V.M. 102.1.22-4 — 100% vergidən azad",
    taxRule200: "V.M. 102.1.22-3 — aylıq 200₼ güzəşt",
    totalInterest: "Ümumi faiz gəliri",
    taxExemptPortion: "Vergidən azad hissə",
    taxDeduction: "Vergi tutulması (10%)",
    netInterestReceived: "Xalis faiz gəliri (əlinizə çatan)",
    monthlyTable: "Aylıq cədvəl",
    monthCol: "Ay",
    interestCol: "Faiz",
    exemptionCol: "Güzəşt",
    taxCol: "Vergi",
    netCol: "Xalis",
    balanceCol: "Balans",
    collapse: "Yığ",
    showAll: "Bütün {count} ayı göstər",
    taxRulesTitle: "Depozit vergisi qaydaları (Vergi Məcəlləsi)",
    rule200Title: "V.M. 102.1.22-3 — Aylıq 200₼ güzəşt",
    rule200Desc: "Yerli bank və xarici bankın AR-dakı filialı tərəfindən fiziki şəxslərin hər bir bankda milli valyutada olan depozitlər üzrə hesablanan aylıq faiz gəlirlərinin 200₼-dək hissəsi gəlir vergisindən azaddır. Müddət tələbi yoxdur.",
    rule18Title: "V.M. 102.1.22-4 — 18 ay qaydası",
    rule18Desc: "Milli valyutada olan depozit 18 ay və daha artıq müddətə yerləşdirildikdə və məbləğ 18 aydan tez olmadan ödənildikdə, hesablanmış faiz gəlirlərinin tam hissəsi 3 il müddətinə vergidən azaddır (2024-cü ildən). Vaxtından əvvəl çıxarılsa, 200₼ güzəşt qaydası tətbiq olunur.",
    foreignCurrencyTitle: "Xarici valyuta (USD/EUR)",
    foreignCurrencyDesc: "Heç bir güzəşt yoxdur — bütün faiz gəlirindən 10% vergi tutulur. 18 ay qaydası yalnız milli valyutaya şamil edilir.",
    perBankTitle: "Hər bir bank ayrıca",
    perBankDesc: "Güzəşt hər bir bankda ayrı-ayrılıqda tətbiq olunur. 5 bankda əmanətiniz varsa, hər birində 200₼ güzəşt ayrıca hesablanır.",
    practicalExamples: "Praktiki misallar",
    example1Title: "Misal 1: 12 aylıq AZN depozit",
    example1Desc: "30.000₼ məbləğ, illik 10%, 12 ay müddətinə",
    example1Line1: "Ümumi faiz: 30.000 × 10% =",
    example1Line1Val: "3.000₼",
    example1Line2: "İllik güzəşt: 200 × 12 =",
    example1Line2Val: "2.400₼",
    example1Line3: "Vergiyə cəlb olunan: 3.000 − 2.400 =",
    example1Line3Val: "600₼",
    example1Line4: "Vergi (10%): 600 × 10% =",
    example1Line4Val: "60₼",
    example2Title: "Misal 2: Aylıq ödənişli depozit",
    example2Desc: "180.000₼ məbləğ, illik 8%, aylıq ödəniş",
    example2Line1: "Aylıq faiz: 180.000 × 8% ÷ 12 =",
    example2Line1Val: "1.200₼",
    example2Line2: "Aylıq vergi: (1.200 − 200) × 10% =",
    example2Line2Val: "100₼",
    example2Line3: "Aylıq əlinizə çatan: 1.200 − 100 =",
    example2Line3Val: "1.100₼",
    example3Title: "Misal 3: 24 aylıq AZN depozit (vergisiz)",
    example3Desc: "30.000₼ məbləğ, illik 10%, 24 ay, vaxtında çıxarılır",
    example3Line1: "Müddət ≥18 ay və vaxtından əvvəl çıxarılmır →",
    example3Line1Val: "100% vergidən azad",
    example3Line2: "Aylıq 1.200₼ faizin hamısını alacaqsınız, heç bir vergi tutulmayacaq.",
    example4Title: "Misal 4: 24 aylıq depozit, 12 aydan sonra çıxarılır",
    example4Desc: "30.000₼ məbləğ, illik 10%, 24 aylıq müqavilə, amma 12 ayda çıxarılır",
    example4Line1: "Müddət 24 ay (≥18) olsa da, 18 aydan",
    example4Line1Bold: "tez çıxarıldığı üçün",
    example4Line2: "V.M. 102.1.22-4 tətbiq olunmur.",
    example4Line3: "V.M. 102.1.22-3 tətbiq olunur: aylıq 200₼ güzəşt.",
    example5Title: "Misal 5: USD depozit",
    example5Desc: "50.000 USD, 24 ay müddətinə",
    example5Line1: "Xarici valyutada olduğu üçün",
    example5Line1Bold: "heç bir güzəşt yoxdur",
    example5Line2: "18 ay qaydası yalnız milli valyutaya şamil olunur. Bütün faiz gəlirindən 10% vergi tutulur.",
    faqTitle: "Tez-tez verilən suallar",
    faq1Q: "5 bankda əmanətim var, hər biri ≥18 ay. Hamısı vergidən azaddır?",
    faq1A: "Bəli. Güzəşt hər bir bankda ayrıca tətbiq olunur.",
    faq2Q: "12 aylıq əmanətdən 1.000₼ gəlir əldə edirəm. Hamısı vergiyə cəlb olunur?",
    faq2A: "Xeyr. 1.000₼-dan 200₼ güzəşt çıxılır, 800₼ vergiyə cəlb olunur. Vergi: 800 × 10% = 80₼.",
    faq3Q: "24 aylıq USD əmanət vergidən azad olur?",
    faq3A: "Xeyr. 18 ay qaydası yalnız milli valyutaya (AZN) şamil edilir. USD-dən 10% vergi tutulur.",
    faq4Q: "Vergidən azadolma müddəti nə qədərdir?",
    faq4A: "2024-cü ilin yanvarından etibarən 3 il müddətinə (V.M. 102.1.22-4). V.M. 123-cü maddəsinə əsasən faiz gəlirləri kapital gəlirləri olub, 10% dərəcə ilə ödəmə mənbəyində tutulur.",
    depositInsurance: "Depozit sığortası",
    depositInsuranceTextAZN: "Azərbaycan Depozit Sığorta Fondu fiziki şəxslərin bank depozitlərini 100.000 AZN-dək sığortalayır.",
    depositInsuranceTextUSD: "Azərbaycan Depozit Sığorta Fondu fiziki şəxslərin bank depozitlərini ekvivalent məbləğdə-dək sığortalayır.",
    emptyStateText: "Nəticəni görmək üçün məbləğ, faiz və müddət daxil edin.",
  },
  en: {
    title: "Deposit Calculator",
    description: "Calculate your deposit income and tax deductions — with Tax Code 102.1.22 exemptions.",
    breadcrumbCategory: "Finance",
    formulaTitle: "How is deposit tax calculated? (TC 102.1.22)",
    formulaContent: `Monthly interest payment (simple interest):
Monthly income = Amount × (Annual rate ÷ 12 ÷ 100)

At maturity (compound interest):
Final amount = Amount × (1 + monthly rate)ⁿ

TC 102.1.22-3 (200 AZN Exemption):
• Monthly interest income up to 200 AZN on AZN deposits is tax-exempt
• Tax (10%) only applies to the portion exceeding 200 AZN
• Applied separately at each bank

TC 102.1.22-4 (18-Month Rule):
• AZN deposit, term ≥18 months, not withdrawn early
• All interest income is 100% tax-exempt (for 3 years)
• If withdrawn early, the 200 AZN exemption rule applies

Foreign currency (USD/EUR):
• No exemptions
• 10% withholding tax on all interest income

Deposit insurance:
• Insured up to 100,000 AZN for individuals`,
    manat: "Manat (AZN)",
    dollar: "Dollar (USD)",
    depositAmount: "Deposit amount",
    annualRate: "Annual interest rate (%)",
    termMonths: "Term (months)",
    monthShort: "mo",
    interestPayoutMethod: "Interest payout method",
    monthlyPayout: "Monthly payout",
    monthlyPayoutDesc: "Interest transferred to your account monthly (simple interest)",
    endPayout: "At maturity",
    endPayoutDesc: "Interest added to deposit (compound interest)",
    earlyWithdrawal: "I will withdraw before 18 months",
    earlyWithdrawalDesc: "If checked, the 200 AZN monthly exemption applies instead of 100% tax-free",
    foreignCurrencyWarning: "No exemptions for foreign currency deposits — all interest income is subject to",
    foreignCurrencyTax: "10% withholding tax",
    foreignCurrencyTaxSuffix: ".",
    rule18MonthPrefix: "TC 102.1.22-4:",
    rule18MonthText: "AZN deposit, term {m} months (≥18 months), timely withdrawal — all interest income is",
    rule18MonthBold: "100% tax-exempt",
    rule200Prefix: "TC 102.1.22-3:",
    rule200Text: "Monthly interest income up to",
    rule200Bold: "200 AZN",
    rule200Suffix: "is tax-exempt. The portion exceeding 200 AZN is subject to",
    rule200Tax: "10% withholding tax",
    rule200TaxSuffix: ".",
    totalInterestIncome: "Total interest income",
    tax10: "Tax (10%)",
    taxLabel: "Tax",
    taxFree100: "100% tax-exempt",
    netInterestIncome: "Net interest income",
    finalAmount: "Final amount",
    depositAmountLabel: "Deposit amount",
    calculationDetails: "Calculation details",
    annualRateLabel: "Annual interest rate",
    termLabel: "Term",
    taxRuleLabel: "Tax rule",
    taxRuleNoExemption: "No exemption — 10% withholding tax",
    taxRule18Month: "TC 102.1.22-4 — 100% tax-exempt",
    taxRule200: "TC 102.1.22-3 — monthly 200 AZN exemption",
    totalInterest: "Total interest income",
    taxExemptPortion: "Tax-exempt portion",
    taxDeduction: "Tax deduction (10%)",
    netInterestReceived: "Net interest income (received)",
    monthlyTable: "Monthly table",
    monthCol: "Month",
    interestCol: "Interest",
    exemptionCol: "Exemption",
    taxCol: "Tax",
    netCol: "Net",
    balanceCol: "Balance",
    collapse: "Collapse",
    showAll: "Show all {count} months",
    taxRulesTitle: "Deposit tax rules (Tax Code)",
    rule200Title: "TC 102.1.22-3 — Monthly 200 AZN exemption",
    rule200Desc: "Monthly interest income up to 200 AZN on deposits in national currency at local banks and branches of foreign banks in Azerbaijan is exempt from income tax. No term requirement.",
    rule18Title: "TC 102.1.22-4 — 18-month rule",
    rule18Desc: "When a deposit in national currency is placed for 18 months or more and the amount is not paid before 18 months, the full interest income is tax-exempt for 3 years (from 2024). If withdrawn early, the 200 AZN exemption rule applies.",
    foreignCurrencyTitle: "Foreign currency (USD/EUR)",
    foreignCurrencyDesc: "No exemptions — 10% tax is charged on all interest income. The 18-month rule applies only to national currency.",
    perBankTitle: "Each bank separately",
    perBankDesc: "The exemption applies separately at each bank. If you have deposits at 5 banks, the 200 AZN exemption is calculated separately at each.",
    practicalExamples: "Practical examples",
    example1Title: "Example 1: 12-month AZN deposit",
    example1Desc: "30,000 AZN amount, 10% annual, 12-month term",
    example1Line1: "Total interest: 30,000 × 10% =",
    example1Line1Val: "3,000 AZN",
    example1Line2: "Annual exemption: 200 × 12 =",
    example1Line2Val: "2,400 AZN",
    example1Line3: "Taxable: 3,000 − 2,400 =",
    example1Line3Val: "600 AZN",
    example1Line4: "Tax (10%): 600 × 10% =",
    example1Line4Val: "60 AZN",
    example2Title: "Example 2: Monthly payout deposit",
    example2Desc: "180,000 AZN amount, 8% annual, monthly payout",
    example2Line1: "Monthly interest: 180,000 × 8% ÷ 12 =",
    example2Line1Val: "1,200 AZN",
    example2Line2: "Monthly tax: (1,200 − 200) × 10% =",
    example2Line2Val: "100 AZN",
    example2Line3: "Monthly received: 1,200 − 100 =",
    example2Line3Val: "1,100 AZN",
    example3Title: "Example 3: 24-month AZN deposit (tax-free)",
    example3Desc: "30,000 AZN amount, 10% annual, 24 months, timely withdrawal",
    example3Line1: "Term ≥18 months and not withdrawn early →",
    example3Line1Val: "100% tax-exempt",
    example3Line2: "You will receive the full 1,200 AZN monthly interest, no tax deducted.",
    example4Title: "Example 4: 24-month deposit, withdrawn after 12 months",
    example4Desc: "30,000 AZN, 10% annual, 24-month contract, withdrawn at 12 months",
    example4Line1: "Although the term is 24 months (≥18), because it was",
    example4Line1Bold: "withdrawn early",
    example4Line2: "TC 102.1.22-4 does not apply.",
    example4Line3: "TC 102.1.22-3 applies: monthly 200 AZN exemption.",
    example5Title: "Example 5: USD deposit",
    example5Desc: "50,000 USD, 24-month term",
    example5Line1: "Because it is in foreign currency,",
    example5Line1Bold: "no exemptions apply",
    example5Line2: "The 18-month rule applies only to national currency. 10% tax is charged on all interest income.",
    faqTitle: "Frequently asked questions",
    faq1Q: "I have deposits at 5 banks, each ≥18 months. Are they all tax-exempt?",
    faq1A: "Yes. The exemption applies separately at each bank.",
    faq2Q: "I earn 1,000 AZN from a 12-month deposit. Is all of it taxed?",
    faq2A: "No. 200 AZN exemption is deducted from 1,000 AZN, 800 AZN is taxable. Tax: 800 × 10% = 80 AZN.",
    faq3Q: "Is a 24-month USD deposit tax-exempt?",
    faq3A: "No. The 18-month rule applies only to national currency (AZN). 10% tax is charged on USD.",
    faq4Q: "How long does the tax exemption last?",
    faq4A: "For 3 years from January 2024 (TC 102.1.22-4). Per TC Article 123, interest income is capital income, subject to 10% withholding at source.",
    depositInsurance: "Deposit insurance",
    depositInsuranceTextAZN: "The Azerbaijan Deposit Insurance Fund insures individual bank deposits up to 100,000 AZN.",
    depositInsuranceTextUSD: "The Azerbaijan Deposit Insurance Fund insures individual bank deposits up to the equivalent amount.",
    emptyStateText: "Enter amount, rate and term to see the result.",
  },
  ru: {
    title: "Калькулятор депозитов",
    description: "Рассчитайте доход по депозиту и налоговые удержания — с учётом льгот НК 102.1.22.",
    breadcrumbCategory: "Финансы",
    formulaTitle: "Как рассчитывается налог на депозит? (НК 102.1.22)",
    formulaContent: `Ежемесячная процентная выплата (простой процент):
Ежемесячный доход = Сумма × (Годовая ставка ÷ 12 ÷ 100)

По истечении срока (сложный процент):
Итоговая сумма = Сумма × (1 + месячная ставка)ⁿ

НК 102.1.22-3 (Льгота 200 AZN):
• Ежемесячный процентный доход до 200 AZN по депозитам в AZN освобождён от налога
• Налог (10%) взимается только с суммы, превышающей 200 AZN
• Применяется отдельно в каждом банке

НК 102.1.22-4 (Правило 18 месяцев):
• Депозит в AZN, срок ≥18 мес., не снимается досрочно
• Весь процентный доход 100% освобождён от налога (на 3 года)
• При досрочном снятии применяется льгота 200 AZN

Иностранная валюта (USD/EUR):
• Льготы отсутствуют
• 10% налог на весь процентный доход

Страхование депозитов:
• Застраховано до 100 000 AZN для физических лиц`,
    manat: "Манат (AZN)",
    dollar: "Доллар (USD)",
    depositAmount: "Сумма депозита",
    annualRate: "Годовая процентная ставка (%)",
    termMonths: "Срок (месяцев)",
    monthShort: "мес",
    interestPayoutMethod: "Способ выплаты процентов",
    monthlyPayout: "Ежемесячная выплата",
    monthlyPayoutDesc: "Проценты перечисляются ежемесячно (простой процент)",
    endPayout: "По истечении срока",
    endPayoutDesc: "Проценты добавляются к депозиту (сложный процент)",
    earlyWithdrawal: "Сниму депозит до 18 месяцев",
    earlyWithdrawalDesc: "Если отмечено, вместо 100% освобождения применяется льгота 200 AZN в месяц",
    foreignCurrencyWarning: "Для депозитов в иностранной валюте льготы отсутствуют — со всего процентного дохода удерживается",
    foreignCurrencyTax: "10% налог",
    foreignCurrencyTaxSuffix: ".",
    rule18MonthPrefix: "НК 102.1.22-4:",
    rule18MonthText: "Депозит в AZN, срок {m} мес. (≥18 мес.), снятие в срок — весь процентный доход",
    rule18MonthBold: "100% освобождён от налога",
    rule200Prefix: "НК 102.1.22-3:",
    rule200Text: "Ежемесячный процентный доход до",
    rule200Bold: "200 AZN",
    rule200Suffix: "освобождён от налога. С суммы свыше 200 AZN удерживается",
    rule200Tax: "10% налог",
    rule200TaxSuffix: ".",
    totalInterestIncome: "Общий процентный доход",
    tax10: "Налог (10%)",
    taxLabel: "Налог",
    taxFree100: "100% без налога",
    netInterestIncome: "Чистый процентный доход",
    finalAmount: "Итоговая сумма",
    depositAmountLabel: "Сумма депозита",
    calculationDetails: "Детали расчёта",
    annualRateLabel: "Годовая процентная ставка",
    termLabel: "Срок",
    taxRuleLabel: "Налоговое правило",
    taxRuleNoExemption: "Без льготы — 10% налог",
    taxRule18Month: "НК 102.1.22-4 — 100% без налога",
    taxRule200: "НК 102.1.22-3 — ежемесячная льгота 200 AZN",
    totalInterest: "Общий процентный доход",
    taxExemptPortion: "Необлагаемая часть",
    taxDeduction: "Налоговое удержание (10%)",
    netInterestReceived: "Чистый процентный доход (на руки)",
    monthlyTable: "Ежемесячная таблица",
    monthCol: "Месяц",
    interestCol: "Проценты",
    exemptionCol: "Льгота",
    taxCol: "Налог",
    netCol: "Чистый",
    balanceCol: "Баланс",
    collapse: "Свернуть",
    showAll: "Показать все {count} месяцев",
    taxRulesTitle: "Правила налогообложения депозитов (Налоговый кодекс)",
    rule200Title: "НК 102.1.22-3 — Ежемесячная льгота 200 AZN",
    rule200Desc: "Ежемесячный процентный доход до 200 AZN по депозитам в национальной валюте в местных банках и филиалах иностранных банков освобождён от подоходного налога. Требование по сроку отсутствует.",
    rule18Title: "НК 102.1.22-4 — Правило 18 месяцев",
    rule18Desc: "При размещении депозита в национальной валюте на 18 месяцев и более без досрочного снятия, весь процентный доход освобождён от налога на 3 года (с 2024 г.). При досрочном снятии применяется правило льготы 200 AZN.",
    foreignCurrencyTitle: "Иностранная валюта (USD/EUR)",
    foreignCurrencyDesc: "Льготы отсутствуют — 10% налог на весь процентный доход. Правило 18 месяцев применяется только к национальной валюте.",
    perBankTitle: "Каждый банк отдельно",
    perBankDesc: "Льгота применяется отдельно в каждом банке. Если у вас депозиты в 5 банках, льгота 200 AZN рассчитывается отдельно в каждом.",
    practicalExamples: "Практические примеры",
    example1Title: "Пример 1: 12-месячный депозит в AZN",
    example1Desc: "30 000 AZN, 10% годовых, срок 12 месяцев",
    example1Line1: "Общие проценты: 30 000 × 10% =",
    example1Line1Val: "3 000 AZN",
    example1Line2: "Годовая льгота: 200 × 12 =",
    example1Line2Val: "2 400 AZN",
    example1Line3: "Облагаемая сумма: 3 000 − 2 400 =",
    example1Line3Val: "600 AZN",
    example1Line4: "Налог (10%): 600 × 10% =",
    example1Line4Val: "60 AZN",
    example2Title: "Пример 2: Депозит с ежемесячной выплатой",
    example2Desc: "180 000 AZN, 8% годовых, ежемесячная выплата",
    example2Line1: "Ежемесячные проценты: 180 000 × 8% ÷ 12 =",
    example2Line1Val: "1 200 AZN",
    example2Line2: "Ежемесячный налог: (1 200 − 200) × 10% =",
    example2Line2Val: "100 AZN",
    example2Line3: "Ежемесячно на руки: 1 200 − 100 =",
    example2Line3Val: "1 100 AZN",
    example3Title: "Пример 3: 24-месячный депозит в AZN (без налога)",
    example3Desc: "30 000 AZN, 10% годовых, 24 месяца, снятие в срок",
    example3Line1: "Срок ≥18 мес. и без досрочного снятия →",
    example3Line1Val: "100% без налога",
    example3Line2: "Вы получите все 1 200 AZN ежемесячных процентов, налог не удерживается.",
    example4Title: "Пример 4: 24-месячный депозит, снят через 12 месяцев",
    example4Desc: "30 000 AZN, 10% годовых, договор на 24 мес., снят на 12 мес.",
    example4Line1: "Хотя срок 24 мес. (≥18), из-за",
    example4Line1Bold: "досрочного снятия",
    example4Line2: "НК 102.1.22-4 не применяется.",
    example4Line3: "Применяется НК 102.1.22-3: ежемесячная льгота 200 AZN.",
    example5Title: "Пример 5: Депозит в USD",
    example5Desc: "50 000 USD, срок 24 месяца",
    example5Line1: "Поскольку это иностранная валюта,",
    example5Line1Bold: "льготы не применяются",
    example5Line2: "Правило 18 месяцев действует только для национальной валюты. 10% налог на весь процентный доход.",
    faqTitle: "Часто задаваемые вопросы",
    faq1Q: "У меня депозиты в 5 банках, каждый ≥18 мес. Все освобождены от налога?",
    faq1A: "Да. Льгота применяется отдельно в каждом банке.",
    faq2Q: "Я получаю 1 000 AZN дохода от 12-месячного депозита. Всё облагается налогом?",
    faq2A: "Нет. Из 1 000 AZN вычитается льгота 200 AZN, 800 AZN облагается. Налог: 800 × 10% = 80 AZN.",
    faq3Q: "24-месячный депозит в USD освобождён от налога?",
    faq3A: "Нет. Правило 18 месяцев применяется только к национальной валюте (AZN). С USD удерживается 10% налог.",
    faq4Q: "На какой срок действует освобождение от налога?",
    faq4A: "На 3 года с января 2024 (НК 102.1.22-4). Согласно ст. 123 НК, процентные доходы являются доходами от капитала и облагаются 10% у источника выплаты.",
    depositInsurance: "Страхование депозитов",
    depositInsuranceTextAZN: "Азербайджанский фонд страхования вкладов страхует банковские депозиты физических лиц до 100 000 AZN.",
    depositInsuranceTextUSD: "Азербайджанский фонд страхования вкладов страхует банковские депозиты физических лиц до эквивалентной суммы.",
    emptyStateText: "Введите сумму, ставку и срок для расчёта.",
  },
};

export default function DepositCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");
  const [currency, setCurrency] = useState<Currency>("AZN");
  const [payoutType, setPayoutType] = useState<PayoutType>("end");
  const [earlyWithdrawal, setEarlyWithdrawal] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);

  const m = parseInt(months) || 0;
  const is18MonthRule = currency === "AZN" && m >= 18 && !earlyWithdrawal;

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);

    if (!a || a <= 0 || !r || r <= 0 || !m || m <= 0) return null;

    const monthlyRate = r / 100 / 12;
    const table: MonthRow[] = [];
    let totalInterest = 0;
    let totalTax = 0;
    let totalNetInterest = 0;
    let totalExempt = 0;

    if (payoutType === "end") {
      let balance = a;

      for (let i = 1; i <= m; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;

        let taxExempt: number;
        let taxableAmount: number;
        let tax: number;

        if (currency === "USD") {
          taxExempt = 0;
          taxableAmount = interest;
          tax = interest * TAX_RATE;
        } else if (is18MonthRule) {
          taxExempt = interest;
          taxableAmount = 0;
          tax = 0;
        } else {
          taxExempt = Math.min(interest, MONTHLY_EXEMPTION);
          taxableAmount = Math.max(0, interest - MONTHLY_EXEMPTION);
          tax = taxableAmount * TAX_RATE;
        }

        const netInterest = interest - tax;
        totalTax += tax;
        totalNetInterest += netInterest;
        totalExempt += taxExempt;

        balance += interest;
        table.push({
          month: i,
          interest,
          taxExempt,
          taxableAmount,
          tax,
          netInterest,
          payout: 0,
          balance,
        });
      }

      return {
        totalInterest,
        totalTax,
        totalNetInterest,
        totalExempt,
        finalAmount: a + totalInterest,
        finalAmountAfterTax: a + totalNetInterest,
        monthlyInterest: 0,
        table,
      };
    } else {
      const monthlyInterest = a * monthlyRate;

      for (let i = 1; i <= m; i++) {
        totalInterest += monthlyInterest;

        let taxExempt: number;
        let taxableAmount: number;
        let tax: number;

        if (currency === "USD") {
          taxExempt = 0;
          taxableAmount = monthlyInterest;
          tax = monthlyInterest * TAX_RATE;
        } else if (is18MonthRule) {
          taxExempt = monthlyInterest;
          taxableAmount = 0;
          tax = 0;
        } else {
          taxExempt = Math.min(monthlyInterest, MONTHLY_EXEMPTION);
          taxableAmount = Math.max(0, monthlyInterest - MONTHLY_EXEMPTION);
          tax = taxableAmount * TAX_RATE;
        }

        const netInterest = monthlyInterest - tax;
        totalTax += tax;
        totalNetInterest += netInterest;
        totalExempt += taxExempt;

        table.push({
          month: i,
          interest: monthlyInterest,
          taxExempt,
          taxableAmount,
          tax,
          netInterest,
          payout: netInterest,
          balance: a,
        });
      }

      return {
        totalInterest,
        totalTax,
        totalNetInterest,
        totalExempt,
        finalAmount: a,
        finalAmountAfterTax: a,
        monthlyInterest,
        table,
      };
    }
  }, [amount, rate, months, payoutType, currency, is18MonthRule, m]);

  const visibleRows = result
    ? showFullTable
      ? result.table
      : result.table.slice(0, 12)
    : [];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=finance" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["loan", "currency", "salary", "dividend-tax"]}
    >
      {/* Currency toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setCurrency("AZN")}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currency === "AZN"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.manat}
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currency === "USD"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.dollar}
        </button>
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.depositAmount} ({currency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.annualRate}
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder={currency === "AZN" ? "10" : "3"}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.termMonths}
          </label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            placeholder="12"
            min="1"
            max="120"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <div className="flex gap-2 mt-2">
            {[6, 12, 18, 24, 36].map((v) => (
              <button
                key={v}
                onClick={() => setMonths(String(v))}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  months === String(v)
                    ? "border-primary bg-primary-light text-primary font-medium"
                    : "border-border bg-white text-muted hover:border-primary/30"
                }`}
              >
                {v} {pt.monthShort}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interest payout method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          {pt.interestPayoutMethod}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setPayoutType("monthly")}
            className={`p-4 rounded-xl border text-left transition-all ${
              payoutType === "monthly"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.monthlyPayout}</p>
            <p className="text-xs text-muted mt-1">{pt.monthlyPayoutDesc}</p>
          </button>
          <button
            onClick={() => setPayoutType("end")}
            className={`p-4 rounded-xl border text-left transition-all ${
              payoutType === "end"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">{pt.endPayout}</p>
            <p className="text-xs text-muted mt-1">{pt.endPayoutDesc}</p>
          </button>
        </div>
      </div>

      {/* 18-month early withdrawal checkbox */}
      {currency === "AZN" && m >= 18 && (
        <div className="mb-6">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-primary/30 transition-all">
            <input
              type="checkbox"
              checked={earlyWithdrawal}
              onChange={(e) => setEarlyWithdrawal(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{pt.earlyWithdrawal}</p>
              <p className="text-[11px] text-muted">{pt.earlyWithdrawalDesc}</p>
            </div>
          </label>
        </div>
      )}

      {/* Tax rule info */}
      <div className={`mb-8 rounded-xl border p-4 ${
        currency === "USD"
          ? "bg-red-50 border-red-200"
          : is18MonthRule
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
      }`}>
        {currency === "USD" ? (
          <p className="text-sm text-red-800">
            {pt.foreignCurrencyWarning} <span className="font-semibold">{pt.foreignCurrencyTax}</span> {pt.foreignCurrencyTaxSuffix}
          </p>
        ) : is18MonthRule ? (
          <p className="text-sm text-green-800">
            <span className="font-semibold">{pt.rule18MonthPrefix}</span> {pt.rule18MonthText.replace("{m}", String(m))} <span className="font-semibold">{pt.rule18MonthBold}</span>.
          </p>
        ) : (
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{pt.rule200Prefix}</span> {pt.rule200Text} <span className="font-semibold">{pt.rule200Bold}</span> {pt.rule200Suffix} <span className="font-semibold">{pt.rule200Tax}</span> {pt.rule200TaxSuffix}
          </p>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-green-100 mb-1">{pt.totalInterestIncome}</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalInterest, currency)}</p>
            </div>

            {result.totalTax > 0 ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-center">
                <p className="text-sm text-red-600 mb-1">{pt.tax10}</p>
                <p className="text-2xl font-bold text-red-700">-{formatMoney(result.totalTax, currency)}</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
                <p className="text-sm text-green-600 mb-1">{pt.taxLabel}</p>
                <p className="text-2xl font-bold text-green-700">0,00 {currency}</p>
                <p className="text-xs text-green-600 mt-0.5">{pt.taxFree100}</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.netInterestIncome}</p>
              <p className="text-2xl font-bold">{formatMoney(result.totalNetInterest, currency)}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-5 text-center">
              <p className="text-sm text-muted mb-1">
                {payoutType === "end" ? pt.finalAmount : pt.depositAmountLabel}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(payoutType === "end" ? result.finalAmountAfterTax : parseFloat(amount), currency)}
              </p>
            </div>
          </div>

          {/* Calculation details */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.calculationDetails}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.depositAmountLabel}</span>
                <span className="text-sm font-medium text-foreground">{formatMoney(parseFloat(amount), currency)}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.annualRateLabel}</span>
                <span className="text-sm font-medium text-foreground">{rate}%</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.termLabel}</span>
                <span className="text-sm font-medium text-foreground">{months} {pt.monthShort}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.taxRuleLabel}</span>
                <span className="text-sm font-medium text-foreground">
                  {currency === "USD"
                    ? pt.taxRuleNoExemption
                    : is18MonthRule
                      ? pt.taxRule18Month
                      : pt.taxRule200}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">{pt.totalInterest}</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(result.totalInterest, currency)}</span>
              </div>
              {result.totalExempt > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.taxExemptPortion}</span>
                  <span className="text-sm font-medium text-green-600">{formatMoney(result.totalExempt, currency)}</span>
                </div>
              )}
              {result.totalTax > 0 && (
                <div className="flex justify-between px-5 py-3 bg-red-50">
                  <span className="text-sm font-semibold text-red-700">{pt.taxDeduction}</span>
                  <span className="text-sm font-bold text-red-700">-{formatMoney(result.totalTax, currency)}</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.netInterestReceived}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(result.totalNetInterest, currency)}</span>
              </div>
            </div>
          </div>

          {/* Monthly table */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.monthlyTable}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-3 font-medium text-muted">{pt.monthCol}</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">{pt.interestCol}</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">{pt.exemptionCol}</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">{pt.taxCol}</th>
                    <th className="px-3 py-3 font-medium text-muted text-right">{pt.netCol}</th>
                    {payoutType === "end" && (
                      <th className="px-3 py-3 font-medium text-muted text-right">{pt.balanceCol}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-t border-border hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium">{row.month}</td>
                      <td className="px-3 py-3 text-right text-green-600">{formatMoney(row.interest, currency)}</td>
                      <td className="px-3 py-3 text-right text-muted">
                        {row.taxExempt > 0 ? formatMoney(row.taxExempt, currency) : "—"}
                      </td>
                      <td className="px-3 py-3 text-right text-red-600">
                        {row.tax > 0 ? `-${formatMoney(row.tax, currency)}` : "0,00"}
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-primary">{formatMoney(row.netInterest, currency)}</td>
                      {payoutType === "end" && (
                        <td className="px-3 py-3 text-right font-medium">{formatMoney(row.balance, currency)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.table.length > 12 && (
              <button
                onClick={() => setShowFullTable(!showFullTable)}
                className="mt-3 text-sm text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1 mx-auto"
              >
                {showFullTable ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {pt.collapse}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {pt.showAll.replace("{count}", String(result.table.length))}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tax rules explanation */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span>
              {pt.taxRulesTitle}
            </h4>
            <div className="space-y-4 text-sm text-muted">
              <div>
                <p className="font-medium text-foreground">{pt.rule200Title}</p>
                <p>{pt.rule200Desc}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.rule18Title}</p>
                <p>{pt.rule18Desc}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.foreignCurrencyTitle}</p>
                <p>{pt.foreignCurrencyDesc}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.perBankTitle}</p>
                <p>{pt.perBankDesc}</p>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span>📝</span>
              {pt.practicalExamples}
            </h4>
            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">{pt.example1Title}</p>
                <p className="text-muted">{pt.example1Desc}</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>{pt.example1Line1} <span className="font-medium text-foreground">{pt.example1Line1Val}</span></p>
                  <p>{pt.example1Line2} <span className="font-medium text-foreground">{pt.example1Line2Val}</span></p>
                  <p>{pt.example1Line3} <span className="font-medium text-foreground">{pt.example1Line3Val}</span></p>
                  <p>{pt.example1Line4} <span className="font-medium text-red-600">{pt.example1Line4Val}</span></p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">{pt.example2Title}</p>
                <p className="text-muted">{pt.example2Desc}</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>{pt.example2Line1} <span className="font-medium text-foreground">{pt.example2Line1Val}</span></p>
                  <p>{pt.example2Line2} <span className="font-medium text-red-600">{pt.example2Line2Val}</span></p>
                  <p>{pt.example2Line3} <span className="font-medium text-primary">{pt.example2Line3Val}</span></p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">{pt.example3Title}</p>
                <p className="text-muted">{pt.example3Desc}</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>{pt.example3Line1} <span className="font-medium text-green-700">{pt.example3Line1Val}</span></p>
                  <p>{pt.example3Line2}</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">{pt.example4Title}</p>
                <p className="text-muted">{pt.example4Desc}</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>{pt.example4Line1} <span className="font-medium text-red-600">{pt.example4Line1Bold}</span> {pt.example4Line2}</p>
                  <p>{pt.example4Line3}</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">{pt.example5Title}</p>
                <p className="text-muted">{pt.example5Desc}</p>
                <div className="mt-2 space-y-1 text-muted">
                  <p>{pt.example5Line1} <span className="font-medium text-red-600">{pt.example5Line1Bold}</span>.</p>
                  <p>{pt.example5Line2}</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span>❓</span>
              {pt.faqTitle}
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-foreground">{pt.faq1Q}</p>
                <p className="text-muted mt-1">{pt.faq1A}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.faq2Q}</p>
                <p className="text-muted mt-1">{pt.faq2A}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.faq3Q}</p>
                <p className="text-muted mt-1">{pt.faq3A}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{pt.faq4Q}</p>
                <p className="text-muted mt-1">{pt.faq4A}</p>
              </div>
            </div>
          </div>

          {/* Deposit insurance */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span>🛡️</span>
              {pt.depositInsurance}
            </h4>
            <p className="text-sm text-amber-700">
              {currency === "AZN" ? pt.depositInsuranceTextAZN : pt.depositInsuranceTextUSD}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏧</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
