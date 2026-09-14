/**
 * Uçtan uca senaryolar — sentetik, tanımlayıcı içermeyen örnekler.
 *
 * Her senaryo tam bir puanlama zinciri kurar ve beklenen sınıfı doğrular.
 * Bu senaryolar docs/scoring-audit.md'deki doğrulama tablosunun makine
 * tarafından koşulan karşılığıdır.
 *
 * UYARI: Beklenen sınıflar Riggs 2020 puan aritmetiğinden türetilmiştir.
 * Kriter SEÇİMİ klinik yorumdur ve burada varsayım olarak verilmiştir;
 * bu testler aracın aritmetiğini doğrular, klinik kararı değil.
 */
"use strict";
var S = require("../../assets/js/cnv-scoring.js");

function score(sel, caseEv) {
  var sc = { s1: 0, s2: 0, s3: 0, s4a: 0, s4seg: 0, s4b: 0, s5: 0 };
  Object.keys(sel).forEach(function (k) {
    var def = S.CRITERIA[sel[k]];
    if (!def) throw new Error("bilinmeyen kriter: " + sel[k]);
    sc[def.section] = def.pts;
  });
  if (caseEv) sc.s4a = S.caseEvidenceTotal(caseEv.key, caseEv.n);
  var t = S.total(sc);
  return { total: t, code: S.classify(t).code, cls: S.classify(t).cls };
}

