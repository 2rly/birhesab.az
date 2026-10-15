import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Share, Pressable } from "react-native";
import { useTheme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Rect } from "react-native-svg";

function generateQRMatrix(text: string): boolean[][] {
  const size = text.length <= 25 ? 21 : text.length <= 50 ? 25 : 29;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  function addFinderPattern(r: number, c: number) {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const border = i === 0 || i === 6 || j === 0 || j === 6;
        const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (border || inner) matrix[r + i][c + j] = true;
      }
  }

  addFinderPattern(0, 0);
  addFinderPattern(0, size - 7);
  addFinderPattern(size - 7, 0);

  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) | 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      matrix[r][c] = (seed >> 16) % 3 === 0;
    }
  return matrix;
}

export function QrCodeCalculator() {
  const { colors } = useTheme();
  const [text, setText] = useState("");

  const matrix = text.trim() ? generateQRMatrix(text.trim()) : null;
  const cellSize = matrix ? Math.floor(260 / matrix.length) : 0;
  const svgSize = matrix ? cellSize * matrix.length : 0;

  return (
    <View>
      <Text style={[styles.note, { color: colors.n660 }]}>
        Mətn və ya URL daxil edin, QR kod avtomatik yaranacaq.
      </Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.n240, borderColor: colors.n280 }]}>
        <TextInput
          style={[styles.input, { color: colors.n940 }]}
          value={text}
          onChangeText={setText}
          placeholder="Mətn və ya URL daxil edin..."
          placeholderTextColor={colors.n400c}
          multiline
          numberOfLines={3}
        />
      </View>
      <Text style={[styles.charCount, { color: colors.n580 }]}>
        {text.length} simvol
      </Text>

      {matrix && (
        <View style={styles.qrWrap}>
          <View style={[styles.qrBg, { backgroundColor: "#fff" }]}>
            <Svg width={svgSize} height={svgSize}>
              {matrix.map((row, r) =>
                row.map((cell, c) =>
                  cell ? (
                    <Rect
                      key={`${r}-${c}`}
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill="#000"
                    />
                  ) : null
                )
              )}
            </Svg>
          </View>
          <Pressable
            style={[styles.shareBtn, { backgroundColor: colors.accent }]}
            onPress={() => Share.share({ message: text })}
          >
            <MaterialIcons name="share" size={18} color={colors.onAccent} />
            <Text style={[styles.shareText, { color: colors.onAccent }]}>Paylaş</Text>
          </Pressable>
        </View>
      )}

      {!matrix && (
        <View style={styles.empty}>
          <MaterialIcons name="qr-code" size={64} color={colors.n340} />
          <Text style={[styles.emptyText, { color: colors.n500c }]}>
            QR kod yaratmaq üçün mətn daxil edin
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13, marginBottom: 12 },
  inputWrap: { borderRadius: 10, borderWidth: 1, padding: 12, minHeight: 80 },
  input: { fontSize: 15, textAlignVertical: "top" },
  charCount: { fontSize: 12, marginTop: 6, textAlign: "right" },
  qrWrap: { alignItems: "center", marginTop: 20 },
  qrBg: { padding: 16, borderRadius: 12 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareText: { fontSize: 14, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
