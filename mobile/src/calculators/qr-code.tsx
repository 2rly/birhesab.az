import { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Share } from "react-native";
import { useTheme } from "@/constants/theme";
import QRCode from "react-native-qrcode-svg";
import { SegmentControl } from "@/components/SegmentControl";

type QRSize = "small" | "medium" | "large";

const SIZE_MAP: Record<QRSize, number> = {
  small: 160,
  medium: 240,
  large: 320,
};

const SIZE_OPTIONS = [
  { label: "Kiçik", value: "small" as QRSize },
  { label: "Orta", value: "medium" as QRSize },
  { label: "Böyük", value: "large" as QRSize },
];

export function QrCodeCalculator() {
  const { colors } = useTheme();
  const [text, setText] = useState("");
  const [size, setSize] = useState<QRSize>("medium");
  const qrRef = useRef<any>(null);

  const shareQR = useCallback(() => {
    if (!qrRef.current) return;
    qrRef.current.toDataURL((data: string) => {
      Share.share({ url: `data:image/png;base64,${data}` }).catch(() => {});
    });
  }, []);

  return (
    <View>
      <Text style={[s.label, { color: colors.n700 }]}>Mətn və ya URL daxil edin</Text>
      <TextInput
        style={[s.input, { backgroundColor: colors.n240, borderColor: colors.n280, color: colors.n940 }]}
        value={text}
        onChangeText={setText}
        placeholder="https://birhesab.az"
        placeholderTextColor={colors.n400c}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={[s.label, { color: colors.n700, marginTop: 16 }]}>Ölçü</Text>
      <SegmentControl
        options={SIZE_OPTIONS}
        selected={size}
        onSelect={(v) => setSize(v)}
      />

      {text.trim() ? (
        <View style={s.qrWrap}>
          <View style={[s.qrBox, { backgroundColor: "#fff" }]}>
            <QRCode
              value={text}
              size={SIZE_MAP[size]}
              backgroundColor="#fff"
              color="#000"
              getRef={(ref: any) => (qrRef.current = ref)}
            />
          </View>
          <Pressable
            onPress={shareQR}
            style={[s.shareBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[s.shareBtnText, { color: colors.onAccent }]}>Paylaş / Yüklə</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={[s.empty, { color: colors.n500c }]}>
          QR kod yaratmaq üçün yuxarıda mətn daxil edin.
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
  },
  qrWrap: { alignItems: "center", marginTop: 24, gap: 16 },
  qrBox: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  shareBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnText: { fontSize: 15, fontWeight: "700" },
  empty: { fontSize: 14, textAlign: "center", marginTop: 32, lineHeight: 20 },
});
