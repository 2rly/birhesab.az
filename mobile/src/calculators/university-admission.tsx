import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { SectionHeading, InfoBox, ResultHero, FormulaSection, RelatedCalculators } from "@/components/Content";
import { Bar, TONE } from "./_edu-scores-parts";

// ── Types ──────────────────────────────────────────────────────────────────────

type ExamType = "buraxilis" | "blok";
type GradeLevel = "9" | "11";
type GroupId = "1rk" | "1ri" | "2" | "3dt" | "3tc" | "4" | "5";

interface GroupDef {
  id: GroupId;
  name: string;
  subjects: [string, number][]; // [fənn, çəki əmsalı]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const GROUP_DEFS: GroupDef[] = [
  { id: "1rk", name: "I qrup (RK)", subjects: [["Riyaziyyat", 1.5], ["Fizika", 1.5], ["Kimya", 1]] },
  { id: "1ri", name: "I qrup (Rİ)", subjects: [["Riyaziyyat", 1.5], ["Fizika", 1.5], ["İnformatika", 1]] },
  { id: "2", name: "II qrup", subjects: [["Riyaziyyat", 1.5], ["Coğrafiya", 1.5], ["Tarix", 1]] },
  { id: "3dt", name: "III qrup (DT)", subjects: [["Azərbaycan dili", 1.5], ["Tarix", 1.5], ["Ədəbiyyat", 1]] },
  { id: "3tc", name: "III qrup (TC)", subjects: [["Azərbaycan dili", 1.5], ["Tarix", 1.5], ["Coğrafiya", 1]] },
  { id: "4", name: "IV qrup", subjects: [["Biologiya", 1.5], ["Kimya", 1.5], ["Fizika", 1]] },
  { id: "5", name: "V qrup", subjects: [] },
];

type Opt = { label: string; value: number };

const WRITTEN_OPTIONS: Opt[] = [
  { label: "0", value: 0 },
  { label: "1/3", value: 1 / 3 },
  { label: "1/2", value: 0.5 },
  { label: "2/3", value: 2 / 3 },
  { label: "1", value: 1 },
];

// DİM rəsmi qiymətləndirmə meyarları (11-ci sinif buraxılış imtahanı):
// açıq tipli yazılı tapşırıq yalnız 0, 1/3, 2/3 və ya 1 bal ala bilər.
const WRITTEN_OPTIONS_11: Opt[] = [
  { label: "0", value: 0 },
  { label: "1/3", value: 1 / 3 },
  { label: "2/3", value: 2 / 3 },
  { label: "1", value: 1 },
];

const DY_OPTIONS: Opt[] = [
  { label: "0", value: 0 },
  { label: "0.5", value: 0.5 },
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
].sort((a, b) => b.minScore - a.minScore);

// ── Helpers ─────────────────────────────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getScoreColor(total: number): { color: string; label: string } {
  if (total >= 600) return { color: TONE.green, label: "Əla nəticə" };
  if (total >= 500) return { color: "#059669", label: "Yaxşı nəticə" };
  if (total >= 400) return { color: TONE.yellow, label: "Orta nəticə" };
  if (total >= 300) return { color: TONE.orange, label: "Orta-aşağı nəticə" };
  return { color: TONE.red, label: "Aşağı nəticə" };
}

// ── Stage 1 (11-ci sinif buraxılış) ────────────────────────────────────────────

interface Stage1Inputs {
  xariciClosed: number;
  xariciOpenWritten: number[]; // 7 tapşırıq
  azClosed: number;
  azOpenWritten: number[]; // 10 tapşırıq
  riyaClosed: number;
  riyaOpenCoded: number;
  riyaOpenWritten: number[]; // 7 tapşırıq
}

function calcStage1Xarici(closed: number, openWrittenScores: number[]): number {
  const openSum = openWrittenScores.reduce((s, v) => s + v, 0);
  const raw = ((2 * openSum + closed) * 100) / 37;
  return round1(clamp(raw, 0, 100));
}

function calcStage1Az(closed: number, openWrittenScores: number[]): number {
  const openSum = openWrittenScores.reduce((s, v) => s + v, 0);
  const raw = ((2 * openSum + closed) * 5) / 2;
  return round1(clamp(raw, 0, 100));
}

