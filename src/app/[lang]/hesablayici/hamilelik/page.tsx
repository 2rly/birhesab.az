"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

type CalcMethod = "lmp" | "conception" | "ultrasound" | "ivf";

interface TrimesterInfo {
  name: string;
  weeks: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface MilestoneItem {
  week: number;
  title: string;
  description: string;
  icon: string;
}

const pageTranslations = {
  az: {
    title: "Hamiləlik həftə hesablayıcısı",
    description: "Hamiləlik həftənizi, doğuş tarixinizi və körpənizin inkişafını izləyin.",
    breadcrumbCategory: "Sağlamlıq",
    formulaTitle: "Doğuş tarixi necə hesablanır?",
    formulaContent: `Naegele düsturu:
Təxmini doğuş tarixi = Son adet tarixi (SAT) + 280 gün (40 həftə)

Hesablama üsulları:
• SAT (Son Adet Tarixi): ən geniş yayılmış üsul
• Konsepsiya tarixi: SAT + 14 gün = konsepsiya
• USM (Ultrasəs): USM tarixində körpənin yaşı əsasında
• IVF: embrion transfer tarixi əsasında

Trimesterlər:
• I Trimester: 1–12 həftə (orqanlar formalaşır)
• II Trimester: 13–27 həftə (sürətli böyümə)
• III Trimester: 28–40 həftə (yetişmə, hazırlıq)

Qeyd: Doğuş tarixi təxminidir. Körpələrin yalnız ~5%-i dəqiq həmin gün doğulur.
Normal doğuş 37–42 həftə arasında baş verir.`,
    calcMethod: "Hesablama üsulu",
    methodLmp: "Son adet tarixi",
    methodConception: "Konsepsiya tarixi",
    methodUltrasound: "USM nəticəsi",
    methodIvf: "IVF transfer",
    dateLabel: "Son adet tarixi",
    dateLabelConception: "Konsepsiya tarixi",
    dateLabelUltrasound: "USM tarixi",
    dateLabelIvf: "IVF transfer tarixi",
    ultrasoundAge: "USM-də hamiləlik yaşı",
    week: "həftə",
    day: "gün",
    currentWeek: "Hazırkı hamiləlik həftəsi",
    weekPlusDay: "həftə + gün",
    zeroWeek: "0 həftə",
    completed: "tamamlanıb",
    fortyWeek: "40 həftə",
    estimatedDueDate: "Təxmini doğuş tarixi",
    daysRemaining: "gün qalıb",
    conceptionDate: "Konsepsiya tarixi",
    approximate: "Təxmini",
    elapsedTime: "Keçən müddət",
    babySizeTitle: "Körpənizin təxmini ölçüsü",
    length: "Uzunluq",
    weight: "Çəki",
    comparison: "Müqayisə",
    trimesterChart: "Trimester cədvəli",
    fromDate: "-dən",
    currently: "Hazırda",
    developmentStages: "İnkişaf mərhələləri",
    babySizeByWeek: "Körpənin həftələrə görə ölçüsü",
    noteTitle: "Diqqət:",
    noteText: "Bu hesablama təxmini xarakter daşıyır. Faktiki doğuş tarixi 2 həftə əvvəl və ya sonra ola bilər. Normal doğuş 37–42 həftə arasında baş verir. Müntəzəm həkim müayinəsi və USM nəzarəti vacibdir.",
    emptyState: "Nəticəni görmək üçün tarix daxil edin.",
    months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
    trimesters: [
      { name: "I Trimester", weeks: "1–12 həftə", icon: "🌱", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
      { name: "II Trimester", weeks: "13–27 həftə", icon: "🌸", color: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
      { name: "III Trimester", weeks: "28–40 həftə", icon: "👶", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    ],
    milestones: [
      { week: 4, title: "Ürək döyüntüsü", description: "Embrionun ürəyi döyünməyə başlayır", icon: "💓" },
      { week: 8, title: "Orqanlar formalaşır", description: "Əsas orqanlar inkişaf etməyə başlayır", icon: "🧬" },
      { week: 12, title: "I trimester sonu", description: "Toksikozu azalır, enerji artır", icon: "✨" },
      { week: 16, title: "Cinsin müəyyən olunması", description: "USM-də cinsi müəyyən etmək olar", icon: "🔍" },
      { week: 20, title: "İlk hərəkətlər", description: "Körpənin hərəkətlərini hiss edirsiniz", icon: "🤸" },
      { week: 24, title: "Yaşama qabiliyyəti", description: "Vaxtından əvvəl doğulsa yaşaya bilər", icon: "🏥" },
      { week: 28, title: "III trimester", description: "Körpə sürətlə böyüyür, göz açıb-yumur", icon: "👁️" },
      { week: 32, title: "Ciyərlər yetişir", description: "Ciyərlər inkişaf edir, baş aşağı dönür", icon: "🫁" },
      { week: 36, title: "Tam formalaşma", description: "Körpə demək olar tam formalaşıb", icon: "👶" },
      { week: 37, title: "Tam müddətli", description: "Bu həftədən doğuş normal sayılır", icon: "✅" },
      { week: 40, title: "Təxmini doğuş tarixi", description: "Doğuş gözlənilir!", icon: "🎉" },
    ],
    babySizes: [
      { week: 8, length: "1.6 sm", weight: "1 q", comparison: "Moruq" },
      { week: 12, length: "5.4 sm", weight: "14 q", comparison: "Gavalı" },
      { week: 16, length: "11.6 sm", weight: "100 q", comparison: "Avokado" },
      { week: 20, length: "16.5 sm", weight: "300 q", comparison: "Banan" },
      { week: 24, length: "30 sm", weight: "600 q", comparison: "Qarğıdalı" },
      { week: 28, length: "37 sm", weight: "1 kq", comparison: "Badımcan" },
      { week: 32, length: "42 sm", weight: "1.7 kq", comparison: "Qabaq" },
      { week: 36, length: "47 sm", weight: "2.6 kq", comparison: "Yetişmiş ananas" },
      { week: 40, length: "51 sm", weight: "3.4 kq", comparison: "Qarpız" },
    ],
  },
  en: {
    title: "Pregnancy week calculator",
    description: "Track your pregnancy week, due date, and baby's development.",
    breadcrumbCategory: "Health",
    formulaTitle: "How is the due date calculated?",
    formulaContent: `Naegele's rule:
Estimated due date = Last menstrual period (LMP) + 280 days (40 weeks)

Calculation methods:
• LMP (Last Menstrual Period): most widely used method
• Conception date: LMP + 14 days = conception
• Ultrasound: based on baby's age at ultrasound date
• IVF: based on embryo transfer date

Trimesters:
• 1st Trimester: 1–12 weeks (organs form)
• 2nd Trimester: 13–27 weeks (rapid growth)
• 3rd Trimester: 28–40 weeks (maturing, preparation)

Note: The due date is an estimate. Only ~5% of babies are born on the exact date.
Normal delivery occurs between 37–42 weeks.`,
    calcMethod: "Calculation method",
    methodLmp: "Last menstrual period",
    methodConception: "Conception date",
    methodUltrasound: "Ultrasound result",
    methodIvf: "IVF transfer",
    dateLabel: "Last menstrual period",
    dateLabelConception: "Conception date",
    dateLabelUltrasound: "Ultrasound date",
    dateLabelIvf: "IVF transfer date",
    ultrasoundAge: "Gestational age at ultrasound",
    week: "week",
    day: "day",
    currentWeek: "Current pregnancy week",
    weekPlusDay: "weeks + days",
    zeroWeek: "0 weeks",
    completed: "completed",
    fortyWeek: "40 weeks",
    estimatedDueDate: "Estimated due date",
    daysRemaining: "days remaining",
    conceptionDate: "Conception date",
    approximate: "Approximate",
    elapsedTime: "Time elapsed",
    babySizeTitle: "Baby's approximate size",
    length: "Length",
    weight: "Weight",
    comparison: "Comparison",
    trimesterChart: "Trimester chart",
    fromDate: " from",
    currently: "Current",
    developmentStages: "Development milestones",
    babySizeByWeek: "Baby size by week",
    noteTitle: "Note:",
    noteText: "This calculation is approximate. The actual delivery date may be 2 weeks earlier or later. Normal delivery occurs between 37–42 weeks. Regular doctor visits and ultrasound monitoring are essential.",
    emptyState: "Enter a date to see the result.",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    trimesters: [
      { name: "1st Trimester", weeks: "1–12 weeks", icon: "🌱", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
      { name: "2nd Trimester", weeks: "13–27 weeks", icon: "🌸", color: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
      { name: "3rd Trimester", weeks: "28–40 weeks", icon: "👶", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    ],
    milestones: [
      { week: 4, title: "Heartbeat", description: "The embryo's heart begins to beat", icon: "💓" },
      { week: 8, title: "Organs forming", description: "Major organs begin to develop", icon: "🧬" },
      { week: 12, title: "End of 1st trimester", description: "Morning sickness decreases, energy increases", icon: "✨" },
      { week: 16, title: "Gender determination", description: "Gender can be determined via ultrasound", icon: "🔍" },
      { week: 20, title: "First movements", description: "You can feel the baby's movements", icon: "🤸" },
      { week: 24, title: "Viability", description: "Baby can survive if born prematurely", icon: "🏥" },
      { week: 28, title: "3rd trimester", description: "Baby grows rapidly, opens and closes eyes", icon: "👁️" },
      { week: 32, title: "Lungs maturing", description: "Lungs develop, baby turns head down", icon: "🫁" },
      { week: 36, title: "Fully formed", description: "Baby is almost fully formed", icon: "👶" },
      { week: 37, title: "Full term", description: "Delivery is considered normal from this week", icon: "✅" },
      { week: 40, title: "Estimated due date", description: "Delivery expected!", icon: "🎉" },
    ],
    babySizes: [
      { week: 8, length: "1.6 cm", weight: "1 g", comparison: "Raspberry" },
      { week: 12, length: "5.4 cm", weight: "14 g", comparison: "Plum" },
      { week: 16, length: "11.6 cm", weight: "100 g", comparison: "Avocado" },
      { week: 20, length: "16.5 cm", weight: "300 g", comparison: "Banana" },
      { week: 24, length: "30 cm", weight: "600 g", comparison: "Corn" },
      { week: 28, length: "37 cm", weight: "1 kg", comparison: "Eggplant" },
      { week: 32, length: "42 cm", weight: "1.7 kg", comparison: "Squash" },
      { week: 36, length: "47 cm", weight: "2.6 kg", comparison: "Ripe pineapple" },
      { week: 40, length: "51 cm", weight: "3.4 kg", comparison: "Watermelon" },
    ],
  },
  ru: {
    title: "Калькулятор недель беременности",
    description: "Отслеживайте неделю беременности, дату родов и развитие малыша.",
    breadcrumbCategory: "Здоровье",
    formulaTitle: "Как рассчитывается дата родов?",
    formulaContent: `Формула Негеле:
Предполагаемая дата родов = Дата последних месячных (ДПМ) + 280 дней (40 недель)

Методы расчёта:
• ДПМ (Дата последних месячных): самый распространённый метод
• Дата зачатия: ДПМ + 14 дней = зачатие
• УЗИ: на основе возраста ребёнка на дату УЗИ
• ЭКО: на основе даты переноса эмбриона

Триместры:
• I триместр: 1–12 недель (формируются органы)
• II триместр: 13–27 недель (быстрый рост)
• III триместр: 28–40 недель (созревание, подготовка)

Примечание: Дата родов приблизительная. Только ~5% детей рождаются точно в эту дату.
Нормальные роды происходят между 37–42 неделями.`,
    calcMethod: "Метод расчёта",
    methodLmp: "Дата последних месячных",
    methodConception: "Дата зачатия",
    methodUltrasound: "Результат УЗИ",
    methodIvf: "Перенос ЭКО",
    dateLabel: "Дата последних месячных",
    dateLabelConception: "Дата зачатия",
    dateLabelUltrasound: "Дата УЗИ",
    dateLabelIvf: "Дата переноса ЭКО",
    ultrasoundAge: "Срок беременности по УЗИ",
    week: "неделя",
    day: "день",
    currentWeek: "Текущая неделя беременности",
    weekPlusDay: "недель + дней",
    zeroWeek: "0 недель",
    completed: "завершено",
    fortyWeek: "40 недель",
    estimatedDueDate: "Предполагаемая дата родов",
    daysRemaining: "дней осталось",
    conceptionDate: "Дата зачатия",
    approximate: "Приблизительно",
    elapsedTime: "Прошло времени",
    babySizeTitle: "Примерный размер малыша",
    length: "Длина",
    weight: "Вес",
    comparison: "Сравнение",
    trimesterChart: "Таблица триместров",
    fromDate: " с",
    currently: "Сейчас",
    developmentStages: "Этапы развития",
    babySizeByWeek: "Размер ребёнка по неделям",
    noteTitle: "Внимание:",
    noteText: "Этот расчёт носит приблизительный характер. Фактическая дата родов может быть на 2 недели раньше или позже. Нормальные роды происходят между 37–42 неделями. Регулярные осмотры врача и УЗИ-контроль необходимы.",
    emptyState: "Введите дату, чтобы увидеть результат.",
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    trimesters: [
      { name: "I триместр", weeks: "1–12 недель", icon: "🌱", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
      { name: "II триместр", weeks: "13–27 недель", icon: "🌸", color: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
      { name: "III триместр", weeks: "28–40 недель", icon: "👶", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    ],
    milestones: [
      { week: 4, title: "Сердцебиение", description: "Сердце эмбриона начинает биться", icon: "💓" },
      { week: 8, title: "Формирование органов", description: "Основные органы начинают развиваться", icon: "🧬" },
      { week: 12, title: "Конец I триместра", description: "Токсикоз уменьшается, энергия растёт", icon: "✨" },
      { week: 16, title: "Определение пола", description: "На УЗИ можно определить пол", icon: "🔍" },
      { week: 20, title: "Первые движения", description: "Вы чувствуете движения малыша", icon: "🤸" },
      { week: 24, title: "Жизнеспособность", description: "При преждевременных родах может выжить", icon: "🏥" },
      { week: 28, title: "III триместр", description: "Малыш быстро растёт, открывает и закрывает глаза", icon: "👁️" },
      { week: 32, title: "Лёгкие созревают", description: "Лёгкие развиваются, голова поворачивается вниз", icon: "🫁" },
      { week: 36, title: "Полное формирование", description: "Малыш практически полностью сформирован", icon: "👶" },
      { week: 37, title: "Доношенный срок", description: "С этой недели роды считаются нормальными", icon: "✅" },
      { week: 40, title: "Предполагаемая дата родов", description: "Ожидаются роды!", icon: "🎉" },
    ],
    babySizes: [
      { week: 8, length: "1,6 см", weight: "1 г", comparison: "Малина" },
      { week: 12, length: "5,4 см", weight: "14 г", comparison: "Слива" },
      { week: 16, length: "11,6 см", weight: "100 г", comparison: "Авокадо" },
      { week: 20, length: "16,5 см", weight: "300 г", comparison: "Банан" },
      { week: 24, length: "30 см", weight: "600 г", comparison: "Кукуруза" },
      { week: 28, length: "37 см", weight: "1 кг", comparison: "Баклажан" },
      { week: 32, length: "42 см", weight: "1,7 кг", comparison: "Тыква" },
      { week: 36, length: "47 см", weight: "2,6 кг", comparison: "Спелый ананас" },
      { week: 40, length: "51 см", weight: "3,4 кг", comparison: "Арбуз" },
    ],
  },
};

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PregnancyCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [method, setMethod] = useState<CalcMethod>("lmp");
  const [dateInput, setDateInput] = useState("");
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState("");
  const [ultrasoundDays, setUltrasoundDays] = useState("");

  function formatDate(date: Date): string {
    return `${date.getDate()} ${pt.months[date.getMonth()]} ${date.getFullYear()}`;
  }

  const result = useMemo(() => {
    if (!dateInput) return null;

    const inputDate = new Date(dateInput);
    if (isNaN(inputDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lmpDate: Date;

    switch (method) {
      case "lmp":
        lmpDate = inputDate;
        break;
      case "conception":
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
        break;
      case "ultrasound": {
        const usWeeks = parseInt(ultrasoundWeeks) || 0;
        const usDays = parseInt(ultrasoundDays) || 0;
        const totalDays = usWeeks * 7 + usDays;
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - totalDays);
        break;
      }
      case "ivf":
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
        break;
      default:
        return null;
    }

    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);

    const daysPassed = daysBetween(lmpDate, today);
    if (daysPassed < 0) return null;

    const currentWeek = Math.floor(daysPassed / 7);
    const currentDay = daysPassed % 7;
    const daysRemaining = daysBetween(today, dueDate);
    const weeksRemaining = Math.floor(daysRemaining / 7);
    const totalDays = 280;
    const progress = Math.min(100, (daysPassed / totalDays) * 100);

    let trimesterIndex: number;
    if (currentWeek < 13) trimesterIndex = 0;
    else if (currentWeek < 28) trimesterIndex = 1;
    else trimesterIndex = 2;

    const conceptionDate = new Date(lmpDate);
    conceptionDate.setDate(conceptionDate.getDate() + 14);

    const trimester2Start = new Date(lmpDate);
    trimester2Start.setDate(trimester2Start.getDate() + 13 * 7);
    const trimester3Start = new Date(lmpDate);
    trimester3Start.setDate(trimester3Start.getDate() + 28 * 7);

    const babySize = [...pt.babySizes].reverse().find((s) => currentWeek >= s.week) || pt.babySizes[0];

    const passedMilestones = pt.milestones.filter((m) => currentWeek >= m.week);
    const upcomingMilestones = pt.milestones.filter((m) => currentWeek < m.week);

    return {
      lmpDate,
      dueDate,
      conceptionDate,
      currentWeek: Math.min(currentWeek, 42),
      currentDay,
      daysPassed: Math.min(daysPassed, 294),
      daysRemaining: Math.max(0, daysRemaining),
      weeksRemaining: Math.max(0, weeksRemaining),
      progress: Math.min(100, progress),
      trimesterIndex,
      trimester2Start,
      trimester3Start,
      babySize,
      passedMilestones,
      upcomingMilestones,
    };
  }, [dateInput, method, ultrasoundWeeks, ultrasoundDays, pt.babySizes, pt.milestones]);

  const methods: { id: CalcMethod; label: string; icon: string }[] = [
    { id: "lmp", label: pt.methodLmp, icon: "📅" },
    { id: "conception", label: pt.methodConception, icon: "🧬" },
    { id: "ultrasound", label: pt.methodUltrasound, icon: "🔍" },
    { id: "ivf", label: pt.methodIvf, icon: "🏥" },
  ];

  const dateLabel = method === "lmp" ? pt.dateLabel : method === "conception" ? pt.dateLabelConception : method === "ultrasound" ? pt.dateLabelUltrasound : pt.dateLabelIvf;

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
      relatedIds={["bmi", "bmr", "water-intake", "ideal-weight"]}
    >
      {/* Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">{pt.calcMethod}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                method === m.id
                  ? "border-pink-500 bg-pink-50 ring-2 ring-pink-500"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <span className="text-xl block mb-1">{m.icon}</span>
              <p className="text-xs font-medium text-foreground">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📅 {dateLabel}
          </label>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
          />
        </div>

        {method === "ultrasound" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              🔍 {pt.ultrasoundAge}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={ultrasoundWeeks}
                  onChange={(e) => setUltrasoundWeeks(e.target.value)}
                  placeholder="12"
                  min="0"
                  max="42"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                />
                <p className="text-xs text-muted mt-1 text-center">{pt.week}</p>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={ultrasoundDays}
                  onChange={(e) => setUltrasoundDays(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="6"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                />
                <p className="text-xs text-muted mt-1 text-center">{pt.day}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Current Week */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-pink-100 mb-1">{pt.currentWeek}</p>
            <p className="text-5xl font-bold">{result.currentWeek}<span className="text-2xl">+{result.currentDay}</span></p>
            <p className="text-sm text-pink-200 mt-1">{pt.weekPlusDay}</p>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20`}>
                {pt.trimesters[result.trimesterIndex].icon} {pt.trimesters[result.trimesterIndex].name}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-xs text-muted mb-2">
              <span>{pt.zeroWeek}</span>
              <span>{result.progress.toFixed(0)}% {pt.completed}</span>
              <span>{pt.fortyWeek}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-pink-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${result.progress}%` }}
              />
            </div>
            {/* Trimester markers */}
            <div className="relative w-full h-0">
              <div className="absolute top-1 left-[32.5%] text-[10px] text-muted">|13h</div>
              <div className="absolute top-1 left-[70%] text-[10px] text-muted">|28h</div>
            </div>
          </div>

          {/* Key Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <span className="text-2xl block mb-1">📅</span>
              <p className="text-xs text-muted mb-1">{pt.estimatedDueDate}</p>
              <p className="text-lg font-bold text-foreground">{formatDate(result.dueDate)}</p>
              <p className="text-xs text-muted mt-1">{result.daysRemaining} {pt.daysRemaining}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <span className="text-2xl block mb-1">🧬</span>
              <p className="text-xs text-muted mb-1">{pt.conceptionDate}</p>
              <p className="text-lg font-bold text-foreground">{formatDate(result.conceptionDate)}</p>
              <p className="text-xs text-muted mt-1">{pt.approximate}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <span className="text-2xl block mb-1">⏱️</span>
              <p className="text-xs text-muted mb-1">{pt.elapsedTime}</p>
              <p className="text-lg font-bold text-foreground">{result.daysPassed} {pt.day}</p>
              <p className="text-xs text-muted mt-1">{result.currentWeek} {pt.week} {result.currentDay} {pt.day}</p>
            </div>
          </div>

          {/* Baby Size */}
          <div className={`${pt.trimesters[result.trimesterIndex].bgColor} rounded-2xl border ${pt.trimesters[result.trimesterIndex].borderColor} p-5`}>
            <h4 className={`font-semibold ${pt.trimesters[result.trimesterIndex].color} mb-3 flex items-center gap-2`}>
              <span>👶</span>
              {pt.babySizeTitle} ({result.currentWeek}. {pt.week})
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">{pt.length}</p>
                <p className="text-xl font-bold text-foreground">{result.babySize.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.weight}</p>
                <p className="text-xl font-bold text-foreground">{result.babySize.weight}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{pt.comparison}</p>
                <p className="text-xl font-bold text-foreground">{result.babySize.comparison}</p>
              </div>
            </div>
          </div>

          {/* Trimester Timeline */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                {pt.trimesterChart}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {pt.trimesters.map((t, i) => {
                const isActive = i === result.trimesterIndex;
                const dates = [
                  formatDate(result.lmpDate),
                  formatDate(result.trimester2Start),
                  formatDate(result.trimester3Start),
                ];
                return (
                  <div key={t.name} className={`flex items-center justify-between px-5 py-4 ${isActive ? t.bgColor : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? "font-semibold" : ""} text-foreground`}>{t.name}</p>
                        <p className="text-xs text-muted">{t.weeks}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted">{dates[i]}{pt.fromDate}</p>
                      {isActive && (
                        <span className="text-xs bg-foreground text-white px-2 py-0.5 rounded-full mt-1 inline-block">{pt.currently}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>🎯</span>
                {pt.developmentStages}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {pt.milestones.map((m) => {
                const isPassed = result.currentWeek >= m.week;
                const isCurrent = result.currentWeek >= m.week - 1 && result.currentWeek <= m.week;
                return (
                  <div key={m.week} className={`flex items-center gap-3 px-5 py-3 ${isCurrent ? "bg-pink-50" : ""}`}>
                    <span className={`text-lg ${isPassed ? "" : "opacity-40"}`}>{m.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm ${isPassed ? "font-medium text-foreground" : "text-muted"}`}>
                        {m.week}. {pt.week} — {m.title}
                      </p>
                      <p className="text-xs text-muted">{m.description}</p>
                    </div>
                    {isPassed && <span className="text-green-500 text-sm">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Baby Size Chart */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📏</span>
                {pt.babySizeByWeek}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {pt.babySizes.map((s, idx) => {
                const isActive = result.currentWeek >= s.week && result.currentWeek < (pt.babySizes[idx + 1]?.week || 99);
                return (
                  <div key={s.week} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-pink-50" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted w-10">{s.week}h</span>
                      <span className="text-sm text-foreground">{s.comparison}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted">{s.length}</span>
                      <span className="font-medium text-foreground">{s.weight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{pt.noteTitle}</span> {pt.noteText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🤰</span>
          <p>{pt.emptyState}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
