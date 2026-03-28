"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Climate = "cold" | "moderate" | "hot" | "very_hot";

const activityLevelsData: Record<Lang, { id: ActivityLevel; label: string; icon: string; factor: number; description: string }[]> = {
  az: [
    { id: "sedentary", label: "Oturaq", icon: "🪑", factor: 1.0, description: "Masa arxasında iş, az hərəkət" },
    { id: "light", label: "Yüngül", icon: "🚶", factor: 1.1, description: "Həftədə 1–3 gün yüngül idman" },
    { id: "moderate", label: "Orta", icon: "🏃", factor: 1.25, description: "Həftədə 3–5 gün idman" },
    { id: "active", label: "Aktiv", icon: "🏋️", factor: 1.4, description: "Həftədə 6–7 gün ağır idman" },
    { id: "very_active", label: "Çox aktiv", icon: "⚡", factor: 1.6, description: "Gündə 2+ saat intensiv idman" },
  ],
  en: [
    { id: "sedentary", label: "Sedentary", icon: "🪑", factor: 1.0, description: "Desk work, little movement" },
    { id: "light", label: "Light", icon: "🚶", factor: 1.1, description: "Light exercise 1–3 days/week" },
    { id: "moderate", label: "Moderate", icon: "🏃", factor: 1.25, description: "Exercise 3–5 days/week" },
    { id: "active", label: "Active", icon: "🏋️", factor: 1.4, description: "Heavy exercise 6–7 days/week" },
    { id: "very_active", label: "Very active", icon: "⚡", factor: 1.6, description: "2+ hours intense exercise daily" },
  ],
  ru: [
    { id: "sedentary", label: "Сидячий", icon: "🪑", factor: 1.0, description: "Работа за столом, мало движения" },
    { id: "light", label: "Лёгкий", icon: "🚶", factor: 1.1, description: "Лёгкие упражнения 1–3 дня/нед." },
    { id: "moderate", label: "Умеренный", icon: "🏃", factor: 1.25, description: "Упражнения 3–5 дней/нед." },
    { id: "active", label: "Активный", icon: "🏋️", factor: 1.4, description: "Тяжёлые упражнения 6–7 дней/нед." },
    { id: "very_active", label: "Очень активный", icon: "⚡", factor: 1.6, description: "2+ часа интенсивных упражнений ежедневно" },
  ],
};

const climatesData: Record<Lang, { id: Climate; label: string; icon: string; factor: number; description: string }[]> = {
  az: [
    { id: "cold", label: "Soyuq", icon: "❄️", factor: 0.9, description: "< 10°C" },
    { id: "moderate", label: "Mülayim", icon: "🌤️", factor: 1.0, description: "10–25°C" },
    { id: "hot", label: "İsti", icon: "☀️", factor: 1.15, description: "25–35°C" },
    { id: "very_hot", label: "Çox isti", icon: "🔥", factor: 1.3, description: "35°C+" },
  ],
  en: [
    { id: "cold", label: "Cold", icon: "❄️", factor: 0.9, description: "< 10°C" },
    { id: "moderate", label: "Moderate", icon: "🌤️", factor: 1.0, description: "10–25°C" },
    { id: "hot", label: "Hot", icon: "☀️", factor: 1.15, description: "25–35°C" },
    { id: "very_hot", label: "Very hot", icon: "🔥", factor: 1.3, description: "35°C+" },
  ],
  ru: [
    { id: "cold", label: "Холодный", icon: "❄️", factor: 0.9, description: "< 10°C" },
    { id: "moderate", label: "Умеренный", icon: "🌤️", factor: 1.0, description: "10–25°C" },
    { id: "hot", label: "Жаркий", icon: "☀️", factor: 1.15, description: "25–35°C" },
    { id: "very_hot", label: "Очень жаркий", icon: "🔥", factor: 1.3, description: "35°C+" },
  ],
};

const GLASS_ML = 250;

