"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const REGIONS_TRANSLATIONS: Record<Lang, { label: string; norm: number }[]> = {
  az: [
    { label: "Bak\u0131 \u015f\u0259h\u0259ri", norm: 125 },
    { label: "Nax\u00e7\u0131van \u015f\u0259h\u0259rl\u0259ri", norm: 100 },
    { label: "G\u0259nc\u0259 v\u0259 Sumqay\u0131t \u015f\u0259h\u0259rl\u0259ri", norm: 95 },
    { label: "Dig\u0259r \u015f\u0259h\u0259r, rayon m\u0259rk\u0259zl\u0259ri, q\u0259s\u0259b\u0259 v\u0259 k\u0259ndl\u0259r", norm: 90 },
  ],
  en: [
    { label: "Baku city", norm: 125 },
    { label: "Nakhchivan cities", norm: 100 },
    { label: "Ganja and Sumgait cities", norm: 95 },
    { label: "Other cities, district centers, towns and villages", norm: 90 },
  ],
  ru: [
    { label: "\u0413\u043e\u0440\u043e\u0434 \u0411\u0430\u043a\u0443", norm: 125 },
    { label: "\u0413\u043e\u0440\u043e\u0434\u0430 \u041d\u0430\u0445\u0447\u044b\u0432\u0430\u043d\u0430", norm: 100 },
    { label: "\u0413\u043e\u0440\u043e\u0434\u0430 \u0413\u044f\u043d\u0434\u0436\u0430 \u0438 \u0421\u0443\u043c\u0433\u0430\u0438\u0442", norm: 95 },
    { label: "\u0414\u0440\u0443\u0433\u0438\u0435 \u0433\u043e\u0440\u043e\u0434\u0430, \u0440\u0430\u0439\u043e\u043d\u043d\u044b\u0435 \u0446\u0435\u043d\u0442\u0440\u044b, \u043f\u043e\u0441\u0451\u043b\u043a\u0438 \u0438 \u0441\u0451\u043b\u0430", norm: 90 },
  ],
};

type Mode = "single" | "multicity";

