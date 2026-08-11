"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";
import { secondDegreeData } from "@/data/ikinci-ali-tehsil";
import type { SecondDegreeProgram, StudyForm } from "@/data/ikinci-ali-tehsil";

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

function formatFee(fee: number | string | undefined): string {
  if (fee === undefined) return "—";
  if (typeof fee === "number") return `${fee} AZN`;
  return `${fee} AZN`;
}

const pageTranslations: Record<Lang, {
  title: string;
  description: string;
  breadcrumbCategory: string;
  breadcrumbLabel: string;
  formulaTitle: string;
  formulaContent: string;
  searchPlaceholder: string;
  uniFilter: string;
  allUniversities: string;
  formFilter: string;
  allForms: string;
  formFace: string;
  formDistance: string;
  formBoth: string;
  resultsCount: string;
  noResults: string;
  clearFilters: string;
  specialty: string;
  university: string;
  form: string;
  fee: string;
  code: string;
  language: string;
  note: string;
  totalUniversities: string;
  totalPrograms: string;
}> = {
  az: {
    title: "İkinci ali təhsil — universitetlər və ixtisaslar",
    description: "Təkrar ali təhsil (əlavə ali təhsil) üçün Azərbaycan universitetlərində mövcud ixtisaslar, tədris forması və illik təhsil haqqı.",
    breadcrumbCategory: "Təhsil",
    breadcrumbLabel: "İkinci ali təhsil",
    formulaTitle: "İkinci Ali Təhsilə Qəbul Qaydaları",
    formulaContent: `İkinci ali təhsilə qəbul, birinci ali təhsil pilləsindən fərqli olaraq, əsasən universitetlərin daxili qaydaları və Təhsil Nazirliyinin normativ sənədləri ilə tənzimlənir. Əksər universitetlərdə tələbələr imtahansız, birbaşa sənəd qəbulu yolu ilə qəbul olunurlar.

Əsas qəbul şərtləri:
• Əvvəlki ali təhsilin mövcud olması və diplomun təqdim edilməsi;
• Qəbul olunmaq istənilən ixtisas üzrə yerin mövcudluğu;
• Əksər hallarda təhsil ödənişli əsaslarla təşkil olunur;
• Bəzi dövlət ali məktəblərində məhdud sayda pulsuz yerlər ola bilər.

Tələb olunan sənədlər:
• Əvvəlki ali təhsil diplomunun və əlavəsinin surəti (əsli də tələb oluna bilər);
• Şəxsiyyət vəsiqəsinin surəti;
• 3×4 ölçülü fotoşəkil (4–6 ədəd);
• Tibbi arayış (bəzi hallarda);
• Universitetə ərizə;
• CV və ya tərcümeyi-hal (bəzən);
• Təhsil haqqının ödənildiyini təsdiq edən sənəd.

Sənəd qəbulu bir çox hallarda portal.edu.az saytı vasitəsilə elektron qaydada həyata keçirilir.`,
    searchPlaceholder: "İxtisas axtar... (məs: İqtisadiyyat, IT, Dizayn)",
    uniFilter: "Universitet",
    allUniversities: "Bütün universitetlər",
    formFilter: "Tədris forması",
    allForms: "Hamısı",
    formFace: "Əyani",
    formDistance: "Qiyabi",
    formBoth: "Əyani/Qiyabi",
    resultsCount: "nəticə",
    noResults: "Seçilmiş filtrlərə uyğun ixtisas tapılmadı.",
    clearFilters: "Filtrləri təmizlə",
    specialty: "İxtisas",
    university: "Universitet",
    form: "Forma",
    fee: "Təhsil haqqı",
    code: "Şifr",
    language: "Tədris dili",
    note: "Qeyd",
    totalUniversities: "universitet",
    totalPrograms: "proqram",
  },
  en: {
    title: "Second Higher Education — Universities and Programs",
    description: "Specialties, study form and annual tuition fees for second (repeated) higher education at Azerbaijan universities.",
    breadcrumbCategory: "Education",
    breadcrumbLabel: "Second Higher Education",
    formulaTitle: "Rules for Second Higher Education Admission",
    formulaContent: `Admission for a second higher education is regulated mainly by the internal rules of each university and the normative documents of the Ministry of Education. In most universities, students are admitted without an exam, directly via document submission.

Main conditions:
• Previous higher education and diploma required;
• Seats available in the desired specialty;
• Education is usually paid;
• Some state universities may offer a limited number of free seats.

Required documents:
• Copy of previous higher education diploma and appendix;
• Copy of ID card;
• 3×4 photos (4–6);
• Medical certificate (in some cases);
• Application form;
• CV (sometimes);
• Proof of tuition payment.

In many cases, document submission is conducted electronically via portal.edu.az.`,
    searchPlaceholder: "Search specialty... (e.g. Economics, IT, Design)",
    uniFilter: "University",
    allUniversities: "All universities",
    formFilter: "Study form",
    allForms: "All",
    formFace: "Full-time",
    formDistance: "Distance",
    formBoth: "Full-time/Distance",
    resultsCount: "results",
    noResults: "No specialty found matching the selected filters.",
    clearFilters: "Clear filters",
    specialty: "Specialty",
    university: "University",
    form: "Form",
    fee: "Tuition",
    code: "Code",
    language: "Language",
    note: "Note",
    totalUniversities: "universities",
    totalPrograms: "programs",
  },
  ru: {
    title: "Второе высшее образование — университеты и специальности",
    description: "Специальности, форма обучения и годовая стоимость для второго (повторного) высшего образования в вузах Азербайджана.",
    breadcrumbCategory: "Образование",
    breadcrumbLabel: "Второе высшее образование",
    formulaTitle: "Правила приёма на второе высшее образование",
    formulaContent: `Приём на второе высшее образование регулируется в основном внутренними правилами университетов и нормативными документами Министерства образования. В большинстве вузов зачисление проходит без экзаменов, по документам.

Основные условия:
• Наличие первого высшего образования и диплома;
• Наличие мест по выбранной специальности;
• Обучение обычно платное;
• В некоторых государственных вузах возможны бесплатные места (ограниченно).

Необходимые документы:
• Копия диплома о первом высшем образовании и приложения;
• Копия удостоверения личности;
• Фотографии 3×4 (4–6 шт.);
• Медицинская справка (в некоторых случаях);
• Заявление в университет;
• CV / автобиография (иногда);
• Документ, подтверждающий оплату обучения.

Во многих случаях документы подаются электронно через portal.edu.az.`,
    searchPlaceholder: "Поиск специальности... (напр. Экономика, IT, Дизайн)",
    uniFilter: "Университет",
    allUniversities: "Все университеты",
    formFilter: "Форма обучения",
    allForms: "Все",
    formFace: "Очно",
    formDistance: "Заочно",
    formBoth: "Очно/Заочно",
    resultsCount: "результатов",
    noResults: "По выбранным фильтрам специальностей не найдено.",
    clearFilters: "Сбросить фильтры",
    specialty: "Специальность",
    university: "Университет",
    form: "Форма",
    fee: "Стоимость",
    code: "Код",
    language: "Язык",
    note: "Примечание",
    totalUniversities: "вузов",
    totalPrograms: "программ",
  },
};

