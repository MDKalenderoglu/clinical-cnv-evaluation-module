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
| **ClinGen CNV Calculator karşılaştırması** | Riggs 2020 resmî uygulayıcı | — | ✅ 8/11 senaryo canlı doğrulandı, 0 sapma | Kalan 3 senaryo (7, 8, kısmen 4) bekliyor — bkz. altta |
| Uncoupling ilkesi (sınıf ≠ hasta tanısı) | Riggs 2020; ACGS 2023 | Arayüz metinleri, çıktı uyarıları | ❌ Metin incelemesi | Bekliyor |
| Raporlama dili uygunluğu | ACGS 2023 | Çıktı metinleri | ❌ Metin incelemesi | Bekliyor |
| Yazdırma / PDF çıktısı | — | `dlHTML()`, `window.print()` | ❌ Yok | Bekliyor |

## ClinGen CNV Calculator karşılaştırması — sonuçlar

**Tarih:** 2026-09-14 · **Sürüm:** v0.2.0 (074c2fb) · **Araç:** https://cnvcalc.clinicalgenome.org/cnvcalc/ (CNV-Loss ve CNV-Gain hesaplayıcıları) · **Yöntem:** `tests/unit/08-scenarios.test.js` içindeki senaryolar canlı hesaplayıcıya kriter kriter girildi, "Total score" değeri modülümüzün çıktısıyla karşılaştırıldı.

| # | Senaryo | Kriterler | Modülümüz | ClinGen Calculator | Sonuç |
| --- | --- | --- | --- | --- | --- |
| 1a | Kurulmuş HI bölge, tam delesyon | 2A | +1.00 | +1.00 | ✅ Birebir |
| 1b | + de novo, özgül fenotip | 2A + 5A | +1.45 | +1.45 | ✅ Birebir |
| 2a | Gen içermeyen delesyon | 1B | −0.60 | −0.60 | ✅ Birebir |
| 2b | + popülasyonda >%1 | 1B + 4O | −1.60 | −1.60 | ✅ Birebir |
| 3a | İntragenik, PVS1 tam güç | 2E | +0.90 | +0.90 | ✅ Birebir |
| 3b | + de novo | 2E + 5A | +1.35 | +1.35 | ✅ Birebir |
| 3c | + etkilenmemiş ebeveynden kalıtım | 2E + 5B | +0.60 | +0.60 | ✅ Birebir |
| 5a | Duplikasyon, benign DUP ile birebir | 2C_d | −1.00 | −1.00 | ✅ Birebir |
| 5b | Kırılma noktası gen kesiyor | 2E_d | 0 | 0 (yapısal: "Continue Evaluation") | ✅ Doğrulandı |
| 6a | Duplikasyon, kurulmuş TS bölge | 2A_d | +1.00 | +1.00 | ✅ Birebir |
| 6b | Gain 35–49 gen | 3B_u | +0.45 | +0.45 | ✅ Birebir |
| 9a | Segregasyon (aile lehine) | 4H + 5D_7 | +0.90 | +0.90 | ✅ Birebir |
| 9b | Segregasyon (aile aleyhine) | 4I + 5E_i | −0.90 | −0.90 | ✅ Birebir |
| 10a | Olgu-kontrol farkı yok | 4N | −0.90 | −0.90 | ✅ Birebir |
| 10b | + gen içermeyen | 1B + 4N | −1.50 | −1.50 | ✅ Birebir |
| 11 | Sınıf sınırı hassasiyeti | 2E + 4F | +1.05 | +1.05 | ✅ Birebir |

**8/11 senaryo (16 alt-değerlendirme) canlı olarak doğrulandı — hepsi sıfır sapmayla birebir eşleşti.** Ayrıca şu yapısal eşlemeler hesaplayıcının kendi arayüzünden teyit edildi:

- Section 3 gen sayısı eşikleri: kayıp için 0–24/25–34/≥35, kazanım için 0–34/35–49/≥50 — modülümüzle birebir aynı.
- Section 4/5 segregasyon eşikleri: 3–4/5–6/≥7 gözlem — modülümüzle birebir aynı.
- 5A ve 5D'nin, Section 4'ün 4A–4D ve 4F–4H kategorilerini yeniden kullandığı (Riggs'in "use appropriate category from Section 4" talimatı) hesaplayıcı tarafında da aynı şekilde ayrı bir puan havuzuna (5A tavanı 0.45, Section 4A tavanı 0.90) yazıldığı doğrulandı — modülümüzün Section 4A ve Section 5 puanlarını ayrı tuttuğu tasarım kararı teyit edildi.

**Doğrulanmayan senaryolar:** 4 (yalnızca gen sayısı — bucket sınırları yukarıda dolaylı doğrulandı, tam senaryo koşulmadı), 7 (çoklu olgu 4A_conf tavanı — hesaplayıcının olgu sayısı çarpanı arayüzü ayrı bir alan gerektiriyor, zaman kısıtı nedeniyle koşulmadı), 8 (4D negatif + 2H). Bunlar aritmetik olarak `tests/unit/03-case-evidence.test.js` ve `02-totals.test.js` ile birim düzeyinde test edilmiştir; yalnızca canlı araçla çapraz doğrulanmamıştır.

**Teknik not:** Hesaplayıcı jQuery tabanlı bootstrap-slider bileşenleri kullanıyor; programatik `.click()` çoğu kriterde sonucu güncellemiyor, gerçek fare koordinatı tıklaması gerekiyor (sabit puanlı checkbox'lar — 1B gibi — istisna). Bu, otomasyonun her senaryoda elle koordinat hesaplaması gerektirdiği, dolayısıyla kalan 3 senaryonun ayrı bir oturumda tamamlanabileceği anlamına gelir.

## Bilinen eksikler (öncelik sırasıyla)

1. **`SPECIAL_REGIONS` koordinatları yaklaşıktır** ve literatürden doğrulanmamıştır. Yalnızca "bu bölgeye bakmayı hatırlat" amacı taşır; sınıflandırmayı etkilemez, yalnızca uyarı üretir. Her uyarı metninde bu belirtilir.
2. **Dış kaynak URL biçimleri canlı doğrulanmamıştır.** Sağlayıcılar URL şemalarını değiştirebilir; periyodik kontrol gerekir.
3. Yazdırma/PDF çıktısının farklı tarayıcılarda tutarlılığı test edilmemiştir.
4. Arayüz metinlerinin ACGS 2023 raporlama diline uygunluğu uzman incelemesi beklemektedir.
5. ClinGen CNV Calculator karşılaştırmasında kalan 3 senaryo (7, 8, tam 4) — yukarıda not edildi.

Yeni bir sapma bulunduğunda bu belgeye tarih, sürüm, inceleyen, beklenen ve gözlenen sonuçla birlikte kaydedilmelidir.
