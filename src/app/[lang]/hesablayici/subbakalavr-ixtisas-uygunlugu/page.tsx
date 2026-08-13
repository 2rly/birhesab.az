"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";
import { subbakalavrMatches } from "@/data/subbakalavr-uygunluq-2026";

const SOURCE = "DİM 2026 «Subbakalavrların ixtisas seçimi elanı» buraxılışından götürülüb";

const TOTAL_TARGETS = subbakalavrMatches.reduce((n, m) => n + m.targets.length, 0);
const TOTAL_SOURCES = subbakalavrMatches.reduce((n, m) => n + m.sources.length, 0);

const GROUPS = (() => {
  const seen = new Map<string, string>();
  for (const match of subbakalavrMatches) {
    if (match.group && !seen.has(match.group.code)) seen.set(match.group.code, match.group.name);
  }
  return [...seen].map(([code, name]) => ({ code, name }));
})();

const t: Record<Lang, { title: string; description: string; bcat: string; formulaTitle: string; formulaContent: string }> = {
  az: {
    title: "Subbakalavrların ixtisas uyğunluq kodları 2026",
    description:
      "Subbakalavr dərəcəsi almış şəxslərin bakalavriata qəbulu üçün ixtisas uyğunluğu cədvəli: bitirdiyiniz ixtisasa görə seçə biləcəyiniz bakalavriat ixtisasları və kodları.",
    bcat: "Təhsil",
    formulaTitle: "Bu cədvəl nə üçündür?",
    formulaContent: `Orta ixtisas təhsili pilləsini və ya yüksək texniki peşə təhsili səviyyəsini bitirib "subbakalavr" peşə-ixtisas dərəcəsi almış şəxslər qəbul imtahanı vermədən, müsabiqə yolu ilə ali təhsil müəssisələrinə qəbul ola bilərlər.

Lakin subbakalavr istənilən ixtisası seçə bilmir — yalnız **bitirdiyi ixtisasa uyğun olan** bakalavriat ixtisaslarını seçmək hüququ var. Hansı ixtisasın hansına uyğun olduğu bu cədvəllə müəyyən edilir. Uyğunluq Elm və Təhsil Nazirliyi tərəfindən, DİM ilə razılaşdırılmaqla təsdiqlənib.

Cədvəldə ${TOTAL_TARGETS} bakalavriat ixtisası və onlara uyğun ${TOTAL_SOURCES} subbakalavr ixtisası var.

Necə istifadə etməli:
• Axtarış xanasına bitirdiyiniz ixtisasın adını və ya şifrini yazın
• Tapılan bənddə sağda həmin ixtisasla seçə biləcəyiniz bakalavriat ixtisasları göstərilir
• Bakalavriat ixtisasının 7 rəqəmli kodunu elektron ixtisas seçimi ərizəsinə yazırsınız

Şifrlərin oxunuşu:
• Hərf prefiksli şifrlər (M, HS, T və s.) — orta ixtisas təhsili pilləsi
• Rəqəmli şifrlər — peşə təhsili pilləsinin yüksək peşə təhsili səviyyəsi

Qeyd: subbakalavr yalnız orta ixtisas və ya peşə təhsilini aldığı **tədris dilinə uyğun** ixtisasları seçə bilər.

Mənbə: ${SOURCE}.`,
  },
  en: {
    title: "Sub-bachelor Specialty Correspondence Codes 2026",
    description:
      "Specialty correspondence table for sub-bachelor (subbakalavr) graduates applying to bachelor programmes in Azerbaijan: which bachelor specialties and codes you may choose.",
    bcat: "Education",
    formulaTitle: "What is this table for?",
    formulaContent: `Graduates holding a "subbakalavr" degree may enter higher education without sitting the entrance exam, through a separate competition.

They may only choose bachelor specialties that correspond to the specialty they graduated in. This table, approved by the Ministry of Science and Education together with the State Examination Center, defines those correspondences.

It contains ${TOTAL_TARGETS} bachelor specialties and ${TOTAL_SOURCES} matching sub-bachelor specialties.

Codes with a letter prefix (M, HS, T…) belong to secondary specialised education; purely numeric codes belong to higher vocational education.

Source: DİM 2026 "Sub-bachelor specialty selection announcement".`,
  },
  ru: {
    title: "Коды соответствия специальностей для суббакалавров 2026",
    description:
      "Таблица соответствия специальностей для поступления суббакалавров на бакалавриат: какие специальности и коды вы можете выбрать по своему диплому.",
    bcat: "Образование",
    formulaTitle: "Для чего эта таблица?",
    formulaContent: `Лица со степенью «суббакалавр» могут поступать в вузы без вступительного экзамена, по отдельному конкурсу.

Выбрать можно только те специальности бакалавриата, которые соответствуют полученной специальности. Соответствие определяется этой таблицей, утверждённой Министерством науки и образования по согласованию с ГЭЦ.

В таблице ${TOTAL_TARGETS} специальностей бакалавриата и ${TOTAL_SOURCES} соответствующих им специальностей суббакалавриата.

Коды с буквенным префиксом (M, HS, T…) — среднее специальное образование; чисто цифровые — высшее профессиональное образование.

Источник: журнал ГЭЦ «Объявление о выборе специальности для суббакалавров» 2026.`,
  },
};

