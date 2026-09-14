/**
 * SPECIAL_REGIONS sınırlarının ClinGen Dosage Sensitivity Map ile
 * çapraz doğrulaması.
 *
 * Yöntem: search.clinicalgenome.org/kb/gene-dosage üzerinde her bölge
 * için "Region (GRCh37)" / "Region (GRCh38)" koordinat sorgusu elle
 * çalıştırıldı (2026-09-14) ve ClinGen'in kürasyon ettiği resmî
 * "recurrent region" sınırları not edildi. Bu test, bizim
 * SPECIAL_REGIONS girdimizin o resmî sınırı TAM OLARAK KAPSADIĞINI
 * (overlap değil, containment) doğrular — yalnızca örtüşme yeterli
 * değildir, çünkü amacımız gerçek bölgeyle kesişen her CNV'yi
 * yakalamaktır.
 *
 * Sınır güncellendiğinde (yeni ClinGen kürasyonu) bu test kırılır ve
 * hangi bölgenin yeniden kontrol edilmesi gerektiğini gösterir.
 */
"use strict";
var R = require("../../assets/js/cnv-resources.js");

/* [isim alt dizesi, build, ClinGen'in kürasyon ettiği gerçek sınır] */
var CLINGEN_TRUTH = [
  ["15q11.2-q13", "GRCh37", { chr: "15", start: 22832519, end: 28379874 }],
  ["15q11.2-q13", "GRCh38", { chr: "15", start: 22782170, end: 28134728 }],
  ["14q32.2",      "GRCh37", { chr: "14", start: 100394594, end: 101504529 }],
  ["14q32.2",      "GRCh38", { chr: "14", start: 99928257,  end: 101038192 }],
  ["6q24",         "GRCh37", { chr: "6",  start: 144243292, end: 144416561 }],
  ["6q24",         "GRCh38", { chr: "6",  start: 143922155, end: 144095424 }],
  ["1q21.1 distal","GRCh37", { chr: "1",  start: 146577486, end: 147394506 }],
  ["1q21.1 distal","GRCh38", { chr: "1",  start: 147105904, end: 147917509 }],
  ["15q11.2 BP1-BP2","GRCh37", { chr: "15", start: 22832519, end: 23090897 }],
  ["15q11.2 BP1-BP2","GRCh38", { chr: "15", start: 22782170, end: 23040134 }],
  ["15q13.3",      "GRCh37", { chr: "15", start: 31192889, end: 32445405 }],
  ["15q13.3",      "GRCh38", { chr: "15", start: 30900686, end: 32153204 }],
  ["16p11.2 proksimal","GRCh37", { chr: "16", start: 29649997, end: 30199852 }],
  ["16p11.2 proksimal","GRCh38", { chr: "16", start: 29638676, end: 30188531 }],
  ["16p11.2 distal","GRCh37", { chr: "16", start: 28822635, end: 29046499 }],
  ["16p11.2 distal","GRCh38", { chr: "16", start: 28811314, end: 29035178 }],
  ["16p12.2",       "GRCh37", { chr: "16", start: 21948445, end: 22430804 }],
  ["16p12.2",       "GRCh38", { chr: "16", start: 21937124, end: 22419483 }],
  ["16p13.11",      "GRCh37", { chr: "16", start: 15511711, end: 16292265 }],
  ["16p13.11",      "GRCh38", { chr: "16", start: 15417854, end: 16198408 }],
  ["17q12",         "GRCh37", { chr: "17", start: 34815072, end: 36192489 }],
  ["17q12",         "GRCh38", { chr: "17", start: 36458167, end: 37854616 }],
  ["22q11.2 distal","GRCh37", { chr: "22", start: 21917117, end: 22963077 }],
  ["22q11.2 distal","GRCh38", { chr: "22", start: 21562828, end: 22620608 }],
  ["2q13",          "GRCh37", { chr: "2", start: 110862108, end: 113104742 }], // proksimal+distal birlikte
  ["2q13",          "GRCh38", { chr: "2", start: 110104531, end: 112347165 }],
  ["20q13.32",      "GRCh37", { chr: "20", start: 57414803, end: 57486247 }], // GNAS gen sınırı
  ["20q13.32",      "GRCh38", { chr: "20", start: 58839748, end: 58911192 }]
];

