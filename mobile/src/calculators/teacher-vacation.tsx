import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultSection } from "@/components/ResultRow";
import { Select } from "@/components/Select";
import { SectionHeading, Paragraph, Card, ResultHero, StatGrid, FormulaSection, RelatedCalculators } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { OptionCards, AmountCard, CardRow, Muted, Step, Calc, MiniRow, MonthAmountsTable, TintBox } from "./_leave-parts";

// ============================================================
// Müəllimlərin əmək məzuniyyəti hesablayıcısı
// Son 12 aylıq qazanc əsasında hesablanır
// Orta aylıq = cəmi ÷ 12, Orta günlük = orta aylıq ÷ 30.4
// Məzuniyyət pulu = orta günlük × gün sayı (56 və ya 42)
// ============================================================

const MONTHS_AZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

const DAILY_DIVISOR = 30.4;

const FORMULA_TITLE = "Müəllim məzuniyyət haqqı necə hesablanır?";
const FORMULA_CONTENT = `Hesablama qaydası:
1. Son 12 aylıq ümumi qazanc toplanır
2. Orta aylıq əmək haqqı = Cəmi ÷ 12
3. Orta günlük əmək haqqı = Orta aylıq ÷ 30,4
4. Məzuniyyət pulu = Orta günlük × gün sayı

Müəllimlərin məzuniyyət müddəti:
• 56 təqvim günü — əsas məzuniyyət
• 42 təqvim günü — bəzi hallarda

Nümunə (son 12 ay cəmi: 15 065₼):
Orta aylıq: 15 065 ÷ 12 = 1 255,42₼
Orta günlük: 1 255,42 ÷ 30,4 = 41,30₼
56 günlük məzuniyyət: 41,30 × 56 = 2 312,81₼
42 günlük məzuniyyət: 41,30 × 42 = 1 734,60₼`;

const fmt = (n: number) => fmtNum(n, 2);
const round2 = (n: number) => Math.round(n * 100) / 100;
const pf = (s: string | undefined) => parseFloat((s || "0").replace(",", ".")) || 0;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// İki tarix arasında (daxil olmaqla) iş günlərinin sayı — yalnız həftə sonları (şənbə/bazar) çıxılır
function countWorkdays(start: Date, end: Date): number {
  let c = 0;
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (d <= end) {
    const w = d.getDay();
    if (w !== 0 && w !== 6) c++;
    d.setDate(d.getDate() + 1);
  }
  return c;
}

function getLast12Months(startYear: number, startMonth: number): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < 12; i++) {
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
    months.unshift({ year: y, month: m });
  }
  return months;
}