interface Leg {
  id: number;
  regionIndex: number;
  days: string;
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcLeg(norm: number, numDays: number) {
  const dailyExpense = norm * 0.3 * numDays;
  const hotelExpense = numDays > 1 ? norm * 0.7 * (numDays - 1) : 0;
  return { dailyExpense, hotelExpense, total: dailyExpense + hotelExpense };
}

const pageTranslations = {
  az: {
    title: "Ezamiyy\u0259 X\u0259rci Kalkulyatoru",
    description: "Ezamiyy\u0259t g\u00fcnd\u0259lik normas\u0131, mehmanxana v\u0259 \u00fcmumi x\u0259rcl\u0259ri hesablay\u0131n.",
    breadcrumbCategory: "\u018fm\u0259k H\u00fcququ",
    breadcrumbLabel: "Ezamiyy\u0259 hesablay\u0131c\u0131s\u0131",
    formulaTitle: "Ezamiyy\u0259 x\u0259rcl\u0259ri nec\u0259 hesablan\u0131r?",
    formulaContent: `G\u00fcnd\u0259lik x\u0259rc (30%):
Norma \u00d7 30% \u00d7 G\u00fcn say\u0131

Mehmanxana x\u0259rci (70%):
Norma \u00d7 70% \u00d7 (G\u00fcn say\u0131 \u2212 1)

Yekun m\u0259bl\u0259\u011f = G\u00fcnd\u0259lik x\u0259rc + Mehmanxana x\u0259rci

\u018frazil\u0259r \u00fczr\u0259 normalar:
\u2022 Bak\u0131 \u015f\u0259h\u0259ri \u2014 125 AZN
\u2022 Nax\u00e7\u0131van \u015f\u0259h\u0259rl\u0259ri \u2014 100 AZN
\u2022 G\u0259nc\u0259 v\u0259 Sumqay\u0131t \u015f\u0259h\u0259rl\u0259ri \u2014 95 AZN
\u2022 Dig\u0259r \u015f\u0259h\u0259r, rayon m\u0259rk\u0259zl\u0259ri, q\u0259s\u0259b\u0259 v\u0259 k\u0259ndl\u0259r \u2014 90 AZN

Qeyd: Mar\u015frut \u00fczr\u0259 ezamiyy\u0259d\u0259 h\u0259r \u0259razi ayr\u0131ca hesablan\u0131r. Sonuncu g\u00fcn yaln\u0131z g\u00fcnd\u0259lik x\u0259rc hesablan\u0131r (gec\u0259l\u0259m\u0259 x\u0259rci yoxdur).`,
    modeQuestion: "Ezamiyy\u0259 t\u0259k bir rayondur, yoxsa bir ne\u00e7\u0259?",
    singleRegion: "T\u0259k rayon",
    multicity: "Mar\u015frut \u00fczr\u0259 (Multicity)",
    selectRegion: "1. Ezam olunaca\u011f\u0131n\u0131z \u0259razini se\u00e7in",
    normLabel: "Norma:",
    daysQuestion: "2. Ezamiyy\u0259t ne\u00e7\u0259 t\u0259qvim g\u00fcn\u00fc davam ed\u0259c\u0259k?",
    daysPlaceholder: "M\u0259s\u0259l\u0259n: 4",
    daysUnit: "g\u00fcn",
    multicityInfo: "Sistem avtomatik olaraq sonuncu g\u00fcn\u00fc gec\u0259l\u0259m\u0259 x\u0259rci olmadan (yaln\u0131z g\u00fcnd\u0259lik x\u0259rc) hesablayacaq.",
    routeLabel: "Mar\u015frut",
    removeRoute: "\u2715 Sil",
    regionLabel: "\u018frazi",
    daysLabel: "G\u00fcn say\u0131",
    daysInputPlaceholder: "M\u0259s: 2",
    addRoute: "+ Mar\u015frut \u0259lav\u0259 et",
    taxiNote: "Taksi x\u0259rcl\u0259ri g\u00fcnd\u0259lik x\u0259rc\u0259 daxildir (S\u0259n\u0259d t\u0259l\u0259b olunmur)",
    totalAmount: "Yekun m\u0259bl\u0259\u011f",
    dailyExpense: "G\u00fcnd\u0259lik x\u0259rc (30%)",
    hotelExpense: "Mehmanxana x\u0259rci (70%)",
    nightUnit: "gec\u0259",
    calculationTable: "Hesablama c\u0259dv\u0259li",
    regionRow: "\u018frazi",
    dailyNorm: "G\u00fcnd\u0259lik norma",
    daysCount: "G\u00fcn say\u0131",
    totalAmountLabel: "Yekun m\u0259bl\u0259\u011f",
    overallTotal: "\u00dcmumi yekun m\u0259bl\u0259\u011f",
    overallDailyExpense: "\u00dcmumi g\u00fcnd\u0259lik x\u0259rc (30%)",
    allRoutes: "B\u00fct\u00fcn mar\u015frutlar",
    overallHotelExpense: "\u00dcmumi mehmanxana x\u0259rci (70%)",
    routeBreakdown: "Mar\u015frut \u00fczr\u0259 hesablama",
    dailyLabel: "G\u00fcnd\u0259lik:",
    hotelLabel: "Mehmanxana:",
    grandTotal: "\u00dcmumi yekun",
    emptyStateSingle: "N\u0259tic\u0259ni g\u00f6rm\u0259k \u00fc\u00e7\u00fcn \u0259razini se\u00e7in v\u0259 g\u00fcn say\u0131n\u0131 daxil edin.",
    emptyStateMulti: "N\u0259tic\u0259ni g\u00f6rm\u0259k \u00fc\u00e7\u00fcn h\u0259r mar\u015frutun \u0259razisini v\u0259 g\u00fcn say\u0131n\u0131 daxil edin.",
  },
  en: {
    title: "Business Trip Expense Calculator",
    description: "Calculate daily allowance, hotel and total business trip expenses.",
    breadcrumbCategory: "Labor Law",
    breadcrumbLabel: "Business trip calculator",
    formulaTitle: "How are business trip expenses calculated?",
    formulaContent: `Daily expense (30%):
Norm \u00d7 30% \u00d7 Number of days

Hotel expense (70%):
Norm \u00d7 70% \u00d7 (Number of days \u2212 1)

Total amount = Daily expense + Hotel expense

Norms by region:
\u2022 Baku city \u2014 125 AZN
\u2022 Nakhchivan cities \u2014 100 AZN
\u2022 Ganja and Sumgait cities \u2014 95 AZN
\u2022 Other cities, district centers, towns and villages \u2014 90 AZN

Note: For multi-city trips, each region is calculated separately. The last day only includes daily expense (no hotel cost).`,
    modeQuestion: "Is the trip to a single region or multiple?",
    singleRegion: "Single region",
    multicity: "Multi-city route",
    selectRegion: "1. Select the destination region",
    normLabel: "Norm:",
    daysQuestion: "2. How many calendar days will the trip last?",
    daysPlaceholder: "E.g.: 4",
    daysUnit: "days",
    multicityInfo: "The system will automatically calculate the last day without hotel costs (daily expense only).",
    routeLabel: "Route",
    removeRoute: "\u2715 Remove",
    regionLabel: "Region",
    daysLabel: "Number of days",
    daysInputPlaceholder: "E.g.: 2",
    addRoute: "+ Add route",
    taxiNote: "Taxi expenses are included in daily expenses (No documentation required)",
    totalAmount: "Total amount",
    dailyExpense: "Daily expense (30%)",
    hotelExpense: "Hotel expense (70%)",
    nightUnit: "nights",
    calculationTable: "Calculation table",
    regionRow: "Region",
    dailyNorm: "Daily norm",
    daysCount: "Number of days",
    totalAmountLabel: "Total amount",
    overallTotal: "Overall total amount",
    overallDailyExpense: "Total daily expense (30%)",
    allRoutes: "All routes",
    overallHotelExpense: "Total hotel expense (70%)",
    routeBreakdown: "Breakdown by route",
    dailyLabel: "Daily:",
    hotelLabel: "Hotel:",
    grandTotal: "Grand total",
    emptyStateSingle: "Select a region and enter the number of days to see the result.",
    emptyStateMulti: "Enter the region and number of days for each route to see the result.",
  },
  ru: {
    title: "\u041a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043e\u0447\u043d\u044b\u0445 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432",
    description: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0441\u0443\u0442\u043e\u0447\u043d\u044b\u0435, \u0433\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0435 \u0438 \u043e\u0431\u0449\u0438\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043a\u0438.",
    breadcrumbCategory: "\u0422\u0440\u0443\u0434\u043e\u0432\u043e\u0435 \u043f\u0440\u0430\u0432\u043e",
    breadcrumbLabel: "\u041a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043e\u043a",
    formulaTitle: "\u041a\u0430\u043a \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043e\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b?",
    formulaContent: `\u0421\u0443\u0442\u043e\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b (30%):
\u041d\u043e\u0440\u043c\u0430 \u00d7 30% \u00d7 \u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043d\u0435\u0439

\u0413\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b (70%):
\u041d\u043e\u0440\u043c\u0430 \u00d7 70% \u00d7 (\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043d\u0435\u0439 \u2212 1)

\u0418\u0442\u043e\u0433\u043e\u0432\u0430\u044f \u0441\u0443\u043c\u043c\u0430 = \u0421\u0443\u0442\u043e\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b + \u0413\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b

\u041d\u043e\u0440\u043c\u044b \u043f\u043e \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043c:
\u2022 \u0413\u043e\u0440\u043e\u0434 \u0411\u0430\u043a\u0443 \u2014 125 AZN
\u2022 \u0413\u043e\u0440\u043e\u0434\u0430 \u041d\u0430\u0445\u0447\u044b\u0432\u0430\u043d\u0430 \u2014 100 AZN
\u2022 \u0413\u043e\u0440\u043e\u0434\u0430 \u0413\u044f\u043d\u0434\u0436\u0430 \u0438 \u0421\u0443\u043c\u0433\u0430\u0438\u0442 \u2014 95 AZN
\u2022 \u0414\u0440\u0443\u0433\u0438\u0435 \u0433\u043e\u0440\u043e\u0434\u0430, \u0440\u0430\u0439\u043e\u043d\u043d\u044b\u0435 \u0446\u0435\u043d\u0442\u0440\u044b, \u043f\u043e\u0441\u0451\u043b\u043a\u0438 \u0438 \u0441\u0451\u043b\u0430 \u2014 90 AZN

\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435: \u041f\u0440\u0438 \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u043d\u043e\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043a\u0435 \u043a\u0430\u0436\u0434\u044b\u0439 \u0440\u0435\u0433\u0438\u043e\u043d \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e. \u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0434\u0435\u043d\u044c \u0432\u043a\u043b\u044e\u0447\u0430\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e \u0441\u0443\u0442\u043e\u0447\u043d\u044b\u0435 (\u0431\u0435\u0437 \u043d\u043e\u0447\u0451\u0432\u043a\u0438).`,
    modeQuestion: "\u041a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043a\u0430 \u0432 \u043e\u0434\u0438\u043d \u0440\u0435\u0433\u0438\u043e\u043d \u0438\u043b\u0438 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e?",
    singleRegion: "\u041e\u0434\u0438\u043d \u0440\u0435\u0433\u0438\u043e\u043d",
    multicity: "\u041f\u043e \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0443",
    selectRegion: "1. \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u043e\u043d \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f",
    normLabel: "\u041d\u043e\u0440\u043c\u0430:",
    daysQuestion: "2. \u0421\u043a\u043e\u043b\u044c\u043a\u043e \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u043d\u044b\u0445 \u0434\u043d\u0435\u0439 \u043f\u0440\u043e\u0434\u043b\u0438\u0442\u0441\u044f \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043a\u0430?",
    daysPlaceholder: "\u041d\u0430\u043f\u0440.: 4",
    daysUnit: "\u0434\u043d\u0435\u0439",
    multicityInfo: "\u0421\u0438\u0441\u0442\u0435\u043c\u0430 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0435\u0442 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0434\u0435\u043d\u044c \u0431\u0435\u0437 \u0433\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0445 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432 (\u0442\u043e\u043b\u044c\u043a\u043e \u0441\u0443\u0442\u043e\u0447\u043d\u044b\u0435).",
    routeLabel: "\u041c\u0430\u0440\u0448\u0440\u0443\u0442",
    removeRoute: "\u2715 \u0423\u0434\u0430\u043b\u0438\u0442\u044c",
    regionLabel: "\u0420\u0435\u0433\u0438\u043e\u043d",
    daysLabel: "\u041a\u043e\u043b-\u0432\u043e \u0434\u043d\u0435\u0439",
    daysInputPlaceholder: "\u041d\u0430\u043f\u0440.: 2",
    addRoute: "+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043c\u0430\u0440\u0448\u0440\u0443\u0442",
    taxiNote: "\u0420\u0430\u0441\u0445\u043e\u0434\u044b \u043d\u0430 \u0442\u0430\u043a\u0441\u0438 \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u044b \u0432 \u0441\u0443\u0442\u043e\u0447\u043d\u044b\u0435 (\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b \u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u044e\u0442\u0441\u044f)",
    totalAmount: "\u0418\u0442\u043e\u0433\u043e\u0432\u0430\u044f \u0441\u0443\u043c\u043c\u0430",
    dailyExpense: "\u0421\u0443\u0442\u043e\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b (30%)",
    hotelExpense: "\u0413\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b (70%)",
    nightUnit: "\u043d\u043e\u0447\u0435\u0439",
    calculationTable: "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0440\u0430\u0441\u0447\u0451\u0442\u0430",
    regionRow: "\u0420\u0435\u0433\u0438\u043e\u043d",
    dailyNorm: "\u0421\u0443\u0442\u043e\u0447\u043d\u0430\u044f \u043d\u043e\u0440\u043c\u0430",
    daysCount: "\u041a\u043e\u043b-\u0432\u043e \u0434\u043d\u0435\u0439",
    totalAmountLabel: "\u0418\u0442\u043e\u0433\u043e\u0432\u0430\u044f \u0441\u0443\u043c\u043c\u0430",
    overallTotal: "\u041e\u0431\u0449\u0430\u044f \u0438\u0442\u043e\u0433\u043e\u0432\u0430\u044f \u0441\u0443\u043c\u043c\u0430",
    overallDailyExpense: "\u041e\u0431\u0449\u0438\u0435 \u0441\u0443\u0442\u043e\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b (30%)",
    allRoutes: "\u0412\u0441\u0435 \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u044b",
    overallHotelExpense: "\u041e\u0431\u0449\u0438\u0435 \u0433\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b (70%)",
    routeBreakdown: "\u0420\u0430\u0441\u0447\u0451\u0442 \u043f\u043e \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0430\u043c",
    dailyLabel: "\u0421\u0443\u0442\u043e\u0447\u043d\u044b\u0435:",
    hotelLabel: "\u0413\u043e\u0441\u0442\u0438\u043d\u0438\u0446\u0430:",
    grandTotal: "\u041e\u0431\u0449\u0438\u0439 \u0438\u0442\u043e\u0433",
    emptyStateSingle: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u043e\u043d \u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043d\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442.",
    emptyStateMulti: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u043e\u043d \u0438 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043d\u0435\u0439 \u0434\u043b\u044f \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0430, \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442.",
  },
};

let nextId = 1;

export default function BusinessTripCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const REGIONS = REGIONS_TRANSLATIONS[lang];

