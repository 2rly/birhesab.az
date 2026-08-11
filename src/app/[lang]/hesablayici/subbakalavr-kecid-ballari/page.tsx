"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { AdmissionEntry } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup1Sub } from "@/data/admissions-group1-subbakalavr-2026";
import { admissionsGroup2Sub } from "@/data/admissions-group2-subbakalavr-2026";
import { admissionsGroup4Sub } from "@/data/admissions-group4-subbakalavr-2026";
import { admissionsGroup5Sub } from "@/data/admissions-group5-subbakalavr-2026";

type GroupKey = "1" | "2" | "3" | "4" | "5";

const GROUP_DATA: Record<GroupKey, AdmissionEntry[]> = {
  "1": admissionsGroup1Sub,
  "2": admissionsGroup2Sub,
  "3": [],
  "4": admissionsGroup4Sub,
  "5": admissionsGroup5Sub,
};

function fmtScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const pageTranslations = {
  az: {
    title: "Subbakalavr keçid balları 2026",
    description: "Subbakalavr təhsilini bitirənlərin ali təhsilin bakalavr səviyyəsinə keçid balları. Qrupu seçin — ixtisaslar və ballar görünsün.",
    breadcrumbCategory: "Təhsil",
    formulaTitle: "Bu nədir?",
    formulaContent: `Bu siyahı subbakalavr (ilk ali təhsil) məzunlarının bakalavriat səviyyəsinə keçid (qəbul) ballarını göstərir. Ballar 0-100 şkalasındadır.

Qrupu seçin — həmin qrup üzrə universitetlər, ixtisaslar və keçid balları görünəcək.

Ə = Əyani, Q = Qiyabi. "Dövlət sifarişli" sütunu pulsuz (büdcə) yerlər üçün balı göstərir. "—" həmin variantın olmadığını bildirir.`,
    selectGroup: "Qrupu seçin",
    group: "qrup",
    searchPlaceholder: "Universitet və ya ixtisas axtar...",
    passingScore: "Keçid balı",
    stateScore: "Dövlət sifarişli",
    aptitude: "Qabiliyyət",
    found: "ixtisas",
    noData: "Bu qrup üzrə subbakalavr məlumatı yoxdur.",
    noResults: "Axtarışa uyğun nəticə tapılmadı.",
    note: "Qeyd: Ballar 2026-cı il rəsmi nəticələrinə əsaslanır və təxmini xarakter daşıyır.",
  },
  en: {
    title: "Sub-bachelor Transfer Scores 2026",
    description: "Transfer (admission) scores from sub-bachelor to bachelor level. Select a group to view specialties and scores.",
    breadcrumbCategory: "Education",
    formulaTitle: "What is this?",
    formulaContent: `This list shows the transfer (admission) scores from sub-bachelor (initial higher education) to the bachelor level. Scores are on a 0-100 scale.

Select a group to see the universities, specialties and passing scores for that group.

Ə = Full-time, Q = Part-time. The "State-funded" column shows the score for free (budget) places. "—" means that option is not available.`,
    selectGroup: "Select group",
    group: "group",
    searchPlaceholder: "Search university or specialty...",
    passingScore: "Passing score",
    stateScore: "State-funded",
    aptitude: "Aptitude",
    found: "specialties",
    noData: "No sub-bachelor data for this group.",
    noResults: "No results match your search.",
    note: "Note: Scores are based on official 2026 results and are approximate.",
  },
  ru: {
    title: "Проходные баллы суббакалавриата 2026",
    description: "Баллы перевода (поступления) с суббакалавриата на уровень бакалавриата. Выберите группу — увидите специальности и баллы.",
    breadcrumbCategory: "Образование",
    formulaTitle: "Что это?",
    formulaContent: `Этот список показывает баллы перевода (поступления) с суббакалавриата (первое высшее образование) на уровень бакалавриата. Баллы по шкале 0-100.

Выберите группу — отобразятся университеты, специальности и проходные баллы.

Ə = Очное, Q = Заочное. Столбец «Госзаказ» показывает балл для бесплатных (бюджетных) мест. «—» означает, что вариант недоступен.`,
    selectGroup: "Выберите группу",
    group: "группа",
    searchPlaceholder: "Поиск университета или специальности...",
    passingScore: "Проходной балл",
    stateScore: "Госзаказ",
    aptitude: "Способности",
    found: "специальностей",
    noData: "Нет данных суббакалавриата для этой группы.",
    noResults: "Ничего не найдено по запросу.",
    note: "Примечание: Баллы основаны на официальных результатах 2026 года и являются приблизительными.",
  },
};

export default function SubbakalavrPage() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [group, setGroup] = useState<GroupKey>("1");
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const data = GROUP_DATA[group];
    const q = query.trim().toLocaleLowerCase("az");
    const filtered = q
      ? data.filter(
          (e) =>
            e.specialty.toLocaleLowerCase("az").includes(q) ||
            e.university.toLocaleLowerCase("az").includes(q)
        )
      : data;
    const map = new Map<string, AdmissionEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.university)) map.set(e.university, []);
      map.get(e.university)!.push(e);
    }
    return { list: Array.from(map.entries()), count: filtered.length };
  }, [group, query]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=education" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["admission-magistr", "qebul-ballari-1ci-qrup", "qebul-ballari-2ci-qrup", "gpa"]}
    >
      {/* Qrup seçimi */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">{pt.selectGroup}</label>
        <div className="grid grid-cols-5 gap-2">
          {(["1", "2", "3", "4", "5"] as GroupKey[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                group === g
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted border-border hover:bg-gray-50"
              }`}
            >
              {g}-{pt.group}
            </button>
          ))}
        </div>
      </div>

      {/* Axtarış */}
      <div className="mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={pt.searchPlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
      </div>

      {GROUP_DATA[group].length === 0 ? (
        <div className="text-center py-10 text-muted">
          <span className="text-4xl block mb-3">📭</span>
          <p>{pt.noData}</p>
        </div>
      ) : grouped.count === 0 ? (
        <div className="text-center py-10 text-muted">
          <span className="text-4xl block mb-3">🔍</span>
          <p>{pt.noResults}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            {group}-{pt.group} • {grouped.count} {pt.found}
          </p>
          {grouped.list.map(([uni, items]) => (
            <div key={uni} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground">{uni}</h3>
              </div>
              <div className="divide-y divide-border">
                {items.map((e, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-start gap-2 min-w-0">
                      {e.stream && (
                        <span
                          className={`shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${
                            e.stream === "Q"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                          title={e.stream === "Q" ? "Qiyabi" : "Əyani"}
                        >
                          {e.stream}
                        </span>
                      )}
                      <span className="text-sm text-foreground">{e.specialty}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {e.aptitude != null && (
                          <span className="text-[11px] text-muted" title={pt.aptitude}>
                            {pt.aptitude}: {fmtScore(e.aptitude)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-primary">
                          {e.score != null ? fmtScore(e.score) : "—"}
                        </span>
                      </div>
                      {e.stateScore != null && (
                        <p className="text-[11px] text-green-600 mt-0.5">
                          {pt.stateScore}: {fmtScore(e.stateScore)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 bg-blue-50 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-700 leading-relaxed">{pt.note}</p>
      </div>
    </CalculatorLayout>
  );
}
