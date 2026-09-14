/**
 * Section 4A — olgu kanıtının vaka sayısıyla çarpımı ve tavanları.
 * Riggs 2020: olgu başına puan × olgu sayısı, toplam 0.90 ile sınırlı
 * (4E için 0.30). 4D negatif yönde toplam −0.30 ile sınırlı.
 */
"use strict";
var S = require("../../assets/js/cnv-scoring.js");

module.exports = function (suite) {
  suite("Section 4A — olgu kanıtı toplamı", function (t) {
    /* 4A_conf: 0.45/olgu, tavan 0.90 */
    t.eq(S.caseEvidenceTotal("4A_conf", 1), 0.45, "4A teyitli × 1 olgu → 0.45");
    t.eq(S.caseEvidenceTotal("4A_conf", 2), 0.90, "4A teyitli × 2 olgu → 0.90 (tavan)");
    t.eq(S.caseEvidenceTotal("4A_conf", 5), 0.90, "4A teyitli × 5 olgu → 0.90 (tavan aşılmaz)");
    t.eq(S.caseEvidenceTotal("4A_conf", 100), 0.90, "olgu sayısı ne olursa olsun tavan 0.90");

    /* 4A_assu: 0.30/olgu */
    t.eq(S.caseEvidenceTotal("4A_assu", 1), 0.30, "4A varsayılan × 1 → 0.30");
    t.eq(S.caseEvidenceTotal("4A_assu", 3), 0.90, "4A varsayılan × 3 → 0.90 (tavan)");
    t.eq(S.caseEvidenceTotal("4A_assu", 4), 0.90, "4A varsayılan × 4 → 0.90");

    /* 4B / 4C */
    t.eq(S.caseEvidenceTotal("4B_conf", 2), 0.60, "4B teyitli × 2 → 0.60");
    t.eq(S.caseEvidenceTotal("4B_assu", 6), 0.90, "4B varsayılan × 6 → 0.90 (tavan)");
    t.eq(S.caseEvidenceTotal("4C_conf", 3), 0.45, "4C teyitli × 3 → 0.45");
    t.eq(S.caseEvidenceTotal("4C_assu", 4), 0.40, "4C varsayılan × 4 → 0.40");

    /* 4E: tavan 0.30 — diğerlerinden farklı */
    t.eq(S.caseEvidenceTotal("4E", 1), 0.10, "4E × 1 → 0.10");
    t.eq(S.caseEvidenceTotal("4E", 3), 0.30, "4E × 3 → 0.30 (tavan)");
    t.eq(S.caseEvidenceTotal("4E", 10), 0.30, "4E × 10 → 0.30, 0.90'a çıkmaz");

    /* 4D: negatif, tek seferlik */
    t.eq(S.caseEvidenceTotal("4D", 1), -0.30, "4D × 1 → −0.30");
    t.eq(S.caseEvidenceTotal("4D", 5), -0.30, "4D × 5 → −0.30 (biriktirilmez)");

    /* 4none */
    t.eq(S.caseEvidenceTotal("4none", 1), 0, "kanıt yok → 0");
    t.eq(S.caseEvidenceTotal("4none", 9), 0, "kanıt yok, olgu sayısı etkisiz");

    /* Sınır girdiler */
    t.eq(S.caseEvidenceTotal("4A_conf", 0), 0.45, "0 olgu en az 1 kabul edilir");
    t.eq(S.caseEvidenceTotal("4A_conf", -3), 0.45, "negatif olgu sayısı en az 1 kabul edilir");
    t.eq(S.caseEvidenceTotal("4A_conf", "2"), 0.90, "metin olarak gelen sayı ayrıştırılır");
    t.eq(S.caseEvidenceTotal("4A_conf", "abc"), 0.45, "sayı olmayan girdi 1 kabul edilir");
    t.eq(S.caseEvidenceTotal("bilinmeyen", 3), 0, "bilinmeyen anahtar → 0");
  });

  suite("Section 4A tavanı sınıfı tek başına belirleyemez", function (t) {
    /* Tek başına 4A tavanı (0.90) LP eşiğine ulaşır ama P'ye ulaşmaz */
    var only4a = S.total({ s4a: S.caseEvidenceTotal("4A_conf", 10) });
    t.eq(only4a, 0.90, "4A tavanı → 0.90");
    t.eq(S.classify(only4a).code, "lp", "yalnızca olgu kanıtı en fazla LP verir, P vermez");
  });
};
