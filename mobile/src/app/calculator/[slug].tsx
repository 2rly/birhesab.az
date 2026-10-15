import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";
import { useFavorites } from "@/constants/favorites";
import { calculators } from "@/data/calculators";
import { pageHeaders } from "@/data/page-headers";
import { SalaryCalculator } from "@/calculators/salary";
import { VatCalculator } from "@/calculators/vat";
import { LoanCalculator } from "@/calculators/loan";
import { DepositCalculator } from "@/calculators/deposit";
import { BmiCalculator } from "@/calculators/bmi";
import { DiscountCalculator } from "@/calculators/discount";
import { MortgageCalculator } from "@/calculators/mortgage";
import { CurrencyCalculator } from "@/calculators/currency";
import { IeltsCalculator } from "@/calculators/ielts";
import { OvertimeCalculator } from "@/calculators/overtime";
import { FreelancerTaxCalculator } from "@/calculators/freelancer-tax";
import { DepositTaxCalculator } from "@/calculators/deposit-tax";
import { DividendTaxCalculator } from "@/calculators/dividend-tax";
import { InflationCalculator } from "@/calculators/inflation";
import { LifeInsuranceCalculator } from "@/calculators/life-insurance";
import { TeacherSalaryCalculator } from "@/calculators/teacher-salary";
import { CivilServantCalculator } from "@/calculators/civil-servant";
import { AutoLoanCalculator } from "@/calculators/auto-loan";
import { ToeflCalculator } from "@/calculators/toefl";
import { GpaCalculator } from "@/calculators/gpa";
import { UniversityAdmissionCalculator } from "@/calculators/university-admission";
import { SqmCalculator } from "@/calculators/sqm";
import { RoadTaxCalculator } from "@/calculators/road-tax";
import { FuelCalculator } from "@/calculators/fuel";
import { OsagoCalculator } from "@/calculators/osago";
import { AutoCustomsCalculator } from "@/calculators/auto-customs";
import { CalorieCalculator } from "@/calculators/calorie";
import { IdealWeightCalculator } from "@/calculators/ideal-weight";
import { PregnancyCalculator } from "@/calculators/pregnancy";
import { TipCalculator } from "@/calculators/tip";
import { AgeCalculator } from "@/calculators/age";
import { DateDiffCalculator } from "@/calculators/date-diff";
import { PercentageCalculator } from "@/calculators/percentage";
import { UnitConverterCalculator } from "@/calculators/unit-converter";
import { AlimonyCalculator } from "@/calculators/alimony";
import { CourtFeeCalculator } from "@/calculators/court-fee";
import { NotaryCalculator } from "@/calculators/notary";
import { MaternityCalculator } from "@/calculators/maternity";
import { SickLeaveCalculator } from "@/calculators/sick-leave";
import { DismissalCalculator } from "@/calculators/dismissal";
import { VacationPayCalculator } from "@/calculators/vacation-pay";
import { ZakatCalculator } from "@/calculators/zakat";
import { FoodCalorieCalculator } from "@/calculators/food-calorie";
import { WaterCalculator } from "@/calculators/water";
import { GoldSilverCalculator } from "@/calculators/gold-silver";
import { AgriSubsidyCalculator } from "@/calculators/agri-subsidy";
import { KommunalCalculator } from "@/calculators/kommunal";
import { SleepCycleCalculator } from "@/calculators/sleep-cycle";
import { AznWordsCalculator } from "@/calculators/azn-words";
import { PropertyTaxCalculator } from "@/calculators/property-tax";
import { RentalTaxCalculator } from "@/calculators/rental-tax";
import { BusinessTripCalculator } from "@/calculators/business-trip";
import { CryptoCalculator } from "@/calculators/crypto";
import { CustomsFeeCalculator } from "@/calculators/customs-fee";
import { KsqBsqCalculator } from "@/calculators/ksq-bsq";
import { MilitaryCalculator } from "@/calculators/military";
import { DivorcePropertyCalculator } from "@/calculators/divorce-property";
import { YoutubeCalculator } from "@/calculators/youtube";
import { FineCalculator } from "@/calculators/fine";
import { PaternityLeaveCalculator } from "@/calculators/paternity-leave";
import { LostDocFeeCalculator } from "@/calculators/lost-doc-fee";
import { EducationLoanCalculator } from "@/calculators/education-loan";
import { UnemploymentCalculator } from "@/calculators/unemployment";
import { DisabilityCalculator } from "@/calculators/disability";
import { SatCalculator } from "@/calculators/sat";
import { SchoolGradeCalculator } from "@/calculators/school-grade";
import { InheritanceCalculator } from "@/calculators/inheritance";
import { TeacherVacationCalculator } from "@/calculators/teacher-vacation";
import { EducationLeaveCalculator } from "@/calculators/education-leave";
import { RamazanCalculator } from "@/calculators/ramazan";
import { NameMeaningCalculator } from "@/calculators/name-meaning";
import { TimezoneCalculator } from "@/calculators/timezone";
import { HarmfulHabitsCalculator } from "@/calculators/harmful-habits";
import { VehicleFeesCalculator } from "@/calculators/vehicle-fees";
import { XalqHayatYigimCalculator } from "@/calculators/xalq-hayat-yigim";
import { UomgCalculator } from "@/calculators/uomg";
import { StudyAbroadCalculator } from "@/calculators/study-abroad";
import { SecondDegreeCalculator } from "@/calculators/second-degree";
import { RentalIncomeTaxCalculator } from "@/calculators/rental-income-tax";
import { QrCodeCalculator } from "@/calculators/qr-code";
import { AdmissionScoresCalculator } from "@/calculators/admission-scores";
import { SpecialtyCodesCalculator } from "@/calculators/specialty-codes";
import { MagistrScoresCalculator } from "@/calculators/magistr-scores";
import { SubbakalavCalculator } from "@/calculators/subbakalavr";