const LEVEL_LABEL: Record<string, string> = {
  "orta-ixtisas": "Orta ixtisas təhsili",
  "pese-tehsili": "Peşə təhsili",
};

export default function SubbakalavrUygunlugPage() {
  const { lang } = useLanguage();
  const pt = t[lang];
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    return subbakalavrMatches.filter((match) => {
      if (activeGroup !== "all" && match.group?.code !== activeGroup) return false;
      if (!q) return true;
      return (
        match.targets.some((x) => x.code.includes(q) || x.name.toLocaleLowerCase("az").includes(q)) ||
        match.sources.some(
          (x) => x.code.toLocaleLowerCase("az").includes(q) || x.name.toLocaleLowerCase("az").includes(q),
        )
      );
    });
  }, [query, activeGroup]);

  const shownSources = visible.reduce((n, m) => n + m.sources.length, 0);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[{ label: pt.bcat, href: "/?category=education" }, { label: pt.title }]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["admission-subbakalavr", "admission-codes", "admission-group1", "admission-group2"]}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="uygunluq-axtar">
          Bitirdiyiniz ixtisası və ya seçmək istədiyiniz bakalavriat ixtisasını yazın
        </label>
        <input
          id="uygunluq-axtar"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="məs. Mühasibat, HS 140102, 6006010, Proqram təminatı"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-foreground mb-2">İxtisas qrupu</div>
        <div className="flex flex-wrap gap-2">
          {[{ code: "all", name: "Hamısı" }, ...GROUPS].map((tab) => (
            <button
              key={tab.code}
              type="button"
              onClick={() => setActiveGroup(tab.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                activeGroup === tab.code
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border hover:border-primary"
              }`}
            >
              {tab.code === "all" ? tab.name : `${tab.code} ${tab.name}`}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted mb-4">
        <strong className="text-foreground tabular-nums">{visible.length}</strong> bakalavriat ixtisası ·{" "}
        <strong className="text-foreground tabular-nums">{shownSources}</strong> uyğun subbakalavr ixtisası
      </p>

      {visible.length === 0 && (
        <p className="rounded-xl border border-border bg-gray-50 px-4 py-6 text-center text-muted">
          Axtarışa uyğun ixtisas tapılmadı.
        </p>
      )}

      <div className="space-y-4">
        {visible.map((match, index) => (
          <section
            key={`${match.targets[0]?.code ?? "x"}-${index}`}
            className="rounded-xl border border-border overflow-hidden"
          >
            <header className="bg-primary/5 border-b border-border px-4 py-3">
              {match.group && (
                <div className="text-[11px] text-muted mb-1 tabular-nums">
                  {match.group.code} · {match.group.name}
                </div>
              )}
              {match.targets.map((target) => (
                <h2 key={target.code} className="text-base font-bold text-foreground leading-snug">
                  <span className="tabular-nums text-primary">{target.code}</span> {target.name}
                </h2>
              ))}
              <p className="text-xs text-muted mt-1">
                Bu ixtisası seçə bilən subbakalavr ixtisasları:{" "}
                <strong className="text-foreground tabular-nums">{match.sources.length}</strong>
              </p>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-muted">
                    <th className="px-3 py-2 font-medium whitespace-nowrap">Şifr</th>
                    <th className="px-3 py-2 font-medium">Bitirdiyiniz ixtisas</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap">Təhsil pilləsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {match.sources.map((source, i) => (
                    <tr key={`${source.code}-${i}`}>
                      <td className="px-3 py-2 font-semibold tabular-nums whitespace-nowrap">{source.code}</td>
                      <td className="px-3 py-2 text-foreground">{source.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            source.level === "orta-ixtisas"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {LEVEL_LABEL[source.level]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 rounded-xl border border-border bg-gray-50 px-4 py-3 text-sm text-muted">
        <strong className="text-foreground">Mənbə:</strong> {SOURCE}. Cədvəl 2026/2027 tədris ili üçündür.
      </p>
    </CalculatorLayout>
  );
}
