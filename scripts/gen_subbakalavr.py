# -*- coding: utf-8 -*-
# Generate subbakalavr data files for groups 1,2,4,5 and patch interfaces to add `tag`.
import re, io, os

def esc(s): return s.replace('"','\\"')
def num(x):
    f=float(x); return str(int(f)) if f==int(f) else str(f)

def patch_tag(path):
    src=open(path,encoding="utf-8").read()
    if "tag?: string" in src: return
    # insert before the first closing brace after the interface decl
    i=src.find("export interface AdmissionEntry")
    j=src.find("}", i)
    src=src[:j]+"  /** Altqrup süzgəci üçün etiket (məs. \"subbakalavr\") */\n  tag?: string;\n"+src[j:]
    open(path,"w",encoding="utf-8").write(src)

for g in (1,2,4,5):
    patch_tag(f"src/data/admissions-group{g}-2026.ts")

# ---- score parsers ----
DASH={'-','–','—',''}
def two(a,b):
    a=a.strip(); b=b.strip()
    pa=None if a in DASH else float(a); pb=None if b in DASH else float(b)
    if pa is not None: return pa, pb
    if pb is not None: return pb, None
    return None

def write_file(path, varname, type_src, header, rows_ts, n):
    out=[f'import type {{ AdmissionEntry }} from "{type_src}";','',header,
         f'export const {varname}: AdmissionEntry[] = [']
    out+=rows_ts
    out+=['];','']
    open(path,"w",encoding="utf-8").write("\n".join(out))
    print(varname,"entries:",n)

