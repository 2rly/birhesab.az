"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

// ═══════════════════════════════════════════════
// İnzibati vəzifələr üzrə maaş cədvəli (35 səviyyə × 7 pillə)
// ═══════════════════════════════════════════════
const adminGrid: Record<number, number[]> = {
  1:[13680,14020,14365,14705,15050,15390,15730],
  2:[12725,13045,13360,13680,14000,14315,14635],
  3:[11835,12135,12430,12725,13020,13315,13615],
  4:[11010,11285,11560,11835,12115,12390,12665],
  5:[10245,10500,10755,11010,11265,11525,11780],
  6:[9530,9765,10005,10245,10480,10720,10960],
  7:[8865,9085,9305,9530,9750,9970,10195],
  8:[8245,8450,8660,8865,9070,9275,9485],
  9:[7670,7860,8055,8245,8435,8630,8820],
  10:[7135,7315,7490,7670,7850,8025,8205],
  11:[6635,6805,6970,7135,7300,7465,7635],
  12:[6175,6330,6485,6635,6790,6945,7100],
  13:[5745,5885,6030,6175,6320,6460,6605],
  14:[5340,5475,5610,5745,5875,6010,6145],
  15:[4970,5095,5220,5340,5465,5590,5715],
  16:[4625,4740,4855,4970,5085,5200,5315],
  17:[4300,4410,4515,4625,4730,4840,4945],
  18:[4000,4100,4200,4300,4400,4500,4600],
  19:[3720,3815,3910,4000,4095,4185,4280],
  20:[3460,3550,3635,3720,3810,3895,3980],
  21:[3220,3300,3380,3460,3545,3620,3705],
  22:[2995,3070,3145,3220,3295,3370,3445],
  23:[2785,2855,2925,2995,3065,3135,3205],
  24:[2590,2655,2720,2785,2850,2915,2980],
  25:[2410,2470,2530,2595,2650,2715,2775],
  26:[2245,2300,2355,2410,2470,2525,2580],
  27:[2085,2140,2190,2245,2295,2350,2400],
  28:[1940,1990,2040,2085,2135,2185,2230],
  29:[1805,1850,1895,1940,1985,2030,2075],
  30:[1680,1720,1765,1805,1845,1890,1930],
  31:[1560,1600,1640,1680,1720,1755,1795],
  32:[1455,1490,1525,1560,1600,1635,1670],
  33:[1355,1385,1420,1455,1485,1520,1555],
  34:[1260,1290,1320,1355,1385,1415,1445],
  35:[1170,1200,1230,1260,1285,1315,1345],
};

// Yardımçı vəzifələr (17 səviyyə × 7 pillə)
const supportGrid: Record<number, number[]> = {
  1:[1165,1195,1220,1250,1280,1310,1340],
  2:[1135,1160,1190,1220,1245,1275,1305],
  3:[1105,1130,1160,1185,1215,1240,1270],
  4:[1075,1100,1130,1155,1180,1210,1235],
  5:[1045,1070,1100,1125,1150,1175,1205],
  6:[1020,1045,1070,1095,1120,1145,1170],
  7:[990,1015,1040,1065,1090,1115,1140],
  8:[965,990,1015,1040,1065,1085,1110],
  9:[940,965,985,1010,1035,1060,1080],
  10:[915,940,960,985,1010,1030,1055],
  11:[890,915,935,960,980,1005,1025],
  12:[870,890,910,935,955,975,1000],
  13:[845,865,890,910,930,950,970],
  14:[825,845,865,885,905,925,945],
  15:[800,820,840,860,880,900,920],
  16:[780,800,820,840,860,880,900],
  17:[760,780,800,815,835,855,875],
};

interface Position { name: string; level: number }

