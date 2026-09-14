/*!
 * cnv-case.js — Olgu durumunun toplanması, saklanması, dışa/içe aktarımı
 *               ve Markdown rapor üretimi.
 *
 * GİZLİLİK: Otomatik kaydetme VARSAYILAN OLARAK KAPALIDIR. Kullanıcı açıkça
 * açmadıkça hiçbir veri localStorage'a yazılmaz. Hiçbir veri ağa gönderilmez.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CNVCase = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var STORE_KEY = "cnv-case-draft";
  var STORE_FLAG = "cnv-autosave";
  var SCHEMA = "cnv-case/1";

  /* Olgu kartı ve serbest metin alanları */
  var FIELD_IDS = [
    "ptId", "ptAge", "ptSex", "ptReason", "ptPheno", "ptHpo",
    "ptTestType", "ptPlatform", "ptBuild", "ptParent",
    "ptCnvType", "ptCoord", "ptSize", "ptLabClass", "ptGenes",
    "ptCytoband", "ptCopyState", "ptISCN", "ptGeneCount", "ptTranscript", "ptReportCat",
    "ptMode", "ptOutput", "ptExplainLevel",
    "ptReportText", "ptReportNote", "ptFranklinOutput",
    "rcPhenoCorr", "rcNotes", "s4aCaseCount"
  ];

  /* Kanıt toplama çalışma sayfası satırları */
  var EVIDENCE_ROWS = [
    { id: "evGenes",     src: "UCSC / Ensembl",            ask: "Protein-kodlayan gen sayısı, sınırlar intragenik mi?", feeds: "Section 1, Section 3" },
    { id: "evClingen",   src: "ClinGen Dosage Map",        ask: "Bölge/gen HI veya TS skoru nedir? (0–3, 30, 40)",       feeds: "Section 2" },
    { id: "evDecipher",  src: "DECIPHER",                  ask: "Benzer sınırlı hasta kaydı ve fenotip örtüşmesi?",       feeds: "Section 4A" },
    { id: "evClinvar",   src: "ClinVar",                   ask: "Bildirilmiş kayıt, sınıf ve çelişki var mı?",            feeds: "Section 4A" },
    { id: "evGnomad",    src: "gnomAD-SV",                 ask: "Popülasyon frekansı nedir? >%1 mi?",                     feeds: "Section 4O" },
    { id: "evDgv",       src: "DGV",                       ask: "Kayıt var mı? Hangi çalışma/platform, kaç birey?",       feeds: "Section 4 (destekleyici)" },
    { id: "evOmim",      src: "OMIM / GeneReviews",        ask: "Gen-hastalık ilişkisi ve KALITIM MODELİ (OD/OR/XL)?",    feeds: "Klinik korelasyon" },
    { id: "evConstraint",src: "gnomAD kısıtlılık",         ask: "pLI / LOEUF / pHaplo / pTriplo değerleri?",              feeds: "Section 2H (destekleyici)" },
    { id: "evLit",       src: "PubMed / literatür",        ask: "Kaç uygun olgu? De novo mu? Fenotip özgüllüğü?",         feeds: "Section 4A olgu sayısı" },
    { id: "evParents",   src: "Ebeveyn çalışması",         ask: "De novo mu, kalıtılmış mı? Ebeveyn fenotipi?",           feeds: "Section 5" },
    { id: "evXcheck",    src: "ClinGen CNV Calculator",    ask: "Bağımsız hesaplayıcı hangi sınıfı verdi? Fark nerede?",  feeds: "Çapraz kontrol" }
  ];

  /* ── Durum toplama / uygulama ───────────────────────── */

  function collect(doc, scoring) {
    doc = doc || (typeof document !== "undefined" ? document : null);
    var fields = {};
    if (doc) {
      FIELD_IDS.forEach(function (id) {
        var el = doc.getElementById(id);
        if (el) fields[id] = el.value || "";
      });
      EVIDENCE_ROWS.forEach(function (r) {
        var el = doc.getElementById(r.id);
        if (el) fields[r.id] = el.value || "";
        var chk = doc.getElementById(r.id + "_done");
        if (chk) fields[r.id + "_done"] = !!chk.checked;
      });
    }
    return {
      schema: SCHEMA,
      savedAt: new Date().toISOString(),
      fields: fields,
      scoring: scoring || {}
    };
  }

  function apply(data, doc, onScoring) {
    if (!data || !data.fields) return { ok: false, msg: "Geçersiz olgu dosyası: 'fields' alanı yok." };
    if (data.schema && data.schema !== SCHEMA) {
      // İleri uyumluluk: bilinmeyen şema uyarı verir ama yine de denenir.
    }
    doc = doc || document;
    var applied = 0;
    Object.keys(data.fields).forEach(function (id) {
      var el = doc.getElementById(id);
      if (!el) return;
      var v = data.fields[id];
      if (el.type === "checkbox") el.checked = !!v;
      else el.value = v == null ? "" : String(v);
      applied++;
    });
    if (onScoring && data.scoring) onScoring(data.scoring);
    return { ok: true, applied: applied, msg: applied + " alan yüklendi." };
  }

  /* ── localStorage (opt-in) ──────────────────────────── */

  function autosaveEnabled() {
    try { return localStorage.getItem(STORE_FLAG) === "1"; } catch (e) { return false; }
  }

  function setAutosave(on) {
    try {
      if (on) localStorage.setItem(STORE_FLAG, "1");
      else { localStorage.removeItem(STORE_FLAG); localStorage.removeItem(STORE_KEY); }
      return true;
    } catch (e) { return false; }
  }

  function save(data) {
    if (!autosaveEnabled()) return false;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearStored() {
    try { localStorage.removeItem(STORE_KEY); return true; } catch (e) { return false; }
  }

  /* ── Markdown rapor ─────────────────────────────────── */

  function mdEscape(s) {
    return String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  }

  function kvTable(rows) {
    var out = ["| Alan | Değer |", "| --- | --- |"];
    rows.forEach(function (r) {
      if (r.v === undefined || r.v === null || r.v === "") return;
      out.push("| " + mdEscape(r.l) + " | " + mdEscape(r.v) + " |");
    });
    return out.length > 2 ? out.join("\n") : "_Bilgi girilmemiş._";
  }

  /**
   * @param {object} ctx {
   *   fields, scoring:{sc,sel,total,classification}, gates, limitations,
   *   evidence:[{src,ask,feeds,value,done}], links (opsiyonel)
   * }
   */
  function toMarkdown(ctx) {
    var f = ctx.fields || {};
    var sc = (ctx.scoring && ctx.scoring.sc) || {};
    var sel = (ctx.scoring && ctx.scoring.sel) || {};
    var tot = ctx.scoring ? ctx.scoring.total : 0;
    var cls = ctx.scoring ? ctx.scoring.classification : "";
    var fmt = function (v) { var n = Number(v) || 0; return (n >= 0 ? "+" : "") + n.toFixed(2); };
    var L = [];

    L.push("# CNV Değerlendirme Özeti");
    L.push("");
    L.push("> Bu belge ACMG/ClinGen (Riggs et al., 2020) çerçevesine dayalı **yapılandırılmış bir değerlendirme özetidir**. Valide edilmiş bir klinik karar sistemi çıktısı veya tıbbi cihaz raporu değildir. Uzman incelemesi ve kurumsal doğrulama gerektirir.");
    L.push("");
    L.push("**Oluşturma tarihi:** " + new Date().toLocaleString("tr-TR"));
    L.push("");

    L.push("## 1. Olgu");
    L.push(kvTable([
      { l: "Hasta ID / İnisyaller", v: f.ptId },
      { l: "Yaş", v: f.ptAge },
      { l: "Cinsiyet", v: f.ptSex },
      { l: "Başvuru nedeni", v: f.ptReason },
      { l: "Fenotip", v: f.ptPheno },
      { l: "HPO terimleri", v: f.ptHpo }
    ]));
    L.push("");

    L.push("## 2. Test ve teknik bilgi");
    L.push(kvTable([
      { l: "Test tipi", v: f.ptTestType },
      { l: "Platform", v: f.ptPlatform },
      { l: "Genome build", v: f.ptBuild },
      { l: "Ebeveyn testi", v: f.ptParent }
    ]));
    L.push("");

    L.push("## 3. CNV");
    L.push(kvTable([
      { l: "Tip", v: f.ptCnvType },
      { l: "Koordinat", v: f.ptCoord },
      { l: "Boyut", v: f.ptSize },
      { l: "Sitogenetik bant", v: f.ptCytoband },
      { l: "Kopya sayısı durumu", v: f.ptCopyState },
      { l: "ISCN notasyonu", v: f.ptISCN },
      { l: "Protein-kodlayan gen sayısı", v: f.ptGeneCount },
      { l: "Etkilenen genler", v: f.ptGenes },
      { l: "Transkript / ekzon", v: f.ptTranscript },
      { l: "Laboratuvar sınıfı", v: f.ptLabClass },
      { l: "Raporlama kategorisi", v: f.ptReportCat }
    ]));
    L.push("");

    if (ctx.evidence && ctx.evidence.length) {
      var used = ctx.evidence.filter(function (e) { return e.value || e.done; });
      if (used.length) {
        L.push("## 4. Kanıt toplama");
        L.push("");
        L.push("| Kaynak | Sorgulandı | Bulgu | Beslediği bölüm |");
        L.push("| --- | :-: | --- | --- |");
        used.forEach(function (e) {
          L.push("| " + mdEscape(e.src) + " | " + (e.done ? "✓" : "—") + " | " +
                 mdEscape(e.value || "—") + " | " + mdEscape(e.feeds) + " |");
        });
        L.push("");
        var notQueried = ctx.evidence.filter(function (e) { return !e.done; });
        if (notQueried.length) {
          L.push("**Sorgulanmamış kaynaklar:** " + notQueried.map(function (e) { return e.src; }).join(", ") + ".");
          L.push("");
        }
      }
    }

    L.push("## 5. ACMG/ClinGen puanlaması");
    L.push("");
    L.push("| Bölüm | Seçilen kriter | Puan |");
    L.push("| --- | --- | ---: |");
    [["Section 1 — Gen içeriği", "s1"], ["Section 2 — HI/TS örtüşmesi", "s2"],
     ["Section 3 — Gen sayısı", "s3"], ["Section 4A — Olgu kanıtı", "s4a"],
     ["Section 4 — Segregasyon", "s4seg"], ["Section 4 — Olgu-kontrol / popülasyon", "s4b"],
     ["Section 5 — Kalıtım", "s5"]].forEach(function (p) {
      L.push("| " + p[0] + " | " + mdEscape(sel[p[1]] || "—") + " | " + fmt(sc[p[1]]) + " |");
    });
    L.push("| **TOPLAM** | | **" + fmt(tot) + "** |");
    L.push("");
    L.push("**Sınıflandırma: " + (cls || "—") + "** (toplam skor " + fmt(tot) + ")");
    L.push("");

    if (ctx.gates && ctx.gates.length) {
      L.push("## 6. Kontrol uyarıları");
      L.push("");
      ctx.gates.forEach(function (g) {
        var icon = g.level === "block" ? "**[DURDUR]**" : g.level === "warn" ? "**[DİKKAT]**" : "[BİLGİ]";
        L.push("- " + icon + " **" + g.title + "** — " + g.text);
      });
      L.push("");
    }

    if (f.rcPhenoCorr) {
      L.push("## 7. Klinik korelasyon");
      L.push("");
      L.push(f.rcPhenoCorr);
      L.push("");
    }

    if (f.rcNotes) {
      L.push("## 8. Ek notlar");
      L.push("");
      L.push(f.rcNotes);
      L.push("");
    }

    if (ctx.limitations && ctx.limitations.length) {
      L.push("## 9. Sınırlılıklar");
      L.push("");
      ctx.limitations.forEach(function (t) { L.push("- " + t); });
      L.push("");
    }

    L.push("---");
    L.push("");
    L.push("*Referans: Riggs ER, Andersen EF, Cherry AM, et al. Technical standards for the interpretation and reporting of constitutional copy-number variants: a joint consensus recommendation of ACMG and ClinGen. Genet Med. 2020;22(2):245-257.*");
    L.push("");
    L.push("*Bu özet Klinik CNV Değerlendirme Modülü ile üretilmiştir. Otomatik üretilmiş metin, uzman doğrulaması olmadan klinik raporda kullanılmamalıdır.*");

    return L.join("\n");
  }

  return {
    SCHEMA: SCHEMA,
    FIELD_IDS: FIELD_IDS,
    EVIDENCE_ROWS: EVIDENCE_ROWS,
    collect: collect,
    apply: apply,
    autosaveEnabled: autosaveEnabled,
    setAutosave: setAutosave,
    save: save,
    load: load,
    clearStored: clearStored,
    toMarkdown: toMarkdown
  };
});
