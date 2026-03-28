"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";

interface ActivityLevel {
  id: string;
  label: string;
  factor: number;
  icon: string;
  description: string;
}

interface GoalOption {
  value: Goal;
  label: string;
  icon: string;
  description: string;
  adjustment: number;
}

interface MacroSplit {
  label: string;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

interface MealOption {
  label: string;
  percent: number;
  icon: string;
  time: string;
}

const activityLevelsTranslations: Record<Lang, ActivityLevel[]> = {
  az: [
    { id: "sedentary", label: "Oturaq", factor: 1.2, icon: "\u{1FA91}", description: "Masa arxasinda is, az hereket" },
    { id: "light", label: "Yungul", factor: 1.375, icon: "\u{1F6B6}", description: "Heftede 1\u20133 gun yungul idman" },
    { id: "moderate", label: "Orta", factor: 1.55, icon: "\u{1F3C3}", description: "Heftede 3\u20135 gun orta intensiv idman" },
    { id: "active", label: "Aktiv", factor: 1.725, icon: "\u{1F3CB}\uFE0F", description: "Heftede 6\u20137 gun agir idman" },
    { id: "very_active", label: "Cox aktiv", factor: 1.9, icon: "\u26A1", description: "Gunde 2 defe idman / fiziki is" },
  ],
  en: [
    { id: "sedentary", label: "Sedentary", factor: 1.2, icon: "\u{1FA91}", description: "Desk job, little movement" },
    { id: "light", label: "Light", factor: 1.375, icon: "\u{1F6B6}", description: "Light exercise 1\u20133 days/week" },
    { id: "moderate", label: "Moderate", factor: 1.55, icon: "\u{1F3C3}", description: "Moderate exercise 3\u20135 days/week" },
    { id: "active", label: "Active", factor: 1.725, icon: "\u{1F3CB}\uFE0F", description: "Heavy exercise 6\u20137 days/week" },
    { id: "very_active", label: "Very active", factor: 1.9, icon: "\u26A1", description: "2x daily exercise / physical labor" },
  ],
  ru: [
    { id: "sedentary", label: "\u0421\u0438\u0434\u044F\u0447\u0438\u0439", factor: 1.2, icon: "\u{1FA91}", description: "\u041E\u0444\u0438\u0441\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430, \u043C\u0430\u043B\u043E \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F" },
    { id: "light", label: "\u041B\u0451\u0433\u043A\u0438\u0439", factor: 1.375, icon: "\u{1F6B6}", description: "\u041B\u0451\u0433\u043A\u0438\u0435 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 1\u20133 \u0434\u043D\u044F/\u043D\u0435\u0434\u0435\u043B\u044E" },
    { id: "moderate", label: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439", factor: 1.55, icon: "\u{1F3C3}", description: "\u0423\u043C\u0435\u0440\u0435\u043D\u043D\u044B\u0435 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 3\u20135 \u0434\u043D\u0435\u0439/\u043D\u0435\u0434\u0435\u043B\u044E" },
    { id: "active", label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439", factor: 1.725, icon: "\u{1F3CB}\uFE0F", description: "\u0422\u044F\u0436\u0451\u043B\u044B\u0435 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 6\u20137 \u0434\u043D\u0435\u0439/\u043D\u0435\u0434\u0435\u043B\u044E" },
    { id: "very_active", label: "\u041E\u0447\u0435\u043D\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439", factor: 1.9, icon: "\u26A1", description: "2 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438/\u0434\u0435\u043D\u044C \u0438\u043B\u0438 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u0440\u0443\u0434" },
  ],
};

const goalsTranslations: Record<Lang, GoalOption[]> = {
  az: [
    { value: "lose", label: "Ariqlamaq", icon: "\u{1F4C9}", description: "Heftede ~0.5 kq itirmek", adjustment: -500 },
    { value: "maintain", label: "Cekini saxlamaq", icon: "\u2696\uFE0F", description: "Hazirki cekini qorumaq", adjustment: 0 },
    { value: "gain", label: "Kilo almaq", icon: "\u{1F4C8}", description: "Heftede ~0.5 kq artirmaq", adjustment: 500 },
  ],
  en: [
    { value: "lose", label: "Lose weight", icon: "\u{1F4C9}", description: "Lose ~0.5 kg per week", adjustment: -500 },
    { value: "maintain", label: "Maintain weight", icon: "\u2696\uFE0F", description: "Keep current weight", adjustment: 0 },
    { value: "gain", label: "Gain weight", icon: "\u{1F4C8}", description: "Gain ~0.5 kg per week", adjustment: 500 },
  ],
  ru: [
    { value: "lose", label: "\u041F\u043E\u0445\u0443\u0434\u0435\u0442\u044C", icon: "\u{1F4C9}", description: "\u0422\u0435\u0440\u044F\u0442\u044C ~0.5 \u043A\u0433 \u0432 \u043D\u0435\u0434\u0435\u043B\u044E", adjustment: -500 },
    { value: "maintain", label: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0442\u044C \u0432\u0435\u0441", icon: "\u2696\uFE0F", description: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0432\u0435\u0441", adjustment: 0 },
    { value: "gain", label: "\u041D\u0430\u0431\u0440\u0430\u0442\u044C \u0432\u0435\u0441", icon: "\u{1F4C8}", description: "\u041D\u0430\u0431\u0438\u0440\u0430\u0442\u044C ~0.5 \u043A\u0433 \u0432 \u043D\u0435\u0434\u0435\u043B\u044E", adjustment: 500 },
  ],
};

const macroSplitsTranslations: Record<Lang, MacroSplit[]> = {
  az: [
    { label: "Balanslasdirilmis", protein: 30, carbs: 40, fat: 30, description: "Umumi saglamliq ucun" },
    { label: "Yuksek protein", protein: 40, carbs: 30, fat: 30, description: "Ezele artimi / ariqlamaq" },
    { label: "Asagi karbohidrat", protein: 30, carbs: 20, fat: 50, description: "Keto / low-carb rejimi" },
    { label: "Yuksek karbohidrat", protein: 20, carbs: 55, fat: 25, description: "Dozumluluk idmanlari" },
  ],
  en: [
    { label: "Balanced", protein: 30, carbs: 40, fat: 30, description: "For general health" },
    { label: "High protein", protein: 40, carbs: 30, fat: 30, description: "Muscle gain / weight loss" },
    { label: "Low carb", protein: 30, carbs: 20, fat: 50, description: "Keto / low-carb diet" },
    { label: "High carb", protein: 20, carbs: 55, fat: 25, description: "Endurance training" },
  ],
  ru: [
    { label: "\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435", protein: 30, carbs: 40, fat: 30, description: "\u0414\u043B\u044F \u043E\u0431\u0449\u0435\u0433\u043E \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044F" },
    { label: "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u0431\u0435\u043B\u043E\u043A", protein: 40, carbs: 30, fat: 30, description: "\u041D\u0430\u0431\u043E\u0440 \u043C\u044B\u0448\u0446 / \u043F\u043E\u0445\u0443\u0434\u0435\u043D\u0438\u0435" },
    { label: "\u041D\u0438\u0437\u043A\u0438\u0435 \u0443\u0433\u043B\u0435\u0432\u043E\u0434\u044B", protein: 30, carbs: 20, fat: 50, description: "\u041A\u0435\u0442\u043E / \u043D\u0438\u0437\u043A\u043E\u0443\u0433\u043B\u0435\u0432\u043E\u0434\u043D\u0430\u044F \u0434\u0438\u0435\u0442\u0430" },
    { label: "\u0412\u044B\u0441\u043E\u043A\u0438\u0435 \u0443\u0433\u043B\u0435\u0432\u043E\u0434\u044B", protein: 20, carbs: 55, fat: 25, description: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 \u043D\u0430 \u0432\u044B\u043D\u043E\u0441\u043B\u0438\u0432\u043E\u0441\u0442\u044C" },
  ],
};

const mealsTranslations: Record<Lang, MealOption[]> = {
  az: [
    { label: "Seher yemeyi", percent: 25, icon: "\u{1F305}", time: "07:00\u201309:00" },
    { label: "Ara qelyanalti", percent: 10, icon: "\u{1F34E}", time: "10:30\u201311:00" },
    { label: "Nahar", percent: 35, icon: "\u2600\uFE0F", time: "12:30\u201314:00" },
    { label: "Ara qelyanalti", percent: 10, icon: "\u{1F95C}", time: "16:00\u201316:30" },
    { label: "Sam yemeyi", percent: 20, icon: "\u{1F319}", time: "19:00\u201320:00" },
  ],
  en: [
    { label: "Breakfast", percent: 25, icon: "\u{1F305}", time: "07:00\u201309:00" },
    { label: "Snack", percent: 10, icon: "\u{1F34E}", time: "10:30\u201311:00" },
    { label: "Lunch", percent: 35, icon: "\u2600\uFE0F", time: "12:30\u201314:00" },
    { label: "Snack", percent: 10, icon: "\u{1F95C}", time: "16:00\u201316:30" },
    { label: "Dinner", percent: 20, icon: "\u{1F319}", time: "19:00\u201320:00" },
  ],
  ru: [
    { label: "\u0417\u0430\u0432\u0442\u0440\u0430\u043A", percent: 25, icon: "\u{1F305}", time: "07:00\u201309:00" },
    { label: "\u041F\u0435\u0440\u0435\u043A\u0443\u0441", percent: 10, icon: "\u{1F34E}", time: "10:30\u201311:00" },
    { label: "\u041E\u0431\u0435\u0434", percent: 35, icon: "\u2600\uFE0F", time: "12:30\u201314:00" },
    { label: "\u041F\u0435\u0440\u0435\u043A\u0443\u0441", percent: 10, icon: "\u{1F95C}", time: "16:00\u201316:30" },
    { label: "\u0423\u0436\u0438\u043D", percent: 20, icon: "\u{1F319}", time: "19:00\u201320:00" },
  ],
};

const pageTranslations = {
  az: {
    title: "Kalori hesablayicisi",
    description: "Gundelik kalori ehtiyacinizi, makronutrient paylanmanizi ve su normanizi hesablayin.",
    breadcrumbCategory: "Saglamliq",
    formulaTitle: "Kalori ehtiyaci nece hesablanir?",
    formulaContent: `BMR (Bazal Metabolizm Derecesi) \u2014 Mifflin-St Jeor dusturu:
Kisi: BMR = 10 \u00D7 ceki(kq) + 6.25 \u00D7 boy(sm) \u2212 5 \u00D7 yas + 5
Qadin: BMR = 10 \u00D7 ceki(kq) + 6.25 \u00D7 boy(sm) \u2212 5 \u00D7 yas \u2212 161

TDEE (Umumi Gundelik Enerji Xerci):
TDEE = BMR \u00D7 Aktivlik emsali

Aktivlik emsallari:
\u2022 Oturaq: \u00D71.2
\u2022 Yungul: \u00D71.375
\u2022 Orta: \u00D71.55
\u2022 Aktiv: \u00D71.725
\u2022 Cox aktiv: \u00D71.9

Hedef kalori:
\u2022 Ariqlamaq: TDEE \u2212 500 kkal (heftede ~0.5 kq)
\u2022 Saxlamaq: TDEE
\u2022 Kilo almaq: TDEE + 500 kkal (heftede ~0.5 kq)

Makronutrientler:
\u2022 1 q protein = 4 kkal
\u2022 1 q karbohidrat = 4 kkal
\u2022 1 q yag = 9 kkal`,
    gender: "Cins",
    male: "Kisi",
    female: "Qadin",
    ageLabel: "Yas",
    heightLabel: "Boy (sm)",
    weightLabel: "Ceki (kq)",
    activityLevel: "Fiziki aktivlik seviyyesi",
    yourGoal: "Hedefimiz",
    dailyTargetCalorie: "Gundelik hedef kalori",
    kcalPerDay: "kkal / gun",
    weeklyChange: "Heftelik deyisiklik",
    bmrAtRest: "BMR (istirahede)",
    tdeeTotal: "TDEE (umumi xerc)",
    waterNorm: "Su normasi",
    literPerDay: "litr / gun",
    macroDistribution: "Makronutrient paylanmasi",
    protein: "Protein",
    carbs: "Karbohidrat",
    fat: "Yag",
    calorieByActivity: "Aktivlik seviyyesine gore kalori ehtiyaci",
    mealBreakdown: "Ogunlere bolgu (tovsiye)",
    formulaComparison: "Dustur muqayisesi",
    moreAccurate: "Daha deqiq (istifade olunan)",
    classicFormula: "Klassik dustur",
    disclaimer: "Diqqet:",
    disclaimerText: "Bu hesablama texmini xarakter dasiyir. Faktiki kalori ehtiyaci metabolizm sureti, genetika, stress seviyyesi ve diger amillere gore ferqlene biler. Ariqlamaq ve ya kilo alma proqramina baslamazdan evvel dietoloqa ve ya hekime muraciet edin. Gundelik kalori 1200 kkal-dan asagi dusmemelidir.",
    emptyStateText: "Neticeni gormek ucun yas, boy ve cekinizi daxil edin.",
  },
  en: {
    title: "Calorie Calculator",
    description: "Calculate your daily calorie needs, macronutrient distribution, and water intake.",
    breadcrumbCategory: "Health",
    formulaTitle: "How are calorie needs calculated?",
    formulaContent: `BMR (Basal Metabolic Rate) \u2014 Mifflin-St Jeor formula:
Male: BMR = 10 \u00D7 weight(kg) + 6.25 \u00D7 height(cm) \u2212 5 \u00D7 age + 5
Female: BMR = 10 \u00D7 weight(kg) + 6.25 \u00D7 height(cm) \u2212 5 \u00D7 age \u2212 161

TDEE (Total Daily Energy Expenditure):
TDEE = BMR \u00D7 Activity factor

Activity factors:
\u2022 Sedentary: \u00D71.2
\u2022 Light: \u00D71.375
\u2022 Moderate: \u00D71.55
\u2022 Active: \u00D71.725
\u2022 Very active: \u00D71.9

Target calories:
\u2022 Lose weight: TDEE \u2212 500 kcal (~0.5 kg/week)
\u2022 Maintain: TDEE
\u2022 Gain weight: TDEE + 500 kcal (~0.5 kg/week)

Macronutrients:
\u2022 1 g protein = 4 kcal
\u2022 1 g carbohydrate = 4 kcal
\u2022 1 g fat = 9 kcal`,
    gender: "Gender",
    male: "Male",
    female: "Female",
    ageLabel: "Age",
    heightLabel: "Height (cm)",
    weightLabel: "Weight (kg)",
    activityLevel: "Physical activity level",
    yourGoal: "Your goal",
    dailyTargetCalorie: "Daily target calories",
    kcalPerDay: "kcal / day",
    weeklyChange: "Weekly change",
    bmrAtRest: "BMR (at rest)",
    tdeeTotal: "TDEE (total expenditure)",
    waterNorm: "Water intake",
    literPerDay: "liters / day",
    macroDistribution: "Macronutrient distribution",
    protein: "Protein",
    carbs: "Carbohydrate",
    fat: "Fat",
    calorieByActivity: "Calorie needs by activity level",
    mealBreakdown: "Meal breakdown (recommended)",
    formulaComparison: "Formula comparison",
    moreAccurate: "More accurate (used)",
    classicFormula: "Classic formula",
    disclaimer: "Disclaimer:",
    disclaimerText: "This calculation is approximate. Actual calorie needs may vary based on metabolic rate, genetics, stress levels, and other factors. Consult a dietitian or doctor before starting a weight loss or gain program. Daily calories should not fall below 1200 kcal.",
    emptyStateText: "Enter your age, height, and weight to see the result.",
  },
  ru: {
    title: "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u043A\u0430\u043B\u043E\u0440\u0438\u0439",
    description: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0441\u0443\u0442\u043E\u0447\u043D\u0443\u044E \u043F\u043E\u0442\u0440\u0435\u0431\u043D\u043E\u0441\u0442\u044C \u0432 \u043A\u0430\u043B\u043E\u0440\u0438\u044F\u0445, \u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043C\u0430\u043A\u0440\u043E\u043D\u0443\u0442\u0440\u0438\u0435\u043D\u0442\u043E\u0432 \u0438 \u043D\u043E\u0440\u043C\u0443 \u0432\u043E\u0434\u044B.",
    breadcrumbCategory: "\u0417\u0434\u043E\u0440\u043E\u0432\u044C\u0435",
    formulaTitle: "\u041A\u0430\u043A \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u043E\u0442\u0440\u0435\u0431\u043D\u043E\u0441\u0442\u044C \u0432 \u043A\u0430\u043B\u043E\u0440\u0438\u044F\u0445?",
    formulaContent: `BMR (\u0411\u0430\u0437\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0435\u0442\u0430\u0431\u043E\u043B\u0438\u0437\u043C) \u2014 \u0444\u043E\u0440\u043C\u0443\u043B\u0430 Mifflin-St Jeor:
\u041C\u0443\u0436\u0447\u0438\u043D\u0430: BMR = 10 \u00D7 \u0432\u0435\u0441(\u043A\u0433) + 6.25 \u00D7 \u0440\u043E\u0441\u0442(\u0441\u043C) \u2212 5 \u00D7 \u0432\u043E\u0437\u0440\u0430\u0441\u0442 + 5
\u0416\u0435\u043D\u0449\u0438\u043D\u0430: BMR = 10 \u00D7 \u0432\u0435\u0441(\u043A\u0433) + 6.25 \u00D7 \u0440\u043E\u0441\u0442(\u0441\u043C) \u2212 5 \u00D7 \u0432\u043E\u0437\u0440\u0430\u0441\u0442 \u2212 161

TDEE (\u041E\u0431\u0449\u0438\u0439 \u0441\u0443\u0442\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0441\u0445\u043E\u0434 \u044D\u043D\u0435\u0440\u0433\u0438\u0438):
TDEE = BMR \u00D7 \u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438

\u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442\u044B \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438:
\u2022 \u0421\u0438\u0434\u044F\u0447\u0438\u0439: \u00D71.2
\u2022 \u041B\u0451\u0433\u043A\u0438\u0439: \u00D71.375
\u2022 \u0421\u0440\u0435\u0434\u043D\u0438\u0439: \u00D71.55
\u2022 \u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439: \u00D71.725
\u2022 \u041E\u0447\u0435\u043D\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439: \u00D71.9

\u0426\u0435\u043B\u0435\u0432\u044B\u0435 \u043A\u0430\u043B\u043E\u0440\u0438\u0438:
\u2022 \u041F\u043E\u0445\u0443\u0434\u0435\u0442\u044C: TDEE \u2212 500 \u043A\u043A\u0430\u043B (~0.5 \u043A\u0433/\u043D\u0435\u0434\u0435\u043B\u044E)
\u2022 \u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0442\u044C: TDEE
\u2022 \u041D\u0430\u0431\u0440\u0430\u0442\u044C: TDEE + 500 \u043A\u043A\u0430\u043B (~0.5 \u043A\u0433/\u043D\u0435\u0434\u0435\u043B\u044E)

\u041C\u0430\u043A\u0440\u043E\u043D\u0443\u0442\u0440\u0438\u0435\u043D\u0442\u044B:
\u2022 1 \u0433 \u0431\u0435\u043B\u043A\u0430 = 4 \u043A\u043A\u0430\u043B
\u2022 1 \u0433 \u0443\u0433\u043B\u0435\u0432\u043E\u0434\u043E\u0432 = 4 \u043A\u043A\u0430\u043B
\u2022 1 \u0433 \u0436\u0438\u0440\u043E\u0432 = 9 \u043A\u043A\u0430\u043B`,
    gender: "\u041F\u043E\u043B",
    male: "\u041C\u0443\u0436\u0447\u0438\u043D\u0430",
    female: "\u0416\u0435\u043D\u0449\u0438\u043D\u0430",
    ageLabel: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442",
    heightLabel: "\u0420\u043E\u0441\u0442 (\u0441\u043C)",
    weightLabel: "\u0412\u0435\u0441 (\u043A\u0433)",
    activityLevel: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438",
    yourGoal: "\u0412\u0430\u0448\u0430 \u0446\u0435\u043B\u044C",
    dailyTargetCalorie: "\u0421\u0443\u0442\u043E\u0447\u043D\u0430\u044F \u0446\u0435\u043B\u0435\u0432\u0430\u044F \u043A\u0430\u043B\u043E\u0440\u0438\u0439\u043D\u043E\u0441\u0442\u044C",
    kcalPerDay: "\u043A\u043A\u0430\u043B / \u0434\u0435\u043D\u044C",
    weeklyChange: "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0437\u0430 \u043D\u0435\u0434\u0435\u043B\u044E",
    bmrAtRest: "BMR (\u0432 \u043F\u043E\u043A\u043E\u0435)",
    tdeeTotal: "TDEE (\u043E\u0431\u0449\u0438\u0439 \u0440\u0430\u0441\u0445\u043E\u0434)",
    waterNorm: "\u041D\u043E\u0440\u043C\u0430 \u0432\u043E\u0434\u044B",
    literPerDay: "\u043B\u0438\u0442\u0440\u043E\u0432 / \u0434\u0435\u043D\u044C",
    macroDistribution: "\u0420\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043C\u0430\u043A\u0440\u043E\u043D\u0443\u0442\u0440\u0438\u0435\u043D\u0442\u043E\u0432",
    protein: "\u0411\u0435\u043B\u043E\u043A",
    carbs: "\u0423\u0433\u043B\u0435\u0432\u043E\u0434\u044B",
    fat: "\u0416\u0438\u0440\u044B",
    calorieByActivity: "\u041F\u043E\u0442\u0440\u0435\u0431\u043D\u043E\u0441\u0442\u044C \u0432 \u043A\u0430\u043B\u043E\u0440\u0438\u044F\u0445 \u043F\u043E \u0443\u0440\u043E\u0432\u043D\u044E \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438",
    mealBreakdown: "\u0420\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u043E \u043F\u0440\u0438\u0451\u043C\u0430\u043C \u043F\u0438\u0449\u0438 (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C\u043E\u0435)",
    formulaComparison: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u0443\u043B",
    moreAccurate: "\u0411\u043E\u043B\u0435\u0435 \u0442\u043E\u0447\u043D\u0430\u044F (\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u0430\u044F)",
    classicFormula: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0444\u043E\u0440\u043C\u0443\u043B\u0430",
    disclaimer: "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435:",
    disclaimerText: "\u042D\u0442\u043E\u0442 \u0440\u0430\u0441\u0447\u0451\u0442 \u043D\u043E\u0441\u0438\u0442 \u043F\u0440\u0438\u0431\u043B\u0438\u0437\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440. \u0424\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u043E\u0442\u0440\u0435\u0431\u043D\u043E\u0441\u0442\u044C \u0432 \u043A\u0430\u043B\u043E\u0440\u0438\u044F\u0445 \u043C\u043E\u0436\u0435\u0442 \u043E\u0442\u043B\u0438\u0447\u0430\u0442\u044C\u0441\u044F \u0432 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 \u043E\u0442 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438 \u043C\u0435\u0442\u0430\u0431\u043E\u043B\u0438\u0437\u043C\u0430, \u0433\u0435\u043D\u0435\u0442\u0438\u043A\u0438, \u0443\u0440\u043E\u0432\u043D\u044F \u0441\u0442\u0440\u0435\u0441\u0441\u0430 \u0438 \u0434\u0440\u0443\u0433\u0438\u0445 \u0444\u0430\u043A\u0442\u043E\u0440\u043E\u0432. \u041F\u0435\u0440\u0435\u0434 \u043D\u0430\u0447\u0430\u043B\u043E\u043C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B \u043F\u043E\u0445\u0443\u0434\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043D\u0430\u0431\u043E\u0440\u0430 \u0432\u0435\u0441\u0430 \u043F\u0440\u043E\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0438\u0440\u0443\u0439\u0442\u0435\u0441\u044C \u0441 \u0434\u0438\u0435\u0442\u043E\u043B\u043E\u0433\u043E\u043C \u0438\u043B\u0438 \u0432\u0440\u0430\u0447\u043E\u043C. \u0421\u0443\u0442\u043E\u0447\u043D\u0430\u044F \u043A\u0430\u043B\u043E\u0440\u0438\u0439\u043D\u043E\u0441\u0442\u044C \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u0430 \u043E\u043F\u0443\u0441\u043A\u0430\u0442\u044C\u0441\u044F \u043D\u0438\u0436\u0435 1200 \u043A\u043A\u0430\u043B.",
    emptyStateText: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u043E\u0437\u0440\u0430\u0441\u0442, \u0440\u043E\u0441\u0442 \u0438 \u0432\u0435\u0441, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.",
  },
};

function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CalorieCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const activityLevels = activityLevelsTranslations[lang];
  const goalOptions = goalsTranslations[lang];
  const macroSplits = macroSplitsTranslations[lang];
  const meals = mealsTranslations[lang];

  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [selectedMacro, setSelectedMacro] = useState(0);

  const result = useMemo(() => {
    const a = parseInt(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(weight);

    if (!a || a <= 0 || !h || h <= 0 || !w || w <= 0) return null;

    // BMR — Mifflin-St Jeor
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const actLevel = activityLevels.find((l) => l.id === activity)!;
    const tdee = bmr * actLevel.factor;

    const goalInfo = goalOptions.find((g) => g.value === goal)!;
    const targetCalories = Math.max(1200, tdee + goalInfo.adjustment);

    const macro = macroSplits[selectedMacro];
    const proteinCal = targetCalories * (macro.protein / 100);
    const carbsCal = targetCalories * (macro.carbs / 100);
    const fatCal = targetCalories * (macro.fat / 100);

    const proteinG = proteinCal / 4;
    const carbsG = carbsCal / 4;
    const fatG = fatCal / 9;

    const waterMl = w * 33;
    const waterL = waterMl / 1000;

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);

    // Harris-Benedict
    let bmrHB: number;
    if (gender === "male") {
      bmrHB = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      bmrHB = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    }
    const tdeeHB = bmrHB * actLevel.factor;

    const weeklyChange = (goalInfo.adjustment * 7) / 7700;

    return {
      bmr,
      bmrHB,
      tdee,
      tdeeHB,
      targetCalories,
      proteinG,
      carbsG,
      fatG,
      proteinCal,
      carbsCal,
      fatCal,
      waterL,
      bmi,
      weeklyChange,
      actLevel,
      goalInfo,
    };
  }, [gender, age, heightCm, weight, activity, goal, selectedMacro, activityLevels, goalOptions, macroSplits]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=health" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["bmi", "ideal-weight", "water-intake", "pregnancy"]}
    >
      {/* Gender */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.gender}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGender("male")}
            className={`p-3 rounded-xl border text-center transition-all ${
              gender === "male"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">{"\u{1F468}"}</span>
            <p className="text-xs font-medium text-foreground">{pt.male}</p>
          </button>
          <button
            onClick={() => setGender("female")}
            className={`p-3 rounded-xl border text-center transition-all ${
              gender === "female"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">{"\u{1F469}"}</span>
            <p className="text-xs font-medium text-foreground">{pt.female}</p>
          </button>
        </div>
      </div>

      {/* Body Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{"\u{1F382}"} {pt.ageLabel}</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="30"
            min="2"
            max="120"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{"\u{1F4CF}"} {pt.heightLabel}</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="175"
            min="50"
            max="250"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{"\u2696\uFE0F"} {pt.weightLabel}</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="75"
            min="20"
            max="300"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Activity Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.activityLevel}</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {activityLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setActivity(level.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                activity === level.id
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{level.icon}</span>
              <p className="text-xs font-medium text-foreground">{level.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{"\u00D7"}{level.factor}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          {activityLevels.find((l) => l.id === activity)?.description}
        </p>
      </div>

      {/* Goal */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.yourGoal}</label>
        <div className="grid grid-cols-3 gap-3">
          {goalOptions.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`p-4 rounded-xl border text-center transition-all ${
                goal === g.value
                  ? g.value === "lose"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                    : g.value === "maintain"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                    : "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{g.icon}</span>
              <p className="text-sm font-medium text-foreground">{g.label}</p>
              <p className="text-xs text-muted mt-1">{g.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main Result */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">{pt.dailyTargetCalorie}</p>
            <p className="text-5xl font-bold">{fmt(result.targetCalories)}</p>
            <p className="text-sm text-blue-200 mt-1">{pt.kcalPerDay}</p>
            {goal !== "maintain" && (
              <p className="text-xs text-blue-300 mt-2">
                {goal === "lose" ? "\u{1F4C9}" : "\u{1F4C8}"} {pt.weeklyChange}: {result.weeklyChange > 0 ? "+" : ""}{result.weeklyChange.toFixed(2)} kg
              </p>
            )}
          </div>

          {/* BMR & TDEE Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.bmrAtRest}</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.bmr)}</p>
              <p className="text-xs text-muted mt-1">{pt.kcalPerDay}</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 text-center">
              <p className="text-xs text-amber-600 mb-1">{pt.tdeeTotal}</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.tdee)}</p>
              <p className="text-xs text-amber-600 mt-1">{pt.kcalPerDay}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-5 text-center">
              <p className="text-xs text-cyan-600 mb-1">{pt.waterNorm}</p>
              <p className="text-2xl font-bold text-cyan-700">{result.waterL.toFixed(1)}</p>
              <p className="text-xs text-cyan-600 mt-1">{pt.literPerDay}</p>
            </div>
          </div>

          {/* Macro Distribution */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{"\u{1F957}"}</span>
                {pt.macroDistribution}
              </h3>
            </div>

            {/* Macro Type Selection */}
            <div className="px-5 py-3 border-b border-border">
              <div className="flex gap-2 flex-wrap">
                {macroSplits.map((m, i) => (
                  <button
                    key={m.label}
                    onClick={() => setSelectedMacro(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedMacro === i
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-muted hover:bg-gray-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">{macroSplits[selectedMacro].description}</p>
            </div>

            {/* Macro Bar */}
            <div className="px-5 py-4">
              <div className="w-full h-6 rounded-full overflow-hidden flex mb-3">
                <div className="h-full bg-red-400" style={{ width: `${macroSplits[selectedMacro].protein}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${macroSplits[selectedMacro].carbs}%` }} />
                <div className="h-full bg-blue-400" style={{ width: `${macroSplits[selectedMacro].fat}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="text-xs text-muted">{pt.protein}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{Math.round(result.proteinG)}g</p>
                  <p className="text-xs text-muted">{fmt(result.proteinCal)} kkal ({macroSplits[selectedMacro].protein}%)</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="text-xs text-muted">{pt.carbs}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{Math.round(result.carbsG)}g</p>
                  <p className="text-xs text-muted">{fmt(result.carbsCal)} kkal ({macroSplits[selectedMacro].carbs}%)</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                    <span className="text-xs text-muted">{pt.fat}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{Math.round(result.fatG)}g</p>
                  <p className="text-xs text-muted">{fmt(result.fatCal)} kkal ({macroSplits[selectedMacro].fat}%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calorie by Activity */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{"\u{1F4CA}"}</span>
                {pt.calorieByActivity}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {activityLevels.map((level) => {
                const tdee = result.bmr * level.factor;
                const target = Math.max(1200, tdee + result.goalInfo.adjustment);
                const isActive = level.id === activity;
                return (
                  <div key={level.id} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{level.icon}</span>
                      <div>
                        <p className={`text-sm ${isActive ? "font-semibold" : ""} text-foreground`}>{level.label}</p>
                        <p className="text-xs text-muted">{level.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{fmt(target)} kkal</p>
                      <p className="text-xs text-muted">TDEE: {fmt(tdee)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meal Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{"\u{1F37D}\uFE0F"}</span>
                {pt.mealBreakdown}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {meals.map((meal) => (
                <div key={meal.label + meal.time} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span>{meal.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{meal.label}</p>
                      <p className="text-xs text-muted">{meal.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{fmt(result.targetCalories * meal.percent / 100)} kkal</p>
                    <p className="text-xs text-muted">{meal.percent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formula Comparison */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.formulaComparison}</p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted mb-1">Mifflin-St Jeor</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.bmr)} kkal</p>
                <p className="text-xs text-green-600">{pt.moreAccurate}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted mb-1">Harris-Benedict</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.bmrHB)} kkal</p>
                <p className="text-xs text-muted">{pt.classicFormula}</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.disclaimer}</span> {pt.disclaimerText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">{"\u{1F525}"}</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