export function TeacherVacationCalculator() {
  const { colors } = useTheme();
  const [vacationDays, setVacationDays] = useState<56 | 42>(56);

  // Məzuniyyətin başlandığı tarix (default: 1 iyul 2026)
  const [vacYear, setVacYear] = useState(2026);
  const [vacMonth, setVacMonth] = useState(6); // 0-indexed, 6 = İyul
  const [vacDay, setVacDay] = useState(1);

  const last12 = useMemo(() => getLast12Months(vacYear, vacMonth), [vacYear, vacMonth]);

  const [entryMode, setEntryMode] = useState<"uniform" | "individual">("uniform");
  const [uniformAmount, setUniformAmount] = useState("");
  const [monthAmounts, setMonthAmounts] = useState<Record<string, string>>({});
  const setMonthAmount = (key: string, value: string) => setMonthAmounts((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    let totalEarnings = 0;
    const monthDetails: { label: string; amount: number }[] = [];

    for (const m of last12) {
      const val = entryMode === "uniform" ? pf(uniformAmount) : pf(monthAmounts[`${m.year}-${m.month}`]);
      totalEarnings += val;
      monthDetails.push({ label: `${MONTHS_AZ[m.month]} ${m.year}`, amount: val });
    }

    if (totalEarnings <= 0) return null;

    // ── Üsul A: orta əmək haqqı (son 12 ay) ──
    const avgMonthly = round2(totalEarnings / 12);
    const avgDaily = round2(avgMonthly / DAILY_DIVISOR);
    const vacationPay = round2(avgDaily * vacationDays);

    // ── Üsul B: saxlanılan (sonuncu) əmək haqqı ──
    const lastSalary =
      entryMode === "uniform" ? pf(uniformAmount) : pf(monthAmounts[`${last12[11].year}-${last12[11].month}`]);

    let methodB = 0;
    const methodBSteps: { label: string; full: boolean; workdays?: number; monthWorkdays?: number; amount: number }[] = [];
    // Üsul B yalnız aylar fərqli olduqda mənalıdır
    if (lastSalary > 0 && entryMode === "individual") {
      const start = new Date(vacYear, vacMonth, vacDay);
      const end = new Date(vacYear, vacMonth, vacDay);
      end.setDate(end.getDate() + vacationDays - 1);

      const cur = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cur <= end) {
        const y = cur.getFullYear();
        const mo = cur.getMonth();
        const dim = daysInMonth(y, mo);
        const firstOfMonth = new Date(y, mo, 1);
        const lastOfMonth = new Date(y, mo, dim);
        const mStart = firstOfMonth < start ? start : firstOfMonth;
        const mEnd = lastOfMonth > end ? end : lastOfMonth;
        const isFull = mStart.getDate() === 1 && mEnd.getDate() === dim;
        if (isFull) {
          methodB += lastSalary;
          methodBSteps.push({ label: `${MONTHS_AZ[mo]} ${y}`, full: true, amount: round2(lastSalary) });
        } else {
          const monthWd = countWorkdays(firstOfMonth, lastOfMonth);
          const wd = countWorkdays(mStart, mEnd);
          const amt = monthWd > 0 ? (lastSalary / monthWd) * wd : 0;
          methodB += amt;
          methodBSteps.push({
            label: `${MONTHS_AZ[mo]} ${y}`,
            full: false,
            workdays: wd,
            monthWorkdays: monthWd,
            amount: round2(amt),
          });
        }
        cur.setMonth(cur.getMonth() + 1);
      }
      methodB = round2(methodB);
    }

    const payable = Math.max(vacationPay, methodB);

    return {
      totalEarnings,
      avgMonthly,
      avgDaily,
      vacationPay,
      vacationDays,
      monthDetails,
      lastSalary,
      methodB,
      methodBSteps,
      payable,
      methodBHigher: methodB > vacationPay,
    };
  }, [monthAmounts, last12, vacationDays, entryMode, uniformAmount, vacYear, vacMonth, vacDay]);

  const vacMonthLabel = `${MONTHS_AZ[vacMonth]} ${vacYear}`;
  const individualTotal = last12.reduce((s, m) => s + pf(monthAmounts[`${m.year}-${m.month}`]), 0);

  return (
    <View>
      <OptionCards
        label="Məzuniyyət müddəti"
        columns={2}
        options={[
          { value: 56, label: "56 gün", desc: "Əsas məzuniyyət" },
          { value: 42, label: "42 gün", desc: "Qısaldılmış məzuniyyət" },
        ]}
        selected={vacationDays}
        onSelect={(v) => setVacationDays(v as 56 | 42)}
      />

      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.n700, marginBottom: 6 }}>
        Məzuniyyət başlama tarixi
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 0.8 }}>
          <Select
            value={String(vacDay)}
            options={Array.from({ length: daysInMonth(vacYear, vacMonth) }, (_, i) => i + 1).map((d) => ({
              value: String(d),
              label: String(d),
            }))}
            onSelect={(v) => setVacDay(parseInt(v))}
          />
        </View>
        <View style={{ flex: 1.3 }}>
          <Select
            value={String(vacMonth)}
            options={MONTHS_AZ.map((name, i) => ({ value: String(i), label: name }))}
            onSelect={(v) => setVacMonth(parseInt(v))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            value={String(vacYear)}
            options={[2024, 2025, 2026, 2027].map((y) => ({ value: String(y), label: String(y) }))}
            onSelect={(v) => setVacYear(parseInt(v))}
          />
        </View>
      </View>
      <Muted>Məzuniyyətdən əvvəlki son 12 ay avtomatik hesablanacaq</Muted>

      <OptionCards
        label="Maaş daxiletmə üsulu"
        columns={2}
        options={[
          { value: "uniform", label: "Bütün aylar eyni", desc: "Bir dəfə yaz, 12 aya tətbiq olunsun" },
          { value: "individual", label: "Aylar fərqli", desc: "Hər ayı bir-bir yaz" },
        ]}
        selected={entryMode}
        onSelect={(v) => setEntryMode(v as "uniform" | "individual")}
      />

      <Muted>
        {`Məzuniyyət ayı (${vacMonthLabel}) daxil edilmir — ondan əvvəlki 12 ay götürülür: `}
        <Text style={{ fontWeight: "700", color: colors.n940 }}>
          {MONTHS_AZ[last12[0].month]} {last12[0].year} – {MONTHS_AZ[last12[last12.length - 1].month]}{" "}
          {last12[last12.length - 1].year}
        </Text>
      </Muted>

      {entryMode === "uniform" ? (
        <View>
          <InputField
            label="Aylıq gross (hesablanmış) maaş (AZN)"
            value={uniformAmount}
            onChangeText={setUniformAmount}
            placeholder="1255"
            keyboardType="decimal-pad"
            hint="Vergidən əvvəlki gross məbləğ. Bu məbləğ aşağıdakı 12 ayın hamısına tətbiq olunur"
          />
          <ResultSection>
            <MiniRowPadded label="Cəmi (×12)" value={`${fmt(pf(uniformAmount) * 12)} ₼`} />
          </ResultSection>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.n700, marginBottom: 6 }}>
            Son 12 aylıq gross qazanc (AZN)
          </Text>
          <MonthAmountsTable
            months={last12}
            monthNames={MONTHS_AZ}
            values={monthAmounts}
            onChange={setMonthAmount}
            amountHeader="Məbləğ (AZN)"
            totalLabel="Cəmi"
            totalValue={`${fmt(individualTotal)} ₼`}
          />
        </View>
      )}

      {result ? (
        <View>
          <ResultHero
            label={`Ödəniləcək məzuniyyət haqqı (${result.vacationDays} gün)`}
            value={fmt(result.payable)}
            sub={
              result.methodB > 0
                ? `AZN\n${
                    result.methodBHigher
                      ? "Yeni üsul (saxlanılan əmək haqqı) daha yüksəkdir — bu ödənilir"
                      : "Orta əmək haqqı üsulu daha yüksəkdir — bu ödənilir"
                  }`
                : "AZN"
            }
          />

          {result.methodB > 0 && (
            <CardRow>
              <AmountCard
                tone={!result.methodBHigher ? "blue" : "neutral"}
                label="Üsul A — Orta əmək haqqı"
                value={`${fmt(result.vacationPay)} ₼`}
                sub="Son 12 ayın ortası ÷ 30,4 × gün"
              />
              <AmountCard
                tone={result.methodBHigher ? "blue" : "neutral"}
                label="Üsul B — Saxlanılan əmək haqqı"
                value={`${fmt(result.methodB)} ₼`}
                sub="Sonuncu maaş: tam ay + qalan günlərin iş günü hesabı"
              />
            </CardRow>
          )}

          {result.methodB > 0 && (
            <ResultSection title="🗓️ Üsul B — Saxlanılan əmək haqqı">
              <View style={{ padding: 14 }}>
                <Muted>
                  Sonuncu maaş:{" "}
                  <Text style={{ fontWeight: "700", color: colors.n940 }}>{fmt(result.lastSalary)} ₼</Text>
                </Muted>
                <View style={{ backgroundColor: colors.n240, borderRadius: 8, padding: 10 }}>
                  {result.methodBSteps.map((s, i) => (
                    <MiniRow
                      key={i}
                      label={`${s.label} — ${
                        s.full
                          ? "tam ay"
                          : `natamam ay: ${fmt(result.lastSalary)} ÷ ${s.monthWorkdays} × ${s.workdays} iş günü`
                      }`}
                      value={`${fmt(s.amount)} ₼`}
                    />
                  ))}
                  <View style={{ borderTopWidth: 1, borderTopColor: colors.n280, marginTop: 4, paddingTop: 4 }}>
                    <MiniRow label="Cəmi" value={`${fmt(result.methodB)} ₼`} bold />
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: colors.n580, marginTop: 8 }}>
                  İş günləri yalnız həftə sonları (şənbə/bazar) çıxılmaqla hesablanır; rəsmi bayramlar nəzərə alınmır.
                </Text>
              </View>
            </ResultSection>
          )}

          {/* Addım-addım hesablama (Üsul A) */}
          <ResultSection title="📋 Hesablama qaydası · addım-addım">
            <Step n={1} title="Son 12 aylıq ümumi qazanc">
              {result.monthDetails.map((m, i) => (
                <MiniRow key={i} label={`${m.label}:`} value={`${fmt(m.amount)}₼`} dim={m.amount <= 0} />
              ))}
              <View style={{ borderTopWidth: 1, borderTopColor: colors.n280, marginTop: 6, paddingTop: 6 }}>
                <Calc strong={`${fmt(result.totalEarnings)} AZN`}>Cəmi: </Calc>
              </View>
            </Step>
            <Step n={2} title="Orta aylıq əmək haqqı">
              <Calc strong={`${fmt(result.avgMonthly)} AZN`}>{fmt(result.totalEarnings)} ÷ 12 ay = </Calc>
            </Step>
            <Step n={3} title="Orta günlük əmək haqqı">
              <Calc strong={`${fmt(result.avgDaily)} AZN`}>{fmt(result.avgMonthly)} ÷ 30,4 = </Calc>
              <Text style={{ fontSize: 11, color: colors.n580, marginTop: 4 }}>
                30,4 — qanunla müəyyən edilmiş orta aylıq gün sayı
              </Text>
            </Step>
            <Step n={4} tone="green" title="Məzuniyyət haqqı">
              <Calc strong={`${fmt(result.vacationPay)} AZN`} color="#22c55e">
                {fmt(result.avgDaily)} × {result.vacationDays} gün ={" "}
              </Calc>
            </Step>
          </ResultSection>

          {/* Xülasə */}
          <SectionHeading icon="📊">Xülasə</SectionHeading>
          <StatGrid
            items={[
              { label: "12 aylıq qazanc", value: `${fmt(result.totalEarnings)}₼` },
              { label: "Orta aylıq", value: `${fmt(result.avgMonthly)}₼` },
              { label: "Orta günlük", value: `${fmt(result.avgDaily)}₼` },
              { label: `Məzuniyyət (${result.vacationDays} gün)`, value: `${fmt(result.vacationPay)}₼`, accent: true },
            ]}
          />

          {/* Müqayisə */}
          <TintBox tone="amber" title="Müqayisə">
            <CardRow>
              <AmountCard tone={vacationDays === 56 ? "blue" : "neutral"} label="56 gün" value={`${fmt(result.avgDaily * 56)} ₼`} />
              <AmountCard tone={vacationDays === 42 ? "blue" : "neutral"} label="42 gün" value={`${fmt(result.avgDaily * 42)} ₼`} />
            </CardRow>
            <Text style={{ fontSize: 12, color: "#d97706", marginTop: 8 }}>
              {`Fərq: ${fmt(result.avgDaily * 14)} AZN (14 gün)`}
            </Text>
          </TintBox>
        </View>
      ) : (
        <Card>
          <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>🏖️</Text>
          <Paragraph>Nəticəni görmək üçün aylıq qazancları daxil edin.</Paragraph>
        </Card>
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["teacher-salary", "salary", "vacation-pay", "sick-leave"]} />
    </View>
  );
}

function MiniRowPadded({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
      <MiniRow label={label} value={value} bold />
    </View>
  );
}
