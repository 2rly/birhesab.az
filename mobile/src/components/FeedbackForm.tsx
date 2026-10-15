import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";

/** Saytın footer-indəki "Təklif və iradlar" forması — eyni formsubmit endpoint-inə göndərir. */
export function FeedbackForm() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const submit = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://formsubmit.co/ajax/info@birhesab.az", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name || "Anonim",
          message,
          _subject: "BirHesab.az — Təklif/İrad (mobil tətbiq)",
        }),
      });
      if (res.ok) {
        setSent(true);
        setName("");
        setMessage("");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.success, { borderColor: colors.accent + "66", backgroundColor: colors.accent + "1a" }]}>
        <MaterialIcons name="check-circle-outline" size={20} color={colors.accent} />
        <Text style={[styles.successText, { color: colors.accent }]}>
          Təşəkkür edirik! Mesajınız göndərildi.
        </Text>
      </View>
    );
  }

  const inputStyle = [styles.input, { backgroundColor: colors.n240, borderColor: colors.n280, color: colors.n940 }];

  return (
    <View>
      <Text style={[styles.desc, { color: colors.n580 }]}>
        Saytımızı daha yaxşı etmək üçün fikir və təkliflərinizi yazın — birbaşa bizə çatdırılacaq.
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Adınız (istəyə bağlı)"
        placeholderTextColor={colors.n400c}
        style={inputStyle}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Təklif, irad və ya sualınızı yazın..."
        placeholderTextColor={colors.n400c}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[inputStyle, styles.textarea]}
      />
      {error && (
        <Text style={styles.error}>Göndərmə uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.</Text>
      )}
      <Pressable
        onPress={submit}
        disabled={loading || !message.trim()}
        style={[styles.button, { backgroundColor: colors.accent, opacity: loading || !message.trim() ? 0.5 : 1 }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onAccent} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.onAccent }]}>Göndər</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, marginBottom: 10 },
  textarea: { minHeight: 96 },
  error: { color: "#ef4444", fontSize: 12, marginBottom: 8 },
  button: { borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  buttonText: { fontSize: 15, fontWeight: "700" },
  success: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, padding: 14 },
  successText: { flex: 1, fontSize: 14, fontWeight: "600" },
});
