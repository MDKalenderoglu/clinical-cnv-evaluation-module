/**
 * Karar kapıları — kullanıcıyı yanlış yorumdan koruyan otomatik kontroller.
 */
"use strict";
var R = require("../../assets/js/cnv-resources.js");

function titles(gs) { return gs.map(function (g) { return g.title; }); }
function has(gs, sub) { return gs.some(function (g) { return g.title.indexOf(sub) >= 0; }); }
function levelOf(gs, sub) {
  var g = gs.find(function (x) { return x.title.indexOf(sub) >= 0; });
  return g ? g.level : null;
}

module.exports = function (suite) {
  suite("Build kontrolleri", function (t) {
    t.eq(levelOf(R.gates({}), "Genome build seçilmemiş"), "block",
      "build yoksa engelleyici uyarı");
    t.ok(!has(R.gates({ build: "GRCh38", coord: "chr1:1000000-2000000", testType: "SNP-array", pheno: "x", parentTest: "Her iki ebeveyn test edildi" }), "Genome build seçilmemiş"),
      "build seçiliyse uyarı yok");

    var conflict = R.gates({ build: "GRCh38", iscn: "arr[GRCh37] 15q11.2(100_200)x1" });
    t.eq(levelOf(conflict, "Build çelişkisi"), "block",
      "ISCN build'i seçili build ile çelişirse engelleyici uyarı");

    var agree = R.gates({ build: "GRCh37", iscn: "arr[hg19] 15q11.2(100_200)x1" });
    t.ok(!has(agree, "Build çelişkisi"), "hg19 ile GRCh37 eşdeğer sayılır");

    var agree38 = R.gates({ build: "GRCh38", iscn: "arr[hg38] 15q11.2(100_200)x1" });
    t.ok(!has(agree38, "Build çelişkisi"), "hg38 ile GRCh38 eşdeğer sayılır");
  });

  suite("Platform kontrolleri", function (t) {
    t.ok(has(R.gates({ testType: "aCGH" }), "aCGH platform kısıtı"),
      "aCGH'de BAF kısıtı bilgisi verilir");
    t.ok(!has(R.gates({ testType: "SNP-array" }), "aCGH platform kısıtı"),
      "SNP-array'de aCGH kısıtı gösterilmez");

    var bad = R.gates({ testType: "aCGH", cnvType: "roh" });
    t.eq(levelOf(bad, "Platform ile bulgu uyumsuz"), "block",
      "aCGH ile ROH bildirimi engelleyici uyarı verir");

    var cnloh = R.gates({ testType: "aCGH", cnvType: "cnloh" });
    t.eq(levelOf(cnloh, "Platform ile bulgu uyumsuz"), "block",
      "aCGH ile CN-LOH bildirimi de engellenir");

    t.ok(has(R.gates({ testType: "SNP-array", cnvType: "roh" }), "Riggs kapsamı dışında"),
      "ROH için Riggs kapsamı uyarısı verilir");
    t.ok(!has(R.gates({ testType: "SNP-array", cnvType: "roh" }), "Platform ile bulgu uyumsuz"),
      "SNP-array ile ROH engellenmez");
  });

  suite("Klinik bağlam kontrolleri", function (t) {
    t.ok(has(R.gates({}), "Ebeveyn testi yok"), "ebeveyn testi yoksa uyarı");
    t.ok(has(R.gates({ parentTest: "Bilgi yok" }), "Ebeveyn testi yok"), "'Bilgi yok' da uyarı verir");
    t.ok(!has(R.gates({ parentTest: "Her iki ebeveyn test edildi" }), "Ebeveyn testi yok"),
      "ebeveyn testi yapılmışsa uyarı yok");

    t.ok(has(R.gates({}), "Fenotip girilmemiş"), "fenotip yoksa uyarı");
    t.ok(!has(R.gates({ pheno: "Global gelişme geriliği" }), "Fenotip girilmemiş"),
      "fenotip girilmişse uyarı yok");
    t.ok(!has(R.gates({ hpo: "HP:0001263" }), "Fenotip girilmemiş"),
      "yalnız HPO girilmişse de yeterli");

    t.ok(has(R.gates({ copyState: "Mozaik" }), "Mozaiklik"), "mozaik durumda uyarı");
  });

  suite("Özel bölge tespiti", function (t) {
    var c = R.parseCoord("chr15:23600000-28400000");
    var hits = R.specialRegionHits(c, "GRCh37");
    t.ok(hits.some(function (h) { return h.kind === "imprint"; }),
      "15q11.2-q13 imprinted bölge olarak tespit edilir");

    var g = R.gates({ build: "GRCh37", coord: "chr15:23600000-28400000" });
    t.eq(levelOf(g, "İmprinted bölge"), "block",
      "imprinted bölge engelleyici uyarı verir");

    var pen = R.gates({ build: "GRCh37", coord: "chr16:29650000-30190000" });
    t.eq(levelOf(pen, "Azalmış penetrans"), "warn",
      "16p11.2 azalmış penetrans uyarısı verir");

    /* Örtüşmeyen bölge uyarı üretmemeli */
    var none = R.specialRegionHits(R.parseCoord("chr3:10000000-10100000"), "GRCh37");
    t.eq(none, [], "ilgisiz bölge için özel uyarı yok");

    /* Build'e göre farklı koordinat kullanılmalı */
    var h37 = R.specialRegionHits(R.parseCoord("chr17:34900000-36200000"), "GRCh37");
    var h38 = R.specialRegionHits(R.parseCoord("chr17:34900000-36200000"), "GRCh38");
    t.ok(h37.length > 0, "17q12 GRCh37 koordinatıyla bulunur");
    t.eq(h38.length, 0, "aynı sayı GRCh38'de 17q12'ye denk gelmez (build ayrımı çalışıyor)");

    /* Tüm bölgelerin her iki build'de tanımlı ve tutarlı olması */
    var badRegions = R.SPECIAL_REGIONS.filter(function (r) {
      return !r.GRCh37 || !r.GRCh38 || !r.note || !r.name ||
             ["imprint", "penetrance"].indexOf(r.kind) < 0 ||
             r.GRCh37.start >= r.GRCh37.end || r.GRCh38.start >= r.GRCh38.end ||
             r.GRCh37.chr !== r.GRCh38.chr;
    }).map(function (r) { return r.name; });
    t.eq(badRegions, [], "her özel bölge tanımı eksiksiz ve tutarlı");
  });

  suite("Sınırlılık metni", function (t) {
    var acgh = R.limitationsText({ testType: "aCGH", build: "GRCh37" });
    t.ok(acgh.some(function (l) { return l.indexOf("B-allel") >= 0; }),
      "aCGH için BAF sınırlılığı metne girer");

    var snp = R.limitationsText({ testType: "SNP-array", build: "GRCh38", parentTest: "Her iki ebeveyn test edildi" });
    t.ok(!snp.some(function (l) { return l.indexOf("B-allel") >= 0; }),
      "SNP-array'de BAF sınırlılığı yazılmaz");
    t.ok(!snp.some(function (l) { return l.indexOf("Ebeveyn çalışması yapılmadığından") >= 0; }),
      "ebeveyn testi yapılmışsa ilgili sınırlılık yazılmaz");

    var noParent = R.limitationsText({ testType: "SNP-array", parentTest: "Ebeveyn testi yapılmadı" });
    t.ok(noParent.some(function (l) { return l.indexOf("de novo") >= 0; }),
      "ebeveyn testi yoksa de novo belirsizliği yazılır");

    t.ok(R.limitationsText({}).every(function (l) { return typeof l === "string" && l.length > 20; }),
      "boş durumda bile anlamlı sınırlılık metni üretilir");
    t.ok(R.limitationsText({}).some(function (l) { return l.indexOf("dengeli yeniden düzenlenme") >= 0; }),
      "array'in dengeli yeniden düzenlenmeleri saptayamadığı her zaman belirtilir");
  });
};
