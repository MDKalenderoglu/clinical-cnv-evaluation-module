# Güvenlik ve Gizlilik

## Mimari

Bu proje tamamen istemci tarafında çalışan statik bir uygulamadır. Sunucu tarafı işlem, kimlik doğrulama, veritabanı veya analitik yoktur.

## Ağ davranışı

Uygulama kodunda `fetch`, `XMLHttpRequest`, `navigator.sendBeacon` ve `WebSocket` **bulunmaz**. Bu, `tests/unit/07-html-consistency.test.js` içindeki "Gizlilik sözleşmesi" testiyle her koşuda doğrulanır. Girilen hiçbir veri kendiliğinden ağa çıkmaz.

Kanıt toplama adımındaki dış kaynak bağlantıları yalnızca **kullanıcı tıkladığında** açılır. Bu bağlantılar CNV koordinatı, genome build ve (girildiyse) gen adı içerir; **hasta tanımlayıcısı, yaş, fenotip veya HPO terimi hiçbir bağlantıya konmaz.** Bir bağlantıya tıklamak, o koordinatı ilgili kamusal veritabanına göndermek demektir — bu, kullanıcının bilinçli kararıdır ve normal klinik uygulamanın parçasıdır.

## Yerel depolama (localStorage)

| Anahtar | İçerik | Varsayılan |
| --- | --- | --- |
| `cnv-theme` | Açık/koyu tema tercihi | Kullanıcı temayı değiştirdiğinde yazılır |
| `cnv-autosave` | Otomatik kaydetmenin açık olup olmadığı | **Kapalı** |
| `cnv-case-draft` | Olgu taslağının tamamı | Yalnızca otomatik kaydetme açıkken yazılır |

**Otomatik kaydetme varsayılan olarak kapalıdır.** Açılması için kullanıcının, verilerin cihazda kalacağını açıkça bildiren bir onay kutusunu kabul etmesi gerekir. Kapatıldığında saklanan taslak da silinir. "Yerel kaydı sil" düğmesi her zaman erişilebilirdir.

Otomatik kaydetme açıkken **hasta tanımlayıcıları dahil tüm girdiler** o tarayıcının yerel deposuna yazılır ve kullanıcı silene kadar cihazda kalır. **Ortak kullanılan bilgisayarlarda açılmamalıdır.**

## Görseller

Yüklenen fenotip/rapor görselleri yalnızca tarayıcı oturumunda bellekte tutulur ve önizlenir. Sunucuya gönderilmez ve yerel depolamaya yazılmaz. Sayfa kapatıldığında kaybolur. Bu sürümde görselden otomatik metin çıkarımı (OCR) yapılmaz.

## Olgu dosyaları (JSON)

"Olguyu Kaydet" ile indirilen `.json` dosyası **girilen tüm veriyi düz metin olarak içerir**, hasta tanımlayıcıları dahil. Bu dosya kurumsal veri yönetişimi kurallarına tabidir: şifresiz paylaşılmamalı, depoya eklenmemeli ve korunmasız ortamda saklanmamalıdır.

## Markdown özet

Üretilen Markdown özet hasta tanımlayıcısı içerebilir. Paylaşmadan önce içerik kontrol edilmelidir. Metin otomatik üretilmiştir ve uzman doğrulaması olmadan klinik raporda kullanılmamalıdır.

## Depo kuralları

Depoya gerçek hasta verisi, tanımlayıcı, görsel, ekran görüntüsü, dışa aktarılmış rapor veya gerçek olgu örneği **eklenmemelidir**. Tüm test ve örnekler sentetik ve tanımlayıcı içermeyen olmalıdır. `.gitignore` yaygın sızıntı yollarını (`*.pdf`, `*.docx`, `_local_sources/`) kapatır ancak tek başına yeterli güvence değildir.

## Sorumluluk

Kurumsal onam, etik onay ve veri güvenliği sorumluluğu kullanıcıya aittir.
