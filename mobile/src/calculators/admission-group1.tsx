import { AdmissionScoreCalculator, type SubgroupOption } from "@/components/AdmissionScoreCalculator";
import { admissionsGroup1 } from "@/data/admissions-group1-2026";
import { attachPlan } from "@/data/admissions-plan-2026";
import { planGroup1 } from "@/data/admissions-plan-2026-group1";

const R_INFORMATIKA = [
  "İnformatika müəllimliyi",
  "Riyaziyyat və informatika müəllimliyi",
  "Kompüter elmləri",
  "İnformasiya təhlükəsizliyi",
  "İnformasiya texnologiyaları",
  "Kompüter mühəndisliyi",
  "Mexatronika və robototexnika mühəndisliyi",
  "Proseslərin avtomatlaşdırılması mühəndisliyi",
  "Sistemlər mühəndisliyi",
];

const R_KIMYA = [
  "Fizika müəllimliyi",
  "Riyaziyyat müəllimliyi",
  "Texnologiya müəllimliyi",
  "Fizika",
  "Geologiya",
  "Mexanika",
  "Riyaziyyat",
  "Aerokosmik mühəndislik",
  "Aqromühəndislik",
  "Aviasiya təhlükəsizliyi mühəndisliyi",
  "Cihaz mühəndisliyi",
  "Dəniz naviqasiyası mühəndisliyi",
  "Ekologiya mühəndisliyi",
  "Elektrik və elektronika mühəndisliyi",
  "Energetika mühəndisliyi",
  "Gəmi energetik qurğularının istismarı mühəndisliyi",
  "Gəmiqayırma və gəmi təmiri mühəndisliyi",
  "Geologiya və geofizika mühəndisliyi",
  "Geomatika və geodeziya mühəndisliyi",
  "Hava nəqliyyatının hərəkətinin təşkili",
  "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi",
  "İnşaat mühəndisliyi",
  "Kimya mühəndisliyi",
  "Kommunikasiya sistemləri mühəndisliyi",
  "Logistika və nəqliyyat texnologiyaları mühəndisliyi",
  "Maşın mühəndisliyi",
  "Materiallar mühəndisliyi",
  "Mədən mühəndisliyi",
  "Meliorasiya mühəndisliyi",
  "Memarlıq",
  "Metallurgiya mühəndisliyi",
  "Mexanika mühəndisliyi",
  "Mühəndis fizikası",
  "Neft-qaz mühəndisliyi",
  "Nəqliyyat mühəndisliyi",
  "Nəqliyyat tikintisi mühəndisliyi",
  "Qida mühəndisliyi",
  "Radiotexnika və telekommunikasiya mühəndisliyi",
  "Şəhərsalma",
  "Sənaye mühəndisliyi",
  "Uçuş mühəndisliyi",
  "Yanğın təhlükəsizliyi mühəndisliyi",
  "Aqronomluq",
  "Balıqçılıq",
  "Meşəçilik",
  "Şərabçılıq",
  "Torpaqşünaslıq və aqrokimya",
  "Yerquruluşu və daşınmaz əmlakın kadastrı",
  "Zoomühəndislik",
];

const SUBGROUPS: SubgroupOption[] = [
  { value: "all", label: "Hamısı", specialties: [] },
  { value: "rk", label: "Riyaziyyat-Kimya (RK)", specialties: R_KIMYA },
  { value: "ri", label: "Riyaziyyat-İnformatika (Rİ)", specialties: R_INFORMATIKA },
];

const LOW_BLOCK = [
  "Meliorasiya mühəndisliyi",
  "Texnologiya müəllimliyi",
  "Ekologiya mühəndisliyi",
  "Aqronomluq",
  "Balıqçılıq",
  "Meşəçilik",
  "Şərabçılıq",
  "Torpaqşünaslıq və aqrokimya",
  "Yerquruluşu və daşınmaz əmlakın kadastrı",
  "Zoomühəndislik",
];

const ENTRIES = attachPlan(admissionsGroup1, planGroup1);

export function AdmissionGroup1Calculator() {
  return (
    <AdmissionScoreCalculator
      entries={ENTRIES}
      subgroups={SUBGROUPS}
      lowBlockSpecialties={LOW_BLOCK}
    />
  );
}