const waterScheduleData: Record<Lang, { time: string; label: string; icon: string; percent: number }[]> = {
  az: [
    { time: "07:00", label: "Oyananda (acqarına)", icon: "🌅", percent: 10 },
    { time: "08:00", label: "Səhər yeməyindən əvvəl", icon: "☕", percent: 8 },
    { time: "10:00", label: "Səhər ara", icon: "🕙", percent: 12 },
    { time: "12:00", label: "Nahardan əvvəl", icon: "🕛", percent: 10 },
    { time: "14:00", label: "Nahardan sonra", icon: "☀️", percent: 12 },
    { time: "16:00", label: "Günortadan sonra", icon: "🕓", percent: 15 },
    { time: "18:00", label: "Axşam", icon: "🌆", percent: 13 },
    { time: "20:00", label: "Şam yeməyindən sonra", icon: "🌙", percent: 12 },
    { time: "22:00", label: "Yatmadan əvvəl", icon: "😴", percent: 8 },
  ],
  en: [
    { time: "07:00", label: "Upon waking (empty stomach)", icon: "🌅", percent: 10 },
    { time: "08:00", label: "Before breakfast", icon: "☕", percent: 8 },
    { time: "10:00", label: "Morning break", icon: "🕙", percent: 12 },
    { time: "12:00", label: "Before lunch", icon: "🕛", percent: 10 },
    { time: "14:00", label: "After lunch", icon: "☀️", percent: 12 },
    { time: "16:00", label: "Afternoon", icon: "🕓", percent: 15 },
    { time: "18:00", label: "Evening", icon: "🌆", percent: 13 },
    { time: "20:00", label: "After dinner", icon: "🌙", percent: 12 },
    { time: "22:00", label: "Before bed", icon: "😴", percent: 8 },
  ],
  ru: [
    { time: "07:00", label: "При пробуждении (натощак)", icon: "🌅", percent: 10 },
    { time: "08:00", label: "Перед завтраком", icon: "☕", percent: 8 },
    { time: "10:00", label: "Утренний перерыв", icon: "🕙", percent: 12 },
    { time: "12:00", label: "Перед обедом", icon: "🕛", percent: 10 },
    { time: "14:00", label: "После обеда", icon: "☀️", percent: 12 },
    { time: "16:00", label: "После полудня", icon: "🕓", percent: 15 },
    { time: "18:00", label: "Вечер", icon: "🌆", percent: 13 },
    { time: "20:00", label: "После ужина", icon: "🌙", percent: 12 },
    { time: "22:00", label: "Перед сном", icon: "😴", percent: 8 },
  ],
};

