import type { Metadata } from "next";

// BirHesab mobil tətbiqi və saytı üçün məxfilik siyasəti.
// Google Play "Privacy policy" sahəsinə bu səhifənin URL-i yazılır: https://birhesab.az/az/mexfilik
// Mətn mobile/store/privacy-policy.md ilə eynidir — birini dəyişəndə digərini də yeniləyin.

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const title = lang === "az" ? "Məxfilik siyasəti | BirHesab.az" : "Privacy Policy | BirHesab.az";
  return { title, alternates: { canonical: `https://birhesab.az/${lang}/mexfilik` } };
}

const services = [
  {
    name: "Azərbaycan Respublikası Mərkəzi Bankı (cbar.az)",
    purpose: "Valyuta və qiymətli metal məzənnələri",
    data: "Yalnız tarix",
  },
  {
    name: "CoinGecko (api.coingecko.com)",
    purpose: "Kriptovalyuta qiymətləri",
    data: "Heç bir istifadəçi məlumatı",
  },
  {
    name: "Dövlət Gömrük Komitəsi (customs.gov.az)",
    purpose: "Avtomobil və mal idxalı üzrə gömrük ödənişlərinin hesablanması",
    data: "Yalnız daxil etdiyiniz texniki göstəricilər (mühərrik həcmi, il, dəyər, HS kodu)",
  },
  {
    name: "birhesab.az",
    purpose: "Gömrük HS kodları kataloqunun yüklənməsi",
    data: "Heç bir istifadəçi məlumatı",
  },
];

function AzPolicy() {
  return (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-2">Məxfilik siyasəti</h1>
      <p className="text-muted mb-8">Qüvvəyə minmə tarixi: 15 oktyabr 2026 · BirHesab sayt və mobil tətbiq (az.birhesab.app)</p>

      <p className="mb-6">Məxfiliyiniz bizim üçün prioritetdir. Bu sənəd BirHesab-ın hansı məlumatlarla necə işlədiyini izah edir.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Topladığımız məlumatlar</h2>
      <p className="mb-3">BirHesab hesab yaratmağı tələb etmir və sizdən ad, telefon, e-poçt, yer (lokasiya), kontaktlar, fotoşəkil və ya digər şəxsi məlumat toplamır.</p>
      <p className="mb-3">Hesablayıcılara daxil etdiyiniz rəqəmlər (maaş, kredit məbləği, bal, tarix və s.) yalnız cihazınızda emal olunur və serverlərimizə göndərilmir, saxlanılmır.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Xarici xidmətlər (yalnız siz istifadə etdikdə)</h2>
      <p className="mb-3">Bəzi hesablayıcılar aktual məlumat üçün aşağıdakı rəsmi və ictimai xidmətlərə sorğu göndərir. Bu sorğularda şəxsi məlumat göndərilmir:</p>
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-sm border border-border rounded-xl">
          <thead className="bg-background">
            <tr>
              <th className="text-left p-3">Xidmət</th>
              <th className="text-left p-3">Nə üçün</th>
              <th className="text-left p-3">Göndərilən məlumat</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.name} className="border-t border-border">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.purpose}</td>
                <td className="p-3">{s.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mb-3">Bu xidmətlər sorğunu emal edərkən standart texniki məlumatı (məsələn, IP ünvanı) görə bilər; bu, onların öz məxfilik qaydalarına tabedir.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Təklif və iradlar forması</h2>
      <p className="mb-3">Təklif və iradlar formasını könüllü göndərdikdə, mesajınız və (istəyə bağlı) adınız formsubmit.co xidməti vasitəsilə info@birhesab.az ünvanına e-poçt kimi çatdırılır. Bu məlumat yalnız sizə cavab vermək və xidməti yaxşılaşdırmaq üçün istifadə olunur, üçüncü tərəflərə satılmır və ötürülmür.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Reklam, analitika və izləmə</h2>
      <p className="mb-3">Mobil tətbiqdə reklam, analitika və ya izləmə alətləri yoxdur. Sayt Google AdSense reklamlarını göstərə bilər; bu halda Google öz kukilərindən istifadə edə bilər (Google-un reklam siyasətinə tabedir). Məlumatlarınızı satmırıq.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Uşaqlar</h2>
      <p className="mb-3">BirHesab ümumi auditoriya üçündür və 13 yaşdan kiçik uşaqlardan bilərəkdən heç bir şəxsi məlumat toplamır.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Təhlükəsizlik və dəyişikliklər</h2>
      <p className="mb-3">Bütün xarici sorğular şifrələnmiş (HTTPS) bağlantı ilə göndərilir. Siyasət yenilənərsə, yeni versiya bu səhifədə dərc olunacaq və tarix dəyişdiriləcək.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Əlaqə</h2>
      <p className="mb-3">Suallarınız üçün: <a className="text-primary underline" href="mailto:info@birhesab.az">info@birhesab.az</a></p>
    </>
  );
}

function EnPolicy() {
  return (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-muted mb-8">Effective date: 15 October 2026 · BirHesab website and mobile app (az.birhesab.app)</p>
      <ul className="list-disc pl-6 space-y-3">
        <li>BirHesab requires no account and does not collect personal data (name, phone, email, location, contacts, photos).</li>
        <li>Everything you type into calculators is processed on your device only and is never sent to or stored on our servers.</li>
        <li>Some calculators request live data from public services: the Central Bank of Azerbaijan (cbar.az, exchange rates; only a date is sent), CoinGecko (crypto prices; no user data), the State Customs Committee (customs.gov.az, duty calculation; only the technical values you enter) and birhesab.az (customs HS-code catalog; no user data).</li>
        <li>The optional feedback form sends your message and optional name via formsubmit.co to info@birhesab.az, used only to reply and improve the service.</li>
        <li>The mobile app contains no ads, analytics or tracking. The website may show Google AdSense ads, in which case Google may use cookies under its own policies. We never sell data.</li>
        <li>Not directed at children under 13; no data is knowingly collected from them.</li>
        <li>All network requests use HTTPS. Changes will be published here with a new effective date.</li>
        <li>Contact: <a className="text-primary underline" href="mailto:info@birhesab.az">info@birhesab.az</a></li>
      </ul>
    </>
  );
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-foreground leading-relaxed">
      {lang === "az" ? <AzPolicy /> : <EnPolicy />}
    </div>
  );
}
