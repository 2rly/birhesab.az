export type Lang = "az" | "en" | "ru";

const az = {
  // Common/Nav
  home: "Ana səhifə",
  calculators: "Hesablayıcılar",
  about: "Haqqımızda",
  menu: "Menyu",
  calculate: "Hesabla",
  searchPlaceholder: "Hesablayıcı axtar... (məs: əmək haqqı, kredit, IELTS)",
  relatedCalculators: "Əlaqəli hesablayıcılar",

  // Homepage
  heroSubtitle:
    "Bütün hesablamalar bir yerdə — Azərbaycanın ən geniş onlayn hesablayıcı platforması",
  calculatorCount: "{count}+ hesablayıcı",
  azRules: "Azərbaycan qaydaları",
  instantResult: "Ani nəticə",
  mostPopular: "Ən çox istifadə olunanlar",
  allCalculators: "Bütün hesablayıcılar",
  noResults: "Nəticə tapılmadı",
  noResultsMessage:
    "üçün heç bir hesablayıcı tapılmadı. Başqa açar söz yoxlayın.",

  // Footer
  footerDescription:
    "Bütün hesablamalar bir yerdə. Azərbaycanın ən geniş onlayn hesablayıcı platforması.",
  categories: "Kateqoriyalar",
  contact: "Əlaqə",
  contactMessage: "Təklif və iradlarınız üçün bizimlə əlaqə saxlayın.",
  copyright: "BirHesab.az — Bütün hüquqlar qorunur.",

  // Categories
  categoryNames: {
    all: "Hamısı",
    finance: "Maliyyə",
    education: "Təhsil",
    realestate: "Daşınmaz Əmlak",
    automotive: "Avtomobil",
    legal: "Hüquq və Dövlət",
    health: "Sağlamlıq",
    daily: "Gündəlik",
    labor: "Əmək Hüququ",
    nutrition: "Qidalanma",
    religion: "Din",
    metals: "Qiymətli Metallar",
  },

  // Calculator names
  calculatorNames: {
    salary: "Əmək haqqı hesablayıcısı",
    loan: "Kredit hesablayıcısı",
    mortgage: "İpoteka hesablayıcısı",
    deposit: "Depozit hesablayıcısı",
    vat: "ƏDV hesablayıcısı",
    currency: "Valyuta çevirici",
    "deposit-tax": "Depozit vergisi (ÖMV) hesablayıcısı",
    "dividend-tax": "Dividend vergisi hesablayıcısı",
    "freelancer-tax": "Frilansçı vergi hesablayıcısı",
    "rental-income-tax": "Kirayə gəlir vergisi",
    "life-insurance": "Yaşam sığortası hesablayıcısı",
    overtime: "Əlavə iş saatı hesablayıcısı",
    "teacher-salary": "Müəllim maaşı hesablayıcısı",
    inflation: "İnflyasiya korrektoru",
    ielts: "IELTS bal hesablayıcısı",
    toefl: "TOEFL bal hesablayıcısı",
    sat: "SAT bal hesablayıcısı",
    "university-admission": "DİM bal hesablanması",
    gpa: "GPA çevirici",
    "school-grade": "Məktəb qiymət ortalaması",
    "foreign-university": "Xaricdə təhsil şansı",
    "property-tax": "Əmlak alqı-satqı vergisi",
    "rental-tax": "Kirayə vergisi hesablayıcısı",
    "price-per-sqm": "Kvadratmetr qiyməti",
    "utility-bills": "Kommunal xərclər hesablayıcısı",
    "notary-fee": "Notarius xərcləri",
    "car-customs": "Avtomobil gömrük hesablayıcısı",
    "road-tax": "Yol vergisi hesablayıcısı",
    osago: "OSAGO sığorta hesablayıcısı",
    "fuel-cost": "Yanacaq xərci hesablayıcısı",
    "car-loan": "Avtomobil krediti hesablayıcısı",
    "civil-servant-salary": "Dövlət qulluqçusu maaş hesablayıcısı",
    "court-fee": "Məhkəmə rüsumu hesablayıcısı",
    "maternity-leave": "Analıq məzuniyyəti hesablayıcısı",
    "unemployment-benefit": "İşsizlik müavinəti hesablayıcısı",
    "disability-benefit": "Əlillik pensiyası və müavinət kalkulyatoru",
    "customs-duty": "Gömrük rüsumu hesablayıcısı",
    bmi: "BMI hesablayıcısı",
    bmr: "Kalori hesablayıcısı",
    "water-intake": "Su norması hesablayıcısı",
    pregnancy: "Hamiləlik həftə hesablayıcısı",
    "ideal-weight": "İdeal çəki hesablayıcısı",
    discount: "Endirim hesablayıcısı",
    age: "Yaş hesablayıcısı",
    tip: "Bahşiş hesablayıcısı",
    timezone: "Saat qurşağı çevirici",
    "date-difference": "Tarix fərqi hesablayıcısı",
    percentage: "Faiz hesablayıcısı",
    "azn-words": "AZN sözlə yazılış",
    "vacation-pay": "Məzuniyyət pulu hesablayıcısı",
    "paternity-leave": "Atalıq məzuniyyəti hesablayıcısı",
    "teacher-vacation": "Müəllim məzuniyyət haqqı hesablayıcısı",
    aliment: "Aliment hesablayıcısı",
    "sick-leave": "Bülleten (xəstəlik vərəqi) hesablayıcısı",
    "severance-pay": "İşdən çıxma kompensasiyası",
    "business-trip": "Ezamiyyə xərci hesablayıcısı",
    "military-service": "Hərbi xidmət ödənişi hesablayıcısı",
    "food-calorie": "Qida kalori hesablayıcısı",
    ramadan: "Ramazan İmsakiyyəsi",
    zakat: "Fitrə zəkatı hesablayıcısı",
    "gold-silver": "Qiymətli metallar hesablayıcısı",
  },

  // Calculator descriptions
  calculatorDescriptions: {
    salary:
      "Gross-dan net-ə hesablama, gəlir vergisi, DSMF, işsizlik sığortası",
    loan: "Aylıq ödəniş, amortizasiya cədvəli hesablama",
    mortgage: "İpoteka kreditinin aylıq ödənişi və ümumi məbləği",
    deposit: "Sadə və mürəkkəb faiz hesablaması",
    vat: "ƏDV hesablaması (18%, 10%, 5%)",
    currency: "USD, EUR, RUB, TRY, GBP → AZN çevirmə",
    "deposit-tax":
      "Depozit faiz gəlirindən tutulan vergi — V.M. 102.1.22 güzəştləri ilə",
    "dividend-tax": "Dividend gəlirinə 5% vergi hesablaması",
    "freelancer-tax":
      "Fərdi sahibkar və frilansçı üçün vergi hesablaması",
    "rental-income-tax": "Kirayə gəlirindən vergi hesablaması",
    "life-insurance":
      "PAŞA Həyat yığım modeli — sığorta ödənişi, vergi bonusu və investisiya gəliri",
    overtime: "Əlavə iş saatı üçün əmək haqqı hesablaması",
    "teacher-salary":
      "Dərs saatı, kateqoriya, staj və əlavələrə görə müəllim maaşı",
    inflation:
      "Pulunuzun real alıcılıq qüvvəsini hesablayın — rəsmi inflyasiya göstəriciləri əsasında",
    ielts:
      "Listening, Reading, Writing, Speaking → Overall band score",
    toefl: "TOEFL imtahan balının hesablanması",
    sat: "SAT imtahan balının hesablanması",
    "university-admission":
      "DİM imtahan nəticələrinə əsasən qəbul balı hesablayın",
    gpa: "100 ballıq sistemdən 4.0 şkalasına çevirmə",
    "school-grade":
      "Azərbaycan 2-5 qiymətləndirmə sistemi üzrə ortalama",
    "foreign-university": "GPA + IELTS + ölkə → qəbul şansı %",
    "property-tax": "Azərbaycanda əmlak alışında vergi hesablaması",
    "rental-tax": "Kirayə gəlirindən vergi hesablaması",
    "price-per-sqm": "1 m² üçün qiymət hesablaması",
    "utility-bills": "Elektrik, qaz, su — Azərbaycan tarifləri ilə",
    "notary-fee": "Notarius rüsumu hesablaması",
    "car-customs": "Xaricdən avtomobil idxalında gömrük vergisi",
    "road-tax": "İllik yol vergisi hesablaması",
    osago: "İcbari avtomobil sığortası qiyməti",
    "fuel-cost": "Məsafə + sərfiyyat → yanacaq xərci",
    "car-loan": "Avtomobil krediti aylıq ödənişi",
    "civil-servant-salary":
      "Qurum, vəzifə və pilləyə görə dövlət qulluqçusunun maaşı (gross və net)",
    "court-fee": "Məhkəmə rüsumu hesablaması",
    "maternity-leave": "Analıq məzuniyyəti ödənişi hesablaması",
    "unemployment-benefit": "İşsizlik müavinəti məbləğinin hesablanması",
    "disability-benefit":
      "Əlillik qrupuna görə pensiya, müavinət və prezident təqaüdlərinin hesablanması (2025)",
    "customs-duty": "Xaricdən gətirilən mallara gömrük rüsumu",
    bmi: "Bədən kütlə indeksinin hesablanması və təfsiri",
    bmr: "Gündəlik kalori ehtiyacı (BMR) hesablaması",
    "water-intake": "Gündəlik su qəbulu norması",
    pregnancy: "Hamiləlik həftəsinin hesablanması",
    "ideal-weight": "Boy və yaşa görə ideal çəki hesablaması",
    discount: "Endirimli qiymətin hesablanması",
    age: "Dəqiq yaş: il, ay, gün",
    tip: "Bahşiş məbləğinin hesablanması",
    timezone: "Bakı və əsas şəhərlər arasında vaxt fərqi",
    "date-difference": "İki tarix arasında fərq: gün, həftə, ay",
    percentage: "Faiz hesablamaları: artım, azalma, nisbət",
    "azn-words":
      "Məbləği sözlə yazın — müqavilələr və bank sənədləri üçün",
    "vacation-pay":
      "Məzuniyyət ödənişi, gündəlik dərəcə hesablaması",
    "paternity-leave":
      "Atalıq məzuniyyəti haqqının hesablanması (14 təqvim günü)",
    "teacher-vacation":
      "Müəllimlərin əmək məzuniyyəti pulunun hesablanması (56 və ya 42 gün)",
    aliment:
      "Aliment tutulması, uşaq sayına görə faiz, əlinizə çatan maaş",
    "sick-leave":
      "Xəstəlik vərəqi müddətinə görə bülleten pulunun hesablanması",
    "severance-pay":
      "İşdən çıxarkən ödəniləcək kompensasiya məbləği",
    "business-trip":
      "Ezamiyyət gündəlik norması, nəqliyyat və yaşayış xərcləri",
    "military-service":
      "Hərbi xidmətə gedən işçiyə ödəniləcək məbləği hesablayın",
    "food-calorie":
      "Yediklərinizin kalori, protein, karbohidrat və yağ miqdarı",
    ramadan:
      "İmsak, iftar və namaz vaxtları — Azərbaycan şəhərləri üzrə",
    zakat: "Ailə üzvü sayına görə fitrə zəkatı məbləği",
    "gold-silver":
      "Qızıl, gümüş, platin, palladium — əyara görə alış-satış qiymətləri",
  },
};