const calculatorComponents: Record<string, React.ComponentType> = {
  "emek-haqqi": SalaryCalculator,
  edv: VatCalculator,
  kredit: LoanCalculator,
  depozit: DepositCalculator,
  ipoteka: MortgageCalculator,
  valyuta: CurrencyCalculator,
  bmi: BmiCalculator,
  endirim: DiscountCalculator,
  ielts: IeltsCalculator,
  "elave-is-saati": OvertimeCalculator,
  "frilansci-vergi": FreelancerTaxCalculator,
  "depozit-vergisi": DepositTaxCalculator,
  "dividend-vergisi": DividendTaxCalculator,
  inflyasiya: InflationCalculator,
  "yasam-sigortasi": LifeInsuranceCalculator,
  "muellim-maasi": TeacherSalaryCalculator,
  "dovlet-qullugcusu": CivilServantCalculator,
  "avtomobil-kredit": AutoLoanCalculator,
  toefl: ToeflCalculator,
  gpa: GpaCalculator,
  "universitet-qebul": UniversityAdmissionCalculator,
  kvadratmetr: SqmCalculator,
  "yol-vergisi": RoadTaxCalculator,
  yanacaq: FuelCalculator,
  osago: OsagoCalculator,
  "avtomobil-gomruk": AutoCustomsCalculator,
  kalori: CalorieCalculator,
  "ideal-ceki": IdealWeightCalculator,
  hamilelik: PregnancyCalculator,
  bahsis: TipCalculator,
  yas: AgeCalculator,
  "tarix-ferqi": DateDiffCalculator,
  faiz: PercentageCalculator,
  "vahid-cevirici": UnitConverterCalculator,
  aliment: AlimonyCalculator,
  "mehkeme-rusumu": CourtFeeCalculator,
  notarius: NotaryCalculator,
  "analiq-mezuniyyeti": MaternityCalculator,
  bulleten: SickLeaveCalculator,
  "isden-cixma": DismissalCalculator,
  "mezuniyyet-pulu": VacationPayCalculator,
  zekat: ZakatCalculator,
  "qida-kalori": FoodCalorieCalculator,
  "su-normasi": WaterCalculator,
  "qizil-gumus": GoldSilverCalculator,
  "aqrar-subsidiya": AgriSubsidyCalculator,
  kommunal: KommunalCalculator,
  "yuxu-dovru": SleepCycleCalculator,
  "azn-sozle": AznWordsCalculator,
  "emlak-vergisi": PropertyTaxCalculator,
  "kiraye-vergisi": RentalTaxCalculator,
  kripto: CryptoCalculator,
  "gomruk-rusumu": CustomsFeeCalculator,
  "herbi-xidmet": MilitaryCalculator,
  "bosanma-emlak": DivorcePropertyCalculator,
  cerime: FineCalculator,
  "ataliq-mezuniyyeti": PaternityLeaveCalculator,
  "tehsil-krediti": EducationLoanCalculator,
  sat: SatCalculator,
  "mekteb-qiymet": SchoolGradeCalculator,
  "muellim-mezuniyyet": TeacherVacationCalculator,
  "tehsil-mezuniyyeti": EducationLeaveCalculator,
  ramazan: RamazanCalculator,
  "ad-menasi": NameMeaningCalculator,
  "saat-qursagi": TimezoneCalculator,
  "zererli-verdis": HarmfulHabitsCalculator,
  rusum: VehicleFeesCalculator,
  "xalq-hayat-yigim": XalqHayatYigimCalculator,
  uomg: UomgCalculator,
  "xaricde-tehsil": StudyAbroadCalculator,
  "ikinci-ali-tehsil": SecondDegreeCalculator,
  "kiraye-gelir-vergisi": RentalIncomeTaxCalculator,
  "qr-kod": QrCodeCalculator,
  "qebul-ballari-1ci-qrup": AdmissionScoresCalculator,
  "qebul-ballari-2ci-qrup": AdmissionScoresCalculator,
  "qebul-ballari-3cu-qrup": AdmissionScoresCalculator,
  "qebul-ballari-4cu-qrup": AdmissionScoresCalculator,
  "qebul-ballari-5ci-qrup": AdmissionScoresCalculator,
  "qebul-ballari-9illik-kollec": AdmissionScoresCalculator,
  "qebul-ballari-11illik-kollec": AdmissionScoresCalculator,
  "ixtisas-kodlari": SpecialtyCodesCalculator,
  "kollec-ixtisas-kodlari": SpecialtyCodesCalculator,
  "magistr-kecid-ballari": MagistrScoresCalculator,
  "subbakalavr-ixtisas-uygunlugu": SubbakalavCalculator,
  "subbakalavr-kecid-ballari": SubbakalavCalculator,
  "elillik-muavineti": DisabilityCalculator,
  "issizlik-muavineti": UnemploymentCalculator,
  "itirilmis-sened-rusumu": LostDocFeeCalculator,
  "ezamiyye": BusinessTripCalculator,
  "ksq-bsq": KsqBsqCalculator,
  "vərəsəlik": InheritanceCalculator,
  "youtube-qazanc": YoutubeCalculator,
};

export default function CalculatorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const { isFavorite, toggle } = useFavorites();
  const insets = useSafeAreaInsets();

  const calculator = calculators.find((c) => c.slug === slug);
  const header = slug ? pageHeaders[slug] : undefined;
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
        <Text style={[styles.pageTitle, { color: colors.n960 }]}>
          {header?.title ?? calculator.name}
        </Text>
        <Text style={[styles.description, { color: colors.n580 }]}>
          {header?.description ?? calculator.description}
        </Text>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginHorizontal: 20,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 20,
    marginBottom: 14,
  },
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