  const [mode, setMode] = useState<Mode>("single");

  // Single mode state
  const [regionIndex, setRegionIndex] = useState(0);
  const [days, setDays] = useState("");

  // Multicity mode state
  const [legs, setLegs] = useState<Leg[]>([{ id: nextId++, regionIndex: 0, days: "" }]);

  const singleResult = useMemo(() => {
    const numDays = parseInt(days);
    if (!numDays || numDays <= 0) return null;
    const norm = REGIONS[regionIndex].norm;
    const { dailyExpense, hotelExpense, total } = calcLeg(norm, numDays);
    return { norm, numDays, dailyExpense, hotelExpense, total };
  }, [regionIndex, days, REGIONS]);

  const multiResult = useMemo(() => {
    const parsed = legs.map((leg) => {
      const numDays = parseInt(leg.days);
      if (!numDays || numDays <= 0) return null;
      const norm = REGIONS[leg.regionIndex].norm;
      const { dailyExpense, hotelExpense, total } = calcLeg(norm, numDays);
      return { norm, numDays, dailyExpense, hotelExpense, total, regionLabel: REGIONS[leg.regionIndex].label };
    });
    if (parsed.some((p) => p === null)) return null;
    const validLegs = parsed as NonNullable<(typeof parsed)[0]>[];
    const totalDaily = validLegs.reduce((s, l) => s + l.dailyExpense, 0);
    const totalHotel = validLegs.reduce((s, l) => s + l.hotelExpense, 0);
    const grandTotal = totalDaily + totalHotel;
    const totalDays = validLegs.reduce((s, l) => s + l.numDays, 0);
    return { legs: validLegs, totalDaily, totalHotel, grandTotal, totalDays };
  }, [legs, REGIONS]);

