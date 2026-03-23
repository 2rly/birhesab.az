"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type DisabilityGroup = "1" | "2" | "3" | "childhood";

interface GroupInfo {
  value: DisabilityGroup;
  label: string;
  amount: number;
  description: string;
  emoji: string;
}

const disabilityGroups: GroupInfo[] = [
  { value: "1", label: "I qrup (agir)", amount: 240, description: "Tam emek qabiliyyetini itirmis", emoji: "🔴" },
  { value: "2", label: "II qrup (orta)", amount: 190, description: "Qismen emek qabiliyyetini itirmis", emoji: "🟡" },
  { value: "3", label: "III qrup (yungul)", amount: 155, description: "Emek qabiliyyeti mehdudlasdirilmis", emoji: "🟢" },
  { value: "childhood", label: "Usaqliqdan elillik", amount: 190, description: "18 yasina qeder elillik teyin olunmus", emoji: "👶" },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function DisabilityBenefitCalculator() {
  const [group, setGroup] = useState<DisabilityGroup>("1");
  const [dependents, setDependents] = useState("");
  const [needsCaregiver, setNeedsCaregiver] = useState(false);

  const result = useMemo(() => {
    const selected = disabilityGroups.find((g) => g.value === group)!;
    const baseBenefit = selected.amount;
    const numDependents = parseInt(dependents) || 0;

    // Additional for dependents: 50 AZN per dependent (up to 3)
    const dependentAllowance = Math.min(numDependents, 3) * 50;

    // Caregiver allowance for Group 1
    const caregiverAllowance = needsCaregiver && group === "1" ? 50 : 0;

    const totalMonthly = baseBenefit + dependentAllowance + caregiverAllowance;
    const totalAnnual = totalMonthly * 12;

    return {
      baseBenefit,
      dependentAllowance,
      caregiverAllowance,
      numDependents: Math.min(numDependents, 3),
      totalMonthly,
      totalAnnual,
      groupInfo: selected,
    };
  }, [group, dependents, needsCaregiver]);

  return (
    <CalculatorLayout
      title="Elillik muavineti hesablayıcısı"
      description="Azerbaycanda elillik qrupuna gore ayliq muavinet mebleghini hesablayin."
      breadcrumbs={[
        { label: "Huquq ve Dovlet", href: "/?category=legal" },
        { label: "Elillik muavineti hesablayıcısı" },
      ]}
      formulaTitle="Elillik muavineti nece hesablanir?"
      formulaContent={`Azerbaycan Respublikasi qanunvericiliyine gore:

Elillik qruplari ve muavinet:
- I qrup (agir): 240 AZN / ay
- II qrup (orta): 190 AZN / ay
- III qrup (yungul): 155 AZN / ay
- Usaqliqdan elillik: 190 AZN / ay

Elave odenisler:
- Her bir ohdede olan sexse: 50 AZN (maksimum 3 nefere)
- Baxici muavineti (I qrup): 50 AZN

Muavinet DSMF terefinden ayliq odenilir.
Elillik VTEC (Vetenadasi-Tibbi Ekspert Komissiyasi) terefinden teyin olunur.`}
      relatedIds={["salary", "unemployment-benefit", "maternity-leave", "court-fee"]}
    >
      {/* Disability Group Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Elillik qrupu</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {disabilityGroups.map((g) => (
            <button
              key={g.value}
              onClick={() => setGroup(g.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                group === g.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{g.emoji}</span>
                <p className="text-sm font-medium text-foreground">{g.label}</p>
              </div>
              <p className="text-xs text-muted">{g.description}</p>
              <p className="text-lg font-bold text-primary mt-2">{g.amount} AZN / ay</p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Ohdede olan sexs sayi
          </label>
          <input
            type="number"
            value={dependents}
            onChange={(e) => setDependents(e.target.value)}
            placeholder="0"
            min="0"
            max="3"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          <p className="text-xs text-muted mt-1">Maksimum 3 nefer ucun elave odenis</p>
        </div>
        {group === "1" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Baxici ehtiyaci</label>
            <button
              onClick={() => setNeedsCaregiver(!needsCaregiver)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                needsCaregiver
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{needsCaregiver ? "Beli, baxici lazimdir" : "Xeyr, baxici lazim deyil"}</p>
              <p className="text-xs text-muted mt-1">I qrup eliller ucun elave 50 AZN</p>
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Main Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
            <p className="text-sm text-blue-200 mb-1">Ayliq umumi muavinet</p>
            <p className="text-3xl font-bold">{fmt(result.totalMonthly)}</p>
            <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted mb-1">Illik umumi muavinet</p>
            <p className="text-3xl font-bold text-foreground">{fmt(result.totalAnnual)}</p>
            <p className="text-xs text-muted mt-1">AZN / il</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span>Odenis bolguleri</span>
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-muted">Esas muavinet ({result.groupInfo.label})</span>
              <span className="text-sm font-medium text-foreground">{fmt(result.baseBenefit)} AZN</span>
            </div>
            {result.numDependents > 0 && (
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Ohdede olan sexsler ({result.numDependents} nefer x 50 AZN)</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.dependentAllowance)} AZN</span>
              </div>
            )}
            {result.caregiverAllowance > 0 && (
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">Baxici muavineti</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.caregiverAllowance)} AZN</span>
              </div>
            )}
            <div className="flex justify-between px-5 py-3 bg-blue-50">
              <span className="text-sm font-semibold text-primary">Cemi ayliq</span>
              <span className="text-sm font-bold text-primary">{fmt(result.totalMonthly)} AZN</span>
            </div>
          </div>
        </div>

        {/* All Groups Comparison */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span>Butun qruplar uzre muqayise</span>
            </h3>
          </div>
          <div className="divide-y divide-border">
            {disabilityGroups.map((g) => {
              const isActive = g.value === group;
              return (
                <div key={g.value} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span>{g.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{g.label}</p>
                      <p className="text-xs text-muted">{g.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{g.amount} AZN / ay</p>
                    <p className="text-xs text-muted">{fmt(g.amount * 12)} AZN / il</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Bar */}
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-xs text-muted mb-3 font-medium">Qruplara gore muqayise</p>
          {disabilityGroups.map((g) => (
            <div key={g.value} className="flex items-center gap-3 mb-2">
              <span className="text-xs text-muted w-20 truncate">{g.label}</span>
              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${g.value === group ? "bg-primary" : "bg-gray-400"}`}
                  style={{ width: `${(g.amount / 240) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-16 text-right">{g.amount} AZN</span>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Qeyd:</span> Elillik qrupu VTEC (Vetenadasi-Tibbi Ekspert Komissiyasi)
            terefinden teyin olunur. Muavinet ayliq olaraq DSMF terefinden odenilir. I ve II qrup elillerin
            ictimai neqliyyatdan pulsuz istifade huququ vardir.
          </p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
