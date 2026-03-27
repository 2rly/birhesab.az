"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

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

const GROUP_INFO: Record<Lang, { value: DisabilityGroup; label: string; range: string }[]> = {
  az: [
    { value: 1, label: "1-ci qrup", range: "81–100% funksiya pozuntusu" },
    { value: 2, label: "2-ci qrup", range: "61–80% funksiya pozuntusu" },
    { value: 3, label: "3-cü qrup", range: "31–60% funksiya pozuntusu" },
  ],
  en: [
    { value: 1, label: "Group 1", range: "81–100% functional impairment" },
    { value: 2, label: "Group 2", range: "61–80% functional impairment" },
    { value: 3, label: "Group 3", range: "31–60% functional impairment" },
  ],
  ru: [
    { value: 1, label: "1-я группа", range: "81–100% функциональное нарушение" },
    { value: 2, label: "2-я группа", range: "61–80% функциональное нарушение" },
    { value: 3, label: "3-я группа", range: "31–60% функциональное нарушение" },
  ],
};

const DISEASES_TRANSLATIONS: Record<Lang, { title: string; items: string[] }[]> = {
  az: [
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
  ],
  en: [
    {
      title: "Respiratory system diseases",
      items: [
        "Severe bronchial asthma (requiring continuous hormonal treatment)",
        "Chronic obstructive pulmonary disease (COPD) — severe",
        "Pulmonary fibrosis",
        "Post-lung transplant condition",
        "Cystic fibrosis",
      ],
    },
    {
      title: "Cardiovascular system diseases",
      items: [
        "Chronic heart failure (functional class III–IV)",
        "Severe complications after myocardial infarction",
        "Heart valve replacement",
        "Severe arrhythmia treated with pacemaker",
        "Aortic aneurysm",
        "Dilated cardiomyopathy",
      ],
    },
    {
      title: "Nervous system diseases",
      items: [
        "Epilepsy (persistent, treatment-resistant seizures)",
        "Multiple sclerosis",
        "Parkinson's disease",
        "Cerebral palsy (children and adults)",
        "Spinal cord injuries (paraplegia, tetraplegia)",
        "Peripheral nerve injuries (severe forms)",
        "Myasthenia gravis (severe form)",
        "Brain tumors and post-operative conditions",
      ],
    },
    {
      title: "Musculoskeletal system diseases",
      items: [
        "Limb amputation",
        "Severe arthrosis (grade III–IV)",
        "Rheumatoid arthritis (severe form)",
        "Spinal deformities (scoliosis grade III–IV)",
        "Osteomyelitis (chronic, treatment-resistant)",
        "Ankylosing spondylitis (Bekhterev's disease)",
      ],
    },
    {
      title: "Eye diseases",
      items: [
        "Total blindness (both eyes)",
        "Visual acuity 0.04 and below (with correction)",
        "Glaucoma (terminal stage)",
        "Degenerative retinal diseases",
        "Optic nerve atrophy",
      ],
    },
    {
      title: "Ear diseases",
      items: [
        "Total deafness (both ears)",
        "Severe hearing loss (grade III–IV)",
        "Auditory nerve damage",
      ],
    },
    {
      title: "Mental disorders",
      items: [
        "Schizophrenia (chronic, recurrent forms)",
        "Severe depressive disorder (treatment-resistant)",
        "Bipolar affective disorder (severe form)",
        "Severe intellectual disability",
        "Dementia (Alzheimer's disease, etc.)",
        "Autism spectrum disorder (severe form)",
      ],
    },
    {
      title: "Oncological diseases",
      items: [
        "Malignant tumors (during treatment or with metastasis)",
        "Leukemia and lymphomas",
        "Brain tumors",
        "Severe functional disorders after surgery",
      ],
    },
    {
      title: "Endocrine system diseases",
      items: [
        "Diabetes mellitus (with severe complications — nephropathy, retinopathy, neuropathy)",
        "Pituitary insufficiency",
        "Addison's disease (severe form)",
        "Hyperthyroidism/hypothyroidism (severe, uncompensated)",
      ],
    },
    {
      title: "Kidney and urinary system diseases",
      items: [
        "Chronic renal failure (requiring dialysis)",
        "After kidney transplant",
        "Nephrotic syndrome (severe form)",
      ],
    },
    {
      title: "Blood diseases",
      items: [
        "Hemophilia",
        "Aplastic anemia",
        "Thalassemia (severe form)",
        "Sickle cell anemia",
      ],
    },
    {
      title: "Digestive system diseases",
      items: [
        "Liver cirrhosis (decompensation stage)",
        "After liver transplant",
        "Crohn's disease / Ulcerative colitis (severe form)",
        "Short bowel syndrome",
      ],
    },
    {
      title: "Skin diseases",
      items: [
        "Severe psoriasis (more than 30% of skin surface)",
        "Systemic lupus erythematosus",
        "Scleroderma (severe form)",
        "Severe burn consequences (with functional impairment)",
      ],
    },
    {
      title: "Congenital anomalies",
      items: [
        "Down syndrome",
        "Congenital heart defects (severe forms)",
        "Spina bifida",
        "Hydrocephalus",
        "Congenital limb anomalies",
      ],
    },
  ],
  ru: [
    {
      title: "Заболевания дыхательной системы",
      items: [
        "Тяжёлая бронхиальная астма (требующая постоянной гормональной терапии)",
        "Хроническая обструктивная болезнь лёгких (ХОБЛ) — тяжёлая степень",
        "Фиброз лёгких",
        "Состояние после трансплантации лёгких",
        "Муковисцидоз",
      ],
    },
    {
      title: "Заболевания сердечно-сосудистой системы",
      items: [
        "Хроническая сердечная недостаточность (функциональный класс III–IV)",
        "Тяжёлые осложнения после инфаркта миокарда",
        "Протезирование сердечного клапана",
        "Лечение тяжёлой аритмии кардиостимулятором",
        "Аневризма аорты",
        "Дилатационная кардиомиопатия",
      ],
    },
    {
      title: "Заболевания нервной системы",
      items: [
        "Эпилепсия (стойкие, устойчивые к лечению приступы)",
        "Рассеянный склероз",
        "Болезнь Паркинсона",
        "Церебральный паралич (у детей и взрослых)",
        "Повреждения спинного мозга (параплегия, тетраплегия)",
        "Повреждения периферических нервов (тяжёлые формы)",
        "Миастения (тяжёлая форма)",
        "Опухоли головного мозга и послеоперационные состояния",
      ],
    },
    {
      title: "Заболевания костно-мышечной системы",
      items: [
        "Ампутация конечностей",
        "Тяжёлый артроз (III–IV степени)",
        "Ревматоидный артрит (тяжёлая форма)",
        "Деформации позвоночника (сколиоз III–IV степени)",
        "Остеомиелит (хронический, устойчивый к лечению)",
        "Анкилозирующий спондилит (болезнь Бехтерева)",
      ],
    },
    {
      title: "Заболевания органа зрения",
      items: [
        "Полная слепота (оба глаза)",
        "Потеря зрения 0.04 и ниже (с коррекцией)",
        "Глаукома (терминальная стадия)",
        "Дегенеративные заболевания сетчатки",
        "Атрофия зрительного нерва",
      ],
    },
    {
      title: "Заболевания органа слуха",
      items: [
        "Полная глухота (оба уха)",
        "Тяжёлая потеря слуха (III–IV степени)",
        "Повреждение слухового нерва",
      ],
    },
    {
      title: "Психические заболевания",
      items: [
        "Шизофрения (хронические, рецидивирующие формы)",
        "Тяжёлое депрессивное расстройство (устойчивое к лечению)",
        "Биполярное аффективное расстройство (тяжёлая форма)",
        "Тяжёлая умственная отсталость",
        "Деменция (болезнь Альцгеймера и др.)",
        "Расстройство аутистического спектра (тяжёлая форма)",
      ],
    },
    {
      title: "Онкологические заболевания",
      items: [
        "Злокачественные опухоли (во время лечения или при метастазах)",
        "Лейкемия и лимфомы",
        "Опухоли головного мозга",
        "Тяжёлые функциональные нарушения после операции",
      ],
    },
    {
      title: "Заболевания эндокринной системы",
      items: [
        "Сахарный диабет (с тяжёлыми осложнениями — нефропатия, ретинопатия, нейропатия)",
        "Гипофизарная недостаточность",
        "Болезнь Аддисона (тяжёлая форма)",
        "Гипертиреоз/гипотиреоз (тяжёлый, некомпенсированный)",
      ],
    },
    {
      title: "Заболевания почек и мочевыводящей системы",
      items: [
        "Хроническая почечная недостаточность (требующая диализа)",
        "После трансплантации почки",
        "Нефротический синдром (тяжёлая форма)",
      ],
    },
    {
      title: "Заболевания крови",
      items: [
        "Гемофилия",
        "Апластическая анемия",
        "Талассемия (тяжёлая форма)",
        "Серповидноклеточная анемия",
      ],
    },
    {
      title: "Заболевания пищеварительной системы",
      items: [
        "Цирроз печени (стадия декомпенсации)",
        "После трансплантации печени",
        "Болезнь Крона / Язвенный колит (тяжёлая форма)",
        "Синдром короткой кишки",
      ],
    },
    {
      title: "Заболевания кожи",
      items: [
        "Тяжёлый псориаз (более 30% поверхности кожи)",
        "Системная красная волчанка",
        "Склеродермия (тяжёлая форма)",
        "Тяжёлые последствия ожогов (с функциональными нарушениями)",
      ],
    },
    {
      title: "Врождённые аномалии",
      items: [
        "Синдром Дауна",
        "Врождённые пороки сердца (тяжёлые формы)",
        "Расщепление позвоночника (Spina bifida)",
        "Гидроцефалия",
        "Врождённые аномалии конечностей",
      ],
    },
  ],
};