const adminOrgs: Record<string, Position[]> = {
  "Prezident Administrasiyası": [
    {name:"Aparatın rəhbəri",level:6},{name:"Aparatın rəhbərinin müavini",level:7},
    {name:"Şöbə müdiri",level:8},{name:"Şöbə müdirinin müavini",level:11},
    {name:"Sektor müdiri, baş mühasib",level:15},{name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},{name:"Aparıcı məsləhətçi",level:18},{name:"Məsləhətçi",level:19},
  ],
  "Nazirlər Kabineti": [
    {name:"Aparatın rəhbəri",level:4},{name:"Aparatın rəhbərinin müavini",level:5},
    {name:"Şöbə müdiri",level:6},{name:"Şöbə müdirinin müavini",level:7},
    {name:"Sektor müdiri",level:9},{name:"Baş məsləhətçi",level:10},
    {name:"Böyük məsləhətçi",level:11},{name:"Aparıcı məsləhətçi",level:12},{name:"Məsləhətçi",level:13},
  ],
  "Nazirlik aparatı": [
    {name:"Aparatın rəhbəri",level:6},{name:"Aparatın rəhbərinin müavini",level:7},
    {name:"Şöbə müdiri",level:8},{name:"Şöbə müdirinin müavini",level:11},
    {name:"Sektor müdiri, baş mühasib",level:15},{name:"Baş məsləhətçi",level:16},
    {name:"Böyük məsləhətçi",level:17},{name:"Aparıcı məsləhətçi",level:18},
    {name:"Məsləhətçi",level:19},{name:"Rəhbərin müşaviri, köməkçisi",level:10},
  ],
  "Milli Məclis aparatı": [
    {name:"Aparatın rəhbəri",level:4},{name:"Aparatın rəhbərinin müavini",level:5},
    {name:"Şöbə müdiri",level:6},{name:"Şöbə müdirinin müavini",level:7},
    {name:"Sektor müdiri",level:9},{name:"Baş məsləhətçi",level:10},
    {name:"Böyük məsləhətçi",level:11},{name:"Aparıcı məsləhətçi",level:12},{name:"Məsləhətçi",level:13},
  ],
  "Bakı Şəhər İcra Hakimiyyəti": [
    {name:"Başçının birinci müavini",level:6},{name:"Başçının müavini",level:7},
    {name:"Aparatın rəhbəri",level:11},{name:"Şöbə müdiri",level:14},
    {name:"Şöbə müdirinin müavini",level:17},{name:"Sektor müdiri, baş mühasib",level:20},
    {name:"Baş məsləhətçi",level:21},{name:"Böyük məsləhətçi",level:22},
    {name:"Aparıcı məsləhətçi",level:23},{name:"Məsləhətçi",level:24},
  ],
  "Yerli icra hakimiyyəti": [
    {name:"Başçının birinci müavini",level:16},{name:"Başçının müavini",level:17},
    {name:"Şöbə müdiri",level:27},{name:"Şöbə müdirinin müavini",level:29},
    {name:"Sektor müdiri, baş mühasib",level:30},{name:"Baş məsləhətçi",level:31},
    {name:"Böyük məsləhətçi",level:32},{name:"Aparıcı məsləhətçi",level:33},{name:"Məsləhətçi",level:34},
  ],
  "Apellyasiya məhkəməsi aparatı": [
    {name:"Aparatın rəhbəri",level:7},{name:"Aparatın rəhbərinin müavini",level:9},
    {name:"Şöbə müdiri",level:11},{name:"Şöbə müdirinin müavini",level:15},
    {name:"Sektor müdiri, baş mühasib",level:19},{name:"Baş məsləhətçi",level:20},
    {name:"Böyük məsləhətçi",level:21},{name:"Aparıcı məsləhətçi",level:22},
    {name:"Məsləhətçi, hakimin köməkçisi",level:23},
  ],
  "Rayon/şəhər məhkəməsi aparatı": [
    {name:"Sektor müdiri, baş mühasib",level:30},{name:"Baş məsləhətçi",level:31},
    {name:"Böyük məsləhətçi",level:32},{name:"Aparıcı məsləhətçi",level:33},
    {name:"Məsləhətçi, məhkəmə iclasının katibi",level:34},
  ],
  "Dövlət agentliyi / xidməti": [
    {name:"Rəhbər",level:7},{name:"Rəhbərin müavini",level:9},
    {name:"Şöbə müdiri",level:16},{name:"Şöbə müdirinin müavini",level:19},
    {name:"Sektor müdiri, baş mühasib",level:21},{name:"Baş məsləhətçi",level:22},
    {name:"Böyük məsləhətçi",level:23},{name:"Aparıcı məsləhətçi",level:24},{name:"Məsləhətçi",level:25},
  ],
};

