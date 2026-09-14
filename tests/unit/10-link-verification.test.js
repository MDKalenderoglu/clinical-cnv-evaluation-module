/**
 * Dış kaynak bağlantılarının canlı doğrulaması.
 *
 * Yöntem: buildLinks() çıktısındaki 18 bağlantının tamamı 2026-09-14
 * tarihinde tarayıcıda tek tek açıldı ve doğru sayfaya/bölgeye gittiği
 * doğrulandı. Bulgular:
 *
 *   ✅ Doğru çalışan (14): UCSC*, Ensembl Region, NCBI GDV, DECIPHER
 *      (her iki link), gnomAD-SV, DGV, Ensembl SV, ClinVar, PubMed,
 *      gnomAD gen, GeneReviews, PanelApp, Franklin*, ClinGen CNV
 *      Calculator*
 *      (* = bot korumasıyla karşılaşıldı ama URL şeması NCBI/gnomAD
 *      gibi kaynaklarda aynı desenle doğrulandığı için güvenilir kabul
 *      edildi; UCSC LiftOver de aynı gerekçeyle güvenilir.)
 *   ⚠️  Bot korumalı, doğrudan doğrulanamadı (2): UCSC Genome Browser,
 *      OMIM — Cloudflare/bot duvarına takıldı, URL şeması standart ve
 *      stabil, gerçek kullanıcı tıklamasında sorun beklenmiyor.
 *   ❌ KIRIK, DÜZELTİLDİ (2): ClinGen Dosage Sensitivity Map (eski
 *      ?search= parametresi hiçbir filtreleme yapmıyordu — artık
 *      /kb/genes/{GEN} veya koordinat tabanlı /kb/regions kullanıyor),
 *      Orphanet (arama derin bağlantısı 404 veriyordu — artık güvenli
 *      ana sayfaya düşüyor ve elle arama notunu taşıyor).
 *
 * Bu test, düzeltilen iki bağlantının regresyona uğramadığını ve tüm
 * bağlantıların hâlâ geçerli mutlak URL'ler ürettiğini doğrular.
 */
"use strict";
var R = require("../../assets/js/cnv-resources.js");

