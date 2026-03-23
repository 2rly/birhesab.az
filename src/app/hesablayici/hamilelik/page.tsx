"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type CalcMethod = "lmp" | "conception" | "ultrasound" | "ivf";

interface TrimesterInfo {
  name: string;
  weeks: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const trimesters: TrimesterInfo[] = [
  { name: "I Trimester", weeks: "1–12 həftə", icon: "🌱", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { name: "II Trimester", weeks: "13–27 həftə", icon: "🌸", color: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  { name: "III Trimester", weeks: "28–40 həftə", icon: "👶", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
];

interface MilestoneItem {
  week: number;
  title: string;
  description: string;
  icon: string;
}

const milestones: MilestoneItem[] = [
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
];

// Körpənin təxmini ölçüləri (həftəyə görə)
const babySizes: { week: number; length: string; weight: string; comparison: string }[] = [
  { week: 8, length: "1.6 sm", weight: "1 q", comparison: "Moruq" },
  { week: 12, length: "5.4 sm", weight: "14 q", comparison: "Gavalı" },
  { week: 16, length: "11.6 sm", weight: "100 q", comparison: "Avokado" },
  { week: 20, length: "16.5 sm", weight: "300 q", comparison: "Banan" },
  { week: 24, length: "30 sm", weight: "600 q", comparison: "Qarğıdalı" },
  { week: 28, length: "37 sm", weight: "1 kq", comparison: "Badımcan" },
  { week: 32, length: "42 sm", weight: "1.7 kq", comparison: "Qabaq" },
  { week: 36, length: "47 sm", weight: "2.6 kq", comparison: "Yetişmiş ananas" },
  { week: 40, length: "51 sm", weight: "3.4 kq", comparison: "Qarpız" },
];

function formatDate(date: Date): string {
  const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
    "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PregnancyCalculator() {
  const [method, setMethod] = useState<CalcMethod>("lmp");
  const [dateInput, setDateInput] = useState("");
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState("");
  const [ultrasoundDays, setUltrasoundDays] = useState("");

  const result = useMemo(() => {
    if (!dateInput) return null;

    const inputDate = new Date(dateInput);
    if (isNaN(inputDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lmpDate: Date; // Son adet tarixi (hesablama üçün)

    switch (method) {
      case "lmp":
        lmpDate = inputDate;
        break;
      case "conception":
        // Konsepsiya = LMP + 14 gün, yəni LMP = konsepsiya - 14 gün
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
        break;
      case "ultrasound": {
        const usWeeks = parseInt(ultrasoundWeeks) || 0;
        const usDays = parseInt(ultrasoundDays) || 0;
        const totalDays = usWeeks * 7 + usDays;
        // USM tarixində neçə gün idi → LMP-ni tapırıq
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - totalDays);
        break;
      }
      case "ivf":
        // IVF transfer = konsepsiya kimi (adətən 3 və ya 5 günlük embrion)
        // Sadəlik üçün konsepsiya kimi hesablayırıq
        lmpDate = new Date(inputDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
        break;
      default:
        return null;
    }

    // Naegele düsturu: LMP + 280 gün (40 həftə)
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);

    // Hazırkı həftə
    const daysPassed = daysBetween(lmpDate, today);
    if (daysPassed < 0) return null;

    const currentWeek = Math.floor(daysPassed / 7);
    const currentDay = daysPassed % 7;
    const daysRemaining = daysBetween(today, dueDate);
    const weeksRemaining = Math.floor(daysRemaining / 7);
    const totalDays = 280;
    const progress = Math.min(100, (daysPassed / totalDays) * 100);

    // Trimester
    let trimesterIndex: number;
    if (currentWeek < 13) trimesterIndex = 0;
    else if (currentWeek < 28) trimesterIndex = 1;
    else trimesterIndex = 2;

    // Konsepsiya tarixi (təxmini)
    const conceptionDate = new Date(lmpDate);
    conceptionDate.setDate(conceptionDate.getDate() + 14);

    // Trimester tarixləri
    const trimester2Start = new Date(lmpDate);
    trimester2Start.setDate(trimester2Start.getDate() + 13 * 7);
    const trimester3Start = new Date(lmpDate);
    trimester3Start.setDate(trimester3Start.getDate() + 28 * 7);

    // Körpə ölçüsü
    const babySize = [...babySizes].reverse().find((s) => currentWeek >= s.week) || babySizes[0];

    // Keçmiş milestonelar və gələcək milestonelar
    const passedMilestones = milestones.filter((m) => currentWeek >= m.week);
    const upcomingMilestones = milestones.filter((m) => currentWeek < m.week);

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
  }, [dateInput, method, ultrasoundWeeks, ultrasoundDays]);

  return (
    <CalculatorLayout
      title="Hamiləlik həftə hesablayıcısı"
      description="Hamiləlik həftənizi, doğuş tarixinizi və körpənizin inkişafını izləyin."
      breadcrumbs={[
        { label: "Sağlamlıq", href: "/?category=health" },
        { label: "Hamiləlik hesablayıcısı" },
      ]}
      formulaTitle="Doğuş tarixi necə hesablanır?"
      formulaContent={`Naegele düsturu:
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
Normal doğuş 37–42 həftə arasında baş verir.`}
      relatedIds={["bmi", "bmr", "water-intake", "ideal-weight"]}
    >
      {/* Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Hesablama üsulu</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "lmp" as CalcMethod, label: "Son adet tarixi", icon: "📅" },
            { id: "conception" as CalcMethod, label: "Konsepsiya tarixi", icon: "🧬" },
            { id: "ultrasound" as CalcMethod, label: "USM nəticəsi", icon: "🔍" },
            { id: "ivf" as CalcMethod, label: "IVF transfer", icon: "🏥" },
          ].map((m) => (
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
            📅 {method === "lmp" ? "Son adet tarixi" : method === "conception" ? "Konsepsiya tarixi" : method === "ultrasound" ? "USM tarixi" : "IVF transfer tarixi"}
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
              🔍 USM-də hamiləlik yaşı
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
                <p className="text-xs text-muted mt-1 text-center">həftə</p>
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
                <p className="text-xs text-muted mt-1 text-center">gün</p>
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
            <p className="text-sm text-pink-100 mb-1">Hazırkı hamiləlik həftəsi</p>
            <p className="text-5xl font-bold">{result.currentWeek}<span className="text-2xl">+{result.currentDay}</span></p>
            <p className="text-sm text-pink-200 mt-1">həftə + gün</p>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20`}>
                {trimesters[result.trimesterIndex].icon} {trimesters[result.trimesterIndex].name}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-xs text-muted mb-2">
              <span>0 həftə</span>
              <span>{result.progress.toFixed(0)}% tamamlanıb</span>
              <span>40 həftə</span>
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
              <p className="text-xs text-muted mb-1">Təxmini doğuş tarixi</p>
              <p className="text-lg font-bold text-foreground">{formatDate(result.dueDate)}</p>
              <p className="text-xs text-muted mt-1">{result.daysRemaining} gün qalıb</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <span className="text-2xl block mb-1">🧬</span>
              <p className="text-xs text-muted mb-1">Konsepsiya tarixi</p>
              <p className="text-lg font-bold text-foreground">{formatDate(result.conceptionDate)}</p>
              <p className="text-xs text-muted mt-1">Təxmini</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <span className="text-2xl block mb-1">⏱️</span>
              <p className="text-xs text-muted mb-1">Keçən müddət</p>
              <p className="text-lg font-bold text-foreground">{result.daysPassed} gün</p>
              <p className="text-xs text-muted mt-1">{result.currentWeek} həftə {result.currentDay} gün</p>
            </div>
          </div>

          {/* Baby Size */}
          <div className={`${trimesters[result.trimesterIndex].bgColor} rounded-2xl border ${trimesters[result.trimesterIndex].borderColor} p-5`}>
            <h4 className={`font-semibold ${trimesters[result.trimesterIndex].color} mb-3 flex items-center gap-2`}>
              <span>👶</span>
              Körpənizin təxmini ölçüsü ({result.currentWeek}. həftə)
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">Uzunluq</p>
                <p className="text-xl font-bold text-foreground">{result.babySize.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Çəki</p>
                <p className="text-xl font-bold text-foreground">{result.babySize.weight}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Müqayisə</p>
                <p className="text-xl font-bold text-foreground">{result.babySize.comparison}</p>
              </div>
            </div>
          </div>

          {/* Trimester Timeline */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📊</span>
                Trimester cədvəli
              </h3>
            </div>
            <div className="divide-y divide-border">
              {trimesters.map((t, i) => {
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
                      <p className="text-xs text-muted">{dates[i]}-dən</p>
                      {isActive && (
                        <span className="text-xs bg-foreground text-white px-2 py-0.5 rounded-full mt-1 inline-block">Hazırda</span>
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
                İnkişaf mərhələləri
              </h3>
            </div>
            <div className="divide-y divide-border">
              {milestones.map((m) => {
                const isPassed = result.currentWeek >= m.week;
                const isCurrent = result.currentWeek >= m.week - 1 && result.currentWeek <= m.week;
                return (
                  <div key={m.week} className={`flex items-center gap-3 px-5 py-3 ${isCurrent ? "bg-pink-50" : ""}`}>
                    <span className={`text-lg ${isPassed ? "" : "opacity-40"}`}>{m.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm ${isPassed ? "font-medium text-foreground" : "text-muted"}`}>
                        {m.week}. həftə — {m.title}
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
                Körpənin həftələrə görə ölçüsü
              </h3>
            </div>
            <div className="divide-y divide-border">
              {babySizes.map((s) => {
                const isActive = result.currentWeek >= s.week && result.currentWeek < (babySizes[babySizes.indexOf(s) + 1]?.week || 99);
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
              <span className="font-semibold">Diqqət:</span> Bu hesablama təxmini xarakter daşıyır. Faktiki doğuş
              tarixi 2 həftə əvvəl və ya sonra ola bilər. Normal doğuş 37–42 həftə arasında baş verir.
              Müntəzəm həkim müayinəsi və USM nəzarəti vacibdir.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🤰</span>
          <p>Nəticəni görmək üçün tarix daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
