import { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";
import { InputField } from "@/components/InputField";
import { ResultRow, ResultSection } from "@/components/ResultRow";
import {
  plantingSubsidies,
  productSubsidies,
  fallowSubsidies,
  type CropEntry,
  type SubsidyType,
} from "@/data/subsidies-2026";

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₼";
}

const TYPE_OPTIONS: { value: SubsidyType; label: string }[] = [
  { value: "planting", label: "Ǝkin" },
  { value: "product", label: "Məhsul" },
  { value: "fallow", label: "Dincə" },
];

const QUICK_AMOUNTS = [1, 5, 10, 25, 50, 100];

// Grain/cereal group names for certified seed check
const GRAIN_GROUPS = [
  "Buğda",
  "Arpa",
  "Çəltik",
  "Qarğıdalı",
  "Darı",
  "Sorqo",
  "Yulaf",
  "Taxıl",
];

function isGrainCrop(crop: CropEntry): boolean {
  return GRAIN_GROUPS.some(
    (g) => crop.group.toLowerCase().includes(g.toLowerCase()) || crop.name.toLowerCase().includes(g.toLowerCase())
  );
}

function getCropsForType(type: SubsidyType): CropEntry[] {
  switch (type) {
    case "planting":
      return plantingSubsidies;
    case "product":
      return productSubsidies;
    case "fallow":
      return fallowSubsidies;
  }
}

