"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";
import type { PlanEntry } from "@/data/admissions-plan-2026";
import { planGroup1 } from "@/data/admissions-plan-2026-group1";
import { planGroup2 } from "@/data/admissions-plan-2026-group2";
import { planGroup3 } from "@/data/admissions-plan-2026-group3";
import { planGroup4 } from "@/data/admissions-plan-2026-group4";

const GROUPS: { id: string; roman: string; label: string; entries: PlanEntry[] }[] = [
  { id: "1", roman: "I", label: "I qrup (riyaziyyat, fizika, kimya)", entries: planGroup1 },
  { id: "2", roman: "II", label: "II qrup (riyaziyyat, coğrafiya)", entries: planGroup2 },
  { id: "3", roman: "III", label: "III qrup (ədəbiyyat, tarix)", entries: planGroup3 },
  { id: "4", roman: "IV", label: "IV qrup (biologiya, kimya, fizika)", entries: planGroup4 },
];

const LANGUAGE_LABELS: Record<string, string> = {
  AZ: "Azərbaycan dili",
  RU: "Rus dili",
  "AZ/RU": "Azərbaycan / rus dili",
  EN: "İngilis dili",
  TR: "Türk dili",
  DE: "Alman dili",
};

const SOURCE = "DİM 2026 «Abituriyent 4» jurnalından götürülüb";

const t: Record<Lang, { title: string; description: string; bcat: string; formulaTitle: string; formulaContent: string }> = {
  az: {
    title: "İxtisas kodları 2026 — DİM Abituriyent 4",
    description:
      "DİM-in 2026-cı il «Abituriyent 4» jurnalı üzrə I, II, III və IV ixtisas qruplarının tam siyahısı: ixtisas kodu, universitet, plan yerlərinin sayı, tədris dili və illik təhsil haqqı.",
    bcat: "Təhsil",
    formulaTitle: "Bu siyahı nədir?",
    formulaContent: `Dövlət İmtahan Mərkəzinin (DİM) hər il nəşr etdiyi «Abituriyent 4» jurnalı ixtisas seçimi üçün əsas sənəddir. Orada qəbul aparılan bütün ixtisaslar kodu, plan yerlərinin sayı və təhsil haqqı ilə birlikdə verilir.

Bu səhifədə həmin jurnalın I-IV ixtisas qrupları üzrə tam siyahısı yerləşdirilib — 1668 ixtisas, 41 ali təhsil müəssisəsi, ümumilikdə 61 516 plan yeri.

Hər sətirdə göstərilir:
• İxtisas kodu — ixtisas seçimi zamanı elektron formaya yazılan 6 rəqəmli kod
• Universitet və ixtisasın tam adı
• Altqrup — I qrup üçün RK/Rİ, III qrup üçün DT/TC
• Plan yeri — bu il həmin ixtisasa ayrılmış yerlərin sayı
• Tədris dili — Azərbaycan, rus, ingilis, türk və ya alman
• İllik təhsil haqqı (manatla). "YDS" — yalnız dövlət sifarişi, "DH" — dövlət hesabına.

Axtarış xanasına ixtisas kodunu, ixtisasın adını və ya universitetin adını yazaraq siyahını süzgəcdən keçirə bilərsiniz.

Mənbə: ${SOURCE}. Keçid balları ilə birlikdə baxmaq üçün qrup hesablayıcılarından istifadə edin.`,
  },
  en: {
    title: "Specialty Codes 2026 — Abituriyent 4",
    description:
      "Full list of specialty codes from Azerbaijan's SEC (DİM) 2026 Abituriyent 4 booklet: code, university, seats, language of instruction and tuition fee for groups I-IV.",
    bcat: "Education",
    formulaTitle: "What is this list?",
    formulaContent: `The "Abituriyent 4" booklet published annually by the State Examination Center (DİM) is the reference document for specialty selection in Azerbaijan.

This page contains its complete groups I-IV listing — 1668 specialties across 41 higher education institutions, 61,516 planned seats in total.

Each row shows the 6-digit specialty code, university, subgroup, number of seats allocated this year, language of instruction and annual tuition fee.

Source: taken from the DİM 2026 "Abituriyent 4" booklet.`,
  },
  ru: {
    title: "Коды специальностей 2026 — Abituriyent 4",
    description:
      "Полный список кодов специальностей из журнала ГЭЦ (DİM) «Abituriyent 4» 2026: код, вуз, количество мест, язык обучения и оплата за обучение для групп I-IV.",
    bcat: "Образование",
    formulaTitle: "Что это за список?",
    formulaContent: `Журнал «Abituriyent 4», ежегодно издаваемый Государственным экзаменационным центром (ГЭЦ), — основной документ при выборе специальности.

На этой странице размещён его полный список по группам I-IV — 1668 специальностей, 41 вуз, 61 516 плановых мест.

В каждой строке указаны шестизначный код специальности, вуз, подгруппа, количество выделенных в этом году мест, язык обучения и годовая оплата за обучение.

Источник: журнал ГЭЦ «Abituriyent 4» 2026.`,
  },
};