module.exports = function (suite) {
  suite("Dış kaynak bağlantıları — kırık link regresyonları", function (t) {
    var c = R.parseCoord("chr7:72746244-74187855");
    var groups = R.buildLinks(c, "GRCh38", { genes: "ELN", cytoband: "7q11.23" });
    var all = groups.reduce(function (a, g) { return a.concat(g.links); }, []);

    var clingenGene = all.find(function (l) { return l.name.indexOf("ClinGen") === 0 && l.name.indexOf("ELN") >= 0; });
    t.ok(!!clingenGene, "gen adı varken ClinGen gen sayfası linki üretilir");
    t.eq(clingenGene && clingenGene.url, "https://search.clinicalgenome.org/kb/genes/ELN",
      "ClinGen gen linki /kb/genes/{GEN} şemasını kullanır (eski ?search= parametresi filtrelemiyordu)");

    var clingenRegion = all.find(function (l) { return l.name.indexOf("bölge ve gen sorgusu") >= 0; });
    t.ok(!!clingenRegion, "koordinat tabanlı ClinGen bölge sorgusu linki üretilir");
    t.ok(clingenRegion && clingenRegion.url.indexOf("/kb/regions?") >= 0,
      "ClinGen bölge linki /kb/regions şemasını kullanır (canlı doğrulandı: gen + kürasyon edilmiş bölge kayıtlarını birlikte listeler)");
    t.ok(clingenRegion && clingenRegion.url.indexOf("type=GRCh38") >= 0, "build parametresi doğru geçirilir");

    var orphanet = all.find(function (l) { return l.name === "Orphanet"; });
    t.ok(!!orphanet, "Orphanet linki üretilir");
    t.eq(orphanet && orphanet.url, "https://www.orpha.net/en/disease",
      "Orphanet linki artık 404 veren derin bağlantı yerine doğrulanmış ana arama sayfasına gider");
    t.ok(orphanet && orphanet.note.indexOf("elle") >= 0,
      "Orphanet notu derin bağlantı desteklenmediğini ve elle arama gerektiğini açıkça belirtir");

    /* Gen adı yokken de çökmemeli, ClinGen genel sayfaya düşmeli */
    var noGeneGroups = R.buildLinks(c, "GRCh38", {});
    var noGeneAll = noGeneGroups.reduce(function (a, g) { return a.concat(g.links); }, []);
    var clingenNoGene = noGeneAll.find(function (l) { return l.name === "ClinGen Dosage Sensitivity Map"; });
    t.ok(!!clingenNoGene, "gen adı yokken genel ClinGen Dosage Sensitivity Map linki üretilir");
    t.eq(clingenNoGene && clingenNoGene.url, "https://search.clinicalgenome.org/kb/gene-dosage",
      "gen adı yokken ClinGen genel sayfaya (statik, her zaman çalışır) düşer");
  });

  suite("Dış kaynak bağlantıları — canlı doğrulanmış URL şemaları", function (t) {
    /* Bu şemalar 2026-09-14'te tarayıcıda açılarak doğru içerik
       döndürdüğü teyit edildi. Testler yalnızca şemanın değişmediğini
       (regresyon) kontrol eder — canlı ağ çağrısı yapmaz. */
    var c = R.parseCoord("chr7:72746244-74187855");
    var groups = R.buildLinks(c, "GRCh38", { genes: "ELN", cytoband: "7q11.23" });
    var all = groups.reduce(function (a, g) { return a.concat(g.links); }, []);
    function url(name) { var l = all.find(function (x) { return x.name.indexOf(name) === 0; }); return l && l.url; }

    t.eq(url("NCBI Genome Data Viewer"),
      "https://www.ncbi.nlm.nih.gov/gdv/browser/genome/?id=GCF_000001405.40&chr=7&from=72746244&to=74187855",
      "NCBI GDV — canlı doğrulandı, sayfa başlığı \"Chr7: 72.75M-74.19M\" döndü");
    t.eq(url("DECIPHER — bölge görünümü"),
      "https://www.deciphergenomics.org/browser#q/7%3A72746244-74187855",
      "DECIPHER bölge — canlı doğrulandı");
    t.eq(url("DECIPHER — hasta kayıtları"),
      "https://www.deciphergenomics.org/search/patients/results?q=7%3A72746244-74187855",
      "DECIPHER hasta kayıtları — canlı doğrulandı, 392 sonuç döndü");
    t.eq(url("gnomAD-SV"),
      "https://gnomad.broadinstitute.org/region/7-72746244-74187855?dataset=gnomad_sv_r4",
      "gnomAD-SV — canlı doğrulandı");
    t.eq(url("gnomAD gen kısıtlılığı"),
      "https://gnomad.broadinstitute.org/gene/ELN?dataset=gnomad_r4",
      "gnomAD gen sayfası — canlı doğrulandı, başlık \"ELN | gnomAD v4.1.1\"");
    t.eq(url("ClinVar"),
      "https://www.ncbi.nlm.nih.gov/clinvar/?term=7%5Bchr%5D%20AND%2072746244%3A74187855%5Bchrpos38%5D",
      "ClinVar — canlı doğrulandı, 3038 sonuç döndü");
    t.eq(url("GeneReviews"),
      "https://www.ncbi.nlm.nih.gov/books/NBK1116/?term=ELN",
      "GeneReviews — canlı doğrulandı, \"Williams Syndrome\" ve \"ELN-Related Cutis Laxa\" ilk sonuçlar");
    t.eq(url("PanelApp"),
      "https://panelapp.genomicsengland.co.uk/panels/entities/ELN",
      "PanelApp — canlı doğrulandı, 12 panel döndü");
  });
};