function findRegion(nameSub) {
  return R.SPECIAL_REGIONS.find(function (r) { return r.name.indexOf(nameSub) === 0 || r.name.indexOf(nameSub) >= 0; });
}

function contains(outer, inner) {
  return outer.chr === inner.chr && outer.start <= inner.start && outer.end >= inner.end;
}

module.exports = function (suite) {
  suite("SPECIAL_REGIONS — ClinGen Dosage Map ile çapraz doğrulama (2026-09-14)", function (t) {
    CLINGEN_TRUTH.forEach(function (row) {
      var nameSub = row[0], build = row[1], truth = row[2];
      var region = findRegion(nameSub);
      t.ok(!!region, nameSub + " (" + build + ") — SPECIAL_REGIONS içinde bulundu");
      if (!region) return;
      var ours = region[build];
      t.ok(contains(ours, truth),
        nameSub + " (" + build + ") — bizim sınırımız [" + ours.start + "-" + ours.end +
        "] ClinGen'in kürasyon ettiği [" + truth.start + "-" + truth.end + "] aralığını tam kapsıyor");
    });
  });

  suite("22q11.2 distal — geçmiş hata regresyonu", function (t) {
    /* v0.2.0'da bu bölge GRCh37 21000000-21900000 idi ve ClinGen'in
       gerçek "distal type I" bölgesiyle (21917117-22963077) HİÇ
       örtüşmüyordu — santral bölgeyle (B-D/C-D) karışmıştı. Bu test
       o regresyonun geri gelmediğini garanti eder. */
    var region = findRegion("22q11.2 distal");
    var c37 = R.parseCoord("chr22:21950000-22100000"); // gerçek distal bölge içinde bir CNV
    var hits37 = R.specialRegionHits(c37, "GRCh37");
    t.ok(hits37.some(function (h) { return h.name.indexOf("22q11.2 distal") >= 0; }),
      "gerçek distal bölge (chr22:21.95-22.1M) artık tespit ediliyor");

    var c38 = R.parseCoord("chr22:21700000-21900000");
    var hits38 = R.specialRegionHits(c38, "GRCh38");
    t.ok(hits38.some(function (h) { return h.name.indexOf("22q11.2 distal") >= 0; }),
      "GRCh38'de de gerçek distal bölge tespit ediliyor");
  });

  suite("1q21.1 distal ve 15q11.2 BP1-BP2 — GRCh38 uç kesilmesi regresyonu", function (t) {
    /* v0.2.0'da bu iki bölgenin GRCh38 sonu, ClinGen'in gerçek
       sınırından önce kesiliyordu. */
    var c1 = R.parseCoord("chr1:147500000-147700000"); // true range sonuna yakın
    var hits1 = R.specialRegionHits(c1, "GRCh38");
    t.ok(hits1.some(function (h) { return h.name.indexOf("1q21.1 distal") >= 0; }),
      "1q21.1 distal GRCh38 — gerçek bölgenin son kısmı artık kaçırılmıyor");

    var c2 = R.parseCoord("chr15:22900000-23000000"); // true range sonuna yakın
    var hits2 = R.specialRegionHits(c2, "GRCh38");
    t.ok(hits2.some(function (h) { return h.name.indexOf("15q11.2 BP1-BP2") >= 0; }),
      "15q11.2 BP1-BP2 GRCh38 — gerçek bölgenin son kısmı artık kaçırılmıyor");
  });

  suite("2q13 — proksimal alt bölge regresyonu", function (t) {
    /* v0.2.0'da yalnızca distal (BCL2L11) alt bölge kısmen
       kapsanıyordu; proksimal (NPHP1) alt bölge tamamen kaçırılıyordu. */
    var c37 = R.parseCoord("chr2:110900000-110950000"); // proksimal (NPHP1) içinde
    var hits37 = R.specialRegionHits(c37, "GRCh37");
    t.ok(hits37.some(function (h) { return h.name.indexOf("2q13") >= 0; }),
      "2q13 proksimal (NPHP1) alt bölgesi GRCh37'de artık tespit ediliyor");

    var c38 = R.parseCoord("chr2:110150000-110200000");
    var hits38 = R.specialRegionHits(c38, "GRCh38");
    t.ok(hits38.some(function (h) { return h.name.indexOf("2q13") >= 0; }),
      "2q13 proksimal (NPHP1) alt bölgesi GRCh38'de artık tespit ediliyor");
  });
};
