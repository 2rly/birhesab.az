"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

const MINIMUM_WAGE = 345; // AZN

type BirthType = "normal" | "complicated" | "twins";

const birthTypes: { value: BirthType; label: string; before: number; after: number; total: number; description: string }[] = [
  { value: "normal", label: "Normal doğuş", before: 70, after: 56, total: 126, description: "70 gün (doğuşdan əvvəl) + 56 gün (doğuşdan sonra)" },
  { value: "complicated", label: "Ağırlaşmış doğuş", before: 70, after: 70, total: 140, description: "70 gün (doğuşdan əvvəl) + 70 gün (doğuşdan sonra)" },
  { value: "twins", label: "Əkiz doğuş", before: 70, after: 110, total: 180, description: "70 gün (doğuşdan əvvəl) + 110 gün (doğuşdan sonra)" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function MaternityLeaveCalculator() {
  const [monthlySalary, setMonthlySalary] = useState("");
  const [birthType, setBirthType] = useState<BirthType>("normal");

  const result = useMemo(() => {
    const salary = parseFloat(monthlySalary);
    if (!salary || salary <= 0) return null;

    const selected = birthTypes.find((b) => b.value === birthType)!;
    const annualSalary = salary * 12;
    const avgDailySalary = annualSalary / 365;

    // Minimum daily salary based on minimum wage
    const minDailySalary = (MINIMUM_WAGE * 12) / 365;
    const effectiveDailySalary = Math.max(avgDailySalary, minDailySalary);

    const beforeBirthPayment = effectiveDailySalary * selected.before;
    const afterBirthPayment = effectiveDailySalary * selected.after;
    const totalPayment = effectiveDailySalary * selected.total;

    return {
      annualSalary,
      avgDailySalary,
      minDailySalary,
      effectiveDailySalary,
      beforeBirthPayment,
      afterBirthPayment,
      totalPayment,
      daysBefore: selected.before,
      daysAfter: selected.after,
      totalDays: selected.total,
      isMinimumApplied: avgDailySalary < minDailySalary,
    };
  }, [monthlySalary, birthType]);

  return (
    <CalculatorLayout
      title="Analiq mezuniyyeti hesablayıcısı"
      description="Azerbaycanda analiq mezuniyyeti odenisini hesablayin -- dogus novune gore gunleri ve mebleghi oyrenim."
      breadcrumbs={[
        { label: "Huquq ve Dovlet", href: "/?category=legal" },
        { label: "Analiq mezuniyyeti hesablayıcısı" },
      ]}
      formulaTitle="Analiq mezuniyyeti necedir hesablanir?"
      formulaContent={`Azerbaycan Emek Mecellesi, Madde 125-126:

Mezuniyyet gunleri:
- Normal dogus: 70 + 56 = 126 teqvim gunu
- Agirlasmis dogus: 70 + 70 = 140 teqvim gunu
- Ekiz dogus: 70 + 110 = 180 teqvim gunu

Odenis formulu:
Orta gunluk emek haqqi = Son 12 ayin emek haqqi / 365
Analiq odenisi = Orta gunluk emek haqqi x Mezuniyyet gunleri

Minimum: Minimum emek haqqina (${MINIMUM_WAGE} AZN) esasen hesablanir.
Odenis DSMF terefinden heyata kecirilir.`}
      relatedIds={["salary", "unemployment-benefit", "disability-benefit", "maternity-leave"]}
    >
      {/* Birth Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Dogus novu</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {birthTypes.map((bt) => (
            <button
              key={bt.value}
              onClick={() => setBirthType(bt.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                birthType === bt.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{bt.label}</p>
              <p className="text-xs text-muted mt-1">{bt.total} gun</p>
              <p className="text-xs text-muted">{bt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Ayliq emek haqqi (gross, AZN)
        </label>
        <input
          type="number"
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
          placeholder="1000"
          min="0"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Umumi analiq odenisi</p>
              <p className="text-3xl font-bold">{fmt(result.totalPayment)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / {result.totalDays} gun</p>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">Orta gunluk emek haqqi</p>
              <p className="text-3xl font-bold text-amber-700">{fmt(result.effectiveDailySalary)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN / gun</p>
            </div>
          </div>

          {/* Minimum wage note */}
          {result.isMinimumApplied && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <span>Daxil etdiyiniz emek haqqi minimum emek haqqindan ({MINIMUM_WAGE} AZN) asagi oldugu ucun minimum derece tetbiq edildi.</span>
              </p>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>Odenis bolguleri</span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Illik emek haqqi</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.annualSalary)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Orta gunluk emek haqqi (illik / 365)</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.avgDailySalary)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Dogusdan evvel ({result.daysBefore} gun)</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.beforeBirthPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Dogusdan sonra ({result.daysAfter} gun)</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.afterBirthPayment)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">Cemi odenis ({result.totalDays} gun)</span>
                <span className="text-sm font-bold text-primary">{fmt(result.totalPayment)} AZN</span>
              </div>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Dogusdan evvel</span>
              <span className="text-muted">Dogusdan sonra</span>
            </div>
            <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${(result.daysBefore / result.totalDays) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium text-foreground">
                {result.daysBefore} gun ({fmt(result.beforeBirthPayment)} AZN)
              </span>
              <span className="font-medium text-amber-700">
                {result.daysAfter} gun ({fmt(result.afterBirthPayment)} AZN)
              </span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>Dogus novlerine gore muqayise</span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              {birthTypes.map((bt) => {
                const daily = result.effectiveDailySalary;
                const total = daily * bt.total;
                const isActive = bt.value === birthType;
                return (
                  <div key={bt.value} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{bt.label}</p>
                      <p className="text-xs text-muted">{bt.total} gun</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{fmt(total)} AZN</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Qeyd:</span> Analiq mezuniyyeti odenisi DSMF (Dovlet Sosial Mudafie Fondu)
              terefinden heyata kecirilir. Isecigoturen mezuniyyet muddetinde is yerini saxlamaldir. Mezuniyyetden
              sonra qadin usaq 3 yasina catana qeder odenissiz mezuniyyet goture biler.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">👶</span>
          <p>Neticeni gormek ucun ayliq emek haqqini daxil edin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
