"use client";

import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// ── Types ──────────────────────────────────────────────────────────────────────

type GroupId = "1" | "2" | "3dt" | "3tc" | "4" | "5";

interface GroupDef {
  id: GroupId;
  name: string;
  subjects: [string, number][]; // [subjectName, weightCoeff]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const GROUP_DEFS: GroupDef[] = [
  { id: "1", name: "I qrup", subjects: [["Riyaziyyat", 1.5], ["Fizika", 1.5], ["Kimya", 1]] },
  { id: "2", name: "II qrup", subjects: [["Riyaziyyat", 1.5], ["Coğrafiya", 1.5], ["Tarix", 1]] },
  { id: "3dt", name: "III qrup (DT)", subjects: [["Azərbaycan dili", 1.5], ["Tarix", 1.5], ["Ədəbiyyat", 1]] },
  { id: "3tc", name: "III qrup (TC)", subjects: [["Azərbaycan dili", 1.5], ["Tarix", 1.5], ["Coğrafiya", 1]] },
  { id: "4", name: "IV qrup", subjects: [["Biologiya", 1.5], ["Kimya", 1.5], ["Fizika", 1]] },
  { id: "5", name: "V qrup", subjects: [] },
];

const WRITTEN_OPTIONS = [
  { label: "0", value: 0 },
  { label: "1/3", value: 1 / 3 },
  { label: "1/2", value: 0.5 },
  { label: "2/3", value: 2 / 3 },
  { label: "1", value: 1 },
];

