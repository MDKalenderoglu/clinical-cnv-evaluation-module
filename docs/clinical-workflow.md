# Klinik İş Akışı

Bu belge aracın hangi klinik akışı desteklediğini tanımlar. Araçtaki adım sırası bu akışı izler.

## 0. Rapor öncesi: klinik bağlam

CNV'ye fenotipi bilmeden bakmak, "bulunana uyan hikâye yazma" hatasına yol açar. Önce:

- Endikasyon (gelişme geriliği / OSB / dismorfi / multipl anomali / prenatal / infertilite)
- Fenotip — tercihen **HPO terimleriyle** kodlanmış
- Konsanguinite, soy ağacı, benzer etkilenmiş birey
- Önceki testler (karyotip, FISH, MLPA, ekzom) — özellikle bilinen dengeli yeniden düzenlenme

## 1. Teknik geçerlilik

| Kontrol | Neden önemli |
|---|---|
| aCGH mi SNP-array mi | aCGH'de BAF yok → ROH/UPD/mozaiklik değerlendirilemez; bu, raporun limitasyon cümlesidir |
| Genome build | En sık ve en sessiz hata kaynağı; yanlış build gen içeriğini tamamen değiştirir |
| QC (DLRS/MAPD, waviness, call rate) | Sınırda QC'de küçük CNV çağrılarına güvenilmez |
| Prob/marker sayısı | 3 probla çağrılan CNV ile 120 probla çağrılan aynı değildir |
| Log2 ratio / BAF paterni | Beklenenden sapma → mozaiklik şüphesi |
| Doğrulama | Küçük, sınırda veya klinik olarak kritik CNV için FISH/MLPA/qPCR |

Build farklıysa **liftover** yapılır (UCSC LiftOver, Ensembl Assembly Converter). Koordinat elle çevrilmez.

## 2. Gen içeriği

- Kaç **protein-kodlayan** gen (RefSeq/MANE Select; pseudogen ve lncRNA hariç — Section 3 yalnızca protein-kodlayan genleri sayar)
- Sınırlar intragenik mi? Hangi ekzonlar? NMD beklenir mi?
- Düzenleyici element, TAD sınırı, segmental duplikasyon / LCR bölgesi

## 3. Bilinen sendrom bölgesi mi?

ClinGen Dosage Sensitivity Map (HI/TS skoru: 3 = yeterli kanıt, 2/1 = az, 0 = kanıt yok, 30 = otozomal resesif, 40 = dozaj duyarsız), DECIPHER genomic disorders, OMIM Morbid Map, GeneReviews, Orphanet.

Section 2 puanı doğrudan bu adımın çıktısına dayanır.

## 4. Popülasyon frekansı (benign kanıtı)

gnomAD-SV → ClinGen kürate benign listesi (nstd186) → kendi laboratuvar iç veritabanı → DGV.

> **DGV uyarısı:** DGV bazı çalışmalarda klinik olarak seçilmiş örnekler ve eski düşük çözünürlüklü platform verisi içerir. "DGV'de var, demek benign" klasik bir hatadır. Kaydın hangi çalışmadan, kaç bireyden ve hangi platformdan geldiğine bakılmalıdır.

## 5. Hasta kayıtları ve literatür (patojenik kanıtı)

ClinVar, DECIPHER hasta kayıtları, PubMed, ClinGen Evidence Repository. Aranan şey Section 4A'nın istediğidir: **fenotipi belirgin şekilde uyan, tercihen de novo, yayınlanmış olgular.** Olgu sayısı puanı çarpar (tavan +0.90).

## 6. Gen düzeyinde dozaj duyarlılığı

Bölge bilinen bir sendrom değilse en önemli aday gene inilir: gnomAD pLI/LOEUF, pHaplo/pTriplo, DECIPHER %HI index, imprinting durumu, X-kromozomu ise inaktivasyon ve PAR bölgesi.

> In-silico dozaj skorları Riggs çerçevesinde **tek başına sınıflandırma kanıtı değildir**; destekleyicidir (2H, +0.15).

## 7. Kalıtım

Çoğu olguda sınıfı belirleyen adımdır.

- **De novo (teyitli) + fenotip özgül** → 5A, +0.45
- **Etkilenmemiş ebeveynden kalıtılmış** → 5B/5C, negatif — ancak **azalmış penetranslı bölgelerde dışlayıcı değildir** (1q21.1, 15q11.2 BP1-BP2, 15q13.3, 16p11.2, 16p12.1, 16p13.11, 17q12, 22q11.2 distal). Araç bu bölgelerde uyarı verir.
- Etkilenmiş ebeveynde segregasyon → pozitif
- Ebeveynde **dengeli translokasyon** olasılığı → ebeveyn karyotipi/FISH; tekrarlama riski değişir

## 8. Puanlama ve çapraz kontrol

Riggs 2020 Section 1–5. Ardından **ClinGen CNV Calculator** ve Franklin ile karşılaştırma. Fark varsa genellikle Section 2 veya 4'teki kanıt yorumundadır.

Sınıf eşikleri: ≥0.99 P · 0.90–0.98 LP · −0.89…0.89 VUS · −0.90…−0.98 LB · ≤−0.99 B

## 9. Klinik korelasyon

Puan tek başına rapor değildir:

- Bu CNV fenotipin **tamamını** açıklıyor mu? Açıklamıyorsa ek test (trio WES/WGS) önerilir.
- **İkincil/tesadüfi bulgu** var mı (delesyon içinde erişkin başlangıçlı kanser geni)? Ayrı onam ve danışmanlık konusudur.
- **Taşıyıcılık** bulgusu mu (resesif genin tek kopya kaybı)?
- Tekrarlama riski, prenatal tanı seçenekleri
- Sendrom-spesifik izlem (örn. 22q11.2DS'de kardiyak/immün/kalsiyum)

## 10. Rapor

ISCN 2020 nomenklatürü + build, sınıflandırma + gerekçe + çerçeve sürümü, öneriler (ebeveyn çalışması, doğrulama, danışmanlık, ek test, izlem) ve **sınırlılıklar**. Araç sınırlılık paragrafını platform ve seçimlerden otomatik üretir; bu metin uzman tarafından doğrulanmalıdır.

Uygunsa ClinVar/DECIPHER'a veri sunumu.

## 11. İzlem

VUS kalırsa 12–24 ay sonra ClinVar, DECIPHER ve PubMed taramasıyla yeniden değerlendirme.