/** Universitet → sətirlər, jurnaldakı sıra qorunmaqla. */
function byUniversity(entries: PlanEntry[]): [string, PlanEntry[]][] {
  const map = new Map<string, PlanEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.university);
    if (list) list.push(entry);
    else map.set(entry.university, [entry]);
  }
  return [...map];
}

export default function IxtisasKodlariPage() {
  const { lang } = useLanguage();
  const pt = t[lang];
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    return GROUPS.filter((g) => activeGroup === "all" || g.id === activeGroup).map((g) => {
      const entries = q
        ? g.entries.filter(
            (e) =>
              e.code.includes(q) ||
              e.specialty.toLocaleLowerCase("az").includes(q) ||
              e.university.toLocaleLowerCase("az").includes(q),
          )
        : g.entries;
      return { ...g, grouped: byUniversity(entries), total: entries.length };
    });
  }, [query, activeGroup]);

  const totalFound = visible.reduce((sum, g) => sum + g.total, 0);
  const totalSeats = visible.reduce(
    (sum, g) => sum + g.grouped.reduce((s, [, rows]) => s + rows.reduce((n, r) => n + r.seats, 0), 0),
    0,
  );

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[{ label: pt.bcat, href: "/?category=education" }, { label: pt.title }]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["admission-group1", "admission-group2", "admission-group3", "admission-group4", "admission-magistr"]}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="kod-axtar">
          İxtisas kodu, ixtisas və ya universitet üzrə axtarın
        </label>
        <input
          id="kod-axtar"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="məs. 111114, Kompüter elmləri, Bakı Dövlət Universiteti"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-foreground mb-2">İxtisas qrupu</div>
        <div className="flex flex-wrap gap-2">
          {[{ id: "all", label: "Hamısı" }, ...GROUPS.map((g) => ({ id: g.id, label: `${g.roman} qrup` }))].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveGroup(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                activeGroup === tab.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border hover:border-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted mb-4">
        <strong className="text-foreground tabular-nums">{totalFound}</strong> ixtisas ·{" "}
        <strong className="text-foreground tabular-nums">{totalSeats}</strong> plan yeri
      </p>

      {totalFound === 0 && (
        <p className="rounded-xl border border-border bg-gray-50 px-4 py-6 text-center text-muted">
          Axtarışa uyğun ixtisas tapılmadı.
        </p>
      )}

      {visible.map((group) =>
        group.total === 0 ? null : (
          <section key={group.id} className="mb-8" id={`qrup-${group.id}`}>
            <h2 className="text-lg font-bold text-foreground mb-1">{group.label}</h2>
            <p className="text-xs text-muted mb-3 tabular-nums">{group.total} ixtisas</p>

            {group.grouped.map(([university, rows]) => (
              <div key={university} className="mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">{university}</h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-muted">
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Kod</th>
                        <th className="px-3 py-2 font-medium">İxtisas</th>
                        <th className="px-3 py-2 font-medium text-right whitespace-nowrap">Plan yeri</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Tədris dili</th>
                        <th className="px-3 py-2 font-medium text-right whitespace-nowrap">Təhsil haqqı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row) => (
                        <tr key={row.code}>
                          <td className="px-3 py-2 font-semibold tabular-nums whitespace-nowrap">{row.code}</td>
                          <td className="px-3 py-2 text-foreground">
                            {row.specialty}
                            {row.subgroup && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 align-middle">
                                {row.subgroup}
                              </span>
                            )}
                            {row.aptitudeRequired && (
                              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 align-middle">
                                Qabiliyyət
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{row.seats}</td>
                          <td className="px-3 py-2 whitespace-nowrap" title={LANGUAGE_LABELS[row.language] ?? row.language}>
                            {row.language}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{row.fee ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        ),
      )}

      <p className="mt-6 rounded-xl border border-border bg-gray-50 px-4 py-3 text-sm text-muted">
        <strong className="text-foreground">Mənbə:</strong> {SOURCE}. Rəqəmlər 2026/2027 tədris ili üçündür.
      </p>
    </CalculatorLayout>
  );
}
