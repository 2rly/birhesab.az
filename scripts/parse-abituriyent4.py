# DİM "Abituriyent 4" (2026) bukletindən I-IV qrup ixtisaslarını çıxarır.
#
# Cədvəl iki sütunludur. Sahələr sabit x mövqelərindədir (sol sütun / sağ sütun):
#   kod 52/319 · ixtisas adı 82/349 · altqrup 204/470 · "Ə" 229/495
#   yer sayı 251/518 · təhsil haqqı 271/537
# Başlıqlar şriftlə seçilir: universitet 14pt BoldItalic, bölmə 10pt BoldItalic.
#
# PDF-in mətn qatı köhnə kodlaşdırmadadır (ԥ→ə, Õ→ı, ú→ş, ø→İ, ÷→ğ və s.).
#
# İstifadə: python scripts/parse-abituriyent4.py <pdf> <output.json>

import json
import re
import sys

import fitz

CHARMAP = str.maketrans(
    {"ԥ": "ə", "Ω": "ə", "ӂ": "ə", "Ԥ": "Ə", "Ψ": "Ə", "Õ": "ı", "ú": "ş", "ù": "Ş", "ø": "İ", "÷": "ğ"}
)

# Mətnli cədvəl səhifələri (1-dən). 35-58 yalnız şəkildir, mətn qatı yoxdur.
TEXT_PAGES = list(range(18, 35)) + list(range(59, 68))

COLUMNS = (52.0, 319.0)  # sol və sağ sütunun başlanğıc x-i
# Sütun başlanğıcına nisbətən sahə sərhədləri.
# Ölçülmüş mövqelər: ad 30..148 · altqrup 151.5 · "Ə" 176.9 · yer sayı 199.5 · haqq 218.9
F_NAME, F_SUB, F_FORM, F_SEATS = 150.0, 172.0, 190.0, 215.0

CONTENT_TOP, CONTENT_BOTTOM = 55.0, 800.0
ROW_TOLERANCE = 3.0  # eyni cədvəl sətri sayılan şaquli fərq
SUBGROUPS = {"RK", "Rİ", "DT", "TC"}
GROUP_RE = re.compile(r"\b(IV|III|II|I)\s+QRUP")
CODE_RE = re.compile(r"^(\*{0,2})(\d{6})\b\s*(.*)$", re.S)


def fix(text):
    return text.translate(CHARMAP)


def tidy(name):
    """PDF-də bitişik qalmış sözləri ayırır: "vəİnşaat" → "və İnşaat"."""
    name = re.sub(r"([a-zəıöüçşğ])([A-ZƏİÖÜÇŞĞ])", r"\1 \2", name)
    name = re.sub(r"(Gəncə|Bakı|Şəki|Quba|Qazax|Şamaxı)(şəhəri|filialı)", r"\1 \2", name)
    return re.sub(r"\s+", " ", name).strip()


def field_of(x, origin):
    d = x - origin
    if d < F_NAME:
        return "name"
    if d < F_SUB:
        return "subgroup"
    if d < F_FORM:
        return "form"
    if d < F_SEATS:
        return "seats"
    return "fee"


def is_noise(span):
    """Səhifə nömrəsi və 80pt "DİM-2026" su nişanı."""
    return span["font"].startswith("Tahoma") or span["font"].startswith("Arial-Black") or span["size"] >= 20


def page_lines(page):
    """Sətirləri sütun-sütun, yuxarıdan aşağı qaytarır. Hər sətirdə sahələr ayrılıb.

    Bir PDF sətri hər iki sütunu əhatə edə bilər, ona görə spanlar əvvəlcə x-ə görə
    sütunlara bölünür və hər sütun ayrıca məntiqi sətir kimi qaytarılır.
    """
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = [s for s in line["spans"] if s["text"].strip() and not is_noise(s)]
            if not spans:
                continue
            per_col = {0: [], 1: []}
            for s in spans:
                per_col[0 if s["bbox"][0] < COLUMNS[1] - 20 else 1].append(s)
            for col, col_spans in per_col.items():
                if not col_spans:
                    continue
                y0 = min(s["bbox"][1] for s in col_spans)
                if not (CONTENT_TOP <= y0 <= CONTENT_BOTTOM):
                    continue
                origin = COLUMNS[col]
                fields = {"name": "", "subgroup": "", "form": "", "seats": "", "fee": ""}
                col_spans.sort(key=lambda s: s["bbox"][0])
                prev_x1 = None
                for s in col_spans:
                    key = field_of(s["bbox"][0], origin)
                    text = fix(s["text"])
                    # Spanlar söz ortasında bölünə bilər; boşluq yalnız real aralıq varsa əlavə olunur.
                    if prev_x1 is not None and s["bbox"][0] - prev_x1 > 0.9 and fields[key] and not fields[key].endswith(" ") and not text.startswith(" "):
                        fields[key] += " "
                    fields[key] += text
                    prev_x1 = s["bbox"][2]
                head = col_spans[0]
                lines.append(
                    {
                        "col": col,
                        "y": y0,
                        "x": min(s["bbox"][0] for s in col_spans),
                        "size": round(head["size"], 1),
                        "font": head["font"],
                        "fields": {k: v.strip() for k, v in fields.items()},
                        "text": fix("".join(s["text"] for s in col_spans)).strip(),
                    }
                )
    # Eyni cədvəl sətrindəki hissələr müxtəlif şrift ölçüsündə olduğu üçün y-ləri
    # bir qədər fərqlənir. Onları sətir "səbətlərinə" yığmasaq, yer sayı öz adından
    # əvvəl gəlib əvvəlki yazıya qoşulur.
    lines.sort(key=lambda r: (r["col"], r["y"]))
    row = 0
    row_top = None
    prev_col = None
    for ln in lines:
        if ln["col"] != prev_col:
            row_top = None
            prev_col = ln["col"]
        if row_top is None or ln["y"] - row_top > ROW_TOLERANCE:
            row += 1
            row_top = ln["y"]
        ln["row"] = row
    lines.sort(key=lambda r: (r["col"], r["row"], r["x"]))
    return lines


