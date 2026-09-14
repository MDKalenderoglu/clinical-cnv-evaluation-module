# Klinik CNV Değerlendirme Modülü

**ACMG/ClinGen (Riggs et al. 2020) çerçevesine dayalı, Türkçe, tarayıcıda çalışan konstitüsyonel CNV yorumlama ve eğitim aracı.**

[![Testler](https://github.com/MDKalenderoglu/clinical-cnv-evaluation-module/actions/workflows/test.yml/badge.svg)](https://github.com/MDKalenderoglu/clinical-cnv-evaluation-module/actions/workflows/test.yml)

> **Bu bir tıbbi cihaz değildir.** Valide edilmiş bir klinik karar sistemi veya rapor üreticisi değildir. Eğitim ve yapılandırılmış değerlendirme amaçlıdır; uzman incelemesi, yerel doğrulama ve kurumsal veri yönetişimi gerektirir.

---

## Ne işe yarar?

Bir array raporunu yorumlarken klinisyen sırayla on ayrı kaynağı sorgular, notlarını dağınık tutar ve sonunda puanlamayı elle yapar. Bu araç o iş akışını tek sayfada, **doğru sırayla** ve kayıt tutarak yürütür:

| Adım | Araç ne yapar |
|---|---|
| Olgu kartı | Rapor metnini (ISCN / `DEL:Chr7:...`) ayrıştırıp alanları doldurur |
| Teknik doğrulama | Platform, build, QC ve log2/BAF kontrolünü zorunlu kılar |
| Triaj | Laboratuvar sınıfını bağımsız puanlamadan ayırır |
| **Kaynak sorgulama** | Koordinat + build'den UCSC, Ensembl, DECIPHER, gnomAD-SV, DGV, ClinVar, ClinGen Dosage, OMIM, PanelApp, Franklin ve ClinGen CNV Calculator için **tek tıklık derin linkler** üretir; bulguları çalışma sayfasına kaydeder |
| Section 1–5 | Riggs 2020 puanlamasını kriter kriter, açıklamalı yürütür |
| Sonuç | Skor, sınıf, eksik kanıt, sonraki adımlar |
| Raporlama | Puan kartı (HTML/PDF), **Markdown özet**, otomatik sınırlılık metni |

Ayrıca değerlendirme boyunca **karar kapıları** çalışır: build çelişkisi, aCGH ile ROH bildirimi, imprinted bölge örtüşmesi, azalmış penetranslı tekrarlayan bölgeler, ebeveyn testi eksikliği, gen sayısı/boyut tutarsızlığı.

## Hızlı başlangıç

```bash
git clone https://github.com/MDKalenderoglu/clinical-cnv-evaluation-module.git
cd clinical-cnv-evaluation-module
python3 -m http.server 8777   # sonra http://localhost:8777
```

`index.html` dosyasını doğrudan tarayıcıda da açabilirsiniz — kurulum, paket yöneticisi veya derleme adımı yoktur.

### Testler

```bash
node tests/run.js
```

Bağımlılık gerektirmez. 253 test; puanlama aritmetiği, sınıf eşikleri, koordinat ayrıştırma, karar kapıları, olgu dosyası şeması, Markdown üretimi ve **`index.html` ile puanlama modülünün senkronluğu** doğrulanır. Her push'ta GitHub Actions ile koşar.

## Veri gizliliği

- Hiçbir veri sunucuya gönderilmez. Kodda `fetch`, `XMLHttpRequest`, `sendBeacon` ve `WebSocket` **yoktur** ve bu bir testle güvence altındadır.
- **Otomatik kaydetme varsayılan olarak kapalıdır.** Açıldığında veriler yalnızca o tarayıcının yerel deposunda tutulur; açma işlemi açık bir onay ister ve "yerel kaydı sil" düğmesi her zaman erişilebilirdir. Ortak kullanılan bilgisayarlarda açılmamalıdır.
- Dış kaynak bağlantıları **kullanıcı tıkladığında** açılır; koordinat bilgisi ancak o zaman hedef siteye gider. Hasta tanımlayıcıları hiçbir bağlantıya konmaz.
- **Depoya gerçek hasta verisi, tanımlayıcı, görsel, ekran görüntüsü, dışa aktarılmış rapor veya gerçek olgu örneği eklenmemelidir.**

## Proje yapısı

```
index.html                  Arayüz (tek sayfa, derleme gerektirmez)
assets/js/cnv-scoring.js    Riggs 2020 puanlama çekirdeği — saf, test edilir
assets/js/cnv-resources.js  Derin link üretimi, özel bölgeler, karar kapıları
assets/js/cnv-case.js       Olgu dosyası (JSON), kalıcılık, Markdown rapor
assets/js/cnv-app.js        Arayüz bağlama katmanı
tests/run.js                Sıfır bağımlılıklı test koşucusu
tests/unit/                 8 test dosyası, 253 test
docs/                       Kapsam, doğrulama, güvenlik, mimari, klinik akış
references/                 Kaynak künyeleri
```

Ayrıntı için [docs/architecture.md](docs/architecture.md).

## Klinik kapsam ve sınırlar

- **Kapsam içi:** konstitüsyonel kopya sayısı kazanım ve kayıpları (Riggs 2020).
- **Kapsam dışı:** somatik/onkolojik CNV, ROH/CN-LOH/UPD sınıflandırması (araç yalnızca uyarır ve yönlendirir), dengeli yeniden düzenlenmeler, tek nükleotid varyantları.
- Puanlama aritmetiği otomatiktir; **kriter seçimi klinik yorumdur** ve otomatikleştirilmemiştir.
- Özel bölge sınırları (imprinted / azalmış penetrans) **yaklaşıktır** ve yalnızca hatırlatma amaçlıdır. Kesin sınır için ClinGen Dosage Map kullanılmalıdır.

Ayrıntı için [docs/clinical-scope.md](docs/clinical-scope.md) ve [docs/clinical-workflow.md](docs/clinical-workflow.md).

## Doğrulama durumu

Bu araç **bağımsız olarak valide edilmemiştir.** Kurumsal kullanımdan önce [docs/validation-plan.md](docs/validation-plan.md) izlenmeli ve [docs/scoring-audit.md](docs/scoring-audit.md) tamamlanmalıdır. ClinGen CNV Calculator ile karşılaştırmalı doğrulama planlanmış ancak henüz yapılmamıştır.

## Kaynaklar

- Riggs ER, Andersen EF, Cherry AM, et al. Technical standards for the interpretation and reporting of constitutional copy-number variants: a joint consensus recommendation of ACMG and ClinGen. *Genet Med.* 2020;22(2):245-257. doi:10.1038/s41436-019-0686-8
- Supplemental Material 1: Using the Copy Number Variation (CNV) Scoring Metrics.
- ACGS Best Practice Guidelines for Variant Classification in Rare Disease, 2023.
- ClinGen CNV Calculator — https://cnvcalc.clinicalgenome.org/

---

## English summary

Turkish-language, browser-based prototype for constitutional CNV interpretation following the ACMG/ClinGen framework (Riggs et al. 2020). Static site, no build step, no network calls, no server. Scoring logic is extracted into a pure, unit-tested module (253 tests, zero dependencies) with a consistency test that guards against drift between the UI and the scoring core. Generates deep links to UCSC, Ensembl, DECIPHER, gnomAD-SV, DGV, ClinVar, ClinGen Dosage Map, OMIM and the ClinGen CNV Calculator from the entered coordinate and genome build, and runs decision gates for build conflicts, platform limitations, imprinted regions and reduced-penetrance loci.

**Not a medical device. Not validated for clinical decision-making. Never commit real patient data.**
