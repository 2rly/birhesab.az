import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";
import { useFavorites } from "@/constants/favorites";
import { calculators } from "@/data/calculators";

// Existing calculators
import { SalaryCalculator } from "@/calculators/salary";
import { VatCalculator } from "@/calculators/vat";
import { LoanCalculator } from "@/calculators/loan";
import { DepositCalculator } from "@/calculators/deposit";
import { BmiCalculator } from "@/calculators/bmi";
import { DiscountCalculator } from "@/calculators/discount";
import { MortgageCalculator } from "@/calculators/mortgage";
import { CurrencyCalculator } from "@/calculators/currency";

// New calculators
import { IeltsCalculator } from "@/calculators/ielts";
import { ToeflCalculator } from "@/calculators/toefl";
import { SatCalculator } from "@/calculators/sat";
import { GpaCalculator } from "@/calculators/gpa";
import { OvertimeCalculator } from "@/calculators/overtime";
import { PercentageCalculator } from "@/calculators/percentage";
import { TipCalculator } from "@/calculators/tip";
import { AgeCalculator } from "@/calculators/age";
import { DateDiffCalculator } from "@/calculators/date-diff";
import { FuelCalculator } from "@/calculators/fuel";
import { RoadTaxCalculator } from "@/calculators/road-tax";
import { OsagoCalculator } from "@/calculators/osago";
import { CarLoanCalculator } from "@/calculators/car-loan";
import { VacationPayCalculator } from "@/calculators/vacation-pay";
import { MaternityCalculator } from "@/calculators/maternity";
import { PaternityCalculator } from "@/calculators/paternity";
import { TeacherVacationCalculator } from "@/calculators/teacher-vacation";
import { AlimentCalculator } from "@/calculators/aliment";
import { SickLeaveCalculator } from "@/calculators/sick-leave";
import { SeveranceCalculator } from "@/calculators/severance";
import { BusinessTripCalculator } from "@/calculators/business-trip";
import { MilitaryCalculator } from "@/calculators/military";
import { CalorieCalculator } from "@/calculators/calorie";
import { WaterCalculator } from "@/calculators/water";
import { PregnancyCalculator } from "@/calculators/pregnancy";
import { IdealWeightCalculator } from "@/calculators/ideal-weight";
import { YuxuCalculator } from "@/calculators/yuxu";
import { AznWordsCalculator } from "@/calculators/azn-words";
import { UnitConverterCalculator } from "@/calculators/unit-converter";
import { UtilityCalculator } from "@/calculators/utility";
import { SqmCalculator } from "@/calculators/sqm";
import { NotaryCalculator } from "@/calculators/notary";
import { PropertyTaxCalculator } from "@/calculators/property-tax";
import { RentalTaxCalculator } from "@/calculators/rental-tax";
import { RentalIncomeTaxCalculator } from "@/calculators/rental-income-tax";
import { DepositTaxCalculator } from "@/calculators/deposit-tax";
import { DividendTaxCalculator } from "@/calculators/dividend-tax";
import { FreelancerTaxCalculator } from "@/calculators/freelancer-tax";
import { CourtFeeCalculator } from "@/calculators/court-fee";
import { ZakatCalculator } from "@/calculators/zakat";

