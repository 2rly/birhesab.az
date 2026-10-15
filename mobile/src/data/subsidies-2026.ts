// Aqrar Subsidiya Şurası 2026 — tam əkin və məhsul subsidiyaları
// Mənbə: agro.gov.az (01.09.2025)

export type SubsidyType = "planting" | "product" | "fallow";
export type Unit = "ha" | "ton";

export interface CropEntry {
  id: string;
  group: string;     // optgroup başlığı
  name: string;      // az ad (rəsmi terminologiya)
  rate: number;      // birbaşa AZN/vahid
  unit: Unit;
  type: SubsidyType;
  liberatedEligible?: boolean; // +50% Böyük Qayıdış bonusu üçün uyğunluq
}

// ===========================================
// ƏKİN SUBSIDIYASI (per ha)
// ===========================================
export const plantingSubsidies: CropEntry[] = [
  // ─── Çəltik ───
  { id: "rice-main", group: "Çəltik", name: "Çəltik — əsas əkin", rate: 380, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "rice-second", group: "Çəltik", name: "Çəltik — təkrar əkin", rate: 120, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Qarğıdalı ───
  { id: "corn-lib-mod", group: "Qarğıdalı", name: "Qarğıdalı — əsas, işğaldan azad ərazi, müasir suvarma", rate: 270, unit: "ha", type: "planting" },
  { id: "corn-lib-nomod", group: "Qarğıdalı", name: "Qarğıdalı — əsas, işğaldan azad ərazi, suvarmasız", rate: 50, unit: "ha", type: "planting" },
  { id: "corn-other-mod", group: "Qarğıdalı", name: "Qarğıdalı — əsas, digər ərazi, müasir suvarma", rate: 160, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "corn-other-nomod", group: "Qarğıdalı", name: "Qarğıdalı — əsas, digər ərazi, suvarmasız", rate: 100, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "corn-second", group: "Qarğıdalı", name: "Qarğıdalı — təkrar əkin", rate: 50, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Darı ───
  { id: "millet-main-mod", group: "Darı", name: "Darı — əsas, müasir suvarma", rate: 290, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "millet-main-nomod", group: "Darı", name: "Darı — əsas, suvarmasız", rate: 230, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "millet-second", group: "Darı", name: "Darı — təkrar əkin", rate: 120, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Sorqo ───
  { id: "sorghum-main-mod", group: "Sorqo", name: "Sorqo — əsas, müasir suvarma", rate: 220, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "sorghum-main-nomod", group: "Sorqo", name: "Sorqo — əsas, suvarmasız", rate: 160, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "sorghum-second", group: "Sorqo", name: "Sorqo — təkrar əkin", rate: 120, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Buğda, arpa, çovdar, vələmir, qarabaşaq, noxud, lobya, mərci ───
  { id: "grain-lib-mod", group: "Digər dənli (buğda, arpa, çovdar, lobya və s.)", name: "Buğda/arpa və s. — işğaldan azad, müasir suvarma", rate: 400, unit: "ha", type: "planting" },
  { id: "grain-lib-nomod", group: "Digər dənli (buğda, arpa, çovdar, lobya və s.)", name: "Buğda/arpa və s. — işğaldan azad, suvarmasız", rate: 100, unit: "ha", type: "planting" },
  { id: "grain-other-mod", group: "Digər dənli (buğda, arpa, çovdar, lobya və s.)", name: "Buğda/arpa və s. — digər ərazi, müasir suvarma", rate: 290, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "grain-other-irrig", group: "Digər dənli (buğda, arpa, çovdar, lobya və s.)", name: "Buğda/arpa və s. — digər, suvarılan (suvarmasız)", rate: 230, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "grain-other-dry", group: "Digər dənli (buğda, arpa, çovdar, lobya və s.)", name: "Buğda/arpa və s. — digər, dəmyə", rate: 200, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Yer fındığı ───
  { id: "peanut-mod", group: "Yer fındığı", name: "Yer fındığı — müasir suvarma", rate: 280, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "peanut-nomod", group: "Yer fındığı", name: "Yer fındığı — suvarmasız", rate: 220, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Zəfəran ───
  { id: "saffron", group: "Zəfəran", name: "Zəfəran", rate: 440, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Günəbaxan ───
  { id: "sunflower-main-mod", group: "Günəbaxan", name: "Günəbaxan — əsas, müasir suvarma", rate: 180, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "sunflower-main-nomod", group: "Günəbaxan", name: "Günəbaxan — əsas, suvarmasız", rate: 120, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "sunflower-second", group: "Günəbaxan", name: "Günəbaxan — təkrar əkin", rate: 120, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Kartof ───
  { id: "potato-main-mod", group: "Kartof", name: "Kartof — əsas, müasir suvarma", rate: 360, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "potato-main-nomod", group: "Kartof", name: "Kartof — əsas, suvarmasız", rate: 300, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "potato-second", group: "Kartof", name: "Kartof — təkrar əkin", rate: 120, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Tərəvəz ───
  { id: "veg-main-mod", group: "Tərəvəz", name: "Tərəvəz — əsas, müasir suvarma", rate: 310, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "veg-main-nomod", group: "Tərəvəz", name: "Tərəvəz — əsas, suvarmasız", rate: 250, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "veg-second", group: "Tərəvəz", name: "Tərəvəz — təkrar əkin", rate: 120, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Bostan bitkiləri ───
  { id: "melon-mod", group: "Bostan bitkiləri", name: "Bostan bitkiləri — müasir suvarma", rate: 280, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "melon-nomod", group: "Bostan bitkiləri", name: "Bostan bitkiləri — suvarmasız", rate: 220, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Yonca ───
  { id: "alfalfa-mod", group: "Yonca", name: "Yonca — müasir suvarma", rate: 160, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "alfalfa-nomod", group: "Yonca", name: "Yonca — suvarmasız", rate: 100, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Digər bitkilər (pambıq, tütün, şəkər çuğunduru, soya istisna) ───
  { id: "other-mod", group: "Digər bitkilər", name: "Digər bitkilər (pambıq/tütün/və s. xaric) — müasir suvarma", rate: 190, unit: "ha", type: "planting", liberatedEligible: true },
  { id: "other-nomod", group: "Digər bitkilər", name: "Digər bitkilər (pambıq/tütün/və s. xaric) — suvarmasız", rate: 130, unit: "ha", type: "planting", liberatedEligible: true },

  // ─── Üzüm ───
  { id: "grape-lib-super-tech", group: "Üzüm", name: "Üzüm — super-intensiv texniki, işğaldan azad (2025-2026)", rate: 16500, unit: "ha", type: "planting" },
  { id: "grape-lib-super-table", group: "Üzüm", name: "Üzüm — super-intensiv süfrə, işğaldan azad (2025-2026)", rate: 11000, unit: "ha", type: "planting" },
  { id: "grape-nmr-super", group: "Üzüm", name: "Üzüm — super-intensiv, NMR (2025-2026)", rate: 14700, unit: "ha", type: "planting" },
  { id: "grape-nmr-int", group: "Üzüm", name: "Üzüm — intensiv, NMR (2025-2026)", rate: 12500, unit: "ha", type: "planting" },
  { id: "grape-small-wine", group: "Üzüm", name: "Üzüm — kiçik şərabçılıq, super-intensiv texniki (2025-2026)", rate: 16500, unit: "ha", type: "planting" },
  { id: "grape-other-int", group: "Üzüm", name: "Üzüm — intensiv, digər ərazi (2025-2026)", rate: 8000, unit: "ha", type: "planting" },
  { id: "grape-2021-2025", group: "Üzüm", name: "Üzüm — 2021-2025 arası salınan", rate: 700, unit: "ha", type: "planting" },
  { id: "grape-old-mod", group: "Üzüm", name: "Üzüm — 2021-əvvəl, müasir suvarma", rate: 110, unit: "ha", type: "planting" },
  { id: "grape-old-nomod", group: "Üzüm", name: "Üzüm — 2021-əvvəl, suvarmasız", rate: 50, unit: "ha", type: "planting" },

  // ─── Çay ───
  { id: "tea-new", group: "Çay", name: "Çay — 2025-2026 salınan, müasir suvarma", rate: 12000, unit: "ha", type: "planting" },
  { id: "tea-2019", group: "Çay", name: "Çay — 2019-dan sonra salınan", rate: 800, unit: "ha", type: "planting" },
  { id: "tea-old", group: "Çay", name: "Çay — 2019-əvvəl salınmış", rate: 250, unit: "ha", type: "planting" },

  // ─── İntensiv meyvə bağları (2025-2026 salınan) ───
  { id: "f-hazelnut-mountain", group: "İntensiv meyvə bağları (2025-2026)", name: "Fındıq — dağ/dağətəyi (intensiv)", rate: 3000, unit: "ha", type: "planting" },
  { id: "f-pomegranate-lib", group: "İntensiv meyvə bağları (2025-2026)", name: "Nar — işğaldan azad ərazi (intensiv)", rate: 3700, unit: "ha", type: "planting" },
  { id: "f-pomegranate-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Nar — digər ərazi (intensiv)", rate: 3000, unit: "ha", type: "planting" },
  { id: "f-olive", group: "İntensiv meyvə bağları (2025-2026)", name: "Zeytun (intensiv)", rate: 5600, unit: "ha", type: "planting" },
  { id: "f-lemon", group: "İntensiv meyvə bağları (2025-2026)", name: "Limon və kinkan (intensiv)", rate: 11600, unit: "ha", type: "planting" },
  { id: "f-orange", group: "İntensiv meyvə bağları (2025-2026)", name: "Naringi və portağal (intensiv)", rate: 9600, unit: "ha", type: "planting" },
  { id: "f-peach-nmr", group: "İntensiv meyvə bağları (2025-2026)", name: "Şaftalı/nektarin/ərik — NMR (intensiv)", rate: 5000, unit: "ha", type: "planting" },
  { id: "f-peach-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Şaftalı/nektarin/ərik — digər (intensiv)", rate: 4000, unit: "ha", type: "planting" },
  { id: "f-pistachio-nmr", group: "İntensiv meyvə bağları (2025-2026)", name: "Püstə — NMR (intensiv)", rate: 6300, unit: "ha", type: "planting" },
  { id: "f-pistachio-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Püstə — digər (intensiv)", rate: 4500, unit: "ha", type: "planting" },
  { id: "f-pear-nmr", group: "İntensiv meyvə bağları (2025-2026)", name: "Armud — NMR (intensiv)", rate: 20000, unit: "ha", type: "planting" },
  { id: "f-pear-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Armud — digər (intensiv)", rate: 8000, unit: "ha", type: "planting" },
  { id: "f-apple-nmr", group: "İntensiv meyvə bağları (2025-2026)", name: "Alma — NMR (intensiv)", rate: 21000, unit: "ha", type: "planting" },
  { id: "f-apple-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Alma — digər (intensiv)", rate: 11000, unit: "ha", type: "planting" },
  { id: "f-cherry", group: "İntensiv meyvə bağları (2025-2026)", name: "Gilas (intensiv)", rate: 10000, unit: "ha", type: "planting" },
  { id: "f-persimmon-lib", group: "İntensiv meyvə bağları (2025-2026)", name: "Xurma (xirnik) — işğaldan azad (intensiv)", rate: 3900, unit: "ha", type: "planting" },
  { id: "f-persimmon-nmr", group: "İntensiv meyvə bağları (2025-2026)", name: "Xurma (xirnik) — NMR (intensiv)", rate: 4500, unit: "ha", type: "planting" },
  { id: "f-persimmon-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Xurma (xirnik) — digər (intensiv)", rate: 3000, unit: "ha", type: "planting" },
  { id: "f-almond-nmr", group: "İntensiv meyvə bağları (2025-2026)", name: "Badam — NMR (intensiv)", rate: 7350, unit: "ha", type: "planting" },
  { id: "f-almond-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Badam — digər (intensiv)", rate: 3500, unit: "ha", type: "planting" },
  { id: "f-walnut-nmr", group: "İntensiv meyvə bağları (2025-2026)", name: "Qoz — NMR (intensiv)", rate: 4200, unit: "ha", type: "planting" },
  { id: "f-walnut-other", group: "İntensiv meyvə bağları (2025-2026)", name: "Qoz — digər (intensiv)", rate: 3300, unit: "ha", type: "planting" },

  // ─── Super-intensiv meyvə bağları (2025-2026) ───
  { id: "sf-chestnut-lib", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Şabalıd — işğaldan azad (super-intensiv)", rate: 3250, unit: "ha", type: "planting" },
  { id: "sf-cherry-lib", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Gilas — işğaldan azad (super-intensiv)", rate: 16250, unit: "ha", type: "planting" },
  { id: "sf-peach-lib", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Şaftalı/ərik — işğaldan azad (super-intensiv)", rate: 15500, unit: "ha", type: "planting" },
  { id: "sf-walnut-lib", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Qoz — işğaldan azad (super-intensiv)", rate: 4200, unit: "ha", type: "planting" },
  { id: "sf-hazelnut-lib", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Fındıq — işğaldan azad (super-intensiv)", rate: 4400, unit: "ha", type: "planting" },
  { id: "sf-walnut-nmr", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Qoz — NMR (super-intensiv)", rate: 5600, unit: "ha", type: "planting" },
  { id: "sf-peach-nmr", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Şaftalı/ərik — NMR (super-intensiv)", rate: 24500, unit: "ha", type: "planting" },
  { id: "sf-pear-nmr", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Armud — NMR (super-intensiv)", rate: 25200, unit: "ha", type: "planting" },
  { id: "sf-apple-nmr", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Alma — NMR (super-intensiv)", rate: 32200, unit: "ha", type: "planting" },
  { id: "sf-hazelnut-nmr", group: "Super-intensiv meyvə bağları (2025-2026)", name: "Fındıq — NMR (super-intensiv)", rate: 4400, unit: "ha", type: "planting" },

  // ─── Köhnə meyvə bağları ───
  { id: "of-chestnut-other", group: "Köhnə meyvə bağları", name: "Şabalıd — 2025-2026 digər ərazi", rate: 800, unit: "ha", type: "planting" },
  { id: "of-2021-2025-drip", group: "Köhnə meyvə bağları", name: "2021-2025 salınan, damcı suvarma", rate: 310, unit: "ha", type: "planting" },
  { id: "of-2021-2025-nodrip", group: "Köhnə meyvə bağları", name: "2021-2025 salınan, damcı suvarmasız", rate: 250, unit: "ha", type: "planting" },
  { id: "of-pre-2021-drip", group: "Köhnə meyvə bağları", name: "2021-əvvəl salınan, damcı suvarma", rate: 110, unit: "ha", type: "planting" },
  { id: "of-other", group: "Köhnə meyvə bağları", name: "Digər meyvə bağları", rate: 50, unit: "ha", type: "planting" },

  // ─── Giləmeyvə ───
  { id: "b-kiwi-new", group: "Giləmeyvə", name: "Kivi — 2025-2026 damcı suvarma", rate: 9600, unit: "ha", type: "planting" },
  { id: "b-raspberry-lib", group: "Giləmeyvə", name: "Moruq — işğaldan azad ərazi", rate: 13500, unit: "ha", type: "planting" },
  { id: "b-raspberry-other", group: "Giləmeyvə", name: "Moruq — digər ərazi", rate: 3200, unit: "ha", type: "planting" },
  { id: "b-currant", group: "Giləmeyvə", name: "Qarağat — damcı suvarma", rate: 3200, unit: "ha", type: "planting" },
  { id: "b-blackberry-lib", group: "Giləmeyvə", name: "Böyürtkən — işğaldan azad/NMR", rate: 10400, unit: "ha", type: "planting" },
  { id: "b-blackberry-other", group: "Giləmeyvə", name: "Böyürtkən — digər ərazi", rate: 3200, unit: "ha", type: "planting" },
  { id: "b-blueberry-pot-lib", group: "Giləmeyvə", name: "Qaragilə (mavigilə) — dibçəkdə, işğaldan azad/NMR", rate: 25000, unit: "ha", type: "planting" },
  { id: "b-blueberry-pot-other", group: "Giləmeyvə", name: "Qaragilə (mavigilə) — dibçəkdə, digər ərazi", rate: 20000, unit: "ha", type: "planting" },
  { id: "b-blueberry-soil", group: "Giləmeyvə", name: "Qaragilə (mavigilə) — torpaqda əkilən", rate: 12000, unit: "ha", type: "planting" },
  { id: "b-kiwi-2022", group: "Giləmeyvə", name: "Kivi — 2022-dən sonra digər", rate: 660, unit: "ha", type: "planting" },
  { id: "b-other-mod", group: "Giləmeyvə", name: "Digər giləmeyvə — müasir suvarma", rate: 110, unit: "ha", type: "planting" },
  { id: "b-other-nomod", group: "Giləmeyvə", name: "Digər giləmeyvə — suvarmasız", rate: 50, unit: "ha", type: "planting" },

  // ─── Tarlaqoruyucu zolaqlar ───
  { id: "windbreak", group: "Tarlaqoruyucu zolaqlar", name: "Tarlaqoruyucu zolaq bitkiləri (2025-2026)", rate: 1000, unit: "ha", type: "planting" },
];

// ===========================================
// MƏHSUL SUBSIDIYASI (per ton)
// ===========================================
export const productSubsidies: CropEntry[] = [
  // ─── Pambıq ───
  { id: "p-cotton-mod", group: "Pambıq", name: "Pambıq — müasir suvarma", rate: 215, unit: "ton", type: "product" },
  { id: "p-cotton-nomod", group: "Pambıq", name: "Pambıq — suvarmasız", rate: 200, unit: "ton", type: "product" },

  // ─── Tütün (yaş) ───
  { id: "p-tobacco-virginia-mod", group: "Tütün (yaş)", name: "Tütün — Virciniya, müasir suvarma", rate: 36, unit: "ton", type: "product" },
  { id: "p-tobacco-virginia-nomod", group: "Tütün (yaş)", name: "Tütün — Virciniya, suvarmasız", rate: 34, unit: "ton", type: "product" },
  { id: "p-tobacco-other-mod", group: "Tütün (yaş)", name: "Tütün — digər sortlar, müasir suvarma", rate: 22, unit: "ton", type: "product" },
  { id: "p-tobacco-other-nomod", group: "Tütün (yaş)", name: "Tütün — digər sortlar, suvarmasız", rate: 20, unit: "ton", type: "product" },

  // ─── Şəkər çuğunduru ───
  { id: "p-sugar-mod", group: "Şəkər çuğunduru", name: "Şəkər çuğunduru — müasir suvarma", rate: 19, unit: "ton", type: "product" },
  { id: "p-sugar-nomod", group: "Şəkər çuğunduru", name: "Şəkər çuğunduru — suvarmasız", rate: 18, unit: "ton", type: "product" },

  // ─── Soya ───
  { id: "p-soya-mod", group: "Soya", name: "Soya — müasir suvarma", rate: 120, unit: "ton", type: "product" },
  { id: "p-soya-nomod", group: "Soya", name: "Soya — suvarmasız", rate: 100, unit: "ton", type: "product" },

  // ─── Digər məhsul subsidiyaları ───
  { id: "p-corn", group: "Digər", name: "Qarğıdalı (yağ, nişasta, qlükoza, yem üçün)", rate: 50, unit: "ton", type: "product" },
  { id: "p-sunflower", group: "Digər", name: "Günəbaxan", rate: 50, unit: "ton", type: "product" },
  { id: "p-wheat", group: "Digər", name: "Buğda (ərzaqlıq, Dövlət Ehtiyatları/dəyirman)", rate: 100, unit: "ton", type: "product" },
  { id: "p-pomegranate", group: "Digər", name: "Nar (şirə/konsentrat üçün)", rate: 75, unit: "ton", type: "product" },
  { id: "p-apple", group: "Digər", name: "Alma (şirə/konsentrat üçün)", rate: 50, unit: "ton", type: "product" },
];

// ===========================================
// DİNCƏ QOYULMUŞ TORPAQ (per ha)
// ===========================================
export const fallowSubsidies: CropEntry[] = [
  { id: "fallow-wheat", group: "Dincə qoyulmuş torpaq", name: "Buğda (3 il ardıcıl əkilmiş torpaq, dincə qoyulması)", rate: 220, unit: "ha", type: "fallow" },
  { id: "fallow-barley", group: "Dincə qoyulmuş torpaq", name: "Arpa (3 il ardıcıl əkilmiş torpaq, dincə qoyulması)", rate: 220, unit: "ha", type: "fallow" },
];

export const allCrops: CropEntry[] = [...plantingSubsidies, ...productSubsidies, ...fallowSubsidies];