function calcStage1Riya(closed: number, openCoded: number, openWrittenScores: number[]): number {
  const openSum = openWrittenScores.reduce((s, v) => s + v, 0);
  const raw = ((2 * openSum + openCoded + closed) * 25) / 8;
  return round1(clamp(raw, 0, 100));
}

// ── 9-cu sinif buraxılış imtahanı ──────────────────────────────────────────────

interface Stage9Inputs {
  tdQapali: number;
  tdYazili: number[];
  riyaQapali: number;
  riyaKod: number;
  riyaYazili: number[];
  xdQapali: number;
  xdKod: number;
  xdDY: number;
  xdEsse: number;
}

function calc9Tedris(qapali: number, yazili: number[]): number {
  const y = yazili.reduce((s, v) => s + v, 0);
  return round1(clamp(((2 * y + qapali) * 100) / 34, 0, 100));
}
function calc9Riya(qapali: number, kod: number, yazili: number[]): number {
  const y = yazili.reduce((s, v) => s + v, 0);
  return round1(clamp(((2 * y + kod + qapali) * 100) / 29, 0, 100));
}
function calc9Xarici(qapali: number, kod: number, dy: number, esse: number): number {
  return round1(clamp(((esse + dy + kod + qapali) * 100) / 30, 0, 100));
}

// ── Stage 2 (blok) ─────────────────────────────────────────────────────────────

interface Stage2SubjectInputs {
  dq: number;
  yq: number;
  dkod: number;
  writtenScores: number[];
}

function calcStage2Closed(dq: number, yq: number): number {
  return round1(Math.max(0, ((dq - yq / 4) * 100) / 33));
}

function calcStage2Open(dkod: number, writtenScores: number[]): number {
  const dyazili = writtenScores.reduce((s, v) => s + v, 0);
  return round1(clamp(((dkod + 2 * dyazili) * 100) / 33, 0, 100));
}

function calcStage2Subject(inputs: Stage2SubjectInputs) {
  const nbq = calcStage2Closed(inputs.dq, inputs.yq);
  const nba = calcStage2Open(inputs.dkod, inputs.writtenScores);
  return { nbq, nba, nb: round1(nbq + nba) };
}

const FORMULA_TITLE = "DİM bal hesablama qaydaları";
const FORMULA_CONTENT = `Birinci mərhələ (max 300 bal):

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
I qrup (RK): Riyaziyyat ×1.5, Fizika ×1.5, Kimya ×1
I qrup (Rİ): Riyaziyyat ×1.5, Fizika ×1.5, İnformatika ×1
II qrup: Riyaziyyat ×1.5, Coğrafiya ×1.5, Tarix ×1
III qrup (DT): Azərbaycan dili ×1.5, Tarix ×1.5, Ədəbiyyat ×1
III qrup (TC): Azərbaycan dili ×1.5, Tarix ×1.5, Coğrafiya ×1
IV qrup: Biologiya ×1.5, Kimya ×1.5, Fizika ×1

Ümumi bal = Birinci mərhələ + İkinci mərhələ (max 700)`;

const DISCLAIMER =
  "Bu hesablama DİM-in rəsmi bal hesablama qaydalarına əsaslanır. Lakin universitetlərin minimum keçid balları hər il dəyişir. Ən dəqiq məlumat üçün DİM-in rəsmi saytına (dim.gov.az) müraciət edin.";

const defaultStage1 = (): Stage1Inputs => ({
  xariciClosed: 0,
  xariciOpenWritten: [0, 0, 0, 0, 0, 0, 0],
  azClosed: 0,
  azOpenWritten: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  riyaClosed: 0,
  riyaOpenCoded: 0,
  riyaOpenWritten: [0, 0, 0, 0, 0, 0, 0],
});
const defaultStage2 = (): Stage2SubjectInputs[] => [0, 1, 2].map(() => ({ dq: 0, yq: 0, dkod: 0, writtenScores: [0, 0, 0] }));
const defaultStage9 = (): Stage9Inputs => ({
  tdQapali: 0,
  tdYazili: [0, 0, 0, 0],
  riyaQapali: 0,
  riyaKod: 0,
  riyaYazili: [0, 0, 0, 0],
  xdQapali: 0,
  xdKod: 0,
  xdDY: 0,
  xdEsse: 0,
});

