/** Rəqəmi minliklərə boşluqla ayıraraq formatlayır: 1234567.8 → "1 234 567.80" */
export function fmtNum(n: number, decimals = 2): string {
  if (!isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + (frac ? `${grouped}.${frac}` : grouped);
}

/** Manat formatı: "1 234.56 ₼" */
export function fmtAZN(n: number, decimals = 2): string {
  return `${fmtNum(n, decimals)} ₼`;
}

/** Faiz formatı: "12.5%" */
export function fmtPct(n: number, decimals = 1): string {
  return `${fmtNum(n, decimals)}%`;
}

/** İstifadəçi daxiletməsini rəqəmə çevirir (vergül, boşluq qəbul edir). Etibarsızdırsa 0. */
export function parseNum(s: string | undefined | null): number {
  if (!s) return 0;
  const v = parseFloat(String(s).replace(/\s/g, "").replace(",", "."));
  return isFinite(v) ? v : 0;
}

/** "YYYY-MM-DD" → Date (yerli vaxt), etibarsızdırsa null */
export function parseISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}

/** Date → "YYYY-MM-DD" */
export function toISODate(d: Date): string {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const AZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

/** Date → "15 oktyabr 2026" */
export function fmtDateAz(d: Date): string {
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Date → "15.10.2026" */
export function fmtDateDots(d: Date): string {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}
