// 2026/2027 tədris ili üçün qəbul planı — tip və birləşdirmə köməkçisi.
// Mənbə: DİM "Abituriyent 4" (2026) bukleti, I-IV ixtisas qrupları.
// Bu fayl scripts/build-plan-2026.mjs tərəfindən yaradılır — əl ilə redaktə etməyin.

export interface PlanEntry {
  /** DİM ixtisas kodu (6 rəqəm) */
  code: string;
  university: string;
  specialty: string;
  /** Tədris dili: AZ · RU · AZ/RU · EN · TR · DE */
  language: string;
  /** Bu il ayrılmış plan yerlərinin sayı */
  seats: number;
  /** I qrup üçün RK/Rİ, III qrup üçün DT/TC */
  subgroup?: string;
  /** İllik təhsil haqqı (manat). "YDS" — yalnız dövlət sifarişi, "DH" — dövlət hesabına. */
  fee?: string;
  /** Xüsusi qabiliyyət imtahanı tələb edir (buklet-də ** ilə işarələnib) */
  aptitudeRequired?: boolean;
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("az")
    .replace(/tədris\s+/g, "")
    .replace(/[""''`]/g, "")
    .replace(/[.,]/g, "")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function universityKey(value: string): string {
  return normalize(value)
    .replace(/\s*\((gəncə|bakı)[^)]*\)/g, "")
    .replace(/"/g, "")
    .trim();
}

/**
 * DİM bəzi ixtisasların adını 2026-da dəyişib, bal siyahısı isə köhnə adı saxlayır.
 * Dəqiq uyğunluq tapılmayanda bu "yumşaq" açar işə düşür.
 */
function looseSpecialty(value: string): string {
  return normalize(value)
    .replace(/\(rəqəmsal bacarıqlar\)\s*/g, "") // İnformatika (rəqəmsal bacarıqlar) müəllimliyi
    .replace(/\s*\(azərbaycan dilində\)/g, "") // planda var, bal siyahısında yox
    .replace(/əmlak kadastrı/g, "əmlakın kadastrı")
    .replace(/ədəbiyyat(?= |$)/g, "ədəbiyyatı üzrə")
    .replace(/\s+/g, " ")
    .trim();
}

function planKey(university: string, specialty: string): string {
  return universityKey(university) + "||" + normalize(specialty);
}

function loosePlanKey(university: string, specialty: string): string {
  return universityKey(university) + "||" + looseSpecialty(specialty);
}

/**
 * Bal siyahısındakı hər yazıya plan məlumatını (kod, yer sayı, tədris dili) qoşur.
 * Planda tapılmayan ixtisas — bu il yer ayrılmayan ixtisasdır — olduğu kimi qalır.
 * Eyni ad altında birdən çox plan sətri olanda (əyani/qiyabi) bal yazısındaki
 * `code` üstünlük təşkil edir.
 */
export function attachPlan<T extends { university: string; specialty: string; code?: string; language?: string }>(
  entries: T[],
  plan: PlanEntry[],
): (T & { code?: string; seats?: number; language?: string })[] {
  const index = new Map<string, PlanEntry>();
  const loose = new Map<string, PlanEntry>();
  const byCode = new Map<string, PlanEntry>();
  for (const item of plan) {
    const key = planKey(item.university, item.specialty);
    if (!index.has(key)) index.set(key, item);
    const alt = loosePlanKey(item.university, item.specialty);
    if (!loose.has(alt)) loose.set(alt, item);
    byCode.set(item.code, item);
  }
  return entries.map((entry) => {
    const match =
      (entry.code ? byCode.get(entry.code) : undefined) ??
      index.get(planKey(entry.university, entry.specialty)) ??
      loose.get(loosePlanKey(entry.university, entry.specialty));
    if (!match) return entry;
    // Bal siyahısı bölməni özü göstərirsə (AZ · RU · AZ/RU), o üstünlük təşkil edir.
    return { ...entry, code: match.code, seats: match.seats, language: entry.language ?? match.language };
  });
}