def parse(pdf_path):
    doc = fitz.open(pdf_path)
    out = []
    state = {"group": None, "university": None, "section": None}
    current = None
    last_kind = None

    def flush():
        nonlocal current
        if current:
            name = re.sub(r"\s*\(bax:[^)]*\)\s*", " ", current["specialty"])
            # Çoxsətirli "(bax: qeyd 38-11, səh. 13-14)" qeydlərinin quyruğu
            name = re.sub(r"\s*(?:\d+-\d+,)?\s*səh\.\s*[\d–-]+\)\s*$", "", name)
            name = re.sub(r"\s*\d+-\d+,\s*$", "", name)
            current["specialty"] = re.sub(r"\s+", " ", name).strip()
            current["university"] = tidy(current["university"])
            # "5       -" kimi hallarda ilk tam ədədi götürürük
            if current["seats"]:
                digits = re.search(r"\d+", current["seats"])
                current["seats"] = int(digits.group(0)) if digits else None
            out.append(current)
            current = None

    for pno in TEXT_PAGES:
        for line in page_lines(doc[pno - 1]):
            text, fields = line["text"], line["fields"]

            gm = GROUP_RE.search(text)
            if gm and "QRUP" in text and len(text) < 60:
                flush()
                state["group"] = gm.group(1)
                last_kind = "group"
                continue
            if "BoldItalic" in line["font"] and line["size"] >= 13:
                # Uzun universitet adları iki sətrə bölünür — birləşdiririk.
                if last_kind == "university":
                    state["university"] = (state["university"] + " " + re.sub(r"\s+", " ", text)).strip()
                else:
                    flush()
                    state["university"] = re.sub(r"\s+", " ", text)
                    state["section"] = None
                last_kind = "university"
                continue
            if "BoldItalic" in line["font"] and line["size"] >= 9.5:
                flush()
                state["section"] = re.sub(r"\s+", " ", text)
                last_kind = "section"
                continue

            m = CODE_RE.match(fields["name"])
            if m:
                flush()
                stars, code, rest = m.groups()
                sub = fields["subgroup"].strip()
                current = {
                    "group": state["group"],
                    "university": state["university"],
                    "section": state["section"],
                    "code": code,
                    "specialty": rest.strip(),
                    "subgroup": sub if sub in SUBGROUPS else None,
                    "seats": fields["seats"] or None,
                    "fee": fields["fee"] or None,
                    "special": bool(stars),
                    "page": pno,
                }
                last_kind = "entry"
                continue

            if current:
                last_kind = "cont"
                if re.match(r"^\(?bax:\s*qeyd", fields["name"], re.I):
                    continue
                if fields["name"]:
                    current["specialty"] += " " + fields["name"]
                if fields["seats"] and not current["seats"]:
                    current["seats"] = fields["seats"]
                if fields["fee"] and not current["fee"]:
                    current["fee"] = fields["fee"]
                sub = fields["subgroup"].strip()
                if sub in SUBGROUPS and not current["subgroup"]:
                    current["subgroup"] = sub
    flush()
    return out


def main():
    rows = parse(sys.argv[1])
    with open(sys.argv[2], "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=1)
    print(f"çıxarıldı: {len(rows)} sətir")
    counts = {}
    for r in rows:
        counts[r["group"]] = counts.get(r["group"], 0) + 1
    for g in sorted(counts, key=lambda x: (x is None, str(x))):
        print(f"  {g} qrup: {counts[g]}")
    print("yer sayı olmayan:", sum(1 for r in rows if not r["seats"]))
    print("universitet təyin olunmayan:", sum(1 for r in rows if not r["university"]))


if __name__ == "__main__":
    main()