const en: typeof az = {
  // Common/Nav
  home: "Home",
  calculators: "Calculators",
  about: "About Us",
  menu: "Menu",
  calculate: "Calculate",
  searchPlaceholder: "Search calculator... (e.g: salary, loan, IELTS)",
  relatedCalculators: "Related Calculators",

  // Homepage
  heroSubtitle:
    "All calculations in one place — Azerbaijan's most comprehensive online calculator platform",
  calculatorCount: "{count}+ calculators",
  azRules: "Azerbaijani regulations",
  instantResult: "Instant result",
  mostPopular: "Most Popular",
  allCalculators: "All Calculators",
  noResults: "No results found",
  noResultsMessage:
    "No calculator found. Try another keyword.",

  // Footer
  footerDescription:
    "All calculations in one place. Azerbaijan's most comprehensive online calculator platform.",
  categories: "Categories",
  contact: "Contact",
  contactMessage: "Contact us for suggestions and feedback.",
  copyright: "BirHesab.az — All rights reserved.",

  // Categories
  categoryNames: {
    all: "All",
    finance: "Finance",
    education: "Education",
    realestate: "Real Estate",
    automotive: "Automotive",
    legal: "Legal & Government",
    health: "Health",
    daily: "Daily",
    labor: "Labor Rights",
    nutrition: "Nutrition",
    religion: "Religion",
    metals: "Precious Metals",
  },

  // Calculator names
  calculatorNames: {
    salary: "Salary Calculator",
    loan: "Loan Calculator",
    mortgage: "Mortgage Calculator",
    deposit: "Deposit Calculator",
    vat: "VAT Calculator",
    currency: "Currency Converter",
    "deposit-tax": "Deposit Tax (WHT) Calculator",
    "dividend-tax": "Dividend Tax Calculator",
    "freelancer-tax": "Freelancer Tax Calculator",
    "rental-income-tax": "Rental Income Tax",
    "life-insurance": "Life Insurance Calculator",
    overtime: "Overtime Calculator",
    "teacher-salary": "Teacher Salary Calculator",
    inflation: "Inflation Adjuster",
    ielts: "IELTS Score Calculator",
    toefl: "TOEFL Score Calculator",
    sat: "SAT Score Calculator",
    "university-admission": "University Admission Score",
    gpa: "GPA Converter",
    "school-grade": "School Grade Average",
    "foreign-university": "Study Abroad Chance",
    "property-tax": "Property Sale Tax",
    "rental-tax": "Rental Tax Calculator",
    "price-per-sqm": "Price per Square Meter",
    "utility-bills": "Utility Bills Calculator",
    "notary-fee": "Notary Fees",
    "car-customs": "Car Customs Calculator",
    "road-tax": "Road Tax Calculator",
    osago: "OSAGO Insurance Calculator",
    "fuel-cost": "Fuel Cost Calculator",
    "car-loan": "Car Loan Calculator",
    "civil-servant-salary": "Civil Servant Salary Calculator",
    "court-fee": "Court Fee Calculator",
    "maternity-leave": "Maternity Leave Calculator",
    "unemployment-benefit": "Unemployment Benefit Calculator",
    "disability-benefit": "Disability Pension & Benefit Calculator",
    "customs-duty": "Customs Duty Calculator",
    bmi: "BMI Calculator",
    bmr: "Calorie Calculator",
    "water-intake": "Water Intake Calculator",
    pregnancy: "Pregnancy Week Calculator",
    "ideal-weight": "Ideal Weight Calculator",
    discount: "Discount Calculator",
    age: "Age Calculator",
    tip: "Tip Calculator",
    timezone: "Time Zone Converter",
    "date-difference": "Date Difference Calculator",
    percentage: "Percentage Calculator",
    "azn-words": "AZN in Words",
    "vacation-pay": "Vacation Pay Calculator",
    "paternity-leave": "Paternity Leave Calculator",
    "teacher-vacation": "Teacher Vacation Pay Calculator",
    aliment: "Alimony Calculator",
    "sick-leave": "Sick Leave Calculator",
    "severance-pay": "Severance Pay",
    "business-trip": "Business Trip Expense Calculator",
    "military-service": "Military Service Pay Calculator",
    "food-calorie": "Food Calorie Calculator",
    ramadan: "Ramadan Timetable",
    zakat: "Fitrah Zakat Calculator",
    "gold-silver": "Precious Metals Calculator",
  },

  // Calculator descriptions
  calculatorDescriptions: {
    salary:
      "Gross to net calculation, income tax, social insurance, unemployment insurance",
    loan: "Monthly payment, amortization schedule calculation",
    mortgage: "Monthly mortgage payment and total amount",
    deposit: "Simple and compound interest calculation",
    vat: "VAT calculation (18%, 10%, 5%)",
    currency: "USD, EUR, RUB, TRY, GBP to AZN conversion",
    "deposit-tax":
      "Tax on deposit interest income — with Tax Code 102.1.22 exemptions",
    "dividend-tax": "5% tax calculation on dividend income",
    "freelancer-tax":
      "Tax calculation for individual entrepreneurs and freelancers",
    "rental-income-tax": "Tax calculation on rental income",
    "life-insurance":
      "PASHA Life savings model — insurance payment, tax bonus and investment income",
    overtime: "Overtime pay calculation",
    "teacher-salary":
      "Teacher salary based on class hours, category, experience and bonuses",
    inflation:
      "Calculate the real purchasing power of your money — based on official inflation data",
    ielts:
      "Listening, Reading, Writing, Speaking — Overall band score",
    toefl: "TOEFL exam score calculation",
    sat: "SAT exam score calculation",
    "university-admission":
      "Calculate admission score based on state exam results",
    gpa: "Convert from 100-point system to 4.0 scale",
    "school-grade":
      "Average in Azerbaijan's 2-5 grading system",
    "foreign-university": "GPA + IELTS + country — admission chance %",
    "property-tax": "Tax calculation for property purchase in Azerbaijan",
    "rental-tax": "Tax calculation on rental income",
    "price-per-sqm": "Price calculation per 1 m²",
    "utility-bills": "Electricity, gas, water — with Azerbaijani tariffs",
    "notary-fee": "Notary fee calculation",
    "car-customs": "Customs duty for importing cars from abroad",
    "road-tax": "Annual road tax calculation",
    osago: "Compulsory auto insurance price",
    "fuel-cost": "Distance + consumption — fuel cost",
    "car-loan": "Car loan monthly payment",
    "civil-servant-salary":
      "Civil servant salary by organization, position and grade (gross and net)",
    "court-fee": "Court fee calculation",
    "maternity-leave": "Maternity leave payment calculation",
    "unemployment-benefit": "Unemployment benefit amount calculation",
    "disability-benefit":
      "Pension, benefit and presidential stipend calculation by disability group (2025)",
    "customs-duty": "Customs duty on imported goods",
    bmi: "Body mass index calculation and interpretation",
    bmr: "Daily calorie requirement (BMR) calculation",
    "water-intake": "Daily water intake norm",
    pregnancy: "Pregnancy week calculation",
    "ideal-weight": "Ideal weight calculation by height and age",
    discount: "Discounted price calculation",
    age: "Exact age: years, months, days",
    tip: "Tip amount calculation",
    timezone: "Time difference between Baku and major cities",
    "date-difference": "Difference between two dates: days, weeks, months",
    percentage: "Percentage calculations: increase, decrease, ratio",
    "azn-words":
      "Write amounts in words — for contracts and bank documents",
    "vacation-pay":
      "Vacation payment, daily rate calculation",
    "paternity-leave":
      "Paternity leave pay calculation (14 calendar days)",
    "teacher-vacation":
      "Teacher vacation pay calculation (56 or 42 days)",
    aliment:
      "Alimony deduction, percentage by number of children, take-home pay",
    "sick-leave":
      "Sick leave payment calculation based on duration",
    "severance-pay":
      "Compensation amount upon termination",
    "business-trip":
      "Business trip daily allowance, transport and accommodation expenses",
    "military-service":
      "Calculate payment for employee going on military service",
    "food-calorie":
      "Calories, protein, carbs and fat content of your food",
    ramadan:
      "Imsak, iftar and prayer times — by Azerbaijani cities",
    zakat: "Fitrah zakat amount by number of family members",
    "gold-silver":
      "Gold, silver, platinum, palladium — buy/sell prices by purity",
  },
};

