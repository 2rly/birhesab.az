import { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { Checkbox, Button } from "@/components/Controls";
import { ResultSection } from "@/components/ResultRow";
import { FormulaSection, RelatedCalculators, Card, BulletList, InfoBox } from "@/components/Content";
import { fmtNum } from "@/lib/format";
import { useTheme } from "@/constants/theme";
import { ToneRow, TonePanel, SmallText, TONES } from "./_loan-parts";

const formatMoney = (n: number) => fmtNum(n, 2);

type TtkType = "social" | "standard";

const termOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

const pt = {
  formulaTitle: "TTK necə hesablanır?",
  formulaContent: `Təhsil Tələbə Krediti (TTK) — Prezidentin 2021-ci il 17 iyun Fərmanına əsasən:

Kredit növləri:
• Sosial TTK: illik 2% faiz
• Standart TTK: illik 6% faiz

Sığorta haqqı = Kredit məbləği × Faiz dərəcəsi × Müddət (il)
Ümumi borc = Kredit məbləği + Sığorta haqqı

Güzəştlər (ÜOMG-yə görə):
Sosial: ≥71 bal → sığorta haqqı tutulmur; bütün semestrlər ≥91 → kreditin 50%-i bağışlanır
Standart: bütün semestrlər ≥91 → kreditin 25%-i bağışlanır

Yekun = Ümumi borc − Güzəşt
Aylıq ödəniş = Yekun ÷ (Müddət × 12)

Təhsil, güzəşt və möhlət müddətində kreditə faiz hesablanmır və ödəniş tələb olunmur.
Girov və zəmanət tələb olunmur.
Mənbə: e-ttkf.edu.az`,
  ttkType: "TTK növü",
  social: "Sosial",
  standard: "Standart",
  term: "Müddət (il)",
  loanAmount: "Kredit məbləği (sığortasız)",
  loanAmountRequired: "Kredit məbləği daxil edilməlidir.",
  gpa71: "Bütün semestrlər üzrə 71 bal və üzəri",
  gpa91: "Bütün semestrlər üzrə 91 bal və üzəri",
  insuranceFee: "Sığorta haqqı",
  totalDebt: "Ümumi borc",
  discount: "Güzəşt",
  finalAmount: "Yekun",
  monthlyPayment: "Aylıq ödəniş",
  source: "Mənbə: TTKF (e-ttkf.edu.az)",
  eligibilityTitle: "TTK almaq hüququmu yoxla",
  socialEligTitle: "Sosial TTK şərtləri",
  socialEligDesc: "Aşağıdakı şərtlərdən hər hansı BİRİ olduqda sosial TTK almaq hüququ yaranır:",
  standardEligTitle: "Standart TTK şərtləri",
  standardEligDesc: "Aşağıdakı şərtlərin HƏR ÜÇÜ eyni vaxtda olmalıdır:",
  socialCond1: "Ünvanlı dövlət sosial yardımı alan ailənin üzvüyəm",
  socialCond2: "3-cü dərəcə əlilliyim var",
  socialCond3: "Hər iki valideynim (tək valideynim olduqda, həmin şəxs) aşağıdakılardan birinə aiddir:",
  parentCond1: "1-ci və ya 2-ci dərəcə əlilliyi var",
  parentCond2: "İşsiz kimi qeydiyyatdadır",
  parentCond3: "Yaşa görə əmək pensiyası alır",
  parentCond4: "Yaşa görə sosial müavinət alır",
  standardCond1: "ÜOMG-m 71 bal və yuxarıdır",
  standardCond2: "Təhsil haqqı xərcinin 20%-ni özüm ödəyirəm",
  standardCond3: "Sosial TTK almaq hüququm yoxdur",
  resultSocial: "Sosial TTK almaq hüququnuz var!",
  resultStandard: "Standart TTK almaq hüququnuz var!",
  resultBoth: "Həm Sosial, həm Standart TTK almaq hüququnuz var! Sosial TTK daha sərfəlidir (2% faiz).",
  resultNone: "Hazırda TTK almaq şərtlərinə uyğun gəlmirsiniz.",
  resultSocialNote: "Sosial TTK: illik 2% faiz, girov tələb olunmur.",
  resultStandardNote: "Standart TTK: illik 6% faiz, girov tələb olunmur.",
  discountsTitle: "Tətbiq edilən güzəştlər",
  socialDiscount1: "Sosial TTK: ÜOMG ≥71 → həmin semestr üçün faiz hesablanmır",
  socialDiscount2: "Sosial TTK: Bütün semestrlər ÜOMG ≥91 → kreditin 50%-i bağışlanır",
  standardDiscount1: "Standart TTK: ÜOMG ≥91 → həmin semestr üçün faiz hesablanmır",
  standardDiscount2: "Standart TTK: Bütün semestrlər ÜOMG ≥91 → kreditin 25%-i bağışlanır",
  tuitionRange: "Təhsil haqqı: 400 – 10 000 AZN (təhsil səviyyəsi, müəssisə və ixtisasa görə dəyişir)",
  minScoreTitle: "1-ci kurs, 1-ci semestr üçün minimum bal həddi",
  minScoreBachelor: "Bakalavriat: 300 – 700 bal",
  minScoreMaster: "Magistratura: 50 – 100 bal",
  minScoreVocational: "Subbakalavriat: 110 – 300 bal",
  defermentTitle: "Möhlət verilən hallar",
  deferment1: "Yuxarı təhsil səviyyəsində əyani təhsil",
  deferment2: "Həqiqi hərbi xidmət",
  deferment3: "Məhkumluq",
  deferment4: "Hamiləlik, doğum və uşağa qulluq məzuniyyəti (3 yaşadək)",
  deferment5: "Sağlamlıq imkanları məhdud uşaqlara və I dərəcə əlillərə qulluq",
  defermentNote: "Möhlətin 1 tələbə üçün orta müddəti 2-4 ildir.",
  insuredTitle: "Sığortalanan hallar",
  insured1: "Ölüm",
  insured2: "Əmək qabiliyyətinin tam və ya qismən itirilməsi (əlillik)",
  insuredNote: "Sığorta haqqı kreditin məbləğinə əlavə olunaraq müvəkkil bank tərəfindən ödənilir.",
};

export function EducationLoanCalculator() {
  const { colors } = useTheme();
  const [ttkType, setTtkType] = useState<TtkType>("social");
  const [term, setTerm] = useState("10");
  const [loanAmount, setLoanAmount] = useState("");
  const [gpa71, setGpa71] = useState(false);
  const [gpa91, setGpa91] = useState(false);

  const [showEligibility, setShowEligibility] = useState(false);
  const [socialCond1, setSocialCond1] = useState(false);
  const [socialCond2, setSocialCond2] = useState(false);
  const [parentCond1, setParentCond1] = useState(false);
  const [parentCond2, setParentCond2] = useState(false);
  const [parentCond3, setParentCond3] = useState(false);
  const [parentCond4, setParentCond4] = useState(false);
  const [stdCond1, setStdCond1] = useState(false);
  const [stdCond2, setStdCond2] = useState(false);
  const [stdCond3, setStdCond3] = useState(false);

  function handleTtkType(type: TtkType) {
    setTtkType(type);
    if (type === "standard") setGpa71(false);
  }

  const annualRate = ttkType === "social" ? 0.02 : 0.06;
  const years = parseInt(term) || 10;

  const result = useMemo(() => {
    const loan = parseFloat(loanAmount);
    if (!loan || loan <= 0) return null;

    let insuranceFee = loan * annualRate * years;
    if (ttkType === "social" && gpa71) {
      insuranceFee = 0;
    }

    const totalDebt = loan + insuranceFee;

    let discountAmount = 0;
    if (gpa91) {
      discountAmount = ttkType === "social" ? loan * 0.5 : loan * 0.25;
    }

    const finalAmount = totalDebt - discountAmount;
    const totalMonths = years * 12;
    const monthlyPayment = totalMonths > 0 ? finalAmount / totalMonths : 0;

    return { insuranceFee, totalDebt, discountAmount, finalAmount, monthlyPayment };
  }, [loanAmount, ttkType, annualRate, years, gpa71, gpa91]);

  const parentCondMet = parentCond1 || parentCond2 || parentCond3 || parentCond4;
  const socialEligible = socialCond1 || socialCond2 || parentCondMet;
  const standardEligible = stdCond1 && stdCond2 && stdCond3;

  const showError = loanAmount !== "" && (parseFloat(loanAmount) <= 0 || isNaN(parseFloat(loanAmount)));
  const anyEligChecked =
    socialCond1 || socialCond2 || parentCond1 || parentCond2 || parentCond3 || parentCond4 || stdCond1 || stdCond2 || stdCond3;

  const money = (v: number | undefined) => `${v !== undefined ? formatMoney(v) : "0.00"} AZN`;

  return (
    <View>
      <Select
        label={pt.ttkType}
        value={ttkType}
        options={[
          { value: "social", label: pt.social },
          { value: "standard", label: pt.standard },
        ]}
        onSelect={handleTtkType}
      />
      <Select
        label={pt.term}
        value={term}
        options={termOptions.map((y) => ({ value: String(y), label: String(y) }))}
        onSelect={setTerm}
        searchable={false}
      />

      <InputField
        label={pt.loanAmount}
        value={loanAmount}
        onChangeText={setLoanAmount}
        placeholder="0"
        keyboardType="decimal-pad"
      />
      {showError && (
        <Text style={{ color: TONES.red, fontSize: 12, marginTop: -12, marginBottom: 12 }}>{pt.loanAmountRequired}</Text>
      )}

      {ttkType === "social" && <Checkbox label={pt.gpa71} checked={gpa71} onChange={setGpa71} />}
      <Checkbox label={pt.gpa91} checked={gpa91} onChange={setGpa91} />

      <ResultSection>
        <ToneRow label={pt.insuranceFee} value={money(result?.insuranceFee)} tone="accent" />
        <ToneRow label={pt.totalDebt} value={money(result?.totalDebt)} tone="accent" />
        <ToneRow label={pt.discount} value={money(result?.discountAmount)} tone="accent" />
        <ToneRow label={pt.finalAmount} value={money(result?.finalAmount)} tone="accent" bold />
        <ToneRow label={pt.monthlyPayment} value={money(result?.monthlyPayment)} tone="accent" bold shaded />
      </ResultSection>

      {/* Uyğunluq yoxlaması */}
      <View style={{ marginTop: 16 }}>
        <Button
          title={`✅ ${pt.eligibilityTitle}`}
          variant="secondary"
          icon={showEligibility ? "expand-less" : "expand-more"}
          onPress={() => setShowEligibility(!showEligibility)}
        />
      </View>

      {showEligibility && (
        <View>
          <TonePanel tone="green" title={pt.socialEligTitle}>
            <SmallText>{pt.socialEligDesc}</SmallText>
            <Checkbox label={pt.socialCond1} checked={socialCond1} onChange={setSocialCond1} />
            <Checkbox label={pt.socialCond2} checked={socialCond2} onChange={setSocialCond2} />
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.n940, marginTop: 6 }}>{pt.socialCond3}</Text>
            <View style={{ marginLeft: 20 }}>
              <Checkbox label={pt.parentCond1} checked={parentCond1} onChange={setParentCond1} />
              <Checkbox label={pt.parentCond2} checked={parentCond2} onChange={setParentCond2} />
              <Checkbox label={pt.parentCond3} checked={parentCond3} onChange={setParentCond3} />
              <Checkbox label={pt.parentCond4} checked={parentCond4} onChange={setParentCond4} />
            </View>
          </TonePanel>

          <TonePanel tone="blue" title={pt.standardEligTitle}>
            <SmallText>{pt.standardEligDesc}</SmallText>
            <Checkbox label={pt.standardCond1} checked={stdCond1} onChange={setStdCond1} />
            <Checkbox label={pt.standardCond2} checked={stdCond2} onChange={setStdCond2} />
            <Checkbox label={pt.standardCond3} checked={stdCond3} onChange={setStdCond3} />
          </TonePanel>

          {anyEligChecked &&
            (socialEligible && standardEligible ? (
              <InfoBox variant="success" title={pt.resultBoth} />
            ) : socialEligible ? (
              <InfoBox variant="success" title={pt.resultSocial}>
                {pt.resultSocialNote}
              </InfoBox>
            ) : standardEligible ? (
              <InfoBox variant="info" title={pt.resultStandard}>
                {pt.resultStandardNote}
              </InfoBox>
            ) : (
              <InfoBox variant="danger" title={pt.resultNone} />
            ))}
        </View>
      )}

      {/* Əlavə məlumatlar */}
      <Card title={pt.discountsTitle}>
        <TonePanel tone="green">
          <SmallText color={colors.n760}>{pt.socialDiscount1}</SmallText>
        </TonePanel>
        <TonePanel tone="green">
          <SmallText color={colors.n760}>{pt.socialDiscount2}</SmallText>
        </TonePanel>
        <TonePanel tone="blue">
          <SmallText color={colors.n760}>{pt.standardDiscount1}</SmallText>
        </TonePanel>
        <TonePanel tone="blue">
          <SmallText color={colors.n760}>{pt.standardDiscount2}</SmallText>
        </TonePanel>
      </Card>

      <Card title={pt.minScoreTitle}>
        <BulletList items={[pt.minScoreBachelor, pt.minScoreMaster, pt.minScoreVocational]} />
        <SmallText>{pt.tuitionRange}</SmallText>
      </Card>

      <Card title={pt.defermentTitle}>
        <BulletList items={[pt.deferment1, pt.deferment2, pt.deferment3, pt.deferment4, pt.deferment5]} />
        <SmallText italic>{pt.defermentNote}</SmallText>
      </Card>

      <Card title={pt.insuredTitle}>
        <BulletList items={[pt.insured1, pt.insured2]} />
        <SmallText italic>{pt.insuredNote}</SmallText>
      </Card>

      <InfoBox variant="info">{pt.source}</InfoBox>

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["loan", "gpa", "university-admission"]} />
    </View>
  );
}
