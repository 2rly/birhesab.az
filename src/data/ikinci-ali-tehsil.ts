// İkinci ali təhsil (təkrar ali təhsil / əlavə təhsil) — 2025/2026 tədris ili
// Mənbə: universitetlərin rəsmi qəbul elanları

export type StudyForm = "əyani" | "qiyabi" | "əyani/qiyabi";
export type Language = "az" | "rus" | "ingilis" | "az/rus" | "az/ingilis" | "az/rus/ingilis";

export interface SecondDegreeProgram {
  code?: string; // ixtisas şifri (məs. 050405)
  specialty: string; // ixtisas adı
  form: StudyForm;
  language?: Language;
  fee?: number | string; // illik təhsil haqqı (AZN) — nümunə: 2500 və ya "2200-2800"
  note?: string;
}

export interface SecondDegreeUniversity {
  id: string;
  name: string;
  shortName?: string;
  note?: string;
  programs: SecondDegreeProgram[];
}

export const secondDegreeData: SecondDegreeUniversity[] = [
  // ATU
  {
    id: "atu",
    name: "Azərbaycan Tibb Universiteti",
    shortName: "ATU",
    note: "Sənəd qəbulu portal.edu.az saytı vasitəsilə (əyani formada).",
    programs: [
      { code: "6100003", specialty: "Tibb", form: "əyani", fee: 6500 },
      { code: "6009003", specialty: "İctimai səhiyyə", form: "əyani", fee: 5000 },
      { code: "6100002", specialty: "Stomatologiya", form: "əyani", fee: 6000 },
      { code: "6009001", specialty: "Əczaçılıq", form: "əyani", fee: 5000 },
      { code: "6009002", specialty: "Fizioterapiya və tibbi reabilitasiya", form: "əyani", fee: 5000 },
      { code: "6009005", specialty: "Tibb bacısı işi", form: "əyani", fee: 5000 },
    ],
  },

  // ADDA
  {
    id: "adda",
    name: "Azərbaycan Dövlət Dəniz Akademiyası",
    shortName: "ADDA",
    note: "ASCO tərkibində, qiyabi, ödənişli əsaslarla.",
    programs: [
      { code: "050605", specialty: "Dəniz naviqasiyası mühəndisliyi", form: "qiyabi" },
      { code: "050609", specialty: "Gəmi energetik qurğularının istismarı mühəndisliyi", form: "qiyabi" },
    ],
  },

  // Xəzər Universiteti
  {
    id: "xezer",
    name: "Xəzər Universiteti",
    shortName: "Xəzər",
    note: "Tədris dili: İngilis. Mərkəz: Məryəm Plaza.",
    programs: [
      { specialty: "Menecment", form: "əyani", language: "ingilis" },
      { specialty: "Radiotexnika mühəndisliyi", form: "əyani", language: "ingilis" },
      { specialty: "Kimya mühəndisliyi", form: "əyani", language: "ingilis" },
      { specialty: "Elektrik və elektronika mühəndisliyi", form: "əyani", language: "ingilis" },
      { specialty: "Politologiya", form: "əyani", language: "ingilis" },
      { specialty: "Psixologiya", form: "əyani", language: "ingilis" },
      { specialty: "Regionşünaslıq", form: "əyani", language: "ingilis" },
      { specialty: "Dizayn", form: "əyani", language: "ingilis" },
      { specialty: "Maliyyə", form: "əyani", language: "ingilis" },
      { specialty: "Marketinq", form: "əyani", language: "ingilis" },
      { specialty: "Beynəlxalq münasibətlər", form: "əyani", language: "ingilis" },
      { specialty: "Biznesin idarə edilməsi", form: "əyani", language: "ingilis" },
      { specialty: "Kompüter elmləri", form: "əyani", language: "ingilis" },
      { specialty: "Neft-qaz mühəndisliyi", form: "əyani", language: "ingilis" },
      { specialty: "Mexanika mühəndisliyi", form: "əyani", language: "ingilis" },
      { specialty: "Memarlıq", form: "əyani", language: "ingilis" },
      { specialty: "İnşaat mühəndisliyi", form: "əyani", language: "ingilis" },
      { specialty: "Turizm işinin təşkili", form: "əyani", language: "ingilis" },
      { specialty: "Mühasibat", form: "əyani", language: "ingilis" },
      { specialty: "İqtisadiyyat", form: "əyani", language: "ingilis" },
    ],
  },

  // UNEC
  {
    id: "unec",
    name: "Azərbaycan Dövlət İqtisad Universiteti",
    shortName: "UNEC",
    note: "Əsasən qiyabi. İllik təhsil haqqı 2000–2600 AZN.",
    programs: [
      { specialty: "Maliyyə", form: "qiyabi", fee: 2600 },
      { specialty: "Biznesin idarə edilməsi", form: "qiyabi", fee: 2500 },
      { specialty: "Mühasibat", form: "qiyabi", fee: 2500 },
      { specialty: "İqtisadiyyat", form: "qiyabi", fee: 2300 },
      { specialty: "Menecment", form: "qiyabi", fee: 2300 },
      { specialty: "Marketinq", form: "qiyabi", fee: 2300 },
      { specialty: "Dövlət və bələdiyyə idarəetməsi", form: "qiyabi", fee: 2300 },
      { specialty: "Beynəlxalq ticarət və logistika", form: "qiyabi", fee: 2300 },
      { specialty: "Beynəlxalq münasibətlər", form: "qiyabi", fee: 2300 },
      { specialty: "İnformasiya texnologiyaları", form: "qiyabi", fee: 2200 },
      { specialty: "İnformasiya təhlükəsizliyi", form: "qiyabi", fee: 2200 },
      { specialty: "Sosial iş", form: "qiyabi", fee: 2000 },
      { specialty: "Ekologiya", form: "qiyabi", fee: 2000 },
      { specialty: "Statistika", form: "qiyabi" },
    ],
  },

  // UNEC Zaqatala filialı
  {
    id: "unec-zaqatala",
    name: "UNEC — Zaqatala filialı",
    shortName: "UNEC Zaqatala",
    note: "Təhsil ödənişli. Sənəd qəbulu portal.edu.az və kabinet.unec.edu.az vasitəsilə.",
    programs: [
      { code: "050406", specialty: "Maliyyə", form: "qiyabi" },
      { code: "050405", specialty: "İqtisadiyyat", form: "qiyabi" },
      { code: "050408", specialty: "Menecment", form: "qiyabi" },
      { code: "050409", specialty: "Mühasibat", form: "qiyabi" },
      { code: "050407", specialty: "Marketinq", form: "qiyabi" },
      { code: "050810", specialty: "Turizm işinin təşkili", form: "qiyabi" },
      { code: "050402", specialty: "Biznesin idarə edilməsi", form: "qiyabi" },
      { code: "050616", specialty: "İnformasiya texnologiyaları", form: "qiyabi" },
      { code: "050404", specialty: "Dövlət və bələdiyyə idarəetməsi", form: "qiyabi" },
    ],
  },

  // ATMU
  {
    id: "atmu",
    name: "Azərbaycan Turizm və Menecment Universiteti",
    shortName: "ATMU",
    programs: [
      { specialty: "Turizm işinin təşkili", form: "əyani/qiyabi" },
      { specialty: "Turizm bələdçiliyi", form: "əyani/qiyabi" },
      { specialty: "Menecment", form: "əyani/qiyabi" },
      { specialty: "Marketinq", form: "əyani/qiyabi" },
      { specialty: "Maliyyə", form: "əyani/qiyabi" },
      { specialty: "Mühasibat", form: "əyani/qiyabi" },
      { specialty: "Qida mühəndisliyi", form: "əyani/qiyabi" },
      { specialty: "Nəqliyyatda servis (nəqliyyat növləri üzrə)", form: "əyani/qiyabi" },
      { specialty: "Sosial iş", form: "əyani/qiyabi" },
      { specialty: "Muzeyşünaslıq, arxiv işi və abidələrin qorunması", form: "əyani/qiyabi" },
      { specialty: "Beynəlxalq münasibətlər", form: "əyani/qiyabi" },
      { specialty: "Dövlət və bələdiyyə idarəetməsi", form: "əyani/qiyabi" },
    ],
  },

  // BDU
  {
    id: "bdu",
    name: "Bakı Dövlət Universiteti",
    shortName: "BDU",
    note: "Qiyabi, ödənişli. İllik təhsil haqqı 2000–5500 AZN.",
    programs: [
      { specialty: "Hüquqşünaslıq", form: "qiyabi", fee: 5500 },
      { specialty: "Dövlət və ictimai münasibətlər", form: "qiyabi", fee: 3600 },
      { specialty: "Beynəlxalq münasibətlər", form: "qiyabi", fee: 3200 },
      { specialty: "İqtisadiyyat", form: "qiyabi", fee: 3000 },
      { specialty: "Psixologiya", form: "qiyabi", fee: 2500 },
      { specialty: "Biznesin idarə edilməsi", form: "qiyabi", fee: 2500 },
      { specialty: "Tarix", form: "qiyabi", fee: 2000 },
      { specialty: "Sosial iş", form: "qiyabi", fee: 2000 },
    ],
  },

  // AzMİU
  {
    id: "azmiu",
    name: "Azərbaycan Memarlıq və İnşaat Universiteti",
    shortName: "AzMİU",
    programs: [
      { specialty: "Memarlıq", form: "əyani" },
      { specialty: "Dizayn", form: "əyani" },
      { specialty: "Şəhərsalma", form: "əyani" },
      { specialty: "İnşaat mühəndisliyi", form: "qiyabi" },
      { specialty: "Materiallar mühəndisliyi", form: "qiyabi" },
      { specialty: "Sənaye mühəndisliyi", form: "qiyabi" },
      { specialty: "Kommunikasiya sistemləri mühəndisliyi", form: "qiyabi" },
      { specialty: "Meliorasiya mühəndisliyi", form: "qiyabi" },
      { specialty: "Ekologiya mühəndisliyi", form: "qiyabi" },
      { specialty: "Neft-qaz mühəndisliyi", form: "qiyabi" },
      { specialty: "Elektrik və elektronika mühəndisliyi", form: "qiyabi" },
      { specialty: "Yerquruluşu və daşınmaz əmlakın kadastrı", form: "qiyabi" },
      { specialty: "Geomatika və geodeziya mühəndisliyi", form: "qiyabi" },
      { specialty: "Logistika və nəqliyyat texnologiyaları mühəndisliyi", form: "qiyabi" },
      { specialty: "Nəqliyyat mühəndisliyi", form: "qiyabi" },
      { specialty: "Nəqliyyat tikintisi mühəndisliyi", form: "qiyabi" },
      { specialty: "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi", form: "qiyabi" },
      { specialty: "İqtisadiyyat", form: "qiyabi" },
      { specialty: "Menecment", form: "qiyabi" },
      { specialty: "Marketinq", form: "qiyabi" },
      { specialty: "Biznesin idarə edilməsi", form: "qiyabi" },
      { specialty: "İnformasiya texnologiyaları", form: "qiyabi" },
      { specialty: "Proseslərin avtomatlaşdırılması mühəndisliyi", form: "qiyabi" },
      { specialty: "Mexanika mühəndisliyi", form: "qiyabi" },
      { specialty: "Maşın mühəndisliyi", form: "qiyabi" },
    ],
  },

  // ADNSU
  {
    id: "adnsu",
    name: "Azərbaycan Dövlət Neft və Sənaye Universiteti",
    shortName: "ADNSU",
    note: "Bakalavriat səviyyəsində 17 ixtisas. Ödənişli, illik 2200–2800 AZN.",
    programs: [
      { specialty: "Geologiya və geofizika mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Geologiya", form: "əyani", fee: "2200-2800" },
      { specialty: "Neft-qaz mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "İnşaat mühəndisliyi (dəniz neft-qaz qurğularının tikintisi)", form: "əyani", fee: "2200-2800" },
      { specialty: "Logistika və nəqliyyat texnologiyaları mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Mədən mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Kimya mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Mexanika mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Elektrik və elektronika mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Energetika mühəndisliyi", form: "əyani", fee: "2200-2800" },
      { specialty: "Kompüter elmləri", form: "əyani", fee: "2200-2800" },
      { specialty: "İnformasiya texnologiyaları", form: "əyani", fee: "2200-2800" },
      { specialty: "İqtisadiyyat", form: "əyani", fee: "2200-2800" },
      { specialty: "Menecment", form: "əyani", fee: "2200-2800" },
      { specialty: "Biznesin idarə edilməsi", form: "əyani", fee: "2200-2800" },
      { specialty: "Qida mühəndisliyi", form: "əyani", fee: "2200-2800" },
    ],
  },

  // AzTU
  {
    id: "aztu",
    name: "Azərbaycan Texniki Universiteti",
    shortName: "AzTU",
    note: "31 ixtisas. Azərbaycan və rus bölmələri, əyani/qiyabi.",
    programs: [
      { code: "050401", specialty: "Beynəlxalq ticarət və logistika", form: "əyani/qiyabi", fee: "2100-2500" },
      { code: "050402", specialty: "Biznesin idarə edilməsi", form: "əyani/qiyabi", fee: "2100-2500" },
      { code: "050405", specialty: "İqtisadiyyat", form: "əyani/qiyabi", language: "az/rus", fee: "2100-2500" },
      { code: "050407", specialty: "Marketinq", form: "əyani/qiyabi", fee: "2100-2500" },
      { code: "050408", specialty: "Menecment", form: "əyani/qiyabi", fee: "2100-2500" },
      { code: "050410", specialty: "Statistika", form: "əyani/qiyabi", fee: "2100-2500" },
      { code: "050509", specialty: "Kompüter elmləri", form: "əyani", fee: 2500 },
      { code: "050601", specialty: "Aerokosmik mühəndislik", form: "əyani", fee: 2500 },
      { code: "050604", specialty: "Cihaz mühəndisliyi", form: "əyani", fee: 2300 },
      { code: "050606", specialty: "Ekologiya mühəndisliyi", form: "əyani/qiyabi", fee: "2000-2400" },
      { code: "050607", specialty: "Elektrik və elektronika mühəndisliyi", form: "əyani/qiyabi", fee: "2000-2400" },
      { code: "050608", specialty: "Energetika mühəndisliyi", form: "əyani/qiyabi", fee: "2000-2400" },
      { code: "050614", specialty: "Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi", form: "əyani", fee: 2400 },
      { code: "050615", specialty: "İnformasiya təhlükəsizliyi", form: "əyani/qiyabi", language: "az/rus", fee: "2100-2500" },
      { code: "050616", specialty: "İnformasiya texnologiyaları", form: "əyani/qiyabi", language: "az/rus", fee: "2100-2500" },
      { code: "050618", specialty: "Kimya mühəndisliyi", form: "əyani", fee: 2400 },
      { code: "050620", specialty: "Kompüter mühəndisliyi", form: "əyani/qiyabi", language: "az/rus", fee: "2000-2400" },
      { code: "050621", specialty: "Logistika və nəqliyyat texnologiyaları mühəndisliyi", form: "əyani/qiyabi", language: "az/rus", fee: "2000-2400" },
      { code: "050622", specialty: "Maşın mühəndisliyi", form: "əyani/qiyabi", language: "az/rus", fee: "1900-2300" },
      { code: "050623", specialty: "Materiallar mühəndisliyi", form: "əyani/qiyabi", fee: "1800-2200" },
      { code: "050624", specialty: "Mədən mühəndisliyi", form: "əyani", fee: 2200 },
      { code: "050627", specialty: "Metallurgiya mühəndisliyi", form: "əyani/qiyabi", language: "az/rus", fee: "1800-2200" },
      { code: "050628", specialty: "Mexanika mühəndisliyi", form: "əyani/qiyabi", fee: "1900-2300" },
      { code: "050629", specialty: "Mexatronika və robototexnika mühəndisliyi", form: "əyani", fee: 2300 },
      { code: "050630", specialty: "Mühəndis fizikası", form: "əyani", fee: 2400 },
      { code: "050632", specialty: "Nəqliyyat mühəndisliyi", form: "əyani/qiyabi", language: "az/rus", fee: "2000-2400" },
      { code: "050634", specialty: "Proseslərin avtomatlaşdırılması mühəndisliyi", form: "əyani/qiyabi", language: "az/rus", fee: "2000-2400" },
      { code: "050635", specialty: "Qida mühəndisliyi", form: "əyani", fee: 2500 },
      { code: "050636", specialty: "Radiotexnika və telekommunikasiya mühəndisliyi", form: "əyani/qiyabi", language: "az/rus", fee: "2000-2400" },
      { code: "050638", specialty: "Sənaye mühəndisliyi", form: "əyani", fee: 2300 },
      { code: "050806", specialty: "Nəqliyyatda servis (avtomobil nəqliyyatı üzrə)", form: "əyani/qiyabi", fee: "2100-2500" },
    ],
  },

  // BMU
  {
    id: "bmu",
    name: "Bakı Mühəndislik Universiteti",
    shortName: "BMU",
    note: "Azərbaycan (əyani/qiyabi) və İngilis (əyani) bölmələri.",
    programs: [
      { code: "50306", specialty: "Dizayn (sənaye, interyer, qrafik, geyim dizaynı)", form: "əyani", fee: 2500 },
      { code: "50401", specialty: "Beynəlxalq ticarət və logistika", form: "əyani/qiyabi", fee: 2300 },
      { code: "50402", specialty: "Biznesin idarə edilməsi", form: "əyani/qiyabi", language: "az/ingilis", fee: "2300-2900" },
      { code: "50404", specialty: "Dövlət və bələdiyyə idarəetməsi", form: "əyani/qiyabi", fee: 2300 },
      { code: "50405", specialty: "İqtisadiyyat", form: "əyani/qiyabi", language: "az/ingilis", fee: "2300-2900" },
      { code: "50406", specialty: "Maliyyə", form: "əyani/qiyabi", language: "az/ingilis", fee: "2300-2900" },
      { code: "50407", specialty: "Marketinq", form: "əyani/qiyabi", fee: 2300 },
      { code: "50409", specialty: "Mühasibat", form: "əyani/qiyabi", language: "az/ingilis", fee: "2300-2900" },
      { code: "50502", specialty: "Biotexnologiya", form: "əyani", fee: 2300 },
      { code: "50505", specialty: "Fizika", form: "əyani", language: "ingilis", fee: 2500 },
      { code: "50508", specialty: "Kimya", form: "əyani", language: "ingilis", fee: 2500 },
      { code: "50509", specialty: "Kompüter elmləri", form: "əyani", language: "az/ingilis", fee: "2300-2500" },
      { code: "50511", specialty: "Riyaziyyat", form: "əyani", language: "ingilis", fee: 2500 },
      { code: "50606", specialty: "Ekologiya mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2200-2500" },
      { code: "50607", specialty: "Elektrik və elektronika mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2200-2300" },
      { code: "50608", specialty: "Energetika mühəndisliyi", form: "əyani", fee: 2200 },
      { code: "50615", specialty: "İnformasiya təhlükəsizliyi", form: "əyani", language: "az/ingilis", fee: "2300-2500" },
      { code: "50616", specialty: "İnformasiya texnologiyaları", form: "əyani/qiyabi", language: "az/ingilis", fee: "2300-2500" },
      { code: "50617", specialty: "İnşaat mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2200-2500" },
      { code: "50618", specialty: "Kimya mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2200-2500" },
      { code: "50619", specialty: "Kommunikasiya sistemləri mühəndisliyi", form: "əyani", fee: 2200 },
      { code: "50620", specialty: "Kompüter mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2300-2500" },
      { code: "50621", specialty: "Logistika və nəqliyyat texnologiyaları mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2300" },
      { code: "50622", specialty: "Maşın mühəndisliyi", form: "əyani", fee: 2200 },
      { code: "50626", specialty: "Memarlıq", form: "əyani", language: "az/ingilis", fee: "2700" },
      { code: "50628", specialty: "Mexanika mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2200-2300" },
      { code: "50629", specialty: "Mexatronika və robototexnika mühəndisliyi", form: "əyani", fee: 2200 },
      { code: "50632", specialty: "Nəqliyyat mühəndisliyi", form: "əyani", fee: 2300 },
      { code: "50633", specialty: "Nəqliyyat tikintisi mühəndisliyi", form: "əyani", fee: 2200 },
      { code: "50634", specialty: "Proseslərin avtomatlaşdırılması mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2200-2500" },
      { code: "50635", specialty: "Qida mühəndisliyi", form: "əyani", fee: 2300 },
      { code: "50636", specialty: "Radiotexnika və telekommunikasiya mühəndisliyi", form: "əyani", fee: 2200 },
      { code: "50637", specialty: "Şəhərsalma", form: "əyani", fee: 2200 },
      { code: "50638", specialty: "Sənaye mühəndisliyi", form: "əyani", language: "az/ingilis", fee: "2200-2500" },
      { code: "50707", specialty: "Şərabçılıq", form: "əyani/qiyabi", fee: 2300 },
      { code: "50806", specialty: "Nəqliyyatda servis (avtomobil nəqliyyatı üzrə)", form: "əyani/qiyabi", fee: 2200 },
    ],
  },

  // DİA
  {
    id: "dia",
    name: "Prezident yanında Dövlət İdarəçilik Akademiyası",
    shortName: "DİA",
    note: "Qiyabi, ödənişli.",
    programs: [
      { specialty: "Hüquqşünaslıq", form: "qiyabi", fee: 8000 },
      { specialty: "Menecment", form: "qiyabi", fee: 6000 },
      { specialty: "Dövlət və bələdiyyə idarəetməsi", form: "qiyabi", fee: 6000 },
      { specialty: "Politologiya", form: "qiyabi", fee: 4000 },
      { specialty: "Beynəlxalq münasibətlər", form: "qiyabi", fee: 4000 },
    ],
  },

  // AƏSMA
  {
    id: "aesma",
    name: "Azərbaycan Əmək və Sosial Münasibətlər Akademiyası",
    shortName: "AƏSMA",
    programs: [
      { code: "050404", specialty: "Dövlət və bələdiyyə idarəetməsi", form: "qiyabi" },
      { code: "050807", specialty: "Sosial iş", form: "qiyabi" },
      { code: "050405", specialty: "İqtisadiyyat", form: "qiyabi" },
      { code: "050406", specialty: "Maliyyə", form: "qiyabi" },
      { code: "050409", specialty: "Mühasibat", form: "qiyabi" },
      { code: "050407", specialty: "Marketinq", form: "qiyabi" },
    ],
  },

  // BSU
  {
    id: "bsu",
    name: "Bakı Slavyan Universiteti",
    shortName: "BSU",
    note: "2025/2026 tədris ili üçün.",
    programs: [
      { specialty: "Filologiya — Azərbaycan dili və ədəbiyyatı", form: "əyani", language: "az" },
      { specialty: "Filologiya — Rus dili və ədəbiyyatı", form: "əyani", language: "rus" },
      { specialty: "Filologiya — İngilis dili və ədəbiyyatı", form: "əyani", language: "az" },
      { specialty: "Psixologiya", form: "əyani", language: "az/rus" },
      { specialty: "Beynəlxalq münasibətlər", form: "əyani", language: "az" },
      { specialty: "Politologiya", form: "əyani", language: "az" },
    ],
  },

  // BANM
  {
    id: "banm",
    name: "Bakı Ali Neft Məktəbi",
    shortName: "BANM",
    programs: [
      { specialty: "Neft-qaz mühəndisliyi", form: "əyani" },
    ],
  },

  // QKU
  {
    id: "qku",
    name: "Qərbi Kaspi Universiteti",
    shortName: "QKU",
    programs: [
      { specialty: "İnformasiya təhlükəsizliyi", form: "əyani/qiyabi" },
      { specialty: "Qida mühəndisliyi", form: "əyani" },
      { specialty: "Cihaz mühəndisliyi", form: "əyani" },
      { specialty: "Mexatronika və robototexnika mühəndisliyi", form: "əyani" },
      { specialty: "Meşəçilik", form: "əyani/qiyabi" },
      { specialty: "Kompüter mühəndisliyi", form: "əyani/qiyabi" },
      { specialty: "İnformasiya texnologiyaları", form: "əyani/qiyabi" },
      { specialty: "Kompüter elmləri", form: "əyani/qiyabi" },
      { specialty: "Ekologiya mühəndisliyi", form: "əyani" },
      { specialty: "Tərcümə (ingilis)", form: "əyani" },
      { specialty: "Filologiya (Azərbaycan dili və ədəbiyyatı)", form: "əyani" },
      { specialty: "Filologiya (ingilis dili və ədəbiyyatı)", form: "əyani" },
      { specialty: "Tarix", form: "əyani/qiyabi" },
      { specialty: "Fəlsəfə", form: "əyani" },
      { specialty: "Sosial iş", form: "əyani" },
      { specialty: "Beynəlxalq münasibətlər", form: "əyani" },
      { specialty: "Regionşünaslıq", form: "əyani" },
      { specialty: "Təhsildə sosial psixoloji xidmət", form: "əyani" },
      { specialty: "İqtisadiyyat", form: "əyani/qiyabi" },
      { specialty: "Maliyyə", form: "əyani/qiyabi" },
      { specialty: "Biznesin idarə edilməsi", form: "əyani/qiyabi" },
      { specialty: "Turizm işinin təşkili", form: "əyani/qiyabi" },
      { specialty: "Mühasibat", form: "əyani/qiyabi" },
      { specialty: "Marketinq", form: "əyani/qiyabi" },
      { specialty: "Turizm bələdçiliyi", form: "əyani" },
      { specialty: "Psixologiya", form: "əyani/qiyabi" },
      { specialty: "Biologiya", form: "əyani" },
      { specialty: "Su bioehtiyatları və akvakultura", form: "əyani" },
      { specialty: "Ekologiya", form: "əyani" },
      { specialty: "Dizayn (sahələr üzrə)", form: "əyani" },
    ],
  },

  // DGA
  {
    id: "dga",
    name: "Dövlət Gömrük Komitəsinin Akademiyası",
    shortName: "DGA",
    note: "2025/2026 tədris ili.",
    programs: [
      { code: "6002007", specialty: "Hüquqşünaslıq", form: "əyani", note: "Yalnız gömrük əməkdaşları üçün" },
      { code: "6004001", specialty: "Beynəlxalq ticarət və logistika", form: "əyani" },
    ],
  },

  // ADPU
  {
    id: "adpu",
    name: "Azərbaycan Dövlət Pedaqoji Universiteti",
    shortName: "ADPU",
    programs: [
      { specialty: "Sosial iş", form: "əyani", language: "az" },
      { specialty: "Təhsildə sosial-psixoloji xidmət", form: "əyani", language: "az/rus" },
    ],
  },

  // Azərbaycan Universiteti
  {
    id: "au",
    name: "Azərbaycan Universiteti",
    shortName: "AU",
    note: "Həftənin 6 günü — axşam və ya gündüz növbəsi.",
    programs: [
      { code: "6006016", specialty: "İnformasiya texnologiyaları", form: "əyani/qiyabi" },
      { code: "6004002", specialty: "Biznesin idarə edilməsi", form: "əyani/qiyabi" },
      { code: "6004006", specialty: "Marketinq", form: "əyani/qiyabi" },
      { code: "6004008", specialty: "Mühasibat", form: "əyani/qiyabi" },
      { code: "6008006", specialty: "Sosial iş", form: "əyani/qiyabi" },
      { code: "6008008", specialty: "Turizm işinin təşkili", form: "əyani/qiyabi" },
      { code: "6006017", specialty: "İnformasiya təhlükəsizliyi", form: "əyani" },
      { code: "6002004", specialty: "Dövlət və ictimai münasibətlər", form: "əyani" },
    ],
  },

  // Əlavə: İnformasiya təhlükəsizliyi olan digər universitetlər (şəkildəkilərdən)
  {
    id: "ldu",
    name: "Lənkəran Dövlət Universiteti",
    shortName: "LDU",
    programs: [
      { specialty: "İnformasiya təhlükəsizliyi", form: "əyani" },
    ],
  },
  {
    id: "mdu",
    name: "Mingəçevir Dövlət Universiteti",
    shortName: "MDU",
    programs: [
      { specialty: "İnformasiya təhlükəsizliyi", form: "əyani" },
    ],
  },
  {
    id: "sdu",
    name: "Sumqayıt Dövlət Universiteti",
    shortName: "SDU",
    programs: [
      { specialty: "İnformasiya təhlükəsizliyi", form: "əyani" },
    ],
  },

  // Dizayn ixtisası olan digər universitetlər
  {
    id: "dra",
    name: "Dövlət Rəssamlıq Akademiyası",
    shortName: "DRA",
    programs: [
      { specialty: "Dizayn", form: "əyani", fee: 3000 },
    ],
  },
  {
    id: "oyu",
    name: "Odlar Yurdu Universiteti",
    shortName: "OYU",
    programs: [
      { specialty: "Dizayn", form: "əyani", fee: 3000 },
    ],
  },
];