const ru: typeof az = {
  // Common/Nav
  home: "Главная",
  calculators: "Калькуляторы",
  about: "О нас",
  menu: "Меню",
  calculate: "Рассчитать",
  searchPlaceholder:
    "Поиск калькулятора... (напр: зарплата, кредит, IELTS)",
  relatedCalculators: "Похожие калькуляторы",

  // Homepage
  heroSubtitle:
    "Все расчёты в одном месте — самая полная онлайн-платформа калькуляторов Азербайджана",
  calculatorCount: "{count}+ калькуляторов",
  azRules: "Правила Азербайджана",
  instantResult: "Мгновенный результат",
  mostPopular: "Самые популярные",
  allCalculators: "Все калькуляторы",
  noResults: "Результатов не найдено",
  noResultsMessage:
    "Калькулятор не найден. Попробуйте другое ключевое слово.",

  // Footer
  footerDescription:
    "Все расчёты в одном месте. Самая полная онлайн-платформа калькуляторов Азербайджана.",
  categories: "Категории",
  contact: "Контакты",
  contactMessage: "Свяжитесь с нами для предложений и замечаний.",
  copyright: "BirHesab.az — Все права защищены.",

  // Categories
  categoryNames: {
    all: "Все",
    finance: "Финансы",
    education: "Образование",
    realestate: "Недвижимость",
    automotive: "Автомобиль",
    legal: "Право и Государство",
    health: "Здоровье",
    daily: "Ежедневное",
    labor: "Трудовое Право",
    nutrition: "Питание",
    religion: "Религия",
    metals: "Драгоценные Металлы",
  },

  // Calculator names
  calculatorNames: {
    salary: "Калькулятор зарплаты",
    loan: "Кредитный калькулятор",
    mortgage: "Ипотечный калькулятор",
    deposit: "Депозитный калькулятор",
    vat: "Калькулятор НДС",
    currency: "Конвертер валют",
    "deposit-tax": "Калькулятор налога на депозит (НПД)",
    "dividend-tax": "Калькулятор налога на дивиденды",
    "freelancer-tax": "Налоговый калькулятор для фрилансеров",
    "rental-income-tax": "Налог на доход от аренды",
    "life-insurance": "Калькулятор страхования жизни",
    overtime: "Калькулятор сверхурочных",
    "teacher-salary": "Калькулятор зарплаты учителя",
    inflation: "Корректор инфляции",
    ielts: "Калькулятор баллов IELTS",
    toefl: "Калькулятор баллов TOEFL",
    sat: "Калькулятор баллов SAT",
    "university-admission": "Расчёт баллов для поступления",
    gpa: "Конвертер GPA",
    "school-grade": "Средний балл школы",
    "foreign-university": "Шансы на обучение за рубежом",
    "property-tax": "Налог на куплю-продажу недвижимости",
    "rental-tax": "Калькулятор налога на аренду",
    "price-per-sqm": "Цена за квадратный метр",
    "utility-bills": "Калькулятор коммунальных расходов",
    "notary-fee": "Нотариальные расходы",
    "car-customs": "Таможенный калькулятор для автомобилей",
    "road-tax": "Калькулятор дорожного налога",
    osago: "Калькулятор ОСАГО",
    "fuel-cost": "Калькулятор расхода топлива",
    "car-loan": "Калькулятор автокредита",
    "civil-servant-salary": "Калькулятор зарплаты госслужащего",
    "court-fee": "Калькулятор судебных пошлин",
    "maternity-leave": "Калькулятор декретного отпуска",
    "unemployment-benefit": "Калькулятор пособия по безработице",
    "disability-benefit": "Калькулятор пенсии и пособий по инвалидности",
    "customs-duty": "Калькулятор таможенных пошлин",
    bmi: "Калькулятор ИМТ",
    bmr: "Калькулятор калорий",
    "water-intake": "Калькулятор нормы воды",
    pregnancy: "Калькулятор недель беременности",
    "ideal-weight": "Калькулятор идеального веса",
    discount: "Калькулятор скидок",
    age: "Калькулятор возраста",
    tip: "Калькулятор чаевых",
    timezone: "Конвертер часовых поясов",
    "date-difference": "Калькулятор разницы дат",
    percentage: "Калькулятор процентов",
    "azn-words": "AZN прописью",
    "vacation-pay": "Калькулятор отпускных",
    "paternity-leave": "Калькулятор отцовского отпуска",
    "teacher-vacation": "Калькулятор отпускных учителя",
    aliment: "Калькулятор алиментов",
    "sick-leave": "Калькулятор больничного листа",
    "severance-pay": "Компенсация при увольнении",
    "business-trip": "Калькулятор командировочных расходов",
    "military-service": "Калькулятор выплат за военную службу",
    "food-calorie": "Калькулятор калорийности продуктов",
    ramadan: "Расписание Рамадана",
    zakat: "Калькулятор фитр-закята",
    "gold-silver": "Калькулятор драгоценных металлов",
  },

  // Calculator descriptions
  calculatorDescriptions: {
    salary:
      "Расчёт от брутто к нетто, подоходный налог, соцстрахование, страхование от безработицы",
    loan: "Расчёт ежемесячного платежа, график амортизации",
    mortgage: "Ежемесячный ипотечный платёж и общая сумма",
    deposit: "Расчёт простых и сложных процентов",
    vat: "Расчёт НДС (18%, 10%, 5%)",
    currency: "Конвертация USD, EUR, RUB, TRY, GBP в AZN",
    "deposit-tax":
      "Налог на процентный доход от депозита — с льготами по НК 102.1.22",
    "dividend-tax": "Расчёт 5% налога на дивидендный доход",
    "freelancer-tax":
      "Расчёт налогов для индивидуальных предпринимателей и фрилансеров",
    "rental-income-tax": "Расчёт налога на доход от аренды",
    "life-insurance":
      "Накопительная модель PASHA Life — страховой взнос, налоговый бонус и инвестиционный доход",
    overtime: "Расчёт оплаты сверхурочных часов",
    "teacher-salary":
      "Зарплата учителя по часам, категории, стажу и надбавкам",
    inflation:
      "Рассчитайте реальную покупательную способность ваших денег — на основе официальных данных инфляции",
    ielts:
      "Listening, Reading, Writing, Speaking — Overall band score",
    toefl: "Расчёт балла экзамена TOEFL",
    sat: "Расчёт балла экзамена SAT",
    "university-admission":
      "Расчёт проходного балла по результатам госэкзамена",
    gpa: "Перевод из 100-балльной системы в шкалу 4.0",
    "school-grade":
      "Средний балл по системе оценивания 2-5 Азербайджана",
    "foreign-university": "GPA + IELTS + страна — шанс поступления %",
    "property-tax":
      "Расчёт налога при покупке недвижимости в Азербайджане",
    "rental-tax": "Расчёт налога на доход от аренды",
    "price-per-sqm": "Расчёт цены за 1 м²",
    "utility-bills":
      "Электричество, газ, вода — по тарифам Азербайджана",
    "notary-fee": "Расчёт нотариальных пошлин",
    "car-customs":
      "Таможенная пошлина на импорт автомобилей из-за рубежа",
    "road-tax": "Расчёт годового дорожного налога",
    osago: "Стоимость обязательного автострахования",
    "fuel-cost": "Расстояние + расход — стоимость топлива",
    "car-loan": "Ежемесячный платёж по автокредиту",
    "civil-servant-salary":
      "Зарплата госслужащего по организации, должности и разряду (брутто и нетто)",
    "court-fee": "Расчёт судебных пошлин",
    "maternity-leave": "Расчёт выплат по декретному отпуску",
    "unemployment-benefit": "Расчёт суммы пособия по безработице",
    "disability-benefit":
      "Расчёт пенсии, пособий и президентской стипендии по группе инвалидности (2025)",
    "customs-duty": "Таможенная пошлина на импортные товары",
    bmi: "Расчёт и интерпретация индекса массы тела",
    bmr: "Расчёт суточной потребности в калориях (BMR)",
    "water-intake": "Суточная норма потребления воды",
    pregnancy: "Расчёт недели беременности",
    "ideal-weight": "Расчёт идеального веса по росту и возрасту",
    discount: "Расчёт цены со скидкой",
    age: "Точный возраст: годы, месяцы, дни",
    tip: "Расчёт суммы чаевых",
    timezone: "Разница во времени между Баку и основными городами",
    "date-difference": "Разница между двумя датами: дни, недели, месяцы",
    percentage: "Расчёт процентов: рост, снижение, соотношение",
    "azn-words":
      "Сумма прописью — для договоров и банковских документов",
    "vacation-pay":
      "Расчёт отпускных, дневной ставки",
    "paternity-leave":
      "Расчёт оплаты отцовского отпуска (14 календарных дней)",
    "teacher-vacation":
      "Расчёт отпускных учителя (56 или 42 дня)",
    aliment:
      "Удержание алиментов, процент по количеству детей, зарплата на руки",
    "sick-leave":
      "Расчёт оплаты больничного листа по сроку",
    "severance-pay":
      "Сумма компенсации при увольнении",
    "business-trip":
      "Суточные нормы командировки, транспортные и жилищные расходы",
    "military-service":
      "Расчёт выплат работнику, уходящему на военную службу",
    "food-calorie":
      "Калории, белки, углеводы и жиры в вашей еде",
    ramadan:
      "Имсак, ифтар и время намаза — по городам Азербайджана",
    zakat: "Сумма фитр-закята по количеству членов семьи",
    "gold-silver":
      "Золото, серебро, платина, палладий — цены покупки/продажи по пробе",
  },
};

export const translations: Record<Lang, typeof az> = { az, en, ru };
