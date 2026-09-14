/**
 * Olgu dosyası (JSON) ve Markdown özet üretimi.
 */
"use strict";
var C = require("../../assets/js/cnv-case.js");

module.exports = function (suite) {
  suite("Olgu dosyası şeması", function (t) {
    var d = C.collect(null, { sc: { s2: 1.0 }, sel: { s2: "2A" } });
    t.eq(d.schema, "cnv-case/1", "şema sürümü yazılır");
    t.ok(typeof d.savedAt === "string" && d.savedAt.length > 10, "kayıt zamanı ISO biçiminde");
    t.eq(d.scoring.sel.s2, "2A", "puanlama durumu korunur");
    t.ok(d.fields && typeof d.fields === "object", "alanlar nesnesi var");

    t.ok(C.FIELD_IDS.indexOf("ptId") >= 0, "hasta kimliği alanı kayıtlı");
    t.ok(C.FIELD_IDS.indexOf("ptCoord") >= 0, "koordinat alanı kayıtlı");
    t.ok(C.FIELD_IDS.indexOf("rcNotes") >= 0, "serbest not alanı kayıtlı");
    t.eq(C.FIELD_IDS.length, new Set(C.FIELD_IDS).size, "alan listesinde tekrar yok");
  });

  suite("Kanıt satırları", function (t) {
    t.ok(C.EVIDENCE_ROWS.length >= 10, "en az 10 kaynak sorgulanır");
    t.eq(C.EVIDENCE_ROWS.map(function (r) { return r.id; }).length,
      new Set(C.EVIDENCE_ROWS.map(function (r) { return r.id; })).size,
      "kanıt satırı kimlikleri benzersiz");
    t.ok(C.EVIDENCE_ROWS.every(function (r) { return r.src && r.ask && r.feeds; }),
      "her satırda kaynak, soru ve beslediği bölüm var");
    t.ok(C.EVIDENCE_ROWS.some(function (r) { return /gnomAD-SV/.test(r.src); }), "gnomAD-SV sorgulanır");
    t.ok(C.EVIDENCE_ROWS.some(function (r) { return /ClinGen Dosage/.test(r.src); }), "ClinGen Dosage sorgulanır");
    t.ok(C.EVIDENCE_ROWS.some(function (r) { return /OMIM/.test(r.src); }), "OMIM sorgulanır");
    t.ok(C.EVIDENCE_ROWS.some(function (r) { return /Ebeveyn/.test(r.src); }), "ebeveyn çalışması sorgulanır");
  });

  suite("Markdown üretimi", function (t) {
    var md = C.toMarkdown({
      fields: { ptId: "A.K.", ptAge: "3 yaş", ptCoord: "chr15:22646694-23086471", ptBuild: "GRCh37", rcNotes: "not" },
      scoring: { sc: { s2: 1.0, s5: 0.45 }, sel: { s2: "2A", s5: "5A" }, total: 1.45, classification: "Patojenik (P)" },
      evidence: [{ src: "gnomAD-SV", ask: "s", feeds: "4O", value: "yok", done: true },
                 { src: "DGV", ask: "s", feeds: "4", value: "", done: false }],
      gates: [{ level: "block", title: "İmprinted bölge", text: "metin" }],
      limitations: ["Sınırlılık bir", "Sınırlılık iki"]
    });

    t.ok(md.indexOf("# CNV Değerlendirme Özeti") === 0, "başlıkla başlar");
    t.ok(md.indexOf("A.K.") > 0, "hasta kimliği yer alır");
    t.ok(md.indexOf("chr15:22646694-23086471") > 0, "koordinat yer alır");
    t.ok(md.indexOf("| **TOPLAM** | | **+1.45** |") > 0, "toplam puan doğru biçimlenir");
    t.ok(md.indexOf("Patojenik (P)") > 0, "sınıflandırma yer alır");
    t.ok(md.indexOf("Riggs ER") > 0, "kaynak künyesi eklenir");
    t.ok(md.indexOf("tıbbi cihaz raporu değildir") > 0, "yasal uyarı her zaman eklenir");
    t.ok(md.indexOf("**[DURDUR]**") > 0, "engelleyici uyarı vurgulanır");
    t.ok(md.indexOf("**Sorgulanmamış kaynaklar:** DGV") > 0, "sorgulanmamış kaynak listelenir");
    t.ok(md.indexOf("Sınırlılık bir") > 0, "sınırlılıklar eklenir");

    /* Boş durum çökmemeli */
    var empty = C.toMarkdown({ fields: {}, scoring: { sc: {}, sel: {}, total: 0, classification: "VUS" } });
    t.ok(empty.length > 300, "boş olguda da geçerli belge üretilir");
    t.ok(empty.indexOf("_Bilgi girilmemiş._") > 0, "boş bölümler açıkça işaretlenir");
  });

  suite("Markdown tablo kaçışı", function (t) {
    /* Boru işareti içeren girdi tabloyu bozmamalı */
    var md = C.toMarkdown({
      fields: { ptId: "A|K", ptPheno: "satır1\nsatır2" },
      scoring: { sc: {}, sel: {}, total: 0, classification: "VUS" }
    });
    t.ok(md.indexOf("A\\|K") > 0, "boru işareti kaçışlanır");
    t.ok(md.indexOf("satır1 satır2") > 0, "tablo hücresindeki satır sonu boşluğa çevrilir");
  });
};