const supportOrgs: Record<string, Position[]> = {
  "Prezident Administrasiyası": [
    {name:"Baş mütəxəssis",level:1},{name:"Böyük mütəxəssis",level:2},
    {name:"Aparıcı mütəxəssis",level:3},{name:"Mütəxəssis",level:4},
  ],
  "Nazirlər Kabineti": [
    {name:"Baş mütəxəssis",level:2},{name:"Böyük mütəxəssis",level:3},
    {name:"Aparıcı mütəxəssis",level:4},{name:"Mütəxəssis",level:5},
  ],
  "Nazirlik aparatı": [
    {name:"Baş mütəxəssis",level:6},{name:"Böyük mütəxəssis",level:7},
    {name:"Aparıcı mütəxəssis",level:8},{name:"Mütəxəssis",level:9},
  ],
  "Milli Məclis aparatı": [
    {name:"Baş mütəxəssis",level:2},{name:"Böyük mütəxəssis",level:3},
    {name:"Aparıcı mütəxəssis",level:4},{name:"Mütəxəssis",level:5},
  ],
  "Bakı Şəhər İcra Hakimiyyəti": [
    {name:"Baş mütəxəssis",level:10},{name:"Böyük mütəxəssis",level:11},
    {name:"Aparıcı mütəxəssis",level:12},{name:"Mütəxəssis",level:13},
  ],
  "Yerli icra hakimiyyəti": [
    {name:"Baş mütəxəssis",level:14},{name:"Böyük mütəxəssis",level:15},
    {name:"Aparıcı mütəxəssis",level:16},{name:"Mütəxəssis",level:17},
  ],
  "Apellyasiya / Rayon məhkəməsi / Dövlət agentliyi": [
    {name:"Baş mütəxəssis",level:14},{name:"Böyük mütəxəssis",level:15},
    {name:"Aparıcı mütəxəssis",level:16},{name:"Mütəxəssis",level:17},
  ],
};

// ═══════════════════════════════════════════════
// Pillə-staj cədvəli
// ═══════════════════════════════════════════════
const stepInfo = [
  { label: "I", range: "1 ilədək" },
  { label: "II", range: "1–5 il" },
  { label: "III", range: "5–10 il" },
  { label: "IV", range: "10–15 il" },
  { label: "V", range: "15–20 il" },
  { label: "VI", range: "20–25 il" },
  { label: "VII", range: "25+ il" },
];

// ═══════════════════════════════════════════════
// Vergi hesablaması (Dövlət sektoru)
// ═══════════════════════════════════════════════
function calcStateIncomeTax(gross: number): number {
  const taxFree = 200;
  if (gross <= taxFree) return 0;
  const taxable = gross - taxFree;
  const b1 = 2300; // 2500 - 200
  if (taxable <= b1) return taxable * 0.14;
  return b1 * 0.14 + (taxable - b1) * 0.25;
}

function calcStateMedical(gross: number): number {
  if (gross <= 8000) return gross * 0.02;
  return 8000 * 0.02 + (gross - 8000) * 0.005;
}

function calcNet(gross: number) {
  const incomeTax = calcStateIncomeTax(gross);
  const dsmf = gross * 0.03;
  const unemployment = gross * 0.005;
  const medical = calcStateMedical(gross);
  const totalDeductions = incomeTax + dsmf + unemployment + medical;
  return { net: Math.max(0, gross - totalDeductions), incomeTax, dsmf, unemployment, medical, totalDeductions };
}