const pageTranslations = {
  az: {
    title: "Əlillik pensiyası və müavinət kalkulyatoru",
    description: "2025-ci il fevralın 1-dən qüvvəyə minən qanunvericiliyə əsasən əlillik pensiyası, sosial müavinət və prezident təqaüdlərini hesablayın.",
    breadcrumbCategory: "Hüquq və Dövlət",
    breadcrumbLabel: "Əlillik pensiyası və müavinət",
    formulaTitle: "Əlillik pensiyası necə hesablanır?",
    formulaContent: `Əsas göstəricilər (2025, 1 fevraldan):

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

Yekun məbləğ = Əsas məbləğ + Prezident təqaüdü + Qulluq təqaüdü`,
    disabilityGroup: "Əlillik qrupu",
    hasPensionQuestion: "Əmək pensiyası hüququnuz varmı?",
    yesPension: "Bəli, pensiya hüququm var",
    yesPensionDesc: `Minimum ${MINIMUM_PENSION} AZN əmək pensiyası`,
    noPension: "Xeyr, pensiya hüququm yoxdur",
    noPensionDesc: "Sosial müavinət:",
    laborPensionMin: "Əmək pensiyası (minimum)",
    socialAllowance: "Sosial müavinət",
    isVisionDisability: "Görmə əlilliyidir",
    visionDisabilityDesc: "Görmə əlilliyi olduqda prezident təqaüdü 350 AZN təşkil edir (ümumi 250 AZN əvəzinə)",
    presidentialStipend: "Prezident təqaüdü",
    presidentialStipendVision: " (görmə)",
    caregiverStipend: "Qulluq edən şəxs təqaüdü",
    totalMonthly: "Yekun aylıq məbləğ",
    perMonth: "AZN / ay",
    calculationDetails: "Hesablama detalları",
    groupComparison: "Qruplar üzrə müqayisə",
    base: "Əsas:",
    total: "Cəmi:",
    note: "Qeyd:",
    noteText: "Əlillik qrupu Tibbi-Sosial Ekspert Komissiyası (TSEK) tərəfindən təyin olunur. Pensiya və müavinətlər DSMF tərəfindən aylıq ödənilir. Göstəricilər 01.02.2025 tarixindən qüvvədədir.",
    diseasesTitle: "Hansı xəstəliklərə əlillik düşür?",
    diseasesSubtitle: "Aşağıdakı siyahı ümumi məlumat xarakterlidir. Əlillik qrupunun təyinatı Tibbi-Sosial Ekspert Komissiyası (TSEK) tərəfindən aparılır.",
    exempt: "—",
  },
  en: {
    title: "Disability pension & allowance calculator",
    description: "Calculate disability pension, social allowance, and presidential stipends based on legislation effective from February 1, 2025.",
    breadcrumbCategory: "Legal & Government",
    breadcrumbLabel: "Disability pension & allowance",
    formulaTitle: "How is disability pension calculated?",
    formulaContent: `Key indicators (2025, from February 1):

Persons with pension eligibility:
• Minimum labor pension (all groups): 320 AZN

Persons without pension eligibility (social allowance):
• Group 1: 300 AZN
• Group 2: 250 AZN
• Group 3: 180 AZN

Presidential stipends:
• Group 1 (general): +250 AZN
• Group 1 (visual disability): +350 AZN
• Caregiver (Group 1 only): +120 AZN

Total amount = Base amount + Presidential stipend + Caregiver stipend`,
    disabilityGroup: "Disability group",
    hasPensionQuestion: "Do you have labor pension eligibility?",
    yesPension: "Yes, I have pension eligibility",
    yesPensionDesc: `Minimum ${MINIMUM_PENSION} AZN labor pension`,
    noPension: "No, I don't have pension eligibility",
    noPensionDesc: "Social allowance:",
    laborPensionMin: "Labor pension (minimum)",
    socialAllowance: "Social allowance",
    isVisionDisability: "Visual disability",
    visionDisabilityDesc: "For visual disability, presidential stipend is 350 AZN (instead of general 250 AZN)",
    presidentialStipend: "Presidential stipend",
    presidentialStipendVision: " (vision)",
    caregiverStipend: "Caregiver stipend",
    totalMonthly: "Total monthly amount",
    perMonth: "AZN / month",
    calculationDetails: "Calculation details",
    groupComparison: "Comparison by groups",
    base: "Base:",
    total: "Total:",
    note: "Note:",
    noteText: "The disability group is assigned by the Medical-Social Expert Commission (MSEC). Pensions and allowances are paid monthly by SSPF. Rates are effective from 01.02.2025.",
    diseasesTitle: "Which diseases qualify for disability?",
    diseasesSubtitle: "The list below is for general information purposes. Disability group assignment is carried out by the Medical-Social Expert Commission (MSEC).",
    exempt: "—",
  },
  ru: {
    title: "Калькулятор пенсии и пособия по инвалидности",
    description: "Рассчитайте пенсию по инвалидности, социальное пособие и президентские стипендии на основании законодательства, действующего с 1 февраля 2025 года.",
    breadcrumbCategory: "Право и государство",
    breadcrumbLabel: "Пенсия и пособие по инвалидности",
    formulaTitle: "Как рассчитывается пенсия по инвалидности?",
    formulaContent: `Основные показатели (2025, с 1 февраля):

Лица с правом на пенсию:
• Минимальная трудовая пенсия (все группы): 320 AZN

Лица без права на пенсию (социальное пособие):
• 1-я группа: 300 AZN
• 2-я группа: 250 AZN
• 3-я группа: 180 AZN

Президентские стипендии:
• 1-я группа (общая): +250 AZN
• 1-я группа (по зрению): +350 AZN
• Для ухаживающего лица (только 1-я группа): +120 AZN

Итоговая сумма = Базовая сумма + Президентская стипендия + Стипендия по уходу`,
    disabilityGroup: "Группа инвалидности",
    hasPensionQuestion: "Имеете ли вы право на трудовую пенсию?",
    yesPension: "Да, у меня есть право на пенсию",
    yesPensionDesc: `Минимальная трудовая пенсия ${MINIMUM_PENSION} AZN`,
    noPension: "Нет, у меня нет права на пенсию",
    noPensionDesc: "Социальное пособие:",
    laborPensionMin: "Трудовая пенсия (минимум)",
    socialAllowance: "Социальное пособие",
    isVisionDisability: "Инвалидность по зрению",
    visionDisabilityDesc: "При инвалидности по зрению президентская стипендия составляет 350 AZN (вместо общих 250 AZN)",
    presidentialStipend: "Президентская стипендия",
    presidentialStipendVision: " (зрение)",
    caregiverStipend: "Стипендия ухаживающего лица",
    totalMonthly: "Итоговая ежемесячная сумма",
    perMonth: "AZN / мес",
    calculationDetails: "Детали расчёта",
    groupComparison: "Сравнение по группам",
    base: "Базовая:",
    total: "Итого:",
    note: "Примечание:",
    noteText: "Группа инвалидности назначается Медико-социальной экспертной комиссией (МСЭК). Пенсии и пособия выплачиваются ежемесячно ГФСЗ. Показатели действуют с 01.02.2025.",
    diseasesTitle: "При каких заболеваниях назначается инвалидность?",
    diseasesSubtitle: "Приведённый ниже список носит информационный характер. Назначение группы инвалидности осуществляется Медико-социальной экспертной комиссией (МСЭК).",
    exempt: "—",
  },
};

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function DisabilityBenefitCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];
  const groupInfo = GROUP_INFO[lang];
  const diseases = DISEASES_TRANSLATIONS[lang];

  const [group, setGroup] = useState<DisabilityGroup>(1);
  const [hasPension, setHasPension] = useState(true);
  const [isVisionDisability, setIsVisionDisability] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const result = useMemo(() => {
    const basePension = hasPension ? MINIMUM_PENSION : ALLOWANCE[group];
    const baseLabel = hasPension ? pt.laborPensionMin : pt.socialAllowance;

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
  }, [group, hasPension, isVisionDisability, pt]);

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=legal" },
        { label: pt.breadcrumbLabel },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["salary", "unemployment-benefit", "maternity-leave", "sick-leave"]}
    >
      {/* Disability group selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          {pt.disabilityGroup}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {groupInfo.map((g) => (
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

      {/* Pension eligibility */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          {pt.hasPensionQuestion}
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
              {pt.yesPension}
            </p>
            <p className="text-xs text-muted mt-1">
              {pt.yesPensionDesc}
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
              {pt.noPension}
            </p>
            <p className="text-xs text-muted mt-1">
              {pt.noPensionDesc} {ALLOWANCE[group]} AZN
            </p>
          </button>
        </div>
      </div>

      {/* Vision disability (Group 1 only) */}
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
                {pt.isVisionDisability}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {pt.visionDisabilityDesc}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Result */}
      <div className="space-y-4 mt-8">
        {/* Base amount cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted mb-1">{result.baseLabel}</p>
            <p className="text-2xl font-bold text-foreground">
              {fmt(result.basePension)}
            </p>
            <p className="text-xs text-muted mt-1">{pt.perMonth}</p>
          </div>

          {result.presidentialStipend > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">
                {pt.presidentialStipend}
                {isVisionDisability && group === 1 ? pt.presidentialStipendVision : ""}
              </p>
              <p className="text-2xl font-bold text-amber-700">
                +{fmt(result.presidentialStipend)}
              </p>
              <p className="text-xs text-amber-600 mt-1">{pt.perMonth}</p>
            </div>
          )}

          {result.caregiverStipend > 0 && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-sm text-green-600 mb-1">
                {pt.caregiverStipend}
              </p>
              <p className="text-2xl font-bold text-green-700">
                +{fmt(result.caregiverStipend)}
              </p>
              <p className="text-xs text-green-600 mt-1">{pt.perMonth}</p>
            </div>
          )}
        </div>

        {/* Total amount */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
          <p className="text-sm text-blue-200 mb-1">{pt.totalMonthly}</p>
          <p className="text-4xl font-bold">{fmt(result.total)}</p>
          <p className="text-sm text-blue-200 mt-1">{pt.perMonth}</p>
        </div>

        {/* Detail table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">
              {pt.calculationDetails}
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
              <span className="text-sm text-muted">{pt.presidentialStipend}</span>
              <span className="text-sm font-medium text-foreground">
                {result.presidentialStipend > 0
                  ? `+${fmt(result.presidentialStipend)} AZN`
                  : pt.exempt}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-muted">
                {pt.caregiverStipend}
              </span>
              <span className="text-sm font-medium text-foreground">
                {result.caregiverStipend > 0
                  ? `+${fmt(result.caregiverStipend)} AZN`
                  : pt.exempt}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 bg-primary-light">
              <span className="text-sm font-semibold text-foreground">
                {pt.totalMonthly}
              </span>
              <span className="text-base font-bold text-primary">
                {fmt(result.total)} AZN
              </span>
            </div>
          </div>
        </div>

        {/* Group comparison */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">
              {pt.groupComparison}
            </h3>
          </div>
          <div className="divide-y divide-border">
            {groupInfo.map((g) => {
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
                      {pt.base}{" "}
                      <span className="font-medium text-foreground">
                        {fmt(base)}
                      </span>
                    </span>
                    <span className="text-muted">
                      {pt.total}{" "}
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

        {/* Note */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">{pt.note}</span> {pt.noteText}
          </p>
        </div>
      </div>

      {/* Disease list — Accordion */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-foreground mb-4">
          {pt.diseasesTitle}
        </h3>
        <p className="text-sm text-muted mb-4">
          {pt.diseasesSubtitle}
        </p>
        <div className="space-y-2">
          {diseases.map((category, idx) => (
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
