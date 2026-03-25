"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

type DisabilityGroup = 1 | 2 | 3;

const MINIMUM_PENSION = 320; // AZN, 2025

const ALLOWANCE: Record<DisabilityGroup, number> = {
  1: 300,
  2: 250,
  3: 180,
};

const PRESIDENTIAL_STIPEND: Record<DisabilityGroup, number> = {
  1: 250,
  2: 0,
  3: 0,
};

const VISION_STIPEND = 350;
const CAREGIVER_STIPEND = 120;

const GROUP_INFO: {
  value: DisabilityGroup;
  label: string;
  range: string;
}[] = [
  { value: 1, label: "1-ci qrup", range: "81–100% funksiya pozuntusu" },
  { value: 2, label: "2-ci qrup", range: "61–80% funksiya pozuntusu" },
  { value: 3, label: "3-cü qrup", range: "31–60% funksiya pozuntusu" },
];

const DISEASES = [
  {
    title: "Tənəffüs sistemi xəstəlikləri",
    items: [
      "Ağır bronxial astma (daimi hormonal müalicə tələb edən)",
      "Xroniki obstruktiv ağciyər xəstəliyi (XOAX) — ağır dərəcə",
      "Ağciyər fibrozu",
      "Ağciyər transplantasiyasından sonrakı vəziyyət",
      "Kistoz fibroz (mukovissidoz)",
    ],
  },
  {
    title: "Qan dövranı sistemi xəstəlikləri",
    items: [
      "Xroniki ürək çatışmazlığı (III–IV funksional sinif)",
      "Miokard infarktından sonrakı ağır fəsadlar",
      "Ürək qapaqcığı protezləşdirilməsi",
      "Ağır aritmiyanın kardiostimulyatorla müalicəsi",
      "Aorta anevrizması",
      "Dilatasion kardiyomiopatiya",
    ],
  },
  {
    title: "Sinir sistemi xəstəlikləri",
    items: [
      "Epilepsiya (davamlı, müalicəyə davamlı tutmalar)",
      "Multipl skleroz",
      "Parkinson xəstəliyi",
      "Serebral iflic (uşaq və böyüklərdə)",
      "Onurğa beyni zədələnmələri (paraplegiya, tetraplegiya)",
      "Periferik sinir zədələnmələri (ağır formalar)",
      "Miasteniya (ağır forma)",
      "Beyin şişləri və əməliyyat sonrası vəziyyətlər",
    ],
  },
  {
    title: "Sümük-əzələ sistemi xəstəlikləri",
    items: [
      "Ətrafların amputasiyası",
      "Ağır artroz (III–IV dərəcə)",
      "Revmatoid artrit (ağır forma)",
      "Onurğa deformasiyaları (skolioz III–IV dərəcə)",
      "Osteomielit (xroniki, müalicəyə davamlı)",
      "Ankilozlaşan spondilit (Bexterev xəstəliyi)",
    ],
  },
  {
    title: "Görmə orqanı xəstəlikləri",
    items: [
      "Tam korluq (hər iki gözdə)",
      "Görmə itkisi 0.04 və aşağı (korreksiya ilə)",
      "Qlaukoma (son mərhələ)",
      "Torlu qişanın degenerativ xəstəlikləri",
      "Görmə sinirinin atrofiyası",
    ],
  },
  {
    title: "Eşitmə orqanı xəstəlikləri",
    items: [
      "Tam karlıq (hər iki qulaqda)",
      "Ağır eşitmə itkisi (III–IV dərəcə)",
      "Eşitmə sinirinin zədələnməsi",
    ],
  },
  {
    title: "Psixi xəstəliklər",
    items: [
      "Şizofreniya (xroniki, residivləşən formalar)",
      "Ağır depressiv pozuntu (müalicəyə davamlı)",
      "Bipolar affektiv pozuntu (ağır forma)",
      "Ağır əqli gerilik",
      "Demensiya (Alzheimer xəstəliyi və s.)",
      "Autizm spektr pozuntusu (ağır forma)",
    ],
  },
  {
    title: "Onkoloji xəstəliklər",
    items: [
      "Bədxassəli şişlər (müalicə davam edərkən və ya metastaz olduqda)",
      "Leykemiya və limfomalar",
      "Beyin şişləri",
      "Əməliyyat sonrası ağır funksional pozuntular",
    ],
  },
  {
    title: "Endokrin sistem xəstəlikləri",
    items: [
      "Şəkərli diabet (ağır fəsadlarla — nefropatiya, retinopatiya, neyropatiya)",
      "Hipofiz çatışmazlığı",
      "Addison xəstəliyi (ağır forma)",
      "Hipertiroidizm/hipotiroidizm (ağır, kompensasiya olunmayan)",
    ],
  },
  {
    title: "Böyrək və sidik sistemi xəstəlikləri",
    items: [
      "Xroniki böyrək çatışmazlığı (dializ tələb edən)",
      "Böyrək transplantasiyasından sonra",
      "Nefrotik sindrom (ağır forma)",
    ],
  },
  {
    title: "Qan xəstəlikləri",
    items: [
      "Hemofiliya",
      "Aplastik anemiya",
      "Talassemiya (ağır forma)",
      "Oraqlvarı hüceyrə anemiyası",
    ],
  },
  {
    title: "Həzm sistemi xəstəlikləri",
    items: [
      "Qaraciyər sirrozu (dekompensasiya mərhələsi)",
      "Qaraciyər transplantasiyasından sonra",
      "Crohn xəstəliyi / Xoralı kolit (ağır forma)",
      "Qısa bağırsaq sindromu",
    ],
  },
  {
    title: "Dəri xəstəlikləri",
    items: [
      "Ağır psoriaz (30%-dən çox dəri səthi)",
      "Sistemli qırmızı qurdeşənəyi",
      "Skleroderma (ağır forma)",
      "Ağır yanıq nəticələri (funksional pozuntularla)",
    ],
  },
  {
    title: "Anadangəlmə anomaliyalar",
    items: [
      "Daun sindromu",
      "Anadangəlmə ürək qüsurları (ağır formalar)",
      "Spina bifida",
      "Hidrosefal",
      "Anadangəlmə ətraf anomaliyaları",
    ],
  },
];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function DisabilityBenefitCalculator() {
  const [group, setGroup] = useState<DisabilityGroup>(1);
  const [hasPension, setHasPension] = useState(true);
  const [isVisionDisability, setIsVisionDisability] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const result = useMemo(() => {
    const basePension = hasPension ? MINIMUM_PENSION : ALLOWANCE[group];
    const baseLabel = hasPension ? "Əmək pensiyası (minimum)" : "Sosial müavinət";

    let presidentialStipend = 0;
    if (group === 1) {
      presidentialStipend = isVisionDisability ? VISION_STIPEND : PRESIDENTIAL_STIPEND[1];
    }

    const caregiverStipend = group === 1 ? CAREGIVER_STIPEND : 0;
    const total = basePension + presidentialStipend + caregiverStipend;

    return {
      basePension,
      baseLabel,
      presidentialStipend,
      caregiverStipend,
      total,
    };
  }, [group, hasPension, isVisionDisability]);

  return (
    <CalculatorLayout
      title="Əlillik pensiyası və müavinət kalkulyatoru"
      description="2025-ci il fevralın 1-dən qüvvəyə minən qanunvericiliyə əsasən əlillik pensiyası, sosial müavinət və prezident təqaüdlərini hesablayın."
      breadcrumbs={[
        { label: "Hüquq və Dövlət", href: "/?category=legal" },
        { label: "Əlillik pensiyası və müavinət" },
      ]}
      formulaTitle="Əlillik pensiyası necə hesablanır?"
      formulaContent={`Əsas göstəricilər (2025, 1 fevraldan):

Pensiya hüququ olan şəxslər:
• Minimum əmək pensiyası (bütün qruplar): 320 AZN

Pensiya hüququ olmayan şəxslər (sosial müavinət):
• 1-ci qrup: 300 AZN
• 2-ci qrup: 250 AZN
• 3-cü qrup: 180 AZN

Prezident təqaüdləri:
• 1-ci qrup (ümumi): +250 AZN
• 1-ci qrup (görmə əlilliyi): +350 AZN
• Qulluq edən şəxs üçün (yalnız 1-ci qrup): +120 AZN

Yekun məbləğ = Əsas məbləğ + Prezident təqaüdü + Qulluq təqaüdü`}
      relatedIds={["salary", "unemployment-benefit", "maternity-leave", "sick-leave"]}
    >
      {/* Əlillik qrupu seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Əlillik qrupu
        </label>
        <div className="grid grid-cols-3 gap-3">
          {GROUP_INFO.map((g) => (
            <button
              key={g.value}
              onClick={() => {
                setGroup(g.value);
                if (g.value !== 1) setIsVisionDisability(false);
              }}
              className={`p-4 rounded-xl border text-center transition-all ${
                group === g.value
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
            >
              <p className="text-2xl font-bold text-foreground">{g.label}</p>
              <p className="text-xs text-muted mt-1">{g.range}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pensiya hüququ */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Əmək pensiyası hüququnuz varmı?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setHasPension(true)}
            className={`p-4 rounded-xl border text-left transition-all ${
              hasPension
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">&#10003;</span>
            <p className="text-sm font-medium text-foreground">
              Bəli, pensiya hüququm var
            </p>
            <p className="text-xs text-muted mt-1">
              Minimum {MINIMUM_PENSION} AZN əmək pensiyası
            </p>
          </button>
          <button
            onClick={() => setHasPension(false)}
            className={`p-4 rounded-xl border text-left transition-all ${
              !hasPension
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <span className="text-2xl block mb-1">&#10007;</span>
            <p className="text-sm font-medium text-foreground">
              Xeyr, pensiya hüququm yoxdur
            </p>
            <p className="text-xs text-muted mt-1">
              Sosial müavinət: {ALLOWANCE[group]} AZN
            </p>
          </button>
        </div>
      </div>

      {/* Görmə əlilliyi (yalnız 1-ci qrup) */}
      {group === 1 && (
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-all">
            <input
              type="checkbox"
              checked={isVisionDisability}
              onChange={(e) => setIsVisionDisability(e.target.checked)}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Görmə əlilliyidir
              </p>
              <p className="text-xs text-muted mt-0.5">
                Görmə əlilliyi olduqda prezident təqaüdü 350 AZN təşkil edir
                (ümumi 250 AZN əvəzinə)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Nəticə */}
      <div className="space-y-4 mt-8">
        {/* Əsas məbləğ kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted mb-1">{result.baseLabel}</p>
            <p className="text-2xl font-bold text-foreground">
              {fmt(result.basePension)}
            </p>
            <p className="text-xs text-muted mt-1">AZN / ay</p>
          </div>

          {result.presidentialStipend > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">
                Prezident təqaüdü
                {isVisionDisability && group === 1 ? " (görmə)" : ""}
              </p>
              <p className="text-2xl font-bold text-amber-700">
                +{fmt(result.presidentialStipend)}
              </p>
              <p className="text-xs text-amber-600 mt-1">AZN / ay</p>
            </div>
          )}

          {result.caregiverStipend > 0 && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">
                Qulluq edən şəxs təqaüdü
              </p>
              <p className="text-2xl font-bold text-green-700">
                +{fmt(result.caregiverStipend)}
              </p>
              <p className="text-xs text-green-600 mt-1">AZN / ay</p>
            </div>
          )}
        </div>

        {/* Yekun məbləğ */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
          <p className="text-sm text-blue-200 mb-1">Yekun aylıq məbləğ</p>
          <p className="text-4xl font-bold">{fmt(result.total)}</p>
          <p className="text-sm text-blue-200 mt-1">AZN / ay</p>
        </div>

        {/* Detallı cədvəl */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Hesablama detalları
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-muted">{result.baseLabel}</span>
              <span className="text-sm font-medium text-foreground">
                {fmt(result.basePension)} AZN
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-muted">Prezident təqaüdü</span>
              <span className="text-sm font-medium text-foreground">
                {result.presidentialStipend > 0
                  ? `+${fmt(result.presidentialStipend)} AZN`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-muted">
                Qulluq edən şəxs təqaüdü
              </span>
              <span className="text-sm font-medium text-foreground">
                {result.caregiverStipend > 0
                  ? `+${fmt(result.caregiverStipend)} AZN`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 bg-primary-light">
              <span className="text-sm font-semibold text-foreground">
                Yekun aylıq məbləğ
              </span>
              <span className="text-base font-bold text-primary">
                {fmt(result.total)} AZN
              </span>
            </div>
          </div>
        </div>

        {/* Bütün qrupların müqayisəsi */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Qruplar üzrə müqayisə
            </h3>
          </div>
          <div className="divide-y divide-border">
            {GROUP_INFO.map((g) => {
              const base = hasPension ? MINIMUM_PENSION : ALLOWANCE[g.value];
              const pres =
                g.value === 1
                  ? isVisionDisability
                    ? VISION_STIPEND
                    : PRESIDENTIAL_STIPEND[1]
                  : 0;
              const care = g.value === 1 ? CAREGIVER_STIPEND : 0;
              const tot = base + pres + care;
              return (
                <div
                  key={g.value}
                  className={`flex items-center justify-between px-5 py-3 ${
                    g.value === group ? "bg-primary-light" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">
                    {g.label}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted">
                      Əsas:{" "}
                      <span className="font-medium text-foreground">
                        {fmt(base)}
                      </span>
                    </span>
                    <span className="text-muted">
                      Cəmi:{" "}
                      <span className="font-medium text-primary">
                        {fmt(tot)}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Qeyd */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Qeyd:</span> Əlillik qrupu
            Tibbi-Sosial Ekspert Komissiyası (TSEK) tərəfindən təyin olunur.
            Pensiya və müavinətlər DSMF tərəfindən aylıq ödənilir.
            Göstəricilər 01.02.2025 tarixindən qüvvədədir.
          </p>
        </div>
      </div>

      {/* Xəstəlik siyahısı — Accordion */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Hansı xəstəliklərə əlillik düşür?
        </h3>
        <p className="text-sm text-muted mb-4">
          Aşağıdakı siyahı ümumi məlumat xarakterlidir. Əlillik qrupunun
          təyinatı Tibbi-Sosial Ekspert Komissiyası (TSEK) tərəfindən
          aparılır.
        </p>
        <div className="space-y-2">
          {DISEASES.map((category, idx) => (
            <div
              key={idx}
              className="border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenAccordion(openAccordion === idx ? null : idx)
                }
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-medium text-foreground">
                  {category.title}
                </span>
                <svg
                  className={`w-5 h-5 text-muted transition-transform ${
                    openAccordion === idx ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openAccordion === idx && (
                <div className="px-5 pb-4 bg-gray-50">
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted flex items-start gap-2"
                      >
                        <span className="text-primary mt-0.5">&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </CalculatorLayout>
  );
}