const pageTranslations = {
  az: {
    title: "Su norması hesablayıcısı",
    description: "Gündəlik su qəbulu normanızı çəki, aktivlik, iqlim və digər amillərə görə hesablayın.",
    breadcrumbCategory: "Sağlamlıq",
    breadcrumbLabel: "Su norması hesablayıcısı",
    formulaTitle: "Gündəlik su norması necə hesablanır?",
    formulaContent: `Baza norma: Çəki (kq) × 33 ml

Əmsallar:
• Aktivlik: oturaq ×1.0, yüngül ×1.1, orta ×1.25, aktiv ×1.4, çox aktiv ×1.6
• İqlim: soyuq ×0.9, mülayim ×1.0, isti ×1.15, çox isti ×1.3

Əlavələr:
• İdman: hər 30 dəqiqə üçün +350 ml
• Kofein: hər fincan çay/qəhvə üçün +150 ml
• Hamiləlik: +300 ml
• Əmizdirmə: +700 ml

Ümumi norma: Baza × Aktivlik × İqlim + Əlavələr

Tövsiyə: Gün ərzində kiçik porsiyalarla, 200–300 ml aralıqla için.
Susuzluq hiss etməyi gözləməyin — susuzluq artıq dehidratasiyanın əlamətidir.
Sidik rəngi açıq sarı olmalıdır — tünd rəng dehidratsiyanı göstərir.`,
    weightLabel: "Çəki (kq)",
    physicalActivity: "Fiziki aktivlik",
    climateLabel: "İqlim / Hava temperaturu",
    dailyExercise: "Gündəlik idman (dəqiqə)",
    exerciseNote: "Hər 30 dəq üçün +350 ml",
    teaCoffee: "Çay/Qəhvə (fincan/gün)",
    caffeineNote: "Hər fincan üçün +150 ml",
    pregnant: "Hamiləyəm (+300 ml)",
    breastfeeding: "Əmizdirirəm (+700 ml)",
    dailyWaterNorm: "Gündəlik su normanız",
    literPerDay: "litr / gün",
    glassLabel: "stəkan",
    glassEach: "stəkan (hər biri {ml} ml)",
    baseNorm: "Baza norma",
    minimum: "Minimum",
    maximum: "Maksimum",
    breakdownTitle: "Hesablamanın tərkibi",
    base: "Baza",
    activityFactor: "Aktivlik əmsalı",
    climateFactor: "İqlim əmsalı",
    exerciseAddition: "İdman əlavəsi",
    caffeineCompensation: "Kofein kompensasiyası",
    pregnancyAddition: "Hamiləlik əlavəsi",
    breastfeedingAddition: "Əmizdirmə əlavəsi",
    totalDailyNorm: "Ümumi gündəlik norma",
    dailySchedule: "Gün ərzində su qəbulu cədvəli",
    goodHydrationSigns: "Yaxşı hidratasiya əlamətləri",
    goodSign1: "Sidik rəngi açıq sarı",
    goodSign2: "Dəri elastik və nəmli",
    goodSign3: "Enerji səviyyəsi yüksək",
    goodSign4: "Konsentrasiya yaxşı",
    goodSign5: "Baş ağrısı yoxdur",
    dehydrationSigns: "Dehidratasiya əlamətləri",
    badSign1: "Sidik rəngi tünd sarı/narıncı",
    badSign2: "Ağız quruluğu",
    badSign3: "Baş ağrısı və yorğunluq",
    badSign4: "Başgicəllənmə",
    badSign5: "Quru dəri",
    tipsTitle: "Su içmə məsləhətləri",
    tip1: "Səhər oyananda 1 stəkan su için — metabolizmanı işə salır",
    tip2: "Yeməkdən 30 dəq əvvəl su için — həzmə kömək edir",
    tip3: "Susuzluq hiss etməyi gözləməyin — bu artıq gecdir",
    tip4: "Yanınızda su şüşəsi gəzdirin — xatırlatma rolunu oynayır",
    tip5: "Meyvə və tərəvəzlər də su təmin edir (xiyar ~95%, qarpız ~92%)",
    tip6: "Soyuq su deyil, otaq temperaturu su için — bədən daha asan qəbul edir",
    emptyState: "Nəticəni görmək üçün çəkinizi daxil edin.",
    goalReached: "Hədəfə çatdınız!",
    remaining: "Qalır: {val} kkal",
  },
  en: {
    title: "Water Intake Calculator",
    description: "Calculate your daily water intake based on weight, activity, climate and other factors.",
    breadcrumbCategory: "Health",
    breadcrumbLabel: "Water intake calculator",
    formulaTitle: "How is daily water intake calculated?",
    formulaContent: `Base norm: Weight (kg) × 33 ml

Factors:
• Activity: sedentary ×1.0, light ×1.1, moderate ×1.25, active ×1.4, very active ×1.6
• Climate: cold ×0.9, moderate ×1.0, hot ×1.15, very hot ×1.3

Additions:
• Exercise: +350 ml per 30 minutes
• Caffeine: +150 ml per cup of tea/coffee
• Pregnancy: +300 ml
• Breastfeeding: +700 ml

Total norm: Base × Activity × Climate + Additions

Recommendation: Drink in small portions throughout the day, 200–300 ml at a time.
Do not wait until you feel thirsty — thirst is already a sign of dehydration.
Urine color should be light yellow — dark color indicates dehydration.`,
    weightLabel: "Weight (kg)",
    physicalActivity: "Physical activity",
    climateLabel: "Climate / Air temperature",
    dailyExercise: "Daily exercise (minutes)",
    exerciseNote: "+350 ml per 30 min",
    teaCoffee: "Tea/Coffee (cups/day)",
    caffeineNote: "+150 ml per cup",
    pregnant: "Pregnant (+300 ml)",
    breastfeeding: "Breastfeeding (+700 ml)",
    dailyWaterNorm: "Your daily water norm",
    literPerDay: "liters / day",
    glassLabel: "glasses",
    glassEach: "glasses ({ml} ml each)",
    baseNorm: "Base norm",
    minimum: "Minimum",
    maximum: "Maximum",
    breakdownTitle: "Calculation breakdown",
    base: "Base",
    activityFactor: "Activity factor",
    climateFactor: "Climate factor",
    exerciseAddition: "Exercise addition",
    caffeineCompensation: "Caffeine compensation",
    pregnancyAddition: "Pregnancy addition",
    breastfeedingAddition: "Breastfeeding addition",
    totalDailyNorm: "Total daily norm",
    dailySchedule: "Daily water intake schedule",
    goodHydrationSigns: "Good hydration signs",
    goodSign1: "Light yellow urine",
    goodSign2: "Elastic and moist skin",
    goodSign3: "High energy levels",
    goodSign4: "Good concentration",
    goodSign5: "No headaches",
    dehydrationSigns: "Dehydration signs",
    badSign1: "Dark yellow/orange urine",
    badSign2: "Dry mouth",
    badSign3: "Headache and fatigue",
    badSign4: "Dizziness",
    badSign5: "Dry skin",
    tipsTitle: "Water drinking tips",
    tip1: "Drink 1 glass of water upon waking — it activates metabolism",
    tip2: "Drink water 30 min before meals — it aids digestion",
    tip3: "Do not wait until you feel thirsty — it is already too late",
    tip4: "Carry a water bottle — it serves as a reminder",
    tip5: "Fruits and vegetables also provide water (cucumber ~95%, watermelon ~92%)",
    tip6: "Drink room temperature water, not cold — the body absorbs it more easily",
    emptyState: "Enter your weight to see the result.",
    goalReached: "Goal reached!",
    remaining: "Remaining: {val} kcal",
  },
  ru: {
    title: "Калькулятор нормы воды",
    description: "Рассчитайте суточную норму потребления воды на основе веса, активности, климата и других факторов.",
    breadcrumbCategory: "Здоровье",
    breadcrumbLabel: "Калькулятор нормы воды",
    formulaTitle: "Как рассчитывается суточная норма воды?",
    formulaContent: `Базовая норма: Вес (кг) × 33 мл

Коэффициенты:
• Активность: сидячий ×1.0, лёгкий ×1.1, умеренный ×1.25, активный ×1.4, очень активный ×1.6
• Климат: холодный ×0.9, умеренный ×1.0, жаркий ×1.15, очень жаркий ×1.3

Дополнения:
• Упражнения: +350 мл за каждые 30 минут
• Кофеин: +150 мл за каждую чашку чая/кофе
• Беременность: +300 мл
• Грудное вскармливание: +700 мл

Общая норма: База × Активность × Климат + Дополнения

Рекомендация: Пейте небольшими порциями в течение дня, по 200–300 мл за раз.
Не ждите жажды — жажда уже является признаком обезвоживания.
Цвет мочи должен быть светло-жёлтым — тёмный цвет указывает на обезвоживание.`,
    weightLabel: "Вес (кг)",
    physicalActivity: "Физическая активность",
    climateLabel: "Климат / Температура воздуха",
    dailyExercise: "Ежедневные упражнения (минуты)",
    exerciseNote: "+350 мл за 30 мин",
    teaCoffee: "Чай/Кофе (чашек/день)",
    caffeineNote: "+150 мл за чашку",
    pregnant: "Беременна (+300 мл)",
    breastfeeding: "Кормлю грудью (+700 мл)",
    dailyWaterNorm: "Ваша суточная норма воды",
    literPerDay: "литров / день",
    glassLabel: "стаканов",
    glassEach: "стаканов (по {ml} мл)",
    baseNorm: "Базовая норма",
    minimum: "Минимум",
    maximum: "Максимум",
    breakdownTitle: "Состав расчёта",
    base: "База",
    activityFactor: "Коэффициент активности",
    climateFactor: "Коэффициент климата",
    exerciseAddition: "Добавка за упражнения",
    caffeineCompensation: "Компенсация кофеина",
    pregnancyAddition: "Добавка за беременность",
    breastfeedingAddition: "Добавка за кормление",
    totalDailyNorm: "Общая суточная норма",
    dailySchedule: "Расписание приёма воды в течение дня",
    goodHydrationSigns: "Признаки хорошей гидратации",
    goodSign1: "Светло-жёлтый цвет мочи",
    goodSign2: "Эластичная и увлажнённая кожа",
    goodSign3: "Высокий уровень энергии",
    goodSign4: "Хорошая концентрация",
    goodSign5: "Нет головных болей",
    dehydrationSigns: "Признаки обезвоживания",
    badSign1: "Тёмно-жёлтый/оранжевый цвет мочи",
    badSign2: "Сухость во рту",
    badSign3: "Головная боль и усталость",
    badSign4: "Головокружение",
    badSign5: "Сухая кожа",
    tipsTitle: "Советы по питью воды",
    tip1: "Выпейте 1 стакан воды при пробуждении — запускает метаболизм",
    tip2: "Пейте воду за 30 мин до еды — помогает пищеварению",
    tip3: "Не ждите жажды — это уже поздно",
    tip4: "Носите бутылку воды с собой — служит напоминанием",
    tip5: "Фрукты и овощи тоже содержат воду (огурец ~95%, арбуз ~92%)",
    tip6: "Пейте воду комнатной температуры, не холодную — организм легче усваивает",
    emptyState: "Введите свой вес, чтобы увидеть результат.",
    goalReached: "Цель достигнута!",
    remaining: "Осталось: {val} ккал",
  },
};

