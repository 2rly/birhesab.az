"""BirHesab tətbiq ikonlarını saytın loqosundan (src/app/icon.svg) yaradır:
zümrüd (#10b981) fon üzərində ağ, qalın "B".

İstifadə:  python scripts/generate-icons.py   (Pillow tələb olunur)
Nəticə: assets/*.png (Expo) və store/play-icon-512.png (Google Play).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
STORE = ROOT / "store"
BRAND = (16, 185, 129, 255)  # #10b981 — saytın icon.svg fonu
WHITE = (255, 255, 255, 255)
FONT = "C:/Windows/Fonts/arialbd.ttf"  # saytın loqosu: Arial bold


def draw_b(img: Image.Image, cap_ratio: float, color=WHITE) -> None:
    """'B' hərfini kətanın optik mərkəzinə çəkir; cap_ratio = hərfin hündürlüyü / kətan."""
    w, h = img.size
    d = ImageDraw.Draw(img)
    # Font ölçüsünü hərfin real (mürəkkəb) hündürlüyünə görə seç
    size = int(h * cap_ratio / 0.716)  # Arial Bold-da 'B' cap-height ≈ 0.716 em
    font = ImageFont.truetype(FONT, size)
    l, t, r, b = d.textbbox((0, 0), "B", font=font)
    x = (w - (r - l)) / 2 - l
    y = (h - (b - t)) / 2 - t
    d.text((x, y), "B", font=font, fill=color)


def square(size: int, bg, cap_ratio: float, radius: float = 0.0) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if bg:
        if radius:
            ImageDraw.Draw(img).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * radius), fill=bg)
        else:
            img.paste(bg, (0, 0, size, size))
    draw_b(img, cap_ratio)
    return img


def main() -> None:
    STORE.mkdir(exist_ok=True)
    # icon.svg: font-size 42/64 → cap ≈ 0.47 kətan
    # iOS/ümumi ikon — tam kvadrat, şəffaflıq yoxdur (iOS özü yuvarlaqlaşdırır)
    square(1024, BRAND, 0.47).convert("RGB").save(ASSETS / "icon.png")
    # Android adaptive: ön plan şəffaf, B təhlükəsiz zonada (66/108 ≈ 0.61) — cap 0.30
    square(1024, None, 0.30).save(ASSETS / "android-icon-foreground.png")
    Image.new("RGB", (1024, 1024), BRAND[:3]).save(ASSETS / "android-icon-background.png")
    # Monoxrom (Android 13+ temalı ikonlar) — yalnız alfa forması istifadə olunur
    square(1024, None, 0.30).save(ASSETS / "android-icon-monochrome.png")
    # Splash: zümrüd fon üzərində ağ B (fon rəngi app.json-da)
    square(1024, None, 0.42).save(ASSETS / "splash-icon.png")
    # Veb favicon — saytdakı kimi yuvarlaq künclü (rx 14/64)
    square(48, BRAND, 0.47, radius=14 / 64).save(ASSETS / "favicon.png")
    # Google Play mağaza ikonu: 512×512, 32-bit PNG, tam kvadrat (Play özü maska tətbiq edir)
    square(512, BRAND, 0.47).save(STORE / "play-icon-512.png")
    print("ok")


if __name__ == "__main__":
    main()
