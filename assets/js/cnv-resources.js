/*!
 * cnv-resources.js — CNV koordinatından dış kaynak derin linkleri + karar kapıları
 *
 * Saf modül. Hasta verisi hiçbir zaman ağ üzerinden gönderilmez; yalnızca
 * kullanıcının tıklayacağı URL'ler üretilir (tıklama kullanıcının kararıdır).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CNVResources = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ── Koordinat ayrıştırma ────────────────────────────── */

  /**
   * "chr7:72846244-74187855", "7:72,846,244-74,187,855", "chrX:1000-2000"
   * biçimlerini { chr, start, end, length } olarak döndürür.
   */
  function parseCoord(text) {
    if (!text) return null;
    var t = String(text).replace(/,/g, "").replace(/\s+/g, "");
    var m = t.match(/^(?:chr)?([0-9]{1,2}|X|Y|MT?)[:\-_](\d+)[-_.]+(\d+)$/i);
    if (!m) return null;
    var chr = m[1].toUpperCase();
    if (chr === "MT") chr = "M";
    var start = parseInt(m[2], 10);
    var end = parseInt(m[3], 10);
    if (!isFinite(start) || !isFinite(end)) return null;
    if (start > end) { var tmp = start; start = end; end = tmp; }
    if (chr !== "X" && chr !== "Y" && chr !== "M") {
      var n = parseInt(chr, 10);
      if (!(n >= 1 && n <= 22)) return null;
      chr = String(n);
    }
    return { chr: chr, start: start, end: end, length: end - start + 1 };
  }

  function formatSize(bp) {
    if (!isFinite(bp)) return "";
    if (bp >= 1e6) return (bp / 1e6).toFixed(2) + " Mb";
    if (bp >= 1e3) return Math.round(bp / 1e3) + " kb";
    return bp + " bp";
  }

  function ucscDb(build) {
    return build === "GRCh37" ? "hg19" : "hg38";
  }

  /* ── Dış kaynak derin linkleri ───────────────────────── */

  /**
   * @param {object} c  parseCoord çıktısı
   * @param {string} build "GRCh37" | "GRCh38"
   * @param {object} extra { genes: "SNRPN, UBE3A", cytoband: "15q11.2" }
   * @returns {Array} kategorilenmiş kaynak grupları
   */
  function buildLinks(c, build, extra) {
    extra = extra || {};
    var db = ucscDb(build);
    var region = "chr" + c.chr + ":" + c.start + "-" + c.end;
    var pad = Math.max(Math.round(c.length * 0.25), 10000);
    var wide = "chr" + c.chr + ":" + Math.max(1, c.start - pad) + "-" + (c.end + pad);
    var firstGene = (extra.genes || "").split(/[,;]/)[0].trim();

    var groups = [];

    groups.push({
      id: "browser",
      title: "Genom tarayıcı — gen içeriği",
      why: "Kaç protein-kodlayan gen var, sınırlar intragenik mi, düzenleyici element / segmental duplikasyon var mı?",
      links: [
        { name: "UCSC Genome Browser", url: "https://genome.ucsc.edu/cgi-bin/hgTracks?db=" + db + "&position=" + encodeURIComponent(wide), note: "±%25 pay ile açılır; RefSeq + SegDup + DGV track'lerini açın" },
        { name: "Ensembl Region in Detail", url: "https://" + (build === "GRCh37" ? "grch37." : "") + "ensembl.org/Homo_sapiens/Location/View?r=" + encodeURIComponent(c.chr + ":" + c.start + "-" + c.end), note: "MANE Select transkriptleri için" },
        { name: "NCBI Genome Data Viewer", url: "https://www.ncbi.nlm.nih.gov/gdv/browser/genome/?id=" + (build === "GRCh37" ? "GCF_000001405.25" : "GCF_000001405.40") + "&chr=" + c.chr + "&from=" + c.start + "&to=" + c.end, note: "RefSeq gen sayımı" }
      ]
    });

    groups.push({
      id: "dosage",
      title: "Dozaj duyarlılığı — Section 2'nin dayanağı",
      why: "Bölge veya gen kurulmuş HI/TS listesinde mi? ClinGen skoru 3 ise Section 2A/2A_d doğrudan uygulanır.",
      links: [
        { name: "ClinGen — bölge ve gen sorgusu (koordinat)", url: "https://search.clinicalgenome.org/kb/regions?page=1&type=" + (build === "GRCh37" ? "GRCh37" : "GRCh38") + "&region=" + encodeURIComponent(region) + "&size=100&search=", note: "Bölgeyle örtüşen tüm genleri VE kürasyon edilmiş \"recurrent region\" kayıtlarını (HI/TS skorlarıyla) birlikte listeler" },
        { name: firstGene ? "ClinGen — " + firstGene + " gen sayfası" : "ClinGen Dosage Sensitivity Map", url: firstGene ? "https://search.clinicalgenome.org/kb/genes/" + encodeURIComponent(firstGene) : "https://search.clinicalgenome.org/kb/gene-dosage", note: "HI skoru 3 = yeterli kanıt; 30 = otozomal resesif; 40 = dozaj duyarsız" },
        { name: "DECIPHER — bölge görünümü", url: "https://www.deciphergenomics.org/browser#q/" + encodeURIComponent((build === "GRCh37" ? "GRCh37:" : "") + c.chr + ":" + c.start + "-" + c.end), note: "Genomic disorders track'i ve hasta kayıtları" }
      ]
    });

    groups.push({
      id: "population",
      title: "Popülasyon frekansı — benign kanıtı (Section 4O)",
      why: ">%1 sıklık −1.00 puan getirir. DGV kaydını körü körüne benign saymayın: çalışma, platform ve örneklem seçimine bakın.",
      links: [
        { name: "gnomAD-SV", url: "https://gnomad.broadinstitute.org/region/" + c.chr + "-" + c.start + "-" + c.end + "?dataset=" + (build === "GRCh37" ? "gnomad_sv_r2_1" : "gnomad_sv_r4"), note: "En güvenilir popülasyon SV kaynağı" },
        { name: "DGV (Database of Genomic Variants)", url: "http://dgv.tcag.ca/gb2/gbrowse/dgv2_" + (build === "GRCh37" ? "hg19" : "hg38") + "/?name=" + encodeURIComponent(region), note: "DİKKAT: bazı kayıtlar klinik seçilmiş örneklerden ve eski düşük çözünürlüklü platformlardan gelir" },
        { name: "1000 Genomes / Ensembl SV", url: "https://" + (build === "GRCh37" ? "grch37." : "") + "ensembl.org/Homo_sapiens/Location/Genome?r=" + encodeURIComponent(c.chr + ":" + c.start + "-" + c.end), note: "Yapısal varyant track'i" }
      ]
    });

    groups.push({
      id: "clinical",
      title: "Hasta kayıtları ve literatür — Section 4A",
      why: "Fenotipi uyan, tercihen de novo, yayınlanmış olgular aranır. Olgu sayısı Section 4A puanını çarpar.",
      links: [
        { name: "ClinVar — bölge sorgusu", url: "https://www.ncbi.nlm.nih.gov/clinvar/?term=" + encodeURIComponent(c.chr + "[chr] AND " + c.start + ":" + c.end + "[chrpos" + (build === "GRCh37" ? "37" : "38") + "]"), note: "Sunan laboratuvar ve çelişkili yorumlara bakın" },
        { name: "DECIPHER — hasta kayıtları", url: "https://www.deciphergenomics.org/search/patients/results?q=" + encodeURIComponent(c.chr + ":" + c.start + "-" + c.end), note: "Fenotip örtüşmesini HPO düzeyinde karşılaştırın" },
        { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent((firstGene ? firstGene + " " : "") + (extra.cytoband ? extra.cytoband + " " : "") + "(deletion OR duplication OR copy number)"), note: "Olgu serileri ve de novo bildirimleri" }
      ]
    });

    groups.push({
      id: "gene",
      title: "Gen ve hastalık ilişkisi",
      why: "Kalıtım modeli kritik: otozomal resesif bir genin tek kopya kaybı taşıyıcılıktır, patojenik bulgu değil.",
      links: [
        { name: "OMIM", url: "https://www.omim.org/search?index=entry&search=" + encodeURIComponent(firstGene || (extra.cytoband || "")), note: "Morbid Map ve kalıtım modeli" },
        { name: "gnomAD gen kısıtlılığı (pLI / LOEUF)", url: firstGene ? "https://gnomad.broadinstitute.org/gene/" + encodeURIComponent(firstGene) + "?dataset=" + (build === "GRCh37" ? "gnomad_r2_1" : "gnomad_r4") : "https://gnomad.broadinstitute.org/", note: "LoF intoleransı — destekleyici kanıt, tek başına sınıflandırmaz" },
        { name: "GeneReviews", url: "https://www.ncbi.nlm.nih.gov/books/NBK1116/?term=" + encodeURIComponent(firstGene || ""), note: "Fenotip tanımı ve izlem önerileri" },
        { name: "Orphanet", url: "https://www.orpha.net/en/disease", note: "Nadir hastalık tanımı — Orphanet'in arama kutusu koordinat/parametre ile derin bağlantıyı desteklemiyor; " + (firstGene ? firstGene : "gen/hastalık adını") + " sayfada elle arayın" },
        { name: "PanelApp (Genomics England)", url: "https://panelapp.genomicsengland.co.uk/panels/entities/" + encodeURIComponent(firstGene || ""), note: "Gen-hastalık kanıt düzeyi" }
      ]
    });

    groups.push({
      id: "calculator",
      title: "Bağımsız çapraz kontrol",
      why: "Sınıflandırmanızı bağımsız bir uygulayıcıyla karşılaştırın. Fark varsa genellikle Section 2 veya 4'teki kanıt yorumundadır.",
      links: [
        { name: "ClinGen CNV Calculator", url: "https://cnvcalc.clinicalgenome.org/cnvcalc/", note: "Riggs 2020'nin resmî uygulayıcısı — referans karşılaştırma" },
        { name: "Franklin (Genoox)", url: "https://franklin.genoox.com/clinical-db/home", note: "Olgu kartındaki yardımcı formatı yapıştırın" },
        { name: "UCSC LiftOver", url: "https://genome.ucsc.edu/cgi-bin/hgLiftOver", note: "Build dönüşümü — koordinatı elle çevirmeyin" }
      ]
    });

    return groups;
  }

  /* ── Özel dikkat gerektiren bölgeler ──────────────────
     Sınırlar YAKLAŞIKTIR ve yalnızca "bu bölgeye bakmayı hatırlat"
     amacı taşır. Kesin sınır için ClinGen Dosage Map kullanılmalıdır.
     ───────────────────────────────────────────────────── */
  var SPECIAL_REGIONS = [
    { name: "15q11.2-q13 (PWS/AS kritik bölge)", kind: "imprint",
      GRCh37: { chr: "15", start: 22700000, end: 28450000 },
      GRCh38: { chr: "15", start: 22700000, end: 28200000 },
      note: "İmprinted bölge. Köken ebeveyn belirleyicidir; delesyonun anneden mi babadan mı geldiği fenotipi değiştirir. Metilasyon analizi ve ebeveyn çalışması gerekir. (Sınır ClinGen Dosage Map \"15q11.2q13 recurrent (PWS/AS) region, Class I, BP1-BP3\" kürasyonundan doğrulanmıştır.)" },
    { name: "11p15.5 (BWS / Silver-Russell)", kind: "imprint",
      GRCh37: { chr: "11", start: 1900000, end: 2900000 },
      GRCh38: { chr: "11", start: 1880000, end: 2880000 },
      note: "İmprinted bölge (IC1/IC2). Metilasyon analizi olmadan yorumlanmamalıdır. (ClinGen Dosage Map'te bu lokus için tek bir kürasyon edilmiş \"recurrent region\" kaydı yoktur — mekanizma çoğunlukla metilasyon/UPD kaynaklıdır, basit CNV dozaj kuralı geçerli değildir; sınır H19-KCNQ1OT1 gen kümesine göre yaklaşıktır.)" },
    { name: "14q32.2 (Temple / Kagami-Ogata)", kind: "imprint",
      GRCh37: { chr: "14", start: 100350000, end: 101550000 },
      GRCh38: { chr: "14", start: 99880000, end: 101100000 },
      note: "İmprinted DLK1/MEG3 bölgesi. Köken ebeveyn tayini gerekir. (Sınır ClinGen Dosage Map \"14q32 region associated with UPD(14) phenotypes\" kürasyonundan doğrulanmıştır.)" },
    { name: "6q24 (geçici neonatal diabetes)", kind: "imprint",
      GRCh37: { chr: "6", start: 144000000, end: 144450000 },
      GRCh38: { chr: "6", start: 143680000, end: 144130000 },
      note: "İmprinted PLAGL1/HYMAI bölgesi. (Sınır ClinGen Dosage Map \"6q24 region (includes PLAGL1)\" kürasyonundan doğrulanmıştır.)" },
    { name: "20q13.32 (GNAS)", kind: "imprint",
      GRCh37: { chr: "20", start: 57400000, end: 57520000 },
      GRCh38: { chr: "20", start: 58810000, end: 58930000 },
      note: "İmprinted GNAS lokusu; psödohipoparatiroidizm ayrımı köken ebeveyne bağlıdır. (ClinGen Dosage Map'te ayrı bir \"recurrent region\" kaydı yoktur; sınır GNAS gen koordinatlarını güvenle kapsayacak şekilde doğrulanmıştır.)" },

    { name: "1q21.1 distal (del/dup)", kind: "penetrance",
      GRCh37: { chr: "1", start: 146500000, end: 147900000 },
      GRCh38: { chr: "1", start: 146000000, end: 148000000 },
      note: "Azalmış penetrans / değişken ekspresyon. Etkilenmemiş ebeveynden kalıtılmış olması benign yapmaz. (Sınır ClinGen \"1q21.1 recurrent region, distal, BP3-BP4, includes GJA5\" kürasyonundan doğrulanmıştır.)" },
    { name: "15q11.2 BP1-BP2 (NIPA1)", kind: "penetrance",
      GRCh37: { chr: "15", start: 22800000, end: 23100000 },
      GRCh38: { chr: "15", start: 22550000, end: 23100000 },
      note: "Düşük penetranslı yatkınlık lokusu. ClinGen bu bölgeyi tek başına tanısal saymaz. (Sınır ClinGen \"15q11.2 recurrent region, BP1-BP2, includes NIPA1\" kürasyonundan doğrulanmıştır.)" },
    { name: "15q13.3 BP4-BP5 (CHRNA7)", kind: "penetrance",
      GRCh37: { chr: "15", start: 30900000, end: 32500000 },
      GRCh38: { chr: "15", start: 30600000, end: 32200000 },
      note: "Azalmış penetrans; sıklıkla etkilenmemiş ebeveynden kalıtılır. (Sınır ClinGen \"15q13.3 recurrent region, BP3-BP5, includes CHRNA7\" kürasyonundan doğrulanmıştır.)" },
    { name: "16p11.2 proksimal (~593 kb)", kind: "penetrance",
      GRCh37: { chr: "16", start: 29600000, end: 30250000 },
      GRCh38: { chr: "16", start: 29590000, end: 30250000 },
      note: "Değişken ekspresyon; OSB/gelişme geriliği yatkınlığı. Kalıtılmış olması dışlayıcı değildir. (Sınır ClinGen \"16p11.2 recurrent region, proximal, BP4-BP5, includes TBX6\" kürasyonundan doğrulanmıştır.)" },
    { name: "16p11.2 distal (~220 kb, SH2B1)", kind: "penetrance",
      GRCh37: { chr: "16", start: 28800000, end: 29100000 },
      GRCh38: { chr: "16", start: 28790000, end: 29090000 },
      note: "Obezite ve gelişimsel yatkınlık; azalmış penetrans. (Sınır ClinGen \"16p11.2 recurrent region, distal, BP1-BP3/BP2-BP3/BP1-BP4, includes SH2B1\" kürasyonundan doğrulanmıştır.)" },
    { name: "16p12.2 (eski adıyla 16p12.1)", kind: "penetrance",
      GRCh37: { chr: "16", start: 21900000, end: 22450000 },
      GRCh38: { chr: "16", start: 21890000, end: 22440000 },
      note: "İkinci vuruş (two-hit) modeli; tek başına tanısal değildir. ClinGen bu bölgeyi güncel kürasyonunda 16p12.2 (proximal, includes EEF2K/CDR2) olarak adlandırır; eski literatürde \"16p12.1\" adı da geçer. (Sınır ClinGen kürasyonundan doğrulanmıştır.)" },
    { name: "16p13.11", kind: "penetrance",
      GRCh37: { chr: "16", start: 15400000, end: 16300000 },
      GRCh38: { chr: "16", start: 15300000, end: 16200000 },
      note: "Düşük penetranslı yatkınlık lokusu. (Sınır ClinGen \"16p13.11 recurrent region, includes MYH11\" kürasyonundan doğrulanmıştır.)" },
    { name: "17q12 (HNF1B)", kind: "penetrance",
      GRCh37: { chr: "17", start: 34800000, end: 36300000 },
      GRCh38: { chr: "17", start: 36450000, end: 37950000 },
      note: "Renal kistik hastalık / MODY5; değişken ekspresyon, kalıtılmış olabilir. (Sınır ClinGen \"17q12 recurrent (RCAD syndrome) region, includes HNF1B\" kürasyonundan doğrulanmıştır.)" },
    { name: "22q11.2 distal (LCR D-E/F)", kind: "penetrance",
      GRCh37: { chr: "22", start: 21850000, end: 23050000 },
      GRCh38: { chr: "22", start: 21450000, end: 22700000 },
      note: "Distal delesyon; klasik 22q11.2DS'den farklı, değişken fenotip. (Sınır ClinGen \"22q11.2 recurrent region, distal type I, D-E/D-F\" kürasyonundan doğrulanmıştır — önceki sürümdeki koordinat yanlışlıkla santral (B-D/C-D) bölgeyle örtüşüyordu, düzeltildi.)" },
    { name: "2q13", kind: "penetrance",
      GRCh37: { chr: "2", start: 110800000, end: 113200000 },
      GRCh38: { chr: "2", start: 110000000, end: 112500000 },
      note: "Düşük penetranslı yatkınlık lokusu. ClinGen bu lokusu proksimal (NPHP1) ve distal (BCL2L11) olmak üzere iki ayrı bölge olarak kürasyon eder; bu giriş ikisini birlikte kapsayacak şekilde genişletilmiştir. (Sınır ClinGen kürasyonundan doğrulanmıştır — önceki sürümde proksimal alt bölge tamamen kaçırılıyordu.)" }
  ];

  function overlaps(a, b) {
    return a.chr === b.chr && a.start <= b.end && a.end >= b.start;
  }

  /** CNV'nin özel dikkat bölgeleriyle örtüşmesini döndürür. */
  function specialRegionHits(c, build) {
    if (!c) return [];
    var key = build === "GRCh37" ? "GRCh37" : "GRCh38";
    return SPECIAL_REGIONS.filter(function (r) {
      return r[key] && overlaps(c, r[key]);
    }).map(function (r) {
      return { name: r.name, kind: r.kind, note: r.note, region: r[key] };
    });
  }

  /* ── Karar kapıları / uyarılar ───────────────────────── */

  /**
   * @param {object} st  { build, coord, iscn, testType, cnvType, copyState,
   *                       genes, geneCount, parentTest, pheno, hpo, size }
   * @returns {Array} { level: 'block'|'warn'|'info', title, text }
   */
  function gates(st) {
    st = st || {};
    var out = [];
    var c = parseCoord(st.coord);

    /* 1. Build */
    if (!st.build) {
      out.push({ level: "block", title: "Genome build seçilmemiş",
        text: "Build bilinmeden koordinat sorgulanamaz. GRCh37 koordinatını GRCh38 gibi sorgulamak gen içeriğini tamamen değiştirir ve yanlış sınıflamaya yol açar. Raporda build'i doğrulayın." });
    }
    if (st.iscn && st.build) {
      var m = String(st.iscn).match(/\b(GRCh37|GRCh38|hg19|hg38)\b/i);
      if (m) {
        var fromIscn = /hg19|grch37/i.test(m[1]) ? "GRCh37" : "GRCh38";
        if (fromIscn !== st.build) {
          out.push({ level: "block", title: "Build çelişkisi",
            text: "ISCN notasyonu " + fromIscn + " diyor, seçili build " + st.build + ". Birini düzeltmeden devam etmeyin." });
        }
      }
    }

    /* 2. Koordinat */
    if (st.coord && !c) {
      out.push({ level: "warn", title: "Koordinat okunamadı",
        text: "Beklenen biçim: chr15:22646694-23086471. Dış kaynak linkleri ve bölge kontrolleri bu alan düzelene kadar üretilemez." });
    }

    /* 3. Platform kısıtı */
    if (st.testType === "aCGH") {
      out.push({ level: "info", title: "aCGH platform kısıtı",
        text: "aCGH'de BAF verisi yoktur: ROH, CN-LOH, UPD ve düşük düzey mozaiklik bu platformla değerlendirilemez. Bu cümle raporun limitasyonlar bölümüne girmelidir." });
    }
    if ((st.cnvType === "roh" || st.cnvType === "cnloh") && st.testType === "aCGH") {
      out.push({ level: "block", title: "Platform ile bulgu uyumsuz",
        text: "ROH / CN-LOH bulgusu aCGH ile raporlanamaz — bu bulgu SNP-array gerektirir. Platform bilgisini doğrulayın." });
    }
    if (st.cnvType === "roh" || st.cnvType === "cnloh") {
      out.push({ level: "info", title: "ROH / CN-LOH — Riggs kapsamı dışında",
        text: "Riggs 2020 puanlaması kopya sayısı değişimleri içindir. ROH/CN-LOH için UPD (imprinting) ve resesif hastalık homozigotluğu ayrı değerlendirilir; konsanguinite ve tek kromozomda izole ROH ayrımı yapılmalıdır." });
    }

    /* 4. Mozaiklik */
    if (/[Mm]ozaik/.test(st.copyState || "")) {
      out.push({ level: "warn", title: "Mozaiklik",
        text: "Mozaik CNV'de log2 oranı beklenen değerden sapar. Mozaiklik oranı, doku spesifikliği ve doğrulama yöntemi (FISH/ddPCR) rapora yazılmalıdır. Riggs puanlaması mozaik yük için ayrı bir düzeltme tanımlamaz." });
    }

    /* 5. Kalıtım */
    if (!st.parentTest || st.parentTest === "Bilgi yok" || st.parentTest === "Ebeveyn testi yapılmadı") {
      out.push({ level: "warn", title: "Ebeveyn testi yok",
        text: "Section 5 puanı çoğu olguda sınıfı belirleyen adımdır. Ebeveyn çalışması yapılmadan VUS'tan çıkmak genellikle mümkün olmaz; ebeveyn testi önerisi rapora yazılmalıdır." });
    }

    /* 6. Fenotip */
    if (!st.pheno && !st.hpo) {
      out.push({ level: "warn", title: "Fenotip girilmemiş",
        text: "Section 4 ve 5'teki 'fenotip uyumlu / özgül' kriterleri fenotip tanımı olmadan uygulanamaz. HPO terimleriyle kodlamak literatür ve DECIPHER karşılaştırmasını objektifleştirir." });
    }

    /* 7. Özel bölgeler */
    if (c && st.build) {
      specialRegionHits(c, st.build).forEach(function (h) {
        out.push({
          level: h.kind === "imprint" ? "block" : "warn",
          title: (h.kind === "imprint" ? "İmprinted bölge: " : "Azalmış penetrans bölgesi: ") + h.name,
          text: h.note + " (Sınır yaklaşıktır — ClinGen Dosage Map ile doğrulayın.)"
        });
      });
    }

    /* 8. Gen sayısı / Section 3 tutarlılığı */
    if (st.geneCount !== undefined && st.geneCount !== "" && c) {
      var gc = parseInt(st.geneCount, 10);
      if (isFinite(gc) && gc > 0 && c.length < 100000 && gc > 10) {
        out.push({ level: "warn", title: "Gen sayısı / boyut tutarsız görünüyor",
          text: "CNV " + formatSize(c.length) + " ama " + gc + " protein-kodlayan gen girilmiş. Sayımın pseudogen/lncRNA içerip içermediğini kontrol edin — Section 3 yalnızca protein-kodlayan genleri sayar." });
      }
    }

    /* 9. Boyut */
    if (c && c.length < 10000) {
      out.push({ level: "info", title: "Çok küçük CNV",
        text: formatSize(c.length) + " — prob/marker sayısı ve QC'yi kontrol edin. Array çözünürlüğünün altındaki çağrılar doğrulama gerektirir (MLPA, qPCR, ddPCR)." });
    }

    return out;
  }

  /* ── Otomatik limitasyon metni ───────────────────────── */
  function limitationsText(st) {
    st = st || {};
    var L = [];
    L.push("Bu değerlendirme " + (st.testType || "belirtilmemiş platform") +
      (st.platform ? " (" + st.platform + ")" : "") + " ile elde edilen sonuç üzerinden, " +
      (st.build || "belirtilmemiş build") + " koordinatlarına göre yapılmıştır.");
    if (st.testType === "aCGH") {
      L.push("aCGH platformunda B-allel frekansı verisi bulunmadığından kopya sayısı nötr kayıp heterozigotluk (CN-LOH), uniparental dizomi ve düşük düzey mozaiklik değerlendirilememiştir.");
    } else if (st.testType === "SNP-array") {
      L.push("SNP-array ile ROH/CN-LOH değerlendirilebilmekle birlikte, uniparental dizomi kesin tanısı metilasyon ve/veya ebeveyn çalışması gerektirir.");
    }
    L.push("Kromozomal mikroarray dengeli yeniden düzenlenmeleri (resiprokal translokasyon, inversiyon), tek nükleotid varyantlarını, küçük insersiyon/delesyonları, tekrar genişlemelerini ve platform çözünürlüğünün altındaki kopya sayısı değişimlerini saptayamaz.");
    L.push("Düşük düzey mozaiklik platform ve yöntem sınırları içinde gözden kaçabilir.");
    if (!st.parentTest || st.parentTest === "Bilgi yok" || st.parentTest === "Ebeveyn testi yapılmadı") {
      L.push("Ebeveyn çalışması yapılmadığından varyantın de novo olup olmadığı belirlenememiştir; bu durum sınıflandırmanın güvenini sınırlar ve tekrarlama riski danışmanlığını etkiler.");
    }
    L.push("Sınıflandırma ACMG/ClinGen (Riggs et al., 2020) çerçevesine göre, değerlendirme tarihindeki veritabanı ve literatür bilgisiyle yapılmıştır. Yeni kanıtlar biriktikçe sınıf değişebilir; belirsiz anlamlı varyantlar için 12–24 ay sonra yeniden değerlendirme önerilir.");
    return L;
  }

  return {
    parseCoord: parseCoord,
    formatSize: formatSize,
    ucscDb: ucscDb,
    buildLinks: buildLinks,
    SPECIAL_REGIONS: SPECIAL_REGIONS,
    specialRegionHits: specialRegionHits,
    gates: gates,
    limitationsText: limitationsText
  };
});