interface FlatProgram extends SecondDegreeProgram {
  universityId: string;
  universityName: string;
  universityShort?: string;
  universityNote?: string;
}

export default function IkinciAliTehsilPage() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [search, setSearch] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [formFilter, setFormFilter] = useState<"" | StudyForm>("");

  const allPrograms: FlatProgram[] = useMemo(() => {
    const flat: FlatProgram[] = [];
    for (const uni of secondDegreeData) {
      for (const p of uni.programs) {
        flat.push({
          ...p,
          universityId: uni.id,
          universityName: uni.name,
          universityShort: uni.shortName,
          universityNote: uni.note,
        });
      }
    }
    return flat;
  }, []);

  const filtered = useMemo(() => {
    let result = allPrograms;

    if (uniFilter) {
      result = result.filter((p) => p.universityId === uniFilter);
    }

    if (formFilter) {
      result = result.filter((p) => {
        if (formFilter === "əyani") return p.form === "əyani" || p.form === "əyani/qiyabi";
        if (formFilter === "qiyabi") return p.form === "qiyabi" || p.form === "əyani/qiyabi";
        return p.form === formFilter;
      });
    }

    if (search.trim()) {
      const q = normalizeText(search.trim());
      result = result.filter(
        (p) =>
          normalizeText(p.specialty).includes(q) ||
          normalizeText(p.universityName).includes(q) ||
          (p.universityShort && normalizeText(p.universityShort).includes(q)) ||
          (p.code && p.code.includes(q))
      );
    }

    return result;
  }, [allPrograms, uniFilter, formFilter, search]);

  const totalUniversities = secondDegreeData.length;
  const totalPrograms = allPrograms.length;
  const hasFilters = search || uniFilter || formFilter;

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=education" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["magistr-kecid-ballari", "university-admission", "gpa"]}
    >
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-800">{totalUniversities}</p>
          <p className="text-xs text-blue-700">{pt.totalUniversities}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{totalPrograms}</p>
          <p className="text-xs text-green-700">{pt.totalPrograms}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={pt.searchPlaceholder}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs text-muted mb-1">{pt.uniFilter}</label>
          <select
            value={uniFilter}
            onChange={(e) => setUniFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{pt.allUniversities} ({totalUniversities})</option>
            {secondDegreeData.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.shortName ? `${uni.shortName} — ${uni.name}` : uni.name} ({uni.programs.length})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">{pt.formFilter}</label>
          <select
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value as StudyForm | "")}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{pt.allForms}</option>
            <option value="əyani">{pt.formFace}</option>
            <option value="qiyabi">{pt.formDistance}</option>
            <option value="əyani/qiyabi">{pt.formBoth}</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filtered.length}</span> {pt.resultsCount}
        </p>
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setUniFilter("");
              setFormFilter("");
            }}
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            ✕ {pt.clearFilters}
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <div
              key={`${p.universityId}-${p.code ?? p.specialty}-${i}`}
              className="bg-white border border-border rounded-xl p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-foreground leading-tight">
                    {p.specialty}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {p.universityShort ? `${p.universityShort} — ${p.universityName}` : p.universityName}
                  </p>
                </div>
                {p.fee !== undefined && (
                  <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                    {formatFee(p.fee)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md border ${
                    p.form === "əyani"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : p.form === "qiyabi"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}
                >
                  {p.form === "əyani" ? pt.formFace : p.form === "qiyabi" ? pt.formDistance : pt.formBoth}
                </span>
                {p.code && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200 font-mono">
                    {p.code}
                  </span>
                )}
                {p.language && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                    {p.language}
                  </span>
                )}
                {p.note && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                    {p.note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted">
          <span className="text-4xl block mb-3">🎓</span>
          <p>{pt.noResults}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
