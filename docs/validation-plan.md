# Doğrulama Planı

Bu plan, herhangi bir kurumsal veya klinik kullanımdan önce gereken doğrulama faaliyetlerini tanımlar. **Bu belgenin var olması doğrulamanın yapıldığı anlamına gelmez.**

Güncel durum için [scoring-audit.md](scoring-audit.md).

## Aşama 1 — Otomatik regresyon (TAMAMLANDI, v0.2.0)

`node tests/run.js` ile her değişiklikte koşar; GitHub Actions üzerinde her push'ta zorunludur.

- [x] Sınıf eşiklerinin tüm sınır değerleri
- [x] Puan toplama ve kayan nokta dayanıklılığı
- [x] Section 1–5 kriter puanlarının katalog bütünlüğü
- [x] Section 4A olgu çarpımı ve tavanları
- [x] Kayıp ve kazanım Section 3 eşiklerinin ayrı olması
- [x] Arayüzdeki her kriter butonunun modüldeki puanla birebir eşleşmesi
- [x] Koordinat ayrıştırmanın geçersiz girdileri reddetmesi
- [x] Karar kapılarının doğru seviyede (block/warn/info) tetiklenmesi
- [x] Ağ çağrısı bulunmaması
- [x] Otomatik kaydetmenin varsayılan kapalı olması

## Aşama 2 — Bağımsız araç karşılaştırması (KISMEN TAMAMLANDI — 2026-09-14)

- [x] `tests/unit/08-scenarios.test.js` içindeki 11 senaryodan **8'ini** ClinGen CNV Calculator'a elle girip sonuçları karşılaştırdık — **16/16 alt-değerlendirme sıfır sapmayla eşleşti.** Ayrıntı ve tam tablo: [scoring-audit.md](scoring-audit.md).
- [ ] Kalan 3 senaryoyu (7, 8, tam 4) tamamlayın — bunlar olgu-sayısı çarpanı ve çoklu kriter kombinasyonu içerdiği için hesaplayıcının arayüzünde daha fazla adım gerektiriyor.
- [ ] Her yeni sapma bulunduğunda `scoring-audit.md`'ye kaydedin; sapmanın aritmetikten mi kriter seçiminden mi kaynaklandığını ayırın.
- [ ] Aynı senaryoları Franklin ile karşılaştırın (ikincil referans) — henüz yapılmadı.
- [ ] En az 10 ek sentetik olgu ekleyin: 3 kayıp, 3 kazanım, 2 sınıf sınırı, 1 ROH, 1 mozaik

## Aşama 3 — Kaynak ve içerik doğrulaması (YAPILMADI)

- [ ] Her kriter metnini Riggs 2020 Table 1–2 ve Supplemental Material 1 ile karşılaştırın
- [ ] `SPECIAL_REGIONS` koordinatlarını ClinGen Dosage Map ve DECIPHER ile doğrulayın veya bölgeleri koordinatsız uyarıya çevirin
- [ ] Dış kaynak URL'lerinin her birini tarayıcıda açıp doğru bölgeye gittiğini teyit edin
- [ ] Sınırlılık metnini laboratuvar kalite sistemiyle uyumlu hâle getirin
- [ ] Arayüz metinlerini ACGS 2023 raporlama dili açısından inceleyin
- [ ] Uncoupling ilkesinin (sınıf ≠ hasta tanısı) her çıktıda korunduğunu doğrulayın

## Aşama 4 — Kullanım doğrulaması (YAPILMADI)

- [ ] En az 3 klinik genetik uzmanıyla aynı sentetik olgular üzerinde bağımsız değerlendirme; uyum (concordance) ölçümü
- [ ] Araçla ve araçsız değerlendirme süresi karşılaştırması
- [ ] Yanlış yönlendirme riski taraması: hangi adımda kullanıcı hatalı karar verebilir?
- [ ] Yazdırma/PDF çıktısının Chrome, Safari, Firefox'ta tutarlılığı
- [ ] Mobil ve tablet düzeninin kullanılabilirliği
- [ ] Erişilebilirlik: klavye ile tam gezinme, ekran okuyucu uyumu

## Aşama 5 — Yönetişim (YAPILMADI)

- [ ] Kurumsal veri yönetişimi onayı
- [ ] Etik kurul görüşü (eğitim amaçlı kullanım için)
- [ ] Sürüm dondurma ve değişiklik kontrol süreci
- [ ] Kullanıcı eğitimi ve sınırların yazılı bildirimi

## Kanıt kaydı

Her doğrulama koşumu şunları kaydetmelidir: test edilen sürüm (git commit), tarih, inceleyen, kaynak referansı, beklenen sonuç, gözlenen sonuç, geçti/kaldı ve notlar. **Yalnızca sentetik veya onaylanmış, tanımlayıcı içermeyen örnekler kullanılmalıdır.**