// ── Small UI parts ─────────────────────────────────────────────────────────────

/** Saytdakı number input: boş = 0, mənfi/yanlış daxiletmə qəbul edilmir. */
function NumInput({
  label,
  value,
  onChange,
  max,
  hint,
  parse = "int",
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  max: number;
  hint?: string;
  parse?: "int" | "float";
}) {
  const [text, setText] = useState(value ? String(value) : "");
  useEffect(() => {
    const cur = text === "" ? 0 : parse === "int" ? parseInt(text, 10) : parseFloat(text.replace(",", "."));
    if (cur !== value) setText(value ? String(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <InputField
      label={hint ? `${label} (${hint})` : label}
      value={text}
      onChangeText={(t) => {
        const norm = t.replace(",", ".");
        const num = norm === "" ? 0 : parse === "int" ? parseInt(norm, 10) : parseFloat(norm);
        if (isNaN(num) || num < 0) return;
        setText(parse === "int" ? (norm === "" ? "" : String(num)) : norm);
        onChange(norm);
      }}
      placeholder={`0–${max}`}
      keyboardType={parse === "int" ? "number-pad" : "decimal-pad"}
    />
  );
}

/** Yazılı tapşırıq üçün bal seçimi (saytdakı <select>). */
function WrittenPick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: Opt[];
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.pickRow}>
      <Text style={[styles.pickLabel, { color: colors.n760 }]}>{label}</Text>
      <View style={styles.pickOpts}>
        {options.map((o) => {
          const active = Math.abs(o.value - value) < 1e-9;
          return (
            <Pressable
              key={o.label}
              onPress={() => onChange(o.value)}
              style={[
                styles.pickChip,
                {
                  borderColor: active ? colors.accent : colors.n280,
                  backgroundColor: active ? colors.accent : colors.n200,
                },
              ]}
            >
              <Text style={[styles.pickText, { color: active ? colors.onAccent : colors.n760 }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SubjectCard({
  title,
  sub,
  score,
  scoreSub,
  children,
}: {
  title: string;
  sub: string;
  score: string;
  scoreSub?: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.subj, { backgroundColor: colors.n145, borderColor: colors.n280 }]}>
      <View style={styles.subjHead}>
        <Text style={[styles.subjTitle, { color: colors.n940 }]}>
          {title} <Text style={[styles.subjSub, { color: colors.n580 }]}>{sub}</Text>
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.subjScore, { color: colors.accent }]}>{score}</Text>
          {scoreSub ? <Text style={[styles.subjSub, { color: colors.n580 }]}>{scoreSub}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function Caption({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.caption, { color: colors.n580 }]}>{children}</Text>;
}

function TotalBox({ color, title, sub, value, max }: { color: string; title: string; sub: string; value: number; max: number }) {
  return (
    <View style={[styles.total, { borderColor: color + "55", backgroundColor: color + "14" }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.totalTitle, { color }]}>{title}</Text>
        <Text style={[styles.totalSub, { color }]}>{sub}</Text>
      </View>
      <Text style={[styles.totalValue, { color }]}>
        {value} <Text style={styles.totalMax}>/ {max}</Text>
      </Text>
    </View>
  );
}

function OptionCards<T extends string>({
  options,
  selected,
  onSelect,
  columns = 2,
}: {
  options: { id: T; label: string; icon?: string }[];
  selected: T;
  onSelect: (v: T) => void;
  columns?: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.optGrid}>
      {options.map((o) => {
        const active = selected === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => onSelect(o.id)}
            style={[
              styles.optCard,
              { width: columns === 2 ? "48%" : "31%" },
              {
                borderColor: active ? colors.accent : colors.n280,
                backgroundColor: active ? colors.accent + "1f" : colors.n200,
              },
            ]}
          >
            {o.icon ? <Text style={styles.optIcon}>{o.icon}</Text> : null}
            <Text style={[styles.optText, { color: active ? colors.accent : colors.n940 }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function UniversityAdmissionCalculator() {
  const { colors } = useTheme();
  const [examType, setExamType] = useState<ExamType>("buraxilis");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("11");
  const [selectedGroup, setSelectedGroup] = useState<GroupId>("1rk");
  const [s1, setS1] = useState<Stage1Inputs>(defaultStage1);
  const [s9, setS9] = useState<Stage9Inputs>(defaultStage9);
  const [s2, setS2] = useState<Stage2SubjectInputs[]>(defaultStage2);

  const group = GROUP_DEFS.find((g) => g.id === selectedGroup)!;
  const isVGroup = selectedGroup === "5";
  const isBuraxilis = examType === "buraxilis";
  const isBlok = examType === "blok";
  const is9 = isBuraxilis && gradeLevel === "9";
  const is11 = isBuraxilis && gradeLevel === "11";

  const resetAll = useCallback(() => {
    setS1(defaultStage1());
    setS2(defaultStage2());
  }, []);

  const updateS1 = (field: "xariciClosed" | "azClosed" | "riyaClosed" | "riyaOpenCoded", val: string) => {
    const num = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setS1((prev) => ({ ...prev, [field]: num }));
  };
  const updateS1Written = (
    key: "xariciOpenWritten" | "azOpenWritten" | "riyaOpenWritten",
    taskIdx: number,
    val: number
  ) =>
    setS1((prev) => {
      const arr = [...prev[key]];
      arr[taskIdx] = val;
      return { ...prev, [key]: arr };
    });
  const updateS2 = (subjectIdx: number, field: "dq" | "yq" | "dkod", val: string) => {
    const num = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setS2((prev) => prev.map((s, i) => (i === subjectIdx ? { ...s, [field]: num } : s)));
  };
  const updateS9 = (field: keyof Omit<Stage9Inputs, "tdYazili" | "riyaYazili">, val: string | number) => {
    const num = typeof val === "number" ? val : val === "" ? 0 : parseFloat(val);
    if (isNaN(num) || num < 0) return;
    setS9((prev) => ({ ...prev, [field]: num }));
  };
  const updateS9Yazili = (g: "td" | "riya", taskIdx: number, val: number) =>
    setS9((prev) => {
      const key = g === "td" ? "tdYazili" : "riyaYazili";
      const arr = [...prev[key]];
      arr[taskIdx] = val;
      return { ...prev, [key]: arr };
    });
  const updateS2Written = (subjectIdx: number, taskIdx: number, val: number) =>
    setS2((prev) =>
      prev.map((s, i) => {
        if (i !== subjectIdx) return s;
        const ws = [...s.writtenScores];
        ws[taskIdx] = val;
        return { ...s, writtenScores: ws };
      })
    );

  // ── Hesablamalar ──

  const stage1Results = useMemo(() => {
    const xarici = calcStage1Xarici(clamp(s1.xariciClosed, 0, 23), s1.xariciOpenWritten);
    const az = calcStage1Az(clamp(s1.azClosed, 0, 20), s1.azOpenWritten);
    const riya = calcStage1Riya(clamp(s1.riyaClosed, 0, 13), clamp(s1.riyaOpenCoded, 0, 5), s1.riyaOpenWritten);
    return { xarici, az, riya, total: round1(xarici + az + riya) };
  }, [s1]);

  const stage9Results = useMemo(() => {
    const td = calc9Tedris(clamp(s9.tdQapali, 0, 26), s9.tdYazili);
    const riya = calc9Riya(clamp(s9.riyaQapali, 0, 15), clamp(s9.riyaKod, 0, 6), s9.riyaYazili);
    const xd = calc9Xarici(clamp(s9.xdQapali, 0, 22), clamp(s9.xdKod, 0, 2), clamp(s9.xdDY, 0, 1), clamp(s9.xdEsse, 0, 5));
    return { td, riya, xd, total: round1(td + riya + xd) };
  }, [s9]);

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
    return { results, total: round1(results.reduce((sum, r) => sum + r.weighted, 0)) };
  }, [s2, group, isVGroup]);

  const grandTotal = isBlok ? round1(stage2Results?.total ?? 0) : is9 ? stage9Results.total : stage1Results.total;
  const maxTotal = isBlok ? 400 : 300;
  const scoreColor = getScoreColor((grandTotal * 700) / maxTotal);
  const barColor =
    grandTotal >= maxTotal * 0.85
      ? "#22c55e"
      : grandTotal >= maxTotal * 0.7
      ? "#10b981"
      : grandTotal >= maxTotal * 0.55
      ? "#eab308"
      : grandTotal >= maxTotal * 0.4
      ? "#f97316"
      : "#ef4444";

  const writtenGrid = (scores: number[], onChange: (i: number, v: number) => void, labelPrefix: string, options: Opt[]) => (
    <View style={{ gap: 6 }}>
      {scores.map((v, i) => (
        <WrittenPick key={i} label={`${labelPrefix} ${i + 1}`} value={v} onChange={(nv) => onChange(i, nv)} options={options} />
      ))}
    </View>
  );

  return (
    <View>
      {/* İmtahan növü */}
      <SectionHeading>İmtahan növünü seçin</SectionHeading>
      <OptionCards
        options={[
          { id: "buraxilis" as ExamType, label: "Buraxılış imtahanı", icon: "🎓" },
          { id: "blok" as ExamType, label: "Blok imtahanı", icon: "📚" },
        ]}
        selected={examType}
        onSelect={setExamType}
      />

      {/* Buraxılış: sinif */}
      {isBuraxilis && (
        <View style={styles.block}>
          <SectionHeading>Sinifi seçin</SectionHeading>
          <OptionCards
            options={[
              { id: "9" as GradeLevel, label: "9-cu sinif" },
              { id: "11" as GradeLevel, label: "11-ci sinif" },
            ]}
            selected={gradeLevel}
            onSelect={setGradeLevel}
          />
          <Caption>
            {is9
              ? "9-cu sinif buraxılış imtahanı 3 fənn üzrə hesablanır: tədris dili, riyaziyyat və xarici dil. Hər fənn 100 baldır, ümumi 300 bal."
              : "11-ci sinif buraxılış imtahanı DİM-in birinci mərhələ qaydalarına əsasən hesablanır."}
          </Caption>
        </View>
      )}

      {/* Blok: qrup */}
      {isBlok && (
        <View style={styles.block}>
          <SectionHeading>1. İxtisas qrupunu seçin</SectionHeading>
          <OptionCards
            options={GROUP_DEFS.filter((g) => g.id !== "5").map((g) => ({ id: g.id, label: g.name }))}
            selected={selectedGroup}
            onSelect={(id) => {
              setSelectedGroup(id);
              resetAll();
            }}
            columns={3}
          />
          <Caption>Blok imtahanı seçilmiş ixtisas qrupuna uyğun 3 fənn üzrə hesablanır (max 400 bal).</Caption>
        </View>
      )}

      {/* 9-cu sinif */}
      {is9 && (
        <View style={styles.block}>
          <SubjectCard title="Azərbaycan (rus) dili" sub="(30 tapşırıq)" score={`${stage9Results.td} bal`}>
            <NumInput label="Qapalı tipli düzgün cavablar" value={s9.tdQapali} onChange={(v) => updateS9("tdQapali", v)} max={26} hint="max 26" parse="float" />
            <Caption>Açıq (yazılı) tapşırıqlar (4)</Caption>
            {writtenGrid(s9.tdYazili, (i, v) => updateS9Yazili("td", i, v), "Yazılı tapşırıq", WRITTEN_OPTIONS)}
          </SubjectCard>

          <SubjectCard title="Riyaziyyat" sub="(25 tapşırıq)" score={`${stage9Results.riya} bal`}>
            <NumInput label="Qapalı tipli düzgün cavablar" value={s9.riyaQapali} onChange={(v) => updateS9("riyaQapali", v)} max={15} hint="max 15" parse="float" />
            <NumInput label="Açıq (kodlaşdırılma) düzgün cavablar" value={s9.riyaKod} onChange={(v) => updateS9("riyaKod", v)} max={6} hint="max 6" parse="float" />
            <Caption>Açıq (yazılı) tapşırıqlar (4)</Caption>
            {writtenGrid(s9.riyaYazili, (i, v) => updateS9Yazili("riya", i, v), "Yazılı tapşırıq", WRITTEN_OPTIONS)}
          </SubjectCard>

          <SubjectCard title="Xarici dil" sub="(26 tapşırıq)" score={`${stage9Results.xd} bal`}>
            <NumInput label="Qapalı tipli düzgün cavablar" value={s9.xdQapali} onChange={(v) => updateS9("xdQapali", v)} max={22} hint="max 22" parse="float" />
            <NumInput label="Açıq (kodlaşdırılma) düzgün cavablar" value={s9.xdKod} onChange={(v) => updateS9("xdKod", v)} max={2} hint="max 2" parse="float" />
            <WrittenPick label="Doğru/yanlış tapşırığı" value={s9.xdDY} onChange={(v) => updateS9("xdDY", v)} options={DY_OPTIONS} />
            <View style={{ height: 12 }} />
            <NumInput label="Esse balı (0–5)" value={s9.xdEsse} onChange={(v) => updateS9("xdEsse", v)} max={5} hint="0–5" parse="float" />
          </SubjectCard>

          <TotalBox
            color={TONE.blue}
            title="Birinci mərhələ cəmi"
            sub={`Az. dili (${stage9Results.td}) + Riyaziyyat (${stage9Results.riya}) + Xarici dil (${stage9Results.xd})`}
            value={stage9Results.total}
            max={300}
          />
        </View>
      )}

      {/* 11-ci sinif / Birinci mərhələ */}
      {is11 && (
        <View style={styles.block}>
          <Caption>Xarici dil, Azərbaycan dili və Riyaziyyat (max 300 bal)</Caption>

          <SubjectCard title="Xarici dil" sub="(30 tapşırıq)" score={`${stage1Results.xarici} bal`}>
            <NumInput label="Qapalı tipli düzgün cavab sayı" value={s1.xariciClosed} onChange={(v) => updateS1("xariciClosed", v)} max={23} hint="max 23" />
            <Caption>Açıq tipli (yazılı) düzgün cavab sayı (7 tapşırıq × 0, ⅓, ⅔, 1)</Caption>
            {writtenGrid(s1.xariciOpenWritten, (i, v) => updateS1Written("xariciOpenWritten", i, v), "Tapşırıq", WRITTEN_OPTIONS_11)}
          </SubjectCard>

          <SubjectCard title="Azərbaycan (rus) dili" sub="(30 tapşırıq)" score={`${stage1Results.az} bal`}>
            <NumInput label="Qapalı tipli düzgün cavab sayı" value={s1.azClosed} onChange={(v) => updateS1("azClosed", v)} max={20} hint="max 20" />
            <Caption>Açıq tipli (yazılı) düzgün cavab sayı (10 tapşırıq × 0, ⅓, ⅔, 1)</Caption>
            {writtenGrid(s1.azOpenWritten, (i, v) => updateS1Written("azOpenWritten", i, v), "Tapşırıq", WRITTEN_OPTIONS_11)}
          </SubjectCard>

          <SubjectCard title="Riyaziyyat" sub="(25 tapşırıq)" score={`${stage1Results.riya} bal`}>
            <NumInput label="Qapalı tipli düzgün cavab sayı" value={s1.riyaClosed} onChange={(v) => updateS1("riyaClosed", v)} max={13} hint="max 13" />
            <NumInput label="Açıq (kodlaşdırılma) düzgün cavab sayı" value={s1.riyaOpenCoded} onChange={(v) => updateS1("riyaOpenCoded", v)} max={5} hint="max 5" />
            <Caption>Açıq (yazılı) düzgün cavab sayı (7 tapşırıq × 0, ⅓, ⅔, 1)</Caption>
            {writtenGrid(s1.riyaOpenWritten, (i, v) => updateS1Written("riyaOpenWritten", i, v), "Tapşırıq", WRITTEN_OPTIONS_11)}
          </SubjectCard>

          <TotalBox
            color={TONE.blue}
            title="Birinci mərhələ cəmi"
            sub={`Xarici dil (${stage1Results.xarici}) + Az. dili (${stage1Results.az}) + Riyaziyyat (${stage1Results.riya})`}
            value={stage1Results.total}
            max={300}
          />
        </View>
      )}

      {/* Blok: İkinci mərhələ */}
      {isBlok && !isVGroup && (
        <View style={styles.block}>
          <SectionHeading>3. İkinci mərhələ</SectionHeading>
          <Caption>{group.name} fənləri (max 400 bal)</Caption>

          {group.subjects.map(([subjectName, coeff], idx) => {
            const r = stage2Results?.results[idx];
            const yqMax = 22 - clamp(s2[idx].dq, 0, 22);
            return (
              <SubjectCard
                key={subjectName}
                title={subjectName}
                sub={`(30 tapşırıq, ×${coeff} çəki)`}
                score={`${r?.weighted ?? 0} bal`}
                scoreSub={`NB: ${r?.nb ?? 0}`}
              >
                <Caption>Qapalı tip (22 tapşırıq)</Caption>
                <NumInput label="Düzgün cavab sayı (Dq)" value={s2[idx].dq} onChange={(v) => updateS2(idx, "dq", v)} max={22} hint="max 22" />
                <NumInput label="Yanlış cavab sayı (Yq)" value={s2[idx].yq} onChange={(v) => updateS2(idx, "yq", v)} max={yqMax} hint={`max ${yqMax}`} />

                <Caption>Açıq tip (5 kodlaşdırılma + 3 yazılı)</Caption>
                <NumInput label="Kodlaşdırılma düzgün cavab sayı (Dkod)" value={s2[idx].dkod} onChange={(v) => updateS2(idx, "dkod", v)} max={5} hint="max 5" />
                {writtenGrid(s2[idx].writtenScores, (ti, val) => updateS2Written(idx, ti, val), "Yazılı tapşırıq", WRITTEN_OPTIONS)}

                {r && (
                  <View style={[styles.breakdown, { borderTopColor: colors.n280 }]}>
                    <Text style={[styles.bdText, { color: colors.n580 }]}>
                      NBq (qapalı): <Text style={[styles.bdStrong, { color: colors.n940 }]}>{r.nbq}</Text>
                    </Text>
                    <Text style={[styles.bdText, { color: colors.n580 }]}>
                      NBa (açıq): <Text style={[styles.bdStrong, { color: colors.n940 }]}>{r.nba}</Text>
                    </Text>
                    <Text style={[styles.bdText, { color: colors.n580 }]}>
                      NB: <Text style={[styles.bdStrong, { color: colors.n940 }]}>{r.nb}</Text>
                    </Text>
                    <Text style={[styles.bdText, { color: colors.n580 }]}>
                      Çəkili:{" "}
                      <Text style={[styles.bdStrong, { color: colors.n940 }]}>
                        {r.nb} × {coeff} = {r.weighted}
                      </Text>
                    </Text>
                  </View>
                )}
              </SubjectCard>
            );
          })}

          <TotalBox
            color={TONE.purple}
            title="İkinci mərhələ cəmi"
            sub={stage2Results?.results.map((r) => `${r.subjectName} (${r.weighted})`).join(" + ") ?? ""}
            value={stage2Results?.total ?? 0}
            max={400}
          />
        </View>
      )}

      {isBlok && isVGroup && (
        <InfoBox variant="info">
          V qrup üçün yalnız birinci mərhələ balı hesablanır. Qabiliyyət imtahanı balı ayrıca qiymətləndirilir.
        </InfoBox>
      )}

      {/* Nəticələr */}
      <View style={{ gap: 12, marginTop: 8 }}>
        <ResultHero
          label={isBuraxilis ? "Buraxılış imtahanı" : "Blok imtahanı"}
          value={String(grandTotal)}
          sub={`${maxTotal} baldan`}
        />

        <View style={[styles.level, { borderColor: scoreColor.color + "88", backgroundColor: scoreColor.color + "14" }]}>
          <Text style={[styles.levelLabel, { color: scoreColor.color }]}>{scoreColor.label}</Text>
          <View style={{ marginTop: 8 }}>
            <Bar ratio={grandTotal / maxTotal} color={barColor} height={12} />
          </View>
          <Text style={[styles.levelPct, { color: colors.n580 }]}>{round1((grandTotal / maxTotal) * 100)}%</Text>
        </View>

        {isBlok && grandTotal > 0 && (
          <View style={[styles.uni, { borderColor: colors.n280, backgroundColor: colors.n200 }]}>
            <View style={[styles.uniHead, { backgroundColor: colors.n240, borderBottomColor: colors.n280 }]}>
              <Text style={[styles.uniTitle, { color: colors.n940 }]}>Universitetlər ilə müqayisə (təxmini)</Text>
            </View>
            {UNIVERSITIES.map((uni) => {
              const passes = grandTotal >= uni.minScore;
              return (
                <View
                  key={uni.name}
                  style={[
                    styles.uniRow,
                    { borderBottomColor: colors.n240 },
                    passes && { backgroundColor: TONE.green + "14" },
                  ]}
                >
                  <View style={styles.uniLeft}>
                    <View style={[styles.dot, { backgroundColor: passes ? "#22c55e" : colors.n340 }]} />
                    <Text
                      style={[
                        styles.uniName,
                        { color: passes ? TONE.green : colors.n580 },
                        passes && { fontWeight: "600" },
                      ]}
                    >
                      {uni.name}
                    </Text>
                  </View>
                  <View style={styles.uniRight}>
                    <Text style={[styles.uniMin, { color: colors.n580 }]}>Min: ~{uni.minScore}</Text>
                    {passes && (
                      <View style={[styles.pass, { backgroundColor: TONE.green }]}>
                        <Text style={styles.passText}>Keçir</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
            <View style={[styles.uniFoot, { backgroundColor: colors.n240 }]}>
              <Text style={[styles.uniMin, { color: colors.n580 }]}>Minimum ballar təxminidir və hər il dəyişə bilər.</Text>
            </View>
          </View>
        )}

        <InfoBox variant="info">
          <Text style={[styles.disc, { color: colors.n760 }]}>
            <Text style={{ fontWeight: "700" }}>Diqqət:</Text> {DISCLAIMER}
          </Text>
        </InfoBox>
      </View>

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["gpa", "ielts", "sat"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 8, marginBottom: 8 },
  optGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  optCard: { flexGrow: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6, alignItems: "center" },
  optIcon: { fontSize: 22, marginBottom: 4 },
  optText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  caption: { fontSize: 12, marginBottom: 8, lineHeight: 17 },
  subj: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 },
  subjHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 },
  subjTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  subjSub: { fontSize: 11, fontWeight: "400" },
  subjScore: { fontSize: 14, fontWeight: "800" },
  pickRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  pickLabel: { fontSize: 12, flex: 1 },
  pickOpts: { flexDirection: "row", gap: 4 },
  pickChip: { borderWidth: 1, borderRadius: 8, minWidth: 38, paddingHorizontal: 6, paddingVertical: 6, alignItems: "center" },
  pickText: { fontSize: 12, fontWeight: "700" },
  total: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  totalTitle: { fontSize: 14, fontWeight: "700" },
  totalSub: { fontSize: 11, marginTop: 2, opacity: 0.85 },
  totalValue: { fontSize: 22, fontWeight: "800" },
  totalMax: { fontSize: 13, fontWeight: "400" },
  breakdown: { borderTopWidth: 1, marginTop: 10, paddingTop: 8, flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 2 },
  bdText: { fontSize: 11 },
  bdStrong: { fontWeight: "700" },
  level: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "stretch" },
  levelLabel: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  levelPct: { fontSize: 12, textAlign: "center", marginTop: 4 },
  uni: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  uniHead: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  uniTitle: { fontSize: 14, fontWeight: "700" },
  uniRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  uniLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  uniName: { fontSize: 13, flexShrink: 1 },
  uniRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  uniMin: { fontSize: 11 },
  pass: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  passText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  uniFoot: { paddingHorizontal: 14, paddingVertical: 8 },
  disc: { fontSize: 12, lineHeight: 18 },
});