# ===================== GROUP 1 (score (stateScore), stream Ə) =====================
G1=[
("Bakı Dövlət Universiteti",[("Kompüter elmləri / Riyaziyyat bloku","51","63.1"),("Geologiya və geofizika mühəndisliyi","51","63"),("Geomatika və geodeziya mühəndisliyi","51","60.8"),("Mədən mühəndisliyi","70.7","71.2"),("Riyaziyyat və informatika müəllimliyi (Qazax filialı)","51","86.3")]),
("Azərbaycan Dövlət Neft və Sənaye Universiteti",[("Geologiya və geofizika mühəndisliyi","51","62.3"),("Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi","51","66.2"),("Maşın mühəndisliyi","51","64"),("Materiallar mühəndisliyi","51","-"),("Mexanika mühəndisliyi","51","58.4"),("Mədən mühəndisliyi","74.9","74.9"),("Radiotexnika və telekommunikasiya mühəndisliyi","51","83.5"),("Sənaye mühəndisliyi","51","-")]),
("Azərbaycan Texniki Universiteti",[("Cihaz mühəndisliyi","77.7","77.7"),("Energetika mühəndisliyi","51","62"),("Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi","51","69.1"),("Maşın mühəndisliyi","51","73"),("Maşın mühəndisliyi","-","59.4"),("Mexanika mühəndisliyi","66.6","66.7"),("Metallurgiya mühəndisliyi","51","64.9"),("Mədən mühəndisliyi","51","59.4"),("Nəqliyyat mühəndisliyi","86","86"),("Radiotexnika və telekommunikasiya mühəndisliyi","86.2","86.2")]),
("Azərbaycan Memarlıq və İnşaat Universiteti",[("Geomatika və geodeziya mühəndisliyi","73.8","73.8"),("Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi","80.4","80.4"),("İnşaat mühəndisliyi","70.3","-"),("Kommunikasiya sistemləri mühəndisliyi","77.4","78.2"),("Kommunikasiya sistemləri mühəndisliyi","87.3","87.3"),("Maşın mühəndisliyi","70","70"),("Materiallar mühəndisliyi","51","56.7"),("Mexanika mühəndisliyi","74.1","75.2"),("Neft-qaz mühəndisliyi","91.1","-"),("Nəqliyyat mühəndisliyi","85.6","85.6"),("Nəqliyyat tikintisi mühəndisliyi","51","64.3"),("Sənaye mühəndisliyi","66.8","-")]),
("Azərbaycan Dövlət Pedaqoji Universiteti",[("Riyaziyyat və informatika müəllimliyi (Şamaxı filialı)","51","85.7"),("İnformatika müəllimliyi (Şəki filialı)","51","-"),("Riyaziyyat və informatika müəllimliyi (Şəki filialı)","51","-"),("Riyaziyyat və informatika müəllimliyi (Ağcabədi filialı)","51","82.5")]),
("Azərbaycan Dövlət İqtisad Universiteti",[("Maşın mühəndisliyi","77.9","77.9"),("Materiallar mühəndisliyi","51","63.2"),("İnformasiya texnologiyaları (Zaqatala filialı)","83.7","86.9")]),
("Bakı Mühəndislik Universiteti",[("Elektrik və elektronika mühəndisliyi","87.1","87.1"),("Energetika mühəndisliyi","82.2","82.2"),("İnşaat mühəndisliyi","70.9","-"),("Kommunikasiya sistemləri mühəndisliyi","74.8","79.5"),("Qida mühəndisliyi","87.8","-"),("Logistika və nəqliyyat texnologiyaları","80.8","-"),("Maşın mühəndisliyi","51","63.1"),("Mexanika mühəndisliyi","70.7","70.7"),("Memarlıq","51","-"),("Nəqliyyat mühəndisliyi","84.8","84.8"),("Nəqliyyat tikintisi mühəndisliyi","51","67.2"),("Radiotexnika və telekommunikasiya mühəndisliyi","83","83"),("Sənaye mühəndisliyi","51","-")]),
("Azərbaycan Turizm və Menecment Universiteti",[("Qida mühəndisliyi","86","-")]),
("Azərbaycan Dövlət Dəniz Akademiyası",[("Dəniz naviqasiyası mühəndisliyi (Qiyabi)","67.8","-"),("Gəmi energetik qurğularının istismarı (Əyani)","77.6","-"),("Gəmi energetik qurğularının istismarı (Qiyabi)","71.2","-"),("Gəmiqayırma və gəmi təmiri mühəndisliyi","64.9","64.9")]),
("Naxçıvan Dövlət Universiteti",[("Riyaziyyat və informatika müəllimliyi","51","-"),("Elektrik və elektronika mühəndisliyi","75.1","91.1"),("Energetika mühəndisliyi","76.7","77"),("Kompüter mühəndisliyi","84.1","96.5"),("Memarlıq","51","-"),("Nəqliyyat mühəndisliyi","81.5","81.5"),("Proseslərin avtomatlaşdırılması mühəndisliyi","75.6","87.8")]),
("Naxçıvan Müəllimlər İnstitutu",[("Riyaziyyat və informatika müəllimliyi","51","-")]),
("Azərbaycan Dövlət Aqrar Universiteti",[("Elektrik və elektronika mühəndisliyi","84.7","87.2"),("Energetika mühəndisliyi","85.8","85.8"),("Həyat fəaliyyətinin təhlükəsizliyi mühəndisliyi","72.8","72.8"),("İnformasiya texnologiyaları","86.7","86.7"),("Kompüter mühəndisliyi","83.5","97.5"),("Qida mühəndisliyi","83.9","-"),("Logistika və nəqliyyat texnologiyaları mühəndisliyi","81.8","-"),("Maşın mühəndisliyi","73.3","73.3")]),
("Gəncə Dövlət Universiteti",[("İnformatika müəllimliyi","68.4","-"),("Kimya mühəndisliyi","67.2","-"),("Maşın mühəndisliyi","59.3","59.3")]),
("Azərbaycan Texnologiya Universiteti",[("Elektrik və elektronika mühəndisliyi","79.9","87.5"),("Həyat fəaliyyətinin təhlükəsizliyi","62.1","65.8"),("İnformasiya texnologiyaları","82.5","86.7"),("İnformasiya təhlükəsizliyi","80.8","-"),("Kompüter mühəndisliyi","78.4","-"),("Qida mühəndisliyi","75.5","-"),("Logistika və nəqliyyat texnologiyaları","76.9","-"),("Maşın mühəndisliyi","51","67.5"),("Metallurgiya mühəndisliyi","51","65.5"),("Nəqliyyat mühəndisliyi","83.5","83.5"),("Proseslərin avtomatlaşdırılması","78.3","86.6"),("Radiotexnika və telekommunikasiya","75.9","82.6"),("Sənaye mühəndisliyi","51","-")]),
("Sumqayıt Dövlət Universiteti",[("İnformatika müəllimliyi","73.8","-"),("Riyaziyyat və informatika müəllimliyi","84.1","84.1"),("Elektrik və elektronika mühəndisliyi","78.8","87.2"),("Energetika mühəndisliyi","81.2","81.2"),("Kimya mühəndisliyi","72.6","-"),("Logistika və nəqliyyat texnologiyaları","81.1","-"),("Mexanika mühəndisliyi","69.7","69.7"),("Mexatronika və robototexnika","51","-"),("Neft-qaz mühəndisliyi","83.4","-"),("Proseslərin avtomatlaşdırılması","93.6","93.7")]),
("Mingəçevir Dövlət Universiteti",[("İnformatika müəllimliyi","51","-"),("Riyaziyyat və informatika müəllimliyi","51","81.5"),("Kompüter elmləri","76.1","76.6"),("Elektrik və elektronika mühəndisliyi","78.5","88.7"),("Energetika mühəndisliyi","79.7","79.7"),("Həyat fəaliyyətinin təhlükəsizliyi","51","67.2"),("İnformasiya texnologiyaları","78.3","86.7"),("İnformasiya təhlükəsizliyi","80.2","-"),("Kompüter mühəndisliyi","78.9","98.2"),("Nəqliyyat mühəndisliyi","82.8","82.8")]),
("Lənkəran Dövlət Universiteti",[("Riyaziyyat və informatika müəllimliyi","51","81.2"),("İnformasiya texnologiyaları","78.1","87.5"),("İnformasiya təhlükəsizliyi","79.2","-"),("Kompüter mühəndisliyi","80.8","-"),("Qida mühəndisliyi","74.4","-")]),
("Azərbaycan Kooperasiya Universiteti",[("Kompüter mühəndisliyi","93","96.5"),("Qida mühəndisliyi","84.1","-")]),
('"Azərbaycan" Universiteti',[("İnformasiya təhlükəsizliyi","93.6","-")]),
("Qərbi Kaspi Universiteti",[("Kompüter elmləri (tədris ingilis dilində)","73.8","74.6"),("Cihaz mühəndisliyi","69.9","69.9"),("İnformasiya texnologiyaları (tədris ingilis dilində)","96.9","96.9"),("İnformasiya təhlükəsizliyi (tədris ingilis dilində)","81.4","-"),("İnformasiya təhlükəsizliyi","87.3","-"),("Qida mühəndisliyi","73","-")]),
("Xəzər Universiteti",[("Riyaziyyat və informatika müəllimliyi","73.5","88.4"),("Elektrik və elektronika mühəndisliyi (tədris ingilis dilində)","71.7","-"),("İnşaat mühəndisliyi (tədris ingilis dilində)","51","-"),("Kimya mühəndisliyi (tədris ingilis dilində)","90","-"),("Mexanika mühəndisliyi (tədris ingilis dilində)","63.5","66.3"),("Memarlıq (tədris ingilis dilində)","51","-"),("Neft-qaz mühəndisliyi (tədris ingilis dilində)","51","-"),("Radiotexnika və telekommunikasiya mühəndisliyi (tədris ingilis dilində)","71","83.8")]),
("Bakı Qızlar Universiteti",[("Riyaziyyat və informatika müəllimliyi","67.2","83")]),
('"Odlar Yurdu" Universiteti',[("İnformasiya təhlükəsizliyi","98.5","-"),("Kompüter mühəndisliyi (tədris ingilis dilində)","99","99")]),
("Bakı Biznes Universiteti",[("İnformasiya təhlükəsizliyi","90.2","-")]),
]
rows=[]; n=0
for uni,items in G1:
    rows.append(f"  // {uni}")
    for spec,a,b in items:
        r=two(a,b)
        if r is None: continue
        sc,st=r
        line=f'  {{ university: "{esc(uni)}", specialty: "{esc(spec)}", stream: "Ə", score: {num(sc)}'
        if st is not None: line+=f", stateScore: {num(st)}"
        line+=', tag: "subbakalavr" },'
        rows.append(line); n+=1
