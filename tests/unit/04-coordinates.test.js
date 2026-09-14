/**
 * Koordinat ayrıştırma ve dış kaynak bağlantı üretimi.
 * Yanlış ayrıştırılan bir koordinat, yanlış genom bölgesinin sorgulanmasına
 * ve dolayısıyla yanlış sınıflandırmaya yol açabilir — bu yüzden sıkı test edilir.
 */
"use strict";
var R = require("../../assets/js/cnv-resources.js");

module.exports = function (suite) {
  suite("Koordinat ayrıştırma — geçerli biçimler", function (t) {
    t.eq(R.parseCoord("chr7:72846244-74187855"),
      { chr: "7", start: 72846244, end: 74187855, length: 1341612 }, "standart chr biçimi");
    t.eq(R.parseCoord("7:72846244-74187855").chr, "7", "chr öneki olmadan");
    t.eq(R.parseCoord("chr7:72,846,244-74,187,855").start, 72846244, "binlik ayırıcı temizlenir");
    t.eq(R.parseCoord("chr7 : 72846244 - 74187855").end, 74187855, "boşluklar temizlenir");
    t.eq(R.parseCoord("CHR7:100-200").chr, "7", "büyük harf kabul edilir");
    t.eq(R.parseCoord("chrX:1000-2000").chr, "X", "X kromozomu");
    t.eq(R.parseCoord("chrY:1000-2000").chr, "Y", "Y kromozomu");
    t.eq(R.parseCoord("chrMT:100-200").chr, "M", "MT → M normalize edilir");
    t.eq(R.parseCoord("chr07:100-200").chr, "7", "baştaki sıfır temizlenir");
    t.eq(R.parseCoord("chr22:1-999").chr, "22", "22. kromozom");
    t.eq(R.parseCoord("chr7:74187855-72846244").start, 72846244, "ters sıralı koordinat düzeltilir");
    t.eq(R.parseCoord("chr1:100_200").end, 200, "alt çizgi ayırıcı");
  });

  suite("Koordinat ayrıştırma — reddedilmesi gerekenler", function (t) {
    t.eq(R.parseCoord(""), null, "boş metin");
    t.eq(R.parseCoord(null), null, "null");
    t.eq(R.parseCoord(undefined), null, "undefined");
    t.eq(R.parseCoord("chr23:100-200"), null, "23. kromozom yok (X kullanılmalı)");
    t.eq(R.parseCoord("chr0:100-200"), null, "0. kromozom yok");
    t.eq(R.parseCoord("chr99:100-200"), null, "geçersiz kromozom");
    t.eq(R.parseCoord("chrZ:100-200"), null, "geçersiz kromozom harfi");
    t.eq(R.parseCoord("chr7:abc-def"), null, "sayı olmayan koordinat");
    t.eq(R.parseCoord("7q11.23"), null, "sitogenetik bant koordinat değildir");
    t.eq(R.parseCoord("chr7:100"), null, "tek koordinat aralık değildir");
  });

  suite("Boyut biçimlendirme", function (t) {
    t.eq(R.formatSize(500), "500 bp", "bp");
    t.eq(R.formatSize(440000), "440 kb", "kb");
    t.eq(R.formatSize(1341612), "1.34 Mb", "Mb");
    t.eq(R.formatSize(4800000), "4.80 Mb", "Mb, iki ondalık");
  });

  suite("Build eşlemesi", function (t) {
    t.eq(R.ucscDb("GRCh37"), "hg19", "GRCh37 → hg19");
    t.eq(R.ucscDb("GRCh38"), "hg38", "GRCh38 → hg38");
    t.eq(R.ucscDb(""), "hg38", "belirsiz → hg38 (güncel varsayılan)");
  });

  suite("Dış kaynak bağlantıları", function (t) {
    var c = R.parseCoord("chr15:22646694-23086471");
    var g37 = R.buildLinks(c, "GRCh37", { genes: "NIPA1", cytoband: "15q11.2" });
    var g38 = R.buildLinks(c, "GRCh38", { genes: "NIPA1", cytoband: "15q11.2" });

    t.ok(g37.length >= 6, "en az 6 kaynak grubu üretilir");

    var all37 = g37.reduce(function (a, g) { return a.concat(g.links); }, []);
    var all38 = g38.reduce(function (a, g) { return a.concat(g.links); }, []);

    t.ok(all37.length >= 15, "toplam en az 15 bağlantı (" + all37.length + ")");
    t.ok(all37.every(function (l) { return /^https?:\/\//.test(l.url); }),
      "her bağlantı mutlak http(s) URL");
    t.ok(all37.every(function (l) { return l.name && l.note; }),
      "her bağlantının adı ve açıklaması var");

    var ucsc37 = all37.find(function (l) { return l.name.indexOf("UCSC Genome") === 0; });
    var ucsc38 = all38.find(function (l) { return l.name.indexOf("UCSC Genome") === 0; });
    t.ok(ucsc37.url.indexOf("db=hg19") > 0, "GRCh37 → UCSC hg19");
    t.ok(ucsc38.url.indexOf("db=hg38") > 0, "GRCh38 → UCSC hg38");
    t.ok(ucsc37.url !== ucsc38.url, "build değişince UCSC bağlantısı da değişir");

    var ens37 = all37.find(function (l) { return l.name.indexOf("Ensembl Region") === 0; });
    t.ok(ens37.url.indexOf("grch37.ensembl.org") > 0, "GRCh37 → grch37.ensembl.org");

    var gnomad37 = all37.find(function (l) { return l.name === "gnomAD-SV"; });
    var gnomad38 = all38.find(function (l) { return l.name === "gnomAD-SV"; });
    t.ok(gnomad37.url.indexOf("sv_r2_1") > 0, "GRCh37 → gnomAD-SV r2.1");
    t.ok(gnomad38.url.indexOf("sv_r4") > 0, "GRCh38 → gnomAD-SV r4");

    /* Koordinat URL'e doğru geçmeli */
    t.ok(all37.some(function (l) { return l.url.indexOf("22646694") > 0; }),
      "başlangıç koordinatı bağlantılara geçer");

    /* Gen adı olmadan da çalışmalı (çökmemeli) */
    var noGene = R.buildLinks(c, "GRCh38", {});
    t.ok(noGene.reduce(function (a, g) { return a.concat(g.links); }, [])
      .every(function (l) { return /^https?:\/\//.test(l.url); }),
      "gen adı girilmemişken de geçerli bağlantı üretir");
  });
};