function fmt(n: number): string {
  return n.toFixed(1);
}

export default function WaterIntakeCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const activityLevels = activityLevelsData[lang];
  const climateLevels = climatesData[lang];
  const waterSchedule = waterScheduleData[lang];

  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<Climate>("moderate");
  const [exerciseMin, setExerciseMin] = useState("");
  const [caffeineCount, setCaffeineCount] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;

    const actLevel = activityLevels.find((l) => l.id === activity)!;
    const climateLevel = climateLevels.find((c) => c.id === climate)!;

    const baseMl = w * 33;
    let totalMl = baseMl * actLevel.factor;
    totalMl *= climateLevel.factor;

    const exMin = parseInt(exerciseMin) || 0;
    const exerciseExtra = Math.round(exMin / 30) * 350;
    totalMl += exerciseExtra;

    const caffeine = parseInt(caffeineCount) || 0;
    const caffeineExtra = caffeine * 150;
    totalMl += caffeineExtra;

    let pregnancyExtra = 0;
    if (isPregnant) {
      pregnancyExtra = 300;
      totalMl += pregnancyExtra;
    }
    let breastfeedingExtra = 0;
    if (isBreastfeeding) {
      breastfeedingExtra = 700;
      totalMl += breastfeedingExtra;
    }

    const totalL = totalMl / 1000;
    const glasses = Math.ceil(totalMl / GLASS_ML);
    const minMl = w * 25;
    const maxMl = w * 45;

    return {
      baseMl, totalMl, totalL, glasses, exerciseExtra, caffeineExtra,
      pregnancyExtra, breastfeedingExtra, minL: minMl / 1000, maxL: maxMl / 1000,
      actLevel, climateLevel, weight: w,
    };
  }, [weight, activity, climate, exerciseMin, caffeineCount, isPregnant, isBreastfeeding, activityLevels, climateLevels]);

  const displayGlasses = result ? Math.min(12, result.glasses) : 0;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=health" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["bmi", "bmr", "ideal-weight", "pregnancy"]}
    >
      {/* Weight */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">⚖️ {pt.weightLabel}</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="75"
          min="20"
          max="250"
          className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <div className="flex gap-2 mt-2">
          {[55, 65, 75, 85, 100].map((v) => (
            <button
              key={v}
              onClick={() => setWeight(String(v))}
              className="px-3 py-1 rounded-lg bg-gray-100 text-muted text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              {v} {lang === "ru" ? "кг" : "kq"}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.physicalActivity}</label>
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
            </button>
          ))}
        </div>
      </div>

      {/* Climate */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.climateLabel}</label>
        <div className="grid grid-cols-4 gap-3">
          {climateLevels.map((c) => (
            <button
              key={c.id}
              onClick={() => setClimate(c.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                climate === c.id
                  ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{c.icon}</span>
              <p className="text-xs font-medium text-foreground">{c.label}</p>
              <p className="text-[10px] text-muted">{c.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl border border-border p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            🏃 {pt.dailyExercise}
          </label>
          <input
            type="number"
            value={exerciseMin}
            onChange={(e) => setExerciseMin(e.target.value)}
            placeholder="0"
            min="0"
            max="480"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <p className="text-xs text-muted mt-1">{pt.exerciseNote}</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-border p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            ☕ {pt.teaCoffee}
          </label>
          <input
            type="number"
            value={caffeineCount}
            onChange={(e) => setCaffeineCount(e.target.value)}
            placeholder="0"
            min="0"
            max="15"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <p className="text-xs text-muted mt-1">{pt.caffeineNote}</p>
        </div>
      </div>

      {/* Pregnancy/Breastfeeding */}
      <div className="flex gap-4 mb-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPregnant}
            onChange={(e) => setIsPregnant(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">🤰 {pt.pregnant}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isBreastfeeding}
            onChange={(e) => setIsBreastfeeding(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">🍼 {pt.breastfeeding}</span>
        </label>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-cyan-100 mb-1">{pt.dailyWaterNorm}</p>
            <p className="text-5xl font-bold">{fmt(result.totalL)}</p>
            <p className="text-lg text-cyan-100 mt-1">{pt.literPerDay}</p>
            <div className="flex justify-center gap-6 mt-3 text-sm text-cyan-200">
              <span>{Math.round(result.totalMl)} ml</span>
              <span>•</span>
              <span>{result.glasses} {pt.glassLabel}</span>
            </div>
          </div>

          <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-5">
            <p className="text-xs text-cyan-600 mb-3 font-medium text-center">
              {result.glasses} {pt.glassEach.replace("{ml}", String(GLASS_ML))}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: displayGlasses }).map((_, i) => (
                <div key={i} className="text-2xl" title={`${lang === "ru" ? "Стакан" : lang === "en" ? "Glass" : "Stəkan"} ${i + 1}`}>
                  💧
                </div>
              ))}
              {result.glasses > 12 && (
                <span className="text-sm text-cyan-600 self-center ml-1">+{result.glasses - 12}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.baseNorm}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.baseMl / 1000)} L</p>
              <p className="text-xs text-muted mt-1">{result.weight} {lang === "ru" ? "кг" : "kq"} × 33 ml</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.minimum}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.minL)} L</p>
              <p className="text-xs text-muted mt-1">25 ml/{lang === "ru" ? "кг" : "kq"}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <p className="text-xs text-muted mb-1">{pt.maximum}</p>
              <p className="text-lg font-bold text-foreground">{fmt(result.maxL)} L</p>
              <p className="text-xs text-muted mt-1">45 ml/{lang === "ru" ? "кг" : "kq"}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📋</span>
                {pt.breakdownTitle}
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.base} ({result.weight} {lang === "ru" ? "кг" : "kq"} × 33 ml)</span>
                <span className="text-sm font-medium text-foreground">{Math.round(result.baseMl)} ml</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.activityFactor} (×{result.actLevel.factor})</span>
                <span className="text-sm font-medium text-foreground">{Math.round(result.baseMl * result.actLevel.factor)} ml</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.climateFactor} (×{result.climateLevel.factor})</span>
                <span className="text-sm font-medium text-foreground">
                  {result.climateLevel.factor !== 1
                    ? `${result.climateLevel.factor > 1 ? "+" : ""}${Math.round(result.baseMl * result.actLevel.factor * (result.climateLevel.factor - 1))} ml`
                    : "0 ml"
                  }
                </span>
              </div>
              {result.exerciseExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.exerciseAddition}</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.exerciseExtra} ml</span>
                </div>
              )}
              {result.caffeineExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.caffeineCompensation}</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.caffeineExtra} ml</span>
                </div>
              )}
              {result.pregnancyExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.pregnancyAddition}</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.pregnancyExtra} ml</span>
                </div>
              )}
              {result.breastfeedingExtra > 0 && (
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-muted">{pt.breastfeedingAddition}</span>
                  <span className="text-sm font-medium text-cyan-700">+{result.breastfeedingExtra} ml</span>
                </div>
              )}
              <div className="flex justify-between px-5 py-4 bg-cyan-50">
                <span className="text-sm font-semibold text-cyan-700">{pt.totalDailyNorm}</span>
                <span className="text-sm font-bold text-cyan-700">{Math.round(result.totalMl)} ml ({fmt(result.totalL)} L)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🕐</span>
                {pt.dailySchedule}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {waterSchedule.map((slot) => {
                const ml = Math.round(result.totalMl * slot.percent / 100);
                const glasses = Math.round(ml / GLASS_ML * 10) / 10;
                return (
                  <div key={slot.time} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted w-12">{slot.time}</span>
                      <span>{slot.icon}</span>
                      <span className="text-sm text-foreground">{slot.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">{ml} ml</span>
                      <span className="text-xs text-muted ml-2">({glasses} {pt.glassLabel})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✅</span>
                {pt.goodHydrationSigns}
              </h4>
              <ul className="text-xs text-green-700 space-y-1.5">
                <li>• {pt.goodSign1}</li>
                <li>• {pt.goodSign2}</li>
                <li>• {pt.goodSign3}</li>
                <li>• {pt.goodSign4}</li>
                <li>• {pt.goodSign5}</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                {pt.dehydrationSigns}
              </h4>
              <ul className="text-xs text-red-700 space-y-1.5">
                <li>• {pt.badSign1}</li>
                <li>• {pt.badSign2}</li>
                <li>• {pt.badSign3}</li>
                <li>• {pt.badSign4}</li>
                <li>• {pt.badSign5}</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              {pt.tipsTitle}
            </h4>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li>• {pt.tip1}</li>
              <li>• {pt.tip2}</li>
              <li>• {pt.tip3}</li>
              <li>• {pt.tip4}</li>
              <li>• {pt.tip5}</li>
              <li>• {pt.tip6}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">💧</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
