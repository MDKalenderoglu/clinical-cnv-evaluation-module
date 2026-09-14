# Değişiklik Günlüğü

## v0.2.0 — Kanıt toplama, test altyapısı ve olgu kalıcılığı

### Eklendi

- **Kaynak sorgulama adımı:** CNV koordinatı ve genome build'den UCSC, Ensembl, NCBI GDV, ClinGen Dosage Map, DECIPHER, gnomAD-SV, DGV, ClinVar, PubMed, OMIM, GeneReviews, Orphanet, PanelApp, ClinGen CNV Calculator, Franklin ve UCSC LiftOver için otomatik derin link üretimi (6 grup, 18 bağlantı).
- **Kanıt çalışma sayfası:** 11 kaynak için "sorgulandı" işareti ve bulgu alanı; hangi Riggs bölümünü beslediği görünür; sorgulanmayanlar rapor özetinde eksik kanıt olarak listelenir.
- **Karar kapıları:** build çelişkisi (ISCN ↔ seçim), build eksikliği, aCGH ile ROH/CN-LOH uyumsuzluğu, aCGH BAF kısıtı, mozaiklik, ebeveyn testi eksikliği, fenotip eksikliği, gen sayısı/boyut tutarsızlığı, çok küçük CNV, imprinted bölge örtüşmesi, azalmış penetranslı tekrarlayan bölge örtüşmesi.
- **Olgu dosyası:** JSON olarak dışa/içe aktarma (`cnv-case/1` şeması); puanlama durumu ve kriter seçimleri dahil.
- **Opsiyonel otomatik kaydetme:** varsayılan kapalı, açık onaylı, tek tıkla silinebilir.
- **Markdown özet çıktısı:** olgu, teknik bilgi, CNV, kanıt tablosu, puanlama tablosu, uyarılar, klinik korelasyon, otomatik sınırlılık metni ve kaynak künyesi.
- **Otomatik sınırlılık metni:** platform, build ve ebeveyn testi durumuna göre koşullu üretim.
- **Test altyapısı:** sıfır bağımlılıklı koşucu, 8 dosya, 253 test. Puanlama aritmetiği, sınıf eşikleri, koordinat ayrıştırma, karar kapıları, olgu şeması, Markdown üretimi, gizlilik sözleşmesi ve **arayüz ↔ modül senkronluğu** kapsanır.
- **GitHub Actions:** her push'ta test; Pages yayını testlere bağlı.

### Değişti

- Puanlama mantığı `assets/js/cnv-scoring.js` içine saf, test edilebilir bir modül olarak çıkarıldı. **Puan değerleri ve sınıf eşikleri değişmedi** — bir tutarlılık testi bunu her koşuda doğrular.
- Adım gezinmesi sayısal indeksten adım kimliğine geçirildi; yeni adım eklemek artık numaralandırmayı bozmuyor.
- `docs/safety-and-privacy.md` yerel depolama davranışını doğru yansıtacak şekilde güncellendi.
- `docs/scoring-audit.md` gerçek test kapsamını ve bilinen eksikleri listeliyor.
- Dokümantasyon Türkçeleştirildi; `docs/architecture.md` ve `docs/clinical-workflow.md` eklendi.

### Değişmedi

- Riggs 2020 kriter puanları, sınıf eşikleri ve puanlama davranışı.
- Statik, derleme gerektirmeyen yapı.
- Hiçbir veri sunucuya gönderilmez.

## v0.1.0 — İlk GitHub Pages hazırlığı

- Tek dosya HTML prototipi
- Dokümantasyon iskeleti
- Kaynak eşleme şablonu
- Doğrulama planı
- Akademik kullanım bildirimi
- Test vakası şablonları
- Puanlama mantığı değiştirilmedi
