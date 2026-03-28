"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";
import * as QRCode from "qrcode";

type QRSize = "small" | "medium" | "large";

const sizeMap: Record<QRSize, number> = {
  small: 200,
  medium: 300,
  large: 400,
};

const pageTranslations = {
  az: {
    title: "QR Kod yaradıcısı",
    description:
      "Mətn, URL və ya istənilən məlumat üçün QR kod yaradın. Real vaxtda generasiya, PNG olaraq yükləyin.",
    breadcrumbCategory: "Gündəlik",
    formulaTitle: "QR kod necə işləyir?",
    formulaContent: `QR (Quick Response) kod — iki ölçülü barkod növüdür.
Məlumatlar qara-ağ kvadrat naxışlar şəklində kodlanır.
Telefon kamerası ilə skan edərək məzmuna keçid edə bilərsiniz.

Dəstəklənən formatlar:
- URL (veb sayt ünvanı)
- Mətn (istənilən yazı)
- Telefon nömrəsi
- E-poçt ünvanı
- Wi-Fi məlumatları`,
    placeholder: "Mətn və ya URL daxil edin...",
    download: "PNG olaraq yüklə",
    charCount: "simvol",
    sizeLabel: "Ölçü",
    small: "Kiçik",
    medium: "Orta",
    large: "Böyük",
    emptyState: "QR kod yaratmaq üçün mətn daxil edin.",
  },
  en: {
    title: "QR Code Generator",
    description:
      "Generate QR codes for text, URLs, or any data. Real-time generation, download as PNG.",
    breadcrumbCategory: "Daily",
    formulaTitle: "How do QR codes work?",
    formulaContent: `QR (Quick Response) code is a type of two-dimensional barcode.
Data is encoded in black-and-white square patterns.
You can scan it with a phone camera to access the content.

Supported formats:
- URL (website address)
- Text (any text)
- Phone number
- Email address
- Wi-Fi credentials`,
    placeholder: "Enter text or URL...",
    download: "Download as PNG",
    charCount: "characters",
    sizeLabel: "Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    emptyState: "Enter text to generate a QR code.",
  },
  ru: {
    title: "Генератор QR-кода",
    description:
      "Создавайте QR-коды для текста, URL или любых данных. Генерация в реальном времени, скачивание в PNG.",
    breadcrumbCategory: "Ежедневное",
    formulaTitle: "Как работают QR-коды?",
    formulaContent: `QR (Quick Response) код — это тип двумерного штрих-кода.
Данные кодируются в чёрно-белых квадратных узорах.
Вы можете отсканировать его камерой телефона для доступа к содержимому.

Поддерживаемые форматы:
- URL (адрес сайта)
- Текст (любой текст)
- Номер телефона
- Адрес электронной почты
- Данные Wi-Fi`,
    placeholder: "Введите текст или URL...",
    download: "Скачать как PNG",
    charCount: "символов",
    sizeLabel: "Размер",
    small: "Маленький",
    medium: "Средний",
    large: "Большой",
    emptyState: "Введите текст, чтобы создать QR-код.",
  },
};

export default function QRCodeGenerator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [text, setText] = useState("");
  const [size, setSize] = useState<QRSize>("medium");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) {
      setGenerated(false);
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const px = sizeMap[size];

    try {
      await QRCode.toCanvas(canvas, text, {
        width: px,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });

      // Apply rounded corners by redrawing with clipping
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const radius = 16;
        const w = canvas.width;
        const h = canvas.height;

        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(w - radius, 0);
        ctx.quadraticCurveTo(w, 0, w, radius);
        ctx.lineTo(w, h - radius);
        ctx.quadraticCurveTo(w, h, w - radius, h);
        ctx.lineTo(radius, h);
        ctx.quadraticCurveTo(0, h, 0, h - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();

        ctx.putImageData(imageData, 0, 0);
      }

      setGenerated(true);
    } catch {
      setGenerated(false);
    }
  }, [text, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR();
    }, 300);
    return () => clearTimeout(timer);
  }, [generateQR]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !generated) return;

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [generated]);

  const sizeOptions: { key: QRSize; label: string }[] = [
    { key: "small", label: pt.small },
    { key: "medium", label: pt.medium },
    { key: "large", label: pt.large },
  ];

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=daily" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["azn-words", "percentage", "discount"]}
    >
      <div className="space-y-6">
        {/* Text input */}
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={pt.placeholder}
            rows={4}
            maxLength={2048}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground
              placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30
              focus:border-primary transition-all resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-muted">
              {text.length} / 2048 {pt.charCount}
            </span>
          </div>
        </div>

        {/* Size selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {pt.sizeLabel}
          </label>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {sizeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSize(opt.key)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  size === opt.key
                    ? "bg-primary text-white"
                    : "bg-surface text-muted hover:bg-background"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* QR Code display */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`bg-white rounded-2xl shadow-md p-6 inline-flex items-center justify-center transition-all ${
              !generated ? "opacity-40" : ""
            }`}
          >
            <canvas ref={canvasRef} />
          </div>

          {!text.trim() && (
            <p className="text-sm text-muted">{pt.emptyState}</p>
          )}

          {/* Download button */}
          {generated && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3
                text-white font-medium hover:bg-primary-dark transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
                />
              </svg>
              {pt.download}
            </button>
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