function formatMoney(n: number): string {
  return n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type JobType = "admin" | "support";

export default function CivilServantSalary() {
  const [jobType, setJobType] = useState<JobType | null>(null);
  const [org, setOrg] = useState("");
  const [posIdx, setPosIdx] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);

  const orgs = jobType === "admin" ? adminOrgs : jobType === "support" ? supportOrgs : null;
  const grid = jobType === "admin" ? adminGrid : supportGrid;
  const positions = orgs && org ? orgs[org] : null;

  const pos = positions && posIdx !== null ? positions[posIdx] : null;
  const gross = pos && step !== null ? grid[pos.level]?.[step] ?? null : null;
  const result = gross !== null ? calcNet(gross) : null;

  function handleJobType(type: JobType) {
    setJobType(type);
    setOrg("");
    setPosIdx(null);
    setStep(null);
  }

  function handleOrg(value: string) {
    setOrg(value);
    setPosIdx(null);
    setStep(null);
  }

  function handlePos(value: string) {
    setPosIdx(value ? parseInt(value) : null);
    setStep(null);
  }

  return (
    <CalculatorLayout
      title="Dövlət qulluqçularının maaş hesablayıcısı"
      description="Qurum, vəzifə və pilləyə uyğun aylıq vəzifə maaşını (gross və net) hesablayın — Prezidentin 19 mart 2026-cı il tarixli Fərmanına əsasən."
      breadcrumbs={[
        { label: "Hüquq və Dövlət", href: "/?category=legal" },
        { label: "Dövlət qulluqçusu maaş hesablayıcısı" },
      ]}
      formulaTitle="Dövlət qulluqçusunun maaşı necə hesablanır? (Yeni qayda 2026)"
      formulaContent={`Prezidentin 19 mart 2026-cı il tarixli Fərmanına əsasən:

1. Vəzifə maaşı cədvəldən müəyyən edilir (səviyyə × pillə)
2. Aylıq vəzifə maaşları tam ədədə (sonuncu rəqəmi 0 və ya 5) yuvarlaqlaşdırılır

Dövlət sektoru üzrə tutulmalar (işçidən):
• Gəlir vergisi:
  0–200₼: 0%
  200–2500₼: (maaş − 200) × 14%
  2500₼+: 322 + (maaş − 2500) × 25%
• DSMF: 3%
• İşsizlik sığortası: 0,5%
• İcbari tibbi sığorta: 8000₼-dək 2%, üstü 0,5%

Net maaş = Gross − Gəlir vergisi − DSMF − İşsizlik − Tibbi sığorta

Pillə sistemi (vəzifədəki staj müddəti):
• I pillə: 1 ilədək staj
• II pillə: 1–5 il staj
• III pillə: 5–10 il staj
• IV pillə: 10–15 il staj
• V pillə: 15–20 il staj
• VI pillə: 20–25 il staj
• VII pillə: 25 ildən yuxarı staj

Qeyd: Pillə həmin vəzifədəki staj müddətinə görə müəyyən edilir.`}
      relatedIds={["salary", "overtime", "vacation-pay"]}
    >
      {/* Vəzifə növü */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Vəzifə növü</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleJobType("admin")}
            className={`p-3 rounded-xl border text-left transition-all ${
              jobType === "admin"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">İnzibati vəzifə</p>
            <p className="text-[11px] text-muted mt-0.5">35 ödəniş səviyyəsi (aparatın rəhbəri, şöbə müdiri, məsləhətçi...)</p>
          </button>
          <button
            onClick={() => handleJobType("support")}
            className={`p-3 rounded-xl border text-left transition-all ${
              jobType === "support"
                ? "border-primary bg-primary-light ring-2 ring-primary"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-medium text-foreground">Yardımçı vəzifə</p>
            <p className="text-[11px] text-muted mt-0.5">17 ödəniş səviyyəsi (mütəxəssis, inspektor, kargüzar...)</p>
          </button>
        </div>
      </div>

      {/* Qurum */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Qurum</label>
        <select
          value={org}
          onChange={(e) => handleOrg(e.target.value)}
          disabled={!orgs}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          <option value="">{orgs ? "Qurum seçin..." : "Əvvəlcə vəzifə növünü seçin"}</option>
          {orgs && Object.keys(orgs).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Vəzifə */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Vəzifə</label>
        <select
          value={posIdx !== null ? String(posIdx) : ""}
          onChange={(e) => handlePos(e.target.value)}
          disabled={!positions}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          <option value="">{positions ? "Vəzifə seçin..." : "Əvvəlcə qurumu seçin"}</option>
          {positions && positions.map((p, i) => (
            <option key={i} value={i}>{p.name} (səviyyə {p.level})</option>
          ))}
        </select>
      </div>

      {/* Ödəniş pilləsi */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">Ödəniş pilləsi</label>
        <div className="flex gap-2">
          {stepInfo.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              disabled={posIdx === null}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                step === i
                  ? "border-primary bg-primary-light ring-2 ring-primary text-primary-dark"
                  : "border-border bg-white hover:border-primary/30 text-foreground"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-2">Pillə vəzifədəki staja görə müəyyən edilir (I: 1 ilədək, II: 1–5 il ... VII: 25+ il).</p>
      </div>

      {/* Pillə-Staj cədvəli */}
      <div className="mb-8 bg-blue-50 rounded-xl border border-blue-200 p-4">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
          <span>&#128197;</span>
          Pillə — Staj müddəti cədvəli
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepInfo.map((s, i) => (
            <div
              key={i}
              className={`rounded-lg border p-2.5 text-center transition-all ${
                step === i
                  ? "border-primary bg-primary-light"
                  : "border-blue-200 bg-white"
              }`}
            >
              <p className={`text-lg font-bold ${step === i ? "text-primary" : "text-foreground"}`}>{s.label} pillə</p>
              <p className="text-xs text-muted">{s.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nəticə */}
      {result && gross !== null && pos ? (
        <div className="space-y-6">
          {/* Əsas kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">Net əmək haqqı (əlinizə çatan)</p>
              <p className="text-3xl font-bold">{formatMoney(result.net)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN / ay</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted mb-1">Gross əmək haqqı</p>
              <p className="text-3xl font-bold text-foreground">{formatMoney(gross)}</p>
              <p className="text-xs text-muted mt-1">AZN / ay</p>
            </div>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Dövlət sektoru — Səviyyə {pos.level}, {stepInfo[step!].label} pillə
            </span>
          </div>

          {/* İşçidən tutulan */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>&#128100;</span>
                İşçidən tutulan
              </h3>
            </div>
            <div className="divide-y divide-border">
              {/* Gəlir vergisi */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">Gəlir vergisi</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.incomeTax)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">200₼-dək 0%, 200–2500₼ arası 14%, 2500₼-dan çox 25%</p>
                {result.incomeTax === 0 ? (
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="text-xs text-green-600">200₼-dək gəlir vergisi tutulmur</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                    {(() => {
                      const taxable = gross - 200;
                      const b1 = 2300;
                      if (taxable <= b1) {
                        return <p className="text-xs text-muted">({gross} − 200) × 14% → {taxable}₼ × 14% = <span className="font-medium text-foreground">{formatMoney(taxable * 0.14)} AZN</span></p>;
                      }
                      return (
                        <>
                          <p className="text-xs text-muted">{b1}₼ × 14% = <span className="font-medium text-foreground">{formatMoney(b1 * 0.14)} AZN</span></p>
                          <p className="text-xs text-muted">{taxable - b1}₼ × 25% = <span className="font-medium text-foreground">{formatMoney((taxable - b1) * 0.25)} AZN</span></p>
                          <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: {formatMoney(result.incomeTax)} AZN</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* DSMF */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">DSMF</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.dsmf)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">Gross məbləğin 3%-i</p>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(gross)}₼ × 3% = <span className="font-medium text-foreground">{formatMoney(result.dsmf)} AZN</span></p>
                </div>
              </div>

              {/* İşsizlik */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">İşsizlik sığortası</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.unemployment)} AZN</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted">{formatMoney(gross)}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney(result.unemployment)} AZN</span></p>
                </div>
              </div>

              {/* İcbari tibbi sığorta */}
              <div className="px-5 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">İcbari tibbi sığorta</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(result.medical)} AZN</span>
                </div>
                <p className="text-[11px] text-muted mb-1.5">8000₼-dək 2%, 8000₼-dan çox 0,5%</p>
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {gross <= 8000 ? (
                    <p className="text-xs text-muted">{formatMoney(gross)}₼ × 2% = <span className="font-medium text-foreground">{formatMoney(result.medical)} AZN</span></p>
                  ) : (
                    <>
                      <p className="text-xs text-muted">8000₼ × 2% = <span className="font-medium text-foreground">{formatMoney(8000 * 0.02)} AZN</span></p>
                      <p className="text-xs text-muted">{gross - 8000}₼ × 0,5% = <span className="font-medium text-foreground">{formatMoney((gross - 8000) * 0.005)} AZN</span></p>
                      <p className="text-xs font-medium text-foreground border-t border-border pt-1">Cəmi: {formatMoney(result.medical)} AZN</p>
                    </>
                  )}
                </div>
              </div>

              {/* Cəmi */}
              <div className="flex justify-between px-5 py-3 bg-red-50">
                <span className="text-sm font-semibold text-red-700">Cəmi tutulma</span>
                <span className="text-sm font-bold text-red-700">{formatMoney(result.totalDeductions)} AZN</span>
              </div>
            </div>
          </div>

          {/* İllik hesablama */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>&#128197;</span>
              İllik hesablama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted mb-1">İllik net gəlir</p>
                <p className="text-lg font-bold text-primary">{formatMoney(result.net * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik gross</p>
                <p className="text-lg font-bold text-foreground">{formatMoney(gross * 12)} AZN</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">İllik tutulma</p>
                <p className="text-lg font-bold text-red-600">{formatMoney(result.totalDeductions * 12)} AZN</p>
              </div>
            </div>
          </div>

          {/* Seçim xülasəsi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">Qurum</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{org}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">Vəzifə növü</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{jobType === "admin" ? "İnzibati" : "Yardımçı"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">Ödəniş səviyyəsi</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">Səviyyə {pos.level}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-border p-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">Pillə</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{stepInfo[step!].label} pillə ({stepInfo[step!].range})</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">&#127970;</span>
          <p>Nəticəni görmək üçün qurum, vəzifə və pilləni seçin.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
