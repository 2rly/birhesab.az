"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type Gender = "male" | "female";
type Unit = "metric" | "imperial";

interface BmiCategory {
  label: string;
  range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  description: string;
}

const bmiCategoriesTranslations: Record<Lang, BmiCategory[]> = {
  az: [
    { label: "Ceki catismazligi", range: "< 18.5", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", emoji: "\u{1F535}", description: "Normal cekiden asagi \u2014 qidalanma rejimini yaxsilasdirin" },
    { label: "Normal ceki", range: "18.5 \u2013 24.9", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200", emoji: "\u{1F7E2}", description: "Saglam ceki \u2014 bu cekini qorumaga calisin" },
    { label: "Artiq ceki", range: "25.0 \u2013 29.9", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", emoji: "\u{1F7E1}", description: "Normaldan yuxari \u2014 fiziki aktivliyi artirin" },
    { label: "I derece piylenme", range: "30.0 \u2013 34.9", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", emoji: "\u{1F7E0}", description: "Mulayim piylenme \u2014 hekim mesleheti tovsiye olunur" },
    { label: "II derece piylenme", range: "35.0 \u2013 39.9", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", emoji: "\u{1F534}", description: "Ciddi piylenme \u2014 tibbi mudaxile lazim ola biler" },
    { label: "III derece piylenme", range: "\u2265 40.0", color: "text-red-800", bgColor: "bg-red-100", borderColor: "border-red-300", emoji: "\u26D4", description: "Agir piylenme \u2014 mutleq hekim nezareti" },
  ],
  en: [
    { label: "Underweight", range: "< 18.5", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", emoji: "\u{1F535}", description: "Below normal weight \u2014 improve your diet" },
    { label: "Normal weight", range: "18.5 \u2013 24.9", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200", emoji: "\u{1F7E2}", description: "Healthy weight \u2014 try to maintain it" },
    { label: "Overweight", range: "25.0 \u2013 29.9", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", emoji: "\u{1F7E1}", description: "Above normal \u2014 increase physical activity" },
    { label: "Obesity class I", range: "30.0 \u2013 34.9", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", emoji: "\u{1F7E0}", description: "Moderate obesity \u2014 medical advice recommended" },
    { label: "Obesity class II", range: "35.0 \u2013 39.9", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", emoji: "\u{1F534}", description: "Severe obesity \u2014 medical intervention may be needed" },
    { label: "Obesity class III", range: "\u2265 40.0", color: "text-red-800", bgColor: "bg-red-100", borderColor: "border-red-300", emoji: "\u26D4", description: "Morbid obesity \u2014 medical supervision required" },
  ],
  ru: [
    { label: "\u0414\u0435\u0444\u0438\u0446\u0438\u0442 \u0432\u0435\u0441\u0430", range: "< 18.5", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", emoji: "\u{1F535}", description: "\u041D\u0438\u0436\u0435 \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0432\u0435\u0441\u0430 \u2014 \u0443\u043B\u0443\u0447\u0448\u0438\u0442\u0435 \u0440\u0435\u0436\u0438\u043C \u043F\u0438\u0442\u0430\u043D\u0438\u044F" },
    { label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0432\u0435\u0441", range: "18.5 \u2013 24.9", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200", emoji: "\u{1F7E2}", description: "\u0417\u0434\u043E\u0440\u043E\u0432\u044B\u0439 \u0432\u0435\u0441 \u2014 \u0441\u0442\u0430\u0440\u0430\u0439\u0442\u0435\u0441\u044C \u0435\u0433\u043E \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0442\u044C" },
    { label: "\u0418\u0437\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0439 \u0432\u0435\u0441", range: "25.0 \u2013 29.9", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", emoji: "\u{1F7E1}", description: "\u0412\u044B\u0448\u0435 \u043D\u043E\u0440\u043C\u044B \u2014 \u0443\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C" },
    { label: "\u041E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 I \u0441\u0442\u0435\u043F\u0435\u043D\u0438", range: "30.0 \u2013 34.9", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", emoji: "\u{1F7E0}", description: "\u0423\u043C\u0435\u0440\u0435\u043D\u043D\u043E\u0435 \u043E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 \u2014 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F \u0432\u0440\u0430\u0447\u0430" },
    { label: "\u041E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 II \u0441\u0442\u0435\u043F\u0435\u043D\u0438", range: "35.0 \u2013 39.9", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", emoji: "\u{1F534}", description: "\u0422\u044F\u0436\u0451\u043B\u043E\u0435 \u043E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 \u2014 \u043C\u043E\u0436\u0435\u0442 \u043F\u043E\u0442\u0440\u0435\u0431\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0441\u043A\u043E\u0435 \u0432\u043C\u0435\u0448\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E" },
    { label: "\u041E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 III \u0441\u0442\u0435\u043F\u0435\u043D\u0438", range: "\u2265 40.0", color: "text-red-800", bgColor: "bg-red-100", borderColor: "border-red-300", emoji: "\u26D4", description: "\u041C\u043E\u0440\u0431\u0438\u0434\u043D\u043E\u0435 \u043E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 \u2014 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0435 \u0432\u0440\u0430\u0447\u0430" },
  ],
};

const pageTranslations = {
  az: {
    title: "BMI hesablayicisi",
    description: "Beden kutle indeksinizi hesablayin ve saglamliq kateqoriyanizi oyrenin.",
    breadcrumbCategory: "Saglamliq",
    formulaTitle: "BMI nece hesablanir?",
    formulaContent: `BMI = Ceki (kq) \u00F7 Boy\u00B2 (m)

Meselen: 75 kq, 175 sm \u2192 BMI = 75 \u00F7 1.75\u00B2 = 75 \u00F7 3.0625 = 24.5

Kateqoriyalar (\u00DCST \u2014 \u00DCmumdunya Sehiyye Teskilati):
\u2022 < 18.5 \u2014 Ceki catismazligi
\u2022 18.5\u201324.9 \u2014 Normal ceki
\u2022 25.0\u201329.9 \u2014 Artiq ceki
\u2022 30.0\u201334.9 \u2014 I derece piylenme
\u2022 35.0\u201339.9 \u2014 II derece piylenme
\u2022 \u2265 40.0 \u2014 III derece piylenme

Qeyd: BMI ezele kutlesini, yasi ve cinsi nezere almir.
Buna gore idmancilar ve yaslarda netice ferqli ola biler.`,
    metricUnit: "Metrik (kq, sm)",
    imperialUnit: "Imperial (lbs, ft)",
    gender: "Cins",
    male: "Kisi",
    female: "Qadin",
    heightLabel: "Boy (sm)",
    heightLabelImperial: "Boy",
    weightLabel: "Ceki (kq)",
    weightLabelImperial: "Ceki (lbs)",
    foot: "fut",
    inch: "duym",
    ageLabel: "Yas",
    ageOptional: "ixtiyari",
    yourBmi: "Sizin BMI gostericiniz",
    bmiScale: "BMI skalasi",
    idealWeightRange: "Ideal ceki araligi",
    bmiPrime: "BMI Prime",
    normal: "Normal",
    aboveNormal: "Normaldan yuxari",
    basalMetabolism: "Bazal metabolizm (BMR)",
    kcalPerDay: "kkal / gun",
    kg: "kq",
    gainWeight: "Normal cekiye catmaq ucun artirin",
    loseWeight: "Normal cekiye dusmek ucun azaldin",
    bmiCategories: "BMI kateqoriyalari (\u00DCST)",
    you: "Siz",
    weightTableFor: "sm boy ucun ceki cedveli",
    dailyCalorieNeeds: "Gundelik kalori ehtiyaci (BMR esasinda)",
    sedentary: "Oturaq heyat terzi",
    sedentaryDesc: "Az ve ya hec hereket yox",
    lightActivity: "Yungul aktivlik",
    lightActivityDesc: "Heftede 1\u20133 gun idman",
    moderateActivity: "Orta aktivlik",
    moderateActivityDesc: "Heftede 3\u20135 gun idman",
    highActivity: "Yuksek aktivlik",
    highActivityDesc: "Heftede 6\u20137 gun idman",
    veryHighActivity: "Cox yuksek aktivlik",
    veryHighActivityDesc: "Gunde 2 defe idman / agir fiziki is",
    disclaimer: "Diqqet:",
    disclaimerText: "BMI umumi gostericdir ve ezele kutlesi, sumuk qurulusu, yas ve cins kimi ferdi amilleri nezere almir. Idmancilar ve hamile qadinlarda netice deqiq olmaya biler. Saglamliq qerarlari ucun hekime muraciet edin.",
    emptyStateText: "Neticeni gormek ucun boy ve cekinizi daxil edin.",
  },
  en: {
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index and find out your health category.",
    breadcrumbCategory: "Health",
    formulaTitle: "How is BMI calculated?",
    formulaContent: `BMI = Weight (kg) \u00F7 Height\u00B2 (m)

Example: 75 kg, 175 cm \u2192 BMI = 75 \u00F7 1.75\u00B2 = 75 \u00F7 3.0625 = 24.5

Categories (WHO \u2014 World Health Organization):
\u2022 < 18.5 \u2014 Underweight
\u2022 18.5\u201324.9 \u2014 Normal weight
\u2022 25.0\u201329.9 \u2014 Overweight
\u2022 30.0\u201334.9 \u2014 Obesity class I
\u2022 35.0\u201339.9 \u2014 Obesity class II
\u2022 \u2265 40.0 \u2014 Obesity class III

Note: BMI does not account for muscle mass, age, or gender.
Therefore, results may differ for athletes and elderly people.`,
    metricUnit: "Metric (kg, cm)",
    imperialUnit: "Imperial (lbs, ft)",
    gender: "Gender",
    male: "Male",
    female: "Female",
    heightLabel: "Height (cm)",
    heightLabelImperial: "Height",
    weightLabel: "Weight (kg)",
    weightLabelImperial: "Weight (lbs)",
    foot: "ft",
    inch: "in",
    ageLabel: "Age",
    ageOptional: "optional",
    yourBmi: "Your BMI score",
    bmiScale: "BMI scale",
    idealWeightRange: "Ideal weight range",
    bmiPrime: "BMI Prime",
    normal: "Normal",
    aboveNormal: "Above normal",
    basalMetabolism: "Basal metabolism (BMR)",
    kcalPerDay: "kcal / day",
    kg: "kg",
    gainWeight: "Gain to reach normal weight",
    loseWeight: "Lose to reach normal weight",
    bmiCategories: "BMI categories (WHO)",
    you: "You",
    weightTableFor: "cm height weight table",
    dailyCalorieNeeds: "Daily calorie needs (based on BMR)",
    sedentary: "Sedentary lifestyle",
    sedentaryDesc: "Little or no movement",
    lightActivity: "Light activity",
    lightActivityDesc: "Exercise 1\u20133 days/week",
    moderateActivity: "Moderate activity",
    moderateActivityDesc: "Exercise 3\u20135 days/week",
    highActivity: "High activity",
    highActivityDesc: "Exercise 6\u20137 days/week",
    veryHighActivity: "Very high activity",
    veryHighActivityDesc: "2x daily exercise / heavy physical work",
    disclaimer: "Disclaimer:",
    disclaimerText: "BMI is a general indicator and does not account for individual factors such as muscle mass, bone structure, age, and gender. Results may be inaccurate for athletes and pregnant women. Consult a doctor for health decisions.",
    emptyStateText: "Enter your height and weight to see the result.",
  },
  ru: {
    title: "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0418\u041C\u0422",
    description: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0438\u043D\u0434\u0435\u043A\u0441 \u043C\u0430\u0441\u0441\u044B \u0442\u0435\u043B\u0430 \u0438 \u0443\u0437\u043D\u0430\u0439\u0442\u0435 \u0441\u0432\u043E\u044E \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044F.",
    breadcrumbCategory: "\u0417\u0434\u043E\u0440\u043E\u0432\u044C\u0435",
    formulaTitle: "\u041A\u0430\u043A \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0418\u041C\u0422?",
    formulaContent: `\u0418\u041C\u0422 = \u0412\u0435\u0441 (\u043A\u0433) \u00F7 \u0420\u043E\u0441\u0442\u00B2 (\u043C)

\u041F\u0440\u0438\u043C\u0435\u0440: 75 \u043A\u0433, 175 \u0441\u043C \u2192 \u0418\u041C\u0422 = 75 \u00F7 1.75\u00B2 = 75 \u00F7 3.0625 = 24.5

\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 (\u0412\u041E\u0417 \u2014 \u0412\u0441\u0435\u043C\u0438\u0440\u043D\u0430\u044F \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0437\u0434\u0440\u0430\u0432\u043E\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F):
\u2022 < 18.5 \u2014 \u0414\u0435\u0444\u0438\u0446\u0438\u0442 \u0432\u0435\u0441\u0430
\u2022 18.5\u201324.9 \u2014 \u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0432\u0435\u0441
\u2022 25.0\u201329.9 \u2014 \u0418\u0437\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0439 \u0432\u0435\u0441
\u2022 30.0\u201334.9 \u2014 \u041E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 I \u0441\u0442\u0435\u043F\u0435\u043D\u0438
\u2022 35.0\u201339.9 \u2014 \u041E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 II \u0441\u0442\u0435\u043F\u0435\u043D\u0438
\u2022 \u2265 40.0 \u2014 \u041E\u0436\u0438\u0440\u0435\u043D\u0438\u0435 III \u0441\u0442\u0435\u043F\u0435\u043D\u0438

\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435: \u0418\u041C\u0422 \u043D\u0435 \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442 \u043C\u044B\u0448\u0435\u0447\u043D\u0443\u044E \u043C\u0430\u0441\u0441\u0443, \u0432\u043E\u0437\u0440\u0430\u0441\u0442 \u0438 \u043F\u043E\u043B.
\u041F\u043E\u044D\u0442\u043E\u043C\u0443 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u043C\u043E\u0433\u0443\u0442 \u043E\u0442\u043B\u0438\u0447\u0430\u0442\u044C\u0441\u044F \u0434\u043B\u044F \u0441\u043F\u043E\u0440\u0442\u0441\u043C\u0435\u043D\u043E\u0432 \u0438 \u043F\u043E\u0436\u0438\u043B\u044B\u0445 \u043B\u044E\u0434\u0435\u0439.`,
    metricUnit: "\u041C\u0435\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0430\u044F (\u043A\u0433, \u0441\u043C)",
    imperialUnit: "\u0418\u043C\u043F\u0435\u0440\u0441\u043A\u0430\u044F (lbs, ft)",
    gender: "\u041F\u043E\u043B",
    male: "\u041C\u0443\u0436\u0447\u0438\u043D\u0430",
    female: "\u0416\u0435\u043D\u0449\u0438\u043D\u0430",
    heightLabel: "\u0420\u043E\u0441\u0442 (\u0441\u043C)",
    heightLabelImperial: "\u0420\u043E\u0441\u0442",
    weightLabel: "\u0412\u0435\u0441 (\u043A\u0433)",
    weightLabelImperial: "\u0412\u0435\u0441 (lbs)",
    foot: "\u0444\u0443\u0442",
    inch: "\u0434\u044E\u0439\u043C",
    ageLabel: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442",
    ageOptional: "\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E",
    yourBmi: "\u0412\u0430\u0448 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C \u0418\u041C\u0422",
    bmiScale: "\u0428\u043A\u0430\u043B\u0430 \u0418\u041C\u0422",
    idealWeightRange: "\u0418\u0434\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0432\u0435\u0441\u0430",
    bmiPrime: "BMI Prime",
    normal: "\u041D\u043E\u0440\u043C\u0430",
    aboveNormal: "\u0412\u044B\u0448\u0435 \u043D\u043E\u0440\u043C\u044B",
    basalMetabolism: "\u0411\u0430\u0437\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0435\u0442\u0430\u0431\u043E\u043B\u0438\u0437\u043C (BMR)",
    kcalPerDay: "\u043A\u043A\u0430\u043B / \u0434\u0435\u043D\u044C",
    kg: "\u043A\u0433",
    gainWeight: "\u041D\u0430\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043B\u044F \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0432\u0435\u0441\u0430",
    loseWeight: "\u0421\u0431\u0440\u043E\u0441\u044C\u0442\u0435 \u0434\u043B\u044F \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0432\u0435\u0441\u0430",
    bmiCategories: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u0418\u041C\u0422 (\u0412\u041E\u0417)",
    you: "\u0412\u044B",
    weightTableFor: "\u0441\u043C \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0432\u0435\u0441\u0430 \u0434\u043B\u044F \u0440\u043E\u0441\u0442\u0430",
    dailyCalorieNeeds: "\u0421\u0443\u0442\u043E\u0447\u043D\u0430\u044F \u043F\u043E\u0442\u0440\u0435\u0431\u043D\u043E\u0441\u0442\u044C \u0432 \u043A\u0430\u043B\u043E\u0440\u0438\u044F\u0445 (\u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 BMR)",
    sedentary: "\u0421\u0438\u0434\u044F\u0447\u0438\u0439 \u043E\u0431\u0440\u0430\u0437 \u0436\u0438\u0437\u043D\u0438",
    sedentaryDesc: "\u041C\u0430\u043B\u043E \u0438\u043B\u0438 \u043D\u0435\u0442 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F",
    lightActivity: "\u041B\u0451\u0433\u043A\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C",
    lightActivityDesc: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 1\u20133 \u0434\u043D\u044F/\u043D\u0435\u0434\u0435\u043B\u044E",
    moderateActivity: "\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C",
    moderateActivityDesc: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 3\u20135 \u0434\u043D\u0435\u0439/\u043D\u0435\u0434\u0435\u043B\u044E",
    highActivity: "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C",
    highActivityDesc: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 6\u20137 \u0434\u043D\u0435\u0439/\u043D\u0435\u0434\u0435\u043B\u044E",
    veryHighActivity: "\u041E\u0447\u0435\u043D\u044C \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C",
    veryHighActivityDesc: "2 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 \u0432 \u0434\u0435\u043D\u044C / \u0442\u044F\u0436\u0451\u043B\u044B\u0439 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u0440\u0443\u0434",
    disclaimer: "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435:",
    disclaimerText: "\u0418\u041C\u0422 \u2014 \u044D\u0442\u043E \u043E\u0431\u0449\u0438\u0439 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043D\u0435 \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442 \u043C\u044B\u0448\u0435\u0447\u043D\u0443\u044E \u043C\u0430\u0441\u0441\u0443, \u043A\u043E\u0441\u0442\u043D\u0443\u044E \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443, \u0432\u043E\u0437\u0440\u0430\u0441\u0442 \u0438 \u043F\u043E\u043B. \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u043D\u0435\u0442\u043E\u0447\u043D\u044B\u043C\u0438 \u0434\u043B\u044F \u0441\u043F\u043E\u0440\u0442\u0441\u043C\u0435\u043D\u043E\u0432 \u0438 \u0431\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u0436\u0435\u043D\u0449\u0438\u043D. \u041F\u0440\u043E\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0438\u0440\u0443\u0439\u0442\u0435\u0441\u044C \u0441 \u0432\u0440\u0430\u0447\u043E\u043C \u043F\u0440\u0438 \u043F\u0440\u0438\u043D\u044F\u0442\u0438\u0438 \u0440\u0435\u0448\u0435\u043D\u0438\u0439 \u043E \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u0435.",
    emptyStateText: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0440\u043E\u0441\u0442 \u0438 \u0432\u0435\u0441, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.",
  },
};

function getBmiCategory(bmi: number, categories: BmiCategory[]): BmiCategory {
  if (bmi < 18.5) return categories[0];
  if (bmi < 25) return categories[1];
  if (bmi < 30) return categories[2];
  if (bmi < 35) return categories[3];
  if (bmi < 40) return categories[4];
  return categories[5];
}

function getIdealWeightRange(heightM: number): { min: number; max: number } {
  return {
    min: 18.5 * heightM * heightM,
    max: 24.9 * heightM * heightM,
  };
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export default function BMICalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const bmiCategories = bmiCategoriesTranslations[lang];

  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit] = useState<Unit>("metric");

  // Imperial inputs
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");

  const result = useMemo(() => {
    let heightM: number;
    let weightKg: number;

    if (unit === "metric") {
      const h = parseFloat(heightCm);
      const w = parseFloat(weight);
      if (!h || h <= 0 || !w || w <= 0) return null;
      heightM = h / 100;
      weightKg = w;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const lbs = parseFloat(weightLbs);
      if ((ft <= 0 && inches <= 0) || !lbs || lbs <= 0) return null;
      const totalInches = ft * 12 + inches;
      heightM = totalInches * 0.0254;
      weightKg = lbs * 0.4536;
    }

    const userAge = parseInt(age) || 0;
    const bmi = weightKg / (heightM * heightM);
    const category = getBmiCategory(bmi, bmiCategories);
    const idealRange = getIdealWeightRange(heightM);

    // Weight difference
    let weightDiff = 0;
    let weightDiffLabel = "";
    if (bmi < 18.5) {
      weightDiff = idealRange.min - weightKg;
      weightDiffLabel = pt.gainWeight;
    } else if (bmi >= 25) {
      weightDiff = weightKg - idealRange.max;
      weightDiffLabel = pt.loseWeight;
    }

    // BMR (Basal Metabolic Rate) — Mifflin-St Jeor
    let bmr = 0;
    if (userAge > 0) {
      if (gender === "male") {
        bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * userAge + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * userAge - 161;
      }
    }

    // BMI prime (BMI / 25 — 1.0 = upper normal limit)
    const bmiPrime = bmi / 25;

    return {
      bmi,
      category,
      weightKg,
      heightM,
      heightCm: heightM * 100,
      idealRange,
      weightDiff,
      weightDiffLabel,
      bmr,
      bmiPrime,
      userAge,
    };
  }, [heightCm, weight, age, gender, unit, heightFt, heightIn, weightLbs, bmiCategories, pt]);

  // BMI scale marker position (BMI 10–50 range mapped to 0–100%)
  const scalePosition = result ? Math.min(100, Math.max(0, ((result.bmi - 10) / 40) * 100)) : 0;

  const activityLevels = [
    { label: pt.sedentary, factor: 1.2, desc: pt.sedentaryDesc },
    { label: pt.lightActivity, factor: 1.375, desc: pt.lightActivityDesc },
    { label: pt.moderateActivity, factor: 1.55, desc: pt.moderateActivityDesc },
    { label: pt.highActivity, factor: 1.725, desc: pt.highActivityDesc },
    { label: pt.veryHighActivity, factor: 1.9, desc: pt.veryHighActivityDesc },
  ];

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
      relatedIds={["bmr", "ideal-weight", "water-intake", "pregnancy"]}
    >
      {/* Unit Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6">
        <button
          onClick={() => setUnit("metric")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            unit === "metric"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.metricUnit}
        </button>
        <button
          onClick={() => setUnit("imperial")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            unit === "imperial"
              ? "bg-primary text-white"
              : "bg-white text-muted hover:bg-gray-50"
          }`}
        >
          {pt.imperialUnit}
        </button>
      </div>

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

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {unit === "metric" ? (
          <>
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
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{"\u{1F4CF}"} {pt.heightLabelImperial}</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    min="1"
                    max="8"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  />
                  <p className="text-xs text-muted mt-1 text-center">{pt.foot}</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="9"
                    min="0"
                    max="11"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  />
                  <p className="text-xs text-muted mt-1 text-center">{pt.inch}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{"\u2696\uFE0F"} {pt.weightLabelImperial}</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                placeholder="165"
                min="50"
                max="600"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {"\u{1F382}"} {pt.ageLabel} <span className="text-muted font-normal">{"\u2014"} {pt.ageOptional}</span>
          </label>
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
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* BMI Result Card */}
          <div className={`${result.category.bgColor} rounded-2xl border ${result.category.borderColor} p-6 text-center`}>
            <p className="text-sm text-muted mb-2">{pt.yourBmi}</p>
            <p className={`text-5xl font-bold ${result.category.color}`}>{fmt(result.bmi)}</p>
            <div className="mt-3 inline-flex items-center gap-2">
              <span className="text-lg">{result.category.emoji}</span>
              <span className={`text-lg font-semibold ${result.category.color}`}>{result.category.label}</span>
            </div>
            <p className="text-sm text-muted mt-2">{result.category.description}</p>
          </div>

          {/* BMI Scale */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-muted mb-3 font-medium">{pt.bmiScale}</p>
            <div className="relative">
              <div className="w-full h-5 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400" style={{ width: "21.25%" }} title={bmiCategories[0].label} />
                <div className="h-full bg-green-400" style={{ width: "16%" }} title={bmiCategories[1].label} />
                <div className="h-full bg-amber-400" style={{ width: "12.5%" }} title={bmiCategories[2].label} />
                <div className="h-full bg-orange-400" style={{ width: "12.5%" }} title={bmiCategories[3].label} />
                <div className="h-full bg-red-400" style={{ width: "12.5%" }} title={bmiCategories[4].label} />
                <div className="h-full bg-red-700" style={{ width: "25.25%" }} title={bmiCategories[5].label} />
              </div>
              {/* Marker */}
              <div
                className="absolute -top-1 transition-all duration-500"
                style={{ left: `calc(${scalePosition}% - 4px)` }}
              >
                <div className="w-2 h-7 bg-foreground rounded-full shadow-md" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>10</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
              <span>50</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.idealWeightRange}</p>
              <p className="text-lg font-bold text-foreground">
                {fmt(result.idealRange.min)} {"\u2013"} {fmt(result.idealRange.max)}
              </p>
              <p className="text-xs text-muted mt-1">{pt.kg}</p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.bmiPrime}</p>
              <p className="text-lg font-bold text-foreground">{result.bmiPrime.toFixed(2)}</p>
              <p className="text-xs text-muted mt-1">{result.bmiPrime <= 1 ? pt.normal : pt.aboveNormal}</p>
            </div>

            {result.bmr > 0 && (
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <p className="text-xs text-muted mb-1">{pt.basalMetabolism}</p>
                <p className="text-lg font-bold text-foreground">{Math.round(result.bmr)}</p>
                <p className="text-xs text-muted mt-1">{pt.kcalPerDay}</p>
              </div>
            )}
          </div>

          {/* Weight Difference */}
          {result.weightDiff > 0 && (
            <div className={`${result.bmi < 18.5 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"} rounded-xl border p-4`}>
              <p className={`text-sm font-medium ${result.bmi < 18.5 ? "text-blue-700" : "text-amber-700"} flex items-center gap-2`}>
                <span>{result.bmi < 18.5 ? "\u{1F4C8}" : "\u{1F4C9}"}</span>
                {result.weightDiffLabel}: <span className="font-bold">{fmt(result.weightDiff)} {pt.kg}</span>
              </p>
            </div>
          )}

          {/* All Categories Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{"\u{1F4CA}"}</span>
                {pt.bmiCategories}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {bmiCategories.map((cat) => {
                const isActive = cat.label === result.category.label;
                return (
                  <div key={cat.label} className={`flex items-center justify-between px-5 py-3 ${isActive ? cat.bgColor : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className={`text-sm ${isActive ? "font-semibold" : ""} ${cat.color}`}>{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted">{cat.range}</span>
                      {isActive && (
                        <span className="text-xs bg-foreground text-white px-2 py-0.5 rounded-full">{pt.you}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weight table for this height */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>{"\u{1F4CF}"}</span>
                {fmt(result.heightCm)} {pt.weightTableFor}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {bmiCategories.slice(0, 4).map((cat, i) => {
                const bmiLow = [0, 18.5, 25, 30][i];
                const bmiHigh = [18.5, 25, 30, 35][i];
                const wLow = bmiLow > 0 ? bmiLow * result.heightM * result.heightM : 0;
                const wHigh = bmiHigh * result.heightM * result.heightM;
                const isActive = cat.label === result.category.label;
                return (
                  <div key={cat.label} className={`flex items-center justify-between px-5 py-3 ${isActive ? cat.bgColor : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className={`text-sm ${cat.color}`}>{cat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {bmiLow > 0 ? `${fmt(wLow)}` : "< " + fmt(wHigh)} {bmiLow > 0 ? `\u2013 ${fmt(wHigh)}` : ""} {pt.kg}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Calorie Needs */}
          {result.bmr > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>{"\u{1F525}"}</span>
                  {pt.dailyCalorieNeeds}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {activityLevels.map((level) => (
                  <div key={level.factor} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{level.label}</p>
                      <p className="text-xs text-muted">{level.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{Math.round(result.bmr * level.factor)} kkal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.disclaimer}</span> {pt.disclaimerText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">{"\u2696\uFE0F"}</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