const UNIVERSITIES = [
  { name: "ADA Universiteti", minScore: 550 },
  { name: "Bakı Dövlət Universiteti (BDU)", minScore: 450 },
  { name: "ADNSU (Neft Universiteti)", minScore: 430 },
  { name: "Azərbaycan Tibb Universiteti (ATU)", minScore: 480 },
  { name: "UNEC (İqtisad Universiteti)", minScore: 400 },
  { name: "ADPU (Pedaqoji Universitet)", minScore: 300 },
  { name: "Azərbaycan Texniki Universiteti (AzTU)", minScore: 350 },
  { name: "Azərbaycan Memarlıq və İnşaat Universiteti", minScore: 360 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getScoreColor(total: number): { bg: string; border: string; text: string; label: string } {
  if (total >= 600) return { bg: "bg-green-50", border: "border-green-400", text: "text-green-700", label: "Əla nəticə" };
  if (total >= 500) return { bg: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-700", label: "Yaxşı nəticə" };
  if (total >= 400) return { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", label: "Orta nəticə" };
  if (total >= 300) return { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", label: "Orta-aşağı nəticə" };
  return { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", label: "Aşağı nəticə" };
}

// ── Stage 1 calculations ───────────────────────────────────────────────────────

interface Stage1Inputs {
  // Xarici dil
  xariciClosed: number;        // max 23
  xariciOpenWritten: number;   // max 7 (score, not count — but here count of correct)
  // Azərbaycan dili
  azClosed: number;            // max 20
  azOpenWritten: number;       // max 10
  // Riyaziyyat
  riyaClosed: number;          // max 13
  riyaOpenCoded: number;       // max 5
  riyaOpenWritten: number;     // max 7
}

function calcStage1Xarici(closed: number, openWritten: number): number {
  const raw = (2 * openWritten + closed) * 100 / 37;
  return round1(clamp(raw, 0, 100));
}

function calcStage1Az(closed: number, openWritten: number): number {
  const raw = (2 * openWritten + closed) * 5 / 2;
  return round1(clamp(raw, 0, 100));
}

function calcStage1Riya(closed: number, openCoded: number, openWritten: number): number {
  const raw = (2 * openWritten + openCoded + closed) * 25 / 8;
  return round1(clamp(raw, 0, 100));
}

// ── Stage 2 calculations ───────────────────────────────────────────────────────

interface Stage2SubjectInputs {
  dq: number;          // qapalı düzgün (max 22)
  yq: number;          // qapalı yanlış (max 22 - dq)
  dkod: number;        // açıq kodlaşdırılma düzgün (max 5)
  writtenScores: number[];  // 3 written task scores (each 0, 1/3, 1/2, 2/3, or 1)
}

function calcStage2Closed(dq: number, yq: number): number {
  const raw = (dq - yq / 4) * 100 / 33;
  return round1(Math.max(0, raw));
}

function calcStage2Open(dkod: number, writtenScores: number[]): number {
  const dyazili = writtenScores.reduce((s, v) => s + v, 0);
  const raw = (dkod + 2 * dyazili) * 100 / 33;
  return round1(clamp(raw, 0, 100));
}

function calcStage2Subject(inputs: Stage2SubjectInputs): { nbq: number; nba: number; nb: number } {
  const nbq = calcStage2Closed(inputs.dq, inputs.yq);
  const nba = calcStage2Open(inputs.dkod, inputs.writtenScores);
  const nb = round1(nbq + nba);
  return { nbq, nba, nb };
}

// ── Component ──────────────────────────────────────────────────────────────────

const defaultStage1: Stage1Inputs = {
  xariciClosed: 0, xariciOpenWritten: 0,
  azClosed: 0, azOpenWritten: 0,
  riyaClosed: 0, riyaOpenCoded: 0, riyaOpenWritten: 0,
};

const defaultStage2Subject: Stage2SubjectInputs = {
  dq: 0, yq: 0, dkod: 0, writtenScores: [0, 0, 0],
};

export default function UniversitetQebulCalculator() {
  const [selectedGroup, setSelectedGroup] = useState<GroupId>("1");
  const [s1, setS1] = useState<Stage1Inputs>({ ...defaultStage1 });
  const [s2, setS2] = useState<Stage2SubjectInputs[]>([
    { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
    { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
    { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
  ]);

  const group = GROUP_DEFS.find((g) => g.id === selectedGroup)!;
  const isVGroup = selectedGroup === "5";

  const resetAll = useCallback(() => {
    setS1({ ...defaultStage1 });
    setS2([
      { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
      { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
      { ...defaultStage2Subject, writtenScores: [0, 0, 0] },
    ]);
  }, []);

  const updateS1 = (field: keyof Stage1Inputs, val: string) => {
    const num = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setS1((prev) => ({ ...prev, [field]: num }));
  };

  const updateS2 = (subjectIdx: number, field: keyof Omit<Stage2SubjectInputs, "writtenScores">, val: string) => {
    const num = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setS2((prev) => {
      const next = prev.map((s, i) => (i === subjectIdx ? { ...s, [field]: num } : s));
      return next;
    });
  };

  const updateS2Written = (subjectIdx: number, taskIdx: number, val: number) => {
    setS2((prev) => {
      const next = prev.map((s, i) => {
        if (i !== subjectIdx) return s;
        const ws = [...s.writtenScores];
        ws[taskIdx] = val;
        return { ...s, writtenScores: ws };
      });
      return next;
    });
  };

  // ── Calculations ──

  const stage1Results = useMemo(() => {
    const xarici = calcStage1Xarici(
      clamp(s1.xariciClosed, 0, 23),
      clamp(s1.xariciOpenWritten, 0, 7)
    );
    const az = calcStage1Az(
      clamp(s1.azClosed, 0, 20),
      clamp(s1.azOpenWritten, 0, 10)
    );
    const riya = calcStage1Riya(
      clamp(s1.riyaClosed, 0, 13),
      clamp(s1.riyaOpenCoded, 0, 5),
      clamp(s1.riyaOpenWritten, 0, 7)
    );
    const total = round1(xarici + az + riya);
    return { xarici, az, riya, total };
  }, [s1]);

  const stage2Results = useMemo(() => {
    if (isVGroup) return null;
    const results = group.subjects.map((_, i) => {
      const inp = s2[i];
      const clamped: Stage2SubjectInputs = {
        dq: clamp(inp.dq, 0, 22),
        yq: clamp(inp.yq, 0, 22 - clamp(inp.dq, 0, 22)),
        dkod: clamp(inp.dkod, 0, 5),
        writtenScores: inp.writtenScores,
      };
      const { nbq, nba, nb } = calcStage2Subject(clamped);
      const weighted = round1(nb * group.subjects[i][1]);
      return { nbq, nba, nb, weighted, subjectName: group.subjects[i][0], coeff: group.subjects[i][1] };
    });
    const total = round1(results.reduce((sum, r) => sum + r.weighted, 0));
    return { results, total };
  }, [s2, group, isVGroup]);

  const grandTotal = round1(stage1Results.total + (stage2Results?.total ?? 0));
  const maxTotal = isVGroup ? 300 : 700;
  const scoreColor = getScoreColor(isVGroup ? grandTotal * 700 / 300 : grandTotal);

  // ── Render helpers ──

  const numberInput = (
    label: string,
    value: number,
    onChange: (val: string) => void,
    max: number,
    hint?: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
        {hint && <span className="text-xs text-muted ml-1">({hint})</span>}
      </label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`0–${max}`}
        min="0"
        max={max}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
      />
    </div>
  );

  const writtenSelect = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
      >
        {WRITTEN_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <CalculatorLayout
      title="Universitet qəbul balı hesablayıcısı"
      description="DIM imtahan nəticələrinizi daxil edin — birinci və ikinci mərhələ üzrə qəbul balınızı hesablayın."
      breadcrumbs={[
        { label: "Təhsil", href: "/?category=education" },
        { label: "Universitet qəbul balı" },
      ]}
      formulaTitle="DIM bal hesablama qaydaları"
      formulaContent={`Birinci mərhələ (max 300 bal):

Xarici dil (30 tapşırıq): NB = (2 × düzgün_yazılı + düzgün_qapalı) × 100/37
Azərbaycan (rus) dili (30 tapşırıq): NB = (2 × düzgün_yazılı + düzgün_qapalı) × 5/2
Riyaziyyat (25 tapşırıq): NB = (2 × düzgün_yazılı + düzgün_kodlaşdırılma + düzgün_qapalı) × 25/8

İkinci mərhələ (max 400 bal):

Hər fənn üzrə 30 tapşırıq (22 qapalı + 5 kodlaşdırılma + 3 yazılı)

Qapalı tip: NBq = (Dq - Yq/4) × 100/33  (mənfi olarsa, 0 qəbul edilir)
Açıq tip: NBa = (Dkod + 2 × Dyazılı) × 100/33

Fənn balı = NBq + NBa (0.1-ə yuvarlaqlaşdırılır)
Sonra çəki əmsalı ilə vurulur.

Çəki əmsalları:
I qrup: Riyaziyyat ×1.5, Fizika ×1.5, Kimya ×1
II qrup: Riyaziyyat ×1.5, Coğrafiya ×1.5, Tarix ×1
III qrup (DT): Azərbaycan dili ×1.5, Tarix ×1.5, Ədəbiyyat ×1
III qrup (TC): Azərbaycan dili ×1.5, Tarix ×1.5, Coğrafiya ×1
IV qrup: Biologiya ×1.5, Kimya ×1.5, Fizika ×1

Ümumi bal = Birinci mərhələ + İkinci mərhələ (max 700)`}
      relatedIds={["gpa", "state-grant", "ielts", "sat"]}
    >
      {/* ── Step 1: Group Selection ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">1. İxtisas qrupunu seçin</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GROUP_DEFS.map((g) => (
            <button
              key={g.id}
              onClick={() => { setSelectedGroup(g.id); resetAll(); }}
              className={`p-3 rounded-xl border text-center transition-all text-sm font-medium ${
                selectedGroup === g.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary text-primary"
                  : "border-border bg-white hover:border-primary/30 text-foreground"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step 2: Stage 1 ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-1">2. Birinci mərhələ</h2>
        <p className="text-sm text-muted mb-4">Xarici dil, Azərbaycan dili və Riyaziyyat (max 300 bal)</p>

        {/* Xarici dil */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Xarici dil <span className="text-xs text-muted">(30 tapşırıq)</span></h3>
            <span className="text-sm font-semibold text-primary">{stage1Results.xarici} bal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {numberInput("Qapalı tipli düzgün cavab sayı", s1.xariciClosed, (v) => updateS1("xariciClosed", v), 23, "max 23")}
            {numberInput("Açıq tipli (yazılı) düzgün cavab sayı", s1.xariciOpenWritten, (v) => updateS1("xariciOpenWritten", v), 7, "max 7")}
          </div>
        </div>

        {/* Azərbaycan dili */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Azərbaycan (rus) dili <span className="text-xs text-muted">(30 tapşırıq)</span></h3>
            <span className="text-sm font-semibold text-primary">{stage1Results.az} bal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {numberInput("Qapalı tipli düzgün cavab sayı", s1.azClosed, (v) => updateS1("azClosed", v), 20, "max 20")}
            {numberInput("Açıq tipli (yazılı) düzgün cavab sayı", s1.azOpenWritten, (v) => updateS1("azOpenWritten", v), 10, "max 10")}
          </div>
        </div>

        {/* Riyaziyyat */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Riyaziyyat <span className="text-xs text-muted">(25 tapşırıq)</span></h3>
            <span className="text-sm font-semibold text-primary">{stage1Results.riya} bal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {numberInput("Qapalı tipli düzgün cavab sayı", s1.riyaClosed, (v) => updateS1("riyaClosed", v), 13, "max 13")}
            {numberInput("Açıq (kodlaşdırılma) düzgün cavab sayı", s1.riyaOpenCoded, (v) => updateS1("riyaOpenCoded", v), 5, "max 5")}
            {numberInput("Açıq (yazılı) düzgün cavab sayı", s1.riyaOpenWritten, (v) => updateS1("riyaOpenWritten", v), 7, "max 7")}
          </div>
        </div>

        {/* Stage 1 Total */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">Birinci mərhələ cəmi</p>
            <p className="text-xs text-blue-600 mt-0.5">Xarici dil ({stage1Results.xarici}) + Az. dili ({stage1Results.az}) + Riyaziyyat ({stage1Results.riya})</p>
          </div>
          <p className="text-2xl font-bold text-blue-800">{stage1Results.total} <span className="text-sm font-normal">/ 300</span></p>
        </div>
      </div>

      {/* ── Step 3: Stage 2 (not for V qrup) ── */}
      {!isVGroup && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">3. İkinci mərhələ</h2>
          <p className="text-sm text-muted mb-4">{group.name} fənləri (max 400 bal)</p>

          {group.subjects.map(([subjectName, coeff], idx) => {
            const r = stage2Results?.results[idx];
            return (
              <div key={subjectName} className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">
                    {subjectName}
                    <span className="text-xs text-muted ml-2">(30 tapşırıq, ×{coeff} çəki)</span>
                  </h3>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-primary">{r?.weighted ?? 0} bal</span>
                    <span className="text-xs text-muted block">NB: {r?.nb ?? 0}</span>
                  </div>
                </div>

                {/* Closed type inputs */}
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">Qapalı tip (22 tapşırıq)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {numberInput(
                    "Düzgün cavab sayı (Dq)",
                    s2[idx].dq,
                    (v) => updateS2(idx, "dq", v),
                    22,
                    "max 22"
                  )}
                  {numberInput(
                    "Yanlış cavab sayı (Yq)",
                    s2[idx].yq,
                    (v) => updateS2(idx, "yq", v),
                    22 - clamp(s2[idx].dq, 0, 22),
                    `max ${22 - clamp(s2[idx].dq, 0, 22)}`
                  )}
                </div>

                {/* Open type inputs */}
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">Açıq tip (5 kodlaşdırılma + 3 yazılı)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {numberInput(
                    "Kodlaşdırılma düzgün cavab sayı (Dkod)",
                    s2[idx].dkod,
                    (v) => updateS2(idx, "dkod", v),
                    5,
                    "max 5"
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {s2[idx].writtenScores.map((ws, ti) =>
                    writtenSelect(
                      `Yazılı tapşırıq ${ti + 1}`,
                      ws,
                      (val) => updateS2Written(idx, ti, val)
                    )
                  )}
                </div>

                {/* Subject breakdown */}
                {r && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4 text-xs text-muted">
                    <span>NBq (qapalı): <strong className="text-foreground">{r.nbq}</strong></span>
                    <span>NBa (açıq): <strong className="text-foreground">{r.nba}</strong></span>
                    <span>NB: <strong className="text-foreground">{r.nb}</strong></span>
                    <span>Çəkili: <strong className="text-foreground">{r.nb} × {coeff} = {r.weighted}</strong></span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Stage 2 Total */}
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">İkinci mərhələ cəmi</p>
              <p className="text-xs text-purple-600 mt-0.5">
                {stage2Results?.results.map((r) => `${r.subjectName} (${r.weighted})`).join(" + ")}
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-800">{stage2Results?.total ?? 0} <span className="text-sm font-normal">/ 400</span></p>
          </div>
        </div>
      )}

      {isVGroup && (
        <div className="mb-8 bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            V qrup üçün yalnız birinci mərhələ balı hesablanır. Qabiliyyət imtahanı balı ayrıca qiymətləndirilir.
          </p>
        </div>
      )}

      {/* ── Results ── */}
      <div className="space-y-4">
        {/* Grand Total */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-center text-white">
          <p className="text-sm font-medium text-blue-200 mb-1">
            {isVGroup ? "Birinci mərhələ balınız" : "Ümumi qəbul balınız"}
          </p>
          <p className="text-6xl font-bold mb-2">{grandTotal}</p>
          <p className="text-sm text-blue-200">{maxTotal} baldan</p>
        </div>

        {/* Score breakdown cards */}
        <div className={`grid ${isVGroup ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted mb-1">Birinci mərhələ</p>
            <p className="text-2xl font-bold text-blue-800">{stage1Results.total}</p>
            <p className="text-xs text-muted">/ 300</p>
          </div>
          {!isVGroup && (
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted mb-1">İkinci mərhələ</p>
              <p className="text-2xl font-bold text-purple-800">{stage2Results?.total ?? 0}</p>
              <p className="text-xs text-muted">/ 400</p>
            </div>
          )}
        </div>

        {/* Score range indicator */}
        <div className={`${scoreColor.bg} ${scoreColor.border} border rounded-xl p-4 text-center`}>
          <p className={`text-sm font-semibold ${scoreColor.text}`}>{scoreColor.label}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className={`rounded-full h-3 transition-all ${
                grandTotal >= maxTotal * 0.85 ? "bg-green-500" :
                grandTotal >= maxTotal * 0.7 ? "bg-emerald-500" :
                grandTotal >= maxTotal * 0.55 ? "bg-yellow-500" :
                grandTotal >= maxTotal * 0.4 ? "bg-orange-500" : "bg-red-500"
              }`}
              style={{ width: `${clamp((grandTotal / maxTotal) * 100, 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1">{round1((grandTotal / maxTotal) * 100)}%</p>
        </div>

        {/* University comparison */}
        {!isVGroup && grandTotal > 0 && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Universitetlər ilə müqayisə (təxmini)
              </h3>
            </div>
            <div className="divide-y divide-border">
              {UNIVERSITIES
                .sort((a, b) => b.minScore - a.minScore)
                .map((uni) => {
                  const passes = grandTotal >= uni.minScore;
                  return (
                    <div key={uni.name} className={`flex items-center justify-between px-5 py-3 ${passes ? "bg-green-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${passes ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className={`text-sm ${passes ? "text-green-700 font-medium" : "text-muted"}`}>{uni.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">Min: ~{uni.minScore}</span>
                        {passes && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Keçir</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="px-5 py-2 bg-gray-50 border-t border-border">
              <p className="text-xs text-muted">
                Minimum ballar təxminidir və hər il dəyişə bilər.
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Diqqət:</span> Bu hesablama DIM-in rəsmi bal hesablama qaydalarına
            əsaslanır. Lakin universitetlərin minimum keçid balları hər il dəyişir. Ən dəqiq məlumat üçün
            DIM-in rəsmi saytına (dim.gov.az) müraciət edin.
          </p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
