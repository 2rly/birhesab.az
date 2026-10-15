import { useState, useMemo } from "react";
import { View } from "react-native";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import { Checkbox } from "@/components/Controls";
import {
  SectionHeading,
  Paragraph,
  BulletList,
  InfoBox,
  ResultHero,
  Collapsible,
  FormulaSection,
  RelatedCalculators,
} from "@/components/Content";
import { OptionCards, AmountCard, CardRow, LabeledText } from "./_leave-parts";

type DisabilityGroup = 1 | 2 | 3;

const MINIMUM_PENSION = 320; // AZN, 2025

const ALLOWANCE: Record<DisabilityGroup, number> = { 1: 300, 2: 250, 3: 180 };
const PRESIDENTIAL_STIPEND: Record<DisabilityGroup, number> = { 1: 250, 2: 0, 3: 0 };
const VISION_STIPEND = 350;
const CAREGIVER_STIPEND = 120;

const GROUP_INFO: { value: DisabilityGroup; label: string; range: string }[] = [
  { value: 1, label: "1-ci qrup", range: "81–100% funksiya pozuntusu" },
  { value: 2, label: "2-ci qrup", range: "61–80% funksiya pozuntusu" },
  { value: 3, label: "3-cü qrup", range: "31–60% funksiya pozuntusu" },
];

const DISEASES: { title: string; items: string[] }[] = [
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
    items: ["Tam karlıq (hər iki qulaqda)", "Ağır eşitmə itkisi (III–IV dərəcə)", "Eşitmə sinirinin zədələnməsi"],
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
    items: ["Hemofiliya", "Aplastik anemiya", "Talassemiya (ağır forma)", "Oraqlvarı hüceyrə anemiyası"],
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

const FORMULA_TITLE = "Əlillik pensiyası necə hesablanır?";
const FORMULA_CONTENT = `Əsas göstəricilər (2025, 1 fevraldan):

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

Yekun məbləğ = Əsas məbləğ + Prezident təqaüdü + Qulluq təqaüdü`;

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function DisabilityCalculator() {
  const [group, setGroup] = useState<DisabilityGroup>(1);
  const [hasPension, setHasPension] = useState(true);
  const [isVisionDisability, setIsVisionDisability] = useState(false);

  const result = useMemo(() => {
    const basePension = hasPension ? MINIMUM_PENSION : ALLOWANCE[group];
    const baseLabel = hasPension ? "Əmək pensiyası (minimum)" : "Sosial müavinət";
    let presidentialStipend = 0;
    if (group === 1) {
      presidentialStipend = isVisionDisability ? VISION_STIPEND : PRESIDENTIAL_STIPEND[1];
    }
    const caregiverStipend = group === 1 ? CAREGIVER_STIPEND : 0;
    const total = basePension + presidentialStipend + caregiverStipend;
    return { basePension, baseLabel, presidentialStipend, caregiverStipend, total };
  }, [group, hasPension, isVisionDisability]);

  return (
    <View>
      <OptionCards
        label="Əlillik qrupu"
        columns={3}
        options={GROUP_INFO.map((g) => ({ value: g.value, label: g.label, desc: g.range }))}
        selected={group}
        onSelect={(v) => {
          setGroup(v);
          if (v !== 1) setIsVisionDisability(false);
        }}
      />

      <OptionCards
        label="Əmək pensiyası hüququnuz varmı?"
        columns={2}
        options={[
          {
            value: "yes",
            icon: "✓",
            label: "Bəli, pensiya hüququm var",
            desc: `Minimum ${MINIMUM_PENSION} AZN əmək pensiyası`,
          },
          {
            value: "no",
            icon: "✗",
            label: "Xeyr, pensiya hüququm yoxdur",
            desc: `Sosial müavinət: ${ALLOWANCE[group]} AZN`,
          },
        ]}
        selected={hasPension ? "yes" : "no"}
        onSelect={(v) => setHasPension(v === "yes")}
      />

      {group === 1 && (
        <Checkbox
          label="Görmə əlilliyidir"
          description="Görmə əlilliyi olduqda prezident təqaüdü 350 AZN təşkil edir (ümumi 250 AZN əvəzinə)"
          checked={isVisionDisability}
          onChange={setIsVisionDisability}
        />
      )}

      <CardRow>
        <AmountCard label={result.baseLabel} value={fmt(result.basePension)} sub="AZN / ay" />
        {result.presidentialStipend > 0 && (
          <AmountCard
            tone="amber"
            label={`Prezident təqaüdü${isVisionDisability && group === 1 ? " (görmə)" : ""}`}
            value={`+${fmt(result.presidentialStipend)}`}
            sub="AZN / ay"
          />
        )}
        {result.caregiverStipend > 0 && (
          <AmountCard
            tone="green"
            label="Qulluq edən şəxs təqaüdü"
            value={`+${fmt(result.caregiverStipend)}`}
            sub="AZN / ay"
          />
        )}
      </CardRow>

      <ResultHero label="Yekun aylıq məbləğ" value={fmt(result.total)} sub="AZN / ay" />

      <ResultSection title="Hesablama detalları">
        <ResultRow label={result.baseLabel} value={`${fmt(result.basePension)} AZN`} />
        <ResultRow
          label="Prezident təqaüdü"
          value={result.presidentialStipend > 0 ? `+${fmt(result.presidentialStipend)} AZN` : "—"}
        />
        <ResultRow
          label="Qulluq edən şəxs təqaüdü"
          value={result.caregiverStipend > 0 ? `+${fmt(result.caregiverStipend)} AZN` : "—"}
        />
        <ResultRow label="Yekun aylıq məbləğ" value={`${fmt(result.total)} AZN`} highlight />
      </ResultSection>

      <ResultSection title="Qruplar üzrə müqayisə">
        {GROUP_INFO.map((g) => {
          const base = hasPension ? MINIMUM_PENSION : ALLOWANCE[g.value];
          const pres = g.value === 1 ? (isVisionDisability ? VISION_STIPEND : PRESIDENTIAL_STIPEND[1]) : 0;
          const care = g.value === 1 ? CAREGIVER_STIPEND : 0;
          const tot = base + pres + care;
          return (
            <ResultRow
              key={g.value}
              label={g.label}
              value={`Əsas: ${fmt(base)}   Cəmi: ${fmt(tot)}`}
              highlight={g.value === group}
            />
          );
        })}
      </ResultSection>

      <InfoBox variant="info">
        <LabeledText label="Qeyd:">
          Əlillik qrupu Tibbi-Sosial Ekspert Komissiyası (TSEK) tərəfindən təyin olunur. Pensiya və müavinətlər DSMF
          tərəfindən aylıq ödənilir. Göstəricilər 01.02.2025 tarixindən qüvvədədir.
        </LabeledText>
      </InfoBox>

      <SectionHeading>Hansı xəstəliklərə əlillik düşür?</SectionHeading>
      <Paragraph>
        Aşağıdakı siyahı ümumi məlumat xarakterlidir. Əlillik qrupunun təyinatı Tibbi-Sosial Ekspert Komissiyası (TSEK)
        tərəfindən aparılır.
      </Paragraph>
      {DISEASES.map((cat, idx) => (
        <Collapsible key={idx} title={cat.title}>
          <BulletList items={cat.items} />
        </Collapsible>
      ))}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["salary", "unemployment-benefit", "maternity-leave", "sick-leave"]} />
    </View>
  );
}
