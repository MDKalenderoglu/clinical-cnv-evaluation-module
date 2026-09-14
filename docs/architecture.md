# Mimari

## Tasarım kısıtları

1. **Derleme adımı yok.** Depo doğrudan GitHub Pages'e gider; `index.html` `file://` ile de açılır.
2. **Ağ çağrısı yok.** Hasta verisi tarayıcıdan çıkmaz. Bu, bir testle güvence altındadır (`tests/unit/07-html-consistency.test.js`, "Gizlilik sözleşmesi").
3. **Puanlama mantığı test edilebilir olmalı.** Bu yüzden arayüzden ayrı, saf bir modüldedir.

## Katmanlar

```
┌──────────────────────────────────────────────┐
│ index.html                                   │
│  · Arayüz, içerik, klinisyen rehberleri      │
│  · Inline script: gezinme, seçim, render     │
└───────────────┬──────────────────────────────┘
                │ kullanır
┌───────────────▼──────────────────────────────┐
│ cnv-scoring.js   (saf, Node'da da çalışır)   │
│  · THRESHOLDS, CRITERIA, CASE_EVIDENCE       │
│  · classify(), total(), caseEvidenceTotal()  │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ cnv-resources.js (saf)                       │
│  · parseCoord(), buildLinks()                │
│  · SPECIAL_REGIONS, specialRegionHits()      │
│  · gates(), limitationsText()                │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ cnv-case.js      (saf + localStorage)        │
│  · collect(), apply(), save(), load()        │
│  · EVIDENCE_ROWS, toMarkdown()               │
└───────────────▲──────────────────────────────┘
                │ bağlar
┌───────────────┴──────────────────────────────┐
│ cnv-app.js                                   │
│  · Adım sırası (goStep), kanıt adımı render  │
│  · Kaydetme/yükleme, Markdown paneli         │
│  · Inline fonksiyonları sarmalar (wrap)      │
└──────────────────────────────────────────────┘
```

### Neden sarmalama (monkey-patch)?

`cnv-app.js`, inline script'ten **sonra** yüklenir ve `pick`, `pickS4a`, `resetAll` gibi mevcut global fonksiyonları sarmalayarak davranış ekler. Böylece 1900 satırlık arayüz kodunu yeniden yazmadan yeni özellikler eklenebildi ve mevcut puanlama davranışı değişmedi. `tests/unit/07-html-consistency.test.js` yükleme sırasını da doğrular.

### Adım sırası

Adımlar `cnv-app.js` içindeki `STEPS` dizisinde tutulur. Yeni bir adım eklemek için diziye kimliğini yazmak yeterlidir; eski `goTo(5)` gibi sayısal çağrılar bir uyum katmanıyla adım kimliğine çevrilir, dolayısıyla numaralandırma bozulmaz.

## Veri akışı

```
Rapor metni ──parseReportText──► Olgu kartı alanları
                                      │
                                      ├──► gates()            → Kontrol uyarıları
                                      ├──► buildLinks()       → Derin linkler
                                      └──► limitationsText()  → Sınırlılık paragrafı
Kriter seçimleri ──pick()──► sc / sel ──► CNVScoring.total() ──► classify()
                                      │
Kanıt çalışma sayfası ────────────────┴──► toMarkdown() ──► Markdown özet
                                      └──► collect() ─────► olgu.json
```

## Olgu dosyası şeması (`cnv-case/1`)

```json
{
  "schema": "cnv-case/1",
  "savedAt": "2026-01-01T00:00:00.000Z",
  "fields": { "ptId": "...", "ptCoord": "...", "evGnomad": "...", "evGnomad_done": true },
  "scoring": { "sc": {}, "sel": {}, "cnvT": "del", "s4aKey": "4A_conf", "s4aPPCase": 0.45 }
}
```

Şema sürümü değişirse `cnv-case.js` içindeki `SCHEMA` sabiti artırılmalı ve geriye dönük yükleme yolu eklenmelidir.

## Yeni kriter eklerken

1. `cnv-scoring.js` içindeki `CRITERIA`'ya anahtar, bölüm, puan, tip ve açıklama ekleyin.
2. `index.html` içine aynı anahtar ve puanla `pick(...)` butonunu ekleyin.
3. `node tests/run.js` koşun — tutarsızlık varsa 07 numaralı test kırılır.
4. Mümkünse `tests/unit/08-scenarios.test.js`'e kriteri kullanan bir senaryo ekleyin.

## Özel bölge tablosu

`cnv-resources.js` içindeki `SPECIAL_REGIONS` imprinted ve azalmış penetranslı bölgeleri listeler. **Sınırlar yaklaşıktır**; amaç kesin örtüşme hesabı değil, klinisyeni doğru soruyu sormaya yönlendirmektir. Her giriş her iki build için koordinat içermek zorundadır (test bunu doğrular).
