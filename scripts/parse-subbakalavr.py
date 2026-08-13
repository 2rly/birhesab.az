# DİM "Subbakalavrların ixtisas uyğunluğu cədvəli" (2026) PDF-ini çıxarır.
#
# Cədvəl iki xanalıdır (şaquli xətlər x=42/356/552):
#   sol  — subbakalavrın bitirdiyi ixtisaslar (orta ixtisas təhsili * və peşə təhsili **/***)
#   sağ  — həmin şəxsin seçə biləcəyi bakalavriat ixtisasları
# Sətir sərhədləri cədvəlin üfüqi xətlərindən götürülür; bir sətir səhifədən
# səhifəyə keçə bilər (o halda yeni səhifədə sağ xana boş olur).
#
# İstifadə: python scripts/parse-subbakalavr.py <pdf> <output.json>

import json
import re
import sys

import fitz

CHARMAP = str.maketrans(
    {"ˎ": "ə", "Ö": "ı", "û": "ş", "ù": "İ", "ø": "ğ", "ˍ": "Ə", "ӂ": "ə", "Õ": "ı", "÷": "ğ", "ú": "ş"}
)

TABLE_PAGES = range(5, 39)  # 1-dən
COL_LEFT, COL_MID, COL_RIGHT = 42.0, 356.0, 552.0

# Səhifə bəzəkləri: "DİM-2026" su nişanı hissə-hissə düşür, altbilik və səhifə nömrəsi
NOISE = re.compile(
    r"^(DİM[-\s]*\d*|\d{1,3}|Tələbə\s+qəbulu\s*[–-]\s*\d{4}|Orta ixtisas təhsili.*|Peşə təhsili pilləsinin.*|Bakalavriat ixtisas.*|\(Nazirlər Kabinetinin.*|tarixli.*qərarına uyğun\)?)$",
    re.I,
)

SOURCE_RE = re.compile(r"^((?:[A-ZİƏÖÜÇŞĞ]{1,3}\s+)?\d{4,7})(\*{1,4})\s+(.+)$")
TARGET_RE = re.compile(r"^(\d{7})\s+(.+)$")
GROUP_RE = re.compile(r"^(\d{4})\s+(.+?(?:qrupu|ixtisasları|ixtisaslar|təhsili səviyyəsi).*)$")
# Hər səhifədə təkrarlanan sütun başlıqlarının qırıqları
HEADER_FRAGMENT = re.compile(r"(nömrəli|qərarına uyğun|şifri və adı|proqramlarının|İXTİSAS UYĞUNLUĞU|CƏDVƏLİ|subbakalavr də|müəssisələrinin|səviyyəsinə|qəbulu ilə bağlı|tibb təhsilinə)", re.I)


def fix(text):
    return text.translate(CHARMAP)


def grid(page):
    """Cədvəlin üfüqi xətlərini (sətir sərhədləri) qaytarır."""
    horiz = set()
    for drawing in page.get_drawings():
        for item in drawing["items"]:
            if item[0] == "l":
                a, b = item[1], item[2]
                if abs(a.y - b.y) < 1 and abs(a.x - b.x) > 50:
                    horiz.add(round(a.y))
            elif item[0] == "re":
                r = item[1]
                if r.height < 2 and r.width > 50:
                    horiz.add(round(r.y0))
    return sorted(horiz)


def cell_lines(page, x0, x1, y0, y1):
    raw = page.get_text("text", clip=fitz.Rect(x0, y0, x1, y1))
    out = []
    for line in fix(raw).split("\n"):
        line = re.sub(r"\s+", " ", line).strip()
        if len(line) < 3 or NOISE.match(line):
            continue
        out.append(line)
    return out


def level_of(stars):
    """* — orta ixtisas təhsili; **, ***, **** — peşə təhsili (yüksək peşə səviyyəsi)."""
    return "orta-ixtisas" if stars == "*" else "pese-tehsili"


def parse(pdf_path):
    doc = fitz.open(pdf_path)
    rows = []
    current_group = None

    for pno in TABLE_PAGES:
        page = doc[pno - 1]
        bounds = grid(page)
        for i in range(len(bounds) - 1):
            y0, y1 = bounds[i], bounds[i + 1]
            if y1 - y0 < 8:
                continue
            left = cell_lines(page, COL_LEFT, COL_MID, y0, y1)
            right = cell_lines(page, COL_MID, COL_RIGHT, y0, y1)
            if not left and not right:
                continue

            sources, dangling = [], []
            for line in left:
                g = GROUP_RE.match(line)
                if g:
                    current_group = {"code": g.group(1), "name": g.group(2).strip()}
                    continue
                m = SOURCE_RE.match(line)
                if m:
                    sources.append(
                        {"code": re.sub(r"\s+", " ", m.group(1)).strip(), "level": level_of(m.group(2)), "name": m.group(3).strip()}
                    )
                elif sources:
                    # sətirdən aşqan ad hissəsi
                    sources[-1]["name"] += " " + line
                elif not HEADER_FRAGMENT.search(line):
                    dangling.append(line)

            targets, t_dangling = [], []
            for line in right:
                g = GROUP_RE.match(line)
                if g and not TARGET_RE.match(line):
                    current_group = {"code": g.group(1), "name": g.group(2).strip()}
                    continue
                m = TARGET_RE.match(line)
                if m:
                    targets.append({"code": m.group(1), "name": m.group(2).strip()})
                elif targets:
                    targets[-1]["name"] += " " + line
                elif not HEADER_FRAGMENT.search(line):
                    t_dangling.append(line)

            # Sağ xana boşdursa, bu bənd əvvəlki sətrin davamıdır.
            if rows and not targets and (sources or dangling):
                rows[-1]["sources"].extend(sources)
                if dangling:
                    rows[-1]["notes"].extend(dangling)
                continue

            if not sources and not targets:
                continue  # təkrarlanan başlıq bəndi
            rows.append({
                "group": current_group,
                "sources": sources,
                "targets": targets,
                "notes": dangling + t_dangling,
                "page": pno,
            })

    for row in rows:
        for item in row["sources"]:
            item["name"] = re.sub(r"\s+", " ", item["name"]).strip()
        for item in row["targets"]:
            item["name"] = re.sub(r"\s+", " ", item["name"]).strip()
    return rows


def main():
    rows = parse(sys.argv[1])
    with open(sys.argv[2], "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=1)
    sources = sum(len(r["sources"]) for r in rows)
    targets = sum(len(r["targets"]) for r in rows)
    print(f"sətir (uyğunluq bəndi): {len(rows)}")
    print(f"  subbakalavr ixtisası : {sources}")
    print(f"  bakalavriat ixtisası : {targets}")
    print(f"  hədəfsiz sətir       : {sum(1 for r in rows if not r['targets'])}")
    print(f"  mənbəsiz sətir       : {sum(1 for r in rows if not r['sources'])}")
    leftovers = [n for r in rows for n in r["notes"]]
    print(f"  tanınmayan sətir     : {len(leftovers)}")
    for note in leftovers[:10]:
        print("      ", note[:80])


if __name__ == "__main__":
    main()
