"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// ============================================================
// Bülleten (xəstəlik vərəqi) pulu hesablayıcısı
// Azərbaycan Respublikası əmək qanunvericiliyi
// ============================================================

// Azərbaycanda rəsmi iş günləri olmayan günlər (2024-2025)
// Bayram və istirahət günləri: şənbə, bazar + rəsmi bayramlar
const PUBLIC_HOLIDAYS_2024 = [
  "2024-01-01", "2024-01-02", // Yeni il
  "2024-01-20", // 20 Yanvar
  "2024-03-08", // Qadınlar günü
  "2024-03-20", "2024-03-21", "2024-03-22", "2024-03-23", "2024-03-24", // Novruz
  "2024-04-10", "2024-04-11", // Ramazan bayramı (təxmini)
  "2024-05-09", // Faşizm üzərində qələbə
  "2024-05-28", // Respublika günü
  "2024-06-15", // Milli qurtuluş günü
  "2024-06-16", "2024-06-17", // Qurban bayramı (təxmini)
  "2024-06-26", // Silahlı qüvvələr günü
  "2024-11-09", // Bayraq günü
  "2024-11-12", // Konstitusiya günü
  "2024-11-17", // Milli dirçəliş günü
  "2024-12-31", // Dünya azərbaycanlıların həmrəylik günü
];

const PUBLIC_HOLIDAYS_2025 = [
  "2025-01-01", "2025-01-02", // Yeni il
  "2025-01-20", // 20 Yanvar
  "2025-03-08", // Qadınlar günü
  "2025-03-20", "2025-03-21", "2025-03-22", "2025-03-23", "2025-03-24", // Novruz
  "2025-03-30", "2025-03-31", // Ramazan bayramı (təxmini)
  "2025-05-09", // Faşizm üzərində qələbə
  "2025-05-28", // Respublika günü
  "2025-06-06", "2025-06-07", // Qurban bayramı (təxmini)
  "2025-06-15", // Milli qurtuluş günü
  "2025-06-26", // Silahlı qüvvələr günü
  "2025-11-09", // Bayraq günü
  "2025-11-12", // Konstitusiya günü
  "2025-11-17", // Milli dirçəliş günü
  "2025-12-31", // Dünya azərbaycanlıların həmrəylik günü
];

const ALL_HOLIDAYS = new Set([...PUBLIC_HOLIDAYS_2024, ...PUBLIC_HOLIDAYS_2025]);

function isWorkDay(date: Date): boolean {
  const day = date.getDay(); // 0=Sunday, 6=Saturday
  if (day === 0 || day === 6) return false;
  const dateStr = date.toISOString().slice(0, 10);
  if (ALL_HOLIDAYS.has(dateStr)) return false;
  return true;
}

function countWorkDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    if (isWorkDay(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BulletenCalculator() {
  const [sickStartStr, setSickStartStr] = useState("");
  const [sickEndStr, setSickEndStr] = useState("");
  const [totalEarnings, setTotalEarnings] = useState("");

  const result = useMemo(() => {
    if (!sickStartStr || !sickEndStr || !totalEarnings) return null;

    const sickStart = new Date(sickStartStr);
    const sickEnd = new Date(sickEndStr);
    const earnings = parseFloat(totalEarnings);

    if (isNaN(sickStart.getTime()) || isNaN(sickEnd.getTime()) || !earnings || earnings <= 0) return null;
    if (sickEnd < sickStart) return null;

    // Xəstəlik vərəqi müddətindəki iş günləri
    const sickWorkDays = countWorkDays(sickStart, sickEnd);

    // Son 12 ay hesablanır (xəstəlik başlanğıcından 12 ay əvvəl)
    const periodEnd = new Date(sickStart);
    periodEnd.setDate(periodEnd.getDate() - 1); // xəstəlikdən bir gün əvvəl
    const periodStart = new Date(periodEnd);
    periodStart.setFullYear(periodStart.getFullYear() - 1);
    periodStart.setDate(periodStart.getDate() + 1); // 12 ay tam

    // Son 12 aydakı iş günləri
    const yearWorkDays = countWorkDays(periodStart, periodEnd);

    if (yearWorkDays <= 0) return null;

    // Bir iş gününə düşən qazanc
    const dailyEarning = earnings / yearWorkDays;

    // Bülleten pulu
    const bulletenAmount = dailyEarning * sickWorkDays;

    // Xəstəlik günlərinin siyahısı
    const sickDaysList: { date: Date; isWorkDay: boolean }[] = [];
    const current = new Date(sickStart);
    while (current <= sickEnd) {
      sickDaysList.push({ date: new Date(current), isWorkDay: isWorkDay(current) });
      current.setDate(current.getDate() + 1);
    }

    return {
      sickStart,
      sickEnd,
      sickWorkDays,
      periodStart,
      periodEnd,
      yearWorkDays,
      earnings,
      dailyEarning,
      bulletenAmount,
      totalCalendarDays: sickDaysList.length,
      sickDaysList,
    };
  }, [sickStartStr, sickEndStr, totalEarnings]);

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base";

  return (
    <CalculatorLayout
      title="Bülleten (xəstəlik vərəqi) hesablayıcısı"
      description="Xəstəlik vərəqi müddəti və son 12 aylıq qazancınıza əsasən bülleten pulunuzu hesablayın."
      breadcrumbs={[
        { label: "Əmək Hüququ", href: "/?category=labor" },
        { label: "Bülleten hesablayıcısı" },
      ]}
      formulaTitle="Bülleten pulu necə hesablanır?"
      formulaContent={`Bülleten (xəstəlik vərəqi) pulu aşağıdakı qaydada hesablanır:

1. Xəstəlik vərəqinin tarixi müəyyən edilir
2. Bu tarixlərdəki iş günləri sayılır (şənbə, bazar və bayram günləri çıxılır)
3. Xəstəlik başlanğıcından əvvəlki son 12 aydakı iş günləri hesablanır
4. Son 12 aydakı ümumi qazanc həmin iş günlərinə bölünür
5. Bir günlük qazanc × xəstəlik iş günləri = bülleten pulu

Nümunə:
Xəstəlik tarixi: 24.02.2025 – 29.02.2025 (4 iş günü)
Son 12 ay: fevral 2024 – yanvar 2025 (241 iş günü)
Ümumi qazanc: 20 500 AZN
Bir iş gününə düşən: 20 500 ÷ 241 = 85,06 AZN
Bülleten pulu: 85,06 × 4 = 340,24 AZN`}
      relatedIds={["salary", "overtime", "vacation-pay", "unemployment-benefit"]}
    >
      {/* Inputs */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📅 Xəstəlik başlanğıc tarixi
            </label>
            <input
              type="date"
              value={sickStartStr}
              onChange={(e) => setSickStartStr(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              📅 Xəstəlik bitmə tarixi
            </label>
            <input
              type="date"
              value={sickEndStr}
              onChange={(e) => setSickEndStr(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            💰 Son 12 aydakı ümumi qazanc (AZN)
          </label>
          <input
            type="number"
            value={totalEarnings}
            onChange={(e) => setTotalEarnings(e.target.value)}
            placeholder="20500"
            min="0"
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">Xəstəlik başlanğıcından əvvəlki 12 ay ərzindəki ümumi əmək haqqı</p>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Əsas nəticə */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">Bülleten pulu</p>
            <p className="text-4xl font-bold">{formatMoney(result.bulletenAmount)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN</p>
          </div>

          {/* Detallı hesablama */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span>
                  Hesablama qaydası
                </h3>
                <span className="text-xs text-muted bg-white px-2 py-0.5 rounded-full border border-border">addım-addım</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {/* Addım 1 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-medium text-foreground">Xəstəlik müddəti</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-muted">Tarix: <span className="font-medium text-foreground">{formatDate(result.sickStart)} – {formatDate(result.sickEnd)}</span></p>
                  <p className="text-xs text-muted">Təqvim günləri: <span className="font-medium text-foreground">{result.totalCalendarDays} gün</span></p>
                  <p className="text-xs text-muted">İş günləri: <span className="font-medium text-primary">{result.sickWorkDays} gün</span></p>
                  {result.totalCalendarDays !== result.sickWorkDays && (
                    <p className="text-[11px] text-muted">(şənbə, bazar və bayram günləri çıxılıb)</p>
                  )}
                </div>
              </div>

              {/* Addım 2 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-medium text-foreground">Son 12 aydakı iş günləri</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-muted">Dövr: <span className="font-medium text-foreground">{formatDate(result.periodStart)} – {formatDate(result.periodEnd)}</span></p>
                  <p className="text-xs text-muted">İş günlərinin sayı: <span className="font-medium text-primary">{result.yearWorkDays} gün</span></p>
                </div>
              </div>

              {/* Addım 3 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-sm font-medium text-foreground">Bir iş gününə düşən qazanc</span>
                </div>
                <div className="ml-8 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    {formatMoney(result.earnings)} AZN ÷ {result.yearWorkDays} gün = <span className="font-bold text-primary">{formatMoney(result.dailyEarning)} AZN/gün</span>
                  </p>
                </div>
              </div>

              {/* Addım 4 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <span className="text-sm font-medium text-foreground">Bülleten pulu</span>
                </div>
                <div className="ml-8 bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-foreground">
                    {formatMoney(result.dailyEarning)} AZN × {result.sickWorkDays} gün = <span className="font-bold text-lg text-green-700">{formatMoney(result.bulletenAmount)} AZN</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Xəstəlik günlərinin cədvəli */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📅</span>
                Xəstəlik günləri
              </h3>
            </div>
            <div className="px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {result.sickDaysList.map((d, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      d.isWorkDay
                        ? "bg-primary-light text-primary border border-primary/20"
                        : "bg-gray-100 text-muted line-through"
                    }`}
                  >
                    {d.date.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", weekday: "short" })}
                    {d.isWorkDay ? " ✓" : ""}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-light border border-primary/20 inline-block" /> İş günü</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> İstirahət / bayram</span>
              </div>
            </div>
          </div>

          {/* Xülasə */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📊</span>
              Xülasə
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">Xəstəlik günü</p>
                <p className="text-lg font-bold text-foreground">{result.sickWorkDays} gün</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Günlük qazanc</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(result.dailyEarning)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">12 aylıq qazanc</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(result.earnings)}₼</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Bülleten pulu</p>
                <p className="text-lg font-bold text-primary">{formatMoney(result.bulletenAmount)}₼</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🏥</span>
          <p>Nəticəni görmək üçün xəstəlik tarixlərini və qazancınızı daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
