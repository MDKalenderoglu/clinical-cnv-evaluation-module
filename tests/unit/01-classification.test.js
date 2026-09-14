/**
 * Sınıf eşikleri — Riggs et al. 2020, Table 1.
 *   ≥ 0.99          Patojenik
 *   0.90 – 0.98     Olası patojenik
 *   −0.89 – 0.89    Belirsiz anlamlı (VUS)
 *   −0.90 – −0.98   Olası benign
 *   ≤ −0.99         Benign
 */
"use strict";
var S = require("../../assets/js/cnv-scoring.js");

module.exports = function (suite) {
  suite("Sınıflandırma eşikleri (Riggs 2020 Table 1)", function (t) {
    /* Patojenik */
    t.eq(S.classify(0.99).code, "p", "0.99 → Patojenik (alt sınır)");
    t.eq(S.classify(1.00).code, "p", "1.00 → Patojenik");
    t.eq(S.classify(2.50).code, "p", "2.50 → Patojenik");

    /* Olası patojenik */
    t.eq(S.classify(0.90).code, "lp", "0.90 → Olası patojenik (alt sınır)");
    t.eq(S.classify(0.98).code, "lp", "0.98 → Olası patojenik (üst sınır)");
    /* Bilinçli davranış: classify() karşılaştırmadan ÖNCE 2 ondalığa yuvarlar.
       Bu, 0.15+0.30+0.45 gibi toplamların kayan nokta hatası yüzünden bir alt
       sınıfa düşmesini engeller. Riggs kriter puanlarının tümü 0.05'in katı
       olduğundan 0.985 gibi bir toplam gerçek kullanımda oluşamaz; test bu
       yuvarlama sözleşmesini belgelemek için vardır. */
    t.eq(S.classify(0.985).code, "p", "0.985 → 0.99'a yuvarlanır (belgelenmiş yuvarlama sözleşmesi)");
    t.eq(S.classify(0.8999999999999999).code, "lp",
      "kayan nokta hatalı 0.9 → LP (VUS'a düşmez)");

    /* VUS */
    t.eq(S.classify(0.89).code, "vus", "0.89 → VUS (üst sınır)");
    t.eq(S.classify(0).code, "vus", "0.00 → VUS");
    t.eq(S.classify(-0.89).code, "vus", "−0.89 → VUS (alt sınır)");

    /* Olası benign */
    t.eq(S.classify(-0.90).code, "lb", "−0.90 → Olası benign (üst sınır)");
    t.eq(S.classify(-0.98).code, "lb", "−0.98 → Olası benign (alt sınır)");

    /* Benign */
    t.eq(S.classify(-0.99).code, "b", "−0.99 → Benign (üst sınır)");
    t.eq(S.classify(-1.00).code, "b", "−1.00 → Benign");
    t.eq(S.classify(-2.00).code, "b", "−2.00 → Benign");
  });

  suite("Ulaşılabilir tüm toplamlar 0.05'in katıdır", function (t) {
    /* Riggs kriter puanlarının tümü 0.05'in katı olmalı; aksi hâlde
       yuvarlama sözleşmesi sınıf sınırında sürprize yol açabilir. */
    var bad = Object.keys(S.CRITERIA).filter(function (k) {
      return Math.abs(Math.round(S.CRITERIA[k].pts * 100) % 5) > 0;
    });
    t.eq(bad, [], "her kriter puanı 0.05'in katı");

    var badCase = Object.keys(S.CASE_EVIDENCE).filter(function (k) {
      var d = S.CASE_EVIDENCE[k];
      return Math.abs(Math.round(d.perCase * 100) % 5) > 0 ||
             Math.abs(Math.round(d.cap * 100) % 5) > 0;
    });
    t.eq(badCase, [], "her olgu kanıtı puanı ve tavanı 0.05'in katı");
  });

  suite("Sınıf sınırlarının bitişikliği", function (t) {
    /* Hiçbir puan iki sınıfa birden düşmemeli; sınırlar boşluksuz olmalı */
    var pts = [];
    for (var i = -150; i <= 150; i++) pts.push(i / 100);
    var codes = pts.map(function (p) { return S.classify(p).code; });
    t.ok(codes.every(function (c) { return ["p", "lp", "vus", "lb", "b"].indexOf(c) >= 0; }),
      "her puan tanımlı bir sınıfa düşer");

    /* Sınıf sırası monoton olmalı: b → lb → vus → lp → p */
    var rank = { b: 0, lb: 1, vus: 2, lp: 3, p: 4 };
    var mono = true;
    for (var j = 1; j < codes.length; j++) if (rank[codes[j]] < rank[codes[j - 1]]) mono = false;
    t.ok(mono, "puan arttıkça sınıf monoton olarak patojenik yöne gider");
  });
};
