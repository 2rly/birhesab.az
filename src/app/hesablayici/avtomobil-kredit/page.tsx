"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

type CarCondition = "new" | "used";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function calculateAnnuity(amount: number, yearlyRate: number, months: number) {
  const monthlyRate = yearlyRate / 100 / 12;

  if (monthlyRate === 0) {
    const payment = amount / months;
    return { payment, totalPayment: amount, totalInterest: 0, monthlyRate: 0 };
  }

  const payment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = payment * months;
  const totalInterest = totalPayment - amount;

  return { payment, totalPayment, totalInterest, monthlyRate };
}

function buildAmortizationSummary(
  amount: number,
  monthlyRate: number,
  monthlyPayment: number,
  months: number
): { firstYear: AmortizationRow[]; lastPayment: AmortizationRow } {
  const rows: AmortizationRow[] = [];
  let balance = amount;

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);

    if (i <= 12 || i === months) {
      rows.push({ month: i, payment: monthlyPayment, principal, interest, balance });
    }
  }

  return {
    firstYear: rows.filter((r) => r.month <= 12),
    lastPayment: rows[rows.length - 1],
  };
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Avtomobil kredit hesablay\u0131c\u0131s\u0131",
    description: "Avtomobil krediti \u00fc\u00e7\u00fcn ayl\u0131q \u00f6d\u0259ni\u015f, faiz v\u0259 \u00fcmumi x\u0259rci hesablay\u0131n.",
    breadcrumbCategory: "Avtomobil",
    breadcrumbLabel: "Avtomobil krediti",
    formulaTitle: "Avtomobil krediti nec\u0259 hesablan\u0131r?",
    formulaContent: `Ayl\u0131q \u00f6d\u0259ni\u015f (annuitet) = M \u00d7 (r \u00d7 (1+r)\u207f) / ((1+r)\u207f \u2212 1)

M \u2014 kredit m\u0259bl\u0259\u011fi (qiym\u0259t \u2212 ilkin \u00f6d\u0259ni\u015f)
r \u2014 ayl\u0131q faiz d\u0259r\u0259c\u0259si (illik faiz / 12 / 100)
n \u2014 kredit m\u00fcddd\u0259ti (ay)

Az\u0259rbaycanda tipik faiz d\u0259r\u0259c\u0259l\u0259ri:
\u2022 Yeni avtomobil: 12\u201318% illik
\u2022 \u0130\u015fl\u0259nmi\u015f avtomobil: 15\u201322% illik

\u0130lkin \u00f6d\u0259ni\u015f ad\u0259t\u0259n 20\u201330% t\u0259l\u0259b olunur.
Daha y\u00fcks\u0259k ilkin \u00f6d\u0259ni\u015f \u2014 daha az faiz x\u0259rci.`,
    carCondition: "Avtomobilin v\u0259ziyy\u0259ti",
    conditionNew: "Yeni",
    conditionNewRate: "12\u201318% illik",
    conditionUsed: "\u0130\u015fl\u0259nmi\u015f",
    conditionUsedRate: "15\u201322% illik",
    carPrice: "Avtomobilin qiym\u0259ti (AZN)",
    interestRate: "\u0130llik faiz d\u0259r\u0259c\u0259si (%)",
    downPayment: "\u0130lkin \u00f6d\u0259ni\u015f:",
    loanTerm: "Kredit m\u00fcddd\u0259ti",
    monthUnit: "ay",
    monthlyPayment: "Ayl\u0131q \u00f6d\u0259ni\u015f",
    perMonth: "AZN / ay",
    loanAmount: "Kredit m\u0259bl\u0259\u011fi",
    overpayment: "Art\u0131q \u00f6d\u0259ni\u015f (faiz)",
    costStructure: "\u00dcmumi x\u0259rcin strukturu",
    downPaymentLegend: "\u0130lkin \u00f6d\u0259ni\u015f:",
    principalLegend: "\u018fsas borc:",
    interestLegend: "Faiz:",
    detailedCalc: "\u018ftraf l\u0131 hesablama",
    carPriceRow: "Avtomobilin qiym\u0259ti",
    downPaymentRow: "\u0130lkin \u00f6d\u0259ni\u015f",
    loanAmountRow: "Kredit m\u0259bl\u0259\u011fi",
    interestRateRow: "Faiz d\u0259r\u0259c\u0259si",
    termRow: "M\u00fcddd\u0259t",
    monthlyPaymentRow: "Ayl\u0131q \u00f6d\u0259ni\u015f",
    totalInterestRow: "\u00dcmumi faiz \u00f6d\u0259ni\u015fi",
    totalPaymentRow: "\u00dcmumi \u00f6d\u0259ni\u015f (kredit)",
    totalCostRow: "\u00dcmumi x\u0259rc (ilkin + kredit)",
    yearlyLabel: "illik",
    paymentSchedule: "\u00d6d\u0259ni\u015f c\u0259dv\u0259li (ilk 12 ay)",
    monthHeader: "Ay",
    paymentHeader: "\u00d6d\u0259ni\u015f",
    principalHeader: "\u018fsas borc",
    interestHeader: "Faiz",
    balanceHeader: "Qal\u0131q",
    moreMonths: "ay daha",
    collapse: "Y\u0131\u011f",
    showAll12: "12 ay\u0131 tam g\u00f6st\u0259r",
    warningTitle: "Diqq\u0259t:",
    warningText: "Bu hesablama t\u0259xmini xarakter da\u015f\u0131y\u0131r. Faktiki faiz d\u0259r\u0259c\u0259si bank\u0131n siyas\u0259tin\u0259, kredit tarix\u00e7\u0259sin\u0259 v\u0259 m\u00fcraci\u0259t zaman\u0131na g\u00f6r\u0259 f\u0259rql\u0259n\u0259 bil\u0259r. Komisyon v\u0259 s\u0131\u011forta x\u0259rcl\u0259ri daxil edilm\u0259yib.",
    emptyState: "N\u0259tic\u0259ni g\u00f6rm\u0259k \u00fc\u00e7\u00fcn avtomobilin qiym\u0259tini daxil edin.",
  },
  en: {
    title: "Car Loan Calculator",
    description: "Calculate monthly payment, interest and total cost for a car loan.",
    breadcrumbCategory: "Automotive",
    breadcrumbLabel: "Car loan",
    formulaTitle: "How is a car loan calculated?",
    formulaContent: `Monthly payment (annuity) = M \u00d7 (r \u00d7 (1+r)\u207f) / ((1+r)\u207f \u2212 1)

M \u2014 loan amount (price \u2212 down payment)
r \u2014 monthly interest rate (annual rate / 12 / 100)
n \u2014 loan term (months)

Typical interest rates in Azerbaijan:
\u2022 New car: 12\u201318% annual
\u2022 Used car: 15\u201322% annual

Down payment is usually 20\u201330%.
Higher down payment \u2014 less interest cost.`,
    carCondition: "Car condition",
    conditionNew: "New",
    conditionNewRate: "12\u201318% annual",
    conditionUsed: "Used",
    conditionUsedRate: "15\u201322% annual",
    carPrice: "Car price (AZN)",
    interestRate: "Annual interest rate (%)",
    downPayment: "Down payment:",
    loanTerm: "Loan term",
    monthUnit: "months",
    monthlyPayment: "Monthly payment",
    perMonth: "AZN / month",
    loanAmount: "Loan amount",
    overpayment: "Overpayment (interest)",
    costStructure: "Total cost structure",
    downPaymentLegend: "Down payment:",
    principalLegend: "Principal:",
    interestLegend: "Interest:",
    detailedCalc: "Detailed calculation",
    carPriceRow: "Car price",
    downPaymentRow: "Down payment",
    loanAmountRow: "Loan amount",
    interestRateRow: "Interest rate",
    termRow: "Term",
    monthlyPaymentRow: "Monthly payment",
    totalInterestRow: "Total interest paid",
    totalPaymentRow: "Total payment (loan)",
    totalCostRow: "Total cost (down payment + loan)",
    yearlyLabel: "annual",
    paymentSchedule: "Payment schedule (first 12 months)",
    monthHeader: "Month",
    paymentHeader: "Payment",
    principalHeader: "Principal",
    interestHeader: "Interest",
    balanceHeader: "Balance",
    moreMonths: "more months",
    collapse: "Collapse",
    showAll12: "Show all 12 months",
    warningTitle: "Note:",
    warningText: "This calculation is approximate. The actual interest rate may vary depending on the bank's policy, credit history and application date. Commission and insurance costs are not included.",
    emptyState: "Enter the car price to see the result.",
  },
  ru: {
    title: "\u041a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440 \u0430\u0432\u0442\u043e\u043a\u0440\u0435\u0434\u0438\u0442\u0430",
    description: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0435\u0436\u0435\u043c\u0435\u0441\u044f\u0447\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0451\u0436, \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0438 \u043e\u0431\u0449\u0443\u044e \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0430\u0432\u0442\u043e\u043a\u0440\u0435\u0434\u0438\u0442\u0430.",
    breadcrumbCategory: "\u0410\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c",
    breadcrumbLabel: "\u0410\u0432\u0442\u043e\u043a\u0440\u0435\u0434\u0438\u0442",
    formulaTitle: "\u041a\u0430\u043a \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u043a\u0440\u0435\u0434\u0438\u0442?",
    formulaContent: `\u0415\u0436\u0435\u043c\u0435\u0441\u044f\u0447\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 (\u0430\u043d\u043d\u0443\u0438\u0442\u0435\u0442) = M \u00d7 (r \u00d7 (1+r)\u207f) / ((1+r)\u207f \u2212 1)

M \u2014 \u0441\u0443\u043c\u043c\u0430 \u043a\u0440\u0435\u0434\u0438\u0442\u0430 (\u0446\u0435\u043d\u0430 \u2212 \u043f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u0437\u043d\u043e\u0441)
r \u2014 \u043c\u0435\u0441\u044f\u0447\u043d\u0430\u044f \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u0430\u044f \u0441\u0442\u0430\u0432\u043a\u0430 (\u0433\u043e\u0434\u043e\u0432\u0430\u044f / 12 / 100)
n \u2014 \u0441\u0440\u043e\u043a \u043a\u0440\u0435\u0434\u0438\u0442\u0430 (\u043c\u0435\u0441\u044f\u0446\u044b)

\u0422\u0438\u043f\u0438\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u0441\u0442\u0430\u0432\u043a\u0438 \u0432 \u0410\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043d\u0435:
\u2022 \u041d\u043e\u0432\u044b\u0439 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c: 12\u201318% \u0433\u043e\u0434\u043e\u0432\u044b\u0445
\u2022 \u0411/\u0443 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c: 15\u201322% \u0433\u043e\u0434\u043e\u0432\u044b\u0445

\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u0437\u043d\u043e\u0441 \u043e\u0431\u044b\u0447\u043d\u043e 20\u201330%.
\u0411\u043e\u043b\u044c\u0448\u0435 \u0432\u0437\u043d\u043e\u0441 \u2014 \u043c\u0435\u043d\u044c\u0448\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432.`,
    carCondition: "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044f",
    conditionNew: "\u041d\u043e\u0432\u044b\u0439",
    conditionNewRate: "12\u201318% \u0433\u043e\u0434\u043e\u0432\u044b\u0445",
    conditionUsed: "\u0411/\u0443",
    conditionUsedRate: "15\u201322% \u0433\u043e\u0434\u043e\u0432\u044b\u0445",
    carPrice: "\u0426\u0435\u043d\u0430 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044f (AZN)",
    interestRate: "\u0413\u043e\u0434\u043e\u0432\u0430\u044f \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u0430\u044f \u0441\u0442\u0430\u0432\u043a\u0430 (%)",
    downPayment: "\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u0437\u043d\u043e\u0441:",
    loanTerm: "\u0421\u0440\u043e\u043a \u043a\u0440\u0435\u0434\u0438\u0442\u0430",
    monthUnit: "\u043c\u0435\u0441.",
    monthlyPayment: "\u0415\u0436\u0435\u043c\u0435\u0441\u044f\u0447\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0451\u0436",
    perMonth: "AZN / \u043c\u0435\u0441",
    loanAmount: "\u0421\u0443\u043c\u043c\u0430 \u043a\u0440\u0435\u0434\u0438\u0442\u0430",
    overpayment: "\u041f\u0435\u0440\u0435\u043f\u043b\u0430\u0442\u0430 (\u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b)",
    costStructure: "\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043e\u0431\u0449\u0438\u0445 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432",
    downPaymentLegend: "\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u0437\u043d\u043e\u0441:",
    principalLegend: "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u0434\u043e\u043b\u0433:",
    interestLegend: "\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u044b:",
    detailedCalc: "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0451\u0442",
    carPriceRow: "\u0426\u0435\u043d\u0430 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044f",
    downPaymentRow: "\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u0437\u043d\u043e\u0441",
    loanAmountRow: "\u0421\u0443\u043c\u043c\u0430 \u043a\u0440\u0435\u0434\u0438\u0442\u0430",
    interestRateRow: "\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u0430\u044f \u0441\u0442\u0430\u0432\u043a\u0430",
    termRow: "\u0421\u0440\u043e\u043a",
    monthlyPaymentRow: "\u0415\u0436\u0435\u043c\u0435\u0441\u044f\u0447\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0451\u0436",
    totalInterestRow: "\u041e\u0431\u0449\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432",
    totalPaymentRow: "\u041e\u0431\u0449\u0438\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 (\u043a\u0440\u0435\u0434\u0438\u0442)",
    totalCostRow: "\u041e\u0431\u0449\u0430\u044f \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c (\u0432\u0437\u043d\u043e\u0441 + \u043a\u0440\u0435\u0434\u0438\u0442)",
    yearlyLabel: "\u0433\u043e\u0434\u043e\u0432\u044b\u0445",
    paymentSchedule: "\u0413\u0440\u0430\u0444\u0438\u043a \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 (\u043f\u0435\u0440\u0432\u044b\u0435 12 \u043c\u0435\u0441.)",
    monthHeader: "\u041c\u0435\u0441.",
    paymentHeader: "\u041f\u043b\u0430\u0442\u0451\u0436",
    principalHeader: "\u041e\u0441\u043d. \u0434\u043e\u043b\u0433",
    interestHeader: "\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u044b",
    balanceHeader: "\u041e\u0441\u0442\u0430\u0442\u043e\u043a",
    moreMonths: "\u043c\u0435\u0441. \u0435\u0449\u0451",
    collapse: "\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c",
    showAll12: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0435 12 \u043c\u0435\u0441.",
    warningTitle: "\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435:",
    warningText: "\u0414\u0430\u043d\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043f\u0440\u0438\u0431\u043b\u0438\u0437\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c. \u0424\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u0430\u044f \u0441\u0442\u0430\u0432\u043a\u0430 \u043c\u043e\u0436\u0435\u0442 \u043e\u0442\u043b\u0438\u0447\u0430\u0442\u044c\u0441\u044f \u0432 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0438 \u043e\u0442 \u043f\u043e\u043b\u0438\u0442\u0438\u043a\u0438 \u0431\u0430\u043d\u043a\u0430, \u043a\u0440\u0435\u0434\u0438\u0442\u043d\u043e\u0439 \u0438\u0441\u0442\u043e\u0440\u0438\u0438 \u0438 \u0434\u0430\u0442\u044b \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u044f. \u041a\u043e\u043c\u0438\u0441\u0441\u0438\u044f \u0438 \u0441\u0442\u0440\u0430\u0445\u043e\u0432\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b \u043d\u0435 \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u044b.",
    emptyState: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0446\u0435\u043d\u0443 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044f, \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442.",
  },
};

