import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Share, Platform, StyleSheet, type LayoutChangeEvent } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "@/constants/theme";
import { SegmentControl } from "@/components/SegmentControl";
import { Button } from "@/components/Controls";
import { FormulaSection, RelatedCalculators } from "@/components/Content";
import { encodeQR, qrPath } from "./_qr-code-parts";

type QRSize = "small" | "medium" | "large";

const sizeMap: Record<QRSize, number> = {
  small: 200,
  medium: 300,
  large: 400,
};

/** Saytdakı QRCode.toCanvas parametrləri */
const QR_MARGIN = 2;
const QR_DARK = "#0f172a";
const QR_LIGHT = "#ffffff";
const CORNER_RADIUS = 16;
const MAX_LENGTH = 2048;

const pt = {
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
  shareText: "Mətni paylaş",
  androidNote: "Android-də şəkli birbaşa yadda saxlamaq mümkün deyil — QR kodun ekran görüntüsünü çəkə bilərsiniz.",
  charCount: "simvol",
  sizeLabel: "Ölçü",
  small: "Kiçik",
  medium: "Orta",
  large: "Böyük",
  emptyState: "QR kod yaratmaq üçün mətn daxil edin.",
};

// react-native-svg Svg nümunəsinin toDataURL metodu
type SvgWithDataURL = {
  toDataURL: (cb: (base64: string) => void, options?: { width?: number; height?: number }) => void;
};

export function QrCodeCalculator() {
  const { colors } = useTheme();
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [size, setSize] = useState<QRSize>("medium");
  const [containerWidth, setContainerWidth] = useState(0);
  const svgRef = useRef<Svg>(null);

  // Saytdakı kimi 300 ms gecikmə ilə real vaxtda generasiya
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const matrix = useMemo(() => {
    if (!debounced.trim()) return null;
    try {
      return encodeQR(debounced);
    } catch {
      return null;
    }
  }, [debounced]);

  const generated = !!matrix && !!text.trim();
  const px = sizeMap[size];
  // Kart daxili boşluq (p-6 = 24) nəzərə alınaraq ekrana sığdırılır
  const displayPx = containerWidth > 0 ? Math.min(px, Math.floor(containerWidth - 48)) : Math.min(px, 260);

  const modulesCount = matrix ? matrix.length + QR_MARGIN * 2 : 0;
  const path = useMemo(() => (matrix ? qrPath(matrix, QR_MARGIN) : ""), [matrix]);

  const handleDownload = () => {
    const svg = svgRef.current as unknown as SvgWithDataURL | null;
    if (!svg || !generated) return;
    if (Platform.OS === "android") {
      Share.share({ message: text });
      return;
    }
    svg.toDataURL(
      (base64) => {
        const dataUrl = `data:image/png;base64,${base64}`;
        if (Platform.OS === "web") {
          const doc = (globalThis as unknown as { document?: Document }).document;
          if (!doc) return;
          const link = doc.createElement("a");
          link.download = "qr-code.png";
          link.href = dataUrl;
          link.click();
        } else {
          Share.share({ url: dataUrl });
        }
      },
      { width: px, height: px }
    );
  };

  return (
    <View onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}>
      {/* Mətn sahəsi */}
      <View style={[styles.inputWrap, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <TextInput
          style={[styles.input, { color: colors.n940 }]}
          value={text}
          onChangeText={setText}
          placeholder={pt.placeholder}
          placeholderTextColor={colors.n400c}
          multiline
          numberOfLines={4}
          maxLength={MAX_LENGTH}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <Text style={[styles.charCount, { color: colors.n580 }]}>
        {text.length} / {MAX_LENGTH} {pt.charCount}
      </Text>

      {/* Ölçü seçimi */}
      <SegmentControl
        label={pt.sizeLabel}
        options={[
          { value: "small", label: pt.small },
          { value: "medium", label: pt.medium },
          { value: "large", label: pt.large },
        ]}
        selected={size}
        onSelect={setSize}
      />

      {/* QR kod */}
      <View style={styles.qrWrap}>
        <View style={[styles.qrCard, !generated && { opacity: 0.4 }]}>
          {generated && matrix ? (
            <Svg
              ref={svgRef}
              width={displayPx}
              height={displayPx}
              viewBox={`0 0 ${modulesCount} ${modulesCount}`}
            >
              <Rect
                x={0}
                y={0}
                width={modulesCount}
                height={modulesCount}
                rx={(CORNER_RADIUS * modulesCount) / px}
                ry={(CORNER_RADIUS * modulesCount) / px}
                fill={QR_LIGHT}
              />
              <Path d={path} fill={QR_DARK} />
            </Svg>
          ) : (
            <View style={{ width: displayPx, height: displayPx }} />
          )}
        </View>

        {!text.trim() && <Text style={[styles.empty, { color: colors.n580 }]}>{pt.emptyState}</Text>}

        {generated && (
          <View style={styles.actions}>
            <Button
              title={Platform.OS === "android" ? pt.shareText : pt.download}
              icon={Platform.OS === "android" ? "share" : "file-download"}
              onPress={handleDownload}
            />
            {Platform.OS === "android" && (
              <Text style={[styles.note, { color: colors.n580 }]}>{pt.androidNote}</Text>
            )}
          </View>
        )}
      </View>

      <FormulaSection title={pt.formulaTitle} content={pt.formulaContent} />
      <RelatedCalculators ids={["azn-words", "percentage", "discount"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, minHeight: 100 },
  input: { fontSize: 15, textAlignVertical: "top", minHeight: 80 },
  charCount: { fontSize: 12, marginTop: 4, marginBottom: 16, textAlign: "right" },
  qrWrap: { alignItems: "center", gap: 14, marginTop: 4 },
  qrCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  empty: { fontSize: 14, textAlign: "center" },
  actions: { alignSelf: "stretch" },
  note: { fontSize: 12, textAlign: "center", lineHeight: 17 },
});
