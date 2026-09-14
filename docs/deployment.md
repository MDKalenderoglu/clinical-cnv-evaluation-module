# Yayınlama

## GitHub Pages

Depoda `.github/workflows/pages.yml` bulunur. Bu iş akışı `main` dalına her push'ta:

1. Testleri koşar (`node tests/run.js`)
2. Testler geçerse siteyi GitHub Pages'e yayınlar

Testler kırılırsa yayın yapılmaz.

### İlk kurulum

1. Depo ayarlarında **Settings → Pages → Source** seçeneğini **GitHub Actions** olarak ayarlayın.
2. `main` dalına push yapın.
3. Site şu adreste yayına girer:

```text
https://<kullanıcı-adı>.github.io/<depo-adı>/
```

Derleme adımı yoktur; `index.html` ve `assets/` doğrudan sunulur.

## Yerel çalıştırma

```bash
python3 -m http.server 8777
```

Sonra `http://localhost:8777` adresini açın. Alternatif olarak `index.html` dosyasını doğrudan tarayıcıda açabilirsiniz (`file://` ile de çalışır).

## Testleri koşma

```bash
node tests/run.js
```

Node.js 14+ yeterlidir. Bağımlılık yoktur.

## Sürümleme

`CHANGELOG.md` güncellenmeli ve `package.json` içindeki `version` alanı artırılmalıdır. Puanlama davranışını etkileyen her değişiklik `docs/scoring-audit.md`'ye yansıtılmalıdır.

## Yayın öncesi kontrol listesi

- [ ] `node tests/run.js` başarılı
- [ ] Gerçek hasta verisi, görsel veya olgu örneği commit edilmemiş
- [ ] `CHANGELOG.md` güncel
- [ ] Puanlama değiştiyse `docs/scoring-audit.md` güncel
- [ ] Uyarı ve sorumluluk metinleri yerinde
