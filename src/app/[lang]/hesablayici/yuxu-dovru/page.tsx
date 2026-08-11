"use client";

import { useState, useEffect, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

const FALL_ASLEEP_MINUTES = 14;
const CYCLE_MINUTES = 90;

type Mode = "wakeup" | "sleepNow" | "sleepAt";

const t: Record<Lang, {
  title: string; description: string; bcat: string; blabel: string;
  formulaTitle: string; formulaContent: string;
  modeLabel: string;
  modeWakeup: string; modeSleepNow: string; modeSleepAt: string;
  wakeAtPrompt: string; sleepAtPrompt: string;
  wakeTimeLabel: string; sleepTimeLabel: string;
  bestTimes: string; cyclesLabel: string; durationLabel: string;
  recommended: string; quality: string;
  qualityIdeal: string; qualityGood: string; qualityShort: string;
  ifSleepNow: string; nowLabel: string;
  fallAsleepNote: string;
  cycle: string;
}> = {
  az: {
    title: "Yuxu dövrü hesablayıcısı",
    description: "Yuxu 90 dəqiqəlik dövrlərdən ibarətdir. Dövrün sonunda oyanmaq sizi gümrah, ortasında oyanmaq isə yorğun edir.",
    bcat: "Sağlamlıq", blabel: "Yuxu dövrü",
    formulaTitle: "Yuxu dövrü necə işləyir?",
    formulaContent: `İnsan yuxusu orta hesabla 90 dəqiqəlik fazalardan (siklus) ibarətdir. Hər siklus 4-5 mərhələni əhatə edir: yüngül yuxu → dərin yuxu → REM (yuxu görmə).

Düstur:
• Yatma vaxtı = İndi + 14 dəq (yuxuya getmə müddəti)
• Hər oyanma vaxtı = Yatma vaxtı + (90 dəq × N siklus)

Optimal yuxu: 5 və ya 6 siklus (7.5 saat və ya 9 saat).

Nümunə: əgər saat 23:00-da yatağa girsəniz:
• 06:30-da oyansanız (5 siklus = 7.5 saat) — gümrah
• 08:00-da oyansanız (6 siklus = 9 saat) — çox gümrah

Yuxunun ortasında (məsələn 4 siklus + 30 dəq) oyanmaq sizi yorğun edir.`,
    modeLabel: "Hesablama növü",
    modeWakeup: "Konkret saatda oyanmaq istəyirəm",
    modeSleepNow: "İndi yatsam, neçədə oyanım?",
    modeSleepAt: "Konkret saatda yatacam",
    wakeAtPrompt: "Hansı saatda oyanmaq istəyirsiniz?",
    sleepAtPrompt: "Hansı saatda yatacaqsınız?",
    wakeTimeLabel: "Oyanma saatı", sleepTimeLabel: "Yatmalı saatınız",
    bestTimes: "Tövsiyə olunan vaxtlar", cyclesLabel: "siklus", durationLabel: "müddət",
    recommended: "Tövsiyə",
    quality: "Keyfiyyət",
    qualityIdeal: "İdeal",
    qualityGood: "Yaxşı",
    qualityShort: "Qısa",
    ifSleepNow: "Əgər indi yatsanız:",
    nowLabel: "Hazırda",
    fallAsleepNote: "Yuxuya getmə müddəti: 14 dəqiqə nəzərə alınır",
    cycle: "siklus",
  },
  en: {
    title: "Sleep cycle calculator",
    description: "Sleep consists of 90-minute cycles. Waking up at the end of a cycle leaves you refreshed; mid-cycle leaves you tired.",
    bcat: "Health", blabel: "Sleep cycle",
    formulaTitle: "How does sleep cycle work?",
    formulaContent: `Human sleep consists of 90-minute cycles. Each cycle has 4-5 stages: light sleep → deep sleep → REM.

Formula:
• Sleep time = Now + 14 min (time to fall asleep)
• Wake time = Sleep time + (90 min × N cycles)

Optimal: 5 or 6 cycles (7.5h or 9h).`,
    modeLabel: "Calculation mode",
    modeWakeup: "I want to wake up at a specific time",
    modeSleepNow: "If I sleep now, when should I wake up?",
    modeSleepAt: "I'll sleep at a specific time",
    wakeAtPrompt: "What time do you want to wake up?",
    sleepAtPrompt: "What time will you go to bed?",
    wakeTimeLabel: "Wake time", sleepTimeLabel: "Sleep time",
    bestTimes: "Recommended times", cyclesLabel: "cycles", durationLabel: "duration",
    recommended: "Recommended",
    quality: "Quality",
    qualityIdeal: "Ideal",
    qualityGood: "Good",
    qualityShort: "Short",
    ifSleepNow: "If you sleep now:",
    nowLabel: "Now",
    fallAsleepNote: "14 minutes of falling asleep is included",
    cycle: "cycle",
  },
  ru: {
    title: "Калькулятор циклов сна",
    description: "Сон состоит из 90-минутных циклов. Пробуждение в конце цикла даёт бодрость, а в середине — усталость.",
    bcat: "Здоровье", blabel: "Циклы сна",
    formulaTitle: "Как работают циклы сна?",
    formulaContent: `Сон человека состоит из 90-минутных циклов. Каждый цикл — 4-5 стадий: лёгкий сон → глубокий сон → REM.

Формула:
• Время засыпания = Сейчас + 14 мин
• Время пробуждения = Время засыпания + (90 мин × N циклов)

Оптимально: 5 или 6 циклов (7.5ч или 9ч).`,
    modeLabel: "Режим расчёта",
    modeWakeup: "Я хочу проснуться в определённое время",
    modeSleepNow: "Если я лягу сейчас, когда вставать?",
    modeSleepAt: "Я лягу в определённое время",
    wakeAtPrompt: "Во сколько вы хотите проснуться?",
    sleepAtPrompt: "Во сколько вы ляжете спать?",
    wakeTimeLabel: "Время пробуждения", sleepTimeLabel: "Время отхода ко сну",
    bestTimes: "Рекомендуемое время", cyclesLabel: "циклов", durationLabel: "продолжительность",
    recommended: "Рекомендация",
    quality: "Качество",
    qualityIdeal: "Идеально",
    qualityGood: "Хорошо",
    qualityShort: "Коротко",
    ifSleepNow: "Если лечь сейчас:",
    nowLabel: "Сейчас",
    fallAsleepNote: "Учитывается 14 минут на засыпание",
    cycle: "цикл",
  },
};

function pad(n: number) { return n.toString().padStart(2, "0"); }
function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDuration(minutes: number, lang: Lang): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (lang === "az") return m === 0 ? `${h} saat` : `${h} saat ${m} dəq`;
  if (lang === "ru") return m === 0 ? `${h} ч` : `${h} ч ${m} мин`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

interface SleepOption {
  time: Date;
  cycles: number;
  duration: number;
  quality: "ideal" | "good" | "short";
  recommended: boolean;
}

export default function YuxuDovru() {
  const { lang } = useLanguage();
  const pt = t[lang];
  const [mode, setMode] = useState<Mode>("wakeup");
  const [now, setNow] = useState<Date | null>(null);
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [nowTime, setNowTime] = useState(""); // "indi yatsam" rejimində istifadəçinin daxil etdiyi vaxt

  // Hydration uyğun: indiki vaxtı yalnız brauzerdə (mount-dan sonra) yazırıq
  useEffect(() => {
    const d = new Date();
    setNow(d);
    setNowTime((prev) => prev || `${pad(d.getHours())}:${pad(d.getMinutes())}`);
  }, []);

  const options: SleepOption[] = useMemo(() => {
    if (mode === "sleepNow" && (!now || !nowTime)) return [];

    const ref = now ?? new Date();
    const parseTimeOf = (s: string, futureIfPast: boolean): Date => {
      const [h, m] = s.split(":").map(Number);
      const d = new Date(ref);
      d.setHours(h, m, 0, 0);
      if (futureIfPast && now && d <= now) {
        d.setDate(d.getDate() + 1);
      }
      return d;
    };

    if (mode === "wakeup") {
      const wake = parseTimeOf(wakeTime, true);
      const result: SleepOption[] = [];
      for (let cycles = 1; cycles <= 6; cycles++) {
        const totalMin = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
        const sleep = new Date(wake.getTime() - totalMin * 60000);
        const quality = cycles === 5 || cycles === 6 ? "ideal" : cycles === 4 ? "good" : "short";
        result.push({
          time: sleep,
          cycles,
          duration: cycles * CYCLE_MINUTES,
          quality,
          recommended: cycles === 5 || cycles === 6,
        });
      }
      return result.reverse();
    } else {
      const start = mode === "sleepNow" ? parseTimeOf(nowTime, false) : parseTimeOf(sleepTime, false);
      const sleepStart = new Date(start.getTime() + FALL_ASLEEP_MINUTES * 60000);
      const result: SleepOption[] = [];
      for (let cycles = 1; cycles <= 6; cycles++) {
        const wake = new Date(sleepStart.getTime() + cycles * CYCLE_MINUTES * 60000);
        const quality = cycles === 5 || cycles === 6 ? "ideal" : cycles === 4 ? "good" : "short";
        result.push({
          time: wake,
          cycles,
          duration: cycles * CYCLE_MINUTES,
          quality,
          recommended: cycles === 5 || cycles === 6,
        });
      }
      return result;
    }
  }, [mode, wakeTime, sleepTime, now, nowTime]);

  const qualityClass = (q: SleepOption["quality"]) => {
    if (q === "ideal") return "bg-green-50 border-green-300 text-green-800";
    if (q === "good") return "bg-blue-50 border-blue-300 text-blue-800";
    return "bg-gray-50 border-gray-200 text-gray-700";
  };

  const qualityLabel = (q: SleepOption["quality"]) => {
    if (q === "ideal") return pt.qualityIdeal;
    if (q === "good") return pt.qualityGood;
    return pt.qualityShort;
  };

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[{ label: pt.bcat, href: "/?category=health" }, { label: pt.blabel }]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["bmi", "ideal-ceki", "yas"]}
    >
      {/* Mode buttons */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.modeLabel}</label>
        <div className="flex flex-col gap-2">
          {(["wakeup", "sleepNow", "sleepAt"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                mode === m ? "border-primary bg-primary-light text-primary-dark font-semibold" : "border-border bg-white text-foreground hover:border-primary/30"
              }`}
            >
              {m === "wakeup" ? `⏰ ${pt.modeWakeup}` : m === "sleepNow" ? `🛏️ ${pt.modeSleepNow}` : `🌙 ${pt.modeSleepAt}`}
            </button>
          ))}
        </div>
      </div>

      {/* Time input */}
      {mode === "wakeup" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">{pt.wakeAtPrompt}</label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          />
        </div>
      )}
      {mode === "sleepAt" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">{pt.sleepAtPrompt}</label>
          <input
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          />
        </div>
      )}
      {mode === "sleepNow" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            🕐 {pt.nowLabel}
          </label>
          <input
            type="time"
            value={nowTime}
            onChange={(e) => setNowTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted">{pt.fallAsleepNote}</p>
            {now && (
              <button
                type="button"
                onClick={() => setNowTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`)}
                className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
              >
                ↻ {formatTime(now)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <h3 className="text-base font-bold text-foreground mb-3">
          {mode === "sleepNow" ? `🌙 ${pt.ifSleepNow}` : `✨ ${pt.bestTimes}`}
        </h3>
        <div className="space-y-2">
          {options.map((opt) => (
            <div
              key={opt.cycles}
              className={`rounded-xl border-2 p-4 flex items-center justify-between ${qualityClass(opt.quality)} ${
                opt.recommended ? "ring-2 ring-offset-1 ring-current" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tabular-nums">{formatTime(opt.time)}</span>
                  {opt.recommended && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-current text-white font-bold">
                      ⭐ {pt.recommended}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-80 mt-0.5">
                  {opt.cycles} {pt.cyclesLabel} • {formatDuration(opt.duration, lang)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">{pt.quality}</p>
                <p className="text-sm font-bold">{qualityLabel(opt.quality)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CalculatorLayout>
  );
}