function groupCrops(crops: CropEntry[]): { group: string; items: CropEntry[] }[] {
  const map = new Map<string, CropEntry[]>();
  for (const crop of crops) {
    const arr = map.get(crop.group);
    if (arr) arr.push(crop);
    else map.set(crop.group, [crop]);
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}

export function AgriSubsidyCalculator() {
  const { colors } = useTheme();
  const [subsidyType, setSubsidyType] = useState<SubsidyType>("planting");
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("10");
  const [liberatedBonus, setLiberatedBonus] = useState(false);
  const [certifiedSeed, setCertifiedSeed] = useState(true);

  const crops = useMemo(() => getCropsForType(subsidyType), [subsidyType]);
  const grouped = useMemo(() => groupCrops(crops), [crops]);

  const selectedCrop = useMemo(
    () => crops.find((c) => c.id === selectedCropId) ?? null,
    [crops, selectedCropId]
  );

  // Reset selection when type changes
  const handleTypeChange = useCallback((type: SubsidyType) => {
    setSubsidyType(type);
    setSelectedCropId(null);
    setLiberatedBonus(false);
    setCertifiedSeed(true);
  }, []);

  const showCertifiedSeed = selectedCrop ? isGrainCrop(selectedCrop) : false;

  const result = useMemo(() => {
    if (!selectedCrop) return null;
    const q = parseFloat(quantity) || 0;
    if (q <= 0) return null;

    // For grain crops: uncertified seed = no subsidy
    if (showCertifiedSeed && !certifiedSeed) {
      return { base: 0, bonus: 0, total: 0 };
    }

    const base = selectedCrop.rate * q;
    const bonus = liberatedBonus && selectedCrop.liberatedEligible ? base * 0.5 : 0;
    const total = base + bonus;
    return { base, bonus, total };
  }, [selectedCrop, quantity, liberatedBonus, certifiedSeed, showCertifiedSeed]);

  return (
    <View style={styles.container}>
      {/* Subsidy type selector */}
      <View style={styles.typeRow}>
        {TYPE_OPTIONS.map((opt) => {
          const active = subsidyType === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleTypeChange(opt.value)}
              style={[
                styles.typeBtn,
                { borderColor: colors.n280, backgroundColor: colors.n240 },
                active && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: colors.n660 },
                  active && { color: colors.onAccent },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Crop picker */}
      <Text style={[styles.sectionLabel, { color: colors.n700 }]}>Ǝkin növü seçin</Text>
      <ScrollView
        style={[styles.cropList, { backgroundColor: colors.n195, borderColor: colors.n280 }]}
        nestedScrollEnabled
      >
        {grouped.map((g) => (
          <View key={g.group}>
            <Text style={[styles.groupHeader, { color: colors.n580, backgroundColor: colors.n240 }]}>
              {g.group}
            </Text>
            {g.items.map((crop) => {
              const active = selectedCropId === crop.id;
              return (
                <Pressable
                  key={crop.id}
                  onPress={() => {
                    setSelectedCropId(crop.id);
                    setLiberatedBonus(false);
                    setCertifiedSeed(true);
                  }}
                  style={[
                    styles.cropItem,
                    { borderBottomColor: colors.n250 },
                    active && { backgroundColor: colors.accent + "15" },
                  ]}
                >
                  <Text
                    style={[
                      styles.cropName,
                      { color: colors.n840 },
                      active && { color: colors.accent, fontWeight: "700" },
                    ]}
                    numberOfLines={2}
                  >
                    {crop.name}
                  </Text>
                  <View style={[styles.rateBadge, { backgroundColor: colors.n240 }]}>
                    <Text style={[styles.rateText, { color: colors.accent }]}>
                      {crop.rate} ₼/{crop.unit}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {selectedCrop && (
        <>
          {/* Quantity input */}
          <InputField
            label="Miqdar"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="10"
            keyboardType="decimal-pad"
            suffix={selectedCrop.unit === "ha" ? "hektar" : "ton"}
          />

          {/* Quick select */}
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((amt) => (
              <Pressable
                key={amt}
                onPress={() => setQuantity(String(amt))}
                style={[
                  styles.quickBtn,
                  { borderColor: colors.n280 },
                  quantity === String(amt) && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.quickBtnText,
                    { color: colors.n660 },
                    quantity === String(amt) && { color: colors.onAccent },
                  ]}
                >
                  {amt}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Liberated territory bonus */}
          <View style={[styles.switchRow, { borderColor: colors.n280 }]}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.n840 }]}>
                Böyük Qayıdış bonusu (+50%)
              </Text>
              {!selectedCrop.liberatedEligible && (
                <Text style={[styles.switchNote, { color: colors.n500c }]}>
                  Bu əkin növü üçün uyğun deyil
                </Text>
              )}
            </View>
            <Switch
              value={liberatedBonus}
              onValueChange={setLiberatedBonus}
              disabled={!selectedCrop.liberatedEligible}
              trackColor={{ false: colors.n280, true: colors.accent }}
            />
          </View>

          {/* Certified seed */}
          {showCertifiedSeed && (
            <View style={[styles.switchRow, { borderColor: colors.n280 }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.n840 }]}>
                  Sertifikatlaşdırılmış toxum
                </Text>
                {!certifiedSeed && (
                  <Text style={[styles.switchNote, { color: "#ef4444" }]}>
                    Sertifikatsız toxumla subsidiya verilmir
                  </Text>
                )}
              </View>
              <Switch
                value={certifiedSeed}
                onValueChange={setCertifiedSeed}
                trackColor={{ false: colors.n280, true: colors.accent }}
              />
            </View>
          )}

          {/* Rate info */}
          <View style={[styles.rateInfoBox, { backgroundColor: colors.n240 }]}>
            <Text style={[styles.rateInfoText, { color: colors.n660 }]}>
              Dərəcə: {selectedCrop.rate} ₼/{selectedCrop.unit}
              {selectedCrop.liberatedEligible ? "  ·  Böyük Qayıdış uyğun" : ""}
            </Text>
          </View>

          {/* Result */}
          {result && result.total > 0 && (
            <ResultSection title="Nəticə">
              <ResultRow label="Ümumi subsidiya" value={fmt(result.total)} highlight bold />
              <ResultRow
                label={`Ǝkin subsidiya (${selectedCrop.rate} ₼/${selectedCrop.unit})`}
                value={fmt(result.base)}
              />
              {result.bonus > 0 && (
                <ResultRow label="Böyük Qayıdış bonusu (+50%)" value={fmt(result.bonus)} />
              )}
            </ResultSection>
          )}

          {result && result.total === 0 && showCertifiedSeed && !certifiedSeed && (
            <View style={[styles.warningBox, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
              <Text style={[styles.warningText, { color: "#dc2626" }]}>
                Sertifikatlaşdırılmış toxum istifadə edilmədikdə subsidiya verilmir.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  typeBtnText: { fontSize: 14, fontWeight: "600" },
  sectionLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  cropList: {
    maxHeight: 240,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cropItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cropName: { fontSize: 14, flex: 1, marginRight: 8 },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rateText: { fontSize: 12, fontWeight: "600" },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickBtnText: { fontSize: 13, fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { fontSize: 14, fontWeight: "500" },
  switchNote: { fontSize: 11, marginTop: 2 },
  rateInfoBox: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  rateInfoText: { fontSize: 12 },
  warningBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  warningText: { fontSize: 13, textAlign: "center" },
});