module.exports = function (suite) {
  suite("Senaryo 1 — kurulmuş HI bölgenin tam delesyonu", function (t) {
    /* Bilinen mikrodelesyon sendromu bölgesi, de novo, fenotip uyumlu */
    var r = score({ s1: "1Ab", s2: "2A", s3: "3A_d", s5: "5A" });
    t.eq(r.total, 1.45, "1Ab(0) + 2A(+1.00) + 3A(0) + 5A(+0.45) = +1.45");
    t.eq(r.code, "p", "Patojenik");

    /* Tek başına 2A da patojenik eşiğini aşar */
    var only = score({ s2: "2A" });
    t.eq(only.total, 1.00, "2A tek başına +1.00");
    t.eq(only.code, "p", "2A tek başına Patojenik");
  });

  suite("Senaryo 2 — gen içermeyen intergenik delesyon", function (t) {
    var r = score({ s1: "1B" });
    t.eq(r.total, -0.60, "1B = −0.60");
    t.eq(r.code, "vus", "tek başına −0.60 henüz VUS — benign demek için ek kanıt gerekir");

    /* Popülasyon verisi eklenince benign olur */
    var withPop = score({ s1: "1B", s4b: "4O" });
    t.eq(withPop.total, -1.60, "1B + 4O = −1.60");
    t.eq(withPop.code, "b", "popülasyon frekansı >%1 eklenince Benign");
  });

  suite("Senaryo 3 — intragenik delesyon, PVS1 tam güç", function (t) {
    var r = score({ s1: "1A", s2: "2E" });
    t.eq(r.total, 0.90, "1A(0) + 2E(+0.90) = +0.90");
    t.eq(r.code, "lp", "tek başına LP — P için ek kanıt gerekir");

    var deNovo = score({ s1: "1A", s2: "2E", s5: "5A" });
    t.eq(deNovo.total, 1.35, "de novo eklenince +1.35");
    t.eq(deNovo.code, "p", "2E + 5A → Patojenik");

    /* Aynı CNV etkilenmemiş ebeveynden kalıtılmışsa */
    var inherited = score({ s1: "1A", s2: "2E", s5: "5B" });
    t.eq(inherited.total, 0.60, "2E + 5B = +0.60");
    t.eq(inherited.code, "vus", "etkilenmemiş ebeveynden kalıtım LP'den VUS'a düşürür");
  });

  suite("Senaryo 4 — büyük, çok genli delesyon, kanıtsız", function (t) {
    /* 35+ gen içeren büyük delesyon ama bilinen sendrom değil */
    var r = score({ s1: "1Ab", s2: "2none", s3: "3C_d" });
    t.eq(r.total, 0.90, "3C(+0.90) tek başına");
    t.eq(r.code, "lp", "yalnızca gen sayısı LP verir — dikkatle yorumlanmalı");

    var withDeNovo = score({ s1: "1Ab", s2: "2none", s3: "3C_d", s5: "5A" });
    t.eq(withDeNovo.code, "p", "de novo eklenince Patojenik (+1.35)");

    /* 25–34 gen aralığı */
    var mid = score({ s1: "1Ab", s3: "3B_d" });
    t.eq(mid.total, 0.45, "25–34 gen → +0.45");
    t.eq(mid.code, "vus", "tek başına VUS");
  });

  suite("Senaryo 5 — duplikasyon, benign bölge örtüşmesi", function (t) {
    var r = score({ s1: "1Ab", s2: "2C_d" });
    t.eq(r.total, -1.00, "2C DUP (bilinen benign DUP ile birebir) = −1.00");
    t.eq(r.code, "b", "Benign");

    /* Kırılma noktası gen kesiyorsa benign kanıtı kaybolur */
    var breaks = score({ s1: "1Ab", s2: "2E_d" });
    t.eq(breaks.total, 0, "kırılma noktası gen kesiyorsa 2E_d = 0");
    t.eq(breaks.code, "vus", "VUS'a döner");
  });

  suite("Senaryo 6 — duplikasyon, kurulmuş TS bölge", function (t) {
    var r = score({ s1: "1Ab", s2: "2A_d", s3: "3A_u" });
    t.eq(r.total, 1.00, "2A DUP = +1.00");
    t.eq(r.code, "p", "Patojenik");

    /* Gain Section 3 eşiği loss'tan farklıdır: 35–49 gen → 0.45 */
    var manyGenes = score({ s1: "1Ab", s2: "2G_d", s3: "3B_u" });
    t.eq(manyGenes.total, 0.45, "gain 35–49 gen → +0.45");
    t.eq(manyGenes.code, "vus", "tek başına VUS");
  });

  suite("Senaryo 7 — literatür olgularıyla birikimli kanıt", function (t) {
    /* Bilinen sendrom değil; 2 yayınlanmış de novo olgu, fenotip özgül */
    var two = score({ s1: "1Ab", s3: "3A_d" }, { key: "4A_conf", n: 2 });
    t.eq(two.total, 0.90, "2 teyitli olgu → 4A tavanı +0.90");
    t.eq(two.code, "lp", "Olası patojenik");

    /* Hastanın kendisi de de novo ise patojeniğe çıkar */
    var withOwn = score({ s1: "1Ab", s3: "3A_d", s5: "5A" }, { key: "4A_conf", n: 2 });
    t.eq(withOwn.total, 1.35, "+0.90 + 0.45 = +1.35");
    t.eq(withOwn.code, "p", "Patojenik");

    /* Tek olgu yeterli değil */
    var one = score({ s1: "1Ab" }, { key: "4A_conf", n: 1 });
    t.eq(one.total, 0.45, "tek teyitli olgu → +0.45");
    t.eq(one.code, "vus", "tek olgu VUS'ta bırakır");
  });

  suite("Senaryo 8 — fenotip tutarsız olgular", function (t) {
    var r = score({ s1: "1Ab", s2: "2H" }, { key: "4D", n: 3 });
    t.eq(r.total, -0.15, "2H(+0.15) + 4D(−0.30) = −0.15");
    t.eq(r.code, "vus", "VUS");
  });

  suite("Senaryo 9 — segregasyon ağırlıklı aile", function (t) {
    var r = score({ s1: "1Ab", s4seg: "4H", s5: "5D_7" });
    t.eq(r.total, 0.90, "4H(+0.45) + 5D_7(+0.45) = +0.90");
    t.eq(r.code, "lp", "Olası patojenik");

    /* Ters segregasyon */
    var against = score({ s1: "1Ab", s4seg: "4I", s5: "5E_i" });
    t.eq(against.total, -0.90, "4I(−0.45) + 5E_i(−0.45) = −0.90");
    t.eq(against.code, "lb", "Olası benign");
  });

  suite("Senaryo 10 — olgu-kontrol verisi benign yönde", function (t) {
    var r = score({ s1: "1Ab", s4b: "4N" });
    t.eq(r.total, -0.90, "4N = −0.90");
    t.eq(r.code, "lb", "Olası benign");

    var withGeneless = score({ s1: "1B", s4b: "4N" });
    t.eq(withGeneless.total, -1.50, "1B + 4N = −1.50");
    t.eq(withGeneless.code, "b", "Benign");
  });

  suite("Senaryo 11 — sınıf sınırında hassasiyet", function (t) {
    /* LP ile P arasındaki fark tek bir destekleyici kriter olabilir */
    var lp = score({ s2: "2E" });
    var p = score({ s2: "2E", s4seg: "4F" });
    t.eq(lp.code, "lp", "2E tek başına LP (+0.90)");
    t.eq(p.total, 1.05, "2E + 4F = +1.05");
    t.eq(p.code, "p", "+0.15'lik destekleyici kriter sınıfı P'ye taşır");

    /* Bu hassasiyet, kanıt toplama adımının neden atlanamayacağını gösterir */
    var vus = score({ s2: "2E", s5: "5C" });
    t.eq(vus.total, 0.75, "2E + 5C = +0.75");
    t.eq(vus.code, "vus", "küçük bir negatif kriter LP'yi VUS'a düşürür");
  });
};