const calculatorComponents: Record<string, React.ComponentType> = {
  // Finance
  "emek-haqqi": SalaryCalculator,
  edv: VatCalculator,
  kredit: LoanCalculator,
  depozit: DepositCalculator,
  ipoteka: MortgageCalculator,
  valyuta: CurrencyCalculator,
  "depozit-vergisi": DepositTaxCalculator,
  "dividend-vergisi": DividendTaxCalculator,
  "frilansci-vergi": FreelancerTaxCalculator,
  "kiraye-gelir-vergisi": RentalIncomeTaxCalculator,
  "elave-is-saati": OvertimeCalculator,

  // Education
  ielts: IeltsCalculator,
  toefl: ToeflCalculator,
  sat: SatCalculator,
  gpa: GpaCalculator,

  // Real Estate
  "emlak-vergisi": PropertyTaxCalculator,
  "kiraye-vergisi": RentalTaxCalculator,
  kvadratmetr: SqmCalculator,
  kommunal: UtilityCalculator,
  notarius: NotaryCalculator,

  // Automotive
  "yol-vergisi": RoadTaxCalculator,
  yanacaq: FuelCalculator,
  osago: OsagoCalculator,
  "avtomobil-kredit": CarLoanCalculator,

  // Legal
  "mehkeme-rusumu": CourtFeeCalculator,
  "analiq-mezuniyyeti": MaternityCalculator,

  // Health
  bmi: BmiCalculator,
  kalori: CalorieCalculator,
  "su-normasi": WaterCalculator,
  hamilelik: PregnancyCalculator,
  "ideal-ceki": IdealWeightCalculator,
  "yuxu-dovru": YuxuCalculator,

  // Daily
  endirim: DiscountCalculator,
  yas: AgeCalculator,
  bahsis: TipCalculator,
  "tarix-ferqi": DateDiffCalculator,
  faiz: PercentageCalculator,
  "azn-sozle": AznWordsCalculator,
  "vahid-cevirici": UnitConverterCalculator,

  // Labor
  "mezuniyyet-pulu": VacationPayCalculator,
  "ataliq-mezuniyyeti": PaternityCalculator,
  "muellim-mezuniyyet": TeacherVacationCalculator,
  aliment: AlimentCalculator,
  bulleten: SickLeaveCalculator,
  "isden-cixma": SeveranceCalculator,
  ezamiyye: BusinessTripCalculator,
  "herbi-xidmet": MilitaryCalculator,

  // Religion
  zekat: ZakatCalculator,
};

export default function CalculatorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const { isFavorite, toggle } = useFavorites();
  const insets = useSafeAreaInsets();

  const calculator = calculators.find((c) => c.slug === slug);
  const CalculatorComponent = slug ? calculatorComponents[slug] : undefined;
  const favorited = calculator ? isFavorite(calculator.id) : false;

  if (!calculator) {
    return (
      <View
        style={[styles.notFound, { backgroundColor: colors.n165 }]}
      >
        <MaterialIcons name="error-outline" size={48} color={colors.n400} />
        <Text style={[styles.notFoundText, { color: colors.n580 }]}>
          Hesablayıcı tapılmadı
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.n165 }]}>
      {/* Nav bar */}
      <View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.n700} />
        </Pressable>
        <Text
          style={[styles.navTitle, { color: colors.n960 }]}
          numberOfLines={1}
        >
          {calculator.name}
        </Text>
        <Pressable onPress={() => toggle(calculator.id)} hitSlop={8}>
          <MaterialIcons
            name={favorited ? "bookmark" : "bookmark-outline"}
            size={24}
            color={favorited ? colors.accent : colors.n580}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {CalculatorComponent ? (
          <View
            style={[styles.calcWrap, { backgroundColor: colors.n195 }]}
          >
            <CalculatorComponent />
          </View>
        ) : (
          <View
            style={[styles.comingSoon, { backgroundColor: colors.n195 }]}
          >
            <View
              style={[styles.comingIcon, { backgroundColor: colors.n240 }]}
            >
              <MaterialIcons
                name="construction"
                size={32}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.comingTitle, { color: colors.n840 }]}>
              Tezliklə
            </Text>
            <Text style={[styles.comingDesc, { color: colors.n500c }]}>
              Bu hesablayıcı hazırlanır.{"\n"}Tezliklə əlavə olunacaq!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  navTitle: { fontSize: 17, fontWeight: "700", flex: 1, textAlign: "center", marginHorizontal: 12 },
  content: { paddingBottom: 40 },
  calcWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: { fontSize: 16 },
  comingSoon: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  comingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  comingTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  comingDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