export default function CarLoanCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [carPrice, setCarPrice] = useState("");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [loanTerm, setLoanTerm] = useState("36");
  const [interestRate, setInterestRate] = useState("");
  const [carCondition, setCarCondition] = useState<CarCondition>("new");
  const [showFullTable, setShowFullTable] = useState(false);

  const suggestedRate = carCondition === "new" ? "15" : "18";

  const result = useMemo(() => {
    const price = parseFloat(carPrice);
    const downPct = parseFloat(downPaymentPercent);
    const months = parseInt(loanTerm);
    const rate = parseFloat(interestRate) || parseFloat(suggestedRate);

    if (!price || price <= 0 || isNaN(downPct) || downPct < 0 || downPct > 99) return null;
    if (!months || months <= 0) return null;
    if (!rate || rate < 0) return null;

    const downPayment = (price * downPct) / 100;
    const loanAmount = price - downPayment;

    if (loanAmount <= 0) return null;

    const { payment, totalPayment, totalInterest, monthlyRate } = calculateAnnuity(loanAmount, rate, months);
    const amortization = buildAmortizationSummary(loanAmount, monthlyRate, payment, months);

    return {
      carPrice: price,
      downPayment,
      downPaymentPercent: downPct,
      loanAmount,
      monthlyPayment: payment,
      totalPayment,
      totalInterest,
      totalCost: downPayment + totalPayment,
      interestRate: rate,
      months,
      amortization,
    };
  }, [carPrice, downPaymentPercent, loanTerm, interestRate, suggestedRate]);

  const termOptions = [12, 24, 36, 48, 60, 72];

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
      relatedIds={["loan", "car-customs", "road-tax", "osago"]}
    >
      {/* Car Condition */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.carCondition}</label>
        <div className="grid grid-cols-2 gap-3 sm:w-1/2">
          <button
            onClick={() => setCarCondition("new")}
            className={`p-3 rounded-xl border text-center transition-all ${
              carCondition === "new"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">&#128663;</span>
            <p className="text-xs font-medium text-foreground">{pt.conditionNew}</p>
            <p className="text-xs text-muted">{pt.conditionNewRate}</p>
          </button>
          <button
            onClick={() => setCarCondition("used")}
            className={`p-3 rounded-xl border text-center transition-all ${
              carCondition === "used"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">&#128295;</span>
            <p className="text-xs font-medium text-foreground">{pt.conditionUsed}</p>
            <p className="text-xs text-muted">{pt.conditionUsedRate}</p>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            &#128176; {pt.carPrice}
          </label>
          <input
            type="number"
            value={carPrice}
            onChange={(e) => setCarPrice(e.target.value)}
            placeholder="30000"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            &#128202; {pt.interestRate}
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder={suggestedRate}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Down Payment Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          &#128179; {pt.downPayment} {downPaymentPercent}%
          {carPrice && parseFloat(carPrice) > 0 && (
            <span className="text-muted font-normal">
              {" "}&mdash; {fmt((parseFloat(carPrice) * parseFloat(downPaymentPercent || "0")) / 100)} AZN
            </span>
          )}
        </label>
        <input
          type="range"
          min="0"
          max="80"
          step="5"
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>0%</span>
          <span>20%</span>
          <span>40%</span>
          <span>60%</span>
          <span>80%</span>
        </div>
      </div>

      {/* Loan Term */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">&#128197; {pt.loanTerm}</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {termOptions.map((term) => (
            <button
              key={term}
              onClick={() => setLoanTerm(String(term))}
              className={`p-3 rounded-xl border text-center transition-all ${
                loanTerm === String(term)
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-lg font-bold text-foreground">{term}</p>
              <p className="text-xs text-muted">{pt.monthUnit}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.monthlyPayment}</p>
              <p className="text-3xl font-bold">{fmt(result.monthlyPayment)}</p>
              <p className="text-xs text-blue-200 mt-1">{pt.perMonth}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">{pt.loanAmount}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.loanAmount)}</p>
              <p className="text-xs text-muted mt-1">AZN</p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.overpayment}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.totalInterest)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.costStructure}</p>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-400"
                style={{ width: `${(result.downPayment / result.totalCost) * 100}%` }}
                title={pt.downPaymentLegend}
              />
              <div
                className="h-full bg-primary"
                style={{ width: `${(result.loanAmount / result.totalCost) * 100}%` }}
                title={pt.principalLegend}
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(result.totalInterest / result.totalCost) * 100}%` }}
                title={pt.interestLegend}
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                {pt.downPaymentLegend} {fmt(result.downPayment)} AZN
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                {pt.principalLegend} {fmt(result.loanAmount)} AZN
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                {pt.interestLegend} {fmt(result.totalInterest)} AZN
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>&#128203;</span>
                {pt.detailedCalc}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.carPriceRow}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.carPrice)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.downPaymentRow} ({result.downPaymentPercent}%)</span>
                <span className="text-sm font-medium text-green-600">{fmt(result.downPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.loanAmountRow}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.loanAmount)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.interestRateRow}</span>
                <span className="text-sm font-medium text-foreground">{result.interestRate}% {pt.yearlyLabel}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.termRow}</span>
                <span className="text-sm font-medium text-foreground">{result.months} {pt.monthUnit}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.monthlyPaymentRow}</span>
                <span className="text-sm font-medium text-primary">{fmt(result.monthlyPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.totalInterestRow}</span>
                <span className="text-sm font-medium text-amber-600">{fmt(result.totalInterest)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.totalPaymentRow}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.totalPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary-light">
                <span className="text-sm font-semibold text-primary-dark">{pt.totalCostRow}</span>
                <span className="text-sm font-bold text-primary-dark">{fmt(result.totalCost)} AZN</span>
              </div>
            </div>
          </div>

          {/* Amortization Summary */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>&#128203;</span>
              {pt.paymentSchedule}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-muted">{pt.monthHeader}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.paymentHeader}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.principalHeader}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.interestHeader}</th>
                    <th className="px-4 py-3 font-medium text-muted text-right">{pt.balanceHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {(showFullTable
                    ? result.amortization.firstYear
                    : result.amortization.firstYear.slice(0, 6)
                  ).map((row) => (
                    <tr key={row.month} className="border-t border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 text-right">{fmt(row.payment)}</td>
                      <td className="px-4 py-3 text-right text-primary">{fmt(row.principal)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{fmt(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-medium">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                  {result.months > 12 && (
                    <tr className="border-t border-border bg-gray-50">
                      <td className="px-4 py-3 font-medium text-muted" colSpan={5}>
                        ... {result.months - 12} {pt.moreMonths} ...
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-border bg-primary-light">
                    <td className="px-4 py-3 font-bold text-primary-dark">{result.amortization.lastPayment.month}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.payment)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.principal)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.interest)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-dark">{fmt(result.amortization.lastPayment.balance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {result.amortization.firstYear.length > 6 && (
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
                    {pt.showAll12}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.warningTitle}</span> {pt.warningText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">&#128663;</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