  const addLeg = () => {
    setLegs([...legs, { id: nextId++, regionIndex: 0, days: "" }]);
  };

  const removeLeg = (id: number) => {
    if (legs.length <= 1) return;
    setLegs(legs.filter((l) => l.id !== id));
  };

  const updateLeg = (id: number, field: "regionIndex" | "days", value: string | number) => {
    setLegs(legs.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const hasResult = mode === "single" ? !!singleResult : !!multiResult;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=labor" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "vacation-pay", "severance-pay", "overtime"]}
    >
      {/* Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          {pt.modeQuestion}
        </label>
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "single"
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            {pt.singleRegion}
          </button>
          <button
            onClick={() => setMode("multicity")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "multicity"
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-gray-50"
            }`}
          >
            {pt.multicity}
          </button>
        </div>
      </div>

      {/* ── SINGLE MODE ── */}
      {mode === "single" && (
        <>
          {/* Region Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              {pt.selectRegion}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REGIONS.map((region, i) => (
                <button
                  key={i}
                  onClick={() => setRegionIndex(i)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all ${
                    regionIndex === i
                      ? "border-primary bg-primary-light ring-2 ring-primary/20"
                      : "border-border bg-white hover:border-primary/30"
                  }`}
                >
                  <span className={`block text-sm font-medium ${regionIndex === i ? "text-primary" : "text-foreground"}`}>
                    {region.label}
                  </span>
                  <span className={`block text-xs mt-0.5 ${regionIndex === i ? "text-primary" : "text-muted"}`}>
                    {pt.normLabel} {region.norm} AZN
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Days Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              {pt.daysQuestion}
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder={pt.daysPlaceholder}
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[2, 3, 5, 7, 10, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d.toString())}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                    days === d.toString()
                      ? "border-primary bg-primary-light text-primary font-medium"
                      : "border-border bg-white text-muted hover:border-primary/30"
                  }`}
                >
                  {d} {pt.daysUnit}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── MULTICITY MODE ── */}
      {mode === "multicity" && (
        <>
          <div className="mb-4">
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-6">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <span>&#8505;&#65039;</span>
                {pt.multicityInfo}
              </p>
            </div>

            <div className="space-y-4">
              {legs.map((leg, idx) => (
                <div key={leg.id} className="bg-gray-50 rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">
                      {pt.routeLabel} #{idx + 1}
                    </span>
                    {legs.length > 1 && (
                      <button
                        onClick={() => removeLeg(leg.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        {pt.removeRoute}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted mb-1">{pt.regionLabel}</label>
                      <select
                        value={leg.regionIndex}
                        onChange={(e) => updateLeg(leg.id, "regionIndex", parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      >
                        {REGIONS.map((r, i) => (
                          <option key={i} value={i}>
                            {r.label} ({r.norm} AZN)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">{pt.daysLabel}</label>
                      <input
                        type="number"
                        value={leg.days}
                        onChange={(e) => updateLeg(leg.id, "days", e.target.value)}
                        placeholder={pt.daysInputPlaceholder}
                        min="1"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addLeg}
              className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm hover:bg-primary-light hover:border-primary/50 transition-all"
            >
              {pt.addRoute}
            </button>
          </div>
        </>
      )}

      {/* Taxi Note */}
      {hasResult && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <span>&#128661;</span>
            {pt.taxiNote}
          </p>
        </div>
      )}

      {/* ── SINGLE RESULTS ── */}
      {mode === "single" && singleResult && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.totalAmount}</p>
            <p className="text-3xl font-bold">{formatMoney(singleResult.total)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">{pt.dailyExpense}</p>
              <p className="text-2xl font-bold text-green-700">{formatMoney(singleResult.dailyExpense)}</p>
              <p className="text-xs text-green-600 mt-1">
                {singleResult.norm} × 30% × {singleResult.numDays} {pt.daysUnit}
              </p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
              <p className="text-sm text-purple-600 mb-1">{pt.hotelExpense}</p>
              <p className="text-2xl font-bold text-purple-700">{formatMoney(singleResult.hotelExpense)}</p>
              <p className="text-xs text-purple-600 mt-1">
                {singleResult.norm} × 70% × {singleResult.numDays > 1 ? singleResult.numDays - 1 : 0} {pt.nightUnit}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>&#128202;</span>
                {pt.calculationTable}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.regionRow}</span>
                <span className="text-sm font-medium text-foreground">{REGIONS[regionIndex].label}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.dailyNorm}</span>
                <span className="text-sm font-medium text-foreground">{singleResult.norm} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.daysCount}</span>
                <span className="text-sm font-medium text-foreground">{singleResult.numDays} {pt.daysUnit}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-green-50">
                <span className="text-sm font-semibold text-green-700">{pt.dailyExpense} ({singleResult.norm} × 30% × {singleResult.numDays})</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(singleResult.dailyExpense)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-purple-50">
                <span className="text-sm font-semibold text-purple-700">{pt.hotelExpense} ({singleResult.norm} × 70% × {singleResult.numDays > 1 ? singleResult.numDays - 1 : 0})</span>
                <span className="text-sm font-bold text-purple-700">{formatMoney(singleResult.hotelExpense)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.totalAmountLabel}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(singleResult.total)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MULTICITY RESULTS ── */}
      {mode === "multicity" && multiResult && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.overallTotal} ({multiResult.totalDays} {pt.daysUnit})</p>
            <p className="text-3xl font-bold">{formatMoney(multiResult.grandTotal)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">{pt.overallDailyExpense}</p>
              <p className="text-2xl font-bold text-green-700">{formatMoney(multiResult.totalDaily)}</p>
              <p className="text-xs text-green-600 mt-1">{pt.allRoutes}</p>
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
              <p className="text-sm text-purple-600 mb-1">{pt.overallHotelExpense}</p>
              <p className="text-2xl font-bold text-purple-700">{formatMoney(multiResult.totalHotel)}</p>
              <p className="text-xs text-purple-600 mt-1">{pt.allRoutes}</p>
            </div>
          </div>

          {/* Per-leg breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>&#128202;</span>
                {pt.routeBreakdown}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {multiResult.legs.map((leg, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">
                      #{i + 1} {leg.regionLabel}
                    </span>
                    <span className="text-sm font-bold text-primary">{formatMoney(leg.total)} AZN</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                    <span>{pt.dailyLabel} {leg.norm} × 30% × {leg.numDays} = {formatMoney(leg.dailyExpense)} AZN</span>
                    <span>{pt.hotelLabel} {leg.norm} × 70% × {leg.numDays > 1 ? leg.numDays - 1 : 0} = {formatMoney(leg.hotelExpense)} AZN</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.grandTotal}</span>
                <span className="text-sm font-bold text-primary">{formatMoney(multiResult.grandTotal)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasResult && (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">&#9992;&#65039;</span>
          <p>
            {mode === "single" ? pt.emptyStateSingle : pt.emptyStateMulti}
          </p>
        </div>
      )}
    </CalculatorLayout>
  );
}
