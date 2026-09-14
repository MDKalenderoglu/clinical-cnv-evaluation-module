# Puanlama Denetimi

Bu tablo, puanlama davranışının hangi kısımlarının **otomatik test kapsamında** olduğunu ve hangilerinin hâlâ **manuel/bağımsız doğrulama** beklediğini gösterir.

> **Otomatik test ≠ klinik doğrulama.** Testler aracın aritmetiğinin tutarlı olduğunu gösterir; kriter seçiminin klinik doğruluğunu veya aracın ClinGen CNV Calculator ile uyumunu göstermez. "Otomatik" işaretli satırlar dahi bağımsız uzman incelemesi gerektirir.

Son güncelleme: v0.2.0 · Test sayısı: 253 · Koşum: `node tests/run.js`

| Öğe | Kaynak | Uygulama yeri | Otomatik test | Manuel doğrulama |
| --- | --- | --- | --- | --- |
| Sınıf eşikleri (P/LP/VUS/LB/B) | Riggs 2020, Table 1 | `cnv-scoring.js` → `classify()` | ✅ `01-classification` — 5 sınıfın tüm sınır değerleri, monotonluk, bitişiklik | Bekliyor |
| Yuvarlama sözleşmesi | — (uygulama kararı) | `cnv-scoring.js` → `round2()` | ✅ `01`, `02` — kayan nokta hatasının sınıf düşürmemesi | Bekliyor |
| Puan toplama | Riggs 2020 | `cnv-scoring.js` → `total()` | ✅ `02-totals` — bozuk/eksik alan dayanıklılığı dahil | Bekliyor |
| Section 1 (kayıp ve kazanım) | Riggs 2020; Suppl. 1 | `CRITERIA` 1A/1Ab/1B | ✅ `02`, `08` — 1B = −0.60 | Bekliyor |
| Section 2 kayıp (2A–2H) | Riggs 2020; Suppl. 1 | `CRITERIA` `*` tip `loss` | ✅ `02`, `08` — 2A, 2E, 2F, 2H anahtar değerleri | Bekliyor |
| Section 2 kazanım (2A_d–2L_d) | Riggs 2020; Suppl. 1 | `CRITERIA` tip `gain` | ✅ `02`, `08` — 2A_d, 2C_d, 2E_d | Bekliyor |
| Section 3 kayıp eşikleri (25/35 gen) | Riggs 2020; Suppl. 1 | `3A_d`/`3B_d`/`3C_d` | ✅ `02`, `08` | Bekliyor |
| Section 3 kazanım eşikleri (35/50 gen) | Riggs 2020; Suppl. 1 | `3A_u`/`3B_u`/`3C_u` | ✅ `02`, `08` — kayıptan farklı olduğu ayrıca test edilir | Bekliyor |
| Section 4A olgu çarpımı ve tavanları | Riggs 2020; Suppl. 1 | `caseEvidenceTotal()` | ✅ `03-case-evidence` — 4A/4B/4C/4D/4E tavanları, sınır girdiler | Bekliyor |
| Section 4 segregasyon (4F–4K) | Riggs 2020; Suppl. 1 | `CRITERIA` bölüm `s4seg` | ✅ `02`, `08` | Bekliyor |
| Section 4 olgu-kontrol / popülasyon (4L–4O) | Riggs 2020; Suppl. 1 | `CRITERIA` bölüm `s4b` | ✅ `02`, `08` — 4N = −0.90, 4O = −1.00 | Bekliyor |
| Section 5 kalıtım (5A–5H) | Riggs 2020; Suppl. 1 | `CRITERIA` bölüm `s5` | ✅ `02`, `08` — 5A, 5B anahtar değerleri | Bekliyor |
| Arayüz ↔ modül senkronluğu | — (regresyon koruması) | `index.html` ↔ `cnv-scoring.js` | ✅ `07-html-consistency` — her `pick()` puanı ve bölümü karşılaştırılır | Yok — otomatik yeterli |
| Ölü kriter tanımı olmaması | — | ikisi birden | ✅ `07` | Yok |
| Koordinat ayrıştırma | — | `parseCoord()` | ✅ `04-coordinates` — 12 geçerli, 10 geçersiz biçim | Bekliyor |
| Build → veritabanı eşlemesi | — | `buildLinks()` | ✅ `04` — UCSC hg19/hg38, Ensembl GRCh37, gnomAD r2.1/r4 | **Bekliyor — URL'lerin canlı doğrulanması gerekir** |
| Karar kapıları | Riggs 2020; ACGS 2023; klinik uygulama | `gates()` | ✅ `05-gates` — build çelişkisi, platform, ROH, mozaiklik, ebeveyn, fenotip | Bekliyor |
| İmprinted / azalmış penetrans bölgeleri | ClinGen, DECIPHER | `SPECIAL_REGIONS` | ⚠️ Yapı testi var; **koordinatlar yaklaşıktır ve doğrulanmamıştır** | **Bekliyor — öncelikli** |
| Sınırlılık metni üretimi | ACGS 2023; laboratuvar uygulaması | `limitationsText()` | ✅ `05` — platform ve ebeveyn durumuna göre koşullu | Bekliyor |
| Olgu dosyası şeması | — | `cnv-case.js` | ✅ `06-case-file` | Yok |
| Markdown özet üretimi | — | `toMarkdown()` | ✅ `06` — içerik, kaçış, boş durum | Bekliyor |
| Gizlilik sözleşmesi (ağ çağrısı yok) | — | tüm kaynak | ✅ `07` — `fetch`/XHR/beacon/WebSocket taraması | Yok |
| Otomatik kaydetmenin varsayılan kapalılığı | — | `cnv-case.js` | ✅ `07` | Yok |
| **ClinGen CNV Calculator karşılaştırması** | Riggs 2020 resmî uygulayıcı | — | ❌ Yok | **Yapılmadı — en öncelikli eksik** |
| Uncoupling ilkesi (sınıf ≠ hasta tanısı) | Riggs 2020; ACGS 2023 | Arayüz metinleri, çıktı uyarıları | ❌ Metin incelemesi | Bekliyor |
| Raporlama dili uygunluğu | ACGS 2023 | Çıktı metinleri | ❌ Metin incelemesi | Bekliyor |
| Yazdırma / PDF çıktısı | — | `dlHTML()`, `window.print()` | ❌ Yok | Bekliyor |

## Bilinen eksikler (öncelik sırasıyla)

1. **ClinGen CNV Calculator ile karşılaştırmalı doğrulama yapılmamıştır.** `tests/unit/08-scenarios.test.js` içindeki 11 senaryo bu karşılaştırmanın girdi kümesi olarak kullanılabilir.
2. **`SPECIAL_REGIONS` koordinatları yaklaşıktır** ve literatürden doğrulanmamıştır. Yalnızca "bu bölgeye bakmayı hatırlat" amacı taşır; sınıflandırmayı etkilemez, yalnızca uyarı üretir. Her uyarı metninde bu belirtilir.
3. **Dış kaynak URL biçimleri canlı doğrulanmamıştır.** Sağlayıcılar URL şemalarını değiştirebilir; periyodik kontrol gerekir.
4. Yazdırma/PDF çıktısının farklı tarayıcılarda tutarlılığı test edilmemiştir.
5. Arayüz metinlerinin ACGS 2023 raporlama diline uygunluğu uzman incelemesi beklemektedir.

Yeni bir sapma bulunduğunda bu belgeye tarih, sürüm, inceleyen, beklenen ve gözlenen sonuçla birlikte kaydedilmelidir.
