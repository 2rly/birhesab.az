import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { Select } from "@/components/Select";
import { Button } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { secondDegreeData, type SecondDegreeProgram, type StudyForm } from "@/data/ikinci-ali-tehsil";
import { EmptyState, TONE } from "./_edu-scores-parts";

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
}

function formatFee(fee: number | string | undefined): string {
  if (fee === undefined) return "—";
  return `${fee} AZN`;
}

const FORM_LABEL: Record<StudyForm, string> = {
  "əyani": "Əyani",
  qiyabi: "Qiyabi",
  "əyani/qiyabi": "Əyani/Qiyabi",
};
const FORM_COLOR: Record<StudyForm, string> = {
  "əyani": TONE.blue,
  qiyabi: "#d97706",
  "əyani/qiyabi": TONE.purple,
};

const FORMULA_TITLE = "İkinci Ali Təhsilə Qəbul Qaydaları";
const FORMULA_CONTENT = `İkinci ali təhsilə qəbul, birinci ali təhsil pilləsindən fərqli olaraq, əsasən universitetlərin daxili qaydaları və Təhsil Nazirliyinin normativ sənədləri ilə tənzimlənir. Əksər universitetlərdə tələbələr imtahansız, birbaşa sənəd qəbulu yolu ilə qəbul olunurlar.

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

Sənəd qəbulu bir çox hallarda portal.edu.az saytı vasitəsilə elektron qaydada həyata keçirilir.`;

interface FlatProgram extends SecondDegreeProgram {
  universityId: string;
  universityName: string;
  universityShort?: string;
  universityNote?: string;
}

const PAGE = 60;

const ALL_PROGRAMS: FlatProgram[] = secondDegreeData.flatMap((uni) =>
  uni.programs.map((p) => ({
    ...p,
    universityId: uni.id,
    universityName: uni.name,
    universityShort: uni.shortName,
    universityNote: uni.note,
  }))
);

function Tag({ text, color, mono }: { text: string; color: string; mono?: boolean }) {
  return (
    <View style={[styles.tag, { borderColor: color + "55", backgroundColor: color + "18" }]}>
      <Text style={[styles.tagText, { color }, mono && { fontFamily: "monospace" }]}>{text}</Text>
    </View>
  );
}

export function SecondDegreeCalculator() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [formFilter, setFormFilter] = useState<"" | StudyForm>("");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    let result = ALL_PROGRAMS;
    if (uniFilter) result = result.filter((p) => p.universityId === uniFilter);
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
  }, [uniFilter, formFilter, search]);

  useEffect(() => setLimit(PAGE), [uniFilter, formFilter, search]);

  const totalUniversities = secondDegreeData.length;
  const totalPrograms = ALL_PROGRAMS.length;
  const hasFilters = !!(search || uniFilter || formFilter);

  const uniOptions = [
    { value: "", label: `Bütün universitetlər (${totalUniversities})` },
    ...secondDegreeData.map((uni) => ({
      value: uni.id,
      label: `${uni.shortName ? `${uni.shortName} — ${uni.name}` : uni.name} (${uni.programs.length})`,
    })),
  ];
  const formOptions: { value: "" | StudyForm; label: string }[] = [
    { value: "", label: "Hamısı" },
    { value: "əyani", label: "Əyani" },
    { value: "qiyabi", label: "Qiyabi" },
    { value: "əyani/qiyabi", label: "Əyani/Qiyabi" },
  ];

  return (
    <View>
      <View style={styles.summary}>
        <View style={[styles.sumBox, { borderColor: TONE.blue + "55", backgroundColor: TONE.blue + "14" }]}>
          <Text style={[styles.sumValue, { color: TONE.blue }]}>{totalUniversities}</Text>
          <Text style={[styles.sumLabel, { color: TONE.blue }]}>universitet</Text>
        </View>
        <View style={[styles.sumBox, { borderColor: TONE.green + "55", backgroundColor: TONE.green + "14" }]}>
          <Text style={[styles.sumValue, { color: TONE.green }]}>{totalPrograms}</Text>
          <Text style={[styles.sumLabel, { color: TONE.green }]}>proqram</Text>
        </View>
      </View>

      <InputField
        label="Axtarış"
        value={search}
        onChangeText={setSearch}
        placeholder="İxtisas axtar... (məs: İqtisadiyyat, IT, Dizayn)"
      />
      <Select label="Universitet" value={uniFilter} options={uniOptions} onSelect={setUniFilter} searchable />
      <Select label="Tədris forması" value={formFilter} options={formOptions} onSelect={setFormFilter} />

      <View style={styles.countRow}>
        <Text style={[styles.count, { color: colors.n580 }]}>
          <Text style={{ fontWeight: "700", color: colors.n940 }}>{filtered.length}</Text> nəticə
        </Text>
        {hasFilters && (
          <Pressable
            onPress={() => {
              setSearch("");
              setUniFilter("");
              setFormFilter("");
            }}
            hitSlop={8}
          >
            <Text style={[styles.clear, { color: colors.accent }]}>✕ Filtrləri təmizlə</Text>
          </Pressable>
        )}
      </View>

      {filtered.length > 0 ? (
        <View style={{ gap: 8 }}>
          {filtered.slice(0, limit).map((p, i) => (
            <View
              key={`${p.universityId}-${p.code ?? p.specialty}-${i}`}
              style={[styles.item, { borderColor: colors.n280, backgroundColor: colors.n145 }]}
            >
              <View style={styles.itemTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.specialty, { color: colors.n940 }]}>{p.specialty}</Text>
                  <Text style={[styles.uni, { color: colors.n580 }]}>
                    {p.universityShort ? `${p.universityShort} — ${p.universityName}` : p.universityName}
                  </Text>
                </View>
                {p.fee !== undefined && (
                  <View style={[styles.fee, { borderColor: TONE.green + "55", backgroundColor: TONE.green + "18" }]}>
                    <Text style={[styles.feeText, { color: TONE.green }]}>{formatFee(p.fee)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.tags}>
                <Tag text={FORM_LABEL[p.form]} color={FORM_COLOR[p.form]} />
                {p.code && <Tag text={p.code} color={TONE.gray} mono />}
                {p.language && <Tag text={p.language} color={TONE.gray} />}
                {p.note && <Tag text={p.note} color={TONE.yellow} />}
              </View>
            </View>
          ))}
          {filtered.length > limit && (
            <Button
              title={`Daha çox göstər (${filtered.length - limit})`}
              variant="secondary"
              onPress={() => setLimit((l) => l + PAGE)}
            />
          )}
        </View>
      ) : (
        <EmptyState icon="🎓" text="Seçilmiş filtrlərə uyğun ixtisas tapılmadı." />
      )}

      <FormulaSection title={FORMULA_TITLE} content={FORMULA_CONTENT} />
      <RelatedCalculators ids={["magistr-kecid-ballari", "university-admission", "gpa"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", gap: 10, marginBottom: 16 },
  sumBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  sumValue: { fontSize: 24, fontWeight: "800" },
  sumLabel: { fontSize: 12 },
  countRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  count: { fontSize: 14 },
  clear: { fontSize: 12, fontWeight: "600" },
  item: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  itemTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  specialty: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  uni: { fontSize: 12, marginTop: 2 },
  fee: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  feeText: { fontSize: 12, fontWeight: "700" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontSize: 11 },
});
