/**
 * Puan toplama ve kayan nokta davranışı.
 */
"use strict";
var S = require("../../assets/js/cnv-scoring.js");

module.exports = function (suite) {
  suite("Toplam puan", function (t) {
    t.eq(S.total({}), 0, "boş durum → 0");
    t.eq(S.total({ s1: 0, s2: 1.0, s3: 0, s4a: 0, s4seg: 0, s4b: 0, s5: 0 }), 1.0, "tek kriter 2A → 1.00");
    t.eq(S.total({ s2: 0.90, s5: 0.45 }), 1.35, "2E + 5A → 1.35");

    /* Kayan nokta: 0.15+0.30+0.45 ham JS'te 0.8999999... olur */
    t.eq(S.total({ s1: 0.15, s2: 0.30, s3: 0.45 }), 0.90, "0.15+0.30+0.45 → tam 0.90 (yuvarlama)");
    t.eq(S.classify(S.total({ s1: 0.15, s2: 0.30, s3: 0.45 })).code, "lp",
      "0.15+0.30+0.45 kayan nokta hatası yüzünden VUS'a düşmemeli");

    t.eq(S.total({ s2: -1.0, s4b: -1.0 }), -2.0, "iki güçlü benign kanıt → −2.00");
    t.eq(S.total({ s1: -0.60, s4b: -0.90 }), -1.50, "1B + 4N → −1.50 → Benign");
    t.eq(S.classify(S.total({ s1: -0.60, s4b: -0.90 })).code, "b", "1B + 4N → Benign");

    /* Bilinmeyen/bozuk değerler toplamı bozmamalı */
    t.eq(S.total({ s1: "abc", s2: 1.0 }), 1.0, "sayı olmayan alan yok sayılır");
    t.eq(S.total({ s1: null, s2: undefined, s3: 0.45 }), 0.45, "null/undefined yok sayılır");
  });

  suite("Kriter kataloğu bütünlüğü", function (t) {
    var keys = Object.keys(S.CRITERIA);
    t.ok(keys.length > 50, "kriter sayısı beklenen aralıkta (" + keys.length + ")");

    var badSection = keys.filter(function (k) {
      return S.SECTIONS.indexOf(S.CRITERIA[k].section) < 0;
    });
    t.eq(badSection, [], "her kriter tanımlı bir bölüme ait");

    var badPts = keys.filter(function (k) {
      var p = S.CRITERIA[k].pts;
      return typeof p !== "number" || p < -1 || p > 1;
    });
    t.eq(badPts, [], "her kriter puanı −1.00 ile +1.00 arasında");

    var badType = keys.filter(function (k) {
      return ["loss", "gain", "both"].indexOf(S.CRITERIA[k].type) < 0;
    });
    t.eq(badType, [], "her kriterin geçerli bir CNV tipi var");

    var noLabel = keys.filter(function (k) { return !S.CRITERIA[k].label; });
    t.eq(noLabel, [], "her kriterin açıklaması var");
  });

  suite("Anahtar puan değerleri (Riggs 2020 Supplemental Material 1)", function (t) {
    t.eq(S.pointsFor("1B"), -0.60, "1B — gen içermiyor");
    t.eq(S.pointsFor("2A"), 1.00, "2A — kurulmuş HI bölge tam örtüşme");
    t.eq(S.pointsFor("2F"), -1.00, "2F — kurulmuş benign bölge tam örtüşme");
    t.eq(S.pointsFor("2E"), 0.90, "2E — intragenik, PVS1 tam güç");
    t.eq(S.pointsFor("2H"), 0.15, "2H — HI prediktörleri");
    t.eq(S.pointsFor("3B_d"), 0.45, "3B loss — 25–34 gen");
    t.eq(S.pointsFor("3C_d"), 0.90, "3C loss — ≥35 gen");
    t.eq(S.pointsFor("3B_u"), 0.45, "3B gain — 35–49 gen");
    t.eq(S.pointsFor("3C_u"), 0.90, "3C gain — ≥50 gen");
    t.eq(S.pointsFor("4N"), -0.90, "4N — olgu-kontrol farkı yok");
    t.eq(S.pointsFor("4O"), -1.00, "4O — popülasyonda >%1");
    t.eq(S.pointsFor("5A"), 0.45, "5A — de novo, yüksek özgüllükte fenotip");
    t.eq(S.pointsFor("5B"), -0.30, "5B — etkilenmemiş ebeveynden kalıtım");
    t.eq(S.pointsFor("bilinmeyen"), null, "bilinmeyen anahtar → null");
  });

  suite("Loss ve gain Section 3 eşikleri farklıdır", function (t) {
    /* Riggs 2020: loss için 25/35, gain için 35/50 */
    t.ok(S.CRITERIA["3A_d"].type === "loss" && S.CRITERIA["3A_u"].type === "gain",
      "Section 3 kriterleri tipe göre ayrılmış");
    t.eq(S.pointsFor("3A_d"), 0, "loss 0–24 gen → 0.00");
    t.eq(S.pointsFor("3A_u"), 0, "gain 0–34 gen → 0.00");
  });
};