write_file("src/data/admissions-group1-subbakalavr-2026.ts","admissionsGroup1Sub","./admissions-group1-2026",
           "// 1-ci qrup — subbakalavr keçid balları 2026 (0-100 şkala)", rows, n)

# ===================== GROUP 2 (stream + score, no state) =====================
G2=[
("Azərbaycan Memarlıq və İnşaat Universiteti",[("İqtisadiyyat (Qiyabi)","Q","96.9"),("Menecment (Qiyabi)","Q","96.3")]),
("Azərbaycan Dövlət İqtisad Universiteti",[("Beynəlxalq ticarət və logistika (Qiyabi)","Q","77.8"),("Dövlət və bələdiyyə idarəetməsi (Qiyabi)","Q","90.8"),("İqtisadiyyat (Qiyabi)","Q","99"),("Menecment (Qiyabi)","Q","97.1"),("Mühasibat (Qiyabi)","Q","97.9"),("Dövlət və bələdiyyə idarəetməsi (Zaqatala filialı)","Ə","68.2"),("İqtisadiyyat (Zaqatala filialı)","Ə","74.4"),("Maliyyə (Zaqatala filialı)","Ə","72.5"),("Menecment (Zaqatala filialı)","Ə","71.7"),("Mühasibat (Zaqatala filialı)","Ə","70.4")]),
("Bakı Mühəndislik Universiteti",[("Beynəlxalq ticarət və logistika (Qiyabi)","Q","68.2"),("Dövlət və bələdiyyə idarəetməsi (Qiyabi)","Q","86.2"),("İqtisadiyyat (Qiyabi)","Q","94"),("Maliyyə (Qiyabi)","Q","94.7"),("Mühasibat (Əyani)","Ə","95.3"),("Mühasibat (Qiyabi)","Q","93.5"),("Nəqliyyatda servis (Əyani)","Ə","80.4"),("Nəqliyyatda servis (Qiyabi)","Q","81.9")]),
("Azərbaycan Turizm və Menecment Universiteti",[("Menecment (Əyani)","Ə","96.9")]),
("Azərbaycan İdman Akademiyası",[("İdman menecmenti və kommunikasiya (Əyani)","Ə","91.3"),("İdman menecmenti və kommunikasiya (Qiyabi)","Q","92.5")]),
("Naxçıvan Dövlət Universiteti",[("Mühasibat (Qiyabi)","Q","97.1")]),
("Azərbaycan Dövlət Aqrar Universiteti",[("İqtisadiyyat (Qiyabi)","Q","89.7"),("Maliyyə (Qiyabi)","Q","88.9"),("Menecment (Əyani)","Ə","78.3"),("Mühasibat (Əyani)","Ə","82"),("Mühasibat (Qiyabi)","Q","88.7")]),
("Gəncə Dövlət Universiteti",[("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","77.8"),("İqtisadiyyat (Əyani)","Ə","85.2"),("İqtisadiyyat (Qiyabi)","Q","91.6"),("Maliyyə (Əyani)","Ə","85.7"),("Menecment (Əyani)","Ə","82.4"),("Mühasibat (Əyani)","Ə","82.9")]),
("Azərbaycan Texnologiya Universiteti",[("Beynəlxalq ticarət və logistika (Əyani)","Ə","51"),("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","72.9"),("Dövlət və bələdiyyə idarəetməsi (Qiyabi)","Q","83.9"),("İqtisadiyyat (Əyani)","Ə","84.1"),("İqtisadiyyat (Qiyabi)","Q","90.1"),("Menecment (Əyani)","Ə","77.4"),("Mühasibat (Əyani)","Ə","78.7"),("Mühasibat (Qiyabi)","Q","89.8"),("Nəqliyyatda servis (Əyani)","Ə","74.3")]),
("Sumqayıt Dövlət Universiteti",[("Beynəlxalq ticarət və logistika (Əyani)","Ə","56.5"),("Beynəlxalq ticarət və logistika (Qiyabi)","Q","70.8"),("İqtisadiyyat (Qiyabi)","Q","93.7"),("Maliyyə (Qiyabi)","Q","93.2"),("Menecment (Əyani)","Ə","90.6"),("Menecment (Qiyabi)","Q","91.8"),("Mühasibat (Əyani)","Ə","92.1"),("Mühasibat (Qiyabi)","Q","92.3")]),
("Mingəçevir Dövlət Universiteti",[("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","70.6"),("Dövlət və bələdiyyə idarəetməsi (Qiyabi)","Q","84.3"),("İqtisadiyyat (Əyani)","Ə","80.7"),("İqtisadiyyat (Qiyabi)","Q","91.8"),("Maliyyə (Əyani)","Ə","82"),("Maliyyə (Qiyabi)","Q","89.6"),("Menecment (Əyani)","Ə","75.3"),("Menecment (Qiyabi)","Q","88.2"),("Mühasibat (Əyani)","Ə","75.5"),("Mühasibat (Qiyabi)","Q","88.8")]),
("Lənkəran Dövlət Universiteti",[("İqtisadiyyat (Əyani)","Ə","72.8"),("İqtisadiyyat (Qiyabi)","Q","88.7"),("Maliyyə (Əyani)","Ə","71.6"),("Maliyyə (Qiyabi)","Q","88"),("Menecment (Əyani)","Ə","69.7"),("Menecment (Qiyabi)","Q","87.5"),("Mühasibat (Əyani)","Ə","69.3"),("Mühasibat (Qiyabi)","Q","87.2")]),
("Azərbaycan Kooperasiya Universiteti",[("Beynəlxalq ticarət və logistika (Əyani)","Ə","51"),("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","74.6"),("Dövlət və bələdiyyə idarəetməsi (Qiyabi)","Q","85.7"),("İqtisadiyyat (Əyani)","Ə","79"),("İqtisadiyyat (Qiyabi)","Q","90.9"),("Maliyyə (Əyani)","Ə","76.7"),("Maliyyə (Qiyabi)","Q","92"),("Menecment (Əyani)","Ə","80.9"),("Menecment (Qiyabi)","Q","91.6"),("Mühasibat (Əyani)","Ə","79.4"),("Mühasibat (Qiyabi)","Q","91.6")]),
('"Azərbaycan" Universiteti',[("Beynəlxalq ticarət və logistika (Əyani)","Ə","51"),("İqtisadiyyat (Əyani)","Ə","90.5"),("İqtisadiyyat (ingilis dilində)","Ə","84.5"),("Maliyyə (Əyani)","Ə","91.9"),("Maliyyə (ingilis dilində)","Ə","82.9"),("Menecment (Əyani)","Ə","85.6"),("Mühasibat (Əyani)","Ə","84.1"),("Mühasibat (ingilis dilində)","Ə","80.9")]),
("Qərbi Kaspi Universiteti",[("İqtisadiyyat (Əyani)","Ə","73.5"),("İqtisadiyyat (Qiyabi)","Q","86.6"),("Maliyyə (Əyani)","Ə","73.2"),("Maliyyə (Qiyabi)","Q","86"),("Mühasibat (Əyani)","Ə","70.4"),("Mühasibat (Qiyabi)","Q","86.7")]),
("Xəzər Universiteti",[("İqtisadiyyat (ingilis dilində)","Ə","51"),("Maliyyə (ingilis dilində)","Ə","51"),("Menecment (ingilis dilində)","Ə","59.7"),("Mühasibat (ingilis dilində)","Ə","67.5")]),
("Bakı Avrasiya Universiteti",[("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","68.2"),("İqtisadiyyat (Əyani)","Ə","78.7"),("Maliyyə (Əyani)","Ə","76.9"),("Menecment (Əyani)","Ə","74.8"),("Mühasibat (Əyani)","Ə","74.8")]),
('"Odlar Yurdu" Universiteti',[("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","72.5"),("İqtisadiyyat (ingilis dilində)","Ə","80.9"),("İqtisadiyyat (Əyani)","Ə","84.3"),("Maliyyə (ingilis dilində)","Ə","70.5"),("Maliyyə (Əyani)","Ə","84.3"),("Menecment (Qiyabi)","Q","97.5"),("Menecment (ingilis dilində)","Ə","70.5"),("Menecment (Əyani)","Ə","81.1"),("Mühasibat (Qiyabi)","Q","97.1"),("Mühasibat (ingilis dilində)","Ə","70"),("Mühasibat (Əyani)","Ə","79.7")]),
("Bakı Biznes Universiteti",[("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","72.7"),("İqtisadiyyat (Əyani)","Ə","83.9"),("İqtisadiyyat (Qiyabi)","Q","91.8"),("İqtisadiyyat (ingilis dilində)","Ə","79.5"),("Maliyyə (Əyani)","Ə","81.7"),("Menecment (Əyani)","Ə","80.6"),("Menecment (Qiyabi)","Q","90.6"),("Mühasibat (Əyani)","Ə","77.5"),("Mühasibat (Qiyabi)","Q","90.2")]),
("Azərbaycan Əmək və Sosial Münasibətlər Akademiyası",[("Dövlət və bələdiyyə idarəetməsi (Əyani)","Ə","72"),("İqtisadiyyat (Əyani)","Ə","84.4"),("Maliyyə (Əyani)","Ə","76.9"),("Mühasibat (Qiyabi)","Q","92.7"),("Mühasibat (Əyani)","Ə","76.1")]),
]
rows=[]; n=0
for uni,items in G2:
    rows.append(f"  // {uni}")
    for spec,stream,a in items:
        rows.append(f'  {{ university: "{esc(uni)}", specialty: "{esc(spec)}", stream: "{stream}", score: {num(a)}, tag: "subbakalavr" }},')
        n+=1
write_file("src/data/admissions-group2-subbakalavr-2026.ts","admissionsGroup2Sub","./admissions-group2-2026",
           "// 2-ci qrup — subbakalavr keçid balları 2026 (0-100 şkala)", rows, n)

# ===================== GROUP 4 (stream + score (stateScore)) =====================
G4=[
("Naxçıvan Dövlət Universiteti",[("Baytarlıq təbabəti","Ə","-","74.5")]),
("Azərbaycan Dövlət Aqrar Universiteti",[("Biotexnologiya","Ə","92.3","-"),("Ekologiya","Ə","90.3","96.5"),("Bağçılıq və tərəvəzçilik (tədris türk dilində)","Ə","-","51"),("Bağçılıq və tərəvəzçilik (Əyani)","Ə","-","78.7"),("Bağçılıq və tərəvəzçilik (Qiyabi)","Q","-","93.3"),("Baytarlıq təbabəti","Ə","-","80.7"),("Bitki mühafizəsi (tədris türk dilində)","Ə","-","83.2"),("Bitki mühafizəsi (Əyani)","Ə","-","89.1"),("Əczaçılıq","Ə","92.1","92.1")]),
("Gəncə Dövlət Universiteti",[("Biologiya","Ə","92.7","-"),("Biologiya","Ə","90","-")]),
("Azərbaycan Texnologiya Universiteti",[("Ekologiya","Ə","87.2","-")]),
("Sumqayıt Dövlət Universiteti",[("Biologiya","Ə","93.9","-")]),
("Mingəçevir Dövlət Universiteti",[("Ekologiya","Ə","88","-")]),
("Lənkəran Dövlət Universiteti",[("Ekologiya","Ə","86.9","-"),("Bağçılıq və tərəvəzçilik","Ə","-","72.6"),("Baytarlıq təbabəti","Ə","-","79.3")]),
]
rows=[]; n=0
for uni,items in G4:
    rows.append(f"  // {uni}")
    for spec,stream,a,b in items:
        r=two(a,b)
        if r is None: continue
        sc,st=r
        line=f'  {{ university: "{esc(uni)}", specialty: "{esc(spec)}", stream: "{stream}", score: {num(sc)}'
        if st is not None: line+=f", stateScore: {num(st)}"
        line+=', tag: "subbakalavr" },'
        rows.append(line); n+=1
write_file("src/data/admissions-group4-subbakalavr-2026.ts","admissionsGroup4Sub","./admissions-group4-2026",
           "// 4-cü qrup — subbakalavr keçid balları 2026 (0-100 şkala)", rows, n)

# ===================== GROUP 5 (stream + apt/score (aptState/stateScore)) =====================
def slash(x):
    x=x.strip()
    if x in DASH: return None,None
    a,b=x.split("/")
    return float(a),float(b)
G5=[
("Azərbaycan Memarlıq və İnşaat Universiteti",[("Dizayn (interyer dizayn, qrafik dizayn)","Ə","7/87.3","8/91.9")]),
("Bakı Musiqi Akademiyası",[("İnstrumental ifaçılıq (fortepiano, orqan və s.)","Ə","6/51","-")]),
("Azərbaycan Milli Konservatoriyası",[("Dirijorluq (xalq çalğı və xor)","Ə","6/51","7/82.8"),("İnstrumental ifaçılıq (tar, kamança və s.)","Ə","8/70.6","9/84.3"),("Vokal sənəti (xanəndəlik)","Ə","8/69.4","8/69.4")]),
("Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti",[("Aktyor sənəti (dram, kino, musiqili teatr)","Ə","8/76.4","8/76.4"),("Dizayn (interyer, qrafik, geyim dizaynı)","Ə","7/83.5","-"),("İnstrumental ifaçılıq (tar, kamança və s.)","Ə","9/71.3","9/81.3"),("Operator sənəti","Ə","6/51","-"),("Populyar musiqi və caz ifaçılığı (vokal)","Ə","7/81.2","-"),("Vokal sənəti (xanəndə)","Ə","7/71.6","8/62.7")]),
("Azərbaycan Dövlət Rəssamlıq Akademiyası",[("Dekorativ-tətbiqi sənət (xalça, toxuculuq, keramika və s.)","Ə","8/69","8/69"),("Heykəltəraşlıq (monumental və dəzgah)","Ə","7/81.2","8/81.9"),("Qrafika (dəzgah, kitab tərtibatı, animasiya və s.)","Ə","8/78.9","8/78.9"),("Rəngkarlıq (monumental, dəzgah, teatr və s.)","Ə","7/74","7/74")]),
("Bakı Xoreoqrafiya Akademiyası",[("Xoreoqrafiya sənəti (milli rəqs, modern, balet və s.)","Ə","7/58.5","9/81.3"),("Xoreoqrafiya sənəti (milli rəqs, modern, balet və s. — Qiyabi)","Q","8/78.3","-"),("İnstrumental ifaçılıq (nağara, qarmon)","Ə","7/93.1","-")]),
("Azərbaycan İdman Akademiyası",[("Məşqçilik (atıcılıq — Qiyabi)","Q","10/69","-"),("Məşqçilik (karate — Qiyabi)","Q","10/67.1","-"),("Məşqçilik (stolüstü tennis — Qiyabi)","Q","10/62.5","-")]),
("Naxçıvan Dövlət Universiteti",[("Aktyor sənəti (teatr və kino, musiqili teatr)","Ə","6/51","8/87.3"),("İnstrumental ifaçılıq (fleyta, klarnet, saksofon və s.)","Ə","6/51","-"),("Rəngkarlıq","Ə","7/89.2","7/89.2"),("Vokal sənəti (xanəndəlik, milli vokal)","Ə","6/51","8/82.3"),("Məşqçilik (sərbəst güləş — Qiyabi)","Q","10/64.8","-")]),
]
rows=[]; n=0
for uni,items in G5:
    rows.append(f"  // {uni}")
    for spec,stream,ab,cd in items:
        apt,sc=slash(ab)
        aptS,stS=slash(cd)
        if sc is None: continue
        line=f'  {{ university: "{esc(uni)}", specialty: "{esc(spec)}", stream: "{stream}"'
        if apt is not None: line+=f", aptitude: {num(apt)}"
        line+=f", score: {num(sc)}"
        if aptS is not None: line+=f", aptitudeState: {num(aptS)}"
        if stS is not None: line+=f", stateScore: {num(stS)}"
        line+=', tag: "subbakalavr" },'
        rows.append(line); n+=1
write_file("src/data/admissions-group5-subbakalavr-2026.ts","admissionsGroup5Sub","./admissions-group5-2026",
           "// 5-ci qrup — subbakalavr keçid balları 2026 (qabiliyyət/bal, 0-100 şkala)", rows, n)

print("done")
